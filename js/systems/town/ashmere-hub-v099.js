/* LEGEND Ashmere hub v2.40.
 * Ashmere is a scene-led refuge; existing destination catalog, guidance and
 * navigation remain authoritative. Greyfen retains its current regional hub.
 */
(() => {
  function legacyRouteCard(g, icon, esc, serviceArt) {
    const routeIcon = typeof serviceArt === 'function' ? serviceArt('map', icon('route')) : icon('route');
    return `<aside class="ash100-route-strip"><span class="ash100-route-strip-icon">${routeIcon}</span><div class="ash100-route-strip-copy"><span>Current Route</span><strong>${esc(g.title)}</strong><small>${esc(g.text)}</small></div><button class="ash099-btn primary" data-ash-view="${esc(g.view)}">${esc(g.cta)}</button></aside>`;
  }

  function renderGreyfen(context, pl, g) {
    const { escapeHtml: esc, gold, background: bg, imageMarkup: img, regionShopArt, serviceArt, icon, shell, bind } = context;
    const townName = 'Greyfen';
    const tokenCount = Number(pl.inventory?.roadToken || 0);
    const health = Math.max(0, Math.min(100, Math.round(Number(pl.hp || 0) / Math.max(1, Number(pl.maxHp || 1)) * 100)));
    const serviceKeys = { inn: 'inn', trader: 'market', smith: 'blacksmith', people: 'traveler', work: 'jobBoard', road: 'map', dungeon: 'map', regions: 'gatehouse', route: 'map' };
    const townCard = destination => {
      const { view, title, desc, cta, iconKey, featured = false, shopKey } = destination;
      const serviceIcon = serviceKeys[iconKey] && typeof serviceArt === 'function' ? serviceArt(serviceKeys[iconKey], '') : '';
      const shopIcon = !serviceIcon && shopKey && typeof regionShopArt === 'function' ? regionShopArt(shopKey) : '';
      return `<button class="ash100-destination ${featured ? 'featured' : ''}" data-ash-view="${esc(view)}"><span class="ash100-destination-icon">${serviceIcon || shopIcon || icon(iconKey)}</span><span class="ash100-destination-copy"><strong>${esc(title)}</strong><small>${esc(desc)}</small></span><em>${esc(cta)}</em></button>`;
    };
    const catalog = window.LegendAshmereDestinationCatalogV099;
    const destinations = catalog?.forRegion?.(pl.currentRegion, g.view, pl.flags || {});
    if (!Array.isArray(destinations)) {
      shell('<section class="ash099-screen"><h1>Town destinations unavailable</h1><p>The destination catalog did not load. Refresh before continuing.</p></section>');
      return;
    }
    const nav = `<nav class="ash099-footer ash099-topnav" aria-label="Greyfen town navigation"><button class="ash099-footer-item active" data-ash-view="home">${serviceArt('inn', icon('inn'))}<span>Greyfen</span></button><button class="ash099-footer-item" data-ash-view="people">${serviceArt('traveler', icon('people'))}<span>People</span></button><button class="ash099-footer-item" data-ash-view="routes">${serviceArt('map', icon('road'))}<span>Routes</span></button><button class="ash099-footer-item" data-ash-view="archive">${serviceArt('journal', icon('archive'))}<span>Journal</span></button><button class="ash099-footer-item" data-ash-view="profile">${serviceArt('traveler', icon('profile'))}<span>Profile</span></button><button class="ash099-footer-item" data-ash-view="sheet">${serviceArt('traveler', icon('sheet'))}<span>Traveler</span></button></nav>`;
    shell(`
      <section class="ash100-town ash100-town-greyfen">
        <div class="ash100-hero">${img(bg(), townName + ' at dusk')}<div class="ash100-hero-copy"><div class="ash099-kicker">THE LOWLANDS · GREYFEN</div><h1>Greyfen</h1><p>Built on drowned stone, held together by lanterns, and full of old boundary marks.</p></div></div>
        ${nav}
        <div class="ash100-route-dock">${legacyRouteCard(g, icon, esc, serviceArt)}</div>
        <section class="ash100-status" aria-label="Traveler status">
          <div class="ash100-status-traveler"><span>${esc(pl.username || 'Traveler')}</span><small>${esc(pl.className || 'Wanderer')} · Day ${Number(pl.day || 1)}</small></div>
          <div class="ash100-status-health"><span>Health</span><strong>${Number(pl.hp || 0)} / ${Number(pl.maxHp || 0)}</strong><i><b style="width:${health}%"></b></i></div>
          <div class="ash100-status-resources"><span>${tokenCount} Road Token${tokenCount === 1 ? '' : 's'}</span><small>${gold(pl.gold)} · Greyfen</small></div>
        </section>
        <section class="ash100-destination-section"><div class="ash100-section-head"><div><div class="ash099-kicker">LOWLAND DISTRICT</div><h2>Find your footing</h2></div></div><div class="ash100-destinations">${destinations.map(townCard).join('')}</div></section>
      </section>`);
    bind();
  }

  function locationArt(destination, context, esc) {
    const view = String(destination.view || '');
    const art = {
      inn: 'assets/generated/locations/ashmere-inn.webp',
      trader: 'assets/generated/locations/ashmere-market.webp',
      smith: 'assets/generated/locations/ashmere-forge.webp',
      people: context.npcArt?.('oric') || 'assets/generated/npcs/captain-oric.webp',
      work: 'assets/generated/ui/region-shops/ashmere-workbench.webp',
      quests: 'assets/generated/ui/icons/service-milestone.webp',
      dungeon: 'assets/generated/locations/bell-cellar-undercroft.webp',
      regions: 'assets/generated/locations/old-road-south-fork.webp'
    }[view] || '';
    return art
      ? `<img src="${esc(art)}" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="this.hidden=true">`
      : '<span class="ashmere-hub-v240-no-art" aria-hidden="true">✦</span>';
  }

  function renderAshmere(context, pl, g) {
    const { escapeHtml: esc, gold, background: bg, imageMarkup: img, bind } = context;
    const catalog = window.LegendAshmereDestinationCatalogV099;
    const allDestinations = catalog?.forRegion?.('Ashmere', g.view, pl.flags || {});
    if (!Array.isArray(allDestinations)) {
      context.shell('<section class="ash099-screen"><h1>Ashmere is unavailable</h1><p>The town destination catalog did not load. Refresh before continuing.</p></section>');
      return;
    }

    const byView = new Map(allDestinations.map(destination => [String(destination.view), destination]));
    const primaryViews = ['inn', 'trader', 'smith', 'people'];
    const primary = primaryViews.map(view => byView.get(view)).filter(Boolean);
    const secondary = allDestinations.filter(destination =>
      !primaryViews.includes(String(destination.view)) && String(destination.view) !== 'road'
    );
    const condition = Math.max(0, Math.min(100,
      Math.round(Number(pl.hp || 0) / Math.max(1, Number(pl.maxHp || 1)) * 100)
    ));
    const tokens = Math.max(0, Number(pl.inventory?.roadToken || 0));
    const playerName = esc(pl.username || 'Traveler');
    const className = esc(pl.className || 'Wanderer');
    const currentOrder = g.text || 'The road waits beyond the gate. Speak with the people of Ashmere and prepare before you leave.';
    const destinationButton = destination => `
      <button class="ashmere-hub-v240-place" type="button" data-ash-view="${esc(destination.view)}" aria-label="${esc(destination.title)}. ${esc(destination.desc)}">
        <span class="ashmere-hub-v240-place-art">${locationArt(destination, context, esc)}</span>
        <span class="ashmere-hub-v240-place-copy"><strong>${esc(destination.title)}</strong><small>${esc(destination.desc)}</small></span>
        <span class="ashmere-hub-v240-place-arrow" aria-hidden="true">↗</span>
      </button>`;
    const moreButtons = secondary.map(destination => `
      <button class="ashmere-hub-v240-more-place" type="button" data-ash-view="${esc(destination.view)}">
        <span>${esc(destination.title)}</span><small>${esc(destination.desc)}</small><em>${esc(destination.cta)}</em>
      </button>`).join('');

    const host = document.getElementById('root');
    if (!host) return;
    host.innerHTML = `
      <section class="ashmere-hub-v240 ash100-town ash100-town-ashmere" aria-label="Ashmere settlement">
        <div class="ashmere-hub-v240-backdrop" aria-hidden="true">${img(bg(), '')}</div>
        <div class="ashmere-hub-v240-atmosphere" aria-hidden="true"></div>

        <header class="ashmere-hub-v240-header">
          <div class="ashmere-hub-v240-identity">
            <span class="ashmere-hub-v240-kicker">THE BORDERLANDS · FRONTIER SETTLEMENT</span>
            <h1>Ashmere</h1>
            <p>The lamps still burn. Beyond the gate, the Old Road waits.</p>
          </div>
          <section class="ashmere-hub-v240-traveler" aria-label="Traveler condition">
            <div class="ashmere-hub-v240-traveler-name"><span>TRAVELER · DAY ${Math.max(1, Number(pl.day || 1))}</span><strong>${playerName}</strong><small>Level ${Math.max(1, Number(pl.level || 1))} · ${className}</small></div>
            <div class="ashmere-hub-v240-health"><div><span>HEALTH</span><strong>${Math.max(0, Number(pl.hp || 0))} / ${Math.max(1, Number(pl.maxHp || 1))}</strong></div><i><b style="width:${condition}%"></b></i></div>
            <div class="ashmere-hub-v240-purse"><span>COIN</span><strong>${gold(pl.gold)}</strong></div>
            <div class="ashmere-hub-v240-tokens"><span>ROAD TOKENS</span><strong>${tokens}</strong></div>
          </section>
        </header>

        <main class="ashmere-hub-v240-main">
          <section class="ashmere-hub-v240-field-order" aria-labelledby="ashmereHubFieldOrder">
            <span class="ashmere-hub-v240-kicker">THE TOWN'S CURRENT CONCERN</span>
            <h2 id="ashmereHubFieldOrder">${esc(g.title || 'A Place to Begin')}</h2>
            <p>${esc(currentOrder)}</p>
            <button class="ashmere-hub-v240-order-action" type="button" data-ash-view="${esc(g.view || 'people')}">${esc(g.cta || 'Speak with the townsfolk')} <span aria-hidden="true">↗</span></button>
          </section>

          <section class="ashmere-hub-v240-landmarks" aria-labelledby="ashmereHubLandmarks">
            <div class="ashmere-hub-v240-section-heading"><span class="ashmere-hub-v240-kicker">WITHIN THE LANTERN LINE</span><h2 id="ashmereHubLandmarks">Places you know</h2></div>
            <div class="ashmere-hub-v240-place-list">${primary.map(destinationButton).join('')}</div>
          </section>
        </main>

        <footer class="ashmere-hub-v240-footer">
          <button class="ashmere-hub-v240-gate" type="button" data-ash-view="road">
            <span class="ashmere-hub-v240-gate-art">${img('assets/generated/locations/old-road-south-fork.webp', '')}</span>
            <span class="ashmere-hub-v240-gate-copy"><small>BEYOND THE LAST LANTERN</small><strong>Old Road Gate</strong><em>Prepare, then venture into the borderlands</em></span>
            <span class="ashmere-hub-v240-gate-arrow" aria-hidden="true">→</span>
          </button>
          <div class="ashmere-hub-v240-more">
            <button class="ashmere-hub-v240-more-toggle" id="ashmereHubMoreToggle" type="button" aria-expanded="false" aria-controls="ashmereHubMorePlaces">
              <span>Other places in Ashmere</span><small>Work, records, routes and places unlocked by your journey</small><em aria-hidden="true">＋</em>
            </button>
            <div class="ashmere-hub-v240-more-list" id="ashmereHubMorePlaces" hidden>${moreButtons || '<p>There are no other postings to show just now.</p>'}</div>
          </div>
        </footer>
      </section>`;

    const toggle = document.getElementById('ashmereHubMoreToggle');
    const more = document.getElementById('ashmereHubMorePlaces');
    toggle?.addEventListener('click', () => {
      const opening = more?.hidden !== false;
      if (more) more.hidden = !opening;
      toggle?.setAttribute('aria-expanded', String(opening));
      const marker = toggle?.querySelector('em');
      if (marker) marker.textContent = opening ? '−' : '＋';
    });
    bind();
    window.LegendWorldShellV170?.refresh?.();
  }

  function render(context = {}) {
    const { getPlayer } = context;
    if (typeof getPlayer !== 'function' || typeof context.shell !== 'function' || typeof context.bind !== 'function') return;
    const player = getPlayer();
    if (!player) return;
    const guidance = window.LegendAshmereGuidanceV099;
    const goal = guidance?.getGoal?.(player);
    if (!goal) {
      context.shell('<section class="ash099-screen"><h1>Town guidance unavailable</h1><p>The next-step guidance module did not load. Refresh before continuing.</p></section>');
      return;
    }
    if (String(player.currentRegion || player.town || 'Ashmere') === 'Greyfen') {
      return renderGreyfen(context, player, goal);
    }
    return renderAshmere(context, player, goal);
  }

  window.LegendAshmereHubV099 = Object.freeze({ render });
})();
