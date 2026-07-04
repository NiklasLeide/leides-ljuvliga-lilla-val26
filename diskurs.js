'use strict';

const AREA_LABELS = { rattsvasende: 'Rättsväsende', migration: 'Migration', klimat: 'Klimat & energi', ekonomi: 'Ekonomi' };

/* ===================================================
   State
   =================================================== */
let discourseData = null;
let allParties    = null;     // from positions.json
let selectedParty = null;
let selectedArea  = null;
let signifierLookup = {};     // term -> flytande_signifikanter data

/* ===================================================
   Bootstrap
   =================================================== */
async function init() {
  try {
    const [dRes, pRes] = await Promise.all([
      fetch('data/discourse.json'),
      fetch('data/positions.json'),
    ]);
    if (!dRes.ok) throw new Error('discourse.json ' + dRes.status);
    if (!pRes.ok) throw new Error('positions.json ' + pRes.status);
    discourseData = await dRes.json();
    allParties    = (await pRes.json()).parties;
    signifierLookup = discourseData.flytande_signifikanter || {};
    renderLeftNav();
    renderCenter();
    renderRight(null);
    setupTabNav();
  } catch (e) {
    document.getElementById('diskurs-center').innerHTML =
      '<p style="padding:var(--space-md);color:#c00">Kunde inte ladda data: ' + e.message + '</p>';
  }
}

/* ===================================================
   Left navigation
   =================================================== */
function renderLeftNav() {
  const nav = document.getElementById('left-nav');
  nav.innerHTML = '';

  const label = mkEl('div', 'gt-section-label');
  label.textContent = 'Välj parti';
  nav.appendChild(label);

  const grid = mkEl('div', 'disk-party-grid');
  Object.entries(allParties).forEach(([abbr, party]) => {
    const hasData = !!discourseData.partier[abbr];
    const cls = 'disk-party-circle' +
                (hasData ? '' : ' disk-party-inactive') +
                (selectedParty === abbr ? ' disk-party-selected' : '');
    const btn = mkEl('button', cls);
    btn.style.background = hasData ? party.color : '#ccc';
    btn.textContent = abbr;
    btn.setAttribute('aria-label', party.name + (hasData ? '' : ' (ingen data)'));
    btn.disabled = !hasData;
    if (hasData) {
      btn.addEventListener('click', () => {
        selectedParty = abbr;
        selectedArea  = null;
        renderLeftNav();
        renderCenter();
        renderRight(null);
      });
    }
    grid.appendChild(btn);
  });
  nav.appendChild(grid);

  if (selectedParty && discourseData.partier[selectedParty]) {
    const areas = Object.keys(discourseData.partier[selectedParty].per_omrade || {});
    if (areas.length > 0) {
      nav.appendChild(mkDivider());
      const areaLabel = mkEl('div', 'gt-section-label');
      areaLabel.textContent = 'Politikområde';
      nav.appendChild(areaLabel);
      const areaList = mkEl('div', 'left-area-tabs');
      areas.forEach(areaId => {
        const btn = mkEl('button', 'left-area-btn' + (selectedArea === areaId ? ' active' : ''));
        btn.textContent = AREA_LABELS[areaId] || areaId;
        btn.addEventListener('click', () => {
          selectedArea = selectedArea === areaId ? null : areaId;
          renderLeftNav();
          renderCenter();
        });
        areaList.appendChild(btn);
      });
      nav.appendChild(areaList);
    }
  }
}

/* ===================================================
   Center
   =================================================== */
function renderCenter() {
  const container = document.getElementById('diskurs-center');

  if (!selectedParty) {
    container.innerHTML =
      '<div class="disk-welcome">' +
        '<div class="disk-pilot-note">Fas 1 pilot — diskursanalys täcker SD, S och V inom rättsväsende och migration. Fler partier och områden tillkommer successivt.</div>' +
        '<p class="svs-hint">Välj ett parti i vänsterkolumnen för att se diskursprofil och nyckelbegrepp.</p>' +
      '</div>';
    return;
  }

  const partyInfo = allParties[selectedParty];
  const partyData = discourseData.partier[selectedParty];
  let html = renderProfileSection(partyInfo, partyData);

  if (selectedArea) {
    const areaData = partyData.per_omrade?.[selectedArea];
    if (areaData) html += renderAreaCard(selectedArea, areaData);
  } else {
    Object.entries(partyData.per_omrade || {}).forEach(([areaId, areaData]) => {
      html += renderAreaCard(areaId, areaData);
    });
  }

  container.innerHTML = html;

  container.querySelectorAll('.disk-sig-clickable').forEach(el => {
    el.addEventListener('click', () => renderRight(el.dataset.term));
  });
}

