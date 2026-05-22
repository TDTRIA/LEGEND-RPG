(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];

  function root(){ return document.getElementById('root'); }
  function esc(s){ return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function loadPlayer(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try { return normalize(JSON.parse(raw)); } catch { return null; }
  }

  function savePlayer(p){
    if(!p) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(normalize(p)));
  }

  function normalize(p){
    p.inventory = p.inventory || {};
    ['food','rfood','camp','potion','roadToken','log','bellFragment'].forEach(k => p.inventory[k] ??= 0);
    p.flags = p.flags || {};
    p.stats = p.stats || {};
    p.memories = p.memories || ['You woke beneath a dead lantern outside Ashmere.'];
    p.questLog = p.questLog || [];
    p.townTrust = p.townTrust || {};
    p.townTrust.Ashmere ??= 0;
    p.npcTalk = p.npcTalk || {};
    p.npcTalk.sella ??= 0;
    p.quests = p.quests || {};
    p.quests.sellaRoadMeal = p.quests.sellaRoadMeal || {status:'hidden',step:0,title:'A Meal Before The Road'};
    p.fatigue = p.fatigue || 0;
    p.day = p.day || 1;
    p.timeOfDay = p.timeOfDay || 'Morning';
    p.stats.townErrands = p.stats.townErrands || 0;
    return p;
  }

  function hasText(pattern){
    return pattern.test(root()?.innerText || '');
  }

  function injectSellaCard(){
    if(!hasText(/People of Ashmere/i)) return;
    if(document.getElementById('sella')) return;
    const list = document.querySelector('.list');
    if(!list) return;
    const card = document.createElement('button');
    card.className = 'npc-card';
    card.id = 'sella';
    card.innerHTML = '<h3>Sella Marr</h3><p>Inn cook and road provisioner - teaches fatigue, food, and camp supplies.</p>';
    card.onclick = renderSella;
    list.appendChild(card);
  }

  function renderSella(){
    const p = loadPlayer();
    if(!p){ location.href = 'index.html?v=0.6.4'; return; }
    p.flags.talkedToSella = true;
    p.npcTalk.sella = (p.npcTalk.sella || 0) + 1;
    p.quests.sellaRoadMeal.status = p.flags.sellaErrandComplete ? 'complete' : (p.flags.sellaErrandStarted ? 'active' : 'available');
    p.quests.sellaRoadMeal.step = p.flags.sellaErrandComplete ? 2 : (p.flags.sellaErrandStarted ? 1 : 0);
    savePlayer(p);

    const errandStatus = p.flags.sellaErrandComplete
      ? 'Sella has packed your first real road meal. Ashmere trusts you a little more.'
      : p.flags.sellaErrandStarted
        ? 'Sella is waiting for 2 logs so she can repair the cookfire rack and pack road meals properly.'
        : 'Sella can teach you how fatigue, food, and camp supplies work before the road starts wearing you down.';

    const canTurnIn = p.flags.sellaErrandStarted && !p.flags.sellaErrandComplete && (p.inventory.log || 0) >= 2;
    const canStart = !p.flags.sellaErrandStarted;

    root().innerHTML = `
      <div class="shell">
        <header class="topbar">
          <div class="brand"><h1>LEGEND</h1><div class="sub">Recovered Build v0.6.4</div></div>
          <div class="meta-grid"><div class="box"><span class="label">Location</span><span class="value">Ashmere</span></div><div class="box"><span class="label">Hero</span><span class="value">${esc(p.username)}</span></div></div>
          <div class="meta-grid"><div class="box"><span class="label">Fatigue</span><span class="value">${p.fatigue}</span></div><div class="box"><span class="label">Trust</span><span class="value">${p.townTrust.Ashmere}</span></div></div>
        </header>
        <div class="layout">
          <section class="panel">
            <div class="panel-head"><div><h2>Sella Marr</h2><p>Inn cook / road provisioner</p></div><span class="value">v0.6.4</span></div>
            <pre class="ascii">   .-'''-.\n  /  .-.  \\    SELLA MARR\n |  /   \\  |   warm hands, sharp eyes\n |  \\___/  |   road meals packed tight\n  \\       /\n   '-...-'</pre>
            <div class="text">Sella wipes flour from her sleeves and looks you over like she can already tell how badly the road will treat you.\n\n“The road doesn't just kill people with teeth and blades. It wears them down first. Hungry. Tired. Stupid. That's when the bad choices start.”\n\n${esc(errandStatus)}</div>
            <div class="actions">
              ${canStart ? '<button class="btn primary" id="startSellaErrand">Start: A Meal Before The Road</button>' : ''}
              ${canTurnIn ? '<button class="btn primary" id="finishSellaErrand">Give Sella 2 Logs</button>' : ''}
              <button class="btn" id="sellaTip">Ask About Fatigue</button>
              <button class="btn" id="backLegend">Back to LEGEND</button>
            </div>
          </section>
          <aside class="stack">
            <section class="panel"><div class="panel-head"><div><h3>Road Lesson</h3><p>Travel pressure</p></div></div><div class="quest-step"><span class="tag">Food</span><span class="tag">Camp</span><span class="tag">Fatigue</span><p class="text" style="font-size:.95rem;margin-top:8px">Food helps you push farther. Camp supplies help you recover outside town. Fatigue will matter more as Old Road expands.</p></div></section>
            <section class="panel"><div class="panel-head"><div><h3>Inventory</h3><p>Useful supplies</p></div></div><div class="stat-grid"><div class="stat"><span class="label">Food</span><span class="num">${p.inventory.food || 0}</span></div><div class="stat"><span class="label">Camp</span><span class="num">${p.inventory.camp || 0}</span></div><div class="stat"><span class="label">Logs</span><span class="num gold">${p.inventory.log || 0}</span></div></div></section>
          </aside>
        </div>
      </div>`;

    const start = document.getElementById('startSellaErrand');
    if(start) start.onclick = () => {
      const np = loadPlayer();
      np.flags.sellaErrandStarted = true;
      np.quests.sellaRoadMeal = {status:'active',step:1,title:'A Meal Before The Road'};
      if(!np.questLog.includes('A Meal Before The Road: Bring Sella 2 logs for the cookfire rack.')) np.questLog.push('A Meal Before The Road: Bring Sella 2 logs for the cookfire rack.');
      if(!np.memories.includes('Sella taught you that the road wears people down before it kills them.')) np.memories.push('Sella taught you that the road wears people down before it kills them.');
      savePlayer(np);
      renderSella();
    };

    const finish = document.getElementById('finishSellaErrand');
    if(finish) finish.onclick = () => {
      const np = loadPlayer();
      np.inventory.log -= 2;
      np.inventory.food += 2;
      np.inventory.camp += 1;
      np.gold += 35;
      np.townTrust.Ashmere += 1;
      np.stats.townErrands += 1;
      np.flags.sellaErrandComplete = true;
      np.quests.sellaRoadMeal = {status:'complete',step:2,title:'A Meal Before The Road'};
      if(!np.memories.includes('Sella packed your first proper road meal.')) np.memories.push('Sella packed your first proper road meal.');
      savePlayer(np);
      renderSella();
    };

    document.getElementById('sellaTip').onclick = () => {
      const np = loadPlayer();
      np.fatigue = Math.max(0, np.fatigue - 1);
      savePlayer(np);
      alert('Sella says: Rest in town when you can. Camp only when you must. Never walk hungry if you can help it. Fatigue reduced by 1 for now.');
      renderSella();
    };
    document.getElementById('backLegend').onclick = () => location.href = 'index.html?v=0.6.4';
  }

  const observer = new MutationObserver(() => requestAnimationFrame(injectSellaCard));
  window.addEventListener('DOMContentLoaded', () => {
    const r = root();
    if(r) observer.observe(r, {childList:true, subtree:true});
    injectSellaCard();
  });
  setInterval(injectSellaCard, 800);
})();
