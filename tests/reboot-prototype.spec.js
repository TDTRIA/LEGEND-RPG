const { test, expect } = require('@playwright/test');

test.describe('LEGEND reboot prototype (isolated from production)', () => {
  test('title screen loads the Phaser canvas and prototype controls', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });

    await expect(page).toHaveTitle(/LEGEND — Reboot Prototype/);
    await expect(page.locator('#title-panel')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('LEGEND');
    await expect(page.locator('.subtitle')).toHaveText('The Unquiet Road');
    await expect(page.locator('#beginButton')).toBeVisible();
    await expect(page.locator('#classChoice option')).toHaveCount(6);
    await expect(page.locator('#classSummary')).toContainText('110 HP');
    await expect(page.locator('#combatButton')).toBeVisible();
    await expect(page.locator('#runeButton')).toBeVisible();
    await expect(page.locator('#game-container canvas')).toHaveCount(1);
    await expect.poll(async () => page.locator('#game-container canvas').evaluate(canvas => canvas.width)).toBeGreaterThan(0);

    expect(pageErrors).toEqual([]);
  });

  test('combat preview supports attack, guard, and spell flow', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await expect(page.locator('#combatButton')).toBeVisible();
    await page.locator('#classChoice').selectOption('Warrior');
    await page.locator('#combatButton').click();
    await expect(page.locator('#heroHpText')).toHaveText('140 / 140');
    await expect(page.locator('#combat-panel')).toHaveClass(/active/);
    await expect(page.locator('#battleLog')).toBeVisible();

    await page.locator('[data-battle="attack"]').click();
    await expect(page.locator('#battleLog')).toContainText('A measured strike');
    await expect(page.locator('#battleLog')).toContainText('Your turn', { timeout: 5000 });

    await page.locator('[data-battle="guard"]').click();
    await expect(page.locator('#battleLog')).toContainText('You set your stance');
    await expect(page.locator('#battleLog')).toContainText('Your turn', { timeout: 5000 });

    await page.locator('[data-battle="spell"]').click();
    await expect(page.locator('#heroMpText')).toHaveText('20 / 30');
    await expect(page.locator('#battleLog')).toContainText('Ember Bolt');
    await expect(page.locator('#battleLog')).toContainText('Your turn', { timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.locator('#title-panel')).toHaveClass(/active/);
    expect(pageErrors).toEqual([]);
  });

  test('first expedition supports movement, discovery, a goblin battle, and a return report', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await page.evaluate(() => window.LegendRebootPrototype.exploration());
    await expect(page.locator('#exploration-panel')).toHaveClass(/active/);
    await expect(page.locator('#interactButton')).toBeDisabled();

    // Walk to the roadside cache using the same keyboard controls as a player.
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(560);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(240);
    await page.keyboard.up('ArrowUp');
    await expect(page.locator('#interactButton')).toBeEnabled({ timeout: 3000 });
    await page.locator('#interactButton').click();
    await expect(page.locator('#exploreResources')).toContainText('8 Bells');
    await expect(page.locator('#exploreResources')).toContainText('1 Tonic');

    // Speak with Roadwarden Brenn before pursuing the warband.
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(520);
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(480);
    await page.keyboard.up('ArrowUp');
    await expect(page.locator('#exploreTargetTitle')).toContainText('Roadwarden Brenn', { timeout: 3000 });
    await page.locator('#interactButton').click();
    await expect(page.locator('#exploreObjective')).toContainText('Inspect the waystone');

    // Move to the goblin scout and trigger a real combat transition.
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(2050);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.up('ArrowUp');
    await expect(page.locator('#interactButton')).toBeEnabled({ timeout: 3000 });
    await expect(page.locator('#exploreTargetTitle')).toContainText('Goblin Scout');
    await page.locator('#interactButton').click();
    await expect(page.locator('#combat-panel')).toHaveClass(/active/);
    await expect(page.locator('#battleHeading')).toContainText(/goblin scout/i);

    // Wait for each enemy turn so the test exercises the intended combat rhythm.
    const spell = page.locator('[data-battle="spell"]');
    await spell.click();
    await expect(page.locator('#battleLog')).toContainText('Your turn', { timeout: 5000 });
    await spell.click();
    await expect(page.locator('#battleLog')).toContainText('Your turn', { timeout: 5000 });
    await spell.click();
    await expect(page.locator('#battleContinue')).toBeVisible({ timeout: 6000 });
    await page.locator('#battleContinue').click();
    await expect(page.locator('#exploration-panel')).toHaveClass(/active/);
    await expect(page.locator('#returnAshmereButton')).toBeEnabled();

    await page.locator('#returnAshmereButton').click();
    await expect(page.locator('#debrief-panel')).toHaveClass(/active/);
    await expect(page.locator('#debriefSummary')).toContainText('charcoal warband mark');
    await expect(page.locator('#debriefRewards')).toContainText('25 XP');
    await expect(page.locator('#debriefRewards')).toContainText('26 Bells');
    expect(pageErrors).toEqual([]);
  });

  test('rune training mini-game accepts the demonstrated sequence and records practice rank', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await page.locator('#runeButton').click();
    await expect(page.locator('#training-panel')).toHaveClass(/active/);

    await page.locator('[data-rune="TIDE"]').click();
    await page.locator('[data-rune="EMBER"]').click();
    await page.locator('[data-rune="ROOT"]').click();
    await page.locator('#testRune').click();

    await expect(page.locator('#trainingRank')).toHaveText('1');
    await expect(page.locator('#trainingResult')).toContainText('Rune Craft mastery +1');
    expect(pageErrors).toEqual([]);
  });
  test('inventory buys production weapons and armor and expedition loot updates the pack', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await page.locator('#classChoice').selectOption('Thief');
    await page.locator('#inventoryToggle').click();
    await expect(page.locator('#inventoryPanel')).toBeVisible();
    await expect(page.locator('#inventoryPanel')).toContainText('160 Bells');
    await page.locator('#inventoryPanel [data-weapon="woodenSword"]').click();
    await expect(page.locator('#inventoryPanel')).toContainText('Wooden Sword · EQUIPPED');
    await expect(page.locator('#inventoryPanel')).toContainText('95 Bells');
    await page.locator('#inventoryPanel [data-armor="clothArmor"]').click();
    await expect(page.locator('#inventoryPanel')).toContainText('Cloth Armor · EQUIPPED');
    await page.locator('#inventoryPanel #closeInventory').click();
    await page.evaluate(() => window.LegendRebootPrototype.exploration());
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(560);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(240);
    await page.keyboard.up('ArrowUp');
    await expect(page.locator('#interactButton')).toBeEnabled({ timeout: 3000 });
    await page.locator('#interactButton').click();
    await page.locator('#inventoryToggle').click();
    await expect(page.locator('#inventoryPanel')).toContainText('23 Bells');
    await expect(page.locator('#inventoryPanel')).toContainText('Road Poultice');
    expect(pageErrors).toEqual([]);
  });

});
