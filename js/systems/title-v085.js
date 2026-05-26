// LEGEND v0.8.5 - Title Screen Refresh
// Fantasy identity pivot: LEGEND: Roads of Ashmere.
(() => {
  function refresh(){
    const title = document.querySelector('.game-title');
    const card = document.querySelector('.title-card');
    if(!title || !card || card.dataset.v085Title === '1') return;
    card.dataset.v085Title = '1';
    title.textContent = 'LEGEND';
    title.classList.add('v085-title');

    const lore = document.querySelector('.title-lore');
    if(lore){
      lore.innerHTML = '<strong>Roads of Ashmere</strong><br>A medieval fantasy road RPG about towns, travel, monsters, fatigue, rumors, and the choices you carry between settlements.';
    }
    const small = document.querySelector('.title-card .small');
    if(small){
      small.textContent = 'Create a traveler, enter Ashmere, speak with Mara, and survive your first trip onto the Old Road.';
    }
    if(!document.getElementById('v085TitleHook')){
      const hook = document.createElement('div');
      hook.id = 'v085TitleHook';
      hook.className = 'v085-title-hook';
      hook.innerHTML = '<div><span>First Goal</span><strong>Reach Ashmere and speak with Mara.</strong></div><div><span>Core Loop</span><strong>Prepare in town, travel the road, return with proof.</strong></div><div><span>Next Era</span><strong>No more recovered-build framing. This is fantasy now.</strong></div>';
      const actions = card.querySelector('.actions');
      if(actions) actions.before(hook);
    }
  }
  function installStyles(){
    if(document.getElementById('titleV085Styles')) return;
    const css = document.createElement('style');
    css.id = 'titleV085Styles';
    css.textContent = `.v085-title{font-size:clamp(4rem,15vw,10rem)!important;letter-spacing:.08em!important;line-height:.82!important;text-shadow:0 0 32px rgba(125,255,173,.25),0 8px 0 rgba(0,0,0,.28)!important}.title-lore strong{color:#ffd369;font-size:1.15em}.v085-title-hook{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}.v085-title-hook div{border:1px solid rgba(255,211,105,.22);border-radius:16px;background:rgba(255,211,105,.07);padding:11px;text-align:left}.v085-title-hook span{display:block;color:#9bb9a7;text-transform:uppercase;font-size:.68rem;letter-spacing:.12em}.v085-title-hook strong{display:block;color:#eaffef;margin-top:4px;line-height:1.25}@media(max-width:820px){.v085-title-hook{grid-template-columns:1fr}.v085-title{font-size:clamp(3.5rem,22vw,6.5rem)!important}}`;
    document.head.appendChild(css);
  }
  function tick(){ installStyles(); refresh(); }
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
