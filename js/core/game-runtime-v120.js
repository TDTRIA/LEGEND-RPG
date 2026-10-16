// LEGEND v0.20.36 - Active Game Runtime
// Safe bridge for loading saves, returning to Ashmere, and avoiding title-loop reloads.
(() => {
  const RETURN_KEY = 'legend-awakening-return-to-town-v1';

  function loadPlayer(){
    return window.LegendStorage?.loadPlayer?.() || null;
  }

  function savePlayer(player){
    if(!player) return;
    window.LegendStorage?.savePlayer?.(player);
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

  function renderAshmereDirect(){
    const player = loadPlayer();
    if(!player) return false;
    player.town = 'Ashmere';
    savePlayer(player);
    if(window.LegendAshmereV099?.renderAshmere){
      window.LegendAshmereV099.renderAshmere();
      sessionStorage.removeItem(RETURN_KEY);
      return true;
    }
    return false;
  }

  function returnToAshmere(){
    sessionStorage.setItem(RETURN_KEY, '1');
    if(renderAshmereDirect()) return;
    location.reload();
  }

  function handlePendingReturn(){
    if(sessionStorage.getItem(RETURN_KEY) !== '1') return false;
    if(renderAshmereDirect()) return true;
    const didContinue = continueFromTitle();
    if(didContinue) sessionStorage.removeItem(RETURN_KEY);
    return didContinue;
  }

  function autoResumePendingReturn(){
    if(sessionStorage.getItem(RETURN_KEY) !== '1') return;
    let tries = 0;
    const attempt = () => {
      tries += 1;
      if(handlePendingReturn() || tries >= 60) clearInterval(timer);
    };
    const timer = setInterval(attempt, 100);
    setTimeout(attempt, 0);
  }

  function onRender(fn){
    const run = () => {
      try{ fn(); }catch(err){ console.warn('LegendRuntimeV120 render hook failed:', err); }
      try{ handlePendingReturn(); }catch(err){ console.warn('LegendRuntimeV120 return hook failed:', err); }
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

  window.LegendRuntimeV120 = { loadPlayer, savePlayer, returnToAshmere, continueFromTitle, handlePendingReturn, onRender };
})();