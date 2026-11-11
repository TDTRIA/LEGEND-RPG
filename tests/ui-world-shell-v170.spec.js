const { test, expect } = require('@playwright/test');

function cssBackgroundAlphas(value) {
  return Array.from(String(value || '').matchAll(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/g), match => Number(match[1]));
}

function expectBackgroundAlphaAtMost(value, maximum) {
  const background = String(value || '').trim();
  if (background === 'none' || background === 'transparent') return;
  const alphas = cssBackgroundAlphas(background);
  expect(alphas.length, 'expected rgba layers or a transparent background in: ' + background).toBeGreaterThan(0);
  expect(Math.max(...alphas)).toBeLessThanOrEqual(maximum);
}

async function openTitle(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
  const titleBackdropFilter = await page.locator('.title-v136-rpg .v120-title-backdrop')
    .evaluate(element => getComputedStyle(element).filter);
  expect(titleBackdropFilter).toContain('brightness(1.1)');
  const titleSceneOverlay = await page.locator('.title-v136-rpg')
    .evaluate(element => getComputedStyle(element, '::after').backgroundImage);
  expect(titleSceneOverlay).toContain('rgba(2, 6, 4, 0.3)');
  expect(titleSceneOverlay).not.toContain('rgba(2, 5, 3, 0.94)');
}

async function enterAshmere(page, name = 'WorldShellQA') {
  await openTitle(page);
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
  await page.locator('[data-class="Ranger"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  const openingBackdropFilter = await page.evaluate(() => {
    const backdrop = document.querySelector('.opening-road-v140-prologue .opening-road-v140-bg');
    return backdrop ? getComputedStyle(backdrop).filter : '';
  });
  expect(openingBackdropFilter).toContain('brightness(1.08)');
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await expect(page.locator('#legend-world-shell-root')).toBeVisible();
  await expect(page.locator('#legend-world-shell-root .lws-brand-copy span')).toHaveText('BEYOND THE LANTERN LINE');
  await expect(page.locator('#lws-panel-left')).not.toContainText('V150');
  await expect(page.locator('#lws-panel-left')).not.toContainText('does not create or replace journal records');
  await expect(page.locator('#lws-panel-right')).not.toContainText('existing game service');
  await expect(page.locator('#lws-panel-right .lws-btn-icon:not(.runway-icon)')).toHaveCount(0);
  await expect(page.locator('body')).toHaveClass(/legend-world-scene-town/);
  await expect(page.locator('body')).toHaveClass(/legend-world-region-ashmere/);
}

