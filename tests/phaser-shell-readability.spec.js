const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
for (const width of [1440, 390]) {
  test(`shell keeps complete labels, numbers and real drawer actions at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'Shell Readability', hp: 23, maxHp: 40, gold: 73, currentRegion: 'Ashmere',
        inventory: { food: 17, potion: 9, roadToken: 4 },
        flags: { introV094Complete: true, customShellFlag: true }, futureExtension: { keep: true }
      }));
      window.LegendAshmereV099.route('trader');
    });
    const original = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
    const snapshot = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
    await expect.poll(async () => (await snapshot()).nativeHudLabels.map(label => label.sourceText)).toEqual(expect.arrayContaining(['LEGEND', 'Current location', 'Trading Post', '23 / 40', '73g']));
    if (width === 390) await page.locator('[data-world-action="toggle-left"]').tap();
    await expect.poll(async () => (await snapshot()).nativeLeftDrawerUi).toBe(true);
    await expect.poll(async () => (await snapshot()).nativeLeftDrawerLabels.map(label => label.sourceText)).toEqual(expect.arrayContaining(['4 tokens', '73g', '17', '9']));
    await expect(page.locator('#lws-panel-left .lws-tag strong')).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    const left = (await snapshot()).nativeLeftDrawerLabels;
    for (const value of ['17', '9']) {
      const label = left.find(item => item.sourceText === value);
      expect(label.width).toBeGreaterThan(0);
      expect(label.x + label.width).toBeLessThanOrEqual(label.sourceBounds.x + label.sourceBounds.width + 0.5);
    }
    expect(left.some(label => label.sourceText.startsWith('Landmarks, discoveries') && label.wrappedLines > 1)).toBe(true);
    // A label that cannot fit keeps its semantic DOM copy visible.
    const rationValue = page.locator('#lws-panel-left .lws-small-list li').filter({ hasText: 'Rations' }).locator('strong');
    await rationValue.evaluate(node => { node.style.width = '1px'; window.LegendPhaserWorldV1.refreshLeftDrawer(); });
    await expect(rationValue).not.toHaveAttribute('data-legend-phaser-left-text', 'true');
    await expect(rationValue).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await rationValue.evaluate(node => { node.style.removeProperty('width'); window.LegendPhaserWorldV1.refreshLeftDrawer(); });
    const scroll = page.locator('#lws-panel-left .lws-panel-scroll');
    await scroll.evaluate(node => { node.scrollTop = node.scrollHeight; });
    const journal = page.locator('#lws-panel-left [data-world-action="journal"]');
    await journal.focus();
    await expect(journal).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ash099-head h1')).not.toHaveText('Trading Post');
    await page.evaluate(() => window.LegendAshmereV099.route('trader'));
    if (width === 390) {
      if (await page.locator('body').evaluate(node => node.classList.contains('legend-shell-left-open'))) await page.locator('[data-world-action="toggle-left"]').tap();
      await page.locator('[data-world-action="toggle-right"]').tap();
    }
    await expect.poll(async () => (await snapshot()).nativeRightDrawerUi).toBe(true);
    const right = (await snapshot()).nativeRightDrawerLabels;
    expect(right.some(label => label.sourceText.includes('stores and records') && label.wrappedLines > 1)).toBe(true);
    await expect(page.locator('#root')).toHaveAttribute('data-legend-shell-clip', 'true');
    const clip = await page.locator('#root').evaluate(node => ({
      top: parseFloat(node.style.getPropertyValue('--legend-shell-clip-top')),
      right: parseFloat(node.style.getPropertyValue('--legend-shell-clip-right'))
    }));
    if (width === 390) { expect(clip.top).toBeGreaterThan(50); expect(clip.right).toBeGreaterThan(250); }
    await page.locator('#lws-panel-right [data-world-action="world"]').tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(original);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) {
      if (await page.locator('body').evaluate(node => node.classList.contains('legend-shell-right-open'))) await page.locator('[data-world-action="toggle-right"]').tap();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.locator('[data-world-action="toggle-left"]').tap();
      await expect.poll(async () => (await snapshot()).nativeLeftDrawerUi).toBe(true);
      await page.locator('[data-world-action="toggle-left"]').tap();
      await expect.poll(() => page.locator('#root').evaluate(node => parseFloat(node.style.getPropertyValue('--legend-shell-clip-left')))).toBe(0);
      await expect.poll(() => page.locator('#root').evaluate(node => parseFloat(node.style.getPropertyValue('--legend-shell-clip-right')))).toBe(0);
    }
  });
}

test('long location survives orientation changes, drawers and saved feedback in native and DOM HUD', async ({ page }) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
  await page.evaluate(() => {
    LegendStorage.savePlayer(LegendStorage.normalize({
      username: 'Long HUD Location', hp: 23, maxHp: 40, gold: 73, currentRegion: 'Ashmere',
      flags: { introV094Complete: true, customHudFlag: true }, futureExtension: { keep: true }
    }));
    LegendAshmereV099.route('quests');
  });
  // Opening the daily board establishes its existing calendar baseline before comparison.
  const saved = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
  const location = page.locator('#lws-current-location');
  for (const [width, height] of [[390, 844], [844, 390], [1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await expect(location).toHaveText('Daily Board & Road Contracts');
    await expect.poll(() => page.evaluate(() => {
      const label = LegendPhaserWorldV1.snapshot().nativeHudLabels.find(item => item.sourceText === 'Daily Board & Road Contracts');
      const rect = document.querySelector('#lws-current-location').getBoundingClientRect();
      return Boolean(label && Math.abs(label.sourceBounds.width - rect.width) < 1 && label.x + label.width <= rect.right + 1);
    })).toBe(true);
    if (width < 1200) {
      const geometry = await page.evaluate(() => {
        const hud = document.querySelector('.lws-hud').getBoundingClientRect();
        const title = document.querySelector('#lws-current-location').getBoundingClientRect();
        return { hud: hud.height, title: title.height, width: title.width, top: title.top, controlsBottom: document.querySelector('.lws-hud-save').getBoundingClientRect().bottom };
      });
      expect(geometry.width).toBeGreaterThan(270);
      expect(geometry.title).toBeLessThan(20);
      expect(geometry.hud).toBeLessThan(width === 390 ? 80 : 110);
      expect(geometry.top).toBeGreaterThan(geometry.controlsBottom);
      for (const side of ['left', 'right']) {
        const toggle = page.locator(`[data-world-action="toggle-${side}"]`);
        await toggle.tap();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect.poll(() => page.evaluate(side => {
          const panel = document.querySelector(`#lws-panel-${side}`).getBoundingClientRect();
          return panel.top - document.querySelector('.lws-hud').getBoundingClientRect().bottom;
        }, side)).toBeGreaterThanOrEqual(6);
        await toggle.tap();
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const save = page.getByRole('button', { name: 'Save traveler', exact: true });
  await save.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.lws-shell-toast')).toHaveText('Traveler record saved locally.');
  expect(await page.locator('.lws-shell-toast').evaluate(node => node.getBoundingClientRect().top - document.querySelector('.lws-hud').getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(6);
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(saved);
  // A text-size change can grow the HUD without a window resize.
  await location.evaluate(node => { node.style.fontSize = '24px'; });
  await expect.poll(() => page.evaluate(() => {
    const shell = document.querySelector('#legend-world-shell-root');
    return Math.abs(parseFloat(shell.style.getPropertyValue('--lws-hud-height')) - shell.querySelector('.lws-hud').getBoundingClientRect().height);
  })).toBeLessThan(1);
  await page.locator('[data-world-action="toggle-left"]').tap();
  expect(await page.locator('#lws-panel-left').evaluate(node => node.getBoundingClientRect().top - document.querySelector('.lws-hud').getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(6);
  expect(errors).toEqual([]);
  // A missing production renderer leaves complete source labels and Save usable.
  await page.route('**/js/engine/phaser-world-v1.js*', route => route.abort());
  await page.reload();
  await page.waitForFunction(() => window.LegendAshmereV099);
  await page.evaluate(() => LegendAshmereV099.route('quests'));
  await expect(location).toHaveText('Daily Board & Road Contracts');
  await expect(location).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
  expect(await location.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
  await save.tap();
  await expect(page.locator('.lws-shell-toast')).toHaveText('Traveler record saved locally.');
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(saved);
  expect(errors).toEqual([]);
});
