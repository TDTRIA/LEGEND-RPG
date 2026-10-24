/* LEGEND v0.20.36 - Ashmere shared asset/catalog presentation helpers.
 * Keeps item ID aliases and region-specific visual choices outside the route facade.
 */
(() => {
  function create(config = {}) {
    const {
      getAssets,
      getData,
      getPlayer,
      escapeHtml: esc
    } = config;
    if (typeof getAssets !== 'function' || typeof getData !== 'function' ||
        typeof getPlayer !== 'function' || typeof esc !== 'function') return null;

    const imageMarkup = (path, alt = '') => path
      ? `<img src="${esc(path)}" alt="${esc(alt)}" onerror="if(this.src.startsWith('https://')){this.onerror=null;this.src='assets/generated/locations/ashmere-town.webp'}else{this.style.display='none'}">`
      : '';

    const itemIcon = key => {
      const items = getAssets().items || {};
      const aliases = {
        food:'food', ration:'rationBundle', rationBundle:'rationBundle', potion:'potion', roadPoultice:'potion', blackrootTonic:'blackrootTonicIngredients',
        roadToken:'roadToken', bellFragment:'bellFragmentCraft', camp:'camp', campSupply:'camp', roadHerb:'roadHerbBundle', huntersCharm:'huntersCharm', wispLanternWick:'lampOil',
        reinforcedBuckle:'reinforcedBuckle', woodenSword:'shortSword', stoneSword:'shortSword', bronzeSword:'shortSword', ironSword:'shortSword', steelSword:'shortSword', shortSword:'shortSword', bow:'bow', huntingBow:'bow', shield:'shield',
        none:'shield', clothArmor:'clothArmorIcon', chainArmor:'chainArmorIcon', bronzeArmor:'bronzeArmorIcon', ironArmor:'ironArmorIcon', woodScrap:'armorRepairKit', peatBrick:'camp', clothScrap:'armorRepairKit', wolfFang:'huntersCharm', tornHide:'tornHide', ore:'ironOreChunk', wispAsh:'bellFragmentCraft', oil:'lampOil', goblinTrinket:'tradeBundle', blackrootThorn:'blackrootTonicIngredients', tradeBundle:'tradeBundle'
      };
      return items[aliases[key] || key] || items.pelt || '';
    };

    const itemName = key => getData().itemNames?.[key] || ({
      food:'Rations', potion:'Healing Potion', camp:'Camp Supplies', roadToken:'Road Token',
      woodScrap:'Wood Scrap', clothScrap:'Cloth Scrap', roadHerb:'Road Herb', wolfFang:'Wolf Fang',
      tornHide:'Torn Hide', ore:'Ore', wispAsh:'Wisp Ash', oil:'Lamp Oil', goblinTrinket:'Goblin Trinket',
      blackrootThorn:'Blackroot Thorn', brokenBellShard:'Broken Bell Shard', roadPoultice:'Road Poultice',
      blackrootTonic:'Blackroot Tonic', huntersCharm:"Hunter's Charm", reinforcedBuckle:'Reinforced Buckle',
      wispLanternWick:'Wisp Lantern Wick', tradeBundle:'Trade Bundle'
    }[key] || key);

    const gold = amount => `${Number(amount || 0)}g`;
    const background = () => {
      const player = getPlayer(), locations = getAssets().locations || {};
      if (String(player?.currentRegion || 'Ashmere') === 'Greyfen') {
        return locations.greyfenMain || locations.ashmereMain || 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg';
      }
      return locations.ashmereMain || 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg';
    };
    const locationInterior = kind => {
      const greyfen = String(getPlayer()?.currentRegion || 'Ashmere') === 'Greyfen';
      const locations = getAssets().locations || {};
      const key = greyfen
        ? ({inn:'greyfenInn', market:'greyfenMarket', forge:'greyfenForge', archive:'greyfenArchive'}[kind])
        : ({inn:'ashmereInn', market:'ashmereMarket', forge:'ashmereForge', archive:'ashmereArchive'}[kind]);
      return locations[key] || background();
    };
    const roadBackground = () => getAssets().locations?.oldRoad || getAssets().locations?.highRidge || 'assets/generated/locations/old-road-south-fork.webp';
    const npcArt = id => getAssets().npcs?.[id] || (id === 'oric' ? 'assets/generated/npcs/captain-oric.webp' : '');
    const weaponName = id => (getData().weapons || []).find(item => item.id === id)?.name || id || 'Hands';
    const armorName = id => (getData().armors || []).find(item => item.id === id)?.name || id || 'None';

    const icon = (key, alt = '') => {
      const iconKeys = {
        people:'traveler', inn:'inn', trader:'market', smith:'blacksmith', road:'map',
        sheet:'journal', brenn:'journal', archive:'journal', mara:'journal', oric:'traveler',
        work:'jobBoard', craft:'blacksmith', profile:'traveler', quest:'jobBoard', route:'map',
        regions:'gatehouse', settings:'gatehouse', gate:'gatehouse', world:'map', notice:'jobBoard',
        cloud:'map', account:'traveler', feedback:'journal', delete:'gatehouse', text:'journal',
        bold:'journal', contrast:'gatehouse', motion:'map', space:'gatehouse', font:'journal',
        lock:'gatehouse', slot:'traveler', continue:'map', new:'traveler'
      };
      const path = getAssets().ui?.serviceIcons?.[iconKeys[key] || 'traveler'];
      return path
        ? '<span class="ash099-icon ash099-asset-icon ash099-raster-icon" aria-hidden="true"><img src="' + esc(path) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" onerror="this.closest(\'.ash099-icon\').classList.add(\'is-missing\')"></span>'
        : '<span class="ash099-icon ash099-raster-icon is-missing" aria-hidden="true"></span>';
    };
    const regionShopArt = key => {
      const path = getAssets().ui?.regionShops?.[key];
      return path ? '<span class="ash099-icon ash099-asset-icon ash099-region-shop-icon" aria-hidden="true"><img src="' + esc(path) + '" alt="" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'"></span>' : '';
    };
    const armorArt = id => {
      const items = getAssets().items || {};
      const keys = {clothArmor:'clothArmorIcon', chainArmor:'chainArmorIcon', bronzeArmor:'bronzeArmorIcon', ironArmor:'ironArmorIcon', none:'shield'};
      return items[keys[id] || id] || items.shield || items.camp || '';
    };
    const serviceArt = (key, fallback = '') => {
      const path = getAssets().ui?.serviceIcons?.[key];
      if (!path) return fallback;
      return '<span class="ash099-icon ash099-asset-icon" aria-hidden="true"><img src="' + esc(path) + '" alt="" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'"></span>';
    };

    return Object.freeze({
      imageMarkup, itemIcon, itemName, gold, background, locationInterior,
      roadBackground, npcArt, weaponName, armorName, icon, regionShopArt,
      armorArt, serviceArt
    });
  }

  window.LegendAshmereAssetsV099 = Object.freeze({ create });
})();
