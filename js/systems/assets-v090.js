// LEGEND v0.9.x - Asset Manifest
// Centralizes asset paths so new art can be wired without hunting through systems.
(() => {
  window.LegendAssetsV090 = {
    logo: {
      main: 'assets/ui/logos/logo_legend_main_v1.png',
      emblem: 'assets/ui/logos/logo_legend_emblem_v1.png',
      emblemFull: 'assets/ui/logos/logo_legend_emblem_full_v1.png'
    },
    title: {
      background: 'assets/title/title_bg_ashmere_road_v089.jpg'
    },
    locations: {
      ashmereMain: 'assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg',
      oldRoad: 'assets/locations/roads/location_old_road_main_v1.jpg'
    },
    npcs: {
      mara: 'assets/npcs/ashmere/npc_mara_portrait_v1.jpg',
      brenn: 'assets/npcs/ashmere/npc_brenn_portrait_v1.jpg',
      oric: 'assets/npcs/ashmere/npc_oric_portrait_v1.jpg',
      innkeeper: 'assets/npcs/vendors/npc_innkeeper_portrait_v1.jpg',
      blacksmith: 'assets/npcs/vendors/npc_blacksmith_portrait_v1.jpg',
      trader: 'assets/npcs/vendors/npc_trader_portrait_v1.jpg'
    },
    enemies: {
      roadGoblin: 'assets/enemies/road/enemy_road_goblin_v1.jpg',
      blackrootWolf: 'assets/enemies/road/enemy_blackroot_wolf_v1.jpg',
      lanternWisp: 'assets/enemies/road/enemy_lantern_wisp_v1.jpg'
    },
    items: {
      food: 'assets/items/consumables/item_food_rations_v1.png',
      potion: 'assets/items/consumables/item_healing_potion_v1.png',
      roadToken: 'assets/items/quest/item_road_token_v1.png',
      bellFragment: 'assets/items/quest/item_bell_fragment_v1.png',
      pelt: 'assets/items/materials/item_pelt_v1.png'
    },
    byName(name='') {
      const n = String(name).toLowerCase();
      if(n.includes('mara')) return this.npcs.mara;
      if(n.includes('brenn')) return this.npcs.brenn;
      if(n.includes('oric')) return this.npcs.oric;
      if(n.includes('inn') || n.includes('keeper')) return this.npcs.innkeeper;
      if(n.includes('smith') || n.includes('weapon') || n.includes('armor')) return this.npcs.blacksmith;
      if(n.includes('trade') || n.includes('market') || n.includes('merchant')) return this.npcs.trader;
      if(n.includes('goblin')) return this.enemies.roadGoblin;
      if(n.includes('wolf') || n.includes('hound') || n.includes('blackroot')) return this.enemies.blackrootWolf;
      if(n.includes('wisp') || n.includes('spirit') || n.includes('lantern')) return this.enemies.lanternWisp;
      return '';
    }
  };
})();
