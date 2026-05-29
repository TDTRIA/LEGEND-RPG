// LEGEND: Roads of Ashmere v0.9.x - Stable Title/Menu & Realm Portal
(() => {
  const TITLE_ASSETS = {
    emblem: 'assets/ui/logos/logo_legend_emblem_v1.png',
    background: 'assets/ui/title_bg_ashmere_road_v1.jpg',
    keyart: 'assets/ui/keyart/title_keyart_ashmere_v1.png'
  };

  // Default accessibility settings
  const defaultSettings = {
    largeText:false,
    boldText:false,
    highContrast:false,
    reducedMotion:false,
    simpleAscii:false,
    spacious:false,
    readableFont:false
  };

  const S = () => window.LegendStorage || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const root = () => document.getElementById('root');
  const profile = () => window.LegendAccountV09x?.getProfile?.() || null;

  // Paths for icon SVGs
  const paths = {
    continue:'M5 12h12M13 6l6 6-6 6',
    new:'M12 5v14M5 12h14',
    settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
    account:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c1.4-4.2 4.5-6.5 8-6.5s6.6 2.3 8 6.5',
    feedback:'M4 5h16v11H8l-4 4V5z',
    delete:'M6 7h12M9 7V5h6v2m-7 3v9m4-9v9m4-9v9',
    text:'M5 7h14M5 12h14M5 17h10',
    bold:'M8 5h5a4 4 0 0 1 0 8H8zM8 13h6a4 4 0 0 1 0 8H8z',
    contrast:'M12 3a9 9 0 1 0 0 18V3z',
    motion:'M4 12h10M10 6l6 6-6 6',
    space:'M4 8h16M4 16h16M8 4v16M16 4v16',
    font:'M4 19l6-14h4l6 14M8 14h8'
  };

  const icon = key => `<span class="game-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${paths[key] || paths.continue}"/></svg></span>`;

  const menuButton = (action, kind, label, desc, ic) =>
    `<button type="button" class="btn ${kind || ''} game-menu-btn" data-title-action="${action}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></button>`;
  const menuLink = (href, label, desc, ic) =>
    `<a class="btn game-menu-btn" href="${href}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></a>`;
  const stat = (label, value) => `<div class="title-status-stat"><span>${label}</span><strong>${value}</strong></div>`;

  // Traveler summary helpers
  function travelerSummary(player) {
    if(!player){
      return `<article class="title-feature-card title-active-card">
                <div class="title-feature-head"><span>Active Traveler</span><strong>No active traveler</strong></div>
                <p class="title-feature-copy">Create a traveler to begin the Ashmere vertical slice and start the first Old Road loop.</p>
                <div class="title-mini-stats">${stat('Hub','Ashmere')}${stat('Route','Old Road')}${stat('Stage','Prologue')}</div>
              </article>`;
    }
    const cls = player.className || player.class || 'Traveler';
    const day = player.day || 1;
    const tokens = Number(player.inventory?.roadToken || 0);
    const town = player.town || 'Ashmere';
    return `<article class="title-feature-card title-active-card">
              <div class="title-feature-head"><span>Active Traveler</span><strong>${esc(player.username)}</strong></div>
              <p class="title-feature-copy">${esc(cls)} - ${esc(town)} - Day ${day}</p>
              <div class="title-mini-stats">${stat('Road Tokens', tokens)}${stat('Town Trust', Number(player.townTrust?.Ashmere || 0))}${stat('Road Danger', Number(player.roadDanger || 1))}</div>
            </article>`;
  }

  function whatsNewPanel(){
    return `<article class="title-feature-card title-news-card">
      <div class="title-feature-head"><span>What's New</span><strong>Ashmere Early Access</strong></div>
      <ul class="title-feature-list">
        <li><strong>Title/Menu Pass:</strong> stable title layering, readable panels, and click-safe menu actions.</li>
        <li><strong>Ashmere Hub:</strong> first-town loop, NPC interactions, and hub polish continue in v0.9.x.</li>
        <li><strong>Road + Combat:</strong> Old Road events and combat updates remain part of the vertical slice focus.</li>
        <li><strong>Accounts:</strong> local profiles and traveler linking are in place while cloud save wiring is prepared.</li>
      </ul>
      <p class="title-news-note">This is still a v0.9.x build - polished Ashmere slice first, 1.0 later.</p>
    </article>`;
  }

  function bulletinPanel(){
    return `<article class="realm-card bulletin-card">
      <div class="realm-card-head"><span>Ashmere Bulletin</span><strong>Early Access Noticeboard</strong></div>
      <ul class="title-feature-list">
        <li><strong>Current Focus:</strong> Ashmere first-town vertical slice and Old Road progression.</li>
        <li><strong>Account Work:</strong> local profiles now, cloud traveler sync next.</li>
        <li><strong>Future Network:</strong> friends, chat, and party features are planned after accounts are stable.</li>
      </ul>
    </article>`;
  }

  function networkPanel(){
    return `<article class="realm-card network-card">
      <div class="realm-card-head"><span>Wayfarer Network</span><strong>Coming Online Later</strong></div>
      <div class="network-grid">
        <div><span>Friends</span><strong>Planned</strong></div>
        <div><span>Chat</span><strong>Offline</strong></div>
        <div><span>Parties</span><strong>Future</strong></div>
        <div><span>Cloud Saves</span><strong>Wiring</strong></div>
      </div>
      <p>This world is being built for identity first. Social systems come after accounts and traveler persistence are solid.</p>
    </article>`;
  }

  // Expose title/menu functions
  window.LegendGameBootstrap = { travelerSummary, whatsNewPanel, bulletinPanel, networkPanel, menuButton, menuLink, stat };
})();
