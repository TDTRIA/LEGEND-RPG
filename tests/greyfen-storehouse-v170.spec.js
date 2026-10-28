const { test, expect } = require('@playwright/test');

async function seedGreyfen(page, options = {}) {
  await page.goto('/');
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 30000 });
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
  await page.evaluate(options => {
    window.LegendStorage.deleteSaves();
    const player = {
      version: window.LEGEND_DATA.VERSION,
      username: 'StorehouseQA',
      gender: 'unspoken',
      genderLabel: 'Unspoken',
      pronouns: 'they/them',
      personality: 'kind',
      personalityLabel: 'Kind',
      world: 'Eldermere',
      town: 'Greyfen',
      currentRegion: 'Greyfen',
      origin: 'Lost Squire',
      className: 'Ranger',
      keepsake: 'Old Map',
      level: options.level || 5,
      xp: 0,
      hp: options.hp ?? 180,
      maxHp: options.maxHp || 180,
      gold: 50,
      weapon: 'ironSword',
      armor: 'chainArmor',
      ownedWeapons: { hand: 1, ironSword: 1 },
      ownedArmor: { none: 1, chainArmor: 1 },
      inventory: {
        food: 3, camp: 2, potion: 5, roadToken: 0, roadHerb: 0,
        clothScrap: 1, peatBrick: 0, oil: 0
      },
      bank: [0, 0, 0, 0, 0],
      stats: {},
      flags: {
        firstRoadReturnSeen: true,
        greyfenDryCrossingComplete: options.crossing !== false
      },
      traits: [],
      skills: {},
      mastery: {},
      memories: [],
      questLog: [],
      quests: {},
      discoveredRegions: ['Ashmere', 'Greyfen'],
      unlockedRegions: ['Ashmere', 'Greyfen'],
      discoveredRoutes: ['Old Road'],
      discoveredTowns: ['Ashmere', 'Greyfen']
    };
    window.LegendRuntimeV120.savePlayer(player);
    const saved = window.LegendRuntimeV120.loadPlayer();
    saved.currentRegion = 'Greyfen';
    saved.town = 'Greyfen';
    saved.discoveredRegions = ['Ashmere', 'Greyfen'];
    saved.unlockedRegions = ['Ashmere', 'Greyfen'];
    window.LegendRuntimeV120.savePlayer(saved);
    window.LegendAshmereV099.renderAshmere();
  }, options);
  await expect(page.locator('.ash100-town')).toBeVisible();
}
async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(metrics.document).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.body).toBeLessThanOrEqual(metrics.viewport + 1);
}
async function openStorehouse(page) {
  await page.evaluate(() => window.LegendAshmereV099.route('storehouse'));
  await expect(page.locator('.gss170-page')).toBeVisible();
}

