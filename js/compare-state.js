/* ============================================================
   val26 — shared compare state
   A party selected in one lens stays selected when switching lens.
   Backed by sessionStorage so it survives real navigation between
   the separate per-lens pages. Publish/subscribe so a lens re-renders
   its chips + graph nodes in sync (click node ⇄ press chip).
   window.CompareState — depends on window.VAL26 (constants.js).
   ============================================================ */
(function (w) {
  'use strict';
  var KEY = 'val26.compare.selected';
  var subs = [];

  function order() { return (w.VAL26 && w.VAL26.PARTY_ORDER) || []; }

  function read() {
    try {
      var raw = w.sessionStorage.getItem(KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      // keep only known codes, in canonical order
      return order().filter(function (c) { return arr.indexOf(c) !== -1; });
    } catch (e) { return []; }
  }

  function write(arr) {
    try { w.sessionStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function emit() {
    var snap = read();
    subs.forEach(function (fn) { try { fn(snap); } catch (e) {} });
  }

  var api = {
    /** current selection, canonical order */
    get: function () { return read(); },
    /** true if code selected */
    has: function (code) { return read().indexOf(code) !== -1; },
    /** true if nothing selected (overview = all parties) */
    isEmpty: function () { return read().length === 0; },
    /** add/remove a party, keep canonical order */
    toggle: function (code) {
      var cur = read(), i = cur.indexOf(code);
      if (i === -1) cur.push(code); else cur.splice(i, 1);
      write(order().filter(function (c) { return cur.indexOf(c) !== -1; }));
      emit();
    },
    /** replace whole selection (e.g. compass results preselect) */
    set: function (codes) {
      var arr = order().filter(function (c) { return (codes || []).indexOf(c) !== -1; });
      write(arr); emit();
    },
    /** clear ("Rensa") */
    clear: function () { write([]); emit(); },
    /** subscribe; returns unsubscribe */
    subscribe: function (fn) {
      subs.push(fn);
      return function () { var i = subs.indexOf(fn); if (i !== -1) subs.splice(i, 1); };
    }
  };

  // Cross-tab / cross-page sync: another page changed the selection.
  w.addEventListener('storage', function (e) { if (e.key === KEY) emit(); });

  w.CompareState = api;
})(window);
