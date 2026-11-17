const { test, expect } = require('@playwright/test');

for (const width of [1440, 390]) {
  test(`mandatory opening annals stay readable and hand off to creation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready');
    });
    await page.reload();
    await expect(page.locator('.v120-title')).toBeVisible();
    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    const chapters = [
      ['When the World Went to War', 'human kingdoms and monster nations'],
      ['The Pact Beneath the Stone', 'seal over the deep ways'],
      ['The Peace, Written Down', 'III · THE PEACE KEPT']
    ];
    for (let i = 0; i < chapters.length; i++) {
      await expect(page.getByRole('heading', { name: chapters[i][0] })).toBeVisible();
      const screen = page.locator('.opening-lore-v220');
      await expect(screen).toContainText(chapters[i][1]);
      await expect(page.locator('#openingLoreContinue')).toBeVisible();
      const state = await page.evaluate(() => ({
        classActive: document.body.classList.contains('legend-phaser-annals-ui-active'),
        headingColor: getComputedStyle(document.querySelector('#openingLoreTitle')).color,
        textColor: getComputedStyle(document.querySelector('.opening-lore-v220')).color,
        buttonColor: getComputedStyle(document.querySelector('#openingLoreContinue')).color,
        overflow: document.documentElement.scrollWidth > innerWidth
      }));
      expect(state.classActive).toBe(false);
      expect(state.headingColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.textColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.buttonColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.overflow).toBe(false);
      if (i < 2) {
        await page.locator('#openingLoreContinue').focus();
        await expect(page.locator('#openingLoreContinue')).toBeFocused();
        if (width === 390) await page.locator('#openingLoreContinue').tap();
        else await page.keyboard.press('Enter');
      } else {
        await expect(screen).not.toContainText(/Last Mercy|Veil|echo|wound|healer|Saint/i);
        await expect(page.locator('#openingLoreContinue')).toContainText('Shape the traveler');
        await page.locator('#openingLoreContinue').click();
      }
    }
    await expect(page.locator('.v140-creation')).toBeVisible();
    await expect(page.locator('#v094Name')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBeNull();
  });
}
