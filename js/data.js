// LEGEND v0.24.1 — player growth, expedition results, and Greyfen Marsh Path.
window.LEGEND_DATA = {
  VERSION: 'v0.24.1',
  SAVE_KEY: 'legend-roads-of-ashmere-v09',
  classes: {
    Adventurer:{hp:110,gold:120,mod:{survival:1,luck:1},move:'Lucky Strike',desc:'Balanced survivor. Good for a first run.'},
    Warrior:{hp:140,gold:90,mod:{strength:3},move:'Cleave',desc:'High HP and better force checks.'},
    Ranger:{hp:115,gold:100,mod:{survival:3,agility:1},move:'Trap Shot',desc:'Better road sense, scouting, and fleeing.'},
    Mage:{hp:90,gold:130,mod:{magic:3,lore:1},move:'Rune Bolt',desc:'Runic power and better strange-event checks.'},
    Thief:{hp:98,gold:160,mod:{thieving:3},move:'Swipe',desc:'Better stealing, locks, and risky rewards.'},
    Skiller:{hp:95,gold:125,mod:{craft:2,survival:1},move:'Improvised Tool',desc:'Better gathering, crafting, and non-combat play.'}
  },
  origins: {
    'Lost Squire':{bonus:{strength:1},text:'You once carried a blade for someone braver than you.'},
    'Runaway Apprentice':{bonus:{magic:1,lore:1},text:'You fled a teacher who knew too much about the Old Road.'},
    'Debt-Bound Thief':{bonus:{thieving:1},gold:40,text:'Someone in Ashmere thinks you still owe them.'},
    "Archivist's Child":{bonus:{lore:2},text:'You learned to read records before you learned to swing a weapon.'},
    'Wandering Cook':{items:{food:3},bonus:{survival:1},text:'You know a road meal can save a life.'},
    'Failed Monster Hunter':{bonus:{strength:1,survival:1},text:'The last hunt went badly. You survived anyway.'}
  },
  keepsakes: {
    'Rusty Charm':{bonus:{luck:2},text:'A charm warm with impossible luck.'},
    'Old Map':{bonus:{survival:2},text:'The ink shifts when roads change.'},
    'Bent Coin':{sellBonus:.12,text:'A coin no shopkeeper likes to refuse.'},
    'Cracked Tablet':{items:{rtab:2},bonus:{magic:1},text:'A runic shard from a lesson you forgot.'},
    'Dull Knife':{bonus:{thieving:2},text:'Bad steel, good enough for a lock.'},
    'Cooked Ration':{items:{food:5},text:'A small meal from before the road darkened.'}
  },
  itemNames: {roadPoultice:'Road Poultice',roadHerb:'Road Herb',clothScrap:'Cloth Scrap',tornHide:'Torn Hide',wolfFang:'Wolf Fang',wispAsh:'Wisp Ash',oil:'Lamp Oil',woodScrap:'Wood Scrap',peatBrick:'Dry Peat Brick',gmail:'Goblin Mail',hbone:'Huge Bones',rtab:'Runic Tablets',food:'Food',rfood:'Raw Food',bait:'Bait',potion:'Potions',camp:'Camp Supplies',fur:'Furs',gem:'Gemstones',log:'Logs',ore:'Ore',morb:'Magic Orbs',codeFragment:'Code Fragments',bellFragment:'Bell Fragments',roadToken:'Road Tokens'},
  prices: {gmail:300,hbone:550,rtab:250,food:100,rfood:60,bait:2,potion:200,camp:90,fur:200,gem:1000,log:275,ore:500,morb:15000,codeFragment:0,bellFragment:0,roadToken:0},
  regions: {
    Ashmere:{id:'Ashmere',name:'Ashmere',type:'home',unlocked:true,travelCost:0,description:'Lantern Town and the safe heart of your journey.'},
    Greyfen:{id:'Greyfen',name:'Greyfen',type:'region',unlockTokens:5,travelCost:25,description:'A drowned lowland of reeds, old shrines, and rare road herbs.'},
    Ironpass:{id:'Ironpass',name:'Ironpass',type:'region',requiresRegion:'Greyfen',requiresFlag:'greyfenDryCrossingComplete',requiresFlagLabel:'A Dry Crossing',available:false,unlockTokens:10,travelCost:45,description:'A hard mountain crossing rich in ore and guarded by tougher creatures.'},
    Blackwood:{id:'Blackwood',name:'Blackwood',type:'region',requiresRegion:'Ironpass',available:false,unlockTokens:15,travelCost:70,description:'A deep forest where hunting, corruption, and old paths intertwine.'},
    RuinedMarch:{id:'RuinedMarch',name:'The Ruined March',type:'region',requiresRegion:'Blackwood',available:false,unlockTokens:25,travelCost:100,description:'A broken frontier where the oldest road secrets begin to surface.'}
  },
  weapons: [
    {id:'hand',name:'Your Hand',min:8,max:20,cost:0,level:1,passive:'No weapon trait'},
    {id:'woodenSword',name:'Wooden Sword',min:14,max:34,cost:65,level:1,perk:'quickdraw',passive:'Quickdraw · +5 FIGHT damage against a Guard Break tell'},
    {id:'stoneSword',name:'Stone Sword',min:20,max:48,cost:140,level:1,perk:'breaker',passive:'Breaker · Heavy Strike deals 25% more damage'},
    {id:'bronzeSword',name:'Bronze Sword',min:28,max:62,cost:280,level:2,perk:'battleRhythm',passive:'Battle Rhythm · ACT deals +5 damage'},
    {id:'ironSword',name:'Iron Sword',min:36,max:82,cost:650,level:4,perk:'heavyPunish',passive:'Punisher · FIGHT deals +7 against a Heavy Wind-Up'},
    {id:'steelSword',name:'Steel Sword',min:48,max:108,cost:1400,level:7,perk:'keenEdge',passive:'Keen Edge · 20% critical chance for 1.5× damage'}
  ],
  armors: [
    {id:'none',name:'No Armor',defense:0,cost:0,level:1},{id:'clothArmor',name:'Cloth Armor',defense:10,cost:80,level:1},{id:'chainArmor',name:'Chain Armor',defense:22,cost:180,level:1},{id:'bronzeArmor',name:'Bronze Armor',defense:42,cost:380,level:2},{id:'ironArmor',name:'Iron Armor',defense:68,cost:850,level:4}
  ],
  enemies: [
    {name:'Goblin',glyph:'👺',maxDamage:22,hp:[50,85],drop:['gmail',1,'Goblin Mail'],trait:'Sneaky',intent:['eyes your coin pouch','slashes wildly','looks ready to flee']},
    {name:'Rat',glyph:'🐀',maxDamage:16,hp:[30,60],drop:['fur',2,'Furs'],trait:'Skittish',intent:['skitters around your boots','bares its teeth','looks for an opening']},
    {name:'Giant',glyph:'🗿',maxDamage:38,hp:[105,165],drop:['hbone',2,'Huge Bones'],trait:'Heavy',intent:['winds up a heavy blow','stomps the road','raises both fists']}
  ],
  ascii: {
    title:'LEGEND: The Awakening',
    ashmere:'ASHMERE - Lantern Town of the Old Road',
    road:'THE OLD ROAD',
    npc:'Traveler of Ashmere',
    keep:'The Hollow Keep'
  },
  portraits: {
    mara:'Mara',
    brenn:'Brenn',
    oric:'Oric',
    sella:'Sella'
  }
};
