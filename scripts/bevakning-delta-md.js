#!/usr/bin/env node
/* bevakning-delta-md.js — renderar Lager 1-deltat som markdown för en GitHub-
 * issue-body (Niklas notifiering från Actions). Rå delta: vad som ändrats, var,
 * URL:er. Ingen tolkning — det gör Lager 2/3 lokalt. Skriver till stdout.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.env.BEVAKNING_DIR || '.bevakning';
const d = JSON.parse(fs.readFileSync(path.join(DIR, 'delta.json'), 'utf8'));

const L = [];
L.push(`**Lager 1 hittade ${d.delta.length} ändring(ar)** — ${d.generated}`);
L.push('');
L.push(`Täckning: ${d.coverage.riksdagen} riksdagen-frågor, ${d.coverage.sites} partisajter, ${d.coverage.rss} rss-flöden.` +
  (d.errors.length ? ` ⚠ ${d.errors.length} källa/källor kunde inte kontrolleras (se nedan).` : ''));
L.push('');
L.push('> Rå detektering, noll tokens. **Ingen tolkning gjord** — det gör Lager 2/3 (Haiku→Sonnet) lokalt.');
L.push('> Media är en trigger, aldrig en källa: mediaposter nedan är obekräftade utspel tills de verifierats mot partiets egen kanal eller riksdagen.');
L.push('');

const group = (src) => d.delta.filter((x) => x.layer1_source === src);
function section(title, items, render) {
  if (!items.length) return;
  L.push(`### ${title} (${items.length})`);
  for (const it of items) L.push(render(it));
  L.push('');
}
section('Riksdagen — nya dokument', group('riksdagen'), (x) =>
  `- **${x.area}** · ${x.title || '(utan titel)'} — ${x.detail}\n  - ${x.url}`);
section('Partisajter — sakinnehåll ändrat', group('partisajt'), (x) =>
  `- **${x.party}** · ${x.title} — ${x.detail}\n  - ${x.url}`);
section('Media — utspel (trigger, ej källa)', group('media'), (x) =>
  `- ${x.title}\n  - ${(x.articles || []).map((a) => `[${a.outlet}](${a.url})`).join(' · ')}`);

if (d.errors.length) {
  L.push('### Kunde inte kontrolleras');
  for (const e of d.errors) L.push(`- ${e}`);
  L.push('');
}

L.push('---');
L.push('');
L.push('**Nästa steg (lokalt, Lager 2/3 — Haiku sållar, Sonnet verifierar):**');
L.push('');
L.push('```bash');
L.push('# på grenen bevakning, med delta.json från denna körning i .bevakning/:');
L.push('gh run download --name bevakning-delta --dir .bevakning   # hämtar delta.json från Actions-körningen');
L.push('BEVAKNING_SKIP_DETECT=1 bash scripts/bevakning-loop.sh     # kör Lager 2→3→PR mot detta delta');
L.push('```');
L.push('');
L.push('_Lager 2/3 körs medvetet lokalt (Max-plan), inte i Actions — se docs/BEVAKNING.md._');

process.stdout.write(L.join('\n') + '\n');
