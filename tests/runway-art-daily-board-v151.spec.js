const { test, expect } = require('@playwright/test');

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function enterAshmere(page, name = 'RasterQA') {
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
}

test('title realm entrance uses local Runway raster menu art rather than SVG menu icons', async ({ page }) => {
  await openTitle(page);
  await expect(page.locator('.v136-menu-icon svg')).toHaveCount(0);
  const menuIcons = page.locator('.v136-menu-icon.runway-icon');
  await expect(menuIcons).toHaveCount(5);
  await expect(page.locator('.v151-realm-feature img')).toHaveAttribute('src', 'assets/generated/locations/ashmere-town.webp');
  await expect(page.locator('.v151-realm-destination img')).toHaveCount(2);
  const menuArt = await menuIcons.evaluateAll(nodes => nodes.map(node => ({
    className: Array.from(node.classList).find(name => name.startsWith('runway-icon-')),
    backgroundImage: getComputedStyle(node).backgroundImage,
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    overflow: getComputedStyle(node).overflow
  })));
  expect(menuArt.every(icon => {
    const name = String(icon.className || '').replace('runway-icon-', '');
    return ['compass', 'journal', 'traveler', 'inn', 'market', 'forge', 'road', 'settings', 'milestone'].includes(name) &&
      icon.backgroundImage.includes('legend-icon-' + name + '.webp') &&
      icon.width === 28 && icon.height === 28 && icon.overflow === 'hidden';
  })).toBe(true);
  const sceneArt = await page.locator('.v151-realm-feature img, .v151-realm-destination img').evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
  expect(sceneArt.every(src => src && src.startsWith('assets/generated/locations/') && src.endsWith('.webp'))).toBe(true);
});

test('Ashmere hub uses transparent-blended raster icons and exposes the daily board', async ({ page }) => {
  await enterAshmere(page, 'HubRasterQA');
  await expect(page.locator('.ash099-icon svg')).toHaveCount(0);
  const iconPaths = await page.locator('.ash099-icon img').evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
  expect(iconPaths.length).toBeGreaterThan(4);
  expect(iconPaths.every(src => src && src.endsWith('.webp') && !src.endsWith('.svg'))).toBe(true);
  await expect(page.getByRole('button', { name: /Daily Board & Caches/i })).toHaveCount(0);
  await page.locator('.ash100-destination[data-ash-view="work"]').click();
  await expect(page.locator('#openDailyFieldBoard')).toBeVisible();
  await page.locator('#openDailyFieldBoard').click();
  await expect(page.locator('.ash099-daily-board')).toBeVisible();
});

test('road network illustrates Ashmere and daily contracts award keys for an odds-published cache', async ({ page }) => {
  await enterAshmere(page, 'DailyCacheQA');
  await page.evaluate(() => window.LegendAshmereV099.route('regions'));
  await expect(page.locator('.reg100-screen')).toBeVisible();
  const ashmereCard = page.locator('.reg100-card').filter({ hasText: 'Ashmere' });
  await expect(ashmereCard.locator('.reg100-card-scene img')).toHaveAttribute('src', 'assets/generated/locations/ashmere-town.webp');
  await expect(ashmereCard.locator('.reg100-card-scene img')).toHaveAttribute('alt', 'Lantern-lit medieval streets of Ashmere');

  await page.evaluate(() => window.LegendAshmereV099.route('quests'));
  await expect(page.locator('.ash099-daily-board')).toBeVisible();
  await expect(page.locator('.ash099-daily-grid .ash099-daily-card')).toHaveCount(3);
  await expect(page.locator('.ash099-cache-odds')).toContainText('40%');
  await expect(page.locator('.ash099-cache-odds')).toContainText('2%');
  await expect(page.locator('#dailyCacheOpen')).toBeDisabled();

  const before = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().gold || 0);
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.stats = player.stats || {};
    player.stats.pointsOfInterest = Number(player.stats.pointsOfInterest || 0) + 1;
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.route('quests');
  });
  await page.locator('[data-daily-claim="survey"]').click();
  const claimed = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    return { gold: player.gold, keys: player.inventory.roadCacheKey, claimed: player.flags.dailyContractsV151.claimed };
  });
  expect(claimed.gold).toBe(before + 30);
  expect(claimed.keys).toBe(1);
  expect(claimed.claimed).toContain('survey');
  await expect(page.locator('#dailyCacheOpen')).toBeEnabled();

  await page.evaluate(() => { Math.random = () => 0.995; });
  await page.locator('#dailyCacheOpen').click();
  await expect(page.locator('.ash099-daily-notice')).toContainText('Rare route cache');
  const opened = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    return { keys: player.inventory.roadCacheKey, tokens: player.inventory.roadToken, caches: player.stats.dailyCachesOpened };
  });
  expect(opened).toEqual({ keys: 0, tokens: 1, caches: 1 });
});
