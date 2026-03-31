#!/bin/bash
# Deploy helper — pushes to master, triggering GitHub Pages deploy.
# Usage: ./deploy.sh
#
# Prerequisites:
#   - GitHub Pages enabled on this repo (Settings → Pages → Deploy from branch: master)
#   - Cloudflare CNAME pointing val26.leide.se → niklasleide.github.io
#   - CNAME file present in repo root

set -e

# Ensure working tree is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: Uncommitted changes detected. Commit first with ./commit.sh"
  exit 1
fi

echo "Pushing to master → GitHub Pages..."
git push origin master

echo ""
echo "Deploy triggered. Site will be live at https://val26.leide.se in ~1 minute."
echo "Check status: https://github.com/niklasleide/leides-ljuvliga-lilla-val26/actions"
