const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
for (const width of [1440, 390]) {
  test(`inn preserves transactions, copy and regional navigation at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'InnQA', className: 'Ranger', hp: 11, maxHp: 40, level: 2, xp: 45, gold: 125,
        currentRegion: 'Ashmere', discoveredRegions: ['Ashmere', 'Greyfen'],
        inventory: { food: 3, camp: 2, roadToken: 4, bellFragment: 7, futureMaterial: 9 },
        flags: { introV094Complete: true, customInnFlag: 'preserved' }, futureExtension: { keep: true }
      }));
      window.LegendAshmereV099.renderAshmere();
      window.LegendAshmereV099.route('inn');
    });
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('legend-roads-of-ashmere-v09')));
    const native = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeInn);
    const expected = await saved();
    await expect.poll(async () => (await native()).active).toBe(true);
    expect((await native()).labels).toEqual(expect.arrayContaining([
      'Ashmere Inn', '125g', 'HEALTH · 11 / 40', 'Rest for the night', '35g', 'Camp Supplies', '90g', 'Hear a Rumor', 'FREE', 'Back to Ashmere'
    ]));
    expect((await native()).art).toMatch(/ashmere-inn\.webp$/);
    const heading = await page.locator('.ash099-kicker').boundingBox(), hud = await page.locator('.lws-hud').boundingBox();
    expect(heading.y).toBeGreaterThanOrEqual(hud.y + hud.height);
    expect(await saved()).toEqual(expected);
    await page.locator('#rest').scrollIntoViewIfNeeded();
    await page.locator('#rest').focus();
    await expect.poll(async () => (await native()).focused).toBe('rest');
    await page.keyboard.press('Enter');
    expected.gold = 90; expected.hp = 40;
    expect(await saved()).toEqual(expected);
    await expect(page.locator('#rest')).toBeFocused();
    await expect(page.locator('.ash099-service-wallet > strong')).toHaveText('90g');
    await expect(page.locator('.ash099-service-wallet > small')).toHaveText('HEALTH · 40 / 40');
    await expect.poll(async () => (await native()).labels).toContain('You rest at the inn and recover completely.');
    await expect(page.locator('.ash099-service-wallet i b')).toHaveAttribute('style', 'width: 100%;');
    await page.locator('#camp').tap();
    expected.gold = 0; expected.inventory.camp = 3;
    expect(await saved()).toEqual(expected);
    await expect.poll(async () => (await native()).labels).toContain('0g');
    await expect.poll(async () => (await native()).labels).toContain('Bought camp supplies.');
    await page.locator('#rest').tap();
    expect(await saved()).toEqual(expected);
    await expect.poll(async () => (await native()).labels).toContain('Not enough gold.');
    await expect(page.locator('#ashNote')).toHaveAttribute('aria-live', 'polite');
    await page.locator('#rumor').tap();
    expect(await saved()).toEqual(expected);
    const rumor = await page.locator('#ashNote').textContent();
    expect(['A broken shrine showed itself in the fog last night.', 'Blackroot wolves hate firelight.', 'Brenn pays extra for proof that still bleeds.']).toContain(rumor);
    await expect.poll(async () => (await native()).labels).toContain(rumor);
    const back = page.locator('#ashBack');
    await back.scrollIntoViewIfNeeded();
    const backBox = await back.boundingBox(), dock = await page.locator('.lws-bottom-bar').boundingBox();
    expect(backBox.y + backBox.height).toBeLessThanOrEqual(dock.y);
    await back.tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(async () => (await native()).active).toBe(false);
    expect(await saved()).toEqual(expected);
    // An unlocked regional fixture exercises the same controller with its actual
    // Greyfen title, artwork, rumors and return callback, without altering rules.
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.currentRegion = 'Greyfen';
      window.LegendStorage.savePlayer(player);
      window.LegendAshmereV099.route('inn');
    });
    const greyfen = await saved();
    await expect.poll(async () => (await native()).labels).toContain('Reedlight Inn');
    expect((await native()).art).toMatch(/greyfen.*inn/);
    await page.locator('#rumor').tap();
    const marshRumor = await page.locator('#ashNote').textContent();
    expect(['The water rose after the bell rang, though no rain had fallen.', 'A blue light is seen near the drowned boundary stones at dusk.', 'The causeway markers have shifted. Or something has turned them.']).toContain(marshRumor);
    await expect.poll(async () => (await native()).labels).toContain(marshRumor);
    expect(await saved()).toEqual(greyfen);
    const banner = page.locator('.ash099-head > img');
    const source = await banner.getAttribute('src');
    await banner.evaluate(node => { node.src = 'data:image/png;base64,broken'; });
    await expect.poll(async () => (await native()).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await banner.evaluate((node, src) => { node.src = src; }, source);
    await expect.poll(async () => (await native()).active).toBe(true);
    // Any incomplete required copy restores the entire styled source view.
    await page.locator('#camp .ash099-service-copy > small').evaluate(node => node.remove());
    await expect.poll(async () => (await native()).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.ash099-head > img')).not.toHaveCSS('opacity', '0');
    await page.locator('#rest').tap();
    await expect(page.locator('#ashNote')).toHaveText('Not enough gold.');
    expect(await saved()).toEqual(greyfen);
    await expect(back).toHaveText('Back to Greyfen');
    await back.tap();
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    expect(await saved()).toEqual(greyfen);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
