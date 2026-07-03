#!/usr/bin/env bash
#
# test-loop-guards.sh — verifies data-loop.sh guardrails without any API calls
# (claude is stubbed). Run from anywhere: bash scripts/test-loop-guards.sh
#
# Tests:
#   1. branch guard      -> exit 3 when resumed on a branch other than loop-pilot
#   2. fail-closed cost  -> exit 4 when response JSON lacks total_cost_usd
#   3. budget cap        -> exit 2 when spent >= BUDGET_USD, before any call
#   4. corrupt spent     -> exit 4 when stored spent_usd is unparsable
#   5. validator         -> exit 0 on the unmodified working tree
set -uo pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0
check() { # actual expected name
  if [[ "$1" -eq "$2" ]]; then echo "ok   $3"; PASS=$((PASS + 1));
  else echo "FAIL $3 (expected exit $2, got $1)"; FAIL=$((FAIL + 1)); fi
}

# Preserve any real loop state
if [[ -f loop-state.json ]]; then mv loop-state.json .loop-state.test-backup; fi
cleanup() {
  rm -f loop-state.json
  if [[ -f .loop-state.test-backup ]]; then mv .loop-state.test-backup loop-state.json; fi
}
trap cleanup EXIT

mkdir -p .loop
STUB=.loop/stub-claude.sh
cat > "$STUB" <<'EOF'
#!/usr/bin/env bash
# claude stub: valid JSON but NO total_cost_usd — must trigger fail-closed
echo '{"result":"stub","session_id":"stub-session"}'
EOF
chmod +x "$STUB"

# --- Test 1: branch guard fires between iterations (exit 3) ---------------
# Simulate: iteration 1 done, branch switched away, loop resumed.
rm -f loop-state.json
node scripts/loop-lib.js set status=running next_iteration=2 spent_usd=0.50
orig_branch="$(git branch --show-current)"
git checkout -q -b loop-guard-test
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/data-loop.sh >/dev/null 2>&1 || rc=$?
git checkout -q "$orig_branch"
git branch -q -D loop-guard-test
check "$rc" 3 "branch guard: resume on wrong branch exits 3"

# --- Test 2: fail-closed on missing total_cost_usd (exit 4) ---------------
rm -f loop-state.json
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/data-loop.sh >/dev/null 2>&1 || rc=$?
check "$rc" 4 "fail-closed: missing total_cost_usd exits 4"

# --- Test 3: budget cap stops BEFORE the next call (exit 2) ---------------
rm -f loop-state.json
node scripts/loop-lib.js set status=running next_iteration=1 spent_usd=99.00
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/data-loop.sh >/dev/null 2>&1 || rc=$?
check "$rc" 2 "budget cap: spent >= budget exits 2 without calling claude"

# --- Test 4: fail-closed on corrupt stored spend (exit 4) -----------------
rm -f loop-state.json
node scripts/loop-lib.js set status=running next_iteration=1 spent_usd=banan
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/data-loop.sh >/dev/null 2>&1 || rc=$?
check "$rc" 4 "fail-closed: unparsable spent_usd exits 4"

# --- Test 5: validator passes on clean tree (exit 0) ----------------------
rc=0; node scripts/validate-voting.js >/dev/null 2>&1 || rc=$?
check "$rc" 0 "validator: clean working tree passes"

echo ""
echo "$PASS passed, $FAIL failed"
exit "$((FAIL > 0 ? 1 : 0))"
