const { test, expect } = require('@playwright/test');

test('Ashmere title uses the existing moonlit scene and crisp DOM menu at desktop and mobile sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');

  await expect(page.locator('.title-v230-ashmere-dom')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.v120-title-backdrop')).toHaveAttribute('src', /title_bg_ashmere_road_v089\.jpg/);
  await expect.poll(() => page.locator('.v120-title-backdrop').evaluate(image =>
    image.complete && image.naturalWidth > 0
  )).toBe(true);
  await expect(page.locator('.v140-realm-overview')).toBeHidden();
  await expect(page.locator('#newPrimary')).toBeVisible();
  await expect(page.locator('#newPrimary .v136-menu-copy strong')).toBeVisible();

  const mobile = await page.evaluate(() => {
    const root = document.querySelector('.title-v230-ashmere-dom');
    const menu = document.querySelector('.v136-rpg-menu');
    const button = document.querySelector('#newPrimary');
    const rect = button?.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      rootClass: root?.classList.contains('title-v230-ashmere-dom'),
      nativePainter: document.body.classList.contains('legend-phaser-title-ui-active'),
      nativeTitleUi: window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi,
      menuWidth: menu?.getBoundingClientRect().width || 0,
      button: rect ? { left: rect.left, right: rect.right, height: rect.height } : null,
      textVisibility: button ? getComputedStyle(button.querySelector('strong')).visibility : ''
    };
  });
  expect(mobile.overflow).toBe(false);
  expect(mobile.rootClass).toBe(true);
  expect(mobile.nativePainter).toBe(false);
  expect(mobile.nativeTitleUi).toBe(false);
  expect(mobile.menuWidth).toBeGreaterThan(0);
  expect(mobile.button.left).toBeGreaterThanOrEqual(0);
  expect(mobile.button.right).toBeLessThanOrEqual(390);
  expect(mobile.button.height).toBeGreaterThanOrEqual(40);
  expect(mobile.textVisibility).toBe('visible');

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#newPrimary')).toBeVisible();
  const desktop = await page.evaluate(() => {
    const button = document.querySelector('#newPrimary');
    const label = button?.querySelector('strong');
    const focusStyle = (() => {
      button?.focus();
      return getComputedStyle(button);
    })();
    const rect = button?.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      nativePainter: document.body.classList.contains('legend-phaser-title-ui-active'),
      nativeTitleUi: window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi,
      backdrop: document.querySelector('.v120-title-backdrop')?.getAttribute('src') || '',
      labelVisibility: label ? getComputedStyle(label).visibility : '',
      focusOutline: focusStyle?.outlineStyle || '',
      focusColor: focusStyle?.outlineColor || '',
      button: rect ? { left: rect.left, right: rect.right, height: rect.height } : null
    };
  });
  expect(desktop.overflow).toBe(false);
  expect(desktop.nativePainter).toBe(false);
  expect(desktop.nativeTitleUi).toBe(false);
  expect(desktop.backdrop).toContain('title_bg_ashmere_road_v089.jpg');
  expect(desktop.labelVisibility).toBe('visible');
  expect(desktop.focusOutline).toBe('solid');
  expect(desktop.focusColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(desktop.button.left).toBeGreaterThanOrEqual(0);
  expect(desktop.button.right).toBeLessThanOrEqual(1440);

  // The real DOM control keeps the original title controller and story handoff.
  await page.locator('#newPrimary').click();
  await expect(page.locator('.opening-lore-v220')).toBeVisible();
});
