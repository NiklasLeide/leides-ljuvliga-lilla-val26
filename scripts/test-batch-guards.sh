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
#   6. transient limit -> two 429-failures then success => retries, NO exit 9
#   7. tamper self-heal -> one rogue commit => HEAD restored, incident issue,
#                          step retried (area fails later on exit 5, not 7)
#   8. tamper cap       -> two rogue commits in same area => area fails
#   9. semantic exit    -> loop budget-stop (exit 2) with STALE 429-files in
#                          .loop/<area> => area fails ordinarily, NO exit 9
set -uo pipefail
cd "$(dirname "$0")/.."
export RETRY_BACKOFF_S=1   # snabb backoff i tester (default 60s i skarp drift)

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

# Preserve any real state — statefiler OCH .loop/<område>-artefakter
# (skarpa körningar lämnar råsvar där; testerna får aldrig radera dem)
for f in batch-state.json loop-state-demokrati.json loop-state-forsvar.json loop-state-skola.json loop-state-vard.json; do
  if [[ -f "$f" ]]; then mv "$f" "$f.test-backup"; fi
done
for a in demokrati forsvar skola vard; do
  if [[ -d ".loop/$a" ]]; then mv ".loop/$a" ".loop/$a.suite-backup"; fi
done
# forsvar-drafts är numera RIKTIGA committade filer — testerna använder
# dummies i deras ställe och återställer originalen efteråt
for f in drafts/discourse-forsvar-sonnet.json drafts/discourse-forsvar-opus.json; do
  if [[ -f "$f" ]]; then cp "$f" "$f.suite-backup"; fi
