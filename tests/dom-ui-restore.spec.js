const { test, expect } = require('@playwright/test');

/* DOM interface restore switch.

   The switch is inert by default. The title menu itself now always uses semantic
   DOM controls; the switch still governs the other native presentation layers
   while Phaser keeps the world plate and scene art.

   These specs stay on the title/annals surface on purpose: that is where the
   painter gate has the most machinery, and it keeps the run fast and stable
   rather than driving the whole traveler-creation flow. */

const OPEN_TITLE = async (page, search = '') => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/${search}`);
  // The world awakening has a reduced-motion short path; give the bridge room
  // to construct the title surface before asserting on it.
  await expect(page.locator('#newPrimary')).toBeVisible({ timeout: 15_000 });
};

test('the switch is off by default while the Ashmere title keeps its native DOM controls', async ({ page }) => {
  await OPEN_TITLE(page);

  const state = await page.evaluate(() => ({
    flag: window.LegendDomUiRestore?.enabled,
    paints: window.LegendDomUiRestore?.paints(),
    bodyRestore: document.body.classList.contains('legend-dom-ui-restore-active'),
    bodyPainter: document.body.classList.contains('legend-phaser-title-ui-active')
  }));

  expect(state.flag).toBe(false);
  expect(state.paints).toBe(true);
  expect(state.bodyRestore).toBe(false);
  expect(state.bodyPainter).toBe(false);
});

test('with the switch on the title returns to native DOM while Phaser keeps the world plate', async ({ page }) => {
  await OPEN_TITLE(page, '?dom-ui=1');

  const state = await page.evaluate(() => {
    const button = document.querySelector('#newPrimary');
    const label = button?.querySelector('.v136-menu-copy strong');
    const backdrop = document.querySelector('.v120-title-backdrop');
    const canvas = document.querySelector('#game-container canvas');
    return {
      flag: window.LegendDomUiRestore?.enabled,
      bodyRestore: document.body.classList.contains('legend-dom-ui-restore-active'),
      bodyPainter: document.body.classList.contains('legend-phaser-title-ui-active'),
      buttonVisibility: button ? getComputedStyle(button).visibility : null,
      buttonOpacity: button ? getComputedStyle(button).opacity : null,
      labelVisibility: label ? getComputedStyle(label).visibility : null,
      labelText: label?.textContent?.trim() || '',
      sceneArtActive: backdrop?.getAttribute('data-legend-phaser-scene-art-active'),
      backdropOpacity: backdrop ? getComputedStyle(backdrop).opacity : null,
      backdropVisibility: backdrop ? getComputedStyle(backdrop).visibility : null,
      canvasWidth: canvas?.width || 0,
      canvasHeight: canvas?.height || 0
    };
  });

  expect(state.flag).toBe(true);
  expect(state.bodyRestore).toBe(true);
  // No painter class means no painted copy is sitting on top of the DOM.
  expect(state.bodyPainter).toBe(false);

  // The real, readable, clickable DOM control is back.
  expect(state.buttonVisibility).toBe('visible');
  expect(state.buttonOpacity).not.toBe('0');
  expect(state.labelVisibility).toBe('visible');
  expect(state.labelText.length).toBeGreaterThan(0);

  // Phaser still owns the world: the matching scene art is live on the canvas.
  // The duplicate DOM image is intentionally hidden after the art handoff.
  expect(state.canvasWidth).toBeGreaterThan(0);
  expect(state.canvasHeight).toBeGreaterThan(0);
  expect(state.sceneArtActive).toBe('true');
  expect(state.backdropOpacity).toBe('0');
  expect(state.backdropVisibility).toBe('hidden');
});

test('the choice is remembered and the URL overrides the saved preference', async ({ page }) => {
  await OPEN_TITLE(page, '?dom-ui=1');
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('legend-dom-ui-restore')))
    .toBe('1');

  // A later visit without a query keeps the saved choice.
  await page.goto('/');
  await expect(page.locator('#newPrimary')).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => page.evaluate(() => window.LegendDomUiRestore?.enabled))
    .toBe(true);

  // An explicit opt-out wins for that load and is saved back.
  await page.goto('/?dom-ui=0');
  await expect(page.locator('#newPrimary')).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => page.evaluate(() => window.LegendDomUiRestore?.enabled))
    .toBe(false);
  await expect
    .poll(() => page.evaluate(() => document.body.classList.contains('legend-phaser-title-ui-active')))
    .toBe(false);
});

test('the switch never writes into the player save or the settings contract', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#newPrimary')).toBeVisible({ timeout: 15_000 });

  const keys = await page.evaluate(() => {
    window.LegendDomUiRestore.setEnabled(true);
    const after = Object.keys(window.localStorage);
    window.LegendDomUiRestore.setEnabled(false);
    return { after, saveKey: window.LEGEND_DATA?.SAVE_KEY || null };
  });

  expect(keys.after).toContain('legend-dom-ui-restore');
  // The switch gets its own key, and it must not create player or settings data.
  if (keys.saveKey) expect(keys.after).not.toContain(keys.saveKey);
  expect(keys.after).not.toContain('legend-settings-v1');
});
