/* LEGEND v0.20.38 — Oric's lantern encounter and first-road tutorial.
 * Reuses the production Old Road and combat systems. The bespoke opening target
 * has one HP so ACT is a guaranteed, tutorial-specific finishing blow.
 */
(() => {
  const ROOT = () => document.getElementById('root');
  const esc = window.LegendHtmlV120?.escapeHtml || (value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));
  const load = () => window.LegendRuntimeV120?.loadPlayer?.() || window.LegendStorage?.loadPlayer?.() || null;
  const save = player => {
    if (typeof window.LegendRuntimeV120?.savePlayer === 'function') return window.LegendRuntimeV120.savePlayer(player);
    return window.LegendStorage?.savePlayer?.(player);
  };
  const responses = Object.freeze({
    honest: {
      label: "I remember a bell. Nothing else.",
      oric: "“One bell. No tower,” Oric says. “That's what brought me out here. You're the first thing I found that was still breathing.”",
      after: "“You heard it too,” Oric says, staring at the fallen wolf. “No tower, no second toll. I'll put that aside until we're somewhere safer.”"
    },
    peaceful: {
      label: "Why were you taking my boots?",
      oric: "Oric glances at your muddy boots, then away. “Because I thought you were dead. You were cold and still. I was checking you over before the road took another body. I'm sorry.”",
      after: "“I was certain you were gone,” Oric mutters, looking at his hands. “Then you moved before I could even draw. That wolf wasn't the only impossible thing on this road.”"
    },
    defiant: {
      label: "Something came out of the ditch.",
      oric: "Oric turns toward the Blackroot ditch. “Tracks crossed here. I was going to follow them when you opened your eyes. Whatever made them may still be close.”",
      after: "“You saw it before I did,” Oric says, steadying himself against the milestone. “You may have saved my life. We'll talk about the rest in Ashmere.”"
    }
  });
  function openingState(player) {
    if (!player) return null;
    player.flags = player.flags || {};
    player.flags.openingRoadV140 = player.flags.openingRoadV140 || {};
    return player.flags.openingRoadV140;
  }
  function isActive(player) {
    const state = player?.flags?.openingRoadV140;
    return !!state && !state.completed && ['oric', 'combat', 'aftermath', 'road'].includes(state.phase);
  }
  function start(player) {
    const fresh = load() || player;
    if (!fresh) return;
    fresh.flags = fresh.flags || {};
    fresh.flags.openingRoadV140 = { phase: 'oric', response: null, completed: false, awakened: false, version: 1 };
    save(fresh);
    renderPrologue(fresh);
  }
  function renderPrologue(player) {
    const state = openingState(player);
    if (!state) return;
    ROOT().innerHTML =
      "<main class='opening-road-v140 opening-road-v140-prologue' aria-labelledby='openingPrologueTitle'>" +
        "<img class='opening-road-v140-bg' src='assets/locations/roads/location_old_road_main_v1.jpg' alt='' aria-hidden='true' onerror='this.style.display=\"none\"'>" +
        "<div class='opening-road-v140-shade' aria-hidden='true'></div>" +
        "<div class='opening-road-v140-prologue-light' aria-hidden='true'></div>" +
        "<section class='opening-road-v140-prologue-card'>" +
          "<div class='opening-road-v140-kicker'>ASHMERE’S WESTERN REACH · BEFORE DAWN</div>" +
          "<h1 id='openingPrologueTitle'>One Bell. No Tower.</h1>" +
          "<p class='opening-road-v140-prologue-lede'>A single bronze note rolls through the fog—low enough to tremble in the mud. It comes from beyond Ashmere’s lantern line, from a stretch of road where no tower stands.</p>" +
          "<div class='opening-road-v140-prologue-rule'><span>THE OLD ROAD</span><i aria-hidden='true'></i></div>" +
          "<p>The sound is gone before the gate can answer. An iron lantern hangs cold above a broken milestone. Your pack lies open in the grass, and heavy tracks cross the road from the Blackroot ditch.</p>" +
          "<blockquote><strong>THEN—SILENCE</strong><p>No tower. No second toll. Something has crossed the road, and the road has kept its secret.</p></blockquote>" +
          "<div class='opening-road-v140-actions'><button class='opening-road-v140-primary' id='openingPrologueContinue' type='button'>Lift your head <span aria-hidden='true'>→</span></button></div>" +
          "<p class='opening-road-v140-footnote'>A new journey begins beyond the lanterns. The road does not wait for you to remember.</p>" +
        "</section></main>";
    ROOT().querySelector('#openingPrologueContinue')?.addEventListener('click', () => renderOric(player));
  }
  function renderOric(player) {
    const state = openingState(player);
    if (!state) return;
    state.phase = 'oric';
    ROOT().innerHTML =
      "<main class='opening-road-v140 opening-road-v140-oric'>" +
        "<img class='opening-road-v140-bg' src='assets/locations/roads/location_old_road_main_v1.jpg' alt='' aria-hidden='true' onerror='this.style.display=\"none\"'>" +
        "<div class='opening-road-v140-shade' aria-hidden='true'></div>" +
        "<section class='opening-road-v140-card' aria-labelledby='openingRoadTitle'>" +
          "<div class='opening-road-v140-kicker'>THE OLD ROAD · BEFORE DAWN</div>" +
          "<h1 id='openingRoadTitle'>Beneath the Dead Lantern</h1>" +
          "<p class='opening-road-v140-lede'>Cold mud. A dead lantern. The bell’s single note still seems to tremble in the stones, though no tower stands on this stretch of road. Heavy tracks cross the wet road from the Blackroot ditch and vanish into the fog.</p>" +
          "<div class='opening-road-v140-scene-note'><span>CAPTAIN ORIC · ASHMERE WATCH</span><p>Oric kneels in the cold mud beside you. One hand still grips the heel of your boot; the other holds his lantern low, trying to catch the rise and fall of your chest. He had begun stripping the dead for whatever might keep someone else alive. Then your fingers moved.</p></div>" +
          "<blockquote><strong>CAPTAIN ORIC</strong><p>“Saints alive—don't move too quickly. I was taking your boots off. Found you under a dead lantern, cold as the stones and still as the others. Thought the road had given me another body. Then you breathed.”</p></blockquote>" +
          "<p class='opening-road-v140-prompt'>Oric looks genuinely shaken for a moment, then turns practical again. “There's a sound I can't explain, and tracks out of the Blackroot ditch. Tell me what you remember. Anything at all.”</p>" +
          "<div class='opening-road-v140-choices' role='group' aria-label='Your answer to Captain Oric'>" +
            "<button type='button' class='opening-road-v140-choice' data-oric-response='honest'><strong>I remember a bell. Nothing else.</strong><span>The sound was there when I woke.</span></button>" +
            "<button type='button' class='opening-road-v140-choice' data-oric-response='peaceful'><strong>Why were you taking my boots?</strong><span>Ask the one question that makes sense.</span></button>" +
            "<button type='button' class='opening-road-v140-choice' data-oric-response='defiant'><strong>What came out of that ditch?</strong><span>Fresh tracks lead to Blackroot.</span></button>" +
          "</div><p class='opening-road-v140-footnote'>Your answer changes this first exchange. It does not lock your class, origin, or future choices.</p>" +
        "</section></main>";
    ROOT().querySelectorAll('[data-oric-response]').forEach(button => button.addEventListener('click', () => chooseResponse(button.dataset.oricResponse)));
    save(player);
  }
  function chooseResponse(id) {
    const player = load();
    const line = responses[id];
    const state = openingState(player);
    if (!player || !state || !line || state.phase !== 'oric') return;
    state.response = id;
    state.phase = 'combat';
    const memory = 'When Captain Oric found you beneath the dead lantern, you answered: “' + line.label + '”';
    player.memories = Array.isArray(player.memories) ? player.memories : [];
    if (!player.memories.includes(memory)) player.memories.push(memory);
    save(player);
    if (typeof window.LegendRoadControllerV100?.startOpeningEncounter === 'function') return window.LegendRoadControllerV100.startOpeningEncounter();
    state.phase = 'oric';
    save(player);
    renderOric(player);
  }
  function battleText(player) {
    const line = responses[player?.flags?.openingRoadV140?.response] || responses.honest;
    return line.oric + ' Brush splits behind him. A Blackroot Wolf lunges from the ditch—not at you, but at Oric’s unguarded side. He hits the road stones hard. Rain swallows his shout. Then a voice with no direction, close as breath inside your skull, whispers: “Awaken.”';
  }
  function afterAmbushWin(player, enemy, progress) {
    const fresh = load() || player;
    if (!fresh) return;
    const state = openingState(fresh);
    state.phase = 'aftermath';
    state.awakened = true;
    state.openingEnemyDefeated = true;
    fresh.flags.tutorialStep = 'road';
    const memory = 'A Blackroot Wolf ambushed Captain Oric beneath the dead lantern. A voice without a face whispered “Awaken,” and you moved before you understood how.';
    fresh.memories = Array.isArray(fresh.memories) ? fresh.memories : [];
    if (!fresh.memories.includes(memory)) fresh.memories.push(memory);
    save(fresh);
    renderAftermath(fresh);
  }
  function renderAftermath(player) {
    const state = openingState(player);
    if (!state) return;
    state.phase = 'aftermath';
    const line = responses[state.response] || responses.honest;
    ROOT().innerHTML =
      "<main class='opening-road-v140'>" +
        "<img class='opening-road-v140-bg' src='assets/locations/roads/location_old_road_main_v1.jpg' alt='' aria-hidden='true' onerror='this.style.display=\"none\"'>" +
        "<div class='opening-road-v140-shade' aria-hidden='true'></div>" +
        "<section class='opening-road-v140-card opening-road-v140-aftermath' aria-labelledby='openingRoadAftermathTitle'>" +
          "<div class='opening-road-v140-kicker'>AN UNEXPECTED AWAKENING</div><h1 id='openingRoadAftermathTitle'>Oric saw what you did.</h1>" +
          "<p class='opening-road-v140-lede'>The wolf hits the road and its growl cuts off. The voice vanishes. Rain returns to the silence; Oric’s lantern sputters in the mud while he forces air back into his lungs.</p>" +
          "<div class='opening-road-v140-scene-note'><span>CAPTAIN ORIC</span><p>" + esc(line.after) + "</p></div>" +
          "<p>Oric gets his feet beneath him and turns toward the fork. “That thing came from beyond the marker. I have to warn the gate before anything else follows it. If you can move, follow the tracks and bring back proof. Or take the road straight to Ashmere. We’ll speak there.”</p>" +
          "<div class='opening-road-v140-actions'><button class='opening-road-v140-primary' id='openingRoadContinue' type='button'>Follow the road</button><button class='opening-road-v140-secondary' id='openingRoadSkip' type='button'>Go straight to Ashmere</button></div>" +
        "</section></main>";
    ROOT().querySelector('#openingRoadContinue')?.addEventListener('click', beginRoad);
    ROOT().querySelector('#openingRoadSkip')?.addEventListener('click', skipToAshmere);
    save(player);
  }
  function beginRoad() {
    const player = load();
    const state = openingState(player);
    if (!player || !state) return;
    state.phase = 'road';
    save(player);
    if (typeof window.LegendRoadControllerV100?.start === 'function') return window.LegendRoadControllerV100.start();
    renderAftermath(player);
  }
  function skipToAshmere() {
    const player = load();
    const state = openingState(player);
    if (!player || !state) return;
    state.completed = true;
    state.phase = 'skipped';
    player.flags.introV094Complete = true;
    player.flags.tutorialStep = 'people';
    save(player);
    if (window.LegendAshmereV099?.renderAshmere) return window.LegendAshmereV099.renderAshmere();
    if (window.LegendRuntimeV120?.returnToAshmere) return window.LegendRuntimeV120.returnToAshmere();
    window.LegendGameBootstrap?.continueGame?.();
  }
  function resume(player) {
    const fresh = load() || player;
    const state = fresh?.flags?.openingRoadV140;
    if (!fresh || !state || state.completed) return false;
    if (state.phase === 'oric') renderOric(fresh);
    else if (state.phase === 'combat') window.LegendRoadControllerV100?.startOpeningEncounter?.();
    else if (state.phase === 'aftermath') renderAftermath(fresh);
    else if (state.phase === 'road') {
      if (typeof window.LegendRoadControllerV100?.renderHub === 'function') window.LegendRoadControllerV100.renderHub();
      else window.LegendRoadControllerV100?.start?.();
    } else return false;
    return true;
  }
  function guide(player, roadState, stage) {
    if (!isActive(player) || player.flags.openingRoadV140.phase !== 'road' || !roadState) return '';
    const route = roadState.routeChoice;
    const hasDiscovery = Object.values(roadState.poiUsed || {}).some(Boolean);
    const hasSearch = !!roadState.searchUsed?.[0];
    let title = 'Read the road.';
    let copy = 'Your choices change the danger, the discoveries, and what you can bring back. Follow one instruction at a time; the rest of the road is yours to explore.';
    let number = 'ROAD LESSON';
    if (Number(stage) >= 5) {
      number = 'LAST STEP'; title = 'Secure what you found.';
      copy = 'You have reached the end of this stretch. Return to Ashmere to secure your rewards and report what happened.';
    } else if (Number(stage) === 0 && !route) {
      number = '01 · CHOOSE'; title = 'The road forks.';
      copy = 'Choose the safer High Ridge or risk the Reed Cut for a strange clue. This choice changes Road Pressure and what you may discover.';
    } else if (Number(stage) === 0 && route && !hasDiscovery) {
      number = '02 · DISCOVER'; title = 'Look closer.';
      copy = 'Use the glowing hotspot in the scene, then inspect the roadside marker. Discoveries can reveal evidence, supplies, or a safer line.';
    } else if (Number(stage) === 0 && route && hasDiscovery && !hasSearch) {
      number = '03 · SCAVENGE'; title = 'Search the roadside.';
      copy = 'Use Search the roadside to look for supplies. Searching can help your pack, but it can also raise Road Pressure.';
    } else if (Number(stage) === 2) {
      number = '04 · WAYSTATION'; title = 'A moment to recover.';
      copy = 'At a waystation, Rest by the Fire spends one Camp Supply or Ration to recover health and lower Road Pressure. You are not hurt badly yet, so resting is optional—continue when ready.';
    } else if (Number(stage) > 0) {
      number = 'ON THE ROAD'; title = 'Keep moving, keep watch.';
      copy = 'Travel advances the expedition. Road Pressure rises as danger builds; inspect useful landmarks, watch enemy intent in combat, and return at the final marker to secure your rewards.';
    }
    return "<aside class='opening-road-v140-guide' aria-label='Road tutorial'><div class='opening-road-v140-guide-mark'>✦</div><div><span>YOUR FIRST EXPEDITION · " +
      esc(number) + "</span><strong>" + esc(title) + "</strong><p>" + esc(copy) + "</p></div></aside>";
  }
  function travelGate(player, roadState, stage) {
    if (!isActive(player) || player.flags.openingRoadV140.phase !== 'road' || Number(stage) !== 0) return {allowed: true};
    if (!roadState?.routeChoice) return {allowed: false, message: 'Choose High Ridge or Reed Cut before leaving the fork.'};
    if (!Object.values(roadState.poiUsed || {}).some(Boolean)) return {allowed: false, message: 'Inspect the roadside marker first. The scene hotspot is marked “Look closer.”'};
    if (!roadState.searchUsed?.[0]) return {allowed: false, message: 'Search this stretch for something useful before travelling on.'};
    return {allowed: true};
  }
  function complete(player, reason = 'complete') {
    const state = openingState(player);
    if (!state) return;
    state.completed = true;
    state.phase = reason === 'abandoned' ? 'skipped' : 'complete';
    player.flags = player.flags || {};
    player.flags.introV094Complete = true;
    player.flags.tutorialStep = 'people';
    save(player);
  }
  window.LegendRoadOpeningV140 = Object.freeze({start,resume,isActive,battleText,afterAmbushWin,guide,travelGate,complete});
})();
