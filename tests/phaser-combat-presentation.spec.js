const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
test.setTimeout(90000);
async function ready(page) {
  await expect.poll(() => page.evaluate(() => {
    const s = LegendPhaserWorldV1.snapshot();
    return { active: s.nativeCombatUi, failure: s.nativeCombatUiFailure, art: s.nativeCombatUiArtCount };
  }), { timeout: 15000 }).toEqual({ active: true, failure: '', art: 4 });
}

test('combat artwork, complete copy and clips survive touch, rotation, drawers and DOM fallback', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(() => {
    const player = LegendStorage.normalize({ username: 'BattlePresentation', className: 'Ranger', currentRegion: 'Ashmere',
      hp: 40, maxHp: 100, level: 1, weapon: 'woodenSword', armor: 'clothArmor', inventory: { potion: 1, roadPoultice: 1 }, futureRecord: { keep: 19 },
      flags: { introV094Complete: true } });
    LegendStorage.savePlayer(player);
    window.__combatSave = localStorage.getItem('legend-roads-of-ashmere-v09');
    const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
    const rules = LegendRoadStateV100.create({ getData: () => LEGEND_DATA, clamp });
    window.__combatCalls = [];
    LegendRoadCombatViewV100.create({ getAssets: () => LegendAssetsV090, getWeapon: rules.weapon, getArmor: rules.armor,
      score: rules.score, hpPercent: rules.hpPercent, escapeHtml: LegendHtmlV120.escapeHtml, clamp,
      renderShell: html => { document.getElementById('root').innerHTML = '<main class="exp100"><div class="exp100-wrap">'+html+'</div></main>'; },
      soundOn: () => false, onCommand: (_, command) => window.__combatCalls.push(command),
      onRetreat: () => window.__combatCalls.push('retreat'), onToggleSound: () => window.__combatCalls.push('sound')
    }).render(player, { name: 'Road Goblin', hp: 28, maxHp: 34, turn: 1, intent: 'heavy',
      combatLog: ['First recorded exchange.', 'Second recorded exchange.', 'Third recorded exchange.', 'Fourth recorded exchange.'] }, '',
      rules.weapon(player), rules.armor(player), { name: 'Trap Shot', text: 'Pin the enemy’s movement so its next attack loses force.' });
  });
  await ready(page);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUiSceneSize.width)).toBe(viewport.width);
    await ready(page);
    await page.locator('#guard').scrollIntoViewIfNeeded();
    await page.locator('#guard').tap();
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUiFocusedControlIds)).toContain('guard');
    const proof = await page.evaluate(() => {
      const s = LegendPhaserWorldV1.snapshot();
      const hud = document.querySelector('.lws-hud').getBoundingClientRect(), dock = document.querySelector('.lws-bottom-bar').getBoundingClientRect();
      const scene = LegendPhaserWorldV1.engine.scene.getScene('RealmScene');
      const objects = scene.nativeCombatUiObjects[0].list;
      return { clip: s.nativeCombatUiClip, hud: hud.bottom, dock: dock.top,
        labels: s.nativeCombatUiLabels, text: s.nativeCombatUiTextValues,
        crop: objects.filter(o => o.type === 'Text').some(o => o.style.fixedWidth || o.style.fixedHeight),
        layering: objects.findIndex(o => o.type === 'Graphics') > objects.findLastIndex(o => o.type === 'Image' && o.texture.key !== 'legend-native-combat-art-3'),
        overflow: document.documentElement.scrollWidth > innerWidth,
        calls: window.__combatCalls, unchanged: localStorage.getItem('legend-roads-of-ashmere-v09') === window.__combatSave };
    });
    expect(proof.clip.y).toBeGreaterThanOrEqual(proof.hud - 1);
    expect(proof.clip.y + proof.clip.height).toBeLessThanOrEqual(proof.dock + 1);
    expect(proof.clip.width).toBeGreaterThan(viewport.width === 1440 ? 800 : viewport.width - 2);
    expect(proof.crop).toBe(false);
    expect(proof.layering).toBe(true);
    expect(proof.text).toEqual(expect.arrayContaining(['WEAPON', 'Wooden Sword', 'ARMOR', 'Cloth Armor', 'Heavy Strike', 'Road Poultice', 'Retreat', '40', '100', 'Fourth recorded exchange.']));
    for (const label of proof.labels) {
      expect(label.width).toBeLessThanOrEqual(label.sourceBounds.width + 1);
      expect(label.height).toBeLessThanOrEqual(label.sourceBounds.height + 4);
    }
    expect(proof.overflow).toBe(false);
    expect(proof.calls.at(-1)).toBe('guard');
    expect(proof.unchanged).toBe(true);
  }
  await page.locator('[data-world-action="toggle-left"]').tap();
  await expect.poll(() => page.evaluate(() => {
    const clip = LegendPhaserWorldV1.snapshot().nativeCombatUiClip;
    const panel = document.getElementById('lws-panel-left').getBoundingClientRect();
    return clip && Math.abs(clip.x - panel.right) < 2;
  })).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUiClip?.width)).toBe(844);
  // Losing art or a live meter must reveal every source label and actor.
  for (const selector of ['.rpg-foe-art', '.rpg-hero-hp > i']) {
    await page.evaluate(selector => {
      const node = document.querySelector(selector);
      window.__missingCombatNode = { node, parent: node.parentNode, next: node.nextSibling };
      node.remove(); LegendPhaserWorldV1.refreshCombat();
    }, selector);
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUi)).toBe(false);
    expect(await page.locator('.rpg-dialogue p').evaluate(n => getComputedStyle(n).color)).not.toBe('rgba(0, 0, 0, 0)');
    expect(await page.locator('.rpg-hero-stage-art img').evaluate(n => getComputedStyle(n).opacity)).toBe('1');
    await page.evaluate(() => { const { node, parent, next } = window.__missingCombatNode; parent.insertBefore(node, next); });
    await ready(page);
  }
  // Each semantic control retains both touch and keyboard activation. The
  // production journey separately checks the actual command effects and saves.
  const controls = [['battleSound','sound'],['strike','attack'],['skill','skill'],['item','item'],['guard','guard'],['heavy','heavy'],['poultice','poultice'],['flee','retreat']];
  for (const [id, command] of controls) {
    const button = page.locator('#' + id);
    await button.scrollIntoViewIfNeeded();
    await button.tap();
    await expect.poll(() => page.evaluate(() => window.__combatCalls.at(-1))).toBe(command);
    const count = await page.evaluate(() => window.__combatCalls.length);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__combatCalls.length)).toBe(count + 1);
    expect(await page.evaluate(() => window.__combatCalls.at(-1))).toBe(command);
  }
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09') === window.__combatSave)).toBe(true);
  expect(errors).toEqual([]);
});
