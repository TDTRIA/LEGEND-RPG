const { test, expect } = require('@playwright/test');

test.describe('LEGEND startup and scene presentation', () => {
  test('keeps boot diagnostics hidden and opens directly into the Ashmere title', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const boot = page.locator('#legend-boot-screen');
    await expect(boot).toBeHidden();
    await expect(page.locator('#engine-skip')).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.ready), {
      timeout: 20000
    }).toBe(true);
    await expect(page.locator('.title-v230-ashmere-dom')).toBeVisible();

    const result = await page.evaluate(() => {
      const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      return {
        finished: window.__legendBootSequenceV100?.finishedAt > 0,
        manifest: window.__legendBootSequenceV100?.checks?.manifest,
        systemsReady: window.__legendBootSequenceV100?.checks?.systemsReady,
        loadingUi: Boolean(scene.loadingUi),
        awakeningActive: scene.awakeningActive,
        awakeningUi: Boolean(scene.productionAwakeningUi),
        transitionUi: Boolean(scene.transitionUi),
        bootVisible: !document.querySelector('#legend-boot-screen').hidden,
        introGate: document.documentElement.classList.contains('engine-intro-active')
      };
    });
    expect(result.finished).toBe(true);
    expect(result.manifest).toBe(true);
    expect(result.systemsReady).toBe(true);
    expect(result.loadingUi).toBe(false);
    expect(result.awakeningActive).toBe(false);
    expect(result.awakeningUi).toBe(false);
    expect(result.transitionUi).toBe(false);
    expect(result.bootVisible).toBe(false);
    expect(result.introGate).toBe(false);
    await expect(page.locator('.v136-rpg-menu')).toBeVisible();
  });

  test('uses one short scene curtain rather than a second canvas transition', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady);

    const curtain = page.locator('#legend-scene-curtain');
    const startedAt = Date.now();
    await page.getByRole('button', { name: /News & Roadmap/i }).click();
    await expect(curtain).toHaveClass(/is-covering/);
    await expect(curtain).toContainText('PREPARING THE NEXT SCENE');
    await expect(curtain).not.toHaveClass(/is-covering/, { timeout: 3000 });
    expect(Date.now() - startedAt).toBeLessThan(1600);

    const transition = await page.evaluate(() => ({
      painter: document.body.classList.contains('legend-phaser-transition-active'),
      canvasTransition: window.LegendPhaserWorldV1.snapshot()?.nativeTransition,
      opacity: document.body.style.getPropertyValue('--legend-transition-opacity')
    }));
    expect(transition.painter).toBe(false);
    expect(transition.canvasTransition).toBeFalsy();
    await expect(page.getByRole('heading', { name: 'News & Roadmap' })).toBeVisible();
  });
});
