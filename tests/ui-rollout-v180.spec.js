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
  // Capture the actual memory-shaping scene before continuing to the road.
  await expect(page.locator('.v094-beginning-card').first()).toHaveCSS('border-radius', '3px');
  await expect(page.locator('.v140-dialogue-box')).toBeVisible();
  await expectNoHorizontalOverflow(page);
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
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
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

    // The memory screen has been checked by the helper above; this stage is now the road scene.
    await expect(page.locator('.opening-road-v140-card')).toHaveCSS('border-radius', '3px');
    await expect(page.locator('[data-oric-response="honest"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.locator('[data-oric-response="honest"]').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toHaveCSS('border-radius', '3px');
    await expect(page.locator('.rpg-command-grid')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('settings and profile/account surfaces retain their real navigation and shared frame at 390px', async ({ page }) => {
    await openTitle(page);

    await page.locator('#settings').click();
    await expect(page.locator('.settings09x')).toBeVisible();
    await expect(page.locator('.settings09x-btn').first()).toHaveCSS('border-radius', '3px');
    await expect(page.locator('[data-setting="reducedMotion"]')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.locator('#backTitle').click();
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.locator('#account').click();
    await expect(page.locator('.account09x')).toBeVisible();
    await expect(page.locator('.account09x-panel').first()).toHaveCSS('border-radius', '3px');
    await expect(page.locator('.account09x-btn').first()).toHaveCSS('border-radius', '3px');
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('the live inventory modal and Bell Cellar room use Phase 2 frames without mutating the saved traveler', async ({ page }) => {
    await createTravelerToLantern(page, 'InventoryVaultQA');
    await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      window.LegendRoadOpeningV140.complete(player, 'abandoned');
      player.flags = player.flags || {};
      player.flags.firstRoadReturnSeen = true;
      player.currentRegion = 'Ashmere';
      player.town = 'Ashmere';
      player.inventory = player.inventory || {};
      player.inventory.roadHerb = 2;
      player.inventory.clothScrap = 1;
      window.LegendRuntimeV120.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
    });
    await expect(page.locator('.ash100-town')).toBeVisible();

    const savedBefore = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return {
        name: player.username,
        gold: player.gold,
        hp: player.hp,
        inventory: { ...player.inventory }
      };
    });
    await page.locator('.lws-bottom-bar [data-world-action="inventory"]').click();
    const inventoryDialog = page.getByRole('dialog', { name: 'Inventory' });
    await expect(inventoryDialog).toBeVisible();
    await expect(inventoryDialog).toContainText('Road Herb');
    await expect(inventoryDialog).toContainText('Carried: 2');
    await expect(inventoryDialog).toContainText('Cloth Scrap');
    await expect(inventoryDialog).toHaveCSS('border-radius', '3px');
    await expect(inventoryDialog.locator('.lws-inventory-card').first()).toHaveCSS('border-radius', '3px');
    await expectNoHorizontalOverflow(page);

    const savedDuring = await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      return {
        name: player.username,
        gold: player.gold,
        hp: player.hp,
        inventory: { ...player.inventory }
      };
    });
    expect(savedDuring).toEqual(savedBefore);
    await inventoryDialog.getByRole('button', { name: /Return to the world/i }).click();
    await expect(inventoryDialog).toHaveCount(0);

    await page.getByRole('button', { name: /The Bell Cellar/i }).click();
    await expect(page.locator('.bell-vault-v100')).toBeVisible();
    await expect(page.locator('.bell-vault-banner')).toHaveCSS('border-radius', '3px');
    await page.locator('#vaultBegin').click();
    await expect(page.locator('.bell-vault-room-heading')).toContainText('ROOM 1 / 4');
    await expect(page.locator('.bell-vault-choice').first()).toHaveCSS('border-radius', '3px');
    await expectNoHorizontalOverflow(page);
  });

  test('combat results and body-mounted growth overlay use shared frames while preserving native actions', async ({ page }) => {
    await openTitle(page);
    await page.evaluate(() => {
      window.__phaseTwoResultCounts = { continued: 0, returned: 0 };
      window.__phaseTwoResultsView = window.LegendRoadCombatResultsViewV152.create({
        renderShell: html => { document.getElementById('root').innerHTML = html; },
        getAssets: () => window.LegendAssetsV090,
        escapeHtml: value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[ch])),
        onContinue: () => { window.__phaseTwoResultCounts.continued += 1; },
        onReturnToTown: () => { window.__phaseTwoResultCounts.returned += 1; }
      });
      window.__phaseTwoResultsView.render({
        result: 'victory',
        player: { username: 'Results QA', className: 'Ranger', level: 2, hp: 35, maxHp: 50 },
        enemy: { name: 'Road Goblin' },
        progress: { gained: 29, levels: 0, level: 2 },
        rewardName: 'Furs',
        goldGained: 8,
        routeStage: 2,
        primaryTitle: 'Continue QA route',
        secondaryTitle: 'Return to town'
      });
    });

    await expect(page.locator('.v152-combat-results')).toBeVisible();
    await expect(page.locator('.v152-combat-results')).toHaveCSS('border-radius', '3px');
    await expect(page.locator('.v152-results-rewards')).toHaveCSS('border-radius', '3px');
    await expect(page.getByRole('button', { name: /Continue QA route/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.locator('#v152CombatContinue').click();
    await expect.poll(() => page.evaluate(() => window.__phaseTwoResultCounts.continued)).toBe(1);

    await page.evaluate(() => {
      const player = {
        username: 'Growth QA', className: 'Ranger', level: 2,
        hp: 35, maxHp: 50, pendingStatPointsV152: 2,
        attributesV152: { might: 0, agility: 0, arcana: 0, endurance: 0, insight: 0, fortune: 0 },
        inventory: { food: 1, potion: 1 }, flags: {}, stats: {}
      };
      window.__phaseTwoGrowthPlayer = player;
      window.LegendLevelUpV152.open(player, { levels: 1 });
    });
    await expect(page.getByRole('dialog', { name: 'Level 2' })).toBeVisible();
    await expect(page.locator('.v152-levelup-overlay .v152-levelup-panel')).toHaveCSS('border-radius', '3px');
    await expect(page.locator('.v152-levelup-overlay .v152-growth-card').first()).toHaveCSS('border-radius', '3px');
    await expectNoHorizontalOverflow(page);
    await page.locator('#legendLevelUpOverlay').evaluate(element => element.remove());
  });

});
