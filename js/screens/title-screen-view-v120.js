/* LEGEND v0.21.1 - active title menu view with the HTML/CSS wordmark.
 * Owns the main title screen markup and CSS/accessibility hooks.
 * Title state and all menu actions are passed in; audio and navigation stay outside.
 */
(() => {
  const esc = window.LegendHtmlV120.escapeHtml;

  function render(config = {}) {
    const {
      root,
      player,
      name,
      cls,
      town,
      day,
      tokens,
      buildVersion,
      backgroundImage,
      logoImage
    } = config;
    if (!root || typeof root !== 'object') return false;

    root.innerHTML = `
      <div class="title-wrap title-v100 portal-shell portal-v100 v120-title title-v136-rpg">
        <img class="v120-title-backdrop" src="${esc(backgroundImage || 'assets/generated/title/title-ashmere-road.webp')}" alt="" aria-hidden="true" loading="eager" fetchpriority="high" decoding="async" onerror="if(this.dataset.fallbackApplied){this.style.display='none'}else{this.dataset.fallbackApplied='1';this.src='assets/generated/title/title-ashmere-road.webp'}">
        <div class="title-atmosphere" aria-hidden="true"><div class="title-embers"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="title-fog"><i></i><i></i><i></i></div></div>
        <header class="portal100-header">
          <div class="portal100-brand">
            <div><span>LEGEND · THE AWAKENING</span></div>
          </div>
        </header>
        <main class="v120-title-main">
          <section class="v120-title-hero" aria-labelledby="legendTitleAccessibleName">
            <h1 class="v120-title-accessible-name" id="legendTitleAccessibleName">LEGEND: The Awakening</h1>
            <div class="portal100-kicker">A DARK FANTASY RPG</div>
            <div class="v150-logo-lockup" role="img" aria-label="LEGEND: The Awakening"><img class="v120-legend-logo v150-legend-logo" src="${esc(logoImage || 'assets/ui/logos/logo_legend_awakening_wordmark.png?v=0.21.0-local-raster-wordmark')}" alt="" aria-hidden="true" decoding="async" fetchpriority="high" loading="eager" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="v150-wordmark-fallback" hidden><strong>LEGEND</strong><em>THE AWAKENING</em></span></div>
            <p>Monsters press against the borders. Old magic stirs beneath a wounded realm.</p>
            <div class="v120-divider"><span></span><b>THE BORDERLANDS ARE WAKING</b><span></span></div>
            <div class="v120-traveler-line">
              <span class="v120-avatar" aria-hidden="true">${player ? esc(String(name).slice(0,1)).toUpperCase() : '<img src="assets/generated/ui/icons/service-traveler.webp" alt="" loading="lazy" decoding="async">'}</span>
              <div><small>${player ? 'CURRENT TRAVELER' : 'YOUR STORY BEGINS HERE'}</small><strong>${player ? esc(name) : 'No journey has begun'}</strong><span>${player ? `${esc(cls)} · Day ${day} · ${tokens} Road Tokens` : 'Create a traveler and discover what the road remembers.'}</span></div>
            </div>
            <nav class="v120-title-actions v136-rpg-menu" aria-label="Main menu">
              <div class="v136-menu-heading"><span>CHOOSE YOUR PATH</span><i aria-hidden="true"></i></div>
              <div class="v136-menu-list">
                ${player ? `<button class="v136-menu-btn v136-menu-primary" id="continue" data-legend-scene-transition="Returning to your journey" type="button"><span class="v136-menu-icon runway-icon runway-icon-compass" aria-hidden="true"></span><span class="v136-menu-copy"><strong>Continue Journey</strong><small>Return to ${esc(town)}</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>` : '<button class="v136-menu-btn v136-menu-primary" id="newPrimary" data-legend-scene-transition="Shaping a traveler" type="button"><span class="v136-menu-icon runway-icon runway-icon-traveler" aria-hidden="true"></span><span class="v136-menu-copy"><strong>Begin Your Journey</strong><small>Create your traveler</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>'}
                ${player ? '<button class="v136-menu-btn" id="new" data-legend-scene-transition="Shaping a new traveler" type="button"><span class="v136-menu-icon runway-icon runway-icon-inn" aria-hidden="true"></span><span class="v136-menu-copy"><strong>New Traveler</strong><small>Begin a different journey</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>' : ''}
                <button class="v136-menu-btn" id="account" data-legend-scene-transition="Opening traveler profile" type="button"><span class="v136-menu-icon runway-icon runway-icon-journal" aria-hidden="true"></span><span class="v136-menu-copy"><strong>Profile</strong><small>Traveler identity and registry</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>
                <button class="v136-menu-btn" id="settings" data-legend-scene-transition="Opening settings" type="button"><span class="v136-menu-icon runway-icon runway-icon-settings" aria-hidden="true"></span><span class="v136-menu-copy"><strong>Settings</strong><small>Readability and game comfort</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>
                <button class="v136-menu-btn" id="dispatches" data-legend-scene-transition="Opening the roadmap" type="button"><span class="v136-menu-icon runway-icon runway-icon-road" aria-hidden="true"></span><span class="v136-menu-copy"><strong>News &amp; Roadmap</strong><small>Latest updates and what comes next</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>
                <button class="v136-menu-btn v136-menu-credits" id="credits" data-legend-scene-transition="Opening the credits" type="button"><span class="v136-menu-icon runway-icon runway-icon-milestone" aria-hidden="true"></span><span class="v136-menu-copy"><strong>Credits</strong><small>The people and craft behind LEGEND</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>
              </div>
            </nav>
          </section>
        </main>
        <aside class="v140-realm-overview v151-realm-art" aria-label="Realm overview">
          <div class="v140-realm-overview-head"><span>THE KNOWN REALM</span><small>BUILD <b>${esc(buildVersion)}</b></small></div>
          <section class="v151-realm-feature">
            <img src="assets/generated/locations/ashmere-town.webp" alt="Lantern-lit streets of Ashmere" loading="eager" decoding="async">
            <div class="v151-realm-feature-shade"></div>
            <div class="v151-realm-feature-copy"><span>YOUR HOME REGION</span><h2>Ashmere</h2><p>A warm lantern town at the edge of an old and dangerous road.</p></div>
          </section>
          <div class="v151-realm-destinations" aria-label="Nearby destinations">
            <article class="v151-realm-destination">
              <img src="assets/generated/locations/old-road-south-fork.webp" alt="" loading="lazy" decoding="async">
              <div><small>THE FRONTIER</small><strong>The Old Road</strong><span>Expeditions · Discoveries · Encounters</span></div>
            </article>
            <article class="v151-realm-destination">
              <img src="assets/generated/locations/bell-cellar-undercroft.webp" alt="" loading="lazy" decoding="async">
              <div><small>THE FIRST DELVE</small><strong>Bell Cellar</strong><span>Explore below Ashmere’s old archive</span></div>
            </article>
          </div>
          <div class="v140-realm-player-state"><span>YOUR JOURNEY</span><strong>${player ? 'Day ' + day + ' · ' + tokens + (Number(tokens) === 1 ? ' Road Token' : ' Road Tokens') : 'A new journey awaits'}</strong><small>${player ? esc(name) + ' · ' + esc(cls) : 'Shape a traveler and enter the realm.'}</small></div>
        </aside>
        <footer class="portal100-footer portal-footer v120-title-footer"><span>LEGEND: THE AWAKENING</span><span>${esc(buildVersion)} · ASHMERE · OLD ROAD · GREYFEN</span></footer>
      </div>`;
    return true;
  }

  window.LegendTitleScreenViewV120 = Object.freeze({ render });
})();
