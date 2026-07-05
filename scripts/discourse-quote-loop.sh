#!/usr/bin/env bash
#
# discourse-quote-loop.sh — evaluator-optimizer loop (loop v2-mönstret) that
# builds sources/discourse/citat-<DISCOURSE_AREA>.json: 6-12 verbatim quotes
# per riksdag party, for the discourse pipeline (BRIEF_diskurspipeline.md,
# Steg A). Area comes from DISCOURSE_AREA (default ekonomi); prompts are
# rendered from templates + scripts/discourse-areas/<area>.json. Sister
# script to data-loop.sh — reuses scripts/loop-lib.js for state/cost/scope.
#
# Writes ONLY sources/discourse/citat-<area>.json (enforced by
# scripts/validate-citat.js). NEVER touches data/discourse.json (DEC-007
# villkor 1: tolkningsdata kräver Niklas godkännande i chatten).
#
# Guardrails (all enforced in code, none in prompts):
#   1. Binary exit condition: validate-citat.js exits 0 AND evaluator says PASS
#   2. Iteration cap:  MAX_ITERS, hardcoded below
#   3. Budget cap:     BUDGET_USD, checked BEFORE every API call, fail-closed
#   4. Sandbox:        refuses to run off branch discourse-pipeline; never commits
#   5. Human checkpoint: commit + STOPP A-rapport happen outside this script
#   6. Scope-conflict escalation: same validator scope-violation two
#      iterations in a row exits 6 for a human decision
#   7. Git-history guard: HEAD captured before each worker call and
#      verified after — tool lists are config, not enforcement
#
# Exit codes:
#   0  evaluator PASS (or DRY_RUN stop)
#   2  budget cap reached
#   3  wrong branch
#   4  fail-closed: cost/state could not be parsed
#   5  MAX_ITERS reached without PASS
#   6  scope-konflikt — kräver Niklas beslut
#   7  worker modified git history
#
# Resumable: state lives in loop-state-discourse.json (gitignored).
# DRY_RUN=1 runs exactly one iteration then stops (state is kept).
# CLAUDE_BIN override exists only for the guard tests.
set -euo pipefail
cd "$(dirname "$0")/.."

readonly MAX_ITERS=8                 # GUARDRAIL 2: hard iteration cap
readonly BUDGET_USD="${LOOP_BUDGET_USD:-15.00}"   # GUARDRAIL 3: hard budget cap (USD)
readonly REQUIRED_BRANCH="${LOOP_BRANCH:-discourse-pipeline}"
readonly WORKER_MODEL="claude-sonnet-4-6"
readonly EVAL_MODEL="claude-sonnet-4-6"
readonly WORKER_TOOLS="Read,Write,Edit,Grep,Glob,WebSearch,WebFetch"  # no Bash: worker cannot touch git
readonly EVAL_TOOLS="Read,WebFetch"  # Read for local PDF/snapshot sources, WebFetch for URLs

# Area-parametrized (diskursbatchen): DISCOURSE_AREA styr målfil, prompts
# (renderade ur områdeskonfig), statefil och .loop-underkatalog.
export DISCOURSE_AREA="${DISCOURSE_AREA:-ekonomi}"
if [[ ! -f "scripts/discourse-areas/$DISCOURSE_AREA.json" ]]; then
  echo "FEL: okänt område '$DISCOURSE_AREA' (ingen scripts/discourse-areas/$DISCOURSE_AREA.json)"
  exit 1
fi
export LOOP_STATE_FILE="${LOOP_STATE_FILE:-loop-state-$DISCOURSE_AREA.json}"
LOOP_DIR=".loop/$DISCOURSE_AREA"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
DRY_RUN="${DRY_RUN:-0}"
export CLAUDE_CODE_SUBAGENT_MODEL="$WORKER_MODEL"
# Standardkontext-pinning (Niklas 2026-07-04): inga usage credits — 1M-auto-
# uppgradering ska aldrig försökas (incident: 429 "Usage credits required").
export CLAUDE_CODE_DISABLE_1M_CONTEXT=1

