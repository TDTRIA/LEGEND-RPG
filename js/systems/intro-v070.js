// LEGEND v0.7.0 — Cinematic Intro Layer
// Additive intro sequence and title-copy refresh. Does not rewrite restored game.js.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];
  let runningIntro = false;
  let lastRootHTML = '';

  function load(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }
  function save(p){ localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }
  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function root(){ return document.getElementById('root'); }

  function refreshTitleCopy(){
    const title = document.querySelector('.game-title');
    if(!title || title.dataset.v070Copy === '1') return;
    title.dataset.v070Copy = '1';
    const lore = document.querySelector('.title-lore');
    if(lore){
      lore.textContent = 'v0.7.0 is the Interface & Encounter Update: a cleaner RPG presentation, better inventory, choice-driven road checks, interactive combat, and real defeat consequences for the Memorial Weekend playtest.';
    }
    const small = document.querySelector('.title-card .small');
    if(small){
      small.textContent = 'Create a traveler, reach Ashmere, test the road, and send feedback from the playtest page.';
    }
  }

  function shouldTriggerIntro(){
    if(runningIntro) return false;
    const p = load();
    if(!p || p.flags?.introSequenceV070) return false;
    const h2 = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === 'The Road to Ashmere');
    if(!h2) return false;
    const body = document.body.innerText || '';
    return /You wake beneath a dead lantern/i.test(body) && /Enter Ashmere/i.test(body);
  }

  function stepsFor(p){
    const name = p?.username || 'Traveler';
    const origin = p?.origin || 'Unknown Origin';
    const cls = p?.className || 'Wanderer';
    const keepsake = p?.keepsake || 'a cracked token';
    return [
      {
        kicker:'Before Ashmere',
        title:'The Save Remembers You',
        text:`There is a moment before waking where you are only a name in the dark.\n\n${name}.\n\nThe world says it like it found you in an old file and dragged you back into the light.`,
        button:'Open Your Eyes'
      },
      {
        kicker:'Character Recovered',
        title:'Something Came With You',
        text:`Origin: ${origin}.\nClass: ${cls}.\nKeepsake: ${keepsake}.\n\nThese are not just labels. They are the pieces of you the road failed to erase.`,
        button:'Reach for the Keepsake'
      },
      {
        kicker:'The First Sound',
        title:'A Bell Rings Once',
        text:'Ahead, a dead lantern swings without wind. Beyond it waits a town behind a tired wooden gate.\n\nThe bell rings once.\n\nThen the bell forgets it ever moved.',
        button:'Follow the Bell'
      },
      {
        kicker:'Ashmere Road',
        title:'The Road Lets You Pass',
        text:'Behind you, the path collapses into static. Ahead, the sign is old enough to know your name.\n\nASHMERE.\n\nWhatever took you is still out there. Whatever saved you is inside the gate.',
        button:'Enter Ashmere'
      }
    ];
  }

  function renderStep(index, p){
    const steps = stepsFor(p);
    const step = steps[index];
    const isLast = index >= steps.length - 1;
    const r = root();
    if(!r) return;
    r.innerHTML = `
      <div class="intro-v070-wrap">
        <section class="intro-v070-card" aria-label="Intro sequence">
          <div class="intro-v070-progress"><span style="width:${((index+1)/steps.length)*100}%"></span></div>
          <div class="intro-v070-kicker">${esc(step.kicker)}</div>
          <h1>${esc(step.title)}</h1>
          <p>${esc(step.text)}</p>
          <div class="intro-v070-actions">
            <button class="btn primary" id="introNext">${esc(step.button)}</button>
            ${!isLast ? '<button class="btn" id="introSkip">Skip Intro</button>' : ''}
          </div>
        </section>
      </div>`;
    const next = document.getElementById('introNext');
    const skip = document.getElementById('introSkip');
    next.onclick = () => {
      if(isLast) finishIntro();
      else renderStep(index + 1, p);
    };
    if(skip) skip.onclick = finishIntro;
  }

  function finishIntro(){
    const p = load();
    if(p){
      p.flags = p.flags || {};
      p.flags.introSequenceV070 = true;
      if(!Array.isArray(p.memories)) p.memories = [];
      const memory = 'You remember the dead lantern, the broken bell, and the sign that read ASHMERE.';
      if(!p.memories.includes(memory)) p.memories.push(memory);
      save(p);
    }
    runningIntro = false;
    if(lastRootHTML && root()){
      root().innerHTML = lastRootHTML;
      const enter = [...document.querySelectorAll('button')].find(b => /Enter Ashmere/i.test(b.textContent || ''));
      if(enter) enter.focus();
    }else{
      location.reload();
    }
  }

  function startIntro(){
    const p = load();
    const r = root();
    if(!p || !r) return;
    runningIntro = true;
    lastRootHTML = r.innerHTML;
    renderStep(0, p);
  }

  function installStyles(){
    if(document.getElementById('introV070Styles')) return;
    const css = document.createElement('style');
    css.id = 'introV070Styles';
    css.textContent = `
      .intro-v070-wrap{min-height:100svh;display:grid;place-items:center;padding:18px;background:radial-gradient(circle at 50% 20%,rgba(125,255,173,.14),transparent 28%),radial-gradient(circle at 70% 80%,rgba(255,211,105,.10),transparent 32%),linear-gradient(180deg,#08110d,#020403);color:#eaffef;position:relative;overflow:hidden}.intro-v070-wrap:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.026) 0 1px,transparent 1px 42px),repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 1px,transparent 1px 64px);animation:introDrift 16s ease-in-out infinite alternate}.intro-v070-card{position:relative;width:min(880px,100%);border:1px solid rgba(255,211,105,.34);border-radius:26px;background:linear-gradient(180deg,rgba(16,30,24,.94),rgba(4,8,6,.96));box-shadow:0 30px 100px rgba(0,0,0,.68),0 0 54px rgba(125,255,173,.08);padding:clamp(22px,5vw,52px);animation:introCardIn .38s ease both}.intro-v070-card:before{content:"";position:absolute;inset:9px;border:1px solid rgba(125,255,173,.12);border-radius:18px;pointer-events:none}.intro-v070-progress{height:8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.06);border-radius:999px;overflow:hidden;margin-bottom:24px}.intro-v070-progress span{display:block;height:100%;background:linear-gradient(90deg,#ffd369,#7dffad);box-shadow:0 0 16px rgba(125,255,173,.32);transition:width .28s ease}.intro-v070-kicker{color:#ffd369;text-transform:uppercase;letter-spacing:.28em;font-size:.75rem;margin-bottom:10px}.intro-v070-card h1{margin:0;color:#7dffad;font-size:clamp(2.4rem,8vw,5.8rem);line-height:.92;text-shadow:0 0 24px rgba(125,255,173,.22)}.intro-v070-card p{white-space:pre-wrap;color:#f1ead1;line-height:1.72;font-size:clamp(1rem,2vw,1.18rem);max-width:720px;margin:22px 0}.intro-v070-actions{display:flex;gap:10px;flex-wrap:wrap}@keyframes introCardIn{from{opacity:0;transform:translateY(12px);filter:blur(5px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}@keyframes introDrift{from{transform:translateX(-1%) scale(1.02)}to{transform:translateX(1%) scale(1.04)}}body.a11y-reduced-motion .intro-v070-wrap:before,body.a11y-reduced-motion .intro-v070-card{animation:none!important}@media(max-width:720px){.intro-v070-wrap{padding:10px;place-items:start}.intro-v070-card{padding:20px;border-radius:20px}.intro-v070-actions{display:grid}.intro-v070-actions .btn{width:100%}}`;
    document.head.appendChild(css);
  }

  function check(){
    refreshTitleCopy();
    if(shouldTriggerIntro()) startIntro();
  }

  window.addEventListener('DOMContentLoaded', () => {
    installStyles();
    const observer = new MutationObserver(()=>requestAnimationFrame(check));
    observer.observe(document.body,{childList:true,subtree:true});
    check();
  });
})();