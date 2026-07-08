# Design Tokens — leides-ljuvliga-lilla-val26

Single source of truth for the visual language of the party-position service.
Extracted from `style.css` (`:root`) and the party data in `data/positions.json`
(= `data/gal-tan.json`). This file is for **manual upload into Claude Design**
alongside prototypes — feed it so generated designs stay on-brand.

**Aesthetic in one line:** warm off-white paper, near-black ink, quiet neutral
chrome; a serif for titles, a geometric sans for everything else; official party
colours are the only saturated hues; status is carried by soft pastel badges.

---

## 1. Fonts

Load both from Google Fonts (exact weights the site ships):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap">
```

| Token         | Value                                   | Role                          |
|---------------|-----------------------------------------|-------------------------------|
| `--font-body` | `'DM Sans', system-ui, sans-serif`      | UI, body, labels, data (default) |
| `--font-serif`| `'Source Serif 4', serif`               | Titles & headings only        |

Weights available: DM Sans 300/400/500/600/700 · Source Serif 4 400/600 (+ italic 400).

---

## 2. Core palette

The neutral system. These are the only tokenised colours in `:root`; everything
else on the page is either a party colour (§4) or a status pastel (§5).

| Token       | Hex        | Use                                             |
|-------------|------------|-------------------------------------------------|
| `--ink`     | `#1c1c1c`  | Primary text, header bg, active states, buttons, tooltip |
| `--bg`      | `#f7f6f3`  | Page background (warm off-white paper)          |
| `--card`    | `#ffffff`  | Card / panel surface                            |
| `--border`  | `#e5e2dc`  | Hairlines, dividers, inactive chips, bar tracks |
| `--muted`   | `#999999`  | Secondary text, hints, disabled                 |
| `--track`   | `#ddd9d0`  | Slider / scale rails (darker than border)       |
| _white_     | `#ffffff`  | Text on ink & on party dots                     |

Ink appears at reduced opacity for text on the dark header:
`rgba(255,255,255,0.5)` (subtitle), `0.35` (badge), and dashed/`0.6` borders on dots.

---

## 3. Typography scale

Sizes are in `rem` as authored (base = browser default 16px). Serif = titles,
weight 600; sans carries 400–700.

| Role                    | Font  | Size (rem) | Weight | Line-height | Tracking / notes |
|-------------------------|-------|-----------:|-------:|-------------|------------------|
| Page title (h1)         | serif | 1.60       | 600    | 1.2         | on dark header   |
| Screen / question title | serif | 1.20–1.25  | 600    | 1.35        | wizard headings  |
| Card / panel title      | serif | 0.95–1.05  | 600    | —           | topic & party names |
| Section title           | serif | 1.00       | 600    | —           |                  |
| Body / summary          | sans  | 0.83–0.88  | 400    | 1.5–1.55    | reading text     |
| UI label / button       | sans  | 0.75–0.90  | 500–600| —           |                  |
| Data value (tabular)    | sans  | 0.85       | 600    | —           | `font-variant-numeric: tabular-nums` |
| Small / meta            | sans  | 0.72–0.78  | 400–500| 1.4–1.6     | sources, hints   |
| Micro label (UPPERCASE) | sans  | 0.55–0.68  | 600–700| —           | tracking 0.03–0.08em, `text-transform: uppercase` |
| Party-dot glyph         | sans  | 11–12px    | 700    | —           | tracking −0.02em, on colour |
| Footer                  | sans  | 0.62       | 400    | 1.7         | `#ccc`           |

**Convention:** all-caps eyebrow/label text is 0.55–0.68rem, weight 600–700, with
positive letter-spacing (0.03–0.08em). Never use caps at body size.

---

## 4. Party colours (the 8 riksdag parties)

Official party hues — the SSOT for every dot, node, bar, and swatch. Order below
is the canonical seating/display order used in `positions.json`. Text on every
swatch is white (`#fff`); dots carry a `2px solid rgba(255,255,255,0.5–0.6)` ring.

| Code | Party                | Hex        | Swatch |
|------|----------------------|------------|--------|
| S    | Socialdemokraterna   | `#ED1B34`  | 🟥 red |
| M    | Moderaterna          | `#52BDEC`  | 🟦 light blue |
| SD   | Sverigedemokraterna  | `#DDCF00`  | 🟨 yellow |
| V    | Vänsterpartiet       | `#AF1D22`  | 🟥 dark red |
| C    | Centerpartiet        | `#009933`  | 🟩 green |
| KD   | Kristdemokraterna    | `#231977`  | 🟪 dark blue |
| L    | Liberalerna          | `#006AB3`  | 🟦 blue |
| MP   | Miljöpartiet         | `#53A12B`  | 🟩 olive green |

