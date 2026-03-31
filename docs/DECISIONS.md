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

### DEC-001: Initial Stack Choice
**Date:** 2026-03-31
**Decision:** Vanilla HTML/CSS/JS, JSON data files, GitHub Pages, Cloudflare
**Reasoning:** The site is a static information resource — no user accounts, no dynamic backend, no build complexity needed. Keeping it vanilla maximises longevity, minimises maintenance, and makes it trivially hostable on GitHub Pages with Cloudflare for CDN/DNS.
**Alternatives considered:** React/Vite — rejected as unnecessary complexity for a read-only reference site. A framework would add build tooling, dependencies, and churn without any functional benefit.

---
