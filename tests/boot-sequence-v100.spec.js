const { test, expect } = require('@playwright/test');

test.describe('LEGEND v0.22.0 boot and realm presentation', () => {
  test('shows a real boot layer while the world systems are checked', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const boot = page.locator('#legend-boot-screen');
    await expect(boot).toBeVisible();
    await expect(page.locator('#legend-boot-progress')).toHaveAttribute('role', 'progressbar');
    await expect(page.locator('.legend-boot-checklist')).toContainText('Realm manifest');
    const bootPresentation = await page.evaluate(() => {
      const screen = document.querySelector('#legend-boot-screen');
      const frame = document.querySelector('.legend-boot-frame');
      return {
        background: getComputedStyle(screen).backgroundImage,
        frameShadow: getComputedStyle(frame).boxShadow,
        frameBackdrop: getComputedStyle(frame).backdropFilter,
        frameWidth: Math.round(frame.getBoundingClientRect().width)
      };
    });
    expect(bootPresentation.background).toContain('title-ashmere-road.webp');
    expect(bootPresentation.frameShadow).toBe('none');
    expect(bootPresentation.frameBackdrop).toBe('none');
    expect(bootPresentation.frameWidth).toBeLessThanOrEqual(700);

    await expect(page.locator('.v120-title')).toBeVisible();

    await expect.poll(() => page.evaluate(() => window.__legendBootSequenceV100?.finishedAt || 0), {
      timeout: 12000
    }).toBeGreaterThan(0);
    await expect(boot).toBeHidden();

    const result = await page.evaluate(() => ({
      durationMs: window.__legendBootSequenceV100?.durationMs || 0,
      manifest: window.__legendBootSequenceV100?.checks?.manifest,
      systemsReady: window.__legendBootSequenceV100?.checks?.systemsReady,
      artworkChecked: typeof window.__legendBootSequenceV100?.checks?.artwork === 'boolean'
    }));
    expect(result.durationMs).toBeGreaterThanOrEqual(4100);
    expect(result.manifest).toBe(true);
    expect(result.systemsReady).toBe(true);
    expect(result.artworkChecked).toBe(true);
    await expect(page.locator('.v140-realm-overview')).toBeVisible();
  });

  test('keeps a readable scene curtain on screen long enough to register the destination', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => window.__legendBootSequenceV100?.finishedAt || 0), {
      timeout: 12000
    }).toBeGreaterThan(0);

    const curtain = page.locator('#legend-scene-curtain');
    const startedAt = Date.now();
    await page.getByRole('button', { name: /News & Roadmap/i }).click();
    await expect(curtain).toHaveClass(/is-covering/);
    await expect(curtain).toContainText('PREPARING THE NEXT SCENE');
    await expect(curtain).not.toHaveClass(/is-covering/, { timeout: 8000 });
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(1300);
    await expect(page.getByRole('heading', { name: 'News & Roadmap' })).toBeVisible();
  });
});
