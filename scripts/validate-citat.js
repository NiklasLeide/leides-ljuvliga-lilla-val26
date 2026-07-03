#!/usr/bin/env node
// Schema + scope validation for the discourse quote loop (Steg A). Zero tokens.
// Exit 0 = valid, exit 1 = violations (printed, fed back to the worker).
// Target file is NEW (untracked): sources/discourse/citat-ekonomi.json.
'use strict';
const fs = require('fs');
const cp = require('child_process');

const TARGET_FILE = 'sources/discourse/citat-ekonomi.json';
const PARTIES = ['S', 'M', 'SD', 'C', 'V', 'KD', 'L', 'MP'];
const KALLTYPER = new Set(['budgetmotion', 'motion', 'protokoll', 'partiprogram',
  'valmanifest', 'kampanjsida']);
const RIKSDAGSMATERIAL = new Set(['budgetmotion', 'motion', 'protokoll']);
// Parties with no manifesto source per sources/manifest/2026/KATALOG.md.
// M's campaign snapshot is kalltyp "kampanjsida", never "valmanifest".
const NO_MANIFEST = new Set(['M', 'SD', 'KD', 'MP']);
const CITAT_FIELDS = ['citat', 'kalltyp', 'dokumenttitel', 'url', 'datum', 'kontext'];
// settings.local.json: harness writes permission state during the run.
// CHANGELOG.md: updated for the final commit (commit.sh requires it).
// TARGET_FILE: tracked since the Steg A commit — loop edits to it are the
// loop's whole purpose, so it is allowed dirty (scope is enforced by the
// schema checks above, not by the dirty list).
const ALLOWED_DIRTY = new Set(['.claude/settings.local.json', 'docs/CHANGELOG.md',
  TARGET_FILE]);

const fail = [];

if (!fs.existsSync(TARGET_FILE)) {
  console.error(`VALIDATION FAILED (1):\n- ${TARGET_FILE} does not exist yet`);
  process.exit(1);
}

let root;
try {
  root = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
} catch (e) {
  console.error(`VALIDATION FAILED (1):\n- ${TARGET_FILE} is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (root.schemaVersion !== 1) fail.push(`schemaVersion must be 1 (got ${root.schemaVersion})`);
if (root.omrade !== 'ekonomi') fail.push(`omrade must be "ekonomi" (got "${root.omrade}")`);
if (typeof root.tidsfonster !== 'string' || !root.tidsfonster.trim()) {
  fail.push('tidsfonster missing or empty');
}

const partier = root.partier || {};
for (const p of PARTIES) {
  if (!partier[p]) { fail.push(`${p}: missing entirely`); continue; }
  const entry = partier[p];
  const citat = Array.isArray(entry.citat) ? entry.citat : null;
  if (!citat) { fail.push(`${p}: "citat" is not an array`); continue; }

  if (entry.kallbas === 'tunn') {
    if (typeof entry.tunn_beskrivning !== 'string' || entry.tunn_beskrivning.trim().length < 20) {
      fail.push(`${p}: kallbas "tunn" requires tunn_beskrivning (what is missing and why, >= 20 chars)`);
    }
    if (citat.length > 12) fail.push(`${p}: ${citat.length} citat, max is 12`);
  } else if (entry.kallbas === 'ok') {
    if (citat.length < 6 || citat.length > 12) {
      fail.push(`${p}: kallbas "ok" requires 6-12 citat (got ${citat.length})`);
    }
    const typer = new Set(citat.map((c) => c && c.kalltyp));
    if (typer.size < 2) fail.push(`${p}: kallbas "ok" requires citat from >= 2 kalltyper (got ${typer.size})`);
  } else {
    fail.push(`${p}: kallbas must be "ok" or "tunn" (got "${entry.kallbas}")`);
  }

  if (citat.length > 0 && !citat.some((c) => c && RIKSDAGSMATERIAL.has(c.kalltyp))) {
    fail.push(`${p}: no citat from riksdagsmaterial (budgetmotion/motion/protokoll) — kampanj-/programmaterial may never be the only base`);
  }

  citat.forEach((c, i) => {
    const id = `${p}[${i}]`;
    if (!c || typeof c !== 'object') { fail.push(`${id}: not an object`); return; }
    for (const f of CITAT_FIELDS) {
      if (typeof c[f] !== 'string' || !c[f].trim()) fail.push(`${id}: field "${f}" missing or empty`);
    }
    if (c.kalltyp && !KALLTYPER.has(c.kalltyp)) {
      fail.push(`${id}: invalid kalltyp "${c.kalltyp}" (allowed: ${[...KALLTYPER].join(', ')})`);
    }
    if (c.url && !/^https:\/\//.test(c.url)) fail.push(`${id}: url must start with https://`);
    if (c.datum && !/^\d{4}/.test(c.datum)) fail.push(`${id}: datum must start with a year (got "${c.datum}")`);
    if (c.kalltyp === 'valmanifest' && NO_MANIFEST.has(p)) {
      fail.push(`${id}: ${p} has no valmanifest source per KATALOG.md — use the correct kalltyp or drop the quote`);
    }
    if (c.kalltyp === 'valmanifest' && p === 'V'
        && !/preliminär/i.test(`${c.dokumenttitel} ${c.kontext}`)) {
      fail.push(`${id}: V's valplattform is preliminary — mark "preliminär" in dokumenttitel or kontext`);
    }
    if (c.kalltyp === 'kampanjsida' && p === 'M'
        && !/ögonblicksbild/i.test(`${c.dokumenttitel} ${c.kontext}`)) {
      fail.push(`${id}: M campaign quotes must be marked "ögonblicksbild" in dokumenttitel or kontext`);
    }
    if (c.lokal_fil !== undefined) {
      if (typeof c.lokal_fil !== 'string' || !fs.existsSync(c.lokal_fil)) {
        fail.push(`${id}: lokal_fil "${c.lokal_fil}" does not exist`);
      }
    }
  });
}
for (const p of Object.keys(partier)) {
  if (!PARTIES.includes(p)) fail.push(`unknown party key "${p}"`);
}

// No tracked files may be modified by the loop (target file is untracked).
const dirty = cp.execSync('git diff --name-only',
  { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
  .trim().split('\n').filter(Boolean);
for (const f of dirty) {
  if (!ALLOWED_DIRTY.has(f)) fail.push(`unexpected modified tracked file: ${f}`);
}

if (fail.length) {
  console.error(`VALIDATION FAILED (${fail.length}):`);
  for (const f of fail) console.error(`- ${f}`);
  process.exit(1);
}
console.log('validation ok');
