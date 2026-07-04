# Uppgift: citatkatalog för diskursanalys — området ekonomi

Du är research-agent för val26.leide.se — en neutral kunskapstjänst. Dagens
datum: 2026-07-03. Din uppgift: bygg `sources/discourse/citat-ekonomi.json`
med 6–12 ordagranna citat per riksdagsparti (S, M, SD, C, V, KD, L, MP) om
**ekonomisk politik**, som råmaterial för senare diskursanalys.

Tidsfönster: valrörelsefokus 2025/26 fram till idag. Äldre material används
inte. Detta är INSAMLING, inte analys — du tolkar ingenting.

## Källor i prioritetsordning

1. **Budgetmotioner och ekonomisk-politiska motioner 2025/26** — riksdagen.se
2. **Riksdagens budget- och partiledardebatter** — protokoll på riksdagen.se
3. **Partiprogrammens ekonomikapitel** — partiernas webbplatser
4. **Valmanifest enligt `sources/manifest/2026/KATALOG.md`:**
   - S, C, L: slutgiltiga manifest, lokala PDF:er i `sources/manifest/2026/`
   - V: valplattform finns men är PRELIMINÄR — citat härifrån ska markeras
     med "preliminär" i dokumenttitel (t.ex. "Valplattform 2026 (preliminär
     kongressversion)")
   - M: inget manifest — endast kampanjsidesnapshot
     `sources/manifest/2026/M-valloften-2026_snapshot-2026-07-03.md`; citat
     härifrån får kalltyp `kampanjsida` och "ögonblicksbild" i dokumenttitel
     (t.ex. "Vallöften 2026 (kampanjsida, ögonblicksbild 2026-07-03)");
     url = https://moderaterna.se/valloften-2026/ och
     lokal_fil = sökvägen till snapshotfilen
   - SD, KD, MP: har INGA manifestkällor — bygg på källtyp 1–3 och notera
     det via källtypsfördelningen

## Utdataformat — exakt detta schema

Skriv filen `sources/discourse/citat-ekonomi.json`:

```json
{
  "schemaVersion": 1,
  "omrade": "ekonomi",
  "tidsfonster": "valrörelsefokus 2025/26 till 2026-07-03",
  "genererad": "2026-07-03",
  "partier": {
    "S": {
      "kallbas": "ok",
      "citat": [
        {
          "citat": "Ordagrant citat utan ändringar.",
          "kalltyp": "budgetmotion",
          "dokumenttitel": "Motionens/dokumentets titel",
          "url": "https://www.riksdagen.se/...",
          "datum": "2025-10-01",
          "kontext": "En beskrivande mening om var/när detta sades — ingen tolkning."
        }
      ]
    }
  }
}
```

- `kalltyp`: en av `budgetmotion`, `motion`, `protokoll`, `partiprogram`,
  `valmanifest`, `kampanjsida`
- `lokal_fil` (valfritt fält): sökväg till lokal fil i repot när citatet
  hämtats ur en sådan (manifest-PDF eller M-snapshotten)
- `kallbas`: `"ok"` när partiet har ≥6 citat från ≥2 källtyper. Om du efter
  ärligt sökande inte når det: `"tunn"` + fältet `tunn_beskrivning` som
  beskriver vad som saknas och var du sökte. En ärlig lucka är ALLTID bättre
  än påhittad täckning.

## Absoluta regler

- **Citat ska vara ORDAGRANNA.** Hämta källsidan (WebFetch) eller läs den
  lokala filen (Read) och kopiera exakt. Ändra aldrig ordföljd, böjning
  eller interpunktion. Korta med "…" endast mellan fullständiga satser.
- **Hitta ALDRIG på citat.** Kan du inte verifiera ordalydelsen mot källan:
  ta inte med citatet. Varje citat kommer att efterkontrolleras mot sin URL.
- Varje parti behöver minst ett citat från riksdagsmaterial (budgetmotion,
  motion eller protokoll). Kampanj- och programmaterial får aldrig vara
  enda källtyp.
- Sök snippets räcker INTE som källa — hämta alltid dokumentsidan.
- Citaten ska handla om ekonomisk politik: skatter, jobb, välfärdens
  finansiering, tillväxt, hushållsekonomi, statsbudget, pensioner.
- Skapa/ändra ENDAST `sources/discourse/citat-ekonomi.json`. Rör inga andra
  filer.
- Neutral `kontext` — beskriv var citatet yttrades, värdera aldrig.

## Avslut

Avsluta med kort statistik: antal citat per parti, källtyper per parti,
vilka partier (om några) som markerats "tunn" och varför.
