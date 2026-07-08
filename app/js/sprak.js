/* Språk lens. Data: data/discourse.json (v0.5.1, neutralitetsstädad).
   Two modes: Begrepp (a contested word → every party's meaning, arranged on a
   neutral GAL–Mitt–TAN spectrum) and Parti (a party's discourse profile).
   GAL/TAN is a descriptive axis (grey, like the GAL-TAN lens), never a value
   judgement; column tone stays neutral. Party colours only identify parties. */
(function (w, d) {
  'use strict';
  var V = w.VAL26;
  var SIG, PARTY, conceptKeys = [], mode = 'begrepp';
  var conceptKey, partyCode, areaKeyC, headerEl;

  function el(tag, cls) { var e = d.createElement(tag); if (cls) e.className = cls; return e; }
  function set(id, txt) { d.getElementById(id).textContent = txt; }

  // classify a freeform galtan_matchning string onto the neutral axis by its
  // leading GAL/TAN token; anything else is the middle.
  function axisOf(gt) {
    var s = (gt || '').toLowerCase(), gi = s.indexOf('gal'), ti = s.indexOf('tan');
    if (gi >= 0 && (ti < 0 || gi < ti)) return 'GAL';
    if (ti >= 0 && (gi < 0 || ti < gi)) return 'TAN';
    return 'Mitt';
  }

  /* ---------- mode toggle ---------- */
  function setMode(m) {
    mode = m;
    d.getElementById('sprak-mode-a').hidden = m !== 'begrepp';
    d.getElementById('sprak-mode-c').hidden = m !== 'parti';
    document.querySelectorAll('.sprak-door').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-mode') === m);
    });
    d.getElementById('sprak-h1').textContent = m === 'begrepp' ? 'Samma ord — olika innebörd' : 'Hur partierna laddar språket';
    d.getElementById('sprak-intro').textContent = m === 'begrepp'
      ? 'Politikens nyckelord är omstridda: alla säger "trygghet", ingen menar samma sak. Här läser du alla partiers definitioner sida vid sida — arrangerade på GAL–TAN-axeln, som är beskrivande, inte ett betyg.'
      : 'Varje parti har en diskursprofil: en övergripande inramning, återkommande nodalpunkter och retoriska strategier. Välj parti och sakområde.';
    if (m === 'begrepp') renderBegrepp(); else renderParti();
  }

  /* ---------- MODE A: Begrepp ---------- */
  function renderConceptPills() {
    var host = d.getElementById('sprak-concept-pills');
    host.innerHTML = '';
    conceptKeys.forEach(function (k) {
      var b = el('button', 'sprak-pill');
      b.type = 'button'; b.textContent = '"' + k + '"';
      b.classList.toggle('is-active', k === conceptKey);
      b.addEventListener('click', function () { conceptKey = k; renderBegrepp(); });
      host.appendChild(b);
    });
  }

  function renderBegrepp() {
    renderConceptPills();
    var c = SIG[conceptKey], per = c.per_parti;
    var present = V.PARTY_ORDER.filter(function (p) { return per[p]; });
    var missing = V.PARTY_ORDER.filter(function (p) { return !per[p]; });

    set('sprak-concept-word', '"' + conceptKey + '"');
    set('sprak-concept-desc', c.beskrivning || '');
    set('sprak-concept-coverage', present.length + ' av 8 partier laddar begreppet i materialet');

    // stats
    setStat('sprak-stat1', conceptKeys.length); set('sprak-stat1-label', 'omstridda begrepp');
    setStat('sprak-stat2', present.length); set('sprak-stat2-label', 'partier definierar ordet');
    setStat('sprak-stat3', 8); set('sprak-stat3-label', 'partier totalt');

    var cols = [
      { key: 'GAL', title: 'GAL-håll' },
      { key: 'Mitt', title: 'Mitten' },
      { key: 'TAN', title: 'TAN-håll' }
    ];
    var host = d.getElementById('sprak-columns');
    host.innerHTML = '';
    cols.forEach(function (col) {
      var members = present.filter(function (p) { return axisOf(per[p].galtan_matchning) === col.key; });
      var wrap = el('div', 'sprak-col');
      var head = el('div', 'sprak-col__head');
      var t = el('span', 'sprak-col__title'); t.textContent = col.title;
      var ct = el('span', 'sprak-col__count'); ct.textContent = members.length;
      head.appendChild(t); head.appendChild(ct); wrap.appendChild(head);
      if (!members.length) {
        var empty = el('div', 'sprak-col__empty');
        empty.textContent = 'Inget parti laddar begreppet så i materialet.';
        wrap.appendChild(empty);
      }
      members.forEach(function (p) {
        var pd = per[p];
        var card = el('div', 'sprak-qcard');
        card.style.borderTopColor = V.partyColor(p);
        var ch = el('div', 'sprak-qcard__head');
        var dot = el('span', 'sprak-qcard__dot'); dot.style.background = V.partyColor(p);
        var nm = el('span', 'sprak-qcard__name'); nm.textContent = V.partyName(p);
        var ax = el('span', 'sprak-qcard__axis'); ax.textContent = pd.galtan_matchning || '';
        ch.appendChild(dot); ch.appendChild(nm); ch.appendChild(ax); card.appendChild(ch);
        if (pd.exempel) { var q = el('div', 'sprak-qcard__quote'); q.textContent = '"' + pd.exempel + '"'; card.appendChild(q); }
        var mn = el('div', 'sprak-qcard__meaning'); mn.textContent = pd.innebord || ''; card.appendChild(mn);
        wrap.appendChild(card);
      });
      host.appendChild(wrap);
    });

    var miss = d.getElementById('sprak-missing');
    if (missing.length) { miss.hidden = false; miss.textContent = 'Saknas i materialet: ' + missing.join(', ') + '. Att ett parti inte laddar ordet är i sig en observation.'; }
    else miss.hidden = true;

    var comm = d.getElementById('sprak-commentary');
    if (c.analytisk_kommentar) { comm.hidden = false; d.getElementById('sprak-commentary-text').textContent = c.analytisk_kommentar; }
    else comm.hidden = true;
  }

  /* ---------- MODE C: Parti ---------- */
  function renderPartyChips() {
    var host = d.getElementById('sprak-party-chips');
    host.innerHTML = '';
    V.PARTY_ORDER.forEach(function (p) {
      var on = p === partyCode;
      var b = el('button', 'chip'); b.type = 'button';
      if (on) { b.classList.add('is-selected'); b.style.borderColor = V.partyColor(p); b.style.background = V.partyColor(p); b.style.color = V.partyText(p); }
      var dot = el('span', 'chip__dot'); dot.style.background = V.partyColor(p);
      b.appendChild(dot); b.appendChild(d.createTextNode(p));
      b.addEventListener('click', function () { partyCode = p; areaKeyC = null; renderParti(); });
      host.appendChild(b);
    });
  }

  function renderParti() {
    renderPartyChips();
    var P = PARTY[partyCode], dp = P.diskursprofil, areas = Object.keys(P.per_omrade);
    if (!areaKeyC || !P.per_omrade[areaKeyC]) areaKeyC = areas[0];

    // stats
    setStat('sprak-stat1', dp.nodalpunkter.length); set('sprak-stat1-label', 'nodalpunkter');
    setStat('sprak-stat2', areas.length); set('sprak-stat2-label', 'sakområden med profil');
    set('sprak-stat3', (dp.galtan_kongruens && dp.galtan_kongruens.bedomning) || '—'); set('sprak-stat3-label', 'ord–positionskongruens');

    // profile card
    var prof = d.getElementById('sprak-profile');
    prof.innerHTML = '';
    prof.style.borderTopColor = V.partyColor(partyCode);
    var ph = el('div', 'sprak-prof__head');
    var pdot = el('span', 'sprak-prof__dot'); pdot.style.background = V.partyColor(partyCode);
    var pnm = el('span', 'sprak-prof__name'); pnm.textContent = V.partyName(partyCode);
    ph.appendChild(pdot); ph.appendChild(pnm);
    if (dp.galtan_kongruens) {
      var kb = el('span', 'sprak-prof__kong'); kb.textContent = 'Kongruens ord–position: ' + dp.galtan_kongruens.bedomning;
      ph.appendChild(kb);
    }
    prof.appendChild(ph);
    var fr = el('div', 'sprak-prof__framing'); fr.textContent = dp.overordnad_inramning || ''; prof.appendChild(fr);
    prof.appendChild(labelEl('Nodalpunkter — orden allt kretsar kring'));
    var nod = el('div', 'sprak-tags');
    dp.nodalpunkter.forEach(function (t) { var s = el('span', 'sprak-tag'); s.textContent = t; nod.appendChild(s); });
    prof.appendChild(nod);
    prof.appendChild(labelEl('Retoriska strategier'));
    var strat = el('div', 'sprak-strat-list');
    dp.retoriska_strategier.forEach(function (s) { var r = el('div', 'sprak-strat-line'); r.textContent = '· ' + s; strat.appendChild(r); });
    prof.appendChild(strat);
    if (dp.galtan_kongruens && dp.galtan_kongruens.forklaring) {
      var note = el('div', 'sprak-kong-note');
      note.appendChild(labelEl('Stämmer orden med positionen?'));
      var kt = el('div', 'sprak-kong-note__text'); kt.textContent = dp.galtan_kongruens.forklaring;
      note.appendChild(kt); prof.appendChild(note);
    }

    // area tabs
    var tabs = d.getElementById('sprak-area-tabs-c');
    tabs.innerHTML = '';
    areas.forEach(function (a) {
      var b = el('button', 'area-tab'); b.type = 'button';
      b.textContent = (V.AREAS[a] && V.AREAS[a].label) || a;
      b.classList.toggle('is-active', a === areaKeyC);
      b.addEventListener('click', function () { areaKeyC = a; renderParti(); });
      tabs.appendChild(b);
    });

    // area content
    var od = P.per_omrade[areaKeyC];
    var host = d.getElementById('sprak-area-content');
    host.innerHTML = '';
    var inr = el('div', 'sprak-area__framing'); inr.textContent = od.inramning || ''; host.appendChild(inr);
    if (od.nyckelbegrepp && od.nyckelbegrepp.length) {
      host.appendChild(labelEl('Nyckelbegrepp'));
      var grid = el('div', 'sprak-key-grid');
      od.nyckelbegrepp.forEach(function (b) {
        var c = el('div', 'sprak-key');
        var term = el('div', 'sprak-key__term'); term.textContent = '"' + b.term + '"'; c.appendChild(term);
        var mn = el('div', 'sprak-key__meaning'); mn.textContent = b.innebord || ''; c.appendChild(mn);
        if (b.underforstadd_premiss) {
          var pr = el('div', 'sprak-key__premiss');
          var lb = el('b'); lb.textContent = 'Underförstådd premiss: ';
          pr.appendChild(lb); pr.appendChild(d.createTextNode(b.underforstadd_premiss));
          c.appendChild(pr);
        }
        grid.appendChild(c);
      });
      host.appendChild(grid);
    }
    if (od.retoriska_strategier && od.retoriska_strategier.length) {
      host.appendChild(labelEl('Retoriska strategier i området'));
      var list = el('div', 'sprak-area-strat');
      od.retoriska_strategier.forEach(function (s) {
        var row = el('div', 'sprak-area-strat__row');
        row.style.borderLeftColor = V.partyColor(partyCode);
        var st = el('div', 'sprak-area-strat__name'); st.textContent = s.strategi || ''; row.appendChild(st);
        if (s.exempel) { var ex = el('div', 'sprak-area-strat__ex'); ex.textContent = '"' + s.exempel + '"'; row.appendChild(ex); }
        if (s.kalla) { var kl = el('div', 'sprak-area-strat__src'); kl.textContent = '— ' + s.kalla; row.appendChild(kl); }
        list.appendChild(row);
      });
      host.appendChild(list);
    }
  }

  function labelEl(txt) { var e = el('div', 'sprak-label'); e.textContent = txt; return e; }
  function setStat(id, n) { if (w.VAL26Shell) w.VAL26Shell.countUp(d.getElementById(id), n, 700); else set(id, n); }

  function init() {
    headerEl = d.getElementById('sprak-header');
    conceptKeys = Object.keys(SIG);
    conceptKey = conceptKeys.indexOf('trygghet') >= 0 ? 'trygghet' : conceptKeys[0];
    partyCode = 'SD';
    document.querySelectorAll('.sprak-door').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    setMode('begrepp');
  }

  function boot() {
    fetch('../data/discourse.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { SIG = json.flytande_signifikanter; PARTY = json.partier; init(); })
      .catch(function (e) { console.error('Språk: kunde inte ladda data/discourse.json', e); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
