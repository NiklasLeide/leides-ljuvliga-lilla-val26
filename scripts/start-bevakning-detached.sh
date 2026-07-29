#!/usr/bin/env bash
#
# start-bevakning-detached.sh — startar bevakning-loop.sh FRIKOPPLAD från den
# anropande sessionen. Samma metod som start-batch-detached.sh (Niklas beslut
# 2026-07-05): en loop som barn till en interaktiv session har dödats när
# förälderprocessen försvann. Frikopplad = förälder är Task Scheduler-tjänsten
# (svchost), inte claude/terminalen.
#
# VERIFIERING (acceptanskrav): den frikopplade körningens förälder-PID är INTE
# claude-processen. Task Scheduler kör under svchost. Fallback cmd start /b
# bryter ur anroparens jobbobjekt i de flesta fall.
#
# Användning:
#   Engångskörning nu:        bash scripts/start-bevakning-detached.sh
#   Veckoschema (söndag 04:00): bash scripts/start-bevakning-detached.sh --weekly
#   Övervaka:                 tail -f .bevakning/detached.log
#   Inspektera state:         cat .bevakning/state.json ; cat .bevakning/loop-state.json
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="$(pwd -W 2>/dev/null || pwd)"
BASH_EXE="$(cygpath -w "$(command -v bash)" 2>/dev/null || echo 'C:\Program Files\Git\bin\bash.exe')"
LOG="$REPO/.bevakning/detached.log"
mkdir -p .bevakning

INNER="cd '$REPO' && bash scripts/bevakning-loop.sh >> '$LOG' 2>&1"

if [[ "${1:-}" == "--weekly" ]]; then
  TASKNAME="val26-bevakning-weekly"
  echo "schemalägger veckovis (söndag 04:00) som '$TASKNAME'"
  if schtasks //Create //TN "$TASKNAME" //TR "\"$BASH_EXE\" -lc \"$INNER\"" //SC WEEKLY //D SUN //ST 04:00 //F >/dev/null 2>&1; then
    echo "schtasks: veckoschema skapat. Kör 'schtasks //Run //TN $TASKNAME' för att testa nu."
  else
    echo "FEL: schtasks nekades — kan inte schemalägga. Kör manuellt via --now eller cron."
    exit 1
  fi
  exit 0
fi

TASKNAME="val26-bevakning-once"
echo "startar frikopplad bevakningskörning (logg: $LOG)"
if schtasks //Create //TN "$TASKNAME" //TR "\"$BASH_EXE\" -lc \"$INNER\"" //SC ONCE //ST 00:00 //F >/dev/null 2>&1 \
   && schtasks //Run //TN "$TASKNAME" >/dev/null 2>&1; then
  echo "schtasks: startad som '$TASKNAME' under Task Scheduler (frikopplad, förälder = svchost)."
else
  echo "schtasks nekades — fallback: cmd start /b"
  cmd.exe //c start //b "" "$BASH_EXE" -lc "$INNER"
  echo "cmd start /b: startad (svagare frikoppling än schtasks)."
fi
echo "övervaka: tail -f $LOG"
