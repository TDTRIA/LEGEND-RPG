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
      {name:"Wayfarer's Camp",type:'Rest & Craft',text:'A sheltered clearing sits just off the road. Old firewood is stacked beneath a canvas lean-to; someone planned to return.',icon:'⌂',camp:true},
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
    checks: [
      {id:'scout', title:'A Split in the Mud', text:'Cart tracks divide around a flooded ditch. One path is quiet. The other smells like smoke.', skill:'survival', risk:'Moderate', success:'You read the mud and avoid a bad crossing.', fail:'The soft ground grabs your boots and costs supplies.'},
      {id:'help', title:'A Wagon Wheel Turns Alone', text:'A trader crouches beside a broken wheel, watching the trees more than the axle.', skill:'strength', risk:'Low', success:'You help repair the wheel and earn a grateful rumor.', fail:'The repair takes too long and the road grows colder.'},
      {id:'study', title:'Old Stones Beside the Road', text:'Three stones lean together, each carved with a bell mark worn almost smooth.', skill:'lore', risk:'Low', success:'You understand enough to mark the place for Brenn.', fail:'The mark means nothing yet, but the silence around it does.'}
    ],
    enemies: [
      {id:'goblin', name:'Road Goblin', hp:[24,38], damage:[3,8], reward:'fur', text:'A hunched goblin slips from behind a mile-marker, knife low and eyes bright.'},
      {id:'wolf', name:'Blackroot Wolf', hp:[30,46], damage:[4,10], reward:'fur', text:'A lean wolf follows your shadow until the road narrows.'},
      {id:'wisp', name:'Lantern Wisp', hp:[20,34], damage:[3,9], reward:'bellFragment', text:'A pale light leaves an old lantern and drifts across your path.'}
    ],
    finds: [
      {id:'cache', title:'Roadside Cache', text:'A loose stone hides old traveler supplies.', item:'food', amount:1},
      {id:'token', title:'Mile-Marker Token', text:'A small stamped token hangs from a nail in the post.', item:'roadToken', amount:1},
      {id:'wood', title:'Fallen Branches', text:'Dry enough to carry, valuable enough not to ignore.', item:'log', amount:2},
      {id:'herbs', title:'Roadside Herbs', text:'You find hardy herbs growing beneath a broken mile-marker.', item:'roadHerb', amount:1},
      {id:'cloth', title:'Abandoned Supply Wrap', text:'A torn bundle contains usable cloth and a few clean strips.', item:'clothScrap', amount:1}
    ]
  };
})();
