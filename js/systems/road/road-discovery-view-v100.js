/* LEGEND v0.20.36 - Old Road discovery panels.
 * Pure markup for clue reveals, the opening route fork, and the moved-cairn choice.
 * Discovery state and action handling stay in LegendRoadDiscoveryV100.
 */
(() => {
  function create(context = {}) {
    const { escapeHtml, getPointOfInterest } = context;
    if (typeof escapeHtml !== 'function' || typeof getPointOfInterest !== 'function') return null;
    const esc = escapeHtml;
    const pointOfInterest = getPointOfInterest;

    function pointOfInterestPanel(player, state, stage, visibleStage) {
      const point = pointOfInterest(stage);
      if (state.poiUsed && state.poiUsed[point.key]) return '';
      if (visibleStage !== Number(stage)) return '';
      return '<section class="exp100-poi exp100-discovery-beat"><div class="exp100-poi-icon">' +
        esc(point.icon) + '</div><div class="exp100-poi-copy"><span>YOU NOTICE SOMETHING · ' +
        esc(point.kind) + '</span><strong>' + esc(point.name) + '</strong><p>' + esc(point.text) +
        '</p><button class="exp100-poi-action" id="poiInspect">' + esc(point.action) +
        '</button><button class="exp100-poi-dismiss" id="poiLeave">Leave it</button></div></section>';
    }

    function routeChoicePanel(state, stage) {
      if (stage !== 0) return '';
      if (state.routeChoice) {
        const chosen = state.routeChoice === 'ridge' ? 'High Ridge' : 'Reed Cut';
        return '<section class="exp100-poi exp100-poi-done"><div class="exp100-poi-icon">↗</div><div class="exp100-poi-copy"><span>ROUTE DECISION · RECORDED</span><strong>' +
          chosen + '</strong><p>Your choice has shaped this expedition. The other track disappears into the mist behind you.</p></div></section>';
      }
      return '<section class="exp100-panel exp100-route-choice"><div class="exp100-kicker">THE ROAD FORKS</div><h2>Two ways through the lowlands</h2><p>The High Ridge looks longer but firm underfoot. The Reed Cut is shorter, though a cold blue glimmer moves between the reeds.</p><div class="exp100-choices"><button class="exp100-choice" id="routeRidge"><strong>Take the High Ridge</strong><span>Keep to firmer ground and avoid drawing attention.</span><em>Safer · Road Pressure −8</em></button><button class="exp100-choice" id="routeReeds"><strong>Risk the Reed Cut</strong><span>Follow the strange light and search for what it is guarding.</span><em>Riskier · Gain 1 Bell Fragment, Road Pressure +10</em></button></div></section>';
    }

    function movedCairnDecisionPanel(player, state, stage) {
      const contract = player?.flags?.sideContracts?.movedCairn;
      if (stage !== 1 || state.routeChoice !== 'ridge' || !contract ||
          contract.complete || contract.decision || !state.poiUsed?.['ridge-cairn']) return '';
      return '<section class="exp100-panel exp100-moved-cairn"><div class="exp100-kicker">SIDE STORY · THE MOVED CAIRN</div><h2>One stone sits wrong</h2><p>The cairn looks ordinary until you notice the fresh split face set beyond an older groove. Cart tracks turn toward softer ground below. Oric asked you to report the danger, but the safest next step is yours to choose.</p><div class="exp100-choices"><button type="button" class="exp100-choice" data-moved-cairn="restore"><strong>Restore the older alignment</strong><span>Set the stone back into its weathered groove. The repair will be visible, but you cannot know why it was moved.</span><em>Act now · leave a fresh trace</em></button><button type="button" class="exp100-choice" data-moved-cairn="record"><strong>Record both positions</strong><span>Sketch the old groove and the current stone before leaving it untouched. Preserve the evidence for Mara and Oric.</span><em>Preserve evidence · leave the site unchanged</em></button><button type="button" class="exp100-choice" data-moved-cairn="warn"><strong>Mark the hazard and step back</strong><span>Warn the next travelers without shifting the stone. The route remains uncertain until someone can inspect it properly.</span><em>Prioritize caution · defer the repair</em></button></div></section>';
    }

    return Object.freeze({ pointOfInterestPanel, routeChoicePanel, movedCairnDecisionPanel });
  }

  window.LegendRoadDiscoveryViewV100 = Object.freeze({ create });
})();
