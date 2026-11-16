const { test, expect } = require('@playwright/test');
test.use({ hasTouch: true });
const key = 'legend-roads-of-ashmere-v09';
const state = page => page.evaluate(() => LegendPhaserWorldV1.snapshot());
const save = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);

for (const width of [1440, 390]) test(`Old Road painted copy and scroll boundaries remain readable at ${width}px`, async ({ page }) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(() => {
    LegendStorage.savePlayer(LegendStorage.normalize({
      username: 'Road Readability', currentRegion: 'Ashmere', hp: 23, maxHp: 40, gold: 73,
      inventory: { food: 3, roadToken: 2 }, futureExtension: { keep: true },
      flags: { introV094Complete: true, firstRoadReturnSeen: true, customRoadFlag: true,
        roadExpeditionV100: { stage: 0, pressure: 12, trips: 1, events: 0, finds: 0, battles: 0,
          routeChoice: null, poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, campRestUsed: {}, roadClockHour: 15 },
        roadFieldJournalV150: { visitedPlaces: [], discoveries: [], routes: [], campReports: [] }
      }
    }));
    LegendRoadControllerV100.renderExpedition();
  });
  await expect.poll(async () => (await state(page)).nativeExpeditionHudUi).toBe(true);
  await expect.poll(async () => (await state(page)).nativeExpeditionActionsUi).toBe(true);
  const initial = await save(page);
  const artwork = await page.locator('.exp100-scene-live').boundingBox();
  const kicker = await page.locator('.exp150-title-group .exp150-kicker').boundingBox();
  expect(kicker.y).toBeGreaterThanOrEqual(artwork.y + artwork.height);
  const layers = await page.locator('.exp150-expedition-head,.exp150-road-clock,.exp150-interactions .exp100-panel').evaluateAll(nodes => nodes.map(node => {
    const css = getComputedStyle(node);
    return { background: css.backgroundImage, color: css.backgroundColor, blur: css.backdropFilter };
  }));
  expect(layers.length).toBeGreaterThanOrEqual(3);
  for (const layer of layers) expect(layer).toEqual({ background: 'none', color: 'rgba(0, 0, 0, 0)', blur: 'none' });
  const painted = await state(page);
  expect(painted.nativeExpeditionHudUiLabels.map(label => label.text)).toContain('23 / 40');
  expect(painted.nativeExpeditionHudUiLabels.map(label => label.text)).toContain('YOUR JOURNEY');
  for (const label of [...painted.nativeExpeditionHudUiLabels, ...painted.nativeExpeditionActionsUiLabels]) {
    expect(label.text.replace(/\s+/g, ' ').toUpperCase()).toBe(label.sourceText.toUpperCase());
    expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width + 1);
    expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height + 4);
  }
  const route = page.locator('#routeRidge');
  await route.focus();
  await expect(route).toBeFocused();
  await expect.poll(() => page.evaluate(() => {
    const clip = LegendPhaserWorldV1.snapshot().nativeExpeditionActionsUiClip;
    const hud = document.querySelector('.lws-hud').getBoundingClientRect();
    const dock = document.querySelector('.lws-bottom-bar').getBoundingClientRect();
    return clip && clip.y >= hud.bottom - 1 && clip.y + clip.height <= dock.top + 1;
  })).toBe(true);
  const routeBox = await route.boundingBox();
  const clip = (await state(page)).nativeExpeditionActionsUiClip;
  expect(routeBox.y).toBeGreaterThanOrEqual(clip.y - 1);
  expect(routeBox.y + routeBox.height).toBeLessThanOrEqual(clip.y + clip.height + 1);
  // Unfittable labels retain their semantic DOM text instead of cropped textures.
  const heading = page.locator('.exp150-title-group h1');
  await heading.evaluate(node => { node.style.width = '1px'; LegendPhaserWorldV1.engine.scene.getScene('RealmScene').syncNativeExpeditionHudUi(); });
  await expect(heading).toHaveAttribute('data-legend-phaser-expedition-text', 'fallback');
  expect(await heading.evaluate(node => getComputedStyle(node).color)).not.toBe('rgba(0, 0, 0, 0)');
  await heading.evaluate(node => { node.style.removeProperty('width'); LegendPhaserWorldV1.engine.scene.getScene('RealmScene').syncNativeExpeditionHudUi(); });
  await expect(heading).toHaveAttribute('data-legend-phaser-expedition-text', 'true');
  // Renderer failure restores the complete styled production surface.
  await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    window.__roadClip = scene.clipExpeditionUi;
    scene.clipExpeditionUi = () => false;
    scene.clearNativeExpeditionHudUi(); scene.clearNativeExpeditionActionsUi();
    scene.syncNativeExpeditionHudUi(); scene.syncNativeExpeditionActionsUi();
  });
  expect((await state(page)).nativeExpeditionHudUi).toBe(false);
  expect(await heading.evaluate(node => getComputedStyle(node).color)).not.toBe('rgba(0, 0, 0, 0)');
  await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    scene.clipExpeditionUi = window.__roadClip; delete window.__roadClip;
    scene.syncNativeExpeditionHudUi(); scene.syncNativeExpeditionActionsUi();
  });
  await expect.poll(async () => (await state(page)).nativeExpeditionActionsUi).toBe(true);
  await page.locator('#exp150OpenMap').click();
  await expect(page.locator('#exp150Modal')).toBeVisible();
  await expect.poll(async () => (await state(page)).nativeRoadMapUi).toBe(true);
  await expect(page.locator('#root')).toHaveCSS('clip-path', 'none');
  await expect(page.locator('.exp100-scene-live')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('#exp150Modal')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.locator('#exp150ModalClose').click();
  await expect(page.locator('#exp150Modal')).toBeHidden();
  await expect.poll(async () => (await state(page)).nativeExpeditionHudUi).toBe(true);
  expect(await save(page)).toEqual(initial);
  if (width === 390) await route.tap();
  else { await route.focus(); await page.keyboard.press('Enter'); }
  await expect.poll(async () => (await save(page)).flags.roadExpeditionV100.routeChoice).toBe('ridge');
  const after = await save(page);
  expect(after.flags.roadExpeditionV100.pressure).toBe(Math.max(0, initial.flags.roadExpeditionV100.pressure - 8));
  expect(after.futureExtension).toEqual(initial.futureExtension);
  expect(after.flags.customRoadFlag).toBe(true);
  expect(after.inventory).toEqual(initial.inventory);
  expect(after.gold).toBe(initial.gold);
  expect(errors).toEqual([]);
});