async function seedRoad(page, stage = 1, route = 'ridge') {
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
  await expect(page.locator('#legend-world-shell-root')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/legend-world-scene-road/);
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

test.describe('LEGEND persistent world shell v170', () => {
  test('stays off the title and creation screens, then reads live Ashmere state', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('#legend-world-shell-root')).toHaveCount(0);

    await enterAshmere(page, 'ShellTraveler');
    await expect(page.locator('#lws-current-location')).toHaveText('Ashmere');
    await expect(page.locator('#lws-current-objective')).not.toBeEmpty();
    const saved = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return {
        name: player.username,
        health: player.hp + ' / ' + player.maxHp,
        gold: player.gold + 'g'
      };
    });
    await expect(page.locator('#lws-panel-left')).toContainText(saved.name);
    await expect.poll(() => page.locator('.lws-panel-left .lws-quest-item').first().evaluate(element => getComputedStyle(element).display)).toBe('block');
    await expect(page.locator('#lws-hud-health')).toHaveText(saved.health);
    await expect(page.locator('#lws-hud-gold')).toHaveText(saved.gold);
    await expect(page.getByRole('heading', { name: 'Ashmere', exact: true })).toHaveCount(1);
    // The Bell Cellar is a genuine first-road-return unlock, not a default Ashmere destination.
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.flags = player.flags || {};
      player.flags.firstRoadReturnSeen = true;
      window.LegendStorage.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
    });
    await expect(page.getByRole('button', { name: /The Bell Cellar/i })).toHaveCount(1);
    await expect(page.locator('.lws-panel-right [data-world-route="dungeon"]')).toHaveCount(1);
    await expect(page.locator('.lws-town-routes')).toHaveCount(1);
    const viewportLayout = await page.evaluate(() => {
      const root = document.getElementById('root').getBoundingClientRect();
      const left = document.querySelector('.lws-panel-left').getBoundingClientRect();
      const right = document.querySelector('.lws-panel-right').getBoundingClientRect();
      return {
        rootLeft: root.left, rootRight: root.right, rootHeight: root.height,
        rootOverflowY: getComputedStyle(document.getElementById('root')).overflowY,
        rootScrollHeight: document.getElementById('root').scrollHeight,
        rootClientHeight: document.getElementById('root').clientHeight,
        leftRailRight: left.right, rightRailLeft: right.left
      };
    });
    expect(viewportLayout.rootLeft).toBeGreaterThanOrEqual(viewportLayout.leftRailRight);
    expect(viewportLayout.rootRight).toBeLessThanOrEqual(viewportLayout.rightRailLeft);
    expect(viewportLayout.rootHeight).toBeLessThanOrEqual(760);
    expect(viewportLayout.rootOverflowY).toBe('auto');
    expect(viewportLayout.rootScrollHeight).toBeGreaterThan(viewportLayout.rootClientHeight);
    await expectNoHorizontalOverflow(page);

    // Exercise the shell's destination delegate while the town destination catalog is active.
    await expect(page.locator('.lws-panel-right [data-world-place="inn"]')).toBeVisible();
    await page.locator('.lws-panel-right [data-world-place="inn"]').click();
    await expect(page.locator('.lws-panel-right [data-world-place="inn"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.lws-poi-scene-note')).toContainText('Ashmere Inn');
    await expect(page.locator('.ash100-town')).toBeVisible();
    await page.locator('.lws-panel-right [data-world-action="visit-selected-place"]').click();
    await expect(page.locator('.ash099-screen')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();

    // Return through the shell to the hub, then assert the road destination is unique on Routes.
    await page.locator('.lws-bottom-bar [data-world-action="world"]').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' })
      .getByRole('button', { name: /Routes/i }).click();
    await expect(page.getByRole('button', { name: /The Old Road/i })).toHaveCount(1);
  });




  test('Phaser paints Ashmere contextual actions and preserves the real POI selection and visit flow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterAshmere(page, 'PhaserContextQA');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeRightDrawerUi)).toBe(true);

    const initial = await page.evaluate(() => {
      const panel = document.querySelector('#lws-panel-right');
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const labels = Array.from(panel?.querySelectorAll('.lws-place-option-copy strong') || []);
      return {
        active: document.body.classList.contains('legend-phaser-right-drawer-ui-active'),
        count: snapshot.nativeRightDrawerUiObjectCount,
        textValues: snapshot.nativeRightDrawerUiTextValues || [],
        controls: snapshot.nativeRightDrawerUiControlIds || [],
        icons: snapshot.nativeRightDrawerUiIconCount,
        labelColors: labels.map(node => getComputedStyle(node).color)
      };
    });
    expect(initial.active).toBe(true);
    expect(initial.count).toBeGreaterThan(10);
    expect(initial.textValues).toEqual(expect.arrayContaining([
      'Ashmere · Under the lanterns', 'Landmarks & Services', 'Ashmere Inn', 'Market', 'Forge & Workshop', 'Old Road Gate'
    ]));
    expect(initial.controls).toEqual(expect.arrayContaining(['inn','market','forge','road','visit-selected-place']));
    expect(initial.icons).toBeGreaterThanOrEqual(4);
    expect(initial.labelColors.every(color => color === 'rgba(0, 0, 0, 0)')).toBe(true);

    // Selecting a location is still the original data-world-place callback.
    await page.locator('#lws-panel-right [data-world-place="market"]').click();
    await expect(page.locator('#lws-panel-right .lws-selected-place h3')).toHaveText('Market');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRightDrawerUiTextValues || []))
      .toEqual(expect.arrayContaining(['Landmark in view', 'Market', 'Visit the Market', 'Enter this place']));
    await expect(page.locator('#lws-panel-right .lws-visit-place .lws-btn-copy strong'))
      .toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.locator('#lws-panel-right [data-world-action="visit-selected-place"]').click();
    await expect(page.locator('.ash099-screen')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();
  });

  test('Phaser contextual action drawer tracks Old Road actions and remains a real mobile drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enterAshmere(page, 'MobilePhaserContextQA');
    const panel = page.locator('#lws-panel-right');
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRightDrawerUi)).toBe(false);
    await expectNoHorizontalOverflow(page);

    await page.locator('#legend-world-shell-root [data-world-action="toggle-right"]').click();
    await expect(page.locator('body')).toHaveClass(/legend-shell-right-open/);
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRightDrawerUi)).toBe(true);
    await expect(panel).toContainText('Landmarks & Services');
    await expectNoHorizontalOverflow(page);
    await page.locator('#legend-world-shell-root [data-world-action="toggle-right"]').click();
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRightDrawerUi)).toBe(false);

    await page.setViewportSize({ width: 1440, height: 900 });
    await seedRoad(page);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRightDrawerUi)).toBe(true);
    const roadLabels = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeRightDrawerUiTextValues || []);
    expect(roadLabels).toEqual(expect.arrayContaining(['The Old Road', 'Press onward', 'Search the area', 'Read the road', 'Road map', 'Field journal']));
    await expectNoHorizontalOverflow(page);
  });

  test('Phaser paints the traveler journal drawer while preserving saved values and its real Journal action', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterAshmere(page, 'PhaserJournalQA');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeLeftDrawerUi)).toBe(true);

    const desktop = await page.evaluate(() => {
      const panel = document.querySelector('#lws-panel-left');
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const player = window.LegendStorage.loadPlayer();
      const label = panel?.querySelector('.lws-panel-eyebrow');
      const journalButton = panel?.querySelector('[data-world-action="journal"]');
      return {
        active: document.body.classList.contains('legend-phaser-left-drawer-ui-active'),
        objectCount: snapshot.nativeLeftDrawerUiObjectCount,
        textCount: snapshot.nativeLeftDrawerUiTextCount,
        textValues: snapshot.nativeLeftDrawerUiTextValues || [],
        controlIds: snapshot.nativeLeftDrawerUiControlIds || [],
        labelColor: label ? getComputedStyle(label).color : '',
        hp: player.hp + ' / ' + player.maxHp,
        gold: player.gold + 'g',
        scrollRect: (() => {
          const r = panel?.querySelector('.lws-panel-scroll')?.getBoundingClientRect();
          return r ? { left:r.left, top:r.top, width:r.width, height:r.height } : null;
        })(),
        buttonName: journalButton?.textContent?.replace(/\s+/g,' ').trim() || '',
        buttonStillEnabled: Boolean(journalButton && !journalButton.disabled)
      };
    });
    expect(desktop.active).toBe(true);
    expect(desktop.objectCount).toBeGreaterThan(10);
    expect(desktop.textCount).toBeGreaterThan(10);
    expect(desktop.textValues).toEqual(expect.arrayContaining([
      'Traveler record', 'PhaserJournalQA', 'Vitality', 'Current lead', 'Quest log', 'Field journal'
    ]));
    expect(desktop.textValues).toContain(desktop.hp);
    expect(desktop.textValues).toContain(desktop.gold);
    expect(desktop.labelColor).toBe('rgba(0, 0, 0, 0)');
    expect(desktop.buttonStillEnabled).toBe(true);
    expect(desktop.buttonName).toContain('Open journal');
    expect(desktop.controlIds).toContain('journal');

    // renderShell rebuilds this panel's innerHTML on refresh too. Native text
    // tags must be re-applied to the new nodes even if the copy is unchanged.
    await page.evaluate(() => window.LegendWorldShellV170.refresh());
    await expect.poll(() => page.evaluate(() => {
      const eyebrow = document.querySelector('#lws-panel-left .lws-panel-eyebrow');
      return eyebrow ? getComputedStyle(eyebrow).color : '';
    })).toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeLeftDrawerUiTextCount || 0))
      .toBeGreaterThan(10);

    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.questLog = [
        ...(Array.isArray(player.questLog) ? player.questLog : []),
        ...Array.from({ length: 12 }, (_, index) =>
          'Journal overflow note ' + (index + 1) + ': ' + 'A remembered detail from the road beyond the lantern line. '.repeat(2)
        )
      ];
      window.LegendStorage.savePlayer(player);
      window.LegendWorldShellV170.refresh();
    });
    const scroll = page.locator('#lws-panel-left .lws-panel-scroll');
    await expect.poll(() => scroll.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true);
    await scroll.evaluate(node => { node.scrollTop = node.scrollHeight; node.dispatchEvent(new Event('scroll')); });
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeLeftDrawerUiScrollTop || 0))
      .toBeGreaterThan(0);
    const desktopClip = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const mask = snapshot.nativeLeftDrawerUiMaskBounds;
      const rect = document.querySelector('#lws-panel-left .lws-panel-scroll')?.getBoundingClientRect();
      const size = snapshot.nativeLeftDrawerUiSceneSize;
      const sx = size.width / Math.max(1, window.innerWidth);
      const sy = size.height / Math.max(1, window.innerHeight);
      return Boolean(mask && rect &&
        Math.abs(mask.x - rect.left * sx) < 1 &&
        Math.abs(mask.y - rect.top * sy) < 1 &&
        Math.abs(mask.width - rect.width * sx) < 1 &&
        Math.abs(mask.height - rect.height * sy) < 1);
    });
    expect(desktopClip).toBe(true);
    await expectNoHorizontalOverflow(page);

    // The native visual leaves the original production journal action intact.
    await page.locator('#lws-panel-left [data-world-action="journal"]').click();
    await expect(page.locator('.ash099-screen, [data-legend-game-screen]')).toBeVisible();
  });

  test('mobile journal drawer is DOM-backed while closed and Phaser-painted once opened', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enterAshmere(page, 'MobilePhaserJournalQA');
    const panel = page.locator('#lws-panel-left');
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeLeftDrawerUi)).toBe(false);
    await expectNoHorizontalOverflow(page);

    await page.locator('#legend-world-shell-root [data-world-action="toggle-left"]').click();
    await expect(page.locator('body')).toHaveClass(/legend-shell-left-open/);
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeLeftDrawerUi)).toBe(true);
    await expect(panel.locator('.lws-panel-eyebrow')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await expect(panel).toContainText('MobilePhaserJournalQA');
    await expect(panel.locator('[data-world-action="journal"]')).toBeEnabled();
    await expectNoHorizontalOverflow(page);

    await page.locator('#legend-world-shell-root [data-world-action="toggle-left"]').click();
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeLeftDrawerUi)).toBe(false);
  });

  test('Phaser paints the persistent bottom navigation without replacing production action handlers', async ({ page }) => {
    await enterAshmere(page, 'PhaserBottomBarQA');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeBottomBarUi)).toBe(true);

    const desktop = await page.evaluate(() => {
      const bar = document.querySelector('.lws-bottom-bar');
      const labels = Array.from(bar?.querySelectorAll('.lws-btn-copy strong') || []);
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        active: document.body.classList.contains('legend-phaser-bottom-bar-ui-active'),
        objectCount: snapshot.nativeBottomBarUiObjectCount,
        iconCount: snapshot.nativeBottomBarUiIconCount,
        values: snapshot.nativeBottomBarUiTextValues || [],
        paintedValues: snapshot.nativeBottomBarUiPaintedTextValues || [],
        paintedCount: snapshot.nativeBottomBarUiPaintedTextCount || 0,
        actions: snapshot.nativeBottomBarUiControlIds || [],
        labelColors: labels.map(node => getComputedStyle(node).color),
        iconOpacities: Array.from(bar?.querySelectorAll('.lws-btn-icon') || []).map(node => getComputedStyle(node).opacity),
        buttonCount: bar?.querySelectorAll('button[data-world-action]').length || 0
      };
    });
    expect(desktop.active).toBe(true);
    expect(desktop.objectCount).toBeGreaterThan(2);
    expect(desktop.iconCount).toBeGreaterThanOrEqual(5);
    expect(desktop.iconOpacities.every(opacity => opacity === '0')).toBe(true);
    await page.locator('.lws-bottom-bar [data-world-action="journal"]').hover();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeBottomBarUiIconCount || 0)).toBeGreaterThanOrEqual(5);
    expect(desktop.values).toEqual(expect.arrayContaining(['World', 'Inventory', 'Journal', 'Map', 'Combat', 'Settings']));
    expect(desktop.paintedCount).toBe(6);
    expect(desktop.paintedValues).toEqual(expect.arrayContaining(['World', 'Inventory', 'Journal', 'Map', 'Combat', 'Settings']));
    expect(desktop.actions).toEqual(expect.arrayContaining(['world', 'inventory', 'journal', 'map', 'combat', 'settings']));
    expect(desktop.buttonCount).toBe(6);
    expect(desktop.labelColors.every(color => color === 'rgba(0, 0, 0, 0)')).toBe(true);

    // renderShell replaces the bottom-bar DOM nodes even if all visible content
    // is identical. The native painter must re-tag the replacement nodes.
    await page.evaluate(() => window.LegendWorldShellV170.refresh());
    await expect.poll(() => page.evaluate(() => {
      const bar = document.querySelector('.lws-bottom-bar');
      return Array.from(bar?.querySelectorAll('.lws-btn-copy strong') || [])
        .every(node => getComputedStyle(node).color === 'rgba(0, 0, 0, 0)');
    })).toBe(true);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeBottomBarUiTextCount || 0)).toBe(6);

    // A native visual does not intercept the actual DOM click. The existing
    // inventory callback must still open the same production inventory modal.
    await page.locator('.lws-bottom-bar [data-world-action="inventory"]').click();
    await expect(page.locator('#legend-world-shell-modal-root .lws-modal')).toBeVisible();
    await expect(page.locator('#legend-world-shell-modal-root .lws-modal-header h2')).toHaveText('Inventory');
    await page.locator('#legend-world-shell-modal-root [data-shell-modal-close]').first().click();
    await expect(page.locator('#legend-world-shell-modal-root .lws-modal')).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeBottomBarUiSceneSize?.width)).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    const mobile = await page.evaluate(() => {
      const bar = document.querySelector('.lws-bottom-bar');
      const labels = Array.from(bar?.querySelectorAll('.lws-btn-copy strong') || []);
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        barWidth: bar?.clientWidth || 0,
        paintedCount: snapshot.nativeBottomBarUiPaintedTextCount || 0,
        paintedValues: snapshot.nativeBottomBarUiPaintedTextValues || [],
        scrollWidth: bar?.scrollWidth || 0,
        labelCount: labels.filter(node => getComputedStyle(node).display !== 'none').length,
        actions: Array.from(bar?.querySelectorAll('button[data-world-action]') || []).map(node => node.dataset.worldAction),
        rect: (() => {
          const r = bar?.getBoundingClientRect();
          return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
        })()
      };
    });
    expect(mobile.barWidth).toBeGreaterThan(0);
    expect(mobile.scrollWidth).toBeGreaterThanOrEqual(mobile.barWidth);
    expect(mobile.labelCount).toBeGreaterThanOrEqual(4);
    expect(mobile.actions).toHaveLength(6);
    expect(mobile.paintedCount).toBe(6);
    expect(mobile.paintedValues).toEqual(expect.arrayContaining(['World', 'Inventory', 'Journal', 'Map', 'Combat', 'Settings']));
    await page.evaluate(() => {
      const bar = document.querySelector('.lws-bottom-bar');
      if (bar) {
        bar.scrollLeft = Math.min(120, bar.scrollWidth - bar.clientWidth);
        bar.dispatchEvent(new Event('scroll'));
      }
    });
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeBottomBarUiScrollLeft || 0)).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeBottomBarUi)).toBe(true);
    const clipped = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const mask = snapshot.nativeBottomBarUiMaskBounds;
      const scene = snapshot.nativeBottomBarUiSceneSize;
      const sx = scene.width / Math.max(1, window.innerWidth);
      const sy = scene.height / Math.max(1, window.innerHeight);
      const bar = document.querySelector('.lws-bottom-bar')?.getBoundingClientRect();
      const controls = snapshot.nativeBottomBarUiControlBounds || [];
      return {
        maskMode: snapshot.nativeBottomBarUiMaskMode,
        filterActive: snapshot.nativeBottomBarUiMaskFilterActive,
        mask,
        controlCount: controls.length,
        hasOffscreenControl: controls.some(rect =>
          rect.x < mask.x - 1 || rect.x + rect.width > mask.x + mask.width + 1
        ),
        maskMatchesDom: Boolean(bar && mask &&
          Math.abs(mask.x - bar.left * sx) < 1 &&
          Math.abs(mask.y - bar.top * sy) < 1 &&
          Math.abs(mask.width - bar.width * sx) < 1 &&
          Math.abs(mask.height - bar.height * sy) < 1
        )
      };
    });
    expect(clipped.controlCount).toBe(6);
    expect(clipped.hasOffscreenControl).toBe(true);
    expect(clipped.maskMatchesDom).toBe(true);
    expect(['webgl-filter', 'canvas-geometry']).toContain(clipped.maskMode);
    if (clipped.maskMode === 'webgl-filter') expect(clipped.filterActive).toBe(true);
  });

  test('inventory overlay reads real saved quantities without changing inventory or leaving the world', async ({ page }) => {
    await enterAshmere(page, 'PackReader');
    const before = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.inventory.roadHerb = 2;
      player.inventory.clothScrap = 1;
      player.inventory.potion = 1;
      player.inventory.roadToken = 1;
      player.inventory.bellFragment = 1;
      player.inventory.food = 1;
      player.weapon = 'woodenSword';
      player.armor = 'clothArmor';
      window.LegendStorage.savePlayer(player);
      return {
        roadHerb: player.inventory.roadHerb,
        clothScrap: player.inventory.clothScrap,
        potion: player.inventory.potion,
        roadToken: player.inventory.roadToken,
        bellFragment: player.inventory.bellFragment,
        food: player.inventory.food,
        weapon: player.weapon,
        armor: player.armor
      };
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.lws-bottom-bar [data-world-action="inventory"]').click();
    const dialog = page.getByRole('dialog', { name: 'Inventory' });
    await expect(dialog).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const modalBounds = await dialog.boundingBox();
    expect(modalBounds.x).toBeGreaterThanOrEqual(0);
    expect(modalBounds.x + modalBounds.width).toBeLessThanOrEqual(390);
    await expect(dialog.locator('.lws-modal-emblem')).toHaveClass(/runway-icon-traveler/);
    await expect(dialog).toContainText('Road Herb');
    await expect(dialog).toContainText('Carried: 2');
    await expect(dialog).toContainText('Cloth Scrap');
    await expect(dialog.locator('.lws-equipped-art')).toHaveCount(2);

    const itemArt = await dialog.locator('img.lws-item-art').evaluateAll(images =>
      images.map(image => image.getAttribute('src'))
    );
    for (const asset of [
      'assets/generated/items/road-herbs.webp',
      'assets/generated/items/materials/trade-bundle.webp',
      'assets/generated/items/healing-potion.webp',
      'assets/generated/items/road-token.webp',
      'assets/generated/items/bell-fragment.webp',
      'assets/generated/items/ration-bundle.webp'
    ]) {
      expect(itemArt, 'missing illustration ' + asset).toContain(asset);
      const response = await page.request.get('/' + asset);
      expect(response.status(), asset).toBe(200);
      expect(response.headers()['content-type'] || '', asset).toContain('image/webp');
    }

    const equipmentArt = await dialog.locator('img.lws-equipped-art').evaluateAll(images =>
      images.map(image => image.getAttribute('src'))
    );
    expect(equipmentArt).toContain('assets/generated/items/short-sword.webp');
    expect(equipmentArt).toContain('assets/generated/items/armor/cloth-armor.webp');
    await expect(page.locator('.ash100-town')).toBeVisible();

    await dialog.getByRole('button', { name: /Return to the world/i }).click();
    await expect(dialog).toHaveCount(0);
    const after = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return {
        roadHerb: player.inventory.roadHerb,
        clothScrap: player.inventory.clothScrap,
        potion: player.inventory.potion,
        roadToken: player.inventory.roadToken,
        bellFragment: player.inventory.bellFragment,
        food: player.inventory.food,
        weapon: player.weapon,
        armor: player.armor
      };
    });
    expect(after).toEqual(before);
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('saved traveler retains a high-contrast Continue Journey action on the title screen', async ({ page }) => {
    await enterAshmere(page, 'ContinueButtonContrastQA');
    await page.evaluate(() => window.LegendGameBootstrap.title());
    const continueButton = page.locator('#continue.v136-menu-primary');
    await expect(continueButton).toBeVisible();
    const cta = await continueButton.evaluate(button => {
      const style = getComputedStyle(button);
      return { background: style.backgroundImage, color: style.color, opacity: style.opacity };
    });
    expect(cta.background).toContain('255, 230, 161');
    expect(cta.background).toContain('220, 168, 80');
    expect(cta.color).toBe('rgb(36, 23, 7)');
    expect(cta.opacity).toBe('1');
  });

  test('Old Road shell actions open the existing field journal and do not replace expedition state', async ({ page }) => {
    await enterAshmere(page, 'RoadShellTraveler');
    await seedRoad(page, 1, 'ridge');
    const before = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return {
        stage: player.flags.roadExpeditionV100.stage,
        route: player.flags.roadExpeditionV100.routeChoice,
        gold: player.gold,
        food: player.inventory.food
      };
    });

    await expect(page.locator('#lws-current-location')).toContainText('Old Road');
    await expect(page.locator('#lws-panel-right')).toContainText('Road map');
    await expect(page.locator('#lws-panel-right')).toContainText('Field journal');
    await page.locator('.lws-bottom-bar [data-world-action="journal"]').click();
    await expect(page.locator('#exp150Modal')).toBeVisible();
    await expect(page.locator('#exp150Modal').getByRole('dialog')).toBeVisible();

    const after = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return {
        stage: player.flags.roadExpeditionV100.stage,
        route: player.flags.roadExpeditionV100.routeChoice,
        gold: player.gold,
        food: player.inventory.food
      };
    });
    expect(after).toEqual(before);
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();
  });

  test('real opening combat retains its native commands inside the contextual shell', async ({ page }) => {
    await enterAshmere(page, 'CombatShellTraveler');
    await page.evaluate(() => window.LegendRoadControllerV100.startOpeningEncounter());
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context', 'combat');
    await expect(page.locator('#lws-panel-right')).toContainText('Encounter in progress');
    await expect(page.locator('#strike')).toBeVisible();
    await expect(page.locator('#skill')).toBeVisible();
    const battleVisual = await page.evaluate(() => ({
      battle: getComputedStyle(document.querySelector('.rpg-battle')).backgroundImage,
      field: getComputedStyle(document.querySelector('.rpg-battlefield')).backgroundImage,
      filter: getComputedStyle(document.querySelector('.rpg-battlefield')).filter,
      dialogue: getComputedStyle(document.querySelector('.rpg-dialogue')).backgroundImage,
      dialogueText: getComputedStyle(document.querySelector('.rpg-dialogue p')).color,
      command: getComputedStyle(document.querySelector('.rpg-command')).backgroundImage
    }));
    expectBackgroundAlphaAtMost(battleVisual.battle, 0.74);
    expect(battleVisual.field).toContain('old-road-south-fork.webp');
    expect(battleVisual.filter).toContain('brightness(1.22)');
    expectBackgroundAlphaAtMost(battleVisual.dialogue, 0.86);
    expect(battleVisual.dialogueText).toBe('rgb(240, 234, 223)');
    expectBackgroundAlphaAtMost(battleVisual.command, 0.84);

    await page.locator('.lws-bottom-bar [data-world-action="combat"]').click();
    const dialog = page.getByRole('dialog', { name: 'Combat encounter' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('The fight is underway');
    await dialog.getByRole('button', { name: /Return to encounter/i }).click();
    await expect(page.locator('#skill')).toBeEnabled();
    await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context', 'combat');
  });

  test('secured expedition report keeps its real return action without duplicate labels', async ({ page }) => {
    await enterAshmere(page, 'ReportShellTraveler');
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.flags = player.flags || {};
      player.flags.roadExpeditionV100 = {
        stage: 5, pressure: 16, trips: 1, routeChoice: 'ridge', events: 0, finds: 0, battles: 0
      };
      player.flags.roadFieldJournalV150 = {
        visitedPlaces: ['South Fork', 'Wayfarer’s Camp'],
        discoveries: [], routes: [], campReports: []
      };
      player.flags.firstRoadReturnSeen = true;
      player.flags.firstRoadReturnMaraBriefed = false;
      window.LegendStorage.savePlayer(player);

      const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[character]));
      const view = window.LegendRoadResultsViewV100.create({
        renderHeader: (_player, _state, _kicker, title) => '<header class="exp100-head"><h1>' + escapeHtml(title) + '</h1></header>',
        renderShell: html => { document.getElementById('root').innerHTML = html; },
        escapeHtml,
        onReturn: () => window.LegendAshmereV099.renderAshmere(),
        onReportToMara: () => window.LegendAshmereV099.route('mara')
      });
      view.render({
        player,
        state: player.flags.roadExpeditionV100,
        kicker: 'Return',
        title: 'Expedition Secured',
        text: 'Your route notes are saved.',
        details: {
          type: 'expedition', complete: true, stagesCompleted: 5, rewardGold: 130,
          roadTokens: 1, xpGained: 20, levelsGained: 0, levelBefore: 1, levelAfter: 1,
          routeName: 'High Ridge', discoveriesThisTrip: 0, campsThisTrip: 0,
          pressureBefore: 16, pressureAfter: 5, trip: 1
        }
      });
    });

    await expect(page.locator('.exp150-return-report')).toBeVisible();
    const tokenArt = page.locator('.v152-expedition-reward-tile.is-rare .v152-expedition-reward-art');
    await expect(tokenArt).toHaveAttribute('src', 'assets/generated/items/road-token.webp');
    await expect.poll(() => tokenArt.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context', 'expedition-results');
    await expect(page.getByRole('button', { name: /Return to Ashmere/i })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Report to Mara/i })).toHaveCount(1);
    await page.locator('#lws-panel-right [data-world-action="expedition-return"]').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context', 'town');
  });

  test('settings persist through the existing store and combat stays unavailable until an encounter is active', async ({ page }) => {
    await enterAshmere(page, 'OverlayTraveler');
    await page.locator('.lws-bottom-bar [data-world-action="settings"]').click();
    const dialog = page.getByRole('dialog', { name: 'Settings' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.lws-modal-emblem')).toHaveClass(/runway-icon-settings/);
    const reducedMotion = dialog.locator('[data-world-setting="reducedMotion"]');
    const original = await reducedMotion.isChecked();
    await reducedMotion.setChecked(!original);
    await expect.poll(() => page.evaluate(() => window.LegendStorage.loadSettings().reducedMotion)).toBe(!original);
    await dialog.getByRole('button', { name: /Return to the world/i }).click();

    const playerBefore = await page.evaluate(() => window.LegendStorage.loadPlayer());
    const combatButton = page.locator('.lws-bottom-bar [data-world-action="combat"]');
    await expect(combatButton).toBeDisabled();
    await expect(page.locator('.rpg-battle')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const playerAfter = await page.evaluate(() => window.LegendStorage.loadPlayer());
    expect(playerAfter).toEqual(playerBefore);
    await expectNoHorizontalOverflow(page);
  });

  test('compact shell drawers and bottom actions fit a 390px touch viewport', async ({ page }) => {
    await enterAshmere(page, 'MobileShellTraveler');
    await page.setViewportSize({ width: 390, height: 844 });
    const rightToggle = page.locator('.lws-mobile-toggle[data-world-action="toggle-right"]');
    const leftToggle = page.locator('.lws-mobile-toggle[data-world-action="toggle-left"]');
    const leftPanel = page.locator('.lws-panel-left');
    const rightPanel = page.locator('.lws-panel-right');
    await expect(rightToggle).toBeVisible();
    await expect(rightPanel).not.toBeInViewport();
    await expect(rightPanel).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => rightPanel.evaluate(panel => panel.inert)).toBe(true);
    await rightToggle.click();
    await expect(page.locator('body')).toHaveClass(/legend-shell-right-open/);
    await expect(rightToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(rightPanel).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => rightPanel.evaluate(panel => panel.inert)).toBe(false);
    await expect(rightPanel).toBeInViewport();
    await expectNoHorizontalOverflow(page);
    await leftToggle.click();
    await expect(page.locator('body')).toHaveClass(/legend-shell-left-open/);
    await expect(leftToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(rightToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(leftPanel).toBeInViewport();
    await expectNoHorizontalOverflow(page);
    await leftPanel.locator('[data-world-action="journal"]').focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveClass(/legend-shell-left-open/);
    await expect(leftToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(rightToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(leftToggle).toBeFocused();
    await expect(leftPanel).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => leftPanel.evaluate(panel => panel.inert)).toBe(true);
    await expect(leftPanel).not.toBeInViewport();
  });

  test('Ashmere destination board is Phaser-painted while real town actions and fallback remain usable', async ({ page }) => {
    await enterAshmere(page, 'AshmereBoardQA');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1?.snapshot?.()?.nativeTownBoardUi
    )).toBe(true);

    const initial = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const section = document.querySelector('.ash100-destination-section');
      return {
        active: snapshot.nativeTownBoardUi,
        textCount: snapshot.nativeTownBoardUiTextCount,
        text: snapshot.nativeTownBoardUiTextValues || [],
        ids: snapshot.nativeTownBoardUiControlIds || [],
        cards: snapshot.nativeTownBoardUiCards || [],
        heading: section?.querySelector('h2')?.textContent || '',
        iconCount: section?.querySelectorAll('.ash100-destination-icon').length || 0
      };
    });
    expect(initial.active).toBe(true);
    expect(initial.textCount).toBeGreaterThanOrEqual(26);
    expect(initial.text).toEqual(expect.arrayContaining([
      'ASHMERE', 'Where next?', 'Ashmere Inn', 'Market', 'Forge & Workshop',
      'Town Square', 'Work Board', 'Daily Field Board', 'Old Road Gate', 'Road Network'
    ]));
    expect(initial.ids).toEqual(['inn','trader','smith','people','work','quests','road','regions']);
    expect(initial.cards).toHaveLength(8);
    expect(initial.iconCount).toBe(8);
    expect(initial.cards.every(card => card.width > 0 && card.height > 0 && card.title && card.action)).toBe(true);
    await page.locator('.ash100-destination[data-ash-view="inn"]').hover();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUiCards.find(card => card.id === 'inn')?.hovered
    )).toBe(true);
    expect(await page.locator('.ash100-destination-copy strong').first().evaluate(node =>
      getComputedStyle(node).color
    )).toBe('rgba(0, 0, 0, 0)');

    // A missing destination forces the full styled DOM board back on-screen.
    const fallback = await page.evaluate(() => {
      const section = document.querySelector('.ash100-destination-section');
      const button = section.querySelector('[data-ash-view="regions"]');
      const parent = button.parentNode;
      const next = button.nextSibling;
      button.remove();
      window.LegendPhaserWorldV1.refreshTownBoard();
      const result = {
        active: window.LegendPhaserWorldV1.snapshot().nativeTownBoardUi,
        titleColor: getComputedStyle(section.querySelector('.ash100-destination-copy strong')).color
      };
      parent.insertBefore(button, next);
      window.LegendPhaserWorldV1.refreshTownBoard();
      return result;
    });
    expect(fallback.active).toBe(false);
    expect(fallback.titleColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUi
    )).toBe(true);

    // The Bell Cellar appears only after the existing progression flag is set.
    await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      player.flags = player.flags || {};
      player.flags.firstRoadReturnSeen = true;
      window.LegendStorage.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
    });
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUiCards.length
    )).toBe(9);
    const unlocked = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeTownBoardUiCards);
    expect(unlocked.map(card => card.id)).toContain('dungeon');
    expect(unlocked.find(card => card.id === 'dungeon')?.title).toBe('The Bell Cellar');
    expect(await page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUiExpectedIds
    )).toEqual(['inn','trader','smith','people','work','dungeon','quests','road','regions']);

    // The unlocked board must fall back if its progression-only Bell Cellar card is missing.
    const unlockedFallback = await page.evaluate(() => {
      const section = document.querySelector('.ash100-destination-section');
      const cellar = section.querySelector('[data-ash-view="dungeon"]');
      const parent = cellar.parentNode;
      const next = cellar.nextSibling;
      cellar.remove();
      window.LegendPhaserWorldV1.refreshTownBoard();
      const result = {
        active: window.LegendPhaserWorldV1.snapshot().nativeTownBoardUi,
        titleColor: getComputedStyle(section.querySelector('.ash100-destination-copy strong')).color
      };
      parent.insertBefore(cellar, next);
      window.LegendPhaserWorldV1.refreshTownBoard();
      return result;
    });
    expect(unlockedFallback.active).toBe(false);
    expect(unlockedFallback.titleColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUi
    )).toBe(true);

    // The live destination buttons still call the original market and work-board routes.
    await page.locator('.ash100-destination[data-ash-view="trader"]').click();
    await expect(page.locator('.ash099-market-console')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trading Post' })).toBeVisible();
    await page.locator('#ashBack').click();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUi
    )).toBe(true);
    await page.locator('.ash100-destination[data-ash-view="work"]').click();
    await expect(page.locator('.ash099-job-board')).toBeVisible();
    await expect(page.locator('#openDailyFieldBoard')).toBeVisible();
    await page.locator('#ashBack').click();
    await expect(page.locator('.ash100-town-ashmere')).toBeVisible();

    // A forced Phaser text-construction error must restore the entire DOM board.
    const paintError = await page.evaluate(() => {
      const Factory = window.Phaser?.GameObjects?.GameObjectFactory;
      const prototype = Factory?.prototype;
      const originalText = prototype?.text;
      if (typeof originalText !== 'function') return { supported: false };
      const section = document.querySelector('.ash100-destination-section');
      const description = section.querySelector('.ash100-destination-copy small');
      const originalDescription = description.textContent;
      prototype.text = function () { throw new Error('Forced Ashmere painter failure test'); };
      let result;
      try {
        description.textContent = originalDescription + ' · test repaint';
        window.LegendPhaserWorldV1.refreshTownBoard();
        result = {
          active: window.LegendPhaserWorldV1.snapshot().nativeTownBoardUi,
          titleColor: getComputedStyle(section.querySelector('.ash100-destination-copy strong')).color
        };
      } finally {
        prototype.text = originalText;
        description.textContent = originalDescription;
        window.LegendPhaserWorldV1.refreshTownBoard();
      }
      return { supported: true, ...result };
    });
    expect(paintError.supported).toBe(true);
    expect(paintError.active).toBe(false);
    expect(paintError.titleColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUi
    )).toBe(true);

    // Under a continuous scroll burst, Phaser updates each frame rather than
    // waiting for scrolling to stop; its label bounds must track real buttons.
    const scrollAlignment = await page.evaluate(async () => {
      const scroller = document.scrollingElement;
      const maxScroll = Math.max(0, scroller.scrollHeight - window.innerHeight);
      if (maxScroll < 32) return { scrollable: false };
      for (let step = 1; step <= 12; step += 1) {
        scroller.scrollTop = maxScroll * step / 12;
        window.dispatchEvent(new Event('scroll'));
      }
      await new Promise(resolve => requestAnimationFrame(resolve));
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const button = document.querySelector('.ash100-destination[data-ash-view="inn"]');
      const dom = button.getBoundingClientRect();
      const painted = snapshot.nativeTownBoardUiCards.find(card => card.id === 'inn');
      const sx = snapshot.nativeTownBoardUiSceneSize.width / window.innerWidth;
      const sy = snapshot.nativeTownBoardUiSceneSize.height / window.innerHeight;
      return {
        scrollable: true,
        xDelta: Math.abs(painted.x - dom.left * sx),
        yDelta: Math.abs(painted.y - dom.top * sy)
      };
    });
    expect(scrollAlignment.scrollable).toBe(true);
    expect(scrollAlignment.xDelta).toBeLessThan(2);
    expect(scrollAlignment.yDelta).toBeLessThan(2);

    // Focus remains on the real DOM button while its visible focus state is painted in Phaser.
    await page.setViewportSize({ width: 390, height: 844 });
    const inn = page.locator('.ash100-destination[data-ash-view="inn"]');
    await inn.focus();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUiCards.find(card => card.id === 'inn')?.focused
    )).toBe(true);
    const townFocusStyle = await inn.evaluate(node => ({
      outlineColor: getComputedStyle(node).outlineColor,
      outlineStyle: getComputedStyle(node).outlineStyle
    }));
    expect(townFocusStyle).toEqual({ outlineColor: 'rgb(255, 230, 160)', outlineStyle: 'solid' });
    await expectNoHorizontalOverflow(page);
    const mobile = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      board: document.querySelector('.ash100-destination-section')?.getBoundingClientRect().width || 0,
      cardCount: window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUiCards.length || 0
    }));
    expect(mobile.board).toBeGreaterThan(0);
    expect(mobile.cardCount).toBe(9);
  });

  test('Ashmere POI selection updates the contextual scene without changing saved gameplay state', async ({ page }) => {
    await enterAshmere(page, 'AshmerePOITraveler');
    const before = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return JSON.stringify({
        username: player.username,
        hp: player.hp,
        gold: player.gold,
        inventory: player.inventory,
        flags: player.flags,
        quests: player.questLog
      });
    });

    await expect(page.locator('.lws-panel-right [data-world-place]')).toHaveCount(4);
    const placeIcons = await page.locator('.lws-panel-right .lws-place-option-icon').evaluateAll(nodes => nodes.map(node => ({
      classes: Array.from(node.classList).filter(name => name.startsWith('runway-icon-')),
      size: Math.max(node.getBoundingClientRect().width, node.getBoundingClientRect().height),
      backgroundImage: getComputedStyle(node).backgroundImage
    })));
    expect(placeIcons).toHaveLength(4);
    expect(new Set(placeIcons.map(icon => icon.classes[0])).size).toBe(4);
    expect(placeIcons.every(icon => {
      const name = icon.classes[0].replace('runway-icon-', '');
      return icon.size <= 32 && icon.backgroundImage.includes('legend-icon-' + name + '.webp');
    })).toBe(true);
    await page.locator('.lws-panel-right [data-world-place="market"]').click();
    await expect(page.locator('.lws-panel-right [data-world-place="market"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.lws-selected-place h3')).toHaveText('Market');
    await expect(page.locator('.lws-selected-place')).toContainText('Trade for provisions and sell what you have brought back from the road.');
    await expect(page.locator('.lws-poi-scene-note')).toContainText('Market');
    await expect(page.locator('.lws-poi-scene-note')).toContainText('TRADE & SUPPLIES');
    await expect(page.locator('.ash100-town-ashmere .ash100-destination[data-ash-view="trader"]')).toHaveClass(/lws-poi-active/);
    await expect(page.locator('.ash100-town')).toBeVisible();

    const afterSelect = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return JSON.stringify({
        username: player.username,
        hp: player.hp,
        gold: player.gold,
        inventory: player.inventory,
        flags: player.flags,
        quests: player.questLog
      });
    });
    expect(afterSelect).toBe(before);

    await page.locator('.lws-panel-right [data-world-action="visit-selected-place"]').click();
    await expect(page.locator('.ash099-screen')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toHaveAttribute('data-context', 'service');
    await page.locator('.lws-bottom-bar [data-world-action="world"]').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.locator('.lws-panel-right [data-world-place="market"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.lws-poi-scene-note')).toContainText('Market');
  });

  test('Ashmere POI selection remains keyboard reachable and fits a narrow screen', async ({ page }) => {
    await enterAshmere(page, 'AshmerePOIMobile');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.lws-mobile-toggle[data-world-action="toggle-right"]').click();
    const inn = page.locator('.lws-panel-right [data-world-place="inn"]');
    await expect(inn).toBeVisible();
    await inn.focus();
    await page.keyboard.press('Enter');
    await expect(inn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.lws-poi-scene-note')).toContainText('Ashmere Inn');
    await expectNoHorizontalOverflow(page);
    await page.locator('.lws-panel-right [data-world-action="visit-selected-place"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ash099-screen')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });


  test('Old Road shell actions use distinct local Runway raster icons', async ({ page }) => {
    await enterAshmere(page, 'OldRoadRunwayIcons');
    await seedRoad(page, 1, 'ridge');

    const iconSnapshot = await page.locator('#lws-panel-right [data-world-action] .lws-btn-icon.runway-icon').evaluateAll(nodes =>
      nodes.map(node => {
        const action = node.closest('[data-world-action]')?.getAttribute('data-world-action') || '';
        const iconClass = Array.from(node.classList).find(name => name.startsWith('runway-icon-')) || '';
        const bounds = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          action, iconClass, width: bounds.width, height: bounds.height,
          overflow: style.overflow, backgroundImage: style.backgroundImage,
          hasText: Boolean(node.textContent.trim())
        };
      })
    );

    const expected = {
      'continue-road': 'runway-icon-road',
      'search-road': 'runway-icon-compass',
      'read-road': 'runway-icon-journal',
      map: 'runway-icon-compass',
      journal: 'runway-icon-journal'
    };
    for (const [action, iconClass] of Object.entries(expected)) {
      const icon = iconSnapshot.find(item => item.action === action);
      expect(icon, 'missing Runway icon for ' + action).toBeTruthy();
      expect(icon.iconClass).toBe(iconClass);
      expect(icon.width).toBe(20);
      expect(icon.height).toBe(20);
      expect(icon.overflow).toBe('hidden');
      expect(icon.backgroundImage).toContain('legend-icon-' + iconClass.replace('runway-icon-', '') + '.webp');
      expect(icon.hasText).toBe(false);
    }

    expect(new Set(iconSnapshot.map(icon => icon.iconClass)).size).toBeGreaterThanOrEqual(3);

    const bottomIcons = await page.locator('.lws-bottom-bar [data-world-action] .lws-btn-icon.runway-icon').evaluateAll(nodes =>
      nodes.map(node => {
        const action = node.closest('[data-world-action]')?.getAttribute('data-world-action') || '';
        const iconClass = Array.from(node.classList).find(name => name.startsWith('runway-icon-')) || '';
        const bounds = node.getBoundingClientRect();
        return { action, iconClass, width: bounds.width, height: bounds.height, backgroundImage: getComputedStyle(node).backgroundImage };
      })
    );
    expect(bottomIcons).toHaveLength(6);
    expect(new Set(bottomIcons.map(icon => icon.iconClass)).size).toBe(6);
    for (const icon of bottomIcons) {
      expect(icon.width).toBe(20);
      expect(icon.height).toBe(20);
      expect(icon.backgroundImage).toContain('legend-icon-' + icon.iconClass.replace('runway-icon-', '') + '.webp');
    }
    await expectNoHorizontalOverflow(page);
  });


  test('combat and world-notice overlays show different generated emblems', async ({ page }) => {
    await enterAshmere(page, 'ModalEmblemQA');
    await page.setViewportSize({ width: 390, height: 844 });

    await page.evaluate(() => window.LegendWorldShellModalsV170.openCombat());
    const combatDialog = page.getByRole('dialog', { name: 'No active encounter' });
    await expect(combatDialog).toBeVisible();
    await expect(combatDialog.locator('.lws-modal-emblem')).toHaveClass(/runway-icon-milestone/);
    const combatBackground = await combatDialog.locator('.lws-modal-emblem').evaluate(node => getComputedStyle(node).backgroundImage);
    expect(combatBackground).toContain('legend-icon-milestone.webp');
    await expectNoHorizontalOverflow(page);
    await combatDialog.getByRole('button', { name: 'Close panel' }).click();
    await expect(combatDialog).toHaveCount(0);

    await page.evaluate(() => window.LegendWorldShellModalsV170.openNotice(
      'A Saved Lead', 'Field note', 'The record is preserved in your journal.'
    ));
    const noticeDialog = page.getByRole('dialog', { name: 'A Saved Lead' });
    await expect(noticeDialog).toBeVisible();
    await expect(noticeDialog.locator('.lws-modal-emblem')).toHaveClass(/runway-icon-road/);
    const noticeBackground = await noticeDialog.locator('.lws-modal-emblem').evaluate(node => getComputedStyle(node).backgroundImage);
    expect(noticeBackground).toContain('legend-icon-road.webp');
    const bounds = await noticeDialog.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    await expectNoHorizontalOverflow(page);
  });

  test('world-scene backdrops stay readable in Ashmere and on the Old Road', async ({ page }) => {
    await enterAshmere(page, 'SceneBrightnessQA');

    const town = await page.evaluate(() => ({
      filter: getComputedStyle(document.body, '::before').filter,
      vignette: getComputedStyle(document.body, '::after').boxShadow,
      image: getComputedStyle(document.body, '::before').backgroundImage
    }));
    expect(town.filter).toContain('brightness(1.24)');
    expect(town.vignette).toContain('rgba(0, 0, 0, 0.035)');
    expect(town.image).toContain('ashmere-town.webp');

    // A town service used to paint a near-black terminal over the world image.
    await page.locator('.lws-panel-right [data-world-place="inn"]').click();
    await page.locator('.lws-panel-right [data-world-action="visit-selected-place"]').click();
    await expect(page.locator('.ash099-screen')).toBeVisible();
    const service = await page.evaluate(() => ({
      terminal: getComputedStyle(document.querySelector('.ash099-terminal')).backgroundColor,
      screen: getComputedStyle(document.querySelector('.ash099-screen')).backgroundImage
    }));
    expect(service.terminal).toBe('rgba(0, 0, 0, 0)');
    expect(service.screen).toContain('0.24');
    expect(service.screen).toContain('0.16');

    await seedRoad(page, 1, 'ridge');
    const road = await page.evaluate(() => {
      const shell = document.getElementById('legend-world-shell-root');
      const world = document.querySelector('#root .exp100');
      const panel = document.querySelector('#root .exp100-head');
      return {
        filter: getComputedStyle(document.body, '::before').filter,
        vignette: getComputedStyle(document.body, '::after').boxShadow,
        image: getComputedStyle(document.body, '::before').backgroundImage,
        shellCanvas: getComputedStyle(shell).backgroundImage,
        shellCanvasColor: getComputedStyle(shell).backgroundColor,
        shellShade: getComputedStyle(shell, '::before').backgroundImage,
        worldWrapper: getComputedStyle(world).backgroundColor,
        contentPanel: getComputedStyle(panel).backgroundImage,
        forkPanel: getComputedStyle(document.querySelector('.exp150-world-page .exp100-choice')).backgroundImage
      };
    });
    expect(road.filter).toContain('brightness(1.22)');
    expect(road.vignette).toContain('rgba(0, 0, 0, 0.035)');
    expect(road.image).toContain('location_old_road_main_v1.jpg');
    expectBackgroundAlphaAtMost(road.shellCanvas, 0.08);
    expect(road.shellCanvasColor).toBe('rgba(0, 0, 0, 0)');
    expectBackgroundAlphaAtMost(road.shellShade, 0.04);
    expect(road.worldWrapper).toBe('rgba(0, 0, 0, 0)');
    expectBackgroundAlphaAtMost(road.contentPanel, 0.76);
    expectBackgroundAlphaAtMost(road.forkPanel, 0.84);
    await expectNoHorizontalOverflow(page);
  });

});
