const { test, expect } = require('@playwright/test');

async function expectTravelerDetailFits(page) {
  const detail = await page.evaluate(() => {
    const node = document.querySelector('.v120-traveler-line div > span');
    const parent = node?.parentElement?.getBoundingClientRect();
    const rect = node?.getBoundingClientRect();
    return node && rect && parent ? {
      text: node.textContent.trim(),
      source: node.textContent.trim(),
      width: rect.width,
      height: rect.height,
      bounds: { width: parent.width, height: parent.height },
      fontSize: getComputedStyle(node).fontSize
    } : null;
  });
  expect(detail).not.toBeNull();
  expect(detail.text).toBe(detail.source);
  expect(detail.bounds).toBeTruthy();
  expect(detail.width).toBeLessThanOrEqual(detail.bounds.width + 1);
  expect(detail.height).toBeLessThanOrEqual(detail.bounds.height + 1);
  expect(detail.fontSize).not.toBe('');
}

async function openTitle(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  // Use the browser's supported accessibility preference so the game itself
  // skips its scene curtain. Never blanket-disable transitions: that can leave
  // a transition overlay visible and contaminate UI screenshots.
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
  await expect(page.locator('.v120-title')).toBeVisible({ timeout: 15000 });
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

async function openAshmereMore(page) {
  const toggle=page.locator('.ashmere-hub-v240 #ashmereHubMoreToggle');
  if(await toggle.count() && await toggle.getAttribute('aria-expanded')!=='true') await toggle.click();
}

async function clickAshmereView(page, view) {
  const hub=page.locator('.ashmere-hub-v240');
  const primary=hub.locator(`.ashmere-hub-v240-place[data-ash-view="${view}"]`);
  if(await primary.count()) return primary.click();
  await openAshmereMore(page);
  return hub.locator(`.ashmere-hub-v240-more-place[data-ash-view="${view}"]`).click();
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
      // Every seeded checkpoint starts on the main route unless the test
      // explicitly enters a side trip. Clear the Windbreak state before
      // asserting the later waystation/camp presentation.
      activeSideTripV160: null,
      sideTripReturnNodeIdV160: null,
      currentNodeIdV160: null,
      poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, campRestUsed: {}, roadClockHour: 15
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
  test('title uses the existing moonlit Ashmere artwork and real DOM menu', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('link[href*="legend-ui-system-v160.css"]')).toHaveCount(1);
    await expect(page.locator('.v120-title-hero .v120-legend-logo')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
    await expect(page.locator('.v120-title-backdrop')).toHaveAttribute('src', /title_bg_ashmere_road_v089\.jpg/);
    await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /News & Roadmap/i })).toBeVisible();
    await expect(page.locator('.v140-realm-overview')).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi)).toBe(false);

    const freshMenu = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.v120-title-hero .v136-menu-btn'));
      return {
        titleDom: document.querySelector('.title-v230-ashmere-dom') !== null,
        logoVisible: getComputedStyle(document.querySelector('.v150-logo-lockup')).visibility === 'visible',
        backdrop: document.querySelector('.v120-title-backdrop')?.getAttribute('src') || '',
        ids: buttons.map(button => button.id),
        labels: buttons.map(button => button.querySelector('.v136-menu-copy strong')?.textContent.trim() || ''),
        allRealButtons: buttons.every(button => button.tagName === 'BUTTON' && button.type === 'button'),
        allLabelsVisible: buttons.every(button => getComputedStyle(button.querySelector('strong')).visibility === 'visible'),
        painter: document.body.classList.contains('legend-phaser-title-ui-active')
      };
    });
    expect(freshMenu.titleDom).toBe(true);
    expect(freshMenu.logoVisible).toBe(true);
    expect(freshMenu.backdrop).toContain('title_bg_ashmere_road_v089.jpg');
    expect(freshMenu.ids).toEqual(['newPrimary','account','settings','dispatches','titleSound','credits']);
    expect(freshMenu.labels).toEqual(['Begin Your Journey','Profile','Settings','News & Roadmap','Sound: On','Credits']);
    expect(freshMenu.allRealButtons).toBe(true);
    expect(freshMenu.allLabelsVisible).toBe(true);
    expect(freshMenu.painter).toBe(false);

    const computed = await page.locator('.v120-title-hero').evaluate(element => ({
      amber: getComputedStyle(document.documentElement).getPropertyValue('--legend-ui-amber').trim(),
      radius: getComputedStyle(element).borderRadius,
      mainPosition: getComputedStyle(document.querySelector('.v120-title-main')).position
    }));
    expect(computed.amber).toBe('#e7c982');
    expect(computed.radius).toBe('0px');
    expect(computed.mainPosition).toBe('relative');
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-title-desktop.png');
  });

  test('returning-player title keeps every current DOM action without changing the save', async ({ page }) => {
    test.setTimeout(180000);
    await enterAshmere(page, 'ReturnMenuParity');
    const saveBefore = await page.evaluate(() => JSON.stringify(window.LegendRuntimeV120.loadPlayer()));
    await page.evaluate(() => window.LegendGameBootstrap.title());
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('#continue')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi)).toBe(false);

    const menu = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.v120-title-hero .v136-menu-btn'));
      return {
        saveKey: window.LEGEND_DATA?.SAVE_KEY,
        painter: document.body.classList.contains('legend-phaser-title-ui-active'),
        ids: buttons.map(button => button.id),
        labels: buttons.map(button => ({
          title: button.querySelector('.v136-menu-copy strong')?.textContent.trim() || '',
          subtitle: button.querySelector('.v136-menu-copy small')?.textContent.trim() || ''
        })),
        buttons: buttons.map(button => ({
          id: button.id,
          tag: button.tagName,
          type: button.type,
          accessibleName: button.getAttribute('aria-label') || button.textContent.replace(/\s+/g, ' ').trim(),
          handler: typeof button.onclick,
          labelVisible: getComputedStyle(button.querySelector('strong')).visibility
        })),
        logoVisible: getComputedStyle(document.querySelector('.v150-logo-lockup')).visibility
      };
    });
    expect(menu.saveKey).toBe('legend-roads-of-ashmere-v09');
    expect(menu.painter).toBe(false);
    expect(menu.ids).toEqual(['continue','new','account','settings','dispatches','titleSound','credits']);
    expect(menu.labels.map(item => item.title)).toEqual([
      'Continue Journey','New Traveler','Profile','Settings','News & Roadmap','Sound: On','Credits'
    ]);
    expect(menu.labels.every(item => item.title && item.subtitle)).toBe(true);
    expect(menu.buttons).toHaveLength(7);
    expect(menu.buttons.every(button => button.tag === 'BUTTON' && button.type === 'button' &&
      button.accessibleName && button.handler === 'function' && button.labelVisible === 'visible')).toBe(true);
    expect(menu.logoVisible).toBe('visible');
    expect(await page.evaluate(() => JSON.stringify(window.LegendRuntimeV120.loadPlayer()))).toBe(saveBefore);

    // Verify the focus ring under genuine keyboard navigation, not programmatic
    // focus after the prior mouse-driven title/menu actions.
    await page.evaluate(() => document.activeElement?.blur?.());
    let reachedSettingsByKeyboard = false;
    for (let tab = 0; tab < 20; tab += 1) {
      await page.keyboard.press('Tab');
      const activeId = await page.evaluate(() => document.activeElement?.id || '');
      if (activeId === 'settings') {
        reachedSettingsByKeyboard = true;
        break;
      }
    }
    expect(reachedSettingsByKeyboard).toBe(true);
    await expect(page.locator('#settings')).toBeFocused();
    const focus = await page.locator('#settings').evaluate(button => getComputedStyle(button).outlineStyle);
    expect(focus).toBe('solid');
    await page.locator('#settings').evaluate(button => { button.disabled = true; });
    await expect(page.locator('#settings')).toBeDisabled();
    await page.locator('#settings').evaluate(button => { button.disabled = false; });
    await expect(page.locator('#settings')).toBeEnabled();
    expect(await page.evaluate(() => JSON.stringify(window.LegendRuntimeV120.loadPlayer()))).toBe(saveBefore);
    await expectNoHorizontalOverflow(page);
    await expectTravelerDetailFits(page);
    await attachProof(page, 'phase1-returning-title-desktop.png');

    // Exercise the existing production callbacks behind the remaining options.
    await page.locator('#account').click();
    await expect(page.locator('.account09x')).toBeVisible();
    await page.locator('#backTitle').click();
    await expect(page.locator('#continue')).toBeVisible();

    await page.locator('#settings').click();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await page.locator('#backTitle').click();
    await expect(page.locator('#continue')).toBeVisible();

    await page.locator('#dispatches').click();
    await expect(page.getByRole('heading', { name: 'News & Roadmap', exact: true })).toBeVisible();
    await page.locator('#dispatchesBack').click();
    await expect(page.locator('#continue')).toBeVisible();

    await page.locator('#credits').click();
    await expect(page.getByRole('dialog', { name: 'LEGEND' })).toBeVisible();
    await page.locator('[data-credits-close]').click();
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.locator('#new').click();
    await expect(page.locator('.opening-lore-v220')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'When the World Went to War' })).toBeVisible();

    await page.evaluate(() => window.LegendGameBootstrap.title());
    await expect(page.locator('#continue')).toBeVisible();
    await page.locator('#continue').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendRuntimeV120.loadPlayer()?.username)).toBe('ReturnMenuParity');
  });

  test('returning-player DOM menu remains readable and tappable at 390px', async ({ browser }) => {
    test.setTimeout(180000);
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
      )).toBe(false);
      const layout = await mobilePage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('.v120-title-hero .v136-menu-btn'));
        return {
          titleDom: document.querySelector('.title-v230-ashmere-dom') !== null,
          ids: buttons.map(button => button.id),
          labels: buttons.map(button => button.querySelector('strong')?.textContent.trim() || ''),
          logoVisible: getComputedStyle(document.querySelector('.v150-logo-lockup')).visibility,
          overflow: document.documentElement.scrollWidth > innerWidth,
          bounds: buttons.map(button => {
            const rect = button.getBoundingClientRect();
            return { left: rect.left, right: rect.right, height: rect.height };
          })
        };
      });
      expect(layout.titleDom).toBe(true);
      expect(layout.ids).toEqual(['continue','new','account','settings','dispatches','titleSound','credits']);
      expect(layout.labels).toEqual(['Continue Journey','New Traveler','Profile','Settings','News & Roadmap','Sound: On','Credits']);
      expect(layout.logoVisible).toBe('visible');
      expect(layout.overflow).toBe(false);
      expect(layout.bounds.every(rect => rect.left >= 0 && rect.right <= 390 && rect.height >= 44)).toBe(true);
      await expectNoHorizontalOverflow(mobilePage);
      await expectTravelerDetailFits(mobilePage);
      await attachProof(mobilePage, 'phase1-returning-title-mobile-390.png');

      await mobilePage.locator('#settings').tap();
      await expect(mobilePage.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
      await mobilePage.locator('#backTitle').tap();
      await expect(mobilePage.locator('#continue')).toBeVisible();
      await expect.poll(() => mobilePage.evaluate(() =>
        window.LegendPhaserWorldV1.snapshot().nativeTitleUi
      )).toBe(false);
    } finally {
      await context.close();
    }
  });

  test('Ashmere refuge and Work Board retain their real destinations and actions', async ({ page }) => {
    test.setTimeout(120000);
    await enterAshmere(page, 'TownUIPreview');
    const hub=page.locator('.ashmere-hub-v240');
    await expect(hub).toBeVisible();
    await expect(hub.locator('.ashmere-hub-v240-backdrop img')).toHaveAttribute('src', /location_ashmere_mainstreet_v1\.jpg/);
    await expect(hub.locator('.ashmere-hub-v240-traveler')).toContainText('TownUIPreview');
    await expect(hub.locator('.ashmere-hub-v240-health')).toBeVisible();
    await expect(hub.locator('.ashmere-hub-v240-place')).toHaveCount(4);
    await expect(hub.locator('.ashmere-hub-v240-gate')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();
    const radius=await hub.locator('.ashmere-hub-v240-place').first().evaluate(el=>getComputedStyle(el).borderRadius);
    expect(radius).toBe('2px');
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-ashmere-hub-desktop.png');

    await clickAshmereView(page,'work');
    await expect(page.locator('.ash099-screen')).toBeVisible();
    await expect(page.locator('#openDailyFieldBoard')).toBeVisible();
    await attachProof(page, 'phase1-work-board-service.png');
    await page.locator('#openDailyFieldBoard').click();
    await expect(page.locator('.ash099-daily-board')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });


  test('Phaser paints Old Road decision cards while retaining real route, detour and camp actions', async ({ page }) => {
    test.setTimeout(90000);
    await enterAshmere(page, 'RoadActionsQA');
    await seedRoad(page, 0, null);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeExpeditionActionsUi)).toBe(true);

    const fork = await page.evaluate(() => {
      const panel = document.querySelector('.exp150-interactions .exp100-route-choice');
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        text: snapshot.nativeExpeditionActionsUiTextValues || [],
        controls: snapshot.nativeExpeditionActionsUiControlIds || [],
        objectCount: snapshot.nativeExpeditionActionsUiObjectCount,
        headingColor: panel?.querySelector('h2') ? getComputedStyle(panel.querySelector('h2')).color : '',
        headingMarker: panel?.querySelector('h2')?.getAttribute('data-legend-phaser-road-action-text') || null,
        headingInlineColor: panel?.querySelector('h2')?.getAttribute('style') || '',
        bodyActionClass: document.body.classList.contains('legend-phaser-road-actions-ui-active'),
        activeMaskSelectorCount: document.querySelectorAll('body.legend-phaser-road-actions-ui-active [data-legend-phaser-road-action-text="true"]').length,
        routeHeadingSelectorMatches: document.querySelectorAll('body.legend-phaser-road-actions-ui-active .exp100:has(.exp150-world-page) .exp150-interactions .exp100-route-choice h2[data-legend-phaser-road-action-text="true"]').length,
        actionCssHref: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href).find(href => href.includes('phaser-ui-native-v1.css')) || '',
        actionColor: panel?.querySelector('#routeRidge') ? getComputedStyle(panel.querySelector('#routeRidge')).color : '',
        routeButtons: Array.from(panel?.querySelectorAll('button') || []).map(button => ({
          id: button.id, disabled: button.disabled, text: button.textContent.replace(/\s+/g,' ').trim()
        }))
      };
    });
    expect(fork.objectCount).toBe(1);
    expect(fork.headingMarker).toBe('true');
    expect(fork.bodyActionClass).toBe(true);
    expect(fork.activeMaskSelectorCount).toBeGreaterThan(0);
    expect(fork.text).toEqual(expect.arrayContaining([
      'THE ROAD FORKS', 'Two ways through the lowlands', 'Take the High Ridge', 'Risk the Reed Cut'
    ]));
    expect(fork.controls).toEqual(expect.arrayContaining(['routeRidge','routeReeds']));
    expect(fork.headingColor).toBe('rgba(0, 0, 0, 0)');
    expect(fork.actionColor).toBe('rgba(0, 0, 0, 0)');
    expect(fork.routeButtons.every(button => !button.disabled)).toBe(true);
    await attachProof(page, 'phase1-old-road-actions-fork.png');

    await page.locator('#routeRidge').click();
    await expect.poll(() => page.evaluate(() =>
      window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100.routeChoice
    )).toBe('ridge');

    await seedRoad(page, 1, 'ridge');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeExpeditionActionsUi)).toBe(true);
    await expect(page.locator('.exp150-interactions .exp160-optional-detour')).toBeVisible();
    const optionalVisit = page.locator('#exp160VisitOptional');
    await expect(optionalVisit).toHaveCSS('color','rgba(0, 0, 0, 0)');
    // The legacy theme requests smooth document scrolling. Scroll instantly,
    // then wait for the element's measured bounds to settle before a normal
    // Playwright click; do not bypass actionability with force:true.
    await optionalVisit.evaluate(async node => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      document.body.style.setProperty('scroll-behavior', 'auto', 'important');
      node.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      const bounds = () => {
        const rect = node.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      };
      let previous = bounds();
      let stableFrames = 0;
      for (let frame = 0; frame < 60 && stableFrames < 3; frame += 1) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const current = bounds();
        if (previous.every((value, index) => Math.abs(value - current[index]) < 0.25)) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
        }
        previous = current;
      }
      if (stableFrames < 3) throw new Error('Optional detour action did not settle after instant scrolling.');
    });
    await optionalVisit.click();
    await expect(page.locator('.exp160-optional-site')).toBeVisible();
    await expect(page.locator('.exp160-optional-site h2')).toHaveCSS('color','rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() =>
      window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100.activeSideTripV160
    )).toBe('windbreak');
    await attachProof(page, 'phase1-old-road-actions-detour.png');

    await seedRoad(page, 2, 'ridge');
    await expect(page.locator('.exp100-camp')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeExpeditionActionsUiTextValues || []))
      .toEqual(expect.arrayContaining(['WAYSTATION · NIGHT WATCH','Make this stop count','Rest by the Fire','Craft a Road Poultice','Keep Watch']));
    await expect(page.locator('#campRest')).toHaveCSS('color','rgba(0, 0, 0, 0)');
    const beforeDay = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().day);
    await page.locator('#campRest').click();
    await expect.poll(() => page.evaluate(() => window.LegendRuntimeV120.loadPlayer().day)).toBe(beforeDay + 1);
    await expect(page.locator('#campRest')).toBeDisabled();
    await attachProof(page, 'phase1-old-road-actions-camp.png');
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
        asideHidden: document.querySelector('.exp150-journey-aside')?.hidden === true,
        asideDisplay: document.querySelector('.exp150-journey-aside') ? getComputedStyle(document.querySelector('.exp150-journey-aside')).display : 'missing',
        asideText: document.querySelector('.exp150-journey-aside')?.textContent?.trim() || '',
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
    expect(roadDom.nativeHudActive).toBe(true);
    expect(roadDom.nativeHudText).toEqual(expect.arrayContaining([
      'OLD ROAD · EXPEDITION', 'South Fork', 'YOUR JOURNEY'
    ]));
    expect(roadDom.nativeHudText.some(value=>/pressure/i.test(value))).toBe(true);
    expect(roadDom.nativeHudControlIds).toEqual(expect.arrayContaining(['exp150OpenMap','exp150OpenJournal']));
    expect(roadDom.nativeHudControlIds).not.toContain('exp150OpenJournalAside');
    expect(roadDom.expeditionHudClass).toBe(true);
    expect(roadDom.asideHidden).toBe(true);
    expect(roadDom.asideDisplay).toBe('none');
    expect(roadDom.asideText).toBe('');
    expect(roadDom.mapPainter).toBe(false);
    expect(roadDom.mapControl).toBe(true);
    expect(roadDom.mapText.length).toBeGreaterThan(0);
    expect(roadDom.mapColor).toBe('rgba(0, 0, 0, 0)');
    expect(roadDom.mapIconColor).toBe('rgba(0, 0, 0, 0)');
    expect(roadDom.mapVisibility).toBe('visible');
    await expect(page.locator('.exp150-expedition-head')).toBeVisible();
    await expect.poll(()=>page.locator('.exp150-main-grid').evaluate(node =>
      getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length
    )).toBe(1);
    await expect(page.locator('.exp150-journey-aside')).toBeHidden();
    await expect(page.locator('.exp150-interactions .exp100-discovery-beat')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeExpeditionHudUi)).toBe(true);
    await expect(page.locator('.exp150-title-group h1')).toHaveCSS('color','rgba(0, 0, 0, 0)');
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
    test.setTimeout(180000);
    await enterAshmere(page, 'PhaserCombatQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const player = rt.loadPlayer();
      player.hp = 40;
      player.maxHp = 100;
      player.inventory = player.inventory || {};
      player.inventory.potion = 1;
      player.inventory.roadPoultice = 1;
      player.futureCombatRecord = { keep: 17 };
      player.flags = player.flags || {};
      player.flags.roadExpeditionV100 = {
        ...(player.flags.roadExpeditionV100 || {}),
        stage: 0, pressure: 53, trips: 0, events: 0, finds: 0, battles: 0,
        routeChoice: null, poiUsed: {}, searchUsed: {}, readUsed: {}
      };
      const road = window.LegendRoadsV100.oldRoad;
      road.enemies = road.enemies
        .filter(enemy => enemy.id === 'goblin')
        .map(enemy => ({ ...enemy, hp: [999, 999], damage: [3, 3] }));
      rt.savePlayer(player);
    });

    await clickAshmereView(page,'routes');
    await page.getByRole('button', { name: /The Old Road/i }).click();
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
    // Enter keyboard modality before asserting the DOM :focus-visible contract.
    await page.locator('#skill').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#guard')).toBeFocused();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeCombatUiFocusedControlIds || []
    )).toContain('guard');
    const combatFocusStyle = await page.locator('#guard').evaluate(node => ({
      outlineColor: getComputedStyle(node).outlineColor,
      outlineStyle: getComputedStyle(node).outlineStyle
    }));
    expect(combatFocusStyle).toEqual({ outlineColor: 'rgb(181, 217, 154)', outlineStyle: 'solid' });
    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-heavy/);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeCombatUi)).toBe(true);
    await expectNoHorizontalOverflow(page);
    for (const [id, copy] of [['skill', 'Trap Shot lands'], ['strike', 'Your strike lands'], ['heavy', 'Heavy Strike lands'], ['poultice', 'bind a Road Poultice']]) {
      await page.locator('#' + id).click();
      await expect(page.locator('.rpg-dialogue')).toContainText(copy);
      await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUi)).toBe(true);
    }
    await expect(page.locator('.rpg-battle-topline strong')).toContainText('TURN 7');
    const beforeSound = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
    const soundLabel = await page.locator('#battleSound').textContent();
    await page.locator('#battleSound').click();
    await expect(page.locator('#battleSound')).not.toHaveText(soundLabel);
    expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(beforeSound);
    const beforeRetreat = await page.evaluate(() => LegendStorage.loadPlayer());
    await page.locator('#flee').click();
    await expect(page.locator('.exp150-world-page')).toBeVisible();
    const afterRetreat = await page.evaluate(() => LegendStorage.loadPlayer());
    expect(afterRetreat.flags.roadExpeditionV100.pressure).toBe(Math.max(0, beforeRetreat.flags.roadExpeditionV100.pressure - 8));
    expect(afterRetreat.inventory.roadPoultice).toBe(0);
    expect(afterRetreat.futureCombatRecord).toEqual({ keep: 17 });
    expect(afterRetreat.gold).toBe(beforeRetreat.gold);
    expect(afterRetreat.xp).toBe(beforeRetreat.xp);
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUi)).toBe(false);

  });

  test('title, town and expedition stay within a 390px touch viewport', async ({ page }) => {
    await openTitle(page, { width: 390, height: 844 });
    await expect(page.locator('.v140-realm-overview.v151-realm-art')).toBeHidden();
    await expect(page.locator('.v136-rpg-menu')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-title-mobile-390.png');

    await enterAshmere(page, 'MobileUIPreview', { width: 390, height: 844 });
    expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
    await expect(page.locator('.ashmere-hub-v240 #ashmereHubMoreToggle')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-ashmere-mobile-390.png');

    await seedRoad(page, 0, null);
    await expect(page.locator('#exp150OpenMap')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeGameplayUiSurface)).toBe('expedition');
    await expectNoHorizontalOverflow(page);
    expect(page.viewportSize()).toEqual({ width: 390, height: 844 });
    await attachProof(page, 'phase1-old-road-mobile-390.png');
  });

  test('saved Reduced Motion preference suppresses new decorative transitions', async ({ page }) => {
    test.setTimeout(90000);
    await openTitle(page);
    await page.evaluate(() => document.body.classList.add('a11y-reduced-motion'));

    const titleMotion = await page.locator('.v120-title-backdrop').evaluate(el => {
      const style = getComputedStyle(el);
      return { transition: style.transitionProperty, animation: style.animationName, transform: style.transform };
    });
    expect(titleMotion.transition).toBe('none');
    expect(titleMotion.animation).toBe('none');
    expect(titleMotion.transform).toBe('none');

    await enterAshmere(page, 'MotionUIPreview');
    await page.evaluate(() => document.body.classList.add('a11y-reduced-motion'));
    const destination = page.locator('.ashmere-hub-v240-place').first();
    await destination.hover();
    const cardMotion = await destination.evaluate(el => {
      const style = getComputedStyle(el);
      return { transition: style.transitionProperty, transform: style.transform };
    });
    expect(cardMotion.transition).toBe('none');
    expect(cardMotion.transform).toBe('none');
  });

});
