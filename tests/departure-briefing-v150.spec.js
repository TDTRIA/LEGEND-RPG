const { test, expect } = require('@playwright/test');

async function createTravelerInAshmere(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
  await expect(page.locator('.v120-title')).toBeVisible();
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Name').fill('DepartureQA');
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

async function openDeparture(page) {
  await page.getByRole('navigation', { name: 'Ashmere terminal navigation' })
    .getByRole('button', { name: /Routes/i }).click();
  await page.getByRole('button', { name: /The Old Road/i }).click();
  await expect(page.locator('.ash100-departure')).toBeVisible();
}

test('departure briefing warns about a depleted traveler without blocking departure and exposes town prep shortcuts', async ({ page }) => {
  await createTravelerInAshmere(page);

  await page.evaluate(() => {
    const runtime = window.LegendRuntimeV120;
    const player = runtime.loadPlayer();
    player.hp = 1;
    player.inventory.food = 0;
    player.inventory.camp = 0;
    player.inventory.potion = 0;
    player.inventory.roadHerb = 0;
    player.inventory.clothScrap = 0;
    player.questLog = (Array.isArray(player.questLog) ? player.questLog : [])
      .filter(item => !String(item).startsWith('The Bell That Rang Once:'));
    player.questLog.push('The Bell That Rang Once: Follow the evidence toward Blackroot Bend.');
    runtime.savePlayer(player);
    window.LegendAshmereV099.renderAshmere();
  });

  await openDeparture(page);
  await expect(page.locator('[aria-label="Traveler condition"]')).toContainText('1 /');
  await expect(page.locator('#departureAdvice')).toContainText(/health is critically low/i);
  await expect(page.locator('#departureAdvice')).toContainText(/no food or camp supplies/i);
  await expect(page.locator('#departureAdvice')).toContainText(/no healing potion/i);
  await expect(page.locator('[aria-label="Current field order"]')).toContainText('The Bell That Rang Once');
  await expect(page.locator('[aria-label="Current field order"]')).toContainText('Blackroot Bend');

  const launch = page.locator('#departureBegin');
  await expect(launch).toBeVisible();
  await expect(launch).toBeEnabled();

  for (const shortcut of ['#departureInn', '#departureForge', '#departureWorkbench']) {
    await expect(page.locator(shortcut)).toBeVisible();
    await expect(page.locator(shortcut)).toBeEnabled();
  }

  const curtain = page.locator('#legend-scene-curtain');
  if (await curtain.count()) {
    await expect(curtain).not.toHaveClass(/is-covering/, { timeout: 7000 });
  }
  await page.locator('#departureBegin').click();
  await expect(page.locator('.exp150-world-page')).toBeVisible();
});
