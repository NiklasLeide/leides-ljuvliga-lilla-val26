'use strict';

/* ===================================================
   Source link formatter
   =================================================== */
function formatSource(text) {
  return text.split(' · ').map(entry => {
    const withDesc = entry.match(/^(.*?),\s*(https?:\/\/\S+)$/);
    if (withDesc) {
      const title = withDesc[1].trim()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<a href="${withDesc[2]}" target="_blank" rel="noopener noreferrer">${title}</a>`;
    }
    const bareUrl = entry.match(/^(https?:\/\/\S+)$/);
    if (bareUrl) {
      return `<a href="${bareUrl[1]}" target="_blank" rel="noopener noreferrer">${bareUrl[1]}</a>`;
    }
    return entry.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }).join(' · ');
}

/* ===================================================
   Constants
   =================================================== */
const SVG_W      = 560;
const SVG_H_DEF  = 280;   // default height when no topic is selected
const R          = 26;
const SPACING    = R * 2 + 12;  // 64px between circle centres

// Zone layout constants
const ZONE_HPAD    = 24;   // horizontal padding of zone rect from SVG edge
const ZONE_VPAD    = 14;   // vertical padding inside zone rect (above/below circles)
const ZONE_LABEL_H = 26;   // height reserved for the group label text
const ZONE_GAP     = 16;   // vertical gap between stacked zone rects

/* ===================================================
   State
   =================================================== */
let svgEl, data, activeTopic = null, selectedParty = null, activeArea = null;

/* ===================================================
   Bootstrap
   =================================================== */
function renderAreaAnalysis() {
  const area = data.areas.find(a => a.id === activeArea);
  const el = document.getElementById('area-analysis');
  if (!el) return;
  el.innerHTML = Array.isArray(area.analysis) && area.analysis.length
    ? `<ul class="area-analysis">${area.analysis.map(b => `<li>${b}</li>`).join('')}</ul>`
    : '';
}

async function init() {
  try {
    const res = await fetch('data/positions.json');
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
    activeArea = data.areas[0].id;
    renderLeftNav();
    renderSVG();
    renderAreaAnalysis();
    setupTabNav();
  } catch (e) {
    document.getElementById('cluster-center').innerHTML =
      '<p style="padding:16px;color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

/* ===================================================
   Left navigation
   =================================================== */
function renderLeftNav() {
  const nav = document.getElementById('left-nav');
  nav.innerHTML = '';

  // Area tabs
  const areaTabs = document.createElement('div');
  areaTabs.className = 'left-area-tabs';
  data.areas.forEach(area => {
    const btn = document.createElement('button');
    btn.className = 'left-area-btn' + (area.id === activeArea ? ' active' : '');
    btn.textContent = area.name;
    btn.addEventListener('click', () => {
      if (area.id === activeArea) return;
      activeArea = area.id;
      activeTopic = null;
      resetToDefault();
      hidePanel();
      renderAreaAnalysis();
      renderLeftNav();
    });
    areaTabs.appendChild(btn);
  });
  nav.appendChild(areaTabs);

  // Divider
  const divider = document.createElement('div');
  divider.className = 'left-nav-divider';
  nav.appendChild(divider);

  // Topic list for current area
  const topicList = document.createElement('div');
  topicList.className = 'left-topic-list';
  const area = data.areas.find(a => a.id === activeArea);
  area.topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'left-topic-btn' + (activeTopic === topic.id ? ' active' : '');
    btn.textContent = topic.name;
    btn.dataset.topicId = topic.id;
    btn.addEventListener('click', () => selectTopic(topic, btn));
    topicList.appendChild(btn);
  });
  nav.appendChild(topicList);
}

/* ===================================================
   SVG — initial render
   =================================================== */
function renderSVG() {
  const center = document.getElementById('cluster-center');
  center.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H_DEF}`);
  svg.setAttribute('class', 'cluster-svg');
  svg.setAttribute('aria-hidden', 'true');
  svgEl = svg;

  // Layer 1: zone backgrounds (rendered below party nodes)
  const zonesG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  zonesG.setAttribute('data-zones', '');
  svg.appendChild(zonesG);

  // Hint text
  const hint = mkSvgText(SVG_W / 2, SVG_H_DEF - 20,
    'Välj en fråga till vänster för att se partiernas grupperingar', 'cluster-hint');
  hint.setAttribute('data-hint', '');
  svg.appendChild(hint);

  // Party nodes (rendered above zones)
  defaultPositions(Object.keys(data.parties)).forEach(({ abbr, x, y }) => {
    const party = data.parties[abbr];
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'party-node');
    g.setAttribute('data-abbr', abbr);
    g.style.transform = `translate(${x}px, ${y}px)`;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', R);
    circle.setAttribute('fill', party.color);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dy', '0.35em');
    label.setAttribute('class', 'party-node-label');
    label.textContent = abbr;

    g.appendChild(circle);
    g.appendChild(label);
    g.addEventListener('click', () => showPanel(abbr));
    svg.appendChild(g);
  });

  center.appendChild(svg);
}

/* ===================================================
   Layout helper — default 4×2 grid
   =================================================== */
function defaultPositions(abbrs) {
  const cols = 4;
  const totalRows = Math.ceil(abbrs.length / cols);
  return abbrs.map((abbr, i) => ({
    abbr,
    x: SVG_W / 2 + (i % cols - (cols - 1) / 2) * SPACING,
    y: SVG_H_DEF / 2 + (Math.floor(i / cols) - (totalRows - 1) / 2) * SPACING,
  }));
}

/* ===================================================
   Select / deselect topic
   =================================================== */
function selectTopic(topic, clickedBtn) {
  if (activeTopic === topic.id) {
    activeTopic = null;
    document.querySelectorAll('.left-topic-btn').forEach(b => b.classList.remove('active'));
    resetToDefault();
    if (selectedParty) showPanel(selectedParty);
    return;
  }

  activeTopic = topic.id;
  document.querySelectorAll('.left-topic-btn').forEach(b => b.classList.remove('active'));
  clickedBtn.classList.add('active');

  // Build and sort groups by average member position
  const groupMap = new Map();
  Object.entries(topic.positions).forEach(([abbr, pos]) => {
    if (!groupMap.has(pos.group)) groupMap.set(pos.group, []);
    groupMap.get(pos.group).push({ abbr, position: pos.position, unclear: pos.unclear });
  });
  groupMap.forEach(members => members.sort((a, b) => a.position - b.position));

  const groups = [...groupMap.entries()]
    .map(([name, members]) => ({
      name, members,
      avg: members.reduce((s, m) => s + m.position, 0) / members.length,
    }))
    .sort((a, b) => a.avg - b.avg);

  applyGroupLayout(groups);

  svgEl.querySelector('[data-hint]').style.opacity = '0';
  if (selectedParty) showPanel(selectedParty);
}

/* ===================================================
   Group layout — vertical zones with animated party nodes
   =================================================== */
function applyGroupLayout(groups) {
  const zonesG = svgEl.querySelector('[data-zones]');
  zonesG.innerHTML = '';

  let y = ZONE_GAP;

  groups.forEach(({ name, members }) => {
    const n = members.length;
    const cols = n <= 3 ? n : Math.min(n, 4);
    const rows = Math.ceil(n / cols);
    const innerH = rows * (R * 2) + (rows - 1) * (SPACING - R * 2);
    const zoneH  = ZONE_VPAD + ZONE_LABEL_H + innerH + ZONE_VPAD;

    // Zone background rect
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', ZONE_HPAD);
    rect.setAttribute('y', y);
    rect.setAttribute('width', SVG_W - 2 * ZONE_HPAD);
    rect.setAttribute('height', zoneH);
    rect.setAttribute('rx', '12');
    rect.setAttribute('ry', '12');
    rect.setAttribute('fill', 'rgba(0,0,0,0.035)');
    zonesG.appendChild(rect);

    // Zone label (left-aligned, inside zone)
    const labelEl = mkSvgText(ZONE_HPAD + 14, y + ZONE_VPAD + 15, name, 'cluster-group-label');
    labelEl.setAttribute('text-anchor', 'start');
    zonesG.appendChild(labelEl);

    // Animate party nodes into zone
    members.forEach((member, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const rowCount = (row === rows - 1 && n % cols !== 0) ? n % cols : cols;
      const cx = SVG_W / 2 + (col - (rowCount - 1) / 2) * SPACING;
      const cy = y + ZONE_VPAD + ZONE_LABEL_H + row * SPACING + R;
      moveNode(member.abbr, cx, cy);

      // Update unclear visual state via CSS class
      const node = svgEl.querySelector(`[data-abbr="${member.abbr}"]`);
      if (node) node.classList.toggle('unclear', !!member.unclear);
    });

    y += zoneH + ZONE_GAP;
  });

  // Expand SVG viewBox to fit all zones
  svgEl.setAttribute('viewBox', `0 0 ${SVG_W} ${y}`);
}

function resetToDefault() {
  defaultPositions(Object.keys(data.parties)).forEach(({ abbr, x, y }) => {
    moveNode(abbr, x, y);
    const node = svgEl.querySelector(`[data-abbr="${abbr}"]`);
    if (node) node.classList.remove('unclear');
  });
  svgEl.querySelector('[data-zones]').innerHTML = '';
  svgEl.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H_DEF}`);
  svgEl.querySelector('[data-hint]').style.opacity = '1';
}

function moveNode(abbr, x, y) {
  const node = svgEl.querySelector(`[data-abbr="${abbr}"]`);
  if (node) node.style.transform = `translate(${x}px, ${y}px)`;
}

/* ===================================================
   Detail panel
   =================================================== */
function getActivePosition(abbr) {
  if (!activeTopic) return null;
  const area = data.areas.find(a => a.id === activeArea);
  if (!area) return null;
  const topic = area.topics.find(t => t.id === activeTopic);
  if (topic && topic.positions[abbr]) return { pos: topic.positions[abbr], topicName: topic.name };
  return null;
}

function showPanel(abbr) {
  selectedParty = abbr;
  const panel = document.getElementById('detail-panel');
  const party = data.parties[abbr];
  const hit   = getActivePosition(abbr);

  let html = `<div class="panel-header">
    <span class="panel-dot" style="background:${party.color}"></span>
    <span class="panel-name">${party.name}</span>
    <button class="panel-close" aria-label="Stäng">×</button>
  </div>`;

  if (hit) {
    const { pos, topicName } = hit;
    if (pos.unclear) html += `<div class="panel-unclear">Oklar ståndpunkt</div>`;
    html += `<p class="panel-topic-label">${topicName}</p>
             <p class="panel-summary">${pos.summary}</p>
             <p class="panel-source">Källa: ${formatSource(pos.source)}</p>`;
  } else {
    html += `<p class="panel-no-topic">Välj en fråga till vänster för att se ${party.name}s ståndpunkt.</p>`;
  }

  html += `<p class="panel-method">Baserat på partiprogram, valmanifest och riksdagsmotioner — kontrollera mot originaldokumenten.</p>`;

  panel.innerHTML = html;
  panel.querySelector('.panel-close').addEventListener('click', hidePanel);

  if (!panel.classList.contains('visible')) {
    panel.style.display = 'block';
    panel.offsetHeight;  // force reflow
    panel.classList.add('visible');
  }

  svgEl.querySelectorAll('.party-node').forEach(n => n.classList.remove('selected'));
  svgEl.querySelector(`[data-abbr="${abbr}"]`).classList.add('selected');
}

function hidePanel() {
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('visible');
  panel.addEventListener('transitionend', () => { panel.style.display = 'none'; }, { once: true });
  svgEl.querySelectorAll('.party-node').forEach(n => n.classList.remove('selected'));
  selectedParty = null;
}

/* ===================================================
   Tab nav
   =================================================== */
function setupTabNav() {
  document.querySelector('.tab[data-view="spectrum"]')
    .addEventListener('click', () => { location.href = 'index.html'; });
  document.querySelector('.tab[data-view="sager-vs-gor"]')
    .addEventListener('click', () => { location.href = 'sager-vs-gor.html'; });
  document.querySelector('.tab[data-view="gal-tan"]')
    .addEventListener('click', () => { location.href = 'gal-tan.html'; });
  document.querySelector('.tab[data-view="metod"]')
    .addEventListener('click', () => { location.href = 'metod.html'; });
}

/* ===================================================
   SVG helper
   =================================================== */
function mkSvgText(x, y, content, cls) {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('class', cls);
  t.textContent = content;
  return t;
}

init();
