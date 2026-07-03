#!/usr/bin/env node
// generate-pr-body.js — builds pr-body.md from the loop's single commit
// (HEAD~1 vs HEAD on data/voting.json) plus the evaluator's final
// verification table (loop-state.json, read before it is deleted).
// Run AFTER the loop exits and AFTER ./commit.sh — see scripts/open-loop-pr.sh
// (Step 5, outside the loop; see CLAUDE.md "Agentloopar" + DEC-007 villkor 2).
'use strict';
const fs = require('fs');
const cp = require('child_process');

const OUT = process.argv[2] || 'pr-body.md';

function readJson(ref, path) {
  return JSON.parse(cp.execSync(`git show ${ref}:${path}`,
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] }));
}

function walk(root) {
  const out = new Map();
  for (const [area, topics] of Object.entries(root.data || {}))
    for (const [topic, parties] of Object.entries(topics))
      for (const [party, entry] of Object.entries(parties))
        out.set(`${area}/${topic}/${party}`, entry);
  return out;
}

let base, cur;
try {
  base = walk(readJson('HEAD~1', 'data/voting.json'));
  cur = walk(readJson('HEAD', 'data/voting.json'));
} catch (e) {
  console.error(`FEL: kan inte läsa data/voting.json från HEAD~1/HEAD: ${e.message}`);
  process.exit(1);
}

const changed = [];
for (const [key, entry] of cur) {
  const prev = base.get(key);
  if (JSON.stringify(entry) !== JSON.stringify(prev)) changed.push([key, entry]);
}

// Evaluator's final verification table lives in loop-state.json
// (gitignored) — must still be present when this runs, right after the loop.
let verdict = '';
try {
  verdict = cp.execSync('node scripts/loop-lib.js get last_verdict', { encoding: 'utf8' });
} catch { /* no state left — every changed post falls through as unverified below */ }

const verified = new Map(); // key -> { ok, note }
const tableRowRe = /^\|\s*([^|]+?)\s*\|\s*(https?:\/\/\S+)\s*\|\s*(ja|nej)\s*\|\s*([^|]*?)\s*\|$/gim;
let m;
while ((m = tableRowRe.exec(verdict))) {
  verified.set(m[1].trim(), { ok: m[3].toLowerCase() === 'ja', note: m[4].trim() });
}

// Scope-changes / mid-run interventions, logged by convention to
// .loop/interventions.md (see CLAUDE.md "Agentloopar" — validatorjusteringar
// ska namnges och loggas).
let interventions = '';
if (fs.existsSync('.loop/interventions.md')) {
  interventions = fs.readFileSync('.loop/interventions.md', 'utf8').trim();
}

const decision = [];
const machine = [];
for (const [key, entry] of changed) {
  const v = verified.get(key);
  // No verification row found for a changed post is itself an uncertainty
  // signal (fail-closed, consistent with the rest of the loop) — never
  // silently treat an unconfirmed post as machine-verified.
  const uncertain = !v || !v.ok;
  if (entry.match === 'delvis' || entry.match === 'avviker' || uncertain) {
    const reason = uncertain
      ? ' _(ej bekräftad av evaluatorn — kräver granskning)_'
      : '';
    decision.push(`- **${key}** (${entry.match})${reason}: ${entry.voted}`);
  } else {
    machine.push(`- **${key}**: ${entry.voted} → [${entry.voted_source}](${entry.voted_url})`);
  }
}

const sections = [];
sections.push('## Kräver ditt beslut\n');
if (decision.length === 0 && !interventions) {
  sections.push('_Inga poster kräver manuellt beslut denna körning._\n');
} else {
  if (decision.length) sections.push(decision.join('\n') + '\n');
  if (interventions) sections.push('\n**Scope-ändringar / mid-run-interventioner:**\n\n' + interventions + '\n');
}
sections.push('\n## Maskinverifierat\n');
sections.push(machine.length
  ? machine.join('\n') + '\n'
  : '_Inga stammer-poster med bekräftad källa denna körning._\n');

fs.writeFileSync(OUT, sections.join('\n'));
console.log(`Skrev ${OUT}: ${decision.length} poster kräver beslut, ${machine.length} maskinverifierade.`);
