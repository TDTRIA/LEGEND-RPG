// LEGEND v0.8 - Road flow polish
// Uses LegendRuntimeV080 bridge so new systems do not each invent their own game.js hacks.
(() => {
  function runtime(){ return window.LegendRuntimeV080 || null; }

  function returnToAshmere(){
    const rt = runtime();
    if(rt && typeof rt.returnToAshmere === 'function') rt.returnToAshmere();
    else {
      sessionStorage.setItem('legend-v080-return-ashmere','1');
      location.reload();
    }
  }

  function autoReturnFromTitle(){
    const rt = runtime();
    if(rt && typeof rt.handlePendingReturn === 'function') rt.handlePendingReturn();
  }

  function cleanRouteScreen(){
    const body = document.body?.innerText || '';
    if(!/Choose a Route/i.test(body)) return;

    const actions = document.querySelector('.actions');
    if(actions){
      [...actions.querySelectorAll('button')].forEach(btn => {
        const text = (btn.textContent || '').trim();
        if(text === 'Old Road' || /Classic Fallback/i.test(text)) btn.remove();
        if(text === 'Return to Ashmere') btn.onclick = returnToAshmere;
      });
    }

    const choiceBtn = document.getElementById('choiceRoadBtn');
    if(choiceBtn){
      choiceBtn.textContent = 'Travel the Old Road';
      choiceBtn.classList.add('primary');
    }

    const panelText = document.querySelector('.panel .text');
    if(panelText && /Only Old Road is open/i.test(panelText.textContent || '')){
      panelText.textContent = 'The Old Road is open. Choose how you travel it. Your build, supplies, and decisions now matter.';
    }
  }

  function fixRoadReturnButtons(){
    ['backAshmere','returnAshmere'].forEach(id => {
      const btn = document.getElementById(id);
      if(btn) btn.onclick = returnToAshmere;
    });
  }

  function tick(){
    autoReturnFromTitle();
    cleanRouteScreen();
    fixRoadReturnButtons();
  }

  const rt = runtime();
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
})();
