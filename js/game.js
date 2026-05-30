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

  const paths={continue:'M5 12h12M13 6l6 6-6 6',new:'M12 5v14M5 12h14',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',account:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c1.4-4.2 4.5-6.5 8-6.5s6.6 2.3 8 6.5',feedback:'M4 5h16v11H8l-4 4V5z',delete:'M6 7h12M9 7V5h6v2m-7 3v9m4-9v9m4-9v9',text:'M5 7h14M5 12h14M5 17h10',bold:'M8 5h5a4 4 0 0 1 0 8H8zM8 13h6a4 4 0 0 1 0 8H8z',contrast:'M12 3a9 9 0 1 0 0 18V3z',motion:'M4 12h10M10 6l6 6-6 6',space:'M4 8h16M4 16h16M8 4v16M16 4v16',font:'M4 19l6-14h4l6 14M8 14h8'};
  const icon=k=>`<span class="game-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.continue}"/></svg></span>`;
  const menuButton=(id,kind,label,desc,ic)=>`<button class="btn ${kind||''} game-menu-btn" id="${id}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></button>`;
  const menuLink=(href,label,desc,ic)=>`<a class="btn game-menu-btn" href="${href}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></a>`;
  const stat=(label,value)=>`<div class="title-status-stat"><span>${label}</span><strong>${value}</strong></div>`;

  function accountSummary(profileData){
    const connected = !!window.LegendSupabaseV09x?.client;
    if(profileData){
      return `<strong>${esc(profileData.displayName || 'Local Profile')}</strong><em>${connected ? 'Cloud gateway detected' : 'Local profile bound - cloud gate pending'}</em>`;
    }
    return `<strong>${connected ? 'Cloud Gateway Ready' : 'Local Realm Ready'}</strong><em>Open Profile / Travelers to claim a name and prepare future traveler sync.</em>`;
  }

  function travelerSummary(player){
    if(!player){
      return `<article class="title-feature-card title-active-card"><div class="title-feature-head"><span>Traveler Slot</span><strong>No traveler selected</strong></div><p class="title-feature-copy">Create a traveler to step through the Ashmere gate, learn the town, and begin the first Old Road loop.</p><div class="title-mini-stats">${stat('Hub','Ashmere')}${stat('Route','Old Road')}${stat('Stage','Arrival')}</div></article>`;
    }
    const cls = player.className || player.class || 'Traveler';
    const day = player.day || 1;
    const tokens = Number(player.inventory?.roadToken || 0);
    const town = player.town || 'Ashmere';
    return `<article class="title-feature-card title-active-card"><div class="title-feature-head"><span>Active Traveler</span><strong>${esc(player.username || 'Unnamed Traveler')}</strong></div><p class="title-feature-copy">${esc(cls)} - ${esc(town)} - Day ${day}</p><div class="title-mini-stats">${stat('Road Tokens',tokens)}${stat('Town Trust',Number(player.townTrust?.Ashmere || 0))}${stat('Road Pressure',Number(player.roadDanger || 1))}</div></article>`;
  }

  function whatsNewPanel(){
    return `<article class="title-feature-card title-news-card"><div class="title-feature-head"><span>Realm Notice</span><strong>Ashmere v0.9.x</strong></div><ul class="title-feature-list"><li><strong>Realm Portal:</strong> title, traveler select, and profile entry are being polished into a game-first front end.</li><li><strong>Ashmere Hub:</strong> the first town is the base camp for talk, trade, rest, proof, and preparation.</li><li><strong>Old Road:</strong> events, danger, loot, and combat remain the core repeatable expedition loop.</li><li><strong>Travelers:</strong> local profiles are safe while cloud slots and future social systems are staged carefully.</li></ul><p class="title-news-note">Current path: complete Ashmere vertical slice first. Full 1.0 comes later.</p></article>`;
  }

  function titleGate(){
    applySettings();
    root().innerHTML = `
      <div class="title-wrap title-gate-wrap">
        <div class="title-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="title-fog" aria-hidden="true"><i></i><i></i><i></i></div>
        <section class="title-gate-card" role="button" tabindex="0" aria-label="Enter Ashmere">
          <div class="title-gate-emblem"><img src="assets/ui/logos/logo_legend_emblem_v1.png" alt="" onerror="this.style.display='none'"></div>
          <p class="title-gate-kicker">Roads of Ashmere</p>
          <h1 class="game-title">LEGEND</h1>
          <p class="title-gate-copy">Beyond the lantern gate, the Old Road waits.</p>
          <button class="title-gate-prompt" id="enterRealm" type="button">Press Any Key / Click to Enter Ashmere</button>
          <p class="title-rumor">${esc(titleRumor())}</p>
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
    document.querySelectorAll('.game-menu-btn').forEach(btn => {
      btn.addEventListener('pointerenter', () => playUi('hover'));
      btn.addEventListener('focus', () => playUi('hover'));
    });
  }

  function title(){
    applySettings();
    const player = loadPlayer();
    const prof = profile();
    root().innerHTML = `
      <div class="title-wrap title-v09x-final">
        <div class="title-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="title-fog" aria-hidden="true"><i></i><i></i><i></i></div>
        <section class="title-card title-card-final">
          <div class="title-hero-panel">
            <div class="title-brand-mark">
              <img src="assets/ui/logos/logo_legend_emblem_v1.png" alt="LEGEND emblem" onerror="this.style.display='none'">
              <span class="title-brand-text"><strong>Roads of Ashmere</strong><span>v0.9.x Ashmere vertical slice</span></span>
            </div>
            <div class="title-hero-grid">
              <div class="title-copy">
                <div class="kicker">Ashmere Realm Portal</div>
                <h1 class="game-title">LEGEND</h1>
                <p class="title-subtitle">Roads of Ashmere</p>
                <p class="title-lore">Ashmere waits beyond the lantern gate. Select a traveler, prepare in town, and return from the Old Road before the fog learns your name.</p>
                <div class="title-pill-row"><span class="title-pill">Traveler Select</span><span class="title-pill">Ashmere Base Camp</span><span class="title-pill">Old Road Loop</span></div>
                <p class="title-rumor">${esc(titleRumor())}</p>
              </div>
              <div class="title-keyart">
                <img src="assets/title/title_keyart_ashmere_v1.png" alt="Roads of Ashmere key art" onerror="this.parentElement.classList.add('is-missing')">
                <div class="title-keyart-fallback"><div class="title-keyart-fallback-mark">ASHMERE</div><p>Optional title key art slot. Add a traveler, road, or lantern-town illustration here when the asset is ready.</p></div>
              </div>
            </div>
            <div class="title-status-grid">
              <article class="title-status-card title-status-account"><span>Profile</span>${accountSummary(prof)}</article>
              <article class="title-status-card"><span>Hub</span><strong>Ashmere</strong><em>Base camp of the Old Road</em></article>
              <article class="title-status-card"><span>Build</span><strong>v0.9.x</strong><em>Vertical slice polish - not 1.0</em></article>
            </div>
            <div class="title-bottom-grid">${travelerSummary(player)}${whatsNewPanel()}</div>
          </div>
          <aside class="title-menu-panel title-menu-final">
            <div class="title-menu-stamp">Realm Portal</div>
            <h2>Traveler Select</h2>
            <div class="actions">
              ${player ? menuButton('continue','primary',`Enter as ${esc(player.username)}`,'Return to Ashmere and resume the first-town loop.','continue') : ''}
              ${menuButton('account','', 'Profile / Travelers', prof ? 'Manage your profile, active traveler, and cloud-save readiness.' : 'Claim a local profile and prepare future cloud traveler slots.', 'account')}
              ${menuButton('new','', 'Create Traveler','Begin a new Roads of Ashmere traveler.','new')}
              ${menuButton('settings','', 'Options / Accessibility','Tune readability, contrast, spacing, and motion.','settings')}
              ${menuLink('feedback.html','Send Playtest Report','Send bugs, balance notes, and first-town impressions.','feedback')}
              ${player ? menuButton('delete','danger','Delete Local Traveler','Clear the local browser traveler save.','delete') : ''}
            </div>
            <p class="small title-footer">Local traveler progress is playable now. Cloud slots, friends, and social systems remain staged for future v0.9.x work.</p>
          </aside>
        </section>
      </div>`;
    startAmbience();
    bindTitleAudio();
    const cont = document.getElementById('continue');
    if(cont) cont.onclick = () => titleTransition('Opening Ashmere Gate...', continueGame);
    document.getElementById('account').onclick = () => titleTransition('Opening Traveler Registry...', account);
    document.getElementById('new').onclick = () => titleTransition('Preparing New Traveler...', newTraveler);
    document.getElementById('settings').onclick = () => titleTransition('Opening Options...', settings);
    const del = document.getElementById('delete');
    if(del) del.onclick = () => { if(confirm('Delete local browser save?')){ S().deleteSaves?.(); title(); } };
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