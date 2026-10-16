// LEGEND v0.20.36 - Active Old Road Expedition Controller
// Mobile-first expedition loop. Meaningful choices replace visible D20 gates.
(() => {
const RT=()=>window.LegendRuntimeV120||{}, ROADS=()=>window.LegendRoadsV100||{}, A=()=>window.LegendAssetsV090||{}, root=()=>document.getElementById('root');
const esc=window.LegendHtmlV120.escapeHtml, p=()=>RT().loadPlayer?.()||null, save=pl=>RT().savePlayer?.(pl), ret=()=>RT().returnToAshmere?.();
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, clamp=(n,a,b)=>Math.max(a,Math.min(b,n)), pick=a=>a?.length?a[Math.floor(Math.random()*a.length)]:null;
const road=()=>ROADS().oldRoad||{stages:[],checks:[],finds:[],enemies:[]};
const roadRules=window.LegendRoadStateV100.create({getData:()=>window.LEGEND_DATA||{},clamp});
const {addInventory:inv,setBellQuestObjective,ensure,score,weapon,armor,hpPercent:hpPct,itemName,skillLabel}=roadRules;
const bellRoadEvidence=window.LegendBellRoadEvidenceV120?.create({setBellQuestObjective});
const roadPoiCatalog=window.LegendRoadPoiCatalogV100?.create({
 getPlayer:p,
 ensureState:ensure,
 getRoadData:road,
 clamp
});
const roadDecisions=window.LegendRoadDecisionsV100?.create({
 getPlayer:p,
 savePlayer:save,
 ensureState:ensure,
 addInventory:inv,
 clamp,
 renderExpedition
});

let roadExpeditionScreen=null;
const roadDiscovery=window.LegendRoadDiscoveryV100.create({
 getPlayer:p,
 savePlayer:save,
 ensureState:ensure,
 getRoadData:road,
 addInventory:inv,
 escapeHtml:esc,
 clamp,
 bellRoadEvidence,
 getPointOfInterest:roadPoiCatalog?.resolve,
 roadDecisions,
 renderExpedition,
 tone,
 createPoiOutcomes:context=>window.LegendRoadPoiOutcomesV100?.create(context),
 createDiscoveryView:context=>window.LegendRoadDiscoveryViewV100?.create(context)
});

const roadAudio=()=>window.LegendRoadAudioV100||{};
const soundOn=()=>roadAudio().soundOn?.()??true;
function tone(kind='tap'){return roadAudio().tone?.(kind);}
function playBattleFx(kind){return roadAudio().playBattleFx?.(kind);}
function startBattleMusic(){return roadAudio().startBattleMusic?.();}
function stopBattleMusic(){return roadAudio().stopBattleMusic?.();}

const roadView=window.LegendRoadViewV100?.create({
 getRoot:root,getPlayer:p,getAssets:A,ensureState:ensure,roadDiscovery,escapeHtml:esc,clamp,
 getRoadAudio:roadAudio,soundOn,tone,hpPercent:hpPct,resolveChoice,finish,areaForStage
});
function scene(stage=0,interactive=true){return roadView?.scene(stage,interactive)||'';}
function shell(body){return roadView?.shell(body);}
function bindHotspotDelegation(){return roadView?.bindHotspotDelegation();}
function header(pl,s,kicker,title,text){return roadView?.header(pl,s,kicker,title,text)||'';}
function start(){stopBattleMusic();roadDiscovery.hide();const pl=p();if(!pl)return;const s=ensure(pl);s.stage=0;s.poiUsed={};s.searchUsed={};s.readUsed={};s.routeChoice=null;const lanternWard=Number(pl.inventory?.wispLanternWick||0)>0;if(lanternWard)pl.inventory.wispLanternWick--;s.pressure=clamp(s.pressure+(lanternWard?3:8),0,100);s.trips=Number(s.trips||0)+1;pl.flags.firstRoadEvent=true;save(pl);renderExpedition(lanternWard?'You light the crafted Wisp Lantern Wick before leaving. Its pale flame steadies your nerves; opening Road Pressure rises by only 3 instead of 8. The wick is spent.':'You leave Ashmere with a clear route and a reason to come back.')}
function areaForStage(stage){
 const index=clamp(Number(stage||0),0,5),areas=road().scenes||[];
 const area={...(areas[index]||{name:'Old Road',type:'Road',text:'The road disappears into the mist.',icon:'↗'})};
 const pl=p(),s=pl?ensure(pl):{};
 if(index===2&&s.routeChoice==='ridge')area.text='The High Ridge drops into a sheltered clearing. Dry kindling and a line of pale stones make this a safer place to rest; the ridge markers continue beyond the firepit.';
 if(index===2&&s.routeChoice==='reeds')area.text='The Reed Cut spills into a sheltered clearing, but wet reeds cling to your boots and long tracks circle the firepit. The blue light is gone; something followed you out.';
 return area;
}
function renderExpedition(note=''){return roadExpeditionScreen?.render(note);}
const roadActions=window.LegendRoadActionsV100?.create({
 getPlayer:p,
 savePlayer:save,
 ensureState:ensure,
 getRoadData:road,
 getScore:score,
 addInventory:inv,
 pick,
 randomInt:rand,
 clamp,
 itemName,
 skillLabel,
 renderExpedition,
 combat,
 getAreaForStage:areaForStage
});
function resolveChoice(kind){return roadActions?.resolveChoice(kind);}
function roadCombatContext(){
 return {
  getPlayer:p,
  savePlayer:save,
  getAssets:A,
  getWeapon:weapon,
  getArmor:armor,
  score,
  ensureState:ensure,
  hpPercent:hpPct,
  escapeHtml:esc,
  clamp,
  randomInt:rand,
  addInventory:inv,
  itemName,
  renderShell:shell,
  renderExpedition,
  outcome,
  soundOn,
  startMusic:startBattleMusic,
  stopMusic:stopBattleMusic,
  playBattleFx,
  tone,
  toggleSound:()=>roadAudio().toggleSound?.(),
  awardProgress:(player,amount)=>window.LegendProgressionV100?.award(player,amount)
 };
}
function combat(enemy,note=''){
 const combatSystem=window.LegendRoadCombatV100;
 if(combatSystem?.start)return combatSystem.start(roadCombatContext(),enemy,note);
 stopBattleMusic();
 return renderExpedition('A road encounter begins, but the combat module did not load. Return to Ashmere and refresh before another attempt.');
}

function returnToTownFromRoad(){
  const player=p();
  if(player){player.town='Ashmere';save(player);}
  const host=root();
  if(host)host.innerHTML='';
  if(window.LegendAshmereV099?.renderAshmere){
    window.LegendAshmereV099.renderAshmere();
    if(document.querySelector('.ash100-town'))return;
  }
  ret();
}
const roadResultsView=window.LegendRoadResultsViewV100?.create({
  renderHeader:header,
  renderShell:shell,
  escapeHtml:esc,
  onReturn:returnToTownFromRoad
});
const roadResults=window.LegendRoadResultsV100?.create({
  getPlayer:p,savePlayer:save,ensureState:ensure,addInventory:inv,clamp,setBellQuestObjective,
  awardProgress:(player,amount)=>window.LegendProgressionV100?.award(player,amount),
  stopMusic:stopBattleMusic,renderHeader:header,renderShell:shell,escapeHtml:esc,getRoot:root,
  resultView:roadResultsView,
  returnToTown:returnToTownFromRoad,
  returnToAshmere:ret
});
function finish(){return roadResults?.finish();}
function outcome(title,text,kicker,skill,modifier){return roadResults?.outcome(title,text,kicker,skill,modifier);}
roadExpeditionScreen=window.LegendRoadExpeditionScreenV100?.create({
 getPlayer:p,
 ensureState:ensure,
 areaForStage,
 escapeHtml:esc,
 shell,
 header,
 roadDiscovery,
 bindHotspotDelegation,
 savePlayer:save,
 resolveChoice,
 finish,
 addInventory:inv,
 clamp,
 returnToAshmere:ret
});
window.LegendRoadControllerV100={start,renderHub:renderExpedition,renderExpedition};
})();