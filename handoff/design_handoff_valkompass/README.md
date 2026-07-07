# Handoff: Valkompassen — val26.leide.se

## Overview

The **Valkompass** for val26.leide.se — the flagship surface of the neutral
Swedish voter-guide site ("Partiernas ståndpunkter 2026"). It is the first
thing an undecided voter meets and the thing that gets shared onward, so it
must feel like the most polished surface on the site.

The compass is **discourse-based with two independent lenses** producing
**two separate result graphs** — never a single "winner" party:

- **Lins 1 · "Tycker som du"** (position): statements with a 5-point agree
  scale, matched by distance on the same 0–100 axes used in the Position lens.
- **Lins 2 · "Tänker som du"** (discourse): concept questions ("När du hör
  'trygghet' — vad tänker du främst på?") whose answer options mirror the
  meanings parties themselves attach to the word, matched by shared meaning.

Flow: **Intro → 10 questions (mixed lenses) → area weighting (own step) →
results (two graphs) → share**. Plus a new methodology section for the
"Om metoden" page.

The compass methodology is **locked** — see `VALKOMPASS_metodik_v1.md`
(included). That document governs what is measured; this handoff governs how
it looks and behaves. Where they seem to conflict, the methodology wins.

## About the Design Files

The `.dc.html` files are **design references created in HTML** (a component
prototyping format; `support.js` is its runtime — open any file in a browser
to view and interact with it). They are prototypes showing intended look and
behavior, **not production code to ship**. The task is to **recreate the
designs in the target codebase** (the existing val26 site) using its
established patterns. All layout styling is inline on the elements, so every
measurement can be read directly from the files.

This package extends the earlier handoff `design_handoff_val26` (new visual
language + four lenses). The compass **inherits that visual language
completely** — fonts, neutrals, party colors, area tones, radii, motion. Its
README and `design-tokens-original.md` remain the token SSOT; only
compass-specific values are repeated here.

`Valkompassen — riktningar.dc.html` is the design-exploration canvas (option
rounds 1–4: question-experience directions, results/weighting variants, share
card). Included for rationale only — **do not implement it**.

## Fidelity

**High-fidelity.** Colors, typography, spacing, copy, interactions and the
matching math are final. Recreate pixel-perfectly. All copy is Swedish and
used verbatim from the files. The prototype's question set is a subset (see
Data) — production uses the full selection per the methodology.

## Navigation

The compass is added to the site's global left rail / mobile drawer as a
**fifth "Din fråga" item, listed first and active on all compass screens**:

- Question: "Vilket parti ligger närmast dig?" · lens label: "VALKOMPASS"
- Same rail/drawer specs as the main handoff (210px rail, 920px breakpoint,
  hamburger topbar + slide-in drawer below it).

## Screens

All screens live inside the standard page chrome. Content transitions between
screens/questions: outgoing slides 26px left + fades (300ms ease), incoming
enters from +26px. **Going backwards reverses the direction.** During
transition, controls are inert (guard on an `idle` phase).

### 1. Intro (`startVy: intro`)

