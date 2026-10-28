const { test, expect } = require('@playwright/test');

async function openTitle(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function enterAshmere(page, name = 'WorldShellQA') {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
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
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await expect(page.locator('#legend-world-shell-root')).toBeVisible();
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
    await expect(page.getByRole('button', { name: /Road Network/i })).toHaveCount(1);
    const viewportLayout = await page.evaluate(() => {
      const root = document.getElementById('root').getBoundingClientRect();
      const left = document.querySelector('.lws-panel-left').getBoundingClientRect();
      const right = document.querySelector('.lws-panel-right').getBoundingClientRect();
      return { rootLeft: root.left, rootRight: root.right, leftRailRight: left.right, rightRailLeft: right.left };
    });
    expect(viewportLayout.rootLeft).toBeGreaterThanOrEqual(viewportLayout.leftRailRight);
    expect(viewportLayout.rootRight).toBeLessThanOrEqual(viewportLayout.rightRailLeft);
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

  test('inventory overlay reads real saved quantities without changing inventory or leaving the world', async ({ page }) => {
    await enterAshmere(page, 'PackReader');
    const before = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.inventory.roadHerb = 2;
      player.inventory.clothScrap = 1;
      window.LegendStorage.savePlayer(player);
      return { roadHerb: player.inventory.roadHerb, clothScrap: player.inventory.clothScrap };
    });

    await page.locator('.lws-bottom-bar [data-world-action="inventory"]').click();
    const dialog = page.getByRole('dialog', { name: 'Inventory' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Road Herb');
    await expect(dialog).toContainText('Carried: 2');
    await expect(dialog).toContainText('Cloth Scrap');
    await expect(page.locator('.ash100-town')).toBeVisible();

    await dialog.getByRole('button', { name: /Return to the world/i }).click();
    await expect(dialog).toHaveCount(0);
    const after = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return { roadHerb: player.inventory.roadHerb, clothScrap: player.inventory.clothScrap };
    });
    expect(after).toEqual(before);
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();
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

    await page.locator('.lws-bottom-bar [data-world-action="combat"]').click();
    const dialog = page.getByRole('dialog', { name: 'Combat encounter' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('live encounter');
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
    expect(placeIcons.every(icon => icon.size <= 32 && icon.backgroundImage.includes('599635b6-376d-48ab-b7f7-e91b6292c34f.png'))).toBe(true);
    await page.locator('.lws-panel-right [data-world-place="market"]').click();
    await expect(page.locator('.lws-panel-right [data-world-place="market"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.lws-selected-place h3')).toHaveText('Market');
    await expect(page.locator('.lws-selected-place')).toContainText('Buy essentials and sell road loot');
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

});
