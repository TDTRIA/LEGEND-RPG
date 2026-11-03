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
      this.scale.on('resize', () => this.layoutBackground());
      this.input.keyboard?.on('keydown', event => {
        if (event.key === 'Escape' && currentEnvironment === 'title') showTitle();
      });
      realmScene = this;
      window.__legendRebootBridge = {
        version: 'phaser-atmosphere-v2',
        setEnvironment: (name, immediate) => this.setEnvironment(name, immediate),
        pulse: kind => this.pulse(kind),
        lookAt: (x, y) => this.setLookTarget(x, y),
        snapshot: () => ({
          environment: this.environment,
          atmosphereCount: this.ambienceObjects.filter(item => item && item.active).length,
          parallaxEnabled: !reducedMotion()
        }),
        flash: (color, duration) => {
          if (reducedMotion()) return;
          this.cameras.main.flash(duration || 240, color?.r || 188, color?.g || 155, color?.b || 92);
        }
      };
      this.setEnvironment('title', true);
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
      if (!this.background || !this.background.active) return;
      const size = this.dimensions();
      const motion = reducedMotion() ? 0 : 1;
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
        if (object && object.active) object.destroy();
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
        ? Math.max(size.width / source.width, size.height / source.height) * 1.065
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

    layoutBackground() {
      if (!this.background || !this.background.active) return;
      const size = this.dimensions();
      if (this.backgroundIsImage && this.background.texture) {
        const source = this.background.texture.getSourceImage();
        this.backgroundBaseScale = Math.max(
          size.width / Math.max(1, source.width),
          size.height / Math.max(1, source.height)
        ) * 1.065;
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
    root()?.addEventListener('pointermove', event => {
      window.__legendRebootBridge?.lookAt?.(event.clientX, event.clientY);
    }, { passive: true });
    root()?.addEventListener('pointerleave', () => {
      window.__legendRebootBridge?.lookAt?.(window.innerWidth / 2, window.innerHeight / 2);
    }, { passive: true });
    window.addEventListener('resize', inferEnvironment, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindHostActions();
    startPhaser();
  }, { once: true });
})();
