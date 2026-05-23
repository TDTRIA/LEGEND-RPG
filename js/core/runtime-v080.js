// LEGEND v0.8 - Runtime Bridge
// Purpose: make the old game.js monolith less risky by giving new systems one safe place
// to load saves, save players, return to Ashmere, and continue from the title.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];
  const RETURN_KEY = 'legend-v080-return-ashmere';

  function loadPlayer(){
    const storage = window.LegendStorage;
    if(storage && typeof storage.loadPlayer === 'function') return storage.loadPlayer();
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }

  function savePlayer(player){
    if(!player) return;
    const storage = window.LegendStorage;
    if(storage && typeof storage.savePlayer === 'function') storage.savePlayer(player);
    else localStorage.setItem(SAVE_KEY, JSON.stringify(player));
  }

  function continueFromTitle(){
    const btn = document.getElementById('continue');
    if(btn){ btn.click(); return true; }
    return false;
  }

  function returnToAshmere(){
    sessionStorage.setItem(RETURN_KEY, '1');
    location.reload();
  }

  function handlePendingReturn(){
    if(sessionStorage.getItem(RETURN_KEY) !== '1') return false;
    const didContinue = continueFromTitle();
    if(didContinue) sessionStorage.removeItem(RETURN_KEY);
    return didContinue;
  }

  function onRender(fn){
    const run = () => { try{ fn(); }catch(err){ console.warn('LegendRuntimeV080 render hook failed:', err); } };
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', () => {
        run();
        const observer = new MutationObserver(() => requestAnimationFrame(run));
        observer.observe(document.body,{childList:true,subtree:true});
      });
    } else {
      run();
      const observer = new MutationObserver(() => requestAnimationFrame(run));
      observer.observe(document.body,{childList:true,subtree:true});
    }
  }

  window.LegendRuntimeV080 = {
    SAVE_KEY,
    loadPlayer,
    savePlayer,
    returnToAshmere,
    continueFromTitle,
    handlePendingReturn,
    onRender
  };
})();
