const { test, expect } = require('@playwright/test');
test.use({ hasTouch: true });
async function visibleResult(page) {
  await expect(page.locator('#jobResult')).toBeFocused();
  const result = await page.locator('#jobResult').boundingBox();
  const dock = await page.locator('.lws-bottom-bar').boundingBox();
  expect(result.y + result.height).toBeLessThanOrEqual(dock.y);
}
const save = page => page.evaluate(() => JSON.parse(localStorage.getItem('legend-roads-of-ashmere-v09')));
const native = page => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeWorkboard);
async function enter(page, width, region = 'Ashmere') {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(region => {
    LegendStorage.savePlayer(LegendStorage.normalize({ username: 'WorkQA', className: 'Ranger', level: 3, xp: 0,
      hp: 80, maxHp: 100, gold: 100, currentRegion: region, discoveredRegions: ['Ashmere', 'Greyfen'],
      inventory: { food: 2, clothScrap: 0, woodScrap: 0, roadToken: 4, futureMaterial: 3 },
      flags: { introV094Complete: true, futureWorkFlag: 'keep' }, futureExtension: { keep: true } }));
    // Fix only random calls from the job owner during input. Phaser can also
    // create textures synchronously in that event and must keep unique IDs.
    const random = Math.random;
    for (const event of ['click', 'keydown']) {
      window.addEventListener(event, () => { Math.random = () => new Error().stack?.split('\n')[2]?.includes('ashmere-workboard-v099.js') ? 0 : random(); }, true);
      window.addEventListener(event, () => { Math.random = random; });
    }
    LegendAshmereV099.route('work');
  }, region);
  await expect.poll(() => native(page)).toMatchObject({ active: true });
}
function reward(expected, gold, xp, item, count, perfect = true) {
  expected.gold += gold; expected.xp += xp;
  expected.flags.ashmereJobs = Number(expected.flags.ashmereJobs || 0) + 1;
  expected.flags.ashmereFavor = Number(expected.flags.ashmereFavor || 0) + (perfect ? 2 : 1);
  expected.inventory[item] = Number(expected.inventory[item] || 0) + count;
}

test('abandoned jobs cannot pay or interfere with later work and keyboard navigation', async ({ page }) => {
  test.setTimeout(150000);
  await enter(page, 1440);
  const expected = await save(page);
  await page.locator('[data-job-open="wood"]').tap();
  await expect.poll(async () => (await native(page)).mode).toBe('timing');
  const first = await page.locator('#jobMarker').getAttribute('style');
  await expect.poll(() => page.locator('#jobMarker').getAttribute('style')).not.toBe(first);
  // Same-task dispatch catches stale handlers before a MutationObserver can clean up.
  await page.evaluate(() => {
    window.detachedStrike = document.getElementById('jobStrike');
    document.getElementById('ashBack').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    window.detachedStrike.click();
  });
  expect(await save(page)).toEqual(expected);
  await page.evaluate(() => LegendAshmereV099.route('work'));
  await page.locator('[data-job-open="wood"]').tap();
  await page.locator('#backJobs').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.ash099-job-board')).toBeVisible();
  expect(await save(page)).toEqual(expected);
  await page.locator('[data-job-open="crates"]').tap();
  await page.locator('#jobStartSequence').tap();
  await page.evaluate(() => { LegendAshmereV099.route('work'); document.querySelector('[data-job-open="crates"]').click(); });
  // Old four-step reveal must never enable a new, unstarted activity's controls.
  await page.waitForTimeout(3000);
  for (const button of await page.locator('[data-job-sequence]').all()) await expect(button).toBeDisabled();
  expect(await save(page)).toEqual(expected);
  await page.locator('#backJobs').tap();
  await page.evaluate(() => { document.querySelector('[data-job-open="wood"]').click(); document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })); });
  reward(expected, 14, 10, 'woodScrap', 1, false); expected.hp -= 1;
  expect(await save(page)).toEqual(expected);
  await expect.poll(async () => (await native(page)).labels).toContain('Miss! Earned 14g. Bonus gained: 1 Wood Scrap. You lose 1 HP from the rough work. Local standing increased. XP +10.');
  await page.keyboard.press('Enter');
  expect(await save(page)).toEqual(expected);
});

