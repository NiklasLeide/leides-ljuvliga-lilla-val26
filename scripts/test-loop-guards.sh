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
#   6. scope conflict    -> exit 6 when the same scope-violation repeats
#                            two iterations in a row
set -uo pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0
check() { # actual expected name
  if [[ "$1" -eq "$2" ]]; then echo "ok   $3"; PASS=$((PASS + 1));
  else echo "FAIL $3 (expected exit $2, got $1)"; FAIL=$((FAIL + 1)); fi
}

orig_branch="$(git branch --show-current)"

# Some tests need the worker call to clear the branch guard, i.e. need to
# actually be on loop-pilot, regardless of what branch this suite was
# invoked from. These two helpers make that deterministic instead of relying
# on the ambient branch (which is what test 2 used to do, silently).
LOOP_PILOT_SWITCHED=0
LOOP_PILOT_CREATED=0
ensure_on_loop_pilot() {
  LOOP_PILOT_SWITCHED=0
  LOOP_PILOT_CREATED=0
  if [[ "$(git branch --show-current)" != "loop-pilot" ]]; then
    LOOP_PILOT_SWITCHED=1
    if ! git rev-parse --verify -q loop-pilot >/dev/null; then
      git checkout -q -b loop-pilot
      LOOP_PILOT_CREATED=1
    else
      git checkout -q loop-pilot
    fi
  fi
}
restore_from_loop_pilot() {
  if [[ "$LOOP_PILOT_SWITCHED" -eq 1 ]]; then
    git checkout -q "$orig_branch"
    if [[ "$LOOP_PILOT_CREATED" -eq 1 ]]; then git branch -q -D loop-pilot; fi
  fi
}

# Preserve any real loop state
if [[ -f loop-state.json ]]; then mv loop-state.json .loop-state.test-backup; fi
cleanup() {
  rm -f loop-state.json
  if [[ -f .loop-state.test-backup ]]; then mv .loop-state.test-backup loop-state.json; fi
  git checkout -q -- data/voting.json 2>/dev/null || true
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

STUB_COSTED=.loop/stub-claude-costed.sh
cat > "$STUB_COSTED" <<'EOF'
#!/usr/bin/env bash
# claude stub: valid JSON WITH total_cost_usd — lets the loop iterate
echo '{"result":"stub ok","session_id":"stub-session-costed","total_cost_usd":0.01,"modelUsage":{"claude-sonnet-4-6":{}}}'
EOF
chmod +x "$STUB_COSTED"

# --- Test 1: branch guard fires between iterations (exit 3) ---------------
# Simulate: iteration 1 done, branch switched away, loop resumed.
rm -f loop-state.json
node scripts/loop-lib.js set status=running next_iteration=2 spent_usd=0.50
git checkout -q -b loop-guard-test
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/data-loop.sh >/dev/null 2>&1 || rc=$?
git checkout -q "$orig_branch"
git branch -q -D loop-guard-test
check "$rc" 3 "branch guard: resume on wrong branch exits 3"

# --- Test 2: fail-closed on missing total_cost_usd (exit 4) ---------------
# Must actually clear the branch guard to reach the worker call, so run this
# on loop-pilot regardless of which branch invoked the suite.
rm -f loop-state.json
ensure_on_loop_pilot
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/data-loop.sh >/dev/null 2>&1 || rc=$?
restore_from_loop_pilot
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

# --- Test 6: scope conflict escalation (exit 6) ----------------------------
# Dirty a non-target entry so validate-voting.js reports the same
# out-of-scope violation on every iteration; the worker stub never touches
# the file, so the violation repeats verbatim -> exit 6 on the 2nd iteration.
rm -f loop-state.json
git checkout -q -- data/voting.json 2>/dev/null || true
node -e "
const fs = require('fs');
const p = 'data/voting.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.data.skola.friskolor.S.voted += ' [loop-guard-test-marker]';
fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
"
ensure_on_loop_pilot
rc=0; CLAUDE_BIN="$STUB_COSTED" bash scripts/data-loop.sh >/dev/null 2>&1 || rc=$?
restore_from_loop_pilot
git checkout -q -- data/voting.json
check "$rc" 6 "scope conflict: repeated validator rejection exits 6"

echo ""
echo "$PASS passed, $FAIL failed"
exit "$((FAIL > 0 ? 1 : 0))"
