/* GAL-TAN lens logic. Data: data/galtan-view.json. Party colours/names/order
   from window.VAL26. Selection via window.CompareState (shared + persistent).
   Neutrality: axes/rulers grey, only nodes saturated, delta language neutral. */
(function (w, d) {
  'use strict';
  var V = w.VAL26, CS = w.CompareState, SH = w.VAL26Shell;
  var YEARS = [2019, 2024, 2026];
  var reduce = SH.reduceMotion;

  var plot, panel, yearNoteEl, yearBtns = {}, nodeEls = {}, annotEl = null;
  var DATA, curYear = 2019, intro = true, annotParty = null;

  function pos(v) { return 6 + (v / 10) * 88; }               // 0–10 → 6%–94%
  function fmt(n) { return n.toFixed(1).replace('.', ','); }
  function ptFor(code, year) {
    return DATA.parties[code].points.find(function (p) { return p.year === year; });
  }
  function dirTxt(delta, posw, negw) {
    return Math.abs(delta) < 0.3 ? 'i stort sett stilla'
      : fmt(Math.abs(delta)) + ' ' + (delta > 0 ? posw : negw);
  }
  function nodeSize() { return w.innerWidth < 920 ? 32 : 44; }

  function build() {
    // one node element per party, positioned at the start year
    V.PARTY_ORDER.forEach(function (code) {
      var el = d.createElement('div');
      el.className = 'gt-node';
      el.setAttribute('data-party', code);
      el.textContent = code;
      el.style.background = V.partyColor(code);
      el.style.color = V.partyText(code);
      el.title = V.partyName(code);
      el.addEventListener('click', function () { CS.toggle(code); intro = false; });
      plot.appendChild(el);
      nodeEls[code] = el;
    });
    sizeNodes();
    positionNodes(curYear);
  }

  function sizeNodes() {
    var s = nodeSize();
    V.PARTY_ORDER.forEach(function (code) {
      var el = nodeEls[code];
      el.style.width = s + 'px'; el.style.height = s + 'px';
      el.style.fontSize = Math.round(s * (code.length > 1 ? 0.26 : 0.30)) + 'px';
    });
  }

  function positionNodes(year) {
    V.PARTY_ORDER.forEach(function (code) {
      var p = ptFor(code, year);
      nodeEls[code].style.left = pos(p.econ) + '%';
      nodeEls[code].style.top = pos(p.galtan) + '%';
    });
  }

  function renderTrails(year, sel) {
    plot.querySelectorAll('.gt-trail, .gt-ghost').forEach(function (n) { n.remove(); });
    var yi = YEARS.indexOf(year);
    var has = sel.length > 0;
    V.PARTY_ORDER.forEach(function (code) {
      if (has && sel.indexOf(code) === -1) return;         // dimmed parties: no trail
      var pts = DATA.parties[code].points, color = V.partyColor(code);
      for (var i = 1; i <= yi; i++) {
        var a = pts[i - 1], b = pts[i];
        var x0 = pos(a.econ), y0 = pos(a.galtan), x1 = pos(b.econ), y1 = pos(b.galtan);
        var dx = x1 - x0, dy = y1 - y0;
        var t = d.createElement('div');
        t.className = 'gt-trail';
        t.style.left = x0 + '%'; t.style.top = y0 + '%';
        t.style.width = Math.sqrt(dx * dx + dy * dy) + '%';
        t.style.background = color;
        t.style.transform = 'rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI) + 'deg)';
        plot.insertBefore(t, plot.querySelector('.gt-node'));
      }
      for (var j = 0; j < yi; j++) {
        var g = d.createElement('div');
        g.className = 'gt-ghost';
        g.style.left = pos(pts[j].econ) + '%'; g.style.top = pos(pts[j].galtan) + '%';
        g.style.background = color;
        plot.insertBefore(g, plot.querySelector('.gt-node'));
      }
    });
  }

  function renderPanel(sel) {
    panel.innerHTML = '';
    if (sel.length === 0) {
      var hint = d.createElement('div');
      hint.className = 'gt-hint';
      hint.textContent = 'Välj partier — i grafen eller via knapparna ovan — så visas detaljer här bredvid, medan du ser på kartan.';
      panel.appendChild(hint);
      return;
    }
    sel.forEach(function (code) {
      var pts = DATA.parties[code].points, cur = pts[pts.length - 1], first = pts[0];
      var card = d.createElement('div');
      card.className = 'gt-detail';
      card.style.setProperty('--dc', V.partyColor(code));
      var meta = 'GAL-TAN ' + fmt(cur.galtan) + ' (' + dirTxt(cur.galtan - first.galtan, 'mot TAN', 'mot GAL') +
        ') · vänster–höger ' + fmt(cur.econ) + ' (' + dirTxt(cur.econ - first.econ, 'högerut', 'vänsterut') + ')';
      card.innerHTML =
        '<div class="gt-detail__head"><span class="gt-detail__dot" style="background:' + V.partyColor(code) + '"></span>' +
        '<span class="gt-detail__name"></span></div>' +
        '<div class="gt-detail__meta"></div><div class="gt-detail__mot"></div>';
      card.querySelector('.gt-detail__name').textContent = V.partyName(code);
      card.querySelector('.gt-detail__meta').textContent = meta;
      card.querySelector('.gt-detail__mot').textContent = DATA.parties[code].motivation2026;
      panel.appendChild(card);
    });
    var foot = d.createElement('div');
    foot.className = 'gt-panel-foot';
    foot.textContent = 'Korten beskriver läget 2026. Förflyttningar anges mot 2019 års position.';
    panel.appendChild(foot);
  }

  function applySelection(sel) {
    sel = sel || CS.get();
    var has = sel.length > 0;
    V.PARTY_ORDER.forEach(function (code) {
      var on = sel.indexOf(code) !== -1;
      var el = nodeEls[code];
      el.classList.toggle('is-selected', on);
      el.classList.toggle('is-dimmed', has && !on);
    });
    renderTrails(curYear, sel);
    renderPanel(sel);
    // annotation only in the neutral overview at 2026; party is data-derived
    if (!has && curYear === 2026 && annotParty) {
      annotEl.innerHTML = '<b>' + annotParty + '</b> — störst TAN-drift av alla partier sedan 2019.';
      annotEl.style.display = '';
    } else if (annotEl) {
      annotEl.style.display = 'none';
    }
  }

  function setYear(year) {
    curYear = year; intro = false;
    YEARS.forEach(function (y) { yearBtns[y].classList.toggle('is-active', y === year); });
    yearNoteEl.textContent = DATA.yearNotes[String(year)];
    positionNodes(year);
    applySelection(CS.get());
  }

  function stats() {
    var parties = Object.keys(DATA.parties);
    var points = parties.length * YEARS.length;
    // largest GAL-TAN drift 2019→2026 (data-derived), for the stat + label
    var best = { code: null, drift: 0 };
    parties.forEach(function (code) {
      var pts = DATA.parties[code].points;
      var drift = pts[pts.length - 1].galtan - pts[0].galtan;
      if (Math.abs(drift) > Math.abs(best.drift)) best = { code: code, drift: drift };
    });
    var driftDir = best.drift > 0 ? 'mot TAN' : 'mot GAL';
    annotParty = best.code;
    d.getElementById('gt-stat-drift-label').textContent = 'största förflyttning (' + best.code + ', ' + driftDir + ')';
    SH.countUp(d.getElementById('gt-stat-points'), points, 1400);
    var el = d.getElementById('gt-stat-drift');
    if (reduce) { el.textContent = '+' + fmt(Math.abs(best.drift)); return; }
    var t0 = performance.now();
    (function tick(t) {
      var p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = '+' + fmt(Math.abs(best.drift) * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  function init() {
    plot = d.getElementById('gt-plot');
    panel = d.getElementById('gt-panel');
    yearNoteEl = d.getElementById('gt-year-note');
    annotEl = d.getElementById('gt-annot');

    // chips (shared helper, wired to CompareState) + year buttons
    SH.renderChips(d.getElementById('gt-chips'));
    YEARS.forEach(function (y) {
      var b = d.createElement('button');
      b.type = 'button'; b.className = 'gt-year-btn'; b.textContent = y;
      b.addEventListener('click', function () { setYear(y); });
      d.getElementById('gt-year-seg').appendChild(b);
      yearBtns[y] = b;
    });

    build();
    stats();
    CS.subscribe(applySelection);

    // resize: keep node sizes in step with breakpoint
    var narrow = w.innerWidth < 920;
    w.addEventListener('resize', function () {
      var n = w.innerWidth < 920;
      if (n !== narrow) { narrow = n; sizeNodes(); }
    });

    // intro sweep 2019 → 2024 → 2026 (unless a selection is already carried in)
    if (reduce || !CS.isEmpty()) { setYear(2026); }
    else {
      setYearKeepIntro(2019);
      setTimeout(function () { if (intro) setYearKeepIntro(2024); }, 800);
      setTimeout(function () { if (intro) { setYearKeepIntro(2026); intro = false; } }, 1800);
    }
  }
  // during the intro sweep we advance the year without cancelling intro
  function setYearKeepIntro(year) {
    var keep = intro;
    setYear(year);
    intro = keep;
  }

  function boot() {
    fetch('data/galtan-view.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { DATA = json; init(); })
      .catch(function (e) { console.error('GAL-TAN: kunde inte ladda data/galtan-view.json', e); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
