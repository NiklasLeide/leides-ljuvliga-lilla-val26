# Project Status — leides-ljuvliga-lilla-val26

> **Last updated:** 2026-07-08
> **Current sprint:** Redesign 2026 — lens-based rebuild (Fas 0–6) ✅ klar, mergad till master
> **Sprint dates:** 2026-07-06 → 2026-07-08

---

## Current Sprint: Redesign 2026 — lins-baserad ombyggnad (Fas 0–6) ✅

Hela sajten återskapad ur den designgodkända omdesignen (handoff/-prototyperna) i den befintliga
vanilla-stacken, som en översättning — inte en nygenerering. Levererad som en PR per fas (#22–#27),
mergad i ordning. **Cutover klar (2026-07-08):** sajten bor nu i repo-roten (app/→rot-promotion);
gamla silos omdirigerar till motsvarande lins.

| Fas | Lins / yta | Status | PR | Notiser |
|-----|-----------|--------|----|---------|
| 0 | Skelett: shell, tokens, delad jämför-mekanik, nav-synk | ✅ Done | (tidigare) | constants.js, tokens.css, shell.css/js, compare-state.js, _shell.html + sync-shell.mjs |
| 1 | GAL-TAN-lins | ✅ Done | #22 | data/galtan-view.json; spår+ghost+intro-svep; **stat/annotering data-härledd (L störst drift, ej S)** |
| 2 | Position-lins | ✅ Done | #23 | bisvärm-kollision "3a", otydlig=streckad ring, citatkort; data/positions.json |
| 3 | Säger vs gör-lins | ✅ Done | #24 | trovärdighetsfix: synlig fördelning + framlyfta avvikelser; data/voting.json |
| 4 | Språk-lins | ✅ Done | #25 | Begrepp↔Parti, neutral GAL-Mitt-TAN-spektrum; städade discourse.json (v0.5.1) |
| 5 | Valkompass | ✅ Done | #26 | två-lins-matchning (metodik v1); **seed-set 10 frågor, full 42+8 = copy-pass** |
| 6 | Startsida + Om metoden + korslänkar + silo-retirering | ✅ Done | #27 | **cutover klar: app/→rot-promotion + silo-omdirigeringar (2026-07-08)** |

**Öppna beslut (kräver Niklas):**
1. ~~**Fas 1** — S:s "störst TAN-drift"-prosa vs koordinaterna~~ ✅ **LÖST 2026-07-08** — faktafel (ej copy-pass): prosan rättad, störst-etiketten flyttad till L (som koordinaterna ger). Stat var redan data-härledd korrekt.
2. **Fas 5** — full frågeuppsättning: ✅ **genererad, väntar din granskning** — 37 sakfrågor + 8 begrepp i PR #28 (branch `kompass-fragor-full`), 8 neutralitetsposter flaggade i drafts/KOMPASS-fragor-granskning.md. Mergas ej förrän du godkänt formuleringarna.
3. ~~**Fas 6** — full app/→rot-promotion + silo-omdirigering~~ ✅ **KLAR 2026-07-08** — sajten flyttad till rot, ../data→data, 4 silos (diskurs/hitta-parti/kluster/metod) omdirigerar; gamla gal-tan/sager-vs-gor/index överskrivna av nya linser.

Tidigare löpande spår (Diskurs-pilot 8.1, datauppdateringsloop 9.1) är kvar i historiken nedan; den
gamla flik-baserade sajten (spektrum/kluster/diskurs/hitta-parti/metod) är ersatt av de fem linserna.

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

Servera repo-roten (t.ex. `python -m http.server`) — linserna hämtar `data/*.json`, så `file://` blockeras. `./commit.sh` stager inte underkataloger (`css/`, `js/`, `scripts/`) automatiskt; `git add css/ js/` manuellt före commit.

- Site live at https://val26.leide.se — roten serverar nya lins-sajten direkt (ingen /app/-omdirigering längre)
- **Startsida** (`app/index.html`) — hero med statistik, Valkompass som primär ingång + fyra lins-dörrar med neutrala mini-förhandsvisningar, Om metoden-teaser
- **Fem linser** (nav "Din fråga", Valkompass först):
  - **Valkompass** (`app/valkompass.html`) — två-lins-matchning (Tycker/Tänker), 5-gradig skala, områdesviktning, två resultatgrafer, korslänk → Position/Språk, inga svar sparas. Motor i `app/js/valkompass.js`, frågor i `data/compass-questions.json` (seed 6+4)
  - **Position** (`app/position.html`) — frågespecifika 0–100-skalor, bisvärm-kollision, otydlig=streckad, citatkort; `data/positions.json`
  - **Säger vs gör** (`app/sager-vs-gor.html`) — fördelningsstapel + framlyfta avvikelser (Säger↔Gör); `data/voting.json`
  - **Språk** (`app/sprak.html`) — Begrepp↔Parti, neutral GAL-Mitt-TAN-spektrum, diskursprofiler; `data/discourse.json` v0.5.1
  - **GAL-TAN** (`app/gal-tan.html`) — scatter 2019–2026 med spår/ghost/intro-svep; `data/galtan-view.json`
- **Om metoden** (`app/om-metoden.html`) — neutralitetsprinciper, områdes-toner, datakällor, förbehåll, och kompassens formler öppet redovisade (glaslåda)
- **Delad jämför-mekanik** — CompareState (sessionStorage) speglar valda partier mellan linser
- **Delade moduler:** `app/js/constants.js` (VAL26: partier/områden/nav), `app/css/tokens.css` (SSOT-tokens), `app/css/shell.css` + `shell.js` (rail/nav/count-up/toner), nav-synk via `_shell.html` + `scripts/sync-shell.mjs --check`
- **Data:** 8 partier, 7 politikområden × 42 ämnen (positions.json), voting.json 336 entries (0 ej-granskat), discourse.json 20 flytande signifikanter, galtan-view.json CHES 2019/2024 + 2026 egen bedömning
- Neutralitet: endast partifärger mättade; axlar/linjaler/områdes-toner grå; otydligt märks; inga betygsgradienter
- Mobilvänlig (rail → drawer under 920px)

**Ersatt (gamla flik-sajten):** gamla `index.html`-SPA, `gal-tan.html`, `sager-vs-gor.html` överskrivna av de nya linserna (samma filnamn); `diskurs.html`→sprak, `hitta-parti.html`→valkompass, `kluster.html`→position, `metod.html`→om-metoden omdirigerar. Gamla assets (`app.js`, `style.css`, `diskurs.js`, `hitta-parti.js`, `kluster.js`) kvar i repot men orefererade — kan städas separat.

---

## Blockers

None.

---

## Sprint Backlog

### Sprint 7 — Polling trends ⏸️ Paused
*(See ROADMAP.md for full task breakdowns)*

---

## Key Metrics
- Renderas korrekt i Chrome/Firefox/Safari på desktop och 375px mobil
- Alla 8 partier synliga i alla 42 ämnen (7 areas)
- GAL-TAN: CHES 2019 + 2024 verifierade exakta värden, 2026 egna bedömningar
- voting.json: 336 entries, 0 ej-granskat
- Hover-tooltip visar korrekt partinamn och sammanfattning
- Klick på parti öppnar detaljpanel med källlänkar
