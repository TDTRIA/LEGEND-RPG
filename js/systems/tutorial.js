(() => {
  const TUTORIAL_KEY = 'legendTutorial';
  const DONE_VALUE = 'false';
  const root = () => document.getElementById('root');

  const steps = [
    ['Welcome to LEGEND', 'This short prologue explains the basics before Ashmere throws you onto the road. You can skip it at any time.'],
    ['Character Creation', 'Your origin, class, keepsake, and Traveler Interview answers shape your starting supplies, memories, traits, and early check bonuses.'],
    ['Ashmere Hub', 'Ashmere is your first town hub. Talk to people, check your character sheet, prepare supplies, and return with proof from the Old Road.'],
    ['The Old Road', 'The main road route now uses choices. You will see the skill, DC, and your bonus before committing to risky actions.'],
    ['Combat Basics', 'Watch enemy intent. Attack builds pressure, Guard helps you survive, Exploit Opening rewards good reads, and Momentum fuels class moves.'],
    ['Inventory and Defeat', 'Your inventory now groups gear, quest proof, supplies, and trade goods. If the road defeats you, Ashmere may save you, but the road can still take something.'],
    ['First Advice', 'Talk to Mara for the main mystery, Brenn for turn-ins, Oric for combat, and Sella for food, fatigue, and road supplies.']
  ];

  let step = 0;
  let previousHTML = '';

  function shouldShow(){
    return localStorage.getItem(TUTORIAL_KEY) !== DONE_VALUE && !localStorage.getItem('legend-tutorial-seen-v070');
  }

  function finish(){
    localStorage.setItem(TUTORIAL_KEY, DONE_VALUE);
    localStorage.setItem('legend-tutorial-seen-v063', 'true');
    localStorage.setItem('legend-tutorial-seen-v070', 'true');
    if(previousHTML) root().innerHTML = previousHTML;
    location.reload();
  }

  function render(){
    const r = root();
    if(!r) return;
    const [title, text] = steps[step];
    r.innerHTML = `
      <div class="title-wrap tutorial-v070-wrap">
        <section class="title-card tutorial-v070-card">
          <div class="kicker">Optional Prologue ${step + 1}/${steps.length}</div>
          <h1 class="tutorial-v070-title">${title}</h1>
          <p class="tutorial-v070-text">${text}</p>
          <div class="tutorial-v070-progress"><span style="width:${((step + 1) / steps.length) * 100}%"></span></div>
          <div class="actions">
            <button class="btn primary" id="tutorialNext">${step === steps.length - 1 ? 'Finish Prologue' : 'Next'}</button>
            <button class="btn" id="tutorialSkip">Skip Tutorial</button>
          </div>
          <p class="small">This tutorial only appears once per browser unless you clear site data.</p>
        </section>
      </div>`;
    document.getElementById('tutorialNext').onclick = () => {
      step += 1;
      if(step >= steps.length) finish();
      else render();
    };
    document.getElementById('tutorialSkip').onclick = finish;
  }

  function installStyles(){
    if(document.getElementById('tutorialV070Styles')) return;
    const css = document.createElement('style');
    css.id = 'tutorialV070Styles';
    css.textContent = `
      .tutorial-v070-title{margin:0;color:#7dffad;font-size:clamp(2rem,8vw,5rem);line-height:.95;letter-spacing:.06em;text-shadow:0 0 22px rgba(125,255,173,.24)}
      .tutorial-v070-text{display:block!important;visibility:visible!important;opacity:1!important;max-width:780px;margin:18px 0 18px;border-left:3px solid rgba(255,211,105,.42);padding-left:14px;color:#f1ead1!important;font-size:clamp(1rem,2.2vw,1.18rem);line-height:1.7;white-space:normal!important}
      .tutorial-v070-progress{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;border:1px solid rgba(255,255,255,.06);margin:10px 0 16px}.tutorial-v070-progress span{display:block;height:100%;background:linear-gradient(90deg,#ffd369,#7dffad);box-shadow:0 0 14px rgba(125,255,173,.32)}
    `;
    document.head.appendChild(css);
  }

  window.addEventListener('load', () => {
    installStyles();
    setTimeout(() => {
      if(!shouldShow()) return;
      const r = root();
      if(!r) return;
      previousHTML = r.innerHTML;
      render();
    }, 250);
  });
})();
