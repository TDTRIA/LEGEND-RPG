// LEGEND v0.7.0 — Choice-Based Old Road
// Adds the intended Old Road choice layer without rewriting restored game.js.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const OLD_KEYS = ['legend-recovered-build-v051','legend-recovered-build-v05','legend-recovered-build-v041','legend-recovered-build-v04','legend-recovered-build-v03','legend-recovered-build-v02'];

  const routeEvents = [
    {
      id:'sunken_milestone', title:'Sunken Milestone',
      text:'A milestone leans out of the mud. Something is wedged beneath it, but the road around it is soft and hungry.',
      choices:[
        {label:'Scout the safe footing', skill:'survival', dc:8, pass:{roadToken:1,xp:45,flag:'firstToken',log:'You find a safe route through the mud and recover a Road Token.'}, fail:{fatigue:1,log:'The mud pulls at your boots. You escape, but the road tires you.'}},
        {label:'Force the stone upright', skill:'strength', dc:10, pass:{roadToken:1,log:1,xp:35,flag:'firstToken',logText:'You heave the marker upright and find a Road Token and usable wood beneath it.'}, fail:{hp:8,fatigue:1,log:'The stone slips and clips your arm.'}},
        {label:'Leave it alone', pass:{fatigue:-1,log:'You decide the road is not worth every risk. You save your strength.'}}
      ]
    },
    {
      id:'bell_static', title:'Bell Static',
      text:'A sound like a bell breaks into static. For a moment, the road ahead looks copied over itself.',
      choices:[
        {label:'Study the echo', skill:'lore', dc:9, pass:{bellFragment:1,xp:50,log:'You recognize the pattern in the echo and uncover a Bell Fragment.'}, fail:{fatigue:1,log:'The echo scrapes through your thoughts. You learn nothing useful.'}},
        {label:'Answer with a small spell', skill:'magic', dc:9, pass:{rtab:1,xp:40,log:'Your spell catches an old rune-shape out of the static.'}, fail:{hp:6,log:'The static snaps back through your hand.'}},
        {label:'Cover your ears and move on', pass:{log:'You refuse the bait and keep moving.'}}
      ]
    },
    {
      id:'hungry_traveler', title:'Hungry Traveler',
      text:'A traveler sits beside the road with shaking hands. They ask if Ashmere is real or just another loop.',
      choices:[
        {label:'Share food', requires:{food:1}, pass:{food:-1,townTrust:1,xp:30,log:'You share a meal. They remember your name and promise Ashmere will hear it.'}},
        {label:'Guide them back by landmarks', skill:'survival', dc:8, pass:{townTrust:1,xp:25,log:'You point them toward safe signs and known stones. They leave steadier.'}, fail:{fatigue:1,log:'Your directions tangle with the road. You both lose time.'}},
        {label:'Ask what they saw', skill:'luck', dc:11, pass:{gold:35,log:'They trade you a few coins for listening before running for town.'}, fail:{log:'They only repeat: “The road remembers wrong.”'}}
      ]
    },
    {
      id:'fallen_oak', title:'Fallen Oak',
      text:'A wet oak blocks the path. Its branches are tangled with old rope and travel cloth.',
      choices:[
        {label:'Chop usable wood', skill:'strength', dc:8, pass:{log:2,xp:35,flag:'firstResource',logText:'You break down the branches into usable logs.'}, fail:{fatigue:2,log:'The oak barely moves. You spend too much energy on it.'}},
        {label:'Search the bundles', skill:'thieving', dc:8, pass:{gold:50,fur:1,log:'You carefully pick through the tangled packs and find trade goods.'}, fail:{hp:5,log:'A snapped branch cuts your hand.'}},
        {label:'Take the long way around', pass:{fatigue:1,log:'The detour is safe, but tiring.'}}
      ]
    }
  ];

  function load(){
    const raw = localStorage.getItem(SAVE_KEY) || OLD_KEYS.map(k=>localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try{return JSON.parse(raw)}catch{return null}
  }
  function save(p){localStorage.setItem(SAVE_KEY, JSON.stringify(p));}
  function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function mod(p,skill){
    if(!skill) return 0;
    const D = window.LEGEND_DATA || {};
    const creation = p.creationV070?.bonuses?.[skill] || 0;
    return (D.classes?.[p.className]?.mod?.[skill]||0) + (D.origins?.[p.origin]?.bonus?.[skill]||0) + (D.keepsakes?.[p.keepsake]?.bonus?.[skill]||0) + creation;
  }
  function rollCheck(p, skill, dc){
    const roll = Math.floor(Math.random()*20)+1;
    const bonus = mod(p, skill);
    const total = roll + bonus;
    p.stats = p.stats || {};
    if(total >= dc) p.stats.checksPassed = (p.stats.checksPassed||0)+1;
    else p.stats.checksFailed = (p.stats.checksFailed||0)+1;
    return {roll, bonus, total, ok: total >= dc};
  }
  function applyOutcome(p, outcome){
    if(!outcome) return '';
    p.inventory = p.inventory || {};
    p.flags = p.flags || {};
    p.townTrust = p.townTrust || {Ashmere:0};
    p.memories = p.memories || [];
    if(outcome.xp) p.xp = (p.xp||0) + outcome.xp;
    if(outcome.gold) p.gold = (p.gold||0) + outcome.gold;
    if(outcome.hp) p.hp = Math.max(1, (p.hp||1) - outcome.hp);
    if(outcome.fatigue) p.fatigue = Math.max(0, (p.fatigue||0) + outcome.fatigue);
    if(outcome.townTrust) p.townTrust.Ashmere = (p.townTrust.Ashmere||0) + outcome.townTrust;
    if(outcome.roadToken) p.inventory.roadToken = (p.inventory.roadToken||0) + outcome.roadToken;
    if(outcome.bellFragment) p.inventory.bellFragment = (p.inventory.bellFragment||0) + outcome.bellFragment;
    if(outcome.food) p.inventory.food = Math.max(0,(p.inventory.food||0)+outcome.food);
    if(outcome.rtab) p.inventory.rtab = (p.inventory.rtab||0)+outcome.rtab;
    if(outcome.log) p.inventory.log = (p.inventory.log||0)+outcome.log;
    if(outcome.fur) p.inventory.fur = (p.inventory.fur||0)+outcome.fur;
    if(outcome.flag) p.flags[outcome.flag] = true;
    p.flags.firstRoadEvent = true;
    p.stats.roadEvents = (p.stats.roadEvents||0)+1;
    return outcome.logText || outcome.log || 'The choice resolves.';
  }
  function canChoose(p, choice){
    if(!choice.requires) return true;
    return Object.entries(choice.requires).every(([k,v]) => Number(p.inventory?.[k]||0) >= v);
  }
  function renderRoadChoice(){
    const p = load();
    if(!p){ alert('Create or continue a save first.'); return; }
    const ev = routeEvents[Math.floor(Math.random()*routeEvents.length)];
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="shell road-choice-shell">
        <header class="topbar"><div class="brand"><h1>LEGEND</h1><div class="sub">Old Road — v0.7.0</div></div><div class="meta-grid"><div class="box"><span class="label">Hero</span><span class="value">${esc(p.username)}</span></div><div class="box"><span class="label">Fatigue</span><span class="value">${Number(p.fatigue||0)}</span></div></div></header>
        <div class="layout"><section class="panel"><div class="panel-head"><div><h2>${esc(ev.title)}</h2><p>Choose your approach. Your origin, class, keepsake, and traveler interview bonuses all shape the roll.</p></div></div><div class="text">${esc(ev.text)}</div><div class="choice-list">${ev.choices.map((c,i)=>{
          const locked = !canChoose(p,c);
          const detail = c.skill ? `${c.skill.toUpperCase()} DC ${c.dc} / Your bonus: +${mod(p,c.skill)}` : 'No check / guaranteed outcome';
          const req = c.requires ? ` Requires: ${Object.entries(c.requires).map(([k,v])=>`${v} ${k}`).join(', ')}` : '';
          return `<button class="choice-card" data-choice="${i}" ${locked?'disabled':''}><h3>${esc(c.label)}</h3><p>${esc(detail + req)}</p></button>`;
        }).join('')}</div><div class="actions"><button class="btn" id="backAshmere">Return to Ashmere</button></div></section></div>
      </div>`;
    document.querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=()=>resolveChoice(ev, ev.choices[Number(btn.dataset.choice)]));
    document.getElementById('backAshmere').onclick=()=>location.reload();
  }
  function resolveChoice(ev, choice){
    const p = load();
    let resultText = '';
    let resultLine = '';
    if(choice.skill){
      const r = rollCheck(p, choice.skill, choice.dc);
      resultLine = `${choice.skill} check: d20(${r.roll}) + ${r.bonus} = ${r.total} vs DC ${choice.dc}. ${r.ok?'Success':'Failure'}.`;
      resultText = applyOutcome(p, r.ok ? choice.pass : choice.fail);
    } else {
      resultLine = 'No roll. You chose the safer/clearer outcome.';
      resultText = applyOutcome(p, choice.pass);
    }
    save(p);
    const root = document.getElementById('root');
    root.innerHTML = `<div class="shell road-choice-shell"><section class="panel"><div class="panel-head"><div><h2>${esc(ev.title)} — Result</h2><p>${esc(resultLine)}</p></div></div><div class="text">${esc(resultText)}</div><div class="actions"><button class="btn primary" id="continueRoadChoice">Continue Exploring</button><button class="btn" id="returnAshmere">Return to Ashmere</button></div></section></div>`;
    document.getElementById('continueRoadChoice').onclick=renderRoadChoice;
    document.getElementById('returnAshmere').onclick=()=>location.reload();
  }
  function injectRoadChoiceButton(){
    const body = document.body?.innerText || '';
    if(!/Choose a Route/i.test(body) || document.getElementById('choiceRoadBtn')) return;
    const actions = document.querySelector('.actions');
    if(!actions) return;
    const btn = document.createElement('button');
    btn.className='btn primary';
    btn.id='choiceRoadBtn';
    btn.textContent='Travel the Old Road';
    btn.onclick=renderRoadChoice;
    actions.prepend(btn);
    const old = [...actions.querySelectorAll('button')].find(b => b !== btn && b.textContent.trim() === 'Old Road');
    if(old){ old.textContent = 'Old Road — Classic Fallback'; old.classList.remove('primary'); }
  }
  const css=document.createElement('style');
  css.textContent=`.choice-list{display:grid;gap:10px;margin-top:14px}.choice-card{width:100%;text-align:left;border:1px solid rgba(132,255,178,.22);background:rgba(0,0,0,.28);border-radius:16px;color:#eaffef;padding:14px;cursor:pointer}.choice-card:hover{border-color:rgba(255,211,105,.5);transform:translateY(-1px)}.choice-card:disabled{opacity:.42;cursor:not-allowed}.choice-card h3{margin:0 0 6px;color:#ffd369}.choice-card p{margin:0;color:#93b7a3}.road-choice-shell .text{white-space:pre-wrap}`;
  document.head.appendChild(css);
  const obs = new MutationObserver(()=>requestAnimationFrame(injectRoadChoiceButton));
  window.addEventListener('DOMContentLoaded',()=>{obs.observe(document.body,{childList:true,subtree:true});injectRoadChoiceButton();});
  window.LegendRoadChoicesV065 = { start: renderRoadChoice };
})();