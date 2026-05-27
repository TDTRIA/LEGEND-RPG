// LEGEND v0.9.0 - Roads of Ashmere identity patch
// Keeps existing saves compatible while moving visible build identity forward.
(() => {
  if (!window.LEGEND_DATA) return;
  window.LEGEND_DATA.VERSION = 'v0.9.0';
  window.LEGEND_DATA.TITLE = 'LEGEND: Roads of Ashmere';
})();
