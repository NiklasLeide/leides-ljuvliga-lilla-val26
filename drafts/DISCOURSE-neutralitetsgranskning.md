# Neutralitets- och strukturgranskning — data/discourse.json

**Status:** GRANSKAD → DELVIS ÅTGÄRDAD. Niklas har beslutat; godkända
korrigeringar införda i `data/discourse.json` (v0.5.0 → v0.5.1) på grenen
`neutralitetsstadning` (PR, ej mergad). Se **FIX-LOG** sist i dokumentet.
Kvarvarande poster (Del 3-C, "intressant spänning") är parkerade enligt beslut.
**Granskad fil:** `data/discourse.json` (v0.5.0) — 8 partier × 8 områden + 20 flytande signifikanter.
**Täckning:** samtliga 1 288 textfält extraherade och granskade — `beskrivning`,
`analytisk_kommentar`, `per_parti.innebord/exempel`, `overordnad_inramning`,
per-område `inramning`, `nyckelbegrepp.innebord/underforstadd_premiss`,
`retoriska_strategier` (båda nivåer), `galtan_kongruens` (parti- och områdesnivå),
`kontrast_med`. Analytikerröst-fälten (analytisk_kommentar, overordnad_inramning,
galtan-förklaringar) lästes i sin helhet; övriga fält svepta med riktade
ord-grep mot verdikt-, döljande- och redaktionsmarkörer.

**Metodprincip för förslagen:** en neutral omskrivning ska bevara det analytiska
innehållet — **spridning och riktning per kongruensprincipen** — men ta bort
domen. Attribuerad partiframställning ("SD ramar in…", citat inom citattecken,
`underforstadd_premiss` som återger partiets egen premiss) räknas **inte** som
verdikt och lämnas orörd; det som flaggas är analytikerns egen värdering.

## Sammanfattning (räkning)

| Del | Fynd |
|-----|------|
| **Del 1 — Värderande språk** | **10 fält flaggade**: 2 förhandsgodkända omskrivningar + 3 tydliga analytikerverdikt (Tier A) + 5 gränsfall (Tier B). Plus en "övervägd-men-behållen"-lista. |
| **Del 2 — Strukturell skevhet i `overordnad_inramning`** | **5 av 8** leder med ett enskilt politikområde (KD, L, MP bekräftade av Niklas; **M och C** samma mönster) i stället för partiets övergripande ram. 3 av 8 (SD, S, V) leder med den övergripande ramen — modell. |
| **Del 3 — Övrig tvärpartisk inkonsekvens** | **3 fynd**: (a) redaktionella artefakter läckta in i två `inramning`-fält; (b) asymmetrisk märkning av `retoriska_strategier` (SD får avslöjande/pejorativa etiketter, övriga neutrala); (c) oattribuerad partiröst i `overordnad_inramning`. |

---

## Del 0 — Förhandsgodkända omskrivningar (Niklas redan beslutat — förs in som de står)

### PF-1 · `flytande_signifikanter.trygghet.analytisk_kommentar`

**Nuvarande (verdikt):** "Begreppet har **kapats**. Den **ursprungliga**
socialdemokratiska definitionen … har **eroderats**. SD och M har **lyckats**
omfördela begreppets innebörd mot **brottsrädsla** … V **försvarar den gamla
definitionen** från en **alltmer marginell** position."

**Ersätts med (godkänd):**
> Partierna lägger fundamentalt olika innebörd i "trygghet". S:s användning rör
> sig mellan social välfärdstrygghet och fysisk säkerhet från brott. SD och M
> betonar fysisk säkerhet — M genom att koppla trygghet till individuell frihet,
> SD till kulturell och etnisk hemhörighet. KD lägger till en familjedimension.
> L, C och MP betonar förebyggande och rehabiliterande dimensioner. V betonar
> social och ekonomisk trygghet som brottsförebyggande. Tyngdpunkten i begreppet
> skiljer sig alltså tydligt mellan blocken.

### PF-2 · `flytande_signifikanter.energitrygghet.analytisk_kommentar`

