const { test, expect } = require('@playwright/test');

test.describe('LegendProgressionV100 compatibility contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.addScriptTag({ path: 'js/systems/progression-v100.js' });
  });

  test('awards XP without leveling when below the current threshold', async ({ page }) => {
    const result = await page.evaluate(() => {
      const player = { level: 1, xp: 20, hp: 50, maxHp: 100 };
      const summary = window.LegendProgressionV100.award(player, 30);
      return { player, summary };
    });
    expect(result.player).toEqual({ level: 1, xp: 50, hp: 50, maxHp: 100 });
    expect(result.summary).toEqual({ gained: 30, levels: 0, level: 1, xp: 50, next: 100 });
  });

  test('preserves level-up threshold, leftover XP, and HP gain', async ({ page }) => {
    const result = await page.evaluate(() => {
      const player = { level: 1, xp: 90, hp: 50, maxHp: 100 };
      const summary = window.LegendProgressionV100.award(player, 25);
      return { player, summary };
    });
    expect(result.player).toEqual({ level: 2, xp: 15, hp: 58, maxHp: 108 });
    expect(result.summary).toEqual({ gained: 25, levels: 1, level: 2, xp: 15, next: 200 });
  });

  test('handles multiple level-ups using each new level threshold', async ({ page }) => {
    const result = await page.evaluate(() => {
      const player = { level: 1, xp: 0, hp: 10, maxHp: 10 };
      const summary = window.LegendProgressionV100.award(player, 300);
      return { player, summary };
    });
    expect(result.player).toEqual({ level: 3, xp: 0, hp: 26, maxHp: 26 });
    expect(result.summary).toEqual({ gained: 300, levels: 2, level: 3, xp: 0, next: 300 });
  });

  test('increases both max HP and current HP by eight on level-up', async ({ page }) => {
    const result = await page.evaluate(() => {
      const player = { level: 1, xp: 99, hp: 100, maxHp: 100 };
      const summary = window.LegendProgressionV100.award(player, 1);
      return { player, summary };
    });
    expect(result.player).toEqual({ level: 2, xp: 0, hp: 108, maxHp: 108 });
    expect(result.summary.levels).toBe(1);
  });

  test('normalizes negative XP inputs and preserves the null-player fallback', async ({ page }) => {
    const result = await page.evaluate(() => {
      const player = { level: 1, xp: 10, hp: 20, maxHp: 20 };
      const summary = window.LegendProgressionV100.award(player, -50);
      return { player, summary, missing: window.LegendProgressionV100.award(null, 50) };
    });
    expect(result.player.xp).toBe(10);
    expect(result.summary).toEqual({ gained: 0, levels: 0, level: 1, xp: 10, next: 100 });
    expect(result.missing).toEqual({ gained: 0, levels: 0, level: 1, xp: 0, next: 100 });
  });
});
