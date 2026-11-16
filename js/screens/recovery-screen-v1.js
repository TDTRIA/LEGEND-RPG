/* Recovery presentation metadata and focus only; callers own recovery actions. */
(() => {
  function present(host) {
    const screen=host?.firstElementChild;
    const panel=screen?.querySelector('.settings09x-wrap,.account09x-wrap,.panel');
    const heading=panel?.querySelector('h1,h2');
    if(!screen||!panel||!heading)return false;
    screen.dataset.recoveryScreen='true';
    panel.classList.add('legend-recovery-panel');
    heading.tabIndex=-1;
    host.scrollTop=0;window.scrollTo(0,0);
    heading.focus({preventScroll:true});
    return true;
  }
  window.LegendRecoveryScreenV1=Object.freeze({present});
})();
