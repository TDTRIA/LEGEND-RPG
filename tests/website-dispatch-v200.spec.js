const { test, expect } = require('@playwright/test');

test.describe('LEGEND official site v2.0', () => {
  test('official game portal loads its scoped theme and playable entry point', async ({ page }) => {
    const response = await page.goto('/portal.html');
    expect(response && response.status()).toBe(200);
    await expect(page).toHaveTitle(/LEGEND: The Awakening — Official Game Site/i);
    await expect(page.locator('link[rel="stylesheet"][href*="realm-portal-v200.css"]')).toHaveCount(1);
    await expect(page.locator('#rp-hero-title')).toBeVisible();
    await expect(page.getByRole('link', { name: /Play the Game/i })).toBeVisible();
  });

  test('Development Dispatch serves the real Brevo form and required consent fields', async ({ page }) => {
    const response = await page.goto('/updates.html');
    expect(response && response.status()).toBe(200);
    await expect(page).toHaveTitle(/Development Dispatch — LEGEND: The Awakening/i);
    await expect(page.locator('link[rel="stylesheet"][href*="development-dispatch-v200.css"]')).toHaveCount(1);
    const form = page.locator('form#sib-form');
    await expect(form).toBeAttached();
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', /https:\/\/[^"]+\.sibforms\.com\/serve\//i);
    await expect(form.locator('input[name="EMAIL"]')).toHaveAttribute('type', 'email');
    await expect(form.locator('input[name="EMAIL"]')).toHaveAttribute('required', '');
    await expect(form.locator('input[name="OPT_IN"]')).toHaveAttribute('required', '');
    await expect(page.locator('a[href="privacy.html"]')).toBeVisible();
  });

  test('privacy notice starts below the responsive dispatch navigation and returns to signup', async ({ page }) => {
    const response = await page.goto('/privacy.html');
    expect(response && response.status()).toBe(200);
    await expect(page).toHaveTitle(/Privacy Notice — LEGEND: The Awakening/i);
    const geometry = await page.evaluate(() => {
      const nav = document.querySelector('.dd-nav');
      const back = document.querySelector('.privacy-back');
      if (!nav || !back) throw new Error('Privacy navigation or return link is missing.');
      const navRect = nav.getBoundingClientRect();
      const backRect = back.getBoundingClientRect();
      return { navBottom: navRect.bottom, backTop: backRect.top };
    });
    expect(geometry.backTop).toBeGreaterThanOrEqual(geometry.navBottom + 8);
    await expect(page.locator('.privacy-back')).toBeInViewport();
    await page.locator('.privacy-back').click();
    await expect(page).toHaveURL(/updates\.html#subscribe$/);
  });

  test('Chronicle and player-support pages link back to the official game portal', async ({ page }) => {
    for (const path of ['blog.html', 'feedback.html', 'guide.html', 'playtest.html', 'save.html']) {
      const response = await page.goto('/' + path);
      expect(response && response.status(), path + ' should load').toBe(200);
      const portalLink = page.locator('a[href="portal.html"]').filter({ hasText: 'Official Game Site' }).first();
      await expect(portalLink, path + ' should expose the official portal link').toBeVisible();
    }
  });
});
