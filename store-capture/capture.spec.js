const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const outputDir = path.resolve(__dirname, '../store-page-screenshots');

async function openTitle(page) {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
    `
  });
  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.LEGEND_DATA?.VERSION)).toBe('v0.30.4');
}

async function capture(page, filename) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(images.map(image => image.complete ? Promise.resolve() :
      new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      })
    ));
  });
  await page.waitForTimeout(500);
  await page.mouse.move(1588, 12);
  await page.screenshot({
    path: path.join(outputDir, filename),
    fullPage: false,
    animations: 'disabled',
    caret: 'hide'
  });
}

async function createTravelerThroughOpening(page) {
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await expect(page.getByRole('heading', { name: 'When the World Went to War' })).toBeVisible();
  await capture(page, '02-the-old-war-annals-1600x900.png');

  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();

  await expect(page.locator('#v094Name')).toBeVisible();
  await page.locator('#v094Name').fill('StorePreview');
  await page.locator('#v094Next').click();
  await expect(page.locator('.v094-choice[data-gender]')).toHaveCount(4);
  await expect(page.locator('.v094-gender-emblem img')).toHaveCount(4);
  await expect.poll(() => page.locator('.v094-gender-emblem img').evaluateAll(images =>
    images.every(image => image.complete && image.naturalWidth === 512 && image.naturalHeight === 512)
  )).toBe(true);
  await capture(page, '03-traveler-creation-portraits-1600x900.png');

  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i }).click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name: 'StorePreview', exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await capture(page, '04-one-bell-no-tower-opening-1600x900.png');

  await page.getByRole('button', { name: 'Lift your head' }).click();
  await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
  await expect(page.locator('.opening-road-v140-card')).toContainText('I was taking your boots off');
  await capture(page, '05-captain-oric-on-the-road-1600x900.png');
}

test('capture genuine v0.30.4 store-page screenshots from the production game UI', async ({ page }) => {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  await openTitle(page);
  await capture(page, '01-title-screen-1600x900.png');

  await createTravelerThroughOpening(page);

  await page.locator('[data-oric-response="honest"]').click();
  await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
  await expect(page.locator('.opening-road-v140-ambush')).toContainText('A Blackroot Wolf slams into his side');
  await capture(page, '06-blackroot-wolf-ambush-1600x900.png');

  await page.getByRole('button', { name: 'Help Oric' }).click();
  await expect(page.locator('.rpg-battle')).toBeVisible();
  await expect(page.locator('.rpg-battle')).toContainText('Blackroot Wolf');
  await expect(page.locator('#skill')).toContainText('Awaken');
  await capture(page, '07-turn-based-blackroot-wolf-combat-1600x900.png');

  await page.locator('#skill').click();
  await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
  await page.getByRole('button', { name: 'Follow Oric onto the Old Road' }).click();
  await expect(page.locator('.exp100-wrap')).toBeVisible();
  await expect(page.locator('#routeRidge')).toBeVisible();
  await page.locator('#routeRidge').click();
  await expect(page.locator('.exp150-world-page')).toBeVisible();
  await expect(page.locator('.exp150-world-page')).toContainText(/High Ridge/i);
  await capture(page, '08-old-road-high-ridge-expedition-1600x900.png');

  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await expect(page.locator('.ash100-town')).toContainText('Ashmere');
  await capture(page, '09-ashmere-town-hub-1600x900.png');

  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.flags = player.flags || {};
    player.flags.firstRoadReturnSeen = true;
    player.flags.firstRoadReturnRoute = 'ridge';
    player.flags.firstRoadReturnDiscovery = 'ridge-cairn';
    player.flags.firstRoadReturnMaraBriefed = false;
    player.xp = 0;
    player.pendingStatPointsV152 = 0;
    player.flags.roadExpeditionV100 = {
      ...(player.flags.roadExpeditionV100 || {}),
      stage: 5,
      pressure: 12,
      trips: 1,
      routeChoice: 'ridge',
      poiUsed: { 'ridge-cairn': true }
    };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderExpedition();
  });
  await expect(page.locator('#finish')).toBeVisible();
  await page.evaluate(() => {
    const originalRandom = Math.random;
    window.__legendSceneTransitionBypass = true;
    Math.random = () => 0.1;
    try { document.getElementById('finish')?.click(); }
    finally {
      Math.random = originalRandom;
      window.__legendSceneTransitionBypass = false;
    }
  });
  await expect(page.locator('.v152-expedition-summary')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.v152-expedition-summary')).toContainText('5 / 5');
  await capture(page, '10-old-road-field-ledger-results-1600x900.png');

  // Greyfen is deliberately presented as in-progress content, not as a finished town.
  await page.goto('/');
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }'
  });
  await page.evaluate(() => {
    window.LegendStorage.deleteSaves();
    const player = {
      version: window.LEGEND_DATA.VERSION,
      username: 'StorePreview',
      gender: 'unspoken',
      genderLabel: 'Keep It Unspoken',
      pronouns: 'they/them',
      personality: 'kind',
      personalityLabel: 'Kind-Hearted',
      world: 'Eldermere',
      town: 'Greyfen',
      currentRegion: 'Greyfen',
      origin: 'Lost Squire',
      className: 'Ranger',
      keepsake: 'Old Map',
      level: 1,
      xp: 0,
      hp: 80,
      maxHp: 100,
      gold: 20,
      weapon: 'hand',
      armor: 'none',
      ownedWeapons: { hand: 1, ironSword: 1 },
      ownedArmor: { none: 1, chainArmor: 1 },
      inventory: { food: 2, camp: 1, potion: 1, roadToken: 0 },
      bank: [0, 0, 0, 0, 0],
      stats: {},
      flags: { firstRoadReturnSeen: true, greyfenDryCrossingComplete: true },
      traits: [],
      skills: {},
      mastery: {},
      memories: [],
      questLog: [],
      quests: {},
      discoveredRegions: ['Ashmere', 'Greyfen'],
      unlockedRegions: ['Ashmere', 'Greyfen'],
      discoveredRoutes: ['Old Road'],
      discoveredTowns: ['Ashmere', 'Greyfen']
    };
    window.LegendRuntimeV120.savePlayer(player);
    const saved = window.LegendRuntimeV120.loadPlayer();
    saved.currentRegion = 'Greyfen';
    saved.town = 'Greyfen';
    saved.discoveredRegions = ['Ashmere', 'Greyfen'];
    saved.unlockedRegions = ['Ashmere', 'Greyfen'];
    saved.flags.firstRoadReturnSeen = true;
    window.LegendRuntimeV120.savePlayer(saved);
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await page.locator('[data-ash-view="marsh"]').first().click();
  await expect(page.getByRole('main', { name: 'Greyfen Marsh Path expedition' })).toBeVisible();
  await capture(page, '11-greyfen-marsh-path-in-progress-1600x900.png');

  fs.writeFileSync(path.join(outputDir, 'README.txt'), [
    'LEGEND: The Awakening — Store Page Screenshot Pack',
    'Build: v0.30.4',
    'Capture: 1600 × 900 px (16:9), genuine in-game UI captured by Playwright from the production source',
    '',
    'Recommended primary store-page order:',
    '01 — Title screen / product identity',
    '02 — Mandatory world-history opening',
    '03 — Traveler creation with four identity portraits',
    '05 — Captain Oric and the road-born opening',
    '07 — Turn-based Blackroot Wolf combat',
    '08 — Old Road expedition',
    '09 — Ashmere town hub',
    '10 — Five-stage Old Road field ledger / expedition results',
    '',
    'Additional story and development-status captures:',
    '04 — One Bell. No Tower. opening cinematic',
    '06 — Blackroot Wolf ambush',
    '11 — Greyfen Marsh Path (in-progress content; label as in development)',
    '',
    'These images depict the live v0.30.4 game UI. They are not concept art or promotional mockups.',
    'The Greyfen image is explicitly an in-progress regional feature and should not imply a completed town.'
  ].join('\n'));
});
