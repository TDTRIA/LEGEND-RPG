const { test, expect } = require('@playwright/test');

async function openTitle(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready');
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  await page.waitForFunction(() =>
    window.__legendPhaserWorldReady === true &&
    Boolean(window.LegendPhaserWorldV1?.engine?.scene?.getScene('RealmScene')),
    null,
    { timeout: 20000 }
  );
  await expect(page.locator('.v120-title')).toBeVisible({ timeout: 10000 });
}

async function seedExpedition(page) {
  await page.evaluate(name => {
    const choices = window.LegendPlayerCreationOptionsV094;
    const player = window.LegendPlayerRecordV094.create({
      data: window.LEGEND_DATA,
      name,
      gender: choices.gender('unspoken'),
      personality: choices.personality('kind'),
      originId: 'Lost Squire',
      classId: 'Ranger',
      keepsakeId: 'Old Map',
      baseSkills: window.LegendStorage.baseSkills,
      normalize: window.LegendStorage.normalize
    });
    if (!player) throw new Error('Could not create the road-map test traveler.');
    player.flags = player.flags || {};
    player.flags.introV094Complete = true;
    player.flags.openingRoadV140 = { phase: 'complete', completed: true, awakened: true };
    player.flags.roadExpeditionV100 = {
      stage: 0,
      pressure: 14,
      trips: 1,
      events: 0,
      finds: 1,
      battles: 0,
      routeChoice: null,
      currentNodeIdV160: 'south-fork',
      visitedNodeIdsV160: ['south-fork'],
      discoveredNodeIdsV160: ['south-fork'],
      poiUsed: {},
      searchUsed: {},
      readUsed: {},
      campWatchUsed: {},
      roadClockHour: 15
    };
    player.flags.roadFieldJournalV150 = {
      visitedPlaces: ['South Fork', 'Wayfarer’s Camp'],
      discoveries: [{
        key: 'lantern-scratch-marks',
        name: 'Soot-stained Lantern Marks',
        kind: 'Clue',
        place: 'South Fork',
        note: 'A line of old soot marks points toward the higher ground.',
        route: 'ridge',
        day: 1,
        trip: 1
      }],
      routes: [{
        place: 'South Fork',
        title: 'Kept to the old fork',
        note: 'You recorded both possible routes before choosing a path.',
        route: 'unrecorded'
      }],
      campReports: [{
        kind: 'rest',
        place: 'Wayfarer’s Camp',
        routeName: 'High Ridge',
        day: 1,
        pressureBefore: 24,
        pressureAfter: 14,
        note: 'You rested with one eye on the dark between the trees.'
      }]
    };
    if (!window.LegendStorage.saveNewPlayer(player)) {
      throw new Error('Could not persist the road-map test traveler.');
    }
    window.LegendRoadControllerV100.renderExpedition();
  }, 'RoadMapPainterQA');
  await expect(page.locator('.exp150-world-page')).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    window.LegendPhaserWorldV1.snapshot()?.surface
  )).toBe('expedition');
}

async function openAndVerifyPainter(page, kind) {
  const button = kind === 'map' ? '#exp150OpenMap' : '#exp150OpenJournal';
  await expect(page.locator(button)).toBeEnabled();
  await page.locator(button).click();
  await expect(page.locator('#exp150Modal')).toBeVisible();
  await expect(page.locator('#exp150Modal').getByRole('dialog')).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const snapshot = window.LegendPhaserWorldV1?.snapshot?.();
    return snapshot?.nativeRoadMapUi && snapshot.nativeRoadMapUiKind;
  }), { timeout: 10000 }).toBe(kind);
  const proof = await page.evaluate(() => {
    const snapshot = window.LegendPhaserWorldV1.snapshot();
    const dialog = document.querySelector('#exp150Modal .exp150-modal-dialog');
    const text = document.querySelector('#exp150Modal .exp150-map-intro h2');
    const close = document.getElementById('exp150ModalClose');
    return {
      active: snapshot.nativeRoadMapUi,
      kind: snapshot.nativeRoadMapUiKind,
      textCount: snapshot.nativeRoadMapUiTextCount,
      text: snapshot.nativeRoadMapUiTextValues || [],
      controls: snapshot.nativeRoadMapUiControlIds || [],
      maskMode: snapshot.nativeRoadMapUiMaskMode,
      maskBounds: snapshot.nativeRoadMapUiMaskBounds,
      scrollHeight: dialog?.scrollHeight || 0,
      clientHeight: dialog?.clientHeight || 0,
      introColor: text ? getComputedStyle(text).color : '',
      closeColor: close ? getComputedStyle(close).color : '',
      closeEnabled: Boolean(close && !close.disabled),
      dialogOverflowY: dialog ? getComputedStyle(dialog).overflowY : ''
    };
  });
  expect(proof.active).toBe(true);
  expect(proof.kind).toBe(kind);
  expect(proof.textCount).toBeGreaterThan(8);
  expect(proof.controls).toContain('exp150ModalClose');
  expect(proof.maskMode).toMatch(/^(webgl-filter|canvas-geometry)$/);
  expect(proof.maskBounds.width).toBeGreaterThan(0);
  expect(proof.maskBounds.height).toBeGreaterThan(0);
  expect(proof.introColor).toBe('rgba(0, 0, 0, 0)');
  expect(proof.closeColor).toBe('rgba(0, 0, 0, 0)');
  expect(proof.closeEnabled).toBe(true);
  return proof;
}

