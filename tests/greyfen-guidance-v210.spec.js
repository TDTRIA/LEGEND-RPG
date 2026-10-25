const { test, expect } = require('@playwright/test');

async function openGame(page) {
  await page.goto('/');
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
}

test.describe('Greyfen story guidance v0.24.1', () => {
  test('the Current Route guidance follows saved evidence handoffs before generic town contracts', async ({ page }) => {
    await openGame(page);
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
        finalArchive: pick('Greyfen', {
          greyfenEvidenceFiled: true,
          greyfenWeeklyReturnFound: true,
          greyfenWeeklyReturnReported: true,
          greyfenWaterlineGaugeRead: true,
          greyfenWaterlineGaugeReported: true
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
    expect(goals.finalArchive).toMatchObject({ view: 'archive', title: 'Review the Preserved Evidence' });
    expect(goals.defaultGreyfen).toMatchObject({ view: 'crossing', title: 'Recover the Washed Marker' });
  });

  test('the live Greyfen hub sends a traveler to the right region for the next evidence step', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const runtime = window.LegendRuntimeV120;
      const player = runtime.loadPlayer();
      if (!player) throw new Error('Expected the title flow to create a default traveler for this browser context.');
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
});
