// LEGEND v0.20.38 - Active Old Road Expedition Controller
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
 getAreaForStage:areaForStage,
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
function start(){
 stopBattleMusic();
 roadDiscovery.hide();
 if(typeof roadActions?.start!=='function'){
  return renderExpedition('The expedition action service did not load. Return to Ashmere and refresh before trying again.');
 }
 const openingNote=roadActions.start();
 if(openingNote===null)return;
 return renderExpedition(openingNote);
}
function areaForStage(stage){
 const pl=p(),s=pl?ensure(pl):{};
 const resolveScene=ROADS().resolveScene;
 if(typeof resolveScene==='function')return resolveScene(stage,s.routeChoice);
 const index=clamp(Number(stage||0),0,5),areas=road().scenes||[];
 return {...(areas[index]||{name:'Old Road',type:'Road',text:'The road disappears into the mist.',icon:'↗'})};
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
  awardProgress:(player,amount)=>window.LegendProgressionV100?.award(player,amount),
  showCombatResults:payload=>combatResultsView?.render(payload)===true,
  onOpeningEncounterWin:(player,enemy,progress)=>window.LegendRoadOpeningV140?.afterAmbushWin?.(player,enemy,progress),
  onDungeonEncounterWin:(player,enemy,progress)=>enemy?.greyfenStorehouseV170 ? window.LegendGreyfenStorehouseV170?.afterCombatWin?.(player,enemy,progress) : window.LegendBellVaultV100?.afterCombatWin?.(player,enemy,progress),
  onDungeonEncounterDefeat:(player,enemy)=>enemy?.greyfenStorehouseV170 ? window.LegendGreyfenStorehouseV170?.afterCombatDefeat?.(player,enemy) : window.LegendBellVaultV100?.afterCombatDefeat?.(player,enemy),
  onDungeonEncounterRetreat:(player,enemy)=>enemy?.greyfenStorehouseV170 ? window.LegendGreyfenStorehouseV170?.afterCombatRetreat?.(player,enemy) : window.LegendBellVaultV100?.afterCombatRetreat?.(player,enemy)
 };
}
function combat(enemy,note=''){
 const combatSystem=window.LegendRoadCombatV100;
 if(combatSystem?.start)return combatSystem.start(roadCombatContext(),enemy,note);
 stopBattleMusic();
 return renderExpedition('A road encounter begins, but the combat module did not load. Return to Ashmere and refresh before another attempt.');
}

function startOpeningEncounter(){
  const pl=p();if(!pl)return;
  stopBattleMusic();roadDiscovery.hide();
  const s=ensure(pl);
  s.stage=0;s.pressure=0;s.poiUsed={};s.searchUsed={};s.readUsed={};s.routeChoice=null;
  s.discoveryOpen=false;s.discoveryStage=null;
  save(pl);
  const enemy={id:'opening-blackroot-wolf-v140',behavior:'predator',name:'Blackroot Wolf',hp:1,maxHp:1,damage:[0,0],reward:'fur',text:'A Blackroot Wolf bursts from the ditch and catches Captain Oric off guard.',turn:0,intent:'guardbreak',openingEncounterV140:true};
  return combat(enemy,window.LegendRoadOpeningV140?.battleText?.(pl)||'??? whispers: “Awaken.” Use ACT to answer.');
}
function startDungeonEncounter(enemy,note=''){
 const pl=p();if(!pl||!enemy)return;
 return combat(Object.assign({},enemy,{dungeonV100:true}),note);
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
function reportToMaraFromRoad(){
  returnToTownFromRoad();
  const player=p();
  if(player && String(player.currentRegion||'Ashmere')==='Ashmere'){
    return window.LegendAshmereV099?.route?.('mara');
  }
}
const combatResultsView=window.LegendRoadCombatResultsViewV152?.create({
  renderShell:html=>{const host=root();if(host)host.innerHTML=html;},
  getAssets:A,
  escapeHtml:esc,
  onContinue:()=>renderExpedition(),
  onReturnToTown:returnToTownFromRoad
});
function showDungeonCombatResults(payload = {}){
  const enemy=payload.enemy||{},victory=payload.result!=='defeat';
  const rewardId=enemy.reward||'fur';
  const rewardName=window.LEGEND_DATA?.itemNames?.[rewardId]||rewardId;
  const room=Math.max(1,Number(payload.room||(victory?3:2)));
  return combatResultsView?.render({
    ...payload,
    dungeon:true,
    locationName:'THE BELL CELLAR',
    sceneArtKey:'ashmereArchive',
    progressLabel:'CELLAR DEPTH',
    progressValue:room+' / 3',
    progressHint:victory?'Bell chamber reached':'Last room reached before retreat',
    rewardName:victory?(payload.rewardName||rewardName):'',
    primaryTitle:victory?'Return to the chamber':'Return to Ashmere',
    primaryHint:victory?'Continue exploring the Bell Cellar':'Recover before attempting the cellar again',
    primaryTransition:victory?'Returning to the bell chamber':'Returning wounded to Ashmere',
    secondaryTitle:victory?'Return to Ashmere':'Review the cellar',
    secondaryHint:victory?'Leave the cellar with your rewards':'Review the last chamber report',
    secondaryTransition:victory?'Returning to Ashmere':'Reviewing the bell chamber',
    onContinue:()=>window.LegendAshmereV099?.route?.('dungeon'),
    onReturn:returnToTownFromRoad,
    onSecondary:victory?returnToTownFromRoad:()=>window.LegendAshmereV099?.route?.('dungeon')
  })===true;
}
const roadResultsView=window.LegendRoadResultsViewV100?.create({
  renderHeader:header,
  renderShell:shell,
  escapeHtml:esc,
  onReturn:returnToTownFromRoad,
   onReportToMara:reportToMaraFromRoad
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
 scene,
 roadDiscovery,
 bindHotspotDelegation,
 savePlayer:save,
 resolveChoice,
 finish,
 addInventory:inv,
 clamp,
 returnToAshmere:ret
});
window.LegendRoadControllerV100={start,startOpeningEncounter,startDungeonEncounter,showDungeonCombatResults,renderHub:renderExpedition,renderExpedition};
})();