const { test, expect } = require('@playwright/test');

async function startFreshCharacter(page, name = 'RoadDiscoveryQA') {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  ` });
  await expect(page.locator('.v120-title')).toBeVisible();
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
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
  await page.getByRole('button', { name: /Begin the Road/i }).click();
  await page.getByRole('button', { name: /Enter Ashmere/i }).click();
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test('Old Road discovery hotspot reveals and resolves a point of interest', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await startFreshCharacter(page);
  await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
  await page.getByRole('button', { name: /The Old Road/i }).click();
  await expect(page.locator('.exp100-scene-live')).toBeVisible();
  await page.locator('#routeReeds').click();
  await page.locator('#push').click();
  await expect(page.locator('.exp100-scene-live')).toHaveAttribute('data-stage', '1');
  await expect(page.locator('.exp100-hotspot-find')).toContainText('Look closer');

  await page.evaluate(() => {
    window.__roadDiscoveryQa = { clicks: 0 };
    document.addEventListener('click', event => {
      if (event.target?.closest?.('.exp100-hotspot-find')) window.__roadDiscoveryQa.clicks += 1;
    }, true);
  });
  await page.locator('.exp100-hotspot-find').click();

  const diagnostic = await page.evaluate(() => ({
    clickObserved: window.__roadDiscoveryQa?.clicks || 0,
    panelCount: document.querySelectorAll('.exp100-discovery-beat').length,
    inspectCount: document.querySelectorAll('#poiInspect').length,
    hotspot: document.querySelector('.exp100-hotspot-find')?.outerHTML || null,
    stage: document.querySelector('.exp100-scene-live')?.dataset.stage || null,
    playerStage: window.LegendRuntimeV080?.loadPlayer()?.flags?.roadExpeditionV100?.stage ?? null
  }));
  console.log('ROAD_DISCOVERY_DIAGNOSTIC ' + JSON.stringify({ ...diagnostic, pageErrors, consoleErrors }));
  expect(diagnostic.clickObserved, 'The hotspot click must reach the document').toBe(1);
  await expect(page.locator('.exp100-discovery-beat'), 'Discovery panel was not created. Diagnostic: ' + JSON.stringify({ ...diagnostic, pageErrors, consoleErrors })).toBeVisible();
  await expect(page.locator('.exp100-discovery-beat')).toContainText(/Tracks Beneath the Blue Light/i);
  await page.locator('#poiInspect').click();
  await expect(page.locator('.exp100-head')).toContainText(/Road Pressure rises by 4/i);
  expect(pageErrors).toEqual([]);
});