/* ===================================================
   Section 1 — Party discourse profile
   =================================================== */
function renderProfileSection(partyInfo, partyData) {
  const p = partyData.diskursprofil;
  const cong = p.galtan_kongruens;
  const levelClass = { hög: 'disk-cong-hog', delvis: 'disk-cong-delvis', låg: 'disk-cong-lag' }[cong.bedomning] || '';

  const pillsHtml = (p.nodalpunkter || [])
    .map(t => `<span class="disk-pill">${esc(t)}</span>`).join('');

  const strategiesHtml = (p.retoriska_strategier || [])
    .map(s => `<li>${esc(s)}</li>`).join('');

  return `
    <div class="disk-section">
      <div class="disk-party-header">
        <span class="disk-party-dot" style="background:${esc(partyInfo.color)}"></span>
        <span class="disk-party-name">${esc(partyInfo.name)}</span>
      </div>
      <div class="disk-field">
        <div class="disk-field-label">Övergripande inramning</div>
        <p class="disk-field-text">${esc(p.overordnad_inramning)}</p>
      </div>
      <div class="disk-field">
        <div class="disk-field-label">Nyckelbegrepp</div>
        <div class="disk-pills">${pillsHtml}</div>
      </div>
      <div class="disk-field">
        <div class="disk-field-label">Retoriska strategier</div>
        <ul class="disk-strategies">${strategiesHtml}</ul>
      </div>
      <div class="disk-field">
        <div class="disk-field-label">GAL-TAN-kongruens</div>
        <div class="disk-cong-row">
          <span class="disk-cong-badge ${levelClass}">${esc(cong.bedomning)}</span>
          <span class="disk-cong-text">${esc(cong.forklaring)}</span>
        </div>
      </div>
    </div>`;
}

/* ===================================================
   Section 2 — Area-specific analysis
   =================================================== */
function renderAreaCard(areaId, areaData) {
  const areaLabel = AREA_LABELS[areaId] || areaId;

  const sigsHtml = (areaData.nyckelbegrepp || []).map(sig => {
    const clickable = !!signifierLookup[sig.term];
    const termHtml = clickable
      ? `<span class="disk-sig disk-sig-clickable" data-term="${esc(sig.term)}" title="Klicka för att jämföra mellan partier">${esc(sig.term)} <span class="disk-sig-icon">⇄</span></span>`
      : `<span class="disk-sig">${esc(sig.term)}</span>`;
    return `
      <div class="disk-sig-row">
        <div class="disk-sig-top">${termHtml}</div>
        <p class="disk-sig-meaning">${esc(sig.innebord)}</p>
        ${sig.underforstadd_premiss
          ? `<p class="disk-sig-assumption"><em>Antagande:</em> ${esc(sig.underforstadd_premiss)}</p>`
          : ''}
      </div>`;
  }).join('');

  return `
    <div class="disk-area-card">
      <div class="disk-area-header">${esc(areaLabel)}</div>
      <div class="disk-field">
        <div class="disk-field-label">Inramning</div>
        <p class="disk-field-text">${esc(areaData.inramning)}</p>
      </div>
      <div class="disk-field">
        <div class="disk-field-label">Nyckelbegrepp</div>
        <div class="disk-sig-list">${sigsHtml}</div>
      </div>
      <div class="disk-field">
        <div class="disk-field-label">GAL-TAN-kongruens</div>
        <p class="disk-field-text disk-text-sm">${esc(areaData.galtan_kongruens)}</p>
      </div>
      ${areaData.kontrast_med
        ? `<div class="disk-field"><div class="disk-field-label">Kontrast</div><p class="disk-field-text disk-text-sm">${esc(areaData.kontrast_med)}</p></div>`
        : ''}
    </div>`;
}

