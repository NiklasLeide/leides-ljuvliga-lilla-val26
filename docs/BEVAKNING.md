# Bevakningsloopen (G5) — körning, resume, inspektion

Automatiserad avsökning som upptäcker när partierna publicerar nytt eller ändrar
sig, och levererar granskningsbara ändringsförslag som PR. Byggd på den befintliga
loop-infrastrukturen (`loop-lib.js`, guardrail-mönstren från `data-loop.sh` och
`run-discourse-batch.sh`). Föranledd av att SD:s valplattform låg publicerad i 10
dagar innan en manuell avsökning fann den (2026-07-20).

**Loopen skriver aldrig i `data/`.** Den föreslår; Niklas beslutar; en godkänd
ändring skrivs i en separat runda (samma mönster som manifestrundan).

## Tre lager

| Lager | Vad | Modell | Kostnad |
|---|---|---|---|
| 1 | Deterministisk detektering: riksdagens API, hash på partisajter, media-RSS | ingen | **noll tokens** |
| 2 | Sållar deltat: substantiell ändring vs brus | Haiku | billigast |
| 3 | Verifierar substantiella fynd, formulerar ändringsförslag med grep-verifierat citat | Sonnet | tak $10/vecka |

Lager 2 och 3 körs **bara om Lager 1 gav ett delta**. En tom körning kostar $0.

## Köra

```bash
# Frikopplad engångskörning nu (obligatoriskt i drift — se "Frikoppling"):
bash scripts/start-bevakning-detached.sh

# Schemalägg veckovis (söndag 04:00):
bash scripts/start-bevakning-detached.sh --weekly

# Manuell körning i förgrunden (för test/felsökning):
bash scripts/bevakning-loop.sh
```

Kräver att du står på grenen `bevakning` (branch-vakt, exit 3 annars).

### Första körningen = baslinje

Körning 1 etablerar hash-baslinjer och watchlist-state. **Den hittar inget by
design** — det är framgång, inte fel. Den rapporterar vad som nu bevakas
(N riksdagen-dokument, 8+ partisajter med hash, 6 RSS-flöden) och avslutar med
exit 0. Körning 2 och framåt producerar delta.

## Resume

Loopen är resumbar. State ligger i `.bevakning/` (gitignorerad):

- `.bevakning/state.json` — hash-baslinjer, sedda riksdagen-id, sedda RSS-rubriker
- `.bevakning/loop-state.json` — status, ackumulerad kostnad (via `loop-lib.js`)
- `.bevakning/delta.json` — senaste Lager 1-delta

**Resume-vakt:** en körning som stoppade på veckobudget (`budget_stop`) eller
usage-limit (`usage_limit_stop`) återupptas **inte** automatiskt — den kräver ett
mänskligt beslut (höj tak / åtgärda limit) och en manuell omstart. En avbruten
körning (`interrupted`) återupptas genom att köra samma kommando igen.

## Inspektera

```bash
cat .bevakning/delta.json        # vad Lager 1 hittade
cat .bevakning/loop-state.json   # status + kostnad
cat .bevakning/report-meta.json  # förslag/kräver-beslut/snapshots/fynd-per-parti
tail -f .bevakning/detached.log  # följ en frikopplad körning
```

## Guardrails (alla i kod, inget i prompter)

1. **Veckotak $15 hårt i kod**, kontrollerat före varje modellanrop, fail-closed
   (kan kostnaden inte parsas stoppar loopen, den antar aldrig $0).
2. **Per-steg-budget (v3):** Haiku $2, Sonnet $10.
3. **Branch-sandbox:** vägrar köra utanför `bevakning` (exit 3).
4. **HEAD-vakt:** HEAD fångas före varje modellanrop; ändrad HEAD ⇒ exit 7
   (verktygslistor är konfiguration, inte enforcement — se DEC-007).
5. **Semantiska exitkoder** (budget/branch) limit-klassificeras aldrig;
   limit-grep är mtime-scopad till aktuellt steg.
6. **Resume-vakt:** återupptar bara avbrutna körningar, startar aldrig själv.
7. **Media = trigger, aldrig källa** (enforcat i `bevakning-report.js`): en
   obekräftad mediapost kan i kod aldrig bli ett förslag — den hamnar under
   "Kräver beslut" med medielänken. Fynd viktas aldrig efter medievolym
   (event-dedup i Lager 1: tio artiklar om ett utspel = ett event).

Exitkoder: `0` klar (PR skapad eller tom körning), `2` veckobudget nådd,
`3` fel branch, `4` fail-closed kostnad, `7` git-manipulation, `9` usage-limit.

## Frikoppling (varför start-bevakning-detached.sh)

En loop som barn till en interaktiv session har dödats när förälderprocessen
försvann (diskursbatchen dog 2×, Niklas beslut 2026-07-05). Den frikopplade
starten kör loopen under Task Scheduler-tjänsten (förälder = `svchost`, **inte**
claude/terminalen), så körningen överlever att harnessen dör. Fallback
`cmd start /b` bryter ur anroparens jobbobjekt men ger svagare garanti.

## Watchlist

`data/watchlist.json` styr vad som bevakas (riksdagen-frågor per område,
partisajter inkl. dokument-/publiceringslistor, RSS-flöden). Den **läses** av
loopen och **skrivs aldrig** av den — nya bevakningsobjekt föreslås i rapporten,
inte auto-skrivna. Det håller "loopen skriver aldrig i data/"-invarianten ren.

## Tester (noll API-kostnad)

```bash
bash scripts/test-bevakning-guards.sh   # 12 tester, claude+gh stubbade, fetch=fixtures
```

Täcker bl.a. moderaterna.se-fallet (header-only ändring ⇒ ingen träff),
event-dedup, tom körning, veckobudget-stopp, media=trigger-enforcement,
grep-verifiering och HEAD-vakt.
