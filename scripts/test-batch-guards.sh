#!/usr/bin/env bash
#
# test-batch-guards.sh — verifies run-discourse-batch.sh guardrails without
# API calls or real GitHub issues (claude AND gh are stubbed).
#
# Tests:
#   1. area failure   -> issue filed + NEXT area starts (fel-isolering)
#   2. resume         -> done-area skipped, in-progress area resumes at rätt steg
#   3. usage-limit    -> orderly batch stop (exit 9), later areas never started
#   4. total budget   -> orderly stop (exit 2) before any API call
#   5. changelog auth -> worker noise line removed, ambiguous line marked,
#                        authoritative line written (deterministic, no model)
set -uo pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0
check() { # condition-desc: pass 0/1 as $1
  if [[ "$1" -eq 0 ]]; then echo "ok   $2"; PASS=$((PASS + 1));
  else echo "FAIL $2"; FAIL=$((FAIL + 1)); fi
}

orig_branch="$(git branch --show-current)"
SWITCHED=0; CREATED=0
ensure_on_batch_branch() {
  SWITCHED=0; CREATED=0
  if [[ "$(git branch --show-current)" != "discourse-batch" ]]; then
    SWITCHED=1
    if ! git rev-parse --verify -q discourse-batch >/dev/null; then
      git checkout -q -b discourse-batch; CREATED=1
    else
      git checkout -q discourse-batch
    fi
  fi
}
restore_branch() {
  if [[ "$SWITCHED" -eq 1 ]]; then
    git checkout -q "$orig_branch"
    if [[ "$CREATED" -eq 1 ]]; then git branch -q -D discourse-batch; fi
  fi
}

# Preserve any real state
for f in batch-state.json loop-state-demokrati.json loop-state-forsvar.json loop-state-skola.json loop-state-vard.json; do
  if [[ -f "$f" ]]; then mv "$f" "$f.test-backup"; fi
done
cleanup() {
  for f in batch-state.json loop-state-demokrati.json loop-state-forsvar.json loop-state-skola.json loop-state-vard.json; do
    rm -f "$f"
    if [[ -f "$f.test-backup" ]]; then mv "$f.test-backup" "$f"; fi
  done
  rm -f drafts/discourse-forsvar-sonnet.json drafts/discourse-forsvar-opus.json
  rm -f .loop/gh-test.log
}
trap cleanup EXIT

mkdir -p .loop drafts

STUB_FAIL=.loop/stub-claude-fail.sh
cat > "$STUB_FAIL" <<'EOF'
#!/usr/bin/env bash
echo "boom: simulated worker failure"
exit 1
EOF
chmod +x "$STUB_FAIL"

STUB_LIMIT=.loop/stub-claude-limit.sh
cat > "$STUB_LIMIT" <<'EOF'
#!/usr/bin/env bash
echo "Error 429: rate limit exceeded, try again later"
exit 1
EOF
chmod +x "$STUB_LIMIT"

STUB_GH=.loop/stub-gh.sh
cat > "$STUB_GH" <<'EOF'
#!/usr/bin/env bash
echo "gh $*" >> .loop/gh-test.log
echo "https://github.com/stub/issue/1"
EOF
chmod +x "$STUB_GH"

reset_state() {
  rm -f batch-state.json loop-state-demokrati.json loop-state-forsvar.json loop-state-skola.json loop-state-vard.json .loop/gh-test.log
  rm -rf .loop/demokrati .loop/forsvar .loop/skola .loop/vard
}

# --- Test 1: area failure -> issue + next area -----------------------------
reset_state
ensure_on_batch_branch
CLAUDE_BIN="$STUB_FAIL" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t1.log 2>&1
rc1=$?
restore_branch
ok=1
grep -q "Batch: demokrati avbrutet" .loop/gh-test.log && \
grep -q "Batch: forsvar avbrutet" .loop/gh-test.log && \
grep -q "Batch: vard avbrutet" .loop/gh-test.log && \
grep -q "Diskursbatch klar: 0/4" .loop/gh-test.log && [[ $rc1 -eq 0 ]] && ok=0
check "$ok" "fel-isolering: failat område ger issue och nästa område startar (4 issues + slutissue, exit 0)"

