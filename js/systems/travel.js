// LEGEND v0.6.4 — Travel System
// Handles Old Road exploration, fatigue, day/time, and event dispatch

(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];

  function loadPlayer(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function savePlayer(p){
    if(!p) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(p));
  }

  function randomInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

  function exploreOldRoad(){
    const p = loadPlayer();
    if(!p) return;
    const events = window.ROAD_EVENTS || [];
    const e = events[randomInt(0, events.length-1)];

    let message = e.description;
    // Simple simulation: apply success or failure randomly for now
    if(Math.random() < 0.6 && e.success){
      if(e.success.xp) p.xp = (p.xp||0)+e.success.xp;
      if(e.success.gold) p.gold = (p.gold||0)+e.success.gold;
      if(e.success.items) e.success.items.forEach(i=>p.inventory[i.key]=(p.inventory[i.key]||0)+i.qty);
      if(e.success.routesDiscovered) p.discoveredRoutes = p.discoveredRoutes || []; p.discoveredRoutes.push('New Route');
      if(e.success.townTrust) p.townTrust.Ashmere += e.success.townTrust;
      if(e.success.fatigue) p.fatigue = (p.fatigue||0) + e.success.fatigue;
      message += ' SUCCESS!';
    } else if(e.failure){
      if(e.failure.hp) p.hp -= e.failure.hp;
      if(e.failure.fatigue) p.fatigue = (p.fatigue||0) + e.failure.fatigue;
      if(e.failure.roadDanger) p.roadDanger = (p.roadDanger||0)+e.failure.roadDanger;
      message += ' FAILURE!';
    }
    savePlayer(p);
    alert(message);
  }

  window.LegendTravel = { exploreOldRoad };
})();