// LEGEND v0.9.5 - Town Controller
// Cleaner Ashmere hub with compact header, objective strip, and no wasted portrait/sidebar space.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const TOWNS = () => window.LegendTownsV080 || {};
  const ASSETS = () => window.LegendAssetsV090 || {};
  const ROOT_ID = 'legendTownV080';

  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function player(){return RT()?.loadPlayer?.() || null;}
  function save(p){RT()?.savePlayer?.(p);}

  function statusPills(p){
    return `<div class="v094-town-pills"><span class="v094-town-pill"><strong>${esc(p?.username || 'Traveler')}</strong><em>${esc(p?.className || 'Wanderer')}</em></span><span class="v094-town-pill"><strong>${Number(p?.hp||0)}/${Number(p?.maxHp||0)} HP</strong><em>Health</em></span><span class="v094-town-pill"><strong>${Number(p?.gold||0)}g</strong><em>Gold</em></span><span class="v094-town-pill"><strong>${Number(p?.inventory?.roadToken||0)}/3</strong><em>Road Tokens</em></span><span class="v094-town-pill"><strong>${esc(p?.personalityLabel || 'Traveler')}</strong><em>Traveler Style</em></span></div>`;
  }

  function accessLabel(loc){
    const a = loc.access || {kind:'open'};
    if(a.kind === 'open') return 'Open';
    if(a.kind === 'soft') return 'Useful now';
    return a.label || 'Conditioned';
  }
  function groupFor(loc){
    if(['people','archive','ledger'].includes(loc.id)) return 'People & Story';
    if(['inn','market','smith','armorer','crafting'].includes(loc.id)) return 'Services & Supplies';
    if(['gate'].includes(loc.id)) return 'Travel';
    return 'Town Life';
  }
  function tutorial(p){
    if(!p) return {id:'people',title:'Start in Town Square',text:'Talk to Mara first, then prepare before you travel.',cta:'Go to Town Square'};
    const tokens=Number(p.inventory?.roadToken||0);
    if(!p.flags?.talkedToMara) return {id:'people',title:'Start in Town Square',text:'Talk to Mara first. She gives the Old Road a reason to matter.',cta:'Go to Town Square'};
    if(!p.flags?.firstRoadEvent) return {id:'inn',title:'Prepare before travel',text:'Rest if needed, buy supplies, then head to the gate.',cta:'Prepare in Town'};
    if(tokens<3) return {id:'gate',title:'Bring back proof',text:`You have ${tokens}/3 Road Tokens. Survive the Old Road and return with more.`,cta:'Travel the Old Road'};
    return {id:'ledger',title:'Turn in your proof',text:'You have enough Road Tokens. Visit the Ledger Hall or speak with Brenn.',cta:'Visit Ledger Hall'};
  }
  function sectionOrder(name){return {'People & Story':1,'Services & Supplies':2,'Travel':3,'Town Life':4}[name]||9;}
  function recommendedLabel(town,id){return town.locations.find(l=>l.id===id)?.name || 'Town Square';}

  function renderTown(townId='ashmere'){
    const town = TOWNS()[townId];
    if(!town) return;
    const p = player();
    const tip = tutorial(p);
    const root = document.getElementById('root');
    const groups = {};
    town.locations.forEach(loc=>{const g=groupFor(loc);(groups[g]=groups[g]||[]).push(loc);});
    const groupHTML = Object.keys(groups).sort((a,b)=>sectionOrder(a)-sectionOrder(b)).map(name=>`<div class="v094-town-section"><h4>${esc(name)}</h4><div class="v094-town-section-grid">${groups[name].map(loc=>cardHTML(loc,tip)).join('')}</div></div>`).join('');
    root.innerHTML = `<div class="shell"><section class="panel v094-town-polish"><div id="${ROOT_ID}" class="v080-town-shell"><div class="v094-town-top"><img class="v094-town-bg" src="${esc(ASSETS().locations?.ashmereMain||'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg')}" alt="" onerror="this.style.display='none'"><div class="v094-town-shade"></div><div class="v094-town-top-inner"><div class="v094-town-heading"><div class="v080-kicker">Ashmere • First Town</div><h3>${esc(town.name)}</h3><p>${esc(town.description)}</p></div>${statusPills(p)}</div></div><div class="v094-town-objective"><div><span>Current Goal</span><strong>${esc(tip.title)}</strong><p>${esc(tip.text)}</p></div><button class="btn primary" id="townRecommended">${esc(tip.cta || ('Go to ' + recommendedLabel(town,tip.id)))}</button></div>${groupHTML}<div class="actions v094-town-bottom-actions"><button class="btn" id="townSheetQuick">Character Sheet</button><button class="btn" id="townRoadQuick">Travel the Old Road</button></div></div></section></div>`;
    document.querySelectorAll('[data-town-location]').forEach(btn => btn.onclick = () => renderLocation(townId, btn.dataset.townLocation));
    document.getElementById('townRecommended').onclick = () => renderLocation(townId, tip.id);
    document.getElementById('townRoadQuick').onclick = () => triggerLegacy('Explore The First Road');
    document.getElementById('townSheetQuick').onclick = () => triggerLegacy('Character Sheet');
  }

  function cardHTML(loc,tip){
    const rec = loc.id === tip.id;
    return `<button class="v080-town-card v094-town-card-clean ${loc.access?.kind==='open'?'':'locked'} ${rec?'recommended':''}" data-town-location="${esc(loc.id)}"><span><strong>${esc(loc.name)}</strong><small>${esc(loc.short)}</small><em>${esc(accessLabel(loc))}</em></span>${rec?'<span class="v094-town-chip">Recommended</span>':''}</button>`;
  }

  function renderLocation(townId, locId){
    const town = TOWNS()[townId];
    const loc = town?.locations?.find(l=>l.id===locId);
    if(!town || !loc) return renderTown(townId);
    const access = loc.access || {kind:'open'};
    const root = document.getElementById('root');
    root.innerHTML = `<div class="shell"><section class="panel v094-town-polish"><div class="v080-town-shell"><div class="v080-location-panel v094-location-single"><div class="v080-location-head"><div><div class="v080-kicker">${esc(town.name)}</div><h3>${esc(loc.name)}</h3><p>${esc(loc.description)}</p></div></div><div class="v080-access"><strong>${esc(accessLabel(loc))}</strong><span>${esc(locationHelpText(loc))}</span></div><div class="v080-town-actions">${(loc.actions||[]).map(a=>`<button class="v080-town-action" data-town-action="${esc(a.id)}"><strong>${esc(a.label)}</strong><small>${esc(actionHelp(a))}</small></button>`).join('')}</div><div id="townNote" class="v080-town-note" style="display:none"></div><div class="actions"><button class="btn primary" id="backTown">Back to ${esc(town.name)}</button><button class="btn" id="backTitleSafe">Save / Title</button></div></div></div></section></div>`;
    document.querySelectorAll('[data-town-action]').forEach(btn => {
      const action = loc.actions.find(a=>a.id===btn.dataset.townAction);
      btn.onclick = () => runAction(action, townId, locId);
    });
    document.getElementById('backTown').onclick = () => renderTown(townId);
    document.getElementById('backTitleSafe').onclick = () => location.reload();
  }

  function locationHelpText(loc){
    if(loc.id==='people') return 'Talk to the townsfolk first. This is the best place to get your bearings in Ashmere.';
    if(loc.id==='inn') return 'Rest if you are hurt. A prepared traveler checks health before heading out.';
    if(loc.id==='market') return 'Supplies matter. Potions and food make the first road loop feel fair.';
    if(loc.id==='smith'||loc.id==='armorer') return 'Gear makes the Old Road safer. Better upgrades can come later.';
    if(loc.id==='gate') return 'The Old Road is the main first-loop adventure. Go out, survive, and return.';
    if(loc.id==='ledger') return 'Bring Road Tokens and findings back here when you are ready to prove yourself.';
    return loc.short || 'Look around, learn the town, and return when the road changes things.';
  }

  function actionHelp(a){
    if(a.kind === 'legacy') return 'Open this active Ashmere system.';
    if(a.kind === 'road') return 'Leave town and travel the Old Road.';
    if(a.kind === 'coming') return a.text || 'Planned for a later patch.';
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
    if(note){ note.style.display = 'block'; note.textContent = action.text || 'Nothing else happens here yet.'; }
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