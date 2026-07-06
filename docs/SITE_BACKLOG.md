# SITE_BACKLOG — produkt- och trovärdighetsfynd

Granskningsfynd om själva sajten (val26.leide.se): trovärdighet, vyer, UX.
Skild från `LOOP_BACKLOG.md`, som enbart rör diskurs-/bevakningsloopens
infrastruktur.

**Status:** loggade 2026-07-06, INGET åtgärdat. Ska triageras med Niklas.
Objekt markerade **⛔ kräver metodbeslut** implementeras inte förrän Niklas
fattat beslutet. Objektnumren (1–9) följer granskningens egen numrering och
är inte sorterade — spåren (A/B/C) styr prioritet.

---

## Spår A — TROVÄRDIGHET (före kampanjintensitet; ej ren kod)

### A1. Sakfråge-antalet motsäger sig självt  ✅ *snabbfix, inväntar Niklas bekräftelse av siffran*
Granskningen: title/meta säger "42 sakfrågor", metod.html säger "23 av 49",
data har 42. **Verifierat 2026-07-06:**
- `data/positions.json` → **42 sakfrågor** (7 områden, topics summerar till 42).
- `index.html` (title + meta + og), `hitta-parti.html`, `kluster.html` → **"42 sakfrågor"** (samstämmiga).
- **Enda avvikaren:** `metod.html:319` — "23 av 49 sakfrågor valdes ut baserat
  på hur mycket partiernas positioner skiljer sig åt."

Diskrepansen är alltså smalare än granskningen antydde: **42 är redan
konsensus**. Kvar att reda ut i metod.html-meningen är TVÅ tal:
- "**49**" är föråldrat → ska rimligen vara 42.
- "**23**" är urvalet för spektrum-/skillnadsvyn (de mest divergerande
  frågorna). Behöver bekräftas: är det fortfarande 23 av nuvarande 42, eller
  har urvalet ändrats? Detta är den enda punkt där Niklas behöver bekräfta
  "rätt siffra"; själva metod-meningen är sedan en enradsfix.

*Snabbast av alla fynd. Ingen metod, bara en bekräftad siffra.*

### A2. "Säger vs gör" saknar bett  ⛔ *kräver metodbeslut*
`data/voting.json` fördelning **verifierad 2026-07-06**:
**325 stämmer / 10 delvis / 1 inväntar-votering / 0 avviker** (336 bedömningar).
Med noll "avviker" och 97 % "stämmer" ser ansvarsutkrävarverktyget tandlöst ut
för exakt sin målgrupp.

Föreslagen åtgärd (EJ byggd): synlig fördelningsstapel + en metodnot som
förklarar VARFÖR "stämmer" dominerar — regeringspartier röstar sin egen
politik, plus urvalseffekt (frågorna valda där det finns tydliga löften att
matcha mot). **Metodbeslut med Niklas krävs först:** hur formuleras noten
neutralt, och ska fördelningen visas rått eller kontextualiseras?

### A3. Positioner saknar "senast granskad"-datum  ⛔ *kräver metodbeslut (schema)*
Under kampanjförhållanden = färskhet är trovärdighet, särskilt när M/SD/KD/MP:s
valmanifest landar i augusti och gamla positioner kan bli inaktuella.
Föreslagen åtgärd (EJ byggd): schematillägg (`senast_granskad` per position)
+ backfill av befintliga positioner. **Kräver beslut:** granularitet (per
position / per parti-område / per område) och backfill-datumets semantik
(insamlingsdatum vs senaste manuella granskning). Schemabump + migration
enligt projektkonventionen.

---

## Spår B — DISKURSVYN (ingår i pågående designrunda — bygg INTE separat)

> Dessa hanteras i den pågående designrundan. Vänta på designbriefen; inga
> separata implementationer.

### B8. Signifikanter är begravda bakom parti-först-navigation
Flytande signifikanter når man bara via partinav. De ska bli en primär ingång
i omdesignen. (Designas nu.)

### B6 (del). Flikar är `<button>`+`location.href`, inte `<a>`
Omdesignen bör använda riktiga `<a>`-länkar — mittklick, prefetch,
crawlbarhet, tillgänglighet. Canonical-taggar saknas på alla sidor (billig
fix som gäller hela sajten — se även C6 för den sajtövergripande delen).

---

## Spår C — SEPARATA STRÖMMAR (egna briefar senare, inte nu)

### C4. Surfplattegap
Enda brytpunkten är 480px; 481–1024px får desktop-layout med ~290px
centrumkolumn på iPad i porträtt. Lägg till surfplattebrytpunkt.
*(Reformkartans "mobil-sent"-läxa.)*

### C5. Detaljpanel troligen osynlig vid mobiltapp
`onDotClick` scrollar aldrig panelen in i vy, och `.app-right` ligger längst
ner på sidan i mobil. **Verifiera på riktig enhet först**, fixa sedan
scroll-into-view.

### C6. Riktig `<a>`-navigation + canonical-taggar sajtövergripande
Full version av B6: ersätt `<button>`+`location.href` med riktiga länkar, och
lägg canonical-taggar på samtliga sidor. Canonical-delen är billig och kan
göras fristående; länk-refaktorn kan samordnas med designrundans B6.

### C7. "Hitta ditt parti"-resultat går inte att dela
Massmarknads-kroken dör i webbläsaren. Delbar bild eller URL-parametrar (fortsatt
noll datalagring). Största räckviddshävstången före september.

### C9. Vyerna är silos
Ingen korslänkning av en fråga/ett parti mellan Spektrum / Säger-vs-gör /
Diskurs. Lägg per-fråga/parti-korslänkar; en "senaste ändringar"-yta matad av
bevakningsloopen gör sajten levande under kampanjen.

---

## Triage-sammanfattning

| Objekt | Spår | Grind | Nästa steg |
|---|---|---|---|
| A1 | Trovärdighet | Bekräfta siffra (23 av 42?) | Enradsfix i metod.html när bekräftat |
| A2 | Trovärdighet | ⛔ Metodbeslut | Notformulering + stapel-design med Niklas |
| A3 | Trovärdighet | ⛔ Metodbeslut | Schemagranularitet + backfill-semantik |
| B8 | Diskursvy | Designrunda | Ingår i designbrief |
| B6 | Diskursvy | Designrunda | Ingår i designbrief (+ canonical billig) |
| C4 | Separat | Egen brief | Surfplattebrytpunkt |
| C5 | Separat | Verifiera först | Enhetstest → scroll-into-view-fix |
| C6 | Separat | Egen brief | Länkrefaktor + canonical sajtövergripande |
| C7 | Separat | Egen brief | Delbart resultat (bild/URL-param) |
| C9 | Separat | Egen brief | Korslänkar + "senaste ändringar"-yta |
