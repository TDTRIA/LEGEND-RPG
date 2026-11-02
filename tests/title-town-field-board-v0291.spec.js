const { test, expect } = require('@playwright/test');

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
}

async function startFreshCharacter(page, name='RealmBoardQA') {
  await openTitle(page);
  await page.getByRole('button', { name:/Begin Your Journey/i }).click();
  await page.getByRole('button', { name:/Skip the annals/i }).click();
  await page.locator('#v094Name').fill(name);
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name:/Ranger Better road sense, scouting, and fleeing/i }).click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name:/Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name:'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name:'Lift your head' }).click();
  await page.evaluate(() => {
    const player=window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player,'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test.describe('Title realm dispatch and town service access v0.29.1', () => {
  test('title screen replaces generic tasks with latest update and what is coming next', async ({ page }) => {
    await openTitle(page);
    const dispatch=page.locator('.v151-realm-dispatch');
    await expect(dispatch).toBeVisible();
    await expect(dispatch).toContainText('REALM DISPATCH');
    await expect(dispatch).toContainText('LATEST UPDATE');
    await expect(dispatch).toContainText('Greyfen’s frontier is taking shape');
    await expect(dispatch).toContainText("WHAT'S COMING NEXT");
    await expect(dispatch).toContainText('A road that answers back');
    await expect(dispatch.getByRole('link', { name:/Read the latest field notes/i })).toHaveAttribute('href','updates.html');
  });

  test('Ashmere hub presents a crisp service icon and opens the Daily Field Board directly', async ({ page }) => {
    await startFreshCharacter(page);
    const tile=page.locator('.ash100-destination[data-ash-view="quests"]');
    await expect(tile).toBeVisible();
    await expect(tile).toContainText('Daily Field Board');
    await expect.poll(() => tile.locator('.ash100-destination-icon img').evaluate(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0)).toBe(true);
    const geometry=await tile.locator('.ash100-destination-icon').evaluate(icon=>{
      const box=icon.getBoundingClientRect();
      const img=icon.querySelector('img');
      return {
        width:box.width,
        height:box.height,
        imageWidth:img?.naturalWidth||0,
        imageHeight:img?.naturalHeight||0,
        source:img?.getAttribute('src')||''
      };
    });
    expect(geometry.width).toBeGreaterThanOrEqual(52);
    expect(geometry.height).toBeGreaterThanOrEqual(52);
    expect(geometry.imageWidth).toBeGreaterThan(0);
    expect(geometry.imageHeight).toBeGreaterThan(0);
    expect(geometry.source).toContain('service-job-board.webp');

    await tile.click();
    const daily=page.locator('.ash099-daily-board');
    await expect(daily).toBeVisible({ timeout:10000 });
    await expect(daily).toContainText('Three reasons to take the road today');
    await expect(daily.locator('.ash099-daily-card')).toHaveCount(3);
    await expect(page.locator('.ash099-contract-ledger')).toBeVisible();
  });
});
