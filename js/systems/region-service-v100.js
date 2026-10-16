/* LEGEND v0.20.36 - region unlock/travel rules.
 * Owns region requirements, token spending, fares, location changes, and travel
 * memories. The controller retains public entry points and injects storage/rendering.
 */
(() => {
  function create(context = {}) {
    const { getPlayer, savePlayer, getRegions, renderMessage, formatGold } = context;
    if (typeof getPlayer !== 'function' || typeof savePlayer !== 'function' ||
        typeof getRegions !== 'function' || typeof renderMessage !== 'function' ||
        typeof formatGold !== 'function') return null;

    function unlocked(player) {
      return Array.isArray(player.discoveredRegions) ? player.discoveredRegions : ['Ashmere'];
    }

    function unlock(id) {
      const player = getPlayer();
      const region = (getRegions() || {})[id];
      if (!player || !region) return;

      const known = unlocked(player);
      if (known.includes(id)) return renderMessage('That region is already open.');
      if (region.requiresRegion && !known.includes(region.requiresRegion)) {
        const required = (getRegions() || {})[region.requiresRegion]?.name || region.requiresRegion;
        return renderMessage('Unlock ' + required + ' before opening ' + region.name + '.');
      }
      if (region.requiresFlag && !player.flags?.[region.requiresFlag]) {
        return renderMessage('Complete ' + (region.requiresFlagLabel || region.requiresFlag) + ' before opening ' + region.name + '.');
      }
      if (region.available === false) {
        return renderMessage(region.name + ' is mapped, but its playable region is still in development. Greyfen remains the active frontier.');
      }

      const cost = Number(region.unlockTokens || 0);
      if (Number(player.inventory?.roadToken || 0) < cost) {
        return renderMessage('The road ledger is still short on tokens.');
      }

      player.inventory.roadToken -= cost;
      player.discoveredRegions = known.concat(id);
      player.currentRegion = id;
      player.stats = player.stats || {};
      player.stats.regionsUnlocked = Number(player.stats.regionsUnlocked || 0) + 1;
      player.memories = player.memories || [];
      player.memories.push('You opened the road to ' + region.name + '.');
      savePlayer(player);
      return renderMessage(region.name + ' is now part of your road network. The first crossing is yours; future crossings cost gold.');
    }

    function travel(id) {
      const player = getPlayer();
      const region = (getRegions() || {})[id];
      if (!player || !region) return;

      if (!unlocked(player).includes(id)) return renderMessage('That road is still closed.');
      if (player.currentRegion === id) return renderMessage('You are already in ' + region.name + '.');
      if (region.available === false) {
        return renderMessage(region.name + ' is not playable yet. Continue from Greyfen while its next region is built.');
      }

      const fare = Number(region.travelCost || 0);
      if (Number(player.gold || 0) < fare) {
        return renderMessage('You need ' + formatGold(fare) + ' to make that crossing.');
      }

      player.gold -= fare;
      player.currentRegion = id;
      player.memories = player.memories || [];
      player.memories.push('You traveled to ' + region.name + ' for ' + formatGold(fare) + '.');
      savePlayer(player);
      return renderMessage('You arrive in ' + region.name + '. The road network is open in both directions.');
    }

    return Object.freeze({ unlock, travel });
  }

  window.LegendRegionServiceV100 = Object.freeze({ create });
})();
