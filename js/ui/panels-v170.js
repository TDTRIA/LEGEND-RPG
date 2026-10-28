/* LEGEND persistent world shell v170 — data-driven panels. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const safeNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const pct = (value, maximum) => Math.max(0, Math.min(100, Math.round((safeNumber(value) / Math.max(1, safeNumber(maximum))) * 100)));
  const humanize = value => String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());

  const RASTER_ICON_NAMES = Object.freeze([
    'compass', 'journal', 'traveler', 'inn', 'market', 'forge', 'road', 'settings', 'milestone'
  ]);
  const DESTINATION_ICON_BY_VIEW = Object.freeze({
    home: 'inn', people: 'traveler', inn: 'inn', trader: 'market', smith: 'forge',
    work: 'milestone', dungeon: 'milestone', crossing: 'compass', craft: 'forge',
    sheet: 'traveler', archive: 'journal', routes: 'compass', quests: 'journal',
    road: 'road', regions: 'compass', profile: 'traveler'
  });

  function rasterIcon(name) {
    const icon = RASTER_ICON_NAMES.includes(name) ? name : 'milestone';
    return '<span class="lws-btn-icon runway-icon runway-icon-' + icon + '" aria-hidden="true"></span>';
  }

  // Phase 4 Ashmere POI selection is presentation-only state. It never writes to
  // the traveler record; entering a place delegates to the real Ashmere route.
  const ASHMERE_POIS = Object.freeze({
    inn: {
      view: 'inn', name: 'Ashmere Inn', icon: '⌂', eyebrow: 'REST & RUMORS',
      detail: 'The inn offers rest, supplies, and a place to hear what road travelers are saying.',
      action: 'Enter the Inn'
    },
    market: {
      view: 'trader', name: 'Market', icon: '◇', eyebrow: 'TRADE & SUPPLIES',
      detail: 'Trade for provisions and sell what you have brought back from the road.',
      action: 'Visit the Market'
    },
    forge: {
      view: 'smith', name: 'Forge & Workshop', icon: '⚒', eyebrow: 'GEAR & CRAFT',
      detail: 'Choose weapons and armor, then put gathered materials to work at the bench.',
      action: 'Visit the Forge'
    },
    road: {
      view: 'road', name: 'Old Road Gate', icon: '➜', eyebrow: 'THE BORDERLANDS',
      detail: 'Pass the gate, study the departure briefing, and take the Old Road into the borderlands.',
      action: 'Approach the Old Road Gate'
    }
  });
  let selectedAshmerePoi = null;

  function getSelectedAshmerePoi() {
    return selectedAshmerePoi ? ASHMERE_POIS[selectedAshmerePoi] || null : null;
  }

  function selectAshmerePoi(id) {
    if (!Object.prototype.hasOwnProperty.call(ASHMERE_POIS, String(id || ''))) return false;
    selectedAshmerePoi = String(id);
    return true;
  }

  function syncTownScene(player, context, root) {
    const town = root?.querySelector('.ash100-town-ashmere');
    root?.querySelectorAll('.ash100-destination.lws-poi-active').forEach(node => node.classList.remove('lws-poi-active'));
    if (!town || context?.kind !== 'town' || String(player?.currentRegion || player?.town || 'Ashmere') !== 'Ashmere') {
      root?.querySelector('.lws-poi-scene-note')?.remove();
      return;
    }

    const poi = getSelectedAshmerePoi();
    const native = poi ? town.querySelector('.ash100-destination[data-ash-view="' + poi.view + '"]') : null;
    if (!poi || !native) {
      if (poi && !native) selectedAshmerePoi = null;
      town.querySelector('.lws-poi-scene-note')?.remove();
      return;
    }
    native.classList.add('lws-poi-active');

    const noteHtml = '<span class="lws-poi-scene-kicker">' + esc(poi.eyebrow) + '</span>' +
      '<strong>' + esc(poi.name) + '</strong><p>' + esc(poi.detail) + '</p>';
    let note = town.querySelector('.lws-poi-scene-note');
    if (!note) {
      note = document.createElement('aside');
      note.className = 'lws-poi-scene-note';
      note.setAttribute('aria-label', 'Selected Ashmere point of interest');
      note.setAttribute('aria-live', 'polite');
      const hero = town.querySelector('.ash100-hero');
      if (!hero) return;
      hero.insertAdjacentElement('afterend', note);
    }
    if (note.innerHTML !== noteHtml) note.innerHTML = noteHtml;
  }

  function renderAshmerePoiPanel(root) {
    let current = getSelectedAshmerePoi();
    if (current) {
      const native = root?.querySelector('.ash100-town-ashmere .ash100-destination[data-ash-view="' + current.view + '"]');
      if (!native || native.disabled || native.getAttribute('aria-disabled') === 'true') {
        selectedAshmerePoi = null;
        current = null;
      }
    }
    const placeOptions = Object.entries(ASHMERE_POIS).map(([id, poi]) => {
      const native = root?.querySelector('.ash100-town-ashmere .ash100-destination[data-ash-view="' + poi.view + '"]');
      const disabled = !native || native.disabled || native.getAttribute('aria-disabled') === 'true';
      return '<button class="lws-place-option' + (selectedAshmerePoi === id ? ' is-selected' : '') + '" type="button" data-world-place="' + id + '" aria-pressed="' + String(selectedAshmerePoi === id) + '"' +
        (disabled ? ' disabled aria-disabled="true"' : '') + '><span class="lws-place-option-icon runway-icon runway-icon-' + id + '" aria-hidden="true"></span><span class="lws-place-option-copy"><strong>' + esc(poi.name) + '</strong><small>' + esc(poi.eyebrow) + '</small></span><span class="lws-place-option-state">' + (selectedAshmerePoi === id ? 'In view' : 'Look closer') + '</span></button>';
    }).join('');
    const selectedMarkup = current
      ? '<section class="lws-selected-place" aria-label="Selected place details"><span class="lws-panel-eyebrow">Landmark in view</span><h3>' + esc(current.name) + '</h3><p>' + esc(current.detail) + '</p><button type="button" class="lws-btn primary lws-visit-place" data-world-action="visit-selected-place"><span class="lws-btn-icon runway-icon runway-icon-' + selectedAshmerePoi + '" aria-hidden="true"></span><span class="lws-btn-copy"><strong>' + esc(current.action) + '</strong><small>Enter this place</small></span></button></section>'
      : '<div class="lws-poi-hint"><strong>Where will you go next?</strong><p>Choose a destination to learn what it offers before you step inside.</p></div>';
    const excluded = Object.values(ASHMERE_POIS).map(poi => poi.view);
    const otherDestinations = destinationButtons(root, excluded);
    return '<div class="lws-panel-header"><div><span class="lws-panel-eyebrow">Ashmere · Under the lanterns</span><h2>Landmarks &amp; Services</h2><p>Find shelter, supplies, craft, and the roads that lead beyond the walls.</p></div></div>' +
      '<div class="lws-panel-scroll"><section class="lws-poi-picker" aria-label="Ashmere points of interest"><div class="lws-place-option-list">' + placeOptions + '</div>' + selectedMarkup + '</section>' +
      (otherDestinations ? '<section class="lws-other-destinations"><div class="lws-section-title"><span>More of Ashmere</span></div><div class="lws-action-list">' + otherDestinations + '</div></section>' : '') +
      '<button class="lws-btn quiet lws-town-routes" type="button" data-world-action="map">' + rasterIcon('compass') + '<span class="lws-btn-copy"><strong>Road Network</strong><small>Follow the marked roads beyond town</small></span></button></div>';
  }

  function objectiveFor(player, root, context) {
    const sceneObjective = root?.querySelector('.ash100-route-strip-copy strong, .ash100-departure-card h2, .exp150-title-group h1');
    if (context?.kind === 'expedition-results') return 'Field report secured — choose a return or handoff';
    if (context?.kind === 'road') {
      const state = player?.flags?.roadExpeditionV100 || {};
      if (Number(state.stage || 0) >= 5) return 'Secure your return to Ashmere';
      if (state.activeSideTripV160) return 'Finish the optional stop, then return to the route';
      if (Number(state.stage || 0) === 0 && !state.routeChoice) return 'Choose a route at the South Fork';
      if (player?.flags?.bellQuestStarted && !player?.flags?.bellRoadSearched) return 'Search the Old Road for the Bell Fragment';
      return 'Press onward, investigate, and record what the road reveals';
    }
    const quest = Array.isArray(player?.questLog)
      ? player.questLog.find(entry => /^The Bell That Rang Once:/i.test(String(entry)))
      : null;
    if (quest) return String(quest).replace(/^The Bell That Rang Once:\s*/i, '');
    const flags = player?.flags || {};
    if (flags.bellQuestStarted && !flags.bellRoadSearched) return 'Explore the Old Road for the Bell Fragment';
    if (flags.bellRoadSearched && !flags.bellQuestComplete) return 'Bring the Bell Fragment to Brenn';
    if (flags.bellQuestComplete && !flags.firstRoadComplete) return 'Bring three Road Tokens to Brenn';
    if (flags.firstRoadComplete) return 'Prepare for the next descent';
    if (sceneObjective?.textContent?.trim()) return sceneObjective.textContent.trim();
    return 'Ask a local or check the work board for a lead.';
  }

  function screenHeading(root, fallback) {
    const candidates = [
      '.exp150-title-group h1',
      '.ash100-hero-copy h1',
      '.ash099-screen h1',
      '.reg100-screen h1',
      '#root h1'
    ];
    for (const selector of candidates) {
      const heading = root?.querySelector(selector);
      const value = heading?.textContent?.trim();
      if (value) return value;
    }
    return fallback || 'The Borderlands';
  }

  function renderLeftPanel(player, context, root) {
    const name = esc(player?.username || 'Traveler');
    const className = esc(player?.className || 'Wanderer');
    const level = Math.max(1, safeNumber(player?.level || 1));
    const hp = Math.max(0, safeNumber(player?.hp));
    const maxHp = Math.max(1, safeNumber(player?.maxHp || 1));
    const healthPercent = pct(hp, maxHp);
    const objective = esc(objectiveFor(player, root, context));
    const quests = Array.isArray(player?.questLog) ? player.questLog.slice(0, 3) : [];
    const roadJournal = player?.flags?.roadFieldJournalV150 || {};
    const visits = Array.isArray(roadJournal.visitedPlaces) ? roadJournal.visitedPlaces.length : 0;
    const discoveries = Array.isArray(roadJournal.discoveries) ? roadJournal.discoveries.length : 0;
    const routes = Array.isArray(roadJournal.routes) ? roadJournal.routes.length : 0;
    const reports = Array.isArray(roadJournal.campReports) ? roadJournal.campReports.length : 0;
    const day = Math.max(1, safeNumber(player?.day || 1));
    const inventory = player?.inventory || {};
    const roadTokens = Math.max(0, safeNumber(inventory.roadToken));

    const questMarkup = quests.length
      ? quests.map((entry, index) => {
          const text = String(entry || '');
          const colon = text.indexOf(':');
          const title = colon > 0 ? text.slice(0, colon) : (index === 0 ? 'Current lead' : 'Field note');
          const detail = colon > 0 ? text.slice(colon + 1).trim() : text;
          return '<li class="lws-quest-item"><strong>' + esc(title) + '</strong><p>' + esc(detail) + '</p></li>';
        }).join('')
      : '<li class="lws-quest-item"><strong>No active contract</strong><p>Check the work board or ask a local what needs doing.</p></li>';

    return '<div class="lws-panel-header"><div><span class="lws-panel-eyebrow">Traveler record</span><h2>' + name + '</h2><p>' + className + ' · Level ' + level + ' · Day ' + day + '</p></div><span class="lws-tag"><strong>' + roadTokens + '</strong> tokens</span></div>' +
      '<div class="lws-panel-scroll">' +
        '<section class="lws-section"><div class="lws-section-title"><span>Vitality</span><span>' + healthPercent + '%</span></div><div class="lws-health-line"><span>Health</span><strong>' + hp + ' / ' + maxHp + '</strong></div><div class="lws-meter" aria-label="Health ' + hp + ' of ' + maxHp + '"><span style="width:' + healthPercent + '%"></span></div><ul class="lws-small-list" style="margin-top:9px"><li><span>Gold</span><strong>' + Math.max(0, safeNumber(player?.gold)) + 'g</strong></li><li><span>Rations</span><strong>' + Math.max(0, safeNumber(inventory.food)) + '</strong></li><li><span>Healing potions</span><strong>' + Math.max(0, safeNumber(inventory.potion)) + '</strong></li></ul></section>' +
        '<section class="lws-section"><div class="lws-section-title"><span>' + (context?.kind === 'road' ? 'The road ahead' : 'Current lead') + '</span><span aria-hidden="true">✦</span></div><div class="lws-quest-item"><strong>' + objective + '</strong><p>' + (context?.kind === 'road' ? 'Every trail, find, and camp report leaves a mark in your field journal.' : 'Keep this lead close as you move through the borderlands.') + '</p></div></section>' +
        '<section class="lws-section"><div class="lws-section-title"><span>Quest log</span><span>' + quests.length + '</span></div><ul class="lws-small-list" style="display:block">' + questMarkup + '</ul></section>' +
        '<section class="lws-section"><div class="lws-section-title"><span>Field journal</span><span>Road notes</span></div><ul class="lws-small-list"><li><span>Places visited</span><strong>' + visits + '</strong></li><li><span>Discoveries</span><strong>' + discoveries + '</strong></li><li><span>Routes recorded</span><strong>' + routes + '</strong></li><li><span>Camp reports</span><strong>' + reports + '</strong></li></ul><p class="lws-note" style="margin-top:8px">Landmarks, discoveries, and camp reports gathered beyond the gate.</p><button class="lws-btn quiet" type="button" data-world-action="journal" style="margin-top:9px"><span class="lws-btn-icon" aria-hidden="true">✧</span><span class="lws-btn-copy"><strong>Open journal</strong><small>Review existing notes</small></span></button></section>' +
      '</div>';
  }

  function destinationButtons(root, excludedViews = []) {
    const controls = Array.from(root?.querySelectorAll('.ash100-destination[data-ash-view]') || []);
    const dedupe = new Set();
    const excluded = new Set(excludedViews);
    return controls.filter(button => {
      const view = String(button.dataset.ashView || '');
      if (!view || excluded.has(view) || dedupe.has(view)) return false;
      dedupe.add(view);
      return true;
    }).map(button => {
      const view = String(button.dataset.ashView || '');
      const command = ({
        home: 'Return to the town hub',
        people: 'Meet the townsfolk',
        inn: 'Enter the inn',
        trader: 'Visit the market',
        smith: 'Visit the forge',
        work: 'Open the Work Board',
        dungeon: 'Descend into the cellar',
        crossing: 'Approach the crossing',
        craft: 'Use the workbench',
        sheet: 'Review your traveler',
        archive: 'Read the journal',
        routes: 'View local routes',
        quests: 'Review contracts',
        road: 'Set out on the road',
        regions: 'View regional map',
        profile: 'Review traveler records'
      })[view] || button.querySelector('.ash100-destination-copy strong')?.textContent?.trim() || humanize(view);
      const detail = button.querySelector('.ash100-destination-copy small')?.textContent?.trim() || '';
      const iconName = DESTINATION_ICON_BY_VIEW[view] || 'milestone';
      return '<button class="lws-btn" type="button" data-world-route="' + esc(view) + '">' + rasterIcon(iconName) + '<span class="lws-btn-copy"><strong>' + esc(command) + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + '</span></button>';
    }).join('');
  }

  function renderRightPanel(player, context, root) {
    const heading = esc(context?.kind === 'road' ? 'The Old Road'
      : context?.kind === 'town' ? 'Landmarks & Services'
      : context?.kind === 'combat' ? 'The Battlefield'
      : context?.kind === 'combat-results' ? 'After the Fight'
      : context?.kind === 'expedition-results' ? 'Field Report'
      : context?.kind === 'dungeon' ? 'The Bell Cellar'
      : (context?.sublocation || 'Local Services'));
    let intro = 'Choose your next step.';
    let actions = '';
    if (context?.kind === 'road') {
      intro = 'Watch the ground, follow the markers, or make camp before the dark closes in.';
      const roadIconByAction = Object.freeze({
        'continue-road': 'road',
        'search-road': 'compass',
        'read-road': 'journal',
        'camp-rest': 'inn',
        'camp-craft': 'forge',
        'camp-watch': 'milestone',
        map: 'compass',
        journal: 'journal',
        'leave-road': 'road'
      });
      const action = (id, icon, title, detail, selector, primary = false) => {
        const target = selector ? root?.querySelector(selector) : null;
        if (!target) return '';
        const disabled = target.disabled || target.getAttribute('aria-disabled') === 'true';
        const iconName = roadIconByAction[id];
        const iconMarkup = rasterIcon(iconName || 'milestone');
        return '<button class="lws-btn ' + (primary ? 'primary' : '') + '" type="button" data-world-action="' + id + '"' + (disabled ? ' disabled aria-disabled="true"' : '') + '>' + iconMarkup + '<span class="lws-btn-copy"><strong>' + title + '</strong><small>' + detail + '</small></span></button>';
      };
      const state = player?.flags?.roadExpeditionV100 || {};
      const isCamp = !!root?.querySelector('#campRest, #campCraft, #campWatch');
      actions += action('continue-road', '➜', isCamp ? 'Continue along the road' : 'Press onward', isCamp ? 'Leave the waystation when ready' : 'Follow the road beyond the next marker', '#push', true);
      actions += action('search-road', '⌕', 'Search the area', 'Look for useful traces', '#search');
      actions += action('read-road', '◉', 'Read the road', 'Study tracks, markers, and signs of danger', '#careful');
      if (isCamp) {
        actions += action('camp-rest', '♨', 'Rest by the fire', 'Eat a ration and catch your breath', '#campRest');
        actions += action('camp-craft', '✧', 'Craft a road poultice', 'Prepare a poultice from gathered supplies', '#campCraft');
        actions += action('camp-watch', '◷', 'Keep watch', 'Spend a ration to keep watch through the dark hours', '#campWatch');
      }
      actions += action('map', '⌖', 'Road map', 'Review discovered places and route choices', '#exp150OpenMap');
      actions += action('journal', '✧', 'Field journal', 'Review discoveries and camp reports', '#exp150OpenJournal');
      actions += action('leave-road', '↩', 'Return to Ashmere', 'Return to the shelter of Ashmere', '#town');
      void state;
    } else if (context?.kind === 'combat') {
      intro = 'The fight is underway. Your commands are waiting on the battlefield.';
      actions = '<div class="lws-quest-item"><strong>Encounter in progress</strong><p>Return to the battle scene to fight, act, use an item, guard, or retreat.</p></div>';
    } else if (context?.kind === 'expedition-results') {
      intro = 'Your outing has come to an end. Review the report, then return to town or share what you found.';
      const hasReturn = !!root?.querySelector('#outcomeReturn');
      const hasMaraHandoff = !!root?.querySelector('#outcomeReportToMara');
      if (hasReturn) actions += '<button class="lws-btn primary" type="button" data-world-action="expedition-return">' + rasterIcon('road') + '<span class="lws-btn-copy"><strong>Return from expedition</strong><small>Head back toward Ashmere’s lanterns</small></span></button>';
      if (hasMaraHandoff) actions += '<button class="lws-btn" type="button" data-world-action="report-to-mara">' + rasterIcon('journal') + '<span class="lws-btn-copy"><strong>Hand off field notes</strong><small>Bring what you found to Mara</small></span></button>';
      if (!actions) actions = '<p class="lws-context-copy">Use the choices in the report to return to town.</p>';
    } else if (context?.kind === 'combat-results') {
      intro = 'The fight is over. Take stock of what it cost, then choose where the road leads next.';
      const hasContinue = !!root?.querySelector('#v152CombatContinue');
      const hasReturn = !!root?.querySelector('#v152CombatReturn');
      if (hasContinue) actions += '<button class="lws-btn primary" type="button" data-world-action="combat-continue">' + rasterIcon('milestone') + '<span class="lws-btn-copy"><strong>Continue</strong><small>Press onward with your journey</small></span></button>';
      if (hasReturn) actions += '<button class="lws-btn" type="button" data-world-action="combat-return">' + rasterIcon('road') + '<span class="lws-btn-copy"><strong>Return from results</strong><small>Leave the battlefield behind</small></span></button>';
      if (!actions) actions = '<p class="lws-context-copy">Continue using the choices in the results screen.</p>';
    } else if (context?.kind === 'dungeon') {
      intro = 'The old cellar winds through stone and darkness. Follow the choices laid out in the chamber.';
      const retreat = !!root?.querySelector('#vaultRetreat');
      const returnButton = !!root?.querySelector('#vaultReturn');
      if (retreat) actions += '<button class="lws-btn primary" type="button" data-world-action="dungeon-retreat">' + rasterIcon('road') + '<span class="lws-btn-copy"><strong>Retreat from delve</strong><small>Climb back toward the lanterns</small></span></button>';
      if (returnButton) actions += '<button class="lws-btn" type="button" data-world-action="dungeon-return">' + rasterIcon('inn') + '<span class="lws-btn-copy"><strong>Continue cellar return</strong><small>Follow the passage toward the surface</small></span></button>';
      if (!actions) actions = '<p class="lws-context-copy">Continue through the cellar choices in the central scene.</p>';
    } else if (context?.kind === 'town' && String(player?.currentRegion || player?.town || 'Ashmere') === 'Ashmere' && root?.querySelector('.ash100-town-ashmere')) {
      return renderAshmerePoiPanel(root);
    } else if (context?.kind === 'town') {
      intro = 'The settlement offers shelter, trade, and paths beyond the lantern line.';
      actions = destinationButtons(root);
      if (!actions) actions = '<p class="lws-context-copy">There is nothing further to visit from here. Return to the town streets or consult the road network.</p>';
      actions += '<button class="lws-btn quiet" type="button" data-world-action="map">' + rasterIcon('compass') + '<span class="lws-btn-copy"><strong>Road Network</strong><small>Follow the marked roads beyond town</small></span></button>';
    } else {
      intro = 'The settlement’s stores and records are close at hand. Return to its lanterns or prepare to travel again.';
      actions =
        '<button class="lws-btn primary" type="button" data-world-action="world">' + rasterIcon('inn') + '<span class="lws-btn-copy"><strong>Return to town</strong><small>Back to the town streets</small></span></button>' +
        '<button class="lws-btn" type="button" data-world-action="prepare-road">' + rasterIcon('road') + '<span class="lws-btn-copy"><strong>Prepare for the road</strong><small>Check your supplies before leaving the gate</small></span></button>' +
        '<button class="lws-btn" type="button" data-world-action="journal">' + rasterIcon('journal') + '<span class="lws-btn-copy"><strong>Quest & field journal</strong><small>Read your gathered notes and discoveries</small></span></button>';
    }
    return '<div class="lws-panel-header"><div><span class="lws-panel-eyebrow">' + (context?.kind === 'road' ? 'Journey actions' : context?.kind === 'town' ? 'Town actions' : context?.kind === 'expedition-results' ? 'Expedition debrief' : context?.kind === 'combat' ? 'Live encounter' : 'Context actions') + '</span><h2>' + heading + '</h2><p>' + esc(intro) + '</p></div></div><div class="lws-panel-scroll"><div class="lws-action-list">' + actions + '</div></div>';
  }

  function renderBottomBar(context) {
    const active = context?.kind || 'town';
    const lockNavigation = active === 'combat' || active === 'combat-results';
    const worldTitle = active === 'road' ? 'Town' : active === 'dungeon' ? 'Retreat' : active === 'expedition-results' ? 'Return' : active === 'combat' || active === 'combat-results' ? 'Encounter' : 'World';
    const bottomIconByAction = Object.freeze({
      world: 'inn',
      inventory: 'traveler',
      journal: 'journal',
      map: 'compass',
      combat: 'milestone',
      settings: 'settings'
    });
    const button = (action, icon, title, primary = false, disabled = false) => {
      const iconName = bottomIconByAction[action];
      const iconMarkup = rasterIcon(iconName || 'milestone');
      return '<button type="button" class="lws-btn ' + (primary ? 'primary' : 'quiet') + '" data-world-action="' + action + '"' + (disabled ? ' disabled aria-disabled="true"' : '') + '>' + iconMarkup + '<span class="lws-btn-copy"><strong>' + title + '</strong></span></button>';
    };
    const combatAvailable = active === 'combat';
    return button('world', '⌂', worldTitle, false, lockNavigation) +
      button('inventory', '◇', 'Inventory', true) +
      button('journal', '✧', 'Journal', false, lockNavigation) +
      button('map', '⌖', 'Map', false, lockNavigation) +
      button('combat', '⚔', 'Combat', false, !combatAvailable) +
      button('settings', '⚙', 'Settings');
  }

  window.LegendWorldShellPanelsV170 = Object.freeze({
    objectiveFor,
    screenHeading,
    renderLeftPanel,
    renderRightPanel,
    renderBottomBar,
    selectAshmerePoi,
    getSelectedAshmerePoi,
    syncTownScene
  });
})();
