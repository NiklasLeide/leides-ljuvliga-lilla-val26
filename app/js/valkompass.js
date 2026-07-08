/* Valkompass. Two independent lenses → two result graphs, per VALKOMPASS_metodik_v1.
   "Tycker" (position): your 5-point answer placed on the same 0–100 axis as the
   parties; area-weighted mean distance → inverse → % närhet. "Tänker" (discourse):
   share of YOUR answered concept questions where a party carries your chosen
   meaning, counted ONLY over concepts the party actually loads (metodik-regel 3),
   so 0% means genuine no-overlap, not thin coverage. Skipped questions never count
   (regel 2). Symmetric maths (regel 1). Weighting touches only "Tycker". Data:
   compass-questions.json (statements/options) + positions.json (party values, live).
   Nothing is stored: the share link carries no answers. */
(function (w, d) {
  'use strict';
  var V = w.VAL26, CS = w.CompareState, SH = w.VAL26Shell;
  var SCALE = ['Tar helt avstånd', 'Tar delvis avstånd', 'Varken eller', 'Instämmer delvis', 'Instämmer helt'];
  var QUESTIONS = [], AREAS = [], areaIndex = {}, positionsByTopic = {};
  var state = { screen: 'intro', qi: 0, answers: {}, weights: [] };
  var root;

  function el(tag, cls) { var e = d.createElement(tag); if (cls) e.className = cls; return e; }
  function pct0(n) { return Math.max(0, Math.round(n)); }

  /* ---------- scoring (metodik v1) ---------- */
  function counts() {
    var posA = 0, discA = 0, tot = 0;
    QUESTIONS.forEach(function (q) {
      var a = state.answers[q.id];
      if (a != null && a !== 'skip') { tot++; if (q.kind === 'pos') posA++; else discA++; }
    });
    return { posA: posA, discA: discA, tot: tot };
  }

  function posScores() {
    return V.PARTY_ORDER.map(function (p) {
      var num = 0, den = 0;
      QUESTIONS.forEach(function (q) {
        if (q.kind !== 'pos') return;
        var a = state.answers[q.id];
        if (a == null || a === 'skip') return;
        var partyPos = positionsByTopic[q.topicId] && positionsByTopic[q.topicId][p];
        if (partyPos == null) return;                       // party not placed on this topic
        var u = q.agreeAt === 100 ? [0, 25, 50, 75, 100][a] : [100, 75, 50, 25, 0][a];
        var wgt = state.weights[areaIndex[q.area]];
        num += wgt * Math.abs(u - partyPos); den += wgt;
      });
      return { code: p, pct: den ? pct0(100 - num / den) : 0, covered: den > 0 };
    }).filter(function (r) { return r.covered; }).sort(function (a, b) { return b.pct - a.pct; });
  }

  function discScores() {
    return V.PARTY_ORDER.map(function (p) {
      var matched = 0, covered = 0;
      QUESTIONS.forEach(function (q) {
        if (q.kind !== 'disc') return;
        var a = state.answers[q.id];
        if (a == null || a === 'skip') return;
        var loads = q.options.some(function (o) { return o.parties.indexOf(p) >= 0; });
        if (!loads) return;                                 // regel 3: skip concepts the party doesn't load
        covered++;
        if (q.options[a].parties.indexOf(p) >= 0) matched++;
      });
      return { code: p, pct: covered ? Math.round(matched / covered * 100) : 0, matched: matched, covered: covered };
    }).filter(function (r) { return r.covered > 0; }).sort(function (a, b) { return b.pct - a.pct; });
  }

  /* ---------- generic bits ---------- */
  function setScreen(s) { state.screen = s; render(); }
  function answer(ix) {
    var q = QUESTIONS[state.qi];
    state.answers[q.id] = ix == null ? 'skip' : ix;
    if (state.qi >= QUESTIONS.length - 1) setScreen('weight');
    else { state.qi++; render(); }
  }
  function back() {
    if (state.qi > 0) { state.qi--; render(); } else setScreen('intro');
  }

  /* ---------- screens ---------- */
  function screenIntro() {
    var wrap = el('div', 'vk-intro');
    var band = el('div', 'vk-band');
    band.innerHTML =
      '<div class="vk-band__row"><span class="vk-pill">Valkompass · Valet 2026</span><span class="lens-updated">Uppdaterad juli 2026</span></div>' +
      '<h1 class="lens-h1">Vilket parti ligger närmast dig?</h1>' +
      '<p class="lens-intro">Resultatet läses genom två linser — vad du tycker i sakfrågorna och vad du tänker när politikens ord används. Två grafer sida vid sida, aldrig ett enda svar.</p>';
    var stats = el('div', 'stat-row');
    stats.innerHTML =
      '<div class="stat"><span class="stat__val">' + QUESTIONS.length + '</span><span class="stat__label">frågor</span></div>' +
      '<div class="stat"><span class="stat__val">2</span><span class="stat__label">linser</span></div>' +
      '<div class="stat"><span class="stat__val">8</span><span class="stat__label">partier</span></div>';
    band.appendChild(stats); wrap.appendChild(band);

    var body = el('div', 'vk-body');
    var how = el('div', 'vk-how');
    [['1', 'Svara på frågorna', 'Sakpåståenden och begreppsfrågor, blandat. Hoppa över det du är osäker på — hoppade frågor räknas inte.'],
     ['2', 'Vikta politikområdena', 'Det du bryr dig mest om väger tyngst i Tycker-grafen. Alla lika från början.'],
     ['3', 'Läs ditt resultat i två grafer', 'Samma svar, två läsningar: vad du tycker i sakfrågorna och hur du tänker kring orden.']]
      .forEach(function (s) {
        var step = el('div', 'vk-step');
        step.innerHTML = '<span class="vk-step__n">' + s[0] + '</span><div><div class="vk-step__t">' + s[1] + '</div><p class="vk-step__p">' + s[2] + '</p></div>';
        how.appendChild(step);
      });
    body.appendChild(how);
    var start = el('button', 'vk-btn'); start.type = 'button'; start.textContent = 'Starta kompassen →';
    start.addEventListener('click', function () { state.qi = 0; setScreen('quiz'); });
    body.appendChild(start);
    var note = el('div', 'vk-mono');
    note.textContent = 'v1: ' + QUESTIONS.filter(function (q) { return q.kind === 'pos'; }).length + ' sakfrågor + ' + QUESTIONS.filter(function (q) { return q.kind === 'disc'; }).length + ' begrepp · dina svar lämnar aldrig webbläsaren · hela metoden redovisas öppet';
    body.appendChild(note);
    wrap.appendChild(body);
    return wrap;
  }

  function screenQuiz() {
    var q = QUESTIONS[state.qi], isPos = q.kind === 'pos';
    var wrap = el('div', 'vk-quiz');
    var head = el('div', 'vk-qhead');
    if (isPos) head.style.background = V.areaTone(q.area); else head.classList.add('vk-qhead--disc');
    var lens = isPos ? 'Tycker som du' : 'Tänker som du';
    var areaLbl = isPos ? (V.AREAS[q.area] && V.AREAS[q.area].label) : 'Begrepp';
    head.innerHTML =
      '<div class="vk-qhead__row"><span class="vk-pill">' + lens + ' · ' + areaLbl + '</span>' +
      '<span class="vk-counter">Fråga ' + (state.qi + 1) + ' av ' + QUESTIONS.length + '</span></div>' +
      '<div class="vk-prog"><span style="width:' + Math.round(state.qi / QUESTIONS.length * 100) + '%"></span></div>';
    wrap.appendChild(head);

    var body = el('div', 'vk-qbody');
    var qt = el('div', 'vk-qtext'); qt.textContent = q.statement; body.appendChild(qt);
    var saved = state.answers[q.id];

    if (isPos) {
      var scaleWrap = el('div', 'vk-scale');
      var track = el('div', 'vk-scale__track');
      var dots = el('div', 'vk-scale__dots');
      SCALE.forEach(function (label, ix) {
        var b = el('button', 'vk-dot'); b.type = 'button'; b.title = label;
        if (saved === ix) b.classList.add('is-on');
        b.addEventListener('click', function () { answer(ix); });
        dots.appendChild(b);
      });
      track.appendChild(dots); scaleWrap.appendChild(track);
      var ends = el('div', 'vk-scale__ends');
      ends.innerHTML = '<span>Tar helt avstånd</span><span class="mid">Varken eller</span><span>Instämmer helt</span>';
      scaleWrap.appendChild(ends);
      body.appendChild(scaleWrap);
    } else {
      var opts = el('div', 'vk-opts');
      q.options.forEach(function (o, ix) {
        var b = el('button', 'vk-opt'); b.type = 'button'; b.textContent = o.label;
        if (saved === ix) b.classList.add('is-on');
        b.addEventListener('click', function () { answer(ix); });
        opts.appendChild(b);
      });
      body.appendChild(opts);
    }

    var footer = el('div', 'vk-qfoot');
    var bk = el('button', 'vk-link'); bk.type = 'button';
    bk.textContent = state.qi > 0 ? '← Föregående fråga' : '← Till starten';
    bk.addEventListener('click', back);
    var skip = el('button', 'vk-link vk-link--u'); skip.type = 'button';
    skip.textContent = 'Vet inte / hoppa över';
    skip.addEventListener('click', function () { answer(null); });
    footer.appendChild(bk); footer.appendChild(skip);
    body.appendChild(footer);
    wrap.appendChild(body);
    return wrap;
  }

  function screenWeight() {
    var wrap = el('div', 'vk-weight');
    var band = el('div', 'vk-band');
    band.innerHTML =
      '<div class="vk-band__row"><span class="vk-pill">Valkompass · Sista steget</span>' +
      '<span class="vk-counter">' + counts().tot + ' av ' + QUESTIONS.length + ' frågor besvarade</span></div>' +
      '<div class="vk-prog vk-prog--full"><span style="width:100%"></span></div>';
    wrap.appendChild(band);
    var body = el('div', 'vk-body');
    var h = el('div', 'vk-h2'); h.textContent = 'Vad väger tyngst för dig?'; body.appendChild(h);
    var p = el('p', 'vk-lead'); p.textContent = 'Områden du bryr dig mer om väger tyngre när dina svar jämförs med partiernas positioner. Alla väger lika från början — du kan lämna dem så.'; body.appendChild(p);
    var grid = el('div', 'vk-wgrid');
    AREAS.forEach(function (a, i) {
      var rowEl = el('div', 'vk-wrow');
      var sw = el('span', 'vk-wsw'); sw.style.background = V.areaTone(a.id);
      var nm = el('span', 'vk-wname'); nm.textContent = a.label;
      var sl = d.createElement('input'); sl.type = 'range'; sl.min = '0.2'; sl.max = '2'; sl.step = '0.1';
      sl.value = state.weights[i]; sl.className = 'vk-wslider';
      var val = el('span', 'vk-wval'); val.textContent = '×' + state.weights[i].toFixed(1).replace('.', ',');
      sl.addEventListener('input', function () {
        state.weights[i] = parseFloat(sl.value);
        val.textContent = '×' + state.weights[i].toFixed(1).replace('.', ',');
      });
      rowEl.appendChild(sw); rowEl.appendChild(nm); rowEl.appendChild(sl); rowEl.appendChild(val);
      grid.appendChild(rowEl);
    });
    body.appendChild(grid);
    var note = el('div', 'vk-lead vk-lead--i');
    note.textContent = 'Påverkar bara Tycker-grafen — begreppsfrågorna viktas inte. I seed-uppsättningen täcker sakfrågorna Skola och Ekonomi.';
    body.appendChild(note);
    var actions = el('div', 'vk-actions');
    var show = el('button', 'vk-btn'); show.type = 'button'; show.textContent = 'Visa mitt resultat →';
    show.addEventListener('click', function () { setScreen('result'); });
    var reset = el('button', 'vk-link vk-link--u'); reset.type = 'button'; reset.textContent = 'Återställ — alla lika';
    reset.addEventListener('click', function () { state.weights = AREAS.map(function () { return 1; }); render(); });
    var bk = el('button', 'vk-link'); bk.type = 'button'; bk.textContent = '← Föregående fråga';
    bk.addEventListener('click', function () { state.qi = QUESTIONS.length - 1; setScreen('quiz'); });
    actions.appendChild(show); actions.appendChild(reset); actions.appendChild(bk);
    body.appendChild(actions);
    wrap.appendChild(body);
    return wrap;
  }

  function graphCard(title, meta, rows, emptyMsg, lensKey) {
    var card = el('div', 'vk-graph');
    var hd = el('div', 'vk-graph__head');
    hd.innerHTML = '<span class="vk-graph__title">' + title + '</span><span class="vk-graph__meta">' + meta + '</span>';
    card.appendChild(hd);
    if (!rows.length) {
      var em = el('div', 'vk-graph__empty'); em.textContent = emptyMsg; card.appendChild(em);
      return card;
    }
    var list = el('div', 'vk-bars');
    rows.forEach(function (r) {
      var row = el('div', 'vk-bar');
      var badge = el('span', 'vk-bar__code'); badge.textContent = r.code;
      badge.style.background = V.partyColor(r.code); badge.style.color = V.partyText(r.code);
      var nm = el('span', 'vk-bar__name'); nm.textContent = V.partyName(r.code);
      var trackEl = el('span', 'vk-bar__track');
      var fill = el('span', 'vk-bar__fill'); fill.style.background = V.partyColor(r.code);
      trackEl.appendChild(fill);
      var pc = el('span', 'vk-bar__pct'); pc.textContent = r.pct + ' %';
      row.appendChild(badge); row.appendChild(nm); row.appendChild(trackEl); row.appendChild(pc);
      list.appendChild(row);
      requestAnimationFrame(function () { fill.style.width = r.pct + '%'; });
    });
    card.appendChild(list);
    if (lensKey === 'disc') {
      var fn = el('div', 'vk-graph__fine'); fn.textContent = 'Räknat bara på begrepp partiet självt använder (0 % = du delar aldrig partiets innebörd, inte tunn täckning).';
      card.appendChild(fn);
    }
    // cross-link
    var link = el('div', 'vk-graph__link');
    var btn = el('button', 'vk-link vk-link--u'); btn.type = 'button';
    btn.textContent = lensKey === 'pos' ? 'Öppna i Position →' : 'Öppna i Språk →';
    btn.addEventListener('click', function () {
      CS.set(rows.slice(0, 3).map(function (r) { return r.code; }));
      w.location.href = lensKey === 'pos' ? 'position.html' : 'sprak.html';
    });
    var hint = el('span', 'vk-graph__hint'); hint.textContent = 'topp-partier förvalda';
    link.appendChild(btn); link.appendChild(hint);
    card.appendChild(link);
    return card;
  }

  function screenResult() {
    var c = counts(), pos = posScores(), disc = discScores();
    var hasPos = pos.length > 0, hasDisc = disc.length > 0, hasBoth = hasPos && hasDisc;
    var sameTop = hasBoth && pos[0].code === disc[0].code;
    var wrap = el('div', 'vk-result');
    var band = el('div', 'vk-band');
    band.innerHTML = '<div class="vk-band__row"><span class="vk-pill">Valkompass · Ditt resultat</span>' +
      '<span class="vk-counter">' + c.tot + ' av ' + QUESTIONS.length + ' frågor besvarade</span></div>';
    wrap.appendChild(band);
    var body = el('div', 'vk-body');

    if (hasBoth) {
      var insight = el('div', 'vk-insight');
      if (sameTop) {
        insight.innerHTML = 'Du både tycker och tänker mest som ' + tag(pos[0].code) + '.';
      } else {
        insight.innerHTML = 'Du tycker mest som ' + tag(pos[0].code) + ' — men tänker mest som ' + tag(disc[0].code) + '.';
      }
      body.appendChild(insight);
      var sub = el('div', 'vk-insight__sub');
      sub.textContent = sameTop
        ? 'Samma parti ligger närmast i båda linserna — men jämför hela graferna, de mäter olika saker.'
        : 'Ingen motsägelse — de två linserna mäter olika saker. Jämför graferna, sida vid sida.';
      body.appendChild(sub);
    }

    var grid = el('div', 'vk-graphs');
    grid.appendChild(graphCard('Tycker som du', c.posA + ' sakfrågor besvarade', pos,
      'Du hoppade över alla sakfrågor — ingen Tycker-graf kan räknas. Gå tillbaka och svara på minst en.', 'pos'));
    grid.appendChild(graphCard('Tänker som du', c.discA + ' begrepp besvarade', disc,
      'Du hoppade över alla begreppsfrågor — ingen Tänker-graf kan räknas.', 'disc'));
    body.appendChild(grid);

    // share (stores nothing)
    var share = el('div', 'vk-share');
    share.innerHTML = '<div class="vk-share__txt"><div class="vk-share__h">Dela ditt resultat</div>' +
      '<p>Länken pekar bara på kompassen — dina enskilda svar lämnar aldrig webbläsaren och sparas ingenstans.</p></div>';
    var copy = el('button', 'vk-btn vk-btn--ghost'); copy.type = 'button'; copy.textContent = 'Kopiera länk';
    copy.addEventListener('click', function () {
      var url = w.location.origin + w.location.pathname;   // bare URL, no answers
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {});
      copy.textContent = 'Länk kopierad ✓';
      setTimeout(function () { copy.textContent = 'Kopiera länk'; }, 1600);
    });
    var sw = el('div', 'vk-share__btns'); sw.appendChild(copy);
    share.appendChild(sw);
    var pnote = el('div', 'vk-mono'); pnote.textContent = 'länken innehåller bara kompassen — aldrig dina enskilda svar';
    share.appendChild(pnote);
    body.appendChild(share);

    var foot = el('div', 'vk-result__foot');
    var meta = el('div', 'vk-mono'); meta.textContent = 'symmetrisk formel · hoppade frågor räknas inte · hela metoden redovisas öppet →';
    var acts = el('div', 'vk-result__acts');
    var edit = el('button', 'vk-link vk-link--u'); edit.type = 'button'; edit.textContent = '← Ändra viktningen';
    edit.addEventListener('click', function () { setScreen('weight'); });
    var again = el('button', 'vk-link vk-link--u'); again.type = 'button'; again.textContent = 'Gör om kompassen';
    again.addEventListener('click', function () { state.answers = {}; state.qi = 0; state.weights = AREAS.map(function () { return 1; }); setScreen('intro'); });
    acts.appendChild(edit); acts.appendChild(again);
    foot.appendChild(meta); foot.appendChild(acts);
    body.appendChild(foot);
    wrap.appendChild(body);
    return wrap;
  }

  function tag(code) {
    return '<span class="vk-tag"><span class="vk-tag__dot" style="background:' + V.partyColor(code) + '"></span>' + V.partyName(code) + '</span>';
  }

  function render() {
    root.innerHTML = '';
    var s = state.screen;
    root.appendChild(s === 'intro' ? screenIntro() : s === 'quiz' ? screenQuiz() : s === 'weight' ? screenWeight() : screenResult());
    w.scrollTo(0, 0);
  }

  function boot() {
    Promise.all([
      fetch('../data/compass-questions.json').then(function (r) { if (!r.ok) throw new Error('questions ' + r.status); return r.json(); }),
      fetch('../data/positions.json').then(function (r) { if (!r.ok) throw new Error('positions ' + r.status); return r.json(); })
    ]).then(function (res) {
      QUESTIONS = res[0].questions;
      res[1].areas.forEach(function (a) {
        AREAS.push({ id: a.id, label: a.name });
        var m = {}; a.topics.forEach(function (t) {
          m[t.id] = {}; Object.keys(t.positions).forEach(function (p) { m[t.id][p] = t.positions[p].position; });
          positionsByTopic[t.id] = m[t.id];
        });
      });
      AREAS.forEach(function (a, i) { areaIndex[a.id] = i; });
      state.weights = AREAS.map(function () { return 1; });
      root = d.getElementById('vk-root');
      render();
    }).catch(function (e) { console.error('Valkompass: datafel', e); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
