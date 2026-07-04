#!/usr/bin/env node
// render-area-prompt.js <templateFile> <areaId>
// Renders a prompt template with values from scripts/discourse-areas/<areaId>.json.
// Placeholders: {{OMRADE_ID}} {{OMRADE_NAMN}} {{AMNESAVGRANSNING}}
//               {{KALLVAGLEDNING}} {{SIGNIFIKANT_KANDIDATER}}
// Fail-closed: unknown area, missing config field or unresolved placeholder
// aborts (exit 1) — a half-rendered prompt must never reach a worker.
'use strict';
const fs = require('fs');

const [templateFile, areaId] = process.argv.slice(2);
if (!templateFile || !areaId) { console.error('usage: render-area-prompt.js <template> <areaId>'); process.exit(1); }
if (!/^[a-z]+$/.test(areaId)) { console.error(`invalid areaId "${areaId}"`); process.exit(1); }

const cfgPath = `scripts/discourse-areas/${areaId}.json`;
if (!fs.existsSync(cfgPath)) { console.error(`no area config: ${cfgPath}`); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
for (const f of ['omrade_id', 'namn', 'amnesavgransning', 'kallvagledning', 'signifikant_kandidater']) {
  if (!cfg[f] || (Array.isArray(cfg[f]) && !cfg[f].length)) { console.error(`area config ${areaId}: field "${f}" missing/empty`); process.exit(1); }
}
if (cfg.omrade_id !== areaId) { console.error(`area config mismatch: file ${areaId} has omrade_id ${cfg.omrade_id}`); process.exit(1); }

let t = fs.readFileSync(templateFile, 'utf8');
const subs = {
  OMRADE_ID: cfg.omrade_id,
  OMRADE_NAMN: cfg.namn,
  AMNESAVGRANSNING: cfg.amnesavgransning,
  KALLVAGLEDNING: cfg.kallvagledning,
  SIGNIFIKANT_KANDIDATER: cfg.signifikant_kandidater.map((s) => `"${s}"`).join(', '),
};
for (const [k, v] of Object.entries(subs)) t = t.split(`{{${k}}}`).join(v);

const left = t.match(/\{\{[A-Z_]+\}\}/g);
if (left) { console.error(`unresolved placeholders: ${[...new Set(left)].join(', ')}`); process.exit(1); }
process.stdout.write(t);
