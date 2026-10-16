const { test, expect } = require('@playwright/test');

test.describe('LEGEND reboot prototype (isolated from production)', () => {
  test('title screen loads the Phaser canvas and prototype controls', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });

    await expect(page).toHaveTitle(/LEGEND: The Awakening — Reboot Prototype/);
    await expect(page.locator('#title-panel')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('LEGEND');
    await expect(page.locator('.subtitle')).toHaveText('The Awakening');
    await expect(page.locator('#beginButton')).toBeVisible();
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
    await page.locator('#combatButton').click();
    await expect(page.locator('#combat-panel')).toHaveClass(/active/);
    await expect(page.locator('#battleLog')).toBeVisible();

    await page.locator('[data-battle="attack"]').click();
    await expect(page.locator('#battleHeading')).toContainText('A measured strike');
    await expect(page.locator('#battleHeading')).toContainText('Your turn', { timeout: 5000 });

    await page.locator('[data-battle="guard"]').click();
    await expect(page.locator('#battleHeading')).toContainText('You set your stance');
    await expect(page.locator('#battleHeading')).toContainText('Your turn', { timeout: 5000 });

    await page.locator('[data-battle="spell"]').click();
    await expect(page.locator('#heroMpText')).toHaveText('20 / 30');
    await expect(page.locator('#battleHeading')).toContainText('Ember Bolt');
    await expect(page.locator('#battleHeading')).toContainText('Your turn', { timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.locator('#title-panel')).toHaveClass(/active/);
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
});
