# Claude Code-brief: Diskurspipeline (citatloop → dubbelutkast → divergensrapport)

**Mottagare:** Claude Code, lokal session i val26-repot, huvudtråd Fable 5
**Branch:** `discourse-pipeline` (ny, från master)
**Miljö:** Git Bash MINGW64, node för all JSON/flyttal (ingen jq), inga glob-mönster i git-kommandon
**Regelgrund:** DEC-007 (villkor 1: discourse.json är tolkningsdata — ingen maskin skriver i den utan Niklas godkännande i chatten), RESEARCH_AGENT.md, DISCOURSE_AGENT.md, CLAUDE.md "Agentloopar"

---

## Mål

Bygg en tre-stegs pipeline som automatiserar förarbetet till diskursanalys.
**Pipelinen skriver ALDRIG i data/discourse.json** — dess slutprodukt är
utkast + divergensrapport som Niklas granskar i chatten (Fable 5), varefter
godkänd text implementeras i ett separat, vanligt steg.

Pilotområde: **ekonomi** (alla 8 partier). Övriga fyra områden
(demokrati/konstitution, försvar, skola, vård) körs först efter att
Niklas godkänt pipelinens output för ekonomi.

Tidsfönster: valrörelsefokus 2025/26 → idag (konsistent med discourse.json
v0.3.0). Drift noteras endast där citaten själva visar den.

---

## Steg A — Citatinsamlingsloop (återanvänd loop v2-mönstret)

Ny konfig för `scripts/data-loop.sh` (eller ett systerskript
`scripts/discourse-quote-loop.sh` som återanvänder loop-lib.js — välj det
som kräver minst duplicering, motivera valet).

**Uppgift:** samla 6–12 citat per parti för området ekonomi.

**Källor i prioritetsordning** (per RESEARCH_AGENT.md): budgetmotioner och
ekonomisk-politiska motioner 2025/26, riksdagens budget-/partiledardebatter
(protokoll på riksdagen.se), partiprogrammens ekonomikapitel, valmanifest
enligt sources/manifest/2026/KATALOG.md (S, C, L slutgiltiga; V preliminär
— markera; M endast snapshot — markera "kampanjsida (ögonblicksbild)";
SD/KD/MP har inga manifestkällor — använd övriga källtyper, notera i
katalogen vilka källtyper varje parti bygger på).

**Output:** `sources/discourse/citat-ekonomi.json` — per citat:
parti, citat (ordagrant), källtyp, dokumenttitel, url, datum,
kontext (1 mening, beskrivande — ingen tolkning).

**Binärt exitvillkor (evaluatorn):**
1. Varje citat WebFetch-verifierat ordagrant mot angiven URL (100 %,
   fail-closed: overifierbart citat ⇒ REVISE)
2. Varje parti har ≥6 citat från ≥2 källtyper, ELLER är explicit markerad
   "tunn källbas" med beskrivning av vad som saknas (ärlig lucka slår
   påhittad täckning)
3. Citatens spridning: minst ett citat per parti från riksdagsmaterial
   (motion eller protokoll) — kampanjmaterial får inte vara enda källtyp
4. JSON-schema validerar (node-validator, noll tokens)

**Guardrails:** samma som loop v2 — iterationstak 8, budgettak $15 i kod,
fail-closed kostnadsparsning (exit 4), branchkontroll (exit 3),
scope-konflikt (exit 6), state-fil för resume, en commit utanför loopen.
Worker: Sonnet (CLAUDE_CODE_SUBAGENT_MODEL). Evaluator: separat
Sonnet-session med egna instruktioner.

**STOPP A:** när loopen exitat — rapportera katalogstatistik (citat per
parti, källtyper, luckor) i chatten. Niklas godkänner innan steg B.

---

## Steg B — Dubbelutkast (två modeller, oberoende)

Två separata `claude -p`-anrop, **strikt oberoende** (ingen delad kontext,
får inte se varandras output):

- Utkast 1: `--model claude-sonnet-4-6`
- Utkast 2: `--model claude-opus-4-8`

**Identisk prompt till båda** (skriv den som
`scripts/discourse-draft-prompt.md`):
- Input: citat-ekonomi.json + DISCOURSE_AGENT.md (metodik, fältnamn,
  kvalitetskrav) + relevanta befintliga poster ur discourse.json som
  stilreferens + galtan.json för kongruensbedömning
- Uppgift: fullständigt utkast per parti för området ekonomi enligt
  DISCOURSE_AGENT.md:s struktur (inramning, nodalpunkter, flytande
  signifikanter, GAL-TAN-kongruens), på svenska, ENDAST baserat på
  citaten i katalogen — inga egna citat eller minneskunskap
- Signifikant-kandidater att pröva mot materialet: "ansvar" (ekonomisk
  kontext), "plånboken", "hårt arbetande", "vanligt folk", "arbetslinjen"
  — behåll bara de som bär i citaten, föreslå egna om materialet visar dem
- Output: `drafts/discourse-ekonomi-sonnet.json` respektive
  `drafts/discourse-ekonomi-opus.json`

**Tak:** ett anrop per modell, max ett omförsök vid trasig JSON (validera
med node). Detta är inte en loop — konvergens är inte målet, oberoende är.

---

## Steg C — Divergensrapport

Ett tredje `claude -p`-anrop (`--model claude-opus-4-8`, egen prompt
`scripts/discourse-diverge-prompt.md`):

- Input: båda utkasten, parti för parti
- Uppgift: klassificera per parti och analysdel:
  - **SAMSTÄMMIGT** — utkasten säger i sak samma; skriv en konsoliderad
    version (välj den bättre formuleringen, ingen ny substans)
  - **DIVERGENS** — utkasten skiljer i sak (olika inramning identifierad,
    olika signifikantbedömning, olika kongruensslutsats); redovisa båda
    versionerna sida vid sida + en neutral beskrivning av VAD som skiljer
    (aldrig vilken som är "rätt")
- Output: `drafts/discourse-ekonomi-RAPPORT.md` med två sektioner:
  **"Kräver Niklas beslut"** (alla divergenser, per parti) och
  **"Samstämmigt"** (konsoliderad text, läsbar i sin helhet)
- Rapporten inleds med statistik: antal divergenser per parti — partier
  med 0 divergenser listas också (det är information, inte frånvaro)

**STOPP C:** committa allt på discourse-pipeline, pusha, skriv ut
RAPPORT.md:s statistiksektion i chatten. **Kör INTE vidare** — Niklas tar
rapporten till chatten (Fable 5) för granskning. Implementering i
discourse.json sker som separat uppgift efter godkännande där.

---

## Definition of Done (pipelinepiloten)

- [ ] Citatkatalog med 100 % verifierade citat eller ärligt markerade luckor
- [ ] Två oberoende utkast, giltiga mot DISCOURSE_AGENT.md:s fältstruktur
- [ ] Divergensrapport med beslut/samstämmigt-uppdelning
- [ ] Inget skrivet i data/discourse.json
- [ ] Kostnad rapporterad per steg (A/B/C separat)
- [ ] Kort utvärdering: är dubbelutkast+divergens värt kostnaden jämfört
      med ett utkast? (underlag inför batch av återstående 4 områden)

## Rapportera till Niklas

Vid STOPP A och STOPP C. Kritisk vän-läge: flagga spänningar mot
DISCOURSE_AGENT.md INNAN implementation.
