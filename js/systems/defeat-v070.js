// LEGEND v0.7.0 — Road Defeat Consequences
// Additive death screen and light recovery penalty. Does not rewrite restored game.js.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];
  const SESSION_KEY = 'legend-v070-last-defeat-count';
  const PENDING_KEY = 'legend-v070-pending-defeat';

  function load(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }
  function save(p){ localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }
  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function itemName(k){return window.LEGEND_DATA?.itemNames?.[k] || k;}

  function currentDeaths(p){ return Number(p?.stats?.timesDied || 0); }
  function getLastCount(){ return Number(sessionStorage.getItem(SESSION_KEY) || 0); }
  function setLastCount(n){ sessionStorage.setItem(SESSION_KEY, String(Number(n || 0))); }

  function chooseLoss(p){
    const inv = p.inventory || {};
    const losses = [];
    const isProtectedEarly = !p.flags?.firstRoadEvent || currentDeaths(p) <= 1;
    if(isProtectedEarly){
      return { losses, mercy:true, text:'The road takes only your momentum this time. Ashmere will not punish a traveler still learning how to stand.' };
    }

    const goldLoss = Math.min(Number(p.gold || 0), Math.max(0, Math.floor(Number(p.gold || 0) * 0.15)));
    if(goldLoss > 0){
      p.gold -= goldLoss;
      losses.push(`${goldLoss} gold`);
    }

    const lootOrder = ['fur','gmail','hbone','log','ore','rfood','bait'];
    const found = lootOrder.find(k => Number(inv[k] || 0) > 0);
    if(found){
      inv[found] -= 1;
      losses.push(`1 ${itemName(found)}`);
    }

    if(!losses.length){
      return { losses, mercy:true, text:'You had nothing loose for the road to steal. It leaves you shaken, but whole.' };
    }
    return { losses, mercy:false, text:`The road remembers what fell from your pack: ${losses.join(' and ')}.` };
  }

  function recordDefeatIfNeeded(){
    const p = load();
    if(!p) return null;
    const deaths = currentDeaths(p);
    const last = getLastCount();
    if(last === 0 && deaths > 0){
      setLastCount(deaths);
      return null;
    }
    if(deaths <= last) return null;

    const result = chooseLoss(p);
    p.momentum = 0;
    p.flags = p.flags || {};
    p.flags.lastDefeatSeenV070 = false;
    p.stats = p.stats || {};
    p.stats.v070DefeatsProcessed = Number(p.stats.v070DefeatsProcessed || 0) + 1;
    save(p);
    setLastCount(deaths);
    const payload = { deaths, result, hero:p.username || 'Traveler' };
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
    return payload;
  }

  function pendingDefeat(){
    try{return JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null')}catch{return null}
  }
  function clearPending(){ sessionStorage.removeItem(PENDING_KEY); }

  function showDefeat(payload){
    if(!payload || document.getElementById('legendDefeatOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'legendDefeatOverlay';
    overlay.innerHTML = `
      <div class="defeat-backdrop"></div>
      <section class="defeat-panel" role="dialog" aria-label="Defeat on the road">
        <div class="defeat-kicker">Road Defeat v0.7.0</div>
        <h2>The Road Drags You Back</h2>
        <p class="defeat-lore">${esc(payload.hero)} falls somewhere beyond the Ashmere gate. The last thing you hear is the town bell trying to ring through the static.</p>
        <div class="defeat-loss ${payload.result?.mercy ? 'mercy' : ''}">
          <strong>${payload.result?.mercy ? 'Mercy' : 'Lost Supplies'}</strong>
          <p>${esc(payload.result?.text || 'The road takes something, then lets you wake again.')}</p>
        </div>
        <p class="defeat-note">You wake in Ashmere with your HP restored, but your Momentum is gone. The next road push is still yours to choose.</p>
        <div class="defeat-actions">
          <button class="btn primary" id="defeatContinue">Wake in Ashmere</button>
          <button class="btn" id="defeatInventory">Check Inventory</button>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    document.getElementById('defeatContinue').onclick = () => { clearPending(); overlay.remove(); };
    document.getElementById('defeatInventory').onclick = () => {
      if(window.LegendInventoryV065?.open) window.LegendInventoryV065.open();
      else alert('Inventory system is still loading.');
    };
  }

  function maybeShow(){
    const payload = recordDefeatIfNeeded() || pendingDefeat();
    if(!payload) return;
    const inAshmere = [...document.querySelectorAll('h2')].some(h => /Ashmere Menu|Battle|The Road|Choose a Route/i.test(h.textContent || ''));
    if(inAshmere || document.body?.innerText?.includes('Ashmere')) showDefeat(payload);
  }

  const css = document.createElement('style');
  css.textContent = `
    #legendDefeatOverlay{position:fixed;inset:0;z-index:10000;color:#f7efe4;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif}.defeat-backdrop{position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(120,12,12,.42),rgba(0,0,0,.86) 62%);backdrop-filter:blur(5px)}.defeat-panel{position:relative;width:min(760px,calc(100% - 24px));margin:clamp(16px,8vh,80px) auto;padding:22px;border:1px solid rgba(255,94,94,.34);border-radius:24px;background:linear-gradient(180deg,rgba(36,14,14,.97),rgba(8,8,8,.98));box-shadow:0 30px 90px rgba(0,0,0,.7)}.defeat-kicker{color:#ffd369;text-transform:uppercase;letter-spacing:.22em;font-size:.74rem}.defeat-panel h2{margin:.2rem 0;color:#ff7777;font-size:clamp(2rem,7vw,4.6rem);line-height:.95}.defeat-lore,.defeat-note{color:#f1d5c6;line-height:1.55}.defeat-loss{border:1px solid rgba(255,94,94,.25);background:rgba(255,94,94,.08);border-radius:18px;padding:14px;margin:14px 0}.defeat-loss.mercy{border-color:rgba(125,255,173,.28);background:rgba(125,255,173,.08)}.defeat-loss strong{display:block;color:#ffd369;margin-bottom:4px}.defeat-loss p{margin:0;line-height:1.45}.defeat-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.defeat-actions .btn{min-height:44px}@media(max-width:700px){.defeat-panel{padding:16px}.defeat-actions{display:grid}.defeat-actions .btn{width:100%}}`;
  document.head.appendChild(css);

  window.addEventListener('DOMContentLoaded', () => {
    const p = load();
    if(p) setLastCount(currentDeaths(p));
    const observer = new MutationObserver(()=>requestAnimationFrame(maybeShow));
    observer.observe(document.body,{childList:true,subtree:true});
    setInterval(maybeShow, 1200);
  });
})();