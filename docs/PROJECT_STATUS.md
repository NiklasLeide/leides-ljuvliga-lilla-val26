# Project Status — leides-ljuvliga-lilla-val26

> **Last updated:** 2026-04-06
> **Current sprint:** Sprint 7 – Polling trends
> **Sprint dates:** 2026-04-06 → TBD

---

## Current Sprint: Sprint 7 – Polling trends

| #   | Task                                          | Status  | Notes |
|-----|-----------------------------------------------|---------|-------|
| 7.1 | Aggregate polling data from major Swedish institutes | ⬜ Todo | |
| 7.2 | Weighted analysis showing trends              | ⬜ Todo | |
| 7.3 | Connect to GAL-TAN movement (if applicable)   | ⬜ Todo | |
| 7.4 | UI polish pass                                | ⬜ Todo | |

**Status legend:** ⬜ Todo | 🔄 In Progress | ✅ Done | 🚫 Blocked | ⏸️ Paused

---

## Completed Sprints

### Sprint 6 — GAL-TAN scale ✅

| #   | Task                                                         | Notes |
|-----|--------------------------------------------------------------|-------|
| 6.1 | GAL-TAN scatter plot view                                    | gal-tan.html + gal-tan.js, SVG scatter plot with quadrant shading |
| 6.2 | Data from Chapel Hill Expert Survey + own assessment         | galtan.json — CHES 2019 + 2024 verified exact values, 2026 own assessment |
| 6.3 | Movement trails since 2019 and 2024                          | Movement lines, year toggles, delta badges in detail panel |
| 6.4 | UI polish pass                                               | Mobile-responsive dot scaling, party selection with dimming, full trail clickable, year labels |

### Sprint 5 — "Says vs does" view ✅

| #   | Task                                                         | Notes |
|-----|--------------------------------------------------------------|-------|
| 5.1 | New view comparing stated positions with voting records      | sager-vs-gor.html + sager-vs-gor.js |
| 5.2 | Riksdag voting data integration                              | voting.json, 7 areas × 42 topics × 8 parties, zero ej-granskat |
| 5.3 | UI polish pass                                               | Match badges, inväntar-votering, per-fråga + per-parti toggle |

### Sprint 3 — Expand ✅

| #   | Task                                          | Notes |
|-----|-----------------------------------------------|-------|
| 3.1 | Add more policy areas beyond school           | 7 areas: skola, ekonomi, migration, försvar, klimat, vård, demokrati — 42 ämnen, 336 partipositioner |
| 3.2 | Polish, SEO, public launch                    | Privacy notice, open source footer, methodology page expanded |

### Sprint 2 — Real content ✅

| #   | Task                                                        | Notes |
|-----|-------------------------------------------------------------|-------|
| 2.1 | Research and fill in actual party positions for school topics | 5/5 school topics, 8 parties each, verified sources |
| 2.2 | Methodology page ("Om metoden")                             | metod.html — sources, scale, groups, unclear positions, neutrality |
| 2.3 | Source links and citation for every position                | All source fields have verifiable https:// URLs; clickable in detail panels |

### Sprint 1 — Cluster view ✅

| #   | Task                                              | Notes                                                              |
|-----|---------------------------------------------------|--------------------------------------------------------------------|
| 1.1 | Build cluster view with animated groupings        | kluster.html + kluster.js — SVG circles, dynamic groups per topic  |
| 1.2 | Tab navigation between spectrum and cluster       | Activated Kluster tab in index.html, navigates to kluster.html     |
| 1.3 | Detail panel on click (party card with source)    | Slides in from right (desktop), stacks below (mobile); clickable source links |

### Sprint 0 — Setup ✅
| #   | Task                                              | Notes                                            |
|-----|---------------------------------------------------|--------------------------------------------------|
| 0.1 | Create GitHub issue for spectrum view MVP         | Manuellt — gh CLI saknas                         |
| 0.2 | Log architectural decisions in DECISIONS.md       | DEC-001 – DEC-006 inloggade                      |
| 0.3 | Build spectrum view with placeholder data         | index.html + style.css + app.js + positions.json |
| 0.4 | Test desktop + 375px mobile                       | Manuellt verifierat av Niklas                    |

### Sprint 0.5 — Infrastructure ✅
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
- **5 vyer:** Spektrum, Kluster, Säger vs gör, GAL-TAN, Om metoden
- **7 politikområden:** skola (6 ämnen), ekonomi (7), migration (5), försvar (6), klimat (6), vård (6), demokrati (6) — totalt 42 ämnen, 336 partipositioner
- **GAL-TAN-vy** (gal-tan.html) — SVG scatter plot med rörelsestigar, klicka parti för att dimma övriga + visa detaljpanel med CHES-data
- **Säger vs gör-vy** (sager-vs-gor.html) — jämför partiernas löften med riksdagsvoteringar, per fråga och per parti
- **voting.json** med full täckning: 7 areas × alla topics × 8 partier = 336 entries, noll ej-granskat
- **Analystext** för alla 7 areas — visas som punktlista ovan innehållet i spektrum- och klustervyerna
- Spektrum-vy med horisontella skalor, hover-tooltip, klickbar detaljpanel med källlänkar
- Kluster-vy med animerade grupperingar, dynamiska grupper per fråga
- Mobilvänlig layout (375px+)
- Reformkarta design language (mörk header, DM Sans + Source Serif 4)

---

## Blockers

None.

---

## Sprint Backlog

### Sprint 7 — Polling trends
*(See ROADMAP.md for full task breakdowns)*

---

## Key Metrics
- Renderas korrekt i Chrome/Firefox/Safari på desktop och 375px mobil
- Alla 8 partier synliga i alla 42 ämnen (7 areas)
- GAL-TAN: CHES 2019 + 2024 verifierade exakta värden, 2026 egna bedömningar
- voting.json: 336 entries, 0 ej-granskat
- Hover-tooltip visar korrekt partinamn och sammanfattning
- Klick på parti öppnar detaljpanel med källlänkar
