const { test, expect } = require('@playwright/test');

function cssBackgroundAlphas(value) {
  return Array.from(String(value || '').matchAll(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/g), match => Number(match[1]));
}

function expectBackgroundAlphaAtMost(value, maximum) {
  const alphas = cssBackgroundAlphas(value);
  expect(alphas.length, 'expected an rgba background layer in: ' + value).toBeGreaterThan(0);
  expect(Math.max(...alphas)).toBeLessThanOrEqual(maximum);
}
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
    // Keep the regular gameplay smoke suite focused on screen behavior. The
    // first-visit production awakening is covered by its own dedicated test.
    sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready');
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
  if (options.previousRoadExperience) {
    await page.evaluate(() => {
      window.LegendStorage.savePlayer({
        version: window.LEGEND_DATA.VERSION,
        username: 'PreviousRoadVeteran',
        town: 'Ashmere',
        currentRegion: 'Ashmere',
        level: 4,
        hp: 80,
        maxHp: 80,
        gold: 40,
        inventory: {},
        stats: { roadVictories: 2, oldRoadClears: 1 },
        flags: { firstRoadReturnSeen: true, introV094Complete: true }
      });
    });
  }
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
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
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
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


async function clearRoadBattle(page) {
  const battle=page.locator('.rpg-battle');
  if (await battle.count()) {
    await page.evaluate(() => {
      const player=window.LegendRuntimeV120.loadPlayer();
      player.attributesV152=player.attributesV152||{};
      player.attributesV152.might=250;
      player.maxHp=Math.max(999,Number(player.maxHp||0));
      player.hp=player.maxHp;
      window.LegendRuntimeV120.savePlayer(player);
    });
    if (await battle.count()) await page.locator('#strike').click();
    if (await page.locator('.v152-combat-results').count()) await page.locator('#v152CombatContinue').click();
  }
  await expect(battle).toHaveCount(0);
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

async function allocatePendingGrowth(page) {
  const overlay = page.locator('#legendLevelUpOverlay');
  if (!(await overlay.count())) return;
  const progressText = await overlay.locator('#v152-growth-total').textContent() || '0';
  const points = Number(progressText.split('/').pop().trim());
  for (let i = 0; i < points; i += 1) {
    await overlay.locator('[data-attr-add="might"]').click();
  }
  await overlay.locator('#v152-growth-confirm').click();
  await expect(overlay).toHaveCount(0);
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

  test('title background and raster wordmark render without circular title decorations or SVG logo artwork', async ({ page }) => {
    await openTitle(page);
    const atlasResponse = await page.request.get('/assets/generated/ui/icons/legend-runway-icon-atlas.webp');
    expect(atlasResponse.ok()).toBe(true);
    expect(atlasResponse.headers()['content-type']).toContain('image/webp');
    const backdrop = page.locator('.v120-title-backdrop');
    await expect(backdrop).toHaveAttribute('src', /title-ashmere-road\.webp/);
    await expect.poll(() => backdrop.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const logo = page.locator('.v150-logo-lockup');
    await expect(page.locator('.v136-corner-sigil')).toHaveCount(0);
    await expect(page.locator('.title-v136-rpg .v150-logo-lockup')).toBeVisible();
    const ringStyles = await page.locator('.title-v136-rpg .v150-logo-lockup').evaluate(node =>
      ['::before', '::after'].map(pseudo => {
        const style = getComputedStyle(node, pseudo);
        return { display: style.display, content: style.content };
      })
    );
    expect(ringStyles.every(style => style.display === 'none' || style.content === 'none')).toBe(true);
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('aria-label', 'LEGEND: The Awakening');
    await expect(page.locator('.v120-legend-logo')).toHaveAttribute('src', /\.png(?:\?.*)?$/);
    await expect(logo).not.toContainText(/Roads of Ashmere/i);
    await expect(page.locator('.v136-corner-sigil img')).toHaveCount(0);
    const menuIcons = await page.locator('.title-v136-rpg .v136-menu-icon').evaluateAll(nodes => nodes.map(node => ({
      classes: Array.from(node.classList).filter(name => name.startsWith('runway-icon-')),
      width: node.getBoundingClientRect().width,
      height: node.getBoundingClientRect().height,
      overflow: getComputedStyle(node).overflow,
      hasImageChild: Boolean(node.querySelector('img')),
      backgroundImage: getComputedStyle(node).backgroundImage
    })));
    expect(menuIcons.length).toBeGreaterThanOrEqual(5);
    expect(menuIcons.every(icon => icon.classes.length === 1)).toBe(true);
    expect(new Set(menuIcons.map(icon => icon.classes[0])).size).toBe(menuIcons.length);
    expect(menuIcons.every(icon => icon.width === 28 && icon.height === 28 && icon.overflow === 'hidden' && !icon.hasImageChild)).toBe(true);
    expect(menuIcons.every(icon => {
      const name = icon.classes[0].replace('runway-icon-', '');
      return icon.backgroundImage.includes('legend-icon-' + name + '.webp');
    })).toBe(true);
    await expect(page.locator('.title-v136-rpg .title-atmosphere')).toBeHidden();
    const legacyRing = await page.locator('.title-v136-rpg.portal-v100').evaluate(node => {
      const style = getComputedStyle(node, '::before');
      return { display: style.display, content: style.content, boxShadow: style.boxShadow };
    });
    expect(legacyRing.display === 'none' || legacyRing.content === 'none').toBe(true);
    expect(legacyRing.boxShadow === 'none').toBe(true);
    for (const name of ['compass', 'journal', 'traveler', 'inn', 'market', 'forge', 'road', 'settings', 'milestone']) {
      const response = await page.request.get('/assets/generated/ui/icons/legend-icon-' + name + '.webp');
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/webp');
    }
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
    await expect(page.locator('.ash100-destination')).toHaveCount(8);
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
    await expect(page.locator('.ash099-screen h1').filter({ hasText: 'A Dry Crossing' })).toBeVisible();
    await expect(page.locator('[data-crossing-choice="posts"]')).toContainText('35g and 1 Road Herb');
    await expect(page.locator('[data-crossing-choice="reeds"]')).toContainText('65% chance');
    await page.locator('[data-crossing-choice="posts"]').click();
    await expect(page.getByRole('heading', { name: 'The marker is safe' })).toBeVisible();
    const after=await page.evaluate(() => {
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {gold:Number(pl.gold||0),herbs:Number(pl.inventory.roadHerb||0),complete:Boolean(pl.flags.greyfenDryCrossingComplete),memories:pl.memories||[]};
    });
    expect(after.gold).toBe(before.gold+35);
    expect(after.herbs).toBe(before.herbs+1);
    expect(after.complete).toBe(true);
    expect(after.memories).toContain("A rumor among Greyfen’s landing workers says the reed-bed cut was marked as a route only after the floodwater rose. The speaker had no record, and no one named who approved it.");
    await page.locator('#ashBack').click();
    await page.locator('.ash100-destination[data-ash-view="crossing"]').click();
    await expect(page.locator('[data-crossing-choice]')).toHaveCount(0);
    await expect(page.locator('.ash099-screen')).toContainText(/reed-bed cut was marked as a route only after the floodwater rose/i);
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
    await expect(page.locator('.ash099-screen').getByRole('heading', { name: 'A Dry Crossing' })).toBeVisible();
    await page.evaluate(() => { Math.random = () => 0.9; });
    await page.locator('[data-crossing-choice="reeds"]').click();
    await expect(page.locator('.ash099-screen').getByRole('heading', { name: 'The reeds turn you back' })).toBeVisible();

    const miss = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        hp: Number(pl.hp),
        gold: Number(pl.gold),
        herbs: Number(pl.inventory.roadHerb || 0),
        attempts: Number(pl.flags.greyfenCrossingAttempts || 0),
        complete: Boolean(pl.flags.greyfenDryCrossingComplete),
        rumorRecorded: (pl.memories || []).includes("A rumor among Greyfen’s landing workers says the reed-bed cut was marked as a route only after the floodwater rose. The speaker had no record, and no one named who approved it."),
        memories: pl.memories || []
      };
    });
    expect(miss.hp).toBe(before.hp - 5);
    expect(miss.gold).toBe(before.gold);
    expect(miss.herbs).toBe(before.herbs);
    expect(miss.attempts).toBe(1);
    expect(miss.complete).toBe(false);
    expect(miss.rumorRecorded).toBe(false);
    expect(miss.memories.some(memory => /reed bed turned you back from Greyfen/i.test(memory))).toBe(true);
    await expect(page.locator('.ash099-screen')).toContainText('You may try again');

    await page.locator('#ashBack').click();
    await page.locator('.ash100-destination[data-ash-view="crossing"]').click();
    await page.evaluate(() => { Math.random = () => 0.1; });
    await page.locator('[data-crossing-choice="reeds"]').click();
    await expect(page.locator('.ash099-screen').getByRole('heading', { name: 'The shortcut pays off' })).toBeVisible();

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
    expect(success.rumorRecorded).toBe(true);
    await expect(page.locator('.ash099-screen')).toContainText(/reed-bed cut was marked as a route only after the floodwater rose/i);
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
    await expect(page.getByRole('main', { name: 'Battle defeat results' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Driven Back' })).toBeVisible();
    await expect(page.locator('.v152-results-heading p')).toContainText(/Return to Ashmere and regroup/i);

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

    await page.locator('#v152CombatReturn').click();
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
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
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
    await expect(page.locator('#root').getByRole('heading', { name: 'Routes & Expeditions', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /The Old Road/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Road Network/i })).toBeVisible();
    await expect(page.locator('.ash100-town')).toHaveCount(0);
  });

  test('Road Network opens regional map and stays on map', async ({ page }) => {
    await startFreshCharacter(page, 'MapQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.locator('#root').getByRole('button', { name: /Road Network/i }).click();
    await expect(page.locator('#root').getByRole('heading', { name: 'Roads & Regions', exact: true })).toBeVisible();
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
    await expect(page.locator('#root').getByRole('heading', { name: 'Roads & Regions', exact: true })).toBeVisible();
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
    await expect(page.locator('.ash099-screen').getByRole('heading', { name: 'People of Ashmere' })).toBeVisible();
    const oricCard = page.locator('.ash099-npc-card[data-ash-view="oric"] img');
    await expect(oricCard).toBeVisible();
    await expect(oricCard).toHaveAttribute('src', /assets\/generated\/npcs\/captain-oric\.webp$/);
    await expect.poll(() => oricCard.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const portraitLayout = await oricCard.evaluate(img => {
      const style = getComputedStyle(img);
      const cardStyle = getComputedStyle(img.closest('.ash099-npc-card'));
      const rect = img.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        cardBackground: cardStyle.backgroundImage
      };
    });
    expect(portraitLayout.width).toBeLessThanOrEqual(100);
    expect(portraitLayout.height).toBeLessThanOrEqual(140);
    expect(portraitLayout.objectFit).toBe('cover');
    expect(portraitLayout.objectPosition).toContain('18%');
    expectBackgroundAlphaAtMost(portraitLayout.cardBackground, 0.80);
    await page.locator('[data-ash-view="oric"]').click();
    await expect(page.getByRole('heading', { name: 'Captain Oric' })).toBeVisible();
    const oricDialoguePortrait = page.locator('.ash099-head img');
    await expect(oricDialoguePortrait).toHaveAttribute('src', /assets\/generated\/npcs\/captain-oric\.webp$/);
    await expect.poll(() => oricDialoguePortrait.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const dialoguePortraitLayout = await oricDialoguePortrait.evaluate(img => {
      const style = getComputedStyle(img);
      const rect = img.getBoundingClientRect();
      return { width: rect.width, height: rect.height, objectPosition: style.objectPosition };
    });
    expect(dialoguePortraitLayout.width).toBeLessThanOrEqual(160);
    expect(dialoguePortraitLayout.height).toBeLessThanOrEqual(220);
    expect(dialoguePortraitLayout.objectPosition).toContain('16%');
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
    await expect(page.locator('#root').getByRole('heading', { name: 'Work Board', exact: true })).toBeVisible();
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
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
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

  test('Ranger encounter exposes intent and uses a Healing Potion through the live battle UI', async ({ page }) => {
    await startFreshCharacter(page, 'BattleQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV120, pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.hp=40;
      pl.maxHp=100;
      pl.inventory=pl.inventory||{};
      pl.inventory.potion=1;
      pl.flags.roadExpeditionV100={...(pl.flags.roadExpeditionV100||{}),stage:0,pressure:53,trips:0,events:0,finds:0,battles:0};
      const road=window.LegendRoadsV100.oldRoad;
      road.enemies=road.enemies.filter(enemy=>enemy.id==='goblin').map(enemy=>({...enemy,damage:[3,3]}));
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
    await expect(page.locator('#item')).toBeEnabled();
    const beforePotion=await page.evaluate(()=>{
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {hp:pl.hp,potion:pl.inventory.potion};
    });
    expect(beforePotion).toEqual({hp:40,potion:1});
    await page.locator('#item').click();
    await expect(page.locator('.rpg-dialogue')).toContainText(/drink a Healing Potion and recover 30 HP/i);
    await expect(page.locator('.rpg-dialogue')).toContainText(/hits you for \d+ damage/i);
    await expect(page.locator('.rpg-battle-topline strong')).toContainText('TURN 2');
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-attack/);
    const afterPotion=await page.evaluate(()=>{
      const pl=window.LegendRuntimeV120.loadPlayer();
      return {hp:pl.hp,potion:pl.inventory.potion};
    });
    expect(afterPotion.potion).toBe(0);
    expect(afterPotion.hp).toBeGreaterThan(40);
    expect(afterPotion.hp).toBeLessThan(70);
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
    await expect(page.locator('.ash099-contract-card')).toHaveCount(5);
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
    await page.evaluate(() => { const random = Math.random; Math.random = () => 0.1; document.getElementById('routeReeds')?.click(); Math.random = random; });
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
    await allocatePendingGrowth(page);
    await expect.poll(() => page.evaluate(() => Number(window.LegendRuntimeV120.loadPlayer().pendingStatPointsV152 || 0))).toBe(0);
    await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(0);
    await page.locator('#outcomeReturn').click();
    const returnCurtain = page.locator('#legend-scene-curtain');
    await expect(returnCurtain).toBeAttached();
    await expect.poll(() => returnCurtain.evaluate(el =>
      !el.classList.contains('is-covering') && !el.classList.contains('is-revealing')
    )).toBe(true);
    await expect(page.locator('.ash100-town')).toBeVisible();

    let firstReturn = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        seen: pl.flags.firstRoadReturnSeen,
        route: pl.flags.firstRoadReturnRoute,
        discovery: pl.flags.firstRoadReturnDiscovery,
        fragmentFound: pl.flags.firstRoadReturnBellFragmentFound,
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
    await allocatePendingGrowth(page);
    await expect.poll(() => page.evaluate(() => Number(window.LegendRuntimeV120.loadPlayer().pendingStatPointsV152 || 0))).toBe(0);
    await expect(page.locator('#legendLevelUpOverlay')).toHaveCount(0);
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
    await page.evaluate(() => { window.__reedRouteRandom = Math.random; Math.random = () => 0.1; });
    await page.locator('#routeReeds').click();
    await page.evaluate(() => { Math.random = window.__reedRouteRandom; delete window.__reedRouteRandom; });
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
    await expect(page.locator('#finish')).toBeVisible();
    await page.evaluate(() => { window.__reedFinishRandom = Math.random; Math.random = () => 0.1; });
    await page.locator('#finish').click();
    await expect(page.locator('.exp100-outcome')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.exp100-outcome')).toContainText(/tracks beneath the blue light/i);
    await page.evaluate(() => { Math.random = window.__reedFinishRandom; delete window.__reedFinishRandom; });
    await page.locator('#outcomeReturn').click();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect.poll(() => page.locator('#legend-scene-curtain').evaluate(el =>
      !el.classList.contains('is-covering') && getComputedStyle(el).pointerEvents === 'none'
    )).toBe(true);
    await page.evaluate(() => window.LegendAshmereV099.route('mara'));
    await expect(page.locator('.ash099-lines')).toContainText(/Bell Fragment is physical evidence/i);
    const result = await page.evaluate(() => {
      const pl = window.LegendRuntimeV120.loadPlayer();
      return {
        route: pl.flags.firstRoadReturnRoute,
        discovery: pl.flags.firstRoadReturnDiscovery,
        fragmentFound: pl.flags.firstRoadReturnBellFragmentFound,
        objective: pl.questLog.find(item => item.startsWith('The Bell That Rang Once:'))
      };
    });
    expect(result.route).toBe('reeds');
    expect(result.discovery).toBe('marsh-watcher-tracks');
    expect(result.fragmentFound).toBe(true);
    expect(result.objective).toMatch(/Blackroot Bend/i);
  });

  test('The Moved Cairn offers three decisions, can be reported, and changes future route clues', async ({ page }) => {
    await startFreshCharacter(page, 'MovedCairnQA');
    await page.evaluate(() => window.LegendAshmereV099.route('quests'));
    await expect(page.locator('.ash099-contract-card')).toHaveCount(5);
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
    await clearRoadBattle(page);
    await expect(page.locator('.exp100-head')).toContainText(/wet reeds cling to your boots/i);
    await expect(page.locator('.exp100-head')).toContainText(/something followed you out/i);
  });

  test('Ashmere hub destinations use the dedicated local service icon artwork', async ({ page }) => {
    await startFreshCharacter(page, 'IconArtQA');
    const destinationIcons = page.locator('.ash100-destinations .ash100-destination-icon');
    await expect(destinationIcons).toHaveCount(8);
    const iconImages = page.locator('.ash100-destinations .ash100-destination-icon .ash099-asset-icon img');
    await expect(iconImages).toHaveCount(8);
    const iconSources = await iconImages.evaluateAll(nodes => nodes.map(node => node.getAttribute('src') || ''));
    expect(iconSources.every(src => src.startsWith('assets/generated/') && /\.(?:webp|png)(?:\?.*)?$/i.test(src))).toBe(true);
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
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await page.getByRole('button', { name: /Shape the traveler/i }).click();
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
    await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toHaveCount(0);
    await page.getByRole('button', { name: 'Help Oric' }).click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await expect(page.locator('.rpg-battle')).toContainText('Blackroot Wolf');
    await expect(page.locator('#skill')).toContainText('Awaken');
    await expect(page.locator('#strike')).toBeDisabled();
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await expect(page.locator('#openingRoadSkip')).toHaveCount(0);
  });

  test('only a traveler with a prior road victory is offered the Ashmere shortcut', async ({ page }) => {
    await startFreshCharacter(page, 'SkipOpeningQA', { stopAtIntro: true, previousRoadExperience: true });
    await page.locator('[data-oric-response="peaceful"]').click();
    await expect(page.locator('.opening-road-v140-ambush')).toBeVisible();
    await page.getByRole('button', { name: 'Help Oric' }).click();
    await expect(page.locator('.rpg-battle')).toBeVisible();
    await page.locator('#skill').click();
    await expect(page.getByRole('heading', { name: 'Oric saw what you did.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Return to Ashmere (experienced player)' })).toBeVisible();
    await page.getByRole('button', { name: 'Return to Ashmere (experienced player)' }).click();
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
      window.LegendRoadControllerV100.renderExpedition();
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

    await expect(page.locator('#finish')).toBeVisible();
    await page.evaluate(() => {
    const originalRandom = Math.random;
    window.__legendSceneTransitionBypass = true;
    Math.random = () => 0.1;
    try { document.getElementById('finish')?.click(); }
    finally {
      Math.random = originalRandom;
      window.__legendSceneTransitionBypass = false;
    }
  });
    await expect(page.locator('.v152-expedition-summary')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.exp100-outcome')).toContainText('Expedition Secured');
    await expect(page.locator('.exp100-outcome')).toContainText(/Road Token/i);
    await expect(page.locator('.exp100-outcome')).toContainText(/Level up! You are now level 2\./);
    await allocatePendingGrowth(page);
    await expect(page.locator('#outcomeReturn')).toBeVisible({ timeout: 15000 });

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
    expect(after.gold).toBe(before.gold + 80);
    expect(after.xp).toBe(13);
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


test('production root launches the canonical Phaser world without replacing production persistence', async ({ page }) => {
  await openTitle(page);
  await expect(page.locator('#game-container canvas')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.ready)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.environment)).toBe('title');

  const runtime = await page.evaluate(() => ({
    mode: window.LegendPhaserWorldV1?.mode,
    engineVersion: window.LegendPhaserWorldV1?.version,
    engineSaveKey: window.LegendPhaserWorldV1?.saveKey,
    declaredSaveKey: window.LEGEND_DATA?.SAVE_KEY,
    productionAdapter: typeof window.LegendStorage?.loadPlayer === 'function' &&
      typeof window.LegendStorage?.savePlayer === 'function',
    productionRuntime: typeof window.LegendRuntimeV120?.loadPlayer === 'function',
    accountModule: Boolean(window.LegendAccountV09x),
    gameBootstrap: typeof window.LegendGameBootstrap?.continueGame === 'function',
    previewSaveKey: window.__legendRebootSaveKey || null,
    previewSave: localStorage.getItem('legend-reboot-prototype-save-v1')
  }));
  expect(runtime.mode).toBe('production');
  expect(runtime.engineVersion).toBe('phaser-world-v1');
  expect(runtime.engineSaveKey).toBe(runtime.declaredSaveKey);
  expect(runtime.productionAdapter).toBe(true);
  expect(runtime.productionRuntime).toBe(true);
  expect(runtime.accountModule).toBe(true);
  expect(runtime.gameBootstrap).toBe(true);
  expect(runtime.previewSaveKey).toBeNull();
  expect(runtime.previewSave).toBeNull();
});


test('the production Phaser world follows all six Old Road scene stages and the Bell Cellar arena', async ({ page }) => {
  await openTitle(page);
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.ready)).toBe(true);

  const environments = await page.evaluate(() => {
    const root = document.getElementById('root');
    const originalLoadPlayer = window.LegendStorage.loadPlayer;
    root.innerHTML = '<div class="exp100-scene"></div>';
    const readStage = (stage, routeChoice = 'ridge', sideTrip = null) => {
      window.LegendStorage.loadPlayer = () => ({
        flags: { roadExpeditionV100: { stage, routeChoice, activeSideTripV160: sideTrip } },
        currentRegion: 'Ashmere'
      });
      window.LegendPhaserWorldV1.refresh();
      return window.LegendPhaserWorldV1.snapshot().environment;
    };
    const result = {
      southFork: readStage(0),
      highRidge: readStage(1, 'ridge'),
      reedCut: readStage(1, 'reeds'),
      roadsideCamp: readStage(2),
      blackrootBend: readStage(3),
      reedwatchShelter: readStage(4),
      greyfenBoundary: readStage(5),
      windbreak: readStage(1, 'reeds', 'windbreak'),
      sunkenCart: readStage(1, 'ridge', 'sunken-cart')
    };
    root.innerHTML = '<div class="rpg-battle"><div class="rpg-battlefield" data-arena="cellar"></div></div>';
    window.LegendPhaserWorldV1.refresh();
    result.bellCellar = window.LegendPhaserWorldV1.snapshot().environment;
    window.LegendStorage.loadPlayer = originalLoadPlayer;
    return result;
  });

  expect(environments).toEqual({
    southFork: 'road',
    highRidge: 'ridge',
    reedCut: 'reeds',
    roadsideCamp: 'camp',
    blackrootBend: 'blackroot',
    reedwatchShelter: 'marsh',
    greyfenBoundary: 'greyfen',
    windbreak: 'ridge',
    sunkenCart: 'reeds',
    bellCellar: 'cellar'
  });
});


test('Ashmere uses native Phaser landmarks that route into the real town services', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await startFreshCharacter(page, 'PhaserAshmereQA');
  await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.surface)).toBe('town');

  const landmarks = await page.evaluate(() => {
    const snapshot = window.LegendPhaserWorldV1?.snapshot?.();
    return {
      environment: snapshot?.environment,
      surface: snapshot?.surface,
      landmarks: snapshot?.ashmereLandmarks || [],
      landmarkIconsLoaded: snapshot?.landmarkIconsLoaded,
      pointLightCount: snapshot?.pointLightCount ?? 0,
      rendererType: snapshot?.rendererType ?? null,
      productionStorage: typeof window.LegendStorage?.loadPlayer === 'function' &&
        typeof window.LegendStorage?.savePlayer === 'function'
    };
  });
  expect(landmarks.environment).toBe('ashmere');
  expect(landmarks.surface).toBe('town');
  expect(landmarks.landmarks.map(item => item.id)).toEqual(['inn', 'market', 'forge', 'road']);
  expect(landmarks.landmarks.map(item => item.iconKey)).toEqual([
    'serviceInnIcon', 'serviceMarketIcon', 'serviceForgeIcon', 'serviceRoadIcon'
  ]);
  expect(landmarks.landmarkIconsLoaded).toBe(true);
  // PointLights are WebGL-only; Canvas uses the retained native halo fallback.
  expect(landmarks.pointLightCount).toBeGreaterThanOrEqual(0);
  expect(landmarks.pointLightCount).toBeLessThanOrEqual(4);
  expect(landmarks.productionStorage).toBe(true);

  // A map-space pointer-up hits the Phaser landmark's screen-space bounds.
  // The engine selects the matching production POI; the existing shell action
  // then enters the real market controller and its real buy/sell state.
  const market = landmarks.landmarks.find(item => item.id === 'market');
  expect(market).toBeTruthy();
  await page.evaluate(({ x, y }) => {
    document.dispatchEvent(new PointerEvent('pointerup', {
      bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y
    }));
  }, { x: market.clientX, y: market.clientY });

  await expect(page.locator('#legend-world-shell-root .lws-selected-place h3')).toHaveText('Market');
  await expect(page.locator('#legend-world-shell-root [data-world-action="visit-selected-place"]')).toBeEnabled();
  await page.locator('#legend-world-shell-root [data-world-action="visit-selected-place"]').click();
  await expect(page.locator('.ash099-market-console')).toBeVisible();
  await expect(page.locator('[data-market-tab="buy"]')).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.environment)).toBe('market');
  const marketScene = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
  expect(marketScene.ashmereLandmarks).toHaveLength(0);
  expect(marketScene.serviceDressingKey).toBe('market');
  expect(marketScene.serviceDressingCount).toBeGreaterThanOrEqual(4);

  await page.locator('#ashBack').click();
  await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.ashmereLandmarks?.length)).toBe(4);
  const townAfterMarket = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
  expect(townAfterMarket.serviceDressingCount).toBe(0);
  expect(townAfterMarket.serviceDressingKey).toBe('');

  // Forge and Inn interiors are classified by the explicit town-service key,
  // not brittle visible-text matching, and get their own native Phaser dressing.
  const shellRight = page.locator('#legend-world-shell-root #lws-panel-right');
  await shellRight.locator('[data-world-place="forge"]').click();
  await expect(shellRight.locator('.lws-selected-place h3')).toHaveText('Forge & Workshop');
  await shellRight.locator('[data-world-action="visit-selected-place"]').click();
  await expect(page.locator('.ash099-forge-console')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.environment)).toBe('forge');
  const forgeScene = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
  expect(forgeScene.serviceDressingKey).toBe('forge');
  expect(forgeScene.serviceDressingCount).toBeGreaterThanOrEqual(8);

  await page.locator('#ashBack').click();
  await expect(page.locator('.ash100-town-ashmere')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.serviceDressingCount)).toBe(0);
  await shellRight.locator('[data-world-place="inn"]').click();
  await expect(shellRight.locator('.lws-selected-place h3')).toHaveText('Ashmere Inn');
  await shellRight.locator('[data-world-action="visit-selected-place"]').click();
  await expect(page.locator('.ash099-service-dashboard')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot()?.environment)).toBe('inn');
  const innScene = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
  expect(innScene.serviceDressingKey).toBe('inn');
  expect(innScene.serviceDressingCount).toBeGreaterThanOrEqual(3);
});

