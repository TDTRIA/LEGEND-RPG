const { test, expect } = require('@playwright/test');

test('resized DOM drawers cannot activate a Phaser landmark underneath their controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(() => {
    LegendStorage.savePlayer(LegendStorage.normalize({ username: 'PointerOwnership', className: 'Ranger',
      hp: 100, maxHp: 100, currentRegion: 'Ashmere', flags: { introV094Complete: true,
        openingRoadV140: { completed: true, phase: 'complete' } } }));
    LegendAshmereV099.renderAshmere();
  });
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeHudUi)).toBe(true);
  const before = await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    // The reported interaction also has to work with a DOM HUD fallback.
    scene.syncNativeHudUi = () => scene.clearNativeHudUi();
    scene.syncNativeHudUi();
    window.__unexpectedLandmarks = [];
    const select = scene.selectAshmereLandmark;
    scene.selectAshmereLandmark = function (id) {
      window.__unexpectedLandmarks.push(id);
      return select.call(this, id);
    };
    return localStorage.getItem('legend-roads-of-ashmere-v09');
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-world-action="toggle-left"]').click();
  await page.keyboard.press('Escape');
  await page.locator('[data-world-action="toggle-right"]').click();
  await page.locator('[data-world-place="market"]').click();
  await expect(page.locator('[data-world-place="market"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.lws-selected-place h3')).toHaveText('Market');
  expect(await page.evaluate(() => window.__unexpectedLandmarks)).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(before);
  await page.locator('#lws-panel-right [data-world-action="visit-selected-place"]').click();
  await expect(page.locator('.ash099-market-console')).toBeVisible();
});
