/**
 * Remove a branch ref only when its current tip is already represented in main:
 * - exact current head SHA of a PR merged into this repository, OR
 * - a commit that is an ancestor of origin/main.
 *
 * Branches with open PRs, protected refs, unmerged unique commits, and main
 * are always preserved.
 */
import { execFileSync } from "node:child_process";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.DRY_RUN === "true";

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
      headers: { ...headers, ...(options.headers || {}) },
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

function isAncestorOfMain(sha) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", sha, "origin/main"], {
      stdio: "ignore",
    });
    return true;
  } catch (error) {
    if (error.status === 1) return false;
    throw new Error(`Unable to verify ancestry for ${sha}: ${error.message || error}`);
  }
}

const repo = await request("");
const defaultBranch = repo.default_branch;
if (defaultBranch !== "main") {
  throw new Error(`Safety stop: expected default branch main, found ${defaultBranch}.`);
}

const [branches, closedPullRequests, openPullRequests] = await Promise.all([
  allPages("/branches"),
  allPages("/pulls?state=closed"),
  allPages("/pulls?state=open"),
]);

const mergedHeads = new Map();
for (const pr of closedPullRequests) {
  if (!pr.merged_at || pr.head?.repo?.full_name !== repository || !pr.head.ref || !pr.head.sha) {
    continue;
  }
  const key = pr.head.ref;
  if (!mergedHeads.has(key)) mergedHeads.set(key, new Map());
  mergedHeads.get(key).set(pr.head.sha, pr.number);
}

const openHeadRefs = new Set(
  openPullRequests
    .filter((pr) => pr.head?.repo?.full_name === repository && pr.head?.ref)
    .map((pr) => pr.head.ref),
);

const candidates = [];
for (const branch of branches) {
  if (branch.name === "main" || branch.name === defaultBranch || branch.protected) continue;
  if (openHeadRefs.has(branch.name)) continue;

  const mergedPrNumber = mergedHeads.get(branch.name)?.get(branch.commit?.sha);
  if (mergedPrNumber) {
    candidates.push({ ...branch, reason: `exact head of merged PR #${mergedPrNumber}` });
    continue;
  }

  if (isAncestorOfMain(branch.commit.sha)) {
    candidates.push({ ...branch, reason: "branch tip is already an ancestor of main" });
  }
}

console.log(`Repository: ${repository}`);
console.log(`Default branch: ${defaultBranch} (never deleted)`);
console.log(`Branches scanned: ${branches.length}`);
console.log(`Closed PRs scanned: ${closedPullRequests.length}`);
console.log(`Open PRs scanned: ${openPullRequests.length}`);
console.log(`Fully integrated candidates: ${candidates.length}`);
console.log(dryRun ? "DRY RUN: no branch refs will be deleted." : "LIVE RUN: deleting only fully integrated refs.");

const deleted = [];
const skipped = [];
for (const branch of candidates) {
  const refPath = `/git/refs/heads/${branch.name.split("/").map(encodeURIComponent).join("/")}`;

  if (dryRun) {
    console.log(`WOULD DELETE ${branch.name} (${branch.reason}; ${branch.commit.sha})`);
    continue;
  }

  try {
    await request(refPath, { method: "DELETE" });
    deleted.push(branch.name);
    console.log(`DELETED ${branch.name} (${branch.reason})`);
  } catch (error) {
    skipped.push({ branch: branch.name, reason: String(error) });
    console.error(`FAILED ${branch.name}: ${error.message || error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}

console.log(dryRun
  ? `Dry run complete: ${candidates.length} branch refs would be removed.`
  : `Cleanup complete: ${deleted.length} deleted, ${skipped.length} failed.`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const fs = await import("node:fs/promises");
  const lines = [
    "## Merged and fully integrated branch cleanup",
    `- Default branch: ${defaultBranch} (never deleted)`,
    `- Branches scanned: ${branches.length}`,
    `- Closed PRs scanned: ${closedPullRequests.length}`,
    `- Open PRs scanned: ${openPullRequests.length}`,
    `- Fully integrated candidates: ${candidates.length}`,
    `- Mode: ${dryRun ? "dry run" : "live cleanup"}`,
    ...(dryRun
      ? candidates.map((b) => `- Would delete: \`${b.name}\` — ${b.reason}`)
      : deleted.map((name) => `- Deleted: \`${name}\``)),
    ...skipped.map((item) => `- Failed: \`${item.branch}\` — ${item.reason}`),
  ];
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}

if (skipped.length) process.exitCode = 1;
