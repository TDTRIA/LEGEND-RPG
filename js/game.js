// LEGEND: Roads of Ashmere v0.9.x - Slim Game Bootstrap
// Owns only title/start/settings. Ashmere is owned by ashmere-controller-v099.js.
(() => {
  const S = () => window.LegendStorage || {};

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function root(){ return document.getElementById('root'); }
  function loadPlayer(){ return S().loadPlayer ? S().loadPlayer() : null; }
  function saveSettings(settings){ if(S().saveSettings) S().saveSettings(settings); }
  function loadSettings(){ return S().loadSettings ? S().loadSettings() : { largeText:false, boldText:false, highContrast:false, reducedMotion:false, simpleAscii:false, spacious:false, readableFont:false }; }
  function applySettings(){ if(S().applySettings) S().applySettings(); }

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
    if(del) del.onclick = () => { if(confirm('Delete browser save?')){ S().deleteSaves?.(); title(); } };
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

  function settings(){
    const current = loadSettings();
    const rows = [
      ['largeText','Large Text','Increases base UI text size for easier reading.'],
      ['boldText','Bold Text','Adds stronger text weight across menus and panels.'],
      ['highContrast','High Contrast','Boosts contrast for darker rooms and bright text.'],
      ['reducedMotion','Reduced Motion','Reduces animation and motion effects where supported.'],
      ['spacious','Spacious Layout','Adds breathing room for touch and mobile play.'],
      ['readableFont','Readable Font','Uses a simpler font treatment for long reading sessions.']
    ];
    root().innerHTML = `
      <main class="settings09x">
        <div class="settings09x-wrap">
          <section class="settings09x-hero">
            <div class="settings09x-kicker">LEGEND v0.9.x</div>
            <h1>Settings</h1>
            <p>Adjust readability and comfort for the current browser. These settings are saved locally and apply immediately after saving.</p>
          </section>
          <section class="settings09x-grid">
            ${rows.map(([key,label,desc]) => `<label class="settings09x-toggle"><input type="checkbox" data-setting="${key}" ${current[key] ? 'checked' : ''}><i class="settings09x-switch"></i><span><strong>${label}</strong><span>${desc}</span></span></label>`).join('')}
          </section>
          <p class="settings09x-note"><strong>Note:</strong> Accessibility settings do not change your save file, stats, or progress. They only affect presentation on this device.</p>
          <div class="settings09x-actions"><button class="settings09x-btn primary" id="saveSettings">Save Settings</button><button class="settings09x-btn" id="backTitle">Back to Title</button>${loadPlayer()?'<button class="settings09x-btn" id="backGame">Back to Ashmere</button>':''}</div>
        </div>
      </main>`;
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

  window.LegendGameBootstrap = { title, continueGame, newTraveler, settings };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', title);
  else title();
})();
