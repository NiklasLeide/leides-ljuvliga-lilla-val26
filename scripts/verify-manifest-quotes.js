// Grep-verification: every extracted quote must be found in the source text.
// Facit = the extracted document text, never the model's reading.
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const EX = path.join(DIR, 'extract');

const norm = s => s
  .replace(/­/g, '')        // soft hyphen
  .replace(/[‐-―]/g, '-')
  .replace(/[‘’]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

// aggressive: also removes ALL spaces, to survive PDF intra-word spacing ("dri ver")
const squash = s => norm(s).replace(/ /g, '').toLowerCase();
// tier 3: also strips hyphens, to survive PDF end-of-line hyphenation (Kva- + litetskrav)
const dehyph = s => squash(s).replace(/-/g, '');

const srcCache = {};
function src(party) {
  if (!srcCache[party]) {
    const f = party === 'M'
      ? path.join(EX, 'M.txt')
      : path.join(EX, party + '.txt');
    srcCache[party] = fs.readFileSync(f, 'utf8');
  }
  return srcCache[party];
}

const files = process.argv.slice(2);
let rows = [];
files.forEach(f => rows = rows.concat(JSON.parse(fs.readFileSync(f, 'utf8'))));

let exact = 0, squashed = 0, hyph = 0, failed = [];
const byParty = {};
rows.forEach(r => {
  const text = src(r.party);
  const okExact = norm(text).includes(norm(r.quote));
  const okSquash = squash(text).includes(squash(r.quote));
  byParty[r.party] = byParty[r.party] || { n: 0, exact: 0, squash: 0, hyph: 0, fail: 0 };
  byParty[r.party].n++;
  if (okExact) { exact++; byParty[r.party].exact++; }
  else if (okSquash) { squashed++; byParty[r.party].squash++; }
  else if (dehyph(text).includes(dehyph(r.quote))) { hyph++; byParty[r.party].hyph++; }
  else { failed.push(r); byParty[r.party].fail++; }
  r._ok = okExact || okSquash || dehyph(text).includes(dehyph(r.quote));
  r._mode = okExact ? 'exakt' : (okSquash ? 'normaliserad' : (r._ok ? 'avstavning' : 'FAIL'));
});

console.log('=== GREP-VERIFIERING ===');
console.log('citat totalt:      ', rows.length);
console.log('exakt träff:       ', exact);
console.log('normaliserad träff:', squashed, '(PDF-radbrytning/teckenavstånd)');
console.log('avstavningsträff:  ', hyph, '(PDF-avstavning vid radslut)');
console.log('EJ VERIFIERADE:    ', failed.length);
console.log();
console.log('parti | citat | exakt | normaliserad | avstavning | fail');
Object.entries(byParty).forEach(([p, v]) =>
  console.log(p.padEnd(5), '|', String(v.n).padStart(5), '|', String(v.exact).padStart(5), '|',
              String(v.squash).padStart(12), '|', String(v.hyph).padStart(10), '|', v.fail));
if (failed.length) {
  console.log('\n--- EJ VERIFIERADE CITAT (korrigeras eller kastas) ---');
  failed.forEach(r => console.log(' ', r.party, '|', r.topic, '| s.' + r.page, '|', r.quote.slice(0, 90)));
}
fs.writeFileSync(path.join(DIR, 'verified.json'), JSON.stringify(rows, null, 1));
