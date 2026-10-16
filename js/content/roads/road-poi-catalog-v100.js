/* LEGEND v0.20.36 - contextual Old Road points-of-interest catalog.
 * Owns narrative point selection when route choice or player evidence changes which
 * clue should appear. Panels live in road-discovery-view; effects live in road-poi-outcomes.
 */
(() => {
  function create(context = {}) {
    const {
      getPlayer,
      ensureState,
      getRoadData,
      clamp: clampInput
    } = context;
    if (typeof getPlayer !== 'function' ||
        typeof ensureState !== 'function' ||
        typeof getRoadData !== 'function') return null;

    const p = getPlayer;
    const ensure = ensureState;
    const road = getRoadData;
    const clamp = typeof clampInput === 'function'
      ? clampInput
      : (value, min, max) => Math.max(min, Math.min(max, value));

    function pointOfInterest(stage){
     const points=road().pointsOfInterest||[],index=clamp(Number(stage||0),0,5);
     const point={...(points[index]||{key:'road-marker',name:'Roadside Marker',kind:'Trail Clue',text:'The road holds a faint sign of passage.',action:'Inspect the marker',icon:'⌖',short:'Marker',x:50,y:50})};
     if(index===2){
      const pl=p();
      if(pl?.flags?.greyfenLedgerCompared&&!pl?.flags?.greyfenWeeklyReturnFound){
       return {key:'camp-firepit',name:'The Earlier Weekly Return',kind:'Route Record',text:'Beneath a warped plank beside the abandoned firepit, you find an oilskin packet. The weekly return predates the overwritten Greyfen entries: “Lower crossing — CLOSED pending inspection.” A second line, in darker ink, says “OPEN” but has no initials.',action:'Recover the weekly route return',icon:'▤',short:'Route return',x:28,y:57};
      }
     }
     if(index===4){
      const pl=p();
      if(pl?.flags?.greyfenArchiveRead&&!pl?.flags?.greyfenFieldNoteFound){
       return {key:'reedwatch-locker',name:'A Dated Field Note',kind:'Route Record',text:'Inside the swollen locker, beneath a wrap of oilcloth, you find a rain-blurred field note. Its date falls two days after Greyfen logged the flood’s retreat, and the sketch already shows the newer cut pointing toward the reed bed. The signature has run to ink.',action:'Recover the field note',icon:'▣',short:'Field note',x:25,y:52};
      }
     }
     if(index===5){
      const pl=p();
      if(pl?.flags?.bellRoadSearched){
       return {key:'greyfen-marker',name:'The Greyfen Boundary Stone',kind:'Regional Clue',text:'The same bell-mark from Blackroot appears beneath a newer cut. That later groove points toward the reed bed, away from the raised line.',action:'Compare the marks with your Blackroot notes',icon:'⚑',short:'Boundary',x:78,y:48};
      }
     }
     if(index===1){
      const pl=p(),route=pl?ensure(pl).routeChoice:null;
      if(route==='ridge'){
       const prior=pl?.flags?.highRidgeCairnOutcome||pl?.flags?.sideContracts?.movedCairn?.decision;
       const cairnText=prior==='restore'
        ?'The cairn sits in the older groove you restored. A fresh scrape still shows where the stone was moved; the tracks now bend toward firmer ground.'
        :prior==='record'
         ?'Chalk marks preserve both positions of the shifted stone. Two sets of cart tracks pass without agreeing on the same line.'
         :prior==='warn'
          ?'A strip of cloth marks the shifted stone as unsafe. Travelers are keeping their distance, but the original alignment remains unresolved.'
          :'A stack of old stones marks a dry line above the floodwater. One stone sits outside a weathered groove, and cart tracks turn toward the lower ground. Someone has tucked road herbs behind the cairn.';
       const cairnAction=prior?'Examine the cairn and trail marks':'Collect the trail herbs';
       return {key:'ridge-cairn',name:'The Ridgeway Cairn',kind:'Trail Clue',text:cairnText,action:cairnAction,icon:'⌖',short:'Cairn',x:76,y:48};
      }
      if(route==='reeds')return {key:'marsh-watcher-tracks',name:'Tracks Beneath the Blue Light',kind:'Danger Sign',text:'The blue glow has gone dark. Long, narrow tracks circle your own bootprints, and a torn herb pouch lies in the mud.',action:'Recover the dropped herbs',icon:'✧',short:'Tracks',x:76,y:48};
     }
     return point;
    }

    return Object.freeze({ resolve: pointOfInterest });
  }

  window.LegendRoadPoiCatalogV100 = Object.freeze({ create });
})();