**Nuvarande (verdikt):** "Tidöblocket har **lyckats etablera** … S har rört sig
från förnybartfokus till alla kraftslag — en diskursiv **kapitulation** inför
Tidöblockets begreppsapparat."

**Ersätts med (godkänd):**
> "Planerbar kraft" fungerar i Tidöblockets användning i praktiken synonymt med
> kärnkraft. MP:s "grön baskraft" är ett motbegrepp som kopplar loss
> trygghetsbegreppet från kärnkraft. C utmanar via marknadsargument (kostnad),
> V via ägandefrågan (infrastruktur i offentlig ägo). S har rört sig från fokus
> på förnybart mot ett alla-kraftslag-perspektiv, närmare Tidöblockets
> begreppsanvändning.

---

## Del 1 — Värderande språk

### Tier A — Tydliga analytikerverdikt (rekommenderas åtgärdas)

#### F1 · `partier.M.diskursprofil.galtan_kongruens.forklaring`
- **Citat:** "TAN i praktik men med liberal retorisk **fernissa**. M undviker SD:s etnokulturella ramverk och använder individansvar, systemhållbarhet och frihet som legitimerande principer."
- **Problem:** "fernissa" (fernissa/ytskikt) är pejorativt — det påstår att M:s liberalism är en kosmetisk yta över en "egentlig" TAN-kärna, alltså en dom om oärlighet snarare än en beskrivning av glappet retorik/sakinnehåll.
- **Förslag (bevarar riktning: TAN i sak, liberal i form):**
  > TAN-lutning i sakinnehåll, liberal i retorik. M undviker SD:s etnokulturella ramverk och legitimerar i stället sina positioner via individansvar, systemhållbarhet och frihet.

#### F2 · `partier.M.per_omrade.forsvar.galtan_kongruens`
- **Citat:** "…vilar i stället på handlingskraft och effektivitet — samma **liberalt fernissade** TAN som präglar partiets övriga diskurs."
- **Problem:** samma "fernissa"-metafor som F1.
- **Förslag:**
  > …vilar i stället på handlingskraft och effektivitet — samma kombination av liberal retorik och TAN-lutning som präglar partiets övriga diskurs.

#### F3 · `partier.M.per_omrade.klimat.nyckelbegrepp[alla kraftslag].innebord`
- **Citat:** "Inkluderande formulering som **döljer** att kärnkraft prioriteras"
- **Problem:** "döljer" tillskriver M ett avsiktligt döljande. Den analytiska poängen — att formuleringen är inkluderande men kärnkraft rankas först — kan behållas utan avsiktspåståendet.
- **Förslag (bevarar poängen):**
  > Inkluderande formulering där kärnkraft i praktiken prioriteras

### Tier B — Gränsfall (mildare, valfria)

#### F4 · `partier.SD.per_omrade.klimat.nyckelbegrepp[politisk nedläggning].underforstadd_premiss`
- **Citat:** "S/MP bar ansvaret — kausalitet **konstrueras retroaktivt**"
- **Problem:** "konstrueras retroaktivt" är analytikerkommentar (påstår att kausaliteten fabriceras i efterhand) inbäddad i ett premissfält som annars ska återge partiets egen premiss. Poängen (efterhandstillskrivning) kan behållas neutralt.
- **Förslag:**
  > Ansvaret för kärnkraftsnedläggningen tillskrivs S/MP i efterhand

#### F5 · `flytande_signifikanter.ansvar.analytisk_kommentar` och `…gemenskap.analytisk_kommentar` (2 fält)
- **Citat:** "Ansvarsbegreppet **avslöjar** partiernas grundläggande samhällssyn." / "Gemenskapsbegreppet **avslöjar** den djupaste ideologiska skiljelinjen."
- **Problem:** "avslöjar" (blottlägger/exponerar) antyder att något dolt avslöjas; mild men värderande. Övrig text i båda fälten är neutral och behålls.
- **Förslag:** byt "avslöjar" → **"speglar"** eller **"synliggör"**.

