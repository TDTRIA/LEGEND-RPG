const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
for (const width of [1440, 390]) {
  test(`regional ledger keeps unlock costs, fares and unavailable regions at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'LedgerQA', hp: 40, maxHp: 40, gold: 25, currentRegion: 'Ashmere',
        discoveredRegions: ['Ashmere'], inventory: { roadToken: 4 },
        flags: { introV094Complete: true, greyfenDryCrossingComplete: true, customLedgerFlag: 'preserved' },
        futureExtension: { keep: true }
      }));
      window.LegendRegionsV100.render();
    });
    const native = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeRouteBoard);
    await expect.poll(async () => (await native()).kind).toBe('regions');
    expect((await native()).clipBounds.height).toBeGreaterThan(0);
    await expect(page.locator('[data-unlock="Greyfen"]')).toContainText('Need 1 more token');
    await page.locator('[data-unlock="Greyfen"]').tap();
    await expect(page.locator('.reg100-note')).toContainText('short on tokens');
    await expect.poll(async () => (await native()).labels.some(label => label.includes('short on tokens'))).toBe(true);
    expect(await page.evaluate(() => window.LegendStorage.loadPlayer().inventory.roadToken)).toBe(4);
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.inventory.roadToken = 5; // isolated fixture for the exact existing unlock cost
      window.LegendStorage.savePlayer(player);
      window.LegendRegionsV100.render();
    });
    await page.locator('[data-unlock="Greyfen"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.reg100-note')).toContainText('first crossing is yours');
    const player = await page.evaluate(() => window.LegendStorage.loadPlayer());
    expect(player.inventory.roadToken).toBe(0);
    expect(player.gold).toBe(25);
    expect(player.currentRegion).toBe('Greyfen');
    expect(player.futureExtension).toEqual({ keep: true });
    expect(player.flags.customLedgerFlag).toBe('preserved');
    const ironpass = page.locator('.reg100-card').filter({ has: page.getByRole('heading', { name: 'Ironpass', exact: true }) });
    await expect(ironpass).toContainText('In development');
    await expect(ironpass.locator('button')).toHaveCount(0);
    await page.locator('[data-travel="Ashmere"]').tap();
    await page.locator('[data-travel="Greyfen"]').tap();
    expect(await page.evaluate(() => window.LegendStorage.loadPlayer().gold)).toBe(0);
    await page.locator('[data-travel="Ashmere"]').tap();
    await page.locator('[data-travel="Greyfen"]').tap();
    await expect(page.locator('.reg100-note')).toContainText('need 25');
    expect(await page.evaluate(() => window.LegendStorage.loadPlayer().currentRegion)).toBe('Ashmere');
    await expect.poll(async () => (await native()).kind).toBe('regions');
    await page.locator('#regBack').tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(async () => (await native()).active).toBe(false);
    await page.evaluate(() => window.LegendRegionsV100.render());
    await expect.poll(async () => (await native()).active).toBe(true);
    await page.locator('.reg100-card h2').first().evaluate(node => { node.textContent = ''; });
    await expect.poll(async () => (await native()).active).toBe(false);
    await expect(page.locator('#regBack')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
