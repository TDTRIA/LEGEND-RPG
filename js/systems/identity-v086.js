// LEGEND v0.8.6 - Final Fantasy Identity Pass
// Hard removes v0.7/recovered title residue and gives the title a stronger fantasy presentation.
(() => {
  const DISCORD = 'https://discord.gg/htbBvvY9N';

  function apply(){
    document.title = 'LEGEND: Roads of Ashmere v0.8.6';
    if(window.LEGEND_DATA) window.LEGEND_DATA.VERSION = 'v0.8.6';

    document.querySelectorAll('#v070TitleInfo,#legendV070WhatsNew,#v070AshmereGuide').forEach(el => el.remove());
    document.querySelectorAll('[class*="v070-title"],[id*="v070Title"]').forEach(el => el.remove());

    const title = document.querySelector('.game-title');
    const card = document.querySelector('.title-card');
    if(!title || !card) return;
    card.classList.add('v086-title-card');
    title.textContent = 'LEGEND';
    title.classList.add('v086-title-logo');

    const lore = document.querySelector('.title-lore');
    if(lore){
      lore.classList.add('v086-title-lore');
      lore.innerHTML = '<b>Roads of Ashmere</b><span>A medieval fantasy road RPG about towns, travel, monsters, rumors, supplies, and the choices you carry between settlements.</span>';
    }

    const small = document.querySelector('.title-card .small');
    if(small) small.textContent = 'Start with Mara in Ashmere. Prepare in town. Survive the Old Road. Return with proof.';

    if(!document.getElementById('v086TitleWorld')){
      const world = document.createElement('div');
      world.id = 'v086TitleWorld';
      world.className = 'v086-title-world';
      world.innerHTML = '<div class="v086-moon"></div><div class="v086-hills h1"></div><div class="v086-hills h2"></div><div class="v086-road"></div><div class="v086-town"><i></i><i></i><i></i><i></i><b></b></div><div class="v086-lantern l1"></div><div class="v086-lantern l2"></div>';
      card.prepend(world);
    }

    if(!document.getElementById('v086TitleHook')){
      const hook = document.createElement('div');
      hook.id = 'v086TitleHook';
      hook.className = 'v086-title-hook';
      hook.innerHTML = '<article><span>First Step</span><strong>Speak with Mara in Ashmere.</strong></article><article><span>Core Loop</span><strong>Prepare, travel, survive, return.</strong></article><article><span>World</span><strong>Find towns by pushing deeper down the road.</strong></article>';
      const actions = card.querySelector('.actions');
      if(actions) actions.before(hook);
    }

    const actions = card.querySelector('.actions');
    if(actions && !document.getElementById('v086Discord')){
      const a = document.createElement('a');
      a.id = 'v086Discord';
      a.className = 'btn';
      a.href = DISCORD;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Discord';
      actions.appendChild(a);
    }
  }

  function styles(){
    if(document.getElementById('identityV086Styles')) return;
    const css = document.createElement('style');
    css.id = 'identityV086Styles';
    css.textContent = `body:has(.v086-title-card){background:radial-gradient(circle at 50% 8%,rgba(255,211,105,.10),transparent 26%),radial-gradient(circle at 20% 55%,rgba(125,255,173,.08),transparent 30%),linear-gradient(180deg,#07100c,#020403)!important}.v086-title-card{position:relative;overflow:hidden!important;border-color:rgba(255,211,105,.38)!important;background:linear-gradient(180deg,rgba(12,24,18,.92),rgba(1,4,3,.96))!important;box-shadow:0 32px 120px rgba(0,0,0,.68),0 0 60px rgba(125,255,173,.08)!important}.v086-title-logo{font-size:clamp(4.2rem,16vw,11rem)!important;line-height:.78!important;letter-spacing:.06em!important;color:#7dffad!important;text-shadow:0 0 30px rgba(125,255,173,.30),0 9px 0 rgba(0,0,0,.30)!important;margin-top:18px!important}.v086-title-lore{display:block!important;max-width:820px!important;margin:12px auto 10px!important;color:#f1ead1!important;line-height:1.45!important}.v086-title-lore b{display:block;color:#ffd369;font-size:clamp(1.25rem,4vw,2.2rem);margin-bottom:4px}.v086-title-lore span{display:block;color:#d9efe1}.v086-title-world{position:relative;height:190px;margin:-8px -10px 8px;border-radius:22px;overflow:hidden;border:1px solid rgba(255,211,105,.14);background:linear-gradient(180deg,#102018 0%,#07100c 52%,#020403 100%)}.v086-moon{position:absolute;right:12%;top:20px;width:54px;height:54px;border-radius:50%;background:#ffe8ad;box-shadow:0 0 34px rgba(255,211,105,.35)}.v086-hills{position:absolute;left:-5%;right:-5%;bottom:44px;height:90px;background:linear-gradient(180deg,#162b21,#07100c);clip-path:polygon(0 70%,12% 42%,25% 62%,38% 28%,52% 66%,70% 36%,86% 58%,100% 34%,100% 100%,0 100%)}.v086-hills.h2{bottom:22px;opacity:.78;transform:scaleX(1.08);filter:blur(.4px)}.v086-road{position:absolute;left:40%;right:40%;bottom:-20px;height:120px;background:linear-gradient(90deg,transparent,rgba(255,211,105,.25),transparent);clip-path:polygon(42% 0,58% 0,100% 100%,0 100%);opacity:.75}.v086-town{position:absolute;left:14%;bottom:38px;width:180px;height:80px}.v086-town i{position:absolute;bottom:0;width:34px;background:#0d1a14;border:1px solid rgba(255,211,105,.16)}.v086-town i:nth-child(1){left:0;height:42px}.v086-town i:nth-child(2){left:38px;height:60px}.v086-town i:nth-child(3){left:78px;height:38px}.v086-town i:nth-child(4){left:118px;height:52px}.v086-town b{position:absolute;left:55px;bottom:54px;width:30px;height:34px;background:#101f17;clip-path:polygon(50% 0,100% 100%,0 100%)}.v086-lantern{position:absolute;bottom:30px;width:6px;height:34px;background:#2b2312}.v086-lantern:after{content:'';position:absolute;top:-8px;left:-7px;width:20px;height:20px;border-radius:50%;background:#ffd369;box-shadow:0 0 22px rgba(255,211,105,.8);animation:v086Lantern 1.8s ease-in-out infinite alternate}.v086-lantern.l1{left:46%}.v086-lantern.l2{left:58%;bottom:24px;animation-delay:.4s}.v086-title-hook{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}.v086-title-hook article{border:1px solid rgba(255,211,105,.22);border-radius:16px;background:rgba(255,211,105,.07);padding:11px;text-align:left}.v086-title-hook span{display:block;color:#9bb9a7;text-transform:uppercase;font-size:.68rem;letter-spacing:.12em}.v086-title-hook strong{display:block;color:#eaffef;margin-top:4px;line-height:1.25}@keyframes v086Lantern{from{opacity:.62;transform:scale(.92)}to{opacity:1;transform:scale(1.08)}}@media(max-width:820px){.v086-title-world{height:150px}.v086-title-hook{grid-template-columns:1fr}.v086-title-logo{font-size:clamp(3.8rem,23vw,7rem)!important}.v086-town{transform:scale(.78);transform-origin:left bottom}}`;
    document.head.appendChild(css);
  }

  function tick(){styles();apply();}
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { const o = new MutationObserver(()=>requestAnimationFrame(tick)); o.observe(document.body,{childList:true,subtree:true}); tick(); });
  else { const o = new MutationObserver(()=>requestAnimationFrame(tick)); o.observe(document.body,{childList:true,subtree:true}); tick(); }
})();
