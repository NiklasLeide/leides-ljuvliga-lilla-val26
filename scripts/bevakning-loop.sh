#!/usr/bin/env bash
#
# bevakning-loop.sh — G5-bevakningsloopen. Tre lager:
#   Lager 1  deterministisk detektering (bevakning-lib.js), NOLL tokens
#   Lager 2  Haiku sållar deltat (substantiellt vs brus), billigast modell
#   Lager 3  Sonnet verifierar substantiella fynd + formulerar ändringsförslag
#
# Loopen SKRIVER ALDRIG i data/ (positions/voting/discourse/galtan). Den
# föreslår; Niklas beslutar; skrivning sker i en separat godkänd runda.
# Leverans: PR = leverans, issue = fel. INGEN körning slutar tyst — inte ens
# en tom körning, som rapporterar "inga träffar" och exit 0.
#
# Guardrails (allt i kod, inget i prompter) — återanvänder mönstren från
# data-loop.sh / run-discourse-batch.sh:
#   1. Veckotak $15 HÅRT i kod, kontrollerat före varje modellanrop (fail-closed)
#   2. Per-steg-budget (v3): Haiku-tak $2, Sonnet-tak $10 av veckotaket
#   3. Branch-sandbox: vägrar köra utanför 'bevakning'
#   4. HEAD-vakt: HEAD fångas före varje modellanrop, ändrad HEAD => exit 7
#   5. Semantiska exitkoder (2 budget / 3 branch / 6 tomt-men-ok aldrig) är
#      aldrig limit-klassificerade; limit-grep mtime-scopad till aktuellt steg
#   6. Resume-vakt: återupptar ENDAST usage_interrupted, startar aldrig själv
#   7. Media = trigger aldrig källa; obekräftat utspel -> "Kräver beslut"
#      (enforced i bevakning-report.js, inte i prompten)
#
# Exit codes:
#   0  klar (PR skapad ELLER tom körning "inga träffar")
#   2  veckobudget nådd — ordnat stopp + issue
#   3  fel branch
#   4  fail-closed: kostnad/state oparsbar
#   7  modellen ändrade git-historiken
#   9  persistent usage-/rate-limit — ordnat stopp + issue
#
# START (frikopplad, obligatoriskt i drift): scripts/start-bevakning-detached.sh
#   Direktstart som barn till en interaktiv session har dödat körningar 2×.
# MANUELL testkörning: bash scripts/bevakning-loop.sh
# RESUME: kör om samma kommando; state i .bevakning/state.json + loop-state.
# INSPEKTERA: cat .bevakning/delta.json ; cat .bevakning/loop-state.json
set -uo pipefail
cd "$(dirname "$0")/.."

readonly REQUIRED_BRANCH="bevakning"
readonly WEEKLY_BUDGET_USD="15.00"   # GUARDRAIL 1: hårt veckotak
readonly SIFT_BUDGET_USD="2.00"      # GUARDRAIL 2: Haiku-tak (v3 per-steg)
readonly VERIFY_BUDGET_USD="10.00"   # GUARDRAIL 2: Sonnet-tak (v3 per-steg)
readonly SIFT_MODEL="claude-haiku-4-5-20251001"
readonly VERIFY_MODEL="claude-sonnet-5"
readonly SIFT_TOOLS="Read"
readonly VERIFY_TOOLS="Read,WebFetch,Grep"

# BEVAKNING_DIR överstyrbar ENDAST för guardtesterna (sandlåda); i drift .bevakning.
BDIR="${BEVAKNING_DIR:-.bevakning}"
export BEVAKNING_DIR="$BDIR"
readonly STATE_FILE="$BDIR/loop-state.json"

CLAUDE_BIN="${CLAUDE_BIN:-claude}"
GH_BIN="${GH_BIN:-gh}"
export CLAUDE_CODE_DISABLE_1M_CONTEXT=1    # standardkontext
export LOOP_STATE_FILE="$STATE_FILE"
mkdir -p "$BDIR"
lib() { node scripts/loop-lib.js "$@"; }

heartbeat() { echo "[$(date +%H:%M:%S)] $*"; }
file_issue() { "$GH_BIN" issue create --title "$1" --body "$2" 2>&1 || echo "VARNING: kunde inte skapa issue: $1"; }

# GUARDRAIL 3: branch-sandbox
if [[ "$(git branch --show-current)" != "$REQUIRED_BRANCH" ]]; then
  echo "FEL: aktuell branch är '$(git branch --show-current)', inte $REQUIRED_BRANCH. Avbryter."
  exit 3
fi

# GUARDRAIL 6: resume-vakt — en ny körning får bara starta om förra slutade rent
# eller om den blev usage-avbruten. En körning som stoppade på budget/branch
# återupptas inte automatiskt (kräver människa).
prev_status="$(lib get status)"
if [[ "$prev_status" == "budget_stop" || "$prev_status" == "usage_limit_stop" ]]; then
  heartbeat "Föregående körning slutade '$prev_status' — kräver människa (höj tak / åtgärda limit) och manuell omstart. Avbryter."
  exit 0
