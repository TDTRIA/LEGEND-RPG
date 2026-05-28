// LEGEND: Roads of Ashmere v0.9.x - Stable Title/Menu Bootstrap
// Owns title/start/settings/account entry. Ashmere is owned by ashmere-controller-v099.js.
(() => {
  const TITLE_ASSETS = {
    background: 'assets/title/title_bg_ashmere_road_v1.jpg',
    keyart: 'assets/title/title_keyart_ashmere_v1.png',
    emblem: 'assets/ui/logos/logo_legend_emblem_v1.png'
  };

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
  const loadPlayer = () => S().loadPlayer ? S().loadPlayer() : null;
  const saveSettings = settings => { if(S().saveSettings) S().saveSettings(settings); };
  const loadSettings = () => ({...defaultSettings, ...(S().loadSettings ? S().loadSettings() : {})});
  const applySettings = () => { if(S().applySettings) S().applySettings(); };
  const profile = () => window.LegendAccountV09x?.getProfile?.() || null;

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

  function menuButton(action, kind, label, desc, ic){
    return `<button type="button" class="btn ${kind || ''} game-menu-btn" data-title-action="${action}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></button>`;
  }

  function menuLink(href, label, desc, ic){
    return `<a class="btn game-menu-btn" href="${href}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></a>`;
  }

  const stat = (label, value) => `<div class="title-status-stat"><span>${label}</span><strong>${value}</strong></div>`;

  function accountSummary(profileData){
    const connected = !!window.LegendSupabaseV09x?.client;
    if(profileData){
      return `<strong>${esc(profileData.displayName || 'Local Profile')}</strong><em>${connected ? 'Supabase connected' : 'Local profile ready - cloud hook pending'}</em>`;
    }
    return `<strong>${connected ? 'Supabase Ready' : 'Local Play Ready'}</strong><em>Open Account / Profile to claim a profile name and prep traveler sync.</em>`;
  }

  function travelerSummary(player){
    if(!player){
      return `<article class="title-feature-card title-active-card"><div class="title-feature-head"><span>Active Traveler</span><strong>No active traveler</strong></div><p class="title-feature-copy">Create a traveler to begin the Ashmere vertical slice and start the first Old Road loop.</p><div class="title-mini-stats">${stat('Hub','Ashmere')}${stat('Route','Old Road')}${stat('Stage','Prologue')}</div></article>`;
    }
    const cls = player.className || player.class || 'Traveler';
    const day = player.day || 1;
    const tokens = Number(player.inventory?.roadToken || 0);
    const town = player.town || 'Ashmere';
    return `<article class="title-feature-card title-active-card"><div class="title-feature-head"><span>Active Traveler</span><strong>${esc(player.username || 'Unnamed Traveler')}</strong></div><p class="title-feature-copy">${esc(cls)} - ${esc(town)} - Day ${day}</p><div class="title-mini-stats">${stat('Road Tokens', tokens)}${stat('Town Trust', Number(player.townTrust?.Ashmere || 0))}${stat('Road Danger', Number(player.roadDanger || 1))}</div></article>`;
  }

  function whatsNewPanel(){
    return `<article class="title-feature-card title-news-card"><div class="title-feature-head"><span>What's New</span><strong>Ashmere Early Access</strong></div><ul class="title-feature-list"><li><strong>Title/Menu Pass:</strong> stable title layering, readable panels, and click-safe menu actions.</li><li><strong>Ashmere Hub:</strong> first-town loop, NPC interactions, and hub polish continue in v0.9.x.</li><li><strong>Road + Combat:</strong> Old Road events and combat updates remain part of the vertical slice focus.</li><li><strong>Accounts:</strong> local profiles and traveler linking are in place while cloud save wiring is prepared.</li></ul><p class="title-news-note">This is still a v0.9.x build - polished Ashmere slice first, 1.0 later.</p></article>`;
  }

  function bindTitleMenu(){
    const screen = document.querySelector('.title-v09x-final');
    if(!screen) return;
    screen.addEventListener('click', event => {
      const trigger = event.target.closest('[data-title-action]');
      if(!trigger) return;
      event.preventDefault();

      const action = trigger.dataset.titleAction;
      if(action === 'continue') return continueGame();
      if(action === 'account') return account();
      if(action === 'new') return newTraveler();
      if(action === 'settings') return settings();
      if(action === 'delete'){
        if(confirm('Delete local browser save?')){
          S().deleteSaves?.();
          title();
        }
      }
    });
  }

  function title(){
    applySettings();

    const mount = root();
    if(!mount) return;

    const player = loadPlayer();
    const prof = profile();

    mount.innerHTML = `
      <div class="title-wrap title-v09x-final" style="--title-bg-image:url('${TITLE_ASSETS.background}')">
        <div class="title-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="title-fog" aria-hidden="true"><i></i><i></i><i></i></div>
        <section class="title-card title-card-final" aria-label="LEGEND Roads of Ashmere title menu">
          <div class="title-hero-panel">
            <div class="title-brand-mark">
              <img src="${TITLE_ASSETS.emblem}" alt="LEGEND emblem" onerror="this.style.display='none'">
              <span class="title-brand-text"><strong>Roads of Ashmere</strong><span>v0.9.x Ashmere vertical slice</span></span>
            </div>
            <div class="title-hero-grid">
              <div class="title-copy">
                <div class="kicker">LEGEND - Dark Medieval Fantasy RPG</div>
                <h1 class="game-title">LEGEND</h1>
                <p class="title-subtitle">Roads of Ashmere</p>
                <p class="title-lore">Ashmere waits at the edge of the Old Road. Choose a traveler, gather proof, and return before the fog remembers your name.</p>
                <div class="title-pill-row"><span class="title-pill">Ashmere Main Hub</span><span class="title-pill">Old Road Loop</span><span class="title-pill">v0.9.x Polish</span></div>
              </div>
              <figure class="title-keyart">
                <img src="${TITLE_ASSETS.keyart}" alt="Roads of Ashmere traveler key art" loading="eager" decoding="async" onerror="this.closest('.title-keyart').classList.add('is-missing')">
                <figcaption class="title-keyart-caption"><strong>ASHMERE</strong><span>Lantern town at the edge of the Old Road</span></figcaption>
                <div class="title-keyart-fallback" aria-hidden="true"><div class="title-keyart-fallback-mark">ASHMERE</div><p>Key art missing. Check <code>${TITLE_ASSETS.keyart}</code>.</p></div>
              </figure>
            </div>
            <div class="title-status-grid">
              <article class="title-status-card title-status-account"><span>Account</span>${accountSummary(prof)}</article>
              <article class="title-status-card"><span>Hub</span><strong>Ashmere</strong><em>Lantern Town of the Old Road</em></article>
              <article class="title-status-card"><span>Build</span><strong>v0.9.x</strong><em>Polish pass - not 1.0</em></article>
            </div>
            <div class="title-bottom-grid">${travelerSummary(player)}${whatsNewPanel()}</div>
          </div>
          <aside class="title-menu-panel title-menu-final" aria-label="Main menu">
            <div class="title-menu-stamp">Early Access</div>
            <h2>Main Menu</h2>
            <div class="actions">
              ${player ? menuButton('continue','primary',`Continue as ${esc(player.username || 'Traveler')}`,'Return to Ashmere and resume the first-town loop.','continue') : ''}
              ${menuButton('account','', 'Account / Profile', prof ? 'Manage your profile, active traveler, and cloud-save readiness.' : 'Create a local profile and prepare cloud travelers.', 'account')}
              ${menuButton('new','', 'New Traveler','Create a new traveler for Roads of Ashmere.','new')}
              ${menuButton('settings','', 'Settings / Accessibility','Adjust readability, contrast, spacing, and motion.','settings')}
              ${menuLink('feedback.html','Playtest Feedback','Send bugs, balance notes, and first-town impressions.','feedback')}
              ${player ? menuButton('delete','danger','Delete Local Save','Clear the local browser traveler save.','delete') : ''}
            </div>
            <p class="small title-footer">Cloud saves remain in v0.9.x wiring; local traveler progress stays fully playable.</p>
          </aside>
        </section>
      </div>`;

    bindTitleMenu();
  }

  function continueGame(){
    const player = loadPlayer();
    if(!player) return title();

    player.town = 'Ashmere';
    S().savePlayer?.(player);

    if(window.LegendAshmereV099?.renderAshmere) return window.LegendAshmereV099.renderAshmere();

    const mount = root();
    if(!mount) return;
    mount.innerHTML = `<div class="shell"><section class="panel"><h2>Ashmere is loading...</h2><p>Try a hard refresh if this screen does not change.</p><div class="actions"><button class="btn primary" id="backTitle" type="button">Back to Title</button></div></section></div>`;
    document.getElementById('backTitle').onclick = title;
  }

  function newTraveler(){
    if(window.LegendBeginningV094?.startCreation) return window.LegendBeginningV094.startCreation();

    const mount = root();
    if(!mount) return;
    mount.innerHTML = `<div class="shell"><section class="panel"><h2>Traveler creation is loading...</h2><p>Try a hard refresh if this screen does not change.</p><div class="actions"><button class="btn primary" id="backTitle" type="button">Back to Title</button></div></section></div>`;
    document.getElementById('backTitle').onclick = title;
  }

  function account(){
    if(window.LegendAccountV09x?.renderAccount) return window.LegendAccountV09x.renderAccount();

    const mount = root();
    if(!mount) return;
    mount.innerHTML = `<main class="account09x"><div class="account09x-wrap"><section class="account09x-hero"><div class="account09x-hero-content"><div class="account09x-kicker">Account System</div><h1>Profile</h1><p>Account screens are loading. Try a hard refresh if this screen does not change.</p></div></section><div class="account09x-actions"><button class="account09x-btn primary" id="backTitle" type="button">Back to Title</button></div></div></main>`;
    document.getElementById('backTitle').onclick = title;
  }

  function settings(){
    const current = loadSettings();
    const mount = root();
    if(!mount) return;

    const rows = [
      ['largeText','Large Text','Increases base UI text size for easier reading.','text'],
      ['boldText','Bold Text','Adds stronger text weight across menus and panels.','bold'],
      ['highContrast','High Contrast','Boosts contrast for darker rooms and bright text.','contrast'],
      ['reducedMotion','Reduced Motion','Reduces animation and motion effects where supported.','motion'],
      ['spacious','Spacious Layout','Adds breathing room for touch and mobile play.','space'],
      ['readableFont','Readable Font','Uses a simpler font treatment for long reading sessions.','font']
    ];

    mount.innerHTML = `<main class="settings09x" style="--title-bg-image:url('${TITLE_ASSETS.background}')"><div class="settings09x-wrap"><section class="settings09x-hero"><div class="settings09x-kicker">LEGEND v0.9.x</div><h1>Settings</h1><p>Adjust readability and comfort for this device. These options should feel like part of the game, not a browser form.</p></section><section class="settings09x-grid">${rows.map(([key,label,desc,ic]) => `<label class="settings09x-toggle"><input type="checkbox" data-setting="${key}" ${current[key] ? 'checked' : ''}><span class="settings09x-setting-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${paths[ic]}"/></svg></span><span><strong>${label}</strong><span>${desc}</span></span><i class="settings09x-switch"></i></label>`).join('')}</section><p class="settings09x-note"><strong>Note:</strong> Accessibility settings do not change your save file, stats, or progress. They only affect presentation on this device.</p><div class="settings09x-actions"><button class="settings09x-btn primary" id="saveSettings" type="button">Save Settings</button><button class="settings09x-btn" id="backTitle" type="button">Back to Title</button>${loadPlayer() ? '<button class="settings09x-btn" id="backGame" type="button">Back to Ashmere</button>' : ''}</div></div></main>`;

    document.getElementById('saveSettings').onclick = () => {
      const next = {...current};
      document.querySelectorAll('[data-setting]').forEach(input => next[input.dataset.setting] = input.checked);
      saveSettings(next);
      applySettings();
      settings();
    };

    document.getElementById('backTitle').onclick = title;
    const backGame = document.getElementById('backGame');
    if(backGame) backGame.onclick = continueGame;
  }

  window.LegendGameBootstrap = { title, continueGame, newTraveler, settings, account };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', title);
  else title();
})();