const { test, expect } = require('@playwright/test');

const PUBLIC_PAGES = ['portal.html', 'blog.html', 'updates.html', 'guide.html', 'playtest.html', 'feedback.html', 'save.html', 'privacy.html'];

test.describe('LEGEND public site shell v2.3', () => {
  test('official game portal loads the shared site stylesheet and playable entry point', async ({ page }) => {
    const response = await page.goto('/portal.html');
    expect(response && response.status()).toBe(200);
    await expect(page).toHaveTitle(/LEGEND: The Awakening — Dark-Fantasy Browser RPG/i);
    await expect(page.locator('link[rel="stylesheet"][href*="legend-site-v230.css"]')).toHaveCount(1);
    await expect(page.locator('#rp-hero-title')).toBeVisible();
    await expect(page.locator('.site-nav-play')).toBeVisible();
  });

  test('Development Dispatch serves the real Brevo form and required consent fields', async ({ page }) => {
    const response = await page.goto('/updates.html');
    expect(response && response.status()).toBe(200);
    await expect(page).toHaveTitle(/Development Dispatch — LEGEND: The Awakening/i);
    await expect(page.locator('link[rel="stylesheet"][href*="legend-site-v230.css"]')).toHaveCount(1);
    const form = page.locator('form#sib-form');
    await expect(form).toBeAttached();
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', /https:\/\/[^"]+\.sibforms\.com\/serve\//i);
    await expect(form.locator('input[name="EMAIL"]')).toHaveAttribute('type', 'email');
    await expect(form.locator('input[name="EMAIL"]')).toHaveAttribute('required', '');
    await expect(form.locator('input[name="OPT_IN"]')).toHaveAttribute('required', '');
    await expect(page.locator('a[href="privacy.html"]').first()).toBeVisible();
  });

  test('privacy notice starts below the shared site navigation and returns to signup', async ({ page }) => {
    const response = await page.goto('/privacy.html');
    expect(response && response.status()).toBe(200);
    await expect(page).toHaveTitle(/Privacy Notice — LEGEND: The Awakening/i);
    const geometry = await page.evaluate(() => {
      const nav = document.querySelector('.site-nav');
      const back = document.querySelector('.prose-back');
      if (!nav || !back) throw new Error('Shared navigation or the return link is missing.');
      const navRect = nav.getBoundingClientRect();
      const backRect = back.getBoundingClientRect();
      return { navBottom: navRect.bottom, backTop: backRect.top };
    });
    expect(geometry.backTop).toBeGreaterThanOrEqual(geometry.navBottom + 8);
    await expect(page.locator('.prose-back')).toBeInViewport();
    await page.locator('.prose-back').click();
    await expect(page).toHaveURL(/updates\.html#subscribe$/);
  });

  test('every public page shares the site shell while retaining only its allowed page-specific styles', async ({ page }) => {
    let reference = null;

    for (const path of PUBLIC_PAGES) {
      const response = await page.goto('/' + path);
      expect(response && response.status(), path + ' should load').toBe(200);

      const sheets = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes =>
        nodes.map(node => node.getAttribute('href')).filter(href => !/^https?:/.test(href))
      );
      const expectedSheets = ['css/legend-site-v230.css?v=20261116-site-shell'];
      if (path === 'portal.html') expectedSheets.push('css/portal-v2.css?v=20261114-portal-v200');
      expect(sheets, path + ' should load the shared stylesheet and only its intentional page-specific stylesheet').toEqual(expectedSheets);

      await expect(page.locator('.site-header'), path + ' should render the shared header').toBeVisible();
      await expect(page.locator('.site-footer'), path + ' should render the shared footer').toBeVisible();
      await expect(page.locator('.site-brand img')).toHaveAttribute('src', 'assets/ui/logos/logo_legend_awakening_wordmark.png');

      const shell = await page.evaluate(() => ({
        nav: Array.from(document.querySelectorAll('.site-nav-links a')).map(a => a.getAttribute('href')),
        footer: Array.from(document.querySelectorAll('.site-footer-links a')).map(a => a.getAttribute('href')),
        play: document.querySelector('.site-nav-play')?.getAttribute('href') || null,
        current: document.querySelectorAll('.site-nav-links a[aria-current="page"]').length
      }));

      expect(shell.current, path + ' should mark exactly one current nav link').toBe(1);
      expect(shell.play, path + ' should offer the play button').toBe('index.html');
      if (reference === null) {
        reference = { nav: shell.nav, footer: shell.footer };
      } else {
        expect(shell.nav, path + ' navigation links').toEqual(reference.nav);
        expect(shell.footer, path + ' footer links').toEqual(reference.footer);
      }
    }
  });
});
