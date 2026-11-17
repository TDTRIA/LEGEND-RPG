const { test, expect } = require('@playwright/test');

test('title interface remains sharp, readable and actionable as DOM at mobile and desktop sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready');
  });
  await page.reload();
  await expect(page.locator('.v120-title')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('#newPrimary')).toBeVisible();
  await expect(page.locator('#newPrimary strong')).toBeVisible();
  await expect(page.locator('.v150-logo-lockup .v120-legend-logo')).toHaveCSS('visibility', 'visible');
  const mobile = await page.evaluate(() => ({
    active: document.body.classList.contains('legend-phaser-title-ui-active'),
    headingColor: getComputedStyle(document.querySelector('.v120-title-hero > p')).color,
    buttonColor: getComputedStyle(document.querySelector('#newPrimary strong')).color,
    buttonBg: getComputedStyle(document.querySelector('#newPrimary')).backgroundColor,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  }));
  expect(mobile.active).toBe(false);
  expect(mobile.headingColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(mobile.buttonColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(mobile.buttonBg).not.toBe('rgba(0, 0, 0, 0)');
  expect(mobile.overflow).toBe(false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#newPrimary')).toBeVisible();
  await page.locator('#newPrimary').focus();
  await expect(page.locator('#newPrimary')).toBeFocused();
  await page.locator('#newPrimary').click();
  await expect(page.locator('.opening-lore-v220')).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-title-ui-active/);
});
