const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const indexSource = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const storageSource = fs.readFileSync(path.join(__dirname, '../js/storage.js'), 'utf8');
const gameSource = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

async function openGame(page) {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(
    window.LegendStorage &&
    window.LegendGameBootstrap &&
    window.LegendSettingsStorageV120 &&
    window.LegendRuntimeV120
  ));
}

test.describe('LEGEND storage and fallback runtime contracts', () => {
  test('deferred script order places storage dependencies before storage and bootstrap', () => {
    const scripts = [
      'js/data.js',
      'js/storage/settings-storage-v120.js',
      'js/storage/player-normalizer-v120.js',
      'js/storage.js',
      'js/game.js'
    ];
    const positions = scripts.map(src => indexSource.indexOf('src="' + src));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));

    for (const position of positions) {
      const openingTag = indexSource.slice(indexSource.lastIndexOf('<script', position), position);
      expect(openingTag).toContain('defer');
    }
  });

  test('storage initialization fails clearly when data or normalizer dependencies are absent', async ({ page }) => {
    await openGame(page);
    const errors = await page.evaluate(source => {
      const originalData = window.LEGEND_DATA;
      const originalNormalizer = window.LegendPlayerNormalizerV120;
      const found = {};

      try {
        window.LEGEND_DATA = undefined;
        try {
          window.eval(source);
        } catch (error) {
          found.data = String(error.message || error);
        }

        window.LEGEND_DATA = originalData;
        window.LegendPlayerNormalizerV120 = undefined;
        try {
          window.eval(source);
        } catch (error) {
          found.normalizer = String(error.message || error);
        }
      } finally {
        window.LEGEND_DATA = originalData;
        window.LegendPlayerNormalizerV120 = originalNormalizer;
      }
      return found;
    }, storageSource);

    expect(errors.data).toContain('LEGEND_DATA is missing or incomplete');
    expect(errors.normalizer).toContain('LegendPlayerNormalizerV120 is missing');
  });

  test('malformed and incompatible saves are rejected without deleting the original data', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const key = window.LEGEND_DATA.SAVE_KEY;
      localStorage.setItem(key, '{not valid json');
      const malformed = window.LegendStorage.loadPlayer();
      const malformedRaw = localStorage.getItem(key);

      localStorage.setItem(key, JSON.stringify({
        username: 'WrongContainerShape',
        flags: [],
        inventory: {}
      }));
      const incompatible = window.LegendStorage.loadPlayer();
      const incompatibleRaw = localStorage.getItem(key);

      localStorage.setItem(key, JSON.stringify({
        username: 'FutureBuildSave',
        version: 'v99.0.0',
        inventory: { roadToken: 50 },
        flags: { firstRoadComplete: true }
      }));
      const future = window.LegendStorage.loadPlayer();
      const futureRaw = localStorage.getItem(key);
      const futureStillPresent = futureRaw === localStorage.getItem(key);

      localStorage.setItem(key, JSON.stringify({
        username: 'LegacyButValid',
        version: 'v0.20.36',
        className: 'Ranger',
        inventory: { roadToken: 2, customLoot: 7 },
        flags: { customFlag: true },
        customState: { preserved: true }
      }));
      const compatible = window.LegendStorage.loadPlayer();

      return {
        futureIsNull: future === null,
        futureStillPresent,
        futureRawVersion: JSON.parse(futureRaw).version,
        malformedIsNull: malformed === null,
        malformedStillPresent: malformedRaw === '{not valid json',
        incompatibleIsNull: incompatible === null,
        incompatibleStillPresent: Boolean(incompatibleRaw),
        compatibleName: compatible?.username,
        compatibleVersion: compatible?.version,
        compatibleUnknownData: compatible?.customState?.preserved,
        compatibleInventory: compatible?.inventory?.customLoot
      };
    });

    expect(result).toEqual({
      malformedIsNull: true,
      malformedStillPresent: true,
      incompatibleIsNull: true,
      incompatibleStillPresent: true,
      futureIsNull: true,
      futureStillPresent: true,
      futureRawVersion: 'v99.0.0',
      compatibleName: 'LegacyButValid',
      compatibleUnknownData: true,
      compatibleInventory: 7
    });
    await expect.poll(() => page.evaluate(() =>
      window.LegendStorage.loadPlayer()?.version
    )).toBe(await page.evaluate(() => window.LEGEND_DATA.VERSION));
  });

  test('player and settings storage failures return safe fallbacks instead of throwing', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const prototype = Storage.prototype;
      const originalGet = prototype.getItem;
      const originalSet = prototype.setItem;
      const originalRemove = prototype.removeItem;
      const key = window.LEGEND_DATA.SAVE_KEY;
      const report = {};

      try {
        prototype.getItem = function () {
          throw new DOMException('Storage access denied', 'SecurityError');
        };
        report.playerRead = window.LegendStorage.loadPlayer() === null;
        report.settingsRead = window.LegendStorage.loadSettings().largeText === false;

        prototype.getItem = originalGet;
        prototype.setItem = function () {
          throw new DOMException('Storage quota denied', 'QuotaExceededError');
        };
        report.playerWrite = window.LegendStorage.savePlayer({ username: 'CannotPersist' }) === false;
        report.settingsWrite = window.LegendSettingsStorageV120.create()
          .saveSettings({ largeText: true }) === false;

        prototype.setItem = originalSet;
        prototype.removeItem = function () {
          throw new DOMException('Storage access denied', 'SecurityError');
        };
        report.playerDelete = window.LegendStorage.deleteSaves() === false;
      } finally {
        prototype.getItem = originalGet;
        prototype.setItem = originalSet;
        prototype.removeItem = originalRemove;
        try { localStorage.removeItem(key); } catch (_) {}
      }
      return report;
    });

    expect(result).toEqual({
      playerRead: true,
      settingsRead: true,
      playerWrite: true,
      settingsWrite: true,
      playerDelete: true
    });
  });

  test('missing roots and missing fallback buttons do not break screen navigation', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const bootstrap = window.LegendGameBootstrap;
      const scenarios = [
        {
          name: 'dispatches',
          disable: ['LegendTitleDispatchesV140'],
          run: () => bootstrap.dispatches()
        },
        {
          name: 'account',
          disable: ['LegendAccountV09x'],
          run: () => bootstrap.account()
        },
        {
          name: 'settings',
          disable: ['LegendSettingsScreenV090'],
          run: () => bootstrap.settings()
        },
        {
          name: 'newTraveler',
          disable: ['LegendOpeningPrologueV220', 'LegendBeginningV094'],
          run: () => bootstrap.newTraveler()
        },
        {
          name: 'continueGame',
          disable: ['LegendRoadOpeningV140', 'LegendAshmereV099'],
          run: () => bootstrap.continueGame()
        }
      ];
      const original = {};
      const outcomes = [];

      window.LegendStorage.savePlayer({
        username: 'FallbackQA',
        currentRegion: 'Ashmere'
      });

      for (const scenario of scenarios) {
        for (const key of scenario.disable) {
          if (!(key in original)) original[key] = window[key];
          window[key] = null;
        }
        document.getElementById('root')?.remove();
        scenario.run();
        const host = document.getElementById('root');
        const back = host?.querySelector('#backTitle');
        const rootWasRecreated = Boolean(host);
        const backWasAvailable = Boolean(back);
        if (back) back.click();
        outcomes.push({
          name: scenario.name,
          rootWasRecreated,
          backWasAvailable,
          titleReturned: Boolean(document.querySelector('.v120-title'))
        });
      }

      Object.entries(original).forEach(([key, value]) => { window[key] = value; });
      return outcomes;
    });

    expect(result).toEqual([
      { name: 'dispatches', rootWasRecreated: true, backWasAvailable: true, titleReturned: true },
      { name: 'account', rootWasRecreated: true, backWasAvailable: true, titleReturned: true },
      { name: 'settings', rootWasRecreated: true, backWasAvailable: true, titleReturned: true },
      { name: 'newTraveler', rootWasRecreated: true, backWasAvailable: true, titleReturned: true },
      { name: 'continueGame', rootWasRecreated: true, backWasAvailable: true, titleReturned: true }
    ]);
  });

  test('missing storage bootstrap stops at an actionable recovery screen', async ({ page }) => {
    await openGame(page);
    await page.evaluate(source => {
      window.LegendStorage = undefined;
      document.getElementById('root')?.remove();
      window.eval(source);
    }, gameSource);

    await expect(page.getByRole('heading', { name: 'Traveler storage unavailable' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reload Game' })).toBeVisible();
  });

  test('blocked sessionStorage does not crash the pending town-return handler', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const prototype = Storage.prototype;
      const originalGet = prototype.getItem;
      try {
        prototype.getItem = function () {
          throw new DOMException('Session storage access denied', 'SecurityError');
        };
        return window.LegendRuntimeV120.handlePendingReturn() === false;
      } finally {
        prototype.getItem = originalGet;
      }
    });

    expect(result).toBe(true);
  });
});