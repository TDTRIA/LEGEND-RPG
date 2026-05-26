// LEGEND v0.8.9 - Real Title Background Hook
// Uses uploaded title art from assets/title/title_bg_ashmere_road_v089.jpg
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
        <li>New Ashmere title art support</li>
        <li>Town framework active</li>
        <li>Old Road controller active</li>
        <li>Objective guidance added</li>
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
    if(lore) lore.innerHTML = '<b>Roads of Ashmere</b><span>Prepare in town. Travel the Old Road. Return with proof. Find what waits beyond the next lantern.</span>';

    const small = card.querySelector('.small');
    if(small) small.textContent = 'Start with Mara, gather supplies, and survive your first road journey.';

    if(!document.getElementById('v089Bg')){
      const bg = document.createElement('div');
      bg.id = 'v089Bg';
      bg.className = 'v089-bg';
      bg.style.backgroundImage = `url("${BG}")`;
      card.prepend(bg);
    }

    if(!document.getElementById('v089WhatsNew')){
      const actions = card.querySelector('.actions');
      if(actions) actions.insertAdjacentHTML('beforebegin', whatsNew());
    }
  }

  function styles(){
    if(document.getElementById('titleBgV089Styles')) return;
    const css = document.createElement('style');
    css.id = 'titleBgV089Styles';
    css.textContent = `
      body:has(.v089-title-card){background:#020403!important;}
      .v089-title-card{
        position:relative!important;
        width:min(1180px,calc(100% - 18px))!important;
        min-height:min(760px,calc(100svh - 28px))!important;
        overflow:hidden!important;
        border:1px solid rgba(255,211,105,.28)!important;
        border-radius:28px!important;
        background:#020403!important;
        box-shadow:0 30px 120px rgba(0,0,0,.78)!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(250px,310px)!important;
        grid-template-rows:auto 1fr auto!important;
        gap:14px!important;
        align-items:end!important;
        padding:clamp(18px,4vw,44px)!important;
      }
      .v089-bg{position:absolute;inset:0;background-size:cover;background-position:center center;filter:saturate(.92) contrast(1.04);transform:scale(1.01);z-index:0;}
      .v089-title-card:before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(2,4,3,.86) 0%,rgba(2,4,3,.58) 34%,rgba(2,4,3,.14) 62%,rgba(2,4,3,.62) 100%),linear-gradient(180deg,rgba(2,4,3,.10),rgba(2,4,3,.84));pointer-events:none;}
      .v089-title-card>*:not(.v089-bg){position:relative;z-index:2;}
      .v089-logo{grid-column:1!important;align-self:end!important;justify-self:start!important;margin:0!important;color:#eaffef!important;font-size:clamp(4.5rem,13vw,10rem)!important;line-height:.78!important;letter-spacing:.06em!important;text-shadow:0 0 24px rgba(255,211,105,.28),0 10px 0 rgba(0,0,0,.45)!important;}
      .v089-title-card .kicker{grid-column:1!important;align-self:start!important;justify-self:start!important;color:#ffd369!important;background:rgba(0,0,0,.34);border:1px solid rgba(255,211,105,.22);border-radius:999px;padding:7px 11px;letter-spacing:.12em!important;}
      .v089-title-card .title-lore{grid-column:1!important;max-width:650px!important;text-align:left!important;margin:0!important;background:rgba(0,0,0,.30);border:1px solid rgba(255,211,105,.18);border-radius:18px;padding:14px 16px;backdrop-filter:blur(4px);}
      .v089-title-card .title-lore b{display:block;color:#ffd369;font-size:clamp(1.4rem,3.3vw,2.35rem);line-height:1.05;}
      .v089-title-card .title-lore span{display:block;color:#f1ead1;line-height:1.45;margin-top:6px;}
      .v089-title-card .small{grid-column:1!important;text-align:left!important;color:#cfe1d4!important;max-width:620px!important;text-shadow:0 2px 4px rgba(0,0,0,.8)!important;}
      .v089-title-card .actions{grid-column:1!important;display:flex!important;gap:10px!important;flex-wrap:wrap!important;justify-content:flex-start!important;}
      .v089-title-card .actions .btn{background:rgba(7,12,9,.72)!important;border:1px solid rgba(255,211,105,.26)!important;color:#eaffef!important;box-shadow:0 10px 24px rgba(0,0,0,.28)!important;backdrop-filter:blur(4px);}
      .v089-title-card .actions .btn.primary{background:linear-gradient(180deg,#ffe29a,#bf7f2a)!important;color:#241803!important;border-color:rgba(255,211,105,.7)!important;}
      .v089-whats-new{grid-column:2!important;grid-row:1 / span 3!important;align-self:center!important;border:1px solid rgba(255,211,105,.28);border-radius:20px;background:rgba(4,8,6,.58);backdrop-filter:blur(8px);padding:15px;text-align:left;box-shadow:0 18px 50px rgba(0,0,0,.35);}
      .v089-panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;}
      .v089-panel-head span{color:#9bb9a7;text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;}
      .v089-panel-head strong{color:#ffd369;}
      .v089-whats-new ul{margin:0 0 12px;padding-left:19px;color:#f1ead1;line-height:1.5;}
      .v089-links{display:flex;gap:8px;flex-wrap:wrap;}
      .v089-links a{border:1px solid rgba(125,255,173,.22);border-radius:999px;background:rgba(0,0,0,.22);color:#eaffef;text-decoration:none;padding:7px 10px;}
      @media(max-width:900px){
        .v089-title-card{grid-template-columns:1fr!important;min-height:calc(100svh - 12px)!important;border-radius:20px!important;padding:16px!important;}
        .v089-title-card:before{background:linear-gradient(180deg,rgba(2,4,3,.42),rgba(2,4,3,.88));}
        .v089-logo,.v089-title-card .title-lore,.v089-title-card .small,.v089-title-card .kicker{grid-column:1!important;text-align:center!important;justify-self:center!important;}
        .v089-title-card .actions{grid-column:1!important;display:grid!important;width:100%!important;}
        .v089-title-card .actions .btn{width:100%!important;}
        .v089-whats-new{grid-column:1!important;grid-row:auto!important;align-self:auto!important;}
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
