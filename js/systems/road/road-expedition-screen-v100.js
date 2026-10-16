/* LEGEND v0.20.36 - Old Road expedition screen assembly.
 * Chooses stage panels and binds camp, travel, search, discovery and return controls.
 * State/effect decisions are injected from their domain-owned modules.
 */
(() => {
 function create(context = {}) {
  const {getPlayer,ensureState,areaForStage,escapeHtml,shell,header,roadDiscovery,
    bindHotspotDelegation,savePlayer,resolveChoice,finish,addInventory,clamp,returnToAshmere}=context;
  if(typeof getPlayer!=='function'||typeof ensureState!=='function'||typeof areaForStage!=='function'||
    typeof escapeHtml!=='function'||typeof shell!=='function'||typeof header!=='function'||
    typeof roadDiscovery?.routeChoicePanel!=='function'||typeof bindHotspotDelegation!=='function'||
    typeof savePlayer!=='function'||typeof resolveChoice!=='function'||typeof finish!=='function'||
    typeof addInventory!=='function'||typeof clamp!=='function')return null;
  const p=getPlayer,ensure=ensureState,esc=escapeHtml,save=savePlayer,inv=addInventory,ret=returnToAshmere;
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
  shell(header(pl,s,'OLD ROAD EXPEDITION',area.name,sceneText)+roadDiscovery.routeChoicePanel(s,stage)+roadDiscovery.pointOfInterestPanel(pl,s,stage)+roadDiscovery.movedCairnDecisionPanel(pl,s,stage)+(atCamp?campActions(pl,s):'')+'<section class="exp100-explore-dock"><div class="exp100-route"><span>BEYOND THE MIST</span><strong>'+esc(areaForStage(Math.min(5,stage+1)).name)+'</strong><small>Follow the road when you are ready.</small></div><div class="exp100-dock-actions">'+choices+'</div><div class="exp100-actions"><button class="exp100-btn" id="town">Abandon expedition</button></div></section>');
  bindHotspotDelegation();
  document.getElementById('poiLeave')?.addEventListener('click',()=>{const pl=p();if(!pl)return;const s=ensure(pl);s.discoveryOpen=false;s.discoveryStage=null;roadDiscovery.hide();save(pl);document.querySelector('.exp100-discovery-beat')?.remove();});
  document.getElementById('poiInspect')?.addEventListener('click',roadDiscovery.inspectPointOfInterest);
  document.querySelectorAll('[data-moved-cairn]').forEach(button=>button.addEventListener('click',()=>roadDiscovery.chooseMovedCairnDecision(button.dataset.movedCairn)));
  document.getElementById('routeRidge')?.addEventListener('click',()=>roadDiscovery.chooseRoadRoute('ridge'));
  document.getElementById('routeReeds')?.addEventListener('click',()=>roadDiscovery.chooseRoadRoute('reeds'));
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

  return Object.freeze({render:renderExpedition});
 }
 window.LegendRoadExpeditionScreenV100=Object.freeze({create});
})();
