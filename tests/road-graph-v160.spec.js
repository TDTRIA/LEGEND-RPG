const { test, expect } = require('@playwright/test');

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function startFreshTraveler(page, name = 'RoadGraphQA') {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Name').fill(name);
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
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

async function seedRoadStage(page, stage, route = null) {
  await page.evaluate(({ stage, route }) => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.inventory = player.inventory || {};
    player.inventory.food = 2;
    player.inventory.clothScrap = 0;
    player.flags = player.flags || {};
    player.flags.roadExpeditionV100 = {
      stage, pressure: 12, trips: 1, events: 0, finds: 0, battles: 0,
      routeChoice: route,
      poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, roadClockHour: 15
    };
    player.flags.roadFieldJournalV150 = { visitedPlaces: [], discoveries: [], routes: [], campReports: [] };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderExpedition();
  }, { stage, route });
  await expect(page.locator('.exp150-world-page')).toBeVisible();
}

test('the authored route graph connects both route branches to the shared Greyfen boundary', async ({ page }) => {
  await page.goto('/');
  const graph = await page.evaluate(() => window.LegendRoadsV100.oldRoad.routeGraphV160);
  const ids = new Set(graph.nodes.map(node => node.id));
  expect(ids.has('windbreak')).toBe(true);
  expect(ids.has('sunken-cart')).toBe(true);
  expect(graph.edges).toContainEqual({ from: 'south-fork', to: 'high-ridge', route: 'ridge', kind: 'main' });
  expect(graph.edges).toContainEqual({ from: 'south-fork', to: 'reed-cut', route: 'reeds', kind: 'main' });
  for (const start of ['windbreak', 'sunken-cart']) {
    expect(graph.edges.some(edge => edge.from === start && edge.to === 'wayfarers-camp')).toBe(true);
  }
  expect(graph.edges).toContainEqual({ from: 'reedwatch-shelter', to: 'greyfen-boundary', kind: 'main' });
});

test('legacy road saves acquire additive graph fields without losing stage, route, pressure, or trip count', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const rules = window.LegendRoadStateV100.create({
      getData: () => window.LEGEND_DATA,
      clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))
    });
    const player = { flags: { roadExpeditionV100: { stage: 2, routeChoice: 'reeds', pressure: 37, trips: 4 } } };
    const state = rules.ensure(player);
    return {
      stage: state.stage, routeChoice: state.routeChoice, pressure: state.pressure, trips: state.trips,
      currentNodeId: state.currentNodeIdV160, visited: state.visitedNodeIdsV160,
      discovered: state.discoveredNodeIdsV160, completed: state.completedInteractionIdsV160
    };
  });
  expect(result).toEqual({
    stage: 2, routeChoice: 'reeds', pressure: 37, trips: 4,
    currentNodeId: null, visited: [], discovered: [], completed: []
  });
});

test('the map can choose a route and shows the unchosen branch explicitly', async ({ page }) => {
  await startFreshTraveler(page, 'MapForkQA');
  await seedRoadStage(page, 0, null);
  await page.locator('#exp150OpenMap').click();
  const dialog = page.getByRole('dialog', { name: 'Road map' });
  await expect(dialog.locator('[data-exp160-map-route="ridge"]')).toBeVisible();
  await expect(dialog.locator('[data-exp160-map-route="reeds"]')).toBeVisible();
  await dialog.locator('[data-exp160-map-route="reeds"]').click();
  await expect(page.locator('.exp100-poi-done')).toContainText('Reed Cut');
  const route = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100.routeChoice);
  expect(route).toBe('reeds');
  await page.locator('#exp150OpenMap').click();
  await expect(page.getByRole('dialog', { name: 'Road map' })).toContainText('Route not taken');
});

