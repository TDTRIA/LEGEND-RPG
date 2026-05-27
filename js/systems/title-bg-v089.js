// LEGEND v0.9.1 - Fullscreen Title Replacement
// Readable main menu using Ashmere title art, with unavailable buttons disabled.
(() => {
  const BG = './assets/title/title_bg_ashmere_road_v089.jpg?v=0.9.1-menu-state';
  const DISCORD = 'https://discord.gg/htbBvvY9N';
  const TITLE_ID = 'legendFullscreenTitleV089';
  let installed = false;

  function hasSave(){
    try{
      const key = window.LEGEND_DATA?.SAVE_KEY || 'legend-roads-of-ashmere-v09';
      const old = window.LEGEND_DATA?.OLD_KEYS || [];
      return !!localStorage.getItem(key) || old.some(k => !!localStorage.getItem(k));
    }catch(e){ return false; }
  }

  function inferUnavailable(el, text){
    const t = String(text || '').toLowerCase();
    const disabled = el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('disabled');
    if(disabled) return true;
    if((t.includes('continue') || t.includes('load')) && !hasSave()) return true;
    return false;
  }

  function getOriginalButtons(card){
    const actions = card?.querySelector('.actions');
    if(!actions) return [];
    return [...actions.querySelectorAll('button,a')].map((el, index) => {
      const text = (el.textContent || `Option ${index + 1}`).trim();
      const unavailable = inferUnavailable(el, text);
      return {
        text,
        primary: el.classList.contains('primary') || index === 0,
        unavailable,
        reason: unavailable ? 'No save found yet' : '',
        click: () => el.click()
      };
    });
  }

  function buildButtonHTML(buttons){
    return buttons.map((b,i)=>`<button class="v089-menu-btn ${b.primary?'primary':''} ${b.unavailable?'is-disabled':''}" data-v089-action="${i}" ${b.unavailable?'disabled aria-disabled="true"':''}><span>${b.text}</span>${b.unavailable?`<em>${b.reason}</em>`:''}</button>`).join('');
  }

  function install(card){
    if(installed || document.getElementById(TITLE_ID)) return;
    const buttons = getOriginalButtons(card);
    if(!buttons.length) return;
    installed = true;
    document.title = 'LEGEND: Roads of Ashmere v0.9.1';
    if(window.LEGEND_DATA) window.LEGEND_DATA.VERSION = 'v0.9.1';

    const root = document.getElementById('root');
    if(!root) return;
    root.innerHTML = `<main id="${TITLE_ID}" class="v089-screen">
      <img class="v089-bg-img" src="${BG}" alt="" aria-hidden="true">
      <div class="v089-bg-fallback" aria-hidden="true"></div>
      <div class="v089-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="v089-shade" aria-hidden="true"></div>
      <section class="v089-title-block">
        <div class="v089-kicker">v0.9.1 • Roads of Ashmere</div>
        <h1>LEGEND</h1>
        <p><strong>Roads of Ashmere</strong><span>Prepare in town. Travel the Old Road. Return with proof.</span></p>
      </section>
      <nav class="v089-menu-block" aria-label="Main menu">
        <div class="v089-menu-label">Begin the Road</div>
        <div class="v089-menu-list">${buildButtonHTML(buttons)}</div>
        <small>Start with Mara, gather supplies, and survive your first road journey.</small>
      </nav>
      <aside class="v089-whats-new">
        <div class="v089-panel-head"><span>What's New</span><strong>v0.9.1</strong></div>
        <ul>
          <li>Unavailable menu buttons disabled</li>
          <li>Interactive dice checks added</li>
          <li>Old Road menu pass started</li>
          <li>New asset pipeline active</li>
        </ul>
        <div class="v089-links"><a href="feedback.html">Feedback</a><a href="${DISCORD}" target="_blank" rel="noopener">Discord</a></div>
      </aside>
    </main>`;

    const screen = document.getElementById(TITLE_ID);
    screen.querySelector('.v089-bg-fallback').style.backgroundImage = `url("${BG}")`;
    screen.querySelectorAll('[data-v089-action]').forEach(btn => {
      btn.onclick = () => {
        if(btn.disabled || btn.classList.contains('is-disabled')) return;
        const action = buttons[Number(btn.dataset.v089Action)];
        if(action?.click) action.click();
      };
    });
  }

  function styles(){
    if(document.getElementById('titleReplaceV089Styles')) return;
    const css = document.createElement('style');
    css.id = 'titleReplaceV089Styles';
    css.textContent = `
      html:has(#${TITLE_ID}), body:has(#${TITLE_ID}){margin:0!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#020403!important;}
      body:has(#${TITLE_ID}) #root{position:fixed!important;inset:0!important;margin:0!important;padding:0!important;width:100vw!important;height:100svh!important;overflow:hidden!important;background:#020403!important;}
      #${TITLE_ID}{--pad:clamp(18px,4vw,54px);position:fixed;inset:0;width:100vw;height:100svh;overflow:hidden;background:#020403;color:#eaffef;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;}
      #${TITLE_ID} *{box-sizing:border-box;letter-spacing:normal;}
      #${TITLE_ID} .v089-bg-fallback{position:absolute;inset:0;background-size:cover;background-position:center center;filter:saturate(.98) contrast(1.05);transform:scale(1.012);animation:v089Drift 18s ease-in-out infinite alternate;}
      #${TITLE_ID} .v089-bg-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;filter:saturate(.98) contrast(1.05);transform:scale(1.012);animation:v089Drift 18s ease-in-out infinite alternate;z-index:0;display:block;}
      #${TITLE_ID} .v089-shade{position:absolute;inset:0;background:radial-gradient(circle at 70% 18%,rgba(255,211,105,.09),transparent 22%),linear-gradient(90deg,rgba(2,4,3,.78) 0%,rgba(2,4,3,.42) 26%,rgba(2,4,3,.16) 52%,rgba(2,4,3,.60) 100%),linear-gradient(180deg,rgba(2,4,3,.06),rgba(2,4,3,.86));pointer-events:none;z-index:2;}
      #${TITLE_ID} .v089-embers{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3;}
      #${TITLE_ID} .v089-embers i{position:absolute;bottom:-20px;width:4px;height:4px;border-radius:999px;background:#ffd369;box-shadow:0 0 18px rgba(255,211,105,.8);opacity:.0;animation:v089Ember 7s linear infinite;}
      #${TITLE_ID} .v089-embers i:nth-child(1){left:18%;animation-delay:.4s}.v089-embers i:nth-child(2){left:32%;animation-delay:2s}.v089-embers i:nth-child(3){left:55%;animation-delay:1.2s}.v089-embers i:nth-child(4){left:73%;animation-delay:3.4s}.v089-embers i:nth-child(5){left:86%;animation-delay:4.6s}
      #${TITLE_ID} .v089-title-block{position:absolute;top:var(--pad);right:var(--pad);width:min(520px,42vw);display:grid;gap:8px;justify-items:end;text-align:right;z-index:4;}
      #${TITLE_ID} .v089-kicker{color:#ffd369;background:rgba(0,0,0,.46);border:1px solid rgba(255,211,105,.28);border-radius:999px;padding:7px 12px;letter-spacing:.12em!important;text-transform:uppercase;font-size:clamp(.62rem,1vw,.78rem);backdrop-filter:blur(5px);box-shadow:0 12px 28px rgba(0,0,0,.28);}
      #${TITLE_ID} h1{margin:0;color:#eaffef;font-size:clamp(3.8rem,9.5vw,8.8rem);line-height:.78;letter-spacing:.055em;text-shadow:0 0 26px rgba(255,211,105,.25),0 9px 0 rgba(0,0,0,.50);}
      #${TITLE_ID} .v089-title-block p{max-width:390px;text-align:right;margin:0;background:rgba(0,0,0,.34);border:1px solid rgba(255,211,105,.18);border-radius:18px;padding:12px 14px;backdrop-filter:blur(6px);box-shadow:0 16px 36px rgba(0,0,0,.26);}
      #${TITLE_ID} .v089-title-block strong{display:block;color:#ffd369;font-size:clamp(1.15rem,2.2vw,1.85rem);line-height:1.05;}
      #${TITLE_ID} .v089-title-block span{display:block;color:#f1ead1;line-height:1.42;margin-top:6px;font-size:clamp(.86rem,1.3vw,1rem);}
      #${TITLE_ID} .v089-menu-block{position:absolute;left:var(--pad);bottom:var(--pad);width:min(320px,31vw);display:grid;gap:10px;z-index:4;}
      #${TITLE_ID} .v089-menu-label{width:max-content;color:#ffd369;background:rgba(0,0,0,.48);border:1px solid rgba(255,211,105,.26);border-radius:999px;padding:7px 11px;text-transform:uppercase;letter-spacing:.12em!important;font-size:.72rem;backdrop-filter:blur(5px);}
      #${TITLE_ID} .v089-menu-list{display:grid;gap:8px;}
      #${TITLE_ID} .v089-menu-btn{width:100%;text-align:left;background:linear-gradient(90deg,rgba(10,16,12,.82),rgba(10,16,12,.54));border:1px solid rgba(255,211,105,.28);color:#eaffef;box-shadow:0 12px 28px rgba(0,0,0,.34);backdrop-filter:blur(5px);border-radius:14px;padding:11px 14px;cursor:pointer;font-weight:900;min-height:42px;transition:transform .15s ease,border-color .15s ease,background .15s ease;}
      #${TITLE_ID} .v089-menu-btn span:before{content:'›';color:#ffd369;margin-right:8px;}
      #${TITLE_ID} .v089-menu-btn:hover{transform:translateX(5px);border-color:rgba(255,211,105,.66);background:linear-gradient(90deg,rgba(39,28,12,.86),rgba(10,16,12,.58));}
      #${TITLE_ID} .v089-menu-btn.primary{background:linear-gradient(180deg,#ffe29a,#bf7f2a);color:#241803;border-color:rgba(255,211,105,.72);}
      #${TITLE_ID} .v089-menu-btn.primary span:before{color:#503407;}
      #${TITLE_ID} .v089-menu-btn.is-disabled,#${TITLE_ID} .v089-menu-btn:disabled{opacity:.48;filter:grayscale(.65);cursor:not-allowed;transform:none!important;background:rgba(7,12,9,.50)!important;border-color:rgba(185,211,193,.14)!important;color:#9eb4a6!important;box-shadow:none!important;}
      #${TITLE_ID} .v089-menu-btn em{display:block;font-style:normal;font-size:.72rem;color:#b9d3c1;margin-top:3px;font-weight:600;}
      #${TITLE_ID} small{color:#d8e6dc;text-align:left;text-shadow:0 2px 5px rgba(0,0,0,.9);background:rgba(0,0,0,.36);border:1px solid rgba(125,255,173,.16);border-radius:14px;padding:10px 12px;backdrop-filter:blur(5px);line-height:1.38;}
      #${TITLE_ID} .v089-whats-new{position:absolute;right:var(--pad);bottom:var(--pad);width:min(290px,28vw);border:1px solid rgba(255,211,105,.28);border-radius:20px;background:rgba(4,8,6,.62);backdrop-filter:blur(8px);padding:14px;text-align:left;box-shadow:0 18px 50px rgba(0,0,0,.38);z-index:4;}
      #${TITLE_ID} .v089-panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:9px;}
      #${TITLE_ID} .v089-panel-head span{color:#9bb9a7;text-transform:uppercase;letter-spacing:.12em!important;font-size:.68rem;}
      #${TITLE_ID} .v089-panel-head strong{color:#ffd369;}
      #${TITLE_ID} .v089-whats-new ul{margin:0 0 10px;padding-left:18px;color:#f1ead1;line-height:1.42;font-size:.9rem;}
      #${TITLE_ID} .v089-links{display:flex;gap:8px;flex-wrap:wrap;}
      #${TITLE_ID} .v089-links a{border:1px solid rgba(125,255,173,.22);border-radius:999px;background:rgba(0,0,0,.24);color:#eaffef;text-decoration:none;padding:7px 10px;font-size:.88rem;}
      @keyframes v089Drift{from{transform:scale(1.012) translate3d(0,0,0)}to{transform:scale(1.04) translate3d(-8px,-4px,0)}}
      @keyframes v089Ember{0%{opacity:0;transform:translateY(0) scale(.6)}15%{opacity:.75}100%{opacity:0;transform:translateY(-95vh) scale(1.3)}}
      @media(max-width:1100px){#${TITLE_ID}{--pad:clamp(14px,3vw,30px)}#${TITLE_ID} .v089-title-block{width:min(470px,48vw)}#${TITLE_ID} .v089-menu-block{width:min(300px,34vw)}#${TITLE_ID} .v089-whats-new{width:min(270px,30vw)}}
      @media(max-width:820px){html:has(#${TITLE_ID}), body:has(#${TITLE_ID}){overflow:auto!important;}body:has(#${TITLE_ID}) #root,#${TITLE_ID}{position:relative!important;min-height:100svh!important;height:auto!important;overflow:auto!important;}#${TITLE_ID}{padding:14px;display:grid;align-content:start;gap:12px;}#${TITLE_ID} .v089-bg-img,#${TITLE_ID} .v089-bg-fallback{background-position:center center;position:fixed;}#${TITLE_ID} .v089-shade{position:fixed;background:linear-gradient(180deg,rgba(2,4,3,.24),rgba(2,4,3,.90));}#${TITLE_ID} .v089-title-block,#${TITLE_ID} .v089-menu-block,#${TITLE_ID} .v089-whats-new{position:relative;top:auto;right:auto;left:auto;bottom:auto;width:auto;margin:0;}#${TITLE_ID} .v089-title-block{padding-top:8px;text-align:center;justify-items:center;}#${TITLE_ID} .v089-title-block p{text-align:center;max-width:520px;}#${TITLE_ID} .v089-menu-block{margin-top:30svh;}#${TITLE_ID} h1{font-size:clamp(4rem,22vw,7rem);}#${TITLE_ID} .v089-whats-new{margin-bottom:12px;}}
    `;
    document.head.appendChild(css);
  }

  function tick(){
    styles();
    if(installed || document.getElementById(TITLE_ID)) return;
    const card = document.querySelector('.title-card');
    const title = document.querySelector('.game-title');
    if(card && title) install(card);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => requestAnimationFrame(tick));
    observer.observe(document.body,{childList:true,subtree:true});
    tick();
  });
  else {
    const observer = new MutationObserver(() => requestAnimationFrame(tick));
    observer.observe(document.body,{childList:true,subtree:true});
    tick();
  }
})();
