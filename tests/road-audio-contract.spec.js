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
