const { test, expect } = require('@playwright/test');

function cssBackgroundAlphas(value) {
  return Array.from(String(value || '').matchAll(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/g), match => Number(match[1]));
}

function expectBackgroundAlphaAtMost(value, maximum) {
  const alphas = cssBackgroundAlphas(value);
  expect(alphas.length, 'expected an rgba background layer in: ' + value).toBeGreaterThan(0);
  expect(Math.max(...alphas)).toBeLessThanOrEqual(maximum);
}

async function enterAshmere(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
  await page.locator('#v094Name').fill('AshmereLightQA');
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.locator('[data-class="Ranger"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name: 'AshmereLightQA', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await expect(page.locator('#legend-world-shell-root')).toBeHidden();
  await expect(page.locator('body')).toHaveClass(/legend-world-scene-town/);
  await expect(page.locator('body')).toHaveClass(/legend-world-region-ashmere/);
}

test('Ashmere scene art remains full-bleed without the retired town shell', async ({ page }) => {
  await enterAshmere(page);

  await expect.poll(() => page.locator('.ashmere-hub-v240-backdrop img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);

  const visual = await page.evaluate(() => {
    const shell = document.getElementById('legend-world-shell-root');
    const hub = document.querySelector('.ashmere-hub-v240');
    const image = hub?.querySelector('.ashmere-hub-v240-backdrop img');
    return {
      shellHidden: !shell || shell.hidden,
      shellActive: document.body.classList.contains('legend-world-shell-active'),
      fullBleed: (() => {
        const backdrop=hub?.querySelector('.ashmere-hub-v240-backdrop')?.getBoundingClientRect();
        return Boolean(backdrop && backdrop.left<=0 && backdrop.right>=innerWidth-1 && backdrop.width>=innerWidth-1);
      })(),
      imageSrc: image?.currentSrc || '',
      imageOpacity: image ? getComputedStyle(image).opacity : '',
      atmosphere: hub ? getComputedStyle(hub.querySelector('.ashmere-hub-v240-atmosphere')).backgroundImage : ''
    };
  });

  expect(visual.shellHidden).toBe(true);
  expect(visual.shellActive).toBe(false);
  expect(visual.fullBleed).toBe(true);
  expect(visual.imageSrc).toContain('location_ashmere_mainstreet_v1.jpg');
  expect(visual.imageOpacity).toBe('0.3');
  expect(visual.atmosphere).toContain('linear-gradient');
});