lib() { node scripts/loop-lib.js "$@"; }
mkdir -p "$LOOP_DIR" sources/discourse

# Fail-closed prompt-rendering INNAN första API-anropet
WORKER_PROMPT="$(node scripts/render-area-prompt.js scripts/discourse-quote-worker-prompt.md "$DISCOURSE_AREA")"
EVAL_PROMPT="$(node scripts/render-area-prompt.js scripts/discourse-quote-evaluator-prompt.md "$DISCOURSE_AREA")"

status="$(lib get status)"
if [[ "$status" == "passed" ]]; then
  echo "Loop already passed. Delete $LOOP_STATE_FILE to run again."
  exit 0
fi
start_iter="$(lib get next_iteration)"
session="$(lib get worker_session_id)"
feedback="$(lib get last_verdict)"
echo "Start: iteration $start_iter/$MAX_ITERS, spent so far: \$$(lib get spent_usd)"

for ((i = start_iter; i <= MAX_ITERS; i++)); do

  # GUARDRAIL 3: budget — checked BEFORE the next API call. Fail-closed.
  rc=0; lib under-budget "$BUDGET_USD" || rc=$?
  if [[ $rc -eq 4 ]]; then lib set status=cost_parse_error; exit 4; fi
  if [[ $rc -ne 0 ]]; then
    echo "Budget cap reached (\$$(lib get spent_usd) >= \$$BUDGET_USD). Stopping."
    lib set status=budget_stop
    exit 2
  fi

  # GUARDRAIL 4: sandbox — verified before every iteration that writes
  if [[ "$(git branch --show-current)" != "$REQUIRED_BRANCH" ]]; then
    echo "FEL: aktuell branch är '$(git branch --show-current)', inte $REQUIRED_BRANCH. Avbryter."
    exit 3
  fi

  echo "=== Iteration $i/$MAX_ITERS (spent \$$(lib get spent_usd)) ==="

  # --- WORKER: Sonnet, resumable session so it remembers earlier rounds ---
  # GUARDRAIL 7: tool lists are configuration, not enforcement — verify in
  # code that the worker did not touch git history (incident 2026-07-04:
  # false-PASS commits from inside this loop via inherited
  # settings.local.json allowlist).
  head_before="$(git rev-parse HEAD)"
  wfile="$LOOP_DIR/dq-worker-$i.json"
  wrc=0
  if [[ -z "$session" ]]; then
    "$CLAUDE_BIN" -p "$WORKER_PROMPT" \
      --model "$WORKER_MODEL" \
      --allowedTools "$WORKER_TOOLS" \
      --disallowedTools "Bash" \
      --output-format json > "$wfile" || wrc=$?
  else
    "$CLAUDE_BIN" -p "Granskningen underkände din senaste version av sources/discourse/citat-$DISCOURSE_AREA.json. Åtgärda punkterna nedan. Samma regler som tidigare gäller: ordagranna citat, aldrig påhittade, riksdagsmaterial i basen, ändra endast citat-$DISCOURSE_AREA.json.

