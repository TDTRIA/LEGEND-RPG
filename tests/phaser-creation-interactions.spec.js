const { test, expect } = require('@playwright/test');

async function openTitle(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready');
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
  await page.waitForFunction(() =>
    window.__legendPhaserWorldReady === true &&
    Boolean(window.LegendPhaserWorldV1?.engine?.scene?.getScene('RealmScene')),
    null,
    { timeout: 20000 }
  );
  await expect(page.locator('.v120-title')).toBeVisible({ timeout: 10000 });
}

async function clickVisible(page, selector, first = false) {
  const candidates = page.locator(selector);
  const locator = first ? candidates.first() : candidates;
  await expect(locator).toBeVisible({ timeout: 10000 });
  await expect(locator).toBeEnabled();
  await locator.click({ timeout: 10000 });
}

test('traveler memory updates stay local to the Phaser creation painter and every step remains actionable', async ({ page }) => {
  test.setTimeout(90000);
  await openTitle(page);

  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();

  await expect(page.locator('#v094Name')).toBeVisible();
  await page.locator('#v094Name').fill('CreationRefreshQA');
  await clickVisible(page, '#v094Next');
  await expect(page.locator('[data-gender="unspoken"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    window.LegendPhaserWorldV1.snapshot()?.nativeCreationUi
  ), { timeout: 10000 }).toBe(true);

  await clickVisible(page, '[data-gender="unspoken"]');
  await clickVisible(page, '#v094Next');
  await expect(page.locator('[data-personality="kind"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => ({
    surface: window.LegendPhaserWorldV1.snapshot()?.surface,
    step: window.LegendPhaserWorldV1.snapshot()?.nativeCreationUiStep,
    active: window.LegendPhaserWorldV1.snapshot()?.nativeCreationUi
  }))).toMatchObject({ surface: 'creation', step: 3, active: true });

  // A personality selection updates its memory-echo text inside the current
  // creation DOM. That must repaint only the creation surface, not run the
  // world-wide inference path (which also repaints unrelated town/drawer UI).
  await page.evaluate(() => {
    const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    if (typeof scene.syncNativeTownBoardUi !== 'function') {
      throw new Error('RealmScene town-board painter hook is unavailable for the observer regression check.');
    }
    const original = scene.syncNativeTownBoardUi;
    window.__legendCreationObserverProbe = { count: 0, original };
    scene.syncNativeTownBoardUi = function (...args) {
      window.__legendCreationObserverProbe.count += 1;
      return original.apply(this, args);
    };
  });

  await clickVisible(page, '[data-personality="kind"]');
  await expect(page.locator('.v094-scene-note span')).toContainText('MEMORY ECHO');
  await expect(page.locator('.v094-scene-note span')).toContainText(/KIND-HEARTED/i);
  const unrelatedPainterCalls = await page.evaluate(() => window.__legendCreationObserverProbe.count);
  expect(unrelatedPainterCalls, 'creation-only mutations must not repaint the town board').toBe(0);
  await expect.poll(() => page.evaluate(() =>
    window.LegendPhaserWorldV1.snapshot()?.nativeCreationUi
  )).toBe(true);

  await clickVisible(page, '#v094Next');
  await expect(page.locator('[data-origin]').first()).toBeVisible();
  await clickVisible(page, '[data-origin]', true);
  await clickVisible(page, '#v094Next');
  await expect(page.locator('[data-class="Ranger"]')).toBeVisible();
  await clickVisible(page, '[data-class="Ranger"]');
  await clickVisible(page, '#v094Next');
  await expect(page.locator('[data-keepsake="Old Map"]')).toBeVisible();
  await clickVisible(page, '[data-keepsake="Old Map"]');
  await clickVisible(page, '#v094Next');

  await expect(page.getByRole('heading', { name: 'CreationRefreshQA', exact: true })).toBeVisible();
  await clickVisible(page, '#v094Next');
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();

  await page.evaluate(() => {
    const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
    const probe = window.__legendCreationObserverProbe;
    if (probe?.original) scene.syncNativeTownBoardUi = probe.original;
    delete window.__legendCreationObserverProbe;
  });
});


