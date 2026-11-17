/* LEGEND v0.22.0 — browser boot checks and cinematic handoff. */
(() => {
  const screen = document.getElementById('legend-boot-screen');
  const state = window.__legendBootSequenceV100;
  if (!screen || !state) return;

  const paint = typeof state.paintProgress === 'function' ? state.paintProgress : () => {};
  const mark = typeof state.markStep === 'function' ? state.markStep : () => {};
  function reveal() {
    if (state.rendererLoading) { state.revealPending = true; return; }
    state.revealPending = false;
    screen.hidden = true;
    document.body.classList.remove('legend-booting');
    state.finishedAt = performance.now();
    state.durationMs = state.finishedAt - state.startedAt;
  }
  state.resumeReveal = () => { if (state.revealPending) reveal(); };
  async function start() {
    const dataReady = Boolean(window.LEGEND_DATA?.VERSION && window.LEGEND_DATA?.SAVE_KEY);
    const systems = {
      html: Boolean(window.LegendHtmlV120?.escapeHtml),
      storage: Boolean(window.LegendStorage?.loadPlayer),
      title: Boolean(window.LegendTitleScreenV120?.render && window.LegendTitleScreenViewV120?.render),
      game: Boolean(window.LegendGameBootstrap?.title),
      transitions: Boolean(window.LegendSceneTransitionsV120?.transitionTo),
      opening: Boolean(window.LegendRoadOpeningV140?.resume),
      town: Boolean(window.LegendAshmereV099?.renderAshmere)
    };
    const systemsReady = Object.values(systems).every(Boolean);
    state.checks = { manifest: dataReady, systems, systemsReady };

    mark('manifest', dataReady ? 'READY' : 'MISSING', dataReady);
    mark('systems', systemsReady ? 'LINKED' : 'PARTIAL', systemsReady);
    let saveFound = false;
    try { saveFound = dataReady && Boolean(window.localStorage.getItem(window.LEGEND_DATA.SAVE_KEY)); } catch (_) { /* Storage may be blocked; the title still works as a fresh journey. */ }
    mark('traveler', saveFound ? 'FOUND' : 'NEW JOURNEY', true);

    paint(91, 'Kindling the opening scene', 'Settling the title art and world paths');
    const titleBackdrop = document.querySelector('#root .v120-title-backdrop');
    const titleLogo = document.querySelector('#root .v120-legend-logo');
    const artReady = Boolean(titleBackdrop?.complete && titleBackdrop.naturalWidth > 0) &&
      Boolean(titleLogo?.complete && (titleLogo.naturalWidth > 0 || titleLogo.hidden));
    state.checks.artwork = artReady;
    mark('scene', artReady ? 'READY' : 'FALLBACK OK', true);

    // Startup checks remain, but the old branded loading screen is no longer shown.
    // Never hold the player at a loading screen after the required checks finish.

    if (!systemsReady) {
      paint(100, 'Opening recovery view', 'One or more game systems need attention');
    } else if (state.rendererLoading) {
      paint(100, 'World systems checked', 'Loading world artwork');
    } else {
      paint(100, 'The realm is ready', saveFound ? 'Traveler record located' : 'Ready for a new journey');
    }
    reveal();
  }

  start().catch(() => {
    paint(100, 'Opening the realm', 'Continuing with available systems');
    window.setTimeout(reveal, state.reducedMotion?.() ? 30 : 500);
  });
})();
