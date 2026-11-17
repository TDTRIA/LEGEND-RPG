const { test, expect } = require('@playwright/test');

for (const width of [1440, 390]) {
  test(`traveler creation keeps all seven steps readable and interactive in DOM at ${width}px`, async ({ browser }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
      hasTouch: width === 390, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready');
      });
      await page.reload();
      await expect(page.locator('.v120-title')).toBeVisible();
      await page.evaluate(() => {
        window.LegendStorage.savePlayer(window.LegendStorage.normalize({ username: 'ExistingTraveler',
          level: 3, gold: 27, inventory: { food: 2 }, flags: { unknownCreationFlag: 'keep' }, futureExtension: { keep: true } }));
        window.__creationSaveBefore = localStorage.getItem('legend-roads-of-ashmere-v09');
        window.LegendBeginningV094.startCreation();
      });
      const checkStep = async heading => {
        await expect(page.locator('.v140-creation:not(.v140-arrival)')).toBeVisible();
        await expect(page.locator('.v094-beginning-card')).toBeVisible();
        const state = await page.evaluate(() => {
          const screen = document.querySelector('.v140-creation');
          const title = screen?.querySelector('h1,h2,h3');
          const next = screen?.querySelector('#v094Next');
          return {
            surface: window.LegendPhaserWorldV1.snapshot()?.surface,
            classActive: document.body.classList.contains('legend-phaser-creation-ui-active'),
            title: title?.textContent.trim() || '',
            titleColor: title ? getComputedStyle(title).color : '',
            nextColor: next ? getComputedStyle(next).color : '',
            nextVisible: Boolean(next && getComputedStyle(next).visibility === 'visible'),
            overflow: document.documentElement.scrollWidth > innerWidth
          };
        });
        expect(state.surface).toBe('creation');
        expect(state.classActive).toBe(false);
        expect(state.title).toBeTruthy();
        expect(state.titleColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(state.nextVisible).toBe(true);
        expect(state.nextColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(state.overflow).toBe(false);
        if (heading) await expect(page.getByRole('heading', { name: heading })).toBeVisible();
        expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09') === window.__creationSaveBefore)).toBe(true);
      };
      const next = async () => {
        const button = page.locator('#v094Next');
        await button.scrollIntoViewIfNeeded();
        if (width === 390) await button.tap(); else { await button.focus(); await page.keyboard.press('Enter'); }
      };
      await checkStep();
      await next();
      await expect(page.locator('#v094NameError')).toBeVisible();
      await page.locator('#v094Name').fill('DraftTraveler');
      await next();
      const choices = ['[data-gender="unspoken"]', '[data-personality="kind"]', '[data-origin]', '[data-class="Ranger"]', '[data-keepsake="Old Map"]'];
      for (const selector of choices) {
        await expect(page.locator(selector).first()).toBeVisible();
        const option = page.locator(selector).first();
        await expect(option).toHaveAttribute('aria-pressed', 'false');
        const color = await option.evaluate(node => getComputedStyle(node).color);
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
        if (width === 390) await option.tap(); else await option.focus().then(() => page.keyboard.press('Enter'));
        await expect(option).toHaveAttribute('aria-pressed', 'true');
        await next();
        await checkStep();
      }
      await expect(page.getByRole('heading', { name: 'DraftTraveler', exact: true })).toBeVisible();
      await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}
