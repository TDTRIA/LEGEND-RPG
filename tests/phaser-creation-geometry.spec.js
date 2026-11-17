const { test, expect } = require('@playwright/test');
for (const [width, height, reducedMotion] of [[1440, 900, 'reduce'], [1440, 900, 'no-preference'], [390, 844, 'reduce'], [844, 390, 'reduce']]) {
  test(`Creation ownership preserves selected geometry and becomes idle at ${width} ${reducedMotion}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.evaluate(() => LegendBeginningV094.startCreation());
    await page.locator('#v094Name').fill('Geometry');
    await page.locator('#v094Name').press('Enter');
    const woman = page.locator('[data-gender="woman"]');
    await woman.click();
    await expect(woman).toHaveAttribute('aria-pressed', 'true');
    const aligned = () => page.evaluate(() => {
      const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      const t = s.nativeCreationUiTransaction;
      const c = s.game.canvas.getBoundingClientRect();
      const b = document.querySelector('[data-gender="woman"]').getBoundingClientRect();
      const n = s.nativeCreationUiControls.find(n => n.id === 'choice-gender-woman');
      return !!n && s.nativeCreationUiActive && t.frame === null && !t.staged &&
        Math.abs(n.y - (b.y - c.y) * s.dimensions().height / c.height) < 0.5;
    });
    await expect.poll(aligned).toBe(true);
    // Selection retains the original two-pixel lift even while the cursor is
    // elsewhere. Concealing the DOM must not change these measured bounds.
    await page.mouse.move(0, 0);
    await expect(woman).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)');
    await expect.poll(aligned).toBe(true);
    const idle = await page.evaluate(async () => {
      const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      const before = [...s.nativeCreationUiObjects];
      const original = Element.prototype.getBoundingClientRect;
      let reads = 0;
      Element.prototype.getBoundingClientRect = function (...args) { reads++; return original.apply(this, args); };
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { reads, same: before.every((o, i) => s.nativeCreationUiObjects[i] === o), active: s.nativeCreationUiActive };
      } finally { Element.prototype.getBoundingClientRect = original; }
    });
    expect(idle.active).toBe(true); expect(idle.same).toBe(true); expect(idle.reads).toBeLessThan(100);
    await page.setViewportSize({ width: height, height: width });
    await expect.poll(aligned).toBe(true);
    await page.locator('#v094Next').click();
    await expect(page.locator('[data-personality]')).toHaveCount(5);
  });
}
