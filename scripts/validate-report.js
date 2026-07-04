#!/usr/bin/env node
// validate-report.js <claude-response.json> <output-report.md>
// Extracts the divergence report markdown from a claude -p response,
// strips an accidental outer fence, checks required structure, writes it.
// Exit 0 = report written; exit 1 = invalid (message on stderr, used for
// the single retry allowed in Steg C).
'use strict';
const fs = require('fs');

const [respFile, outFile] = process.argv.slice(2);
if (!respFile || !outFile) { console.error('usage: validate-report.js <resp> <out>'); process.exit(2); }

let resp;
try {
  resp = JSON.parse(fs.readFileSync(respFile, 'utf8'));
} catch (e) {
  console.error(`response file is not valid JSON: ${e.message}`);
  process.exit(1);
}
let t = String(resp.result ?? resp.response ?? '').trim();
const fence = t.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/);
if (fence) t = fence[1].trim();

const fail = [];
if (t.length < 2000) fail.push(`rapporten är misstänkt kort (${t.length} tecken)`);
for (const h of ['## Statistik', '## Kräver Niklas beslut', '## Samstämmigt']) {
  if (!t.includes(h)) fail.push(`saknar sektionen: ${h}`);
}
const statsEnd = t.indexOf('## Kräver Niklas beslut');
const stats = statsEnd > 0 ? t.slice(0, statsEnd) : t;
for (const p of ['SD', 'M', 'KD', 'L', 'S', 'C', 'MP', 'V']) {
  if (!new RegExp(`\\|\\s*${p}\\s*\\|`).test(stats)) {
    fail.push(`statistiktabellen saknar rad för ${p} (alla 8 partier ska stå där, även med 0 divergenser)`);
  }
}

if (fail.length) {
  console.error(`RAPPORT OGILTIG (${fail.length}):`);
  for (const f of fail) console.error(`- ${f}`);
  process.exit(1);
}
fs.writeFileSync(outFile, t + '\n');
console.log(`ok: ${outFile}`);
