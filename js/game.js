// LEGEND: Roads of Ashmere v0.9.x - Slim Game Bootstrap
// Owns title/start/settings/account entry. Ashmere is owned by ashmere-controller-v099.js.
(() => {
  const S = () => window.LegendStorage || {};
  const TITLE_GATE_KEY = 'legend-roads-of-ashmere-title-gate-v09x';
  const AUDIO = {
    ambience:'assets/audio/title/ashmere_ambience_loop.mp3',
    hover:'assets/audio/ui/ui_hover_soft.ogg',
    confirm:'assets/audio/ui/ui_confirm_gate.ogg'
  };
  let titleAmbience = null;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function root(){ return document.getElementById('root'); }
  function loadPlayer(){ return S().loadPlayer ? S().loadPlayer() : null; }
  function saveSettings(settings){ if(S().saveSettings) S().saveSettings(settings); }
  function loadSettings(){ return S().loadSettings ? S().loadSettings() : { largeText:false, boldText:false, highContrast:false, reducedMotion:false, simpleAscii:false, spacious:false, readableFont:false }; }
  function applySettings(){ if(S().applySettings) S().applySettings(); }
  function profile(){ return window.LegendAccountV09x?.getProfile?.() || null; }

  function playUi(kind){
    const src = AUDIO[kind];
    if(!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = kind === 'hover' ? 0.16 : 0.26;
      audio.play().catch(() => {});
    } catch {}
  }

  function startAmbience(){
    if(titleAmbience || !AUDIO.ambience) return;
    try {
      titleAmbience = new Audio(AUDIO.ambience);
      titleAmbience.loop = true;
      titleAmbience.volume = 0.28;
      titleAmbience.play().catch(() => { titleAmbience = null; });
    } catch { titleAmbience = null; }
  }

  const titleRumors = [
    'The fog remembers names better than men do.',
    'Road Tokens prove you returned. Not why.',
    'Mara says the Old Road keeps its own ledger.',
    'Three tokens buys trust. A fourth asks what trust costs.',
    'The lantern gate opens for travelers, not heroes.'
  ];
  function titleRumor(){ return titleRumors[Math.floor(Date.now() / 7000) % titleRumors.length]; }

  const paths={continue:'M5 12h12M13 6l6 6-6 6',new:'M12 5v14M5 12h14',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',account:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c1.4-4.2 4.5-6.5 8-6.5s6.6 2.3 8 6.5',feedback:'M4 5h16v11H8l-4 4V5z',delete:'M6 7h12M9 7V5h6v2m-7 3v9m4-9v9m4-9v9',text:'M5 7h14M5 12h14M5 17h10',bold:'M8 5h5a4 4 0 0 1 0 8H8zM8 13h6a4 4 0 0 1 0 8H8z',contrast:'M12 3a9 9 0 1 0 0 18V3z',motion:'M4 12h10M10 6l6 6-6 6',space:'M4 8h16M4 16h16M8 4v16M16 4v16',font:'M4 19l6-14h4l6 14M8 14h8',world:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',gate:'M4 20V9a8 8 0 0 1 16 0v11M8 20V9a4 4 0 0 1 8 0v11',road:'M8 21c2-6 2-12 0-18M16 21c-2-6-2-12 0-18M5 14h14M6 8h12',cloud:'M7 18a4 4 0 1 1 1-7 5 5 0 0 1 10 2 3 3 0 0 1-1 5H7z',people:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 20c.8-4 3-6 5-6s4.2 2 5 6M10 20c.8-4 3-6 5-6s4.2 2 5 6',notice:'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',lock:'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z',slot:'M12 3l8 5v8l-8 5-8-5V8z'};
  const icon=k=>`<span class="game-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.continue}"/></svg></span>`;
  const portalIcon=k=>`<span class="portal-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.slot}"/></svg></span>`;
  const portalAction=(id,kind,label,desc,ic)=>`<button class="btn ${kind||''} game-menu-btn portal-action" id="${id}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></button>`;
  const stat=(label,value)=>`<div class="title-status-stat"><span>${label}</span><strong>${value}</strong></div>`;

  function accountSummary(profileData){
    const connected = !!window.LegendSupabaseV09x?.client;
    if(profileData){
      return `<strong>${esc(profileData.displayName || 'Local Profile')}</strong><em>${connected ? 'Cloud gateway detected' : 'Local profile bound - cloud gate pending'}</em>`;
    }
    return `<strong>${connected ? 'Cloud Gateway Ready' : 'Local Realm Ready'}</strong><em>Open Profile / Travelers to claim a name and prepare future traveler sync.</em>`;
  }

  function profileName(profileData){ return esc(profileData?.displayName || 'Local Traveler'); }
  function cloudStatus(){ return window.LegendSupabaseV09x?.client ? 'Cloud Ready' : 'Local Ready'; }

  function portalHeader(profileData){
    return `<header class="portal-header">
      <div class="portal-brand">
        <img src="assets/ui/logos/logo_legend_emblem_v1.png" alt="LEGEND emblem" onerror="this.style.display='none'">
        <div><h1>LEGEND</h1><p>Roads of Ashmere</p><span>✧ Ashmere Realm Portal</span></div>
      </div>
      <div class="portal-profile-card">
        <span class="portal-crest" aria-hidden="true">◆</span>
        <div><p>Traveler Profile: <strong>${profileName(profileData)}</strong></p><p>Cloud Sync: <strong>${cloudStatus()}</strong></p><p>Build: <strong>v0.9.x</strong></p></div>
        <button class="portal-gear" id="settingsTop" type="button" aria-label="Open settings">⚙</button>
      </div>
    </header>`;
  }

  function statusRow(iconKey,label,value,tone){
    return `<div class="portal-status-row"><span>${portalIcon(iconKey)}${label}</span><strong class="${tone||''}">${value}</strong></div>`;
  }

  function worldStatusPanel(){
    return `<aside class="portal-panel portal-world-panel"><h2>World Status</h2>
      <div class="portal-status-list">
        ${statusRow('world','Realm','Ashmere','gold')}
        ${statusRow('notice','Region','Frontier Build')}
        ${statusRow('gate','Gate','Open','good')}
        ${statusRow('road','Old Road','Unstable','warn')}
        ${statusRow('cloud','Traveler Sync',cloudStatus(),'good')}
        ${statusRow('people','Social Systems','Staged','gold')}
      </div>
      <div class="portal-side-actions">
        ${portalAction('account','', 'Profile / Travelers','Manage profile, active traveler, and future cloud slots.','account')}
        ${portalAction('settings','', 'Settings','Tune readability, contrast, spacing, and motion.','settings')}
        <a class="btn game-menu-btn portal-action" href="feedback.html">${icon('feedback')}<span><strong>Playtest Report</strong><small>Send bugs, balance notes, and first-town impressions.</small></span></a>
      </div>
    </aside>`;
  }

  function travelerSlots(player){
    const activeName = player ? 'Slot 1 - Active Traveler' : 'Slot 1 - Empty Slot';
    return `<div class="portal-slot-list">
      <div class="portal-slot active"><b>1</b><span>${activeName}</span><em>${player ? 'selected' : 'open'}</em></div>
      <div class="portal-slot"><b>2</b><span>Slot 2 - Empty Slot</span><em>local</em></div>
      <div class="portal-slot locked"><b>3</b><span>Slot 3 - Cloud Slot Locked</span><em>locked</em></div>
      <div class="portal-slot locked"><b>4</b><span>Slot 4 - Future Slot</span><em>staged</em></div>
    </div>`;
  }

  function travelerRosterPanel(player){
    const cls = player?.className || player?.class || 'Wayfarer';
    const name = player?.username || 'No Traveler Selected';
    const day = player?.day || 1;
    const tokens = Number(player?.inventory?.roadToken || 0);
    const town = player?.town || 'Ashmere';
    const trust = Number(player?.townTrust?.Ashmere || 0);
    return `<main class="portal-panel portal-roster-panel"><h2>Traveler Roster</h2>
      <section class="portal-traveler-card ${player ? '' : 'empty'}">
        <div class="portal-portrait" aria-hidden="true"><span>${player ? esc(String(name).slice(0,1)).toUpperCase() : '?'}</span></div>
        <div class="portal-traveler-info"><h3>${esc(name)}</h3>
          <dl>
            <div><dt>Class</dt><dd>${esc(cls)}</dd></div>
            <div><dt>Town</dt><dd>${esc(town)}</dd></div>
            <div><dt>Day</dt><dd>${day}</dd></div>
            <div><dt>Town Trust</dt><dd>${trust}</dd></div>
            <div><dt>Road Tokens</dt><dd>${tokens}</dd></div>
          </dl>
        </div>
      </section>
      ${travelerSlots(player)}
      <div class="portal-roster-actions">
        ${player ? `<button class="portal-enter-btn" id="continue" type="button">Enter Ashmere</button>` : `<button class="portal-enter-btn" id="newPrimary" type="button">Create First Traveler</button>`}
        <button class="portal-secondary-btn" id="new" type="button">Create Traveler</button>
        <button class="portal-secondary-btn" id="registry" type="button">Traveler Registry</button>
      </div>
    </main>`;
  }

  function noticeBoardPanel(){
    return `<aside class="portal-panel portal-notice-panel"><h2>Notice Board</h2>
      <article class="portal-parchment"><h3>Ashmere v0.9.x</h3><ul><li>Hub polish continues</li><li>Old Road events under tuning</li><li>Traveler profiles stable locally</li><li>Cloud traveler sync staged</li></ul></article>
      <article class="portal-parchment small"><h3>Town Rumor</h3><p>${esc(titleRumor())}</p></article>
      <a class="portal-secondary-btn portal-patch-link" href="feedback.html">Send Playtest Report</a>
    </aside>`;
  }

  function portalFooter(){
    return `<footer class="portal-footer"><p><strong>Future Systems:</strong> Friends • Chat • Parties • Guilds • Cloud Travelers</p><p><strong>Status:</strong> Staged for future release</p></footer>`;
  }

  function titleGate(){
    applySettings();
    root().innerHTML = `
      <div class="title-wrap title-gate-wrap title-gate-cinematic">
        <div class="title-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="title-fog" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="title-gate-border" aria-hidden="true"></div>
        <section class="title-gate-card" role="button" tabindex="0" aria-label="Enter Ashmere">
          <h1 class="game-title">LEGEND</h1>
          <p class="title-gate-subtitle">Roads of Ashmere</p>
          <p class="title-gate-kicker">✧ Ashmere Gate ✧</p>
          <button class="title-gate-prompt" id="enterRealm" type="button">Press Any Key to Enter Ashmere</button>
          <p class="title-gate-quote">The lantern gate opens for travelers, not heroes.</p>
        </section>
      </div>`;
    const card = document.querySelector('.title-gate-card');
    const enter = document.getElementById('enterRealm');
    const activate = () => {
      document.removeEventListener('keydown', onKey);
      try { sessionStorage.setItem(TITLE_GATE_KEY, 'opened'); } catch {}
      startAmbience();
      playUi('confirm');
      title();
    };
    const onKey = e => { if(e.key !== 'Tab') activate(); };
    document.addEventListener('keydown', onKey);
    if(card) card.onclick = activate;
    if(enter) enter.onclick = e => { e.stopPropagation(); activate(); };
  }

  function titleTransition(message, action){
    playUi('confirm');
    const wrap = document.querySelector('.title-wrap');
    if(!wrap) return action();
    wrap.classList.add('title-is-opening');
    const notice = document.createElement('div');
    notice.className = 'title-transition-notice';
    notice.textContent = message;
    wrap.appendChild(notice);
    setTimeout(action, 340);
  }

  function bindTitleAudio(){
    document.querySelectorAll('.game-menu-btn,.portal-enter-btn,.portal-secondary-btn,.portal-gear').forEach(btn => {
      btn.addEventListener('pointerenter', () => playUi('hover'));
      btn.addEventListener('focus', () => playUi('hover'));
    });
  }

  function title(){
    applySettings();
    const player = loadPlayer();
    const prof = profile();
    root().innerHTML = `
      <div class="title-wrap title-v09x-final portal-shell">
        <div class="title-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="title-fog" aria-hidden="true"><i></i><i></i><i></i></div>
        ${portalHeader(prof)}
        <section class="portal-main-grid">
          ${worldStatusPanel()}
          ${travelerRosterPanel(player)}
          ${noticeBoardPanel()}
        </section>
        ${portalFooter()}
      </div>`;
    startAmbience();
    bindTitleAudio();
    const cont = document.getElementById('continue');
    if(cont) cont.onclick = () => titleTransition('Opening Ashmere Gate...', continueGame);
    const newPrimary = document.getElementById('newPrimary');
    if(newPrimary) newPrimary.onclick = () => titleTransition('Preparing New Traveler...', newTraveler);
    document.getElementById('account').onclick = () => titleTransition('Opening Traveler Registry...', account);
    document.getElementById('settings').onclick = () => titleTransition('Opening Options...', settings);
    document.getElementById('new').onclick = () => titleTransition('Preparing New Traveler...', newTraveler);
    document.getElementById('registry').onclick = () => titleTransition('Opening Traveler Registry...', account);
    const settingsTop = document.getElementById('settingsTop');
    if(settingsTop) settingsTop.onclick = () => titleTransition('Opening Options...', settings);
  }

  function continueGame(){
    const player = loadPlayer();
    if(!player) return title();
    player.town = 'Ashmere';
    S().savePlayer?.(player);
    if(window.LegendAshmereV099?.renderAshmere) return window.LegendAshmereV099.renderAshmere();
    root().innerHTML = `<div class="shell"><section class="panel"><h2>Ashmere is loading...</h2><p>Try a hard refresh if this screen does not change.</p><div class="actions"><button class="btn primary" id="backTitle">Back to Title</button></div></section></div>`;
    document.getElementById('backTitle').onclick = title;
  }

  function newTraveler(){
    if(window.LegendBeginningV094?.startCreation) return window.LegendBeginningV094.startCreation();
    root().innerHTML = `<div class="shell"><section class="panel"><h2>Traveler creation is loading...</h2><p>Try a hard refresh if this screen does not change.</p><div class="actions"><button class="btn primary" id="backTitle">Back to Title</button></div></section></div>`;
    document.getElementById('backTitle').onclick = title;
  }

  function account(){
    if(window.LegendAccountV09x?.renderAccount) return window.LegendAccountV09x.renderAccount();
    root().innerHTML = `<main class="account09x"><div class="account09x-wrap"><section class="account09x-hero"><div class="account09x-hero-content"><div class="account09x-kicker">Profile / Travelers</div><h1>Traveler Profile</h1><p>Profile screens are loading. Try a hard refresh if this screen does not change.</p></div></section><div class="account09x-actions"><button class="account09x-btn primary" id="backTitle">Back to Title</button></div></div></main>`;
    document.getElementById('backTitle').onclick = title;
  }

  function settings(){
    const current = loadSettings();
    const rows = [
      ['largeText','Large Text','Increases base UI text size for easier reading.','text'],
      ['boldText','Bold Text','Adds stronger text weight across menus and panels.','bold'],
      ['highContrast','High Contrast','Boosts contrast for darker rooms and bright text.','contrast'],
      ['reducedMotion','Reduced Motion','Reduces animation and motion effects where supported.','motion'],
      ['spacious','Spacious Layout','Adds breathing room for touch and mobile play.','space'],
      ['readableFont','Readable Font','Uses a simpler font treatment for long reading sessions.','font']
    ];
    root().innerHTML = `<main class="settings09x"><div class="settings09x-wrap"><section class="settings09x-hero"><div class="settings09x-kicker">LEGEND v0.9.x</div><h1>Settings</h1><p>Adjust readability and comfort for this device. These options should feel like part of the game, not a browser form.</p></section><section class="settings09x-grid">${rows.map(([key,label,desc,ic]) => `<label class="settings09x-toggle"><input type="checkbox" data-setting="${key}" ${current[key] ? 'checked' : ''}><span class="settings09x-setting-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[ic]}"/></svg></span><span><strong>${label}</strong><span>${desc}</span></span><i class="settings09x-switch"></i></label>`).join('')}</section><p class="settings09x-note"><strong>Note:</strong> Accessibility settings do not change your save file, stats, or progress. They only affect presentation on this device.</p><div class="settings09x-actions"><button class="settings09x-btn primary" id="saveSettings">Save Settings</button><button class="settings09x-btn" id="backTitle">Back to Title</button>${loadPlayer()?'<button class="settings09x-btn" id="backGame">Back to Ashmere</button>':''}</div></div></main>`;
    document.getElementById('saveSettings').onclick = () => {
      const next = {...current};
      document.querySelectorAll('[data-setting]').forEach(input => next[input.dataset.setting] = input.checked);
      saveSettings(next);
      settings();
    };
    document.getElementById('backTitle').onclick = title;
    const backGame = document.getElementById('backGame');
    if(backGame) backGame.onclick = continueGame;
  }

  window.LegendGameBootstrap = { title, titleGate, continueGame, newTraveler, settings, account };
  const boot = () => {
    try { if(sessionStorage.getItem(TITLE_GATE_KEY) === 'opened') return title(); } catch {}
    titleGate();
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();