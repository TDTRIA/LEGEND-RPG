const { test, expect } = require('@playwright/test');

test.setTimeout(60000);

async function openGame(page, width = 1440) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
}

test('production uses the DOM curtain as its only scene-transition presentation', async ({ page }) => {
  await openGame(page);
  expect(await page.evaluate(() => Boolean(window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene').transitionUi))).toBe(false);

  const before = Date.now();
  await page.getByRole('button', { name: /News & Roadmap/i }).click();
  const curtain = page.locator('#legend-scene-curtain');
  await expect(curtain).toHaveClass(/is-covering/);
  await expect(curtain).toContainText('NEWS & ROADMAP');
  await expect(curtain).not.toHaveClass(/is-covering/, { timeout: 2500 });
  await expect(curtain).not.toHaveClass(/is-revealing/, { timeout: 2500 });
  expect(Date.now() - before).toBeLessThan(1600);

  const proof = await page.evaluate(() => ({
    duplicatePainter: document.body.classList.contains('legend-phaser-transition-active'),
    opacity: document.body.style.getPropertyValue('--legend-transition-opacity'),
    nativeTransition: window.LegendPhaserWorldV1.snapshot()?.nativeTransition
  }));
  expect(proof.duplicatePainter).toBe(false);
  expect(proof.opacity).toBe('');
  expect(proof.nativeTransition).toBeFalsy();
  await expect(page.getByRole('heading', { name: 'News & Roadmap' })).toBeVisible();
});

test('short transitions preserve mobile navigation and reduced-motion behavior', async ({ page }) => {
  await openGame(page, 390);
  await page.getByRole('button', { name: /News & Roadmap/i }).tap();
  await expect(page.getByRole('heading', { name: 'News & Roadmap' })).toBeVisible();
  await expect(page.locator('#legend-scene-curtain')).not.toHaveClass(/is-covering|is-revealing/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const calls = await page.evaluate(() => {
    let count = 0;
    const result = window.LegendSceneTransitionsV120.transitionTo('No motion', () => ++count);
    return { count, result, active: Boolean(document.querySelector('#legend-scene-curtain.is-covering')) };
  });
  expect(calls).toEqual({ count: 1, result: 1, active: false });
});
