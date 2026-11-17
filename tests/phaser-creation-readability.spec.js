const { test, expect } = require('@playwright/test');

for (const width of [1440, 390]) {
  test(`creation preserves complete copy, draft saves and fallback at ${width}px`, async ({ browser }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
      hasTouch: width === 390, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:4173/');
      await page.waitForFunction(() => window.LegendPhaserWorldV1?.ready);
      await page.evaluate(() => {
        window.LegendStorage.savePlayer(window.LegendStorage.normalize({ username: 'ExistingTraveler',
          level: 3, gold: 27, inventory: { food: 2 }, flags: { unknownCreationFlag: 'keep' }, futureExtension: { keep: true } }));
        window.__creationSaveBefore = localStorage.getItem('legend-roads-of-ashmere-v09');
        window.LegendBeginningV094.startCreation();
      });
      const checkCopy = async step => {
        await expect.poll(() => page.evaluate(() => {
          const s = window.LegendPhaserWorldV1.snapshot();
          return { active: s.nativeCreationUi, step: s.nativeCreationUiStep, failure: s.nativeCreationUiFailure };
        }), { timeout: 15000 }).toEqual({ active: true, step, failure: '' });
        const proof = await page.evaluate(() => {
          const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
          const labels = window.LegendPhaserWorldV1.snapshot().nativeCreationUiLabels;
          return { labels, colors: scene.nativeCreationUiObjects.filter(o => o.getData?.('shellLabel')).map(o => o.style.color),
            lineSpacings: scene.nativeCreationUiObjects.filter(o => o.getData?.('shellLabel') && o.getWrappedText().length > 1).map(o => ({ spacing: o.lineSpacing, font: parseFloat(o.style.fontSize) })),
            sourceChoices: Array.from(document.querySelectorAll('.v094-choice strong,.v094-choice span,.v094-choice em')).map(n => n.textContent.trim()).filter(Boolean),
            saved: localStorage.getItem('legend-roads-of-ashmere-v09') === window.__creationSaveBefore,
            overflow: document.documentElement.scrollWidth > innerWidth };
        });
        expect(proof.saved).toBe(true);
        expect(proof.overflow).toBe(false);
        for (const label of proof.labels) {
          expect(label.width, label.sourceText).toBeLessThanOrEqual(label.sourceBounds.width + 1);
          expect(label.height, label.sourceText).toBeLessThanOrEqual(label.sourceBounds.height + 1);
          expect(label.x, label.sourceText).toBeGreaterThanOrEqual(label.sourceBounds.x - 1);
          expect(label.x + label.width, label.sourceText).toBeLessThanOrEqual(label.sourceBounds.x + label.sourceBounds.width + 1);
          if (/^STEP \d OF 7$|^SOUL TAKING SHAPE$|^TAP TO CHOOSE$/.test(label.text)) expect(label.wrappedLines).toBe(1);
        }
        expect(proof.colors.every(color => color && !/transparent|rgba\([^)]*,\s*0\)/.test(color))).toBe(true);
        for (const line of proof.lineSpacings) expect(line.spacing).toBeLessThanOrEqual(line.font * 0.6);
        const sourceTexts = proof.labels.map(label => label.sourceText);
        for (const copy of proof.sourceChoices) expect(sourceTexts).toContain(copy);
        expect(sourceTexts).not.toContain('LEGENDTHE AWAKENING');
        expect(proof.labels.some(label => /LEGEND.*AWAKENING/.test(label.text))).toBe(false);
        expect(proof.labels.some(label => label.text === `STEP ${step} OF 7`)).toBe(true);
      };
      const next = async () => {
        const button = page.locator('#v094Next');
        await button.scrollIntoViewIfNeeded();
        if (width === 390) await button.tap();
        else { await button.focus(); await page.keyboard.press('Enter'); }
      };
      await checkCopy(1);
      await next();
      await expect(page.locator('#v094NameError')).toBeVisible();
      await page.locator('#v094Name').fill('DraftTraveler');
      await next();
      const choices = ['[data-gender="unspoken"]', '[data-personality="kind"]', '[data-origin]', '[data-class="Ranger"]', '[data-keepsake="Old Map"]'];
      for (let i = 0; i < choices.length; i++) {
        await checkCopy(i + 2);
        await page.locator(choices[i]).first().click();
        await checkCopy(i + 2);
        await next();
      }
      await checkCopy(7);
      await page.locator('#v094Back').click();
      await checkCopy(6);
      await next();
      await checkCopy(7);
      // A failed canvas text fit must restore the whole semantic surface.
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        window.__creationLabelFactory = scene.createShellLabel;
        scene.createShellLabel = () => null;
        scene.clearNativeCreationUi();
        scene.syncNativeCreationUi();
      });
      expect(await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeCreationUi)).toBe(false);
      await expect(page.locator('.v094-beginning-card h2')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
      await expect(page.locator('#v094Next')).toBeEnabled();
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        scene.createShellLabel = window.__creationLabelFactory;
        scene.syncNativeCreationUi();
      });
      await checkCopy(7);
      // A thrown painter exception must leave the original creation markup visible.
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        window.__creationThrowFactory = scene.createShellLabel;
        scene.createShellLabel = () => { throw new Error('simulated creation painter failure'); };
        scene.clearNativeCreationUi();
        scene.syncNativeCreationUi();
      });
      expect(await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeCreationUi)).toBe(false);
      await expect(page.locator('.v094-beginning-card h2')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        scene.createShellLabel = window.__creationThrowFactory;
        scene.syncNativeCreationUi();
      });
      await checkCopy(7);
      // Missing canvas artwork must also restore the original images and text.
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        window.__creationArtFactory = scene.createNativeCreationArtTexture;
        scene.createNativeCreationArtTexture = () => '';
        scene.clearNativeCreationUi();
        scene.syncNativeCreationUi();
      });
      expect(await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeCreationUi)).toBe(false);
      await expect(page.locator('.v140-creation .v150-logo-lockup img')).toHaveCSS('visibility', 'visible');
      await page.evaluate(() => {
        const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
        scene.createNativeCreationArtTexture = window.__creationArtFactory;
        scene.syncNativeCreationUi();
      });
      await checkCopy(7);
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}
