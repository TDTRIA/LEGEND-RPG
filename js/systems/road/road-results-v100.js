/* LEGEND v0.20.38 - Old Road settlement and outcome flow.
 * Owns expedition rewards, progression, first-return report flags and result-screen
 * rendering. Expedition state, persistence, view framing and town return are injected.
 */
(() => {
 function create(context = {}) {
  const {getPlayer,savePlayer,ensureState,addInventory,clamp,setBellQuestObjective,
    awardProgress,randomInt,stopMusic,renderHeader,renderShell,escapeHtml,resultView,returnToTown,returnToAshmere}=context;
  if(typeof getPlayer!=='function'||typeof savePlayer!=='function'||typeof ensureState!=='function'||
    typeof addInventory!=='function'||typeof clamp!=='function'||typeof setBellQuestObjective!=='function'||
    typeof awardProgress!=='function'||typeof stopMusic!=='function'||typeof renderHeader!=='function'||
    typeof renderShell!=='function'||typeof escapeHtml!=='function')return null;
  const p=getPlayer,save=savePlayer,ensure=ensureState,inv=addInventory,esc=escapeHtml,ret=returnToAshmere;
  const header=renderHeader,shell=renderShell;
function finish(){
 const pl=p();if(!pl)return;
 const s=ensure(pl),stageCount=Number(s.stage||0),complete=stageCount>=5;
 const levelBefore=Math.max(1,Number(pl.level||1)),pressureBefore=Number(s.pressure||0),trip=Number(s.trips||0);
 // Road pay reflects the distance survived and the danger carried home, but a
 // normal return should not buy a gear upgrade on its own.
 const reward=Math.max(0,15+stageCount*9+(complete?10:0)+Math.floor(pressureBefore/30)*5);
 const routeName=s.routeChoice==='ridge'?'High Ridge':s.routeChoice==='reeds'?'Reed Cut':'Route unrecorded';
 const journal=pl.flags?.roadFieldJournalV150||{};
 const discoveriesThisTrip=(Array.isArray(journal.discoveries)?journal.discoveries:[]).filter(entry=>Number(entry.trip||0)===trip).length;
 const campsThisTrip=(Array.isArray(journal.campReports)?journal.campReports:[]).filter(entry=>Number(entry.trip||0)===trip).length;
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
   setBellQuestObjective(pl,'Ask Mara to compare the blue-light evidence and watcher tracks with Ashmere’s route records.');
   routeReport=' Your report includes the tracks beneath the blue light. Their source remains unknown.';
  }else if(route==='reeds'){
   setBellQuestObjective(pl,'Report what you observed in the Reed Cut and record the watcher tracks on a later trip.');
   routeReport=' You returned by the Reed Cut. The tracks beneath the blue light still need a closer look.';
  }else{
   setBellQuestObjective(pl,'Report your expedition to Mara and ask what route evidence to look for next.');
   routeReport=' Mara can help identify what evidence would make the next report more useful.';
  }
 }
 const opening=pl.flags?.openingRoadV140;
 if(complete&&opening?.phase==='road'&&!opening.completed){opening.phase='complete';opening.completed=true;pl.flags.introV094Complete=true;pl.flags.tutorialStep='people';}
 pl.gold=Number(pl.gold||0)+reward;
 const optionalStopsThisTrip=(Array.isArray(s.visitedNodeIdsV160)?s.visitedNodeIdsV160:[])
  .filter(id=>id==='windbreak'||id==='sunken-cart').length;
 const tokenChance=complete?Math.min(75,40+(routeName==='Reed Cut'?10:0)+(discoveriesThisTrip>=2?10:0)+(optionalStopsThisTrip>0?10:0)+(pressureBefore>=50?5:0)):0;
 const tokenRoll=complete?(typeof randomInt==='function'?randomInt(1,100):Math.floor(Math.random()*100)+1):101;
 const tokenFound=complete&&tokenRoll<=tokenChance;
 if(tokenFound)inv(pl,'roadToken',1);
 const progress=awardProgress(pl,8+Number(s.stage||0)*6);
 pl.stats=pl.stats||{};
 pl.stats.oldRoadClears=Number(pl.stats.oldRoadClears||0)+1;
 const pressureAfter=clamp(Math.floor(s.pressure*.35),0,100);
 // Keep the trip as it ended (stops reached, final Road Pressure) for the
 // summary header before the live state resets for the next departure.
 const endedState={...s};
 s.stage=0;s.pressure=pressureAfter;
 save(pl);
 const details={type:'expedition',complete,stagesCompleted:stageCount,rewardGold:reward,roadTokens:tokenFound?1:0,roadTokenChance:tokenChance,
  xpGained:Number(progress?.gained||0),levelsGained:Number(progress?.levels||0),levelBefore,levelAfter:Math.max(1,Number(pl.level||1)),
  routeName,discoveriesThisTrip,campsThisTrip,pressureBefore,pressureAfter,trip};
 const tokenReport=!complete?'.':tokenFound?' A scarce Road Token was recovered from the route.':' No Road Token surfaced this time; the field notes are still worth keeping.';
 outcome(complete?'Expedition Secured':'Field Report Secured',(complete?'You bring the expedition home: ':'You return early with: ')+reward+'g'+tokenReport+(progress?' XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'.':'')+routeReport,'Return',null,null,details,endedState)
}
function outcome(title,text,kicker,skill,modifier,details,viewState){
 stopMusic();
 const pl=p();if(!pl)return;
 const s=viewState||ensure(pl);
 if(resultView?.render){
  return resultView.render({player:pl,state:s,kicker,title,text,skill,modifier,details});
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