test('Phaser Old Road map and field journal paint complete content while preserving DOM actions and saved state', async ({ page }) => {
  test.setTimeout(90000);
  await openTitle(page);
  await seedExpedition(page);

  const before = await page.evaluate(() => {
    const player = window.LegendStorage.loadPlayer();
    return {
      stage: player.flags.roadExpeditionV100.stage,
      route: player.flags.roadExpeditionV100.routeChoice,
      gold: player.gold,
      food: player.inventory.food,
      discoveries: player.flags.roadFieldJournalV150.discoveries.length,
      campReports: player.flags.roadFieldJournalV150.campReports.length
    };
  });

  const map = await openAndVerifyPainter(page, 'map');
  expect(map.text).toEqual(expect.arrayContaining([
    'FIELD MAP · OLD ROAD',
    'The road you know',
    'Choose High Ridge',
    'Choose Reed Cut',
    'Return to the road'
  ]));
  expect(map.controls).toEqual(expect.arrayContaining([
    'route:ridge', 'route:reeds', 'exp150ModalClose'
  ]));
  const mapDialog = page.locator('#exp150Modal .exp150-modal-dialog');
  const mapScroll = await mapDialog.evaluate(node => {
    node.scrollTop = node.scrollHeight;
    return { top: node.scrollTop, height: node.scrollHeight, client: node.clientHeight };
  });
  if (mapScroll.height > mapScroll.client) {
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadMapUiScrollTop || 0
    )).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadMapUi
    )).toBe(true);
  }
  await expect(page.locator('[data-exp160-map-route="ridge"]')).toBeEnabled();
  await page.locator('[data-exp160-map-route="ridge"]').click();
  await expect(page.locator('#exp150Modal')).toBeHidden();
  await expect(page.locator('.exp150-world-page')).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    window.LegendStorage.loadPlayer().flags.roadExpeditionV100.routeChoice
  )).toBe('ridge');
  await expect.poll(() => page.evaluate(() =>
    window.LegendPhaserWorldV1.snapshot()?.nativeRoadMapUi
  )).toBe(false);

  const journal = await openAndVerifyPainter(page, 'journal');
  expect(journal.text).toEqual(expect.arrayContaining([
    'TRAVELER’S FIELD JOURNAL',
    'What the road remembers',
    'Soot-stained Lantern Marks',
    'Kept to the old fork',
    'Rest by the fire'
  ]));
  await expect(page.locator('#exp150ModalClose')).toBeEnabled();
  await page.locator('#exp150ModalClose').focus();
  await expect(page.locator('#exp150ModalClose')).toBeFocused();
  const focusStyle = await page.locator('#exp150ModalClose').evaluate(node => ({
    outlineColor: getComputedStyle(node).outlineColor,
    outlineStyle: getComputedStyle(node).outlineStyle
  }));
  expect(focusStyle).toEqual({
    outlineColor: 'rgb(255, 230, 160)',
    outlineStyle: 'solid'
  });
  await page.keyboard.press('Enter');
  await expect(page.locator('#exp150Modal')).toBeHidden();

  const after = await page.evaluate(() => {
    const player = window.LegendStorage.loadPlayer();
    return {
      stage: player.flags.roadExpeditionV100.stage,
      route: player.flags.roadExpeditionV100.routeChoice,
      gold: player.gold,
      food: player.inventory.food,
      discoveries: player.flags.roadFieldJournalV150.discoveries.length,
      campReports: player.flags.roadFieldJournalV150.campReports.length
    };
  });
  expect(after).toEqual({ ...before, route: 'ridge' });
  await expect.poll(() => page.evaluate(() =>
    window.LegendPhaserWorldV1.snapshot()?.nativeRoadMapUi
  )).toBe(false);
  await expectNoHorizontalOverflow(page);
});

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(metrics.document, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.body, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
}

test('Phaser road journal modal remains readable and contained on a 390px viewport', async ({ page }) => {
  test.setTimeout(90000);
  await openTitle(page);
  await seedExpedition(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const proof = await openAndVerifyPainter(page, 'journal');
  expect(proof.maskBounds.x).toBeGreaterThanOrEqual(0);
  expect(proof.maskBounds.x + proof.maskBounds.width).toBeLessThanOrEqual(390);
  expect(proof.maskBounds.y).toBeGreaterThanOrEqual(0);
  expect(proof.maskBounds.y + proof.maskBounds.height).toBeLessThanOrEqual(844);
  await expectNoHorizontalOverflow(page);
  await page.locator('#exp150ModalClose').click();
  await expect(page.locator('#exp150Modal')).toBeHidden();
});
