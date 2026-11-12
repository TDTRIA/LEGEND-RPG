const { test, expect } = require('@playwright/test');

async function openTitle(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  // Use the browser's supported accessibility preference so the game itself
  // skips its scene curtain. Never blanket-disable transitions: that can leave
  // a transition overlay visible and contaminate UI screenshots.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  await page.waitForFunction(() =>
    window.__legendPhaserWorldReady === true,
    null,
    { timeout: 20000 }
  );

  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.locator('.v120-title-hero .v150-logo-lockup')).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
}

async function clickCreationTarget(page, selector, first = false) {
  const candidates = page.locator(selector);
  const target = first ? candidates.first() : candidates;
  await expect(target).toBeVisible();
  await target.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  await page.waitForTimeout(180);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(180);
  const point = await target.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    const style = getComputedStyle(el);
    return {
      x, y, width: rect.width, height: rect.height,
      top: rect.top, bottom: rect.bottom,
      transform: style.transform, transition: style.transition,
      animation: style.animationName,
      hit: hit ? { tag: hit.tagName, id: hit.id, className: String(hit.className || '').slice(0, 80) } : null,
      matches: Boolean(hit && (hit === el || el.contains(hit))),
      scrollY: window.scrollY
    };
  });
  console.log('[LEGEND UI creation pointer check]', selector, JSON.stringify(point));
  expect(point.matches, selector + ' must be the real pointer target').toBe(true);
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(80);
}

/** Creates a fresh traveler through the live title/opening flow at the requested desktop or mobile viewport. */
async function enterAshmere(page, name = 'UIProofQA', viewport = { width: 1440, height: 900 }, afterTitleReady = null) {
  await openTitle(page, viewport);
  if (typeof afterTitleReady === 'function') await afterTitleReady(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
  await page.locator('#v094Name').fill(name);
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-gender="unspoken"]');
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-personality="kind"]');
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-origin]', true);
  await clickCreationTarget(page, '#v094Next');
  await expect(page.getByRole('button', { name: /Ranger/i })).toBeVisible();
  await clickCreationTarget(page, '[data-class="Ranger"]');
  await clickCreationTarget(page, '#v094Next');
  await clickCreationTarget(page, '[data-keepsake="Old Map"]');
  await clickCreationTarget(page, '#v094Next');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await clickCreationTarget(page, '#v094Next');
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}

async function seedRoad(page, stage = 0, route = null, sideTrip = null) {
  await page.evaluate(({ stage, route, sideTrip }) => {
    const player = window.LegendRuntimeV120.loadPlayer();
    player.inventory = player.inventory || {};
    player.inventory.food = Math.max(2, Number(player.inventory.food || 0));
    player.flags = player.flags || {};
    player.flags.roadExpeditionV100 = {
      ...(player.flags.roadExpeditionV100 || {}),
      stage, pressure: 12, trips: 1, events: 0, finds: 0, battles: 0,
      routeChoice: route,
      activeSideTripV160: sideTrip,
      poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, roadClockHour: 15
    };
    player.flags.roadFieldJournalV150 = { visitedPlaces: [], discoveries: [], routes: [], campReports: [] };
    window.LegendRuntimeV120.savePlayer(player);
    window.LegendRoadControllerV100.renderExpedition();
  }, { stage, route, sideTrip });
  await expect(page.locator('.exp150-world-page')).toBeVisible();
}

async function attachProof(page, name) {
  await test.info().attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  });
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(metrics.document, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.body, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
}

