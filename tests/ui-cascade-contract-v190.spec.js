const { test, expect } = require('@playwright/test');

async function openTitle(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function expectNoHorizontalOverflow(page) {
  const width = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(width.document, JSON.stringify(width)).toBeLessThanOrEqual(width.viewport);
  expect(width.body, JSON.stringify(width)).toBeLessThanOrEqual(width.viewport);
}

test.describe('LEGEND UI cascade contract v190', () => {
  test('local stylesheets are unique, in deliberate order, and all resolve', async ({ page, request }) => {
    await openTitle(page);

    const sheetInfo = await page.locator('link[rel~="stylesheet"][href]').evaluateAll(links =>
      links.map(link => {
        const url = new URL(link.href, location.href);
        return {
          file: url.pathname.replace(/^\/+/, ''),
          origin: url.origin,
          href: url.href
        };
      }).filter(item => item.origin === location.origin && item.file.endsWith('.css'))
    );
    const files = sheetInfo.map(item => item.file);
    expect(files.length, 'expected the current local stylesheet stack').toBeGreaterThan(0);
    expect(new Set(files).size, 'duplicate local stylesheet links found').toBe(files.length);

    const position = file => files.indexOf(file);
    expect(position('css/greyfen-marsh-v160.css')).toBeGreaterThan(position('css/progression-results-v152.css'));
    expect(position('css/greyfen-marsh-v160.css')).toBeLessThan(position('css/legend-ui-system-v160.css'));
    expect(position('css/legend-ui-system-v160.css')).toBeGreaterThanOrEqual(0);
    expect(position('css/legend-world-shell-v170.css')).toBeGreaterThan(position('css/legend-ui-system-v160.css'));
    expect(position('css/legend-ui-rollout-v180.css')).toBeGreaterThan(position('css/legend-world-shell-v170.css'));
    expect(position('css/opening-cinematic-v170.css')).toBeGreaterThan(position('css/legend-ui-rollout-v180.css'));
    expect(position('css/greyfen-storehouse-v170.css')).toBeGreaterThan(position('css/greyfen-marsh-v160.css'));
    expect(position('css/legend-ui-system-v160.css')).toBeGreaterThan(position('css/greyfen-storehouse-v170.css'));
    expect(files).toHaveLength(41);

    const responses = await Promise.all(files.map(async file => ({
      file,
      response: await request.get('/' + file)
    })));
    for (const { file, response } of responses) {
      expect(response.status(), file).toBe(200);
      expect(response.headers()['content-type'] || '', file).toMatch(/text\/css|text\/plain/i);
    }
  });

  test('title realm fills desktop as a game menu and lets the footer flow on smaller screens', async ({ page }) => {
    await openTitle(page, { width: 1440, height: 900 });
    const desktop = await page.evaluate(() => {
      const shell = document.querySelector('.title-v136-rpg');
      const main = shell?.querySelector('.v120-title-main');
      const realm = shell?.querySelector('.v140-realm-overview');
      const footer = shell?.querySelector('.portal100-footer');
      return {
        viewport: window.innerHeight,
        shellHeight: shell?.getBoundingClientRect().height || 0,
        pageHeight: document.documentElement.scrollHeight,
        mainPosition: main ? getComputedStyle(main).position : '',
        realmPosition: realm ? getComputedStyle(realm).position : '',
        footerPosition: footer ? getComputedStyle(footer).position : '',
        portalRing: shell ? getComputedStyle(shell, '::before').display : ''
      };
    });
    expect(Math.abs(desktop.shellHeight - desktop.viewport)).toBeLessThanOrEqual(2);
    expect(desktop.pageHeight).toBeLessThanOrEqual(desktop.viewport + 2);
    expect(desktop.mainPosition).toBe('absolute');
    expect(desktop.realmPosition).toBe('absolute');
    expect(desktop.footerPosition).toBe('absolute');
    expect(desktop.portalRing).toBe('none');

    for (const viewport of [{ width: 820, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await expectNoHorizontalOverflow(page);
      const responsive = await page.evaluate(() => {
        const shell = document.querySelector('.title-v136-rpg');
        const realm = shell?.querySelector('.v140-realm-overview');
        const footer = shell?.querySelector('.portal100-footer');
        return {
          viewport: window.innerHeight,
          shellHeight: shell?.getBoundingClientRect().height || 0,
          realmPosition: realm ? getComputedStyle(realm).position : '',
          footerPosition: footer ? getComputedStyle(footer).position : ''
        };
      });
      expect(responsive.shellHeight).toBeGreaterThan(responsive.viewport - 2);
      expect(responsive.realmPosition).toBe('relative');
      expect(responsive.footerPosition).toBe('relative');
    }
  });

  test('production title stays readable and within desktop and 390px touch viewports', async ({ page }) => {
    await openTitle(page, { width: 1440, height: 900 });
    const titleComputed = await page.locator('.v120-title-hero').evaluate(element => ({
      radius: getComputedStyle(element).borderRadius,
      logoSrc: element.querySelector('.v120-legend-logo')?.getAttribute('src') || '',
      title: element.querySelector('h1')?.textContent || ''
    }));
    expect(titleComputed.radius).toBe('2px');
    expect(titleComputed.logoSrc).toMatch(/\.png(?:\?.*)?$/);
    expect(titleComputed.title).toMatch(/LEGEND/i);
    await expectNoHorizontalOverflow(page);
    await test.info().attach('cascade-audit-title-desktop.png', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoHorizontalOverflow(page);
    await test.info().attach('cascade-audit-title-390px.png', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    });
  });
});
