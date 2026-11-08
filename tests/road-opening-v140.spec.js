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

async function clearRoadBattle(page) {
  const battle=page.locator('.rpg-battle');
  if (await battle.count()) {
    await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      player.attributesV152=player.attributesV152||{};
      player.attributesV152.might=250;
      player.maxHp=Math.max(999,Number(player.maxHp||0));
      player.hp=player.maxHp;
      window.LegendRuntimeV120.savePlayer(player);
    });
    if (await battle.count()) await page.locator('#strike').click();
    const result=page.locator('.v152-combat-results');
    if (await result.count()) await page.locator('#v152CombatContinue').click();
  }
  await expect(battle).toHaveCount(0);
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

async function createTravelerToLantern(page, name = 'VeilRoadQA', options = {}) {
  await openTitle(page);
  if (options.previousRoadExperience) {
    await page.evaluate(() => {
      window.LegendStorage.savePlayer({
        version: window.LEGEND_DATA.VERSION,
        username: 'PreviousRoadVeteran',
        town: 'Ashmere',
        currentRegion: 'Ashmere',
        level: 4,
        hp: 80,
        maxHp: 80,
        gold: 40,
        inventory: {},
        stats: { roadVictories: 2, oldRoadClears: 1 },
        flags: { firstRoadReturnSeen: true, introV094Complete: true }
      });
    });
  }
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
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
  test('annals establish the old war, the underground seal and the Last Mercy before creation; Oric thought the traveler was dead', async ({ page }) => {
    await openTitle(page);
    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    await expect(page.getByRole('heading', { name: 'When the World Went to War' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Skip the annals/i })).toHaveCount(0);
    await expect(page.locator('.opening-lore-v220')).toContainText('human kingdoms and monster nations');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1?.snapshot?.()?.nativeAnnalsUi
    )).toBe(true);
    const annalsButton = page.getByRole('button', { name: /^Continue$/ });
    const normalButton = await page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      return {
        texture: snapshot.nativeAnnalsUiButtonTexture,
        bounds: snapshot.nativeAnnalsUiButtonBounds,
        label: snapshot.nativeAnnalsUiButtonLabelPosition
      };
    });
    expect(normalButton.texture).toBe('menuButtonNormal');
    expect(Math.abs(normalButton.label.x - (normalButton.bounds.x + normalButton.bounds.width / 2))).toBeLessThan(1);
    expect(Math.abs(normalButton.label.y - (normalButton.bounds.y + normalButton.bounds.height / 2))).toBeLessThan(1);
    await page.keyboard.press('Tab');
    await expect(annalsButton).toBeFocused();
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeAnnalsUiButtonTexture
    )).toBe('menuButtonSelected');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeAnnalsUiButtonFocused
    )).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'The Pact Beneath the Stone' })).toBeVisible();
    await expect(page.locator('.opening-lore-v220')).toContainText('seal over the deep ways');
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await expect(page.getByRole('heading', { name: 'The Kindness That Failed' })).toBeVisible();
    await expect(page.locator('.opening-lore-v220')).toContainText('Last Mercy');
    await expect(page.locator('.opening-lore-v220')).toContainText('the Veil');
    await page.getByRole('button', { name: /Shape the traveler/i }).click();

    await expect(page.locator('#v094Name')).toBeVisible();
    await page.locator('#v094Name').fill('AnnalsOpeningQA');
    await page.locator('#v094Next').click();
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
    await expect(page.getByRole('heading', { name: 'AnnalsOpeningQA', exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Let Me Wake/i }).click();
    await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
    await page.getByRole('button', { name: 'Lift your head' }).click();
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await expect(page.locator('.opening-road-v140-card')).toContainText('I was taking your boots off');
    await expect(page.locator('.opening-road-v140-card')).toContainText('Thought the road had given me another body');
    await expect(page.locator('.opening-road-v140-card')).not.toContainText('Friend or foe?');
    await expect(page.locator('[data-oric-response="honest"]')).toContainText('I remember a bell');
    await expectNoHorizontalOverflow(page);
  });
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
    const openingCinematic = await page.locator('.opening-road-v140-prologue-card h1').evaluate(el => getComputedStyle(el).animationName);
    expect(openingCinematic).toBe('legendOpeningTitle201');
    await expect(page.getByRole('button', { name: 'Lift your head' })).toBeVisible();
    await page.getByRole('button', { name: 'Lift your head' }).click();
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await expect(page.locator('.opening-road-v140-card')).toContainText('I was taking your boots off');
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
    await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
    await expect(page.locator('.opening-road-v140-ambush')).toContainText('Oric is hit.');
    await expect(page.locator('.opening-road-v140-ambush')).toContainText('A Blackroot Wolf slams into his side');
    await expect(page.locator('.opening-road-v140-ambush')).toContainText('Get it off me');
    await expect(page.locator('.rpg-battle')).toHaveCount(0);
    await page.getByRole('button', { name: 'Help Oric' }).click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Blackroot Wolf');
    await expect(page.locator('.rpg-battle')).toContainText('Awaken');
    await expect(page.locator('#strike')).toBeDisabled();
    await expect(page.locator('#guard')).toBeDisabled();
    await expect(page.locator('#skill')).toContainText('Awaken');

    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await expect(page.locator('#openingRoadSkip')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Follow Oric onto the Old Road' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const p = window.LegendRuntimeV120.loadPlayer();
      return p.memories.some(m => m.includes('A voice without a face whispered')) &&
        p.stats.roadVictories === 1 && p.flags.openingRoadV140.awakened === true;
    })).toBe(true);

    await page.getByRole('button', { name: 'Follow Oric onto the Old Road' }).click();
    await expect(page.locator('.exp100-wrap')).toBeVisible();
    await expect(page.locator('.opening-road-v140-guide')).toContainText('CAPTAIN ORIC');
    await expect(page.locator('.opening-road-v140-guide')).toContainText('The road forks');
    await expect(page.locator('.opening-road-v140-guide-portrait')).toHaveAttribute('src', /captain-oric\.webp/);
    await expect(page.locator('.opening-road-v140-guide-portrait')).toBeVisible();
    await expect(page.locator('#town')).toHaveCount(0);
    await expect(page.locator('.exp150-abandon-hint')).toContainText('Oric is guiding your first outing');
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
    await clearRoadBattle(page);
    await expect(page.locator('.exp100-head h1')).toHaveText("Wayfarer's Camp");
    await expect(page.locator('.exp100-camp')).toBeVisible();

    await page.locator('#campRest').click();
    await expect(page.locator('.exp100-head')).toContainText('rest at Wayfarer');
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Blackroot Bend');
    await page.locator('#push').click();
    await clearRoadBattle(page);
    await expect(page.locator('.exp100-head h1')).toHaveText('Reedwatch Shelter');
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Greyfen Approach');
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
    await expect(page.getByRole('heading', { name: 'Expedition Secured' })).toBeVisible({ timeout: 15000 });
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
    expect(saved.visitedPlaces).toEqual(['South Fork', 'Ridgeway Cairn', 'Blackroot Bend', 'Greyfen Approach']);
    expect(saved.journalRoutes.some(entry => entry.title === 'High Ridge')).toBe(true);
    const growthOverlay = page.locator('#legendLevelUpOverlay');
    if (await growthOverlay.count()) {
      const pointCount = Number((await growthOverlay.locator('#v152-growth-total').textContent() || '0').split('/').pop().trim());
      for (let point = 0; point < pointCount; point += 1) {
        await growthOverlay.locator('[data-attr-add="might"]').click();
      }
      await growthOverlay.locator('#v152-growth-confirm').click();
      await expect(growthOverlay).toHaveCount(0);
    }
    await page.getByRole('button', { name: /Return to Ashmere/i }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.getByRole('button', { name: /The Bell Cellar/i })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the Ashmere shortcut is only offered after a prior traveler has road experience', async ({ page }) => {
    await createTravelerToLantern(page, 'VeteranShortcutQA', { previousRoadExperience: true });
    await page.locator('[data-oric-response="defiant"]').click();
    await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
    await page.getByRole('button', { name: 'Help Oric' }).click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Return to Ashmere (experienced player)' })).toBeVisible();
    await page.getByRole('button', { name: 'Return to Ashmere (experienced player)' }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    const flags = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().flags);
    expect(flags.openingRoadV140.phase).toBe('skipped');
    expect(flags.openingRoadV140.veteranSkipUnlocked).toBe(true);
  });

  test('a road-experienced traveler may leave the first expedition early', async ({ page }) => {
    await createTravelerToLantern(page, 'VeteranRoadExitQA', { previousRoadExperience: true });
    await page.locator('[data-oric-response="honest"]').click();
    await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
    await page.getByRole('button', { name: 'Help Oric' }).click();
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await page.getByRole('button', { name: 'Follow Oric onto the Old Road' }).click();
    await expect(page.locator('.exp100-wrap')).toBeVisible();
    await expect(page.locator('#town')).toBeVisible();
    await page.locator('#town').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
  });

  test('an unfinished lantern conversation resumes safely after reload', async ({ page }) => {
    await createTravelerToLantern(page, 'OpeningResumeQA');
    await page.locator('[data-oric-response="peaceful"]').click();
    await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    await page.getByRole('button', { name: /Continue Journey/i }).click();
    await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
    const phase = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().flags.openingRoadV140.phase);
    expect(phase).toBe('ambush');
    await page.getByRole('button', { name: 'Help Oric' }).click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Awaken');
  });

  test('new opening uses existing save key and production script order', async () => {
    expect(indexSource).toContain('js/systems/road-opening-v140.js');
    expect(indexSource).toContain('js/screens/title-dispatches-v140.js');
    expect(indexSource.indexOf('js/systems/road-controller-v100.js')).toBeLessThan(indexSource.indexOf('js/systems/road-opening-v140.js'));
    expect(indexSource).toContain('css/opening-road-v140.css');
    expect(indexSource).toContain('css/opening-lore-v220.css');
    expect(indexSource).toContain('css/legend-visibility-contract-v220.css');
    expect(indexSource).toContain('js/systems/opening-prologue-v220.js');
    expect(indexSource).toContain('css/immersive-world-v150.css');
    expect(indexSource).toContain('css/bell-vault-v100.css');
    expect(indexSource).toContain('js/systems/dungeons/bell-vault-v100.js');
    expect(indexSource).toContain('css/title-dispatches-v140.css');
    expect(versionSource).toContain("SAVE_KEY: 'legend-roads-of-ashmere-v09'");
  });
});
