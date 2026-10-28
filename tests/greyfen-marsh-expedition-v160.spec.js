const { test, expect } = require('@playwright/test');

async function seedGreyfen(page, options = {}) {
  await page.goto('/');
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
  await page.evaluate(options => {
    window.LegendStorage.deleteSaves();
    const player = {
      version: window.LEGEND_DATA.VERSION,
      username: 'MarshPathQA',
      gender: 'unspoken',
      genderLabel: 'Unspoken',
      pronouns: 'they/them',
      personality: 'kind',
      personalityLabel: 'Kind',
      world: 'Eldermere',
      town: 'Greyfen',
      currentRegion: 'Greyfen',
      origin: 'Lost Squire',
      className: options.className || 'Ranger',
      keepsake: 'Old Map',
      level: options.level || 1,
      xp: options.xp || 0,
      hp: options.hp ?? 80,
      maxHp: options.maxHp || 100,
      gold: 20,
      weapon: options.weapon || 'hand',
      armor: options.armor || 'none',
      ownedWeapons: { hand: 1, ironSword: 1 },
      ownedArmor: { none: 1, chainArmor: 1 },
      inventory: { food: options.food ?? 2, camp: options.camp ?? 1, potion: 1, roadToken: 0 },
      bank: [0, 0, 0, 0, 0],
      stats: {},
      flags: { firstRoadReturnSeen: true, greyfenDryCrossingComplete: true },
      traits: [],
      skills: {},
      mastery: {},
      memories: [],
      questLog: [],
      quests: {},
      discoveredRegions: ['Ashmere', 'Greyfen'],
      unlockedRegions: ['Ashmere', 'Greyfen'],
      currentRegion: 'Greyfen',
      discoveredRoutes: ['Old Road'],
      discoveredTowns: ['Ashmere', 'Greyfen']
    };
    window.LegendRuntimeV120.savePlayer(player);
    const saved = window.LegendRuntimeV120.loadPlayer();
    saved.currentRegion = 'Greyfen';
    saved.town = 'Greyfen';
    saved.discoveredRegions = ['Ashmere', 'Greyfen'];
    saved.unlockedRegions = ['Ashmere', 'Greyfen'];
    saved.flags.firstRoadReturnSeen = true;
    window.LegendRuntimeV120.savePlayer(saved);
    window.LegendAshmereV099.renderAshmere();
  }, options);
  await expect(page.locator('.ash100-town')).toBeVisible();
}

async function enterMarsh(page) {
  await page.locator('[data-ash-view="marsh"]').first().click();
  await expect(page.getByRole('main', { name: 'Greyfen Marsh Path expedition' })).toBeVisible();
}

