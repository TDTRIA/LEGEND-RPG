const { test, expect } = require('@playwright/test');
test.use({ hasTouch: true });
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('legend-roads-of-ashmere-v09')));
const native = page => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeContracts);
async function enter(page, width, region = 'Ashmere') {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.setFixedTime(new Date('2026-11-13T12:00:00Z'));
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(region => {
    LegendStorage.savePlayer(LegendStorage.normalize({ username: 'ContractsQA', className: 'Ranger', level: 4, xp: 0,
      hp: 80, maxHp: 100, gold: 100, currentRegion: region, discoveredRegions: ['Ashmere', 'Greyfen'],
      stats: { pointsOfInterest: 8, roadVictories: 5, oldRoadClears: 2 },
      inventory: { roadCacheKey: 5, roadToken: 4, food: 2, clothScrap: 0, potion: 0, futureMaterial: 7 },
      flags: { introV094Complete: true, futureContractFlag: 'keep' }, futureExtension: { keep: true } }));
    LegendAshmereV099.route('quests');
  }, region);
  await expect.poll(() => native(page)).toMatchObject({ active: true });
  await expect(page.locator('#dailyCacheOpen')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('#dailyCacheOpen')).toHaveCSS('background-image', 'none');
}
async function feedback(page) {
  const notice = page.locator('.ash099-daily-notice');
  await expect(notice).toBeFocused();
  const box = await notice.boundingBox(), dock = await page.locator('.lws-bottom-bar').boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(dock.y);
  await expect.poll(() => native(page)).toMatchObject({ active: true });
}
async function roll(page, values) {
  await page.evaluate(values => {
    const random = Math.random;
    window.addEventListener('click', () => {
      Math.random = () => new Error().stack?.split('\n')[2]?.includes('ashmere-contracts-v099.js') ? values.shift() : random();
    }, { capture: true, once: true });
    window.addEventListener('click', () => { Math.random = random; }, { once: true });
  }, values);
}
for (const width of [1440, 390]) {
  test(`daily claims and calendar rollover preserve exact state at ${width}px`, async ({ page }) => {
    test.setTimeout(180000);
    await enter(page, width);
    const expected = await saved(page);
    expect(expected.flags.dailyContractsV151).toEqual({ dayKey: '2026-11-13', baseline: { poi: 8, battle: 5, return: 2 }, claimed: [] });
    await expect(page.locator('[data-daily-claim]')).toHaveCount(0);
    await expect(page.locator('.ash099-daily-card button:disabled')).toHaveCount(3);
    await page.locator('.ash099-cache-odds summary').focus(); await page.keyboard.press('Enter');
    await expect.poll(() => native(page)).toMatchObject({ active: true, oddsOpen: true });
    expect((await native(page)).labels).toEqual(expect.arrayContaining(['40% — Field supplies: 2 Rations', '2% — Rare route cache: 1 Road Token and 100 gold']));
    expect(await saved(page)).toEqual(expected);
    await page.evaluate(() => {
      const p = LegendStorage.loadPlayer(); p.stats.pointsOfInterest++; p.stats.roadVictories++; p.stats.oldRoadClears++;
      LegendStorage.savePlayer(p); LegendAshmereV099.route('quests');
    });
    expected.stats.pointsOfInterest++; expected.stats.roadVictories++; expected.stats.oldRoadClears++;
    for (const [id, title, gold, xp] of [['survey', 'Map the Lantern Line', 30, 20], ['hold', 'Hold the Blackroot Line', 35, 25], ['return', 'Bring Proof Home', 45, 30]]) {
      await page.locator(`[data-daily-claim="${id}"]`).evaluate(node => { window.oldClaim = node; });
      await page.locator(`[data-daily-claim="${id}"]`).tap();
      expected.gold += gold; expected.xp += xp; expected.inventory.roadCacheKey++;
      expected.flags.dailyContractsV151.claimed.push(id);
      expected.stats.dailyContractsCompleted = Number(expected.stats.dailyContractsCompleted || 0) + 1;
      expected.memories.push('Completed daily field contract: ' + title + '.');
      expect(await saved(page)).toEqual(expected);
      await feedback(page);
      await expect.poll(() => native(page)).toMatchObject({ oddsOpen: true });
      await page.evaluate(() => window.oldClaim.click());
      expect(await saved(page)).toEqual(expected);
    }
    await page.clock.setFixedTime(new Date('2026-11-14T12:00:00Z'));
    await page.evaluate(() => LegendAshmereV099.route('quests'));
    expected.flags.dailyContractsV151 = { dayKey: '2026-11-14', baseline: { poi: 9, battle: 6, return: 3 }, claimed: [] };
    expect(await saved(page)).toEqual(expected);
    await expect(page.locator('[data-daily-claim]')).toHaveCount(0);
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
    await expect.poll(async () => (await native(page)).active).toBe(false);
    expect(await saved(page)).toEqual(expected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`cache bands and side-contract fallback preserve rewards at ${width}px`, async ({ page }) => {
    test.setTimeout(180000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await enter(page, width, 'Greyfen');
    const expected = await saved(page);
    await page.locator('.ash099-cache-odds summary').tap();
    const cases = [
      [[0.399], 'Field supplies · 2 Rations', { food: 2 }, 0],
      [[0.4, 0.999], 'Pouch of coin · 100g', {}, 100],
      [[0.7, 0.5], 'Crafting materials · 2 Cloth Scrap', { clothScrap: 2 }, 0],
      [[0.9], 'Medic bundle · 2 Rations and 1 Healing Potion', { food: 2, potion: 1 }, 0],
      [[0.98], 'Rare route cache · 1 Road Token and 100g', { roadToken: 1 }, 100]
    ];
    for (const [values, result, items, gold] of cases) {
      await roll(page, values); await page.locator('#dailyCacheOpen').tap();
      expected.inventory.roadCacheKey--; expected.gold += gold;
      for (const [item, count] of Object.entries(items)) expected.inventory[item] += count;
      expected.stats.dailyCachesOpened = Number(expected.stats.dailyCachesOpened || 0) + 1;
      expected.memories.push('Opened a Road Cache: ' + result + '.');
      expect(await saved(page)).toEqual(expected);
      await feedback(page);
      await expect.poll(async () => (await native(page)).labels.join(' ')).toContain('Road Cache opened: ' + result + '.');
      await expect.poll(() => native(page)).toMatchObject({ oddsOpen: true });
    }
    await expect(page.locator('#dailyCacheOpen')).toBeDisabled();
    await page.locator('#dailyCacheOpen').evaluate(node => node.click());
    expect(await saved(page)).toEqual(expected);
    await page.locator('[data-contract-accept="watchlightSurvey"]').tap();
    expected.flags.sideContracts = { watchlightSurvey: { startedAt: 8, complete: false } };
    expect(await saved(page)).toEqual(expected);
    await expect(page.locator('[data-contract-turnin="watchlightSurvey"]')).toHaveCount(0);
    await page.evaluate(() => { const p = LegendStorage.loadPlayer(); p.stats.pointsOfInterest++; LegendStorage.savePlayer(p); LegendAshmereV099.route('quests'); });
    expected.stats.pointsOfInterest++;
    // Missing objective copy must expose the styled original report action.
    await page.locator('[data-contract-id="watchlightSurvey"] .ash099-contract-objective > strong').evaluate(node => node.remove());
    await expect.poll(async () => (await native(page)).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.locator('[data-contract-turnin="watchlightSurvey"]').evaluate(node => { window.oldReport = node; });
    await page.locator('[data-contract-turnin="watchlightSurvey"]').tap();
    expected.flags.sideContracts.watchlightSurvey.complete = true;
    expected.gold += 55; expected.xp += 25; expected.inventory.food++;
    expected.flags.ashmereFavor = Number(expected.flags.ashmereFavor || 0) + 2;
    expected.stats.sideContractsCompleted = 1;
    expected.memories.push('Completed side contract: The Watchlight Survey.');
    expect(await saved(page)).toEqual(expected);
    await feedback(page);
    await page.evaluate(() => window.oldReport.click());
    expect(await saved(page)).toEqual(expected);
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    await page.reload(); expect(await saved(page)).toEqual(expected);
    expect(errors).toEqual([]);
  });
}

test('daily reward level-up retains the progression dialog', async ({ page }) => {
  test.setTimeout(150000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await enter(page, 390);
  await page.evaluate(() => { const p = LegendStorage.loadPlayer(); p.xp = 390; p.stats.pointsOfInterest++; LegendStorage.savePlayer(p); LegendAshmereV099.route('quests'); });
  await page.locator('[data-daily-claim="survey"]').tap();
  expect(await saved(page)).toMatchObject({ level: 5, xp: 10, gold: 130, hp: 88, maxHp: 108, pendingStatPointsV152: 2 });
  await expect(page.locator('#legendLevelUpOverlay')).toBeVisible();
  await expect(page.locator('.ash099-daily-notice')).not.toBeFocused();
  await page.locator('[data-attr-add="might"]').tap();
  await page.locator('[data-attr-add="insight"]').tap();
  await page.locator('#v152-growth-confirm').tap();
  await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(0);
  expect((await saved(page)).pendingStatPointsV152).toBe(0);
  await page.locator('#ashBack').tap();
  await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
  expect(errors).toEqual([]);
});
