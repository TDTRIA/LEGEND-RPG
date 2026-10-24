const { test, expect } = require('@playwright/test');

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  ` });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function startFreshTraveler(page) {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Name').fill('FieldJournalQA');
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i }).click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name: 'FieldJournalQA', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test('first secured field report can be handed directly to Mara to advance the next story objective', async ({ page }) => {
  await startFreshTraveler(page);
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.flags = player.flags || {};
    player.flags.firstRoadReturnSeen = true;
    player.flags.firstRoadReturnRoute = 'ridge';
    player.flags.firstRoadReturnDiscovery = 'ridge-cairn';
    player.flags.firstRoadReturnMaraBriefed = false;
    player.flags.roadExpeditionV100 = {
      ...(player.flags.roadExpeditionV100 || {}),
      stage: 5, pressure: 12, trips: 1, routeChoice: 'ridge',
      poiUsed: { 'ridge-cairn': true }
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderExpedition();
  });

  await page.locator('#finish').click();
  await expect(page.getByRole('region', { name: 'Expedition field report' })).toContainText('High Ridge');
  await expect(page.locator('#outcomeReportToMara')).toBeVisible();
  await expect(page.locator('#outcomeReturn')).toBeVisible();

  await page.locator('#outcomeReportToMara').click();
  await expect(page.locator('.ash099-lines')).toContainText(/Ridgeway Cairn marks a dry line/i);
  const handoff = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    return {
      briefed: player.flags.firstRoadReturnMaraBriefed,
      objective: player.questLog.find(item => item.startsWith('The Bell That Rang Once:'))
    };
  });
  expect(handoff.briefed).toBe(true);
  expect(handoff.objective).toMatch(/Blackroot Bend/i);
});


async function enterDeparture(page) {
  await page.getByRole('navigation', { name: 'Ashmere terminal navigation' })
    .getByRole('button', { name: /Routes/i }).click();
  await page.getByRole('button', { name: /The Old Road/i }).click();
  await expect(page.locator('.ash100-departure')).toBeVisible();
}

async function beginRoadExpedition(page) {
  await page.locator('#departureBegin').click();
  await expect(page.locator('.exp150-world-page')).toBeVisible();
}

test('Ashmere departure briefing links preparation to the road and warns without blocking travel', async ({ page }) => {
  await startFreshTraveler(page);
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.questLog = (player.questLog || []).filter(item => !String(item).startsWith('The Bell That Rang Once:'));
    player.questLog.push('The Bell That Rang Once: Inspect the bell-marked seal at Blackroot Bend and return with your observations.');
    window.LegendRuntimeV120.savePlayer(player);
  });
  await enterDeparture(page);

  await expect(page.locator('.ash100-departure')).toContainText('TRAVELER CONDITION');
  await expect(page.locator('.ash100-departure')).toContainText('EQUIPPED LOADOUT');
  await expect(page.locator('.ash100-departure')).toContainText('FIELD SUPPLIES');
  await expect(page.locator('.ash100-departure-fork')).toContainText('High Ridge');
  await expect(page.locator('.ash100-departure-fork')).toContainText('Reed Cut');
  await expect(page.locator('.ash100-departure-order')).toContainText('Blackroot Bend');
  await expect(page.locator('.ash100-departure-order')).toContainText('OPEN FIELD ORDER');

  await page.locator('#departureInn').click();
  await expect(page.locator('#ashBack')).toBeVisible();
  await page.locator('#ashBack').click();
  await expect(page.locator('.ash100-town')).toBeVisible();
  await enterDeparture(page);

  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.hp = Math.round(player.maxHp * 0.35);
    player.inventory = player.inventory || {};
    player.inventory.food = 0;
    player.inventory.camp = 0;
    player.inventory.potion = 0;
    player.inventory.roadHerb = 0;
    player.inventory.clothScrap = 0;
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.route('road');
  });
  await expect(page.locator('#departureHealth')).toContainText(/35%/);
  await expect(page.locator('#departureAdvice')).toContainText(/health is critically low/i);
  await expect(page.locator('#departureAdvice')).toContainText(/no food or camp supplies/i);
  await expect(page.locator('#departureBegin')).toBeEnabled();

  await beginRoadExpedition(page);
  await expect(page.locator('.exp150-world-page')).toContainText('FIELD SUPPLIES');
});


test('expedition map and field journal preserve keyboard focus and recorded discoveries', async ({ page }) => {
  await startFreshTraveler(page);

  await enterDeparture(page);
  await beginRoadExpedition(page);

  await page.locator('#routeRidge').click();
  await expect(page.locator('.exp150-world-page')).toContainText(/High Ridge chosen|choose the High Ridge/i);
  await page.locator('.exp100-hotspot-find').click();
  await expect(page.locator('.exp100-discovery-beat')).toBeVisible();
  await page.locator('#poiInspect').click();

  const journalButton = page.locator('#exp150OpenJournal');
  await journalButton.click();
  const journalDialog = page.getByRole('dialog', { name: 'Field journal' });
  await expect(journalDialog).toBeVisible();
  await expect(journalDialog).toContainText('What the road remembers');
  await expect(journalDialog).toContainText('The Split Milestone');
  const journalClose = page.getByRole('button', { name: 'Return to the road' });
  await expect(journalClose).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(journalClose).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(journalDialog).toBeHidden();
  await expect(journalButton).toBeFocused();

  const mapButton = page.locator('#exp150OpenMap');
  await mapButton.click();
  const mapDialog = page.getByRole('dialog', { name: 'Road map' });
  await expect(mapDialog).toBeVisible();
  await expect(mapDialog).toContainText('The road you know');
  await expect(mapDialog).toContainText('The Split Milestone');
  await expect(mapDialog.locator('.exp150-map-discovery')).toHaveCount(1);
  await expect(mapDialog).toContainText('Lantern Ditch');
  await expect(mapDialog).toContainText('Route not taken');
  const mapClose = page.getByRole('button', { name: 'Return to the road' });
  await mapClose.click();
  await expect(mapDialog).toBeHidden();
  await expect(mapButton).toBeFocused();

  await page.reload();

  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  const savedJournal = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    const journal = player?.flags?.roadFieldJournalV150;
    return {
      routes: journal?.routes || [],
      discoveries: journal?.discoveries || [],
      visitedPlaces: journal?.visitedPlaces || []
    };
  });
  expect(savedJournal.routes.some(entry => entry.title === 'High Ridge')).toBe(true);
  expect(savedJournal.discoveries.some(entry => entry.key === 'fork-marker' && entry.name === 'The Split Milestone')).toBe(true);
  expect(savedJournal.visitedPlaces).toContain('South Fork');
});


test('waystation watch spends one ration, lowers pressure, and persists its camp report', async ({ page }) => {
  await startFreshTraveler(page);
  await page.evaluate(() => {
    const player=window.LegendRuntimeV120.loadPlayer();
    player.inventory=player.inventory||{};
    player.inventory.food=2;
    player.inventory.camp=1;
    player.inventory.roadHerb=0;
    player.inventory.clothScrap=0;
    player.flags=player.flags||{};
    player.flags.roadExpeditionV100={
      stage:2,pressure:54,trips:3,events:0,finds:0,battles:0,
      routeChoice:'reeds',poiUsed:{},searchUsed:{},readUsed:{},campWatchUsed:{}
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderHub();
  });

  await expect(page.locator('.exp150-camp-atmosphere')).toContainText(/Water ticks beneath the roots/i);
  await expect(page.locator('.exp150-camp-atmosphere')).toContainText(/birds have stopped calling/i);
  const dayBefore=await page.evaluate(()=>Number(window.LegendRuntimeV120.loadPlayer().day||1));
  await page.locator('#campWatch').click();
  await expect(page.locator('.exp150-expedition-head')).toContainText(/Road Pressure falls by 18/i);
  await expect(page.locator('#campWatch')).toBeDisabled();
  await expect(page.locator('#campWatch')).toContainText(/Watch Kept/i);

  const after=await page.evaluate(()=>{
    const player=window.LegendRuntimeV120.loadPlayer();
    const state=player.flags.roadExpeditionV100;
    const journal=player.flags.roadFieldJournalV150;
    return {
      food:Number(player.inventory.food),pressure:Number(state.pressure),day:Number(player.day),
      used:state.campWatchUsed?.['2']===true,
      report:journal?.campReports?.[journal.campReports.length-1]||null,
      watches:Number(player.stats?.roadWatchesKept||0)
    };
  });
  expect(after.food).toBe(1);
  expect(after.pressure).toBe(36);
  expect(after.day).toBe(dayBefore+1);
  expect(after.used).toBe(true);
  expect(after.watches).toBe(1);
  expect(after.report).toMatchObject({place:'Wayfarer\'s Camp',routeName:'Reed Cut',pressureBefore:54,pressureAfter:36});
  expect(after.report.note).toMatch(/Water shifts in the reeds/i);

  await page.locator('#exp150OpenJournal').click();
  const dialog=page.getByRole('dialog',{name:'Field journal'});
  await expect(dialog).toContainText(/Camp reports/i);
  await expect(dialog).toContainText(/Reed Cut/i);
  await expect(dialog).toContainText(/Water shifts in the reeds/i);
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  const persisted=await page.evaluate(()=>{
    const player=window.LegendRuntimeV120.loadPlayer();
    return {
      used:player.flags.roadExpeditionV100.campWatchUsed?.['2']===true,
      food:Number(player.inventory.food),
      reports:player.flags.roadFieldJournalV150?.campReports||[]
    };
  });
  expect(persisted.used).toBe(true);
  expect(persisted.food).toBe(1);
  expect(persisted.reports.some(item=>item.routeName==='Reed Cut'&&item.pressureAfter===36)).toBe(true);
});


test('late-night Reed Cut pressure summons a stronger Lantern Wisp', async ({ page }) => {
  await startFreshTraveler(page);
  await enterDeparture(page);
  await beginRoadExpedition(page);

  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.inventory = player.inventory || {};
    player.inventory.food = Math.max(2, Number(player.inventory.food || 0));
    player.flags = player.flags || {};
    player.flags.roadExpeditionV100 = {
      stage: 2, pressure: 70, trips: 4, events: 0, finds: 0, battles: 0,
      routeChoice: 'reeds', poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {},
      roadClockHour: 21
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderHub();
  });

  await expect(page.locator('.exp150-road-clock')).toContainText('Night');
  await expect(page.locator('.exp150-road-clock')).toContainText('Something may be following close behind');
  await page.locator('#push').click();
  await expect(page.locator('.rpg-battle')).toBeVisible();
  await expect(page.locator('.rpg-battle')).toContainText('Lantern Wisp');
  await expect(page.locator('.rpg-dialogue')).toContainText('The Reed Cut has carried your noise into the marsh');

  const consequence = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    const state = player.flags.roadExpeditionV100;
    return {
      tier: state.lastEncounterTier,
      enemy: state.lastEncounterEnemy,
      pressure: state.lastEncounterPressure,
      hour: state.roadClockHour,
      day: player.day
    };
  });
  expect(consequence).toMatchObject({ tier: 'severe', enemy: 'Lantern Wisp', pressure: 82, hour: 0 });
});
