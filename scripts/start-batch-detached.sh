#!/usr/bin/env bash
#
# start-batch-detached.sh — startar run-discourse-batch.sh FRIKOPPLAD från
# den anropande sessionen (Niklas beslut 2026-07-05, infrastrukturfix efter
# incidenten där batchprocessen dödades när förälderprocessen försvann).
#
# METOD (Windows/Git Bash — dokumenterad launchmetod för alla omstarter):
#   Primär: schtasks one-shot — batchen körs under Task Schedulers tjänst
#   (förälder = svchost, INTE den interaktiva sessionen). Överlever att
#   terminalen/harnessen dör. Loggen går till en STABIL fil:
#   .loop/batch-detached.log (ingen harness-task-fil finns för frikopplade
#   körningar — övervaka den filen med tail -f).
#
#   Fallback (om schtasks nekas): cmd.exe start /b — bryter ur anroparens
#   jobbobjekt i de flesta fall, men svagare garanti än schtasks.
#
# Användning:  bash scripts/start-batch-detached.sh
# Miljöövstyrningar (namngivna undantag, loggas av anroparen):
#   AREA_BUDGET_USD, TOTAL_BUDGET_USD, RETRY_BACKOFF_S skickas vidare.
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="$(pwd -W 2>/dev/null || pwd)"          # Windows-sökväg för cmd/schtasks
BASH_EXE="$(cygpath -w "$(command -v bash)" 2>/dev/null || echo 'C:\Program Files\Git\bin\bash.exe')"
LOG="$REPO/.loop/batch-detached.log"
mkdir -p .loop

ENVPASS=""
for v in AREA_BUDGET_USD TOTAL_BUDGET_USD RETRY_BACKOFF_S; do
  if [[ -n "${!v:-}" ]]; then ENVPASS="$ENVPASS export $v='${!v}';"; fi
done

INNER="cd '$REPO' && $ENVPASS bash scripts/run-discourse-batch.sh >> '$LOG' 2>&1"
TASKNAME="val26-discourse-batch"

echo "startar frikopplad batch (logg: $LOG)"
if schtasks //Create //TN "$TASKNAME" //TR "\"$BASH_EXE\" -lc \"$INNER\"" //SC ONCE //ST 00:00 //F >/dev/null 2>&1 \
   && schtasks //Run //TN "$TASKNAME" >/dev/null 2>&1; then
  echo "schtasks: startad som '$TASKNAME' under Task Scheduler (frikopplad)."
else
  echo "schtasks nekades — fallback: cmd start /b"
  cmd.exe //c start //b "" "$BASH_EXE" -lc "$INNER"
  echo "cmd start /b: startad (svagare frikoppling än schtasks)."
fi
echo "övervaka: tail -f $LOG"
