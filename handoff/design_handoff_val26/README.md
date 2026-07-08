# Handoff: val26.leide.se — nytt visuellt språk & fyra linser

## Overview

Redesign of **val26.leide.se** — a neutral Swedish voter guide showing where the
eight riksdag parties stand ahead of the 2026 election. The redesign lifts the
site from a quiet document look to editorial data-journalism ("påkostad
dagstidning"): more color, more life, more motion — while staying strictly
politically neutral.

The package contains six pages: a start page, an "Om metoden" (methodology)
page, and four "lenses" (linser) — Position, Säger vs gör, Språk, GAL-TAN —
each answering one reader question.

## About the Design Files

The `.dc.html` files in this bundle are **design references created in HTML**
(a component prototyping format; `support.js` is its runtime — open any
`.dc.html` in a browser to view it). They are prototypes showing intended look
and behavior, **not production code to copy directly**. The task is to
**recreate these designs in the target codebase** (the existing val26 site is
plain HTML/CSS/JS; if rebuilding, choose an appropriate framework) using its
established patterns. All layout styling in the prototypes is inline on the
elements, so every measurement can be read directly from the files.

`Visuellt språk - riktningar.dc.html` is the design-exploration canvas (option
rounds 1–6). It is included for rationale only — do not implement it.

## Fidelity

**High-fidelity.** Colors, typography, spacing, copy, and interactions are
final. Recreate pixel-perfectly. All copy is Swedish and should be used
verbatim from the files.

## Design Tokens

### Fonts
- `--font-serif: 'Source Serif 4', serif` — all headings, question-nav items,
  quotes/annotations (italic), topic names. Weight 600 for headings.
- `--font-body: 'DM Sans', system-ui, sans-serif` — everything else.
  Weights 300–700. Google Fonts, weights as in the original tokens file.
- Data values always `font-variant-numeric: tabular-nums`.
- Micro labels: uppercase, 9–11px, weight 700, letter-spacing .05–.09em.
- Source lines: `ui-monospace, Menlo, monospace`, 10.5–11px, color #a8a49a.

### Core neutrals (evolved from design-tokens-original.md)
| Token | Value | Use |
|---|---|---|
| ink | `#211f1c` | headings, active nav, primary text |
| body text | `#4d4942` / `#3d3a34` | paragraphs |
| secondary | `#68645d` | secondary text, labels |
| muted | `#94908a` | hints, eyebrows |
| faint | `#a8a49a` | source lines, rulers' labels |
| page bg | `#f8f7f4` | main background |
| rail bg | `#faf8f3` | left nav, annotation panels |
| card | `#ffffff` | panels/cards |
| border | `#e7e4de` | card borders |
| soft border | `#f0ede7` / `#eeebe2` | row dividers, inner borders |
| track | `#dcd8cf` | scale rails |
| ruler | `#d5d0c6` / `#a8a49a` / `#b5b0a6` | axis lines, ticks, beeswarm sticks |

### Party colors (only saturated data colors — never anything else)
S `#ED1B34` · M `#52BDEC` · SD `#DDCF00` · V `#AF1D22` · C `#009933` ·
KD `#231977` · L `#006AB3` · MP `#53A12B`.
Text on party nodes is white, **except SD: `#333`** (yellow bg).
Canonical display order: V, S, MP, C, L, KD, M, SD.

### Area tones — the "red thread" through all lenses
Each policy area has a background tone used in page headers (crossfades 400ms
on area switch). All identical lightness/chroma so no tone "wins":
`oklch(0.95 0.02 H)` with H per area:

| Area | Hue |
|---|---|
| Rättsväsende (& migration in Språk mode A) | 250 |
| Migration (Språk parti-mode) | 285 |
| Klimat & energi | 155 |
| Ekonomi | 85 |
| Demokrati | 215 |
| Försvar & säkerhet | 55 |
| Skola | 320 |
| Vård & omsorg | 25 |

Lenses **without** an area (GAL-TAN header) use neutral
`oklch(0.945 0.008 85)`. Rule: **only policy areas carry tone.**

### Status pastels (congruence between words and votes — never political value)
- Stämmer: bg `#d4f7dc`, text `#1a7a3a`
- Delvis/avviker: bg `#fff3cd`, text `#8a5700`, card accent border `#e3b23c`
- Inväntar votering: bg `#e0f2fe`, text `#075985`, card accent `#7aa7c7`
- "Angränsande konstruktion" badge (Språk): bg `#e0f2fe`, text `#075985`

### Radii & shadows
Cards/panels 14px · inner cards 10px · buttons/tabs 8px · pills 99px/20px.
Node shadow `0 2px 6px rgba(0,0,0,.18)`; selected node
`0 3px 12px rgba(0,0,0,.28)`; drawer `6px 0 24px rgba(0,0,0,.12)`.

### Layout
Content max-width 940px (GAL-TAN: 1140px), padding 22px sides. Left nav rail
210px fixed. Reading column (Om metoden) 640px max. Breakpoint: **920px**
(below = mobile: rail → hamburger topbar + slide-in drawer).

## Neutrality rules (hard constraints — do not violate)

1. Color never evaluates a political position. Only party colors are
   saturated; axes/rulers are always grey. GAL-TAN must never get
   green=good/red=bad coding.
2. Axes are rulers, not grades ("Axlarna är linjaler, inte betyg").
3. Scale endpoints are factual phrasings, never loaded words.
4. Absence is reported explicitly (party not using a term, no vote held).
5. Unclear/conditional positions: party color at reduced opacity (0.8) +
   **dashed** white ring + "otydlig" badge on cards.
6. 2026 positions are editorial judgment; CHES 2019/2024 is verified research
   data — always label which is which.

## Global navigation (all pages)

- **Desktop (≥920px)**: fixed left rail, 210px, bg #faf8f3, right border.
  Contents: site title (serif 14px, links to Startsida), eyebrow "DIN FRÅGA",
  four question items (serif 13px question + 8.5px caps lens label), then
  "Om metoden →" link. Active item: ink bg `#211f1c`, white text, radius 8px;
  inactive hover bg `#f0ede7`.
- **Mobile (<920px)**: sticky white topbar (hamburger = three 20×2px ink bars,
  site title). Hamburger opens a left drawer `min(320px, 84vw)`, bg #faf8f3,
  scrim `rgba(28,28,28,.3)` (click closes), same question list at 15px.
- The four questions (use verbatim):
  1. "Var står partierna i sakfrågorna?" → Position
  2. "Håller orden när det blir votering?" → Säger vs gör
  3. "Vad menar de egentligen med orden?" → Språk
  4. "Vart är partierna på väg?" → GAL-TAN

## Shared page-header pattern (all four lenses)

Area-toned band → white pill "LINS · <NAME>" + "Uppdaterad juli 2026" →
serif question H1 `clamp(26px,5vw,36px)` → explanatory intro (max-width
620px) → row of three **count-up stats** (DM Sans 700 34px tabular-nums,
11px labels). Stats animate 700–1400ms cubic ease-out on load and re-animate
toward new targets on filter/area change.

## Shared interaction patterns

- **Party chips**: pill buttons (2px border, party-color fill when selected,
  11px color dot inside). Multi-select filters/dims; "Rensa" text button
  appears when any selected. Dimmed elements: opacity 0.16–0.18.
- **Area tabs**: rectangular 8px-radius buttons, active = ink bg. Switching
  areas crossfades the header tone (400ms) and re-counts stats.
- **Beeswarm collision rule ("3a")** for any 1-D scale: colliding nodes
  dodge to lanes above/below the line (lane order 0, -1, +1, -2, +2…),
  a 1px `#b5b0a6` stick connects node center to its exact position on the
  line. Min gap = (nodeSize + 8px) converted to % of the **actual rendered
  track width** (recompute on resize). Track height grows only when lanes
  are used. Exact values are never nudged sideways.
- **Motion principles**: numbers count up when entering view (tabular-nums so
  width never jumps); nodes/bars settle with soft spring
  `cubic-bezier(.34,1.2,.4,1)` 800–900ms, ~120ms stagger; annotations fade in
  last ("data before comment"); area-tone crossfade 400ms; nothing bounces or
  pulses continuously except a soft selected-node pulse in GAL-TAN.

## Screens

### 1. Startsida (`Startsida.dc.html`)
Hero (max 680px): ink pill "VALET 2026", H1 serif `clamp(32px,6vw,50px)`
"Vad partierna säger — och vad de gör", intro, three count-up stats
(8 partier / 56 voteringar / 20 begrepp). Below: 2×2 door grid
(`auto-fit minmax(290px,1fr)`, gap 16px) — each door is a white card
(radius 14, padding 22/24) with caps lens label, serif question 19px, a
**living miniature** (mini scale with 5 party dots / status-pastel dist bar /
italic quote line / mini GAL-TAN scatter with grey cross), and a 13px
description. Hover: lift `translateY(-2px)` + shadow. Then an "Hur vet vi det
här?" teaser card (bg #faf8f3) linking to Om metoden, and a monospace source
footer.

### 2. Om metoden (`Om metoden.dc.html`)
Article page, 760px container, reading width 640px. Sections (serif H2 22px):
Neutralitetsprinciper (bullet list), Färg som orientering (8 area-tone
swatches 104×40px + the three status badges inline), Fyra linser (linked
list), Datakällor, Gränser och förbehåll. "Om metoden" item in rail gets
active style (bold + 3px ink left border).

### 3. Position (`Position - vy i full skala.dc.html`)
Per-area scale questions. Each topic = white card: serif topic name 17px,
hint line, **beeswarm track** (see rule above; node size 36px default,
tweakable 30–48), mid/end ticks, endpoint labels ("← Strikt reglering /
Fri etableringsrätt →", 11px 600). Node tooltip (title) = party + position
text. Unclear positions: dashed ring, 0.8 opacity, "OTYDLIG" badge
(`#fff3cd`/`#8a5700`) on cards. Selecting parties shows quote cards under
each scale (border-top 3px party color, radius 8). Header stats: frågor /
placerade positioner / markerade som otydliga. Data: skola (3 topics) +
ekonomi (3 topics), embedded in the file's logic class.

### 4. Säger vs gör (`Säger vs gör - vy i full skala.dc.html`)
Distribution panel: 38px stacked bar in status pastels (2px gaps, animated
width .5s), legend with counts, serif-italic methodology note on #faf8f3.
"HÄR SKAVER DET" badge (delvis pastel) + serif heading, then deviation cards
(`auto-fill minmax(300px,1fr)`): left accent border 4px (amber=delvis,
blue=inväntar), party dot + serif name + topic right-aligned, "SÄGER" row
(green caps label) and "GÖR"/"INGEN VOTERING" row. Below: **collapsed
"stämmer" panel** — header button with green count pill + "Visa/Dölj",
expanded content grouped by topic with caps sub-headers; rows = dot, party
code, statement. Collapsed by default. Data: skola + ekonomi voting records
(56 comparisons) embedded in the logic class.

### 5. Språk (`Språk - vy i full skala.dc.html`)
Two modes, switched by **full-width door tabs** in the header (grid 1fr 1fr,
gap 8px): active = white bg, 3px ink bottom border, radius 10px 10px 0 0;
each tab = 15px bold title + 11.5px subtitle.
**Mode A "Begrepp"**: area tabs (7) + concept pills (quoted, 20 concepts
total) → dictionary-entry header (concept in serif `clamp(30px,6vw,44px)` in
quotes, italic serif description, coverage line) → **three-column quote wall**
(flex, columns `1 1 250px`): column headers "GAL-LADDNING" / "MITTEN ·
GLIDANDE · SPÄNNING" / "TAN-LADDNING" with counts (2px bottom border
#dcd8cf); buckets by axis value ≤35 / 35–65 / ≥65 (mapping in
`sprak-data.js` axisMap). Card: party-color top border, dot + serif name +
caps loading label right, **quote first** (serif italic 16px), meaning 12.5px,
optional "ANGRÄNSANDE KONSTRUKTION" badge. Empty column shows dashed
placeholder note. Below: missing-parties note ("att inte använda ett begrepp
är också ett val"), "Analytisk kommentar" panel (#faf8f3, serif italic), and
source/täckningsnot line.
**Mode C "Parti"**: single-select party chips → profile card (party-color top
border 4px, serif name 22px, neutral grey pill "Kongruens ord–position: hög",
serif lede = overordnad inramning, nodalpunkt word-pills (outlined),
strategy bullet list) → 8 area tabs → area card (serif-italic inramning,
nyckelbegrepp grid with "Underförstådd premiss" fine print behind dashed
divider, strategy blocks with party-color left border + serif-italic example
quote + **monospace source line** "— sd.se/vad-vi-vill", kontrast note) →
kongruens commentary panel. All data in `sprak-data.js`
(`window.SPRAK_DATA = { signifiers, axisMap, discParties }`).

### 6. GAL-TAN (`GAL-TAN - vy i full skala.dc.html`)
Container 1140px. Neutral header (no area tone) with intro stating the
ruler-not-grade rule; stats 8/8 partier · 24 mätpunkter · +1,5 största
förflyttning. Year segmented control (2019/2024/2026 in #ece9e2 pill
container) with per-year source note. On load: **intro sweep** — nodes start
at 2019, glide to 2024 (800ms) then 2026 (1800ms). Scatter: white panel,
square (aspect-ratio 1, max 640px), grey cross rulers at 6% margins, caps
axis labels (GAL·frihetlig top, TAN·auktoritär bottom, ekonomisk vänster/höger
rotated on sides). Nodes 44px desktop / 32px mobile, transition left/top .9s
spring; faded 9px ghost dots + 2px trails (opacity .25/.35) show history.
Click node/chip = multi-select: others dim, selected get stronger shadow.
**Side panel** right of chart (flex `1 1 280px`, max 420px, sticky top 16,
scrollable): empty state = dashed hint card; selected = detail cards
(party top border, serif name, tabular meta line "GAL-TAN 4,8 (1,5 mot TAN) ·
vänster–höger 3,5 (i stort sett stilla)", 2026 motivation text) + footnote.
Wraps below chart on narrow screens. Annotation (2026, no selection): white
serif-italic callout in lower-left quadrant + angled 1px leader to S.
Delta language is neutral: "mot TAN/GAL", "högerut/vänsterut",
"i stort sett stilla" (|Δ|<0.3).

## State Management

Per lens: `area` (or `year`/`mode`/`party`/`concept`), `selected: string[]`
(party codes; single string in Språk mode C), animated stat values,
`stammerOpen` (Säger vs gör), `narrow` (viewport <920px), `menuOpen`
(mobile drawer). Slide position/lens is per-page (separate URLs); no
persistence required beyond that.

## Data

- `sprak-data.js` — 220kB: `signifiers` (20 concepts × parties: innebörd,
  exempel, galtan_matchning, markering), `axisMap` (label → 0–100),
  `discParties` (8 parties × diskursprofil + 8 areas). Load as static data.
- GAL-TAN positions (CHES 2019/2024 + 2026 assessments incl. motivations),
  Position scales, and voting records are embedded in each view's logic
  class — extract to JSON files in production.
- The live site's full data lives in the val26 repo (`positions.json` etc.);
  these files cover skola + ekonomi for Position/Säger vs gör and everything
  for Språk/GAL-TAN.

## Assets

None — no images or icon fonts. All graphics are DOM/CSS (dots, bars,
rulers). Fonts from Google Fonts.

## Screenshots

`screenshots/` contains reference captures (desktop, top of page):

- `01-startsida.png` — start page hero + doors
- `02-om-metoden.png` — methodology page
- `03-position.png` — Position lens (beeswarm scales)
- `01-04-…`/`02-04-sager-vs-gor.png` — Säger vs gör: default + expanded "stämmer" panel
- `01-05-…`/`02-05-sprak.png` — Språk: Begrepp mode (quote wall) + Parti mode (discourse profile)
- `01-06-…`/`02-06-gal-tan.png` — GAL-TAN: default + S selected (side panel active)

The HTML files remain the source of truth for exact values; screenshots are
orientation only.

## Files

| File | What |
|---|---|
| `Startsida.dc.html` | Start page with four doors |
| `Om metoden.dc.html` | Methodology page |
| `Position - vy i full skala.dc.html` | Position lens |
| `Säger vs gör - vy i full skala.dc.html` | Says-vs-does lens |
| `Språk - vy i full skala.dc.html` | Language lens (Begrepp + Parti modes) |
| `GAL-TAN - vy i full skala.dc.html` | GAL-TAN map lens |
| `sprak-data.js` | Discourse data (signifiers, axisMap, discParties) |
| `support.js` | Prototype runtime — reference only, do not ship |
| `design-tokens-original.md` | The site's original token sheet (baseline) |
| `Visuellt språk - riktningar.dc.html` | Design exploration canvas — rationale only |
