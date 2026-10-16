(() => {
  'use strict';

  const ASSET = '../../assets/';
  const ASSETS = {
    title: ASSET + 'generated/title/title-ashmere-road.webp',
    ash: ASSET + 'generated/locations/ashmere-town.webp',
    road: ASSET + 'generated/locations/old-road-south-fork.webp',
    greyfen: ASSET + 'generated/locations/greyfen-town.webp',
    storm: ASSET + 'images/backgrounds/eerie_medieval_village_under_stormy_skies.png',
    ruins: ASSET + 'images/backgrounds/gothic_ruins_beneath_a_stormy_sky.png',
    library: ASSET + 'images/backgrounds/gothic_library_of_arcane_secrets.png',
    swamp: ASSET + 'images/backgrounds/goblin_in_a_haunted_swamp_path.png',
    hero: ASSET + 'generated/classes/class-adventurer.webp',
    warrior: ASSET + 'generated/classes/class-warrior.webp',
    ranger: ASSET + 'generated/classes/class-ranger.webp',
    mage: ASSET + 'generated/classes/class-mage.webp',
    thief: ASSET + 'generated/classes/class-thief.webp',
    skiller: ASSET + 'generated/classes/class-skiller.webp',
    goblin: ASSET + 'generated/enemies/road-goblin.webp',
    wolf: ASSET + 'generated/enemies/blackroot-wolf.webp',
    wisp: ASSET + 'generated/enemies/lantern-wisp.webp',
    ambience: ASSET + 'audio/title/ashmere_ambience_loop.wav',
    hit: ASSET + 'audio/battle/battle_hit.wav',
    swing: ASSET + 'audio/battle/battle_swing.wav',
    magic: ASSET + 'audio/battle/battle_magic.wav',
    guard: ASSET + 'audio/battle/battle_guard.wav',
    victory: ASSET + 'audio/battle/battle_victory.wav',
    confirm: ASSET + 'audio/ui/ui_confirm_gate.wav'
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const panels = {
    title: $('#title-panel'),
    cinematic: $('#cinematic-panel'),
    exploration: $('#exploration-panel'),
    combat: $('#combat-panel'),
    training: $('#training-panel'),
    debrief: $('#debrief-panel')
  };

  let scene = null;
  let currentMode = 'title';
  let soundEnabled = false;
  let trainingRank = 0;
  const gameData = () => window.LegendRebootData || {};
  const selectedClass = () => $('#classChoice')?.value || 'Adventurer';
  const selectedClassStats = () => gameData().classStats?.(selectedClass()) || { name: 'Adventurer', maxHp: 100, hp: 100, gold: 100, mods: {}, move: 'Strike' };
  function updateClassSummary() {
    const c = selectedClassStats();
    const mods = Object.entries(c.mods || {}).map(([key, value]) => key + ' +' + value).join(' · ') || 'Balanced attributes';
    const summary = $('#classSummary');
    if (summary) summary.textContent = c.maxHp + ' HP · ' + c.gold + ' starting Bells · ' + mods + ' · Technique: ' + c.move;
  }
  let chosenRunes = [];
  const intendedPattern = ['TIDE', 'EMBER', 'ROOT'];
  let toastHandle = null;

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    if (toastHandle) window.clearTimeout(toastHandle);
    toastHandle = window.setTimeout(() => element.classList.remove('show'), 1700);
  }

  function setMode(mode) {
    currentMode = mode;
    Object.entries(panels).forEach(([key, panel]) => {
      panel.classList.toggle('active', key === mode);
      panel.setAttribute('aria-hidden', key !== mode ? 'true' : 'false');
    });
  }

  function setBattleLog(title, message) {
    $('#battleHeading').textContent = title;
    $('#battleLog').textContent = message;
  }

  function updateBars() {
    if (!scene || !scene.battle) return;
    const b = scene.battle;
    $('#heroHpText').textContent = Math.max(0, b.hp) + ' / ' + b.maxHp;
    $('#heroMpText').textContent = Math.max(0, b.mp) + ' / ' + b.maxMp;
    $('#heroHpBar').style.width = Math.max(0, b.hp / Math.max(1, b.maxHp) * 100) + '%';
    $('#heroMpBar').style.width = Math.max(0, b.mp / Math.max(1, b.maxMp) * 100) + '%';
    $$('[data-battle]').forEach(button => {
      button.disabled = b.busy || b.hp <= 0 || b.enemyHp <= 0 ||
        (button.dataset.battle === 'spell' && b.mp < 10);
    });
  }

  function showMode(mode) {
    if (!scene || !scene.ready) {
      toast('The scene is still loading. Try again in a moment.');
      return;
    }
    scene.stopModeEffects();
    setMode(mode);
    if (mode === 'title') {
      scene.showBackdrop('title');
      scene.clearBattle();
      scene.resetExplorationState();
      scene.soundscape();
    } else if (mode === 'exploration') {
      scene.enterExploration();
    } else if (mode === 'combat') {
      scene.enterCombat();
    } else if (mode === 'training') {
      scene.enterTraining();
    } else if (mode === 'debrief') {
      scene.showDebrief();
    }
  }

  function endCinematic() {
    if (!scene) return;
    scene.stopCinematic();
    showMode('exploration');
    toast('The journey begins · explore the Old Road');
  }

  function startCinematic() {
    if (!scene || !scene.ready) {
      toast('The scene is still loading. Try again in a moment.');
      return;
    }
    setMode('cinematic');
    $('#skipCinematic').hidden = false;
    $('#cinematicNext').hidden = true;
    scene.startCinematic();
  }

  function chooseRune(rune) {
    if (currentMode !== 'training' || chosenRunes.length >= intendedPattern.length) return;
    chosenRunes.push(rune);
    $('#trainingResult').textContent = 'Your pattern: ' + chosenRunes.join(' → ');
    if (scene) scene.pulseRune(rune);
  }

  function testRunes() {
    if (chosenRunes.length !== intendedPattern.length) {
      $('#trainingResult').textContent = 'The circle is incomplete. Choose three marks first.';
      return;
    }
    const success = chosenRunes.every((rune, i) => rune === intendedPattern[i]);
    if (success) {
      trainingRank += 1;
      $('#trainingRank').textContent = String(trainingRank);
      $('#trainingResult').textContent = 'The current holds. Rune Craft mastery +1 (prototype only).';
      if (scene) scene.runeSuccess();
      toast('Pattern held · Rune Craft +1');
    } else {
      $('#trainingResult').textContent = 'The pattern breaks apart. No punishment—reset and try again.';
      if (scene) scene.runeFailure();
    }
  }

  window.LegendRebootPrototype = {
    title: () => showMode('title'),
    combat: () => showMode('combat'),
    training: () => showMode('training'),
    exploration: () => showMode('exploration'),
    interact: () => { if (scene) scene.interactNearby(); },
    getExplorationState: () => scene?.explorationState || null,
    returnToAshmere: () => showMode('debrief'),
    begin: startCinematic
  };

  $('#classChoice')?.addEventListener('change', updateClassSummary);
  updateClassSummary();
  $('#beginButton').addEventListener('click', startCinematic);
  $('#combatButton').addEventListener('click', () => showMode('combat'));
  $('#runeButton').addEventListener('click', () => showMode('training'));
  $('#skipCinematic').addEventListener('click', endCinematic);
  $('#cinematicNext').addEventListener('click', () => showMode('title'));
  $('#interactButton').addEventListener('click', () => { if (scene) scene.interactNearby(); });
  $('#returnAshmereButton').addEventListener('click', () => showMode('debrief'));
  $('#debriefBackButton').addEventListener('click', () => showMode('title'));
  $('#battleContinue').addEventListener('click', () => {
    if (scene && scene.battle && scene.battle.isScoutEncounter) showMode('exploration');
    else showMode('title');
  });
  $('.rune-choice').forEach(button => button.addEventListener('click', () => chooseRune(button.dataset.rune)));
  $('#testRune').addEventListener('click', testRunes);
  $('#resetRune').addEventListener('click', () => {
    chosenRunes = [];
    $('#trainingResult').textContent = 'Pattern cleared. Study the sequence, then try again.';
  });
  $('#soundToggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('#soundToggle').textContent = soundEnabled ? 'SOUND: ON' : 'SOUND: OFF';
    $('#soundToggle').setAttribute('aria-pressed', String(soundEnabled));
    if (scene) scene.setSoundEnabled(soundEnabled);
  });
  $$('[data-battle]').forEach(button => button.addEventListener('click', () => {
    if (scene) scene.takeBattleAction(button.dataset.battle);
  }));

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      showMode('title');
      return;
    }
    if (currentMode === 'exploration' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(event.key)) {
      event.preventDefault();
    }
    if (currentMode === 'exploration' && (event.key.toLowerCase() === 'e' || event.key === 'Enter')) {
      event.preventDefault();
      if (scene) scene.interactNearby();
      return;
    }
    if (currentMode === 'combat' && ['1', '2', '3', '4'].includes(event.key)) {
      const action = ({ '1': 'attack', '2': 'guard', '3': 'spell', '4': 'retreat' })[event.key];
      if (scene) scene.takeBattleAction(action);
    }
  });

  if (typeof Phaser === 'undefined') {
    $('#game-container').innerHTML = '<div style="padding:24px;color:#e2d3ae;font:14px system-ui">Phaser did not load. Check the browser connection to the pinned Phaser CDN.</div>';
    toast('Could not load the game framework.');
    return;
  }

  class RebootScene extends Phaser.Scene {
    constructor() {
      super({ key: 'RebootScene' });
      this.ready = false;
      this.backdrop = null;
      this.backdropTween = null;
      this.modeTweens = [];
      this.soundNodes = {};
      this.battle = null;
      this.heroArt = null;
      this.enemyArt = null;
      this.heroOrigin = { x: 390, y: 440 };
      this.enemyOrigin = { x: 1200, y: 420 };
      this.runeRings = [];
      this.trainingGlyphs = [];
      this.cinematicEvents = [];
      this.cinematicIndex = 0;
      this.cinematicRunning = false;
      this.explorationState = null;
      this.explorePlayer = null;
      this.exploreShadow = null;
      this.exploreMarkerVisuals = [];
      this.exploreKeys = null;
      this.exploreStamina = 100;
      this.exploreStepElapsed = 0;
    }

    preload() {
      Object.entries(ASSETS).forEach(([key, path]) => {
        const isAudio = ['ambience', 'hit', 'swing', 'magic', 'guard', 'victory', 'confirm'].includes(key);
        if (isAudio) this.load.audio(key, path);
        else this.load.image(key, path);
      });
      this.load.on('loaderror', file => console.warn('[LEGEND prototype] Asset failed to load:', file.key, file.src));
    }

    create() {
      this.ready = true;
      scene = this;
      this.showBackdrop('title');
      this.scale.on('resize', () => this.resizeCurrentScene());
      this.exploreKeys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT');
      this.soundscape();
      window.__legendRebootReady = true;
      window.dispatchEvent(new CustomEvent('legend-reboot-prototype-ready'));
    }

    update(time, delta) {
      if (currentMode !== 'exploration' || !this.explorationState || !this.explorePlayer || !this.explorePlayer.active) return;
      const keys = this.exploreKeys || {};
      let dx = (keys.D && keys.D.isDown ? 1 : 0) - (keys.A && keys.A.isDown ? 1 : 0);
      let dy = (keys.S && keys.S.isDown ? 1 : 0) - (keys.W && keys.W.isDown ? 1 : 0);
      dx += (keys.RIGHT && keys.RIGHT.isDown ? 1 : 0) - (keys.LEFT && keys.LEFT.isDown ? 1 : 0);
      dy += (keys.DOWN && keys.DOWN.isDown ? 1 : 0) - (keys.UP && keys.UP.isDown ? 1 : 0);
      const frameMs = Math.min(delta || 16, 50);
      const sprinting = Boolean(keys.SHIFT && keys.SHIFT.isDown && (dx || dy) && this.exploreStamina > 0);
      if (sprinting) this.exploreStamina = Math.max(0, this.exploreStamina - frameMs * .035);
      else this.exploreStamina = Math.min(100, this.exploreStamina + frameMs * .018);
      if (dx || dy) {
        const length = Math.hypot(dx, dy) || 1;
        const distance = (sprinting ? 390 : 220) * frameMs / 1000;
        this.exploreStepElapsed += frameMs;
        if (this.exploreStepElapsed > (sprinting ? 175 : 290)) {
          this.exploreStepElapsed = 0;
          if (this.explorePlayer && this.explorePlayer.active) {
            this.tweens.add({ targets: this.explorePlayer, scaleY: this.explorePlayer.scaleY * .94, duration: 65, yoyo: true, ease: 'Sine.easeOut' });
          }
        }
        const { width, height } = this.dimensions();
        this.explorationState.playerX = Phaser.Math.Clamp(this.explorationState.playerX + dx / length * distance / width, .06, .94);
        this.explorationState.playerY = Phaser.Math.Clamp(this.explorationState.playerY + dy / length * distance / height, .39, .82);
        this.layoutExploration();
      } else if (this.explorePlayer.active && this.explorationState) {
        this.explorePlayer.y = this.explorationState.playerY * this.dimensions().height + Math.sin(time / 180) * 1.5;
      }
      this.exploreUiElapsed = (this.exploreUiElapsed || 0) + (delta || 16);
      if (this.exploreUiElapsed >= 100) {
        this.exploreUiElapsed = 0;
        this.updateExplorationUI();
      }
    }

    dimensions() {
      return { width: this.scale.width || 1600, height: this.scale.height || 900 };
    }

    createCover(key, alpha = 1) {
      const { width, height } = this.dimensions();
      const image = this.add.image(width / 2, height / 2, key);
      const factor = Math.max(width / image.width, height / image.height);
      image.setScale(factor).setAlpha(alpha);
      image.setData('coverFactor', factor);
      return image;
    }

    showBackdrop(key) {
      if (!this.textures.exists(key)) return;
      const prior = this.backdrop;
      const next = this.createCover(key, prior ? 0 : 1);
      this.backdrop = next;
      const { width, height } = this.dimensions();
      this.backdropTween = this.tweens.add({
        targets: next,
        scale: next.getData('coverFactor') * 1.045,
        x: width / 2 - width * .01,
        y: height / 2 + height * .006,
        duration: 14500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      if (prior) {
        this.tweens.add({ targets: next, alpha: 1, duration: 680, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: prior, alpha: 0, duration: 680, ease: 'Sine.easeInOut', onComplete: () => prior.destroy() });
      }
    }

    stopModeEffects() {
      this.cinematicRunning = false;
      this.cinematicEvents.forEach(event => event.remove(false));
      this.cinematicEvents = [];
      this.modeTweens.forEach(tween => tween.stop());
      this.modeTweens = [];
      this.clearBattle();
      this.runeRings.forEach(ring => ring.destroy());
      this.runeRings = [];
      this.trainingGlyphs.forEach(glyph => glyph.destroy());
      this.trainingGlyphs = [];
      this.clearExplorationGraphics();
    }

    resizeCurrentScene() {
      if (this.backdrop && this.backdrop.active) {
        const { width, height } = this.dimensions();
        const factor = Math.max(width / this.backdrop.width, height / this.backdrop.height);
        this.backdrop.setPosition(width / 2, height / 2);
        this.backdrop.setScale(factor);
        this.backdrop.setData('coverFactor', factor);
      }
      if (currentMode === 'combat') this.placeBattleActors();
      if (currentMode === 'exploration') this.layoutExploration();
    }

    setSoundEnabled(enabled) {
      if (!this.cache.audio.exists('ambience')) return;
      if (enabled) {
        if (!this.soundNodes.ambience) {
          this.soundNodes.ambience = this.sound.add('ambience', { loop: true, volume: .22 });
        }
        if (!this.soundNodes.ambience.isPlaying) this.soundNodes.ambience.play();
      } else if (this.soundNodes.ambience) {
        this.soundNodes.ambience.stop();
      }
    }

    soundscape() {
      this.setSoundEnabled(soundEnabled);
    }

    sfx(key, volume = .6) {
      if (!soundEnabled || !this.cache.audio.exists(key)) return;
      this.sound.play(key, { volume });
    }

    startCinematic() {
      this.stopModeEffects();
      this.resetExplorationState();
      this.cinematicRunning = true;
      this.cinematicIndex = 0;
      const beats = [
        { key: 'storm', chapter: 'Prologue · The Veil Stirs', line: 'In every age, people have begged the world to give back what it takes.' },
        { key: 'library', chapter: 'The forbidden art', line: 'A healer learned to hold a dying voice—and mistook the echo for a miracle.' },
        { key: 'ruins', chapter: 'What the dead leave behind', line: 'The ritual did not return the dead. It left the living to answer their footsteps.' },
        { key: 'swamp', chapter: 'The old places wake', line: 'Now magic stirs in places the old kingdoms buried. Something below is listening.' },
        { key: 'road', chapter: 'Beyond the last safe mile', line: 'The roads still lead somewhere. Whether it should be reached is another matter.' }
      ];
      const playBeat = index => {
        if (!this.cinematicRunning) return;
        this.cinematicIndex = index;
        const beat = beats[index];
        $('#cinematicChapter').textContent = beat.chapter;
        $('#cinematicLine').textContent = beat.line;
        this.showBackdrop(beat.key);
        if (index === 2) this.cameras.main.shake(260, .0014);
        if (index < beats.length - 1) {
          this.cinematicEvents.push(this.time.delayedCall(3700, () => playBeat(index + 1)));
        } else {
          this.cinematicEvents.push(this.time.delayedCall(3900, () => endCinematic()));
        }
      };
      playBeat(0);
    }

    stopCinematic() {
      this.cinematicRunning = false;
      this.cinematicEvents.forEach(event => event.remove(false));
      this.cinematicEvents = [];
    }

    fitArtwork(image, maxWidth, maxHeight) {
      const factor = Math.min(maxWidth / image.width, maxHeight / image.height);
      image.setScale(factor);
    }

    enterCombat() {
      this.stopModeEffects();
      const isScoutEncounter = Boolean(this.explorationState && this.explorationState.scoutEngaged && !this.explorationState.scoutDefeated);
      const character = selectedClassStats();
      const enemy = (gameData().enemies || []).find(item => item.id === 'goblin') || { name: 'Road Goblin', hp: [24, 38], damage: [3, 8], text: 'A road goblin slips from the brush.' };
      const range = enemy.hp || [30, 40];
      this.battle = { hp: character.maxHp, maxHp: character.maxHp, mp: 30, maxMp: 30, enemyHp: isScoutEncounter ? 68 : Phaser.Math.Between(range[0], range[1]), enemyMaxHp: isScoutEncounter ? 68 : range[1], enemyDamage: enemy.damage || [3, 8], enemyName: isScoutEncounter ? 'Goblin Scout' : enemy.name, busy: false, guarding: false, finished: false, isScoutEncounter, character };
      $('#battleContinue').hidden = true;
      this.showBackdrop('road');
      this.placeBattleActors();
      setBattleLog(
        isScoutEncounter ? 'A goblin scout blocks the road' : (this.battle.enemyName || 'A road-goblin blocks the pass'),
        isScoutEncounter ? 'The scout carries a charcoal mark used to signal a larger warband.' : ((enemy.text || 'It watches your hands. It has not committed to an attack yet.') + ' Your ' + character.name + ' training shapes your strength and technique.')
      );
      updateBars();
    }

    placeBattleActors() {
      if (currentMode !== 'combat' || !this.battle) return;
      const { width, height } = this.dimensions();
      const heroX = width * .28;
      const enemyX = width * .73;
      const actorY = height * .52;
      if (!this.heroArt || !this.heroArt.active) {
        this.heroArt = this.add.image(heroX, actorY, 'hero');
      }
      if (!this.enemyArt || !this.enemyArt.active) {
        this.enemyArt = this.add.image(enemyX, actorY, 'goblin');
      }
      this.heroOrigin = { x: heroX, y: actorY };
      this.enemyOrigin = { x: enemyX, y: actorY };
      this.heroArt.setTexture(({ Adventurer: 'hero', Warrior: 'warrior', Ranger: 'ranger', Mage: 'mage', Thief: 'thief', Skiller: 'skiller' })[selectedClass()] || 'hero');
      this.enemyArt.setTexture('goblin');
      this.heroArt.setPosition(heroX, actorY);
      this.enemyArt.setPosition(enemyX, actorY);
      this.fitArtwork(this.heroArt, width * .25, height * .52);
      this.fitArtwork(this.enemyArt, width * .22, height * .42);
      this.heroArt.setAlpha(1).clearTint();
      this.enemyArt.setAlpha(1).clearTint();
    }

    clearBattle() {
      if (this.heroArt && this.heroArt.active) this.heroArt.destroy();
      if (this.enemyArt && this.enemyArt.active) this.enemyArt.destroy();
      this.heroArt = null;
      this.enemyArt = null;
      this.battle = null;
    }

    takeBattleAction(action) {
      const b = this.battle;
      if (currentMode !== 'combat' || !b || b.busy || b.finished || b.hp <= 0 || b.enemyHp <= 0) return;
      b.busy = true;
      updateBars();
      if (action === 'retreat') {
        this.sfx('confirm');
        const returnToRoad = Boolean(b.isScoutEncounter);
        setBattleLog('You break away', 'A wise retreat is still a decision. The encounter can be approached again.');
        this.time.delayedCall(850, () => showMode(returnToRoad ? 'exploration' : 'title'));
        return;
      }
      if (action === 'guard') {
        b.guarding = true;
        this.sfx('guard');
        setBattleLog('You set your stance', 'You read the goblin’s shoulder and prepare to blunt its next strike.');
        this.tweens.add({ targets: this.heroArt, y: this.heroOrigin.y + 8, duration: 150, yoyo: true, repeat: 1 });
        this.time.delayedCall(420, () => this.enemyTurn());
        return;
      }
      if (action === 'spell' && b.mp < 10) {
        b.busy = false;
        updateBars();
        setBattleLog('Not enough focus', 'Wait, defend, or use a weapon action while focus recovers.');
        return;
      }
      const isSpell = action === 'spell';
      const mods = b.character?.mods || {};
      const equippedWeapon = window.LegendRebootInventory?.getWeapon?.();
      const weapon = equippedWeapon || (gameData().weapons || []).find(item => item.id === 'hand') || { min: 8, max: 20 };
      const forceBonus = Number(mods.strength || 0) * 2;
      const magicBonus = Number(mods.magic || 0) * 3;
      const damage = isSpell ? Phaser.Math.Between(23, 31) + magicBonus : Phaser.Math.Between(Math.max(5, weapon.min), Math.max(10, weapon.max)) + forceBonus;
      if (isSpell) {
        b.mp -= 10;
        this.sfx('magic');
        this.castEffect();
        setBattleLog('Ember Bolt', 'The spell strikes hard, but drawing it through the Veil leaves a brief strain.');
      } else {
        this.sfx('swing');
        setBattleLog('A measured strike', 'You step into range instead of trading blows blindly.');
      }
      const oldHeroX = this.heroOrigin.x;
      this.tweens.add({
        targets: this.heroArt,
        x: oldHeroX + (isSpell ? 12 : 72),
        y: this.heroOrigin.y - (isSpell ? 16 : 9),
        duration: 145,
        ease: 'Quad.easeOut',
        onComplete: () => {
          b.enemyHp = Math.max(0, b.enemyHp - damage);
          this.hitEnemy(damage);
          this.tweens.add({
            targets: this.heroArt,
            x: oldHeroX,
            y: this.heroOrigin.y,
            duration: 190,
            ease: 'Quad.easeInOut'
          });
          if (b.enemyHp <= 0) {
            b.busy = false;
            b.finished = true;
            if (b.isScoutEncounter && this.explorationState) {
              this.explorationState.scoutDefeated = true;
              this.explorationState.scoutEngaged = false;
              this.explorationState.xp += 25;
              this.explorationState.bells += 18;
              window.LegendRebootInventory?.addBells?.(18);
              window.LegendRebootInventory?.addItem?.('gmail', 1);
              this.explorationState.expeditionComplete = true;
              $('#battleContinue').textContent = 'Return to the road';
              $('#battleContinue').hidden = false;
            }
            this.time.delayedCall(520, () => {
              this.sfx('victory');
              if (b.isScoutEncounter) {
                setBattleLog('Scout defeated', 'The scout carried a charcoal warband mark. You gain 25 XP and 18 Bells; the marks suggest these raids are organized.');
                toast('Scout defeated · 25 XP · 18 Bells');
              } else {
                setBattleLog('The road falls quiet', 'The goblin retreats into the brush. This is a prototype encounter, not a production reward.');
                toast('Encounter won · combat feedback prototype');
              }
              updateBars();
            });
            updateBars();
          } else {
            updateBars();
            this.time.delayedCall(300, () => this.enemyTurn());
          }
        }
      });
    }

    hitEnemy(damage) {
      if (!this.enemyArt || !this.enemyArt.active) return;
      this.enemyArt.setTint(0xffb4a0);
      this.sfx('hit');
      this.cameras.main.shake(110, .003);
      const x = this.enemyOrigin.x;
      const y = this.enemyOrigin.y - this.enemyArt.displayHeight * .38;
      const number = this.add.text(x, y, '-' + damage, {
        fontFamily: 'system-ui, sans-serif', fontSize: '27px', fontStyle: 'bold',
        color: '#ffe5ae', stroke: '#16120d', strokeThickness: 5
      }).setOrigin(.5);
      this.tweens.add({ targets: number, y: y - 62, alpha: 0, duration: 760, ease: 'Sine.easeOut', onComplete: () => number.destroy() });
      this.tweens.add({
        targets: this.enemyArt,
        x: x + 25,
        duration: 85,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          if (!this.enemyArt || !this.enemyArt.active) return;
          this.enemyArt.clearTint();
          this.enemyArt.setPosition(x, this.enemyOrigin.y);
        }
      });
    }

    castEffect() {
      const { width, height } = this.dimensions();
      const graphics = this.add.graphics();
      const sx = this.heroOrigin.x + 35;
      const ex = this.enemyOrigin.x - 45;
      const y = this.heroOrigin.y - 25;
      graphics.lineStyle(7, 0x91c9ff, .85);
      graphics.beginPath();
      graphics.moveTo(sx, y);
      graphics.lineTo(ex, y - 42);
      graphics.strokePath();
      graphics.fillStyle(0xc3e6ff, .9);
      graphics.fillCircle((sx + ex) / 2, y - 22, 11);
      this.tweens.add({ targets: graphics, alpha: 0, duration: 300, onComplete: () => graphics.destroy() });
      if (this.enemyArt) {
        this.enemyArt.setTint(0xa5c6ff);
        this.time.delayedCall(180, () => this.enemyArt && this.enemyArt.active && this.enemyArt.clearTint());
      }
    }

    enemyTurn() {
      const b = this.battle;
      if (!b || b.finished || b.enemyHp <= 0 || currentMode !== 'combat') return;
      setBattleLog('The goblin commits to a strike', 'Its shoulders drop. You have a brief moment to understand the attack before it lands.');
      const startX = this.enemyOrigin.x;
      this.enemyArt.setTint(0xe8b77f);
      this.tweens.add({
        targets: this.enemyArt,
        x: startX - 60,
        y: this.enemyOrigin.y + 8,
        duration: 220,
        ease: 'Quad.easeIn',
        onComplete: () => {
          const enemyRange = b.enemyDamage || [3, 8];
          const rawDamage = Phaser.Math.Between(enemyRange[0], enemyRange[1]) + (b.isScoutEncounter ? 5 : 0);
          const armorDefense = Number(window.LegendRebootInventory?.getArmor?.()?.defense || 0);
          const afterArmor = Math.max(1, rawDamage - Math.floor(armorDefense * .12));
          const damage = b.guarding ? Math.ceil(afterArmor * .28) : afterArmor;
          b.hp = Math.max(0, b.hp - damage);
          b.guarding = false;
          this.sfx('hit');
          this.cameras.main.shake(100, .002);
          this.heroArt.setTint(0xff9d8b);
          const y = this.heroOrigin.y - this.heroArt.displayHeight * .4;
          const number = this.add.text(this.heroOrigin.x, y, '-' + damage, {
            fontFamily: 'system-ui, sans-serif', fontSize: '25px', fontStyle: 'bold',
            color: '#ffc0b0', stroke: '#16120d', strokeThickness: 5
          }).setOrigin(.5);
          this.tweens.add({ targets: number, y: y - 45, alpha: 0, duration: 650, onComplete: () => number.destroy() });
          this.tweens.add({
            targets: this.enemyArt,
            x: startX, y: this.enemyOrigin.y, duration: 210, ease: 'Sine.easeOut',
            onComplete: () => this.enemyArt && this.enemyArt.active && this.enemyArt.clearTint()
          });
          this.time.delayedCall(150, () => this.heroArt && this.heroArt.active && this.heroArt.clearTint());
          if (b.hp <= 0) {
            b.finished = true;
            b.busy = false;
            if (b.isScoutEncounter) {
              $('#battleContinue').textContent = 'Withdraw to the road';
              $('#battleContinue').hidden = false;
            }
            setBattleLog('You fall back', 'This expedition is a safe prototype. Withdraw to the road and prepare before trying again.');
            updateBars();
            toast('Defeat · no production save changed');
          } else {
            b.busy = false;
            setBattleLog('Your turn', 'The goblin is exposed after its lunge. Guard, time a strike, or spend focus on magic.');
            updateBars();
          }
        }
      });
    }

    resetExplorationState() {
      this.explorationState = null;
      this.exploreUiElapsed = 0;
    }

    enterExploration() {
      if (!this.explorationState) {
        this.explorationState = {
          playerX: .22,
          playerY: .72,
          bells: 0,
          xp: 0,
          potions: 0,
          cacheFound: false,
          shrineInspected: false,
          tracksInspected: false,
          scoutEngaged: false,
          scoutDefeated: false,
          expeditionComplete: false,
          brennSpoken: false,
          herbsFound: false,
          questAccepted: false,
          questReported: false,
          objects: [
            { id: 'cache', label: 'Abandoned Supply Cache', shortLabel: 'Supply Cache', nx: .33, ny: .65, glyph: '▣', color: 0xd7b46f },
            { id: 'shrine', label: 'Veil-touched Waystone', shortLabel: 'Waystone', nx: .51, ny: .49, glyph: '✧', color: 0x9bc9bf },
            { id: 'tracks', label: 'Fresh Warband Tracks', shortLabel: 'Warband Tracks', nx: .61, ny: .72, glyph: '⌁', color: 0xc3b28b },
            { id: 'scout', label: 'Goblin Scout', shortLabel: 'Goblin Scout', nx: .72, ny: .61, glyph: '!', color: 0xd27b69 },
            { id: 'brenn', label: 'Brenn · Roadwarden', shortLabel: 'Roadwarden Brenn', nx: .19, ny: .53, glyph: '⚑', color: 0xb4c5a2 },
            { id: 'herbs', label: 'Roadside Herbs', shortLabel: 'Roadside Herbs', nx: .43, ny: .78, glyph: '✿', color: 0x9fbd82 }
          ]
        };
      }
      this.showBackdrop('road');
      this.clearExplorationGraphics();
      const { width, height } = this.dimensions();
      this.exploreShadow = this.add.ellipse(width * this.explorationState.playerX, height * this.explorationState.playerY + 35, 45, 13, 0x050807, .62).setDepth(19);
      const classTexture = ({ Adventurer: 'hero', Warrior: 'warrior', Ranger: 'ranger', Mage: 'mage', Thief: 'thief', Skiller: 'skiller' })[selectedClass()] || 'hero';
      this.explorePlayer = this.add.image(width * this.explorationState.playerX, height * this.explorationState.playerY, classTexture).setDepth(20);
      this.fitArtwork(this.explorePlayer, width * .11, height * .18);
      this.createExplorationMarkers();
      this.layoutExploration();
      this.updateExplorationUI();
      $('#battleContinue').hidden = true;
    }

    clearExplorationGraphics() {
      if (this.explorePlayer && this.explorePlayer.active) this.explorePlayer.destroy();
      if (this.exploreShadow && this.exploreShadow.active) this.exploreShadow.destroy();
      this.explorePlayer = null;
      this.exploreShadow = null;
      (this.exploreMarkerVisuals || []).forEach(visual => {
        if (visual.tween) visual.tween.stop();
        [visual.ring, visual.glyph, visual.label].forEach(item => {
          if (item && item.active) item.destroy();
        });
      });
      this.exploreMarkerVisuals = [];
    }

    createExplorationMarkers() {
      if (!this.explorationState) return;
      this.exploreMarkerVisuals = this.explorationState.objects.map(object => {
        const ring = this.add.circle(0, 0, 22, object.color, .19).setStrokeStyle(2, object.color, .88).setDepth(11);
        const glyph = this.add.text(0, 0, object.glyph, {
          fontFamily: 'Georgia, serif', fontSize: '30px', fontStyle: 'bold',
          color: '#' + object.color.toString(16).padStart(6, '0'),
          stroke: '#101311', strokeThickness: 4
        }).setOrigin(.5).setDepth(12);
        const label = this.add.text(0, 0, object.shortLabel, {
          fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontStyle: 'bold',
          color: '#f2e7cd', stroke: '#080b0a', strokeThickness: 4,
          align: 'center'
        }).setOrigin(.5, 0).setDepth(12);
        const complete = this.explorationObjectComplete(object.id);
        const tween = this.tweens.add({
          targets: ring, scale: { from: .84, to: 1.16 }, alpha: { from: .28, to: .8 },
          duration: 1150, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
        });
        this.modeTweens.push(tween);
        const visual = { id: object.id, ring, glyph, label, tween };
        this.styleExplorationMarker(object.id, visual);
        return visual;
      });
    }

    explorationObjectComplete(id) {
      const state = this.explorationState;
      if (!state) return false;
      if (id === 'cache') return state.cacheFound;
      if (id === 'shrine') return state.shrineInspected;
      if (id === 'tracks') return state.tracksInspected;
      if (id === 'scout') return state.scoutDefeated;
      if (id === 'brenn') return state.brennSpoken;
      if (id === 'herbs') return state.herbsFound;
      return false;
    }

    styleExplorationMarker(id, visual) {
      const object = this.explorationState && this.explorationState.objects.find(item => item.id === id);
      if (!object || !visual) return;
      const complete = this.explorationObjectComplete(id);
      visual.label.setText(complete ? object.shortLabel + ' ✓' : object.shortLabel);
      visual.ring.setFillStyle(object.color, complete ? .07 : .19);
      visual.ring.setStrokeStyle(2, object.color, complete ? .3 : .88);
      visual.glyph.setAlpha(complete ? .45 : 1);
      if (complete && visual.tween) visual.tween.pause();
      if (!complete && visual.tween) visual.tween.resume();
    }

    layoutExploration() {
      if (!this.explorationState) return;
      const { width, height } = this.dimensions();
      const playerX = this.explorationState.playerX * width;
      const playerY = this.explorationState.playerY * height;
      if (this.explorePlayer && this.explorePlayer.active) {
        this.explorePlayer.setPosition(playerX, playerY + Math.sin(this.time.now / 180) * .7);
        this.fitArtwork(this.explorePlayer, width * .11, height * .18);
      }
      if (this.exploreShadow && this.exploreShadow.active) this.exploreShadow.setPosition(playerX, playerY + height * .047);
      (this.exploreMarkerVisuals || []).forEach(visual => {
        const object = this.explorationState.objects.find(item => item.id === visual.id);
        if (!object) return;
        const x = object.nx * width;
        const y = object.ny * height;
        visual.ring.setPosition(x, y);
        visual.glyph.setPosition(x, y - 1);
        visual.label.setPosition(x, y + 29);
      });
    }

    nearestExplorationObject(maxDistance = 96) {
      if (!this.explorationState) return null;
      const { width, height } = this.dimensions();
      const px = this.explorationState.playerX * width;
      const py = this.explorationState.playerY * height;
      let nearest = null;
      let nearestDistance = maxDistance;
      this.explorationState.objects.forEach(object => {
        if (this.explorationObjectComplete(object.id)) return;
        const distance = Phaser.Math.Distance.Between(px, py, object.nx * width, object.ny * height);
        if (distance <= nearestDistance) {
          nearest = object;
          nearestDistance = distance;
        }
      });
      return nearest;
    }

    updateExplorationUI() {
      const state = this.explorationState;
      if (!state || currentMode !== 'exploration') return;
      $('#exploreObjective').textContent = state.scoutDefeated
        ? 'Objective: Return to Ashmere with evidence of an organized warband.'
        : !state.questAccepted
          ? 'Objective: Find Roadwarden Brenn and receive your field commission.'
          : !(state.shrineInspected && state.tracksInspected)
            ? 'Objective: Inspect the waystone and record the warband tracks.'
            : 'Objective: Confront the goblin scout and recover proof.';
      $('#exploreResources').textContent = state.bells + ' Bells  ·  ' + state.potions + (state.potions === 1 ? ' Tonic' : ' Tonics') + '  ·  ' + state.xp + ' XP';
      $('#exploreStamina').style.width = this.exploreStamina + '%';
      $('#exploreStaminaText').textContent = 'STAMINA ' + Math.round(this.exploreStamina) + '%';
      $('#exploreClue').textContent = state.shrineInspected && state.tracksInspected
        ? 'Evidence: Disturbed waystone + fresh warband tracks.'
        : state.shrineInspected
          ? 'Evidence: The waystone was disturbed recently.'
          : state.tracksInspected
            ? 'Evidence: Fresh tracks suggest an organized patrol.'
            : 'No magical evidence collected yet.';
      $('#returnAshmereButton').disabled = !state.scoutDefeated;
      if (state.scoutDefeated && !state.questReported) $('#returnAshmereButton').textContent = 'Report to Ashmere';
      const target = this.nearestExplorationObject(98);
      const title = $('#exploreTargetTitle');
      const prompt = $('#explorePromptText');
      const button = $('#interactButton');
      if (!target) {
        title.textContent = state.scoutDefeated ? 'The road is quieter' : 'Keep exploring';
        prompt.textContent = state.scoutDefeated
          ? 'The scout is down. Return to Ashmere to report the charcoal warband mark.'
          : 'Move with WASD or the arrow keys. Approach a marker and press E to interact.';
        button.disabled = true;
        button.textContent = 'Interact (E)';
      } else {
        title.textContent = target.label;
        prompt.textContent = target.id === 'brenn'
          ? 'A roadwarden watches the tree line and marks passing carts. Speak with Brenn for a field assignment.'
          : target.id === 'scout'
          ? 'The scout keeps looking over its shoulder. Press E when you are ready to confront it.'
          : target.id === 'cache'
            ? 'A supply cart was abandoned in a hurry. Search it for anything useful.'
            : target.id === 'herbs'
            ? 'Hardy herbs grow in the shelter of the mile-marker. Gather a few before moving on.'
            : target.id === 'tracks'
              ? 'Deep boot prints and claw marks cross the mud. Follow their direction to learn how many passed this way.'
              : 'Faint green-gold lines move beneath the moss. The stone is warmer than the air.';
        button.disabled = false;
        button.textContent = 'Interact: ' + target.shortLabel + ' (E)';
      }
    }

    interactNearby() {
      if (currentMode !== 'exploration' || !this.explorationState) return;
      const state = this.explorationState;
      const target = this.nearestExplorationObject(105);
      if (!target) {
        toast('Move closer to a marker to interact.');
        return;
      }
      if (target.id === 'cache') {
        state.cacheFound = true;
        state.bells += 8;
        state.potions += 1;
        window.LegendRebootInventory?.addBells?.(8);
        window.LegendRebootInventory?.addItem?.('roadPoultice', 1);
        this.sfx('confirm', .55);
        toast('Supplies recovered · +8 Bells · +1 Tonic');
      } else if (target.id === 'shrine') {
        state.shrineInspected = true;
        state.xp += 5;
        this.sfx('magic', .4);
        toast('Waystone studied · +5 XP');
      } else if (target.id === 'tracks') {
        state.tracksInspected = true;
        state.xp += 7;
        state.warbandEvidence = true;
        this.sfx('confirm', .5);
        toast('Tracks recorded · +7 XP · Warband evidence');
      } else if (target.id === 'herbs') {
        state.herbsFound = true;
        state.xp += 3;
        window.LegendRebootInventory?.addItem?.('roadHerb', 1);
        this.sfx('confirm', .45);
        toast('Road herbs gathered · +3 XP · +1 Road Herb');
      } else if (target.id === 'brenn') {
        state.brennSpoken = true;
        state.questAccepted = true;
        $('#exploreClue').textContent = 'Brenn’s commission: inspect the waystone, record the tracks, and bring back proof of the warband.';
        toast('Brenn: “Bring me proof the raids are organized. The road is not safe by accident.”');
        this.sfx('confirm', .5);
      } else if (target.id === 'scout') {
        if (!state.questAccepted) toast('You confront the scout without Brenn’s commission. The roadwarden will still want your report.');
        state.scoutEngaged = true;
        this.sfx('confirm', .7);
        showMode('combat');
        return;
      }
      (this.exploreMarkerVisuals || []).forEach(visual => this.styleExplorationMarker(visual.id, visual));
      this.updateExplorationUI();
    }

    showDebrief() {
      this.showBackdrop('ash');
      if (this.explorationState?.scoutDefeated) {
        this.explorationState.questReported = true;
        this.explorationState.expeditionComplete = true;
      }
      const state = this.explorationState || { bells: 0, xp: 0, potions: 0, cacheFound: false, shrineInspected: false, scoutDefeated: false };
      $('#debriefSummary').textContent = state.scoutDefeated
        ? (state.questAccepted
          ? 'Brenn studies the charcoal warband mark, then folds the report shut. “That is enough to warn the gate. It is not enough to know who commands them.” Your first commission is complete.'
          : 'The scout carried a charcoal warband mark—not proof of the force behind the attacks, but the first sign that these raids may be coordinated. Ashmere needs to know.')
        : 'You return to Ashmere before the expedition is complete. The road will still be there when you are ready.';
      $('#debriefRewards').textContent = '+' + state.xp + ' XP  ·  ' + state.bells + ' Bells  ·  ' + state.potions + (state.potions === 1 ? ' Tonic recovered' : ' Tonics recovered');
      const findings = [];
      if (state.brennSpoken) findings.push('Brenn’s road commission accepted');
      if (state.cacheFound) findings.push('Roadside supplies recovered');
      if (state.herbsFound) findings.push('Roadside herbs gathered');
      if (state.shrineInspected) findings.push('Waystone disturbance recorded');
      if (state.tracksInspected) findings.push('Warband tracks recorded');
      if (state.scoutDefeated) findings.push('Charcoal warband mark secured');
      $('#debriefFindings').textContent = findings.length ? findings.join('  ·  ') : 'No discoveries recorded on this trip.';
    }

    enterTraining() {
      this.stopModeEffects();
      this.showBackdrop('library');
      chosenRunes = [];
      $('#trainingResult').textContent = 'Choose the marks in the order shown.';
      const glyphs = this.add.text(this.dimensions().width * .5, this.dimensions().height * .47, '✦  ≈  ◇', {
        fontFamily: 'Georgia, serif', fontSize: '54px', color: '#e7c887',
        stroke: '#16100a', strokeThickness: 5
      }).setOrigin(.5).setAlpha(.68);
      this.trainingGlyphs.push(glyphs);
      this.sfx('magic', .35);
    }

    pulseRune(rune) {
      const { width, height } = this.dimensions();
      const tone = ({ EMBER: 0xe8a15a, TIDE: 0x88c4dd, ROOT: 0xa8c28c, GALE: 0xc9c6e9 })[rune] || 0xe7c887;
      const ring = this.add.circle(width * .5, height * .46, 38, tone, .22).setStrokeStyle(3, tone, .9);
      ring.setScale(.6).setAlpha(.95);
      this.runeRings.push(ring);
      this.tweens.add({ targets: ring, scale: 2.8, alpha: 0, duration: 530, ease: 'Sine.easeOut', onComplete: () => { ring.destroy(); this.runeRings = this.runeRings.filter(x => x !== ring); } });
    }

    runeSuccess() {
      this.cameras.main.flash(250, 161, 200, 167, false);
      this.sfx('magic');
    }

    runeFailure() {
      this.cameras.main.shake(170, .001);
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#090d0c',
    width: 1600,
    height: 900,
    scale: { mode: Phaser.Scale.RESIZE, width: 1600, height: 900 },
    render: { antialias: true, pixelArt: false, transparent: false },
    scene: [RebootScene],
    input: { keyboard: true, mouse: true, touch: true },
    audio: { noAudio: false }
  });

  game.events.once('ready', () => {
    if (!scene) scene = game.scene.getScene('RebootScene');
    updateBars();
  });
})();