# --- Test 2: resume skips done, resumes correct step ------------------------
reset_state
node -e "
const fs=require('fs');
fs.writeFileSync('batch-state.json', JSON.stringify({
  batch_start_head: 'deadbeef', status: 'running',
  area_demokrati: 'done', area_forsvar: 'steg_b_done'
}, null, 2));
"
echo '{}' > drafts/discourse-forsvar-sonnet.json
echo '{}' > drafts/discourse-forsvar-opus.json
ensure_on_batch_branch
CLAUDE_BIN="$STUB_FAIL" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t2.log 2>&1
restore_branch
ok=1
grep -q "demokrati: done — hoppar över" .loop/batch-t2.log && \
grep -q "forsvar/steg_c" .loop/batch-t2.log && \
! grep -q "forsvar/steg_a" .loop/batch-t2.log && ok=0
check "$ok" "resume: klart område hoppas över, pågående återupptas på steg_c (inte steg_a)"

# --- Test 3: usage-limit -> orderly stop (exit 9), later areas untouched ----
reset_state
ensure_on_batch_branch
CLAUDE_BIN="$STUB_LIMIT" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t3.log 2>&1
rc3=$?
restore_branch
ok=1
[[ $rc3 -eq 9 ]] && grep -q "usage-/rate-limit" .loop/gh-test.log && \
! grep -q "Batch: skola" .loop/gh-test.log && ok=0
check "$ok" "usage-limit: ordnat batchslut exit 9, senare områden startas inte"

# --- Test 4: total budget stop (exit 2) before any call ---------------------
reset_state
node -e "
const fs=require('fs');
fs.writeFileSync('loop-state-demokrati.json', JSON.stringify({spent_usd:'80.00'}));
"
ensure_on_batch_branch
CLAUDE_BIN="$STUB_FAIL" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t4.log 2>&1
rc4=$?
restore_branch
ok=1
[[ $rc4 -eq 2 ]] && grep -q "totalbudget nådd" .loop/gh-test.log && ok=0
check "$ok" "totalbudget: ordnat stopp exit 2 utan API-anrop"

# --- Test 5: authoritative CHANGELOG line replaces worker noise -------------
cp docs/CHANGELOG.md .loop/CHANGELOG.test-backup
node -e "
const fs = require('fs');
const p = 'docs/CHANGELOG.md';
let md = fs.readFileSync(p, 'utf8');
const i = md.indexOf('---\n') + 4;
// strikt workermönster (ska TAS BORT) + tvetydig rad (ska MARKERAS)
md = md.slice(0, i)
  + '\n[2026-07-04] feat: sources/discourse/citat-demokrati.json — citatkatalog med FELAKTIGA siffror (13 citat, allt perfekt)\n'
  + 'konstig rad som nämner sources/discourse/citat-demokrati.json utan datumprefix\n'
  + md.slice(i);
fs.writeFileSync(p, md);
"
node scripts/batch-changelog.js demokrati 49 "REVISE (testfixtur)" 7 12.34 > /dev/null
ok=1
grep -q "diskursbatch demokrati — citatkatalog sources/discourse/citat-demokrati.json (49 citat" docs/CHANGELOG.md && \
! grep -q "FELAKTIGA siffror" docs/CHANGELOG.md && \
grep -q "\[worker, oauktoritativ\] konstig rad" docs/CHANGELOG.md && ok=0
mv .loop/CHANGELOG.test-backup docs/CHANGELOG.md
check "$ok" "changelog: workerrad borttagen, tvetydig rad markerad, auktoritativ rad skriven"

echo ""
echo "$PASS passed, $FAIL failed"
exit "$((FAIL > 0 ? 1 : 0))"
