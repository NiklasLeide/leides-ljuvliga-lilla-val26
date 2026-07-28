#!/usr/bin/env bash
#
# bevakning-ci.sh — Lager 1 ENDAST. Körs av GitHub Actions (weekly cron) men är
# fullt körbar lokalt. Ingen modell, ingen PR, ingen branch-sandbox — ren
# fetch/hash/API-poll. Detta är den del som aldrig får missa något.
#
# Skiljer sig från bevakning-loop.sh (den lokala fullpipelinen) på TVÅ punkter:
#   1. Notifieringspolicy för Actions: TOM delta = tyst (bara logg, exit 0),
#      inklusive första baslinjekörningen. Icke-tom delta = GitHub-issue
#      (datum + antal i titeln, rå delta i body). Fel = issue. Ingen tyst körning.
#   2. Ingen modell och ingen PR — Lager 2/3 körs separat, lokalt (se
#      bevakning-loop.sh med BEVAKNING_SKIP_DETECT=1).
#
# State persisteras av arbetsflödet genom att committa BEVAKNING_STATE_FILE till
# repot (se .github/workflows/bevakning.yml). Robustare än Actions-cache för ett
# veckoschema: cache vräks efter 7 dagar utan träff — precis veckogränsen — och
# en missad/försenad körning skulle nollställa baslinjen och tyst missa allt som
# hänt sedan sist. Committad state är permanent och auditbar.
#
# Env:
#   BEVAKNING_STATE_FILE  committad statefil (Actions: bevakning-state.json;
#                         lokalt utelämnad => .bevakning/state.json)
#   BEVAKNING_DIR         arbetskatalog för delta.json (Actions: .bevakning-ci)
#   WATCHLIST             default data/watchlist.json
#   GH_BIN                gh-binär (stubbas i guardtesterna)
#
# Exit: 0 (tom eller delta-issue skapad), !=0 endast vid oväntat fel (issue filas).
set -uo pipefail
cd "$(dirname "$0")/.."

GH_BIN="${GH_BIN:-gh}"
BDIR="${BEVAKNING_DIR:-.bevakning}"
export BEVAKNING_DIR="$BDIR"
mkdir -p "$BDIR"

file_issue() { "$GH_BIN" issue create --title "$1" --body "$2" 2>&1 || echo "VARNING: kunde inte skapa issue: $1"; }
log() { echo "[$(date -u +%H:%M:%SZ)] $*"; }

# Ingen körning slutar tyst: oväntat fel => issue. CLEAN_EXIT sätts på de
# planerade utgångarna så trap:en inte dubbelrapporterar dem som fel.
CLEAN_EXIT=""
trap 'rc=$?; if [[ $rc -ne 0 && -z "$CLEAN_EXIT" ]]; then file_issue "Bevakning (Actions): körningen misslyckades $(date -u +%Y-%m-%d)" "Lager 1 avslutades med kod $rc. Se Actions-loggen för körningen. Ingen körning slutar tyst."; fi' EXIT

log "Lager 1 (Actions): deterministisk detektering, noll tokens"
# Explicit rc-koll: utan set -e skulle ett detect-krasch (t.ex. trasig watchlist)
# annars limpa vidare och maskeras som en tyst tom körning — precis det
# "ingen körning slutar tyst" förbjuder. Ett kraschat detect = fila issue, exit 1.
det_rc=0
node scripts/bevakning-lib.js detect || det_rc=$?
if [[ $det_rc -ne 0 || ! -f "$BDIR/delta.json" ]]; then
  log "Detekteringen kraschade (kod $det_rc) eller skrev ingen delta.json."
  file_issue "Bevakning (Actions): körningen misslyckades $(date -u +%Y-%m-%d)" \
"Lager 1-detekteringen kraschade (kod $det_rc) innan något delta skrevs. Trolig orsak: otillgänglig/trasig watchlist eller nätverksfel. Se Actions-loggen. Ingen körning slutar tyst."
  CLEAN_EXIT=1   # felet är redan rapporterat explicit — trap ska inte dubbla
  exit 1
fi

read_delta() { node -e "console.log(require('./'+process.env.BEVAKNING_DIR+'/delta.json').$1)"; }
delta_n="$(read_delta 'delta.length')"
first_run="$(read_delta 'first_run')"
cov="$(node -e "const d=require('./'+process.env.BEVAKNING_DIR+'/delta.json').coverage;console.log(d.riksdagen+'/'+d.sites+'/'+d.rss)")"
errs="$(read_delta 'errors.length')"

# TOM delta (inkl. första baslinjekörningen) => tyst, bara logg, exit 0.
if [[ "$delta_n" -eq 0 ]]; then
  if [[ "$first_run" == "true" ]]; then
    log "Baslinje etablerad (första körningen). Täckning $cov, fel $errs. Inga fynd — by design. Tyst per policy."
  else
    log "Inga träffar. Täckning $cov, fel $errs. Tyst per policy (ingen issue)."
  fi
  # Ett fel-fritt tomt läge ska inte döljas: om NÅGON källa inte kunde
  # kontrolleras filar vi ändå en issue (det är inte tystnad, det är blindhet).
  if [[ "$errs" -gt 0 ]]; then
    log "$errs källa/källor kunde inte kontrolleras — filar issue trots tom delta."
    file_issue "Bevakning: $errs källa/källor otillgänglig(a) $(date -u +%Y-%m-%d)" "$(node scripts/bevakning-delta-md.js)"
  fi
  CLEAN_EXIT=1
  exit 0
fi

# Icke-tom delta => issue med rå delta. Det är Niklas notifiering.
log "$delta_n delta-post(er) — skapar issue."
file_issue "Bevakning: $delta_n ändring(ar) $(date -u +%Y-%m-%d)" "$(node scripts/bevakning-delta-md.js)"
CLEAN_EXIT=1
exit 0
