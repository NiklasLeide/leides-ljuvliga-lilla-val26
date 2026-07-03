#!/usr/bin/env bash
#
# discourse-quote-loop.sh — evaluator-optimizer loop (loop v2-mönstret) that
# builds sources/discourse/citat-ekonomi.json: 6-12 verbatim economy quotes
# per riksdag party, for the discourse pipeline (BRIEF_diskurspipeline.md,
# Steg A). Sister script to data-loop.sh — reuses scripts/loop-lib.js for
# state/cost/scope, with its own state file via LOOP_STATE_FILE.
#
# Writes ONLY sources/discourse/citat-ekonomi.json (enforced by
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
#
# Exit codes:
#   0  evaluator PASS (or DRY_RUN stop)
#   2  budget cap reached
#   3  wrong branch
#   4  fail-closed: cost/state could not be parsed
#   5  MAX_ITERS reached without PASS
#   6  scope-konflikt — kräver Niklas beslut
#
# Resumable: state lives in loop-state-discourse.json (gitignored).
# DRY_RUN=1 runs exactly one iteration then stops (state is kept).
# CLAUDE_BIN override exists only for the guard tests.
set -euo pipefail
cd "$(dirname "$0")/.."

readonly MAX_ITERS=8                 # GUARDRAIL 2: hard iteration cap
readonly BUDGET_USD="15.00"          # GUARDRAIL 3: hard budget cap (USD)
readonly REQUIRED_BRANCH="discourse-pipeline"
readonly WORKER_MODEL="claude-sonnet-4-6"
readonly EVAL_MODEL="claude-sonnet-4-6"
readonly WORKER_TOOLS="Read,Write,Edit,Grep,Glob,WebSearch,WebFetch"  # no Bash: worker cannot touch git
readonly EVAL_TOOLS="Read,WebFetch"  # Read for local PDF/snapshot sources, WebFetch for URLs

export LOOP_STATE_FILE="loop-state-discourse.json"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
DRY_RUN="${DRY_RUN:-0}"
export CLAUDE_CODE_SUBAGENT_MODEL="$WORKER_MODEL"

lib() { node scripts/loop-lib.js "$@"; }
mkdir -p .loop sources/discourse

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
  wfile=".loop/dq-worker-$i.json"
  wrc=0
  if [[ -z "$session" ]]; then
    "$CLAUDE_BIN" -p "$(cat scripts/discourse-quote-worker-prompt.md)" \
      --model "$WORKER_MODEL" \
      --allowedTools "$WORKER_TOOLS" \
      --output-format json > "$wfile" || wrc=$?
  else
    "$CLAUDE_BIN" -p "Granskningen underkände din senaste version av sources/discourse/citat-ekonomi.json. Åtgärda punkterna nedan. Samma regler som tidigare gäller: ordagranna citat, aldrig påhittade, riksdagsmaterial i basen, ändra endast citat-ekonomi.json.

$feedback" \
      --resume "$session" \
      --model "$WORKER_MODEL" \
      --allowedTools "$WORKER_TOOLS" \
      --output-format json > "$wfile" || wrc=$?
  fi
  if [[ $wrc -ne 0 ]]; then
    echo "Worker call failed (exit $wrc). State kept — re-run to resume at iteration $i."
    lib set status=interrupted
    exit "$wrc"
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
  efile=".loop/dq-eval-$i.json"
  erc=0
  "$CLAUDE_BIN" -p "$(cat scripts/discourse-quote-evaluator-prompt.md)" \
    --model "$EVAL_MODEL" \
    --allowedTools "$EVAL_TOOLS" \
    --output-format json > "$efile" || erc=$?
  if [[ $erc -ne 0 ]]; then
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
