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
    const body='<section class="ash099-contract-ledger"><div class="ash099-contract-intro"><span class="ash099-job-overline">LOCAL STORIES · FIELD CONTRACTS</span><h2>Work that takes you beyond the board</h2><p>These one-time requests progress while you explore and fight. Accept a posting before doing the work; completed objectives can be turned in here.</p></div><div class="ash099-contract-list">'+cards+'</div>'+(message?'<p class="ash099-note" role="status">'+esc(message)+'</p>':'')+'</section>';
    screen(head('Journal & Notices','Side Stories & Road Contracts','Four local requests add reasons to investigate the road, win a dangerous encounter, investigate a shifted marker, and bring a complete expedition home.',locationInterior('archive'),'quest'),body);
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
