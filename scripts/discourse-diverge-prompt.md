# Uppgift: divergensrapport — två oberoende diskursutkast, området {{OMRADE_NAMN}}

Två modeller har OBEROENDE av varandra skrivit varsitt diskursutkast för
området {{OMRADE_NAMN}} utifrån samma citatkatalog. Din uppgift: jämför dem
parti för parti och analysdel för analysdel, och producera en rapport som
skiljer det samstämmiga från det som kräver mänskligt beslut.

Du kan tillhöra samma modellfamilj som ett av utkasten. Behandla båda
utkasten exakt likvärdigt — ingen självpreferens, inget antagande om att
något av dem är bättre.

## Underlag

1. `drafts/discourse-{{OMRADE_ID}}-sonnet.json` — Utkast 1
2. `drafts/discourse-{{OMRADE_ID}}-opus.json` — Utkast 2
3. `DISCOURSE_AGENT.md` — terminologi och kvalitetskrav (referens)

## Klassificering

Jämför per parti (SD, M, KD, L, S, C, MP, V) och per analysdel:
`inramning`, `nyckelbegrepp`, `retoriska_strategier`, `galtan_kongruens`,
`kontrast_med` — samt de flytande signifikanterna som egen jämförelse.

- **SAMSTÄMMIGT** — utkasten säger i sak samma sak. Skriv EN konsoliderad
  version: välj den bättre formuleringen (eller kombinera), men tillför
  INGEN ny substans som inte finns i något av utkasten.
- **DIVERGENS** — utkasten skiljer sig i sak: olika inramning identifierad,
  olika signifikantbedömning, olika kongruensslutsats, olika nyckelbegrepp
  som inte är samma begrepp under olika namn. Redovisa BÅDA versionerna
  sida vid sida + en neutral beskrivning av VAD som skiljer. Säg ALDRIG
  vilken som är rätt eller bättre.

Gränsdragning: olika ordval för samma substans är SAMSTÄMMIGT (välj bättre
formulering). Olika analytisk slutsats är DIVERGENS, oavsett hur lika orden
är.

## Rapportformat — svara med ENDAST rapportens markdown

Svaret ska vara rapportens fullständiga innehåll, inget annat. Exakt denna
struktur:

```
# Divergensrapport: diskursutkast {{OMRADE_ID}} (Utkast 1 = sonnet, Utkast 2 = opus)

## Statistik

| Parti | Divergenser | Delar med divergens |
|---|---|---|
| SD | 0 | — |
| ... alla 8 partier, även de med 0 ...

Flytande signifikanter: N divergenser (beskrivning)
Totalt: N divergenser.

## Kräver Niklas beslut

### <Parti> — <analysdel>
**Utkast 1:** ...
**Utkast 2:** ...
**Vad som skiljer:** neutral beskrivning.

... en rubrik per divergens, grupperat per parti. Även
signifikant-divergenser här ...

## Samstämmigt

... konsoliderad text per parti, läsbar i sin helhet: alla analysdelar som
klassats samstämmiga, i löpande fullständig form (inte referat) ...
```

Partier med 0 divergenser ska stå i statistiktabellen — det är information,
inte frånvaro. Svenska, neutral ton, inga markdown-staket runt svaret.
