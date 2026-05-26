// LEGEND v0.8.4 - Town Controller
// Renders Ashmere as an explorable town framework using content data.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const TOWNS = () => window.LegendTownsV080 || {};
  const ROOT_ID = 'legendTownV080';

  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function player(){return RT()?.loadPlayer?.() || null;}

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
    return `<div class="v080-town-status"><div><span>Traveler</span><strong>${esc(p?.username || 'Unknown')}</strong></div><div><span>Gold</span><strong>${Number(p?.gold||0)}g</strong></div><div><span>Road Proof</span><strong>${Number(p?.inventory?.roadToken||0)}/3 Tokens</strong></div><div><span>Town Trust</span><strong>${Number(p?.townTrust?.Ashmere||0)}</strong></div></div>`;
  }

  function accessLabel(loc){
    const a = loc.access || {kind:'open'};
    if(a.kind === 'open') return 'Open';
    if(a.kind === 'soft') return 'Open - deeper services locked';
    return a.label || 'Conditioned access';
  }

  function renderTown(townId='ashmere'){
    const town = TOWNS()[townId];
    if(!town) return;
    const p = player();
    const root = document.getElementById('root');
    root.innerHTML = `<div class="shell"><section class="panel"><div id="${ROOT_ID}" class="v080-town-shell"><div class="v080-town-hero"><div><div class="v080-kicker">LEGEND v0.8.4 Town Framework</div><h3>${esc(town.name)}</h3><p>${esc(town.description)}</p><p><strong>${esc(town.subtitle)}</strong> - ${esc(town.mood)}</p></div>${statusHTML(p)}</div><div class="v080-town-grid">${town.locations.map(loc=>`<button class="v080-town-card ${loc.access?.kind==='open'?'':'locked'}" data-town-location="${esc(loc.id)}"><span class="v080-town-icon">${icon(loc.icon)}</span><span><strong>${esc(loc.name)}</strong><small>${esc(loc.short)}</small><em>${esc(accessLabel(loc))}</em></span></button>`).join('')}</div><div class="actions"><button class="btn primary" id="townRoadQuick">Travel the Old Road</button><button class="btn" id="townSheetQuick">Character Sheet</button></div></div></section></div>`;
    document.querySelectorAll('[data-town-location]').forEach(btn => btn.onclick = () => renderLocation(townId, btn.dataset.townLocation));
    document.getElementById('townRoadQuick').onclick = () => triggerLegacy('Explore The First Road');
    document.getElementById('townSheetQuick').onclick = () => triggerLegacy('Character Sheet');
  }

  function renderLocation(townId, locId){
    const town = TOWNS()[townId];
    const loc = town?.locations?.find(l=>l.id===locId);
    if(!town || !loc) return renderTown(townId);
    const access = loc.access || {kind:'open'};
    const root = document.getElementById('root');
    root.innerHTML = `<div class="shell"><section class="panel"><div class="v080-town-shell"><div class="v080-location-panel"><div class="v080-location-head"><span class="v080-town-icon">${icon(loc.icon)}</span><div><div class="v080-kicker">${esc(town.name)}</div><h3>${esc(loc.name)}</h3><p>${esc(loc.description)}</p></div></div><div class="v080-access"><strong>${esc(accessLabel(loc))}</strong><span>${esc(access.hint || 'This location is available.')}</span></div><div class="v080-town-actions">${(loc.actions||[]).map(a=>`<button class="v080-town-action" data-town-action="${esc(a.id)}"><strong>${esc(a.label)}</strong><small>${esc(actionHelp(a))}</small></button>`).join('')}</div><div id="townNote" class="v080-town-note" style="display:none"></div><div class="actions"><button class="btn primary" id="backTown">Back to ${esc(town.name)}</button><button class="btn" id="backTitleSafe">Save / Title</button></div></div></div></section></div>`;
    document.querySelectorAll('[data-town-action]').forEach(btn => {
      const action = loc.actions.find(a=>a.id===btn.dataset.townAction);
      btn.onclick = () => runAction(action, townId);
    });
    document.getElementById('backTown').onclick = () => renderTown(townId);
    document.getElementById('backTitleSafe').onclick = () => location.reload();
  }

  function actionHelp(a){
    if(a.kind === 'legacy') return 'Enter the existing detailed screen for this place.';
    if(a.kind === 'road') return 'Leave town and travel the Old Road.';
    if(a.kind === 'coming') return a.text || 'Planned for a coming patch.';
    return a.text || 'Look closer.';
  }

  function runAction(action, townId){
    if(!action) return;
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
    // Fallback: return to title/continue cycle if old hidden buttons are not present anymore.
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
