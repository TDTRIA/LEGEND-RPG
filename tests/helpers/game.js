const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');

function readGameVersion() {
  const dataSource = fs.readFileSync(path.join(__dirname, '../../js/data.js'), 'utf8');
  const versionMatch = dataSource.match(/VERSION:\s*['"]v([^'"]+)['"]/);
  if (!versionMatch) throw new Error('Could not read LEGEND_DATA.VERSION from js/data.js');
  return versionMatch[1];
}

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  // Disable decorative motion only in the isolated test browser context.
  await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }" });
  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
}

// Mobile supplies its touch-aware interaction helper; desktop uses Playwright clicks.
async function startFreshCharacter(page, name = 'QATraveler', interact = (_page, locator) => locator.click()) {
  await openTitle(page);
  await interact(page, page.getByRole('button', { name: /Begin Your Journey/i }));
  await page.locator('#v094Name').fill(name);
  await interact(page, page.locator('#v094Next'));
  await interact(page, page.locator('[data-gender="unspoken"]'));
  await interact(page, page.locator('#v094Next'));
  await interact(page, page.locator('[data-personality="kind"]'));
  await interact(page, page.locator('#v094Next'));
  await interact(page, page.locator('[data-origin]').first());
  await interact(page, page.locator('#v094Next'));
  await interact(page, page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i }));
  await interact(page, page.locator('#v094Next'));
  await interact(page, page.locator('[data-keepsake="Old Map"]'));
  await interact(page, page.locator('#v094Next'));
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await interact(page, page.getByRole('button', { name: /Begin the Road/i }));
  await interact(page, page.getByRole('button', { name: /Enter Ashmere/i }));
  await expect(page.locator('.ash100-town')).toBeVisible();
}

module.exports = { readGameVersion, openTitle, startFreshCharacter };
