#!/usr/bin/env node
/* ============================================================
   sync-shell.mjs — propagate the canonical nav block into pages.
   Reads the block between SHELL:NAV markers in app/_shell.html and
   writes it into the same marked region of every app/*.html page.
   This is the single-edit point for nav/shell markup in the vanilla
   stack (avoids the "self-contained files → nav change touches all"
   trap noted in ARKITEKTUR_not.md). Run after editing app/_shell.html.
   Usage:  node scripts/sync-shell.mjs [--check]
     --check : exit 1 if any page is out of sync (for CI), write nothing.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'app');
const START = '<!-- SHELL:NAV START -->';
const END = '<!-- SHELL:NAV END -->';
const check = process.argv.includes('--check');

function block(text, file) {
  const i = text.indexOf(START), j = text.indexOf(END);
  if (i === -1 || j === -1 || j < i) throw new Error(`Missing SHELL:NAV markers in ${file}`);
  return { i, j: j + END.length, inner: text.slice(i, j + END.length) };
}

const shell = readFileSync(join(APP, '_shell.html'), 'utf8');
const nav = block(shell, '_shell.html').inner;

const pages = readdirSync(APP).filter((f) => f.endsWith('.html') && f !== '_shell.html');
let changed = 0, stale = [];

for (const page of pages) {
  const p = join(APP, page);
  const text = readFileSync(p, 'utf8');
  const b = block(text, page);
  if (b.inner === nav) continue;
  stale.push(page);
  if (!check) {
    writeFileSync(p, text.slice(0, b.i) + nav + text.slice(b.j), 'utf8');
    changed++;
    console.log(`synced  ${page}`);
  }
}

if (check) {
  if (stale.length) { console.error(`OUT OF SYNC: ${stale.join(', ')}`); process.exit(1); }
  console.log(`ok — all ${pages.length} pages in sync`);
} else {
  console.log(`done — ${changed} page(s) updated, ${pages.length} total`);
}
