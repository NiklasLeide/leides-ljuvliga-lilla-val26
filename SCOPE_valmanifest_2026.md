# Scope — valmanifest 2026 som tilläggskälla i positions.json

Scope-dokument enligt RESEARCH_AGENT.md (scope diskuteras och godkänns innan
research påbörjas). Fastställer omfattning, metod, neutralitetsregler och
beslutspunkter. Ingen data skrivs förrän Niklas godkänt fynden.

**Bakgrund:** källauditen 2026-07-20 visade att **noll av 336 positioner** vilar
på något partis 2026-valdokument, trots att fem funnits i månader. Dessutom en
strukturell snedfördelning i egen-röst-täckning: SD har 0 citat till sd.se, C har
2 (båda samma URL). Två partier beskrivs alltså nästan uteslutande genom
riksdagshandlingar och andras dokumentation.

---

## Varför detta görs

1. **Position-linsen frågar "Var står partierna i sakfrågorna?"** — inte "hur har
   de röstat". Med 167 betänkanden mot 3 partiprogram mäter positions.json idag
   i praktiken röstningsbeteende, vilket delvis dubblerar säger-vs-gör-linsen.
2. **Valmanifestet är den mest auktoritativa källan på var ett parti står i ett
   val.** Att sakna dem åtta veckor före valdagen är ett färskhetsproblem.
3. **Egen-röst-asymmetrin är en neutralitetsrisk.** Att SD:s och C:s ståndpunkter
   nästan helt härleds ur andras dokumentation är angripbart med rätta.

---

## Vad som ingår

**Fem dokument (~156 sidor):**

| Parti | Dokument | Sidor | Publicerat | Not |
|---|---|---|---|---|
| S | Plan för Sverige (Valplattform) | 4 | 2026-02-05 | |
| V | Valplattform efter kongressbeslut | 4 | 2026-04-19 | Preliminär — se beslut 1 |
| L | För din frihet. Valmanifest 2026 | 40 | 2026-06-02 | |
| C | Sverige kan mer. Valmanifest 2026 | 96 | 2026-06-16 | |
| SD | Valplattform 2026 | 12 | 2026-07-10 | Ersätter 2022 års plattform |

**Omfattning:** alla 42 sakfrågor × de fem partierna. Manifestet läggs till som
**tilläggskälla** — det ersätter aldrig befintliga källor, det kompletterar dem.
En position kan vila på både betänkande och manifest.

**M, KD, MP saknar manifest.** Frånvaron redovisas explicit (befintlig princip:
frånvaro är ett fynd, fylls aldrig i). Om något publiceras i augusti tas de i en
andra runda.

---

## Vad som INTE ingår

- Ändringar i voting.json, discourse.json eller galtan.json.
- Nya sakfrågor. Endast de 42 befintliga.
- Egen-röst-komplettering för M/KD/MP ur deras webbplatser — verkligt behov, men
  eget arbete (se "Uppföljning").
- Omskrivning av `summary`-fält där manifestet inte tillför något.
- Copy-passet.

---

## Metod — tre steg

Följer v3-mönstret: deterministisk verifiering först, modellen dömer bara det
omätbara, ett fixvarv. Följer DEC-007: extraktion är binärt verifierbar och kan
loopas; positionsbedömningar är tolkande och går genom Niklas före skrivning.

### Steg 1 — Extraktion (loopas, grep-verifierad)

- PDF → text lokalt (deterministiskt, noll tokens).
- Per manifest och sakfråga: säger dokumentet något om frågan? Om ja, extrahera
  **ordagrant citat + sidhänvisning**.
- **Grep-verifiering av varje citat mot manifesttexten** — facit är texten, inte
  modellens läsning. Citat som inte greppar rakt av kastas eller korrigeras.
- Utfall: extraktionskatalog per parti. Tystnad i en fråga noteras som tystnad.

### Steg 2 — Bedömning (presenteras för Niklas, skrivs inte)

Per extraherat uttalande, en av tre utfall:

| Utfall | Innebörd | Kräver beslut? |
|---|---|---|
| **Bekräftar** | Manifestet stödjer befintlig position | Nej — källa läggs till |
| **Flyttar** | Manifestet anger annan position än nuvarande | **Ja** — förslag + belägg |
| **Klargör** | Frågan är `unclear: true`, manifestet ger besked | **Ja** — förslag + belägg |

Levereras som **ett samlat granskningsdokument** strukturerat per beslutstyp
(samma mönster som GRANSKNING-4-omraden.md), inte per parti eller fil. Bekräftar-
fallen listas som bilaga, inte som beslut.

### Steg 3 — Skrivning (efter godkännande)

- Källor läggs till, positioner justeras enligt godkända beslut.
- **Kompasskontroll efter skrivning** (se Beroenden).
- PR mot master. Niklas mergar.

