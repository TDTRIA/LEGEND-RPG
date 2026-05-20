const { test, expect } = require('@playwright/test');

async function startFreshCharacter(page, name = 'Playtest') {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByText('LEGEND').first()).toBeVisible();
  await page.getByRole('button', { name: /New Recovered Save/i }).click();

  await page.getByPlaceholder(/Name/i).fill(name);
  await page.getByRole('button', { name: /^Continue$/i }).click();

  await page.getByRole('button', { name: /Wandering Cook/i }).click();
  await page.getByRole('button', { name: /Ranger/i }).click();
  await page.getByRole('button', { name: /Old Map/i }).click();

  await page.getByRole('button', { name: /Enter Ashmere/i }).click();
  await expect(page.getByText(/Ashmere Menu/i)).toBeVisible();
}

test.describe('LEGEND v0.5 smoke tests', () => {
  test('new player can create a character and reach Ashmere', async ({ page }) => {
    await startFreshCharacter(page, 'Roadtest');

    await expect(page.getByRole('button', { name: /Explore The First Road/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /People of Ashmere/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ashmere Inn/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Trading Post/i })).toBeVisible();
  });

  test('player can talk to Mara and start the bell quest', async ({ page }) => {
    await startFreshCharacter(page, 'MaraTest');

    await page.getByRole('button', { name: /People of Ashmere/i }).click();
    await page.getByRole('button', { name: /Mara Vell/i }).click();
    await page.getByRole('button', { name: /Ask about the bell/i }).click();

    await expect(page.getByText(/Recovered Memory|Mara says|People of Ashmere/i)).toBeVisible();
  });

  test('player can open the inn and prepare for the road', async ({ page }) => {
    await startFreshCharacter(page, 'InnTest');

    await page.getByRole('button', { name: /Ashmere Inn/i }).click();
    await expect(page.getByText(/Ashmere Inn/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Rest - 35g/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Buy Camp Supplies - 90g/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Buy Road Meal - 55g/i })).toBeVisible();
  });

  test('player can enter The First Road and see route choices', async ({ page }) => {
    await startFreshCharacter(page, 'RoadTest');

    await page.getByRole('button', { name: /Explore The First Road/i }).click();
    await expect(page.getByText(/Choose a Route/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Old Road/i })).toBeVisible();
  });

  test('desktop game page has no obvious horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBe(false);
  });

  test('mobile layout loads and has tappable buttons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByText('LEGEND').first()).toBeVisible();
    const newSave = page.getByRole('button', { name: /New Recovered Save/i });
    await expect(newSave).toBeVisible();

    const box = await newSave.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
