// LEGEND v0.8.8 - Title Scene Rebuild
// Replaces the blocky div-art title scene with a polished SVG illustration and removes stale v0.7/recovered labels.
(() => {
  const DISCORD = 'https://discord.gg/htbBvvY9N';
  const ID = 'v088TitleScene';

  function cleanOldText(){
    document.title = 'LEGEND: Roads of Ashmere v0.8.8';
    if(window.LEGEND_DATA) window.LEGEND_DATA.VERSION = 'v0.8.8';
    document.querySelectorAll('#v070TitleInfo,#legendV070WhatsNew,#v070AshmereGuide,#v085TitleHook,#v086TitleHook,#v086TitleWorld').forEach(el => el.remove());
    document.querySelectorAll('.v070-title-info,.v085-title-hook,.v086-title-hook,.v086-title-world').forEach(el => el.remove());
    [...document.querySelectorAll('.kicker,.small,.title-lore,p,span,strong,div')].forEach(el => {
      const txt = (el.textContent || '').trim();
      if(/0\.7\.0|recovered build|weekend playtest/i.test(txt) && el.closest('.title-card')){
        if(el.classList.contains('kicker')) el.textContent = 'v0.8.8 • Roads of Ashmere';
        else if(el.classList.contains('small')) el.textContent = 'A fantasy road RPG about towns, danger, rumors, supplies, and the road beyond Ashmere.';
      }
    });
  }

  function sceneSVG(){
    return `<svg class="v088-scene-svg" viewBox="0 0 980 360" role="img" aria-label="Ashmere at night beside the Old Road">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14291f"/><stop offset="0.55" stop-color="#07100c"/><stop offset="1" stop-color="#020403"/></linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3b2b12" stop-opacity=".08"/><stop offset=".5" stop-color="#ffd369" stop-opacity=".32"/><stop offset="1" stop-color="#3b2b12" stop-opacity=".05"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="980" height="360" fill="url(#sky)"/>
      <circle cx="805" cy="64" r="35" fill="#ffe8ad" opacity=".95" filter="url(#glow)"/>
      <path d="M0 190 C130 115 240 190 330 130 C450 55 570 190 700 120 C820 62 900 125 980 92 L980 360 L0 360 Z" fill="#102018" opacity=".92"/>
      <path d="M0 232 C125 170 240 238 365 170 C510 92 625 235 780 158 C890 104 940 144 980 132 L980 360 L0 360 Z" fill="#08110d" opacity=".95"/>
      <path d="M453 150 C432 220 378 291 318 360 L670 360 C594 290 548 218 527 150 Z" fill="url(#road)" opacity=".95"/>
      <path d="M455 150 C438 222 407 292 384 360" stroke="#ffd369" stroke-opacity=".20" stroke-width="3" fill="none"/>
      <path d="M526 150 C548 224 576 296 604 360" stroke="#ffd369" stroke-opacity=".16" stroke-width="3" fill="none"/>
      <g class="v088-town-svg" transform="translate(92 142)">
        <path d="M0 135 L0 82 L28 58 L55 82 L55 135 Z" fill="#0d1a14" stroke="#315241"/>
        <path d="M65 135 L65 48 L96 20 L128 48 L128 135 Z" fill="#102018" stroke="#315241"/>
        <path d="M143 135 L143 72 L177 42 L211 72 L211 135 Z" fill="#0b1611" stroke="#315241"/>
        <path d="M228 135 L228 58 L268 18 L307 58 L307 135 Z" fill="#101f17" stroke="#315241"/>
        <path d="M84 20 L96 0 L109 20 Z" fill="#1c3428"/>
        <rect x="20" y="94" width="13" height="22" rx="2" fill="#ffd369" opacity=".7" filter="url(#glow)"/>
        <rect x="88" y="82" width="14" height="24" rx="2" fill="#ffd369" opacity=".75" filter="url(#glow)"/>
        <rect x="168" y="92" width="12" height="20" rx="2" fill="#ffd369" opacity=".65" filter="url(#glow)"/>
        <rect x="260" y="86" width="13" height="23" rx="2" fill="#ffd369" opacity=".7" filter="url(#glow)"/>
        <path d="M-18 136 H335" stroke="#20382d" stroke-width="8"/>
      </g>
      <g class="v088-lanterns" stroke="#2b2312" stroke-width="5">
        <path d="M476 200 V260"/><circle cx="476" cy="194" r="13" fill="#ffd369" stroke="none" opacity=".9" filter="url(#glow)"/>
        <path d="M555 236 V300"/><circle cx="555" cy="230" r="11" fill="#ffd369" stroke="none" opacity=".8" filter="url(#glow)"/>
      </g>
      <g class="v088-traveler" transform="translate(502 234)">
        <path d="M12 4 C4 15 4 33 10 52 H28 C35 32 32 15 24 4 Z" fill="#050706" stroke="#ffd369" stroke-opacity=".35"/>
        <circle cx="18" cy="0" r="8" fill="#101f17" stroke="#ffd369" stroke-opacity=".35"/>
        <path d="M8 50 L1 74 M27 50 L37 74" stroke="#050706" stroke-width="6" stroke-linecap="round"/>
      </g>
      <path d="M0 335 C180 310 314 330 480 318 C650 306 780 318 980 300 V360 H0 Z" fill="#020403" opacity=".78"/>
    </svg>`;
  }

  function buildNotes(){
    return `<aside class="v088-whats-new" id="v088WhatsNew"><div class="v088-panel-head"><span>Build Notes</span><strong>v0.8.8</strong></div><ul><li>Fantasy identity pass</li><li>Town framework active</li><li>New Old Road controller</li><li>Objective guidance added</li></ul><a href="feedback.html" class="v088-mini">Feedback</a><a href="${DISCORD}" class="v088-mini" target="_blank" rel="noopener">Discord</a></aside>`;
  }

  function apply(){
    cleanOldText();
    const card = document.querySelector('.title-card');
    const title = document.querySelector('.game-title');
    if(!card || !title) return;
    card.classList.add('v088-title-card');
    title.textContent = 'LEGEND';
    title.classList.add('v088-logo');
    const lore = document.querySelector('.title-lore');
    if(lore) lore.innerHTML = '<b>Roads of Ashmere</b><span>Prepare in town. Travel the Old Road. Return with proof. Find what waits beyond the next lantern.</span>';
    if(!document.getElementById(ID)){
      const scene = document.createElement('div');
      scene.id = ID;
      scene.className = 'v088-scene';
      scene.innerHTML = sceneSVG();
      card.prepend(scene);
    }
    if(!document.getElementById('v088WhatsNew')){
      const actions = card.querySelector('.actions');
      if(actions) actions.insertAdjacentHTML('beforebegin', buildNotes());
    }
  }

  function styles(){
    if(document.getElementById('titleSceneV088Styles')) return;
    const css = document.createElement('style');
    css.id = 'titleSceneV088Styles';
    css.textContent = `body:has(.v088-title-card){background:radial-gradient(circle at 55% 0%,rgba(255,211,105,.11),transparent 25%),radial-gradient(circle at 12% 55%,rgba(125,255,173,.09),transparent 32%),linear-gradient(180deg,#07100c,#010201)!important}.v088-title-card{position:relative!important;overflow:hidden!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(230px,300px)!important;gap:16px!important;align-items:center!important;max-width:1180px!important;border:1px solid rgba(255,211,105,.38)!important;background:linear-gradient(180deg,rgba(10,20,15,.94),rgba(1,4,3,.98))!important;box-shadow:0 30px 110px rgba(0,0,0,.72),0 0 70px rgba(125,255,173,.08)!important}.v088-scene{grid-column:1 / -1;height:clamp(210px,32vw,340px);border:1px solid rgba(255,211,105,.16);border-radius:24px;overflow:hidden;background:#050806;box-shadow:inset 0 0 50px rgba(0,0,0,.40)}.v088-scene-svg{width:100%;height:100%;display:block}.v088-logo{grid-column:1;justify-self:start;font-size:clamp(4.2rem,13vw,9rem)!important;line-height:.78!important;letter-spacing:.055em!important;color:#7dffad!important;text-shadow:0 0 32px rgba(125,255,173,.32),0 8px 0 rgba(0,0,0,.32)!important;margin:0!important}.title-lore{grid-column:1!important;text-align:left!important;margin:0!important;max-width:760px!important}.title-lore b{display:block;color:#ffd369;font-size:clamp(1.25rem,3vw,2rem);line-height:1.05}.title-lore span{display:block;color:#d9efe1;margin-top:6px;line-height:1.45}.v088-whats-new{grid-column:2;grid-row:2 / span 3;border:1px solid rgba(255,211,105,.26);border-radius:20px;background:linear-gradient(180deg,rgba(255,211,105,.09),rgba(0,0,0,.24));padding:14px;text-align:left;align-self:stretch}.v088-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}.v088-panel-head span{color:#9bb9a7;text-transform:uppercase;font-size:.7rem;letter-spacing:.12em}.v088-panel-head strong{color:#ffd369}.v088-whats-new ul{margin:0 0 12px;padding-left:18px;color:#f1ead1;line-height:1.5}.v088-mini{display:inline-flex;margin:4px 6px 0 0;border:1px solid rgba(125,255,173,.22);border-radius:999px;padding:7px 10px;color:#eaffef;text-decoration:none;background:rgba(0,0,0,.22)}.title-card .small{grid-column:1;color:#b9d3c1!important;text-align:left!important}.title-card .actions{grid-column:1 / -1!important}.v088-town-svg{animation:v088TownGlow 3s ease-in-out infinite alternate}.v088-lanterns circle{animation:v088Flicker 1.8s ease-in-out infinite alternate}.v088-traveler{animation:v088Traveler 2.4s ease-in-out infinite alternate}@keyframes v088Flicker{from{opacity:.55}to{opacity:1}}@keyframes v088Traveler{from{transform:translate(502px,234px)}to{transform:translate(502px,230px)}}@keyframes v088TownGlow{from{opacity:.78}to{opacity:1}}@media(max-width:900px){.v088-title-card{grid-template-columns:1fr!important}.v088-whats-new{grid-column:1!important;grid-row:auto!important}.v088-logo,.title-lore,.title-card .small{text-align:center!important;justify-self:center}.v088-scene{height:220px}.title-card .actions{display:grid!important}.title-card .actions .btn{width:100%}}`;
    document.head.appendChild(css);
  }

  function tick(){styles();apply();}
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',()=>{const o=new MutationObserver(()=>requestAnimationFrame(tick));o.observe(document.body,{childList:true,subtree:true});tick();});
  else {const o=new MutationObserver(()=>requestAnimationFrame(tick));o.observe(document.body,{childList:true,subtree:true});tick();}
})();
