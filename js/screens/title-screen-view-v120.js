/* LEGEND v0.20.36 - active title menu view.
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
        <img class="v120-title-backdrop" src="${esc(backgroundImage || 'assets/title/title_bg_ashmere_road_v089.jpg')}" alt="" aria-hidden="true" loading="eager" fetchpriority="high" decoding="async" onerror="if(this.dataset.fallbackApplied){this.style.display='none'}else{this.dataset.fallbackApplied='1';this.src='assets/title/title_bg_ashmere_road_v089.jpg'}">
        <div class="title-atmosphere" aria-hidden="true"><div class="title-embers"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="title-fog"><i></i><i></i><i></i></div></div>
        <header class="portal100-header">
          <div class="portal100-brand">
            <div><span>ASHMERE · THE OLD ROAD</span></div>
          </div>
          <img class="v136-corner-sigil" src="assets/ui/icons/awakening-sigil.svg" alt="" aria-hidden="true" onerror="this.style.display='none'">
        </header>
        <main class="v120-title-main">
          <section class="v120-title-hero" aria-labelledby="legendTitleAccessibleName">
            <h1 class="v120-title-accessible-name" id="legendTitleAccessibleName">LEGEND: The Awakening</h1>
            <div class="portal100-kicker">A DARK FANTASY RPG</div>
            <img class="v120-legend-logo" src="${esc(logoImage || 'assets/ui/logos/logo_legend_awakening_wordmark.svg')}" alt="" aria-hidden="true" decoding="async" onerror="this.style.display='none'">
            <p>Monsters press against the borders. Old magic stirs beneath a wounded realm.</p>
            <div class="v120-divider"><span></span><b>THE BORDERLANDS ARE WAKING</b><span></span></div>
            <div class="v120-traveler-line">
              <span class="v120-avatar" aria-hidden="true">${player ? esc(String(name).slice(0,1)).toUpperCase() : '✦'}</span>
              <div><small>${player ? 'CURRENT TRAVELER' : 'YOUR STORY BEGINS HERE'}</small><strong>${player ? esc(name) : 'No journey has begun'}</strong><span>${player ? `${esc(cls)} · Day ${day} · ${tokens} Road Tokens` : 'Create a traveler and discover what the road remembers.'}</span></div>
            </div>
            <nav class="v120-title-actions v136-rpg-menu" aria-label="Main menu">
              <div class="v136-menu-heading"><span>CHOOSE YOUR PATH</span><i aria-hidden="true"></i></div>
              <div class="v136-menu-list">
                ${player ? `<button class="v136-menu-btn v136-menu-primary" id="continue" type="button"><span class="v136-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.8 14.5 9.5 21.2 12 14.5 14.5 12 21.2 9.5 14.5 2.8 12 9.5 9.5Z"/></svg></span><span class="v136-menu-copy"><strong>Continue Journey</strong><small>Return to ${esc(town)}</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>` : '<button class="v136-menu-btn v136-menu-primary" id="newPrimary" type="button"><span class="v136-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.8 14.5 9.5 21.2 12 14.5 14.5 12 21.2 9.5 14.5 2.8 12 9.5 9.5Z"/></svg></span><span class="v136-menu-copy"><strong>Begin Your Journey</strong><small>Create your traveler</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>'}
                ${player ? '<button class="v136-menu-btn" id="new" type="button"><span class="v136-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10" cy="7.5" r="3"/><path d="M4 19c.5-3.1 2.5-4.8 6-4.8 1.7 0 3 .4 4 1.2M18 14v7M14.5 17.5h7"/></svg></span><span class="v136-menu-copy"><strong>New Traveler</strong><small>Begin a different journey</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>' : ''}
                <button class="v136-menu-btn" id="account" type="button"><span class="v136-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c.7-3.6 3-5.3 7-5.3s6.3 1.7 7 5.3"/></svg></span><span class="v136-menu-copy"><strong>Profile</strong><small>Traveler identity and registry</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>
                <button class="v136-menu-btn" id="settings" type="button"><span class="v136-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"/></svg></span><span class="v136-menu-copy"><strong>Settings</strong><small>Readability and game comfort</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>
                <button class="v136-menu-btn v136-menu-credits" id="credits" type="button"><span class="v136-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3.5h10.5A1.5 1.5 0 0 1 18 5v15.5H7.5A1.5 1.5 0 0 1 6 19Z"/><path d="M6 6H4.8A1.8 1.8 0 0 0 3 7.8v11.4A1.8 1.8 0 0 0 4.8 21H18M9 8h5M9 11.5h5"/></svg></span><span class="v136-menu-copy"><strong>Credits</strong><small>The people and craft behind LEGEND</small></span><span class="v136-menu-arrow" aria-hidden="true">›</span></button>
              </div>
            </nav>
          </section>
        </main>
        <footer class="portal100-footer portal-footer v120-title-footer"><span>LEGEND: THE AWAKENING</span><span>${esc(buildVersion)} · ASHMERE · OLD ROAD · GREYFEN</span></footer>
      </div>`;
    return true;
  }

  window.LegendTitleScreenViewV120 = Object.freeze({ render });
})();
