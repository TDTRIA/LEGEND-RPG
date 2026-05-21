(() => {
  const D = window.LEGEND_DATA;
  const S = window.LegendStorage;
  const UI = window.LegendUI;
  const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));
  let player = null;
  let log = [];
  let locationName = 'Recovered Menu';
  let currentEnemy = null;
  let explore = null;

  const weapon = () => D.weapons.find(w => w.id === player.weapon) || D.weapons[0];
  const armor = () => D.armors.find(a => a.id === player.armor) || D.armors[0];
  const save = () => S.savePlayer(player);
  const addLog = (m,t='') => { log.unshift({m,t}); log = log.slice(0,12); };
  const gainItem = (k,a) => { player.inventory[k] = (player.inventory[k] || 0) + a; addLog(`Gained ${a} ${D.itemNames[k] || k}.`, 'story'); };
  const gainGold = a => { player.gold += a; addLog(`Gained ${a} gold.`, 'story'); };
  const gainXP = a => { player.xp += a; player.xpUntil -= a; if(player.xpUntil <= 0){ player.level++; player.xpUntil = 420 + player.level * 110; player.maxHp += player.className === 'Warrior' ? 30 : 22; player.hp = player.maxHp; addLog(`Level up! You are now level ${player.level}.`, 'story'); } };

  function mod(skill){
    const cls = D.classes[player.className]?.mod?.[skill] || 0;
    const org = D.origins[player.origin]?.bonus?.[skill] || 0;
    const keep = D.keepsakes[player.keepsake]?.bonus?.[skill] || 0;
    return cls + org + keep;
  }

  function d20(skill, dc){
    const roll = rand(1,20), bonus = mod(skill), total = roll + bonus, ok = total >= dc;
    ok ? player.stats.checksPassed++ : player.stats.checksFailed++;
    addLog(`${skill} check: d20(${roll}) + ${bonus} = ${total} vs DC ${dc}. ${ok ? 'Success!' : 'Failure.'}`, ok ? 'story' : 'danger');
    return ok;
  }

  function layout(title, content='', actions=[], extra=''){
    UI.renderLayout({player, version:D.VERSION, locationName, title, content, actions, extra, log, weapon:weapon(), armor:armor()});
  }

  function portrait(id){
    return `<pre class="ascii">${D.portraits?.[id] || D.ascii.npc}</pre>`;
  }

  function newPlayer(username, origin, className, keepsake){
    const cls = D.classes[className], org = D.origins[origin], keep = D.keepsakes[keepsake];
    const inv = {gmail:0,hbone:0,rtab:0,food:2,rfood:0,bait:0,potion:1,camp:1,fur:0,gem:0,log:0,ore:0,morb:0,codeFragment:0,bellFragment:0,roadToken:0};
    Object.entries(org.items || {}).forEach(([k,v]) => inv[k] += v);
    Object.entries(keep.items || {}).forEach(([k,v]) => inv[k] += v);
    return S.normalize({version:D.VERSION,username,world:'Eldermere',town:'Ashmere',origin,className,keepsake,level:1,hp:cls.hp,maxHp:cls.hp,xp:0,xpUntil:420,gold:cls.gold+(org.gold||0),weapon:'hand',armor:'none',ownedWeapons:{hand:1},ownedArmor:{none:1},inventory:inv,bank:[0,0,0,0,0],stats:{},flags:{},traits:[],momentum:0,skills:S.baseSkills(),mastery:{},questLog:['The Bell That Rang Once: Speak to Mara in People of Ashmere.','The First Road: Explore Old Road and return with 3 Road Tokens.'],memories:['You woke beneath a dead lantern outside Ashmere.',`Origin: ${origin}. ${org.text}`,`Keepsake: ${keepsake}. ${keep.text}`]});
  }

  function title(){
    S.applySettings();
    player = S.loadPlayer();
    UI.root().innerHTML = `<div class="title-wrap"><section class="title-card"><div><div class="kicker">Recovered Build ${D.VERSION}</div><pre class="ascii">${D.ascii.title}</pre><h1 class="game-title">LEGEND</h1><p class="title-lore">v0.6 refactors the game into real files, adds progressive menu unlocks, and introduces accessibility settings for public playtesting.</p><div class="actions">${player?`<button class="btn primary" id="continue">Continue as ${UI.esc(player.username)}</button>`:''}<button class="btn" id="new">New Recovered Save</button><button class="btn" id="settings">Settings / Accessibility</button><a class="btn" href="save.html">Save Vault</a><a class="btn" href="feedback.html">Playtest Feedback</a>${player?`<button class="btn danger" id="delete">Delete Browser Save</button>`:''}</div><p class="small">New players now unlock Ashmere systems gradually instead of seeing everything at once.</p></div></section></div>`;
    if(player) document.getElementById('continue').onclick = () => { addLog('Welcome back to Ashmere.', 'story'); menu(); };
    document.getElementById('new').onclick = createName;
    document.getElementById('settings').onclick = settings;
    if(player) document.getElementById('delete').onclick = () => { if(confirm('Delete browser save?')){ S.deleteSaves(); player=null; log=[]; title(); } };
  }

  function createName(){
    UI.root().innerHTML = `<div class="title-wrap"><section class="title-card"><div><div class="kicker">The Road Asks</div><h1 style="margin:0;color:var(--accent);font-size:clamp(2rem,7vw,5rem)">Who Are You?</h1><p class="title-lore">You wake beneath a dead lantern. Ahead, a sign points toward Ashmere.</p><input id="name" placeholder="Name, no spaces"><div class="actions"><button class="btn primary" id="next">Continue</button><button class="btn" id="back">Back</button></div></div></section></div>`;
    document.getElementById('next').onclick = () => { const n = document.getElementById('name').value.trim(); if(!n || n.includes(' ')) return alert('Name cannot be empty or contain spaces.'); chooseOrigin(n); };
    document.getElementById('back').onclick = title;
  }

  function choosePage(step, heading, lore, items, onPick, back){
    UI.root().innerHTML = `<div class="title-wrap"><section class="title-card"><div><div class="kicker">${step}</div><h1 style="margin:0;color:var(--accent);font-size:clamp(2rem,7vw,5rem)">${heading}</h1><p class="title-lore">${lore}</p><div class="list">${items.map(([n,d])=>`<button class="shop" data-pick="${UI.esc(n)}"><h3>${UI.esc(n)}</h3><p>${UI.esc(d.desc || d.text)}</p></button>`).join('')}</div><div class="actions"><button class="btn" id="back">Back</button></div></div></section></div>`;
    document.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => onPick(b.dataset.pick));
    document.getElementById('back').onclick = back;
  }
  const chooseOrigin = n => choosePage('Character Creation','Choose Your Origin','Who were you before the road took you?',Object.entries(D.origins),o=>chooseClass(n,o),createName);
  const chooseClass = (n,o) => choosePage('Character Creation','Choose Your Class','What did the road leave you capable of becoming?',Object.entries(D.classes),c=>chooseKeepsake(n,o,c),()=>chooseOrigin(n));
  const chooseKeepsake = (n,o,c) => choosePage('Character Creation','Choose Your Keepsake','One thing came with you from before the static.',Object.entries(D.keepsakes),k=>{player=newPlayer(n,o,c,k);log=[];addLog('The cracked token warms in your palm.','story');save();intro();},()=>chooseClass(n,o));

  function intro(){
    locationName = 'Ashmere Road';
    save();
    layout('The Road to Ashmere', 'You wake beneath a dead lantern. Behind you, the path has collapsed into static. Ahead, the first town waits behind a tired wooden gate.\n\nThe sign reads: ASHMERE.\n\nThe town bell rings once. Then the world remembers you.', [{label:'Enter Ashmere',className:'primary',fn:menu}], `<pre class="ascii">${D.ascii.ashmere}</pre>`);
  }

  function unlocked(id){
    if(['road','people','sheet','settings','saveExit'].includes(id)) return true;
    if(['archive','ledger','saveVault'].includes(id)) return player.flags.talkedToMara;
    if(['inn','trade'].includes(id)) return player.flags.firstRoadEvent;
    if(['weapon','armor'].includes(id)) return player.flags.firstToken || player.stats.monstersDefeated > 0;
    if(id === 'commons') return player.flags.firstResource;
    if(id === 'keep') return player.flags.firstRoadComplete;
    return false;
  }

  function menu(){
    locationName = 'Ashmere';
    save();
    const cards = [
      ['road','🛤️','Explore The First Road','Start here. The road teaches the first systems.',exploreStart],
      ['people','👥','People of Ashmere','Speak with Mara and learn what the town remembers.',people],
      ['archive','📜','The Archive Hall','Recovered memories, quest notes, and old records.',archive],
      ['ledger','🏛️','The Ledger Hall','Turn in quest items and use the ledger.',ledger],
      ['inn','🛏️','Ashmere Inn','Rest and buy camp supplies.',inn],
      ['trade','⚖️','Trading Post','Sell common drops and resources.',tradingPost],
      ['weapon','🗡️','Weapon Shop','Buy stronger weapons.',weaponShop],
      ['armor','🛡️','Armor Shop','Buy armor.',armorShop],
      ['commons','🌿','The Commons','Train skills and mastery.',commons],
      ['keep','🏰','The Hollow Keep','A later threat waits below.',keepWarn],
      ['sheet','👤','Character Sheet','Review character and inventory.',sheet],
      ['settings','⚙️','Settings / Accessibility','Text size, bold text, contrast, motion, ASCII settings.',settings],
      ['saveVault','💾','Save Vault','Export/import portable saves.',()=>location.href='save.html'],
      ['saveExit','🚪','Save / Exit','Return to title.',title]
    ];
    const visible = cards.filter(c => unlocked(c[0]));
    const hiddenCount = cards.length - visible.length;
    const hint = hiddenCount > 0 ? `<div class="quest"><h3>More of Ashmere is still closed.</h3><p>Meet people, survive the road, and bring proof back to town to open new places.</p></div>` : '';
    const html = `<pre class="ascii">${D.ascii.ashmere}</pre><div class="grid">${visible.map((c,i)=>`<button class="card" data-menu="${i}"><h3>${c[1]} ${c[2]}</h3><p>${c[3]}</p></button>`).join('')}</div>${hint}`;
    layout('Ashmere Menu', '', [], html);
    visible.forEach((c,i)=>document.querySelector(`[data-menu="${i}"]`).onclick = c[4]);
  }

  function people(){
    const html = `<div class="list"><button class="npc-card" id="mara"><h3>Mara Vell</h3><p>Archive Keeper - the first person you should speak to.</p></button><button class="npc-card" id="brenn"><h3>Old Brenn</h3><p>Ledger Keeper - handles Bell Fragments and Road Tokens.</p></button><button class="npc-card" id="oric"><h3>Captain Oric</h3><p>Guard Captain - teaches combat survival.</p></button></div>`;
    locationName = 'Ashmere';
    layout('People of Ashmere','The town has voices. Talk to people to unlock quests, rumors, and memories.',[{label:'Back to Ashmere',fn:menu}],html);
    document.getElementById('mara').onclick = talkMara;
    document.getElementById('brenn').onclick = talkBrenn;
    document.getElementById('oric').onclick = talkOric;
  }

  function talkMara(){
    player.flags.talkedToMara = true;
    player.flags.bellQuestStarted = true;
    if(!player.memories.includes('Mara says the Ashmere bell has not worked since the rollback.')) player.memories.push('Mara says the Ashmere bell has not worked since the rollback.');
    addLog('Mara points you toward Old Road and the missing Bell Shard.', 'story');
    save();
    const text = `Mara Vell keeps the Ashmere records in careful stacks, as if the town might fall apart without her hands holding it together.\n\n“The bell rang once again when you arrived. That should not be possible.\n\nIf the road truly woke for you, then Old Road may still hide the missing Bell Fragment. Find it, and bring it back. If the records are wrong, I need to know why.”`;
    layout('Mara Vell', text, [{label:'Back to People',fn:people},{label:'Back to Ashmere',fn:menu}], portrait('mara'));
  }

  function talkBrenn(){
    const text = `Old Brenn keeps Ashmere's ledger with iron patience. Every debt, promise, and recovered fragment ends up in his book.\n\n“If you've got proof from the road, show me. Road Tokens matter. Bell Fragments matter more. The road forgets. I don't.”`;
    const actions = [{label:'Back to People',fn:people},{label:'Back to Ashmere',fn:menu}];
    if(player.inventory.bellFragment > 0) actions.unshift({label:'Show Bell Fragment',className:'primary',fn:()=>{player.inventory.bellFragment--;player.flags.bellQuestComplete=true;gainGold(350);gainXP(160);addLog('Brenn records the Bell Fragment in the ledger.','story');save();talkBrenn();}});
    if(player.inventory.roadToken >= 3) actions.unshift({label:'Turn in 3 Road Tokens',className:'primary',fn:()=>{player.inventory.roadToken-=3;player.flags.firstRoadComplete=true;gainGold(260);gainItem('camp',2);addLog('The First Road is complete. The Hollow Keep stirs.','story');save();talkBrenn();}});
    layout('Old Brenn', text, actions, portrait('brenn'));
  }

  function talkOric(){
    addLog('Oric teaches you to read enemy intent and survive heavy attacks.', 'story');
    const text = `Captain Oric stands near the gate in battered guard gear. He watches the road like it owes him something.\n\n“Out there, hesitation gets people buried. Watch what your enemy means to do, not just what they are doing. Guard when the hit looks heavy. Strike when the road gives you the opening.”`;
    layout('Captain Oric', text, [{label:'Back to People',fn:people},{label:'Back to Ashmere',fn:menu}], portrait('oric'));
  }

  function exploreStart(){
    explore = { danger:1 };
    locationName = 'Ashmere Gate';
    layout('Choose a Route','Only Old Road is open at the start. More routes will unlock after The First Road is complete.',[{label:'Old Road',className:'primary',fn:exploreEvent},{label:'Return to Ashmere',fn:menu}],`<pre class="ascii">${D.ascii.road}</pre>`);
  }

  function exploreEvent(){
    player.flags.firstRoadEvent = true;
    player.stats.roadEvents++;
    const event = rand(1,4);
    locationName = 'Roads Beyond Ashmere';
    if(event === 1){
      const ok = d20('survival', 7);
      if(ok){ gainItem('roadToken',1); player.flags.firstToken = true; gainXP(45); }
      else addLog('The milestone slips back into the mud.', 'danger');
    } else if(event === 2){
      const ok = d20('lore', 8);
      if(player.flags.bellQuestStarted && !player.flags.bellRoadSearched){ player.inventory.bellFragment++; player.flags.bellRoadSearched = true; addLog('You find the Bell Fragment under old road dust.', 'story'); }
      else if(ok){ gainGold(45); gainXP(30); }
    } else if(event === 3){
      gainItem('log',2); player.flags.firstResource = true; player.stats.resourcesFound++; gainXP(30);
    } else {
      startBattle(true); return;
    }
    save();
    layout('The Road Continues',`Road Tokens: ${player.inventory.roadToken}/3\nCamp Supplies: ${player.inventory.camp}\n\nThe road feels less impossible now.`,[{label:'Continue Exploring',className:'primary',fn:exploreEvent},{label:'Return to Ashmere',fn:menu}],`<pre class="ascii">${D.ascii.road}</pre>`);
  }

  function startBattle(fromRoad=false){
    const base = D.enemies[rand(0,D.enemies.length-1)];
    currentEnemy = {...base, hp:rand(base.hp[0],base.hp[1]), maxHp:0}; currentEnemy.maxHp = currentEnemy.hp;
    currentEnemy.intentText = currentEnemy.intent?.[rand(0,currentEnemy.intent.length-1)] || 'watches you carefully';
    locationName = 'Road Encounter';
    addLog(`A ${currentEnemy.name} appears. Trait: ${currentEnemy.trait}.`, 'danger');
    battle(fromRoad);
  }

  function battle(fromRoad=false){
    const html = `<div class="enemy"><div><div class="glyph">${currentEnemy.glyph}</div><h2 class="red">${currentEnemy.name}</h2><p class="muted">${currentEnemy.hp}/${currentEnemy.maxHp} HP / ${currentEnemy.trait}</p><p class="gold">Intent: ${currentEnemy.intentText}</p><p class="muted">Momentum: ${player.momentum || 0}/5</p></div></div>`;
    const moveName = D.classes[player.className]?.move || 'Class Move';
    layout('Battle','', [
      {label:'Attack',className:'primary',fn:()=>{const dmg=rand(weapon().min,weapon().max); currentEnemy.hp-=dmg; player.momentum=clamp((player.momentum||0)+1,0,5); gainXP(Math.floor(dmg*.75)); addLog(`You hit for ${dmg}. Momentum +1.`); if(currentEnemy.hp<=0) return winBattle(fromRoad); enemyHit(fromRoad);}},
      {label:'Guard',fn:()=>{player.momentum=clamp((player.momentum||0)+1,0,5); addLog('You guard, brace yourself, and gain Momentum.','story'); enemyHit(fromRoad,true);}},
      {label:`${moveName} ${player.momentum>=2?'':'(needs 2 Momentum)'}`,fn:()=>classMove(fromRoad)},
      {label:'Flee',fn:menu}
    ], html);
  }

  function classMove(fromRoad){
    if((player.momentum||0) < 2){ addLog('Not enough Momentum for your class move.', 'danger'); return battle(fromRoad); }
    player.momentum -= 2;
    let dmg = Math.floor(rand(weapon().min, weapon().max) * 1.45);
    if(player.className === 'Warrior') dmg += 10;
    if(player.className === 'Mage') dmg += 14;
    if(player.className === 'Ranger') currentEnemy.maxDamage = Math.max(8, currentEnemy.maxDamage - 6);
    if(player.className === 'Thief') gainGold(rand(10,45));
    if(player.className === 'Skiller') player.hp = clamp(player.hp + rand(8,24), 1, player.maxHp);
    currentEnemy.hp -= dmg;
    gainXP(Math.floor(dmg*.8));
    addLog(`${D.classes[player.className].move} hits for ${dmg}.`, 'story');
    if(currentEnemy.hp <= 0) return winBattle(fromRoad);
    enemyHit(fromRoad);
  }

  function enemyHit(fromRoad, guarded=false){
    const dmg=Math.floor(Math.max(0,rand(1,currentEnemy.maxDamage)-rand(0,armor().defense))*(guarded?.5:1));
    player.hp-=dmg;
    addLog(`${currentEnemy.name} hits for ${dmg}.`, 'danger');
    const base = D.enemies.find(e=>e.name===currentEnemy.name);
    currentEnemy.intentText = base?.intent?.[rand(0,base.intent.length-1)] || 'watches you carefully';
    if(player.hp<=0){player.stats.timesDied++; player.hp=player.maxHp; player.momentum=0; addLog('Ashmere drags your save back from the dark.','danger'); save(); return menu();}
    save(); battle(fromRoad);
  }
  function winBattle(fromRoad){ const [k,a] = currentEnemy.drop; gainItem(k,a); player.stats.monstersDefeated++; player.flags.firstToken = true; if(fromRoad) gainItem('roadToken',1); player.momentum=clamp((player.momentum||0)+1,0,5); player.hp=clamp(player.hp+20,1,player.maxHp); save(); menu(); }

  function inn(){ locationName='Ashmere Inn'; layout('Ashmere Inn','Rest or prepare for the next road trip.',[{label:'Rest - 35g',className:'primary',fn:()=>{if(player.gold>=35){player.gold-=35;player.hp=player.maxHp;addLog('You rest at the inn.','story');}else addLog('Not enough gold.','danger');save();inn();}},{label:'Buy Camp Supplies - 90g',fn:()=>{if(player.gold>=90){player.gold-=90;gainItem('camp',1);}else addLog('Not enough gold.','danger');save();inn();}},{label:'Back',fn:menu}],`<pre class="ascii">${D.ascii.ashmere}</pre>`); }
  function tradingPost(){ locationName='Trading Post'; const sellables=Object.keys(D.prices).filter(k=>D.prices[k]>0&&player.inventory[k]>0&&!['food','camp','potion','rtab','gem'].includes(k)); const html=`<div class="list">${sellables.length?sellables.map(k=>`<button class="shop" data-sell="${k}"><h3>${D.itemNames[k]} x${player.inventory[k]}</h3><p>Sell all for ${D.prices[k]*player.inventory[k]} gold.</p></button>`).join(''):'<div class="quest"><h3>Nothing safe to sell</h3><p>Explore first.</p></div>'}</div>`; layout('Trading Post','Sell common drops. Important survival and quest items are protected.',[{label:'Back',fn:menu}],html); document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{const k=b.dataset.sell; const total=D.prices[k]*player.inventory[k]; player.inventory[k]=0; player.gold+=total; addLog(`Sold items for ${total} gold.`,'story'); save(); tradingPost();}); }
  function weaponShop(){ shop('Weapon Shop',D.weapons.filter(w=>w.id!=='hand'),'weapon'); }
  function armorShop(){ shop('Armor Shop',D.armors.filter(a=>a.id!=='none'),'armor'); }
  function shop(title,items,type){ const html=`<div class="list">${items.map(x=>`<button class="shop" data-buy="${x.id}"><h3>${x.name}</h3><p>${type==='weapon'?`Damage ${x.min}-${x.max}`:`Block 0-${x.defense}`} / ${x.cost} gold</p></button>`).join('')}</div>`; locationName=title; layout(title,'', [{label:'Back',fn:menu}],html); document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const item=items.find(x=>x.id===b.dataset.buy); if(player.gold<item.cost){addLog('Not enough gold.','danger'); return menu();} player.gold-=item.cost; if(type==='weapon')player.weapon=item.id; else player.armor=item.id; addLog(`Equipped ${item.name}.`,'story'); save(); menu();}); }
  function commons(){ locationName='The Commons'; const html=`<div class="list">${Object.entries(player.skills).map(([n,s])=>`<button class="shop" data-skill="${n}"><h3>${n} - Level ${s.level}</h3><p>Mastery: ${player.mastery[n]||0}%</p></button>`).join('')}</div>`; layout('The Commons','Train skills and mastery.',[{label:'Back',fn:menu}],html); document.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>{const n=b.dataset.skill; player.mastery[n]=(player.mastery[n]||0)+2; player.flags.firstResource=true; addLog(`${n} mastery increased.`, 'story'); save(); commons();}); }
  function archive(){ locationName='The Archive Hall'; layout('The Archive Hall',`Recovered Memories:\n- ${player.memories.join('\n- ')}`,[{label:'Back',fn:menu}],`<pre class="ascii">${D.ascii.ashmere}</pre>`); }
  function sheet(){ locationName='Character Sheet'; const inv=Object.entries(player.inventory).map(([k,v])=>`- ${D.itemNames[k]||k}: ${v}`).join('\n'); layout('Character Sheet',`Name: ${player.username}\nOrigin: ${player.origin}\nClass: ${player.className}\nKeepsake: ${player.keepsake}\n\nInventory:\n${inv}\n\nQuest Log:\n- ${player.questLog.join('\n- ')}`,[{label:'Back',fn:menu}],`<pre class="ascii">${D.ascii.ashmere}</pre>`); }
  function ledger(){ locationName='The Ledger Hall'; layout('The Ledger Hall','Brenn keeps the record of gold, names, Bell Fragments, and Road Tokens.',[{label:'Speak with Brenn',className:'primary',fn:talkBrenn},{label:'Back',fn:menu}],`<pre class="ascii">${D.ascii.ashmere}</pre>`); }
  function keepWarn(){ locationName='The Hollow Keep'; layout('The Hollow Keep','The gate recognizes your First Road mark. Lacoyx is not fully rebuilt yet in v0.6, but the route is now visible.',[{label:'Back',fn:menu}],`<pre class="ascii">${D.ascii.keep}</pre>`); }

  function settings(){
    const current = S.loadSettings();
    const options = [
      ['largeText','Larger Text','Increases the base text size.'],['boldText','Bolder Text','Makes most text heavier.'],['highContrast','High Contrast','Improves contrast for readability.'],['reducedMotion','Reduced Motion','Removes hover movement and transitions.'],['simpleAscii','Simplified ASCII','Hides ASCII art panels.'],['spacious','Spacious UI','Adds more padding to panels.'],['readableFont','Readable Font','Uses Verdana/Arial instead of the default style.']
    ];
    const html = `<div class="list">${options.map(([k,n,d])=>`<button class="setting-card" data-setting="${k}"><h3>${current[k]?'✅':'⬜'} ${n}</h3><p>${d}</p></button>`).join('')}</div>`;
    if(player){ locationName='Settings'; layout('Settings / Accessibility','Toggle readability options. These save separately from your character.',[{label:'Back to Ashmere',fn:menu},{label:'Title',fn:title}],html); }
    else { UI.root().innerHTML = `<div class="title-wrap"><section class="title-card"><div><div class="kicker">Settings</div><h1 style="color:var(--accent)">Accessibility</h1><p class="title-lore">Toggle readability options. These save separately from your character.</p>${html}<div class="actions"><button class="btn" id="back">Back</button></div></div></section></div>`; document.getElementById('back').onclick=title; }
    document.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>{const s=S.loadSettings(); s[b.dataset.setting]=!s[b.dataset.setting]; S.saveSettings(s); settings();});
  }

  S.applySettings();
  title();
})();