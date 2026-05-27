// LEGEND v0.9.7 - Ashmere Shell Stabilizer
// Owns the Ashmere hub after the legacy game renders it, preventing old menu layers from leaking through.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const TC = () => window.LegendTownControllerV080 || null;
  const KEY = 'legend-v097-ashmere-shell-active';

  function isTitle(){
    const text = document.body?.innerText || '';
    return /New Traveler|Continue|LEGEND/i.test(text) && !/Ashmere Menu|Ashmere • First Town|Current Goal/i.test(text);
  }

  function hasLegacyAshmere(){
    return [...document.querySelectorAll('h2,h3')].some(h => /Ashmere Menu|Ashmere$/i.test((h.textContent||'').trim())) || /Explore The First Road|People of Ashmere|Ashmere Inn/i.test(document.body?.innerText||'');
  }

  function hasModernAshmere(){
    return !!document.querySelector('#legendTownV080 .v094-town-top, #legendTownV080 .v096-town-screen');
  }

  function playerIsInAshmere(){
    const p = RT()?.loadPlayer?.();
    return !!p && (!p.town || String(p.town).toLowerCase() === 'ashmere');
  }

  function claimAshmere(){
    if(!playerIsInAshmere()) return false;
    if(!TC()?.renderTown) return false;
    if(hasModernAshmere()) return true;
    if(isTitle()) return false;
    if(hasLegacyAshmere()){
      sessionStorage.setItem(KEY,'1');
      TC().renderTown('ashmere');
      return true;
    }
    return false;
  }

  function boot(){
    let tries = 0;
    const tick = () => {
      tries += 1;
      claimAshmere();
      if(tries > 80) clearInterval(timer);
    };
    const timer = setInterval(tick, 100);
    tick();
  }

  window.LegendAshmereShellV097 = { claimAshmere };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();