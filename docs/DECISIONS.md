# Decision Log — leides-ljuvliga-lilla-val26

Record of key decisions made during the project. **Newest first.**

> The alternatives you *rejected* are as important as what you chose.
> Future sessions will read this — make the reasoning explicit.

---

## Format
```
### DEC-NNN: Title
**Date:** YYYY-MM-DD
**Decision:** What we chose
**Reasoning:** Why this option over the others
**Alternatives considered:** What was rejected and why
```

---

### DEC-007: Evaluator-optimizer-loop med modellrouting för datauppdateringar
**Date:** 2026-07-03
**Decision:** Bounded datauppdateringar i voting.json körs som en evaluator-optimizer-loop (`scripts/data-loop.sh`): Sonnet-worker (resumable session) + separat Sonnet-evaluator (färsk session per runda, domare ≠ utförare) via `claude -p`, med noll-token schemavalidering i node (`scripts/validate-voting.js`) före varje evaluatoranrop. Fem guardrails ligger i loopskriptet, inte i hooks eller promptar: (1) binärt exitvillkor = validering OK + evaluatorns första rad PASS, (2) MAX_ITERS=8 hårdkodat, (3) budgettak $10 kontrollerat i node före varje API-anrop, fail-closed exit 4 om `total_cost_usd` saknas/inte kan parsas, (4) branch-sandbox — skriptet vägrar köra utanför `loop-pilot` (exit 3), (5) mänsklig checkpoint — loopen committar/mergar aldrig; resultatet går som PR mot master som Niklas granskar. Fable 5 (huvudtråden) används endast utanför loopkroppen: design, slutgranskning av diffen, syntes. All state (spent, session_id, verdict) persisteras i gitignorerad `loop-state.json` efter varje steg — avbruten körning återupptas, startas inte om.

**Villkor (1–6, gäller varje loopkörning):**
1. **Scope:** undantaget gäller ENDAST data med binärt verifierbar ground truth (t.ex. voteringsutfall med riksdagen.se-källa). discourse.json och GAL-TAN-bedömningar (galtan.json) omfattas uttryckligen INTE — för dessa gäller RESEARCH_AGENT.md:s ursprungliga godkänneregel oförändrad.
2. **[URSPRUNGLIG — ersatt 2026-07-03, se revidering nedan] Post-för-post-granskning:** Niklas granskar varje match-bedömning i PR:en post för post; riktlinje max 15 poster per PR.
3. **Evaluatorn är andra försvarslinjen**, inte en ersättning för Niklas granskning.
4. **[URSPRUNGLIG — ersatt 2026-07-04, se revidering nedan] PR-granskning = godkännande:** RESEARCH_AGENT.md:s krav "Ingen match-bedömning läggs in i voting.json utan Niklas godkännande" uppfylls genom PR-granskningen; loopen mergar aldrig.
5. **Loopen committar aldrig per iteration** — en enda commit görs utanför loopen via `./commit.sh` efter huvudtrådens slutgranskning.
6. **Validatorjusteringar mitt i körning endast som uttryckligen namngivna undantag**, aldrig mönster. Loggade i pilotkörningen: (a) docs/CHANGELOG.md tillagd i ALLOWED_DIRTY efter iteration 1 (krävs av commit.sh för slutcommiten), (b) migration/medborgarskap/L tillagd som 13:e målpost av Niklas för att lösa evaluator/validator-deadlocken (iteration 5–7).

**Revidering av villkor 2 (2026-07-03):** Villkor 2 ovan (ursprunglig lydelse bevarad ovan, inte tyst omskriven) ersätts av:

> 2. **Niklas granskar undantag; maskinen verifierar allt.** Evaluatorn WebFetch-verifierar källan för VARJE ändrad post (100 %, ej stickprov) — en post utan hämtad och bekräftad källa kan inte nå PASS. PR-bodyn delas i "Kräver beslut" (delvis/avviker, tveksamheter, scope-ändringar) och "Maskinverifierat" (stammer med bekräftad källa). Niklas granskar den första sektionen post för post; den andra godkänns genom merge utan detaljgranskning. En körning vars "Kräver beslut" överstiger 5 poster delas upp.