test('the production root falls back to its original artwork when the Phaser CDN is unavailable', async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js', route => route.abort());
  await openTitle(page);
  await expect(page.locator('.v120-title-backdrop')).toBeVisible();
  const fallback = await page.evaluate(() => ({
    engineMode: window.LegendPhaserWorldV1?.mode,
    engineReady: window.LegendPhaserWorldV1?.ready,
    phaserWorldClass: document.body.classList.contains('legend-phaser-world-active'),
    backdropVisibility: getComputedStyle(document.querySelector('.v120-title-backdrop')).visibility,
    titleVisible: Boolean(document.querySelector('.v120-title'))
  }));
  expect(fallback.engineMode).toBe('production');
  expect(fallback.engineReady).toBe(false);
  expect(fallback.phaserWorldClass).toBe(false);
  expect(fallback.backdropVisibility).toBe('visible');
  expect(fallback.titleVisible).toBe(true);
});


test('native Phaser title menu replaces the floating HTML button paint and keeps accessible controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openTitle(page);
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi)).toBe(true);

  const desktop = await page.evaluate(() => {
    const hero = document.querySelector('.title-v136-rpg .v120-title-hero');
    const button = document.querySelector('#newPrimary');
    const style = button ? getComputedStyle(button) : null;
    const heroStyle = hero ? getComputedStyle(hero) : null;
    const rect = button?.getBoundingClientRect();
    return {
      active: document.body.classList.contains('legend-phaser-title-ui-active'),
      snapshot: window.LegendPhaserWorldV1.snapshot(),
      nativeAlignment: (() => {
        const snapshot = window.LegendPhaserWorldV1.snapshot();
        const native = snapshot?.nativeTitleUiControlBounds?.find(item => item.id === 'newPrimary');
        const scene = snapshot?.nativeTitleUiSceneSize;
        return rect && native && scene ? {
          x: Math.abs(native.x - rect.left * scene.width / window.innerWidth),
          y: Math.abs(native.y - rect.top * scene.height / window.innerHeight),
          width: Math.abs(native.width - rect.width * scene.width / window.innerWidth),
          height: Math.abs(native.height - rect.height * scene.height / window.innerHeight)
        } : null;
      })(),
      heroBackground: heroStyle?.backgroundColor,
      heroShadow: heroStyle?.boxShadow,
      buttonBackground: style?.backgroundColor,
      buttonBorder: style?.borderTopColor,
      childVisibility: button?.firstElementChild ? getComputedStyle(button.firstElementChild).visibility : '',
      ariaLabel: button?.getAttribute('aria-label'),
      buttonBounds: rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } : null,
      canvasCount: document.querySelectorAll('#game-container canvas').length
    };
  });
  expect(desktop.active).toBe(true);
  expect(desktop.snapshot.nativeTitleUi).toBe(true);
  expect(desktop.snapshot.nativeTitleUiControlIds).toContain('newPrimary');
  expect(desktop.snapshot.nativeTitleUiControlCount).toBeGreaterThanOrEqual(5);
  expect(desktop.nativeAlignment).not.toBeNull();
  Object.values(desktop.nativeAlignment).forEach(delta => expect(delta).toBeLessThan(2));
  expect(desktop.heroBackground).toBe('rgba(0, 0, 0, 0)');
  expect(desktop.heroShadow).toBe('none');
  expect(desktop.buttonBackground).toBe('rgba(0, 0, 0, 0)');
  expect(desktop.childVisibility).toBe('hidden');
  expect(desktop.ariaLabel).toMatch(/Begin Your Journey.*Create your traveler/i);
  expect(desktop.canvasCount).toBe(1);
  expect(desktop.buttonBounds.left).toBeGreaterThanOrEqual(0);
  expect(desktop.buttonBounds.right).toBeLessThanOrEqual(1440);

  // Resize the same live scene: native Phaser hit-target artwork must realign
  // with the responsive, still-accessible HTML button hit targets.
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => {
    const rect = document.querySelector('#newPrimary')?.getBoundingClientRect();
    const ids = window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUiControlIds || [];
    return Boolean(rect && ids.includes('newPrimary') && rect.left >= 0 && rect.right <= window.innerWidth);
  })).toBe(true);
  const mobile = await page.evaluate(() => {
    const rect = document.querySelector('#newPrimary')?.getBoundingClientRect();
    const snapshot = window.LegendPhaserWorldV1.snapshot();
    const native = snapshot?.nativeTitleUiControlBounds?.find(item => item.id === 'newPrimary');
    const scene = snapshot?.nativeTitleUiSceneSize;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      active: document.body.classList.contains('legend-phaser-title-ui-active'),
      native: snapshot?.nativeTitleUi,
      button: rect ? { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } : null,
      alignment: rect && native && scene ? {
        x: Math.abs(native.x - rect.left * scene.width / window.innerWidth),
        y: Math.abs(native.y - rect.top * scene.height / window.innerHeight),
        width: Math.abs(native.width - rect.width * scene.width / window.innerWidth),
        height: Math.abs(native.height - rect.height * scene.height / window.innerHeight)
      } : null
    };
  });
  expect(mobile.overflow).toBe(false);
  expect(mobile.active).toBe(true);
  expect(mobile.native).toBe(true);
  expect(mobile.button.left).toBeGreaterThanOrEqual(0);
  expect(mobile.button.right).toBeLessThanOrEqual(390);
  expect(mobile.alignment).not.toBeNull();
  Object.values(mobile.alignment).forEach(delta => expect(delta).toBeLessThan(2));

  // The semantic button remains in the accessibility tree and activates the
  // existing title controller rather than introducing a Phaser-only router.
  const menuButton = page.getByRole('button', { name: /Begin Your Journey/i });
  await expect(menuButton).toBeVisible();
  await menuButton.focus();
  await expect.poll(() => page.evaluate(() => Boolean(window.LegendPhaserWorldV1.snapshot()?.nativeTitleUiControlBounds?.find(item => item.id === 'newPrimary')?.focused))).toBe(true);
  await menuButton.click();
  await expect(page.locator('.opening-lore-v220')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi)).toBe(false);
});

