const { test, expect } = require('@playwright/test');

// Complement service-specific purchase/reward/save assertions with delayed
// layout checks. Enter every catalog destination through its real town button.
for (const region of ['Ashmere', 'Greyfen']) for (const viewport of [
  { width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }
]) test(`${region} service transitions remain stable over time at ${viewport.width}`, async ({ page }, info) => {
  test.setTimeout(180000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(region => {
    const player = LegendStorage.normalize({ username: 'TimedServices', currentRegion: region, town: region,
      className: 'Ranger', level: 5, hp: 120, maxHp: 120, gold: 500, inventory: { food: 3, potion: 2, roadToken: 5 },
      discoveredRegions: ['Ashmere', 'Greyfen'], unlockedRegions: ['Ashmere', 'Greyfen'],
      flags: { introV094Complete: true, firstRoadReturnSeen: true, greyfenDryCrossingComplete: true,
        openingRoadV140: { completed: true, phase: 'complete' } } });
    if (!LegendStorage.savePlayer(player)) throw new Error('Synthetic fixture was rejected');
    LegendAshmereV099.renderAshmere();
  }, region);
  const destinations = await page.locator('.ash100-destination').evaluateAll(nodes => nodes.map(node => node.dataset.ashView));
  expect(destinations.length).toBeGreaterThanOrEqual(9);
  for (const destination of destinations) {
    await test.step(destination, async () => {
      await page.locator(`.ash100-destination[data-ash-view="${destination}"]`).click();
      await expect(page.locator('.ash100-town')).toHaveCount(0);
      if (destination === 'road') {
        const foreground = await page.locator('#departureBegin').evaluate(node => getComputedStyle(node).color);
        await expect(page.locator('#departureBegin strong')).toHaveCSS('color', foreground);
        await expect(page.locator('#departureBegin small')).toHaveCSS('color', foreground);
      }
      const started = Date.now();
      for (const ms of [0, 1000, 3000, 5000]) {
        await page.waitForTimeout(Math.max(0, ms - (Date.now() - started)));
        const proof = await page.evaluate(() => {
          const root = document.getElementById('root');
          const controls = [...root.querySelectorAll('button,a,input')].filter(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
          const nameless = controls.filter(node => !(node.textContent.trim() || node.getAttribute('aria-label') || node.labels?.length || node.title || node.value));
          return { overflow: document.documentElement.scrollWidth > innerWidth,
            controls: controls.length, nameless: nameless.map(node => node.id),
            filter: getComputedStyle(root).filter, visibility: getComputedStyle(root).visibility };
        });
        expect(proof.overflow, `${destination} at ${ms}ms`).toBe(false);
        expect(proof.controls).toBeGreaterThan(0);
        expect(proof.nameless).toEqual([]);
        expect(proof.filter).toBe('none');
        expect(proof.visibility).toBe('visible');
        await page.screenshot({ path: info.outputPath(`${destination}-${ms}.png`) });
      }
      // The persistent navigation's town action preserves each service's own
      // state; its semantics are checked separately by the regional suites.
      await page.locator('.lws-bottom-bar [data-world-action="world"]').click();
      if (destination === 'marsh') {
        await expect(page.getByRole('main', { name: 'Marsh expedition results' })).toBeVisible();
        await page.locator('#gfm160ResultReturn').click();
      }
      await expect(page.locator('.ash100-town')).toBeVisible();
    });
  }
  expect(errors).toEqual([]);
});
