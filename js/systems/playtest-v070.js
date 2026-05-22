// LEGEND v0.7.0 — Weekend Playtest Packaging
// Adds What’s New, playtest goals, and first-time Ashmere guidance as an additive UI layer.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];
  const SEEN_ASHMERE_KEY = 'legend-v070-ashmere-guide-seen';

  function load(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }
  function save(p){ localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }
  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function showWhatsNew(){
    const existing = document.getElementById('legendV070WhatsNew');
    if(existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'legendV070WhatsNew';
    modal.innerHTML = `
      <div class="v070-modal-backdrop"></div>
      <section class="v070-modal-panel" role="dialog" aria-label="What is new in v0.7.0">
        <button class="v070-modal-close" id="closeWhatsNew" aria-label="Close">×</button>
        <div class="v070-kicker">Memorial Weekend Playtest</div>
        <h2>What’s New in v0.7.0</h2>
        <p class="v070-lead">This update is focused on making LEGEND feel more like a real RPG: stronger presentation, deeper character creation, better choices, and more risk on the road.</p>
        <div class="v070-feature-grid">
          <article><strong>Cinematic Intro</strong><span>A new traveler sequence bridges character creation into Ashmere.</span></article>
          <article><strong>Deeper Creation</strong><span>The Traveler Interview adds traits, memories, supplies, and small bonuses.</span></article>
          <article><strong>Better Inventory</strong><span>The character sheet now uses the improved pack/inventory presentation.</span></article>
          <article><strong>Choice-Based Road</strong><span>Travel the Old Road with visible skill checks, DCs, and real outcomes.</span></article>
          <article><strong>Interactive Combat</strong><span>Battle has exploit, item, social, and risky flee options layered in.</span></article>
          <article><strong>Defeat Consequences</strong><span>Road deaths now show a defeat scene and can cost supplies after early mercy.</span></article>
        </div>
        <div class="v070-goals">
          <h3>Playtest Goals</h3>
          <ol>
            <li>Create a new traveler and try the full intro flow.</li>
            <li>Travel the Old Road and test whether choices feel meaningful.</li>
            <li>Try combat options besides Attack.</li>
            <li>Open inventory from the character sheet and after defeat.</li>
            <li>Send feedback if anything feels confusing, unfair, or broken.</li>
          </ol>
        </div>
        <div class="v070-modal-actions">
          <button class="btn primary" id="startPlaytestBtn">Start / Continue Playtest</button>
          <a class="btn" href="feedback.html">Send Feedback</a>
        </div>
      </section>`;
    document.body.appendChild(modal);
    document.getElementById('closeWhatsNew').onclick = () => modal.remove();
    modal.querySelector('.v070-modal-backdrop').onclick = () => modal.remove();
    document.getElementById('startPlaytestBtn').onclick = () => modal.remove();
  }

  function injectTitleButtons(){
    const title = document.querySelector('.game-title');
    if(!title) return;
    const actions = document.querySelector('.title-card .actions');
    if(!actions || document.getElementById('v070WhatsNewBtn')) return;
    const btn = document.createElement('button');
    btn.className = 'btn primary';
    btn.id = 'v070WhatsNewBtn';
    btn.textContent = 'What’s New in v0.7.0';
    btn.onclick = showWhatsNew;
    actions.prepend(btn);

    const goals = document.createElement('div');
    goals.className = 'v070-title-goals';
    goals.innerHTML = `<strong>Weekend Playtest Goals:</strong> create a traveler, reach Ashmere, travel the Old Road, test combat choices, try the inventory, and report anything confusing.`;
    const lore = document.querySelector('.title-lore');
    if(lore && !document.querySelector('.v070-title-goals')) lore.after(goals);
  }

  function ashGuideHTML(p){
    const traits = Array.isArray(p?.traits) && p.traits.length ? p.traits.slice(0,3).join(' • ') : 'New Traveler';
    return `
      <div class="v070-ashmere-guide" id="v070AshmereGuide">
        <div>
          <div class="v070-kicker">Start Here</div>
          <h3>Welcome to Ashmere, ${esc(p?.username || 'Traveler')}</h3>
          <p>Your first goal is simple: speak with Mara, then travel the Old Road. Your choices, traits, origin, class, and keepsake now affect checks.</p>
          <p><strong>Current Traits:</strong> ${esc(traits)}</p>
        </div>
        <div class="v070-guide-actions">
          <button class="btn primary" id="guidePeople">Talk to People</button>
          <button class="btn" id="guideRoad">Travel the Road</button>
          <button class="btn" id="guideDismiss">Hide Guide</button>
        </div>
      </div>`;
  }

  function injectAshmereGuide(){
    const h2 = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === 'Ashmere Menu');
    if(!h2 || document.getElementById('v070AshmereGuide')) return;
    const p = load();
    if(!p) return;
    if(sessionStorage.getItem(SEEN_ASHMERE_KEY) === '1' && p.flags?.v070AshmereGuideSeen) return;
    const panel = h2.closest('.panel');
    const text = panel?.querySelector('.text');
    if(!text) return;
    text.insertAdjacentHTML('beforebegin', ashGuideHTML(p));
    const guide = document.getElementById('v070AshmereGuide');
    const people = [...document.querySelectorAll('.card')].find(c => /People of Ashmere/i.test(c.textContent || ''));
    const road = [...document.querySelectorAll('.card')].find(c => /Explore The First Road/i.test(c.textContent || ''));
    document.getElementById('guidePeople').onclick = () => people?.click();
    document.getElementById('guideRoad').onclick = () => road?.click();
    document.getElementById('guideDismiss').onclick = () => {
      const current = load();
      if(current){ current.flags = current.flags || {}; current.flags.v070AshmereGuideSeen = true; save(current); }
      sessionStorage.setItem(SEEN_ASHMERE_KEY, '1');
      guide.remove();
    };
  }

  function installStyles(){
    if(document.getElementById('playtestV070Styles')) return;
    const css = document.createElement('style');
    css.id = 'playtestV070Styles';
    css.textContent = `
      .v070-title-goals{margin:12px 0 20px;border:1px solid rgba(255,211,105,.22);background:rgba(255,211,105,.07);border-radius:16px;padding:12px;color:#f1ead1;line-height:1.45}.v070-title-goals strong{color:#ffd369}.v070-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.76);backdrop-filter:blur(5px);z-index:10020}.v070-modal-panel{position:fixed;z-index:10021;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1050px,calc(100% - 24px));max-height:calc(100vh - 24px);overflow:auto;border:1px solid rgba(255,211,105,.34);border-radius:24px;background:linear-gradient(180deg,rgba(15,29,22,.98),rgba(4,8,6,.98));box-shadow:0 30px 100px rgba(0,0,0,.74);padding:clamp(18px,4vw,38px);color:#eaffef}.v070-modal-close{position:absolute;right:14px;top:14px;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.24);color:#fff;font-size:1.7rem;cursor:pointer}.v070-kicker{color:#ffd369;text-transform:uppercase;letter-spacing:.22em;font-size:.73rem;margin-bottom:8px}.v070-modal-panel h2{margin:0;color:#7dffad;font-size:clamp(2rem,7vw,4.8rem);line-height:.95}.v070-lead{color:#f1ead1;line-height:1.6;max-width:780px}.v070-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}.v070-feature-grid article,.v070-goals,.v070-ashmere-guide{border:1px solid rgba(132,255,178,.18);background:rgba(0,0,0,.22);border-radius:16px;padding:13px}.v070-feature-grid strong{display:block;color:#ffd369;margin-bottom:5px}.v070-feature-grid span{display:block;color:#cfeedd;line-height:1.4}.v070-goals h3{margin:0 0 8px;color:#ffd369}.v070-goals ol{margin:0;padding-left:22px;color:#f1ead1;line-height:1.55}.v070-modal-actions,.v070-guide-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.v070-ashmere-guide{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;margin-bottom:14px;background:linear-gradient(180deg,rgba(255,211,105,.08),rgba(0,0,0,.18));border-color:rgba(255,211,105,.24)}.v070-ashmere-guide h3{margin:0;color:#ffd369;font-size:1.35rem}.v070-ashmere-guide p{margin:6px 0 0;color:#f1ead1;line-height:1.45}@media(max-width:860px){.v070-feature-grid{grid-template-columns:1fr}.v070-ashmere-guide{grid-template-columns:1fr}.v070-modal-actions,.v070-guide-actions{display:grid}.v070-modal-actions .btn,.v070-guide-actions .btn{width:100%}.v070-modal-panel{top:12px;transform:translateX(-50%)}}`;
    document.head.appendChild(css);
  }

  function check(){
    injectTitleButtons();
    injectAshmereGuide();
  }

  window.addEventListener('DOMContentLoaded', () => {
    installStyles();
    const observer = new MutationObserver(()=>requestAnimationFrame(check));
    observer.observe(document.body,{childList:true,subtree:true});
    check();
  });
})();