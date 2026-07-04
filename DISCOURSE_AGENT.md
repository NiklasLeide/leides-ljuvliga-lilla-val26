# DISCOURSE_AGENT.md — Instruktioner för diskursanalys i val26

## Syfte

Detta dokument styr hur diskursanalys genomförs för val26.leide.se. Det säkerställer att analysen är konsekvent oavsett vilken chatt-session som utför arbetet. Alla chattar som arbetar med discourse.json ska ha detta dokument som project knowledge.

Diskursanalysen kompletterar positions.json (vad partierna säger) och voting.json (hur de röstar) med en tredje dimension: **hur partierna kommunicerar** — vilka antaganden, värderingar och världsbilder som ligger inbäddade i deras språk.

---

## Analytiskt ramverk

Analysen applicerar tre etablerade ramverk i kombination:

### 1. Inramningsanalys (Entman)
Hur partiet ramar in en fråga: vilken problemdefinition, kausal förklaring och lösning som impliceras av språket.

**Frågor att ställa:**
- Vad definieras som problemet?
- Vad pekas ut som orsak?
- Vilken lösning följer logiskt av inramningen?
- Vilka alternativa inramningar exkluderas?

### 2. Diskursteori (Laclau/Mouffe)
Nodalpunkter och flytande signifikanter — vilka begrepp organiserar partiets diskurs, och hur fylls gemensamma begrepp med olika innehåll.

**Frågor att ställa:**
- Vilka begrepp är centrala för partiet i detta område?
- Vilka underförståda premisser bär begreppet med sig?
- Används samma begrepp av andra partier med annan innebörd?

### 3. Diskurshistorisk ansats (Wodak/Krzyżanowski)
Retoriska strategier som partiet använder — konkreta textnära exempel på hur argumentationen byggs upp.

**Frågor att ställa:**
- Vilka retoriska strategier används (nostalgi, kvantifiering, motdiskurs, etc.)?
- Finns konkreta exempel med källhänvisning?
- Hur förhåller sig strategierna till partiets ideologiska position?

---

## Akademiska referenser

Följande studier utgör metodologisk grund. Nya chattar behöver inte söka upp dessa igen — de är redan verifierade.

- Holt & Bolin (2025) – Resilient populism? SD:s diskurs i riksdagen 2010–2024
- Elgenius & Rydgren (2026) – Who are the People and what does Home mean?
- Krzyżanowski & Ekström (2023/2025) – Saying Criminality, meaning Immigration
- Schclarek Mulinari (2025) – Sweden's race to the bottom
- Calvo, Bäck & Carroll (2024) – Debating the Populist Pariah
- Gustafsson (2024) – Vad gör språket i politiken?
- Fredén, Johansson & Saynova (2024) – Word embeddings on ideology from Swedish parliamentarians

---

## Datastruktur — exakt format

Alla data skrivs till `data/discourse.json`. Filen har tre toppnivåsektioner: `metadata`, `flytande_signifikanter`, `partier`.

### Partiprofil (per parti)

```json
{
  "diskursprofil": {
    "overordnad_inramning": "En mening som sammanfattar partiets övergripande diskursiva ram",
    "nodalpunkter": ["lista", "av", "nyckelbegrepp"],
    "retoriska_strategier": ["Strategi 1 (kort förklaring)", "Strategi 2"],
    "galtan_kongruens": {
      "bedomning": "hög|delvis|låg",
      "forklaring": "Kort förklaring av hur diskursen matchar GAL-TAN-position"
    }
  }
}
```

### Per politikområde (under `per_omrade`)

```json
{
  "omrade_id": {
    "inramning": "Hur partiet ramar in frågan — problemdefinition, kausalitet, lösning",
    "nyckelbegrepp": [
      {
        "term": "begreppet",
        "innebord": "Vad det betyder i partiets diskurs",
        "underforstadd_premiss": "Vad som tas för givet"
      }
    ],
    "retoriska_strategier": [
      {
        "strategi": "Namn på strategi",
        "exempel": "Konkret textexempel",
        "kalla": "Källa (partiwebbplats, riksdagsmotion, protokoll)"
      }
    ],
    "galtan_kongruens": "Fritext — matchar diskursen GAL-TAN-positionen?",
    "kontrast_med": "Kort notering om vad som skiljer från andra partier"
  }
}
```

### Flytande signifikanter

Identifiera 1–3 begrepp per politikområde som alla (eller flera) partier använder men fyller med olika innehåll. Format:

```json
{
  "begreppet": {
    "beskrivning": "Varför detta begrepp är omstritt",
    "per_parti": {
      "SD": {
        "innebord": "Vad det betyder för SD",
        "exempel": "Konkret användning",
        "galtan_matchning": "TAN|GAL|Mittfåra|Glidning|Spänning"
      }
    },
    "analytisk_kommentar": "Övergripande analys av hur begreppet fungerar politiskt"
  }
}
```

---

## Områdes-ID:n i discourse.json

Använd dessa exakta ID:n (matchar positions.json):

| Område | ID |
|---|---|
| Skola | `skola` |
| Ekonomi | `ekonomi` |
| Migration | `migration` |
| Försvar/säkerhet | `forsvar` |
| Klimat/energi | `klimat` |
| Rättsväsende | `rattsvasende` |
| Vård/omsorg | `vard` |
| Demokrati/konstitution | `demokrati` |

---

