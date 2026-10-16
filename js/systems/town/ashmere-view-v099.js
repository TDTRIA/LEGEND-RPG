/* LEGEND v0.20.36 - shared Ashmere/Greyfen screen shell.
 * Owns town screen framing, header/back rendering, and the town UI audio binding.
 * The route facade injects the root, player accessor, art helpers and navigation.
 */
(() => {
  const AUDIO_CUE = {
    hover: 'assets/audio/ui/ui_hover_soft.wav',
    confirm: 'assets/audio/ui/ui_confirm_gate.wav'
  };

  function create(config = {}) {
    const {
      root,
      getPlayer,
      escapeHtml: esc,
      imageMarkup: img,
      icon,
      renderTown,
      bindNavigation
    } = config;

    if (typeof root !== 'function' || typeof getPlayer !== 'function' ||
        typeof esc !== 'function' || typeof img !== 'function' ||
        typeof icon !== 'function') return null;

    let lastHoverCue = 0;

    function playUiCue(kind) {
      try {
        const audio = new Audio(AUDIO_CUE[kind]);
        audio.volume = kind === 'hover' ? 0.10 : 0.18;
        audio.play().catch(() => {});
      } catch {}
    }

    function bindUiAudio() {
      const host = root();
      if (!host) return;
      host.querySelectorAll('button, a.btn, a.portal-secondary-btn').forEach(element => {
        if (element.dataset.legendAudioBound) return;
        element.dataset.legendAudioBound = '1';
        element.addEventListener('pointerenter', () => {
          const now = Date.now();
          if (now - lastHoverCue > 110) {
            lastHoverCue = now;
            playUiCue('hover');
          }
        });
        element.addEventListener('click', () => playUiCue('confirm'));
      });
    }

    function shell(html) {
      const host = root();
      if (!host) return;
      host.innerHTML = `<main class="ash099 ash099-terminal"><div class="ash099-wrap">${html}</div></main>`;
      bindUiAudio();
    }

    function back(extra = '') {
      const region = String(getPlayer()?.currentRegion || 'Ashmere');
      const label = region === 'Greyfen' ? 'Back to Greyfen' : 'Back to Ashmere';
      return `<div class="ash099-bottom">${extra}<button class="ash099-btn primary" id="ashBack">${label}</button></div>`;
    }

    function head(kicker, title, description, art = '', fallbackIcon = 'quest') {
      return `<div class="ash099-head ${art ? 'has-art' : 'no-art'}">${art ? img(art, title) : `<div class="ash099-head-icon">${icon(fallbackIcon)}</div>`}<div><div class="ash099-kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div></div>`;
    }

    function screen(header, body, extra = '') {
      shell(`<section class="ash099-screen">${header}${body}${back(extra)}</section>`);
      const backButton = root()?.querySelector('#ashBack');
      if (backButton && typeof renderTown === 'function') {
        backButton.onclick = renderTown;
      }
      if (typeof bindNavigation === 'function') bindNavigation();
    }

    return Object.freeze({ shell, back, head, screen });
  }

  window.LegendAshmereViewV099 = Object.freeze({ create });
})();
