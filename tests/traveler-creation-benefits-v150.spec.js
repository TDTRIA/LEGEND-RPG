const { test, expect } = require('@playwright/test');

async function choose(page, selector) {
  await page.locator(selector).first().click();
  await page.locator('#v094Next').click();
}

test('every traveler choice has its own art and gameplay effects are visible and saved', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Name').fill('MemoryQA');
  await page.locator('#v094Next').click();

  await expect(page.locator('.v094-choice[data-gender]')).toHaveCount(4);
  await expect(page.locator('.v094-choice-art img')).toHaveCount(4);
  await expect.poll(() => page.locator('.v094-choice-art img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await choose(page, '[data-gender="woman"]');

  await expect(page.locator('.v094-choice[data-personality]')).toHaveCount(5);
  await expect(page.locator('.v094-choice-art img')).toHaveCount(5);
  await expect.poll(() => page.locator('.v094-choice-art img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.locator('.v094-choice[data-personality="bold"]')).toContainText('+1 Force');
  await choose(page, '[data-personality="bold"]');

  await expect(page.locator('.v094-choice[data-origin]')).toHaveCount(6);
  await expect(page.locator('.v094-choice-art img')).toHaveCount(6);
  await expect.poll(() => page.locator('.v094-choice-art img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.locator('.v094-choice[data-origin="Wandering Cook"]')).toContainText('+3 rations');
  await expect(page.locator('.v094-choice[data-origin="Debt-Bound Thief"]')).toContainText('+40 starting gold');
  await choose(page, '[data-origin="Lost Squire"]');

  await expect(page.locator('.v094-choice[data-class]')).toHaveCount(6);
  await expect(page.locator('.v094-class-art')).toHaveCount(6);
  await expect(page.locator('.v094-choice[data-class="Warrior"]')).toContainText('HP 140');
  await expect(page.locator('.v094-choice[data-class="Warrior"]')).toContainText('+3 Force');
  await choose(page, '[data-class="Warrior"]');

  await expect(page.locator('.v094-choice[data-keepsake]')).toHaveCount(6);
  await expect(page.locator('.v094-choice-art img')).toHaveCount(6);
  await expect.poll(() => page.locator('.v094-choice-art img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await expect(page.locator('.v094-choice[data-keepsake="Bent Coin"]')).toContainText('+12% sale value');
  await expect(page.locator('.v094-choice[data-keepsake="Cooked Ration"]')).toContainText('+5 rations');
  await choose(page, '[data-keepsake="Rusty Charm"]');

  await expect(page.locator('.v094-confirm-benefits')).toBeVisible();
  await expect(page.locator('.v094-confirm-benefits')).toContainText('+1 Force on strength and physical challenge checks');
  await expect(page.locator('.v094-confirm-benefits')).toContainText('HP 140');
  await page.getByRole('button', { name: /Let Me Wake/i }).click();

  const saved = await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    const score = window.LegendRoadStateV100.create({
      getData: () => window.LEGEND_DATA,
      clamp: (value, min, max) => Math.max(min, Math.min(max, value))
    });
    return {
      gender: player.gender,
      personality: player.personality,
      origin: player.origin,
      className: player.className,
      keepsake: player.keepsake,
      hp: player.maxHp,
      gold: player.gold,
      bonuses: player.creationV094.bonuses,
      strengthScore: score.score(player, 'strength'),
      atlas: window.LegendAssetsV090.creation.atlas,
      
    };
  });
  expect(saved).toMatchObject({
    gender: 'woman',
    personality: 'bold',
    origin: 'Lost Squire',
    className: 'Warrior',
    keepsake: 'Rusty Charm',
    hp: 140,
    gold: 90,
    bonuses: { strength: 1 },
    strengthScore: 5,
    atlas: 'assets/generated/ui/icons/legend-icon-traveler.webp'
  });
});
