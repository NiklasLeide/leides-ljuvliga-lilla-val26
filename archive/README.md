# archive/ — retired assets from the pre-redesign flik-sajt

These files are **kept for reference, not used by the live site.** They were the
old tab-based site (spektrum/kluster/diskurs/hitta-parti/metod) that the
lens-based Redesign 2026 replaced. After the `app/`→root cutover (2026-07-08)
they became orphaned (zero references from any served page) and were moved here
instead of deleted, per request.

| File | Was | Replaced by |
|------|-----|-------------|
| `app.js` | old spektrum-SPA logic (`index.html`) | `js/*.js` (per-lens modules) |
| `style.css` | old global stylesheet | `css/tokens.css` + per-lens CSS |
| `diskurs.js` | old Diskurs-view | Språk-linsen (`js/sprak.js`) |
| `gal-tan.js` | old GAL-TAN silo script | `js/gal-tan.js` (new lens) |
| `hitta-parti.js` | old "hitta parti"-view | Valkompass (`js/valkompass.js`) |
| `kluster.js` | old kluster-view | Position-linsen (`js/position.js`) |
| `sager-vs-gor.js` | old säger-vs-gör silo script | `js/sager-vs-gor.js` (new lens) |
| `data/gal-tan.json` | placeholder GAL-TAN-data | `data/galtan-view.json` (CHES-baserad) |

Nothing in the live site links here. Safe to delete later if the reference is no
longer wanted; kept for now so the old implementations remain recoverable.
