/* LEGEND v0.20.38 - Old Road action resolution.
 * Owns expedition kickoff, travel/search decisions, pressure changes, road checks,
 * resource finds, and random encounter selection. Narrative copy lives in the road
 * content catalog; rendering, persistence, progression data and combat are injected.
 */
(() => {
  function create(context = {}) {
    const {
      getPlayer,
      savePlayer,
      ensureState,
      getRoadData,
      getScore,
      addInventory,
      pick,
      randomInt,
      clamp: clampValue,
      itemName,
      skillLabel,
      renderExpedition,
      combat,
      getAreaForStage
    } = context;
    if (typeof getPlayer !== 'function' || typeof savePlayer !== 'function' ||
        typeof ensureState !== 'function' || typeof getRoadData !== 'function' ||
        typeof getScore !== 'function' || typeof addInventory !== 'function' ||
        typeof pick !== 'function' || typeof randomInt !== 'function' ||
        typeof clampValue !== 'function' || typeof itemName !== 'function' ||
        typeof skillLabel !== 'function' || typeof renderExpedition !== 'function' ||
        typeof combat !== 'function' || typeof getAreaForStage !== 'function') return null;
    const p=getPlayer, save=savePlayer, ensure=ensureState, road=getRoadData;
    const score=getScore, inv=addInventory, rand=randomInt, clamp=clampValue;
    const areaForStage=getAreaForStage;
    function fieldJournal(player){
      player.flags=player.flags||{};
      player.flags.roadFieldJournalV150=player.flags.roadFieldJournalV150||{visitedPlaces:[],discoveries:[],routes:[]};
      const journal=player.flags.roadFieldJournalV150;
      journal.visitedPlaces=Array.isArray(journal.visitedPlaces)?journal.visitedPlaces:[];
      journal.discoveries=Array.isArray(journal.discoveries)?journal.discoveries:[];
      journal.routes=Array.isArray(journal.routes)?journal.routes:[];
      journal.campReports=Array.isArray(journal.campReports)?journal.campReports:[];
      return journal;
    }
    function recordVisit(player,stage){
      const area=areaForStage(stage),name=String(area?.name||'Old Road');
      const journal=fieldJournal(player);
      if(!journal.visitedPlaces.includes(name))journal.visitedPlaces.push(name);
    }
    function pushUnique(list,id){if(id&&!list.includes(id))list.push(id);}
    function graphNodeForStage(stage,route){
      if(stage<=0)return 'south-fork';
      if(stage===1)return route==='ridge'?'ridgeway-cairn':route==='reeds'?'lantern-ditch':'south-fork';
      return ({2:'wayfarers-camp',3:'blackroot-bend',4:'reedwatch-shelter',5:'greyfen-boundary'})[stage]||'south-fork';
    }
    function syncGraphNode(player,state,stage){
      state.visitedNodeIdsV160=Array.isArray(state.visitedNodeIdsV160)?state.visitedNodeIdsV160:[];
      state.discoveredNodeIdsV160=Array.isArray(state.discoveredNodeIdsV160)?state.discoveredNodeIdsV160:[];
      state.completedInteractionIdsV160=Array.isArray(state.completedInteractionIdsV160)?state.completedInteractionIdsV160:[];
      if(state.activeSideTripV160){
        state.currentNodeIdV160=state.activeSideTripV160;
        pushUnique(state.visitedNodeIdsV160,state.currentNodeIdV160);
        pushUnique(state.discoveredNodeIdsV160,state.currentNodeIdV160);
        return;
      }
      const mainNode=graphNodeForStage(stage,state.routeChoice);
      state.currentNodeIdV160=mainNode;
      pushUnique(state.visitedNodeIdsV160,'south-fork');
      if(Number(stage)>=1&&state.routeChoice==='ridge'){
        pushUnique(state.visitedNodeIdsV160,'high-ridge');
        pushUnique(state.visitedNodeIdsV160,'ridgeway-cairn');
      }else if(Number(stage)>=1&&state.routeChoice==='reeds'){
        pushUnique(state.visitedNodeIdsV160,'reed-cut');
        pushUnique(state.visitedNodeIdsV160,'lantern-ditch');
      }
      ['wayfarers-camp','blackroot-bend','reedwatch-shelter','greyfen-boundary'].slice(0,Math.max(0,Number(stage)-1)).forEach(id=>pushUnique(state.visitedNodeIdsV160,id));
      pushUnique(state.visitedNodeIdsV160,mainNode);
    }
function startExpedition(){
 const pl=p();if(!pl)return null;
 const s=ensure(pl);
 s.stage=0;
 s.poiUsed={};
 s.searchUsed={};
 s.readUsed={};
 s.campWatchUsed={};
 s.campRestUsed={};
 s.routeChoice=null;
 s.currentNodeIdV160=null;
 s.visitedNodeIdsV160=[];
 s.discoveredNodeIdsV160=[];
 s.completedInteractionIdsV160=[];
 s.activeSideTripV160=null;
 s.sideTripReturnNodeIdV160=null;
 syncGraphNode(pl,s,0);
 s.roadClockHour=15;
 s.lastEncounterTier=null;
 s.lastEncounterEnemy=null;
 const lanternWard=Number(pl.inventory?.wispLanternWick||0)>0;
 if(lanternWard)pl.inventory.wispLanternWick--;
 s.pressure=clamp(s.pressure+(lanternWard?3:8),0,100);
 s.trips=Number(s.trips||0)+1;
 recordVisit(pl,0);
 pl.flags.firstRoadEvent=true;
 save(pl);
 return lanternWard
  ?'You light the crafted Wisp Lantern Wick before leaving. Its pale flame steadies your nerves; opening Road Pressure rises by only 3 instead of 8. The wick is spent.'
  :(pl.flags?.openingRoadV140?.phase==='road'&&!pl.flags.openingRoadV140.completed?'Oric heads back to warn the gate. You follow the tracks beyond the fork, looking for what brought the wolf so close.':'You leave Ashmere with a clear route and a reason to come back.');
}
function resolveChoice(kind){
 const pl=p();if(!pl)return;const s=ensure(pl),stageBefore=s.stage;
 const graphNodes=road().routeGraphV160?.nodes||[];
 const activeNode=graphNodes.find(node=>node.id===s.activeSideTripV160);
 const area=activeNode?{name:activeNode.name,type:activeNode.type,text:activeNode.description}:areaForStage(stageBefore);
 s.events=Number(s.events||0)+1;
 if(kind==='search'&&stageBefore===0&&pl.flags?.openingRoadV140?.phase==='road'&&!pl.flags.openingRoadV140.completed&&!Object.values(s.poiUsed||{}).some(Boolean))return renderExpedition('Inspect the roadside marker before searching this stretch. Look for the glowing “Look closer” hotspot in the scene.');
 if(kind==='careful'){
   s.readUsed=s.readUsed||{};
   if(s.readUsed[s.stage])return renderExpedition('You have already studied this stretch of road.');
   s.readUsed[s.stage]=true;
   const roadSense=score(pl,'survival')+score(pl,'lore');
   const reduction=10+Math.max(0,roadSense);
   s.pressure=clamp(s.pressure-reduction,0,100);save(pl);
   return renderExpedition('You study the ground around '+areaForStage(s.stage).name+'. Road Pressure falls by '+reduction+'.'+(roadSense>=2?' Your road sense reveals a dry crossing and a useful trail marker.':''));
 }
 if(kind==='search'){
   s.searchUsed=s.searchUsed||{};
   if(s.searchUsed[s.stage])return renderExpedition('You have already searched this stretch of road.');
   s.searchUsed[s.stage]=true;
   const f=pick(road().finds)||{title:'Roadside Cache',text:'Something useful was left behind.',item:'food',amount:1};
   const aptitude=score(pl,'survival')+score(pl,'lore')+score(pl,'luck');
   const amount=Number(f.amount||1)+(aptitude>=4?1:0);
   inv(pl,f.item,amount);s.finds=Number(s.finds||0)+1;
   s.pressure=clamp(s.pressure+(aptitude>=3?1:5),0,100);
   pl.stats=pl.stats||{};pl.stats.resourcesFound=Number(pl.stats.resourcesFound||0)+1;save(pl);
   return renderExpedition(f.title+': '+f.text+' You recover '+itemName(f.item)+' ×'+amount+'. You can keep exploring here or travel onward.');
 }
 if(kind==='push'){
  const gate=window.LegendRoadOpeningV140?.travelGate?.(pl,s,stageBefore);
  if(gate?.allowed===false)return renderExpedition(gate.message);
  const clockTotal=clamp(Number(s.roadClockHour??15),0,23)+3;
  pl.day=Math.max(1,Number(pl.day||1)+Math.floor(clockTotal/24));
  s.roadClockHour=clockTotal%24;
 }
 const openingRoute=stageBefore===0?s.routeChoice:null;
 const travelPressure=openingRoute==='ridge'?4:openingRoute==='reeds'?16:12;
 s.pressure=clamp(s.pressure+travelPressure,0,100);
 if(s.pressure>=65){s.discoveryOpen=false;s.discoveryStage=null;save(pl);return battleEvent()}
 const roadSense=score(pl,'survival')+score(pl,'strength');
 s.stage=clamp(s.stage+1,0,5);
 s.activeSideTripV160=null;
 s.sideTripReturnNodeIdV160=null;
 syncGraphNode(pl,s,s.stage);
 recordVisit(pl,s.stage);
 s.discoveryOpen=false;s.discoveryStage=null;
 const destination=areaForStage(s.stage);
 const routeFeedback=road().routeFeedback?.[openingRoute]||'';
 const routeBeat=routeFeedback.replace('{pressure}',String(travelPressure));
 const travelBeat=road().travelBeats?.[s.stage]||'The road disappears into the mist.';
 if(roadSense<0){const loss=Math.min(Math.max(0,Number(pl.hp||1)-1),3);pl.hp=Number(pl.hp||1)-loss;s.pressure=clamp(s.pressure+5,0,100);save(pl);return renderExpedition('You push hard away from '+area.name+'. The pace costs '+loss+' health, but you reach '+destination.name+'. '+travelBeat+routeBeat)}
 save(pl);return renderExpedition('You leave '+area.name+' behind and arrive at '+destination.name+'. '+travelBeat+routeBeat);
}
function eventCheck(skill,bonus){
 const pl=p();if(!pl)return;const s=ensure(pl),ev=pick(road().checks)||{title:'A Strange Silence',text:'The road goes quiet around you.',skill:'survival',success:'You keep your footing.',fail:'The silence costs time and nerves.'};
 const actual=ev.skill||skill,modifier=score(pl,actual)+Number(bonus||0),success=modifier>=0;
 s.stage=clamp(s.stage+1,0,5);
 s.activeSideTripV160=null;
 s.sideTripReturnNodeIdV160=null;
 syncGraphNode(pl,s,s.stage);
 recordVisit(pl,s.stage);
 if(success){s.pressure=clamp(s.pressure-4,0,100);pl.stats=pl.stats||{};pl.stats.checksPassed=Number(pl.stats.checksPassed||0)+1;save(pl);return renderExpedition(ev.success+' Your '+skillLabel(actual).toLowerCase()+' helps you make steady progress.')}
 const loss=Math.min(Math.max(0,Number(pl.hp||1)-1),3+Math.max(0,-modifier));pl.hp=Number(pl.hp||1)-loss;s.pressure=clamp(s.pressure+5,0,100);pl.stats=pl.stats||{};pl.stats.checksFailed=Number(pl.stats.checksFailed||0)+1;save(pl);return renderExpedition(ev.fail+' You lose '+loss+' HP, but keep moving.');
}
function battleEvent(){
 const pl=p();if(!pl)return;
 const s=ensure(pl),catalog=road().enemies||[],pressure=Number(s.pressure||0),route=s.routeChoice;
 if(!catalog.length)return eventCheck('survival',2);
 // Pressure changes both who finds the traveler and how dangerous the encounter is.
 let base=null;
 if(pressure>=82&&route==='reeds')base=catalog.find(enemy=>enemy.id==='wisp')||null;
 if(pressure>=82&&!base)base=catalog.find(enemy=>enemy.id==='wolf')||null;
 if(pressure>=72&&!base&&route==='reeds')base=catalog.find(enemy=>enemy.id==='wolf')||null;
 base=base||pick(catalog);
 const tier=pressure>=82?'severe':pressure>=72?'high':'rising';
 const hpScale=tier==='severe'?1.3:tier==='high'?1.16:1;
 const damageBonus=tier==='severe'?2:tier==='high'?1:0;
 const rolledHp=rand(base.hp?.[0]||20,base.hp?.[1]||35);
 const enemy={...base,hp:Math.ceil(rolledHp*hpScale),pressureTier:tier,damage:[Math.max(1,Number(base.damage?.[0]||3)+damageBonus),Math.max(2,Number(base.damage?.[1]||8)+damageBonus)]};
 enemy.maxHp=enemy.hp;
 let encounterNote='';
 if(tier==='severe'){
  encounterNote=route==='reeds'
   ?'The Reed Cut has carried your noise into the marsh. A Lantern Wisp gathers itself from the blue glimmer; its presence is stronger in the rising dark. Read its intent and guard the heavy surge.'
   :'Your trail has drawn something relentless out of the dark. Road Pressure is critical: the encounter is stronger than an ordinary road attack.';
 }else if(tier==='high'){
  encounterNote=route==='reeds'
   ?'Water moves on both sides of the road. Something circles through the reeds before choosing its moment; this encounter is sharpened by the pressure you have carried.'
   :'You hear the creature before you see it. Your trail is easy to follow now, and the encounter is more dangerous than it would have been in daylight.';
 }else{
  encounterNote='A shape breaks from the roadside as pressure builds behind you. The road has noticed your pace.';
 }
 s.battles=Number(s.battles||0)+1;
 s.lastEncounterPressure=pressure;s.lastEncounterTier=tier;s.lastEncounterEnemy=enemy.name;
 save(pl);combat(enemy,encounterNote);
}

    return Object.freeze({start: startExpedition, resolveChoice});
  }
  window.LegendRoadActionsV100=Object.freeze({create});
})();