- Neutral-toned header band `oklch(0.945 0.008 85)` (concept/no-area tone —
  only policy areas carry tone), padding `36px clamp(20px,4.5vw,44px) 32px`.
  - White pill "VALKOMPASS · VALET 2026" (caps 9.5px/700, ls .07em) +
    right-aligned "Uppdaterad juli 2026" (11px, #94908a).
  - H1 serif 600 `clamp(28px,5vw,38px)`: "Vilket parti ligger närmast dig?"
  - Intro (14.5px/1.6, #4d4942, max 620px): "En kompass, tio frågor.
    Resultatet läses genom två linser — vad du tycker i sakfrågorna och vad
    du tänker när politikens ord används. Två grafer sida vid sida, aldrig
    ett enda svar."
  - Three **count-up stats** (DM Sans 700 34px tabular-nums; labels caps 11px
    #94908a): 10 Frågor · 2 Linser · 8 Partier. Animate ~1000ms cubic
    ease-out on load.
- Below: **one** "Så funkar det" card (white, radius 14, padding 22/24) with
  three numbered steps in a responsive grid (`auto-fit minmax(220px,1fr)`).
  Step number = 24px ink circle, white 700 11px. Steps (verbatim):
  1. "Svara på tio frågor" — "Sakpåståenden och begreppsfrågor, blandat.
     Hoppa över det du är osäker på."
  2. "Vikta politikområdena" — "Det du bryr dig mest om väger tyngst i
     jämförelsen. Alla lika från början."
  3. "Läs ditt resultat i två grafer" — "Samma svar, två läsningar: vad du
     tycker i sakfrågorna och hur du tänker kring orden."
  **Important: one card, not two.** An earlier two-card version read as "two
  separate compasses" — avoid any layout implying a choice of two tests.
- CTA row: ink button "Starta kompassen →" (radius 8, padding 14/24, 600
  14px) + text link "Så funkar matchningen →" (→ metod section anchor).
- Monospace footer note: "prototyp: 6 sakfrågor (skola & ekonomi) + 4
  begrepp · dina svar lämnar aldrig webbläsaren · hela metoden redovisas
  öppet" — in production drop the "prototyp:" clause, keep the privacy +
  glass-box claims (and honor them: all computation client-side).

### 2. Question screens

**Desktop (≥920px):**
- Area-toned band (crossfades 400ms between questions): white pill
  "{TYCKER SOM DU|TÄNKER SOM DU} · {AREA|BEGREPP}" + counter "Fråga N av 10"
  (12px 600 tabular). Below: 2px progress line, ink fill = (N−1)/total,
  `transition: width .4s`.
  - Position questions: area tone `oklch(0.95 0.02 H)` (H: Skola 320,
    Ekonomi 85 — full hue table in main handoff). Concept questions: neutral
    `oklch(0.945 0.008 85)`.
- Statement: serif 600 29px/1.3, max 660px.
- **Position answer control — the "linjal"** (max-width 500px, echoes the
  beeswarm tracks): a 2px #dcd8cf horizontal rail with five 22px circular
  dot buttons evenly spaced (justify-space-between; rail inset 11px each
  end so it runs center-to-center). Dot: white bg, 2px #b5b0a6 border,
  shadow `0 1px 4px rgba(0,0,0,.1)`; hover scale 1.3; selected: ink fill +
  ink border + scale 1.3. Each dot's full label in `title`. Below (11px):
  left "Tar helt avstånd" (600 #94908a), center "Varken eller" (500
  #b5b0a6), right "Instämmer helt" (600 #94908a).
  **Scale direction is locked: disagreement left → agreement right.**
- **Concept answer control**: stacked full-width option buttons (max 560px,
  gap 8): white bg, 2px #e7e4de border, radius 8, padding 12/16, 500
  13.5px/1.4 left-aligned; hover bg #f0ede7; selected ink bg/white text.
  All options identically styled — **no option may be visually or verbally
  more inviting** (options mirror party meanings from discourse data,
  never rewritten).
- Footer row (max 560px): left group (gap 20) "← Föregående fråga" (plain
  text button 12px #94908a; on Q1 it reads "← Till starten" and returns to
  intro) + "Vet inte / hoppa över" (same size, underlined). Right: "Så
  räknas ditt svar →" (600 11px #a8a49a, → metod anchor).

**Mobile (<920px) — card-deck ("kortleken"):**
- Toned band under topbar: right-aligned counter + progress line.
- Card stack centered: front card (white, radius 14, border #e7e4de, shadow
  `0 12px 32px rgba(0,0,0,.09)`, padding 20) with a peeking back card
  behind (inset 14px horizontally, offset top 22px/bottom −10px, opacity .7).
- Card content: chip row — lens pill (1.5px ink border, radius 99, caps
  8.5px 700) + area chip (area-tone bg, transitions .4s); statement serif
  600 19px/1.35; **all answers as stacked buttons** (radius 10, 600 12.5px —
  both scale answers and concept options; ≥44px touch targets); footer
  back + skip.
- Card transition may keep the horizontal slide of the shared wrapper (as
  prototyped) — the exploration's spring card-fling (420ms
  `cubic-bezier(.34,1.2,.4,1)`, exit `translateX(70px) rotate(2.5deg)`) is
  an acceptable enhancement.

**Answer behavior (both):** tapping an answer marks it ink for ~240ms, then
auto-advances. Revisiting an answered question shows the saved answer
selected (only in the idle phase, so incoming questions don't flash).
Re-answering overwrites. Skip advances without marking (~60ms delay).
After the last question → weighting step.

### 3. Weighting ("Sista steget")

- Neutral band: pill "VALKOMPASS · SISTA STEGET" + "{n} av 10 frågor
  besvarade"; progress line full (100%).
- H serif 600 `clamp(22px,3.5vw,27px)`: "Vad väger tyngst för dig?" + intro
  (13.5px, max 540px): "Områden du bryr dig mer om väger tyngre när dina
  svar jämförs med partiernas positioner. Alla väger lika från början — du
  kan lämna dem så."
- Eight slider rows, grid `auto-fit minmax(280px,1fr)` gap `14px 28px`.
  Row: 12px rounded (3px) **area-tone swatch** with #e7e4de border (exact
  header tones — the site's red thread) + area name (500 12px, 118px col) +
  range input 0.2–2.0 step 0.1, `accent-color: #211f1c` (neutral — never a
  valenced color) + value "×1,0" (600 11px tabular, Swedish decimal comma).
- Note (italic serif 12px #94908a): "Påverkar bara Tycker-grafen —
  begreppsfrågorna viktas inte." (drop the prototype-coverage sentence in
  production).
- Actions: ink CTA "Visa mitt resultat →"; "Återställ — alla lika"
  (underlined text button) **appears only when any weight ≠ 1**; "←
  Föregående fråga" returns to the last question. **No skip button** — the
  default (all equal) already is the skip.

### 4. Results ("Ditt resultat")

- Neutral band: pill "VALKOMPASS · DITT RESULTAT" + "{n} av 10 frågor
  besvarade".
- **Insight first** (only when both lenses have data): serif 600
  `clamp(18px,3vw,21px)`: "Du tycker mest som [dot] {parti} — men tänker
  mest som [dot] {parti}." with 12px party-color dots inline. Subline
  (italic serif 13px #68645d): "Ingen motsägelse — de två linserna mäter
  olika saker. Jämför graferna, sida vid sida." If both tops are the same
  party: "Samma parti ligger närmast i båda linserna — men jämför hela
  graferna, de mäter olika saker." The difference is framed as **insight,
  never error** — and naming two parties is the anti-winner device.
- **Two graph cards side by side**, grid `auto-fit minmax(300px,1fr)` gap 14
  (stacks on mobile). Card: white, radius 14, padding `18px 18px 14px`.
  - Header: caps 10px 700 "TYCKER SOM DU" / "TÄNKER SOM DU" + meta right
    ("{n} av 6 sakfrågor besvarade" / "{n} av 4 begrepp besvarade").
  - Eight rows (gap 7), **each lens sorted by its own closeness desc**:
    20px party dot with code (700 8.5px; white text, **SD: #333**) + party
    name (500 10.5px #68645d, 86px col, ellipsis) + bar track (8px,
    #f0ede7, radius 99) with **party-color fill** animating from 0 on
    entrance, `width .8s cubic-bezier(.34,1.2,.4,1)` (~150ms after mount)
    + "{pct} %" (600 12px tabular, 38px right-aligned col).
  - Row `title` tooltip: "Centerpartiet · 82 % närhet · 5 besvarade
    sakfrågor" / "...· delar din innebörd i 3 av 4 besvarade begrepp".
  - Tänker card adds footnote (italic serif 10.5px #94908a): "Räknat bara på
    begrepp partiet självt använder — täckningen visas per parti."
  - Card footer (top border #f0ede7): link "Öppna i Position →" / "Öppna i
    Språk →" (600 11.5px underlined) + faint "topp-partier förvalda" —
    navigates to the lens with the top parties preselected.
  - **Empty-lens edge case**: if every question in a lens was skipped, that
    card shows a dashed placeholder (1.5px dashed #dcd8cf, radius 10,
    italic serif 12.5px #94908a): "Du hoppade över alla sakfrågor — ingen
    Tycker-graf kan räknas. Gå tillbaka och svara på minst en." (resp.
    begrepp variant). Never a fabricated graph.
- **Share card** ("Dela ditt resultat", white, radius 14): copy "Som bild
  med båda graferna, eller som länk. Bilden skapas i din webbläsare — inga
  svar skickas någonstans."; buttons "Ladda ner bild" (ink) + "Kopiera
  länk" (2px #e7e4de border; flashes "Länk kopierad ✓" ~1.6s). Mono note:
  "länken innehåller bara graferna — aldrig dina enskilda svar". These
  privacy statements are product requirements: generate the image
  client-side; encode only the two graphs' percentages in the share URL,
  never individual answers.
- Footer row: mono glass-box line "symmetrisk formel · hoppade frågor
  räknas inte · hela metoden redovisas öppet →" + "← Ändra viktningen"
  (returns to weighting, reverse transition; result re-animates on return)
  + "Gör om kompassen" (clears answers, back to intro).

### 5. Share image (1080×1080)

Design in `Valkompassen — riktningar.dc.html` §4a (rendered at 50%; the
full-scale prototype's "Ladda ner bild" opens the same card as an overlay
preview). Square, bg #f8f7f4, padding ~80px (2× the 40px at half scale):

- Top: ink pill "VALKOMPASS" + "VALET 2026" right.
- Insight sentence as hero (serif 600, ~58px at full scale) with party dots.
- Subline italic serif: "Två linser, två grafer. Aldrig ett enda svar."
- Bottom half: both graphs side by side (compact rows: 32px code dots, 10px
  bars, tabular percentages), equal width/size — all eight parties, both
  lenses, always.
- Footer above hairline: mono "val26.leide.se/kompass" + "Gör kompassen
  själv →".

### 6. "Om metoden" — new section

`Om metoden — kompassavsnittet.dc.html` contains the full new section "Hur
valkompassen räknar", inserted after "Fyra linser" on the existing Om
metoden page (same article form: 760px container, 640px reading width,
serif H2 22px, H3 16px, body 14px/1.65 #3d3a34). Includes both formulas as
monospace blocks on #faf8f3 (radius 10) — use the copy verbatim. This
section is a **methodology requirement** (glass box), not optional content.

## Matching math (must be implemented exactly)

- **Position ("Tycker")**: scale answer → axis value. With the locked
  direction (avstånd → instämmer) and a statement whose "agree" end is at
  axis 100: answer index 0..4 maps to [0,25,50,75,100]; if agree-end is at
  axis 0: [100,75,50,25,0]. Per party:
  `närhet = 100 − ( Σ w_area·|svar − partiposition| ) / Σ w_area`
  over answered questions only. Clamp at 0. Same formula for all parties.
- **Discourse ("Tänker")**: each option corresponds to a meaning shared by
  1–2 parties. Per party:
  `närhet = delade innebörder / besvarade begrepp där partiet har innebörd × 100`.
  (In the prototype's four concepts all eight parties have meanings; with
  the full concept set the denominator varies per party — rule 3.)
- **Skipped questions are excluded entirely** from both numerator and
  denominator. Never counted as neutral/middle.
- The two lenses are **never combined** into one score.

## Interactions & Motion summary

- Screen/question transition: 300ms ease, ±26px slide + fade; reversed on
  back. Answer-flash 240ms before advancing. Controls inert mid-transition.
- Area tone crossfade 400ms on question change (band and mobile area chip).
- Progress line + counter always visible during questions; width .4s.
- Result bars: spring `cubic-bezier(.34,1.2,.4,1)` 800ms from 0 on entrance.
- Intro stats count up ~1000ms cubic ease-out, tabular-nums.
- Hover states: option buttons → bg #f0ede7; linjal dots → scale 1.3;
  nothing pulses continuously.

## State Management

`screen` (intro | quiz | weight | result), `qi` (question index),
`answers` (map question-id → 0..4 / option index / 'skip'), `pick`
(transient flash), transition phase + direction, `w` (8 area weights,
default 1.0), `shareOpen`, `copied`, `narrow` (<920px), `menuOpen`,
entrance-animation flags. Persist `answers`, `qi`, `screen` and `w` (e.g.
localStorage) so a reload resumes mid-compass — the prototype keeps them
in memory only.

## Data

Prototype question set (embedded in the full-scale file's logic class) — 6
position questions built from `positions.json` values (skola + ekonomi) and
4 concept questions whose options mirror `discourse.json` innebörd fields
(trygghet, ansvar, omställning, gemenskap) with their option→party
mappings. Use it as the format reference. Production selects questions per
the methodology: cover all 8 areas, maximally differentiating, avoid
`unclear:true`; concepts need ≥6 parties coverage and ≥3 distinct loadings
(best: trygghet, ansvar, omstallning, gemenskap, energitrygghet, ordning,
säkerhet, natomedlemskapet). **Never rewrite option copy freely — mirror
the innebord fields.**

## Design Tokens

See `design_handoff_val26/README.md` + `design-tokens-original.md` (token
SSOT). Compass-specific: neutral header tone `oklch(0.945 0.008 85)`; area
tones `oklch(0.95 0.02 H)`; linjal rail #dcd8cf / dot border #b5b0a6;
progress track `rgba(33,31,28,.12)` on tone / #eeebe2 on paper; bar track
#f0ede7; slider accent #211f1c; selected-answer ink #211f1c. Party colors:
S #ED1B34 · M #52BDEC · SD #DDCF00 · V #AF1D22 · C #009933 · KD #231977 ·
L #006AB3 · MP #53A12B (text on dots white, SD #333).

## Neutrality rules (hard constraints — do not violate)

1. All answer options identically formatted; selection marked in ink, never
   a valenced color. Scales, sliders and progress are neutral grey/ink.
2. Party colors are the only saturated hues, used only to identify parties.
3. Results are always two graphs of equal size — no winner treatment, no
   podium, no gold highlighting of the top row.
4. "Vet inte / hoppa över" is present but visually quieter than answers —
   a text link, never a styled button competing with the scale.
5. Option copy mirrors party meanings verbatim-neutrally (methodology §4).
6. The formulas are public (Om metoden section) and symmetric.

## Assets

None — all graphics are DOM/CSS. Fonts from Google Fonts (Source Serif 4,
DM Sans — exact weights in the main handoff).

## Screenshots

`screenshots/` contains reference captures (desktop, 920px+ layout):

- `01-intro.png` — intro with count-up stats + "Så funkar det"
- `02-fraga-sakfraga-linjal.png` — position question with the linjal control
- `03-fraga-begrepp.png` — concept question (trygghet) with mirrored options
- `04-viktning.png` — weighting step, all equal
- `05-resultat.png` — results, two graphs + insight (different tops)
- `06-delning-forhandsvisning.png` — share-card preview overlay
- `07-om-metoden-kompassavsnitt.png` — new methodology section
- `08-delningskort-4a.png` — share card design in the exploration canvas

The HTML files remain the source of truth for exact values; screenshots are
orientation only.

## Files

| File | What |
|---|---|
| `Valkompassen — vy i full skala.dc.html` | The complete flow: intro → questions → weighting → results → share (working matching math) |
| `Om metoden — kompassavsnittet.dc.html` | New methodology section for the Om metoden page |
| `Valkompassen — riktningar.dc.html` | Design exploration canvas (rounds 1–4) — rationale + share-card design (§4a), do not implement |
| `VALKOMPASS_metodik_v1.md` | The locked methodology this design implements |
| `support.js` | Prototype runtime — reference only, do not ship |
