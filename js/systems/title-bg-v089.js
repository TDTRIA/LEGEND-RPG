// LEGEND v0.8.9 - Fullscreen Title Menu
// True game-style main menu: full viewport art, buttons left, title upper-right, What's New bottom-right.
(() => {
  const BG = 'assets/title/title_bg_ashmere_road_v089.jpg?v=0.8.9-fullscreen';
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
        <li>Fullscreen Ashmere title art</li>
        <li>Town framework is active</li>
        <li>Old Road controller is active</li>
        <li>Main objective guidance added</li>
      </ul>
      <div class="v089-links"><a href="feedback.html">Feedback</a><a href="${DISCORD}" target="_blank" rel="noopener">Discord</a></div>
    </aside>`;
  }

  function apply(){
    clean();
    const shell = document.querySelector('.title-card');
    const title = document.querySelector('.game-title');
    if(!shell || !title) return;

    shell.classList.add('v089-title-card');
    title.textContent = 'LEGEND';
    title.classList.add('v089-logo');

    const kicker = shell.querySelector('.kicker');
    if(kicker) kicker.textContent = 'v0.8.9 • Roads of Ashmere';

    const lore = document.querySelector('.title-lore');
    if(lore) lore.innerHTML = '<b>Roads of Ashmere</b><span>Prepare in town. Travel the Old Road. Return with proof.</span>';

    const small = shell.querySelector('.small');
    if(small) small.textContent = 'Start with Mara, gather supplies, and survive your first road journey.';

    if(!document.getElementById('v089Bg')){
      const bg = document.createElement('div');
      bg.id = 'v089Bg';
      bg.className = 'v089-bg';
      bg.style.backgroundImage = `url("${BG}")`;
      shell.prepend(bg);
    }

    if(!document.getElementById('v089TitleBlock')){
      const block = document.createElement('div');
      block.id = 'v089TitleBlock';
      block.className = 'v089-title-block';
      if(kicker) block.appendChild(kicker);
      block.appendChild(title);
      if(lore) block.appendChild(lore);
      shell.appendChild(block);
    }

    const actions = shell.querySelector('.actions');
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
      shell.appendChild(menu);
    }

    if(!document.getElementById('v089WhatsNew')) shell.insertAdjacentHTML('beforeend', whatsNew());
  }

  function styles(){
    if(document.getElementById('titleBgV089Styles')) return;
    const css = document.createElement('style');
    css.id = 'titleBgV089Styles';
    css.textContent = `
      html:has(.v089-title-card), body:has(.v089-title-card){height:100%;margin:0!important;overflow:hidden;background:#020403!important;}
      body:has(.v089-title-card) #root{position:fixed!important;inset:0!important;width:100vw!important;height:100svh!important;margin:0!important;padding:0!important;overflow:hidden!important;}
      body:has(.v089-title-card) .shell,
      body:has(.v089-title-card) main,
      body:has(.v089-title-card) .screen,
      body:has(.v089-title-card) .title-wrap{
        position:fixed!important;inset:0!important;width:100vw!important;height:100svh!important;max-width:none!important;margin:0!important;padding:0!important;display:block!important;overflow:hidden!important;background:#020403!important;
      }
      .v089-title-card{
        position:fixed!important;inset:0!important;width:100vw!important;height:100svh!important;min-width:100vw!important;min-height:100svh!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;overflow:hidden!important;background:#020403!important;box-shadow:none!important;display:block!important;text-align:left!important;
      }
      .v089-bg{position:absolute;inset:0;background-size:cover;background-position:center center;filter:saturate(.96) contrast(1.04);transform:scale(1.01);z-index:0;}
      .v089-title-card:before{content:'';position:absolute;inset:0;z-index:1;background:radial-gradient(circle at 71% 18%,rgba(255,211,105,.08),transparent 25%),linear-gradient(90deg,rgba(2,4,3,.78) 0%,rgba(2,4,3,.28) 34%,rgba(2,4,3,.10) 60%,rgba(2,4,3,.74) 100%),linear-gradient(180deg,rgba(2,4,3,.10),rgba(2,4,3,.82));pointer-events:none;}
      .v089-title-card>*:not(.v089-bg){position:relative;z-index:2;}
      .v089-title-block{position:absolute!important;top:clamp(22px,5vw,64px)!important;right:clamp(18px,5vw,70px)!important;width:min(560px,46vw)!important;text-align:right!important;display:grid!important;gap:8px!important;justify-items:end!important;}
      .v089-logo{margin:0!important;color:#eaffef!important;font-size:clamp(4.8rem,13vw,11rem)!important;line-height:.76!important;letter-spacing:.055em!important;text-shadow:0 0 26px rgba(255,211,105,.25),0 10px 0 rgba(0,0,0,.48)!important;}
      .v089-title-card .kicker{color:#ffd369!important;background:rgba(0,0,0,.38)!important;border:1px solid rgba(255,211,105,.24)!important;border-radius:999px!important;padding:7px 12px!important;letter-spacing:.12em!important;text-transform:uppercase!important;font-size:.75rem!important;backdrop-filter:blur(5px)!important;}
      .v089-title-card .title-lore{max-width:430px!important;text-align:right!important;margin:0!important;background:rgba(0,0,0,.22)!important;border:1px solid rgba(255,211,105,.14)!important;border-radius:18px!important;padding:12px 14px!important;backdrop-filter:blur(5px)!important;}
      .v089-title-card .title-lore b{display:block!important;color:#ffd369!important;font-size:clamp(1.45rem,3vw,2.35rem)!important;line-height:1.05!important;}
      .v089-title-card .title-lore span{display:block!important;color:#f1ead1!important;line-height:1.42!important;margin-top:6px!important;}
      .v089-menu-block{position:absolute!important;left:clamp(18px,5vw,64px)!important;bottom:clamp(22px,5vw,64px)!important;width:min(330px,35vw)!important;display:grid!important;gap:10px!important;}
      .v089-menu-label{width:max-content!important;color:#ffd369!important;background:rgba(0,0,0,.42)!important;border:1px solid rgba(255,211,105,.22)!important;border-radius:999px!important;padding:7px 11px!important;text-transform:uppercase!important;letter-spacing:.12em!important;font-size:.72rem!important;backdrop-filter:blur(5px)!important;}
      .v089-title-card .actions{display:grid!important;gap:9px!important;justify-content:stretch!important;margin:0!important;width:100%!important;}
      .v089-title-card .actions .btn{width:100%!important;text-align:left!important;justify-content:flex-start!important;background:rgba(7,12,9,.72)!important;border:1px solid rgba(255,211,105,.26)!important;color:#eaffef!important;box-shadow:0 12px 28px rgba(0,0,0,.34)!important;backdrop-filter:blur(5px)!important;border-radius:14px!important;padding:12px 14px!important;}
      .v089-title-card .actions .btn.primary{background:linear-gradient(180deg,#ffe29a,#bf7f2a)!important;color:#241803!important;border-color:rgba(255,211,105,.72)!important;}
      .v089-title-card .small{color:#d8e6dc!important;text-align:left!important;text-shadow:0 2px 5px rgba(0,0,0,.9)!important;background:rgba(0,0,0,.30)!important;border:1px solid rgba(125,255,173,.14)!important;border-radius:14px!important;padding:10px 12px!important;backdrop-filter:blur(5px)!important;}
      .v089-whats-new{position:absolute!important;right:clamp(18px,5vw,70px)!important;bottom:clamp(22px,5vw,64px)!important;width:min(310px,30vw)!important;border:1px solid rgba(255,211,105,.28)!important;border-radius:20px!important;background:rgba(4,8,6,.58)!important;backdrop-filter:blur(8px)!important;padding:15px!important;text-align:left!important;box-shadow:0 18px 50px rgba(0,0,0,.38)!important;}
      .v089-panel-head{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:10px!important;margin-bottom:10px!important;}
      .v089-panel-head span{color:#9bb9a7!important;text-transform:uppercase!important;letter-spacing:.12em!important;font-size:.7rem!important;}
      .v089-panel-head strong{color:#ffd369!important;}
      .v089-whats-new ul{margin:0 0 12px!important;padding-left:19px!important;color:#f1ead1!important;line-height:1.5!important;}
      .v089-links{display:flex!important;gap:8px!important;flex-wrap:wrap!important;}
      .v089-links a{border:1px solid rgba(125,255,173,.22)!important;border-radius:999px!important;background:rgba(0,0,0,.22)!important;color:#eaffef!important;text-decoration:none!important;padding:7px 10px!important;}
      @media(max-width:920px){
        html:has(.v089-title-card), body:has(.v089-title-card){overflow:auto!important;}
        body:has(.v089-title-card) #root,.v089-title-card{min-height:100svh!important;height:auto!important;overflow:auto!important;}
        .v089-title-card:before{background:linear-gradient(180deg,rgba(2,4,3,.28),rgba(2,4,3,.9));}
        .v089-title-block,.v089-menu-block,.v089-whats-new{position:relative!important;top:auto!important;right:auto!important;left:auto!important;bottom:auto!important;width:auto!important;margin:14px!important;}
        .v089-title-block{padding-top:10px;text-align:center!important;justify-items:center!important;}
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
