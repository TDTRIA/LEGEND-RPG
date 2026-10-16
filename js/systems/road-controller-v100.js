// LEGEND v0.10.0 - Old Road Expedition Controller
// Mobile-first expedition loop. Meaningful choices replace visible D20 gates.
(() => {
const RT=()=>window.LegendRuntimeV080||{}, ROADS=()=>window.LegendRoadsV087||{}, A=()=>window.LegendAssetsV090||{}, root=()=>document.getElementById('root');
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])), p=()=>RT().loadPlayer?.()||null, save=pl=>RT().savePlayer?.(pl), ret=()=>RT().returnToAshmere?.();
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, clamp=(n,a,b)=>Math.max(a,Math.min(b,n)), pick=a=>a?.length?a[Math.floor(Math.random()*a.length)]:null;
const road=()=>ROADS().oldRoad||{stages:[],checks:[],finds:[],enemies:[]};
const inv=(pl,k,n)=>{pl.inventory=pl.inventory||{};pl.inventory[k]=Number(pl.inventory[k]||0)+n};

function setBellQuestObjective(pl,objective){
 pl.questLog=Array.isArray(pl.questLog)?pl.questLog:[];
 const prefix='The Bell That Rang Once:';
 const entry=prefix+' '+objective;
 const index=pl.questLog.findIndex(item=>String(item).startsWith(prefix));
 if(index>=0)pl.questLog[index]=entry;else pl.questLog.unshift(entry);
}
const itemName=k=>window.LEGEND_DATA?.itemNames?.[k]||({food:'Rations',camp:'Camp Supplies',roadToken:'Road Tokens',potion:'Healing Potions',fur:'Furs',bellFragment:'Bell Fragments',log:'Logs'}[k]||k);
const score=(pl,skill)=>{const c=window.LEGEND_DATA?.classes?.[pl.className]?.mod||{},o=window.LEGEND_DATA?.origins?.[pl.origin]?.bonus||{},k=window.LEGEND_DATA?.keepsakes?.[pl.keepsake]?.bonus||{},a=pl.creationV094?.bonuses||pl.creationV090?.bonuses||{};return Number(c[skill]||0)+Number(o[skill]||0)+Number(k[skill]||0)+Number(a[skill]||0)};
const weapon=pl=>(window.LEGEND_DATA?.weapons||[]).find(w=>w.id===pl.weapon)||{name:'Hands',min:1,max:3}, armor=pl=>(window.LEGEND_DATA?.armors||[]).find(a=>a.id===pl.armor)||{name:'None',defense:0};
const state=pl=>{pl.flags=pl.flags||{};pl.flags.roadExpeditionV100=pl.flags.roadExpeditionV100||{stage:0,pressure:0,trips:0,events:0,finds:0,battles:0};return pl.flags.roadExpeditionV100};
const ensure=pl=>{const s=state(pl);s.stage=clamp(Number(s.stage||0),0,5);s.pressure=clamp(Number(s.pressure||0),0,100);return s};
const hpPct=pl=>clamp(Math.round(Number(pl.hp||0)/Math.max(1,Number(pl.maxHp||1))*100),0,100);
const audio=()=>window.LegendAudioV100;
const soundOn=()=>audio()?.soundOn?.() ?? true;
const tone=(kind='tap')=>audio()?.tone?.(kind);
const playBattleFx=kind=>audio()?.playBattleFx?.(kind);
const startBattleMusic=()=>audio()?.startBattleMusic?.();
const stopBattleMusic=()=>audio()?.stopBattleMusic?.();
let visibleDiscoveryStage=null;

