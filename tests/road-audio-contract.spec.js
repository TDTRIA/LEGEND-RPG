const { test, expect } = require('@playwright/test');

test.describe('LegendRoadAudioV100 compatibility contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('preserves the existing sound preference and toggle contract', async ({ page }) => {
    const result = await page.evaluate(() => {
      const audio = window.LegendRoadAudioV100;
      localStorage.setItem('legend-road-sound', 'off');
      const disabled = audio.soundOn();
      const toggledOn = audio.toggleSound();
      const enabled = audio.soundOn();
      const toggledOff = audio.toggleSound();
      return { hasApi: !!audio, disabled, toggledOn, enabled, toggledOff, finalEnabled: audio.soundOn() };
    });

    expect(result).toEqual({
      hasApi: true, disabled: false, toggledOn: true, enabled: true,
      toggledOff: false, finalEnabled: false
    });
  });

  test('uses the generated LEGEND theme, scene ambience, and effects without duplicate loops', async ({ page }) => {
    const result = await page.evaluate(() => {
      const audio = window.LegendRoadAudioV100;
      audio.stopWorldAudio();
      const played = [];
      window.Audio = function (src) {
        this.src = src;
        this.volume = 1;
        this.loop = false;
        this.preload = '';
        this.paused = true;
        this.currentTime = 0;
        this.play = () => {
          played.push({ src: this.src, volume: this.volume, loop: this.loop });
          this.paused = false;
          return Promise.resolve();
        };
        this.pause = () => { this.paused = true; };
      };
      localStorage.setItem('legend-road-sound', 'on');
      audio.setEnvironment('title');
      audio.setSurface('title');
      audio.startWorldAudio();
      audio.startWorldAudio();
      audio.startBattleMusic();
      audio.setEnvironment('forge');
      audio.setSurface('town-service');
      audio.playBattleFx('victory');
      audio.playBattleFx('unknown-effect');
      audio.playUi('hover');
      audio.stopBattleMusic();
      return { played, snapshot: audio.snapshot() };
    });

    expect(result.played).toEqual([
      { src: 'assets/audio/music/legend-main-theme.mp3', volume: 0.17, loop: true },
      { src: 'assets/audio/ambience/title-ashmere.mp3', volume: 0.105, loop: true },
      { src: 'assets/audio/ambience/ashmere-forge.mp3', volume: 0.105, loop: true },
      { src: 'assets/audio/rewards/quest-complete.mp3', volume: 0.28, loop: false },
      { src: 'assets/audio/battle/sword-swing.mp3', volume: 0.22, loop: false },
      { src: 'assets/audio/ui/menu-hover.mp3', volume: 0.14, loop: false }
    ]);
    expect(result.snapshot).toMatchObject({
      enabled: true,
      unlocked: true,
      environment: 'forge',
      surface: 'town-service',
      musicPath: 'assets/audio/music/legend-main-theme.mp3',
      ambiencePath: 'assets/audio/ambience/ashmere-forge.mp3',
      musicPlaying: true,
      ambiencePlaying: true
    });
  });
});

test('mute survives rejected storage writes and subsequent title and road transitions', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const audio = LegendRoadAudioV100;
    audio.stopWorldAudio();
    localStorage.setItem('legend-road-sound', 'on');
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'legend-road-sound') throw new DOMException('Synthetic quota denial', 'QuotaExceededError');
      return original.call(this, key, value);
    };
    try {
      const returned = audio.toggleSound();
      LegendTitleAudioV120.startAmbience();
      audio.startWorldAudio();
      audio.setEnvironment('road');
      audio.setSurface('expedition');
      const muted = audio.snapshot();
      const effect = audio.playBattleFx('hit');
      Storage.prototype.setItem = original;
      const enabled = audio.toggleSound();
      return { returned, muted, effect, enabled, persisted: localStorage.getItem('legend-road-sound') };
    } finally { Storage.prototype.setItem = original; }
  });
  expect(result.returned).toBe(false);
  expect(result.muted).toMatchObject({ enabled: false, musicPlaying: false, ambiencePlaying: false });
  expect(result.effect).toBeNull();
  expect(result.enabled).toBe(true);
  expect(result.persisted).toBe('on');
});

test('audio retains the last known preference when reads fail and restores legacy key semantics after recovery', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const audio = LegendRoadAudioV100;
    localStorage.setItem('legend-road-sound', 'off');
    const initial = audio.soundOn();
    const read = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'legend-road-sound') throw new DOMException('Synthetic read denial', 'SecurityError');
      return read.call(this, key);
    };
    try {
      const blocked = audio.soundOn();
      const toggled = audio.toggleSound();
      const afterToggle = audio.soundOn();
      Storage.prototype.getItem = read;
      localStorage.setItem('legend-road-sound', 'legacy-unknown');
      const legacy = audio.soundOn();
      localStorage.setItem('legend-road-sound', 'off');
      const restored = audio.soundOn();
      return { initial, blocked, toggled, afterToggle, legacy, restored };
    } finally { Storage.prototype.getItem = read; }
  });
  expect(result).toEqual({ initial: false, blocked: false, toggled: true, afterToggle: true, legacy: true, restored: false });
});
