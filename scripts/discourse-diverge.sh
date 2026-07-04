#!/usr/bin/env bash
#
# discourse-diverge.sh — Steg C i diskurspipelinen (BRIEF_diskurspipeline.md):
# ETT opus-anrop som jämför de två oberoende utkasten och skriver
# drafts/discourse-ekonomi-RAPPORT.md med sektionerna "Kräver Niklas beslut"
# och "Samstämmigt". Ingen loop; max ETT omförsök vid ogiltig rapport.
#
# Guardrails per CLAUDE.md "Agentloopar"/DEC-007 Strukturfynd 2:
# branchkrav, Read-only-verktyg, --disallowedTools Bash, HEAD-vakt i kod.
#
# Exit codes:
#   0  rapport giltig och skriven
#   3  wrong branch
#   7  call modified git history
#   8  ogiltig rapport efter omförsök
#
# CLAUDE_BIN override exists only for the guard tests.
set -euo pipefail
cd "$(dirname "$0")/.."

readonly REQUIRED_BRANCH="${LOOP_BRANCH:-discourse-pipeline}"
readonly PROMPT_FILE="scripts/discourse-diverge-prompt.md"
readonly MODEL="claude-opus-4-8"
readonly TOOLS="Read"

export DISCOURSE_AREA="${DISCOURSE_AREA:-ekonomi}"
if [[ ! -f "scripts/discourse-areas/$DISCOURSE_AREA.json" ]]; then
  echo "FEL: okänt område '$DISCOURSE_AREA'"; exit 1
fi
export LOOP_STATE_FILE="${LOOP_STATE_FILE:-loop-state-$DISCOURSE_AREA.json}"
LOOP_DIR=".loop/$DISCOURSE_AREA"
readonly OUT="drafts/discourse-$DISCOURSE_AREA-RAPPORT.md"

CLAUDE_BIN="${CLAUDE_BIN:-claude}"
export CLAUDE_CODE_DISABLE_1M_CONTEXT=1   # standardkontext, se quote-loop
mkdir -p "$LOOP_DIR" drafts
DIVERGE_PROMPT="$(node scripts/render-area-prompt.js "$PROMPT_FILE" "$DISCOURSE_AREA")"

if [[ "$(git branch --show-current)" != "$REQUIRED_BRANCH" ]]; then
  echo "FEL: aktuell branch är '$(git branch --show-current)', inte $REQUIRED_BRANCH. Avbryter."
  exit 3
fi
for f in "drafts/discourse-$DISCOURSE_AREA-sonnet.json" "drafts/discourse-$DISCOURSE_AREA-opus.json"; do
  if [[ ! -f "$f" ]]; then echo "FEL: $f saknas — kör Steg B först."; exit 1; fi
done

total_cost="0"
add_cost() { # responseFile
  total_cost="$(node -e "
const r = JSON.parse(require('fs').readFileSync('$1', 'utf8'));
const c = typeof r.total_cost_usd === 'number' ? r.total_cost_usd : 0;
console.log(($total_cost + c).toFixed(6));
")"
}

# validate_report <responseFile> <outFile>: extraction + structure checks
# live in scripts/validate-report.js (testable standalone, no inline quoting).
validate_report() {
  node scripts/validate-report.js "$1" "$2"
}

run_call() { # promptText [resumeSession]
  local rfile="$LOOP_DIR/diverge.json"
  local head_before; head_before="$(git rev-parse HEAD)"
  if [[ $# -eq 1 ]]; then
    "$CLAUDE_BIN" -p "$1" --model "$MODEL" --allowedTools "$TOOLS" \
      --disallowedTools "Bash" --output-format json > "$rfile"
  else
    "$CLAUDE_BIN" -p "$1" --resume "$2" --model "$MODEL" --allowedTools "$TOOLS" \
      --disallowedTools "Bash" --output-format json > "$rfile"
  fi
  if [[ "$(git rev-parse HEAD)" != "$head_before" ]]; then
    echo "FEL: divergensanropet har ändrat git-historiken. Avbryter."
    exit 7
  fi
  add_cost "$rfile"
}

echo "=== Steg C: divergensrapport ($MODEL) ==="
run_call "$DIVERGE_PROMPT"

vrc=0; verr="$(validate_report $LOOP_DIR/diverge.json "$OUT" 2>&1)" || vrc=$?
if [[ $vrc -ne 0 ]]; then
  echo "--- rapport ogiltig, ETT omförsök ---"
  printf '%s\n' "$verr"
  session="$(node scripts/loop-lib.js session $LOOP_DIR/diverge.json)"
  run_call "Din rapport kunde inte användas. Fel:

$verr

Svara igen med ENDAST rapportens fullständiga markdown enligt strukturen i ursprungsinstruktionen." "$session"
  vrc=0; verr="$(validate_report $LOOP_DIR/diverge.json "$OUT" 2>&1)" || vrc=$?
  if [[ $vrc -ne 0 ]]; then
    echo "FEL: rapporten ogiltig även efter omförsök:"
    printf '%s\n' "$verr"
    exit 8
  fi
fi

node scripts/loop-lib.js set "diverge_cost_usd=$total_cost"   # för batchens budgetkontroll
echo "=== Steg C klart. Kostnad: \$$total_cost ==="
echo "$OUT"
