/* LEGEND Ashmere Trading Post.
 * Owns market listings and buy/sell transactions; item values and stock stay unchanged.
 */
(() => {
  function render(context, argument = 'buy') {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.screen !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const A = () => context.getAssets?.() || {};
    const D = () => context.getData?.() || {};
    const salePrice = (player, baseValue) => Math.max(0, Math.round(Number(baseValue || 0) * (1 + Math.max(0, Number(D().keepsakes?.[player?.keepsake]?.sellBonus || 0)))));
    const {
      itemIcon, itemName, gold, locationInterior, head, screen, esc, icon,
      canAfford, owned, note, canCraft, needsMarkup, armorArt, weaponName, armorName, regionShopArt
    } = context;

function renderTrader(tab='buy'){
    const pl=p();
    const greyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
    const goods=[['food','Rations',60,'A day’s food for the road.'],['potion','Healing Potion',120,'Restore your strength in a fight.'],['camp','Camp Supplies',90,'Prepare a safe stop beyond the gate.'],['clothScrap','Cloth Scrap',34,'Material for field medicine.'],['oil','Lamp Oil',70,'Fuel for lanterns and preparations.']];
    const sellables=[['wolfFang',12],['tornHide',8],['roadHerb',10],['wispAsh',22],['goblinTrinket',16],['blackrootThorn',14],['woodScrap',7],['peatBrick',6],['marshParcel',34],['clothScrap',9],['ore',24],['tradeBundle',72],['brokenBellShard',60]];
    const sellAllValue=sellables.reduce((sum,[k,v])=>sum+(owned(pl,k)*salePrice(pl,v)),0);
    const itemCard=(k,name,price,desc,action,disabled,tail)=>{
      const art=itemIcon(k)||A().items?.roadToken||'';
      const thumb=art?'<img class="ash099-market-art" src="'+esc(art)+'" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">':'<span class="ash099-market-art ash099-market-art-fallback" aria-hidden="true">✦</span>';
      return '<button class="ash099-market-item" data-'+action+'="'+esc(k)+'" data-'+(action==='buy'?'cost':'value')+'="'+price+'" '+(disabled?'disabled':'')+'>'+thumb+'<span class="ash099-market-item-copy"><strong>'+esc(name)+'</strong><small>'+esc(desc)+'</small><em>'+esc(tail)+'</em></span><b class="ash099-market-price">'+price+'g</b></button>';
    };
    const content=tab==='buy'
      ?goods.map(([k,n,cost,desc])=>itemCard(k,n,cost,desc,'buy',!canAfford(pl,cost),'You own '+owned(pl,k))).join('')
      :sellables.filter(([k])=>owned(pl,k)>0).map(([k,value])=>itemCard(k,itemName(k),salePrice(pl,value),'A road find, ready to trade.', 'sell',false,'You own '+owned(pl,k)+(pl.keepsake==='Bent Coin'?' · keepsake bonus applied':''))).join('');
    const noLoot=tab==='sell'&&!sellables.some(([k])=>owned(pl,k)>0)?'<div class="ash099-empty-state">No road finds to sell yet.<small>Bring back herbs, hides, fangs, and fragments to stock the market.</small></div>':'';
    screen(head('Market',greyfen?'Marsh Market':'Trading Post',greyfen?'Trade the marsh’s finds for what you need to cross the water.':'Buy what you need. Sell what the road has left behind.',locationInterior('market'),'trader'),
      '<section class="ash099-market-console">'+
        '<div class="ash099-market-wallet"><div><span>YOUR PURSE</span><strong>'+gold(pl.gold)+'</strong></div><div><span>ROAD LOOT VALUE</span><strong>'+gold(sellAllValue)+'</strong></div>'+(tab==='sell'?'<button class="ash099-btn primary" id="sellAllLoot" '+(sellAllValue>0?'':'disabled')+'>Sell all loot</button>':'<span class="ash099-market-note">Prices are per item</span>')+'</div>'+
        '<div class="ash099-market-tabs" role="tablist" aria-label="Market actions"><button class="'+(tab==='buy'?'active':'')+'" data-market-tab="buy" role="tab" aria-selected="'+(tab==='buy')+'">Buy supplies</button><button class="'+(tab==='sell'?'active':'')+'" data-market-tab="sell" role="tab" aria-selected="'+(tab==='sell')+'">Sell road loot <span>'+sellables.reduce((n,[k])=>n+owned(pl,k),0)+'</span></button></div>'+
        '<div class="ash099-market-grid">'+content+noLoot+'</div><div id="ashNote" class="ash099-note" style="display:none"></div></section>');
    document.querySelectorAll('[data-market-tab]').forEach(b=>b.onclick=()=>renderTrader(b.dataset.marketTab));
    document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy,Number(b.dataset.cost)));
    document.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>sellItem(b.dataset.sell,Number(b.dataset.value)));
    const sellAll=document.getElementById('sellAllLoot');
    if(sellAll)sellAll.onclick=()=>sellAllLoot(sellables);
  }
  function buyItem(k,cost){const pl=p();if(Number(pl.gold||0)<cost)return note('Not enough gold.');pl.gold-=cost;pl.inventory[k]=Number(pl.inventory[k]||0)+1;save(pl);renderTrader('buy');}
  function sellItem(k,value){const pl=p();if(owned(pl,k)<=0)return note('Nothing to sell.');pl.inventory[k]-=1;pl.gold=Number(pl.gold||0)+value;save(pl);renderTrader('sell');}
  function sellAllLoot(sellables){const pl=p();let total=0;sellables.forEach(([k,v])=>{const qty=owned(pl,k);if(qty>0){total+=qty*salePrice(pl,v);pl.inventory[k]=0;}});if(total<=0)return note('No sellable road loot.');pl.gold=Number(pl.gold||0)+total;save(pl);renderTrader('sell');}

    return renderTrader(argument);
  }

  window.LegendAshmereMarketV099 = Object.freeze({ render });
})();
