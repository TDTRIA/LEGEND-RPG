const { test, expect } = require('@playwright/test');

async function grow(page) {
  if (!await page.locator('#legendLevelUpOverlay').count()) return;
  const total = Number((await page.locator('#v152-growth-total').textContent()).split('/').pop().trim());
  for (let n = 0; n < total; n++) await page.locator('[data-attr-add="might"]').click();
  await page.locator('#v152-growth-confirm').click();
}
async function fight(page) {
  for (let n = 0; n < 60 && await page.locator('.rpg-battle').count(); n++) {
    const p = await page.evaluate(() => LegendStorage.loadPlayer());
    const command = p.hp < p.maxHp * 0.55 && await page.locator('#item').isEnabled() ? '#item'
      : await page.locator('#skill').isEnabled() ? '#skill'
      : await page.locator('.rpg-intent-heavy').count() ? '#guard' : '#strike';
    await page.locator(command).click();
  }
  await expect(page.locator('.rpg-battle')).toHaveCount(0);
  await grow(page);
  if (await page.locator('#v152CombatContinue').count()) await page.locator('#v152CombatContinue').click();
}
async function timed(page, info, name, control) {
  await page.locator(control).scrollIntoViewIfNeeded();
  const start = Date.now();
  for (const elapsed of [0, 1000, 3000, 5000]) {
    await page.waitForTimeout(Math.max(0, elapsed - (Date.now() - start)));
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await expect(page.locator(control)).toBeVisible();
    await page.screenshot({ path: info.outputPath(`${name}-${elapsed}.png`) });
  }
}
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`ordinary traveler completes Reed Cut and Marsh Path with saved reports at ${viewport.width}`, async ({ page }, info) => {
    test.setTimeout(180000); // Full real encounters and explicit timed acceptance samples.
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady && !document.documentElement.classList.contains('engine-intro-active'));
    await page.evaluate(() => {
      LegendStorage.savePlayer(LegendStorage.normalize({ username: 'ReedTraveler', className: 'Ranger',
        level: 3, hp: 115, maxHp: 115, gold: 300, currentRegion: 'Ashmere', weapon: 'hand', armor: 'none',
        inventory: { food: 5, potion: 4, camp: 2, roadToken: 5 },
        flags: { introV094Complete: true, firstRoadReturnSeen: true, greyfenDryCrossingComplete: true,
          openingRoadV140: { completed: true, phase: 'complete' } } }));
      LegendAshmereV099.renderAshmere();
    });
    await page.locator('.ash100-destination[data-ash-view="road"]').click();
    await page.locator('#departureBegin').click();
    await page.locator('#routeReeds').click();
    await timed(page, info, 'reed-choice', '#push');
    await page.locator('#push').click();
    await page.locator('#exp150OpenMap').click();
    await page.locator('[data-exp160-map-visit="sunken-cart"]').click();
    await page.locator('#exp160CartSalvage').click();
    await timed(page, info, 'reed-salvage', '#exp160ReturnToRoute');
    await page.locator('#exp160ReturnToRoute').click();
    await page.locator('#push').click();
    await fight(page);
    await page.locator('#campRest').click();
    for (let step = 0; step < 8 && !await page.locator('#finish').count(); step++) {
      await page.locator('#push').click();
      await fight(page);
    }
    await page.locator('#finish').click();
    await grow(page);
    await expect(page.getByRole('heading', { name: 'Expedition Secured' })).toBeVisible();
    await timed(page, info, 'reed-results', '#outcomeReturn');
    await page.locator('#outcomeReturn').click();
    await page.locator('.ash100-destination[data-ash-view="regions"]').click();
    await page.locator('[data-unlock="Greyfen"]').click();
    await page.locator('#regBack').click();
    await page.locator('.ash100-destination[data-ash-view="marsh"]').click();
    await page.locator('#gfm160Begin').click();
    await page.locator('#gfm160ChooseReeds').click();
    await page.locator('#gfm160VisitFerry').click();
    await timed(page, info, 'marsh-ferry', '#gfm160ReturnFromFerry');
    await page.locator('#gfm160ReturnFromFerry').click();
    await page.locator('#gfm160Continue').click();
    await page.locator('#gfm160PassSluice').click();
    await page.locator('#gfm160ContinueShelter').click();
    await page.locator('#gfm160Rest').click();
    await page.locator('#gfm160ContinueGauge').click();
    await page.locator('#gfm160InspectGauge').click();
    await page.locator('#gfm160Complete').click();
    await grow(page);
    await expect(page.getByRole('heading', { name: 'The Marsh Yields Its Record' })).toBeVisible();
    await timed(page, info, 'marsh-results', '#gfm160ResultReturn');
    await page.locator('#gfm160ResultReturn').click();
    const saved = await page.evaluate(() => LegendStorage.loadPlayer());
    expect(saved.flags.greyfenMarshPathComplete).toBe(true);
    expect(saved.flags.greyfenMarshExpeditionV160.lastResultV160.complete).toBe(true);
    expect(saved.flags.roadFieldJournalV150.discoveries.some(d => d.key === 'sunken-cart-salvage')).toBe(true);
    await page.reload();
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.getByRole('button', { name: /^Continue/i }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await page.evaluate(() => LegendStorage.loadPlayer())).toEqual({ ...saved, town: 'Greyfen' }); // Existing Continue regional normalization.
    expect(errors).toEqual([]);
  });
}