fi

# ---------------------------------------------------------------- LAGER 1
heartbeat "Lager 1: deterministisk detektering (noll tokens)"
node scripts/bevakning-lib.js detect
first_run="$(node -e "console.log(require('./'+process.env.BEVAKNING_DIR+'/delta.json').first_run)")"
delta_n="$(node -e "console.log(require('./'+process.env.BEVAKNING_DIR+'/delta.json').delta.length)")"
cov="$(node -e "const d=require('./'+process.env.BEVAKNING_DIR+'/delta.json').coverage;console.log(d.riksdagen+' riksdagen-frågor, '+d.sites+' sajter, '+d.rss+' rss')")"

# FIRST RUN — baseline. Hittar inget by design; det är framgång, inte fel.
if [[ "$first_run" == "true" ]]; then
  base="$(node -e "const b=require('./'+process.env.BEVAKNING_DIR+'/delta.json').baseline;console.log(b.riksdagen_items+' riksdagen-dokument, '+b.sites+' partisajter (hash), '+b.rss_feeds+' rss-flöden')")"
  heartbeat "FÖRSTA KÖRNINGEN: baslinje etablerad ($base). Inga fynd förväntade."
  file_issue "Bevakning: baslinje etablerad (körning 1)" \
"Första bevakningskörningen etablerade baslinjen och hittade inget — det är förväntat, inte ett fel.
Bevakas nu: $base.
Täckning denna körning: $cov.
Körning 2 och framåt producerar delta. Schemalägg veckovis via scripts/start-bevakning-detached.sh."
  lib set status=baseline_established
  heartbeat "KLART (baslinje). exit 0"
  exit 0
fi

# TOM KÖRNING — ingen körning slutar tyst.
if [[ "$delta_n" -eq 0 ]]; then
  heartbeat "Inga träffar i Lager 1 ($cov). Ingen modell anropas."
  file_issue "Bevakning: inga träffar $(date +%Y-%m-%d)" \
"Veckokörningen hittade inga sakinnehållsändringar.
Täckning: $cov. Kostnad: \$0.00 (endast Lager 1).
Detta är en normal tom körning — rapporteras för att ingen körning ska sluta tyst."
  lib set status=empty_ok
  heartbeat "KLART (inga träffar). exit 0"
  exit 0
fi

heartbeat "Lager 1 gav $delta_n delta-poster. Går vidare till sållning."

# ---------------------------------------------------------------- budgethjälpare
check_budget() { # capUsd -> exit 2 + issue om spent >= cap
  local cap="$1" rc=0
  lib under-budget "$cap" || rc=$?
  if [[ $rc -eq 4 ]]; then lib set status=cost_parse_error; exit 4; fi
  if [[ $rc -ne 0 ]]; then
    heartbeat "Veckobudget nådd (\$$(lib get spent_usd) >= \$$cap). Ordnat stopp."
    file_issue "Bevakning: veckobudget \$$cap nådd — ordnat stopp" \
"Körningen stoppade på budgettaket efter \$$(lib get spent_usd). Delta fanns i .bevakning/delta.json.
Höj WEEKLY_BUDGET_USD (Niklas beslut) och kör om för att fortsätta."
    lib set status=budget_stop
    exit 2
  fi
}
is_semantic() { case "$1" in 2|3|6) return 0 ;; *) return 1 ;; esac; }
is_usage_limit() { # logfile stepStartEpoch
  local pat='rate.?limit|usage.?limit|429|overloaded|quota exceeded|credit'
  grep -qiE "$pat" "$1" 2>/dev/null && return 0
  local recent; recent="$(find "$BDIR" -maxdepth 1 -name 'step-*.json' -newermt "@$2" 2>/dev/null)"
  [[ -n "$recent" ]] && echo "$recent" | tr '\n' '\0' | xargs -0 grep -qiE "$pat" 2>/dev/null
}

run_model() { # role model tools budget promptfile outfile
  local role="$1" model="$2" tools="$3" budget="$4" prompt="$5" out="$6"
  check_budget "$WEEKLY_BUDGET_USD"
  check_budget "$budget"
  local head_before; head_before="$(git rev-parse HEAD)"   # GUARDRAIL 4
  local started; started="$(( $(date +%s) - 1 ))"
  local rc=0
  "$CLAUDE_BIN" -p "$(cat "$prompt")" \
    --model "$model" --allowedTools "$tools" --disallowedTools "Bash" \
    --output-format json > "$out" || rc=$?
  if [[ "$(git rev-parse HEAD)" != "$head_before" ]]; then
    heartbeat "FEL: $role ändrade git-historiken (HEAD $head_before -> $(git rev-parse HEAD))."
    file_issue "Bevakning: $role ändrade git-historiken" "HEAD flyttades under $role-anropet. Ordnat stopp."
    lib set status=git_tamper; exit 7
  fi
  if [[ $rc -ne 0 ]]; then
    if ! is_semantic "$rc" && is_usage_limit "$out" "$started"; then
      heartbeat "PERSISTENT usage-/rate-limit under $role — ordnat stopp."
      file_issue "Bevakning: usage-/rate-limit under $role — ordnat stopp" \
"$role-anropet slog i en usage-/rate-limit (exit $rc). Delta bevarat. Kör om när orsaken är åtgärdad."
      lib set status=usage_limit_stop; exit 9
    fi
    heartbeat "$role-anropet misslyckades (exit $rc). State bevarat — kör om för att återuppta."
    lib set status=interrupted; exit "$rc"
  fi
  local cost_rc=0; lib ingest 0 "$role" "$out" >/dev/null || cost_rc=$?
  if [[ $cost_rc -ne 0 ]]; then lib set status=cost_parse_error; exit 4; fi
}

