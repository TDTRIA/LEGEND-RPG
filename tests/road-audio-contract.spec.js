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

  test('keeps battle effect paths, volumes, and music reuse behavior', async ({ page }) => {
    const result = await page.evaluate(() => {
      const played = [];
      window.Audio = function (src) {
        this.src = src;
        this.volume = 1;
        this.loop = false;
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
      const audio = window.LegendRoadAudioV100;
      audio.playBattleFx('victory');
      audio.playBattleFx('unknown-effect');
      audio.startBattleMusic();
      audio.startBattleMusic();
      audio.stopBattleMusic();
      audio.startBattleMusic();
      audio.stopBattleMusic();
      return played;
    });

    expect(result).toEqual([
      { src: 'assets/audio/battle/battle_victory.wav', volume: 0.3, loop: false },
      { src: 'assets/audio/battle/battle_swing.wav', volume: 0.2, loop: false },
      { src: 'assets/audio/battle/old-road-battle_loop.wav', volume: 0.17, loop: true },
      { src: 'assets/audio/battle/old-road-battle_loop.wav', volume: 0.17, loop: true }
    ]);
  });
});
