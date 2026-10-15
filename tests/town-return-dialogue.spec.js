const { test, expect } = require('@playwright/test');

async function startFreshCharacter(page, name='TownEchoQA') {
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
  await page.getByRole('button', { name:/Begin Your Journey/i }).click();
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
  await expect(page.getByRole('heading', { name, exact:true })).toBeVisible();
  await page.getByRole('button', { name:/Begin the Road/i }).click();
  await page.getByRole('button', { name:/Enter Ashmere/i }).click();
  await expect(page.locator('.ash100-town')).toBeVisible();
}

async function openPeople(page) {
  await page.locator('.ash100-destinations .ash100-destination[data-ash-view="people"]').click();
  await expect(page.getByRole('heading', { name:'People of Ashmere' })).toBeVisible();
}

test('Ashmere keepers acknowledge the first road return and route choice', async ({ page }) => {
  const pageErrors=[];
  page.on('pageerror', e=>pageErrors.push(e.message));
  await startFreshCharacter(page, 'TownEchoQA');

  await openPeople(page);
  await page.locator('[data-ash-view="mara"]').click();
  await expect(page.locator('.ash099-lines')).toContainText(/The bell rang once when you arrived/i);
  await expect(page.locator('.ash099-lines')).not.toContainText(/You brought back a Bell Fragment/i);

  // Simulate a completed synthetic expedition in this isolated browser context.
  await page.evaluate(() => {
    const rt=window.LegendRuntimeV080;
    const pl=rt.loadPlayer();
    pl.stats=pl.stats||{};
    pl.stats.oldRoadClears=1;
    pl.inventory=pl.inventory||{};
    pl.inventory.bellFragment=1;
    pl.inventory.roadToken=3;
    pl.flags=pl.flags||{};
    pl.flags.roadExpeditionV100=pl.flags.roadExpeditionV100||{stage:0,pressure:0,trips:1,events:0,finds:0,battles:0};
    pl.flags.roadExpeditionV100.routeChoice='reeds';
    rt.savePlayer(pl);
  });

  await page.locator('#ashBack').click();
  await openPeople(page);
  await page.locator('[data-ash-view="mara"]').click();
  await expect(page.locator('.ash099-head')).toContainText(/This time, she asks what you saw/i);
  await expect(page.locator('.ash099-lines')).toContainText(/not proof that it broke from the bell/i);
  await expect(page.locator('.ash099-lines')).toContainText(/blue light fixed in one place/i);

  await page.locator('#ashBack').click();
  await openPeople(page);
  await page.locator('[data-ash-view="brenn"]').click();
  await expect(page.locator('.ash099-lines')).toContainText(/One clear return is better than a dozen rumors/i);
  await expect(page.locator('.ash099-lines')).toContainText(/Bell Fragments are not just scrap/i);
  await expect(page.locator('#turnTokens')).toBeVisible();

  await page.locator('#ashBack').click();
  await openPeople(page);
  await page.locator('[data-ash-view="oric"]').click();
  await expect(page.locator('.ash099-head')).toContainText(/added your last route to the gate notes/i);
  await expect(page.locator('.ash099-lines')).toContainText(/You chose the Reed Cut/i);
  await expect(page.locator('.ash099-lines')).toContainText(/not chase them alone/i);

  expect(pageErrors).toEqual([]);
});
