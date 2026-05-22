// LEGEND v0.7.0 — Deeper Character Creation
// Additive Traveler Interview that runs after origin/class/keepsake and before the intro cinematic.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];
  let running = false;
  let savedRoadScreen = '';

  const questions = [
    {
      id:'scar', kicker:'Traveler Interview', title:'What did the road fail to take?',
      text:'Before Ashmere finds you, the road searches your pockets, your bones, and your memory. One thing stays yours.',
      options:[
        {label:'My nerve', trait:'Steady Nerve', memory:'The road tried to scare you first. It failed.', effects:{mastery:{Woodcutting:4,Mining:4}, stat:'strength', fatigue:-1}},
        {label:'My hunger', trait:'Road-Hungry', memory:'You woke starving, but ready to keep moving.', effects:{items:{food:2}, mastery:{Cooking:6}, stat:'survival'}},
        {label:'My suspicion', trait:'Never Trust the Road', memory:'You learned to doubt quiet paths and friendly shortcuts.', effects:{items:{bait:3}, mastery:{Thieving:5}, stat:'thieving'}},
        {label:'My strange dreams', trait:'Static-Touched', memory:'You dreamed in green letters and broken bells.', effects:{items:{rtab:1}, mastery:{Fishing:3}, stat:'lore'}}
      ]
    },
    {
      id:'method', kicker:'First Instinct', title:'How do you survive trouble?',
      text:'A shape moves in the dark beyond the lantern. You have only a heartbeat to decide what kind of person you are.',
      options:[
        {label:'Stand your ground', trait:'Stands Ground', memory:'Your first instinct is to plant your feet and make the world move around you.', effects:{hp:8, stat:'strength'}},
        {label:'Look for a way around', trait:'Pathfinder', memory:'You survived by finding the thin space between danger and disaster.', effects:{items:{camp:1}, stat:'survival'}},
        {label:'Talk before blood spills', trait:'Silver-Tongued', memory:'You know that not every fight begins with a weapon.', effects:{gold:25, townTrust:1, stat:'luck'}},
        {label:'Touch the impossible thing', trait:'Rune-Curious', memory:'You reach for magic even when it reaches back.', effects:{items:{potion:1}, stat:'magic'}}
      ]
    },
    {
      id:'vow', kicker:'The Promise', title:'What do you promise yourself?',
      text:'At the Ashmere sign, the bell rings once. The sound feels like a question you are not ready to answer.',
      options:[
        {label:'I will find out why I was recovered.', trait:'Recovered Seeker', memory:'You promised to learn why the world remembered you.', effects:{xp:40, stat:'lore'}},
        {label:'I will become stronger than the road.', trait:'Roadbreaker', memory:'You promised the road would regret letting you live.', effects:{hp:6, mastery:{Mining:5}, stat:'strength'}},
        {label:'I will help Ashmere survive this.', trait:'Ashmere-Bound', memory:'You promised the first town would not face the static alone.', effects:{townTrust:2, items:{food:1}, stat:'craft'}},
        {label:'I will leave with more than I came with.', trait:'Opportunist', memory:'You promised to take payment from every danger you survived.', effects:{gold:45, mastery:{Thieving:4}, stat:'thieving'}}
      ]
    }
  ];

  function load(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }
  function save(p){ localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }
  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function root(){return document.getElementById('root');}

  function applyEffects(p, choice, qid){
    p.flags = p.flags || {};
    p.inventory = p.inventory || {};
    p.memories = p.memories || [];
    p.traits = p.traits || [];
    p.mastery = p.mastery || {};
    p.townTrust = p.townTrust || {Ashmere:0};
    p.creationV070 = p.creationV070 || {answers:[]};

    if(choice.trait && !p.traits.includes(choice.trait)) p.traits.push(choice.trait);
    if(choice.memory && !p.memories.includes(choice.memory)) p.memories.push(choice.memory);
    p.creationV070.answers.push({question:qid,label:choice.label,trait:choice.trait});

    const e = choice.effects || {};
    if(e.items) Object.entries(e.items).forEach(([k,v]) => p.inventory[k] = Number(p.inventory[k] || 0) + Number(v || 0));
    if(e.gold) p.gold = Number(p.gold || 0) + Number(e.gold || 0);
    if(e.hp){ p.maxHp = Number(p.maxHp || 1) + Number(e.hp || 0); p.hp = Number(p.hp || p.maxHp) + Number(e.hp || 0); }
    if(e.xp){ p.xp = Number(p.xp || 0) + Number(e.xp || 0); p.xpUntil = Math.max(1, Number(p.xpUntil || 420) - Number(e.xp || 0)); }
    if(e.fatigue) p.fatigue = Math.max(0, Number(p.fatigue || 0) + Number(e.fatigue || 0));
    if(e.townTrust) p.townTrust.Ashmere = Number(p.townTrust.Ashmere || 0) + Number(e.townTrust || 0);
    if(e.mastery) Object.entries(e.mastery).forEach(([k,v]) => p.mastery[k] = Number(p.mastery[k] || 0) + Number(v || 0));
    if(e.stat){
      p.creationV070.bonuses = p.creationV070.bonuses || {};
      p.creationV070.bonuses[e.stat] = Number(p.creationV070.bonuses[e.stat] || 0) + 1;
    }
  }

  function renderQuestion(index){
    const p = load();
    const r = root();
    if(!p || !r) return;
    const q = questions[index];
    r.innerHTML = `
      <div class="creation-v070-wrap">
        <section class="creation-v070-card">
          <div class="creation-v070-progress"><span style="width:${((index+1)/questions.length)*100}%"></span></div>
          <div class="creation-v070-kicker">${esc(q.kicker)} ${index+1}/${questions.length}</div>
          <h1>${esc(q.title)}</h1>
          <p class="creation-v070-text">${esc(q.text)}</p>
          <div class="creation-v070-grid">
            ${q.options.map((o,i)=>`
              <button class="creation-v070-choice" data-choice="${i}">
                <strong>${esc(o.label)}</strong>
                <span>${esc(o.trait)}</span>
                <small>${preview(o.effects)}</small>
              </button>`).join('')}
          </div>
        </section>
      </div>`;
    document.querySelectorAll('[data-choice]').forEach(btn => {
      btn.onclick = () => {
        const choice = q.options[Number(btn.dataset.choice)];
        const current = load();
        if(!current) return;
        applyEffects(current, choice, q.id);
        save(current);
        if(index >= questions.length - 1) finish();
        else renderQuestion(index + 1);
      };
    });
  }

  function preview(e={}){
    const bits = [];
    if(e.stat) bits.push(`+1 ${e.stat} background`);
    if(e.hp) bits.push(`+${e.hp} max HP`);
    if(e.gold) bits.push(`+${e.gold} gold`);
    if(e.xp) bits.push(`+${e.xp} XP`);
    if(e.townTrust) bits.push(`+${e.townTrust} Ashmere trust`);
    if(e.items) Object.entries(e.items).forEach(([k,v])=>bits.push(`+${v} ${itemName(k)}`));
    if(e.mastery) bits.push('starting mastery');
    if(e.fatigue) bits.push('less starting fatigue');
    return bits.join(' / ') || 'story trait';
  }
  function itemName(k){return window.LEGEND_DATA?.itemNames?.[k] || k;}

  function finish(){
    const p = load();
    if(p){
      p.flags = p.flags || {};
      p.flags.creationInterviewV070 = true;
      if(!Array.isArray(p.questLog)) p.questLog = [];
      const q = 'Traveler Interview: Your traits, memories, and instincts now shape checks and future story moments.';
      if(!p.questLog.includes(q)) p.questLog.push(q);
      save(p);
    }
    running = false;
    if(root() && savedRoadScreen){
      root().innerHTML = savedRoadScreen;
      savedRoadScreen = '';
      requestAnimationFrame(() => {
        if(window.LegendIntroV070?.check) window.LegendIntroV070.check();
      });
    }else location.reload();
  }

  function shouldStart(){
    if(running) return false;
    const p = load();
    if(!p || p.flags?.creationInterviewV070) return false;
    const h2 = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === 'The Road to Ashmere');
    if(!h2) return false;
    const text = document.body.innerText || '';
    return /You wake beneath a dead lantern/i.test(text) && /Enter Ashmere/i.test(text);
  }

  function start(){
    const r = root();
    if(!r) return;
    running = true;
    savedRoadScreen = r.innerHTML;
    renderQuestion(0);
  }

  function installStyles(){
    if(document.getElementById('creationV070Styles')) return;
    const css = document.createElement('style');
    css.id = 'creationV070Styles';
    css.textContent = `
      .creation-v070-wrap{min-height:100svh;display:grid;place-items:center;padding:18px;color:#eaffef;background:radial-gradient(circle at 20% 18%,rgba(125,255,173,.16),transparent 28%),radial-gradient(circle at 80% 80%,rgba(255,211,105,.10),transparent 30%),linear-gradient(180deg,#09140f,#020403);position:relative;overflow:hidden}.creation-v070-wrap:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.022) 0 1px,transparent 1px 70px);animation:creationDrift 18s ease-in-out infinite alternate}.creation-v070-card{position:relative;width:min(1050px,100%);border:1px solid rgba(255,211,105,.34);border-radius:26px;background:linear-gradient(180deg,rgba(15,29,22,.95),rgba(5,9,7,.97));box-shadow:0 30px 90px rgba(0,0,0,.66);padding:clamp(20px,4vw,44px);animation:creationIn .3s ease both}.creation-v070-card:before{content:"";position:absolute;inset:9px;border:1px solid rgba(125,255,173,.12);border-radius:18px;pointer-events:none}.creation-v070-progress{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:22px}.creation-v070-progress span{display:block;height:100%;background:linear-gradient(90deg,#ffd369,#7dffad);transition:width .25s ease}.creation-v070-kicker{color:#ffd369;text-transform:uppercase;letter-spacing:.25em;font-size:.75rem;margin-bottom:10px}.creation-v070-card h1{margin:0;color:#7dffad;font-size:clamp(2rem,7vw,5rem);line-height:.95;text-shadow:0 0 22px rgba(125,255,173,.20)}.creation-v070-text{white-space:pre-wrap;color:#f1ead1;line-height:1.65;font-size:1.08rem;max-width:820px}.creation-v070-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.creation-v070-choice{position:relative;text-align:left;border:1px solid rgba(132,255,178,.20);border-radius:18px;background:linear-gradient(180deg,rgba(12,24,18,.86),rgba(0,0,0,.28));color:#eaffef;padding:16px;cursor:pointer;transition:.16s ease;min-height:128px}.creation-v070-choice:hover{transform:translateY(-3px);border-color:rgba(255,211,105,.56);box-shadow:0 16px 32px rgba(0,0,0,.28)}.creation-v070-choice strong{display:block;color:#ffd369;font-size:1.18rem;margin-bottom:6px}.creation-v070-choice span{display:inline-block;color:#7dffad;border:1px solid rgba(125,255,173,.22);border-radius:999px;padding:4px 8px;font-size:.82rem;margin-bottom:10px}.creation-v070-choice small{display:block;color:#cfeedd;line-height:1.4}@keyframes creationIn{from{opacity:0;transform:translateY(10px);filter:blur(4px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}@keyframes creationDrift{from{transform:translateX(-1%) scale(1.02)}to{transform:translateX(1%) scale(1.04)}}body.a11y-reduced-motion .creation-v070-wrap:before,body.a11y-reduced-motion .creation-v070-card{animation:none!important}@media(max-width:780px){.creation-v070-wrap{padding:10px;place-items:start}.creation-v070-card{padding:18px}.creation-v070-grid{grid-template-columns:1fr}.creation-v070-choice{min-height:auto}}`;
    document.head.appendChild(css);
  }

  function check(){ if(shouldStart()) start(); }
  window.addEventListener('DOMContentLoaded', () => {
    installStyles();
    const observer = new MutationObserver(()=>requestAnimationFrame(check));
    observer.observe(document.body,{childList:true,subtree:true});
    check();
  });
})();