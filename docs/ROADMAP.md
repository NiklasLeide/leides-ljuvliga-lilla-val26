# Roadmap — leides-ljuvliga-lilla-val26

> Keep this honest. If something's not happening, move it to Deferred — don't leave it rotting in Next.
> **Format:** mål-baserat (per `/project:scope`). Öppet/framtida arbete = **mål**; klara sprintar bevarade under **Arkiv — klara sprintar**.

---

## Mål (mål-format)

> Full Outcome / Done-when / Budget / Depends on för varje mål finns i `docs/PROJECT_STATUS.md`.
> Här: en rad per mål med länk till definitionen. Sista Done-when för varje mål är alltid DoD-review.

| Mål | Outcome (kort) | Status | Budget |
|-----|----------------|--------|--------|
| **G1** Docs → mål-format | Status + Roadmap följer mål-konventionen; historik bevarad | 🔄 In Progress | 1 pass / 1 PR |
| **G2** Publik lansering | Sajten lanseringsklar inför valet sept 2026 (SEO, polish, trovärdighet) | 🔄 In Progress | Flera pass — bör splittas |
| **G3** Opinionstrender | Aggregerade opinionsmätningar + viktad trend, ev. kopplad till GAL-TAN | ⏸️ Paused | TBD — kräver scoping |
| **G4** SOM/CMP-validering | Positions-/GAL-TAN-data korsvaliderad mot SOM + CMP | ⬜ Backlog | TBD — kräver scoping |

- **G1** — Migrera docs till mål-format. → `docs/PROJECT_STATUS.md` (G1)
- **G2** — Publik lansering före valet (sept 2026). Ersätter gamla Sprint 3.2 "Polish, SEO, public launch". Bör splittas i SEO-/trovärdighets-/mobilpass via `/project:scope`; öppna poster i `docs/SITE_BACKLOG.md`. → `docs/PROJECT_STATUS.md` (G2)
- **G3** — Opinionstrender (polling). Ersätter gamla Sprint 7. Kräver egen `/project:scope` innan start. → `docs/PROJECT_STATUS.md` (G3)
- **G4** — SOM/CMP-datavalidering. Från backlog. Kräver egen `/project:scope` innan start. → `docs/PROJECT_STATUS.md` (G4)

> **Standing rule:** varje mål med UI-yta inkluderar en UI polish pass som Done-when-punkt.

---

## Deferred / Won't Do

- **React/Vite** — unnecessary complexity for a read-only static site; vanilla HTML is sufficient and more durable.
- **Party-centric view** (one page per party) — makes cross-party comparison harder; spectrum/cluster views serve this better.
- **Table/matrix view** — too dense, poor mobile UX.

---

## Arkiv — klara sprintar

> Bevarat **oförändrat** vid mål-format-migreringen (G1, 2026-07-17). Sprint-format.
> Öppna poster som fanns här (Sprint 3.2, Sprint 7, backlog SOM/CMP) är migrerade till mål G2/G3/G4 ovan.

### Sprint 0 — Setup ✅

- [x] 0.1 Create GitHub issue for spectrum view MVP *(manuellt — gh CLI saknas)*
- [x] 0.2 Log architectural decisions in DECISIONS.md
- [x] 0.3 Build spectrum view with placeholder data
- [x] 0.4 Test desktop + 375px mobile *(manuellt verifierat av Niklas)*

### Sprint 0.5 — Infrastructure ✅

- [x] 0.5.1 Add CNAME file (val26.leide.se)
- [x] 0.5.2 Create commit.sh (same pattern as reformkartan)
- [x] 0.5.3 Create deploy.sh (same pattern as reformkartan)
- [x] 0.5.4 Enable GitHub Pages on repo *(manual — Niklas)*
- [x] 0.5.5 Configure Cloudflare DNS CNAME *(manual — Cloudflare dashboard)*
- [x] 0.5.6 Add Cloudflare Web Analytics with separate site tag *(manual — Niklas)*
- [x] 0.5.7 Verify site is live at val26.leide.se

### Sprint 1 — Cluster view ✅

- [x] 1.1 Build cluster view with animated groupings *(kluster.html + kluster.js, dynamic groups)*
- [x] 1.2 Tab navigation between spectrum and cluster *(navigates to kluster.html)*
- [x] 1.3 Detail panel on click (party card with source) *(slides in desktop, stacks mobile)*

### Sprint 2 — Real content ✅

- [x] 2.1 Research and fill in actual party positions for school topics *(5/5 topics)*
- [x] 2.2 Methodology page ("Om metoden") *(metod.html, tab nav on all pages)*
- [x] 2.3 Source links and citation for every position *(5/5 topics complete)*

### Sprint 3 — Expand

- [x] 3.1 Add more policy areas beyond school *(ekonomi 7 ämnen, migration 5 ämnen, försvar 6 ämnen — full positions + voting data)*
- [ ] 3.2 Polish, SEO, public launch before election Sept 2026 🔄 → **migrerat till mål G2**

### Sprint 5 — "Says vs does" view ✅

- [x] 5.1 New view comparing stated positions (party programs) with voting records (riksdagen.se) *(sager-vs-gor.html + sager-vs-gor.js)*
- [x] 5.2 Riksdag voting data integration *(voting.json, 4 areas × 24 topics × 8 parties, zero ej-granskat)*
- [x] 5.3 UI polish pass *(match badges, inväntar-votering, per-fråga + per-parti toggle)*

### Sprint 6 — GAL-TAN scale ✅

- [x] 6.1 New view: GAL-TAN chart with party positions over time *(gal-tan.html + gal-tan.js, SVG scatter plot)*
- [x] 6.2 Data from Chapel Hill Expert Survey + own assessment *(galtan.json — CHES 2019 + 2024 verified, 2026 own assessment)*
- [x] 6.3 Show movement since 2019 and 2024 surveys *(movement lines, year toggles, delta badges in detail panel)*
- [x] 6.4 UI polish pass *(mobile-responsive dot scaling, party selection with dimming, full trail clickable, year labels)*

### Sprint 7 — Polling trends ⏸️ → **migrerat till mål G3**

- [ ] 7.1 Aggregate polling data from major Swedish institutes
- [ ] 7.2 Weighted analysis showing trends
- [ ] 7.3 Connect to GAL-TAN movement (if applicable)
- [ ] 7.4 UI polish pass

### Redesign 2026 — lins-baserad ombyggnad (Fas 0–6) ✅

Fas 0–6 mergade i ordning (PR #22–#27), cutover klar 2026-07-08 (app/→rot-promotion + silo-omdirigeringar). Full fasnedbrytning finns i `docs/PROJECT_STATUS.md` under Arkiv / Historik.

---

## Backlog / v2

- **SOM/CMP data validation** → **migrerat till mål G4**
