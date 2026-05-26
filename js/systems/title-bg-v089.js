// LEGEND v0.8.9 - Fullscreen Title Replacement
// Replaces the old boxed title DOM entirely, while preserving original button actions.
(() => {
  const BG = 'assets/title/title_bg_ashmere_road_v089.jpg?v=0.8.9-replace';
  const DISCORD = 'https://discord.gg/htbBvvY9N';
  const TITLE_ID = 'legendFullscreenTitleV089';
  let installed = false;

  function getOriginalButtons(card){
    const actions = card?.querySelector('.actions');
    if(!actions) return [];
    return [...actions.querySelectorAll('button,a')].map((el, index) => ({
      text: (el.textContent || `Option ${index + 1}`).trim(),
      primary: el.classList.contains('primary') || index === 0,
      click: () => el.click(),
      href: el.tagName === 'A' ? el.getAttribute('href') : null
    }));
  }

  function buildButtonHTML(buttons){
    return buttons.map((b,i)=>`<button class="v089-menu-btn ${b.primary?'primary':''}" data-v089-action="${i}">${b.text}</button>`).join('');
  }

  function install(card){
    if(installed || document.getElementById(TITLE_ID)) return;
    const buttons = getOriginalButtons(card);
    if(!buttons.length) return;
    installed = true;
    document.title = 'LEGEND: Roads of Ashmere v0.8.9';
    if(window.LEGEND_DATA) window.LEGEND_DATA.VERSION = 'v0.8.9';

    const root = document.getElementById('root');
    if(!root) return;
    root.innerHTML = `<main id="${TITLE_ID}" class="v089-screen">
      <div class="v089-bg" aria-hidden="true"></div>
      <div class="v089-shade" aria-hidden="true"></div>
      <section class="v089-title-block">
        <div class="v089-kicker">v0.8.9 • Roads of Ashmere</div>
        <h1>LEGEND</h1>
        <p><strong>Roads of Ashmere</strong><span>Prepare in town. Travel the Old Road. Return with proof.</span></p>
      </section>
      <nav class="v089-menu-block" aria-label="Main menu">
        <div class="v089-menu-label">Begin the Road</div>
        <div class="v089-menu-list">${buildButtonHTML(buttons)}</div>
        <small>Start with Mara, gather supplies, and survive your first road journey.</small>
      </nav>
      <aside class="v089-whats-new">
        <div class="v089-panel-head"><span>What's New</span><strong>v0.8.9</strong></div>
        <ul>
          <li>Fullscreen Ashmere title art</li>
          <li>Town framework is active</li>
          <li>Old Road controller is active</li>
          <li>Main objective guidance added</li>
        </ul>
        <div class="v089-links"><a href="feedback.html">Feedback</a><a href="${DISCORD}" target="_blank" rel="noopener">Discord</a></div>
      </aside>
    </main>`;

    const screen = document.getElementById(TITLE_ID);
    const bg = screen.querySelector('.v089-bg');
    bg.style.backgroundImage = `url("${BG}")`;
    screen.querySelectorAll('[data-v089-action]').forEach(btn => {
      btn.onclick = () => {
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
      #${TITLE_ID}{position:fixed;inset:0;width:100vw;height:100svh;overflow:hidden;background:#020403;color:#eaffef;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;}
      #${TITLE_ID} *{box-sizing:border-box;letter-spacing:normal;}
      #${TITLE_ID} .v089-bg{position:absolute;inset:0;background-size:cover;background-position:center center;filter:saturate(.96) contrast(1.04);transform:scale(1.01);}
      #${TITLE_ID} .v089-shade{position:absolute;inset:0;background:radial-gradient(circle at 72% 18%,rgba(255,211,105,.08),transparent 25%),linear-gradient(90deg,rgba(2,4,3,.78) 0%,rgba(2,4,3,.30) 34%,rgba(2,4,3,.08) 58%,rgba(2,4,3,.74) 100%),linear-gradient(180deg,rgba(2,4,3,.10),rgba(2,4,3,.84));pointer-events:none;}
      #${TITLE_ID} .v089-title-block{position:absolute;top:clamp(22px,5vw,64px);right:clamp(18px,5vw,70px);width:min(560px,46vw);display:grid;gap:8px;justify-items:end;text-align:right;}
      #${TITLE_ID} .v089-kicker{color:#ffd369;background:rgba(0,0,0,.38);border:1px solid rgba(255,211,105,.24);border-radius:999px;padding:7px 12px;letter-spacing:.12em!important;text-transform:uppercase;font-size:.75rem;backdrop-filter:blur(5px);}
      #${TITLE_ID} h1{margin:0;color:#eaffef;font-size:clamp(4.8rem,13vw,11rem);line-height:.76;letter-spacing:.055em;text-shadow:0 0 26px rgba(255,211,105,.25),0 10px 0 rgba(0,0,0,.48);}
      #${TITLE_ID} .v089-title-block p{max-width:430px;text-align:right;margin:0;background:rgba(0,0,0,.22);border:1px solid rgba(255,211,105,.14);border-radius:18px;padding:12px 14px;backdrop-filter:blur(5px);}
      #${TITLE_ID} .v089-title-block strong{display:block;color:#ffd369;font-size:clamp(1.45rem,3vw,2.35rem);line-height:1.05;}
      #${TITLE_ID} .v089-title-block span{display:block;color:#f1ead1;line-height:1.42;margin-top:6px;}
      #${TITLE_ID} .v089-menu-block{position:absolute;left:clamp(18px,5vw,64px);bottom:clamp(22px,5vw,64px);width:min(330px,35vw);display:grid;gap:10px;}
      #${TITLE_ID} .v089-menu-label{width:max-content;color:#ffd369;background:rgba(0,0,0,.42);border:1px solid rgba(255,211,105,.22);border-radius:999px;padding:7px 11px;text-transform:uppercase;letter-spacing:.12em!important;font-size:.72rem;backdrop-filter:blur(5px);}
      #${TITLE_ID} .v089-menu-list{display:grid;gap:9px;}
      #${TITLE_ID} .v089-menu-btn{width:100%;text-align:left;background:rgba(7,12,9,.72);border:1px solid rgba(255,211,105,.26);color:#eaffef;box-shadow:0 12px 28px rgba(0,0,0,.34);backdrop-filter:blur(5px);border-radius:14px;padding:12px 14px;cursor:pointer;font-weight:800;min-height:44px;transition:transform .15s ease,border-color .15s ease;}
      #${TITLE_ID} .v089-menu-btn:hover{transform:translateX(4px);border-color:rgba(255,211,105,.62);}
      #${TITLE_ID} .v089-menu-btn.primary{background:linear-gradient(180deg,#ffe29a,#bf7f2a);color:#241803;border-color:rgba(255,211,105,.72);}
      #${TITLE_ID} small{color:#d8e6dc;text-align:left;text-shadow:0 2px 5px rgba(0,0,0,.9);background:rgba(0,0,0,.30);border:1px solid rgba(125,255,173,.14);border-radius:14px;padding:10px 12px;backdrop-filter:blur(5px);line-height:1.4;}
      #${TITLE_ID} .v089-whats-new{position:absolute;right:clamp(18px,5vw,70px);bottom:clamp(22px,5vw,64px);width:min(310px,30vw);border:1px solid rgba(255,211,105,.28);border-radius:20px;background:rgba(4,8,6,.58);backdrop-filter:blur(8px);padding:15px;text-align:left;box-shadow:0 18px 50px rgba(0,0,0,.38);}
      #${TITLE_ID} .v089-panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;}
      #${TITLE_ID} .v089-panel-head span{color:#9bb9a7;text-transform:uppercase;letter-spacing:.12em!important;font-size:.7rem;}
      #${TITLE_ID} .v089-panel-head strong{color:#ffd369;}
      #${TITLE_ID} .v089-whats-new ul{margin:0 0 12px;padding-left:19px;color:#f1ead1;line-height:1.5;}
      #${TITLE_ID} .v089-links{display:flex;gap:8px;flex-wrap:wrap;}
      #${TITLE_ID} .v089-links a{border:1px solid rgba(125,255,173,.22);border-radius:999px;background:rgba(0,0,0,.22);color:#eaffef;text-decoration:none;padding:7px 10px;}
      @media(max-width:920px){
        html:has(#${TITLE_ID}), body:has(#${TITLE_ID}){overflow:auto!important;}
        body:has(#${TITLE_ID}) #root,#${TITLE_ID}{position:relative!important;min-height:100svh!important;height:auto!important;overflow:auto!important;}
        #${TITLE_ID}{padding:14px;display:grid;align-content:start;gap:14px;}
        #${TITLE_ID} .v089-shade{background:linear-gradient(180deg,rgba(2,4,3,.28),rgba(2,4,3,.9));}
        #${TITLE_ID} .v089-title-block,#${TITLE_ID} .v089-menu-block,#${TITLE_ID} .v089-whats-new{position:relative;top:auto;right:auto;left:auto;bottom:auto;width:auto;margin:0;}
        #${TITLE_ID} .v089-title-block{padding-top:10px;text-align:center;justify-items:center;}
        #${TITLE_ID} .v089-title-block p{text-align:center;}
        #${TITLE_ID} .v089-menu-block{margin-top:35svh;}
        #${TITLE_ID} h1{font-size:clamp(4rem,22vw,7rem);}
      }
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
