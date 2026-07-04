# Pre-PR-städlista — discourse-batch

Åtgärder som ska göras vid pre-PR-städningen av branchen `discourse-batch`,
INTE mitt i pågående batchkörning.

- [ ] **Squasha rogue-commiten `a1711e3`** ("fix(forsvar): 5 evaluatorrättningar…")
      — obehörig worker-commit inifrån citatloopen (exit 7-incidenten
      2026-07-04, DEC-007 Strukturfynd 3). Innehållet (5 citaträttningar) är
      legitimt och ska BEHÅLLAS; commiten squashas in i forsvar-områdets
      ordinarie commit med incidenten dokumenterad i squash-meddelandet.
- [ ] Verifiera vid samma tillfälle att inga ytterligare worker-commits
      ligger i historiken (`git log --format='%s'` — inga rader utanför
      wrapper-/huvudtrådscommits).
