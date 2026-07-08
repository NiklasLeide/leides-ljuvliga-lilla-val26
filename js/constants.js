/* ============================================================
   val26 — shared constants (single source of truth)
   Party colours/names/order + policy-area labels/hues.
   Consumed by every lens. Mirrors data/positions.json colours
   and the area-tone table in handoff design-tokens; keep in sync.
   Exposed as window.VAL26 (no modules — files open directly).
   ============================================================ */
(function (w) {
  'use strict';

  // Party colours are the ONLY saturated colours on the site.
  // Text on nodes is white, except SD (yellow bg) which uses #333.
  var PARTIES = {
    V:  { name: 'Vänsterpartiet',      color: '#AF1D22', text: '#fff' },
    S:  { name: 'Socialdemokraterna',  color: '#ED1B34', text: '#fff' },
    MP: { name: 'Miljöpartiet',        color: '#53A12B', text: '#fff' },
    C:  { name: 'Centerpartiet',       color: '#009933', text: '#fff' },
    L:  { name: 'Liberalerna',         color: '#006AB3', text: '#fff' },
    KD: { name: 'Kristdemokraterna',   color: '#231977', text: '#fff' },
    M:  { name: 'Moderaterna',         color: '#52BDEC', text: '#fff' },
    SD: { name: 'Sverigedemokraterna', color: '#DDCF00', text: '#333' }
  };

  // Canonical left→right display order (design handoff).
  var PARTY_ORDER = ['V', 'S', 'MP', 'C', 'L', 'KD', 'M', 'SD'];

  // Policy areas: id → label + area-tone hue for oklch(0.95 0.02 H).
  // Not every lens uses every area (positions.json has no rättsväsende;
  // discourse.json has all 8). Each lens uses the subset in its data.
  var AREAS = {
    rattsvasende: { label: 'Rättsväsende',       hue: 250 },
    migration:    { label: 'Migration',          hue: 285 },
    klimat:       { label: 'Klimat & energi',    hue: 155 },
    ekonomi:      { label: 'Ekonomi',            hue: 85  },
    demokrati:    { label: 'Demokrati',          hue: 215 },
    forsvar:      { label: 'Försvar & säkerhet', hue: 55  },
    skola:        { label: 'Skola',              hue: 320 },
    vard:         { label: 'Vård & omsorg',      hue: 25  }
  };

  // Neutral tone for area-less lenses (GAL-TAN header).
  var NEUTRAL_TONE = 'oklch(0.945 0.008 85)';

  function areaTone(id) {
    var a = AREAS[id];
    return a ? 'oklch(0.95 0.02 ' + a.hue + ')' : NEUTRAL_TONE;
  }
  function partyColor(code) { return (PARTIES[code] || {}).color || '#94908a'; }
  function partyName(code)  { return (PARTIES[code] || {}).name || code; }
  function partyText(code)  { return (PARTIES[code] || {}).text || '#fff'; }

  // Five lenses, in nav order (Valkompass first). Single source for nav.
  var NAV = [
    { id: 'valkompass',   href: 'valkompass.html',   q: 'Vilket parti ligger närmast dig?',   lens: 'Valkompass' },
    { id: 'position',     href: 'position.html',     q: 'Var står partierna i sakfrågorna?',  lens: 'Position' },
    { id: 'sager-vs-gor', href: 'sager-vs-gor.html', q: 'Håller orden när det blir votering?', lens: 'Säger vs gör' },
    { id: 'sprak',        href: 'sprak.html',        q: 'Vad menar de egentligen med orden?', lens: 'Språk' },
    { id: 'gal-tan',      href: 'gal-tan.html',      q: 'Vart är partierna på väg?',          lens: 'GAL-TAN' }
  ];

  w.VAL26 = {
    PARTIES: PARTIES,
    PARTY_ORDER: PARTY_ORDER,
    AREAS: AREAS,
    NAV: NAV,
    NEUTRAL_TONE: NEUTRAL_TONE,
    areaTone: areaTone,
    partyColor: partyColor,
    partyName: partyName,
    partyText: partyText
  };
})(window);
