const { test, expect } = require('@playwright/test');

// Each Playwright test runs in an isolated browser context, so clearing localStorage
// here only resets that test's synthetic traveler—not a player's live browser save.
async function openTitle(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
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

async function startFreshCharacter(page, name = 'QATraveler') {
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
  await page.locator('[data-class="Ranger"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Begin the Road/i }).click();
  await page.getByRole('button', { name: /Enter Ashmere/i }).click();
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test.describe('LEGEND v0.20.21 browser regression tests', () => {
  test('title and visible build version are consistent', async ({ page }) => {
    await openTitle(page);
    await expect(page).toHaveTitle(/LEGEND: Roads of Ashmere v0\.20\.21/);
    await expect(page.locator('.portal-footer')).toContainText('v0.20.21');
    await expect.poll(() => page.evaluate(() => window.LEGEND_DATA?.VERSION)).toBe('v0.20.21');
  });

  test('title emblem loads from the committed SVG artwork', async ({ page }) => {
    await openTitle(page);
    const emblem = page.locator('.portal100-emblem-wrap img');
    await expect(emblem).toBeVisible();
    await expect(emblem).toHaveAttribute('src', /logo_legend_emblem_v2\.svg/);
    await expect.poll(() => emblem.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  });

  test('game opens directly on the actual title menu without the redundant Ashmere Gate screen', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload();
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.locator('.title-gate-card')).toHaveCount(0);
    await expect(page.locator('#enterRealm')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Begin Your Journey/i })).toBeVisible();
  });

  test('title screen has a single cinematic brand and no duplicate traveler card', async ({ page }) => {
    await openTitle(page);
    await expect(page.locator('.v120-title')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'LEGEND', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Roads of Ashmere/i })).toBeVisible();
    await expect(page.locator('.portal100-traveler')).toHaveCount(0);
    await expect(page.locator('#newPrimary')).toBeVisible();
    await expect(page.locator('#new')).toHaveCount(0);
  });

  test('Ashmere hub avoids duplicate camp shortcuts and keeps destinations as the main focus', async ({ page }) => {
    await startFreshCharacter(page, 'AshmereLayoutQA');
    await expect(page.locator('.ash100-town')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ashmere', exact: true })).toBeVisible();
    await expect(page.locator('.ash100-destination')).toHaveCount(7);
    await expect(page.getByRole('heading', { name: 'Your Camp', exact: true })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Ashmere terminal navigation' })).toBeVisible();
  });

  test('Greyfen hub changes identity and destinations after regional travel', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV080;
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
      const rt=window.LegendRuntimeV080;
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
      const pl=window.LegendRuntimeV080.loadPlayer();
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

  test('Continue Journey returns to the saved playable region', async ({ page }) => {
    await startFreshCharacter(page, 'RegionResumeQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV080;
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
    const region=await page.evaluate(() => window.LegendRuntimeV080.loadPlayer().currentRegion);
    expect(region).toBe('Greyfen');
  });

  test('Greyfen work board offers lowland-specific contracts', async ({ page }) => {
    await startFreshCharacter(page, 'GreyfenWorkQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV080;
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
      const rt=window.LegendRuntimeV080;
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
      const rt=window.LegendRuntimeV080;
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
    await expect(page.getByRole('heading', { name: 'Who reaches Ashmere?' })).toBeVisible();
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
      const rt=window.LegendRuntimeV080;
      const pl=rt.loadPlayer();
      pl.inventory=pl.inventory||{};
      pl.inventory.roadToken=50;
      rt.savePlayer(pl);
      window.LegendRegionsV100.render();
    });
    await expect(page.getByRole('heading', { name: 'Roads & Regions' })).toBeVisible();
    const greyfen=page.locator('.reg100-card').filter({ has: page.getByRole('heading', { name: 'Greyfen', exact: true }) });
    const ironpass=page.locator('.reg100-card').filter({ has: page.getByRole('heading', { name: 'Ironpass', exact: true }) });
    await expect(greyfen.locator('[data-unlock="Greyfen"]')).toBeVisible();
    await expect(ironpass).toContainText('Requires Greyfen first');
    await expect(ironpass.locator('[data-unlock="Ironpass"]')).toHaveCount(0);
    let state=await page.evaluate(() => {
      window.LegendRegionsV100.unlock('Ironpass');
      const pl=window.LegendRuntimeV080.loadPlayer();
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
      const pl=window.LegendRuntimeV080.loadPlayer();
      return {currentRegion:pl.currentRegion,known:pl.discoveredRegions,tokens:pl.inventory.roadToken};
    });
    expect(state.currentRegion).toBe('Greyfen');
    expect(state.known).toContain('Greyfen');
    expect(state.known).not.toContain('Ironpass');
    expect(state.tokens).toBe(45);

    await page.evaluate(() => {
      const rt=window.LegendRuntimeV080;
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
    await expect(page.getByRole('button', { name: /Captain Oric/i })).toBeVisible();
    await page.locator('[data-ash-view="oric"]').click();
    await expect(page.getByRole('heading', { name: 'Captain Oric' })).toBeVisible();
    await expect.poll(() => page.locator('.ash099-head img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  });

  test('Ashmere NPCs acknowledge returned road evidence and route choices', async ({ page }) => {
    await startFreshCharacter(page, 'ReturnEchoQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV080;
      const pl = rt.loadPlayer();
      pl.stats = { ...(pl.stats || {}), oldRoadClears: 1 };
      pl.inventory = { ...(pl.inventory || {}), bellFragment: 1, roadToken: 3 };
      pl.flags = {
        ...(pl.flags || {}),
        roadExpeditionV100: {
          ...(pl.flags?.roadExpeditionV100 || {}),
          routeChoice: 'reeds'
        }
      };
      rt.savePlayer(pl);
    });

    await page.locator('.ash100-destinations .ash100-destination[data-ash-view="people"]').click();
    await page.locator('[data-ash-view="mara"]').click();
    await expect(page.locator('.ash099-lines')).toContainText(/You brought back a Bell Fragment/i);
    await expect(page.locator('.ash099-lines')).toContainText(/blue light/i);

    await page.locator('#ashBack').click();
    await page.locator('.ash100-destinations .ash100-destination[data-ash-view="people"]').click();
    await page.locator('[data-ash-view="brenn"]').click();
    await expect(page.locator('.ash099-lines')).toContainText(/Bell Fragments are not just scrap/i);
    await expect(page.locator('#turnTokens')).toBeVisible();

    await page.locator('#ashBack').click();
    await page.locator('.ash100-destinations .ash100-destination[data-ash-view="people"]').click();
    await page.locator('[data-ash-view="oric"]').click();
    await expect(page.locator('.ash099-lines')).toContainText(/You chose the Reed Cut/i);
    await expect(page.locator('.ash099-lines')).toContainText(/tracks are a reason to report the route/i);
  });

  test('town job awards gold, favor, and progression XP', async ({ page }) => {
    await startFreshCharacter(page, 'JobQA');
    await page.evaluate(() => {
      const rt = window.LegendRuntimeV080;
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
      const rt=window.LegendRuntimeV080, pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.flags.roadExpeditionV100={...(pl.flags.roadExpeditionV100||{}),stage:0,pressure:53,trips:0,events:0,finds:0,battles:0};
      rt.savePlayer(pl);
    });
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /The Old Road/i }).click();
    await expect(page.locator('.exp100-head')).toBeVisible();
    await page.locator('#push').click();
    await expect(page.locator('.exp100-combat')).toBeVisible();
    await expect(page.locator('#skill')).toContainText('Trap Shot');
    await expect(page.locator('.rpg-enemy-tell')).toContainText(/Enemy intent/i);
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-attack/);
    await expect(page.locator('.rpg-foe-nameplate')).toContainText('OPPONENT');
    await expect(page.locator('#guard')).toContainText(/GUARD/i);
    await expect(page.locator('.rpg-turn-heading')).toContainText('YOUR TURN');
    await expect(page.locator('.rpg-command-grid .rpg-command')).toHaveCount(4);
    await expect(page.locator('#strike')).toContainText('FIGHT');
    await expect(page.locator('#skill')).toContainText('ACT');
    await expect(page.locator('#item')).toContainText('ITEM');
    await page.locator('#guard').click();
    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-guardbreak/);
    await expect(page.locator('.rpg-foe-nameplate')).toContainText('GUARD BREAK');
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

  test('Side contracts track exploration and can be claimed once', async ({ page }) => {
    await startFreshCharacter(page, 'ContractsQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Side Stories & Contracts/i }).click();
    await expect(page.locator('.ash099-contract-card')).toHaveCount(3);
    await page.locator('[data-contract-accept="watchlightSurvey"]').click();
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV080;const pl=rt.loadPlayer();
      pl.stats=pl.stats||{};pl.stats.pointsOfInterest=Number(pl.stats.pointsOfInterest||0)+1;rt.savePlayer(pl);
    });
    await page.locator('#ashBack').click();
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /Side Stories & Contracts/i }).click();
    await expect(page.locator('[data-contract-turnin="watchlightSurvey"]')).toBeVisible();
    await page.locator('[data-contract-turnin="watchlightSurvey"]').click();
    await expect(page.locator('.ash099-contract-completed')).toContainText(/Recorded in Journal/i);
    const result=await page.evaluate(()=>{const pl=window.LegendRuntimeV080.loadPlayer();return {completed:pl.stats.sideContractsCompleted,food:pl.inventory.food};});
    expect(result.completed).toBe(1);
    await page.reload();
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
    await page.getByRole('button', { name: /The Old Road/i }).click();
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
    await page.getByRole('button', { name: /The Old Road/i }).click();
    await page.locator('#routeRidge').click();
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure falls by 8/i);
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head')).toContainText(/arrive at Lantern Ditch/i);
    await expect(page.locator('.exp100-head')).toContainText(/High Ridge pays off/i);
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure rises by only 4/i);
    await expect(page.locator('#poiInspect')).toHaveCount(0);
    await page.locator('.exp100-hotspot-find').click();
    await expect(page.locator('.exp100-discovery-beat')).toContainText(/Ridgeway Cairn/i);
    await page.locator('#poiInspect').click();
    await expect(page.locator('.exp100-head')).toContainText(/Road Pressure falls by 3/i);
  });


  test('Wisp Lantern Wick uses a Bell Fragment and reduces opening Road Pressure once', async ({ page }) => {
    await startFreshCharacter(page, 'LanternWickQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV080;
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
    let inventory=await page.evaluate(() => window.LegendRuntimeV080.loadPlayer().inventory);
    expect(inventory.bellFragment).toBe(0);
    expect(inventory.oil).toBe(0);
    expect(inventory.wispLanternWick).toBe(1);
    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await expect(page.getByRole('button', { name: /The Old Road/i })).toBeVisible();
    await page.getByRole('button', { name: /The Old Road/i }).click();
    await expect(page.locator('.exp100-head')).toBeVisible();
    await expect(page.locator('.exp100-head')).toContainText(/opening Road Pressure rises by only 3 instead of 8/i);
    const after=await page.evaluate(() => {
      const pl=window.LegendRuntimeV080.loadPlayer();
      return {pressure:pl.flags.roadExpeditionV100.pressure,wick:Number(pl.inventory.wispLanternWick||0)};
    });
    expect(after.pressure).toBe(3);
    expect(after.wick).toBe(0);
    await expect(page.locator('.exp100-head')).toContainText(/opening Road Pressure rises by only 3 instead of 8/i);
  });

  test('road discovery stays hidden until the player notices it', async ({ page }) => {
    await startFreshCharacter(page, 'DiscoveryQA');
    await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
    await page.getByRole('button', { name: /The Old Road/i }).click();
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
    await page.getByRole('button', { name: /The Old Road/i }).click();
    await page.locator('#routeReeds').click();
    await page.locator('#push').click();
    await page.locator('.exp100-hotspot-find').click();
    await page.locator('#poiInspect').click();
    await page.locator('#push').click();
    await expect(page.locator('.exp100-head')).toContainText(/wet reeds cling to your boots/i);
    await expect(page.locator('.exp100-head')).toContainText(/something followed you out/i);
  });

  test('Ashmere navigation and destination symbols use local SVG sprite artwork', async ({ page }) => {
    await startFreshCharacter(page, 'IconArtQA');
    const icons = page.locator('.ash100-destinations .ash100-destination-icon .ash099-icon svg');
    await expect(icons.first()).toBeVisible();
    await expect(icons).toHaveCount(7);
    const iconReferences = await page.locator('.ash100-destinations .ash100-destination-icon .ash099-icon svg use').evaluateAll(nodes =>
      nodes.map(node => node.getAttribute('href') || node.getAttribute('xlink:href') || '')
    );
    expect(iconReferences).toHaveLength(7);
    expect(iconReferences.every(ref => ref.startsWith('assets/ui/icons/legend-ui-icons-v1.svg#icon-'))).toBe(true);
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

  test('Secured expedition has a direct Return to Ashmere action', async ({ page }) => {
    await startFreshCharacter(page, 'ReturnFromRoadQA');
    await page.evaluate(() => {
      const rt=window.LegendRuntimeV080;
      const pl=rt.loadPlayer();
      pl.flags=pl.flags||{};
      pl.flags.roadExpeditionV100={stage:5,pressure:20,trips:1,events:0,finds:0,battles:0};
      rt.savePlayer(pl);
      window.LegendRoadControllerV100.renderHub();
    });
    await page.locator('#finish').click();
    await expect(page.locator('#outcomeReturn')).toBeVisible();
    await expect(page.locator('.exp100-outcome')).toContainText('Expedition Secured');
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
    await expect(title.locator('h1')).toHaveText('LEGEND');
  });

});
