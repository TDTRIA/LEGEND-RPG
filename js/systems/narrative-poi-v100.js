// LEGEND v0.20.x - Old Road narrative and point-of-interest data
// Owns stage descriptions and contextual POI definitions; gameplay mutations stay in the controller.
(() => {
  function create({ p, ensure, clamp }) {
    function areaForStage(stage){
      const areas=[
        {name:'South Fork',type:'Crossroads',text:'Two muddy tracks leave Ashmere behind. The lanterns are still visible, but the road is already asking you to choose carefully.',icon:'↗'},
        {name:'Lantern Ditch',type:'Roadside Hazard',text:'A low ditch cuts across the old stone road. Cart tracks vanish into the reeds and something glimmers in the mud.',icon:'⌁'},
        {name:"Wayfarer's Camp",type:'Rest & Craft',text:'A sheltered clearing sits just off the road. Old firewood is stacked beneath a canvas lean-to; someone planned to return.',icon:'⌂',camp:true},
        {name:'Blackroot Bend',type:'Dangerous Crossing',text:'Black roots buckle the road and the trees crowd close. The air is damp, and the next mile feels watched.',icon:'✦'},
        {name:'Reedwatch Shelter',type:'Rest & Craft',text:'An abandoned watch shelter overlooks the lowlands. Its roof holds, its hearth can be lit, and its worktable is still usable.',icon:'⌂',camp:true},
        {name:'Greyfen Approach',type:'Regional Threshold',text:'The road slopes toward Greyfen. Beyond the last marker, reeds and drowned stone stretch into the mist.',icon:'⚑'}
      ];
      const index=clamp(Number(stage||0),0,5),pl=p(),s=pl?ensure(pl):{};
      if(index===2&&s.routeChoice==='ridge')areas[index].text='The High Ridge drops into a sheltered clearing. Dry kindling and a line of pale stones make this a safer place to rest; the ridge markers continue beyond the firepit.';
      if(index===2&&s.routeChoice==='reeds')areas[index].text='The Reed Cut spills into a sheltered clearing, but wet reeds cling to your boots and long tracks circle the firepit. The blue light is gone; something followed you out.';
      return areas[index];
    }
    function pointOfInterest(stage){
     const points=[
      {key:'fork-marker',name:'The Split Milestone',kind:'Trail Clue',text:'Fresh cart tracks split around a toppled mile-marker. One set avoids the flooded ground.',action:'Read the tracks',icon:'⌖',short:'Milestone',x:26,y:48},
      {key:'ditch-lantern',name:'A Lantern in the Reeds',kind:'Strange Find',text:'A cold blue glow flickers beneath the ditch grass. It might be a lost charm—or bait.',action:'Investigate the glow',icon:'✧',short:'Lantern',x:76,y:48},
      {key:'camp-firepit',name:'The Abandoned Firepit',kind:'Useful Supplies',text:'Under the ash you spot a dry tinder bundle and a few scraps left by the last travelers.',action:'Salvage the firepit',icon:'♨',short:'Firepit',x:28,y:57},
      {key:'blackroot-mark',name:'Roots Around an Old Seal',kind:'Old Road Mystery',text:'The black roots have split a stone seal bearing the same bell-mark found near Ashmere.',action:'Study the seal',icon:'✦',short:'Old seal',x:78,y:53},
      {key:'reedwatch-locker',name:'The Shelter Locker',kind:'Forgotten Stores',text:'A swollen wooden locker sits beneath a shelter bench, held shut by a rusted catch.',action:'Open the locker',icon:'▣',short:'Locker',x:25,y:52},
      {key:'greyfen-marker',name:'The Greyfen Boundary Stone',kind:'Regional Clue',text:'The boundary stone is scored with route marks. A few fresh scratches point beyond the reeds.',action:'Record the route marks',icon:'⚑',short:'Boundary',x:78,y:48}
     ];
     const index=clamp(Number(stage||0),0,5);
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
     return points[index];
    }
    return { areaForStage, pointOfInterest };
  }
  window.LegendNarrativePoiV100 = { create };
})();
