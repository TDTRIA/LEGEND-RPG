const { test, expect } = require('@playwright/test');

for (const width of [1440, 390]) {
  test(`Oric opening keeps complete readable copy and real controls at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
      hasTouch: width === 390, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:4173/');
      await page.waitForFunction(() => window.LegendPhaserWorldV1?.ready);
      await page.evaluate(() => {
        const player = window.LegendStorage.normalize({ username: 'OpeningQA', level: 1, hp: 40, maxHp: 40,
          gold: 17, inventory: { food: 2 }, flags: { customOpeningFlag: 'keep' }, futureExtension: { keep: true } });
        window.LegendStorage.savePlayer(player);
        window.LegendRoadOpeningV140.start();
        window.__openingSaveBefore = localStorage.getItem('legend-roads-of-ashmere-v09');
      });
      const expectNative = async () => {
        await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeOpeningUi)).toBe(true);
        const proof = await page.evaluate(() => {
          const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
          return { labels: scene.nativeOpeningUiObjects.filter(item => item.getData?.('shellLabel')).map(item => ({
            text: item.text, color: item.style.color, alpha: item.alpha,
            width: item.displayWidth, height: item.displayHeight,
            source: item.getData('shellLabel').sourceBounds
          })), overflow: document.documentElement.scrollWidth > innerWidth,
          art: window.LegendPhaserWorldV1.snapshot().nativeScreenArt[0] };
        });
        expect(proof.overflow).toBe(false);
        expect(proof.art).toMatchObject({ active: true, sourceMatches: true,
          expectedSource: 'assets/locations/roads/location_old_road_main_v1.jpg' });
        for (const label of proof.labels) {
          expect(label.color).not.toMatch(/transparent|rgba\([^)]*,\s*0\)/);
          expect(label.alpha).toBe(1);
          expect(label.width).toBeLessThanOrEqual(label.source.width + 1);
          expect(label.height).toBeLessThanOrEqual(label.source.height + 4);
        }
        return proof.labels.map(item => item.text).join('\n');
      };
      const copy = await expectNative();
      expect(copy).toContain('A single bronze note rolls through the fog');
      expect(copy).toContain('from a stretch of road where no tower stands.');
      expect(copy).toContain('No tower. No second toll.');
      expect(copy).toContain('LIFT YOUR HEAD');
      await expect(page.locator('.opening-road-v140-kicker')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
      expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09') === window.__openingSaveBefore)).toBe(true);

      // A failed text fit must recover the entire readable source surface.
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        window.__openingLabelFactory = scene.createShellLabel;
        scene.createShellLabel = () => null;
        scene.clearNativeOpeningUi();
        scene.syncNativeOpeningUi();
      });
      expect(await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeOpeningUi)).toBe(false);
      await expect(page.locator('.opening-road-v140-prologue-lede')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        scene.createShellLabel = window.__openingLabelFactory;
        delete window.__openingLabelFactory;
        scene.syncNativeOpeningUi();
      });
      await expectNative();
      // A thrown painter exception must restore the complete DOM prologue surface.
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        window.__openingThrowFactory = scene.createShellLabel;
        scene.createShellLabel = () => { throw new Error('simulated opening painter failure'); };
        scene.clearNativeOpeningUi();
        scene.syncNativeOpeningUi();
      });
      expect(await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeOpeningUi)).toBe(false);
      await expect(page.locator('.opening-road-v140-prologue-lede')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        scene.createShellLabel = window.__openingThrowFactory;
        scene.syncNativeOpeningUi();
      });
      await expectNative();
      const action = page.locator('#openingPrologueContinue');
      await action.scrollIntoViewIfNeeded();
      await action.focus();
      await expect(action).toBeFocused();
      await expect.poll(() => page.evaluate(() => {
        const control = window.LegendPhaserWorldV1.snapshot().nativeOpeningUiControlBounds.find(item => item.id === 'openingPrologueContinue');
        const rect = document.getElementById('openingPrologueContinue').getBoundingClientRect();
        return Boolean(control?.focused && Math.abs(control.y - rect.y) < 2);
      })).toBe(true);
      if (width === 390) await action.tap(); else await page.keyboard.press('Enter');
      await expect(page.locator('[data-oric-response="honest"]')).toBeVisible();
      expect(await expectNative()).toContain('I remember a bell. Nothing else.');
      const answer = page.locator('[data-oric-response="honest"]');
      if (width === 390) await answer.tap(); else await answer.click();
      await expect(page.locator('#openingRoadHelpOric')).toBeVisible();
      expect(await expectNative()).toContain('Help Oric');
      const saved = await page.evaluate(() => window.LegendStorage.loadPlayer());
      expect(saved.flags.openingRoadV140.response).toBe('honest');
      expect(saved.flags.customOpeningFlag).toBe('keep');
      expect(saved.futureExtension).toEqual({ keep: true });
      expect(saved.gold).toBe(17);
      expect(saved.inventory.food).toBe(2);
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}
