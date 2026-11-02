const { test, expect } = require('@playwright/test');

async function openGame(page) {
  await page.goto('/');
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
}

test.describe('Road grind economy v0.29.2', () => {
  test('a completed low-risk outing pays modest gold and XP but does not guarantee a Road Token', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const player = {
        level: 1, xp: 0, gold: 0, inventory: {},
        currentRegion: 'Ashmere',
        flags: {
          firstRoadReturnSeen: true,
          roadExpeditionV100: {
            stage: 5, pressure: 0, trips: 2, routeChoice: 'ridge',
            visitedNodeIdsV160: [], poiUsed: {}, searchUsed: {}
          },
          roadFieldJournalV150: { visitedPlaces: [], discoveries: [], routes: [], campReports: [] }
        },
        stats: {}
      };
      let outcome = null;
      const service = window.LegendRoadResultsV100.create({
        getPlayer: () => player,
        savePlayer: () => {},
        ensureState: p => p.flags.roadExpeditionV100,
        addInventory: (p, key, amount) => { p.inventory[key] = Number(p.inventory[key] || 0) + amount; },
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        setBellQuestObjective: () => {},
        awardProgress: (p, amount) => ({ gained: amount, levels: 0, level: p.level }),
        randomInt: () => 100,
        stopMusic: () => {},
        renderHeader: () => '',
        renderShell: () => {},
        escapeHtml: value => String(value ?? ''),
        resultView: { render: payload => { outcome = payload; } },
        returnToTown: () => {},
        returnToAshmere: () => {}
      });
      service.finish();
      return {
        gold: player.gold,
        inventory: player.inventory,
        outcome: outcome?.details,
        message: outcome?.text
      };
    });
    expect(result.gold).toBe(70);
    expect(result.inventory.roadToken || 0).toBe(0);
    expect(result.outcome).toMatchObject({
      complete: true,
      rewardGold: 70,
      xpGained: 38,
      roadTokens: 0,
      roadTokenChance: 40
    });
    expect(result.message).toContain('No Road Token surfaced');
  });

  test('route risk, evidence, detours and pressure improve but do not remove the Road Token roll', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const player = {
        level: 1, xp: 0, gold: 0, inventory: {},
        currentRegion: 'Ashmere',
        flags: {
          firstRoadReturnSeen: true,
          roadExpeditionV100: {
            stage: 5, pressure: 50, trips: 3, routeChoice: 'reeds',
            visitedNodeIdsV160: ['windbreak'], poiUsed: {}, searchUsed: {}
          },
          roadFieldJournalV150: {
            visitedPlaces: [],
            discoveries: [
              { key: 'clue-a', trip: 3, place: 'Lantern Ditch' },
              { key: 'clue-b', trip: 3, place: 'Blackroot Bend' }
            ],
            routes: [], campReports: []
          }
        },
        stats: {}
      };
      let outcome = null;
      const service = window.LegendRoadResultsV100.create({
        getPlayer: () => player,
        savePlayer: () => {},
        ensureState: p => p.flags.roadExpeditionV100,
        addInventory: (p, key, amount) => { p.inventory[key] = Number(p.inventory[key] || 0) + amount; },
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        setBellQuestObjective: () => {},
        awardProgress: (p, amount) => ({ gained: amount, levels: 0, level: p.level }),
        randomInt: (min, max) => 75,
        stopMusic: () => {},
        renderHeader: () => '',
        renderShell: () => {},
        escapeHtml: value => String(value ?? ''),
        resultView: { render: payload => { outcome = payload; } },
        returnToTown: () => {},
        returnToAshmere: () => {}
      });
      service.finish();
      return { gold: player.gold, inventory: player.inventory, outcome: outcome?.details };
    });
    expect(result.outcome).toMatchObject({
      rewardGold: 75,
      xpGained: 38,
      roadTokenChance: 75,
      roadTokens: 1
    });
    expect(result.inventory.roadToken).toBe(1);
  });

  test('the Reed Cut and strange roadside discoveries do not award a Bell Fragment every time', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      function makePlayer() {
        return {
          inventory: {},
          flags: { roadExpeditionV100: { stage: 0, pressure: 0, trips: 1 } },
          stats: {}
        };
      }
      const misses = makePlayer();
      let missMessage = '';
      const missRoute = window.LegendRoadDecisionsV100.create({
        getPlayer: () => misses,
        savePlayer: () => {},
        ensureState: p => p.flags.roadExpeditionV100,
        addInventory: (p, key, amount) => { p.inventory[key] = Number(p.inventory[key] || 0) + amount; },
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        randomInt: () => 100,
        renderExpedition: message => { missMessage = message; }
      });
      missRoute.chooseRoadRoute('reeds');

      const found = makePlayer();
      let foundMessage = '';
      const foundRoute = window.LegendRoadDecisionsV100.create({
        getPlayer: () => found,
        savePlayer: () => {},
        ensureState: p => p.flags.roadExpeditionV100,
        addInventory: (p, key, amount) => { p.inventory[key] = Number(p.inventory[key] || 0) + amount; },
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        randomInt: () => 1,
        renderExpedition: message => { foundMessage = message; }
      });
      foundRoute.chooseRoadRoute('reeds');

      const discoveryMiss = makePlayer();
      discoveryMiss.flags.roadExpeditionV100.stage = 1;
      let poiMessage = '';
      const poi = window.LegendRoadPoiOutcomesV100.create({
        getPlayer: () => discoveryMiss,
        savePlayer: () => {},
        ensureState: p => p.flags.roadExpeditionV100,
        addInventory: (p, key, amount) => { p.inventory[key] = Number(p.inventory[key] || 0) + amount; },
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        bellRoadEvidence: { recordPointEvidence: () => ({ foundGreyfenFieldNote: false, foundGreyfenWeeklyReturn: false }) },
        getPointOfInterest: () => ({ key: 'blue-glimmer', place: 'Lantern Ditch', name: 'Blue Glimmer', kind: 'Strange Find' }),
        renderExpedition: message => { poiMessage = message; },
        randomInt: () => 100
      });
      poi.inspect();

      return {
        routeMiss: misses.inventory.bellFragment || 0,
        routeFound: found.inventory.bellFragment || 0,
        poiMiss: discoveryMiss.inventory.bellFragment || 0,
        missMessage,
        foundMessage,
        poiMessage
      };
    });
    expect(result.routeMiss).toBe(0);
    expect(result.routeFound).toBe(1);
    expect(result.poiMiss).toBe(0);
    expect(result.missMessage).toContain('no fragment comes free');
    expect(result.foundMessage).toContain('+1 Bell Fragment');
    expect(result.poiMessage).toContain('find no physical fragment');
  });

  test('Wisp fights award Wisp Ash with a rare Bell Fragment bonus drop', async ({ page }) => {
    await openGame(page);
    const wisp = await page.evaluate(() =>
      (window.LegendRoadsV100?.oldRoad?.enemies || []).find(enemy => enemy.id === 'wisp')
    );
    expect(wisp).toMatchObject({
      reward: 'wispAsh',
      bonusDrop: { item: 'bellFragment', chance: 18, amount: [1, 1] }
    });
  });
});
