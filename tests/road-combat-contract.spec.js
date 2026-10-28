const { test, expect } = require('@playwright/test');

test.describe('LegendRoadCombatV100 compatibility contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  async function startCombat(page, overrides = {}) {
    return page.evaluate((overrides) => {
      const player = {
        username: 'CombatQA',
        className: 'Ranger',
        level: 1,
        hp: 40,
        maxHp: 100,
        gold: 0,
        inventory: { potion: 1, roadPoultice: 1 },
        stats: {},
        ...overrides.player,
      };
      const state = { stage: 1, pressure: 30, poiUsed: {}, ...overrides.state };
      const events = { saves: 0, inventory: [], progress: [], fx: [], music: [], outcomes: [], expedition: [], results: [] };
      const context = {
        getPlayer: () => player,
        savePlayer: () => { events.saves += 1; },
        getAssets: () => ({ enemies: {}, classes: { Ranger: 'assets/generated/classes/class-ranger.webp' }, travelerPortrait: () => 'assets/generated/classes/class-ranger.webp', byName: () => '' }),
        getWeapon: () => ({ name: 'Wooden Sword', min: 2, max: 4 }),
        getArmor: () => overrides.armor || ({ name: 'Cloth Armor', defense: 2 }),
        score: () => 0,
        ensureState: () => state,
        hpPercent: pl => Math.max(0, Math.min(100, Math.round(pl.hp / Math.max(1, pl.maxHp) * 100))),
        escapeHtml: value => String(value ?? '').replace(/[&<>'"]/g, character => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[character])),
        clamp: (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value)),
        randomInt: minimum => minimum,
        addInventory: (pl, item, count) => {
          pl.inventory[item] = Number(pl.inventory[item] || 0) + count;
          events.inventory.push({ item, count });
        },
        itemName: item => item,
        renderShell: html => { document.body.innerHTML = html; },
        renderExpedition: text => { events.expedition.push(text); document.body.textContent = text; },
        outcome: (...args) => { events.outcomes.push(args); document.body.textContent = args.join(' '); },
        showCombatResults: payload => {
          events.results.push({
            result: payload.result,
            enemy: payload.enemy.name,
            rewardName: payload.rewardName,
            xpGained: payload.progress?.gained || 0,
            routeStage: payload.routeStage
          });
          document.body.innerHTML = '<main class="v152-combat-results"><h1>' +
            (payload.result === 'victory' ? 'Victory' : 'Driven Back') + '</h1><p>' +
            payload.enemy.name + ' ' + (payload.rewardName || '') + '</p></main>';
          return true;
        },
        soundOn: () => false,
        startMusic: () => { events.music.push('start'); },
        stopMusic: () => { events.music.push('stop'); },
        playBattleFx: effect => { events.fx.push(effect); },
        tone: tone => { events.fx.push(tone); },
        toggleSound: () => false,
        awardProgress: (pl, amount) => {
          events.progress.push(amount);
          return { gained: amount, levels: 0, level: pl.level };
        },
      };
      window.__combatContract = { player, state, events };
      window.LegendRoadCombatV100.start(context, {
        name: 'Road Goblin',
        hp: 99,
        maxHp: 99,
        damage: [3, 7],
        reward: 'fur',
        turn: 0,
        intent: 'attack',
        ...overrides.enemy,
      });
      return { player, state };
    }, overrides);
  }

  test('uses a healing potion and still resolves the enemy turn', async ({ page }) => {
    await startCombat(page, { player: { hp: 40, inventory: { potion: 1, roadPoultice: 1 } }, enemy: { damage: [3, 3] } });
    await page.locator('#item').click();

    const result = await page.evaluate(() => window.__combatContract);
    expect(result.player.hp).toBe(69);
    expect(result.player.inventory.potion).toBe(0);
    expect(result.events.saves).toBe(1);
    await expect(page.locator('.rpg-dialogue')).toContainText('recover 30 HP');
    await expect(page.locator('.rpg-dialogue')).toContainText('hits you for 1 damage');
  });

  test('caps potion healing at missing HP before the enemy counterattack', async ({ page }) => {
    await startCombat(page, {
      player: { hp: 90, maxHp: 100, inventory: { potion: 1, roadPoultice: 1 } },
      enemy: { damage: [3, 3] },
    });
    await page.locator('#item').click();

    const result = await page.evaluate(() => window.__combatContract);
    expect(result.player.hp).toBe(99);
    expect(result.player.inventory.potion).toBe(0);
    expect(result.events.saves).toBe(1);
    await expect(page.locator('.rpg-dialogue')).toContainText('recover 10 HP');
    await expect(page.locator('.rpg-dialogue')).toContainText('hits you for 1 damage');
  });

  test('guard fully absorbs a heavy wind-up when armor and guard reduction cover the hit', async ({ page }) => {
    await startCombat(page, {
      player: { hp: 40, maxHp: 100 },
      enemy: { hp: 99, intent: 'heavy', damage: [3, 7] },
    });
    await page.locator('#guard').click();

    const result = await page.evaluate(() => window.__combatContract);
    expect(result.player.hp).toBe(40);
    expect(result.events.saves).toBe(1);
    await expect(page.locator('.rpg-dialogue')).toContainText('guard turns the blow aside');
    await expect(page.locator('.rpg-enemy-tell')).toContainText('Quick strike');
  });

  test('Raider behavior opens with a guard-break feint, then a quick strike and heavy wind-up', async ({ page }) => {
    await startCombat(page, {
      enemy: { behavior: 'raider', turn: 0, intent: null, damage: [3, 3] },
    });
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-guardbreak/);
    await expect(page.locator('.exp100-intent')).toContainText(/Guard-break/i);

    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-attack/);
    await expect(page.locator('.exp100-intent')).toContainText(/Quick strike/i);

    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-heavy/);
    await expect(page.locator('.exp100-intent')).toContainText(/Heavy wind-up/i);
  });

  test('Predator behavior presses with an attack, then a heavy lunge', async ({ page }) => {
    await startCombat(page, {
      enemy: { behavior: 'predator', turn: 0, intent: null, damage: [3, 3] },
    });
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-attack/);
    await expect(page.locator('.exp100-intent')).toContainText(/Quick strike/i);

    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-heavy/);
    await expect(page.locator('.exp100-intent')).toContainText(/Heavy wind-up/i);
  });

  test('Flicker behavior opens with a heavy surge, then tries to break the guard', async ({ page }) => {
    await startCombat(page, {
      enemy: { behavior: 'flicker', turn: 0, intent: null, damage: [3, 3] },
    });
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-heavy/);
    await expect(page.locator('.exp100-intent')).toContainText(/Heavy wind-up/i);

    await page.locator('#guard').click();
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-guardbreak/);
    await expect(page.locator('.exp100-intent')).toContainText(/Guard-break/i);
  });

  test('victory grants the configured drop and XP, updates counters, and advances the stage', async ({ page }) => {
    await startCombat(page, {
      player: { hp: 40, maxHp: 100 },
      state: { stage: 1, pressure: 30 },
      enemy: { hp: 1, maxHp: 99, reward: 'fur' },
    });
    await page.locator('#strike').click();

    const result = await page.evaluate(() => window.__combatContract);
    expect(result.player.inventory.fur).toBe(1);
    expect(result.player.stats.monstersDefeated).toBe(1);
    expect(result.player.stats.roadVictories).toBe(1);
    expect(result.state.stage).toBe(2);
    expect(result.state.pressure).toBe(22);
    expect(result.events.progress).toEqual([29]);
    expect(result.events.inventory).toEqual([{ item: 'fur', count: 1 }]);
    expect(result.events.music).toContain('stop');
    expect(result.events.fx).toContain('victory');
    expect(result.events.results).toEqual([{
      result: 'victory', enemy: 'Road Goblin', rewardName: 'fur', xpGained: 29, routeStage: 2
    }]);
    await expect(page.locator('.v152-combat-results')).toBeVisible();
    await expect(page.locator('.v152-combat-results')).toContainText('Victory');
  });

  test('a road defeat uses the same outcome flow with a clear return-to-town state', async ({ page }) => {
    await startCombat(page, {
      player: { hp: 1, maxHp: 100 },
      enemy: { hp: 99, maxHp: 99, intent: 'attack', damage: [3, 7] },
    });
    await page.locator('#heavy').click();
    const result = await page.evaluate(() => window.__combatContract);
    expect(result.player.hp).toBe(1);
    expect(result.state.stage).toBe(0);
    expect(result.events.results).toEqual([{
      result: 'defeat', enemy: 'Road Goblin', rewardName: '', xpGained: 0, routeStage: 0
    }]);
    await expect(page.locator('.v152-combat-results')).toContainText('Driven Back');
  });

  test('bandits telegraph a readable guard-break and the battlefield retains an action ledger', async ({ page }) => {
    await startCombat(page, {
      enemy: { name: 'Roadside Bandit', behavior: 'bandit', turn: 0, intent: null, damage: [5, 5] },
    });
    await expect(page.locator('.rpg-foe-nameplate')).toHaveClass(/rpg-foe-intent-guardbreak/);
    await expect(page.locator('.rpg-battlefield')).toHaveAttribute('data-arena', 'road');
    await page.locator('#guard').click();
    await expect(page.locator('.rpg-battle-log')).toContainText(/Roadside Bandit|guard turns/i);
    await expect(page.locator('.rpg-dialogue')).toContainText(/damage|guard/i);
  });

  test('configured encounter XP, coin and bonus materials are awarded and shown in the debrief', async ({ page }) => {
    await startCombat(page, {
      player: { hp: 100, maxHp: 100, gold: 0 },
      state: { stage: 1, pressure: 30 },
      enemy: {
        name: 'Roadside Bandit', behavior: 'bandit', hp: 1, maxHp: 1,
        reward: 'clothScrap', xp: 34, goldDrop: [4, 12],
        bonusDrop: { item: 'roadToken', chance: 100, amount: [1, 1] },
      },
    });
    await page.locator('#strike').click();
    const result = await page.evaluate(() => window.__combatContract);
    expect(result.player.inventory.clothScrap).toBe(1);
    expect(result.player.inventory.roadToken).toBe(1);
    expect(result.player.gold).toBe(4);
    expect(result.events.progress).toEqual([38]);
    await expect(page.locator('.v152-combat-results')).toContainText('clothScrap');
    await expect(page.locator('.v152-combat-results')).toContainText('roadToken');
    expect(result.events.results[0]).toMatchObject({ result: 'victory', rewardName: 'clothScrap · roadToken', xpGained: 38 });
  });

  test('high-tier armor reduces damage without preserving the old overpowered defense scale', async ({ page }) => {
    await startCombat(page, {
      player: { hp: 50, maxHp: 100 },
      armor: { name: 'Iron Armor', defense: 68 },
      enemy: { hp: 99, maxHp: 99, intent: 'attack', damage: [12, 12] },
    });
    await page.locator('#strike').click();
    const result = await page.evaluate(() => window.__combatContract);
    expect(result.player.hp).toBe(46);
  });
  test('combat exchanges animate a hit, recoil, and counter without idle shaking', async ({ page }) => {
    await startCombat(page, {
      player: { hp: 100, maxHp: 100 },
      enemy: { name: 'Roadside Bandit', behavior: 'bandit', hp: 99, maxHp: 99, turn: 1, intent: 'attack', damage: [5, 5] },
    });
    await page.locator('#strike').click();
    const motion = await page.locator('.rpg-foe-sprite').evaluate(el => getComputedStyle(el).animationName);
    expect(motion).toBe('rpg-round-exchange-v200');
    await expect(page.locator('.rpg-battle-log')).toContainText('strike lands');
  });

  
  test('battle stages traveler and enemy in the location and removes idle dancing', async ({ page }) => {
    await startCombat(page, {
      enemy: { name: 'Roadside Bandit', behavior: 'bandit', turn: 0, intent: null, damage: [5, 5] },
    });

    await expect(page.locator('.rpg-hero-stage-art')).toBeVisible();
    await expect(page.locator('.rpg-hero-stage-art img')).toHaveAttribute('src', 'assets/generated/classes/class-ranger.webp');
    await expect(page.locator('.rpg-hero-stage-plate')).toContainText('CombatQA');
    await expect(page.locator('.rpg-foe-nameplate')).toContainText('Roadside Bandit');
    await expect(page.locator('.rpg-duel-ground')).toBeVisible();

    const staging = await page.evaluate(() => ({
      playerMotion: getComputedStyle(document.querySelector('.rpg-hero-stage-art')).animationName,
      enemyMotion: getComputedStyle(document.querySelector('.rpg-foe-sprite')).animationName,
      scene: getComputedStyle(document.querySelector('.rpg-battlefield')).backgroundImage,
      sceneTint: getComputedStyle(document.querySelector('.rpg-battlefield'), '::before').backgroundImage,
      dialogue: getComputedStyle(document.querySelector('.rpg-dialogue')).backgroundImage,
      enemyPlate: getComputedStyle(document.querySelector('.rpg-foe-nameplate')).right,
    }));
    expect(staging.playerMotion).toBe('none');
    expect(staging.enemyMotion).toBe('none');
    expect(staging.scene).toContain('old-road-south-fork.webp');
    expect(staging.scene).toContain('0.66');
    expect(staging.sceneTint).toContain('0.42');
    expect(staging.dialogue).toContain('linear-gradient');
    expect(staging.enemyPlate).not.toBe('auto');
  });

});
