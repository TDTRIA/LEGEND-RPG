/* LEGEND v0.20.36 - Old Road result-screen presentation.
 * Owns the secured/defeat outcome frame and its Return button binding.
 * Settlement, flags, rewards, and return policy are supplied by road-results-v100.
 */
(() => {
  function create(context = {}) {
    const { renderHeader, renderShell, escapeHtml, onReturn } = context;
    if (typeof renderHeader !== 'function' || typeof renderShell !== 'function' ||
        typeof escapeHtml !== 'function') return null;
    const header = renderHeader;
    const shell = renderShell;
    const esc = escapeHtml;

    function render({ player, state, kicker, title, text } = {}) {
      if (!player || !state) return;
      shell(header(player, state, kicker || 'EXPEDITION COMPLETE', title, text) +
        '<section class="exp100-explore-dock exp100-outcome"><div class="exp100-route"><span>THE ROAD REMEMBERS</span><strong>' +
        esc(title) + '</strong><small>' + esc(text) +
        '</small></div><div class="exp100-dock-actions"><button class="exp100-dock-action primary" id="outcomeReturn"><strong>Return to Ashmere</strong><span>Leave the road and return to town.</span></button></div></section>');
      document.getElementById('outcomeReturn')?.addEventListener('click', () => onReturn?.());
    }

    return Object.freeze({ render });
  }

  window.LegendRoadResultsViewV100 = Object.freeze({ create });
})();
