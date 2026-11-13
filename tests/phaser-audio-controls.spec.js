const { test, expect } = require('@playwright/test');

test.setTimeout(120000);
const stored = page => page.evaluate(() => ({
  player: localStorage.getItem('legend-roads-of-ashmere-v09'),
  settings: localStorage.getItem('legend-settings-v1'),
  pending: sessionStorage.getItem('legend-awakening-return-to-town-v1')
}));
for (const width of [1440, 390]) test.describe(`${width}px audio`, () => {
  test.use({ viewport: { width, height: width === 390 ? 844 : 900 }, hasTouch: width === 390, reducedMotion: 'reduce' });
  test('real title, road and combat share mute without changing saved progression', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('audioFixtureStarted')) {
        localStorage.setItem('legend-road-sound', 'off');
        sessionStorage.setItem('audioFixtureStarted', '1');
      }
    });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => LegendRoadAudioV100.snapshot())).toMatchObject({ enabled: false, musicPlaying: false, ambiencePlaying: false });
    await page.evaluate(() => {
      LegendStorage.savePlayer(LegendStorage.normalize({ username: 'Audio QA', className: 'Ranger', currentRegion: 'Ashmere', hp: 40, maxHp: 40,
        inventory: { food: 3 }, futureAudioRecord: { keep: 91 }, flags: { introV094Complete: true, firstRoadReturnSeen: true,
          roadExpeditionV100: { stage: 0, pressure: 12, trips: 1, events: 0, finds: 0, battles: 0, routeChoice: null,
            poiUsed: {}, searchUsed: {}, readUsed: {}, campWatchUsed: {}, roadClockHour: 15 },
          roadFieldJournalV150: { visitedPlaces: [], discoveries: [], routes: [], campReports: [] } } }));
      LegendRoadControllerV100.renderExpedition();
    });
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadSceneUi?.active)).toBe(true);
    const activate = async locator => {
      await locator.scrollIntoViewIfNeeded();
      await locator.focus();
      if (width === 390) await locator.tap(); else await page.keyboard.press('Enter');
    };
    const road = page.locator('#exp100-sound');
    await expect(road).toHaveAccessibleName('Game sound');
    await expect(road).toHaveAttribute('aria-pressed', 'false');
    const beforeRoad = await stored(page);
    await activate(road);
    await expect(road).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRoadSceneUi.labels.some(n => n.text === 'Sound: On'))).toBe(true);
    expect(await stored(page)).toEqual(beforeRoad);
    await page.evaluate(() => LegendRoadControllerV100.startDungeonEncounter({ name: 'Road Goblin', hp: 28, maxHp: 28, damage: [3, 5], turn: 0, intent: 'heavy', reward: 'fur' }));
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUi)).toBe(true);
    const combat = page.locator('#battleSound');
    await expect(combat).toHaveAccessibleName('Game sound');
    await expect(combat).toHaveAttribute('aria-pressed', 'true');
    const beforeCombat = await stored(page);
    await activate(combat);
    await expect(combat).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUiTextValues)).toContain('♫ SOUND OFF');
    await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeCombatUiFocusedControlIds)).toContain('battleSound');
    expect(await page.evaluate(() => LegendRoadAudioV100.snapshot())).toMatchObject({ enabled: false, musicPlaying: false, ambiencePlaying: false });
    expect(await stored(page)).toEqual(beforeCombat);
    await expect(page.locator('.rpg-battle-topline')).toContainText('TURN 1');
    await page.evaluate(() => LegendGameBootstrap.title());
    await expect(page.locator('.v120-title')).toBeVisible();
    await page.reload();
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => LegendRoadAudioV100.snapshot())).toMatchObject({ enabled: false, musicPlaying: false, ambiencePlaying: false });
    expect(await page.evaluate(() => localStorage.getItem('legend-road-sound'))).toBe('off');
    expect(await stored(page)).toEqual(beforeCombat);
    expect(errors).toEqual([]);
  });
});
