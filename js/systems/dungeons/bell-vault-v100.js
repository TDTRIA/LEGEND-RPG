/* LEGEND v0.21.0 — first compact dungeon loop beneath Ashmere.
 * The Bell Cellar reuses player saves, progression, equipment records and the
 * production turn-based combat service; it does not create a parallel RPG.
 */
(() => {
  const RUN_KEY = 'bellVaultV100';

  function runFor(player) {
    player.flags = player.flags || {};
    const run = player.flags[RUN_KEY] || {};
    player.flags[RUN_KEY] = run;
    run.clears = Math.max(0, Number(run.clears || 0));
    run.attempts = Math.max(0, Number(run.attempts || 0));
    return run;
  }

  function globalSave(player) {
    const runtime = window.LegendRuntimeV120;
    if (typeof runtime?.savePlayer === 'function') return runtime.savePlayer(player);
    const storage = window.LegendStorage;
    if (typeof storage?.savePlayer === 'function') return storage.savePlayer(player);
  }

  function reopenVault() {
    if (typeof window.LegendAshmereV099?.route === 'function') {
      return window.LegendAshmereV099.route('dungeon');
    }
  }

  function afterCombatWin(player, enemy, progress) {
    if (!player) return;
    const run = runFor(player);
    if (!run.active || !run.inBattle) return;
    run.inBattle = false;
    run.battleWon = true;
    run.failed = false;
    run.room = 3;
    run.combatXp = Number(progress?.gained || 0);
    run.vaultKeeper = String(enemy?.name || 'Mirebound Sentinel');
    player.stats = player.stats || {};
    player.stats.bellVaultVictories = Number(player.stats.bellVaultVictories || 0) + 1;
    globalSave(player);
    const resultView = window.LegendRoadControllerV100?.showDungeonCombatResults;
    if (typeof resultView === 'function' && resultView({
      player, enemy, result: 'victory', progress,
      rewardName: window.LEGEND_DATA?.itemNames?.[enemy?.reward || 'fur'] || enemy?.reward || 'Furs',
      goldGained: Math.max(0, Number(player.gold || 0) - Number(enemy?.combatStartGold || 0)),
      routeStage: Number(run.room || 3), room: Number(run.room || 3)
    })) return;
    const transition = window.LegendSceneTransitionsV120?.transitionTo;
    return typeof transition === 'function' ? transition('The bell chamber falls silent', reopenVault) : reopenVault();
  }

  function afterCombatDefeat(player, enemy) {
    if (!player) return;
    const run = runFor(player);
    run.inBattle = false;
    run.active = false;
    run.failed = true;
    run.battleWon = false;
    run.lastRoom = 2;
    player.stats = player.stats || {};
    player.stats.bellVaultWithdrawals = Number(player.stats.bellVaultWithdrawals || 0) + 1;
    globalSave(player);
    const resultView = window.LegendRoadControllerV100?.showDungeonCombatResults;
    if (typeof resultView === 'function' && resultView({
      player, enemy, result: 'defeat',
      progress: { gained: 0, levels: 0, level: Number(player.level || 1) },
      rewardName: '',
      goldGained: Math.max(0, Number(player.gold || 0) - Number(enemy?.combatStartGold || 0)),
      routeStage: Number(run.lastRoom || 2), room: Number(run.lastRoom || 2)
    })) return;
    const transition = window.LegendSceneTransitionsV120?.transitionTo;
    return typeof transition === 'function' ? transition('Driven back from the bell chamber', reopenVault) : reopenVault();
  }

  function afterCombatRetreat(player, enemy) {
    if (!player) return;
    const run = runFor(player);
    run.inBattle = false;
    run.active = false;
    run.failed = false;
    run.lastRoom = 2;
    run.retreats = Number(run.retreats || 0) + 1;
    player.stats = player.stats || {};
    player.stats.dungeonRetreats = Number(player.stats.dungeonRetreats || 0) + 1;
    globalSave(player);
    return window.LegendAshmereV099?.renderAshmere?.();
  }

  function create(context = {}) {
    const { getPlayer, savePlayer, getData, escapeHtml, head, screen, locationInterior,
      awardProgress, renderTown, itemName } = context;
    if (typeof getPlayer !== 'function' || typeof savePlayer !== 'function' ||
        typeof escapeHtml !== 'function' || typeof head !== 'function' ||
        typeof screen !== 'function' || typeof getData !== 'function') return null;

    const esc = escapeHtml;
    const save = savePlayer;

    function data() { return getData() || {}; }
    function entry(name) {
      return (Array.isArray(data().weapons) ? data().weapons : []).find(x => x.id === name) || { name: 'Worn blade', min: 1, max: 3 };
    }
    function armorEntry(name) {
      return (Array.isArray(data().armors) ? data().armors : []).find(x => x.id === name) || { name: 'No armor', defense: 0 };
    }
    function loreScore(player) {
      const d = data();
      const creation = player.creationV094?.bonuses || player.creationV090?.bonuses || {};
      return Number(d.classes?.[player.className]?.mod?.lore || 0) +
        Number(d.origins?.[player.origin]?.bonus?.lore || 0) +
        Number(d.keepsakes?.[player.keepsake]?.bonus?.lore || 0) +
        Number(creation.lore || 0);
    }
    function progress(player) {
      return window.LegendProgressionV100?.status?.(player) ||
        { level: Math.max(1, Number(player.level || 1)), xp: Number(player.xp || 0), next: 100, progressPercent: 0 };
    }
    function titleMarkup(pl, title, subtitle) {
      const art = 'assets/generated/locations/bell-cellar-undercroft.webp';
      return '<div class="bell-vault-banner" style="--bell-vault-scene:url(\'' + art + '\')">' +
        '<div class="bell-vault-overline">ASHMERE · BELOW THE ARCHIVE</div>' +
        '<h1>' + esc(title) + '</h1><p>' + esc(subtitle) + '</p></div>';
    }
    function action(id, label, detail, sceneLabel, kind = '') {
      return '<button type="button" class="bell-vault-choice ' + kind + '" id="' + id +
        '" data-legend-scene-transition="' + esc(sceneLabel) + '"><strong>' + esc(label) +
        '</strong><span>' + esc(detail) + '</span><em>Continue →</em></button>';
    }
    function addDiscovery(pl, name, note) {
      const run = runFor(pl);
      run.records = Array.isArray(run.records) ? run.records : [];
      if (!run.records.some(x => x.name === name)) {
        run.records.push({ name, note, day: Number(pl.day || 1) });
      }
    }

    function startRun(pl) {
      const prior = runFor(pl);
      const clears = prior.clears;
      const attempts = prior.attempts + 1;
      pl.flags[RUN_KEY] = {
        active: true, room: 0, clears, attempts, failed: false, completed: false,
        inBattle: false, battleWon: false, tookFragment: false, enemyWeakened: false,
        reinforcedBuckleEquipped: prior.reinforcedBuckleEquipped === true,
        rewardClaimed: false, startedDay: Number(pl.day || 1), records: Array.isArray(prior.records) ? prior.records : []
      };
      save(pl);
      render();
    }

    function resolveGate(choice) {
      const pl = getPlayer(); if (!pl) return;
      const run = runFor(pl);
      if (!run.active || Number(run.room) !== 1 || run.gateApproach) return render();
      const p = progress(pl);
      const w = entry(pl.weapon), a = armorEntry(pl.armor);
      const equipmentScore = Number(p.level || 1) + Number(w.max || 3) + Number(a.defense || 0);
      let success = false, note = '';
      if (choice === 'read') {
        success = Number(p.level || 1) + loreScore(pl) >= 3;
        note = success
          ? 'The old marks resolve into a warning: the keeper answers disturbance, not sound. You find a way to cross the next chamber quietly.'
          : 'The marks will not arrange themselves into a sentence. You preserve a charcoal copy, but the delay catches in your shoulders.';
      } else {
        success = equipmentScore >= 38;
        note = success
          ? 'Your equipped ' + String(w.name || 'weapon') + ' finds the weak seam. The gate opens without a fight over every inch.'
          : 'Your ' + String(w.name || 'weapon') + ' slips against the iron. The gate opens, but the recoil bruises your arm.';
      }
      if (!success) pl.hp = Math.max(1, Number(pl.hp || 1) - 5);
      run.gateApproach = choice;
      run.gatePassed = true;
      run.enemyWeakened = success;
      run.gateNote = note;
      run.room = 2;
      addDiscovery(pl, 'The Silent Bell Gate', note);
      save(pl);
      render();
    }

    function resolveReliquary(choice) {
      const pl = getPlayer(); if (!pl) return;
      const run = runFor(pl);
      if (!run.active || Number(run.room) !== 2 || run.tookChoice) return render();
      run.tookChoice = true;
      run.tookFragment = choice === 'take';
      run.reliquaryChoice = choice;
      run.reliquaryNote = choice === 'take'
        ? 'The loose bell fragment comes free with a low, teeth-deep vibration. Something in the chamber answers it.'
        : 'You leave the fragment in its cradle and copy the carved sequence. The sentinel will have less reason to stir.';
      if (choice === 'copy') {
        addDiscovery(pl, 'The Reliquary Runes', 'You recorded the runes without disturbing the fragment. Their meaning is incomplete, but the sequence is now preserved.');
      }
      save(pl);
      render();
    }

    function beginBattle() {
      const pl = getPlayer(); if (!pl) return;
      const run = runFor(pl);
      if (!run.active || Number(run.room) !== 2 || !run.tookChoice || run.inBattle || run.battleWon) return render();
      const status = progress(pl);
      const w = entry(pl.weapon), a = armorEntry(pl.armor);
      const level = Math.max(1, Number(status.level || 1));
      let hp = 34 + level * 5 + (run.tookFragment ? 10 : 0) - (run.enemyWeakened ? 8 : 0);
      hp = Math.max(24, hp);
      const minDamage = Math.max(3, 4 + Math.floor(level / 2) + (run.tookFragment ? 1 : 0) - (run.enemyWeakened ? 1 : 0));
      const maxDamage = Math.max(minDamage + 2, 8 + level + (run.tookFragment ? 2 : 0) - (run.enemyWeakened ? 2 : 0));
      const enemy = {
        id: 'bell-vault-mirebound-sentinel', name: 'Mirebound Sentinel', behavior: 'flicker',
        hp, maxHp: hp, damage: [minDamage, maxDamage], reward: run.tookFragment ? 'bellFragment' : 'roadHerb',
        dungeonV100: true,
        text: run.enemyWeakened
          ? 'The Mirebound Sentinel rises from the bell cradle, its runes dulled by the path you found.'
          : 'The Mirebound Sentinel unfolds from the reliquary wall. Its drowned armor moves as if the bell were ringing underwater.'
      };
      run.inBattle = true;
      run.sentinelLevel = level;
      run.sentinelEquipment = { weapon: String(w.name || 'Worn blade'), armor: String(a.name || 'No armor'), score: level + Number(w.max || 3) + Number(a.defense || 0) };
      save(pl);
      const controller = window.LegendRoadControllerV100;
      if (typeof controller?.startDungeonEncounter === 'function') {
        return controller.startDungeonEncounter(enemy, run.enemyWeakened ? 'You chose your approach carefully; the sentinel is weakened.' : 'Read its intent. Your weapon and armor matter here.');
      }
      run.inBattle = false;
      run.failed = true;
      run.active = false;
      run.failureNote = 'The battle service is unavailable. Your progress is safe; return to Ashmere and refresh before retrying.';
      save(pl);
      return render();
    }

    function collectReward() {
      const pl = getPlayer(); if (!pl) return;
      const run = runFor(pl);
      if (!run.active || !run.battleWon || run.rewardClaimed) return render();
      const status = progress(pl);
      const firstClear = Number(run.clears || 0) === 0;
      const gold = 35 + Number(status.level || 1) * 7 + (run.tookFragment ? 20 : 0);
      pl.gold = Number(pl.gold || 0) + gold;
      const bonus = typeof awardProgress === 'function' ? awardProgress(pl, 25 + Number(status.level || 1) * 5) : null;
      pl.inventory = pl.inventory || {};
      if (firstClear) {
        pl.inventory.reinforcedBuckle = Number(pl.inventory.reinforcedBuckle || 0) + 1;
        run.reinforcedBuckleEquipped = true;
      } else pl.inventory.roadHerb = Number(pl.inventory.roadHerb || 0) + 1;
      run.rewardClaimed = true;
      run.completed = true;
      run.failed = false;
      run.active = false;
      run.clears = Number(run.clears || 0) + 1;
      run.completedDay = Number(pl.day || 1);
      pl.flags.bellVaultCompleted = true;
      pl.stats = pl.stats || {};
      pl.stats.bellVaultClears = Number(pl.stats.bellVaultClears || 0) + 1;
      pl.stats.dungeonDelves = Number(pl.stats.dungeonDelves || 0) + 1;
      run.lastReport = 'Bell Cellar cleared. +' + gold + ' gold and +' + (25 + Number(status.level || 1) * 5) + ' bonus XP' +
        (firstClear ? ', and a Reinforced Buckle (+6 Defense, automatically equipped).' : ', and a Road Herb.') +
        (run.tookFragment ? ' The fragment was taken from its cradle.' : ' The fragment remains undisturbed.');
      addDiscovery(pl, 'The Mirebound Reliquary', 'The sentinel has been defeated. ' + (run.tookFragment ? 'A loose bell fragment was carried out.' : 'The fragment remained in its cradle.'));
      save(pl);
      render();
    }

    function returnToTown() {
      if (typeof renderTown === 'function') return renderTown();
      return window.LegendAshmereV099?.renderAshmere?.();
    }

    function render() {
      const pl = getPlayer(); if (!pl) return;
      const run = runFor(pl);
      if (run.active && run.inBattle) { run.inBattle = false; save(pl); }
      const status = progress(pl);
      const weapon = entry(pl.weapon), armor = armorEntry(pl.armor);
      const level = Number(status.level || 1);
      const isUnlocked = !!pl.flags?.firstRoadReturnSeen;
      let title = 'The Bell Cellar', subtitle = 'A sealed stair lies beneath the old archive. Something below has been answering the town bell.';
      let story = '', choices = '', roomLabel = 'A sealed stair', roomNumber = 'ENTRY', hint = '';
      if (!isUnlocked) {
        title = 'A Sealed Stair';
        subtitle = 'The cellar will open after you complete and report your first full Old Road expedition.';
        story = '<p>Three iron bands hold the cellar door shut. The old bell-mark is worked into the stone, but the archive ledger has no entry for the stair.</p>';
        choices = '<button id="vaultReturn" type="button" class="bell-vault-secondary" data-legend-scene-transition="Returning to Ashmere">Return to the archive</button>';
      } else if (run.failed) {
        title = 'Driven from the Cellar';
        subtitle = 'You escape with your life, but the bell chamber remains below.';
        story = '<p>Your wounds have stopped you from pressing deeper. The cellar keeps its secrets; your level, equipment, and carried supplies remain yours.</p>' +
          '<div class="bell-vault-summary"><span>LEVEL</span><strong>' + level + '</strong><span>HEALTH</span><strong>' + Number(pl.hp || 0) + ' / ' + Number(pl.maxHp || 1) + '</strong></div>';
        choices = action('vaultRetry', 'Try again', 'Begin a fresh attempt. Your equipment and levels remain in effect.', 'Descending again', 'primary') +
          '<button id="vaultReturn" type="button" class="bell-vault-secondary" data-legend-scene-transition="Returning to Ashmere">Return to Ashmere</button>';
      } else if (run.completed && !run.active) {
        title = 'The Cellar Remembers';
        subtitle = 'The sentinel is quiet for now. Your first delve left a mark in the archive records.';
        story = '<p>' + esc(run.lastReport || 'Your report was recorded.') + '</p><div class="bell-vault-summary"><span>COMPLETED DELVES</span><strong>' + Number(run.clears || 0) + '</strong><span>LEVEL</span><strong>' + level + '</strong><span>XP</span><strong>' + Number(status.xp || 0) + ' / ' + Number(status.next || 100) + '</strong></div>';
        choices = action('vaultRetry', 'Descend again', 'The rooms have settled, but the keeper may wake once more.', 'Descending into the cellar', 'primary') +
          '<button id="vaultReturn" type="button" class="bell-vault-secondary" data-legend-scene-transition="Reporting back to Ashmere">Return to Ashmere</button>';
      } else if (!run.active) {
        title = 'The Bell Cellar';
        subtitle = 'A first dungeon for a world that keeps its dead and its questions close.';
        story = '<p>Below the archive, water beads on stone cut with the same worn bell-mark found along the Old Road. A few steps descend into dark, and the air below moves in slow, measured breaths.</p>' +
          '<div class="bell-vault-room-card"><span>ROOM 1 · THE SILTED STEPS</span><h2>Before the first descent</h2><p>Make sure your health is steady and that your weapon and armor are equipped. You can retreat to town between rooms.</p></div>';
        choices = action('vaultBegin', 'Enter the cellar', 'Start a new delve. The door closes behind you, but you can retreat between rooms.', 'Descending beneath the bell', 'primary') +
          '<button id="vaultReturn" type="button" class="bell-vault-secondary" data-legend-scene-transition="Returning to Ashmere">Return to Ashmere</button>';
      } else if (Number(run.room) === 0) {
        title = 'The Silted Steps'; roomLabel = 'The stairs'; roomNumber = 'ROOM 1 / 4';
        story = '<p>The steps vanish below the waterline. A dead lantern hangs from a ceiling hook, and its glass has been blackened from the inside. The stair ends at a silent iron gate.</p>' +
          '<div class="bell-vault-clue"><span>FIELD NOTE</span><strong>The same bell-mark appears below the town.</strong><small>It is older than the archive’s current ledger.</small></div>';
        choices = action('vaultDescend', 'Descend to the silent gate', 'Follow the dry edge of the steps and take stock of the old markings.', 'Entering the silent gate', 'primary') +
          '<button id="vaultRetreat" type="button" class="bell-vault-secondary" data-legend-scene-transition="Returning to Ashmere">Retreat to Ashmere</button>';
      } else if (Number(run.room) === 1) {
        title = 'The Silent Bell Gate'; roomLabel = 'The sealed threshold'; roomNumber = 'ROOM 2 / 4';
        story = '<p>A gate of black iron bears a ring of shallow grooves. There are no hinges on this side. The marks might be instructions—or a warning.</p>' +
          '<div class="bell-vault-loadout"><div><span>LEVEL</span><strong>' + level + '</strong><small>' + Number(status.xp || 0) + ' / ' + Number(status.next || 100) + ' XP</small></div><div><span>WEAPON</span><strong>' + esc(weapon.name || 'Worn blade') + '</strong><small>Power ' + Number(weapon.max || 3) + '</small></div><div><span>ARMOR</span><strong>' + esc(armor.name || 'No armor') + '</strong><small>Defense ' + Number(armor.defense || 0) + '</small></div></div>' +
          '<p class="bell-vault-choice-intro">Your level, lore, and equipped gear change how safely you pass. Either choice moves the story forward; a poor fit costs a little health, not the run.</p>';
        choices = action('vaultReadGlyphs', 'Read the bell-glyphs', 'Use lore and experience to find the old pattern. A good read weakens the keeper.', 'Studying the bell-glyphs', '') +
          action('vaultForceGate', 'Force the iron gate', 'Let your equipped weapon and armor carry the attempt. Strong gear opens it cleanly.', 'Forcing the silent gate', '') +
          '<button id="vaultRetreat" type="button" class="bell-vault-secondary" data-legend-scene-transition="Returning to Ashmere">Retreat to Ashmere</button>';
      } else if (Number(run.room) === 2 && !run.tookChoice) {
        title = 'The Drowned Reliquary'; roomLabel = 'The offering chamber'; roomNumber = 'ROOM 3 / 4';
        story = '<p>The chamber holds a small bell fragment in a cradle of pale stone. A string of runes runs from the cradle to the shape folded against the far wall. The armor there begins to stir.</p>' +
          '<div class="bell-vault-clue"><span>THE DECISION</span><strong>Take the fragment—or leave it and copy the runes.</strong><small>The fragment strengthens the sentinel, but brings an extra reward. The copied runes preserve evidence without disturbing the relic.</small></div>' +
          (run.gateNote ? '<p class="bell-vault-after-note">' + esc(run.gateNote) + '</p>' : '');
        choices = action('vaultTakeFragment', 'Take the bell fragment', 'Bring it back for study. The sentinel will grow stronger, but the fragment is worth the risk.', 'Taking the bell fragment', '') +
          action('vaultCopyRunes', 'Copy the runes instead', 'Leave the fragment in its cradle and preserve the sequence for Mara.', 'Copying the reliquary runes', '') +
          '<button id="vaultRetreat" type="button" class="bell-vault-secondary" data-legend-scene-transition="Returning to Ashmere">Retreat to Ashmere</button>';
      } else if (Number(run.room) === 2 && run.tookChoice) {
        title = 'The Drowned Reliquary'; roomLabel = 'The keeper stirs'; roomNumber = 'ROOM 3 / 4';
        story = '<p>' + esc(run.reliquaryNote || 'The sentinel begins to rise.') + '</p>' +
          '<div class="bell-vault-keeper-card"><img src="assets/generated/enemies/mirebound-sentinel.webp" alt="Mirebound Sentinel" loading="eager" decoding="async"><div><span>VAULT ENCOUNTER</span><h2>Mirebound Sentinel</h2><p>Read its intent. Your equipped weapon and armor directly affect the fight; level affects its health and damage.</p></div></div>' +
          (run.enemyWeakened ? '<p class="bell-vault-after-note">Your approach has weakened the sentinel.</p>' : '<p class="bell-vault-after-note">No weakness found. Guard its heavy wind-up and use your class technique.</p>');
        choices = action('vaultFight', 'Confront the sentinel', 'Begin turn-based combat using the game’s existing fight, guard, ACT, item, and retreat commands.', 'Entering the bell chamber', 'primary') +
          '<button id="vaultRetreat" type="button" class="bell-vault-secondary" data-legend-scene-transition="Returning to Ashmere">Retreat to Ashmere</button>';
      } else if (Number(run.room) === 3 && run.battleWon) {
        title = 'The Bell Chamber'; roomLabel = 'The reliquary'; roomNumber = 'ROOM 4 / 4';
        story = '<p>The sentinel collapses into waterlogged plates. The air is quiet, not empty; something in the old mechanism still seems to expect an answer.</p>' +
          '<div class="bell-vault-treasure"><span>RECOVERED</span><h2>' + esc(run.tookFragment ? 'Bell Fragment' : 'Reliquary Stores') + '</h2><p>' + esc(run.tookFragment ? 'You took the loose fragment. It is recorded among your spoils.' : 'The fragment stays in place. A locked supply drawer is left exposed by the sentinel’s fall.') + '</p><small>+' + (25 + level * 5) + ' bonus XP · Gold scales with level · ' + (Number(run.clears || 0) === 0 ? 'First clear: Reinforced Buckle · +6 Defense, automatically equipped' : 'Repeat clear: Road Herb') + '</small></div>';
        choices = action('vaultCollect', 'Claim the relics and return', 'Collect a persistent reward, record the discovery, and report back to Ashmere.', 'Leaving the bell chamber', 'primary');
      }
      const body = '<section class="bell-vault-v100">' +
        titleMarkup(pl, title, subtitle) +
        '<div class="bell-vault-body"><div class="bell-vault-room-heading"><span>' + esc(roomNumber) + '</span><strong>' + esc(roomLabel) + '</strong><em>OLD BELL COMPLEX</em></div>' +
        story +
        '<div class="bell-vault-actions">' + choices + '</div>' +
        '<div class="bell-vault-footer"><div><span>TRAVELER</span><strong>' + esc(pl.username || 'Traveler') + ' · LV ' + level + '</strong></div><div><span>HEALTH</span><strong>' + Number(pl.hp || 0) + ' / ' + Number(pl.maxHp || 1) + '</strong></div><div><span>GOLD</span><strong>' + Number(pl.gold || 0) + 'g</strong></div><div><span>LOADOUT</span><strong>' + esc(weapon.name || 'Worn blade') + ' / ' + esc(armor.name || 'No armor') + '</strong></div></div>' +
        '</div></section>';
      screen(head('ASHMERE · BELOW THE BELL', title, subtitle,
        typeof locationInterior === 'function' ? locationInterior('archive') : '', 'archive'), body);

      document.getElementById('vaultBegin')?.addEventListener('click', () => startRun(pl));
      document.getElementById('vaultRetry')?.addEventListener('click', () => startRun(pl));
      document.getElementById('vaultDescend')?.addEventListener('click', () => {
        const active = runFor(pl); if (!active.active || Number(active.room) !== 0) return;
        active.room = 1; save(pl); render();
      });
      document.getElementById('vaultReadGlyphs')?.addEventListener('click', () => resolveGate('read'));
      document.getElementById('vaultForceGate')?.addEventListener('click', () => resolveGate('force'));
      document.getElementById('vaultTakeFragment')?.addEventListener('click', () => resolveReliquary('take'));
      document.getElementById('vaultCopyRunes')?.addEventListener('click', () => resolveReliquary('copy'));
      document.getElementById('vaultFight')?.addEventListener('click', beginBattle);
      document.getElementById('vaultCollect')?.addEventListener('click', collectReward);
      document.getElementById('vaultRetreat')?.addEventListener('click', () => {
        const active = runFor(pl);
        active.active = false; active.failed = false; active.inBattle = false;
        active.lastRoom = Number(active.room || 0);
        active.retreats = Number(active.retreats || 0) + 1;
        save(pl); returnToTown();
      });
      document.getElementById('vaultReturn')?.addEventListener('click', returnToTown);
    }

    return Object.freeze({ render });
  }

  window.LegendBellVaultV100 = Object.freeze({ create, afterCombatWin, afterCombatDefeat, afterCombatRetreat });
})();
