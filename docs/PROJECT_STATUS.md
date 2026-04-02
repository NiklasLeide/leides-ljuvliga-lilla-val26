# Project Status — leides-ljuvliga-lilla-val26

> **Last updated:** 2026-04-02
> **Current sprint:** Sprint 2 – Real content
> **Sprint dates:** 2026-04-01 → TBD

---

## Current Sprint: Sprint 2 – Real content

| #   | Task                                                        | Status  | Notes |
|-----|-------------------------------------------------------------|---------|-------|
| 2.1 | Research and fill in actual party positions for school topics | ✅ Done | 4 topics verified (vinstuttag, nationella-prov, tidiga-betyg, statlig-styrning); friskolor done prev session |
| 2.2 | Methodology page ("Om metoden")                             | ⬜ Todo |       |
| 2.3 | Source links and citation for every position                | 🔄 In Progress | 4/5 topics have URLs (vinstuttag, nationella-prov, tidiga-betyg, statlig-styrning). friskolor still has plain-text sources only. |

**Status legend:** ⬜ Todo | 🔄 In Progress | ✅ Done | 🚫 Blocked | ⏸️ Paused

---

## Completed Sprints

### Sprint 1 – Cluster view ✅

| #   | Task                                              | Notes                                                              |
|-----|---------------------------------------------------|--------------------------------------------------------------------|
| 1.1 | Build cluster view with animated groupings        | kluster.html + kluster.js — SVG circles, dynamic groups per topic  |
| 1.2 | Tab navigation between spectrum and cluster       | Activated Kluster tab in index.html, navigates to kluster.html     |
| 1.3 | Detail panel on click (party card with source)    | Slides in from right (desktop), stacks below (mobile); clickable source links |

### Sprint 0 – Setup ✅
| #   | Task                                              | Notes                                            |
|-----|---------------------------------------------------|--------------------------------------------------|
| 0.1 | Create GitHub issue for spectrum view MVP         | Manuellt — gh CLI saknas                         |
| 0.2 | Log architectural decisions in DECISIONS.md       | DEC-001 – DEC-006 inloggade                      |
| 0.3 | Build spectrum view with placeholder data         | index.html + style.css + app.js + positions.json |
| 0.4 | Test desktop + 375px mobile                       | Manuellt verifierat av Niklas                    |

### Sprint 0.5 – Infrastructure ✅
| #     | Task                                                    | Notes                              |
|-------|---------------------------------------------------------|------------------------------------|
| 0.5.1 | Add CNAME file (val26.leide.se)                         | ✅                                 |
| 0.5.2 | Create commit.sh                                        | ✅                                 |
| 0.5.3 | Create deploy.sh                                        | ✅                                 |
| 0.5.4 | Enable GitHub Pages on repo                             | ✅ Manual — Niklas                 |
| 0.5.5 | Configure Cloudflare DNS CNAME                          | ✅ Manual — Niklas                 |
| 0.5.6 | Add Cloudflare Web Analytics (token: set in index.html) | ✅ Manual — Niklas                 |
| 0.5.7 | Verify site is live at val26.leide.se                   | ✅ Live at val26.leide.se          |

---

## What's Working Now

Open `index.html` directly in browser — no server needed.

- Site live at https://val26.leide.se
- Spektrum-vy med 5 skolfrågor — alla med verifierade partipositioner; 4/5 med klickbara källlänkar (friskolor saknar URLs)
- 8 partier positionerade på horisontella skalor
- Hover visar partiets ståndpunkt (tooltip)
- Klick på parti-dot öppnar detaljpanel med sammanfattning + klickbara källlänkar
- Kluster-vy med animerade grupperingar (dynamiska grupper per fråga)
- Detaljpanel vid klick på parti i kluster — sammanfattning, klickbar källa, metodnotering
- Fliknavigering mellan Spektrum och Kluster
- Mobilvänlig layout (375px+)
- Reformkarta design language (mörk header, DM Sans + Source Serif 4)

---

## Blockers

None.

---

## Sprint Backlog

### Sprint 3 — Expand
- [ ] 3.1 Add more policy areas beyond school
- [ ] 3.2 Polish, SEO, public launch before election Sept 2026

### Sprint 4 — TBD

### Sprint 5 — GAL-TAN scale
### Sprint 6 — "Says vs does" view
### Sprint 7 — Polling trends

*(See ROADMAP.md for full task breakdowns)*

---

## Key Metrics
- Renderas korrekt i Chrome/Firefox/Safari på desktop och 375px mobil
- Alla 8 partier synliga i alla 5 ämnen
- Hover-tooltip visar korrekt partinamn och sammanfattning
- Klick på parti-dot öppnar detaljpanel med klickbara källlänkar (4/5 topics)
- Kluster-vy visar dynamiska grupper med korrekt antal partier per grupp
