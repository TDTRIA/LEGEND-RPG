const { test, expect } = require('@playwright/test');

test.describe('Old Road reward balance v0.30.1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  });

  async function settle(page, { stage, pressure = 20, randomValue }) {
    return page.evaluate(({ stage, pressure, randomValue }) => {
      const player = {
        username: 'RoadRewardQA',
        level: 1,
        xp: 0,
        gold: 0,
        hp: 80,
        maxHp: 80,
        inventory: {},
        stats: {},
        flags: { firstRoadReturnSeen: true }
      };
      const state = {
        stage,
        pressure,
        trips: 1,
        events: 0,
        finds: 0,
        battles: 0,
        routeChoice: 'ridge',
        poiUsed: {},
        searchUsed: {},
        readUsed: {}
      };
      const inventoryAwards = [];
      let saves = 0;
      let result = null;
      const controller = window.LegendRoadResultsV100.create({
        getPlayer: () => player,
        savePlayer: () => { saves += 1; },
        ensureState: () => state,
        addInventory: (target, item, amount) => {
          target.inventory[item] = Number(target.inventory[item] || 0) + amount;
          inventoryAwards.push({ item, amount });
        },
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value)),
        setBellQuestObjective: () => {},
        awardProgress: (target, amount) => {
          target.xp = Number(target.xp || 0) + amount;
          return { gained: amount, levels: 0, level: target.level };
        },
        stopMusic: () => {},
        renderHeader: () => '',
        renderShell: html => { document.body.innerHTML = html; },
        escapeHtml: value => String(value ?? ''),
        resultView: {
          render: payload => {
            result = {
              title: payload.title,
              text: payload.text,
              details: payload.details,
              endedStage: payload.state.stage,
              endedPressure: payload.state.pressure
            };
            return result;
          }
        }
      });
      if (!controller) throw new Error('Road results controller did not initialize');
      const originalRandom = Math.random;
      Math.random = () => randomValue;
      try {
        controller.finish();
      } finally {
        Math.random = originalRandom;
      }
      return {
        result,
        player: {
          gold: Number(player.gold || 0),
          xp: Number(player.xp || 0),
          inventory: player.inventory
        },
        inventoryAwards,
        saves,
        liveStageAfterSettlement: state.stage
      };
    }, { stage, pressure, randomValue });
  }

  test('completed five-stage trip has a 65 percent Road Token roll', async ({ page }) => {
    const recovered = await settle(page, { stage: 5, pressure: 20, randomValue: 0.64 });
    expect(recovered.result.details).toMatchObject({
      complete: true,
      stagesCompleted: 5,
      rewardGold: 80,
      roadTokens: 1,
      xpGained: 33
    });
    expect(recovered.player).toMatchObject({
      gold: 80,
      xp: 33,
      inventory: { roadToken: 1 }
    });
    expect(recovered.inventoryAwards).toEqual([{ item: 'roadToken', amount: 1 }]);
    expect(recovered.result.text).toContain('rare Road Token was recovered');
    expect(recovered.saves).toBe(1);
    expect(recovered.liveStageAfterSettlement).toBe(0);
  });

  test('a completed trip can return without a Road Token when its roll misses', async ({ page }) => {
    const missed = await settle(page, { stage: 5, pressure: 20, randomValue: 0.65 });
    expect(missed.result.details).toMatchObject({
      complete: true,
      stagesCompleted: 5,
      rewardGold: 80,
      roadTokens: 0,
      xpGained: 33
    });
    expect(missed.player).toMatchObject({
      gold: 80,
      xp: 33,
      inventory: {}
    });
    expect(missed.inventoryAwards).toEqual([]);
    expect(missed.result.text).not.toContain('Road Token was recovered');
    expect(missed.saves).toBe(1);
  });

  test('an early return never receives the completion token even when the roll would succeed', async ({ page }) => {
    const early = await settle(page, { stage: 4, pressure: 20, randomValue: 0.1 });
    expect(early.result.details).toMatchObject({
      complete: false,
      stagesCompleted: 4,
      rewardGold: 68,
      roadTokens: 0,
      xpGained: 28
    });
    expect(early.player).toMatchObject({
      gold: 68,
      xp: 28,
      inventory: {}
    });
    expect(early.inventoryAwards).toEqual([]);
    expect(early.result.title).toBe('Field Report Secured');
    expect(early.result.text).not.toContain('Road Token was recovered');
  });
});