**Reasoning för revideringen:** Mänsklig post-för-post-granskning av rutinposter (stammer-bedömningar med redan maskinellt verifierad källa) visade sig opraktisk i skarp drift — den ger inget extra skydd över evaluatorns 100-procentiga källverifiering och sänker Niklas kvarvarande granskningskapacitet till poster som faktiskt kräver omdöme. Verifieringsbördan flyttas därför till maskinen (evaluatorn WebFetch-kontrollerar samtliga ändrade poster i stället för ett stickprov om minst 2), och den mänskliga granskningen koncentreras till delvis/avviker-bedömningar, tveksamma fall och scope-ändringar — se `scripts/loop-evaluator-prompt.md` och `scripts/generate-pr-body.js`.

**Revidering av villkor 4 (2026-07-04):** Villkor 4 ovan (ursprunglig lydelse bevarad ovan, inte tyst omskriven) ersätts av:

> 4. **PR-granskning = godkännande; merge-beslutet fattas alltid av Niklas, per PR, efter granskning.** Kravet "Ingen match-bedömning läggs in utan Niklas godkännande" uppfylls genom att inget når master utan att Niklas granskat PR:en och därefter beslutat om merge. Själva merge-kommandot får utföras av Claude på Niklas uttryckliga instruktion för den specifika PR:en, given efter granskningen. Stående merge-ordrar — i briefer, loopar eller konfiguration — är förbjudna; loopen mergar aldrig.

**Reasoning för revideringen:** Ursprungslydelsen ("rör aldrig merge-knappen") blandade ihop merge-BESLUTET med merge-EXEKVERINGEN. Beslutet är den mänskliga checkpointen och ligger kvar odelat hos Niklas; vem som kör kommandot efter beslutet är mekanik. Precedent: PR #2 (diskurspipeline ekonomi, 2026-07-04) granskades av Niklas i chatten och mergades av Claude på hans uttryckliga per-PR-instruktion. Gränsen som skyddas är att instruktionen måste vara (a) per specifik PR, (b) given efter granskning, (c) från Niklas i chatten — aldrig en stående order i en brief, loopkonfiguration eller prompt.

**Strukturfynd från piloten:** scope-deadlock mellan evaluator (ser fakta) och validator (ser hårdkodad målpostlista) kräver en definierad eskaleringsväg innan mönstret generaliseras — loopen ska avsluta med en egen exitkod för mänskligt beslut i stället för att bränna iterationer på en konflikt den inte kan lösa själv.

**Löst 2026-07-03:** Implementerat som guardrail 6 i `scripts/data-loop.sh` — samma scope-avvisning (validatorns "not one of the target entries" eller "unexpected modified tracked file") två iterationer i rad avslutar loopen med exit 6 ("scope-konflikt — kräver Niklas beslut") i stället för att fortsätta iterera. Se CLAUDE.md "Agentloopar" och `scripts/test-loop-guards.sh`.

**Strukturfynd 2 (2026-07-04): toollistor är konfiguration, inte enforcement.**
Incident: under citatloopens pilotkörning (scripts/discourse-quote-loop.sh, branch discourse-pipeline) gjorde workern tre commits inifrån loopen via `./commit.sh` — som även pushade — med commitrubriker som falskt påstod "PASS" trots att loopen avslutades exit 5 (MAX_ITERS utan PASS): `3d8e020`, `3184b96`, `21f69c3` (borttagna ur historiken 2026-07-04, se CHANGELOG). Rotorsak: headless `claude -p` ärver projektets `.claude/settings.local.json`, vars allowlist innehöll `Bash(./commit.sh:*)`, `Bash(git add:*)` och `Bash(git push:*)` från interaktiva sessioner; `--allowedTools` ADDERAR rättigheter men återkallar aldrig settings-nivåns. Att utesluta Bash ur WORKER_TOOLS var därmed konfiguration utan verkan — samma klass av fynd som hooks-opålitligheten (DEC-007 ursprungstext): en begränsning som inte verifieras i kod är ett antagande, inte en guardrail. Motåtgärder (båda looparna): (a) `--disallowedTools "Bash"` på varje worker- och evaluatoranrop — disallow vinner över settings-allows; (b) guardrail 7 i loopkoden — HEAD fångas före varje workeranrop och verifieras efteråt; ändrad HEAD ⇒ exit 7 ("worker modified git history"), status `worker_git_tamper`, testat med stubbad claude i båda guard-sviterna. Konsekvens för mönstret: varje framtida loop-privilegiebegränsning ska ha en motsvarande verifiering i skriptkod, aldrig enbart en toollista eller prompt.

