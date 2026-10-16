/* LEGEND v0.20.36 - Old Road branch/side-story decisions.
 * Applies route-fork and moved-cairn choices to expedition state. Presentation
 * is owned by road-discovery-view-v100; inspection rewards live in road-poi-outcomes-v100.
 */
(() => {
  function create(context = {}) {
    const {
      getPlayer,
      savePlayer,
      ensureState,
      addInventory,
      clamp: clampInput,
      renderExpedition
    } = context;

    if (typeof getPlayer !== 'function' ||
        typeof savePlayer !== 'function' ||
        typeof ensureState !== 'function' ||
        typeof addInventory !== 'function' ||
        typeof renderExpedition !== 'function') return null;

    const p = getPlayer;
    const save = savePlayer;
    const ensure = ensureState;
    const inv = addInventory;
    const clamp = typeof clampInput === 'function'
      ? clampInput
      : (value, min, max) => Math.max(min, Math.min(max, value));

    function chooseMovedCairnDecision(decision){
     const pl=p();if(!pl)return;
     const s=ensure(pl),contract=pl.flags?.sideContracts?.movedCairn;
     if(s.stage!==1||s.routeChoice!=='ridge'||!s.poiUsed?.['ridge-cairn']||!contract||contract.complete||contract.decision)return renderExpedition('The cairn report is no longer open on this stretch.');
     const outcomes={
      restore:{
       title:'The older groove takes the stone',
       result:'You ease the stone back into the weathered groove. The face settles with a gritty scrape. It now points toward the higher line, but the fresh marks make it clear that someone moved it—and you still do not know why.',
       memory:'On the Ridgeway, you restored the cairn stone to its older groove. The fresh scrape records your intervention; the reason for the original move remains unknown.'
      },
      record:{
       title:'Both alignments are recorded',
       result:'You sketch the stone as it stands, then copy the older groove beneath it. You leave the cairn untouched. Anyone who follows can compare the two positions instead of trusting a single clean-looking mark.',
       memory:'At the Ridgeway Cairn, you recorded both the shifted stone and its older groove without moving it. The route evidence is preserved, but the safe alignment remains unsettled.'
      },
      warn:{
       title:'A warning marks the stone',
       result:'You tie a strip of cloth where the track narrows and leave the stone in place. The warning may keep a cart from taking the lower line, but it cannot tell travelers which mark to trust.',
       memory:'At the Ridgeway Cairn, you marked the shifted stone as a hazard and left it untouched. Travelers are warned, but the route still needs a proper survey.'
      }
     };
     const outcome=outcomes[decision];if(!outcome)return renderExpedition('That report choice is not available.');
     contract.decision=decision;
     contract.decisionStage=Number(s.stage||0);
     pl.flags=pl.flags||{};
     pl.memories=Array.isArray(pl.memories)?pl.memories:[];
     if(!pl.memories.includes(outcome.memory))pl.memories.push(outcome.memory);
     save(pl);
     renderExpedition(outcome.result);
    }

    function chooseRoadRoute(route){
     const pl=p();if(!pl)return;const s=ensure(pl);
     if(Number(s.stage)!==0||s.routeChoice)return renderExpedition('The fork has already been settled for this expedition.');
     if(route==='ridge'){s.routeChoice='ridge';s.pressure=clamp(s.pressure-8,0,100);save(pl);return renderExpedition('You choose the High Ridge. The ground firms beneath your boots, and the road feels a little less watchful. Road Pressure falls by 8.');}
     s.routeChoice='reeds';inv(pl,'bellFragment',1);s.pressure=clamp(s.pressure+10,0,100);save(pl);return renderExpedition('You slip into the Reed Cut and pluck a Bell Fragment from the mud beside the blue light. Something stirs deeper in the reeds. +1 Bell Fragment; Road Pressure rises by 10.');
    }

    return Object.freeze({ chooseMovedCairnDecision, chooseRoadRoute });
  }

  window.LegendRoadDecisionsV100 = Object.freeze({ create });
})();
