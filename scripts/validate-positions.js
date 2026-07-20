#!/usr/bin/env node
/* Kontraktsvalidering för data/positions.json (positionslinsen). Noll tokens.
 * Exit 0 = giltig, exit 1 = brott (utskrivna).
 * Kör: node scripts/validate-positions.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const PARTIES = ['S', 'M', 'SD', 'V', 'C', 'KD', 'L', 'MP'];
const EXPECTED_TOPICS = 42;
const p = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'positions.json'), 'utf8'));
const fail = [];
const urlDebt = [];

if (![1, 2].includes(p.schemaVersion)) fail.push(`schemaVersion måste vara 1 eller 2 (fick ${p.schemaVersion})`);
const declared = Array.isArray(p.parties) ? p.parties : Object.keys(p.parties || {});
if (declared.length !== 8) fail.push(`parties måste vara 8 partier (fick ${declared.length})`);
PARTIES.forEach(x => { if (!declared.includes(x)) fail.push(`parti saknas i parties: ${x}`); });

let topics = 0;
const ids = new Set();
for (const a of p.areas) {
  if (!a.id || !a.name) fail.push(`område saknar id/name: ${JSON.stringify(a).slice(0, 60)}`);
  for (const t of a.topics) {
    topics++;
    if (ids.has(t.id)) fail.push(`duplicerat topic-id: ${t.id}`);
    ids.add(t.id);
    if (!t.scale || typeof t.scale.low !== 'string' || typeof t.scale.high !== 'string')
      fail.push(`${t.id}: scale.low/high saknas`);

    const got = Object.keys(t.positions || {});
    if (got.length !== 8) fail.push(`${t.id}: ${got.length} partier, förväntat 8`);
    PARTIES.forEach(party => {
      const v = (t.positions || {})[party];
      if (!v) { fail.push(`${t.id}: parti saknas: ${party}`); return; }
      const w = `${t.id}/${party}`;
      if (!Number.isInteger(v.position) || v.position < 0 || v.position > 100)
        fail.push(`${w}: position måste vara heltal 0-100 (fick ${v.position})`);
      if (typeof v.group !== 'string' || !v.group.trim()) fail.push(`${w}: group saknas`);
      if (typeof v.summary !== 'string' || !v.summary.trim()) fail.push(`${w}: summary saknas`);
      if (typeof v.unclear !== 'boolean') fail.push(`${w}: unclear måste vara boolean`);
      // RESEARCH_AGENT.md: ingen ståndpunkt utan verifierbar källa med URL.
      // Hårt krav på granskade positioner (senast_granskad satt); äldre poster
      // utan URL är befintlig skuld och räknas som varning, inte brott.
      if (typeof v.source !== 'string' || !v.source.trim()) fail.push(`${w}: source saknas`);
      else if (!/https?:\/\/\S+/.test(v.source)) {
        if (v.senast_granskad) fail.push(`${w}: granskad position saknar klickbar URL`);
        else urlDebt.push(w);
      }
      if (v.senast_granskad !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(v.senast_granskad))
        fail.push(`${w}: senast_granskad måste vara YYYY-MM-DD (fick ${v.senast_granskad})`);
    });
  }
}
if (topics !== EXPECTED_TOPICS) fail.push(`${topics} sakfrågor, förväntat ${EXPECTED_TOPICS}`);

const granskade = [];
for (const a of p.areas) for (const t of a.topics) for (const party of PARTIES)
  if (t.positions[party] && t.positions[party].senast_granskad) granskade.push(`${t.id}/${party}`);

if (fail.length) {
  console.error(`positions.json: ${fail.length} brott`);
  fail.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('positions.json GILTIG');
console.log(`  schemaVersion:      ${p.schemaVersion}`);
console.log(`  ${p.areas.length} områden, ${topics} sakfrågor x 8 partier = ${topics * 8} positioner`);
console.log(`  alla granskade positioner har klickbar URL i source`);
if (urlDebt.length) {
  console.log(`  VARNING: ${urlDebt.length} ogranskade positioner saknar klickbar URL (befintlig skuld,`);
  console.log(`           ej införd av denna ändring — se SITE_BACKLOG)`);
}
console.log(`  senast_granskad satt på ${granskade.length} positioner`);