test('Windbreak is an optional logged stop and the player can return to the route or continue to camp', async ({ page }) => {
  await startFreshTraveler(page, 'WindbreakQA');
  await seedRoadStage(page, 1, 'ridge');
  await page.locator('#exp150OpenMap').click();
  const map = page.getByRole('dialog', { name: 'Road map' });
  await expect(map.locator('[data-exp160-map-visit="windbreak"]')).toBeVisible();
  await map.locator('[data-exp160-map-visit="windbreak"]').click();
  await expect(page.locator('.exp160-optional-site').getByRole('heading', { name: 'Windbreak' })).toBeVisible();
  await expect(page.locator('#exp160WindObserve')).toContainText('Cost: 1 hour');
  await page.locator('#exp160WindObserve').click();
  const result = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    const state = player.flags.roadExpeditionV100;
    const journal = player.flags.roadFieldJournalV150;
    return {
      node: state.currentNodeIdV160, hour: state.roadClockHour,
      completed: state.completedInteractionIdsV160,
      discovery: journal.discoveries.find(item => item.key === 'windbreak-track-observation')
    };
  });
  expect(result.node).toBe('windbreak');
  expect(result.hour).toBe(16);
  expect(result.completed).toContain('windbreak');
  expect(result.discovery).toMatchObject({ place: 'Windbreak', route: 'ridge' });
  await page.locator('#exp160ReturnToRoute').click();
  await expect(page.locator('.exp150-world-page')).toBeVisible();
  await page.locator('#push').click();
  const current = await page.evaluate(() => {
    const state = window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100;
    return { stage: state.stage, node: state.currentNodeIdV160, visited: state.visitedNodeIdsV160 };
  });
  expect(current.stage).toBe(2);
  expect(current.node).toBe('wayfarers-camp');
  expect(current.visited).toContain('windbreak');
});

test('the optional Windbreak stop can be skipped without blocking the shared road', async ({ page }) => {
  await startFreshTraveler(page, 'SkipDetourQA');
  await seedRoadStage(page, 1, 'ridge');
  await page.locator('#push').click();
  const state = await page.evaluate(() => {
    const road = window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100;
    return { stage: road.stage, current: road.currentNodeIdV160, visited: road.visitedNodeIdsV160, discovered: road.discoveredNodeIdsV160, pressure: road.pressure };
  });
  expect(state.stage).toBe(2);
  expect(state.current).toBe('wayfarers-camp');
  expect(state.visited).not.toContain('windbreak');
  expect(state.discovered).not.toContain('windbreak');
  await page.locator('#exp150OpenMap').click();
  await expect(page.getByRole('dialog', { name: 'Road map' })).toContainText('Detour skipped');
});

test('the map remains usable at 390px without horizontal overflow', async ({ page }) => {
  await startFreshTraveler(page, 'MobileMapQA');
  await page.setViewportSize({ width: 390, height: 844 });
  await seedRoadStage(page, 1, 'reeds');
  await page.locator('#exp150OpenMap').click();
  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    mapWidth: document.querySelector('.exp160-route-graph')?.scrollWidth || 0,
    mapClientWidth: document.querySelector('.exp160-route-graph')?.clientWidth || 0
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.mapWidth).toBeLessThanOrEqual(layout.mapClientWidth);
  await expect(page.getByRole('dialog', { name: 'Road map' }).locator('[data-exp160-map-visit="sunken-cart"]')).toBeVisible();
});

test('Sunken Cart salvage discloses cost and records the recovered material without gating the route', async ({ page }) => {
  await startFreshTraveler(page, 'SunkenCartQA');
  await seedRoadStage(page, 1, 'reeds');
  await page.locator('#exp150OpenMap').click();
  await page.getByRole('dialog', { name: 'Road map' }).locator('[data-exp160-map-visit="sunken-cart"]').click();
  await expect(page.locator('.exp160-optional-site').getByRole('heading', { name: 'Sunken Cart' })).toBeVisible();
  await expect(page.locator('#exp160CartSalvage')).toContainText('5 Road Pressure');
  await page.locator('#exp160CartSalvage').click();
  const result = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    const state = player.flags.roadExpeditionV100;
    return {
      pressure: state.pressure, hour: state.roadClockHour,
      cloth: Number(player.inventory.clothScrap || 0),
      saved: player.flags.roadFieldJournalV150.discoveries.some(item => item.key === 'sunken-cart-salvage')
    };
  });
  expect(result).toEqual({ pressure: 17, hour: 16, cloth: 1, saved: true });
  await page.locator('#exp160ContinueToCamp').click();
  const after = await page.evaluate(() => {
    const state = window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100;
    return { stage: state.stage, node: state.currentNodeIdV160 };
  });
  expect(after).toEqual({ stage: 2, node: 'wayfarers-camp' });
});
