// LEGEND v0.9.6 - Town Controller
// Direct Ashmere routing. No fake-click legacy handoffs for core first-town screens.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const TOWNS = () => window.LegendTownsV080 || {};
  const ASSETS = () => window.LegendAssetsV090 || {};
  const DATA = () => window.LEGEND_DATA || {};
  const ROOT_ID = 'legendTownV080';

  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function root(){return document.getElementById('root');}
  function player(){return RT()?.loadPlayer?.() || null;}
  function save(p){RT()?.savePlayer?.(p);}
  function money(n){return Number(n||0)+'g';}
  function itemName(k){return DATA().itemNames?.[k] || k;}
  function bg(){return ASSETS().locations?.ashmereMain || 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg';}
  function npcArt(id){return ASSETS().npcs?.[id] || '';}
  function shopArt(kind){return kind==='trader'?ASSETS().npcs?.trader:kind==='inn'?ASSETS().npcs?.innkeeper:ASSETS().npcs?.blacksmith;}

  function shell(html){root().innerHTML=`<div class="shell"><section class="panel v094-town-polish"><div id="${ROOT_ID}" class="v080-town-shell">${html}</div></section></div>`;}
  function statusPills(p){return `<div class="v094-town-pills"><span class="v094-town-pill"><strong>${esc(p?.username||'Traveler')}</strong><em>${esc(p?.className||'Wanderer')}</em></span><span class="v094-town-pill"><strong>${Number(p?.hp||0)}/${Number(p?.maxHp||0)} HP</strong><em>Health</em></span><span class="v094-town-pill"><strong>${money(p?.gold)}</strong><em>Gold</em></span><span class="v094-town-pill"><strong>${Number(p?.inventory?.roadToken||0)}/3</strong><em>Road Tokens</em></span></div>`;}
  function tutorial(p){const tokens=Number(p?.inventory?.roadToken||0);if(!p?.flags?.talkedToMara)return{view:'people',title:'Start in Town Square',text:'Talk to Mara first. She gives the Old Road a reason to matter.',cta:'Go to Town Square'};if(!p.flags.firstRoadEvent)return{view:'inn',title:'Prepare before travel',text:'Rest if needed, check supplies, then head to the gate.',cta:'Prepare at the Inn'};if(tokens<3)return{view:'road',title:'Bring back proof',text:`You have ${tokens}/3 Road Tokens. Survive the Old Road and return with more.`,cta:'Travel the Old Road'};return{view:'brenn',title:'Turn in your proof',text:'You have enough Road Tokens. Speak with Brenn in the ledger.',cta:'Speak with Brenn'};}
  function header(town,p){return `<div class="v094-town-top"><img class="v094-town-bg" src="${esc(bg())}" alt="" onerror="this.style.display='none'"><div class="v094-town-shade"></div><div class="v094-town-top-inner"><div class="v094-town-heading"><div class="v080-kicker">Ashmere • First Town</div><h3>${esc(town.name)}</h3><p>${esc(town.description)}</p></div>${statusPills(p)}</div></div>`;}
  function card(id,name,short,label='Open'){return `<button class="v080-town-card v094-town-card-clean" data-view="${esc(id)}"><span><strong>${esc(name)}</strong><small>${esc(short)}</small><em>${esc(label)}</em></span></button>`;}

  function renderTown(townId='ashmere'){
    const town=TOWNS()[townId]; if(!town)return;
    const p=player(), tip=tutorial(p);
    shell(`${header(town,p)}<div class="v094-town-objective"><div><span>Current Goal</span><strong>${esc(tip.title)}</strong><p>${esc(tip.text)}</p></div><button class="btn primary" data-view="${esc(tip.view)}">${esc(tip.cta)}</button></div><div class="v094-town-section"><h4>People & Story</h4><div class="v094-town-section-grid">${card('people','Town Square','Mara, Brenn, and Oric are nearby.','Talk')}${card('brenn','Ledger Hall','Turn in Road Tokens and proof from the road.','Story')}${card('archive','Archive Hall','Review memories and Ashmere records.','Records')}</div></div><div class="v094-town-section"><h4>Services & Supplies</h4><div class="v094-town-section-grid">${card('inn','Ashmere Inn','Rest and recover before the road.','Service')}${card('trader','Trading Post','Buy supplies and sell road goods.','Shop')}${card('smith','Blacksmith','Weapons and armor for road survival.','Gear')}</div></div><div class="v094-town-section"><h4>Travel & Character</h4><div class="v094-town-section-grid">${card('road','Town Gate','Leave for the Old Road when prepared.','Travel')}${card('sheet','Character Sheet','Review stats, gear, inventory, and quests.','Character')}</div></div>`);
    document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>route(b.dataset.view));
  }

  function route(view){
    if(view==='people')return renderPeople(); if(view==='mara')return renderNPC('mara'); if(view==='brenn')return renderNPC('brenn'); if(view==='oric')return renderNPC('oric');
    if(view==='inn')return renderInn(); if(view==='trader')return renderTrader(); if(view==='smith')return renderSmith(); if(view==='sheet')return renderSheet(); if(view==='archive')return renderArchive();
    if(view==='road')return startRoad(); return renderTown('ashmere');
  }

  function backActions(extra=''){return `<div class="actions">${extra}<button class="btn primary" id="backTown">Back to Ashmere</button></div>`;}
  function locationHead(kicker,title,text,imgPath=''){return `<div class="v096-location-head">${imgPath?`<img src="${esc(imgPath)}" alt="" onerror="this.style.display='none'">`:''}<div><div class="v080-kicker">${esc(kicker)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></div>`;}
  function panel(titleHTML,bodyHTML,extra=''){shell(`<div class="v096-town-screen">${titleHTML}${bodyHTML}${backActions(extra)}</div>`);const b=document.getElementById('backTown');if(b)b.onclick=()=>renderTown('ashmere');}

  function renderPeople(){panel(locationHead('Town Square','People of Ashmere','Talk to the people who know why the Old Road matters.'),`<div class="v096-people-grid"><button class="v096-person-card" data-view="mara"><strong>Mara Vell</strong><span>Archive keeper. Start here.</span></button><button class="v096-person-card" data-view="brenn"><strong>Old Brenn</strong><span>Ledger keeper. Road proof and rewards.</span></button><button class="v096-person-card" data-view="oric"><strong>Captain Oric</strong><span>Gate guard. Road and combat advice.</span></button></div>`);document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>route(b.dataset.view));}

  function renderNPC(id){
    const p=player(); if(!p)return renderTown('ashmere');
    const map={
      mara:{name:'Mara Vell',role:'Archive Keeper',art:npcArt('mara'),text:'Mara keeps Ashmere\'s records in careful stacks, as if the town might fall apart without her hands holding it together.',lines:['The bell rang once when you arrived. That should not be possible.','If the road truly woke for you, Old Road may still hide proof of what changed.','Bring back Road Tokens. Bring back anything the road should not have remembered.']},
      brenn:{name:'Old Brenn',role:'Ledger Keeper',art:npcArt('brenn'),text:'Brenn keeps ink, coin, and consequences in the same room. Nothing counts in Ashmere until it is written down.',lines:['Road Tokens matter. Bell Fragments matter more.','The road forgets. I do not.','If you have three Road Tokens, I can record your first proof.']},
      oric:{name:'Captain Oric',role:'Gate Captain',art:npcArt('oric'),text:'Oric watches the gate like the road owes him blood.',lines:['Out there, hesitation gets people buried.','Guard when the hit looks heavy. Fall back before pride gets you killed.','Preparation is not cowardice. It is why veterans get old.']}
    };
    const n=map[id]||map.mara; p.flags=p.flags||{}; p.npcTalk=p.npcTalk||{}; p.npcTalk[id]=Number(p.npcTalk[id]||0)+1; if(id==='mara'){p.flags.talkedToMara=true;p.flags.bellQuestStarted=true;} save(p);
    let extra='';
    if(id==='brenn'&&Number(p.inventory?.roadToken||0)>=3)extra=`<button class="btn" id="turnTokens">Turn in 3 Road Tokens</button>`;
    panel(locationHead(n.role,n.name,n.text,n.art),`<div class="v096-dialogue-lines">${n.lines.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`,extra);
    const turn=document.getElementById('turnTokens');if(turn)turn.onclick=()=>{const pl=player();pl.inventory.roadToken-=3;pl.flags.firstRoadComplete=true;pl.gold=Number(pl.gold||0)+260;pl.inventory.camp=Number(pl.inventory.camp||0)+2;save(pl);renderNPC('brenn');};
  }

  function renderInn(){const p=player();panel(locationHead('Service','Ashmere Inn','A warm room, a locked door, and one night away from the mud.',shopArt('inn')),`<div class="v096-shop-grid"><button class="v096-shop-card" id="rest"><strong>Rest</strong><span>Restore HP.</span><em>35g</em></button><button class="v096-shop-card" id="camp"><strong>Camp Supplies</strong><span>Useful for future road systems.</span><em>90g</em></button></div><div id="townNote" class="v080-town-note" style="display:none"></div>`);document.getElementById('rest').onclick=()=>buyService(35,pl=>{pl.hp=pl.maxHp;},'You rest at the inn.');document.getElementById('camp').onclick=()=>buyService(90,pl=>{pl.inventory.camp=Number(pl.inventory.camp||0)+1;},'Bought camp supplies.');}
  function buyService(cost,fn,msg){const p=player(),note=document.getElementById('townNote');if(Number(p.gold||0)<cost){note.style.display='block';note.textContent='Not enough gold.';return;}p.gold-=cost;fn(p);save(p);note.style.display='block';note.textContent=msg;}

  function renderTrader(){const p=player();const goods=[['food','Rations',60],['potion','Healing Potion',120],['camp','Camp Supplies',90]];panel(locationHead('Shop','Trading Post','Supplies, patched crates, and scales nobody fully trusts.',shopArt('trader')),`<div class="v096-shop-grid">${goods.map(([k,n,c])=>`<button class="v096-shop-card" data-buy="${k}" data-cost="${c}"><strong>${n}</strong><span>You own ${Number(p.inventory?.[k]||0)}.</span><em>${c}g</em></button>`).join('')}</div><div id="townNote" class="v080-town-note" style="display:none"></div>`);document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy,Number(b.dataset.cost)));}
  function buyItem(k,cost){const p=player(),note=document.getElementById('townNote');if(Number(p.gold||0)<cost){note.style.display='block';note.textContent='Not enough gold.';return;}p.gold-=cost;p.inventory[k]=Number(p.inventory[k]||0)+1;save(p);note.style.display='block';note.textContent=`Bought ${itemName(k)}.`;}

  function renderSmith(){const p=player();const weapons=(DATA().weapons||[]).filter(w=>w.id!=='hand').slice(0,4);const armors=(DATA().armors||[]).filter(a=>a.id!=='none').slice(0,4);panel(locationHead('Gear','Blacksmith','Blades, chain, leather, and practical warnings.',shopArt('smith')),`<h4>Weapons</h4><div class="v096-shop-grid">${weapons.map(w=>gearCard(w,'weapon')).join('')}</div><h4>Armor</h4><div class="v096-shop-grid">${armors.map(a=>gearCard(a,'armor')).join('')}</div><div id="townNote" class="v080-town-note" style="display:none"></div>`);document.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>buyGear(b.dataset.gear,b.dataset.kind,Number(b.dataset.cost)));}
  function gearCard(x,kind){return `<button class="v096-shop-card" data-gear="${esc(x.id)}" data-kind="${kind}" data-cost="${Number(x.cost||0)}"><strong>${esc(x.name)}</strong><span>${kind==='weapon'?`Damage ${x.min}-${x.max}`:`Defense ${x.defense}`}</span><em>${money(x.cost)}</em></button>`;}
  function buyGear(id,kind,cost){const p=player(),note=document.getElementById('townNote');if(Number(p.gold||0)<cost){note.style.display='block';note.textContent='Not enough gold.';return;}p.gold-=cost;if(kind==='weapon'){p.weapon=id;p.ownedWeapons=p.ownedWeapons||{};p.ownedWeapons[id]=1;}else{p.armor=id;p.ownedArmor=p.ownedArmor||{};p.ownedArmor[id]=1;}save(p);note.style.display='block';note.textContent='Equipped new '+kind+'.';}

  function renderSheet(){const p=player();const inv=Object.entries(p.inventory||{}).filter(([,v])=>Number(v)>0).map(([k,v])=>`<span><strong>${esc(itemName(k))}</strong><em>x${Number(v)}</em></span>`).join('')||'<p>No notable items.</p>';panel(locationHead('Character',p.username,`${p.personalityLabel||'Traveler'} • ${p.origin} • ${p.className}`),`<div class="v096-sheet-grid"><span><strong>HP</strong><em>${p.hp}/${p.maxHp}</em></span><span><strong>Gold</strong><em>${money(p.gold)}</em></span><span><strong>Weapon</strong><em>${esc(p.weapon)}</em></span><span><strong>Armor</strong><em>${esc(p.armor)}</em></span></div><h4>Inventory</h4><div class="v096-inventory-list">${inv}</div>`);}
  function renderArchive(){const p=player();panel(locationHead('Records','Archive Hall','Mara keeps records, maps, and town memory.'),`<div class="v096-dialogue-lines">${(p.memories||[]).map(m=>`<p>${esc(m)}</p>`).join('')}</div>`);}
  function startRoad(){if(window.LegendRoadControllerV087?.start)return window.LegendRoadControllerV087.start();panel(locationHead('Town Gate','Old Road','The road controller did not load.'),'<p>Try a hard refresh.</p>');}

  function maybeReplaceAshmere(){const title=[...document.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Ashmere Menu');if(!title||document.getElementById(ROOT_ID))return;const panel=title.closest('.panel');if(!panel)return;panel.style.display='none';renderTown('ashmere');}
  window.LegendTownControllerV080={renderTown,renderPeople,renderNPC,renderInn,renderTrader,renderSmith,renderSheet,renderArchive};
  const rt=RT(); if(rt?.onRender)rt.onRender(maybeReplaceAshmere); else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',maybeReplaceAshmere); else maybeReplaceAshmere();
})();