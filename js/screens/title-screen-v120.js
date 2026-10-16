// LEGEND v0.20.36 - Active title screen presentation and menu interaction.
// Rendering keeps the established CSS hooks; navigation/state are injected by the bootstrap.
(() => {
  const titleAudio = window.LegendTitleAudioV120 || Object.freeze({
    playUi: () => {},
    startAmbience: () => {},
    bindTitleAudio: () => {}
  });

  const esc = window.LegendHtmlV120.escapeHtml;

  function titleTransition(message, action){
    titleAudio.playUi('confirm');
    const wrap = document.querySelector('.title-wrap');
    if(!wrap) return action();
    wrap.classList.add('title-is-opening');
    const notice = document.createElement('div');
    notice.className = 'title-transition-notice';
    notice.textContent = message;
    wrap.appendChild(notice);
    setTimeout(action, 340);
  }

  function render(config){
    if (!config) return;
    const root = () => config.root || document.getElementById('root');
    const loadPlayer = config.loadPlayer || (() => null);
    const buildVersion = config.buildVersion || (() => String(window.LEGEND_DATA?.VERSION || 'v0.20.36'));
    const applySettings = config.applySettings || (() => {});
    const continueGame = config.onContinue;
    const newTraveler = config.onNewTraveler;
    const account = config.onAccount;
    const settings = config.onSettings;
    const credits = config.onCredits || openCredits;
    applySettings();
    const player = loadPlayer();
    const name = player?.username || 'No Traveler';
    const cls = player?.className || player?.class || 'Wayfarer';
    const savedRegion = String(player?.currentRegion || player?.town || 'Ashmere');
    const town = ['Ashmere', 'Greyfen'].includes(savedRegion) ? savedRegion : 'Ashmere';
    const day = Number(player?.day || 1);
    const tokens = Number(player?.inventory?.roadToken || 0);
    const titleView = window.LegendTitleScreenViewV120;
    if (typeof titleView?.render !== 'function' || !titleView.render({
      root: root(),
      player,
      name,
      cls,
      town,
      day,
      tokens,
      buildVersion: buildVersion(),
      backgroundImage: window.LegendAssetsV090?.title?.background,
      logoImage: window.LegendAssetsV090?.logo?.main
    })) {
      const host = root();
      if (host) host.innerHTML = '<main class="settings09x"><div class="settings09x-wrap"><h1>Title screen unavailable</h1><p>The title menu view could not be loaded. Refresh before continuing.</p></div></main>';
      return;
    }
    titleAudio.startAmbience();
    titleAudio.bindTitleAudio();
    const cont = document.getElementById('continue');
    if(cont) cont.onclick = () => titleTransition('Returning to '+town+'...', continueGame);
    const newPrimary = document.getElementById('newPrimary');
    if(newPrimary) newPrimary.onclick = () => titleTransition('Preparing New Traveler...', newTraveler);
    const newButton = document.getElementById('new');
    if(newButton) newButton.onclick = () => titleTransition('Preparing New Traveler...', newTraveler);
    document.getElementById('account').onclick = () => titleTransition('Opening Traveler Profile...', account);
    document.getElementById('settings').onclick = () => titleTransition('Opening Options...', settings);
    document.getElementById('credits').onclick = credits;
  }
  
  const titleExtras = window.LegendTitleExtrasV120?.create({
    renderTitle: render,
    getTitleAudio: () => titleAudio
  });
  function renderGate(config) {
    if (typeof titleExtras?.renderGate === 'function') return titleExtras.renderGate(config);
    return render(config);
  }
  function openCredits() {
    if (typeof titleExtras?.openCredits === 'function') return titleExtras.openCredits();
  }

  window.LegendTitleScreenV120 = Object.freeze({ render, renderGate, openCredits });
})();
