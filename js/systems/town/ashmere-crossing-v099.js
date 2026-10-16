/* LEGEND Greyfen Dry Crossing mini-contract.
 * Owns route choices, retry handling, health tolls, marker rewards, and completion.
 * Player state, save, town navigation, and screen helpers are injected by the town facade.
 */
(() => {
  function render(context = {}) {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.screen !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const esc = context.escapeHtml;
    const head = context.head;
    const screen = context.screen;
    const locationInterior = context.locationInterior;
    const renderAshmere = context.renderTown;

function renderDryCrossing(){
    const pl=p(); if(!pl)return;
    if(String(pl.currentRegion||'Ashmere')!=='Greyfen')return renderAshmere();
    const completed=Boolean(pl.flags?.greyfenDryCrossingComplete);
    const description="The Landing Warden needs a route marker that washed loose from the raised path. The marker will help travelers avoid a newly opened sink in the marsh.";
    if(completed){
      return screen(head('Greyfen Contract','A Dry Crossing','The marker has been recovered and entered in the Boundary Archive.',locationInterior('archive'),'route'),
        '<div class="ash099-lines"><p>The recovered marker now points travelers toward the raised causeway. The bellkeeper has copied its position into the lowland ledger.</p><p><strong>Contract complete.</strong> This one-time contract cannot be claimed again.</p></div>');
    }
    screen(head('Greyfen Contract','A Dry Crossing',description,locationInterior('archive'),'route'),
      '<div class="ash099-lines"><p>Choose a route before leaving the landing. Both options are explained up front; a failed reed-bed attempt can be retried, but the marsh will take a toll.</p></div>'+
      '<div class="ash099-cards">'+
        '<button class="ash099-btn ash099-card" data-crossing-choice="posts"><strong>Follow the Old Posts</strong><small>Safer and slower. Guaranteed marker recovery. Reward: 35g and 1 Road Herb. No health risk.</small><em>Take the raised path</em></button>'+
        '<button class="ash099-btn ash099-card" data-crossing-choice="reeds"><strong>Cut Through the Reed Bed</strong><small>Faster but uncertain. 65% chance to recover the marker for 65g and 2 Road Herbs. On a miss: no reward, lose 5 HP, and you may retry.</small><em>Risk the shortcut</em></button>'+
      '</div>');
    document.querySelectorAll('[data-crossing-choice]').forEach(b=>b.onclick=()=>settleDryCrossing(b.dataset.crossingChoice));
  }
  function settleDryCrossing(choice){
    const pl=p(); if(!pl)return;
    if(String(pl.currentRegion||'Ashmere')!=='Greyfen')return renderAshmere();
    pl.flags=pl.flags||{}; pl.inventory=pl.inventory||{};
    if(pl.flags.greyfenDryCrossingComplete)return renderDryCrossing();
    let heading='',detail='';
    if(choice==='posts'){
      pl.flags.greyfenDryCrossingComplete=true;
      pl.gold=Number(pl.gold||0)+35;
      pl.inventory.roadHerb=Number(pl.inventory.roadHerb||0)+1;
      heading='The marker is safe';
      detail='You followed the old posts and found the marker caught between two raised stones. Reward: 35g and 1 Road Herb. No health lost.';
      pl.memories=pl.memories||[]; pl.memories.push('You recovered Greyfen’s washed route marker by following the old posts.');
    }else if(choice==='reeds'){
      pl.flags.greyfenCrossingAttempts=Number(pl.flags.greyfenCrossingAttempts||0)+1;
      if(Math.random()<0.65){
        pl.flags.greyfenDryCrossingComplete=true;
        pl.gold=Number(pl.gold||0)+65;
        pl.inventory.roadHerb=Number(pl.inventory.roadHerb||0)+2;
        heading='The shortcut pays off';
        detail='You read the current correctly and caught the marker before it slipped beneath the reeds. Reward: 65g and 2 Road Herbs.';
        pl.memories=pl.memories||[]; pl.memories.push('You recovered Greyfen’s washed route marker through the reed bed.');
      }else{
        pl.hp=Math.max(1,Number(pl.hp||1)-5);
        heading='The reeds turn you back';
        detail='The mud gives way before you reach the marker. You escape with nothing but a bruised shoulder and lose 5 HP. You may try again or take the safer raised path.';
        pl.memories=pl.memories||[]; pl.memories.push('The reed bed turned you back from Greyfen’s washed route marker; you lost 5 HP.');
      }
    }else return renderDryCrossing();
    save(pl);
    screen(head('Contract Result',heading,'Your choice has been recorded.',locationInterior('archive'),'route'),
      '<div class="ash099-lines"><p>'+esc(detail)+'</p><p>'+esc(pl.flags.greyfenDryCrossingComplete?'The marker’s location is now recorded in the Boundary Archive.':'The contract remains open until the marker is recovered.')+'</p></div>');
  }

    return renderDryCrossing();
  }

  window.LegendAshmereCrossingV099 = Object.freeze({ render });
})();
