'use strict';

let data = null;
let activeYears = [2018, 2022, 2026];
let selectedParty = null;

const YEARS = [2018, 2022, 2026];

// Dot sizes scale with plot width. Reference is 560px desktop.
function yearStyle(W) {
  const s = Math.min(1, W / 560);
  return {
    2018: { r: Math.max(4,  Math.round(6  * s)), opacity: 0.35 },
    2022: { r: Math.max(6,  Math.round(9  * s)), opacity: 0.60 },
    2026: { r: Math.max(10, Math.round(16 * s)), opacity: 1.0  },
  };
}

/* ===================================================
   Bootstrap
   =================================================== */
async function init() {
  try {
    const res = await fetch('data/gal-tan.json');
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
    renderLeftNav();
    renderPlot();
    setupTabs();
  } catch (e) {
    document.getElementById('gal-tan-container').innerHTML =
      '<p style="padding:16px;color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

/* ===================================================
   Left navigation — year toggles + party toggles
   =================================================== */
function renderLeftNav() {
  const nav = document.getElementById('left-nav');
  nav.innerHTML = '';

  // Year section
  const yearLabel = document.createElement('div');
  yearLabel.className = 'gt-section-label';
  yearLabel.textContent = 'År';
  nav.appendChild(yearLabel);

  const yearGroup = document.createElement('div');
  yearGroup.className = 'gt-toggle-group';

  // "All years" button
  const allBtn = document.createElement('button');
  allBtn.className = 'gt-toggle-btn' + (activeYears.length === 3 ? ' active' : '');
  allBtn.textContent = 'Alla år';
  allBtn.addEventListener('click', () => {
    activeYears = [2018, 2022, 2026];
    renderLeftNav();
    renderPlot();
  });
  yearGroup.appendChild(allBtn);

  YEARS.forEach(yr => {
    const btn = document.createElement('button');
    btn.className = 'gt-toggle-btn' + (activeYears.length === 1 && activeYears[0] === yr ? ' active' : '');
    btn.textContent = yr;
    btn.addEventListener('click', () => {
      activeYears = [yr];
      renderLeftNav();
      renderPlot();
    });
    yearGroup.appendChild(btn);
  });
  nav.appendChild(yearGroup);

  // Divider
  const div1 = document.createElement('div');
  div1.className = 'left-nav-divider';
  nav.appendChild(div1);

  // Party section
  const partyLabel = document.createElement('div');
  partyLabel.className = 'gt-section-label';
  partyLabel.textContent = 'Partier';
  nav.appendChild(partyLabel);

  const partyGrid = document.createElement('div');
  partyGrid.className = 'gt-party-grid';

  Object.entries(data.parties).forEach(([abbr, party]) => {
    const btn = document.createElement('button');
    btn.className = 'gt-party-btn';
    btn.style.background = party.color;
    btn.title = party.name;
    btn.textContent = abbr;
    btn.addEventListener('click', () => {
      if (selectedParty === abbr) {
        selectedParty = null;
        hidePanel();
      } else {
        selectedParty = abbr;
        showPanel(abbr);
      }
      renderLeftNav();
      renderPlot();
    });
    partyGrid.appendChild(btn);
  });
  nav.appendChild(partyGrid);

  // Divider
  const div2 = document.createElement('div');
  div2.className = 'left-nav-divider';
  nav.appendChild(div2);

  // Legend
  const legendLabel = document.createElement('div');
  legendLabel.className = 'gt-section-label';
  legendLabel.textContent = 'Förklaring';
  nav.appendChild(legendLabel);

  const legend = document.createElement('div');
  legend.className = 'gt-legend';
  legend.innerHTML = `
    <div class="gt-legend-row"><span class="gt-legend-dot" style="width:12px;height:12px;opacity:0.35"></span>2018</div>
    <div class="gt-legend-row"><span class="gt-legend-dot" style="width:18px;height:18px;opacity:0.60"></span>2022</div>
    <div class="gt-legend-row"><span class="gt-legend-dot" style="width:32px;height:32px;opacity:1"></span>2026</div>
  `;
  nav.appendChild(legend);
}

/* ===================================================
   Scatter plot (SVG)
   =================================================== */
function renderPlot() {
  const container = document.getElementById('gal-tan-container');
  container.innerHTML = '';

  // Intro
  const intro = document.createElement('p');
  intro.className = 'gt-intro';
  intro.innerHTML = 'Partiernas positioner på <strong>ekonomisk höger-vänsterskala</strong> (x) och <strong>GAL-TAN-skala</strong> (y) för valen 2018, 2022 och 2026. Klicka på ett parti för mer info.';
  container.appendChild(intro);

  // SVG wrapper
  const wrap = document.createElement('div');
  wrap.className = 'gt-plot-wrap';
  container.appendChild(wrap);

  const W = wrap.clientWidth || 560;
  const H = Math.round(W * 0.85);
  const YEAR_STYLE = yearStyle(W);
  const PAD = { top: 32, right: 32, bottom: 48, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('class', 'gt-svg');
  wrap.appendChild(svg);

  // Background click deselects
  svg.addEventListener('click', () => {
    if (selectedParty) {
      selectedParty = null;
      hidePanel();
      renderPlot();
    }
  });

  // Helpers — map data coords (0–10) to SVG pixels
  function px(econVal) { return PAD.left + (econVal / 10) * innerW; }
  function py(galVal)  { return PAD.top  + (galVal / 10) * innerH; }

  // Background quadrant shading
  const quads = [
    { x: 0, y: 0, w: 0.5, h: 0.5, label: 'V/GAL', color: '#f0fdf4' },
    { x: 0.5, y: 0, w: 0.5, h: 0.5, label: 'H/GAL', color: '#eff6ff' },
    { x: 0, y: 0.5, w: 0.5, h: 0.5, label: 'V/TAN', color: '#fef9c3' },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5, label: 'H/TAN', color: '#fef2f2' },
  ];
  quads.forEach(q => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', PAD.left + q.x * innerW);
    rect.setAttribute('y', PAD.top  + q.y * innerH);
    rect.setAttribute('width',  q.w * innerW);
    rect.setAttribute('height', q.h * innerH);
    rect.setAttribute('fill', q.color);
    svg.appendChild(rect);
  });

  // Grid lines
  [2, 4, 6, 8].forEach(v => {
    const xLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xLine.setAttribute('x1', px(v)); xLine.setAttribute('x2', px(v));
    xLine.setAttribute('y1', PAD.top); xLine.setAttribute('y2', PAD.top + innerH);
    xLine.setAttribute('stroke', '#ddd9d0'); xLine.setAttribute('stroke-width', '1');
    xLine.setAttribute('stroke-dasharray', '3 4');
    svg.appendChild(xLine);

    const yLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yLine.setAttribute('x1', PAD.left); yLine.setAttribute('x2', PAD.left + innerW);
    yLine.setAttribute('y1', py(v));    yLine.setAttribute('y2', py(v));
    yLine.setAttribute('stroke', '#ddd9d0'); yLine.setAttribute('stroke-width', '1');
    yLine.setAttribute('stroke-dasharray', '3 4');
    svg.appendChild(yLine);
  });

  // Center dashed lines (x=5, y=5)
  const cx = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  cx.setAttribute('x1', px(5)); cx.setAttribute('x2', px(5));
  cx.setAttribute('y1', PAD.top); cx.setAttribute('y2', PAD.top + innerH);
  cx.setAttribute('stroke', '#bbb'); cx.setAttribute('stroke-width', '1.5');
  cx.setAttribute('stroke-dasharray', '5 4');
  svg.appendChild(cx);

  const cy = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  cy.setAttribute('x1', PAD.left); cy.setAttribute('x2', PAD.left + innerW);
  cy.setAttribute('y1', py(5));    cy.setAttribute('y2', py(5));
  cy.setAttribute('stroke', '#bbb'); cy.setAttribute('stroke-width', '1.5');
  cy.setAttribute('stroke-dasharray', '5 4');
  svg.appendChild(cy);

  // Quadrant corner labels
  const qLabels = [
    { text: 'Vänster / GAL', x: PAD.left + 8, y: PAD.top + 14, anchor: 'start' },
    { text: 'Höger / GAL',   x: PAD.left + innerW - 8, y: PAD.top + 14, anchor: 'end' },
    { text: 'Vänster / TAN', x: PAD.left + 8, y: PAD.top + innerH - 8, anchor: 'start' },
    { text: 'Höger / TAN',   x: PAD.left + innerW - 8, y: PAD.top + innerH - 8, anchor: 'end' },
  ];
  qLabels.forEach(l => {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', l.x); t.setAttribute('y', l.y);
    t.setAttribute('text-anchor', l.anchor);
    t.setAttribute('font-family', 'DM Sans, sans-serif');
    t.setAttribute('font-size', '10');
    t.setAttribute('fill', '#bbb');
    t.textContent = l.text;
    svg.appendChild(t);
  });

  // Axis labels
  const axisStyle = { fontFamily: 'DM Sans, sans-serif', fontSize: '11', fill: '#999' };

  // X axis: Vänster — Höger
  const xLow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLow.setAttribute('x', PAD.left); xLow.setAttribute('y', PAD.top + innerH + 36);
  xLow.setAttribute('text-anchor', 'start');
  Object.entries(axisStyle).forEach(([k, v]) => xLow.setAttribute(k.replace(/([A-Z])/g, '-$1').toLowerCase(), v));
  xLow.textContent = '← Ekonomisk vänster';
  svg.appendChild(xLow);

  const xHigh = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xHigh.setAttribute('x', PAD.left + innerW); xHigh.setAttribute('y', PAD.top + innerH + 36);
  xHigh.setAttribute('text-anchor', 'end');
  Object.entries(axisStyle).forEach(([k, v]) => xHigh.setAttribute(k.replace(/([A-Z])/g, '-$1').toLowerCase(), v));
  xHigh.textContent = 'Ekonomisk höger →';
  svg.appendChild(xHigh);

  // Y axis: GAL — TAN
  const yLow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLow.setAttribute('x', PAD.left - 8); yLow.setAttribute('y', PAD.top + 4);
  yLow.setAttribute('text-anchor', 'end');
  Object.entries(axisStyle).forEach(([k, v]) => yLow.setAttribute(k.replace(/([A-Z])/g, '-$1').toLowerCase(), v));
  yLow.textContent = 'GAL ↑';
  svg.appendChild(yLow);

  const yHigh = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yHigh.setAttribute('x', PAD.left - 8); yHigh.setAttribute('y', PAD.top + innerH);
  yHigh.setAttribute('text-anchor', 'end');
  Object.entries(axisStyle).forEach(([k, v]) => yHigh.setAttribute(k.replace(/([A-Z])/g, '-$1').toLowerCase(), v));
  yHigh.textContent = 'TAN ↓';
  svg.appendChild(yHigh);

  // Plot each party — selected party drawn last for correct z-order
  const sortedParties = Object.entries(data.positions)
    .sort(([a], [b]) => (a === selectedParty ? 1 : b === selectedParty ? -1 : 0));

  sortedParties.forEach(([abbr, allPoints]) => {
    const party = data.parties[abbr];
    const color = party.color;
    const isSelected = selectedParty === abbr;
    const isDimmed = selectedParty !== null && !isSelected;

    // Selected party always shows all three years regardless of year filter
    const visiblePoints = isSelected
      ? [...allPoints].sort((a, b) => a.year - b.year)
      : allPoints.filter(p => activeYears.includes(p.year)).sort((a, b) => a.year - b.year);
    if (visiblePoints.length === 0) return;

    // All selected-party dots shrink to the 2018 dot radius (equal size)
    const selectedR = YEAR_STYLE[2018].r;

    // Outer group — entire trail (lines + dots) is clickable
    const trailG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    trailG.style.cursor = 'pointer';
    if (isDimmed) trailG.setAttribute('opacity', '0.15');

    trailG.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedParty === abbr) {
        selectedParty = null;
        hidePanel();
      } else {
        selectedParty = abbr;
        showPanel(abbr);
      }
      renderPlot();
    });

    // Movement lines
    if (visiblePoints.length > 1) {
      for (let i = 0; i < visiblePoints.length - 1; i++) {
        const a = visiblePoints[i], b = visiblePoints[i + 1];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', px(a.econ)); line.setAttribute('y1', py(a.gal));
        line.setAttribute('x2', px(b.econ)); line.setAttribute('y2', py(b.gal));
        line.setAttribute('stroke', color);
        if (isSelected) {
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-opacity', '1');
        } else {
          line.setAttribute('stroke-width', '1.5');
          line.setAttribute('stroke-opacity', '0.35');
          line.setAttribute('stroke-dasharray', '3 3');
        }
        trailG.appendChild(line);
      }
    }

    // Dots
    visiblePoints.forEach(point => {
      const isLatest = point.year === 2026;
      const style = YEAR_STYLE[point.year];
      const dotR = isSelected ? selectedR : style.r;
      const dotOpacity = isSelected ? 1.0 : style.opacity;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', px(point.econ));
      circle.setAttribute('cy', py(point.gal));
      circle.setAttribute('r', dotR);
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', dotOpacity);
      circle.setAttribute('stroke', 'rgba(255,255,255,0.8)');
      circle.setAttribute('stroke-width', isSelected ? '1.5' : isLatest ? '2' : '1.5');
      trailG.appendChild(circle);

      // Tooltip on hover
      circle.addEventListener('mouseenter', (e) => showTooltip(e, abbr, point));
      circle.addEventListener('mouseleave', hideTooltip);

      // Abbreviation label inside 2026 dot — only when not selected
      if (isLatest && !isSelected) {
        const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lbl.setAttribute('x', px(point.econ));
        lbl.setAttribute('y', py(point.gal) + 4);
        lbl.setAttribute('text-anchor', 'middle');
        lbl.setAttribute('font-family', 'DM Sans, sans-serif');
        const r26 = YEAR_STYLE[2026].r;
        lbl.setAttribute('font-size', abbr.length > 2 ? Math.max(6, r26 - 4) : Math.max(7, r26 - 2));
        lbl.setAttribute('font-weight', '700');
        lbl.setAttribute('fill', '#fff');
        lbl.setAttribute('fill-opacity', '0.95');
        lbl.setAttribute('pointer-events', 'none');
        lbl.textContent = abbr;
        trailG.appendChild(lbl);
      }

      // Year label next to each dot — only for selected party
      if (isSelected) {
        const yearLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yearLbl.setAttribute('x', px(point.econ) + dotR + 5);
        yearLbl.setAttribute('y', py(point.gal) + 4);
        yearLbl.setAttribute('font-family', 'DM Sans, sans-serif');
        yearLbl.setAttribute('font-size', '9');
        yearLbl.setAttribute('font-weight', '600');
        yearLbl.setAttribute('fill', color);
        yearLbl.setAttribute('pointer-events', 'none');
        yearLbl.textContent = point.year;
        trailG.appendChild(yearLbl);
      }
    });

    svg.appendChild(trailG);
  });
}

