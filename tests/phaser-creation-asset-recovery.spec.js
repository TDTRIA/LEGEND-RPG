const { test, expect } = require('@playwright/test');
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`removed failed Creation art retains DOM and recovers on the next step at ${viewport.width}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.evaluate(() => LegendBeginningV094.startCreation());
    await expect(page.locator('body')).toHaveClass(/legend-phaser-creation-ui-active/);
    await page.locator('.v140-presence-mark').evaluate(img => { img.src = '/missing-creation-presence.webp'; });
    // The original DOM error handler removes the failed node. Its absence must
    // not be mistaken for a successfully loaded set of replacement artwork.
    await expect(page.locator('.v140-presence-mark')).toHaveCount(0);
    for (const delay of [0, 1000, 2000, 2000]) {
      if (delay) await page.waitForTimeout(delay);
      await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);
      await expect(page.locator('.v094-beginning-card h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    }
    await page.locator('#v094Name').fill('ArtRecovery');
    await page.locator('#v094Name').press('Enter');
    await expect(page.locator('body')).toHaveClass(/legend-phaser-creation-ui-active/);
    await page.locator('[data-gender="woman"] img').evaluate(img => { img.src = '/missing-creation-identity.webp'; });
    await expect(page.locator('[data-gender="woman"] img')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);
    await page.locator('[data-gender="woman"]').click();
    await expect(page.locator('[data-gender="woman"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#v094Next').click();
    await expect(page.locator('[data-personality]')).toHaveCount(5);
    await expect(page.locator('body')).toHaveClass(/legend-phaser-creation-ui-active/);
    const proof = await page.evaluate(() => {
      const s = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      return { staged: Boolean(s.nativeCreationUiTransaction.staged), active: s.nativeCreationUiActive,
        art: s.nativeCreationUiObjects.filter(o => o.type === 'Image').length };
    });
    expect(proof.staged).toBe(false); expect(proof.active).toBe(true); expect(proof.art).toBeGreaterThan(0);
  });
}
