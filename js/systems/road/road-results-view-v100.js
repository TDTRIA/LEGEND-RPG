/* LEGEND v0.20.36 - Old Road result-screen presentation.
 * Owns the secured/defeat outcome frame and its Return button binding.
 * Settlement, flags, rewards, and return policy are supplied by road-results-v100.
 */
(() => {
  function create(context = {}) {
    const { renderHeader, renderShell, escapeHtml, onReturn, onReportToMara } = context;
    if (typeof renderHeader !== 'function' || typeof renderShell !== 'function' ||
        typeof escapeHtml !== 'function') return null;
    const header = renderHeader;
    const shell = renderShell;
    const esc = escapeHtml;

    function render({ player, state, kicker, title, text } = {}) {
      if (!player || !state) return;
      const journal = player.flags?.roadFieldJournalV150 || {};
      const trip = Number(state.trips || 0);
      const routes = (Array.isArray(journal.routes) ? journal.routes : []).filter(entry => Number(entry.trip || 0) === trip);
      const discoveries = (Array.isArray(journal.discoveries) ? journal.discoveries : []).filter(entry => Number(entry.trip || 0) === trip);
      const camps = (Array.isArray(journal.campReports) ? journal.campReports : []).filter(entry => Number(entry.trip || 0) === trip);
      const routeName = state.routeChoice === 'ridge' ? 'High Ridge' : state.routeChoice === 'reeds' ? 'Reed Cut' : 'Route unrecorded';
      const routeNote = routes.slice(-1)[0];
      const canReportToMara = String(title || '') === 'Expedition Secured' &&
        trip === 1 &&
        String(player.currentRegion || 'Ashmere') === 'Ashmere' &&
        player.flags?.firstRoadReturnSeen === true &&
        player.flags?.firstRoadReturnMaraBriefed !== true;
      const maraAction = canReportToMara
        ? '<button class="exp100-dock-action" id="outcomeReportToMara" data-legend-scene-transition="Bringing the field report to Mara"><strong>Report to Mara</strong><span>Bring your route notes and discoveries to the town record keeper.</span></button>'
        : '';
      const discoveryMarkup = discoveries.length
        ? discoveries.slice(-3).reverse().map(entry => '<li><strong>' + esc(entry.name || 'Road discovery') + '</strong><span>' + esc(entry.place || 'The Old Road') + '</span></li>').join('')
        : '<li><strong>No landmark recorded</strong><span>There is still more of this road to learn.</span></li>';
      const campMarkup = camps.length
        ? camps.slice(-2).reverse().map(entry => '<li><strong>' + esc(entry.place || 'Waystation') + '</strong><span>' + esc(entry.note || 'A night kept beside the road.') + '</span></li>').join('')
        : '<li><strong>No camp report</strong><span>You did not rest or keep watch on this trip.</span></li>';
      const report = '<section class="exp150-return-report" aria-label="Expedition field report"><div class="exp150-return-report-head"><span>FIELD REPORT · TRIP ' + trip + '</span><strong>Before you return</strong></div>' +
        '<div class="exp150-return-report-route"><small>ROUTE TAKEN</small><strong>' + esc(routeName) + '</strong><p>' + esc(routeNote?.note || (routeName === 'High Ridge' ? 'Firm ground led above the flooded lowland.' : routeName === 'Reed Cut' ? 'The low path brought you through waterlogged ground.' : 'The road report does not contain a chosen route.')) + '</p></div>' +
        '<div class="exp150-return-report-columns"><section><h3>Evidence brought back <b>' + discoveries.length + '</b></h3><ul>' + discoveryMarkup + '</ul></section><section><h3>Camp reports <b>' + camps.length + '</b></h3><ul>' + campMarkup + '</ul></section></div>' +
        '<div class="exp150-return-report-foot"><span>' + Number((journal.visitedPlaces || []).length) + ' places known to your map</span><span>' + discoveries.length + (discoveries.length === 1 ? ' discovery' : ' discoveries') + ' this trip</span></div></section>';
      shell(header(player, state, kicker || 'EXPEDITION COMPLETE', title, text) + report +
        '<section class="exp100-explore-dock exp100-outcome"><div class="exp100-route"><span>THE ROAD REMEMBERS</span><strong>' +
        esc(title) + '</strong><small>' + esc(text) +
        '</small></div><div class="exp100-dock-actions"><button class="exp100-dock-action primary" id="outcomeReturn" data-legend-scene-transition="Reporting back to Ashmere"><strong>Return to Ashmere</strong><span>Leave the road and return to town.</span></button>' + maraAction + '</div></section>');
      document.getElementById('outcomeReturn')?.addEventListener('click', () => onReturn?.());
       document.getElementById('outcomeReportToMara')?.addEventListener('click', () => onReportToMara?.());
    }

    return Object.freeze({ render });
  }

  window.LegendRoadResultsViewV100 = Object.freeze({ create });
})();
