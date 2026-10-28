/* LEGEND Ashmere Crafting Bench.
 * Owns recipes, ingredient checks, and craft result feedback; inventory IDs stay unchanged.
 */
(() => {
  function render(context, argument = '') {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.screen !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const A = () => context.getAssets?.() || {};
    const D = () => context.getData?.() || {};
    const {
      itemIcon, itemName, gold, locationInterior, head, screen, esc, icon,
      canAfford, owned, note, canCraft, needsMarkup, armorArt, weaponName, armorName, regionShopArt
    } = context;

  function renderCrafting(feedback=''){
    const pl=p();
    const recipes=[
      ['roadPoultice','Road Poultice',[['roadHerb',2],['clothScrap',1]],'Healing item for rough travel.'],
      ['blackrootTonic','Blackroot Tonic',[['blackrootThorn',1],['wolfFang',1]],'Prepared for fear, bleed, and cursed road events later.'],
      ['huntersCharm','Hunter\'s Charm',[['wolfFang',2],['camp',1]],'+1 survival flavor for next road trip later.'],
      ['reinforcedBuckle','Reinforced Buckle',[['ore',1],['tornHide',1]],'Minor armor improvement material for the blacksmith later.'],
      ['wispLanternWick','Wisp Lantern Wick',[['bellFragment',1],['oil',1]],'A crafted lantern ward that softens the opening pressure of your next expedition.'],
      ['tradeBundle','Trade Bundle',[['goblinTrinket',2],['tornHide',1],['woodScrap',1]],'Sellable bundle worth more than raw scraps.']
    ];
    if (String(pl?.currentRegion || 'Ashmere') === 'Greyfen') {
      recipes.splice(1, 0, ['marshParcel','Peat-Wrapped Parcel',[['peatBrick',2],['clothScrap',1]],'A sale-ready Float Market parcel with a base trade value of 34g.']);
    }
    const cards=recipes.map(([id,name,needs,desc])=>{const art=itemIcon(id);return `<button class="ash099-btn ash099-card ash099-craft-card" data-craft="${id}" data-needs="${needs.map(n=>n.join(':')).join(',')}" ${canCraft(pl,needs)?'':'disabled'}>${art?'<img class="ash099-craft-output" src="'+esc(art)+'" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">':icon('craft')}<strong>${name}</strong><small>${desc}</small><span class="ash099-craft-needs"><b>Needs</b>${needsMarkup(pl,needs)}</span><em>${canCraft(pl,needs)?'Craft':'Missing'}</em></button>`;}).join('');
    screen(head('Crafting',String(p()?.currentRegion||'Ashmere')==='Greyfen'?'Marsh Workbench':'Crafting Bench','Road drops should matter. Convert herbs, fangs, hides, ash, and scraps into useful items or better sellables.',locationInterior('forge'),'craft'),`<div class="ash099-market-summary">${regionShopArt(String(p()?.currentRegion||'Ashmere')==='Greyfen'?'greyfenWorkbench':'ashmereWorkbench')}<div class="ash099-bench-copy"><strong>Bench Stock</strong><span>Use road drops here before selling raw loot.</span></div><button class="ash099-btn" id="openTrader">Open Trading Post</button></div>${feedback?'<div class="ash099-craft-feedback" role="status"><span class="ash099-craft-feedback-mark" aria-hidden="true">✓</span><span>'+esc(feedback)+'</span></div>':''}<div class="ash099-cards">${cards}</div><div id="ashNote" class="ash099-note" style="display:none"></div>`);
    document.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>craftItem(b.dataset.craft,b.dataset.needs));
    const openTrader=document.getElementById('openTrader');
    if(openTrader) openTrader.onclick=()=>{
      if(typeof context.openTradingPost==='function')return context.openTradingPost();
      note('Trading Post is unavailable.');
    };
  }
  function craftItem(id,needsTextRaw){const pl=p();const needs=String(needsTextRaw||'').split(',').filter(Boolean).map(x=>{const [k,v]=x.split(':');return [k,Number(v||0)];});if(!canCraft(pl,needs))return note('Missing ingredients.');const recipeNames={roadPoultice:'Road Poultice',blackrootTonic:'Blackroot Tonic',huntersCharm:'Hunter\'s Charm',reinforcedBuckle:'Reinforced Buckle',wispLanternWick:'Wisp Lantern Wick',tradeBundle:'Trade Bundle',marshParcel:'Peat-Wrapped Parcel'};needs.forEach(([k,v])=>pl.inventory[k]=Math.max(0,owned(pl,k)-v));pl.inventory[id]=Number(pl.inventory[id]||0)+1;save(pl);renderCrafting('Crafted '+(recipeNames[id]||itemName(id))+'. Ingredients used: '+needs.map(([k,v])=>v+' '+itemName(k)).join(', ')+'.');}

    return renderCrafting(argument);
  }

  window.LegendAshmereCraftingV099 = Object.freeze({ render });
})();