/* ===================================================
   Right panel — Signifier comparison
   =================================================== */
function renderRight(term) {
  const panel = document.getElementById('detail-panel');

  if (!term || !signifierLookup[term]) {
    const hasSignifiers = Object.keys(signifierLookup).length > 0;
    if (hasSignifiers) {
      panel.innerHTML =
        '<p class="disk-hint-right">Klicka på ett <span class="disk-sig disk-sig-inline">begrepp ⇄</span> för att se hur olika partier lägger in skilda meningar i samma ord.</p>';
      panel.style.display = 'block';
      panel.classList.remove('visible');
      requestAnimationFrame(() => panel.classList.add('visible'));
    } else {
      panel.style.display = 'none';
      panel.classList.remove('visible');
    }
    return;
  }

  const sigData = signifierLookup[term];
  const byParty = sigData.per_parti || {};

  const rowsHtml = Object.entries(byParty).map(([abbr, pd]) => {
    const pi = allParties[abbr] || { color: '#ccc', name: abbr };
    const galCls = pd.galtan_matchning
      ? 'disk-galtan-tag disk-galtan-' + pd.galtan_matchning.toLowerCase().replace(/[^a-z]/g, '')
      : '';
    return `
      <div class="disk-comp-row">
        <div class="disk-comp-party-hdr">
          <span class="disk-comp-dot" style="background:${esc(pi.color)}"></span>
          <span class="disk-comp-pname">${esc(pi.name)}</span>
          ${pd.galtan_matchning ? `<span class="${galCls}">${esc(pd.galtan_matchning)}</span>` : ''}
        </div>
        <p class="disk-comp-meaning">${esc(pd.innebord)}</p>
        ${pd.exempel ? `<p class="disk-comp-example">"${esc(pd.exempel)}"</p>` : ''}
      </div>`;
  }).join('');

  panel.innerHTML = `
    <div class="panel-header">
      <span class="panel-name">"${esc(term)}"</span>
      <button class="panel-close" aria-label="Stäng jämförelse">×</button>
    </div>
    <p class="disk-comp-desc">${esc(sigData.beskrivning)}</p>
    <div class="disk-comp-rows">${rowsHtml}</div>
    ${sigData.analytisk_not
      ? `<div class="disk-comp-note"><div class="disk-field-label">Analytisk not</div><p class="disk-field-text disk-text-sm">${esc(sigData.analytisk_not)}</p></div>`
      : ''}`;

  panel.style.display = 'block';
  requestAnimationFrame(() => panel.classList.add('visible'));

  panel.querySelector('.panel-close').addEventListener('click', () => {
    panel.classList.remove('visible');
    setTimeout(() => {
      renderRight(null);
    }, 220);
  });
}

/* ===================================================
   Tab navigation
   =================================================== */
function setupTabNav() {
  document.querySelector('.tab[data-view="spectrum"]')    ?.addEventListener('click', () => { location.href = 'index.html'; });
  document.querySelector('.tab[data-view="cluster"]')     ?.addEventListener('click', () => { location.href = 'kluster.html'; });
  document.querySelector('.tab[data-view="sager-vs-gor"]')?.addEventListener('click', () => { location.href = 'sager-vs-gor.html'; });
  document.querySelector('.tab[data-view="gal-tan"]')     ?.addEventListener('click', () => { location.href = 'gal-tan.html'; });
  document.querySelector('.tab[data-view="hitta-parti"]') ?.addEventListener('click', () => { location.href = 'hitta-parti.html'; });
  document.querySelector('.tab[data-view="metod"]')       ?.addEventListener('click', () => { location.href = 'metod.html'; });
}

/* ===================================================
   Helpers
   =================================================== */
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function mkEl(tag, cls) { const e = document.createElement(tag); e.className = cls; return e; }
function mkDivider() { return mkEl('div', 'left-nav-divider'); }

init();
