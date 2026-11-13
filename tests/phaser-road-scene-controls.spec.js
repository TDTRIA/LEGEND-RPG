const { test, expect } = require('@playwright/test');

async function openRoad(page) {
    await page.goto('http://127.0.0.1:4173/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.evaluate(() => {
      LegendStorage.savePlayer(LegendStorage.normalize({ username: 'SceneQA', currentRegion: 'Ashmere', hp: 40, maxHp: 40,
        gold: 23, inventory: { food: 3, roadToken: 2 }, futureExtension: { keep: true },
        flags: { introV094Complete: true, firstRoadReturnSeen: true, customRoadFlag: true,
          roadExpeditionV100: { stage: 0, pressure: 12, trips: 1, events: 0, finds: 0, battles: 0,
            routeChoice: null, poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, roadClockHour: 15 },
          roadFieldJournalV150: { visitedPlaces: [], discoveries: [], routes: [], campReports: [] }
        }
      }));
      LegendRoadControllerV100.renderExpedition();
    });
}

for (const width of [1440, 390]) test(`road scene controls preserve discovery, sound and fallback at ${width}px`, async ({ browser }) => {
  test.setTimeout(120000);
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
    reducedMotion: 'reduce', hasTouch: width === 390 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await openRoad(page);
    const snapshot = () => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadSceneUi);
    const expectNative = async () => {
      await expect.poll(async () => (await snapshot())?.active, { timeout: 15000 }).toBe(true);
      const native = await snapshot();
      expect(native.failure).toBe('');
      expect(native.labels.length).toBeGreaterThanOrEqual(2);
      for (const label of native.labels) {
        expect(label.text).toBe(label.sourceText);
        expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width + 1);
        expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height + 4);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      return native;
    };
    expect((await expectNative()).labels.some(label => /SOUTH FORK/.test(label.text))).toBe(true);
    await expect(page.locator('.exp100-scene-live')).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.exp100-scene-shade')).toHaveCSS('background-image', 'none');
    const savedBefore = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
    const soundBefore = await page.locator('#exp100-sound').textContent();
    const sound = page.locator('#exp100-sound');
    await sound.scrollIntoViewIfNeeded();
    await sound.focus();
    await expect.poll(async () => (await snapshot()).controls.find(c => c.id === 'exp100-sound')?.focused).toBe(true);
    expect(await sound.evaluate(node => {
      const box = node.getBoundingClientRect();
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      return hit === node || node.contains(hit);
    })).toBe(true);
    if (width === 390) await sound.tap(); else await page.keyboard.press('Enter');
    await expect(sound).not.toHaveText(soundBefore);
    await expect.poll(async () => (await snapshot()).labels.some(label => /^Sound: /.test(label.text) && label.text !== soundBefore)).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('legend-road-sound'))).toBe(soundBefore.includes('On') ? 'off' : 'on');
    expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(savedBefore);
    await page.locator('#routeRidge').click();
    await expectNative();
    const hotspot = page.locator('.exp100-hotspot-find');
    await hotspot.scrollIntoViewIfNeeded();
    await hotspot.focus();
    await expect.poll(async () => (await snapshot()).controls.find(c => c.id === 'poi')?.focused).toBe(true);
    await page.evaluate(() => { window.__sceneNodeBefore = document.querySelector('.exp100-scene-live'); });
    if (width === 390) await hotspot.tap(); else await page.keyboard.press('Enter');
    await expect(page.locator('.exp100-discovery-beat')).toBeVisible();
    expect(await page.evaluate(() => document.querySelector('.exp100-scene-live') === window.__sceneNodeBefore)).toBe(true);
    await page.locator('#poiLeave').click();
    await expect(page.locator('.exp100-discovery-beat')).toHaveCount(0);
    await hotspot.click();
    await page.locator('#poiInspect').click();
    await expect(hotspot).toHaveCount(0);
    expect((await expectNative()).controls.map(c => c.id)).toEqual(['exp100-sound']);
    const player = await page.evaluate(() => LegendStorage.loadPlayer());
    expect(player.flags.roadFieldJournalV150.discoveries.some(entry => entry.key === 'fork-marker')).toBe(true);
    expect(player.flags.customRoadFlag).toBe(true);
    expect(player.futureExtension).toEqual({ keep: true });
    await page.locator('#exp150OpenMap').click();
    await expect(page.locator('#exp150Modal')).toBeVisible();
    await expect.poll(async () => (await snapshot()).active).toBe(false);
    await page.keyboard.press('Escape');
    await expectNative();
    // A partially faded background and a failed text paint both keep the DOM usable.
    await page.evaluate(() => {
      const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      scene.background.alpha = 0.5;
      scene.syncNativeRoadSceneArt();
    });
    expect((await snapshot()).active).toBe(false);
    await expect(sound).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.evaluate(() => {
      const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      scene.background.alpha = 1;
      scene.syncNativeRoadSceneArt();
      window.__sceneLabelFactory = scene.createShellLabel;
      scene.createShellLabel = () => null;
      document.querySelector('#exp100-sound').focus();
      scene.roadScene.sync();
    });
    await expect.poll(async () => (await snapshot()).active).toBe(false);
    await expect(sound).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.evaluate(() => {
      const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      scene.createShellLabel = window.__sceneLabelFactory;
      scene.roadScene.sync();
    });
    await expectNative();
    await page.reload();
    await page.waitForFunction(() => window.LegendStorage && window.__legendPhaserWorldReady);
    expect(await page.evaluate(() => LegendStorage.loadPlayer().flags.roadFieldJournalV150.discoveries.some(entry => entry.key === 'fork-marker'))).toBe(true);
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});


test('road scene and journey masks recover after live resize and drawer closure', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openRoad(page);
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadSceneUi.active)).toBe(true);
  const saved = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
  // The closing side panels must really animate for this regression.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const expectFullClip = async () => {
    await expect.poll(() => page.evaluate(() => {
      const state = LegendPhaserWorldV1.snapshot();
      const clips = [state.nativeExpeditionHudUiClip, state.nativeExpeditionActionsUiClip, state.nativeRoadSceneUi.clip];
      return Boolean(state.nativeExpeditionHudUi && state.nativeExpeditionActionsUi && state.nativeRoadSceneUi.active &&
        clips.every(clip => clip && clip.width > innerWidth * 0.8 && Math.abs(clip.width - clips[0].width) < 2));
    }), { timeout: 15000 }).toBe(true);
  };
  await page.setViewportSize({ width: 390, height: 844 });
  await expectFullClip();
  for (const side of ['left', 'right']) {
    const toggle = page.locator(`[data-world-action="toggle-${side}"]`);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expectFullClip();
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await expectFullClip();
  await page.setViewportSize({ width: 390, height: 844 });
  await expectFullClip();
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(saved);
});
