# Project Status — leides-ljuvliga-lilla-val26

> **Last updated:** 2026-04-01
> **Current sprint:** Sprint 0 – Setup
> **Sprint dates:** 2026-03-31 → TBD

---

## Current Sprint: Sprint 0 – Setup

| #   | Task                                              | Status      | Notes                                          |
|-----|---------------------------------------------------|-------------|------------------------------------------------|
| 0.1 | Create GitHub issue for spectrum view MVP         | ⬜ Todo     | gh CLI saknas — skapa manuellt på GitHub       |
| 0.2 | Log architectural decisions in DECISIONS.md       | ✅ Done     | DEC-001 – DEC-005 inloggade                    |
| 0.3 | Build spectrum view with placeholder data         | ✅ Done     | index.html + style.css + app.js + positions.json |
| 0.4 | Test desktop + 375px mobile                       | ⬜ Todo     | Kräver manuell test av användaren              |

**Status legend:** ⬜ Todo | 🔄 In Progress | ✅ Done | 🚫 Blocked | ⏸️ Paused

---

## What's Working Now

Öppna `index.html` direkt i webbläsaren — ingen server behövs.

- Spektrum-vy med 5 skolfrågor
- 8 partier positionerade på horisontella skalor
- Hover visar partiets ståndpunkt
- Mobilvänlig layout (375px+)
- Fliknavigering förberedd för kluster-vy

---

## Blockers

- Cloudflare Analytics token saknas — byt ut `REPLACE_WITH_CF_TOKEN` i index.html innan deploy.
- GitHub CLI (`gh`) inte installerat i bash-miljön — skapa issue manuellt.

---

## Sprint Backlog

### Sprint 1 — Cluster view
- [ ] 1.1 Build cluster view with animated groupings
- [ ] 1.2 Tab navigation between spectrum and cluster
- [ ] 1.3 Detail panel on click (party card with source)

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
