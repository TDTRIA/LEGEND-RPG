// LEGEND v0.6.4 — Stable Old Road Event Data
// Data-only event table. Safe to load before or after the main game.

window.ROAD_EVENTS = [
  {
    id:'broken_milestone',
    title:'Broken Milestone',
    description:'A ruined milestone blocks the road. Moss hides the loose stones, and the path asks whether you know how to move carefully.',
    check:'survival',
    dc:7,
    success:{xp:45,items:[{key:'roadToken',qty:1}],message:'You cross safely and pry a Road Token from beneath the marker.'},
    failure:{fatigue:1,message:'You slip on the broken stones. The road takes a little more out of you.'},
    tutorialMessage:'Some road events test skills. Survival checks help Rangers and careful travelers avoid fatigue.'
  },
  {
    id:'drowned_cart',
    title:'Drowned Cart',
    description:'An old merchant cart has sunk into the mud. A cracked wheel and wet crates are still visible.',
    check:'strength',
    dc:8,
    success:{xp:30,gold:45,items:[{key:'log',qty:1}],message:'You haul part of the cart free and salvage useful wood and coin.'},
    failure:{hp:10,message:'The cart shifts suddenly and catches your shoulder.'},
    tutorialMessage:'Some finds can become resources. Logs matter for early errands and camp preparation.'
  },
  {
    id:'bell_echo',
    title:'Bell Echo',
    description:'The sound of a bell drifts across the empty road, though Ashmere is far behind you.',
    check:'lore',
    dc:8,
    success:{items:[{key:'bellFragment',qty:1}],message:'You follow the echo to a buried Bell Fragment.'},
    failure:{roadDanger:1,message:'The echo leads you in circles. The road feels more awake now.'},
    tutorialMessage:'Lore and magic checks are useful for strange events tied to Ashmere and the Lost Build.'
  },
  {
    id:'goblin_tracks',
    title:'Goblin Tracks',
    description:'Small tracks cross the mud. Something dragged a pouch toward the trees.',
    check:'survival',
    dc:6,
    success:{xp:25,gold:30,message:'You read the tracks, avoid the ambush, and recover a few coins from the mud.'},
    failure:{fatigue:1,message:'The tracks double back on themselves. You lose time and energy.'},
    tutorialMessage:'Not every road event becomes combat. Reading signs can avoid danger before it starts.'
  },
  {
    id:'lost_traveler',
    title:'Lost Traveler',
    description:'A frightened traveler waves from the roadside, unsure which way Ashmere is.',
    check:'luck',
    dc:10,
    success:{townTrust:1,message:'You guide the traveler back toward safety. Word of it should reach Ashmere.'},
    failure:{message:'You cannot make sense of their directions. They leave shaken, but alive.'},
    tutorialMessage:'Town trust tracks how Ashmere remembers your choices. Helping people can matter later.'
  },
  {
    id:'road_shrine',
    title:'Road Shrine',
    description:'A small shrine stands under bent branches. Its carvings pulse faintly when you step close.',
    check:'magic',
    dc:9,
    success:{xp:40,message:'You study the shrine and feel the old road logic click into place.'},
    failure:{fatigue:1,message:'The symbols blur. Trying to understand them leaves your head aching.'},
    tutorialMessage:'Magic events may reward insight instead of items. Mages have a small edge here.'
  },
  {
    id:'strange_lantern',
    title:'Strange Lantern',
    description:'A lantern swings from a branch with no hand holding it. Its light points off the road.',
    check:'luck',
    dc:7,
    success:{items:[{key:'rfood',qty:1}],message:'The lantern guides you to edible roots and berries.'},
    failure:{fatigue:1,message:'You follow the glow too far and return tired.'},
    tutorialMessage:'Luck events are risky, but can lead to supplies. Thieves may squeeze out extra coin.'
  },
  {
    id:'fallen_tree',
    title:'Fallen Tree',
    description:'A fallen tree blocks the road. The trunk is wet, heavy, and useful if you can break it down.',
    check:'strength',
    dc:8,
    success:{xp:35,items:[{key:'log',qty:2}],message:'You clear the road and split the trunk into usable logs.'},
    failure:{fatigue:2,message:'The tree barely moves. You spend too much strength for too little progress.'},
    tutorialMessage:'Strength checks often trade risk for resources. Warriors have a better time here.'
  },
  {
    id:'quiet_camp',
    title:'Quiet Camp',
    description:'A sheltered clearing opens beside the road. For once, nothing moves in the dark.',
    check:null,
    dc:null,
    success:{fatigue:-2,message:'You take a short rest and recover some stamina.'},
    failure:null,
    tutorialMessage:'Rest events can lower fatigue. Sella will explain why that matters for longer travel.'
  },
  {
    id:'hidden_turnoff',
    title:'Hidden Turnoff',
    description:'A narrow path bends away from Old Road. Someone tried to hide it with branches.',
    check:'survival',
    dc:9,
    success:{routesDiscovered:1,message:'You mark the hidden turnoff. This can become a future route.'},
    failure:{fatigue:1,message:'The brush closes behind you, and you return scratched and tired.'},
    tutorialMessage:'Hidden routes will unlock future towns and paths. This is the start of the discovery system.'
  }
];