test('the production root plays its Phaser awakening and exposes the skip control on first visit', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(page.locator('#engine-skip')).toBeVisible({ timeout: 10000 });
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('engine-intro-active'))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.ready), { timeout: 15000 }).toBe(true);
  await expect(page.locator('.v120-title')).toBeVisible();
  const menuButton = page.getByRole('button', { name: /Begin Your Journey/i });
  await expect(menuButton).toBeVisible();
  const layerState = await page.evaluate(() => {
    const container = document.getElementById('game-container');
    const root = document.getElementById('root');
    const button = root?.querySelector('#newPrimary');
    const buttonRect = button?.getBoundingClientRect();
    return {
      htmlWorldClass: document.documentElement.classList.contains('legend-phaser-world-active'),
      bodyWorldClass: document.body.classList.contains('legend-phaser-world-active'),
      canvasLayerPosition: container ? getComputedStyle(container).position : '',
      canvasLayerPointerEvents: container ? getComputedStyle(container).pointerEvents : '',
      rootPosition: root ? getComputedStyle(root).position : '',
      rootZIndex: root ? Number(getComputedStyle(root).zIndex) : 0,
      buttonInViewport: Boolean(buttonRect && buttonRect.top >= 0 && buttonRect.bottom <= window.innerHeight),
      buttonPresent: Boolean(button)
    };
  });
  expect(layerState.htmlWorldClass).toBe(true);
  expect(layerState.bodyWorldClass).toBe(true);
  expect(layerState.canvasLayerPosition).toBe('fixed');
  expect(layerState.canvasLayerPointerEvents).toBe('none');
  expect(layerState.rootPosition).toBe('relative');
  expect(layerState.rootZIndex).toBeGreaterThan(0);
  expect(layerState.buttonInViewport).toBe(true);
  expect(layerState.buttonPresent).toBe(true);
  // A real click verifies that the menu is above the Phaser canvas, not merely
  // present in the DOM while the canvas occupies the visible page.
  await menuButton.click();
  await expect(page.locator('.opening-lore-v220')).toBeVisible();

  const boot = await page.evaluate(() => ({
    marker: sessionStorage.getItem('legend-phaser-production-engine-awakened-v1'),
    environment: window.LegendPhaserWorldV1.snapshot()?.environment,
    active: document.documentElement.classList.contains('engine-intro-active')
  }));
  expect(boot.marker).toBe('ready');
  expect(boot.environment).toBe('title');
  expect(boot.active).toBe(false);
  await expect(page.locator('#engine-skip')).toBeHidden();
});
