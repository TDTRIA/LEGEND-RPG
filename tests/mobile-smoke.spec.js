const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { readGameVersion, openTitle, startFreshCharacter } = require('./helpers/game');
const version = readGameVersion();

async function tap(page, locator) {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();

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
  test('title and character creation reach Ashmere without overflow', async ({ page }) => {
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
    const beginRoad = page.getByRole('button', { name: /Begin the Road/i });
    await expect.poll(() => beginRoad.evaluate(el => getComputedStyle(el).transform)).toBe('none');
    await tap(page, beginRoad);
    await tap(page, page.getByRole('button', { name: /Enter Ashmere/i }));
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Ashmere terminal navigation' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('Work Board signal job accepts taps and fits the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startFreshCharacter(page, 'MobileWorkQA', tap);
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
    await startFreshCharacter(page, 'MobileRoadQA', tap);
    await tap(page, page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }));
    await tap(page, page.getByRole('button', { name: /The Old Road/i }));
    await expect(page.locator('#routeRidge')).toBeVisible();
    await tap(page, page.locator('#routeRidge'));
    await tap(page, page.locator('#push'));
    await expect(page.locator('.exp100-head')).toContainText(/arrive at Lantern Ditch/i);
    await tap(page, page.locator('.exp100-hotspot-find'));
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/Ridgeway Cairn/i);
    await tap(page, page.locator('#poiInspect'));
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure falls by 3/i);
    await expectNoHorizontalOverflow(page);
  });

  test('Road combat controls render and accept a touch action', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startFreshCharacter(page, 'MobileCombatQA', tap);
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV080;
      const pl = rt.loadPlayer();
      pl.flags = pl.flags || {};
      pl.flags.roadExpeditionV100 = { ...(pl.flags.roadExpeditionV100 || {}), stage: 0, pressure: 70, trips: 0, events: 0, finds: 0, battles: 0 };
      rt.savePlayer(pl);
    });
    await tap(page, page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }));
    await tap(page, page.getByRole('button', { name: /The Old Road/i }));
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
});
