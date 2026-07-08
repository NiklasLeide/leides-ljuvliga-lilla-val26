/* Säger vs gör lens. Data: data/voting.json (says/promises/voted/match), topic +
   area names from data/positions.json. Party colours/order from window.VAL26;
   selection via window.CompareState. Carries the credibility fix: visible
   distribution + method note + deviations surfaced (never buried in "stämmer").
   Status colours = congruence words↔votes only, never political direction. */
(function (w, d) {
  'use strict';
  var V = w.VAL26, CS = w.CompareState, SH = w.VAL26Shell;
  var VOTING, areaName = {}, topicName = {}, areaList = [];
  var areaId, headerEl, stammerOpen = false;

  function el(tag, cls) { var e = d.createElement(tag); if (cls) e.className = cls; return e; }
  function norm(match) {
    return match === 'stammer' ? 'stammer'
      : match === 'inväntar-votering' ? 'invantar' : 'delvis';
  }

  // flatten current area's comparisons, filtered by selection (empty = all)
  function rows() {
    var sel = CS.get(), out = [], topics = VOTING[areaId];
    Object.keys(topics).forEach(function (tid) {
      V.PARTY_ORDER.forEach(function (p) {
        var rec = topics[tid][p];
        if (!rec) return;
        if (sel.length && sel.indexOf(p) === -1) return;
        out.push({ p: p, topicId: tid, topic: topicName[areaId][tid] || tid,
          says: rec.says, does: rec.voted, status: norm(rec.match) });
      });
    });
    return out;
  }

  function renderTabs() {
    var host = d.getElementById('svg-area-tabs');
    host.innerHTML = '';
    areaList.forEach(function (a) {
      var b = el('button', 'area-tab');
      b.type = 'button'; b.textContent = a.name;
      b.classList.toggle('is-active', a.id === areaId);
      b.addEventListener('click', function () { setArea(a.id); });
      host.appendChild(b);
    });
  }

  function renderDistribution(all) {
    var ok = all.filter(function (r) { return r.status === 'stammer'; }).length;
    var delvis = all.filter(function (r) { return r.status === 'delvis'; }).length;
    var invantar = all.filter(function (r) { return r.status === 'invantar'; }).length;
    var tot = all.length || 1;
    var css = getComputedStyle(d.documentElement);
    var segDefs = [
      { count: ok, bg: css.getPropertyValue('--stammer-bg'), txt: css.getPropertyValue('--stammer-text'), label: 'Stämmer (' + ok + ')' },
      { count: delvis, bg: css.getPropertyValue('--delvis-bg'), txt: css.getPropertyValue('--delvis-text'), label: 'Delvis / avviker (' + delvis + ')' },
      { count: invantar, bg: css.getPropertyValue('--invantar-bg'), txt: css.getPropertyValue('--invantar-text'), label: 'Inväntar votering (' + invantar + ')' }
    ];
    var bar = d.getElementById('svg-bar');
    bar.innerHTML = '';
    segDefs.filter(function (s) { return s.count > 0; }).forEach(function (s) {
      var seg = el('div', 'svg-seg');
      seg.style.width = (s.count / tot * 100) + '%';
      seg.style.background = s.bg; seg.style.color = s.txt;
      seg.textContent = s.count;
      bar.appendChild(seg);
    });
    var legend = d.getElementById('svg-legend');
    legend.innerHTML = '';
    segDefs.forEach(function (s) {
      var item = el('span', 'item');
      var sw = el('span', 'sw'); sw.style.background = s.bg;
      item.appendChild(sw); item.appendChild(d.createTextNode(s.label));
      legend.appendChild(item);
    });
    d.getElementById('svg-dist-eyebrow').textContent = 'Ord mot handling i ' + areaName[areaId].toLowerCase();
  }

  function renderDeviations(all) {
    var devs = all.filter(function (r) { return r.status === 'delvis'; })
      .concat(all.filter(function (r) { return r.status === 'invantar'; }));
    var host = d.getElementById('svg-deviations');
    host.innerHTML = '';
    if (!devs.length) {
      var empty = el('div', 'svg-empty');
      empty.textContent = 'Inga avvikelser bland de valda partierna i detta område.';
      host.appendChild(empty);
      return;
    }
    var grid = el('div', 'svg-dev-grid');
    var css = getComputedStyle(d.documentElement);
    devs.forEach(function (r) {
      var iv = r.status === 'invantar';
      var card = el('div', 'svg-dev');
      card.style.setProperty('--accent', (iv ? css.getPropertyValue('--invantar-accent') : css.getPropertyValue('--delvis-accent')));
      var head = el('div', 'svg-dev__head');
      var dot = el('span', 'svg-dev__dot'); dot.style.background = V.partyColor(r.p);
      var nm = el('span', 'svg-dev__name'); nm.textContent = V.partyName(r.p);
      var tp = el('span', 'svg-dev__topic'); tp.textContent = r.topic;
      head.appendChild(dot); head.appendChild(nm); head.appendChild(tp);

      var saysRow = el('div', 'svg-row');
      var sl = el('span', 'svg-row__label'); sl.textContent = 'Säger';
      sl.style.color = css.getPropertyValue('--stammer-text');
      saysRow.appendChild(sl); saysRow.appendChild(d.createTextNode(r.says));

      var doesRow = el('div', 'svg-row');
      var dl = el('span', 'svg-row__label'); dl.textContent = iv ? 'Ingen votering' : 'Gör';
      dl.style.color = iv ? css.getPropertyValue('--invantar-text') : css.getPropertyValue('--delvis-text');
      doesRow.appendChild(dl); doesRow.appendChild(d.createTextNode(r.does));

      card.appendChild(head); card.appendChild(saysRow); card.appendChild(doesRow);
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }

  function renderStammer(all) {
    var ok = all.filter(function (r) { return r.status === 'stammer'; });
    d.getElementById('svg-stammer-count').textContent = ok.length;
    d.getElementById('svg-stammer-toggle').textContent = stammerOpen ? 'Dölj' : 'Visa';
    var body = d.getElementById('svg-stammer-body');
    body.hidden = !stammerOpen;
    body.innerHTML = '';
    if (!stammerOpen) return;
    Object.keys(VOTING[areaId]).forEach(function (tid) {
      var groupRows = ok.filter(function (r) { return r.topicId === tid; });
      if (!groupRows.length) return;
      var h = el('div', 'svg-stammer__group'); h.textContent = topicName[areaId][tid] || tid;
      body.appendChild(h);
      groupRows.forEach(function (r) {
        var row = el('div', 'svg-stammer__row');
        var dot = el('span', 'svg-stammer__dot'); dot.style.background = V.partyColor(r.p);
        var code = el('span', 'svg-stammer__code'); code.textContent = r.p;
        var txt = el('span', 'svg-stammer__text'); txt.textContent = r.says;
        row.appendChild(dot); row.appendChild(code); row.appendChild(txt);
        body.appendChild(row);
      });
    });
  }

  function animStats(all) {
    var tot = all.length, ok = all.filter(function (r) { return r.status === 'stammer'; }).length;
    d.getElementById('svg-stat-area').textContent = areaName[areaId].toLowerCase();
    SH.countUp(d.getElementById('svg-stat-rows'), tot, 900);
    SH.countUp(d.getElementById('svg-stat-ok'), ok, 900);
    SH.countUp(d.getElementById('svg-stat-dev'), tot - ok, 900);
  }

  function render() {
    var all = rows();
    renderTabs();
    renderDistribution(all);
    renderDeviations(all);
    renderStammer(all);
    animStats(all);
  }

  function setArea(id) { areaId = id; SH.setHeaderTone(headerEl, id); render(); }

  function init() {
    headerEl = d.getElementById('svg-header');
    SH.renderChips(d.getElementById('svg-chips'));
    d.getElementById('svg-stammer-btn').addEventListener('click', function () {
      stammerOpen = !stammerOpen; renderStammer(rows());
    });
    areaId = VOTING['skola'] ? 'skola' : areaList[0].id;
    setArea(areaId);
    CS.subscribe(render);   // selection filters the whole view
  }

  function boot() {
    Promise.all([
      fetch('../data/voting.json').then(function (r) { if (!r.ok) throw new Error('voting ' + r.status); return r.json(); }),
      fetch('../data/positions.json').then(function (r) { if (!r.ok) throw new Error('positions ' + r.status); return r.json(); })
    ]).then(function (res) {
      VOTING = res[0].data;
      res[1].areas.forEach(function (a) {
        areaName[a.id] = a.name; topicName[a.id] = {};
        a.topics.forEach(function (t) { topicName[a.id][t.id] = t.name; });
      });
      areaList = res[1].areas.filter(function (a) { return VOTING[a.id]; }).map(function (a) { return { id: a.id, name: a.name }; });
      init();
    }).catch(function (e) { console.error('Säger vs gör: datafel', e); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
