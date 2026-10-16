/* LEGEND Ashmere inn and lodging services.
 * Keeps existing rest/supply costs and rumor interactions, with persistence and
 * UI dependencies supplied by the town controller.
 */
(() => {
  function render(context) {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.screen !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const {
      locationInterior, head, screen, escapeHtml: esc, gold, serviceArt, icon, note
    } = context;

  function renderInn(){
 const pl=p();if(!pl)return;
 const greyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
 const title=greyfen?'Reedlight Inn':'Ashmere Inn';
 const desc=greyfen?'Dry your cloak, recover, and listen for lowland rumors.':'A warm room, a locked door, and one night away from the mud.';
 const intro=greyfen?'The room is damp, but the fire is steady. Rest before the causeway takes another toll.':'The inn smells of cedar smoke and wet wool. The road can wait until morning.';
 screen(head('Inn & Lodging',title,desc,locationInterior('inn'),'inn'),
  '<section class="ash099-service-dashboard">'+
   '<div class="ash099-service-overview"><div class="ash099-service-note"><span>THE INNKEEPER’S NOTE</span><strong>'+esc(intro)+'</strong><p>Take a breath, stock the pack, or ask what the regulars have heard.</p></div><div class="ash099-service-wallet"><span>YOUR PURSE</span><strong>'+gold(pl.gold)+'</strong><small>HEALTH · '+Number(pl.hp||0)+' / '+Number(pl.maxHp||1)+'</small><i><b style="width:'+Math.max(0,Math.min(100,Math.round(Number(pl.hp||0)/Math.max(1,Number(pl.maxHp||1))*100)))+'%"></b></i></div></div>'+
   '<div class="ash099-service-actions">'+
    '<button class="ash099-btn ash099-service-card" id="rest" type="button"><span class="ash099-service-icon">'+serviceArt('inn',icon('inn'))+'</span><span class="ash099-service-copy"><small>RECOVER</small><strong>Rest for the night</strong><span>Restore all health and return to the road ready.</span></span><em>35g</em></button>'+
    '<button class="ash099-btn ash099-service-card" id="camp" type="button"><span class="ash099-service-icon">'+serviceArt('milestone',icon('road'))+'</span><span class="ash099-service-copy"><small>PACK SUPPLIES</small><strong>Camp Supplies</strong><span>Carry shelter and dry kindling for safer expeditions.</span></span><em>90g</em></button>'+
    '<button class="ash099-btn ash099-service-card" id="rumor" type="button"><span class="ash099-service-icon">'+serviceArt('journal',icon('archive'))+'</span><span class="ash099-service-copy"><small>LISTEN IN</small><strong>Hear a Rumor</strong><span>Ask what has been happening beyond the lantern line.</span></span><em>FREE</em></button>'+
   '</div><div id="ashNote" class="ash099-note" style="display:none"></div></section>');
 document.getElementById('rest').onclick=()=>buyService(35,pl=>{pl.hp=pl.maxHp},'You rest at the inn and recover completely.');
 document.getElementById('camp').onclick=()=>buyService(90,pl=>{pl.inventory.camp=Number(pl.inventory.camp||0)+1},'Bought camp supplies.');
 document.getElementById('rumor').onclick=()=>{
  const rumors=greyfen
   ?['The water rose after the bell rang, though no rain had fallen.','A blue light is seen near the drowned boundary stones at dusk.','The causeway markers have shifted. Or something has turned them.']
   :['A broken shrine showed itself in the fog last night.','Blackroot wolves hate firelight.','Brenn pays extra for proof that still bleeds.'];
  note(rumors[Math.floor(Math.random()*rumors.length)]);
 };
}
function buyService(cost,fn,msg){const pl=p();if(Number(pl.gold||0)<cost)return note('Not enough gold.');pl.gold-=cost;fn(pl);save(pl);note(msg);}


    renderInn();
  }

  window.LegendAshmereInnV099 = Object.freeze({ render });
})();
