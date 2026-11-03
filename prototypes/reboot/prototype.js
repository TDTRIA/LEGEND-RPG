/* LEGEND Reboot — Phaser presentation + production gameplay adapter.
 * The prototype has its own local save key. All gameplay catalogs, rules, controllers,
 * town services, quests, dungeons and Greyfen systems are loaded from the current game.
 */
(() => {
  'use strict';

  const SAVE_KEY = 'legend-reboot-prototype-save-v1';
  const root = () => document.getElementById('root');
  const byId = id => document.getElementById(id);
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activePlayer = null;
  let game = null;
  let realmScene = null;
  let currentEnvironment = '';
  let soundEnabled = true;
  let ambientAudio = null;
  let observer = null;

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
    if (activePlayer) return activePlayer;
    activePlayer = normalize(safeRead());
    return activePlayer;
  }

  function savePlayer(player) {
    if (!player) return null;
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
    activePlayer = null;
    try { localStorage.removeItem(SAVE_KEY); } catch (error) { console.warn(error); }
  }

  // The production creation, town and road controllers expect these stable facades.
  // They are intentionally backed by the prototype's separate save key.
  window.LegendStorage = {
    loadPlayer,
    savePlayer,
    normalize,
    baseSkills: () => normalizer()?.baseSkills?.() || {}
  };
  window.LegendRuntimeV120 = {
    loadPlayer,
    savePlayer,
    returnToAshmere: () => window.LegendAshmereV099?.renderAshmere?.(),
    baseSkills: () => normalizer()?.baseSkills?.() || {},
    normalize
  };
  window.__legendRebootSaveKey = SAVE_KEY;

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
  }

  function observeRoot() {
    if (observer) observer.disconnect();
    const host = root();
    if (!host || !window.MutationObserver) return;
    observer = new MutationObserver(() => inferEnvironment());
    observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    inferEnvironment();
  }

  function showTitle() {
    const player = loadPlayer();
    const hasSave = Boolean(player);
    const escapedName = hasSave ? String(player.username || 'Traveler').replace(/[&<>"']/g, '') : '';
    root().innerHTML =
      '<section class="mode active" id="title-panel" aria-labelledby="title-heading">' +
        '<div class="title-block">' +
          '<div class="eyebrow">A dark-fantasy role-playing adventure</div>' +
          '<h1 id="title-heading">LEGEND</h1>' +
          '<p class="subtitle">The Awakening</p>' +
          '<p class="tagline">The roads remember. The realm is waking.</p>' +
          (hasSave ? '<p class="save-summary">Continue as <strong>' + escapedName + '</strong> · Level ' + Number(player.level || 1) + ' · ' + String(player.currentRegion || 'Ashmere') + '</p>' : '') +
          '<div class="menu-row">' +
            (hasSave ? '<button class="primary" id="continueButton" type="button">Continue Journey</button>' : '') +
            '<button class="primary" id="beginButton" type="button">' + (hasSave ? 'Begin a New Journey' : 'Begin Your Journey') + '</button>' +
          '</div>' +
          '<p class="title-note">A standalone Phaser prototype using the current game’s authored content and systems.</p>' +
        '</div>' +
        '<span class="disclaimer">Prototype save is separate from the production game.</span>' +
      '</section>';
    if (hasSave) byId('continueButton')?.addEventListener('click', continueJourney);
    byId('beginButton')?.addEventListener('click', beginJourney);
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
      this.mist = [];
      this.lights = [];
      this.environment = '';
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
      this.createAtmosphere();
      this.scale.on('resize', () => this.layoutBackground());
      this.setEnvironment('title', true);
      this.input.keyboard?.on('keydown', event => {
        if (event.key === 'Escape' && currentEnvironment === 'title') showTitle();
      });
      realmScene = this;
      window.__legendRebootBridge = {
        setEnvironment: (name, immediate) => this.setEnvironment(name, immediate),
        pulse: kind => this.pulse(kind),
        flash: (color, duration) => this.cameras.main.flash(duration || 240, color?.r || 188, color?.g || 155, color?.b || 92)
      };
    }

    dimensions() {
      return { width: this.scale.width || 1600, height: this.scale.height || 900 };
    }

    createAtmosphere() {
      const size = this.dimensions();
      for (let i = 0; i < 12; i++) {
        const x = Phaser.Math.Between(0, size.width);
        const y = Phaser.Math.Between(0, size.height);
        const radius = Phaser.Math.FloatBetween(1.1, 3.4);
        const mote = this.add.circle(x, y, radius, 0xd7c79d, Phaser.Math.FloatBetween(0.08, 0.24));
        mote.setDepth(3);
        this.mist.push(mote);
        this.tweens.add({
          targets: mote,
          x: x + Phaser.Math.Between(-90, 90),
          y: y - Phaser.Math.Between(24, 120),
          alpha: 0.015,
          duration: Phaser.Math.Between(6000, 13000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: Phaser.Math.Between(0, 2500)
        });
      }
      for (let i = 0; i < 5; i++) {
        const x = size.width * (0.12 + i * 0.18);
        const y = size.height * (0.72 + (i % 2) * 0.05);
        const light = this.add.circle(x, y, Phaser.Math.Between(4, 8), 0xe3b969, 0.11);
        light.setDepth(2);
        this.lights.push(light);
        this.tweens.add({
          targets: light,
          alpha: 0.025,
          scale: 1.7,
          duration: 1900 + i * 330,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    setEnvironment(name, immediate = false) {
      const key = ASSETS[name] ? name : 'title';
      if (key === this.environment && !immediate) return;
      this.environment = key;
      const size = this.dimensions();
      const texture = this.textures.exists(key) ? this.textures.get(key) : null;
      if (!texture) {
        if (this.background) this.background.destroy();
        this.background = this.add.rectangle(size.width / 2, size.height / 2, size.width, size.height, 0x101712);
        this.background.setDepth(-2);
        return;
      }
      const source = texture.getSourceImage();
      const scale = Math.max(size.width / Math.max(1, source.width), size.height / Math.max(1, source.height));
      const next = this.add.image(size.width / 2, size.height / 2, key);
      next.setScale(scale);
      next.setDepth(-3);
      next.setAlpha(immediate || reducedMotion() ? 1 : 0);
      if (this.background) {
        const previous = this.background;
        if (immediate || reducedMotion()) previous.destroy();
        else {
          this.tweens.add({
            targets: previous,
            alpha: 0,
            duration: 520,
            onComplete: () => previous.destroy()
          });
        }
      }
      this.background = next;
      if (!immediate && !reducedMotion()) {
        this.cameras.main.fadeIn(520, 4, 7, 6);
        this.tweens.add({
          targets: next,
          alpha: 1,
          duration: 680,
          ease: 'Sine.easeOut'
        });
      }
      this.layoutBackground();
    }

    layoutBackground() {
      if (!this.background || !this.background.active || !this.background.texture) return;
      const size = this.dimensions();
      const source = this.background.texture.getSourceImage();
      const scale = Math.max(size.width / Math.max(1, source.width), size.height / Math.max(1, source.height));
      this.background.setPosition(size.width / 2, size.height / 2);
      this.background.setScale(scale);
      this.mist.forEach((mote, index) => {
        if (mote && mote.active) mote.setPosition((size.width * ((index * 0.137 + 0.11) % 0.9)), size.height * ((index * 0.191 + 0.2) % 0.8));
      });
    }

    pulse(kind) {
      const camera = this.cameras.main;
      if (kind === 'hit') camera.shake(165, 0.003);
      else if (kind === 'heavy') camera.shake(120, 0.0026);
      else if (kind === 'guard') camera.flash(120, 88, 132, 164, true);
      else if (kind === 'magic') {
        camera.flash(170, 105, 151, 181, true);
        this.runeBurst(0x9fc8e5);
      } else if (kind === 'swing') camera.shake(80, 0.0011);
      else if (kind === 'victory') {
        camera.flash(330, 197, 162, 91, true);
        this.runeBurst(0xe2c17d);
      }
    }

    runeBurst(color) {
      const size = this.dimensions();
      const centerX = size.width * 0.5;
      const centerY = size.height * 0.46;
      for (let i = 0; i < 7; i++) {
        const angle = Math.PI * 2 * i / 7;
        const startX = centerX + Math.cos(angle) * 34;
        const startY = centerY + Math.sin(angle) * 34;
        const mote = this.add.circle(startX, startY, 4 + (i % 3), color, 0.88);
        mote.setDepth(6);
        this.tweens.add({
          targets: mote,
          x: centerX + Math.cos(angle) * Phaser.Math.Between(110, 165),
          y: centerY + Math.sin(angle) * Phaser.Math.Between(85, 145),
          alpha: 0,
          scale: 0.15,
          duration: reducedMotion() ? 1 : 460,
          ease: 'Sine.easeOut',
          onComplete: () => mote.destroy()
        });
      }
    }
  }

  function startPhaser() {
    if (!window.Phaser || game) return;
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
    game.events.once('ready', () => {
      window.__legendRebootReady = true;
      realmScene = game.scene.getScene('RealmScene');
      realmScene?.setEnvironment('title', true);
      showTitle();
      observeRoot();
    });
  }

  function bindHostActions() {
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
    window.addEventListener('resize', inferEnvironment, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindHostActions();
    startPhaser();
  }, { once: true });
})();
