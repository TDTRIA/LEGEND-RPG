/* LEGEND v0.20.36 - Ashmere feature screen adapters.
 * Owns dependency assembly and dispatch for focused town screens. Public town
 * routes remain on LegendAshmereV099; feature modules receive their dependencies
 * explicitly and keep their existing route/state contracts.
 */
(() => {
  function create(context = {}) {
    const {
      getPlayer, savePlayer, getAssets, getData, escapeHtml: esc, imageMarkup: img,
      background: bg, npcArt: npc, setBellQuestObjective, note, head, screen,
      locationInterior, renderTown, awardProgress, getProgressionStatus, gold, serviceArt, icon,
      npcCatalog, npcStory, renderRegions,
      itemName, itemIcon, canAfford, owned, canCraft, needsMarkup,
      armorArt, weaponName, armorName, regionShopArt, hpPct
    } = context;

    if (typeof getPlayer !== 'function' || typeof savePlayer !== 'function' ||
        typeof esc !== 'function' || typeof head !== 'function' ||
        typeof screen !== 'function' || typeof locationInterior !== 'function') {
      return null;
    }

    function contractsContext() {
      return {
        getPlayer,
        savePlayer,
        escapeHtml: esc,
        itemName,
        head,
        screen,
        locationInterior,
        renderTown,
        awardProgress
      };
    }

    function renderSideContracts(message = '') {
      const contracts = window.LegendAshmereContractsV099;
      if (contracts?.render) return contracts.render(contractsContext(), 'contracts', message);
      screen(head('Journal & Notices', 'Side Stories & Road Contracts', 'The contracts module did not load.', locationInterior('archive'), 'quest'),
        '<p>Contracts are unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderDryCrossing() {
      const crossing = window.LegendAshmereCrossingV099;
      if (crossing?.render) return crossing.render(contractsContext());
      screen(head('Greyfen Contract', 'A Dry Crossing', 'The crossing module did not load.', locationInterior('archive'), 'route'),
        '<p>The crossing contract is unavailable. Return to town and refresh before trying again.</p>');
    }

    function peopleContext() {
      return {
        getPlayer,
        savePlayer,
        getAssets,
        escapeHtml: esc,
        imageMarkup: img,
        background: bg,
        npcArt: npc,
        npcCatalog,
        npcStory,
        renderRegions,
        setBellQuestObjective,
        note,
        head,
        screen
      };
    }

    function renderPeople() {
      const people = window.LegendAshmerePeopleV099;
      if (people?.render) return people.render(peopleContext(), 'people');
      screen(head('Town Square', 'People of Ashmere', 'The people module did not load.', bg(), 'people'),
        '<p>Town characters are unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderNPC(id) {
      const people = window.LegendAshmerePeopleV099;
      if (people?.render) return people.render(peopleContext(), 'npc', id);
      screen(head('Town Square', 'Town Character', 'The people module did not load.', bg(), 'people'),
        '<p>Dialogue is unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderInn() {
      const inn = window.LegendAshmereInnV099;
      if (inn?.render) {
        return inn.render({
          getPlayer,
          savePlayer,
          locationInterior,
          head,
          screen,
          escapeHtml: esc,
          gold,
          serviceArt,
          icon,
          note
        });
      }
      screen(head('Inn & Lodging', 'The Inn', 'The inn module did not load.', locationInterior('inn'), 'inn'),
        '<p>Inn services are unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderWorkBoard() {
      const workBoard = window.LegendAshmereWorkV099;
      if (workBoard?.render) {
        return workBoard.render({
          getPlayer,
          savePlayer,
          screen,
          head,
          locationInterior,
          esc,
          gold,
          itemName,
          awardProgress,
          jobCatalog: window.LegendAshmereJobCatalogV099
        });
      }
      screen(head('Local Work', 'Work Board', 'The work board module did not load.', locationInterior('archive'), 'work'),
        '<p>Local jobs are unavailable. Return to town and refresh before trying again.</p>');
    }

    function commerceContext() {
      return {
        getPlayer,
        savePlayer,
        getAssets,
        getData,
        itemIcon,
        itemName,
        gold,
        locationInterior,
        head,
        screen,
        esc,
        icon,
        canAfford,
        owned,
        note,
        canCraft,
        needsMarkup,
        armorArt,
        weaponName,
        armorName,
        regionShopArt
      };
    }

    function renderTrader(tab = 'buy') {
      const commerce = window.LegendAshmereCommerceV099;
      if (commerce?.render) return commerce.render(commerceContext(), 'trader', tab);
      screen(head('Market', 'Trading Post', 'The commerce module did not load.', locationInterior('market'), 'trader'),
        '<p>Trading is unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderCrafting(feedback = '') {
      const commerce = window.LegendAshmereCommerceV099;
      if (commerce?.render) return commerce.render(commerceContext(), 'crafting', feedback);
      screen(head('Crafting', 'Crafting Bench', 'The commerce module did not load.', locationInterior('forge'), 'craft'),
        '<p>Crafting is unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderSmith(tab = 'weapon') {
      const commerce = window.LegendAshmereCommerceV099;
      if (commerce?.render) return commerce.render(commerceContext(), 'smith', tab);
      screen(head('Workshop', 'The Blacksmith', 'The equipment module did not load.', locationInterior('forge'), 'smith'),
        '<p>Equipment services are unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderSheet() {
      const records = window.LegendAshmereRecordsV099;
      if (records?.renderSheet) {
        return records.renderSheet({
          player: getPlayer(),
          assets: getAssets(),
          data: getData(),
          esc,
          itemIcon,
          itemName,
          weaponName,
          armorName,
          armorArt,
          gold,
          hpPct,
          getProgressionStatus,
          head,
          screen
        });
      }
      screen(head('Traveler', 'Traveler', 'The traveler records module did not load.', '', 'profile'),
        '<p>Traveler records are unavailable. Return to town and refresh before trying again.</p>');
    }

    function renderBellVault() {
      const vault = window.LegendBellVaultV100;
      if (vault?.create) {
        const instance = vault.create({
          getPlayer, savePlayer, getData, escapeHtml: esc, head, screen, locationInterior,
          awardProgress, renderTown, itemName
        });
        if (instance?.render) return instance.render();
      }
      screen(head('ASHMERE · BELOW THE BELL', 'The Bell Cellar', 'The cellar service did not load. Return to town and refresh before trying again.', locationInterior('archive'), 'archive'),
        '<p>The cellar is unavailable. Your traveler and saved progress are safe.</p>');
    }

    function renderGreyfenStorehouse() {
      const storehouse = window.LegendGreyfenStorehouseV170;
      if (storehouse?.create) {
        const instance = storehouse.create({
          getPlayer, savePlayer, getData, escapeHtml: esc, head, screen, locationInterior, renderTown
        });
        if (instance?.render) return instance.render();
      }
      screen(head('GREYFEN · STOREHOUSE', 'The Silted Storehouse', 'The optional delve did not load. Your saved traveler and supplies are safe.', locationInterior('market'), 'dungeon'),
        '<p>The storehouse is unavailable. Return to Greyfen and refresh before trying again.</p>');
    }

    function renderArchive() {
      const records = window.LegendAshmereRecordsV099;
      if (records?.renderArchive) {
        const player = getPlayer();
        return records.renderArchive({
          player,
          currentRegion: player?.currentRegion || 'Ashmere',
          savePlayer,
          locationInterior,
          esc,
          head,
          screen
        });
      }
      screen(head('Records', 'Archive Hall', 'The traveler records module did not load.', '', 'archive'),
        '<p>The journal is unavailable. Return to town and refresh before trying again.</p>');
    }

    return Object.freeze({
      renderSideContracts,
      renderDryCrossing,
      renderPeople,
      renderNPC,
      renderInn,
      renderWorkBoard,
      renderBellVault,
      renderGreyfenStorehouse,
      renderTrader,
      renderCrafting,
      renderSmith,
      renderSheet,
      renderArchive
    });
  }

  window.LegendAshmereFeaturesV099 = Object.freeze({ create });
})();
