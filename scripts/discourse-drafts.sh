#!/usr/bin/env bash
#
# discourse-drafts.sh — Steg B i diskurspipelinen (BRIEF_diskurspipeline.md):
# två STRIKT OBEROENDE utkast av samma prompt, en per modell. Ingen loop —
# konvergens är inte målet, oberoende är.
#
#   Utkast 1: claude-sonnet-4-6  -> drafts/discourse-ekonomi-sonnet.json
#   Utkast 2: claude-opus-4-8    -> drafts/discourse-ekonomi-opus.json
#
# Oberoende säkras genom: färsk session per modell, identisk prompt
# (scripts/discourse-draft-prompt.md), och att utkasten skrivs till drafts/
# FÖRST när båda anropen är klara — modell 2 kan inte råka läsa modell 1:s
# resultat via Read.
#
# Tak: ett anrop per modell, max ETT omförsök vid ogiltig JSON (resume med
# felmeddelandet). Guardrails per CLAUDE.md "Agentloopar"/DEC-007
# Strukturfynd 2: branchkrav, --disallowedTools Bash, HEAD-vakt i kod.
#
# Exit codes:
#   0  båda utkasten giltiga och skrivna
#   3  wrong branch
#   7  worker modified git history
#   8  ogiltigt utkast efter omförsök
#
# CLAUDE_BIN override exists only for the guard tests.
set -euo pipefail
cd "$(dirname "$0")/.."

readonly REQUIRED_BRANCH="discourse-pipeline"
readonly PROMPT_FILE="scripts/discourse-draft-prompt.md"
readonly DRAFT_TOOLS="Read"   # inga skrivverktyg: svaret ÄR utkastet

CLAUDE_BIN="${CLAUDE_BIN:-claude}"
mkdir -p .loop drafts

if [[ "$(git branch --show-current)" != "$REQUIRED_BRANCH" ]]; then
  echo "FEL: aktuell branch är '$(git branch --show-current)', inte $REQUIRED_BRANCH. Avbryter."
  exit 3
fi

total_cost="0"
add_cost() { # responseFile
  total_cost="$(node -e "
const r = JSON.parse(require('fs').readFileSync('$1', 'utf8'));
const c = typeof r.total_cost_usd === 'number' ? r.total_cost_usd : 0;
console.log(($total_cost + c).toFixed(6));
")"
}

run_draft() { # tag model
  local tag="$1" model="$2"
  local rfile=".loop/draft-$tag.json"
  local tmpout=".loop/draft-$tag-validated.json"

  echo "=== Utkast ($tag): $model ==="
  # GUARDRAIL: HEAD-vakt — toollistor är konfiguration, inte enforcement.
  local head_before; head_before="$(git rev-parse HEAD)"

  "$CLAUDE_BIN" -p "$(cat "$PROMPT_FILE")" \
    --model "$model" \
    --allowedTools "$DRAFT_TOOLS" \
    --disallowedTools "Bash" \
    --output-format json > "$rfile"

  if [[ "$(git rev-parse HEAD)" != "$head_before" ]]; then
    echo "FEL: utkastanropet ($tag) har ändrat git-historiken. Avbryter."
    exit 7
  fi
  add_cost "$rfile"

  local vrc=0 verr
  verr="$(node scripts/validate-draft.js "$rfile" "$tmpout" 2>&1)" || vrc=$?
  if [[ $vrc -ne 0 ]]; then
    echo "--- utkast ($tag) ogiltigt, ETT omförsök ---"
    printf '%s\n' "$verr"
    local session; session="$(node scripts/loop-lib.js session "$rfile")"
    head_before="$(git rev-parse HEAD)"
    "$CLAUDE_BIN" -p "Ditt svar kunde inte användas. Fel:

$verr

Svara igen med ENBART giltig JSON enligt schemat i ursprungsinstruktionen — ingen övrig text, inga markdown-staket." \
      --resume "$session" \
      --model "$model" \
      --allowedTools "$DRAFT_TOOLS" \
      --disallowedTools "Bash" \
      --output-format json > "$rfile"
    if [[ "$(git rev-parse HEAD)" != "$head_before" ]]; then
      echo "FEL: utkastanropet ($tag, omförsök) har ändrat git-historiken. Avbryter."
      exit 7
    fi
    add_cost "$rfile"
    vrc=0
    verr="$(node scripts/validate-draft.js "$rfile" "$tmpout" 2>&1)" || vrc=$?
    if [[ $vrc -ne 0 ]]; then
      echo "FEL: utkast ($tag) ogiltigt även efter omförsök:"
      printf '%s\n' "$verr"
      exit 8
    fi
  fi
  echo "utkast ($tag) giltigt. Ackumulerad kostnad: \$$total_cost"
}

run_draft sonnet claude-sonnet-4-6
run_draft opus  claude-opus-4-8

# Båda giltiga — publicera till drafts/ först nu (oberoendegaranti).
mv .loop/draft-sonnet-validated.json drafts/discourse-ekonomi-sonnet.json
mv .loop/draft-opus-validated.json  drafts/discourse-ekonomi-opus.json
echo "=== Steg B klart. Total kostnad: \$$total_cost ==="
echo "drafts/discourse-ekonomi-sonnet.json + drafts/discourse-ekonomi-opus.json"