## Kvalitetskriterier per parti och område

Varje parti × område-entry måste ha:

- [ ] **Inramning** — minst 2 meningar som beskriver problemdefinition och kausalitet
- [ ] **Nyckelbegrepp** — minst 2, max 5, med `term`, `innebord`, `underforstadd_premiss`
- [ ] **Retoriska strategier** — minst 2, max 4, med `strategi`, `exempel`, `kalla`
- [ ] **GAL-TAN-kongruens** — bedömning och förklaring
- [ ] **Kontrast** — kort notering om vad som skiljer partiet från andra

### Källkrav

- Primärkällor i första hand: partiprogram, riksdagsmotioner, partiwebbplatser, riksdagsprotokoll
- Sekundärkällor accepteras för kontext: debattartiklar, utskottsbetänkanden
- Varje retorisk strategi måste ha ett konkret textexempel med källa
- Exempel ska vara representativa, inte cherry-picked extremfall

### Vad som INTE ska göras

- **Värdera inte** — beskriv vad partier säger, hur de säger det, och vad som underförstås. Bedöm aldrig om de har rätt.
- **Hitta inte på** — varje observation ska kunna spåras till källmaterial.
- **Tvinga inte symmetri** — om ett parti saknar tydlig diskurs i ett område, skriv det. "Otydlig diskursiv profil" är acceptabelt.
- **Överdramatisera inte glidning** — beskriv den sakligt med belägg.

---

## Språk och stil

- **Allt innehåll på svenska** — undantag: akademiska referenstitlar behåller sitt originalspråk
- **JSON-nycklar på svenska** utan diakritiska tecken: `innebord` (inte `innebörd`), `overordnad_inramning` (inte `övergripande_inramning`)
- **Neutral, beskrivande ton** — som en statsvetenskaplig analys, inte en debattartikel
- **Konkret framför abstrakt** — textnära exempel alltid bättre än generella observationer
- **Alla 8 partier** — SD, M, KD, L, S, C, MP, V — behandlas likvärdigt i omfång och djup
- **Partiernas egna värdeladdade begrepp citattecknas alltid i beskrivande text** — analysen beskriver att partiet kallar något X, den påstår inte att det är X. Exempel: "ansvarsfull budgetpolitik" (SD), "rättvis skattesänkning" (S), "ett finanspolitiskt ramverk som respekteras" (C), "rättvisare skatter" (MP).

---

## Arbetsflöde per område

### Steg 1: Sök primärkällor
Sök partiprogram, partiwebbplats (policy-sida för aktuellt område), riksdagsmotioner 2024/25–2025/26, och riksdagsprotokoll från relevanta debatter.

### Steg 2: Analysera
Applicera de tre ramverken. Identifiera nyckelbegrepp, retoriska strategier, och inramning. Notera GAL-TAN-kongruens.

### Steg 3: Identifiera flytande signifikanter
Vilka begrepp används av flera partier med olika innebörd? Välj 1–3 per område.

### Steg 4: Skriv analys
Presentera analysen i chat för granskning — alla 8 partier, alla signifikanter.

### Steg 5: Granskning (Niklas godkänner)
Niklas granskar och godkänner innan data skrivs till discourse.json. Ingen data betraktas som klar utan godkännande.

### Steg 6: Uppdatera discourse.json
Lägg till nya områden i befintlig fil. Uppdatera `metadata.omfattning` och `metadata.version`. Bumpa minor version (0.2.0 → 0.3.0 etc.).

---

## Befintligt arbete (referens)

### Klara områden (v0.2.0)
- **Rättsväsende** — alla 8 partier
- **Migration** — alla 8 partier

### Identifierade flytande signifikanter (v0.2.0)
- **trygghet** — alla 8 partier
- **ansvar** — alla 8 partier
- **gemenskap** — alla 8 partier

### Prioritetsordning för resterande områden
1. Klimat/energi (högst diskursivt mervärde)
2. Ekonomi (hög — klassisk vänster-höger med SD-nyanser)
3. Demokrati/konstitution (medel — public service, domstolar)
4. Försvar/säkerhet (medel — NATO, vapenexport)
5. Skola (lägre — förutsägbart valfrihet vs likvärdighet)
6. Vård/omsorg (lägre — liknande mönster som skola)

### Stilreferens
Använd `data/discourse.json` version 0.2.0 som stilmall. Nya områden ska ha identisk abstraktionsnivå, begreppsdjup och källredovisning.

---

## Koppling till övrig data

Diskursanalysen ska komplettera, inte duplicera, befintlig data:

- **positions.json** — vad partierna säger (explicita positioner 0–100)
- **voting.json** — vad partierna gör (voteringsdata, stämmer/delvis/avviker)
- **galtan.json** — var partierna placerar sig (GAL-TAN-scatter)
- **discourse.json** — hur partierna kommunicerar (diskursanalys)

GAL-TAN-kongruensbedömningen i discourse.json ska relatera till partiernas position i galtan.json. Om det finns ett gap mellan diskurs och GAL-TAN-placering, notera det explicit.

---

## Godkännandeprocess

1. Forskaren (denna chatt) presenterar analys för Niklas
2. Niklas granskar och ger feedback
3. Justeringar görs vid behov
4. Niklas godkänner
5. Fil skapas/uppdateras och levereras

**Ingen data skrivs till discourse.json utan Niklas godkännande.**
