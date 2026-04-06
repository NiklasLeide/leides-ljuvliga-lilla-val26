'use strict';

// ── State ──────────────────────────────────────────────────────────────────
let posData        = null;
let step           = 1;      // 1 | 2 | 3 | 'done'
let activeAreas    = new Set();
let areaWeights    = {};     // areaId → 1–10
let topicAnswers   = {};     // topicId → 0–100 (answered) | null (skipped)
let wizardTopics   = [];     // [{topic, area}] flat list for step 3
let qIndex         = 0;      // current question index
let mobileOpen     = false;  // mobile results panel expanded

// ── Bootstrap ──────────────────────────────────────────────────────────────
async function init() {
  try {
    const r = await fetch('data/positions.json');
    if (!r.ok) throw new Error(r.status);
    posData = await r.json();
    posData.areas.forEach(a => { activeAreas.add(a.id); areaWeights[a.id] = 5; });
    render();
    setupTabs();
  } catch (e) {
    document.getElementById('hp-center').innerHTML =
      '<p style="padding:16px;color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

// ── Orchestrator ───────────────────────────────────────────────────────────
function render() {
  renderLeft();
  renderCenter();
  renderRight();
}

// ── Left nav ───────────────────────────────────────────────────────────────
function renderLeft() {
  const nav = document.getElementById('left-nav');
  const labels = ['Välj områden', 'Vikta', 'Svara på frågor'];
  const states = labels.map((_, i) => {
    const s = i + 1;
    if (step === 'done' || s < step) return 'done';
    if (s === step) return 'active';
    return 'pending';
  });

  let html = '<ul class="hp-step-list">';
  labels.forEach((lbl, i) => {
    html += `<li class="hp-step-item ${states[i]}"><span class="hp-step-dot"></span>${i + 1}. ${esc(lbl)}</li>`;
  });
  html += '</ul>';

  if (step === 3 || step === 'done') {
    const total    = wizardTopics.length;
    const answered = Object.values(topicAnswers).filter(v => v !== null && v !== undefined).length;
    const pct      = total > 0 ? Math.round(answered / total * 100) : 0;
    html += `<div class="hp-progress-label">${answered} av ${total} frågor besvarade</div>
      <div class="hp-progress-track"><div class="hp-progress-fill" style="width:${pct}%"></div></div>`;

    if (hasAnyAnswer()) {
      html += `<button class="hp-mobile-toggle">${mobileOpen ? 'Dölj resultat ▴' : 'Visa resultat ▾'}</button>`;
    }
  }

  nav.innerHTML = html;
  nav.querySelector('.hp-mobile-toggle')?.addEventListener('click', () => {
    mobileOpen = !mobileOpen; renderRight();
    nav.querySelector('.hp-mobile-toggle').textContent = mobileOpen ? 'Dölj resultat ▴' : 'Visa resultat ▾';
  });
}

// ── Center dispatch ────────────────────────────────────────────────────────
function renderCenter() {
  const el = document.getElementById('hp-center');
  if      (step === 1)      renderStep1(el);
  else if (step === 2)      renderStep2(el);
  else if (step === 3)      renderStep3(el);
  else                      renderDone(el);
}

// ── Step 1 — area selection ────────────────────────────────────────────────
function renderStep1(el) {
  el.innerHTML = '';
  const wrap = el.appendChild(div('hp-screen'));
  heading(wrap, 'Välj sakområden');
  hint(wrap, 'Välj de politikområden som är viktigast för dig.');

  const grid = wrap.appendChild(div('hp-area-grid'));
  let nextBtn; // forward ref for checkbox change

  posData.areas.forEach(area => {
    const lbl = grid.appendChild(document.createElement('label'));
    lbl.className = 'hp-area-label';
    const cb = lbl.appendChild(document.createElement('input'));
    cb.type = 'checkbox';
    cb.checked = activeAreas.has(area.id);
    cb.addEventListener('change', () => {
      if (cb.checked) { activeAreas.add(area.id); if (!areaWeights[area.id]) areaWeights[area.id] = 5; }
      else            { activeAreas.delete(area.id); }
      nextBtn.disabled = activeAreas.size === 0;
    });
    lbl.append('\u00a0' + area.name);
  });

  const row = wrap.appendChild(div('hp-btn-row'));
  nextBtn = row.appendChild(document.createElement('button'));
  nextBtn.className = 'hp-btn-primary';
  nextBtn.textContent = 'Nästa →';
  nextBtn.disabled = activeAreas.size === 0;
  nextBtn.addEventListener('click', () => { step = 2; render(); });
}

// ── Step 2 — weight sliders ────────────────────────────────────────────────
function renderStep2(el) {
  el.innerHTML = '';
  const wrap = el.appendChild(div('hp-screen'));
  heading(wrap, 'Hur viktigt är varje område?');
  hint(wrap, 'Justera vikten — hög vikt ger området större påverkan på slutresultatet.');

  const section = wrap.appendChild(div('hp-weight-section'));
  posData.areas.filter(a => activeAreas.has(a.id)).forEach(area => {
    const item   = section.appendChild(div('hp-weight-item'));
    const hdr    = item.appendChild(div('hp-weight-header'));
    const name   = hdr.appendChild(document.createElement('span'));
    name.className = 'hp-weight-name';
    name.textContent = area.name;
    const valEl  = hdr.appendChild(document.createElement('span'));
    valEl.className = 'hp-weight-val';
    valEl.textContent = weightLabel(areaWeights[area.id] || 5);

    const dlId   = 'dlw-' + area.id;
    const slider = item.appendChild(document.createElement('input'));
    slider.type = 'range'; slider.min = 1; slider.max = 10; slider.step = 1;
    slider.value = areaWeights[area.id] || 5;
    slider.className = 'hp-slider';
    slider.setAttribute('list', dlId);
    slider.addEventListener('input', () => {
      areaWeights[area.id] = Number(slider.value);
      valEl.textContent = weightLabel(Number(slider.value));
    });

    const dl = item.appendChild(document.createElement('datalist'));
    dl.id = dlId;
    [1, 3, 5, 7, 10].forEach(v => { const o = document.createElement('option'); o.value = v; dl.appendChild(o); });

    const scl = item.appendChild(div('hp-weight-scale'));
    scl.innerHTML = '<span>Låg</span><span>Hög</span>';
  });

  const row  = wrap.appendChild(div('hp-btn-row'));
  const back = row.appendChild(document.createElement('button'));
  back.className = 'hp-btn-skip'; back.textContent = '← Tillbaka';
  back.addEventListener('click', () => { step = 1; render(); });
  const next = row.appendChild(document.createElement('button'));
  next.className = 'hp-btn-primary'; next.textContent = 'Nästa →';
  next.addEventListener('click', () => {
    topicAnswers = {};
    wizardTopics = [];
    posData.areas.filter(a => activeAreas.has(a.id)).forEach(area => {
      area.topics.forEach(topic => wizardTopics.push({ topic, area }));
    });
    qIndex = 0; step = 3; render();
  });
}

// ── Step 3 — one question at a time ───────────────────────────────────────
function renderStep3(el) {
  el.innerHTML = '';
  if (qIndex >= wizardTopics.length) { step = 'done'; renderDone(el); return; }

  const { topic, area } = wizardTopics[qIndex];
  const wrap = el.appendChild(div('hp-screen'));

  const chip = wrap.appendChild(document.createElement('span'));
  chip.className = 'hp-area-chip'; chip.textContent = area.name;

  const ctr = wrap.appendChild(document.createElement('div'));
  ctr.className = 'hp-q-counter';
  ctr.textContent = `Fråga ${qIndex + 1} av ${wizardTopics.length}`;

  const ttl = wrap.appendChild(document.createElement('h2'));
  ttl.className = 'hp-question-title'; ttl.textContent = topic.name;

  const dlId   = 'dlq-' + topic.id;
  const slider = wrap.appendChild(document.createElement('input'));
  slider.type = 'range'; slider.min = 0; slider.max = 100; slider.step = 10;
  slider.value = topicAnswers[topic.id] ?? 50;
  slider.className = 'hp-slider';
  slider.setAttribute('list', dlId);
  let touched = topic.id in topicAnswers && topicAnswers[topic.id] !== null;
  slider.addEventListener('input', () => {
    touched = true;
    topicAnswers[topic.id] = Number(slider.value);
    renderRight();
  });

  const dl = wrap.appendChild(document.createElement('datalist'));
  dl.id = dlId;
  for (let v = 0; v <= 100; v += 10) { const o = document.createElement('option'); o.value = v; dl.appendChild(o); }

  const scl = wrap.appendChild(div('hp-scale-labels'));
  scl.innerHTML = `<span>${esc(topic.scale.low)}</span><span>${esc(topic.scale.high)}</span>`;

  const row  = wrap.appendChild(div('hp-btn-row'));
  const skip = row.appendChild(document.createElement('button'));
  skip.className = 'hp-btn-skip'; skip.textContent = 'Hoppa över';
  skip.addEventListener('click', () => { topicAnswers[topic.id] = null; qIndex++; render(); });

  const next = row.appendChild(document.createElement('button'));
  next.className = 'hp-btn-primary';
  next.textContent = qIndex === wizardTopics.length - 1 ? 'Se resultat →' : 'Nästa →';
  next.addEventListener('click', () => {
    if (!touched) topicAnswers[topic.id] = Number(slider.value);
    qIndex++;
    if (qIndex >= wizardTopics.length) step = 'done';
    render();
  });
}

// ── Done screen ────────────────────────────────────────────────────────────
function renderDone(el) {
  el.innerHTML = '';
  const wrap = el.appendChild(div('hp-screen'));
  heading(wrap, 'Dina resultat');

  const results = wrap.appendChild(div('hp-done-results'));
  renderResultBars(results);

  const note = wrap.appendChild(div('hp-done-note'));
  note.innerHTML = 'Matchningen beräknas som viktat genomsnitt av ståndpunktsavstånd per sakfråga. Hoppade frågor räknas inte med. Ingen data sparas — allt beräknas i din webbläsare. <a href="metod.html">Läs om metoden →</a>';

  const row   = wrap.appendChild(div('hp-btn-row'));
  const reset = row.appendChild(document.createElement('button'));
  reset.className = 'hp-btn-skip'; reset.textContent = 'Gör om';
  reset.addEventListener('click', resetAll);
}

// ── Right column — live results ────────────────────────────────────────────
function renderRight() {
  const el = document.getElementById('hp-right');
  el.innerHTML = '';

  const content = el.appendChild(div('hp-live-content' + (mobileOpen ? ' open' : '')));
  if (!hasAnyAnswer()) {
    content.innerHTML = '<p class="hp-live-empty">Svara på frågor för att se resultat.</p>';
  } else {
    renderResultBars(content);
  }
}

function renderResultBars(container) {
  computeMatches().forEach(m => {
    const row = container.appendChild(div('hp-result-row'));
    row.innerHTML = `
      <div class="hp-result-header">
        <span class="hp-result-dot" style="background:${m.color}"></span>
        <span class="hp-result-name">${esc(m.name)}</span>
        <span class="hp-result-pct">${m.match}%</span>
      </div>
      <div class="hp-bar-wrap"><div class="hp-bar" style="width:${m.match}%;background:${m.color}"></div></div>`;
  });
}

// ── Calculation ────────────────────────────────────────────────────────────
function computeMatches() {
  const normW = getNormalizedWeights();
  return Object.entries(posData.parties).map(([abbr, party]) => {
    let score = 0, weight = 0;
    posData.areas.filter(a => activeAreas.has(a.id)).forEach(area => {
      const valid = area.topics.filter(t =>
        topicAnswers[t.id] !== null && topicAnswers[t.id] !== undefined &&
        t.positions?.[abbr] && !t.positions[abbr].unclear
      );
      if (!valid.length) return;
      const areaScore = valid.reduce((s, t) =>
        s + (1 - Math.abs(topicAnswers[t.id] - t.positions[abbr].position) / 100), 0) / valid.length;
      const w = normW[area.id] || 0;
      score  += w * areaScore;
      weight += w;
    });
    return { abbr, name: party.name, color: party.color, match: weight > 0 ? Math.round(score / weight * 100) : 0 };
  }).sort((a, b) => b.match - a.match);
}

function getNormalizedWeights() {
  const ids = [...activeAreas];
  const total = ids.reduce((s, id) => s + (areaWeights[id] || 5), 0);
  const out = {};
  ids.forEach(id => { out[id] = (areaWeights[id] || 5) / total; });
  return out;
}

function hasAnyAnswer() {
  return Object.values(topicAnswers).some(v => v !== null && v !== undefined);
}

// ── Reset ──────────────────────────────────────────────────────────────────
function resetAll() {
  step = 1; qIndex = 0; topicAnswers = {}; wizardTopics = []; mobileOpen = false;
  activeAreas = new Set(); areaWeights = {};
  posData.areas.forEach(a => { activeAreas.add(a.id); areaWeights[a.id] = 5; });
  render();
}

// ── Helpers ────────────────────────────────────────────────────────────────
function div(cls)         { const e = document.createElement('div'); e.className = cls; return e; }
function heading(p, txt)  { const e = p.appendChild(document.createElement('h2')); e.className = 'hp-screen-title'; e.textContent = txt; return e; }
function hint(p, txt)     { const e = p.appendChild(document.createElement('p')); e.className = 'hp-screen-hint'; e.textContent = txt; return e; }
function weightLabel(v)   { return v <= 2 ? 'Låg' : v <= 5 ? 'Normal' : v <= 8 ? 'Hög' : 'Mycket hög'; }
function esc(s)           { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ── Tab navigation ─────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelector('.tab[data-view="spectrum"]')    ?.addEventListener('click', () => { location.href = 'index.html'; });
  document.querySelector('.tab[data-view="cluster"]')     ?.addEventListener('click', () => { location.href = 'kluster.html'; });
  document.querySelector('.tab[data-view="sager-vs-gor"]')?.addEventListener('click', () => { location.href = 'sager-vs-gor.html'; });
  document.querySelector('.tab[data-view="gal-tan"]')     ?.addEventListener('click', () => { location.href = 'gal-tan.html'; });
  document.querySelector('.tab[data-view="metod"]')       ?.addEventListener('click', () => { location.href = 'metod.html'; });
}

init();
