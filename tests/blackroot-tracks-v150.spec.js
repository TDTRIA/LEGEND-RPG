const { test, expect } = require('@playwright/test');

async function startTraveler(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
  await page.getByRole('button', { name:/Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /Skip the annals/i }).click();
  await page.locator('#v094Name').fill('BlackrootFieldQA');
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin="Lost Squire"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-class="Ranger"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name:/Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

async function acceptBlackrootPosting(page) {
  await page.locator('.ash100-destinations').getByRole('button', { name:/Work Board/i }).click();
  await expect(page.locator('#openAshmereFieldContracts')).toBeVisible();
  await page.locator('#openAshmereFieldContracts').click();
  const card=page.locator('.ash099-contract-card').filter({ hasText:'A Trail Worth Keeping' });
  await expect(card).toBeVisible();
  await expect(card).toContainText(/Old Brenn/i);
  await expect(card).toContainText('85g · 45 XP');
  await card.locator('[data-contract-accept="blackrootTrailSurvey"]').click();
  await expect(page.locator('.ash099-contract-card').filter({ hasText:'A Trail Worth Keeping' })).toContainText('IN PROGRESS');
}

async function travelToBlackroot(page, pressure = 11) {
  await page.evaluate(pressure => {
    const player=window.LegendRuntimeV120.loadPlayer();
    player.currentRegion='Ashmere';
    player.town='Ashmere';
    player.flags=player.flags||{};
    player.flags.roadExpeditionV100={
      stage:3,
      pressure,
      trips:1,
      events:0,
      finds:0,
      battles:0,
      routeChoice:'ridge',
      roadClockHour:9,
      visitedNodeIdsV160:['south-fork','high-ridge','ridgeway-cairn','wayfarers-camp','blackroot-bend'],
      discoveredNodeIdsV160:['south-fork','high-ridge','ridgeway-cairn','wayfarers-camp','blackroot-bend'],
      completedInteractionIdsV160:[]
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderExpedition();
  }, pressure);
  await expect(page.locator('.exp100-scene')).toBeVisible();
  await expect(page.locator('.exp150-title-group h1')).toHaveText('Blackroot Bend');
  await expect(page.locator('.exp160-field-contract')).toBeVisible();
}

test.describe('Blackroot field survey contract v0.29.0', () => {
  test('accepting, measuring and reporting the tracks pays once and survives reload', async ({ page }) => {
    await startTraveler(page);
    await acceptBlackrootPosting(page);

    const before=await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      return {
        gold:Number(player.gold||0),
        cloth:Number(player.inventory?.clothScrap||0),
        pressure:Number(player.flags.roadExpeditionV100?.pressure||0)
      };
    });
    await travelToBlackroot(page,before.pressure || 11);
    await expect(page.locator('.exp160-field-contract')).toContainText('Measure before disturbing the ground');
    await page.locator('[data-blackroot-survey="measure"]').click();
    await expect(page.locator('.exp160-field-contract.is-recorded')).toContainText('Return to Ashmere');

    const fieldReport=await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      const report=player.flags.roadContractsV290.blackrootTrailSurvey;
      const journal=player.flags.roadFieldJournalV150;
      return {
        choice:report.choice,
        day:report.day,
        note:report.note,
        discoveries:(journal?.discoveries||[]).filter(item=>item.key==='blackroot-track-survey').length,
        clock:player.flags.roadExpeditionV100.roadClockHour
      };
    });
    expect(fieldReport.choice).toBe('measure');
    expect(fieldReport.note).toContain('measured the shallow impression');
    expect(fieldReport.discoveries).toBe(1);
    expect(fieldReport.clock).toBe(10);

    await page.evaluate(() => {
      window.LegendAshmereV099.renderAshmere();
      window.LegendAshmereV099.route('quests');
    });
    const ready=page.locator('.ash099-contract-card').filter({ hasText:'A Trail Worth Keeping' });
    await expect(ready).toContainText('READY TO REPORT');
    await ready.locator('[data-contract-turnin="blackrootTrailSurvey"]').click();

    const paid=await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      return {
        gold:Number(player.gold||0),
        cloth:Number(player.inventory?.clothScrap||0),
        completed:!!player.flags.sideContracts.blackrootTrailSurvey.complete,
        reports:Number(player.stats.blackrootTrackSurveys||0)
      };
    });
    expect(paid.gold).toBe(before.gold+85);
    expect(paid.cloth).toBe(before.cloth+2);
    expect(paid.completed).toBe(true);
    expect(paid.reports).toBe(1);

    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await page.evaluate(() => window.LegendAshmereV099.route('quests'));
    const persisted=page.locator('.ash099-contract-card').filter({ hasText:'A Trail Worth Keeping' });
    await expect(persisted).toContainText('COMPLETED');
    await expect(persisted.locator('[data-contract-turnin="blackrootTrailSurvey"]')).toHaveCount(0);
    const afterReload=await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      return {gold:player.gold,cloth:player.inventory.clothScrap,complete:player.flags.sideContracts.blackrootTrailSurvey.complete};
    });
    expect(afterReload).toMatchObject({gold:paid.gold,cloth:paid.cloth,complete:true});
  });

  test('following the prints is a disclosed higher-pressure choice with a field find', async ({ page }) => {
    await startTraveler(page);
    await acceptBlackrootPosting(page);
    await travelToBlackroot(page,20);
    const before=await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      return {
        pressure:Number(player.flags.roadExpeditionV100.pressure||0),
        herb:Number(player.inventory.roadHerb||0),
        clock:Number(player.flags.roadExpeditionV100.roadClockHour||0)
      };
    });
    await page.locator('[data-blackroot-survey="follow"]').click();
    const after=await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      return {
        pressure:Number(player.flags.roadExpeditionV100.pressure||0),
        herb:Number(player.inventory.roadHerb||0),
        clock:Number(player.flags.roadExpeditionV100.roadClockHour||0),
        choice:player.flags.roadContractsV290.blackrootTrailSurvey.choice
      };
    });
    expect(after.pressure).toBe(before.pressure+8);
    expect(after.herb).toBe(before.herb+1);
    expect(after.clock).toBe(before.clock+1);
    expect(after.choice).toBe('follow');
  });
});
