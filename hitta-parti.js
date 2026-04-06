'use strict';

let posData = null;
let activeAreas = new Set();   // area IDs
let areaWeights = {};           // areaId → 1–10
let topicPositions = {};        // topicId → 0–100
let selectedParty = null;
const stepsOpen = { 1: true, 2: true, 3: true };

/* ===================================================
   Bootstrap
   =================================================== */
async function init() {
  try {
    const r = await fetch('data/positions.json');
    if (!r.ok) throw new Error(r.status);
    posData = await r.json();
    posData.areas.forEach(a => {
      activeAreas.add(a.id);
      areaWeights[a.id] = 5;
      a.topics.forEach(t => { topicPositions[t.id] = 50; });
    });
    renderSteps();
    renderResults();
    setupTabs();
  } catch (e) {
    document.getElementById('hp-results').innerHTML =
      '<p style="padding:16px;color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

/* ===================================================
   Left nav — 3 collapsible steps
   =================================================== */
function renderSteps() {
  const nav = document.getElementById('left-nav');
  nav.innerHTML = '';
  nav.appendChild(buildStep(1, 'Välj områden', renderStep1));
  nav.appendChild(buildStep(2, 'Sätt vikt', renderStep2));
  nav.appendChild(buildStep(3, 'Din position', renderStep3));
}

function buildStep(num, title, bodyFn) {
  const open = stepsOpen[num];
  const wrap = document.createElement('div');
  wrap.className = 'hp-step' + (open ? ' open' : '');

  const hdr = document.createElement('button');
  hdr.className = 'hp-step-header';
  hdr.innerHTML =
    `<span class="hp-step-num">${num}</span>` +
    `<span class="hp-step-title">${title}</span>` +
    `<span class="hp-step-chevron">${open ? '▾' : '▸'}</span>`;
  hdr.addEventListener('click', () => { stepsOpen[num] = !stepsOpen[num]; renderSteps(); });
  wrap.appendChild(hdr);

  const body = document.createElement('div');
  body.className = 'hp-step-body';
  if (open) bodyFn(body);
  wrap.appendChild(body);
  return wrap;
}

function renderStep1(body) {
  posData.areas.forEach(area => {
    const lbl = document.createElement('label');
    lbl.className = 'hp-area-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = activeAreas.has(area.id);
    cb.addEventListener('change', () => {
      if (cb.checked) { activeAreas.add(area.id); if (!areaWeights[area.id]) areaWeights[area.id] = 5; }
      else             { activeAreas.delete(area.id); }
      renderSteps();
      renderResults();
    });
    lbl.appendChild(cb);
    lbl.append('\u00a0' + area.name);
    body.appendChild(lbl);
  });
}

function renderStep2(body) {
  if (activeAreas.size === 0) {
    body.innerHTML = '<p class="hp-hint">Välj minst ett område i Steg 1.</p>';
    return;
  }
  posData.areas.filter(a => activeAreas.has(a.id)).forEach(area => {
    const normW = getNormalizedWeights();
    const row = document.createElement('div');
    row.className = 'hp-weight-row';

    const top = document.createElement('div');
    top.className = 'hp-weight-top';
    const pctSpan = document.createElement('span');
    pctSpan.className = 'hp-weight-pct';
    pctSpan.dataset.areaId = area.id;
    pctSpan.textContent = Math.round((normW[area.id] || 0) * 100) + '%';
    top.innerHTML = `<span class="hp-weight-label">${esc(area.name)}</span>`;
    top.appendChild(pctSpan);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 1; slider.max = 10;
    slider.value = areaWeights[area.id] || 5;
    slider.className = 'hp-slider';
    slider.addEventListener('input', () => {
      areaWeights[area.id] = Number(slider.value);
      updateWeightPcts();
      renderResults();
    });

    row.appendChild(top);
    row.appendChild(slider);
    body.appendChild(row);
  });
}

function updateWeightPcts() {
  const normW = getNormalizedWeights();
  document.querySelectorAll('.hp-weight-pct[data-area-id]').forEach(el => {
    el.textContent = Math.round((normW[el.dataset.areaId] || 0) * 100) + '%';
  });
}

function renderStep3(body) {
  if (activeAreas.size === 0) {
    body.innerHTML = '<p class="hp-hint">Välj minst ett område i Steg 1.</p>';
    return;
  }
  posData.areas.filter(a => activeAreas.has(a.id)).forEach(area => {
    const aHdr = document.createElement('div');
    aHdr.className = 'hp-area-header';
    aHdr.textContent = area.name;
    body.appendChild(aHdr);

    area.topics.forEach(topic => {
      const row = document.createElement('div');
      row.className = 'hp-topic-row';

      const lbl = document.createElement('div');
      lbl.className = 'hp-topic-label';
      lbl.textContent = topic.name;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = 0; slider.max = 100;
      slider.value = topicPositions[topic.id] ?? 50;
      slider.className = 'hp-slider';
      slider.addEventListener('input', () => {
        topicPositions[topic.id] = Number(slider.value);
        renderResults();
      });

      const scales = document.createElement('div');
      scales.className = 'hp-scale-labels';
      scales.innerHTML = `<span>${esc(topic.scale.low)}</span><span>${esc(topic.scale.high)}</span>`;

      row.appendChild(lbl);
      row.appendChild(slider);
      row.appendChild(scales);
      body.appendChild(row);
    });
  });
}

/* ===================================================
   Match calculation
   =================================================== */
function getNormalizedWeights() {
  const ids = [...activeAreas];
  const total = ids.reduce((s, id) => s + (areaWeights[id] || 5), 0);
  const out = {};
  ids.forEach(id => { out[id] = (areaWeights[id] || 5) / total; });
  return out;
}

function computeMatches() {
  if (activeAreas.size === 0) return [];
  const normW = getNormalizedWeights();

  return Object.entries(posData.parties).map(([abbr, party]) => {
    let totalScore = 0;
    const areaBreakdown = {};

    posData.areas.filter(a => activeAreas.has(a.id)).forEach(area => {
      const valid = area.topics.filter(t => t.positions?.[abbr] && !t.positions[abbr].unclear);
      if (!valid.length) { areaBreakdown[area.id] = null; return; }

      const topics = valid.map(t => {
        const userPos = topicPositions[t.id] ?? 50;
        const partyPos = t.positions[abbr].position;
        const score = 1 - Math.abs(userPos - partyPos) / 100;
        return { id: t.id, name: t.name, userPos, partyPos, score };
      });
      const areaScore = topics.reduce((s, t) => s + t.score, 0) / topics.length;
      areaBreakdown[area.id] = { score: areaScore, topics };
      totalScore += normW[area.id] * areaScore;
    });

    return { abbr, name: party.name, color: party.color,
             match: Math.round(totalScore * 100), areaBreakdown };
  }).sort((a, b) => b.match - a.match);
}

/* ===================================================
   Results
   =================================================== */
function renderResults() {
  const container = document.getElementById('hp-results');
  const matches = computeMatches();

  if (!matches.length) {
    container.innerHTML = '<p class="hp-hint" style="padding:var(--space-lg) 0">Välj ett eller flera områden i Steg 1 för att se matchningar.</p>';
    return;
  }

  container.innerHTML = '';
  matches.forEach(m => {
    const row = document.createElement('div');
    row.className = 'hp-result-row' + (selectedParty === m.abbr ? ' selected' : '');
    row.addEventListener('click', () => {
      if (selectedParty === m.abbr) { selectedParty = null; hideDetail(); renderResults(); }
      else { selectedParty = m.abbr; showDetail(m, true); renderResults(); }
    });
    row.innerHTML = `
      <div class="hp-result-header">
        <span class="hp-result-dot" style="background:${m.color}"></span>
        <span class="hp-result-name">${esc(m.name)}</span>
        <span class="hp-result-pct">${m.match}%</span>
      </div>
      <div class="hp-bar-wrap">
        <div class="hp-bar" style="width:${m.match}%;background:${m.color}"></div>
      </div>`;
    container.appendChild(row);
  });

  // Keep detail panel fresh while sliders move
  if (selectedParty) {
    const current = matches.find(x => x.abbr === selectedParty);
    if (current) showDetail(current, false);
  }
}

/* ===================================================
   Detail panel
   =================================================== */
function showDetail(m, animate) {
  const panel = document.getElementById('detail-panel');
  const normW = getNormalizedWeights();

  let html = `
    <div class="panel-header">
      <span class="panel-dot" style="background:${m.color}"></span>
      <span class="panel-name">${esc(m.name)}</span>
      <button class="panel-close" aria-label="Stäng">×</button>
    </div>
    <div class="panel-topic-label">Matchning totalt: ${m.match}%</div>
    <div class="panel-topic-label" style="margin-top:var(--space-md)">Per område</div>`;

  posData.areas.filter(a => activeAreas.has(a.id)).forEach(area => {
    const bd = m.areaBreakdown[area.id];
    const wPct = Math.round((normW[area.id] || 0) * 100);
    if (!bd) {
      html += `<div class="hp-detail-area"><div class="hp-detail-area-hdr"><strong>${esc(area.name)}</strong><span class="hp-detail-pct hp-detail-na">—</span></div></div>`;
      return;
    }
    const areaPct = Math.round(bd.score * 100);
    html += `<div class="hp-detail-area">
      <div class="hp-detail-area-hdr">
        <strong>${esc(area.name)}</strong>
        <span class="hp-detail-pct">${areaPct}% <span class="hp-detail-weight">(vikt ${wPct}%)</span></span>
      </div>`;
    bd.topics.forEach(t => {
      const diff = t.userPos - t.partyPos;
      const dir = diff > 8 ? '← Du' : diff < -8 ? 'Partiet →' : '≈';
      const cls = diff > 8 ? 'hp-dir-left' : diff < -8 ? 'hp-dir-right' : 'hp-dir-same';
      html += `<div class="hp-detail-topic">
        <span class="hp-detail-topic-name">${esc(t.name)}</span>
        <span class="hp-dir ${cls}">${dir}</span>
      </div>`;
    });
    html += `</div>`;
  });

  html += `<div class="panel-method"><a href="index.html">Öppna Spektrum-vyn</a> för partiernas fullständiga positioner.</div>`;

  panel.style.display = 'block';
  panel.innerHTML = html;
  panel.querySelector('.panel-close').addEventListener('click', () => {
    selectedParty = null; hideDetail(); renderResults();
  });
  if (animate) requestAnimationFrame(() => panel.classList.add('visible'));
  else panel.classList.add('visible');
}

function hideDetail() {
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('visible');
  setTimeout(() => { panel.style.display = 'none'; }, 220);
}

/* ===================================================
   Tab navigation
   =================================================== */
function setupTabs() {
  document.querySelector('.tab[data-view="spectrum"]')?.addEventListener('click', () => { location.href = 'index.html'; });
  document.querySelector('.tab[data-view="cluster"]')?.addEventListener('click', () => { location.href = 'kluster.html'; });
  document.querySelector('.tab[data-view="sager-vs-gor"]')?.addEventListener('click', () => { location.href = 'sager-vs-gor.html'; });
  document.querySelector('.tab[data-view="gal-tan"]')?.addEventListener('click', () => { location.href = 'gal-tan.html'; });
  document.querySelector('.tab[data-view="metod"]')?.addEventListener('click', () => { location.href = 'metod.html'; });
}

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
