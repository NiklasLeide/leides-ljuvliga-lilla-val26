#!/usr/bin/env bash
#
# run-discourse-batch.sh — obemannad batch: Steg A (citatloop) -> Steg B
# (dubbelutkast) -> Steg C (divergensrapport) för fyra områden i sekvens:
# demokrati, forsvar, skola, vard. Se BRIEF (diskursbatch) + DEC-007.
#
# Skriver ALDRIG i data/discourse.json. Steg D/implementation körs separat
# efter Niklas beslut per område.
#
# Guardrails (allt i kod):
#   - Ärvda per steg: --disallowedTools Bash, HEAD-vakt (exit 7),
#     scope-konflikt (exit 6), fail-closed kostnad (exit 4), branchkontroll
#   - Budgettak PER OMRÅDE: $20 (A+B+C), kontrolleras efter varje steg
#   - Totaltak batch: $75, kontrolleras före varje steg — nås det avslutas
#     batchen ordnat med issue
#   - Väggklocka per område: 3 h — steg körs under GNU timeout med
#     återstående områdestid; utgången tid => området avbryts, loggas, nästa
#   - Felisolering: område som failar => GitHub Issue + nästa område;
#     usage-/rate-limit => ordnat batchslut med issue
#   - Resume: batch-state.json (område/steg/status) — klara områden körs
#     aldrig om; pågående område återupptas på aktuellt steg
#
# Exit codes: 0 batch klar (även med failade områden — se slutissue),
#             2 totalbudget nådd, 3 fel branch, 9 usage-/rate-limit-stopp
#
# CLAUDE_BIN/GH_BIN overrides exist only for the guard tests.
set -uo pipefail
cd "$(dirname "$0")/.."

readonly AREAS=(demokrati forsvar skola vard)
readonly BATCH_BRANCH="discourse-batch"
readonly AREA_BUDGET_USD="20.00"     # per område, A+B+C sammantaget
readonly TOTAL_BUDGET_USD="75.00"    # hela batchen
readonly AREA_WALLCLOCK_S=10800      # 3 h per område
readonly RETRY_MAX=3                 # limit-fel: max försök per steg
RETRY_BACKOFF_S="${RETRY_BACKOFF_S:-60}"   # övstyrbar endast för guardtester
readonly TIMEOUT_BIN="/usr/bin/timeout"   # GNU coreutils — INTE Windows timeout.exe
readonly BATCH_STATE="batch-state.json"

CLAUDE_BIN="${CLAUDE_BIN:-claude}"
GH_BIN="${GH_BIN:-gh}"
export CLAUDE_BIN
export LOOP_BRANCH="$BATCH_BRANCH"

blib() { LOOP_STATE_FILE="$BATCH_STATE" node scripts/loop-lib.js "$@"; }

if [[ "$(git branch --show-current)" != "$BATCH_BRANCH" ]]; then
  echo "FEL: aktuell branch är '$(git branch --show-current)', inte $BATCH_BRANCH. Avbryter."
  exit 3
fi
if [[ ! -x "$TIMEOUT_BIN" ]]; then
  echo "FEL: $TIMEOUT_BIN saknas (GNU timeout krävs)."
  exit 1
fi

# HEAD vid batchstart — för slutverifiering att data/discourse.json är orörd
batch_start_head="$(blib get batch_start_head)"
if [[ -z "$batch_start_head" ]]; then
  batch_start_head="$(git rev-parse HEAD)"
  blib set "batch_start_head=$batch_start_head" status=running
fi

