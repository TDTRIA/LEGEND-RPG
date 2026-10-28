const { test, expect } = require('@playwright/test');

// Regression coverage for the issues found in the v0.22.1 live playtest.

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function createTraveler(page, { name = 'PlaytestQA', gender = 'man', className = 'Adventurer' } = {}) {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Name').fill(name);
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="' + gender + '"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.locator('[data-class="' + className + '"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
}

async function toAshmere(page) {
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    player.currentRegion = 'Ashmere';
    player.town = 'Ashmere';
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test('the name error clears as soon as the player types, and Enter submits', async ({ page }) => {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Next').click();
  await expect(page.locator('#v094NameError')).toHaveText('Please enter a traveler name.');
  await page.locator('#v094Name').pressSequentially('Skully');
  await expect(page.locator('#v094NameError')).toBeHidden();
  await expect(page.locator('#v094Name')).not.toHaveAttribute('aria-invalid', 'true');
  await page.locator('#v094Name').press('Enter');
  await expect(page.locator('[data-gender="man"]')).toBeVisible();
});

test('the traveler portrait follows the chosen form, not the class art', async ({ page }) => {
  // Adventurer class art is a woman; a traveler who chose "Man" must not see it.
  await createTraveler(page, { gender: 'man', className: 'Adventurer' });
  await page.getByRole('button', { name: /If I wanted trouble/i }).click();
  const portrait = page.locator('.rpg-hero-portrait img');
  await expect(portrait).toHaveAttribute('src', /class-warrior\.webp/);

  const forms = await page.evaluate(() => {
    const assets = window.LegendAssetsV090;
    return {
      woman: assets.travelerPortrait({ gender: 'woman', className: 'Warrior' }),
      nonbinary: assets.travelerPortrait({ gender: 'nonbinary', className: 'Warrior' }),
      unspoken: assets.travelerPortrait({ gender: 'unspoken', className: 'Warrior' }),
      legacy: assets.travelerPortrait({ className: 'Ranger' })
    };
  });
  expect(forms.woman).toMatch(/class-adventurer\.webp/);
  expect(forms.nonbinary).toMatch(/class-mage\.webp/);
  expect(forms.unspoken).toMatch(/legend-icon-traveler\.webp/);
  expect(forms.legacy).toMatch(/class-ranger\.webp/);
});

test('Town Square portraits do not cover the NPC names', async ({ page }) => {
  await createTraveler(page, { name: 'SquareQA' });
  await toAshmere(page);
  await page.evaluate(() => window.LegendAshmereV099.renderAshmere?.());
  await page.locator('.ash099-btn, button').filter({ hasText: /^Town Square/ }).first().click();
  const card = page.locator('.ash099-npc-card[data-ash-view="mara"]');
  await expect(card).toBeVisible();
  const overlap = await card.evaluate(el => {
    const img = el.querySelector('img').getBoundingClientRect();
    const name = el.querySelector('strong').getBoundingClientRect();
    return img.bottom - name.top;
  });
  expect(overlap).toBeLessThanOrEqual(0);
});

test('a rest is limited to once per stop, is recorded, and the trip summary shows the final state', async ({ page }) => {
  await createTraveler(page, { name: 'CampQA' });
  await toAshmere(page);
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.inventory = player.inventory || {};
    player.inventory.food = 3;
    player.inventory.camp = 2;
    player.hp = player.maxHp;
    player.flags.roadExpeditionV100 = {
      stage: 2, pressure: 54, trips: 3, events: 0, finds: 0, battles: 0,
      routeChoice: 'reeds', poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, campRestUsed: {}
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderHub();
  });

  const dayBefore = await page.evaluate(() => Number(window.LegendRuntimeV120.loadPlayer().day || 1));
  await page.locator('#campRest').click();
  await expect(page.locator('.exp150-expedition-head')).toContainText(/already at full health/i);
  await expect(page.locator('#campRest')).toBeDisabled();
  await expect(page.locator('#campRest')).toContainText(/Rested/);

  const afterRest = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    const journal = player.flags.roadFieldJournalV150;
    return {
      day: Number(player.day),
      camp: Number(player.inventory.camp),
      pressure: Number(player.flags.roadExpeditionV100.pressure),
      report: journal.campReports[journal.campReports.length - 1]
    };
  });
  expect(afterRest.day).toBe(dayBefore + 1);
  expect(afterRest.camp).toBe(1);
  expect(afterRest.pressure).toBe(42);
  expect(afterRest.report.kind).toBe('rest');
  expect(afterRest.report.trip).toBe(3);

  // Jump to the final stop and secure the expedition.
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.flags.roadExpeditionV100.stage = 5;
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderHub();
  });
  await page.locator('#finish').click();
  await expect(page.getByRole('heading', { name: 'Expedition Secured' })).toBeVisible();
  const report = page.locator('.exp150-return-report');
  await expect(report).toContainText(/Camp reports\s*1/);
  await expect(report).not.toContainText(/no safe pause/i);
  // The summary header shows where the trip ended, not the reset state.
  await expect(page.locator('body')).not.toContainText(/Expedition\s*0\s*\/\s*5/);
  await expect(page.locator('body')).toContainText(/42%/);
});

test('the Bell Cellar names the place once, shows its art, and labels its fight correctly', async ({ page }) => {
  await createTraveler(page, { name: 'CellarQA' });
  await toAshmere(page);
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.flags.firstRoadReturnSeen = true;
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.renderAshmere();
  });
  await page.getByRole('button', { name: /The Bell Cellar/i }).click();
  await expect(page.locator('.ash099-head h1')).toHaveText('The Bell Cellar');
  await expect(page.locator('.bell-vault-banner h1')).toHaveText('The Sealed Stair');

  // The banner art must actually load (it used to resolve against css/).
  const bg = await page.locator('.bell-vault-banner').evaluate(el => getComputedStyle(el).backgroundImage);
  expect(bg).toMatch(/\/assets\/generated\/locations\/bell-cellar-undercroft\.webp/);
  expect(bg).not.toMatch(/\/css\/assets\//);
  const status = await page.evaluate(async () => {
    const url = new URL('assets/generated/locations/bell-cellar-undercroft.webp', document.baseURI).href;
    return (await fetch(url)).status;
  });
  expect(status).toBe(200);

  await page.locator('#vaultBegin').click();
  await expect(page.locator('.bell-vault-banner h1')).toHaveText('The Silted Steps');
  await expect(page.locator('.bell-vault-room-heading')).toContainText('ROOM 1 / 4');
  await expect(page.locator('.bell-vault-banner p')).toHaveCount(0);
  await page.locator('#vaultDescend').click();
  await page.locator('#vaultReadGlyphs').click();
  await page.locator('#vaultTakeFragment').click();
  await expect(page.locator('#vaultFight')).not.toContainText(/existing fight|commands/i);
  await page.locator('#vaultFight').click();
  await expect(page.locator('.rpg-battle-topline .rpg-overline')).toHaveText('THE BELL CELLAR');
});

test('a single Road Token is not labeled as plural', async ({ page }) => {
  await createTraveler(page, { name: 'TokenQA' });
  await toAshmere(page);
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.inventory.roadToken = 1;
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-status-resources span')).toHaveText('1 Road Token');
});
