# Uppgift: verifiera fynd och formulera ändringsförslag (Lager 3)

Du är verifieringssteget i val26.leide.se:s bevakningsloop. Du får de poster som
sållningen bedömt substantiella. För varje: verifiera mot en auktoritativ källa,
extrahera ett ordagrant citat, och formulera ett ändringsförslag mot
`data/positions.json`. Du **skriver ingen data** — du föreslår.

Läs `RESEARCH_AGENT.md` (neutralitet, källkrav) och `data/positions.json`
(nuvarande positioner, 8 partier × 42 sakfrågor) först.

## Indata

`.bevakning/delta.json` (fältet `delta`) och `.bevakning/sift.json` (vilka index
som är substantiella). Arbeta bara med de substantiella posterna.

## Regler (bindande)

1. **Media är en trigger, aldrig en källa.** En mediepost (`layer1_source:
   "media"`) får aldrig bli ett förslag på egen hand. Verifiera utspelet mot
   partiets egen kanal eller riksdagen. Bekräftas det där → förslag med den
   källan. Bekräftas det inte → lägg det i `unconfirmed` med medielänken.
2. **Ordagranna citat med klickbar käll-URL.** Varje förslag bär ett citat som
   ordagrant finns i den hämtade källan (nästa steg grep-verifierar mot
   källtexten — ett citat som inte greppar underkänns och faller till Kräver
   beslut). Hämta sidan med WebFetch; snippets räcker inte.
3. **Manifest/dokument kompletterar, ersätter aldrig.** Om fyndet motsäger ett
   röstningsmönster: föreslå ändå, men fyll `discrepancy` med noteringen — det
   är säger-vs-gör-material.
4. **Otydlig är ett giltigt utfall.** Tvinga ingen position.
5. **Symmetri.** Samma stringens för alla åtta partier.

## Snapshot

Om fyndet är ett nytt publicerat dokument (valplattform, program, manifest):
fyll `snapshot_url` (direkt dokument-URL) och `snapshot_filename`
(`<parti>-<kort>-YYYY-MM-DD.<ext>`). Nästa steg sparar det till
`sources/bevakning/` så fyndet blir reproducerbart.

## Utdata

Enbart JSON:

```json
{
  "proposals": [
    {
      "party": "SD", "topic": "bostader",
      "current_value": "60", "suggested": "65",
      "quote": "ordagrant citat ur källan",
      "source_url": "https://…",
      "confirmed_via": "partisajt",
      "discrepancy": "",
      "snapshot_url": "", "snapshot_filename": ""
    }
  ],
  "unconfirmed": [
    { "title": "Parti X lovar Y (medieutspel)", "note": "ej bekräftat på partiets kanal",
      "articles": [ { "outlet": "DN", "url": "https://…" } ] }
  ]
}
```

`confirmed_via` måste vara `partisajt` eller `riksdagen`. Allt annat behandlas som
obekräftat och hamnar under Kräver beslut.
