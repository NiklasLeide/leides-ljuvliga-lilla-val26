# val26 — arkitektur-not

Helhetsramen för ombyggnaden av val26.leide.se. Alla byggetapper hänger på den.
Beskriver strukturen Claude Design faktiskt byggt (juli 2026) — läses TILLSAMMANS
med Designs handoff-paket (de sex/sju .dc.html-filerna + README + design-tokens)
och kompass-metodiken (VALKOMPASS_metodik_v1.md). Designfilerna är referens att
ÅTERSKAPA i den befintliga vanilla HTML/CSS/JS-stacken, inte kod att kopiera.

---

## Bärande princip

Sajten är **en guide till partierna, sedd genom linser** — inte sju sidoställda
verktyg. Innehållet är partierna och sakfrågorna; varje lins är ett perspektiv på
samma innehåll. Väljaren möts av sin egen fråga, inte av analytikerns kategori.

Detta ersätter den gamla arkitekturen (sju silo-flikar: Spektrum/Kluster/
Praktik/GAL-TAN/Diskurs/Hitta-parti/Metod). Silo-vyerna pensioneras när deras
innehåll finns i den nya strukturen.

---

## Struktur: fem ytor + startsida + metod

Vänsterrads-navigation märkt **"Din fråga"**. Varje lins är en egen sida med egen
URL (löser gamla `<button>+location.href` — nu riktiga `<a>`, mid-click/prefetch/
crawlbarhet/a11y; canonical-taggar på alla sidor).

**Startsida** — överblick + ingång. Statistik (8 partier, N voteringar, N begrepp)
+ kort för linserna med förhandsvisning.

**Fem linser, var och en formad som en väljarfråga:**

| Fråga (nav) | Lins | Vad den visar |
|---|---|---|
| Vilket parti ligger närmast dig? | **Valkompass** | Matchning, två grafer (se nedan) |
| Var står partierna i sakfrågorna? | **Position** | Partiernas positioner på fråghspecifika 0-100-skalor |
| Håller orden när det blir votering? | **Säger vs gör** | Ord mot röst, fördelning + avvikelser framlyfta |
| Vad menar de egentligen med orden? | **Språk** | Diskurs: begrepp (samma ord, olika innebörd) + partiprofiler |
| Vart är partierna på väg? | **GAL-TAN** | Position + rörelse över tre val, neutral karta |

**Om metoden** — neutralitetsprinciper, datakällor, förbehåll, kompassens formler.

Kompassen är FÖRSTA nav-punkten: den fråga en väljare ställer först, och ingången
till resten.

---

## Genomgående mekaniker

**Jämför/fördjupning (i varje lins).** Överblick = alla partier. Partichips-rad +
klickbara noder i grafen SPEGLAR varandra: klicka i grafen → chippet tänds, tryck
chip → grafen svarar. Väljer man några partier lyfts de fram, resten tonas ner
("Rensa" nollställer). Nyckelanvändning: "velar mellan C och L — visa var de
skiljer sig", fungerar i varje lins, urvalet följer med mellan linser.

**Områdes-toner som orientering.** Varje sakområde har en egen lågmättad
bakgrundston som följer med genom alla linser. Tonerna har IDENTISK ljushet och
mättnad (`oklch(0.95 0.02 [hue])`) — ingen ton "vinner", och läsaren tappar aldrig
vilket område hen är på. Linser utan sakområde (GAL-TAN-kartan) är neutralt tonade.

**Korslänkning.** Kompassresultatet länkar in i Position resp. Språk med
topp-partierna förvalda. Linserna är inte silos — samma fråga/parti kan följas
tvärs över perspektiv.

---

## Neutralitet (inbyggd i arkitekturen, ej påklistrad)

- **Färg värderar aldrig en position.** Endast partifärger är mättade; axlar och
  linjaler är alltid grå. GAL-TAN-kartan har INGEN grön=frihetlig-bra/
  röd=auktoritär-dålig-gradient — det var en uttrycklig rättning.
- **Axlar är linjaler, inte betyg.** Ingen riktning bättre än en annan.
- **Frånvaro redovisas** — parti som inte använder ett begrepp, fråga som inte
  nått votering: sägs uttryckligen.
- **Otydliga positioner märks** (streckad ring, sänkt ton), döljs/gissas aldrig.
- **Tre statusfärger med fast innebörd** (stämmer/delvis/inväntar) beskriver
  kongruens ord↔handling, ALDRIG politisk riktning.

---

