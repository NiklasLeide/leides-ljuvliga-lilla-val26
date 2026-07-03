# leides-ljuvliga-lilla-val26

Neutral kunskapstjänst som sammanställer riksdagspartiernas ståndpunkter i sakfrågor. Inför valet 2026.

**Stack:** Vanilla HTML/CSS/JS, JSON data, GitHub Pages, Cloudflare
**Started:** 2026-03-31
**GitHub:** github.com/niklasleide/leides-ljuvliga-lilla-val26

## Session Start — ALWAYS do this first
0. If Stack or Commands say TBD or unfilled — stop and resolve before anything else.
1. Read `@docs/PROJECT_STATUS.md` — understand current state
2. Read `@docs/DECISIONS.md` — don't propose changes that contradict past decisions
3. Check `@docs/TROUBLESHOOTING.md` before proposing solutions to errors

These files ARE Claude's memory between sessions. Keep them accurate.

## Commands
```bash
# Open index.html directly in browser — no local server needed
# No test command — no test framework in use
./commit.sh "message"       # ALWAYS use this to commit — never bare git commit
```

## Commit Rule (non-negotiable)
**Always use `./commit.sh "message"` — never bare `git commit`.**
Before every commit, update:
- `docs/CHANGELOG.md` — always, for every code change
- `docs/PROJECT_STATUS.md` — if any task changed state
- `docs/DECISIONS.md` — if an architectural decision was made
- `docs/TROUBLESHOOTING.md` — if a bug was hit and fixed

## Agentloopar (non-negotiable)

Gäller alla evaluator-optimizer-loopar i projektet (`scripts/data-loop.sh`
och framtida varianter, se DEC-007):

- **Loopen committar aldrig per iteration.** All loopoutput samlas i
  arbetsträdet; en enda commit görs utanför loopen via `./commit.sh`,
  efter huvudtrådens slutgranskning av diffen. Loopen mergar aldrig —
  resultatet går som PR som Niklas granskar.
- **Validatorjusteringar mitt i körning endast som uttryckligen namngivna
  undantag, aldrig mönster.** Varje justering av validatorns regler under
  pågående körning (t.ex. utökad målpostlista eller ALLOWED_DIRTY) ska
  namnge exakt vilken post/fil som undantas, beslutas av Niklas och
  loggas i CHANGELOG. Generella uppmjukningar ("tillåt alla ändringar i
  området X") är förbjudna.
- **Guardrails ligger i loopskriptets kod — aldrig i hooks.** Hooks har
  bevisats opålitliga för enforcement (SessionStart, plugin v1.1.2).
  Iterationstak, budgettak, branch-kontroll och exitvillkor ska vara
  läsbara konstanter och kontroller i skriptet, verifierbara med
  `scripts/test-loop-guards.sh` utan API-kostnad.
- **All JSON-hantering och flyttalsaritmetik i node, aldrig bash.**
  Miljön är Git Bash (MINGW64) utan jq; bash klarar inte flyttal.
  Budgetackumulering, state-läsning och parsning går via
  `scripts/loop-lib.js`. Oparsbar kostnad eller state = fail-closed
  stopp (exit 4), aldrig fortsättning med spent=0.
- **Scope-konflikter eskaleras, itereras inte bort.** Om evaluatorn
  kräver en ändring som validatorn förbjuder (eller omvänt) ska loopen
  avsluta med en egen exitkod för mänskligt beslut — inte bränna
  iterationer på en konflikt den inte kan lösa själv. I kod: samma
  scope-avvisning två iterationer i rad avslutar loopen med exit 6
  ("scope-konflikt — kräver Niklas beslut"), se `scripts/data-loop.sh`
  och `scripts/loop-lib.js` (`scope-violations` / `check-scope-conflict`).
- **Källverifiering är 100 %, aldrig stickprov.** Evaluatorn
  WebFetch-verifierar `voted_url` för VARJE ändrad post och redovisar
  det i en maskinparsbar verifieringstabell (se
  `scripts/loop-evaluator-prompt.md`). En post utan bekräftad källa
  kan inte nå PASS och kan inte klassas som "Maskinverifierat" i
  PR-bodyn (`scripts/generate-pr-body.js`) — den hamnar under "Kräver
  ditt beslut" i stället, se DEC-007 villkor 2.

## Design System (if applicable)
If this project has a UI, create a design tokens file as single source of truth
for colours, typography, spacing. All components import from it — no hardcoded
values in component files.

## Data Migration (if applicable)
If this project stores data locally, use a schema version number from day one.
Every data structure change gets a migration. Bump schema version with every migration.

## Definition of Done (non-negotiable)
Before calling any feature or fix "done", complete ALL 5:
1. Code works — manually verify the happy path
2. Tests written — new functionality has test coverage
3. All existing tests pass — run the test command, zero failures
4. `docs/CHANGELOG.md` updated — one line per logical change
5. `./commit.sh "message"` run successfully — commit with docs included

Never say "done" until all 5 are complete.

## What Claude Gets Wrong on This Project
<!-- Update this as you discover patterns — highest-value section -->
- Forgets to update docs — enforced by commit.sh, but verify before committing
- Says "done" before verifying — always run tests/type-check before declaring done
- Burns tokens on planning when task is already scoped — just execute
- Creates giant files (>300 lines) — propose a split before implementing
- Drifts from visual specs over multiple sprints — use design tokens file as code
- Commits without verifying execution — after any code change, trace the full execution path before committing. If you can't run it in a browser, read through the code as if you were the browser.
