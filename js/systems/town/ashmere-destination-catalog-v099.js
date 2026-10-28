/* LEGEND Ashmere/Greyfen destination catalog.
 * Keeps region-specific town card copy and optional art keys out of the hub renderer.
 * No DOM, storage, navigation, or asset lookup lives in this catalog.
 */
(() => {
  function forRegion(regionId, currentView, flags = {}) {
    const greyfen = String(regionId || 'Ashmere') === 'Greyfen';
    if (greyfen) {
      const destinations = [
        { view: 'inn', title: 'Reedlight Inn', desc: 'Rest, recover, and hear what the lowland travelers whisper.', cta: 'Rest & prepare', iconKey: 'inn', featured: currentView === 'inn' },
        { view: 'trader', title: 'Marsh Market', desc: 'Trade road loot for rations, medicine, and useful supplies.', cta: 'Trade', iconKey: 'trader', shopKey: 'greyfenMarket', featured: false },
        { view: 'smith', title: 'Causeway Smithy', desc: 'Equip better gear and turn gathered materials into useful things.', cta: 'Gear & craft', iconKey: 'smith', shopKey: 'greyfenForge', featured: false },
        { view: 'people', title: 'Town Square', desc: 'Meet the keepers and travelers who know the drowned roads.', cta: 'Meet the town', iconKey: 'people', featured: currentView === 'people' },
        { view: 'crossing', title: 'A Dry Crossing', desc: flags.greyfenDryCrossingComplete ? 'The washed route marker is recovered and recorded.' : 'Recover a washed route marker. Choose the raised posts or risk the reed bed. ', cta: flags.greyfenDryCrossingComplete ? 'Review contract' : 'Take contract', iconKey: 'route', featured: currentView === 'crossing' },
        { view: 'marsh', title: 'The Marsh Path', desc: flags.greyfenMarshPathComplete ? 'The waterline report is saved. Take another trip to gather more field notes and supplies.' : 'Choose the raised posts or pay a ration to take the reed-bed route. Face or avoid a marsh encounter, rest at a shelter, and record the Waterline Gauge.', cta: 'Set out', iconKey: 'road', featured: currentView === 'marsh' },
        { view: 'work', title: 'Bellkeeper’s Hall', desc: 'Take practical work while learning the rhythms of Greyfen.', cta: 'Find work', iconKey: 'work', featured: currentView === 'work' },
        { view: 'regions', title: 'Road Network', desc: 'Return to Ashmere or travel between lands you have unlocked.', cta: 'Travel', iconKey: 'regions', featured: currentView === 'regions' },
      ];
      if (flags.greyfenDryCrossingComplete) {
        destinations.splice(6, 0, {
          view: 'storehouse',
          title: 'The Silted Storehouse',
          desc: 'Enter an optional three-room lowland delve, choose a safer or riskier approach, preserve a damp dispatch, and recover useful supplies.',
          cta: 'Explore the storehouse',
          iconKey: 'dungeon',
          featured: currentView === 'storehouse'
        });
      }
      return destinations;
    }
    const destinations = [
      { view: 'inn', title: 'Ashmere Inn', desc: 'Rest, recover, buy supplies, and hear what travelers are saying.', cta: 'Rest & prepare', iconKey: 'inn', shopKey: 'ashmereInn', featured: currentView === 'inn' },
      { view: 'trader', title: 'Market', desc: 'Buy essentials, sell road loot, and turn discoveries into gold.', cta: 'Trade', iconKey: 'trader', shopKey: 'ashmereTrader', featured: false },
      { view: 'smith', title: 'Forge & Workshop', desc: 'Upgrade weapons and armor, then use the crafting bench for road finds.', cta: 'Gear & craft', iconKey: 'smith', shopKey: 'ashmereForge', featured: false },
      { view: 'people', title: 'Town Square', desc: 'Talk with Mara Vell, Old Brenn, and Captain Oric. Hear warnings and follow local stories.', cta: 'Meet the town', iconKey: 'people', featured: ['people', 'mara', 'brenn', 'oric'].includes(currentView) },
      { view: 'work', title: 'Work Board', desc: 'Take paid jobs, test your timing, and earn gold plus useful supplies.', cta: 'Browse jobs', iconKey: 'work', featured: currentView === 'work' },
      { view: 'road', title: 'Old Road Gate', desc: 'Begin the expedition; find clues, face danger, and bring proof home.', cta: 'Begin expedition', iconKey: 'road', featured: currentView === 'road' },
      { view: 'regions', title: 'Road Network', desc: 'Unlock new regions with Road Tokens, then travel between places you know for gold.', cta: 'Open map', iconKey: 'regions', featured: currentView === 'regions' },

    ];
    if (flags.firstRoadReturnSeen) destinations.splice(5, 0, {
      view: 'dungeon', title: 'The Bell Cellar', desc: 'A sealed stair beneath the archive. Explore the rooms below, face the sentinel, and bring a relic home.', cta: 'Descend', iconKey: 'dungeon', featured: currentView === 'dungeon'
    });
    return destinations;
  }

  window.LegendAshmereDestinationCatalogV099 = Object.freeze({ forRegion });
})();
