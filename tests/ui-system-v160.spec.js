const { test, expect } = require('@playwright/test');

async function openTitle(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  // Use the browser's supported accessibility preference so the game itself
  // skips its scene curtain. Never blanket-disable transitions: that can leave
  // a transition overlay visible and contaminate UI screenshots.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.locator('.v120-title-hero .v150-logo-lockup')).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
}

/** Creates a fresh traveler through the live title/opening flow at the requested desktop or mobile viewport. */
async function enterAshmere(page, name = 'UIProofQA', viewport = { width: 1440, height: 900 }) {
  await openTitle(page, viewport);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
  await page.locator('#v094Name').fill(name);
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('button', { name: /Ranger/i })).toBeVisible();
  await page.locator('[data-class="Ranger"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  const creationHitTest = await page.locator('#v094Next').evaluate(el => {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    const shell = document.getElementById('legend-world-shell-root');
    const curtain = document.getElementById('legend-scene-curtain');
    return {
      button: { x, y, display: getComputedStyle(el).display, visibility: getComputedStyle(el).visibility, pointerEvents: getComputedStyle(el).pointerEvents, zIndex: getComputedStyle(el).zIndex },
      hit: hit ? { tag: hit.tagName, id: hit.id, className: String(hit.className || '').slice(0, 160), pointerEvents: getComputedStyle(hit).pointerEvents, zIndex: getComputedStyle(hit).zIndex } : null,
      shell: shell ? { hidden: shell.hidden, display: getComputedStyle(shell).display, visibility: getComputedStyle(shell).visibility } : null,
      curtain: curtain ? { className: curtain.className, pointerEvents: getComputedStyle(curtain).pointerEvents, visibility: getComputedStyle(curtain).visibility } : null
    };
  });
  console.log('[LEGEND creation hit test]', JSON.stringify(creationHitTest));
  await page.locator('#v094Next').click({ timeout: 8000 });
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

