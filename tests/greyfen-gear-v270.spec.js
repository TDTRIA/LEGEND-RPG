const { test, expect } = require('@playwright/test');

async function openForge(page, region) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.evaluate(region => {
    const player = {
      username: 'GreyfenGearQA',
      className: 'Ranger',
      level: 3,
      xp: 0,
      hp: 110,
      maxHp: 110,
      gold: 1000,
      town: region,
      currentRegion: region,
      weapon: 'woodenSword',
      armor: 'clothArmor',
      ownedWeapons: { woodenSword: 1 },
      ownedArmor: { clothArmor: 1 },
      inventory: { food: 3, camp: 1, roadHerb: 1, clothScrap: 1, woodScrap: 1, roadToken: 0 },
      flags: {},
      memories: [],
      questLog: [],
      quests: [],
      discoveredRegions: ['Ashmere', 'Greyfen'],
      unlockedRegions: ['Ashmere', 'Greyfen']
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.route('forge');
  }, region);
  await expect(page.locator('.ash099-forge-console')).toBeVisible();
  await page.locator('[data-forge-tab="armor"]').click();
}

test.describe('Greyfen regional gear — v0.27.0', () => {
  test('Marshguard Coat is not sold in Ashmere', async ({ page }) => {
    await openForge(page, 'Ashmere');
    await expect(page.locator('.ash099-gear-item')).toHaveCount(4);
    await expect(page.locator('[data-gear="marshguardCoat"]')).toHaveCount(0);
  });

  test('Greyfen sells the Marshguard Coat, equips its defense, and preserves it across regions', async ({ page }) => {
    await openForge(page, 'Greyfen');
    await expect(page.locator('.ash099-gear-item')).toHaveCount(5);
    const coat = page.locator('[data-gear="marshguardCoat"]');
    await expect(coat).toBeVisible();
    await expect(coat).toContainText('Defense 32');
    await expect(coat).toContainText('280g');
    await coat.click();
    await expect(page.locator('.ash099-note')).toContainText('Purchased and equipped Marshguard Coat');

    const purchased = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      const armor = window.LEGEND_DATA.armors.find(item => item.id === player.armor);
      return {
        region: player.currentRegion,
        armor: player.armor,
        defense: armor?.defense,
        gold: Number(player.gold || 0),
        owned: Number(player.ownedArmor?.marshguardCoat || 0)
      };
    });
    expect(purchased).toEqual({
      region: 'Greyfen',
      armor: 'marshguardCoat',
      defense: 32,
      gold: 720,
      owned: 1
    });

    await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      player.currentRegion = 'Ashmere';
      player.town = 'Ashmere';
      player.armor = 'clothArmor';
      window.LegendRuntimeV120.savePlayer(player);
      window.LegendAshmereV099.route('forge');
    });
    await page.locator('[data-forge-tab="armor"]').click();
    const ownedCoat = page.locator('[data-gear="marshguardCoat"]');
    await expect(ownedCoat).toBeVisible();
    await expect(ownedCoat).toBeEnabled();
    await ownedCoat.click();

    const equipped = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        region: player.currentRegion,
        armor: player.armor,
        gold: Number(player.gold || 0),
        owned: Number(player.ownedArmor?.marshguardCoat || 0)
      };
    });
    expect(equipped).toEqual({
      region: 'Ashmere',
      armor: 'marshguardCoat',
      gold: 720,
      owned: 1
    });
  });
});
