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
      detail: 'Buy essentials and sell road loot through Ashmere’s existing market.',
      action: 'Visit the Market'
    },
    forge: {
      view: 'smith', name: 'Forge & Workshop', icon: '⚒', eyebrow: 'GEAR & CRAFT',
      detail: 'Review weapons and armor, then use the existing workshop and crafting bench.',
      action: 'Visit the Forge'
    },
    road: {
      view: 'road', name: 'Old Road Gate', icon: '➜', eyebrow: 'THE BORDERLANDS',
      detail: 'Review the existing departure briefing before setting out on the Old Road.',
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

    const noteHtml = '<span class="lws-poi-scene-kicker">' + esc(poi.eyebrow) + ' · SELECTED PLACE</span>' +
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
    const current = getSelectedAshmerePoi();
    const placeOptions = Object.entries(ASHMERE_POIS).map(([id, poi]) => {
      const native = root?.querySelector('.ash100-town-ashmere .ash100-destination[data-ash-view="' + poi.view + '"]');
      const disabled = !native || native.disabled || native.getAttribute('aria-disabled') === 'true';
      return '<button class="lws-place-option' + (selectedAshmerePoi === id ? ' is-selected' : '') + '" type="button" data-world-place="' + id + '" aria-pressed="' + String(selectedAshmerePoi === id) + '"' +
        (disabled ? ' disabled aria-disabled="true"' : '') + '><span class="lws-place-option-icon" aria-hidden="true">' + poi.icon + '</span><span class="lws-place-option-copy"><strong>' + esc(poi.name) + '</strong><small>' + esc(poi.eyebrow) + '</small></span><span class="lws-place-option-state">' + (selectedAshmerePoi === id ? 'Selected' : 'Inspect') + '</span></button>';
    }).join('');
    const selectedMarkup = current
      ? '<section class="lws-selected-place" aria-label="Selected place details"><span class="lws-panel-eyebrow">Selected location</span><h3>' + esc(current.name) + '</h3><p>' + esc(current.detail) + '</p><button type="button" class="lws-btn primary lws-visit-place" data-world-action="visit-selected-place"><span class="lws-btn-icon" aria-hidden="true">' + current.icon + '</span><span class="lws-btn-copy"><strong>' + esc(current.action) + '</strong><small>Open the existing game service</small></span></button></section>'
      : '<div class="lws-poi-hint"><strong>Choose a place to inspect it.</strong><p>The town scene stays in view. Enter a place only when you are ready to use its existing service.</p></div>';
    const excluded = Object.values(ASHMERE_POIS).map(poi => poi.view);
    const otherDestinations = destinationButtons(root, excluded);
    return '<div class="lws-panel-header"><div><span class="lws-panel-eyebrow">Ashmere · Town scene</span><h2>Places of Interest</h2><p>Inspect a destination, then enter through the existing game route.</p></div></div>' +
      '<div class="lws-panel-scroll"><section class="lws-poi-picker" aria-label="Ashmere points of interest"><div class="lws-place-option-list">' + placeOptions + '</div>' + selectedMarkup + '</section>' +
      (otherDestinations ? '<section class="lws-other-destinations"><div class="lws-section-title"><span>Other destinations</span><span>Town services</span></div><div class="lws-action-list">' + otherDestinations + '</div></section>' : '') +
      '<button class="lws-btn quiet lws-town-routes" type="button" data-world-action="map"><span class="lws-btn-icon" aria-hidden="true">⌖</span><span class="lws-btn-copy"><strong>Town routes</strong><small>Open the existing route screen</small></span></button></div>';
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
    return 'Find your next lead in town';
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
          const title = colon > 0 ? text.slice(0, colon) : (index === 0 ? 'Current Quest' : 'Quest Note');
          const detail = colon > 0 ? text.slice(colon + 1).trim() : text;
          return '<li class="lws-quest-item"><strong>' + esc(title) + '</strong><p>' + esc(detail) + '</p></li>';
        }).join('')
      : '<li class="lws-quest-item"><strong>No recorded quest yet</strong><p>Speak with the people of Ashmere to find a lead.</p></li>';

    return '<div class="lws-panel-header"><div><span class="lws-panel-eyebrow">Traveler record</span><h2>' + name + '</h2><p>' + className + ' · Level ' + level + ' · Day ' + day + '</p></div><span class="lws-tag"><strong>' + roadTokens + '</strong> tokens</span></div>' +
      '<div class="lws-panel-scroll">' +
        '<section class="lws-section"><div class="lws-section-title"><span>Vitality</span><span>' + healthPercent + '%</span></div><div class="lws-health-line"><span>Health</span><strong>' + hp + ' / ' + maxHp + '</strong></div><div class="lws-meter" aria-label="Health ' + hp + ' of ' + maxHp + '"><span style="width:' + healthPercent + '%"></span></div><ul class="lws-small-list" style="margin-top:9px"><li><span>Gold</span><strong>' + Math.max(0, safeNumber(player?.gold)) + 'g</strong></li><li><span>Rations</span><strong>' + Math.max(0, safeNumber(inventory.food)) + '</strong></li><li><span>Healing potions</span><strong>' + Math.max(0, safeNumber(inventory.potion)) + '</strong></li></ul></section>' +
        '<section class="lws-section"><div class="lws-section-title"><span>Active objective</span><span aria-hidden="true">✦</span></div><div class="lws-quest-item"><strong>' + objective + '</strong><p>' + (context?.kind === 'road' ? 'Your choices on the road are recorded by the expedition system.' : 'Your next step is drawn from the current traveler record.') + '</p></div></section>' +
        '<section class="lws-section"><div class="lws-section-title"><span>Quest log</span><span>' + quests.length + '</span></div><ul class="lws-small-list" style="display:block">' + questMarkup + '</ul></section>' +
        '<section class="lws-section"><div class="lws-section-title"><span>Field journal</span><span>V150</span></div><ul class="lws-small-list"><li><span>Places visited</span><strong>' + visits + '</strong></li><li><span>Discoveries</span><strong>' + discoveries + '</strong></li><li><span>Routes recorded</span><strong>' + routes + '</strong></li><li><span>Camp reports</span><strong>' + reports + '</strong></li></ul><p class="lws-note" style="margin-top:8px">This panel reads the saved journal. It does not create or replace journal records.</p><button class="lws-btn quiet" type="button" data-world-action="journal" style="margin-top:9px"><span class="lws-btn-icon" aria-hidden="true">✧</span><span class="lws-btn-copy"><strong>Open journal</strong><small>Review existing notes</small></span></button></section>' +
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
      })[view] || 'Open destination';
      const icon = view === 'road' ? '➜' : view === 'inn' ? '⌂' : view === 'trader' ? '◇' : view === 'smith' ? '⚒' : view === 'dungeon' ? '⌑' : view === 'people' ? '♙' : '✦';
      return '<button class="lws-btn" type="button" data-world-route="' + esc(view) + '"><span class="lws-btn-icon" aria-hidden="true">' + icon + '</span><span class="lws-btn-copy"><strong>' + esc(command) + '</strong><small>Use the current game destination</small></span></button>';
    }).join('');
  }

  function renderRightPanel(player, context, root) {
    const heading = esc(context?.kind === 'road' ? 'Road Actions'
      : context?.kind === 'town' ? 'Town Actions'
      : context?.kind === 'combat' ? 'Encounter Actions'
      : context?.kind === 'combat-results' ? 'Results Actions'
      : context?.kind === 'expedition-results' ? 'Field Report Actions'
      : context?.kind === 'dungeon' ? 'Delve Actions'
      : 'Service Actions');
    let intro = 'Choose an action for the place you are visiting.';
    let actions = '';
    if (context?.kind === 'road') {
      intro = 'Actions use the live expedition handlers. Unavailable choices stay unavailable.';
      const action = (id, icon, title, detail, selector, primary = false) => {
        const target = selector ? root?.querySelector(selector) : null;
        if (!target) return '';
        const disabled = target.disabled || target.getAttribute('aria-disabled') === 'true';
        return '<button class="lws-btn ' + (primary ? 'primary' : '') + '" type="button" data-world-action="' + id + '"' + (disabled ? ' disabled aria-disabled="true"' : '') + '><span class="lws-btn-icon" aria-hidden="true">' + icon + '</span><span class="lws-btn-copy"><strong>' + title + '</strong><small>' + detail + '</small></span></button>';
      };
      const state = player?.flags?.roadExpeditionV100 || {};
      const isCamp = !!root?.querySelector('#campRest, #campCraft, #campWatch');
      actions += action('continue-road', '➜', isCamp ? 'Continue along the road' : 'Press onward', isCamp ? 'Leave the waystation when ready' : 'Advance using the expedition system', '#push', true);
      actions += action('search-road', '⌕', 'Search the area', 'Look for useful traces', '#search');
      actions += action('read-road', '◉', 'Read the road', 'Study the ground and lower pressure', '#careful');
      if (isCamp) {
        actions += action('camp-rest', '♨', 'Rest by the fire', 'Recover strength using camp supplies or a ration', '#campRest');
        actions += action('camp-craft', '✧', 'Craft a road poultice', 'Use the camp crafting action', '#campCraft');
        actions += action('camp-watch', '◷', 'Keep watch', 'Spend a ration to reduce pressure', '#campWatch');
      }
      actions += action('map', '⌖', 'Road map', 'Review discovered places and route choices', '#exp150OpenMap');
      actions += action('journal', '✧', 'Field journal', 'Review discoveries and camp reports', '#exp150OpenJournal');
      actions += action('leave-road', '↩', 'Return to Ashmere', 'Leave the expedition using its return handler', '#town');
      void state;
    } else if (context?.kind === 'combat') {
      intro = 'The encounter is active. Use the commands in the battlefield; this frame will not replace the combat system.';
      actions = '<div class="lws-quest-item"><strong>Encounter in progress</strong><p>FIGHT, ACT, ITEM, GUARD, and retreat are handled by the live battle scene. The shell keeps the traveler HUD visible without changing enemy state.</p></div>';
    } else if (context?.kind === 'expedition-results') {
      intro = 'Your field notes and secured rewards are recorded. Continue through the report controls rather than starting another road action.';
      const hasReturn = !!root?.querySelector('#outcomeReturn');
      const hasMaraHandoff = !!root?.querySelector('#outcomeReportToMara');
      if (hasReturn) actions += '<button class="lws-btn primary" type="button" data-world-action="expedition-return"><span class="lws-btn-icon" aria-hidden="true">↩</span><span class="lws-btn-copy"><strong>Return from expedition</strong><small>Leave the report and return to the town</small></span></button>';
      if (hasMaraHandoff) actions += '<button class="lws-btn" type="button" data-world-action="report-to-mara"><span class="lws-btn-icon" aria-hidden="true">✧</span><span class="lws-btn-copy"><strong>Hand off field notes</strong><small>Report the saved discoveries to Mara</small></span></button>';
      if (!actions) actions = '<p class="lws-context-copy">Use the choices in the report to return to town.</p>';
    } else if (context?.kind === 'combat-results') {
      intro = 'The live results screen owns the resolution and reward state. Continue or return through its existing choices.';
      const hasContinue = !!root?.querySelector('#v152CombatContinue');
      const hasReturn = !!root?.querySelector('#v152CombatReturn');
      if (hasContinue) actions += '<button class="lws-btn primary" type="button" data-world-action="combat-continue"><span class="lws-btn-icon" aria-hidden="true">➜</span><span class="lws-btn-copy"><strong>Continue</strong><small>Use the current results action</small></span></button>';
      if (hasReturn) actions += '<button class="lws-btn" type="button" data-world-action="combat-return"><span class="lws-btn-icon" aria-hidden="true">↩</span><span class="lws-btn-copy"><strong>Return from results</strong><small>Use the current return action</small></span></button>';
      if (!actions) actions = '<p class="lws-context-copy">Continue using the choices in the results screen.</p>';
    } else if (context?.kind === 'dungeon') {
      intro = 'The Bell Cellar keeps its own room decisions and retreat rules. This panel delegates to those controls.';
      const retreat = !!root?.querySelector('#vaultRetreat');
      const returnButton = !!root?.querySelector('#vaultReturn');
      if (retreat) actions += '<button class="lws-btn primary" type="button" data-world-action="dungeon-retreat"><span class="lws-btn-icon" aria-hidden="true">↩</span><span class="lws-btn-copy"><strong>Retreat from delve</strong><small>Use the cellar’s existing retreat handler</small></span></button>';
      if (returnButton) actions += '<button class="lws-btn" type="button" data-world-action="dungeon-return"><span class="lws-btn-icon" aria-hidden="true">⌂</span><span class="lws-btn-copy"><strong>Continue cellar return</strong><small>Use the current cellar action</small></span></button>';
      if (!actions) actions = '<p class="lws-context-copy">Continue through the cellar choices in the central scene.</p>';
    } else if (context?.kind === 'town' && String(player?.currentRegion || player?.town || 'Ashmere') === 'Ashmere' && root?.querySelector('.ash100-town-ashmere')) {
      return renderAshmerePoiPanel(root);
    } else if (context?.kind === 'town') {
      intro = 'Select a destination from the town’s existing location catalog.';
      actions = destinationButtons(root);
      if (!actions) actions = '<p class="lws-context-copy">No destination cards are available in this view. Open the town map or return to the hub.</p>';
      actions += '<button class="lws-btn quiet" type="button" data-world-action="map"><span class="lws-btn-icon" aria-hidden="true">⌖</span><span class="lws-btn-copy"><strong>Town routes</strong><small>Open the existing route screen</small></span></button>';
    } else {
      intro = 'You are in a town service or regional screen. Return to the same world without discarding your current save.';
      actions =
        '<button class="lws-btn primary" type="button" data-world-action="world"><span class="lws-btn-icon" aria-hidden="true">⌂</span><span class="lws-btn-copy"><strong>Return to town</strong><small>Use the existing town navigation</small></span></button>' +
        '<button class="lws-btn" type="button" data-world-action="prepare-road"><span class="lws-btn-icon" aria-hidden="true">➜</span><span class="lws-btn-copy"><strong>Prepare for the road</strong><small>Open the real departure briefing</small></span></button>' +
        '<button class="lws-btn" type="button" data-world-action="journal"><span class="lws-btn-icon" aria-hidden="true">✧</span><span class="lws-btn-copy"><strong>Quest & field journal</strong><small>Open the existing journal view</small></span></button>';
    }
    return '<div class="lws-panel-header"><div><span class="lws-panel-eyebrow">' + (context?.kind === 'road' ? 'Journey actions' : context?.kind === 'town' ? 'Town actions' : context?.kind === 'expedition-results' ? 'Expedition debrief' : context?.kind === 'combat' ? 'Live encounter' : 'Context actions') + '</span><h2>' + heading + '</h2><p>' + esc(intro) + '</p></div></div><div class="lws-panel-scroll"><div class="lws-action-list">' + actions + '</div></div>';
  }

  function renderBottomBar(context) {
    const active = context?.kind || 'town';
    const lockNavigation = active === 'combat' || active === 'combat-results';
    const worldTitle = active === 'road' ? 'Town' : active === 'dungeon' ? 'Retreat' : active === 'expedition-results' ? 'Return' : active === 'combat' || active === 'combat-results' ? 'Encounter' : 'World';
    const button = (action, icon, title, primary = false, disabled = false) =>
      '<button type="button" class="lws-btn ' + (primary ? 'primary' : 'quiet') + '" data-world-action="' + action + '"' + (disabled ? ' disabled aria-disabled="true"' : '') + '><span class="lws-btn-icon" aria-hidden="true">' + icon + '</span><span class="lws-btn-copy"><strong>' + title + '</strong></span></button>';
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
