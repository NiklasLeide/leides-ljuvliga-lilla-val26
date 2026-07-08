# Claude Code brief — Full redesign build (val26.leide.se)

Comprehensive build brief: recreate the complete Design-approved redesign in the
vanilla stack. This is TRANSLATION, not generation — the design is final and
high-fidelity, the data exists, the architecture is settled. Build the whole
site; deliver as per-phase PRs.

## References (all in the repo)
- `ARKITEKTUR_not.md` — whole-frame architecture. Read first.
- `VALKOMPASS_metodik_v1.md` — compass methodology (governs Phase 5).
- `handoff/` — the Design bundle (`.dc.html` files + `README.md` +
  `design-tokens.md` + `support.js`). Open `.dc.html` in a browser to view;
  RECREATE in vanilla HTML/CSS/JS, do not copy the `x-dc` format. All prototype
  styling is inline so every measurement reads directly. Fidelity is high —
  colours, type, spacing, copy, interactions are final; use Swedish copy verbatim.
  The `*- riktningar.dc.html` files are exploration canvases — rationale only, do
  NOT implement.
- Data (read the real files; do not assume schema): `data/gal-tan.json`,
  `data/positions.json`, `data/voting.json`, `data/discourse.json`.

## Global rules (every phase)
- **Branch discipline:** never push to master. Each phase = its own branch + PR.
  Do not merge; Niklas merges per PR after review.
- **Neutrality (hard):** colour never values a position. Only official party
  colours are saturated; axes/rulers/area-tones are neutral greys. No
  green=good/red=bad gradient anywhere.
- **Copy verbatim** from the Design files. The copy-pass (telegram-style → voter
  prose, jargon, the "du tycker/du tänker" → "dina svar liknar" softening) is a
  SEPARATE later spår — do not rewrite copy now.
- **Recreate `x-dc` in vanilla.** Keep the self-contained-files stack. Note the
  known trap: nav/token changes touch ALL pages — factor the shell so this is
  maintainable (shared JS/CSS module or a documented single-edit point), don't
  silently duplicate.
- **Tabular-nums** for all data values; micro-labels uppercase per tokens.
- **Data values live in JSON**, never hardcoded in components (CLAUDE.md rule).
- Run `commit.sh` with a CHANGELOG entry per phase (it blocks otherwise).
- After each phase: commit + checkpoint so context doesn't accumulate across the
  whole build. If context fills, stop at a phase boundary and report.

## Dependency order (critical)
- Phases 4 (Språk) and 5 (Valkompass) build on the **neutrality-cleaned**
  `discourse.json`. Ensure the neutrality-cleaning PR is merged before those
  phases. If it is not yet merged, build Phases 0–3 and 6-partial first and do
  4–5 last.
- Phase 5 (Valkompass) uses the FULL question set — up to 42 position questions +
  all qualifying concept questions per the methodology — NOT the prototype's 10.

---

## PHASE 0 — Foundation (shell + tokens + shared mechanics)

The skeleton every lens uses.

- **Left-rail nav "Din fråga"**, five lens questions in this order (kompass
  first) + "Om metoden":
  1. Vilket parti ligger närmast dig? — VALKOMPASS
  2. Var står partierna i sakfrågorna? — POSITION
  3. Håller orden när det blir votering? — SÄGER VS GÖR
  4. Vad menar de egentligen med orden? — SPRÅK
  5. Vart är partierna på väg? — GAL-TAN
- **Real navigation:** each lens is its own page + own URL, linked with real
  `<a>`; `<link rel="canonical">` on every page.
- **Responsive:** rail collapses to hamburger + slide-in below ~920px. Fix the
  tablet gap so 481–1024px is not a broken desktop layout.
- **Area-tone system:** per-area background tone `oklch(0.95 0.02 <hue>)` —
  identical lightness + chroma, hue varies, no tone "wins" — carried across
  lenses. Area-less lenses (GAL-TAN) render neutrally toned.
- **Tokens in `:root`** from `design-tokens.md` / README's evolved table as SSOT;
  tokenise the 8 party colours + status pastels (currently hardcoded).
- **Shared compare mechanic** (built once, consumed by every lens): party-chip
  row + clickable graph nodes that MIRROR each other (click node → chip lights;
  press chip → node highlights); selecting parties highlights them, dims the
  rest; "Rensa" clears. **Build as shared state that persists across lens
  switches** — a party selected in one lens stays selected when switching lens.
- **Shared constants module:** party colours/names/order, area labels — one
  source consumed everywhere.

Acceptance: every page loads at its own URL with real `<a>` nav + canonical;
back/forward + mid-click-new-tab work; rail collapses <920px; tokens + area-tones
in `:root`; party colours/pastels tokenised; compare-state module exists and is
shared. Old site still works (coexists until Phase 6 retires it).

---

## PHASE 1 — GAL-TAN lens (`gal-tan.json`)

Recreate `GAL-TAN - vy i full skala.dc.html`.
- Neutral scatter: vertical GAL↔TAN, horizontal economic left↔right; grey rulers,
  only party colours saturated.
- Three time points/party (2019, 2024 CHES-verified; 2026 own estimate). Solid
  node = current; 2019/2024 faded with connecting trails; year toggle.
