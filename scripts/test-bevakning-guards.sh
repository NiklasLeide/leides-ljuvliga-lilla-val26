#!/usr/bin/env bash
#
# test-bevakning-guards.sh — verifierar bevakning-loop.sh + Lager 1 utan API-
# anrop och utan riktiga GitHub-issues (claude och gh stubbas, fetch=stub med
# fixtures). Kör: bash scripts/test-bevakning-guards.sh
#
# Tester:
#   1. text-hash: header/nav/datum-only ändring ger INGEN träff (moderaterna-fallet)
#   2. text-hash: verkligt sakinnehållsbyte ger EN träff
#   3. rss event-dedup: N artiklar om ett utspel -> 1 event (aldrig viktat av volym)
#   4. Lager 1 noll tokens: detect kör utan claude, producerar delta.json
#   5. första körningen: baslinje, inga fynd, issue, exit 0
#   6. tom körning: rapporterar "inga träffar", exit 0, ingen modell anropad
#   7. branch-vakt: exit 3 utanför 'bevakning'
#   8. veckobudget: spent >= tak -> exit 2 före modellanrop
#   9. media = trigger: obekräftad mediapost hamnar i Kräver beslut, aldrig förslag
#  10. grep-verifiering: förslag med citat som inte greppar faller till Kräver beslut
#  11. resume-vakt: budget_stop-status startar inte automatiskt en ny körning
#  12. HEAD-vakt: modell som committar under sin tur -> exit 7
set -uo pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0
check() { if [[ "$1" -eq 0 ]]; then echo "ok   $2"; PASS=$((PASS+1)); else echo "FAIL $2"; FAIL=$((FAIL+1)); fi; }

orig_branch="$(git branch --show-current)"
SWITCHED=0; CREATED=0
on_branch() {
  if [[ "$(git branch --show-current)" != "bevakning" ]]; then
    SWITCHED=1
    if git rev-parse --verify -q bevakning >/dev/null; then git checkout -q bevakning
    else git checkout -q -b bevakning; CREATED=1; fi
  fi
}
off_branch() { if [[ "$SWITCHED" -eq 1 ]]; then git checkout -q "$orig_branch"; [[ "$CREATED" -eq 1 ]] && git branch -q -D bevakning; SWITCHED=0; CREATED=0; fi; }

# Isolerad sandlåda så testerna aldrig rör en riktig .bevakning/
# Stubbar ligger i EGEN katalog (STUBS) — reset() wipar $SB, aldrig stubbarna.
SB=".bevakning-test"
STUBS=".bevakning-test-stubs"
export BEVAKNING_DIR="$SB"
export BEVAKNING_FETCH=stub
export LOOP_STATE_FILE="$SB/loop-state.json"
cleanup() { rm -rf "$SB" "$STUBS"; off_branch; }
trap cleanup EXIT
reset() { rm -rf "$SB"; mkdir -p "$SB/fixtures"; }

WL="$SB/watchlist.json"
mini_watchlist() { # skriver en minimal watchlist som pekar på fixtures
  cat > "$WL" <<'EOF'
{ "schemaVersion": 1,
  "riksdagen": [ { "id": "prop-skola", "area": "skola", "doktyp": "prop", "sok": "skola" } ],
  "sites": [ { "id": "m-valloften", "party": "M", "kind": "kampanjsida", "label": "M vallöften", "url": "https://moderaterna.se/valloften-2026/" } ],
  "rss": [ { "id": "dn", "outlet": "DN", "url": "https://dn.se/rss" } ] }
EOF
}
# fixtures för Lager 1 (namn matchar fetchText:s fixtureKey)
fx_riksdagen_empty() { echo '{"dokumentlista":{"dokument":[]}}' > "$SB/fixtures/riksdagen-prop-skola.json"; }
fx_site() { printf '%s' "$1" > "$SB/fixtures/site-m-valloften.html"; }
fx_rss_empty() { echo '<rss><channel></channel></rss>' > "$SB/fixtures/rss-dn.xml"; }

