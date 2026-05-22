(() => {
  const TUTORIAL_KEY = 'legendTutorial';
  const DONE_VALUE = 'false';
  const root = () => document.getElementById('root');

  const steps = [
    ['Welcome to LEGEND', 'This short prologue explains the basics before Ashmere throws you into the road. You can skip it at any time.'],
    ['Character Creation', 'Your origin, class, and keepsake matter. They influence checks, starting supplies, class moves, and how you survive early travel.'],
    ['Ashmere Hub', 'Ashmere is your first town hub. More places open as you meet people, survive the Old Road, and bring proof back to town.'],
    ['The Old Road', 'Exploration is not free forever. v0.6.3 begins adding fatigue, road danger, time, supplies, and consequences.'],
    ['Combat Basics', 'Watch enemy intent. Attack builds pressure, Guard helps you survive, and Momentum fuels your class move.'],
    ['Save Vault', 'Use Save Vault to export a .legend file or copy a save code. This keeps your save from being trapped in one browser.'],
    ['First Advice', 'Talk to Mara for the main mystery, Brenn for turn-ins, Oric for combat, and Sella for food, fatigue, and road supplies.']
  ];

  let step = 0;
  let previousHTML = '';

  function shouldShow(){
    return localStorage.getItem(TUTORIAL_KEY) !== DONE_VALUE && !localStorage.getItem('legend-tutorial-seen-v063');
  }

  function finish(){
    localStorage.setItem(TUTORIAL_KEY, DONE_VALUE);
    localStorage.setItem('legend-tutorial-seen-v063', 'true');
    if(previousHTML) root().innerHTML = previousHTML;
    location.reload();
  }

  function render(){
    const r = root();
    if(!r) return;
    const [title, text] = steps[step];
    r.innerHTML = `
      <div class="title-wrap">
        <section class="title-card">
          <div class="kicker">Optional Prologue ${step + 1}/${steps.length}</div>
          <h1 class="game-title" style="font-size:clamp(2rem,8vw,5rem)">${title}</h1>
          <p class="title-lore">${text}</p>
          <div class="actions">
            <button class="btn primary" id="tutorialNext">${step === steps.length - 1 ? 'Finish Prologue' : 'Next'}</button>
            <button class="btn" id="tutorialSkip">Skip Tutorial</button>
          </div>
          <p class="small">You can reset this later by clearing site data while testing.</p>
        </section>
      </div>`;
    document.getElementById('tutorialNext').onclick = () => {
      step += 1;
      if(step >= steps.length) finish();
      else render();
    };
    document.getElementById('tutorialSkip').onclick = finish;
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      if(!shouldShow()) return;
      const r = root();
      if(!r) return;
      previousHTML = r.innerHTML;
      render();
    }, 250);
  });
})();
