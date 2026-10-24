/* LEGEND Ashmere side contracts and Greyfen crossing.
 * Keeps current contract counters, journal flags, reward rules, evidence text, and
 * retry costs unchanged. Player state, navigation, and progression are injected.
 */
(() => {
  function render(context, view, argument) {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.screen !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const {
      escapeHtml: esc, itemName, head, screen, locationInterior,
      renderTown: renderAshmere, awardProgress
    } = context;

  const sideContracts=[
    {id:'watchlightSurvey',title:'The Watchlight Survey',giver:'Captain Oric',description:'The watch captain needs fresh proof of what lies beyond the lantern line. Find one roadside point of interest after accepting this contract.',objective:'Investigate one new roadside discovery on the Old Road.',counter:'poi',gold:55,xp:25,item:'food',amount:1,completeText:'Oric studies your notes and marks a safer stretch of the lantern line.'},
    {id:'blackrootProof',title:'Proof from the Blackroot Road',giver:'Old Brenn',description:'Brenn will pay for proof that you can handle the dangers beyond Ashmere. Win a road battle after taking the posting.',objective:'Win one road battle after accepting this contract.',counter:'battle',gold:75,xp:35,item:'clothScrap',amount:1,completeText:'Brenn accepts your proof without asking how close the fight came.'},
    {id:'maraSafeReturn',title:'Mara’s Missing Road Ledger',giver:'Mara Vell',description:'Mara needs a complete field report, not another half-told rumor. Secure a five-stage expedition and return after accepting the posting.',objective:'Complete and secure one five-stage Old Road expedition.',counter:'return',gold:95,xp:50,item:'oil',amount:1,completeText:'Mara copies your route notes into the town archive and rewards the complete report.'},
    {id:'movedCairn',title:'The Moved Cairn',giver:'Captain Oric',description:'Oric suspects the Ridgeway Cairn no longer points where it was meant to. Take the High Ridge, inspect the stone, then choose whether to restore it, record both alignments, or mark the hazard.',objective:'Investigate the Ridgeway Cairn and file a report on its shifted stone.',counter:'movedCairn',gold:70,xp:40,item:'roadHerb',amount:1,completeText:'Oric files your report as a real warning instead of another rumor.'}
  ];
  const dailyContracts=[
    {id:'survey',title:'Map the Lantern Line',description:'Inspect one roadside point of interest and record what the lantern light reveals.',counter:'poi',goal:1,gold:30,xp:20,keys:1},
    {id:'hold',title:'Hold the Blackroot Line',description:'Win a road battle. Watch the enemy intent and bring your proof back alive.',counter:'battle',goal:1,gold:35,xp:25,keys:1},
    {id:'return',title:'Bring Proof Home',description:'Complete an Old Road outing and return to Ashmere with the field report.',counter:'return',goal:1,gold:45,xp:30,keys:1}
  ];
  function localDayKey(){
    const d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function ensureDailyState(player){
    player.flags=player.flags||{};
    const today=localDayKey();
    let state=player.flags.dailyContractsV151;
    if(!state||state.dayKey!==today){
      state={
        dayKey:today,
        baseline:{
          poi:sideContractCounter(player,'poi'),
          battle:sideContractCounter(player,'battle'),
          return:sideContractCounter(player,'return')
        },
        claimed:[]
      };
      player.flags.dailyContractsV151=state;
    }
    state.baseline=state.baseline||{};
    state.claimed=Array.isArray(state.claimed)?state.claimed:[];
    return state;
  }
  function dailyProgress(player,state,quest){
    const baseline=Number(state.baseline?.[quest.counter]||0);
    return Math.max(0,Math.min(quest.goal,sideContractCounter(player,quest.counter)-baseline));
  }
  function sideContractCounter(pl,key){
    const stats=pl?.stats||{};
    if(key==='poi')return Number(stats.pointsOfInterest||0);
    if(key==='battle')return Number(stats.roadVictories||0);
    if(key==='return')return Number(stats.oldRoadClears||0);
    if(key==='movedCairn')return pl?.flags?.sideContracts?.movedCairn?.decision?1:0;
    return 0;
  }
  function renderSideContracts(message=''){
    const pl=p();if(!pl)return;
    pl.flags=pl.flags||{};
    const saved=pl.flags.sideContracts||{};
    const cards=sideContracts.map(q=>{
      const state=saved[q.id];
      let status='AVAILABLE',action='<button type="button" class="ash099-btn primary" data-contract-accept="'+q.id+'">Accept Contract</button>',progress='Not started';
      if(state?.complete){
        status='COMPLETED';action='<span class="ash099-contract-complete">✓ Recorded in Journal</span>';progress='Reward claimed';
      }else if(state){
        const now=sideContractCounter(pl,q.counter),ready=now>Number(state.startedAt||0);
        progress=ready?'Objective fulfilled · ready to report':'In progress · 0 / 1';
        if(ready){status='READY TO REPORT';action='<button type="button" class="ash099-btn primary" data-contract-turnin="'+q.id+'">Report Completion</button>';}
        else{status='IN PROGRESS';action='<span class="ash099-contract-pending">Return when the objective is complete</span>';}
      }
      return '<article class="ash099-contract-card ash099-contract-'+status.toLowerCase().replaceAll(' ','-')+'"><header><span>'+esc(status)+'</span><small>POSTED BY '+esc(q.giver.toUpperCase())+'</small></header><h2>'+esc(q.title)+'</h2><p>'+esc(q.description)+'</p><div class="ash099-contract-objective"><span>OBJECTIVE</span><strong>'+esc(q.objective)+'</strong><small>'+esc(progress)+'</small></div><footer><div><span>REWARD</span><strong>'+q.gold+'g · '+q.xp+' XP</strong><small>Bonus: '+esc(itemName(q.item))+' ×'+q.amount+'</small></div>'+action+'</footer></article>';
    }).join('');
    const daily=ensureDailyState(pl);
    save(pl);
    const dailyCards=dailyContracts.map(q=>{
      const progress=dailyProgress(pl,daily,q),claimed=daily.claimed.includes(q.id),ready=progress>=q.goal&&!claimed;
      const status=claimed?'CLAIMED':ready?'READY TO CLAIM':'IN PROGRESS';
      const progressLabel=claimed?'Completed for today':progress+' / '+q.goal+' objective complete';
      const progressWidth=Math.round(progress/q.goal*100);
      const action=claimed?'<button type="button" class="ash099-btn" disabled>Claimed today</button>':ready?'<button type="button" class="ash099-btn primary" data-daily-claim="'+q.id+'">Claim reward</button>':'<button type="button" class="ash099-btn" disabled>Continue adventuring</button>';
      return '<article class="ash099-daily-card '+(ready?'is-ready ':'')+(claimed?'is-claimed':'')+'"><div class="ash099-daily-card-head"><img src="assets/generated/ui/icons/service-job-board.webp" alt="" loading="lazy" decoding="async"><div><span>DAILY FIELD CONTRACT · '+esc(status)+'</span><h3>'+esc(q.title)+'</h3></div></div><p>'+esc(q.description)+'</p><div class="ash099-daily-progress-copy"><span>Progress</span><strong>'+esc(progressLabel)+'</strong></div><div class="ash099-daily-progress" aria-hidden="true"><i style="width:'+progressWidth+'%"></i></div><div class="ash099-daily-reward">Reward · '+q.gold+'g · '+q.xp+' XP · '+q.keys+' Road Cache Key</div>'+action+'</article>';
    }).join('');
    const keyCount=Math.max(0,Number(pl.inventory?.roadCacheKey||0));
    const dailyNotice=message?'<div class="ash099-daily-notice" role="status">'+esc(message)+'</div>':'';
    const cacheMarkup='<section class="ash099-road-cache" aria-label="Earnable Road Cache"><div class="ash099-road-cache-art"><img src="assets/generated/locations/roadside-camp.webp" alt="A quiet camp along the Old Road" loading="lazy" decoding="async"></div><div class="ash099-road-cache-copy"><span>FIELD REWARDS · NO PURCHASES</span><h2>Road Cache</h2><p>Spend a key earned from daily contracts to open a cache of supplies, coins, crafting materials, or a rare Road Token. Keys cannot be purchased.</p><div class="ash099-cache-key-count">Keys carried: '+keyCount+'</div><button type="button" class="ash099-btn primary" id="dailyCacheOpen" '+(keyCount>0?'':'disabled')+'>'+(keyCount>0?'Open Road Cache':'Earn a key from the daily board')+'</button></div></section><details class="ash099-cache-odds"><summary>Published cache odds · shown before opening</summary><ul><li><strong>40%</strong> — Field supplies: 2 Rations</li><li><strong>30%</strong> — Pouch of coin: 60–100 gold</li><li><strong>20%</strong> — Crafting materials: 2 matching field materials</li><li><strong>8%</strong> — Medic bundle: 2 Rations and 1 Healing Potion</li><li><strong>2%</strong> — Rare route cache: 1 Road Token and 100 gold</li></ul></details>';
    const dailyMarkup='<section class="ash099-daily-board" aria-label="Daily contracts"><div class="ash099-daily-intro"><span class="ash099-job-overline">DAILY FIELD BOARD · '+esc(daily.dayKey)+'</span><h2>Three reasons to take the road today</h2><p>These objectives reset by your local calendar day. Their progress is saved with your traveler. Complete them through normal play, then claim your gold, XP, and cache keys below.</p></div><div class="ash099-daily-grid">'+dailyCards+'</div>'+cacheMarkup+dailyNotice+'</section>';
    const body=dailyMarkup+'<section class="ash099-contract-ledger"><div class="ash099-contract-intro"><span class="ash099-job-overline">LOCAL STORIES · FIELD CONTRACTS</span><h2>Work that takes you beyond the board</h2><p>These one-time requests progress while you explore and fight. Accept a posting before doing the work; completed objectives can be turned in here.</p></div><div class="ash099-contract-list">'+cards+'</div></section>';
    screen(head('Journal & Notices','Daily Board & Road Contracts','Finish daily road objectives for gold, XP, and keys to transparent, earnable supply caches. Local stories remain below.',locationInterior('archive'),'quest'),body);
    document.querySelectorAll('[data-daily-claim]').forEach(b=>b.onclick=()=>{
      const q=dailyContracts.find(x=>x.id===b.dataset.dailyClaim);if(!q)return;
      const player=p();if(!player)return;
      const state=ensureDailyState(player);
      if(state.claimed.includes(q.id))return renderSideContracts('That daily reward has already been claimed today.');
      if(dailyProgress(player,state,q)<q.goal)return renderSideContracts('Finish the daily objective before claiming its reward.');
      state.claimed.push(q.id);
      player.gold=Number(player.gold||0)+q.gold;
      player.inventory=player.inventory||{};
      player.inventory.roadCacheKey=Number(player.inventory.roadCacheKey||0)+q.keys;
      player.stats=player.stats||{};
      player.stats.dailyContractsCompleted=Number(player.stats.dailyContractsCompleted||0)+1;
      player.memories=Array.isArray(player.memories)?player.memories:[];
      player.memories.push('Completed daily field contract: '+q.title+'.');
      const progress=context.awardProgress?.(player,q.xp);
      save(player);
      renderSideContracts('Daily contract complete: '+q.title+'. +'+q.gold+'g, '+q.xp+' XP, and '+q.keys+' Road Cache Key.'+(progress?.levels?' Level up! You are now level '+progress.level+'.':''));
    });
    document.getElementById('dailyCacheOpen')?.addEventListener('click',()=>{
      const player=p();if(!player)return;
      player.inventory=player.inventory||{};
      const keys=Math.max(0,Number(player.inventory.roadCacheKey||0));
      if(keys<1)return renderSideContracts('You need a Road Cache Key. Complete a daily contract to earn one.');
      player.inventory.roadCacheKey=keys-1;
      let resultText='';
      const roll=Math.random()*100;
      if(roll<40){
        player.inventory.food=Number(player.inventory.food||0)+2;
        resultText='Field supplies · 2 Rations';
      }else if(roll<70){
        const amount=60+Math.floor(Math.random()*41);
        player.gold=Number(player.gold||0)+amount;
        resultText='Pouch of coin · '+amount+'g';
      }else if(roll<90){
        const materials=['roadHerb','clothScrap','oil'];
        const material=materials[Math.floor(Math.random()*materials.length)];
        player.inventory[material]=Number(player.inventory[material]||0)+2;
        resultText='Crafting materials · 2 '+itemName(material);
      }else if(roll<98){
        player.inventory.food=Number(player.inventory.food||0)+2;
        player.inventory.potion=Number(player.inventory.potion||0)+1;
        resultText='Medic bundle · 2 Rations and 1 Healing Potion';
      }else{
        player.inventory.roadToken=Number(player.inventory.roadToken||0)+1;
        player.gold=Number(player.gold||0)+100;
        resultText='Rare route cache · 1 Road Token and 100g';
      }
      player.stats=player.stats||{};
      player.stats.dailyCachesOpened=Number(player.stats.dailyCachesOpened||0)+1;
      player.memories=Array.isArray(player.memories)?player.memories:[];
      player.memories.push('Opened a Road Cache: '+resultText+'.');
      save(player);
      renderSideContracts('Road Cache opened: '+resultText+'. The published odds remain unchanged; every key is earned through play.');
    });
    document.querySelectorAll('[data-contract-accept]').forEach(b=>b.onclick=()=>{
      const q=sideContracts.find(x=>x.id===b.dataset.contractAccept);if(!q)return;
      const player=p();if(!player)return;player.flags=player.flags||{};player.flags.sideContracts=player.flags.sideContracts||{};
      if(player.flags.sideContracts[q.id])return renderSideContracts('That posting is already in your journal.');
      player.flags.sideContracts[q.id]={startedAt:sideContractCounter(player,q.counter),complete:false};
      save(player);renderSideContracts('Accepted: '+q.title+'. '+q.objective);
    });
    document.querySelectorAll('[data-contract-turnin]').forEach(b=>b.onclick=()=>{
      const q=sideContracts.find(x=>x.id===b.dataset.contractTurnin);if(!q)return;
      const player=p();if(!player)return;player.flags=player.flags||{};player.flags.sideContracts=player.flags.sideContracts||{};
      const state=player.flags.sideContracts[q.id];
      if(!state||state.complete||sideContractCounter(player,q.counter)<=Number(state.startedAt||0))return renderSideContracts('The objective is not ready to turn in yet.');
      state.complete=true;player.gold=Number(player.gold||0)+q.gold;player.inventory=player.inventory||{};player.inventory[q.item]=Number(player.inventory[q.item]||0)+q.amount;
      player.flags.ashmereFavor=Number(player.flags.ashmereFavor||0)+2;player.stats=player.stats||{};player.stats.sideContractsCompleted=Number(player.stats.sideContractsCompleted||0)+1;
      player.memories=Array.isArray(player.memories)?player.memories:[];
      player.memories.push('Completed side contract: '+q.title+'.');
      let completeText=q.completeText;
      if(q.id==='movedCairn'){
        player.flags.highRidgeCairnOutcome=state.decision||'record';
        completeText=state.decision==='restore'
          ?'Oric records the repair and sends a warning to the road crew: the shifted stone must be checked before carts use the lower track.'
          :state.decision==='warn'
            ?'Oric accepts the warning and logs the hazard. The stone stays in place until a proper survey can be arranged.'
            :'Oric files both alignments in the route ledger. He will not let a clean-looking marker erase the evidence that it was moved.';
      }
      const progress=context.awardProgress?.(player,q.xp);
      save(player);
      renderSideContracts('Contract complete. '+completeText+' +'+q.gold+'g, '+q.xp+' XP, and '+q.amount+' '+itemName(q.item)+'.'+(progress?.levels?' Level up! You are now level '+progress.level+'.':''));
    });
  }
    if (view === 'contracts') return renderSideContracts(argument || '');
  }

  window.LegendAshmereContractsV099 = Object.freeze({ render });
})();
