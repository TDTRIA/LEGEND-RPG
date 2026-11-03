const { test, expect } = require('@playwright/test');

async function openPrototype(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
  // Remove only the prototype's own save. Never clear the site's production save keys.
  await page.evaluate(() => localStorage.removeItem('legend-reboot-prototype-save-v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
  // Disable decorative motion only in the automated browser fixture so click
  // stability is not coupled to cinematic transitions or Phaser camera pulses.
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  ` });
  await page.waitForFunction(() => Boolean(window.LegendWorldShellV170));
}

test.describe('LEGEND Phaser reboot prototype', () => {
  test('completes the Phaser engine awakening naturally and remembers the boot for this tab', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#engine-skip')).toBeVisible();
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    const firstBoot = await page.evaluate(() => ({
      state: window.__legendRebootBridge.snapshot(),
      marker: sessionStorage.getItem('legend-phaser-engine-awakened-v1')
    }));
    expect(firstBoot.state.engineAwakened).toBe(true);
    expect(firstBoot.marker).toBe('ready');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('#engine-skip')).toBeHidden();
    expect(await page.evaluate(() => window.__legendRebootBridge.snapshot().engineAwakened)).toBe(true);
  });

  test('keeps the production interface usable if the Phaser CDN is unavailable', async ({ page }) => {
    await page.route('https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js', route => route.abort());
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.classList.contains('engine-intro-active'))).toBe(false);
    await expect(page.locator('#engine-skip')).toBeHidden();
  });

  test('plays the Phaser-native engine awakening and supports an accessible skip', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prototypes/reboot/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#engine-skip')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('engine-intro-active'))).toBe(true);
    await page.locator('#engine-skip').click();
    await page.waitForFunction(() => window.__legendRebootReady === true, null, { timeout: 15000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    const state = await page.evaluate(() => window.__legendRebootBridge.snapshot());
    expect(state.engineAwakened).toBe(true);
    expect(state.environment).toBe('title');
    await expect(page.locator('body')).not.toContainText('INITIALIZING WORLD ENGINE');
    await expect(page.locator('body')).not.toContainText('BUILDING THE SCENE GRAPH');
    await expect(page.locator('#engine-skip')).toBeHidden();
  });

  test('loads a responsive Phaser world canvas and the correct title', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await openPrototype(page);
    await expect(page).toHaveTitle(/LEGEND: The Awakening — Phaser Reboot/);
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('.v150-logo-lockup')).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
    await expect(page.locator('.v151-realm-dispatch')).toContainText('Greyfen');
    await expect(page.locator('.site-top')).toHaveCount(0);
    await expect(page.locator('.prototype-note')).toHaveCount(0);
    await expect(page.locator('.v140-realm-overview-head')).not.toContainText('BUILD');
    await expect(page.locator('.v151-realm-dispatch-head')).toContainText('FIELD NOTES');
    await expect(page.locator('.v120-title-footer')).toContainText('ASHMERE · THE OLD ROAD · GREYFEN');
    await expect(page.locator('.v120-title-footer')).not.toContainText('v0.30.');
    await expect(page.locator('#newPrimary')).toBeVisible();
    await expect(page.locator('#dispatches')).toBeVisible();
    await expect(page.locator('#settings')).toBeVisible();
    await expect.poll(() => page.evaluate(() => typeof window.LegendTitleAudioV120?.startAmbience)).toBe('function');
    await expect(page.locator('#account')).toHaveCount(0);
    await expect(page.locator('#game-container canvas')).toHaveCount(1);
    await expect.poll(async () => page.locator('#game-container canvas').evaluate(canvas => canvas.width)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.__legendRebootBridge?.version)).toBe('phaser-engine-v1');
    const engineSnapshot = await page.evaluate(() => window.__legendRebootBridge.snapshot());
    expect(engineSnapshot.engineAwakened).toBe(true);
    await expect(page.locator('#engine-skip')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.classList.contains('engine-intro-active'))).toBe(false);
    const titleAtmosphere = await page.evaluate(() => window.__legendRebootBridge?.snapshot?.());
    expect(titleAtmosphere.environment).toBe('title');
    expect(titleAtmosphere.atmosphereCount).toBeGreaterThanOrEqual(30);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => document.body.classList.add('a11y-reduced-motion'));
    await expect.poll(async () => page.evaluate(() => window.__legendRebootBridge.snapshot().parallaxEnabled)).toBe(false);
    await page.evaluate(() => document.body.classList.remove('a11y-reduced-motion'));
    await expect.poll(async () => page.evaluate(() => window.__legendRebootBridge.snapshot().parallaxEnabled)).toBe(true);

    await page.evaluate(() => window.__legendRebootBridge.setEnvironment('marsh', true));
    const marshAtmosphere = await page.evaluate(() => window.__legendRebootBridge.snapshot());
    expect(marshAtmosphere.environment).toBe('marsh');
    expect(marshAtmosphere.atmosphereCount).toBeGreaterThan(titleAtmosphere.atmosphereCount);
    await page.evaluate(() => window.__legendRebootBridge.setEnvironment('title', true));

    await page.locator('#dispatches').click();
    await expect(page.locator('.dispatches-v140')).toBeVisible();
    await expect.poll(async () => page.evaluate(() => window.__legendRebootBridge.snapshot().surface)).toBe('dispatches');
    await expect.poll(async () => page.evaluate(() => window.__legendRebootBridge.snapshot().surfaceTransitionCount)).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { name: 'News & Roadmap' })).toBeVisible();
    await page.locator('#dispatchesBack').click();
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.locator('#settings').click();
    await expect(page.locator('.settings09x')).toBeVisible();
    await expect(page.locator('[data-setting]')).toHaveCount(6);
    await page.locator('#saveSettings').click();
    await page.locator('#backTitle').click();
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.locator('#credits').click();
    await expect(page.locator('.legend-credits-overlay')).toBeVisible();
    await page.locator('[data-credits-close]').click();
    await expect(page.locator('.v120-title')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('plays mandatory annals, actual traveler creation, Oric opening and production ACT encounter', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await openPrototype(page);
    await page.locator('#newPrimary').click();

    await expect(page.getByRole('heading', { name: 'When the World Went to War' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Skip the annals/i })).toHaveCount(0);
    await expect(page.locator('.opening-lore-v220')).toContainText('human kingdoms and monster nations');
    await page.locator('#openingLoreContinue').click();

    await expect(page.getByRole('heading', { name: 'The Pact Beneath the Stone' })).toBeVisible();
    await expect(page.locator('.opening-lore-v220')).toContainText('seal over the deep ways');
    await page.locator('#openingLoreContinue').click();

    await expect(page.getByRole('heading', { name: 'The Kindness That Failed' })).toBeVisible();
    await expect(page.locator('.opening-lore-v220')).toContainText('Last Mercy');
    await expect(page.locator('.opening-lore-v220')).toContainText('the Veil');
    await page.locator('#openingLoreContinue').click();

    await page.locator('#v094Name').fill('PhaserRoadQA');
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
    await expect(page.getByRole('heading', { name: 'PhaserRoadQA', exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Let Me Wake/i }).click();

    await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
    await page.locator('#openingPrologueContinue').click();
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await expect(page.locator('.opening-road-v140')).toContainText('I was taking your boots off');
    await page.locator('[data-oric-response="honest"]').click();
    await expect(page.getByRole('heading', { name: 'Oric is hit.' })).toBeVisible();
    await expect(page.locator('.opening-road-v140')).toContainText('???');
    await page.locator('#openingRoadHelpOric').click();

    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Blackroot Wolf');
    await expect(page.locator('#skill')).toBeEnabled();
    await page.locator('#skill').click();

    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible({ timeout: 8000 });
    await page.locator('#openingRoadContinue').click();
    await expect(page.locator('.exp150-world-page')).toBeVisible();
    await expect(page.locator('#routeRidge')).toBeVisible();
    await expect(page.locator('#routeReeds')).toBeVisible();

    const saved = await page.evaluate(() => ({
      key: window.__legendRebootSaveKey,
      player: window.LegendRuntimeV120.loadPlayer()?.username,
      region: window.LegendRuntimeV120.loadPlayer()?.currentRegion,
      victories: window.LegendRuntimeV120.loadPlayer()?.stats?.roadVictories || 0
    }));
    expect(saved.key).toBe('legend-reboot-prototype-save-v1');
    expect(saved.player).toBe('PhaserRoadQA');
    expect(saved.region).toBe('Ashmere');
    expect(saved.victories).toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
  });

  test('loads the current town, road, combat, Greyfen and dungeon production facades', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await openPrototype(page);
    const services = await page.evaluate(() => ({
      town: typeof window.LegendAshmereV099?.renderAshmere === 'function',
      road: typeof window.LegendRoadControllerV100?.start === 'function',
      combat: typeof window.LegendRoadCombatV100?.start === 'function',
      opening: typeof window.LegendRoadOpeningV140?.start === 'function',
      regions: typeof window.LegendRegionsV100?.render === 'function',
      greyfen: typeof window.LegendGreyfenMarshV160?.start === 'function',
      bellCellar: typeof window.LegendBellVaultV100?.create === 'function',
      storehouse: typeof window.LegendGreyfenStorehouseV170?.create === 'function',
      worldShell: typeof window.LegendWorldShellV170?.refresh === 'function'
    }));
    expect(services).toEqual({
      town: true, road: true, combat: true, opening: true,
      regions: true, greyfen: true, bellCellar: true, storehouse: true, worldShell: true
    });

    const town = await page.evaluate(() => {
      const options = window.LegendPlayerCreationOptionsV094;
      const player = window.LegendPlayerRecordV094.create({
        data: window.LEGEND_DATA,
        name: 'TownSystemsQA',
        gender: options.gender('unspoken'),
        personality: options.personality('kind'),
        originId: 'Lost Squire',
        classId: 'Ranger',
        keepsakeId: 'Old Map',
        baseSkills: window.LegendStorage.baseSkills,
        normalize: window.LegendStorage.normalize
      });
      window.LegendRuntimeV120.savePlayer(player);
      window.LegendAshmereV099.renderAshmere();
      return {
        currentRegion: window.LegendRuntimeV120.loadPlayer().currentRegion,
        menuViews: Array.from(document.querySelectorAll('[data-ash-view]')).map(button => button.dataset.ashView)
      };
    });
    expect(town.currentRegion).toBe('Ashmere');
    expect(town.menuViews).toContain('inn');
    expect(town.menuViews).toContain('trader');
    expect(town.menuViews).toContain('smith');
    expect(town.menuViews).toContain('work');
    expect(town.menuViews).toContain('quests');
    expect(town.menuViews).toContain('regions');
    await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
    await expect(page.locator('#legend-world-shell-root')).toBeVisible();
    await page.locator('#legend-world-shell-root [data-world-action="inventory"]').click();
    await expect(page.locator('#legend-world-shell-modal-root')).toBeVisible();
    await expect.poll(async () => page.evaluate(() => window.__legendRebootBridge.snapshot().surface)).toBe('modal');
    await page.locator('#legend-world-shell-modal-root [data-shell-modal-close]').click();
    await expect.poll(async () => page.evaluate(() => window.__legendRebootBridge.snapshot().surface)).toBe('town');
    expect(pageErrors).toEqual([]);
  });

  test('supports a narrow viewport without horizontal overflow', async ({ page }) => {
    await openPrototype(page, { width: 390, height: 844 });
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      canvas: document.querySelector('#game-container canvas')?.getBoundingClientRect().width || 0
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.canvas).toBeGreaterThan(0);
    await expect(page.locator('#newPrimary')).toBeVisible();
  });
});
