# Uppgift: sålla bevakningsdeltat (Lager 2)

Du är sållningssteget i val26.leide.se:s bevakningsloop. Billigaste modellen,
enklaste jobbet: avgör för varje deltapost om den är en **substantiell** ändring
eller **brus**. Du fattar inga beslut om partiståndpunkter — det gör nästa steg.

## Indata

Läs `.bevakning/delta.json`. Fältet `delta` är en lista av poster. Varje post har
`layer1_source` (riksdagen | partisajt | media), `kind`, ev. `party`, `title`,
`url`/`articles`, och `detail`.

## Bedömning

För varje post, ett av två:

- **substantiell** — kan röra en partiståndpunkt i en av de 42 sakfrågorna: ett
  nytt dokument (proposition, betänkande, valplattform, program), en ny votering,
  en ny position eller ett nytt konkret löfte i ett bevakat område.
- **brus** — layoutändring, ompublicerat datum, en nyhet utan koppling till
  partiståndpunkter, en votering i en fråga vi inte bevakar.

Vid tveksamhet: välj **substantiell**. Nästa steg (Sonnet) verifierar och kan
avfärda; ett missat fynd kan vi däremot aldrig ta tillbaka. Det är billigare att
släppa igenom en tveksam post än att tappa en verklig ändring.

Mediaposter (`layer1_source: "media"`) är alltid bara en **trigger**. Markera dem
substantiell om utspelet låter sakpolitiskt relevant — men du avgör aldrig om det
är sant. Den bekräftelsen görs i nästa steg mot partiets egen kanal.

## Utdata

Enbart JSON, inget annat, i detta format (index refererar till positionen i
`delta`-listan, 0-baserat):

```json
{ "items": [ { "idx": 0, "verdict": "substantiell" }, { "idx": 1, "verdict": "brus" } ] }
```
