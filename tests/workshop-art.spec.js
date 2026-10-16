const { test, expect } = require('@playwright/test');

const generatedAssets = [
  'assets/generated/items/crafting-icon-atlas.webp',
  'assets/generated/items/materials/road-herb-bundle.webp',
  'assets/generated/items/materials/blackroot-tonic-ingredients.webp',
  'assets/generated/items/materials/hunters-charm.webp',
  'assets/generated/items/materials/iron-ore-chunk.webp',
  'assets/generated/items/materials/torn-hide.webp',
  'assets/generated/items/materials/reinforced-buckle.webp',
  'assets/generated/items/materials/bell-fragment.webp',
  'assets/generated/items/materials/lamp-oil.webp',
  'assets/generated/items/materials/trade-bundle.webp',
  'assets/generated/items/armor-icon-atlas.webp',
  'assets/generated/items/armor/cloth-armor.webp',
  'assets/generated/items/armor/chain-armor.webp',
  'assets/generated/items/armor/bronze-armor.webp',
  'assets/generated/items/armor/iron-armor.webp',
  'assets/generated/ui/region-shop-icon-atlas.webp',
  'assets/generated/ui/region-shops/ashmere-trader.webp',
  'assets/generated/ui/region-shops/ashmere-forge.webp',
  'assets/generated/ui/region-shops/ashmere-workbench.webp',
  'assets/generated/ui/region-shops/ashmere-inn.webp',
  'assets/generated/ui/region-shops/greyfen-market.webp',
  'assets/generated/ui/region-shops/greyfen-forge.webp',
  'assets/generated/ui/region-shops/greyfen-workbench.webp',
  'assets/generated/ui/region-shops/greyfen-ferryman.webp',
  'assets/generated/ui/region-shops/greyfen-apothecary.webp'
];

test('workshop art assets are served locally', async ({ request }) => {
  for (const asset of generatedAssets) {
    const response = await request.get('/' + asset);
    expect(response.status(), asset).toBe(200);
    expect(response.headers()['content-type'] || '', asset).toMatch(/image\//);
  }
});

test('Crafting Bench shows ingredients, recipe feedback, and armor comparisons', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.evaluate(() => {
    const player = {
      username: 'Workshop QA',
      className: 'Adventurer',
      level: 5,
      xp: 0,
      hp: 110,
      maxHp: 110,
      gold: 2000,
      currentRegion: 'Ashmere',
      weapon: 'woodenSword',
      armor: 'clothArmor',
      ownedWeapons: { woodenSword: 1 },
      ownedArmor: { clothArmor: 1 },
      inventory: {
        roadHerb: 3, clothScrap: 2, blackrootThorn: 2, wolfFang: 4,
        camp: 2, ore: 2, tornHide: 2, bellFragment: 2, oil: 2,
        goblinTrinket: 3, woodScrap: 2, roadToken: 0
      },
      flags: {},
      questLog: [],
      memories: []
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await page.locator('.ash100-destination').filter({ hasText: /Forge & Workshop/ }).click();
  await expect(page.locator('.ash099-forge-console')).toBeVisible();
  await page.locator('[data-forge-tab="armor"]').click();
  await expect(page.locator('.ash099-gear-item')).toHaveCount(4);
  await expect(page.locator('.ash099-gear-compare').first()).toBeVisible();
  await expect(page.locator('.ash099-gear-art').first()).toHaveAttribute('src', /assets\/generated\/items\/armor\//);
  await page.locator('[data-forge-tab="craft"]').click();
  await expect(page.locator('.ash099-craft-card')).toHaveCount(6);
  await expect(page.locator('.ash099-craft-ingredient img').first()).toBeVisible();
  await page.locator('[data-craft="roadPoultice"]').click();
  await expect(page.locator('.ash099-craft-feedback')).toContainText('Crafted Road Poultice');
  expect(errors).toEqual([]);
});
