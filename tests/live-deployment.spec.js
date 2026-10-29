const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const dataSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const versionMatch = dataSource.match(/VERSION:\s*['"]v([^'"]+)['"]/);
if (!versionMatch) throw new Error('Could not read LEGEND_DATA.VERSION from js/data.js');
const expectedVersion = 'v' + versionMatch[1];
const liveUrl = 'https://tdtria.github.io/LEGEND-RPG/';

function expectedAsset(regex, label) {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const match = html.match(regex);
  if (!match) throw new Error('Could not find ' + label + ' in the committed index.html');
  return match[1];
}

const expectedRefs = {
  data: expectedAsset(/<script\b[^>]*\bsrc="([^"]*js\/data\.js[^"]*)"/, 'data script URL'),
  town: expectedAsset(/<script\b[^>]*\bsrc="([^"]*ashmere-controller-v099\.js[^"]*)"/, 'Ashmere controller URL'),
  workCss: expectedAsset(/<link rel="stylesheet" href="([^"]*ashmere-workshops-v100\.css[^"]*)"/, 'workshop stylesheet URL')
};

test.describe('LEGEND live GitHub Pages smoke test', () => {
  test.skip(!process.env.RUN_LIVE_SMOKE, 'Runs only as the dedicated live-deployment workflow step.');

  test('published version loads, new gameplay paths render, and no page errors occur', async ({ page }) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width: 1440, height: 900 });

    const deadline = Date.now() + 180_000;
    let lastTitle = '';
    let lastDataVersion = '';
    let lastRefs = {};
    let navigationError = '';

    // Wait for GitHub Pages and its cache to pick up this commit. The smoke test
    // compares the deployed asset URLs with the index.html in the tested commit.
    while (Date.now() < deadline) {
      try {
        await page.goto(liveUrl + '?playwright-smoke=' + Date.now(), {
          waitUntil: 'domcontentloaded',
          timeout: 20_000
        });
        lastTitle = await page.title();
        lastDataVersion = await page.evaluate(() => window.LEGEND_DATA?.VERSION || '');
        lastRefs = await page.evaluate(() => ({
          data: document.querySelector('script[src*="js/data.js"]')?.getAttribute('src') || '',
          town: document.querySelector('script[src*="ashmere-controller-v099.js"]')?.getAttribute('src') || '',
          workCss: document.querySelector('link[href*="ashmere-workshops-v100.css"]')?.getAttribute('href') || ''
        }));
        if (lastTitle.includes(expectedVersion) &&
            lastDataVersion === expectedVersion &&
            lastRefs.data === expectedRefs.data &&
            lastRefs.town === expectedRefs.town &&
            lastRefs.workCss === expectedRefs.workCss) {
          break;
        }
      } catch (error) {
        navigationError = String(error);
      }
      await page.waitForTimeout(5_000);
    }

    expect(lastTitle, 'GitHub Pages did not publish the committed version. Last data version: ' +
      lastDataVersion + '; last asset refs: ' + JSON.stringify(lastRefs) +
      '; last navigation error: ' + navigationError).toContain(expectedVersion);
    expect(lastDataVersion).toBe(expectedVersion);
    expect(lastRefs).toEqual(expectedRefs);

    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await expect(page.locator('.v120-title')).toBeVisible();
    // Keep this smoke test focused on usable gameplay rather than animation timing.
    // The actual animations are still enabled for players in the published game.
    await page.addStyleTag({ content: `
      *, *::before, *::after {

        animation: none !important;

        transition: none !important;

        scroll-behavior: auto !important;

      }
    ` });
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    const titleBounds = await page.locator('.v120-title-hero').boundingBox();
    expect(titleBounds && titleBounds.width, 'Desktop title panel should render').toBeGreaterThan(450);

    // Use the visible creation UI. Each run is isolated by Playwright's browser context.
    const travelerName = 'LiveQA' + Date.now().toString().slice(-5);
    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /Skip the annals/i }).click();
    await page.locator('#v094Name').fill(travelerName);
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
    await expect(page.getByRole('heading', { name: travelerName, exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Let Me Wake/i }).click();
    await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
    await page.getByRole('button', { name: 'Lift your head' }).click();
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await page.locator('[data-oric-response="honest"]').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('#skill')).toContainText('Awaken');
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await page.getByRole('button', { name: 'Go straight to Ashmere' }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();

    // Different jobs must render genuinely different controls.
    await page.locator('.ash100-destinations').getByRole('button', { name: /Work Board/i }).click();
    await expect(page.locator('[data-job-open="wood"]')).toContainText(/Timing challenge/i);
    await expect(page.locator('[data-job-open="gate"]')).toContainText(/Read the signal/i);
    await expect(page.locator('[data-job-open="records"]')).toContainText(/Solve the clue/i);
    await expect(page.locator('[data-job-open="crates"]')).toContainText(/Memory sequence/i);
    await page.locator('[data-job-open="gate"]').click();
    await expect(page.locator('.ash099-job-mode-signal')).toBeVisible();
    await expect(page.locator('.ash099-job-track')).toHaveCount(0);
    await page.locator('[data-job-choice="0"]').click();
    await expect(page.locator('#jobResult')).toContainText(/recognize Oric/i);
    // Job results intentionally remain visible until the player chooses another job.
    await page.locator('#backJobs').click();
    await expect(page.locator('[data-job-open="crates"]')).toBeVisible({ timeout: 8_000 });

    // The memory job previews a sequence and accepts it in the correct order.
    await page.locator('[data-job-open="crates"]').click();
    await page.locator('#jobStartSequence').click();
    await expect(page.locator('[data-job-sequence="BRACE"]')).toBeEnabled({ timeout: 8_000 });
    for (const action of ['BRACE', 'LIFT', 'TURN', 'SET']) {
      await page.locator('[data-job-sequence="' + action + '"]').click();
    }
    await expect(page.locator('#jobResult')).toContainText(/repeated the full handling sequence/i);
    // The completed result stays on the activity screen until explicit navigation.
    await page.locator('#backJobs').click();
    await expect(page.locator('[data-job-open="wood"]')).toBeVisible({ timeout: 8_000 });

    // Forge illustrations, meaningful passives, and the Crafting Bench entry must render.
    await page.locator('#ashBack').click();
    await page.locator('.ash100-destinations').getByRole('button', { name: /Forge & Workshop/i }).click();
    await expect(page.locator('[data-gear="woodenSword"] .ash099-weapon-art-woodenSword')).toBeVisible();
    await expect(page.locator('[data-gear="stoneSword"]')).toContainText(/Heavy Strike deals 25% more damage/i);
    await expect(page.locator('[data-gear="steelSword"]')).toContainText(/20% critical chance/i);
    await page.locator('[data-forge-tab="craft"]').click();
    await expect(page.getByRole('heading', { name: 'Crafting Bench' })).toBeVisible();

    // Side-contract postings should be accessible and persist once accepted.
    await page.locator('#ashBack').click();
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Side Stories & Contracts/i }).click();
    await expect(page.locator('.ash099-contract-card')).toHaveCount(4);
    await page.locator('[data-contract-accept="watchlightSurvey"]').click();
    await expect(page.locator('.ash099-contract-in-progress')).toBeVisible();
    await page.locator('#ashBack').click();
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Side Stories & Contracts/i }).click();
    await expect(page.locator('.ash099-contract-in-progress')).toBeVisible();
    await expect(page.locator('[data-contract-accept="watchlightSurvey"]')).toHaveCount(0);

    // The production Oric portrait must load from the committed local WebP in
    // both the People card and the individual dialogue screen.
    await page.locator('#ashBack').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await page.locator('.ash100-destinations .ash100-destination[data-ash-view="people"]').click();
    await expect(page.getByRole('heading', { name: 'People of Ashmere' })).toBeVisible();
    const oricCard = page.locator('.ash099-npc-card[data-ash-view="oric"] img');
    await expect(oricCard).toHaveAttribute('src', /assets\/generated\/npcs\/captain-oric\.webp$/);
    await expect.poll(() => oricCard.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.locator('[data-ash-view="oric"]').click();
    await expect(page.getByRole('heading', { name: 'Captain Oric' })).toBeVisible();
    const oricDialoguePortrait = page.locator('.ash099-head img');
    await expect(oricDialoguePortrait).toHaveAttribute('src', /assets\/generated\/npcs\/captain-oric\.webp$/);
    await expect.poll(() => oricDialoguePortrait.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    expect(widths.document, 'Mobile document overflow: ' + JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport);
    expect(widths.body, 'Mobile body overflow: ' + JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport);
    expect(pageErrors, 'Uncaught browser exceptions').toEqual([]);
    expect(consoleErrors, 'Browser console errors').toEqual([]);
  });
});