#### F6 · `partier.V.diskursprofil.galtan_kongruens.forklaring` och `…V.per_omrade.klimat.galtan_kongruens` (2 fält)
- **Citat:** "Konsekvent GAL men med **intressant** spänning i klimat…" / "Stark GAL men med **intressant** spänning."
- **Problem:** "intressant" är en analytiker-värdering (talar om för läsaren vad som är intressant). Spänningen är reell och beskrivs korrekt i övrigt.
- **Förslag:** stryk "intressant" → "…men med en spänning i klimat…".

*(F-numret för `SD.diskursprofil.overordnad_inramning`, "misslyckad vänsterliberal
politik" / "förfall", hanteras i Del 3-C tillsammans med röst-konventionen, eftersom
det är samma strukturfråga för alla `overordnad_inramning`.)*

### Övervägt men BEHÅLLET (attribuerad partiframställning — ej verdikt)

Dessa innehåller laddade ord men är korrekt attribuerade till partiets egen
diskurs (via "X ramar in…", citat, eller `underforstadd_premiss`) och bör **inte**
ändras — att ta bort dem skulle förvanska referatet av partiets egen framställning:

- `V …lägre skatt.per_parti[V].innebord` — "skattebortfall som urholkat välfärden" (V:s egen term).
- `S …valfrihet.per_parti[S].*`, `S.vard.*` — "marknadsmisslyckanden" (S:s term, inom citattecken).
- `SD.skola.inramning` / `SD.forsvar.inramning` — "i förfall" / "förfallsberättelse" (attribuerat: "SD ramar…", namnger SD:s egen förfallsberättelse som retorisk struktur).
- `V.ekonomi.*`, `V.demokrati.inramning` — "misslyckande", "urholkas inifrån" (V:s attribuerade kausalberättelse).
- `SIG…totalforsvar.analytisk_kommentar` — "SD **laddar** det med förfall" (beskriver SD:s laddning, inte analytikerns dom).
- `V.forsvar.galtan_kongruens` — "**marginell** TAN-drift" (kvantitativt, källhänvisat till galtan.json — inte verdikt).

---

## Del 2 — Strukturell skevhet i `overordnad_inramning`

`overordnad_inramning` ska sammanfatta partiets **hela** diskurs över alla 8
områden. Idag leder **5 av 8** med ett enskilt politikområde (oftast
kriminalpolitik) i stället för partiets övergripande ram — medan 3 av 8 leder med
den övergripande ramen och därmed utgör modell.

| Parti | Leder idag med | Övergripande kärna (finns redan i materialet) | Bedömning |
|-------|----------------|-----------------------------------------------|-----------|
| **SD** | Nationellt förfall/återupprättelse | (samma) | ✅ Modell — leder med ram |
| **S** | Nationell kris / "samhället kliver fram" | (samma) | ✅ Modell — leder med ram |
| **V** | Klassojämlikhet | (samma) | ✅ Modell — leder med ram |
| **KD** | **Brottslighet** | Starka familjer / normer / förvaltarskap | ⚠️ Bekräftad — leder med område |
| **L** | **Liberal kriminalpolitik** | Liberal grundhållning i spänning med Tidöpraktik | ⚠️ Bekräftad — leder med område |
| **MP** | **Brott** (förebyggs via segregation) | Klimatkrisen som organiserande princip | ⚠️ Bekräftad — leder med område |
| **M** | **Lag och ordning** | Individuell frihet som legitimerande princip | ⚠️ Samma mönster (utöver Niklas trio) |
| **C** | **Pragmatisk kriminalpolitik** | Pragmatisk/icke-ideologisk hållning; marknad + landsbygd | ⚠️ Samma mönster (svagast) |

**Förslag på omordning — endast omordning/omvägning av befintligt innehåll, inget nytt påhittat:**

