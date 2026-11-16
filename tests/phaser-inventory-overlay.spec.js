const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
for (const width of [1440, 390]) {
  test(`inventory preserves focus, scrolling, save and sheet handoff at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'InventoryQA', hp: 40, maxHp: 40, gold: 25, currentRegion: 'Ashmere',
        inventory: { food: 3, potion: 2, ...Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`keepsake${i}`, i + 1])) },
        weapon: 'ironSword', armor: 'clothArmor',
        flags: { introV094Complete: true, customInventoryFlag: 'preserved' }, futureExtension: { keep: true }
      }));
      window.LegendAshmereV099.renderAshmere();
    });
    const save = () => page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
    const original = await save();
    const native = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeInventory);
    const invoker = page.locator('.lws-bottom-bar [data-world-action="inventory"]');
    await invoker.focus();
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await native()).active).toBe(true);
    const modal = page.locator('#legend-world-shell-modal-root');
    const close = modal.locator('.lws-close-btn');
    const sheet = modal.locator('[data-world-action="traveler-sheet"]');
    await expect(close).toBeFocused();
    await expect(close).toHaveCSS('outline-style', 'none');
    await page.keyboard.press('Shift+Tab');
    await expect(sheet).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    expect((await native()).labels).toEqual(expect.arrayContaining(['Carried: 20', 'EQUIPPED', 'Weapon', 'Armor']));
    const content = modal.locator('.lws-modal-content');
    await expect(content).toHaveCSS('background-image', 'none');
    await expect(modal).toHaveCSS('backdrop-filter', 'none');
    expect((await native()).clipBounds.height).toBeGreaterThan(0);
    await content.evaluate(node => { node.scrollTop = node.scrollHeight; });
    await expect(modal.locator('.lws-equipped-list')).toBeInViewport();
    expect(await save()).toBe(original);
    await page.keyboard.press('Escape');
    await expect(invoker).toBeFocused();
    await expect.poll(async () => (await native()).active).toBe(false);
    await invoker.tap();
    await expect.poll(async () => (await native()).active).toBe(true);
    await sheet.tap();
    await expect(page.locator('.ash099-traveler-profile')).toBeVisible();
    await expect.poll(async () => (await native()).active).toBe(false);
    expect(await save()).toBe(original);
    await page.evaluate(() => window.LegendWorldShellModalsV170.openInventory({ inventory: {} }));
    await expect.poll(async () => (await native()).active).toBe(true);
    expect((await native()).labels).toContain('Your pack is empty. The road may yet provide.');
    await modal.getByRole('button', { name: 'Return to the world', exact: true }).tap();
    await expect(modal).toBeHidden();
    await page.evaluate(() => window.LegendWorldShellModalsV170.openInventory(null));
    await expect.poll(async () => (await native()).active).toBe(true);
    expect((await native()).labels).toContain('Inventory unavailable');
    // Unknown/incomplete structure restores the complete semantic DOM presentation.
    await modal.locator('.lws-modal-header').evaluate(node => node.remove());
    await expect.poll(async () => (await native()).active).toBe(false);
    await expect(modal.getByRole('button', { name: 'Close', exact: true })).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await modal.getByRole('button', { name: 'Close', exact: true }).tap();
    await page.evaluate(() => window.LegendWorldShellModalsV170.openSettings());
    await expect.poll(async () => (await native()).active).toBe(false);
    await expect(page.locator('body')).not.toHaveClass(/legend-phaser-inventory-active/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await save()).toBe(original);
  });
}
