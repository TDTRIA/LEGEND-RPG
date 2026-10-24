/* LEGEND v0.20.36 - regional map presentation.
 * Renders the region ledger and binds user intent to injected controller callbacks.
 * Unlocking, travel fares, rewards, and saving remain in LegendRegionsV100.
 */
(() => {
  function create(config = {}) {
    const {
      root,
      getPlayer,
      getRegions,
      getAssets,
      escapeHtml: esc,
      formatGold: gold,
      onBack,
      onUnlock,
      onTravel
    } = config;

    if (typeof root !== 'function' || typeof getPlayer !== 'function' ||
        typeof getRegions !== 'function' || typeof esc !== 'function' ||
        typeof gold !== 'function') return null;

    function unlocked(player) {
      return Array.isArray(player.discoveredRegions) ? player.discoveredRegions : ['Ashmere'];
    }

    function card(player, region) {
      const regions = getRegions() || {};
      const known = unlocked(player);
      const has = known.includes(region.id);
      const current = player.currentRegion === region.id;
      const tokens = Number(player.inventory?.roadToken || 0);
      const cost = Number(region.unlockTokens || 0);
      const travel = Number(region.travelCost || 0);
      const requirement = region.requiresRegion ? regions[region.requiresRegion] : null;
      const regionMet = !region.requiresRegion || known.includes(region.requiresRegion);
      const flagMet = !region.requiresFlag || Boolean(player.flags?.[region.requiresFlag]);
      const available = region.available !== false;

      let action = '';
      if (current) action = '<span class="reg100-state current">You are here</span>';
      else if (!regionMet) action = '<span class="reg100-state">Requires ' + esc(requirement?.name || region.requiresRegion) + ' first</span>';
      else if (!flagMet) action = '<span class="reg100-state">Complete ' + esc(region.requiresFlagLabel || region.requiresFlag) + ' first</span>';
      else if (!available) action = '<span class="reg100-state">In development</span>';
      else if (!has && cost > 0) {
        action = '<button class="reg100-btn" data-unlock="' + esc(region.id) + '">' +
          (tokens >= cost ? 'Unlock' : 'Need ' + Math.max(0, cost - tokens) + ' more token' + (cost - tokens === 1 ? '' : 's')) +
          '</button>';
      } else if (!has) action = '<span class="reg100-state">Locked</span>';
      else if (!available) action = '<span class="reg100-state">In development</span>';
      else action = '<button class="reg100-btn" data-travel="' + esc(region.id) + '">' +
        (travel ? 'Travel • ' + gold(travel) : 'Enter') + '</button>';

      const meta = has ? (current ? 'Current location' : 'Unlocked') :
        (!regionMet ? 'First unlock ' + esc(requirement?.name || region.requiresRegion) :
        !flagMet ? 'Complete ' + esc(region.requiresFlagLabel || region.requiresFlag) :
        !available ? 'In development' : 'Unlock: ' + cost + ' Road Tokens');
      const assets = typeof getAssets === 'function' ? (getAssets() || {}) : {};
      const scenePath = region.id === 'Ashmere'
        ? (assets.locations?.ashmereMain || assets.title?.background)
        : region.id === 'Greyfen'
          ? (assets.locations?.greyfenMarshWalkway || assets.locations?.greyfenMain)
          : '';
      const sceneAlt = region.id === 'Ashmere'
        ? 'Lantern-lit medieval streets of Ashmere'
        : 'Raised walkway across the Greyfen marsh';
      const scene = scenePath ?
        '<div class="reg100-card-scene"><img src="' + esc(scenePath) + '" alt="' + esc(sceneAlt) + '" loading="lazy" decoding="async" onerror="this.parentElement.remove()"></div>' : '';

      return '<article class="reg100-card ' + (has ? 'unlocked ' : 'locked ') + (current ? 'current' : '') + '">' +
        scene + '<div class="reg100-card-top"><span class="reg100-mark"><img src="' + (has ? 'assets/generated/ui/icons/service-milestone.webp' : 'assets/generated/ui/icons/service-gatehouse.webp') + '" alt="" loading="lazy" decoding="async"></span><div>' +
        '<div class="reg100-kicker">' + (region.type === 'home' ? 'HOME REGION' : 'REGION') + '</div><h2>' + esc(region.name) +
        '</h2></div></div><p>' + esc(region.description || 'A place beyond the known road.') + '</p>' +
        '<div class="reg100-meta">' + meta + (has && !current && available ? ' • Fare ' + travel + 'g' : '') +
        '</div>' + action + '</article>';
    }

    function render(note = '') {
      const player = getPlayer();
      const host = root();
      if (!player || !host) return;
      const tokens = Number(player.inventory?.roadToken || 0);
      const known = unlocked(player);
      const regions = Object.values(getRegions() || {});

      host.innerHTML = '<main class="reg100"><div class="reg100-wrap"><section class="reg100-screen">' +
        '<header class="reg100-head"><div class="reg100-kicker">THE REALM</div><h1>Roads & Regions</h1>' +
        '<p>Road Tokens open new lands when they are ready to play. Greyfen is the active frontier; later regions stay on the ledger until their story and town hub are built.</p>' +
        '<div class="reg100-wallet"><div><strong>' + tokens + '</strong><span>Road Tokens</span></div><div><strong>' + gold(player.gold) +
        '</strong><span>Gold</span></div><div><strong>' + known.length + '</strong><span>Regions Known</span></div></div></header>' +
        '<section class="reg100-panel"><div class="reg100-title"><div><div class="reg100-kicker">TRAVEL NETWORK</div>' +
        '<h2>Where will the road take you?</h2></div><span>Unlock • Travel • Return</span></div><div class="reg100-grid">' +
        regions.map(region => card(player, region)).join('') + '</div></section>' +
        '<div class="reg100-actions"><button class="reg100-btn wide" id="regBack">Back to Ashmere</button></div>' +
        (note ? '<div class="reg100-note">' + esc(note) + '</div>' : '') + '</section></div></main>';

      const backButton = host.querySelector('#regBack');
      if (backButton) {
        backButton.textContent = String(player.currentRegion || 'Ashmere') === 'Greyfen' ? 'Back to Greyfen' : 'Back to Ashmere';
        backButton.addEventListener('click', () => onBack?.());
      }
      host.querySelectorAll('[data-unlock]').forEach(button => {
        button.addEventListener('click', () => onUnlock?.(button.dataset.unlock));
      });
      host.querySelectorAll('[data-travel]').forEach(button => {
        button.addEventListener('click', () => onTravel?.(button.dataset.travel));
      });
    }

    return Object.freeze({ render });
  }

  window.LegendRegionViewV100 = Object.freeze({ create });
})();
