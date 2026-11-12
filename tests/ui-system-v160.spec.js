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
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  await page.waitForFunction(() =>
    window.__legendPhaserWorldReady === true,
    null,
    { timeout: 20000 }
  );

  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.locator('.v120-title-hero .v150-logo-lockup')).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
}

async function clickCreationTarget(page, selector, first = false) {
  const candidates = page.locator(selector);
  const target = first ? candidates.first() : candidates;
  await expect(target).toBeVisible();
  await target.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await page.waitForTimeout(180);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(180);
  const point = await target.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    const style = getComputedStyle(el);
    return {
      x, y, width: rect.width, height: rect.height,
      top: rect.top, bottom: rect.bottom,
      transform: style.transform, transition: style.transition,
      animation: style.animationName,
      hit: hit ? { tag: hit.tagName, id: hit.id, className: String(hit.className || '').slice(0, 80) } : null,
      matches: Boolean(hit && (hit === el || el.contains(hit))),
      scrollY: window.scrollY
    };
  });
  console.log('[LEGEND UI creation pointer check]', selector, JSON.stringify(point));
  expect(point.matches, selector + ' must be the real pointer target').toBe(true);
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(80);
}

/** Creates a fresh traveler through the live title/opening flow at the requested desktop or mobile viewport. */
async function enterAshmere(page, name = 'UIProofQA', viewport = { width: 1440, height: 900 }, afterTitleReady = null) {
  await openTitle(page, viewport);
  if (typeof afterTitleReady === 'function') await afterTitleReady(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
  await page.locator('#v094Name').fill(name);
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-gender="unspoken"]');
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-personality="kind"]');
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-origin]', true);
  await clickCreationTarget(page, '#v094Next');
  await expect(page.getByRole('button', { name: /Ranger/i })).toBeVisible();
  await clickCreationTarget(page, '[data-class="Ranger"]');
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-keepsake="Old Map"]');
  await clickCreationTarget(page, '#v094Next');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await clickCreationTarget(page, '#v094Next');
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

