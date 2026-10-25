/* LEGEND v0.21.0 — immersive scene-first expedition interface.
 * Presentation is rebuilt around the road scene, compact route progress,
 * contextual actions, and focused map / field-journal overlays.
 * Existing discovery, travel, camp, combat, inventory, and return services remain authoritative.
 */
(() => {
 function create(context = {}) {
  const {getPlayer,ensureState,areaForStage,escapeHtml,shell,header,scene,roadDiscovery,
    bindHotspotDelegation,savePlayer,resolveChoice,finish,addInventory,clamp,returnToAshmere}=context;
  if(typeof getPlayer!=='function'||typeof ensureState!=='function'||typeof areaForStage!=='function'||
    typeof escapeHtml!=='function'||typeof shell!=='function'||
    typeof roadDiscovery?.routeChoicePanel!=='function'||typeof bindHotspotDelegation!=='function'||
    typeof savePlayer!=='function'||typeof resolveChoice!=='function'||typeof finish!=='function'||
    typeof addInventory!=='function'||typeof clamp!=='function')return null;
  const p=getPlayer,ensure=ensureState,esc=escapeHtml,save=savePlayer,inv=addInventory,ret=returnToAshmere;
  const journalFor=pl=>{
    pl.flags=pl.flags||{};
    pl.flags.roadFieldJournalV150=pl.flags.roadFieldJournalV150||{visitedPlaces:[],discoveries:[],routes:[]};
    const journal=pl.flags.roadFieldJournalV150;
    journal.visitedPlaces=Array.isArray(journal.visitedPlaces)?journal.visitedPlaces:[];
    journal.discoveries=Array.isArray(journal.discoveries)?journal.discoveries:[];
    journal.routes=Array.isArray(journal.routes)?journal.routes:[];
    journal.campReports=Array.isArray(journal.campReports)?journal.campReports:[];
    return journal;
  };
  function campActions(pl,s,area){
    const camp=Number(pl.inventory?.camp||0),food=Number(pl.inventory?.food||0),herb=Number(pl.inventory?.roadHerb||0),cloth=Number(pl.inventory?.clothScrap||0);
    const stageKey=String(Number(s.stage||0)),watchUsed=!!s.campWatchUsed?.[stageKey],restUsed=!!s.campRestUsed?.[stageKey];
    const route=s.routeChoice;
    const routeMood=route==='ridge'
      ?'The High Ridge drops away in pale stone shelves. From the sheltered fire, you can still make out the old markers along the safer line.'
      :route==='reeds'
        ?'Water ticks beneath the roots. Something moves beyond the far reeds, stopping whenever the fire gutters.'
        :'Rain taps the lean-to roof. A cold ash-ring suggests the last travelers left in a hurry.';
    const pressureMood=Number(s.pressure||0)>=65
      ?'The fire burns low. Something circles the clearing just beyond the reach of light.'
      :Number(s.pressure||0)>=40
        ?'The birds have stopped calling. Every small sound carries farther than it should.'
        :'For a little while, only rain and the fire answer one another.';
    return '<section class="exp100-camp exp150-camp"><div class="exp100-camp-heading"><span>WAYSTATION · NIGHT WATCH</span><strong>Make this stop count</strong><small>Choose how to spend the quiet before the road starts moving again.</small></div><div class="exp150-camp-atmosphere"><span class="exp150-kicker">AT THE FIRELINE</span><p>'+routeMood+'</p><small>'+pressureMood+'</small></div><div class="exp100-camp-actions exp150-camp-actions"><button class="exp100-choice" id="campRest" '+((restUsed||(camp<1&&food<1))?'disabled':'')+'><strong>'+(restUsed?'Rested':'Rest by the Fire')+'</strong><span>'+(restUsed?'You have already rested at this stop.':'Recover 20% of maximum health and reduce Road Pressure by 12. Passes the night.')+'</span><em>'+(restUsed?'This stop is settled':'Cost: 1 Camp Supply or 1 Ration')+'</em></button><button class="exp100-choice" id="campCraft" '+((herb<1||cloth<1)?'disabled':'')+'><strong>Craft a Road Poultice</strong><span>Use 1 Road Herb and 1 Cloth Scrap to make a healing potion.</span><em>Materials: '+herb+' herbs · '+cloth+' cloth</em></button><button class="exp100-choice exp150-watch-choice" id="campWatch" '+((food<1||watchUsed)?'disabled':'')+'><strong>'+(watchUsed?'Watch Kept':'Keep Watch')+'</strong><span>'+(watchUsed?'You have already kept watch at this stop.':'Spend a ration to lower Road Pressure by 18 and record what you hear. No health restored.')+'</span><em>'+(watchUsed?'This stop is settled':('Cost: 1 Ration · '+food+' carried'))+'</em></button></div></section>';
  }
  function statusMetric(label,value,percent,kind=''){
    return '<div class="exp150-meter '+kind+'"><div><span>'+label+'</span><strong>'+value+'</strong></div><i><b style="width:'+clamp(Number(percent)||0,0,100)+'%"></b></i></div>';
  }
  function graphForState(pl,s,stage){
    const graph=window.LegendRoadsV100?.oldRoad?.routeGraphV160;
    if(!graph)return null;
    const validIds=new Set(graph.nodes.map(node=>node.id));
    const normalize=key=>Array.isArray(s[key])?[...new Set(s[key].filter(id=>validIds.has(id)))]:[];
    s.visitedNodeIdsV160=normalize('visitedNodeIdsV160');
    s.discoveredNodeIdsV160=normalize('discoveredNodeIdsV160');
    s.completedInteractionIdsV160=Array.isArray(s.completedInteractionIdsV160)?[...new Set(s.completedInteractionIdsV160.filter(id=>typeof id==='string'))]:[];
    const add=(list,id)=>{if(id&&validIds.has(id)&&!list.includes(id))list.push(id);};
    if(s.activeSideTripV160&&validIds.has(s.activeSideTripV160)){
      s.currentNodeIdV160=s.activeSideTripV160;
      add(s.visitedNodeIdsV160,s.currentNodeIdV160);
      add(s.discoveredNodeIdsV160,s.currentNodeIdV160);
      return graph;
    }
    let current='south-fork';
    if(stage===1&&s.routeChoice==='ridge')current='ridgeway-cairn';
    else if(stage===1&&s.routeChoice==='reeds')current='lantern-ditch';
    else if(stage>=2)current=({2:'wayfarers-camp',3:'blackroot-bend',4:'reedwatch-shelter',5:'greyfen-boundary'})[stage]||'greyfen-boundary';
    s.currentNodeIdV160=current;
    add(s.visitedNodeIdsV160,'south-fork');
    if(stage>=1&&s.routeChoice==='ridge'){
      add(s.visitedNodeIdsV160,'high-ridge');add(s.visitedNodeIdsV160,'ridgeway-cairn');
      if(s.poiUsed?.['ridge-cairn'])add(s.discoveredNodeIdsV160,'ridgeway-cairn');
    }else if(stage>=1&&s.routeChoice==='reeds'){
      add(s.visitedNodeIdsV160,'reed-cut');add(s.visitedNodeIdsV160,'lantern-ditch');
      if(s.poiUsed?.['marsh-watcher-tracks']||s.poiUsed?.['ditch-lantern'])add(s.discoveredNodeIdsV160,'lantern-ditch');
    }
    if(stage>=2)add(s.visitedNodeIdsV160,'wayfarers-camp');
    if(stage>=3)add(s.visitedNodeIdsV160,'blackroot-bend');
    if(stage>=4)add(s.visitedNodeIdsV160,'reedwatch-shelter');
    if(stage>=5)add(s.visitedNodeIdsV160,'greyfen-boundary');
    const currentNode=graph.nodes.find(node=>node.id===current);
    if(currentNode?.poiKey&&s.poiUsed?.[currentNode.poiKey])add(s.discoveredNodeIdsV160,current);
    return graph;
  }
  function addJournalDiscovery(pl,s,nodeId,key,name,note){
    const graph=window.LegendRoadsV100?.oldRoad?.routeGraphV160;
    const node=graph?.nodes?.find(item=>item.id===nodeId);
    if(!node)return;
    const journal=journalFor(pl),trip=Number(s.trips||0);
    if(!journal.discoveries.some(item=>item.key===key&&Number(item.trip||0)===trip)){
      journal.discoveries.push({key,name,kind:node.type,place:node.name,note,route:s.routeChoice||'unrecorded',day:Number(pl.day||1),trip});
    }
    if(!journal.visitedPlaces.includes(node.name))journal.visitedPlaces.push(node.name);
    s.discoveredNodeIdsV160=s.discoveredNodeIdsV160||[];
    if(!s.discoveredNodeIdsV160.includes(nodeId))s.discoveredNodeIdsV160.push(nodeId);
    s.completedInteractionIdsV160=s.completedInteractionIdsV160||[];
    if(!s.completedInteractionIdsV160.includes(nodeId))s.completedInteractionIdsV160.push(nodeId);
    pl.stats=pl.stats||{};
    pl.stats.optionalRoadStopsCompleted=Number(pl.stats.optionalRoadStopsCompleted||0)+1;
    save(pl);
  }
  function advanceOptionalTime(pl,s,hours){
    const total=clamp(Number(s.roadClockHour??15),0,23)+Number(hours||0);
    pl.day=Math.max(1,Number(pl.day||1)+Math.floor(total/24));
    s.roadClockHour=total%24;
  }
  function beginOptionalSite(nodeId){
    const pl=p();if(!pl)return;
    const s=ensure(pl),graph=graphForState(pl,s,clamp(Number(s.stage||0),0,5));
    const expected=s.routeChoice==='ridge'?'windbreak':s.routeChoice==='reeds'?'sunken-cart':null;
    if(Number(s.stage||0)!==1||nodeId!==expected||s.visitedNodeIdsV160.includes(nodeId))return renderExpedition('That detour is not available from your current location.');
    s.sideTripReturnNodeIdV160=s.currentNodeIdV160;
    s.activeSideTripV160=nodeId;
    s.currentNodeIdV160=nodeId;
    if(!s.visitedNodeIdsV160.includes(nodeId))s.visitedNodeIdsV160.push(nodeId);
    if(!s.discoveredNodeIdsV160.includes(nodeId))s.discoveredNodeIdsV160.push(nodeId);
    save(pl);
    renderExpedition();
  }
  function leaveOptionalSite(){
    const pl=p();if(!pl)return;
    const s=ensure(pl);
    if(!s.activeSideTripV160)return;
    s.activeSideTripV160=null;
    s.currentNodeIdV160=s.sideTripReturnNodeIdV160||'south-fork';
    s.sideTripReturnNodeIdV160=null;
    save(pl);
    renderExpedition('You return to the marked route. The detour remains in your field map.');
  }
  function optionalSiteMarkup(pl,s,node){
    const completed=(s.completedInteractionIdsV160||[]).includes(node.id);
    if(node.id==='windbreak'){
      return '<section class="exp160-optional-site" aria-label="Windbreak optional stop"><span class="exp150-kicker">OPTIONAL DETOUR · RIDGE</span><h2>Windbreak</h2><p>'+esc(node.description)+' From the shelter, shallow bootprints cross the dry edge and separate lines of traffic can be seen below. Nothing identifies who passed.</p><div class="exp160-site-actions"><button type="button" class="exp100-choice" id="exp160WindObserve" '+(completed?'disabled':'')+'><strong>Study the tracks and traffic</strong><span>Record what the ground and visible routes show without guessing who made them.</span><em>Cost: 1 hour · No supplies</em></button><button type="button" class="exp100-choice" id="exp160WindShelter" '+(completed||Number(pl.inventory?.food||0)<1?'disabled':'')+'><strong>Spend a ration to shelter</strong><span>Take a short pause behind the rock shelf to recover a little strength.</span><em>Cost: 1 Ration + 1 hour · Restore up to 5 HP and lower Road Pressure by 8</em></button></div>'+(completed?'<p class="exp160-site-complete" role="status">You have completed one interaction here this trip. You can return to the route or continue to Wayfarer’s Camp.</p>':'')+'</section>';
    }
    return '<section class="exp160-optional-site" aria-label="Sunken Cart optional stop"><span class="exp150-kicker">OPTIONAL DETOUR · REED CUT</span><h2>Sunken Cart</h2><p>'+esc(node.description)+' The boards are waterlogged and the cargo marks are too worn to identify a person or explain who used the cart.</p><div class="exp160-site-actions"><button type="button" class="exp100-choice" id="exp160CartInspect" '+(completed?'disabled':'')+'><strong>Inspect the cargo marks</strong><span>Record the visible markings and the condition of the cargo. No reward is promised by this inspection.</span><em>Cost: None · No supplies</em></button><button type="button" class="exp100-choice" id="exp160CartSalvage" '+(completed?'disabled':'')+'><strong>Salvage one usable bundle</strong><span>Take one intact cloth wrap from above the waterline before moving on.</span><em>Cost: 1 hour + 5 Road Pressure · Gain 1 Cloth Scrap</em></button></div>'+(completed?'<p class="exp160-site-complete" role="status">You have completed one interaction here this trip. You can return to the route or continue to Wayfarer’s Camp.</p>':'')+'</section>';
  }
  function optionalDetourCard(pl,s,stage){
    if(stage!==1||s.activeSideTripV160||!s.routeChoice)return '';
    const id=s.routeChoice==='ridge'?'windbreak':'sunken-cart';
    if((s.visitedNodeIdsV160||[]).includes(id))return '';
    const title=id==='windbreak'?'Windbreak':'Sunken Cart';
    const copy=id==='windbreak'?'A shallow lee offers a place to observe the tracks and visible traffic below.':'A partly submerged cart holds a possible scrap of salvage and worn cargo marks.';
    return '<section class="exp160-optional-detour" aria-label="Optional road detour"><span class="exp150-kicker">OFF THE MARKED ROUTE</span><h3>'+title+' <small>OPTIONAL</small></h3><p>'+copy+' Visiting is never required to complete the expedition.</p><button type="button" class="exp100-choice" id="exp160VisitOptional" data-node="'+id+'"><strong>Visit '+title+'</strong><span>Make a short detour, then return to the route or continue to camp.</span><em>Optional · costs and rewards are shown at the location</em></button></section>';
  }
  function wireOptionalSiteActions(pl,s,node){
    const completed=(s.completedInteractionIdsV160||[]).includes(node.id);
    if(completed)return;
    if(node.id==='windbreak'){
      document.getElementById('exp160WindObserve')?.addEventListener('click',()=>{
        const player=p();if(!player)return;const state=ensure(player);
        advanceOptionalTime(player,state,1);
        addJournalDiscovery(player,state,'windbreak','windbreak-track-observation','Tracks from the Windbreak','From the dry lee, you recorded shallow prints crossing the shelf and two lines of traffic below. Their makers and purpose remain unknown.');
        renderExpedition('You spend an hour studying the tracks and the lowland routes. Your notes record what you saw, not who made the tracks.');
      });
      document.getElementById('exp160WindShelter')?.addEventListener('click',()=>{
        const player=p();if(!player)return;const state=ensure(player);
        if(Number(player.inventory?.food||0)<1)return renderExpedition('You need one Ration to shelter at Windbreak.');
        player.inventory.food=Number(player.inventory.food||0)-1;advanceOptionalTime(player,state,1);
        const healed=Math.min(5,Math.max(0,Number(player.maxHp||1)-Number(player.hp||0)));
        player.hp=Number(player.hp||0)+healed;state.pressure=clamp(Number(state.pressure||0)-8,0,100);
        addJournalDiscovery(player,state,'windbreak','windbreak-shelter-note','A Pause at Windbreak','You spent a ration behind the rock shelf. The wind eased for a time, and the tracks below remained too distant to identify.');
        renderExpedition('You spend one Ration and an hour in shelter. You recover '+healed+' HP and Road Pressure falls by 8.');
      });
    }else if(node.id==='sunken-cart'){
      document.getElementById('exp160CartInspect')?.addEventListener('click',()=>{
        const player=p();if(!player)return;const state=ensure(player);
        addJournalDiscovery(player,state,'sunken-cart','sunken-cart-marks','Waterlogged Cart Marks','The cargo marks are water-worn and incomplete. No surviving name identifies the cart or explains why it was here.');
        renderExpedition('You record the waterlogged cargo marks. They provide a field note, but no reliable name or explanation.');
      });
      document.getElementById('exp160CartSalvage')?.addEventListener('click',()=>{
        const player=p();if(!player)return;const state=ensure(player);
        advanceOptionalTime(player,state,1);state.pressure=clamp(Number(state.pressure||0)+5,0,100);
        inv(player,'clothScrap',1);player.stats=player.stats||{};player.stats.resourcesFound=Number(player.stats.resourcesFound||0)+1;
        addJournalDiscovery(player,state,'sunken-cart','sunken-cart-salvage','A Salvaged Cloth Wrap','You recovered one intact cloth wrap. The rest of the cargo remains waterlogged; its former owner is unknown.');
        renderExpedition('You salvage one Cloth Scrap. The work costs an hour and raises Road Pressure by 5.');
      });
    }
  }
  function trackerMarkup(pl,s,stage){
    const journal=journalFor(pl);
    const visited=new Set(journal.visitedPlaces);
    return '<nav class="exp150-route-tracker" aria-label="Expedition progress"><div class="exp150-tracker-label"><span>YOUR JOURNEY</span><small>'+stage+' / 5 travel legs</small></div><ol>'+Array.from({length:6},(_,i)=>{
      const stop=areaForStage(i),name=String(stop.name||('Road '+(i+1))),isCurrent=i===stage,isVisited=visited.has(name)||i<stage;
      return '<li class="'+(isCurrent?'is-current ':'')+(isVisited?'is-visited':'')+'"><span class="exp150-stop-marker">'+(isVisited&&!isCurrent?'✓':String(i+1).padStart(2,'0'))+'</span><span class="exp150-stop-name">'+esc(name)+'</span></li>';
    }).join('')+'</ol></nav>';
  }
  function mapPanel(pl,s,stage){
    const journal=journalFor(pl),graph=graphForState(pl,s,stage),route=s.routeChoice,currentId=s.currentNodeIdV160;
    const visited=new Set(s.visitedNodeIdsV160||[]),discovered=new Set(s.discoveredNodeIdsV160||[]);
    const nodes=graph?.nodes||[],edges=graph?.edges||[];
    const nodeById=Object.fromEntries(nodes.map(node=>[node.id,node]));
    const discoveries=[...journal.discoveries].slice().reverse();
    const permittedEdges=edges.filter(edge=>!edge.route||!route||edge.route===route);
    const reachable=new Set(permittedEdges.filter(edge=>edge.from===currentId).map(edge=>edge.to));
    const knownFromJournal=node=>journal.visitedPlaces.includes(node.name)||journal.discoveries.some(item=>item.place===node.name||item.key===node.poiKey);
    function card(id){
      const node=nodeById[id];if(!node)return '';
      const isCurrent=currentId===id,isVisited=visited.has(id),isReachable=reachable.has(id),isDiscovered=discovered.has(id);
      const offRoute=!!(node.route&&route&&node.route!==route);
      const known=knownFromJournal(node);
      const skippedOptional=!!node.optional&&node.route===route&&stage>1&&!isVisited&&!isDiscovered&&!known;
      const status=offRoute?'Route not taken':isCurrent?'You are here':isVisited?'Visited this trip':isReachable?(node.optional?'Optional detour available':'Reachable next'):isDiscovered?'Discovered, not visited':known?'Known from an earlier expedition':skippedOptional?'Detour skipped':'Uncharted';
      const statusClass=offRoute?'is-off-route':isCurrent?'is-current':isVisited?'is-visited':isReachable?'is-reachable':isDiscovered?'is-discovered':known?'is-known':skippedOptional?'is-known':'is-unknown';
      let action='';
      if(stage===0&&!route&&id==='high-ridge')action='<button type="button" class="exp160-map-action" data-exp160-map-route="ridge">Choose High Ridge</button>';
      else if(stage===0&&!route&&id==='reed-cut')action='<button type="button" class="exp160-map-action" data-exp160-map-route="reeds">Choose Reed Cut</button>';
      else if(stage===1&&isReachable&&node.optional&&!isVisited&&node.route===route)action='<button type="button" class="exp160-map-action" data-exp160-map-visit="'+id+'">Visit optional stop</button>';
      return '<article class="exp160-map-node '+statusClass+(node.optional?' is-optional':'')+'" role="listitem" aria-label="'+esc(node.name+', '+status)+'"><div class="exp160-map-node-head"><span class="exp160-map-symbol" aria-hidden="true">'+(isCurrent?'✦':isVisited?'✓':node.optional?'◇':'·')+'</span><div><strong>'+esc(node.name)+(node.optional?' <small>OPTIONAL</small>':'')+'</strong><span>'+esc(node.type||'Road stop')+'</span></div></div><p>'+esc(node.description||'A place along the Old Road.')+'</p><div class="exp160-map-node-status">'+esc(status)+'</div>'+action+'</article>';
    }
    const row=(ids,cls='')=>'<div class="exp160-map-row '+cls+'" role="list">'+ids.map(card).join('')+'</div>';
    const graphMarkup='<section class="exp160-route-graph" aria-label="Connected Old Road route"><div class="exp160-graph-legend"><span><i>✦</i> You are here</span><span><i>✓</i> Visited this trip</span><span><i>→</i> Reachable next</span><span><i>◇</i> Optional detour</span></div>'+
      row(['south-fork'],'exp160-row-start')+
      '<div class="exp160-map-connectors" aria-hidden="true"><span>↙ High Ridge</span><span>↘ Reed Cut</span></div>'+
      row(['high-ridge','reed-cut'],'exp160-row-branches')+
      '<div class="exp160-map-connectors exp160-map-connectors-double" aria-hidden="true"><span>↓ Ridgeway Cairn</span><span>↓ Lantern Ditch</span></div>'+
      row(['ridgeway-cairn','lantern-ditch'],'exp160-row-landmarks')+
      '<div class="exp160-map-connectors exp160-map-connectors-junction" aria-hidden="true"><span>↘ Optional shelter</span><span>↓ Shared junction</span><span>↙ Optional salvage</span></div>'+
      row(['windbreak','wayfarers-camp','sunken-cart'],'exp160-row-junction')+
      '<div class="exp160-map-connectors" aria-hidden="true"><span>↓ The shared road continues</span></div>'+
      row(['blackroot-bend'],'exp160-row-shared')+
      '<div class="exp160-map-connectors" aria-hidden="true"><span>↓</span></div>'+
      row(['reedwatch-shelter'],'exp160-row-shared')+
      '<div class="exp160-map-connectors" aria-hidden="true"><span>↓</span></div>'+
      row(['greyfen-boundary'],'exp160-row-shared')+
      '<ul class="exp160-map-connection-text" aria-label="Route connections">'+permittedEdges.map(edge=>'<li>'+esc(nodeById[edge.from]?.name||edge.from)+' connects to '+esc(nodeById[edge.to]?.name||edge.to)+(edge.kind==='optional'?' by an optional detour':edge.kind==='return'?' by a return path':'')+'.</li>').join('')+'</ul></section>';
    const discoveryMarkup=discoveries.length?discoveries.map(item=>{
      const routeName=item.route==='ridge'?'High Ridge':item.route==='reeds'?'Reed Cut':'Unrecorded route';
      return '<article class="exp150-map-discovery"><span class="exp150-map-discovery-pin" aria-hidden="true">✧</span><div><strong>'+esc(item.name||'Road discovery')+'</strong><small>'+esc(item.place||'The Old Road')+' · Day '+esc(String(item.day||1))+' · '+esc(routeName)+'</small><p>'+esc(item.note||'A landmark recorded in your field journal.')+'</p></div></article>';
    }).join(''):'<p class="exp150-map-discovery-empty">No landmarks marked yet. Investigate a point of interest along the road to add its mark here.</p>';
    return '<div class="exp150-map-sheet"><div class="exp150-map-intro"><span class="exp150-kicker">FIELD MAP · OLD ROAD</span><h2>The road you know</h2><p>This is a connected route, not just a record of places already passed. Your current stop, visited places, available next steps, optional detours, and known but unvisited sites are labeled below.</p></div>'+graphMarkup+'<section class="exp150-map-discoveries"><div class="exp150-map-discoveries-heading"><span>MARKS FOUND</span><strong>'+discoveries.length+'</strong></div><div class="exp150-map-discovery-list">'+discoveryMarkup+'</div></section></div>';
  }
  function journalPanel(pl){
    const journal=journalFor(pl);
    const discoveries=[...journal.discoveries].slice().reverse();
    const routes=[...journal.routes].slice().reverse();
    const campReports=[...journal.campReports].slice().reverse();
    const discoveryMarkup=discoveries.length?discoveries.map(item=>'<article class="exp150-journal-entry"><span class="exp150-journal-entry-type">'+esc(item.kind||'Discovery')+' · '+esc(item.place||'The Old Road')+'</span><strong>'+esc(item.name||'Field note')+'</strong><p>'+esc(item.note||'The traveler recorded a detail worth remembering.')+'</p></article>').join(''):'<div class="exp150-journal-empty"><span>✧</span><strong>No clues recorded yet</strong><p>Investigate a landmark in the world to add a field note here.</p></div>';
    const routeMarkup=routes.length?routes.map(item=>'<article class="exp150-route-entry"><span>'+esc(item.place||'The Old Road')+'</span><strong>'+esc(item.title||'Route decision')+'</strong><small>'+esc(item.note||'A choice made on the road.')+'</small></article>').join(''):'<p class="exp150-journal-muted">Route decisions will be recorded here as you explore.</p>';
    const campMarkup=campReports.length?campReports.map(item=>'<article class="exp150-route-entry"><span>'+esc(item.place||'The Old Road')+' · '+esc(item.routeName||'Unrecorded route')+'</span><strong>'+(item.kind==='rest'?'Rest by the fire':item.kind==='craft'?'Road poultice crafted':'Night watch')+' · Day '+esc(String(item.day||1))+'</strong><small>'+esc(item.note||'You kept watch through the night.')+' Road Pressure: '+esc(String(item.pressureBefore??0))+'% → '+esc(String(item.pressureAfter??0))+'%.</small></article>').join(''):'<p class="exp150-journal-muted">Rest, crafting, and watches will be recorded here as you make camp.</p>';
    const places=journal.visitedPlaces.length?journal.visitedPlaces.map(name=>'<span class="exp150-place-chip">'+esc(name)+'</span>').join(''):'<p class="exp150-journal-muted">Places appear as your journey reaches them.</p>';
    return '<div class="exp150-journal-sheet"><div class="exp150-map-intro"><span class="exp150-kicker">TRAVELER’S FIELD JOURNAL</span><h2>What the road remembers</h2><p>Your discoveries persist between expeditions. Quest evidence and inventory remain in their own existing records.</p></div><section class="exp150-journal-section"><h3>Places visited <span>'+journal.visitedPlaces.length+'</span></h3><div class="exp150-place-list">'+places+'</div></section><section class="exp150-journal-section"><h3>Clues & discoveries <span>'+discoveries.length+'</span></h3>'+discoveryMarkup+'</section><section class="exp150-journal-section"><h3>Route decisions <span>'+routes.length+'</span></h3>'+routeMarkup+'</section><section class="exp150-journal-section"><h3>Camp reports <span>'+campReports.length+'</span></h3>'+campMarkup+'</section></div>';
  }
  function openPanel(kind){
    const pl=p();if(!pl)return;
    const s=ensure(pl),stage=clamp(Number(s.stage||0),0,5),overlay=document.getElementById('exp150Modal');
    const content=document.getElementById('exp150ModalContent');
    if(!overlay||!content)return;
    const returnFocus=document.activeElement;
    content.innerHTML=(kind==='map'?mapPanel(pl,s,stage):journalPanel(pl))+'<button type="button" class="exp150-modal-close" id="exp150ModalClose">Return to the road</button>';
    overlay.querySelector('[role="dialog"]')?.setAttribute('aria-label',kind==='map'?'Road map':'Field journal');
    overlay.hidden=false;
    overlay.classList.add('is-open');
    document.body.classList.add('exp150-modal-open');
    document.getElementById('exp150ModalClose')?.focus();
    const close=()=>{
      overlay.hidden=true;
      overlay.classList.remove('is-open');
      document.body.classList.remove('exp150-modal-open');
      if(returnFocus&&typeof returnFocus.focus==='function'&&returnFocus.isConnected)returnFocus.focus();
    };
    content.querySelectorAll('[data-exp160-map-route]').forEach(button=>button.addEventListener('click',()=>{
      const route=button.dataset.exp160MapRoute;close();roadDiscovery.chooseRoadRoute(route);
    }));
    content.querySelectorAll('[data-exp160-map-visit]').forEach(button=>button.addEventListener('click',()=>{
      const nodeId=button.dataset.exp160MapVisit;close();beginOptionalSite(nodeId);
    }));
    document.getElementById('exp150ModalClose')?.addEventListener('click',close,{once:true});
    overlay.onclick=event=>{if(event.target===overlay)close();};
    overlay.onkeydown=event=>{
      if(event.key==='Escape'){event.preventDefault();close();return;}
      // This dialog currently has one action. Keep keyboard focus inside it until
      // additional interactive controls are deliberately added to the modal.
      if(event.key==='Tab'){
        event.preventDefault();
        document.getElementById('exp150ModalClose')?.focus();
      }
    };
  }
  function renderExpedition(note=''){
    const pl=p();if(!pl)return;
    const s=ensure(pl),stage=clamp(Number(s.stage||0),0,5),graph=graphForState(pl,s,stage);
    const sideNode=s.activeSideTripV160?(graph?.nodes||[]).find(node=>node.id===s.activeSideTripV160):null;
    const area=sideNode?{name:sideNode.name,type:sideNode.type,text:sideNode.description}:areaForStage(stage),atCamp=!sideNode&&!!area.camp;
    save(pl);
    const searchDone=!!s.searchUsed?.[stage];
    const guide=window.LegendRoadOpeningV140?.guide?.(pl,s,stage)||'';
    const travelGate=window.LegendRoadOpeningV140?.travelGate?.(pl,s,stage)||{allowed:true};
    const travelLocked=travelGate.allowed===false;
    const openingLesson=pl.flags?.openingRoadV140?.phase==='road'&&!pl.flags.openingRoadV140.completed;
    const discoveryFound=Object.values(s.poiUsed||{}).some(Boolean);
    const searchLocked=openingLesson&&stage===0&&(!s.routeChoice||!discoveryFound);
    const journal=journalFor(pl),discoveryCount=journal.discoveries.length;
    const nextArea=areaForStage(Math.min(5,stage+1));
    const clock=roadTimeOfDay(s.roadClockHour,s.pressure);
    const clockMarkup='<aside class="exp150-road-clock '+clock.period+'" aria-label="Expedition time and road conditions"><span class="exp150-clock-symbol" aria-hidden="true">'+(clock.period==='deep-night'||clock.period==='night'?'☾':clock.period==='dusk'||clock.period==='golden-hour'?'◐':'☼')+'</span><div class="exp150-clock-main"><strong>Day '+Number(pl.day||1)+' · '+esc(clock.timeLabel)+'</strong><span>'+esc(clock.label)+' on the Old Road</span></div><p>'+esc(clock.light)+' '+esc(clock.tension)+'</p></aside>';
    const roadMood=s.pressure>=65?'The mist closes around the road. Something has found your trail.':s.pressure>=40?'The birds have gone quiet. Footsteps pace you somewhere beyond the reeds.':'Rain beads on the old stones. A lantern flickers far beyond the bend.';
    const sceneText=(stage===2&&s.routeChoice&&note)?note+' '+area.text:(note||area.text||roadMood);
    const sceneMarkup=typeof scene==='function'?scene(stage,true):header(pl,s,'OLD ROAD EXPEDITION',area.name,sceneText);
    let choices=sideNode
      ? '<button class="exp150-action" type="button" id="exp160ReturnToRoute"><span class="exp150-action-symbol">↶</span><span><strong>Return to the main path</strong><small>Leave this optional stop and return to '+esc((graph.nodes.find(node=>node.id===s.sideTripReturnNodeIdV160)||{}).name||'the route')+'.</small></span><b>↗</b></button><button class="exp150-action primary" type="button" id="exp160ContinueToCamp"><span class="exp150-action-symbol">➜</span><span><strong>Continue to Wayfarer’s Camp</strong><small>Leave the detour and rejoin the shared road.</small></span><b>→</b></button>'
      : stage>=5
      ? '<button class="exp150-action primary" id="finish" data-legend-scene-transition="Returning to Ashmere"><span class="exp150-action-symbol">↩</span><span><strong>Return to Ashmere</strong><small>Secure what you found and bring the road report home.</small></span><b>→</b></button>'
      : '<button class="exp150-action primary" id="push" data-legend-scene-transition="Onward along the Old Road" '+(travelLocked?'disabled aria-disabled="true"':'')+'><span class="exp150-action-symbol">➜</span><span><strong>'+(travelLocked?'Complete the first road lesson':'Travel On')+'</strong><small>'+(travelLocked?esc(travelGate.message):'Continue toward '+esc(nextArea.name))+'</small></span><b>→</b></button><button class="exp150-action" id="search" '+(searchDone||searchLocked?'disabled aria-disabled="true"':'')+'><span class="exp150-action-symbol">⌕</span><span><strong>'+(searchDone?'Nothing left to search':searchLocked?(!s.routeChoice?'Choose your route first':'Inspect the marker first'):'Search the roadside')+'</strong><small>'+(searchDone?'You have searched this stretch':searchLocked?(!s.routeChoice?'Pick the High Ridge or the Reed Cut at the fork, then look closer at the marker.':'Use “Look closer” in the scene to find a clue.'):'Look for supplies and useful traces')+'</small></span><b>+</b></button><button class="exp150-action" id="careful"><span class="exp150-action-symbol">◉</span><span><strong>Read the Road</strong><small>Study the ground and lower Road Pressure.</small></span><b>↗</b></button>';
    const pressureNote=s.pressure>=65?'The road is closing in. A dangerous encounter may follow.':s.pressure>=40?'Your trail is growing easier to follow. Consider slowing down or finding shelter.':'You have a little room to breathe, but the road never stays quiet for long.';
    const status=Number(pl.hp||0)/maxHpSafe(pl);
    const markup=sceneMarkup+
      '<header class="exp150-expedition-head exp100-head"><div class="exp150-title-group"><span class="exp150-kicker">OLD ROAD · EXPEDITION</span><h1>'+esc(area.name)+'</h1><p class="'+(note?'has-result':'')+'">'+esc(sceneText)+'</p></div><div class="exp150-vitals">'+statusMetric('Health',Number(pl.hp||0)+' / '+Number(pl.maxHp||0),status*100,'health')+statusMetric('Road Pressure',Number(s.pressure||0)+'%',s.pressure,'pressure')+'</div><div class="exp150-utility-actions"><button type="button" id="exp150OpenMap"><span>⌖</span>Road Map</button><button type="button" id="exp150OpenJournal"><span>✧</span>Field Journal <i>'+discoveryCount+'</i></button></div></header>'+clockMarkup+'<div class="exp150-world-page">'+
      trackerMarkup(pl,s,stage)+
      '<div class="exp150-main-grid"><section class="exp150-scene-column">'+
      (guide?'<div class="exp150-guide">'+guide+'</div>':'')+
      '<div class="exp150-interactions">'+(sideNode?optionalSiteMarkup(pl,s,sideNode):roadDiscovery.routeChoicePanel(s,stage)+roadDiscovery.pointOfInterestPanel(pl,s,stage)+roadDiscovery.movedCairnDecisionPanel(pl,s,stage)+optionalDetourCard(pl,s,stage))+'</div>'+
      (atCamp?campActions(pl,s,area):'')+
      '<section class="exp150-action-dock"><div class="exp150-section-heading"><div><span class="exp150-kicker">YOUR NEXT MOVE</span><h2>How will you proceed?</h2></div><span class="exp150-current-mark">STOP '+(stage+1)+' / 6</span></div><div class="exp150-action-list">'+choices+'</div><button class="exp150-abandon" id="town" data-legend-scene-transition="Leaving the expedition" type="button">Leave the expedition and return to Ashmere</button></section></section>'+
      '<aside class="exp150-journey-aside"><section class="exp150-aside-card exp150-next-stop"><span class="exp150-kicker">AHEAD ON THE ROAD</span><h2>'+(stage>=5?'Ashmere':esc(nextArea.name))+'</h2><p>'+(stage>=5?'The trip is complete. Your finds can be secured in town.':'The route can change what you find, how much pressure builds, and what follows you.')+'</p>'+(stage===0?'<div class="exp150-route-reminder"><span>THE FIRST FORK</span><strong>'+(s.routeChoice?(s.routeChoice==='ridge'?'High Ridge chosen':'Reed Cut chosen'):'High Ridge · Reed Cut')+'</strong><small>'+(s.routeChoice?'Your route choice is recorded for this journey.':'Compare a safer ridge path with a riskier trail through the reeds.')+'</small></div>':'')+'</section>'+
      '<section class="exp150-aside-card exp150-pressure-card"><div class="exp150-aside-title"><span class="exp150-kicker">ROAD PRESSURE</span><span>'+Number(s.pressure||0)+'%</span></div><div class="exp150-pressure-track"><i style="width:'+clamp(s.pressure,0,100)+'%"></i></div><p>'+esc(pressureNote)+'</p></section>'+
      '<section class="exp150-aside-card exp150-supplies-card"><span class="exp150-kicker">FIELD SUPPLIES</span><div class="exp150-supply-row"><span>Rations</span><strong>'+Number(pl.inventory?.food||0)+'</strong></div><div class="exp150-supply-row"><span>Camp Supplies</span><strong>'+Number(pl.inventory?.camp||0)+'</strong></div><div class="exp150-supply-row"><span>Road Herbs</span><strong>'+Number(pl.inventory?.roadHerb||0)+'</strong></div><div class="exp150-supply-row"><span>Healing Potions</span><strong>'+Number(pl.inventory?.potion||0)+'</strong></div><p>Resting and crafting use the supplies you carry. Check the waystation when you find one.</p></section>'+
      '<section class="exp150-aside-card exp150-journal-callout"><span class="exp150-kicker">FIELD NOTES</span><h2>'+discoveryCount+' recorded '+(discoveryCount===1?'discovery':'discoveries')+'</h2><p>Important clues travel with you. Open your journal to revisit what you have learned.</p><button type="button" class="exp150-text-action" id="exp150OpenJournalAside">Review field journal →</button></section></aside></div>'+
      '<div class="exp150-modal-layer" id="exp150Modal" hidden tabindex="-1"><section class="exp150-modal-dialog" role="dialog" aria-modal="true" aria-label="Road map or field journal"><div id="exp150ModalContent"></div></section></div></div>';
    shell(markup);
    bindHotspotDelegation();
    document.getElementById('poiLeave')?.addEventListener('click',()=>{const player=p();if(!player)return;const state=ensure(player);state.discoveryOpen=false;state.discoveryStage=null;roadDiscovery.hide();save(player);document.querySelector('.exp150-interactions .exp100-discovery-beat')?.remove();});
    document.getElementById('poiInspect')?.addEventListener('click',roadDiscovery.inspectPointOfInterest);
    document.getElementById('exp160VisitOptional')?.addEventListener('click',button=>beginOptionalSite(button.currentTarget.dataset.node));
    document.getElementById('exp160ReturnToRoute')?.addEventListener('click',leaveOptionalSite);
    document.getElementById('exp160ContinueToCamp')?.addEventListener('click',()=>resolveChoice('push'));
    if(sideNode)wireOptionalSiteActions(pl,s,sideNode);
    document.querySelectorAll('[data-moved-cairn]').forEach(button=>button.addEventListener('click',()=>roadDiscovery.chooseMovedCairnDecision(button.dataset.movedCairn)));
    document.getElementById('routeRidge')?.addEventListener('click',()=>roadDiscovery.chooseRoadRoute('ridge'));
    document.getElementById('routeReeds')?.addEventListener('click',()=>roadDiscovery.chooseRoadRoute('reeds'));
    document.getElementById('careful')?.addEventListener('click',()=>resolveChoice('careful'));
    document.getElementById('search')?.addEventListener('click',()=>resolveChoice('search'));
    document.getElementById('push')?.addEventListener('click',()=>resolveChoice('push'));
    document.getElementById('finish')?.addEventListener('click',finish);
    document.getElementById('exp150OpenMap')?.addEventListener('click',()=>openPanel('map'));
    document.getElementById('exp150OpenJournal')?.addEventListener('click',()=>openPanel('journal'));
    document.getElementById('exp150OpenJournalAside')?.addEventListener('click',()=>openPanel('journal'));

    document.getElementById('town').onclick=()=>{const player=p();if(player?.flags?.openingRoadV140?.phase==='road'&&!player.flags.openingRoadV140.completed)window.LegendRoadOpeningV140?.complete?.(player,'abandoned');ret();};
    document.getElementById('campRest')?.addEventListener('click',()=>{
      const player=p();if(!player)return;const state=ensure(player);
      // One rest per stop: resting used to be repeatable, so a traveler at full
      // health could burn supplies and skip days with no healing at all.
      const stageKey=String(clamp(Number(state.stage||0),0,5));
      state.campRestUsed=state.campRestUsed||{};
      if(state.campRestUsed[stageKey])return renderExpedition('You have already rested at this waystation.');
      if(Number(player.inventory?.camp||0)<1&&Number(player.inventory?.food||0)<1)return renderExpedition('You need a Camp Supply or a Ration to rest here.');
      const supply=Number(player.inventory?.camp||0)>0?'camp':'food';
      const pressureBefore=clamp(Number(state.pressure||0),0,100);
      player.inventory[supply]=Math.max(0,Number(player.inventory?.[supply]||0)-1);
      const healed=Math.min(Math.max(0,Number(player.maxHp||1)-Number(player.hp||1)),Math.max(1,Math.ceil(Number(player.maxHp||1)*.2)));
      player.hp=Number(player.hp||0)+healed;player.fatigue=Math.max(0,Number(player.fatigue||0)-20);
      state.pressure=clamp(state.pressure-12,0,100);player.day=Number(player.day||1)+1;state.roadClockHour=6;
      state.campRestUsed[stageKey]=true;
      player.stats=player.stats||{};player.stats.campsMade=Number(player.stats.campsMade||0)+1;
      const routeName=state.routeChoice==='ridge'?'High Ridge':state.routeChoice==='reeds'?'Reed Cut':'Unchosen route';
      // Record the rest so the field journal and the return report reflect it.
      journalFor(player).campReports.push({kind:'rest',trip:Number(state.trips||0),place:String(area.name||'Waystation'),routeName,pressureBefore,pressureAfter:state.pressure,day:Number(player.day||1),note:healed>0?'You rested by the fire and recovered '+healed+' health.':'You rested by the fire. You were already at full health, but the road grew quieter.'});
      save(player);
      renderExpedition(healed>0
        ?'You rest at '+area.name+', recover '+healed+' health, and let the road quiet down. Road Pressure falls by '+(pressureBefore-state.pressure)+'.'
        :'You rest at '+area.name+'. You were already at full health, but the road quiets down. Road Pressure falls by '+(pressureBefore-state.pressure)+'.');
    });
    document.getElementById('campCraft')?.addEventListener('click',()=>{
      const player=p();if(!player)return;
      if(Number(player.inventory?.roadHerb||0)<1||Number(player.inventory?.clothScrap||0)<1)return;
      const state=ensure(player);
      const pressure=clamp(Number(state.pressure||0),0,100);
      const routeName=state.routeChoice==='ridge'?'High Ridge':state.routeChoice==='reeds'?'Reed Cut':'Unchosen route';
      player.inventory.roadHerb--;player.inventory.clothScrap--;inv(player,'potion',1);
      journalFor(player).campReports.push({
        kind:'craft',trip:Number(state.trips||0),place:String(area.name||'Waystation'),routeName,
        pressureBefore:pressure,pressureAfter:pressure,day:Number(player.day||1),
        note:'You crafted a Road Poultice from 1 Road Herb and 1 Cloth Scrap. One healing potion was added to your pack.'
      });
      save(player);
      renderExpedition('You bind a Road Herb into clean cloth and make a healing potion. The choice is recorded in your field report.');
    });
    document.getElementById('campWatch')?.addEventListener('click',()=>{
      const player=p();if(!player)return;
      const state=ensure(player),stageKey=String(clamp(Number(state.stage||0),0,5));
      state.campWatchUsed=state.campWatchUsed||{};
      if(state.campWatchUsed[stageKey])return renderExpedition('You have already kept watch at this waystation.');
      if(Number(player.inventory?.food||0)<1)return renderExpedition('You need one ration to keep watch through the night.');
      const pressureBefore=clamp(Number(state.pressure||0),0,100);
      const pressureAfter=clamp(pressureBefore-18,0,100);
      player.inventory.food=Math.max(0,Number(player.inventory.food||0)-1);
      state.pressure=pressureAfter;state.roadClockHour=6;
      state.campWatchUsed[stageKey]=true;
      player.day=Number(player.day||1)+1;
      player.stats=player.stats||{};
      player.stats.roadWatchesKept=Number(player.stats.roadWatchesKept||0)+1;
      const routeName=state.routeChoice==='ridge'?'High Ridge':state.routeChoice==='reeds'?'Reed Cut':'Unchosen route';
      const watchNote=state.routeChoice==='reeds'
        ?'Water shifts in the reeds whenever the fire gutters. You never see what makes the ripples; by dawn, the trail has gone still.'
        :state.routeChoice==='ridge'
          ?'A sound like loose stone travels along the ridge. You mark the dry line and keep the fire low until dawn.'
          :'Rain taps the shelter roof. Near dawn, footsteps pause beyond the firelight, then fade back toward the road.';
      const journal=journalFor(player);
      journal.campReports.push({kind:'watch',trip:Number(state.trips||0),place:String(area.name||'Waystation'),routeName,pressureBefore,pressureAfter,day:Number(player.day||1),note:watchNote});
      save(player);
      renderExpedition('You keep watch at '+area.name+'. One ration is gone; the darkness offers no clear answer, but you notice the trail settling. Road Pressure falls by 18.');
    });
  }
  function roadTimeOfDay(hour,pressure){
    const clock=Math.max(0,Math.min(23,Math.floor(Number(hour??15))));
    const period=clock<5?'deep-night':clock<7?'dawn':clock<11?'morning':clock<15?'afternoon':clock<18?'golden-hour':clock<21?'dusk':'night';
    const label=clock<5?'Deep Night':clock<7?'First Light':clock<11?'Morning':clock<15?'Afternoon':clock<18?'Last Daylight':clock<21?'Dusk':'Night';
    const light=clock<5?'The lanterns are the only reliable points of light.':clock<7?'A thin line of dawn touches the highest stones.':clock<11?'The road is visible again, though the mist has not lifted.':clock<15?'Pale daylight reaches the old road in broken patches.':clock<18?'Long shadows stretch across the road ahead.':clock<21?'The last daylight drains from the low ground.':'The dark has settled; movement beyond the lanternlight is hard to read.';
    const tension=Number(pressure||0)>=65?'Every sound travels too far. Something may be following close behind.':Number(pressure||0)>=40?'A second set of footsteps seems to keep pace just beyond sight.':'For now, you can hear your own footsteps and the weather.';
    return {hour:clock,period,label,timeLabel:(clock%12||12)+':00 '+(clock<12?'AM':'PM'),light,tension};
  }
  function maxHpSafe(pl){return Math.max(1,Number(pl.maxHp||1));}
  return Object.freeze({render:renderExpedition});
 }
 window.LegendRoadExpeditionScreenV100=Object.freeze({create});
})();