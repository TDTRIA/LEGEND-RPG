/* LEGEND settings screen - incremental extraction from js/game.js.
 * Persistence and navigation are injected so this screen does not own game state.
 */
(() => {
  const escapeHtml = window.LegendHtmlV120.escapeHtml;

  function render(config) {
    if (!config || !config.root || typeof config.loadSettings !== 'function' ||
        typeof config.saveSettings !== 'function') return;

    const { root, loadSettings, saveSettings, buildVersion, loadPlayer, onBackTitle, onBackGame } = config;
    const current = loadSettings() || {};
    const rows = [
      ['largeText', 'Large Text', 'Increases base UI text size for easier reading.', 'text'],
      ['boldText', 'Bold Text', 'Adds stronger text weight across menus and panels.', 'bold'],
      ['highContrast', 'High Contrast', 'Boosts contrast for darker rooms and bright text.', 'contrast'],
      ['reducedMotion', 'Reduced Motion', 'Reduces animation and motion effects where supported.', 'motion'],
      ['spacious', 'Spacious Layout', 'Adds breathing room for touch and mobile play.', 'space'],
      ['readableFont', 'Readable Font', 'Uses a simpler font treatment for long reading sessions.', 'font']
    ];

    root.innerHTML = `
      <main class="settings09x">
        <div class="settings09x-wrap">
          <section class="settings09x-hero">
            <div class="settings09x-kicker">LEGEND ${escapeHtml(typeof buildVersion === 'function' ? buildVersion() : '')}</div>
            <h1>Settings</h1>
            <p>Adjust readability and comfort for this device. These options should feel like part of the game, not a browser form.</p>
          </section>
          <section class="settings09x-grid">${rows.map(([key, label, desc, iconKey]) => `
            <label class="settings09x-toggle">
              <input type="checkbox" data-setting="${key}" ${current[key] ? 'checked' : ''}>
              <span class="settings09x-setting-icon"><img src="${({text:'assets/generated/ui/icons/service-journal.webp',bold:'assets/generated/ui/icons/service-traveler.webp',contrast:'assets/generated/ui/icons/service-gatehouse.webp',motion:'assets/generated/ui/icons/service-map.webp',space:'assets/generated/ui/icons/service-market.webp',font:'assets/generated/ui/icons/service-job-board.webp'})[iconKey]}" alt="" loading="lazy" decoding="async"></span>
              <span><strong>${label}</strong><span>${desc}</span></span>
              <i class="settings09x-switch"></i>
            </label>
          `).join('')}</section>
          <p class="settings09x-note"><strong>Note:</strong> Accessibility settings do not change your save file, stats, or progress. They only affect presentation on this device.</p>
          <div class="settings09x-actions">
            <button class="settings09x-btn primary" id="saveSettings" type="button">Save Settings</button>
            <button class="settings09x-btn" id="backTitle" type="button">Back to Title</button>
            ${typeof loadPlayer === 'function' && loadPlayer() ? '<button class="settings09x-btn" id="backGame" type="button">Back to Ashmere</button>' : ''}
          </div>
        </div>
      </main>`;

    root.querySelector('#saveSettings')?.addEventListener('click', () => {
      const next = { ...current };
      root.querySelectorAll('[data-setting]').forEach(input => {
        next[input.dataset.setting] = input.checked;
      });
      saveSettings(next);
      render(config);
    });

    root.querySelector('#backTitle')?.addEventListener('click', () => {
      if (typeof onBackTitle === 'function') onBackTitle();
    });

    const backGame = root.querySelector('#backGame');
    if (backGame) backGame.addEventListener('click', () => {
      if (typeof onBackGame === 'function') onBackGame();
    });
  }

  window.LegendSettingsScreenV090 = Object.freeze({ render });
})();
