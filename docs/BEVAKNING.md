# Bevakningsloopen (G5) — körning, resume, inspektion

Automatiserad avsökning som upptäcker när partierna publicerar nytt eller ändrar
sig, och levererar granskningsbara ändringsförslag som PR. Byggd på den befintliga
loop-infrastrukturen (`loop-lib.js`, guardrail-mönstren från `data-loop.sh` och
`run-discourse-batch.sh`). Föranledd av att SD:s valplattform låg publicerad i 10
dagar innan en manuell avsökning fann den (2026-07-20).

**Loopen skriver aldrig i `data/`.** Den föreslår; Niklas beslutar; en godkänd
ändring skrivs i en separat runda (samma mönster som manifestrundan).

## Tre lager — och var de körs

| Lager | Vad | Modell | Var | Kostnad |
|---|---|---|---|---|
| 1 | Deterministisk detektering: riksdagens API, hash på partisajter, media-RSS | ingen | **GitHub Actions** (veckocron) | **noll tokens** |
| 2 | Sållar deltat: substantiell ändring vs brus | Haiku | **lokalt** | billigast |
| 3 | Verifierar substantiella fynd, formulerar ändringsförslag med grep-verifierat citat | Sonnet | **lokalt** | tak $10/vecka |

Lagren är splittade efter **var de kan köra**. Lager 1 är ren fetch/hash/API-poll
utan modellåtkomst — det körs på GitHubs infrastruktur (oberoende av dev-maskinen;
`schtasks` var lokalt och kördes inte om maskinen sov). Lager 2/3 kräver
modellåtkomst och körs medvetet **lokalt** på Max-planen — ingen API-nyckel ligger
i Actions (separat billing, ej beslutat). Att flytta Lager 2/3 till Actions senare
är en config-ändring (secret + ett jobb som kör `BEVAKNING_SKIP_DETECT=1`), inte en
omskrivning.

## Lager 1 i GitHub Actions

Workflow: `.github/workflows/bevakning.yml`, kör `scripts/bevakning-ci.sh`.

- **Schema:** cron `7 4 * * 0` = **söndag 04:07 UTC** (GitHub-cron är alltid UTC;
  Sverige 06:07 CEST sommar / 05:07 CET vinter). Några minuter över hel timme för
  att undvika den mest belastade schemaslotten. Kör även på `workflow_dispatch`
  (manuellt via Actions-fliken eller `gh workflow run bevakning.yml`).
- **Notifiering:** tom delta ⇒ tyst (bara logg, exit 0), inkl. första
  baslinjekörningen. Icke-tom delta ⇒ **GitHub-issue** (datum + antal i titeln, rå
  delta i body) — det är din notifiering. Fel eller otillgänglig källa ⇒ issue.
  Ingen körning slutar tyst.
- **Aktivering:** schedule/dispatch triggar först när workflow-filen ligger på
  **default-grenen** (GitHub-plattformsvillkor). Den aktiveras alltså när denna
  PR mergas.

### State — committas till repot (inte Actions-cache)

Lager 1-state (hashar, sedda riksdagen-id, sedda RSS-rubriker) ligger i den
**committade** filen `bevakning-state.json` (repo-roten). Workflow:en committar
tillbaka den efter varje körning (`permissions: contents: write`).

**Varför commit och inte cache:** Actions-cache vräks efter 7 dagar utan träff —
precis veckoschemats gräns. En missad eller försenad körning skulle nollställa
baslinjen och tyst missa allt som hänt sedan sist — oacceptabelt för den del som
"aldrig får missa något". Committad state är permanent, auditbar (git-historik
visar varje baslinjeändring), och en `concurrency`-grupp + `git pull --rebase`
före push serialiserar skrivningar så en manuell dispatch och cronen aldrig
klobbar varandra.

`bevakning-state.json` är därför **inte** gitignorerad. Lokala körningar rör den
aldrig — de använder `.bevakning/state.json` (gitignorerad) eftersom de inte
sätter `BEVAKNING_STATE_FILE`. Sätt aldrig den env-variabeln lokalt om du inte
vill skriva den committade filen.

## Köra Lager 2/3 lokalt mot ett delta (från Actions)

När Actions filat en delta-issue:

```bash
# på grenen bevakning:
gh run download --name bevakning-delta --dir .bevakning   # hämtar delta.json från körningen
BEVAKNING_SKIP_DETECT=1 bash scripts/bevakning-loop.sh     # Lager 2→3→PR mot detta delta
```

`BEVAKNING_SKIP_DETECT=1` hoppar över Lager 1 och kör Haiku→Sonnet→rapport→PR mot
det befintliga `.bevakning/delta.json`. Utan flaggan kör `bevakning-loop.sh` hela
pipelinen lokalt (Lager 1 + 2 + 3), oförändrat.

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

## Riksdagen — datumfönster + paginering (får aldrig missa något)

Riksdagens `dokumentlista` sorterar datum desc och ger 20 dokument per sida.
Utan bud skulle sida 1 bara täcka de 20 senaste av ibland tusentals träffar — och
om >20 nya dokument dyker upp i en frågas scope mellan två veckokörningar hamnar
överskottet på sida 2+ och missas. Därför:

- varje riksdagen-fråga begränsas till ett **datumfönster** (`from` = idag − 60
  dygn) så träffmängden blir liten och fullständigt hämtbar (i praktiken 0–15
  dokument/fråga — långt under en sida);
- resultatet **pagineras** (sz=100, följ `@nasta_sida` upp till 20 sidor) så hela
  fönstret hämtas även om det någon gång skulle spänna flera sidor.

60 dygn är vida mer än veckokadensen: även ~8 missade körningar i rad tappar
inget. **Två tal, två enheter** (syns i loggen som "15 riksdagen-frågor -> N
dokument"): 15 = antal watchlist-**frågor** som pollas; N = antal unika
**dokument** de returnerar och som seedas i baslinjen. De är inte samma sak och
ska inte jämföras. Residual: ett dokument bakdaterat (datum) mer än 60 dygn
tillbaka faller utanför fönstret — samma begränsning som riksdagens egen
datumsortering redan hade.

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
