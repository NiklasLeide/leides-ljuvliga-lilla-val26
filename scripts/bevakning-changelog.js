#!/usr/bin/env node
/* bevakning-changelog.js — skriver EN auktoritativ CHANGELOG-rad för en
 * bevakningskörning. Deterministisk (ingen modell). Anropas av bevakning-loop.sh
 * före ./commit.sh (commit.sh kräver en CHANGELOG-ändring vid kodändring).
 * Args: <proposals> <krav_beslut> <snapshots> <spent_usd>
 */
'use strict';
const fs = require('fs');
const [prop, beslut, snaps, spent] = process.argv.slice(2);
const date = new Date().toISOString().slice(0, 10);
const line = `[${date}] chore: bevakningskörning (G5) — ${prop} grep-verifierade ändringsförslag, ${beslut} kräver beslut, ${snaps} snapshot(ar) till sources/bevakning/, kostnad $${spent}. Loopen skrev inget i data/; förslag levereras som PR för Niklas beslut. Rapport: drafts/BEVAKNING-${date}.md`;
const p = 'docs/CHANGELOG.md';
let md = fs.readFileSync(p, 'utf8');
const i = md.indexOf('---\n');
const at = i === -1 ? 0 : i + 4;
md = md.slice(0, at) + '\n' + line + '\n' + md.slice(at);
fs.writeFileSync(p, md);
console.log('CHANGELOG: ' + line);
