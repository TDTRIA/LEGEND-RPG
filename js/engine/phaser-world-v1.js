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
    document.documentElement.classList.add('legend-phaser-world-active', 'engine-intro-active');
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
    if (!IS_PROTOTYPE) return window.LegendStorage?.deleteSaves?.();
    activePlayer = null;
    try { localStorage.removeItem(SAVE_KEY); } catch (error) { console.warn(error); }
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
    ridge: 'assets/generated/locations/high-ridge.webp',
    reeds: 'assets/generated/locations/reed-cut.webp',
    camp: 'assets/generated/locations/roadside-camp.webp',
    greyfen: 'assets/generated/locations/greyfen-town.webp',
    marsh: 'assets/generated/locations/greyfen-marsh-walkway.webp',
    inn: 'assets/generated/locations/ashmere-inn.webp',
    market: 'assets/generated/locations/ashmere-market.webp',
    forge: 'assets/generated/locations/ashmere-forge.webp',
    archive: 'assets/generated/locations/ashmere-archive.webp',
    greyfenInn: 'assets/generated/locations/greyfen-inn.webp',
    greyfenMarket: 'assets/generated/locations/greyfen-market.webp',
    greyfenForge: 'assets/generated/locations/greyfen-forge.webp',
    greyfenArchive: 'assets/generated/locations/greyfen-archive.webp',
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
    else if (host.querySelector('.rpg-battle')) environment = 'road';
    else if (host.querySelector('.gss170-page')) environment = 'marsh';
    else if (host.querySelector('.gfm160-page')) environment = 'marsh';
    else if (host.querySelector('.bell-vault-banner, .bell-vault-room-card, .bell-vault-keeper-card')) environment = 'archive';
    else if (host.querySelector('.ash100-town-greyfen')) environment = 'greyfen';
    else if (host.querySelector('.ash100-town-ashmere')) environment = 'ashmere';
    else if (host.querySelector('.exp100-scene')) {
      const state = player?.flags?.roadExpeditionV100 || {};
      environment = Number(state.stage || 0) === 2 ? 'camp'
        : state.routeChoice === 'ridge' && Number(state.stage || 0) <= 1 ? 'ridge'
        : state.routeChoice === 'reeds' && Number(state.stage || 0) <= 1 ? 'reeds'
        : 'road';
    } else if (host.querySelector('.ash099, .reg100')) {
      environment = String(player?.currentRegion || 'Ashmere') === 'Greyfen' ? 'greyfen' : 'ashmere';
      const text = (host.textContent || '').toLowerCase();
      if (text.includes('workbench') || text.includes('crafting bench')) environment = environment === 'Greyfen' ? 'greyfenForge' : 'forge';
      else if (text.includes('trading post') || text.includes('market')) environment = environment === 'Greyfen' ? 'greyfenMarket' : 'market';
      else if (text.includes('archive')) environment = environment === 'Greyfen' ? 'greyfenArchive' : 'archive';
      else if (text.includes('inn')) environment = environment === 'Greyfen' ? 'greyfenInn' : 'inn';
    }
    setEnvironment(environment);
    inferSurface();
  }

  function inferSurface() {
    const host = root();
    if (!host || !realmScene?.setSurface) return;
    const modal = byId('legend-world-shell-modal-root');
    let surface = 'title';
    if (modal && !modal.hidden) surface = 'modal';
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
    if (surface !== currentSurface) {
      currentSurface = surface;
      realmScene.setSurface(surface);
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
      if (!affectsWorldSurface) return;
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
    }

    preload() {
      Object.keys(ASSETS).forEach(key => {
        if (['title','ashmere','road','ridge','reeds','camp','greyfen','marsh','inn','market','forge','archive','greyfenInn','greyfenMarket','greyfenForge','greyfenArchive'].includes(key)) {
          this.load.image(key, ASSETS[key]);
        }
      });
    }

    create() {
      this.cameras.main.setBackgroundColor('#090e0d');
      this.motionReduced = reducedMotion();
      this.scale.on('resize', () => this.layoutBackground());
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
          atmosphereCount: this.ambienceObjects.filter(item => item && item.active).length,
          parallaxEnabled: !reducedMotion(),
          engineAwakened: this.engineAwakened,
          surface: this.surface,
          surfaceTransitionCount: this.surfaceTransitionCount
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
      if (next === this.surface) return;
      const previous = this.surface;
      this.surface = next;
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
      const isFire = key === 'camp' || key.includes('forge');
      const isArcane = key.includes('archive');
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
      this.layoutBackground();
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
      byId('engine-skip') && (byId('engine-skip').hidden = true);
      if (IS_PROTOTYPE) showTitle();
      observeRoot();
      if (IS_PROTOTYPE) window.__legendRebootReady = true;
      else {
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
      byId('engine-skip') && (byId('engine-skip').hidden = true);
      if (IS_PROTOTYPE) showTitle();
      observeRoot();
      if (IS_PROTOTYPE) window.__legendRebootReady = true;
      else {
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
    get saveKey() { return SAVE_KEY; }
  });

  document.addEventListener('DOMContentLoaded', () => {
    settingsStorage?.applySettings?.(settingsStorage.loadSettings());
    bindHostActions();
    startPhaser();
  }, { once: true });
})();
