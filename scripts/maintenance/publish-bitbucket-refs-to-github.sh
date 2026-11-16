#!/usr/bin/env bash
set -euo pipefail

GITHUB_URL="https://github.com/TDTRIA/LEGEND-RPG.git"
TOKEN="${GITHUB_PUSH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "GITHUB_PUSH_TOKEN is not configured as a secured Bitbucket Pipelines repository variable." >&2
  exit 1
fi

AUTH_HEADER="$(printf 'x-access-token:%s' "$TOKEN" | base64 | tr -d '\n')"
git config user.name "Bitbucket Sync"
git config user.email "bitbucket-sync@users.noreply.github.com"

github_git() {
  git -c http.extraheader="AUTHORIZATION: basic $AUTH_HEADER" "$@"
}

sync_one_branch() {
  branch="$1"
  source_sha="$2"
  ref="refs/heads/$branch"

  if ! git check-ref-format "$ref"; then
    echo "SKIP invalid branch ref: $branch"
    return 0
  fi

  remote_sha="$(github_git ls-remote "$GITHUB_URL" "$ref" | awk 'NR == 1 {print $1}')"
  if [ -z "$remote_sha" ]; then
    echo "CREATE GitHub branch $branch at $source_sha"
    github_git push "$GITHUB_URL" "$source_sha:$ref"
    return 0
  fi

  if [ "$remote_sha" = "$source_sha" ]; then
    echo "CURRENT $branch $source_sha"
    return 0
  fi

  github_git fetch --no-tags "$GITHUB_URL" "+$ref:refs/remotes/github/$branch"

  if git merge-base --is-ancestor "$remote_sha" "$source_sha"; then
    echo "FAST-FORWARD GitHub branch $branch: $remote_sha -> $source_sha"
    github_git push "$GITHUB_URL" "$source_sha:$ref"
  else
    echo "PRESERVE DIVERGENCE: GitHub $branch is at $remote_sha; Bitbucket is at $source_sha. No force-push attempted."
  fi
}

mode="${1:-}"
case "$mode" in
  --all)
    echo "Fetching every current Bitbucket branch for safe initial GitHub backfill."
    git fetch origin '+refs/heads/*:refs/remotes/origin/*'
    while IFS= read -r local_ref; do
      [ -n "$local_ref" ] || continue
      case "$local_ref" in
        origin/HEAD) continue ;;
      esac
      branch="${local_ref#origin/}"
      source_sha="$(git rev-parse "$local_ref")"
      sync_one_branch "$branch" "$source_sha"
    done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin)
    ;;
  "")
    echo "Usage: $0 <branch-name> | --all" >&2
    exit 2
    ;;
  *)
    branch="$mode"
    if [ -z "${BITBUCKET_BRANCH:-}" ] || [ "$BITBUCKET_BRANCH" != "$branch" ]; then
      echo "Refusing unexpected branch context: BITBUCKET_BRANCH='${BITBUCKET_BRANCH:-}' requested='$branch'" >&2
      exit 2
    fi
    source_sha="$(git rev-parse HEAD)"
    sync_one_branch "$branch" "$source_sha"
    ;;
esac

unset AUTH_HEADER TOKEN
