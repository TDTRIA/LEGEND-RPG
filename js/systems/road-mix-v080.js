// LEGEND v0.8 - Road Mix
// Restores real road encounters by mixing the new choice road with the original encounter route.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;

  function clickOriginalOldRoad(){
    const buttons = [...document.querySelectorAll('button')];
    const old = buttons.find(b => {
      const t = (b.textContent || '').trim();
      return t === 'Old Road' || /Classic Fallback/i.test(t) || b.dataset.v080ClassicRoad === '1';
    });
    if(old){ old.click(); return true; }
    return false;
  }

  function startMixedRoad(){
    // Keep choices as the main road feel, but bring back danger.
    // 40% classic route means the existing road event/battle system can fire again.
    if(Math.random() < 0.40 && clickOriginalOldRoad()) return;
    if(window.LegendRoadChoicesV065 && typeof window.LegendRoadChoicesV065.start === 'function'){
      window.LegendRoadChoicesV065.start();
      return;
    }
    clickOriginalOldRoad();
  }

  function wireRouteButtons(){
    const body = document.body?.innerText || '';
    const choiceBtn = document.getElementById('choiceRoadBtn');
    if(choiceBtn){
      choiceBtn.textContent = 'Travel the Old Road';
      choiceBtn.onclick = startMixedRoad;
    }

    // Result screen from the choice road should continue into the mixed road,
    // not only another check screen.
    const continueBtn = document.getElementById('continueRoadChoice');
    if(continueBtn) continueBtn.onclick = startMixedRoad;

    // Keep the classic button available for the mixer, but hide it from players.
    if(/Choose a Route/i.test(body)){
      [...document.querySelectorAll('button')].forEach(btn => {
        const t = (btn.textContent || '').trim();
        if(t === 'Old Road' || /Classic Fallback/i.test(t)){
          btn.style.display = 'none';
          btn.dataset.v080ClassicRoad = '1';
        }
      });
    }
  }

  function tick(){ wireRouteButtons(); }

  const rt = RT();
  if(rt && typeof rt.onRender === 'function') rt.onRender(tick);
  else if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => requestAnimationFrame(tick));
    observer.observe(document.body,{childList:true,subtree:true});
    tick();
  });
  else {
    const observer = new MutationObserver(() => requestAnimationFrame(tick));
    observer.observe(document.body,{childList:true,subtree:true});
    tick();
  }

  window.LegendRoadMixV080 = { start: startMixedRoad };
})();
