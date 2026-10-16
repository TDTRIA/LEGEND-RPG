/* LEGEND Ashmere commerce facade.
 * Routes existing town commerce entry points to market, crafting, and forge owners.
 * Callers keep using LegendAshmereCommerceV099.render(context, view, argument).
 */
(() => {
  function render(context, view, argument) {
    const service = view === 'trader'
      ? window.LegendAshmereMarketV099
      : view === 'crafting'
        ? window.LegendAshmereCraftingV099
        : view === 'smith'
          ? window.LegendAshmereForgeV099
          : null;

    if (service?.render) {
      if (!context) return;
      const moduleContext = {
        ...context,
        openTradingPost: () => render(context, 'trader', 'buy'),
        openCrafting: feedback => render(context, 'crafting', feedback || '')
      };
      return service.render(moduleContext, argument);
    }

    if (typeof context?.head === 'function' && typeof context?.screen === 'function') {
      const label = view === 'trader' ? 'Trading Post' : view === 'crafting' ? 'Crafting Bench' : 'Blacksmith';
      context.screen(
        context.head('Town Systems', label, 'The commerce module did not load.', '', 'notice'),
        '<p>This service is unavailable. Refresh before continuing.</p>'
      );
    }
  }

  window.LegendAshmereCommerceV099 = Object.freeze({ render });
})();
