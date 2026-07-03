#!/usr/bin/env node
// validate-draft.js <claude-response.json> <output-draft.json>
// Extracts the model's result text from a claude -p --output-format json
// response, strips accidental markdown fences, parses and shape-checks the
// discourse draft, and writes normalized pretty JSON to the output path.
// Exit 0 = valid draft written; exit 1 = invalid (message on stderr, fed
// back to the model for the single retry allowed in Steg B).
'use strict';
const fs = require('fs');

const [respFile, outFile] = process.argv.slice(2);
if (!respFile || !outFile) { console.error('usage: validate-draft.js <resp> <out>'); process.exit(2); }

let resp;
try {
  resp = JSON.parse(fs.readFileSync(respFile, 'utf8'));
} catch (e) {
  console.error(`response file is not valid JSON: ${e.message}`);
  process.exit(1);
}
let text = String(resp.result ?? resp.response ?? '').trim();
// Tolerate a fenced answer despite instructions — strip one outer fence.
const fence = text.match(/^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/);
if (fence) text = fence[1].trim();

let draft;
try {
  draft = JSON.parse(text);
} catch (e) {
  console.error(`draft is not valid JSON: ${e.message}`);
  process.exit(1);
}

const fail = [];
const PARTIES = ['SD', 'M', 'KD', 'L', 'S', 'C', 'MP', 'V'];
if (draft.omrade !== 'ekonomi') fail.push(`omrade must be "ekonomi" (got "${draft.omrade}")`);
const partier = draft.partier || {};
for (const p of PARTIES) {
  const e = partier[p];
  if (!e) { fail.push(`${p}: missing`); continue; }
  if (typeof e.inramning !== 'string' || e.inramning.trim().length < 40) {
    fail.push(`${p}: inramning missing or too short (>= 2 meningar krävs)`);
  }
  const nb = Array.isArray(e.nyckelbegrepp) ? e.nyckelbegrepp : [];
  if (nb.length < 2 || nb.length > 5) fail.push(`${p}: nyckelbegrepp must be 2-5 (got ${nb.length})`);
  nb.forEach((n, i) => {
    for (const f of ['term', 'innebord', 'underforstadd_premiss'])
      if (typeof (n || {})[f] !== 'string' || !n[f].trim()) fail.push(`${p}.nyckelbegrepp[${i}].${f} missing`);
  });
  const rs = Array.isArray(e.retoriska_strategier) ? e.retoriska_strategier : [];
  if (rs.length < 2 || rs.length > 4) fail.push(`${p}: retoriska_strategier must be 2-4 (got ${rs.length})`);
  rs.forEach((r, i) => {
    for (const f of ['strategi', 'exempel', 'kalla'])
      if (typeof (r || {})[f] !== 'string' || !r[f].trim()) fail.push(`${p}.retoriska_strategier[${i}].${f} missing`);
  });
  if (typeof e.galtan_kongruens !== 'string' || !e.galtan_kongruens.trim()) fail.push(`${p}: galtan_kongruens missing`);
  if (typeof e.kontrast_med !== 'string' || !e.kontrast_med.trim()) fail.push(`${p}: kontrast_med missing`);
}
for (const p of Object.keys(partier)) if (!PARTIES.includes(p)) fail.push(`unknown party "${p}"`);

const sigs = draft.flytande_signifikanter || {};
const nSigs = Object.keys(sigs).length;
if (nSigs < 1 || nSigs > 3) fail.push(`flytande_signifikanter must be 1-3 (got ${nSigs})`);
for (const [s, o] of Object.entries(sigs)) {
  if (!o || typeof o.beskrivning !== 'string' || !o.beskrivning.trim()) fail.push(`signifikant ${s}: beskrivning missing`);
  if (!o || !o.per_parti || Object.keys(o.per_parti).length < 2) {
    fail.push(`signifikant ${s}: per_parti needs >= 2 parties (a floating signifier is shared)`);
  }
  if (!o || typeof o.analytisk_kommentar !== 'string' || !o.analytisk_kommentar.trim()) {
    fail.push(`signifikant ${s}: analytisk_kommentar missing`);
  }
}

if (fail.length) {
  console.error(`DRAFT INVALID (${fail.length}):`);
  for (const f of fail) console.error(`- ${f}`);
  process.exit(1);
}
fs.writeFileSync(outFile, JSON.stringify(draft, null, 2) + '\n');
console.log(`ok: ${outFile}`);
