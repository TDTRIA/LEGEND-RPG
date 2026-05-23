// LEGEND v0.8 - Clean Character Sheet and Pack
// Additive UI layer. Does not edit game.js or save format.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];
  const OVERLAY_ID = 'legendPackV080';

  function load(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }
  function save(p){ localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }
  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function D(){ return window.LEGEND_DATA || {}; }
  function itemNames(){ return D().itemNames || {}; }
  function prices(){ return D().prices || {}; }
  function weapon(p){ return (D().weapons||[]).find(w => w.id === p.weapon) || {name:p.weapon||'Hands', min:0, max:1}; }
  function armor(p){ return (D().armors||[]).find(a => a.id === p.armor) || {name:p.armor||'None', defense:0}; }
  function inv(p){ return Object.entries(p.inventory||{}).filter(([,v]) => Number(v) > 0); }
  function pct(n,d){ return Math.max(0, Math.min(100, d ? Math.round(Number(n||0)/Number(d)*100) : 0)); }
  function value(p){ return inv(p).reduce((s,[k,v]) => s + Number(prices()[k]||0)*Number(v||0), 0); }
  function arr(x){ return Array.isArray(x) ? x : []; }
  function name(k){ return itemNames()[k] || k; }
  function itemCat(k){
    if(['food','potion','camp','rfood'].includes(k)) return 'Supplies';
    if(['roadToken','bellFragment','codeFragment'].includes(k)) return 'Quest';
    if(['log','ore','fur','gem'].includes(k)) return 'Goods';
    if(['rtab','morb','bait'].includes(k)) return 'Special';
    return 'Misc';
  }
  function itemDesc(k){
    if(k==='food') return 'Restores 10 HP. Basic road survival.';
    if(k==='potion') return 'Restores 35 HP. Best saved for danger.';
    if(k==='camp') return 'Travel supply for safer road systems.';
    if(k==='roadToken') return 'Proof of progress on The First Road.';
    if(k==='bellFragment') return 'Main quest evidence tied to Ashmere.';
    if(k==='codeFragment') return 'Recovered-build clue.';
    if(k==='log') return 'Material for trade and future crafting.';
    if(k==='ore') return 'Material for trade and future upgrades.';
    if(k==='fur') return 'Trade good from road creatures.';
    if(k==='gem') return 'Valuable trade item.';
    return 'Recovered item. More uses will arrive as systems grow.';
  }

  function statScore(p, skill){
    const cls = D().classes?.[p.className]?.mod || {};
    const org = D().origins?.[p.origin]?.bonus || {};
    const keep = D().keepsakes?.[p.keepsake]?.bonus || {};
    const bg = p.creationV070?.bonuses || {};
    const n = Number(cls[skill]||0)+Number(org[skill]||0)+Number(keep[skill]||0)+Number(bg[skill]||0);
    return n >= 0 ? '+' + n : String(n);
  }

  function sheetHTML(p){
    const w = weapon(p), a = armor(p);
    const hp = pct(p.hp,p.maxHp);
    const traits = arr(p.traits).slice(0,8);
    const quests = arr(p.questLog).slice(0,3);
    const memories = arr(p.memories).slice(-3).reverse();
    const stats = [['Attack',`${w.min||0}-${w.max||1}`],['Defense','+'+(a.defense||0)],['Survival',statScore(p,'survival')],['Lore',statScore(p,'lore')],['Strength',statScore(p,'strength')],['Luck',statScore(p,'luck')],['Magic',statScore(p,'magic')],['Road Proof',`${Number(p.inventory?.roadToken||0)}/3`]];
    return `<div class="v080-sheet">
      <section class="v080-hero"><div class="v080-hero-top"><div class="v080-avatar">${esc((p.className||'T').slice(0,1))}</div><div><div class="v080-kicker">Traveler Profile v0.8</div><h3>${esc(p.username||'Traveler')}</h3><p>${esc(p.origin||'Unknown')} - ${esc(p.className||'Unknown')} - ${esc(p.keepsake||'No Keepsake')}</p></div><button class="v080-primary-btn" id="v080OpenPack">Open Pack</button></div><div class="v080-meter"><div class="v080-meter-card"><span>HP</span><strong>${Number(p.hp||0)} / ${Number(p.maxHp||0)}</strong><div class="v080-bar"><i style="width:${hp}%"></i></div></div><div class="v080-meter-card"><span>Level</span><strong>${Number(p.level||1)}</strong></div><div class="v080-meter-card"><span>Gold</span><strong>${Number(p.gold||0)}g</strong></div></div></section>
      <div class="v080-grid"><section class="v080-card v080-span-4"><h4>Loadout</h4><div class="v080-stat-grid"><div class="v080-stat"><span>Weapon</span><strong>${esc(w.name)}</strong><p>${Number(w.min||0)}-${Number(w.max||0)} damage</p></div><div class="v080-stat"><span>Armor</span><strong>${esc(a.name)}</strong><p>+${Number(a.defense||0)} defense</p></div></div></section><section class="v080-card v080-span-8"><h4>Core Readout</h4><div class="v080-stat-grid">${stats.map(([k,v])=>`<div class="v080-stat"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div></section><section class="v080-card v080-span-5"><h4>Pack Summary</h4><div class="v080-chip-row"><span class="v080-chip">Food x ${Number(p.inventory?.food||0)}</span><span class="v080-chip">Potions x ${Number(p.inventory?.potion||0)}</span><span class="v080-chip">Camp x ${Number(p.inventory?.camp||0)}</span><span class="v080-chip">Value ${value(p)}g</span></div></section><section class="v080-card v080-span-7"><h4>Traits</h4>${traits.length?`<div class="v080-chip-row">${traits.map(t=>`<span class="v080-chip">${esc(t)}</span>`).join('')}</div>`:'<p class="v080-empty">No traits yet.</p>'}</section><section class="v080-card v080-span-6"><h4>Current Objective</h4>${quests.map(q=>`<p>${esc(q)}</p>`).join('')||'<p class="v080-empty">No objective tracked.</p>'}</section><section class="v080-card v080-span-6"><h4>Recent Memories</h4>${memories.map(m=>`<p>${esc(m)}</p>`).join('')||'<p class="v080-empty">No memories recorded.</p>'}</section></div>
    </div>`;
  }

  function openPack(filter='All'){
    const p = load(); if(!p) return alert('No save found yet.');
    document.getElementById(OVERLAY_ID)?.remove();
    const entries = inv(p);
    const tabs = ['All',...Array.from(new Set(entries.map(([k])=>itemCat(k))))];
    const shown = filter==='All' ? entries : entries.filter(([k])=>itemCat(k)===filter);
    const w = weapon(p), a = armor(p);
    const overlay = document.createElement('div'); overlay.id = OVERLAY_ID; overlay.className = 'v080-inventory-overlay';
    overlay.innerHTML = `<div class="v080-backdrop"></div><section class="v080-pack"><header class="v080-pack-head"><div><div class="v080-kicker">Recovered Pack v0.8</div><h2>${esc(p.username||'Traveler')}'s Pack</h2><p>Cleaner categories, readable items, and quick survival actions.</p></div><button class="v080-close" id="v080ClosePack">x</button></header><div class="v080-pack-summary"><div class="v080-stat"><span>Gold</span><strong>${Number(p.gold||0)}g</strong></div><div class="v080-stat"><span>HP</span><strong>${Number(p.hp||0)}/${Number(p.maxHp||0)}</strong></div><div class="v080-stat"><span>Weapon</span><strong>${esc(w.name)}</strong></div><div class="v080-stat"><span>Armor</span><strong>${esc(a.name)}</strong></div><div class="v080-stat"><span>Value</span><strong>${value(p)}g</strong></div></div><nav class="v080-tabs">${tabs.map(t=>`<button class="${t===filter?'active':''}" data-pack-tab="${esc(t)}">${esc(t)}</button>`).join('')}</nav><div class="v080-item-grid">${shown.length?shown.map(([k,v])=>`<article class="v080-item-card"><div class="v080-item-top"><div class="v080-icon">${esc(itemCat(k).slice(0,1))}</div><div><h3>${esc(name(k))}</h3><p>${esc(itemDesc(k))}</p></div><div class="v080-count">x${Number(v)}</div></div><div class="v080-tags"><b>${esc(itemCat(k))}</b>${prices()[k]?`<b>${Number(prices()[k])}g each</b>`:''}</div><div class="v080-item-actions"><button class="primary" data-inspect="${esc(k)}">Inspect</button>${['food','potion'].includes(k)?`<button data-use="${esc(k)}">Use</button>`:''}</div></article>`).join(''):'<div class="v080-card"><p class="v080-empty">Nothing in this category yet.</p></div>'}</div><div class="v080-item-actions" style="margin-top:14px"><button class="primary" id="v080CopyPack">Copy Summary</button><button id="v080RefreshSheet">Refresh Sheet</button></div></section>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.v080-backdrop').onclick = () => overlay.remove();
    document.getElementById('v080ClosePack').onclick = () => overlay.remove();
    document.querySelectorAll('[data-pack-tab]').forEach(b=>b.onclick=()=>openPack(b.dataset.packTab));
    document.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>useItem(b.dataset.use,filter));
    document.querySelectorAll('[data-inspect]').forEach(b=>b.onclick=()=>alert(`${name(b.dataset.inspect)}\n\n${itemDesc(b.dataset.inspect)}\n\nCategory: ${itemCat(b.dataset.inspect)}`));
    document.getElementById('v080CopyPack').onclick = () => copySummary(load());
    document.getElementById('v080RefreshSheet').onclick = () => { enhanceSheet(true); overlay.remove(); };
  }

  function useItem(k, filter){
    const p = load(); if(!p || Number(p.inventory?.[k]||0)<=0) return;
    p.inventory[k] -= 1; p.hp = Math.min(Number(p.maxHp||p.hp||1), Number(p.hp||1) + (k==='potion'?35:10)); save(p); openPack(filter); enhanceSheet(true);
  }
  async function copySummary(p){
    if(!p) return; const lines = [`${p.username} - Level ${p.level} ${p.origin} ${p.className}`,`HP ${p.hp}/${p.maxHp} / Gold ${p.gold}`,`Pack Value: ${value(p)}g`,'Inventory:']; inv(p).forEach(([k,v])=>lines.push(`- ${name(k)} x${v}`));
    try{await navigator.clipboard.writeText(lines.join('\n')); alert('Summary copied.');}catch{alert(lines.join('\n'));}
  }
  function enhanceSheet(force=false){
    const p = load(); if(!p) return; const title = [...document.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Character Sheet'); if(!title) return;
    const panel = title.closest('.panel'); const text = panel?.querySelector('.text'); if(!text) return; if(text.dataset.v080Sheet==='1' && !force) return;
    text.dataset.v080Sheet = '1'; text.innerHTML = sheetHTML(p); const open = document.getElementById('v080OpenPack'); if(open) open.onclick = () => openPack();
    const actions = panel.querySelector('.actions') || document.querySelector('.actions'); if(actions && !document.getElementById('v080PackAction')){ const btn=document.createElement('button'); btn.id='v080PackAction'; btn.className='btn primary'; btn.textContent='Open Pack'; btn.onclick=()=>openPack(); actions.prepend(btn); }
  }
  function start(){ const observer = new MutationObserver(()=>requestAnimationFrame(()=>enhanceSheet(false))); observer.observe(document.body,{childList:true,subtree:true}); enhanceSheet(false); }
  window.LegendInventoryV080 = { open: openPack, enhanceSheet };
  window.LegendInventoryV065 = window.LegendInventoryV065 || {}; window.LegendInventoryV065.open = openPack; window.LegendInventoryV065.enhanceCharacterSheet = enhanceSheet;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
