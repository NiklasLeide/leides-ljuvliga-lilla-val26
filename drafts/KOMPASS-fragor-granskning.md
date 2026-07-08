# Valkompass — full frågeuppsättning, granskning

**Genererad:** 2026-07-08 · **Metod:** befintligt loop-mönster i lean v3-form (single-draft, grep-first, en fix-runda — ingen dual-draft, inga 8 evaluator-iterationer). Ingen ny infrastruktur byggd; ingen `claude -p`-subprocess (härledning sker ur lokal JSON, ingen WebFetch behövs).

**Output:** `data/compass-questions.json` (motorn skalar av den utan kodändring). **Går INTE live** förrän du granskat formuleringarnas neutralitet.

## Sammanfattning

- **v3 (granskad):** **43 frågor totalt** = 35 sakfrågor + 8 begreppsfrågor. (v2 var 45 = 37+8; pension och eu-ekonomi borttagna i granskningen — se FIX-LOG längst ned.)
- Sakfrågor: 35 av 42 topics i `positions.json`. **7 uteslutna** (5 för spridning <40 + pension + eu-ekonomi, se FIX-LOG).
- Begreppsfrågor: de **8 kvalificerade signifikanterna** i `VALKOMPASS_metodik_v1.md` (≥6 partier, ≥3 laddningar). Alla trösklar verifierade mot data.
- ⚠️ **43 frågor är fortfarande en lång kompass.** Överväg att korta ytterligare (t.ex. 2–3 sakfrågor/område). Motorn klarar valfritt antal; hoppade frågor räknas inte.

## Evaluator-kriterier (binära, per fråga)

| Kriterium | Facit | Utfall |
|---|---|---|
| Härledd ur källdata | grep (`positions.json` topicId / `discourse.json` innebord) | ✅ alla 37 topicId finns; alla 45 begreppsetiketter grep-bekräftade i innebord |
| Struktur (partition, agreeAt) | node | ✅ begreppen partitionerar laddade partier exakt; agreeAt ∈ {0,100} |
| Differentierar partier | spridning (pos) / laddningar (disc) | ✅ pos spridning ≥40; disc ≥3 laddningar |
| Täckningströsklar | partiantal | ✅ disc ≥6 partier |
| Neutral/symmetrisk formulering | modellbedömning (DISCOURSE_AGENT-regeln) | ⚠️ **kräver din läsning** — flaggade poster nedan |

---

## Sakfrågor (37) — härledning + spridning

`agreeAt` = vilken skalända "instämmer helt" pekar mot. Spridning = max−min partiposition (differentieringsmått; skalendpunkter ur `positions.json` är neutrala per design).