# --- kostnadshjälpare (all flyttalsaritmetik i node) ------------------------
area_cost() { # areaId -> summa spent+drafts+diverge ur loop-state-<area>.json
  node -e "
const fs = require('fs');
const f = 'loop-state-$1.json';
if (!fs.existsSync(f)) { console.log('0'); process.exit(0); }
const s = JSON.parse(fs.readFileSync(f, 'utf8'));
const n = (v) => { const x = Number(v); return isFinite(x) ? x : 0; };
console.log((n(s.spent_usd) + n(s.drafts_cost_usd) + n(s.diverge_cost_usd)).toFixed(6));
"
}
total_cost() {
  node -e "
const fs = require('fs');
let t = 0;
for (const a of ['demokrati','forsvar','skola','vard']) {
  const f = 'loop-state-' + a + '.json';
  if (!fs.existsSync(f)) continue;
  const s = JSON.parse(fs.readFileSync(f, 'utf8'));
  const n = (v) => { const x = Number(v); return isFinite(x) ? x : 0; };
  t += n(s.spent_usd) + n(s.drafts_cost_usd) + n(s.diverge_cost_usd);
}
console.log(t.toFixed(6));
"
}
over() { # a b -> exit 0 om a >= b
  node -e "process.exit(Number('$1') >= Number('$2') ? 0 : 1)"
}

# --- felrapportering (ingen körning slutar tyst) ----------------------------
file_issue() { # title body
  "$GH_BIN" issue create --title "$1" --body "$2" 2>&1 || \
    echo "VARNING: kunde inte skapa issue: $1"
}

