# Steg D-noter: vard — deterministiska rättelser + citatbyte (2026-07-05)

vard slutfördes enligt v3-mönstret (fjärde namngivna undantaget): grep först
(0 tokens), EN evaluatorrunda endast för relevans/täckning, fixrunda, B+C.

## Deterministiska kantfixar (grep mot rå källa, före evaluatorrundan)

| Post | Fel | Åtgärd |
|---|---|---|
| SD[4] | böjning: "ökad" — källan (HD02241) skriver "ökade" | rättad till källform |
| V[6] | hopklippt mening: punkt vid "samhällsklass." — källan (HD022777) fortsätter | förlängd till fullständig mening ("…ditt kön, ditt ursprung eller din geografiska hemvist.") |
| MP[4] | tyst versalisering: "Inget" — källan (HD023542) har "inget" mitt i mening | gemen återställd |
| L[4] | parafras: satsled omkastade mot källan (liberalerna.se/politik/aldreomsorg/) | ersatt med källans ordagranna mening ("…inte bara ska bli garanterade skäliga levnadsvillkor, utan goda levnadsvillkor.") |

## MP[2] — verifierad trots DOM-interfoliering

mp.se/politik/ratt-att-ma-bra/ interfolierar en sidokolumnsmening mitt i
brödtextens första mening vid flat tagg-stripping. Citatet är korrekt:
tvådelad deterministisk kontroll (prefix "Allt fler människor, ock" +
resterande text från "så barn och unga…" till slutet) ger VERIFIERAD.
Detta är ett extraktionsartefakt-mönster för v3-backloggen, inte ett citatfel.

## M[0] — citatbyte (evaluatorns enda REVISE-krav)

Evaluatorrundan (relevans/täckning) underkände M:s IVF-citat som utanför
vård- och omsorgspolitikens avgränsning (reproduktions-/familjepolitik).
Ersatt med äldreomsorgslöftet ur samma kampanjsnapshot (grep-verifierat
mot lokal fil):

**Ersatt citat (bevarat, verbatim-korrekt men off-topic):**
```json
{
  "citat": "Vi vill ge familjer möjlighet till ytterligare tre gratis IVF-försök – även för att skaffa syskon.",
  "kalltyp": "kampanjsida",
  "dokumenttitel": "Vallöften 2026 (kampanjsida, ögonblicksbild 2026-07-03)",
  "url": "https://moderaterna.se/valloften-2026/"
}
```

**Nya M[0]:** "Äldre som har varit med och byggt vårt land ska ha rätt till
god och näringsrik mat hela livet. Därför är det ett vallöfte från
Moderaterna att rädda söndagssteken för äldre."

## Slutstatus Steg A

56/56 citat deterministiskt verifierade (55 via scripts/verify-citat-verbatim.py
+ MP[2] via dokumenterad tvådelad kontroll); evaluatorrundan godkände övriga
55 poster på relevans/täckning; SD:s "tunn"-märkning bedömd korrekt (9 citat
men en källtyp).
