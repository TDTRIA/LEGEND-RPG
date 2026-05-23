// LEGEND v0.8 - Enemy Sprite Pass
// Replaces emoji glyph display with generated SVG/CSS monster portraits. Logic untouched.
(() => {
  function spriteFor(name='enemy'){
    const n = String(name).toLowerCase();
    if(n.includes('goblin')) return goblin();
    if(n.includes('wolf') || n.includes('hound')) return wolf();
    if(n.includes('slime') || n.includes('ooze')) return slime();
    if(n.includes('wisp') || n.includes('spirit')) return wisp();
    if(n.includes('bone') || n.includes('skeleton')) return bone();
    return roadBeast();
  }

  function goblin(){return `<svg class="v080-enemy-svg" viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="gobA" x1="0" x2="1"><stop stop-color="#233a2b"/><stop offset="1" stop-color="#7dffad"/></linearGradient></defs><path d="M26 72 4 42l42 11c9-17 26-28 46-25 24 4 41 25 39 50l25 12-29 10c-9 21-31 34-55 29-24-5-42-24-46-57Z" fill="url(#gobA)" opacity=".85"/><path d="M48 70c11-13 45-17 66 2" fill="none" stroke="#ffd369" stroke-width="5"/><circle cx="58" cy="82" r="7" fill="#ff6b6b"/><circle cx="103" cy="82" r="7" fill="#ff6b6b"/><path d="M64 108c12 8 28 8 40 0" fill="none" stroke="#08110d" stroke-width="6" stroke-linecap="round"/></svg>`;}
  function wolf(){return `<svg class="v080-enemy-svg" viewBox="0 0 160 160" aria-hidden="true"><path d="M25 104 47 48l20 25 26-33 25 35 20-18-10 55c-14 23-72 30-103-8Z" fill="#1a2922" stroke="#7dffad" stroke-width="4"/><path d="M44 102c18 15 56 17 78 0" fill="none" stroke="#ffd369" stroke-width="5"/><circle cx="63" cy="83" r="6" fill="#ff6b6b"/><circle cx="104" cy="83" r="6" fill="#ff6b6b"/><path d="M78 94h12l-6 8Z" fill="#eaffef"/></svg>`;}
  function slime(){return `<svg class="v080-enemy-svg" viewBox="0 0 160 160" aria-hidden="true"><path d="M30 104c0-42 22-78 52-78s50 35 50 78c0 31-102 31-102 0Z" fill="#203f33" stroke="#7dffad" stroke-width="4"/><path d="M48 112c16 9 54 10 72 0" fill="none" stroke="#ffd369" stroke-width="5"/><circle cx="62" cy="82" r="6" fill="#eaffef"/><circle cx="99" cy="82" r="6" fill="#eaffef"/><path d="M57 125c21 6 43 5 62-2" stroke="#7dffad" stroke-width="3" opacity=".55"/></svg>`;}
  function wisp(){return `<svg class="v080-enemy-svg" viewBox="0 0 160 160" aria-hidden="true"><path d="M82 10c30 35 18 55 2 76 21-8 35-2 42 14 12 28-19 49-48 48-35-1-55-27-39-58 12-24 35-33 43-80Z" fill="#162821" stroke="#9fc8ff" stroke-width="4"/><path d="M58 91c13-18 38-18 52 0" fill="none" stroke="#ffd369" stroke-width="5"/><circle cx="68" cy="101" r="5" fill="#7dffad"/><circle cx="98" cy="101" r="5" fill="#7dffad"/></svg>`;}
  function bone(){return `<svg class="v080-enemy-svg" viewBox="0 0 160 160" aria-hidden="true"><path d="M52 44c0-19 57-19 57 0v33c0 24-57 24-57 0V44Z" fill="#d9efe1" opacity=".82" stroke="#ffd369" stroke-width="4"/><circle cx="68" cy="67" r="7" fill="#050706"/><circle cx="94" cy="67" r="7" fill="#050706"/><path d="M65 97h31" stroke="#050706" stroke-width="5"/><path d="M42 120h76M52 138h56" stroke="#d9efe1" stroke-width="8" stroke-linecap="round"/></svg>`;}
  function roadBeast(){return `<svg class="v080-enemy-svg" viewBox="0 0 160 160" aria-hidden="true"><path d="M24 93c12-38 35-57 70-54 31 3 44 28 43 61-13 23-41 34-75 28-16-3-29-14-38-35Z" fill="#17241d" stroke="#7dffad" stroke-width="4"/><path d="M31 91 13 75l27-2M124 75l28-8-18 25" stroke="#ffd369" stroke-width="5" fill="none"/><circle cx="65" cy="82" r="6" fill="#ff6b6b"/><circle cx="101" cy="82" r="6" fill="#ff6b6b"/><path d="M65 109c12 7 27 7 39 0" stroke="#ffd369" stroke-width="4" fill="none"/></svg>`;}

  function enhanceEnemies(){
    document.querySelectorAll('.enemy').forEach(enemy => {
      if(enemy.dataset.v080Sprite === '1') return;
      const name = enemy.querySelector('h2')?.textContent || 'enemy';
      const glyph = enemy.querySelector('.glyph');
      if(!glyph) return;
      glyph.classList.add('v080-enemy-sprite');
      glyph.innerHTML = spriteFor(name);
      enemy.dataset.v080Sprite = '1';
    });
  }

  const css = document.createElement('style');
  css.textContent = `.enemy{overflow:hidden;position:relative}.v080-enemy-sprite{font-size:0!important;line-height:0!important;margin:0 auto 10px!important;width:min(180px,58vw);height:min(180px,58vw);display:grid!important;place-items:center!important;border:1px solid rgba(255,211,105,.28);border-radius:28px;background:radial-gradient(circle at 50% 35%,rgba(125,255,173,.16),transparent 42%),linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.36));box-shadow:inset 0 0 42px rgba(0,0,0,.36),0 18px 44px rgba(0,0,0,.25)}.v080-enemy-svg{width:88%;height:88%;filter:drop-shadow(0 0 18px rgba(125,255,173,.20))}`;
  document.head.appendChild(css);

  function start(){
    enhanceEnemies();
    const observer = new MutationObserver(() => requestAnimationFrame(enhanceEnemies));
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