# ---------------------------------------------------------------- LAGER 2 (Haiku)
heartbeat "Lager 2: Haiku sållar $delta_n poster (tak \$$SIFT_BUDGET_USD)"
run_model sift "$SIFT_MODEL" "$SIFT_TOOLS" "$SIFT_BUDGET_USD" scripts/bevakning-sift-prompt.md $BDIR/step-sift.json
lib result $BDIR/step-sift.json > $BDIR/sift.json
# Deterministisk gate: bara poster Haiku markerat "substantiell" går vidare.
subst_n="$(node scripts/bevakning-report.js gate-count 2>/dev/null || echo 0)"
heartbeat "Haiku behöll $subst_n substantiella fynd av $delta_n."

if [[ "$subst_n" -eq 0 ]]; then
  heartbeat "Inga substantiella fynd efter sållning. Rapporterar tomt."
  file_issue "Bevakning: inga substantiella fynd $(date +%Y-%m-%d)" \
"Lager 1 gav $delta_n delta-poster men Haiku-sållningen bedömde samtliga som brus (layout/ompublicering/orelaterad bevakning).
Kostnad: \$$(lib get spent_usd). Inget kräver granskning denna vecka."
  lib set status=empty_ok
  heartbeat "KLART (endast brus). exit 0"
  exit 0
fi

# ---------------------------------------------------------------- LAGER 3 (Sonnet)
heartbeat "Lager 3: Sonnet verifierar $subst_n fynd (tak \$$VERIFY_BUDGET_USD)"
run_model verify "$VERIFY_MODEL" "$VERIFY_TOOLS" "$VERIFY_BUDGET_USD" scripts/bevakning-verify-prompt.md $BDIR/step-verify.json
lib result $BDIR/step-verify.json > $BDIR/verify.json

# ---------------------------------------------------------------- RAPPORT + PR
# bevakning-report.js bygger tvåsektionsrapporten och ENFORCER neutralitetsregel
# 1 i kod: obekräftade mediaposter kan aldrig hamna som förslag, endast under
# "Kräver beslut". Grep-verifierar även varje citat mot hämtad källtext.
heartbeat "Bygger rapport (grep-verifierar citat, enforcar media=trigger)"
report_rc=0
node scripts/bevakning-report.js build > $BDIR/report-build.log 2>&1 || report_rc=$?
if [[ $report_rc -ne 0 ]]; then
  cat $BDIR/report-build.log
  file_issue "Bevakning: rapportbygget misslyckades" "Se $BDIR/report-build.log. Delta och modellsvar bevarade."
  lib set status=report_error; exit 1
fi

report="drafts/BEVAKNING-$(date +%Y-%m-%d).md"
cp $BDIR/report.md "$report"
snap_n="$(node -e "console.log((require('./'+process.env.BEVAKNING_DIR+'/report-meta.json').snapshots||[]).length)")"
prop_n="$(node -e "console.log(require('./'+process.env.BEVAKNING_DIR+'/report-meta.json').proposals)")"
beslut_n="$(node -e "console.log(require('./'+process.env.BEVAKNING_DIR+'/report-meta.json').krav_beslut)")"

git add "$report" sources/ 2>/dev/null || true
node scripts/bevakning-changelog.js "$prop_n" "$beslut_n" "$snap_n" "$(lib get spent_usd)"
git add docs/CHANGELOG.md
./commit.sh "bevakning $(date +%Y-%m-%d): $prop_n förslag, $beslut_n kräver beslut, $snap_n snapshot(ar) — \$$(lib get spent_usd)" \
  > $BDIR/commit.log 2>&1 || {
    cat $BDIR/commit.log
    file_issue "Bevakning: commit/push misslyckades" "Rapporten finns på disk ($report) men kunde inte pushas. Se $BDIR/commit.log."
    lib set status=commit_error; exit 1
  }

pr_url="$("$GH_BIN" pr create --base master --head "$REQUIRED_BRANCH" \
  --title "Bevakning $(date +%Y-%m-%d): $prop_n förslag, $beslut_n kräver beslut" \
  --body-file $BDIR/pr-body.md 2>&1 | tail -1)"
heartbeat "PR: $pr_url"
lib set status=delivered
heartbeat "KLART. $prop_n förslag, $beslut_n kräver beslut, $snap_n snapshot(ar), kostnad \$$(lib get spent_usd). exit 0"
exit 0
