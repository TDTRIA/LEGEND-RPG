// LEGEND v0.9.1 - Road Controller
// Old Road travel with paced menu flow, interactive dice checks, finds, battles, progress, and clean town return.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const ROADS = () => window.LegendRoadsV087 || {};
  const ASSETS = () => window.LegendAssetsV090 || {};
  let enemy = null;
  let currentRoad = 'oldRoad';

  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function p(){return RT()?.loadPlayer?.() || null;}
  function save(pl){RT()?.savePlayer?.(pl);}
  function ret(){RT()?.returnToAshmere?.();}
  function road(){return ROADS()[currentRoad] || ROADS().oldRoad;}
  function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
  function inv(pl,k,a){pl.inventory=pl.inventory||{};pl.inventory[k]=Number(pl.inventory[k]||0)+a;}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function weapon(pl){return (window.LEGEND_DATA?.weapons||[]).find(w=>w.id===pl.weapon)||{name:pl.weapon||'Hands',min:0,max:1};}
  function armor(pl){return (window.LEGEND_DATA?.armors||[]).find(a=>a.id===pl.armor)||{name:pl.armor||'None',defense:0};}
  function itemName(k){return window.LEGEND_DATA?.itemNames?.[k]||k;}

  function state(pl){
    pl.flags = pl.flags || {};
    pl.flags.roadV087 = pl.flags.roadV087 || {progress:0, trips:0};
    return pl.flags.roadV087;
  }
  function addXP(pl,n){
    pl.xp=Number(pl.xp||0)+n; pl.xpUntil=Number(pl.xpUntil||420)-n;
    if(pl.xpUntil<=0){pl.level=Number(pl.level||1)+1;pl.xpUntil=420+pl.level*110;pl.maxHp=Number(pl.maxHp||30)+22;pl.hp=pl.maxHp;return true;}
    return false;
  }
  function score(pl,skill){
    const cls=window.LEGEND_DATA?.classes?.[pl.className]?.mod||{};
    const org=window.LEGEND_DATA?.origins?.[pl.origin]?.bonus||{};
    const keep=window.LEGEND_DATA?.keepsakes?.[pl.keepsake]?.bonus||{};
    const bg90=pl.creationV090?.bonuses||{};
    const bg70=pl.creationV070?.bonuses||{};
    return Number(cls[skill]||0)+Number(org[skill]||0)+Number(keep[skill]||0)+Number(bg90[skill]||0)+Number(bg70[skill]||0);
  }

  function roadBg(){ return ASSETS().locations?.oldRoad || 'assets/locations/roads/location_old_road_main_v1.jpg'; }
  function sceneHTML(){return `<div class="v091-road-scene"><img src="${esc(roadBg())}" alt="" onerror="this.style.display='none'"><div class="v091-road-fade"></div><div class="v091-road-lantern"></div></div>`;}
  function progressHTML(n){let out='<div class="v087-progress">';for(let i=0;i<5;i++)out+=`<span class="v087-step ${i<n?'done':''}"></span>`;return out+'</div>';}
  function statusHTML(pl){const st=state(pl);return `<div class="v087-status"><div class="v087-stat"><span>HP</span><strong>${Number(pl.hp||0)}/${Number(pl.maxHp||0)}</strong></div><div class="v087-stat"><span>Gold</span><strong>${Number(pl.gold||0)}g</strong></div><div class="v087-stat"><span>Road</span><strong>${Number(st.progress||0)}/5</strong></div><div class="v087-stat"><span>Proof</span><strong>${Number(pl.inventory?.roadToken||0)} Tokens</strong></div></div>`;}

  function start(){
    const pl=p(); if(!pl) return;
    const st=state(pl); st.trips=Number(st.trips||0)+1; save(pl);
    renderHub('The gate closes behind you. Ashmere becomes lantern light in the fog, and the Old Road waits for your pace.');
  }

  function renderHub(note=''){
    const pl=p(); if(!pl)return;
    const r=road(); const st=state(pl);
    document.getElementById('root').innerHTML = `<div class="shell"><section class="panel v087-road v091-road-menu"><div class="v087-road-hero">${sceneHTML()}<div class="v080-kicker">Old Road Route</div><h2>${esc(r.name)}</h2><p>${esc(note||r.description)}</p>${progressHTML(Number(st.progress||0))}</div>${statusHTML(pl)}<div class="v091-route-board"><article><span>Careful</span><strong>More checks, safer pacing.</strong></article><article><span>Standard</span><strong>Balanced travel and danger.</strong></article><article><span>Bold</span><strong>Faster progress, more fights.</strong></article></div><div class="v087-options"><button class="v087-card" id="careful"><strong>Travel Carefully</strong><span>Scout the mud, listen for movement, and take fewer risks.</span><em>Check / Find focused</em></button><button class="v087-card" id="normal"><strong>Follow the Road</strong><span>Keep a steady pace through choices, discoveries, and danger.</span><em>Mixed events</em></button><button class="v087-card" id="bold"><strong>Press Ahead</strong><span>Push through the fog. More danger, but faster proof.</span><em>Battle / reward focused</em></button></div><div class="actions"><button class="btn" id="returnTown">Return to Ashmere</button></div></section></div>`;
    document.getElementById('careful').onclick=()=>roll('careful');
    document.getElementById('normal').onclick=()=>roll('normal');
    document.getElementById('bold').onclick=()=>roll('bold');
    document.getElementById('returnTown').onclick=ret;
  }

  function roll(mode){
    const n=Math.random();
    if(mode==='bold' && n<0.58) return battle();
    if(mode==='careful' && n<0.50) return checkEvent(mode);
    if(n<0.35) return checkEvent(mode);
    if(n<0.62) return findEvent(mode);
    return battle();
  }

  function checkEvent(mode){
    const pl=p(); if(!pl)return;
    const ev=pick(road().checks);
    const bonus=score(pl,ev.skill);
    const target=mode==='careful'?9:11;
    renderDiceCheck({ev,bonus,target,mode});
  }

  function renderDiceCheck(ctx){
    const pl=p(); if(!pl)return;
    document.getElementById('root').innerHTML = `<div class="shell"><section class="panel v087-road v091-check"><div class="v087-outcome"><div class="v080-kicker">Road Check</div><h2>${esc(ctx.ev.title)}</h2><p>${esc(ctx.ev.text)}</p><div class="v091-check-grid"><div class="v091-die-wrap"><button class="v091-die" id="rollDie" aria-label="Roll the road die"><span>?</span></button><small>Click the die to roll</small></div><div class="v091-check-card"><span>Skill</span><strong>${esc(ctx.ev.skill.toUpperCase())}</strong><span>Bonus</span><strong>+${ctx.bonus}</strong><span>Target</span><strong>${ctx.target}</strong><span>Risk</span><strong>${esc(ctx.ev.risk||'Road Risk')}</strong></div></div><div class="v091-roll-text" id="rollText">The road waits for the die to fall.</div><div class="v087-actions"><button class="btn" id="backRoad">Back to Route</button><button class="btn" id="town">Return to Ashmere</button></div></div></section></div>`;
    document.getElementById('backRoad').onclick=()=>renderHub();
    document.getElementById('town').onclick=ret;
    document.getElementById('rollDie').onclick=()=>animateDie(ctx);
  }

  function animateDie(ctx){
    const die=document.getElementById('rollDie');
    const text=document.getElementById('rollText');
    if(!die || die.dataset.rolling==='1') return;
    die.dataset.rolling='1';
    die.classList.add('rolling');
    let ticks=0;
    const timer=setInterval(()=>{
      ticks++;
      die.querySelector('span').textContent=rand(1,12);
      text.textContent = ticks < 8 ? 'The die clatters across the wet stone...' : 'The die slows.';
      if(ticks>=12){
        clearInterval(timer);
        const natural=rand(1,12);
        const total=natural+ctx.bonus;
        die.querySelector('span').textContent=natural;
        die.classList.remove('rolling');
        resolveCheck(ctx,natural,total);
      }
    },90);
  }

  function resolveCheck(ctx,natural,total){
    const pl=p(); if(!pl)return;
    const ok=total>=ctx.target;
    if(ok){state(pl).progress=clamp(Number(state(pl).progress||0)+1,0,5); if(Math.random()<0.24) inv(pl,'roadToken',1); addXP(pl,25);} else {pl.hp=Math.max(1,Number(pl.hp||1)-rand(2,7));}
    save(pl);
    setTimeout(()=>{
      outcome(ctx.ev.title, `${ctx.ev.text}\n\nDie: ${natural} + ${ctx.bonus} = ${total} vs ${ctx.target}\n\n${ok?ctx.ev.success:ctx.ev.fail}`, ok?'Success':'Mixed Result');
    },450);
  }

  function findEvent(mode){
    const pl=p(); const f=pick(road().finds); inv(pl,f.item,f.amount); state(pl).progress=clamp(Number(state(pl).progress||0)+1,0,5); addXP(pl,15); save(pl);
    outcome(f.title, `${f.text}\n\nRecovered: ${itemName(f.item)} x${f.amount}.`, 'Discovery');
  }

  function battle(){
    const pl=p(); const base=pick(road().enemies); enemy={...base,hp:rand(base.hp[0],base.hp[1])}; enemy.maxHp=enemy.hp;
    renderBattle(base.text);
  }
  function sprite(name){return window.LegendEnemySpritesV080?.spriteFor?.(name)||'<svg viewBox="0 0 160 160"><path d="M24 93c12-38 35-57 70-54 31 3 44 28 43 61-13 23-41 34-75 28-16-3-29-14-38-35Z" fill="#17241d" stroke="#7dffad" stroke-width="4"/><circle cx="65" cy="82" r="6" fill="#ff6b6b"/><circle cx="101" cy="82" r="6" fill="#ff6b6b"/></svg>';}
  function renderBattle(note){
    const pl=p(); if(!pl||!enemy)return; const w=weapon(pl); const a=armor(pl);
    document.getElementById('root').innerHTML=`<div class="shell"><section class="panel v087-road"><div class="v087-outcome v087-battle"><div><div class="v080-kicker">Road Battle</div><h2>${esc(enemy.name)}</h2><p>${esc(note)}</p><div class="v087-status"><div class="v087-stat"><span>Your HP</span><strong>${Number(pl.hp||0)}/${Number(pl.maxHp||0)}</strong></div><div class="v087-stat"><span>Enemy HP</span><strong>${enemy.hp}/${enemy.maxHp}</strong></div><div class="v087-stat"><span>Weapon</span><strong>${esc(w.name)}</strong></div><div class="v087-stat"><span>Armor</span><strong>${esc(a.name)}</strong></div></div><div class="v087-actions"><button class="btn primary" id="atk">Attack</button><button class="btn" id="guard">Guard</button><button class="btn" id="potion">Potion</button><button class="btn" id="flee">Fall Back</button></div></div><div class="v087-enemy">${sprite(enemy.name)}</div></div></section></div>`;
    document.getElementById('atk').onclick=attack; document.getElementById('guard').onclick=()=>enemyTurn('You guard and take the hit carefully.',.45); document.getElementById('potion').onclick=potion; document.getElementById('flee').onclick=()=>{if(Math.random()<.62) outcome('You Fall Back','You break away and return to a safer stretch of the road.','Escaped'); else enemyTurn('You try to fall back, but the road gives you no room.',1);};
  }
  function attack(){const pl=p();const w=weapon(pl);const dmg=rand(w.min||0,w.max||1)+rand(0,3);enemy.hp-=dmg;if(enemy.hp<=0)return win(`You hit for ${dmg}. The ${enemy.name} collapses into the mud.`);enemyTurn(`You hit for ${dmg}.`,1);}
  function potion(){const pl=p();if(Number(pl.inventory?.potion||0)<=0)return renderBattle('No potion left.');pl.inventory.potion-=1;pl.hp=Math.min(Number(pl.maxHp||pl.hp||1),Number(pl.hp||1)+35);save(pl);enemyTurn('You drink a potion and steady your hands.',1);}
  function enemyTurn(note,mult){const pl=p();const a=armor(pl);const raw=rand(enemy.damage[0],enemy.damage[1]);const dmg=Math.max(0,Math.floor((raw-Number(a.defense||0))*mult));pl.hp-=dmg;if(pl.hp<=0){pl.hp=Math.max(1,Math.floor(Number(pl.maxHp||20)*.45));save(pl);return outcome('Thrown Back to Ashmere',`${enemy.name} overwhelms you. You wake near Ashmere wounded, alive, and angry.`, 'Defeat');}save(pl);renderBattle(`${note} ${enemy.name} deals ${dmg} damage.`);}
  function win(text){const pl=p();inv(pl,enemy.reward,1);if(Math.random()<.5)inv(pl,'roadToken',1);state(pl).progress=clamp(Number(state(pl).progress||0)+1,0,5);const lvl=addXP(pl,55);save(pl);outcome(`${enemy.name} Defeated`,`${text}\n\nRecovered: ${itemName(enemy.reward)} x1.${lvl?'\n\nLevel up!':''}`,'Victory');}

  function outcome(title,text,kicker){
    document.getElementById('root').innerHTML=`<div class="shell"><section class="panel v087-road"><div class="v087-outcome"><div class="v080-kicker">${esc(kicker)}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="v087-actions"><button class="btn primary" id="continueRoad">Continue the Road</button><button class="btn" id="roadHub">Choose Pace</button><button class="btn" id="town">Return to Ashmere</button></div></div></section></div>`;
    document.getElementById('continueRoad').onclick=()=>roll('normal'); document.getElementById('roadHub').onclick=()=>renderHub(); document.getElementById('town').onclick=ret;
  }

  function intercept(){
    const btns=[...document.querySelectorAll('button,.v080-town-card,.v080-town-action')];
    btns.forEach(btn=>{
      const txt=(btn.textContent||'').toLowerCase();
      if(btn.dataset.v087Road==='1')return;
      if(txt.includes('travel the old road')||txt.includes('explore the first road')){btn.dataset.v087Road='1';btn.onclick=(e)=>{e.preventDefault?.();e.stopPropagation?.();start();};}
    });
  }
  window.LegendRoadControllerV087={start,renderHub};
  const rt=RT(); if(rt?.onRender)rt.onRender(intercept); else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',intercept); else intercept();
})();
