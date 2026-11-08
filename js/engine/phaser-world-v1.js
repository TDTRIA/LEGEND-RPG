/* LEGEND — canonical persistent Phaser world engine.
 * Shared by the production GitHub Pages game and the reboot preview. Production mode
 * delegates all traveler persistence to the existing LegendStorage/account stack.
 */
(() => {
  'use strict';

  const IS_PROTOTYPE = /\/prototypes\/reboot(?:\/|$)/.test(window.location.pathname);
  const SAVE_KEY = IS_PROTOTYPE
    ? 'legend-reboot-prototype-save-v1'
    : String(window.LEGEND_DATA?.SAVE_KEY || 'legend-roads-of-ashmere-v09');
  const ENGINE_SESSION_KEY = IS_PROTOTYPE
    ? 'legend-phaser-engine-awakened-v1'
    : 'legend-phaser-production-engine-awakened-v1';
  if (!IS_PROTOTYPE) {
    // The Phaser canvas is a fixed, non-interactive world layer behind the HTML
    // game controls. The production CSS intentionally scopes that contract to
    // BODY, while the intro visibility gate is scoped to HTML.
    document.documentElement.classList.add('legend-phaser-world-active', 'engine-intro-active');
    document.body?.classList.add('legend-phaser-world-active');
  }
  const root = () => document.getElementById('root');
  const byId = id => document.getElementById(id);
  const reducedMotion = () => Boolean(
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    document.body?.classList.contains('a11y-reduced-motion')
  );
  let activePlayer = null;
  let game = null;
  let realmScene = null;
  let engineReady = false;
  let currentEnvironment = '';
  let soundEnabled = true;
  let ambientAudio = null;
  let observer = null;
  let modalObserver = null;
  let currentSurface = '';
  let skipAwakeningRequested = false;
  const settingsStorage = window.LegendSettingsStorageV120?.create();

  function safeRead() {
    try {
      const value = localStorage.getItem(SAVE_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Prototype save could not be read.', error);
      return null;
    }
  }

  function normalizer() {
    return window.LegendPlayerNormalizerV120 && window.LegendPlayerNormalizerV120.create({
      getData: () => window.LEGEND_DATA || {}
    });
  }

  function normalize(player) {
    if (!player) return null;
    const service = normalizer();
    return service && service.normalize ? service.normalize(player) : player;
  }

  function loadPlayer() {
    if (!IS_PROTOTYPE) return window.LegendStorage?.loadPlayer?.() || null;
    if (activePlayer) return activePlayer;
    activePlayer = normalize(safeRead());
    return activePlayer;
  }

  function savePlayer(player) {
    if (!player) return null;
    if (!IS_PROTOTYPE) {
      window.LegendStorage?.savePlayer?.(player);
      return window.LegendStorage?.loadPlayer?.() || player;
    }
    activePlayer = normalize(player);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(activePlayer));
    } catch (error) {
      console.warn('Prototype save could not be written.', error);
      toast('Browser storage is unavailable. Your current session can continue, but will not persist after closing this tab.');
    }
    return activePlayer;
  }

  function clearPlayer() {
    // The production engine must never clear a player's real save through a
    // preview/new-traveler helper. Production deletion stays with the game UI.
    if (!IS_PROTOTYPE) return false;
    activePlayer = null;
    try { localStorage.removeItem(SAVE_KEY); } catch (error) { console.warn(error); }
    return true;
  }

  // Only the isolated preview installs its adapter. Production retains the real
  // LegendStorage and LegendRuntimeV120, including local/cloud account behavior.
  if (IS_PROTOTYPE) {
    window.LegendStorage = {
      loadPlayer,
      savePlayer,
      normalize,
      baseSkills: () => normalizer()?.baseSkills?.() || {},
      loadSettings: () => settingsStorage?.loadSettings?.() || {},
      saveSettings: settings => settingsStorage?.saveSettings?.(settings) || false,
      applySettings: settings => settingsStorage?.applySettings?.(settings),
      deleteSaves: clearPlayer
    };
    window.LegendRuntimeV120 = {
      loadPlayer,
      savePlayer,
      returnToAshmere: () => window.LegendAshmereV099?.renderAshmere?.(),
      baseSkills: () => normalizer()?.baseSkills?.() || {},
      normalize
    };
    window.__legendRebootSaveKey = SAVE_KEY;
  } else {
    window.__legendPhaserProductionSaveKey = SAVE_KEY;
  }

  const ASSETS = {
    title: 'assets/generated/title/title-ashmere-road.webp',
    ashmere: 'assets/generated/locations/ashmere-town.webp',
    road: 'assets/generated/locations/old-road-south-fork.webp',
    blackroot: 'assets/locations/roads/location_old_road_main_v1.jpg',
    ridge: 'assets/generated/locations/high-ridge.webp',
    reeds: 'assets/generated/locations/reed-cut.webp',
    camp: 'assets/generated/locations/roadside-camp.webp',
    greyfen: 'assets/generated/locations/greyfen-town.webp',
    marsh: 'assets/generated/locations/greyfen-marsh-walkway.webp',
    inn: 'assets/generated/locations/ashmere-inn.webp',
    market: 'assets/generated/locations/ashmere-market.webp',
    forge: 'assets/generated/locations/ashmere-forge.webp',
    archive: 'assets/generated/locations/ashmere-archive.webp',
    cellar: 'assets/generated/locations/bell-cellar-undercroft.webp',
    greyfenInn: 'assets/generated/locations/greyfen-inn.webp',
    greyfenMarket: 'assets/generated/locations/greyfen-market.webp',
    greyfenForge: 'assets/generated/locations/greyfen-forge.webp',
    greyfenArchive: 'assets/generated/locations/greyfen-archive.webp',
    serviceInnIcon: 'assets/generated/ui/icons/service-inn.webp',
    serviceMarketIcon: 'assets/generated/ui/icons/service-market.webp',
    serviceForgeIcon: 'assets/generated/ui/icons/service-blacksmith.webp',
    serviceRoadIcon: 'assets/generated/ui/icons/service-map.webp',
    menuCompass: 'assets/generated/ui/icons/legend-icon-compass.webp',
    menuTraveler: 'assets/generated/ui/icons/legend-icon-traveler.webp',
    menuInn: 'assets/generated/ui/icons/legend-icon-inn.webp',
    menuJournal: 'assets/generated/ui/icons/legend-icon-journal.webp',
    menuSettings: 'assets/generated/ui/icons/legend-icon-settings.webp',
    menuRoad: 'assets/generated/ui/icons/legend-icon-road.webp',
    menuMilestone: 'assets/generated/ui/icons/legend-icon-milestone.webp',
    oric: 'assets/generated/npcs/captain-oric.webp',
    wolf: 'assets/generated/enemies/blackroot-wolf.webp',
    goblin: 'assets/generated/enemies/road-goblin.webp',
    wisp: 'assets/generated/enemies/lantern-wisp.webp',
    sentinel: 'assets/generated/enemies/mirebound-sentinel.webp',
    warrior: 'assets/generated/classes/class-warrior.webp',
    adventurer: 'assets/generated/classes/class-adventurer.webp',
    ranger: 'assets/generated/classes/class-ranger.webp',
    mage: 'assets/generated/classes/class-mage.webp',
    thief: 'assets/generated/classes/class-thief.webp',
    skiller: 'assets/generated/classes/class-skiller.webp'
  };

  function toast(message) {
    const element = byId('toast');
    if (!element) return;
    element.textContent = String(message || '');
    element.classList.add('show');
    window.clearTimeout(toast.handle);
    toast.handle = window.setTimeout(() => element.classList.remove('show'), 2800);
  }

  function setEnvironment(name, immediate = false) {
    const environment = String(name || 'title');
    window.LegendRoadAudioV100?.setEnvironment?.(environment);
    if (environment === currentEnvironment) return;
    currentEnvironment = environment;
    if (realmScene && realmScene.setEnvironment) realmScene.setEnvironment(environment, immediate);
  }

  function inferEnvironment() {
    const host = root();
    if (!host) return;
    const player = loadPlayer();
    let environment = 'title';
    if (host.querySelector('.opening-road-v140')) environment = 'road';
    else if (host.querySelector('.opening-lore-v220')) environment = 'title';
    else if (host.querySelector('.v140-creation')) environment = 'title';
    else if (host.querySelector('.rpg-battle')) {
      const arena = host.querySelector('.rpg-battlefield')?.dataset.arena || 'road';
      environment = arena === 'greyfen' ? 'marsh' : arena === 'cellar' ? 'cellar' : 'road';
    }
    else if (host.querySelector('.gss170-page')) environment = 'marsh';
    else if (host.querySelector('.gfm160-page')) environment = 'marsh';
    else if (host.querySelector('.bell-vault-banner, .bell-vault-room-card, .bell-vault-keeper-card')) environment = 'cellar';
    else if (host.querySelector('.ash100-town-greyfen')) environment = 'greyfen';
    else if (host.querySelector('.ash100-town-ashmere')) environment = 'ashmere';
    else if (host.querySelector('.exp100-scene')) {
      const state = player?.flags?.roadExpeditionV100 || {};
      const stage = Number(state.stage || 0);
      environment = state.activeSideTripV160 === 'windbreak' ? 'ridge'
        : state.activeSideTripV160 === 'sunken-cart' ? 'reeds'
        : stage === 2 ? 'camp'
        : stage === 3 ? 'blackroot'
        : stage === 4 ? 'marsh'
        : stage >= 5 ? 'greyfen'
        : state.routeChoice === 'ridge' && stage === 1 ? 'ridge'
        : state.routeChoice === 'reeds' && stage === 1 ? 'reeds'
        : 'road';
    } else if (host.querySelector('.ash099, .reg100')) {
      const greyfen = String(player?.currentRegion || 'Ashmere') === 'Greyfen';
      environment = greyfen ? 'greyfen' : 'ashmere';
      const service = String(host.querySelector('.ash099-head')?.dataset.ashService || '').toLowerCase();
      const serviceEnvironment = {
        inn: greyfen ? 'greyfenInn' : 'inn',
        trader: greyfen ? 'greyfenMarket' : 'market',
        smith: greyfen ? 'greyfenForge' : 'forge',
        craft: greyfen ? 'greyfenForge' : 'forge',
        archive: greyfen ? 'greyfenArchive' : 'archive'
      };
      if (serviceEnvironment[service]) {
        environment = serviceEnvironment[service];
      } else {
        const text = (host.textContent || '').toLowerCase();
        if (text.includes('workbench') || text.includes('crafting bench')) environment = greyfen ? 'greyfenForge' : 'forge';
        else if (text.includes('trading post') || text.includes('market')) environment = greyfen ? 'greyfenMarket' : 'market';
        else if (text.includes('archive')) environment = greyfen ? 'greyfenArchive' : 'archive';
        else if (text.includes('inn')) environment = greyfen ? 'greyfenInn' : 'inn';
      }
    }
    setEnvironment(environment);
    inferSurface();
  }

  function inferSurface() {
    const host = root();
    if (!host) return;
    const modal = byId('legend-world-shell-modal-root');
    const growthOverlay = byId('legendLevelUpOverlay');
    const growthOverlayVisible = Boolean(growthOverlay && !growthOverlay.hidden &&
      window.getComputedStyle(growthOverlay).display !== 'none' &&
      window.getComputedStyle(growthOverlay).visibility !== 'hidden');
    let surface = 'title';
    if (modal && !modal.hidden) surface = 'modal';
    else if (growthOverlayVisible) surface = 'modal';
    else if (host.querySelector('.dispatches-v140')) surface = 'dispatches';
    else if (host.querySelector('.settings09x')) surface = 'settings';
    else if (host.querySelector('.legend-credits-overlay')) surface = 'credits';
    else if (host.querySelector('.opening-lore-v220')) surface = 'annals';
    else if (host.querySelector('.v140-creation, .v094-creation, [data-character-creation]')) surface = 'creation';
    else if (host.querySelector('.opening-road-v140')) surface = 'awakening';
    else if (host.querySelector('.rpg-battle')) surface = 'combat';
    else if (host.querySelector('.v152-combat-results')) surface = 'combat-results';
    else if (host.querySelector('.exp150-return-report, .exp100-outcome')) surface = 'expedition-results';
    else if (host.querySelector('.exp150-world-page, .exp100-scene')) surface = 'expedition';
    else if (host.querySelector('.bell-vault-banner, .bell-vault-room-card, .bell-vault-keeper-card')) surface = 'dungeon';
    else if (host.querySelector('.gss170-page, .gfm160-page')) surface = 'field-site';
    else if (host.querySelector('.ash100-town')) surface = 'town';
    else if (host.querySelector('.ash099, .reg100')) surface = 'town-service';
    else if (host.querySelector('.v120-title')) surface = 'title';
    window.LegendRoadAudioV100?.setSurface?.(surface);
    if (surface !== currentSurface) {
      currentSurface = surface;
      realmScene?.setSurface?.(surface);
    } else {
      realmScene?.syncNativeTitleUi?.(surface);
      realmScene?.syncNativeAnnalsUi?.(surface);
      realmScene?.syncNativeCreationUi?.(surface);
      realmScene?.syncNativeOpeningUi?.(surface);
      realmScene?.syncNativeGameplayUi?.(surface);
    }
  }

  function observeModalRoot() {
    if (modalObserver || !window.MutationObserver || !document.body) return;
    // The persistent shell modal lives beside #root, not inside it. Watch the
    // body for its arrival and hidden-state changes so Phaser can transition
    // between in-world screens and shell overlays as one presentation engine.
    modalObserver = new MutationObserver(() => inferSurface());
    modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden']
    });
  }

  function observeRoot() {
    if (observer) observer.disconnect();
    const host = root();
    if (!host || !window.MutationObserver) return;
    observer = new MutationObserver(mutations => {
      const affectsWorldSurface = mutations.some(mutation => !(
        mutation.type === 'attributes' && mutation.target.closest?.('.v094-choice-grid')
      ));
      if (!affectsWorldSurface) {
        realmScene?.syncNativeCreationUi?.(currentSurface);
        realmScene?.syncNativeOpeningUi?.(currentSurface);
        realmScene?.syncNativeGameplayUi?.(currentSurface);
        return;
      }
      inferEnvironment();
      observeModalRoot();
    });
    observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    inferEnvironment();
    observeModalRoot();
  }

  function showDispatches() {
    const host = root();
    const rendered = window.LegendTitleDispatchesV140?.render?.({
      root: host,
      buildVersion: String(window.LEGEND_DATA?.VERSION || 'v0.30.4'),
      onBack: showTitle
    });
    if (!rendered) {
      toast('The development dispatch is not available in this build.');
      return showTitle();
    }
    setEnvironment('title');
    observeRoot();
  }

  function showSettings() {
    const host = root();
    const rendered = window.LegendSettingsScreenV090?.render?.({
      root: host,
      loadSettings: () => settingsStorage?.loadSettings?.() || {},
      saveSettings: settings => settingsStorage?.saveSettings?.(settings),
      buildVersion: () => String(window.LEGEND_DATA?.VERSION || 'v0.30.4'),
      loadPlayer,
      onBackTitle: showTitle,
      onBackGame: continueJourney
    });
    if (!rendered) {
      toast('Settings are not available in this build.');
      return showTitle();
    }
    setEnvironment('title');
    observeRoot();
  }

  function showTitle() {
    const host = root();
    const title = window.LegendTitleScreenV120;
    if (!host || typeof title?.render !== 'function') {
      if (host) host.innerHTML = '<section class="mode active" role="alert"><h1>Title screen unavailable</h1><p>The production title modules did not load. Refresh before continuing.</p></section>';
      return;
    }
    title.render({
      root: host,
      loadPlayer,
      buildVersion: () => String(window.LEGEND_DATA?.VERSION || 'v0.30.4'),
      applySettings: settings => settingsStorage?.applySettings?.(settings),
      onContinue: continueJourney,
      onNewTraveler: beginJourney,
      onAccount: () => toast('Traveler accounts and cloud profiles are not enabled in the isolated prototype.'),
      onSettings: showSettings,
      onCredits: () => title.openCredits?.(),
      onDispatches: showDispatches
    });
    // Cloud identity and remote traveler slots remain outside this isolated save boundary.
    host.querySelector('#account')?.remove();
    setEnvironment('title');
    observeRoot();
  }

  function beginJourney() {
    if (loadPlayer() && !window.confirm('Start a new prototype traveler? This replaces only the separate Phaser prototype save. Your production game and saves are not changed.')) return;
    clearPlayer();
    setEnvironment('title');
    const annals = window.LegendOpeningPrologueV220;
    if (typeof annals?.start === 'function') {
      annals.start(() => {
        setEnvironment('title');
        window.LegendBeginningV094?.startCreation?.();
      });
    } else {
      window.LegendBeginningV094?.startCreation?.();
    }
  }

  function continueJourney() {
    const player = loadPlayer();
    if (!player) return showTitle();
    if (player.flags?.openingRoadV140 && !player.flags.openingRoadV140.completed) {
      setEnvironment('road');
      if (window.LegendRoadOpeningV140?.resume?.(player)) return;
    }
    const road = player.flags?.roadExpeditionV100 || {};
    if (Number(road.trips || 0) > 0 && (Number(road.stage || 0) > 0 || road.routeChoice)) {
      setEnvironment('road');
      return window.LegendRoadControllerV100?.renderHub?.();
    }
    const marsh = player.flags?.greyfenMarshExpeditionV160 || {};
    if (marsh.active && window.LegendGreyfenMarshV160?.start) {
      setEnvironment('marsh');
      return window.LegendGreyfenMarshV160.start();
    }
    if (player.flags?.greyfenStorehouseV170?.active) {
      setEnvironment('marsh');
      return window.LegendAshmereV099?.route?.('storehouse');
    }
    if (player.flags?.bellVaultV100?.active) {
      setEnvironment('archive');
      return window.LegendAshmereV099?.route?.('dungeon');
    }
    if (player.currentRegion === 'Greyfen') setEnvironment('greyfen');
    else setEnvironment('ashmere');
    return window.LegendAshmereV099?.renderAshmere?.();
  }

  function setSound(enabled) {
    soundEnabled = Boolean(enabled);
    const button = byId('soundToggle');
    if (button) {
      button.textContent = soundEnabled ? 'Sound On' : 'Sound Off';
      button.setAttribute('aria-pressed', String(soundEnabled));
    }
    if (!soundEnabled && ambientAudio) {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
    } else if (soundEnabled && currentEnvironment === 'title') {
      startAmbient();
    }
    const roadAudio = window.LegendRoadAudioV100;
    if (roadAudio && typeof roadAudio.soundOn === 'function' && roadAudio.soundOn() !== soundEnabled) {
      roadAudio.toggleSound?.();
    }
  }

  function startAmbient() {
    if (!soundEnabled) return;
    try {
      if (!ambientAudio) {
        ambientAudio = new Audio('assets/audio/title/ashmere_ambience_loop.wav');
        ambientAudio.loop = true;
        ambientAudio.volume = 0.16;
      }
      if (ambientAudio.paused) ambientAudio.play().catch(() => {});
    } catch (error) {
      ambientAudio = null;
    }
  }

  class RealmScene extends Phaser.Scene {
    constructor() {
      super({ key: 'RealmScene' });
      this.background = null;
      this.backgroundBaseScale = 1;
      this.backgroundIsImage = false;
      this.ambienceObjects = [];
      this.environment = '';
      this.lookTarget = { x: 0, y: 0 };
      this.lookCurrent = { x: 0, y: 0 };
      this.motionReduced = false;
      this.engineAwakened = false;
      this.awakeningActive = false;
      this.bootObjects = [];
      this.bootEvents = [];
      this.bootCompleteCallback = null;
      this.surface = '';
      this.surfaceTransitionCount = 0;
      this.ashmereLandmarks = [];
      this.ashmerePointLights = [];
      this.hoveredAshmereLandmark = '';
      this.serviceDressing = [];
      this.serviceDressingTweenTargets = [];
      this.serviceDressingKey = '';
      this.nativeTitleUiActive = false;
      this.nativeTitleUiObjects = [];
      this.nativeTitleUiControls = [];
      this.nativeTitleUiSignature = '';
      this.nativeTitleUiLayoutEvent = null;
      this.nativeAnnalsUiActive = false;
      this.nativeAnnalsUiObjects = [];
      this.nativeAnnalsUiSignature = '';
      this.nativeAnnalsUiLayoutEvent = null;
      this.nativeAnnalsUiScrollTarget = null;
      this.nativeAnnalsUiButtonFocus = null;
      this.nativeCreationUiActive = false;
      this.nativeCreationUiObjects = [];
      this.nativeCreationUiTextures = [];
      this.nativeCreationUiControls = [];
      this.nativeCreationUiSignature = '';
      this.nativeCreationUiLayoutEvent = null;
      this.nativeCreationUiScrollTarget = null;
      this.nativeCreationUiTextureCounter = 0;
      this.nativeOpeningUiActive = false;
      this.nativeOpeningUiObjects = [];
      this.nativeOpeningUiControls = [];
      this.nativeOpeningUiSignature = '';
      this.nativeOpeningUiLayoutEvent = null;
      this.nativeOpeningUiScrollTarget = null;
      this.nativeRightDrawerUiActive = false;
      this.nativeRightDrawerUiObjects = [];
      this.nativeRightDrawerUiTaggedNodes = [];
      this.nativeRightDrawerUiTextNodes = [];
      this.nativeRightDrawerUiControls = [];
      this.nativeRightDrawerUiIconNodes = [];
      this.nativeRightDrawerUiSignature = '';
      this.nativeRightDrawerUiBoundPanel = null;
      this.nativeRightDrawerUiBoundScroll = null;
      this.nativeRightDrawerUiInteractionHandler = null;
      this.nativeRightDrawerUiTransitionHandler = null;
      this.nativeRightDrawerUiLayoutEvent = null;
      this.nativeRightDrawerUiMask = null;
      this.nativeRightDrawerUiMaskFilter = null;
      this.nativeRightDrawerUiMaskGraphics = null;
      this.nativeRightDrawerUiMaskBounds = null;
      this.nativeRightDrawerUiContainer = null;
      this.nativeLeftDrawerUiActive = false;
      this.nativeLeftDrawerUiObjects = [];
      this.nativeLeftDrawerUiTaggedNodes = [];
      this.nativeLeftDrawerUiTextNodes = [];
      this.nativeLeftDrawerUiControls = [];
      this.nativeLeftDrawerUiIconNodes = [];
      this.nativeLeftDrawerUiSignature = '';
      this.nativeLeftDrawerUiBoundPanel = null;
      this.nativeLeftDrawerUiBoundScroll = null;
      this.nativeLeftDrawerUiInteractionHandler = null;
      this.nativeLeftDrawerUiTransitionHandler = null;
      this.nativeLeftDrawerUiLayoutEvent = null;
      this.nativeLeftDrawerUiMask = null;
      this.nativeLeftDrawerUiMaskFilter = null;
      this.nativeLeftDrawerUiMaskGraphics = null;
      this.nativeLeftDrawerUiMaskBounds = null;
      this.nativeLeftDrawerUiContainer = null;
      this.nativeHudUiActive = false;
      this.nativeHudUiObjects = [];
      this.nativeHudUiTaggedNodes = [];
      this.nativeHudUiTextNodes = [];
      this.nativeHudUiControls = [];
      this.nativeHudUiSignature = '';
      this.nativeHudUiLayoutEvent = null;
      this.nativeHudUiBoundElement = null;
      this.nativeHudUiInteractionHandler = null;
      this.nativeBottomBarUiActive = false;
      this.nativeBottomBarUiObjects = [];
      this.nativeBottomBarUiTaggedNodes = [];
      this.nativeBottomBarUiTextNodes = [];
      this.nativeBottomBarUiIconNodes = [];
      this.nativeBottomBarUiControls = [];
      this.nativeBottomBarUiSignature = '';
      this.nativeBottomBarUiBoundElement = null;
      this.nativeBottomBarUiInteractionHandler = null;
      this.nativeBottomBarUiLayoutEvent = null;
      this.nativeBottomBarUiMask = null;
      this.nativeBottomBarUiMaskFilter = null;
      this.nativeBottomBarUiMaskGraphics = null;
      this.nativeBottomBarUiMaskBounds = null;
      this.nativeBottomBarUiContainer = null;
      this.nativeGameplayUiActive = false;
      this.nativeGameplayUiObjects = [];
      this.nativeGameplayUiTextures = [];
      this.nativeGameplayUiTaggedNodes = [];
      this.nativeGameplayUiControls = [];
      this.nativeGameplayUiSignature = '';
      this.nativeGameplayUiObserver = null;
      this.nativeGameplayUiObserverRoot = null;
      this.nativeGameplayUiLayoutEvent = null;
      this.nativeGameplayUiTextureCounter = 0;
      this.nativeGameplayUiScrollHandler = null;
    }

    preload() {
      // Preload the complete configured Phaser art set, not just the first
      // environment/background and service icons. NPC, enemy and class art are
      // part of the same production asset contract and must be available for
      // encounter, dialogue, creation and result scenes when those screens move
      // fully into RealmScene.
      Object.entries(ASSETS).forEach(([key, path]) => {
        if (typeof path === 'string' && /\.(?:avif|gif|jpe?g|png|webp)$/i.test(path)) {
          this.load.image(key, path);
        }
      });
    }

    create() {
      this.cameras.main.setBackgroundColor('#090e0d');
      this.motionReduced = reducedMotion();
      this.scale.on('resize', () => {
        this.layoutBackground();
        this.layoutAshmereLandmarks();
        this.syncNativeTitleUi(this.surface);
        this.syncNativeAnnalsUi(this.surface);
        this.syncNativeCreationUi(this.surface);
        this.syncNativeOpeningUi(this.surface);
        this.syncNativeGameplayUi(this.surface);
        this.syncNativeHudUi();
        this.syncNativeBottomBarUi();
        this.syncNativeLeftDrawerUi();
        this.syncNativeRightDrawerUi();
      });
      this.input.keyboard?.on('keydown', event => {
        if (event.key === 'Escape' && currentEnvironment === 'title') showTitle();
      });
      realmScene = this;
      window.__legendRebootBridge = {
        version: 'phaser-engine-v1',
        setEnvironment: (name, immediate) => this.setEnvironment(name, immediate),
        pulse: kind => this.pulse(kind),
        lookAt: (x, y) => this.setLookTarget(x, y),
        snapshot: () => ({
          environment: this.environment,
          worldArtTextureStatus: Object.keys(ASSETS).map(key => ({
            key,
            loaded: this.textures.exists(key)
          })),
          atmosphereCount: this.ambienceObjects.filter(item => item && item.active).length,
          parallaxEnabled: !reducedMotion(),
          engineAwakened: this.engineAwakened,
          surface: this.surface,
          surfaceTransitionCount: this.surfaceTransitionCount,
          ashmereLandmarks: this.ashmereLandmarks.map(item => ({
            id: item.id,
            iconKey: item.iconKey,
            x: item.x,
            y: item.y,
            clientX: item.x / Math.max(1, this.dimensions().width) * Math.max(1, window.innerWidth),
            clientY: item.y / Math.max(1, this.dimensions().height) * Math.max(1, window.innerHeight)
          })),
          hoveredAshmereLandmark: this.hoveredAshmereLandmark,
          pointLightCount: this.ashmerePointLights.filter(item => item.light?.active).length,
          landmarkIconsLoaded: this.ashmereLandmarks.every(item => this.textures.exists(item.iconKey)),
          serviceDressingCount: this.serviceDressing.filter(item => item.object?.active).length,
          serviceDressingKey: this.serviceDressingKey,
          nativeTitleUi: this.nativeTitleUiActive,
          nativeTitleUiIconsLoaded: ['menuCompass','menuTraveler','menuInn','menuJournal','menuSettings','menuRoad','menuMilestone'].every(key => this.textures.exists(key)),
          nativeTitleUiControlCount: this.nativeTitleUiControls.length,
          nativeTitleUiControlIds: this.nativeTitleUiControls.map(item => item.id),
          nativeTitleUiSceneSize: this.dimensions(),
          nativeTitleUiControlBounds: this.nativeTitleUiControls.map(item => ({
            id: item.id,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            focused: Boolean(item.focusFrame?.visible)
          })),
          nativeTitleUiTextQuality: this.nativeTitleUiControls.map(item => ({
            id: item.id,
            titleFontSize: Number.parseFloat(item.titleText?.style?.fontSize) || 0,
            titleResolution: Number(item.titleText?.style?.resolution) || 1,
            titleColor: item.titleText?.style?.color || '',
            subtitleFontSize: Number.parseFloat(item.subtitleText?.style?.fontSize) || 0,
            subtitleResolution: Number(item.subtitleText?.style?.resolution) || 1,
            subtitleColor: item.subtitleText?.style?.color || ''
          })),
          nativeAnnalsUi: this.nativeAnnalsUiActive,
          nativeAnnalsUiObjectCount: this.nativeAnnalsUiObjects.filter(item => item?.active).length,
          nativeAnnalsUiStep: Number(root()?.querySelector('.opening-lore-v220')?.dataset.loreStep ?? -1),
          nativeAnnalsUiScrollTargetBound: Boolean(this.nativeAnnalsUiScrollTarget),
          nativeAnnalsUiButtonFocused: Boolean(this.nativeAnnalsUiButtonFocus?.visible),
          nativeCreationUi: this.nativeCreationUiActive,
          nativeCreationUiStep: Number(root()?.querySelector('.v140-creation')?.dataset.creationStep ?? -1),
          nativeCreationUiObjectCount: this.nativeCreationUiObjects.filter(item => item?.active).length,
          nativeCreationUiChoiceIds: this.nativeCreationUiControls.filter(item => item.kind === 'choice').map(item => item.id),
          nativeCreationUiControlBounds: this.nativeCreationUiControls.map(item => ({ id: item.id, label: item.label, x: item.x, y: item.y, width: item.width, height: item.height, focused: Boolean(item.focusFrame?.visible), selected: Boolean(item.selected) })),
          nativeCreationUiTextureCount: this.nativeCreationUiTextures.length,
          nativeCreationUiSceneSize: this.dimensions(),
          nativeCreationUiScrollTargetBound: Boolean(this.nativeCreationUiScrollTarget),
          nativeOpeningUi: this.nativeOpeningUiActive,
          nativeOpeningUiObjectCount: this.nativeOpeningUiObjects.filter(item => item?.active).length,
          nativeOpeningUiControlBounds: this.nativeOpeningUiControls.map(item => ({ id: item.id, label: item.label, x: item.x, y: item.y, width: item.width, height: item.height, focused: Boolean(item.focusFrame?.visible) })),
          nativeOpeningUiSceneSize: this.dimensions(),
          nativeOpeningUiScrollTargetBound: Boolean(this.nativeOpeningUiScrollTarget),
          nativeHudUi: this.nativeHudUiActive,
          nativeHudUiObjectCount: this.nativeHudUiObjects.filter(item => item?.active).length,
          nativeHudUiTextCount: this.nativeHudUiTextNodes.filter(node => node?.isConnected).length,
          nativeHudUiTextValues: this.nativeHudUiTextNodes.filter(node => node?.isConnected).map(node => node.textContent?.replace(/\s+/g, ' ').trim() || ''),
          nativeHudUiControlIds: this.nativeHudUiControls.filter(node => node?.isConnected).map(node => node.dataset.worldAction || node.getAttribute('aria-label') || node.textContent?.trim() || ''),
          nativeHudUiFocusedControlIds: this.nativeHudUiControls.filter(node => node?.isConnected && (node === document.activeElement || node.matches(':focus-visible'))).map(node => node.dataset.worldAction || node.getAttribute('aria-label') || node.textContent?.trim() || ''),
          nativeHudUiSceneSize: this.dimensions(),
          nativeLeftDrawerUi: this.nativeLeftDrawerUiActive,
          nativeLeftDrawerUiObjectCount: this.nativeLeftDrawerUiObjects.filter(item => item?.active).length,
          nativeLeftDrawerUiTextCount: this.nativeLeftDrawerUiTextNodes.filter(node => node?.isConnected).length,
          nativeLeftDrawerUiTextValues: this.nativeLeftDrawerUiTextNodes.filter(node => node?.isConnected).map(node => node.textContent?.replace(/\s+/g, ' ').trim() || ''),
          nativeLeftDrawerUiControlIds: this.nativeLeftDrawerUiControls.filter(node => node?.isConnected).map(node => node.dataset.worldAction || ''),
          nativeLeftDrawerUiIconCount: this.nativeLeftDrawerUiObjects.filter(item => item?.active && item.type === 'Image').length,
          nativeLeftDrawerUiScrollTop: Number(this.nativeLeftDrawerUiBoundScroll?.scrollTop || 0),
          nativeLeftDrawerUiMaskMode: this.nativeLeftDrawerUiMaskFilter ? 'webgl-filter' : this.nativeLeftDrawerUiMask ? 'canvas-geometry' : 'none',
          nativeLeftDrawerUiMaskBounds: this.nativeLeftDrawerUiMaskBounds,
          nativeLeftDrawerUiMaskFilterActive: Boolean(this.nativeLeftDrawerUiMaskFilter),
          nativeLeftDrawerUiSceneSize: this.dimensions(),
          nativeRightDrawerUi: this.nativeRightDrawerUiActive,
          nativeRightDrawerUiObjectCount: this.nativeRightDrawerUiObjects.filter(item => item?.active).length,
          nativeRightDrawerUiTextCount: this.nativeRightDrawerUiTextNodes.filter(node => node?.isConnected).length,
          nativeRightDrawerUiTextValues: this.nativeRightDrawerUiTextNodes.filter(node => node?.isConnected).map(node => node.textContent?.replace(/\s+/g, ' ').trim() || ''),
          nativeRightDrawerUiControlIds: this.nativeRightDrawerUiControls.filter(node => node?.isConnected).map(node =>
            node.dataset.worldAction || node.dataset.worldRoute || node.dataset.worldPlace || ''),
          nativeRightDrawerUiIconCount: this.nativeRightDrawerUiObjects.filter(item => item?.active && item.type === 'Image').length,
          nativeRightDrawerUiScrollTop: Number(this.nativeRightDrawerUiBoundScroll?.scrollTop || 0),
          nativeRightDrawerUiMaskMode: this.nativeRightDrawerUiMaskFilter ? 'webgl-filter' : this.nativeRightDrawerUiMask ? 'canvas-geometry' : 'none',
          nativeRightDrawerUiMaskBounds: this.nativeRightDrawerUiMaskBounds,
          nativeRightDrawerUiMaskFilterActive: Boolean(this.nativeRightDrawerUiMaskFilter),
          nativeRightDrawerUiSceneSize: this.dimensions(),
          nativeBottomBarUi: this.nativeBottomBarUiActive,
          nativeBottomBarUiObjectCount: this.nativeBottomBarUiObjects.filter(item => item?.active).length,
          nativeBottomBarUiTextCount: this.nativeBottomBarUiTextNodes.filter(node => node?.isConnected).length,
          nativeBottomBarUiTextValues: this.nativeBottomBarUiTextNodes.filter(node => node?.isConnected).map(node => node.textContent?.replace(/\s+/g, ' ').trim() || ''),
          nativeBottomBarUiControlIds: this.nativeBottomBarUiControls.filter(node => node?.isConnected).map(node => node.dataset.worldAction || ''),
          nativeBottomBarUiIconCount: this.nativeBottomBarUiObjects.filter(item => item?.active && item.type === 'Image').length,
          nativeBottomBarUiMaskMode: this.nativeBottomBarUiMaskFilter ? 'webgl-filter' : this.nativeBottomBarUiMask ? 'canvas-geometry' : 'none',
          nativeBottomBarUiMaskBounds: this.nativeBottomBarUiMaskBounds,
          nativeBottomBarUiMaskFilterActive: Boolean(this.nativeBottomBarUiMaskFilter),
          nativeBottomBarUiControlBounds: this.nativeBottomBarUiControls.filter(node => node?.isConnected).map(node => {
            const rect = node.getBoundingClientRect();
            const sx = this.dimensions().width / Math.max(1, window.innerWidth || this.dimensions().width);
            const sy = this.dimensions().height / Math.max(1, window.innerHeight || this.dimensions().height);
            return { action: node.dataset.worldAction || '', x: rect.left * sx, y: rect.top * sy, width: rect.width * sx, height: rect.height * sy };
          }),
          nativeBottomBarUiScrollLeft: Number(this.nativeBottomBarUiBoundElement?.scrollLeft || 0),
          nativeBottomBarUiSceneSize: this.dimensions(),
          nativeGameplayUi: this.nativeGameplayUiActive,
          nativeGameplayUiSurface: this.surface,
          nativeGameplayUiObjectCount: this.nativeGameplayUiObjects.filter(item => item?.active).length,
          nativeGameplayUiPaintedCount: this.nativeGameplayUiTaggedNodes.filter(node => node?.dataset?.legendPhaserNativePaint === 'true').length,
          nativeGameplayUiTextCount: this.nativeGameplayUiTaggedNodes.filter(node => node?.dataset?.legendPhaserNativeText === 'true').length,
          nativeGameplayUiImageCount: this.nativeGameplayUiTaggedNodes.filter(node => node?.dataset?.legendPhaserNativeImage === 'true').length,
          nativeGameplayUiControlBounds: this.nativeGameplayUiControls.map(item => ({ id: item.id, label: item.label, x: item.x, y: item.y, width: item.width, height: item.height, focused: Boolean(item.focusFrame?.visible), selected: Boolean(item.selected) })),
          nativeGameplayUiSceneSize: this.dimensions(),
          nativeGameplayUiObserverBound: Boolean(this.nativeGameplayUiObserverRoot),
          nativeGameplayUiProgressionOverlay: Boolean(document.getElementById('legendLevelUpOverlay')),
          nativeAnnalsUiSceneSize: this.dimensions(),
          nativeAnnalsUiButtonBounds: (() => {
            const button = root()?.querySelector('.opening-lore-v220-continue');
            const rect = button?.getBoundingClientRect();
            if (!rect) return null;
            const width = Math.max(1, window.innerWidth || this.dimensions().width);
            const height = Math.max(1, window.innerHeight || this.dimensions().height);
            return {
              x: rect.left * this.dimensions().width / width,
              y: rect.top * this.dimensions().height / height,
              width: rect.width * this.dimensions().width / width,
              height: rect.height * this.dimensions().height / height
            };
          })(),
          rendererType: this.sys.game.renderer?.type ?? null
        }),
        finishAwakening: () => this.finishEngineAwakening(true),
        flash: (color, duration) => {
          if (reducedMotion()) return;
          this.cameras.main.flash(duration || 240, color?.r || 188, color?.g || 155, color?.b || 92);
        }
      };
      this.setEnvironment('title', true);
      currentEnvironment = 'title';
    }

    runEngineAwakening(onComplete) {
      if (this.awakeningActive || this.engineAwakened) {
        onComplete?.();
        return;
      }
      this.awakeningActive = true;
      this.bootCompleteCallback = onComplete;
      const size = this.dimensions();
      const cx = size.width / 2;
      const cy = size.height / 2;
      const reduced = reducedMotion();
      const veil = this.add.rectangle(cx, cy, size.width, size.height, 0x020503, 0.97).setDepth(30);
      this.bootObjects.push(veil);

      // Phaser-native seal: the real world image is held behind the scene while
      // the renderer, camera and world presentation layers come online.
      const portal = this.add.container(cx, cy).setDepth(34);
      this.bootObjects.push(portal);
      const baseSize = Math.min(size.width, size.height);
      const outer = this.add.circle(0, 0, baseSize * 0.205, 0x000000, 0);
      outer.setStrokeStyle(2, 0xcba85f, 0.62);
      const middle = this.add.circle(0, 0, baseSize * 0.17, 0x000000, 0);
      middle.setStrokeStyle(1, 0xe9d49c, 0.52);
      const inner = this.add.circle(0, 0, baseSize * 0.115, 0x000000, 0);
      inner.setStrokeStyle(1, 0x8fa88b, 0.58);
      const diamondA = this.add.rectangle(0, 0, baseSize * 0.29, baseSize * 0.29, 0x000000, 0);
      diamondA.setStrokeStyle(1, 0xcba85f, 0.3);
      diamondA.setRotation(Math.PI / 4);
      const diamondB = this.add.rectangle(0, 0, baseSize * 0.235, baseSize * 0.235, 0x000000, 0);
      diamondB.setStrokeStyle(1, 0x8fa88b, 0.22);
      diamondB.setRotation(-Math.PI / 4);
      const glyphs = [];
      const glyphSet = ['✦', 'ᚨ', '✧', 'ᛟ', '✦', 'ᚱ', '✧', 'ᛞ'];
      const radius = baseSize * 0.205;
      glyphSet.forEach((glyph, index) => {
        const angle = Math.PI * 2 * index / glyphSet.length;
        const mark = this.add.text(Math.cos(angle) * radius, Math.sin(angle) * radius, glyph, {
          fontFamily: 'Georgia, serif',
          fontSize: Math.max(14, Math.round(baseSize * 0.027)) + 'px',
          color: '#e9d49c'
        }).setOrigin(0.5);
        glyphs.push(mark);
      });
      portal.add([outer, middle, inner, diamondA, diamondB, ...glyphs]);
      portal.setScale(0.52);
      portal.setAlpha(0.08);

      const heading = this.add.text(cx, cy - Math.min(size.height * 0.105, 94), 'LEGEND', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: Math.round(Math.min(size.width * 0.079, size.height * 0.13, 104)) + 'px',
        fontStyle: 'bold',
        letterSpacing: 9,
        color: '#f0e4c5',
        shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 22, fill: true }
      }).setOrigin(0.5).setDepth(40).setAlpha(0).setScale(0.84);
      const subheading = this.add.text(cx, cy - 5, 'THE AWAKENING', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: Math.max(13, Math.round(Math.min(size.width * 0.022, 23))) + 'px',
        letterSpacing: 7,
        color: '#d9c38e'
      }).setOrigin(0.5).setDepth(40).setAlpha(0);
      const systemLabel = this.add.text(cx, cy + Math.min(size.height * 0.205, 176), 'A BELL RINGS WHERE NO TOWER STANDS', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        letterSpacing: 2.6,
        color: '#e8d39d'
      }).setOrigin(0.5).setDepth(40).setAlpha(0);
      const systemDetail = this.add.text(cx, cy + Math.min(size.height * 0.237, 205), 'THE ROAD REMEMBERS  ·  THE REALM IS WAKING', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '9px',
        letterSpacing: 1.5,
        color: '#aab7a3'
      }).setOrigin(0.5).setDepth(40).setAlpha(0);
      this.bootObjects.push(heading, subheading, systemLabel, systemDetail);

      const barWidth = Math.min(size.width * 0.35, 380);
      const barY = cy + Math.min(size.height * 0.285, 248);
      const barTrack = this.add.rectangle(cx, barY, barWidth, 3, 0x71836c, 0.28).setDepth(40).setAlpha(0);
      const barFill = this.add.rectangle(cx - barWidth / 2, barY, barWidth, 3, 0xe2c47e, 0.92)
        .setOrigin(0, 0.5).setScale(0.015, 1).setDepth(41).setAlpha(0);
      this.bootObjects.push(barTrack, barFill);

      const statusRows = [
        'A BELL RINGS WHERE NO TOWER STANDS',
        'ASHMERE  ·  THE OLD ROAD  ·  GREYFEN',
        'THE SEAL STIRS BENEATH THE STONE',
        'THE REALM AWAKENS'
      ];
      const details = [
        'THE ROAD REMEMBERS  ·  THE REALM IS WAKING',
        'LANTERNS BURN AGAINST THE LONG NIGHT',
        'SOMETHING MOVES BEYOND THE VEIL',
        'YOUR JOURNEY IS ABOUT TO BEGIN'
      ];
      const moteCount = reduced ? 6 : 30;
      for (let i = 0; i < moteCount; i++) {
        const angle = Math.PI * 2 * i / moteCount;
        const distance = baseSize * Phaser.Math.FloatBetween(0.23, 0.34);
        const mote = this.add.circle(
          cx + Math.cos(angle) * distance,
          cy + Math.sin(angle) * distance,
          Phaser.Math.FloatBetween(1.2, 3.1),
          i % 3 === 0 ? 0xf1d89b : 0xa7b997,
          Phaser.Math.FloatBetween(0.25, 0.75)
        ).setDepth(36);
        this.bootObjects.push(mote);
        if (!reduced) {
          this.tweens.add({
            targets: mote,
            x: cx + Math.cos(angle + 0.55) * (distance * 0.68),
            y: cy + Math.sin(angle + 0.55) * (distance * 0.68),
            alpha: 0.08,
            scale: 0.25,
            duration: Phaser.Math.Between(1250, 2200),
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut',
            delay: i * 18
          });
        }
      }

      const duration = reduced ? 450 : 4700;
      this.cameras.main.setZoom(reduced ? 1 : 1.12);
      if (!reduced) {
        this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 4200, ease: 'Cubic.easeOut' });
        this.tweens.add({ targets: portal, alpha: 0.92, scale: 1, angle: 360, duration: 4300, ease: 'Cubic.easeOut' });
        this.tweens.add({ targets: veil, alpha: 0.43, duration: 4100, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: heading, alpha: 1, scale: 1, duration: 1050, delay: 620, ease: 'Back.easeOut' });
        this.tweens.add({ targets: subheading, alpha: 0.95, duration: 850, delay: 1120, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: [systemLabel, systemDetail, barTrack, barFill], alpha: 1, duration: 620, delay: 1800 });
        this.tweens.add({ targets: barFill, scaleX: 1, duration: 2600, delay: 1900, ease: 'Cubic.easeInOut' });
      } else {
        portal.setAlpha(1);
        heading.setAlpha(1).setScale(1);
        subheading.setAlpha(1);
        systemLabel.setAlpha(1);
        systemDetail.setAlpha(1);
        barTrack.setAlpha(1);
        barFill.setAlpha(1).setScale(1, 1);
        veil.setAlpha(0.12);
      }

      [0, 1, 2].forEach(index => {
        const event = this.time.delayedCall(reduced ? 90 * (index + 1) : 1180 * (index + 1), () => {
          if (this.awakeningActive) {
            systemLabel.setText(statusRows[index + 1]);
            systemDetail.setText(details[index + 1]);
          }
        });
        this.bootEvents.push(event);
      });
      this.bootEvents.push(this.time.delayedCall(duration, () => this.finishEngineAwakening(false)));
      const skip = byId('engine-skip');
      if (skip) skip.hidden = false;
      this.input.keyboard?.once('keydown', () => this.finishEngineAwakening(true));
      if (skipAwakeningRequested) {
        skipAwakeningRequested = false;
        this.finishEngineAwakening(true);
      }
    }

    finishEngineAwakening(skipped = false) {
      if (!this.awakeningActive) return;
      this.awakeningActive = false;
      this.bootEvents.forEach(event => event?.remove?.(false));
      this.bootEvents = [];
      this.bootObjects.forEach(object => {
        if (object?.active) this.tweens.killTweensOf(object);
      });
      const objects = this.bootObjects.filter(object => object?.active);
      this.bootObjects = [];
      this.engineAwakened = true;
      this.cameras.main.setZoom(1);
      const finish = () => {
        objects.forEach(object => object?.active && object.destroy());
        this.cameras.main.flash(reducedMotion() ? 0 : skipped ? 100 : 220, 202, 178, 116, true);
        const callback = this.bootCompleteCallback;
        this.bootCompleteCallback = null;
        callback?.();
      };
      if (reducedMotion() || skipped) {
        objects.forEach(object => object?.active && object.destroy());
        finish();
        return;
      }
      this.tweens.add({
        targets: objects,
        alpha: 0,
        scale: 1.12,
        duration: 620,
        ease: 'Sine.easeInOut',
        onComplete: finish
      });
      const veil = objects[0];
      if (veil?.active) this.tweens.add({ targets: veil, alpha: 0, duration: 660, ease: 'Sine.easeInOut' });
    }

    setSurface(surface) {
      const next = String(surface || 'title');
      if (next === this.surface) {
        this.syncNativeTitleUi(next);
        this.syncNativeAnnalsUi(next);
        this.syncNativeCreationUi(next);
        this.syncNativeOpeningUi(next);
        this.syncNativeGameplayUi(next);
        this.syncNativeHudUi();
        this.syncNativeBottomBarUi();
        this.syncNativeLeftDrawerUi();
        this.syncNativeRightDrawerUi();
        return;
      }
      const previous = this.surface;
      this.surface = next;
      this.syncAshmereLandmarks();
      this.syncNativeTitleUi(next);
      this.syncNativeAnnalsUi(next);
      this.syncNativeCreationUi(next);
      this.syncNativeOpeningUi(next);
      this.syncNativeGameplayUi(next);
      this.syncNativeHudUi();
      this.syncNativeBottomBarUi();
      this.syncNativeLeftDrawerUi();
      this.syncNativeRightDrawerUi();
      if (!previous || !this.engineAwakened || this.awakeningActive) return;
      this.playSurfaceTransition(next);
    }

    playSurfaceTransition(surface) {
      if (reducedMotion()) return;
      const size = this.dimensions();
      const colors = {
        title: 0xd8bb7b, dispatches: 0xd8bb7b, settings: 0x91a6c0, credits: 0xd8bb7b,
        annals: 0xc9ad72, creation: 0x9caacb, awakening: 0xb5c99e,
        combat: 0xd4aa79, 'combat-results': 0xe3c37d, expedition: 0xa6b99a,
        'expedition-results': 0xe3c37d, town: 0xd8bb7b, 'town-service': 0xd8bb7b,
        dungeon: 0xa4b4c7, 'field-site': 0x9ac8b2, modal: 0xe3c37d
      };
      const color = colors[surface] || 0xd8bb7b;
      const upper = this.add.rectangle(-size.width * 0.3, size.height * 0.16, size.width * 0.32, 2, color, 0.62).setDepth(8);
      const lower = this.add.rectangle(size.width * 1.3, size.height * 0.84, size.width * 0.32, 2, color, 0.52).setDepth(8);
      this.surfaceTransitionCount += 1;
      this.tweens.add({
        targets: upper, x: size.width * 0.5, alpha: 0, scaleX: 2.3, duration: 620,
        ease: 'Cubic.easeOut', onComplete: () => upper.destroy()
      });
      this.tweens.add({
        targets: lower, x: size.width * 0.5, alpha: 0, scaleX: 2.3, duration: 720, delay: 70,
        ease: 'Cubic.easeOut', onComplete: () => lower.destroy()
      });
      const camera = this.cameras.main;
      this.tweens.killTweensOf(camera);
      camera.setZoom(1.012);
      this.tweens.add({ targets: camera, zoom: 1, duration: 520, ease: 'Sine.easeOut' });
    }

    dimensions() {
      return { width: this.scale.width || 1600, height: this.scale.height || 900 };
    }

    hasFiniteEntranceAnimation(node) {
      if (typeof node?.getAnimations !== 'function') return false;
      return node.getAnimations({ subtree: true }).some(animation => {
        if (!['running', 'pending'].includes(animation.playState)) return false;
        const timing = animation.effect?.getComputedTiming?.();
        // Ambient haze, drifting backdrops and rune loops intentionally run
        // forever. They must never block the native UI painter. Wait only for
        // finite entrance/transition animations whose final layout is pending.
        return Boolean(timing && timing.iterations !== Infinity && Number.isFinite(timing.endTime));
      });
    }

    clearNativeTitleUi(removeClass = true) {
      this.nativeTitleUiLayoutEvent?.remove?.(false);
      this.nativeTitleUiLayoutEvent = null;
      this.nativeTitleUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeTitleUiObjects = [];
      this.nativeTitleUiControls = [];
      this.nativeTitleUiSignature = '';
      this.nativeTitleUiActive = false;
      if (removeClass) document.body?.classList.remove('legend-phaser-title-ui-active');
    }

    setNativeTitleControlFocus(id, active) {
      const control = this.nativeTitleUiControls.find(item => item.id === id);
      if (!control?.container?.active) return;
      control.focusFrame?.setVisible?.(Boolean(active));
      const targetX = control.x + (active && !reducedMotion() ? 2 : 0);
      if (reducedMotion()) {
        control.container.x = targetX;
      } else {
        this.tweens.add({
          targets: control.container,
          x: targetX,
          duration: 120,
          ease: 'Sine.easeOut',
          overwrite: true
        });
      }
    }

    syncNativeTitleUi(surface = this.surface) {
      const hero = root()?.querySelector('.title-v136-rpg .v120-title-hero');
      // Continue is the returning-player title state. Keep this button set in
      // the already-styled DOM until the native canvas painter has a proven
      // returning-save parity path. This prevents a gold canvas button from
      // becoming the only visible surface if its label texture/layout fails.
      if (String(surface || '') === 'title' && hero?.querySelector('#continue')) {
        this.clearNativeTitleUi();
        return;
      }
      if (String(surface || '') !== 'title' || !hero) {
        if (this.nativeTitleUiActive || document.body?.classList.contains('legend-phaser-title-ui-active')) {
          this.clearNativeTitleUi();
        }
        return;
      }

      if (this.hasFiniteEntranceAnimation(hero)) {
        // Reveal the semantic DOM during a finite entrance pose; otherwise the
        // previous Phaser frame can sit over the new screen while it animates.
        this.clearNativeTitleUi();
        // Measure the final painted bounds, not the intermediate CSS entrance pose.
        this.nativeTitleUiLayoutEvent?.remove?.(false);
        this.nativeTitleUiLayoutEvent = this.time.delayedCall(820, () => {
          this.nativeTitleUiLayoutEvent = null;
          this.syncNativeTitleUi(surface);
        });
        return;
      }
      this.nativeTitleUiLayoutEvent?.remove?.(false);
      this.nativeTitleUiLayoutEvent = null;

      const buttons = Array.from(hero.querySelectorAll('.v136-menu-btn'));
      const panelRect = hero.getBoundingClientRect();
      if (!panelRect.width || !panelRect.height || !buttons.length) {
        this.clearNativeTitleUi();
        return;
      }

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const sceneRect = rect => ({
        x: rect.left * sx,
        y: rect.top * sy,
        width: rect.width * sx,
        height: rect.height * sy
      });
      const signature = JSON.stringify([
        Math.round(panelRect.left), Math.round(panelRect.top), Math.round(panelRect.width), Math.round(panelRect.height),
        ...buttons.map(button => {
          const rect = button.getBoundingClientRect();
          return [button.id, Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height),
            button.querySelector('.v136-menu-copy strong')?.textContent?.trim() || '',
            button.querySelector('.v136-menu-copy small')?.textContent?.trim() || ''];
        })
      ]);
      if (this.nativeTitleUiActive && signature === this.nativeTitleUiSignature) return;

      this.clearNativeTitleUi(false);
      this.nativeTitleUiActive = true;
      this.nativeTitleUiSignature = signature;
      document.body?.classList.add('legend-phaser-title-ui-active');

      const panel = sceneRect(panelRect);
      const frame = this.add.graphics().setDepth(12);
      frame.fillStyle(0x020604, 0.48);
      frame.fillRect(panel.x - 7 * sx, panel.y + 8 * sy, panel.width + 14 * sx, panel.height + 8 * sy);
      frame.fillStyle(0x08110b, 0.90);
      frame.fillRect(panel.x, panel.y, panel.width, panel.height);
      frame.lineStyle(1.2, 0xd5b775, 0.78);
      frame.strokeRect(panel.x + 0.5, panel.y + 0.5, panel.width - 1, panel.height - 1);
      frame.lineStyle(1, 0x9c895d, 0.34);
      frame.strokeRect(panel.x + 8 * sx, panel.y + 8 * sy, panel.width - 16 * sx, panel.height - 16 * sy);
      frame.fillStyle(0xe0bd75, 0.66);
      frame.fillRect(panel.x + 1 * sx, panel.y + 18 * sy, 2 * sx, Math.max(12, panel.height - 36 * sy));
      frame.fillStyle(0xe8cf9a, 0.78);
      frame.fillRect(panel.x + 15 * sx, panel.y + 12 * sy, Math.min(42 * sx, panel.width * 0.15), Math.max(1, sy));
      this.nativeTitleUiObjects.push(frame);

      const iconTextures = {
        continue: 'menuCompass',
        newPrimary: 'menuTraveler',
        new: 'menuInn',
        account: 'menuJournal',
        settings: 'menuSettings',
        dispatches: 'menuRoad',
        credits: 'menuMilestone'
      };
      buttons.forEach(button => {
        const rect = sceneRect(button.getBoundingClientRect());
        const primary = button.classList.contains('v136-menu-primary');
        const main = button.querySelector('.v136-menu-copy strong')?.textContent?.trim() || button.textContent.trim();
        const detail = button.querySelector('.v136-menu-copy small')?.textContent?.trim() || '';
        button.setAttribute('aria-label', [main, detail].filter(Boolean).join('. '));
        const mainCss = window.getComputedStyle(button.querySelector('.v136-menu-copy strong') || button);
        const detailCss = window.getComputedStyle(button.querySelector('.v136-menu-copy small') || button);
        const mainSize = Math.max(10, Math.round((parseFloat(mainCss.fontSize) || 13) * sy));
        const detailSize = Math.max(9, Math.round((parseFloat(detailCss.fontSize) || 10) * sy));
        const group = this.add.container(rect.x, rect.y).setDepth(13);
        const art = this.add.graphics();
        // Use deliberate, fully opaque menu surfaces. The DOM underneath is an
        // accessible hit target only, so these are the actual visible buttons.
        const idleFill = primary ? 0xd5a44e : 0x09150d;
        const idleLine = primary ? 0xffe6aa : 0xe0c17d;
        art.fillStyle(idleFill, 0.99);
        art.fillRect(0, 0, rect.width, rect.height);
        art.lineStyle(primary ? 1.8 : 1.35, idleLine, 0.98);
        art.strokeRect(0.5, 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        art.fillStyle(primary ? 0x704918 : 0xe0bd75, 0.96);
        art.fillRect(0, 0, primary ? 4 * sx : 3 * sx, rect.height);
        const iconX = 10 * sx;
        const iconY = Math.max(4 * sy, (rect.height - 28 * sy) / 2);
        art.fillStyle(primary ? 0x5a3d18 : 0x030905, 0.92);
        art.fillRect(iconX, iconY, 28 * sx, Math.min(28 * sy, rect.height - 8 * sy));
        art.lineStyle(1.1, primary ? 0xffedc5 : 0xe5c985, 0.92);
        art.strokeRect(iconX + 0.5, iconY + 0.5, 27 * sx, Math.min(27 * sy, rect.height - 9 * sy));

        const iconKey = iconTextures[button.id] || 'menuMilestone';
        const crispText = textObject => {
          // Phaser Text uses an internal canvas texture. A 2x texture prevents
          // small menu labels from looking soft when the full-screen scene is
          // composited or resized; autoRound keeps glyph placement on whole pixels.
          textObject.setResolution?.(2);
          textObject.autoRound = true;
          return textObject;
        };
        const icon = this.textures.exists(iconKey)
          ? this.add.image(iconX + 14 * sx, rect.height / 2, iconKey)
            .setDisplaySize(25 * sx, 25 * sy)
            .setAlpha(1)
          : crispText(this.add.text(iconX + 14 * sx, rect.height / 2, '✦', {
            fontFamily: 'Georgia, serif',
            fontSize: (Math.max(14, Math.round(16 * sy))) + 'px',
            color: primary ? '#fff2cf' : '#f4d995'
          })).setOrigin(0.5);
        const labelX = Math.round(52 * sx);
        const titleY = Math.round(rect.height * (detail ? 0.38 : 0.5));
        const title = crispText(this.add.text(labelX, titleY, main, {
          fontFamily: 'Georgia, Times New Roman, serif',
          fontSize: `${Math.max(primary ? 17 : 16, mainSize)}px`,
          fontStyle: 'bold',
          color: primary ? '#241707' : '#fff3d7',
          stroke: primary ? '#f0d28f' : '#020704',
          strokeThickness: primary ? 0 : 1,
          letterSpacing: 0.22 * sx,
          padding: { left: 1, right: 2, top: 2, bottom: 2 }
        })).setOrigin(0, 0.5);
        const subtitle = crispText(this.add.text(labelX, Math.round(rect.height * 0.73), detail, {
          fontFamily: 'Arial, sans-serif',
          fontSize: `${Math.max(12, detailSize)}px`,
          fontStyle: primary ? 'bold' : 'normal',
          color: primary ? '#3e2b10' : '#dce6d9',
          stroke: primary ? '#f0d28f' : '#020704',
          strokeThickness: primary ? 0 : 0.55,
          padding: { left: 1, right: 2, top: 1, bottom: 1 }
        })).setOrigin(0, 0.5);
        const arrow = crispText(this.add.text(rect.width - 17 * sx, Math.round(rect.height / 2), '›', {
          fontFamily: 'Georgia, serif',
          fontSize: `${Math.max(22, Math.round(24 * sy))}px`,
          fontStyle: 'bold',
          color: primary ? '#36230b' : '#f1d58f',
          padding: { left: 1, right: 2, top: 1, bottom: 1 }
        })).setOrigin(0.5);
        const focusFrame = this.add.graphics();
        focusFrame.lineStyle(2.4, primary ? 0x5a3b14 : 0xffe6a5, 1);
        focusFrame.strokeRect(1, 1, Math.max(1, rect.width - 2), Math.max(1, rect.height - 2));
        focusFrame.setVisible(button === document.activeElement || button.matches(':hover'));
        group.add([art, icon, title, subtitle, arrow, focusFrame]);
        group.setSize(rect.width, rect.height);
        this.nativeTitleUiObjects.push(group);
        const control = {
          id: button.id,
          label: main,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          container: group,
          focusFrame,
          titleText: title,
          subtitleText: subtitle,
          button
        };
        this.nativeTitleUiControls.push(control);

        if (!button.__legendNativeTitleUiBound) {
          button.__legendNativeTitleUiBound = true;
          button.addEventListener('pointerenter', () => this.setNativeTitleControlFocus(button.id, true));
          button.addEventListener('pointerleave', () => this.setNativeTitleControlFocus(button.id, document.activeElement === button));
          button.addEventListener('focus', () => this.setNativeTitleControlFocus(button.id, true));
          button.addEventListener('blur', () => this.setNativeTitleControlFocus(button.id, button.matches(':hover')));
        }
      });
    }

    clearNativeAnnalsUi(removeClass = true) {
      this.nativeAnnalsUiLayoutEvent?.remove?.(false);
      this.nativeAnnalsUiLayoutEvent = null;
      if (this.nativeAnnalsUiScrollTarget) {
        this.nativeAnnalsUiScrollTarget.removeEventListener('scroll', this.nativeAnnalsUiScrollTarget.__legendAnnalsScrollHandler);
        this.nativeAnnalsUiScrollTarget = null;
      }
      this.nativeAnnalsUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeAnnalsUiObjects = [];
      this.nativeAnnalsUiSignature = '';
      this.nativeAnnalsUiActive = false;
      this.nativeAnnalsUiButtonFocus = null;
      if (removeClass) document.body?.classList.remove('legend-phaser-annals-ui-active');
    }

    syncNativeAnnalsUi(surface = this.surface) {
      const screen = root()?.querySelector('.opening-lore-v220');
      if (String(surface || '') !== 'annals' || !screen) {
        if (this.nativeAnnalsUiActive || document.body?.classList.contains('legend-phaser-annals-ui-active')) {
          this.clearNativeAnnalsUi();
        }
        return;
      }

      if (this.hasFiniteEntranceAnimation(screen)) {
        this.clearNativeAnnalsUi();
        this.nativeAnnalsUiLayoutEvent?.remove?.(false);
        this.nativeAnnalsUiLayoutEvent = this.time.delayedCall(680, () => {
          this.nativeAnnalsUiLayoutEvent = null;
          this.syncNativeAnnalsUi(surface);
        });
        return;
      }
      this.nativeAnnalsUiLayoutEvent?.remove?.(false);
      this.nativeAnnalsUiLayoutEvent = null;

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const readRect = node => {
        const rect = node?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return null;
        return { x: rect.left * sx, y: rect.top * sy, width: rect.width * sx, height: rect.height * sy };
      };
      const top = screen.querySelector('.opening-lore-v220-top');
      const content = screen.querySelector('.opening-lore-v220-content');
      const side = screen.querySelector('.opening-lore-v220-side');
      const copy = screen.querySelector('.opening-lore-v220-copy');
      const footer = screen.querySelector('.opening-lore-v220-footer');
      const brand = screen.querySelector('.opening-lore-v220-brand');
      const edition = screen.querySelector('.opening-lore-v220-edition');
      const numeral = side?.querySelector('span');
      const sideRule = side?.querySelector('i');
      const sideStep = side?.querySelector('small');
      const kicker = copy?.querySelector('.opening-lore-v220-kicker');
      const heading = copy?.querySelector('h1');
      const paragraphs = Array.from(copy?.querySelectorAll('p') || []);
      const quote = copy?.querySelector('blockquote');
      const progress = footer?.querySelector('.opening-lore-v220-progress');
      const progressFill = progress?.querySelector('i');
      const button = footer?.querySelector('.opening-lore-v220-continue');
      const nodes = [top, content, side, brand, edition, numeral, sideRule, sideStep, kicker, heading, ...paragraphs, quote, footer, progress, progressFill, button];
      const rects = nodes.map(node => readRect(node));
      const signature = JSON.stringify([
        Number(screen.dataset.loreStep || 0), Math.round(window.innerWidth), Math.round(window.innerHeight),
        ...rects.map(rect => rect && [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)]),
        heading?.textContent || '', paragraphs.map(node => node.textContent), quote?.textContent || '',
        button?.textContent || ''
      ]);
      if (this.nativeAnnalsUiActive && signature === this.nativeAnnalsUiSignature) return;

      // Each lore page is rebuilt by the existing prologue controller. Phaser
      // mirrors the resulting text and controls; the controller remains in charge
      // of chapter order and the hand-off into traveler creation.
      this.clearNativeAnnalsUi(false);
      this.nativeAnnalsUiActive = true;
      this.nativeAnnalsUiSignature = signature;
      document.body?.classList.add('legend-phaser-annals-ui-active');

      if (!this.nativeAnnalsUiScrollTarget) {
        this.nativeAnnalsUiScrollTarget = screen;
        const handler = () => {
          this.nativeAnnalsUiLayoutEvent?.remove?.(false);
          this.nativeAnnalsUiLayoutEvent = this.time.delayedCall(48, () => {
            this.nativeAnnalsUiLayoutEvent = null;
            this.syncNativeAnnalsUi(surface);
          });
        };
        screen.__legendAnnalsScrollHandler = handler;
        screen.addEventListener('scroll', handler, { passive: true });
      }

      const addObject = object => {
        if (!object) return object;
        object.setDepth?.(12);
        this.nativeAnnalsUiObjects.push(object);
        return object;
      };
      const styleOf = node => window.getComputedStyle(node);
      const makeText = (node, rect, overrides = {}) => {
        if (!node || !rect) return null;
        const style = styleOf(node);
        let text = node.textContent?.replace(/\s+/g, ' ').trim() || '';
        if (style.textTransform === 'uppercase') text = text.toLocaleUpperCase();
        else if (style.textTransform === 'lowercase') text = text.toLocaleLowerCase();
        if (!text) return null;
        const fontSize = Math.max(9, (parseFloat(style.fontSize) || 14) * sy);
        const lineHeight = parseFloat(style.lineHeight) || (parseFloat(style.fontSize) || 14) * 1.4;
        const config = {
          fontFamily: style.fontFamily || 'Georgia, Times New Roman, serif',
          fontSize: fontSize + 'px',
          fontStyle: style.fontWeight === 'bold' || Number(style.fontWeight) >= 650 ? 'bold' : (style.fontStyle || 'normal'),
          color: overrides.color || style.color || '#f0e8d4',
          lineSpacing: Math.max(0, (lineHeight - (parseFloat(style.fontSize) || 14)) * sy),
          letterSpacing: Number.isFinite(parseFloat(style.letterSpacing)) ? Math.max(0, parseFloat(style.letterSpacing) * sx) : 0,
          wordWrap: { width: Math.max(36, rect.width), useAdvancedWrap: true },
          padding: { left: 1, right: 2, top: 1, bottom: 2 },
          align: style.textAlign || 'left'
        };
        const textX = rect.x + Math.max(0, Number(overrides.insetLeft) || 0) * sx;
        return addObject(this.add.text(textX, rect.y, text, config).setOrigin(0, 0));
      };

      const screenRect = readRect(screen);
      const contentRect = readRect(content);
      const topRect = readRect(top);
      const footerRect = readRect(footer);
      const copyRect = readRect(copy);
      const sideRect = readRect(side);

      const scrim = this.add.graphics();
      if (screenRect) {
        scrim.fillStyle(0x020704, 0.24);
        scrim.fillRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
      }
      if (copyRect) {
        scrim.fillStyle(0x050a06, 0.23);
        scrim.fillRoundedRect?.(copyRect.x - 18 * sx, copyRect.y - 14 * sy, copyRect.width + 36 * sx, copyRect.height + 28 * sy, 4 * sx);
      }
      addObject(scrim);

      const rules = this.add.graphics();
      if (topRect) {
        rules.lineStyle(1, 0xddc07c, 0.48);
        rules.lineBetween(topRect.x, topRect.y + topRect.height, topRect.x + topRect.width, topRect.y + topRect.height);
      }
      if (footerRect) {
        rules.lineStyle(1, 0xddc07c, 0.44);
        rules.lineBetween(footerRect.x, footerRect.y, footerRect.x + footerRect.width, footerRect.y);
      }
      if (sideRect && readRect(sideRule)) {
        const line = readRect(sideRule);
        rules.lineStyle(1.2, 0xd6ba72, 0.82);
        rules.lineBetween(line.x + line.width / 2, line.y, line.x + line.width / 2, line.y + line.height);
      }
      if (contentRect) {
        rules.fillStyle(0xd6ba72, 0.08);
        rules.fillRect(contentRect.x, contentRect.y, Math.max(1, 1.2 * sx), contentRect.height);
      }
      addObject(rules);

      makeText(brand, readRect(brand), { color: '#f0e5c5' });
      makeText(edition, readRect(edition), { color: '#d8dccb' });
      makeText(numeral, readRect(numeral), { color: '#d2b876' });
      makeText(sideStep, readRect(sideStep), { color: '#d1d5c3' });
      makeText(kicker, readRect(kicker), { color: '#e0c780' });
      makeText(heading, readRect(heading), { color: '#fff0cf' });
      paragraphs.forEach(node => makeText(node, readRect(node), { color: '#f0f0e5' }));
      makeText(quote, readRect(quote), { color: '#ffe6b2', insetLeft: 19 });

      if (progress) {
        const track = readRect(progress);
        const fill = readRect(progressFill);
        if (track && fill) {
          const progressGraphics = this.add.graphics();
          progressGraphics.fillStyle(0x7c6b47, 0.42);
          progressGraphics.fillRect(track.x, track.y, track.width, Math.max(2, track.height));
          progressGraphics.fillStyle(0xe7c982, 0.96);
          progressGraphics.fillRect(track.x, track.y, Math.max(0, fill.width), Math.max(2, track.height));
          addObject(progressGraphics);
        }
      }

      if (button) {
        const rect = readRect(button);
        if (rect) {
          button.setAttribute('aria-label', button.textContent.replace(/→/g, '').trim());
          const buttonGraphics = this.add.graphics();
          buttonGraphics.fillStyle(0x57421f, 0.98);
          buttonGraphics.fillRect(rect.x, rect.y, rect.width, rect.height);
          buttonGraphics.lineStyle(1.35, 0xe8c47a, 0.9);
          buttonGraphics.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
          buttonGraphics.fillStyle(0xf0ca76, 0.96);
          buttonGraphics.fillRect(rect.x, rect.y, 3 * sx, rect.height);
          addObject(buttonGraphics);
          const labelRect = readRect(button);
          makeText(button, labelRect, { color: '#fff0c5' });
          if (!button.__legendNativeAnnalsBound) {
            button.__legendNativeAnnalsBound = true;
            button.addEventListener('focus', () => this.setNativeAnnalsButtonFocus(true));
            button.addEventListener('blur', () => this.setNativeAnnalsButtonFocus(false));
            button.addEventListener('pointerenter', () => this.setNativeAnnalsButtonFocus(true));
            button.addEventListener('pointerleave', () => this.setNativeAnnalsButtonFocus(document.activeElement === button));
          }
          const focus = this.add.graphics();
          focus.lineStyle(2, 0xffe7a6, 0.98);
          focus.strokeRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2);
          focus.setVisible(button === document.activeElement || button.matches(':hover'));
          addObject(focus);
          this.nativeAnnalsUiButtonFocus = focus;
        }
      }
    }

    setNativeAnnalsButtonFocus(active) {
      this.nativeAnnalsUiButtonFocus?.setVisible?.(Boolean(active));
    }

    clearNativeCreationUi(removeClass = true) {
      this.nativeCreationUiLayoutEvent?.remove?.(false);
      this.nativeCreationUiLayoutEvent = null;
      if (this.nativeCreationUiScrollTarget) {
        this.nativeCreationUiScrollTarget.removeEventListener('scroll', this.nativeCreationUiScrollTarget.__legendCreationScrollHandler);
        this.nativeCreationUiScrollTarget = null;
      }
      this.nativeCreationUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeCreationUiObjects = [];
      this.nativeCreationUiControls = [];
      this.nativeCreationUiSignature = '';
      this.nativeCreationUiActive = false;
      this.nativeCreationUiTextures.forEach(key => {
        try { this.textures.remove(key); } catch (error) { console.warn('[LEGEND Phaser] Could not release creation art texture.', error); }
      });
      this.nativeCreationUiTextures = [];
      if (removeClass) document.body?.classList.remove('legend-phaser-creation-ui-active');
    }

    createNativeCreationArtTexture(img, wrapper) {
      if (!img || !wrapper || !img.complete || !img.naturalWidth || !img.naturalHeight) return '';
      const imageRect = img.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      if (!wrapperRect.width || !wrapperRect.height || !imageRect.width || !imageRect.height) return '';
      const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(wrapperRect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(wrapperRect.height * pixelRatio));
      const context = canvas.getContext('2d');
      if (!context) return '';
      context.save();
      context.beginPath();
      context.rect(0, 0, canvas.width, canvas.height);
      context.clip();
      const imageStyle = window.getComputedStyle(img);
      const fit = imageStyle.objectFit;
      context.filter = imageStyle.filter && imageStyle.filter !== 'none' ? imageStyle.filter : 'none';
      if (wrapper === img && fit === 'cover') {
        const sourceWidth = img.naturalWidth;
        const sourceHeight = img.naturalHeight;
        const destinationRatio = wrapperRect.width / wrapperRect.height;
        const sourceRatio = sourceWidth / sourceHeight;
        const position = String(imageStyle.objectPosition || '50% 50%').split(/\s+/);
        const positionX = Math.max(0, Math.min(1, parseFloat(position[0]) / 100 || 0.5));
        const positionY = Math.max(0, Math.min(1, parseFloat(position[1] || position[0]) / 100 || 0.5));
        let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
        if (sourceRatio > destinationRatio) {
          sw = sourceHeight * destinationRatio;
          sx = (sourceWidth - sw) * positionX;
        } else {
          sh = sourceWidth / destinationRatio;
          sy = (sourceHeight - sh) * positionY;
        }
        context.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } else {
        const dx = (imageRect.left - wrapperRect.left) * pixelRatio;
        const dy = (imageRect.top - wrapperRect.top) * pixelRatio;
        context.drawImage(img, dx, dy, imageRect.width * pixelRatio, imageRect.height * pixelRatio);
      }
      context.restore();
      const key = 'nativeCreationArt' + (++this.nativeCreationUiTextureCounter);
      try {
        this.textures.addCanvas(key, canvas);
        this.nativeCreationUiTextures.push(key);
        return key;
      } catch (error) {
        console.warn('[LEGEND Phaser] Creation artwork could not be mirrored into the scene.', error);
        return '';
      }
    }

    setNativeCreationControlFocus(id, active) {
      const control = this.nativeCreationUiControls.find(item => item.id === id);
      if (!control?.focusFrame?.active) return;
      control.focusFrame.setVisible(Boolean(active));
      if (control.container?.active) {
        const offset = active && !reducedMotion() ? 1.5 : 0;
        if (reducedMotion()) control.container.x = control.x + offset;
        else this.tweens.add({
          targets: control.container,
          x: control.x + offset,
          duration: 110,
          ease: 'Sine.easeOut',
          overwrite: true
        });
      }
    }

    syncNativeCreationUi(surface = this.surface) {
      const screen = root()?.querySelector('.v140-creation:not(.v140-arrival)');
      if (String(surface || '') !== 'creation' || !screen) {
        if (this.nativeCreationUiActive || document.body?.classList.contains('legend-phaser-creation-ui-active')) {
          this.clearNativeCreationUi();
        }
        return;
      }

      if (this.hasFiniteEntranceAnimation(screen)) {
        // A new creation step can have a different layout. Never leave the
        // previous step's Phaser cards over the incoming DOM while it animates.
        this.clearNativeCreationUi();
        this.nativeCreationUiLayoutEvent?.remove?.(false);
        this.nativeCreationUiLayoutEvent = this.time.delayedCall(720, () => {
          this.nativeCreationUiLayoutEvent = null;
          this.syncNativeCreationUi(surface);
        });
        return;
      }
      this.nativeCreationUiLayoutEvent?.remove?.(false);
      this.nativeCreationUiLayoutEvent = null;

      const screenImages = Array.from(screen.querySelectorAll('img')).filter(img =>
        !img.closest('[hidden]') && img.getBoundingClientRect().width > 0
      );
      screenImages.forEach(img => {
        img.loading = 'eager';
        if (!img.complete) {
          if (!img.__legendCreationLoadBound) {
            img.__legendCreationLoadBound = true;
            img.addEventListener('load', () => this.syncNativeCreationUi(surface), { once: true });
            img.addEventListener('error', () => this.syncNativeCreationUi(surface), { once: true });
          }
        }
      });
      const pendingImages = screenImages.some(img => !img.complete);
      if (pendingImages) {
        this.nativeCreationUiLayoutEvent?.remove?.(false);
        this.nativeCreationUiLayoutEvent = this.time.delayedCall(240, () => {
          this.nativeCreationUiLayoutEvent = null;
          this.syncNativeCreationUi(surface);
        });
        return;
      }

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const readRect = node => {
        const rect = node?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return null;
        return { x: rect.left * sx, y: rect.top * sy, width: rect.width * sx, height: rect.height * sy };
      };
      const choices = Array.from(screen.querySelectorAll('.v094-choice'));
      const controls = Array.from(screen.querySelectorAll('.v094-actions button'));
      const textNodes = Array.from(screen.querySelectorAll('h1,h2,h3,p,small,strong,em,label,span'))
        .filter(node => !node.matches('#v094NameError,#v094ChoiceError') && !node.closest('[hidden]') && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0);
      const panels = Array.from(screen.querySelectorAll(
        '.v094-beginning-card,.v140-guide-portrait-frame,.v140-dialogue-box,.v094-stepper,.v094-scene-note,.v094-choice,.v094-summary > div,.v094-confirm-benefit,.v094-field,.v094-actions button'
      ));
      const imageSpecs = screenImages.map((img, index) => {
        let wrapper = img;
        if (img.closest('.v094-choice-art')) wrapper = img.closest('.v094-choice-art');
        else if (img.closest('.v094-gender-emblem')) wrapper = img.closest('.v094-gender-emblem');
        const rect = readRect(wrapper);
        return { img, wrapper, rect, index };
      }).filter(item => item.rect);
      const signature = JSON.stringify([
        screen.dataset.creationStep || '',
        screen.classList.contains('v140-arrival'),
        Math.round(window.innerWidth), Math.round(window.innerHeight),
        screen.scrollTop,
        ...panels.map(node => {
          const rect = node.getBoundingClientRect();
          return [node.className, Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height),
            node.classList.contains('is-selected'), node.getAttribute('aria-pressed') || ''];
        }),
        ...textNodes.map(node => [node.tagName, node.textContent?.replace(/\s+/g, ' ').trim() || '', Math.round(node.getBoundingClientRect().left), Math.round(node.getBoundingClientRect().top)]),
        ...imageSpecs.map(item => [item.img.currentSrc || item.img.src, Math.round(item.rect.x), Math.round(item.rect.y), Math.round(item.rect.width), Math.round(item.rect.height)]),
        screen.querySelector('#v094Name')?.value || ''
      ]);
      if (this.nativeCreationUiActive && signature === this.nativeCreationUiSignature) return;

      const colorNodes = Array.from(screen.querySelectorAll('h1,h2,h3,p,small,strong,em,label,span'));
      colorNodes.forEach(node => {
        if (!node.dataset.legendNativeCreationColor) {
          node.dataset.legendNativeCreationColor = window.getComputedStyle(node).color || '#eee7d6';
        }
      });

      this.clearNativeCreationUi(false);
      this.nativeCreationUiActive = true;
      this.nativeCreationUiSignature = signature;
      document.body?.classList.add('legend-phaser-creation-ui-active');

      if (!this.nativeCreationUiScrollTarget) {
        this.nativeCreationUiScrollTarget = screen;
        const handler = () => {
          this.nativeCreationUiLayoutEvent?.remove?.(false);
          this.nativeCreationUiLayoutEvent = this.time.delayedCall(48, () => {
            this.nativeCreationUiLayoutEvent = null;
            this.syncNativeCreationUi(surface);
          });
        };
        screen.__legendCreationScrollHandler = handler;
        screen.addEventListener('scroll', handler, { passive: true });
      }

      const addObject = (object, depth = 13) => {
        if (!object) return object;
        object.setDepth?.(depth);
        this.nativeCreationUiObjects.push(object);
        return object;
      };
      const rectFor = node => readRect(node);
      const drawPanel = (node, options = {}) => {
        const rect = rectFor(node);
        if (!rect) return null;
        const graphics = this.add.graphics();
        graphics.fillStyle(options.fill ?? 0x0a100b, options.alpha ?? 0.94);
        graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        graphics.lineStyle(options.lineWidth ?? 1, options.stroke ?? 0xd1b575, options.strokeAlpha ?? 0.58);
        graphics.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        if (options.inset !== false && rect.width > 16 && rect.height > 16) {
          graphics.lineStyle(1, 0xc2a96f, 0.15);
          graphics.strokeRect(rect.x + 6 * sx, rect.y + 6 * sy, rect.width - 12 * sx, rect.height - 12 * sy);
        }
        return addObject(graphics, 12);
      };
      const imageKeys = [];
      imageSpecs.forEach(item => {
        const key = this.createNativeCreationArtTexture(item.img, item.wrapper);
        if (key) imageKeys[item.index] = key;
      });
      imageSpecs.forEach(item => {
        const key = imageKeys[item.index];
        if (!key || !this.textures.exists(key)) return;
        const rect = item.rect;
        const opacity = Number.parseFloat(window.getComputedStyle(item.img).opacity);
        const image = this.add.image(rect.x + rect.width / 2, rect.y + rect.height / 2, key)
          .setDisplaySize(rect.width, rect.height)
          .setAlpha(Number.isFinite(opacity) ? Math.max(0, Math.min(1, opacity)) : 1);
        addObject(image, 13);
      });
      imageSpecs.forEach(item => {
        const rect = item.rect;
        const frame = this.add.graphics();
        if (item.wrapper.classList.contains('v094-gender-emblem')) {
          const radius = Math.min(rect.width, rect.height) * 0.47;
          frame.fillStyle(0x18251b, 0.96);
          frame.fillCircle(rect.x + rect.width / 2, rect.y + rect.height / 2, radius);
          frame.lineStyle(1.4, 0xe0c17d, 0.92);
          frame.strokeCircle(rect.x + rect.width / 2, rect.y + rect.height / 2, radius);
          frame.lineStyle(1, 0xead49d, 0.28);
          frame.strokeCircle(rect.x + rect.width / 2, rect.y + rect.height / 2, radius * 0.84);
        } else if (item.wrapper.classList.contains('v094-choice-art')) {
          frame.fillStyle(0x090f0b, 0.94);
          frame.fillRect(rect.x, rect.y, rect.width, rect.height);
          frame.lineStyle(1, 0xc9aa69, 0.58);
          frame.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
        } else if (item.img.classList.contains('v094-class-art')) {
          frame.fillStyle(0x080f0b, 0.92);
          frame.fillRect(rect.x, rect.y, rect.width, rect.height);
          frame.lineStyle(1, 0xc9aa69, 0.52);
          frame.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
        } else {
          return;
        }
        addObject(frame, 12.5);
      });
      const presenceFrame = screen.querySelector('.v140-presence-frame');
      const presenceRect = rectFor(presenceFrame);
      if (presenceRect) {
        const glow = this.add.graphics();
        const cx = presenceRect.x + presenceRect.width / 2;
        const cy = presenceRect.y + presenceRect.height * 0.43;
        glow.fillStyle(0x7474a2, 0.12);
        glow.fillEllipse(cx, cy, presenceRect.width * 0.7, presenceRect.height * 0.58);
        glow.lineStyle(1.2, 0xc5bfe8, 0.34);
        glow.strokeEllipse(cx, cy, presenceRect.width * 0.46, presenceRect.width * 0.46);
        glow.lineStyle(1, 0x92a5c5, 0.22);
        glow.strokeEllipse(cx, cy, presenceRect.width * 0.58, presenceRect.width * 0.58);
        addObject(glow, 13);
        if (!reducedMotion()) {
          this.tweens.add({
            targets: glow,
            alpha: 0.74,
            duration: 2600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }

      const brandHeader = screen.querySelector('.v140-creation-brand');
      const brandHeaderRect = rectFor(brandHeader);
      const brandLabel = brandHeader?.querySelector(':scope > span:last-child');
      const brandLabelRect = rectFor(brandLabel);
      if (brandHeaderRect || brandLabelRect) {
        const brandRules = this.add.graphics();
        if (brandHeaderRect) {
          brandRules.lineStyle(1, 0xd3b56c, 0.42);
          brandRules.lineBetween(
            brandHeaderRect.x,
            brandHeaderRect.y + brandHeaderRect.height,
            brandHeaderRect.x + brandHeaderRect.width,
            brandHeaderRect.y + brandHeaderRect.height
          );
        }
        if (brandLabelRect) {
          brandRules.lineStyle(1, 0xd3b56c, 0.44);
          brandRules.lineBetween(
            brandLabelRect.x + 0.5 * sx,
            brandLabelRect.y + 4 * sy,
            brandLabelRect.x + 0.5 * sx,
            brandLabelRect.y + brandLabelRect.height - 4 * sy
          );
        }
        addObject(brandRules, 12);
      }

      panels.forEach(node => {
        if (node.matches('.v094-choice')) {
          const selected = node.classList.contains('is-selected') || node.getAttribute('aria-pressed') === 'true';
          drawPanel(node, {
            fill: selected ? 0x1b3f2a : 0x0a130d,
            alpha: selected ? 0.95 : 0.91,
            stroke: selected ? 0x80c88e : 0xc4a867,
            strokeAlpha: selected ? 0.98 : 0.42,
            lineWidth: selected ? 1.8 : 1,
            inset: false
          });
        } else if (node.matches('.v094-actions button')) {
          const primary = node.classList.contains('primary');
          drawPanel(node, {
            fill: primary ? 0x604923 : 0x111b13,
            alpha: 0.98,
            stroke: primary ? 0xe8c77e : 0xa89262,
            strokeAlpha: primary ? 0.92 : 0.55,
            lineWidth: primary ? 1.4 : 1,
            inset: false
          });
        } else if (node.matches('.v094-beginning-card')) {
          drawPanel(node, { fill: 0x101810, alpha: 0.97, stroke: 0xc6a96a, strokeAlpha: 0.82, lineWidth: 1.4 });
        } else if (node.matches('.v140-guide-portrait-frame.v140-presence-frame')) {
          drawPanel(node, { fill: 0x10111f, alpha: 0.99, stroke: 0xa9a1d0, strokeAlpha: 0.82 });
        } else if (node.matches('.v140-guide-portrait-frame')) {
          drawPanel(node, { fill: 0x101810, alpha: 0.99, stroke: 0xd7b66e, strokeAlpha: 0.9 });
        } else if (node.matches('.v140-dialogue-box')) {
          const mystery = screen.classList.contains('v140-creation');
          drawPanel(node, { fill: mystery ? 0x11121f : 0x101810, alpha: 0.98, stroke: mystery ? 0x9e98c6 : 0xd7b66e, strokeAlpha: 0.8 });
        } else if (node.matches('.v094-summary > div,.v094-confirm-benefit')) {
          drawPanel(node, { fill: 0x0d160f, alpha: 0.92, stroke: 0x8e9f7b, strokeAlpha: 0.44, inset: false });
        } else if (node.matches('.v094-field')) {
          drawPanel(node, { fill: 0x0a120d, alpha: 0.72, stroke: 0xd1b575, strokeAlpha: 0.4, inset: false });
        } else if (node.matches('.v094-stepper')) {
          drawPanel(node, { fill: 0x0a120d, alpha: 0.64, stroke: 0xd1b575, strokeAlpha: 0.36, inset: false });
        } else if (node.matches('.v094-scene-note')) {
          drawPanel(node, { fill: 0x282319, alpha: 0.58, stroke: 0xd6b875, strokeAlpha: 0.64, inset: false });
        }
      });

      const styleOf = node => window.getComputedStyle(node);
      const makeText = (node, overrides = {}) => {
        if (!node) return null;
        const rect = rectFor(node);
        if (!rect) return null;
        let text = node.textContent?.replace(/\s+/g, ' ').trim() || '';
        if (styleOf(node).textTransform === 'uppercase') text = text.toLocaleUpperCase();
        else if (styleOf(node).textTransform === 'lowercase') text = text.toLocaleLowerCase();
        if (!text) return null;
        const style = styleOf(node);
        const originalColor = node.dataset.legendNativeCreationColor || style.color || '#eee7d6';
        const fontPx = Math.max(9, (parseFloat(style.fontSize) || 14) * sy);
        const linePx = parseFloat(style.lineHeight) || (parseFloat(style.fontSize) || 14) * 1.42;
        const wrap = Math.max(32, rect.width);
        const textObject = this.add.text(rect.x, rect.y, text, {
          fontFamily: style.fontFamily || 'Georgia, Times New Roman, serif',
          fontSize: fontPx + 'px',
          fontStyle: Number(style.fontWeight) >= 650 || style.fontWeight === 'bold'
            ? 'bold'
            : (style.fontStyle || 'normal'),
          color: overrides.color || originalColor,
          lineSpacing: Math.max(0, (linePx - (parseFloat(style.fontSize) || 14)) * sy),
          letterSpacing: Number.isFinite(parseFloat(style.letterSpacing))
            ? Math.max(0, parseFloat(style.letterSpacing) * sx)
            : 0,
          wordWrap: { width: wrap, useAdvancedWrap: true },
          padding: { left: 1, right: 2, top: 1, bottom: 2 },
          align: style.textAlign || 'left'
        }).setOrigin(0, 0);
        return addObject(textObject, 14);
      };
      textNodes.forEach(node => {
        let color = null;
        if (node.matches('.v094-kicker,.v094-stepper-top strong,.v094-choice strong,.v094-summary strong,.v094-confirm-benefit strong,.v140-dialogue-speaker strong')) color = '#e6c77e';
        else if (node.matches('.v140-dialogue-box p,.v094-scene-note p,.v094-beginning-card > p')) color = '#e0e4d8';
        else if (node.matches('.v094-choice-prompt,.v094-stepper-top span,.v094-field label,.v094-confirm-benefit span,.v094-summary span,.v140-dialogue-speaker span,.v140-dialogue-box small')) color = '#b4c0af';
        else if (node.matches('h1,h2,h3')) color = '#f0e5c8';
        makeText(node, { color });
      });

      const stepper = screen.querySelector('.v094-stepper');
      const progressTrack = stepper?.querySelector('.v094-stepper-track');
      const progressFill = progressTrack?.querySelector('i');
      if (progressTrack) {
        const track = rectFor(progressTrack);
        const fill = rectFor(progressFill);
        if (track) {
          const graphics = this.add.graphics();
          graphics.fillStyle(0x233126, 0.95);
          graphics.fillRect(track.x, track.y, track.width, Math.max(3, track.height));
          if (fill) {
            graphics.fillStyle(0x88ae81, 0.98);
            graphics.fillRect(track.x, track.y, Math.max(0, fill.width), Math.max(3, track.height));
          }
          addObject(graphics, 13);
        }
      }

      const mainButtons = [...choices, ...controls];
      mainButtons.forEach((button, index) => {
        const choice = button.classList.contains('v094-choice');
        const key = choice ? Object.keys(button.dataset).find(name => ['gender','personality','origin','class','keepsake'].includes(name)) : '';
        const value = key ? button.dataset[key] : '';
        const id = choice ? 'choice-' + key + '-' + value : (button.id || 'creation-action-' + index);
        const labelText = [
          ...Array.from(button.querySelectorAll('strong,span,em,small')).map(node => node.textContent?.trim() || '')
        ].filter(Boolean).join('. ') || button.textContent?.trim() || id;
        button.setAttribute('aria-label', labelText);
        const rect = rectFor(button);
        if (!rect) return;
        const container = this.add.container(rect.x, rect.y).setDepth(15);
        const focusFrame = this.add.graphics();
        focusFrame.lineStyle(2, choice ? 0xb5d99a : 0xffe7a6, 0.98);
        focusFrame.strokeRect(1, 1, Math.max(1, rect.width - 2), Math.max(1, rect.height - 2));
        focusFrame.setVisible(button === document.activeElement || button.matches(':hover'));
        const objects = [focusFrame];
        if (!choice) {
          const actionStyle = window.getComputedStyle(button);
          const actionText = button.textContent?.replace(/\s+/g, ' ').trim() || id;
          const primaryAction = button.classList.contains('primary');
          const actionLabel = this.add.text(rect.width / 2, rect.height / 2, actionText, {
            fontFamily: actionStyle.fontFamily || 'Arial, sans-serif',
            fontSize: Math.max(10, (parseFloat(actionStyle.fontSize) || 13) * sy) + 'px',
            fontStyle: 'bold',
            color: primaryAction ? '#241803' : '#e9e2cf',
            letterSpacing: 0.25 * sx,
            align: 'center',
            wordWrap: { width: Math.max(40, rect.width - 24 * sx), useAdvancedWrap: true }
          }).setOrigin(0.5);
          objects.push(actionLabel);
        }
        if (choice && (button.classList.contains('is-selected') || button.getAttribute('aria-pressed') === 'true')) {
          const tick = this.add.text(rect.width - 18 * sx, 15 * sy, '✓', {
            fontFamily: 'Arial, sans-serif',
            fontSize: Math.max(13, Math.round(15 * sy)) + 'px',
            fontStyle: 'bold',
            color: '#baffcd'
          }).setOrigin(0.5);
          objects.push(tick);
        }
        container.add(objects);
        addObject(container, 15);
        const control = {
          id,
          label: labelText,
          kind: choice ? 'choice' : 'action',
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          container,
          focusFrame,
          selected: choice && (button.classList.contains('is-selected') || button.getAttribute('aria-pressed') === 'true'),
          button
        };
        this.nativeCreationUiControls.push(control);
        if (!button.__legendNativeCreationBound) {
          button.__legendNativeCreationBound = true;
          button.addEventListener('focus', () => this.setNativeCreationControlFocus(id, true));
          button.addEventListener('blur', () => this.setNativeCreationControlFocus(id, button.matches(':hover')));
          button.addEventListener('pointerenter', () => this.setNativeCreationControlFocus(id, true));
          button.addEventListener('pointerleave', () => this.setNativeCreationControlFocus(id, document.activeElement === button));
        }
      });
    }

    clearNativeOpeningUi(removeClass = true) {
      this.nativeOpeningUiLayoutEvent?.remove?.(false);
      this.nativeOpeningUiLayoutEvent = null;
      if (this.nativeOpeningUiScrollTarget) {
        this.nativeOpeningUiScrollTarget.removeEventListener('scroll', this.nativeOpeningUiScrollTarget.__legendOpeningScrollHandler);
        this.nativeOpeningUiScrollTarget = null;
      }
      this.nativeOpeningUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeOpeningUiObjects = [];
      this.nativeOpeningUiControls = [];
      this.nativeOpeningUiSignature = '';
      this.nativeOpeningUiActive = false;
      if (removeClass) document.body?.classList.remove('legend-phaser-opening-ui-active');
    }

    setNativeOpeningControlFocus(id, active) {
      const control = this.nativeOpeningUiControls.find(item => item.id === id);
      if (!control?.focusFrame?.active) return;
      control.focusFrame.setVisible(Boolean(active));
      if (!control.container?.active) return;
      const offset = active && !reducedMotion() ? 1.5 : 0;
      if (reducedMotion()) control.container.x = control.x + offset;
      else this.tweens.add({
        targets: control.container,
        x: control.x + offset,
        duration: 115,
        ease: 'Sine.easeOut',
        overwrite: true
      });
    }

    syncNativeOpeningUi(surface = this.surface) {
      const screen = root()?.querySelector('.opening-road-v140');
      if (String(surface || '') !== 'awakening' || !screen) {
        if (this.nativeOpeningUiActive || document.body?.classList.contains('legend-phaser-opening-ui-active')) {
          this.clearNativeOpeningUi();
        }
        return;
      }

      if (this.hasFiniteEntranceAnimation(screen)) {
        // Prologue backgrounds and lantern sweeps loop forever; only wait for
        // finite panel entrances, and reveal DOM paint until the new frame is ready.
        this.clearNativeOpeningUi();
        this.nativeOpeningUiLayoutEvent?.remove?.(false);
        this.nativeOpeningUiLayoutEvent = this.time.delayedCall(700, () => {
          this.nativeOpeningUiLayoutEvent = null;
          this.syncNativeOpeningUi(surface);
        });
        return;
      }
      this.nativeOpeningUiLayoutEvent?.remove?.(false);
      this.nativeOpeningUiLayoutEvent = null;

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const rectFor = node => {
        const rect = node?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return null;
        return { x: rect.left * sx, y: rect.top * sy, width: rect.width * sx, height: rect.height * sy };
      };
      const cards = Array.from(screen.querySelectorAll('.opening-road-v140-card,.opening-road-v140-prologue-card'));
      const sceneNotes = Array.from(screen.querySelectorAll('.opening-road-v140-scene-note'));
      const quotes = Array.from(screen.querySelectorAll('blockquote'));
      const buttons = Array.from(screen.querySelectorAll('.opening-road-v140-choice,.opening-road-v140-primary,.opening-road-v140-secondary'));
      const textNodes = Array.from(screen.querySelectorAll('.opening-road-v140-kicker,h1,h2,p,blockquote strong,blockquote p,.opening-road-v140-choice strong,.opening-road-v140-choice span'))
        .filter(node => !node.closest('[hidden]') && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0);
      const panels = [...cards, ...sceneNotes, ...quotes, ...buttons];
      const signature = JSON.stringify([
        screen.className, Math.round(window.innerWidth), Math.round(window.innerHeight), screen.scrollTop,
        ...panels.map(node => {
          const rect = node.getBoundingClientRect();
          return [node.className || node.tagName, Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)];
        }),
        ...textNodes.map(node => [node.tagName, node.textContent?.replace(/\s+/g, ' ').trim() || '', Math.round(node.getBoundingClientRect().left), Math.round(node.getBoundingClientRect().top)]),
        ...buttons.map(button => [button.id, button.dataset.oricResponse || '', button.textContent?.trim() || ''])
      ]);
      if (this.nativeOpeningUiActive && signature === this.nativeOpeningUiSignature) return;

      this.clearNativeOpeningUi(false);
      this.nativeOpeningUiActive = true;
      this.nativeOpeningUiSignature = signature;
      document.body?.classList.add('legend-phaser-opening-ui-active');

      if (!this.nativeOpeningUiScrollTarget) {
        this.nativeOpeningUiScrollTarget = screen;
        const handler = () => {
          this.nativeOpeningUiLayoutEvent?.remove?.(false);
          this.nativeOpeningUiLayoutEvent = this.time.delayedCall(48, () => {
            this.nativeOpeningUiLayoutEvent = null;
            this.syncNativeOpeningUi(surface);
          });
        };
        screen.__legendOpeningScrollHandler = handler;
        screen.addEventListener('scroll', handler, { passive: true });
      }

      const add = (object, depth = 13) => {
        if (!object) return object;
        object.setDepth?.(depth);
        this.nativeOpeningUiObjects.push(object);
        return object;
      };
      const drawPanel = (node, style = {}) => {
        const rect = rectFor(node);
        if (!rect) return;
        const graphics = this.add.graphics();
        graphics.fillStyle(style.fill ?? 0x0b120d, style.alpha ?? 0.94);
        graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        graphics.lineStyle(style.lineWidth ?? 1, style.stroke ?? 0xd7b66e, style.strokeAlpha ?? 0.62);
        graphics.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        if (style.inset !== false && rect.width > 20 && rect.height > 20) {
          graphics.lineStyle(1, 0xd7b66e, 0.16);
          graphics.strokeRect(rect.x + 7 * sx, rect.y + 7 * sy, rect.width - 14 * sx, rect.height - 14 * sy);
        }
        add(graphics, 12);
      };
      cards.forEach(node => drawPanel(node, { fill: 0x0b120d, alpha: 0.96, stroke: 0xd7b66e, strokeAlpha: 0.82, lineWidth: 1.4 }));
      sceneNotes.forEach(node => drawPanel(node, { fill: 0x282319, alpha: 0.78, stroke: 0xc9a55e, strokeAlpha: 0.74, inset: false }));
      quotes.forEach(node => drawPanel(node, { fill: 0x090f0b, alpha: 0.62, stroke: 0x9b8352, strokeAlpha: 0.54, inset: false }));
      buttons.forEach(node => {
        const choice = node.classList.contains('opening-road-v140-choice');
        const primary = node.classList.contains('opening-road-v140-primary');
        drawPanel(node, {
          fill: primary ? 0x674b20 : choice ? 0x152319 : 0x111a13,
          alpha: 0.98,
          stroke: primary ? 0xe8c878 : 0xc6a666,
          strokeAlpha: primary ? 0.94 : 0.68,
          lineWidth: primary ? 1.4 : 1,
          inset: false
        });
      });

      textNodes.forEach(node => {
        const rect = rectFor(node);
        if (!rect) return;
        const style = window.getComputedStyle(node);
        let text = node.textContent?.replace(/\s+/g, ' ').trim() || '';
        if (style.textTransform === 'uppercase') text = text.toLocaleUpperCase();
        if (!text) return;
        let color = style.color || '#e5e0d1';
        if (node.matches('.opening-road-v140-kicker,.opening-road-v140-scene-note > span,blockquote strong')) color = '#e2c47f';
        else if (node.matches('h1,h2')) color = '#f4e8c6';
        else if (node.matches('.opening-road-v140-choice strong')) color = '#fff0ca';
        else if (node.matches('.opening-road-v140-choice span')) color = '#c4d0c4';
        else if (node.matches('.opening-road-v140-footnote')) color = '#a7b5a8';
        const fontSize = Math.max(9, (parseFloat(style.fontSize) || 14) * sy);
        const lineHeight = parseFloat(style.lineHeight) || (parseFloat(style.fontSize) || 14) * 1.45;
        add(this.add.text(rect.x, rect.y, text, {
          fontFamily: style.fontFamily || 'Georgia, Times New Roman, serif',
          fontSize: fontSize + 'px',
          fontStyle: Number(style.fontWeight) >= 650 || style.fontWeight === 'bold' ? 'bold' : (style.fontStyle || 'normal'),
          color,
          lineSpacing: Math.max(0, (lineHeight - (parseFloat(style.fontSize) || 14)) * sy),
          letterSpacing: Number.isFinite(parseFloat(style.letterSpacing)) ? Math.max(0, parseFloat(style.letterSpacing) * sx) : 0,
          wordWrap: { width: Math.max(36, rect.width), useAdvancedWrap: true },
          padding: { left: 1, right: 2, top: 1, bottom: 2 },
          align: style.textAlign || 'left'
        }).setOrigin(0, 0), 14);
      });

      buttons.forEach((button, index) => {
        const id = button.dataset.oricResponse ? 'oric-' + button.dataset.oricResponse : (button.id || 'opening-action-' + index);
        const label = button.textContent?.replace(/\s+/g, ' ').trim() || id;
        button.setAttribute('aria-label', label);
        const rect = rectFor(button);
        if (!rect) return;
        const container = this.add.container(rect.x, rect.y).setDepth(15);
        const focusFrame = this.add.graphics();
        focusFrame.lineStyle(2, button.classList.contains('opening-road-v140-choice') ? 0xe5c78c : 0xffe7a6, 0.98);
        focusFrame.strokeRect(1, 1, Math.max(1, rect.width - 2), Math.max(1, rect.height - 2));
        focusFrame.setVisible(button === document.activeElement || button.matches(':hover'));
        const objects = [focusFrame];
        if (button.classList.contains('opening-road-v140-choice')) {
          const title = button.querySelector('strong')?.textContent?.trim() || label;
          const description = button.querySelector('span')?.textContent?.trim() || '';
          objects.push(this.add.text(12 * sx, rect.height * 0.30, title, {
            fontFamily: 'Georgia, Times New Roman, serif',
            fontSize: Math.max(10, 15 * sy) + 'px',
            fontStyle: 'bold',
            color: '#fff0ca',
            wordWrap: { width: Math.max(32, rect.width - 24 * sx), useAdvancedWrap: true }
          }).setOrigin(0, 0.5));
          objects.push(this.add.text(12 * sx, rect.height * 0.72, description, {
            fontFamily: 'Arial, sans-serif',
            fontSize: Math.max(9, 12 * sy) + 'px',
            color: '#c4d0c4',
            wordWrap: { width: Math.max(32, rect.width - 24 * sx), useAdvancedWrap: true }
          }).setOrigin(0, 0.5));
        } else {
          objects.push(this.add.text(rect.width / 2, rect.height / 2, label, {
            fontFamily: 'Arial, sans-serif',
            fontSize: Math.max(10, 14 * sy) + 'px',
            fontStyle: 'bold',
            color: button.classList.contains('opening-road-v140-primary') ? '#261c08' : '#f4efdd',
            align: 'center',
            wordWrap: { width: Math.max(36, rect.width - 22 * sx), useAdvancedWrap: true }
          }).setOrigin(0.5));
        }
        container.add(objects);
        add(container, 15);
        const control = { id, x: rect.x, y: rect.y, width: rect.width, height: rect.height, container, focusFrame, button, label };
        this.nativeOpeningUiControls.push(control);
        if (!button.__legendNativeOpeningBound) {
          button.__legendNativeOpeningBound = true;
          button.addEventListener('focus', () => this.setNativeOpeningControlFocus(id, true));
          button.addEventListener('blur', () => this.setNativeOpeningControlFocus(id, button.matches(':hover')));
          button.addEventListener('pointerenter', () => this.setNativeOpeningControlFocus(id, true));
          button.addEventListener('pointerleave', () => this.setNativeOpeningControlFocus(id, document.activeElement === button));
        }
      });
    }

    clearNativeGameplayUi(removeClass = true) {
      this.nativeGameplayUiLayoutEvent?.remove?.(false);
      this.nativeGameplayUiLayoutEvent = null;
      if (this.nativeGameplayUiScrollHandler) {
        document.removeEventListener('scroll', this.nativeGameplayUiScrollHandler, true);
        this.nativeGameplayUiScrollHandler = null;
      }
      this.nativeGameplayUiTaggedNodes.forEach(node => {
        if (!node?.dataset) return;
        delete node.dataset.legendPhaserNativePaint;
        delete node.dataset.legendPhaserNativeText;
        delete node.dataset.legendPhaserNativeControl;
        delete node.dataset.legendPhaserNativeImage;
      });
      this.nativeGameplayUiTaggedNodes = [];
      if (this.nativeGameplayUiObserver) this.nativeGameplayUiObserver.disconnect();
      this.nativeGameplayUiObserver = null;
      this.nativeGameplayUiObserverRoot = null;
      this.nativeGameplayUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeGameplayUiObjects = [];
      this.nativeGameplayUiControls = [];
      this.nativeGameplayUiSignature = '';
      this.nativeGameplayUiTextures.forEach(key => {
        try { this.textures.remove(key); } catch (error) { console.warn('[LEGEND Phaser] Could not release gameplay UI texture.', error); }
      });
      this.nativeGameplayUiTextures = [];
      this.nativeGameplayUiActive = false;
      if (removeClass) document.body?.classList.remove('legend-phaser-gameplay-ui-active');
    }

    nativeGameplayUiStyle(node) {
      const properties = [
        'backgroundColor','backgroundImage','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
        'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopLeftRadius','opacity',
        'color','fontSize','lineHeight','fontFamily','fontWeight','fontStyle','letterSpacing','textAlign','textTransform','objectFit'
      ];
      const computed = window.getComputedStyle(node);
      const original = {};
      properties.forEach(property => { original[property] = computed[property]; });
      try { node.dataset.legendPhaserOriginalStyle = JSON.stringify(original); } catch (error) { /* detached node */ }
      return original;
    }

    nativeGameplayUiColor(value, fallback = 0x0a100b) {
      const source = String(value || '');
      const directStops = Array.from(source.matchAll(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/ig));
      const hexes = Array.from(source.matchAll(/#([\da-f]{3}|[\da-f]{6})\b/ig));
      const direct = directStops.find(match => match[4] === undefined || Number(match[4]) > 0) || directStops[0];
      if (direct) {
        return {
          color: (Math.round(Number(direct[1])) << 16) | (Math.round(Number(direct[2])) << 8) | Math.round(Number(direct[3])),
          alpha: direct[4] === undefined ? 1 : Math.max(0, Math.min(1, Number(direct[4])))
        };
      }
      if (hexes.length) {
        let digits = hexes[0][1];
        if (digits.length === 3) digits = digits.split('').map(char => char + char).join('');
        return { color: parseInt(digits, 16), alpha: 1 };
      }
      // CSS gradients are common throughout the existing shell. Phaser cannot
      // reuse CSS paint directly, so sample their first authored color stop.
      if (/gradient\(/i.test(source)) {
        const stops = Array.from(source.matchAll(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/ig));
        if (stops.length) {
          const stop = stops[0];
          return {
            color: (Math.round(Number(stop[1])) << 16) | (Math.round(Number(stop[2])) << 8) | Math.round(Number(stop[3])),
            alpha: stop[4] === undefined ? 1 : Math.max(0, Math.min(1, Number(stop[4])))
          };
        }
        const gradientHex = source.match(/#([\da-f]{3}|[\da-f]{6})\b/i);
        if (gradientHex) {
          let digits = gradientHex[1];
          if (digits.length === 3) digits = digits.split('').map(char => char + char).join('');
          return { color: parseInt(digits, 16), alpha: 1 };
        }
      }
      return { color: fallback, alpha: 0 };
    }

    nativeGameplayUiVisibleRect(node) {
      if (!node?.getBoundingClientRect) return null;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const style = window.getComputedStyle(node);
      if (style.display === 'none' || (style.visibility === 'hidden' && node?.dataset?.legendPhaserNativeImage !== 'true') || Number(style.opacity) < 0.02) return null;
      if (node.closest('[hidden]')) return null;
      // aria-hidden removes content from the accessibility tree; it does not
      // mean the decorative image/backdrop is invisible to the player.
      const viewport = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
      let clip = { ...viewport };
      let ancestor = node.parentElement;
      while (ancestor && ancestor !== document.body) {
        const ancestorStyle = window.getComputedStyle(ancestor);
        const clipsX = !['visible','unset'].includes(ancestorStyle.overflowX);
        const clipsY = !['visible','unset'].includes(ancestorStyle.overflowY);
        if (clipsX || clipsY) {
          const box = ancestor.getBoundingClientRect();
          if (clipsX) {
            clip.left = Math.max(clip.left, box.left);
            clip.right = Math.min(clip.right, box.right);
          }
          if (clipsY) {
            clip.top = Math.max(clip.top, box.top);
            clip.bottom = Math.min(clip.bottom, box.bottom);
          }
        }
        ancestor = ancestor.parentElement;
      }
      const left = Math.max(rect.left, clip.left);
      const top = Math.max(rect.top, clip.top);
      const right = Math.min(rect.right, clip.right);
      const bottom = Math.min(rect.bottom, clip.bottom);
      // Ignore partially clipped elements instead of drawing text or hit frames
      // outside their actual scroll viewport.
      if (right - left < rect.width - 1 || bottom - top < rect.height - 1) return null;
      if (right <= 0 || bottom <= 0 || left >= window.innerWidth || top >= window.innerHeight) return null;
      return rect;
    }

    createNativeGameplayImageTexture(img) {
      if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return '';
      const rect = this.nativeGameplayUiVisibleRect(img);
      if (!rect) return '';
      const ratio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      const context = canvas.getContext('2d');
      if (!context) return '';
      const fit = window.getComputedStyle(img).objectFit;
      context.save();
      context.beginPath();
      context.rect(0, 0, canvas.width, canvas.height);
      context.clip();
      if (fit === 'cover') {
        const sourceWidth = img.naturalWidth;
        const sourceHeight = img.naturalHeight;
        const destinationRatio = rect.width / rect.height;
        const sourceRatio = sourceWidth / sourceHeight;
        let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
        if (sourceRatio > destinationRatio) {
          sw = sourceHeight * destinationRatio;
          sx = (sourceWidth - sw) / 2;
        } else {
          sh = sourceWidth / destinationRatio;
          sy = (sourceHeight - sh) / 2;
        }
        context.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } else {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      context.restore();
      const key = 'nativeGameplayImage' + (++this.nativeGameplayUiTextureCounter);
      try {
        this.textures.addCanvas(key, canvas);
        this.nativeGameplayUiTextures.push(key);
        return key;
      } catch (error) {
        console.warn('[LEGEND Phaser] Gameplay artwork could not be mirrored.', error);
        return '';
      }
    }

    observeNativeGameplayUi(shell, rootNode, modalRoot, progressionRoot) {
      const targets = [document.body, shell, rootNode, modalRoot, progressionRoot].filter(Boolean);
      const signature = targets.map(node => node === document.body ? 'body' : node.id || node.tagName).join('|');
      if (this.nativeGameplayUiObserver && this.nativeGameplayUiObserverRoot === signature) return;
      this.nativeGameplayUiObserver?.disconnect?.();
      this.nativeGameplayUiObserverRoot = signature;
      this.nativeGameplayUiScrollHandler = () => {
        this.nativeGameplayUiLayoutEvent?.remove?.(false);
        this.nativeGameplayUiLayoutEvent = this.time.delayedCall(45, () => {
          this.nativeGameplayUiLayoutEvent = null;
          this.syncNativeGameplayUi(this.surface);
        });
      };
      document.addEventListener('scroll', this.nativeGameplayUiScrollHandler, true);
      this.nativeGameplayUiObserver = new MutationObserver(mutations => {
        const relevant = mutations.some(mutation => {
          // Ignore only our own add/remove of the paint-mode body class. A real
          // drawer/body class change or an update inside an already-tagged card
          // must still refresh the Phaser copy.
          if (mutation.target === document.body && mutation.type === 'attributes' &&
              mutation.attributeName === 'class' && mutation.oldValue !== null) {
            const before = new Set(String(mutation.oldValue || '').split(/\s+/).filter(Boolean));
            const after = new Set(Array.from(document.body.classList));
            const changed = new Set([...before, ...after].filter(token => before.has(token) !== after.has(token)));
            if (changed.size === 1 && changed.has('legend-phaser-gameplay-ui-active')) return false;
          }
          return !(mutation.type === 'attributes' && String(mutation.attributeName || '').startsWith('data-legend-phaser-native-'));
        });
        if (!relevant) return;
        this.nativeGameplayUiLayoutEvent?.remove?.(false);
        this.nativeGameplayUiLayoutEvent = this.time.delayedCall(48, () => {
          this.nativeGameplayUiLayoutEvent = null;
          this.syncNativeGameplayUi(this.surface);
        });
      });
      targets.forEach(node => this.nativeGameplayUiObserver.observe(node, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ['class','style','hidden','disabled','inert','aria-hidden','aria-label','aria-expanded','aria-pressed','aria-selected']
      }));
    }


    clearNativeHudUi(removeClass = true) {
      this.nativeHudUiLayoutEvent?.remove?.(false);
      this.nativeHudUiLayoutEvent = null;
      this.nativeHudUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeHudUiObjects = [];
      this.nativeHudUiTaggedNodes.forEach(node => {
        if (node?.dataset) {
          delete node.dataset.legendPhaserHudText;
          delete node.dataset.legendPhaserHudControl;
        }
      });
      this.nativeHudUiTaggedNodes = [];
      this.nativeHudUiTextNodes = [];
      this.nativeHudUiControls = [];
      this.nativeHudUiSignature = '';
      this.nativeHudUiActive = false;
      if (removeClass) document.body?.classList.remove('legend-phaser-hud-ui-active');
    }


    clearNativeBottomBarUi(removeClass = true) {
      this.nativeBottomBarUiLayoutEvent?.remove?.(false);
      this.nativeBottomBarUiLayoutEvent = null;
      if (removeClass && this.nativeBottomBarUiBoundElement && this.nativeBottomBarUiInteractionHandler) {
        ['focusin', 'focusout', 'pointerover', 'pointerout', 'scroll'].forEach(type =>
          this.nativeBottomBarUiBoundElement.removeEventListener(type, this.nativeBottomBarUiInteractionHandler)
        );
        this.nativeBottomBarUiBoundElement = null;
        this.nativeBottomBarUiInteractionHandler = null;
      }
      // Phaser 4.1 WebGL masks are Filters, while Canvas uses a GeometryMask.
      // Remove the filter through its owning list before destroying the container.
      if (this.nativeBottomBarUiContainer && this.nativeBottomBarUiMaskFilter) {
        this.nativeBottomBarUiContainer.filters?.internal?.remove?.(this.nativeBottomBarUiMaskFilter, true);
      }
      this.nativeBottomBarUiMaskFilter = null;
      if (this.nativeBottomBarUiContainer && this.nativeBottomBarUiMask) {
        this.nativeBottomBarUiContainer.clearMask?.(true);
      }
      this.nativeBottomBarUiMask = null;
      this.nativeBottomBarUiMaskBounds = null;
      this.nativeBottomBarUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeBottomBarUiObjects = [];
      this.nativeBottomBarUiContainer = null;
      this.nativeBottomBarUiMaskGraphics = null;
      this.nativeBottomBarUiTaggedNodes.forEach(node => {
        if (!node?.dataset) return;
        delete node.dataset.legendPhaserBottomText;
        delete node.dataset.legendPhaserBottomIcon;
        delete node.dataset.legendPhaserBottomControl;
      });
      this.nativeBottomBarUiTaggedNodes = [];
      this.nativeBottomBarUiTextNodes = [];
      this.nativeBottomBarUiIconNodes = [];
      this.nativeBottomBarUiControls = [];
      this.nativeBottomBarUiSignature = '';
      this.nativeBottomBarUiActive = false;
      if (removeClass) document.body?.classList.remove('legend-phaser-bottom-bar-ui-active');
    }

    syncNativeBottomBarUi() {
      const shell = document.getElementById('legend-world-shell-root');
      const bar = shell?.querySelector('.lws-bottom-bar');
      if (!bar || shell.hidden) {
        if (this.nativeBottomBarUiActive || document.body?.classList.contains('legend-phaser-bottom-bar-ui-active')) {
          this.clearNativeBottomBarUi();
        }
        return;
      }

      if (this.nativeBottomBarUiBoundElement !== bar) {
        this.clearNativeBottomBarUi();
        this.nativeBottomBarUiBoundElement = bar;
        this.nativeBottomBarUiInteractionHandler = () => {
          this.nativeBottomBarUiLayoutEvent?.remove?.(false);
          this.nativeBottomBarUiLayoutEvent = this.time.delayedCall(24, () => {
            this.nativeBottomBarUiLayoutEvent = null;
            this.syncNativeBottomBarUi();
          });
        };
        ['focusin', 'focusout', 'pointerover', 'pointerout', 'scroll'].forEach(type =>
          bar.addEventListener(type, this.nativeBottomBarUiInteractionHandler, { passive: type === 'scroll' })
        );
      }

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const readRect = node => {
        if (!node || !node.isConnected) return null;
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden') return null;
        return {
          x: rect.left * sx, y: rect.top * sy,
          width: rect.width * sx, height: rect.height * sy
        };
      };
      const barRect = readRect(bar);
      if (!barRect) {
        this.clearNativeBottomBarUi();
        return;
      }

      const controls = Array.from(bar.querySelectorAll('button[data-world-action]')).filter(node => readRect(node));
      const content = node => node.textContent?.replace(/\s+/g, ' ').trim() || '';
      const textNodes = controls.map(node => node.querySelector('.lws-btn-copy strong')).filter(node =>
        Boolean(node && content(node) && readRect(node))
      );
      const icons = controls.map(node => ({
        button: node,
        node: node.querySelector('.lws-btn-icon'),
        rect: readRect(node.querySelector('.lws-btn-icon'))
      })).filter(item => item.node && item.rect);
      const signature = JSON.stringify([
        Math.round(barRect.x), Math.round(barRect.y), Math.round(barRect.width), Math.round(barRect.height),
        Math.round(window.innerWidth), Math.round(window.innerHeight), Number(bar.scrollLeft || 0),
        ...controls.map(node => {
          const rect = readRect(node);
          return [
            node.dataset.worldAction || '', content(node), Math.round(rect.x), Math.round(rect.y),
            Math.round(rect.width), Math.round(rect.height), Boolean(node.disabled),
            node === document.activeElement || node.matches(':focus-visible'), node.matches(':hover')
          ];
        })
      ]);
      // The shell rebuilds bottom.innerHTML on every refresh. Check the actual
      // nodes and tags as well as their visual signature before reusing a paint.
      const tagsCurrent =
        controls.length === this.nativeBottomBarUiControls.length &&
        controls.every((node, index) =>
          node === this.nativeBottomBarUiControls[index] &&
          node.dataset.legendPhaserBottomControl === 'true'
        ) &&
        textNodes.length === this.nativeBottomBarUiTextNodes.length &&
        textNodes.every((node, index) =>
          node === this.nativeBottomBarUiTextNodes[index] &&
          node.dataset.legendPhaserBottomText === 'true'
        ) &&
        icons.length === this.nativeBottomBarUiIconNodes.length &&
        icons.every((item, index) =>
          item.node === this.nativeBottomBarUiIconNodes[index] &&
          item.node.dataset.legendPhaserBottomIcon === 'true'
        );
      if (this.nativeBottomBarUiActive && tagsCurrent && signature === this.nativeBottomBarUiSignature) return;

      this.clearNativeBottomBarUi(false);
      // Keep the semantic DOM visible until the native painter and its clip
      // are both ready. GeometryMask is Canvas-only in Phaser 4.1; WebGL uses
      // the internal Mask filter on this container.
      document.body?.classList.remove('legend-phaser-bottom-bar-ui-active');
      const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      maskGraphics.fillStyle(0xffffff, 1);
      maskGraphics.fillRect(barRect.x, barRect.y, barRect.width, barRect.height);
      const container = this.add.container(0, 0).setDepth(46);
      const rendererType = this.sys.game.renderer?.type;
      let mask = null;
      let maskFilter = null;
      if (rendererType === Phaser.WEBGL) {
        try {
          container.enableFilters?.();
          container.setFiltersFocusContext?.(true);
          maskFilter = container.filters?.internal?.addMask?.(
            maskGraphics,
            false,
            this.cameras.main,
            'world'
          ) || null;
        } catch (error) {
          console.warn('[LEGEND Phaser] Bottom-bar WebGL mask could not be created; keeping the accessible DOM bar visible.', error);
          maskFilter = null;
        }
        if (!maskFilter) {
          container.destroy(true);
          maskGraphics.destroy(true);
          this.nativeBottomBarUiActive = false;
          this.nativeBottomBarUiObjects = [];
          this.nativeBottomBarUiContainer = null;
          this.nativeBottomBarUiMaskGraphics = null;
          this.nativeBottomBarUiMaskBounds = null;
          this.nativeBottomBarUiSignature = '';
          return;
        }
        this.nativeBottomBarUiMaskFilter = maskFilter;
      } else {
        mask = maskGraphics.createGeometryMask();
        container.setMask(mask);
        this.nativeBottomBarUiMask = mask;
      }
      this.nativeBottomBarUiMaskBounds = {
        x: barRect.x,
        y: barRect.y,
        width: barRect.width,
        height: barRect.height
      };
      this.nativeBottomBarUiMaskGraphics = maskGraphics;
      this.nativeBottomBarUiContainer = container;
      this.nativeBottomBarUiObjects.push(container, maskGraphics);
      const add = object => {
        if (object) {
          container.add(object);
          this.nativeBottomBarUiObjects.push(object);
        }
        return object;
      };
      const graphics = add(this.add.graphics());
      graphics.fillStyle(0x07100a, 0.96);
      graphics.fillRect(barRect.x, barRect.y, barRect.width, barRect.height);
      graphics.fillStyle(0x1d281c, 0.24);
      graphics.fillRect(barRect.x, barRect.y, barRect.width, Math.max(1, barRect.height * 0.44));
      graphics.lineStyle(Math.max(1, sy), 0xbfa064, 0.68);
      graphics.strokeRect(barRect.x + 0.5, barRect.y + 0.5, Math.max(1, barRect.width - 1), Math.max(1, barRect.height - 1));
      graphics.lineStyle(Math.max(1, sy), 0xe7c982, 0.24);
      graphics.lineBetween(barRect.x + 8 * sx, barRect.y + 2 * sy, barRect.x + barRect.width - 8 * sx, barRect.y + 2 * sy);

      const textureByAction = Object.freeze({
        world: 'menuInn',
        inventory: 'menuTraveler',
        journal: 'menuJournal',
        map: 'menuCompass',
        combat: 'menuMilestone',
        settings: 'menuSettings'
      });

      controls.forEach(button => {
        const rect = readRect(button);
        if (!rect) return;
        const action = String(button.dataset.worldAction || '');
        const primary = button.classList.contains('primary');
        const disabled = Boolean(button.disabled || button.getAttribute('aria-disabled') === 'true');
        const focused = button === document.activeElement || button.matches(':focus-visible');
        const hovered = button.matches(':hover');
        const fill = primary ? 0x49391e : hovered || focused ? 0x38432b : 0x142016;
        const line = focused ? 0xffe6a0 : hovered ? 0xe7c982 : 0xa98d55;
        graphics.fillStyle(fill, disabled ? 0.30 : primary ? 0.98 : 0.92);
        graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        graphics.lineStyle(focused ? Math.max(2, 2 * Math.min(sx, sy)) : Math.max(1, sx), line, disabled ? 0.26 : focused ? 0.98 : 0.68);
        graphics.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        graphics.fillStyle(primary ? 0xffd98b : 0xbfa064, primary ? 0.92 : 0.58);
        graphics.fillRect(rect.x, rect.y, Math.max(2 * sx, 2), rect.height);

        const iconNode = button.querySelector('.lws-btn-icon');
        const iconRect = readRect(iconNode);
        const textureKey = textureByAction[action];
        if (iconRect) {
          graphics.fillStyle(0x0a120b, 0.9);
          graphics.fillRect(iconRect.x, iconRect.y, iconRect.width, iconRect.height);
          graphics.lineStyle(Math.max(1, sx), 0xbfa064, 0.38);
          graphics.strokeRect(iconRect.x + 0.5, iconRect.y + 0.5, Math.max(1, iconRect.width - 1), Math.max(1, iconRect.height - 1));
          if (textureKey && this.textures.exists(textureKey)) {
            const image = add(this.add.image(
              iconRect.x + iconRect.width / 2,
              iconRect.y + iconRect.height / 2,
              textureKey
            ).setDisplaySize(
              Math.max(10, Math.min(iconRect.width - 3 * sx, 28 * sx)),
              Math.max(10, Math.min(iconRect.height - 3 * sy, 28 * sy))
            ));
            image.setAlpha(disabled ? 0.36 : 0.96);
            iconNode.dataset.legendPhaserBottomIcon = 'true';
            this.nativeBottomBarUiTaggedNodes.push(iconNode);
          }
        }

        const label = button.querySelector('.lws-btn-copy strong');
        const labelRect = readRect(label);
        if (labelRect) {
          const style = window.getComputedStyle(label);
          const fontSize = Math.max(9, Math.round((parseFloat(style.fontSize) || 11) * sy));
          const text = add(this.add.text(labelRect.x, labelRect.y, content(label), {
            fontFamily: style.fontFamily || 'Arial, sans-serif',
            fontSize: fontSize + 'px',
            fontStyle: Number.parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
            color: disabled ? '#9b9a8a' : '#f0ead9',
            align: 'center'
          }).setOrigin(0, 0));
          text.setResolution?.(2);
          text.setFixedSize?.(Math.max(10, labelRect.width), Math.max(10, labelRect.height));
          text.setAlign?.('center');
          label.dataset.legendPhaserBottomText = 'true';
          this.nativeBottomBarUiTaggedNodes.push(label);
        }
        button.dataset.legendPhaserBottomControl = 'true';
        this.nativeBottomBarUiTaggedNodes.push(button);
      });

      this.nativeBottomBarUiTextNodes = textNodes;
      this.nativeBottomBarUiIconNodes = icons.map(item => item.node);
      this.nativeBottomBarUiControls = controls;
      this.nativeBottomBarUiSignature = signature;
      this.nativeBottomBarUiActive = true;
      document.body?.classList.add('legend-phaser-bottom-bar-ui-active');
    }


    clearNativeLeftDrawerUi(removeClass = true, removeListeners = true) {
      this.nativeLeftDrawerUiLayoutEvent?.remove?.(false);
      this.nativeLeftDrawerUiLayoutEvent = null;
      if (removeListeners) {
        if (this.nativeLeftDrawerUiBoundScroll && this.nativeLeftDrawerUiInteractionHandler) {
          ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout'].forEach(type =>
            this.nativeLeftDrawerUiBoundScroll.removeEventListener(type, this.nativeLeftDrawerUiInteractionHandler)
          );
        }
        if (this.nativeLeftDrawerUiBoundPanel && this.nativeLeftDrawerUiTransitionHandler) {
          this.nativeLeftDrawerUiBoundPanel.removeEventListener('transitionend', this.nativeLeftDrawerUiTransitionHandler);
        }
        this.nativeLeftDrawerUiBoundPanel = null;
        this.nativeLeftDrawerUiBoundScroll = null;
        this.nativeLeftDrawerUiInteractionHandler = null;
        this.nativeLeftDrawerUiTransitionHandler = null;
      }
      if (this.nativeLeftDrawerUiContainer && this.nativeLeftDrawerUiMaskFilter) {
        this.nativeLeftDrawerUiContainer.filters?.internal?.remove?.(this.nativeLeftDrawerUiMaskFilter, true);
      }
      this.nativeLeftDrawerUiMaskFilter = null;
      if (this.nativeLeftDrawerUiContainer && this.nativeLeftDrawerUiMask) {
        this.nativeLeftDrawerUiContainer.clearMask?.(true);
      }
      this.nativeLeftDrawerUiMask = null;
      this.nativeLeftDrawerUiMaskBounds = null;
      this.nativeLeftDrawerUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeLeftDrawerUiObjects = [];
      this.nativeLeftDrawerUiContainer = null;
      this.nativeLeftDrawerUiMaskGraphics = null;
      this.nativeLeftDrawerUiTaggedNodes.forEach(node => {
        if (!node?.dataset) return;
        delete node.dataset.legendPhaserLeftText;
        delete node.dataset.legendPhaserLeftControl;
        delete node.dataset.legendPhaserLeftIcon;
      });
      this.nativeLeftDrawerUiTaggedNodes = [];
      this.nativeLeftDrawerUiTextNodes = [];
      this.nativeLeftDrawerUiControls = [];
      this.nativeLeftDrawerUiIconNodes = [];
      this.nativeLeftDrawerUiSignature = '';
      this.nativeLeftDrawerUiActive = false;
      if (removeClass) document.body?.classList.remove('legend-phaser-left-drawer-ui-active');
    }


    clearNativeRightDrawerUi(removeClass = true, removeListeners = true) {
      this.nativeRightDrawerUiLayoutEvent?.remove?.(false);
      this.nativeRightDrawerUiLayoutEvent = null;
      if (removeListeners) {
        if (this.nativeRightDrawerUiBoundScroll && this.nativeRightDrawerUiInteractionHandler) {
          ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout'].forEach(type =>
            this.nativeRightDrawerUiBoundScroll.removeEventListener(type, this.nativeRightDrawerUiInteractionHandler)
          );
        }
        if (this.nativeRightDrawerUiBoundPanel && this.nativeRightDrawerUiTransitionHandler) {
          this.nativeRightDrawerUiBoundPanel.removeEventListener('transitionend', this.nativeRightDrawerUiTransitionHandler);
        }
        this.nativeRightDrawerUiBoundPanel = null;
        this.nativeRightDrawerUiBoundScroll = null;
        this.nativeRightDrawerUiInteractionHandler = null;
        this.nativeRightDrawerUiTransitionHandler = null;
      }
      if (this.nativeRightDrawerUiContainer && this.nativeRightDrawerUiMaskFilter) {
        this.nativeRightDrawerUiContainer.filters?.internal?.remove?.(this.nativeRightDrawerUiMaskFilter, true);
      }
      this.nativeRightDrawerUiMaskFilter = null;
      if (this.nativeRightDrawerUiContainer && this.nativeRightDrawerUiMask) {
        this.nativeRightDrawerUiContainer.clearMask?.(true);
      }
      this.nativeRightDrawerUiMask = null;
      this.nativeRightDrawerUiMaskBounds = null;
      this.nativeRightDrawerUiObjects.forEach(object => {
        if (!object?.active) return;
        this.tweens.killTweensOf(object);
        object.destroy(true);
      });
      this.nativeRightDrawerUiObjects = [];
      this.nativeRightDrawerUiContainer = null;
      this.nativeRightDrawerUiMaskGraphics = null;
      this.nativeRightDrawerUiTaggedNodes.forEach(node => {
        if (!node?.dataset) return;
        delete node.dataset.legendPhaserRightText;
        delete node.dataset.legendPhaserRightControl;
        delete node.dataset.legendPhaserRightIcon;
      });
      this.nativeRightDrawerUiTaggedNodes = [];
      this.nativeRightDrawerUiTextNodes = [];
      this.nativeRightDrawerUiControls = [];
      this.nativeRightDrawerUiIconNodes = [];
      this.nativeRightDrawerUiSignature = '';
      this.nativeRightDrawerUiActive = false;
      if (removeClass) document.body?.classList.remove('legend-phaser-right-drawer-ui-active');
    }

    syncNativeRightDrawerUi() {
      const shell = document.getElementById('legend-world-shell-root');
      const panel = shell?.querySelector('#lws-panel-right');
      const scroll = panel?.querySelector('.lws-panel-scroll');
      const mobile = window.matchMedia?.('(max-width: 1199px)').matches || false;
      const hidden = !panel || !scroll || !shell || shell.hidden || panel.hidden ||
        (mobile && (panel.inert || panel.getAttribute('aria-hidden') === 'true'));
      if (hidden) {
        if (this.nativeRightDrawerUiActive || document.body?.classList.contains('legend-phaser-right-drawer-ui-active')) {
          this.clearNativeRightDrawerUi();
        }
        return;
      }

      if (this.nativeRightDrawerUiBoundPanel !== panel || this.nativeRightDrawerUiBoundScroll !== scroll) {
        this.clearNativeRightDrawerUi();
        this.nativeRightDrawerUiBoundPanel = panel;
        this.nativeRightDrawerUiBoundScroll = scroll;
        this.nativeRightDrawerUiInteractionHandler = () => {
          this.nativeRightDrawerUiLayoutEvent?.remove?.(false);
          this.nativeRightDrawerUiLayoutEvent = this.time.delayedCall(28, () => {
            this.nativeRightDrawerUiLayoutEvent = null;
            this.syncNativeRightDrawerUi();
          });
        };
        this.nativeRightDrawerUiTransitionHandler = event => {
          if (event.target !== panel || (event.propertyName && event.propertyName !== 'transform')) return;
          this.nativeRightDrawerUiInteractionHandler?.();
        };
        ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout'].forEach(type =>
          scroll.addEventListener(type, this.nativeRightDrawerUiInteractionHandler, { passive: type === 'scroll' })
        );
        panel.addEventListener('transitionend', this.nativeRightDrawerUiTransitionHandler);
      }

      // Let mobile drawer motion finish before sampling its final geometry.
      if (this.hasFiniteEntranceAnimation(panel)) {
        this.clearNativeRightDrawerUi(true, false);
        this.nativeRightDrawerUiLayoutEvent?.remove?.(false);
        this.nativeRightDrawerUiLayoutEvent = this.time.delayedCall(230, () => {
          this.nativeRightDrawerUiLayoutEvent = null;
          this.syncNativeRightDrawerUi();
        });
        return;
      }

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const readRect = node => {
        if (!node || !node.isConnected) return null;
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden') return null;
        return {
          x: rect.left * sx,
          y: rect.top * sy,
          width: rect.width * sx,
          height: rect.height * sy
        };
      };
      const panelRect = readRect(panel);
      const scrollRect = readRect(scroll);
      if (!panelRect || !scrollRect) {
        this.clearNativeRightDrawerUi();
        return;
      }
      const content = node => node.textContent?.replace(/\s+/g, ' ').trim() || '';
      const headerNodes = Array.from(panel.querySelectorAll(
        '.lws-panel-eyebrow,.lws-panel-header h2,.lws-panel-header p'
      )).filter(node => Boolean(content(node)) && readRect(node));
      const selectors = [
        '.lws-action-list .lws-btn-copy > strong',
        '.lws-action-list .lws-btn-copy > small',
        '.lws-context-copy',
        '.lws-quest-item > strong',
        '.lws-quest-item > p',
        '.lws-place-option-copy > strong',
        '.lws-place-option-copy > small',
        '.lws-place-option-state',
        '.lws-selected-place > .lws-panel-eyebrow',
        '.lws-selected-place h3',
        '.lws-selected-place p',
        '.lws-poi-hint > strong',
        '.lws-poi-hint > p',
        '.lws-other-destinations .lws-section-title > span'
      ].join(',');
      const scrollTextNodes = Array.from(new Set(scroll.querySelectorAll(selectors))).filter(node =>
        Boolean(content(node)) && readRect(node)
      );
      const textNodes = [...headerNodes, ...scrollTextNodes];
      const controls = Array.from(scroll.querySelectorAll(
        'button[data-world-action],button[data-world-route],button[data-world-place]'
      )).filter(node => readRect(node));
      const iconNodes = Array.from(scroll.querySelectorAll('.lws-btn-icon,.lws-place-option-icon')).filter(node => readRect(node));
      const surfaces = Array.from(new Set(scroll.querySelectorAll(
        '.lws-action-list .lws-btn,.lws-place-option,.lws-selected-place,.lws-poi-hint,.lws-other-destinations,.lws-quest-item,.lws-status'
      ))).map(node => ({ node, rect: readRect(node) })).filter(item => item.rect);
      const signature = JSON.stringify([
        Math.round(panelRect.x), Math.round(panelRect.y), Math.round(panelRect.width), Math.round(panelRect.height),
        Math.round(scrollRect.x), Math.round(scrollRect.y), Math.round(scrollRect.width), Math.round(scrollRect.height),
        Math.round(window.innerWidth), Math.round(window.innerHeight), Number(scroll.scrollTop || 0),
        ...textNodes.map(node => {
          const rect = readRect(node);
          return [content(node), Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)];
        }),
        ...controls.map(node => {
          const rect = readRect(node);
          return [
            node.dataset.worldAction || node.dataset.worldRoute || node.dataset.worldPlace || '',
            content(node), Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height),
            Boolean(node.disabled), node.getAttribute('aria-pressed') || '',
            node === document.activeElement || node.matches(':focus-visible'), node.matches(':hover')
          ];
        })
      ]);
      const tagsCurrent =
        controls.length === this.nativeRightDrawerUiControls.length &&
        controls.every((node, index) => node === this.nativeRightDrawerUiControls[index] &&
          node.dataset.legendPhaserRightControl === 'true') &&
        textNodes.length === this.nativeRightDrawerUiTextNodes.length &&
        textNodes.every((node, index) => node === this.nativeRightDrawerUiTextNodes[index] &&
          node.dataset.legendPhaserRightText === 'true') &&
        iconNodes.length === this.nativeRightDrawerUiIconNodes.length &&
        iconNodes.every((node, index) => node === this.nativeRightDrawerUiIconNodes[index] &&
          Boolean(node.dataset.legendPhaserRightIcon));
      if (this.nativeRightDrawerUiActive && tagsCurrent && signature === this.nativeRightDrawerUiSignature) return;

      this.clearNativeRightDrawerUi(false, false);
      document.body?.classList.remove('legend-phaser-right-drawer-ui-active');

      const panelGraphics = this.add.graphics().setDepth(37);
      panelGraphics.fillStyle(0x10180f, 0.96);
      panelGraphics.fillRect(panelRect.x, panelRect.y, panelRect.width, panelRect.height);
      panelGraphics.fillStyle(0x1d281b, 0.20);
      panelGraphics.fillRect(panelRect.x, panelRect.y, panelRect.width, panelRect.height * 0.42);
      panelGraphics.lineStyle(Math.max(1, sx), 0xbfa064, 0.68);
      panelGraphics.strokeRect(panelRect.x + 0.5, panelRect.y + 0.5,
        Math.max(1, panelRect.width - 1), Math.max(1, panelRect.height - 1));
      const headerRect = readRect(panel.querySelector('.lws-panel-header'));
      if (headerRect) {
        panelGraphics.lineStyle(Math.max(1, sy), 0xbfa064, 0.42);
        panelGraphics.lineBetween(headerRect.x, headerRect.y + headerRect.height - sy,
          headerRect.x + headerRect.width, headerRect.y + headerRect.height - sy);
      }
      panelGraphics.fillStyle(0xe4c17d, 0.58);
      panelGraphics.fillRect(panelRect.x + panelRect.width - Math.max(2 * sx, 2), panelRect.y,
        Math.max(2 * sx, 2), Math.max(2 * sy, 2));
      this.nativeRightDrawerUiObjects.push(panelGraphics);

      const drawHeader = node => {
        const rect = readRect(node);
        if (!rect) return;
        const style = window.getComputedStyle(node);
        const text = this.add.text(rect.x, rect.y, content(node), {
          fontFamily: style.fontFamily || 'Arial, sans-serif',
          fontSize: Math.max(9, Math.round((parseFloat(style.fontSize) || 11) * sy)) + 'px',
          fontStyle: Number.parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
          color: node.matches('.lws-panel-eyebrow') ? '#c9a96e'
            : node.matches('.lws-panel-header h2') ? '#efe7d4'
            : '#b1b8aa',
          letterSpacing: (Number.parseFloat(style.letterSpacing) || 0) * sx,
          align: style.textAlign || 'left'
        }).setDepth(39).setOrigin(0, 0);
        text.setResolution?.(2);
        text.setFixedSize?.(Math.max(12, rect.width), Math.max(10, rect.height));
        this.nativeRightDrawerUiObjects.push(text);
        node.dataset.legendPhaserRightText = 'true';
        this.nativeRightDrawerUiTaggedNodes.push(node);
      };
      headerNodes.forEach(drawHeader);

      const contentContainer = this.add.container(0, 0).setDepth(38);
      const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      maskGraphics.fillStyle(0xffffff, 1);
      maskGraphics.fillRect(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
      const rendererType = this.sys.game.renderer?.type;
      let mask = null;
      let maskFilter = null;
      if (rendererType === Phaser.WEBGL) {
        try {
          contentContainer.enableFilters?.();
          contentContainer.setFiltersFocusContext?.(true);
          maskFilter = contentContainer.filters?.internal?.addMask?.(
            maskGraphics, false, this.cameras.main, 'world'
          ) || null;
        } catch (error) {
          console.warn('[LEGEND Phaser] Right drawer WebGL mask could not be created; keeping the accessible DOM drawer visible.', error);
        }
        if (!maskFilter) {
          panelGraphics.destroy();
          this.nativeRightDrawerUiObjects = [];
          contentContainer.destroy(true);
          maskGraphics.destroy(true);
          return;
        }
        this.nativeRightDrawerUiMaskFilter = maskFilter;
      } else {
        mask = maskGraphics.createGeometryMask();
        contentContainer.setMask(mask);
        this.nativeRightDrawerUiMask = mask;
      }
      this.nativeRightDrawerUiContainer = contentContainer;
      this.nativeRightDrawerUiMaskGraphics = maskGraphics;
      this.nativeRightDrawerUiMaskBounds = {
        x: scrollRect.x, y: scrollRect.y, width: scrollRect.width, height: scrollRect.height
      };
      this.nativeRightDrawerUiObjects.push(contentContainer, maskGraphics);
      const addContent = object => {
        if (!object) return object;
        contentContainer.add(object);
        return object;
      };
      const graphics = addContent(this.add.graphics());
      surfaces.forEach(({ node, rect }) => {
        const pressed = node.getAttribute('aria-pressed') === 'true' || node.classList.contains('is-selected');
        if (node.classList.contains('lws-selected-place')) {
          graphics.fillStyle(0xbfa064, 0.12);
          graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
          graphics.lineStyle(Math.max(1, sx), 0xbfa064, 0.48);
          graphics.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        } else if (node.classList.contains('lws-poi-hint') || node.classList.contains('lws-other-destinations') || node.classList.contains('lws-status')) {
          graphics.fillStyle(0xbfa064, 0.075);
          graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
          graphics.lineStyle(Math.max(1, sy), 0xbfa064, 0.28);
          graphics.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        } else if (node.classList.contains('lws-quest-item')) {
          graphics.fillStyle(0xbfa064, 0.09);
          graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
          graphics.fillStyle(0xd4b174, 0.82);
          graphics.fillRect(rect.x, rect.y, Math.max(2 * sx, 2), rect.height);
        } else {
          const isPlace = node.classList.contains('lws-place-option');
          const focused = node === document.activeElement || node.matches(':focus-visible');
          const hovered = node.matches(':hover');
          const disabled = node.disabled || node.getAttribute('aria-disabled') === 'true';
          graphics.fillStyle(pressed ? 0x3a3622 : (focused || hovered) ? 0x35402a : isPlace ? 0x172116 : 0x172116,
            disabled ? 0.3 : pressed ? 0.98 : 0.93);
          graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
          graphics.lineStyle(focused ? 2 * Math.min(sx, sy) : Math.max(1, sx),
            focused ? 0xffe6a0 : pressed || hovered ? 0xe7c982 : 0xbfa064, disabled ? 0.28 : 0.60);
          graphics.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
          graphics.fillStyle(0xe7c982, pressed ? 0.92 : 0.56);
          graphics.fillRect(rect.x, rect.y, Math.max(2 * sx, 2), rect.height);
        }
      });

      const textureByIcon = Object.freeze({
        compass: 'menuCompass', journal: 'menuJournal', traveler: 'menuTraveler',
        inn: 'menuInn', market: 'serviceMarketIcon', forge: 'serviceForgeIcon',
        road: 'menuRoad', settings: 'menuSettings', milestone: 'menuMilestone'
      });
      const iconName = node => {
        const match = String(node?.className?.baseVal || node?.className || '').match(/runway-icon-([a-z-]+)/);
        return match?.[1] || '';
      };
      iconNodes.forEach(node => {
        const rect = readRect(node);
        const key = textureByIcon[iconName(node)] || '';
        if (rect && key && this.textures.exists(key)) {
          const image = addContent(this.add.image(
            rect.x + rect.width / 2, rect.y + rect.height / 2, key
          ).setDisplaySize(
            Math.max(10, Math.min(rect.width - 2 * sx, 28 * sx)),
            Math.max(10, Math.min(rect.height - 2 * sy, 28 * sy))
          ).setAlpha(0.96).setDepth(43));
          node.dataset.legendPhaserRightIcon = 'true';
          void image;
        } else {
          node.dataset.legendPhaserRightIcon = 'dom';
        }
        this.nativeRightDrawerUiTaggedNodes.push(node);
      });
      controls.forEach(node => {
        node.dataset.legendPhaserRightControl = 'true';
        this.nativeRightDrawerUiTaggedNodes.push(node);
      });

      scrollTextNodes.forEach(node => {
        const rect = readRect(node);
        if (!rect) return;
        const style = window.getComputedStyle(node);
        const color = node.matches('.lws-panel-eyebrow,.lws-place-option-state') ? '#c9a96e'
          : node.matches('.lws-place-option-copy > strong,.lws-selected-place h3,.lws-quest-item > strong,.lws-poi-hint > strong') ? '#eee7d6'
          : node.matches('.lws-context-copy,.lws-quest-item > p,.lws-place-option-copy > small,.lws-selected-place p,.lws-poi-hint > p,.lws-btn-copy > small') ? '#b1b8aa'
          : '#f0ead9';
        const text = addContent(this.add.text(rect.x, rect.y, content(node), {
          fontFamily: style.fontFamily || 'Arial, sans-serif',
          fontSize: Math.max(8, Math.round((parseFloat(style.fontSize) || 10) * sy)) + 'px',
          fontStyle: Number.parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
          color,
          letterSpacing: (Number.parseFloat(style.letterSpacing) || 0) * sx,
          align: style.textAlign || 'left'
        }).setOrigin(0, 0).setDepth(42));
        text.setResolution?.(2);
        text.setFixedSize?.(Math.max(12, rect.width), Math.max(9, rect.height));
        node.dataset.legendPhaserRightText = 'true';
        this.nativeRightDrawerUiTaggedNodes.push(node);
      });

      this.nativeRightDrawerUiTextNodes = textNodes;
      this.nativeRightDrawerUiControls = controls;
      this.nativeRightDrawerUiIconNodes = iconNodes;
      // Any icon that cannot be converted is left in the DOM and is not hidden.
      this.nativeRightDrawerUiSignature = signature;
      this.nativeRightDrawerUiActive = true;
      document.body?.classList.add('legend-phaser-right-drawer-ui-active');
    }

    syncNativeLeftDrawerUi() {
      const shell = document.getElementById('legend-world-shell-root');
      const panel = shell?.querySelector('#lws-panel-left');
      const scroll = panel?.querySelector('.lws-panel-scroll');
      const mobile = window.matchMedia?.('(max-width: 1199px)').matches || false;
      const hidden = !panel || !scroll || !shell || shell.hidden || panel.hidden ||
        (mobile && (panel.inert || panel.getAttribute('aria-hidden') === 'true'));
      if (hidden) {
        if (this.nativeLeftDrawerUiActive || document.body?.classList.contains('legend-phaser-left-drawer-ui-active')) {
          this.clearNativeLeftDrawerUi();
        }
        return;
      }

      if (this.nativeLeftDrawerUiBoundPanel !== panel || this.nativeLeftDrawerUiBoundScroll !== scroll) {
        this.clearNativeLeftDrawerUi();
        this.nativeLeftDrawerUiBoundPanel = panel;
        this.nativeLeftDrawerUiBoundScroll = scroll;
        this.nativeLeftDrawerUiInteractionHandler = () => {
          this.nativeLeftDrawerUiLayoutEvent?.remove?.(false);
          this.nativeLeftDrawerUiLayoutEvent = this.time.delayedCall(28, () => {
            this.nativeLeftDrawerUiLayoutEvent = null;
            this.syncNativeLeftDrawerUi();
          });
        };
        this.nativeLeftDrawerUiTransitionHandler = event => {
          if (event.target !== panel || (event.propertyName && event.propertyName !== 'transform')) return;
          this.nativeLeftDrawerUiInteractionHandler?.();
        };
        ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout'].forEach(type =>
          scroll.addEventListener(type, this.nativeLeftDrawerUiInteractionHandler, { passive: type === 'scroll' })
        );
        panel.addEventListener('transitionend', this.nativeLeftDrawerUiTransitionHandler);
      }

      // Do not paint against a moving drawer. The DOM stays visible through its
      // slide, then the final settled geometry is sampled for Phaser.
      if (this.hasFiniteEntranceAnimation(panel)) {
        this.clearNativeLeftDrawerUi(true, false);
        this.nativeLeftDrawerUiLayoutEvent?.remove?.(false);
        this.nativeLeftDrawerUiLayoutEvent = this.time.delayedCall(230, () => {
          this.nativeLeftDrawerUiLayoutEvent = null;
          this.syncNativeLeftDrawerUi();
        });
        return;
      }

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const readRect = node => {
        if (!node || !node.isConnected) return null;
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden') return null;
        return {
          x: rect.left * sx,
          y: rect.top * sy,
          width: rect.width * sx,
          height: rect.height * sy
        };
      };
      const panelRect = readRect(panel);
      const scrollRect = readRect(scroll);
      if (!panelRect || !scrollRect) {
        this.clearNativeLeftDrawerUi();
        return;
      }
      const content = node => node.textContent?.replace(/\s+/g, ' ').trim() || '';
      const headerNodes = Array.from(panel.querySelectorAll(
        '.lws-panel-eyebrow,.lws-panel-header h2,.lws-panel-header p,.lws-panel-header .lws-tag'
      )).filter(node => Boolean(content(node)) && readRect(node));
      const scrollTextSelector = [
        '.lws-section-title > span',
        '.lws-health-line > span',
        '.lws-health-line > strong',
        '.lws-quest-item > strong',
        '.lws-quest-item > p',
        '.lws-small-list li > span',
        '.lws-small-list li > strong',
        '.lws-note',
        '.lws-btn-copy > strong',
        '.lws-btn-copy > small'
      ].join(',');
      const scrollTextNodes = Array.from(new Set(scroll.querySelectorAll(scrollTextSelector))).filter(node =>
        Boolean(content(node)) && readRect(node)
      );
      const textNodes = [...headerNodes, ...scrollTextNodes];
      const controls = Array.from(scroll.querySelectorAll('button[data-world-action]')).filter(node => readRect(node));
      const iconNodes = Array.from(scroll.querySelectorAll('.lws-btn-icon')).filter(node => readRect(node));
      const surfaces = [
        ...Array.from(scroll.querySelectorAll('.lws-section,.lws-quest-item,.lws-vital,.lws-meter,.lws-tag,.lws-btn'))
      ].map(node => ({ node, rect: readRect(node) })).filter(item => item.rect);
      const meters = Array.from(scroll.querySelectorAll('.lws-meter')).map(node => ({
        track: node,
        trackRect: readRect(node),
        fill: node.querySelector('span'),
        fillRect: readRect(node.querySelector('span'))
      })).filter(item => item.trackRect);
      const signature = JSON.stringify([
        Math.round(panelRect.x), Math.round(panelRect.y), Math.round(panelRect.width), Math.round(panelRect.height),
        Math.round(scrollRect.x), Math.round(scrollRect.y), Math.round(scrollRect.width), Math.round(scrollRect.height),
        Math.round(window.innerWidth), Math.round(window.innerHeight), Number(scroll.scrollTop || 0),
        ...textNodes.map(node => {
          const rect = readRect(node);
          return [content(node), Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)];
        }),
        ...controls.map(node => {
          const rect = readRect(node);
          return [node.dataset.worldAction || '', content(node), Math.round(rect.x), Math.round(rect.y),
            Math.round(rect.width), Math.round(rect.height), Boolean(node.disabled),
            node === document.activeElement || node.matches(':focus-visible'), node.matches(':hover')];
        })
      ]);
      const tagsCurrent =
        controls.length === this.nativeLeftDrawerUiControls.length &&
        controls.every((node, index) => node === this.nativeLeftDrawerUiControls[index] &&
          node.dataset.legendPhaserLeftControl === 'true') &&
        textNodes.length === this.nativeLeftDrawerUiTextNodes.length &&
        textNodes.every((node, index) => node === this.nativeLeftDrawerUiTextNodes[index] &&
          node.dataset.legendPhaserLeftText === 'true') &&
        iconNodes.length === this.nativeLeftDrawerUiIconNodes.length &&
        iconNodes.every((node, index) => node === this.nativeLeftDrawerUiIconNodes[index] &&
          node.dataset.legendPhaserLeftIcon === 'true');
      if (this.nativeLeftDrawerUiActive && tagsCurrent && signature === this.nativeLeftDrawerUiSignature) return;

      this.clearNativeLeftDrawerUi(false, false);
      // The DOM remains visible while Phaser's replacement is constructed.
      document.body?.classList.remove('legend-phaser-left-drawer-ui-active');

      const panelGraphics = this.add.graphics().setDepth(39);
      panelGraphics.fillStyle(0x10180f, 0.96);
      panelGraphics.fillRect(panelRect.x, panelRect.y, panelRect.width, panelRect.height);
      panelGraphics.fillStyle(0x1d281b, 0.22);
      panelGraphics.fillRect(panelRect.x, panelRect.y, panelRect.width, panelRect.height * 0.42);
      panelGraphics.lineStyle(Math.max(1, sx), 0xbfa064, 0.68);
      panelGraphics.strokeRect(panelRect.x + 0.5, panelRect.y + 0.5,
        Math.max(1, panelRect.width - 1), Math.max(1, panelRect.height - 1));
      panelGraphics.lineStyle(Math.max(1, sy), 0xbfa064, 0.42);
      const headerRect = readRect(panel.querySelector('.lws-panel-header'));
      if (headerRect) {
        panelGraphics.lineBetween(headerRect.x, headerRect.y + headerRect.height - sy,
          headerRect.x + headerRect.width, headerRect.y + headerRect.height - sy);
      }
      panelGraphics.fillStyle(0xe4c17d, 0.58);
      panelGraphics.fillRect(panelRect.x, panelRect.y, Math.max(2 * sx, 2), Math.max(2 * sy, 2));
      this.nativeLeftDrawerUiObjects.push(panelGraphics);

      const addHeaderText = node => {
        const rect = readRect(node);
        if (!rect) return;
        const css = window.getComputedStyle(node);
        const text = this.add.text(rect.x, rect.y, content(node), {
          fontFamily: css.fontFamily || 'Arial, sans-serif',
          fontSize: Math.max(9, Math.round((parseFloat(css.fontSize) || 11) * sy)) + 'px',
          fontStyle: Number.parseInt(css.fontWeight, 10) >= 600 ? 'bold' : 'normal',
          color: node.matches('.lws-panel-eyebrow') ? '#c9a96e'
            : node.matches('.lws-panel-header h2') ? '#efe7d4'
            : node.matches('.lws-panel-header .lws-tag') ? '#d8cba9'
            : '#b1b8aa',
          letterSpacing: (Number.parseFloat(css.letterSpacing) || 0) * sx,
          align: css.textAlign || 'left'
        }).setDepth(41).setOrigin(0, 0);
        text.setResolution?.(2);
        text.setFixedSize?.(Math.max(12, rect.width), Math.max(10, rect.height));
        this.nativeLeftDrawerUiObjects.push(text);
        node.dataset.legendPhaserLeftText = 'true';
        this.nativeLeftDrawerUiTaggedNodes.push(node);
      };
      headerNodes.forEach(addHeaderText);

      const contentContainer = this.add.container(0, 0).setDepth(40);
      const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      maskGraphics.fillStyle(0xffffff, 1);
      maskGraphics.fillRect(scrollRect.x, scrollRect.y, scrollRect.width, scrollRect.height);
      const rendererType = this.sys.game.renderer?.type;
      let mask = null;
      let maskFilter = null;
      if (rendererType === Phaser.WEBGL) {
        try {
          contentContainer.enableFilters?.();
          contentContainer.setFiltersFocusContext?.(true);
          maskFilter = contentContainer.filters?.internal?.addMask?.(
            maskGraphics, false, this.cameras.main, 'world'
          ) || null;
        } catch (error) {
          console.warn('[LEGEND Phaser] Left drawer WebGL mask could not be created; keeping the accessible DOM drawer visible.', error);
        }
        if (!maskFilter) {
          panelGraphics.destroy();
          this.nativeLeftDrawerUiObjects = [];
          contentContainer.destroy(true);
          maskGraphics.destroy(true);
          return;
        }
        this.nativeLeftDrawerUiMaskFilter = maskFilter;
      } else {
        mask = maskGraphics.createGeometryMask();
        contentContainer.setMask(mask);
        this.nativeLeftDrawerUiMask = mask;
      }
      this.nativeLeftDrawerUiContainer = contentContainer;
      this.nativeLeftDrawerUiMaskGraphics = maskGraphics;
      this.nativeLeftDrawerUiMaskBounds = {
        x: scrollRect.x, y: scrollRect.y, width: scrollRect.width, height: scrollRect.height
      };
      this.nativeLeftDrawerUiObjects.push(contentContainer, maskGraphics);

      const addContent = object => {
        if (!object) return object;
        contentContainer.add(object);
        return object;
      };
      const draw = addContent(this.add.graphics());
      surfaces.forEach(({ node, rect }) => {
        if (node.classList.contains('lws-section')) {
          draw.fillStyle(0xbfa064, 0.035);
          draw.fillRect(rect.x, rect.y, rect.width, rect.height);
          draw.lineStyle(Math.max(1, sy), 0xbfa064, 0.21);
          draw.lineBetween(rect.x, rect.y + rect.height - sy, rect.x + rect.width, rect.y + rect.height - sy);
        } else if (node.classList.contains('lws-quest-item')) {
          draw.fillStyle(0xbfa064, 0.10);
          draw.fillRect(rect.x, rect.y, rect.width, rect.height);
          draw.fillStyle(0xd4b174, 0.80);
          draw.fillRect(rect.x, rect.y, Math.max(2 * sx, 2), rect.height);
        } else if (node.classList.contains('lws-vital') || node.classList.contains('lws-tag')) {
          draw.fillStyle(0x1d281b, 0.94);
          draw.fillRect(rect.x, rect.y, rect.width, rect.height);
          draw.lineStyle(Math.max(1, sx), 0xbfa064, 0.35);
          draw.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        } else if (node.classList.contains('lws-meter')) {
          draw.fillStyle(0x030604, 0.95);
          draw.fillRect(rect.x, rect.y, rect.width, rect.height);
          draw.lineStyle(Math.max(1, sy), 0xbfa064, 0.30);
          draw.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        } else if (node.classList.contains('lws-btn')) {
          const focused = node === document.activeElement || node.matches(':focus-visible');
          const hovered = node.matches(':hover');
          const disabled = node.disabled || node.getAttribute('aria-disabled') === 'true';
          draw.fillStyle(focused || hovered ? 0x39412a : 0x172116, disabled ? 0.34 : 0.95);
          draw.fillRect(rect.x, rect.y, rect.width, rect.height);
          draw.lineStyle(focused ? 2 * Math.min(sx, sy) : Math.max(1, sx),
            focused ? 0xffe6a0 : hovered ? 0xe7c982 : 0xbfa064, disabled ? 0.30 : 0.62);
          draw.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        }
      });
      meters.forEach(({ trackRect, fillRect }) => {
        if (!fillRect) return;
        draw.fillStyle(0xb97c5c, 0.96);
        draw.fillRect(fillRect.x, fillRect.y, fillRect.width, fillRect.height);
      });

      scrollTextNodes.forEach(node => {
        const rect = readRect(node);
        if (!rect) return;
        const css = window.getComputedStyle(node);
        const color = node.matches('.lws-section-title > span') ? '#d8cba9'
          : node.matches('.lws-health-line > strong') ? '#f1d9c5'
          : node.matches('.lws-quest-item > strong') ? '#ece4d0'
          : node.matches('.lws-small-list li > strong') ? '#efe7d4'
          : node.matches('.lws-btn-copy > strong') ? '#f0ead9'
          : node.matches('.lws-note,.lws-quest-item > p,.lws-small-list li > span,.lws-health-line > span,.lws-btn-copy > small') ? '#b1b8aa'
          : '#eee7d6';
        const text = addContent(this.add.text(rect.x, rect.y, content(node), {
          fontFamily: css.fontFamily || 'Arial, sans-serif',
          fontSize: Math.max(8, Math.round((parseFloat(css.fontSize) || 10) * sy)) + 'px',
          fontStyle: Number.parseInt(css.fontWeight, 10) >= 600 ? 'bold' : 'normal',
          color,
          letterSpacing: (Number.parseFloat(css.letterSpacing) || 0) * sx,
          align: css.textAlign || 'left'
        }).setOrigin(0, 0).setDepth(42));
        text.setResolution?.(2);
        text.setFixedSize?.(Math.max(10, rect.width), Math.max(9, rect.height));
        node.dataset.legendPhaserLeftText = 'true';
        this.nativeLeftDrawerUiTaggedNodes.push(node);
      });

      const iconTextures = Object.freeze({ journal: 'menuJournal' });
      controls.forEach(button => {
        const rect = readRect(button);
        if (!rect) return;
        const icon = button.querySelector('.lws-btn-icon');
        const iconRect = readRect(icon);
        const key = iconTextures[button.dataset.worldAction || ''];
        if (icon && iconRect && key && this.textures.exists(key)) {
          const image = addContent(this.add.image(
            iconRect.x + iconRect.width / 2, iconRect.y + iconRect.height / 2, key
          ).setDisplaySize(
            Math.max(10, Math.min(iconRect.width - 2 * sx, 24 * sx)),
            Math.max(10, Math.min(iconRect.height - 2 * sy, 24 * sy))
          ).setAlpha(0.96).setDepth(43));
          this.nativeLeftDrawerUiTaggedNodes.push(icon);
          icon.dataset.legendPhaserLeftIcon = 'true';
          void image;
        }
        button.dataset.legendPhaserLeftControl = 'true';
        this.nativeLeftDrawerUiTaggedNodes.push(button);
      });

      this.nativeLeftDrawerUiTextNodes = textNodes;
      this.nativeLeftDrawerUiControls = controls;
      this.nativeLeftDrawerUiIconNodes = iconNodes;
      this.nativeLeftDrawerUiSignature = signature;
      this.nativeLeftDrawerUiActive = true;
      document.body?.classList.add('legend-phaser-left-drawer-ui-active');
    }

    syncNativeHudUi() {
      const shell = document.getElementById('legend-world-shell-root');
      const hud = shell?.querySelector('.lws-hud');
      if (!hud || shell.hidden || hud.hidden) {
        if (this.nativeHudUiActive || document.body?.classList.contains('legend-phaser-hud-ui-active')) {
          this.clearNativeHudUi();
        }
        return;
      }

      if (this.nativeHudUiBoundElement !== hud) {
        if (this.nativeHudUiBoundElement && this.nativeHudUiInteractionHandler) {
          ['focusin', 'focusout', 'pointerover', 'pointerout'].forEach(type =>
            this.nativeHudUiBoundElement.removeEventListener(type, this.nativeHudUiInteractionHandler)
          );
        }
        this.nativeHudUiBoundElement = hud;
        this.nativeHudUiInteractionHandler = () => {
          this.nativeHudUiLayoutEvent?.remove?.(false);
          this.nativeHudUiLayoutEvent = this.time.delayedCall(24, () => {
            this.nativeHudUiLayoutEvent = null;
            this.syncNativeHudUi();
          });
        };
        ['focusin', 'focusout', 'pointerover', 'pointerout'].forEach(type =>
          hud.addEventListener(type, this.nativeHudUiInteractionHandler)
        );
      }

      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const readRect = node => {
        if (!node || !node.isConnected) return null;
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden') return null;
        return {
          x: rect.left * sx, y: rect.top * sy,
          width: rect.width * sx, height: rect.height * sy
        };
      };
      const hudRect = readRect(hud);
      if (!hudRect) {
        this.clearNativeHudUi();
        return;
      }

      const textSelector = [
        '.lws-brand-mark',
        '.lws-brand-copy strong',
        '.lws-brand-copy span',
        '.lws-location > span',
        '#lws-current-location',
        '.lws-objective-label',
        '#lws-current-objective',
        '.lws-vital > span',
        '.lws-vital > strong',
        '.lws-hud-save .lws-btn-copy strong',
        '.lws-mobile-toggle'
      ].join(',');
      const content = node => node.textContent?.replace(/\s+/g, ' ').trim() || '';
      const textNodes = Array.from(hud.querySelectorAll(textSelector)).filter(node =>
        Boolean(content(node)) && readRect(node)
      );
      const controls = Array.from(hud.querySelectorAll('button')).filter(node => readRect(node));
      const boxes = [
        ...Array.from(hud.querySelectorAll('.lws-brand-mark,.lws-vital')),
        ...controls
      ].map(node => ({ node, rect: readRect(node) })).filter(item => item.rect);
      const signature = JSON.stringify([
        Math.round(hudRect.width), Math.round(hudRect.height), Math.round(window.innerWidth), Math.round(window.innerHeight),
        ...textNodes.map(node => {
          const rect = readRect(node);
          return [content(node), Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)];
        }),
        ...controls.map(node => {
          const rect = readRect(node);
          return [
            node.dataset.worldAction || node.getAttribute('aria-label') || content(node),
            Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height),
            Boolean(node.disabled), node === document.activeElement || node.matches(':focus-visible'), node.matches(':hover')
          ];
        })
      ]);
      if (this.nativeHudUiActive && signature === this.nativeHudUiSignature) return;

      this.clearNativeHudUi(false);
      this.nativeHudUiActive = true;
      this.nativeHudUiSignature = signature;
      this.nativeHudUiTextNodes = textNodes;
      this.nativeHudUiControls = controls;
      document.body?.classList.add('legend-phaser-hud-ui-active');

      const graphics = this.add.graphics().setDepth(48);
      graphics.fillStyle(0x050906, 0.97);
      graphics.fillRect(hudRect.x, hudRect.y, hudRect.width, hudRect.height);
      graphics.fillStyle(0x172016, 0.30);
      graphics.fillRect(hudRect.x, hudRect.y, hudRect.width, hudRect.height * 0.48);
      graphics.fillStyle(0x0c130c, 0.22);
      graphics.fillRect(hudRect.x, hudRect.y + hudRect.height * 0.48, hudRect.width, hudRect.height * 0.52);
      graphics.lineStyle(Math.max(1, sy), 0xbfa064, 0.58);
      graphics.lineBetween(hudRect.x, hudRect.y + hudRect.height - sy, hudRect.x + hudRect.width, hudRect.y + hudRect.height - sy);
      graphics.fillStyle(0xe7c982, 0.56);
      graphics.fillRect(hudRect.x, hudRect.y, Math.max(2 * sx, 2), Math.max(2 * sy, 2));

      const location = readRect(hud.querySelector('.lws-location'));
      if (location) {
        graphics.lineStyle(Math.max(1, sx), 0xbfa064, 0.42);
        graphics.lineBetween(location.x - 7 * sx, location.y + 3 * sy, location.x - 7 * sx, location.y + location.height - 3 * sy);
      }
      const objective = readRect(hud.querySelector('.lws-objective'));
      if (objective) {
        graphics.fillStyle(0xbfa064, 0.84);
        graphics.fillRect(objective.x, objective.y + 4 * sy, Math.max(2 * sx, 2), Math.max(10 * sy, objective.height - 8 * sy));
        graphics.fillStyle(0xbfa064, 0.13);
        graphics.fillRect(objective.x + 2 * sx, objective.y + 4 * sy, Math.max(1, objective.width * 0.42), Math.max(10 * sy, objective.height - 8 * sy));
      }

      boxes.forEach(({ node, rect }) => {
        const isButton = node.tagName === 'BUTTON';
        const isBrand = node.classList.contains('lws-brand-mark');
        const isVital = node.classList.contains('lws-vital');
        const focused = isButton && (node === document.activeElement || node.matches(':focus-visible'));
        const hovered = isButton && node.matches(':hover');
        const disabled = isButton && node.disabled;
        const fill = isBrand ? 0x182116 : isVital ? 0x111a11 : (hovered || focused) ? 0x39412a : 0x172116;
        const stroke = focused ? 0xffe6a0 : hovered ? 0xe7c982 : 0xbfa064;
        graphics.fillStyle(fill, disabled ? 0.42 : isBrand ? 0.92 : 0.96);
        graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        graphics.lineStyle(focused ? 2 * Math.min(sx, sy) : Math.max(1, sx), stroke, disabled ? 0.34 : focused ? 0.98 : 0.54);
        graphics.strokeRect(rect.x + 0.5, rect.y + 0.5, Math.max(1, rect.width - 1), Math.max(1, rect.height - 1));
        graphics.fillStyle(0xe7c982, isBrand ? 0.76 : 0.52);
        graphics.fillRect(rect.x, rect.y, Math.max(2 * sx, 2), rect.height);
      });
      this.nativeHudUiObjects.push(graphics);

      const fallbackColors = node => {
        if (node.classList.contains('lws-brand-mark') || node.id === 'lws-current-location') return '#e7c982';
        if (node.matches('.lws-brand-copy strong')) return '#efe7d4';
        if (node.matches('.lws-brand-copy span,.lws-location > span,.lws-objective-label,.lws-vital > span')) return '#b1b8aa';
        if (node.id === 'lws-current-objective') return '#f4edda';
        if (node.closest('.lws-vital.health')) return '#e9b5a3';
        if (node.closest('.lws-vital.gold')) return '#e7c982';
        return '#e9e4d5';
      };
      textNodes.forEach(node => {
        const rect = readRect(node);
        if (!rect) return;
        const css = window.getComputedStyle(node);
        const fontSize = Math.max(9, Math.round((parseFloat(css.fontSize) || 12) * sy));
        const letterSpacing = Number.parseFloat(css.letterSpacing) || 0;
        const text = this.add.text(
          node.classList.contains('lws-brand-mark') ? rect.x + rect.width / 2 : rect.x,
          node.classList.contains('lws-brand-mark') ? rect.y + rect.height / 2 : rect.y,
          content(node),
          {
            fontFamily: css.fontFamily || 'Arial, sans-serif',
            fontSize: fontSize + 'px',
            fontStyle: css.fontWeight === 'bold' || Number.parseInt(css.fontWeight, 10) >= 600 ? 'bold' : 'normal',
            color: fallbackColors(node),
            letterSpacing: letterSpacing * sx,
            align: node.classList.contains('lws-brand-mark') ? 'center' : 'left'
          }
        ).setDepth(54);
        if (node.classList.contains('lws-brand-mark')) text.setOrigin(0.5);
        else text.setOrigin(0, 0);
        text.setResolution?.(2);
        text.setFixedSize?.(Math.max(12, rect.width), Math.max(10, rect.height));
        this.nativeHudUiObjects.push(text);
        node.dataset.legendPhaserHudText = 'true';
        this.nativeHudUiTaggedNodes.push(node);
      });

      controls.forEach(node => {
        node.dataset.legendPhaserHudControl = 'true';
        this.nativeHudUiTaggedNodes.push(node);
      });
    }

    syncNativeGameplayUi(surface = this.surface) {
      // The shared DOM-to-Phaser mirror is intentionally held behind a safe
      // production fallback. It reconstructs CSS panels/text approximately and
      // can omit nested copy while its CSS hides the source DOM. Keep the real
      // production markup visible until the replacement passes full parity
      // checks for text, artwork, responsive layout and controls on every surface.
      // Phaser remains the persistent world renderer and continues to own the
      // environment, atmosphere, transitions, title, annals, creation and Oric UI.
      this.clearNativeGameplayUi();
      return;

      const host = root();
      const shell = document.getElementById('legend-world-shell-root');
      // Temporarily reveal the semantic layer while measuring its original
      // computed styles; otherwise our own transparent-paint CSS would be
      // sampled on every state refresh.
      document.body?.classList.remove('legend-phaser-gameplay-ui-active');
      const gameplaySurfaces = new Set([
        'town','town-service','expedition','expedition-results','combat','combat-results',
        'dungeon','field-site','settings','dispatches','credits','modal'
      ]);
      const modalRoot = document.getElementById('legend-world-shell-modal-root');
      const modalVisible = Boolean(surface === 'modal' && modalRoot && !modalRoot.hidden);
      const progressionRoot = document.getElementById('legendLevelUpOverlay');
      const progressionVisible = Boolean(progressionRoot && !progressionRoot.hidden &&
        window.getComputedStyle(progressionRoot).display !== 'none' &&
        window.getComputedStyle(progressionRoot).visibility !== 'hidden');
      const dedicated = host?.querySelector('.v120-title,.title-v100,.title-v136-rpg,.opening-lore-v220,.v140-creation,.opening-road-v140');
      const shellVisible = Boolean(shell && !shell.hidden && gameplaySurfaces.has(String(surface || '')));
      const rootVisible = Boolean(host && gameplaySurfaces.has(String(surface || '')) && !dedicated);
      if (!shellVisible && !rootVisible && !modalVisible && !progressionVisible) {
        if (this.nativeGameplayUiActive || document.body?.classList.contains('legend-phaser-gameplay-ui-active')) {
          this.clearNativeGameplayUi();
        }
        return;
      }

      const roots = [];
      if (rootVisible) roots.push(host);
      if (shellVisible) roots.push(shell);
      if (modalVisible) roots.push(modalRoot);
      if (progressionVisible) roots.push(progressionRoot);
      const size = this.dimensions();
      const sx = size.width / Math.max(1, window.innerWidth || size.width);
      const sy = size.height / Math.max(1, window.innerHeight || size.height);
      const rectFor = node => {
        const rect = this.nativeGameplayUiVisibleRect(node);
        if (!rect) return null;
        return { x: rect.left * sx, y: rect.top * sy, width: rect.width * sx, height: rect.height * sy };
      };
      const allNodes = roots.flatMap(node => [node, ...Array.from(node.querySelectorAll('*'))]);
      const backgroundNodes = [];
      const textNodes = [];
      const images = [];
      const controls = [];
      const iconNodes = [];
      const candidates = allNodes.filter(node => node && node.nodeType === 1);
      candidates.forEach(node => {
        if (node.matches('input,textarea,select,option,script,style,template')) return;
        const rect = rectFor(node);
        if (!rect) return;
        const style = this.nativeGameplayUiStyle(node);
        const bgImage = style.backgroundImage || 'none';
        const bgColor = style.backgroundColor || 'rgba(0,0,0,0)';
        let bgSample = this.nativeGameplayUiColor(bgImage !== 'none' ? bgImage : bgColor);
        if (bgSample.alpha <= 0.04 && bgImage !== 'none') bgSample = this.nativeGameplayUiColor(bgColor);
        const borderWidth = Math.max(
          parseFloat(style.borderTopWidth) || 0,
          parseFloat(style.borderRightWidth) || 0,
          parseFloat(style.borderBottomWidth) || 0,
          parseFloat(style.borderLeftWidth) || 0
        );
        const borderSample = this.nativeGameplayUiColor(style.borderTopColor || style.borderColor, 0xd0b477);
        if (rect.width > 3 && rect.height > 3 && (bgSample.alpha > 0.04 || borderWidth > 0)) {
          backgroundNodes.push({ node, rect, bgSample, bgAlpha: bgSample.alpha * Math.max(0, Math.min(1, Number(style.opacity) || 0)), borderSample, borderWidth, style, depth: (() => { let depth = 0; let parent = node.parentElement; while (parent && parent !== document.body) { depth += 1; parent = parent.parentElement; } return depth; })() });
        }
        if (node.tagName === 'IMG' && node.complete && node.naturalWidth > 0) {
          images.push({ node, rect });
        } else if (node.matches('.runway-icon')) {
          const iconClass = Array.from(node.classList).find(name => name.startsWith('runway-icon-'));
          if (iconClass) iconNodes.push({ node, rect, name: iconClass.slice('runway-icon-'.length) });
        }

        const hiddenFromAccessibility = node.getAttribute('aria-hidden') === 'true' || Boolean(node.closest('[aria-hidden="true"]'));
        if (!hiddenFromAccessibility && node.matches('button,a[href],[role="button"]')) controls.push({ node, rect });
        if (hiddenFromAccessibility) return;
        const textTags = 'h1,h2,h3,h4,p,small,strong,em,span,label,li,dt,dd,button,a,div';
        if (!node.matches(textTags)) return;
        let directText = Array.from(node.childNodes || [])
          .filter(child => child.nodeType === 3)
          .map(child => child.textContent || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (!directText && node.childElementCount === 0) directText = String(node.textContent || '').replace(/\s+/g, ' ').trim();
        if (!directText && node.childElementCount === 0 && node.matches('button,a[href],[role="button"]')) {
          directText = String(node.getAttribute('aria-label') || node.textContent || '').replace(/\s+/g, ' ').trim();
        }
        if (directText) textNodes.push({ node, rect, text: directText, style });
      });

      const signature = JSON.stringify([
        surface, Math.round(window.innerWidth), Math.round(window.innerHeight),
        ...backgroundNodes.map(item => [item.node.id,item.node.className,Math.round(item.rect.x),Math.round(item.rect.y),Math.round(item.rect.width),Math.round(item.rect.height),item.node.getAttribute('aria-pressed') || '',item.node.getAttribute('aria-selected') || '']),
        ...textNodes.map(item => [item.node.tagName,item.text,Math.round(item.rect.x),Math.round(item.rect.y),Math.round(item.rect.width),Math.round(item.rect.height)]),
        ...images.map(item => [item.node.currentSrc || item.node.src,Math.round(item.rect.x),Math.round(item.rect.y),Math.round(item.rect.width),Math.round(item.rect.height)]),
        ...controls.map(item => [item.node.id,item.node.className,item.node.getAttribute('aria-label') || item.node.textContent?.trim() || '',item.node.disabled,item.node.getAttribute('aria-pressed') || '']),
        ...roots.map(node => [node.scrollTop,node.dataset?.context || '',node.dataset?.region || ''])
      ]);
      if (this.nativeGameplayUiActive && signature === this.nativeGameplayUiSignature) {
        this.observeNativeGameplayUi(shellVisible ? shell : null, rootVisible ? host : null, modalVisible ? modalRoot : null, progressionVisible ? progressionRoot : null);
        document.body?.classList.add('legend-phaser-gameplay-ui-active');
        return;
      }

      this.clearNativeGameplayUi(false);
      this.observeNativeGameplayUi(shellVisible ? shell : null, rootVisible ? host : null, modalVisible ? modalRoot : null, progressionVisible ? progressionRoot : null);
      this.nativeGameplayUiActive = true;
      this.nativeGameplayUiSignature = signature;
      document.body?.classList.add('legend-phaser-gameplay-ui-active');

      const tag = (node, property) => {
        const key = property === 'paint' ? 'legendPhaserNativePaint'
          : property === 'text' ? 'legendPhaserNativeText'
          : property === 'control' ? 'legendPhaserNativeControl'
          : 'legendPhaserNativeImage';
        node.dataset[key] = 'true';
        if (!this.nativeGameplayUiTaggedNodes.includes(node)) this.nativeGameplayUiTaggedNodes.push(node);
      };
      const graphics = this.add.graphics().setDepth(20);
      backgroundNodes.sort((a,b) => a.depth - b.depth).forEach(item => {
        const { rect, bgSample, bgAlpha, borderSample, borderWidth, style, node } = item;
        const radius = Math.max(0, Math.min(16, parseFloat(style.borderTopLeftRadius) || 0)) * Math.min(sx,sy);
        if (bgAlpha > 0.04) {
          graphics.fillStyle(bgSample.color, bgAlpha);
          if (typeof graphics.fillRoundedRect === 'function' && radius > 1) graphics.fillRoundedRect(rect.x, rect.y, rect.width, rect.height, radius);
          else graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        if (borderWidth > 0 && borderSample.alpha > 0.04) {
          graphics.lineStyle(Math.max(1, borderWidth * Math.min(sx,sy)), borderSample.color, borderSample.alpha);
          if (typeof graphics.strokeRoundedRect === 'function' && radius > 1) graphics.strokeRoundedRect(rect.x + .5, rect.y + .5, rect.width - 1, rect.height - 1, radius);
          else graphics.strokeRect(rect.x + .5, rect.y + .5, Math.max(1,rect.width-1), Math.max(1,rect.height-1));
        }
        tag(node, 'paint');
      });
      this.nativeGameplayUiObjects.push(graphics);

      images.forEach(item => {
        const { node, rect } = item;
        const key = this.createNativeGameplayImageTexture(node);
        if (!key || !this.textures.exists(key)) return;
        const img = this.add.image(rect.x + rect.width/2, rect.y + rect.height/2, key)
          .setDisplaySize(rect.width, rect.height)
          .setDepth(24);
        this.nativeGameplayUiObjects.push(img);
        tag(node, 'image');
      });

      const iconTextures = {
        compass: 'menuCompass', journal: 'menuJournal', traveler: 'menuTraveler',
        inn: 'menuInn', market: 'serviceMarketIcon', forge: 'serviceForgeIcon',
        road: 'menuRoad', settings: 'menuSettings', milestone: 'menuMilestone'
      };
      iconNodes.forEach(item => {
        const key = iconTextures[item.name];
        if (!key || !this.textures.exists(key)) return;
        const img = this.add.image(item.rect.x + item.rect.width/2, item.rect.y + item.rect.height/2, key)
          .setDisplaySize(item.rect.width, item.rect.height)
          .setDepth(26)
          .setAlpha(.98);
        this.nativeGameplayUiObjects.push(img);
        tag(item.node,'image');
      });

      textNodes.forEach(item => {
        // Styles were captured before the native class hides the DOM paint.
        const fontPx = Math.max(8, (parseFloat(item.style.fontSize) || 12) * sy);
        const linePx = parseFloat(item.style.lineHeight) || (parseFloat(item.style.fontSize) || 12) * 1.4;
        let value = item.text;
        if (item.style.textTransform === 'uppercase') value = value.toLocaleUpperCase();
        else if (item.style.textTransform === 'lowercase') value = value.toLocaleLowerCase();
        const text = this.add.text(item.rect.x, item.rect.y, value, {
          fontFamily: item.style.fontFamily || 'Arial, sans-serif',
          fontSize: fontPx + 'px',
          fontStyle: Number(item.style.fontWeight) >= 650 || item.style.fontWeight === 'bold' ? 'bold' : (item.style.fontStyle || 'normal'),
          color: item.style.color || '#e9e3d2',
          lineSpacing: Math.max(0, (linePx - (parseFloat(item.style.fontSize) || 12)) * sy),
          letterSpacing: Number.isFinite(parseFloat(item.style.letterSpacing)) ? Math.max(0, parseFloat(item.style.letterSpacing) * sx) : 0,
          wordWrap: { width: Math.max(20, item.rect.width), useAdvancedWrap: true },
          align: item.style.textAlign || 'left',
          padding: { left: 1, right: 2, top: 1, bottom: 2 }
        }).setOrigin(0,0).setDepth(30);
        this.nativeGameplayUiObjects.push(text);
        tag(item.node,'text');
      });

      controls.forEach((item,index) => {
        const node = item.node;
        const id = node.id || node.getAttribute('data-world-action') || node.getAttribute('data-world-route') || node.getAttribute('data-world-place') || 'gameplay-control-' + index;
        const label = String(node.getAttribute('aria-label') || node.textContent?.replace(/\s+/g,' ').trim() || id);
        if (!node.hasAttribute('aria-label')) node.setAttribute('aria-label',label);
        const rect = item.rect;
        const focusFrame = this.add.graphics();
        focusFrame.lineStyle(2, node.disabled ? 0x9a8f72 : 0xffe6a0, .98);
        focusFrame.strokeRect(rect.x + 1,rect.y + 1,Math.max(1,rect.width-2),Math.max(1,rect.height-2));
        focusFrame.setVisible(node === document.activeElement || node.matches(':hover'));
        focusFrame.setDepth(40);
        this.nativeGameplayUiObjects.push(focusFrame);
        const control = { id, label, x:rect.x, y:rect.y, width:rect.width, height:rect.height, focusFrame, node, selected:node.getAttribute('aria-pressed') === 'true' };
        this.nativeGameplayUiControls.push(control);
        tag(node,'control');
        if (!node.__legendNativeGameplayBound) {
          node.__legendNativeGameplayBound = true;
          const updateFocus = active => {
            const live = this.nativeGameplayUiControls.find(entry => entry.node === node);
            live?.focusFrame?.setVisible?.(Boolean(active));
          };
          node.addEventListener('focus', () => updateFocus(true));
          node.addEventListener('blur', () => updateFocus(node.matches(':hover')));
          node.addEventListener('pointerenter', () => updateFocus(true));
          node.addEventListener('pointerleave', () => updateFocus(node === document.activeElement));
        }
      });
      images.forEach(item => { item.node.loading = 'eager'; });
      roots.forEach(node => node.querySelectorAll('img').forEach(img => {
        if (img.__legendNativeGameplayLoadBound || (img.complete && img.naturalWidth > 0)) return;
        img.__legendNativeGameplayLoadBound = true;
        img.loading = 'eager';
        const retry = () => this.syncNativeGameplayUi(this.surface);
        img.addEventListener('load', retry, { once: true });
        img.addEventListener('error', retry, { once: true });
      }));
    }

    ashmerelandmarkSpecs() {
      const mobile = this.dimensions().width < 700;
      return [
        { id: 'inn', view: 'inn', label: 'THE INN', icon: 'serviceInnIcon', x: mobile ? 0.15 : 0.25, y: mobile ? 0.48 : 0.43 },
        { id: 'market', view: 'trader', label: 'MARKET', icon: 'serviceMarketIcon', x: mobile ? 0.38 : 0.42, y: mobile ? 0.43 : 0.38 },
        { id: 'forge', view: 'smith', label: 'FORGE', icon: 'serviceForgeIcon', x: mobile ? 0.62 : 0.58, y: mobile ? 0.43 : 0.38 },
        { id: 'road', view: 'road', label: 'OLD ROAD', icon: 'serviceRoadIcon', x: mobile ? 0.85 : 0.75, y: mobile ? 0.48 : 0.43 }
      ];
    }

    syncAshmereLandmarks() {
      const active = this.environment === 'ashmere' &&
        this.surface === 'town' &&
        Boolean(root()?.querySelector('.ash100-town-ashmere'));
      if (!active) {
        this.clearAshmereLandmarks();
        return;
      }
      if (!this.ashmereLandmarks.length) this.createAshmereLandmarks();
      this.layoutAshmereLandmarks();
    }

    createAshmereLandmarks() {
      this.clearAshmereLandmarks();
      const reduced = reducedMotion();
      this.ashmerelandmarkSpecs().forEach(spec => {
        const halo = this.add.circle(0, -24, 27, 0xd7b66e, 0.075);
        const shadow = this.add.ellipse(0, 15, 29, 8, 0x020604, 0.52);
        const beacon = this.add.rectangle(0, -9, 1.5, 24, 0xe1c47e, 0.35);
        const ring = this.add.circle(0, -25, 14, 0x07100b, 0.82);
        ring.setStrokeStyle(1.4, 0xe5c77f, 0.84);
        const core = this.add.circle(0, -25, 4, 0xf2d899, 0.96);
        const icon = this.add.image(0, -25, spec.icon)
          .setDisplaySize(22, 22)
          .setAlpha(0.98);
        const plate = this.add.rectangle(0, 15, 92, 25, 0x050a07, 0.82);
        plate.setStrokeStyle(1, 0xc6a760, 0.74);
        const label = this.add.text(0, 10, spec.label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '9px',
          fontStyle: 'bold',
          letterSpacing: 1.1,
          color: '#f2e5c6'
        }).setOrigin(0.5);
        const action = this.add.text(0, 20, 'INSPECT', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '6px',
          letterSpacing: 1.2,
          color: '#cdb77f'
        }).setOrigin(0.5);
        const container = this.add.container(0, 0, [halo, shadow, beacon, ring, core, icon, plate, label, action]);
        container.setDepth(10);

        // Phaser 4 PointLights add a real WebGL light pool without enabling the
        // scene's full normal-map Light2D pipeline. The existing halo remains
        // the Canvas fallback, so AUTO renderer selection stays safe.
        let pointLight = null;
        const rendererType = this.sys.game.renderer?.type;
        if (rendererType === Phaser.WEBGL && typeof this.lights?.addPointLight === 'function') {
          try {
            pointLight = this.lights.addPointLight(0, 0, 0xe8bd70, 112, 0.11, 0.1);
            pointLight.setDepth(8);
            this.ashmerePointLights.push({ id: spec.id, light: pointLight });
            if (!reduced) {
              this.tweens.add({
                targets: pointLight,
                intensity: 0.145,
                duration: Phaser.Math.Between(1850, 2450),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
              });
            }
          } catch (error) {
            pointLight?.destroy?.();
            pointLight = null;
            console.warn('[LEGEND Phaser] PointLight unavailable; using the scene glow fallback.', error);
          }
        }
        container.setSize(112, 84);
        container.setInteractive(
          new Phaser.Geom.Rectangle(-56, -39, 112, 84),
          Phaser.Geom.Rectangle.Contains
        );
        container.on('pointerover', () => this.setHoveredAshmereLandmark(spec.id));
        container.on('pointerout', () => this.setHoveredAshmereLandmark(''));
        container.on('pointerup', () => this.selectAshmereLandmark(spec.id));
        if (!reduced) {
          this.tweens.add({
            targets: halo,
            alpha: 0.14,
            scale: 1.35,
            duration: Phaser.Math.Between(1700, 2300),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
          this.tweens.add({
            targets: ring,
            scale: 1.12,
            duration: 2100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Phaser.Math.Between(0, 500)
          });
        }
        this.ashmereLandmarks.push({
          id: spec.id,
          view: spec.view,
          x: 0,
          y: 0,
          xRatio: spec.x,
          yRatio: spec.y,
          container,
          halo,
          ring,
          label,
          action,
          iconKey: spec.icon,
          pointLight,
          baseScale: 1,
          hitWidth: 58,
          hitHeight: 44
        });
      });
    }

    clearAshmereLandmarks() {
      this.ashmereLandmarks.forEach(item => {
        [item.container, item.halo, item.ring].forEach(object => {
          if (object) this.tweens.killTweensOf(object);
        });
        if (item.container?.active) item.container.destroy(true);
      });
      this.ashmereLandmarks = [];
      this.ashmerePointLights.forEach(({ light }) => {
        if (!light) return;
        this.tweens.killTweensOf(light);
        light.destroy();
      });
      this.ashmerePointLights = [];
      this.hoveredAshmereLandmark = '';
    }

    layoutAshmereLandmarks() {
      if (!this.ashmereLandmarks.length) return;
      const size = this.dimensions();
      const narrow = size.width < 700;
      const scale = narrow ? 0.84 : size.width < 1100 ? 0.92 : 1;
      this.ashmereLandmarks.forEach(item => {
        item.x = size.width * item.xRatio;
        item.y = size.height * item.yRatio;
        item.baseScale = scale;
        item.container.setPosition(item.x, item.y);
        item.container.setScale(scale * (this.hoveredAshmereLandmark === item.id ? 1.10 : 1));
        if (item.pointLight?.active) {
          item.pointLight.setPosition(item.x, item.y - 24);
          item.pointLight.radius = 112 * scale;
        }
        item.hitWidth = 58 * scale;
        item.hitHeight = 44 * scale;
      });
    }

    setHoveredAshmereLandmark(id) {
      const next = this.ashmereLandmarks.some(item => item.id === id) ? id : '';
      if (next === this.hoveredAshmereLandmark) return;
      this.hoveredAshmereLandmark = next;
      this.ashmereLandmarks.forEach(item => {
        const hovered = item.id === next;
        item.container.setScale(item.baseScale * (hovered ? 1.10 : 1));
        item.ring.setStrokeStyle(hovered ? 2 : 1.4, hovered ? 0xffe6a1 : 0xe5c77f, hovered ? 1 : 0.84);
        item.label.setColor(hovered ? '#fff4d5' : '#f2e5c6');
        item.action.setText(hovered ? 'OPEN DETAILS' : 'INSPECT');
      });
    }

    handleAshmerePointer(clientX, clientY, activate = false) {
      if (this.environment !== 'ashmere' || this.surface !== 'town' || !this.ashmereLandmarks.length) return false;
      const size = this.dimensions();
      const screenWidth = Math.max(1, window.innerWidth || size.width);
      const screenHeight = Math.max(1, window.innerHeight || size.height);
      const x = Number(clientX) / screenWidth * size.width;
      const y = Number(clientY) / screenHeight * size.height;
      const hit = this.ashmereLandmarks.find(item =>
        Math.abs(x - item.x) <= item.hitWidth &&
        Math.abs(y - item.y) <= item.hitHeight + 14
      );
      this.setHoveredAshmereLandmark(hit?.id || '');
      return activate && hit ? this.selectAshmereLandmark(hit.id) : Boolean(hit);
    }

    selectAshmereLandmark(id) {
      if (this.environment !== 'ashmere' || this.surface !== 'town') return false;
      const landmark = this.ashmereLandmarks.find(item => item.id === String(id || ''));
      if (!landmark || !root()?.querySelector('.ash100-town-ashmere')) return false;
      const panels = window.LegendWorldShellPanelsV170;
      if (typeof panels?.selectAshmerePoi !== 'function' || !panels.selectAshmerePoi(landmark.id)) return false;
      this.setHoveredAshmereLandmark(landmark.id);
      window.LegendWorldShellV170?.refresh?.();
      window.dispatchEvent(new CustomEvent('legend:ashmere-landmark-selected', {
        detail: { id: landmark.id, view: landmark.view }
      }));
      return true;
    }

    setLookTarget(clientX, clientY) {
      if (reducedMotion()) return;
      const width = Math.max(1, window.innerWidth || this.scale.width || 1600);
      const height = Math.max(1, window.innerHeight || this.scale.height || 900);
      this.lookTarget.x = Phaser.Math.Clamp(((Number(clientX) / width) - 0.5) * 2, -1, 1);
      this.lookTarget.y = Phaser.Math.Clamp(((Number(clientY) / height) - 0.5) * 2, -1, 1);
    }

    update(time, delta) {
      const reduced = reducedMotion();
      if (reduced !== this.motionReduced) {
        this.motionReduced = reduced;
        this.createAtmosphere(this.environment);
      }
      if (!this.background || !this.background.active) return;
      const size = this.dimensions();
      const motion = reduced ? 0 : 1;
      const follow = 1 - Math.exp(-Math.max(1, delta) / 520);
      this.lookCurrent.x = Phaser.Math.Linear(this.lookCurrent.x, this.lookTarget.x, follow);
      this.lookCurrent.y = Phaser.Math.Linear(this.lookCurrent.y, this.lookTarget.y, follow);
      const driftX = this.lookCurrent.x * size.width * 0.012 * motion;
      const driftY = this.lookCurrent.y * size.height * 0.009 * motion;
      const breathing = motion ? 1 + Math.sin(time * 0.00012) * 0.003 : 1;
      this.background.setPosition(size.width / 2 - driftX, size.height / 2 - driftY);
      if (this.backgroundIsImage) this.background.setScale(this.backgroundBaseScale * breathing);
    }

    addAtmosphereObject(object, u, v, depth) {
      object.setDepth(depth);
      object._legendU = u;
      object._legendV = v;
      this.ambienceObjects.push(object);
      return object;
    }

    clearAtmosphere() {
      this.ambienceObjects.forEach(object => {
        if (object && object.active) {
          this.tweens.killTweensOf(object);
          object.destroy();
        }
      });
      this.ambienceObjects = [];
    }

    createAtmosphere(environment) {
      this.clearAtmosphere();
      const size = this.dimensions();
      const key = String(environment || 'title').toLowerCase();
      const isBog = key === 'marsh' || key === 'reeds' || key.includes('greyfen');
      const isWet = key === 'marsh' || key === 'reeds';
      const isFire = key === 'camp' || key.includes('forge') || key.includes('inn');
      const isArcane = key.includes('archive') || key === 'cellar';
      const palette = isBog
        ? { haze: 0x8eaaa0, mote: 0xc6e8d0, glow: 0xa8e4cb, rain: 0x9bc9ce }
        : isFire
          ? { haze: 0xb77a4a, mote: 0xffd29b, glow: 0xffa957, rain: 0xffbf7a }
          : isArcane
            ? { haze: 0x7d91b5, mote: 0xd0dcff, glow: 0x9fc8e5, rain: 0xb3c8f0 }
            : { haze: 0xaeb9a3, mote: 0xe5d5ae, glow: 0xe3b969, rain: 0xd3c79f };
      const animate = !reducedMotion();

      // Broad, low-opacity haze adds depth without darkening the readable HTML layer.
      for (let i = 0; i < 3; i++) {
        const u = 0.14 + i * 0.34 + Phaser.Math.FloatBetween(-0.08, 0.08);
        const v = 0.24 + i * 0.23 + Phaser.Math.FloatBetween(-0.05, 0.05);
        const haze = this.add.ellipse(
          size.width * u,
          size.height * v,
          size.width * Phaser.Math.FloatBetween(0.28, 0.48),
          size.height * Phaser.Math.FloatBetween(0.045, 0.085),
          palette.haze,
          isBog ? 0.025 : 0.018
        );
        this.addAtmosphereObject(haze, u, v, -1);
        if (animate) {
          this.tweens.add({
            targets: haze,
            x: haze.x + Phaser.Math.Between(-size.width * 0.11, size.width * 0.11),
            y: haze.y + Phaser.Math.Between(-12, 12),
            alpha: isBog ? 0.042 : 0.03,
            scaleX: Phaser.Math.FloatBetween(1.12, 1.35),
            duration: Phaser.Math.Between(11500, 19000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: i * 850
          });
        }
      }

      // Soft local light pools make the painted locations feel less flat.
      for (let i = 0; i < 5; i++) {
        const u = 0.12 + i * 0.18;
        const v = 0.48 + (i % 2) * 0.2;
        const glow = this.add.circle(
          size.width * u,
          size.height * v,
          Phaser.Math.Between(34, isBog ? 82 : 68),
          palette.glow,
          isBog ? 0.035 : 0.026
        );
        this.addAtmosphereObject(glow, u, v, 0);
        if (animate) {
          this.tweens.add({
            targets: glow,
            alpha: isBog ? 0.075 : 0.056,
            scale: Phaser.Math.FloatBetween(1.18, 1.48),
            duration: Phaser.Math.Between(2600, 4600),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: i * 240
          });
        }
      }

      // Dust, fireflies and embers are intentionally lightweight Phaser game objects.
      const moteCount = isFire ? 16 : isBog ? 24 : 27;
      for (let i = 0; i < moteCount; i++) {
        const u = Phaser.Math.FloatBetween(0.025, 0.975);
        const v = Phaser.Math.FloatBetween(0.12, 0.91);
        const radius = isFire ? Phaser.Math.FloatBetween(1.1, 2.7) : Phaser.Math.FloatBetween(0.9, 2.3);
        const mote = this.add.circle(
          size.width * u,
          size.height * v,
          radius,
          palette.mote,
          isBog ? Phaser.Math.FloatBetween(0.09, 0.22) : Phaser.Math.FloatBetween(0.07, 0.18)
        );
        this.addAtmosphereObject(mote, u, v, isFire ? 3 : 2);
        if (animate) {
          const rise = isFire ? Phaser.Math.Between(50, 145) : Phaser.Math.Between(22, 92);
          this.tweens.add({
            targets: mote,
            x: mote.x + Phaser.Math.Between(-55, 55),
            y: mote.y - rise,
            alpha: Phaser.Math.FloatBetween(0.015, isBog ? 0.17 : 0.13),
            scale: Phaser.Math.FloatBetween(0.55, 1.5),
            duration: Phaser.Math.Between(isFire ? 2600 : 5200, isFire ? 6200 : 12500),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Phaser.Math.Between(0, 3800)
          });
        }
      }

      if (isBog) {
        for (let i = 0; i < 8; i++) {
          const u = Phaser.Math.FloatBetween(0.08, 0.92);
          const v = Phaser.Math.FloatBetween(0.44, 0.88);
          const halo = this.add.circle(size.width * u, size.height * v, 9, palette.glow, 0.055);
          const core = this.add.circle(size.width * u, size.height * v, 2.2, palette.mote, 0.62);
          this.addAtmosphereObject(halo, u, v, 3);
          this.addAtmosphereObject(core, u, v, 4);
          if (animate) {
            const destinationX = size.width * u + Phaser.Math.Between(-48, 48);
            const destinationY = size.height * v + Phaser.Math.Between(-34, 34);
            this.tweens.add({
              targets: [halo, core],
              x: destinationX,
              y: destinationY,
              duration: Phaser.Math.Between(3600, 6800),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
              delay: Phaser.Math.Between(0, 2200)
            });
            this.tweens.add({
              targets: halo,
              alpha: 0.012,
              scale: 1.75,
              duration: Phaser.Math.Between(1900, 3300),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
            this.tweens.add({
              targets: core,
              alpha: 0.18,
              scale: 0.72,
              duration: Phaser.Math.Between(1500, 2800),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }
      }

      if (isWet) {
        for (let i = 0; i < 17; i++) {
          const u = Phaser.Math.FloatBetween(0.03, 0.97);
          const v = Phaser.Math.FloatBetween(0.08, 0.78);
          const streak = this.add.rectangle(
            size.width * u,
            size.height * v,
            1,
            Phaser.Math.Between(12, 25),
            palette.rain,
            0.12
          );
          streak.setRotation(-0.16);
          this.addAtmosphereObject(streak, u, v, 3);
          if (animate) {
            this.tweens.add({
              targets: streak,
              y: streak.y + size.height * 0.18,
              alpha: 0.015,
              duration: Phaser.Math.Between(900, 1700),
              repeat: -1,
              ease: 'Linear',
              delay: Phaser.Math.Between(0, 1600),
              onRepeat: () => {
                if (streak.active) streak.y = -20;
              }
            });
          }
        }
      }

      if (isArcane) {
        for (let i = 0; i < 3; i++) {
          const u = 0.3 + i * 0.2;
          const v = 0.34 + (i % 2) * 0.19;
          const rune = this.add.circle(size.width * u, size.height * v, 18 + i * 5, 0x9fc8e5, 0);
          rune.setStrokeStyle(1, 0xc5dcfa, 0.16);
          this.addAtmosphereObject(rune, u, v, 4);
          if (animate) {
            this.trackServiceDressingTweenTarget(rune);
            this.tweens.add({
              targets: rune,
              scale: 1.65,
              alpha: 0.34,
              duration: 4200 + i * 500,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
              delay: i * 700
            });
          }
        }
      }
    }

    addServiceDressingObject(object, u, v, depth = 5) {
      object.setDepth(depth);
      object._legendU = u;
      object._legendV = v;
      this.serviceDressing.push({ object, u, v });
      return object;
    }

    trackServiceDressingTweenTarget(object) {
      if (object && !this.serviceDressingTweenTargets.includes(object)) this.serviceDressingTweenTargets.push(object);
      return object;
    }

    clearServiceDressing() {
      this.serviceDressingTweenTargets.forEach(object => this.tweens.killTweensOf(object));
      this.serviceDressingTweenTargets = [];
      this.serviceDressing.forEach(({ object }) => {
        if (!object) return;
        this.tweens.killTweensOf(object);
        if (object.active) object.destroy(true);
      });
      this.serviceDressing = [];
      this.serviceDressingKey = '';
    }

    layoutServiceDressing() {
      if (!this.serviceDressing.length) return;
      const size = this.dimensions();
      this.serviceDressing.forEach(({ object, u, v }) => {
        if (object?.active) object.setPosition(size.width * u, size.height * v);
      });
    }

    addServiceLantern(u, v, color) {
      const glow = this.add.ellipse(0, 3, 76, 106, color, 0.075);
      const chain = this.add.rectangle(0, -33, 1.5, 39, 0x40372a, 0.56);
      const cap = this.add.rectangle(0, -14, 19, 5, 0x6d5635, 0.92);
      const glass = this.add.rectangle(0, 1, 14, 22, 0x101a13, 0.92);
      glass.setStrokeStyle(1, 0xd4b46d, 0.76);
      const flame = this.add.ellipse(0, 1, 5, 11, color, 0.82);
      const lantern = this.add.container(0, 0, [glow, chain, cap, glass, flame]);
      this.addServiceDressingObject(lantern, u, v, 5);
      if (!reducedMotion()) {
        this.trackServiceDressingTweenTarget(glow);
        this.trackServiceDressingTweenTarget(flame);
        this.tweens.add({
          targets: glow,
          alpha: 0.13,
          scale: 1.18,
          duration: Phaser.Math.Between(1800, 2500),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        this.tweens.add({
          targets: flame,
          scaleY: 1.28,
          alpha: 0.52,
          duration: Phaser.Math.Between(520, 840),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      return lantern;
    }

    createServiceDressing(environment) {
      this.clearServiceDressing();
      const key = String(environment || '').toLowerCase();
      const greyfen = key.includes('greyfen');
      const isInn = key === 'inn' || key === 'greyfeninn';
      const isMarket = key === 'market' || key === 'greyfenmarket';
      const isForge = key === 'forge' || key === 'greyfenforge';
      const isArchive = key === 'archive' || key === 'greyfenarchive';
      if (!isInn && !isMarket && !isForge && !isArchive) return;
      this.serviceDressingKey = key;
      const warm = greyfen ? 0x9fc8ae : 0xe7b86d;
      const ember = greyfen ? 0x6ca897 : 0xe8793d;
      const animate = !reducedMotion();
      const size = this.dimensions();

      if (isInn) {
        // Two suspended lanterns give the painted inn interior a nearer foreground plane.
        this.addServiceLantern(0.17, 0.18, warm);
        this.addServiceLantern(0.83, 0.20, warm);
        const hearthGlow = this.add.ellipse(0, 0, size.width * 0.15, size.height * 0.085, ember, 0.055);
        this.addServiceDressingObject(hearthGlow, 0.78, 0.78, 1);
        if (animate) {
          this.trackServiceDressingTweenTarget(hearthGlow);
          this.tweens.add({
            targets: hearthGlow,
            alpha: 0.105,
            scale: 1.14,
            duration: 2300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }

      if (isMarket) {
        // Low-opacity cloth pennants frame the market stall without obscuring its art.
        const cloth = greyfen ? [0x456c63, 0x9a7950, 0x526d72] : [0x71503b, 0x8a7140, 0x3f664c];
        [0.29, 0.5, 0.71].forEach((u, i) => {
          const canopy = this.add.rectangle(0, 0, size.width * 0.12, 19, cloth[i], 0.28);
          canopy.setStrokeStyle(1, 0xc3a76b, 0.22);
          this.addServiceDressingObject(canopy, u, 0.14, 4);
          const tail = this.add.triangle(0, 0, -size.width * 0.035, -1, size.width * 0.035, -1, 0, 21, cloth[i], 0.23);
          this.addServiceDressingObject(tail, u, 0.157, 4);
        });
        this.addServiceLantern(0.5, 0.22, warm);
      }

      if (isForge) {
        // A contained forge mouth and anvil silhouette add a readable warm focal point.
        const forgeHalo = this.add.ellipse(0, 0, size.width * 0.16, size.height * 0.105, ember, 0.075);
        const forgeMouth = this.add.ellipse(0, 0, size.width * 0.065, size.height * 0.046, 0x8f3f24, 0.18);
        const forgeCore = this.add.ellipse(0, 0, size.width * 0.027, size.height * 0.026, 0xffc36d, 0.3);
        const forge = this.add.container(0, 0, [forgeHalo, forgeMouth, forgeCore]);
        this.addServiceDressingObject(forge, 0.79, 0.72, 3);
        const anvil = this.add.container(0, 0, [
          this.add.rectangle(0, 0, 78, 10, 0x172019, 0.54),
          this.add.rectangle(0, 8, 34, 10, 0x172019, 0.56),
          this.add.rectangle(0, 16, 58, 5, 0x172019, 0.46)
        ]);
        this.addServiceDressingObject(anvil, 0.78, 0.82, 4);
        if (animate) {
          this.trackServiceDressingTweenTarget(forgeHalo);
          this.trackServiceDressingTweenTarget(forgeCore);
          this.tweens.add({
            targets: forgeHalo,
            alpha: 0.15,
            scale: 1.19,
            duration: 1900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
          this.tweens.add({
            targets: forgeCore,
            alpha: 0.72,
            scale: 1.24,
            duration: 460,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
        for (let i = 0; i < 7; i++) {
          const u = 0.70 + Phaser.Math.FloatBetween(0, 0.17);
          const v = 0.54 + Phaser.Math.FloatBetween(0, 0.19);
          const spark = this.add.circle(0, 0, Phaser.Math.FloatBetween(1.3, 2.5), 0xffd18c, Phaser.Math.FloatBetween(0.35, 0.7));
          this.addServiceDressingObject(spark, u, v, 6);
          if (animate) {
            this.tweens.add({
              targets: spark,
              y: spark.y - Phaser.Math.Between(22, 72),
              alpha: 0.04,
              scale: 0.28,
              duration: Phaser.Math.Between(900, 1900),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeOut',
              delay: Phaser.Math.Between(0, 1400)
            });
          }
        }
      }

      if (isArchive) {
        [0.18, 0.82].forEach((u, i) => {
          const rune = this.add.circle(0, 0, 24 + i * 7, 0x9fbdd0, 0);
          rune.setStrokeStyle(1.2, 0xc7dced, 0.18);
          this.addServiceDressingObject(rune, u, 0.30 + i * 0.08, 4);
          if (animate) {
            this.tweens.add({
              targets: rune,
              scale: 1.42,
              alpha: 0.26,
              duration: 4200 + i * 600,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        });
      }
      this.layoutServiceDressing();
    }

    setEnvironment(name, immediate = false) {
      const key = ASSETS[name] ? name : 'title';
      if (key === this.environment && !immediate) return;
      this.environment = key;
      const size = this.dimensions();
      const texture = this.textures.exists(key) ? this.textures.get(key) : null;
      const source = texture?.getSourceImage?.();
      const hasImage = Boolean(source && source.width && source.height);
      const next = hasImage
        ? this.add.image(size.width / 2, size.height / 2, key)
        : this.add.rectangle(size.width / 2, size.height / 2, size.width, size.height, 0x101712);
      this.backgroundIsImage = hasImage;
      this.backgroundBaseScale = hasImage
        ? Math.max(size.width / source.width, size.height / source.height) * this.backgroundOverscan(size)
        : 1;
      next.setDepth(-3);
      next.setAlpha(immediate || reducedMotion() ? 1 : 0);

      const previous = this.background;
      this.background = next;
      if (previous && previous.active) {
        if (immediate || reducedMotion()) previous.destroy();
        else {
          this.tweens.add({
            targets: previous,
            alpha: 0,
            duration: 560,
            ease: 'Sine.easeIn',
            onComplete: () => previous.destroy()
          });
        }
      }

      this.createAtmosphere(key);
      this.createServiceDressing(key);
      this.layoutBackground();
      this.syncAshmereLandmarks();
      if (!immediate && !reducedMotion()) {
        const camera = this.cameras.main;
        camera.setZoom(1.018);
        this.tweens.add({
          targets: camera,
          zoom: 1,
          duration: 760,
          ease: 'Sine.easeOut'
        });
        this.tweens.add({
          targets: next,
          alpha: 1,
          duration: 720,
          ease: 'Sine.easeOut'
        });
      }
    }

    backgroundOverscan(size) {
      const aspect = size.width / Math.max(1, size.height);
      return aspect < 0.82 ? 1.028 : 1.065;
    }

    layoutBackground() {
      if (!this.background || !this.background.active) return;
      const size = this.dimensions();
      if (this.backgroundIsImage && this.background.texture) {
        const source = this.background.texture.getSourceImage();
        this.backgroundBaseScale = Math.max(
          size.width / Math.max(1, source.width),
          size.height / Math.max(1, source.height)
        ) * this.backgroundOverscan(size);
        this.background.setScale(this.backgroundBaseScale);
      } else {
        this.background.setSize(size.width, size.height);
      }
      this.background.setPosition(size.width / 2, size.height / 2);
      this.ambienceObjects.forEach(object => {
        if (object && object.active && Number.isFinite(object._legendU) && Number.isFinite(object._legendV)) {
          object.setPosition(size.width * object._legendU, size.height * object._legendV);
        }
      });
      this.layoutAshmereLandmarks();
      this.layoutServiceDressing();
      this.layoutServiceDressing();
    }

    pulse(kind) {
      if (reducedMotion()) return;
      const camera = this.cameras.main;
      const size = this.dimensions();
      const x = size.width * 0.5;
      const y = size.height * 0.48;
      if (kind === 'hit') {
        camera.shake(145, 0.0028);
        this.particleBurst(0xd7b47a, 8, x, y, 105);
      } else if (kind === 'heavy') {
        camera.shake(190, 0.0042);
        this.shockwave(0xe4bd76, x, y, 5.2);
        this.particleBurst(0xe4bd76, 15, x, y, 155);
      } else if (kind === 'guard') {
        camera.flash(115, 88, 132, 164, true);
        this.shockwave(0x9fc8e5, x, y, 4.4);
        this.particleBurst(0x9fc8e5, 7, x, y, 92);
      } else if (kind === 'magic') {
        camera.flash(165, 105, 151, 181, true);
        this.runeBurst(0x9fc8e5);
        this.particleBurst(0xb9d9f5, 18, x, y, 185);
      } else if (kind === 'swing') {
        camera.shake(82, 0.0012);
        this.slashBurst(x, y);
      } else if (kind === 'victory') {
        camera.flash(280, 197, 162, 91, true);
        this.shockwave(0xe2c17d, x, y, 6.4);
        this.runeBurst(0xe2c17d);
        this.particleBurst(0xe2c17d, 24, x, y, 230);
      }
    }

    shockwave(color, x, y, scale = 4) {
      const ring = this.add.circle(x, y, 22, color, 0);
      ring.setStrokeStyle(2, color, 0.78);
      ring.setDepth(6);
      this.tweens.add({
        targets: ring,
        scale,
        alpha: 0,
        duration: 520,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });
    }

    slashBurst(x, y) {
      const slash = this.add.rectangle(x, y, 128, 3, 0xe8d2a1, 0.82);
      slash.setDepth(7);
      slash.setRotation(-0.56);
      this.tweens.add({
        targets: slash,
        rotation: 0.62,
        scaleX: 0.08,
        alpha: 0,
        duration: 190,
        ease: 'Cubic.easeOut',
        onComplete: () => slash.destroy()
      });
      this.particleBurst(0xe8d2a1, 5, x, y, 72);
    }

    particleBurst(color, count, x, y, distance) {
      for (let i = 0; i < count; i++) {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const reach = Phaser.Math.FloatBetween(distance * 0.35, distance);
        const mote = this.add.circle(
          x + Math.cos(angle) * 18,
          y + Math.sin(angle) * 18,
          Phaser.Math.FloatBetween(1.5, 4.2),
          color,
          Phaser.Math.FloatBetween(0.58, 0.9)
        );
        mote.setDepth(7);
        this.tweens.add({
          targets: mote,
          x: x + Math.cos(angle) * reach,
          y: y + Math.sin(angle) * reach,
          alpha: 0,
          scale: 0.12,
          duration: Phaser.Math.Between(320, 680),
          ease: 'Cubic.easeOut',
          onComplete: () => mote.destroy()
        });
      }
    }

    runeBurst(color) {
      const size = this.dimensions();
      const centerX = size.width * 0.5;
      const centerY = size.height * 0.46;
      this.shockwave(color, centerX, centerY, 3.6);
      for (let i = 0; i < 9; i++) {
        const angle = Math.PI * 2 * i / 9;
        const startX = centerX + Math.cos(angle) * 34;
        const startY = centerY + Math.sin(angle) * 34;
        const mote = this.add.circle(startX, startY, 4 + (i % 3), color, 0.88);
        mote.setDepth(7);
        this.tweens.add({
          targets: mote,
          x: centerX + Math.cos(angle) * Phaser.Math.Between(115, 185),
          y: centerY + Math.sin(angle) * Phaser.Math.Between(85, 155),
          alpha: 0,
          scale: 0.15,
          duration: 520,
          ease: 'Sine.easeOut',
          onComplete: () => mote.destroy()
        });
      }
    }
  }

  function startPhaser() {
    if (game) return;
    if (!window.Phaser) {
      console.warn('Phaser could not be loaded; keeping the available HTML game interface active.');
      try { window.sessionStorage.removeItem(ENGINE_SESSION_KEY); } catch (_) {}
      document.documentElement.classList.remove('engine-intro-active');
      if (!IS_PROTOTYPE) document.body.classList.remove('legend-phaser-world-active');
      byId('engine-skip') && (byId('engine-skip').hidden = true);
      if (IS_PROTOTYPE) showTitle();
      observeRoot();
      if (IS_PROTOTYPE) window.__legendRebootReady = true;
      else {
        const bootScreen = byId('legend-boot-screen');
        if (bootScreen) bootScreen.hidden = true;
        document.body.classList.remove('legend-booting');
        window.__legendPhaserWorldReady = false;
      }
      toast('The world renderer could not load. The game remains available; refresh to retry the scene.');
      return;
    }
    try {
      game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game-container',
      backgroundColor: '#090e0d',
      width: 1600,
      height: 900,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: 1600,
        height: 900,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: { antialias: true, pixelArt: false, transparent: false },
      scene: [RealmScene],
      input: { keyboard: true, mouse: true, touch: true },
      audio: { noAudio: false }
      });
    } catch (error) {
      console.error('Phaser could not start.', error);
      document.documentElement.classList.remove('engine-intro-active');
      if (!IS_PROTOTYPE) document.body.classList.remove('legend-phaser-world-active');
      byId('engine-skip') && (byId('engine-skip').hidden = true);
      if (IS_PROTOTYPE) showTitle();
      observeRoot();
      if (IS_PROTOTYPE) window.__legendRebootReady = true;
      else {
        const bootScreen = byId('legend-boot-screen');
        if (bootScreen) bootScreen.hidden = true;
        document.body.classList.remove('legend-booting');
        window.__legendPhaserWorldReady = false;
      }
      toast('The world renderer could not start. The game interface remains available.');
      return;
    }
    let needsAwakening = true;
    try {
      needsAwakening = !window.sessionStorage.getItem(ENGINE_SESSION_KEY);
      if (needsAwakening) window.sessionStorage.setItem(ENGINE_SESSION_KEY, 'pending');
    } catch (_) {
      needsAwakening = true;
    }
    if (!needsAwakening) document.documentElement.classList.remove('engine-intro-active');

    game.events.once('ready', () => {
      realmScene = game.scene.getScene('RealmScene');
      realmScene?.setEnvironment('title', true);
      const finishStartup = () => {
        try { window.sessionStorage.setItem(ENGINE_SESSION_KEY, 'ready'); } catch (_) {}
        if (realmScene) realmScene.engineAwakened = true;
        document.documentElement.classList.remove('engine-intro-active');
        const skip = byId('engine-skip');
        if (skip) skip.hidden = true;
        engineReady = true;
        if (IS_PROTOTYPE) {
          showTitle();
          observeRoot();
          window.__legendRebootReady = true;
        } else {
          const bootScreen = byId('legend-boot-screen');
          if (bootScreen) bootScreen.hidden = true;
          document.body.classList.remove('legend-booting');
          observeRoot();
          window.__legendPhaserWorldReady = true;
          window.dispatchEvent(new CustomEvent('legend:phaser-world-ready'));
        }
      };
      if (needsAwakening && realmScene?.runEngineAwakening) {
        realmScene.runEngineAwakening(finishStartup);
      } else {
        finishStartup();
      }
    });
  }

  function bindHostActions() {
    byId('engine-skip')?.addEventListener('click', () => {
      if (realmScene?.awakeningActive) realmScene.finishEngineAwakening(true);
      else if (!realmScene?.engineAwakened) skipAwakeningRequested = true;
    });
    byId('soundToggle')?.addEventListener('click', () => setSound(!soundEnabled));
    root()?.addEventListener('click', event => {
      const button = event.target.closest('#strike, #heavy, #guard, #skill, #item, #poultice, #flee');
      if (!button || !window.__legendRebootBridge) return;
      const kind = button.id === 'strike' ? 'swing'
        : button.id === 'heavy' ? 'heavy'
        : button.id === 'guard' ? 'guard'
        : button.id === 'skill' ? 'magic'
        : button.id === 'flee' ? 'guard'
        : 'hit';
      window.__legendRebootBridge.pulse(kind);
    });
    const isInteractiveWorldControl = event => {
      const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement;
      return Boolean(target?.closest?.(
        'button, a, input, textarea, select, [role="button"], [data-world-action], ' +
        '[data-world-place], [data-ash-view], .lws-panel, .lws-hud, .lws-bottom-bar, ' +
        '#legend-world-shell-modal-root'
      ));
    };
    document.addEventListener('pointermove', event => {
      if (!isInteractiveWorldControl(event)) realmScene?.handleAshmerePointer?.(event.clientX, event.clientY, false);
    }, { passive: true });
    document.addEventListener('pointerup', event => {
      if (event.button !== 0 || isInteractiveWorldControl(event)) return;
      realmScene?.handleAshmerePointer?.(event.clientX, event.clientY, true);
    }, true);
    root()?.addEventListener('pointermove', event => {
      window.__legendRebootBridge?.lookAt?.(event.clientX, event.clientY);
    }, { passive: true });
    root()?.addEventListener('pointerleave', () => {
      window.__legendRebootBridge?.lookAt?.(window.innerWidth / 2, window.innerHeight / 2);
    }, { passive: true });
    window.addEventListener('resize', inferEnvironment, { passive: true });
  }

  window.LegendPhaserWorldV1 = Object.freeze({
    version: 'phaser-world-v1',
    mode: IS_PROTOTYPE ? 'preview' : 'production',
    get ready() { return engineReady; },
    get engine() { return game; },
    snapshot: () => realmScene ? window.__legendRebootBridge?.snapshot?.() || null : null,
    setEnvironment: (name, immediate = false) => setEnvironment(name, immediate),
    pulse: kind => realmScene?.pulse?.(kind),
    setSurface: surface => realmScene?.setSurface?.(surface),
    refreshHud: () => realmScene?.syncNativeHudUi?.(),
    refreshNavigation: () => realmScene?.syncNativeBottomBarUi?.(),
    refreshLeftDrawer: () => realmScene?.syncNativeLeftDrawerUi?.(),
    refreshRightDrawer: () => realmScene?.syncNativeRightDrawerUi?.(),
    refresh: () => inferEnvironment(),
    selectAshmereLandmark: id => realmScene?.selectAshmereLandmark?.(id) || false,
    get saveKey() { return SAVE_KEY; }
  });

  document.addEventListener('DOMContentLoaded', () => {
    settingsStorage?.applySettings?.(settingsStorage.loadSettings());
    bindHostActions();
    startPhaser();
  }, { once: true });
})();
