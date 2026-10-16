/* LEGEND v0.20.36 - Old Road settlement and outcome flow.
 * Owns expedition rewards, progression, first-return report flags and result-screen
 * rendering. Expedition state, persistence, view framing and town return are injected.
 */
(() => {
 function create(context = {}) {
  const {getPlayer,savePlayer,ensureState,addInventory,clamp,setBellQuestObjective,
    awardProgress,stopMusic,renderHeader,renderShell,escapeHtml,resultView,returnToTown,returnToAshmere}=context;
  if(typeof getPlayer!=='function'||typeof savePlayer!=='function'||typeof ensureState!=='function'||
    typeof addInventory!=='function'||typeof clamp!=='function'||typeof setBellQuestObjective!=='function'||
    typeof awardProgress!=='function'||typeof stopMusic!=='function'||typeof renderHeader!=='function'||
    typeof renderShell!=='function'||typeof escapeHtml!=='function')return null;
  const p=getPlayer,save=savePlayer,ensure=ensureState,inv=addInventory,esc=escapeHtml,ret=returnToAshmere;
  const header=renderHeader,shell=renderShell;
function finish(){
 const pl=p();if(!pl)return;
 const s=ensure(pl),complete=s.stage>=5,reward=30+s.stage*20+Math.floor(s.pressure/20)*10;
 pl.flags=pl.flags||{};
 const firstSecuredReturn=complete&&!pl.flags.firstRoadReturnSeen;
 let routeReport='';
 if(firstSecuredReturn){
  const route=s.routeChoice==='ridge'?'ridge':s.routeChoice==='reeds'?'reeds':'unknown';
  const discovery=route==='ridge'&&s.poiUsed?.['ridge-cairn']?'ridge-cairn':route==='reeds'&&s.poiUsed?.['marsh-watcher-tracks']?'marsh-watcher-tracks':'none';
  pl.flags.firstRoadReturnSeen=true;
  pl.flags.firstRoadReturnRoute=route;
  pl.flags.firstRoadReturnDiscovery=discovery;
  if(route==='ridge'&&discovery==='ridge-cairn'){
   setBellQuestObjective(pl,'Ask Mara to compare the Ridgeway Cairn’s marks with Ashmere’s route records.');
   routeReport=' Your report includes the Ridgeway Cairn: it marks a dry line, but does not explain the single bell.';
  }else if(route==='ridge'){
   setBellQuestObjective(pl,'Report the High Ridge route to Mara and ask what marker evidence to collect next.');
   routeReport=' You returned by the High Ridge. Mara can tell you what details to record on your next trip.';
  }else if(route==='reeds'&&discovery==='marsh-watcher-tracks'){
   setBellQuestObjective(pl,'Ask Mara to compare the Bell Fragment and watcher tracks with Ashmere’s route records.');
   routeReport=' Your report includes the tracks beneath the blue light. Their source remains unknown.';
  }else if(route==='reeds'){
   setBellQuestObjective(pl,'Report the Bell Fragment to Mara and record the watcher tracks on a later trip.');
   routeReport=' You brought back a Bell Fragment. The tracks beneath the blue light still need a closer look.';
  }else{
   setBellQuestObjective(pl,'Report your expedition to Mara and ask what route evidence to look for next.');
   routeReport=' Mara can help identify what evidence would make the next report more useful.';
  }
 }
 pl.gold=Number(pl.gold||0)+reward;
 if(complete)inv(pl,'roadToken',1);
 const progress=awardProgress(pl,15+Number(s.stage||0)*10);
 pl.stats=pl.stats||{};
 pl.stats.oldRoadClears=Number(pl.stats.oldRoadClears||0)+1;
 s.stage=0;s.pressure=clamp(Math.floor(s.pressure*.35),0,100);
 save(pl);
 outcome('Expedition Secured','You bring the expedition home: '+reward+'g'+(complete?' and a Road Token. The Road Tokens can now open a new region.':'.')+(progress?' XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'.':'')+routeReport,'Return')
}
function outcome(title,text,kicker,skill,modifier){
 stopMusic();
 const pl=p();if(!pl)return;
 const s=ensure(pl);
 if(resultView?.render){
  return resultView.render({player:pl,state:s,kicker,title,text,skill,modifier});
 }
 shell(header(pl,s,kicker||'EXPEDITION COMPLETE',title,text)+'<section class="exp100-explore-dock exp100-outcome"><div class="exp100-route"><span>THE ROAD REMEMBERS</span><strong>'+esc(title)+'</strong><small>'+esc(text)+'</small></div><div class="exp100-dock-actions"><button class="exp100-dock-action primary" id="outcomeReturn"><strong>Return to Ashmere</strong><span>Leave the road and return to town.</span></button></div><p class="exp100-dock-note">The result view module did not load; your result has still been recorded.</p></section>');
 document.getElementById('outcomeReturn')?.addEventListener('click',()=>{
  if(typeof returnToTown==='function'){returnToTown();return;}
  ret();
 });
}

  return Object.freeze({finish,outcome});
 }
 window.LegendRoadResultsV100=Object.freeze({create});
})();
