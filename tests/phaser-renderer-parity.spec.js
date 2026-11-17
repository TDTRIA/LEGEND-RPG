const { test, expect } = require('@playwright/test');

// Exercise both production backends even on a software-GPU runner where the
// normal driver selection deliberately chooses Canvas. Only backend selection
// is overridden; presentation code, input and game controllers stay unchanged.
for (const renderer of ['CANVAS', 'WEBGL']) test(`${renderer} paints entry and road map with usable DOM fallback`, async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/js/engine/phaser-world-v1.js*', async route => {
    const response = await route.fetch();
    const source = await response.text();
    const selection = 'type: IS_PROTOTYPE ? Phaser.AUTO : productionRendererType(),';
    expect(source).toContain(selection);
    await route.fulfill({ response, body: source.replace(selection, `type: Phaser.${renderer},`) });
  });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady && !document.documentElement.classList.contains('engine-intro-active'));
  expect(await page.evaluate(() => LegendPhaserWorldV1.engine.renderer.type)).toBe(renderer === 'CANVAS' ? 1 : 2);
  await expect(page.locator('body')).toHaveClass(/legend-phaser-title-ui-active/);
  await page.locator('#newPrimary').click();
  await expect(page.locator('body')).toHaveClass(/legend-phaser-annals-ui-active/);
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
  await page.locator('#v094Name').fill('RendererQA');
  await page.locator('#v094Name').press('Enter');
  await expect(page.locator('body')).toHaveClass(/legend-phaser-creation-ui-active/);
  await page.locator('[data-gender="woman"]').click();
  await expect(page.locator('[data-gender="woman"]')).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => {
    LegendStorage.savePlayer(LegendStorage.normalize({ username: 'RendererQA', hp: 40, maxHp: 40,
      flags: { introV094Complete: true, firstRoadReturnSeen: true, openingRoadV140: { completed: true, phase: 'complete' } } }));
    LegendRoadControllerV100.renderExpedition();
  });
  await page.locator('#exp150OpenMap').click();
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadMapUi)).toBe(true);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(() => page.evaluate(() => {
    const s = LegendPhaserWorldV1.snapshot();
    return s.nativeRoadMapUi && !s.nativeCreationUi && s.nativeCreationUiObjectCount === 0;
  })).toBe(true);
  await page.locator('#exp150ModalClose').click();
  await expect(page.locator('#exp150Modal')).toBeHidden();
  // Shutdown restores visible semantic route controls on either renderer.
  await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    window.__resizeHandlers = scene.scale.listenerCount('resize');
    scene.scene.stop();
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    return { detached: LegendPhaserWorldV1.snapshot() === null,
      handlersRemoved: scene.scale.listenerCount('resize') < window.__resizeHandlers,
      hudBound: Boolean(scene.nativeHudUiBoundElement),
      concealed: document.querySelectorAll('[data-legend-phaser-road-action-control]').length };
  })).toEqual({ detached: true, handlersRemoved: true, hudBound: false, concealed: 0 });
  await expect(page.locator('#routeRidge')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
  await page.locator('#routeRidge').click();
  await expect(page.locator('.exp100-poi-done')).toContainText('High Ridge');
});
