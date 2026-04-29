'use strict';

/* ===================================================
   State
   =================================================== */
let posData = null, votingData = null;
let mode = 'topic';   // 'topic' | 'party'
let activeArea = null, activeTopic = null, activeParty = null;

/* ===================================================
   Bootstrap
   =================================================== */
async function init() {
  try {
    const [pR, vR] = await Promise.all([
      fetch('data/positions.json'),
      fetch('data/voting.json'),
    ]);
    if (!pR.ok) throw new Error('positions.json ' + pR.status);
    if (!vR.ok) throw new Error('voting.json ' + vR.status);
    [posData, votingData] = await Promise.all([pR.json(), vR.json()]);
    activeArea = posData.areas[0].id;
    renderLeftNav();
    renderCards();
    setupTabNav();
  } catch (e) {
    document.getElementById('cards-container').innerHTML =
      '<p style="padding:16px;color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

/* ===================================================
   Left navigation
   =================================================== */
function renderLeftNav() {
  const nav = document.getElementById('left-nav');
  nav.innerHTML = '';

  const toggle = mkEl('div', 'svs-mode-toggle');
  ['topic', 'party'].forEach(m => {
    const btn = mkEl('button', 'svs-mode-btn' + (mode === m ? ' active' : ''));
    btn.textContent = m === 'topic' ? 'Per fråga' : 'Per parti';
    btn.addEventListener('click', () => {
      if (mode === m) return;
      mode = m; activeTopic = null; activeParty = null;
      renderLeftNav(); renderCards();
    });
    toggle.appendChild(btn);
  });
  nav.appendChild(toggle);
  nav.appendChild(mkDivider());

  if (mode === 'topic') renderTopicNav(nav);
  else renderPartyNav(nav);
}

function renderTopicNav(nav) {
  const areaTabs = mkEl('div', 'left-area-tabs');
  posData.areas.forEach(area => {
    const btn = mkEl('button', 'left-area-btn' + (area.id === activeArea ? ' active' : ''));
    btn.textContent = area.name;
    btn.addEventListener('click', () => {
      if (area.id === activeArea) return;
      activeArea = area.id; activeTopic = null;
      renderLeftNav(); renderCards();
    });
    areaTabs.appendChild(btn);
  });
  nav.appendChild(areaTabs);
  nav.appendChild(mkDivider());

  const list = mkEl('div', 'left-topic-list');
  posData.areas.find(a => a.id === activeArea)?.topics.forEach(topic => {
    const btn = mkEl('button', 'left-topic-btn' + (activeTopic === topic.id ? ' active' : ''));
    btn.textContent = topic.name;
    btn.addEventListener('click', () => { activeTopic = topic.id; renderLeftNav(); renderCards(); });
    list.appendChild(btn);
  });
  nav.appendChild(list);
}

function renderPartyNav(nav) {
  const grid = mkEl('div', 'svs-party-grid');
  Object.entries(posData.parties).forEach(([abbr, party]) => {
    const btn = mkEl('button', 'svs-party-btn' + (activeParty === abbr ? ' active' : ''));
    btn.style.background = party.color;
    btn.textContent = abbr;
    btn.setAttribute('aria-label', party.name);
    btn.addEventListener('click', () => { activeParty = abbr; renderLeftNav(); renderCards(); });
    grid.appendChild(btn);
  });
  nav.appendChild(grid);
}

/* ===================================================
   Cards
   =================================================== */
function renderCards() {
  const container = document.getElementById('cards-container');

  if (mode === 'topic') {
    if (!activeTopic) {
      container.innerHTML = '<p class="svs-hint">Välj en fråga till vänster.</p>';
      return;
    }
    container.innerHTML = Object.entries(posData.parties).map(([abbr, party]) => {
      const entry = findEntry(abbr, activeTopic, activeArea);
      const hdr = `<span class="svs-card-dot" style="background:${party.color}"></span>` +
                  `<span class="svs-card-title">${esc(party.name)}</span>`;
      return entry ? buildCard(entry, hdr) : buildStub(hdr);
    }).join('');

  } else {
    if (!activeParty) {
      container.innerHTML = '<p class="svs-hint">Välj ett parti till vänster.</p>';
      return;
    }
    let html = '';
    posData.areas.forEach(area => {
      area.topics.forEach(topic => {
        const entry = findEntry(activeParty, topic.id, area.id);
        const hdr = `<span class="svs-card-area-label">${esc(area.name)}</span>` +
                    `<span class="svs-card-title">${esc(topic.name)}</span>`;
        html += entry ? buildCard(entry, hdr) : buildStub(hdr);
      });
    });
    container.innerHTML = html;
  }
}

function findEntry(partyId, topicId, areaId) {
  return votingData.data?.[areaId]?.[topicId]?.[partyId] || null;
}

/* ===================================================
   Card builders
   =================================================== */
function buildCard(entry, headerContent) {
  const { says, promises, promises_source, promises_url, voted, voted_source, voted_url, match } = entry;
  return `
    <div class="svs-card">
      <div class="svs-card-header">
        <div class="svs-card-header-left">${headerContent}</div>
        ${matchBadge(match)}
      </div>
      <div class="svs-rows">
        <div class="svs-row">
          <span class="svs-row-label svs-label-sager">Säger</span>
          <span class="svs-row-text">${rowText(says)}</span>
        </div>
        <div class="svs-row">
          <span class="svs-row-label svs-label-lovar">Lovar</span>
          <span class="svs-row-text">${rowText(promises, promises_source, promises_url)}</span>
        </div>
        <div class="svs-row-divider"></div>
        <div class="svs-row">
          <span class="svs-row-label svs-label-rostat">Röstat</span>
          <span class="svs-row-text">${rowText(voted, voted_source, voted_url)}</span>
        </div>
      </div>
    </div>`;
}

function buildStub(headerContent) {
  return `
    <div class="svs-card svs-card-stub">
      <div class="svs-card-header">
        <div class="svs-card-header-left">${headerContent}</div>
        ${matchBadge('ej-granskat')}
      </div>
      <p class="svs-stub-text">Ännu ej granskad.</p>
    </div>`;
}

function matchBadge(match) {
  const map = {
    stammer:             ['Stämmer',          'badge-stammer'],
    delvis:              ['Delvis',            'badge-delvis'],
    avviker:             ['Avviker',           'badge-avviker'],
    'ej-granskat':       ['Ej granskat',       'badge-ej-granskat'],
    'inväntar-votering': ['Inväntar votering', 'badge-invantar'],
  };
  const [label, cls] = map[match] || map['ej-granskat'];
  return `<span class="svs-match-badge ${cls}">${label}</span>`;
}

function rowText(text, source, url) {
  const t = esc(text);
  const link = (source && url)
    ? ` <a class="svs-src-link" href="${url}" target="_blank" rel="noopener noreferrer">${esc(source)}</a>`
    : '';
  return t ? t + link : `<span class="svs-row-empty">—</span>`;
}

/* ===================================================
   Helpers
   =================================================== */
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mkEl(tag, cls) { const e = document.createElement(tag); e.className = cls; return e; }
function mkDivider() { return mkEl('div', 'left-nav-divider'); }

/* ===================================================
   Tab nav
   =================================================== */
function setupTabNav() {
  document.querySelector('.tab[data-view="spectrum"]')
    ?.addEventListener('click', () => { location.href = 'index.html'; });
  document.querySelector('.tab[data-view="cluster"]')
    ?.addEventListener('click', () => { location.href = 'kluster.html'; });
  document.querySelector('.tab[data-view="gal-tan"]')
    ?.addEventListener('click', () => { location.href = 'gal-tan.html'; });
  document.querySelector('.tab[data-view="diskurs"]')
    ?.addEventListener('click', () => { location.href = 'diskurs.html'; });
  document.querySelector('.tab[data-view="hitta-parti"]')
    ?.addEventListener('click', () => { location.href = 'hitta-parti.html'; });
  document.querySelector('.tab[data-view="metod"]')
    ?.addEventListener('click', () => { location.href = 'metod.html'; });
}

init();
