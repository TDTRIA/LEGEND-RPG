// LEGEND v0.8 - Road flow polish
// Makes Choice Road the main route and fixes Return to Ashmere without rewriting game.js.
(() => {
  const RETURN_KEY = 'legend-v080-return-ashmere';

  function markReturn(){
    sessionStorage.setItem(RETURN_KEY, '1');
    location.reload();
  }

  function autoReturnFromTitle(){
    if(sessionStorage.getItem(RETURN_KEY) !== '1') return;
    const btn = document.getElementById('continue');
    if(btn){
      sessionStorage.removeItem(RETURN_KEY);
      btn.click();
    }
  }

  function cleanRouteScreen(){
    const body = document.body?.innerText || '';
    if(!/Choose a Route/i.test(body)) return;

    const actions = document.querySelector('.actions');
    if(actions){
      [...actions.querySelectorAll('button')].forEach(btn => {
        const text = (btn.textContent || '').trim();
        if(text === 'Old Road' || /Classic Fallback/i.test(text)) btn.remove();
        if(text === 'Return to Ashmere') btn.onclick = markReturn;
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
      if(btn) btn.onclick = markReturn;
    });
  }

  function tick(){
    autoReturnFromTitle();
    cleanRouteScreen();
    fixRoadReturnButtons();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
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
