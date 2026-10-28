const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const indexSource = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const versionSource = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const versionMatch = versionSource.match(/VERSION:\s*['"]v([^'"]+)['"]/);
if (!versionMatch) throw new Error('Could not read LEGEND_DATA.VERSION from js/data.js');
const version = versionMatch[1];

async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }' });
  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.locator('.v120-title-hero .v120-legend-logo')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
  await expect(page.locator('.v120-title-hero .v150-logo-lockup')).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
  await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
}

async function createTravelerToLantern(page, name = 'VeilRoadQA', options = {}) {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await expect(page.locator('.v140-dialogue-speaker strong')).toHaveText('???');
  await page.locator('#v094Name').fill(name);
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await expect(page.locator('.v094-scene-note span')).toContainText('MEMORY ECHO');
  await expect(page.locator('.v140-dialogue-speaker strong')).toHaveText('???');
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name: /Ranger Better road sense, scouting, and fleeing/i }).click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  if (options.stopAtPrologue) return;
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
}

test.describe('LEGEND v' + version + ' road-born opening', () => {
  test('title and Dead Lantern prologue establish the bell, the road, and danger before Oric', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('.v120-title-hero')).toContainText('ONE BELL · NO TOWER');
    await expect(page.locator('.v120-title-hero')).toContainText('The Old Road has begun to wake');
    await createTravelerToLantern(page, 'DeadLanternCinematicQA', { stopAtPrologue: true });
    const prologue = page.locator('.opening-road-v140-prologue-card');
    await expect(prologue).toContainText('One Bell. No Tower.');
    await expect(prologue).toContainText('Blackroot ditch');
    await expect(prologue).toContainText('No second toll');
    await expect(page.locator('.opening-road-v140-bg')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lift your head' })).toBeVisible();
    await page.getByRole('button', { name: 'Lift your head' }).click();
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await expect(page.locator('.opening-road-v140-card')).toContainText('I heard the bell from the gate');
    await expect(page.getByRole('group', { name: 'Your answer to Captain Oric' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await test.info().attach('dead-lantern-prologue.png', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  });
  test('title logo fallback keeps the correct title if the raster cannot load', async ({ page }) => {
    await openTitle(page);
    await page.locator('.v120-legend-logo').evaluate(img => img.dispatchEvent(new Event('error')));
    const fallback = page.locator('.v120-title-hero .v150-wordmark-fallback');
    await expect(fallback).toBeVisible();
    await expect(fallback).toContainText('LEGEND');
    await expect(fallback).toContainText('THE AWAKENING');
    await expect(page.locator('.v120-title-hero')).not.toContainText('Roads of Ashmere');
  });

  test('the title News & Roadmap opens a real screen and returns to the title', async ({ page }) => {
    await openTitle(page);
    await expect(page.getByRole('button', { name: /News & Roadmap/i })).toBeVisible();
    await page.getByRole('button', { name: /News & Roadmap/i }).click();
    await expect(page.locator('#legend-scene-curtain')).toContainText('PREPARING THE NEXT SCENE');
    await expect(page.getByRole('heading', { name: 'News & Roadmap' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Development News' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Roadmap' })).toBeVisible();
    await expect(page.locator('.dispatches-v140-card')).toHaveCount(8);
    await page.getByRole('button', { name: 'Return to Title' }).click();
    await expect(page.locator('.v120-title')).toBeVisible();
  });

  test('the Oric ambush teaches ACT then guides a full road expedition and secured return', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await createTravelerToLantern(page, 'FirstRoadQA');

    await expect(page.getByRole('group', { name: 'Your answer to Captain Oric' })).toBeVisible();
    await expect(page.locator('.ash100-town')).toHaveCount(0);
    await page.locator('[data-oric-response="honest"]').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Blackroot Wolf');
    await expect(page.locator('.rpg-battle')).toContainText('Awaken');
    await expect(page.locator('#strike')).toBeDisabled();
    await expect(page.locator('#guard')).toBeDisabled();
    await expect(page.locator('#skill')).toContainText('Awaken');

    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const p = window.LegendRuntimeV120.loadPlayer();
      return p.memories.some(m => m.includes('A voice without a face whispered')) &&
        p.stats.roadVictories === 1 && p.flags.openingRoadV140.awakened === true;
    })).toBe(true);

    await page.getByRole('button', { name: 'Follow the road' }).click();
    await expect(page.locator('.exp100-wrap')).toBeVisible();
    await expect(page.locator('.opening-road-v140-guide')).toContainText('The road forks');
    await expect(page.locator('#routeRidge')).toBeVisible();
    await expect(page.locator('#search')).toBeDisabled();
    await expect(page.locator('#push')).toBeDisabled();

    await page.locator('#exp150OpenMap').click();
    const fieldDialog = page.getByRole('dialog');
    await expect(fieldDialog).toContainText('The road you know');
    await expect(fieldDialog).toContainText('South Fork');
    await fieldDialog.getByRole('button', { name: 'Return to the road' }).click();
    await page.locator('#exp150OpenJournal').click();
    await expect(fieldDialog).toContainText('What the road remembers');
    await expect(fieldDialog).toContainText('No clues recorded yet');
    await fieldDialog.getByRole('button', { name: 'Return to the road' }).click();

    await page.locator('#routeRidge').click();
    await expect(page.locator('#push')).toBeDisabled();
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('#poiInspect')).toBeVisible();
    await page.locator('#poiInspect').click();
    await expect(page.locator('#search')).toBeEnabled();
    const journalState = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return player.flags.roadFieldJournalV150;
    });
    expect(journalState.visitedPlaces).toContain('South Fork');
    expect(journalState.routes.some(entry => entry.title === 'High Ridge')).toBe(true);
    expect(journalState.discoveries).toHaveLength(1);
    await page.locator('#exp150OpenJournal').click();
    await expect(fieldDialog.locator('.exp150-journal-entry')).toHaveCount(1);
    await expect(fieldDialog).toContainText('Clues & discoveries');
    await fieldDialog.getByRole('button', { name: 'Return to the road' }).click();
    await page.locator('#search').click();
    await expect(page.locator('#push')).toBeEnabled();
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Ridgeway Cairn');
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText("Wayfarer's Camp");
    await expect(page.locator('.exp100-camp')).toBeVisible();

    await page.locator('#campRest').click();
    await expect(page.locator('.exp100-head')).toContainText('rest at Wayfarer');
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Blackroot Bend');
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Reedwatch Shelter');
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Greyfen Approach');
    await page.locator('#finish').click();
    await expect(page.getByRole('heading', { name: 'Expedition Secured' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Expedition field report' })).toContainText('High Ridge');
    await expect(page.getByRole('region', { name: 'Expedition field report' })).toContainText('The Split Milestone');

    const saved = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        completed: player.flags.openingRoadV140.completed,
        tutorialStep: player.flags.tutorialStep,
        roadToken: player.inventory.roadToken,
        discoveries: player.stats.pointsOfInterest,
        campsMade: player.stats.campsMade,
        visitedPlaces: player.flags.roadFieldJournalV150?.visitedPlaces || [],
        journalRoutes: player.flags.roadFieldJournalV150?.routes || []
      };
    });
    expect(saved).toMatchObject({ completed: true, tutorialStep: 'people', discoveries: 1, campsMade: 1 });
    expect(saved.roadToken).toBeGreaterThanOrEqual(1);
    expect(saved.visitedPlaces).toEqual(['South Fork', 'Ridgeway Cairn', "Wayfarer's Camp", 'Blackroot Bend', 'Reedwatch Shelter', 'Greyfen Approach']);
    expect(saved.journalRoutes.some(entry => entry.title === 'High Ridge')).toBe(true);
    await page.getByRole('button', { name: /Return to Ashmere/i }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.getByRole('button', { name: /The Bell Cellar/i })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('an unfinished lantern conversation resumes safely after reload', async ({ page }) => {
    await createTravelerToLantern(page, 'OpeningResumeQA');
    await page.locator('[data-oric-response="peaceful"]').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    await page.getByRole('button', { name: /Continue Journey/i }).click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Awaken');
    const phase = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().flags.openingRoadV140.phase);
    expect(phase).toBe('combat');
  });

  test('new opening uses existing save key and production script order', async () => {
    expect(indexSource).toContain('js/systems/road-opening-v140.js');
    expect(indexSource).toContain('js/screens/title-dispatches-v140.js');
    expect(indexSource.indexOf('js/systems/road-controller-v100.js')).toBeLessThan(indexSource.indexOf('js/systems/road-opening-v140.js'));
    expect(indexSource).toContain('css/opening-road-v140.css');
    expect(indexSource).toContain('css/immersive-world-v150.css');
    expect(indexSource).toContain('css/bell-vault-v100.css');
    expect(indexSource).toContain('js/systems/dungeons/bell-vault-v100.js');
    expect(indexSource).toContain('css/title-dispatches-v140.css');
    expect(versionSource).toContain("SAVE_KEY: 'legend-roads-of-ashmere-v09'");
  });
});
