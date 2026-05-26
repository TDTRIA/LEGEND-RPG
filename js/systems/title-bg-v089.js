// LEGEND v0.8.9 - Real Title Background Layout
// Full-screen Ashmere title art with menu left, title upper-right, What's New bottom-right.
(() => {
  const BG = 'assets/title/title_bg_ashmere_road_v089.jpg?v=0.8.9';
  const DISCORD = 'https://discord.gg/htbBvvY9N';

  function clean(){
    document.title = 'LEGEND: Roads of Ashmere v0.8.9';
    if(window.LEGEND_DATA) window.LEGEND_DATA.VERSION = 'v0.8.9';
    document.querySelectorAll('#v088TitleScene,#v088WhatsNew,#v085TitleHook,#v086TitleHook,#v086TitleWorld,#v070TitleInfo,#legendV070WhatsNew,#v070AshmereGuide').forEach(el => el.remove());
    document.querySelectorAll('.v070-title-info,.v085-title-hook,.v086-title-hook,.v086-title-world,.v088-scene,.v088-whats-new').forEach(el => el.remove());
  }

  function whatsNew(){
    return `<aside class="v089-whats-new" id="v089WhatsNew">
      <div class="v089-panel-head"><span>What's New</span><strong>v0.8.9</strong></div>
      <ul>
        <li>New Ashmere title background</li>
        <li>Town framework is active</li>
        <li>Old Road controller is active</li>
        <li>Main objective guidance added</li>
      </ul>
      <div class="v089-links"><a href="feedback.html">Feedback</a><a href="${DISCORD}" target="_blank" rel="noopener">Discord</a></div>
    </aside>`;
  }

  function apply(){
    clean();
    const card = document.querySelector('.title-card');
    const title = document.querySelector('.game-title');
    if(!card || !title) return;

    card.classList.add('v089-title-card');
    title.textContent = 'LEGEND';
    title.classList.add('v089-logo');

    const kicker = card.querySelector('.kicker');
    if(kicker) kicker.textContent = 'v0.8.9 • Roads of Ashmere';

    const lore = document.querySelector('.title-lore');
    if(lore){
      lore.innerHTML = '<b>Roads of Ashmere</b><span>Prepare in town. Travel the Old Road. Return with proof.</span>';
    }

    const small = card.querySelector('.small');
    if(small) small.textContent = 'Start with Mara, gather supplies, and survive your first road journey.';

    if(!document.getElementById('v089Bg')){
      const bg = document.createElement('div');
      bg.id = 'v089Bg';
      bg.className = 'v089-bg';
      bg.style.backgroundImage = `url("${BG}")`;
      card.prepend(bg);
    }

    if(!document.getElementById('v089TitleBlock')){
      const block = document.createElement('div');
      block.id = 'v089TitleBlock';
      block.className = 'v089-title-block';
      block.appendChild(title);
      if(lore) block.appendChild(lore);
      if(kicker) block.prepend(kicker);
      card.appendChild(block);
    }

    const actions = card.querySelector('.actions');
    if(actions && !document.getElementById('v089MenuBlock')){
      const menu = document.createElement('div');
      menu.id = 'v089MenuBlock';
      menu.className = 'v089-menu-block';
      const label = document.createElement('div');
      label.className = 'v089-menu-label';
      label.textContent = 'Begin the Road';
      menu.appendChild(label);
      menu.appendChild(actions);
      if(small) menu.appendChild(small);
      card.appendChild(menu);
    }

    if(!document.getElementById('v089WhatsNew')){
      card.insertAdjacentHTML('beforeend', whatsNew());
    }
  }

  function styles(){
    if(document.getElementById('titleBgV089Styles')) return;
    const css = document.createElement('style');
    css.id = 'titleBgV089Styles';
    css.textContent = `
      body:has(.v089-title-card){background:#020403!important;overflow-x:hidden;}
      .v089-title-card{
        position:relative!important;
        width:min(1280px,calc(100% - 18px))!important;
        min-height:min(780px,calc(100svh - 24px))!important;
        overflow:hidden!important;
        border:1px solid rgba(255,211,105,.26)!important;
        border-radius:30px!important;
        background:#020403!important;
        box-shadow:0 32px 130px rgba(0,0,0,.78)!important;
        display:block!important;
        padding:0!important;
      }
      .v089-bg{position:absolute;inset:0;background-size:cover;background-position:center center;filter:saturate(.94) contrast(1.04);transform:scale(1.01);z-index:0;}
      .v089-title-card:before{content:'';position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 72% 18%,rgba(255,211,105,.10),transparent 25%),linear-gradient(90deg,rgba(2,4,3,.78) 0%,rgba(2,4,3,.30) 36%,rgba(2,4,3,.14) 58%,rgba(2,4,3,.74) 100%),linear-gradient(180deg,rgba(2,4,3,.12),rgba(2,4,3,.84));pointer-events:none;}
      .v089-title-card>*:not(.v089-bg){position:relative;z-index:2;}
      .v089-title-block{position:absolute!important;top:clamp(22px,5vw,58px);right:clamp(18px,5vw,64px);width:min(520px,46%);text-align:right;display:grid;gap:8px;justify-items:end;}
      .v089-logo{margin:0!important;color:#eaffef!important;font-size:clamp(4.4rem,12vw,10rem)!important;line-height:.78!important;letter-spacing:.06em!important;text-shadow:0 0 26px rgba(255,211,105,.25),0 10px 0 rgba(0,0,0,.48)!important;}
      .v089-title-card .kicker{color:#ffd369!important;background:rgba(0,0,0,.38);border:1px solid rgba(255,211,105,.24);border-radius:999px;padding:7px 12px;letter-spacing:.12em!important;text-transform:uppercase!important;font-size:.75rem!important;backdrop-filter:blur(5px);}
      .v089-title-card .title-lore{max-width:430px!important;text-align:right!important;margin:0!important;background:rgba(0,0,0,.25);border:1px solid rgba(255,211,105,.16);border-radius:18px;padding:12px 14px;backdrop-filter:blur(5px);}
      .v089-title-card .title-lore b{display:block;color:#ffd369;font-size:clamp(1.4rem,3.1vw,2.25rem);line-height:1.05;}
      .v089-title-card .title-lore span{display:block;color:#f1ead1;line-height:1.42;margin-top:6px;}
      .v089-menu-block{position:absolute!important;left:clamp(18px,5vw,58px);bottom:clamp(22px,5vw,58px);width:min(330px,38%);display:grid;gap:10px;}
      .v089-menu-label{width:max-content;color:#ffd369;background:rgba(0,0,0,.40);border:1px solid rgba(255,211,105,.22);border-radius:999px;padding:7px 11px;text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;backdrop-filter:blur(5px);}
      .v089-title-card .actions{display:grid!important;gap:9px!important;justify-content:stretch!important;margin:0!important;}
      .v089-title-card .actions .btn{width:100%!important;text-align:left!important;justify-content:flex-start!important;background:rgba(7,12,9,.70)!important;border:1px solid rgba(255,211,105,.25)!important;color:#eaffef!important;box-shadow:0 12px 28px rgba(0,0,0,.34)!important;backdrop-filter:blur(5px);border-radius:14px!important;padding:12px 14px!important;}
      .v089-title-card .actions .btn.primary{background:linear-gradient(180deg,#ffe29a,#bf7f2a)!important;color:#241803!important;border-color:rgba(255,211,105,.72)!important;}
      .v089-title-card .small{color:#d8e6dc!important;text-align:left!important;text-shadow:0 2px 5px rgba(0,0,0,.9)!important;background:rgba(0,0,0,.28);border:1px solid rgba(125,255,173,.14);border-radius:14px;padding:10px 12px;backdrop-filter:blur(5px);}
      .v089-whats-new{position:absolute!important;right:clamp(18px,5vw,64px);bottom:clamp(22px,5vw,58px);width:min(310px,32%);border:1px solid rgba(255,211,105,.28);border-radius:20px;background:rgba(4,8,6,.58);backdrop-filter:blur(8px);padding:15px;text-align:left;box-shadow:0 18px 50px rgba(0,0,0,.38);}
      .v089-panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;}
      .v089-panel-head span{color:#9bb9a7;text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;}
      .v089-panel-head strong{color:#ffd369;}
      .v089-whats-new ul{margin:0 0 12px;padding-left:19px;color:#f1ead1;line-height:1.5;}
      .v089-links{display:flex;gap:8px;flex-wrap:wrap;}
      .v089-links a{border:1px solid rgba(125,255,173,.22);border-radius:999px;background:rgba(0,0,0,.22);color:#eaffef;text-decoration:none;padding:7px 10px;}
      @media(max-width:920px){
        .v089-title-card{min-height:calc(100svh - 12px)!important;border-radius:20px!important;}
        .v089-title-card:before{background:linear-gradient(180deg,rgba(2,4,3,.28),rgba(2,4,3,.9));}
        .v089-title-block,.v089-menu-block,.v089-whats-new{position:relative!important;top:auto!important;right:auto!important;left:auto!important;bottom:auto!important;width:auto!important;margin:14px!important;}
        .v089-title-block{padding-top:10px;text-align:center;justify-items:center;}
        .v089-title-card .title-lore{text-align:center!important;}
        .v089-menu-block{margin-top:35svh!important;}
        .v089-logo{font-size:clamp(4rem,22vw,7rem)!important;}
      }
    `;
    document.head.appendChild(css);
  }

  function tick(){ styles(); apply(); }
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