SITE_V1='<html><head><title>M</title></head><body><nav>Meny Start</nav><time datetime="2026-07-20T10:00">20 juli</time><p>Senast uppdaterad 2026-07-20 10:00</p><main><h2>Vallöften</h2><p>Vi vill sänka skatten för föräldrar som jobbar.</p></main><footer>© 2026</footer></body></html>'
# samma sakinnehåll, bara nav/tid/footer ändrat (moderaterna.se-fallet):
SITE_V1_HEADERONLY='<html><head><title>M</title></head><body><nav>Meny Start Nyheter Kontakt</nav><time datetime="2026-07-28T14:30">28 juli</time><p>Senast uppdaterad 2026-07-28 14:30</p><main><h2>Vallöften</h2><p>Vi vill sänka skatten för föräldrar som jobbar.</p></main><footer>© 2026 Alla rättigheter</footer></body></html>'
# verkligt sakinnehållsbyte:
SITE_V2='<html><head><title>M</title></head><body><nav>Meny Start</nav><main><h2>Vallöften</h2><p>Vi vill HÖJA skatten för höginkomsttagare.</p></main><footer>© 2026</footer></body></html>'

# --- Test 1+2: text-hash false-positive-resistens -----------------------------
reset
printf '%s' "$SITE_V1" > "$SB/a.html"; h1="$(node scripts/bevakning-lib.js hash "$SB/a.html")"
printf '%s' "$SITE_V1_HEADERONLY" > "$SB/b.html"; h2="$(node scripts/bevakning-lib.js hash "$SB/b.html")"
printf '%s' "$SITE_V2" > "$SB/c.html"; h3="$(node scripts/bevakning-lib.js hash "$SB/c.html")"
[[ "$h1" == "$h2" ]]; check $? "text-hash: header/nav/datum-only ändring ger samma hash (ingen falsk positiv)"
[[ "$h1" != "$h3" ]]; check $? "text-hash: verkligt sakinnehållsbyte ger annan hash"
reset

# --- Test 3: rss event-dedup --------------------------------------------------
cat > "$SB/rss.json" <<'EOF'
[ {"outlet":"DN","title":"Kristersson lovar sänkt skatt för barnfamiljer","url":"dn1"},
  {"outlet":"SvD","title":"Sänkt skatt för barnfamiljer – Kristersson lovar","url":"svd1"},
  {"outlet":"Expressen","title":"Kristersson: sänkt skatt till barnfamiljer","url":"exp1"},
  {"outlet":"SVT","title":"Nato-övning inleds i Östersjön","url":"svt1"} ]
EOF
nclust="$(node scripts/bevakning-lib.js rss-cluster "$SB/rss.json" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).length))")"
[[ "$nclust" -eq 2 ]]; check $? "rss event-dedup: 4 artiklar (3 om skatt + 1 om Nato) -> 2 event, aldrig viktat av volym"

# --- Test 4: Lager 1 noll tokens ----------------------------------------------
reset; mini_watchlist; fx_riksdagen_empty; fx_site "$SITE_V1"; fx_rss_empty
WATCHLIST="$WL" node scripts/bevakning-lib.js detect > "$SB/detect1.log" 2>&1
[[ -f "$SB/delta.json" ]] && grep -q "first_run=true" "$SB/detect1.log"; check $? "Lager 1: detect kör utan claude (noll tokens) och skriver delta.json"

# --- Test 7: branch-vakt — kör wrappern från en annan branch -> exit 3 --------
# Ovillkorligt: växla tillfälligt till master (otäckta filer följer med), kör,
# förvänta exit 3, växla tillbaka. Kräver ren nog tree för branch-växling.
b7_from="$(git branch --show-current)"
b7_other="master"; [[ "$b7_from" == "master" ]] && b7_other="$b7_from"
if [[ "$b7_from" != "master" ]] && git checkout -q master 2>/dev/null; then
  rc=0; CLAUDE_BIN=false GH_BIN=false WATCHLIST="$WL" bash scripts/bevakning-loop.sh >/dev/null 2>&1 || rc=$?
  git checkout -q "$b7_from"
  [[ $rc -eq 3 ]]; check $? "branch-vakt: exit 3 utanför 'bevakning'"
else
  # Redan på master, eller växling nekades — testa via en wegwerf-branch.
  git checkout -q -b bevakning-guardtest-tmp 2>/dev/null && {
    rc=0; CLAUDE_BIN=false GH_BIN=false WATCHLIST="$WL" bash scripts/bevakning-loop.sh >/dev/null 2>&1 || rc=$?
    git checkout -q "$b7_from"; git branch -q -D bevakning-guardtest-tmp
    [[ $rc -eq 3 ]]; check $? "branch-vakt: exit 3 utanför 'bevakning'"
  } || check 1 "branch-vakt: kunde inte skapa testbranch"
fi

