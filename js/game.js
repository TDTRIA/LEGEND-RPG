// LEGEND: Roads of Ashmere v0.9.x - Slim Game Bootstrap
// Owns only title/start/settings. Ashmere is owned by ashmere-controller-v099.js.
(() => {
  const S = () => window.LegendStorage || {};

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function root(){ return document.getElementById('root'); }
  function loadPlayer(){ return S().loadPlayer ? S().loadPlayer() : null; }
  function saveSettings(settings){ if(S().saveSettings) S().saveSettings(settings); }
  function loadSettings(){ return S().loadSettings ? S().loadSettings() : { largeText:false, boldText:false, highContrast:false, reducedMotion:false, simpleAscii:false, spacious:false, readableFont:false }; }
  function applySettings(){ if(S().applySettings) S().applySettings(); }

  const paths={continue:'M5 12h12M13 6l6 6-6 6',new:'M12 5v14M5 12h14',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M3 12h3m12 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',vault:'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',feedback:'M4 5h16v11H8l-4 4V5z',delete:'M6 7h12M9 7V5h6v2m-7 3v9m4-9v9m4-9v9',text:'M5 7h14M5 12h14M5 17h10',bold:'M8 5h5a4 4 0 0 1 0 8H8zM8 13h6a4 4 0 0 1 0 8H8z',contrast:'M12 3a9 9 0 1 0 0 18V3z',motion:'M4 12h10M10 6l6 6-6 6',space:'M4 8h16M4 16h16M8 4v16M16 4v16',font:'M4 19l6-14h4l6 14M8 14h8'};
  const icon=k=>`<span class="game-menu-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[k]||paths.continue}"/></svg></span>`;
  const menuButton=(id,kind,label,desc,ic)=>`<button class="btn ${kind||''} game-menu-btn" id="${id}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></button>`;
  const menuLink=(href,label,desc,ic)=>`<a class="btn game-menu-btn" href="${href}">${icon(ic)}<span><strong>${label}</strong><small>${desc}</small></span></a>`;

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
              ${player ? menuButton('continue','primary',`Continue as ${esc(player.username)}`,'Return to Ashmere and resume the first-town loop.','continue') : ''}
              ${menuButton('new','', 'New Traveler','Create a new traveler for Roads of Ashmere.','new')}
              ${menuButton('settings','', 'Settings / Accessibility','Adjust readability, contrast, spacing, and motion.','settings')}
              ${menuLink('save.html','Save Vault','Export, import, or back up your save.','vault')}
              ${menuLink('feedback.html','Playtest Feedback','Send bugs, balance notes, and first-town impressions.','feedback')}
              ${player ? menuButton('delete','danger','Delete Browser Save','Clear the local save from this browser.','delete') : ''}
            </div>
            <p class="small title-footer">Current focus: polish the Ashmere first-town loop before expanding the world.</p>
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
      ['largeText','Large Text','Increases base UI text size for easier reading.','text'],
      ['boldText','Bold Text','Adds stronger text weight across menus and panels.','bold'],
      ['highContrast','High Contrast','Boosts contrast for darker rooms and bright text.','contrast'],
      ['reducedMotion','Reduced Motion','Reduces animation and motion effects where supported.','motion'],
      ['spacious','Spacious Layout','Adds breathing room for touch and mobile play.','space'],
      ['readableFont','Readable Font','Uses a simpler font treatment for long reading sessions.','font']
    ];
    root().innerHTML = `
      <main class="settings09x">
        <div class="settings09x-wrap">
          <section class="settings09x-hero">
            <div class="settings09x-kicker">LEGEND v0.9.x</div>
            <h1>Settings</h1>
            <p>Adjust readability and comfort for this device. These options should feel like part of the game, not a browser form.</p>
          </section>
          <section class="settings09x-grid">
            ${rows.map(([key,label,desc,ic]) => `<label class="settings09x-toggle"><input type="checkbox" data-setting="${key}" ${current[key] ? 'checked' : ''}><span class="settings09x-setting-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[ic]}"/></svg></span><span><strong>${label}</strong><span>${desc}</span></span><i class="settings09x-switch"></i></label>`).join('')}
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
