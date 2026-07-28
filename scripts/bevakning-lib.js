#!/usr/bin/env node
/* bevakning-lib.js — Lager 1: deterministisk ändringsdetektering, NOLL tokens.
 *
 * All fetch/extraktion/hash/delta-logik för G5-bevakningsloopen. Ingen modell
 * anropas härifrån. Följer projektets regel: all JSON och strängbearbetning i
 * node (Git Bash saknar jq). Fail-closed där en kontroll inte kan utföras — en
 * källa som inte kan hämtas rapporteras som "kunde inte kontrolleras", aldrig
 * som tyst frånvaro av ändring (neutralitetsregel 4: tystnad ändrar inget, men
 * en misslyckad hämtning är inte tystnad).
 *
 * Subkommandon (anropas av bevakning-loop.sh och testerna):
 *   extract  <htmlfile>          -> extraherad, normaliserad text på stdout
 *   hash     <textfile>          -> sha256 av normaliserad text
 *   detect                       -> kör hela Lager 1, skriver .bevakning/delta.json
 *   rss-cluster <jsonfile>       -> event-dedup (Jaccard) av rss-poster, för test
 *   get-state <key>              -> läs fält ur .bevakning/state.json
 * Miljö: BEVAKNING_DIR (default .bevakning), WATCHLIST (default data/watchlist.json),
 *        BEVAKNING_FETCH=stub|live (stub läser .bevakning/fixtures/ för test).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const DIR = process.env.BEVAKNING_DIR || '.bevakning';
const WATCHLIST = process.env.WATCHLIST || 'data/watchlist.json';
const STATE_FILE = path.join(DIR, 'state.json');
const DELTA_FILE = path.join(DIR, 'delta.json');
const FETCH_MODE = process.env.BEVAKNING_FETCH || 'live';
const FETCH_TIMEOUT_S = Number(process.env.BEVAKNING_FETCH_TIMEOUT_S || 25);

// ---------------------------------------------------------------- text-extraktion
// KRITISKT (verifierat 2026-07-20): hasha ALLTID extraherad text, aldrig
// HTTP-headers eller rå HTML. moderaterna.se ändrade Last-Modified med
// byte-identiskt sakinnehåll. Nav/sidfot/tidsstämplar strippas före hash så att
// layout- och datumbrus inte ger falska positiva varje kampanjvecka.
function extractText(html) {
  let s = html;
  // Bort med hela element som aldrig är sakinnehåll (inkl. deras innehåll).
  s = s.replace(/<(script|style|noscript|svg|head|nav|header|footer|form|aside)\b[\s\S]*?<\/\1>/gi, ' ');
  // Vanliga tidsstämpel-/metadatanoder (datumattribut, "Senast uppdaterad ...").
  s = s.replace(/<time\b[\s\S]*?<\/time>/gi, ' ');
  s = s.replace(/\b(senast uppdaterad|publicerad|uppdaterad|last[- ]modified)\b[^<\n]{0,40}/gi, ' ');
  // Kvarvarande taggar bort, entiteter av.
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
       .replace(/&#8217;|&rsquo;|&#39;/g, "'").replace(/&#8211;|&ndash;|&#8212;/g, '-')
       .replace(/&aring;/gi, 'å').replace(/&auml;/gi, 'ä').replace(/&ouml;/gi, 'ö')
       .replace(/&[a-z]+;/gi, ' ').replace(/&#\d+;/g, ' ');
  // ISO- och svenska datum/klockslag som ofta byts utan sakändring.
  s = s.replace(/\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(:\d{2})?)?\b/g, ' ');
  s = s.replace(/\b\d{1,2}:\d{2}\b/g, ' ');
  // Normalisera whitespace till en kanonisk form.
  s = s.replace(/\s+/g, ' ').trim().toLowerCase();
  return s;
}

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------- fetch
// live: curl med timeout. stub: läser .bevakning/fixtures/<key>.html|.json så
// att guardtesterna kan köra Lager 1 utan nätverk och utan tokens.
function fetchText(url, fixtureKey) {
  if (FETCH_MODE === 'stub') {
    const f = path.join(DIR, 'fixtures', fixtureKey);
    if (!fs.existsSync(f)) return { ok: false, body: '', err: 'no fixture' };
    return { ok: true, body: fs.readFileSync(f, 'utf8'), err: '' };
  }
  try {
    const body = execFileSync('curl', [
      '-sS', '-L', '--max-time', String(FETCH_TIMEOUT_S),
      '-A', 'val26-bevakning/1.0 (+https://val26.leide.se)', url,
    ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return { ok: true, body, err: '' };
  } catch (e) {
    return { ok: false, body: '', err: (e.message || 'fetch failed').split('\n')[0] };
  }
}

// ---------------------------------------------------------------- state
function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { established: null, riksdagen: { seen_ids: [] }, sites: {}, rss: { seen: [] } };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}
function saveState(s) {
  s.updated = new Date().toISOString();
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2) + '\n');
}

// ---------------------------------------------------------------- rss event-dedup
// Neutralitetsregel 2: fynd viktas ALDRIG efter medievolym. Tio artiklar om ett
// utspel är ett utspel. Deterministisk event-dedup: normalisera rubriken till en
// token-mängd, klustra poster med Jaccard-överlapp >= 0.6. Varje kluster = ett
// event som bär alla artikel-URL:er.
const STOP = new Set(('och i på att det som en av för med är den till de har om ett men vi kan så nya efter mot vid nu efter').split(' '));
function tokens(title) {
  return new Set(String(title).toLowerCase().replace(/[^a-zåäö0-9 ]/g, ' ')
    .split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}
function clusterRss(items) {
  const clusters = [];
  for (const it of items) {
    const tk = tokens(it.title);
    let placed = false;
    for (const c of clusters) {
      if (jaccard(tk, c._tokens) >= 0.6) {
        c.articles.push({ outlet: it.outlet, url: it.url });
        for (const t of tk) c._tokens.add(t);
        placed = true; break;
      }
    }
    if (!placed) clusters.push({ title: it.title, articles: [{ outlet: it.outlet, url: it.url }], _tokens: tk });
  }
  return clusters.map((c) => ({ title: c.title, articles: c.articles }));
}

// ---------------------------------------------------------------- rss-parse
function parseRss(xml, outlet) {
  const items = [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const b of blocks) {
    const t = (b.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const link = (b.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '';
    const title = t.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
    if (title) items.push({ outlet, title, url: link.replace(/<!\[CDATA\[|\]\]>/g, '').trim() });
  }
  return items;
}

// ---------------------------------------------------------------- riksdagen
// Träffar data.riksdagen.se/dokumentlista utformat=json. Returnerar dokument-id +
// titel + typ + datum. Ny id (mot state.seen_ids) = träff.
function riksdagenQuery(cfg) {
  const params = new URLSearchParams({
    sok: cfg.sok || '', doktyp: cfg.doktyp || '', utformat: 'json',
    sort: 'datum', sortriktning: 'desc', a: 's', p: '1',
  });
  const url = `https://data.riksdagen.se/dokumentlista/?${params.toString()}`;
  const r = fetchText(url, `riksdagen-${cfg.id}.json`);
  if (!r.ok) return { ok: false, err: r.err, docs: [] };
  let j;
  try { j = JSON.parse(r.body); } catch (e) { return { ok: false, err: 'bad json', docs: [] }; }
  const raw = (j.dokumentlista && j.dokumentlista.dokument) || [];
  const docs = (Array.isArray(raw) ? raw : [raw]).map((d) => ({
    id: d.id || d.dok_id, titel: (d.titel || '').trim(), typ: d.doktyp || cfg.doktyp,
    datum: d.datum || d.publicerad || '', url: d.dokument_url_html
      ? (d.dokument_url_html.startsWith('http') ? d.dokument_url_html : 'https:' + d.dokument_url_html)
      : `https://www.riksdagen.se/sv/dokument-och-lagar/dokument/_/${d.id || d.dok_id}/`,
  })).filter((d) => d.id);
  return { ok: true, err: '', docs };
}

// ---------------------------------------------------------------- detect (Lager 1)
function detect() {
  const wl = JSON.parse(fs.readFileSync(WATCHLIST, 'utf8'));
  const state = loadState();
  const firstRun = !state.established;
  const delta = [];
  const coverage = { riksdagen: 0, sites: 0, rss: 0 };
  const errors = [];
  const perParty = {};
  const bump = (p) => { if (p) perParty[p] = (perParty[p] || 0) + 1; };

  // (a) Riksdagen — nya dokument i bevakade områden/typer
  const seen = new Set(state.riksdagen.seen_ids);
  for (const q of wl.riksdagen) {
    const res = riksdagenQuery(q);
    coverage.riksdagen++;
    if (!res.ok) { errors.push(`riksdagen[${q.id}]: ${res.err}`); continue; }
    for (const d of res.docs) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        if (!firstRun) delta.push({ layer1_source: 'riksdagen', confirmable: true, kind: q.doktyp,
          area: q.area, title: d.titel, url: d.url, detail: `Ny ${d.typ} (${d.datum}) i bevakat område ${q.area}` });
      }
    }
  }
  state.riksdagen.seen_ids = [...seen];

  // (b) Partisajter — hash på EXTRAHERAD TEXT (aldrig headers/HTML). Både
  // huvudsidor och dokument-/publiceringslistor, så ett NYTT dokument fångas.
  for (const site of wl.sites) {
    const r = fetchText(site.url, `site-${site.id}.html`);
    coverage.sites++;
    if (!r.ok) { errors.push(`site[${site.id}]: ${r.err}`); continue; }
    const h = sha256(extractText(r.body));
    const prev = state.sites[site.id];
    state.sites[site.id] = { hash: h, checked: new Date().toISOString(), url: site.url };
    if (prev && prev.hash !== h && !firstRun) {
      delta.push({ layer1_source: 'partisajt', confirmable: true, kind: site.kind, party: site.party,
        title: site.label, url: site.url, detail: `Sakinnehåll ändrat på ${site.label} (${site.party})` });
      bump(site.party);
    }
  }

  // (c) Media RSS — rubrik + ingress som TRIGGER, aldrig källa (regel 1).
  const rssItems = [];
  for (const feed of wl.rss) {
    const r = fetchText(feed.url, `rss-${feed.id}.xml`);
    coverage.rss++;
    if (!r.ok) { errors.push(`rss[${feed.id}]: ${r.err}`); continue; }
    for (const it of parseRss(r.body, feed.outlet)) rssItems.push(it);
  }
  const rssSeen = new Set(state.rss.seen);
  const freshItems = rssItems.filter((it) => {
    const id = sha256(it.title.toLowerCase().trim());
    if (rssSeen.has(id)) return false;
    rssSeen.add(id); return true;
  });
  state.rss.seen = [...rssSeen].slice(-4000);
  if (!firstRun) {
    for (const c of clusterRss(freshItems)) {
      // confirmable:false => report-generatorn får ALDRIG placera en obekräftad
      // mediapost som förslag; den hamnar under "Kräver beslut" som obekräftat
      // utspel med medielänk (regel 1). Sonnet-lagret kan koppla den som
      // korroboration till ett parti-/riksdagsfynd, aldrig göra den till fakta.
      delta.push({ layer1_source: 'media', confirmable: false, kind: 'utspel',
        title: c.title, articles: c.articles, detail: `Medieutspel (${c.articles.length} artikel(ar), 1 event)` });
    }
  }

  state.established = state.established || new Date().toISOString();
  saveState(state);

  const out = { generated: new Date().toISOString(), first_run: firstRun, delta,
    coverage, errors, per_party: perParty,
    baseline: { riksdagen_items: state.riksdagen.seen_ids.length,
      sites: Object.keys(state.sites).length, rss_feeds: wl.rss.length } };
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(DELTA_FILE, JSON.stringify(out, null, 2) + '\n');
  return out;
}

// ---------------------------------------------------------------- CLI
function main() {
const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case 'extract': process.stdout.write(extractText(fs.readFileSync(args[0], 'utf8')) + '\n'); break;
  case 'hash': process.stdout.write(sha256(extractText(fs.readFileSync(args[0], 'utf8'))) + '\n'); break;
  case 'rss-cluster': process.stdout.write(JSON.stringify(clusterRss(JSON.parse(fs.readFileSync(args[0], 'utf8'))), null, 2) + '\n'); break;
  case 'get-state': { const s = loadState(); const v = args[0].split('.').reduce((o, k) => (o == null ? o : o[k]), s); console.log(v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v))); break; }
  case 'detect': {
    const out = detect();
    console.log(`Lager 1 klart. first_run=${out.first_run} delta=${out.delta.length} ` +
      `täckning(riksdagen/sajter/rss)=${out.coverage.riksdagen}/${out.coverage.sites}/${out.coverage.rss} ` +
      `fel=${out.errors.length}`);
    if (out.errors.length) out.errors.forEach((e) => console.log('  fel: ' + e));
    break;
  }
  default: console.error(`bevakning-lib: okänt kommando "${cmd}"`); process.exit(1);
}
}

module.exports = { extractText, sha256, clusterRss, parseRss, jaccard, tokens, detect, loadState };

if (require.main === module) main();
