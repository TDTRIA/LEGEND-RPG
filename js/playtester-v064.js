// LEGEND v0.6.4 — Playtester Update
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';

  function loadPlayer(){
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
  }

  function testTravel(){
    console.log('Running Old Road travel test...');
    if(window.LegendTravel && typeof window.LegendTravel.exploreOldRoad==='function'){
      window.LegendTravel.exploreOldRoad();
      console.log('Old Road event executed.');
    } else console.warn('LegendTravel system not loaded.');
  }

  function testNPCs(){
    console.log('Testing NPCs...');
    const player = loadPlayer();
    if(!player){ console.warn('No save loaded.'); return; }
    if(window.NPCS){
      Object.keys(window.NPCS).forEach(n=>{
        console.log(`NPC: ${n}`, window.NPCS[n]);
      });
    } else console.warn('NPC system not loaded.');
  }

  function testTutorial(){
    console.log('Testing tutorial...');
    if(window.LegendTutorial){
      window.LegendTutorial.startTutorial?.();
      console.log('Tutorial started.');
    } else console.warn('Tutorial system not loaded.');
  }

  function runAllTests(){
    console.log('--- LEGEND v0.6.4 Playtester ---');
    testTravel();
    testNPCs();
    testTutorial();
    console.log('--- End of Playtester Run ---');
  }

  window.LegendPlaytester = { runAllTests, testTravel, testNPCs, testTutorial };
})();