// LEGEND v0.20.38 - Ashmere hub service-art wiring
// Owns Ashmere directly: RPG town terminal, direct routes, no title reload for town returns.
(() => {
  const RT = () => window.LegendRuntimeV120 || {};
  const A = () => window.LegendAssetsV090 || {};
  const D = () => window.LEGEND_DATA || {};
  const root = () => document.getElementById('root');
  const esc = window.LegendHtmlV120.escapeHtml;
  const p = () => RT().loadPlayer?.() || null;
  const save = pl => RT().savePlayer?.(pl);
  const townAssets = window.LegendAshmereAssetsV099?.create({
    getAssets: A,
    getData: D,
    getPlayer: p,
    escapeHtml: esc
  }) || {};
  const img = townAssets.imageMarkup || (() => '');
  const itemIcon = townAssets.itemIcon || (() => '');
  const itemName = townAssets.itemName || (key => D().itemNames?.[key] || key);
  const gold = townAssets.gold || (amount => `${Number(amount || 0)}g`);
  const bg = townAssets.background || (() => '');
  const locationInterior = townAssets.locationInterior || (() => '');
  const roadBg = townAssets.roadBackground || (() => '');
  const npc = townAssets.npcArt || (() => '');
  const weaponName = townAssets.weaponName || (id => id || 'Hands');
  const armorName = townAssets.armorName || (id => id || 'None');
  const icon = townAssets.icon || (() => '');
  const regionShopArt = townAssets.regionShopArt || (() => '');
  const armorArt = townAssets.armorArt || (() => '');
  const serviceArt = townAssets.serviceArt || ((key, fallback = '') => fallback);
  const townView = window.LegendAshmereViewV099?.create({
    root,
    getPlayer: p,
    escapeHtml: esc,
    imageMarkup: img,
    icon,
    renderTown: renderAshmere,
    bindNavigation: bind
  });
  function unavailableTownView(){
    const host = root();
    if (host) host.innerHTML = '<main class="ash099 ash099-terminal"><div class="ash099-wrap"><section class="ash099-screen"><h1>Town screens are unavailable</h1><p>The shared town view module did not load. Refresh before continuing.</p></section></div></main>';
  }
  function shell(html){
    if (townView?.shell) return townView.shell(html);
    unavailableTownView();
  }
  function hpPct(pl){ return Math.max(0, Math.min(100, Math.round((Number(pl.hp || 0) / Math.max(1, Number(pl.maxHp || 1))) * 100))); }
  function owned(pl, k){ return Number(pl.inventory?.[k] || 0); }

  function setBellQuestObjective(pl, objective){
    const questLog=window.LegendQuestLogV120;
    if(typeof questLog?.setBellQuestObjective!=='function'){
      throw new Error('LegendQuestLogV120 must load before Ashmere town features.');
    }
    return questLog.setBellQuestObjective(pl,objective);
  }

  function canAfford(pl, cost){ return Number(pl.gold || 0) >= Number(cost || 0); }
  function canCraft(pl, needs){ return needs.every(([k,v]) => owned(pl,k) >= Number(v || 0)); }
  function needsMarkup(pl, needs){ return needs.map(([k,v])=>{const art=itemIcon(k);return '<span class="ash099-craft-ingredient">'+(art?'<img src="'+esc(art)+'" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">':'')+'<span>'+Number(v)+' '+esc(itemName(k))+' <small>('+owned(pl,k)+')</small></span></span>';}).join(''); }
  function note(msg){ const n = document.getElementById('ashNote'); if(n){ n.style.display='block'; n.textContent=msg; } }

  function renderAshmere(){
    const hub = window.LegendAshmereHubV099;
    if (hub?.render) {
      return hub.render({
        getPlayer: p,
        escapeHtml: esc,
        gold,
        background: bg,
        imageMarkup: img,
        regionShopArt,
        serviceArt,
        icon,
        shell,
        bind
      });
    }
    const host = root();
    if (host) host.innerHTML = '<main class="ash099 ash099-terminal"><div class="ash099-wrap"><section class="ash099-screen"><h1>Ashmere is unavailable</h1><p>The town hub did not load. Refresh before continuing.</p></section></div></main>';
  }
  function feature(name, ...args){
    const render = townFeatures?.[name];
    if (typeof render === 'function') return render(...args);
    screen(head('Town Systems', 'Town Screen Unavailable', 'The feature router did not load. Refresh before continuing.', bg(), 'notice'),
      '<p>This town screen is unavailable. Return to the title and refresh before retrying.</p>');
  }
  function bind(){ document.querySelectorAll('[data-ash-view]').forEach(b => b.onclick = () => route(b.dataset.ashView)); }
  function route(v){
    if (townNavigation?.route) return townNavigation.route(v);
    return renderAshmere();
  }
  function back(extra = ''){ return townView?.back?.(extra) || ''; }
  function head(k,t,d,im='',fallbackIcon='quest'){ return townView?.head?.(k,t,d,im,fallbackIcon) || ''; }
  function screen(h,b,extra=''){
    if (townView?.screen) return townView.screen(h,b,extra);
    unavailableTownView();
  }

  function renderRoutes(){
    const routeBoard=window.LegendAshmereRoutesV099;
    if(routeBoard?.render){
      return routeBoard.render({
        getPlayer:p,
        head,
        screen,
        locationInterior,
        background:bg,
        icon
      });
    }
    screen(
      head('Route Board','Routes & Expeditions','The route board did not load. Return to town and refresh before trying again.',bg(),'route'),
      '<p>Routes are unavailable. Refresh before continuing.</p>'
    );
  }

  const townFeatures = window.LegendAshmereFeaturesV099?.create({
    getPlayer: p,
    savePlayer: save,
    getAssets: A,
    getData: D,
    escapeHtml: esc,
    imageMarkup: img,
    background: bg,
    npcArt: npc,
    npcCatalog: window.LegendAshmereNpcCatalogV099?.create({ npcArt: npc }),
    npcStory: window.LegendAshmereNpcStoryV099?.create({
      greyfenEvidenceStory: window.LegendAshmereGreyfenEvidenceStoryV099,
      firstRoadReturnDialogue: window.LegendAshmereFirstRoadReturnDialogueV099
    }),
    renderRegions: () => {
      const regions = window.LegendRegionsV100;
      if (typeof regions?.render === 'function') return regions.render();
      return renderAshmere();
    },
    setBellQuestObjective,
    note,
    head,
    screen,
    locationInterior,
    renderTown: renderAshmere,
    awardProgress: (player, amount) => window.LegendProgressionV100?.award(player, amount),
    getProgressionStatus: player => window.LegendProgressionV100?.status(player),
    gold,
    serviceArt,
    icon,
    itemName,
    itemIcon,
    canAfford,
    owned,
    canCraft,
    needsMarkup,
    armorArt,
    weaponName,
    armorName,
    regionShopArt,
    hpPct
  }) || {};
  const townNavigation = window.LegendAshmereNavigationV099?.create({
    renderHome: renderAshmere,
    renderFeature: feature,
    renderNPC: id => feature('renderNPC', id),
    renderRoutes,
    renderRoad: startRoad,
    renderRegions: () => {
      const regions = window.LegendRegionsV100;
      if (typeof regions?.render === 'function') return regions.render();
      return renderAshmere();
    },
    renderProfile: () => {
      const account = window.LegendAccountV09x;
      if (typeof account?.renderAccount === 'function') return account.renderAccount();
      return renderAshmere();
    },
    renderMarsh: () => {
      const marsh = window.LegendGreyfenMarshV160;
      if (typeof marsh?.start === 'function') return marsh.start();
      return renderAshmere();
    }
  });

  function renderDeparture(){
    const pl=p();
    if(!pl)return renderAshmere();
    if(String(pl.currentRegion||'Ashmere')!=='Ashmere'){
      return window.LegendRoadControllerV100?.start?.();
    }
    const data=D(),invn=pl.inventory||{},flags=pl.flags||{};
    const health=hpPct(pl),hp=Number(pl.hp||0),maxHp=Math.max(1,Number(pl.maxHp||1));
    const weapon=(data.weapons||[]).find(item=>item.id===pl.weapon)||{name:weaponName(pl.weapon)};
    const baseArmor=(data.armors||[]).find(item=>item.id===pl.armor)||{name:armorName(pl.armor),defense:0};
    const buckle=flags.bellVaultV100?.reinforcedBuckleEquipped===true;
    const armorLabel=(baseArmor.name||armorName(pl.armor))+(buckle?' + Reinforced Buckle':'');
    const defense=Number(baseArmor.defense||0)+(buckle?6:0);
    const food=owned(pl,'food'),camp=owned(pl,'camp'),potions=owned(pl,'potion');
    const herbs=owned(pl,'roadHerb'),cloth=owned(pl,'clothScrap');
    const trip=Number(flags.roadExpeditionV100?.trips||0)+1;
    const notices=[];
    if(health<65)notices.push(health<40
      ?'Your health is critically low. The Inn can restore you before you leave.'
      :'Your health is low. Consider resting at the Inn before you leave.');
    if(food+camp===0)notices.push('You have no food or camp supplies. A waystation rest will not be available until you find or buy supplies.');
    if(potions===0&&!(herbs>0&&cloth>0))notices.push('You carry no healing potion and lack the full materials to craft one. Check the Workbench if you can.');
    const adviceMarkup=notices.length
      ?'<ul>'+notices.map(line=>'<li>'+esc(line)+'</li>').join('')+'</ul>'
      :'<p>Your current kit is serviceable for the road. There is no penalty for checking town services before departure.</p>';
    const adviceTitle=notices.length?(notices.length+' thing'+(notices.length===1?'':'s')+' worth knowing'):'No urgent supply concerns';
    const narrative=flags.firstRoadReturnSeen
      ?'You have walked this road before. The trail will still test your pace, your preparation, and the choices you make at its first fork.'
      :'The lanterns at the gate are still in sight. Beyond them, every mark you record and every choice you make can become evidence for Ashmere.';

    const orderEntry=(Array.isArray(pl.questLog)?pl.questLog:[])
      .filter(item=>typeof item==='string'&&item.startsWith('The Bell That Rang Once:')).slice(-1)[0]||'';
    const orderText=orderEntry?orderEntry.slice('The Bell That Rang Once:'.length).trim():'';
    const orderMarkup=orderText
      ?'<section class="ash100-departure-order" aria-label="Current field order"><span class="ash100-departure-label">OPEN FIELD ORDER</span><strong>The Bell That Rang Once</strong><p>'+esc(orderText)+'</p></section>'
      :'';
    const minDamage=Number(weapon.min),maxDamage=Number(weapon.max);
    const force=Number.isFinite(minDamage)&&Number.isFinite(maxDamage)
      ?minDamage+'–'+maxDamage+' force':'Current weapon';
    const body=
      '<section class="ash100-departure" aria-label="Expedition departure briefing">'+
        '<div class="ash100-departure-intro"><span class="ash099-kicker">BEFORE THE MIST · TRIP '+trip+'</span><h2>Take one last look at what you carry.</h2><p>'+esc(narrative)+'</p></div>'+
        orderMarkup+
        '<div class="ash100-departure-grid">'+
          '<section class="ash100-departure-card ash100-departure-vitals" aria-label="Traveler condition">'+
            '<span class="ash100-departure-label">TRAVELER CONDITION</span>'+
            '<div class="ash100-departure-healthline"><strong>'+esc(pl.username||'Traveler')+'</strong><span>Level '+Number(pl.level||1)+' · '+esc(pl.className||'Wanderer')+'</span></div>'+
            '<div class="ash100-departure-healthbar"><i style="width:'+health+'%"></i></div>'+
            '<div class="ash100-departure-healthcopy" id="departureHealth"><span>Health</span><strong>'+hp+' / '+maxHp+' · '+health+'%</strong></div>'+
            '<p>'+(health<40?'Every wound will matter if the road turns hostile.':health<65?'You are able to travel, but a little recovery would help.':'Your footing is steady enough to begin.')+'</p>'+
          '</section>'+
          '<section class="ash100-departure-card ash100-departure-loadout" aria-label="Equipped loadout">'+
            '<span class="ash100-departure-label">EQUIPPED LOADOUT</span>'+
            '<div class="ash100-departure-equipment"><span class="ash100-departure-token" aria-hidden="true">⚔</span><div><small>WEAPON</small><strong>'+esc(weapon.name||weaponName(pl.weapon))+'</strong><em>'+esc(force)+'</em></div></div>'+
            '<div class="ash100-departure-equipment"><span class="ash100-departure-token" aria-hidden="true">⬡</span><div><small>ARMOR & DEFENSE</small><strong>'+esc(armorLabel)+'</strong><em>'+defense+' defense'+(buckle?' · Reinforced Buckle active':'')+'</em></div></div>'+
          '</section>'+
          '<section class="ash100-departure-card ash100-departure-supplies" aria-label="Field supplies">'+
            '<span class="ash100-departure-label">FIELD SUPPLIES</span>'+
            '<div class="ash100-departure-supply"><span>Rations</span><strong>'+food+'</strong></div>'+
            '<div class="ash100-departure-supply"><span>Camp supplies</span><strong>'+camp+'</strong></div>'+
            '<div class="ash100-departure-supply"><span>Healing potions</span><strong>'+potions+'</strong></div>'+
            '<div class="ash100-departure-supply"><span>Road herbs · Cloth</span><strong>'+herbs+' · '+cloth+'</strong></div>'+
          '</section>'+
        '</div>'+
        '<section class="ash100-departure-advice '+(notices.length?'has-advice':'is-ready')+'" id="departureAdvice" aria-live="polite"><div><span class="ash100-departure-label">BEFORE YOU GO</span><strong>'+esc(adviceTitle)+'</strong></div>'+adviceMarkup+'</section>'+
        '<section class="ash100-departure-fork" aria-label="First route preview"><div><span class="ash100-departure-label">AT SOUTH FORK</span><strong>Two ways into the mist</strong><p>The route itself is chosen once you reach the first marker.</p></div><article><b>High Ridge</b><span>Firm ground and a safer opening.</span></article><article><b>Reed Cut</b><span>Riskier lowland trail; the marsh may yield a Bell Fragment.</span></article></section>'+
        '<div class="ash100-departure-actions"><button class="ash099-btn primary ash100-departure-launch" type="button" id="departureBegin" data-legend-scene-transition="Leaving Ashmere for the Old Road"><span aria-hidden="true">➜</span><strong>Set Out on the Old Road</strong><small>Begin trip '+trip+' · Your choices are yours to make.</small></button><div class="ash100-departure-shortcuts"><button type="button" class="ash099-btn" id="departureInn" data-ash-view="inn">Stock up at the Inn</button><button type="button" class="ash099-btn" id="departureForge" data-ash-view="smith">Check gear at the Forge</button><button type="button" class="ash099-btn" id="departureWorkbench" data-ash-view="craft">Use the Workbench</button></div></div>'+
      '</section>';
    screen(head('EXPEDITION DEPARTURE','The Old Road','The gate is open. Take stock, prepare if needed, then choose when to leave.',roadBg(),'road'),body);
    document.getElementById('departureBegin')?.addEventListener('click',()=>{
      const controller=window.LegendRoadControllerV100;
      if(typeof controller?.start==='function')controller.start();
      else screen(head('Town Gate','Old Road','The expedition system could not load.',roadBg(),'road'),'<p>The expedition system did not load. Return to town and refresh before trying again.</p>');
    });
  }
  function startRoad(){
    const controller=window.LegendRoadControllerV100;
    if(typeof controller?.start!=='function'){
      return screen(head('Town Gate','Old Road','The expedition system could not load.',roadBg(),'road'),'<p>Return to the title and refresh before trying again.</p>');
    }
    const player=p();
    if(String(player?.currentRegion||'Ashmere')!=='Ashmere')return controller.start();
    return renderDeparture();
  }
  window.LegendAshmereV099={renderAshmere,route};
})();