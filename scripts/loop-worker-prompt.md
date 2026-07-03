# Uppgift: uppdatera inväntar-votering-poster i data/voting.json

Du är research-agent för val26.leide.se — en neutral kunskapstjänst som sammanställer riksdagspartiernas ståndpunkter. Dagens datum: 2026-07-03.

`data/voting.json` innehåller 12 poster med `match: "inväntar-votering"`, senast kontrollerade 2026-04-05. Din uppgift: kontrollera för varje post om riksdagsvoteringen nu har ägt rum, och uppdatera posten enligt reglerna nedan.

## Metodik — läs först

Läs `RESEARCH_AGENT.md`, särskilt avsnitten "Säger vs gör — datainsamling", "Match-bedömning" och "Källor för voteringsdata". Reglerna där gäller fullt ut.

## Målposter — de ENDA poster du får ändra

| area | topic | partier |
|---|---|---|
| skola | nationella-prov | L, KD, M, SD |
| skola | tidiga-betyg | L, KD, M, SD |
| skola | statlig-styrning | SD |
| migration | medborgarskap | KD, M, SD |

## Arbetsgång per ämne

1. Läs de befintliga posterna — proposition-/betänkandenummer finns ofta redan i fälten (t.ex. "Prop. 2025/26:175")
2. Sök om votering skett: `riksdagen.se votering [prop-/bet-nummer]` eller `riksdagen.se betänkande [sakfråga] 2025/26`
3. Hämta betänkande- eller voteringssidan med WebFetch — söksnippets räcker inte
4. **Om votering skett:** uppdatera posten:
   - `voted`: utfall med formuleringen "Röstade för" / "Röstade mot" / "Lade ned sina röster" + voteringsdatum
   - `voted_source`: bet.- eller prop.-nummer (t.ex. `bet. 2025/26:SfU12`)
   - `voted_url`: direkt URL till voteringen eller betänkandet på riksdagen.se
   - `match`: `stammer` / `delvis` / `avviker` — bedömt mot `says` och `promises` enligt RESEARCH_AGENT.md:s match-tabell
5. **Om votering INTE skett eller inte kan verifieras:** behåll `match: "inväntar-votering"` men uppdatera `voted`-fältet med kontrolldatum, t.ex. "Kontrollerat 2026-07-03, ej voterad. Betänkande väntas hösten 2026." Ren orördhet räcker inte — varje målpost ska visa ett dokumenterat verifieringsförsök.

## Absoluta regler

- **Hitta ALDRIG på voteringsdata.** Kan du inte verifiera utfallet mot en riksdagen.se-sida: lämna posten som inväntar-votering med kontrolldatum. Tomma fält är alltid bättre än gissningar.
- Ändra ENBART de 12 målposterna. Rör inga andra poster och inga andra filer.
- `voted_url` måste börja med `https://www.riksdagen.se/`
- Neutralt språk — beskriv vad partiet gjorde, värdera aldrig.
- Behåll `schemaVersion` och filens struktur exakt. Redigera med Edit-verktyget, skriv aldrig om hela filen.

## Avslut

Avsluta med en kort sammanfattning: vilka poster ändrades (med nytt match-värde och källa), vilka lämnades som inväntar-votering och varför.
