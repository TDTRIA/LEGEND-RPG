// LEGEND v0.8.5 - Objective Spine
// Keeps early game clear without removing player freedom.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;

  function p(){ return RT()?.loadPlayer?.() || null; }
  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function current(player){
    const pl = player || p();
    if(!pl) return {stage:'start', title:'Create a Traveler', text:'Begin your road story by making a traveler.', location:'Title', action:'New Game'};
    const flags = pl.flags || {};
    const inv = pl.inventory || {};
    const memories = Array.isArray(pl.memories) ? pl.memories.join(' ').toLowerCase() : '';
    const talkedMara = flags.talkedMara || /mara/.test(memories);
    const roadProof = Number(inv.roadToken || 0) > 0 || Number(inv.bellFragment || 0) > 0;
    const reported = flags.reportedRoadProof || flags.brennRoadProof || flags.firstRoadTurnIn;

    if(!talkedMara){
      return {stage:'mara', title:'Speak with Mara', text:'Start in the Town Square. Mara can explain Ashmere, the Old Road, and why travelers need proof before anyone trusts them.', location:'Town Square', action:'Talk to townsfolk'};
    }
    if(!roadProof){
      return {stage:'road', title:'Return with Road Proof', text:'Leave through the Town Gate and survive a short trip on the Old Road. A Road Token, Bell Fragment, or monster trophy will give Ashmere a reason to take you seriously.', location:'Town Gate', action:'Travel the Old Road'};
    }
    if(!reported){
      return {stage:'ledger', title:'Bring Proof to Brenn', text:'Take your road proof to Ledger Hall. Brenn records what the town believes, owes, and fears.', location:'Ledger Hall', action:'Visit the ledger'};
    }
    return {stage:'prepare', title:'Prepare for a Longer Journey', text:'Ashmere is open enough to breathe. Rest, trade, gather rumors, check your pack, and prepare to push farther toward the next town.', location:'Ashmere', action:'Choose a location'};
  }

  function installStyles(){
    if(document.getElementById('objectivesV080Styles')) return;
    const css = document.createElement('style');
    css.id = 'objectivesV080Styles';
    css.textContent = `.v085-objective{border:1px solid rgba(255,211,105,.36);border-radius:20px;background:linear-gradient(180deg,rgba(255,211,105,.10),rgba(0,0,0,.20));padding:14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;box-shadow:0 14px 32px rgba(0,0,0,.20)}.v085-objective .k{color:#ffd369;text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;margin-bottom:4px}.v085-objective h3{margin:0;color:#7dffad;font-size:clamp(1.3rem,4vw,2.2rem);line-height:1.05}.v085-objective p{margin:.35rem 0 0;color:#f1ead1;line-height:1.45;max-width:82ch}.v085-objective b{color:#ffd369}.v085-objective .pill{border:1px solid rgba(125,255,173,.22);border-radius:999px;background:rgba(0,0,0,.24);color:#eaffef;padding:8px 11px;white-space:nowrap}@media(max-width:760px){.v085-objective{grid-template-columns:1fr}.v085-objective .pill{width:max-content;max-width:100%}}.v080-town-card.recommended{border-color:rgba(255,211,105,.7)!important;box-shadow:0 0 0 1px rgba(255,211,105,.18),0 18px 38px rgba(0,0,0,.28)!important}.v080-town-card.recommended:after{content:'Recommended';position:absolute;right:10px;top:10px;border:1px solid rgba(255,211,105,.35);border-radius:999px;background:rgba(255,211,105,.10);color:#ffe7a6;padding:3px 8px;font-size:.7rem}.v080-town-card{position:relative}`;
    document.head.appendChild(css);
  }

  function inject(){
    installStyles();
    const shell = document.querySelector('.v080-town-shell');
    if(!shell || shell.querySelector('.v085-objective')) return;
    const obj = current();
    const card = document.createElement('section');
    card.className = 'v085-objective';
    card.innerHTML = `<div><div class="k">Main Objective</div><h3>${esc(obj.title)}</h3><p>${esc(obj.text)}</p><p><b>Recommended:</b> ${esc(obj.location)} - ${esc(obj.action)}</p></div><span class="pill">Start Here</span>`;
    const hero = shell.querySelector('.v080-town-hero');
    if(hero) hero.after(card);

    document.querySelectorAll('.v080-town-card').forEach(btn => {
      const txt = (btn.textContent || '').toLowerCase();
      if(txt.includes(String(obj.location).toLowerCase())) btn.classList.add('recommended');
    });
  }

  window.LegendObjectivesV080 = { current };
  const rt = RT();
  if(rt?.onRender) rt.onRender(inject);
  else if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
