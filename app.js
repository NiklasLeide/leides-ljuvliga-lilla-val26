'use strict';

let data = null;
let activeArea = null;
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
    renderAreaNav();
    renderSpectrum();
    setupViewTabs();
    window.addEventListener('scroll', hideTooltip, { passive: true });
  } catch (e) {
    document.getElementById('spectrum-container').innerHTML =
      '<p style="padding:16px;color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

/* ===================================================
   Area nav
   =================================================== */
function renderAreaNav() {
  const nav = document.getElementById('area-nav');
  nav.innerHTML = data.areas.map(area => `
    <button class="area-btn ${area.id === activeArea ? 'active' : ''}"
            data-area="${area.id}"
            style="--area-color: ${area.color}">
      ${area.name}
    </button>
  `).join('');

  nav.querySelectorAll('.area-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeArea = btn.dataset.area;
      nav.querySelectorAll('.area-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSpectrum();
    });
  });
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
      const { party, position, summary, unclear, row } = item;
      const top = row * 28;
      const safeSum = summary.replace(/"/g, '&quot;');
      return `<button class="party-dot${unclear ? ' unclear' : ''}"
        style="background:${party.color};left:${position}%;top:${top}px"
        data-name="${party.name}"
        data-summary="${safeSum}"
        aria-label="${party.name}: ${summary}">${party.abbr}</button>`;
    }).join('');

    return `
      <div class="topic-card">
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

  // Keep within viewport
  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
  tooltip.style.transform = 'translateY(-100%)';
}

/* ===================================================
   View tab switching (Spektrum / Kluster)
   =================================================== */
function setupViewTabs() {
  document.querySelectorAll('.tab[data-view]').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.disabled) return;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('view-' + tab.dataset.view).classList.add('active');
    });
  });
}

init();