**KD** — nuvarande: *"Brottslighet bekämpas genom starka familjer och tydliga normer; migration kräver ansvar och humanitet; energipolitik bygger på teknikneutralitet och förvaltarskap"*
> Starka familjer och tydliga normer som samhällets grund: brottslighet bekämpas genom familj och normer, migration kräver ansvar och humanitet, energipolitik bygger på teknikneutralitet och förvaltarskap
*(Lyfter familj/normer/förvaltarskap — som redan är mekanismen i klausul 1 och 3 — till ledet.)*

**L** — nuvarande: *"Liberal kriminalpolitik som söker balans; Tidösamarbetets spänning som diskursiv utmaning; kärnkraft som klimatlösning"*
> Liberal grundhållning i spänning med Tidösamarbetets praktik som partiets övergripande diskursiva läge; kriminalpolitik som söker balans; kärnkraft som klimatlösning
*(Befordrar den liberala ramen + Tidöspänningen — som L:s egen galtan-förklaring redan gör central — till ledet. **OBS:** L:s fält är innehållsmässigt tunt — tre områdesklausuler med "liberal" som bindeord. En genuin övergripande ram kan kräva att Niklas tillför en mening; det vore nytt innehåll och görs inte här.)*

**MP** — nuvarande: *"Brott förebyggs genom att bekämpa segregation; migration kräver mänskliga rättigheter och barnperspektiv; klimatkrisen kräver grön omställning med förnybar energi och energilagring — inte kärnkraft"*
> Klimatkrisen som organiserande princip: grön omställning med förnybar energi och energilagring — inte kärnkraft; brott förebyggs genom att bekämpa segregation; migration kräver mänskliga rättigheter och barnperspektiv
*("som organiserande princip" är ordagrant hämtat ur MP:s egen `galtan_kongruens.forklaring` — alltså MP:s dokumenterade ram, inte påhittat.)*

**M** (utöver Niklas trio) — nuvarande: *"Sverige behöver lag och ordning genom ett perspektivskifte, restriktiv men rättvis migrationspolitik, och en energipolitik där klimatmål nås genom fossilfri teknik utan att begränsa individuell frihet"*
> Individuell frihet som legitimerande princip: lag och ordning genom ett perspektivskifte, restriktiv men rättvis migrationspolitik, och en energipolitik där klimatmål nås genom fossilfri teknik utan att begränsa friheten
*("Frihet som legitimerande princip" är M:s egen galtan-förklaring, ord för ord.)*

**C** (utöver Niklas trio, svagast fall) — nuvarande: *"Pragmatisk kriminalpolitik utan enkla lösningar; öppen migrationspolitik med fokus på arbetskraft; marknadsdriven energiomställning med förnybart i centrum"*
> Pragmatisk, icke-ideologisk hållning över områdena: kriminalpolitik utan enkla lösningar, öppen migrationspolitik med fokus på arbetskraft, marknadsdriven energiomställning med förnybart i centrum
*(C har ingen enskild dominerande kärna i fältet; "pragmatisk snarare än ideologisk" är C:s egen galtan-formulering. Lägst prioritet — kan lämnas.)*

---

## Del 3 — Övrig tvärpartisk inkonsekvens

### 3-A · Redaktionella artefakter läckta in i datafält (2 fält)

Två `inramning`-fält inleds med en redaktionsnotis (uppenbarligen från
batch-granskningsprocessen) inklämd i asterisker och prefixad med partikoden.
Det är inte innehåll och bör strykas ur datafältet:

- **`partier.SD.per_omrade.forsvar.inramning`** börjar med:
  `SD *Inramning, nyckelbegrepp, retoriska strategier och kontrast är samstämmiga.*` → **stryk prefixet**, låt fältet börja på "SD ramar in försvaret främst…".
- **`partier.S.per_omrade.forsvar.inramning`** börjar med:
  `S *Inramningens kärna, galtan_kongruens och kontrast är samstämmiga* (tilläggsdimensionen kring nyckelbegrepp/retorik redovisas ovan).` → **stryk prefixet**, låt fältet börja på "S ramar in försvarsfrågan…".

*(Detta är ren städning, inte en neutralitetsfråga — men det påverkar det som
renderas i sajten, så det bör beslutas samtidigt.)*

