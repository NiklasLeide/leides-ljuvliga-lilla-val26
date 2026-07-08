/* Position lens. Data: data/positions.json (all areas). Party colours/names/order
   from window.VAL26; selection via window.CompareState. Beeswarm "3a" collision
   layout: colliding nodes dodge to lanes, a stick links each to its exact value.
   Neutrality: rails/ticks grey, only nodes saturated, unclear = dashed + 0.8. */
(function (w, d) {
  'use strict';
  var V = w.VAL26, CS = w.CompareState, SH = w.VAL26Shell;
  var NODE = 36;
  var DATA, areasById = {}, areaId, tabHost, topicHost, headerEl;

  function el(tag, cls) { var e = d.createElement(tag); if (cls) e.className = cls; return e; }
  function partiesIn(topic) { return V.PARTY_ORDER.filter(function (p) { return topic.positions[p]; }); }

  function trackWidthPx() {
    var narrow = w.innerWidth < 920;
    var availW = w.innerWidth - (narrow ? 0 : 210);
    return Math.max(240, Math.min(availW, 940) - 44 - 48 - 20);   // wrapper/card/track insets
  }

  // Beeswarm 3a: sort by value, place each in the first lane with no neighbour
  // within `gap` (% of real track width). Returns geometry for the track.
  function layout(topic) {
    var order = partiesIn(topic);
    var gap = ((NODE + 8) / trackWidthPx()) * 100;
    var laneOrder = [0, -1, 1, -2, 2, -3, 3];
    var placed = [];
    order.slice().sort(function (a, b) { return topic.positions[a].position - topic.positions[b].position; })
      .forEach(function (p) {
        var left = topic.positions[p].position;
        var lane = laneOrder.find(function (l) {
          return !placed.some(function (q) { return q.lane === l && Math.abs(q.left - left) < gap; });
        });
        if (lane === undefined) lane = 0;
        placed.push({ p: p, left: left, lane: lane });
      });
    var laneOf = {}; placed.forEach(function (q) { laneOf[q.p] = q.lane; });
    var lanes = placed.map(function (q) { return q.lane; });
    var rowH = NODE - 2;
    var upRows = Math.max.apply(null, [0].concat(lanes.map(function (l) { return -l; })));
    var downRows = Math.max.apply(null, [0].concat(lanes));
    var lineY = 14 + upRows * rowH + NODE / 2;
    var trackH = lineY + downRows * rowH + NODE / 2 + 14;
    return { order: order, laneOf: laneOf, rowH: rowH, lineY: lineY, trackH: trackH };
  }

  function buildTopic(topic) {
    var sel = CS.get(), has = sel.length > 0;
    var L = layout(topic);
    var card = el('div', 'pos-topic');

    var name = el('div', 'pos-topic__name'); name.textContent = topic.name;
    var hint = el('div', 'pos-topic__hint');
    hint.textContent = 'Tryck på ett parti för att jämföra — håll pekaren över en nod för positionen.';
    card.appendChild(name); card.appendChild(hint);

    var track = el('div', 'pos-track');
    track.style.height = L.trackH + 'px';
    var line = el('div', 'pos-line'); line.style.top = (L.lineY - 1) + 'px'; track.appendChild(line);
    [['left', '0'], ['left', '50%'], ['right', '0']].forEach(function (pair) {
      var t = el('div', 'pos-tick'); t.style.top = (L.lineY - 5) + 'px'; t.style[pair[0]] = pair[1];
      if (pair[1] === '50%') t.style.marginLeft = '-1px';
      track.appendChild(t);
    });

    L.order.forEach(function (p) {
      var pd = topic.positions[p];
      var lane = L.laneOf[p] || 0;
      var top = L.lineY + lane * L.rowH;
      var dim = has && sel.indexOf(p) === -1;
      if (lane !== 0) {
        var stick = el('div', 'pos-stick');
        stick.style.left = pd.position + '%';
        stick.style.top = Math.min(top, L.lineY) + 'px';
        stick.style.height = Math.abs(top - L.lineY) + 'px';
        stick.style.opacity = dim ? 0.15 : 1;
        track.appendChild(stick);
      }
      var node = el('div', 'pos-node');
      node.setAttribute('data-party', p);
      node.textContent = p;
      node.style.left = pd.position + '%';
      node.style.top = top + 'px';
      node.style.width = NODE + 'px'; node.style.height = NODE + 'px';
      node.style.fontSize = Math.round(NODE * (p.length > 1 ? 0.27 : 0.31)) + 'px';
      node.style.background = V.partyColor(p);
      node.style.color = V.partyText(p);
      if (pd.unclear) node.classList.add('is-unclear');
      if (sel.indexOf(p) !== -1) node.classList.add('is-selected');
      if (dim) node.classList.add('is-dimmed');
      node.title = V.partyName(p) + ': ' + (pd.group || pd.summary) + (pd.unclear ? ' (otydlig/villkorad)' : '');
      node.addEventListener('click', function () { CS.toggle(p); });
      track.appendChild(node);
    });
    card.appendChild(track);

    var ends = el('div', 'pos-ends');
    ends.innerHTML = '<span></span><span></span>';
    ends.children[0].textContent = '← ' + topic.scale.low;
    ends.children[1].textContent = topic.scale.high + ' →';
    card.appendChild(ends);

    // citation cards for selected parties present in this topic
    var cardParties = L.order.filter(function (p) { return sel.indexOf(p) !== -1; });
    if (cardParties.length) {
      var grid = el('div', 'pos-cards');
      cardParties.forEach(function (p) {
        var pd = topic.positions[p];
        var c = el('div', 'pos-card');
        c.style.setProperty('--dc', V.partyColor(p));
        var head = el('div', 'pos-card__head');
        var dot = el('span', 'pos-card__dot'); dot.style.background = V.partyColor(p);
        var nm = el('span', 'pos-card__name'); nm.textContent = V.partyName(p);
        head.appendChild(dot); head.appendChild(nm);
        if (pd.unclear) { var b = el('span', 'pos-card__badge'); b.textContent = 'otydlig'; head.appendChild(b); }
        var txt = el('div', 'pos-card__text'); txt.textContent = pd.summary;
        c.appendChild(head); c.appendChild(txt);
        grid.appendChild(c);
      });
      card.appendChild(grid);
    }
    return card;
  }

  function renderTopics() {
    var area = areasById[areaId];
    topicHost.innerHTML = '';
    area.topics.forEach(function (t) { topicHost.appendChild(buildTopic(t)); });
  }

  function renderTabs() {
    tabHost.innerHTML = '';
    DATA.areas.forEach(function (a) {
      var b = el('button', 'area-tab');
      b.type = 'button'; b.textContent = a.name;
      b.classList.toggle('is-active', a.id === areaId);
      b.addEventListener('click', function () { setArea(a.id); });
      tabHost.appendChild(b);
    });
  }

  function areaStats(area) {
    var pos = 0, unclear = 0;
    area.topics.forEach(function (t) {
      partiesIn(t).forEach(function (p) { pos++; if (t.positions[p].unclear) unclear++; });
    });
    return { topics: area.topics.length, pos: pos, unclear: unclear };
  }

  function animStats() {
    var s = areaStats(areasById[areaId]);
    d.getElementById('pos-stat-area').textContent = areasById[areaId].name.toLowerCase();
    SH.countUp(d.getElementById('pos-stat-topics'), s.topics, 900);
    SH.countUp(d.getElementById('pos-stat-pos'), s.pos, 900);
    SH.countUp(d.getElementById('pos-stat-unclear'), s.unclear, 900);
  }

  function setArea(id) {
    areaId = id;
    SH.setHeaderTone(headerEl, id);
    renderTabs();
    renderTopics();
    animStats();
  }

  function init() {
    tabHost = d.getElementById('pos-area-tabs');
    topicHost = d.getElementById('pos-topics');
    headerEl = d.getElementById('pos-header');
    SH.renderChips(d.getElementById('pos-chips'));

    areasById = {};
    DATA.areas.forEach(function (a) { areasById[a.id] = a; });
    areaId = areasById['skola'] ? 'skola' : DATA.areas[0].id;

    setArea(areaId);
    CS.subscribe(renderTopics);   // selection change → re-render (dim + cards)

    var rt;
    w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(renderTopics, 150); });
  }

  function boot() {
    fetch('data/positions.json')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) { DATA = json; init(); })
      .catch(function (e) { console.error('Position: kunde inte ladda data/positions.json', e); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);
