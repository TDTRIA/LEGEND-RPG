/* LEGEND persistent world shell v170 — overlays over existing screens only. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
  const humanize = value => String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());

  const settingDefinitions = [
    { key: 'largeText', label: 'Larger text', detail: 'Increase interface text size.' },
    { key: 'boldText', label: 'Bold text', detail: 'Strengthen text weight for readability.' },
    { key: 'highContrast', label: 'High contrast', detail: 'Increase separation between text and backgrounds.' },
    { key: 'reducedMotion', label: 'Reduced motion', detail: 'Reduce decorative movement and transitions.' },
    { key: 'simpleAscii', label: 'Simplified symbols', detail: 'Prefer simpler interface symbols.' },
    { key: 'spacious', label: 'Spacious layout', detail: 'Increase spacing between interface elements.' },
    { key: 'readableFont', label: 'Readable font', detail: 'Use the existing accessibility font setting.' }
  ];

  let modalRoot = null;
  let previousFocus = null;
  let onNotice = null;

  function ensureRoot() {
    if (modalRoot?.isConnected) return modalRoot;
    modalRoot = document.getElementById('legend-world-shell-modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'legend-world-shell-modal-root';
      modalRoot.hidden = true;
      modalRoot.setAttribute('aria-label', 'Game overlay');
      document.body.appendChild(modalRoot);
    }
    if (!modalRoot.dataset.lwsBound) {
      modalRoot.dataset.lwsBound = '1';
      modalRoot.addEventListener('click', event => {
        if (event.target === modalRoot || event.target.closest('[data-shell-modal-close]')) close();
      });
      modalRoot.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          return;
        }
        if (event.key !== 'Tab') return;
        const focusables = Array.from(modalRoot.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], select:not(:disabled), textarea:not(:disabled)'))
          .filter(node => node.getAttribute('tabindex') !== '-1');
        if (!focusables.length) {
          event.preventDefault();
          modalRoot.querySelector('[role="dialog"]')?.focus();
          return;
        }
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      modalRoot.addEventListener('change', event => {
        const input = event.target.closest('[data-world-setting]');
        if (!input) return;
        const key = String(input.dataset.worldSetting || '');
        if (!settingDefinitions.some(setting => setting.key === key)) return;
        const storage = window.LegendStorage;
        if (!storage?.loadSettings || !storage?.saveSettings) {
          announce('Settings storage is unavailable. Your preference was not changed.');
          input.checked = !input.checked;
          return;
        }
        const settings = { ...(storage.loadSettings() || {}), [key]: input.checked };
        storage.saveSettings(settings);
        storage.applySettings?.();
        announce('Saved ' + (settingDefinitions.find(setting => setting.key === key)?.label || 'setting') + '.');
      });
    }
    return modalRoot;
  }

  function announce(message) {
    if (typeof onNotice === 'function') onNotice(message);
    const status = modalRoot?.querySelector('[data-shell-modal-status]');
    if (status) status.textContent = message;
  }

  function openModal({ eyebrow = 'Realm overlay', title, description = '', content = '', footer = '' } = {}) {
    const root = ensureRoot();
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.innerHTML = '<section class="lws-modal" role="dialog" aria-modal="true" aria-labelledby="lws-modal-title" aria-describedby="lws-modal-description" tabindex="-1">' +
      '<header class="lws-modal-header"><div><span>' + esc(eyebrow) + '</span><h2 id="lws-modal-title">' + esc(title || 'Realm') + '</h2><p id="lws-modal-description">' + esc(description) + '</p></div><button class="lws-close-btn" type="button" data-shell-modal-close aria-label="Close overlay">×</button></header>' +
      '<div class="lws-modal-content">' + content + '<p class="lws-note" style="margin-top:12px" data-shell-modal-status aria-live="polite"></p></div>' +
      (footer ? '<footer class="lws-modal-footer">' + footer + '</footer>' : '') +
      '</section>';
    root.hidden = false;
    document.body.classList.add('lws-modal-open');
    const focus = root.querySelector('[data-shell-modal-close]');
    (focus || root.querySelector('[role="dialog"]'))?.focus();
    return true;
  }

  function close() {
    if (!modalRoot || modalRoot.hidden) return;
    modalRoot.hidden = true;
    modalRoot.innerHTML = '';
    document.body.classList.remove('lws-modal-open');
    if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus();
    previousFocus = null;
  }

  function readPlayer() {
    return window.LegendStorage?.loadPlayer?.() || window.LegendRuntimeV120?.loadPlayer?.() || null;
  }

  function itemName(key, data) {
    const item = data?.items?.[key] || data?.inventoryItems?.[key] || data?.materials?.[key];
    return item?.name || data?.itemNames?.[key] || humanize(key);
  }

  function openInventory(player = readPlayer()) {
    if (!player) {
      return openModal({
        eyebrow: 'Traveler archive',
        title: 'Inventory unavailable',
        description: 'No saved traveler record could be read.',
        content: '<div class="lws-empty-state">Create or load a traveler before opening the inventory.</div>',
        footer: '<button type="button" class="lws-btn quiet" data-shell-modal-close>Close</button>'
      });
    }
    const inventory = player.inventory && typeof player.inventory === 'object' ? player.inventory : {};
    const data = window.LEGEND_DATA || {};
    const entries = Object.entries(inventory)
      .filter(([, value]) => Number.isFinite(Number(value)) && Number(value) > 0)
      .sort(([a], [b]) => itemName(a, data).localeCompare(itemName(b, data)));
    const markup = entries.length
      ? '<div class="lws-inventory-grid">' + entries.map(([key, value]) => {
          const label = itemName(key, data);
          const marker = /potion|heal/i.test(label) ? '✚' : /herb|cloth|scrap|material|token|ration|food|camp/i.test(label) ? '✧' : /weapon|sword|bow|staff|blade/i.test(label) ? '⚔' : '◇';
          return '<article class="lws-inventory-card"><span class="lws-item-sigil" aria-hidden="true">' + marker + '</span><div><strong>' + esc(label) + '</strong><small>Carried: ' + esc(value) + '</small></div></article>';
        }).join('') + '</div>'
      : '<div class="lws-empty-state">Your pack is currently empty. Items found on the road or acquired through existing town systems will appear here.</div>';
    const equipment = [
      ['Weapon', player.weapon || player.equipment?.weapon || ''],
      ['Armor', player.armor || player.equipment?.armor || '']
    ].filter(([, value]) => String(value).trim());
    const equipmentMarkup = equipment.length
      ? '<section class="lws-section" style="margin-top:16px"><div class="lws-section-title">Equipped</div><ul class="lws-small-list">' + equipment.map(([label, value]) => '<li><span>' + esc(label) + '</span><strong>' + esc(itemName(value, data)) + '</strong></li>').join('') + '</ul></section>'
      : '';
    const footer = '<button type="button" class="lws-btn quiet" data-shell-modal-close>Return to the world</button><button type="button" class="lws-btn primary" data-world-action="traveler-sheet"><span class="lws-btn-copy"><strong>Open traveler sheet</strong><small>Use the full existing character screen</small></span></button>';
    return openModal({
      eyebrow: 'Traveler archive',
      title: 'Inventory',
      description: 'A read-only view of the saved pack. Item use, crafting, and rewards remain owned by the existing game systems.',
      content: markup + equipmentMarkup,
      footer
    });
  }

  function openSettings() {
    const current = window.LegendStorage?.loadSettings?.() || {};
    const markup = '<div class="lws-setting-list">' + settingDefinitions.map(setting =>
      '<label class="lws-setting-row" for="lws-setting-' + setting.key + '"><span><strong>' + esc(setting.label) + '</strong><small>' + esc(setting.detail) + '</small></span><input type="checkbox" id="lws-setting-' + setting.key + '" data-world-setting="' + setting.key + '"' + (current[setting.key] ? ' checked' : '') + '></label>'
    ).join('') + '</div>';
    return openModal({
      eyebrow: 'Realm preferences',
      title: 'Settings',
      description: 'Changes are written through LEGEND’s existing settings storage and accessibility handler.',
      content: markup,
      footer: '<button type="button" class="lws-btn primary" data-shell-modal-close>Return to the world</button>'
    });
  }

  function openCombat(root = document.getElementById('root')) {
    const active = !!root?.querySelector(
      '[data-combat-screen], [data-combat-action], #roadCombat, #battleActions, .road-combat-screen, .combat-v152-screen, .battle-v100-screen, .rpg-battle'
    );
    return openModal({
      eyebrow: 'Encounter state',
      title: active ? 'Combat encounter' : 'No active encounter',
      description: active
        ? 'The live encounter is owned by the existing combat system. Close this panel to use its combat actions.'
        : 'Combat begins through real road or dungeon encounters. This shell does not spawn enemies or change combat state.',
      content: '<div class="lws-empty-state">' + (active
        ? 'The encounter remains active in the world viewport. Use the visible battle controls to attack, guard, use an ability, or retreat.'
        : 'There is no active encounter to resume. Continue the expedition or enter a supported dungeon to encounter enemies.') + '</div>',
      footer: '<button type="button" class="lws-btn primary" data-shell-modal-close>' + (active ? 'Return to encounter' : 'Return to the world') + '</button>'
    });
  }

  function openNotice(title, description, message) {
    return openModal({
      eyebrow: 'World action',
      title,
      description,
      content: '<div class="lws-empty-state">' + esc(message || '') + '</div>',
      footer: '<button type="button" class="lws-btn primary" data-shell-modal-close>Close</button>'
    });
  }

  window.LegendWorldShellModalsV170 = Object.freeze({
    openInventory,
    openSettings,
    openCombat,
    openNotice,
    close
  });
})();