### 3-B · Asymmetrisk märkning av `retoriska_strategier`

På `diskursprofil`-nivå får **SD ensamt** avslöjande/pejorativa etikettnamn medan
alla andra partier får neutrala eller positivt laddade etiketter för funktionellt
jämförbara grepp:

| Parti | Exempel på etiketter | Ton |
|-------|----------------------|-----|
| **SD** | "Eufemisering av exkludering", "Affektiv kontrast och **förlöjligande av motståndare**", "Folk-mot-elit-antagonism (**populistisk** diskursiv struktur)" | avslöjande / pejorativ |
| M | "Perspektivskifte-retorik", "Kvantifiering av resultat" | neutral |
| KD | "Stram men human", "Teknikoptimism och förvaltarskap" | neutral/positiv |
| L | "Humanism-realism-balans" | neutral/positiv |
| C | "Landsbygdsperspektiv som tillgång" | neutral/positiv |
| MP | "Barnrättsperspektiv", "Förebyggande som huvudstrategi" | neutral/positiv |
| **V** | "Folklig förankring via Sverigebiljetten" | neutral/positiv |

**Tydligaste inkonsekvensen:** SD:s folk-populistiska appell märks
"Folk-mot-elit-antagonism (populistisk)", medan V:s funktionellt likartade
folkliga appell märks "Folklig förankring". Samma diskursiva grepp, olika
laddning i etiketten.

