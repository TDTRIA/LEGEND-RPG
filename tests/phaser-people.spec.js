const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });
const saveKey = 'legend-roads-of-ashmere-v09';
const snapshot = page => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativePeople);
const readSave = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);

for (const region of ['Ashmere', 'Greyfen']) for (const width of [1440, 390]) {
  test(`${region} people and dialogue preserve story visits and fallback at ${width}px`, async ({ page }) => {
    test.setTimeout(width === 1440 ? 180000 : 120000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(({ region, width }) => {
      LegendStorage.savePlayer(LegendStorage.normalize({
        username: 'People Presentation', currentRegion: region, discoveredRegions: ['Ashmere', 'Greyfen'], hp: 23, maxHp: 40, gold: 73,
        inventory: { food: 2, roadToken: width === 390 ? 2 : 3 }, futureExtension: { keep: true },
        flags: { introV094Complete: true, customPeopleFlag: true,
          ...(region === 'Ashmere'
            ? { firstRoadReturnSeen: true, firstRoadReturnRoute: 'ridge', firstRoadReturnDiscovery: 'ridge-cairn' }
            : { greyfenFieldNoteReported: true, greyfenLedgerCompared: true, greyfenWeeklyReturnFound: true }) }
      }));
      LegendAshmereV099.route('people');
    }, { region, width });
    const initial = await readSave(page);
    expect(initial.currentRegion).toBe(region);
    const back = page.locator('#ashBack');
    await expect.poll(async () => (await snapshot(page)).active).toBe(true);
    expect((await snapshot(page)).art).toHaveLength(4);
    for (const name of ['Mara Vell', 'Old Brenn', 'Captain Oric']) expect((await snapshot(page)).labels).toContain(name);
    expect(await readSave(page)).toEqual(initial);
    const header = await page.locator('.ash099-head').boundingBox();
    expect(header.y).toBeGreaterThanOrEqual(await page.locator('.lws-hud').evaluate(node => node.getBoundingClientRect().bottom));
    const visits = region === 'Greyfen' ? ['brenn', 'mara', 'oric'] : ['mara', 'brenn', 'oric'];
    for (const id of visits) {
      const expected = await page.evaluate(({ key, id, region }) => {
        // Compare to one invocation of the unchanged production story owner;
        // the independent story-contract suite checks the authored branch outputs.
        const player = JSON.parse(localStorage.getItem(key));
        const dialogue = LegendAshmereNpcCatalogV099.create({}).get(region, id);
        LegendAshmereNpcStoryV099.apply(player, id, region === 'Greyfen', dialogue, LegendQuestLogV120.setBellQuestObjective);
        return LegendStorage.normalize(player);
      }, { key: saveKey, id, region });
      const card = page.locator(`.ash099-npc-card[data-ash-view="${id}"]`);
      await card.scrollIntoViewIfNeeded();
      if (width === 1440) {
        await card.focus();
        await expect.poll(async () => (await snapshot(page)).focused).toBe(id);
        await page.keyboard.press('Enter');
      } else await card.tap();
      await expect.poll(async () => (await snapshot(page)).active && (await snapshot(page)).art.length === 1).toBe(true);
      expect(await readSave(page)).toEqual(expected);
      await expect(page.locator('.ash099-head h1')).toBeFocused();
      const lines = await page.locator('.ash099-lines > p').allTextContents();
      for (const line of lines) expect((await snapshot(page)).labels).toContain(line);
      const portrait = page.locator('.ash099-head > img');
      expect(await portrait.evaluate(node => node.getBoundingClientRect().height)).toBe(220);
      expect(await portrait.evaluate(node => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(await page.locator('.lws-hud').evaluate(node => node.getBoundingClientRect().bottom));
      if (id === 'mara' && region === 'Ashmere') {
        expect(lines[0]).toContain('Ridgeway Cairn');
        expect(expected.flags.firstRoadReturnMaraBriefed).toBe(true);
      }
      if (id === 'brenn' && region === 'Greyfen') {
        expect(lines.join(' ')).toContain('CLOSED pending inspection');
        expect(expected.flags.greyfenWeeklyReturnReported).toBe(true);
      }
      if (id === 'mara' && region === 'Greyfen') expect(expected.flags.greyfenEvidenceFiled).toBe(true);
      if (id === 'brenn') {
        if (width === 1440) {
          const ledger = page.getByRole('button', { name: 'Open the Regional Ledger', exact: true });
          await ledger.scrollIntoViewIfNeeded();
          await ledger.click();
          await expect(page.locator('.reg100')).toBeVisible();
          expect(await readSave(page)).toEqual(expected);
          await page.evaluate(() => LegendAshmereV099.route('people'));
          continue;
        }
        await expect(page.locator('#turnTokens')).toHaveCount(0);
      }
      await page.keyboard.press('Tab');
      await expect(back).toBeFocused();
      await expect.poll(async () => (await snapshot(page)).focused).toBe('ashBack');
      expect(await back.evaluate(node => node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(await page.locator('.lws-bottom-bar').evaluate(node => node.getBoundingClientRect().top));
      // Layout/focus repaint must not repeat a conversation or change its save.
      expect(await readSave(page)).toEqual(expected);
      await page.keyboard.press('Enter');
      await expect(page.locator('.ash100-town')).toBeVisible();
      expect(await readSave(page)).toEqual(expected);
      await page.evaluate(() => LegendAshmereV099.route('people'));
    }
    const beforeFallback = await readSave(page);
    await page.locator('.ash099-npc-card[data-ash-view="oric"] > img').evaluate(node => node.remove());
    await expect.poll(async () => (await snapshot(page)).active).toBe(false);
    await expect(page.locator('.ash099-npc-card[data-ash-view="oric"] > strong')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await page.locator('.ash099-npc-card[data-ash-view="oric"]').tap();
    await expect(page.locator('.ash099-head h1')).toHaveText('Captain Oric');
    await expect.poll(async () => (await snapshot(page)).active).toBe(true);
    const afterFallback = await readSave(page);
    const expectedFallback = structuredClone(beforeFallback);
    expectedFallback.npcTalk.oric += 1;
    expect(afterFallback).toEqual(expectedFallback);
    await page.locator('.ash099-lines > p').last().evaluate(node => { node.textContent = ''; });
    await expect.poll(async () => (await snapshot(page)).active).toBe(false);
    await expect(page.locator('.ash099-head h1')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    await back.click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await page.reload();
    await page.waitForFunction(() => window.LegendAshmereV099);
    expect(await readSave(page)).toEqual(afterFallback);
    await page.evaluate(() => LegendAshmereV099.route('people'));
    await expect.poll(async () => (await snapshot(page)).active).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
