# Roadmap — leides-ljuvliga-lilla-val26

> Keep this honest. If something's not happening, move it to Deferred — don't leave it rotting in Next.

---

## Sprint 0 — Setup (current)

- [x] 0.1 Create GitHub issue for spectrum view MVP *(manuellt — gh CLI saknas)*
- [x] 0.2 Log architectural decisions in DECISIONS.md
- [x] 0.3 Build spectrum view with placeholder data
- [ ] 0.4 Test desktop + 375px mobile

---

## Sprint 0.5 — Infrastructure

- [ ] 0.5.1 Add CNAME file (val26.leide.se)
- [ ] 0.5.2 Create commit.sh (same pattern as reformkartan)
- [ ] 0.5.3 Create deploy.sh (same pattern as reformkartan)
- [ ] 0.5.4 Enable GitHub Pages on repo *(manual — Niklas)*
- [ ] 0.5.5 Configure Cloudflare DNS CNAME *(manual — Cloudflare dashboard)*
- [ ] 0.5.6 Add Cloudflare Web Analytics with separate site tag *(manual — Niklas)*
- [ ] 0.5.7 Verify site is live at val26.leide.se

---

## Sprint 1 — Cluster view

- [ ] 1.1 Build cluster view with animated groupings
- [ ] 1.2 Tab navigation between spectrum and cluster
- [ ] 1.3 Detail panel on click (party card with source)

---

## Sprint 2 — Real content

- [ ] 2.1 Research and fill in actual party positions for school topics
- [ ] 2.2 Methodology page ("Om metoden")
- [ ] 2.3 Source links and citation for every position

---

## Sprint 3 — Expand

- [ ] 3.1 Add more policy areas beyond school
- [ ] 3.2 Polish, SEO, public launch before election Sept 2026

---

## Backlog / v2

- [ ] Verify positions against riksdag voting data ("says vs does")
- [ ] SOM/CMP data validation

---

## Deferred / Won't Do

- **React/Vite** — unnecessary complexity for a read-only static site; vanilla HTML is sufficient and more durable.
- **Party-centric view** (one page per party) — makes cross-party comparison harder; spectrum/cluster views serve this better.
- **Table/matrix view** — too dense, poor mobile UX.
