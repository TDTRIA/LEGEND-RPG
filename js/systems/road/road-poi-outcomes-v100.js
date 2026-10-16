/* LEGEND v0.20.36 - Old Road point-of-interest inspection outcomes.
 * Owns the effects of examining a discovered point: evidence recording, items,
 * gold, pressure, counters, save, and narrative feedback. Discovery owns visibility.
 */
(() => {
  function create(context = {}) {
    const {
      getPlayer,
      savePlayer,
      ensureState,
      addInventory,
      clamp: clampInput,
      bellRoadEvidence,
      getPointOfInterest,
      clearVisibleDiscovery,
      renderExpedition,
      tone
    } = context;

    if (typeof getPlayer !== 'function' ||
        typeof savePlayer !== 'function' ||
        typeof ensureState !== 'function' ||
        typeof addInventory !== 'function' ||
        typeof getPointOfInterest !== 'function' ||
        typeof bellRoadEvidence?.recordPointEvidence !== 'function' ||
        typeof renderExpedition !== 'function') return null;

    const p = getPlayer;
    const save = savePlayer;
    const ensure = ensureState;
    const inv = addInventory;
    const pointOfInterest = getPointOfInterest;
    const clamp = typeof clampInput === 'function'
      ? clampInput
      : (value, min, max) => Math.max(min, Math.min(max, value));

    function inspect(){
     const pl=p();if(!pl)return;const s=ensure(pl),stage=clamp(Number(s.stage||0),0,5),point=pointOfInterest(stage);
     s.poiUsed=s.poiUsed||{};
     if(s.poiUsed[point.key])return renderExpedition('You have already investigated this spot on the current expedition.');
     s.poiUsed[point.key]=true;s.discoveryOpen=false;s.discoveryStage=null;if (typeof clearVisibleDiscovery === 'function') clearVisibleDiscovery();
     const {foundGreyfenFieldNote,foundGreyfenWeeklyReturn}=bellRoadEvidence.recordPointEvidence(pl,point);
     let note='',reward='';
     if(stage===0){pl.gold=Number(pl.gold||0)+5;s.pressure=clamp(s.pressure-4,0,100);note='You follow the drier tracks and find a small coin purse caught beneath the marker. +5 gold; Road Pressure falls by 4.';}
     else if(stage===1&&s.routeChoice==='ridge'){
      inv(pl,'roadHerb',1);s.pressure=clamp(s.pressure-3,0,100);
      const cairnOutcome=pl.flags?.highRidgeCairnOutcome||pl.flags?.sideContracts?.movedCairn?.decision;
      note=cairnOutcome==='restore'
       ?'You check the cairn you reset and compare its fresh scrape with the older groove. A Road Herb remains tucked behind the stones. +1 Road Herb; Road Pressure falls by 3.'
       :cairnOutcome==='record'
        ?'Your notes preserve both positions; the chalk still matches the groove beneath the shifted stone. You recover a Road Herb. +1 Road Herb; Road Pressure falls by 3.'
        :cairnOutcome==='warn'
         ?'The warning cloth still marks the shifted cairn. You check the track without moving the stone and recover a Road Herb. +1 Road Herb; Road Pressure falls by 3.'
         :'You collect the herbs tucked behind the Ridgeway Cairn and follow its dry trail marks. +1 Road Herb; Road Pressure falls by 3.';
     }
     else if(stage===1&&s.routeChoice==='reeds'){inv(pl,'roadHerb',1);s.pressure=clamp(s.pressure+4,0,100);note='You recover the torn herb pouch, but the tracks circle closer as you leave. +1 Road Herb; Road Pressure rises by 4.';}
     else if(stage===1){inv(pl,'bellFragment',1);s.pressure=clamp(s.pressure+2,0,100);note='The blue glow fades into a Bell Fragment in your palm. The ditch feels less quiet now. +1 Bell Fragment.';}
     else if(stage===2){
      inv(pl,'food',1);inv(pl,'roadHerb',1);
      note=foundGreyfenWeeklyReturn
       ?'The oilskin return is damp but legible: the lower crossing was closed pending inspection, then changed to open in darker ink without initials. You wrap it separately for Brenn. +1 Ration, +1 Road Herb.'
       :'You recover a sealed ration and a usable Road Herb from the cold ashes. +1 Ration, +1 Road Herb.';
     }
     else if(stage===3){s.pressure=clamp(s.pressure-8,0,100);inv(pl,'bellFragment',1);note='The seal’s pattern matches an old Ashmere mark. You take a Bell Fragment and learn a safer way around the roots. +1 Bell Fragment; Road Pressure falls by 8.';}
     else if(stage===4){
      inv(pl,'clothScrap',1);inv(pl,'roadHerb',1);
      note=foundGreyfenFieldNote
       ?'You copy the date and sketch before wrapping the field note for Mara. The newer cut is already drawn two days after Greyfen logged the flood’s retreat. +1 Cloth Scrap, +1 Road Herb.'
       :'The locker gives way. Inside are clean cloth strips and a bundle of preserved herbs. +1 Cloth Scrap, +1 Road Herb.';
     }
     else if(stage===5&&point.key==='greyfen-marker'&&pl.flags?.greyfenBoundaryCompared){
      pl.gold=Number(pl.gold||0)+10;s.pressure=clamp(s.pressure-5,0,100);pl.flags=pl.flags||{};pl.flags.greyfenRouteRecorded=true;
      note='The Greyfen boundary mark matches the older bell-mark at Blackroot, but a newer cut turns toward the reed bed. The stone shows that someone altered the marker; it does not say who. +10 gold; Road Pressure falls by 5.';
     }
     else {pl.gold=Number(pl.gold||0)+10;s.pressure=clamp(s.pressure-5,0,100);pl.flags=pl.flags||{};pl.flags.greyfenRouteRecorded=true;note='You copy the scratched route marks into your journal. The safer line is recorded, and you find 10 gold wedged behind the stone.';}
     pl.stats=pl.stats||{};pl.stats.pointsOfInterest=Number(pl.stats.pointsOfInterest||0)+1;save(pl);
     tone('success');renderExpedition(note);
    }

    return Object.freeze({ inspect });
  }

  window.LegendRoadPoiOutcomesV100 = Object.freeze({ create });
})();
