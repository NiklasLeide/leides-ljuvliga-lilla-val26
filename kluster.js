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
const SVG_W   = 800;
const SVG_H   = 340;
const R       = 26;
const SPACING = R * 2 + 12;  // 64px between circle centres

const GROUP_MARGIN = 110;  // px from SVG edge to outermost group centre
const GROUP_Y      = 185;

/* ===================================================
   Layout helpers
   =================================================== */
// Default: 8 parties in a 4 × 2 grid, centred in SVG
function defaultPositions(abbrs) {
  const cols = 4;
  const totalRows = Math.ceil(abbrs.length / cols);
  return abbrs.map((abbr, i) => ({
    abbr,
    x: SVG_W / 2 + (i % cols - (cols - 1) / 2) * SPACING,
    y: SVG_H / 2 + (Math.floor(i / cols) - (totalRows - 1) / 2) * SPACING,
  }));
}

// Within-group: rows of up to 3, centred on group anchor
function groupLayout(n) {
  if (n === 0) return [];
  const cols = n <= 3 ? n : Math.ceil(n / 2);
  const rows = Math.ceil(n / cols);
  return Array.from({ length: n }, (_, i) => {
    const row    = Math.floor(i / cols);
    const col    = i % cols;
    const rowLen = (row === rows - 1 && n % cols !== 0) ? n % cols : cols;
    return {
      dx: (col - (rowLen - 1) / 2) * SPACING,
      dy: (row - (rows - 1) / 2) * SPACING,
    };
  });
}

/* ===================================================
   State
   =================================================== */
let svgEl, data, activeTopic = null, selectedParty = null;

/* ===================================================
   Bootstrap
   =================================================== */
async function init() {
  try {
    const res = await fetch('data/positions.json');
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
    renderTopicNav();
    renderSVG();
    setupTabNav();
  } catch (e) {
    document.getElementById('cluster-container').innerHTML =
      '<p style="padding:16px;color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

/* ===================================================
   Topic nav
   =================================================== */
function renderTopicNav() {
  const container = document.getElementById('cluster-container');
  const nav = document.createElement('div');
  nav.className = 'cluster-topic-nav';

  data.areas.forEach(area => {
    const label = document.createElement('div');
    label.className = 'cluster-area-label';
    label.textContent = area.name;
    nav.appendChild(label);

    area.topics.forEach(topic => {
      const btn = document.createElement('button');
      btn.className = 'cluster-topic-btn';
      btn.textContent = topic.name;
      btn.dataset.topicId = topic.id;
      btn.addEventListener('click', () => selectTopic(topic, btn));
      nav.appendChild(btn);
    });
  });

  container.appendChild(nav);
}

/* ===================================================
   SVG — initial render
   =================================================== */
function renderSVG() {
  const container = document.getElementById('cluster-container');

  // Layout wrapper
  const layout = document.createElement('div');
  layout.className = 'cluster-layout';

  const svgArea = document.createElement('div');
  svgArea.className = 'cluster-svg-area';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${SVG_W} ${SVG_H}`);
  svg.setAttribute('class', 'cluster-svg');
  svg.setAttribute('aria-hidden', 'true');
  svgEl = svg;

  // Container for dynamic group labels (populated per topic in selectTopic)
  const labelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelsG.setAttribute('data-group-labels', '');
  svg.appendChild(labelsG);

  // Hint
  const hint = mkSvgText(SVG_W / 2, SVG_H - 14,
    'Välj en fråga ovan för att se partiernas grupperingar', 'cluster-hint');
  hint.setAttribute('data-hint', '');
  svg.appendChild(hint);

  // Party nodes
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

  svgArea.appendChild(svg);

  // Detail panel (empty shell; JS populates on click)
  const panel = document.createElement('div');
  panel.id = 'detail-panel';
  panel.setAttribute('aria-live', 'polite');

  layout.appendChild(svgArea);
  layout.appendChild(panel);
  container.appendChild(layout);
}

/* ===================================================
   Select / deselect topic
   =================================================== */
function selectTopic(topic, clickedBtn) {
  if (activeTopic === topic.id) {
    activeTopic = null;
    document.querySelectorAll('.cluster-topic-btn').forEach(b => b.classList.remove('active'));
    resetToDefault();
    if (selectedParty) showPanel(selectedParty);  // refresh panel without topic
    return;
  }

  activeTopic = topic.id;
  document.querySelectorAll('.cluster-topic-btn').forEach(b => b.classList.remove('active'));
  clickedBtn.classList.add('active');

  // Derive groups dynamically — any string value in pos.group is valid
  const groupMap = new Map();
  Object.entries(topic.positions).forEach(([abbr, pos]) => {
    if (!groupMap.has(pos.group)) groupMap.set(pos.group, []);
    groupMap.get(pos.group).push({ abbr, position: pos.position });
  });
  groupMap.forEach(members => members.sort((a, b) => a.position - b.position));

  // Order groups left-to-right by average member position
  const groups = [...groupMap.entries()]
    .map(([name, members]) => ({
      name, members,
      avg: members.reduce((s, m) => s + m.position, 0) / members.length,
    }))
    .sort((a, b) => a.avg - b.avg);

  // Spread groups evenly across SVG width
  const step = groups.length > 1 ? (SVG_W - 2 * GROUP_MARGIN) / (groups.length - 1) : 0;
  const groupX = Object.fromEntries(
    groups.map((g, i) => [g.name, groups.length === 1 ? SVG_W / 2 : GROUP_MARGIN + i * step])
  );

  groups.forEach(({ name, members }) => {
    const offsets = groupLayout(members.length);
    members.forEach(({ abbr }, i) =>
      moveNode(abbr, groupX[name] + offsets[i].dx, GROUP_Y + offsets[i].dy));
  });

  renderGroupLabels(groups, groupX);
  svgEl.querySelector('[data-hint]').style.opacity = '0';
  if (selectedParty) showPanel(selectedParty);  // refresh panel with new topic
}

function resetToDefault() {
  defaultPositions(Object.keys(data.parties)).forEach(({ abbr, x, y }) => moveNode(abbr, x, y));
  svgEl.querySelector('[data-group-labels]').innerHTML = '';
  svgEl.querySelector('[data-hint]').style.opacity = '1';
}

function renderGroupLabels(groups, groupX) {
  const container = svgEl.querySelector('[data-group-labels]');
  container.innerHTML = '';
  groups.forEach(({ name }) => container.appendChild(mkSvgText(groupX[name], 28, name, 'cluster-group-label')));
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
  for (const area of data.areas) {
    const topic = area.topics.find(t => t.id === activeTopic);
    if (topic && topic.positions[abbr]) return { pos: topic.positions[abbr], topicName: topic.name };
  }
  return null;
}

function showPanel(abbr) {
  selectedParty = abbr;
  const panel   = document.getElementById('detail-panel');
  const party   = data.parties[abbr];
  const hit     = getActivePosition(abbr);

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
    html += `<p class="panel-no-topic">Välj en fråga ovan för att se ${party.name}s ståndpunkt.</p>`;
  }

  html += `<p class="panel-method">Baserat på partiprogram, valmanifest och riksdagsmotioner — kontrollera mot originaldokumenten.</p>`;

  panel.innerHTML = html;
  panel.querySelector('.panel-close').addEventListener('click', hidePanel);

  if (!panel.classList.contains('visible')) {
    panel.style.display = 'block';
    panel.offsetHeight;  // force reflow so transition fires
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