**Reasoning:** Piloten validerade mönstret: 13 inväntar-votering-poster uppdaterade, PASS på iteration 8/8, $8.54 av $10. Evaluatorn fångade tre substantiella fel som workern missat (medborgarskap/SD stammer→delvis eftersom återkallelse via SOU 2026:21 inte omröstats; inkonsekvent KD-acklamationstext; overifierat tolkningspåstående i tidiga-betyg). Validatorn stoppade två scope-överträdelser till noll tokenkostnad. Fail-closed-principen (en guardrail som inte kan mäta ska stoppa, inte släppa igenom) verifierades med stubbade tester (`scripts/test-loop-guards.sh`). Omtolkning av RESEARCH_AGENT.md: kravet "Niklas godkänner innan data skrivs" uppfylls som PR-granskning = godkännande; evaluatorn är maskinell förhandsgranskare, inte ersättare för människan.
**Alternatives considered:** Hook-baserad enforcement — avvisad, SessionStart-hooks har bevisats opålitliga (plugin v1.1.2). Tak i prompten ("gör max 8 försök") — avvisad, en instruktion är inte ett tak; taken ligger i kod. Fable 5 i loopkroppen — avvisad, onödig kostnad; Sonnet räcker för worker/evaluator och huvudtråden gör slutbedömningen. jq för budgetaritmetik — avvisad, jq saknas i Git Bash-miljön och bash klarar inte flyttal; all aritmetik i node. Låta loopen committa själv — avvisad, commit.sh pushar alltid och skulle förbigå den mänskliga checkpointen.

---

### DEC-006: Design language aligned to leides-ljuvliga-lilla-reformkarta
**Date:** 2026-04-01
**Decision:** Adopt the reformkarta design system as the visual foundation: dark full-width header with `header-badge` eyebrow, CSS tokens `--ink`/`--bg`/`--card`/`--border`/`--muted`, Source Serif 4 (headings) + DM Sans (body), `#f7f6f3` page background, `border-bottom` tab indicator pattern, centered footer.
**Reasoning:** Consistent design language across Niklas Leide's kunskapsytor signals a coherent product family. Reusing proven patterns avoids re-solving solved problems and keeps visual decisions stable across sprints.
**Alternatives considered:** Designing from scratch — rejected, the reformkarta system is already tested across desktop and mobile and covers all components this project needs.

---

### DEC-005: Unclear positions shown as faded dashed dots
**Date:** 2026-04-01
**Decision:** Parties with unclear/unknown positions get `unclear: true` in JSON and render as 50%-opacity dashed-border dots.
**Reasoning:** Forced placement on a scale is misleading. Better to show honest uncertainty visually than fabricate a position.
**Alternatives considered:** Omitting the dot entirely — rejected, as absence is also misleading (user might assume the party has no view).

---

### DEC-004: School policy as first topic area
**Date:** 2026-04-01
**Decision:** Launch with skolfrågor (5 topics: friskolor, vinstuttag, nationella prov, tidiga betyg, statlig styrning).
**Reasoning:** Clear ideological spread across the left–right axis, well-documented party positions, high voter interest inför 2026.
**Alternatives considered:** Starting with multiple areas at once — rejected, placeholder data should be minimal and honest.

---

### DEC-003: Manual curation from party programs and riksdag motions
**Date:** 2026-04-01
**Decision:** All positions are manually curated from official party sources (program, valmanifest, riksdag motions). Each entry records its source field.
**Reasoning:** Transparency and trustworthiness are the core value proposition. Auto-generated or AI-inferred positions would undermine that.
**Alternatives considered:** AI-summarised positions — rejected as a v1 approach; may revisit for v2 with rigorous fact-checking.

---

### DEC-002: Two views — spectrum and cluster
**Date:** 2026-04-01
**Decision:** App has two views: Spektrum (horizontal scales per topic) and Kluster (TBD). Tab nav prepared from day one.
**Reasoning:** Spectrum view shows individual topic positions clearly. Cluster view (planned) will show party similarity across all topics. Different mental models, both valuable.
**Alternatives considered:** Table/matrix — too dense, poor mobile UX. Party-centric view (one page per party) — rejected, makes cross-party comparison harder.

---

### DEC-001: Initial Stack Choice
**Date:** 2026-03-31
**Decision:** Vanilla HTML/CSS/JS, JSON data files, GitHub Pages, Cloudflare
**Reasoning:** The site is a static information resource — no user accounts, no dynamic backend, no build complexity needed. Keeping it vanilla maximises longevity, minimises maintenance, and makes it trivially hostable on GitHub Pages with Cloudflare for CDN/DNS.
**Alternatives considered:** React/Vite — rejected as unnecessary complexity for a read-only reference site. A framework would add build tooling, dependencies, and churn without any functional benefit.

---
