// LEGEND v0.20.36 - Active Old Road Content
// Data-only road content for the new road controller.
(() => {
  window.LegendRoadsV100 = window.LegendRoadsV100 || {};
  window.LegendRoadsV100.oldRoad = {
    id: 'old-road',
    name: 'The Old Road',
    subtitle: 'Ashmere to the forgotten mile-markers',
    description: 'A wet, lantern-marked road where travelers vanish, monsters follow cart tracks, and every safe mile still costs something.',
    stages: ['Ashmere Gate','Lantern Ditch','Stone Mile','Blackroot Bend','Broken Signpost'],
    scenes: [
      {name:'South Fork',type:'Crossroads',text:'Two muddy tracks leave Ashmere behind. The lanterns are still visible, but the road is already asking you to choose carefully.',icon:'↗'},
      {name:'Lantern Ditch',type:'Roadside Hazard',text:'A low ditch cuts across the old stone road. Cart tracks vanish into the reeds and something glimmers in the mud.',icon:'⌁'},
      {name:"Wayfarer's Camp",type:'Rest & Craft',text:'A sheltered clearing sits just off the road. Old firewood is stacked beneath a canvas lean-to; someone planned to return.',icon:'⌂',camp:true,routeVariants:{
        ridge:{text:'The High Ridge drops into a sheltered clearing. Dry kindling and a line of pale stones make this a safer place to rest; the ridge markers continue beyond the firepit.'},
        reeds:{text:'The Reed Cut spills into a sheltered clearing, but wet reeds cling to your boots and long tracks circle the firepit. The blue light is gone; something followed you out.'}
      }},
      {name:'Blackroot Bend',type:'Dangerous Crossing',text:'Black roots buckle the road and the trees crowd close. The air is damp, and the next mile feels watched.',icon:'✦'},
      {name:'Reedwatch Shelter',type:'Rest & Craft',text:'An abandoned watch shelter overlooks the lowlands. Its roof holds, its hearth can be lit, and its worktable is still usable.',icon:'⌂',camp:true},
      {name:'Greyfen Approach',type:'Regional Threshold',text:'The road slopes toward Greyfen. Beyond the last marker, reeds and drowned stone stretch into the mist.',icon:'⚑'}
    ],
    pointsOfInterest: [
      {key:'fork-marker',name:'The Split Milestone',kind:'Trail Clue',text:'Fresh cart tracks split around a toppled mile-marker. One set avoids the flooded ground.',action:'Read the tracks',icon:'⌖',short:'Milestone',x:26,y:48},
      {key:'ditch-lantern',name:'A Lantern in the Reeds',kind:'Strange Find',text:'A cold blue glow flickers beneath the ditch grass. It might be a lost charm—or bait.',action:'Investigate the glow',icon:'✧',short:'Lantern',x:76,y:48},
      {key:'camp-firepit',name:'The Abandoned Firepit',kind:'Useful Supplies',text:'Under the ash you spot a dry tinder bundle and a few scraps left by the last travelers.',action:'Salvage the firepit',icon:'♨',short:'Firepit',x:28,y:57},
      {key:'blackroot-mark',name:'Roots Around an Old Seal',kind:'Old Road Mystery',text:'The black roots have split a stone seal bearing the same bell-mark found near Ashmere.',action:'Study the seal',icon:'✦',short:'Old seal',x:78,y:53},
      {key:'reedwatch-locker',name:'The Shelter Locker',kind:'Forgotten Stores',text:'A swollen wooden locker sits beneath a shelter bench, held shut by a rusted catch.',action:'Open the locker',icon:'▣',short:'Locker',x:25,y:52},
      {key:'greyfen-marker',name:'The Greyfen Boundary Stone',kind:'Regional Clue',text:'The boundary stone is scored with route marks. A few fresh scratches point beyond the reeds.',action:'Record the route marks',icon:'⚑',short:'Boundary',x:78,y:48}
    ],
    routeGraphV160: {
      startNodeId: 'south-fork',
      nodes: [
        { id: 'south-fork', name: 'South Fork', type: 'Crossroads', stage: 0, description: 'The shared fork where the High Ridge and Reed Cut diverge.' },
        { id: 'high-ridge', name: 'High Ridge', type: 'Route', route: 'ridge', stage: 1, description: 'A firm, exposed climb above the lower marsh.' },
        { id: 'ridgeway-cairn', name: 'Ridgeway Cairn', type: 'Trail Clue', route: 'ridge', stage: 1, poiKey: 'ridge-cairn', description: 'A stack of old stones marks the dry line. One stone sits beyond its weathered groove.' },
        { id: 'windbreak', name: 'Windbreak', type: 'Optional Shelter', route: 'ridge', stage: 1, optional: true, description: 'A broken rock shelf cuts the worst of the wind and looks down over the lowland tracks.' },
        { id: 'reed-cut', name: 'Reed Cut', type: 'Route', route: 'reeds', stage: 1, description: 'A wet, reed-choked passage with poor sight lines and rising pressure.' },
        { id: 'lantern-ditch', name: 'Lantern Ditch', type: 'Strange Find', route: 'reeds', stage: 1, poiKey: 'marsh-watcher-tracks', description: 'A low ditch crosses the cut. A cold blue light moves beneath the reeds.' },
        { id: 'sunken-cart', name: 'Sunken Cart', type: 'Optional Salvage', route: 'reeds', stage: 1, optional: true, description: 'A partly submerged cart rests at the edge of the reed cut.' },
        { id: 'wayfarers-camp', name: "Wayfarer's Camp", type: 'Waystation', stage: 2, description: 'A shared clearing where travelers can rest, craft, and prepare for the dangerous stretch ahead.' },
        { id: 'blackroot-bend', name: 'Blackroot Bend', type: 'Dangerous Crossing', stage: 3, poiKey: 'blackroot-mark', description: 'Black roots buckle the road around a stone seal bearing the old mark.' },
        { id: 'reedwatch-shelter', name: 'Reedwatch Shelter', type: 'Shelter', stage: 4, poiKey: 'reedwatch-locker', description: 'An abandoned watch shelter whose locker may hold useful records.' },
        { id: 'greyfen-boundary', name: 'Greyfen Boundary', type: 'Regional Threshold', stage: 5, poiKey: 'greyfen-marker', description: 'The last marker and the boundary stone before Greyfen.' }
      ],
      edges: [
        { from: 'south-fork', to: 'high-ridge', route: 'ridge', kind: 'main' },
        { from: 'south-fork', to: 'reed-cut', route: 'reeds', kind: 'main' },
        { from: 'high-ridge', to: 'ridgeway-cairn', route: 'ridge', kind: 'main' },
        { from: 'ridgeway-cairn', to: 'windbreak', route: 'ridge', kind: 'optional' },
        { from: 'ridgeway-cairn', to: 'wayfarers-camp', route: 'ridge', kind: 'main' },
        { from: 'windbreak', to: 'ridgeway-cairn', route: 'ridge', kind: 'return' },
        { from: 'windbreak', to: 'wayfarers-camp', route: 'ridge', kind: 'main' },
        { from: 'reed-cut', to: 'lantern-ditch', route: 'reeds', kind: 'main' },
        { from: 'lantern-ditch', to: 'sunken-cart', route: 'reeds', kind: 'optional' },
        { from: 'lantern-ditch', to: 'wayfarers-camp', route: 'reeds', kind: 'main' },
        { from: 'sunken-cart', to: 'lantern-ditch', route: 'reeds', kind: 'return' },
        { from: 'sunken-cart', to: 'wayfarers-camp', route: 'reeds', kind: 'main' },
        { from: 'wayfarers-camp', to: 'blackroot-bend', kind: 'main' },
        { from: 'blackroot-bend', to: 'reedwatch-shelter', kind: 'main' },
        { from: 'reedwatch-shelter', to: 'greyfen-boundary', kind: 'main' }
      ]
    },
    travelBeats: {
      0: 'Ashmere’s lanterns shrink behind you as the fork opens into two uncertain tracks.',
      1: 'The road dips sharply. Cart tracks disappear into reeds, and a small blue glimmer moves where the water should be still.',
      2: 'The trees loosen their grip and a cold firepit appears through the brush. Someone made camp here—and left in a hurry.',
      3: 'The sheltered clearing falls behind you. Black roots buckle the road ahead, and the old bell-mark is split across a stone at your feet.',
      4: 'The roots give way to an abandoned watch shelter. Its roof still holds, but something has scratched at the door from the outside.',
      5: 'The last road marker emerges from the mist. Greyfen begins beyond it, quiet enough that you can hear water moving under the stones.'
    },
    routeFeedback: {
      ridge: ' The High Ridge pays off: firm ground keeps the journey calm, and Road Pressure rises by only {pressure}.',
      reeds: ' The Reed Cut narrows behind you. The strange light has drawn attention from deeper in the marsh; Road Pressure rises by {pressure}.'
    },
    checks: [
      {id:'scout', title:'A Split in the Mud', text:'Cart tracks divide around a flooded ditch. One path is quiet. The other smells like smoke.', skill:'survival', risk:'Moderate', success:'You read the mud and avoid a bad crossing.', fail:'The soft ground grabs your boots and costs supplies.'},
      {id:'help', title:'A Wagon Wheel Turns Alone', text:'A trader crouches beside a broken wheel, watching the trees more than the axle.', skill:'strength', risk:'Low', success:'You help repair the wheel and earn a grateful rumor.', fail:'The repair takes too long and the road grows colder.'},
      {id:'study', title:'Old Stones Beside the Road', text:'Three stones lean together, each carved with a bell mark worn almost smooth.', skill:'lore', risk:'Low', success:'You understand enough to mark the place for Brenn.', fail:'The mark means nothing yet, but the silence around it does.'}
    ],
    enemies: [
      {id:'goblin', behavior:'raider', name:'Road Goblin', hp:[24,38], damage:[3,8], reward:'fur', text:'A hunched goblin slips from behind a mile-marker, knife low and eyes bright.'},
      {id:'wolf', behavior:'predator', name:'Blackroot Wolf', hp:[30,46], damage:[4,10], reward:'fur', text:'A lean wolf follows your shadow until the road narrows.'},
      {id:'wisp', behavior:'flicker', name:'Lantern Wisp', hp:[20,34], damage:[3,9], reward:'bellFragment', text:'A pale light leaves an old lantern and drifts across your path.'}
    ],
    finds: [
      {id:'cache', title:'Roadside Cache', text:'A loose stone hides old traveler supplies.', item:'food', amount:1},
      {id:'token', title:'Mile-Marker Token', text:'A small stamped token hangs from a nail in the post.', item:'roadToken', amount:1},
      {id:'wood', title:'Fallen Branches', text:'Dry enough to carry, valuable enough not to ignore.', item:'log', amount:2},
      {id:'herbs', title:'Roadside Herbs', text:'You find hardy herbs growing beneath a broken mile-marker.', item:'roadHerb', amount:1},
      {id:'cloth', title:'Abandoned Supply Wrap', text:'A torn bundle contains usable cloth and a few clean strips.', item:'clothScrap', amount:1}
    ]
  };

  // Resolve route-dependent scene presentation without putting narrative rules in
  // the expedition controller. This is pure content lookup; it does not mutate saves.
  window.LegendRoadsV100.resolveScene = (stage, routeChoice) => {
    const scenes = window.LegendRoadsV100.oldRoad?.scenes || [];
    const numericStage = Number(stage || 0);
    const requestedIndex = Number.isFinite(numericStage) ? Math.floor(numericStage) : 0;
    const index = Math.max(0, Math.min(Math.max(0, scenes.length - 1), requestedIndex));
    const area = { ...(scenes[index] || {
      name: 'Old Road',
      type: 'Road',
      text: 'The road disappears into the mist.',
      icon: '↗'
    }) };
    const variant = area.routeVariants?.[routeChoice];
    if (variant && typeof variant === 'object') Object.assign(area, variant);
    if (index === 1 && routeChoice === 'ridge') {
      Object.assign(area, { name: 'Ridgeway Cairn', type: 'Trail Clue', text: 'The High Ridge crests at a stack of old stones above the marsh. One stone sits beyond its weathered groove.' });
    } else if (index === 1 && routeChoice === 'reeds') {
      Object.assign(area, { name: 'Lantern Ditch', type: 'Strange Find', text: 'The Reed Cut narrows into a low ditch. A cold blue light flickers under the reeds, and the water hides the bottom.' });
    }
    delete area.routeVariants;
    return area;
  };
})();
