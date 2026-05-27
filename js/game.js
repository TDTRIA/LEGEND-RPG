// LEGEND: Roads of Ashmere v0.9.x - Slim Game Bootstrap
// Owns only title/start/settings. Ashmere is owned by ashmere-controller-v099.js.
(() => {
  const D = () => window.LEGEND_DATA || {};
  const S = () => window.LegendStorage || {};
  const UI = () => window.LegendUI || {};

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function root(){
    return document.getElementById('root');
  }

  function loadPlayer(){
    return S().loadPlayer ? S().loadPlayer() : null;
  }

  function saveSettings(settings){
    if(S().saveSettings) S().saveSettings(settings);
  }

  function loadSettings(){
    return S().loadSettings ? S().loadSettings() : { largeText:false, boldText:false, highContrast:false, reducedMotion:false, simpleAscii:false, spacious:false, readableFont:false };
  }

  function applySettings(){
    if(S().applySettings) S().applySettings();
  }

  function title(){
    applySettings();
    const player = loadPlayer();
    root().innerHTML = `
      <div class="title-wrap">
        <section class="title-card">
          <div>
            <div class="kicker">LEGEND: Roads of Ashmere • v0.9.x</div>
            <h1 class="game-title">LEGEND</h1>
            <p class="title-lore">A dark medieval fantasy RPG about Ashmere, the Old Road, and the proof you bring back from the fog.</p>
            <div class="actions">
              ${player ? `<button class="btn primary" id="continue">Continue as ${esc(player.username)}</button>` : ''}
              <button class="btn" id="new">New Traveler</button>
              <button class="btn" id="settings">Settings / Accessibility</button>
              <a class="btn" href="save.html">Save Vault</a>
              <a class="btn" href="feedback.html">Playtest Feedback</a>
              ${player ? `<button class="btn danger" id="delete">Delete Browser Save</button>` : ''}
            </div>
            <p class="small">Current focus: polish the Ashmere first-town loop before expanding the world.</p>
          </div>
        </section>
      </div>`;
    const cont = document.getElementById('continue');
    if(cont) cont.onclick = continueGame;
    document.getElementById('new').onclick = newTraveler;
    document.getElementById('settings').onclick = settings;
    const del = document.getElementById('delete');
    if(del) del.onclick = () => {
      if(confirm('Delete browser save?')){
        S().deleteSaves?.();
        title();
      }
    };
  }

  function continueGame(){
    const player = loadPlayer();
    if(!player) return title();
    player.town = 'Ashmere';
    S().savePlayer?.(player);
    if(window.LegendAshmereV099?.renderAshmere) return window.LegendAshmereV099.renderAshmere();
    if(window.LegendTownControllerV080?.renderTown) return window.LegendTownControllerV080.renderTown('ashmere');
    root().innerHTML = `<div class="shell"><section class="panel"><h2>Ashmere is loading...</h2><p>Try a hard refresh if this screen does not change.</p><div class="actions"><button class="btn primary" id="backTitle">Back to Title</button></div></section></div>`;
    document.getElementById('backTitle').onclick = title;
  }

  function newTraveler(){
    if(window.LegendBeginningV094?.startCreation) return window.LegendBeginningV094.startCreation();
    root().innerHTML = `<div class="shell"><section class="panel"><h2>Traveler creation is loading...</h2><p>Try a hard refresh if this screen does not change.</p><div class="actions"><button class="btn primary" id="backTitle">Back to Title</button></div></section></div>`;
    document.getElementById('backTitle').onclick = title;
  }

  function settings(){
    const settings = loadSettings();
    const rows = [
      ['largeText','Large Text'],
      ['boldText','Bold Text'],
      ['highContrast','High Contrast'],
      ['reducedMotion','Reduced Motion'],
      ['spacious','Spacious Layout'],
      ['readableFont','Readable Font']
    ];
    root().innerHTML = `
      <div class="shell">
        <section class="panel">
          <div class="kicker">Settings</div>
          <h2>Accessibility</h2>
          <p>These settings apply to the current browser.</p>
          <div class="list">
            ${rows.map(([key,label]) => `<label class="shop"><input type="checkbox" data-setting="${key}" ${settings[key] ? 'checked' : ''}> <strong>${label}</strong></label>`).join('')}
          </div>
          <div class="actions"><button class="btn primary" id="saveSettings">Save Settings</button><button class="btn" id="backTitle">Back to Title</button></div>
        </section>
      </div>`;
    document.getElementById('saveSettings').onclick = () => {
      const next = {...settings};
      document.querySelectorAll('[data-setting]').forEach(input => next[input.dataset.setting] = input.checked);
      saveSettings(next);
      title();
    };
    document.getElementById('backTitle').onclick = title;
  }

  window.LegendGameBootstrap = { title, continueGame, newTraveler, settings };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', title);
  else title();
})();
