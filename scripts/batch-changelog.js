#!/usr/bin/env node
// batch-changelog.js <area> <nCitat> <evaluatorStatus> <nDivergenser> <kostnad>
// Writes the AUTHORITATIVE CHANGELOG line for a finished batch area, and
// removes CHANGELOG noise written by the loop worker during the same area
// run. Deterministic text handling only — no model calls.
//
// Removal rule (fail-safe, never deletes human lines):
//   A line is worker noise ONLY if ALL of:
//   1. it is NOT present in HEAD:docs/CHANGELOG.md (i.e. added during this
//      area's uncommitted run — human lines are committed),
//   2. it mentions sources/discourse/citat-<area>.json,
//   3. it matches the worker's strict line shape
//      "[YYYY-MM-DD] <typ>: sources/discourse/citat-<area>.json — ...".
//   Lines meeting 1+2 but not 3 (ambiguous) are KEPT and prefixed
//   "[worker, oauktoritativ] " instead.
'use strict';
const fs = require('fs');
const cp = require('child_process');

const [area, ncit, vstat, ndiv, cost] = process.argv.slice(2);
if (!area) { console.error('usage: batch-changelog.js <area> <nCitat> <evalStatus> <nDiv> <kostnad>'); process.exit(1); }

const p = 'docs/CHANGELOG.md';
const md = fs.readFileSync(p, 'utf8');

let headLines = new Set();
try {
  headLines = new Set(cp.execSync(`git show HEAD:${p}`,
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] }).split('\n'));
} catch {
  // no HEAD version (should not happen) -> treat everything as committed,
  // i.e. remove nothing (fail-safe).
}

const mentionsArea = (l) => l.includes(`sources/discourse/citat-${area}.json`);
const strictWorkerShape = new RegExp(`^\\[\\d{4}-\\d{2}-\\d{2}\\] [a-z]+: sources/discourse/citat-${area}\\.json — `);
const AUTH_MARKER = `diskursbatch ${area} — citatkatalog`;

const out = [];
let removed = 0, marked = 0;
for (const line of md.split('\n')) {
  if (mentionsArea(line) && !headLines.has(line) && !line.includes(AUTH_MARKER)) {
    if (strictWorkerShape.test(line)) { removed++; continue; }        // worker noise: drop
    if (!line.startsWith('[worker, oauktoritativ] ')) {               // ambiguous: mark, keep
      out.push('[worker, oauktoritativ] ' + line); marked++; continue;
    }
  }
  out.push(line);
}

const today = new Date().toISOString().slice(0, 10);
const authLine = `[${today}] feat: diskursbatch ${area} — citatkatalog sources/discourse/citat-${area}.json (${ncit} citat, evaluator ${vstat}), två oberoende utkast (sonnet+opus) och divergensrapport drafts/discourse-${area}-RAPPORT.md (${ndiv} divergenser); kostnad $${cost}; data/discourse.json orörd — Steg D efter Niklas granskning`;

let text = out.join('\n');
const marker = '---\n';
const i = text.indexOf(marker);
if (i < 0) { console.error('CHANGELOG saknar ----avdelare'); process.exit(1); }
text = text.slice(0, i + marker.length) + '\n' + authLine + text.slice(i + marker.length).replace(/^\n/, '\n');
fs.writeFileSync(p, text);
console.log(`CHANGELOG: auktoritativ rad skriven; ${removed} workerrad(er) borttagna, ${marked} tvetydiga markerade`);
