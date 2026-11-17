const { test, expect } = require('@playwright/test');

test('handoff waits for a painted frame and cancels obsolete render callbacks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady && !document.documentElement.classList.contains('engine-intro-active'));
  await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    window.__paintListenerCounts = ['prerender', 'postrender'].map(event => scene.game.events.listenerCount(event));
    scene.game.loop.sleep();
    LegendBeginningV094.startCreation();
  });
  await expect(page.locator('#v094Name')).toBeVisible();
  await page.locator('#v094Name').fill('PaintWitness');
  await page.waitForTimeout(300);
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);
  expect(await page.locator('.v094-beginning-card h1,.v094-beginning-card h2').first().evaluate(node => getComputedStyle(node).color)).not.toBe('rgba(0, 0, 0, 0)');
  // DOM actions still work while the renderer is asleep; old callbacks cannot
  // publish name-entry objects over the next selection step when it wakes.
  await page.locator('#v094Next').click();
  await expect(page.locator('[data-gender="unspoken"]')).toBeVisible();
  await page.waitForTimeout(300);
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);
  expect(await page.evaluate(() => {
    const game=LegendPhaserWorldV1.engine;
    return ['prerender', 'postrender'].map((event, i) => game.events.listenerCount(event) - window.__paintListenerCounts[i]);
  })).toEqual([1, 1]);
  await page.evaluate(() => LegendPhaserWorldV1.engine.scene.getScene('RealmScene').game.loop.wake());
  await expect(page.locator('body')).toHaveClass(/legend-phaser-creation-ui-active/);
  const proof = await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    return { published: scene.nativeCreationUiObjects.every(o => o.active), step: LegendPhaserWorldV1.snapshot().nativeCreationUiStep, listeners: ['prerender', 'postrender'].map((event, i) => scene.game.events.listenerCount(event) - window.__paintListenerCounts[i]) };
  });
  expect(proof).toEqual({ published: true, step: 2, listeners: [0, 0] });
});