| Fråga | Skala (0 → 100) | agreeAt | Spridning | Not |
|---|---|---|---|---|
| **Skola** |
| friskolor | Strikt reglering → Fri etableringsrätt | 100 | 83 | |
| vinstuttag | Förbjud vinstuttag → Fri vinstutdelning | 0 | 80 | |
| nationella-prov | Färre prov → Fler, centralt rättade | 100 | 73 | |
| tidiga-betyg | Senare betyg → Tidigare betyg | 100 | 85 | |
| statlig-styrning | Kommunalt → Statligt huvudmannaskap | 100 | 77 | |
| digitalisering-skolan | Mer digitalt → Tillbaka till böcker | 100 | 73 | ⚠️ 2 partier `unclear` |
| **Ekonomi** |
| skatt-arbete | Höj för höga → Sänk på arbete | 100 | 80 | |
| valfard-finansiering | Höj skatter → Effektivisera | 0 | 77 | |
| arbetsmarknad | Stärk anställningsskydd → Flexiblare | 100 | 70 | |
| bostader | Reglera hyror → Marknadshyror | 100 | 73 | |
| eu-ekonomi | Nationell kontroll → Fördjupa EU | 100 | 74 | ⚠️ överlapp m. eu-demokrati |
| pension | Reformera+höj pensioner → Bevara+höj ålder | 100 | 58 | ⚠️ sammansatt skala |
| infrastruktur | Satsa järnväg/stambanor → Underhåll | 0 | 75 | |
| **Migration** |
| asylpolitik | Generös → Minimera | 100 | 87 | |
| arbetskraftsinvandring | Underlätta → Begränsa | 100 | 78 | |
| medborgarskap | Inkluderande → Höga krav | 100 | 87 | |
| integration | Stöd/rättigheter → Krav/egenansvar | 100 | 82 | |
| uppehallstillstand | Permanenta norm → Tillfälliga norm | 100 | 90 | |
| **Försvar & säkerhet** |
| nato | Begränsa deltagande → Maximalt engagemang | 100 | 73 | |
| forsvarsindustri | Internationellt samarbete → Svensk först | 100 | 63 | |
| **Klimat & energi** |
| karnkraft | Avveckla → Maximal utbyggnad | 100 | 87 | |
| fossila-branslen | Sänk krav → Snabb utfasning | 100 | 77 | |
| klimatmal | Sänk → Skärp | 100 | 75 | |
| fornybart | Begränsa → Maximal utbyggnad | 100 | 75 | |
| elpriser | Marknadspriser → Statlig priskontroll | 100 | 56 | ⚠️ "hållas nere" — se flagg |
| klimatanpassning | Begränsade → Stora gröna investeringar | 100 | 67 | |
| **Vård & omsorg** |
| vardkoer | Långsiktiga resurser → Prestationsbaserade kömiljarder | 100 | 78 | |
| aldreomsorg | Offentlig omsorg → Valfrihet/kvalitet | 100 | 63 | |
| valfrihet-vard | Begränsa privata → Maximal valfrihet | 100 | 80 | |
| psykisk-halsa | Förebyggande → Specialiserad psykiatri | 100 | 45 | måttlig spridning |
| personal | Mer resurser → Effektivisering/teknik | 100 | 52 | |
| **Demokrati & konstitution** |
| public-service | Reformera/begränsa → Stärk/grundlagsskydda | 100 | 65 | |
| domstolar | Status quo → Maximalt oberoende | 100 | 58 | |
| yttrandefrihet | Minimal reglering → Aktiv plattformsreglering | 100 | 45 | måttlig spridning |
| eu-demokrati | Nationell suveränitet → Fördjupat EU | 100 | 80 | ⚠️ överlapp m. eu-ekonomi |
| civilsamhalle | Begränsa stöd → Stärk civilsamhälle | 100 | 57 | |
| grundlag | Enklare ändra → Svårare/stärkt rättighetsskydd | 100 | 65 | |

### Uteslutna sakfrågor (5) — spridning < 40 (differentierar inte)

| Topic | Område | Spridning | Skäl |
|---|---|---|---|
| forsvarsbudget | forsvar | 38 | Bred uppslutning om upprustning post-2022 |
| varnplikt | forsvar | 30 | Bred uppslutning om bred värnplikt |
| civil-beredskap | forsvar | 15 | Nära konsensus |
| ukraina | forsvar | 10 | Nära konsensus (alla 82–92) |
| primarvard | vard | 20 | Nära konsensus |

**Konsekvens:** försvar får bara 2 frågor (nato, forsvarsindustri). Det är ärligt — svensk försvarspolitik har bred konsensus efter 2022, så få frågor särskiljer. Vill du ändå ha försvarsrepresentation kan forsvarsbudget/varnplikt (spridning 30–38) läggas till med den lägre differentieringen noterad.

---

## Begreppsfrågor (8) — täckning + verbatim-härledning

Etiketterna speglar `discourse.json` `per_parti.innebord`. **Analytiker-prefix strippade** (t.ex. "Hybrid —", "Mittfåra —", "Prestationsbaserad —"), partiets egen inramning bevarad. Varje distinktivt uttryck är grep-bekräftat i innebord-fältet. Ingen tvingad gruppering — distinkta innebörder står var för sig (metodikens "tvinga inte symmetri"), så varje option = ett parti.