**Förslag till Niklas (beslut, inte färdig omskrivning):** antingen (a) neutralisera
SD:s etiketter till samma beskrivande register som övrigas ("Nostalgisk
återupprättelseretorik", "Folk–elit-antagonism", "Återvandring inramad som human
lösning", "Affektiv kontrast mot motståndare"), **eller** (b) tillämpa samma
analytiskt avslöjande register konsekvent på alla partier. Nuläget — avslöjande
för ett parti, smickrande för resten — är den skeva mellanvägen.

### 3-C · Oattribuerad partiröst i `overordnad_inramning`

Alla `overordnad_inramning` är skrivna i **fri indirekt partiröst** utan
attribution ("Sverige är i förfall…", "Sverige behöver lag och ordning…",
"Sverige står inför en nationell kris…"). Konventionen är symmetrisk, men för SD
innebär den att omtvistade politiska omdömen ("Sverige är i **förfall**",
"**misslyckad** vänsterliberal politik") står i en oattribuerad mening och kan
läsas som att tjänsten själv påstår dem.

**Beslut för Niklas (påverkar alla 8 fält):**
- **Alt. 1 — behåll** fri indirekt röst (symmetriskt; förutsätter att UI:t tydligt ramar fältet som "partiets egen självbild").
- **Alt. 2 — lätt attribution** på alla 8, t.ex. prefix "I partiets inramning: …" eller "SD:s självbild: …". Neutraliserar SD-fallet utan att röra sakinnehållet. Exempel:
  > I SD:s inramning är Sverige i förfall till följd av massinvandring och vänsterliberal politik; återupprättelse kräver kulturell homogenitet, strikt brottsbekämpning och återvandring.

---

## Beslutschecklista för Niklas

- [ ] **Del 0:** PF-1, PF-2 — förs in som de står (redan godkända).
- [ ] **Del 1 Tier A:** F1, F2, F3 — godkänn neutrala omskrivningar?
- [ ] **Del 1 Tier B:** F4, F5, F6 — åtgärda eller lämna (mildare)?
- [ ] **Del 2:** KD, L, MP omordningar (bekräftat mönster) + M, C (samma mönster) — godkänn per parti? L kräver ev. eget ställningstagande (tunt fält).
- [ ] **Del 3-A:** stryk två artefakt-prefix (ren städning).
- [ ] **Del 3-B:** neutralisera SD:s strategietiketter (a) eller tillämpa avslöjande register på alla (b)?
- [ ] **Del 3-C:** behåll fri indirekt röst (alt. 1) eller lätt attribution på alla 8 (alt. 2)?

*Ingen ändring förs in i `data/discourse.json` förrän Niklas kryssat av ovan.*

---

## FIX-LOG (2026-07-07 — gren `neutralitetsstadning`, PR ej mergad)

Niklas granskat och beslutat. `data/discourse.json` bumpad **v0.5.0 → v0.5.1**
(+ `senast_uppdaterad` 2026-07-07). 18 fält/rader ändrade in-place (minimal diff).
Alla ändringar verifierade: unik träff per sökning, JSON validerar efter edit.

### Infört ✅

| Post | Fält | Åtgärd |
|------|------|--------|
| **PF-1** | `trygghet.analytisk_kommentar` | ⏸️ **EJ i denna PR** — se not nedan |
| **PF-2** | `energitrygghet.analytisk_kommentar` | ⏸️ **EJ i denna PR** — se not nedan |
| **F1** | `M.diskursprofil.galtan_kongruens.forklaring` | ✅ "liberal retorisk fernissa" → "TAN-lutning i sakinnehåll, liberal i retorik …" |
| **F2** | `M.forsvar.galtan_kongruens` | ✅ "liberalt fernissade TAN" → "kombination av liberal retorik och TAN-lutning" |
| **F3** | `M.klimat.nyckelbegrepp[alla kraftslag].innebord` | ✅ "döljer att kärnkraft prioriteras" → "där kärnkraft i praktiken prioriteras" |
| **F4** | `SD.klimat.nyckelbegrepp[politisk nedläggning].underforstadd_premiss` | ✅ "kausalitet konstrueras retroaktivt" → "Ansvaret … tillskrivs S/MP i efterhand" |
| **F5** | `ansvar` + `gemenskap` `analytisk_kommentar` | ✅ "avslöjar" → "synliggör" (×2) |
| **Del 2** | `M`,`C`,`KD`,`MP` `overordnad_inramning` | ✅ omordnade till att leda med partiets egen ram (kärna hämtad ordagrant ur respektive galtan-förklaring) |
| **Del 2** | `L.overordnad_inramning` | ✅ Niklas-levererad ledmening ("Individuell frihet och skolan som bildningsprojekt …") + befintligt innehåll efter |
| **Del 3-A** | `SD.forsvar.inramning`, `S.forsvar.inramning` | ✅ asterisk-inramade granskningsnotiser strukna; fälten börjar nu på "SD/S ramar in …" |
| **Del 3-B** | `SD.diskursprofil.retoriska_strategier` | ✅ "Folk-mot-elit-antagonism (populistisk diskursiv struktur)" → "Folk–elit-antagonism"; "Eufemisering av exkludering (…)" → "Återvandring inramad som human lösning"; "Affektiv kontrast och förlöjligande av motståndare" → "Affektiv kontrast mot motståndare" |

### Parkerat / medvetet ej ändrat ⏸️

- **PF-1, PF-2** (`trygghet` + `energitrygghet` analytisk_kommentar): förhandsgodkända
  men **inte del av denna arbetsorder** (som CORRECT-listade Tier A/B, Del 2, 3-A, 3-B).
  Lämnas för nästa införingsomgång så att denna PR exakt speglar den givna beslutslistan.
- **F6 "intressant spänning"** (`V` + `V.klimat` galtan): Niklas bedömde mild — **behålls**.
- **Del 3-C** (oattribuerad partiröst i `overordnad_inramning`): **parkerad** för senare copy-pass.
- **Considered-but-kept-listan** (attribuerad partiframställning i citat): orörd — korrekt diskursanalys.
- **Not, Del 3-B områdesnivå:** samma pejorativa term finns kvar på områdesnivå
  (`SD.migration.retoriska_strategier[].strategi` = "Eufemisering av exkludering",
  med `exempel`/`kalla` i objektform). Denna arbetsorder och review-docens 3-B-tabell
  omfattade `diskursprofil`-nivån (den asymmetri som SD vs V-parallellen gäller).
  Områdesnivån lämnas oförändrad — **flaggas här för separat beslut** om samma
  neutralisering ska tillämpas nedåt.