for (const width of [1440, 390]) {
  test(`board, choices and fallback preserve exact rewards at ${width}px`, async ({ page }) => {
    test.setTimeout(150000);
    await enter(page, width);
    const expected = await save(page);
    expect((await native(page)).labels).toEqual(expect.arrayContaining(['6 ways to earn your keep', '85g', '45 XP', '2 Cloth Scrap', 'Open field posting', 'View Daily Board']));
    await page.locator('[data-job-open="gate"]').tap();
    await expect.poll(async () => (await native(page)).mode).toBe('signal');
    await page.locator('[data-job-choice="0"]').focus(); await page.keyboard.press('Enter');
    reward(expected, 61, 28, 'food', 1);
    expect(await save(page)).toEqual(expected);
    await visibleResult(page);
    await expect.poll(async () => (await native(page)).labels.join(' ')).toContain('Earned 61g.');
    await page.locator('[data-job-choice="0"]').evaluate(node => node.click());
    expect(await save(page)).toEqual(expected);
    await page.locator('#backJobs').tap();
    await page.locator('[data-job-open="yard"]').tap();
    await expect.poll(async () => (await native(page)).mode).toBe('triage');
    await page.locator('[data-job-choice="2"] .ash099-job-choice-index').evaluate(node => node.remove());
    await expect.poll(async () => (await native(page)).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.locator('[data-job-choice="2"]').tap();
    reward(expected, 11, 10, 'clothScrap', 1, false); expected.hp -= 1;
    expect(await save(page)).toEqual(expected);
    await page.locator('#backJobs').tap();
    await expect.poll(() => native(page)).toMatchObject({ active: true });
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
    expect(await save(page)).toEqual(expected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`Greyfen sequence feedback, rewards and reload remain usable at ${width}px`, async ({ page }) => {
    test.setTimeout(150000);
    await enter(page, width, 'Greyfen');
    const expected = await save(page);
    await expect(page.locator('[data-job-open]')).toHaveCount(4);
    expect((await native(page)).labels).toContain('Bellkeeper’s Hall');
    await page.locator('[data-job-open="nets"]').tap();
    await expect.poll(async () => (await native(page)).mode).toBe('sequence');
    await page.locator('#jobStartSequence').tap();
    await expect.poll(async () => (await native(page)).labels.join(' ')).toContain('STEP 1 / 4');
    await expect(page.locator('[data-job-sequence="CHECK"]')).toBeEnabled({ timeout: 10000 });
    await expect.poll(async () => (await native(page)).labels).toContain('Your turn · repeat all 4 steps');
    for (const action of ['CHECK', 'LOOP', 'KNOT', 'TEST']) await page.locator(`[data-job-sequence="${action}"]`).tap();
    reward(expected, 52, 28, 'clothScrap', 2);
    expect(await save(page)).toEqual(expected);
    await expect.poll(async () => (await native(page)).labels.join(' ')).toContain('Perfect! You repeated the full handling sequence. Earned 52g.');
    await visibleResult(page);
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    expect(await save(page)).toEqual(expected);
    await page.reload();
    expect(await save(page)).toEqual(expected);
  });
}

test('job level-up keeps the progression dialog in control', async ({ page }) => {
  test.setTimeout(150000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await enter(page, 390);
  await page.evaluate(() => { const p = LegendStorage.loadPlayer(); p.xp = 290; LegendStorage.savePlayer(p); });
  await page.locator('[data-job-open="gate"]').tap();
  await page.locator('[data-job-choice="0"]').tap();
  const player = await save(page);
  expect(player).toMatchObject({ level: 4, xp: 18, maxHp: 108, hp: 88, gold: 161, pendingStatPointsV152: 2 });
  await expect(page.locator('#legendLevelUpOverlay')).toBeVisible();
  await expect(page.locator('#jobResult')).not.toBeFocused();
  await page.locator('[data-attr-add="might"]').tap();
  await page.locator('[data-attr-add="insight"]').tap();
  await page.locator('#v152-growth-confirm').tap();
  await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(0);
  expect((await save(page)).pendingStatPointsV152).toBe(0);
  await page.locator('#ashBack').tap();
  await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
  expect(errors).toEqual([]);
});