| Begrepp | Täckning | Laddningar | Option-partition | Not |
|---|---|---|---|---|
| trygghet | 8/8 | 7 | 8 options (1/parti) | S-etikett: se flagg |
| ansvar | 8/8 | 7 | 8 options | SD-etikett: se flagg |
| omstallning | 8/8 | 7 | 8 options | |
| gemenskap | 8/8 | 6 | 8 options | |
| energitrygghet | 8/8 | 6 | 8 options | |
| ordning | 6/8 | 4 | 6 options | V, MP saknar laddning → ej matchade (regel 3) |
| sakerhet | 6/8 | 3 | 6 options | L, SD saknar laddning → ej matchade |
| natomedlemskapet | 7/8 | 3 | 7 options | SD saknar laddning → ej matchad |

Partier utan laddning i ett begrepp matchas inte på den frågan (metodik-regel 3) — de straffas inte, deras nämnare krymper.

---

## ⚠️ Flaggat för din neutralitetsläsning

**Sakfrågor:**
1. **pos-elpriser** — "Elpriserna ska hållas nere genom statlig priskontroll." "Hållas nere" tillför ett antagande (att priskontroll sänker priser) utöver skalan (Marknadspriser → Statlig priskontroll). Neutralare: *"Elpriserna ska regleras genom statlig priskontroll."*
2. **pos-pension** — sammansatt skala (reformera+höj pensioner ↔ bevara+höj pensionsålder). Påståendet fångar bara högänden ("höj pensionsåldern för att bevara systemet"); lågändans "höj pensionerna" syns inte. Överväg att dela eller stryka.
3. **eu-ekonomi + eu-demokrati** — två EU-integrationsfrågor (ekonomisk resp. politisk). Risk för dubbelviktning av EU-dimensionen. Behåll båda eller slå ihop.
4. **Starka skalpoler** — jag mildrade skalans superlativ ("maximal/minimera") i de flesta påståenden, men dessa mirrar starka poler: *"Sverige ska kraftigt begränsa asylmottagningen"*, *"Kärnkraften ska byggas ut"*, *"Förnybar energi ska byggas ut kraftigt"*. Kontrollera tonläget.
5. **pos-digitalisering-skolan** — 2 partier `unclear` → svagare matchningsgrund (metodiken avråder från flera unclear).

**Begreppsfrågor (redaktionell redigering av innebord → etikett):**
6. **disc-ansvar / SD** — innebord: *"Individens ansvar att anpassa sig + tidigare regeringars skuld för 'ansvarslös invandringspolitik'"*. Jag trimmade till **"Individens ansvar att anpassa sig"** — den andra satsen är en skuldtillskrivning, inte en "vad ansvar betyder för dig"-innebörd. Bekräfta trimningen.
7. **disc-trygghet / S** — innebord: *"Hybrid — glider från social välfärdstrygghet mot fysisk säkerhet från brott"*. Etikett: **"Välfärdstrygghet som allt mer handlar om skydd mot brott"** — parafraserar glidningen. Kontrollera att den inte laddar mer än källan.
8. **Alla analytiker-prefix-strippningar** — verifiera att inget partis inramning tappats: t.ex. gemenskap M "Prestationsbaserad —" → "Prestationsbaserad gemenskap genom arbete och egenförsörjning"; ansvar S "dubbelinramning" → "Samhällets ansvar att gripa in och individens att integrera sig".

**Symmetrikontroll (DISCOURSE_AGENT-regeln):** eftersom varje etikett är partiets EGNA innebord-formulering (inte en kritikers), är laddningen symmetrisk per konstruktion — inget parti får en avslöjande etikett medan ett annat får en logik-etikett. Verifiera ändå att de trimmade (6, 7) inte brutit detta.

---

## FIX-LOG — v2 → v3 (granskningsbeslut tillämpade 2026-07-08)

