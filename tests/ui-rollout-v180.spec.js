const { test, expect } = require('@playwright/test');

async function openTitle(page, viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function createTravelerToLantern(page, name = 'PhaseTwoQA') {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await expect(page.locator('.v140-dialogue-speaker strong')).toHaveText('???');
  await page.locator('#v094Name').fill(name);
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await expect(page.locator('.v094-scene-note span')).toContainText('MEMORY ECHO');
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i }).click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
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

test.describe('LEGEND UI rollout v180 — Phase 2 screen families', () => {
  test('traveler memory, Dead Lantern, and opening combat share the frame system at mobile width', async ({ page }) => {
    await createTravelerToLantern(page);

    await expect(page.locator('link[href*="legend-ui-rollout-v180.css"]')).toHaveCount(1);
    const rolloutToken = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--legend-ui-rollout-v180-active').trim()
    );
    expect(rolloutToken).toBe('1');

    await expect(page.locator('.v094-beginning-card').first()).toHaveCSS('border-radius', '3px');
    await expect(page.locator('.v140-dialogue-box')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await expect(page.locator('.opening-road-v140-card')).toHaveCSS('border-radius', '3px');
    await expect(page.locator('[data-oric-response="honest"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.locator('[data-oric-response="honest"]').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toHaveCSS('border-radius', '3px');
    await expect(page.locator('.rpg-command-grid')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