- Compare mechanic (from Phase 0). Stat trio. On selection: show the party's 2026
  motivation text.

Acceptance: 8 parties at correct coords, trails + year toggle work, compare
highlights/dims in sync both ways, no saturated colour on axis/ruler/background.

---

## PHASE 2 — Position lens (`positions.json`)

Recreate `Position - vy i full skala.dc.html`.
- Each question = a 0–100 scale with named endpoints (question-specific, not
  generic left-right). Party nodes on the scale.
- `unclear:true` renders as dashed ring + reduced tone (never hidden/guessed).
- Area tabs (all 8 areas). Compare → citation cards under each scale for selected
  parties. Stat trio.

Acceptance: all areas + questions from data; unclear-marking correct; compare
shows citation cards; scales are question-specific.

---

## PHASE 3 — Säger vs gör lens (`voting.json`)

Recreate `Säger vs gör - vy i full skala.dc.html`. **Carries the credibility
fix.**
- Visible distribution bar per area: stämmer / delvis / inväntar votering, with
  counts.
- Method note explaining why "stämmer" dominates (governing parties vote their
  own policy / selection effect).
- **Deviations lifted forward:** the delvis / inväntar cases shown prominently
  with their says-vs-does explanation (this is where accountability lives — do
  not bury them in green). Real cases carry rich "voted" text.
- Area tabs, compare mechanic, stat trio.

Acceptance: distribution bar + method note present; deviations surfaced with
explanations, not buried; three status colours describe congruence only, never
political direction.

---

## PHASE 4 — Språk lens (`discourse.json`, CLEANED — see dependency)

Recreate `Språk - vy i full skala.dc.html`.
- **Begrepp ↔ Parti toggle.** Begrepp mode: pick a concept → all parties'
  meanings side by side, with a neutral GAL↔TAN spectrum (grey ruler, party
  colours only) showing how each party loads the word. Parti mode: a party's full
  discourse profile with sources.
- Concept selection is a first-class entry (the signifiers are the site's most
  unique content). Coverage note per concept ("N of 8 parties use the word —
  absence is shown, not filled in").
- Area/concept navigation; compare mechanic where applicable.

Acceptance: both modes work; concept spectrum is neutral; coverage/absence shown
honestly; built on the neutrality-cleaned data.

---

## PHASE 5 — Valkompass (`positions.json` + cleaned `discourse.json`)

Recreate `Valkompassen - vy i full skala.dc.html` per `VALKOMPASS_metodik_v1.md`.
The methodology governs; the design shows the expression.
- **Two independent lenses, two separate result graphs, never one combined
  "winner":** "Tycker som du" (position questions → positions.json) and "Tänker
  som du" (concept questions → discourse.json meanings).
- **Full question set** — up to 42 position questions covering all 8 areas +ALL
  qualifying concept questions (concepts with ≥6 parties AND ≥3 distinct
  loadings). NOT the prototype's 10. This matters: too few concept questions puts
  many parties at 0% in the Tänker graph.
- **5-point scale** for position questions; concept questions offer meaning-
  options that mirror the discourse `innebord` fields (verbatim, not rewritten).
- **"Vet inte / hoppa över"** excludes a question entirely from scoring (both
  lenses).
- **Area weighting** (8 sliders) after the questions — multiplies the Tycker
  formula; concept questions are not area-weighted.
- **Matching math** per methodology (exact formulas are in the Om metoden compass
  section — implement them as written): Tycker = 100 − weighted mean distance
  over answered questions; Tänker = shared-meaning concepts / answered concepts
  where the party uses the word × 100 (denominator excludes concepts the party
  doesn't use).
- **0% presentation:** show as "ingen överlappning på dessa begrepp", not as a
  verdict.
- **Results link into Position / Språk** with top parties pre-selected.
- **Share:** image or link, storing NO answers (link carries only the graphs).
  Drop the prototype's "prototyp:" clause in production; keep privacy + openness
  copy.
- **Glaslåda:** the Om metoden compass section (Phase 6) documents every formula.

Acceptance: two graphs, no combined winner; full question set (not 10); skip
excluded from scoring; area weighting affects only Tycker; formulas match the
methodology; 0% framed as no-overlap; share stores nothing; results cross-link.

---

## PHASE 6 — Startsida + Om metoden + weave + retire

- **Startsida** (`Startsida.dc.html`): overview + lens cards with preview
  visualisations + stat trio.
- **Om metoden** (`Om metoden.dc.html` + `Om metoden - kompassavsnittet.dc.html`):
  neutrality principles, area-tone explanation, data sources, limits/förbehåll,
  and the full "Hur valkompassen räknar" section with formulas.
- **Cross-links** between lenses per topic/party.
- **Retire old silo pages** — remove/redirect the old tabs now their content
  lives in the new structure. Verify no dead links.

Acceptance: startsida + full Om metoden live; cross-links work; old silo pages
retired without dead links; `./deploy.sh` produces a working build.

---

## FINAL TASK

Run DoD review for this build (dod-reviewer sub-agent). Report per phase: PR URLs,
what's complete vs deferred, any acceptance criterion unmet, and any place the
prototype's design couldn't be recreated faithfully in the vanilla stack.
