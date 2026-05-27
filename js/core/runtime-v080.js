// LEGEND v0.9.4 - Runtime Bridge
// Safe bridge for loading saves, returning to Ashmere, and surviving title-screen replacement layers.
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

  function isContinueButton(el){
    if(!el) return false;
    if(el.id === 'continue') return true;
    const txt = String(el.textContent || '').trim().toLowerCase();
    return txt.startsWith('continue') || txt.includes('continue as');
  }

  function findContinueButton(){
    const direct = document.getElementById('continue');
    if(direct) return direct;
    return [...document.querySelectorAll('button,a,.v089-menu-btn')].find(isContinueButton) || null;
  }

  function continueFromTitle(){
    const btn = findContinueButton();
    if(btn && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true'){
      btn.click();
      return true;
    }
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

  function autoResumePendingReturn(){
    if(sessionStorage.getItem(RETURN_KEY) !== '1') return;
    let tries = 0;
    const attempt = () => {
      tries += 1;
      if(handlePendingReturn() || tries >= 60){
        clearInterval(timer);
      }
    };
    const timer = setInterval(attempt, 100);
    setTimeout(attempt, 0);
  }

  function onRender(fn){
    const run = () => {
      try{ fn(); }catch(err){ console.warn('LegendRuntimeV080 render hook failed:', err); }
      try{ handlePendingReturn(); }catch(err){ console.warn('LegendRuntimeV080 return hook failed:', err); }
    };
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', () => {
        run();
        autoResumePendingReturn();
        const observer = new MutationObserver(() => requestAnimationFrame(run));
        observer.observe(document.body,{childList:true,subtree:true});
      });
    } else {
      run();
      autoResumePendingReturn();
      const observer = new MutationObserver(() => requestAnimationFrame(run));
      observer.observe(document.body,{childList:true,subtree:true});
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoResumePendingReturn);
  else autoResumePendingReturn();

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