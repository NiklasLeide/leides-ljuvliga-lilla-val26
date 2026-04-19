# Changelog — leides-ljuvliga-lilla-val26

Format: `[YYYY-MM-DD] type: description`
Types: `feat` | `fix` | `refactor` | `docs` | `chore` | `perf`

---

[2026-04-19] chore: migrate to project@niklas-marketplace plugin — .claude/settings.json declares plugin, delete per-project .claude/commands/ (now provided by plugin v1.0.2)
[2026-04-05] refactor: area analysis — convert prose strings to bullet arrays (2–4 bullets per area) in positions.json; render as <ul>/<li> in spectrum + cluster views; update CSS for list indent
[2026-04-06] data: positions.json — update keyTopics to final selections (ekonomi: eu-ekonomi/infrastruktur; migration: arbetskraftsinvandring; forsvar: nato/forsvarsindustri; vard: aldreomsorg; demokrati: grundlag)
[2026-04-06] docs: metod.html — update #fragor with new intro text + area/topic dl list; update score table markers; add #matchning section explaining weighted calculation
[2026-04-06] feat: hitta-parti — "Hur väljs frågorna?" link in left nav → metod.html#fragor; metod.html new section with differentiation scores (std dev) per topic as collapsible <details> table, selected topics marked
[2026-04-06] fix: hitta-parti — neutral slider track (no fill); key topics only (3 per area from positions.json keyTopics); remove datalist elements
[2026-04-06] data: positions.json — add keyTopics array to each area (placeholder: 3 most party-differentiating topics per area)
[2026-04-06] feat: hitta-parti — full redesign as wizard flow; step indicator + progress bar in left nav; one question per screen with area chip, counter, serif title, step=10 slider; skip excludes from calc; live results in right column (mobile: collapsible); done screen with transparency note + reset; mobile results toggle via left nav button
[2026-04-06] feat: new view "Hitta ditt parti" (hitta-parti.html + hitta-parti.js) — weighted voting advice app with 3-step left nav (area checkboxes, weight sliders, topic sliders), real-time party match bars (uses positions.json), per-area detail panel with direction indicators; tab added to all 6 pages
[2026-04-06] feat: Sprint 3.2 polish — OG meta tags + improved titles on all 5 pages; V26 SVG favicon; mobile: tab nav scrollable, GAL-TAN year toggles horizontal, gt-svg overflow:visible; remove placeholder-data badge
[2026-04-06] docs: reprioritise — pause Sprint 7 (polling), activate Sprint 3.2 (polish/SEO/launch)
[2026-04-06] docs: close Sprint 6 (GAL-TAN) in ROADMAP + PROJECT_STATUS; open Sprint 7 (polling trends); update What's Working Now and metrics
[2026-04-05] fix: remove active highlight from GAL-TAN party nav buttons — detail panel is sufficient feedback
[2026-04-05] fix: GAL-TAN left-nav party buttons now select (dim others + show trail) instead of toggling visibility; remove hiddenParties; button shows active border when selected
[2026-04-05] feat: GAL-TAN party selection — click dims others (opacity 0.15), equal-size trail dots with year labels, prominent solid movement line; entire trail clickable; SVG background click deselects; selected party always shows all 3 years
[2026-04-05] fix: cross-view consistency audit — gal-tan.json 5 color mismatches fixed (V/MP/C/KD/SD), gt-party-btn aligned to 36×36px/11px matching svs-party-btn, gal-tan.js panel HTML standardised (span/aria-label/event listener)
[2026-04-05] fix: gal-tan.js — scale dot radii with container width (ref 560px desktop); add resize re-render; fixes overlap on 375px mobile
[2026-04-05] data: galtan.json — verified CHES 2024 exact values for all 8 Swedish parties (country=16); set estimated:false; 2019 values already exact from prior verification; 2026 values remain own assessment (estimated:true)
[2026-04-05] data: galtan.json — add annotated GAL-TAN data file with lrecon/galtan CHES field names, estimated flags, per-party motivations (2026), and full citation
[2026-04-05] feat: GAL-TAN view (gal-tan.html + gal-tan.js) — scatter plot with economic left-right (x) and GAL-TAN (y) axes, three years (2018/2022/2026), movement lines, year/party filters, detail panel; placeholder data in data/gal-tan.json
[2026-04-05] feat: add GAL-TAN tab to all page navs (index, kluster, sager-vs-gor, metod)
[2026-04-05] data: add demokrati area — 6 topics (public-service, domstolar, yttrandefrihet, eu-demokrati, civilsamhalle, grundlag), 96 total entries across positions + voting; zero ej-granskat, zero inväntar-votering; all stämmer; SD enda partiet emot grundlagsreformen (KU2)
[2026-04-04] data: add vard area — 6 topics (vardkoer, primarvard, aldreomsorg, psykisk-halsa, valfrihet-vard, personal), 96 total entries across positions + voting; zero ej-granskat, zero inväntar-votering, all stämmer
[2026-04-02] data: add klimat area — 6 topics (karnkraft, fossila-branslen, klimatmal, fornybart, elpriser, klimatanpassning), 96 total entries across positions.json + voting.json; one delvis (S/karnkraft); zero ej-granskat
[2026-04-02] data: voting.json — added ekonomi area (7 topics, 56 party entries: skatt-arbete, valfard-finansiering, arbetsmarknad, bostader, eu-ekonomi, pension, infrastruktur)
[2026-04-02] docs: session update — mark 3.1 and Sprint 5 done; update What's Working Now with 4 areas + Säger vs gör; update metrics
[2026-04-02] data: positions.json — add area summaries for skola, ekonomi, migration; verify forsvar summary; all 4 areas complete
[2026-04-02] data: forsvar area — add Försvar & säkerhet with 6 topics (nato, forsvarsbudget, varnplikt, forsvarsindustri, civil-beredskap, ukraina) to positions.json and voting.json; 96 total entries, zero ej-granskat
[2026-04-02] data: voting.json migration — add migration area (5 topics, 40 party entries): asylpolitik, arbetskraftsinvandring, medborgarskap, integration, uppehallstillstand; zero ej-granskat entries
[2026-04-02] data: voting.json ekonomi — replaced ej-granskat with EU-nämnds- och utskottsdata: MP/arbetsmarknad (AU10 res. 4), S+C/eu-ekonomi (EU-nämnden protokoll 29), KD/eu-ekonomi (FaktaPM FPM33); zero ej-granskat remaining
[2026-04-02] data: voting.json skola — replace ej-granskat with reservation data from UbU7/UbU8; add inväntar-votering for Tidöpartier on nationella-prov/tidiga-betyg (Prop. 2025/26:197 lagd ej omröstad), SD statlig-styrning; stammer for V/C/digitalisering-skolan + C/vinstuttag
[2026-04-02] feat: sager-vs-gor — add inväntar-votering match badge (light blue); add .badge-invantar to style.css
[2026-04-02] data: voting.json v2 — school area complete (6 topics, 48 party entries); restructured to nested data[area][topic][party]; sager-vs-gor.js updated to match new schema
[2026-04-02] docs: RESEARCH_AGENT.md — section 5 now includes instructions for per-area analysis summary (2–3 neutral sentences on dividing lines, displayed as site intro context)
[2026-04-02] feat: area analysis text — "analysis" field on each area in positions.json, rendered as muted intro paragraph above content in spectrum and cluster views; placeholder text for all 3 areas
[2026-04-02] data: add migration area with 5 topics (asylpolitik, arbetskraftsinvandring, medborgarskap, integration, uppehallstillstand) — 40 verified positions with source URLs
[2026-04-02] docs: RESEARCH_AGENT.md — add "Säger vs gör — datainsamling" section (says/promises/voted fields, match ratings, riksdag voting sources, Claude Code prompt format)
[2026-04-02] feat: add "Öppen källkod på GitHub" to privacy notice on metod.html and footer one-liner on all pages
[2026-04-02] feat: privacy notice — Integritet section on metod.html#integritet; footer one-liner "Ingen personlig data samlas in" with anchor link on all pages
[2026-04-02] feat: Säger vs gör view (sager-vs-gor.html + sager-vs-gor.js) — per-fråga/per-parti toggle, promise cards with Säger/Lovar/Röstat rows + match badges; placeholder data for friskolor + nationella-prov; new tab in all page navs
[2026-04-02] fix: header + tab-nav fixed at top — .top-bar wrapper on all pages, body flex-column overflow:hidden, main flex:1, each column overflow-y:auto; app.js scroll listener moved from window to .app-center
[2026-04-02] feat: three-column layout for spectrum and cluster views — sticky left nav, sticky right panel, cluster group zones with animation
[2026-04-02] feat: add school topic digitalisering-skolan — 8 parties, 3 groups (Digital strategi behövs/Balanserad hållning/Begränsa skärmar), 2 unclear
[2026-04-02] fix: vinstuttag — swap M→85 and SD→82 to reflect M's longer-held position
[2026-04-02] feat: add 4 more economics topics (bostader, eu-ekonomi, pension, infrastruktur) — 32 verified positions with source URLs
[2026-04-02] feat: add ekonomi area with 3 topics (skatt-arbete, valfard-finansiering, arbetsmarknad) — 24 verified positions with source URLs
[2026-04-02] fix: metod.html — "kontakta mig" links to LinkedIn instead of mailto, opens in new tab
[2026-04-02] fix: formatSource() — render description text as link instead of raw URL; format "Title, URL" → <a>Title</a> in both app.js and kluster.js
[2026-04-02] feat: metod.html — add Valrörelseuttspel section explaining verification of campaign statements
[2026-04-02] docs: RESEARCH_AGENT.md — expand Primärkällor with valmanifest, medieutspel, partiledarutfrågningar; add valrörelse-utspel caveat under Särskild vaksamhet
[2026-04-02] docs: swap sprint order — "Says vs does" promoted to Sprint 5, GAL-TAN moved to Sprint 6 (stronger voter USP)
[2026-04-02] fix: kluster group labels — remove text-transform:capitalize (was rendering "Vänster/Mitten/Höger"), increase font-size to 13px, darken fill to --ink
[2026-04-02] fix: spectrum dot size 28→32px, font 10→12px — abbreviation text now clearly readable at a glance
[2026-04-02] docs: close Sprint 2, open Sprint 3 in PROJECT_STATUS and ROADMAP
[2026-04-02] data: friskolor source URLs added — all 8 parties now have verifiable https:// sources (5/5 topics complete)
[2026-04-02] feat: metod.html — methodology page explaining sources, scale, groups, unclear positions, neutrality
[2026-04-02] feat: add "Om metoden" tab to all pages (index.html, kluster.html); wire navigation in app.js and kluster.js
[2026-04-02] docs: ROADMAP.md — add sprints 5 (GAL-TAN), 6 (says vs does), 7 (polling trends); standing UI polish rule
[2026-04-02] data: added clickable source URLs for all 4 school topics (vinstuttag, nationella-prov, tidiga-betyg, statlig-styrning) — 32 source fields updated with verifiable URLs
[2026-04-01] feat: clickable source links in detail panels — URLs in source strings render as <a> tags; spectrum view gets click-to-open detail panel
[2026-04-01] docs: RESEARCH_AGENT.md — require verifiable URL for every source; positions without URL not accepted
[2026-04-01] feat: verified positions for statlig-styrning — 8 parties, 4 groups (Kommunalt/Delat/Ökad statlig/Statligt huvudmannaskap), sources 2015–2025
[2026-04-01] feat: verified positions for tidiga-betyg — 8 parties, 3 groups (Senare betyg/Betyg från åk 6/Tidiga kunskapskontroller), sources 2010–2026
[2026-04-01] feat: verified positions for nationella-prov — 8 parties, 3 groups (Stärk lärarprofessionen/Likvärdig bedömning/Centralt rättade prov), sources 2021–2026
[2026-04-01] feat: verified positions for vinstuttag — 8 parties, 3 groups (Förbjud/Villkorad/Värna), sources 2021–2026
[2026-04-01] feat: verified positions for friskolor — 8 parties, 5 descriptive groups, sources from 2025–2026
[2026-04-01] refactor: kluster.js — dynamic group layout, supports any number of named groups (not hardcoded vänster/mitten/höger)
[2026-04-01] docs: add RESEARCH_AGENT.md — research workflow, source hierarchy, neutrality rules, role split
[2026-04-01] docs: PROJECT_STATUS.md — close Sprint 1, open Sprint 2
[2026-04-01] feat: activate Kluster tab in index.html — navigates to kluster.html
[2026-04-01] feat: kluster detail panel — click a party circle to show name, stance, source, methodology note, and unclear badge; panel slides in on desktop, stacks on mobile
[2026-04-01] refactor: extract kluster.js from kluster.html (file was >300 lines)
[2026-04-01] feat: add kluster.html — cluster view with SVG party circles, topic selector buttons, and animated groupings by vänster/mitten/höger
[2026-04-01] chore: commit.sh — broaden JS staging from app.js to *.js
[2026-04-01] chore: commit.sh — broaden HTML staging from index.html to *.html
[2026-04-01] docs: PROJECT_STATUS.md — close Sprint 0 + 0.5, open Sprint 1
[2026-04-01] docs: log DEC-006 — design language aligned to reformkarta
[2026-04-01] feat: apply reformkartan design language — dark header with header-badge, aligned CSS tokens (--ink/--bg/--card/--border/--muted), full-width tab nav, footer, extended font weights
[2026-04-01] chore: set Cloudflare Web Analytics token in index.html
[2026-04-01] chore: add CNAME (val26.leide.se), rewrite commit.sh for project structure, add deploy.sh
[2026-04-01] docs: add Sprint 0.5 infrastructure tasks to ROADMAP.md
[2026-04-01] docs: update ROADMAP.md with full sprint plan (sprint 0–3 + backlog)
[2026-04-01] feat: MVP spectrum view — index.html, style.css, app.js, data/positions.json (8 partier, 5 skolfrågor, hover-tooltip, tab-nav för kluster)
[2026-03-31] chore: set tech stack — Vanilla HTML/CSS/JS, JSON data, GitHub Pages, Cloudflare
[2026-03-31] chore: project initialized via starter kit