test('Phaser road background follows the live route and stage, with a DOM image fallback', async ({ page }) => {
    test.setTimeout(90_000);
    await enterAshmere(page, 'RoadSceneArtQA');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Freeze the RealmScene tween manager before changing the road stage so
    // this test samples a deterministic in-progress transition rather than
    // racing the real 720ms animation against Playwright scheduling.
    await page.evaluate(() => {
      const scene = window.LegendPhaserWorldV1?.engine?.scene?.getScene('RealmScene');
      if (!scene?.tweens) throw new Error('RealmScene tween manager is unavailable.');
      window.__legendRoadTweenTest = {
        manager: scene.tweens,
        previousTimeScale: scene.tweens.timeScale
      };
      scene.tweens.timeScale = 0;
    });
    let duringFade;
    try {
      await seedRoad(page, 0, null);
      duringFade = await page.evaluate(() => {
        const snapshot = window.LegendPhaserWorldV1.snapshot();
        const image = document.querySelector('.exp100-scene-live > img');
        return {
          alpha: snapshot.nativeRoadSceneArt?.backgroundAlpha,
          nativeActive: snapshot.nativeRoadSceneArt?.active,
          handoffClass: document.body.classList.contains('legend-phaser-road-scene-art-active'),
          domOpacity: getComputedStyle(image).opacity,
          domVisibility: getComputedStyle(image).visibility
        };
      });
      expect(duringFade.alpha).toBeLessThan(0.99);
      expect(duringFade.nativeActive).toBe(false);
      expect(duringFade.handoffClass).toBe(false);
      expect(duringFade.domOpacity).toBe('1');
      expect(duringFade.domVisibility).toBe('visible');
    } finally {
      await page.evaluate(() => {
        const state = window.__legendRoadTweenTest;
        if (!state) return;
        state.manager.timeScale = state.previousTimeScale;
        delete window.__legendRoadTweenTest;
      });
    }
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.backgroundAlpha || 0
    )).toBeGreaterThanOrEqual(0.99);

    const cases = [
      { stage: 0, route: null, environment: 'road' },
      { stage: 1, route: 'ridge', environment: 'ridge' },
      { stage: 1, route: 'reeds', environment: 'reeds' },
      { stage: 2, route: 'ridge', environment: 'camp' },
      { stage: 3, route: 'ridge', environment: 'blackroot' },
      { stage: 4, route: 'reeds', environment: 'marsh' },
      { stage: 5, route: 'reeds', environment: 'greyfen' },
      { stage: 1, route: 'ridge', sideTrip: 'windbreak', environment: 'ridge' },
      { stage: 1, route: 'reeds', sideTrip: 'sunken-cart', environment: 'reeds' }
    ];

    for (const item of cases) {
      await seedRoad(page, item.stage, item.route, item.sideTrip || null);
      await expect.poll(() => page.evaluate(() =>
        window.LegendPhaserWorldV1?.snapshot?.()?.environment
      )).toBe(item.environment);
      await expect.poll(() => page.evaluate(() =>
        window.LegendPhaserWorldV1?.snapshot?.()?.nativeRoadSceneArt?.active
      )).toBe(true);

      const proof = await page.evaluate(() => {
        const snapshot = window.LegendPhaserWorldV1.snapshot();
        const image = document.querySelector('.exp100-scene-live > img');
        const style = image ? getComputedStyle(image) : null;
        return {
          environment: snapshot.environment,
          sceneArt: snapshot.nativeRoadSceneArt,
          activeClass: document.body.classList.contains('legend-phaser-road-scene-art-active'),
          fallbackOpacity: style?.opacity || '',
          fallbackVisibility: style?.visibility || '',
          sceneImageFilter: style?.filter || '',
          canvasFilter: getComputedStyle(document.querySelector('#game-container canvas') || document.body).filter,
          sceneSource: image?.getAttribute('src') || '',
          sceneLabel: document.querySelector('.exp100-scene-label')?.textContent || ''
        };
      });
      expect(proof.environment).toBe(item.environment);
      expect(proof.sceneArt.textureKey).toBe(item.environment);
      expect(proof.sceneArt.sourceWidth).toBeGreaterThan(0);
      expect(proof.sceneArt.sourceHeight).toBeGreaterThan(0);
      expect(proof.sceneArt.actualSource).toBe(proof.sceneArt.expectedSource);
      expect(proof.sceneSource).toBe(proof.sceneArt.actualSource);
      expect(proof.sceneImageFilter).not.toContain('blur(');
      expect(proof.canvasFilter).not.toContain('blur(');
      expect(proof.activeClass).toBe(true);
      expect(proof.fallbackOpacity).toBe('0');
      expect(proof.fallbackVisibility).toBe('hidden');
      expect(proof.sceneLabel).toContain('THE OLD ROAD');
    }

    // Simulate a failed Phaser texture request independently of the DOM image.
    // The DOM source remains correct, but a missing Phaser texture must restore it.
    await seedRoad(page, 1, 'ridge');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);
    const missingTextureFallback = await page.evaluate(() => {
      const scene = document.querySelector('.exp100-scene-live');
      const image = scene?.querySelector(':scope > img');
      const originalExists = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene').textures.exists;
      const textureManager = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene').textures;
      let proof;
      try {
        textureManager.exists = function(key) {
          if (key === 'ridge') return false;
          return originalExists.call(this, key);
        };
        const active = window.LegendPhaserWorldV1.refreshRoadScene();
        const style = getComputedStyle(image);
        proof = {
          active,
          classActive: document.body.classList.contains('legend-phaser-road-scene-art-active'),
          expectedSource: window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.expectedSource,
          actualSource: image?.getAttribute('src') || '',
          opacity: style.opacity,
          visibility: style.visibility
        };
      } finally {
        textureManager.exists = originalExists;
        window.LegendPhaserWorldV1.refreshRoadScene();
      }
      return proof;
    });
    expect(missingTextureFallback.active).toBe(false);
    expect(missingTextureFallback.classActive).toBe(false);
    expect(missingTextureFallback.actualSource).toBe(missingTextureFallback.expectedSource);
    expect(missingTextureFallback.opacity).toBe('1');
    expect(missingTextureFallback.visibility).toBe('visible');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);

    // Simulate an image/texture mismatch without changing any expedition state.
    // Phaser must stop hiding the authored DOM image when its source no longer
    // matches the environment that is currently loaded.
    const fallback = await page.evaluate(() => {
      const image = document.querySelector('.exp100-scene-live > img');
      const original = image.getAttribute('src');
      image.setAttribute('src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
      const active = window.LegendPhaserWorldV1.refreshRoadScene();
      const style = getComputedStyle(image);
      const result = {
        active,
        classActive: document.body.classList.contains('legend-phaser-road-scene-art-active'),
        opacity: style.opacity,
        visibility: style.visibility,
        original
      };
      image.setAttribute('src', original);
      window.LegendPhaserWorldV1.refreshRoadScene();
      return result;
    });
    expect(fallback.active).toBe(false);
    expect(fallback.classActive).toBe(false);
    expect(fallback.opacity).toBe('1');
    expect(fallback.visibility).toBe('visible');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);

    // Repeat on a narrow viewport; the real journey UI remains DOM controls
    // while the stage-specific world image is rendered by Phaser.
    await page.setViewportSize({ width: 390, height: 844 });
    await seedRoad(page, 1, 'ridge');
    await expect.poll(() => page.evaluate(() =>
      window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt?.active
    )).toBe(true);
    const mobile = await page.evaluate(() => ({
      environment: window.LegendPhaserWorldV1.snapshot()?.environment,
      sceneArt: window.LegendPhaserWorldV1.snapshot()?.nativeRoadSceneArt,
      canvas: document.querySelector('#game-container canvas')?.getBoundingClientRect().toJSON(),
      scene: document.querySelector('.exp100-scene-live')?.getBoundingClientRect().toJSON(),
      mapButton: document.querySelector('#exp150OpenMap')?.getBoundingClientRect().toJSON() || null,
      routeButtons: Array.from(document.querySelectorAll('.exp150-world-page button:enabled'))
        .filter(button => button.getClientRects().length)
        .map(button => ({
          id: button.id,
          width: button.getBoundingClientRect().width,
          height: button.getBoundingClientRect().height
        }))
    }));
    expect(mobile.environment).toBe('ridge');
    expect(mobile.sceneArt.active).toBe(true);
    expect(mobile.canvas.width).toBeGreaterThanOrEqual(390);
    expect(mobile.scene.width).toBeGreaterThan(0);
    expect(mobile.mapButton.width).toBeGreaterThan(0);
    expect(mobile.mapButton.height).toBeGreaterThanOrEqual(36);
    expect(mobile.routeButtons.length).toBeGreaterThan(0);
    expect(mobile.routeButtons.every(button => button.width > 0 && button.height > 0)).toBe(true);
    const roadMotion = await page.evaluate(() => {
      const rules = Array.from(document.styleSheets).flatMap(sheet => {
        try { return Array.from(sheet.cssRules || []); } catch { return []; }
      });
      return ['exp100-road-arrive', 'exp100-discovery-arrive'].map(name =>
        rules.filter(rule => rule.name === name).map(rule => rule.cssText).join(' ')
      );
    });
    expect(roadMotion.every(rule => rule.length > 0 && !rule.includes('blur('))).toBe(true);
    await expectNoHorizontalOverflow(page);
  });