**Reduced state:** an "unclear/unknown" position renders the party colour at
`opacity: 0.55` with a **dashed** ring.

---

## 5. Status & semantic pastels

Not tokenised in `:root` — hardcoded per component, but they form one consistent
system: a soft tinted background + a darker same-hue text. Reuse these exact pairs
so any new status badge matches. `bg` / `text`:

**Match / congruence (positive → negative):**

| Meaning            | bg        | text       |
|--------------------|-----------|------------|
| Match / high (grön)| `#d4f7dc` | `#1a7a3a`  |
| Partial (gul)      | `#fff3cd` | `#8a5700`  |
| Diverges / low (röd)| `#fde8e8`| `#9b1c1c`  |
| Awaiting review    | `#e0f2fe` | `#075985`  |
| Not reviewed       | `--border`| `--muted`  |

**Statement-type labels (säger / lovar / röstat):**

| Label            | bg        | text       |
|------------------|-----------|------------|
| Säger (says)     | `#dbeafe` | `#1e40af`  |
| Lovar (promises) | `#ede9fe` | `#5b21b6`  |
| Röstat (voted)   | `#ccfbf1` | `#0f766e`  |

**GAL-TAN direction deltas:** right/tan `#eff6ff`/`#1e40af` & `#fef2f2`/`#9b1c1c`;
left/gal `#f0fdf4`/`#15803d`. Discourse signifier pills use `#eef0f5`/`#444`
(neutral) and `#f0f4ff`/`#2a3a8a` (key term).

**Pattern to extend:** pick a hue, background ≈ 92–96% lightness, text ≈ 30–40%
lightness of the same hue. Green = agreement, amber = partial, red = conflict,
blue = informational/neutral, purple/teal = category tags.

---

## 6. Spacing scale

4-based scale. Use tokens, never raw px.

| Token        | px  |
|--------------|-----|
| `--space-xs` | 4   |
| `--space-sm` | 8   |
| `--space-md` | 16  |
| `--space-lg` | 24  |
| `--space-xl` | 48  |

Layout widths (for reference): content max `1200px`; left rail `210px`;
right rail `268px`; reading column max `520–640px`.

---

## 7. Radii

| Token         | px   | Use                                    |
|---------------|------|----------------------------------------|
| `--radius-sm` | 4    | Tiny chips, micro-labels               |
| `--radius-md` | 8    | Buttons, nav items, tooltips           |
| `--radius-lg` | 14   | Cards & panels                         |
| _pill_        | 99–100px / `50%` | Pills, party dots (full circle) |

---

## 8. Shadows (recommended tokens)

Not currently in `:root`, but three de-facto elevations are used inline. Promote
these to tokens on any new surface:

| Suggested token   | Value                          | Use                          |
|-------------------|--------------------------------|------------------------------|
| `--shadow-sm`     | `0 2px 8px rgba(0,0,0,0.2)`    | Hovered dots / interactive lift |
| `--shadow-md`     | `0 4px 16px rgba(0,0,0,0.15)`  | Tooltip / floating popover   |
| `--ring-selected` | `0 0 0 3px var(--ink)`         | Selected swatch ring         |
| `--ring-focus`    | `0 0 0 4px rgba(28,28,28,0.12)`| Keyboard focus halo          |

---

## 9. Named tokens (paste-ready `:root`)

```css
:root {
  /* Fonts */
  --font-body:  'DM Sans', system-ui, sans-serif;
  --font-serif: 'Source Serif 4', serif;

  /* Core palette */
  --ink:    #1c1c1c;
  --bg:     #f7f6f3;
  --card:   #ffffff;
  --border: #e5e2dc;
  --muted:  #999999;
  --track:  #ddd9d0;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;

  /* Party colours */
  --party-s:  #ED1B34;  /* Socialdemokraterna   */
  --party-m:  #52BDEC;  /* Moderaterna          */
  --party-sd: #DDCF00;  /* Sverigedemokraterna  */
  --party-v:  #AF1D22;  /* Vänsterpartiet       */
  --party-c:  #009933;  /* Centerpartiet        */
  --party-kd: #231977;  /* Kristdemokraterna    */
  --party-l:  #006AB3;  /* Liberalerna          */
  --party-mp: #53A12B;  /* Miljöpartiet         */

  /* Elevation (proposed) */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.15);

  /* Party-dot geometry */
  --dot: 32px;
  --dot-font: 12px;
}
```
