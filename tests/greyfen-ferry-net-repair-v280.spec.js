const { test, expect } = require('@playwright/test');

async function openWorkBoard(page, region = 'Greyfen') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(({ region }) => {
    window.LegendStorage.deleteSaves();
    const player = {
      version: window.LEGEND_DATA.VERSION,
      username: 'GreyfenNetRepairQA',
      className: 'Ranger',
      level: 3,
      xp: 0,
      hp: 100,
      maxHp: 100,
      gold: 100,
      town: region,
      currentRegion: region,
      weapon: 'hand',
      armor: 'none',
      ownedWeapons: { hand: 1 },
      ownedArmor: { none: 1 },
      inventory: { food: 2, camp: 1, clothScrap: 0, peatBrick: 0, roadHerb: 0, woodScrap: 0, ore: 0 },
      flags: { firstRoadReturnSeen: true, greyfenDryCrossingComplete: true },
      stats: {},
      traits: [],
      skills: {},
      mastery: {},
      memories: [],
      questLog: [],
      quests: {},
      discoveredRegions: ['Ashmere', 'Greyfen'],
      unlockedRegions: ['Ashmere', 'Greyfen']
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.route('work');
  }, { region });
  await expect(page.locator('.ash099-job-board')).toBeVisible();
}

test.describe('Greyfen ferry net repair work v0.30.0', () => {
  test('patching ferry nets awards useful Cloth Scrap and survives reload', async ({ page }) => {
    // Two production scene loads plus the authored reveal need room on software GPUs.
    test.setTimeout(90000);
    await openWorkBoard(page);
    const job = page.locator('[data-job-open="nets"]');
    await expect(job).toBeVisible();
    await expect(job).toContainText('Patch the Ferry Nets');
    await expect(job).toContainText('36g base pay');
    await job.click();
    await expect(page.locator('.ash099-job-game')).toHaveAttribute('data-job-mode', 'sequence');
    await expect(page.locator('.ash099-job-meta')).toContainText('Cloth Scrap ×2');

    await page.evaluate(() => {
      // Fix only job-owner randomness; Phaser texture creation keeps its RNG.
      const random = Math.random;
      window.addEventListener('click', () => { Math.random = () => new Error().stack?.split('\n')[2]?.includes('ashmere-workboard-v099.js') ? 0 : random(); }, true);
      window.addEventListener('click', () => { Math.random = random; });
    });
    await page.locator('#jobStartSequence').click();
    await expect(page.locator('#jobSequenceStatus')).toContainText('Repeat the sequence', { timeout: 6000 });
    for (const action of ['CHECK', 'LOOP', 'KNOT', 'TEST']) {
      await page.locator('[data-job-sequence="' + action + '"]').click();
    }
    await expect(page.locator('#jobResult')).toBeVisible();
    await expect(page.locator('#jobResult')).toContainText('Perfect!');
    await expect(page.locator('#jobResult')).toContainText('Bonus gained: 2 Cloth Scrap.');

    const completed = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        region: player.currentRegion,
        gold: Number(player.gold || 0),
        clothScrap: Number(player.inventory.clothScrap || 0),
        jobs: Number(player.flags.ashmereJobs || 0),
        favor: Number(player.flags.ashmereFavor || 0)
      };
    });
    expect(completed).toEqual({ region: 'Greyfen', gold: 152, clothScrap: 2, jobs: 1, favor: 2 });

    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
    const persisted = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        region: player.currentRegion,
        gold: Number(player.gold || 0),
        clothScrap: Number(player.inventory.clothScrap || 0),
        jobs: Number(player.flags.ashmereJobs || 0),
        favor: Number(player.flags.ashmereFavor || 0)
      };
    });
    expect(persisted).toEqual(completed);
  });

  test('the ferry net repair job is only offered in Greyfen', async ({ page }) => {
    await openWorkBoard(page, 'Ashmere');
    await expect(page.locator('[data-job-open="nets"]')).toHaveCount(0);
    await openWorkBoard(page, 'Greyfen');
    await expect(page.locator('[data-job-open="nets"]')).toHaveCount(1);
  });
});
