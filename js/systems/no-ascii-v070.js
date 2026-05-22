// LEGEND v0.7.0 — Public release ASCII remover
// Last-resort safe visual cleanup. Does not touch saves or gameplay logic.
(() => {
  function removeAscii(){
    document.querySelectorAll('pre.ascii, .ascii').forEach(el => {
      if(el && el.parentNode) el.remove();
    });
  }

  function start(){
    removeAscii();
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(() => requestAnimationFrame(removeAscii));
    observer.observe(root, { childList:true, subtree:true });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
