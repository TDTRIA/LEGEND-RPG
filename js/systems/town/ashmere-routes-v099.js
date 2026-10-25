/* LEGEND v0.20.36 - Ashmere/Greyfen route board presentation.
 * Keeps route-board copy, cards, and visual selection out of the town router.
 * Opening a route remains a callback decision owned by LegendAshmereV099.
 */
(() => {
  function render(context = {}) {
    const {
      getPlayer,
      head,
      screen,
      locationInterior,
      background,
      icon
    } = context;

    if (typeof getPlayer !== 'function' || typeof head !== 'function' ||
        typeof screen !== 'function' || typeof icon !== 'function') return;

    const player = getPlayer();
    const greyfen = String(player?.currentRegion || 'Ashmere') === 'Greyfen';

    if (greyfen) {
      screen(
        head(
          'Causeway Board',
          'Lowland Crossings',
          'The Old Road begins in Ashmere. From Greyfen, choose a known route, check local records, or learn which crossings remain safe.',
          typeof locationInterior === 'function' ? locationInterior('archive') : '',
          'route'
        ),
        '<div class="ash099-cards">' +
          '<button class="ash099-btn ash099-card" data-ash-view="regions">' + icon('regions') +
          '<strong>Road Network</strong><small>Pay the fare to return to Ashmere or travel onward to lands already opened.</small><em>Open map</em></button>' +
          '<button class="ash099-btn ash099-card" data-ash-view="people">' + icon('people') +
          '<strong>Ask the Keepers</strong><small>Compare the old boundary marks and hear the latest causeway warnings.</small><em>Visit the hall</em></button>' +
          '<button class="ash099-btn ash099-card" data-ash-view="marsh">' + icon('road') +
          '<strong>The Marsh Path</strong><small>Choose the raised posts or reed bed, salvage supplies, face a marsh encounter, and record the Waterline Gauge.</small><em>Prepare to depart</em></button>' +
          '<button class="ash099-btn ash099-card" data-ash-view="quests">' + icon('quest') +
          '<strong>Side Stories & Contracts</strong><small>Take keeper requests that reward exploration, victories, and a safe return.</small><em>Read postings</em></button>' +
        '</div>'
      );
      return;
    }

    screen(
      head(
        'Route Board',
        'Routes & Expeditions',
        'Choose your next destination. Open the regional network to unlock new lands, or enter the Old Road to search, fight, and bring proof home.',
        typeof background === 'function' ? background() : '',
        'route'
      ),
      '<div class="ash099-cards">' +
        '<button class="ash099-btn ash099-card" data-ash-view="road">' + icon('road') +
        '<strong>The Old Road</strong><small>Review your loadout and supplies, then enter a six-stop expedition with route choices and a safe return path.</small><em>Prepare to depart</em></button>' +
        '<button class="ash099-btn ash099-card" data-ash-view="regions">' + icon('regions') +
        '<strong>Road Network</strong><small>View known regions, spend Road Tokens to unlock new lands, and travel between places.</small><em>Open map</em></button>' +
        '<button class="ash099-btn ash099-card" data-ash-view="quests">' + icon('quest') +
        '<strong>Side Stories & Contracts</strong><small>Follow local stories that ask you to scout, survive a fight, or bring an expedition home.</small><em>Read postings</em></button>' +
      '</div>'
    );
  }

  window.LegendAshmereRoutesV099 = Object.freeze({ render });
})();
