#!/bin/bash
# Commit helper — always use this instead of bare git commit.
# Usage: ./commit.sh "your commit message"
#
# What it does:
#   1. Auto-stages all project files
#   2. Shows what's being committed
#   3. Blocks commit if code changed but CHANGELOG not updated
#   4. Commits with Co-Authored-By trailer
#   5. Pushes

if [ -z "$1" ]; then
  echo "Usage: ./commit.sh \"commit message\""
  exit 1
fi

# Auto-stage all project files
git add docs/ data/ .claude/ 2>/dev/null || true
git add index.html style.css app.js CNAME 2>/dev/null || true
git add *.json *.sh *.md 2>/dev/null || true

# Show what's staged
echo ""
echo "Staged files:"
git diff --cached --name-only
echo ""

# Bail if nothing is staged
if git diff --cached --quiet; then
  echo "Nothing staged to commit."
  exit 1
fi

# Block commit if code changed but CHANGELOG not updated
CODE_CHANGED=$(git diff --cached --name-only | grep -E '\.(html|css|js|json)$' | grep -v "^docs/" || true)
CHANGELOG_CHANGED=$(git diff --cached --name-only | grep "CHANGELOG.md" || true)

if [ -n "$CODE_CHANGED" ] && [ -z "$CHANGELOG_CHANGED" ]; then
  echo "ERROR: Code files changed but docs/CHANGELOG.md was not updated."
  echo "Changed: $CODE_CHANGED"
  echo "Update CHANGELOG.md first."
  exit 1
fi

# Commit + push
git commit -m "$1

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push