done
cleanup() {
  for f in batch-state.json loop-state-demokrati.json loop-state-forsvar.json loop-state-skola.json loop-state-vard.json; do
    rm -f "$f"
    if [[ -f "$f.test-backup" ]]; then mv "$f.test-backup" "$f"; fi
  done
  for a in demokrati forsvar skola vard; do
    rm -rf ".loop/$a"
    if [[ -d ".loop/$a.suite-backup" ]]; then mv ".loop/$a.suite-backup" ".loop/$a"; fi
  done
  for f in drafts/discourse-forsvar-sonnet.json drafts/discourse-forsvar-opus.json; do
    rm -f "$f"
    if [[ -f "$f.suite-backup" ]]; then mv "$f.suite-backup" "$f"; fi
  done
  rm -f .loop/gh-test.log .loop/stub-count
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

# --- Test 6 (körs före 5 av städskäl): transient limit -> retry, no exit 9 --
# Stub failar två gånger med 429-text, lyckas därefter. Batchen ska
# backoffa+retrya (aldrig exit 9); områdena failar sedan ordinärt (exit 5).
reset_state
rm -f .loop/stub-count
STUB_FLAKY=.loop/stub-claude-flaky.sh
cat > "$STUB_FLAKY" <<'EOF'
#!/usr/bin/env bash
n=$(cat .loop/stub-count 2>/dev/null || echo 0); n=$((n+1)); echo "$n" > .loop/stub-count
if [ "$n" -le 2 ]; then
  echo '{"type":"result","is_error":true,"api_error_status":429,"result":"API Error: rate limit exceeded"}'
  exit 1
fi
echo '{"result":"stub ok","session_id":"stub-session","total_cost_usd":0.01,"modelUsage":{"claude-sonnet-4-6":{}}}'
EOF
chmod +x "$STUB_FLAKY"
ensure_on_batch_branch
CLAUDE_BIN="$STUB_FLAKY" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t6.log 2>&1
rc6=$?
restore_branch
ok=1
[[ $rc6 -eq 0 ]] && \
grep -q "transient limit (demokrati/steg_a, försök 1/3)" .loop/batch-t6.log && \
grep -q "transient limit (demokrati/steg_a, försök 2/3)" .loop/batch-t6.log && \
! grep -qi "persistent usage" .loop/batch-t6.log && \
! grep -qi "usage-/rate-limit" .loop/gh-test.log && ok=0
check "$ok" "transient limit: två 429-fel retryas med backoff, inget exit 9"
rm -f .loop/stub-count

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

# --- Test 7: tamper self-heal (one rogue commit) -----------------------------
reset_state
rm -f .loop/stub-count
STUB_TAMPER_ONCE=.loop/stub-tamper-once.sh
cat > "$STUB_TAMPER_ONCE" <<'EOF'
#!/usr/bin/env bash
n=$(cat .loop/stub-count 2>/dev/null || echo 0); n=$((n+1)); echo "$n" > .loop/stub-count
if [ "$n" -eq 1 ]; then git commit --allow-empty -q -m "rogue (guard test 7)"; fi
echo '{"result":"stub ok","session_id":"stub-session","total_cost_usd":0.01,"modelUsage":{"claude-sonnet-4-6":{}}}'
EOF
chmod +x "$STUB_TAMPER_ONCE"
ensure_on_batch_branch
pre_head="$(git rev-parse HEAD)"
CLAUDE_BIN="$STUB_TAMPER_ONCE" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t7.log 2>&1
rc7=$?
post_head="$(git rev-parse HEAD)"
restore_branch
ok=1
[[ $rc7 -eq 0 && "$pre_head" == "$post_head" ]] && \
grep -q "git-manipulation självläkt (händelse 1)" .loop/gh-test.log && \
grep -q "tamper självläkt (demokrati/steg_a, händelse 1)" .loop/batch-t7.log && \
! grep -q "upprepad git-manipulation" .loop/gh-test.log && ok=0
check "$ok" "tamper self-heal: HEAD återställd, incident-issue, steget omgjort, inget areafall på exit 7"
rm -f .loop/stub-count

# --- Test 8: tamper cap (two rogue commits in same area) ---------------------
reset_state
STUB_TAMPER_ALWAYS=.loop/stub-tamper-always.sh
cat > "$STUB_TAMPER_ALWAYS" <<'EOF'
#!/usr/bin/env bash
git commit --allow-empty -q -m "rogue (guard test 8)"
echo '{"result":"stub ok","session_id":"stub-session","total_cost_usd":0.01,"modelUsage":{"claude-sonnet-4-6":{}}}'
EOF
chmod +x "$STUB_TAMPER_ALWAYS"
ensure_on_batch_branch
pre_head="$(git rev-parse HEAD)"
CLAUDE_BIN="$STUB_TAMPER_ALWAYS" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t8.log 2>&1
rc8=$?
post_head="$(git rev-parse HEAD)"
restore_branch
ok=1
[[ $rc8 -eq 0 && "$pre_head" == "$post_head" ]] && \
grep -q "avbrutet — upprepad git-manipulation" .loop/gh-test.log && \
[[ "$(LOOP_STATE_FILE=batch-state.json node scripts/loop-lib.js get area_demokrati_tamper)" == "2" ]] && ok=0
check "$ok" "tamper cap: två händelser i samma område => området failar, HEAD återställd"

# --- Test 9: semantic exit never limit-classified ----------------------------
# demokrati-loopens EGEN budget är slut (exit 2 direkt) OCH en stale 429-fil
# ligger i .loop/demokrati — gammal bugg: stale-filen gav falskt exit 9.
reset_state
node -e "
const fs=require('fs');
fs.writeFileSync('loop-state-demokrati.json', JSON.stringify({spent_usd:'16.00',status:'running',next_iteration:3}));
"
mkdir -p .loop/demokrati
echo '{"is_error":true,"result":"API Error: 429 rate limit exceeded (STALE FIXTURE)"}' > .loop/demokrati/stale-old-failure.json
touch -d "2 hours ago" .loop/demokrati/stale-old-failure.json 2>/dev/null || true
ensure_on_batch_branch
CLAUDE_BIN="$STUB_FAIL" GH_BIN="$STUB_GH" bash scripts/run-discourse-batch.sh > .loop/batch-t9.log 2>&1
rc9=$?
restore_branch
ok=1
[[ $rc9 -eq 0 ]] && \
grep -q "Batch: demokrati avbrutet — exit 2" .loop/gh-test.log && \
! grep -qi "PERSISTENT" .loop/batch-t9.log && \
grep -q "OMRÅDE: forsvar" .loop/batch-t9.log && ok=0
check "$ok" "semantisk exit: budget-exit 2 med stale 429-filer ger areafall + fortsättning, aldrig exit 9"

echo ""
echo "$PASS passed, $FAIL failed"
exit "$((FAIL > 0 ? 1 : 0))"
