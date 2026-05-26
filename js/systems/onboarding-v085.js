// LEGEND v0.8.5 - Fantasy Intro + Tutorial
// Replaces recovered/meta onboarding with a clear early-game fantasy spine.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const INTRO_KEY = 'legend-intro-seen-v085';
  const TUTORIAL_KEY = 'legend-tutorial-seen-v085';
  const INTRO_ID = 'legendIntroV085';

  function load(){ return RT()?.loadPlayer?.() || null; }
  function save(p){ RT()?.savePlayer?.(p); }
  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function showOverlay(steps, key, onFinish){
    let index = 0;
    let el = document.getElementById(INTRO_ID);
    if(!el){ el = document.createElement('div'); el.id = INTRO_ID; document.body.appendChild(el); }
    function render(){
      const step = steps[index];
      const last = index >= steps.length - 1;
      el.innerHTML = `<div class="v085-onboard-wrap"><section class="v085-onboard-card"><div class="v085-onboard-progress"><span style="width:${((index+1)/steps.length)*100}%"></span></div><div class="v080-kicker">${esc(step.kicker)}</div><h1>${esc(step.title)}</h1><p>${esc(step.text)}</p><div class="v085-onboard-actions"><button class="btn primary" id="v085Next">${esc(last ? step.done : step.next)}</button>${!last?'<button class="btn" id="v085Skip">Skip</button>':''}</div></section></div>`;
      document.getElementById('v085Next').onclick = () => {
        if(last) finish(); else { index++; render(); }
      };
      const skip = document.getElementById('v085Skip');
      if(skip) skip.onclick = finish;
    }
    function finish(){
      localStorage.setItem(key,'true');
      el.remove();
      if(onFinish) onFinish();
    }
    render();
  }

  function introSteps(p){
    const name = p?.username || 'Traveler';
    return [
      {kicker:'The Road Before Dawn',title:'A Lantern Burns Ahead',text:`You wake in wet grass with mud on your boots and a keepsake in your hand. Your name is ${name}, but the road behind you gives no answer when you look back.`,next:'Stand Up'},
      {kicker:'Ashmere',title:'The First Town Waits',text:'Beyond the trees sits Ashmere: a lantern-town of old timber, tired guards, and a bell tower that has been silent for years. Tonight, the bell rings once.',next:'Approach the Gate'},
      {kicker:'Your First Goal',title:'Find Mara',text:'Do not try to understand the whole town at once. Start in the Town Square. Speak with Mara. Learn why Ashmere watches the Old Road.',done:'Enter Ashmere'}
    ];
  }

  function tutorialSteps(){
    return [
      {kicker:'Start Here',title:'Follow the Main Objective',text:'LEGEND is about towns and roads. The objective card tells you what matters next, but you can still explore freely.',next:'Next'},
      {kicker:'Towns',title:'Locations Have Purpose',text:'Ashmere has a gate, square, inn, pub, shops, archive, ledger, commons, and crafting bench. Some are open now; others make more sense once you earn trust, time passes, or you bring proof from the road.',next:'Next'},
      {kicker:'The Road',title:'Prepare, Travel, Return',text:'The Old Road mixes choices, danger, battles, supplies, and discoveries. Early on, make short trips. Return with proof instead of pushing too far.',next:'Next'},
      {kicker:'Survival',title:'Watch Your Pack',text:'Food, potions, gold, gear, and road proof matter. Fatigue, time, crafting, pubs, and deeper shops are being built around this town-and-road loop.',done:'Begin'}
    ];
  }

  function maybeIntro(){
    if(localStorage.getItem(INTRO_KEY)==='true') return;
    if(document.getElementById(INTRO_ID)) return;
    const p = load();
    if(!p) return;
    const h2 = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === 'The Road to Ashmere');
    const body = document.body.innerText || '';
    if(!h2 || !/Enter Ashmere/i.test(body)) return;
    showOverlay(introSteps(p), INTRO_KEY, () => {
      const player = load();
      if(player){
        player.flags = player.flags || {};
        player.flags.introSequenceV085 = true;
        if(!Array.isArray(player.memories)) player.memories = [];
        const memory = 'You remember wet grass, a lantern-town called Ashmere, and a bell that rang once before the road went quiet.';
        if(!player.memories.includes(memory)) player.memories.push(memory);
        save(player);
      }
      const enter = [...document.querySelectorAll('button')].find(b => /Enter Ashmere/i.test(b.textContent || ''));
      if(enter) enter.click();
    });
  }

  function maybeTutorial(){
    if(localStorage.getItem(TUTORIAL_KEY)==='true') return;
    if(document.getElementById(INTRO_ID)) return;
    const title = document.querySelector('.game-title');
    if(!title) return;
    const help = document.createElement('button');
    help.className = 'btn';
    help.textContent = 'How to Play';
    help.id = 'v085HowToPlay';
    help.onclick = () => showOverlay(tutorialSteps(), TUTORIAL_KEY);
    const actions = document.querySelector('.title-card .actions');
    if(actions && !document.getElementById('v085HowToPlay')) actions.appendChild(help);
  }

  function installStyles(){
    if(document.getElementById('onboardingV085Styles')) return;
    const css = document.createElement('style');
    css.id = 'onboardingV085Styles';
    css.textContent = `#legendIntroV085{position:fixed;inset:0;z-index:10060}.v085-onboard-wrap{min-height:100svh;display:grid;place-items:center;padding:18px;background:radial-gradient(circle at 45% 18%,rgba(255,211,105,.13),transparent 28%),radial-gradient(circle at 76% 78%,rgba(125,255,173,.11),transparent 34%),linear-gradient(180deg,#0c1611,#020403);color:#eaffef;overflow:auto}.v085-onboard-card{width:min(880px,100%);border:1px solid rgba(255,211,105,.36);border-radius:28px;background:linear-gradient(180deg,rgba(18,34,26,.97),rgba(4,8,6,.98));box-shadow:0 30px 100px rgba(0,0,0,.68),0 0 54px rgba(125,255,173,.08);padding:clamp(22px,5vw,52px)}.v085-onboard-progress{height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin-bottom:24px}.v085-onboard-progress span{display:block;height:100%;background:linear-gradient(90deg,#ffd369,#7dffad)}.v085-onboard-card h1{margin:0;color:#7dffad;font-size:clamp(2.2rem,7vw,5.2rem);line-height:.98;letter-spacing:normal}.v085-onboard-card p{white-space:pre-wrap;color:#f1ead1;line-height:1.7;font-size:clamp(1rem,2vw,1.18rem);max-width:760px;margin:22px 0}.v085-onboard-actions{display:flex;gap:10px;flex-wrap:wrap}@media(max-width:720px){.v085-onboard-wrap{padding:10px;place-items:start}.v085-onboard-card{padding:20px;border-radius:20px}.v085-onboard-actions{display:grid}.v085-onboard-actions .btn{width:100%}}`;
    document.head.appendChild(css);
  }

  function tick(){ installStyles(); maybeTutorial(); maybeIntro(); }
  const rt = RT();
  if(rt?.onRender) rt.onRender(tick);
  else if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
})();
