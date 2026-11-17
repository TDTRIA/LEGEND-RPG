const { test, expect } = require('@playwright/test');

test('committed handoff sleeps, invalidates on offsets and CSS zoom, and disposes obsolete work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  const settled = () => page.evaluate(() => {
    const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    return s.nativeTitleUiActive && s.nativeTitleUiTransaction?.frame === null;
  });
  await expect.poll(settled).toBe(true);
  const idle = await page.evaluate(async () => {
    const original = Element.prototype.getBoundingClientRect;
    let reads = 0;
    Element.prototype.getBoundingClientRect = function (...args) { reads++; return original.apply(this, args); };
    try { await new Promise(resolve => setTimeout(resolve, 500)); return reads; }
    finally { Element.prototype.getBoundingClientRect = original; }
  });
  expect(idle, 'idle screens must not repeatedly measure all DOM labels').toBeLessThan(100);
  for (const zoom of ['1.25', '0.8']) {
    await page.evaluate(zoom => {
      document.querySelector('#root').style.zoom = zoom;
      LegendPhaserWorldV1.engine.canvas.style.transform = 'translate(17px, 11px)';
    }, zoom);
    await expect.poll(settled).toBe(true);
    await expect.poll(() => page.evaluate(() => {
      const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      const c = s.game.canvas.getBoundingClientRect();
      const b = document.querySelector('#newPrimary').getBoundingClientRect();
      const control = s.nativeTitleUiControls.find(item => item.id === 'newPrimary');
      return Math.abs(control.x - (b.left - c.left) * s.dimensions().width / c.width);
    })).toBeLessThan(1);
  }
  await page.evaluate(() => {
    const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    window.__oldHandoff = s.nativeTitleUiTransaction;
    s.clearNativeTitleUi();
    window.__oldHandoff.schedule();
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => {
    const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    return s.nativeTitleUiTransaction === window.__oldHandoff;
  })).toBe(false);
});

test('device scale and visual viewport zoom invalidate an active presentation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  const session = await page.context().newCDPSession(page);
  for (const scale of [2, 1]) {
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: 1440, height: 900, deviceScaleFactor: scale, mobile: false
    });
    await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: scale === 2 ? 1.25 : 1 });
    await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(scale);
    await expect.poll(() => page.evaluate(() => visualViewport.scale)).toBe(scale === 2 ? 1.25 : 1);
    await expect.poll(() => page.evaluate(() => {
      const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      const t = s.nativeTitleUiTransaction;
      return { active: s.nativeTitleUiActive, idle: t?.frame === null,
        density: t?.signature && JSON.parse(t.signature)[0], zoom: t?.signature && JSON.parse(t.signature)[1] };
    })).toEqual({ active: true, idle: true, density: scale, zoom: scale === 2 ? 1.25 : 1 });
  }
  await session.detach();
});

test('road map, HUD and actions share the offset canvas coordinate system', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(() => {
    LegendStorage.savePlayer(LegendStorage.normalize({ username: 'OffsetTraveler', currentRegion: 'Ashmere', hp: 40, maxHp: 40,
      flags: { introV094Complete: true, openingRoadV140: { completed: true, phase: 'complete' },
        roadExpeditionV100: { stage: 0, routeChoice: null, pressure: 12, trips: 1 } } }));
    LegendRoadControllerV100.renderExpedition();
  });
  await page.locator('#exp150OpenMap').click();
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadMapUi)).toBe(true);
  await page.evaluate(() => {
    LegendPhaserWorldV1.engine.canvas.style.transformOrigin = 'top left';
    LegendPhaserWorldV1.engine.canvas.style.transform = 'translate(23px, 17px) scale(0.9)';
  });
  await expect.poll(() => page.evaluate(() => {
    const s = LegendPhaserWorldV1.snapshot();
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    const canvas = scene.game.canvas.getBoundingClientRect();
    const dialog = document.querySelector('.exp150-modal-dialog').getBoundingClientRect();
    const expected = { x: (dialog.x - canvas.x) * scene.dimensions().width / canvas.width,
      y: (dialog.y - canvas.y) * scene.dimensions().height / canvas.height };
    return Math.max(Math.abs(s.nativeRoadMapUiMaskBounds.x - expected.x), Math.abs(s.nativeRoadMapUiMaskBounds.y - expected.y));
  })).toBeLessThan(1);
  await page.locator('#exp150ModalClose').click();
  await expect.poll(() => page.evaluate(() => {
    const s = LegendPhaserWorldV1.snapshot();
    const canvas = LegendPhaserWorldV1.engine.canvas.getBoundingClientRect();
    const scale = LegendPhaserWorldV1.engine.scene.getScene('RealmScene').dimensions().width / canvas.width;
    const node = document.querySelector('.exp150-title-group h1');
    const label = s.nativeExpeditionHudUiLabels.find(item => item.sourceText === node.textContent.trim());
    return label ? Math.abs(label.sourceBounds.x - (node.getBoundingClientRect().left - canvas.left) * scale) : 999;
  })).toBeLessThan(1);
});

test('scene shutdown releases presentation listeners and leaves usable DOM', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeTitleUi)).toBe(true);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    window.__stoppedScene = scene;
    scene.scene.stop();
  });
  await page.waitForTimeout(100);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#newPrimary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.opening-lore-v220')).toBeVisible();
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => ({
    active: __stoppedScene.sys.isActive(),
    transactions: ['Title','Annals','Creation','Opening'].filter(k => __stoppedScene[`native${k}UiTransaction`]),
    classes: [...document.body.classList].filter(c => /^legend-phaser-(title|annals|creation|opening)-ui-active$/.test(c))
  }))).toEqual({ active: false, transactions: [], classes: [] });
  expect(errors).toEqual([]);
});

test('class selection handoff stays painted when ownership emits color transitions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(() => LegendBeginningV094.startCreation());
  await page.locator('#v094Name').fill('StableClasses');
  await page.locator('#v094Next').click();
  for (const selector of ['[data-gender="unspoken"]', '[data-personality="kind"]', '[data-origin="Lost Squire"]']) {
    await page.locator(selector).click(); await page.locator('#v094Next').click();
  }
  for (const name of ['Adventurer','Warrior','Ranger','Mage','Thief','Skiller','Ranger']) await page.locator(`[data-class="${name}"]`).click();
  await page.mouse.move(0, 0);
  await expect.poll(() => page.evaluate(() => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    return scene.nativeCreationUiActive && scene.nativeCreationUiTransaction?.frame === null;
  })).toBe(true);
  const frames = await page.evaluate(() => new Promise(resolve => {
    const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    const samples = [];
    function sample() {
      samples.push({ active: scene.nativeCreationUiActive,
        text: scene.nativeCreationUiObjects.filter(o => o.type === 'Text' && o.visible && o.willRender(scene.cameras.main)).length });
      if (samples.length < 60) requestAnimationFrame(sample); else resolve(samples);
    }
    requestAnimationFrame(sample);
  }));
  for (const sample of frames) { expect(sample.active).toBe(true); expect(sample.text).toBeGreaterThan(10); }
});
