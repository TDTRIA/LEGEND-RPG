/* Confirmation UI only; account/cloud services own the eventual deletion. */
(() => {
  let active = false;
  function request(slot, source) {
    if (active || ![1,2].includes(slot) || !source?.isConnected) return Promise.resolve(false);
    active = true;
    return new Promise(resolve => {
      const opener = document.activeElement;
      const html = document.documentElement, wasLocked = html.classList.contains('legend-confirmation-open');
      const backgrounds = [...document.querySelectorAll('#root,#legend-world-shell-root,#legend-world-shell-modal-root')].map(node=>({node,inert:node.inert}));
      const overlay = document.createElement('div');
      overlay.className = 'legend-confirm-overlay';
      overlay.innerHTML = `<section class="legend-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="legendConfirmTitle" aria-describedby="legendConfirmDetail"><h2 id="legendConfirmTitle">Clear Cloud Slot ${slot}?</h2><p id="legendConfirmDetail">This does not delete your local traveler.</p><div class="legend-confirm-actions"><button type="button" id="legendConfirmCancel">Keep Slot</button><button type="button" id="legendConfirmAccept">Clear Cloud Slot ${slot}</button></div></section>`;
      const cancel = overlay.querySelector('#legendConfirmCancel'), accept = overlay.querySelector('#legendConfirmAccept');
      let settled = false;
      function finish(confirmed) {
        if (settled) return; settled = true; active = false;
        observer.disconnect(); document.removeEventListener('keydown',onKey,true);
        overlay.remove(); if(!wasLocked)html.classList.remove('legend-confirmation-open'); backgrounds.forEach(({node,inert})=>node.inert=inert);
        if (opener?.isConnected) opener.focus({preventScroll:true});
        else document.querySelector('#root button:not(:disabled)')?.focus({preventScroll:true});
        resolve(confirmed && source.isConnected);
      }
      function onKey(event) {
        if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); finish(false); }
        else if (event.key === 'Tab') {
          event.preventDefault(); event.stopPropagation();
          (document.activeElement === cancel ? accept : cancel).focus();
        }
      }
      const observer = new MutationObserver(()=>{if (!source.isConnected || !overlay.isConnected) finish(false);});
      observer.observe(document.body,{childList:true});
      observer.observe(source.parentElement,{childList:true});
      cancel.addEventListener('click',()=>finish(false)); accept.addEventListener('click',()=>finish(true));
      overlay.addEventListener('click',event=>{if(event.target===overlay)finish(false);});
      document.addEventListener('keydown',onKey,true);
      backgrounds.forEach(({node})=>node.inert=true);
      html.classList.add('legend-confirmation-open');
      document.body.append(overlay); cancel.focus({preventScroll:true});
    });
  }
  window.LegendCloudSlotConfirmationV1 = Object.freeze({request});
})();
