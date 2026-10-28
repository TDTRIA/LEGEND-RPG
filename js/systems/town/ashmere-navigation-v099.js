/* LEGEND v0.20.36 - Ashmere/Greyfen route dispatch.
 * Maps public town view IDs to injected destinations, keeping the facade stable
 * while allowing future feature routes to be added without widening the controller.
 */
(() => {
  function create(context = {}) {
    const {
      renderHome,
      renderFeature,
      renderNPC,
      renderRoutes,
      renderRoad,
      renderRegions,
      renderProfile,
      renderMarsh
    } = context;

    if (typeof renderHome !== 'function' || typeof renderFeature !== 'function' ||
        typeof renderNPC !== 'function' || typeof renderRoutes !== 'function' ||
        typeof renderRoad !== 'function' || typeof renderRegions !== 'function') {
      return null;
    }

    const destinations = Object.freeze({
      home: renderHome,
      people: () => renderFeature('renderPeople'),
      inn: () => renderFeature('renderInn'),
      trader: () => renderFeature('renderTrader'),
      smith: () => renderFeature('renderSmith'),
      work: () => renderFeature('renderWorkBoard'),
      dungeon: () => renderFeature('renderBellVault'),
      crossing: () => renderFeature('renderDryCrossing'),
      marsh: () => typeof renderMarsh === 'function' ? renderMarsh() : renderHome(),
      storehouse: () => renderFeature('renderGreyfenStorehouse'),
      craft: () => renderFeature('renderCrafting'),
      sheet: () => renderFeature('renderSheet'),
      archive: () => renderFeature('renderArchive'),
      routes: renderRoutes,
      quests: () => renderFeature('renderSideContracts'),
      road: renderRoad,
      regions: renderRegions
    });

    function route(view) {
      const key = String(view || '');
      if (key === 'mara' || key === 'brenn' || key === 'oric') {
        return renderNPC(key);
      }
      if (key === 'profile') {
        return typeof renderProfile === 'function' ? renderProfile() : renderHome();
      }
      const destination = destinations[key] || renderHome;
      return destination();
    }

    return Object.freeze({ route });
  }

  window.LegendAshmereNavigationV099 = Object.freeze({ create });
})();
