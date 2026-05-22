// LEGEND v0.6.4 — Full Initial Old Road Events

window.ROAD_EVENTS = [
  {id:'broken_milestone',title:'Broken Milestone',check:'survival',dc:7,success:{xp:45,items:[{key:'roadToken',qty:1}]},failure:{fatigue:1}},
  {id:'drowned_cart',title:'Drowned Cart',check:'strength',dc:8,success:{xp:30,gold:45,items:[{key:'log',qty:1}]},failure:{hp:10}},
  {id:'bell_echo',title:'Bell Echo',check:'lore',dc:8,success:{items:[{key:'bellFragment',qty:1}]},failure:{roadDanger:1}},
  {id:'goblin_tracks',title:'Goblin Tracks',check:'survival',dc:6,success:{xp:25,gold:30},failure:{fatigue:1}},
  {id:'lost_traveler',title:'Lost Traveler',check:'luck',dc:10,success:{townTrust:1},failure:{}},
  {id:'road_shrine',title:'Road Shrine',check:'magic',dc:9,success:{xp:40},failure:{fatigue:1}},
  {id:'strange_lantern',title:'Strange Lantern',check:'luck',dc:7,success:{items:[{key:'rfood',qty:1}]},failure:{fatigue:1}},
  {id:'fallen_tree',title:'Fallen Tree',check:'strength',dc:8,success:{xp:35,items:[{key:'log',qty:2}]},failure:{fatigue:2}},
  {id:'quiet_camp',title:'Quiet Camp',check:null,success:{fatigue:-2}},
  {id:'hidden_turnoff',title:'Hidden Turnoff',check:'survival',dc:9,success:{routesDiscovered:1},failure:{fatigue:1}}
];