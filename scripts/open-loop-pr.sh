#!/usr/bin/env bash
#
# open-loop-pr.sh — Step 5 (outside the loop, after ./commit.sh): generate
# pr-body.md from the committed diff + evaluator verdict, then open a PR
# against master via gh. Never merges — merge is Niklas's call in the PR UI.
#
# Falls back to printing the compare URL + body if gh is missing or not
# authenticated, so the PR can still be opened by hand.
set -euo pipefail
cd "$(dirname "$0")/.."

BASE_BRANCH="master"
HEAD_BRANCH="$(git branch --show-current)"

if [[ "$HEAD_BRANCH" == "$BASE_BRANCH" ]]; then
  echo "FEL: du är på $BASE_BRANCH — checka ut loopens branch innan du öppnar PR."
  exit 1
fi

node scripts/generate-pr-body.js pr-body.md

remote_url="$(git config --get remote.origin.url)"
repo_path="${remote_url#*github.com[:/]}"
repo_path="${repo_path%.git}"
compare_url="https://github.com/${repo_path}/compare/${BASE_BRANCH}...${HEAD_BRANCH}?expand=1"

print_manual_fallback() {
  echo ""
  echo "Öppna PR manuellt:"
  echo "$compare_url"
  echo ""
  cat pr-body.md
}

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI hittades inte (command -v gh misslyckades)."
  print_manual_fallback
  exit 0
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh är inte autentiserad (gh auth status misslyckades)."
  print_manual_fallback
  exit 0
fi

title="$(git log -1 --pretty=%s)"
gh pr create --base "$BASE_BRANCH" --title "$title" --body-file pr-body.md
