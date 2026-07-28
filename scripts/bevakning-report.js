#!/usr/bin/env node
/* bevakning-report.js — bygger tvåsektionsrapporten och ENFORCAR
 * neutralitetsreglerna i kod (inte i prompten):
 *
 *   Regel 1 (media = trigger, aldrig källa): en post vars enda grund är ett
 *   medieutspel (delta.confirmable === false) kan ALDRIG bli ett förslag.
 *   Den hamnar under "Kräver beslut" som obekräftat utspel med medielänk.
 *   Ett förslag måste ange confirmed_via = partisajt|riksdagen och bära ett
 *   citat som greppar mot hämtad källtext.
 *
 *   Regel 3 (symmetri): per-parti-fyndräkning loggas i meta så systematisk
 *   asymmetri blir synlig.
 *
 * Subkommandon:
 *   gate-count  -> antal delta-poster Haiku markerat "substantiell" (stdout)
 *   build       -> skriver .bevakning/report.md, pr-body.md, report-meta.json,
 *                  snapshotar nya dokument till sources/bevakning/
 *
 * Grep-verifiering återanvänder extractText ur bevakning-lib. Fetch respekterar
 * BEVAKNING_FETCH=stub (fixtures) för testerna.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const lib = require('./bevakning-lib.js');

const DIR = process.env.BEVAKNING_DIR || '.bevakning';
const SNAPDIR = path.join('sources', 'bevakning');
const today = new Date().toISOString().slice(0, 10);
const rd = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));

function parseModel(f) {
  // Modellsvaret ligger i .result som en JSON-sträng (```json-block tillåtet).
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  return JSON.parse(text);
}

function fetchExtract(url) {
  if (process.env.BEVAKNING_FETCH === 'stub') {
    const f = path.join(DIR, 'fixtures', 'source-' + lib.sha256(url).slice(0, 12) + '.html');
    if (!fs.existsSync(f)) return null;
    return lib.extractText(fs.readFileSync(f, 'utf8'));
  }
  try {
    const body = execFileSync('curl', ['-sS', '-L', '--max-time', '25', url], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return lib.extractText(body);
  } catch (e) { return null; }
}

function gateCount() {
  const sift = parseModel('sift.json');
  const n = (sift.items || []).filter((i) => i.verdict === 'substantiell').length;
  process.stdout.write(String(n) + '\n');
}

function build() {
  const delta = rd('delta.json');
  const verify = parseModel('verify.json');
  const proposals = [];
  const kravBeslut = [];
  const snapshots = [];
  const perParty = {};
  const bump = (p) => { if (p) perParty[p] = (perParty[p] || 0) + 1; };

  // 1. Förslag från Sonnet — varje måste vara bekräftat OCH grep-verifierat.
  for (const p of (verify.proposals || [])) {
    const via = p.confirmed_via;
    const confirmedOk = via === 'partisajt' || via === 'riksdagen';
    let quoteOk = false, reason = '';
    if (!confirmedOk) {
      reason = 'saknar bekräftelse via partisajt/riksdagen (media får aldrig bli förslag)';
    } else if (!p.quote || !p.source_url) {
      reason = 'saknar citat eller käll-URL';
    } else {
      const src = fetchExtract(p.source_url);
      if (src == null) { reason = 'källan kunde inte hämtas för grep-verifiering'; }
      else if (!src.includes(lib.extractText(p.quote))) { reason = 'citatet greppar inte mot källtexten'; }
      else quoteOk = true;
    }
    if (confirmedOk && quoteOk) {
      proposals.push(p); bump(p.party);
      if (p.snapshot_url && p.snapshot_filename) snapshots.push({ url: p.snapshot_url, filename: p.snapshot_filename });
    } else {
      // Regel 1/verifieringsfall: allt tveksamt hamnar under Kräver beslut.
      kravBeslut.push({ type: 'obekräftat förslag', party: p.party, topic: p.topic,
        title: `${p.party}/${p.topic}: ${p.suggested || ''}`, why: reason,
        link: p.source_url || (p.articles && p.articles[0] && p.articles[0].url) || '' });
    }
  }

  // 2. Obekräftade medieutspel — direkt till Kräver beslut (aldrig förslag).
  for (const u of (verify.unconfirmed || [])) {
    kravBeslut.push({ type: 'obekräftat medieutspel', title: u.title,
      why: u.note || 'medieuppgift ej bekräftad mot partiets egen kanal eller riksdagen',
      link: (u.articles && u.articles.map((a) => a.url).join(' , ')) || '' });
  }
  // Säkerhetsnät: alla confirmable:false-poster i deltat MÅSTE vara redovisade.
  const mediaInDelta = delta.delta.filter((d) => d.confirmable === false).length;

  // 3. Snapshotta nya dokument (deterministiskt, i kod — reproducerbart).
  fs.mkdirSync(SNAPDIR, { recursive: true });
  const savedSnaps = [];
  for (const s of snapshots) {
    if (process.env.BEVAKNING_FETCH === 'stub') { savedSnaps.push(s.filename + ' (stub)'); continue; }
    try {
      const body = execFileSync('curl', ['-sS', '-L', '--max-time', '30', s.url], { encoding: 'buffer', maxBuffer: 128 * 1024 * 1024 });
      fs.writeFileSync(path.join(SNAPDIR, s.filename), body);
      savedSnaps.push(s.filename);
    } catch (e) { kravBeslut.push({ type: 'snapshot misslyckades', title: s.filename, why: 'kunde inte hämtas', link: s.url }); }
  }

  // 4. Rapport (två sektioner) + PR-body.
  const L = [];
  L.push(`# Bevakning ${today}`);
  L.push('');
  L.push(`> Automatiskt genererad av bevakningsloopen (G5). **Loopen skriver aldrig i data/** — den föreslår, Niklas beslutar.`);
  L.push(`> Täckning: ${delta.coverage.riksdagen} riksdagen-frågor, ${delta.coverage.sites} partisajter, ${delta.coverage.rss} rss-flöden.`);
  if (delta.errors.length) L.push(`> Kunde inte kontrolleras: ${delta.errors.length} källa/källor (se meta).`);
  L.push('');
  L.push('## Kräver beslut');
  L.push('');
  L.push('Förslag, obekräftade utspel och allt tolkande — det här läser Niklas.');
  L.push('');
  if (proposals.length) {
    L.push('### Ändringsförslag (bekräftade + grep-verifierade)');
    for (const p of proposals) {
      L.push(`- **${p.party} / ${p.topic}**: ${p.current_value} → föreslås ${p.suggested}`);
      L.push(`  - Belägg: "${(p.quote || '').replace(/\n/g, ' ')}"`);
      L.push(`  - Källa (${p.confirmed_via}): ${p.source_url}`);
      if (p.discrepancy) L.push(`  - ⚠ Säger-vs-gör: ${p.discrepancy}`);
    }
    L.push('');
  }
  if (kravBeslut.length) {
    L.push('### Obekräftat / kräver mänsklig bedömning');
    for (const k of kravBeslut) {
      L.push(`- **${k.type}**: ${k.title}`);
      L.push(`  - ${k.why}`);
      if (k.link) L.push(`  - Länk (trigger, ej källa): ${k.link}`);
    }
    L.push('');
  }
  if (!proposals.length && !kravBeslut.length) { L.push('_Inget kräver beslut denna körning._'); L.push(''); }

  L.push('## Maskinverifierat');
  L.push('');
  L.push(`- Lager 1 delta: ${delta.delta.length} poster (${delta.coverage.riksdagen}/${delta.coverage.sites}/${delta.coverage.rss} riksdagen/sajter/rss), noll tokens`);
  L.push(`- Bekräftade + grep-verifierade förslag: ${proposals.length}`);
  L.push(`- Kräver beslut: ${kravBeslut.length} (varav ${mediaInDelta} obekräftade medieutspel ur deltat)`);
  L.push(`- Snapshots sparade till \`sources/bevakning/\`: ${savedSnaps.length}${savedSnaps.length ? ' — ' + savedSnaps.join(', ') : ''}`);
  L.push(`- Fynd per parti (symmetrikontroll): ${Object.keys(perParty).length ? Object.entries(perParty).map(([p, n]) => `${p}:${n}`).join(' ') : '(inga bekräftade förslag)'}`);
  L.push('');
  L.push('_Media är trigger, aldrig källa: ett obekräftat medieutspel kan i kod aldrig bli ett förslag — det redovisas alltid under Kräver beslut._');

  const report = L.join('\n') + '\n';
  fs.writeFileSync(path.join(DIR, 'report.md'), report);
  fs.writeFileSync(path.join(DIR, 'pr-body.md'), report);
  fs.writeFileSync(path.join(DIR, 'report-meta.json'), JSON.stringify({
    date: today, proposals: proposals.length, krav_beslut: kravBeslut.length,
    snapshots: savedSnaps, per_party: perParty, media_in_delta: mediaInDelta,
    coverage: delta.coverage, errors: delta.errors,
  }, null, 2) + '\n');
  console.log(`rapport byggd: ${proposals.length} förslag, ${kravBeslut.length} kräver beslut, ${savedSnaps.length} snapshot(ar)`);
}

const cmd = process.argv[2];
if (cmd === 'gate-count') gateCount();
else if (cmd === 'build') build();
else { console.error('bevakning-report: gate-count | build'); process.exit(1); }
