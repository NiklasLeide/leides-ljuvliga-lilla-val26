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
