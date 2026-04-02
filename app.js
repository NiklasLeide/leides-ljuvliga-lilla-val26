'use strict';

let data = null;
let activeArea = null;
let selectedDot = null;
const tooltip = document.getElementById('tooltip');

/* ===================================================
   Bootstrap
   =================================================== */
async function init() {
  try {
    const res = await fetch('data/positions.json');
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
    activeArea = data.areas[0].id;
    renderLeftNav();
    renderSpectrum();
    setupViewTabs();
    document.querySelector('.app-center')?.addEventListener('scroll', hideTooltip, { passive: true });
  } catch (e) {
    document.getElementById('spectrum-container').innerHTML =
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
      renderLeftNav();
      renderSpectrum();
      hidePanel();
    });
    areaTabs.appendChild(btn);
  });
  nav.appendChild(areaTabs);

  // Divider
  const divider = document.createElement('div');
  divider.className = 'left-nav-divider';
  nav.appendChild(divider);

  // Topic list
  const topicList = document.createElement('div');
  topicList.className = 'left-topic-list';
  const area = data.areas.find(a => a.id === activeArea);
  area.topics.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'left-topic-btn';
    btn.textContent = topic.name;
    btn.dataset.topicId = topic.id;
    btn.addEventListener('click', () => scrollToTopic(topic.id, btn));
    topicList.appendChild(btn);
  });
  nav.appendChild(topicList);
}

function scrollToTopic(id, btn) {
  const card = document.getElementById('topic-' + id);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.left-topic-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

/* ===================================================
   Spectrum view
   =================================================== */
function renderSpectrum() {
  const area = data.areas.find(a => a.id === activeArea);
  const container = document.getElementById('spectrum-container');

  container.innerHTML = area.topics.map(topic => {
    const sorted = Object.entries(topic.positions)
      .map(([id, pos]) => ({ id, ...pos, party: data.parties[id] }))
      .sort((a, b) => a.position - b.position);

    const rows = assignRows(sorted, 8);
    const rowCount = Math.max(...rows.map(r => r.row)) + 1;
    const dotsHeight = rowCount * 28 + 4;

    const dots = rows.map(item => {
      const { id, party, position, summary, unclear, row } = item;
      const top = row * 28;
      const safeSum = summary.replace(/"/g, '&quot;');
      return `<button class="party-dot${unclear ? ' unclear' : ''}"
        style="background:${party.color};left:${position}%;top:${top}px"
        data-name="${party.name}"
        data-summary="${safeSum}"
        data-abbr="${id}"
        data-topic="${topic.id}"
        aria-label="${party.name}: ${summary}">${party.abbr}</button>`;
    }).join('');

    return `
      <div class="topic-card" id="topic-${topic.id}">
        <span class="topic-name">${topic.name}</span>
        <div class="scale-wrap">
          <div class="scale-labels">
            <span>${topic.scale.low}</span>
            <span>${topic.scale.high}</span>
          </div>
          <div class="scale-body" style="height:${dotsHeight}px">
            <div class="scale-track"></div>
            <div class="scale-dots" style="height:${dotsHeight}px">${dots}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.party-dot').forEach(dot => {
    dot.addEventListener('mouseenter', onDotEnter);
    dot.addEventListener('mouseleave', hideTooltip);
    dot.addEventListener('focus', onDotEnter);
    dot.addEventListener('blur', hideTooltip);
    dot.addEventListener('click', onDotClick);
  });
}

/* ===================================================
   Collision — assign vertical row per dot
   =================================================== */
function assignRows(sorted, threshold) {
  const result = sorted.map(p => ({ ...p, row: 0 }));
  for (let i = 1; i < result.length; i++) {
    const taken = {};
    for (let j = 0; j < i; j++) {
      if (Math.abs(result[i].position - result[j].position) < threshold) {
        taken[result[j].row] = true;
      }
    }
    let row = 0;
    while (taken[row]) row++;
    result[i].row = row;
  }
  return result;
}

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
   Detail panel (click)
   =================================================== */
function onDotClick(e) {
  const dot = e.currentTarget;
  const abbr    = dot.dataset.abbr;
  const topicId = dot.dataset.topic;
  const area    = data.areas.find(a => a.id === activeArea);
  const topic   = area.topics.find(t => t.id === topicId);
  const pos     = topic.positions[abbr];
  const party   = data.parties[abbr];

  if (selectedDot === dot && document.getElementById('detail-panel').classList.contains('visible')) {
    hidePanel();
    return;
  }
  selectedDot = dot;

  const panel = document.getElementById('detail-panel');
  let html = `<div class="panel-header">
    <span class="panel-dot" style="background:${party.color}"></span>
    <span class="panel-name">${party.name}</span>
    <button class="panel-close" aria-label="Stäng">×</button>
  </div>`;
  if (pos.unclear) html += `<div class="panel-unclear">Oklar ståndpunkt</div>`;
  html += `<p class="panel-topic-label">${topic.name}</p>
           <p class="panel-summary">${pos.summary}</p>
           <p class="panel-source">Källa: ${formatSource(pos.source)}</p>
           <p class="panel-method">Baserat på partiprogram, valmanifest och riksdagsmotioner — kontrollera mot originaldokumenten.</p>`;

  panel.innerHTML = html;
  panel.querySelector('.panel-close').addEventListener('click', hidePanel);

  if (!panel.classList.contains('visible')) {
    panel.style.display = 'block';
    panel.offsetHeight;
    panel.classList.add('visible');
  }
}

function hidePanel() {
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('visible');
  panel.addEventListener('transitionend', () => { panel.style.display = 'none'; }, { once: true });
  selectedDot = null;
}

/* ===================================================
   Tooltip
   =================================================== */
function onDotEnter(e) {
  const dot = e.currentTarget;
  tooltip.innerHTML = `<div class="tooltip-party">${dot.dataset.name}</div>${dot.dataset.summary}`;
  tooltip.hidden = false;
  placeTooltip(dot);
}

function hideTooltip() {
  tooltip.hidden = true;
}

function placeTooltip(dot) {
  const r = dot.getBoundingClientRect();
  const tw = tooltip.offsetWidth;
  let left = r.left + r.width / 2 + window.scrollX;
  let top  = r.top  + window.scrollY - 8;

  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
  tooltip.style.transform = 'translateY(-100%)';
}

/* ===================================================
   View tab switching
   =================================================== */
function setupViewTabs() {
  document.querySelectorAll('.tab[data-view]').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.view === 'cluster')      { location.href = 'kluster.html';      return; }
      if (tab.dataset.view === 'sager-vs-gor') { location.href = 'sager-vs-gor.html'; return; }
      if (tab.dataset.view === 'metod')        { location.href = 'metod.html';         return; }
    });
  });
}

init();
