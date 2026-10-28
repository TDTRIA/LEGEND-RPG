/* LEGEND v0.25.0 — optional Greyfen Silted Storehouse delve.
 * Saves its own route/room state and reuses the production road-combat service.
 */
(() => {
  const KEY = 'greyfenStorehouseV170';
  const ART = 'assets/generated/locations/greyfen-marsh-walkway.webp';
  const saveGlobal = player => {
    if (typeof window.LegendRuntimeV120?.savePlayer === 'function') return window.LegendRuntimeV120.savePlayer(player);
    if (typeof window.LegendStorage?.savePlayer === 'function') return window.LegendStorage.savePlayer(player);
  };
  function runFor(player) {
    player.flags = player.flags || {};
    const run = player.flags[KEY] || {};
    player.flags[KEY] = run;
    run.clears = Math.max(0, Number(run.clears || 0));
    run.attempts = Math.max(0, Number(run.attempts || 0));
    run.retreats = Math.max(0, Number(run.retreats || 0));
    run.records = Array.isArray(run.records) ? run.records : [];
    return run;
  }
  function addMemory(player, value) {
    player.memories = Array.isArray(player.memories) ? player.memories : [];
    if (!player.memories.includes(value)) player.memories.push(value);
  }
  const storehouseEnemy = enemy => !!enemy?.greyfenStorehouseV170;
  function afterCombatWin(player, enemy, progress) {
    if (!player || !storehouseEnemy(enemy)) return;
    const run = runFor(player);
    if (!run.active || !run.inBattle) return;
    run.inBattle = false; run.battleWon = true; run.failed = false; run.room = 3;
    run.combatXp = Math.max(0, Number(progress?.gained || 0));
    player.stats = player.stats || {};
    player.stats.greyfenStorehouseVictories = Number(player.stats.greyfenStorehouseVictories || 0) + 1;
    saveGlobal(player);
    return window.LegendAshmereV099?.route?.('storehouse');
  }
  function afterCombatDefeat(player, enemy) {
    if (!player || !storehouseEnemy(enemy)) return;
    const run = runFor(player);
    if (!run.active || !run.inBattle) return;
    run.active = false; run.inBattle = false; run.battleWon = false; run.failed = true;
    run.lastRoom = Number(run.room || 2);
    player.stats = player.stats || {};
    player.stats.greyfenStorehouseDefeats = Number(player.stats.greyfenStorehouseDefeats || 0) + 1;
    saveGlobal(player);
    return window.LegendAshmereV099?.route?.('storehouse');
  }
  function afterCombatRetreat(player, enemy) {
    if (!player || !storehouseEnemy(enemy)) return;
    const run = runFor(player);
    if (!run.active || !run.inBattle) return;
    run.active = false; run.inBattle = false; run.battleWon = false; run.failed = false;
    run.lastRoom = Number(run.room || 2); run.retreats += 1;
    player.stats = player.stats || {};
    player.stats.greyfenStorehouseRetreats = Number(player.stats.greyfenStorehouseRetreats || 0) + 1;
    saveGlobal(player);
    return window.LegendAshmereV099?.renderAshmere?.();
  }
  function create(context = {}) {
    const { getPlayer, savePlayer, getData, escapeHtml, head, screen, locationInterior, renderTown } = context;
    if (typeof getPlayer !== 'function' || typeof savePlayer !== 'function' || typeof getData !== 'function' ||
        typeof escapeHtml !== 'function' || typeof head !== 'function' || typeof screen !== 'function') return null;
    const esc = escapeHtml, data = () => getData() || {}, save = player => savePlayer(player);
    const inGreyfen = player => String(player?.currentRegion || player?.town || 'Ashmere') === 'Greyfen';
    const unlocked = player => inGreyfen(player) && !!player?.flags?.greyfenDryCrossingComplete;
    function inventory(player) {
      player.inventory = player.inventory && typeof player.inventory === 'object' ? player.inventory : {};
      return player.inventory;
    }
    function addItem(player, key, quantity = 1) {
      const items = inventory(player);
      items[key] = Math.max(0, Number(items[key] || 0)) + quantity;
    }
    const button = (id, label, detail, kind = '') =>
      '<button type="button" id="' + id + '" class="gss170-action ' + kind + '" data-legend-scene-transition="' + esc(label) + '"><strong>' + esc(label) + '</strong><span>' + esc(detail) + '</span></button>';
    function scene(title, kicker, copy, content, actions) {
      return '<section class="gss170-page" aria-label="The Silted Storehouse"><div class="gss170-scene">' +
        '<img class="gss170-scene-art" src="' + ART + '" alt="" decoding="async"><div class="gss170-scene-shade"></div>' +
        '<div class="gss170-scene-copy"><span class="gss170-kicker">' + esc(kicker) + '</span><h1>' + esc(title) + '</h1><p>' + esc(copy) + '</p></div></div>' +
        '<div class="gss170-content">' + content + '</div><div class="gss170-actions">' + actions + '</div><p class="gss170-status" id="gss170Status" aria-live="polite"></p></section>';
    }
    function stats(player, run) {
      const items = inventory(player);
      return '<div class="gss170-stat-grid"><div><span>HEALTH</span><strong>' + Number(player.hp || 0) + ' / ' + Number(player.maxHp || 1) + '</strong></div>' +
        '<div><span>LEVEL</span><strong>' + Number(player.level || 1) + '</strong></div><div><span>DRY PEAT</span><strong>' + Number(items.peatBrick || 0) + '</strong></div>' +
        '<div><span>CLEARS</span><strong>' + run.clears + '</strong></div></div>';
    }
    function retreat() {
      const player = getPlayer(); if (!player) return;
      const run = runFor(player);
      if (!run.active) return typeof renderTown === 'function' ? renderTown() : window.LegendAshmereV099?.renderAshmere?.();
      run.active = false; run.inBattle = false; run.battleWon = false; run.failed = false;
      run.lastRoom = Number(run.room || 0); run.retreats += 1;
      player.stats = player.stats || {};
      player.stats.greyfenStorehouseRetreats = Number(player.stats.greyfenStorehouseRetreats || 0) + 1;
      save(player);
      return typeof renderTown === 'function' ? renderTown() : window.LegendAshmereV099?.renderAshmere?.();
    }
    function startRun(player) {
      const previous = runFor(player);
      player.flags[KEY] = {
        active: true, room: 0, clears: previous.clears, attempts: previous.attempts + 1, retreats: previous.retreats,
        failed: false, completed: false, inBattle: false, battleWon: false, rewardClaimed: false,
        approach: '', dispatchRead: false, salvageCollected: !!player.flags.greyfenStorehouseSalvageCollected,
        startedDay: Number(player.day || 1), records: previous.records
      };
      save(player); render();
    }
    function chooseApproach(route) {
      const player = getPlayer(); if (!player) return;
      const run = runFor(player);
      if (!run.active || run.room !== 0 || run.approach) return render();
      run.approach = route;
      if (route === 'sump') {
        player.hp = Math.max(1, Number(player.hp || 1) - 6);
        addItem(player, 'roadHerb');
      }
      run.room = 1; save(player); render();
    }
    function readDispatch() {
      const player = getPlayer(); if (!player) return;
      const run = runFor(player);
      if (!run.active || run.room !== 1) return render();
      player.flags = player.flags || {};
      if (!player.flags.greyfenStorehouseDispatchFound) {
        player.flags.greyfenStorehouseDispatchFound = true;
        player.flags.greyfenStorehouseDispatchFoundDay = Number(player.day || 1);
        addMemory(player, 'At Greyfen’s Silted Storehouse, a damp dispatch dated after the flood’s retreat lists supply sacks routed through the lower crossing as a temporary exception. Its authorization leaf is missing; the record does not name who permitted the route.');
      }
      run.dispatchRead = true;
      if (!run.records.some(item => item.key === 'dispatch')) run.records.push({
        key: 'dispatch', title: 'Damp Storehouse Dispatch',
        note: 'Supply sacks were routed through the lower crossing as a temporary exception. The authorization leaf is missing.',
        day: Number(player.day || 1)
      });
      save(player); render();
      const status = document.getElementById('gss170Status');
      if (status) status.textContent = 'Dispatch preserved. Its missing authorization leaf remains unresolved.';
    }
    function salvage() {
      const player = getPlayer(); if (!player) return;
      const run = runFor(player);
      if (!run.active || run.room !== 1 || run.salvageCollected || player.flags?.greyfenStorehouseSalvageCollected) return render();
      addItem(player, 'peatBrick'); addItem(player, 'oil'); run.salvageCollected = true; player.flags.greyfenStorehouseSalvageCollected = true;
      run.records.push({ key: 'salvage', title: 'Dry Peat and Lamp Oil', note: 'A sealed crate yields one Dry Peat Brick and one flask of Lamp Oil.', day: Number(player.day || 1) });
      save(player); render();
      const status = document.getElementById('gss170Status');
      if (status) status.textContent = 'Recovered one Dry Peat Brick and one flask of Lamp Oil.';
    }
    function fight() {
      const player = getPlayer(); if (!player) return;
      const run = runFor(player);
      if (!run.active || ![1,2].includes(Number(run.room)) || run.inBattle || run.battleWon) return render();
      run.room = 2; run.inBattle = true; save(player);
      const level = Math.max(1, Number(player.level || 1)), upper = run.approach === 'upper';
      const enemyHp = Math.max(18, 18 + Math.floor(level * 1.5) + (upper ? 0 : 5));
      const baseDamage = Math.max(3, 3 + Math.floor(level / 3) + (upper ? 0 : 2));
      const enemy = {
        id: 'greyfen-storehouse-mirebound-keeper-v170', name: 'Mirebound Storehouse Keeper',
        behavior: 'raider', hp: enemyHp, maxHp: enemyHp, damage: [baseDamage, baseDamage + 3],
        reward: 'peatBrick', turn: 0, intent: 'attack', dungeonV100: true, greyfenStorehouseV170: true,
        locationLabel: 'THE SILTED STOREHOUSE',
        text: upper ? 'A Mirebound Storehouse Keeper unfolds behind the old shelving. The upper walk has kept you out of its strongest reach.'
          : 'A Mirebound Storehouse Keeper pulls itself from the cargo sump. The splashing has drawn it toward you.'
      };
      if (typeof window.LegendRoadControllerV100?.startDungeonEncounter === 'function') {
        return window.LegendRoadControllerV100.startDungeonEncounter(enemy,
          upper ? 'You chose the upper shelves. The keeper is less prepared for your approach.' : 'You crossed the sump and found supplies, but took a harder route into the chamber.');
      }
      run.active = false; run.inBattle = false; run.failed = true; save(player); render();
    }
    function claimReward() {
      const player = getPlayer(); if (!player) return;
      const run = runFor(player);
      if (!run.active || !run.battleWon || run.rewardClaimed) return render();
      const gold = 22 + Math.max(1, Number(player.level || 1)) * 4;
      player.gold = Math.max(0, Number(player.gold || 0)) + gold;
      if (run.clears === 0) addItem(player, 'roadHerb'); else addItem(player, 'peatBrick');
      run.rewardClaimed = true; run.completed = true; run.failed = false; run.active = false; run.clears += 1;
      run.lastReport = 'The Silted Storehouse was cleared. +' + gold + ' gold and ' + (run.clears === 1 ? 'one Road Herb' : 'one Dry Peat Brick') + '.';
      player.flags.greyfenStorehouseCompleted = true;
      player.stats = player.stats || {};
      player.stats.greyfenStorehouseClears = Number(player.stats.greyfenStorehouseClears || 0) + 1;
      save(player); render();
    }
    function render() {
      const player = getPlayer(); if (!player) return;
      if (!unlocked(player)) {
        const inTown = inGreyfen(player);
        const copy = inTown ? 'Finish A Dry Crossing before entering this optional location.' : 'Travel to Greyfen through the Road Network before exploring this site.';
        screen(head('GREYFEN · STOREHOUSE', 'The Silted Storehouse', copy, typeof locationInterior === 'function' ? locationInterior('market') : '', 'dungeon'),
          scene(inTown ? 'The Storehouse Remains Shut' : 'A Lowland Door', 'OPTIONAL DELVE', copy,
            '<article class="gss170-card"><span class="gss170-card-label">ENTRY REQUIREMENT</span><h2>A Dry Crossing</h2><p>This delve is optional; its dispatch adds context but does not prove who authorized the route.</p></article>',
            button('gss170Return', 'Return to town', 'Leave this closed entry.', 'secondary')));
        document.getElementById('gss170Return')?.addEventListener('click', retreat);
        return;
      }
      const run = runFor(player);
      // Combat itself is not serialized, so reloading restores its entrance without losing saved state.
      if (run.active && run.inBattle) { run.inBattle = false; save(player); }
      let title = 'The Silted Storehouse', kicker = 'GREYFEN · OPTIONAL DELVE';
      let copy = 'A low timber building leans above dark water. Inventory records outlived the floorboards; the authorizing names did not.';
      let content = '', actions = '';
      if (run.failed && !run.active) {
        title = 'Driven from the Storehouse'; kicker = 'DELVES · WITHDRAWAL';
        copy = 'The keeper drove you back. Your gear, saved dispatch, and carried supplies remain yours.';
        content = stats(player, run) + '<article class="gss170-card"><h2>The inner bay</h2><p>Your health is low. Rest and prepare in Greyfen before trying again.</p></article>';
        actions = button('gss170Retry', 'Try the delve again', 'Start a fresh attempt. Saved discoveries stay recorded.', 'primary') + button('gss170Return', 'Return to Greyfen', 'Leave the storehouse.', 'secondary');
      } else if (run.completed && !run.active) {
        title = 'The Storehouse Remembers'; kicker = 'DELVES · REPORT FILED';
        copy = 'The stores can be searched again later, but each dispatch remains in your journal.';
        content = stats(player, run) + '<article class="gss170-card"><span class="gss170-card-label">FIELD REPORT</span><h2>Delve completed</h2><p>' + esc(run.lastReport || 'Your reward is recorded.') + '</p><p>The dispatch records a temporary supply exception through the lower crossing. Its authorization leaf is missing; it does not name who approved the route.</p></article>';
        actions = button('gss170Again', 'Descend again', 'Repeat the optional delve for useful supplies.', 'primary') + button('gss170Return', 'Return to Greyfen', 'Leave the cleared storehouse.', 'secondary');
      } else if (!run.active) {
        content = stats(player, run) + '<div class="gss170-grid"><article class="gss170-card"><span class="gss170-card-label">ROOM 1 · LOADING WALK</span><h2>Choose your footing</h2><p>The upper shelves are safer. The sump may yield herbs but hides debris and the keeper.</p></article>' +
          '<article class="gss170-card"><span class="gss170-card-label">ROOM 2 · RECORDS BAY</span><h2>Evidence and salvage</h2><p>A damp dispatch remains below a broken slate. Preserve its words, search stores, or proceed to the inner bay.</p></article></div>';
        actions = button('gss170Begin', 'Enter the storehouse', 'Start an attempt without spending supplies.', 'primary') + button('gss170Return', 'Return to Greyfen', 'Prepare at town services first.', 'secondary');
      } else if (Number(run.room) === 0) {
        title = 'The Loading Walk'; kicker = 'ROOM 1 / 3 · ROUTE CHOICE';
        copy = 'The walk splits above and below the waterline. Your route changes the cost and supplies before the keeper is reached.';
        content = stats(player, run) + '<div class="gss170-grid"><article class="gss170-card gss170-card-safe"><span class="gss170-card-label">SAFER · SLOWER</span><h2>Upper shelves</h2><p>No health cost; the keeper is weaker.</p></article>' +
          '<article class="gss170-card gss170-card-risk"><span class="gss170-card-label">RISKIER · BETTER FIND</span><h2>Cargo sump</h2><p>Lose 6 HP, gain a Road Herb, and face a stronger keeper. HP cannot drop below 1.</p></article></div>';
        actions = button('gss170Upper', 'Follow the upper shelves', 'Steady footing; the keeper is less prepared.', 'primary') + button('gss170Sump', 'Wade through the cargo sump', 'Spend 6 HP for one herb and a harder encounter.', 'secondary') + button('gss170Retreat', 'Return to Greyfen', 'Leave before committing.', 'secondary');
      } else if (Number(run.room) === 1) {
        title = 'The Records Bay'; kicker = 'ROOM 2 / 3 · OPTIONAL DISCOVERY';
        copy = 'The paper has softened, not every mark. The authorization leaf is gone; preserve only what can be proved.';
        const dispatch = player.flags?.greyfenStorehouseDispatchFound ? '<p class="gss170-found-note"><strong>Dispatch already preserved.</strong> Its signature leaf is missing.</p>' : '<button type="button" id="gss170ReadDispatch" class="gss170-inline-action">Read and preserve the damp dispatch</button>';
        const salvage = run.salvageCollected || player.flags?.greyfenStorehouseSalvageCollected ? '<p class="gss170-found-note"><strong>Salvage recorded.</strong> Dry Peat Brick and Lamp Oil recovered.</p>' : '<button type="button" id="gss170Salvage" class="gss170-inline-action">Search the sealed freight crate</button>';
        content = stats(player, run) + '<article class="gss170-card"><span class="gss170-card-label">OILSKIN RECORD</span><h2>The authorization leaf is gone</h2><p>The dispatch lists supplies moved through the lower crossing as a temporary exception after the flood’s retreat. It records a route decision, not who approved it.</p>' + dispatch + '</article>' +
          '<article class="gss170-card"><span class="gss170-card-label">OPTIONAL SALVAGE</span><h2>Sealed freight</h2><p>Useful material remains beneath the waterline. Searching it does not change the evidence record.</p>' + salvage + '</article>';
        actions = button('gss170Fight', 'Enter the inner bay', 'Face the keeper using production combat.', 'primary') + button('gss170Retreat', 'Return to Greyfen', 'Leave with saved discoveries and supplies.', 'secondary');
      } else if (Number(run.room) === 2 && !run.battleWon) {
        title = 'The Inner Bay'; kicker = 'ROOM 3 / 3 · ENCOUNTER';
        copy = 'The keeper is near the half-submerged freight. A reload restores the encounter entrance without consuming progress.';
        content = stats(player, run) + '<article class="gss170-card"><span class="gss170-card-label">HOSTILE NEARBY</span><h2>Mirebound Storehouse Keeper</h2><p>It guards the last intact shelves, not the missing authorization leaf.</p></article>';
        actions = button('gss170Reenter', 'Face the keeper', 'Begin production combat.', 'primary') + button('gss170Retreat', 'Return to Greyfen', 'Withdraw safely.', 'secondary');
      } else if (Number(run.room) === 3 && run.battleWon) {
        title = 'The Inner Bay'; kicker = 'ROOM 3 / 3 · ENCOUNTER WON';
        copy = 'The keeper falls among the waterlogged shelves. The dispatch is incomplete but can be carried to the Boundary Archive.';
        content = stats(player, run) + '<article class="gss170-card"><span class="gss170-card-label">RECOVERED</span><h2>Dry Peat Brick</h2><p>Combat XP and its item reward are already saved. Claim the separate report reward once to finish the delve.</p><small>The dispatch does not identify who authorized the route exception.</small></article>' +
          (player.flags?.greyfenStorehouseDispatchFound && !player.flags?.greyfenStorehouseDispatchReported ? '<article class="gss170-card gss170-card-evidence"><h2>Bring the dispatch to Mara</h2><p>After the main crossing records are filed, Mara can preserve the supply note as context; it does not identify who approved the route.</p></article>' : '');
        actions = button('gss170Collect', 'Claim the field report', 'Claim the saved gold and herb/peat reward.', 'primary') + button('gss170Return', 'Return to Greyfen', 'Leave without claiming the separate report reward.', 'secondary');
      }
      screen(head('GREYFEN · BELOW THE WATERLINE', 'The Silted Storehouse', 'A local delve through flooded freight and missing records.', typeof locationInterior === 'function' ? locationInterior('market') : '', 'dungeon'),
        scene(title, kicker, copy, content, actions));
      document.getElementById('gss170Begin')?.addEventListener('click', () => startRun(player));
      document.getElementById('gss170Retry')?.addEventListener('click', () => startRun(player));
      document.getElementById('gss170Again')?.addEventListener('click', () => startRun(player));
      document.getElementById('gss170Upper')?.addEventListener('click', () => chooseApproach('upper'));
      document.getElementById('gss170Sump')?.addEventListener('click', () => chooseApproach('sump'));
      document.getElementById('gss170ReadDispatch')?.addEventListener('click', readDispatch);
      document.getElementById('gss170Salvage')?.addEventListener('click', salvage);
      document.getElementById('gss170Fight')?.addEventListener('click', fight);
      document.getElementById('gss170Reenter')?.addEventListener('click', fight);
      document.getElementById('gss170Collect')?.addEventListener('click', claimReward);
      document.getElementById('gss170Retreat')?.addEventListener('click', retreat);
      document.getElementById('gss170Return')?.addEventListener('click', retreat);
    }
    return Object.freeze({ render });
  }
  window.LegendGreyfenStorehouseV170 = Object.freeze({ create, afterCombatWin, afterCombatDefeat, afterCombatRetreat });
})();
