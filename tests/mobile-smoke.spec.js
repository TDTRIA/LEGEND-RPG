const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const dataSource = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const versionMatch = dataSource.match(/VERSION:\s*['"]v([^'"]+)['"]/);
if (!versionMatch) throw new Error('Could not read LEGEND_DATA.VERSION from js/data.js');
const version = versionMatch[1];


async function enterOldRoadFromDeparture(page) {
  await tap(page, page.getByRole('button', { name: /The Old Road/i }));
  await expect(page.locator('.ash100-departure')).toBeVisible();
  await tap(page, page.locator('#departureBegin'));
  await expect(page.locator('.exp150-world-page')).toBeVisible();
}

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  ` });
  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
}
async function tap(page, locator) {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();

  // A scene transition intentionally covers controls while destination assets
  // settle. Wait for the curtain to clear before checking the physical touch hit
  // target, just as a player would wait for the scene to finish arriving.
  const curtain = page.locator('#legend-scene-curtain');
  if (await curtain.count()) {
    await expect(curtain).not.toHaveClass(/is-covering/, { timeout: 7000 });
  }

  // Mobile WebKit's mouse-click stability check can hang on visible controls,
  // even with transforms disabled. Touch projects should send an actual tap.
  const touchDevice = await page.evaluate(() =>
    navigator.maxTouchPoints > 0 ||
    matchMedia('(pointer: coarse)').matches ||
    matchMedia('(hover: none)').matches
  );
  if (!touchDevice) {
    await locator.click();
    return;
  }

  await locator.evaluate(el => el.scrollIntoView({
    block: 'center',
    inline: 'nearest',
    behavior: 'auto'
  }));
  const target = await locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      x, y,
      width: window.innerWidth,
      height: window.innerHeight,
      hitTarget: !!hit && (hit === el || el.contains(hit))
    };
  });
  expect(target.x, 'Touch target center must be inside the viewport').toBeGreaterThanOrEqual(0);
  expect(target.x, 'Touch target center must be inside the viewport').toBeLessThan(target.width);
  expect(target.y, 'Touch target center must be inside the viewport').toBeGreaterThanOrEqual(0);
  expect(target.y, 'Touch target center must be inside the viewport').toBeLessThan(target.height);
  expect(target.hitTarget, 'Touch target center must not be covered by another element').toBe(true);
  await page.touchscreen.tap(target.x, target.y);
}

async function startFreshCharacter(page, name) {
  await openTitle(page);
  await tap(page, page.getByRole('button', { name: /Begin Your Journey/i }));
  await page.locator('#v094Name').fill(name);
  await tap(page, page.locator('#v094Next'));
  await tap(page, page.locator('[data-gender="unspoken"]'));
  await tap(page, page.locator('#v094Next'));
  await tap(page, page.locator('[data-personality="kind"]'));
  await tap(page, page.locator('#v094Next'));
  await tap(page, page.locator('[data-origin]').first());
  await tap(page, page.locator('#v094Next'));
  await tap(page, page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i }));
  await tap(page, page.locator('#v094Next'));
  await tap(page, page.locator('[data-keepsake="Old Map"]'));
  await tap(page, page.locator('#v094Next'));
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await tap(page, page.getByRole('button', { name: /Let Me Wake/i }));
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}
async function expectNoHorizontalOverflow(page) {
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(widths.document, JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport + 1);
  expect(widths.body, JSON.stringify(widths)).toBeLessThanOrEqual(widths.viewport + 1);
}

test.describe('LEGEND mobile compatibility smoke tests', () => {
  test('Veil creation, Oric ambush, ACT, and Ashmere fit mobile without overflow', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await openTitle(page);
    await expect.poll(() => page.title()).toContain(`v${version}`);
    await expect.poll(() => page.evaluate(() => window.LEGEND_DATA?.VERSION)).toBe(`v${version}`);
    await expectNoHorizontalOverflow(page);
    await tap(page, page.getByRole('button', { name: /Begin Your Journey/i }));
    await page.locator('#v094Name').fill('MobileCreationQA');
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-gender="unspoken"]'));
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-personality="kind"]'));
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-origin]').first());
    await tap(page, page.locator('#v094Next'));
    const rangerChoice = page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i });
    await expect(rangerChoice).toBeVisible();
    await expect.poll(() => rangerChoice.evaluate(el => getComputedStyle(el).transform)).toBe('none');
    await tap(page, rangerChoice);
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-keepsake="Old Map"]'));
    await tap(page, page.locator('#v094Next'));
    await expect(page.getByRole('heading', { name: 'MobileCreationQA', exact: true })).toBeVisible();
    const wake = page.getByRole('button', { name: /Let Me Wake/i });
    await expect.poll(() => wake.evaluate(el => getComputedStyle(el).transform)).toBe('none');
    await tap(page, wake);
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await tap(page, page.locator('[data-oric-response="honest"]'));
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('#skill')).toContainText('Awaken');
    await tap(page, page.locator('#skill'));
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await tap(page, page.getByRole('button', { name: 'Go straight to Ashmere' }));
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Ashmere terminal navigation' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('Work Board signal job accepts taps and fits the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startFreshCharacter(page, 'MobileWorkQA');
    await tap(page, page.locator('.ash100-destinations').getByRole('button', { name: /Work Board/i }));
    await expect(page.locator('[data-job-open="wood"]')).toContainText(/Timing challenge/i);
    await expect(page.locator('[data-job-open="gate"]')).toContainText(/Read the signal/i);
    await expect(page.locator('[data-job-open="crates"]')).toContainText(/Memory sequence/i);
    await tap(page, page.locator('[data-job-open="gate"]'));
    await expect(page.locator('.ash099-job-mode-signal')).toBeVisible();
    await tap(page, page.locator('[data-job-choice="0"]'));
    await expect(page.locator('#jobResult')).toContainText(/recognize Oric/i);
    await expectNoHorizontalOverflow(page);
  });

  test('Old Road route and discovery respond to touch input', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startFreshCharacter(page, 'MobileRoadQA');
    await tap(page, page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }));
    await enterOldRoadFromDeparture(page);
    await expect(page.locator('#routeRidge')).toBeVisible();
    await tap(page, page.locator('#routeRidge'));
    await tap(page, page.locator('#push'));
    await expect(page.locator('.exp100-head')).toContainText(/arrive at Ridgeway Cairn/i);
    await tap(page, page.locator('.exp100-hotspot-find'));
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/Ridgeway Cairn/i);
    await tap(page, page.locator('#poiInspect'));
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure falls by 3/i);
    await expectNoHorizontalOverflow(page);
  });

  test('Road combat controls render and accept a touch action', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startFreshCharacter(page, 'MobileCombatQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.flags = pl.flags || {};
      pl.flags.roadExpeditionV100 = { ...(pl.flags.roadExpeditionV100 || {}), stage: 0, pressure: 70, trips: 0, events: 0, finds: 0, battles: 0 };
      rt.savePlayer(pl);
    });
    await tap(page, page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }));
    await enterOldRoadFromDeparture(page);
    await tap(page, page.locator('#routeRidge'));
    await tap(page, page.locator('#push'));
    await expect(page.locator('.exp100-combat')).toBeVisible();
    await expect(page.locator('.rpg-command-grid .rpg-command')).toHaveCount(4);
    await expect(page.locator('#strike')).toContainText('FIGHT');
    await expect(page.locator('#skill')).toContainText('ACT');
    await tap(page, page.locator('#guard'));
    await expect(page.locator('.exp100-combat')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('road-opening tutorial route and discovery fit mobile without overflow', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await openTitle(page);
    await expectNoHorizontalOverflow(page);

    await tap(page, page.getByRole('button', { name: /Begin Your Journey/i }));
    await page.locator('#v094Name').fill('MobileOpeningRoadQA');
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-gender="unspoken"]'));
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-personality="kind"]'));
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-origin]').first());
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i }));
    await tap(page, page.locator('#v094Next'));
    await tap(page, page.locator('[data-keepsake="Old Map"]'));
    await tap(page, page.locator('#v094Next'));
    await expect(page.getByRole('heading', { name: 'MobileOpeningRoadQA', exact: true })).toBeVisible();
    await tap(page, page.getByRole('button', { name: /Let Me Wake/i }));
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await tap(page, page.locator('[data-oric-response="honest"]'));
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await tap(page, page.locator('#skill'));
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await tap(page, page.getByRole('button', { name: 'Follow the road' }));
    await expect(page.locator('.exp100-wrap')).toBeVisible();
    await expect(page.locator('.opening-road-v140-guide')).toContainText('The road forks');
    await expect(page.locator('#routeRidge')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await tap(page, page.locator('#routeRidge'));
    await expect(page.locator('#push')).toBeDisabled();
    await tap(page, page.locator('.exp100-hotspot-find'));
    await expect(page.locator('#poiInspect')).toBeVisible();
    await tap(page, page.locator('#poiInspect'));
    await expect(page.locator('#search')).toBeEnabled();
    await tap(page, page.locator('#search'));
    await expect(page.locator('#push')).toBeEnabled();
    await tap(page, page.locator('#push'));
    await expect(page.locator('.exp100-head h1')).toHaveText('Ridgeway Cairn');
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

});