test.describe('Greyfen Marsh Path v0.24.1', () => {
  test('route choice, optional ferry, map knowledge, shelter and waterline report persist across reload', async ({ page }) => {
    await seedGreyfen(page);
    await enterMarsh(page);
    await expect(page.locator('#gfm160OpenMap')).toContainText('1 known');

    await page.locator('#gfm160OpenMap').click();
    await expect(page.getByRole('dialog', { name: 'Greyfen Marsh field map' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Greyfen Marsh field map' })).toContainText('You are here');
    await page.locator('#gfm160CloseMap').click();
    await expect(page.locator('#gfm160MapOverlay')).toBeHidden();

    await page.locator('#gfm160Begin').click();
    await page.locator('#gfm160ChooseReeds').click();
    let routeState = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      const state = player.flags.greyfenMarshExpeditionV160;
      return {
        route: state.routeChoice,
        stage: state.stage,
        pressure: state.pressure,
        food: player.inventory.food,
        herbs: player.inventory.roadHerb
      };
    });
    expect(routeState).toEqual({ route: 'reeds', stage: 1, pressure: 12, food: 1, herbs: 1 });
    const ferryDetour = page.locator('.gfm160-optional').filter({ has: page.locator('#gfm160VisitFerry') });
    await expect(ferryDetour).toContainText('Fallen Ferry');
    await expect(ferryDetour).toContainText('1 hour and +5 Road Pressure');
    await expect(ferryDetour).toContainText('1 Cloth Scrap');
    await expect(page.locator('#gfm160VisitFerry')).toHaveText('Inspect the Fallen Ferry');

    await page.locator('#gfm160VisitFerry').click();
    await expect(page.locator('#gfm160ReturnFromFerry')).toBeVisible();
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await page.evaluate(() => window.LegendGreyfenMarshV160.start());
    await expect(page.getByRole('heading', { name: 'Fallen Ferry', level: 1 })).toBeVisible();
    await expect(page.locator('#gfm160ReturnFromFerry')).toBeVisible();

    routeState = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      const s = pl.flags.greyfenMarshExpeditionV160;
      return {
        active: s.active,
        route: s.routeChoice,
        visitedFerry: s.visitedNodeIds.includes('fallen-ferry'),
        cloth: pl.inventory.clothScrap,
        pressure: s.pressure
      };
    });
    expect(routeState).toEqual({ active: true, route: 'reeds', visitedFerry: true, cloth: 1, pressure: 17 });

    await page.locator('#gfm160ReturnFromFerry').click();
    await page.locator('#gfm160Continue').click();
    await page.locator('#gfm160PassSluice').click();
    await page.locator('#gfm160ContinueShelter').click();
    await expect(page.getByRole('heading', { name: 'A dry pause above the floodline.' })).toBeVisible();

    await page.locator('#gfm160Rest').click();
    await page.locator('#gfm160ContinueGauge').click();
    await page.locator('#gfm160InspectGauge').click();
    await expect(page.locator('.gfm160-note')).toContainText('reading saved');
    await page.locator('#gfm160Complete').click();

    await expect(page.getByRole('main', { name: 'Marsh expedition results' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Marsh Yields Its Record' })).toBeVisible();
    await expect(page.locator('.gfm160-report-metrics')).toContainText('Reed Bed');
    await expect(page.locator('.gfm160-report-metrics')).toContainText('+35g');
    await expect(page.locator('.gfm160-report-metrics')).toContainText('+35 XP');
    await expect(page.locator('.gfm160-report-findings')).toContainText('Fallen Ferry');
    await expect(page.locator('.gfm160-report-findings')).toContainText('The Waterline Gauge');

    const final = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      const s = pl.flags.greyfenMarshExpeditionV160;
      return {
        active: s.active,
        route: s.lastResultV160.route,
        complete: s.lastResultV160.complete,
        gauge: s.gaugeInspected,
        gold: pl.gold,
        roadHerb: pl.inventory.roadHerb,
        clothScrap: pl.inventory.clothScrap,
        camp: pl.inventory.camp,
        pressure: s.pressure,
        completed: pl.flags.greyfenMarshPathComplete,
        reported: pl.flags.greyfenMarshReported,
        clears: pl.stats.greyfenMarshClears
      };
    });
    expect(final).toMatchObject({
      active: false,
      route: 'Reed Bed',
      complete: true,
      gauge: true,
      gold: 55,
      roadHerb: 1,
      clothScrap: 1,
      camp: 0,
      pressure: 13,
      completed: true,
      reported: true,
      clears: 1
    });

    await page.locator('#gfm160ResultReturn').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.locator('[data-ash-view="marsh"]')).toBeVisible();
    await expect(page.locator('.ash100-route-strip')).toContainText('Report the Waterline Gauge');
    await page.locator('.ash100-route-strip button[data-ash-view="mara"]').click();
    await expect(page.locator('.ash099-lines')).toContainText('The gauge gives us a height and a clean, hand-cut notch');
    const filed = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        reported: pl.flags.greyfenWaterlineGaugeReported,
        memory: pl.memories.some(line => line.includes('Waterline Gauge reading')),
        objective: (pl.questLog || []).some(line => String(line).includes('Find the missing closure order that authorized the later change to the lower crossing.')),
        guidance: window.LegendAshmereGuidanceV099.getGoal(pl).title
      };
    });
    expect(filed).toEqual({ reported: true, memory: true, objective: true, guidance: 'Continue the Crossing Investigation' });
  });

  test('raised posts remain available without rations and a successful wisp fight uses Greyfen-specific combat results', async ({ page }) => {
    await seedGreyfen(page, { className: 'Warrior', level: 4, weapon: 'ironSword', armor: 'chainArmor', food: 0, camp: 0, hp: 100 });
    await enterMarsh(page);
    await page.locator('#gfm160Begin').click();

    await expect(page.locator('#gfm160ChooseReeds')).toBeDisabled();
    await page.locator('#gfm160ChooseRaised').click();
    await page.locator('#gfm160Continue').click();
    await page.locator('#gfm160FaceWisp').click();

    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle-topline')).toContainText('GREYFEN MARSH PATH');
    await expect(page.locator('.rpg-foe-nameplate')).toContainText('Reed Wisp');
    await page.locator('#strike').click();

    await expect(page.getByRole('main', { name: 'Battle victory results' })).toBeVisible();
    await expect(page.locator('.v152-results-kicker')).toContainText('GREYFEN MARSH PATH');
    await expect(page.locator('.v152-results-metrics')).toContainText('4 / 5');
    await expect(page.locator('#v152CombatContinue')).toContainText('Continue to Mossbarrow Shelter');
    const afterWin = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        stage: pl.flags.greyfenMarshExpeditionV160.stage,
        cleared: pl.flags.greyfenMarshExpeditionV160.sluiceCleared,
        victories: pl.stats.greyfenMarshVictories,
        wispAsh: pl.inventory.wispAsh,
        shelterVisited: pl.flags.greyfenMarshExpeditionV160.visitedNodeIds.includes('mossbarrow-shelter'),
        oldRoadStage: Number(pl.flags.roadExpeditionV100?.stage || 0)
      };
    });
    expect(afterWin).toMatchObject({ stage: 3, cleared: true, victories: 1, wispAsh: 1, shelterVisited: true, oldRoadStage: 0 });

    await page.locator('#v152CombatContinue').click();
    await expect(page.getByRole('heading', { name: 'A dry pause above the floodline.' })).toBeVisible();
    await page.locator('#gfm160ContinueGauge').click();
    await page.locator('#gfm160InspectGauge').click();
    await page.locator('#gfm160Complete').click();
    await expect(page.getByRole('main', { name: 'Marsh expedition results' })).toBeVisible();
    await expect(page.locator('.gfm160-report-findings')).toContainText('The Waterline Gauge');
  });


  test('the Reed Bed survey remains completable when the optional Fallen Ferry is skipped', async ({ page }) => {
    await seedGreyfen(page, { food: 1, camp: 0, hp: 100 });
    await enterMarsh(page);
    await page.locator('#gfm160Begin').click();
    await page.locator('#gfm160ChooseReeds').click();

    await page.locator('#gfm160OpenMap').click();
    await expect(page.getByRole('dialog', { name: 'Greyfen Marsh field map' })).toContainText('Fallen Ferry');
    await expect(page.getByRole('dialog', { name: 'Greyfen Marsh field map' })).toContainText('Optional detour available');
    await page.locator('#gfm160CloseMap').click();

    // Skip the detour and continue to the required Waterline Gauge.
    await page.locator('#gfm160Continue').click();
    await page.locator('#gfm160PassSluice').click();
    await page.locator('#gfm160ContinueShelter').click();
    await expect(page.locator('#gfm160Rest')).toBeDisabled();
    await page.locator('#gfm160ContinueGauge').click();
    await page.locator('#gfm160InspectGauge').click();
    await page.locator('#gfm160Complete').click();

    await expect(page.getByRole('main', { name: 'Marsh expedition results' })).toBeVisible();
    await expect(page.locator('.gfm160-report-metrics')).toContainText('Reed Bed');
    await expect(page.locator('.gfm160-report-findings')).toContainText('Road Herb');
    await expect(page.locator('.gfm160-report-findings')).not.toContainText('Fallen Ferry');

    const state = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      const s = pl.flags.greyfenMarshExpeditionV160;
      return {
        complete: s.lastResultV160.complete,
        ferryVisited: s.visitedNodeIds.includes('fallen-ferry'),
        clothScrap: Number(pl.inventory?.clothScrap || 0),
        roadHerb: Number(pl.inventory?.roadHerb || 0),
        gaugeRead: Boolean(pl.flags.greyfenWaterlineGaugeRead)
      };
    });
    expect(state).toEqual({
      complete: true,
      ferryVisited: false,
      clothScrap: 0,
      roadHerb: 1,
      gaugeRead: true
    });
  });



  test('a Greyfen defeat returns safely to town without erasing route supplies or resetting the Old Road', async ({ page }) => {
    await seedGreyfen(page, { className: 'Warrior', food: 1, camp: 0, hp: 1 });
    await enterMarsh(page);
    await page.locator('#gfm160Begin').click();
    await page.locator('#gfm160ChooseRaised').click();
    await page.locator('#gfm160Continue').click();
    await page.locator('#gfm160FaceWisp').click();

    await expect(page.locator('.rpg-battle')).toBeVisible();
    await page.locator('#guard').click();
    await expect(page.getByRole('main', { name: 'Battle defeat results' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Driven Back' })).toBeVisible();
    await expect(page.locator('.v152-results-heading p')).toContainText('Return to Greyfen');

    const defeated = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      const s = pl.flags.greyfenMarshExpeditionV160;
      return {
        hp: pl.hp,
        active: s.active,
        failed: s.failed,
        stage: s.stage,
        pressure: s.pressure,
        peatBrick: pl.inventory.peatBrick,
        oldRoadStage: Number(pl.flags.roadExpeditionV100?.stage || 0)
      };
    });
    expect(defeated).toMatchObject({
      hp: 1,
      active: false,
      failed: true,
      stage: 0,
      pressure: 16,
      peatBrick: 1,
      oldRoadStage: 0
    });

    await page.locator('#v152CombatReturn').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.locator('.ash100-route-strip')).toContainText('Learn Greyfen’s Old Marks');
  });



  test('retreating from the Reed Wisp records the disclosed pressure cost and prevents a free repeat fight', async ({ page }) => {
    await seedGreyfen(page, { className: 'Warrior', level: 4, weapon: 'hand', armor: 'none', food: 0, camp: 0, hp: 100 });
    await enterMarsh(page);
    await page.locator('#gfm160Begin').click();
    await page.locator('#gfm160ChooseRaised').click();
    await page.locator('#gfm160Continue').click();
    await page.locator('#gfm160FaceWisp').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();

    await page.locator('#flee').click();
    await expect(page.getByRole('heading', { name: 'You crossed without fighting.' })).toBeVisible();
    await expect(page.locator('#gfm160ContinueShelter')).toBeEnabled();
    await expect(page.locator('#gfm160FaceWisp')).toHaveCount(0);

    const state = await page.evaluate(() => {
      const s = window.LegendRuntimeV120.loadPlayer().flags.greyfenMarshExpeditionV160;
      return {
        stage: s.stage,
        pressure: s.pressure,
        retreated: s.encounterRetreated,
        avoided: s.encounterAvoided,
        cleared: s.sluiceCleared
      };
    });
    expect(state).toEqual({
      stage: 2,
      pressure: 12,
      retreated: true,
      avoided: true,
      cleared: false
    });

    await page.locator('#gfm160ContinueShelter').click();
    await expect(page.getByRole('heading', { name: 'A dry pause above the floodline.' })).toBeVisible();
  });
 
  test('Fallen Ferry has an optional Marsh Raider battle that keeps Greyfen state separate from the Old Road', async ({ page }) => {
    await seedGreyfen(page);
    await enterMarsh(page);
    await page.locator('#gfm160Begin').click();
    await page.locator('#gfm160ChooseReeds').click();
    await page.locator('#gfm160VisitFerry').click();
    await expect(page.locator('#gfm160FaceRaider')).toBeVisible();
    await page.locator('#gfm160FaceRaider').click();

    await expect(page.locator('.rpg-foe-nameplate')).toContainText('Greyfen Marsh Raider');
    await expect(page.locator('.rpg-battlefield')).toHaveAttribute('data-arena', 'greyfen');
    await page.locator('#retreat').click();
    await expect(page.locator('.v152-combat-results')).toContainText('You Slip the Ambush');

    const state = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      const s = pl.flags.greyfenMarshExpeditionV160;
      return {
        ferryRaiderAvoided: s.ferryRaiderAvoided,
        ferryRaiderDefeated: s.ferryRaiderDefeated,
        stage: s.stage,
        pressure: s.pressure,
        gold: pl.gold
      };
    });
    expect(state).toMatchObject({
      ferryRaiderAvoided: true,
      ferryRaiderDefeated: false,
      stage: 1,
      pressure: 21
    });

    await page.locator('#v152CombatContinue').click();
    await expect(page.locator('#gfm160ReturnFromFerry')).toBeVisible();
    await expect(page.locator('.gfm160-panel')).toContainText('You avoided the Ferry ambush');
  });

});
