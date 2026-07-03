#!/usr/bin/env bash
#
# test-discourse-guards.sh — verifies discourse-quote-loop.sh guardrails
# without any API calls (claude is stubbed). Sister suite to
# test-loop-guards.sh. Run: bash scripts/test-discourse-guards.sh
#
# Tests:
#   1. branch guard      -> exit 3 when resumed off discourse-pipeline
#   2. fail-closed cost  -> exit 4 when response JSON lacks total_cost_usd
#   3. budget cap        -> exit 2 when spent >= BUDGET_USD, before any call
#   4. corrupt spent     -> exit 4 when stored spent_usd is unparsable
#   5. validator         -> exit 0 on minimal valid fixture, exit 1 on broken
#   6. scope conflict    -> exit 6 when the same scope-violation repeats
set -uo pipefail
cd "$(dirname "$0")/.."

export LOOP_STATE_FILE="loop-state-discourse.json"
CITAT="sources/discourse/citat-ekonomi.json"

PASS=0; FAIL=0
check() { # actual expected name
  if [[ "$1" -eq "$2" ]]; then echo "ok   $3"; PASS=$((PASS + 1));
  else echo "FAIL $3 (expected exit $2, got $1)"; FAIL=$((FAIL + 1)); fi
}

orig_branch="$(git branch --show-current)"
SWITCHED=0; CREATED=0
ensure_on_pipeline_branch() {
  SWITCHED=0; CREATED=0
  if [[ "$(git branch --show-current)" != "discourse-pipeline" ]]; then
    SWITCHED=1
    if ! git rev-parse --verify -q discourse-pipeline >/dev/null; then
      git checkout -q -b discourse-pipeline; CREATED=1
    else
      git checkout -q discourse-pipeline
    fi
  fi
}
restore_branch() {
  if [[ "$SWITCHED" -eq 1 ]]; then
    git checkout -q "$orig_branch"
    if [[ "$CREATED" -eq 1 ]]; then git branch -q -D discourse-pipeline; fi
  fi
}

# Preserve any real loop state and any real quote catalogue
if [[ -f "$LOOP_STATE_FILE" ]]; then mv "$LOOP_STATE_FILE" .loop-state-discourse.test-backup; fi
if [[ -f "$CITAT" ]]; then mv "$CITAT" "$CITAT.test-backup"; fi
cleanup() {
  rm -f "$LOOP_STATE_FILE" "$CITAT"
  if [[ -f .loop-state-discourse.test-backup ]]; then mv .loop-state-discourse.test-backup "$LOOP_STATE_FILE"; fi
  if [[ -f "$CITAT.test-backup" ]]; then mv "$CITAT.test-backup" "$CITAT"; fi
  git checkout -q -- metod.html 2>/dev/null || true
}
trap cleanup EXIT

mkdir -p .loop sources/discourse
STUB=.loop/stub-claude.sh
cat > "$STUB" <<'EOF'
#!/usr/bin/env bash
echo '{"result":"stub","session_id":"stub-session"}'
EOF
chmod +x "$STUB"

STUB_COSTED=.loop/stub-claude-costed.sh
cat > "$STUB_COSTED" <<'EOF'
#!/usr/bin/env bash
echo '{"result":"stub ok","session_id":"stub-session-costed","total_cost_usd":0.01,"modelUsage":{"claude-sonnet-4-6":{}}}'
EOF
chmod +x "$STUB_COSTED"

write_valid_fixture() {
  node -e "
const partier = {};
for (const p of ['S','M','SD','C','V','KD','L','MP'])
  partier[p] = { kallbas: 'tunn', tunn_beskrivning: 'Testfixtur - inga citat insamlade i detta test.', citat: [] };
require('fs').writeFileSync('$CITAT', JSON.stringify({
  schemaVersion: 1, omrade: 'ekonomi',
  tidsfonster: 'valrörelsefokus 2025/26 till 2026-07-03',
  genererad: '2026-07-03', partier
}, null, 2) + '\n');
"
}

# --- Test 1: branch guard fires between iterations (exit 3) ---------------
rm -f "$LOOP_STATE_FILE"
node scripts/loop-lib.js set status=running next_iteration=2 spent_usd=0.50
git checkout -q -b dq-guard-test
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/discourse-quote-loop.sh >/dev/null 2>&1 || rc=$?
git checkout -q "$orig_branch"
git branch -q -D dq-guard-test
check "$rc" 3 "branch guard: resume on wrong branch exits 3"

# --- Test 2: fail-closed on missing total_cost_usd (exit 4) ---------------
rm -f "$LOOP_STATE_FILE"
ensure_on_pipeline_branch
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/discourse-quote-loop.sh >/dev/null 2>&1 || rc=$?
restore_branch
check "$rc" 4 "fail-closed: missing total_cost_usd exits 4"

# --- Test 3: budget cap stops BEFORE the next call (exit 2) ---------------
rm -f "$LOOP_STATE_FILE"
node scripts/loop-lib.js set status=running next_iteration=1 spent_usd=99.00
ensure_on_pipeline_branch
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/discourse-quote-loop.sh >/dev/null 2>&1 || rc=$?
restore_branch
check "$rc" 2 "budget cap: spent >= budget exits 2 without calling claude"

# --- Test 4: fail-closed on corrupt stored spend (exit 4) -----------------
rm -f "$LOOP_STATE_FILE"
node scripts/loop-lib.js set status=running next_iteration=1 spent_usd=banan
ensure_on_pipeline_branch
rc=0; CLAUDE_BIN="$STUB" DRY_RUN=1 bash scripts/discourse-quote-loop.sh >/dev/null 2>&1 || rc=$?
restore_branch
check "$rc" 4 "fail-closed: unparsable spent_usd exits 4"

# --- Test 5: validator on fixtures -----------------------------------------
write_valid_fixture
rc=0; node scripts/validate-citat.js >/dev/null 2>&1 || rc=$?
check "$rc" 0 "validator: minimal valid fixture passes"

node -e "
const fs = require('fs');
const j = JSON.parse(fs.readFileSync('$CITAT', 'utf8'));
j.schemaVersion = 2; delete j.partier.MP;
fs.writeFileSync('$CITAT', JSON.stringify(j));
"
rc=0; node scripts/validate-citat.js >/dev/null 2>&1 || rc=$?
check "$rc" 1 "validator: broken fixture (wrong schemaVersion, missing MP) fails"
rm -f "$CITAT"

# --- Test 6: scope conflict escalation (exit 6) ----------------------------
# Valid fixture so the validator gets past the target-file gate; a dirtied
# tracked file then produces the SAME scope violation every iteration.
rm -f "$LOOP_STATE_FILE"
write_valid_fixture
printf '\n<!-- dq-guard-test-marker -->\n' >> metod.html
ensure_on_pipeline_branch
rc=0; CLAUDE_BIN="$STUB_COSTED" bash scripts/discourse-quote-loop.sh >/dev/null 2>&1 || rc=$?
restore_branch
git checkout -q -- metod.html
rm -f "$CITAT"
check "$rc" 6 "scope conflict: repeated validator rejection exits 6"

echo ""
echo "$PASS passed, $FAIL failed"
exit "$((FAIL > 0 ? 1 : 0))"
