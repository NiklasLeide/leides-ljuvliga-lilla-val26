# val26 — ny sajt (redesign)

Den nya, lins-baserade sajten (ersätter de gamla silo-flikarna i repo-roten).
Byggs i etapper enligt `../ARKITEKTUR_not.md`; gamla sajten i roten lever kvar
tills Fas 6 retirerar den. Serveras under `val26.leide.se/app/` under bygget;
promoveras till roten i Fas 6.

## Kör lokalt
Statisk sajt — ingen byggkedja. Servera repo-roten och öppna `/app/`:
```
python -m http.server 8791    # från repo-roten
# → http://127.0.0.1:8791/app/index.html
```
(Servera roten, inte `app/`, så att linserna når `/data/*.json`.)

## Struktur
```
app/
  index.html            Startsida (skelett i Fas 0, full i Fas 6)
  valkompass.html       Lins: Valkompass   (Fas 5)
  position.html         Lins: Position     (Fas 2)
  sager-vs-gor.html     Lins: Säger vs gör (Fas 3)
  sprak.html            Lins: Språk        (Fas 4)
  gal-tan.html          Lins: GAL-TAN      (Fas 1)
  om-metoden.html       Om metoden         (Fas 6)
  _shell.html           KÄLLA för nav-blocket (se nedan)
  css/tokens.css        Alla design-tokens (:root, SSOT)
  css/shell.css         Skal + delade lins-komponenter
  js/constants.js       Partifärger/namn/ordning + områdes-toner (window.VAL26)
  js/compare-state.js   Delad jämför-markering, sessionStorage (window.CompareState)
  js/shell.js           Skalbeteende + hjälpare (window.VAL26Shell)
```

## Navigering = EN redigeringspunkt (undviker "self-contained files"-fällan)
Varje sida är en fristående HTML-fil. För att en nav-/skaländring inte ska kräva
handpåläggning i alla filer ligger nav-markupen **bara** i `app/_shell.html`,
mellan `<!-- SHELL:NAV START -->` och `<!-- SHELL:NAV END -->`. Propagera den:
```
node scripts/sync-shell.mjs          # skriv in nav-blocket i alla app/*.html
node scripts/sync-shell.mjs --check  # CI: exit 1 om någon sida är osynkad
```
Länkarna är statiska `<a>` (crawlbara, funkar utan JS). Aktiv markering sätts i
körning av `shell.js` utifrån `<body data-lens="…">`, så markupen är identisk på
alla sidor.

## Delade mekaniker (byggda en gång, konsumeras av varje lins)
- **Tokens** (`tokens.css`) — inga hårdkodade färger/mått i sid-CSS.
- **Jämför-state** (`compare-state.js`) — ett parti valt i en lins följer med till
  nästa (sessionStorage). `toggle/set/clear/subscribe`. Chips och grafnoder speglar
  varandra genom att båda läsa/skriva denna state.
- **Chips** (`VAL26Shell.renderChips`) — partichips-rad kopplad till jämför-state.
- **Områdes-toner** (`VAL26.areaTone(id)` + `--area-*`) — `oklch(0.95 0.02 H)`,
  identisk ljushet/mättnad; sätts på `.lens-header` via `--header-tone`.

## Neutralitet (hårda regler — se ARKITEKTUR_not.md / handoff-README)
Endast partifärger är mättade; axlar/linjaler är grå. Ingen grön=bra/röd=dålig.
Frånvaro redovisas; otydliga positioner streckas; statusfärger beskriver bara
kongruens ord↔handling.