$feedback" \
      --resume "$session" \
      --model "$WORKER_MODEL" \
      --allowedTools "$WORKER_TOOLS" \
      --disallowedTools "Bash" \
      --output-format json > "$wfile" || wrc=$?
  fi
  if [[ $wrc -ne 0 ]]; then
    # Best-effort kostnadsingest även för misslyckade anrop — ett failat
    # anrop kostar ändå (incident 2026-07-04: $1.40 för 429-anrop som
    # aldrig bokfördes). Parsefel ignoreras här (anropet är redan felat).
    lib ingest "$i" worker-failed "$wfile" >/dev/null 2>&1 || true
    echo "Worker call failed (exit $wrc). State kept — re-run to resume at iteration $i."
    lib set status=interrupted
    exit "$wrc"
  fi
  if [[ "$(git rev-parse HEAD)" != "$head_before" ]]; then
    echo "FEL: workern har ändrat git-historiken (HEAD $head_before -> $(git rev-parse HEAD)). Avbryter."
    lib set status=worker_git_tamper
    exit 7
  fi
  rc=0; lib ingest "$i" worker "$wfile" >/dev/null || rc=$?   # fail-closed cost parse
  if [[ $rc -ne 0 ]]; then lib set status=cost_parse_error; exit 4; fi
  new_session="$(lib session "$wfile")"
  if [[ -n "$new_session" ]]; then session="$new_session"; fi

  # --- EXIT CONDITION part 1: schema/scope validation (node, zero tokens) ---
  val_rc=0
  val_out="$(node scripts/validate-citat.js 2>&1)" || val_rc=$?
  if [[ $val_rc -ne 0 ]]; then
    echo "--- validation FAILED ---"
    printf '%s\n' "$val_out"

    # GUARDRAIL 6: same scope-violation two iterations in a row -> escalate
    scope_keys="$(printf '%s\n' "$val_out" | lib scope-violations)"
    conflict_rc=0
    printf '%s\n' "$scope_keys" | lib check-scope-conflict || conflict_rc=$?
    if [[ $conflict_rc -eq 0 ]]; then
      echo "Scope-konflikt: samma fil avvisas av validatorn två iterationer i rad:"
      printf '%s\n' "$scope_keys"
      lib set status=scope_conflict
      exit 6
    fi

    feedback="Schemavalideringen misslyckades. Åtgärda exakt dessa punkter:
$val_out"
    lib set "next_iteration=$((i + 1))" "worker_session_id=$session" "last_verdict=$feedback" status=running
    if [[ "$DRY_RUN" == "1" ]]; then echo "DRY_RUN: stopping after one iteration."; exit 0; fi
    continue
  fi
  lib reset-scope-conflict >/dev/null
  echo "--- validation ok ---"

  # --- EXIT CONDITION part 2: evaluator (FRESH Sonnet session every round,
  #     own instructions — judge is never the worker) ---
  efile="$LOOP_DIR/dq-eval-$i.json"
  erc=0
  "$CLAUDE_BIN" -p "$EVAL_PROMPT" \
    --model "$EVAL_MODEL" \
    --allowedTools "$EVAL_TOOLS" \
    --disallowedTools "Bash" \
    --output-format json > "$efile" || erc=$?
  if [[ $erc -ne 0 ]]; then
    lib ingest "$i" evaluator-failed "$efile" >/dev/null 2>&1 || true
    echo "Evaluator call failed (exit $erc). State kept — re-run to resume at iteration $i."
    lib set "worker_session_id=$session" status=interrupted
    exit "$erc"
  fi
  rc=0; lib ingest "$i" evaluator "$efile" >/dev/null || rc=$?
  if [[ $rc -ne 0 ]]; then lib set status=cost_parse_error; exit 4; fi

  verdict="$(lib result "$efile")"
  echo "--- evaluator ---"
  printf '%s\n' "$verdict"

  first_line="${verdict%%$'\n'*}"
  if [[ "$first_line" =~ ^[^A-Za-zÅÄÖåäö]*PASS ]]; then
    lib set status=passed "next_iteration=$((i + 1))" "worker_session_id=$session" last_verdict=PASS
    echo "=== PASS på iteration $i. Total kostnad: \$$(lib get spent_usd) ==="
    echo "Nästa steg (utanför loopen): STOPP A — katalogstatistik till Niklas i chatten."
    exit 0
  fi

  feedback="$verdict"
  lib set "next_iteration=$((i + 1))" "worker_session_id=$session" "last_verdict=$feedback" status=running
  if [[ "$DRY_RUN" == "1" ]]; then echo "DRY_RUN: stopping after one iteration."; exit 0; fi
done

echo "MAX_ITERS=$MAX_ITERS nått utan PASS. Senaste utlåtande finns i $LOOP_STATE_FILE."
lib set status=max_iters
exit 5
