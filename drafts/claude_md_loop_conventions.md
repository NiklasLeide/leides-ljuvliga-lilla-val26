# UTKAST — sektion för CLAUDE.md

> Placering: eget avsnitt i projektets CLAUDE.md, t.ex. efter "Commit Rule".
> Detta är ett utkast — CLAUDE.md ändras först efter Niklas beslut.

---

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
  iterationer på en konflikt den inte kan lösa själv.