const skillLabel=k=>({survival:'Roadsense',strength:'Force',lore:'Lore',luck:'Fortune',thieving:'Guile',craft:'Craft'}[k]||k).toUpperCase();
function scene(stage=0,interactive=true){
 const art=A().locations||{};
 const stageNum=clamp(Number(stage||0),0,5),pl=p(),s=pl?ensure(pl):{},route=s.routeChoice;
 const fallback=art.oldRoadScene||'assets/locations/roads/old_road_exploration_v1.svg';
 const path=stageNum===2?(art.roadCamp||art.oldRoad||fallback):stageNum===1&&route==='ridge'?(art.highRidge||art.oldRoad||fallback):stageNum===1&&route==='reeds'?(art.reedCut||art.oldRoad||fallback):(art.oldRoad||fallback);
 const point=pointOfInterest(stage),stageClass='exp100-stage-'+stageNum;
 const poiDone=!!s.poiUsed?.[point.key];
 const hotspots=interactive&&!poiDone
  ? '<div class="exp100-hotspots" aria-label="Discover the road"><button class="exp100-hotspot exp100-hotspot-find" data-hotspot="poi" style="--hx:'+point.x+'%;--hy:'+point.y+'%"><i>'+esc(point.icon)+'</i><span>Look closer</span></button></div>'
  : '<div class="exp100-hotspots" aria-hidden="true"></div>';
 return '<div class="exp100-scene exp100-scene-live '+stageClass+'" data-stage="'+stageNum+'"><img src="'+esc(path)+'" alt="'+esc(stageNum===2?'A roadside camp beside the Old Road':'The Old Road winding through misty woodland')+'" onerror="if(this.dataset.fallbackApplied){this.style.display=\'none\'}else{this.dataset.fallbackApplied=\'1\';this.src=\''+esc(fallback)+'\'}"><div class="exp100-scene-shade"></div>'+hotspots+'<span class="exp100-scene-label">THE OLD ROAD <i>•</i> '+esc(areaForStage(stage).name.toUpperCase())+'</span><button class="exp100-sound" id="exp100-sound" type="button" aria-label="Toggle sound effects">Sound: '+(soundOn()?'On':'Off')+'</button></div>';
}
function shell(body){
 const host=root(),current=host.querySelector('.exp100-wrap');
 if(current){
  const holder=document.createElement('div');holder.innerHTML=body;
  const nextScene=holder.querySelector('.exp100-scene');
  const liveScene=current.querySelector(':scope > .exp100-scene');
  if(nextScene&&liveScene){
   const nextHotspots=nextScene.querySelector('.exp100-hotspots');
   const liveHotspots=liveScene.querySelector('.exp100-hotspots');
   const nextImage=nextScene.querySelector('img'),liveImage=liveScene.querySelector('img');
   if(nextHotspots&&liveHotspots)liveHotspots.innerHTML=nextHotspots.innerHTML;
   if(nextImage&&liveImage)liveImage.replaceWith(nextImage);
   liveScene.className=nextScene.className;
   liveScene.dataset.stage=nextScene.dataset.stage||'0';
   const nextLabel=nextScene.querySelector('.exp100-scene-label'),liveLabel=liveScene.querySelector('.exp100-scene-label');
   if(nextLabel&&liveLabel)liveLabel.innerHTML=nextLabel.innerHTML;
   nextScene.remove();
   current.querySelectorAll(':scope > :not(.exp100-scene)').forEach(el=>el.remove());
   current.append(...holder.childNodes);
  }else host.innerHTML='<main class="exp100"><div class="exp100-wrap">'+body+'</div></main>';
 }else host.innerHTML='<main class="exp100"><div class="exp100-wrap">'+body+'</div></main>';
 host.querySelectorAll('.exp100 button').forEach(btn=>{
  if(btn.id==='exp100-sound'||btn.dataset.soundBound)return;
  btn.dataset.soundBound='1';
  btn.addEventListener('click',()=>tone(['strike','heavy','skill'].includes(btn.id)?'impact':'tap'));
 });
 const soundButton=document.getElementById('exp100-sound');
 if(soundButton&&!soundButton.dataset.toggleBound){
  soundButton.dataset.toggleBound='1';
  soundButton.addEventListener('click',e=>{
   try{localStorage.setItem('legend-road-sound',soundOn()?'off':'on')}catch(err){}
   e.currentTarget.textContent='Sound: '+(soundOn()?'On':'Off');
   e.currentTarget.setAttribute('aria-label','Toggle sound effects');
   if(soundOn())tone('success');
  });
 }
}
function handleHotspotAction(btn){
 const action=btn?.dataset?.hotspot;
 if(action==='poi'){
  const pl=p();if(!pl)return;
  const s=ensure(pl),stage=Number(s.stage||0),wrap=root()?.querySelector('.exp100-wrap');
  // Revealing a clue is a local scene action, not a full expedition rerender.
  // The scene shell intentionally preserves its existing image node between renders;
  // inserting the panel beside the current scene avoids the preserved-DOM redraw path.
  visibleDiscoveryStage=stage;
  if(!wrap||wrap.querySelector('.exp100-discovery-beat'))return;
  const markup=pointOfInterestPanel(pl,s,stage);
  const anchor=wrap.querySelector('.exp100-route-choice, .exp100-poi-done')||wrap.querySelector('.exp100-head');
  if(!markup||!anchor)return;
  anchor.insertAdjacentHTML('afterend',markup);
  const leave=wrap.querySelector('#poiLeave');
  if(leave)leave.addEventListener('click',()=>{
   visibleDiscoveryStage=null;
   leave.closest('.exp100-discovery-beat')?.remove();
  });
  const inspect=wrap.querySelector('#poiInspect');
  if(inspect)inspect.addEventListener('click',inspectPointOfInterest);
  return;
 }
 visibleDiscoveryStage=null;
 if(action==='search')return resolveChoice('search');
 if(action==='move')return resolveChoice('push');
 if(action==='finish')return finish();
}
function bindHotspotDelegation(){
 // Bind directly to fresh hotspot buttons after each shell update. The discovery
 // action inserts its panel in place and does not replace the button during the click.
 document.querySelectorAll('.exp100-hotspot').forEach(btn=>{
  if(btn.dataset.roadHotspotBound==='1')return;
  btn.dataset.roadHotspotBound='1';
  btn.addEventListener('click',event=>{
   event.preventDefault();
   event.stopPropagation();
   handleHotspotAction(btn);
  });
 });
 // Some browser hit-tests round a transformed button's left edge just outside its
 // sub-pixel bounds. If that click lands on the scene/shade immediately beside it,
 // honor the tap within a small forgiving margin. Ordinary button clicks stop above,
 // so this fallback cannot double-trigger a successful click.
 const scene=root()?.querySelector('.exp100-scene-live');
 if(scene&&!scene.dataset.hotspotEdgeFallbackBound){
  scene.dataset.hotspotEdgeFallbackBound='1';
  scene.addEventListener('click',event=>{
   if(event.defaultPrevented)return;
   const btn=scene.querySelector('.exp100-hotspot');
   if(!btn)return;
   const rect=btn.getBoundingClientRect(),slop=5;
   if(event.clientX<rect.left-slop||event.clientX>rect.right+slop||
      event.clientY<rect.top-slop||event.clientY>rect.bottom+slop)return;
   event.preventDefault();
   event.stopPropagation();
   handleHotspotAction(btn);
  });
 }
}
function header(pl,s,kicker,title,text){const stage=Math.min(5,Number(s.stage||0)),pressure=Number(s.pressure||0);return scene(stage,kicker!=='ROAD ENCOUNTER')+'<section class="exp100-head"><div class="exp100-kicker">'+esc(kicker)+'</div><h1>'+esc(title)+'</h1><p>'+esc(text)+'</p><div class="exp100-bars"><div><span>Expedition</span><strong>'+stage+'/5</strong><i><b style="width:'+stage*20+'%"></b></i></div><div><span>Road Pressure</span><strong>'+pressure+'%</strong><i><b style="width:'+pressure+'%"></b></i></div><div><span>Health</span><strong>'+Number(pl.hp||0)+'/'+Number(pl.maxHp||0)+'</strong><i><b style="width:'+hpPct(pl)+'%"></b></i></div></div></section>'}
function stats(pl){return '<section class="exp100-stats"><div><strong>'+Number(pl.inventory?.food||0)+'</strong><span>Rations</span></div><div><strong>'+Number(pl.inventory?.camp||0)+'</strong><span>Camp</span></div><div><strong>'+Number(pl.inventory?.roadToken||0)+'</strong><span>Tokens</span></div><div><strong>'+Number(pl.gold||0)+'g</strong><span>Gold</span></div></section>'}
function start(){stopBattleMusic();visibleDiscoveryStage=null;const pl=p();if(!pl)return;const s=ensure(pl);s.stage=0;s.poiUsed={};s.searchUsed={};s.readUsed={};s.routeChoice=null;const lanternWard=Number(pl.inventory?.wispLanternWick||0)>0;if(lanternWard)pl.inventory.wispLanternWick--;s.pressure=clamp(s.pressure+(lanternWard?3:8),0,100);s.trips=Number(s.trips||0)+1;pl.flags.firstRoadEvent=true;save(pl);renderExpedition(lanternWard?'You light the crafted Wisp Lantern Wick before leaving. Its pale flame steadies your nerves; opening Road Pressure rises by only 3 instead of 8. The wick is spent.':'You leave Ashmere with a clear route and a reason to come back.')}
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
function pointOfInterestPanel(pl,s,stage){
 const point=pointOfInterest(stage);
 if(s.poiUsed&&s.poiUsed[point.key])return '';
 if(visibleDiscoveryStage!==Number(stage))return '';
 return '<section class="exp100-poi exp100-discovery-beat"><div class="exp100-poi-icon">'+esc(point.icon)+'</div><div class="exp100-poi-copy"><span>YOU NOTICE SOMETHING · '+esc(point.kind)+'</span><strong>'+esc(point.name)+'</strong><p>'+esc(point.text)+'</p><button class="exp100-poi-action" id="poiInspect">'+esc(point.action)+'</button><button class="exp100-poi-dismiss" id="poiLeave">Leave it</button></div></section>';
}
function routeChoicePanel(s,stage){
 if(stage!==0)return '';
 if(s.routeChoice){const chosen=s.routeChoice==='ridge'?'High Ridge':'Reed Cut';return '<section class="exp100-poi exp100-poi-done"><div class="exp100-poi-icon">↗</div><div class="exp100-poi-copy"><span>ROUTE DECISION · RECORDED</span><strong>'+chosen+'</strong><p>Your choice has shaped this expedition. The other track disappears into the mist behind you.</p></div></section>';}
 return '<section class="exp100-panel exp100-route-choice"><div class="exp100-kicker">THE ROAD FORKS</div><h2>Two ways through the lowlands</h2><p>The High Ridge looks longer but firm underfoot. The Reed Cut is shorter, though a cold blue glimmer moves between the reeds.</p><div class="exp100-choices"><button class="exp100-choice" id="routeRidge"><strong>Take the High Ridge</strong><span>Keep to firmer ground and avoid drawing attention.</span><em>Safer · Road Pressure −8</em></button><button class="exp100-choice" id="routeReeds"><strong>Risk the Reed Cut</strong><span>Follow the strange light and search for what it is guarding.</span><em>Riskier · Gain 1 Bell Fragment, Road Pressure +10</em></button></div></section>';
 }
