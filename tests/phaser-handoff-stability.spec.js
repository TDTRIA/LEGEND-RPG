const { test, expect } = require('@playwright/test');

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  for (const kind of ['Title', 'Annals', 'Creation', 'Opening']) {
  test(`${kind} transaction rolls back allocation failures and survives viewport changes ${viewport.width}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForFunction(() => window.LegendPhaserWorldV1?.ready);
    await page.evaluate(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.reload();
    await page.waitForFunction(() => window.LegendPhaserWorldV1?.ready);
      if (kind === 'Annals') await page.locator('#newPrimary').click();
      if (kind === 'Creation') await page.evaluate(() => window.LegendBeginningV094.startCreation());
      if (kind === 'Opening') await page.evaluate(() => {
        LegendStorage.savePlayer(LegendStorage.normalize({ username: 'HandoffQA', level: 1, hp: 40, maxHp: 40 }));
        window.LegendRoadOpeningV140.start();
      });
      const surface = { Title: 'title', Annals: 'annals', Creation: 'creation', Opening: 'awakening' }[kind];
      await page.waitForFunction(surface => LegendPhaserWorldV1.engine.scene.getScene('RealmScene').surface === surface, surface);
      await page.evaluate(({ kind, surface }) => {
        const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        scene['clearNative' + kind + 'Ui']();
        window.__factory = scene.add.graphics;
        scene.add.graphics = function (...args) {
          // Allocation may succeed before a factory throws and before the
          // painter can register the object in its own cleanup list.
          window.__untrackedGraphic = window.__factory.apply(this, args);
          throw new Error('allocation regression probe');
        };
        scene['syncNative' + kind + 'Ui'](surface);
      }, { kind, surface });
      await expect.poll(() => page.evaluate(kind =>
        LegendPhaserWorldV1.engine.scene.getScene('RealmScene')['native' + kind + 'UiFailure'], kind)
      ).toContain('allocation regression probe');
      for (const delay of [0, 1000, 2000, 2000]) {
        if (delay) await page.waitForTimeout(delay);
        await expect(page.locator('body')).not.toHaveClass(new RegExp(`legend-phaser-${kind.toLowerCase()}-ui-active`));
      }
      expect(await page.evaluate(kind => {
        const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        return { active: s['native' + kind + 'UiActive'], count: s['native' + kind + 'UiObjects'].length, listeners: s['native' + kind + 'UiListeners']?.length || 0 };
      }, kind)).toEqual({ active: false, count: 0, listeners: 0 });
      expect(await page.evaluate(() => {
        const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        return { retained: s.children.list.includes(window.__untrackedGraphic), live: Boolean(window.__untrackedGraphic?.scene) };
      })).toEqual({ retained: false, live: false });
      await page.evaluate(({ kind, surface }) => {
        const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        s.add.graphics = window.__factory;
        s['clearNative' + kind + 'Ui']();
        s['syncNative' + kind + 'Ui'](surface);
      }, { kind, surface });
      await page.setViewportSize({ width: viewport.height, height: viewport.width });
      await page.setViewportSize(viewport);
      await expect.poll(() => page.evaluate(kind =>
        LegendPhaserWorldV1.engine.scene.getScene('RealmScene')['native' + kind + 'UiActive'], kind)
      ).toBe(true);
  });
  }
}

test('font loading and broken images keep semantic title controls visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.LegendPhaserWorldV1?.ready);
  await page.evaluate(() => {
    const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    s.clearNativeTitleUi();
    Object.defineProperty(document.fonts, 'status', { configurable: true, value: 'loading' });
    s.syncNativeTitleUi();
  });
  await page.waitForTimeout(1000);
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-title-ui-active/);
  await expect(page.locator('#newPrimary')).toBeEnabled();
  await page.evaluate(async () => {
    delete document.fonts.status;
    window.__failedFont = new FontFace('HandoffFailure', 'url(/missing-handoff-font.woff2)');
    document.fonts.add(window.__failedFont);
    await window.__failedFont.load().catch(() => {});
  });
  await page.waitForTimeout(1000);
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-title-ui-active/);
  await page.evaluate(() => {
    document.fonts.delete(window.__failedFont);
    const img = document.querySelector('.v120-legend-logo');
    img.src = '/missing-handoff-regression-image.png';
  });
  await page.waitForTimeout(1000);
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-title-ui-active/);
  await page.locator('#newPrimary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.opening-lore-v220')).toBeVisible();
});
