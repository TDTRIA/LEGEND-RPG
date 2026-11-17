const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
for (const width of [1440, 390]) {
  test(`market keeps real purchases, rounded sales and regional returns at ${width}px`, async ({ page }) => {
    test.setTimeout(150000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'MarketQA', className: 'Ranger', keepsake: 'Bent Coin', hp: 23, maxHp: 40, level: 2, xp: 45, gold: 200,
        currentRegion: 'Ashmere', discoveredRegions: ['Ashmere', 'Greyfen'],
        inventory: { food: 3, potion: 2, camp: 0, clothScrap: 2, wolfFang: 3, wispAsh: 1, tradeBundle: 1, roadToken: 4, bellFragment: 7, futureMaterial: 9 },
        flags: { introV094Complete: true, customMarketFlag: 'preserved' }, futureExtension: { keep: true }
      }));
      window.LegendAshmereV099.renderAshmere();
      window.LegendAshmereV099.route('trader');
    });
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('legend-roads-of-ashmere-v09')));
    const native = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeMarket);
    const expected = await saved();
    const buy = page.locator('[data-market-tab="buy"]'), sell = page.locator('[data-market-tab="sell"]');
    await expect.poll(async () => (await native()).active).toBe(true);
    expect((await native()).labels).toEqual(expect.arrayContaining(['Trading Post', '200g', '165g', '60g', '120g', '90g', '34g', '70g', 'Prices are per item', 'Sell road loot 7']));
    expect((await native()).art).toMatch(/ashmere-market\.webp$/);
    const heading = await page.locator('.ash099-kicker').boundingBox(), hud = await page.locator('.lws-hud').boundingBox();
    expect(heading.y).toBeGreaterThanOrEqual(hud.y + hud.height);
    expect(await saved()).toEqual(expected);
    await page.locator('[data-buy="food"]').focus();
    await page.keyboard.press('Enter');
    expected.gold = 140; expected.inventory.food = 4;
    expect(await saved()).toEqual(expected);
    await expect(page.locator('[data-buy="food"]')).toBeFocused();
    await expect.poll(async () => (await native()).labels).toContain('140g');
    await page.locator('[data-buy="clothScrap"]').tap();
    expected.gold = 106; expected.inventory.clothScrap = 3;
    expect(await saved()).toEqual(expected);
    await expect(page.locator('[data-buy="potion"]')).toBeDisabled();
    // Disabled controls remain readable, and DOM click() cannot transact.
    await page.locator('[data-buy="potion"]').evaluate(node => node.click());
    expect(await saved()).toEqual(expected);
    await expect.poll(async () => (await native()).labels).toContain('120g');
    await page.locator('[data-buy="camp"]').focus();
    await page.keyboard.press('Enter');
    expected.gold = 16; expected.inventory.camp = 1;
    expect(await saved()).toEqual(expected);
    await expect(buy).toBeFocused();
    await expect(page.locator('[data-buy]:disabled')).toHaveCount(5);
    await sell.focus(); await page.keyboard.press('Enter');
    await expect(sell).toBeFocused();
    await expect(sell).toHaveAttribute('aria-selected', 'true');
    await expect.poll(async () => (await native()).mode).toBe('sell');
    expect((await native()).labels).toEqual(expect.arrayContaining(['13g', '25g', '10g', '81g', '175g', 'You own 3 · keepsake bonus applied']));
    await expect(sell.locator('span')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.locator('[data-sell="wolfFang"]').tap();
    expected.gold = 29; expected.inventory.wolfFang = 2;
    expect(await saved()).toEqual(expected);
    await expect.poll(async () => (await native()).labels).toContain('162g');
    await page.locator('#sellAllLoot').focus(); await page.keyboard.press('Enter');
    expected.gold = 191;
    for (const id of ['wolfFang', 'clothScrap', 'wispAsh', 'tradeBundle']) expected.inventory[id] = 0;
    expect(await saved()).toEqual(expected);
    await expect(sell).toBeFocused();
    await expect(page.locator('#sellAllLoot')).toBeDisabled();
    await expect.poll(async () => (await native()).labels).toContain('No road finds to sell yet.');
    await page.locator('#sellAllLoot').evaluate(node => node.click());
    expect(await saved()).toEqual(expected);
    const back = page.locator('#ashBack');
    await back.scrollIntoViewIfNeeded();
    const backBox = await back.boundingBox(), dock = await page.locator('.lws-bottom-bar').boundingBox();
    expect(backBox.y + backBox.height).toBeLessThanOrEqual(dock.y);
    await back.tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(async () => (await native()).active).toBe(false);
    expect(await saved()).toEqual(expected);
    // Greyfen uses the same production economy with its own art/copy; without
    // the Bent Coin, one fang sells for its unmodified twelve gold.
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.currentRegion = 'Greyfen'; player.keepsake = 'Old Map'; player.inventory.wolfFang = 1;
      window.LegendStorage.savePlayer(player); window.LegendAshmereV099.route('trader');
    });
    const marsh = await saved();
    await expect.poll(async () => (await native()).labels).toContain('Marsh Market');
    expect((await native()).art).toMatch(/greyfen-market-scene\.webp$/);
    await sell.tap();
    await expect(page.locator('[data-sell="wolfFang"] .ash099-market-price')).toHaveText('12g');
    await page.locator('[data-sell="wolfFang"]').focus(); await page.keyboard.press('Enter');
    marsh.gold += 12; marsh.inventory.wolfFang = 0;
    expect(await saved()).toEqual(marsh);
    await expect(sell).toBeFocused();
    await buy.tap();
    await expect.poll(async () => (await native()).active).toBe(true);
    await page.locator('[data-buy="food"] .ash099-market-item-copy > small').evaluate(node => node.remove());
    await expect.poll(async () => (await native()).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    // The preserved fallback still purchases through the same production callback.
    await page.locator('[data-buy="food"]').tap();
    marsh.gold -= 60; marsh.inventory.food += 1;
    expect(await saved()).toEqual(marsh);
    await expect.poll(async () => (await native()).active).toBe(true);
    await expect(back).toHaveText('Back to Greyfen');
    await back.tap();
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    expect(await saved()).toEqual(marsh);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
