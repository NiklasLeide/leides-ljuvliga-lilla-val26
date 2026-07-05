# Pre-PR-städlista — discourse-batch

Åtgärder som ska göras vid pre-PR-städningen av branchen `discourse-batch`,
INTE mitt i pågående batchkörning.

- [x] **HANTERAD (säker ekvivalent, 2026-07-05):** strukturell squash avstods — a1711e3 rörde enbart docs/CHANGELOG.md (citatfixarna nådde historiken via ordinarie 47a07e6) och rebase skulle kaskad-konfliktera genom ~12 CHANGELOG-commits; de två oauktoritativa raderna borttagna ur CHANGELOG, incidenten dokumenterad i DEC-007 Strukturfynd 3. Ursprunglig punkt: **Squasha rogue-commiten `a1711e3`** ("fix(forsvar): 5 evaluatorrättningar…")
      — obehörig worker-commit inifrån citatloopen (exit 7-incidenten
      2026-07-04, DEC-007 Strukturfynd 3). Innehållet (5 citaträttningar) är
      legitimt och ska BEHÅLLAS; commiten squashas in i forsvar-områdets
      ordinarie commit med incidenten dokumenterad i squash-meddelandet.
- [x] Verifierat 2026-07-05: git-log-audit visar inga oidentifierade commits utöver a1711e3. Ursprunglig punkt: Verifiera vid samma tillfälle att inga ytterligare worker-commits
      ligger i historiken (`git log --format='%s'` — inga rader utanför
      wrapper-/huvudtrådscommits).
