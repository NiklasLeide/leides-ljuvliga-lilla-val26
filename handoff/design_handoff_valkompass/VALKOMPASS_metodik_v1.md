# Valkompass v1 — metodik

Grunddokument för val26:s valkompass. Definierar vad kompassen mäter, hur
matchningen beräknas, och vilka neutralitetsprinciper som gäller. Underlag för
både Claude Design (uttryck) och Claude Code (bygge). Metodiken ska redovisas
öppet på metod-sidan — kompassen är en glaslåda, inte en svart.

---

## Vad kompassen är

En diskursbaserad valkompass med **två oberoende linser** som ger **två separata
resultatgrafer**. Väljaren upptäcker att "vilket parti passar mig" beror på vad
man värderar — sakåsikter eller sätt att tänka. Kompassen är ingången till
sajtens utforskningsvyer; varje resultat länkar in i motsvarande lins med de
partierna förvalda.

Uttrycklig avgränsning: **Säger-vs-gör ingår INTE i matchningen** (att väga in
röstkonsekvens i en matchning vore att implicit värdera partiers trovärdighet —
en värdering en neutralitetssajt inte ska göra). Säger-vs-gör finns kvar som egen
utforskningslins, inte som kompass-lins.

---

## De två linserna

### Lins 1 — "Tycker som du" (position)

- **Datakälla:** positions.json (42 sakfrågor, 8 politikområden, partier på
  0-100-skala med namngivna ändpunkter).
- **Frågeformat:** ett påstående, 5-gradig svarsskala (instämmer helt → tar helt
  avstånd), plus "vet inte / hoppa över".
- **Frågeurval:** så många som datan bär, valda för att (a) täcka alla åtta
  politikområden och (b) vara maximalt särskiljande — frågor där partierna är
  spridda, inte där alla tycker lika. Undvik frågor med `unclear:true` för flera
  partier (svag grund för matchning).
- **Matchning:** ditt svar placeras på samma 0-100-axel som partiernas positioner.
  Avstånd mellan ditt svar och varje partis position per fråga → summeras
  områdesviktat → invers-omvandlas till närhet i procent.

### Lins 2 — "Tänker som du" (diskurs)

- **Datakälla:** discourse.json flytande_signifikanter (per_parti-innebörd +
  galtan_matchning per parti).
- **Frågeformat:** "När du hör X i politiken — vad tänker du främst på?" med
  svarsalternativ som speglar de faktiska innebörderna neutralt.
- **Frågeurval:** ENDAST signifikanter med både bred täckning (≥6 partier) OCH
  spridning i laddning (≥3 olika galtan_matchning-värden). Bäst lämpade, sorterat:
  trygghet (8 partier, 7 laddningar), ansvar (8/7), omstallning (8/7),
  gemenskap (8/6), energitrygghet (8/6), ordning (6/3), säkerhet (6/3),
  natomedlemskapet (7/3). Uteslut per definition begrepp som totalforsvar (bara
  2 laddningar — differentierar inte) och smaltäckta som rattsstat/kunskap (3
  partier — kan inte matcha övriga).
- **Svarsalternativens formulering:** ska spegla signifikant-datans `innebord`-fält
  neutralt, INTE nyskrivas. Varje alternativ formuleras precis så neutralt som
  partierna själva uttrycker innebörden. Inget alternativ får formuleras mer
  sympatiskt än ett annat.
- **Matchning:** ditt svar motsvarar en innebörd/laddning. Poäng per parti = andel
  av dina besvarade begreppsfrågor där partiet delar din valda laddning, räknat
  ENDAST över begrepp där partiet faktiskt har en laddning (se neutralitetsregel 3).

---

## Viktning (v1)

- **Områdesviktning:** åtta reglage efter frågorna — väljaren väger politik-
  områdena efter vad hen bryr sig om. Påverkar positionslinsens summering
  (frågor i högre viktade områden väger tyngre). Default: alla lika.
- **Parkerat till v2:** per-fråga-relevans ("extra viktig / hoppa"), lins-
  hopvägning (reglage som väger ihop de två graferna till en tredje samlad).
  Skälet: varje extra reglage är en plats där neutralitet måste verifieras under
  tidspress, och grunden (två linser, diskursmatchning) är redan det unika.

---

## Resultat

- **Två procentstaplar per parti**, en per lins, sida vid sida.
- Staplarna visar närhet i procent till varje parti (t.ex. 80% C, 65% MP, ...).
- Poängen med två grafer: när de skiljer sig ("du tycker som C men tänker som MP")
  lär sig väljaren något om sig själv. Lyft den skillnaden i resultatet, inte som
  fel utan som insikt.
- Varje stapel länkar in i motsvarande utforskningslins (Position resp. Språk)
  med topp-partierna förvalda för jämförelse.

---

## Neutralitetsprinciper (icke förhandlingsbara)

1. **Symmetrisk matematik.** Avstånd→procent-formeln mäter alla partier med samma
   linjal. Inget parti får ha inbyggd fördel av hur poängen räknas. Formeln
   redovisas explicit på metod-sidan.

2. **"Vet inte / hoppa över" utesluts helt.** En hoppad fråga räknas inte alls i
   din poäng — bara frågor du faktiskt svarat på matchas. (Alternativet, att
   räkna hopp som neutralt för alla, skulle godtyckligt gynna mittenpartier.)

3. **Partier utan laddning räknas rättvist.** I diskurslinsen: om ett parti inte
   använder ett begrepp kan det inte matchas på den frågan. Lösning: räkna varje
   partis poäng endast över de begreppsfrågor där partiet HAR en laddning, inte
   över alla ställda frågor. Annars straffas partier med smalare diskurstäckning
   godtyckligt. Redovisas på metod-sidan.

4. **Svarsalternativ smygvärderar aldrig.** Varje alternativ speglar partiernas
   egna neutralt formulerade innebörder. Ingen formulering görs mer tilltalande.

5. **Ingen hopvägning som gynnar riktning.** De två linserna hålls åtskilda i v1
   just för att en hopvägning återinför godtycklig viktning. Två ärliga grafer
   slår en skenbart exakt sammanvägd siffra.

6. **Glaslåda.** Hela metodiken — frågeurval, formler, hur hopp och saknad
   laddning hanteras — redovisas öppet på metod-sidan. På en sajt vars värde är
   öppenhet får kompassen inte vara en svart låda.

---

## Vad som INTE ska hända (fallgropar)

- Kompassen får inte bygga diskursfrågor på smaltäckta signifikanter (orättvis
  matchning för partier som saknar begreppet).
- Svarsalternativ får inte nyskrivas fritt — de ska spegla innebord-fälten.
- Matchningsformeln får inte vara dold eller asymmetrisk.
- Säger-vs-gör får inte smyga in i matchningen (värderar trovärdighet).
- Resultatet får inte presenteras som ett enda "rätt" parti — alltid staplar,
  alltid två grafer.
