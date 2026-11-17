const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
for (const width of [1440, 390]) {
  test(`traveler sheet retains complete records, navigation and notifications at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'TravelerQA', className: 'Ranger', personalityLabel: 'Steadfast', origin: 'Lost Squire',
        keepsake: 'A worn keepsake carried from the road', pronouns: 'they/them',
        hp: 23, maxHp: 40, level: 2, xp: 45, gold: 73, currentRegion: 'Ashmere',
        discoveredRegions: ['Ashmere', 'Greyfen'],
        weapon: 'ironSword', armor: 'clothArmor',
        inventory: { food: 3, potion: 2, roadToken: 4, bellFragment: 7, ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`keepsake${i}`, i + 1])) },
        flags: { introV094Complete: true, ashmereJobs: 3, customSheetFlag: 'preserved' }, futureExtension: { keep: true }
      }));
      window.LegendAshmereV099.renderAshmere();
    });
    const save = () => page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
    const original = await save();
    const native = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeTravelerSheet);
    await page.locator('.ashmere-hub-v240 #ashmereHubMoreToggle').tap();
    await page.locator('.ashmere-hub-v240-utilities [data-ash-hub-action="inventory"]').tap();
    await page.locator('#legend-world-shell-modal-root [data-world-action="traveler-sheet"]').tap();
    await expect.poll(async () => (await native()).active).toBe(true);
    expect((await native()).labels).toEqual(expect.arrayContaining([
      'TravelerQA', 'Ranger', 'Steadfast · Lost Squire', 'A worn keepsake carried from the road',
      '23 / 40', '73g', '4 / 5', 'they/them', 'Ashmere', '3 jobs', '7 Bell Fragments', '×12'
    ]));
    // The production controller, not the painter, determines progression/equipment text and meters.
    for (const selector of ['.ash099-traveler-profile-level > small', '.ash099-profile-equipment > strong', '.ash099-profile-equipment > small']) {
      for (const value of await page.locator(selector).allTextContents()) expect((await native()).labels).toContain(value.trim());
    }
    expect(await page.locator('.ash099-vital-hp i b').evaluate(node => node.style.width)).toBe('57%');
    expect((await native()).clipBounds.height).toBeGreaterThan(0);
    const hud = await page.locator('.lws-hud').boundingBox();
    expect((await native()).clipBounds.y).toBeGreaterThanOrEqual(hud.y + hud.height - 1);
    await expect(page.locator('#root')).not.toHaveCSS('clip-path', 'none');
    const back = page.locator('#ashBack');
    await back.scrollIntoViewIfNeeded();
    await back.focus();
    const box = await back.boundingBox(), dock = await page.locator('.lws-bottom-bar').boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(dock.y);
    expect(await save()).toBe(original);
    await page.keyboard.press('Enter');
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(async () => (await native()).active).toBe(false);
    // Ashmere's compact Save action replaces the persistent shell toast on the hub.
    await page.locator('.ashmere-hub-v240 #ashmereHubMoreToggle').tap();
    const saveAction=page.locator('.ashmere-hub-v240-utilities [data-ash-hub-action="save"]');
    await saveAction.tap();
    const status=page.locator('#ashmereHubUtilityStatus');
    await expect(status).toHaveText('Traveler record saved locally.');
    await expect(status).toHaveAttribute('role','status');
    await page.evaluate(() => {
      const originalStorage=window.LegendStorage;
      window.LegendStorage={...originalStorage,savePlayer:()=>false};
      document.querySelector('.ashmere-hub-v240-utilities [data-ash-hub-action="save"]').click();
      window.LegendStorage=originalStorage;
    });
    await expect(status).toContainText('could not be saved');
    await expect(page.locator('.lws-shell-toast')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    expect(await save()).toBe(original);
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.currentRegion = 'Greyfen'; player.inventory = {};
      window.LegendStorage.savePlayer(player);
      window.LegendAshmereV099.route('sheet');
    });
    const emptySave = await save();
    await expect.poll(async () => (await native()).active).toBe(true);
    expect((await native()).labels).toContain('Your pack is light. The road may change that.');
    await expect(back).toHaveText('Back to Greyfen');
    await page.locator('.ash099-traveler-profile-level > small').evaluate(node => node.remove());
    await expect.poll(async () => (await native()).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await back.tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await save()).toBe(emptySave);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
