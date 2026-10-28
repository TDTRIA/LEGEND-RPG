const { test, expect } = require('@playwright/test');

async function openCraftingBench(page, region, inventoryOverrides = {}) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });

  await page.evaluate(({ region, inventoryOverrides }) => {
    const player = {
      username: 'GreyfenResourceQA',
      className: 'Adventurer',
      level: 5,
      xp: 0,
      hp: 120,
      maxHp: 120,
      gold: 100,
      town: region,
      currentRegion: region,
      weapon: 'woodenSword',
      armor: 'clothArmor',
      ownedWeapons: { woodenSword: 1 },
      ownedArmor: { clothArmor: 1 },
      inventory: {
        food: 3,
        camp: 2,
        potion: 1,
        roadHerb: 0,
        clothScrap: 0,
        peatBrick: 0,
        oil: 0,
        woodScrap: 0,
        ...inventoryOverrides
      },
      flags: {},
      stats: {},
      traits: [],
      skills: {},
      mastery: {},
      memories: [],
      questLog: [],
      quests: {},
      discoveredRegions: ['Ashmere', 'Greyfen'],
      unlockedRegions: ['Ashmere', 'Greyfen']
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.route('craft');
  }, { region, inventoryOverrides });

  await expect(page.locator('.ash099-craft-card').first()).toBeVisible();
}

test.describe('Greyfen resource loop — Phase 8', () => {
  test('Greyfen can turn peat and cloth into a parcel, then sell it and reload safely', async ({ page }) => {
    await openCraftingBench(page, 'Greyfen', { peatBrick: 2, clothScrap: 1 });
    await expect(page.locator('.ash099-craft-card')).toHaveCount(7);

    const recipe = page.locator('.ash099-craft-card[data-craft="marshParcel"][data-needs="peatBrick:2,clothScrap:1"]');
    await expect(recipe).toBeVisible();
    await expect(recipe).toBeEnabled();
    await expect(recipe).toContainText('34g');

    await recipe.click();
    await expect(page.locator('.ash099-craft-feedback')).toContainText('Crafted Peat-Wrapped Parcel');

    const crafted = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        region: player.currentRegion,
        peatBrick: Number(player.inventory.peatBrick || 0),
        clothScrap: Number(player.inventory.clothScrap || 0),
        marshParcel: Number(player.inventory.marshParcel || 0),
        gold: Number(player.gold || 0)
      };
    });
    expect(crafted).toEqual({
      region: 'Greyfen',
      peatBrick: 0,
      clothScrap: 0,
      marshParcel: 1,
      gold: 100
    });

    await page.evaluate(() => window.LegendAshmereV099.route('trader'));
    await page.locator('[data-market-tab="sell"]').click();
    const sale = page.locator('[data-sell="marshParcel"]');
    await expect(sale).toBeVisible();
    expect(await sale.getAttribute('data-value')).toBe('34');
    await sale.click();

    const sold = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        region: player.currentRegion,
        marshParcel: Number(player.inventory.marshParcel || 0),
        gold: Number(player.gold || 0)
      };
    });
    expect(sold).toEqual({ region: 'Greyfen', marshParcel: 0, gold: 134 });

    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    const persisted = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        region: player.currentRegion,
        marshParcel: Number(player.inventory.marshParcel || 0),
        gold: Number(player.gold || 0)
      };
    });
    expect(persisted).toEqual({ region: 'Greyfen', marshParcel: 0, gold: 134 });
  });

  test('the Greyfen-only recipe is not offered at Ashmere', async ({ page }) => {
    await openCraftingBench(page, 'Ashmere', { peatBrick: 2, clothScrap: 1 });
    await expect(page.locator('.ash099-craft-card')).toHaveCount(6);
    await expect(page.locator('.ash099-craft-card[data-craft="marshParcel"]')).toHaveCount(0);
  });
});