# rate-/usage-limit-detektering: stegets logg (stderr från claude) OCH
# områdets råsvarsfiler (stdout går dit, inte till loggen)
is_usage_limit() { # logfile area
  local pat='rate.?limit|usage.?limit|429|overloaded|quota exceeded|credit balance'
  grep -qiE "$pat" "$1" && return 0
  grep -qiE "$pat" ".loop/$2"/* 2>/dev/null
}

get_area_status() { blib get "area_$1"; }
set_area_status() { blib set "area_$1=$2"; }

# --- körning ----------------------------------------------------------------
mkdir -p .loop
for area in "${AREAS[@]}"; do
  st="$(get_area_status "$area")"
  if [[ "$st" == "done" || "$st" == "failed" ]]; then
    echo "=== $area: $st — hoppar över ==="
    continue
  fi

  echo "=== OMRÅDE: $area (status: ${st:-ny}) ==="
  export DISCOURSE_AREA="$area"   # styr stegskriptens målfil/prompts/state
  unset LOOP_STATE_FILE           # stegskripten härleder loop-state-$area.json
  area_start=$(date +%s)

  # stegordning; resume: klara steg hoppar vi över via statusvärdet
  for step in steg_a steg_b steg_c; do
    st="$(get_area_status "$area")"
    case "$st" in
      steg_a_done) [[ "$step" == "steg_a" ]] && continue ;;
      steg_b_done) [[ "$step" == "steg_a" || "$step" == "steg_b" ]] && continue ;;
    esac

    # GUARDRAIL: totalbudget före varje steg
    tot="$(total_cost)"
    if over "$tot" "$TOTAL_BUDGET_USD"; then
      echo "TOTALBUDGET nådd (\$$tot >= \$$TOTAL_BUDGET_USD). Ordnat stopp."
      blib set status=total_budget_stop
      file_issue "Diskursbatch: totalbudget nådd — ordnat stopp" \
"Batchen stoppade före $area/$step. Ackumulerat: \$$tot av \$$TOTAL_BUDGET_USD.
Återuppta genom att höja TOTAL_BUDGET_USD (Niklas beslut) och köra om wrappern — klara områden körs inte om."
      exit 2
    fi

    # GUARDRAIL: väggklocka — återstående tid för området
    elapsed=$(( $(date +%s) - area_start ))
    remaining=$(( AREA_WALLCLOCK_S - elapsed ))
    if (( remaining <= 0 )); then
      echo "$area: väggklocka (3 h) slut — avbryter området."
      set_area_status "$area" failed
      file_issue "Batch: $area avbrutet — väggklocka 3 h" \
"Området $area nådde 3-timmarstaket under $step. Statefil loop-state-$area.json är kvar — återupptagbart genom att nollställa area_$area i $BATCH_STATE och köra om wrappern."
      continue 2
    fi

    echo "--- $area/$step (max ${remaining}s, spent område: \$$(area_cost "$area"), totalt: \$$tot) ---"
    log=".loop/$area-$step.log"

    # Transient-limit-hantering: 429/limit-fel försöks om med backoff innan
    # exit 9 får konstateras (incident 2026-07-04: "Usage credits required
    # for 1M context" — engångsfel i EN session — feltolkades som uttömt
    # fönster). Loopstegen är resumable, så ett omförsök = fresh session på
    # samma iteration, aldrig omgjort arbete.
    rc=0
    for attempt in 1 2 3; do
      rc=0
      case "$step" in
        steg_a) "$TIMEOUT_BIN" "$remaining" bash scripts/discourse-quote-loop.sh  > "$log" 2>&1 || rc=$? ;;
        steg_b) "$TIMEOUT_BIN" "$remaining" bash scripts/discourse-drafts.sh     > "$log" 2>&1 || rc=$? ;;
        steg_c) "$TIMEOUT_BIN" "$remaining" bash scripts/discourse-diverge.sh    > "$log" 2>&1 || rc=$? ;;
      esac
      if [[ $rc -eq 0 ]]; then break; fi
      if is_usage_limit "$log" "$area" && [[ $attempt -lt $RETRY_MAX ]]; then
        echo "transient limit ($area/$step, försök $attempt/$RETRY_MAX) — backoff ${RETRY_BACKOFF_S}s och omförsök"
        sleep "$RETRY_BACKOFF_S"
        # räkna om väggklockan inför omförsöket
        elapsed=$(( $(date +%s) - area_start ))
        remaining=$(( AREA_WALLCLOCK_S - elapsed ))
        if (( remaining <= 0 )); then break; fi
        continue
      fi
      break
    done
    tail -5 "$log"

    if [[ $rc -ne 0 ]]; then
      # persistent usage-/rate-limit (efter $RETRY_MAX försök) => meningslöst
      # att fortsätta någonstans
      if is_usage_limit "$log" "$area"; then
        err_line="$(grep -ioE '(API Error|rate.?limit|usage.?limit|overloaded|quota exceeded|credit)[^\"]{0,120}' "$log" ".loop/$area"/* 2>/dev/null | head -1)"
        echo "PERSISTENT USAGE-/RATE-LIMIT efter $RETRY_MAX försök — ordnat batchslut."
        blib set status=usage_limit_stop
        file_issue "Diskursbatch: persistent usage-/rate-limit — ordnat stopp" \
"Stopp vid $area/$step (exit $rc) efter $RETRY_MAX försök med ${RETRY_BACKOFF_S}s backoff.
Sista felrad: ${err_line:-okänd}
Återupptagningsläge: area_$area=$(get_area_status "$area"), ackumulerat \$$(total_cost). Kör om wrappern när orsaken är åtgärdad — klara områden körs inte om."
        exit 9
      fi
      reason="exit $rc"
      if [[ $rc -eq 124 ]]; then reason="timeout (väggklocka)"; fi
      echo "$area/$step misslyckades ($reason) — området markeras failed, nästa område startar."
      set_area_status "$area" failed
      it="$(LOOP_STATE_FILE="loop-state-$area.json" node scripts/loop-lib.js get next_iteration)"
      file_issue "Batch: $area avbrutet — $reason" \
"Steget $step för området $area misslyckades ($reason, iteration ${it:-?}).
Logg: .loop/$area-$step.log (lokal). Statefiler kvar — återupptagbart:
nollställ area_$area i $BATCH_STATE och kör om wrappern."
      continue 2
    fi

    case "$step" in
      steg_a) set_area_status "$area" steg_a_done ;;
      steg_b) set_area_status "$area" steg_b_done ;;
      steg_c) set_area_status "$area" steg_c_done ;;
    esac

    # GUARDRAIL: områdesbudget efter varje steg
    ac="$(area_cost "$area")"
    if over "$ac" "$AREA_BUDGET_USD"; then
      echo "$area: områdesbudget nådd (\$$ac >= \$$AREA_BUDGET_USD) — avbryter området."
      set_area_status "$area" failed
      file_issue "Batch: $area avbrutet — områdesbudget \$$AREA_BUDGET_USD nådd" \
"Området $area kostade \$$ac efter $step (tak \$$AREA_BUDGET_USD). Levererade steg är committade/på disk; återupptagbart efter Niklas beslut om höjt tak."
      continue 2
    fi
  done

  # Område klart: committa + pusha (en commit per område, sanningsenlig)
  st="$(get_area_status "$area")"
  if [[ "$st" == "steg_c_done" ]]; then
    ncit="$(node -e "const j=require('./sources/discourse/citat-$area.json');let t=0;for(const e of Object.values(j.partier))t+=e.citat.length;console.log(t)" 2>/dev/null || echo '?')"
    ndiv="$(grep -oE 'Totalt: [0-9]+ divergenser' "drafts/discourse-$area-RAPPORT.md" | grep -oE '[0-9]+' | head -1 || echo '?')"
    verd="$(LOOP_STATE_FILE="loop-state-$area.json" node scripts/loop-lib.js get last_verdict)"
    vstat="PASS"; if [[ "$verd" != "PASS" ]]; then vstat="EJ PASS (se loggen)"; fi
    node scripts/batch-changelog.js "$area" "$ncit" "$vstat" "$ndiv" "$(area_cost "$area")"
    git add "sources/discourse/citat-$area.json" \
            "drafts/discourse-$area-sonnet.json" "drafts/discourse-$area-opus.json" \
            "drafts/discourse-$area-RAPPORT.md" docs/CHANGELOG.md
    ./commit.sh "batch($area): citatkatalog ($ncit citat, evaluator $vstat) + dubbelutkast + divergensrapport ($ndiv divergenser) — kostnad \$$(area_cost "$area")" \
      > ".loop/$area-commit.log" 2>&1 || {
        file_issue "Batch: $area — commit/push misslyckades" "Se .loop/$area-commit.log lokalt. Området är klart på disk men inte pushat."
      }
    set_area_status "$area" done
    echo "=== $area KLART (kostnad \$$(area_cost "$area")) ==="
  fi
done

# --- slutrapport (ingen körning slutar tyst) --------------------------------
done_n=0; body=""
for area in "${AREAS[@]}"; do
  st="$(get_area_status "$area")"
  [[ "$st" == "done" ]] && done_n=$((done_n + 1))
  stats="—"
  if [[ -f "sources/discourse/citat-$area.json" ]]; then
    stats="$(node -e "
const j = require('./sources/discourse/citat-$area.json');
const per = Object.entries(j.partier).map(([p,e]) => p + ':' + e.citat.length).join(' ');
console.log(per);" 2>/dev/null || echo '—')"
  fi
  ndiv="$(grep -oE 'Totalt: [0-9]+ divergenser' "drafts/discourse-$area-RAPPORT.md" 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo '—')"
  body="$body
- **$area** [$st]: citat/parti: $stats | divergenser: $ndiv | kostnad: \$$(area_cost "$area") | rapport: drafts/discourse-$area-RAPPORT.md"
done

# Verifiering: data/discourse.json orörd sedan batchstart
disc_diff="$(git diff "$batch_start_head" HEAD --stat -- data/discourse.json)"
disc_note="data/discourse.json orörd sedan batchstart: $([[ -z "$disc_diff" ]] && echo JA || echo 'NEJ — GRANSKA!')"

blib set status=finished
file_issue "Diskursbatch klar: $done_n/4 områden levererade" \
"Total kostnad: \$$(total_cost) (tak \$$TOTAL_BUDGET_USD).
$disc_note
$body

Nästa steg (Niklas + chatten, per område): granska divergensrapport -> Steg D-konsolidering -> implementation -> PR."

echo "=== BATCH KLAR: $done_n/4 områden. Total kostnad: \$$(total_cost) ==="
echo "$disc_note"
