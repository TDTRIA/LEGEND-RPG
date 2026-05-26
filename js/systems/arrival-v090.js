// LEGEND v0.9.0 - Arrival Sequence
// Replaces the old Traveler Interview + intro pairing with one non-looping Ashmere arrival flow.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const ID = 'legendArrivalV090';
  let running = false;

  const steps = [
    {
      type:'story',
      kicker:'Before Dawn',
      title:'The Road Lets You Wake',
      text:'Rain has passed, but the road still smells of it. You wake in wet grass with mud on your sleeves, a keepsake in your hand, and no clear memory of how long you have been walking.',
      button:'Stand Up'
    },
    {
      type:'story',
      kicker:'The Old Road',
      title:'A Lantern Burns Ahead',
      text:'The trees lean over the road like they are listening. Ahead, a lantern flickers beside a crooked sign: ASHMERE. Behind you, something moves in the ditch and then thinks better of following.',
      button:'Follow the Lantern'
    },
    {
      type:'choice',
      id:'instinct',
      kicker:'First Instinct',
      title:'What keeps you moving?',
      text:'Your boots are soaked. Your ribs ache. The road is quiet in a way that feels planned. Before you reach the gate, you decide what part of you refuses to stop.',
      options:[
        {label:'Nerve', trait:'Steady Nerve', desc:'You do not scare easily.', effects:{bonus:'strength', maxHp:6, memory:'You reached Ashmere by refusing to look afraid.'}},
        {label:'Hunger', trait:'Road-Hungry', desc:'You keep moving because stopping feels worse.', effects:{bonus:'survival', items:{food:2}, memory:'You reached Ashmere hungry, tired, and ready for another mile.'}},
        {label:'Suspicion', trait:'Watchful Traveler', desc:'You notice what the road wants hidden.', effects:{bonus:'thieving', items:{bait:2}, memory:'You reached Ashmere by watching the road watch you back.'}},
        {label:'Wonder', trait:'Bell-Touched', desc:'You follow strange signs instead of fleeing them.', effects:{bonus:'lore', items:{potion:1}, memory:'You reached Ashmere because the lantern felt like an invitation.'}}
      ]
    },
    {
      type:'choice',
      id:'gate',
      kicker:'Ashmere Gate',
      title:'The guard lowers his spear.',
      text:'Ashmere rises from the mist: wet rooftops, old timber, and a bell tower that should be silent. A gate guard looks you over and asks the question everyone in town is thinking: “What are you doing on that road alone?”',
      options:[
        {label:'“Looking for work.”', trait:'Practical Arrival', desc:'You sound useful before you sound dangerous.', effects:{gold:20, memory:'At the gate, you told Ashmere you were looking for honest work.'}},
        {label:'“Looking for answers.”', trait:'Answer-Seeker', desc:'Mara will want to hear that.', effects:{bonus:'lore', townTrust:1, memory:'At the gate, you admitted you were looking for answers.'}},
        {label:'“Trying to survive.”', trait:'Honest Survivor', desc:'The guard believes that more than a brave speech.', effects:{maxHp:4, items:{food:1}, memory:'At the gate, you told the truth: you were trying to survive.'}},
        {label:'Say nothing. Show your keepsake.', trait:'Quiet Omen', desc:'The bell answers before the guard does.', effects:{items:{bellFragment:1}, memory:'At the gate, you showed your keepsake and the bell answered once.'}}
      ]
    },
    {
      type:'story',
      kicker:'The Bell',
      title:'Ashmere Hears You Arrive',
      text:'The bell rings once. Every conversation behind the gate dies at the same time. The guard steps aside, not because he trusts you, but because the town has already noticed you. Your first goal is simple: find Mara in the Town Square.',
      button:'Enter Ashmere'
    }
  ];

  function load(){ return RT()?.loadPlayer?.() || null; }
  function save(p){ RT()?.savePlayer?.(p); }
  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function itemName(k){return window.LEGEND_DATA?.itemNames?.[k] || k;}
  function preview(e={}){
    const bits=[];
    if(e.bonus) bits.push(`+1 ${e.bonus} background`);
    if(e.maxHp) bits.push(`+${e.maxHp} max HP`);
    if(e.gold) bits.push(`+${e.gold} gold`);
    if(e.townTrust) bits.push(`+${e.townTrust} Ashmere trust`);
    if(e.items) Object.entries(e.items).forEach(([k,v])=>bits.push(`+${v} ${itemName(k)}`));
    return bits.join(' / ') || 'story trait';
  }

  function applyEffects(choice, stepId){
    const p = load();
    if(!p) return;
    p.flags = p.flags || {};
    p.inventory = p.inventory || {};
    p.memories = Array.isArray(p.memories) ? p.memories : [];
    p.traits = Array.isArray(p.traits) ? p.traits : [];
    p.townTrust = p.townTrust || {Ashmere:0};
    p.creationV090 = p.creationV090 || {answers:[], bonuses:{}};
    p.creationV090.answers = p.creationV090.answers || [];
    p.creationV090.bonuses = p.creationV090.bonuses || {};

    if(choice.trait && !p.traits.includes(choice.trait)) p.traits.push(choice.trait);
    if(choice.effects?.memory && !p.memories.includes(choice.effects.memory)) p.memories.push(choice.effects.memory);
    p.creationV090.answers.push({step:stepId, label:choice.label, trait:choice.trait});

    const e = choice.effects || {};
    if(e.bonus) p.creationV090.bonuses[e.bonus] = Number(p.creationV090.bonuses[e.bonus] || 0) + 1;
    if(e.maxHp){ p.maxHp = Number(p.maxHp || 1) + Number(e.maxHp); p.hp = Math.min(Number(p.maxHp), Number(p.hp || p.maxHp) + Number(e.maxHp)); }
    if(e.gold) p.gold = Number(p.gold || 0) + Number(e.gold);
    if(e.townTrust) p.townTrust.Ashmere = Number(p.townTrust.Ashmere || 0) + Number(e.townTrust);
    if(e.items) Object.entries(e.items).forEach(([k,v]) => p.inventory[k] = Number(p.inventory[k] || 0) + Number(v || 0));
    save(p);
  }

  function markComplete(){
    const p = load();
    if(!p) return;
    p.flags = p.flags || {};
    p.flags.arrivalSequenceV090 = true;
    p.flags.creationInterviewV070 = true;
    p.flags.introSequenceV086 = true;
    p.flags.introSequenceV090 = true;
    p.flags.talkedMara = p.flags.talkedMara || false;
    p.memories = Array.isArray(p.memories) ? p.memories : [];
    const memory = 'You arrived at Ashmere by the Old Road, and the town bell rang once when you reached the gate.';
    if(!p.memories.includes(memory)) p.memories.push(memory);
    if(!Array.isArray(p.questLog)) p.questLog = [];
    const quest = 'Main Objective: Find Mara in the Town Square and learn why Ashmere watches the Old Road.';
    if(!p.questLog.includes(quest)) p.questLog.push(quest);
    save(p);
  }

  function render(index=0){
    const step = steps[index];
    let el = document.getElementById(ID);
    if(!el){ el = document.createElement('div'); el.id = ID; document.body.appendChild(el); }
    const progress = Math.round(((index+1)/steps.length)*100);
    const choices = step.type === 'choice' ? `<div class="arrival-v090-choices">${step.options.map((o,i)=>`<button class="arrival-v090-choice" data-choice="${i}"><strong>${esc(o.label)}</strong><span>${esc(o.trait)}</span><small>${esc(o.desc)}</small><em>${esc(preview(o.effects))}</em></button>`).join('')}</div>` : `<div class="arrival-v090-actions"><button class="arrival-v090-btn primary" id="arrivalNext">${esc(step.button)}</button>${index < steps.length-1 ? '<button class="arrival-v090-btn" id="arrivalSkip">Skip Arrival</button>' : ''}</div>`;
    el.innerHTML = `<div class="arrival-v090-wrap step-${index}"><img class="arrival-v090-bg" src="./assets/title/title_bg_ashmere_road_v089.jpg?v=arrival-v090" alt="" aria-hidden="true"><div class="arrival-v090-shade"></div><div class="arrival-v090-rain"></div><section class="arrival-v090-card"><div class="arrival-v090-progress"><span style="width:${progress}%"></span></div><div class="arrival-v090-kicker">${esc(step.kicker)} • ${index+1}/${steps.length}</div><h1>${esc(step.title)}</h1><p>${esc(step.text)}</p>${choices}</section></div>`;
    if(step.type === 'choice'){
      el.querySelectorAll('[data-choice]').forEach(btn => btn.onclick = () => { applyEffects(step.options[Number(btn.dataset.choice)], step.id); render(index+1); });
    }else{
      el.querySelector('#arrivalNext').onclick = () => index >= steps.length-1 ? finish() : render(index+1);
      const skip = el.querySelector('#arrivalSkip');
      if(skip) skip.onclick = finish;
    }
  }

  function finish(){
    markComplete();
    running = false;
    document.getElementById(ID)?.remove();
    requestAnimationFrame(() => {
      const enter = [...document.querySelectorAll('button')].find(b => /Enter Ashmere/i.test(b.textContent || ''));
      if(enter) enter.click();
    });
  }

  function shouldStart(){
    if(running || document.getElementById(ID)) return false;
    const p = load();
    if(!p || p.flags?.arrivalSequenceV090) return false;
    const h2 = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === 'The Road to Ashmere');
    if(!h2) return false;
    return /Enter Ashmere/i.test(document.body.innerText || '');
  }

  function start(){ running = true; render(0); }

  function styles(){
    if(document.getElementById('arrivalV090Styles')) return;
    const css = document.createElement('style');
    css.id = 'arrivalV090Styles';
    css.textContent = `#${ID}{position:fixed;inset:0;z-index:10100}.arrival-v090-wrap{min-height:100svh;position:relative;overflow:auto;color:#eaffef;background:#020403;display:grid;place-items:end center;padding:clamp(12px,3vw,28px)}.arrival-v090-bg{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.92) contrast(1.05);transform:scale(1.02);animation:arrivalDrift 20s ease-in-out infinite alternate}.arrival-v090-shade{position:fixed;inset:0;background:linear-gradient(90deg,rgba(2,4,3,.82),rgba(2,4,3,.32),rgba(2,4,3,.72)),linear-gradient(180deg,rgba(2,4,3,.10),rgba(2,4,3,.90));pointer-events:none}.arrival-v090-rain{position:fixed;inset:-20%;background-image:linear-gradient(120deg,rgba(255,255,255,.08) 0 1px,transparent 1px 22px);background-size:42px 42px;opacity:.14;animation:arrivalRain 1.6s linear infinite;pointer-events:none}.arrival-v090-card{position:relative;width:min(1040px,100%);border:1px solid rgba(255,211,105,.34);border-radius:28px;background:linear-gradient(180deg,rgba(10,18,13,.82),rgba(3,6,5,.94));box-shadow:0 30px 110px rgba(0,0,0,.72);backdrop-filter:blur(9px);padding:clamp(20px,4vw,46px);margin-bottom:clamp(0px,3vh,28px)}.arrival-v090-card:before{content:"";position:absolute;inset:10px;border:1px solid rgba(125,255,173,.12);border-radius:20px;pointer-events:none}.arrival-v090-progress{height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin-bottom:20px}.arrival-v090-progress span{display:block;height:100%;background:linear-gradient(90deg,#ffd369,#7dffad);transition:width .25s ease}.arrival-v090-kicker{color:#ffd369;text-transform:uppercase;letter-spacing:.18em;font-size:.76rem;margin-bottom:10px}.arrival-v090-card h1{margin:0;color:#eaffef;font-size:clamp(2.4rem,7vw,5.5rem);line-height:.9;letter-spacing:.04em;text-shadow:0 0 24px rgba(255,211,105,.18),0 7px 0 rgba(0,0,0,.36)}.arrival-v090-card p{max-width:780px;color:#f1ead1;line-height:1.7;font-size:clamp(1rem,2vw,1.16rem)}.arrival-v090-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.arrival-v090-btn,.arrival-v090-choice{border:1px solid rgba(255,211,105,.28);border-radius:16px;background:linear-gradient(90deg,rgba(10,16,12,.84),rgba(10,16,12,.58));color:#eaffef;cursor:pointer;box-shadow:0 14px 30px rgba(0,0,0,.28);transition:.15s ease}.arrival-v090-btn{min-height:46px;padding:11px 16px;font-weight:900}.arrival-v090-btn.primary{background:linear-gradient(180deg,#ffe29a,#bf7f2a);color:#241803;border-color:rgba(255,211,105,.72)}.arrival-v090-btn:hover,.arrival-v090-choice:hover{transform:translateY(-2px);border-color:rgba(255,211,105,.66)}.arrival-v090-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.arrival-v090-choice{text-align:left;padding:16px;min-height:140px}.arrival-v090-choice strong{display:block;color:#ffd369;font-size:1.15rem;margin-bottom:6px}.arrival-v090-choice span{display:inline-block;color:#7dffad;border:1px solid rgba(125,255,173,.22);border-radius:999px;padding:4px 8px;font-size:.82rem;margin-bottom:8px}.arrival-v090-choice small{display:block;color:#d9efe1;line-height:1.38}.arrival-v090-choice em{display:block;color:#ffe7a6;font-style:normal;margin-top:8px;font-size:.86rem}@keyframes arrivalDrift{from{transform:scale(1.02) translate3d(0,0,0)}to{transform:scale(1.05) translate3d(-10px,-5px,0)}}@keyframes arrivalRain{to{transform:translateY(42px)}}body.a11y-reduced-motion .arrival-v090-bg,body.a11y-reduced-motion .arrival-v090-rain{animation:none!important}@media(max-width:760px){.arrival-v090-wrap{place-items:end center;padding:10px}.arrival-v090-card{border-radius:20px;padding:18px}.arrival-v090-actions{display:grid}.arrival-v090-btn{width:100%}.arrival-v090-choices{grid-template-columns:1fr}.arrival-v090-choice{min-height:auto}}`;
    document.head.appendChild(css);
  }

  function tick(){ styles(); if(shouldStart()) start(); }
  const rt = RT();
  if(rt?.onRender) rt.onRender(tick);
  else if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
})();
