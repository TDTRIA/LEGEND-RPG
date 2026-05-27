// LEGEND v0.9.4 - Town Controller
// Polished Ashmere hub with tutorial guidance, grouped menus, art background, and safer old-system handoffs.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const TOWNS = () => window.LegendTownsV080 || {};
  const ASSETS = () => window.LegendAssetsV090 || {};
  const ROOT_ID = 'legendTownV080';

  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function player(){return RT()?.loadPlayer?.() || null;}
  function save(p){RT()?.savePlayer?.(p);}

  function icon(type){
    const map = {
      gate:'<svg viewBox="0 0 24 24"><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-8h6v8"/><path d="M5 11h14"/></svg>',
      people:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c1-4 4-6 7-6s6 2 7 6"/></svg>',
      pub:'<svg viewBox="0 0 24 24"><path d="M7 3h10l-1 8a4 4 0 0 1-8 0L7 3Z"/><path d="M12 15v6"/><path d="M8 21h8"/></svg>',
      inn:'<svg viewBox="0 0 24 24"><path d="M4 11h16v8"/><path d="M4 19V7"/><path d="M8 11V8h5a3 3 0 0 1 3 3"/></svg>',
      trade:'<svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M5 7h14"/><path d="M7 7l-4 7h8L7 7Z"/><path d="M17 7l-4 7h8l-4-7Z"/></svg>',
      weapon:'<svg viewBox="0 0 24 24"><path d="M14 4l6 6-9 9-4-4 9-9Z"/><path d="M5 17l2 2-3 3-2-2 3-3Z"/></svg>',
      armor:'<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/></svg>',
      archive:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>',
      ledger:'<svg viewBox="0 0 24 24"><path d="M4 19h16"/><path d="M6 19V8l6-4 6 4v11"/><path d="M9 12h6"/></svg>',
      commons:'<svg viewBox="0 0 24 24"><path d="M12 21C8 16 5 12 5 8a7 7 0 0 1 14 0c0 4-3 8-7 13Z"/><path d="M9 9h6"/></svg>',
      craft:'<svg viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M7 20V9l5-5 5 5v11"/><path d="M9 13h6"/><path d="M10 17h4"/></svg>',
      node:'<svg viewBox="0 0 24 24"><path d="M12 3l8 9-8 9-8-9 8-9Z"/></svg>'
    };
    return map[type] || map.node;
  }

  function statusHTML(p){
    return `<div class="v080-town-status"><div><span>Traveler</span><strong>${esc(p?.username || 'Unknown')}</strong></div><div><span>Identity</span><strong>${esc(p?.personalityLabel || 'Traveler')}</strong></div><div><span>Gold</span><strong>${Number(p?.gold||0)}g</strong></div><div><span>Road Proof</span><strong>${Number(p?.inventory?.roadToken||0)}/3 Tokens</strong></div><div><span>HP</span><strong>${Number(p?.hp||0)}/${Number(p?.maxHp||0)}</strong></div><div><span>Town Trust</span><strong>${Number(p?.townTrust?.Ashmere||0)}</strong></div></div>`;
  }

  function accessLabel(loc){
    const a = loc.access || {kind:'open'};
    if(a.kind === 'open') return 'Open';
    if(a.kind === 'soft') return 'Open - useful now';
    return a.label || 'Conditioned access';
  }
  function groupFor(loc){
    if(['people','archive','ledger'].includes(loc.id)) return 'People & Story';
    if(['inn','market','smith','armorer','crafting'].includes(loc.id)) return 'Services & Supplies';
    if(['gate'].includes(loc.id)) return 'Travel';
    return 'Town Life';
  }
  function tutorial(p){
    if(!p) return {id:'people',title:'First step: meet Ashmere',text:'Start in the Town Square. Talk to Mara, Brenn, and Oric before testing the Old Road.'};
    const tokens=Number(p.inventory?.roadToken||0);
    if(!p.flags?.talkedToMara) return {id:'people',title:'First step: meet Ashmere',text:'Go to the Town Square and talk to Mara. She gives the Old Road a reason to matter.'};
    if(!p.flags?.firstRoadEvent) return {id:'inn',title:'Prepare before travel',text:'Rest, check supplies, then head for the Town Gate when you are ready.'};
    if(tokens<3) return {id:'gate',title:'Bring back road proof',text:`You have ${tokens}/3 Road Tokens. Travel the Old Road, survive, and return with proof.`};
    return {id:'ledger',title:'Turn in your proof',text:'You have enough Road Tokens. Visit the Ledger Hall or speak with Brenn to move the town loop forward.'};
  }
  function sectionOrder(name){return {'People & Story':1,'Services & Supplies':2,'Travel':3,'Town Life':4}[name]||9;}

  function renderTown(townId='ashmere'){
    const town = TOWNS()[townId];
    if(!town) return;
    const p = player();
    const tip = tutorial(p);
    const root = document.getElementById('root');
    const groups = {};
    town.locations.forEach(loc=>{const g=groupFor(loc);(groups[g]=groups[g]||[]).push(loc);});
    const groupHTML = Object.keys(groups).sort((a,b)=>sectionOrder(a)-sectionOrder(b)).map(name=>`<div class="v094-town-section"><h4>${esc(name)}</h4><div class="v094-town-section-grid">${groups[name].map(loc=>cardHTML(loc,tip)).join('')}</div></div>`).join('');
    root.innerHTML = `<div class="shell"><section class="panel v094-town-polish"><div id="${ROOT_ID}" class="v080-town-shell"><div class="v080-town-hero"><img class="v094-town-bg" src="${esc(ASSETS().locations?.ashmereMain||'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg')}" alt="" onerror="this.style.display='none'"><div class="v094-town-shade"></div><div class="v094-town-hero-inner"><div><div class="v080-kicker">LEGEND v0.9.4 • First-Town Tutorial</div><h3>${esc(town.name)}</h3><p>${esc(town.description)}</p><p><strong>${esc(town.subtitle)}</strong> - ${esc(town.mood)}</p></div>${statusHTML(p)}<div class="v094-town-guide"><strong>${esc(tip.title)}</strong><p>${esc(tip.text)}</p></div></div></div>${groupHTML}<div class="actions"><button class="btn primary v094-tutorial-pulse" id="townRecommended">Recommended: ${esc(recommendedLabel(town,tip.id))}</button><button class="btn" id="townSheetQuick">Character Sheet</button><button class="btn" id="townRoadQuick">Travel the Old Road</button></div></div></section></div>`;
    document.querySelectorAll('[data-town-location]').forEach(btn => btn.onclick = () => renderLocation(townId, btn.dataset.townLocation));
    document.getElementById('townRecommended').onclick = () => renderLocation(townId, tip.id);
    document.getElementById('townRoadQuick').onclick = () => triggerLegacy('Explore The First Road');
    document.getElementById('townSheetQuick').onclick = () => triggerLegacy('Character Sheet');
  }

  function recommendedLabel(town,id){return town.locations.find(l=>l.id===id)?.name || 'Town Square';}
  function cardHTML(loc,tip){
    const rec = loc.id === tip.id;
    return `<button class="v080-town-card ${loc.access?.kind==='open'?'':'locked'} ${rec?'recommended v094-tutorial-pulse':''}" data-town-location="${esc(loc.id)}"><span class="v080-town-icon">${icon(loc.icon)}</span><span><strong>${esc(loc.name)}</strong><small>${esc(loc.short)}</small><em>${esc(accessLabel(loc))}</em>${rec?`<small class="v094-town-tip">${esc(tip.text)}</small>`:''}</span></button>`;
  }

  function renderLocation(townId, locId){
    const town = TOWNS()[townId];
    const loc = town?.locations?.find(l=>l.id===locId);
    if(!town || !loc) return renderTown(townId);
    const access = loc.access || {kind:'open'};
    const root = document.getElementById('root');
    root.innerHTML = `<div class="shell"><section class="panel v094-town-polish"><div class="v080-town-shell"><div class="v094-town-location-layout"><div class="v080-location-panel"><div class="v080-location-head"><span class="v080-town-icon">${icon(loc.icon)}</span><div><div class="v080-kicker">${esc(town.name)}</div><h3>${esc(loc.name)}</h3><p>${esc(loc.description)}</p></div></div><div class="v080-access"><strong>${esc(accessLabel(loc))}</strong><span>${esc(access.hint || 'This location is available.')}</span></div><div class="v080-town-actions">${(loc.actions||[]).map(a=>`<button class="v080-town-action" data-town-action="${esc(a.id)}"><strong>${esc(a.label)}</strong><small>${esc(actionHelp(a))}</small></button>`).join('')}</div><div id="townNote" class="v080-town-note" style="display:none"></div><div class="actions"><button class="btn primary" id="backTown">Back to ${esc(town.name)}</button><button class="btn" id="backTitleSafe">Save / Title</button></div></div><aside class="v094-location-help"><strong>${esc(locationHelpTitle(loc))}</strong><p>${esc(locationHelpText(loc))}</p></aside></div></div></section></div>`;
    document.querySelectorAll('[data-town-action]').forEach(btn => {
      const action = loc.actions.find(a=>a.id===btn.dataset.townAction);
      btn.onclick = () => runAction(action, townId, locId);
    });
    document.getElementById('backTown').onclick = () => renderTown(townId);
    document.getElementById('backTitleSafe').onclick = () => location.reload();
  }

  function locationHelpTitle(loc){
    if(loc.id==='people') return 'Tutorial: talk first';
    if(loc.id==='inn'||loc.id==='market'||loc.id==='smith'||loc.id==='armorer') return 'Tutorial: prepare';
    if(loc.id==='gate') return 'Tutorial: travel when ready';
    if(loc.id==='ledger') return 'Tutorial: turn in proof';
    return 'Ashmere note';
  }
  function locationHelpText(loc){
    if(loc.id==='people') return 'NPCs explain the town, the Old Road, and what counts as progress. This should be the first stop for new travelers.';
    if(loc.id==='inn') return 'Rest if you are hurt. A prepared traveler should check HP and supplies before leaving town.';
    if(loc.id==='market') return 'Supplies and sellable road goods matter. Potions and food keep the first loop readable.';
    if(loc.id==='smith'||loc.id==='armorer') return 'Gear makes road combat safer. Better upgrades will unlock as Ashmere trust grows.';
    if(loc.id==='gate') return 'The Old Road is the first adventure loop. Go out, survive a few events, then come back to Ashmere.';
    if(loc.id==='ledger') return 'Road Tokens and Bell Fragments should come back here once you have proof.';
    return loc.short || 'Look around, learn the town, and return when the road changes things.';
  }

  function actionHelp(a){
    if(a.kind === 'legacy') return 'Open this active Ashmere system.';
    if(a.kind === 'road') return 'Leave town and travel the Old Road.';
    if(a.kind === 'coming') return a.text || 'Planned for a coming patch.';
    return a.text || 'Look closer.';
  }

  function runAction(action, townId, locId){
    if(!action) return;
    const p = player();
    if(p){
      p.flags = p.flags || {};
      if(locId === 'people') p.flags.tutorialStep = 'prepare';
      if(['inn','market','smith','armorer'].includes(locId) && p.flags.talkedToMara) p.flags.tutorialStep = 'road';
      save(p);
    }
    if(action.kind === 'legacy') return triggerLegacy(action.match);
    if(action.kind === 'road') return triggerLegacy('Explore The First Road');
    const note = document.getElementById('townNote');
    if(note){ note.style.display = 'block'; note.textContent = action.text || 'Nothing else happens yet.'; }
  }

  function triggerLegacy(match){
    const oldGrid = document.querySelector('.grid');
    const cards = oldGrid ? [...oldGrid.querySelectorAll('.card')] : [...document.querySelectorAll('.card')];
    const target = cards.find(c => (c.textContent || '').toLowerCase().includes(String(match).toLowerCase()));
    if(target){ target.click(); return true; }
    const rt = RT();
    if(rt?.returnToAshmere) rt.returnToAshmere();
    return false;
  }

  function maybeReplaceAshmere(){
    const title = [...document.querySelectorAll('h2')].find(h => h.textContent.trim() === 'Ashmere Menu');
    if(!title || document.getElementById(ROOT_ID)) return;
    const panel = title.closest('.panel');
    const oldGrid = panel?.querySelector('.grid');
    if(!panel || !oldGrid) return;
    panel.style.display = 'none';
    renderTown('ashmere');
  }

  window.LegendTownControllerV080 = { renderTown, renderLocation };
  const rt = RT();
  if(rt?.onRender) rt.onRender(maybeReplaceAshmere);
  else if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybeReplaceAshmere);
  else maybeReplaceAshmere();
})();