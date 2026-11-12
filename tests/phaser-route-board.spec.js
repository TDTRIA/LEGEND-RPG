const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`route boards preserve native navigation and saves at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'RouteBoardQA', className: 'Ranger', hp: 40, maxHp: 40, gold: 50,
        currentRegion: 'Ashmere', discoveredRegions: ['Ashmere', 'Greyfen'],
        flags: { introV094Complete: true, customRouteProbe: 'preserve' }
      }));
      window.LegendAshmereV099.route('routes');
    });
    const active = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeRouteBoard.active);
    await expect.poll(active).toBe(true);
    await expect(page.locator('.ash099-card')).toHaveCount(3);
    await page.locator('[data-ash-view="regions"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.reg100')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeRouteBoard.kind)).toBe('regions');
    await page.locator('#regBack').tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.currentRegion = 'Greyfen';
      window.LegendStorage.savePlayer(player);
      window.LegendAshmereV099.route('routes');
    });
    await expect.poll(active).toBe(true);
    await expect(page.locator('.ash099-card')).toHaveCount(4);
    const save = await page.evaluate(() => localStorage.getItem(window.LEGEND_DATA.SAVE_KEY));
    await page.locator('#ashBack').scrollIntoViewIfNeeded();
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem(window.LEGEND_DATA.SAVE_KEY))).toBe(save);
    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await expect.poll(active).toBe(true);
    await page.locator('.ash099-card strong').first().evaluate(node => { node.textContent = ''; });
    await expect.poll(active).toBe(false);
    await expect(page.locator('#ashBack')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
