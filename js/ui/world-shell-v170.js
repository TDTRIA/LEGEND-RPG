/* LEGEND persistent world shell v170.
   Keeps the actual town/road screen underneath a contextual frame.
   All navigation and expedition choices are delegated to production handlers. */
(() => {
  'use strict';

  const SHELL_ID = 'legend-world-shell-root';
  const MODAL_ID = 'legend-world-shell-modal-root';
  const RT = () => window.LegendRuntimeV120 || {};
  const STORAGE = () => window.LegendStorage || {};
  const PANELS = () => window.LegendWorldShellPanelsV170 || {};
  const MODALS = () => window.LegendWorldShellModalsV170 || {};
  const root = () => document.getElementById('root');
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  let observer = null;
  let observedRoot = null;
  let renderQueued = false;
  let lastContext = null;
  let toastTimer = null;

  function loadPlayer() {
    return STORAGE().loadPlayer?.() || RT().loadPlayer?.() || null;
  }

  function titleOrCreation(rootNode) {
    if (!rootNode) return true;
    return !!rootNode.querySelector([
      '.v120-title',
      '.title-v100',
      '.v094-creation',
      '.v094-creation-step',
      '.v094-memory-screen',
      '#v094Name',
      '#v094Next',
      '.settings09x',
      '.account09x',
      '.account-v09x',
      '.opening-road-screen',
      '.opening-road-v140',
      '[data-opening-scene]',
      '[data-character-creation]'
    ].join(','));
  }

  function inferContext(player, rootNode) {
    if (!player || !rootNode || titleOrCreation(rootNode)) return null;
    const text = String(rootNode.textContent || '').trim();
    if (!text || text.length < 24) return null;
    if (/^Opening the realm|New Traveler|Begin Your Journey/i.test(text)) return null;

    if (rootNode.querySelector('.exp150-return-report, .exp100-outcome')) {
      return {
        kind: 'expedition-results',
        location: 'Old Road · Field Report',
        sublocation: rootNode.querySelector('.exp100-outcome .exp100-route strong')?.textContent?.trim() || 'Expedition report',
        camp: false
      };
    }
    if (rootNode.querySelector('.exp150-world-page, .exp150-expedition-head, .exp150-route-tracker, .exp100-scene-live')) {
      const state = player.flags?.roadExpeditionV100 || {};
      const stage = Math.max(0, Math.min(5, Number(state.stage || 0)));
      return {
        kind: 'road',
        location: 'Old Road',
        sublocation: rootNode.querySelector('.exp150-title-group h1')?.textContent?.trim() || '',
        stage,
        route: state.routeChoice || '',
        camp: !!rootNode.querySelector('#campRest, #campCraft, #campWatch')
      };
    }
    const liveCombat = rootNode.querySelector('.rpg-battle');
    if (liveCombat) {
      return {
        kind: 'combat',
        location: liveCombat.querySelector('.rpg-overline')?.textContent?.trim() || 'Encounter',
        sublocation: liveCombat.querySelector('.rpg-battle-topline strong')?.textContent?.trim() || 'Combat encounter',
        camp: false
      };
    }
    const combatResults = rootNode.querySelector('.v152-combat-results');
    if (combatResults) {
      return {
        kind: 'combat-results',
        location: combatResults.querySelector('.v152-results-kicker')?.textContent?.trim() || 'Encounter results',
        sublocation: PANELS().screenHeading?.(rootNode, 'Encounter results') || 'Encounter results',
        camp: false
      };
    }
    if (rootNode.querySelector('.bell-vault-v100')) {
      return {
        kind: 'dungeon',
        location: 'Bell Cellar',
        sublocation: rootNode.querySelector('.bell-vault-room-heading strong, .bell-vault-overline')?.textContent?.trim() || 'The Bell Cellar',
        camp: false
      };
    }
    if (rootNode.querySelector('.ash100-town')) {
      return {
        kind: 'town',
        location: String(player.currentRegion || player.town || 'Ashmere'),
        sublocation: rootNode.querySelector('.ash100-hero-copy h1')?.textContent?.trim() || '',
        camp: false
      };
    }
    if (rootNode.querySelector('.ash099-screen, .reg100-screen, [data-legend-game-screen], .bell-vault-screen, .bv100-screen')) {
      return {
        kind: 'service',
        location: String(player.currentRegion || player.town || 'Ashmere'),
        sublocation: PANELS().screenHeading?.(rootNode, player.currentRegion || 'Ashmere') || '',
        camp: false
      };
    }
    return null;
  }

  function ensureShellRoot() {
    let shell = document.getElementById(SHELL_ID);
    if (shell) return shell;
    shell = document.createElement('div');
    shell.id = SHELL_ID;
    shell.setAttribute('aria-label', 'Persistent world interface');
    shell.innerHTML =
      '<header class="lws-hud" aria-label="Traveler status">' +
        '<div class="lws-hud-left">' +
          '<button type="button" class="lws-btn compact quiet lws-mobile-toggle" data-world-action="toggle-left" aria-controls="lws-panel-left" aria-expanded="false">Journal</button>' +
          '<div class="lws-hud-brand"><span class="lws-brand-mark" aria-hidden="true">✦</span><div class="lws-brand-copy"><strong>LEGEND</strong><span>THE AWAKENING · WORLD FRAME</span></div></div>' +
          '<div class="lws-location"><span>Current location</span><strong id="lws-current-location">Ashmere</strong></div>' +
        '</div>' +
        '<div class="lws-hud-center"><div class="lws-objective"><span class="lws-objective-label">Current objective</span><strong id="lws-current-objective">Find your next lead in town</strong></div></div>' +
        '<div class="lws-hud-right">' +
          '<div class="lws-hud-vitals"><div class="lws-vital health"><span>Health</span><strong id="lws-hud-health">— / —</strong></div><div class="lws-vital gold"><span>Gold</span><strong id="lws-hud-gold">—</strong></div></div>' +
          '<button type="button" class="lws-btn compact lws-hud-save" data-world-action="save" aria-label="Save traveler"><span class="lws-btn-icon" aria-hidden="true">⌑</span><span class="lws-btn-copy"><strong>Save</strong></span></button>' +
          '<button type="button" class="lws-btn compact quiet lws-mobile-toggle" data-world-action="toggle-right" aria-controls="lws-panel-right" aria-expanded="false">Actions</button>' +
        '</div>' +
      '</header>' +
      '<aside class="lws-panel lws-panel-left" id="lws-panel-left" aria-label="Traveler, quests, and journal"></aside>' +
      '<aside class="lws-panel lws-panel-right" id="lws-panel-right" aria-label="Contextual actions"></aside>' +
      '<nav class="lws-bottom-bar" aria-label="World actions"></nav>' +
      '<div class="lws-shell-toast" role="status" aria-live="polite" hidden></div>';
    document.body.appendChild(shell);
    return shell;
  }

  function ensureModalRoot() {
    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = MODAL_ID;
      modal.hidden = true;
      modal.setAttribute('aria-label', 'Game overlay');
      document.body.appendChild(modal);
    }
    return modal;
  }

  function renderShell(player, context) {
    const shell = ensureShellRoot();
    const rootNode = root();
    const panels = PANELS();
    const location = context.kind === 'road'
      ? (context.sublocation && context.sublocation !== 'Old Road' ? context.sublocation + ' · Old Road' : 'Old Road')
      : context.kind === 'town'
        ? context.location
        : context.kind === 'combat'
          ? context.location
          : context.kind === 'combat-results'
            ? context.location
            : context.kind === 'expedition-results'
              ? context.location
              : context.kind === 'dungeon'
                ? context.location
                : (context.sublocation || context.location);
    const objective = panels.objectiveFor?.(player, rootNode, context) || 'Find your next lead in town';
    const hp = Math.max(0, Number(player.hp || 0));
    const maxHp = Math.max(1, Number(player.maxHp || 1));
    const heading = shell.querySelector('#lws-current-location');
    if (heading) heading.textContent = location;
    const objectiveNode = shell.querySelector('#lws-current-objective');
    if (objectiveNode) objectiveNode.textContent = objective;
    const health = shell.querySelector('#lws-hud-health');
    if (health) health.textContent = hp + ' / ' + maxHp;
    const gold = shell.querySelector('#lws-hud-gold');
    if (gold) gold.textContent = Math.max(0, Number(player.gold || 0)) + 'g';
    const left = shell.querySelector('#lws-panel-left');
    if (left) left.innerHTML = panels.renderLeftPanel?.(player, context, rootNode) || '';
    const right = shell.querySelector('#lws-panel-right');
    if (right) right.innerHTML = panels.renderRightPanel?.(player, context, rootNode) || '';
    const bottom = shell.querySelector('.lws-bottom-bar');
    if (bottom) bottom.innerHTML = panels.renderBottomBar?.(context) || '';
    panels.syncTownScene?.(player, context, rootNode);
    shell.dataset.context = context.kind;
    shell.dataset.region = String(player.currentRegion || player.town || 'Ashmere');
    shell.hidden = false;
    lastContext = context;
    document.body.classList.add('legend-world-shell-active');
    refreshMobileToggleState(shell);
  }

  function refreshMobileToggleState(shell = document.getElementById(SHELL_ID)) {
    if (!shell) return;
    const mobile = window.matchMedia?.('(max-width: 1199px)').matches || false;
    const updateDrawer = (side, buttonSelector) => {
      const isOpen = document.body.classList.contains('legend-shell-' + side + '-open');
      const panel = shell.querySelector('#lws-panel-' + side);
      if (panel) {
        const shouldHide = mobile && !isOpen;
        panel.inert = shouldHide;
        panel.setAttribute('aria-hidden', String(shouldHide));
      }
      shell.querySelectorAll(buttonSelector).forEach(button => {
        button.setAttribute('aria-expanded', String(isOpen));
      });
    };
    updateDrawer('left', '[data-world-action="toggle-left"]');
    updateDrawer('right', '[data-world-action="toggle-right"]');
  }

  function hideShell() {
    const shell = document.getElementById(SHELL_ID);
    if (shell) shell.hidden = true;
    document.body.classList.remove('legend-world-shell-active', 'legend-shell-left-open', 'legend-shell-right-open');
    lastContext = null;
  }

  function refresh() {
    renderQueued = false;
    const rootNode = root();
    if (!rootNode) {
      hideShell();
      return;
    }
    const player = loadPlayer();
    const context = inferContext(player, rootNode);
    if (!context) {
      hideShell();
      return;
    }
    renderShell(player, context);
  }

  function queueRefresh() {
    if (renderQueued) return;
    renderQueued = true;
    const schedule = window.requestAnimationFrame || (callback => window.setTimeout(callback, 16));
    schedule(refresh);
  }

  function bindRootObserver() {
    const currentRoot = root();
    if (!currentRoot || currentRoot === observedRoot) return;
    if (observer) observer.disconnect();
    observedRoot = currentRoot;
    observer = new MutationObserver(queueRefresh);
    observer.observe(currentRoot, { childList: true, subtree: true });
  }

  function showToast(message) {
    const shell = document.getElementById(SHELL_ID);
    const toast = shell?.querySelector('.lws-shell-toast');
    if (!toast) return;
    toast.textContent = String(message || '');
    toast.hidden = !message;
    if (toastTimer) window.clearTimeout(toastTimer);
    if (message) {
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
    }
  }

  function clickExisting(selector) {
    const target = root()?.querySelector(selector);
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return false;
    target.click();
    return true;
  }

  function routeTo(view) {
    if (lastContext?.kind === 'combat' || lastContext?.kind === 'combat-results') {
      showToast('Finish the active encounter through its battle or results controls before changing location.');
      return false;
    }
    const host = root();
    const candidates = Array.from(host?.querySelectorAll('[data-ash-view]') || []);
    const native = candidates.find(button => String(button.dataset.ashView || '') === view && !button.disabled);
    if (native) {
      native.click();
      return true;
    }
    const town = window.LegendAshmereV099;
    if (view === 'home' && typeof town?.renderAshmere === 'function') {
      town.renderAshmere();
      return true;
    }
    if (typeof town?.route === 'function') {
      town.route(view);
      return true;
    }
    showToast('That route is not available in the current build.');
    return false;
  }

  function closeShellModal() {
    MODALS().close?.();
  }

  function saveCurrentPlayer() {
    const player = loadPlayer();
    if (!player || typeof STORAGE().savePlayer !== 'function') {
      showToast('No saved traveler record is available to save.');
      return;
    }
    try {
      STORAGE().savePlayer(player);
      showToast('Traveler record saved locally.');
    } catch (error) {
      console.error('[LEGEND world shell] Save failed', error);
      showToast('The traveler record could not be saved. Check browser storage settings.');
    }
  }

  function handleShellClick(event) {
    const actionButton = event.target.closest('[data-world-action]');
    const routeButton = event.target.closest('[data-world-route]');
    const placeButton = event.target.closest('[data-world-place]');
    if (!actionButton && !routeButton && !placeButton) return;
    const owner = (actionButton || routeButton || placeButton).closest('#' + SHELL_ID + ', #' + MODAL_ID);
    if (!owner) return;

    if (placeButton) {
      event.preventDefault();
      const player = loadPlayer();
      if (lastContext?.kind === 'town' &&
          String(player?.currentRegion || player?.town || 'Ashmere') === 'Ashmere' &&
          PANELS().selectAshmerePoi?.(String(placeButton.dataset.worldPlace || ''))) {
        queueRefresh();
      } else {
        showToast('That place cannot be selected from the current scene.');
      }
      return;
    }

    if (routeButton) {
      event.preventDefault();
      routeTo(String(routeButton.dataset.worldRoute || ''));
      return;
    }

    const action = String(actionButton.dataset.worldAction || '');
    if (actionButton.disabled) return;
    switch (action) {
      case 'save':
        event.preventDefault();
        saveCurrentPlayer();
        break;
      case 'inventory':
        event.preventDefault();
        MODALS().openInventory?.(loadPlayer());
        break;
      case 'visit-selected-place': {
        event.preventDefault();
        const poi = PANELS().getSelectedAshmerePoi?.();
        const native = poi && root()?.querySelector('.ash100-town-ashmere .ash100-destination[data-ash-view="' + poi.view + '"]');
        if (lastContext?.kind === 'town' && native && !native.disabled && native.getAttribute('aria-disabled') !== 'true') {
          routeTo(poi.view);
        } else {
          showToast('Choose an available Ashmere place before entering it.');
        }
        break;
      }
      case 'settings':
        event.preventDefault();
        MODALS().openSettings?.();
        break;
      case 'combat':
        event.preventDefault();
        MODALS().openCombat?.(root());
        break;
      case 'journal': {
        event.preventDefault();
        if (lastContext?.kind === 'combat' || lastContext?.kind === 'combat-results') {
          showToast('Finish the encounter before changing to the journal.');
        } else if (lastContext?.kind === 'road') {
          if (!clickExisting('#exp150OpenJournal') && !clickExisting('#exp150OpenJournalAside')) showToast('The field journal is not available on this screen.');
        } else {
          routeTo('archive');
        }
        break;
      }
      case 'map': {
        event.preventDefault();
        if (lastContext?.kind === 'combat' || lastContext?.kind === 'combat-results') {
          showToast('Finish the encounter before changing to the map.');
        } else if (lastContext?.kind === 'road') {
          if (!clickExisting('#exp150OpenMap')) showToast('The road map is not available on this screen.');
        } else {
          routeTo('routes');
        }
        break;
      }
      case 'world':
        event.preventDefault();
        if (lastContext?.kind === 'road') {
          if (!clickExisting('#town')) showToast('Return to Ashmere is not available at this point in the expedition.');
        } else if (lastContext?.kind === 'dungeon') {
          if (!clickExisting('#vaultRetreat') && !clickExisting('#vaultReturn')) showToast('The current cellar room has no retreat action available.');
        } else if (lastContext?.kind === 'expedition-results') {
          if (!clickExisting('#outcomeReturn')) showToast('The expedition report has no return action on this screen.');
        } else if (lastContext?.kind === 'combat' || lastContext?.kind === 'combat-results') {
          showToast('Finish the active encounter through its battle or results controls before leaving.');
        } else {
          routeTo('home');
        }
        break;
      case 'travel':
      case 'prepare-road':
        event.preventDefault();
        routeTo('road');
        break;
      case 'inn':
        event.preventDefault();
        routeTo('inn');
        break;
      case 'market':
        event.preventDefault();
        routeTo('trader');
        break;
      case 'forge':
        event.preventDefault();
        routeTo('smith');
        break;
      case 'craft':
        event.preventDefault();
        routeTo('craft');
        break;
      case 'talk':
        event.preventDefault();
        routeTo('people');
        break;
      case 'dungeon':
        event.preventDefault();
        routeTo('dungeon');
        break;
      case 'traveler-sheet':
        event.preventDefault();
        closeShellModal();
        routeTo('sheet');
        break;
      case 'continue-road':
        event.preventDefault();
        if (!clickExisting('#push')) showToast('Continuing is not available at this point in the expedition.');
        break;
      case 'search-road':
        event.preventDefault();
        if (!clickExisting('#search')) showToast('Searching is not available at this point in the expedition.');
        break;
      case 'read-road':
        event.preventDefault();
        if (!clickExisting('#careful')) showToast('Reading the road is not available at this point in the expedition.');
        break;
      case 'camp-rest':
        event.preventDefault();
        if (!clickExisting('#campRest')) showToast('Rest is not available with the current camp supplies or at this stop.');
        break;
      case 'camp-craft':
        event.preventDefault();
        if (!clickExisting('#campCraft')) showToast('Camp crafting is not available with the current materials.');
        break;
      case 'camp-watch':
        event.preventDefault();
        if (!clickExisting('#campWatch')) showToast('Keeping watch is not available with the current supplies or at this stop.');
        break;
      case 'leave-road':
        event.preventDefault();
        if (!clickExisting('#town')) showToast('Returning to Ashmere is not available at this point in the expedition.');
        break;
      case 'expedition-return':
        event.preventDefault();
        if (!clickExisting('#outcomeReturn')) showToast('The expedition report has no return action on this screen.');
        break;
      case 'report-to-mara':
        event.preventDefault();
        if (!clickExisting('#outcomeReportToMara')) showToast('There is no field-report handoff available on this trip.');
        break;
      case 'combat-continue':
        event.preventDefault();
        if (!clickExisting('#v152CombatContinue')) showToast('There is no continuation action on this results screen.');
        break;
      case 'combat-return':
        event.preventDefault();
        if (!clickExisting('#v152CombatReturn')) showToast('There is no return action on this results screen.');
        break;
      case 'dungeon-retreat':
        event.preventDefault();
        if (!clickExisting('#vaultRetreat')) showToast('Retreat is not available in this cellar beat.');
        break;
      case 'dungeon-return':
        event.preventDefault();
        if (!clickExisting('#vaultReturn')) showToast('Return is not available in this cellar beat.');
        break;
      case 'toggle-left':
        event.preventDefault();
        document.body.classList.toggle('legend-shell-left-open');
        document.body.classList.remove('legend-shell-right-open');
        refreshMobileToggleState();
        break;
      case 'toggle-right':
        event.preventDefault();
        document.body.classList.toggle('legend-shell-right-open');
        document.body.classList.remove('legend-shell-left-open');
        refreshMobileToggleState();
        break;
      default:
        break;
    }
  }

  function bindEvents() {
    if (document.documentElement.dataset.legendWorldShellBound === '1') return;
    document.documentElement.dataset.legendWorldShellBound = '1';
    document.addEventListener('click', handleShellClick);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        const shell = document.getElementById(SHELL_ID);
        const leftWasOpen = document.body.classList.contains('legend-shell-left-open');
        const rightWasOpen = document.body.classList.contains('legend-shell-right-open');
        closeShellModal();
        document.body.classList.remove('legend-shell-left-open', 'legend-shell-right-open');
        refreshMobileToggleState(shell);
        if (leftWasOpen) shell?.querySelector('[data-world-action="toggle-left"]')?.focus();
        else if (rightWasOpen) shell?.querySelector('[data-world-action="toggle-right"]')?.focus();
      }
    });
    window.addEventListener('resize', () => refreshMobileToggleState());
  }

  function boot() {
    ensureModalRoot();
    bindEvents();
    bindRootObserver();
    refresh();
    window.LegendWorldShellV170 = Object.freeze({
      refresh,
      inferContext,
      saveCurrentPlayer,
      routeTo
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
