#!/usr/bin/env node
// batch-changelog.js <area> <nCitat> <evaluatorStatus> <nDivergenser> <kostnad>
// Prepends a truthful CHANGELOG line for a finished batch area (commit.sh
// requires a CHANGELOG update when json files change).
'use strict';
const fs = require('fs');

const [area, ncit, vstat, ndiv, cost] = process.argv.slice(2);
if (!area) { console.error('usage: batch-changelog.js <area> <nCitat> <evalStatus> <nDiv> <kostnad>'); process.exit(1); }

const today = new Date().toISOString().slice(0, 10);
const line = `[${today}] feat: diskursbatch ${area} — citatkatalog sources/discourse/citat-${area}.json (${ncit} citat, evaluator ${vstat}), två oberoende utkast (sonnet+opus) och divergensrapport drafts/discourse-${area}-RAPPORT.md (${ndiv} divergenser); kostnad $${cost}; data/discourse.json orörd — Steg D efter Niklas granskning`;

const p = 'docs/CHANGELOG.md';
const md = fs.readFileSync(p, 'utf8');
const marker = '---\n';
const i = md.indexOf(marker);
if (i < 0) { console.error('CHANGELOG saknar ----avdelare'); process.exit(1); }
const out = md.slice(0, i + marker.length) + '\n' + line + md.slice(i + marker.length).replace(/^\n/, '\n');
fs.writeFileSync(p, out);
console.log('CHANGELOG: ' + line.slice(0, 100) + '…');
