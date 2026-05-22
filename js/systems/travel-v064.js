// LEGEND v0.6.4 — Travel System with Class-Specific Outcomes
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];

  function loadPlayer(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function savePlayer(p){ if(!p) return; localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }

  function randomInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

  function applyClassBonus(event,p){
    if(!p.className) return;
    switch(p.className){
      case 'Ranger':
        if(event.check==='survival' && Math.random()<0.5) { p.fatigue = Math.max(0,(p.fatigue||0)-1); }
        break;
      case 'Warrior':
        if(event.check==='strength' && Math.random()<0.5) { p.hp = (p.hp||100)+5; }
        break;
      case 'Mage':
        if(event.check==='magic'||event.check==='lore') { p.xp = (p.xp||0)+5; }
        break;
      case 'Thief':
        if(event.check==='luck') { p.gold = (p.gold||0)+10; }
        break;
      case 'Skiller':
        if(event.check==='craft'||event.check==='survival'){ p.inventory.roadToken=(p.inventory.roadToken||0)+1; }
        break;
    }
  }

  function exploreOldRoad(){
    const p = loadPlayer();
    if(!p) return;
    const events = window.ROAD_EVENTS || [];
    const e = events[randomInt(0,events.length-1)];
    let message = e.description;

    if(Math.random()<0.6 && e.success){
      if(e.success.xp) p.xp = (p.xp||0)+e.success.xp;
      if(e.success.gold) p.gold = (p.gold||0)+e.success.gold;
      if(e.success.items) e.success.items.forEach(i=>p.inventory[i.key]=(p.inventory[i.key]||0)+i.qty);
      if(e.success.routesDiscovered) p.discoveredRoutes = p.discoveredRoutes||[]; p.discoveredRoutes.push('New Route');
      if(e.success.townTrust) p.townTrust.Ashmere += e.success.townTrust;
      if(e.success.fatigue) p.fatigue = (p.fatigue||0)+e.success.fatigue;
      applyClassBonus(e,p);
      message+=' SUCCESS!';
    } else if(e.failure){
      if(e.failure.hp) p.hp = (p.hp||100)-e.failure.hp;
      if(e.failure.fatigue) p.fatigue = (p.fatigue||0)+e.failure.fatigue;
      if(e.failure.roadDanger) p.roadDanger = (p.roadDanger||0)+e.failure.roadDanger;
      message+=' FAILURE!';
    }
    savePlayer(p);
    alert(message);
  }

  window.LegendTravel = { exploreOldRoad };
})();