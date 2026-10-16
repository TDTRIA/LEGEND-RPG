/* LEGEND Ashmere forge and equipment.
 * Owns weapon/armor listings, illustration markup, purchases, and equip actions.
 */
(() => {
  function render(context, argument = 'weapon') {
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

  function renderSmith(tab='weapon'){
    const pl=p(),assets=A().items||{};
    const weapons=(D().weapons||[]).filter(w=>w.id!=='hand'),armors=(D().armors||[]).filter(a=>a.id!=='none');
    const equippedWeapon=weapons.find(w=>w.id===pl.weapon),equippedArmor=armors.find(a=>a.id===pl.armor);
    const portrait=A().classes?.[pl.className]||'';
    const loadoutItem=(name,detail,art,kind)=>'<div class="ash099-loadout-slot">'+(kind==='weapon'?weaponArtSvg(p()?.weapon):(armorArt(p()?.armor)?'<img src="'+esc(armorArt(p()?.armor))+'" alt="" aria-hidden="true" onerror="this.onerror=null;this.style.display=\'none\'">':icon('sheet')))+'<span><small>'+(kind==='weapon'?'WEAPON':'ARMOR')+'</small><strong>'+esc(name)+'</strong><em>'+esc(detail)+'</em></span></div>';
    const list=tab==='weapon'?weapons:armors;
    screen(head('Workshop',String(pl.currentRegion||'Ashmere')==='Greyfen'?'Causeway Smithy':'The Blacksmith','A good weapon is chosen. Good armor is earned. Equip what you own, or spend gold to improve your odds.',locationInterior('forge'),'smith'),
      '<section class="ash099-forge-console">'+
        '<div class="ash099-forge-loadout">'+(portrait?'<img class="ash099-forge-traveler" src="'+esc(portrait)+'" alt="'+esc(pl.className||'Traveler')+'" onerror="this.onerror=null;this.style.display=\'none\'">':'')+'<div class="ash099-forge-loadout-copy"><span class="ash099-eyebrow">YOUR CURRENT KIT</span><h2>Level '+Number(pl.level||1)+' · '+esc(pl.className||'Traveler')+'</h2><p>Owned gear stays yours. New gear is equipped as soon as you buy it.</p></div><div class="ash099-forge-slots">'+loadoutItem(equippedWeapon?.name||weaponName(pl.weapon),equippedWeapon?'Damage '+equippedWeapon.min+'–'+equippedWeapon.max:'Basic attack',assets.shortSword||'','weapon')+loadoutItem(equippedArmor?.name||armorName(pl.armor),equippedArmor?'Defense '+equippedArmor.defense:'No protection',armorArt(pl.armor),'armor')+'</div></div>'+
        '<div class="ash099-forge-tabs" role="tablist" aria-label="Workshop category"><button data-forge-tab="weapon" class="'+(tab==='weapon'?'active':'')+'" role="tab" aria-selected="'+(tab==='weapon')+'">Weapons</button><button data-forge-tab="armor" class="'+(tab==='armor'?'active':'')+'" role="tab" aria-selected="'+(tab==='armor')+'">Armor</button><button data-forge-tab="craft" class="" role="tab" aria-selected="false">Crafting Bench</button><span>YOUR GOLD <strong>'+gold(pl.gold)+'</strong></span></div>'+
        '<div class="ash099-forge-grid">'+list.map(x=>gearCard(x,tab)).join('')+'</div><div id="ashNote" class="ash099-note" style="display:none"></div></section>');
    document.querySelectorAll('[data-forge-tab]').forEach(button=>button.onclick=()=>{
      if(button.dataset.forgeTab==='craft'){
        if(typeof context.openCrafting==='function')return context.openCrafting('');
        return note('Crafting Bench is unavailable.');
      }
      return renderSmith(button.dataset.forgeTab);
    });
    document.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>buyGear(b.dataset.gear,b.dataset.kind));
  }
  function weaponArtSvg(id){
    const palette={
      woodenSword:{blade:'#b99258',edge:'#f0d5a0',grip:'#69482b',guard:'#967043',dark:'#382519'},
      stoneSword:{blade:'#8b9792',edge:'#e4e9db',grip:'#555b54',guard:'#737d75',dark:'#303a34'},
      bronzeSword:{blade:'#b86c3d',edge:'#f1c27a',grip:'#603d29',guard:'#db9a50',dark:'#42281d'},
      ironSword:{blade:'#8999a3',edge:'#e2e9ed',grip:'#333d43',guard:'#a1b0b5',dark:'#1f282d'},
      steelSword:{blade:'#c0d4de',edge:'#ffffff',grip:'#29353e',guard:'#e3c77e',dark:'#16212a'},
      hand:{blade:'#c8b98d',edge:'#efe2b5',grip:'#53422b',guard:'#8d7447',dark:'#251c13'}
    };
    const v=palette[id]||palette.hand;
    let blade='M39 5 L48 17 L44 47 L40 55 L36 47 L32 17 Z',detail='',guard='M26 51 Q40 56 54 51 L51 57 Q40 61 29 57 Z';
    if(id==='stoneSword'){
      blade='M38 5 L46 13 L49 25 L43 45 L40 56 L35 45 L31 25 L34 13 Z';
      detail='<path d="M38 12 L36 25 L40 39 L42 24 Z" fill="'+v.edge+'" opacity=".56"/><path d="M33 31 L39 36 L36 44" fill="none" stroke="'+v.dark+'" stroke-width="1.8"/>';
      guard='M24 49 L37 53 L40 50 L43 53 L56 49 L52 58 L41 56 L38 56 L28 58 Z';
    }else if(id==='bronzeSword'){
      blade='M39 5 Q46 9 47 18 L44 45 L40 55 L36 46 L32 18 Q33 9 39 5 Z';
      detail='<path d="M39 12 L41 22 L40 45" fill="none" stroke="'+v.edge+'" stroke-width="2.3"/><path d="M35 20 L38 23" stroke="'+v.dark+'" stroke-width="1.3"/>';
      guard='M23 48 Q32 53 37 50 L40 55 L43 50 Q49 53 57 48 L52 58 Q44 60 40 56 Q34 60 28 58 Z';
    }else if(id==='ironSword'){
      blade='M39 4 L46 15 L44 49 L40 56 L36 49 L32 15 Z';
      detail='<path d="M39 11 L40 50" stroke="'+v.edge+'" stroke-width="2.4"/><path d="M35 19 L37 38" stroke="'+v.dark+'" stroke-width="1.1" opacity=".65"/>';
      guard='M25 50 L38 52 L40 50 L42 52 L55 50 L51 57 L42 56 L38 56 L29 57 Z';
    }else if(id==='steelSword'){
      blade='M40 3 L47 16 L43 47 L40 55 L37 47 L33 16 Z';
      detail='<path d="M40 8 L41 48" stroke="'+v.edge+'" stroke-width="2.1"/><path d="M42 18 L45 21 L43 24" fill="none" stroke="'+v.edge+'" stroke-width="1.5"/><path d="M50 13 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z" fill="'+v.guard+'"/>';
      guard='M24 49 L38 52 L40 49 L42 52 L56 49 L51 57 L42 56 L38 56 L29 57 Z';
    }else{
      detail='<path d="M35 17 L37 38 M43 20 L42 42" stroke="'+v.dark+'" stroke-width="1.8" opacity=".55"/>';
    }
    const name=(D().weapons||[]).find(w=>w.id===id)?.name||'Weapon';
    return '<span class="ash099-weapon-art ash099-weapon-art-'+esc(id)+'" role="img" aria-label="'+esc(name)+' illustration"><svg viewBox="0 0 80 80" aria-hidden="true" focusable="false"><path d="'+blade+'" fill="'+v.blade+'" stroke="'+v.dark+'" stroke-width="1.2"/><path d="M39 8 L40 49" fill="none" stroke="'+v.edge+'" stroke-width="1.5" opacity=".9"/>'+detail+'<path d="'+guard+'" fill="'+v.guard+'" stroke="'+v.dark+'" stroke-width="1.4"/><path d="M37 56 L43 56 L45 69 L40 73 L35 69 Z" fill="'+v.grip+'" stroke="'+v.dark+'" stroke-width="1.3"/><path d="M36 61 L43 61 M36 65 L44 65 M37 69 L42 69" stroke="'+v.edge+'" stroke-width="1.2" opacity=".7"/><circle cx="40" cy="74" r="3.5" fill="'+v.guard+'" stroke="'+v.dark+'" stroke-width="1.2"/></svg></span>';
  }
  function gearCard(x,kind){
    const pl=p(),ownedMap=kind==='weapon'?pl.ownedWeapons:pl.ownedArmor;
    const assets=A().items||{},art=kind==='weapon'?'':armorArt(x.id);
    const isOwned=Number(ownedMap?.[x.id]||0)>0,level=Number(pl.level||1),required=Number(x.level||1);
    const equipped=(kind==='weapon'?pl.weapon:pl.armor)===x.id,locked=level<required,canBuy=canAfford(pl,x.cost);
    const label=equipped?'Equipped':isOwned?'Equip owned':locked?'Unlock at Lv. '+required:canBuy?'Buy & equip':'Need '+gold(x.cost);
    const disabled=equipped||(!isOwned&&(locked||!canBuy));
    const artMarkup=kind==='weapon'?weaponArtSvg(x.id):(art?'<img class="ash099-gear-art" src="'+esc(art)+'" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">':'');
    const statLine=kind==='weapon'?'Damage '+x.min+'–'+x.max:'Defense '+x.defense;
    const passive=kind==='weapon'&&x.passive?'<small class="ash099-gear-passive">'+esc(x.passive)+'</small>':'';
    const current=(kind==='weapon'?(D().weapons||[]):(D().armors||[])).find(item=>item.id===(kind==='weapon'?pl.weapon:pl.armor));
    const delta=kind==='weapon'?Number(x.max||0)-Number(current?.max||0):Number(x.defense||0)-Number(current?.defense||0);
    const compare=equipped?'<small class="ash099-gear-compare same">Currently equipped</small>':(current?'<small class="ash099-gear-compare '+(delta>0?'better':delta<0?'worse':'same')+'">'+(delta>0?'+'+delta:delta<0?String(delta):'No stat change')+(kind==='weapon'?' max damage':' defense')+' vs equipped</small>':'');
    return '<button class="ash099-gear-item '+(equipped?'equipped ':'')+(locked&&!isOwned?'locked':'')+'" data-gear="'+esc(x.id)+'" data-kind="'+kind+'" '+(disabled?'disabled':'')+'>'+
      artMarkup+'<span class="ash099-gear-copy"><strong>'+esc(x.name)+'</strong><small>'+statLine+'</small>'+compare+passive+'<em>'+(isOwned?'Owned':locked?'Requires level '+required:gold(x.cost))+'</em></span><b class="ash099-gear-action">'+label+'</b></button>';
  }
function buyGear(id,kind){
    const pl=p();if(!pl)return;
    const list=kind==='weapon'?D().weapons:D().armors,item=(list||[]).find(x=>x.id===id);
    if(!item||kind!=='weapon'&&kind!=='armor')return renderSmith();
    const level=Number(pl.level||1),required=Number(item.level||1),ownedMap=kind==='weapon'?(pl.ownedWeapons=pl.ownedWeapons||{}):(pl.ownedArmor=pl.ownedArmor||{});
    if(level<required&&!Number(ownedMap[id]||0))return note('You need level '+required+' to use '+item.name+'.');
    if(Number(ownedMap[id]||0)>0){
      if(kind==='weapon')pl.weapon=id;else pl.armor=id;
      save(pl);renderSmith(kind);note('Equipped '+item.name+'.');
      return;
    }
    if(Number(pl.gold||0)<Number(item.cost||0))return note('Not enough gold.');
    pl.gold-=Number(item.cost||0);ownedMap[id]=1;
    if(kind==='weapon')pl.weapon=id;else pl.armor=id;
    save(pl);renderSmith(kind);note('Purchased and equipped '+item.name+'.');
  }

    return renderSmith(argument);
  }

  window.LegendAshmereForgeV099 = Object.freeze({ render });
})();