async function seedRoad(page, stage = 0, route = null, sideTrip = null) {
  await page.evaluate(({ stage, route, sideTrip }) => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.inventory = player.inventory || {};
    player.inventory.food = Math.max(2, Number(player.inventory.food || 0));
    player.flags = player.flags || {};
    player.flags.roadExpeditionV100 = {
      ...(player.flags.roadExpeditionV100 || {}),
      stage, pressure: 12, trips: 1, events: 0, finds: 0, battles: 0,
      routeChoice: route,
      activeSideTripV160: sideTrip,
      poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, roadClockHour: 15
    };
    player.flags.roadFieldJournalV150 = { visitedPlaces: [], discoveries: [], routes: [], campReports: [] };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderExpedition();
  }, { stage, route, sideTrip });
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
  test('Phaser screen art handoff keeps the DOM image visible when its source does not match', async ({ page }) => {
    await openTitle(page);
    await expect.poll(() => page.evaluate(() => {
      const image = document.querySelector('.v120-title-backdrop');
      return image?.dataset.legendPhaserSceneArtActive === 'true';
    })).toBe(true);

    const fallback = await page.evaluate(() => {
      const image = document.querySelector('.v120-title-backdrop');
      const original = image.getAttribute('src');
      image.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
      const states = window.LegendPhaserWorldV1.refreshScreenArt();
      const style = getComputedStyle(image);
      const result = {
        state: states.find(item => item.selector === '.v120-title-backdrop'),
        marker: image.dataset.legendPhaserSceneArtActive || '',
        opacity: style.opacity,
        visibility: style.visibility
      };
      image.setAttribute('src', original);
      window.LegendPhaserWorldV1.refreshScreenArt();
      return result;
    });
    expect(fallback.state.sourceMatches).toBe(false);
    expect(fallback.state.active).toBe(false);
    expect(fallback.marker).toBe('');
    expect(fallback.opacity).toBe('1');
    expect(fallback.visibility).toBe('visible');
    await expect.poll(() => page.locator('.v120-title-backdrop').evaluate(image =>
      image.dataset.legendPhaserSceneArtActive === 'true'
    )).toBe(true);
  });

  test('title and realm entrance keep a complete native painter or readable DOM fallback, and show realm art', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('link[href*="legend-ui-system-v160.css"]')).toHaveCount(1);
    await expect(page.locator('.v120-title-hero .v120-legend-logo')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
    await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /News & Roadmap/i })).toBeVisible();
    await expect.poll(() => page.evaluate(() =>
      Boolean(window.LegendPhaserWorldV1?.snapshot?.())
    )).toBe(true);

    const rendererStartup = await page.evaluate(() => {
      const container = document.getElementById('game-container');
      const canvas = container?.querySelector('canvas');
      const wasFallback = container?.classList.contains('legend-phaser-startup-fallback');
      container?.classList.add('legend-phaser-startup-fallback');
      const fallbackDisplay = container ? getComputedStyle(container).display : '';
      container?.classList.toggle('legend-phaser-startup-fallback', Boolean(wasFallback));
      return {
        ready: window.__legendPhaserWorldReady === true,
        canvasPresent: Boolean(canvas),
        canvasVisible: Boolean(canvas && getComputedStyle(canvas).display !== 'none'),
        fallbackClassWasSet: Boolean(wasFallback),
        fallbackDisplay
      };
    });
    expect(rendererStartup.ready).toBe(true);
    expect(rendererStartup.canvasPresent).toBe(true);
    expect(rendererStartup.canvasVisible).toBe(true);
    expect(rendererStartup.fallbackClassWasSet).toBe(false);
    expect(rendererStartup.fallbackDisplay).toBe('none');

    const freshMenu = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        active: Boolean(snapshot.nativeTitleUi),
        assetsLoaded: snapshot.nativeTitleUiAssetsLoaded,
        logoPainted: snapshot.nativeTitleUiLogoPainted,
        dividerPainted: snapshot.nativeTitleUiDividerPainted,
        decorationLabels: snapshot.nativeTitleUiDecorationLabels || [],
        decorationTextCount: snapshot.nativeTitleUiDecorationTextCount || 0,
        ids: snapshot.nativeTitleUiControlIds || [],
        labels: snapshot.nativeTitleUiLabels || [],
        bodyClass: document.body.classList.contains('legend-phaser-title-ui-active'),
        logoVisibility: getComputedStyle(document.querySelector('.v150-logo-lockup .v120-legend-logo')).visibility,
        buttonLabels: Array.from(document.querySelectorAll('.v136-menu-btn')).map(button => ({
          text: button.textContent.replace(/\s+/g, ' ').trim(),
          color: getComputedStyle(button.querySelector('.v136-menu-copy strong') || button).color,
          visibility: getComputedStyle(button).visibility
        }))
      };
    });

    if (freshMenu.active) {
      expect(freshMenu.assetsLoaded).toBe(true);
      expect(freshMenu.logoPainted).toBe(true);
      expect(freshMenu.dividerPainted).toBe(true);
      expect(freshMenu.decorationTextCount).toBe(7);
      expect(freshMenu.decorationLabels.map(item => item.id)).toEqual([
        'kicker','intro','traveler-label','traveler-name','traveler-detail','menu-heading','divider-caption'
      ]);
      expect(freshMenu.decorationLabels.every(item => item.text)).toBe(true);
      expect(freshMenu.ids).toEqual(['newPrimary','account','settings','dispatches','credits']);
    } else {
      // Missing/unfinished Phaser texture preflight must leave all original
      // title text and buttons visible rather than half-hiding the menu.
      expect(freshMenu.bodyClass).toBe(false);
      expect(freshMenu.logoVisibility).toBe('visible');
      expect(freshMenu.buttonLabels).toHaveLength(5);
      expect(freshMenu.buttonLabels.every(item =>
        item.text.length > 0 && item.visibility === 'visible' && item.color !== 'rgba(0, 0, 0, 0)'
      )).toBe(true);
    }

    // Deliberately make one required copy fragment unavailable. The native
    // painter must back off, and the semantic DOM must remain fully readable.
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
    if (freshMenu.active) expect(fallback.active).toBe(false);
    expect(fallback.logoVisibility).toBe('visible');
    expect(fallback.menuTextColor).not.toBe('rgba(0, 0, 0, 0)');
    if (freshMenu.active) {
      await expect.poll(() => page.evaluate(() =>
        window.LegendPhaserWorldV1.snapshot()?.nativeTitleUi
      )).toBe(true);
    }
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
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRoadMapUi)).toBe(false);
    await expect(page.locator('#exp150Modal .exp150-map-intro h2')).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
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

  test('a missing Phaser road texture keeps the authored DOM scene image visible', async ({ page }) => {
    test.setTimeout(60_000);
    let blockedPhaserTextureRequests = 0;
    let allowDomImageRequest = false;
    await page.route('**/assets/generated/locations/old-road-south-fork.webp', async route => {
      if (!allowDomImageRequest) {
        blockedPhaserTextureRequests += 1;
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    // The world-art loader error proves that Phaser requested and failed the
    // exact road texture. Only after that failure do we release the URL so the
    // later DOM scene image can load from its unchanged source.
    await enterAshmere(page, 'RoadTextureFallbackQA', undefined, async () => {
      await page.waitForFunction(() =>
        window.LegendPhaserWorldV1?.snapshot?.()?.worldArtLoadErrors
          ?.some(error => error.key === 'road' &&
            error.source.includes('old-road-south-fork.webp')),
        null,
        { timeout: 15000 }
      );
      allowDomImageRequest = true;
    });
    expect(blockedPhaserTextureRequests).toBeGreaterThan(0);
    await seedRoad(page, 0, null);
    await expect.poll(() => page.evaluate(() => {
      const image = document.querySelector('.exp100-scene-live > img');
      return Boolean(image?.complete && image.naturalWidth > 0);
    })).toBe(true);

    const fallback = await page.evaluate(() => {
      const image = document.querySelector('.exp100-scene-live > img');
      const style = getComputedStyle(image);
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        textureLoaded: Boolean(snapshot.worldArtTextureStatus.find(item => item.key === 'road')?.loaded),
        textureError: snapshot.worldArtLoadErrors.find(item => item.key === 'road') || null,
        expectedSource: snapshot.nativeRoadSceneArt?.expectedSource,
        actualSource: image?.getAttribute('src') || '',
        opacity: style.opacity,
        visibility: style.visibility,
        activeClass: document.body.classList.contains('legend-phaser-road-scene-art-active')
      };
    });
    expect(fallback.textureLoaded).toBe(false);
    expect(fallback.textureError?.source).toContain('old-road-south-fork.webp');
    expect(fallback.expectedSource).toBe('assets/generated/locations/old-road-south-fork.webp');
    expect(fallback.actualSource).toBe(fallback.expectedSource);
    expect(fallback.opacity).toBe('1');
    expect(fallback.visibility).toBe('visible');
    expect(fallback.activeClass).toBe(false);
    await expectNoHorizontalOverflow(page);
  });

  test('Phaser road background follows the live route and stage, with a DOM image fallback', async ({ page }) => {
    test.setTimeout(90_000);
    await enterAshmere(page, 'RoadSceneArtQA');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Freeze the RealmScene tween manager before changing the road stage so
    // this test samples a deterministic in-progress transition rather than
    // racing the real 720ms animation against Playwright scheduling.
    await page.evaluate(() => {
      const scene = window.LegendPhaserWorldV1?.engine?.scene?.getScene('RealmScene');
      if (!scene?.tweens) throw new Error('RealmScene tween manager is unavailable.');
      window.__legendRoadTweenTest = {
        manager: scene.tweens,
        previousTimeScale: scene.tweens.timeScale
      };
      scene.tweens.timeScale = 0;
    });
    let duringFade;
    try {
      await seedRoad(page, 0, null);
      duringFade = await page.evaluate(() => {
        const snapshot = window.LegendPhaserWorldV1.snapshot();
        const image = document.querySelector('.exp100-scene-live > img');
        return {
          alpha: snapshot.nativeRoadSceneArt?.backgroundAlpha,
          nativeActive: snapshot.nativeRoadSceneArt?.active,
          handoffClass: document.body.classList.contains('legend-phaser-road-scene-art-active'),
          domOpacity: getComputedStyle(image).opacity,
          domVisibility: getComputedStyle(image).visibility
        };
      });
      expect(duringFade.alpha).toBeLessThan(0.99);
      expect(duringFade.nativeActive).toBe(false);
      expect(duringFade.handoffClass).toBe(false);
      expect(duringFade.domOpacity).toBe('1');
      expect(duringFade.domVisibility).toBe('visible');
    } finally {
      await page.evaluate(() => {
        const state = window.__legendRoadTweenTest;
        if (!state) return;
        state.manager.timeScale = state.previousTimeScale;
        delete window.__legendRoadTweenTest;
      });
    }
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.backgroundAlpha || 0
    )).toBeGreaterThanOrEqual(0.99);

    const cases = [
      { stage: 0, route: null, environment: 'road' },
      { stage: 1, route: 'ridge', environment: 'ridge' },
      { stage: 1, route: 'reeds', environment: 'reeds' },
      { stage: 2, route: 'ridge', environment: 'camp' },
      { stage: 3, route: 'ridge', environment: 'blackroot' },
      { stage: 4, route: 'reeds', environment: 'marsh' },
      { stage: 5, route: 'reeds', environment: 'greyfen' },
      { stage: 1, route: 'ridge', sideTrip: 'windbreak', environment: 'ridge' },
      { stage: 1, route: 'reeds', sideTrip: 'sunken-cart', environment: 'reeds' }
    ];

    for (const item of cases) {
      await seedRoad(page, item.stage, item.route, item.sideTrip || null);
      await expect.poll(() => page.evaluate(() =>
        window.LegendPhaserWorldV1?.snapshot?.()?.environment
      )).toBe(item.environment);
      await expect.poll(() => page.evaluate(() =>
        window.LegendPhaserWorldV1?.snapshot?.()?.nativeRoadSceneArt?.active
      )).toBe(true);

      const proof = await page.evaluate(() => {
        const snapshot = window.LegendPhaserWorldV1.snapshot();
        const image = document.querySelector('.exp100-scene-live > img');
        const style = image ? getComputedStyle(image) : null;
        return {
          environment: snapshot.environment,
          sceneArt: snapshot.nativeRoadSceneArt,
          activeClass: document.body.classList.contains('legend-phaser-road-scene-art-active'),
          fallbackOpacity: style?.opacity || '',
          fallbackVisibility: style?.visibility || '',
          sceneImageFilter: style?.filter || '',
          canvasFilter: getComputedStyle(document.querySelector('#game-container canvas') || document.body).filter,
          sceneSource: image?.getAttribute('src') || '',
          sceneLabel: document.querySelector('.exp100-scene-label')?.textContent || ''
        };
      });
      expect(proof.environment).toBe(item.environment);
      expect(proof.sceneArt.textureKey).toBe(item.environment);
      expect(proof.sceneArt.sourceWidth).toBeGreaterThan(0);
      expect(proof.sceneArt.sourceHeight).toBeGreaterThan(0);
      expect(proof.sceneArt.actualSource).toBe(proof.sceneArt.expectedSource);
      expect(proof.sceneSource).toBe(proof.sceneArt.actualSource);
      expect(proof.sceneImageFilter).not.toContain('blur(');
      expect(proof.canvasFilter).not.toContain('blur(');
      expect(proof.activeClass).toBe(true);
      expect(proof.fallbackOpacity).toBe('0');
      expect(proof.fallbackVisibility).toBe('hidden');
      expect(proof.sceneLabel).toContain('THE OLD ROAD');
    }

    // Simulate a failed Phaser texture request independently of the DOM image.
    // The DOM source remains correct, but a missing Phaser texture must restore it.
    await seedRoad(page, 1, 'ridge');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);
    const missingTextureFallback = await page.evaluate(() => {
      const scene = document.querySelector('.exp100-scene-live');
      const image = scene?.querySelector(':scope > img');
      const originalExists = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene').textures.exists;
      const textureManager = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene').textures;
      let proof;
      try {
        textureManager.exists = function(key) {
          if (key === 'ridge') return false;
          return originalExists.call(this, key);
        };
        const active = window.LegendPhaserWorldV1.refreshRoadScene();
        const style = getComputedStyle(image);
        proof = {
          active,
          classActive: document.body.classList.contains('legend-phaser-road-scene-art-active'),
          expectedSource: window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.expectedSource,
          actualSource: image?.getAttribute('src') || '',
          opacity: style.opacity,
          visibility: style.visibility
        };
      } finally {
        textureManager.exists = originalExists;
        window.LegendPhaserWorldV1.refreshRoadScene();
      }
      return proof;
    });
    expect(missingTextureFallback.active).toBe(false);
    expect(missingTextureFallback.classActive).toBe(false);
    expect(missingTextureFallback.actualSource).toBe(missingTextureFallback.expectedSource);
    expect(missingTextureFallback.opacity).toBe('1');
    expect(missingTextureFallback.visibility).toBe('visible');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);

    // Simulate an image/texture mismatch without changing any expedition state.
    // Phaser must stop hiding the authored DOM image when its source no longer
    // matches the environment that is currently loaded.
    const fallback = await page.evaluate(() => {
      const image = document.querySelector('.exp100-scene-live > img');
      const original = image.getAttribute('src');
      image.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
      const active = window.LegendPhaserWorldV1.refreshRoadScene();
      const style = getComputedStyle(image);
      const result = {
        active,
        classActive: document.body.classList.contains('legend-phaser-road-scene-art-active'),
        opacity: style.opacity,
        visibility: style.visibility,
        original
      };
      image.setAttribute('src', original);
      window.LegendPhaserWorldV1.refreshRoadScene();
      return result;
    });
    expect(fallback.active).toBe(false);
    expect(fallback.classActive).toBe(false);
    expect(fallback.opacity).toBe('1');
    expect(fallback.visibility).toBe('visible');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);

    // Repeat on a narrow viewport; the real journey UI remains DOM controls
    // while the stage-specific world image is rendered by Phaser.
    await page.setViewportSize({ width: 390, height: 844 });
    await seedRoad(page, 1, 'ridge');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);
    const mobile = await page.evaluate(() => ({
      environment: window.LegendPhaserWorldV1.snapshot()?.environment,
      sceneArt: window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt,
      canvas: document.querySelector('#game-container canvas')?.getBoundingClientRect().toJSON(),
      scene: document.querySelector('.exp100-scene-live')?.getBoundingClientRect().toJSON(),
      mapButton: document.querySelector('#exp150OpenMap')?.getBoundingClientRect().toJSON() || null,
      routeButtons: Array.from(document.querySelectorAll('.exp150-world-page button:enabled'))
        .filter(button => button.getClientRects().length)
        .map(button => ({
          id: button.id,
          width: button.getBoundingClientRect().width,
          height: button.getBoundingClientRect().height
        }))
    }));
    expect(mobile.environment).toBe('ridge');
    expect(mobile.sceneArt.active).toBe(true);
    expect(mobile.canvas.width).toBeGreaterThanOrEqual(390);
    expect(mobile.scene.width).toBeGreaterThan(0);
    expect(mobile.mapButton.width).toBeGreaterThan(0);
    expect(mobile.mapButton.height).toBeGreaterThanOrEqual(36);
    expect(mobile.routeButtons.length).toBeGreaterThan(0);
    expect(mobile.routeButtons.every(button => button.width > 0 && button.height > 0)).toBe(true);
    const roadMotion = await page.evaluate(() => {
      const rules = Array.from(document.styleSheets).flatMap(sheet => {
        try { return Array.from(sheet.cssRules || []); } catch { return []; }
      });
      return ['exp100-road-arrive', 'exp100-discovery-arrive'].map(name =>
        rules.filter(rule => rule.name === name).map(rule => rule.cssText).join(' ')
      );
    });
    expect(roadMotion.every(rule => rule.length > 0 && !rule.includes('blur('))).toBe(true);
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
