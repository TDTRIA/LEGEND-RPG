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
      const malformedStatus = window.LegendStorage.getPlayerSaveStatus();

      localStorage.setItem(key, JSON.stringify({
        username: 'WrongContainerShape',
        flags: [],
        inventory: {}
      }));
      const incompatible = window.LegendStorage.loadPlayer();
      const incompatibleRaw = localStorage.getItem(key);

      localStorage.setItem(key, JSON.stringify({
        username: 'UnrecognizedVersionSave',
        version: 'not-a-version',
        flags: { firstRoadComplete: true }
      }));
      const unrecognizedVersion = window.LegendStorage.loadPlayer();
      const unrecognizedVersionRaw = localStorage.getItem(key);

      localStorage.setItem(key, JSON.stringify({
        username: 'FutureBuildSave',
        version: 'v99.0.0',
        inventory: { roadToken: 50 },
        flags: { firstRoadComplete: true }
      }));
      const future = window.LegendStorage.loadPlayer();
      const futureRaw = localStorage.getItem(key);
      const futureStillPresent = futureRaw === localStorage.getItem(key);
      const futureStatus = window.LegendStorage.getPlayerSaveStatus();

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
        unrecognizedVersionIsNull: unrecognizedVersion === null,
        unrecognizedVersionStillPresent: Boolean(unrecognizedVersionRaw),
        futureIsNull: future === null,
        futureStillPresent,
        futureRawVersion: JSON.parse(futureRaw).version,
        malformedIsNull: malformed === null,
        malformedStillPresent: malformedRaw === '{not valid json',
        malformedStatus,
        futureStatus,
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
      malformedStatus: 'malformed',
      futureStatus: 'incompatible',
      incompatibleIsNull: true,
      incompatibleStillPresent: true,
      unrecognizedVersionIsNull: true,
      unrecognizedVersionStillPresent: true,
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

  test('player and settings storage failures retain safe in-session fallbacks', async ({ page }) => {
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
        report.readStatus = window.LegendStorage.getPlayerSaveStatus();

        prototype.getItem = originalGet;
        prototype.setItem = function () {
          throw new DOMException('Storage quota denied', 'QuotaExceededError');
        };
        report.playerWrite = window.LegendStorage.savePlayer({ username: 'CannotPersist' }) === false;
        const sessionPlayer = window.LegendStorage.loadPlayer();
        report.sessionPlayer = sessionPlayer?.username === 'CannotPersist';
        report.sessionStatus = window.LegendStorage.getPlayerSaveStatus();

        report.settingsWrite = window.LegendStorage.saveSettings({ largeText: true }) === false;
        report.settingsInMemory = window.LegendStorage.loadSettings().largeText === true;
        report.settingsApplied = document.body.classList.contains('a11y-large-text');

        prototype.setItem = originalSet;
        report.settingsRetry = window.LegendStorage.saveSettings({ largeText: false }) === true;
        report.settingsAfterRetry = window.LegendStorage.loadSettings().largeText === false;

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
      readStatus: 'unavailable',
      playerWrite: true,
      sessionPlayer: true,
      sessionStatus: 'session-only',
      settingsWrite: true,
      settingsInMemory: true,
      settingsApplied: true,
      settingsRetry: true,
      settingsAfterRetry: true,
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

  test('title fallback exposes a reload control when its screen module is missing', async ({ page }) => {
    await openGame(page);
    await page.evaluate(() => {
      window.LegendTitleScreenV120 = null;
      window.LegendGameBootstrap.title();
    });
    await expect(page.getByRole('heading', { name: 'Title screen unavailable' })).toBeVisible();
    await expect(page.locator('#retryTitle')).toBeVisible();
  });

  test('traveler creation does not overwrite an unreadable save or proceed after a failed first write', async ({ page }) => {
    await openGame(page);
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 15000 });
    await expect(page.locator('.v120-title')).toBeVisible();

    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await page.getByRole('button', { name: /Shape the traveler/i }).click();
    await page.locator('#v094Name').fill('SaveProtectionQA');
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
    await expect(page.locator('.v094-soul-confirmation')).toBeVisible();

    const key = await page.evaluate(() => window.LEGEND_DATA.SAVE_KEY);
    await page.evaluate(key => localStorage.setItem(key, '{unreadable existing traveler'));
    await page.getByRole('button', { name: /Let Me Wake/i }).click();
    await expect(page.locator('#v094CreationError')).toContainText(/existing traveler save could not be read safely/i);
    await expect(page.locator('.v094-soul-confirmation')).toBeVisible();
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('{unreadable existing traveler');
    await expect(page.locator('.opening-road-v140')).toHaveCount(0);

    await page.evaluate(() => {
      const prototype = Storage.prototype;
      window.__legendOriginalSetItem = prototype.setItem;
      prototype.setItem = function () {
        throw new DOMException('Storage quota denied', 'QuotaExceededError');
      };
    });
    await page.locator('#v094CreationError').waitFor({ state: 'visible' });
    // Remove the unreadable record explicitly, simulating the player recovering
    // their slot, then verify a failed first write keeps the confirmation open.
    await page.evaluate(key => {
      Storage.prototype.setItem = window.__legendOriginalSetItem;
      localStorage.removeItem(key);
      const prototype = Storage.prototype;
      prototype.setItem = function () {
        throw new DOMException('Storage quota denied', 'QuotaExceededError');
      };
    }, key);
    await page.locator('#v094Next').click();
    await expect(page.locator('#v094CreationError')).toContainText(/could not be saved permanently/i);
    await expect(page.locator('.v094-soul-confirmation')).toBeVisible();
    await page.evaluate(() => {
      Storage.prototype.setItem = window.__legendOriginalSetItem;
      delete window.__legendOriginalSetItem;
    });
  });

  test('cloud restore and region unlock/travel report failed local persistence', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(async () => {
      const query = {
        select() { return this; },
        eq() { return this; },
        async maybeSingle() {
          return {
            data: { traveler_data: { username: 'CloudFallbackQA', inventory: {}, flags: {} } },
            error: null
          };
        }
      };
      const cloud = window.LegendAccountCloudV09x.create({
        getClient: () => ({ from: () => query }),
        isConnected: () => true,
        getHealth: () => ({ ok: true }),
        loadLocalPlayer: () => null,
        saveLocalPlayer: () => false
      });
      const cloudResult = await cloud.cloudLoad({ user: { id: 'qa-user' } }, 1);

      const unlockPlayer = {
        inventory: { roadToken: 5 },
        discoveredRegions: ['Ashmere'],
        currentRegion: 'Ashmere',
        stats: {},
        memories: [],
        flags: {}
      };
      const travelPlayer = {
        inventory: {},
        discoveredRegions: ['Ashmere', 'Greyfen'],
        currentRegion: 'Ashmere',
        gold: 100,
        memories: []
      };
      const messages = [];
      let activePlayer = unlockPlayer;
      const regionService = window.LegendRegionServiceV100.create({
        getPlayer: () => activePlayer,
        savePlayer: () => false,
        getRegions: () => ({
          Ashmere: { id: 'Ashmere', name: 'Ashmere', travelCost: 0 },
          Greyfen: { id: 'Greyfen', name: 'Greyfen', unlockTokens: 5, travelCost: 25 }
        }),
        renderMessage: message => { messages.push(message); },
        formatGold: amount => String(amount) + 'g'
      });
      regionService.unlock('Greyfen');
      activePlayer = travelPlayer;
      regionService.travel('Greyfen');
      return {
        cloudOk: cloudResult.ok,
        cloudMessage: cloudResult.message,
        unlockMessage: messages[0],
        travelMessage: messages[1]
      };
    });

    expect(result.cloudOk).toBe(false);
    expect(result.cloudMessage).toContain('could not save it locally');
    expect(result.unlockMessage).toContain('available for this session');
    expect(result.unlockMessage).toContain('could not save the unlock');
    expect(result.travelMessage).toContain('for this session');
    expect(result.travelMessage).toContain('could not save the crossing');
  });

  test('return-to-town falls back to the title when both the marker and town renderer are unavailable', async ({ page }) => {
    await openGame(page);
    const result = await page.evaluate(() => {
      const prototype = Storage.prototype;
      const originalSet = prototype.setItem;
      const originalStorage = window.LegendStorage;
      const originalTitle = window.LegendTitleScreenV120;
      const originalAshmere = window.LegendAshmereV099;
      prototype.setItem = function () {
        throw new DOMException('Session storage access denied', 'SecurityError');
      };
      window.LegendStorage = {
        loadPlayer: () => ({ username: 'ReturnFallbackQA', town: 'Greyfen' }),
        savePlayer: () => false
      };
      window.LegendTitleScreenV120 = null;
      window.LegendAshmereV099 = null;
      try {
        window.LegendRuntimeV120.returnToAshmere();
        return Boolean(document.querySelector('#root #retryTitle'));
      } finally {
        prototype.setItem = originalSet;
        window.LegendStorage = originalStorage;
        window.LegendTitleScreenV120 = originalTitle;
        window.LegendAshmereV099 = originalAshmere;
      }
    });
    expect(result).toBe(true);
    await expect(page.getByRole('heading', { name: 'Title screen unavailable' })).toBeVisible();
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