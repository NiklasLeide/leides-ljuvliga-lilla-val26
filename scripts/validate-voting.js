#!/usr/bin/env node
// Schema + scope validation for the data-loop. Zero tokens.
// Exit 0 = valid, exit 1 = violations (printed, fed back to the worker).
'use strict';
const fs = require('fs');
const cp = require('child_process');

const TARGETS = new Set([
  'skola/nationella-prov/L',
  'skola/nationella-prov/KD',
  'skola/nationella-prov/M',
  'skola/nationella-prov/SD',
  'skola/tidiga-betyg/L',
  'skola/tidiga-betyg/KD',
  'skola/tidiga-betyg/M',
  'skola/tidiga-betyg/SD',
  'skola/statlig-styrning/SD',
  'migration/medborgarskap/KD',
  'migration/medborgarskap/M',
  'migration/medborgarskap/SD',
]);
const REQUIRED_FIELDS = ['says', 'promises', 'promises_source', 'promises_url',
  'voted', 'voted_source', 'voted_url', 'match'];
const VALID_MATCH = new Set(['stammer', 'delvis', 'avviker', 'ej-granskat', 'inväntar-votering']);
const EXPECTED_ENTRIES = 336;
// Pre-existing local modification, not produced by the loop:
const ALLOWED_DIRTY = new Set(['data/voting.json', '.claude/settings.local.json']);

const fail = [];

let cur;
try {
  cur = JSON.parse(fs.readFileSync('data/voting.json', 'utf8'));
} catch (e) {
  console.error(`data/voting.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

let base;
try {
  base = JSON.parse(cp.execSync('git show HEAD:data/voting.json',
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }));
} catch (e) {
  console.error(`cannot read HEAD version of data/voting.json: ${e.message}`);
  process.exit(1);
}

if (cur.schemaVersion !== base.schemaVersion) {
  fail.push(`schemaVersion changed: ${base.schemaVersion} -> ${cur.schemaVersion}`);
}

const walk = (root) => {
  const out = new Map();
  for (const [area, topics] of Object.entries(root.data || {}))
    for (const [topic, parties] of Object.entries(topics))
      for (const [party, entry] of Object.entries(parties))
        out.set(`${area}/${topic}/${party}`, entry);
  return out;
};
const curMap = walk(cur);
const baseMap = walk(base);

if (curMap.size !== EXPECTED_ENTRIES) {
  fail.push(`entry count is ${curMap.size}, expected ${EXPECTED_ENTRIES}`);
}
for (const key of baseMap.keys()) {
  if (!curMap.has(key)) fail.push(`${key}: entry deleted`);
}

for (const [key, entry] of curMap) {
  for (const f of REQUIRED_FIELDS) {
    if (typeof entry[f] !== 'string') fail.push(`${key}: field "${f}" missing or not a string`);
  }
  if (!VALID_MATCH.has(entry.match)) fail.push(`${key}: invalid match "${entry.match}"`);

  const baseEntry = baseMap.get(key);
  const changed = JSON.stringify(entry) !== JSON.stringify(baseEntry);
  if (!changed) continue;

  if (!TARGETS.has(key)) {
    fail.push(`${key}: changed, but is not one of the 12 target entries`);
    continue;
  }
  if (entry.match !== 'inväntar-votering') {
    if (!/^https:\/\/www\.riksdagen\.se\//.test(entry.voted_url)) {
      fail.push(`${key}: voted_url must start with https://www.riksdagen.se/ (got "${entry.voted_url}")`);
    }
    if (entry.voted_source.trim() === '') fail.push(`${key}: voted_source is empty`);
    if (entry.voted.trim() === '') fail.push(`${key}: voted is empty`);
  }
}

// No other tracked files may be touched by the loop.
const dirty = cp.execSync('git diff --name-only', { encoding: 'utf8' })
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