Niklas + Claude chat granskade flaggorna ovan och beslutade följande. Alla ändringar gjorda i `data/compass-questions.json`; evaluator-checkarna körda om på de ändrade frågorna.

### Sakfrågor

| # | Post | Beslut | Före → Efter |
|---|---|---|---|
| 1 | pos-elpriser | Omformulerad (tog bort inbakat utfall) | "Elpriserna ska **hållas nere** genom statlig priskontroll" → "Elpriserna ska **regleras** genom statlig priskontroll" |
| 2 | pos-pension | **BORTTAGEN** | Sammansatt skala (reformera+höj pensioner vs bevara+höj pensionsålder); påståendet fångade bara ena änden. Bättre frånvarande än halvmätt — kan få egen riktig fråga senare. |
| 3 | EU-dubbelräkning | **Behöll eu-demokrati, tog bort eu-ekonomi** | Valt "behåll en" framför "slå ihop": en sakfråga binder till EXAKT ETT topicId (partivärden hämtas live från den topicen), så två topics kan inte slås ihop till en ren live-hämtad skala. eu-demokrati har bredare spridning (80 > 74). Kvarvarande statement generaliserad: "Sverige ska fördjupa EU-samarbetet **politiskt**" → "Sverige ska fördjupa EU-samarbetet" (nu enda EU-dimensionen). |
| 4 | Starka poler | Mildrade (respondent kan instämma utan ytterlighet) | asylpolitik: "**kraftigt** begränsa" → "begränsa" · fornybart: "byggas ut **kraftigt**" → "byggas ut" · nato: "**så aktivt som möjligt**" → "aktivt" · fossila-branslen: "fasas ut **snabbt**" → "fasas ut" · infrastruktur: "satsa **stort** på" → "satsa på" · klimatanpassning: "**stora** gröna investeringar" → "gröna investeringar". karnkraft ("byggas ut") lämnad som den var. *Obs: mildringen påverkar inte differentieringen — partispridningen kommer från numeriska positioner, inte från påståendets ordval.* |
| 5 | pos-digitalisering-skolan | **Behållen** med 2-unclear-noten | Ingen ändring. |

### Begreppsfrågor

| # | Post | Beslut | Utfall |
|---|---|---|---|
| 6 | disc-ansvar / SD | **Trimning bekräftad** | Behåller "Individens ansvar att anpassa sig", slopar "tidigare regeringars skuld"-satsen (skuldtillskrivning mot andra partier, inte en innebörd av "ansvar"). Var redan så i v2 — nu bekräftat. Grep: "anpassa sig" finns i innebord. |
| 7 | disc-trygghet / S | **Omformulerad till statisk innebörd** | "Välfärdstrygghet som **allt mer handlar om** skydd mot brott" (riktning/rörelse) → "**Både** social välfärd **och** fysisk säkerhet mot brott" (håller båda, utan att döma en drift). S-alternativet är inte längre det enda som beskriver rörelse. Grep: både "social välfärd" och "fysisk säkerhet" finns i S:s innebord. |

### Omkörda evaluator-checkar (endast ändrade frågor)

- **Antal:** 35 sakfrågor + 8 begrepp = **43** (var 45).
- **Härledning:** alla kvarvarande topicId greppar fortfarande till `positions.json`; pension/eu-ekonomi inte längre närvarande. ✅
- **Differentiering:** alla kvarvarande sakfrågor spridning ≥40; eu-demokrati = 80. ✅
- **Begreppstrimmar:** SD "anpassa sig", S "social välfärd" + "fysisk säkerhet" greppar alla till `discourse.json` innebord. ✅
- **Symmetri:** inget alternativ beskriver längre rörelse (S-utliggaren åtgärdad); loadedness oförändrad (option-antal = laddade partier per begrepp: 8/8/8/8/8/6/6/7). ✅
- **Superlativsvep:** inga flaggade superlativ kvar i något påstående. ✅

*v3 tillämpar de granskade besluten. Mergas fortfarande inte — väntar ditt slutgodkännande.*
