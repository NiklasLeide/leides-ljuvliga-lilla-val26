# Project Status — leides-ljuvliga-lilla-val26

> **Last updated:** 2026-04-05
> **Current sprint:** Sprint 3 – Expand
> **Sprint dates:** 2026-04-02 → TBD

---

## Current Sprint: Sprint 3 – Expand

| #   | Task                                          | Status  | Notes |
|-----|-----------------------------------------------|---------|-------|
| 3.1 | Add more policy areas beyond school           | ✅ Done | 4 areas: skola, ekonomi, migration, forsvar. Full positions + voting data, zero ej-granskat. |
| 3.2 | Polish, SEO, public launch before Sept 2026   | ⬜ Todo |       |

**Status legend:** ⬜ Todo | 🔄 In Progress | ✅ Done | 🚫 Blocked | ⏸️ Paused

---

## Completed Sprints

### Sprint 2 – Real content ✅

| #   | Task                                                        | Notes |
|-----|-------------------------------------------------------------|-------|
| 2.1 | Research and fill in actual party positions for school topics | 5/5 school topics, 8 parties each, verified sources |
| 2.2 | Methodology page ("Om metoden")                             | metod.html — sources, scale, groups, unclear positions, neutrality |
| 2.3 | Source links and citation for every position                | All 40 source fields have verifiable https:// URLs; clickable in detail panels |

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
- **7 politikområden:** skola (6 ämnen), ekonomi (7), migration (5), försvar (6), klimat (6), vård (6), demokrati (6) — totalt 42 ämnen, 336 partipositioner
- **Säger vs gör-vy** (sager-vs-gor.html) — jämför partiernas löften med riksdagsvoteringar, per fråga och per parti
- **voting.json** med full täckning: 7 areas × alla topics × 8 partier = 336 entries, noll ej-granskat
- **Match-badges:** stammer (grön), delvis (gul), avviker (röd), inväntar-votering (blå), ej-granskat (grå)
- **Analystext** för alla 4 areas — visas som intro ovan innehållet i spektrum- och klustervyerna
- Spektrum-vy med horisontella skalor, hover-tooltip, klickbar detaljpanel med källlänkar
- Kluster-vy med animerade grupperingar, dynamiska grupper per fråga
- Fliknavigering mellan Spektrum, Kluster, Säger vs gör, Om metoden
- Sticky header + tre-kolumnslayout med scroll per kolumn
- Integritetssida (metod.html#integritet) + footer-länk på alla sidor
- Öppen källkod på GitHub — länk i integritetssektionen
- Mobilvänlig layout (375px+)
- Reformkarta design language (mörk header, DM Sans + Source Serif 4)

---

## Blockers

None.

---

## Sprint Backlog

### Sprint 4 — TBD
### Sprint 5 — GAL-TAN scale
### Sprint 6 — "Says vs does" view
### Sprint 7 — Polling trends

*(See ROADMAP.md for full task breakdowns)*

---

## Key Metrics
- Renderas korrekt i Chrome/Firefox/Safari på desktop och 375px mobil
- Alla 8 partier synliga i alla 24 ämnen (4 areas)
- Hover-tooltip visar korrekt partinamn och sammanfattning
- Klick på parti-dot öppnar detaljpanel med klickbara källlänkar
- Kluster-vy visar dynamiska grupper med korrekt antal partier per grupp
- voting.json: 336 entries, 0 ej-granskat, match-fördelning synlig i Säger vs gör
