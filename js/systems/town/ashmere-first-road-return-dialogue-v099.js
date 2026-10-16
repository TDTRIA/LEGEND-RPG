/* LEGEND Ashmere first secured-road-return dialogue.
 * Resolves Mara, Brenn, and Oric's route/discovery-specific briefing copy using
 * the established first-return flags. Does not save, mutate flags, or render UI.
 */
(() => {
  function apply(player, id, greyfen, dialogue) {
    if (greyfen || !player || !dialogue || !player.flags?.firstRoadReturnSeen) return false;
    const pl = player;
    const n = dialogue;
    if(!greyfen&&pl.flags?.firstRoadReturnSeen){
      const route=pl.flags.firstRoadReturnRoute||'unknown';
      const discovery=pl.flags.firstRoadReturnDiscovery||'none';
      if(id==='mara'){
        if(pl.flags.greyfenArchiveRead){
          n.lines=[
            'The Greyfen archive now preserves both surfaces, but we still do not know when the newer cut was made.',
            'The matching mark shows that the Blackroot seal and the boundary stone belong in the same record. It does not identify the hand that changed either stone.',
            'We need a dated field note or another physical trace before we can say when the route was altered.'
          ];
        }else if(pl.flags.greyfenBoundaryCompared){
          n.lines=[
            'You found the same older bell-mark at the Greyfen Approach beneath a newer cut. That is stronger evidence than either stone alone.',
            'Do not move the boundary stone. Bring the comparison to my desk in Greyfen so I can preserve both surfaces in the archive.',
            'The marker shows an alteration, but not who made it or why.'
          ];
        }else if(pl.flags.bellRoadSearched){
          n.lines=[
            'The Blackroot seal bears the same bell-mark you saw near Ashmere. A repeated symbol is evidence of a pattern, not a complete explanation.',
            'I will keep the seal and your first route report together. The record must preserve what we saw, not what we wish it meant.',
            'When Greyfen’s Boundary Archive is available, compare its old marks against this one.'
          ];
        }else if(route==='ridge'&&discovery==='ridge-cairn'){
          n.lines=[
            'The Ridgeway Cairn marks a dry line above the low ground. That tells us how travelers were meant to pass, not why the bell rang.',
            'I want the cairn’s mark recorded beside the old route sketches. A second account may show whether the line has been kept or changed.',
            'Next, inspect the bell-marked seal at Blackroot Bend and bring back what you can actually observe.'
          ];
        }else if(route==='reeds'&&discovery==='marsh-watcher-tracks'){
          n.lines=[
            'The Bell Fragment is physical evidence, and the tracks beneath the blue light are another observation. Neither tells us who—or what—made them.',
            'I will record the fragment without assigning it a purpose. The route records disagree about the lower path.',
            'Next, inspect the bell-marked seal at Blackroot Bend and bring back what you can actually observe.'
          ];
        }else if(route==='ridge'){
          n.lines=[
            'You kept to the High Ridge and returned. I can record the route, but I still need a close observation of its markers before comparing them with the archive.',
            'A safer passage is useful evidence; it is not an explanation for the single bell.',
            'Next, inspect the bell-marked seal at Blackroot Bend and bring back what you can actually observe.'
          ];
        }else if(route==='reeds'){
          n.lines=[
            'You brought back a Bell Fragment from the Reed Cut. That confirms the metal is real; it does not tell us why it lay beneath the blue light.',
            'I will leave the source of the tracks unassigned until we have a description that can be checked.',
            'Next, inspect the bell-marked seal at Blackroot Bend and bring back what you can actually observe.'
          ];
        }else{
          n.lines=[
            'Your return gives us an account to work from, but we should not decide what the bell meant yet.',
            'I will record the observations separately from our guesses.',
            'Next, inspect the bell-marked seal at Blackroot Bend and bring back what you can actually observe.'
          ];
        }
      }else if(id==='brenn'){
        n.lines=route==='ridge'?[
          'I have recorded your return from the High Ridge. A route report tells me where you went; it does not promise the path will stay safe.',
          'If a marker is moved, a tidy ledger can still be wrong. Tell me what you saw, not what you suspect.'
        ]:route==='reeds'?[
          'The Bell Fragment is entered in the ledger. That proves you brought back metal; it does not prove who placed it in the mud.',
          'I will leave the route report open until the tracks can be described and checked.'
        ]:[
          'You are back with a report. I will record what you observed separately from what you believe it means.'
        ];
      }else if(id==='oric'){
        n.lines=route==='ridge'?[
          'The ridge was the cautious choice. Keep watching the cairns next time; a safer route can still be changed by careless hands.',
          'Report a damaged marker before you try to repair it. I need to know what was there first.'
        ]:route==='reeds'?[
          'You came back from the Reed Cut. Good. Next time, do not follow a light or a set of tracks unless you have a clear way to retreat.',
          'If the marks look wrong, leave them where they are and bring back a description.'
        ]:[
          'You returned. Keep the next report practical: route, conditions, signs of trouble, and a way out.'
        ];
      }
    }

    return true;
  }

  window.LegendAshmereFirstRoadReturnDialogueV099 = Object.freeze({ apply });
})();
