// LEGEND v0.9.x - Ashmere Town Hub Controller
// Owns Ashmere directly: RPG town terminal, direct routes, no title reload for town returns.
(() => {
  const RT = () => window.LegendRuntimeV080 || {};
  const A = () => window.LegendAssetsV090 || {};
  const D = () => window.LEGEND_DATA || {};
  const root = () => document.getElementById('root');
  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  const p = () => RT().loadPlayer?.() || null;
  const save = pl => RT().savePlayer?.(pl);
  const img = (path, alt = '') => path ? `<img src="${esc(path)}" alt="${esc(alt)}" onerror="this.style.display='none'">` : '';
  const itemName = k => D().itemNames?.[k] || ({
    food:'Rations', potion:'Healing Potion', camp:'Camp Supplies', roadToken:'Road Token',
    woodScrap:'Wood Scrap', clothScrap:'Cloth Scrap', roadHerb:'Road Herb', wolfFang:'Wolf Fang',
    tornHide:'Torn Hide', ore:'Ore', wispAsh:'Wisp Ash', oil:'Lamp Oil', goblinTrinket:'Goblin Trinket',
    blackrootThorn:'Blackroot Thorn', brokenBellShard:'Broken Bell Shard', roadPoultice:'Road Poultice',
    blackrootTonic:'Blackroot Tonic', huntersCharm:'Hunter\'s Charm', reinforcedBuckle:'Reinforced Buckle',
    wispLanternWick:'Wisp Lantern Wick', tradeBundle:'Trade Bundle'
  }[k] || k);
  const gold = n => `${Number(n || 0)}g`;
  const bg = () => A().locations?.ashmereMain || 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg';
  const roadBg = () => A().locations?.oldRoad || 'assets/locations/roads/location_old_road_main_v1.jpg';
  const npc = id => A().npcs?.[id] || '';
  const weaponName = id => (D().weapons || []).find(w => w.id === id)?.name || id || 'Hands';
  const armorName = id => (D().armors || []).find(a => a.id === id)?.name || id || 'None';

  const iconMap = {
    people:'M12 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-7 16c1.2-4 4-6 7-6s5.8 2 7 6M17 9a3 3 0 1 0 0 6M17 17c2.2.3 3.8 1.7 5 4',
    inn:'M4 20V8h16v12M7 20v-6h10v6M7 11h10M9 8V5h6v3',
    trader:'M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0l-4 7h8l-4-7Z',
    smith:'M14 4l6 6-9 9-4-4 9-9ZM5 17l2 2-3 3-2-2 3-3Z',
    road:'M4 21c4-5 4-13 8-18m8 18c-4-5-4-13-8-18M8 12h8M7 17h10',
    sheet:'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4',
    brenn:'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
    archive:'M4 5h16v14H4zM8 9h8M8 13h8M8 17h5',
    mara:'M12 3l7 4v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z',
    oric:'M12 2l8 5v6c0 5-4 8-8 9-4-1-8-4-8-9V7l8-5ZM9 12h6',
    work:'M5 7h14v12H5zM9 7V5h6v2M8 11h8M8 15h5',
    craft:'M6 18l8-8M14 4l6 6M5 5l4 4M3 21l4-1 10-10-3-3L4 17z',
    profile:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c1.4-4.2 4.5-6.5 8-6.5s6.6 2.3 8 6.5',
    quest:'M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.6-.8L12 3Z'
  };
  const icon = k => `<span class="ash099-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconMap[k] || iconMap.quest}"/></svg></span>`;
  function shell(html){ root().innerHTML = `<main class="ash099 ash099-terminal"><div class="ash099-wrap">${html}</div></main>`; }
  function stat(label, value){ return `<div class="ash099-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`; }
  function hpPct(pl){ return Math.max(0, Math.min(100, Math.round((Number(pl.hp || 0) / Math.max(1, Number(pl.maxHp || 1))) * 100))); }
  function owned(pl, k){ return Number(pl.inventory?.[k] || 0); }
  function canAfford(pl, cost){ return Number(pl.gold || 0) >= Number(cost || 0); }
  function canCraft(pl, needs){ return needs.every(([k,v]) => owned(pl,k) >= Number(v || 0)); }
  function needsText(pl, needs){ return needs.map(([k,v]) => `${v} ${itemName(k)} (${owned(pl,k)})`).join(', '); }
  function note(msg){ const n = document.getElementById('ashNote'); if(n){ n.style.display='block'; n.textContent=msg; } }

  function goal(pl){
    const t = Number(pl?.inventory?.roadToken || 0);
    if(!pl?.flags?.talkedToMara) return { view:'people', title:'Report to the Square', text:'Ashmere does not trust strangers from the road. Speak with Mara, Brenn, and Oric before crossing the lantern line.', cta:'Enter Town Square', icon:'people', tasks:['Meet Mara Vell','Speak with Old Brenn','Hear Oric\'s warning'] };
    if(!pl.flags.firstRoadEvent) return { view:'inn', title:'Prepare Before the Gate', text:'Rest, gather supplies, check gear, or take a small town job before your first Old Road expedition.', cta:'Prepare in Town', icon:'inn', tasks:['Visit the Work Board','Check gear at the Blacksmith','Rest at the Inn'] };
    if(t < 3) return { view:'road', title:'Bring Back Road Proof', text:`You have ${t}/3 Road Tokens. Leave through the gate, survive the Old Road, then return to the ledger.`, cta:'Leave Through the Gate', icon:'road', tasks:[`${t}/3 Road Tokens collected`,'Return alive','Record proof with Brenn'] };
    return { view:'brenn', title:'Record Your Proof', text:'You have enough Road Tokens. Take them to Old Brenn and make the road remember your name.', cta:'Open the Ledger', icon:'brenn', tasks:['Turn in 3 Road Tokens','Collect ledger reward','Ask about the next road tier'] };
  }

  function actionCard(view, title, desc, label = 'Open', featured = false, ic = view){
    return `<button class="ash099-btn ash099-action ${featured ? 'featured' : ''}" data-ash-view="${esc(view)}">${icon(ic)}<span><strong>${esc(title)}</strong><small>${esc(desc)}</small></span><em>${esc(label)}</em></button>`;
  }
  function actionGroup(title, text, body, kind = ''){
    return `<section class="ash099-action-group ${kind}"><header><h3>${esc(title)}</h3><p>${esc(text)}</p></header><div class="ash099-group-grid">${body}</div></section>`;
  }
  function miniMeter(pl){ return `<div class="ash099-meter"><span>Health</span><strong>${Number(pl.hp || 0)}/${Number(pl.maxHp || 0)}</strong><i style="width:${hpPct(pl)}%"></i></div>`; }
  function currentRouteCard(g){
    return `<aside class="ash099-route-card"><h2>Current Route</h2><div class="ash099-route-title">${icon(g.icon)}<div><strong>${esc(g.title)}</strong><p>${esc(g.text)}</p></div></div><ul>${(g.tasks || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul><button class="ash099-btn primary" data-ash-view="${esc(g.view)}">${esc(g.cta)}</button></aside>`;
  }
  function travelerTerminal(pl){
    const name = pl.username || 'Traveler';
    return `<aside class="ash099-panel ash099-traveler-panel ash099-terminal-card"><h3>Traveler Terminal</h3><div class="ash099-traveler-identity"><div class="ash099-avatar"><span>${esc(String(name).slice(0,1)).toUpperCase()}</span></div><div><strong>${esc(name)}</strong><small>${esc(pl.className || 'Wanderer')}</small></div></div>${miniMeter(pl)}<div class="ash099-stats">${stat('Class', pl.className || 'Wanderer')}${stat('Gold', gold(pl.gold))}${stat('Road Tokens', `${Number(pl.inventory?.roadToken || 0)}/3`)}${stat('Weapon', weaponName(pl.weapon))}${stat('Armor', armorName(pl.armor))}${stat('Jobs Done', Number(pl.flags?.ashmereJobs || 0))}</div><p class="ash099-trait"><strong>Origin & Nature</strong><br>${esc(pl.personalityLabel || 'Unknown traveler')} • ${esc(pl.origin || 'Unknown origin')}</p></aside>`;
  }
  function terminalNav(){
    return `<nav class="ash099-footer ash099-topnav" aria-label="Ashmere terminal navigation"><button class="ash099-footer-item active" data-ash-view="home">${icon('inn')}<span>Town</span></button><button class="ash099-footer-item" data-ash-view="road">${icon('road')}<span>Routes</span></button><button class="ash099-footer-item" data-ash-view="archive">${icon('archive')}<span>Journal</span></button><button class="ash099-footer-item" data-ash-view="profile">${icon('profile')}<span>Profile</span></button><button class="ash099-footer-item" data-ash-view="sheet">${icon('sheet')}<span>Sheet</span></button></nav>`;
  }

  function renderAshmere(){
    const pl = p(); if(!pl) return;
    const g = goal(pl);
    const townLife = actionCard('people','Town Square','News, rumors, and conversations with Ashmere\'s guides.','Talk',!pl.flags?.talkedToMara,'people') + actionCard('inn','Ashmere Inn','Rest, recover, buy camp supplies, and hear road rumors.','Rest',false,'inn') + actionCard('trader','Trading Post','Buy, sell, and trade supplies, road loot, and valuables.','Shop',false,'trader') + actionCard('smith','Blacksmith','Upgrade gear, buy weapons, and reinforce armor.','Gear',false,'smith');
    const roadPrep = actionCard('work','Work Board','Contracts, bounties, low-risk jobs, and town needs.','Jobs',false,'work') + actionCard('craft','Crafting Bench','Convert road drops into healing, utility, and trade goods.','Craft',false,'craft') + actionCard('road','Town Gate','Leave the lantern line and begin an Old Road expedition.','Travel',Number(pl.flags?.talkedToMara),'road');
    const records = actionCard('brenn','Ledger Hall','Track proof, turn in Road Tokens, and claim rewards.','Ledger',false,'brenn') + actionCard('archive','Archive Hall','Lore, memories, discovered notes, and road records.','Archive',false,'archive') + actionCard('profile','Profile / Travelers','Account, registry binding, cloud slots, and tester rewards.','Registry',false,'profile') + actionCard('sheet','Character Sheet','Stats, inventory, gear, identity, and traits.','Sheet',false,'sheet');
    shell(`<section class="ash099-hero ash099-hero-mockup">${img(bg(), 'Ashmere')}<div class="ash099-hero-content"><div class="ash099-title"><div class="ash099-kicker">LEGEND • Roads of Ashmere</div><h1>Ashmere</h1><div class="ash099-terminal-plaque">Ashmere Town Terminal</div><p>A rain-dark base camp at the edge of the Old Road. The terminal organizes town life, road preparation, records, and traveler identity without losing the feeling of being in Ashmere.</p></div>${currentRouteCard(g)}</div></section>${terminalNav()}<section class="ash099-hub-layout ash099-hub-grouped"><div class="ash099-panel ash099-menu-panel ash099-town-access"><h2>Town Access</h2>${actionGroup('Town Life','People, rest, trade, and equipment — the everyday loop that makes Ashmere feel alive.',townLife,'town-life')}${actionGroup('Road Prep','Jobs, crafting, and the gate — the practical loop before an expedition.',roadPrep,'road-prep')}${actionGroup('Records & Registry','Progress, lore, account binding, and character details.',records,'records')}</div>${travelerTerminal(pl)}</section>`);
    bind();
  }

  function bind(){ document.querySelectorAll('[data-ash-view]').forEach(b => b.onclick = () => route(b.dataset.ashView)); }
  function route(v){
    if(v === 'home') return renderAshmere();
    if(v === 'people') return renderPeople();
    if(v === 'mara' || v === 'brenn' || v === 'oric') return renderNPC(v);
    if(v === 'inn') return renderInn();
    if(v === 'trader') return renderTrader();
    if(v === 'smith') return renderSmith();
    if(v === 'work') return renderWorkBoard();
    if(v === 'craft') return renderCrafting();
    if(v === 'sheet') return renderSheet();
    if(v === 'archive') return renderArchive();
    if(v === 'profile') return window.LegendAccountV09x?.renderAccount?.() || renderAshmere();
    if(v === 'road') return startRoad();
    return renderAshmere();
  }
  function back(extra = ''){ return `<div class="ash099-bottom">${extra}<button class="ash099-btn primary" id="ashBack">Back to Ashmere</button></div>`; }
  function head(k,t,d,im='',fallbackIcon='quest'){ return `<div class="ash099-head ${im ? 'has-art' : 'no-art'}">${im ? img(im,t) : `<div class="ash099-head-icon">${icon(fallbackIcon)}</div>`}<div><div class="ash099-kicker">${esc(k)}</div><h1>${esc(t)}</h1><p>${esc(d)}</p></div></div>`; }
  function screen(h,b,extra=''){ shell(`<section class="ash099-screen">${h}${b}${back(extra)}</section>`); document.getElementById('ashBack').onclick = renderAshmere; bind(); }

  function renderPeople(){
    screen(head('Town Square','People of Ashmere','The square is where Ashmere watches newcomers decide who they are.',bg(),'people'),`<div class="ash099-npc-grid"><button class="ash099-btn ash099-npc-card" data-ash-view="mara">${img(npc('mara'),'Mara Vell')}<strong>Mara Vell</strong><small>Archive keeper. Start here.</small></button><button class="ash099-btn ash099-npc-card" data-ash-view="brenn">${img(npc('brenn'),'Old Brenn')}<strong>Old Brenn</strong><small>Ledger keeper. Road proof and rewards.</small></button><button class="ash099-btn ash099-npc-card" data-ash-view="oric">${img(npc('oric'),'Captain Oric')}<strong>Captain Oric</strong><small>Gate captain. Road advice and warnings.</small></button></div>`);
  }

  function renderNPC(id){
    const pl=p();
    const map={
      mara:{name:'Mara Vell',role:'Archive Keeper',art:npc('mara'),text:'Mara keeps Ashmere\'s records in careful stacks, as if the town might fall apart without her hands holding it together.',lines:['The bell rang once when you arrived. That should not be possible.','If the road truly woke for you, Old Road may still hide proof of what changed.','Bring back Road Tokens. Bring back anything the road should not have remembered.']},
      brenn:{name:'Old Brenn',role:'Ledger Keeper',art:npc('brenn'),text:'Brenn keeps ink, coin, and consequences in the same room. Nothing counts in Ashmere until it is written down.',lines:['Road Tokens matter. Bell Fragments matter more.','The road forgets. I do not.','If you have three Road Tokens, I can record your first proof.']},
      oric:{name:'Captain Oric',role:'Gate Captain',art:npc('oric'),text:'Oric watches the gate like the road owes him blood.',lines:['Out there, hesitation gets people buried.','Guard when the hit looks heavy. Fall back before pride gets you killed.','Preparation is not cowardice. It is why veterans get old.']}
    };
    const n=map[id]||map.mara;
    pl.flags=pl.flags||{}; pl.npcTalk=pl.npcTalk||{}; pl.npcTalk[id]=Number(pl.npcTalk[id]||0)+1;
    if(id==='mara'){ pl.flags.talkedToMara=true; pl.flags.bellQuestStarted=true; }
    save(pl);
    let extra='';
    if(id==='brenn'&&Number(pl.inventory?.roadToken||0)>=3) extra='<button class="ash099-btn" id="turnTokens">Turn in 3 Road Tokens</button>';
    screen(head(n.role,n.name,n.text,n.art,id),`<div class="ash099-lines">${n.lines.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`,extra);
    const turn=document.getElementById('turnTokens');
    if(turn) turn.onclick=()=>{ const fresh=p(); fresh.inventory.roadToken-=3; fresh.flags.firstRoadComplete=true; fresh.gold=Number(fresh.gold||0)+260; save(fresh); renderNPC('brenn'); };
  }

  function renderInn(){
    screen(head('Service','Ashmere Inn','A warm room, a locked door, and one night away from the mud.',npc('innkeeper'),'inn'),`<div class="ash099-cards"><button class="ash099-btn ash099-card" id="rest">${icon('inn')}<strong>Rest</strong><small>Restore HP before returning to the Old Road.</small><em>35g</em></button><button class="ash099-btn ash099-card" id="camp">${icon('road')}<strong>Camp Supplies</strong><small>Useful for road pressure and travel prep.</small><em>90g</em></button><button class="ash099-btn ash099-card" id="rumor">${icon('archive')}<strong>Hear a Rumor</strong><small>Ask what travelers are whispering tonight.</small><em>Free</em></button></div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.getElementById('rest').onclick=()=>buyService(35,pl=>{pl.hp=pl.maxHp},'You rest at the inn.');
    document.getElementById('camp').onclick=()=>buyService(90,pl=>{pl.inventory.camp=Number(pl.inventory.camp||0)+1},'Bought camp supplies.');
    document.getElementById('rumor').onclick=()=>note(['A broken shrine showed itself in the fog last night.','Blackroot wolves hate firelight.','Brenn pays extra for proof that still bleeds.'][Math.floor(Math.random()*3)]);
  }
  function buyService(cost,fn,msg){const pl=p();if(Number(pl.gold||0)<cost)return note('Not enough gold.');pl.gold-=cost;fn(pl);save(pl);note(msg);}

  const workJobs = {
    wood:{title:'Split Firewood',desc:'Line up the axe strike and split clean through wet ash logs.',skill:'strength',pay:38,item:'woodScrap',amount:1,verb:'Strike',hint:'Hit the gold band for a clean split.'},
    gate:{title:'Watch the Gate',desc:'Spot movement beyond the lantern line before Oric has to shout.',skill:'survival',pay:42,item:'food',amount:1,verb:'Signal',hint:'Signal when the marker crosses the watchlight.'},
    records:{title:'Sort Archive Records',desc:'Find the right ledger tab before Mara loses patience.',skill:'lore',pay:45,item:'roadHerb',amount:1,verb:'File',hint:'Click when the marker reaches the stamped section.'},
    crates:{title:'Carry Market Crates',desc:'Move heavy crates without dropping trader stock into the mud.',skill:'strength',pay:34,item:'camp',amount:1,verb:'Lift',hint:'Click in the steady zone to keep your grip.'},
    yard:{title:'Clean Stable Yard',desc:'Unpleasant work, steady coin, and no monsters.',skill:'luck',pay:30,item:'clothScrap',amount:1,verb:'Shovel',hint:'Time the shovel when the rhythm lines up.'},
    message:{title:'Run a Message',desc:'Carry sealed word through rain-heavy alleys before the ink runs.',skill:'survival',pay:46,item:'goblinTrinket',amount:1,verb:'Deliver',hint:'Click as the marker crosses the seal.'}
  };
  function renderWorkBoard(){
    screen(head('Town Work','Work Board','Pick a job, then complete a quick timing check. Better timing means better pay and better odds at bonus supplies.','','work'),`<div class="ash099-cards">${Object.entries(workJobs).map(([id,j])=>`<button class="ash099-btn ash099-card" data-job-open="${id}">${icon('work')}<strong>${j.title}</strong><small>${j.desc} Check: ${j.skill.toUpperCase()}.</small><em>${j.pay}g</em></button>`).join('')}</div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-job-open]').forEach(b=>b.onclick=()=>renderJobActivity(b.dataset.jobOpen));
  }
  function renderJobActivity(id){
    const j=workJobs[id]||workJobs.wood;
    const zoneStart=34+Math.floor(Math.random()*16);
    const zoneWidth=18;
    screen(head('Town Work',j.title,j.desc,'','work'),`<section class="ash099-job-game"><p>${esc(j.hint)}</p><div class="ash099-job-track" id="jobTrack"><i class="ash099-job-zone" style="left:${zoneStart}%;width:${zoneWidth}%"></i><b class="ash099-job-marker" id="jobMarker"></b></div><div class="ash099-job-meta"><span>Skill: ${esc(j.skill.toUpperCase())}</span><span>Base Pay: ${gold(j.pay)}</span><span>Bonus: ${esc(itemName(j.item))}</span></div><button class="ash099-btn primary" id="jobStrike">${esc(j.verb)}</button><p class="ash099-note" id="jobResult" style="display:none"></p><p class="ash099-note">Keyboard: press Space or Enter to complete the action.</p></section>`, `<button class="ash099-btn" id="backJobs">Choose Another Job</button>`);
    const marker=document.getElementById('jobMarker');
    const strike=document.getElementById('jobStrike');
    const result=document.getElementById('jobResult');
    let pos=0,dir=1,done=false;
    const timer=setInterval(()=>{ if(done) return; pos+=dir*2.35; if(pos>=100){pos=100;dir=-1;} if(pos<=0){pos=0;dir=1;} if(marker) marker.style.left=pos+'%'; },24);
    function finish(){
      if(done) return;
      done=true;
      clearInterval(timer);
      const center=zoneStart+(zoneWidth/2);
      const dist=Math.abs(pos-center);
      const grade=dist<=4?'Perfect':dist<=9?'Good':dist<=17?'Messy':'Miss';
      const mult=grade==='Perfect'?1.45:grade==='Good'?1.12:grade==='Messy'?.72:.38;
      const pay=Math.max(5,Math.round(j.pay*mult));
      const bonusChance=grade==='Perfect'?.95:grade==='Good'?.62:grade==='Messy'?.24:.05;
      const pl=p();
      pl.flags=pl.flags||{}; pl.inventory=pl.inventory||{};
      pl.flags.ashmereJobs=Number(pl.flags.ashmereJobs||0)+1;
      pl.flags.ashmereFavor=Number(pl.flags.ashmereFavor||0)+(grade==='Perfect'?2:1);
      pl.gold=Number(pl.gold||0)+pay;
      let bonus='';
      if(Math.random()<bonusChance){ pl.inventory[j.item]=Number(pl.inventory[j.item]||0)+j.amount; bonus=` Bonus gained: ${j.amount} ${itemName(j.item)}.`; }
      if(grade==='Miss'&&Number(pl.hp||0)>1){ pl.hp=Math.max(1,Number(pl.hp||0)-1); bonus+=' You lose 1 HP from the rough work.'; }
      save(pl);
      if(result){ result.style.display='block'; result.textContent=`${grade}! Earned ${pay}g.${bonus} Ashmere favor increased.`; }
      if(strike){ strike.disabled=true; strike.textContent='Job Complete'; }
      setTimeout(()=>renderWorkBoard(),1600);
    }
    if(strike) strike.onclick=finish;
    const onKey=e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); document.removeEventListener('keydown',onKey); finish(); } };
    document.addEventListener('keydown',onKey);
    const backJobs=document.getElementById('backJobs');
    if(backJobs) backJobs.onclick=()=>{ done=true; clearInterval(timer); document.removeEventListener('keydown',onKey); renderWorkBoard(); };
  }

  function renderTrader(){
    const pl=p();
    const goods=[['food','Rations',60,'Keeps the road loop readable.'],['potion','Healing Potion',120,'Emergency healing during fights.'],['camp','Camp Supplies',90,'Travel prep for longer routes.'],['clothScrap','Cloth Scrap',34,'Crafting material for poultices.'],['oil','Lamp Oil',70,'Crafting material for strange lantern work.']];
    const sellables=[['wolfFang',12],['tornHide',8],['roadHerb',10],['wispAsh',22],['goblinTrinket',16],['blackrootThorn',14],['woodScrap',7],['clothScrap',9],['ore',24],['tradeBundle',72],['brokenBellShard',60]];
    const sellAllValue=sellables.reduce((sum,[k,v])=>sum+(owned(pl,k)*v),0);
    const buyCards=goods.map(([k,n,c,d])=>`<button class="ash099-btn ash099-card" data-buy="${k}" data-cost="${c}" ${canAfford(pl,c)?'':'disabled'}>${icon('trader')}<strong>${n}</strong><small>${esc(d)} You own ${owned(pl,k)}.</small><em>${c}g</em></button>`).join('');
    const sellCards=sellables.map(([k,v])=>`<button class="ash099-btn ash099-card" data-sell="${k}" data-value="${v}" ${owned(pl,k)>0?'':'disabled'}>${icon('trader')}<strong>${itemName(k)}</strong><small>You own ${owned(pl,k)}. Raw sell value.</small><em>${v}g each</em></button>`).join('');
    screen(head('Shop','Trading Post','Supplies, road loot, and the ugly math that keeps Ashmere alive.',npc('trader'),'trader'),`<div class="ash099-market-summary"><strong>Your Gold: ${gold(pl.gold)}</strong><span>Sellable road loot value: ${gold(sellAllValue)}</span><button class="ash099-btn" id="sellAllLoot" ${sellAllValue>0?'':'disabled'}>Sell All Road Loot</button></div><h2>Buy Supplies</h2><div class="ash099-cards">${buyCards}</div><h2>Sell Road Loot</h2><div class="ash099-cards">${sellCards}</div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy,Number(b.dataset.cost)));
    document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>sellItem(b.dataset.sell,Number(b.dataset.value)));
    const sellAll=document.getElementById('sellAllLoot');
    if(sellAll) sellAll.onclick=()=>sellAllLoot(sellables);
  }
  function buyItem(k,cost){const pl=p();if(Number(pl.gold||0)<cost)return note('Not enough gold.');pl.gold-=cost;pl.inventory[k]=Number(pl.inventory[k]||0)+1;save(pl);renderTrader();}
  function sellItem(k,value){const pl=p();if(owned(pl,k)<=0)return note('Nothing to sell.');pl.inventory[k]-=1;pl.gold=Number(pl.gold||0)+value;save(pl);renderTrader();}
  function sellAllLoot(sellables){const pl=p();let total=0;sellables.forEach(([k,v])=>{const qty=owned(pl,k);if(qty>0){total+=qty*v;pl.inventory[k]=0;}});if(total<=0)return note('No sellable road loot.');pl.gold=Number(pl.gold||0)+total;save(pl);renderTrader();}

  function renderCrafting(){
    const pl=p();
    const recipes=[
      ['roadPoultice','Road Poultice',[['roadHerb',2],['clothScrap',1]],'Healing item for rough travel.'],
      ['blackrootTonic','Blackroot Tonic',[['blackrootThorn',1],['wolfFang',1]],'Prepared for fear, bleed, and cursed road events later.'],
      ['huntersCharm','Hunter\'s Charm',[['wolfFang',2],['camp',1]],'+1 survival flavor for next road trip later.'],
      ['reinforcedBuckle','Reinforced Buckle',[['ore',1],['tornHide',1]],'Minor armor improvement material for the blacksmith later.'],
      ['wispLanternWick','Wisp Lantern Wick',[['wispAsh',1],['oil',1]],'Prepared to reveal hidden road events later.'],
      ['tradeBundle','Trade Bundle',[['goblinTrinket',2],['tornHide',1],['woodScrap',1]],'Sellable bundle worth more than raw scraps.']
    ];
    const cards=recipes.map(([id,name,needs,desc])=>`<button class="ash099-btn ash099-card" data-craft="${id}" data-needs="${needs.map(n=>n.join(':')).join(',')}" ${canCraft(pl,needs)?'':'disabled'}>${icon('craft')}<strong>${name}</strong><small>${desc}<br>Needs ${needsText(pl,needs)}.</small><em>${canCraft(pl,needs)?'Craft':'Missing'}</em></button>`).join('');
    screen(head('Crafting','Crafting Bench','Road drops should matter. Convert herbs, fangs, hides, ash, and scraps into useful items or better sellables.','','craft'),`<div class="ash099-market-summary"><strong>Bench Stock</strong><span>Use road drops here before selling raw loot.</span><button class="ash099-btn" id="openTrader">Open Trading Post</button></div><div class="ash099-cards">${cards}</div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>craftItem(b.dataset.craft,b.dataset.needs));
    const openTrader=document.getElementById('openTrader');
    if(openTrader) openTrader.onclick=renderTrader;
  }
  function craftItem(id,needsTextRaw){const pl=p();const needs=String(needsTextRaw||'').split(',').filter(Boolean).map(x=>{const [k,v]=x.split(':');return [k,Number(v||0)];});if(!canCraft(pl,needs))return note('Missing ingredients.');needs.forEach(([k,v])=>pl.inventory[k]-=v);pl.inventory[id]=Number(pl.inventory[id]||0)+1;save(pl);renderCrafting();}

  function renderSmith(){
    const weapons=(D().weapons||[]).filter(w=>w.id!=='hand').slice(0,4),armors=(D().armors||[]).filter(a=>a.id!=='none').slice(0,4);
    screen(head('Gear','Blacksmith','Blades, chain, leather, and practical warnings.',npc('blacksmith'),'smith'),`<h2>Weapons</h2><div class="ash099-cards">${weapons.map(w=>gearCard(w,'weapon')).join('')}</div><h2>Armor</h2><div class="ash099-cards">${armors.map(a=>gearCard(a,'armor')).join('')}</div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>buyGear(b.dataset.gear,b.dataset.kind,Number(b.dataset.cost)));
  }
  function gearCard(x,kind){const ownedGear=kind==='weapon'?p().ownedWeapons?.[x.id]:p().ownedArmor?.[x.id];return `<button class="ash099-btn ash099-card" data-gear="${esc(x.id)}" data-kind="${kind}" data-cost="${Number(x.cost||0)}">${icon(kind==='weapon'?'smith':'mara')}<strong>${esc(x.name)}</strong><small>${kind==='weapon'?`Damage ${x.min}-${x.max}`:`Defense ${x.defense}`}${ownedGear?' • Owned':''}</small><em>${gold(x.cost)}</em></button>`;}
  function buyGear(id,kind,cost){const pl=p();if(Number(pl.gold||0)<cost)return note('Not enough gold.');pl.gold-=cost;if(kind==='weapon'){pl.weapon=id;pl.ownedWeapons=pl.ownedWeapons||{};pl.ownedWeapons[id]=1;}else{pl.armor=id;pl.ownedArmor=pl.ownedArmor||{};pl.ownedArmor[id]=1;}save(pl);note('Equipped new '+kind+'.');}

  function renderSheet(){const pl=p();const inv=Object.entries(pl.inventory||{}).filter(([,v])=>Number(v)>0).map(([k,v])=>`<div class="ash099-stat"><strong>${esc(itemName(k))}</strong><span>x${Number(v)}</span></div>`).join('')||'<p>No notable items.</p>';screen(head('Character',pl.username,`${pl.personalityLabel||'Traveler'} • ${pl.origin} • ${pl.className}`,'','sheet'),`<div class="ash099-stats">${stat('HP',`${pl.hp}/${pl.maxHp}`)}${stat('Gold',gold(pl.gold))}${stat('Weapon',weaponName(pl.weapon))}${stat('Armor',armorName(pl.armor))}${stat('Pronouns',pl.pronouns||'they/them')}${stat('Road Tokens',Number(pl.inventory?.roadToken||0))}</div><h2>Inventory</h2><div class="ash099-stats">${inv}</div>`);}
  function renderArchive(){const pl=p();screen(head('Records','Archive Hall','Mara keeps records, maps, and town memory.','','archive'),`<div class="ash099-lines">${(pl.memories||[]).map(m=>`<p>${esc(m)}</p>`).join('')||'<p>No memories recorded yet. The road has not left enough ink on you.</p>'}</div>`);}
  function startRoad(){if(window.LegendRoadControllerV087?.start)return window.LegendRoadControllerV087.start();screen(head('Town Gate','Old Road','The road controller did not load.',roadBg(),'road'),'<p>Try a hard refresh.</p>');}
  function intercept(){const text=document.body?.innerText||'';if(/Ashmere Menu|Ashmere • First Town/.test(text)&&!document.querySelector('.ash099'))renderAshmere();}
  window.LegendAshmereV099={renderAshmere,route};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',intercept);else intercept();
  const rt=RT(); if(rt.onRender)rt.onRender(intercept);
})();