function movedCairnDecisionPanel(pl,s,stage){
 const contract=pl?.flags?.sideContracts?.movedCairn;
 if(stage!==1||s.routeChoice!=='ridge'||!contract||contract.complete||contract.decision||!s.poiUsed?.['ridge-cairn'])return '';
 return '<section class="exp100-panel exp100-moved-cairn"><div class="exp100-kicker">SIDE STORY · THE MOVED CAIRN</div><h2>One stone sits wrong</h2><p>The cairn looks ordinary until you notice the fresh split face set beyond an older groove. Cart tracks turn toward softer ground below. Oric asked you to report the danger, but the safest next step is yours to choose.</p><div class="exp100-choices"><button type="button" class="exp100-choice" data-moved-cairn="restore"><strong>Restore the older alignment</strong><span>Set the stone back into its weathered groove. The repair will be visible, but you cannot know why it was moved.</span><em>Act now · leave a fresh trace</em></button><button type="button" class="exp100-choice" data-moved-cairn="record"><strong>Record both positions</strong><span>Sketch the old groove and the current stone before leaving it untouched. Preserve the evidence for Mara and Oric.</span><em>Preserve evidence · leave the site unchanged</em></button><button type="button" class="exp100-choice" data-moved-cairn="warn"><strong>Mark the hazard and step back</strong><span>Warn the next travelers without shifting the stone. The route remains uncertain until someone can inspect it properly.</span><em>Prioritize caution · defer the repair</em></button></div></section>';
}
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
function inspectPointOfInterest(){
 const pl=p();if(!pl)return;const s=ensure(pl),stage=clamp(Number(s.stage||0),0,5),point=pointOfInterest(stage);
 s.poiUsed=s.poiUsed||{};
 if(s.poiUsed[point.key])return renderExpedition('You have already investigated this spot on the current expedition.');
 s.poiUsed[point.key]=true;s.discoveryOpen=false;s.discoveryStage=null;visibleDiscoveryStage=null;
 let foundGreyfenFieldNote=false,foundGreyfenWeeklyReturn=false;
 if(point.key==='blackroot-mark'){
  pl.flags=pl.flags||{};
  pl.flags.bellRoadSearched=true;
  pl.memories=Array.isArray(pl.memories)?pl.memories:[];
  const memory='At Blackroot Bend, black roots split a stone seal bearing the same bell-mark found near Ashmere. The mark repeats, but its purpose remains unclear.';
  if(!pl.memories.includes(memory))pl.memories.push(memory);
  if(pl.flags.firstRoadReturnMaraBriefed){
   setBellQuestObjective(pl,'Return to Mara with your observation of the bell-marked seal at Blackroot Bend.');
  }
 }else if(point.key==='greyfen-marker'&&pl.flags?.bellRoadSearched&&!pl.flags?.greyfenBoundaryCompared){
  pl.flags=pl.flags||{};
  pl.flags.greyfenBoundaryCompared=true;
  pl.memories=Array.isArray(pl.memories)?pl.memories:[];
  const memory='At the Greyfen Approach, the boundary stone carries the bell-mark seen at Blackroot Bend beneath a newer cut angled toward the reed bed. The mark proves a change in the stone, not who made it.';
  if(!pl.memories.includes(memory))pl.memories.push(memory);
  setBellQuestObjective(pl,'Take the matching boundary mark to Mara in Greyfen’s Boundary Archive.');
 }else if(point.key==='reedwatch-locker'&&pl.flags?.greyfenArchiveRead&&!pl.flags?.greyfenFieldNoteFound){
  foundGreyfenFieldNote=true;
  pl.flags=pl.flags||{};
  pl.flags.greyfenFieldNoteFound=true;
  pl.memories=Array.isArray(pl.memories)?pl.memories:[];
  const memory='At Reedwatch Shelter, you found a field note dated two days after Greyfen logged the flood’s retreat. Its sketch already shows the newer cut angled toward the reed bed; the signature is unreadable.';
  if(!pl.memories.includes(memory))pl.memories.push(memory);
  setBellQuestObjective(pl,'Bring the dated Reedwatch field note to Mara in Greyfen’s Boundary Archive.');
 }else if(point.key==='camp-firepit'&&pl.flags?.greyfenLedgerCompared&&!pl.flags?.greyfenWeeklyReturnFound){
  foundGreyfenWeeklyReturn=true;
  pl.flags=pl.flags||{};
  pl.flags.greyfenWeeklyReturnFound=true;
  pl.memories=Array.isArray(pl.memories)?pl.memories:[];
  const memory='At Wayfarer’s Camp, you found an earlier weekly route return: the lower crossing was marked CLOSED pending inspection, then overwritten as OPEN without initials. The record shows a changed instruction, not who changed it.';
  if(!pl.memories.includes(memory))pl.memories.push(memory);
  setBellQuestObjective(pl,'Bring the earlier weekly route return to Old Brenn in Greyfen’s Bellkeeper’s Ledger.');
 }
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
function campActions(pl,s){
  const camp=Number(pl.inventory?.camp||0),food=Number(pl.inventory?.food||0),herb=Number(pl.inventory?.roadHerb||0),cloth=Number(pl.inventory?.clothScrap||0);
  return '<section class="exp100-camp"><div class="exp100-camp-heading"><span>WAYSTATION</span><strong>Make this stop count</strong><small>Resting uses supplies. Crafting turns road finds into something useful.</small></div><div class="exp100-camp-actions"><button class="exp100-choice" id="campRest" '+((camp<1&&food<1)?'disabled':'')+'><strong>Rest by the Fire</strong><span>Recover 20% of maximum health and reduce Road Pressure by 12.</span><em>Cost: 1 Camp Supply or 1 Ration</em></button><button class="exp100-choice" id="campCraft" '+((herb<1||cloth<1)?'disabled':'')+'><strong>Craft a Road Poultice</strong><span>Use 1 Road Herb and 1 Cloth Scrap to make a healing potion.</span><em>Materials: '+herb+' herbs • '+cloth+' cloth</em></button></div></section>';
}
function renderExpedition(note=''){
  const pl=p();if(!pl)return;
  const s=ensure(pl),stage=Math.min(5,s.stage),area=areaForStage(stage),atCamp=!!area.camp;
  const searchDone=!!s.searchUsed?.[stage];
  let choices=stage>=5
    ? '<button class="exp100-dock-action primary" id="finish"><strong>Return to Ashmere</strong><span>Secure what you found.</span></button>'
    : '<button class="exp100-dock-action" id="search" '+(searchDone?'disabled':'')+'><strong>'+(searchDone?'Nothing left to search':'Search the roadside')+'</strong><span>'+(searchDone?'You have searched this stretch':'Look for something useful')+'</span></button><button class="exp100-dock-action primary" id="push"><strong>Travel On</strong><span>Continue toward '+esc(areaForStage(Math.min(5,stage+1)).name)+'</span></button>';
  const roadMood=s.pressure>=55?'A second set of footsteps keeps pace just beyond the lantern light.':s.pressure>=30?'The birds fall silent. Somewhere ahead, a branch snaps.':'The road bends into mist. Somewhere beyond it, a lantern flickers.';
  const sceneText=(stage===2&&s.routeChoice&&note)?note+' '+area.text:(note||area.text||roadMood);
  shell(header(pl,s,'OLD ROAD EXPEDITION',area.name,sceneText)+routeChoicePanel(s,stage)+pointOfInterestPanel(pl,s,stage)+movedCairnDecisionPanel(pl,s,stage)+(atCamp?campActions(pl,s):'')+'<section class="exp100-explore-dock"><div class="exp100-route"><span>BEYOND THE MIST</span><strong>'+esc(areaForStage(Math.min(5,stage+1)).name)+'</strong><small>Follow the road when you are ready.</small></div><div class="exp100-dock-actions">'+choices+'</div><div class="exp100-actions"><button class="exp100-btn" id="town">Abandon expedition</button></div></section>');
  bindHotspotDelegation();
  document.getElementById('poiLeave')?.addEventListener('click',()=>{const pl=p();if(!pl)return;const s=ensure(pl);s.discoveryOpen=false;s.discoveryStage=null;visibleDiscoveryStage=null;save(pl);document.querySelector('.exp100-discovery-beat')?.remove();});
  document.getElementById('poiInspect')?.addEventListener('click',inspectPointOfInterest);
  document.querySelectorAll('[data-moved-cairn]').forEach(button=>button.addEventListener('click',()=>chooseMovedCairnDecision(button.dataset.movedCairn)));
  document.getElementById('routeRidge')?.addEventListener('click',()=>chooseRoadRoute('ridge'));
  document.getElementById('routeReeds')?.addEventListener('click',()=>chooseRoadRoute('reeds'));
  document.getElementById('careful')?.addEventListener('click',()=>resolveChoice('careful'));
  document.getElementById('search')?.addEventListener('click',()=>resolveChoice('search'));
  document.getElementById('push')?.addEventListener('click',()=>resolveChoice('push'));
  document.getElementById('finish')?.addEventListener('click',finish);
  document.getElementById('town').onclick=ret;
  document.getElementById('campRest')?.addEventListener('click',()=>{
    const supply=Number(pl.inventory?.camp||0)>0?'camp':'food';
    pl.inventory[supply]=Math.max(0,Number(pl.inventory?.[supply]||0)-1);
    const healed=Math.min(Math.max(0,Number(pl.maxHp||1)-Number(pl.hp||1)),Math.max(1,Math.ceil(Number(pl.maxHp||1)*.2)));
    pl.hp=Number(pl.hp||1)+healed;pl.fatigue=Math.max(0,Number(pl.fatigue||0)-20);
    s.pressure=clamp(s.pressure-12,0,100);pl.day=Number(pl.day||1)+1;
    pl.stats=pl.stats||{};pl.stats.campsMade=Number(pl.stats.campsMade||0)+1;save(pl);
    renderExpedition('You rest at '+area.name+', recover '+healed+' health, and let the road quiet down.');
  });
  document.getElementById('campCraft')?.addEventListener('click',()=>{
    if(Number(pl.inventory?.roadHerb||0)<1||Number(pl.inventory?.clothScrap||0)<1)return;
    pl.inventory.roadHerb--;pl.inventory.clothScrap--;inv(pl,'potion',1);save(pl);
    renderExpedition('You bind a Road Herb into clean cloth and make a healing potion.');
  });
}
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
function findEvent(){
 const pl=p();if(!pl)return;const s=ensure(pl),f=pick(road().finds)||{title:'Roadside Cache',text:'Something useful was left behind.',item:'food',amount:1};
 const aptitude=score(pl,'survival')+score(pl,'lore')+score(pl,'luck'),amount=Number(f.amount||1)+(aptitude>=4?1:0);
 inv(pl,f.item,amount);s.finds=Number(s.finds||0)+1;s.stage=clamp(s.stage+1,0,5);s.pressure=clamp(s.pressure+2,0,100);
 pl.stats=pl.stats||{};pl.stats.resourcesFound=Number(pl.stats.resourcesFound||0)+1;save(pl);
 return renderExpedition(f.title+': '+f.text+' You recover '+itemName(f.item)+' ×'+amount+'.');
}
function battleEvent(){
 const pl=p();if(!pl)return;const s=ensure(pl),base=pick(road().enemies);if(!base)return eventCheck('survival',2);
 const enemy={...base,hp:rand(base.hp?.[0]||20,base.hp?.[1]||35)};enemy.maxHp=enemy.hp;enemy.intent='attack';
 s.battles=Number(s.battles||0)+1;save(pl);combat(enemy);
}
function enemyIntent(enemy){
 const n=Number(enemy.turn||0)%3;
 return n===0?'heavy':n===1?'attack':'guardbreak';
}
function classTechnique(pl){
 const moves={
  Warrior:{name:'Cleave',text:'A committed two-handed cut. Strongest against an enemy winding up.',effect:'bonus damage'},
  Ranger:{name:'Trap Shot',text:'Pin the enemy’s movement so its next attack loses force.',effect:'snare'},
  Mage:{name:'Rune Bolt',text:'Break the enemy’s rhythm with a focused runic burst.',effect:'disrupt'},
  Thief:{name:'Swipe',text:'Strike quickly and lift a little coin while its guard is open.',effect:'steal'},
  Skiller:{name:'Improvised Tool',text:'Turn a field tool into a precise strike and steady your nerves.',effect:'steady'},
  Adventurer:{name:'Lucky Strike',text:'A risky angle that can land hard and restore a little grit.',effect:'luck'}
 };
 return moves[pl.className]||{name:'Class Technique',text:'Use your practiced strengths for a focused move.',effect:'bonus damage'};
}
function combat(enemy,note=''){
 const pl=p();if(!pl)return;const s=ensure(pl),w=weapon(pl),a=armor(pl);
 enemy.turn=Number(enemy.turn||0);enemy.intent=enemy.intent||enemyIntent(enemy);
 const intentText=enemy.snared?'Snared · its next blow is weakened':enemy.intent==='heavy'?'Heavy wind-up · GUARD or disrupt it':enemy.intent==='guardbreak'?'Guard-break · strike first or use ACT':'Quick strike · GUARD softens the hit';
 const foeIntentClass=enemy.snared?'snared':enemy.intent==='heavy'?'heavy':enemy.intent==='guardbreak'?'guardbreak':'attack';
 const foeIntentLabel=foeIntentClass==='heavy'?'HEAVY WIND-UP':foeIntentClass==='guardbreak'?'GUARD BREAK':foeIntentClass==='snared'?'SNARED':'OPPONENT';
 const stableEnemies=A().enemies||{},legacyArt=A().byName?.(enemy.name)||'',enemyName=String(enemy.name||'').toLowerCase();
 const art=(enemyName.includes('wolf')?stableEnemies.blackrootWolf:enemyName.includes('goblin')?stableEnemies.roadGoblin:enemyName.includes('wisp')?stableEnemies.lanternWisp:'')||legacyArt;
 const heroArt=A().classes?.[pl.className]||'',technique=classTechnique(pl),health=hpPct(pl);
 const playerHit=/hits you for|blow|damage taken/i.test(note),foeHit=/lands for|attack lands|Heavy Strike lands|Rune Bolt lands|Cleave lands|Trap Shot lands|Swipe lands/i.test(note);
 const turnNumber=Number(enemy.turn||0)+1;
 startBattleMusic();
 shell('<section class="exp100-panel exp100-combat rpg-battle rpg-intent-'+foeIntentClass+' '+(playerHit?'rpg-player-hit ':'')+(foeHit?'rpg-foe-hit':'')+'" aria-label="Turn-based battle">'+
  '<div class="rpg-battle-topline"><div><span class="rpg-overline">THE OLD ROAD</span><strong>ENCOUNTER <i> / </i> TURN '+turnNumber+'</strong></div><button class="rpg-sound-toggle" id="battleSound" type="button" aria-label="Toggle battle music and sound">'+(soundOn()?'♫ SOUND ON':'♫ SOUND OFF')+'</button></div>'+
  '<div class="rpg-battlefield"><div class="rpg-battle-moon" aria-hidden="true"></div><div class="rpg-battle-orbit" aria-hidden="true"></div><div class="rpg-ground-haze" aria-hidden="true"></div>'+
   '<div class="rpg-foe-side"><div class="rpg-foe-nameplate rpg-foe-intent-'+foeIntentClass+'"><span>'+foeIntentLabel+'</span><strong>'+esc(enemy.name)+'</strong><small>'+Math.max(0,Number(enemy.hp))+' / '+Number(enemy.maxHp)+' HP</small><div class="rpg-foe-hp"><i style="width:'+clamp(Math.round(Number(enemy.hp)/Math.max(1,Number(enemy.maxHp))*100),0,100)+'%"></i></div></div>'+
   '<div class="rpg-foe-sprite">'+(art?'<img class="rpg-foe-art" src="'+esc(art)+'" alt="'+esc(enemy.name)+'">':'<span class="rpg-foe-unknown" aria-hidden="true">✦</span>')+'<i class="rpg-foe-shadow"></i></div></div>'+
   '<div class="rpg-target-arrow" aria-hidden="true">‹</div></div>'+
  '<div class="rpg-combat-status"><div class="rpg-hero-portrait">'+(heroArt?'<img src="'+esc(heroArt)+'" alt="">':'<span aria-hidden="true">✧</span>')+'</div>'+
   '<div class="rpg-hero-copy"><div class="rpg-hero-name"><strong>'+esc(pl.username||'Traveler')+'</strong><span>LV '+Math.max(1,Number(pl.level||1))+' · '+esc(pl.className||'Wayfarer')+'</span></div>'+
   '<div class="rpg-hero-vitals"><div class="rpg-vital-label"><span>HP</span><strong>'+Number(pl.hp||0)+' <i>/</i> '+Number(pl.maxHp||1)+'</strong></div><div class="rpg-hero-hp"><i style="width:'+health+'%"></i></div></div>'+
   '<div class="rpg-hero-resources"><span>WEAPON <b>'+esc(w.name)+'</b></span><span>ARMOR <b>'+esc(a.name)+'</b></span><span>POTIONS <b>'+Number(pl.inventory?.potion||0)+'</b></span><span>GOLD <b>'+Number(pl.gold||0)+'g</b></span></div></div></div>'+
  '<div class="rpg-dialogue" aria-live="polite"><span class="rpg-dialogue-star" aria-hidden="true">✦</span><div><span class="rpg-dialogue-kicker">'+(note?'BATTLE LOG':'A HOSTILE APPROACHES')+'</span><p>'+(note?esc(note):esc(enemy.name+' blocks the road. Read its intent, then choose your move.'))+'</p></div></div>'+
  '<div class="rpg-enemy-tell"><span class="rpg-tell-mark" aria-hidden="true">!</span><div><small>ENEMY INTENT</small><span class="exp100-intent">'+intentText+'</span></div></div>'+
  '<div class="rpg-turn-heading"><div><span>YOUR TURN</span><strong>Choose a command</strong></div><small>One action gives the enemy its turn.</small></div>'+
  '<div class="rpg-command-grid" role="group" aria-label="Battle commands">'+
   '<button class="rpg-command rpg-command-fight" id="strike" type="button"><span class="rpg-command-glyph" aria-hidden="true">⚔</span><span class="rpg-command-label"><strong>FIGHT</strong><small>Quick strike</small></span><em>'+Math.max(1,Number(w.min||1)+score(pl,'strength'))+'–'+Math.max(2,Number(w.max||3)+score(pl,'strength'))+'</em></button>'+
   '<button class="rpg-command rpg-command-act" id="skill" type="button" '+(Number(enemy.skillCooldown||0)>0?'disabled':'')+'><span class="rpg-command-glyph" aria-hidden="true">✧</span><span class="rpg-command-label"><strong>ACT</strong><small>'+esc(technique.name)+'</small></span><em>'+(Number(enemy.skillCooldown||0)>0?'COOLDOWN':'CLASS MOVE')+'</em></button>'+
   '<button class="rpg-command rpg-command-item" id="item" type="button" '+(Number(pl.inventory?.potion||0)<1||Number(pl.hp||0)>=Number(pl.maxHp||1)?'disabled':'')+'><span class="rpg-command-glyph" aria-hidden="true">✚</span><span class="rpg-command-label"><strong>ITEM</strong><small>Healing potion</small></span><em>'+Number(pl.inventory?.potion||0)+' LEFT</em></button>'+
   '<button class="rpg-command rpg-command-guard" id="guard" type="button"><span class="rpg-command-glyph" aria-hidden="true">⬡</span><span class="rpg-command-label"><strong>GUARD</strong><small>Brace for impact</small></span><em>DEFEND</em></button>'+
  '</div>'+
  '<div class="rpg-battle-utilities"><span>OTHER MOVES</span><button class="rpg-utility-command" id="heavy" type="button">Heavy Strike <small>Risky · high damage</small></button>'+
   '<button class="rpg-utility-command" id="poultice" type="button" '+(Number(pl.inventory?.roadPoultice||0)<1||Number(pl.hp||0)>=Number(pl.maxHp||1)?'disabled':'')+'>Road Poultice <small>'+Number(pl.inventory?.roadPoultice||0)+' in pack</small></button>'+
   '<button class="rpg-utility-command rpg-retreat" id="flee" type="button">Retreat <small>Abandon this encounter</small></button></div>'+
  '<p class="rpg-battle-footnote">'+esc(technique.text)+' Armor softens incoming blows; the heavy wind-up can be guarded against or disrupted.</p></section>');
 const button=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=fn;};
 button('strike',()=>combatAction(enemy,'attack'));
 button('heavy',()=>combatAction(enemy,'heavy'));
 button('guard',()=>combatAction(enemy,'guard'));
 button('skill',()=>combatAction(enemy,'skill'));
 button('item',()=>combatAction(enemy,'item'));
 button('poultice',()=>combatAction(enemy,'poultice'));
 button('flee',()=>{stopBattleMusic();s.pressure=clamp(s.pressure-8,0,100);save(pl);renderExpedition('You withdraw from '+enemy.name+' and regroup on the road.');});
 button('battleSound',()=>{
  try{localStorage.setItem('legend-road-sound',soundOn()?'off':'on');}catch(e){}
  if(soundOn()){startBattleMusic();playBattleFx('magic');}else{stopBattleMusic();}
  const control=document.getElementById('battleSound');if(control)control.textContent=soundOn()?'♫ SOUND ON':'♫ SOUND OFF';
 });
}
function combatAction(enemy,action){
 const pl=p();if(!pl)return;const s=ensure(pl),w=weapon(pl),a=armor(pl);
 if(action==='skill'&&Number(enemy.skillCooldown||0)>0)return combat(enemy,'Your class technique is recovering. Choose another command; this does not consume your turn.');
 const guarding=action==='guard';
 playBattleFx(action==='guard'?'guard':action==='item'||action==='poultice'?'heal':action==='skill'?'magic':action==='heavy'?'heavy':'swing');
 let note='';
 if(action==='item'){
   if(Number(pl.inventory?.potion||0)<1)return combat(enemy,'Your pack is out of healing potions.');
   if(Number(pl.hp||0)>=Number(pl.maxHp||1))return combat(enemy,'You are already at full health. Save the potion for a rougher turn.');
   pl.inventory.potion--;const heal=Math.min(Number(pl.maxHp||1)-Number(pl.hp||1),Math.max(1,Math.ceil(Number(pl.maxHp||1)*.3)));pl.hp=Number(pl.hp||1)+heal;note='You drink a Healing Potion and recover '+heal+' HP.';
 }else if(action==='poultice'){
   if(Number(pl.inventory?.roadPoultice||0)<1)return combat(enemy,'There are no Road Poultices left in your pack.');
   if(Number(pl.hp||0)>=Number(pl.maxHp||1))return combat(enemy,'You are already at full health.');
   pl.inventory.roadPoultice--;const heal=Math.min(Number(pl.maxHp||1)-Number(pl.hp||1),Math.max(1,Math.ceil(Number(pl.maxHp||1)*.2)));pl.hp=Number(pl.hp||1)+heal;note='You bind a Road Poultice over your wounds and recover '+heal+' HP.';
 }else if(action==='guard'){
   note='You set your feet, raise your guard, and wait for the strike.';
 }else{
   let damage=0;
   if(action==='attack')damage=Math.max(1,rand(Number(w.min||1),Number(w.max||3))+score(pl,'strength'));
   if(action==='heavy')damage=Math.max(2,rand(Number(w.min||1),Number(w.max||3))*2+score(pl,'strength')+2);
   if(action==='skill'){
    const move=classTechnique(pl).effect;
    damage=Math.max(2,rand(Number(w.min||1),Number(w.max||3))+Math.max(1,Number(pl.level||1))+Math.max(0,score(pl,'strength')+score(pl,'magic')+score(pl,'agility')));
    if(move==='bonus damage')damage+=Math.max(3,score(pl,'strength')*2);
    if(move==='snare'){enemy.snared=true;note='Your trap catches the enemy off-balance. ';}
    if(move==='disrupt'&&enemy.intent==='heavy'){enemy.intent='attack';note='Your Rune Bolt shatters the enemy’s heavy wind-up. ';}
    if(move==='steal'){const stolen=rand(5,12);pl.gold=Number(pl.gold||0)+stolen;note='Your Swipe snatches '+stolen+'g from the enemy. ';}
    if(move==='steady'){s.pressure=clamp(s.pressure-6,0,100);note='Your fieldcraft steadies your nerves; Road Pressure falls by 6. ';}
    if(move==='luck'){const heal=Math.min(Number(pl.maxHp||1)-Number(pl.hp||1),rand(3,5));pl.hp=Number(pl.hp||1)+heal;note='A lucky opening restores '+heal+' HP. ';}
    enemy.skillCooldown=2;
   }
   if(action==='attack'&&w.perk==='quickdraw'&&enemy.intent==='guardbreak'){damage+=5;note+='Your Wooden Sword answers the feint with a quickdraw. ';}
   if(action==='heavy'&&w.perk==='breaker'){damage=Math.round(damage*1.25);note+='The Stone Sword’s heavy edge bites deep. ';}
   if(action==='skill'&&w.perk==='battleRhythm'){damage+=5;note+='Your Bronze Sword carries the technique through. ';}
   if(action==='attack'&&w.perk==='heavyPunish'&&enemy.intent==='heavy'){damage+=7;note+='Your Iron Sword punishes the wind-up. ';}
   if((action==='attack'||action==='heavy')&&w.perk==='keenEdge'&&Math.random()<.2){damage=Math.round(damage*1.5);note+='Keen Edge critical! ';}
   enemy.hp-=damage;
   note+=(action==='heavy'?'Your Heavy Strike lands for ':action==='skill'?'Your '+classTechnique(pl).name+' lands for ':'Your strike lands for ')+damage+' damage.';
   if(damage>=Math.max(1,Number(enemy.maxHp||1)*.28))note+=' The impact staggers your foe.';
 }
 if(enemy.hp<=0){save(pl);return win(enemy)}
 const base=enemy.damage||[3,7];
 const rawBase=enemy.intent==='heavy'?Number(base[1]||7)+3:enemy.intent==='guardbreak'?Number(base[0]||3)+2:rand(Number(base[0]||3),Number(base[1]||7));
 const raw=rawBase+(action==='heavy'?4:0)-(enemy.snared?7:0);
 const armorValue=Math.max(0,Number(a.defense||0));
 const reduction=enemy.intent==='guardbreak'?Math.floor(armorValue*.4)+(guarding?5:0):armorValue+(guarding?(enemy.intent==='heavy'?8:5):0);
 const incoming=Math.max(0,raw-reduction);pl.hp=Math.max(0,Number(pl.hp||1)-incoming);
 if(enemy.snared){note+=' The trap weakens the counterattack.';enemy.snared=false;}
 enemy.turn=Number(enemy.turn||0)+1;enemy.intent=enemyIntent(enemy);
 if(action!=='skill')enemy.skillCooldown=Math.max(0,Number(enemy.skillCooldown||0)-1);
 note+=(guarding?' Your guard turns the blow aside.':' '+enemy.name+' hits you for '+incoming+' damage.')+(action==='heavy'?' Your heavy swing leaves you exposed.':'');
 if(incoming>0)playBattleFx('hit');
 if(pl.hp<=0){pl.hp=1;s.stage=0;s.poiUsed={};s.pressure=clamp(s.pressure+12,0,100);save(pl);stopBattleMusic();return outcome('Driven Back','The road overwhelms you. You make it back alive, badly wounded, and the expedition is cut short.','Defeat')}
 save(pl);combat(enemy,note);
}
function win(enemy){
 stopBattleMusic();playBattleFx('victory');tone('success');
 const pl=p();if(!pl)return;const s=ensure(pl);inv(pl,enemy.reward||'fur',1);
 const progress=window.LegendProgressionV100?.award(pl,25+Math.min(20,Number(s.stage||0)*4));
 s.stage=clamp(s.stage+1,0,5);s.pressure=clamp(s.pressure-8,0,100);pl.stats=pl.stats||{};pl.stats.monstersDefeated=Number(pl.stats.monstersDefeated||0)+1;pl.stats.roadVictories=Number(pl.stats.roadVictories||0)+1;
 save(pl);renderExpedition(enemy.name+' defeated. You recover '+itemName(enemy.reward||'fur')+'. '+(progress?'XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'. ':'')+'You continue along the Old Road.');
}
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
 const progress=window.LegendProgressionV100?.award(pl,15+Number(s.stage||0)*10);
 pl.stats=pl.stats||{};
 pl.stats.oldRoadClears=Number(pl.stats.oldRoadClears||0)+1;
 s.stage=0;s.pressure=clamp(Math.floor(s.pressure*.35),0,100);
 save(pl);
 outcome('Expedition Secured','You bring the expedition home: '+reward+'g'+(complete?' and a Road Token. The Road Tokens can now open a new region.':'.')+(progress?' XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'.':'')+routeReport,'Return')
}
function outcome(title,text,kicker,skill,modifier){
 stopBattleMusic();
 const pl=p();if(!pl)return;
 const s=ensure(pl);
 shell(header(pl,s,kicker||'EXPEDITION COMPLETE',title,text)+'<section class="exp100-explore-dock exp100-outcome"><div class="exp100-route"><span>THE ROAD REMEMBERS</span><strong>'+esc(title)+'</strong><small>'+esc(text)+'</small></div><div class="exp100-dock-actions"><button class="exp100-dock-action primary" id="outcomeReturn"><strong>Return to Ashmere</strong><span>Leave the road and return to town.</span></button></div></section>');
 document.getElementById('outcomeReturn')?.addEventListener('click',()=>{
  const player=p();
  if(player){player.town='Ashmere';save(player);}
  const host=root();
  if(host)host.innerHTML='';
  if(window.LegendAshmereV099?.renderAshmere){
    window.LegendAshmereV099.renderAshmere();
    if(document.querySelector('.ash100-town'))return;
  }
  ret();
});
}
window.LegendRoadControllerV100={start,renderHub:renderExpedition,renderExpedition};
})();