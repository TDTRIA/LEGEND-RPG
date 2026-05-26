// LEGEND v0.8.7 - Old Road Content
// Data-only road content for the new road controller.
(() => {
  window.LegendRoadsV087 = window.LegendRoadsV087 || {};
  window.LegendRoadsV087.oldRoad = {
    id: 'old-road',
    name: 'The Old Road',
    subtitle: 'Ashmere to the forgotten mile-markers',
    description: 'A wet, lantern-marked road where travelers vanish, monsters follow cart tracks, and every safe mile still costs something.',
    stages: ['Ashmere Gate','Lantern Ditch','Stone Mile','Blackroot Bend','Broken Signpost'],
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
      {id:'wood', title:'Fallen Branches', text:'Dry enough to carry, valuable enough not to ignore.', item:'log', amount:2}
    ]
  };
})();
