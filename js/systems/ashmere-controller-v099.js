// LEGEND v0.9.x - Ashmere Town Hub Controller
// Owns Ashmere directly: RPG town terminal, direct routes, no title reload for town returns.
(() => {
  const RT = () => window.LegendRuntimeV080 || {};
  const A = () => window.LegendAssetsV090 || {};
  const D = () => window.LEGEND_DATA || {};
  const root = () => document.getElementById('root');
  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  const p = () => RT().loadPlayer?.() || null;
  const save = pl => RT().savePlayer?.(pl);
  const img = (path, alt = '') => path ? `<img src="${esc(path)}" alt="${esc(alt)}" onerror="if(this.src.startsWith('https://')){this.onerror=null;this.src='assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg'}else{this.style.display='none'}">` : '';
  const itemIcon = key => {
    const items=A().items||{};
    const aliases={
      food:'food',ration:'rationBundle',rationBundle:'rationBundle',potion:'potion',roadPoultice:'potion',blackrootTonic:'potion',
      roadToken:'roadToken',bellFragment:'bellFragment',camp:'camp',campSupply:'camp',roadHerb:'roadHerb',huntersCharm:'bellFragment',wispLanternWick:'camp',
      woodenSword:'shortSword',stoneSword:'shortSword',bronzeSword:'shortSword',ironSword:'shortSword',steelSword:'shortSword',shortSword:'shortSword',bow:'bow',huntingBow:'bow',shield:'shield',
      none:'shield',clothArmor:'shield',chainArmor:'shield',bronzeArmor:'shield',ironArmor:'shield',woodScrap:'camp',peatBrick:'camp',clothScrap:'camp',wolfFang:'shortSword',tornHide:'shield',ore:'shield',wispAsh:'bellFragment',oil:'camp',goblinTrinket:'roadToken',blackrootThorn:'roadHerb',tradeBundle:'camp'
    };
    return items[aliases[key]||key]||items.pelt||'';
  };
  const itemName = k => D().itemNames?.[k] || ({
    food:'Rations', potion:'Healing Potion', camp:'Camp Supplies', roadToken:'Road Token',
    woodScrap:'Wood Scrap', clothScrap:'Cloth Scrap', roadHerb:'Road Herb', wolfFang:'Wolf Fang',
    tornHide:'Torn Hide', ore:'Ore', wispAsh:'Wisp Ash', oil:'Lamp Oil', goblinTrinket:'Goblin Trinket',
    blackrootThorn:'Blackroot Thorn', brokenBellShard:'Broken Bell Shard', roadPoultice:'Road Poultice',
    blackrootTonic:'Blackroot Tonic', huntersCharm:'Hunter\'s Charm', reinforcedBuckle:'Reinforced Buckle',
    wispLanternWick:'Wisp Lantern Wick', tradeBundle:'Trade Bundle'
  }[k] || k);
  const gold = n => `${Number(n || 0)}g`;
  const bg = () => {
    const pl=p(), locations=A().locations||{};
    if(String(pl?.currentRegion||'Ashmere')==='Greyfen') return locations.greyfenMain || locations.ashmereMain || 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg';
    return locations.ashmereMain || 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg';
  };
  const locationInterior = kind => {
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen', locations=A().locations||{};
    const key=greyfen?({inn:'greyfenInn',market:'greyfenMarket',forge:'greyfenForge',archive:'greyfenArchive'}[kind]):({inn:'ashmereInn',market:'ashmereMarket',forge:'ashmereForge',archive:'ashmereArchive'}[kind]);
    return locations[key] || bg();
  };
  const roadBg = () => A().locations?.oldRoad || 'assets/locations/roads/location_old_road_main_v1.jpg';
  const npc = id => id==='oric' ? 'assets/npcs/ashmere/npc_oric_portrait_v2.svg' : (A().npcs?.[id] || '');
  const weaponName = id => (D().weapons || []).find(w => w.id === id)?.name || id || 'Hands';
  const armorName = id => (D().armors || []).find(a => a.id === id)?.name || id || 'None';

  const icon = (k, alt='') => {
    const symbol = {"people":"people","inn":"inn","trader":"trader","smith":"smith","road":"road","sheet":"sheet","brenn":"ledger","archive":"archive","mara":"quill","oric":"captain","work":"work","craft":"craft","profile":"profile","quest":"quest","route":"route","regions":"regions","settings":"settings","gate":"gate","world":"world","notice":"notice","cloud":"cloud","account":"profile","feedback":"quest","delete":"quest","text":"ledger","bold":"sheet","contrast":"settings","motion":"road","space":"regions","font":"sheet","lock":"captain","slot":"regions","continue":"road","new":"work"}[k] || 'quest';
    return `<span class="ash099-icon" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><use href="assets/ui/icons/legend-ui-icons-v1.svg#icon-${symbol}"></use></svg></span>`;
  };
  const AUDIO_CUE = { hover:'assets/audio/ui/ui_hover_soft.wav', confirm:'assets/audio/ui/ui_confirm_gate.wav' };
  let lastHoverCue = 0;
  function playUiCue(kind){ try { const audio = new Audio(AUDIO_CUE[kind]); audio.volume = kind==='hover' ? 0.10 : 0.18; audio.play().catch(()=>{}); } catch {} }
  function bindUiAudio(){
    const host=root(); if(!host)return;
    host.querySelectorAll('button, a.btn, a.portal-secondary-btn').forEach(el=>{
      if(el.dataset.legendAudioBound)return;
      el.dataset.legendAudioBound='1';
      el.addEventListener('pointerenter',()=>{const now=Date.now();if(now-lastHoverCue>110){lastHoverCue=now;playUiCue('hover');}});
      el.addEventListener('click',()=>playUiCue('confirm'));
    });
  }
  function shell(html){ root().innerHTML = `<main class="ash099 ash099-terminal"><div class="ash099-wrap">${html}</div></main>`; bindUiAudio(); }
  function stat(label, value){ return `<div class="ash099-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`; }
  function hpPct(pl){ return Math.max(0, Math.min(100, Math.round((Number(pl.hp || 0) / Math.max(1, Number(pl.maxHp || 1))) * 100))); }
  function owned(pl, k){ return Number(pl.inventory?.[k] || 0); }
  function canAfford(pl, cost){ return Number(pl.gold || 0) >= Number(cost || 0); }
  function canCraft(pl, needs){ return needs.every(([k,v]) => owned(pl,k) >= Number(v || 0)); }
  function needsText(pl, needs){ return needs.map(([k,v]) => `${v} ${itemName(k)} (${owned(pl,k)})`).join(', '); }
  function note(msg){ const n = document.getElementById('ashNote'); if(n){ n.style.display='block'; n.textContent=msg; } }

  function goal(pl){
    const t = Number(pl?.inventory?.roadToken || 0);
    if(String(pl?.currentRegion||'Ashmere')==='Greyfen'){
      if(!pl?.flags?.greyfenDryCrossingComplete) return { view:'crossing', title:'Recover the Washed Marker', text:'The Landing Warden needs the route marker before travelers can trust the raised causeway again. Choose the safer posts or risk the reed-bed shortcut.', cta:'Take A Dry Crossing', icon:'route', tasks:['Choose a route with disclosed risks','Recover the marker','Record the crossing in the Boundary Archive'] };
      return { view:'people', title:'Learn Greyfen’s Old Marks', text:'The lowland town sits on drowned foundations. Ask the road-worn keepers what they know, trade what the marsh has yielded, and prepare before following the next marker.', cta:'Meet the Town’s Keepers', icon:'people', tasks:['Ask about the boundary stones','Trade or prepare supplies','Return to Ashmere when ready'] };
    }
    if(!pl?.flags?.talkedToMara) return { view:'people', title:'Report to the Square', text:'Ashmere does not trust strangers from the road. Speak with Mara, Brenn, and Oric before crossing the lantern line.', cta:'Enter Town Square', icon:'people', tasks:['Meet Mara Vell','Speak with Old Brenn','Hear Oric\'s warning'] };
    if(!pl.flags.firstRoadEvent) return { view:'inn', title:'Prepare Before the Gate', text:'Rest, gather supplies, check gear, or take a small town job before your first Old Road expedition.', cta:'Prepare in Town', icon:'inn', tasks:['Visit the Work Board','Check gear at the Blacksmith','Rest at the Inn'] };
    if(t < 5) return { view:'road', title:'Open the First Region', text:`You have ${t}/5 Road Tokens. Explore the Old Road, bring back proof, and use the tokens to open Greyfen.`, cta:'Leave Through the Gate', icon:'road', tasks:[`${t}/5 Road Tokens collected`,'Return alive','Open Greyfen on the world map'] };
    return { view:'regions', title:'Open the Regional Ledger', text:'You have enough Road Tokens to begin opening the world beyond Ashmere. Spend them on a region, then pay gold to travel between places you know.', cta:'View the Road Network', icon:'regions', tasks:['Spend Road Tokens to unlock a region','Pay gold to travel','Return to Ashmere whenever you need'] };
  }

  function actionCard(view, title, desc, label = 'Open', featured = false, ic = view){
    return `<button class="ash099-btn ash099-action ${featured ? 'featured' : ''}" data-ash-view="${esc(view)}">${icon(ic)}<span><strong>${esc(title)}</strong><small>${esc(desc)}</small></span><em>${esc(label)}</em></button>`;
  }
  function actionGroup(title, text, body, kind = ''){
    return `<section class="ash099-action-group ${kind}"><header><h3>${esc(title)}</h3><p>${esc(text)}</p></header><div class="ash099-group-grid">${body}</div></section>`;
  }
  function miniMeter(pl){ return `<div class="ash099-meter"><span>Health</span><strong>${Number(pl.hp || 0)}/${Number(pl.maxHp || 0)}</strong><i style="width:${hpPct(pl)}%"></i></div>`; }
  function currentRouteCard(g){
    return `<aside class="ash100-route-strip"><span class="ash100-route-strip-icon">${icon('route')}</span><div class="ash100-route-strip-copy"><span>Current Route</span><strong>${esc(g.title)}</strong><small>${esc(g.text)}</small></div><button class="ash099-btn primary" data-ash-view="${esc(g.view)}">${esc(g.cta)}</button></aside>`;
  }
  function travelerTerminal(pl){
    const name = pl.username || 'Traveler';
    return `<aside class="ash099-panel ash099-traveler-panel ash099-terminal-card"><h3>Traveler Terminal</h3><div class="ash099-traveler-identity"><div class="ash099-avatar"><span>${esc(String(name).slice(0,1)).toUpperCase()}</span></div><div><strong>${esc(name)}</strong><small>${esc(pl.className || 'Wanderer')}</small></div></div>${miniMeter(pl)}<div class="ash099-stats">${stat('Class', pl.className || 'Wanderer')}${stat('Level', Number(pl.level||1))}${stat('XP', `${Number(pl.xp||0)}/${Number(pl.level||1)*100}`)}${stat('Gold', gold(pl.gold))}${stat('Road Tokens', `${Number(pl.inventory?.roadToken || 0)}/5`)}${stat('Weapon', weaponName(pl.weapon))}${stat('Armor', armorName(pl.armor))}${stat('Jobs Done', Number(pl.flags?.ashmereJobs || 0))}</div><p class="ash099-trait"><strong>Origin & Nature</strong><br>${esc(pl.personalityLabel || 'Unknown traveler')} • ${esc(pl.origin || 'Unknown origin')}</p></aside>`;
  }
  function terminalNav(){
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen',townLabel=greyfen?'Greyfen':'Town';
    const ariaLabel=greyfen?'Greyfen town navigation':'Ashmere terminal navigation';
    return `<nav class="ash099-footer ash099-topnav" aria-label="${ariaLabel}"><button class="ash099-footer-item active" data-ash-view="home">${icon('inn')}<span>${townLabel}</span></button><button class="ash099-footer-item" data-ash-view="people">${icon('people')}<span>People</span></button><button class="ash099-footer-item" data-ash-view="routes">${icon('road')}<span>Routes</span></button><button class="ash099-footer-item" data-ash-view="archive">${icon('archive')}<span>Journal</span></button><button class="ash099-footer-item" data-ash-view="profile">${icon('profile')}<span>Profile</span></button><button class="ash099-footer-item" data-ash-view="sheet">${icon('sheet')}<span>Traveler</span></button></nav>`;
  }

  function renderAshmere(){
    const pl=p(); if(!pl) return;
    const g=goal(pl);
    const isGreyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
    const townName=isGreyfen?'Greyfen':'Ashmere';
    const tokenCount=Number(pl.inventory?.roadToken||0);
    const health=Math.max(0,Math.min(100,Math.round(Number(pl.hp||0)/Math.max(1,Number(pl.maxHp||1))*100)));
    const townCard=(view,title,desc,cta,ic,featured=false)=>`<button class="ash100-destination ${featured?'featured':''}" data-ash-view="${esc(view)}"><span class="ash100-destination-icon">${icon(ic)}</span><span class="ash100-destination-copy"><strong>${esc(title)}</strong><small>${esc(desc)}</small></span><em>${esc(cta)}</em></button>`;
    const destinations=isGreyfen?[
      townCard('inn','Reedlight Inn','Rest, recover, and hear what the lowland travelers whisper.','Rest & prepare','inn',g.view==='inn'),
      townCard('trader','Marsh Market','Trade road loot for rations, medicine, and useful supplies.','Trade','trader',false),
      townCard('smith','Causeway Smithy','Equip better gear and turn gathered materials into useful things.','Gear & craft','smith',false),
      townCard('people','Town Square','Meet the keepers and travelers who know the drowned roads.','Meet the town','people',g.view==='people'),
      townCard('crossing','A Dry Crossing',pl.flags?.greyfenDryCrossingComplete?'The washed route marker is recovered and recorded.':'Recover a washed route marker. Choose the raised posts or risk the reed bed. ',pl.flags?.greyfenDryCrossingComplete?'Review contract':'Take contract','route',g.view==='crossing'),
      townCard('work','Bellkeeper’s Hall','Take practical work while learning the rhythms of Greyfen.','Find work','work',g.view==='work'),
      townCard('regions','Road Network','Return to Ashmere or travel between lands you have unlocked.','Travel','regions',g.view==='regions')
    ].join(''):[
      townCard('inn','Ashmere Inn','Rest, recover, buy supplies, and hear what travelers are saying.','Rest & prepare','inn',g.view==='inn'),
      townCard('trader','Market','Buy essentials, sell road loot, and turn discoveries into gold.','Trade','trader',false),
      townCard('smith','Forge & Workshop','Upgrade weapons and armor, then use the crafting bench for road finds.','Gear & craft','smith',false),
      townCard('people','Town Square','Talk with Mara Vell, Old Brenn, and Captain Oric. Hear warnings and follow local stories.','Meet the town','people',g.view==='people'||g.view==='mara'||g.view==='brenn'||g.view==='oric'),
      townCard('work','Work Board','Take paid jobs, test your timing, and earn gold plus useful supplies.','Browse jobs','work',g.view==='work'),
      townCard('road','Old Road Gate','Begin the expedition; find clues, face danger, and bring proof home.','Begin expedition','road',g.view==='road'),
      townCard('regions','Road Network','Unlock new regions with Road Tokens, then travel between places you know for gold.','Open map','regions',g.view==='regions')
    ].join('');
    shell(`
      <section class="ash100-town ${isGreyfen?'ash100-town-greyfen':'ash100-town-ashmere'}">
        <div class="ash100-hero">${img(bg(),townName+' at dusk')}<div class="ash100-hero-copy"><div class="ash099-kicker">${isGreyfen?'THE LOWLANDS · GREYFEN':'ROADS OF ASHMERE'}</div><h1>${townName}</h1><p>${isGreyfen?'Built on drowned stone, held together by lanterns, and full of old boundary marks.':'Warm lights. Open roads. A place to return to.'}</p></div></div>
        <div class="ash100-route-dock">${currentRouteCard(g)}</div>
        <section class="ash100-status" aria-label="Traveler status">
          <div class="ash100-status-traveler"><span>${esc(pl.username||'Traveler')}</span><small>${esc(pl.className||'Wanderer')} · Day ${Number(pl.day||1)}</small></div>
          <div class="ash100-status-health"><span>Health</span><strong>${Number(pl.hp||0)} / ${Number(pl.maxHp||0)}</strong><i><b style="width:${health}%"></b></i></div>
          <div class="ash100-status-resources"><span>${tokenCount} Road Tokens</span><small>${gold(pl.gold)} · ${townName}${tokenCount>=5?' · Greyfen open':''}</small></div>
        </section>
        <section class="ash100-destination-section">
          <div class="ash100-section-head"><div><div class="ash099-kicker">${isGreyfen?'LOWLAND DISTRICT':'ASHMERE'}</div><h2>${isGreyfen?'Find your footing':'Where next?'}</h2></div></div>
          <div class="ash100-destinations">${destinations}</div>
        </section>
        ${terminalNav()}
      </section>`);
    bind();
  }
  function bind(){ document.querySelectorAll('[data-ash-view]').forEach(b => b.onclick = () => route(b.dataset.ashView)); }
  function route(v){
    if(v === 'home') return renderAshmere();
    if(v === 'people') return renderPeople();
    if(v === 'mara' || v === 'brenn' || v === 'oric') return renderNPC(v);
    if(v === 'inn') return renderInn();
    if(v === 'trader') return renderTrader();
    if(v === 'smith') return renderSmith();
    if(v === 'work') return renderWorkBoard();
    if(v === 'crossing') return renderDryCrossing();
    if(v === 'craft') return renderCrafting();
    if(v === 'sheet') return renderSheet();
    if(v === 'archive') return renderArchive();
    if(v === 'profile') {
      if(window.LegendAccountV09x?.renderAccount) return window.LegendAccountV09x.renderAccount();
      return renderAshmere();
    }
    if(v === 'routes') return renderRoutes();
    if(v === 'quests') return renderSideContracts();
    if(v === 'road') return startRoad();
    if(v === 'regions') {
      if(window.LegendRegionsV100?.render) return window.LegendRegionsV100.render();
      return renderAshmere();
    }
    return renderAshmere();
  }
  function back(extra = ''){ const region=String(p()?.currentRegion||'Ashmere'); const label=region==='Greyfen'?'Back to Greyfen':'Back to Ashmere'; return `<div class="ash099-bottom">${extra}<button class="ash099-btn primary" id="ashBack">${label}</button></div>`; }
  function head(k,t,d,im='',fallbackIcon='quest'){ return `<div class="ash099-head ${im ? 'has-art' : 'no-art'}">${im ? img(im,t) : `<div class="ash099-head-icon">${icon(fallbackIcon)}</div>`}<div><div class="ash099-kicker">${esc(k)}</div><h1>${esc(t)}</h1><p>${esc(d)}</p></div></div>`; }
  function screen(h,b,extra=''){ shell(`<section class="ash099-screen">${h}${b}${back(extra)}</section>`); document.getElementById('ashBack').onclick = renderAshmere; bind(); }

  function renderRoutes(){
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen';
    if(greyfen){
      screen(head('Causeway Board','Lowland Crossings','The Old Road begins in Ashmere. From Greyfen, choose a known route, check local records, or learn which crossings remain safe.',locationInterior('archive'),'route'),`
        <div class="ash099-cards">
          <button class="ash099-btn ash099-card" data-ash-view="regions">${icon('regions')}<strong>Road Network</strong><small>Pay the fare to return to Ashmere or travel onward to lands already opened.</small><em>Open map</em></button>
          <button class="ash099-btn ash099-card" data-ash-view="people">${icon('people')}<strong>Ask the Keepers</strong><small>Compare the old boundary marks and hear the latest causeway warnings.</small><em>Visit the hall</em></button>
          <button class="ash099-btn ash099-card" data-ash-view="quests">${icon('quest')}<strong>Side Stories & Contracts</strong><small>Take keeper requests that reward exploration, victories, and a safe return.</small><em>Read postings</em></button>
        </div>`);
      return;
    }
    screen(head('Route Board','Routes & Expeditions','Choose your next destination. Open the regional network to unlock new lands, or enter the Old Road to search, fight, and bring proof home.',bg(),'route'),`
      <div class="ash099-cards">
        <button class="ash099-btn ash099-card" data-ash-view="road">${icon('road')}<strong>The Old Road</strong><small>Start a five-stage expedition with encounters, finds, and a safe return path.</small><em>Begin expedition</em></button>
        <button class="ash099-btn ash099-card" data-ash-view="regions">${icon('regions')}<strong>Road Network</strong><small>View known regions, spend Road Tokens to unlock new lands, and travel between places.</small><em>Open map</em></button>
        <button class="ash099-btn ash099-card" data-ash-view="quests">${icon('quest')}<strong>Side Stories & Contracts</strong><small>Follow local stories that ask you to scout, survive a fight, or bring an expedition home.</small><em>Read postings</em></button>
      </div>`);
  }

  const sideContracts=[
    {id:'watchlightSurvey',title:'The Watchlight Survey',giver:'Captain Oric',description:'The watch captain needs fresh proof of what lies beyond the lantern line. Find one roadside point of interest after accepting this contract.',objective:'Investigate one new roadside discovery on the Old Road.',counter:'poi',gold:55,xp:25,item:'food',amount:1,completeText:'Oric studies your notes and marks a safer stretch of the lantern line.'},
    {id:'blackrootProof',title:'Proof from the Blackroot Road',giver:'Old Brenn',description:'Brenn will pay for proof that you can handle the dangers beyond Ashmere. Win a road battle after taking the posting.',objective:'Win one road battle after accepting this contract.',counter:'battle',gold:75,xp:35,item:'clothScrap',amount:1,completeText:'Brenn accepts your proof without asking how close the fight came.'},
    {id:'maraSafeReturn',title:'Mara’s Missing Road Ledger',giver:'Mara Vell',description:'Mara needs a complete field report, not another half-told rumor. Secure a five-stage expedition and return after accepting the posting.',objective:'Complete and secure one five-stage Old Road expedition.',counter:'return',gold:95,xp:50,item:'oil',amount:1,completeText:'Mara copies your route notes into the town archive and rewards the complete report.'}
  ];
  function sideContractCounter(pl,key){
    const stats=pl?.stats||{};
    if(key==='poi')return Number(stats.pointsOfInterest||0);
    if(key==='battle')return Number(stats.roadVictories||0);
    if(key==='return')return Number(stats.oldRoadClears||0);
    return 0;
  }
  function renderSideContracts(message=''){
    const pl=p();if(!pl)return;
    pl.flags=pl.flags||{};
    const saved=pl.flags.sideContracts||{};
    const cards=sideContracts.map(q=>{
      const state=saved[q.id];
      let status='AVAILABLE',action='<button type="button" class="ash099-btn primary" data-contract-accept="'+q.id+'">Accept Contract</button>',progress='Not started';
      if(state?.complete){
        status='COMPLETED';action='<span class="ash099-contract-complete">✓ Recorded in Journal</span>';progress='Reward claimed';
      }else if(state){
        const now=sideContractCounter(pl,q.counter),ready=now>Number(state.startedAt||0);
        progress=ready?'Objective fulfilled · ready to report':'In progress · 0 / 1';
        if(ready){status='READY TO REPORT';action='<button type="button" class="ash099-btn primary" data-contract-turnin="'+q.id+'">Report Completion</button>';}
        else{status='IN PROGRESS';action='<span class="ash099-contract-pending">Return when the objective is complete</span>';}
      }
      return '<article class="ash099-contract-card ash099-contract-'+status.toLowerCase().replaceAll(' ','-')+'"><header><span>'+esc(status)+'</span><small>POSTED BY '+esc(q.giver.toUpperCase())+'</small></header><h2>'+esc(q.title)+'</h2><p>'+esc(q.description)+'</p><div class="ash099-contract-objective"><span>OBJECTIVE</span><strong>'+esc(q.objective)+'</strong><small>'+esc(progress)+'</small></div><footer><div><span>REWARD</span><strong>'+q.gold+'g · '+q.xp+' XP</strong><small>Bonus: '+esc(itemName(q.item))+' ×'+q.amount+'</small></div>'+action+'</footer></article>';
    }).join('');
    const body='<section class="ash099-contract-ledger"><div class="ash099-contract-intro"><span class="ash099-job-overline">LOCAL STORIES · FIELD CONTRACTS</span><h2>Work that takes you beyond the board</h2><p>These one-time requests progress while you explore and fight. Accept a posting before doing the work; completed objectives can be turned in here.</p></div><div class="ash099-contract-list">'+cards+'</div>'+(message?'<p class="ash099-note" role="status">'+esc(message)+'</p>':'')+'</section>';
    screen(head('Journal & Notices','Side Stories & Road Contracts','Three local requests add reasons to investigate the road, win a dangerous encounter, and bring a complete expedition home.',locationInterior('archive'),'quest'),body);
    document.querySelectorAll('[data-contract-accept]').forEach(b=>b.onclick=()=>{
      const q=sideContracts.find(x=>x.id===b.dataset.contractAccept);if(!q)return;
      const player=p();if(!player)return;player.flags=player.flags||{};player.flags.sideContracts=player.flags.sideContracts||{};
      if(player.flags.sideContracts[q.id])return renderSideContracts('That posting is already in your journal.');
      player.flags.sideContracts[q.id]={startedAt:sideContractCounter(player,q.counter),complete:false};
      save(player);renderSideContracts('Accepted: '+q.title+'. '+q.objective);
    });
    document.querySelectorAll('[data-contract-turnin]').forEach(b=>b.onclick=()=>{
      const q=sideContracts.find(x=>x.id===b.dataset.contractTurnin);if(!q)return;
      const player=p();if(!player)return;player.flags=player.flags||{};player.flags.sideContracts=player.flags.sideContracts||{};
      const state=player.flags.sideContracts[q.id];
      if(!state||state.complete||sideContractCounter(player,q.counter)<=Number(state.startedAt||0))return renderSideContracts('The objective is not ready to turn in yet.');
      state.complete=true;player.gold=Number(player.gold||0)+q.gold;player.inventory=player.inventory||{};player.inventory[q.item]=Number(player.inventory[q.item]||0)+q.amount;
      player.flags.ashmereFavor=Number(player.flags.ashmereFavor||0)+2;player.stats=player.stats||{};player.stats.sideContractsCompleted=Number(player.stats.sideContractsCompleted||0)+1;
      player.memories=player.memories||[];player.memories.push('Completed side contract: '+q.title+'.');
      const progress=window.LegendProgressionV100?.award(player,q.xp);
      save(player);
      renderSideContracts('Contract complete. '+q.completeText+' +'+q.gold+'g, '+q.xp+' XP, and '+q.amount+' '+itemName(q.item)+'.'+(progress?.levels?' Level up! You are now level '+progress.level+'.':''));
    });
  }
function renderDryCrossing(){
    const pl=p(); if(!pl)return;
    if(String(pl.currentRegion||'Ashmere')!=='Greyfen')return renderAshmere();
    const completed=Boolean(pl.flags?.greyfenDryCrossingComplete);
    const description="The Landing Warden needs a route marker that washed loose from the raised path. The marker will help travelers avoid a newly opened sink in the marsh.";
    if(completed){
      return screen(head('Greyfen Contract','A Dry Crossing','The marker has been recovered and entered in the Boundary Archive.',locationInterior('archive'),'route'),
        '<div class="ash099-lines"><p>The recovered marker now points travelers toward the raised causeway. The bellkeeper has copied its position into the lowland ledger.</p><p><strong>Contract complete.</strong> This one-time contract cannot be claimed again.</p></div>');
    }
    screen(head('Greyfen Contract','A Dry Crossing',description,locationInterior('archive'),'route'),
      '<div class="ash099-lines"><p>Choose a route before leaving the landing. Both options are explained up front; a failed reed-bed attempt can be retried, but the marsh will take a toll.</p></div>'+
      '<div class="ash099-cards">'+
        '<button class="ash099-btn ash099-card" data-crossing-choice="posts"><strong>Follow the Old Posts</strong><small>Safer and slower. Guaranteed marker recovery. Reward: 35g and 1 Road Herb. No health risk.</small><em>Take the raised path</em></button>'+
        '<button class="ash099-btn ash099-card" data-crossing-choice="reeds"><strong>Cut Through the Reed Bed</strong><small>Faster but uncertain. 65% chance to recover the marker for 65g and 2 Road Herbs. On a miss: no reward, lose 5 HP, and you may retry.</small><em>Risk the shortcut</em></button>'+
      '</div>');
    document.querySelectorAll('[data-crossing-choice]').forEach(b=>b.onclick=()=>settleDryCrossing(b.dataset.crossingChoice));
  }
  function settleDryCrossing(choice){
    const pl=p(); if(!pl)return;
    if(String(pl.currentRegion||'Ashmere')!=='Greyfen')return renderAshmere();
    pl.flags=pl.flags||{}; pl.inventory=pl.inventory||{};
    if(pl.flags.greyfenDryCrossingComplete)return renderDryCrossing();
    let heading='',detail='';
    if(choice==='posts'){
      pl.flags.greyfenDryCrossingComplete=true;
      pl.gold=Number(pl.gold||0)+35;
      pl.inventory.roadHerb=Number(pl.inventory.roadHerb||0)+1;
      heading='The marker is safe';
      detail='You followed the old posts and found the marker caught between two raised stones. Reward: 35g and 1 Road Herb. No health lost.';
      pl.memories=pl.memories||[]; pl.memories.push('You recovered Greyfen’s washed route marker by following the old posts.');
    }else if(choice==='reeds'){
      pl.flags.greyfenCrossingAttempts=Number(pl.flags.greyfenCrossingAttempts||0)+1;
      if(Math.random()<0.65){
        pl.flags.greyfenDryCrossingComplete=true;
        pl.gold=Number(pl.gold||0)+65;
        pl.inventory.roadHerb=Number(pl.inventory.roadHerb||0)+2;
        heading='The shortcut pays off';
        detail='You read the current correctly and caught the marker before it slipped beneath the reeds. Reward: 65g and 2 Road Herbs.';
        pl.memories=pl.memories||[]; pl.memories.push('You recovered Greyfen’s washed route marker through the reed bed.');
      }else{
        pl.hp=Math.max(1,Number(pl.hp||1)-5);
        heading='The reeds turn you back';
        detail='The mud gives way before you reach the marker. You escape with nothing but a bruised shoulder and lose 5 HP. You may try again or take the safer raised path.';
        pl.memories=pl.memories||[]; pl.memories.push('The reed bed turned you back from Greyfen’s washed route marker; you lost 5 HP.');
      }
    }else return renderDryCrossing();
    save(pl);
    screen(head('Contract Result',heading,'Your choice has been recorded.',locationInterior('archive'),'route'),
      '<div class="ash099-lines"><p>'+esc(detail)+'</p><p>'+esc(pl.flags.greyfenDryCrossingComplete?'The marker’s location is now recorded in the Boundary Archive.':'The contract remains open until the marker is recovered.')+'</p></div>');
  }

  function renderPeople(){
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen';
    const people=greyfen?[
      ['mara','Mara Vell','Boundary Archivist','Copies the bell-marks and boundary stones that emerge from the drowned roads.'],
      ['brenn','Old Brenn','Bellkeeper’s Ledger','Records causeway crossings, missing travelers, and recovered proof.'],
      ['oric','Captain Oric','Causeway Watch','Knows which raised paths hold after rain and which vanish beneath the reeds.']
    ]:[
      ['mara','Mara Vell','Archive Keeper','The first person to ask about the bell that rang when you arrived.'],
      ['brenn','Old Brenn','Ledger Keeper','Records Road Tokens, proof, and what Ashmere owes returning travelers.'],
      ['oric','Captain Oric','Gate Captain','Offers practical warnings before you leave the lantern line.']
    ];
    const cards=people.map(([id,name,role,desc])=>'<button class="ash099-btn ash099-npc-card" data-ash-view="'+id+'">'+img(npc(id),name)+'<strong>'+name+'</strong><small>'+role+' · '+desc+'</small></button>').join('');
    screen(head(greyfen?'Lowland Keepers':'Town Square',greyfen?'People of Greyfen':'People of Ashmere',greyfen?'The causeway brings records, warnings, and rumors up from the drowned roads.':'The square is where Ashmere watches newcomers decide who they are.',bg(),'people'),'<div class="ash099-npc-grid">'+cards+'</div>');
  }

  function renderNPC(id){
    const pl=p(); if(!pl)return;
    const greyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
    const ashMap={
      mara:{name:'Mara Vell',role:'Archive Keeper',art:npc('mara'),text:'Mara keeps Ashmere\'s records in careful stacks, as if the town might fall apart without her hands holding it together.',lines:['The bell rang once when you arrived. That should not be possible.','If the road truly woke for you, Old Road may still hide proof of what changed.','Bring back Road Tokens. Bring back anything the road should not have remembered.']},
      brenn:{name:'Old Brenn',role:'Ledger Keeper',art:npc('brenn'),text:'Brenn keeps ink, coin, and consequences in the same room. Nothing counts in Ashmere until it is written down.',lines:['Road Tokens matter. Bell Fragments matter more.','The road forgets. I do not.','If you have three Road Tokens, I can record your first proof.']},
      oric:{name:'Captain Oric',role:'Gate Captain',art:npc('oric'),text:'Oric watches the gate like the road owes him blood.',lines:['Out there, hesitation gets people buried.','Guard when the hit looks heavy. Fall back before pride gets you killed.','Preparation is not cowardice. It is why veterans get old.']}
    };
    const fenMap={
      mara:{name:'Mara Vell',role:'Boundary Archivist',art:npc('mara'),text:'Mara has set up a temporary desk in Greyfen’s boundary archive. Every bell-mark she copies seems older than the stone it was carved into.',lines:['These stones were markers before they were graves. I am still deciding which they are now.','The light in the reeds is not a lantern. It only wants you to follow it like one.','Bring me a rubbing of any bell-mark you find. I will compare it to the drowned records.']},
      brenn:{name:'Old Brenn',role:'Bellkeeper’s Ledger',art:npc('brenn'),text:'Brenn has carried his ledger across the causeway. Here, the ink records more than rewards: crossings, disappearances, and debts no one wants to claim.',lines:['Greyfen pays in proof, not promises. Keep every token you earn.','A crossing costs coin. A safe crossing costs preparation.','I am keeping a separate line for those who hear the bell after dark.']},
      oric:{name:'Captain Oric',role:'Causeway Watch',art:npc('oric'),text:'Oric watches the raised paths between Greyfen and the drowned lowlands. He marks every stretch that can vanish after heavy rain.',lines:['Stay on the old stone where you can. Reeds hide holes deep enough to swallow a cart.','If something keeps pace with you in the water, do not turn your lantern toward it.','Rest before the causeway narrows. There is nowhere to stand once the flood reaches the markers.']}
    };
    const n=(greyfen?fenMap:ashMap)[id]||(greyfen?fenMap:ashMap).mara;
    // First-return dialogue makes the town acknowledge a completed road journey.
    // It uses existing saved outcomes only; it does not add a new quest or reward flag.
    let npcText=n.text, lines=n.lines;
    const completedRoads=Number(pl.stats?.oldRoadClears||0);
    const bellFragments=Number(pl.inventory?.bellFragment||0);
    const roadTokens=Number(pl.inventory?.roadToken||0);
    const roadHistory=pl.flags?.roadExpeditionV100||{};
    if(!greyfen&&completedRoads>0){
      if(id==='mara'){
        npcText='Mara has spread damp route charts beside the archived bell-marks. This time, she asks what you saw—not what you think it means.';
        lines=bellFragments>0?[
          'You brought back a Bell Fragment. The name is a starting point, not proof that it broke from the bell.',
          'Was the blue light fixed in one place, or did it move? That difference belongs in the record.',
          'I will leave its meaning open until we can compare the marks with another source.'
        ]:[
          'You came back. Start with what you saw, in order; we can decide what it means after the details are safely recorded.',
          'The archive has old routes, not ready-made answers. A changed road needs a new entry.',
          'If you find another marked object, keep its edges intact. A broken corner can still tell us something.'
        ];
      }else if(id==='brenn'){
        npcText='Brenn opens a fresh ledger page. He records the journey, but every reward must have a source and every claim must be clear.';
        lines=[
          'One clear return is better than a dozen rumors. I can record the trip and the proof you brought back.',
          bellFragments>0?'Bell Fragments are not just scrap. I will record where you found one before anyone tries to price it.':'Tokens prove distance traveled; the next route still needs evidence.',
          roadTokens>=3?'You have three Road Tokens. I can open the regional ledger when you are ready.':'Bring three Road Tokens and we can review the next regional entry.'
        ];
      }else if(id==='oric'){
        npcText='Oric has added your last route to the gate notes. His questions are about footing, visibility, and what would keep the next traveler alive.';
        if(roadHistory.routeChoice==='reeds'){
          lines=[
            'You chose the Reed Cut. The fragment was worth finding, but those tracks are a reason to report the route—not chase them alone.',
            'When you leave again, carry enough supplies to turn back before pressure leaves you no safe choice.',
            'Tell me where the footing changed. A useful report can keep the next traveler from meeting the same danger unready.'
          ];
        }else if(roadHistory.routeChoice==='ridge'){
          lines=[
            'You chose the High Ridge. Firmer ground is useful, but I want to know where it stopped being firm.',
            'Mark the place where the cairn stood and tell me what the higher ground let you see.',
            'I will update the gate notes when we have enough reports to tell a pattern from an accident.'
          ];
        }else{
          lines=[
            'You made it back. Begin with where the footing changed and what you would prepare differently.',
            'Road danger starts before a foe appears. A reliable report can keep the next traveler from meeting it unready.',
            'Tell me what happened in the order it happened. I need specifics more than a heroic summary.'
          ];
        }
      }
    }
    pl.flags=pl.flags||{}; pl.npcTalk=pl.npcTalk||{}; pl.npcTalk[id]=Number(pl.npcTalk[id]||0)+1;
    if(id==='mara'&&!greyfen){ pl.flags.talkedToMara=true; pl.flags.bellQuestStarted=true; }
    save(pl);
    let extra='';
    if(id==='brenn'&&roadTokens>=3) extra='<button class="ash099-btn" id="turnTokens">Open the Regional Ledger</button>';
    screen(head(n.role,n.name,npcText,n.art,id),'<div class="ash099-lines">'+lines.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>',extra);
    const turn=document.getElementById('turnTokens');
    if(turn) turn.onclick=()=>window.LegendRegionsV100?.render?.() || renderNPC('brenn');
  }

  function renderInn(){
 const pl=p();if(!pl)return;
 const greyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
 const title=greyfen?'Reedlight Inn':'Ashmere Inn';
 const desc=greyfen?'Dry your cloak, recover, and listen for lowland rumors.':'A warm room, a locked door, and one night away from the mud.';
 const intro=greyfen?'The room is damp, but the fire is steady. Rest before the causeway takes another toll.':'The inn smells of cedar smoke and wet wool. The road can wait until morning.';
 screen(head('Inn & Lodging',title,desc,locationInterior('inn'),'inn'),
  '<section class="ash099-service-dashboard">'+
   '<div class="ash099-service-overview"><div class="ash099-service-note"><span>THE INNKEEPER’S NOTE</span><strong>'+esc(intro)+'</strong><p>Take a breath, stock the pack, or ask what the regulars have heard.</p></div><div class="ash099-service-wallet"><span>YOUR PURSE</span><strong>'+gold(pl.gold)+'</strong><small>HEALTH · '+Number(pl.hp||0)+' / '+Number(pl.maxHp||1)+'</small><i><b style="width:'+Math.max(0,Math.min(100,Math.round(Number(pl.hp||0)/Math.max(1,Number(pl.maxHp||1))*100)))+'%"></b></i></div></div>'+
   '<div class="ash099-service-actions">'+
    '<button class="ash099-btn ash099-service-card" id="rest" type="button"><span class="ash099-service-icon">'+icon('inn')+'</span><span class="ash099-service-copy"><small>RECOVER</small><strong>Rest for the night</strong><span>Restore all health and return to the road ready.</span></span><em>35g</em></button>'+
    '<button class="ash099-btn ash099-service-card" id="camp" type="button"><span class="ash099-service-icon">'+icon('road')+'</span><span class="ash099-service-copy"><small>PACK SUPPLIES</small><strong>Camp Supplies</strong><span>Carry shelter and dry kindling for safer expeditions.</span></span><em>90g</em></button>'+
    '<button class="ash099-btn ash099-service-card" id="rumor" type="button"><span class="ash099-service-icon">'+icon('archive')+'</span><span class="ash099-service-copy"><small>LISTEN IN</small><strong>Hear a Rumor</strong><span>Ask what has been happening beyond the lantern line.</span></span><em>FREE</em></button>'+
   '</div><div id="ashNote" class="ash099-note" style="display:none"></div></section>');
 document.getElementById('rest').onclick=()=>buyService(35,pl=>{pl.hp=pl.maxHp},'You rest at the inn and recover completely.');
 document.getElementById('camp').onclick=()=>buyService(90,pl=>{pl.inventory.camp=Number(pl.inventory.camp||0)+1},'Bought camp supplies.');
 document.getElementById('rumor').onclick=()=>{
  const rumors=greyfen
   ?['The water rose after the bell rang, though no rain had fallen.','A blue light is seen near the drowned boundary stones at dusk.','The causeway markers have shifted. Or something has turned them.']
   :['A broken shrine showed itself in the fog last night.','Blackroot wolves hate firelight.','Brenn pays extra for proof that still bleeds.'];
  note(rumors[Math.floor(Math.random()*rumors.length)]);
 };
}
function buyService(cost,fn,msg){const pl=p();if(Number(pl.gold||0)<cost)return note('Not enough gold.');pl.gold-=cost;fn(pl);save(pl);note(msg);}

const workJobs = {
    wood:{title:'Split Firewood',desc:'Split wet ash logs cleanly without sending the axe skidding into the block.',skill:'strength',pay:38,item:'woodScrap',amount:1,verb:'Strike',hint:'Catch the moving marker inside the gold band.',mode:'timing'},
    gate:{title:'Watch the Gate',desc:'Read the lantern signals beyond Oric’s watch line before panic spreads through town.',skill:'survival',pay:42,item:'food',amount:1,mode:'signal',prompt:'A traveler flashes two short lights, pauses, then gives one more. What should the watch report?',choices:[{label:'A coded request for help',grade:'Perfect',feedback:'You recognize Oric’s distress pattern and send the correct reply.'},{label:'A wagon asking for the gate to open',grade:'Good',feedback:'You avoid sounding an alarm, but the signal is misread.'},{label:'An enemy charge; ring the great bell',grade:'Messy',feedback:'The bell draws every guard to the gate for a false alarm.'}]},
    records:{title:'Sort Archive Records',desc:'Find the one ledger entry that matches Mara’s clue instead of filing a false record.',skill:'lore',pay:45,item:'roadHerb',amount:1,mode:'ledger',prompt:'Mara needs a ledger sealed with the old bell mark and dated before the first frost. Which entry fits?',choices:[{label:'Bell seal · Last week’s market tally',grade:'Messy',feedback:'The seal is right, but the date is too recent.'},{label:'Crow seal · Before first frost',grade:'Messy',feedback:'The date fits, but the wrong family kept this ledger.'},{label:'Bell seal · Late autumn, before first frost',grade:'Perfect',feedback:'You match both the seal and the date. Mara finds the page she needs.'}]},
    crates:{title:'Carry Market Crates',desc:'Remember the porter’s safe lifting order and get the whole stack inside without a spill.',skill:'strength',pay:34,item:'camp',amount:1,mode:'sequence',sequence:['BRACE','LIFT','TURN','SET'],actions:['BRACE','LIFT','TURN','SET','DROP']},
    yard:{title:'Clean Stable Yard',desc:'Clear the clogged drain before the next rain pushes muck beneath the stable door.',skill:'luck',pay:30,item:'clothScrap',amount:1,mode:'triage',prompt:'The yard drain is backing up and rain is coming. What do you clear first?',choices:[{label:'Open the main runoff channel',grade:'Perfect',feedback:'Water drains away from the stable before it can flood the bedding.'},{label:'Move the dry straw to higher ground',grade:'Good',feedback:'You save the bedding, though the drain still needs attention.'},{label:'Scrub the decorative railings',grade:'Miss',feedback:'The yard looks better, but the water keeps rising.'}]},
    message:{title:'Run a Message',desc:'Carry sealed instructions across town before the rain ruins the ink.',skill:'survival',pay:46,item:'goblinTrinket',amount:1,mode:'route',prompt:'Rain is turning the streets to rivers. Which route keeps the sealed message dry?',choices:[{label:'Covered arcade behind the bakeries',grade:'Perfect',feedback:'You keep under the awnings and deliver the seal untouched.'},{label:'Market lane, cutting through the crowd',grade:'Good',feedback:'You arrive quickly, but the seal is damp around the edges.'},{label:'Ford the stream by the old mill',grade:'Miss',feedback:'The current soaks the wrapping before you reach the far bank.'}]}
  };
  const greyfenWorkJobs = {
    peat:{title:'Dry Peat Bricks',desc:'Stack fresh-cut peat in the right order beneath the Reedlight awning before the shower.',skill:'strength',pay:40,item:'peatBrick',amount:2,mode:'sequence',sequence:['DRY','PRESS','STACK','COVER'],actions:['DRY','PRESS','STACK','COVER','RUSH']},
    salvage:{title:'Sort a Salvage Basket',desc:'Separate useful metal and cloth from finds lifted off the drowned walk.',skill:'luck',pay:44,item:'ore',amount:1,mode:'triage',prompt:'The basket smells of brackish water. What do you save first before the rust spreads?',choices:[{label:'Dry the iron scraps on clean sacking',grade:'Perfect',feedback:'The metal is saved before the saltwater eats through it.'},{label:'Rinse everything together in the stream',grade:'Miss',feedback:'The fresh water spreads the grit into every seam.'},{label:'Separate cloth from metal, then dry both',grade:'Good',feedback:'You save most of the useful stock, though the finest pieces still need work.'}]},
    markers:{title:'Reset Flood Markers',desc:'Use the keeper’s record to reset the causeway stakes to the correct waterline.',skill:'survival',pay:48,item:'roadHerb',amount:2,mode:'ledger',prompt:'The brass notch marks the last safe tide. The bell post stands east of the drowned stair. Which plan matches the record?',choices:[{label:'Set the east bell post first, then align the brass notch',grade:'Perfect',feedback:'The marker line matches the keeper’s record and the path becomes legible again.'},{label:'Raise every post to the highest mark',grade:'Messy',feedback:'The path looks clear, but the reading is no longer useful.'},{label:'Align the brass notch to the water, ignoring the bell post',grade:'Good',feedback:'The tide mark is close, but the causeway bearing is still wrong.'}]}
  };
  function jobsForCurrentRegion(){return String(p()?.currentRegion||'Ashmere')==='Greyfen'?greyfenWorkJobs:workJobs;}
  function jobModeName(mode){return ({timing:'Timing challenge',signal:'Read the signal',ledger:'Solve the clue',sequence:'Memory sequence',triage:'Worksite decision',route:'Route choice'}[mode]||'Field task');}

  function renderWorkBoard(){
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen';
    const jobs=jobsForCurrentRegion();
    screen(head(greyfen?'Local Work':'Ashmere Jobs',greyfen?'Bellkeeper’s Hall':'Work Board',greyfen?'Take on lowland work with a mix of memory, judgment, clues, and careful handling.':'Every contract works a little differently: time a strike, decode a signal, solve a ledger clue, remember a work sequence, or choose the right approach.',locationInterior('archive'),'work'),`<div class="ash099-job-board"><div class="ash099-job-board-intro"><span>FIELD CONTRACTS</span><strong>${Object.keys(jobs).length} ways to earn your keep</strong><small>Clean work pays better. Thoughtful choices can earn supplies as well as coin.</small></div><div class="ash099-cards">${Object.entries(jobs).map(([id,j])=>`<button class="ash099-btn ash099-card ash099-job-board-card" data-job-open="${id}"><span class="ash099-job-board-mode">${esc(jobModeName(j.mode))}</span><strong>${j.title}</strong><small>${j.desc}</small><em>${j.pay}g base pay</em></button>`).join('')}</div></div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-job-open]').forEach(b=>b.onclick=()=>renderJobActivity(b.dataset.jobOpen));
  }
  function renderJobActivity(id){
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen';
    const jobs=jobsForCurrentRegion();
    const j=jobs[id]||Object.values(jobs)[0];
    const mode=j.mode||'timing';
    const zoneStart=34+Math.floor(Math.random()*16);
    const zoneWidth=18;
    const choices=['signal','ledger','triage','route'].includes(mode);
    const sequence=Array.isArray(j.sequence)?j.sequence.slice():[];
    let challengeMarkup='';
    if(mode==='timing'){
      challengeMarkup='<section class="ash099-job-challenge ash099-job-timing"><span class="ash099-job-overline">TIMING TEST</span><p>'+esc(j.hint||'Strike when the marker reaches the gold band.')+'</p><div class="ash099-job-track" id="jobTrack"><i class="ash099-job-zone" style="left:'+zoneStart+'%;width:'+zoneWidth+'%"></i><b class="ash099-job-marker" id="jobMarker"></b></div><small>Gold band = clean work · Outside the band = lost time or stock</small></section>';
    }else if(choices){
      challengeMarkup='<section class="ash099-job-challenge ash099-job-choice-challenge"><div class="ash099-job-challenge-heading"><span class="ash099-job-overline">'+esc(jobModeName(mode))+'</span><h2>'+esc(j.prompt||j.desc)+'</h2><p>Read the details, then commit to the response you think is right.</p></div><div class="ash099-job-choice-grid">'+(j.choices||[]).map((choice,i)=>'<button type="button" class="ash099-job-choice" data-job-choice="'+i+'" data-grade="'+esc(choice.grade||'Messy')+'" data-feedback="'+esc(choice.feedback||'You commit to your choice.')+'"><span class="ash099-job-choice-index">'+String(i+1).padStart(2,'0')+'</span><span class="ash099-job-choice-copy"><strong>'+esc(choice.label)+'</strong>'+(choice.detail?'<small>'+esc(choice.detail)+'</small>':'')+'</span><span class="ash099-job-choice-arrow">↗</span></button>').join('')+'</div></section>';
    }else if(mode==='sequence'){
      challengeMarkup='<section class="ash099-job-challenge ash099-job-sequence"><div class="ash099-job-challenge-heading"><span class="ash099-job-overline">MEMORY SEQUENCE</span><h2>Study the order, then repeat it</h2><p>The steps will flash once. Remember the order and choose each action in sequence.</p></div><div class="ash099-sequence-preview" id="jobSequencePreview" aria-live="polite">Ready when you are</div><button class="ash099-btn primary ash099-sequence-start" id="jobStartSequence" type="button">Study the sequence</button><div class="ash099-sequence-actions">'+(j.actions||[]).map((action,i)=>'<button type="button" class="ash099-sequence-action" data-job-sequence="'+esc(action)+'" disabled><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(action)+'</strong></button>').join('')+'</div><p class="ash099-sequence-status" id="jobSequenceStatus">Choose Study the sequence to begin.</p></section>';
    }
    const body='<section class="ash099-job-game ash099-job-mode-'+esc(mode)+'" data-job-mode="'+esc(mode)+'">'+
      '<div class="ash099-job-meta"><span>Skill: '+esc(j.skill.toUpperCase())+'</span><span>Base Pay: '+gold(j.pay)+'</span><span>Bonus: '+esc(itemName(j.item))+' ×'+Number(j.amount||1)+'</span></div>'+
      challengeMarkup+
      (mode==='timing'?'<button class="ash099-btn primary ash099-job-submit" id="jobStrike" type="button">'+esc(j.verb||'Commit')+'</button>':'')+
      '<p class="ash099-note" id="jobResult" style="display:none" aria-live="polite"></p>'+
      (mode==='timing'?'<p class="ash099-note">Keyboard: press Space or Enter to commit the action.</p>':'')+
      '</section>';
    screen(head(greyfen?'Local Work':'Work Board',j.title,j.desc,locationInterior('archive'),'work'),body,'<button class="ash099-btn" id="backJobs">Choose Another Job</button>');
    const marker=document.getElementById('jobMarker');
    const strike=document.getElementById('jobStrike');
    const result=document.getElementById('jobResult');
    let pos=0,dir=1,done=false,timer=null;
    let sequenceIndex=0,sequenceErrors=0,sequenceReady=false;
    const sequenceTimers=[];
    function cleanup(){
      if(timer)clearInterval(timer);
      sequenceTimers.forEach(t=>clearTimeout(t));
      document.removeEventListener('keydown',onKey);
    }
    if(mode==='timing'){
      timer=setInterval(()=>{if(done)return;pos+=dir*2.35;if(pos>=100){pos=100;dir=-1;}if(pos<=0){pos=0;dir=1;}if(marker)marker.style.left=pos+'%';},24);
    }
    function finish(gradeOverride,context){
      if(done)return;
      done=true;
      cleanup();
      const center=zoneStart+(zoneWidth/2);
      const dist=Math.abs(pos-center);
      const grade=gradeOverride||(dist<=4?'Perfect':dist<=9?'Good':dist<=17?'Messy':'Miss');
      const mult=grade==='Perfect'?1.45:grade==='Good'?1.12:grade==='Messy'?.72:.38;
      const pay=Math.max(5,Math.round(j.pay*mult));
      const bonusChance=grade==='Perfect'?.95:grade==='Good'?.62:grade==='Messy'?.24:.05;
      const player=p();
      player.flags=player.flags||{};player.inventory=player.inventory||{};player.stats=player.stats||{};
      const progress=window.LegendProgressionV100?.award(player,grade==='Perfect'?28:grade==='Good'?20:grade==='Messy'?14:10);
      player.flags.ashmereJobs=Number(player.flags.ashmereJobs||0)+1;
      player.flags.ashmereFavor=Number(player.flags.ashmereFavor||0)+(grade==='Perfect'?2:1);
      player.gold=Number(player.gold||0)+pay;
      let bonus='';
      if(Math.random()<bonusChance){player.inventory[j.item]=Number(player.inventory[j.item]||0)+Number(j.amount||1);bonus=' Bonus gained: '+Number(j.amount||1)+' '+itemName(j.item)+'.';}
      if(grade==='Miss'&&Number(player.hp||0)>1){player.hp=Math.max(1,Number(player.hp||0)-1);bonus+=' You lose 1 HP from the rough work.';}
      save(player);
      const xpNote=progress?' XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'.':'';
      if(result){result.style.display='block';result.textContent=grade+'! '+(context?context+' ':'')+'Earned '+pay+'g.'+bonus+' Local standing increased.'+xpNote;}
      if(strike){strike.disabled=true;strike.textContent='Job Complete';}
      document.querySelectorAll('[data-job-choice],[data-job-sequence],#jobStartSequence').forEach(b=>b.disabled=true);
      setTimeout(()=>renderWorkBoard(),1800);
    }
    if(strike)strike.onclick=()=>finish();
    if(choices){
      document.querySelectorAll('[data-job-choice]').forEach(b=>b.onclick=()=>finish(b.dataset.grade,b.dataset.feedback));
    }
    if(mode==='sequence'){
      const start=document.getElementById('jobStartSequence');
      const preview=document.getElementById('jobSequencePreview');
      const status=document.getElementById('jobSequenceStatus');
      start?.addEventListener('click',()=>{
        if(done)return;
        start.disabled=true;
        let revealIndex=0;
        const reveal=()=>{
          if(done)return;
          if(revealIndex>=sequence.length){
            sequenceReady=true;
            if(preview)preview.textContent='Your turn · repeat all '+sequence.length+' steps';
            if(status)status.textContent='Repeat the sequence from memory.';
            document.querySelectorAll('[data-job-sequence]').forEach(b=>b.disabled=false);
            return;
          }
          if(preview)preview.innerHTML='<span>STEP '+(revealIndex+1)+' / '+sequence.length+'</span><strong>'+esc(sequence[revealIndex])+'</strong>';
          revealIndex++;
          sequenceTimers.push(setTimeout(reveal,670));
        };
        reveal();
      });
      document.querySelectorAll('[data-job-sequence]').forEach(b=>b.addEventListener('click',()=>{
        if(done||!sequenceReady)return;
        if(b.dataset.jobSequence===sequence[sequenceIndex]){
          sequenceIndex++;
          if(status)status.textContent='Correct · '+sequenceIndex+' of '+sequence.length+' steps';
          if(sequenceIndex>=sequence.length)finish(sequenceErrors===0?'Perfect':sequenceErrors===1?'Good':'Messy','You repeated the full handling sequence.');
        }else{
          sequenceErrors++;
          if(status)status.textContent='Out of order. Take a breath and continue from the same step.';
          if(sequenceErrors>=2)finish('Messy','You finish the work, but the sequence costs you time.');
        }
      }));
    }
    const onKey=e=>{if(mode!=='timing'||(e.key!==' '&&e.key!=='Enter'))return;e.preventDefault();document.removeEventListener('keydown',onKey);finish();};
    if(mode==='timing')document.addEventListener('keydown',onKey);
    const backJobs=document.getElementById('backJobs');
    if(backJobs)backJobs.onclick=()=>{done=true;cleanup();renderWorkBoard();};
  }
function renderTrader(tab='buy'){
    const pl=p();
    const greyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
    const goods=[['food','Rations',60,'A day’s food for the road.'],['potion','Healing Potion',120,'Restore your strength in a fight.'],['camp','Camp Supplies',90,'Prepare a safe stop beyond the gate.'],['clothScrap','Cloth Scrap',34,'Material for field medicine.'],['oil','Lamp Oil',70,'Fuel for lanterns and preparations.']];
    const sellables=[['wolfFang',12],['tornHide',8],['roadHerb',10],['wispAsh',22],['goblinTrinket',16],['blackrootThorn',14],['woodScrap',7],['peatBrick',6],['clothScrap',9],['ore',24],['tradeBundle',72],['brokenBellShard',60]];
    const sellAllValue=sellables.reduce((sum,[k,v])=>sum+(owned(pl,k)*v),0);
    const itemCard=(k,name,price,desc,action,disabled,tail)=>{
      const art=itemIcon(k)||A().items?.roadToken||'';
      const thumb=art?'<img class="ash099-market-art" src="'+esc(art)+'" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">':'<span class="ash099-market-art ash099-market-art-fallback" aria-hidden="true">✦</span>';
      return '<button class="ash099-market-item" data-'+action+'="'+esc(k)+'" data-'+(action==='buy'?'cost':'value')+'="'+price+'" '+(disabled?'disabled':'')+'>'+thumb+'<span class="ash099-market-item-copy"><strong>'+esc(name)+'</strong><small>'+esc(desc)+'</small><em>'+esc(tail)+'</em></span><b class="ash099-market-price">'+price+'g</b></button>';
    };
    const content=tab==='buy'
      ?goods.map(([k,n,cost,desc])=>itemCard(k,n,cost,desc,'buy',!canAfford(pl,cost),'You own '+owned(pl,k))).join('')
      :sellables.filter(([k])=>owned(pl,k)>0).map(([k,value])=>itemCard(k,itemName(k),value,'A road find, ready to trade.','sell',false,'You own '+owned(pl,k))).join('');
    const noLoot=tab==='sell'&&!sellables.some(([k])=>owned(pl,k)>0)?'<div class="ash099-empty-state">No road finds to sell yet.<small>Bring back herbs, hides, fangs, and fragments to stock the market.</small></div>':'';
    screen(head('Market',greyfen?'Marsh Market':'Trading Post',greyfen?'Trade the marsh’s finds for what you need to cross the water.':'Buy what you need. Sell what the road has left behind.',locationInterior('market'),'trader'),
      '<section class="ash099-market-console">'+
        '<div class="ash099-market-wallet"><div><span>YOUR PURSE</span><strong>'+gold(pl.gold)+'</strong></div><div><span>ROAD LOOT VALUE</span><strong>'+gold(sellAllValue)+'</strong></div>'+(tab==='sell'?'<button class="ash099-btn primary" id="sellAllLoot" '+(sellAllValue>0?'':'disabled')+'>Sell all loot</button>':'<span class="ash099-market-note">Prices are per item</span>')+'</div>'+
        '<div class="ash099-market-tabs" role="tablist" aria-label="Market actions"><button class="'+(tab==='buy'?'active':'')+'" data-market-tab="buy" role="tab" aria-selected="'+(tab==='buy')+'">Buy supplies</button><button class="'+(tab==='sell'?'active':'')+'" data-market-tab="sell" role="tab" aria-selected="'+(tab==='sell')+'">Sell road loot <span>'+sellables.reduce((n,[k])=>n+owned(pl,k),0)+'</span></button></div>'+
        '<div class="ash099-market-grid">'+content+noLoot+'</div><div id="ashNote" class="ash099-note" style="display:none"></div></section>');
    document.querySelectorAll('[data-market-tab]').forEach(b=>b.onclick=()=>renderTrader(b.dataset.marketTab));
    document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy,Number(b.dataset.cost)));
    document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>sellItem(b.dataset.sell,Number(b.dataset.value)));
    const sellAll=document.getElementById('sellAllLoot');
    if(sellAll)sellAll.onclick=()=>sellAllLoot(sellables);
  }
  function buyItem(k,cost){const pl=p();if(Number(pl.gold||0)<cost)return note('Not enough gold.');pl.gold-=cost;pl.inventory[k]=Number(pl.inventory[k]||0)+1;save(pl);renderTrader('buy');}
  function sellItem(k,value){const pl=p();if(owned(pl,k)<=0)return note('Nothing to sell.');pl.inventory[k]-=1;pl.gold=Number(pl.gold||0)+value;save(pl);renderTrader('sell');}
  function sellAllLoot(sellables){const pl=p();let total=0;sellables.forEach(([k,v])=>{const qty=owned(pl,k);if(qty>0){total+=qty*v;pl.inventory[k]=0;}});if(total<=0)return note('No sellable road loot.');pl.gold=Number(pl.gold||0)+total;save(pl);renderTrader('sell');}

  function renderCrafting(){
    const pl=p();
    const recipes=[
      ['roadPoultice','Road Poultice',[['roadHerb',2],['clothScrap',1]],'Healing item for rough travel.'],
      ['blackrootTonic','Blackroot Tonic',[['blackrootThorn',1],['wolfFang',1]],'Prepared for fear, bleed, and cursed road events later.'],
      ['huntersCharm','Hunter\'s Charm',[['wolfFang',2],['camp',1]],'+1 survival flavor for next road trip later.'],
      ['reinforcedBuckle','Reinforced Buckle',[['ore',1],['tornHide',1]],'Minor armor improvement material for the blacksmith later.'],
      ['wispLanternWick','Wisp Lantern Wick',[['bellFragment',1],['oil',1]],'A crafted lantern ward that softens the opening pressure of your next expedition.'],
      ['tradeBundle','Trade Bundle',[['goblinTrinket',2],['tornHide',1],['woodScrap',1]],'Sellable bundle worth more than raw scraps.']
    ];
    const cards=recipes.map(([id,name,needs,desc])=>`<button class="ash099-btn ash099-card" data-craft="${id}" data-needs="${needs.map(n=>n.join(':')).join(',')}" ${canCraft(pl,needs)?'':'disabled'}>${icon('craft')}<strong>${name}</strong><small>${desc}<br>Needs ${needsText(pl,needs)}.</small><em>${canCraft(pl,needs)?'Craft':'Missing'}</em></button>`).join('');
    screen(head('Crafting',String(p()?.currentRegion||'Ashmere')==='Greyfen'?'Marsh Workbench':'Crafting Bench','Road drops should matter. Convert herbs, fangs, hides, ash, and scraps into useful items or better sellables.',locationInterior('forge'),'craft'),`<div class="ash099-market-summary"><strong>Bench Stock</strong><span>Use road drops here before selling raw loot.</span><button class="ash099-btn" id="openTrader">Open Trading Post</button></div><div class="ash099-cards">${cards}</div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>craftItem(b.dataset.craft,b.dataset.needs));
    const openTrader=document.getElementById('openTrader');
    if(openTrader) openTrader.onclick=renderTrader;
  }
  function craftItem(id,needsTextRaw){const pl=p();const needs=String(needsTextRaw||'').split(',').filter(Boolean).map(x=>{const [k,v]=x.split(':');return [k,Number(v||0)];});if(!canCraft(pl,needs))return note('Missing ingredients.');needs.forEach(([k,v])=>pl.inventory[k]-=v);pl.inventory[id]=Number(pl.inventory[id]||0)+1;save(pl);renderCrafting();}

  function renderSmith(tab='weapon'){
    const pl=p(),assets=A().items||{};
    const weapons=(D().weapons||[]).filter(w=>w.id!=='hand'),armors=(D().armors||[]).filter(a=>a.id!=='none');
    const equippedWeapon=weapons.find(w=>w.id===pl.weapon),equippedArmor=armors.find(a=>a.id===pl.armor);
    const portrait=A().classes?.[pl.className]||'';
    const loadoutItem=(name,detail,art,kind)=>'<div class="ash099-loadout-slot">'+(kind==='weapon'?weaponArtSvg(p()?.weapon):(art?'<img src="'+esc(art)+'" alt="" aria-hidden="true" onerror="this.onerror=null;this.style.display=\'none\'">':icon('sheet')))+'<span><small>'+(kind==='weapon'?'WEAPON':'ARMOR')+'</small><strong>'+esc(name)+'</strong><em>'+esc(detail)+'</em></span></div>';
    const list=tab==='weapon'?weapons:armors;
    screen(head('Workshop',String(pl.currentRegion||'Ashmere')==='Greyfen'?'Causeway Smithy':'The Blacksmith','A good weapon is chosen. Good armor is earned. Equip what you own, or spend gold to improve your odds.',locationInterior('forge'),'smith'),
      '<section class="ash099-forge-console">'+
        '<div class="ash099-forge-loadout">'+(portrait?'<img class="ash099-forge-traveler" src="'+esc(portrait)+'" alt="'+esc(pl.className||'Traveler')+'" onerror="this.onerror=null;this.style.display=\'none\'">':'')+'<div class="ash099-forge-loadout-copy"><span class="ash099-eyebrow">YOUR CURRENT KIT</span><h2>Level '+Number(pl.level||1)+' · '+esc(pl.className||'Traveler')+'</h2><p>Owned gear stays yours. New gear is equipped as soon as you buy it.</p></div><div class="ash099-forge-slots">'+loadoutItem(equippedWeapon?.name||weaponName(pl.weapon),equippedWeapon?'Damage '+equippedWeapon.min+'–'+equippedWeapon.max:'Basic attack',assets.shortSword||'','weapon')+loadoutItem(equippedArmor?.name||armorName(pl.armor),equippedArmor?'Defense '+equippedArmor.defense:'No protection',assets.shield||assets.camp||'','armor')+'</div></div>'+
        '<div class="ash099-forge-tabs" role="tablist" aria-label="Workshop category"><button data-forge-tab="weapon" class="'+(tab==='weapon'?'active':'')+'" role="tab" aria-selected="'+(tab==='weapon')+'">Weapons</button><button data-forge-tab="armor" class="'+(tab==='armor'?'active':'')+'" role="tab" aria-selected="'+(tab==='armor')+'">Armor</button><button data-forge-tab="craft" class="" role="tab" aria-selected="false">Crafting Bench</button><span>YOUR GOLD <strong>'+gold(pl.gold)+'</strong></span></div>'+
        '<div class="ash099-forge-grid">'+list.map(x=>gearCard(x,tab)).join('')+'</div><div id="ashNote" class="ash099-note" style="display:none"></div></section>');
    document.querySelectorAll('[data-forge-tab]').forEach(b=>b.onclick=()=>b.dataset.forgeTab==='craft'?renderCrafting():renderSmith(b.dataset.forgeTab));
    document.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>buyGear(b.dataset.gear,b.dataset.kind));
  }
  function weaponArtSvg(id){
    const palette={
      woodenSword:{blade:'#b99258',edge:'#f0d5a0',grip:'#69482b',guard:'#967043',dark:'#382519'},
      stoneSword:{blade:'#8b9792',edge:'#e4e9db',grip:'#555b54',guard:'#737d75',dark:'#303a34'},
      bronzeSword:{blade:'#b86c3d',edge:'#f1c27a',grip:'#603d29',guard:'#db9a50',dark:'#42281d'},
      ironSword:{blade:'#8999a3',edge:'#e2e9ed',grip:'#333d43',guard:'#a1b0b5',dark:'#1f282d'},
      steelSword:{blade:'#c0d4de',edge:'#ffffff',grip:'#29353e',guard:'#e3c77e',dark:'#16212a'},
      hand:{blade:'#c8b98d',edge:'#efe2b5',grip:'#53422b',guard:'#8d7447',dark:'#251c13'}
    };
    const v=palette[id]||palette.hand;
    let blade='M39 5 L48 17 L44 47 L40 55 L36 47 L32 17 Z',detail='',guard='M26 51 Q40 56 54 51 L51 57 Q40 61 29 57 Z';
    if(id==='stoneSword'){
      blade='M38 5 L46 13 L49 25 L43 45 L40 56 L35 45 L31 25 L34 13 Z';
      detail='<path d="M38 12 L36 25 L40 39 L42 24 Z" fill="'+v.edge+'" opacity=".56"/><path d="M33 31 L39 36 L36 44" fill="none" stroke="'+v.dark+'" stroke-width="1.8"/>';
      guard='M24 49 L37 53 L40 50 L43 53 L56 49 L52 58 L41 56 L38 56 L28 58 Z';
    }else if(id==='bronzeSword'){
      blade='M39 5 Q46 9 47 18 L44 45 L40 55 L36 46 L32 18 Q33 9 39 5 Z';
      detail='<path d="M39 12 L41 22 L40 45" fill="none" stroke="'+v.edge+'" stroke-width="2.3"/><path d="M35 20 L38 23" stroke="'+v.dark+'" stroke-width="1.3"/>';
      guard='M23 48 Q32 53 37 50 L40 55 L43 50 Q49 53 57 48 L52 58 Q44 60 40 56 Q34 60 28 58 Z';
    }else if(id==='ironSword'){
      blade='M39 4 L46 15 L44 49 L40 56 L36 49 L32 15 Z';
      detail='<path d="M39 11 L40 50" stroke="'+v.edge+'" stroke-width="2.4"/><path d="M35 19 L37 38" stroke="'+v.dark+'" stroke-width="1.1" opacity=".65"/>';
      guard='M25 50 L38 52 L40 50 L42 52 L55 50 L51 57 L42 56 L38 56 L29 57 Z';
    }else if(id==='steelSword'){
      blade='M40 3 L47 16 L43 47 L40 55 L37 47 L33 16 Z';
      detail='<path d="M40 8 L41 48" stroke="'+v.edge+'" stroke-width="2.1"/><path d="M42 18 L45 21 L43 24" fill="none" stroke="'+v.edge+'" stroke-width="1.5"/><path d="M50 13 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z" fill="'+v.guard+'"/>';
      guard='M24 49 L38 52 L40 49 L42 52 L56 49 L51 57 L42 56 L38 56 L29 57 Z';
    }else{
      detail='<path d="M35 17 L37 38 M43 20 L42 42" stroke="'+v.dark+'" stroke-width="1.8" opacity=".55"/>';
    }
    const name=(window.LEGEND_DATA?.weapons||[]).find(w=>w.id===id)?.name||'Weapon';
    return '<span class="ash099-weapon-art ash099-weapon-art-'+esc(id)+'" role="img" aria-label="'+esc(name)+' illustration"><svg viewBox="0 0 80 80" aria-hidden="true" focusable="false"><path d="'+blade+'" fill="'+v.blade+'" stroke="'+v.dark+'" stroke-width="1.2"/><path d="M39 8 L40 49" fill="none" stroke="'+v.edge+'" stroke-width="1.5" opacity=".9"/>'+detail+'<path d="'+guard+'" fill="'+v.guard+'" stroke="'+v.dark+'" stroke-width="1.4"/><path d="M37 56 L43 56 L45 69 L40 73 L35 69 Z" fill="'+v.grip+'" stroke="'+v.dark+'" stroke-width="1.3"/><path d="M36 61 L43 61 M36 65 L44 65 M37 69 L42 69" stroke="'+v.edge+'" stroke-width="1.2" opacity=".7"/><circle cx="40" cy="74" r="3.5" fill="'+v.guard+'" stroke="'+v.dark+'" stroke-width="1.2"/></svg></span>';
  }
  function gearCard(x,kind){
    const pl=p(),ownedMap=kind==='weapon'?pl.ownedWeapons:pl.ownedArmor;
    const assets=A().items||{},art=kind==='weapon'?'':(assets.shield||assets.camp);
    const isOwned=Number(ownedMap?.[x.id]||0)>0,level=Number(pl.level||1),required=Number(x.level||1);
    const equipped=(kind==='weapon'?pl.weapon:pl.armor)===x.id,locked=level<required,canBuy=canAfford(pl,x.cost);
    const label=equipped?'Equipped':isOwned?'Equip owned':locked?'Unlock at Lv. '+required:canBuy?'Buy & equip':'Need '+gold(x.cost);
    const disabled=equipped||(!isOwned&&(locked||!canBuy));
    const artMarkup=kind==='weapon'?weaponArtSvg(x.id):(art?'<img class="ash099-gear-art" src="'+esc(art)+'" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">':'');
    const statLine=kind==='weapon'?'Damage '+x.min+'–'+x.max:'Defense '+x.defense;
    const passive=kind==='weapon'&&x.passive?'<small class="ash099-gear-passive">'+esc(x.passive)+'</small>':'';
    return '<button class="ash099-gear-item '+(equipped?'equipped ':'')+(locked&&!isOwned?'locked':'')+'" data-gear="'+esc(x.id)+'" data-kind="'+kind+'" '+(disabled?'disabled':'')+'>'+
      artMarkup+'<span class="ash099-gear-copy"><strong>'+esc(x.name)+'</strong><small>'+statLine+'</small>'+passive+'<em>'+(isOwned?'Owned':locked?'Requires level '+required:gold(x.cost))+'</em></span><b class="ash099-gear-action">'+label+'</b></button>';
  }
function buyGear(id,kind){
    const pl=p();if(!pl)return;
    const list=kind==='weapon'?D().weapons:D().armors,item=(list||[]).find(x=>x.id===id);
    if(!item||kind!=='weapon'&&kind!=='armor')return renderSmith();
    const level=Number(pl.level||1),required=Number(item.level||1),ownedMap=kind==='weapon'?(pl.ownedWeapons=pl.ownedWeapons||{}):(pl.ownedArmor=pl.ownedArmor||{});
    if(level<required&&!Number(ownedMap[id]||0))return note('You need level '+required+' to use '+item.name+'.');
    if(Number(ownedMap[id]||0)>0){
      if(kind==='weapon')pl.weapon=id;else pl.armor=id;
      save(pl);renderSmith(kind);note('Equipped '+item.name+'.');
      return;
    }
    if(Number(pl.gold||0)<Number(item.cost||0))return note('Not enough gold.');
    pl.gold-=Number(item.cost||0);ownedMap[id]=1;
    if(kind==='weapon')pl.weapon=id;else pl.armor=id;
    save(pl);renderSmith(kind);note('Purchased and equipped '+item.name+'.');
  }

  function renderSheet(){
    const pl=p(),assets=A(),items=assets.items||{},portrait=assets.classes?.[pl.className]||'';
    const inventoryEntries=Object.entries(pl.inventory||{}).filter(([,v])=>Number(v)>0);
    const inv=inventoryEntries.map(([k,v])=>{
      const art=itemIcon(k);
      return '<article class="ash099-inventory-item">'+(art?'<img src="'+esc(art)+'" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">':'<span class="ash099-item-placeholder" aria-hidden="true">✦</span>')+'<div class="ash099-inventory-item-copy"><strong>'+esc(itemName(k))+'</strong><small>In your pack</small></div><b>×'+Number(v)+'</b></article>';
    }).join('')||'<p class="ash099-inventory-empty">Your pack is light. The road may change that.</p>';
    const xp=Number(pl.xp||0),nextXp=Number(pl.level||1)*100;
    const weapon=(D().weapons||[]).find(w=>w.id===pl.weapon),armor=(D().armors||[]).find(a=>a.id===pl.armor);
    const equipment=(label,name,detail,art)=>'<article class="ash099-profile-equipment"><span class="ash099-eyebrow">'+label+'</span>'+(art?'<img src="'+esc(art)+'" alt="" aria-hidden="true" onerror="this.onerror=null;this.style.display=\'none\'">':'')+'<strong>'+esc(name)+'</strong><small>'+esc(detail)+'</small></article>';
    screen(head('Traveler',pl.username||'Traveler','Who you are, what you can endure, and what you carry beyond the lantern line.','','profile'),
      '<section class="ash099-traveler-profile">'+
        '<div class="ash099-traveler-profile-top">'+(portrait?'<img class="ash099-traveler-profile-portrait" src="'+esc(portrait)+'" alt="'+esc(pl.className||'Traveler')+'" onerror="this.onerror=null;this.style.display=\'none\'">':'')+
          '<div class="ash099-traveler-profile-identity"><span class="ash099-eyebrow">YOUR TRAVELER</span><h2>'+esc(pl.className||'Wanderer')+'</h2><p>'+esc(pl.personalityLabel||'Traveler')+' · '+esc(pl.origin||'Unknown origin')+'</p><p class="ash099-flavor">'+esc(pl.keepsake||'A life not yet written')+'</p></div>'+
          '<div class="ash099-traveler-profile-level"><span>LEVEL</span><strong>'+Number(pl.level||1)+'</strong><small>'+xp+' / '+nextXp+' XP</small><i><b style="width:'+Math.max(0,Math.min(100,Math.round(xp/Math.max(1,nextXp)*100)))+'%"></b></i></div></div>'+
        '<div class="ash099-traveler-vitals"><div class="ash099-vital-hp"><span>HEALTH</span><strong>'+Number(pl.hp||0)+' <small>/ '+Number(pl.maxHp||0)+'</small></strong><i><b style="width:'+hpPct(pl)+'%"></b></i></div><div><span>GOLD</span><strong>'+gold(pl.gold)+'</strong></div><div><span>ROAD TOKENS</span><strong>'+Number(pl.inventory?.roadToken||0)+' <small>/ 5</small></strong></div></div>'+
        '<div class="ash099-profile-equipment-grid">'+equipment('IN HAND',weapon?.name||weaponName(pl.weapon),weapon?'Damage '+weapon.min+'–'+weapon.max:'Basic attack',items.shortSword)+equipment('WORN',armor?.name||armorName(pl.armor),armor?'Defense '+armor.defense:'No protection',items.shield)+'</div>'+
        '<div class="ash099-traveler-detail-grid"><div><span>PRONOUNS</span><strong>'+esc(pl.pronouns||'they/them')+'</strong></div><div><span>HOME</span><strong>'+esc(pl.currentRegion||'Ashmere')+'</strong></div><div><span>TOWN WORK</span><strong>'+Number(pl.flags?.ashmereJobs||0)+' jobs</strong></div><div><span>ROAD PROOF</span><strong>'+Number(pl.inventory?.bellFragment||0)+' Bell Fragments</strong></div></div>'+
      '</section><section class="ash099-traveler-inventory"><div class="ash099-traveler-inventory-head"><div><span class="ash099-eyebrow">WHAT YOU CARRY</span><h2>Your Pack</h2></div><span>'+inventoryEntries.reduce((sum,[,v])=>sum+Number(v),0)+' items</span></div><div class="ash099-inventory-grid">'+inv+'</div></section>');
  }
  function renderArchive(){const pl=p();screen(head('Records',String(p()?.currentRegion||'Ashmere')==='Greyfen'?'Boundary Archive':'Archive Hall',String(p()?.currentRegion||'Ashmere')==='Greyfen'?'The bell keeper’s ledgers track the old boundary stones and drowned roads.':'Mara keeps records, maps, and town memory.',locationInterior('archive'),'archive'),`<div class="ash099-lines">${(pl.memories||[]).map(m=>`<p>${esc(m)}</p>`).join('')||'<p>No memories recorded yet. The road has not left enough ink on you.</p>'}</div>`);}
  function startRoad(){if(window.LegendRoadControllerV100?.start)return window.LegendRoadControllerV100.start();if(window.LegendRoadControllerV087?.start)return window.LegendRoadControllerV087.start();screen(head('Town Gate','Old Road','The road controller did not load.',roadBg(),'road'),'<p>Try a hard refresh.</p>');}
  function intercept(){const text=document.body?.innerText||'';if(/Ashmere Menu|Ashmere • First Town/.test(text)&&!document.querySelector('.ash099'))renderAshmere();}
  window.LegendAshmereV099={renderAshmere,route};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',intercept);else intercept();
  const rt=RT(); if(rt.onRender)rt.onRender(intercept);
})();