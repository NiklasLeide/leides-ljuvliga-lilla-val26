# Project Status — leides-ljuvliga-lilla-val26

> **Last updated:** 2026-04-01
> **Current sprint:** Sprint 1 – Cluster view
> **Sprint dates:** 2026-04-01 → TBD

---

## Current Sprint: Sprint 1 – Cluster view

| #   | Task                                              | Status      | Notes |
|-----|---------------------------------------------------|-------------|-------|
| 1.1 | Build cluster view with animated groupings        | ⬜ Todo     |       |
| 1.2 | Tab navigation between spectrum and cluster       | ⬜ Todo     |       |
| 1.3 | Detail panel on click (party card with source)    | ⬜ Todo     |       |

**Status legend:** ⬜ Todo | 🔄 In Progress | ✅ Done | 🚫 Blocked | ⏸️ Paused

---

## Completed Sprints

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
| 0.5.4 | Enable GitHub Pages on repo                             | Manual — Niklas                    |
| 0.5.5 | Configure Cloudflare DNS CNAME                          | Manual — Niklas                    |
| 0.5.6 | Add Cloudflare Web Analytics (token: set in index.html) | Manual — Niklas                    |
| 0.5.7 | Verify site is live at val26.leide.se                   | Pending 0.5.4–0.5.6                |

---

## What's Working Now

Open `index.html` directly in browser — no server needed.

- Spektrum-vy med 5 skolfrågor
- 8 partier positionerade på horisontella skalor
- Hover visar partiets ståndpunkt
- Mobilvänlig layout (375px+)
- Fliknavigering förberedd för kluster-vy
- Reformkarta design language (mörk header, DM Sans + Source Serif 4)

---

## Blockers

- 0.5.4–0.5.7 pending manual steps (GitHub Pages, Cloudflare DNS, verify live)

---

## Sprint Backlog

### Sprint 2 — Real content
- [ ] 2.1 Research and fill in actual party positions for school topics
- [ ] 2.2 Methodology page ("Om metoden")
- [ ] 2.3 Source links and citation for every position

### Sprint 3 — Expand
- [ ] 3.1 Add more policy areas beyond school
- [ ] 3.2 Polish, SEO, public launch before election Sept 2026

---

## Key Metrics
- Renderas korrekt i Chrome/Firefox/Safari på desktop och 375px mobil
- Alla 8 partier synliga i alla 5 ämnen
- Hover-tooltip visar korrekt partinamn och sammanfattning
