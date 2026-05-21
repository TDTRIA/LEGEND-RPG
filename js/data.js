window.LEGEND_DATA = {
  VERSION: 'v0.6.1',
  SAVE_KEY: 'legend-recovered-build-v06',
  OLD_KEYS: ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'],
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
    'Runaway Apprentice':{bonus:{magic:1,lore:1},text:'You fled a teacher who knew too much about the Lost Build.'},
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
    'Cooked Ration':{items:{food:5},text:'A small meal from before the road collapsed.'}
  },
  itemNames: {gmail:'Goblin Mail',hbone:'Huge Bones',rtab:'Runic Tablets',food:'Food',rfood:'Raw Food',bait:'Bait',potion:'Potions',camp:'Camp Supplies',fur:'Furs',gem:'Gemstones',log:'Logs',ore:'Ore',morb:'Magic Orbs',codeFragment:'Code Fragments',bellFragment:'Bell Fragments',roadToken:'Road Tokens'},
  prices: {gmail:300,hbone:550,rtab:250,food:100,rfood:60,bait:2,potion:200,camp:90,fur:200,gem:1000,log:275,ore:500,morb:15000,codeFragment:0,bellFragment:0,roadToken:0},
  weapons: [
    {id:'hand',name:'Your Hand',min:8,max:20,cost:0,level:1},{id:'woodenSword',name:'Wooden Sword',min:14,max:34,cost:65,level:1},{id:'stoneSword',name:'Stone Sword',min:20,max:48,cost:140,level:1},{id:'bronzeSword',name:'Bronze Sword',min:28,max:62,cost:280,level:2},{id:'ironSword',name:'Iron Sword',min:36,max:82,cost:650,level:4},{id:'steelSword',name:'Steel Sword',min:48,max:108,cost:1400,level:7}
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
    title:'        /\\                 /\\\n       /  \\___ LEGEND ____/  \\\n      /_________________________\\\n      |       RECOVERED BUILD    |\n      |__________________________|',
    ashmere:'        /\\____ ASHMERE ____/\\\n      /___________________________\\\n      | []   []   []   []   []   |\n      |      THE FIRST TOWN       |\n      |___________________________|',
    road:'      ___|___ .   . ___|___\n  ____/   |   \\_____/   |   \\____\n      THE FIRST ROAD',
    npc:'        .-"""-.\n       /  o o  \\\n       |   ^   |\n       |  \'-\'  |\n       \'-------\'',
    keep:'        ______________________\n       /     THE HOLLOW KEEP    \\\n     /__________________________\\\n        ||  ||  ||  ||  ||'
  },
  portraits: {
    mara: [
      '        .-"""""-.',
      "      .'  .--.  ' .".replace(' ."','.'),
      '     /   /    \\   \\',
      '    |   |  ..  |   |',
      '    |   |  __  |   |',
      '    |   | /__\\ |   |',
      '    |    \\____/    |',
      '     \\   .____.   /',
      "      '.  \\__/  .'",
      "        '-.__.-'",
      '         /|  |\\',
      '    ____/ |  | \\____',
      '   /____  |  |  ____\\',
      '        | |__| |   ____',
      '        |  __  |  / __ \\',
      '        | |  | |  ||__||'
    ].join('\n'),
    brenn: [
      "        .-''''-.",
      "      .'  .--.  ' .".replace(' ."','.'),
      '     /   / oo \\   \\',
      '    |   |  --  |   |',
      '    |   | .__. |   |',
      '    |   | \\__/ |   |',
      '    |    \\____/    |',
      '     \\   /____\\   /',
      "      '._.____._.'",
      '          |  |',
      '       ___|  |___',
      "     .'   ____   '.",
      '    /   /  __  \\   \\',
      '   |   |  /  \\  |   |',
      '   |   | | [] | |   |',
      '    \\   \\____/   _/',
      "     '.___||____.'",
      '         _||_    o-o',
      '        /_||_\\    |'
    ].join('\n'),
    oric: [
      '           /^\\',
      '      ____/###\\____',
      '     /____  _  ____\\',
      '          |/ \\|',
      '         /|   |\\',
      '        /_|___|_\\',
      '       |  |===|  |',
      '       |  |===|  |',
      '       |  |___|  |',
      '       |   .-.   |',
      '       |  /   \\  |',
      '       |  \\___/  |',
      '       |    |    |',
      '      /|____|____|\\',
      '     /_/_/  |  \\_\\_\\',
      '            |',
      '           / \\',
      '          /___\\'
    ].join('\n'),
    sella: [
      '         .-~~~~-.',
      "       .'  .--.  '.",
      '      /   ( oo )   \\',
      '     |    \\ -- /    |',
      '     |   .-.__.-.   |',
      '     |  /  ____  \\  |',
      '      \\ | / __ \\ | /',
      '       \\| \\____/ |/',
      "        '.______.'",
      '         /| || |\\',
      '    ____/_|_||_|_\\____',
      '   /____   _  _   ____\\',
      '        | / \\/ \\ |',
      '        | \\_/\\_/ |   __',
      '        | |====| |  /__\\',
      '        |_|____|_|'
    ].join('\n')
  }
};