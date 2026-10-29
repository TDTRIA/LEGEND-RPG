const { test, expect } = require('@playwright/test');

async function enterAshmere(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /Skip the annals/i }).click();
  await page.locator('#v094Name').fill('AshmereLightQA');
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
  await expect(page.getByRole('heading', { name: 'AshmereLightQA', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await expect(page.locator('#legend-world-shell-root')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/legend-world-scene-town/);
  await expect(page.locator('body')).toHaveClass(/legend-world-region-ashmere/);
}

test('Ashmere town artwork remains visible under the persistent shell', async ({ page }) => {
  await enterAshmere(page);

  await expect.poll(() => page.locator('.ash100-hero > img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);

  const visual = await page.evaluate(() => {
    const shell = document.getElementById('legend-world-shell-root');
    const hero = document.querySelector('.ash100-town .ash100-hero');
    return {
      townImage: getComputedStyle(document.body, '::before').backgroundImage,
      worldBrightness: getComputedStyle(document.body, '::before').filter,
      vignette: getComputedStyle(document.body, '::after').boxShadow,
      shellCanvas: getComputedStyle(shell).backgroundImage,
      townHeroOverlay: getComputedStyle(hero, '::after').backgroundImage,
      imageSrc: document.querySelector('.ash100-hero > img').currentSrc
    };
  });

  expect(visual.townImage).toContain('ashmere-town.webp');
  expect(visual.worldBrightness).toContain('brightness(1.04)');
  expect(visual.vignette).toContain('0.1');
  expect(visual.shellCanvas).toContain('0.065');
  expect(visual.townHeroOverlay).toContain('0.59');
  expect(visual.imageSrc).toContain('ashmere-town.webp');
});
