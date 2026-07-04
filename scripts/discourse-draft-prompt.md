# Uppgift: diskursutkast för området ekonomi — alla 8 riksdagspartier

Du gör en diskursanalys för val26.leide.se. Ditt utkast granskas senare mot ett
oberoende utkast från en annan modell — arbeta självständigt och följ ENDAST
underlaget nedan.

## Underlag (läs allt innan du börjar)

1. `sources/discourse/citat-ekonomi.json` — citatkatalogen. **Din ENDA
   empiriska källa.** Varje observation, exempel och slutsats ska kunna spåras
   till citat i katalogen. Använd INTE egen minneskunskap om partierna, inga
   egna citat, ingen websökning.
2. `DISCOURSE_AGENT.md` — metodiken (Entman, Laclau/Mouffe, Wodak),
   kvalitetskriterierna och stilreglerna. Följ dem fullt ut.
3. `data/discourse.json` — läs 2–3 befintliga per_omrade-poster som
   STILREFERENS (ton, densitet, längd). Kopiera inget innehåll.
4. `data/galtan.json` — partiernas GAL-TAN-positioner, som grund för
   kongruensbedömningen (matchar den ekonomiska diskursen partiets position?).

## Uppgift

Skriv ett fullständigt utkast per parti (SD, M, KD, L, S, C, MP, V) för
området **ekonomi**, plus flytande signifikanter för området.

**Signifikant-kandidater att pröva mot citaten:** "ansvar" (ekonomisk
kontext), "plånboken", "hårt arbetande", "vanligt folk", "arbetslinjen".
Behåll ENDAST de som faktiskt bär i citatmaterialet (flera partier använder
begreppet, med olika innehåll). Föreslå egna kandidater om citaten visar dem.
1–3 signifikanter totalt.

## Kvalitetskrav (från DISCOURSE_AGENT.md — hårda krav)

Per parti: inramning ≥2 meningar (problemdefinition + kausalitet);
2–5 nyckelbegrepp med term/innebord/underforstadd_premiss; 2–4 retoriska
strategier med strategi/exempel/kalla där exempel är ETT ORDAGRANT CITAT ur
katalogen och kalla är citatets dokumenttitel; galtan_kongruens som fritext
grundad i galtan.json; kontrast_med. Svenska, neutral statsvetenskaplig ton,
JSON-nycklar utan diakritiska tecken. Tvinga inte symmetri — har ett parti
tunn diskurs i materialet, skriv det ("otydlig diskursiv profil" är ett
giltigt resultat). Värdera aldrig; beskriv.

## Svarsformat — ENDAST giltig JSON

Svara med ENBART detta JSON-objekt. Ingen text före eller efter, inga
markdown-staket:

```json
{
  "omrade": "ekonomi",
  "baserad_pa": "sources/discourse/citat-ekonomi.json",
  "partier": {
    "SD": {
      "inramning": "…",
      "nyckelbegrepp": [
        { "term": "…", "innebord": "…", "underforstadd_premiss": "…" }
      ],
      "retoriska_strategier": [
        { "strategi": "…", "exempel": "ordagrant citat ur katalogen", "kalla": "dokumenttitel ur katalogen" }
      ],
      "galtan_kongruens": "fritext",
      "kontrast_med": "…"
    }
  },
  "flytande_signifikanter": {
    "begreppet": {
      "beskrivning": "…",
      "per_parti": {
        "SD": { "innebord": "…", "exempel": "…", "galtan_matchning": "TAN|GAL|Mittfåra|Glidning|Spänning" }
      },
      "analytisk_kommentar": "…"
    }
  }
}
```

`partier` ska innehålla exakt de 8 partierna. Undantaget från
markdown-staket-förbudet ovan gäller bara detta exempel — ditt svar ska vara
rå JSON.
