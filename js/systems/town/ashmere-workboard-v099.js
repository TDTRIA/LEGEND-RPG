/* LEGEND Ashmere work board and job activity.
 * Keeps existing job definitions and reward behavior while isolating the work
 * loop from the general town router. Runtime dependencies are injected.
 */
(() => {
  function render(context) {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.screen !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const { screen, head, locationInterior, esc, gold, itemName, jobCatalog } = context;
  function jobsForCurrentRegion(){
    return jobCatalog?.forRegion?.(p()?.currentRegion) || {};
  }
  function jobModeName(mode){
    return jobCatalog?.jobModeName?.(mode) || 'Field task';
  }

  function renderWorkBoard(){
    if (!jobCatalog?.forRegion || !jobCatalog?.jobModeName) {
      return screen(head('Local Work', 'Work Board Unavailable', 'The job catalog did not load.', locationInterior('archive'), 'work'),
        '<p>Local jobs are unavailable. Refresh before continuing.</p>');
    }
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen';
    const jobs=jobsForCurrentRegion();
    screen(head(greyfen?'Local Work':'Ashmere Jobs',greyfen?'Bellkeeper’s Hall':'Work Board',greyfen?'Take on lowland work with a mix of memory, judgment, clues, and careful handling.':'Every contract works a little differently: time a strike, decode a signal, solve a ledger clue, remember a work sequence, or choose the right approach.',locationInterior('archive'),'work'),`<div class="ash099-job-board"><div class="ash099-job-board-intro"><span>FIELD CONTRACTS</span><strong>${Object.keys(jobs).length} ways to earn your keep</strong><small>Clean work pays better. Thoughtful choices can earn supplies as well as coin.</small></div><div class="ash099-cards">${Object.entries(jobs).map(([id,j])=>`<button class="ash099-btn ash099-card ash099-job-board-card" data-job-open="${id}"><span class="ash099-job-board-mode">${esc(jobModeName(j.mode))}</span><strong>${j.title}</strong><small>${j.desc}</small><em>${j.pay}g base pay</em></button>`).join('')}</div></div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-job-open]').forEach(b=>b.onclick=()=>renderJobActivity(b.dataset.jobOpen));
  }
  function renderJobActivity(id){
    const greyfen=String(p()?.currentRegion||'Ashmere')==='Greyfen';
    const jobs=jobsForCurrentRegion();
    const j=jobs[id]||Object.values(jobs)[0];
    const mode=j.mode||'timing';
    const zoneStart=34+Math.floor(Math.random()*16);
    const zoneWidth=18;
    const choices=['signal','ledger','triage','route'].includes(mode);
    const sequence=Array.isArray(j.sequence)?j.sequence.slice():[];
    let challengeMarkup='';
    if(mode==='timing'){
      challengeMarkup='<section class="ash099-job-challenge ash099-job-timing"><span class="ash099-job-overline">TIMING TEST</span><p>'+esc(j.hint||'Strike when the marker reaches the gold band.')+'</p><div class="ash099-job-track" id="jobTrack"><i class="ash099-job-zone" style="left:'+zoneStart+'%;width:'+zoneWidth+'%"></i><b class="ash099-job-marker" id="jobMarker"></b></div><small>Gold band = clean work · Outside the band = lost time or stock</small></section>';
    }else if(choices){
      challengeMarkup='<section class="ash099-job-challenge ash099-job-choice-challenge"><div class="ash099-job-challenge-heading"><span class="ash099-job-overline">'+esc(jobModeName(mode))+'</span><h2>'+esc(j.prompt||j.desc)+'</h2><p>Read the details, then commit to the response you think is right.</p></div><div class="ash099-job-choice-grid">'+(j.choices||[]).map((choice,i)=>'<button type="button" class="ash099-job-choice" data-job-choice="'+i+'" data-grade="'+esc(choice.grade||'Messy')+'" data-feedback="'+esc(choice.feedback||'You commit to your choice.')+'"><span class="ash099-job-choice-index">'+String(i+1).padStart(2,'0')+'</span><span class="ash099-job-choice-copy"><strong>'+esc(choice.label)+'</strong>'+(choice.detail?'<small>'+esc(choice.detail)+'</small>':'')+'</span><span class="ash099-job-choice-arrow">↗</span></button>').join('')+'</div></section>';
    }else if(mode==='sequence'){
      challengeMarkup='<section class="ash099-job-challenge ash099-job-sequence"><div class="ash099-job-challenge-heading"><span class="ash099-job-overline">MEMORY SEQUENCE</span><h2>Study the order, then repeat it</h2><p>The steps will flash once. Remember the order and choose each action in sequence.</p></div><div class="ash099-sequence-preview" id="jobSequencePreview" aria-live="polite">Ready when you are</div><button class="ash099-btn primary ash099-sequence-start" id="jobStartSequence" type="button">Study the sequence</button><div class="ash099-sequence-actions">'+(j.actions||[]).map((action,i)=>'<button type="button" class="ash099-sequence-action" data-job-sequence="'+esc(action)+'" disabled><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(action)+'</strong></button>').join('')+'</div><p class="ash099-sequence-status" id="jobSequenceStatus">Choose Study the sequence to begin.</p></section>';
    }
    const body='<section class="ash099-job-game ash099-job-mode-'+esc(mode)+'" data-job-mode="'+esc(mode)+'">'+
      '<div class="ash099-job-meta"><span>Skill: '+esc(j.skill.toUpperCase())+'</span><span>Base Pay: '+gold(j.pay)+'</span><span>Bonus: '+esc(itemName(j.item))+' ×'+Number(j.amount||1)+'</span></div>'+
      challengeMarkup+
      (mode==='timing'?'<button class="ash099-btn primary ash099-job-submit" id="jobStrike" type="button">'+esc(j.verb||'Commit')+'</button>':'')+
      '<p class="ash099-note" id="jobResult" style="display:none" aria-live="polite"></p>'+
      (mode==='timing'?'<p class="ash099-note">Keyboard: press Space or Enter to commit the action.</p>':'')+
      '</section>';
    screen(head(greyfen?'Local Work':'Work Board',j.title,j.desc,locationInterior('archive'),'work'),body,'<button class="ash099-btn" id="backJobs">Choose Another Job</button>');
    const marker=document.getElementById('jobMarker');
    const strike=document.getElementById('jobStrike');
    const result=document.getElementById('jobResult');
    let pos=0,dir=1,done=false,timer=null;
    let sequenceIndex=0,sequenceErrors=0,sequenceReady=false;
    const sequenceTimers=[];
    function cleanup(){
      if(timer)clearInterval(timer);
      sequenceTimers.forEach(t=>clearTimeout(t));
      document.removeEventListener('keydown',onKey);
    }
    if(mode==='timing'){
      timer=setInterval(()=>{if(done)return;pos+=dir*2.35;if(pos>=100){pos=100;dir=-1;}if(pos<=0){pos=0;dir=1;}if(marker)marker.style.left=pos+'%';},24);
    }
    function finish(gradeOverride,feedback){
      if(done)return;
      done=true;
      cleanup();
      const center=zoneStart+(zoneWidth/2);
      const dist=Math.abs(pos-center);
      const grade=gradeOverride||(dist<=4?'Perfect':dist<=9?'Good':dist<=17?'Messy':'Miss');
      const mult=grade==='Perfect'?1.45:grade==='Good'?1.12:grade==='Messy'?.72:.38;
      const pay=Math.max(5,Math.round(j.pay*mult));
      const bonusChance=grade==='Perfect'?.95:grade==='Good'?.62:grade==='Messy'?.24:.05;
      const player=p();
      player.flags=player.flags||{};player.inventory=player.inventory||{};player.stats=player.stats||{};
      const progress=context.awardProgress?.(player,grade==='Perfect'?28:grade==='Good'?20:grade==='Messy'?14:10);
      player.flags.ashmereJobs=Number(player.flags.ashmereJobs||0)+1;
      player.flags.ashmereFavor=Number(player.flags.ashmereFavor||0)+(grade==='Perfect'?2:1);
      player.gold=Number(player.gold||0)+pay;
      let bonus='';
      if(Math.random()<bonusChance){player.inventory[j.item]=Number(player.inventory[j.item]||0)+Number(j.amount||1);bonus=' Bonus gained: '+Number(j.amount||1)+' '+itemName(j.item)+'.';}
      if(grade==='Miss'&&Number(player.hp||0)>1){player.hp=Math.max(1,Number(player.hp||0)-1);bonus+=' You lose 1 HP from the rough work.';}
      save(player);
      const xpNote=progress?' XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'.':'';
      if(result){result.style.display='block';result.textContent=grade+'! '+(feedback?feedback+' ':'')+'Earned '+pay+'g.'+bonus+' Local standing increased.'+xpNote;}
      if(strike){strike.disabled=true;strike.textContent='Job Complete';}
      document.querySelectorAll('[data-job-choice],[data-job-sequence],#jobStartSequence').forEach(b=>b.disabled=true);
      // Keep the reward summary visible until the player chooses to leave the activity.
      // An auto-refresh here can erase the result before it is read or asserted by a smoke test.
    }
    if(strike)strike.onclick=()=>finish();
    if(choices){
      document.querySelectorAll('[data-job-choice]').forEach(b=>b.onclick=()=>finish(b.dataset.grade,b.dataset.feedback));
    }
    if(mode==='sequence'){
      const start=document.getElementById('jobStartSequence');
      const preview=document.getElementById('jobSequencePreview');
      const status=document.getElementById('jobSequenceStatus');
      start?.addEventListener('click',()=>{
        if(done)return;
        start.disabled=true;
        let revealIndex=0;
        const reveal=()=>{
          if(done)return;
          if(revealIndex>=sequence.length){
            sequenceReady=true;
            if(preview)preview.textContent='Your turn · repeat all '+sequence.length+' steps';
            if(status)status.textContent='Repeat the sequence from memory.';
            document.querySelectorAll('[data-job-sequence]').forEach(b=>b.disabled=false);
            return;
          }
          if(preview)preview.innerHTML='<span>STEP '+(revealIndex+1)+' / '+sequence.length+'</span><strong>'+esc(sequence[revealIndex])+'</strong>';
          revealIndex++;
          sequenceTimers.push(setTimeout(reveal,670));
        };
        reveal();
      });
      document.querySelectorAll('[data-job-sequence]').forEach(b=>b.addEventListener('click',()=>{
        if(done||!sequenceReady)return;
        if(b.dataset.jobSequence===sequence[sequenceIndex]){
          sequenceIndex++;
          if(status)status.textContent='Correct · '+sequenceIndex+' of '+sequence.length+' steps';
          if(sequenceIndex>=sequence.length)finish(sequenceErrors===0?'Perfect':sequenceErrors===1?'Good':'Messy','You repeated the full handling sequence.');
        }else{
          sequenceErrors++;
          if(status)status.textContent='Out of order. Take a breath and continue from the same step.';
          if(sequenceErrors>=2)finish('Messy','You finish the work, but the sequence costs you time.');
        }
      }));
    }
    const onKey=e=>{if(mode!=='timing'||(e.key!==' '&&e.key!=='Enter'))return;e.preventDefault();document.removeEventListener('keydown',onKey);finish();};
    if(mode==='timing')document.addEventListener('keydown',onKey);
    const backJobs=document.getElementById('backJobs');
    if(backJobs)backJobs.onclick=()=>{done=true;cleanup();renderWorkBoard();};
  }

    renderWorkBoard();
  }

  window.LegendAshmereWorkV099 = Object.freeze({ render });
})();