---

## Neutralitetsregler för detta arbete

1. **Sidantal får aldrig bli täckningsgrad.** C har 96 sidor, S och V har 4.
   Ett kort manifest som tiger i en fråga betyder att dokumentet inte tar upp den
   — inte att partiet är otydligt. **`unclear: true` sätts aldrig på grund av att
   ett manifest är kort.** Täckningsnot per parti anger hur många av 42 frågor
   manifestet faktiskt berör.

2. **Tystnad är inte belägg.** Om manifestet inte nämner en fråga ändras
   ingenting — varken position, källa eller osäkerhetsmarkering.

3. **Manifest kontra röstning: notera, ersätt inte.** RESEARCH_AGENT.md varnar
   att valrörelsedokument kan vara taktiska. När manifestet motsäger
   röstningsmönstret är det ett **fynd**: positionen kan flyttas (positions.json
   redovisar vad partierna säger), men diskrepansen noteras och flaggas som
   material till säger-vs-gör-linsen. Manifestet får aldrig tyst skriva över ett
   belagt röstningsmönster.

4. **Ordagranna citat, klickbara källor.** Format enligt RESEARCH_AGENT.md:
   dokumenttitel + URL + sidhänvisning. Inga ståndpunkter utan verifierbar källa.

5. **"Otydlig" är ett giltigt utfall.** Tvinga aldrig en placering för att
   manifestet är vagt.

6. **Symmetrisk behandling.** Samma extraktionsdjup och samma
   bedömningsstringens för alla fem partier, oavsett dokumentets längd, ton eller
   parti.

---

## Beslut som behövs från dig innan start

**1. V:s preliminära plattform — använda eller vänta?**
Dokumentet är märkt preliminärt men bygger på kongressbeslut. *Rekommendation:*
använd, märkt som preliminär i källhänvisningen. Att utesluta V vore att lämna
partiet utan egen röst medan fyra andra får det.

**2. M:s kampanjsida — egen-röst-källa eller inte?**
M har inget dokument, men kampanjsidan har 16 vallöften i partiets egen röst
(snapshot 2026-07-20 finns). *Rekommendation:* använd, tydligt märkt
"kampanjsida, ej manifest". Det minskar egen-röst-asymmetrin utan att låtsas att
M har ett manifest. Alternativet är att M står helt utan egen röst i
valrörelsedata.

**3. Positionsjusteringar i samma runda som källtillägg?**
*Rekommendation:* ja, samma runda. Att lägga till ett manifest som källa till en
position manifestet motsäger vore sämre än att justera. Alla flyttar flaggas för
dig med belägg.

---

## Beroenden och risker

**Kompassen deriverar från positions.json.** Varje flyttad position ändrar
matchningarna i "Tycker som du". Efter skrivning måste därför köras om:
- Differentieringströskeln per kompassfråga (spridning ≥40) — en fråga kan falla
  under tröskeln om positioner konvergerar, och måste då plockas ur
  frågeuppsättningen.
- Kompassens frågeformuleringar mot eventuellt ändrade skaländpunkter.

**Beslutsvolym.** DEC-007:s regel om ≤5 "Kräver beslut" gäller autonoma
loop-PR:er, inte chattgranskade batchar. Den här granskningen följer
GRANSKNING-mönstret (ett dokument, beslut per typ, förberedda lösningar där
prejudikat finns) och kan därför rymma fler poster. Om flyttarna blir fler än
~20 delas granskningen per område.

**Färskhetsmarkering (SITE_BACKLOG A3).** Med manifest inne blir "senast
granskad"-datum både mer värdefullt och mer meningsfullt. Förslag: rider med i
samma PR — schemafält + ifyllnad för de positioner som rörs.

**Biprodukt värd att fånga:** manifestlöften är framtida "säger"-material för
säger-vs-gör-linsen. Extraherade löften som rör bevakade frågor bör noteras för
voting.json:s `promises`-fält, även om de inte skrivs in i denna runda.

---

## Leverans

1. Extraktionskatalog per parti (grep-verifierad), på gren.
2. `drafts/GRANSKNING-valmanifest-2026.md` — ett dokument, beslut per typ.
3. Efter godkännande: PR med källtillägg, godkända positionsjusteringar,
   kompasskontroll och färskhetsdatum.

---

## Uppföljning (utanför denna runda)

- **Egen-röst-komplettering för M, KD, MP** ur deras webbplatser. SD löses av
  denna runda, C delvis — men KD (8 citat) och MP (9) är också tunna, och M har
  6. Eget scope.
- **Andra rundan om M/KD/MP publicerar manifest** i augusti.
- **Bevakningsloopen** — hade flaggat SD:s plattform 10 juli i stället för att
  den upptäcktes 20 juli av en manuell avsökning.
