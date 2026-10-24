const { test, expect } = require('@playwright/test');

test.describe('LegendRoadStateV100 compatibility contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('creates the existing expedition state shape and preserves its object identity', async ({ page }) => {
    const result = await page.evaluate(() => {
      const rules = window.LegendRoadStateV100.create({
        getData: () => window.LEGEND_DATA,
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
      });
      const player = {};
      const state = rules.state(player);
      return { flags: player.flags, sameReference: state === player.flags.roadExpeditionV100 };
    });

    expect(result.flags).toEqual({
      roadExpeditionV100: { stage: 0, pressure: 0, trips: 0, events: 0, finds: 0, battles: 0 }
    });
    expect(result.sameReference).toBe(true);
  });

  test('normalizes stage and pressure while preserving unrelated expedition fields', async ({ page }) => {
    const result = await page.evaluate(() => {
      const rules = window.LegendRoadStateV100.create({
        getData: () => window.LEGEND_DATA,
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
      });
      const player = { flags: { roadExpeditionV100: {
        stage: 9, pressure: 140, trips: 3, events: 4, finds: 5, battles: 6, routeChoice: 'ridge'
      } } };
      const state = rules.ensure(player);
      return { state, sameReference: state === player.flags.roadExpeditionV100 };
    });

    expect(result.state).toEqual({
      stage: 5, pressure: 100, trips: 3, events: 4, finds: 5, battles: 6, routeChoice: 'ridge',
      currentNodeIdV160: null, visitedNodeIdsV160: [], discoveredNodeIdsV160: [],
      completedInteractionIdsV160: [], activeSideTripV160: null, sideTripReturnNodeIdV160: null
    });
    expect(result.sameReference).toBe(true);
  });

  test('keeps class, origin, keepsake, and creation bonuses additive', async ({ page }) => {
    const result = await page.evaluate(() => {
      const data = {
        classes: { Warrior: { mod: { strength: 3 } } },
        origins: { 'Lost Squire': { bonus: { strength: 1 } } },
        keepsakes: { 'Rusty Charm': { bonus: { luck: 2 } } },
        weapons: [], armors: [], itemNames: {}
      };
      const rules = window.LegendRoadStateV100.create({
        getData: () => data,
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
      });
      return rules.score({
        className: 'Warrior', origin: 'Lost Squire', keepsake: 'Rusty Charm',
        creationV094: { bonuses: { strength: 2 } }
      }, 'strength');
    });

    expect(result).toBe(6);
  });

  test('preserves legacy creation bonuses while newer choices take precedence', async ({ page }) => {
    const result = await page.evaluate(() => {
      const data = { classes: {}, origins: {}, keepsakes: {}, weapons: [], armors: [], itemNames: {} };
      const rules = window.LegendRoadStateV100.create({
        getData: () => data,
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
      });
      const legacy = {
        className: 'Unknown', origin: 'Unknown', keepsake: 'Unknown',
        creationV090: { bonuses: { lore: 2, luck: 2 } },
        creationV094: { bonuses: {} }
      };
      const updated = {
        ...legacy,
        creationV094: { bonuses: { luck: 1 } }
      };
      return {
        legacyLore: rules.score(legacy, 'lore'),
        legacyLuck: rules.score(legacy, 'luck'),
        updatedLuck: rules.score(updated, 'luck')
      };
    });

    expect(result).toEqual({ legacyLore: 2, legacyLuck: 2, updatedLuck: 1 });
  });

  test('preserves equipment fallbacks, inventory increments, and display labels', async ({ page }) => {
    const result = await page.evaluate(() => {
      const data = {
        classes: {}, origins: {}, keepsakes: {},
        weapons: [{ id: 'ironSword', name: 'Iron Sword', min: 36, max: 82 }],
        armors: [{ id: 'ironArmor', name: 'Iron Armor', defense: 68 }],
        itemNames: { food: 'Food' }
      };
      const rules = window.LegendRoadStateV100.create({
        getData: () => data,
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
      });
      const player = { weapon: 'ironSword', armor: 'ironArmor', inventory: { food: 2 } };
      rules.addInventory(player, 'food', 3);
      return {
        weapon: rules.weapon(player), armor: rules.armor(player), inventory: player.inventory,
        fallbackWeapon: rules.weapon({ weapon: 'missing' }),
        fallbackArmor: rules.armor({ armor: 'missing' }),
        itemName: rules.itemName('food'), skillLabel: rules.skillLabel('survival'),
        hpPercent: rules.hpPercent({ hp: 150, maxHp: 100 })
      };
    });

    expect(result.weapon).toEqual({ id: 'ironSword', name: 'Iron Sword', min: 36, max: 82 });
    expect(result.armor).toEqual({ id: 'ironArmor', name: 'Iron Armor', defense: 68 });
    expect(result.inventory.food).toBe(5);
    expect(result.fallbackWeapon).toEqual({ name: 'Hands', min: 1, max: 3 });
    expect(result.fallbackArmor).toEqual({ name: 'None', defense: 0 });
    expect(result.itemName).toBe('Food');
    expect(result.skillLabel).toBe('ROADSENSE');
    expect(result.hpPercent).toBe(100);
  });

  test('spends earned attribute points into the road skill checks they describe', async ({ page }) => {
    const result = await page.evaluate(() => {
      const data = { classes: {}, origins: {}, keepsakes: {}, weapons: [], armors: [], itemNames: {} };
      const rules = window.LegendRoadStateV100.create({
        getData: () => data,
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
      });
      return {
        might: rules.score({ attributesV152: { might: 2 } }, 'strength'),
        agility: rules.score({ attributesV152: { agility: 3 } }, 'agility'),
        guile: rules.score({ attributesV152: { agility: 3 } }, 'thieving'),
        arcana: rules.score({ attributesV152: { arcana: 4 } }, 'magic'),
        endurance: rules.score({ attributesV152: { endurance: 2 } }, 'survival'),
        insightLore: rules.score({ attributesV152: { insight: 2 } }, 'lore'),
        insightCraft: rules.score({ attributesV152: { insight: 2 } }, 'craft'),
        fortune: rules.score({ attributesV152: { fortune: 3 } }, 'luck')
      };
    });
    expect(result).toEqual({
      might: 2, agility: 3, guile: 3, arcana: 4,
      endurance: 2, insightLore: 2, insightCraft: 2, fortune: 3
    });
  });
});