## Valkompassen (femte ytan — metodik i VALKOMPASS_metodik_v1.md)

Två oberoende linser, två separata procentgrafer, aldrig ett sammanvägt "rätt"
parti:
- **"Tycker som du"** — sakåsiktsfrågor mot positions.json
- **"Tänker som du"** — begreppsfrågor mot discourse.json (samma ord, vilken
  innebörd delar du)
- Områdesviktning efter frågorna; resultat länkar in i Position/Språk.
- Glaslåda: formler öppet på Om metoden. Delning ger bild/länk UTAN att lagra
  svar (länken bär bara graferna).

Säger-vs-gör ingår AVSIKTLIGT INTE i matchningen (skulle implicit värdera
trovärdighet).

---

## Etappindelning (sajten är live mid-valrörelse — inget stort big-bang)

Rollout i etapper, fungerande sajt mellan varje, varje etapp egen PR + granskning:

1. **Skelett + en lins.** Bygg ram (vänsterrads-nav, områdes-toner, jämför-
   mekanik, riktiga `<a>`+canonical) + koppla EN lins mot riktig data. GAL-TAN
   föreslås (mest genomarbetad data + design). Övriga som platshållare.
2. **Position** — fråghspecifika skalor, jämför-mekanik, citatkort.
3. **Säger vs gör** — BÄR sin trovärdighetsfix: synlig fördelning
   (stämmer/delvis/inväntar) + metodnot om varför "stämmer" dominerar +
   avvikelser framlyfta (inte begravda i grönt).
4. **Språk** — begrepp ↔ parti-växling; begreppen som primär ingång.
5. **Valkompassen** — kräver full frågeuppsättning (INTE prototypens 10 —
   upp till 42 positionsfrågor + alla kvalificerande begreppsfrågor). Bygg mot
   den NEUTRALITETSSTÄDADE discourse.json (efter neutralitets-PR), aldrig före.
6. **Överblick-väv + metod** — startsida, korslänkar, Om metoden komplett; gamla
   silo-sidor retireras.

Etappordningen är ett förslag; Position/Säger-vs-gör/Språk kan gå i valfri
ordning efter etapp 1.

---

## Kända bygg-noter (från prototyp → produktion)

- **Prototypernas datamängd är skiss.** Flera vyer täcker bara Skola + Ekonomi i
  prototypen. Produktion använder full data (alla 8 områden, alla 42 sakfrågor,
  alla 20 signifikanter enligt urvalsreglerna).
- **Kompassens 0%-fall.** Med få begreppsfrågor hamnar partier på 0% i
  Tänker-grafen (matematiskt korrekt men ser hårt ut). Full frågeuppsättning
  jämnar ut; presentera 0% som "ingen överlappning på dessa begrepp", ej som dom.
- **x-dc → vanilla.** Designfilerna är i Designs komponentformat (`x-dc`,
  `sc-if`/`sc-for`/`{{}}`). Återskapas i befintlig vanilla-stack; all styling är
  inline på elementen (mått läses direkt).
- **Tokenisera vid bygget.** Partifärger + statuspasteller är hårdkodade i data/
  komponenter idag; CLAUDE.md vill ha dem som tokens. Bygget är rätt tillfälle
  (design-tokens.md finns som SSOT-underlag).
- **Reformkartan-CSS-fällor** gäller fortsatt: overflow-x/y bryter scroll;
  height:100% i flex/grid → 0 för absoluta barn; självständiga HTML-filer (token/
  nav-ändring kräver ALLA filer); clearDetail()/renderDefault() kraschar efter
  innerHTML-swap; mobilproblem dyker upp sent (tablet-gap 481-1024px, detaljpanel
  scroll-into-view).

---

## Parkerat till copy-passet (eget spår, efter design)

Copy-passet klarspråkar hela sajten: telegramstil → väljarprosa, jargong
("nodalpunkter", "flytande signifikanter") → begripliga ord med facterm i tooltip,
3-C (SD:s oattribuerade omdömen). **Ny princip in i copy-passet:** verktygen
beskriver vad de MÄTT, inte vad du ÄR. Kompassens "du tycker/du tänker" mildras
till "dina svar liknar mest" — en tiofrågekompass avslöjar inte din själ, den
mäter en likhet. Samma logik som "GAL-TAN är en linjal, inte ett betyg".

---

## Parkerat till v2

Kompassens per-fråga-relevans + lins-hopvägning; polling-aggregation;
bevakningsloopens "senaste ändringar"-yta på sajten.
