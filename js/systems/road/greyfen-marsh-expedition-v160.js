/* LEGEND v0.24.0 — Greyfen Marsh Path expedition.
 * Reuses the player save, progression, combat and encounter-result systems.
 * This route has its own state so it cannot reset or advance the Old Road.
 */
(() => {
  const RT = () => window.LegendRuntimeV120 || {};
  const A = () => window.LegendAssetsV090 || {};
  const D = () => window.LEGEND_DATA || {};
  const content = () => window.LegendGreyfenMarshContentV160 || {};
  const root = () => document.getElementById('root');
  const esc = window.LegendHtmlV120?.escapeHtml || (value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])));
  const player = () => RT().loadPlayer?.() || null;
  const save = pl => RT().savePlayer?.(pl);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const rules = window.LegendRoadStateV100?.create({
    getData: () => D(),
    clamp
  });
  const audio = () => window.LegendRoadAudioV100 || {};
  const journalKey = 'greyfenMarshFieldJournalV160';

  function ensure(pl) {
    if (!pl) return null;
    pl.flags = pl.flags || {};
    const s = pl.flags.greyfenMarshExpeditionV160 || (pl.flags.greyfenMarshExpeditionV160 = {});
    s.active = Boolean(s.active);
    s.trips = Math.max(0, Math.floor(Number(s.trips || 0)));
    s.stage = clamp(Math.floor(Number(s.stage || 0)), 0, 5);
    s.pressure = clamp(Number(s.pressure || 0), 0, 100);
    s.hoursElapsed = Math.max(0, Number(s.hoursElapsed || 0));
    s.routeChoice = ['raised', 'reeds'].includes(s.routeChoice) ? s.routeChoice : null;
    ['visitedNodeIds', 'discoveredNodeIds', 'completedInteractionIds'].forEach(key => {
      s[key] = Array.isArray(s[key]) ? [...new Set(s[key].filter(value => typeof value === 'string'))] : [];
    });
    s.activeSideTrip = s.activeSideTrip === 'fallen-ferry' ? 'fallen-ferry' : null;
    s.sideTripReturnNode = typeof s.sideTripReturnNode === 'string' ? s.sideTripReturnNode : null;
    s.sluiceCleared = Boolean(s.sluiceCleared);
    s.encounterAvoided = Boolean(s.encounterAvoided);
    s.encounterRetreated = Boolean(s.encounterRetreated);
    s.ferryRaiderDefeated = Boolean(s.ferryRaiderDefeated);
    s.ferryRaiderAvoided = Boolean(s.ferryRaiderAvoided);
    s.shelterRested = Boolean(s.shelterRested);
    s.gaugeInspected = Boolean(s.gaugeInspected);
    return s;
  }

  function has(list, id) { return Array.isArray(list) && list.includes(id); }
  function add(list, id) { if (id && !list.includes(id)) list.push(id); }
  function addInventory(pl, item, amount = 1) {
    pl.inventory = pl.inventory || {};
    pl.inventory[item] = Math.max(0, Number(pl.inventory[item] || 0) + Number(amount || 0));
  }
  function addHours(pl, s, hours = 1) {
    s.hoursElapsed = Math.max(0, Number(s.hoursElapsed || 0) + Number(hours || 0));
    s.lastActivityDay = Math.max(1, Number(pl.day || 1));
  }
  function journalFor(pl) {
    pl.flags = pl.flags || {};
    const journal = pl.flags[journalKey] || (pl.flags[journalKey] = { trips: [], discoveries: [], visitedPlaces: [] });
    journal.trips = Array.isArray(journal.trips) ? journal.trips : [];
    journal.discoveries = Array.isArray(journal.discoveries) ? journal.discoveries : [];
    journal.visitedPlaces = Array.isArray(journal.visitedPlaces) ? journal.visitedPlaces : [];
    return journal;
  }
  function discover(pl, s, id, name, note) {
    const graph = content();
    const node = (graph.stops || []).find(stop => stop.id === id);
    if (!node) return;
    add(s.discoveredNodeIds, id);
    const journal = journalFor(pl);
    const exists = journal.discoveries.some(item => item.trip === s.trips && item.key === id);
    if (!exists) {
      journal.discoveries.push({
        key: id, name: name || node.name, place: node.name, note: note || node.description,
        route: s.routeChoice || 'unselected', trip: s.trips, day: Number(pl.day || 1)
      });
    }
    add(journal.visitedPlaces, node.name);
  }
  function visit(pl, s, id) {
    add(s.visitedNodeIds, id);
    // Every visited landmark becomes known on the field map, while only
    // meaningful evidence and interaction notes are added to the journal.
    add(s.discoveredNodeIds, id);
    s.currentNodeId = id;
    const node = (content().stops || []).find(stop => stop.id === id);
    if (node && !node.optional) add(journalFor(pl).visitedPlaces, node.name);
  }
  function currentNodeId(s) {
    if (s.activeSideTrip) return s.activeSideTrip;
    if (Number(s.stage) <= 0) return 'landing';
    if (Number(s.stage) === 1) {
      if (s.routeChoice === 'raised') return 'raised-posts';
      if (s.routeChoice === 'reeds') return 'reed-bed';
      return 'fork';
    }
    if (Number(s.stage) === 2) return 'flooded-sluice';
    if (Number(s.stage) === 3) return 'mossbarrow-shelter';
    if (Number(s.stage) === 4) return 'waterline-gauge';
    return 'greyfen-landing';
  }
  function stopFor(pl, s) {
    const id = currentNodeId(s);
    return (content().stops || []).find(stop => stop.id === id) ||
      { id: 'landing', name: 'Greyfen Landing', stage: 0, description: 'The marsh waits beyond the pilings.' };
  }
  function markCurrent(pl, s) {
    const id = currentNodeId(s);
    visit(pl, s, id);
    return id;
  }
  function returnToGreyfen() {
    const host = root();
    if (host) host.innerHTML = '';
    if (window.LegendAshmereV099?.renderAshmere) return window.LegendAshmereV099.renderAshmere();
    return RT().returnToAshmere?.();
  }
  function beginNewTrip(pl) {
    const s = ensure(pl);
    s.active = true;
    s.trips += 1;
    s.stage = 0;
    s.pressure = 0;
    s.hoursElapsed = 0;
    s.routeChoice = null;
    s.visitedNodeIds = [];
    s.discoveredNodeIds = [];
    s.completedInteractionIds = [];
    s.activeSideTrip = null;
    s.sideTripReturnNode = null;
    s.sluiceCleared = false;
    s.encounterAvoided = false;
    s.encounterRetreated = false;
    s.ferryRaiderDefeated = false;
    s.ferryRaiderAvoided = false;
    s.shelterRested = false;
    s.gaugeInspected = false;
    s.failed = false;
    s.startedDay = Math.max(1, Number(pl.day || 1));
    s.currentNodeId = 'landing';
    pl.flags.greyfenMarshStarted = true;
    visit(pl, s, 'landing');
    save(pl);
  }
  function start() {
    const pl = player();
    if (!pl) return;
    if (String(pl.currentRegion || 'Ashmere') !== 'Greyfen') {
      return renderNotice('The Marsh Path begins at Greyfen Landing. Travel to Greyfen before setting out.');
    }
    const s = ensure(pl);
    if (!s.active) beginNewTrip(pl);
    return render();
  }
  function renderNotice(message) {
    const host = root();
    if (!host) return;
    host.innerHTML =
      '<main class="gfm160-page" aria-label="Greyfen Marsh Path notice"><section class="gfm160-panel"><span class="gfm160-kicker">GREYFEN · FIELD NOTICE</span><h1>Marsh Path</h1><p>' + esc(message) + '</p><button class="gfm160-action is-primary" id="gfm160NoticeReturn" type="button">Return to Greyfen</button></section></main>';
    document.getElementById('gfm160NoticeReturn')?.addEventListener('click', returnToGreyfen);
  }
  function routeChoiceMarkup(pl, s) {
    if (s.routeChoice) {
      const option = content().routeOptions?.[s.routeChoice] || {};
      const routeName = option.label || (s.routeChoice === 'raised' ? 'Raised Posts' : 'Reed Bed');
      const optional = s.routeChoice === 'reeds' && !has(s.visitedNodeIds, 'fallen-ferry')
        ? '<section class="gfm160-optional"><span class="gfm160-kicker">OPTIONAL DETOUR</span><h3>Fallen Ferry</h3><p>A broken ferry still holds one usable cloth bundle above the waterline.</p><p><strong>Cost:</strong> 1 hour and +5 Road Pressure. <strong>Reward:</strong> 1 Cloth Scrap.</p><button class="gfm160-action" id="gfm160VisitFerry" type="button">Inspect the Fallen Ferry</button></section>'
        : s.routeChoice === 'reeds' && has(s.visitedNodeIds, 'fallen-ferry')
          ? '<p class="gfm160-note" role="status">Fallen Ferry visited. Its salvage is recorded; the detour can be skipped on later trips.</p>' : '';
      return '<section class="gfm160-route-selected"><span class="gfm160-kicker">ROUTE RECORDED</span><h3>' + esc(routeName) + '</h3><p>' + esc(option.description || '') + '</p><p><strong>Route effect:</strong> ' + esc(option.consequence || '') + '.</p><p><strong>Field reward:</strong> ' + esc(option.reward || 'No extra supplies') + '.</p>' +
        optional + '<button class="gfm160-action is-primary" id="gfm160Continue" type="button">Continue to the Flooded Sluice <span aria-hidden="true">→</span></button></section>';
    }
    const options = content().routeOptions || {};
    const raised = options.raised || {}, reeds = options.reeds || {};
    const canReed = Number(pl.inventory?.food || 0) >= Number(reeds.supplyAmount || 1);
    const notice = pl.flags?.greyfenNoticePressureCreditV261
      ? '<p class="gfm160-note" role="status">A provisional safety notice is posted. Your first route choice gains up to 5 less Road Pressure, once.</p>'
      : '';
    return '<section class="gfm160-route-choices" aria-label="Choose a Greyfen route"><span class="gfm160-kicker">THE SPLIT CAUSEWAY</span><h3>Which line will you take?</h3><p>Both routes rejoin at the Flooded Sluice. The survey and the route home do not depend on which one you choose.</p>' + notice +
      '<button class="gfm160-route-option" id="gfm160ChooseRaised" type="button"><span class="gfm160-route-number">01</span><span><strong>Raised Posts</strong><small>Stable timber above the mud; slower but easier to read.</small><em>Cost: 1 hour · no supplies</em><em>Effect: +4 Road Pressure</em><em>Reward: 1 Dry Peat Brick</em></span><b aria-hidden="true">→</b></button>' +
      '<button class="gfm160-route-option" id="gfm160ChooseReeds" type="button" ' + (canReed ? '' : 'disabled') + '><span class="gfm160-route-number">02</span><span><strong>Reed Bed</strong><small>A faster lowland cut with soft ground and poor visibility.</small><em>Cost: 1 Ration · 1 hour</em><em>Effect: +12 Road Pressure; harder to avoid an encounter</em><em>Reward: 1 Road Herb</em>' + (canReed ? '' : '<em>Requires 1 Ration; the safer posts remain open.</em>') + '</span><b aria-hidden="true">→</b></button></section>';
  }
  function chooseRoute(id) {
    const pl = player(); if (!pl) return;
    const s = ensure(pl), option = content().routeOptions?.[id];
    if (!s.active || Number(s.stage) !== 1 || !option) return render('That route choice is no longer available.');
    if (id === 'reeds' && Number(pl.inventory?.food || 0) < Number(option.supplyAmount || 1)) {
      return render('You need one Ration for the Reed Bed. Raised Posts remain available without supplies.');
    }
    if (option.supply) pl.inventory[option.supply] = Math.max(0, Number(pl.inventory[option.supply] || 0) - Number(option.supplyAmount || 1));
    s.routeChoice = id;
    addHours(pl, s, option.hours || 1);
    const authoredPressure = Math.max(0, Number(option.pressure || 0));
    const hasNoticeCredit = pl.flags?.greyfenNoticePressureCreditV261 === true;
    const pressureRelief = hasNoticeCredit ? Math.min(5, authoredPressure) : 0;
    s.pressure = clamp(Number(s.pressure || 0) + Math.max(0, authoredPressure - pressureRelief), 0, 100);
    if (hasNoticeCredit) {
      pl.flags.greyfenNoticePressureCreditV261 = false;
      pl.flags.greyfenNoticePressureUsedV261 = true;
    }
    const nodeId = id === 'raised' ? 'raised-posts' : 'reed-bed';
    visit(pl, s, nodeId);
    discover(pl, s, nodeId, option.label, option.description + ' ' + option.consequence +
      (hasNoticeCredit ? ' A provisional safety notice reduced the Road Pressure increase by ' + pressureRelief + '.' : '') + '.');
    addInventory(pl, option.item, 1);
    pl.stats = pl.stats || {};
    pl.stats.greyfenMarshRoutes = Number(pl.stats.greyfenMarshRoutes || 0) + 1;
    save(pl);
    return render('You commit to ' + option.label + '. The cost and route effect are now recorded.' +
      (hasNoticeCredit ? ' The provisional safety notice reduced this route’s Road Pressure increase by ' + pressureRelief + '.' : ''));
  }
  function visitFerry() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 1 || s.routeChoice !== 'reeds' || has(s.visitedNodeIds, 'fallen-ferry')) {
      return render('The Fallen Ferry is not available from your current position.');
    }
    s.sideTripReturnNode = 'reed-bed';
    s.activeSideTrip = 'fallen-ferry';
    visit(pl, s, 'fallen-ferry');
    addHours(pl, s, 1);
    s.pressure = clamp(Number(s.pressure || 0) + 5, 0, 100);
    addInventory(pl, 'clothScrap', 1);
    discover(pl, s, 'fallen-ferry', 'Cloth recovered at the Fallen Ferry', 'One usable cloth bundle was salvaged above the waterline. The rest of the ferry remains submerged.');
    save(pl);
    return render('You recover one Cloth Scrap from the Fallen Ferry. The detour cost one hour and five Road Pressure.');
  }
  function returnFromFerry() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (s.activeSideTrip !== 'fallen-ferry') return render();
    s.activeSideTrip = null;
    s.sideTripReturnNode = null;
    s.currentNodeId = 'reed-bed';
    save(pl);
    return render('You return to the Reed Bed. The ferry salvage is saved; the waterline survey remains ahead.');
  }
  function moveToSluice() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 1 || !s.routeChoice) return render('Choose a route before leaving the causeway.');
    s.stage = 2;
    visit(pl, s, 'flooded-sluice');
    save(pl);
    return render('The paths converge at the Flooded Sluice.');
  }
  function passSluice() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 2 || s.sluiceCleared || s.encounterAvoided) return render();
    s.encounterAvoided = true;
    s.pressure = clamp(Number(s.pressure || 0) + 8, 0, 100);
    save(pl);
    return render('You keep your distance from the wisp and cross the sluice without a fight. Road Pressure rises by 8.');
  }
  function moveToShelter() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 2 || (!s.sluiceCleared && !s.encounterAvoided)) return render('The sluice still needs to be crossed. Face the wisp or take the disclosed pressure cost to pass it.');
    s.stage = 3;
    visit(pl, s, 'mossbarrow-shelter');
    save(pl);
    return render('Mossbarrow Shelter offers a dry pause above the floodline.');
  }
  function restAtShelter() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 3 || s.shelterRested) return render('You have already rested at Mossbarrow Shelter on this trip.');
    const camp = Number(pl.inventory?.camp || 0), food = Number(pl.inventory?.food || 0);
    const supply = camp > 0 ? 'camp' : food > 0 ? 'food' : null;
    if (!supply) return render('You need one Camp Supply or one Ration to rest here. You may continue without resting.');
    pl.inventory[supply] = Math.max(0, Number(pl.inventory[supply] || 0) - 1);
    const healed = Math.min(Math.ceil(Number(pl.maxHp || 1) * 0.2), Math.max(0, Number(pl.maxHp || 1) - Number(pl.hp || 0)));
    pl.hp = Number(pl.hp || 0) + healed;
    s.pressure = clamp(Number(s.pressure || 0) - 12, 0, 100);
    s.shelterRested = true;
    addHours(pl, s, 1);
    visit(pl, s, 'mossbarrow-shelter');
    discover(pl, s, 'mossbarrow-shelter', 'Mossbarrow Shelter', 'You used one field supply to rest above the waterline, recovering ' + healed + ' HP and lowering Road Pressure by 12.');
    save(pl);
    return render('You rest at Mossbarrow Shelter, recover ' + healed + ' HP, and lower Road Pressure by 12.');
  }
  function moveToGauge() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 3) return render('The Waterline Gauge is still ahead.');
    s.stage = 4;
    visit(pl, s, 'waterline-gauge');
    save(pl);
    return render('The old gauge rises from the peat beside the final marker.');
  }
  function inspectGauge() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 4 || s.gaugeInspected) return render();
    s.gaugeInspected = true;
    addHours(pl, s, 1);
    discover(pl, s, 'waterline-gauge', 'The Waterline Gauge', 'The newest notch is a clean cut made by hand. It records a height, but does not identify who marked it or explain why.');
    pl.flags.greyfenWaterlineGaugeRead = true;
    pl.memories = Array.isArray(pl.memories) ? pl.memories : [];
    const memory = 'On the Greyfen Marsh Path, you inspected the Waterline Gauge. Its newest notch is a clean cut made by hand; the gauge records a height but does not identify who marked it or explain why.';
    if (!pl.memories.includes(memory)) pl.memories.push(memory);
    save(pl);
    return render('You record the Waterline Gauge. The height is evidence; the maker and reason remain unknown.');
  }
  function settle(complete = false, failed = false) {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active && s.lastResultV160) return renderResult(pl, s.lastResultV160);
    const completed = Boolean(complete && Number(s.stage) === 4 && s.gaugeInspected);
    const goldGained = completed ? 35 : 0;
    const xp = completed ? 35 : Number(s.stage || 0) >= 2 ? 10 : 0;
    if (goldGained) pl.gold = Math.max(0, Number(pl.gold || 0)) + goldGained;
    let progress = { gained: 0, levels: 0, level: Number(pl.level || 1) };
    if (xp > 0) progress = window.LegendProgressionV100?.award?.(pl, xp) || progress;
    s.active = false;
    s.failed = Boolean(failed);
    s.currentNodeId = 'greyfen-landing';
    pl.flags.greyfenMarshPathComplete = Boolean(pl.flags.greyfenMarshPathComplete || completed);
    pl.flags.greyfenMarshReported = Boolean(pl.flags.greyfenMarshReported || completed);
    pl.stats = pl.stats || {};
    pl.stats.greyfenMarshExpeditions = Number(pl.stats.greyfenMarshExpeditions || 0) + 1;
    if (completed) pl.stats.greyfenMarshClears = Number(pl.stats.greyfenMarshClears || 0) + 1;
    if (s.gaugeInspected) {
      const memory = 'You returned from Greyfen’s Marsh Path with a Waterline Gauge reading. The latest notch was cut by hand; its author and purpose remain unknown.';
      pl.memories = Array.isArray(pl.memories) ? pl.memories : [];
      if (!pl.memories.includes(memory)) pl.memories.push(memory);
    }
    const report = {
      complete: completed,
      failed: Boolean(failed),
      trip: Number(s.trips || 1),
      route: s.routeChoice === 'raised' ? 'Raised Posts' : s.routeChoice === 'reeds' ? 'Reed Bed' : 'Route not chosen',
      stagesReached: clamp(Number(s.stage || 0) + 1, 1, 5),
      goldGained,
      xpGained: Number(progress?.gained || 0),
      levelsGained: Number(progress?.levels || 0),
      levelBefore: Math.max(1, Number(pl.level || 1) - Number(progress?.levels || 0)),
      levelAfter: Math.max(1, Number(pl.level || 1)),
      pressure: Number(s.pressure || 0),
      hoursElapsed: Number(s.hoursElapsed || 0),
      discoveries: (journalFor(pl).discoveries || []).filter(item => item.trip === s.trips).map(item => item.name || item.place),
      items: s.routeChoice === 'raised' ? 'Dry Peat Brick' : s.routeChoice === 'reeds' ? 'Road Herb' : 'No route supply secured',
      shelterRested: Boolean(s.shelterRested),
      gaugeInspected: Boolean(s.gaugeInspected)
    };
    s.lastResultV160 = report;
    journalFor(pl).trips.push(report);
    save(pl);
    return renderResult(pl, report);
  }
  function renderResult(pl, report) {
    const host = root(); if (!host) return;
    const art = A().locations?.greyfenMarshWalkway || A().locations?.greyfenMain || '';
    const discoveries = (report.discoveries || []).length
      ? '<ul>' + report.discoveries.map(name => '<li>' + esc(name) + '</li>').join('') + '</ul>'
      : '<p>No landmark was recorded on this outing.</p>';
    host.innerHTML =
      '<main class="gfm160-page gfm160-results" aria-label="Marsh expedition results">' +
        '<div class="gfm160-results-art">' + (art ? '<img src="' + esc(art) + '" alt="" aria-hidden="true">' : '') + '<div></div></div>' +
        '<section class="gfm160-results-panel">' +
          '<span class="gfm160-kicker">GREYFEN · FIELD REPORT · TRIP ' + Number(report.trip || 1) + '</span>' +
          '<h1>' + (report.complete ? 'The Marsh Yields Its Record' : report.failed ? 'Driven Back from the Marsh' : 'A Field Report from the Marsh') + '</h1>' +
          '<p>' + (report.complete ? 'You returned with a reading from the Waterline Gauge. It records a mark—not the identity or intent of whoever cut it.' : 'You left the marsh before the complete survey. Supplies and discoveries you already secured remain yours.') + '</p>' +
          '<div class="gfm160-report-metrics">' +
            '<div><span>ROUTE</span><strong>' + esc(report.route) + '</strong></div>' +
            '<div><span>STOPS</span><strong>' + Number(report.stagesReached || 1) + ' / 5</strong></div>' +
            '<div><span>FIELD TIME</span><strong>' + Number(report.hoursElapsed || 0) + ' hours</strong></div>' +
            '<div><span>ROAD PRESSURE</span><strong>' + Number(report.pressure || 0) + '</strong></div>' +
            '<div><span>GOLD</span><strong>+' + Number(report.goldGained || 0) + 'g</strong></div>' +
            '<div><span>EXPERIENCE</span><strong>+' + Number(report.xpGained || 0) + ' XP</strong></div>' +
          '</div>' +
          '<section class="gfm160-report-findings" aria-label="Field discoveries"><h2>Recorded Findings</h2>' + discoveries + '<p><strong>Route supply:</strong> ' + esc(report.items || 'None') + '</p><p><strong>Shelter:</strong> ' + (report.shelterRested ? 'Rested at Mossbarrow Shelter' : 'No shelter rest recorded') + '</p><p><strong>Waterline Gauge:</strong> ' + (report.gaugeInspected ? 'Reading saved' : 'Not reached or not inspected') + '</p></section>' +
          '<div class="gfm160-report-actions"><button class="gfm160-action is-primary" id="gfm160ResultReturn" data-legend-scene-transition="Returning to Greyfen" type="button">Return to Greyfen <span aria-hidden="true">→</span></button><button class="gfm160-action" id="gfm160ResultAgain" type="button">Plan another outing</button></div>' +
        '</section></main>';
    document.getElementById('gfm160ResultReturn')?.addEventListener('click', returnToGreyfen);
    document.getElementById('gfm160ResultAgain')?.addEventListener('click', () => { sNotAvailable(); });
  }
  function sNotAvailable() {
    // Keep repeated outings routed through the town so players can rest, trade or report first.
    return returnToGreyfen();
  }
  function combatResult(payload) {
    const pl = payload.player || player(); if (!pl) return false;
    const s = ensure(pl);
    const victory = payload.result !== 'defeat';
    if (victory) {
      s.sluiceCleared = true;
      add(s.completedInteractionIds, 'flooded-sluice');
      discover(pl, s, 'flooded-sluice', 'The Wisp at the Sluice', 'You drove the pale wisp from the sluice. The water kept moving; no answer came with it.');
      // Combat victory advances directly to stage 3, so record the shelter visit
      // here just as the non-combat crossing path does in moveToShelter().
      if (Number(s.stage) === 3) visit(pl, s, 'mossbarrow-shelter');
      pl.stats = pl.stats || {};
      pl.stats.greyfenMarshVictories = Number(pl.stats.greyfenMarshVictories || 0) + 1;
      save(pl);
    } else {
      s.active = false;
      s.failed = true;
      save(pl);
    }
    const resultView = window.LegendRoadCombatResultsViewV152;
    if (!resultView?.create) return false;
    const view = resultView.create({
      renderShell: html => { const host = root(); if (host) host.innerHTML = html; },
      getAssets: A,
      escapeHtml: esc,
      onContinue: () => render(victory ? 'The wisp is gone; Mossbarrow Shelter lies ahead.' : ''),
      onReturnToTown: () => victory ? settle(false) : returnToGreyfen()
    });
    return view?.render({
      ...payload,
      locationName: 'GREYFEN MARSH PATH',
      sceneArtKey: 'greyfenMarshWalkway',
      resultSubtitle: victory
        ? 'The sluice is passable. The marsh has yielded another observation, not an explanation.'
        : 'The marsh has driven you back. Return to Greyfen, recover, and prepare before another outing.',
      progressLabel: 'MARSH MILE',
      progressValue: Math.min(5, Number(s.stage || 0) + 1) + ' / 5',
      progressHint: victory ? 'The sluice is passable' : 'The outing was cut short',
      rewardName: victory ? (payload.rewardName || 'Wisp Ash') : '',
      primaryTitle: victory ? 'Continue to Mossbarrow Shelter' : 'Return to Greyfen',
      primaryHint: victory ? 'Keep the route and field notes' : 'Recover and prepare before another outing',
      primaryTransition: victory ? 'Continuing along the marsh path' : 'Returning to Greyfen',
      secondaryTitle: victory ? 'Return to Greyfen' : 'Begin another outing',
      secondaryHint: victory ? 'End this outing and bring your notes home' : 'Start fresh from the town landing',
      secondaryTransition: victory ? 'Returning to Greyfen' : 'Starting another outing',
      onContinue: () => render(victory ? 'The wisp is gone; Mossbarrow Shelter lies ahead.' : ''),
      onReturn: () => victory ? settle(false) : returnToGreyfen(),
      onSecondary: () => victory ? settle(false) : start()
    }) === true;
  }
  function showFerryRaiderResults(payload = {}) {
    const pl = payload.player || player(); if (!pl) return false;
    const s = ensure(pl);
    const victory = payload.result !== 'defeat';
    const inventoryBefore = payload.enemy?.combatStartInventory || {};
    const recoveredItems = victory ? Object.keys(pl.inventory || {}).map(item => ({
      item, count: Number(pl.inventory[item] || 0) - Number(inventoryBefore[item] || 0)
    })).filter(drop => drop.count > 0).map(drop => (D().itemNames?.[drop.item] || drop.item) + (drop.count > 1 ? ' ×' + drop.count : '')) : [];
    if (victory) {
      s.ferryRaiderDefeated = true;
      add(s.completedInteractionIds, 'fallen-ferry-raider');
      discover(pl, s, 'fallen-ferry', 'The Ferry Ambush', 'A marsh raider tried to claim the salvage. The traveler drove them off and recovered the supplies.');
      pl.stats = pl.stats || {};
      pl.stats.greyfenMarshRaiderVictories = Number(pl.stats.greyfenMarshRaiderVictories || 0) + 1;
    } else {
      s.ferryRaiderAvoided = true;
      s.pressure = clamp(Number(s.pressure || 0) + (payload.wasRetreat ? 4 : 6), 0, 100);
    }
    save(pl);
    const view = window.LegendRoadCombatResultsViewV152?.create({
      renderShell: html => { const host = root(); if (host) host.innerHTML = html; },
      getAssets: A,
      escapeHtml: esc,
      onContinue: () => render(victory ? 'The raider is gone. Return to the Reed Bed when ready.' : 'You escape the ferry ambush. Return to the Reed Bed when ready.'),
      onReturnToTown: () => settle(false)
    });
    return view?.render({
      ...payload,
      locationName: 'GREYFEN · FALLEN FERRY',
      sceneArtKey: 'greyfenMarshWalkway',
      resultTitle: payload.wasRetreat ? 'You Slip the Ambush' : victory ? 'The Ambusher Falls Back' : 'Driven Back',
      resultSubtitle: victory
        ? 'The raider wanted the ferry salvage. The path is clear, but Greyfen has more than one kind of threat.'
        : payload.wasRetreat
          ? 'You choose to live and retreat through the reeds. Road Pressure rises by 4.'
          : 'The raider forces you off the ferry. You survive, but the detour grows more dangerous.',
      progressLabel: 'OPTIONAL DETOUR',
      progressValue: victory ? 'CLEARED' : 'WITHDRAWN',
      progressHint: victory ? 'Ferry salvage secured' : 'You can continue the survey',
      rewardName: victory ? (recoveredItems.join(' · ') || payload.rewardName || 'Marsh Salvage') : '',
      primaryTitle: 'Return to the Fallen Ferry',
      primaryHint: 'The waterline survey remains ahead',
      primaryTransition: 'Returning to the Fallen Ferry',
      secondaryTitle: victory ? 'Return to Greyfen' : 'End the outing',
      secondaryHint: 'Bring the salvaged notes back to town',
      secondaryTransition: 'Returning to Greyfen',
      onContinue: () => render(victory ? 'The raider is gone. Return to the Reed Bed when ready.' : 'You escape the ferry ambush. Return to the Reed Bed when ready.'),
      onReturn: () => victory ? settle(false) : render('You escape the ferry ambush. Return to the Reed Bed when ready.'),
      onSecondary: () => settle(false)
    }) === true;
  }
  function startFerryAmbush() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || s.activeSideTrip !== 'fallen-ferry' || s.ferryRaiderDefeated || s.ferryRaiderAvoided) {
      return render('No marsh raider is waiting at the Fallen Ferry now.');
    }
    const enemy = {
      id: 'greyfen-ferry-raider-v201',
      name: 'Greyfen Marsh Raider',
      behavior: 'bandit',
      hp: 56, maxHp: 56, damage: [8, 13],
      reward: 'tornHide', xp: 36, goldDrop: [5, 14],
      bonusDrop: { item: 'marshParcel', chance: 18, amount: [1, 1] },
      turn: 0, intent: 'guardbreak', specialEncounterV200: true,
      art: 'assets/generated/classes/class-ranger.webp'
    };
    const context = {
      getPlayer: player,
      savePlayer: save,
      getAssets: A,
      getLocationLabel: () => 'GREYFEN · FALLEN FERRY',
      getWeapon: record => rules?.weapon(record) || { name: 'Hands', min: 1, max: 3 },
      getArmor: record => rules?.armor(record) || { name: 'No Armor', defense: 0 },
      score: (record, skill) => rules?.score(record, skill) || 0,
      ensureState: () => ({ stage: 1, pressure: Number(s.pressure || 0), poiUsed: {} }),
      hpPercent: record => rules?.hpPercent(record) ?? 100,
      escapeHtml: esc, clamp, randomInt: rand, addInventory,
      itemName: id => rules?.itemName(id) || D().itemNames?.[id] || id,
      renderShell: html => { const host = root(); if (host) host.innerHTML = html; },
      renderExpedition: note => render(note || ''),
      outcome: (title, text, kicker) => render(String(title || 'Encounter') + ': ' + String(text || kicker || '')),
      soundOn: () => audio().soundOn?.() ?? true,
      startMusic: () => audio().startBattleMusic?.(),
      stopMusic: () => audio().stopBattleMusic?.(),
      playBattleFx: kind => audio().playBattleFx?.(kind),
      tone: kind => audio().tone?.(kind),
      toggleSound: () => audio().toggleSound?.(),
      awardProgress: (record, amount) => window.LegendProgressionV100?.award(record, amount),
      showCombatResults: payload => showFerryRaiderResults(payload),
      onSpecialEncounterWin: (record, foe, progress) => showFerryRaiderResults({
        player: record, enemy: foe, result: 'victory', progress,
        rewardName: (D().itemNames?.[foe.reward] || foe.reward || 'Marsh Salvage'),
        goldGained: Math.max(0, Number(record.gold || 0) - Number(foe.combatStartGold || 0))
      }),
      onSpecialEncounterDefeat: (record, foe) => showFerryRaiderResults({
        player: record, enemy: foe, result: 'defeat', progress: { gained: 0, levels: 0, level: Number(record.level || 1) },
        rewardName: '', goldGained: 0
      }),
      onSpecialEncounterRetreat: (record, foe) => showFerryRaiderResults({
        player: record, enemy: foe, result: 'defeat', wasRetreat: true,
        progress: { gained: 0, levels: 0, level: Number(record.level || 1) },
        rewardName: '', goldGained: 0
      })
    };
    return window.LegendRoadCombatV100?.start(context, enemy, 'Wet bootprints run from the wreck into the reeds. A Greyfen Marsh Raider steps out to claim the salvage.');
  }
  function avoidFerryAmbush() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || s.activeSideTrip !== 'fallen-ferry' || s.ferryRaiderDefeated || s.ferryRaiderAvoided) return render();
    s.ferryRaiderAvoided = true;
    s.pressure = clamp(Number(s.pressure || 0) + 4, 0, 100);
    save(pl);
    return render('You slip away from the raider without a fight. Road Pressure rises by 4.');
  }
  function startEncounter() {
    const pl = player(); if (!pl) return;
    const s = ensure(pl);
    if (!s.active || Number(s.stage) !== 2 || s.sluiceCleared || s.encounterAvoided) return render('There is no hostile wisp to fight here now.');
    const enemy = {
      id: 'greyfen-reed-wisp-v160',
      name: 'Reed Wisp',
      behavior: 'flicker',
      hp: 34,
      maxHp: 34,
      damage: [3, 7],
      reward: 'wispAsh',
      combatStartRoadPressureV160: Number(s.pressure || 0),
      turn: 0,
      intent: 'heavy',
      greyfenMarshV160: true
    };
    const context = {
      getPlayer: player,
      savePlayer: save,
      getAssets: A,
      getLocationLabel: () => 'GREYFEN MARSH PATH',
      getWeapon: pl => rules?.weapon(pl) || { name: 'Hands', min: 1, max: 3 },
      getArmor: pl => rules?.armor(pl) || { name: 'No Armor', defense: 0 },
      score: (pl, skill) => rules?.score(pl, skill) || 0,
      ensureState: ensure,
      hpPercent: pl => rules?.hpPercent(pl) ?? 100,
      escapeHtml: esc,
      clamp,
      randomInt: rand,
      addInventory,
      itemName: id => rules?.itemName(id) || D().itemNames?.[id] || id,
      renderShell: html => { const host = root(); if (host) host.innerHTML = html; },
      renderExpedition: note => {
        if (/withdraw from/i.test(String(note || ''))) {
          const current = player();
          if (current) {
            const state = ensure(current);
            state.encounterRetreated = true;
            state.encounterAvoided = true;
            // The shared combat system lowers pressure on retreat. Greyfen's
            // retreat should instead carry the same disclosed +8 cost as
            // avoiding the wisp, without allowing a free repeat encounter.
            const startingPressure = Number(enemy.combatStartRoadPressureV160 ?? state.pressure ?? 0);
            state.pressure = clamp(startingPressure + 8, 0, 100);
            save(current);
          }
        }
        return render(note || '');
      },
      outcome: (title, text, kicker) => render(String(title || 'Encounter') + ': ' + String(text || kicker || '')),
      soundOn: () => audio().soundOn?.() ?? true,
      startMusic: () => audio().startBattleMusic?.(),
      stopMusic: () => audio().stopBattleMusic?.(),
      playBattleFx: kind => audio().playBattleFx?.(kind),
      tone: kind => audio().tone?.(kind),
      toggleSound: () => audio().toggleSound?.(),
      awardProgress: (playerRecord, amount) => window.LegendProgressionV100?.award(playerRecord, amount),
      showCombatResults: combatResult
    };
    return window.LegendRoadCombatV100?.start(context, enemy, 'A pale Reed Wisp circles the Flooded Sluice. Read its intent before committing to a strike.');
  }
  function render(note = '') {
    const pl = player(); if (!pl) return;
    if (String(pl.currentRegion || 'Ashmere') !== 'Greyfen') return renderNotice('The Marsh Path can only be entered from Greyfen.');
    const s = ensure(pl);
    if (!s.active && s.lastResultV160) return renderResult(pl, s.lastResultV160);
    if (!s.active) return start();
    const stop = stopFor(pl, s);
    const art = A().locations?.greyfenMarshWalkway || A().locations?.greyfenMain || '';
    const health = clamp(Math.round(Number(pl.hp || 0) / Math.max(1, Number(pl.maxHp || 1)) * 100), 0, 100);
    const visited = new Set(s.visitedNodeIds || []);
    const nodeId = currentNodeId(s);
    const activeFerry = s.activeSideTrip === 'fallen-ferry';
    let actions = '';
    if (activeFerry) {
      const raiderNote = s.ferryRaiderDefeated
        ? '<p class="gfm160-note" role="status">The Marsh Raider has fled. Their trail is recorded in your field journal.</p>'
        : s.ferryRaiderAvoided
          ? '<p class="gfm160-note" role="status">You avoided the Ferry ambush. Its danger is marked, and the detour is now complete.</p>'
          : '<p>Fresh bootprints cross the deck. Someone else is searching the wreck—and they may not leave the salvage to you.</p><div class="gfm160-action-row"><button class="gfm160-action is-primary" id="gfm160FaceRaider" type="button">Confront the Marsh Raider</button><button class="gfm160-action" id="gfm160AvoidRaider" type="button">Slip away · +4 Pressure</button></div>';
      actions = '<section class="gfm160-panel"><span class="gfm160-kicker">OPTIONAL DETOUR · SALVAGE RECORDED</span><h2>Fallen Ferry</h2><p>You recovered one Cloth Scrap above the waterline. The rest of the ferry remains submerged; no name or owner can be read from the boards.</p>' + raiderNote + '<button class="gfm160-action is-primary" id="gfm160ReturnFromFerry" type="button">Return to the Reed Bed <span aria-hidden="true">→</span></button></section>';
    } else if (Number(s.stage) === 0) {
      actions = '<section class="gfm160-panel"><span class="gfm160-kicker">DEPARTURE</span><h2>The Split Causeway lies ahead.</h2><p>Both routes rejoin at the Flooded Sluice. The Waterline Gauge is the authored survey objective; the optional ferry is never required.</p><button class="gfm160-action is-primary" id="gfm160Begin" type="button">Leave Greyfen Landing <span aria-hidden="true">→</span></button></section>';
    } else if (Number(s.stage) === 1) {
      actions = routeChoiceMarkup(pl, s);
    } else if (Number(s.stage) === 2) {
      actions = '<section class="gfm160-panel"><span class="gfm160-kicker">FLOODED SLUICE</span><h2>' + (s.sluiceCleared ? 'The wisp has fallen silent.' : s.encounterAvoided ? 'You crossed without fighting.' : 'Something pale circles the waterline.') + '</h2><p>' + (s.sluiceCleared ? 'The current still moves, but the passage is clear. Mossbarrow Shelter stands beyond the sluice.' : s.encounterAvoided ? 'You paid 8 Road Pressure to avoid the wisp. The survey remains reachable.' : 'The Reed Wisp is not the survey itself. You can face it or take the disclosed cost to pass; neither choice blocks the gauge.') + '</p>' +
        ((!s.sluiceCleared && !s.encounterAvoided) ? '<div class="gfm160-action-row"><button class="gfm160-action is-primary" id="gfm160FaceWisp" type="button">Face the Reed Wisp</button><button class="gfm160-action" id="gfm160PassSluice" type="button">Avoid the encounter · +8 Pressure</button></div>' : '') +
        '<button class="gfm160-action is-primary" id="gfm160ContinueShelter" type="button" ' + ((!s.sluiceCleared && !s.encounterAvoided) ? 'disabled' : '') + '>Continue to Mossbarrow Shelter <span aria-hidden="true">→</span></button></section>';
    } else if (Number(s.stage) === 3) {
      const canRest = Number(pl.inventory?.camp || 0) > 0 || Number(pl.inventory?.food || 0) > 0;
      actions = '<section class="gfm160-panel"><span class="gfm160-kicker">WAYSTATION · MOSSBARROW SHELTER</span><h2>A dry pause above the floodline.</h2><p>The shelter is optional respite: spend one Camp Supply or one Ration to recover up to 20% of maximum HP and reduce Road Pressure by 12. You can continue without resting.</p>' +
        '<div class="gfm160-action-row"><button class="gfm160-action" id="gfm160Rest" type="button" ' + ((!canRest || s.shelterRested) ? 'disabled' : '') + '>' + (s.shelterRested ? 'Shelter Rest Used' : 'Rest · 1 Supply') + '</button><button class="gfm160-action is-primary" id="gfm160ContinueGauge" type="button">Continue to the Waterline Gauge <span aria-hidden="true">→</span></button></div>' +
        (s.shelterRested ? '<p class="gfm160-note" role="status">Shelter rest recorded and saved.</p>' : '') + '</section>';
    } else {
      actions = '<section class="gfm160-panel"><span class="gfm160-kicker">FIELD EVIDENCE · WATERLINE GAUGE</span><h2>' + (s.gaugeInspected ? 'The reading is recorded.' : 'Inspect the old gauge.') + '</h2><p>The newest notch is a clean cut made by hand. Record its height without guessing who made it or why. Completing the survey earns 35g and 35 XP.</p>' +
        '<div class="gfm160-action-row">' + (!s.gaugeInspected ? '<button class="gfm160-action is-primary" id="gfm160InspectGauge" type="button">Record the Waterline Gauge</button>' : '<button class="gfm160-action is-primary" id="gfm160Complete" type="button">Complete the survey · Return with report</button>') +
        '<button class="gfm160-action" id="gfm160Exit" type="button">Return early to Greyfen</button></div>' +
        (s.gaugeInspected ? '<p class="gfm160-note" role="status">Gauge reading saved. The report is ready to bring to Greyfen.</p>' : '') + '</section>';
    }
    const contentText = activeFerry
      ? 'The ferry’s usable cloth lay above the waterline. Its markings are too damaged to identify who used it.'
      : String(s.stage) === '0'
        ? stop.description
        : String(s.stage) === '1' && !s.routeChoice
          ? stop.description
          : String(s.stage) === '1'
            ? (content().routeOptions?.[s.routeChoice]?.description || stop.description)
            : String(s.stage) === '2'
              ? 'The water funnels through a low stone sluice. A pale light follows the current without casting a clear reflection.'
              : String(s.stage) === '3'
                ? stop.description
                : s.gaugeInspected
                  ? 'The latest notch records a height. It does not tell you who cut it or what they intended.'
                  : stop.description;
    const map = mapMarkup(pl, s);
    const host = root(); if (!host) return;
    host.innerHTML =
      '<main class="gfm160-page" aria-label="Greyfen Marsh Path expedition">' +
        '<section class="gfm160-scene">' +
          '<img class="gfm160-scene-art" src="' + esc(art) + '" alt="" aria-hidden="true" onerror="this.style.display=\'none\'">' +
          '<div class="gfm160-scene-shade"></div>' +
          '<div class="gfm160-scene-copy"><span class="gfm160-kicker">GREYFEN · TRIP ' + Number(s.trips || 1) + ' · MARSH EXPEDITION</span><h1>' + esc(stop.name) + '</h1><p>' + esc(contentText) + '</p></div>' +
          '<div class="gfm160-scene-toolbar"><button class="gfm160-map-button" id="gfm160OpenMap" type="button">Field Map <span>' + Number((s.discoveredNodeIds || []).length) + ' known</span></button><button class="gfm160-map-button" id="gfm160EarlyExit" type="button">Return to Greyfen</button></div>' +
        '</section>' +
        '<section class="gfm160-status" aria-label="Traveler and expedition status">' +
          '<div><span>TRAVELER</span><strong>' + esc(pl.username || 'Traveler') + ' · Lv ' + Number(pl.level || 1) + '</strong></div>' +
          '<div><span>HEALTH</span><strong>' + Number(pl.hp || 0) + ' / ' + Number(pl.maxHp || 1) + ' HP</strong><i><b style="width:' + health + '%"></b></i></div>' +
          '<div><span>ROAD PRESSURE</span><strong>' + Number(s.pressure || 0) + '</strong><i><b style="width:' + clamp(Number(s.pressure || 0), 0, 100) + '%"></b></i></div>' +
          '<div><span>FIELD TIME</span><strong>' + Number(s.hoursElapsed || 0) + ' hours · Day ' + Number(pl.day || 1) + '</strong></div>' +
        '</section>' +
        '<section class="gfm160-content">' + actions +
          '<aside class="gfm160-field-note"><span class="gfm160-kicker">FIELD JOURNAL</span><strong>' + (s.routeChoice ? esc(s.routeChoice === 'raised' ? 'Raised Posts' : 'Reed Bed') : 'No route chosen yet') + '</strong><p>' + (s.gaugeInspected ? 'Waterline Gauge reading saved.' : s.sluiceCleared ? 'The sluice encounter is recorded.' : s.encounterAvoided ? 'The encounter was avoided at a disclosed pressure cost.' : 'Route evidence and optional salvage are saved independently of the mandatory survey.') + '</p></aside>' +
        '</section>' + map +
      '</main>';
    bindActions();
    return true;
  }
  function mapMarkup(pl, s) {
    const graph = content(), nodes = graph.stops || [], edges = graph.edges || [];
    const current = currentNodeId(s), visited = new Set(s.visitedNodeIds || []), discovered = new Set(s.discoveredNodeIds || []);
    const route = s.routeChoice;
    const reachable = new Set(edges.filter(edge => edge.from === current && (!edge.route || !route || edge.route === route)).map(edge => edge.to));
    const cards = nodes.map(node => {
      const offRoute = Boolean(node.route && route && node.route !== route);
      const isCurrent = current === node.id;
      const isVisited = visited.has(node.id);
      const isDiscovered = discovered.has(node.id);
      const isReachable = reachable.has(node.id);
      const status = offRoute ? 'Route not taken' : isCurrent ? 'You are here' : isVisited ? 'Visited this trip' : isDiscovered ? 'Discovered, not visited' : isReachable ? (node.optional ? 'Optional detour available' : 'Reachable next') : 'Uncharted';
      return '<article class="gfm160-map-node' + (isCurrent ? ' is-current' : isVisited ? ' is-visited' : isReachable ? ' is-reachable' : '') + (node.optional ? ' is-optional' : '') + '" role="listitem" aria-label="' + esc(node.name + ', ' + status) + '"><div><strong>' + esc(node.name) + (node.optional ? ' <small>OPTIONAL</small>' : '') + '</strong><span>' + esc(node.type || 'Marsh stop') + '</span></div><em>' + esc(status) + '</em></article>';
    }).join('');
    return '<div class="gfm160-map-overlay" id="gfm160MapOverlay" hidden><section class="gfm160-map-dialog" role="dialog" aria-modal="true" aria-label="Greyfen Marsh field map"><header><div><span class="gfm160-kicker">FIELD MAP · TRIP ' + Number(s.trips || 1) + '</span><h2>The Marsh Path</h2></div><button type="button" id="gfm160CloseMap" aria-label="Close field map">×</button></header><p>Text labels show the state of each place, so route knowledge is not conveyed by color alone.</p><div class="gfm160-map-list" role="list">' + cards + '</div><footer><span>' + visited.size + ' places visited · ' + discovered.size + ' places discovered</span><button type="button" id="gfm160CloseMapFooter">Return to the path</button></footer></section></div>';
  }
  function bindActions() {
    document.getElementById('gfm160Begin')?.addEventListener('click', () => {
      const pl = player(); if (!pl) return;
      const s = ensure(pl);
      s.stage = 1;
      visit(pl, s, 'fork');
      save(pl);
      render('The Split Causeway divides into raised posts and the reed bed.');
    });
    document.getElementById('gfm160ChooseRaised')?.addEventListener('click', () => chooseRoute('raised'));
    document.getElementById('gfm160ChooseReeds')?.addEventListener('click', () => chooseRoute('reeds'));
    document.getElementById('gfm160VisitFerry')?.addEventListener('click', visitFerry);
    document.getElementById('gfm160FaceRaider')?.addEventListener('click', startFerryAmbush);
    document.getElementById('gfm160AvoidRaider')?.addEventListener('click', avoidFerryAmbush);
    document.getElementById('gfm160ReturnFromFerry')?.addEventListener('click', returnFromFerry);
    document.getElementById('gfm160Continue')?.addEventListener('click', moveToSluice);
    document.getElementById('gfm160FaceWisp')?.addEventListener('click', startEncounter);
    document.getElementById('gfm160PassSluice')?.addEventListener('click', passSluice);
    document.getElementById('gfm160ContinueShelter')?.addEventListener('click', moveToShelter);
    document.getElementById('gfm160Rest')?.addEventListener('click', restAtShelter);
    document.getElementById('gfm160ContinueGauge')?.addEventListener('click', moveToGauge);
    document.getElementById('gfm160InspectGauge')?.addEventListener('click', inspectGauge);
    document.getElementById('gfm160Complete')?.addEventListener('click', () => settle(true));
    document.getElementById('gfm160Exit')?.addEventListener('click', () => settle(false));
    document.getElementById('gfm160EarlyExit')?.addEventListener('click', () => settle(false));
    document.getElementById('gfm160OpenMap')?.addEventListener('click', () => {
      const panel = document.getElementById('gfm160MapOverlay');
      if (panel) panel.hidden = false;
      document.getElementById('gfm160CloseMap')?.focus({ preventScroll: true });
    });
    document.getElementById('gfm160CloseMap')?.addEventListener('click', () => { const panel = document.getElementById('gfm160MapOverlay'); if (panel) panel.hidden = true; });
    document.getElementById('gfm160CloseMapFooter')?.addEventListener('click', () => { const panel = document.getElementById('gfm160MapOverlay'); if (panel) panel.hidden = true; });
  }
  window.LegendGreyfenMarshV160 = Object.freeze({ start, render, settle });
})();