# Stubbar för wrapper-tester
mkdir -p "$STUBS"
STUB_GH="$STUBS/stub-gh.sh"; cat > "$STUB_GH" <<'EOF'
#!/usr/bin/env bash
echo "gh $*" >> .bevakning-test-stubs/gh.log; echo "https://github.com/stub/pr/1"
EOF
chmod +x "$STUB_GH"
STUB_CLAUDE_FAIL="$STUBS/stub-claude-fail.sh"; cat > "$STUB_CLAUDE_FAIL" <<'EOF'
#!/usr/bin/env bash
echo "called" >> .bevakning-test-stubs/claude-called.log; exit 1
EOF
chmod +x "$STUB_CLAUDE_FAIL"

on_branch

# --- Test 5: första körningen = baslinje, exit 0, ingen modell ----------------
reset; mini_watchlist; fx_riksdagen_empty; fx_site "$SITE_V1"; fx_rss_empty
rc=0; CLAUDE_BIN="$STUB_CLAUDE_FAIL" GH_BIN="$STUB_GH" WATCHLIST="$WL" bash scripts/bevakning-loop.sh > "$SB/run5.log" 2>&1 || rc=$?
ok=1; [[ $rc -eq 0 ]] && grep -q "baslinje etablerad" "$STUBS/gh.log" && [[ ! -f "$STUBS/claude-called.log" ]] && ok=0
check "$ok" "första körningen: baslinje, issue, exit 0, ingen modell anropad"

# --- Test 6: tom körning (baslinje finns, inget ändrat) -----------------------
# Andra körningen med identiskt sakinnehåll (bara header/tid ändrat) -> inga träffar.
fx_site "$SITE_V1_HEADERONLY"
rc=0; CLAUDE_BIN="$STUB_CLAUDE_FAIL" GH_BIN="$STUB_GH" WATCHLIST="$WL" bash scripts/bevakning-loop.sh > "$SB/run6.log" 2>&1 || rc=$?
ok=1; [[ $rc -eq 0 ]] && grep -q "inga träffar" "$STUBS/gh.log" && [[ ! -f "$STUBS/claude-called.log" ]] && ok=0
check "$ok" "tom körning: header-only ändring ger inga träffar, exit 0, ingen modell (moderaterna-fallet i wrappern)"

# --- Test 8: veckobudget -> exit 2 --------------------------------------------
# Sätt spent över taket och tvinga fram ett delta (verkligt sakinnehållsbyte).
fx_site "$SITE_V2"
node -e "const fs=require('fs');fs.writeFileSync('$SB/loop-state.json',JSON.stringify({spent_usd:'20.00',status:'running'}))"
rc=0; CLAUDE_BIN="$STUB_CLAUDE_FAIL" GH_BIN="$STUB_GH" WATCHLIST="$WL" bash scripts/bevakning-loop.sh > "$SB/run8.log" 2>&1 || rc=$?
ok=1; [[ $rc -eq 2 ]] && grep -q "veckobudget" "$STUBS/gh.log" && [[ ! -f "$STUBS/claude-called.log" ]] && ok=0
check "$ok" "veckobudget: spent >= tak -> exit 2 före modellanrop"

# --- Test 11: resume-vakt -----------------------------------------------------
node -e "const fs=require('fs');fs.writeFileSync('$SB/loop-state.json',JSON.stringify({spent_usd:'0',status:'budget_stop'}))"
rc=0; CLAUDE_BIN="$STUB_CLAUDE_FAIL" GH_BIN="$STUB_GH" WATCHLIST="$WL" bash scripts/bevakning-loop.sh > "$SB/run11.log" 2>&1 || rc=$?
ok=1; [[ $rc -eq 0 ]] && grep -q "kräver människa" "$SB/run11.log" && [[ ! -f "$STUBS/claude-called.log" ]] && ok=0
check "$ok" "resume-vakt: budget_stop-status återupptas inte automatiskt"

off_branch

# --- Test 9+10: report.js enforcar media=trigger + grep-verifiering -----------
reset
# delta med en confirmable:false-mediapost + en confirmable:true-partipost
cat > "$SB/delta.json" <<'EOF'
{ "generated":"now","first_run":false,
  "delta":[ {"layer1_source":"media","confirmable":false,"kind":"utspel","title":"Parti X lovar Y","articles":[{"outlet":"DN","url":"dn1"}]},
            {"layer1_source":"partisajt","confirmable":true,"party":"SD","title":"SD dok"} ],
  "coverage":{"riksdagen":1,"sites":1,"rss":1},"errors":[],"per_party":{},
  "baseline":{"riksdagen_items":0,"sites":1,"rss_feeds":1} }
