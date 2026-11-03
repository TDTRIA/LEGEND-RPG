/* LEGEND v0.22.0 — slower branded transitions for the playable route.
 * Navigation stays owned by existing screens; this layer gives destinations one
 * loading curtain and waits for scene images to settle before revealing them.
 */
(() => {
  if (window.__legendSceneTransitionsV120) return;
  window.__legendSceneTransitionsV120 = true;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  let busy = false;

  function overlay() {
    let el = document.getElementById('legend-scene-curtain');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'legend-scene-curtain';
    el.setAttribute('aria-hidden', 'true');
    const logoSrc = window.LegendAssetsV090?.logo?.main || 'assets/ui/logos/logo_legend_awakening_wordmark.png?v=0.21.0-local-raster-wordmark';
    el.innerHTML = '<div class="legend-transition-scene"><img class="legend-transition-wordmark" src="' + logoSrc + '" alt="" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="legend-transition-wordmark-fallback" hidden><strong>LEGEND</strong><em>THE AWAKENING</em></span><span class="legend-transition-location">THE OLD ROAD</span><i class="legend-transition-rule" aria-hidden="true"></i><div class="legend-transition-loader" aria-hidden="true"><i></i></div><small class="legend-transition-caption">PREPARING THE NEXT SCENE</small></div>';
    document.body.appendChild(el);
    return el;
  }

  function destinationLabel(target) {
    if (target.dataset.legendSceneTransition) return target.dataset.legendSceneTransition;
    if (target.matches('[data-ash-view="road"]')) return 'Leaving Ashmere for the Old Road';
    if (target.matches('[data-travel]')) return 'Crossing the realm';
    if (target.matches('[data-unlock]')) return 'Opening a new road';
    const labels = {
      home: 'Returning to Ashmere', people: 'Meeting the townsfolk', inn: 'Entering the inn',
      trader: 'Opening the market', smith: 'Entering the forge', work: 'Opening the work board',
      crossing: 'Approaching the crossing', craft: 'Opening the workshop', sheet: 'Reviewing your traveler',
      archive: 'Opening the field journal', routes: 'Opening the route board', quests: 'Reviewing local contracts',
      regions: 'Opening the road network', dungeon: 'Descending beneath the bell', profile: 'Opening traveler records'
    };
    if (target.dataset.ashView) return labels[target.dataset.ashView] || 'The road turns';
    return 'The road turns';
  }

  function transitionTo(label, action) {
    if (typeof action !== 'function') return;
    if (busy || reduced()) return action();
    busy = true;
    const startedAt = Date.now();
    const curtain = overlay();
    const location = curtain.querySelector('.legend-transition-location');
    if (location) location.textContent = String(label || 'The road turns').toUpperCase();
    // Explicit hit testing avoids stale Mobile Safari pointer state during CSS transitions.
    curtain.style.pointerEvents = 'auto';
    curtain.classList.remove('is-revealing');
    curtain.classList.add('is-covering');

    // Render the destination behind the curtain synchronously. This preserves
    // the existing navigation/save contract: handlers and tests can observe
    // the new screen immediately, while the player only sees it after the
    // entrance assets have had a chance to settle.
    try {
      const result = action();
      if (result && typeof result.then === 'function') result.catch(() => {});
    } catch (error) {
      // Always uncover the game, even when a screen handler throws.
    }

    // Keep the reveal bounded. A scene image that never fires load/error must
    // not strand a mobile player beneath the curtain or leave navigation locked.
    const minimumCoverMs = Math.max(0, 1280 - (Date.now() - startedAt));
    window.setTimeout(() => {
      curtain.classList.remove('is-covering');
      curtain.classList.add('is-revealing');
      curtain.style.pointerEvents = 'none';
      window.setTimeout(() => {
        curtain.classList.remove('is-revealing');
        curtain.style.pointerEvents = 'none';
        busy = false;
      }, 480);
    }, minimumCoverMs);  }

  document.addEventListener('click', event => {
    if (window.__legendSceneTransitionBypass || busy || event.defaultPrevented) return;
    const target = event.target?.closest?.('[data-legend-scene-transition],[data-ash-view],[data-travel],[data-unlock]');
    if (!target || target.disabled || reduced()) return;
    if (target.dataset.legendTransitioning === '1') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    transitionTo(destinationLabel(target), () => {
      target.dataset.legendTransitioning = '1';
      window.__legendSceneTransitionBypass = true;
      try {
        target.click();
      } finally {
        window.__legendSceneTransitionBypass = false;
        delete target.dataset.legendTransitioning;
      }
    });
  }, true);

  // Other systems (notably combat outcomes) can use the same curtain when a
  // scene changes as the result of game state rather than a direct navigation.
  window.LegendSceneTransitionsV120 = Object.freeze({ transitionTo });

  const root = document.getElementById('root');
  if (root && 'MutationObserver' in window) {
    const observer = new MutationObserver(() => {
      if (reduced()) return;
      const screen = root.firstElementChild;
      if (!screen || screen.classList.contains('legend-scene-arriving')) return;
      screen.classList.add('legend-scene-arriving');
      window.requestAnimationFrame(() => screen.classList.add('legend-scene-arrived'));
      window.setTimeout(() => screen.classList.remove('legend-scene-arriving', 'legend-scene-arrived'), 520);
    });
    observer.observe(root, { childList: true });
  }
})();
