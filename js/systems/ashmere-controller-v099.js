// LEGEND v0.9.x - Ashmere Town Hub Controller
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
    }
  });
  function startRoad(){if(window.LegendRoadControllerV100?.start)return window.LegendRoadControllerV100.start();screen(head('Town Gate','Old Road','The expedition system could not load.',roadBg(),'road'),'<p>Return to the title and refresh before trying again.</p>');}
  function intercept(){const text=document.body?.innerText||'';if(/Ashmere Menu|Ashmere • First Town/.test(text)&&!document.querySelector('.ash099'))renderAshmere();}
  window.LegendAshmereV099={renderAshmere,route};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',intercept);else intercept();
  const rt=RT(); if(rt.onRender)rt.onRender(intercept);
})();