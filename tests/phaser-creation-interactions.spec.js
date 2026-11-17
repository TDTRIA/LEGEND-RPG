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
  await page.waitForFunction(() => window.__legendPhaserWorldReady === true &&
    Boolean(window.LegendPhaserWorldV1?.engine?.scene?.getScene('RealmScene')), null, { timeout: 20000 });
  await expect(page.locator('.v120-title')).toBeVisible({ timeout: 10000 });
}

async function clickVisible(page, selector, first = false) {
  const locator = first ? page.locator(selector).first() : page.locator(selector);
  await expect(locator).toBeVisible({ timeout: 10000 });
  await expect(locator).toBeEnabled();
  await locator.click({ timeout: 10000 });
}

test('traveler memory updates remain local DOM changes and every creation step remains actionable', async ({ page }) => {
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
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);

  await clickVisible(page, '[data-gender="unspoken"]');
  await clickVisible(page, '#v094Next');
  await expect(page.locator('[data-personality="kind"]')).toBeVisible();
  await expect(page.locator('.v094-choice-grid')).toBeVisible();
  const surface = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.surface);
  expect(surface).toBe('creation');

  // Selection updates the current memory-echo text without remounting the world.
  const sceneCount = await page.locator('.v140-creation').count();
  await clickVisible(page, '[data-personality="kind"]');
  await expect(page.locator('.v094-scene-note span')).toContainText('MEMORY ECHO');
  await expect(page.locator('.v094-scene-note span')).toContainText(/KIND-HEARTED/i);
  expect(await page.locator('.v140-creation').count()).toBe(sceneCount);
  await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);

  await clickVisible(page, '#v094Next');
  await clickVisible(page, '[data-origin]', true);
  await clickVisible(page, '#v094Next');
  await clickVisible(page, '[data-class="Ranger"]');
  await clickVisible(page, '#v094Next');
  await clickVisible(page, '[data-keepsake="Old Map"]');
  await clickVisible(page, '#v094Next');

  await expect(page.getByRole('heading', { name: 'CreationRefreshQA', exact: true })).toBeVisible();
  await expect(page.locator('.v140-creation')).toBeVisible();
  await expect(page.locator('.v140-creation h1,.v140-creation h2')).toBeVisible();
  await clickVisible(page, '#v094Next');
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
});

test('screen transitions keep one owner while DOM creation choices retain native browser focus', async ({ browser }) => {
  test.setTimeout(120000);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
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
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    await expect(page.getByRole('heading', { name: 'When the World Went to War' })).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/legend-phaser-annals-ui-active/);
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await expect(page.getByRole('heading', { name: 'The Pact Beneath the Stone' })).toBeVisible();
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await expect(page.getByRole('heading', { name: 'The Peace, Written Down' })).toBeVisible();
    await page.getByRole('button', { name: /Shape the traveler/i }).click();
    await expect(page.locator('#v094Name')).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/legend-phaser-creation-ui-active/);

    await page.locator('#v094Name').fill('TransitionQA');
    await page.locator('#v094Next').click();
    const choices = page.locator('.v094-choice');
    await expect(choices).toHaveCount(4);
    await page.mouse.move(1400, 850);
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    const unselected = await choices.evaluateAll(nodes => nodes.map(node => ({
      hovered: node.matches(':hover'),
      focused: node === document.activeElement || node.matches(':focus-visible'),
      outlineStyle: getComputedStyle(node).outlineStyle
    })));
    expect(unselected).toHaveLength(4);
    expect(unselected.every(item => !item.hovered && !item.focused)).toBe(true);
    const firstChoice = choices.first();
    const secondChoice = choices.nth(1);
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.keyboard.press('Tab');
    await expect(firstChoice).toBeFocused();
    const focusedState = await page.evaluate(() => {
      const focused = document.activeElement;
      const idle = document.querySelectorAll('.v094-choice')[1];
      return {
        active: focused?.matches('.v094-choice'),
        keyboardVisible: focused?.matches(':focus-visible'),
        focusBorder: focused ? getComputedStyle(focused).borderTopColor : '',
        idleBorder: idle ? getComputedStyle(idle).borderTopColor : '',
        ariaPressed: focused?.getAttribute('aria-pressed')
      };
    });
    expect(focusedState.active).toBe(true);
    expect(focusedState.keyboardVisible).toBe(true);
    expect(focusedState.focusBorder).not.toBe(focusedState.idleBorder);
    expect(focusedState.ariaPressed).toBe('false');
    await firstChoice.click();
    await expect(firstChoice).toHaveAttribute('aria-pressed', 'true');
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});
