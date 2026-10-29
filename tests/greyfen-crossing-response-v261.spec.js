const { test, expect } = require('@playwright/test');

async function openGreyfenArchive(page, { woodScrap = 1, flags = {} } = {}) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });

  await page.evaluate(({ woodScrap, flags }) => {
    const player = {
      username: 'CrossingResponseQA',
      className: 'Ranger',
      level: 5,
      xp: 0,
      hp: 110,
      maxHp: 110,
      gold: 100,
      currentRegion: 'Greyfen',
      town: 'Greyfen',
      discoveredRegions: ['Ashmere', 'Greyfen'],
      unlockedRegions: ['Ashmere', 'Greyfen'],
      weapon: 'woodenSword',
      armor: 'clothArmor',
      ownedWeapons: { woodenSword: 1 },
      ownedArmor: { clothArmor: 1 },
      inventory: {
        woodScrap: woodScrap,
        food: 3,
        camp: 2,
        roadHerb: 1,
        peatBrick: 1,
        clothScrap: 1,
        roadToken: 0
      },
      flags: { greyfenEvidenceFiled: true, ...flags },
      stats: {},
      memories: ['Mara preserved the field note, overwritten ledger, and earlier weekly return.'],
      questLog: [],
      quests: {}
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.route('archive');
  }, { woodScrap, flags });

  await expect(page.locator('.ash099-crossing-response')).toBeVisible();
}

test.describe('Greyfen crossing response v0.26.0', () => {
  test('posting a notice costs one Wood Scrap and eases the next route pressure once', async ({ page }) => {
    await openGreyfenArchive(page, { woodScrap: 1 });
    await expect(page.locator('[data-greyfen-crossing-response="provisional-notice"]')).toBeEnabled();
    await expect(page.locator('[data-greyfen-crossing-response="sealed-pending-order"]')).toBeEnabled();

    await page.locator('[data-greyfen-crossing-response="provisional-notice"]').click();
    await expect(page.locator('.ash099-crossing-response')).toContainText('NOTICE POSTED');
    const posted = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        response: player.flags.greyfenCrossingResponseV261,
        woodScrap: Number(player.inventory.woodScrap || 0),
        credit: Boolean(player.flags.greyfenNoticePressureCreditV261),
        memory: player.memories.some(line => line.includes('provisional safety notice'))
      };
    });
    expect(posted).toEqual({
      response: 'provisional-notice',
      woodScrap: 0,
      credit: true,
      memory: true
    });

    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    const afterReload = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        response: player.flags.greyfenCrossingResponseV261,
        woodScrap: Number(player.inventory.woodScrap || 0),
        credit: Boolean(player.flags.greyfenNoticePressureCreditV261)
      };
    });
    expect(afterReload).toEqual({ response: 'provisional-notice', woodScrap: 0, credit: true });
    await expect(page.locator('[data-greyfen-crossing-response]')).toHaveCount(0);

    await page.evaluate(() => window.LegendGreyfenMarshV160.start());
    await expect(page.locator('#gfm160Begin')).toBeVisible();
    await page.locator('#gfm160Begin').click();
    await page.locator('#gfm160ChooseRaised').click();
    const route = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        pressure: Number(player.flags?.greyfenMarshExpeditionV160?.pressure || 0),
        credit: Boolean(player.flags.greyfenNoticePressureCreditV261),
        used: Boolean(player.flags.greyfenNoticePressureUsedV261),
        journal: JSON.stringify(player.flags?.greyfenMarshFieldJournalV160 || {})
      };
    });
    expect(route.pressure).toBe(0);
    expect(route.credit).toBe(false);
    expect(route.used).toBe(true);
    expect(route.journal).toContain('provisional safety notice');
  });

  test('keeping the report sealed preserves resources and grants no pressure credit', async ({ page }) => {
    await openGreyfenArchive(page, { woodScrap: 1 });
    await page.locator('[data-greyfen-crossing-response="sealed-pending-order"]').click();
    await expect(page.locator('.ash099-crossing-response')).toContainText('REPORT SEALED');
    const saved = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        response: player.flags.greyfenCrossingResponseV261,
        woodScrap: Number(player.inventory.woodScrap || 0),
        credit: Boolean(player.flags.greyfenNoticePressureCreditV261),
        memory: player.memories.some(line => line.includes('keep Greyfen’s crossing evidence sealed'))
      };
    });
    expect(saved).toEqual({
      response: 'sealed-pending-order',
      woodScrap: 1,
      credit: false,
      memory: true
    });
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.ash099-crossing-response')).toContainText('REPORT SEALED');
    await expect(page.locator('[data-greyfen-crossing-response]')).toHaveCount(0);
  });

  test('the notice choice stays unavailable without its one Wood Scrap cost', async ({ page }) => {
    await openGreyfenArchive(page, { woodScrap: 0 });
    await expect(page.locator('[data-greyfen-crossing-response="provisional-notice"]')).toBeDisabled();
    await expect(page.locator('[data-greyfen-crossing-response="provisional-notice"]')).toContainText('Requires 1 Wood Scrap');
    await page.locator('[data-greyfen-crossing-response="sealed-pending-order"]').click();
    const saved = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        response: player.flags.greyfenCrossingResponseV261,
        woodScrap: Number(player.inventory.woodScrap || 0)
      };
    });
    expect(saved).toEqual({ response: 'sealed-pending-order', woodScrap: 0 });
  });
});
