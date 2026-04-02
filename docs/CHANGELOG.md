# Changelog — leides-ljuvliga-lilla-val26

Format: `[YYYY-MM-DD] type: description`
Types: `feat` | `fix` | `refactor` | `docs` | `chore` | `perf`

---

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
