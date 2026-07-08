# Valkompass — full frågeuppsättning, granskning

**Genererad:** 2026-07-08 · **Metod:** befintligt loop-mönster i lean v3-form (single-draft, grep-first, en fix-runda — ingen dual-draft, inga 8 evaluator-iterationer). Ingen ny infrastruktur byggd; ingen `claude -p`-subprocess (härledning sker ur lokal JSON, ingen WebFetch behövs).

**Output:** `data/compass-questions.json` (motorn skalar av den utan kodändring). **Går INTE live** förrän du granskat formuleringarnas neutralitet.

## Sammanfattning

- **45 frågor totalt** = 37 sakfrågor + 8 begreppsfrågor.
- Sakfrågor: 37 av 42 topics i `positions.json`. **5 uteslutna** för otillräcklig partispridning (differentierar inte — se nedan).
- Begreppsfrågor: de **8 kvalificerade signifikanterna** i `VALKOMPASS_metodik_v1.md` (≥6 partier, ≥3 laddningar). Alla trösklar verifierade mot data.
- ⚠️ **45 frågor är en lång kompass.** Överväg att korta (t.ex. 2–3 sakfrågor/område). Motorn klarar valfritt antal; hoppade frågor räknas inte.

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

*Stoppar här enligt instruktion — inget mergas förrän du godkänt formuleringarna. PR öppnad för granskning.*
