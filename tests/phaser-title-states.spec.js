const { test, expect } = require('@playwright/test');

test('title repaint follows scroll and resize, and missing art restores the semantic fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');
  await page.waitForFunction(() => window.LegendPhaserWorldV1?.snapshot()?.nativeTitleUi, null, { timeout: 20000 });
  const checkAlignment = async () => {
    await expect.poll(() => page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return snapshot.nativeTitleUiControlBounds.every(control => {
        const rect = document.getElementById(control.id).getBoundingClientRect();
        const sx = snapshot.nativeTitleUiSceneSize.width / innerWidth;
        const sy = snapshot.nativeTitleUiSceneSize.height / innerHeight;
        return Math.abs(control.x - rect.left * sx) < 2 && Math.abs(control.y - rect.top * sy) < 2
          && Math.abs(control.width - rect.width * sx) < 2;
      });
    })).toBe(true);
  };
  await checkAlignment();
  await page.evaluate(() => scrollTo(0, 180));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await checkAlignment();
  await page.setViewportSize({ width: 1440, height: 900 });
  await checkAlignment();
  await expect(page.locator('#newPrimary')).toHaveCSS('background-image', 'none');
  const vectorSize = await page.evaluate(() => {
    const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    const image = scene.textures.get('menuButtonNormal').getSourceImage();
    return [image.naturalWidth, image.naturalHeight];
  });
  expect(vectorSize).toEqual([800, 224]);
  await page.evaluate(() => {
    const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    scene.textures.remove('menuTitleLogo');
    // Trigger a real observed title-label update, invalidating the preflight.
    document.querySelector('#newPrimary strong').textContent = 'Begin a new journey';
  });
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-title-ui-active/);
  await expect(page.locator('#newPrimary strong')).toBeVisible();
  await expect(page.locator('#newPrimary')).not.toHaveCSS('background-image', 'none');
  await page.locator('#newPrimary').click();
  await expect(page.locator('.opening-lore-v220')).toBeVisible();
});