async function seedRoad(page, stage = 0, route = null) {
  await page.evaluate(({ stage, route }) => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.inventory = player.inventory || {};
    player.inventory.food = Math.max(2, Number(player.inventory.food || 0));
    player.flags = player.flags || {};
    player.flags.roadExpeditionV100 = {
      ...(player.flags.roadExpeditionV100 || {}),
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

async function attachProof(page, name) {
  await test.info().attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  });
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(metrics.document, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.body, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
}

test.describe('LEGEND shared UI system v160 — phase 1 proof', () => {
  test('title and realm entrance load the shared styles, keep the raster wordmark/actions, and show realm art', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('link[href*="legend-ui-system-v160.css"]')).toHaveCount(1);
    await expect(page.locator('.v120-title-hero .v120-legend-logo')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
    await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /News & Roadmap/i })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi)).toBe(true);
    const freshMenu = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        assetsLoaded: snapshot.nativeTitleUiAssetsLoaded,
        logoPainted: snapshot.nativeTitleUiLogoPainted,
        dividerPainted: snapshot.nativeTitleUiDividerPainted,
        decorationLabels: snapshot.nativeTitleUiDecorationLabels || [],
        decorationTextCount: snapshot.nativeTitleUiDecorationTextCount || 0,
        ids: snapshot.nativeTitleUiControlIds,
        labels: snapshot.nativeTitleUiLabels || []
      };
    });
    expect(freshMenu.assetsLoaded).toBe(true);
    expect(freshMenu.logoPainted).toBe(true);
    expect(freshMenu.dividerPainted).toBe(true);
    expect(freshMenu.decorationTextCount).toBe(7);
    expect(freshMenu.decorationLabels.map(item => item.id)).toEqual([
      'kicker','intro','traveler-label','traveler-name','traveler-detail','menu-heading','divider-caption'
    ]);
    expect(freshMenu.decorationLabels.every(item => item.text)).toBe(true);
    expect(freshMenu.ids).toEqual(['newPrimary','account','settings','dispatches','credits']);

    // If any required title copy disappears, Phaser must reveal the complete
    // accessible DOM title instead of leaving a partially painted blank panel.
    const fallback = await page.evaluate(() => {
      const name = document.querySelector('.v120-traveler-line strong');
      const original = name.textContent;
      name.textContent = '';
      window.LegendPhaserWorldV1.refresh();
      const visibleFallback = {
        active: window.LegendPhaserWorldV1.snapshot().nativeTitleUi,
        logoVisibility: getComputedStyle(document.querySelector('.v150-logo-lockup .v120-legend-logo')).visibility,
        menuTextColor: getComputedStyle(document.querySelector('.v136-menu-btn .v136-menu-copy strong')).color
      };
      name.textContent = original;
      window.LegendPhaserWorldV1.refresh();
      return visibleFallback;
    });
    expect(fallback.active).toBe(false);
    expect(fallback.logoVisibility).toBe('visible');
    expect(fallback.menuTextColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTitleUi
    )).toBe(true);
    expect(freshMenu.labels.map(item => item.title)).toEqual([
      'Begin Your Journey','Profile','Settings','News & Roadmap','Credits'
    ]);
    await expect(page.locator('.v140-realm-overview.v151-realm-art')).toBeVisible();
    await expect(page.locator('.v151-realm-feature img')).toHaveAttribute('src', 'assets/generated/locations/ashmere-town.webp');

    const computed = await page.locator('.v120-title-hero').evaluate(element => ({
      amber: getComputedStyle(document.documentElement).getPropertyValue('--legend-ui-amber').trim(),
      radius: getComputedStyle(element).borderRadius
    }));
    expect(computed.amber).toBe('#e7c982');
    expect(computed.radius).toBe('2px');
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-title-desktop.png');
  });

  test('returning-player save paints every existing title action in Phaser without changing the save', async ({ page }) => {
    await enterAshmere(page, 'ReturnMenuParity');
    const saveBefore = await page.evaluate(() => JSON.stringify(window.LegendRuntimeV120.loadPlayer()));
    await page.evaluate(() => window.LegendGameBootstrap.title());
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('#continue')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi)).toBe(true);

    const menu = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const buttons = Array.from(document.querySelectorAll('.v120-title-hero .v136-menu-btn'));
      return {
        saveKey: window.LEGEND_DATA?.SAVE_KEY,
        assetsLoaded: snapshot.nativeTitleUiAssetsLoaded,
        ids: snapshot.nativeTitleUiControlIds,
        labels: snapshot.nativeTitleUiLabels || [],
        textQuality: snapshot.nativeTitleUiTextQuality || [],
        logoPainted: snapshot.nativeTitleUiLogoPainted,
        dividerPainted: snapshot.nativeTitleUiDividerPainted,
        decorationLabels: snapshot.nativeTitleUiDecorationLabels || [],
        decorationTextCount: snapshot.nativeTitleUiDecorationTextCount || 0,
        buttons: buttons.map(button => ({
          id: button.id,
          tag: button.tagName,
          type: button.type,
          accessibleName: button.getAttribute('aria-label'),
          handler: typeof button.onclick
        }))
      };
    });
    expect(menu.saveKey).toBe('legend-roads-of-ashmere-v09');
    expect(menu.assetsLoaded).toBe(true);
    expect(menu.logoPainted).toBe(true);
    expect(menu.dividerPainted).toBe(true);
    expect(menu.decorationTextCount).toBe(7);
    expect(menu.decorationLabels.map(item => item.id)).toEqual([
      'kicker','intro','traveler-label','traveler-name','traveler-detail','menu-heading','divider-caption'
    ]);
    expect(menu.decorationLabels.find(item => item.id === 'traveler-name')?.text).toBe('ReturnMenuParity');
    expect(menu.ids).toEqual(['continue','new','account','settings','dispatches','credits']);
    expect(menu.labels.map(item => item.title)).toEqual([
      'Continue Journey','New Traveler','Profile','Settings','News & Roadmap','Credits'
    ]);
    expect(menu.labels.every(item => item.title && item.subtitle)).toBe(true);
    expect(menu.buttons).toHaveLength(6);
    expect(menu.buttons.every(button => button.tag === 'BUTTON' && button.type === 'button' &&
      button.accessibleName && button.handler === 'function')).toBe(true);
    expect(menu.textQuality).toHaveLength(6);
    expect(menu.textQuality.every(item => item.titleFontSize >= 13 && item.titleResolution === 2 &&
      item.subtitleFontSize >= 10 && item.subtitleResolution === 2)).toBe(true);
    const saveAfterPaint = await page.evaluate(() => JSON.stringify(window.LegendRuntimeV120.loadPlayer()));
    expect(saveAfterPaint).toBe(saveBefore);

    await page.locator('#settings').focus();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot().nativeTitleUiControlBounds.find(item => item.id === 'settings')?.focused
    )).toBe(true);
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-returning-title-desktop.png');

    // Exercise the original production callbacks behind every remaining menu
    // option. Re-rendering via the production bootstrap does not seed or alter
    // a save; it simply returns to the same title menu between view checks.
    await page.locator('#account').click();
    await expect(page.locator('.account09x')).toBeVisible();
    await page.locator('#backTitle').click();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeTitleUi)).toBe(true);

    await page.locator('#settings').click();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await page.locator('#backTitle').click();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeTitleUi)).toBe(true);

    await page.locator('#dispatches').click();
    await expect(page.getByRole('heading', { name: 'News & Roadmap', exact: true })).toBeVisible();
    await page.locator('#dispatchesBack').click();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeTitleUi)).toBe(true);

    await page.locator('#credits').click();
    await expect(page.getByRole('dialog', { name: 'LEGEND' })).toBeVisible();
    await page.locator('[data-credits-close]').click();
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.locator('#new').click();
    await expect(page.locator('.opening-lore-v220')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'When the World Went to War' })).toBeVisible();

    // Return to the existing title without touching the saved traveler, then
    // exercise Continue through its real production handler.
    await page.evaluate(() => window.LegendGameBootstrap.title());
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeTitleUi)).toBe(true);
    await page.locator('#continue').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendRuntimeV120.loadPlayer()?.username)).toBe('ReturnMenuParity');
  });

  test('returning-player Phaser title stays readable and tappable at 390px mobile width', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce'
    });
    const mobilePage = await context.newPage();
    try {
      await enterAshmere(mobilePage, 'MobileReturnParity', { width: 390, height: 844 });
      await mobilePage.evaluate(() => window.LegendGameBootstrap.title());
      await expect(mobilePage.locator('#continue')).toBeVisible();
      await expect.poll(() => mobilePage.evaluate(() =>
        window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi
      )).toBe(true);
      const layout = await mobilePage.evaluate(() => {
        const snapshot = window.LegendPhaserWorldV1.snapshot();
        const size = snapshot.nativeTitleUiSceneSize;
        return {
          size,
          ids: snapshot.nativeTitleUiControlIds,
          labels: snapshot.nativeTitleUiLabels || [],
          logoPainted: snapshot.nativeTitleUiLogoPainted,
          dividerPainted: snapshot.nativeTitleUiDividerPainted,
          decorationTextCount: snapshot.nativeTitleUiDecorationTextCount || 0,
          bounds: snapshot.nativeTitleUiControlBounds || []
        };
      });
      expect(layout.ids).toEqual(['continue','new','account','settings','dispatches','credits']);
      expect(layout.labels.every(item => item.title && item.subtitle)).toBe(true);
      expect(layout.logoPainted).toBe(true);
      expect(layout.dividerPainted).toBe(true);
      expect(layout.decorationTextCount).toBe(7);
      expect(layout.bounds).toHaveLength(6);
      expect(layout.bounds.every(item => item.x >= 0 && item.width > 0 && item.x + item.width <= layout.size.width + 1)).toBe(true);
      await expectNoHorizontalOverflow(mobilePage);
      await attachProof(mobilePage, 'phase1-returning-title-mobile-390.png');

      await mobilePage.locator('#settings').tap();
      await expect(mobilePage.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
      await mobilePage.locator('#backTitle').tap();
      await expect(mobilePage.locator('#continue')).toBeVisible();
      await expect.poll(() => mobilePage.evaluate(() =>
        window.LegendPhaserWorldV1.snapshot().nativeTitleUi
      )).toBe(true);
    } finally {
      await context.close();
    }
  });

  test('Ashmere hub and Work Board service share the new frame while retaining current destinations/actions', async ({ page }) => {
    await enterAshmere(page, 'TownUIPreview');
    await expect(page.locator('.ash100-hero > img')).toHaveAttribute('src', 'assets/generated/locations/ashmere-town.webp');
    await expect(page.getByRole('navigation', { name: 'Ashmere terminal navigation' })).toBeVisible();
    await expect(page.locator('.ash100-route-strip')).toBeVisible();
    await expect(page.locator('.ash100-status-health')).toBeVisible();
    await expect(page.locator('.ash100-destination[data-ash-view="work"]')).toBeVisible();
    const radius = await page.locator('.ash100-destination').first().evaluate(el => getComputedStyle(el).borderRadius);
    expect(radius).toBe('2px');
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-ashmere-hub-desktop.png');

    await page.locator('.ash100-destination[data-ash-view="work"]').click();
    await expect(page.locator('.ash099-screen')).toBeVisible();
    await expect(page.locator('#openDailyFieldBoard')).toBeVisible();
    await attachProof(page, 'phase1-work-board-service.png');
    await page.locator('#openDailyFieldBoard').click();
    await expect(page.locator('.ash099-daily-board')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });


  test('Old Road route, detour and camp actions stay readable and functional in DOM fallback', async ({ page }) => {
    await enterAshmere(page, 'RoadActionsQA');
    await seedRoad(page, 0, null);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeExpeditionActionsUi)).toBe(false);

    const fork = await page.evaluate(() => {
      const panel = document.querySelector('.exp150-interactions .exp100-route-choice');
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        active: snapshot.nativeExpeditionActionsUi,
        objectCount: snapshot.nativeExpeditionActionsUiObjectCount,
        actionLayerClass: document.body.classList.contains('legend-phaser-road-actions-ui-active'),
        headingColor: panel?.querySelector('h2') ? getComputedStyle(panel.querySelector('h2')).color : '',
        actionColor: panel?.querySelector('#routeRidge') ? getComputedStyle(panel.querySelector('#routeRidge')).color : '',
        routeButtons: Array.from(panel?.querySelectorAll('button') || []).map(button => ({
          id: button.id, disabled: button.disabled, text: button.textContent.replace(/\s+/g,' ').trim()
        }))
      };
    });
    expect(fork.active).toBe(false);
    expect(fork.objectCount).toBe(0);
    expect(fork.actionLayerClass).toBe(false);
    expect(fork.headingColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(fork.actionColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(fork.routeButtons.every(button => !button.disabled)).toBe(true);

    await page.locator('#routeRidge').click();
    await expect.poll(() => page.evaluate(() =>
      window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100.routeChoice
    )).toBe('ridge');

    await seedRoad(page, 1, 'ridge');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeExpeditionActionsUi)).toBe(false);
    await expect(page.locator('.exp150-interactions .exp160-optional-detour')).toBeVisible();
    await expect(page.locator('#exp160VisitOptional')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
    await page.locator('#exp160VisitOptional').click();
    await expect(page.locator('.exp160-optional-site')).toBeVisible();
    await expect(page.locator('.exp160-optional-site h2')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() =>
      window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100.activeSideTripV160
    )).toBe('windbreak');

    await seedRoad(page, 2, 'ridge');
    await expect(page.locator('.exp100-camp')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeExpeditionActionsUi)).toBe(false);
    await expect(page.locator('.exp100-camp')).toContainText(/WAYSTATION · NIGHT WATCH/);
    await expect(page.locator('.exp100-camp')).toContainText(/Rest by the Fire/);
    await expect(page.locator('.exp100-camp')).toContainText(/Craft a Road Poultice/);
    await expect(page.locator('.exp100-camp')).toContainText(/Keep Watch/);
    await expect(page.locator('#campRest')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
    const beforeDay = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().day);
    await page.locator('#campRest').click();
    await expect.poll(() => page.evaluate(() => window.LegendRuntimeV120.loadPlayer().day)).toBe(beforeDay + 1);
    await expect(page.locator('#campRest')).toBeDisabled();
    await expectNoHorizontalOverflow(page);
  });

  test('Old Road scene, HUD and field map keep sharp DOM copy and real controls', async ({ page }) => {
    // This fixture performs the complete first-time creation and opening flow
    // before it reaches Ashmere; give that end-to-end journey its full budget.
    test.setTimeout(90000);
    await enterAshmere(page, 'RoadUIPreview');
    await seedRoad(page, 0, null);
    await expect(page.locator('.exp100-scene-live')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeGameplayUiSurface)).toBe('expedition');
    const roadDom = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const mapButton = document.querySelector('#exp150OpenMap');
      const style = mapButton ? getComputedStyle(mapButton) : null;
      return {
        painterActive: snapshot.nativeGameplayUi,
        painterClass: document.body.classList.contains('legend-phaser-gameplay-ui-active'),
        nativeHudActive: snapshot.nativeExpeditionHudUi,
        nativeHudText: snapshot.nativeExpeditionHudUiTextValues || [],
        nativeHudControlIds: snapshot.nativeExpeditionHudUiControlIds || [],
        expeditionHudClass: document.body.classList.contains('legend-phaser-expedition-hud-ui-active'),
        mapPainter: snapshot.nativeRoadMapUi,
        mapControl: Boolean(mapButton && !mapButton.disabled),
        mapText: mapButton?.textContent?.trim() || '',
        mapColor: style?.color || '',
        mapIconColor: mapButton?.querySelector('span') ? getComputedStyle(mapButton.querySelector('span')).color : '',
        mapVisibility: style?.visibility || ''
      };
    });
    expect(roadDom.painterActive).toBe(false);
    expect(roadDom.painterClass).toBe(false);
    expect(roadDom.nativeHudActive).toBe(false);
    expect(roadDom.nativeHudText).toEqual([]);
    expect(roadDom.nativeHudControlIds).toEqual([]);
    expect(roadDom.expeditionHudClass).toBe(false);
    expect(roadDom.mapPainter).toBe(false);
    expect(roadDom.mapControl).toBe(true);
    expect(roadDom.mapText.length).toBeGreaterThan(0);
    expect(roadDom.mapColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(roadDom.mapIconColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(roadDom.mapVisibility).toBe('visible');
    await expect(page.locator('.exp150-expedition-head')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeExpeditionHudUi)).toBe(false);
    await expect(page.locator('.exp150-title-group h1')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
    await expect(page.locator('.exp150-vitals')).toBeVisible();
    await expect(page.locator('#exp150OpenMap')).toBeEnabled();
    await expect(page.locator('#exp150OpenJournal')).toBeEnabled();
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-old-road-desktop.png');

    await page.locator('#exp150OpenMap').click();
    await expect(page.locator('#exp150Modal')).toBeVisible();
    await expect(page.locator('#exp150Modal').getByRole('dialog')).toBeVisible();
    await expect(page.locator('#exp150Modal')).toContainText(/map|road/i);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRoadMapUi)).toBe(true);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRoadMapUiKind)).toBe('map');
    await expect(page.locator('#exp150Modal .exp150-map-intro h2')).toHaveCSS('color','rgba(0, 0, 0, 0)');
    await attachProof(page, 'phase1-old-road-map.png');
  });
  test('combat HUD and eight live controls are painted in Phaser without replacing combat rules', async ({ page }) => {
    await enterAshmere(page, 'PhaserCombatQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const player = rt.loadPlayer();
      player.hp = 40;
      player.maxHp = 100;
      player.inventory = player.inventory || {};
      player.inventory.potion = 1;
      player.flags = player.flags || {};
      player.flags.roadExpeditionV100 = {
        ...(player.flags.roadExpeditionV100 || {}),
        stage: 0, pressure: 53, trips: 0, events: 0, finds: 0, battles: 0,
        routeChoice: null, poiUsed: {}, searchUsed: {}, readUsed: {}
      };
      const road = window.LegendRoadsV100.oldRoad;
      road.enemies = road.enemies
        .filter(enemy => enemy.id === 'goblin')
        .map(enemy => ({ ...enemy, damage: [3, 3] }));
      rt.savePlayer(player);
    });

    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' })
      .getByRole('button', { name: /Routes/i }).click();
    await page.locator('.ash100-destination[data-ash-view="road"]').click();
    await expect(page.locator('.ash100-departure')).toBeVisible();
    await page.locator('#departureBegin').click();
    await expect(page.locator('.exp150-world-page')).toBeVisible();
    await expect(page.locator('#push')).toBeEnabled();
    await page.locator('#push').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();

    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1?.snapshot?.()?.nativeCombatUi
    )).toBe(true);

    // Deliberately remove one required action and force a repaint. Phaser must
    // reveal the real battle UI rather than leave its duplicate labels hidden.
    const fallbackProof = await page.evaluate(() => {
      const heavy = document.getElementById('heavy');
      const parent = heavy?.parentNode;
      const next = heavy?.nextSibling;
      if (!heavy || !parent) throw new Error('Heavy Strike action missing before fallback proof');
      heavy.remove();
      window.LegendPhaserWorldV1.refreshCombat();
      const fallback = {
        native: window.LegendPhaserWorldV1.snapshot().nativeCombatUi,
        commandColor: getComputedStyle(document.querySelector('#strike')).color,
        dialogueColor: getComputedStyle(document.querySelector('.rpg-dialogue p')).color
      };
      parent.insertBefore(heavy, next);
      window.LegendPhaserWorldV1.refreshCombat();
      return fallback;
    });
    expect(fallbackProof.native).toBe(false);
    expect(fallbackProof.commandColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(fallbackProof.dialogueColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeCombatUi
    )).toBe(true);

    const desktop = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const controls = ['battleSound','strike','skill','item','guard','heavy','poultice','flee'];
      return {
        native: snapshot.nativeCombatUi,
        textCount: snapshot.nativeCombatUiTextCount,
        text: snapshot.nativeCombatUiTextValues || [],
        ids: snapshot.nativeCombatUiControlIds || [],
        scene: snapshot.nativeCombatUiSceneSize,
        observerBound: snapshot.nativeCombatUiObserverBound,
        controls: controls.map(id => {
          const node = document.getElementById(id);
          return {
            id,
            exists: Boolean(node),
            disabled: Boolean(node?.disabled),
            ariaLabel: node?.getAttribute('aria-label') || '',
            handler: typeof node?.onclick
          };
        }),
        sourceTextStillAccessible: document.querySelector('#strike')?.textContent.includes('FIGHT') &&
          document.querySelector('.rpg-dialogue')?.textContent.length > 0,
        domPaintMasked: getComputedStyle(document.querySelector('#strike')).color === 'rgba(0, 0, 0, 0)' &&
          getComputedStyle(document.querySelector('.rpg-dialogue p')).color === 'rgba(0, 0, 0, 0)'
      };
    });
    expect(desktop.native).toBe(true);
    expect(desktop.observerBound).toBe(true);
    expect(desktop.textCount).toBeGreaterThan(22);
    expect(desktop.text).toEqual(expect.arrayContaining([
      'YOUR STANCE', 'GUARD BREAK', 'YOUR TURN', 'FIGHT', 'ACT', 'Healing potion'
    ]));
    expect(desktop.ids).toEqual(['battleSound','strike','skill','item','guard','heavy','poultice','flee']);
    expect(desktop.controls.every(item => item.exists && item.ariaLabel && item.handler === 'function')).toBe(true);
    expect(desktop.sourceTextStillAccessible).toBe(true);
    expect(desktop.domPaintMasked).toBe(true);
    await expect(page.locator('.rpg-hero-stage-art img')).toBeVisible();
    await expect(page.locator('.rpg-foe-art')).toBeVisible();

    const beforePotion = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return { hp: player.hp, potion: player.inventory.potion };
    });
    expect(beforePotion).toEqual({ hp: 40, potion: 1 });
    await page.locator('#item').click();
    await expect(page.locator('.rpg-dialogue')).toContainText(/drink a Healing Potion/i);
    await expect(page.locator('.rpg-battle-topline strong')).toContainText('TURN 2');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1?.snapshot?.()?.nativeCombatUi
    )).toBe(true);
    const afterPotion = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return { hp: player.hp, potion: player.inventory.potion };
    });
    expect(afterPotion.potion).toBe(0);
    expect(afterPotion.hp).toBeGreaterThan(40);
    expect(afterPotion.hp).toBeLessThan(70);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return snapshot?.nativeCombatUi && snapshot.nativeCombatUiTextCount >= 22;
    })).toBe(true);
    await expectNoHorizontalOverflow(page);
    await expect(page.locator('#guard')).toBeEnabled();
    await page.locator('#guard').focus();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeCombatUiFocusedControlIds || []
    )).toContain('guard');
    const combatFocusStyle = await page.locator('#guard').evaluate(node => ({
      outlineColor: getComputedStyle(node).outlineColor,
      outlineStyle: getComputedStyle(node).outlineStyle
    }));
    expect(combatFocusStyle).toEqual({ outlineColor: 'rgb(255, 230, 160)', outlineStyle: 'solid' });
    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-heavy/);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeCombatUi)).toBe(true);
    await expectNoHorizontalOverflow(page);
  });

  test('title, town and expedition stay within a 390px touch viewport', async ({ page }) => {
    await openTitle(page, { width: 390, height: 844 });
    await expect(page.locator('.v140-realm-overview.v151-realm-art')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-title-mobile-390.png');

    await enterAshmere(page, 'MobileUIPreview');
    await expect(page.getByRole('navigation', { name: 'Ashmere terminal navigation' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-ashmere-mobile-390.png');

    await seedRoad(page, 0, null);
    await expect(page.locator('#exp150OpenMap')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeGameplayUiSurface)).toBe('expedition');
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-old-road-mobile-390.png');
  });

  test('saved Reduced Motion preference suppresses new decorative transitions', async ({ page }) => {
    await openTitle(page);
    await page.evaluate(() => document.body.classList.add('a11y-reduced-motion'));

    const realmMotion = await page.locator('.v151-realm-feature > img').evaluate(el => {
      const style = getComputedStyle(el);
      return { transition: style.transitionProperty, animation: style.animationName, transform: style.transform };
    });
    expect(realmMotion.transition).toBe('none');
    expect(realmMotion.animation).toBe('none');
    expect(realmMotion.transform).toBe('none');

    await enterAshmere(page, 'MotionUIPreview');
    await page.evaluate(() => document.body.classList.add('a11y-reduced-motion'));
    const destination = page.locator('.ash100-destination').first();
    await destination.hover();
    const cardMotion = await destination.evaluate(el => {
      const style = getComputedStyle(el);
      return { transition: style.transitionProperty, transform: style.transform };
    });
    expect(cardMotion.transition).toBe('none');
    expect(cardMotion.transform).toBe('none');
  });

});
