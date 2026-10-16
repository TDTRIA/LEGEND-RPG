/* LEGEND v0.20.36 - Old Road action resolution.
 * Owns travel/search decisions, pressure changes, road checks, resource finds and
 * random encounter selection. Rendering, persistence, progression data and combat
 * are injected so new road actions can be added without widening the controller.
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
function resolveChoice(kind){
 const pl=p();if(!pl)return;const s=ensure(pl),stageBefore=s.stage,area=areaForStage(stageBefore);
 s.events=Number(s.events||0)+1;
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
 const openingRoute=stageBefore===0?s.routeChoice:null;
 const travelPressure=openingRoute==='ridge'?4:openingRoute==='reeds'?16:12;
 s.pressure=clamp(s.pressure+travelPressure,0,100);
 if(s.pressure>=65){s.discoveryOpen=false;s.discoveryStage=null;save(pl);return battleEvent()}
 const roadSense=score(pl,'survival')+score(pl,'strength');
 s.stage=clamp(s.stage+1,0,5);
 s.discoveryOpen=false;s.discoveryStage=null;
 const destination=areaForStage(s.stage);
 const routeBeat=openingRoute==='ridge'?' The High Ridge pays off: firm ground keeps the journey calm, and Road Pressure rises by only 4.':openingRoute==='reeds'?' The Reed Cut narrows behind you. The strange light has drawn attention from deeper in the marsh; Road Pressure rises by 16.':'';
 const travelBeat=s.stage===5
  ?'The last road marker emerges from the mist. Greyfen begins beyond it, quiet enough that you can hear water moving under the stones.'
  :s.stage===2
   ?'The trees loosen their grip and a cold firepit appears through the brush. Someone made camp here—and left in a hurry.'
   :s.stage===3
    ?'The sheltered clearing falls behind you. Black roots buckle the road ahead, and the old bell-mark is split across a stone at your feet.'
    :s.stage===4
     ?'The roots give way to an abandoned watch shelter. Its roof still holds, but something has scratched at the door from the outside.'
     :s.stage===1
      ?'The road dips sharply. Cart tracks disappear into reeds, and a small blue glimmer moves where the water should be still.'
      :'Ashmere’s lanterns shrink behind you as the fork opens into two uncertain tracks.';
 if(roadSense<0){const loss=Math.min(Math.max(0,Number(pl.hp||1)-1),3);pl.hp=Number(pl.hp||1)-loss;s.pressure=clamp(s.pressure+5,0,100);save(pl);return renderExpedition('You push hard away from '+area.name+'. The pace costs '+loss+' health, but you reach '+destination.name+'. '+travelBeat+routeBeat)}
 save(pl);return renderExpedition('You leave '+area.name+' behind and arrive at '+destination.name+'. '+travelBeat+routeBeat);
}
function eventCheck(skill,bonus){
 const pl=p();if(!pl)return;const s=ensure(pl),ev=pick(road().checks)||{title:'A Strange Silence',text:'The road goes quiet around you.',skill:'survival',success:'You keep your footing.',fail:'The silence costs time and nerves.'};
 const actual=ev.skill||skill,modifier=score(pl,actual)+Number(bonus||0),success=modifier>=0;
 s.stage=clamp(s.stage+1,0,5);
 if(success){s.pressure=clamp(s.pressure-4,0,100);pl.stats=pl.stats||{};pl.stats.checksPassed=Number(pl.stats.checksPassed||0)+1;save(pl);return renderExpedition(ev.success+' Your '+skillLabel(actual).toLowerCase()+' helps you make steady progress.')}
 const loss=Math.min(Math.max(0,Number(pl.hp||1)-1),3+Math.max(0,-modifier));pl.hp=Number(pl.hp||1)-loss;s.pressure=clamp(s.pressure+5,0,100);pl.stats=pl.stats||{};pl.stats.checksFailed=Number(pl.stats.checksFailed||0)+1;save(pl);return renderExpedition(ev.fail+' You lose '+loss+' HP, but keep moving.');
}
function battleEvent(){
 const pl=p();if(!pl)return;const s=ensure(pl),base=pick(road().enemies);if(!base)return eventCheck('survival',2);
 const enemy={...base,hp:rand(base.hp?.[0]||20,base.hp?.[1]||35)};enemy.maxHp=enemy.hp;enemy.intent='attack';
 s.battles=Number(s.battles||0)+1;save(pl);combat(enemy);
}

    return Object.freeze({resolveChoice});
  }
  window.LegendRoadActionsV100=Object.freeze({create});
})();