/* ===================================================
   Tooltip
   =================================================== */
let tooltipEl = null;

function showTooltip(e, abbr, point) {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    document.body.appendChild(tooltipEl);
  }
  const party = data.parties[abbr];
  tooltipEl.innerHTML = `<div class="tooltip-party">${party.name} (${point.year})</div>
    <div>Ekonomi: ${point.econ.toFixed(1)} · GAL-TAN: ${point.gal.toFixed(1)}</div>
    <div style="font-size:0.7rem;margin-top:2px;opacity:0.7">${point.note}</div>`;
  tooltipEl.hidden = false;
  positionTooltip(e);
}

function positionTooltip(e) {
  if (!tooltipEl) return;
  const x = e.clientX + 14;
  const y = e.clientY - 8;
  tooltipEl.style.left = Math.min(x, window.innerWidth - 280) + 'px';
  tooltipEl.style.top  = y + 'px';
  tooltipEl.style.position = 'fixed';
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.hidden = true;
}

document.addEventListener('mousemove', (e) => {
  if (tooltipEl && !tooltipEl.hidden) positionTooltip(e);
});

/* ===================================================
   Detail panel
   =================================================== */
function showPanel(abbr) {
  const panel = document.getElementById('detail-panel');
  const party = data.parties[abbr];
  const movement = data.movements[abbr];
  const pos2026 = data.positions[abbr].find(p => p.year === 2026);
  const pos2018 = data.positions[abbr].find(p => p.year === 2018);

  const dEcon = pos2026 && pos2018 ? (pos2026.econ - pos2018.econ).toFixed(1) : '?';
  const dGal  = pos2026 && pos2018 ? (pos2026.gal  - pos2018.gal).toFixed(1)  : '?';

  const driverLinks = (movement.drivers || []).map(d =>
    `<a href="index.html" style="color:var(--muted);text-decoration:underline">${d}</a>`
  ).join(', ');

  panel.style.display = 'block';
  panel.innerHTML = `
    <div class="panel-header">
      <span class="panel-dot" style="background:${party.color}"></span>
      <span class="panel-name">${party.name}</span>
      <button class="panel-close" aria-label="Stäng">×</button>
    </div>
    <div class="panel-topic-label">Position 2026</div>
    <div class="panel-summary">
      Ekonomi: <strong>${pos2026 ? pos2026.econ.toFixed(1) : '—'}/10</strong> &nbsp;·&nbsp;
      GAL-TAN: <strong>${pos2026 ? pos2026.gal.toFixed(1) : '—'}/10</strong>
    </div>
    <div class="panel-topic-label">Rörelse 2018 → 2026</div>
    <div class="panel-summary">${movement.summary}</div>
    <div class="gt-delta-row">
      <span class="gt-delta ${Number(dEcon) > 0 ? 'gt-delta-right' : Number(dEcon) < 0 ? 'gt-delta-left' : ''}">
        Ekonomi ${Number(dEcon) > 0 ? '+' : ''}${dEcon}
      </span>
      <span class="gt-delta ${Number(dGal) > 0 ? 'gt-delta-tan' : Number(dGal) < 0 ? 'gt-delta-gal' : ''}">
        GAL-TAN ${Number(dGal) > 0 ? '+' : ''}${dGal}
      </span>
    </div>
    ${driverLinks ? `<div class="panel-topic-label" style="margin-top:var(--space-md)">Drivande sakfrågor</div>
    <div class="panel-source">${driverLinks}</div>` : ''}
    <div class="panel-method">Källa: Chapel Hill Expert Survey (CHES) 2019 och 2023. 2026-värden är preliminära egna bedömningar baserade på riksdagsmotioner och partiprogram.<br><br>${pos2026 ? pos2026.note : ''}</div>
  `;
  panel.querySelector('.panel-close').addEventListener('click', () => window.closePanel());

  requestAnimationFrame(() => panel.classList.add('visible'));
}

function hidePanel() {
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('visible');
  setTimeout(() => { panel.style.display = 'none'; }, 220);
}

window.closePanel = function() {
  selectedParty = null;
  hidePanel();
  renderPlot();
};

/* ===================================================
   Tab navigation
   =================================================== */
function setupTabs() {
  document.querySelector('.tab[data-view="spectrum"]')
    ?.addEventListener('click', () => { location.href = 'index.html'; });
  document.querySelector('.tab[data-view="cluster"]')
    ?.addEventListener('click', () => { location.href = 'kluster.html'; });
  document.querySelector('.tab[data-view="sager-vs-gor"]')
    ?.addEventListener('click', () => { location.href = 'sager-vs-gor.html'; });
  document.querySelector('.tab[data-view="hitta-parti"]')
    ?.addEventListener('click', () => { location.href = 'hitta-parti.html'; });
  document.querySelector('.tab[data-view="metod"]')
    ?.addEventListener('click', () => { location.href = 'metod.html'; });
}

window.addEventListener('resize', () => { if (data) renderPlot(); });

init();
