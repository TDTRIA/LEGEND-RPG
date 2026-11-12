/**
 * One-time archival cleanup.
 *
 * Every non-main branch is first preserved as a lightweight Git tag under
 * archive/branch-cleanup-2026-11-12/<original-branch-name>. Only after GitHub
 * confirms the tag points to the exact branch-tip SHA is the branch ref deleted.
 * The default branch, protected branches, and branches with open PRs are skipped.
 */
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.DRY_RUN === "true";
const archivePrefix = "archive/branch-cleanup-2026-11-12";

if (!token || !repository || !repository.includes("/")) {
  throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required.");
}

const apiRoot = `https://api.github.com/repos/${repository}`;
const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

async function request(path, options = {}) {
  const method = options.method || "GET";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`${apiRoot}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });

    if (method === "DELETE" && (response.status === 204 || response.status === 404)) {
      return null;
    }

    if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 4) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 15000)
        : Math.min(1000 * (2 ** attempt), 8000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`${method} ${path} failed (${response.status}): ${body}`);
    }
    return body ? JSON.parse(body) : null;
  }
  throw new Error(`${method} ${path} failed after transient-error retries.`);
}

async function allPages(resource) {
  const records = [];
  for (let page = 1; page <= 100; page += 1) {
    const separator = resource.includes("?") ? "&" : "?";
    const batch = await request(`${resource}${separator}per_page=100&page=${page}`);
    if (!Array.isArray(batch)) {
      throw new Error(`Expected an array from ${resource}, page ${page}.`);
    }
    records.push(...batch);
    if (batch.length < 100) return records;
  }
  throw new Error(`Pagination safety limit reached for ${resource}.`);
}

function encodeRef(ref) {
  return ref.split("/").map(encodeURIComponent).join("/");
}

async function ensureArchiveTag(tagName, commitSha) {
  const ref = `refs/tags/${tagName}`;
  try {
    const created = await request("/git/refs", {
      method: "POST",
      body: JSON.stringify({ ref, sha: commitSha }),
    });
    if (created?.object?.sha !== commitSha) {
      throw new Error(`GitHub did not confirm the expected SHA for tag ${tagName}.`);
    }
    return;
  } catch (createError) {
    // Makes reruns safe: an existing tag is accepted only if it preserves
    // exactly the same commit as the branch we are archiving.
    try {
      const existing = await request(`/git/ref/tags/${encodeRef(tagName)}`);
      if (existing?.object?.sha === commitSha) return;
      throw new Error(`Archive tag ${tagName} exists at a different commit.`);
    } catch (verifyError) {
      if (String(verifyError).includes("different commit")) throw verifyError;
      throw createError;
    }
  }
}

const repo = await request("");
const defaultBranch = repo.default_branch;
if (defaultBranch !== "main") {
  throw new Error(`Safety stop: expected default branch main, found ${defaultBranch}.`);
}

const [branches, openPullRequests] = await Promise.all([
  allPages("/branches"),
  allPages("/pulls?state=open"),
]);

const openHeadRefs = new Set(
  openPullRequests
    .filter((pr) => pr.head?.repo?.full_name === repository && pr.head?.ref)
    .map((pr) => pr.head.ref),
);

const candidates = branches.filter((branch) =>
  branch.name !== "main" &&
  branch.name !== defaultBranch &&
  !branch.protected &&
  !openHeadRefs.has(branch.name)
);

console.log(`Repository: ${repository}`);
console.log(`Default branch: ${defaultBranch} (never archived or deleted)`);
console.log(`Branches scanned: ${branches.length}`);
console.log(`Open PRs scanned: ${openPullRequests.length}`);
console.log(`Branches to archive: ${candidates.length}`);
console.log(dryRun ? "DRY RUN: no tags or branch refs will be changed." : "LIVE RUN: archive each exact commit before deleting its branch ref.");

const archived = [];
const deleted = [];
const skipped = [];
for (const branch of candidates) {
  const tagName = `${archivePrefix}/${branch.name}`;
  const tagPath = `/git/ref/tags/${encodeRef(tagName)}`;
  const branchPath = `/git/refs/heads/${encodeRef(branch.name)}`;

  if (dryRun) {
    console.log(`WOULD ARCHIVE ${branch.name} as ${tagName} (${branch.commit.sha})`);
    continue;
  }

  try {
    await ensureArchiveTag(tagName, branch.commit.sha);
    archived.push({ branch: branch.name, tag: tagName, sha: branch.commit.sha });
    console.log(`ARCHIVED ${branch.name} -> ${tagName} (${branch.commit.sha})`);

    // Re-read the tag immediately before deletion, guarding against a bad or
    // changed tag ref. The branch is deleted only after exact SHA verification.
    const verifiedTag = await request(tagPath);
    if (verifiedTag?.object?.sha !== branch.commit.sha) {
      throw new Error(`Archive tag verification failed for ${branch.name}; branch preserved.`);
    }

    await request(branchPath, { method: "DELETE" });
    deleted.push(branch.name);
    console.log(`DELETED BRANCH ${branch.name}`);
  } catch (error) {
    skipped.push({ branch: branch.name, reason: String(error) });
    console.error(`SKIPPED ${branch.name}: ${error.message || error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}

console.log(`Archive cleanup complete: ${archived.length} tags created or verified, ${deleted.length} branches deleted, ${skipped.length} skipped.`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const fs = await import("node:fs/promises");
  const lines = [
    "## Branch archive and cleanup",
    `- Default branch: ${defaultBranch} (never deleted)`,
    `- Branches scanned: ${branches.length}`,
    `- Open PRs scanned: ${openPullRequests.length}`,
    `- Branch candidates: ${candidates.length}`,
    `- Mode: ${dryRun ? "dry run" : "archive then delete"}`,
    ...archived.map((item) => `- Archived: \`${item.branch}\` → \`${item.tag}\``),
    ...deleted.map((name) => `- Deleted branch: \`${name}\``),
    ...skipped.map((item) => `- Skipped: \`${item.branch}\` — ${item.reason}`),
  ];
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}

if (skipped.length) process.exitCode = 1;
