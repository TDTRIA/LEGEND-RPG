// LEGEND v0.11.0 - Regional World & Travel Controller
(() => {
  const RT=()=>window.LegendRuntimeV080||{};
  const D=()=>window.LEGEND_DATA||{};
  const root=()=>document.getElementById('root');
  const p=()=>RT().loadPlayer?.()||null;
  const save=pl=>RT().savePlayer?.(pl);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const regions=()=>D().regions||{};
  const gold=n=>Number(n||0)+'g';
  const tokens=pl=>Number(pl?.inventory?.roadToken||0);
  const iconMap={map:'M4 5h16v14H4zM8 9h3v3H8zm5 0h3v3h-3zm-5 5h3v2H8zm5 0h3v2h-3z',home:'M3 11l9-7 9 7v9H3zM9 20v-6h6v6',road:'M4 21c4-5 4-13 8-18m8 18c-4-5-4-13-8-18M8 12h8',lock:'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z',coin:'M12 4c5 0 8 2 8 4s-3 4-8 4-8-2-8-4 3-4 8-4Zm-8 4v4c0 2 3 4 8 4s8-2 8-4V8',back:'M19 12H5m7-7-7 7 7 7'};
  const icon=k=>'<span class="world101-icon"><svg viewBox="0 0 24 24"><path d="'+(iconMap[k]||iconMap.map)+'"/></svg></span>';
  function shell(body){root().innerHTML='<main class="world101"><div class="world101-wrap">'+body+'</div></main>';}
  function normalize(pl){pl.unlockedRegions=Array.isArray(pl.unlockedRegions)&&pl.unlockedRegions.length?pl.unlockedRegions:['Ashmere'];pl.currentRegion=pl.currentRegion||'Ashmere';return pl;}
  function ordered(){return Object.values(regions());}
  function travel(id){
    const pl=normalize(p()); if(!pl)return;
    const r=regions()[id]; if(!r)return renderMap('That road is not on the map yet.');
    const unlocked=pl.unlockedRegions.includes(id);
    if(!unlocked)return unlock(id);
    const cost=Number(r.travelCost||0);
    if(pl.currentRegion===id)return renderRegion(id);
    if(Number(pl.gold||0)<cost)return renderMap('You need '+gold(cost)+' to travel to '+r.name+'.');
    pl.gold-=cost;pl.currentRegion=id;pl.regionTravelCount=Number(pl.regionTravelCount||0)+1;save(pl);
    renderRegion(id,'You travel for '+gold(cost)+' and arrive in '+r.name+'.');
  }
  function unlock(id){
    const pl=normalize(p()),r=regions()[id];if(!pl||!r)return;
    const need=Number(r.tokenCost||0),have=tokens(pl);
    if(have<need)return renderMap('You need '+need+' Road Tokens to open '+r.name+'. You have '+have+'.');
    pl.inventory.roadToken=have-need;pl.unlockedRegions.push(id);pl.discoveredRoutes=pl.discoveredRoutes||['Old Road'];pl.discoveredRoutes.push(r.name);save(pl);
    renderMap(r.name+' is now part of your travel network. The road is open.');
  }
  function renderMap(note=''){
    const pl=normalize(p());if(!pl)return;
    const list=ordered().map(r=>{
      const open=pl.unlockedRegions.includes(r.id),current=pl.currentRegion===r.id,need=Number(r.tokenCost||0),cost=Number(r.travelCost||0);
      let action=current?'You are here':open?'Travel for '+gold(cost):'Open with '+need+' Tokens';
      return '<article class="world101-card '+(current?'current ':'')+(open?'open':'locked')+'">'+icon(open?'road':'lock')+'<div class="world101-card-copy"><span>'+esc(open?'REGION OPEN':'LOCKED REGION')+'</span><h2>'+esc(r.name)+'</h2><h3>'+esc(r.subtitle||'')+'</h3><p>'+esc(r.description||'')+'</p></div><button class="world101-action '+(current?'muted':'')+'" data-world-id="'+esc(r.id)+'">'+esc(action)+'</button></article>';
    }).join('');
    shell('<section class="world101-head"><div class="world101-kicker">WORLD MAP</div><h1>The Roads Beyond Ashmere</h1><p>Road Tokens open new regions. Gold pays for travel between regions you have already opened.</p><div class="world101-status"><div>'+icon('home')+'<span>Current Region</span><strong>'+esc(pl.currentRegion)+'</strong></div><div>'+icon('map')+'<span>Regions Open</span><strong>'+pl.unlockedRegions.length+'/'+ordered().length+'</strong></div><div>'+icon('road')+'<span>Road Tokens</span><strong>'+tokens(pl)+'</strong></div><div>'+icon('coin')+'<span>Gold</span><strong>'+gold(pl.gold)+'</strong></div></div></section><section class="world101-note" '+(note?'':'hidden')+'>'+esc(note)+'</section><section class="world101-list">'+list+'</section><section class="world101-actions"><button class="world101-back" id="town">'+icon('back')+' Ashmere</button></section>');
    document.querySelectorAll('[data-world-id]').forEach(b=>b.onclick=()=>travel(b.dataset.worldId));
    document.getElementById('town').onclick=()=>{if(window.LegendAshmereV099?.renderAshmere)return window.LegendAshmereV099.renderAshmere();renderRegion('Ashmere');};
  }
  function renderRegion(id,note=''){
    const pl=normalize(p()),r=regions()[id]||regions().Ashmere;if(!pl||!r)return;
    shell('<section class="world101-region"><div class="world101-kicker">REGION</div><h1>'+esc(r.name)+'</h1><h2>'+esc(r.subtitle||'')+'</h2><p>'+esc(r.description||'')+'</p>'+(note?'<div class="world101-note">'+esc(note)+'</div>':'')+'<div class="world101-region-state"><strong>Travel network connected.</strong><span>Local exploration content will grow from this region as its road, gathering, enemies, crafting materials, and story are added.</span></div><div class="world101-region-actions"><button class="world101-primary" id="explore">'+icon('road')+' Explore local routes</button><button class="world101-back" id="map">'+icon('map')+' Open World Map</button></div></section>');
    document.getElementById('map').onclick=()=>renderMap();
    document.getElementById('explore').onclick=()=>{if(id==='Ashmere')return window.LegendAshmereV099?.renderAshmere?.();renderRegion(id,'The frontier is open, but its local expedition is the next layer we are building.');};
  }
  function renderCurrent(){const pl=p();if(!pl)return;renderRegion(pl.currentRegion||'Ashmere');}
  window.LegendWorldV101={renderMap,renderRegion,renderCurrent,travel,unlock};
})();