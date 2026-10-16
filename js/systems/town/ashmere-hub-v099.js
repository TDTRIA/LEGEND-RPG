/* LEGEND v0.20.36 - Ashmere and Greyfen town hub.
 * Owns the home-screen goal choice, destination cards, status and town navigation.
 * Screen helpers are injected by the existing Ashmere facade to preserve markup and routes.
 */
(() => {


  function currentRouteCard(g, icon, esc){
    return `<aside class="ash100-route-strip"><span class="ash100-route-strip-icon">${icon('route')}</span><div class="ash100-route-strip-copy"><span>Current Route</span><strong>${esc(g.title)}</strong><small>${esc(g.text)}</small></div><button class="ash099-btn primary" data-ash-view="${esc(g.view)}">${esc(g.cta)}</button></aside>`;
  }
  function terminalNav(pl, icon){
    const greyfen=String(pl?.currentRegion||'Ashmere')==='Greyfen',townLabel=greyfen?'Greyfen':'Town';
    const ariaLabel=greyfen?'Greyfen town navigation':'Ashmere terminal navigation';
    return `<nav class="ash099-footer ash099-topnav" aria-label="${ariaLabel}"><button class="ash099-footer-item active" data-ash-view="home">${icon('inn')}<span>${townLabel}</span></button><button class="ash099-footer-item" data-ash-view="people">${icon('people')}<span>People</span></button><button class="ash099-footer-item" data-ash-view="routes">${icon('road')}<span>Routes</span></button><button class="ash099-footer-item" data-ash-view="archive">${icon('archive')}<span>Journal</span></button><button class="ash099-footer-item" data-ash-view="profile">${icon('profile')}<span>Profile</span></button><button class="ash099-footer-item" data-ash-view="sheet">${icon('sheet')}<span>Traveler</span></button></nav>`;
  }

  function render(context = {}) {
    const { getPlayer, escapeHtml: esc, gold, background: bg, imageMarkup: img, regionShopArt, icon, shell, bind } = context;
    if (typeof getPlayer !== 'function' || typeof shell !== 'function' || typeof bind !== 'function') return;
    const p = getPlayer;
    const pl=p(); if(!pl) return;
    const guidance = window.LegendAshmereGuidanceV099;
    const g = guidance?.getGoal?.(pl);
    if (!g) {
      shell('<section class="ash099-screen"><h1>Town guidance unavailable</h1><p>The next-step guidance module did not load. Refresh before continuing.</p></section>');
      return;
    }
    const isGreyfen=String(pl.currentRegion||'Ashmere')==='Greyfen';
    const townName=isGreyfen?'Greyfen':'Ashmere';
    const tokenCount=Number(pl.inventory?.roadToken||0);
    const health=Math.max(0,Math.min(100,Math.round(Number(pl.hp||0)/Math.max(1,Number(pl.maxHp||1))*100)));
    const townCard = destination => {
      const { view, title, desc, cta, iconKey, featured = false, shopKey } = destination;
      const shopIcon = shopKey && typeof regionShopArt === 'function' ? regionShopArt(shopKey) : '';
      return `<button class="ash100-destination ${featured?'featured':''}" data-ash-view="${esc(view)}"><span class="ash100-destination-icon">${shopIcon||icon(iconKey)}</span><span class="ash100-destination-copy"><strong>${esc(title)}</strong><small>${esc(desc)}</small></span><em>${esc(cta)}</em></button>`;
    };
    const destinationCatalog = window.LegendAshmereDestinationCatalogV099;
    const destinationData = destinationCatalog?.forRegion?.(pl.currentRegion, g.view, pl.flags || {});
    if (!Array.isArray(destinationData)) {
      shell('<section class="ash099-screen"><h1>Town destinations unavailable</h1><p>The destination catalog did not load. Refresh before continuing.</p></section>');
      return;
    }
    const destinations = destinationData.map(townCard).join('');
    shell(`
      <section class="ash100-town ${isGreyfen?'ash100-town-greyfen':'ash100-town-ashmere'}">
        <div class="ash100-hero">${img(bg(),townName+' at dusk')}<div class="ash100-hero-copy"><div class="ash099-kicker">${isGreyfen?'THE LOWLANDS · GREYFEN':'ROADS OF ASHMERE'}</div><h1>${townName}</h1><p>${isGreyfen?'Built on drowned stone, held together by lanterns, and full of old boundary marks.':'Warm lights. Open roads. A place to return to.'}</p></div></div>
        <div class="ash100-route-dock">${currentRouteCard(g, icon, esc)}</div>
        <section class="ash100-status" aria-label="Traveler status">
          <div class="ash100-status-traveler"><span>${esc(pl.username||'Traveler')}</span><small>${esc(pl.className||'Wanderer')} · Day ${Number(pl.day||1)}</small></div>
          <div class="ash100-status-health"><span>Health</span><strong>${Number(pl.hp||0)} / ${Number(pl.maxHp||0)}</strong><i><b style="width:${health}%"></b></i></div>
          <div class="ash100-status-resources"><span>${tokenCount} Road Tokens</span><small>${gold(pl.gold)} · ${townName}${tokenCount>=5?' · Greyfen open':''}</small></div>
        </section>
        <section class="ash100-destination-section">
          <div class="ash100-section-head"><div><div class="ash099-kicker">${isGreyfen?'LOWLAND DISTRICT':'ASHMERE'}</div><h2>${isGreyfen?'Find your footing':'Where next?'}</h2></div></div>
          <div class="ash100-destinations">${destinations}</div>
        </section>
        ${terminalNav(pl, icon)}
      </section>`);
    bind();
  }

  window.LegendAshmereHubV099 = Object.freeze({ render });
})();
