# Project Status — leides-ljuvliga-lilla-val26

> **Last updated:** 2026-04-01
> **Current sprint:** Sprint 1 – Spektrum-MVP
> **Sprint dates:** 2026-04-01 → TBD

---

## Current Sprint: Sprint 1 – Spektrum-MVP

| #   | Task                                      | Status  | Notes                              |
|-----|-------------------------------------------|---------|------------------------------------|
| 1.1 | data/positions.json — 8 partier, 5 ämnen  | ✅ Done  | Placeholder-data, skolfrågor       |
| 1.2 | Spektrum-vy med horisontella skalor       | ✅ Done  | index.html + style.css + app.js    |
| 1.3 | Hover-tooltip visar ståndpunkt            | ✅ Done  |                                    |
| 1.4 | Fliknavigering förberedd för kluster-vy   | ✅ Done  | Kluster-tab disabled med "snart"   |
| 1.5 | Design: DM Sans + Source Serif 4 + tokens | ✅ Done  |                                    |
| 1.6 | Cloudflare Web Analytics snippet          | ✅ Done  | Token är placeholder — byt ut      |
| 1.7 | Testad på desktop + 375px mobil           | ⬜ Todo  | Kräver manuell test av användaren  |
| 1.8 | Skapa GitHub-issue för sprint 1           | ⬜ Todo  | gh CLI saknas — gör manuellt       |

**Status legend:** ⬜ Todo | 🔄 In Progress | ✅ Done | 🚫 Blocked | ⏸️ Paused

---

## Completed: Sprint 0 – Setup

| #   | Task                        | Status  |
|-----|-----------------------------|---------|
| 0.1 | Definiera stack             | ✅ Done  |
| 0.2 | Initiera projekt-docs       | ✅ Done  |

---

## What's Working Now

Öppna `index.html` direkt i webbläsaren — ingen server behövs.

- Spektrum-vy med 5 skolfrågor
- 8 partier positionerade på horisontella skalor
- Hover visar partiets ståndpunkt
- Mobilvänlig layout (375px+)

---

## Blockers
- Cloudflare Analytics token saknas — byt ut `REPLACE_WITH_CF_TOKEN` i index.html innan deploy.
- GitHub CLI (`gh`) inte installerat i bash-miljön — skapa issue manuellt på GitHub.

---

## Sprint Backlog

### Sprint 2 – Verkliga data
- [ ] Ersätt placeholder-positioner med verkliga källhänvisningar
- [ ] Fler ämnesområden (t.ex. bostäder, migration, klimat)

### Sprint 3 – Kluster-vy
- [ ] Implementera kluster-vyn (partilikhet över alla ämnen)

### Later / Stretch
- [ ] v2: verifiera uttalade positioner mot riksdagsomröstningar

---

## Key Metrics
- Renderas korrekt i Chrome/Firefox/Safari på desktop och 375px mobil
- Alla 8 partier synliga i alla 5 ämnen
- Hover-tooltip visar korrekt partinamn och sammanfattning
