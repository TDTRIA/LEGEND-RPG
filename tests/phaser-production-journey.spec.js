const { test, expect } = require('@playwright/test');

// Use the real creation, combat and save controllers throughout. No combat
// boosts, forced rewards, transition bypasses or replacement action handlers.
async function inspectOverTime(page, info, name) {
  const started = Date.now();
  for (const milliseconds of [0, 1000, 3000, 5000]) {
    await page.waitForTimeout(Math.max(0, milliseconds - (Date.now() - started)));
    const proof = await page.evaluate(() => {
      const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      const broken = ['Title', 'Annals', 'Creation', 'Opening'].filter(kind => {
        const active = document.body.classList.contains(`legend-phaser-${kind.toLowerCase()}-ui-active`);
        return active && !scene[`native${kind}UiActive`];
      });
      const creation = document.querySelector('.v140-creation');
      if (creation) {
        const heading = creation.querySelector('h1,h2');
        const css = heading && getComputedStyle(heading);
        const domVisible = css && css.visibility === 'visible' && css.color !== 'rgba(0, 0, 0, 0)';
        const painted = scene.nativeCreationUiObjects.some(object => object.type === 'Text' && object.willRender(scene.cameras.main) && window.__creationPaintedObjects?.has(object));
        if (!domVisible && !painted) broken.push('Creation has neither visible DOM nor painted text');
      }
      return { broken, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(proof, name + ' at ' + milliseconds + 'ms').toEqual({ broken: [], overflow: false });
    await page.screenshot({ path: info.outputPath(`${name}-${milliseconds}.png`) });
  }
}

async function fight(page) {
  for (let turn = 0; turn < 40 && await page.locator('.rpg-battle').count(); turn++) {
    const player = await page.evaluate(() => LegendStorage.loadPlayer());
    let command = '#strike';
    if (player.hp < player.maxHp * 0.55 && await page.locator('#item').isEnabled()) command = '#item';
    else if (await page.locator('#skill').isEnabled()) command = '#skill';
    else if (await page.locator('.rpg-intent-heavy').count()) command = '#guard';
    await page.locator(command).click();
  }
  await expect(page.locator('.rpg-battle')).toHaveCount(0);
  if (await page.locator('#v152CombatContinue').count()) await page.locator('#v152CombatContinue').click();
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`normal-stat new player, guided road and saved Continue at ${viewport.width}`, async ({ page }, info) => {
    test.setTimeout(240000); // Includes explicit 0/1/3/5-second acceptance samples.
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady && !document.documentElement.classList.contains('engine-intro-active'));
    await page.evaluate(() => {
      const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      scene.game.events.on('postrender', () => {
        window.__creationPaintedObjects = new Set(scene.nativeCreationUiObjects.filter(object => object.visible));
      });
    });
    await inspectOverTime(page, info, 'title');
    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    for (let chapter = 1; chapter <= 3; chapter++) {
      await inspectOverTime(page, info, 'annals-' + chapter);
      await page.getByRole('button', { name: chapter === 3 ? /Shape the traveler/i : /^Continue$/ }).click();
    }
    await page.locator('#v094Name').fill('OrdinaryTraveler');
    await inspectOverTime(page, info, 'creation-name');
    await page.locator('#v094Next').click();
    for (const [attribute, selected] of [['gender','unspoken'], ['personality','kind'], ['origin','Lost Squire'], ['class','Ranger'], ['keepsake','Old Map']]) {
      // Every choice must remain clickable through a rebuild; finish with the
      // same ordinary traveler for a comparable journey at each viewport.
      const choices = page.locator(`[data-${attribute}]`);
      const count = await choices.count();
      for (let index = 0; index < count; index++) await choices.nth(index).click();
      await page.locator(`[data-${attribute}="${selected}"]`).click();
      await inspectOverTime(page, info, 'creation-' + attribute);
      await page.locator('#v094Next').click();
    }
    await expect(page.getByRole('heading', { name: 'OrdinaryTraveler', exact: true })).toBeVisible();
    await inspectOverTime(page, info, 'creation-summary');
    await page.getByRole('button', { name: /Let Me Wake/i }).click();
    await inspectOverTime(page, info, 'opening-bell');
    await page.getByRole('button', { name: 'Lift your head' }).click();
    await inspectOverTime(page, info, 'opening-oric');
    await page.locator('[data-oric-response="honest"]').click();
    await page.getByRole('button', { name: 'Help Oric' }).click();
    await inspectOverTime(page, info, 'awakening-combat');
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await page.getByRole('button', { name: 'Follow Oric onto the Old Road' }).click();
    await inspectOverTime(page, info, 'old-road');
    await page.locator('#routeRidge').click();
    await page.locator('.exp100-hotspot-find').click();
    await page.locator('#poiInspect').click();
    await page.locator('#search').click();
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Ridgeway Cairn');
    await page.locator('#push').click();
    await fight(page);
    await expect(page.locator('.exp100-head h1')).toHaveText("Wayfarer's Camp");
    await page.locator('#campRest').click();
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head h1')).toHaveText('Blackroot Bend');
    await page.locator('#push').click();
    await fight(page);
    await expect(page.locator('.exp100-head h1')).toHaveText('Reedwatch Shelter');
    await page.locator('#push').click();
    await page.locator('#finish').click();
    if (await page.locator('#legendLevelUpOverlay').count()) {
      await inspectOverTime(page, info, 'growth');
      const total = Number((await page.locator('#v152-growth-total').textContent()).split('/').pop().trim());
      for (let point = 0; point < total; point++) await page.locator('[data-attr-add="might"]').click();
      await page.locator('#v152-growth-confirm').click();
    }
    await expect(page.getByRole('heading', { name: 'Expedition Secured' })).toBeVisible();
    await inspectOverTime(page, info, 'expedition-results');
    await page.locator('#outcomeReturn').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await inspectOverTime(page, info, 'ashmere');
    const saved = await page.evaluate(() => {
      const p = LegendStorage.loadPlayer();
      return { username: p.username, level: p.level, xp: p.xp, gold: p.gold, stats: p.stats, attributes: p.attributesV152 };
    });
    expect(saved.username).toBe('OrdinaryTraveler');
    expect(saved.level).toBeGreaterThanOrEqual(2);
    await page.reload();
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.getByRole('button', { name: /^Continue/i }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await page.evaluate(() => {
      const p = LegendStorage.loadPlayer();
      return { username: p.username, level: p.level, xp: p.xp, gold: p.gold, stats: p.stats, attributes: p.attributesV152 };
    })).toEqual(saved);
    expect(errors).toEqual([]);
  });
}
