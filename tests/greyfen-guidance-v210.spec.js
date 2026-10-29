const { test, expect } = require('@playwright/test');

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
}

async function startFreshCharacter(page, name = 'GreyfenGuideQA') {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /Skip the annals/i }).click();
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

test.describe('Greyfen story guidance v0.24.1', () => {
  test('the Current Route guidance follows saved evidence handoffs before generic town contracts', async ({ page }) => {
    await openTitle(page);
    const goals = await page.evaluate(() => {
      const getGoal = window.LegendAshmereGuidanceV099?.getGoal;
      if (typeof getGoal !== 'function') throw new Error('Greyfen guidance module did not load.');
      const pick = (region, flags = {}) => {
        const goal = getGoal({ currentRegion: region, inventory: { roadToken: 0 }, flags });
        return { view: goal.view, title: goal.title, cta: goal.cta, icon: goal.icon };
      };
      return {
        boundaryOnOldRoad: pick('Ashmere', { bellRoadSearched: true }),
        archiveFromGreyfen: pick('Greyfen', { greyfenBoundaryCompared: true }),
        fieldNoteOnOldRoad: pick('Ashmere', { greyfenArchiveRead: true }),
        reportFieldNote: pick('Greyfen', { greyfenFieldNoteFound: true }),
        compareLedger: pick('Greyfen', { greyfenFieldNoteReported: true }),
        returnToOldRoadFromGreyfen: pick('Greyfen', { greyfenLedgerCompared: true }),
        searchOldRoadFromAshmere: pick('Ashmere', { greyfenLedgerCompared: true }),
        reportWeeklyReturn: pick('Greyfen', { greyfenWeeklyReturnFound: true }),
        fileEvidence: pick('Greyfen', { greyfenWeeklyReturnReported: true }),
        reportGauge: pick('Greyfen', { greyfenEvidenceFiled: true, greyfenWaterlineGaugeRead: true }),
        continueAfterGauge: pick('Greyfen', { greyfenWaterlineGaugeRead: true, greyfenWaterlineGaugeReported: true }),
        finalArchive: pick('Greyfen', {
          greyfenEvidenceFiled: true,
          greyfenWeeklyReturnFound: true,
          greyfenWeeklyReturnReported: true,
          greyfenWaterlineGaugeRead: true,
          greyfenWaterlineGaugeReported: true,
          greyfenCrossingResponseV261: 'provisional-notice',
          greyfenNoticePressureCreditV261: false
        }),
        defaultGreyfen: pick('Greyfen')
      };
    });

    expect(goals.boundaryOnOldRoad).toMatchObject({ view: 'road', title: 'Find the Matching Boundary Mark' });
    expect(goals.archiveFromGreyfen).toMatchObject({ view: 'mara', title: 'Preserve the Boundary Mark' });
    expect(goals.fieldNoteOnOldRoad).toMatchObject({ view: 'road', title: 'Find the Dated Reedwatch Field Note' });
    expect(goals.reportFieldNote).toMatchObject({ view: 'mara', title: 'Report the Reedwatch Field Note' });
    expect(goals.compareLedger).toMatchObject({ view: 'brenn', title: 'Compare the Crossing Ledger' });
    expect(goals.returnToOldRoadFromGreyfen).toMatchObject({ view: 'regions', title: 'Find the Earlier Weekly Return', cta: 'Return to Ashmere' });
    expect(goals.searchOldRoadFromAshmere).toMatchObject({ view: 'road', title: 'Find the Earlier Weekly Return', cta: 'Search the Old Road' });
    expect(goals.reportWeeklyReturn).toMatchObject({ view: 'brenn', title: 'Report the Earlier Weekly Return' });
    expect(goals.fileEvidence).toMatchObject({ view: 'mara', title: 'File the Crossing Evidence' });
    expect(goals.reportGauge).toMatchObject({ view: 'mara', title: 'Report the Waterline Gauge' });
    expect(goals.continueAfterGauge).toMatchObject({ view: 'people', title: 'Continue the Crossing Investigation' });
    expect(goals.finalArchive).toMatchObject({ view: 'archive', title: 'Review the Preserved Evidence' });
    expect(goals.defaultGreyfen).toMatchObject({ view: 'crossing', title: 'Recover the Washed Marker' });
  });

  test('the live Greyfen hub sends a traveler to the right region for the next evidence step', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenRouteGuide');
    const result = await page.evaluate(() => {
      const runtime = window.LegendRuntimeV120;
      const player = runtime.loadPlayer();
      if (!player) throw new Error('The traveler should exist after character creation.');
      player.currentRegion = 'Greyfen';
      player.discoveredRegions = ['Ashmere', 'Greyfen'];
      player.flags = player.flags || {};
      player.flags.greyfenLedgerCompared = true;
      player.flags.greyfenDryCrossingComplete = false;
      runtime.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
      return {
        cardTitle: document.querySelector('.ash100-route-strip strong')?.textContent || '',
        buttonLabel: document.querySelector('.ash100-route-strip button')?.textContent || '',
        buttonView: document.querySelector('.ash100-route-strip button')?.getAttribute('data-ash-view') || ''
      };
    });

    expect(result.cardTitle).toBe('Find the Earlier Weekly Return');
    expect(result.buttonLabel).toBe('Return to Ashmere');
    expect(result.buttonView).toBe('regions');
    await page.locator('.ash100-route-strip button').click();
    await expect(page.getByRole('heading', { name: 'Where will the road take you?' })).toBeVisible();
  });

  test('evidence guidance survives reload across regional handoffs', async ({ page }) => {
    test.setTimeout(90000);
    await startFreshCharacter(page, 'GreyfenPersistenceQA');

    const snapshots = await page.evaluate(() => {
      const getGoal = window.LegendAshmereGuidanceV099.getGoal;
      const pick = (region, flags = {}) => {
        const goal = getGoal({ currentRegion: region, inventory: { roadToken: 0 }, flags });
        return { view: goal.view, title: goal.title, cta: goal.cta };
      };
      return {
        greyfenLedger: pick('Greyfen', { greyfenLedgerCompared: true }),
        ashmereroad: pick('Ashmere', { greyfenLedgerCompared: true }),
        reportReturn: pick('Greyfen', { greyfenLedgerCompared: true, greyfenWeeklyReturnFound: true }),
        fileEvidence: pick('Greyfen', { greyfenLedgerCompared: true, greyfenWeeklyReturnFound: true, greyfenWeeklyReturnReported: true }),
        filedArchive: pick('Greyfen', { greyfenLedgerCompared: true, greyfenWeeklyReturnFound: true, greyfenWeeklyReturnReported: true, greyfenEvidenceFiled: true, greyfenCrossingResponseV261: 'provisional-notice', greyfenNoticePressureCreditV261: false })
      };
    });
    expect(snapshots.greyfenLedger).toMatchObject({ view: 'regions', title: 'Find the Earlier Weekly Return', cta: 'Return to Ashmere' });
    expect(snapshots.ashmereroad).toMatchObject({ view: 'road', title: 'Find the Earlier Weekly Return', cta: 'Search the Old Road' });
    expect(snapshots.reportReturn).toMatchObject({ view: 'brenn', title: 'Report the Earlier Weekly Return', cta: 'Speak to Old Brenn' });
    expect(snapshots.fileEvidence).toMatchObject({ view: 'mara', title: 'File the Crossing Evidence', cta: 'Speak to Mara' });
    expect(snapshots.filedArchive).toMatchObject({ view: 'archive', title: 'Review the Preserved Evidence' });

    await page.evaluate(() => {
      const runtime = window.LegendRuntimeV120;
      const player = runtime.loadPlayer();
      player.currentRegion = 'Greyfen';
      player.discoveredRegions = ['Ashmere', 'Greyfen'];
      player.flags = {
        ...(player.flags || {}),
        greyfenLedgerCompared: true,
        greyfenWeeklyReturnFound: true,
        greyfenWeeklyReturnReported: true,
        greyfenEvidenceFiled: true,
        greyfenCrossingResponseV261: 'provisional-notice',
        greyfenNoticePressureCreditV261: false
      };
      runtime.savePlayer(player);
    });
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 30000 });
    await expect.poll(() => page.evaluate(() =>
      typeof window.LegendAshmereGuidanceV099?.getGoal === 'function'
    ), { timeout: 15000 }).toBe(true);
    const persisted = await page.evaluate(() => {
      const runtime = window.LegendRuntimeV120;
      const player = runtime.loadPlayer();
      const goal = window.LegendAshmereGuidanceV099.getGoal(player);
      return {
        region: player.currentRegion,
        title: goal.title,
        view: goal.view,
        ledger: Boolean(player.flags?.greyfenLedgerCompared),
        returnFound: Boolean(player.flags?.greyfenWeeklyReturnFound),
        returnReported: Boolean(player.flags?.greyfenWeeklyReturnReported),
        evidenceFiled: Boolean(player.flags?.greyfenEvidenceFiled)
      };
    });
    expect(persisted).toMatchObject({
      region: 'Greyfen',
      title: 'Review the Preserved Evidence',
      view: 'archive',
      ledger: true,
      returnFound: true,
      returnReported: true,
      evidenceFiled: true
    });
    await page.evaluate(() => window.LegendAshmereV099.renderAshmere());
    await expect(page.locator('.ash100-route-strip strong')).toHaveText('Review the Preserved Evidence');
  });
});