test.describe('Greyfen Silted Storehouse v0.25.0', () => {
  test('the optional delve is gated by A Dry Crossing and reachable through existing town routing', async ({ page }) => {
    await seedGreyfen(page, { crossing: false });
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoHorizontalOverflow(page);
    const locked = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return window.LegendAshmereDestinationCatalogV099.forRegion('Greyfen', 'home', player.flags)
        .some(destination => destination.view === 'storehouse');
    });
    expect(locked).toBe(false);

    await openStorehouse(page);
    await expect(page.locator('.gss170-page')).toContainText('The Storehouse Remains Shut');
    const sceneImage = page.locator('.gss170-scene-art');
    await expect(sceneImage).toHaveAttribute('src', 'assets/generated/locations/greyfen-marsh-walkway.webp');
    await expect.poll(() => sceneImage.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    const sceneResponse = await page.request.get('/assets/generated/locations/greyfen-marsh-walkway.webp');
    expect(sceneResponse.status()).toBe(200);
    expect(sceneResponse.headers()['content-type'] || '').toContain('image/webp');
    await expectNoHorizontalOverflow(page);
    const lockedBounds = await page.locator('.gss170-page').boundingBox();
    expect(lockedBounds.x).toBeGreaterThanOrEqual(0);
    expect(lockedBounds.x + lockedBounds.width).toBeLessThanOrEqual(390);
    await page.locator('#gss170Return').click();
    await expect(page.locator('.ash100-town')).toBeVisible();

    await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      player.flags.greyfenDryCrossingComplete = true;
      window.LegendRuntimeV120.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
    });
    const available = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return window.LegendAshmereDestinationCatalogV099.forRegion('Greyfen', 'home', player.flags)
        .some(destination => destination.view === 'storehouse');
    });
    expect(available).toBe(true);
    await openStorehouse(page);
    await expect(page.locator('.gss170-page')).toContainText('The Silted Storehouse');
    await expect(page.locator('#gss170Begin')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const unlockedBounds = await page.locator('.gss170-page').boundingBox();
    expect(unlockedBounds.x).toBeGreaterThanOrEqual(0);
    expect(unlockedBounds.x + unlockedBounds.width).toBeLessThanOrEqual(390);
  });

  test('route choice, dispatch and salvage survive reload without overwriting Old Road state', async ({ page }) => {
    await seedGreyfen(page);
    await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      player.flags.roadExpeditionV100 = { stage: 2, pressure: 9, routeChoice: 'ridge', trips: 4 };
      window.LegendRuntimeV120.savePlayer(player);
    });
    await openStorehouse(page);
    await page.locator('#gss170Begin').click();
    const before = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return { hp: player.hp, herbs: Number(player.inventory.roadHerb || 0) };
    });
    await page.locator('#gss170Sump').click();
    await expect(page.locator('.gss170-page')).toContainText('ROOM 2 / 3');
    await page.locator('#gss170ReadDispatch').click();
    await page.locator('#gss170Salvage').click();
    const after = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      const run = player.flags.greyfenStorehouseV170;
      return {
        hp: player.hp,
        herbs: Number(player.inventory.roadHerb || 0),
        peat: Number(player.inventory.peatBrick || 0),
        oil: Number(player.inventory.oil || 0),
        dispatch: Boolean(player.flags.greyfenStorehouseDispatchFound),
        memory: player.memories.some(entry => entry.includes('Silted Storehouse')),
        room: run.room,
        active: run.active,
        oldRoadStage: player.flags.roadExpeditionV100.stage,
        oldRoadPressure: player.flags.roadExpeditionV100.pressure,
        oldRoadRoute: player.flags.roadExpeditionV100.routeChoice
      };
    });
    expect(after.hp).toBe(Math.max(1, before.hp - 6));
    expect(after.herbs).toBe(before.herbs + 1);
    expect(after.peat).toBe(1);
    expect(after.oil).toBe(1);
    expect(after.dispatch).toBe(true);
    expect(after.memory).toBe(true);
    expect(after).toMatchObject({ room: 1, active: true, oldRoadStage: 2, oldRoadPressure: 9, oldRoadRoute: 'ridge' });

    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 30000 });
    await page.evaluate(() => window.LegendAshmereV099.route('storehouse'));
    await expect(page.locator('.gss170-page')).toContainText('Records Bay');
    await expect(page.locator('.gss170-page')).toContainText('Dispatch already preserved');
    const restored = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        room: player.flags.greyfenStorehouseV170.room,
        dispatch: Boolean(player.flags.greyfenStorehouseDispatchFound),
        peat: player.inventory.peatBrick,
        oil: player.inventory.oil,
        oldRoadStage: player.flags.roadExpeditionV100.stage,
        oldRoadPressure: player.flags.roadExpeditionV100.pressure
      };
    });
    expect(restored).toMatchObject({ room: 1, dispatch: true, peat: 1, oil: 1, oldRoadStage: 2, oldRoadPressure: 9 });
    await page.locator('#gss170Retreat').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
  });

  test('the keeper uses production combat and tactical retreat returns safely to Greyfen', async ({ page }) => {
    await seedGreyfen(page);
    await openStorehouse(page);
    await page.locator('#gss170Begin').click();
    await page.locator('#gss170Upper').click();
    await page.locator('#gss170Fight').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Mirebound Storehouse Keeper');
    const inBattle = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().flags.greyfenStorehouseV170);
    expect(inBattle).toMatchObject({ active: true, inBattle: true, room: 2 });
    await page.locator('#flee').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    const after = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        active: player.flags.greyfenStorehouseV170.active,
        inBattle: player.flags.greyfenStorehouseV170.inBattle,
        retreats: player.flags.greyfenStorehouseV170.retreats,
        stat: player.stats.greyfenStorehouseRetreats,
        roadStage: player.flags.roadExpeditionV100?.stage
      };
    });
    expect(after).toMatchObject({ active: false, inBattle: false, retreats: 1, stat: 1 });
    await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      window.LegendGreyfenStorehouseV170.afterCombatRetreat(
        player, { greyfenStorehouseV170: true }
      );
    });
    const duplicate = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        retreats: player.flags.greyfenStorehouseV170.retreats,
        stat: player.stats.greyfenStorehouseRetreats
      };
    });
    expect(duplicate).toEqual({ retreats: 1, stat: 1 });
  });


  test('a victorious keeper fight records the delve and grants its separate field-report reward', async ({ page }) => {
    await seedGreyfen(page, { level: 50, hp: 5000, maxHp: 5000 });
    const before = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return { gold: player.gold, herbs: Number(player.inventory.roadHerb || 0), peat: Number(player.inventory.peatBrick || 0) };
    });

    await openStorehouse(page);
    await page.locator('#gss170Begin').click();
    await page.locator('#gss170Upper').click();
    await page.locator('#gss170Fight').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Mirebound Storehouse Keeper');

    for (let turn = 0; turn < 8; turn += 1) {
      if (!(await page.locator('.rpg-battle').isVisible().catch(() => false))) break;
      const skill = page.locator('#skill');
      if (await skill.isEnabled().catch(() => false)) {
        await skill.click();
      } else {
        await page.locator('#strike').click();
      }
    }

    await expect(page.locator('.gss170-page')).toContainText('ROOM 3 / 3', { timeout: 15000 });
    await expect(page.locator('#gss170Collect')).toBeVisible();
    const won = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      const run = player.flags.greyfenStorehouseV170;
      return {
        active: run.active,
        inBattle: run.inBattle,
        battleWon: run.battleWon,
        room: run.room,
        dungeonVictories: player.stats.dungeonVictories,
        peat: Number(player.inventory.peatBrick || 0),
        gold: player.gold
      };
    });
    expect(won).toMatchObject({ active: true, inBattle: false, battleWon: true, room: 3 });
    expect(won.dungeonVictories).toBeGreaterThanOrEqual(1);
    expect(won.peat).toBeGreaterThan(before.peat);

    await page.locator('#gss170Collect').click();
    const completed = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      const run = player.flags.greyfenStorehouseV170;
      return {
        active: run.active,
        completed: run.completed,
        rewardClaimed: run.rewardClaimed,
        clears: run.clears,
        gold: player.gold,
        herbs: Number(player.inventory.roadHerb || 0)
      };
    });
    expect(completed).toMatchObject({ active: false, completed: true, rewardClaimed: true, clears: 1 });
    expect(completed.gold).toBeGreaterThan(before.gold);
    expect(completed.herbs).toBe(before.herbs + 1);
    await expect(page.locator('.gss170-page')).toContainText('The Storehouse Remembers');
    await expect(page.locator('#gss170Again')).toBeVisible();
  });


  test('a keeper defeat records a failed attempt but retains the discovered dispatch', async ({ page }) => {
    await seedGreyfen(page, { level: 5, hp: 180, maxHp: 180 });
    await openStorehouse(page);
    await page.locator('#gss170Begin').click();
    await page.locator('#gss170Upper').click();
    await page.locator('#gss170ReadDispatch').click();
    await page.locator('#gss170Fight').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await page.evaluate(() => {
      const runtime = window.LegendRuntimeV120;
      const player = runtime.loadPlayer();
      player.hp = 1;
      player.maxHp = 180;
      player.weapon = 'hand';
      player.armor = 'none';
      runtime.savePlayer(player);
    });
    await page.locator('#strike').click();

    await expect(page.locator('.gss170-page')).toContainText('Driven from the Storehouse');
    const failed = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      const run = player.flags.greyfenStorehouseV170;
      return {
        active: run.active,
        inBattle: run.inBattle,
        battleWon: run.battleWon,
        failed: run.failed,
        lastRoom: run.lastRoom,
        dispatch: Boolean(player.flags.greyfenStorehouseDispatchFound),
        memory: player.memories.some(entry => entry.includes('Silted Storehouse')),
        defeats: player.stats.greyfenStorehouseDefeats,
        attempts: run.attempts
      };
    });
    expect(failed).toMatchObject({
      active: false, inBattle: false, battleWon: false, failed: true, lastRoom: 2,
      dispatch: true, memory: true, defeats: 1, attempts: 1
    });
    await expect(page.locator('#gss170Retry')).toBeVisible();
    await expect(page.locator('#gss170Return')).toBeVisible();
  });

  test('Mara preserves a recovered dispatch as supplemental evidence without naming an author', async ({ page }) => {
    await seedGreyfen(page);
    const result = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      player.flags.greyfenLedgerCompared = true;
      player.flags.greyfenWeeklyReturnFound = true;
      player.flags.greyfenWeeklyReturnReported = true;
      player.flags.greyfenEvidenceFiled = false;
      player.flags.greyfenStorehouseDispatchFound = true;
      player.flags.greyfenStorehouseDispatchReported = false;
      const beforeGoal = window.LegendAshmereGuidanceV099.getGoal(player);
      player.flags.greyfenEvidenceFiled = true;
      const dialogue = { lines: [] };
      const applied = window.LegendAshmereGreyfenEvidenceStoryV099.apply(
        player, 'mara', true, dialogue, () => {}
      );
      const goal = window.LegendAshmereGuidanceV099.getGoal(player);
      return {
        applied,
        lines: dialogue.lines,
        reported: player.flags.greyfenStorehouseDispatchReported,
        memory: player.memories.some(entry => entry.includes('Mara added the Silted Storehouse dispatch')),
        beforeGoalTitle: beforeGoal.title,
        goalTitle: goal.title
      };
    });
    expect(result.beforeGoalTitle).toBe('File the Crossing Evidence');
    expect(result.applied).toBe(true);
    expect(result.lines.join(' ')).toContain('authorization leaf is missing');
    expect(result.lines.join(' ')).toContain('does not identify who approved');
    expect(result).toMatchObject({
      reported: true,
      memory: true,
      goalTitle: 'Review the Preserved Evidence'
    });
  });
});
