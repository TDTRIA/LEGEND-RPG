// LEGEND: The Awakening v0.20.36 - classic RPG title menu refresh
// Owns title/start/settings/account entry. Ashmere is owned by ashmere-controller-v099.js.
(() => {
  const S = () => window.LegendStorage || {};
  function root(){ return document.getElementById('root'); }
  function loadPlayer(){ return S().loadPlayer ? S().loadPlayer() : null; }
  function saveSettings(settings){ if(S().saveSettings) S().saveSettings(settings); }
  function loadSettings(){ return S().loadSettings ? S().loadSettings() : { largeText:false, boldText:false, highContrast:false, reducedMotion:false, simpleAscii:false, spacious:false, readableFont:false }; }
  function applySettings(){ if(S().applySettings) S().applySettings(); }
  function buildVersion(){ return String(window.LEGEND_DATA?.VERSION || 'v0.20.36'); }

  function titleScreenConfig(){
    return {
      root: root(),
      loadPlayer,
      buildVersion,
      applySettings,
      onContinue: continueGame,
      onNewTraveler: newTraveler,
      onAccount: account,
      onSettings: settings,
      onCredits: credits
    };
  }

  function title(){
    const screen = window.LegendTitleScreenV120;
    if (screen?.render) return screen.render(titleScreenConfig());
    const host = root();
    if (host) host.innerHTML = '<main class="settings09x"><div class="settings09x-wrap"><h1>Title screen unavailable</h1><p>The title module did not load. Refresh before continuing.</p></div></main>';
  }

  function titleGate(){
    const screen = window.LegendTitleScreenV120;
    if (screen?.renderGate) return screen.renderGate(titleScreenConfig());
    return title();
  }

  function credits(){
    return window.LegendTitleScreenV120?.openCredits?.();
  }

  function continueGame(){
    const player = loadPlayer();
    if(!player) return title();
    const activeRegion=String(player.currentRegion||'Ashmere');
    if(['Ashmere','Greyfen'].includes(activeRegion)){
      player.town=activeRegion;
    }else{
      // A save may reference a mapped region that is not playable yet. Keep it safe.
      player.currentRegion='Ashmere';
      player.town='Ashmere';
      player.memories=Array.isArray(player.memories)?player.memories:[];
      const note='You returned to Ashmere while the next region is still being built.';
      if(!player.memories.includes(note))player.memories.push(note);
    }
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
    const settingsScreen = window.LegendSettingsScreenV090;
    if (settingsScreen && typeof settingsScreen.render === 'function') {
      return settingsScreen.render({
        root: root(),
        loadSettings,
        saveSettings,
        buildVersion,
        loadPlayer,
        onBackTitle: title,
        onBackGame: continueGame
      });
    }

    const container = root();
    if (!container) return;
    container.innerHTML = '<main class="settings09x"><div class="settings09x-wrap"><section class="settings09x-hero"><h1>Settings</h1><p>The settings screen could not be loaded. Return to the title and refresh before retrying.</p></section><div class="settings09x-actions"><button class="settings09x-btn" id="backTitle" type="button">Back to Title</button></div></div></main>';
    container.querySelector('#backTitle')?.addEventListener('click', title);
  }

  window.LegendGameBootstrap = { title, titleGate, continueGame, newTraveler, settings, account, credits };
  // v0.20.26: enter directly on the actual title menu. The former Ashmere Gate
  // splash was a redundant extra screen before the title and required an extra click.
  const boot = () => title();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();