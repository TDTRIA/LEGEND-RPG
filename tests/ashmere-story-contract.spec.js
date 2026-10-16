const { test, expect } = require('@playwright/test');

test.describe('Ashmere first-road-return dialogue contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('routes first-return dialogue through the story facade without a missing-region error', async ({ page }) => {
    const result = await page.evaluate(() => {
      const player = {
        flags: {
          firstRoadReturnSeen: true,
          firstRoadReturnRoute: 'ridge',
          firstRoadReturnDiscovery: 'ridge-cairn'
        }
      };
      const dialogue = { lines: ['Original dialogue'] };
      const objectives = [];
      const applied = window.LegendAshmereNpcStoryV099.apply(
        player,
        'mara',
        false,
        dialogue,
        (_player, objective) => objectives.push(objective)
      );
      return {
        applied,
        lines: dialogue.lines,
        maraTalkCount: player.npcTalk?.mara,
        objectiveCount: objectives.length
      };
    });

    expect(result.applied).toBe(true);
    expect(result.lines[0]).toContain('Ridgeway Cairn');
    expect(result.maraTalkCount).toBe(1);
    expect(result.objectiveCount).toBe(1);
  });

  test('does not apply Ashmere first-return dialogue in Greyfen', async ({ page }) => {
    const result = await page.evaluate(() => {
      const player = { flags: { firstRoadReturnSeen: true, firstRoadReturnRoute: 'ridge' } };
      const dialogue = { lines: ['Greyfen dialogue stays here'] };
      const applied = window.LegendAshmereFirstRoadReturnDialogueV099.apply(
        player,
        'mara',
        true,
        dialogue
      );
      return { applied, lines: dialogue.lines };
    });

    expect(result.applied).toBe(false);
    expect(result.lines).toEqual(['Greyfen dialogue stays here']);
  });
  test('preserves all first-return dialogue variants for Mara, Brenn, and Oric', async ({ page }) => {
    const results = await page.evaluate(() => {
      const service = window.LegendAshmereFirstRoadReturnDialogueV099;
      const scenarios = [
        { id: 'mara', flags: { greyfenArchiveRead: true }, phrase: 'Greyfen archive now preserves' },
        { id: 'mara', flags: { greyfenBoundaryCompared: true }, phrase: 'same older bell-mark' },
        { id: 'mara', flags: { bellRoadSearched: true }, phrase: 'Blackroot seal bears the same bell-mark' },
        { id: 'mara', flags: { firstRoadReturnRoute: 'ridge', firstRoadReturnDiscovery: 'ridge-cairn' }, phrase: 'Ridgeway Cairn marks a dry line' },
        { id: 'mara', flags: { firstRoadReturnRoute: 'reeds', firstRoadReturnDiscovery: 'marsh-watcher-tracks' }, phrase: 'Bell Fragment is physical evidence' },
        { id: 'mara', flags: { firstRoadReturnRoute: 'ridge' }, phrase: 'kept to the High Ridge' },
        { id: 'mara', flags: { firstRoadReturnRoute: 'reeds' }, phrase: 'brought back a Bell Fragment' },
        { id: 'mara', flags: {}, phrase: 'return gives us an account to work from' },
        { id: 'brenn', flags: { firstRoadReturnRoute: 'ridge' }, phrase: 'recorded your return from the High Ridge' },
        { id: 'brenn', flags: { firstRoadReturnRoute: 'reeds' }, phrase: 'Bell Fragment is entered in the ledger' },
        { id: 'brenn', flags: {}, phrase: 'back with a report' },
        { id: 'oric', flags: { firstRoadReturnRoute: 'ridge' }, phrase: 'ridge was the cautious choice' },
        { id: 'oric', flags: { firstRoadReturnRoute: 'reeds' }, phrase: 'came back from the Reed Cut' },
        { id: 'oric', flags: {}, phrase: 'Keep the next report practical' }
      ];

      return scenarios.map(({ id, flags, phrase }) => {
        const player = { flags: { firstRoadReturnSeen: true, ...flags } };
        const dialogue = { lines: ['Original dialogue'] };
        const applied = service.apply(player, id, false, dialogue);
        return {
          id,
          phrase,
          applied,
          matched: dialogue.lines.some(line => line.includes(phrase)),
          lineCount: dialogue.lines.length
        };
      });
    });

    expect(results).toHaveLength(14);
    for (const result of results) {
      expect(result.applied, result.id + ' dialogue service should apply').toBe(true);
      expect(result.matched, result.id + ' should preserve phrase: ' + result.phrase).toBe(true);
      expect(result.lineCount).toBeGreaterThan(0);
    }
  });

});
