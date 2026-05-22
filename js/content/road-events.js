// LEGEND v0.6.4 — Initial Old Road Event Definitions

window.ROAD_EVENTS = [
  {
    id:'broken_milestone',
    title:'Broken Milestone',
    description:'A ruined milestone blocks the road. You need to carefully cross it.',
    checkType:'survival',
    dc:7,
    success:{xp:45,items:[{key:'roadToken',qty:1}],message:'You navigate the milestone safely and find a Road Token.'},
    failure:{fatigue:1,message:'You stumble over the broken stones and are fatigued.'}
  },
  {
    id:'drowned_cart',
    title:'Drowned Cart',
    description:'An old cart has sunk into the mud.',
    checkType:'strength',
    dc:8,
    success:{xp:30,gold:45,items:[{key:'log',qty:1}],message:'You salvage some materials and gain gold.'},
    failure:{hp:10,message:'You strain yourself and take minor damage.'}
  },
  {
    id:'bell_echo',
    title:'Bell Echo',
    description:'The sound of a bell seems to call you.',
    checkType:'lore',
    dc:8,
    success:{items:[{key:'bellFragment',qty:1}],message:'You find a fragment of the bell!'},
    failure:{roadDanger:1,message:'The echo distracts you; the road feels more dangerous.'}
  },
  {
    id:'goblin_tracks',
    title:'Goblin Tracks',
    description:'Tracks of small creatures on the path.',
    checkType:'survival',
    dc:6,
    success:{xp:25,gold:30,message:'You track the goblins and avoid danger.'},
    failure:{fatigue:1,message:'You get lost in the woods and are fatigued.'}
  },
  {
    id:'lost_traveler',
    title:'Lost Traveler',
    description:'A traveler is in need of help.',
    checkType:'luck',
    dc:10,
    success:{townTrust:1,message:'You help the traveler; town trust increases.'},
    failure:{message:'You ignore the traveler. Nothing happens, but someone might notice later.'}
  },
  {
    id:'road_shrine',
    title:'Road Shrine',
    description:'An ancient shrine stands by the road.',
    checkType:'magic',
    dc:9,
    success:{xp:40,message:'You study the shrine and gain insight.'},
    failure:{fatigue:1,message:'You strain your mind and gain some fatigue.'}
  },
  {
    id:'strange_lantern',
    title:'Strange Lantern',
    description:'A glowing lantern flickers in the distance.',
    checkType:'luck',
    dc:7,
    success:{items:[{key:'rfood',qty:1}],message:'The lantern guides you to some edible resources.'},
    failure:{fatigue:1,message:'The flicker confuses you, increasing fatigue.'}
  },
  {
    id:'fallen_tree',
    title:'Fallen Tree',
    description:'A tree has fallen across the road.',
    checkType:'strength',
    dc:8,
    success:{xp:35,items:[{key:'log',qty:2}],message:'You clear the tree and gain logs for camp.'},
    failure:{fatigue:2,message:'The tree blocks your path, and you are exhausted.'}
  },
  {
    id:'quiet_camp',
    title:'Quiet Camp',
    description:'A small clearing lets you rest.',
    checkType:null,
    dc:null,
    success:{fatigue:-2,message:'You rest quietly and regain stamina.'},
    failure:null
  },
  {
    id:'hidden_turnoff',
    title:'Hidden Turnoff',
    description:'A faint path diverges from the main road.',
    checkType:'survival',
    dc:9,
    success:{routesDiscovered:1,message:'You discover a hidden path that may unlock a future route.'},
    failure:{fatigue:1,message:'You wander and fail to find anything; some fatigue.'}
  }
];