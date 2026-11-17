const { test, expect } = require('@playwright/test');

async function growth(page) {
  if (!await page.locator('#legendLevelUpOverlay').count()) return;
  const total = Number((await page.locator('#v152-growth-total').textContent()).split('/').pop().trim());
  for (let point = 0; point < total; point++) await page.locator('[data-attr-add="might"]').click();
  await page.locator('#v152-growth-confirm').click();
}

async function fight(page) {
  await expect(page.locator('.rpg-battle')).toBeVisible();
  for (let turn = 0; turn < 60 && await page.locator('.rpg-battle').count(); turn++) {
    const player = await page.evaluate(() => LegendStorage.loadPlayer());
    let command = '#strike';
    if (player.hp < player.maxHp * 0.55 && await page.locator('#item').isEnabled()) command = '#item';
    else if (await page.locator('#skill').isEnabled()) command = '#skill';
    else if (await page.locator('.rpg-intent-heavy').count()) command = '#guard';
    await page.locator(command).click();
  }
  await expect(page.locator('.rpg-battle')).toHaveCount(0);
  await growth(page);

}

async function timed(page, info, name) {
  // Short landscape views must sample the actionable part of the scrolling
  // screen as well as exercise it; a screenshot of only the header is not
  // evidence that the encounter/return controls remain painted.
  if (page.viewportSize().height < 500) {
    const target = {
      'cellar-entry': '#vaultBegin', 'cellar-keeper': '#vaultFight',
      'cellar-combat': '#strike', 'cellar-results': '#v152CombatContinue',
      'storehouse-entry': '#gss170Begin', 'storehouse-records': '#gss170Fight',
      'storehouse-results': '#gss170Collect', 'greyfen-crafted': '[data-craft="marshParcel"]'
    }[name];
    await page.locator(target).scrollIntoViewIfNeeded();
  }
  const start = Date.now();
  for (const elapsed of [0, 1000, 3000, 5000]) {
    await page.waitForTimeout(Math.max(0, elapsed - (Date.now() - start)));
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({ path: info.outputPath(`${name}-${elapsed}.png`) });
  }
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`ordinary regional traveler completes real Cellar and Storehouse encounters at ${viewport.width}`, async ({ page }, info) => {
    test.setTimeout(180000); // Includes explicit timed samples across both delves.
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady && !document.documentElement.classList.contains('engine-intro-active'));
    // A plausible returning traveler. No enemy, RNG, combat handler, reward or
    // later save mutation is substituted: every subsequent state comes from UI.
    await page.evaluate(() => {
      LegendStorage.savePlayer(LegendStorage.normalize({ username: 'RegionalTraveler', className: 'Ranger',
        currentRegion: 'Ashmere', level: 3, xp: 0, hp: 115, maxHp: 115, gold: 300,
        weapon: 'hand', armor: 'none', inventory: { food: 3, potion: 4, camp: 1, roadToken: 5, clothScrap: 1 },
        flags: { introV094Complete: true, firstRoadReturnSeen: true, greyfenDryCrossingComplete: true,
          openingRoadV140: { completed: true, phase: 'complete' } } }));
      LegendAshmereV099.renderAshmere();
    });
    await page.locator('.ash100-destination[data-ash-view="dungeon"]').click();
    await timed(page, info, 'cellar-entry');
    for (const id of ['vaultBegin', 'vaultDescend', 'vaultReadGlyphs', 'vaultCopyRunes']) await page.locator('#' + id).click();
    await timed(page, info, 'cellar-keeper');
    await page.locator('#vaultFight').click();
    await timed(page, info, 'cellar-combat');
    await fight(page);
    await expect(page.locator('.v152-results-heading h1')).toHaveText('Victory');
    await timed(page, info, 'cellar-results');
    await page.locator('#v152CombatContinue').click();
    await page.locator('#vaultCollect').click();
    await growth(page);
    await expect.poll(() => page.evaluate(() => LegendStorage.loadPlayer().flags.bellVaultV100.completed)).toBe(true);
    await page.locator('#vaultReturn').click();
    await page.locator('.ash100-destination[data-ash-view="inn"]').click();
    await page.locator('#rest').click();
    await page.locator('#ashBack').click();
    await page.locator('.ash100-destination[data-ash-view="regions"]').click();
    await page.locator('[data-unlock="Greyfen"]').click();
    await expect.poll(() => page.evaluate(() => LegendStorage.loadPlayer().currentRegion)).toBe('Greyfen');
    await page.locator('#regBack').click();
    await page.locator('.ash100-destination[data-ash-view="storehouse"]').click();
    await timed(page, info, 'storehouse-entry');
    for (const id of ['gss170Begin', 'gss170Upper', 'gss170ReadDispatch', 'gss170Salvage']) await page.locator('#' + id).click();
    await timed(page, info, 'storehouse-records');
    await page.locator('#gss170Fight').click();
    await fight(page);
    // The existing Storehouse controller returns directly to its treasure
    // report; Bell Cellar uses the separate combat debrief above.
    await expect(page.locator('.gss170-page')).toHaveAttribute('data-storehouse-state', 'treasure');
    await timed(page, info, 'storehouse-results');
    await page.locator('#gss170Collect').click();
    await growth(page);
    await page.locator('#gss170Return').click();
    await page.locator('.ash100-destination[data-ash-view="smith"]').click();
    await page.getByRole('tab', { name: 'Crafting Bench', exact: true }).click();
    await page.locator('[data-craft="marshParcel"]').click();
    await expect(page.locator('.ash099-craft-feedback')).toContainText('Crafted Peat-Wrapped Parcel');
    await timed(page, info, 'greyfen-crafted');
    const saved = await page.evaluate(() => LegendStorage.loadPlayer());
    expect(saved.flags.bellVaultV100.completed).toBe(true);
    expect(saved.flags.greyfenStorehouseV170.completed).toBe(true);
    expect(saved.flags.greyfenStorehouseDispatchFound).toBe(true);
    expect(saved.inventory.marshParcel).toBe(1);
    await page.reload();
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.getByRole('button', { name: /^Continue/i }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    // Continue applies the existing regional town normalization. All other
    // character, reward, inventory and story fields must remain identical.
    expect(await page.evaluate(() => LegendStorage.loadPlayer())).toEqual({ ...saved, town: 'Greyfen' });
    expect(errors).toEqual([]);
  });
}
