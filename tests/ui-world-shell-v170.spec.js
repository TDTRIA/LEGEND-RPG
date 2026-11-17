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
  expect(titleBackdropFilter).toContain('brightness(0.76)');
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi)).toBe(false);
  const titleSceneOverlay = await page.locator('.title-v136-rpg')
    .evaluate(element => getComputedStyle(element, '::after').backgroundImage);
  expectBackgroundAlphaAtMost(titleSceneOverlay, 0.9);
  expect(titleSceneOverlay).not.toContain('rgba(2, 5, 3, 0.94)');
}

async function enterAshmere(page, name = 'WorldShellQA') {
  await openTitle(page, page.viewportSize() || { width: 1440, height: 900 });
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
  await expect(page.locator('#legend-world-shell-root')).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/legend-world-shell-active/);
  await expect(page.locator('.ashmere-hub-v240')).toBeVisible();
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
  test('stays off title and creation, and is retired from the new Ashmere refuge', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();

    await enterAshmere(page, 'ShellTraveler');
    const player = await page.evaluate(() => window.LegendStorage.loadPlayer());
    const hub = page.locator('.ashmere-hub-v240');
    await expect(hub).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/legend-world-shell-active/);
    await expect(hub.locator('.ashmere-hub-v240-traveler')).toContainText(player.username);
    await expect(hub.locator('.ashmere-hub-v240-traveler')).toContainText(String(player.gold));
    await expect(hub.locator('.ashmere-hub-v240-field-order')).not.toBeEmpty();
    await expect(hub.locator('.ashmere-hub-v240-gate')).toBeVisible();

    await page.evaluate(() => {
      const saved = window.LegendStorage.loadPlayer();
      saved.flags = saved.flags || {};
      saved.flags.firstRoadReturnSeen = true;
      window.LegendStorage.savePlayer(saved);
      window.LegendAshmereV099.renderAshmere();
    });
    await hub.locator('#ashmereHubMoreToggle').click();
    await expect(hub.locator('.ashmere-hub-v240-more-place[data-ash-view="dungeon"]')).toContainText('The Bell Cellar');
    await expect(hub.locator('.ashmere-hub-v240-more-place[data-ash-view="routes"]')).toBeVisible();
    await expect(hub.locator('.ashmere-hub-v240-more-place[data-ash-view="archive"]')).toBeVisible();
    await expect(hub.locator('.ashmere-hub-v240-more-place[data-ash-view="profile"]')).toBeVisible();
    await expect(hub.locator('.ashmere-hub-v240-more-place[data-ash-view="sheet"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('Ashmere traveler tools preserve inventory, settings and local save access without the shell', async ({ page }) => {
    await page.setViewportSize({width:390,height:844});
    await enterAshmere(page,'AshmereToolsQA');
    const hub=page.locator('.ashmere-hub-v240');
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();
    await hub.locator('#ashmereHubMoreToggle').click();
    const tools=hub.locator('.ashmere-hub-v240-utilities');
    await expect(tools).toBeVisible();
    await expect(tools.getByRole('button',{name:/Pack & inventory/i})).toBeVisible();
    await expect(tools.getByRole('button',{name:/Settings/i})).toBeVisible();
    await expect(tools.getByRole('button',{name:/Save traveler/i})).toBeVisible();

    const before=await page.evaluate(()=>JSON.stringify(window.LegendStorage.loadPlayer()));
    await tools.getByRole('button',{name:/Save traveler/i}).click();
    await expect(hub.locator('#ashmereHubUtilityStatus')).toHaveText('Traveler record saved locally.');
    expect(await page.evaluate(()=>JSON.stringify(window.LegendStorage.loadPlayer()))).toBe(before);

    await tools.getByRole('button',{name:/Pack & inventory/i}).click();
    const inventory=page.getByRole('dialog',{name:'Inventory'});
    await expect(inventory).toBeVisible();
    await expect(inventory).toContainText('Carried:');
    await inventory.getByRole('button',{name:/Return to the world/i}).click();
    await expect(inventory).toBeHidden();
    await expect(hub).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();

    await tools.getByRole('button',{name:/Settings/i}).click();
    const settings=page.getByRole('dialog',{name:'Settings'});
    await expect(settings).toBeVisible();
    const reduced=settings.locator('[data-world-setting="reducedMotion"]');
    const original=await reduced.isChecked();
    await reduced.setChecked(!original);
    await expect.poll(()=>page.evaluate(()=>window.LegendStorage.loadSettings().reducedMotion)).toBe(!original);
    await settings.getByRole('button',{name:/Return to the world/i}).click();
    await expect(settings).toBeHidden();
    await expect(hub).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('Ashmere place buttons use the real service routes without a contextual shell', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterAshmere(page, 'PhaserContextQA');
    const hub = page.locator('.ashmere-hub-v240');
    await expect(hub.locator('.ashmere-hub-v240-place')).toHaveCount(4);
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.nativeTownBoardUi)).toBe(false);
    await expect(page.locator('body')).not.toHaveClass(/legend-phaser-town-board-ui-active/);

    const playerBefore = await page.evaluate(() => JSON.stringify(window.LegendStorage.loadPlayer()));
    await hub.locator('.ashmere-hub-v240-place[data-ash-view="trader"]').click();
    await expect(page.locator('.ash099-market-console')).toBeVisible();
    await expect(page.locator('#root').getByRole('heading', { name: 'Trading Post', exact: true })).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();
    const playerAfter = await page.evaluate(() => JSON.stringify(window.LegendStorage.loadPlayer()));
    expect(playerAfter).toBe(playerBefore);
    await expectNoHorizontalOverflow(page);
  });

  test('Phaser contextual action drawer tracks Old Road actions and remains a real mobile drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enterAshmere(page, 'MobilePhaserContextQA');
    await seedRoad(page, 1, 'ridge');
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
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterAshmere(page, 'PhaserJournalQA');
    await seedRoad(page, 1, 'ridge');
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
        paintedLabels: snapshot.nativeLeftDrawerLabels.map(item => item.sourceText),
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
    // Native content is grouped inside its scroll-mask container. Count actual
    // painted labels recursively, rather than only top-level scene objects.
    expect(desktop.objectCount).toBeGreaterThan(0);
    expect(desktop.paintedLabels).toEqual(expect.arrayContaining([
      'Traveler record', 'PhaserJournalQA', 'Vitality', 'Current lead', 'Quest log', 'Field journal', desktop.hp, desktop.gold
    ]));
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
    await expect(page.locator('#exp150Modal')).toBeVisible();
    await expect(page.locator('#exp150Modal').getByRole('dialog')).toBeVisible();
  });

  test('mobile journal drawer is DOM-backed while closed and Phaser-painted once opened', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enterAshmere(page, 'MobilePhaserJournalQA');
    await seedRoad(page, 1, 'ridge');
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
    await seedRoad(page, 1, 'ridge');
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
    await seedRoad(page, 1, 'ridge');
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
    test.setTimeout(120000);
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

      // Use the production settlement/view/return wiring, including its shell.
      window.LegendRoadControllerV100.renderExpedition();
    });
    await page.evaluate(() => {
      const originalRandom = Math.random;
      window.__legendSceneTransitionBypass = true;
      Math.random = () => 0.1;
      try { document.getElementById('finish').click(); }
      finally { Math.random = originalRandom; window.__legendSceneTransitionBypass = false; }
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
    await seedRoad(page, 1, 'ridge');
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
    await seedRoad(page, 1, 'ridge');
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

  test('Ashmere refuge keeps the destination catalog reachable without a town painter or shell', async ({ page }) => {
    await enterAshmere(page, 'AshmereBoardQA');
    const hub=page.locator('.ashmere-hub-v240');
    await expect(hub).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1?.snapshot?.()?.nativeTownBoardUi
    )).toBe(false);
    await expect(page.locator('body')).not.toHaveClass(/legend-phaser-town-board-ui-active/);
    await expect(hub.locator('.ashmere-hub-v240-place')).toHaveCount(4);
    const places=await hub.locator('.ashmere-hub-v240-place').evaluateAll(nodes=>nodes.map(node=>node.dataset.ashView));
    expect(places).toEqual(['inn','trader','smith','people']);

    await hub.locator('#ashmereHubMoreToggle').click();
    const more=hub.locator('.ashmere-hub-v240-more-place');
    await expect(more).toContainText('Work Board');
    await expect(more).toContainText('Daily Field Board');
    await expect(more).toContainText('Road Network');
    await expect(more).toContainText('Route Board');
    await expect(more).toContainText('Field Journal');
    await expect(more).toContainText('Profile & Account');
    await expect(more).toContainText('Traveler Record');

    await page.evaluate(() => {
      const player=window.LegendStorage.loadPlayer();
      player.flags=player.flags||{};
      player.flags.firstRoadReturnSeen=true;
      window.LegendStorage.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
    });
    await hub.locator('#ashmereHubMoreToggle').click();
    await expect(hub.locator('.ashmere-hub-v240-more-place[data-ash-view="dungeon"]')).toContainText('The Bell Cellar');

    const before=await page.evaluate(()=>JSON.stringify(window.LegendStorage.loadPlayer()));
    await hub.locator('.ashmere-hub-v240-place[data-ash-view="trader"]').click();
    await expect(page.locator('.ash099-market-console')).toBeVisible();
    expect(await page.evaluate(()=>JSON.stringify(window.LegendStorage.loadPlayer()))).toBe(before);
    await page.locator('#ashBack').click();
    await expect(page.locator('.ashmere-hub-v240')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();

    await page.locator('#ashmereHubMoreToggle').click();
    await page.locator('.ashmere-hub-v240-more-place[data-ash-view="work"]').click();
    await expect(page.locator('.ash099-job-board')).toBeVisible();
    await expect(page.locator('#openDailyFieldBoard')).toBeVisible();
  });

  test('Ashmere place selection stays keyboard reachable and fits a narrow screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await enterAshmere(page, 'AshmerePOIMobile');
    const hub=page.locator('.ashmere-hub-v240');
    await expect(hub).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();
    const inn=hub.locator('.ashmere-hub-v240-place[data-ash-view="inn"]');
    await inn.focus();
    await expect(inn).toBeFocused();
    await expect(inn).toHaveCSS('outline-style','solid');
    await page.keyboard.press('Enter');
    await expect(page.locator('#rest')).toBeVisible();
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
    await seedRoad(page, 1, 'ridge');
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

  test('Ashmere refuge and Old Road remain scene-led and readable', async ({ page }) => {
    await enterAshmere(page, 'SceneBrightnessQA');
    await expect(page.locator('.ashmere-hub-v240')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeHidden();

    const town = await page.evaluate(() => {
      const hub=document.querySelector('.ashmere-hub-v240');
      const image=hub?.querySelector('.ashmere-hub-v240-backdrop img');
      const atmosphere=hub?.querySelector('.ashmere-hub-v240-atmosphere');
      return {
        image:image?.currentSrc||'',
        opacity:image?getComputedStyle(image).opacity:'',
        atmosphere:atmosphere?getComputedStyle(atmosphere).backgroundImage:''
      };
    });
    expect(town.image).toContain('location_ashmere_mainstreet_v1.jpg');
    expect(town.opacity).toBe('0.3');
    expect(town.atmosphere).toContain('linear-gradient');

    // The new refuge still routes through the production Inn controller.
    await page.locator('.ashmere-hub-v240-place[data-ash-view="inn"]').click();
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

  test('Old Road shell actions retain the stone and sage state palette', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await enterAshmere(page, 'OptionFramePaletteQA');
    await seedRoad(page, 1, 'ridge');

    const snapshot = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
    expect(snapshot.nativeShellOptionFramePalette).toEqual({
      neutral: 0x72816f,
      hover: 0x9eae8e,
      focus: 0xb5d99a,
      normalAccent: 0x83947d,
      selectedAccent: 0xc8a96e,
      brandAccent: 0xe7c982
    });
    expect(snapshot.nativeRightDrawerUi).toBe(true);
    expect(snapshot.nativeRightDrawerUiControlIds.length).toBeGreaterThan(0);
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();
    await expect(page.locator('.exp150-world-page')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

});
