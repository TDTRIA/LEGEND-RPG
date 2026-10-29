const { test, expect } = require('@playwright/test');

async function startTraveler(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
  await page.getByRole('button', { name:/Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /Skip the annals/i }).click();
  await page.locator('#v094Name').fill('BlackrootFieldQA');
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin="Lost Squire"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-class="Ranger"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name:/Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test('Blackroot Tracks is playable from the Work Board and pays the documented reward', async ({ page }) => {
  await startTraveler(page);
  await page.locator('.ash100-destinations').getByRole('button', { name:/Work Board/i }).click();
  const card = page.locator('[data-job-open="tracks"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Read the Blackroot Tracks');
  await expect(card).toContainText('Trail reading');
  await expect(card).toContainText('52g base pay');

  await card.click();
  await expect(page.locator('.ash099-job-mode-track')).toBeVisible();
  await expect(page.getByRole('heading', { name:/Read the Blackroot Tracks/i })).toBeVisible();
  await expect(page.locator('[data-job-choice]')).toHaveCount(3);
  await page.locator('[data-job-choice="0"]').click();
  await expect(page.locator('#jobResult')).toContainText('Perfect!');
  await expect(page.locator('#jobResult')).toContainText(/Earned 75g/);
  await expect(page.locator('#jobResult')).toContainText(/record the depth and stride/i);

  const saved = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    return {
      gold: player.gold,
      completedJobs: player.flags.ashmereJobs,
      favor: player.flags.ashmereFavor,
      inventory: player.inventory
    };
  });
  expect(saved.gold).toBe(175);
  expect(saved.completedJobs).toBe(1);
  expect(saved.favor).toBe(2);
  await expect.poll(() => page.evaluate(() => window.LegendRuntimeV120.loadPlayer()?.gold)).toBe(175);
});
