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
    { key: 'readableFont', label: 'Readable font', detail: 'Switch to a typeface chosen for legibility.' }
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
      modalRoot.setAttribute('aria-label', 'Traveler records and tools');
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

  function openModal({ eyebrow = 'The Borderlands', title, description = '', content = '', footer = '', icon = 'journal' } = {}) {
    const root = ensureRoot();
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const iconName = MODAL_ICON_CLASSES.includes(icon) ? icon : 'journal';
    root.innerHTML = '<section class="lws-modal" role="dialog" aria-modal="true" aria-labelledby="lws-modal-title" aria-describedby="lws-modal-description" tabindex="-1">' +
      '<header class="lws-modal-header"><span class="lws-modal-emblem runway-icon runway-icon-' + iconName + '" aria-hidden="true"></span><div class="lws-modal-heading"><span>' + esc(eyebrow) + '</span><h2 id="lws-modal-title">' + esc(title || 'The Borderlands') + '</h2><p id="lws-modal-description">' + esc(description) + '</p></div><button class="lws-close-btn" type="button" data-shell-modal-close aria-label="Close panel">×</button></header>' +
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


  function itemArtFor(key, label) {
    const value = (String(key || '') + ' ' + String(label || ''))
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const has = pattern => pattern.test(value);

    if (has(/iron short sword|iron sword/)) return 'assets/generated/items/equipment/iron-short-sword.webp';
    if (has(/woodcutters axe|woodcutter axe/)) return 'assets/generated/items/equipment/woodcutters-axe.webp';
    if (has(/hunting bow v2/)) return 'assets/generated/items/equipment/hunting-bow-v2.webp';
    if (has(/reinforced round shield/)) return 'assets/generated/items/equipment/reinforced-round-shield.webp';
    if (has(/iron helmet/)) return 'assets/generated/items/equipment/iron-helmet.webp';
    if (has(/leather bracers/)) return 'assets/generated/items/equipment/leather-bracers.webp';
    if (has(/blackroot tonic ingredients/)) return 'assets/generated/items/materials/blackroot-tonic-ingredients.webp';
    if (has(/bell fragment/)) return 'assets/generated/items/bell-fragment.webp';
    if (has(/road token|token/)) return 'assets/generated/items/road-token.webp';
    if (has(/marsh herb/)) return 'assets/generated/items/materials/marsh-herbs.webp';
    if (has(/road herb|herb/)) return 'assets/generated/items/road-herbs.webp';
    if (has(/cloth scrap|wood scrap|trade bundle|goblin mail|code fragment|runic tablet/)) return 'assets/generated/items/materials/trade-bundle.webp';
    if (has(/lamp oil|oil/)) return 'assets/generated/items/materials/lamp-oil.webp';
    if (has(/ration|food/)) return 'assets/generated/items/ration-bundle.webp';
    if (has(/camp supplies|camp/)) return 'assets/generated/items/camp-supplies.webp';
    if (has(/iron ore|ore/)) return 'assets/generated/items/materials/iron-ore.webp';
    if (has(/animal hide/)) return 'assets/generated/items/materials/animal-hide.webp';
    if (has(/torn hide|pelt|fur/)) return 'assets/generated/items/materials/torn-hide.webp';
    if (has(/hunter.?s charm|charm/)) return 'assets/generated/items/materials/hunters-charm.webp';
    if (has(/healing potion|potion|road poultice|heal/)) return 'assets/generated/items/healing-potion.webp';
    if (has(/wooden sword|short sword|stone sword|bronze sword|iron sword|sword|blade/)) return 'assets/generated/items/short-sword.webp';
    if (has(/hunting bow|bow/)) return 'assets/generated/items/hunting-bow.webp';
    if (has(/shield/)) return 'assets/generated/items/round-shield.webp';
    if (has(/cloth armor/)) return 'assets/generated/items/armor/cloth-armor.webp';
    if (has(/chain armor/)) return 'assets/generated/items/armor/chain-armor.webp';
    if (has(/bronze armor/)) return 'assets/generated/items/armor/bronze-armor.webp';
    if (has(/iron armor/)) return 'assets/generated/items/armor/iron-armor.webp';
    if (has(/leather reinforced armor/)) return 'assets/generated/items/armor/leather-reinforced-armor.webp';
    if (has(/leather armor/)) return 'assets/generated/items/armor/leather-reinforced-armor.webp';
    if (has(/kettle helmet|helmet/)) return 'assets/generated/items/armor/kettle-helmet.webp';
    if (has(/armor repair kit/)) return 'assets/generated/items/armor/armor-repair-kit.webp';
    return '';
  }

  const MODAL_ICON_CLASSES = Object.freeze(['traveler', 'settings', 'milestone', 'road', 'journal']);

  function openInventory(player = readPlayer()) {
    if (!player) {
      return openModal({
        eyebrow: 'Traveler archive',
        title: 'Inventory unavailable',
        icon: 'traveler',
        description: 'No saved traveler record could be read.',
        content: '<div class="lws-empty-state">Your traveler’s pack is not available yet. Begin a journey, then return to your carried goods.</div>',
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
          const art = itemArtFor(key, label);
          const marker = /potion|heal/i.test(label) ? '✚' : /herb|cloth|scrap|material|token|ration|food|camp/i.test(label) ? '✧' : /weapon|sword|bow|staff|blade/i.test(label) ? '⚔' : '◇';
          const icon = art
            ? '<img class="lws-item-sigil lws-item-art" data-item-art="' + esc(key) + '" src="' + art + '" alt="" decoding="async">'
            : '<span class="lws-item-sigil" aria-hidden="true">' + marker + '</span>';
          return '<article class="lws-inventory-card">' + icon + '<div><strong>' + esc(label) + '</strong><small>Carried: ' + esc(value) + '</small></div></article>';
        }).join('') + '</div>'
      : '<div class="lws-empty-state">Your pack is empty. The road may yet provide.</div>';
    const equipment = [
      ['Weapon', player.weapon || player.equipment?.weapon || ''],
      ['Armor', player.armor || player.equipment?.armor || '']
    ].filter(([, value]) => String(value).trim());
    const equipmentMarkup = equipment.length
      ? '<section class="lws-section" style="margin-top:16px"><div class="lws-section-title">Equipped</div><ul class="lws-small-list lws-equipped-list">' + equipment.map(([label, value]) => {
          const name = itemName(value, data);
          const art = itemArtFor(value, name);
          const image = art ? '<img class="lws-equipped-art" src="' + art + '" alt="" decoding="async">' : '';
          return '<li class="lws-equipped-item"><span>' + esc(label) + '</span><span class="lws-equipped-value">' + image + '<strong>' + esc(name) + '</strong></span></li>';
        }).join('') + '</ul></section>'
      : '';
    const footer = '<button type="button" class="lws-btn quiet" data-shell-modal-close>Return to the world</button><button type="button" class="lws-btn primary" data-world-action="traveler-sheet"><span class="lws-btn-copy"><strong>Open traveler sheet</strong><small>View your attributes and equipment</small></span></button>';
    return openModal({
      eyebrow: 'Traveler archive',
      title: 'Inventory',
      icon: 'traveler',
      description: 'Everything carried for the road: provisions, finds, keepsakes, and gear.',
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
      icon: 'settings',
      description: 'Tune text, contrast, motion, and spacing to suit the journey.',
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
      icon: 'milestone',
      description: active
        ? 'The fight is underway. Close this panel and return to the battlefield to act.'
        : 'No fight is underway. The road and its depths still await.',
      content: '<div class="lws-empty-state">' + (active
        ? 'Return to the battlefield to fight, act, use an item, guard, or retreat.'
        : 'Head back to the road or descend into the cellar when you are ready for danger.') + '</div>',
      footer: '<button type="button" class="lws-btn primary" data-shell-modal-close>' + (active ? 'Return to encounter' : 'Return to the world') + '</button>'
    });
  }

  function openNotice(title, description, message) {
    return openModal({
      eyebrow: 'World action',
      title,
      icon: 'road',
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
