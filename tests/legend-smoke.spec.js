const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const dataSource = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const runtimeSource = fs.readFileSync(path.join(__dirname, '../js/core/game-runtime-v120.js'), 'utf8');
const townControllerSource = fs.readFileSync(path.join(__dirname, '../js/systems/ashmere-controller-v099.js'), 'utf8');
const titleScreenSource = fs.readFileSync(path.join(__dirname, '../js/screens/title-screen-v120.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const versionMatch = dataSource.match(/VERSION:\s*['"]v([^'"]+)['"]/);
if (!versionMatch) throw new Error('Could not read LEGEND_DATA.VERSION from js/data.js');
const version = versionMatch[1];

// Each Playwright test runs in an isolated browser context, so clearing localStorage
// here only resets that test's synthetic traveler—not a player's live browser save.
async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  // The game's ember/fog/CTA animations are decorative; disable them in test contexts
  // so WebKit touch targets do not remain perpetually "unstable" during clicks.
  await page.addStyleTag({ content: `
    *, *::before, *::after {

      animation: none !important;

      transition: none !important;

      scroll-behavior: auto !important;

    }
  ` });
  await expect(page.locator('.v120-title')).toBeVisible();
  await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
}

async function startFreshCharacter(page, name = 'QATraveler', options = {}) {
  await openTitle(page);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Name').fill(name);
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
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  if (options.stopAtIntro) {
    await expect(page.locator('.opening-road-v140')).toBeVisible();
    return;
  }
  // Most system-level regressions need a stable Ashmere fixture; the dedicated
  // road-opening spec exercises Oric, ACT, and the complete first expedition.
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
}


async function enterOldRoadFromDeparture(page) {
  await page.getByRole('button', { name: /The Old Road/i }).click();
  await expect(page.locator('.ash100-departure')).toBeVisible();
  const curtain = page.locator('#legend-scene-curtain');
  if (await curtain.count()) {
    await expect(curtain).not.toHaveClass(/is-covering/, { timeout: 7000 });
  }
  await page.locator('#departureBegin').click();
  await expect(page.locator('.exp150-world-page')).toBeVisible();
}

