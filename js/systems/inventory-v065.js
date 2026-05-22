// LEGEND v0.6.5 — Better Inventory Overlay
// Non-destructive overlay: improves inventory browsing without rewriting the restored core game.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];
  const itemType = {
    food:'Survival', rfood:'Survival', camp:'Survival', potion:'Survival', bait:'Survival',
    roadToken:'Quest', bellFragment:'Quest', codeFragment:'Quest', rtab:'Lore', morb:'Lore',
    log:'Material', ore:'Material', fur:'Material', gem:'Valuable', gmail:'Trophy', hbone:'Trophy'
  };
  const itemUse = {
    food:'Restores stamina in future travel systems and supports longer road pushes.',
    rfood:'Raw ingredient. Useful for future cooking/camp systems.',
    camp:'Used to recover outside town and support road travel.',
    potion:'Emergency healing item. Full use action arrives with combat cleanup.',
    bait:'Used to draw out road creatures and future fishing/trap systems.',
    roadToken:'Proof of progress on The First Road. Brenn accepts these.',
    bellFragment:'Main quest evidence tied to Mara and Brenn.',
    codeFragment:'Lost Build clue. Reserved for deeper recovered-build lore.',
    rtab:'Runic lore item. Useful for Mage/lore systems later.',
    log:'Material for Sella errands, camp repairs, and future crafting.',
    ore:'Crafting material for future equipment upgrades.',
    fur:'Trade good from beasts and road encounters.',
    gem:'High-value trade item.',
    gmail:'Goblin trophy/trade item.',
    hbone:'Large monster trophy/trade item.',
    morb:'Rare magical artifact.'
  };

  function load(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }
  function save(p){ localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }
  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function names(){return window.LEGEND_DATA?.itemNames || {};}
  function prices(){return window.LEGEND_DATA?.prices || {};}
  function weapon(p){return window.LEGEND_DATA?.weapons?.find(w=>w.id===p.weapon) || {name:p.weapon||'Unknown',min:0,max:0};}
  function armor(p){return window.LEGEND_DATA?.armors?.find(a=>a.id===p.armor) || {name:p.armor||'Unknown',defense:0};}
  function nonzeroInventory(p){return Object.entries(p.inventory||{}).filter(([,v])=>Number(v)>0);}
  function categoryFor(k){return itemType[k] || 'Misc';}
  function questItems(p){return ['roadToken','bellFragment','codeFragment','rtab','morb'].filter(k=>Number(p.inventory?.[k]||0)>0);}

  function renderInventory(filter='All'){
    const p = load();
    if(!p){ alert('No LEGEND save found yet.'); return; }
    const inv = nonzeroInventory(p);
    const cats = ['All', ...Array.from(new Set(inv.map(([k])=>categoryFor(k))))];
    const shown = filter === 'All' ? inv : inv.filter(([k])=>categoryFor(k)===filter);
    const totalValue = inv.reduce((sum,[k,v])=>sum + ((prices()[k]||0) * Number(v||0)), 0);
    const w = weapon(p), a = armor(p);
    const previous = document.getElementById('legendInventoryOverlay');
    if(previous) previous.remove();
    const overlay = document.createElement('div');
    overlay.id = 'legendInventoryOverlay';
    overlay.innerHTML = `
      <div class="inv-backdrop"></div>
      <section class="inv-panel" role="dialog" aria-label="Inventory">
        <header class="inv-head">
          <div><div class="inv-kicker">Recovered Pack v0.6.5</div><h2>${esc(p.username || 'Hero')}'s Inventory</h2><p>Grouped items, equipment, quest proof, trade value, and item purpose.</p></div>
          <button class="inv-close" id="closeInventory" aria-label="Close inventory">×</button>
        </header>
        <div class="inv-summary">
          <div><span>Gold</span><strong>${Number(p.gold||0)}</strong></div>
          <div><span>HP</span><strong>${Number(p.hp||0)}/${Number(p.maxHp||0)}</strong></div>
          <div><span>Weapon</span><strong>${esc(w.name)}${w.min!==undefined?` ${w.min}-${w.max}`:''}</strong></div>
          <div><span>Armor</span><strong>${esc(a.name)}${a.defense!==undefined?` +${a.defense}`:''}</strong></div>
          <div><span>Trade Value</span><strong>${totalValue}</strong></div>
        </div>
        <nav class="inv-tabs">${cats.map(c=>`<button class="${c===filter?'active':''}" data-inv-filter="${esc(c)}">${esc(c)}</button>`).join('')}</nav>
        <div class="inv-grid">
          ${shown.length ? shown.map(([k,v])=>`
            <article class="inv-card">
              <div class="inv-card-top"><h3>${esc(names()[k]||k)}</h3><span>${Number(v)}</span></div>
              <div class="inv-tags"><b>${esc(categoryFor(k))}</b>${prices()[k]?`<b>${prices()[k]}g each</b>`:''}</div>
              <p>${esc(itemUse[k] || 'Recovered item. Purpose will be expanded as systems grow.')}</p>
            </article>`).join('') : '<div class="inv-empty">Nothing in this category yet.</div>'}
        </div>
        <footer class="inv-actions">
          <button id="useFood" ${Number(p.inventory?.food||0)<=0?'disabled':''}>Eat Food (-1 Food, +10 HP)</button>
          <button id="usePotion" ${Number(p.inventory?.potion||0)<=0?'disabled':''}>Use Potion (-1 Potion, +35 HP)</button>
          <button id="copyInventory">Copy Inventory Summary</button>
        </footer>
      </section>`;
    document.body.appendChild(overlay);
    document.querySelectorAll('[data-inv-filter]').forEach(b=>b.onclick=()=>renderInventory(b.dataset.invFilter));
    document.getElementById('closeInventory').onclick=()=>overlay.remove();
    overlay.querySelector('.inv-backdrop').onclick=()=>overlay.remove();
    document.getElementById('useFood').onclick=()=>useItem('food',10,filter);
    document.getElementById('usePotion').onclick=()=>useItem('potion',35,filter);
    document.getElementById('copyInventory').onclick=()=>copySummary(p);
  }

  function useItem(key, heal, filter){
    const p = load();
    if(!p || Number(p.inventory?.[key]||0)<=0) return;
    p.inventory[key] -= 1;
    p.hp = Math.min(Number(p.maxHp||p.hp||1), Number(p.hp||1)+heal);
    save(p);
    renderInventory(filter);
    enhanceCharacterSheet();
  }
  async function copySummary(p){
    const lines = [`${p.username} / ${p.className} / Level ${p.level}`, `Gold: ${p.gold}`, `HP: ${p.hp}/${p.maxHp}`, 'Inventory:'];
    nonzeroInventory(p).forEach(([k,v])=>lines.push(`- ${names()[k]||k}: ${v}`));
    try{await navigator.clipboard.writeText(lines.join('\n')); alert('Inventory summary copied.');}catch{alert(lines.join('\n'));}
  }

  function sheetHTML(p){
    const w = weapon(p), a = armor(p);
    const inv = nonzeroInventory(p);
    const q = questItems(p);
    const totalValue = inv.reduce((sum,[k,v])=>sum + ((prices()[k]||0) * Number(v||0)), 0);
    return `
      <div class="sheet-v065">
        <section class="sheet-hero-card">
          <div>
            <div class="inv-kicker">Character Sheet v0.6.5</div>
            <h3>${esc(p.username || 'Hero')}</h3>
            <p>${esc(p.origin || 'Unknown Origin')} / ${esc(p.className || 'Unknown Class')}</p>
          </div>
          <button class="btn primary" id="sheetOpenInventory">Open Inventory</button>
        </section>
        <div class="sheet-stat-grid">
          <div><span>Level</span><strong>${Number(p.level||1)}</strong></div>
          <div><span>HP</span><strong>${Number(p.hp||0)}/${Number(p.maxHp||0)}</strong></div>
          <div><span>Gold</span><strong>${Number(p.gold||0)}</strong></div>
          <div><span>Pack Value</span><strong>${totalValue}g</strong></div>
          <div><span>Weapon</span><strong>${esc(w.name)}${w.min!==undefined?` ${w.min}-${w.max}`:''}</strong></div>
          <div><span>Armor</span><strong>${esc(a.name)}${a.defense!==undefined?` +${a.defense}`:''}</strong></div>
        </div>
        <section class="sheet-section">
          <h3>Quest Proof</h3>
          ${q.length ? `<div class="sheet-chip-row">${q.map(k=>`<span>${esc(names()[k]||k)} × ${Number(p.inventory[k]||0)}</span>`).join('')}</div>` : '<p>No quest proof found yet. The road still owes you answers.</p>'}
        </section>
        <section class="sheet-section">
          <h3>Quest Log</h3>
          <div class="sheet-quest-list">${(p.questLog||[]).map(x=>`<p>${esc(x)}</p>`).join('') || '<p>No quest entries yet.</p>'}</div>
        </section>
      </div>`;
  }

  function enhanceCharacterSheet(){
    const p = load();
    if(!p) return;
    const title = [...document.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Character Sheet');
    if(!title) return;
    const panel = title.closest('.panel');
    const text = panel?.querySelector('.text');
    if(!text || text.dataset.v065Sheet === '1') return;
    text.dataset.v065Sheet = '1';
    text.innerHTML = sheetHTML(p);
    const btn = document.getElementById('sheetOpenInventory');
    if(btn) btn.onclick = () => renderInventory();
  }

  function injectInventoryButton(){
    enhanceCharacterSheet();
    if(document.getElementById('openBetterInventory')) return;
    const title = [...document.querySelectorAll('h2')].some(h=>h.textContent.trim()==='Character Sheet');
    if(!title) return;
    const actions = document.querySelector('.actions');
    if(!actions) return;
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.id = 'openBetterInventory';
    btn.textContent = 'Open Inventory';
    btn.onclick = () => renderInventory();
    actions.prepend(btn);
  }

  const css = document.createElement('style');
  css.textContent = `
    #legendInventoryOverlay{position:fixed;inset:0;z-index:9999;color:#eaffef;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif}.inv-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(4px)}.inv-panel{position:relative;width:min(1100px,calc(100% - 24px));max-height:calc(100vh - 24px);overflow:auto;margin:12px auto;padding:18px;border:1px solid rgba(132,255,178,.3);border-radius:22px;background:linear-gradient(180deg,rgba(16,30,24,.98),rgba(6,10,9,.98));box-shadow:0 24px 80px rgba(0,0,0,.55)}.inv-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.inv-head h2{margin:0;color:#7dffad;font-size:clamp(1.6rem,5vw,3.5rem)}.inv-head p{margin:8px 0;color:#93b7a3;line-height:1.45}.inv-kicker{color:#ffd369;text-transform:uppercase;letter-spacing:.2em;font-size:.72rem}.inv-close{width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.28);color:#fff;font-size:2rem;cursor:pointer}.inv-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:14px 0}.inv-summary div,.inv-card,.inv-empty{border:1px solid rgba(132,255,178,.16);background:rgba(0,0,0,.25);border-radius:16px;padding:12px}.inv-summary span{display:block;color:#93b7a3;font-size:.75rem;text-transform:uppercase;letter-spacing:.12em}.inv-summary strong{display:block;color:#ffd369;margin-top:4px}.inv-tabs,.inv-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.inv-tabs button,.inv-actions button{border:1px solid rgba(132,255,178,.25);border-radius:999px;background:rgba(0,0,0,.2);color:#eaffef;padding:9px 12px;cursor:pointer}.inv-tabs button.active,.inv-actions button:not(:disabled):first-child{border-color:rgba(255,211,105,.55);background:linear-gradient(180deg,#ffe29a,#d69f32);color:#241803;font-weight:900}.inv-actions button:disabled{opacity:.45;cursor:not-allowed}.inv-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.inv-card-top{display:flex;justify-content:space-between;gap:10px;align-items:start}.inv-card h3{margin:0;color:#ffd369}.inv-card-top span{font-size:1.6rem;color:#7dffad;font-weight:900}.inv-tags{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.inv-tags b{font-size:.72rem;border:1px solid rgba(132,255,178,.18);border-radius:999px;padding:4px 8px;color:#93b7a3}.inv-card p{color:#eaffef;line-height:1.45;margin:0}.sheet-v065{display:grid;gap:12px}.sheet-hero-card,.sheet-section,.sheet-stat-grid>div{border:1px solid rgba(132,255,178,.16);background:rgba(0,0,0,.22);border-radius:16px;padding:12px}.sheet-hero-card{display:flex;justify-content:space-between;gap:12px;align-items:center}.sheet-hero-card h3{margin:0;color:#7dffad;font-size:1.8rem}.sheet-hero-card p,.sheet-section p{margin:.35rem 0;color:#d7f7df;line-height:1.45}.sheet-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.sheet-stat-grid span{display:block;color:#93b7a3;font-size:.72rem;text-transform:uppercase;letter-spacing:.12em}.sheet-stat-grid strong{display:block;color:#ffd369;margin-top:4px}.sheet-section h3{margin:0 0 8px;color:#ffd369}.sheet-chip-row{display:flex;flex-wrap:wrap;gap:8px}.sheet-chip-row span{border:1px solid rgba(255,211,105,.3);background:rgba(255,211,105,.08);color:#ffe7a6;border-radius:999px;padding:7px 10px}.sheet-quest-list{display:grid;gap:6px}@media(max-width:850px){.inv-summary,.inv-grid,.sheet-stat-grid{grid-template-columns:1fr}.inv-head,.sheet-hero-card{align-items:center}.inv-panel{padding:14px}}`;
  document.head.appendChild(css);
  const observer = new MutationObserver(()=>requestAnimationFrame(injectInventoryButton));
  window.addEventListener('DOMContentLoaded',()=>{observer.observe(document.body,{childList:true,subtree:true});injectInventoryButton();});
  window.LegendInventoryV065 = { open: renderInventory, enhanceCharacterSheet };
})();
