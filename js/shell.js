/* ============================================================
   val26 — shell behaviour + shared lens helpers
   - marks the active nav item from <body data-lens="…">
   - wires the mobile hamburger drawer
   - countUp(): tabular count-up animation (reduced-motion aware)
   - renderChips(): party-chip row wired to CompareState (mirrors nodes)
   - setHeaderTone(): area-tone crossfade on the page header
   Depends on constants.js + compare-state.js. window.VAL26Shell.
   ============================================================ */
(function (w, d) {
  'use strict';
  var reduceMotion = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markActiveNav() {
    var lens = d.body.getAttribute('data-lens');
    if (!lens) return;
    d.querySelectorAll('.navitem[data-lens-id]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-lens-id') === lens);
      if (a.getAttribute('data-lens-id') === lens) a.setAttribute('aria-current', 'page');
    });
    if (lens === 'om-metoden') {
      d.querySelectorAll('.rail__method, .drawer__method').forEach(function (a) { a.classList.add('is-active'); });
    }
  }

  function wireDrawer() {
    var drawer = d.querySelector('.drawer');
    var burger = d.querySelector('.topbar__burger');
    if (!drawer || !burger) return;
    function open() { drawer.hidden = false; burger.setAttribute('aria-expanded', 'true'); }
    function close() { drawer.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
    burger.addEventListener('click', function () { drawer.hidden ? open() : close(); });
    drawer.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close') || e.target.closest('.navitem, .drawer__method')) close();
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /** Count a number up to target. Re-callable toward new targets. */
  function countUp(el, target, dur) {
    if (!el) return;
    target = Number(target) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = Number(String(el.textContent).replace(/[^\d.-]/g, '')) || 0;
    var t0 = performance.now(); dur = dur || 1000;
    (function tick(t) {
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /** Apply the header area tone (crossfades via CSS transition). */
  function setHeaderTone(el, areaId) {
    if (!el) return;
    el.style.setProperty('--header-tone', w.VAL26.areaTone(areaId));
  }

  /**
   * Render a party-chip row wired to CompareState.
   * container: element to fill. Returns a sync() to call on state change.
   * The chips MIRROR graph nodes: pressing a chip toggles CompareState,
   * which any subscribed node renderer reflects, and vice-versa.
   */
  function renderChips(container, opts) {
    opts = opts || {};
    var codes = opts.parties || w.VAL26.PARTY_ORDER;
    container.classList.add('chip-row');
    container.innerHTML = '';
    var clearBtn = null;

    codes.forEach(function (code) {
      var p = w.VAL26.PARTIES[code];
      var btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.setAttribute('data-party', code);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '<span class="chip__dot" style="background:' + p.color + '"></span>' + code;
      btn.title = p.name;
      btn.addEventListener('click', function () { w.CompareState.toggle(code); });
      container.appendChild(btn);
    });

    clearBtn = d.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'chip-clear';
    clearBtn.textContent = 'Rensa';
    clearBtn.addEventListener('click', function () { w.CompareState.clear(); });
    container.appendChild(clearBtn);

    function sync(sel) {
      sel = sel || w.CompareState.get();
      var any = sel.length > 0;
      container.querySelectorAll('.chip').forEach(function (btn) {
        var code = btn.getAttribute('data-party');
        var on = sel.indexOf(code) !== -1;
        btn.classList.toggle('is-selected', on);
        btn.classList.toggle('is-dimmed', any && !on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        var p = w.VAL26.PARTIES[code];
        btn.style.background = on ? p.color : '';
        btn.style.color = on ? p.text : '';
      });
      clearBtn.style.display = any ? '' : 'none';
    }

    w.CompareState.subscribe(sync);
    sync();
    return sync;
  }

  function init() { markActiveNav(); wireDrawer(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();

  w.VAL26Shell = {
    countUp: countUp,
    setHeaderTone: setHeaderTone,
    renderChips: renderChips,
    reduceMotion: reduceMotion
  };
})(window, document);
