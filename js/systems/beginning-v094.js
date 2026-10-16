// LEGEND v0.9.x - Beginning, traveler identity, and guided intro layer
(()=>{
  const ROOT=()=>document.getElementById('root');
  const D=()=>window.LEGEND_DATA||{};
  const S=()=>window.LegendStorage||{};
  const state={name:'',gender:null,personality:null,origin:null,className:null,keepsake:null};
  const creationOptions=window.LegendPlayerCreationOptionsV094;
  const genderOptions=creationOptions?.genderOptions||[];
  const personalityOptions=creationOptions?.personalityOptions||[];
  function gender(id){return creationOptions?.gender?.(id)||genderOptions[3];}
  function personality(id){return creationOptions?.personality?.(id)||personalityOptions[0];}
  function startCreation(){
    if(!genderOptions.length||!personalityOptions.length)return creationViewUnavailable();
    state.name='';state.gender=null;state.personality=null;state.origin=null;state.className=null;state.keepsake=null;renderName();
  }
  function creationViewUnavailable(){
    const root=ROOT();
    if(root)root.innerHTML='<main class="v094-beginning"><div class="v094-beginning-shell"><section class="v094-beginning-card"><h1>Traveler creation is unavailable</h1><p>A traveler-creation module did not load. Refresh before continuing.</p><button class="v094-btn primary" id="v094ViewBack" type="button">Back to Title</button></section></div></main>';
    root?.querySelector('#v094ViewBack')?.addEventListener('click',()=>window.LegendGameBootstrap?.title?.());
  }
  function renderName(){
    const view=window.LegendPlayerCreationViewV094;
    if(typeof view?.renderName!=='function')return creationViewUnavailable();
    view.renderName({
      root:ROOT(),
      name:state.name,
      onBack:()=>window.LegendGameBootstrap?.title?.(),
      onSubmit:(input,error)=>{
        const n=String(input?.value||'').trim();
        if(!n||/\s/.test(n)){
          if(error){
            error.textContent=!n?'Please enter a traveler name.':'Use a name without spaces.';
            error.style.display='block';
          }
          input?.setAttribute('aria-invalid','true');
          input?.focus();
          return;
        }
        state.name=n;
        renderGender();
      }
    });
  }
  function renderChoiceStep(options){
    const view=window.LegendPlayerCreationViewV094;
    if(typeof view?.renderChoiceStep!=='function')return creationViewUnavailable();
    const {step,kicker,title,description,items,key,next,back,rerender,nextLabel,progress,scene}=options;
    const stateKey=key==='class'?'className':key;
    view.renderChoiceStep({
      root:ROOT(),
      step,kicker,title,description,items,key,
      selected:state[stateKey],
      classPortraits:window.LegendAssetsV090?.classes||{},
      nextLabel,progress,scene,
      onSelect:value=>{state[stateKey]=value;rerender();},
      onBack:back,
      onNext:next
    });
  }
  function renderCreationStep(id,flow){
    const catalog=window.LegendPlayerCreationStepsV094;
    if(typeof catalog?.get!=='function')return creationViewUnavailable();
    const definition=catalog.get(id,{data:D(),genderOptions,personalityOptions});
    if(!definition)return creationViewUnavailable();
    renderChoiceStep({...definition,...flow});
  }
  function renderGender(){renderCreationStep('gender',{next:renderPersonality,back:renderName,rerender:renderGender});}
  function renderPersonality(){renderCreationStep('personality',{next:renderOrigin,back:renderGender,rerender:renderPersonality});}
  function renderOrigin(){renderCreationStep('origin',{next:renderClass,back:renderPersonality,rerender:renderOrigin});}
  function renderClass(){renderCreationStep('class',{next:renderKeepsake,back:renderOrigin,rerender:renderClass});}
  function renderKeepsake(){renderCreationStep('keepsake',{next:renderConfirm,back:renderClass,rerender:renderKeepsake});}




  function renderConfirm(){
    const view=window.LegendPlayerCreationViewV094;
    if(typeof view?.renderConfirmation!=='function')return creationViewUnavailable();
    view.renderConfirmation({
      root:ROOT(),
      name:state.name,
      gender:gender(state.gender),
      personality:personality(state.personality),
      origin:state.origin,
      className:state.className,
      keepsake:state.keepsake,
      onBack:renderKeepsake,
      onBegin:createTraveler
    });
  }
  function showCreationError(message){
    let error=document.getElementById('v094CreationError');
    if(!error){
      error=document.createElement('p');
      error.id='v094CreationError';
      error.setAttribute('role','alert');
      error.className='v094-choice-error';
      const actions=document.querySelector('.v094-beginning-card .v094-actions');
      if(actions?.parentNode)actions.parentNode.insertBefore(error,actions);
      else return;
    }
    error.textContent=message;
    error.hidden=false;
  }
  function createTraveler(){
    const recordBuilder=window.LegendPlayerRecordV094;
    if(typeof recordBuilder?.create!=='function'){
      showCreationError('Traveler records are unavailable. Refresh before beginning your journey.');
      return;
    }
    const pl=recordBuilder.create({
      data:D(),
      name:state.name,
      gender:gender(state.gender),
      personality:personality(state.personality),
      originId:state.origin,
      classId:state.className,
      keepsakeId:state.keepsake,
      baseSkills:S().baseSkills,
      normalize:S().normalize
    });
    if(!pl){
      showCreationError('Your traveler details are incomplete. Go back and review each choice before continuing.');
      return;
    }
    S().savePlayer?.(pl);
    renderIntro(pl);
  }
  function enterAshmere(pl){const fresh=S().loadPlayer?.()||pl;fresh.flags=fresh.flags||{};fresh.flags.introV094Complete=true;fresh.flags.tutorialStep='people';fresh.town='Ashmere';S().savePlayer?.(fresh);if(window.LegendAshmereV099?.renderAshmere)return window.LegendAshmereV099.renderAshmere();if(window.LegendRuntimeV120?.returnToAshmere)return window.LegendRuntimeV120.returnToAshmere();window.LegendGameBootstrap?.continueGame?.();}
  function renderIntro(pl){
    const view=window.LegendPlayerCreationViewV094;
    if(typeof view?.renderIntro!=='function')return creationViewUnavailable();
    view.renderIntro({root:ROOT(),onEnter:()=>enterAshmere(pl)});
  }
  window.LegendBeginningV094={startCreation,renderIntro};
})();