EOF
# verify.json: ett förslag som bygger på MEDIA (ska demoteras) + ett giltigt med grep-ok citat
mkdir -p "$SB/fixtures"
SRCURL="https://sd.se/dok"
srchash="$(node -e "console.log(require('./scripts/bevakning-lib.js').sha256('$SRCURL').slice(0,12))")"
echo '<html><body><main>Vi vill ha enklare byggregler så att fler kan äga sin bostad.</main></body></html>' > "$SB/fixtures/source-$srchash.html"
# verify.json = det EXTRAHERADE modellresultatet (som `lib result` producerar i
# skarp drift), dvs. den inre JSON:en direkt — inte {"result": "..."}-omslaget.
cat > "$SB/verify.json" <<EOF
{ "proposals": [
    { "party":"M","topic":"skatt-arbete","current_value":"85","suggested":"80",
      "quote":"medieutspel utan bekräftelse","source_url":"dn1","confirmed_via":"media" },
    { "party":"SD","topic":"bostader","current_value":"60","suggested":"65",
      "quote":"enklare byggregler så att fler kan äga sin bostad","source_url":"$SRCURL","confirmed_via":"partisajt" }
  ],
  "unconfirmed": [
    { "title":"Parti X lovar Y (medieutspel)","note":"ej bekräftat","articles":[{"outlet":"DN","url":"dn1"}] }
  ] }
EOF
BEVAKNING_DIR="$SB" BEVAKNING_FETCH=stub node scripts/bevakning-report.js build > "$SB/report.log" 2>&1
prop="$(node -e "console.log(require('./$SB/report-meta.json').proposals)")"
beslut="$(node -e "console.log(require('./$SB/report-meta.json').krav_beslut)")"
ok=1
# giltigt SD-förslag kvar (1), M-förslaget (media) demoterat, medieutspel i beslut => beslut>=2
[[ "$prop" -eq 1 ]] && [[ "$beslut" -ge 2 ]] && \
  grep -q "SD / bostader" "$SB/report.md" && \
  ! grep -q "M / skatt-arbete\*\*: 85" "$SB/report.md" && ok=0
check "$ok" "media=trigger: media-baserat förslag demoteras till Kräver beslut, aldrig förslag"
grep -q "citatet greppar inte\|saknar bekräftelse" "$SB/report.md"; check $? "grep-verifiering: obekräftat/ogreppbart citat redovisas under Kräver beslut"

# --- Test 12: HEAD-vakt — modell som committar under sin tur -> exit 7 ---------
on_branch
reset; mini_watchlist; fx_riksdagen_empty; fx_site "$SITE_V1"; fx_rss_empty
# etablera baslinje först (körning 1)
CLAUDE_BIN="$STUB_CLAUDE_FAIL" GH_BIN="$STUB_GH" WATCHLIST="$WL" bash scripts/bevakning-loop.sh >/dev/null 2>&1
# körning 2: verkligt sakinnehållsbyte -> delta -> Lager 2 anropas; stubben committar
fx_site "$SITE_V2"
STUB_TAMPER="$STUBS/stub-tamper.sh"; cat > "$STUB_TAMPER" <<'EOF'
#!/usr/bin/env bash
git commit --allow-empty -q -m "rogue (bevakning guard test 12)"
echo '{"result":"{\"items\":[]}","session_id":"x","total_cost_usd":0.01,"modelUsage":{"claude-haiku-4-5-20251001":{}}}'
EOF
chmod +x "$STUB_TAMPER"
pre_head="$(git rev-parse HEAD)"
rc=0; CLAUDE_BIN="$STUB_TAMPER" GH_BIN="$STUB_GH" WATCHLIST="$WL" bash scripts/bevakning-loop.sh > "$SB/run12.log" 2>&1 || rc=$?
# städa ev. rogue-commit (den är tom --allow-empty; --soft rör inte arbetsträdet)
[[ "$(git rev-parse HEAD)" != "$pre_head" ]] && git reset -q --soft "$pre_head"
ok=1; [[ $rc -eq 7 ]] && grep -q "ändrade git-historiken" "$STUBS/gh.log" && ok=0
check "$ok" "HEAD-vakt: modell som committar under sin tur -> exit 7"
off_branch

echo ""
echo "$PASS passed, $FAIL failed"
exit "$((FAIL > 0 ? 1 : 0))"
