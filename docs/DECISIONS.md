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
