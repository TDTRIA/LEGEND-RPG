const { test, expect } = require('@playwright/test');

for (const width of [1440, 390]) {
  test(`Oric's opening keeps dialogue, text and choices readable in DOM at ${width}px`, async ({ browser }) => {
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
        const player = window.LegendStorage.normalize({ username: 'OpeningQA', level: 1, hp: 40, maxHp: 40,
          gold: 17, inventory: { food: 2 }, flags: { customOpeningFlag: 'keep' }, futureExtension: { keep: true } });
        window.LegendStorage.savePlayer(player);
        window.LegendRoadOpeningV140.start();
        window.__openingSaveBefore = localStorage.getItem('legend-roads-of-ashmere-v09');
      });
      const expectReadable = async (selector, text) => {
        const node = page.locator(selector).first();
        await expect(node).toBeVisible();
        if (text) await expect(node).toContainText(text);
        const color = await node.evaluate(element => getComputedStyle(element).color);
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
        await expect(page.locator('body')).not.toHaveClass(/legend-phaser-opening-ui-active/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      };
      await expect(page.locator('.opening-road-v140-prologue')).toBeVisible();
      await expectReadable('.opening-road-v140-prologue-lede', 'A single bronze note');
      await expectReadable('#openingPrologueContinue', 'Lift your head');
      expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09') === window.__openingSaveBefore)).toBe(true);
      const action = page.locator('#openingPrologueContinue');
      await action.scrollIntoViewIfNeeded();
      await action.focus();
      await expect(action).toBeFocused();
      if (width === 390) await action.tap(); else await page.keyboard.press('Enter');
      await expect(page.getByRole('group', { name: 'Your answer to Captain Oric' })).toBeVisible();
      await expectReadable('.opening-road-v140-card', 'Beneath the Dead Lantern');
      const answer = page.locator('[data-oric-response="honest"]');
      await expectReadable('[data-oric-response="honest"]', 'I remember a bell');
      if (width === 390) await answer.tap(); else await answer.click();
      await expect(page.locator('#openingRoadHelpOric')).toBeVisible();
      await expectReadable('#openingRoadHelpOric');
      await page.locator('#openingRoadHelpOric').click();
      await expect(page.locator('.rpg-battle')).toBeVisible();
      await expect(page.locator('.rpg-battle')).toContainText('Blackroot Wolf');
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