test('production screen changes use one transition owner and creation choices use restrained focus frames', async ({ browser }) => {
  test.setTimeout(120000);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready');
    });
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
    await page.waitForFunction(() => window.LegendPhaserWorldV1?.ready);
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    await expect(page.getByRole('heading', { name: 'When the World Went to War' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => {
      const snapshot = window.LegendPhaserWorldV1.snapshot();
      const screen = document.querySelector('#root')?.firstElementChild;
      return {
        surface: snapshot.surface,
        transitionCount: snapshot.surfaceTransitionCount,
        transitionCurtain: document.body.classList.contains('legend-phaser-transition-active'),
        duplicateEntranceClass: Boolean(screen?.classList.contains('legend-scene-arriving') ||
          screen?.classList.contains('legend-scene-arrived'))
      };
    })).toEqual({
      surface: 'annals',
      transitionCount: 0,
      transitionCurtain: false,
      duplicateEntranceClass: false
    });

    await page.getByRole('button', { name: /^Continue$/ }).click();
    await expect(page.getByRole('heading', { name: 'The Pact Beneath the Stone' })).toBeVisible();
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await expect(page.getByRole('heading', { name: 'The Peace, Written Down' })).toBeVisible();
    await page.getByRole('button', { name: /Shape the traveler/i }).click();
    await expect(page.locator('#v094Name')).toBeVisible();
    await expect.poll(() => page.evaluate(() => ({
      surface: window.LegendPhaserWorldV1.snapshot().surface,
      transitionCount: window.LegendPhaserWorldV1.snapshot().surfaceTransitionCount,
      nativeCreation: window.LegendPhaserWorldV1.snapshot().nativeCreationUi,
      duplicateEntranceClass: Boolean(document.querySelector('#root')?.firstElementChild?.classList.contains('legend-scene-arriving'))
    }))).toMatchObject({ surface: 'creation', transitionCount: 0, nativeCreation: true, duplicateEntranceClass: false });

    await page.locator('#v094Name').fill('TransitionQA');
    await page.locator('#v094Next').click();
    await expect(page.locator('[data-gender]')).toHaveCount(4);
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeCreationUiStep)).toBe(2);

    // The pointer can remain over a newly-rendered card after a screen handoff.
    // Move it to empty canvas and blur the prior action before checking the
    // neutral, unhovered state; a hover outline is intentional and not a stale frame.
    await page.mouse.move(1400, 850);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await page.waitForTimeout(80);

    const unselected = await page.locator('.v094-choice').evaluateAll(nodes => {
      const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      return nodes.map(node => {
        const style = getComputedStyle(node);
        const painted = scene.nativeCreationUiControls.find(control => control.button === node);
        return {
          text: node.textContent.trim(),
          hovered: node.matches(':hover'),
          focused: node === document.activeElement || node.matches(':focus-visible'),
          outlineStyle: style.outlineStyle,
          focusFrameVisible: Boolean(painted?.focusFrame?.visible)
        };
      });
    });
    expect(unselected).toHaveLength(4);
    expect(unselected.every(item => !item.hovered && !item.focused && !item.focusFrameVisible)).toBe(true);
    expect(unselected.every(item => item.outlineStyle === 'none')).toBe(true);

    const firstChoice = page.locator('.v094-choice').first();
    await firstChoice.focus();
    expect(await firstChoice.evaluate(node => node === document.activeElement)).toBe(true);
    const visibleFrames = await page.evaluate(() => {
      const scene = window.LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      return scene.nativeCreationUiControls.filter(control => control.focusFrame?.visible)
        .map(control => ({ id: control.id, color: control.focusColor }));
    });
    expect(visibleFrames).toHaveLength(1);
    expect(visibleFrames[0].id).toMatch(/^choice-gender-/);
    expect(visibleFrames[0].color).toBe(0xb5d99a);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
