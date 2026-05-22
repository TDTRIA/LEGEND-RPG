// LEGEND v0.6.5 — lightweight build label patch
// Keeps the restored core game safe while letting v0.6.5 systems report the current build.
(() => {
  if(window.LEGEND_DATA){
    window.LEGEND_DATA.VERSION = 'v0.6.5';
  }
})();
