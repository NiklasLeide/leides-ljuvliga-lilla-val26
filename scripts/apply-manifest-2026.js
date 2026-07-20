#!/usr/bin/env node
/* Skriver in de godkända valmanifest-fynden i data/positions.json.
 * Varje beslut är explicit kodat nedan — inga härledda ändringar.
 * Beslutsunderlag: drafts/GRANSKNING-valmanifest-2026.md (granskad av Niklas).
 * Kör: node scripts/apply-manifest-2026.js [--dry]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const POS = path.join(REPO, 'data', 'positions.json');
const EXDIR = path.join(REPO, 'drafts', 'extraktion-valmanifest-2026');
const GRANSKAD = '2026-07-21';
const DRY = process.argv.includes('--dry');

// ---------------------------------------------------------------- källformat
// RESEARCH_AGENT.md: dokumenttitel + URL + sidhänvisning.
// V bär alltid "(preliminär version)", M alltid "(kampanjsida, ej manifest)".
const DOC = {
  S:  { title: 'Plan för Sverige (Valplattform) 2026-02-05',
        url: 'https://www.socialdemokraterna.se/download/18.68544bb219c4794c4a4684c/1771599906618/Valplattform.pdf' },
  V:  { title: 'Vänsterpartiets valplattform efter kongressbeslut 2026 (preliminär version)',
        url: 'https://www.vansterpartiet.se/wp-content/uploads/2026/04/Preliminar-Valplattform-efter-beslut-pa-kongressen-2026.pdf' },
  L:  { title: 'För din frihet. Liberalernas valmanifest 2026',
        url: 'https://www.liberalerna.se/wp-content/uploads/liberalernas-valmanifest-2026-40s-komprimerad.pdf' },
  C:  { title: 'Sverige kan mer. Centerpartiets valmanifest 2026',
        url: 'https://val2026.centerpartiet.se/wp-content/uploads/2026/06/Valmanifest-2026.pdf' },
  SD: { title: 'Valplattform 2026',
        url: 'https://www.sd.se/wp-content/uploads/2026/07/valplattform-2026.pdf' },
  M:  { title: 'Vallöften 2026 (kampanjsida, ej manifest)', hamtad: '2026-07-20',
        url: 'https://moderaterna.se/valloften-2026/' }
};

function manifestSource(party, pages) {
  const d = DOC[party];
  if (party === 'M') return `${d.title}, hämtad ${d.hamtad}, ${d.url}`;
  const uniq = [...new Set(pages.filter(Boolean))].sort((a, b) => a - b);
  return `${d.title}, s. ${uniq.join(', ')}, ${d.url}`;
}

// ------------------------------------------------------------------ beslut
// REPLACE_SOURCE: exakt sträng som ska bort ur source-fältet (kvalitetsbrist).
const D = {
  // --- Sektion 1, FLYTTAR ---------------------------------------------
  'L|arbetskraftsinvandring': {
    position: 35, group: 'Underlätta med kontroll',
    summary: 'Valmanifestet 2026 vill sänka den lönenivå som krävs för arbetstillstånd och införa start-up-visum och ett poängsystem, samtidigt som luckor som leder till missbruk ska täppas till. Detta går emot vad partiet genomfört i regering: som del av Tidösamarbetet höjdes lönekravet 2025. Diskrepansen mellan valmanifest och regeringsbeslut är noterad och är material för säger-vs-gör-linsen.'
  },
  'L|forsvarsbudget': {
    position: 90, group: 'Maximal upprustning',
    summary: 'Valmanifestet 2026: höjningen till 5 procent av BNP ska genomföras, och partiet är berett att gå längre om det krävs. Konkret eget åtagande utöver regeringens linje.',
    replaceSource: 'Parlamentarisk överenskommelse'
  },
  'L|public-service': {
    position: 80, group: 'Stärk oberoende',
    summary: 'Valmanifestet 2026 vill öka resurserna till SVT, SR och UR och värna deras oberoende i grundlagen. Det står i spänning mot partiets linje inom Tidösamarbetet (bet. 2025/26:KrU2), där L drivit tydligare ramar för public service.'
  },
  'L|yttrandefrihet': {
    position: 50, group: 'Reglering i utvalda frågor',
    summary: 'Betonar yttrandefrihet men vill skydda mot diktaturernas lobbyister (Motion 2025/26:3144). Valmanifestet 2026 kräver hårdare EU-tryck på techbolagen i avgränsade frågor — barns säkerhet online och skydd av personuppgifter — men tar inte ställning för plattformsreglering generellt.'
  },
  'C|bostader': {
    position: 58, group: 'Marknad med socialt inslag',
    summary: 'Valmanifestet 2026 innehåller en bostadssocial reform som ska ge hushåll med svag ekonomi tillgång till bostäder med rimliga hyror, tillsammans med enklare byggregler och kommunala bygglovsundantag. Manifestet nämner inte marknadshyror.',
    replaceSource: 'Hyresgästföreningens granskning (Dagens Arena), https://www.dagensarena.se/innehall/ny-rapport-riktar-skarp-kritik-mot-partiernas-bostadspolitik/'
  },
  'C|integration': {
    position: 50, group: 'Krav kombinerat med stöd',
    summary: 'Vill ha snabb väg in i arbete med egenförsörjning som nyckel. Valmanifestet 2026 skärper kravdelen: obligatoriskt nystartsår där utebliven medverkan ger påtagligt lägre bidrag, och fler bidrag och ersättningar villkorade av deltagande i integrationsinsatser.'
  },
  'C|forsvarsbudget': {
    position: 85, group: 'Maximal upprustning',
    summary: 'Valmanifestet 2026: upprustningen måste fullföljas upp till fem procent av BNP. Betonar civilförsvar, glesbygd och försörjningsberedskap.'
  },
  'C|klimatmal': {
    // Position oförändrad (68) — rubriken bedömdes för tunn för att flytta.
    group: 'Behåll mål, driv på i EU'
  },

  // --- Sektion 2, KLARGÖR ---------------------------------------------
  'S|asylpolitik': {
    unclear: false, // position oförändrad (42) — kontinuitetsbesked flyttar inte
    summary: 'Värnar reglerad invandring. Lade om lagstiftningen för att färre ska söka sig till Sverige. Solidarisk fördelning inom EU. Stödde EU:s migrationspakt. Deltog inte i Asylrättsforum 2025. Valplattformen 2026 slår fast att den strama migrationspolitiken ligger fast — ett kontinuitetsbesked som bekräftar nuvarande linje.'
  },
  'SD|bostader': {
    position: 65, unclear: false, group: 'Enklare regler och ökat ägande',
    summary: 'Valplattformen 2026 vill ha enklare bygg- och låneregler så att fler kan äga och utveckla sin bostad, och pekar ut pålagor, regelkrångel och högt skattetryck som orsak till trångboddhet och bostadsbrist. Plattformen nämner inte marknadshyror.'
  },
  'C|vinstuttag':            { unclear: false },
  'C|digitalisering-skolan': {
    // unclear: true BEHÅLLS — skalan mäter skärm mot bok, manifestet talar om AI.
    summary: 'Generellt positivt till digitalisering och har digitaliseringsprogram. Vill balansera digital kompetens med ansvarsfull användning. Valmanifestet 2026 vill att alla elever får grundläggande kunskap i AI och källkritik och att teknik ska förenkla, men tar inte ställning i frågan om skärmar kontra läroböcker som skalan mäter. Positionen är därför fortsatt otydlig.'
  },
  'C|skatt-arbete': {
    unclear: false,
    summary: 'Vill sänka skatten brett genom allmän skattereduktion som inkluderar löntagare, pensionärer och sjukskrivna. Inte lika fokuserat på marginalskattesänkningar som M/L. Valmanifestet 2026 bekräftar linjen: sänk inkomstskatten särskilt för de med låga inkomster — prioriterat att sänka skatten underifrån.'
  },
  'C|valfard-finansiering': {
    unclear: false, // position oförändrad (55) — redan mittskala
    summary: 'Vill ha bred skattereduktion men också stärkt välfärd. Betonar effektivisering och strukturreformer snarare än höjda skatter. Valmanifestet 2026 kombinerar ett stort utgiftsåtagande — 50 miljarder till landsbygderna under mandatperioden — med effektivisering genom att befria kommuner och regioner från riktade statsbidrag.'
  },
  'C|eu-ekonomi': {
    position: 60, unclear: false, group: 'Öppen för fördjupning',
    summary: 'Valmanifestet 2026 vill tillsätta en statlig utredning om ett svenskt euromedlemskap, med motiveringen att över 20 år gått sedan folkomröstningen och att det säkerhetspolitiska läget förändrats. Det är en öppning, inte en utfästelse om medlemskap. Partiet har fortfarande inte tagit ställning till bankunionen.',
    replaceSource: 'Wikipedia bankunionen, https://sv.wikipedia.org/wiki/Bankunionen'
  }
};

// ------------------------------------------------------------------- kör
const pos = JSON.parse(fs.readFileSync(POS, 'utf8'));
const rows = fs.readdirSync(EXDIR).filter(f => /^extraction-.*\.json$/.test(f))
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(EXDIR, f), 'utf8')));

const pages = {};
rows.forEach(r => { (pages[r.party + '|' + r.topic] ||= []).push(r.page); });

const T = {};
for (const a of pos.areas) for (const t of a.topics) T[t.id] = t;

const log = { source: 0, moved: [], cleared: [], group: [], summary: [], fresh: 0 };
const applied = new Set();

for (const key of Object.keys(pages)) {
  const [party, topic] = key.split('|');
  const v = T[topic].positions[party];
  const d = D[key];

  // 1. källtillägg (alla ~150) — befintliga källor behålls, manifestet läggs till
  let src = v.source || '';
  if (d && d.replaceSource) {
    if (!src.includes(d.replaceSource)) throw new Error(`replaceSource hittades inte: ${key}`);
    src = src.split(' · ').filter(s => s.trim() !== d.replaceSource).join(' · ');
  }
  const add = manifestSource(party, pages[key]);
  v.source = src ? `${src} · ${add}` : add;
  log.source++;

  // 2. färskhetsmarkering
  v.senast_granskad = GRANSKAD;
  log.fresh++;

  // 3. beslut
  if (d) {
    applied.add(key);
    if (d.position !== undefined && d.position !== v.position) {
      log.moved.push(`${key} ${v.position} -> ${d.position}`); v.position = d.position;
    }
    if (d.unclear === false && v.unclear) { log.cleared.push(key); v.unclear = false; }
    if (d.group && d.group !== v.group) {
      log.group.push(`${key} "${v.group}" -> "${d.group}"`); v.group = d.group;
    }
    if (d.summary) { log.summary.push(key); v.summary = d.summary; }
  }
}

const missed = Object.keys(D).filter(k => !applied.has(k));
if (missed.length) throw new Error('beslut utan extraktionsrad: ' + missed.join(', '));

// schemaVersion bumpas: nytt fält senast_granskad (CLAUDE.md kräver migration)
const oldSchema = pos.schemaVersion;
pos.schemaVersion = 2;

if (!DRY) fs.writeFileSync(POS, JSON.stringify(pos, null, 2) + '\n', 'utf8');

console.log(DRY ? '=== TORRKÖRNING (inget skrivet) ===' : '=== SKRIVET ===');
console.log(`schemaVersion:      ${oldSchema} -> ${pos.schemaVersion} (nytt fält senast_granskad)`);
console.log(`källtillägg:        ${log.source} positioner`);
console.log(`färskhetsdatum:     ${log.fresh} positioner (${GRANSKAD})`);
console.log(`flyttade:           ${log.moved.length}`);
log.moved.forEach(m => console.log('   ' + m));
console.log(`unclear upplösta:   ${log.cleared.length}  [${log.cleared.join(', ')}]`);
console.log(`gruppnamn ändrade:  ${log.group.length}`);
log.group.forEach(g => console.log('   ' + g));
console.log(`summary ändrade:    ${log.summary.length}`);