test.describe(`LEGEND v${version} browser regression tests`, () => {
  test('News & Roadmap opens from the title and returns without changing the save', async ({ page }) => {
    await openTitle(page);
    await page.getByRole('button', { name: /News & Roadmap/i }).click();
    await expect(page.getByRole('heading', { name: 'News & Roadmap' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Development News' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Roadmap' })).toBeVisible();
    await expect(page.locator('.dispatches-v140-card')).toHaveCount(8);
    await page.getByRole('button', { name: 'Return to Title' }).click();
    await expect(page.locator('.v120-title')).toBeVisible();
  });

  test('title and visible build version are consistent', async ({ page }) => {
    await openTitle(page);
    await expect.poll(() => page.title()).toContain(`v${version}`);
    await expect(page.locator('.portal-footer')).toContainText(`v${version}`);
    await expect.poll(() => page.evaluate(() => window.LEGEND_DATA?.VERSION)).toBe(`v${version}`);
  });

  test('active runtime does not retain the retired town controller or return key', () => {
    expect(runtimeSource).not.toContain('LegendTownControllerV080');
    expect(runtimeSource).not.toContain('legend-v080-return-ashmere');
    expect(runtimeSource).toContain('legend-awakening-return-to-town-v1');
  });

  test('runtime return bridge works without a document-wide town render observer', async ({ page }) => {
    expect(runtimeSource).not.toContain('MutationObserver');
    expect(runtimeSource).not.toContain('onRender');
    expect(townControllerSource).not.toContain('Ashmere Menu');
    expect(townControllerSource).not.toContain('onRender');

    await startFreshCharacter(page, 'ReturnBridgeQA');
    await page.evaluate(() => {
      window.LegendGameBootstrap.title();
      window.LegendRuntimeV120.returnToAshmere();
    });
    await expect(page.locator('.ash100-town')).toBeVisible();

    const api = await page.evaluate(() => ({
      returnToAshmere: typeof window.LegendRuntimeV120.returnToAshmere,
      handlePendingReturn: typeof window.LegendRuntimeV120.handlePendingReturn,
      onRender: typeof window.LegendRuntimeV120.onRender,
      pendingReturn: sessionStorage.getItem('legend-awakening-return-to-town-v1')
    }));
    expect(api).toEqual({
      returnToAshmere: 'function',
      handlePendingReturn: 'function',
      onRender: 'undefined',
      pendingReturn: null
    });
  });

  test('active script graph excludes retired runtime and road assets', () => {
    expect(indexSource).toContain('js/core/game-runtime-v120.js');
    expect(indexSource).toContain('js/screens/title-screen-v120.js');
    expect(indexSource).toContain('js/content/roads/old-road-v100.js');
    expect(indexSource).toContain('js/systems/road-controller-v100.js');
    expect(indexSource).toContain('js/systems/town/ashmere-hub-v099.js');
    expect(indexSource).toContain('js/systems/town/ashmere-assets-v099.js');
    expect(indexSource).toContain('js/systems/town/ashmere-view-v099.js');
    expect(indexSource.indexOf('js/systems/town/ashmere-assets-v099.js')).toBeLessThan(indexSource.indexOf('js/systems/town/ashmere-view-v099.js'));
    expect(indexSource.indexOf('js/systems/town/ashmere-view-v099.js')).toBeLessThan(indexSource.indexOf('js/systems/town/ashmere-hub-v099.js'));
    expect(indexSource.indexOf('js/systems/town/ashmere-hub-v099.js')).toBeLessThan(indexSource.indexOf('js/systems/ashmere-controller-v099.js'));
    expect(indexSource.indexOf('js/screens/title-screen-v120.js')).toBeLessThan(indexSource.indexOf('js/game.js'));
    expect(indexSource).not.toContain('js/core/runtime-v080.js');
    expect(indexSource).not.toContain('js/systems/road-controller-v087.js');
    expect(indexSource).not.toContain('js/content/roads/old-road-v087.js');
    expect(indexSource).not.toContain('css/road-v087.css');
  });

  test('active v120 title screen module owns current title rendering', async ({ page }) => {
    expect(titleScreenSource).toContain('window.LegendTitleScreenV120');
    await openTitle(page);
    await expect.poll(() => page.evaluate(() => typeof window.LegendTitleScreenV120?.render)).toBe('function');
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
  });

  test('recovered-build saves are not imported by the current loader', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('legend-recovered-build-v06', JSON.stringify({
        username: 'LegacyGhost',
        className: 'Ranger',
        gold: 9999
      }));
    });
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
    await expect(page.locator('#continue')).toHaveCount(0);
    expect(await page.evaluate(() => window.LegendRuntimeV120.loadPlayer())).toBeNull();
  });

  test('active save normalization removes retired road fields but preserves current unknown data', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(window.LEGEND_DATA.SAVE_KEY, JSON.stringify({
        username: 'NormalizeQA',
        className: 'Ranger',
        inventory: { roadToken: 2, customLoot: 7 },
        flags: { roadV087: { stage: 3 }, customFlag: true },
        xpUntil: 123,
        customState: { preserved: true }
      }));
    });
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    const player = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer());
    expect(player.username).toBe('NormalizeQA');
    expect(player.xpUntil).toBeUndefined();
    expect(player.flags.roadV087).toBeUndefined();
    expect(player.flags.customFlag).toBe(true);
    expect(player.inventory.customLoot).toBe(7);
    expect(player.customState).toEqual({ preserved: true });
  });

  test('traveler record builder preserves identity, starting stats, and merged starting inventory', async ({ page }) => {
    await openTitle(page);
    const player = await page.evaluate(() => {
      const storage = window.LegendStorage;
      return window.LegendPlayerRecordV094?.create({
        data: window.LEGEND_DATA,
        name: 'RecordBuilderQA',
        gender: { id: 'unspoken', label: 'Keep It Unspoken', pronouns: 'they/them' },
        personality: { id: 'kind', label: 'Kind-Hearted', bonus: { luck: 1 }, text: 'You notice fear before weakness.' },
        originId: 'Wandering Cook',
        classId: 'Ranger',
        keepsakeId: 'Cooked Ration',
        baseSkills: storage.baseSkills,
        normalize: storage.normalize
      });
    });

    expect(player).not.toBeNull();
    expect(player.username).toBe('RecordBuilderQA');
    expect(player.version).toBe(`v${version}`);
    expect(player.origin).toBe('Wandering Cook');
    expect(player.className).toBe('Ranger');
    expect(player.keepsake).toBe('Cooked Ration');
    expect(player.hp).toBe(115);
    expect(player.maxHp).toBe(115);
    expect(player.gold).toBe(100);
    expect(player.creationV094.bonuses).toEqual({ luck: 1 });
    expect(player.inventory.food).toBe(10);
    expect(player.inventory.potion).toBe(1);
    expect(player.inventory.camp).toBe(1);
    expect(player.flags.introV094Complete).toBe(false);
    expect(player.flags.tutorialStep).toBe('people');
    expect(player.skills.Woodcutting.level).toBe(1);
    expect(player.xpUntil).toBeUndefined();
  });

  test('Ashmere asset helpers preserve item aliases and region-aware presentation', async ({ page }) => {
    await openTitle(page);
    const result = await page.evaluate(() => {
      const assets = window.LegendAssetsV090 || {};
      const data = window.LEGEND_DATA || {};
      const helpers = window.LegendAshmereAssetsV099?.create({
        getAssets: () => assets,
        getData: () => data,
        getPlayer: () => ({ currentRegion: 'Greyfen' }),
        escapeHtml: value => String(value == null ? '' : value).replace(/[&<>'"]/g, character => ({
          '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
        }[character]))
      });
      if (!helpers) return null;
      return {
        woodenSword: helpers.itemIcon('woodenSword'),
        expectedSword: assets.items?.shortSword || assets.items?.pelt || '',
        unknownItem: helpers.itemIcon('not-a-current-item'),
        expectedFallback: assets.items?.pelt || '',
        background: helpers.background(),
        expectedGreyfenBackground: assets.locations?.greyfenMain || assets.locations?.ashmereMain || 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg',
        roadTokenName: helpers.itemName('roadToken'),
        expectedRoadTokenName: data.itemNames?.roadToken || 'Road Token',
        gold: helpers.gold(47)
      };
    });

    expect(result).not.toBeNull();
    expect(result.woodenSword).toBe(result.expectedSword);
    expect(result.unknownItem).toBe(result.expectedFallback);
    expect(result.background).toBe(result.expectedGreyfenBackground);
    expect(result.roadTokenName).toBe(result.expectedRoadTokenName);
    expect(result.gold).toBe('47g');
  });

  test('title background, current LEGEND wordmark, and CSS Awakening sigil render without SVG logo artwork', async ({ page }) => {
    await openTitle(page);
    const backdrop = page.locator('.v120-title-backdrop');
    const emblem = page.locator('.v136-corner-sigil');
    await expect(backdrop).toHaveAttribute('src', /title-ashmere-road\.webp/);
    await expect.poll(() => backdrop.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const logo = page.locator('.v150-logo-lockup');
    await expect(emblem).toBeVisible();
    await expect(emblem).toHaveClass(/v150-corner-sigil/);
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
    await expect(page.locator('.v120-legend-logo')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
    await expect(logo).not.toContainText(/Roads of Ashmere/i);
    await expect(page.locator('.v136-corner-sigil img')).toHaveCount(0);
  });

  test('game opens directly on the actual title menu without the redundant Ashmere Gate screen', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('.title-gate-card')).toHaveCount(0);
    await expect(page.locator('#enterRealm')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
  });

  test('title screen presents the Awakening direction with no duplicate traveler card', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('.v150-logo-lockup')).toBeVisible();
    await expect(page.locator('.v150-logo-lockup')).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
    await expect(page.locator('.v120-legend-logo')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
    await expect(page.locator('#legendTitleAccessibleName')).toHaveText('LEGEND: The Awakening');
    await expect(page.locator('.v120-title-hero h2')).toHaveCount(0);
    await expect(page.locator('.v120-title-hero')).toContainText('Monsters press against the borders');
    await expect(page.locator('.portal100-brand')).not.toContainText('MONSTER WARS');
    await expect(page.locator('.portal100-traveler')).toHaveCount(0);
    await expect(page.locator('#newPrimary')).toBeVisible();
    await expect(page.locator('#new')).toHaveCount(0);
  });

  test('Ashmere hub avoids duplicate camp shortcuts and keeps destinations as the main focus', async ({ page }) => {
    await startFreshCharacter(page, 'AshmereLayoutQA');
    expect(await page.evaluate(() => typeof window.LegendAshmereHubV099?.render)).toBe('function');
    expect(await page.evaluate(() => typeof window.LegendAshmereAssetsV099?.create)).toBe('function');
    expect(await page.evaluate(() => typeof window.LegendAshmereViewV099?.create)).toBe('function');
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ashmere', exact: true })).toBeVisible();
    await expect(page.locator('.ash100-destination')).toHaveCount(7);
    await expect(page.getByRole('heading', { name: 'Your Camp', exact: true })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Ashmere terminal navigation' })).toBeVisible();
  });

  test('new generated RPG art is registered and exists as stable local files', async ({ page }) => {
    await openTitle(page);
    const assets = await page.evaluate(() => {
      const a = window.LegendAssetsV090;
      return {
        paths: [
          a.ui.townServiceIconAtlas,
          ...Object.values(a.ui.serviceIcons),
          ...Object.values(a.skills),
          a.locations.greyfenMarshWalkway,
          a.enemies.mireboundSentinel,
          a.items.ironShortSword,
          a.items.woodcuttersAxe,
          a.items.huntingBowV2,
          a.items.reinforcedRoundShield,
          a.items.ironHelmet,
          a.items.leatherBracers,
          a.items.ironOre,
          a.items.animalHide,
          a.items.marshHerbs
        ],
        sentinelLookup: a.byName('Mirebound Sentinel'),
        sentinelPath: a.enemies.mireboundSentinel
      };
    });
    expect(assets.sentinelLookup).toBe(assets.sentinelPath);
    for (const assetPath of assets.paths) {
      expect(fs.existsSync(path.join(__dirname, '..', assetPath)), assetPath).toBe(true);
    }
  });

  test('Inn services enforce rest and supply costs, including insufficient-gold cases', async ({ page }) => {
    await startFreshCharacter(page, 'InnServicesQA');
    await page.locator('.ash100-destination[data-ash-view="inn"]').click();

    const innIcon = page.locator('#rest .ash099-asset-icon img');
    const roadIcon = page.locator('#camp .ash099-asset-icon img');
    const journalIcon = page.locator('#rumor .ash099-asset-icon img');
    await expect(innIcon).toHaveAttribute('src', /service-inn\.webp/);
    await expect(roadIcon).toHaveAttribute('src', /service-milestone\.webp/);
    await expect(journalIcon).toHaveAttribute('src', /service-journal\.webp/);
    await expect.poll(async () => page.locator('.ash099-asset-icon img').evaluateAll(imgs =>
      imgs.length === 3 && imgs.every(img => img.complete && img.naturalWidth > 0)
    )).toBe(true);

    const before = await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const player = rt.loadPlayer();
      player.gold = 200;
      player.hp = Math.max(1, Number(player.maxHp || 100) - 23);
      player.inventory = player.inventory || {};
      player.inventory.camp = 0;
      rt.savePlayer(player);
      return {
        gold: Number(player.gold),
        hp: Number(player.hp),
        maxHp: Number(player.maxHp),
        camp: Number(player.inventory.camp)
      };
    });

    await page.locator('#rest').click();
    await expect(page.locator('#ashNote')).toContainText('recover completely');
    const rested = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(player.gold),
        hp: Number(player.hp),
        maxHp: Number(player.maxHp),
        camp: Number(player.inventory.camp)
      };
    });
    expect(rested.gold).toBe(before.gold - 35);
    expect(rested.hp).toBe(rested.maxHp);
    expect(rested.camp).toBe(before.camp);

    await page.locator('#camp').click();
    await expect(page.locator('#ashNote')).toContainText('Bought camp supplies.');
    const stocked = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(player.gold),
        hp: Number(player.hp),
        maxHp: Number(player.maxHp),
        camp: Number(player.inventory.camp)
      };
    });
    expect(stocked.gold).toBe(rested.gold - 90);
    expect(stocked.camp).toBe(rested.camp + 1);
    expect(stocked.hp).toBe(rested.hp);

    const lowFunds = await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const player = rt.loadPlayer();
      player.gold = 20;
      player.hp = Math.max(1, Number(player.maxHp || 100) - 9);
      rt.savePlayer(player);
      return {
        gold: Number(player.gold),
        hp: Number(player.hp),
        maxHp: Number(player.maxHp),
        camp: Number(player.inventory.camp)
      };
    });

    await page.locator('#rest').click();
    await expect(page.locator('#ashNote')).toContainText('Not enough gold.');
    const rejectedRest = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(player.gold),
        hp: Number(player.hp),
        maxHp: Number(player.maxHp),
        camp: Number(player.inventory.camp)
      };
    });
    expect(rejectedRest).toEqual(lowFunds);

    await page.locator('#camp').click();
    await expect(page.locator('#ashNote')).toContainText('Not enough gold.');
    const rejectedCamp = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(player.gold),
        hp: Number(player.hp),
        maxHp: Number(player.maxHp),
        camp: Number(player.inventory.camp)
      };
    });
    expect(rejectedCamp).toEqual(lowFunds);
  });

  test('Greyfen hub changes identity and destinations after regional travel', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      pl.inventory=pl.inventory||{};
      pl.inventory.roadToken=5;
      rt.savePlayer(pl);
      window.LegendAshmereV099.renderAshmere();
    });
    await expect(page.locator('.ash100-town')).toContainText('Greyfen');
    await expect(page.locator('.ash100-destinations')).toContainText('Reedlight Inn');
    await expect(page.locator('.ash100-destinations')).toContainText('Marsh Market');
    await expect(page.getByRole('navigation', { name: 'Greyfen town navigation' })).toBeVisible();
    await expect(page.locator('.ash100-bottom-panel')).toHaveCount(0);
  });

  test('A Dry Crossing exposes its tradeoffs and persists the safe-route reward once', async ({ page }) => {
    await startFreshCharacter(page, 'DryCrossingQA');
    const before=await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      pl.inventory=pl.inventory||{};
      pl.inventory.roadToken=5;
      rt.savePlayer(pl);
      window.LegendAshmereV099.renderAshmere();
      return {gold:Number(pl.gold||0),herbs:Number(pl.inventory.roadHerb||0)};
    });
    await page.locator('.ash100-destination[data-ash-view="crossing"]').click();
    await expect(page.getByRole('heading', { name: 'A Dry Crossing' })).toBeVisible();
    await expect(page.locator('[data-crossing-choice="posts"]')).toContainText('35g and 1 Road Herb');
    await expect(page.locator('[data-crossing-choice="reeds"]')).toContainText('65% chance');
    await page.locator('[data-crossing-choice="posts"]').click();
    await expect(page.getByRole('heading', { name: 'The marker is safe' })).toBeVisible();
    const after=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {gold:Number(pl.gold||0),herbs:Number(pl.inventory.roadHerb||0),complete:Boolean(pl.flags.greyfenDryCrossingComplete)};
    });
    expect(after.gold).toBe(before.gold+35);
    expect(after.herbs).toBe(before.herbs+1);
    expect(after.complete).toBe(true);
    await page.locator('#ashBack').click();
    await page.locator('.ash100-destination[data-ash-view="crossing"]').click();
    await expect(page.locator('[data-crossing-choice]')).toHaveCount(0);
    await expect(page.locator('.ash099-screen')).toContainText('cannot be claimed again');
  });

  test('Dry Crossing risky route penalizes a miss and allows a rewarded retry', async ({ page }) => {
    await startFreshCharacter(page, 'RiskyCrossingQA');
    const before = await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.currentRegion = 'Greyfen';
      pl.discoveredRegions = ['Ashmere', 'Greyfen'];
      pl.inventory = pl.inventory || {};
      pl.inventory.roadToken = 5;
      pl.inventory.roadHerb = 0;
      pl.gold = 40;
      pl.hp = 50;
      rt.savePlayer(pl);
      window.LegendAshmereV099.renderAshmere();
      return {
        hp: Number(pl.hp),
        gold: Number(pl.gold),
        herbs: Number(pl.inventory.roadHerb || 0)
      };
    });

    await page.locator('.ash100-destination[data-ash-view="crossing"]').click();
    await expect(page.getByRole('heading', { name: 'A Dry Crossing' })).toBeVisible();
    await page.evaluate(() => { Math.random = () => 0.9; });
    await page.locator('[data-crossing-choice="reeds"]').click();
    await expect(page.getByRole('heading', { name: 'The reeds turn you back' })).toBeVisible();

    const miss = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        hp: Number(pl.hp),
        gold: Number(pl.gold),
        herbs: Number(pl.inventory.roadHerb || 0),
        attempts: Number(pl.flags.greyfenCrossingAttempts || 0),
        complete: Boolean(pl.flags.greyfenDryCrossingComplete),
        memories: pl.memories || []
      };
    });
    expect(miss.hp).toBe(before.hp - 5);
    expect(miss.gold).toBe(before.gold);
    expect(miss.herbs).toBe(before.herbs);
    expect(miss.attempts).toBe(1);
    expect(miss.complete).toBe(false);
    expect(miss.memories.some(memory => /reed bed turned you back from Greyfen/i.test(memory))).toBe(true);
    await expect(page.locator('.ash099-screen')).toContainText('You may try again');

    await page.locator('#ashBack').click();
    await page.locator('.ash100-destination[data-ash-view="crossing"]').click();
    await page.evaluate(() => { Math.random = () => 0.1; });
    await page.locator('[data-crossing-choice="reeds"]').click();
    await expect(page.getByRole('heading', { name: 'The shortcut pays off' })).toBeVisible();

    const success = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        hp: Number(pl.hp),
        gold: Number(pl.gold),
        herbs: Number(pl.inventory.roadHerb || 0),
        attempts: Number(pl.flags.greyfenCrossingAttempts || 0),
        complete: Boolean(pl.flags.greyfenDryCrossingComplete),
        memories: pl.memories || []
      };
    });
    expect(success.hp).toBe(miss.hp);
    expect(success.gold).toBe(before.gold + 65);
    expect(success.herbs).toBe(before.herbs + 2);
    expect(success.attempts).toBe(2);
    expect(success.complete).toBe(true);
    expect(success.memories.some(memory => /recovered Greyfen.*through the reed bed/i.test(memory))).toBe(true);
  });

  test('Continue Journey returns to the saved playable region', async ({ page }) => {
    await startFreshCharacter(page, 'RegionResumeQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      rt.savePlayer(pl);
      window.LegendGameBootstrap.title();
    });
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('#continue')).toContainText('Return to Greyfen');
    await page.locator('#continue').click();
    await expect(page.locator('.ash100-town-greyfen')).toBeVisible();
    const region=await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().currentRegion);
    expect(region).toBe('Greyfen');
  });

  test('loadout, inventory, quest journal, and progression survive a real page reload', async ({ page }) => {
    await startFreshCharacter(page, 'ReloadPersistenceQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.weapon = 'stoneSword';
      pl.ownedWeapons = pl.ownedWeapons || {};
      pl.ownedWeapons.stoneSword = 1;
      pl.inventory = pl.inventory || {};
      pl.inventory.roadHerb = 7;
      pl.inventory.potion = 2;
      pl.questLog = Array.isArray(pl.questLog) ? pl.questLog : [];
      pl.questLog.push('Playwright reload marker: Blackroot clues retained');
      pl.stats = pl.stats || {};
      pl.stats.roadVictories = 3;
      rt.savePlayer(pl);
      window.LegendGameBootstrap.title();
    });

    await expect(page.locator('.v120-title')).toBeVisible();
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('#continue')).toContainText(/Return to Ashmere/i);
    await page.locator('#continue').click();
    await expect(page.locator('.ash100-town')).toBeVisible();

    const persisted = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        region: pl.currentRegion,
        weapon: pl.weapon,
        ownedWeapon: Number(pl.ownedWeapons?.stoneSword || 0),
        herbs: Number(pl.inventory?.roadHerb || 0),
        potions: Number(pl.inventory?.potion || 0),
        journalHasMarker: Array.isArray(pl.questLog) &&
          pl.questLog.includes('Playwright reload marker: Blackroot clues retained'),
        victories: Number(pl.stats?.roadVictories || 0)
      };
    });
    expect(persisted.region).toBe('Ashmere');
    expect(persisted.weapon).toBe('stoneSword');
    expect(persisted.ownedWeapon).toBe(1);
    expect(persisted.herbs).toBe(7);
    expect(persisted.potions).toBe(2);
    expect(persisted.journalHasMarker).toBe(true);
    expect(persisted.victories).toBe(3);
  });

  test('combat defeat ends the expedition with no victory rewards and preserves the traveler', async ({ page }) => {
    await startFreshCharacter(page, 'CombatDefeatQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.hp = 1;
      pl.armor = 'none';
      pl.flags = pl.flags || {};
      pl.flags.roadExpeditionV100 = {
        ...(pl.flags.roadExpeditionV100 || {}),
        stage: 0, pressure: 53, trips: 0, events: 0, finds: 0, battles: 0
      };
      // Pin the encounter to a durable predator with a guaranteed damaging opening;
      // the test is about defeat recovery, not random enemy health or armor mitigation.
      const road = window.LegendRoadsV100.oldRoad;
      const wolf = road.enemies.find(enemy => enemy.id === 'wolf');
      if (!wolf) throw new Error('Blackroot Wolf fixture is missing');
      road.enemies = [{ ...wolf, hp: [100, 100], damage: [4, 10] }];
      rt.savePlayer(pl);
    });

    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' })
      .getByRole('button', { name: /Routes/i }).click();
    await enterOldRoadFromDeparture(page);
    await page.locator('#push').click();
    await expect(page.locator('.exp100-combat')).toBeVisible();

    const before = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      const road = pl.flags?.roadExpeditionV100 || {};
      return {
        pressure: Number(road.pressure || 0),
        victories: Number(pl.stats?.roadVictories || 0),
        defeated: Number(pl.stats?.monstersDefeated || 0),
        gold: Number(pl.gold || 0),
        inventory: { ...(pl.inventory || {}) }
      };
    });
    await page.locator('#strike').click();
    await expect(page.locator('.exp100-outcome')).toBeVisible();
    await expect(page.locator('.exp100-outcome')).toContainText('Driven Back');
    await expect(page.locator('.exp100-outcome')).toContainText('badly wounded');

    const after = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      const road = pl.flags?.roadExpeditionV100 || {};
      return {
        hp: Number(pl.hp),
        pressure: Number(road.pressure || 0),
        stage: Number(road.stage || 0),
        victories: Number(pl.stats?.roadVictories || 0),
        defeated: Number(pl.stats?.monstersDefeated || 0),
        gold: Number(pl.gold || 0),
        inventory: { ...(pl.inventory || {}) }
      };
    });
    expect(after.hp).toBe(1);
    expect(after.stage).toBe(0);
    expect(after.pressure).toBe(Math.min(100, before.pressure + 12));
    expect(after.victories).toBe(before.victories);
    expect(after.defeated).toBe(before.defeated);
    expect(after.gold).toBe(before.gold);
    expect(after.inventory).toEqual(before.inventory);

    await page.locator('#outcomeReturn').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendRuntimeV120.loadPlayer().hp)).toBe(1);
  });

  test('Greyfen work board offers lowland-specific contracts', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenWorkQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      pl.inventory=pl.inventory||{};
      pl.inventory.roadToken=5;
      rt.savePlayer(pl);
      window.LegendAshmereV099.renderAshmere();
    });
    await page.locator('.ash100-destination[data-ash-view="work"]').click();
    await expect(page.locator('#ashBack')).toHaveText('Back to Greyfen');
    await expect(page.locator('[data-job-open="peat"]')).toContainText('Dry Peat Bricks');
    await expect(page.locator('[data-job-open="salvage"]')).toContainText('Sort a Salvage Basket');
    await expect(page.locator('[data-job-open="markers"]')).toContainText('Reset Flood Markers');
    await expect(page.locator('[data-job-open="wood"]')).toHaveCount(0);
    await page.locator('[data-job-open="peat"]').click();
    await expect(page.locator('.ash099-job-meta')).toContainText('Dry Peat Brick');
    await expect(page.locator('.ash099-job-mode-sequence')).toBeVisible();
  });

  test('Greyfen uses its own local scene and keeper dialogue', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenKeepersQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      pl.inventory=pl.inventory||{};
      pl.inventory.roadToken=5;
      rt.savePlayer(pl);
      window.LegendAshmereV099.renderAshmere();
    });
    await expect(page.locator('.ash100-town-greyfen .ash100-hero img')).toHaveAttribute('src', /greyfen-town\.webp/);
    await page.locator('.ash100-destination[data-ash-view="people"]').click();
    await expect(page.locator('.ash099-head')).toContainText(/People of Greyfen/i);
    await expect(page.locator('.ash099-npc-grid')).toContainText(/Boundary Archivist/i);
    await page.locator('.ash099-npc-card[data-ash-view="mara"]').click();
    await expect(page.locator('.ash099-head')).toContainText(/Boundary Archivist/i);
    await expect(page.locator('.ash099-screen')).toContainText(/drowned records/i);
  });

  test('Greyfen route board avoids starting the Ashmere Old Road expedition', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenRoutesQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      pl.inventory=pl.inventory||{};
      pl.inventory.roadToken=5;
      rt.savePlayer(pl);
      window.LegendAshmereV099.renderAshmere();
    });
    await page.getByRole('navigation', { name: 'Greyfen town navigation' }).getByRole('button', { name: /Routes/i }).click();
    await expect(page.locator('.ash099-head')).toContainText(/Lowland Crossings/i);
    await expect(page.locator('[data-ash-view="road"]')).toHaveCount(0);
    await expect(page.locator('[data-ash-view="regions"]')).toBeVisible();
  });

  test('blank traveler name shows inline validation without leaving creation', async ({ page }) => {
    await openTitle(page);
    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    await page.locator('#v094Next').click();
    await expect(page.locator('#v094NameError')).toHaveText('Please enter a traveler name.');
    await expect(page.getByRole('heading', { name: 'What name shall you carry?' })).toBeVisible();
    await expect(page.locator('#v094Name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('new traveler reaches Ashmere', async ({ page }) => {
    await startFreshCharacter(page, 'AshmereQA');
    await expect(page.locator('.ash100-town')).toContainText('Ashmere');
    await expect(page.locator('.ash100-town')).toContainText('AshmereQA');
    await expect(page.getByRole('navigation', { name: 'Ashmere terminal navigation' })).toBeVisible();
  });

  test('Routes opens route board instead of starting an expedition', async ({ page }) => {
    await startFreshCharacter(page, 'RoutesQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await expect(page.getByRole('heading', { name: 'Routes & Expeditions' })).toBeVisible();
    await expect(page.getByRole('button', { name: /The Old Road/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Road Network/i })).toBeVisible();
    await expect(page.locator('.ash100-town')).toHaveCount(0);
  });

  test('Road Network opens regional map and stays on map', async ({ page }) => {
    await startFreshCharacter(page, 'MapQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Road Network/i }).click();
    await expect(page.getByRole('heading', { name: 'Roads & Regions' })).toBeVisible();
    await expect(page.getByText('Greyfen', { exact: true })).toBeVisible();
    await expect(page.getByText('Ironpass', { exact: true })).toBeVisible();
    await expect(page.locator('.ash100-town')).toHaveCount(0);
  });

  test('regional unlocks enforce Greyfen before Ironpass even with surplus tokens', async ({ page }) => {
    await startFreshCharacter(page, 'RegionOrderQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.inventory=pl.inventory||{};
      pl.inventory.roadToken=50;
      rt.savePlayer(pl);
      window.LegendRegionsV100.render();
    });
    await expect(page.getByRole('heading', { name: 'Roads & Regions' })).toBeVisible();
    const greyfen=page.locator('.reg100-card').filter({ has: page.getByRole('heading', { name: 'Greyfen', exact: true }) });
    const ironpass=page.locator('.reg100-card').filter({ has: page.getByRole('heading', { name: 'Ironpass', exact: true }) });
    await expect(greyfen.locator('.reg100-card-scene img')).toHaveAttribute('src', /greyfen-marsh-walkway\.webp/);
    await expect.poll(() => greyfen.locator('.reg100-card-scene img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(greyfen.locator('[data-unlock="Greyfen"]')).toBeVisible();
    await expect(ironpass).toContainText('Requires Greyfen first');
    await expect(ironpass.locator('[data-unlock="Ironpass"]')).toHaveCount(0);
    let state=await page.evaluate(() => {
      window.LegendRegionsV100.unlock('Ironpass');
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {currentRegion:pl.currentRegion,known:pl.discoveredRegions,tokens:pl.inventory.roadToken};
    });
    expect(state.currentRegion).toBe('Ashmere');
    expect(state.known).not.toContain('Ironpass');
    expect(state.tokens).toBe(50);

    await page.locator('[data-unlock="Greyfen"]').click();
    await expect(ironpass).toContainText('Complete A Dry Crossing first');
    await expect(ironpass.locator('[data-unlock="Ironpass"]')).toHaveCount(0);
    state=await page.evaluate(() => {
      window.LegendRegionsV100.unlock('Ironpass');
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {currentRegion:pl.currentRegion,known:pl.discoveredRegions,tokens:pl.inventory.roadToken};
    });
    expect(state.currentRegion).toBe('Greyfen');
    expect(state.known).toContain('Greyfen');
    expect(state.known).not.toContain('Ironpass');
    expect(state.tokens).toBe(45);

    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.flags.greyfenDryCrossingComplete=true;
      rt.savePlayer(pl);
      window.LegendRegionsV100.render();
    });
    await expect(ironpass).toContainText('In development');
    await expect(ironpass.locator('[data-unlock="Ironpass"]')).toHaveCount(0);
  });

  test('Profile opens account screen without falling back to town', async ({ page }) => {
    await startFreshCharacter(page, 'ProfileQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Profile/i }).click();
    await expect(page.getByText(/LEGEND ACCOUNT/i)).toBeVisible();
    await expect(page.getByText(/ASHMERE ACCOUNT/i)).toBeVisible();
    await expect(page.locator('.ash100-town')).toHaveCount(0);
  });

  test('desktop viewport has no horizontal overflow at title and town', async ({ page }) => {
    await openTitle(page);
    let overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBe(false);
    await startFreshCharacter(page, 'DesktopQA');
    overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBe(false);
  });

  test('Ashmere Town Square keeps direct conversations with local NPCs accessible', async ({ page }) => {
    await startFreshCharacter(page, 'PeopleQA');
    await expect(page.locator('.ash100-destinations')).toContainText('Town Square');
    await page.locator('.ash100-destinations .ash100-destination[data-ash-view="people"]').click();
    await expect(page.getByRole('heading', { name: 'People of Ashmere' })).toBeVisible();
    const oricCard = page.locator('.ash099-npc-card[data-ash-view="oric"] img');
    await expect(oricCard).toBeVisible();
    await expect(oricCard).toHaveAttribute('src', /assets\/generated\/npcs\/captain-oric\.webp$/);
    await expect.poll(() => oricCard.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.locator('[data-ash-view="oric"]').click();
    await expect(page.getByRole('heading', { name: 'Captain Oric' })).toBeVisible();
    const oricDialoguePortrait = page.locator('.ash099-head img');
    await expect(oricDialoguePortrait).toHaveAttribute('src', /assets\/generated\/npcs\/captain-oric\.webp$/);
    await expect.poll(() => oricDialoguePortrait.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  });

  test('town job awards gold, favor, and progression XP', async ({ page }) => {
    await startFreshCharacter(page, 'JobQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.xp = 95;
      rt.savePlayer(pl);
    });
    await page.locator('.ash100-destinations').getByRole('button', { name: /Work Board/i }).click();
    await expect(page.getByRole('heading', { name: 'Work Board' })).toBeVisible();
    await page.locator('[data-job-open="wood"]').click();
    await page.locator('#jobStrike').click();
    await expect(page.locator('#jobResult')).toBeVisible();
    await expect(page.locator('#jobResult')).toContainText(/Earned \d+g/);
    await expect(page.locator('#jobResult')).toContainText(/XP \+\d+/);
    await expect(page.locator('#jobResult')).toContainText(/Level up! You are now level 2\./);
    await expect(page.locator('#jobResult')).not.toContainText(/\.\./);
    await expect(page.locator('#jobStrike')).toHaveText('Job Complete');
  });

  test('character creation choices are clearly selected and progress is explained', async ({ page }) => {
    await openTitle(page);
    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    await page.locator('#v094Name').fill('ChoiceQA');
    await page.locator('#v094Next').click();
    await expect(page.locator('.v094-stepper')).toContainText('STEP 2 OF 7');
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.locator('#v094Next').click();
    await expect(page.locator('#v094ChoiceError')).toBeVisible();
    const identity = page.locator('[data-gender="unspoken"]');
    await identity.click();
    await expect(page.locator('[data-gender="unspoken"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.v094-choice.is-selected')).toContainText('Keep It Unspoken');
    await expect(pageErrors).toEqual([]);
    await page.locator('#v094Next').click();
    const personality = page.locator('[data-personality="kind"]');
    await personality.click();
    await expect(page.locator('[data-personality="kind"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#v094Next').click();
    await page.locator('#v094Back').click();
    await expect(page.locator('[data-personality="kind"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(pageErrors).toEqual([]);
  });

  test('Ranger expedition encounter presents its distinct class technique', async ({ page }) => {
    await startFreshCharacter(page, 'BattleQA');
    // Prime pressure so the first advance deterministically triggers combat.
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120, pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.flags.roadExpeditionV100={...(pl.flags.roadExpeditionV100||{}),stage:0,pressure:53,trips:0,events:0,finds:0,battles:0};
      // Pin this browser test to the goblin so its intent pattern is deterministic.
      const road = window.LegendRoadsV100.oldRoad;
      road.enemies = road.enemies.filter(enemy => enemy.id === 'goblin');
      rt.savePlayer(pl);
    });
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await enterOldRoadFromDeparture(page);
    await expect(page.locator('.exp100-head')).toBeVisible();
    await page.locator('#push').click();
    await expect(page.locator('.exp100-combat')).toBeVisible();
    await expect(page.locator('#skill')).toContainText('Trap Shot');
    await expect(page.locator('.rpg-enemy-tell')).toContainText(/Enemy intent/i);
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-guardbreak/);
    await expect(page.locator('.rpg-foe-nameplate')).toContainText('GUARD BREAK');
    await expect(page.locator('#guard')).toContainText(/GUARD/i);
    await expect(page.locator('.rpg-turn-heading')).toContainText('YOUR TURN');
    await expect(page.locator('.rpg-command-grid .rpg-command')).toHaveCount(4);
    await expect(page.locator('#strike')).toContainText('FIGHT');
    await expect(page.locator('#skill')).toContainText('ACT');
    await expect(page.locator('#item')).toContainText('ITEM');
    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-attack/);
    await expect(page.locator('.rpg-foe-nameplate')).toContainText('OPPONENT');
    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-heavy/);
    await expect(page.locator('.rpg-foe-nameplate')).toContainText('HEAVY WIND-UP');
  });

  test('Work Board offers multiple task types instead of one timing minigame', async ({ page }) => {
    await startFreshCharacter(page, 'VariedJobsQA');
    await page.locator('.ash100-destinations').getByRole('button', { name: /Work Board/i }).click();
    await expect(page.locator('[data-job-open="wood"]')).toContainText(/Timing challenge/i);
    await expect(page.locator('[data-job-open="gate"]')).toContainText(/Read the signal/i);
    await expect(page.locator('[data-job-open="records"]')).toContainText(/Solve the clue/i);
    await expect(page.locator('[data-job-open="crates"]')).toContainText(/Memory sequence/i);
    await page.locator('[data-job-open="gate"]').click();
    await expect(page.locator('.ash099-job-mode-signal')).toBeVisible();
    await expect(page.locator('.ash099-job-track')).toHaveCount(0);
    await page.locator('[data-job-choice="0"]').click();
    await expect(page.locator('#jobResult')).toContainText(/recognize Oric/i);
  });

  test('Work Board memory sequence can be studied and repeated', async ({ page }) => {
    await startFreshCharacter(page, 'SequenceQA');
    await page.locator('.ash100-destinations').getByRole('button', { name: /Work Board/i }).click();
    await page.locator('[data-job-open="crates"]').click();
    await expect(page.locator('.ash099-job-mode-sequence')).toBeVisible();
    await page.locator('#jobStartSequence').click();
    await expect(page.locator('[data-job-sequence="BRACE"]')).toBeEnabled({ timeout: 6000 });
    for (const action of ['BRACE','LIFT','TURN','SET']) await page.locator('[data-job-sequence="'+action+'"]').click();
    await expect(page.locator('#jobResult')).toContainText(/repeated the full handling sequence/i);
  });

  test('Side contracts track only post-acceptance exploration and pay rewards once', async ({ page }) => {
    await startFreshCharacter(page, 'ContractsQA');
    const before = await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.stats = pl.stats || {};
      // A point found before accepting must not satisfy a new posting.
      pl.stats.pointsOfInterest = Number(pl.stats.pointsOfInterest || 0) + 1;
      rt.savePlayer(pl);
      return {
        gold: Number(pl.gold || 0),
        xp: Number(pl.xp || 0),
        food: Number(pl.inventory?.food || 0),
        favor: Number(pl.flags?.ashmereFavor || 0),
        pointsOfInterest: Number(pl.stats.pointsOfInterest || 0),
        completed: Number(pl.stats.sideContractsCompleted || 0)
      };
    });

    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Side Stories & Contracts/i }).click();
    await expect(page.locator('.ash099-contract-card')).toHaveCount(4);
    await page.locator('[data-contract-accept="watchlightSurvey"]').click();
    await expect(page.locator('[data-contract-turnin="watchlightSurvey"]')).toHaveCount(0);
    await expect(page.locator('.ash099-contract-card').filter({ has: page.getByRole('heading', { name: 'The Watchlight Survey' }) })).toContainText(/In progress · 0 \/ 1/);

    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.stats = pl.stats || {};
      pl.stats.pointsOfInterest = Number(pl.stats.pointsOfInterest || 0) + 1;
      rt.savePlayer(pl);
    });
    await page.locator('#ashBack').click();
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Side Stories & Contracts/i }).click();
    await expect(page.locator('[data-contract-turnin="watchlightSurvey"]')).toBeVisible();
    await page.locator('[data-contract-turnin="watchlightSurvey"]').click();
    await expect(page.locator('.ash099-contract-completed')).toContainText(/Recorded in Journal/i);

    const after = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(pl.gold || 0),
        xp: Number(pl.xp || 0),
        food: Number(pl.inventory?.food || 0),
        favor: Number(pl.flags?.ashmereFavor || 0),
        completed: Number(pl.stats?.sideContractsCompleted || 0),
        contractComplete: Boolean(pl.flags?.sideContracts?.watchlightSurvey?.complete),
        memoryRecorded: (pl.memories || []).some(memory => /Completed side contract: The Watchlight Survey/i.test(memory))
      };
    });
    expect(after.gold).toBe(before.gold + 55);
    expect(after.xp).toBe(before.xp + 25);
    expect(after.food).toBe(before.food + 1);
    expect(after.favor).toBe(before.favor + 2);
    expect(after.completed).toBe(before.completed + 1);
    expect(after.contractComplete).toBe(true);
    expect(after.memoryRecorded).toBe(true);

    // Reopening the journal must not expose a second turn-in action or pay again.
    await page.locator('#ashBack').click();
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Side Stories & Contracts/i }).click();
    await expect(page.locator('[data-contract-turnin="watchlightSurvey"]')).toHaveCount(0);
    const reopened = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(pl.gold || 0),
        xp: Number(pl.xp || 0),
        food: Number(pl.inventory?.food || 0),
        favor: Number(pl.flags?.ashmereFavor || 0),
        completed: Number(pl.stats?.sideContractsCompleted || 0)
      };
    });
    expect(reopened).toEqual({
      gold: after.gold,
      xp: after.xp,
      food: after.food,
      favor: after.favor,
      completed: after.completed
    });
    await page.reload();
    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  });

  test('Side contracts track post-acceptance battles and secured returns', async ({ page }) => {
    await startFreshCharacter(page, 'RoadContractsQA');

    const before = await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const player = rt.loadPlayer();
      player.gold = 100;
      player.xp = 0;
      player.stats = player.stats || {};
      player.stats.roadVictories = 2;
      player.stats.oldRoadClears = 4;
      player.stats.sideContractsCompleted = 0;
      player.flags = player.flags || {};
      player.flags.ashmereFavor = 0;
      player.flags.sideContracts = {};
      player.inventory = player.inventory || {};
      player.inventory.clothScrap = 0;
      player.inventory.oil = 0;
      rt.savePlayer(player);
      return {
        gold: Number(player.gold),
        xp: Number(player.xp),
        victories: Number(player.stats.roadVictories),
        clears: Number(player.stats.oldRoadClears),
        clothScrap: Number(player.inventory.clothScrap),
        oil: Number(player.inventory.oil),
        favor: Number(player.flags.ashmereFavor),
        completed: Number(player.stats.sideContractsCompleted)
      };
    });

    await page.evaluate(() => window.LegendAshmereV099.route('quests'));
    await page.locator('[data-contract-accept="blackrootProof"]').click();
    await page.locator('[data-contract-accept="maraSafeReturn"]').click();
    await expect(page.locator('[data-contract-turnin="blackrootProof"]')).toHaveCount(0);
    await expect(page.locator('[data-contract-turnin="maraSafeReturn"]')).toHaveCount(0);

    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const player = rt.loadPlayer();
      player.stats.roadVictories += 1;
      player.stats.oldRoadClears += 1;
      rt.savePlayer(player);
      window.LegendAshmereV099.route('quests');
    });

    await expect(page.locator('[data-contract-turnin="blackrootProof"]')).toBeVisible();
    await expect(page.locator('[data-contract-turnin="maraSafeReturn"]')).toBeVisible();

    await page.locator('[data-contract-turnin="blackrootProof"]').click();
    await expect(page.locator('.ash099-contract-card').filter({
      has: page.getByRole('heading', { name: 'Proof from the Blackroot Road' })
    })).toContainText(/Recorded in Journal/i);

    const battlePaid = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(player.gold),
        xp: Number(player.xp),
        clothScrap: Number(player.inventory.clothScrap),
        oil: Number(player.inventory.oil),
        favor: Number(player.flags.ashmereFavor),
        completed: Number(player.stats.sideContractsCompleted),
        battleComplete: Boolean(player.flags.sideContracts.blackrootProof.complete),
        returnComplete: Boolean(player.flags.sideContracts.maraSafeReturn.complete),
        memory: (player.memories || []).some(line => /Completed side contract: Proof from the Blackroot Road/i.test(line))
      };
    });
    expect(battlePaid.gold).toBe(before.gold + 75);
    expect(battlePaid.xp).toBe(before.xp + 35);
    expect(battlePaid.clothScrap).toBe(before.clothScrap + 1);
    expect(battlePaid.oil).toBe(before.oil);
    expect(battlePaid.favor).toBe(before.favor + 2);
    expect(battlePaid.completed).toBe(before.completed + 1);
    expect(battlePaid.battleComplete).toBe(true);
    expect(battlePaid.returnComplete).toBe(false);
    expect(battlePaid.memory).toBe(true);
    await expect(page.locator('[data-contract-turnin="blackrootProof"]')).toHaveCount(0);
    await expect(page.locator('[data-contract-turnin="maraSafeReturn"]')).toBeVisible();

    await page.locator('[data-contract-turnin="maraSafeReturn"]').click();
    await expect(page.locator('.ash099-contract-card').filter({
      has: page.getByRole('heading', { name: 'Mara’s Missing Road Ledger' })
    })).toContainText(/Recorded in Journal/i);

    const returnPaid = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(player.gold),
        xp: Number(player.xp),
        clothScrap: Number(player.inventory.clothScrap),
        oil: Number(player.inventory.oil),
        favor: Number(player.flags.ashmereFavor),
        completed: Number(player.stats.sideContractsCompleted),
        battleComplete: Boolean(player.flags.sideContracts.blackrootProof.complete),
        returnComplete: Boolean(player.flags.sideContracts.maraSafeReturn.complete),
        battleMemory: (player.memories || []).some(line => /Completed side contract: Proof from the Blackroot Road/i.test(line)),
        returnMemory: (player.memories || []).some(line => /Completed side contract: Mara’s Missing Road Ledger/i.test(line))
      };
    });
    expect(returnPaid.gold).toBe(before.gold + 75 + 95);
    expect(returnPaid.xp).toBe(before.xp + 35 + 50);
    expect(returnPaid.clothScrap).toBe(before.clothScrap + 1);
    expect(returnPaid.oil).toBe(before.oil + 1);
    expect(returnPaid.favor).toBe(before.favor + 4);
    expect(returnPaid.completed).toBe(before.completed + 2);
    expect(returnPaid.battleComplete).toBe(true);
    expect(returnPaid.returnComplete).toBe(true);
    expect(returnPaid.battleMemory).toBe(true);
    expect(returnPaid.returnMemory).toBe(true);
    await expect(page.locator('[data-contract-turnin="blackrootProof"]')).toHaveCount(0);
    await expect(page.locator('[data-contract-turnin="maraSafeReturn"]')).toHaveCount(0);

    await page.reload();

    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    const persisted = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      return {
        gold: Number(player.gold),
        xp: Number(player.xp),
        victories: Number(player.stats.roadVictories),
        clears: Number(player.stats.oldRoadClears),
        completed: Number(player.stats.sideContractsCompleted),
        battleComplete: Boolean(player.flags.sideContracts.blackrootProof.complete),
        returnComplete: Boolean(player.flags.sideContracts.maraSafeReturn.complete)
      };
    });
    expect(persisted).toEqual({
      gold: before.gold + 75 + 95,
      xp: before.xp + 35 + 50,
      victories: before.victories + 1,
      clears: before.clears + 1,
      completed: before.completed + 2,
      battleComplete: true,
      returnComplete: true
    });
  });

  test('Forge shows material-specific sword illustrations and tactical passive descriptions', async ({ page }) => {
    await startFreshCharacter(page, 'WeaponTraitsQA');
    await page.locator('.ash100-destinations').getByRole('button', { name: /Forge & Workshop/i }).click();
    await expect(page.locator('[data-gear="woodenSword"] .ash099-weapon-art-woodenSword')).toBeVisible();
    await expect(page.locator('[data-gear="stoneSword"]')).toContainText(/Heavy Strike deals 25% more damage/i);
    await expect(page.locator('[data-gear="steelSword"]')).toContainText(/20% critical chance/i);
    await expect(page.locator('[data-gear="woodenSword"] .ash099-weapon-art svg')).toBeVisible();
  });

  test('Old Road fork offers a persistent risk-reward route choice', async ({ page }) => {
    await startFreshCharacter(page, 'ForkQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await enterOldRoadFromDeparture(page);
    const expeditionHeading = page.locator('.exp100-scene-live + .exp100-head');
    await expect(expeditionHeading).toBeVisible();
    await expect.poll(() => expeditionHeading.evaluate(el => getComputedStyle(el).marginTop)).toBe('0px');
    await expect(page.locator('#routeRidge')).toBeVisible();
    await expect(page.locator('#routeReeds')).toBeVisible();
    await expect(page.locator('#routeRidge')).toContainText(/Safer/i);
    await expect(page.locator('#routeReeds')).toContainText(/Riskier/i);
    await page.locator('#routeReeds').click();
    await expect(page.locator('.exp100-route-choice')).toHaveCount(0);
    await expect(page.locator('.exp100-poi-done')).toContainText('Reed Cut');
    await expect(page.locator('.exp100-head')).toContainText(/\+1 Bell Fragment/i);
    await expect(page.locator('#routeReeds')).toHaveCount(0);
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head')).toContainText(/Reed Cut narrows behind you/i);
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure rises by 16/i);
    await expect(page.locator('#poiInspect')).toHaveCount(0);
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/Tracks Beneath the Blue Light/i);
    await page.locator('#poiInspect').click();
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure rises by 4/i);
  });

  test('High Ridge keeps the next stretch calmer than the Reed Cut', async ({ page }) => {
    await startFreshCharacter(page, 'RidgeQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await enterOldRoadFromDeparture(page);
    await page.locator('#routeRidge').click();
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure falls by 8/i);
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head')).toContainText(/arrive at Ridgeway Cairn/i);
    await expect(page.locator('.exp100-head')).toContainText(/High Ridge pays off/i);
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure rises by only 4/i);
    await expect(page.locator('#poiInspect')).toHaveCount(0);
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/Ridgeway Cairn/i);
    await page.locator('#poiInspect').click();
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure falls by 3/i);
  });


  test('first secured expedition records its route and advances the Bell quest through Blackroot Bend', async ({ page }) => {
    await startFreshCharacter(page, 'StoryRidgeQA');
    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await enterOldRoadFromDeparture(page);
    await page.locator('#routeRidge').click();
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      const state = pl.flags.roadExpeditionV100;
      state.stage = 5;
      state.routeChoice = 'ridge';
      state.poiUsed = { 'ridge-cairn': true };
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderExpedition();
    });
    await page.locator('#finish').click();
    await expect(page.locator('.exp100-outcome')).toContainText(/Ridgeway Cairn/i);
    await page.locator('#outcomeReturn').click();

    let firstReturn = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        seen: pl.flags.firstRoadReturnSeen,
        route: pl.flags.firstRoadReturnRoute,
        discovery: pl.flags.firstRoadReturnDiscovery,
        objective: pl.questLog.find(item => item.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(firstReturn.seen).toBe(true);
    expect(firstReturn.route).toBe('ridge');
    expect(firstReturn.discovery).toBe('ridge-cairn');
    expect(firstReturn.objective).toMatch(/Ridgeway Cairn/i);

    await page.evaluate(() => window.LegendAshmereV099.route('mara'));
    await expect(page.locator('.ash099-lines')).toContainText(/Ridgeway Cairn marks a dry line/i);
    let afterMara = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        briefed: pl.flags.firstRoadReturnMaraBriefed,
        objective: pl.questLog.find(item => item.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(afterMara.briefed).toBe(true);
    expect(afterMara.objective).toMatch(/Blackroot Bend/i);

    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await enterOldRoadFromDeparture(page);
    // The transition shows the local raster title mark and destination label before
    // handing control to the road screen; then it releases the UI.
    const curtain = page.locator('#legend-scene-curtain');
    // Covering is a brief animation phase, so assert the transition payload and its settled state rather than racing that transient class.
    await expect(curtain).toBeAttached();
    await expect(curtain.locator('.legend-transition-wordmark')).toHaveAttribute('src', /logo_legend_awakening_wordmark\.png(?:\?.*)?$/);
    await expect(curtain.locator('.legend-transition-wordmark-fallback')).toContainText('LEGEND');
    await expect(curtain.locator('.legend-transition-location')).toHaveText('LEAVING ASHMERE FOR THE OLD ROAD');
    await expect.poll(() => curtain.evaluate(el =>
      !el.classList.contains('is-covering') && !el.classList.contains('is-revealing')
    )).toBe(true);
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      const state = pl.flags.roadExpeditionV100;
      state.stage = 3;
      state.routeChoice = 'ridge';
      state.poiUsed = {};
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderExpedition();
    });
    const stageThreeScene = page.locator('.exp100-scene-live[data-stage="3"]');
    await expect(stageThreeScene).toHaveCount(1);
    await expect(stageThreeScene).toBeVisible();
    const savedStageBeforeClue = await page.evaluate(() =>
      window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100.stage
    );
    expect(savedStageBeforeClue).toBe(3);
    await stageThreeScene.locator('.exp100-hotspot-find').click();
    const blackrootClue = page.locator('.exp100-discovery-beat');
    await expect(blackrootClue).toContainText(/Roots Around an Old Seal/i);
    const clueState = await page.evaluate(() => ({
      stage: window.LegendRuntimeV120.loadPlayer().flags.roadExpeditionV100.stage,
      sceneStage: document.querySelector('.exp100-scene-live')?.dataset.stage,
      title: document.querySelector('.exp100-discovery-beat strong')?.textContent
    }));
    expect(clueState.stage).toBe(3);
    expect(clueState.sceneStage).toBe('3');
    expect(clueState.title).toBe('Roots Around an Old Seal');
    await page.locator('#poiInspect').click();

    let sealReport = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        searched: pl.flags.bellRoadSearched,
        memory: pl.memories.some(item => /Blackroot Bend.*bell-mark/i.test(item)),
        objective: pl.questLog.find(item => item.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(sealReport.searched).toBe(true);
    expect(sealReport.memory).toBe(true);
    expect(sealReport.objective).toMatch(/Return to Mara/i);

    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      pl.flags.roadExpeditionV100.stage = 5;
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderExpedition();
    });
    await page.locator('#finish').click();
    await page.locator('#outcomeReturn').click();
    await page.evaluate(() => window.LegendAshmereV099.route('mara'));
    await expect(page.locator('.ash099-lines')).toContainText(/Blackroot seal bears the same bell-mark/i);
    const nextObjective = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().questLog.find(item => item.startsWith('The Bell That Rang Once:')));
    expect(nextObjective).toMatch(/Greyfen.*boundary marks/i);
  });

  test('first Reed Cut return preserves its own clue and directs the player to Mara', async ({ page }) => {
    await startFreshCharacter(page, 'StoryReedQA');
    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await enterOldRoadFromDeparture(page);
    await page.locator('#routeReeds').click();
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const pl = rt.loadPlayer();
      const state = pl.flags.roadExpeditionV100;
      state.stage = 5;
      state.routeChoice = 'reeds';
      state.poiUsed = { 'marsh-watcher-tracks': true };
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderExpedition();
    });
    await page.locator('#finish').click();
    await expect(page.locator('.exp100-outcome')).toContainText(/tracks beneath the blue light/i);
    await page.locator('#outcomeReturn').click();
    await page.evaluate(() => window.LegendAshmereV099.route('mara'));
    await expect(page.locator('.ash099-lines')).toContainText(/Bell Fragment is physical evidence/i);
    const result = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        route: pl.flags.firstRoadReturnRoute,
        discovery: pl.flags.firstRoadReturnDiscovery,
        objective: pl.questLog.find(item => item.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(result.route).toBe('reeds');
    expect(result.discovery).toBe('marsh-watcher-tracks');
    expect(result.objective).toMatch(/Blackroot Bend/i);
  });

  test('The Moved Cairn offers three decisions, can be reported, and changes future route clues', async ({ page }) => {
    await startFreshCharacter(page, 'MovedCairnQA');
    await page.evaluate(() => window.LegendAshmereV099.route('quests'));
    await expect(page.locator('.ash099-contract-card')).toHaveCount(4);
    await page.locator('[data-contract-accept="movedCairn"]').click();

    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await enterOldRoadFromDeparture(page);
    await page.locator('#routeRidge').click();
    await page.locator('#push').click();
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/One stone sits outside a weathered groove/i);
    await page.locator('#poiInspect').click();
    await expect(page.locator('.exp100-moved-cairn')).toContainText(/Restore the older alignment/i);
    await expect(page.locator('.exp100-moved-cairn')).toContainText(/Record both positions/i);
    await expect(page.locator('.exp100-moved-cairn')).toContainText(/Mark the hazard and step back/i);
    await page.locator('[data-moved-cairn="record"]').click();
    await expect(page.locator('.exp100-head')).toContainText(/You sketch the stone as it stands/i);

    const choice = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        decision: pl.flags.sideContracts.movedCairn.decision,
        memory: pl.memories.some(m => /recorded both the shifted stone/i.test(m))
      };
    });
    expect(choice.decision).toBe('record');
    expect(choice.memory).toBe(true);

    await page.evaluate(() => window.LegendAshmereV099.route('quests'));
    await expect(page.locator('[data-contract-turnin="movedCairn"]')).toBeVisible();
    await page.locator('[data-contract-turnin="movedCairn"]').click();
    await expect(page.locator('.ash099-contract-completed')).toContainText(/Recorded in Journal/i);
    const turnedIn = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        outcome: pl.flags.highRidgeCairnOutcome,
        complete: pl.flags.sideContracts.movedCairn.complete,
        herbs: Number(pl.inventory.roadHerb || 0)
      };
    });
    expect(turnedIn.outcome).toBe('record');
    expect(turnedIn.complete).toBe(true);
    expect(turnedIn.herbs).toBeGreaterThanOrEqual(1);

    await page.reload();

    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.v120-title')).toBeVisible();
    const persisted = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        outcome: pl.flags.highRidgeCairnOutcome,
        complete: pl.flags.sideContracts.movedCairn.complete,
        memory: pl.memories.some(m => /recorded both the shifted stone/i.test(m))
      };
    });
    expect(persisted.outcome).toBe('record');
    expect(persisted.complete).toBe(true);
    expect(persisted.memory).toBe(true);

    await page.evaluate(() => window.LegendAshmereV099.route('oric'));
    await expect(page.locator('.ash099-lines')).toContainText(/You recorded both alignments/i);

    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await enterOldRoadFromDeparture(page);
    await page.locator('#routeRidge').click();
    await page.locator('#push').click();
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/Chalk marks preserve both positions/i);
    await expect(page.locator('.exp100-moved-cairn')).toHaveCount(0);
  });

  test('Blackroot evidence advances through the Greyfen boundary stone and Mara’s archive', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenEvidenceQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.flags.firstRoadReturnSeen=true;
      pl.flags.firstRoadReturnMaraBriefed=true;
      pl.flags.bellRoadSearched=true;
      pl.flags.roadExpeditionV100=pl.flags.roadExpeditionV100||{stage:5,pressure:0,trips:0,events:0,finds:0,battles:0};
      Object.assign(pl.flags.roadExpeditionV100,{stage:5,routeChoice:'ridge',poiUsed:{}});
      pl.questLog=['The Bell That Rang Once: Compare the Blackroot seal record with Greyfen’s boundary marks when the lowland archive is available.'];
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderExpedition();
    });
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/same bell-mark from Blackroot/i);
    await page.locator('#poiInspect').click();
    const fieldEvidence=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        compared:pl.flags.greyfenBoundaryCompared,
        memory:pl.memories.some(m=>/Greyfen Approach.*bell-mark.*Blackroot Bend/i.test(m)),
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(fieldEvidence.compared).toBe(true);
    expect(fieldEvidence.memory).toBe(true);
    expect(fieldEvidence.objective).toMatch(/Greyfen.*Boundary Archive/i);

    await page.evaluate(() => window.LegendAshmereV099.route('mara'));
    const ashmereObjective = await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().questLog.find(q=>q.startsWith('The Bell That Rang Once:')));
    expect(ashmereObjective).toMatch(/Greyfen.*Boundary Archive/i);

    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      rt.savePlayer(pl);
      window.LegendAshmereV099.route('mara');
    });
    await expect(page.locator('.ash099-lines')).toContainText(/Blackroot mark appears beneath the newer cut/i);
    const archiveRecord=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        read:pl.flags.greyfenArchiveRead,
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:')),
        memory:pl.memories.some(m=>/Mara compared the Blackroot seal record with the Greyfen boundary stone/i.test(m))
      };
    });
    expect(archiveRecord.read).toBe(true);
    expect(archiveRecord.objective).toMatch(/dated record or physical sign/i);
    expect(archiveRecord.memory).toBe(true);
  });

  test('Greyfen archive lead reveals a dated Reedwatch note and Brenn advances the ledger investigation', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenFieldNoteQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.flags.greyfenArchiveRead=true;
      pl.flags.roadExpeditionV100=pl.flags.roadExpeditionV100||{stage:4,pressure:0,trips:0,events:0,finds:0,battles:0};
      Object.assign(pl.flags.roadExpeditionV100,{stage:4,routeChoice:'ridge',poiUsed:{}});
      pl.questLog=['The Bell That Rang Once: Find a dated record or physical sign showing when the newer Greyfen cut was made.'];
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderExpedition();
    });
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/dated field note/i);
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/two days after Greyfen logged the flood/i);
    await page.locator('#poiInspect').click();
    const fieldNote=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        found:pl.flags.greyfenFieldNoteFound,
        memory:pl.memories.some(m=>/Reedwatch Shelter.*field note dated two days/i.test(m)),
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(fieldNote.found).toBe(true);
    expect(fieldNote.memory).toBe(true);
    expect(fieldNote.objective).toMatch(/Bring the dated Reedwatch field note/i);

    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      rt.savePlayer(pl);
      window.LegendAshmereV099.route('mara');
    });
    await expect(page.locator('.ash099-lines')).toContainText(/field note is dated two days after Greyfen logged the flood/i);
    const maraReport=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        reported:pl.flags.greyfenFieldNoteReported,
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(maraReport.reported).toBe(true);
    expect(maraReport.objective).toMatch(/Ask Old Brenn to compare the dated field note/i);

    await page.evaluate(() => window.LegendAshmereV099.route('brenn'));
    await expect(page.locator('.ash099-lines')).toContainText(/destinations were overwritten in a later hand/i);
    const brennReport=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        compared:pl.flags.greyfenLedgerCompared,
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(brennReport.compared).toBe(true);
    expect(brennReport.objective).toMatch(/earlier weekly route return/i);
  });

  test('Earlier weekly route return completes the Greyfen evidence filing and leaves a clear next lead', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenWeeklyReturnQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.flags.greyfenLedgerCompared=true;
      pl.flags.roadExpeditionV100=pl.flags.roadExpeditionV100||{stage:2,pressure:0,trips:0,events:0,finds:0,battles:0};
      Object.assign(pl.flags.roadExpeditionV100,{stage:2,routeChoice:'ridge',poiUsed:{}});
      pl.questLog=['The Bell That Rang Once: Find the earlier weekly route return that accompanied the overwritten Greyfen ledger.'];
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderExpedition();
    });
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/Earlier Weekly Return/i);
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/CLOSED pending inspection/i);
    await page.locator('#poiInspect').click();
    const recovered=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        found:pl.flags.greyfenWeeklyReturnFound,
        memory:pl.memories.some(m=>/earlier weekly route return.*CLOSED pending inspection/i.test(m)),
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(recovered.found).toBe(true);
    expect(recovered.memory).toBe(true);
    expect(recovered.objective).toMatch(/Bring the earlier weekly route return/i);

    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.currentRegion='Greyfen';
      pl.discoveredRegions=['Ashmere','Greyfen'];
      rt.savePlayer(pl);
      window.LegendAshmereV099.route('brenn');
    });
    await expect(page.locator('.ash099-lines')).toContainText(/lower crossing is clearly marked CLOSED pending inspection/i);
    const brenn=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        reported:pl.flags.greyfenWeeklyReturnReported,
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(brenn.reported).toBe(true);
    expect(brenn.objective).toMatch(/Ask Mara to preserve the field note/i);

    await page.evaluate(() => window.LegendAshmereV099.route('mara'));
    await expect(page.locator('.ash099-lines')).toContainText(/field note, the crossing ledger, and the earlier weekly return are now preserved together/i);
    const filed=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        evidenceFiled:pl.flags.greyfenEvidenceFiled,
        memory:pl.memories.some(m=>/Mara filed the Blackroot seal.*weekly route return/i.test(m)),
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(filed.evidenceFiled).toBe(true);
    expect(filed.memory).toBe(true);
    expect(filed.objective).toMatch(/Find the missing closure order/i);

    await page.reload();

    await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
    const persisted=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {
        weeklyReturnFound:pl.flags.greyfenWeeklyReturnFound,
        evidenceFiled:pl.flags.greyfenEvidenceFiled,
        objective:pl.questLog.find(q=>q.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(persisted.weeklyReturnFound).toBe(true);
    expect(persisted.evidenceFiled).toBe(true);
    expect(persisted.objective).toMatch(/Find the missing closure order/i);
  });

  test('Wisp Lantern Wick uses a Bell Fragment and reduces opening Road Pressure once', async ({ page }) => {
    await startFreshCharacter(page, 'LanternWickQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120;
      const pl=rt.loadPlayer();
      pl.inventory=pl.inventory||{};
      pl.inventory.bellFragment=1;
      pl.inventory.oil=1;
      pl.flags=pl.flags||{};
      pl.flags.roadExpeditionV100=pl.flags.roadExpeditionV100||{stage:0,pressure:0,trips:0,events:0,finds:0,battles:0};
      pl.flags.roadExpeditionV100.pressure=0;
      rt.savePlayer(pl);
    });
    await page.evaluate(() => window.LegendAshmereV099.route('craft'));
    const wickRecipe=page.locator('[data-craft="wispLanternWick"]');
    await expect(wickRecipe).toBeEnabled();
    await expect(wickRecipe).toContainText(/1 Bell Fragment/i);
    await wickRecipe.click();
    let inventory=await page.evaluate(() => window.LegendRuntimeV120.loadPlayer().inventory);
    expect(inventory.bellFragment).toBe(0);
    expect(inventory.oil).toBe(0);
    expect(inventory.wispLanternWick).toBe(1);
    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await expect(page.getByRole('button', { name: /The Old Road/i })).toBeVisible();
    await enterOldRoadFromDeparture(page);
    await expect(page.locator('.exp100-head')).toBeVisible();
    await expect(page.locator('.exp100-head')).toContainText(/opening Road Pressure rises by only 3 instead of 8/i);
    const after=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {pressure:pl.flags.roadExpeditionV100.pressure,wick:Number(pl.inventory.wispLanternWick||0)};
    });
    expect(after.pressure).toBe(3);
    expect(after.wick).toBe(0);
    await expect(page.locator('.exp100-head')).toContainText(/opening Road Pressure rises by only 3 instead of 8/i);
  });

  test('road discovery stays hidden until the player notices it', async ({ page }) => {
    await startFreshCharacter(page, 'DiscoveryQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await enterOldRoadFromDeparture(page);
    await expect(page.locator('#poiInspect')).toHaveCount(0);
    await expect(page.locator('.exp100-hotspot-find')).toContainText('Look closer');
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toBeVisible();
    await page.locator('#poiLeave').click();
    await expect(page.locator('.exp100-discovery-beat')).toHaveCount(0);
    await expect(page.locator('#poiInspect')).toHaveCount(0);
  });

  test('route choice changes the later waystation scene text', async ({ page }) => {
    await startFreshCharacter(page, 'RouteEchoQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await enterOldRoadFromDeparture(page);
    await page.locator('#routeReeds').click();
    await page.locator('#push').click();
    await page.locator('.exp100-hotspot-find').click();
    await page.locator('#poiInspect').click();
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head')).toContainText(/wet reeds cling to your boots/i);
    await expect(page.locator('.exp100-head')).toContainText(/something followed you out/i);
  });

  test('Ashmere hub destinations use the dedicated local service icon artwork', async ({ page }) => {
    await startFreshCharacter(page, 'IconArtQA');
    const destinationIcons = page.locator('.ash100-destinations .ash100-destination-icon');
    await expect(destinationIcons).toHaveCount(7);
    const iconImages = page.locator('.ash100-destinations .ash100-destination-icon .ash099-asset-icon img');
    await expect(iconImages).toHaveCount(7);
    const iconSources = await iconImages.evaluateAll(nodes => nodes.map(node => node.getAttribute('src') || ''));
    expect(iconSources.every(src => src.startsWith('assets/generated/ui/icons/service-'))).toBe(true);
    await expect(page.locator('.ash100-destinations .ash100-destination-icon .ash099-icon svg')).toHaveCount(0);
    await expect(page.locator('.ash100-destinations .ash100-destination-icon .ash099-region-shop-icon img')).toHaveCount(0);
    const iconBounds = await iconImages.evaluateAll(nodes => nodes.map(img => {
      const icon = img.closest('.ash100-destination-icon');
      const a = icon.getBoundingClientRect();
      const b = img.getBoundingClientRect();
      return { within: b.width <= a.width + 1 && b.height <= a.height + 1, iconWidth: a.width, imageWidth: b.width };
    }));
    expect(iconBounds.every(item => item.within)).toBe(true);
    const navImmediatelyAfterHero = await page.locator('.ash100-hero').evaluate(hero => hero.nextElementSibling?.classList.contains('ash099-topnav'));
    expect(navImmediatelyAfterHero).toBe(true);
  });

  test('traveler creation shapes a soul with an unnamed presence and raster LEGEND wordmark', async ({ page }) => {
    await openTitle(page);
    await page.locator('#newPrimary').click();
    await expect(page.locator('.v140-creation')).toBeVisible();
    await expect(page.locator('.v140-creation-brand .v150-logo-lockup')).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
    await expect(page.locator('.v140-creation-brand img')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
    await expect(page.locator('.v140-dialogue-speaker strong')).toHaveText('???');
    await expect(page.locator('.v140-presence-mark')).toHaveAttribute('src', /skills\/icons\/veil\.webp/);
    await expect(page.locator('.v140-presence-glyph')).toHaveText('???');
    await expect(page.locator('.v140-dialogue-box')).toContainText(/memory|name|soul/i);
    await page.locator('#v094Name').fill('SoulMemoryQA');
    await page.locator('#v094Next').click();
    await expect(page.locator('.v140-dialogue-speaker strong')).toHaveText('???');
    await expect(page.locator('.v140-dialogue-box')).toContainText(/outline|shape/i);
    await expect(page.locator('.v094-choice-grid')).toBeVisible();
    await expect(page.locator('.v140-presence-frame')).toBeVisible();
    await expect(page.locator('.v140-guide-portrait')).toHaveCount(0);

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

    await expect(page.getByRole('heading', { name: 'SoulMemoryQA', exact: true })).toBeVisible();
    await expect(page.locator('.v140-dialogue-speaker strong')).toHaveText('???');
    await expect(page.locator('.v140-dialogue-box')).toContainText(/name|shape|feeling/i);
    await expect(page.getByRole('button', { name: /Let Me Wake/i })).toBeVisible();
    await expect(page.locator('.v140-creation')).not.toContainText(/Captain Oric|the Veil/i);
  });

  test('Oric finds the traveler beneath the dead lantern and the voice teaches ACT', async ({ page }) => {
    await startFreshCharacter(page, 'OricOpeningQA', { stopAtIntro: true });
    await expect(page.getByRole('heading', { name: 'Beneath the Dead Lantern' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Your answer to Captain Oric' })).toBeVisible();
    await expect(page.locator('.ash100-town')).toHaveCount(0);
    await page.locator('[data-oric-response="honest"]').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Blackroot Wolf');
    await expect(page.locator('#skill')).toContainText('Awaken');
    await expect(page.locator('#strike')).toBeDisabled();
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
  });

  test('the opening can be skipped to Ashmere after the required ACT awakening', async ({ page }) => {
    await startFreshCharacter(page, 'SkipOpeningQA', { stopAtIntro: true });
    await page.locator('[data-oric-response="peaceful"]').click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await page.getByRole('button', { name: 'Go straight to Ashmere' }).click();
    await expect(page.locator('.ash100-town')).toBeVisible();
  });

  test('Trading Post uses Buy and Sell tabs with illustrated goods', async ({ page }) => {
    await startFreshCharacter(page, 'MarketUXQA');
    await page.locator('[data-ash-view="trader"]').click();
    await expect(page.locator('.ash099-market-console')).toBeVisible();
    await expect(page.locator('.ash099-market-item').first()).toBeVisible();
    await expect(page.locator('.ash099-market-item img').first()).toBeVisible();
    await page.locator('[data-market-tab="sell"]').click();
    await expect(page.locator('[data-market-tab="sell"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.ash099-empty-state')).toBeVisible();
    await page.locator('[data-market-tab="buy"]').click();
    await expect(page.locator('[data-market-tab="buy"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('Workshop exposes the crafting bench directly from the Forge', async ({ page }) => {
    await startFreshCharacter(page, 'CraftingEntryQA');
    await page.locator('[data-ash-view="smith"]').click();
    await expect(page.locator('.ash099-forge-tabs [data-forge-tab="craft"]')).toBeVisible();
    await page.locator('.ash099-forge-tabs [data-forge-tab="craft"]').click();
    await expect(page.getByRole('heading', { name: 'Crafting Bench' })).toBeVisible();
    await expect(page.locator('[data-craft="wispLanternWick"]')).toBeVisible();
  });

  test('Secured expedition settles gold, XP, level-up, token, and return state', async ({ page }) => {
    await startFreshCharacter(page, 'ReturnFromRoadQA');
    const before = await page.evaluate(() => {
      const rt = window.LegendRuntimeV120;
      const player = rt.loadPlayer();
      player.xp = 80;
      player.stats = player.stats || {};
      player.flags = player.flags || {};
      player.flags.roadExpeditionV100 = {
        stage: 5,
        pressure: 20,
        trips: 1,
        events: 0,
        finds: 0,
        battles: 0,
        routeChoice: 'ridge',
        poiUsed: { 'ridge-cairn': true },
        searchUsed: {},
        readUsed: {}
      };
      rt.savePlayer(player);
      window.LegendRoadControllerV100.renderHub();
      return {
        gold: Number(player.gold || 0),
        xp: Number(player.xp || 0),
        level: Number(player.level || 1),
        hp: Number(player.hp || 0),
        maxHp: Number(player.maxHp || 0),
        tokens: Number(player.inventory?.roadToken || 0),
        clears: Number(player.stats.oldRoadClears || 0)
      };
    });

    await page.locator('#finish').click();
    await expect(page.locator('#outcomeReturn')).toBeVisible();
    await expect(page.locator('.exp100-outcome')).toContainText('Expedition Secured');
    await expect(page.locator('.exp100-outcome')).toContainText(/Road Token/i);
    await expect(page.locator('.exp100-outcome')).toContainText(/Level up! You are now level 2\./);

    const after = await page.evaluate(() => {
      const player = window.LegendRuntimeV120.loadPlayer();
      const state = player.flags.roadExpeditionV100;
      return {
        gold: Number(player.gold || 0),
        xp: Number(player.xp || 0),
        level: Number(player.level || 1),
        hp: Number(player.hp || 0),
        maxHp: Number(player.maxHp || 0),
        tokens: Number(player.inventory?.roadToken || 0),
        clears: Number(player.stats?.oldRoadClears || 0),
        stage: Number(state.stage),
        pressure: Number(state.pressure),
        firstReturnSeen: Boolean(player.flags.firstRoadReturnSeen),
        firstReturnRoute: player.flags.firstRoadReturnRoute,
        firstReturnDiscovery: player.flags.firstRoadReturnDiscovery
      };
    });

    expect(before.xp).toBe(80);
    expect(after.gold).toBe(before.gold + 140);
    expect(after.xp).toBe(45);
    expect(after.level).toBe(2);
    expect(after.hp).toBe(before.hp + 8);
    expect(after.maxHp).toBe(before.maxHp + 8);
    expect(after.tokens).toBe(before.tokens + 1);
    expect(after.clears).toBe(before.clears + 1);
    expect(after.stage).toBe(0);
    expect(after.pressure).toBe(7);
    expect(after.firstReturnSeen).toBe(true);
    expect(after.firstReturnRoute).toBe('ridge');
    expect(after.firstReturnDiscovery).toBe('ridge-cairn');

    await page.locator('#outcomeReturn').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
  });

  test('Blacksmith puts the equipped kit first and separates weapons from armor', async ({ page }) => {
    await startFreshCharacter(page, 'ForgeUXQA');
    await page.locator('[data-ash-view="smith"]').click();
    await expect(page.locator('.ash099-forge-loadout')).toBeVisible();
    await expect(page.locator('.ash099-forge-traveler')).toBeVisible();
    await expect(page.locator('.ash099-forge-grid')).toContainText(/Wooden Sword|Stone Sword/i);
    await page.locator('[data-forge-tab="armor"]').click();
    await expect(page.locator('[data-forge-tab="armor"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.ash099-forge-grid')).toContainText(/Cloth Armor|Chain Armor/i);
  });

  test('Traveler profile shows the class portrait, loadout, and pack instead of raw stats tiles', async ({ page }) => {
    await startFreshCharacter(page, 'TravelerUXQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: 'Traveler' }).click();
    await expect(page.locator('.ash099-traveler-profile')).toBeVisible();
    await expect(page.locator('.ash099-traveler-profile-portrait')).toBeVisible();
    await expect(page.locator('.ash099-profile-equipment-grid')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your Pack' })).toBeVisible();
    await expect(page.locator('.ash099-stats')).toHaveCount(0);
  });

  test('mobile town has no horizontal overflow and navigation remains tappable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startFreshCharacter(page, 'MobileQA');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBe(false);
    const navOrder = await page.evaluate(() => {
      const nav = document.querySelector('.ash099-topnav');
      const destinations = document.querySelector('.ash100-destinations');
      return !!nav && !!destinations && !!(nav.compareDocumentPosition(destinations) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(navOrder).toBe(true);
    const routes = page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i });
    const box = await routes.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeGreaterThanOrEqual(40);
  });

  test('cinematic title layer and road transition controller load', async ({ page }) => {
    await openTitle(page);
    await expect.poll(() => page.evaluate(() => Boolean(window.__legendSceneTransitionsV120))).toBe(true);
    await expect.poll(() => page.evaluate(() => Array.from(document.styleSheets).some(s => (s.href || '').includes('title-cinematic-v120.css')))).toBe(true);
    const title = page.locator('.title-v100 .v120-title-hero');
    await expect(title).toBeVisible();
    await expect(title.locator('h1')).toHaveText('LEGEND: The Awakening');
  });

});


test('Credits dialog opens accessibly and closes with Escape', async ({ page }) => {
  await openTitle(page);
  const titleLayout = await page.evaluate(() => {
    const root = document.querySelector('.title-v136-rpg');
    const footer = root?.querySelector('.portal100-footer');
    const credits = root?.querySelector('#credits');
    if (!root || !footer || !credits) return null;
    return {
      documentHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      footerTop: footer.getBoundingClientRect().top,
      creditsBottom: credits.getBoundingClientRect().bottom
    };
  });
  expect(titleLayout).not.toBeNull();
  expect(titleLayout.documentHeight).toBeLessThanOrEqual(titleLayout.viewportHeight + 1);
  expect(titleLayout.footerTop).toBeGreaterThan(titleLayout.creditsBottom);
  await page.getByRole('button', { name: 'Credits' }).click();
  const dialog = page.getByRole('dialog', { name: 'LEGEND' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('A WORLD IN THE MAKING');
  await expect(dialog.getByRole('button', { name: 'Return to the Title' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Credits' })).toBeFocused();
});
