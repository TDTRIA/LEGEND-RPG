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
  await page.getByRole('button', { name:/^Continue$/ }).click();
  await page.getByRole('button', { name:/^Continue$/ }).click();
  await page.getByRole('button', { name:/Shape the traveler/i }).click();
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

  test('Ashmere opens as a scene-led refuge and keeps the Daily Field Board reachable', async ({ page }) => {
    await startFreshCharacter(page);
    const hub=page.locator('.ashmere-hub-v240');
    await expect(hub).toBeVisible();
    await expect(hub.locator('h1')).toHaveText('Ashmere');
    await expect(hub.locator('.ashmere-hub-v240-field-order')).toBeVisible();
    await expect(hub.locator('.ashmere-hub-v240-place')).toHaveCount(4);
    await expect(hub.locator('.ashmere-hub-v240-gate')).toContainText('Old Road Gate');

    const shellState=await page.evaluate(()=>({
      active:document.body.classList.contains('legend-world-shell-active'),
      visible:!!document.querySelector('#legend-world-shell-root')&&!document.querySelector('#legend-world-shell-root').hidden,
      hasHubAsRoot:document.querySelector('#root > .ashmere-hub-v240')!==null
    }));
    expect(shellState).toEqual({active:false,visible:false,hasHubAsRoot:true});

    const destinationCoverage=await page.evaluate(()=>{
      const player=window.LegendRuntimeV120.loadPlayer();
      const expected=window.LegendAshmereDestinationCatalogV099.forRegion('Ashmere','',player.flags||[]).map(item=>item.view);
      const available=Array.from(document.querySelectorAll('#root [data-ash-view]')).map(item=>item.dataset.ashView);
      return {expected,available};
    });
    for(const view of destinationCoverage.expected) expect(destinationCoverage.available).toContain(view);

    await hub.locator('#ashmereHubMoreToggle').click();
    await expect(hub.locator('#ashmereHubMoreToggle')).toHaveAttribute('aria-expanded','true');
    const tile=hub.locator('.ashmere-hub-v240-more-place[data-ash-view="quests"]');
    await expect(tile).toBeVisible();
    await expect(tile).toContainText('Daily Field Board');
    await tile.click();

    const daily=page.locator('.ash099-daily-board');
    await expect(daily).toBeVisible({ timeout:10000 });
    await expect(daily).toContainText('Three reasons to take the road today');
    await expect(daily.locator('.ash099-daily-card')).toHaveCount(3);
    await expect(page.locator('.ash099-contract-ledger')).toBeVisible();
  });
  test('Greyfen hub exposes the same daily field board as a regional service', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenBoardQA');
    await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      player.currentRegion='Greyfen';
      player.town='Greyfen';
      player.unlockedRegions=['Ashmere','Greyfen'];
      player.discoveredRegions=['Ashmere','Greyfen'];
      player.flags=player.flags||{};
      player.flags.firstRoadReturnSeen=true;
      window.LegendRuntimeV120.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
    });
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    const tile=page.locator('.ash100-destination[data-ash-view="quests"]');
    await expect(tile).toContainText('Daily Field Board');
    await expect.poll(() => tile.locator('.ash100-destination-icon img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
    await expect(tile.locator('.ash100-destination-icon img')).toHaveAttribute('src',/service-job-board\.webp/);
    await tile.click();
    await expect(page.locator('.ash099-daily-board')).toBeVisible();
    await expect(page.locator('.ash099-daily-card')).toHaveCount(3);
  });

});
