const { test, expect } = require('@playwright/test');

test.describe('LEGEND level-up and road results v0.23.0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  });

  test('a level grants spendable points that persist after choosing attributes', async ({ page }) => {
    await page.evaluate(() => {
      window.LegendStorage.deleteSaves();
      const player = {
        version: window.LEGEND_DATA.VERSION,
        username: 'Growth QA',
        gender: 'unspoken',
        genderLabel: 'Unspoken',
        pronouns: 'they/them',
        personality: 'kind',
        personalityLabel: 'Kind',
        world: 'Eldermere',
        town: 'Ashmere',
        origin: 'Lost Squire',
        className: 'Ranger',
        keepsake: 'Old Map',
        level: 1,
        hp: 20,
        maxHp: 50,
        xp: 99,
        gold: 10,
        weapon: 'hand',
        armor: 'none',
        ownedWeapons: { hand: 1 },
        ownedArmor: { none: 1 },
        inventory: { food: 1, potion: 1 },
        bank: [0, 0, 0, 0, 0],
        stats: {},
        flags: {},
        traits: [],
        skills: {},
        mastery: {}
      };
      window.__growthQAPlayer = player;
      window.__growthQASummary = window.LegendProgressionV100.award(player, 1);
    });

    await expect(page.getByRole('dialog', { name: 'Level 2' })).toBeVisible();
    await expect(page.locator('#v152-growth-total')).toHaveText('2');
    await expect(page.locator('#v152-growth-confirm')).toBeDisabled();

    await page.locator('[data-attr-add="might"]').click();
    await page.locator('[data-attr-add="endurance"]').click();
    await expect(page.locator('#v152-growth-spent')).toHaveText('2');
    await expect(page.locator('#v152-growth-confirm')).toBeEnabled();
    await page.locator('#v152-growth-confirm').click();

    await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(0);
    const persisted = await page.evaluate(() => {
      const saved = window.LegendRuntimeV120.loadPlayer();
      const player = window.__growthQAPlayer;
      return {
        level: player.level,
        summary: window.__growthQASummary,
        hp: player.hp,
        maxHp: player.maxHp,
        attributes: player.attributesV152,
        pending: player.pendingStatPointsV152,
        savedAttributes: saved?.attributesV152,
        savedPending: saved?.pendingStatPointsV152
      };
    });
    expect(persisted.level).toBe(2);
    expect(persisted.summary).toMatchObject({ gained: 1, levels: 1, level: 2, xp: 0, next: 200 });
    expect(persisted.hp).toBe(31);
    expect(persisted.maxHp).toBe(61);
    expect(persisted.attributes).toEqual({ might: 1, agility: 0, arcana: 0, endurance: 1, insight: 0, fortune: 0 });
    expect(persisted.pending).toBe(0);
    expect(persisted.savedAttributes).toEqual(persisted.attributes);
    expect(persisted.savedPending).toBe(0);
  });

  test('combat results expose rewards and the continue action instead of replacing victory with a log line', async ({ page }) => {
    await page.evaluate(() => {
      let continued = 0;
      let returned = 0;
      window.__resultCallbacks = {
        continue: () => { continued += 1; },
        return: () => { returned += 1; },
        counts: () => ({ continued, returned })
      };
      window.__resultViewQA = window.LegendRoadCombatResultsViewV152.create({
        renderShell: html => { document.getElementById('root').innerHTML = html; },
        getAssets: () => window.LegendAssetsV090,
        escapeHtml: value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[ch])),
        onContinue: () => window.__resultCallbacks.continue(),
        onReturnToTown: () => window.__resultCallbacks.return()
      });
      window.__resultViewQA.render({
        result: 'victory',
        player: { username: 'Field QA', className: 'Ranger', level: 2, hp: 40, maxHp: 50 },
        enemy: { name: 'Road Goblin' },
        progress: { gained: 29, levels: 1, level: 2 },
        rewardName: 'Furs',
        goldGained: 8,
        routeStage: 2
      });
    });

    await expect(page.getByRole('main', { name: 'Battle victory results' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Victory' })).toBeVisible();
    await expect(page.locator('.v152-results-rewards')).toContainText('Furs');
    await expect(page.locator('.v152-results-rewards')).toContainText('+29');
    await expect(page.locator('.v152-result-level-note')).toContainText('Level 1 → level 2');
    await page.locator('#v152CombatContinue').click();
    expect(await page.evaluate(() => window.__resultCallbacks.counts())).toEqual({ continued: 1, returned: 0 });
    const sceneCurtain = page.locator('#legend-scene-curtain');
    if (await sceneCurtain.count()) {
      await expect.poll(() => sceneCurtain.evaluate(el =>
        !el.classList.contains('is-covering') && !el.classList.contains('is-revealing')
      )).toBe(true);
    }

    await page.evaluate(() => window.__resultViewQA.render({
      result: 'defeat',
      player: { username: 'Field QA', className: 'Ranger', level: 2, hp: 1, maxHp: 50 },
      enemy: { name: 'Road Goblin' },
      progress: { gained: 0, levels: 0, level: 2 },
      rewardName: '',
      goldGained: 0,
      routeStage: 0
    }));
    await expect(page.getByRole('heading', { name: 'Driven Back' })).toBeVisible();
    await page.locator('#v152CombatReturn').click();
    expect(await page.evaluate(() => window.__resultCallbacks.counts())).toEqual({ continued: 1, returned: 1 });
  });


  test('Bell Cellar fights use the same results frame with cellar-specific progress and choices', async ({ page }) => {
    await page.evaluate(() => {
      const callbacks = { continued: 0, returned: 0, reviewed: 0 };
      window.__cellarResultCallbacks = callbacks;
      window.__cellarResultsView = window.LegendRoadCombatResultsViewV152.create({
        renderShell: html => { document.getElementById('root').innerHTML = html; },
        getAssets: () => window.LegendAssetsV090,
        escapeHtml: value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[ch]))
      });
      window.__cellarResultsView.render({
        dungeon: true,
        locationName: 'THE BELL CELLAR',
        sceneArtKey: 'ashmereArchive',
        result: 'victory',
        player: { username: 'Cellar QA', className: 'Warrior', level: 3, hp: 64, maxHp: 70 },
        enemy: { name: 'Mirebound Sentinel' },
        progress: { gained: 45, levels: 0, level: 3 },
        rewardName: 'Bell Fragment',
        goldGained: 12,
        room: 3,
        progressLabel: 'CELLAR DEPTH',
        progressValue: '3 / 3',
        progressHint: 'Bell chamber reached',
        primaryTitle: 'Return to the chamber',
        primaryHint: 'Continue exploring the Bell Cellar',
        primaryTransition: 'The bell chamber falls silent',
        secondaryTitle: 'Return to Ashmere',
        secondaryHint: 'Leave the cellar with your rewards',
        secondaryTransition: 'Returning to Ashmere',
        onContinue: () => { callbacks.continued += 1; },
        onReturn: () => { callbacks.returned += 1; }
      });
    });

    await expect(page.getByRole('main', { name: 'Cellar victory results' })).toBeVisible();
    await expect(page.locator('.v152-results-kicker')).toContainText('THE BELL CELLAR');
    await expect(page.locator('.v152-results-metrics')).toContainText('3 / 3');
    await expect(page.locator('.v152-results-rewards')).toContainText('Bell Fragment');
    await expect(page.locator('#v152CombatContinue')).toContainText('Return to the chamber');
    await page.locator('#v152CombatContinue').click();
    await expect.poll(() => page.locator('#legend-scene-curtain').evaluate(el =>
      !el.classList.contains('is-covering') && !el.classList.contains('is-revealing')
    )).toBe(true);
    expect(await page.evaluate(() => window.__cellarResultCallbacks.continued)).toBe(1);

    await page.evaluate(() => window.__cellarResultsView.render({
      dungeon: true,
      locationName: 'THE BELL CELLAR',
      result: 'defeat',
      player: { username: 'Cellar QA', className: 'Warrior', level: 3, hp: 1, maxHp: 70 },
      enemy: { name: 'Mirebound Sentinel' },
      progress: { gained: 0, levels: 0, level: 3 },
      room: 2,
      progressLabel: 'CELLAR DEPTH',
      progressValue: '2 / 3',
      progressHint: 'Last room reached before retreat',
      primaryTitle: 'Return to Ashmere',
      primaryHint: 'Recover before attempting the cellar again',
      primaryTransition: 'Returning wounded to Ashmere',
      secondaryTitle: 'Review the cellar',
      secondaryHint: 'Review the last chamber report',
      secondaryTransition: 'Reviewing the bell chamber',
      onReturn: () => { window.__cellarResultCallbacks.returned += 1; },
      onSecondary: () => { window.__cellarResultCallbacks.reviewed += 1; }
    }));

    await expect(page.getByRole('main', { name: 'Cellar defeat results' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Driven Back' })).toBeVisible();
    await expect(page.locator('#v152CombatSecondary')).toContainText('Review the cellar');
    await page.locator('#v152CombatSecondary').click();
    await expect.poll(() => page.locator('#legend-scene-curtain').evaluate(el =>
      !el.classList.contains('is-covering') && !el.classList.contains('is-revealing')
    )).toBe(true);
    expect(await page.evaluate(() => window.__cellarResultCallbacks.reviewed)).toBe(1);
  });

  test('legacy traveler saves receive safe default growth values', async ({ page }) => {
    const result = await page.evaluate(() => {
      const normalizer = window.LegendPlayerNormalizerV120.create({
        getData: () => window.LEGEND_DATA
      });
      const player = normalizer.normalize({
        username: 'Legacy Save',
        level: 3,
        xp: 45,
        hp: 44,
        maxHp: 60
      });
      return {
        attributes: player.attributesV152,
        pending: player.pendingStatPointsV152,
        level: player.level,
        xp: player.xp,
        hp: player.hp,
        maxHp: player.maxHp
      };
    });
    expect(result.attributes).toEqual({ might: 0, agility: 0, arcana: 0, endurance: 0, insight: 0, fortune: 0 });
    expect(result.pending).toBe(0);
    expect(result).toMatchObject({ level: 3, xp: 45, hp: 44, maxHp: 60 });
  });
});
