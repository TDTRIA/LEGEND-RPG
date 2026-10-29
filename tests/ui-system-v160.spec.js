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

async function enterAshmere(page, name = 'UIProofQA') {
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
    await expect(page.locator('.v140-realm-overview.v151-realm-art')).toBeVisible();
    await expect(page.locator('.v151-realm-feature img')).toHaveAttribute('src', 'assets/generated/locations/ashmere-town.webp');

    const computed = await page.locator('.v120-title-hero').evaluate(element => ({
      amber: getComputedStyle(document.documentElement).getPropertyValue('--legend-ui-amber').trim(),
      radius: getComputedStyle(element).borderRadius
    }));
    expect(computed.amber).toBe('#e7c982');
    expect(computed.radius).toBe('0px');
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-title-desktop.png');
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

  test('Old Road scene, HUD and field map use the design system without changing route controls', async ({ page }) => {
    await enterAshmere(page, 'RoadUIPreview');
    await seedRoad(page, 0, null);
    await expect(page.locator('.exp100-scene-live')).toBeVisible();
    await expect(page.locator('.exp150-expedition-head')).toBeVisible();
    await expect(page.locator('.exp150-vitals')).toBeVisible();
    await expect(page.locator('#exp150OpenMap')).toBeEnabled();
    await expect(page.locator('#exp150OpenJournal')).toBeEnabled();
    await expectNoHorizontalOverflow(page);
    await attachProof(page, 'phase1-old-road-desktop.png');

    await page.locator('#exp150OpenMap').click();
    await expect(page.locator('#exp150Modal')).toBeVisible();
    await expect(page.locator('#exp150Modal').getByRole('dialog')).toBeVisible();
    await attachProof(page, 'phase1-old-road-map.png');
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
