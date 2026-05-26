// LEGEND v0.8.4 - Ashmere Town Content
// Fantasy identity pivot: towns are places with schedules, access rules, and location actions.
(() => {
  window.LegendTownsV080 = window.LegendTownsV080 || {};

  window.LegendTownsV080.ashmere = {
    id: 'ashmere',
    name: 'Ashmere',
    subtitle: 'The first lantern-town on the Old Road',
    description: 'Ashmere is a tired roadside town built around a silent bell, wet stone lanes, and people who watch the road like it might answer back.',
    mood: 'Damp lantern light, old timber, road mud, and bells that should not ring.',
    startLocation: 'gate',
    locations: [
      {
        id: 'gate',
        name: 'Town Gate',
        type: 'open',
        icon: 'gate',
        short: 'The road begins and ends here.',
        description: 'The wooden gate faces the Old Road. Guards keep lanterns burning even during the day. Wagons stop here to count wheels, food, and courage.',
        access: { kind: 'open' },
        actions: [
          { id:'road', label:'Travel the Old Road', kind:'road' },
          { id:'look', label:'Watch the road', kind:'note', text:'The road bends through trees and low fog. Somewhere beyond it, another town is waiting to be found.' }
        ]
      },
      {
        id: 'people',
        name: 'Town Square',
        type: 'open',
        icon: 'people',
        short: 'Speak with the people of Ashmere.',
        description: 'A cramped square of muddy boots, old notices, and careful voices. Mara, Brenn, and Oric are usually nearby.',
        access: { kind: 'open' },
        actions: [
          { id:'people', label:'Talk to townsfolk', kind:'legacy', match:'People of Ashmere' },
          { id:'rumor', label:'Listen from the square', kind:'note', text:'You hear three things: the pub opens when the lamps are lit, the smith respects proof from the road, and Mara dislikes careless questions.' }
        ]
      },
      {
        id: 'pub',
        name: 'The Bent Lantern Pub',
        type: 'schedule',
        icon: 'pub',
        short: 'Food, drink, rumors, and games after dusk.',
        description: 'Warm light leaks from bent shutters. During the day, the room is quiet and half-swept. At evening, travelers crowd the tables and stories become currency.',
        access: { kind:'world', label:'Opens properly at evening or after town trust rises.', hint:'For now, ask around town or return after the road changes your standing.' },
        actions: [
          { id:'drink', label:'Buy a drink', kind:'coming', text:'Drinking will affect fatigue, courage, luck, and reputation once the time system lands.' },
          { id:'dice', label:'Play dice', kind:'coming', text:'Pub mini-games are planned for the next town patch.' },
          { id:'rumors', label:'Ask for rumors', kind:'note', text:'A woman at the counter says the next town is not far, but the road only shows it to people carrying enough supplies.' }
        ]
      },
      {
        id: 'inn',
        name: 'Ashmere Inn',
        type: 'service',
        icon: 'inn',
        short: 'Rest, food, and road supplies.',
        description: 'The inn smells of smoke, broth, and wet wool. It is safer than the road, but safety is never free.',
        access: { kind:'soft', label:'Available, but better services need coin and trust.', hint:'Basic rest is open. Special meals and rumors will unlock through pub/town systems.' },
        actions: [
          { id:'inn', label:'Use inn services', kind:'legacy', match:'Ashmere Inn' },
          { id:'meal', label:'Ask about a road meal', kind:'note', text:'The keeper says a proper road meal should reduce fatigue once the time system is active.' }
        ]
      },
      {
        id: 'market',
        name: 'Trading Post',
        type: 'service',
        icon: 'trade',
        short: 'Sell road goods and buy essentials.',
        description: 'A covered stall full of patched crates and suspicious scales. Common goods move here before anyone asks too many questions.',
        access: { kind:'soft', label:'Open to travelers. Rare stock depends on reputation.', hint:'Bring road goods, monster parts, or gems for better trading later.' },
        actions: [
          { id:'trade', label:'Trade goods', kind:'legacy', match:'Trading Post' },
          { id:'prices', label:'Ask about prices', kind:'note', text:'Logs, ore, fur, and gems are worth more when a town needs repairs or winter supplies.' }
        ]
      },
      {
        id: 'smith',
        name: 'Weapon Shop',
        type: 'craft',
        icon: 'weapon',
        short: 'Weapons, sharpening, repairs, and road advice.',
        description: 'The smith keeps blades behind the counter and looks at your boots before your face. Road mud tells him whether you are serious.',
        access: { kind:'trust', label:'Basic stock is visible. Better work needs road proof.', hint:'Bring a Road Token, monster trophy, or town trust to earn better services.' },
        actions: [
          { id:'weapon', label:'Browse weapons', kind:'legacy', match:'Weapon Shop' },
          { id:'sharpen', label:'Ask about sharpening', kind:'coming', text:'Weapon upgrades will use ore, gold, and time once crafting lands.' }
        ]
      },
      {
        id: 'armorer',
        name: 'Armor Shop',
        type: 'craft',
        icon: 'armor',
        short: 'Armor, repairs, and protective road gear.',
        description: 'Leather, chain, and dented shields hang from beams. The armorer measures risk in bruises and missing friends.',
        access: { kind:'trust', label:'Basic armor is available. Reinforcement needs materials.', hint:'Ore, hides, and monster bone will matter when crafting expands.' },
        actions: [
          { id:'armor', label:'Browse armor', kind:'legacy', match:'Armor Shop' },
          { id:'reinforce', label:'Ask about reinforcement', kind:'coming', text:'Armor reinforcement will become part of crafting and fatigue survival.' }
        ]
      },
      {
        id: 'archive',
        name: 'Archive Hall',
        type: 'story',
        icon: 'archive',
        short: 'Mara keeps records, maps, and town memory.',
        description: 'Rows of damp ledgers and sealed letters line the walls. Mara knows which roads were real before anyone else admits they changed.',
        access: { kind:'social', label:'Mara usually expects a proper introduction.', hint:'Speak with Mara in the Town Square to make this feel earned.' },
        actions: [
          { id:'archive', label:'Enter the archive', kind:'legacy', match:'Archive Hall' },
          { id:'records', label:'Ask about road records', kind:'note', text:'The old records mention more towns than the current maps show.' }
        ]
      },
      {
        id: 'ledger',
        name: 'Ledger Hall',
        type: 'story',
        icon: 'ledger',
        short: 'Brenn records road proof and town debts.',
        description: 'Old Brenn keeps ink, coin, and consequences in the same room. Nothing counts in Ashmere until it is written down.',
        access: { kind:'purpose', label:'You need a reason to be here.', hint:'Road Tokens, Bell Fragments, debts, favors, and bounties belong here.' },
        actions: [
          { id:'ledger', label:'Visit the ledger', kind:'legacy', match:'Ledger Hall' },
          { id:'proof', label:'Ask what counts as proof', kind:'note', text:'Brenn cares about tokens, trophies, signed debts, and people who come back alive.' }
        ]
      },
      {
        id: 'commons',
        name: 'The Commons',
        type: 'training',
        icon: 'commons',
        short: 'Training, skill practice, and town work.',
        description: 'A patch of open ground near the old well. People train here, mend fences, and test whether travelers are all talk.',
        access: { kind:'world', label:'Open when there is daylight and purpose.', hint:'Training should cost time and sometimes fatigue once the time system lands.' },
        actions: [
          { id:'commons', label:'Train skills', kind:'legacy', match:'The Commons' },
          { id:'work', label:'Look for town work', kind:'coming', text:'Small jobs will become a bridge into crafting, town trust, and fatigue management.' }
        ]
      },
      {
        id: 'crafting',
        name: 'Crafting Bench',
        type: 'craft',
        icon: 'craft',
        short: 'Turn materials into road supplies and upgrades.',
        description: 'A shared workbench under a patched awning. Tools are chained down. Everyone pretends not to know why.',
        access: { kind:'materials', label:'Needs materials or permission.', hint:'Logs, ore, fur, bone, herbs, and coin will drive crafting.' },
        actions: [
          { id:'recipes', label:'Inspect possible recipes', kind:'coming', text:'First recipes should be Cooked Food, Camp Kit, Torch Bundle, Sharpened Blade, and Reinforced Armor.' }
        ]
      }
    ]
  };
})();
