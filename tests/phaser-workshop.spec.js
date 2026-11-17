const { test, expect } = require('@playwright/test');
test.use({ hasTouch: true });

async function enter(page, width, view, additions = {}) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
  await page.evaluate(({ view, additions }) => {
    window.LegendStorage.savePlayer(window.LegendStorage.normalize({
      username: 'WorkshopQA', className: 'Ranger', keepsake: 'Old Map', hp: 23, maxHp: 40, level: 2, xp: 45, gold: 500,
      currentRegion: 'Ashmere', discoveredRegions: ['Ashmere', 'Greyfen'],
      weapon: 'woodenSword', armor: 'clothArmor', ownedWeapons: { woodenSword: 1, steelSword: 1 }, ownedArmor: { clothArmor: 1 },
      inventory: { roadHerb: 2, clothScrap: 1, bellFragment: 1, oil: 1, roadToken: 4, futureMaterial: 9 },
      flags: { introV094Complete: true, futureWorkshopFlag: 'keep' }, futureExtension: { keep: true }, ...additions
    }));
    window.LegendAshmereV099.renderAshmere(); window.LegendAshmereV099.route(view);
  }, { view, additions });
}
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('legend-roads-of-ashmere-v09')));
const native = page => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeWorkshop);

for (const width of [1440, 390]) {
  test(`forge preserves ownership, restrictions and regional equipment at ${width}px`, async ({ page }) => {
    test.setTimeout(150000);
    await enter(page, width, 'smith');
    const expected = await saved(page);
    await expect.poll(async () => (await native(page)).active).toBe(true);
    expect((await native(page)).labels).toEqual(expect.arrayContaining(['The Blacksmith', 'Level 2 · Ranger', 'Wooden Sword', 'Damage 14–34', 'Defense 10', '500g', 'Requires level 4', 'EQUIPPED']));
    await expect(page.locator('[data-gear="ironSword"]')).toBeDisabled();
    await page.locator('[data-gear="ironSword"]').evaluate(node => node.click());
    expect(await saved(page)).toEqual(expected);
    await page.locator('[data-gear="bronzeSword"]').focus(); await page.keyboard.press('Enter');
    expected.gold = 220; expected.weapon = 'bronzeSword'; expected.ownedWeapons.bronzeSword = 1;
    expect(await saved(page)).toEqual(expected);
    await expect(page.locator('[data-forge-tab="weapon"]')).toBeFocused();
    await expect.poll(async () => (await native(page)).labels).toContain('Purchased and equipped Bronze Sword.');
    await page.locator('[data-gear="woodenSword"]').tap();
    expected.weapon = 'woodenSword'; expect(await saved(page)).toEqual(expected);
    // Previously owned gear remains equip-able below its purchase level.
    await expect(page.locator('[data-gear="steelSword"]')).toBeEnabled();
    await page.locator('[data-gear="steelSword"]').tap();
    expected.weapon = 'steelSword'; expect(await saved(page)).toEqual(expected);
    await expect.poll(async () => (await native(page)).labels).toContain('Damage 48–108');
    await page.locator('[data-forge-tab="armor"]').focus(); await page.keyboard.press('Enter');
    await expect(page.locator('[data-forge-tab="armor"]')).toBeFocused();
    await expect(page.locator('[data-gear="bronzeArmor"]')).toBeDisabled();
    await expect(page.locator('[data-gear="marshguardCoat"]')).toHaveCount(0);
    await page.locator('[data-gear="chainArmor"]').tap();
    expected.gold = 40; expected.armor = 'chainArmor'; expected.ownedArmor.chainArmor = 1;
    expect(await saved(page)).toEqual(expected);
    await expect.poll(async () => (await native(page)).labels).toContain('Defense 22');
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
    await expect.poll(async () => (await native(page)).active).toBe(false);
    await page.evaluate(() => {
      const p = window.LegendStorage.loadPlayer(); p.currentRegion = 'Greyfen'; p.gold = 300;
      window.LegendStorage.savePlayer(p); window.LegendAshmereV099.route('smith');
    });
    const marsh = await saved(page);
    await page.locator('[data-forge-tab="armor"]').tap();
    await expect.poll(async () => (await native(page)).labels).toContain('Causeway Smithy');
    await page.locator('[data-gear="marshguardCoat"]').tap();
    marsh.gold = 20; marsh.armor = 'marshguardCoat'; marsh.ownedArmor.marshguardCoat = 1;
    expect(await saved(page)).toEqual(marsh);
    await expect.poll(async () => (await native(page)).labels).toContain('Defense 32');
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    expect(await saved(page)).toEqual(marsh);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`crafting consumes exact ingredients and connects Greyfen trade at ${width}px`, async ({ page }) => {
    test.setTimeout(150000);
    await enter(page, width, 'smith');
    const expected = await saved(page);
    await page.locator('[data-forge-tab="craft"]').tap();
    await expect.poll(async () => (await native(page)).mode).toBe('craft');
    await expect(page.locator('[data-craft]')).toHaveCount(6);
    expect((await native(page)).labels).toContain('1 Bell Fragments (1)');
    // Missing required recipe metadata must also restore DOM without throwing.
    const wick = page.locator('[data-craft="wispLanternWick"]');
    const needs = await wick.getAttribute('data-needs');
    await wick.evaluate(node => node.removeAttribute('data-needs'));
    await expect.poll(async () => (await native(page)).active).toBe(false);
    await wick.evaluate((node, value) => node.setAttribute('data-needs', value), needs);
    await expect.poll(async () => (await native(page)).active).toBe(true);
    await expect(page.locator('[data-craft="huntersCharm"]')).toBeDisabled();
    await page.locator('[data-craft="huntersCharm"]').evaluate(node => node.click());
    expect(await saved(page)).toEqual(expected);
    await page.locator('[data-craft="wispLanternWick"]').focus(); await page.keyboard.press('Enter');
    expected.inventory.bellFragment = 0; expected.inventory.oil = 0; expected.inventory.wispLanternWick = 1;
    expect(await saved(page)).toEqual(expected);
    await expect(page.locator('#ashCraftFeedback')).toBeFocused();
    await expect.poll(async () => (await native(page)).labels).toContain('Crafted Wisp Lantern Wick. Ingredients used: 1 Bell Fragments, 1 Lamp Oil.');
    await page.locator('[data-craft="roadPoultice"]').tap();
    expected.inventory.roadHerb = 0; expected.inventory.clothScrap = 0; expected.inventory.roadPoultice = 1;
    expect(await saved(page)).toEqual(expected);
    await expect.poll(async () => (await native(page)).labels).toContain('2 Road Herb (0)');
    await page.locator('#openTrader').tap();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeMarket.active)).toBe(true);
    expect(await saved(page)).toEqual(expected);
    await page.locator('#ashBack').tap();
    await page.evaluate(() => {
      const p = window.LegendStorage.loadPlayer(); p.currentRegion = 'Greyfen'; p.inventory.peatBrick = 2; p.inventory.clothScrap = 1;
      window.LegendStorage.savePlayer(p); window.LegendAshmereV099.route('craft');
    });
    const marsh = await saved(page);
    await expect.poll(async () => (await native(page)).labels).toContain('Marsh Workbench');
    await expect(page.locator('[data-craft]')).toHaveCount(7);
    // Incomplete source restores the styled original recipe; its action still works.
    await page.locator('[data-craft="marshParcel"] .ash099-craft-needs > b').evaluate(node => node.remove());
    await expect.poll(async () => (await native(page)).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.locator('[data-craft="marshParcel"]').tap();
    marsh.inventory.peatBrick = 0; marsh.inventory.clothScrap = 0; marsh.inventory.marshParcel = 1;
    expect(await saved(page)).toEqual(marsh);
    await expect.poll(async () => (await native(page)).active).toBe(true);
    const backBox = await page.locator('#ashBack').evaluate(node => { node.scrollIntoView({ block: 'center' }); return node.getBoundingClientRect().toJSON(); });
    const dock = await page.locator('.lws-bottom-bar').boundingBox();
    expect(backBox.bottom).toBeLessThanOrEqual(dock.y);
    await page.locator('#openTrader').tap();
    await page.locator('[data-market-tab="sell"]').tap();
    await expect(page.locator('[data-sell="marshParcel"] .ash099-market-price')).toHaveText('34g');
    await page.locator('[data-sell="marshParcel"]').tap();
    marsh.gold += 34; marsh.inventory.marshParcel = 0;
    expect(await saved(page)).toEqual(marsh);
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    expect(await saved(page)).toEqual(marsh);
  });
}
