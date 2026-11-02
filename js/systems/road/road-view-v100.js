/* LEGEND v0.20.36 - Old Road presentation and interaction shell.
 * Owns scene markup, DOM-preserving shell updates, UI sound binding, discovery
 * hotspot delegation, and expedition header rendering. Game state/rewards remain
 * in the expedition and discovery systems and are injected as callbacks.
 */
(() => {
  function create(context = {}) {
    const {getRoot,getPlayer,getAssets,ensureState,roadDiscovery,escapeHtml,clamp:clampValue,
      getRoadAudio,soundOn,tone,hpPercent,resolveChoice,finish,areaForStage}=context;
    if(typeof getRoot!=='function'||typeof getPlayer!=='function'||typeof getAssets!=='function'||
      typeof ensureState!=='function'||typeof escapeHtml!=='function'||typeof clampValue!=='function'||
      typeof getRoadAudio!=='function'||typeof soundOn!=='function'||typeof tone!=='function'||
      typeof hpPercent!=='function'||typeof resolveChoice!=='function'||typeof finish!=='function'||
      typeof areaForStage!=='function'||typeof roadDiscovery?.pointOfInterest!=='function')return null;
    const root=getRoot,p=getPlayer,A=getAssets,ensure=ensureState,esc=escapeHtml,clamp=clampValue;
    const roadAudio=getRoadAudio,hpPct=hpPercent;
function scene(stage=0,interactive=true){
 const art=A().locations||{};
 const stageNum=clamp(Number(stage||0),0,5),pl=p(),s=pl?ensure(pl):{},route=s.routeChoice;
 const fallback=art.oldRoad||art.highRidge||art.roadCamp||'assets/generated/locations/old-road-south-fork.webp';
 const stageScenes={
  0:{path:art.oldRoad||fallback,alt:'The Old Road opens at South Fork, where two muddy tracks leave the lantern line.'},
  1:route==='ridge'?{path:art.highRidge||art.oldRoad||fallback,alt:'The exposed High Ridge climbs above the flooded lowland.'}:{path:art.reedCut||art.oldRoad||fallback,alt:'The Reed Cut winds through waterlogged reeds and poor sight lines.'},
  2:{path:art.roadCamp||art.oldRoad||fallback,alt:'Wayfarer’s Camp rests in a sheltered clearing beside the Old Road.'},
  3:{path:art.oldRoadMain||art.highRidge||art.oldRoad||fallback,alt:'Blackroot Bend, where ancient roots split the road around a weathered stone seal.'},
  4:{path:art.greyfenMarshWalkway||art.reedCut||art.roadCamp||fallback,alt:'Reedwatch Shelter stands above the lowland route with its abandoned locker and watch lantern.'},
  5:{path:art.greyfenMain||art.greyfenMarshWalkway||art.reedCut||fallback,alt:'The Greyfen boundary stone marks the last rise before the drowned lowlands.'}
 };
 const chosenScene=stageScenes[stageNum]||stageScenes[0];
 const path=chosenScene.path;
 const point=roadDiscovery.pointOfInterest(stage),stageClass='exp100-stage-'+stageNum,sideTrip=s.activeSideTripV160;
 const sideInfo=sideTrip==='windbreak'?{label:'WINDBREAK',alt:'A sheltered rock shelf above the lowland tracks',path:art.highRidge||art.oldRoad||fallback}
  :sideTrip==='sunken-cart'?{label:'SUNKEN CART',alt:'A partly submerged cart beside the reed-choked road',path:art.reedCut||art.oldRoad||fallback}:null;
 const scenePath=sideInfo?.path||path;
 const poiDone=!!s.poiUsed?.[point.key];
 const hotspots=interactive&&!sideTrip&&!poiDone
  ? '<div class="exp100-hotspots" aria-label="Discover the road"><button class="exp100-hotspot exp100-hotspot-find" data-hotspot="poi" style="--hx:'+point.x+'%;--hy:'+point.y+'%"><i>'+esc(point.icon)+'</i><span>Look closer</span></button></div>'
  : '<div class="exp100-hotspots" aria-hidden="true"></div>';
 return '<div class="exp100-scene exp100-scene-live '+stageClass+(sideTrip?' exp160-side-trip-scene':'')+(poiDone?' exp160-scene-discovery-registered':'')+'" data-stage="'+stageNum+'" data-scene-location="'+esc(sideInfo?.label||areaForStage(stage).name)+'"><img src="'+esc(scenePath)+'" alt="'+esc(sideInfo?.alt||chosenScene.alt)+'" onerror="if(this.dataset.fallbackApplied){this.style.display=\'none\'}else{this.dataset.fallbackApplied=\'1\';this.src=\''+esc(fallback)+'\'}"><div class="exp100-scene-shade"></div>'+hotspots+'<span class="exp100-scene-label">THE OLD ROAD <i>•</i> '+esc((sideInfo?.label||areaForStage(stage).name).toUpperCase())+'</span><button class="exp100-sound" id="exp100-sound" type="button" aria-label="Toggle sound effects">Sound: '+(soundOn()?'On':'Off')+'</button></div>';
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
   roadAudio().toggleSound?.()
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
  roadDiscovery.reveal(stage);
  const liveScene=wrap?.querySelector('.exp100-scene-live');
  if(liveScene){liveScene.classList.remove('exp160-discovery-reveal');void liveScene.offsetWidth;liveScene.classList.add('exp160-discovery-reveal');}
  if(!wrap||wrap.querySelector('.exp100-discovery-beat'))return;
  const markup=roadDiscovery.pointOfInterestPanel(pl,s,stage);
  if(!markup)return;
  const interactions=wrap.querySelector('.exp150-interactions');
  if(interactions){
   const anchor=interactions.querySelector('.exp100-route-choice, .exp100-poi-done, .exp100-moved-cairn');
   if(anchor)anchor.insertAdjacentHTML('afterend',markup);
   else interactions.insertAdjacentHTML('afterbegin',markup);
  }else{
   const anchor=wrap.querySelector('.exp100-route-choice, .exp100-poi-done')||wrap.querySelector('.exp100-head');
   if(!anchor)return;
   anchor.insertAdjacentHTML('afterend',markup);
  }
  const leave=wrap.querySelector('#poiLeave');
  if(leave)leave.addEventListener('click',()=>{
   roadDiscovery.hide();
   leave.closest('.exp100-discovery-beat')?.remove();
  });
  const inspect=wrap.querySelector('#poiInspect');
  if(inspect)inspect.addEventListener('click',roadDiscovery.inspectPointOfInterest);
  return;
 }
 roadDiscovery.hide();
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

    return Object.freeze({scene,shell,handleHotspotAction,bindHotspotDelegation,header});
  }
  window.LegendRoadViewV100=Object.freeze({create});
})();
