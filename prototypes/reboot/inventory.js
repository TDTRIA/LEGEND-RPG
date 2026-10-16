/* Prototype-only inventory/equipment loop, populated from production data. */
(() => {
  'use strict';
  const D = () => window.LegendRebootData || {};
  const state = {
    bells: 0,
    weaponId: 'hand',
    armorId: 'none',
    ownedWeapons: ['hand'],
    ownedArmors: ['none'],
    items: { food: 2, roadPoultice: 1 },
    initializedFor: ''
  };
  const byId = (list, id) => (list || []).find(item => item.id === id);
  const weapon = () => byId(D().weapons, state.weaponId) || { id: 'hand', name: 'Your Hand', min: 8, max: 20, cost: 0 };
  const armor = () => byId(D().armors, state.armorId) || { id: 'none', name: 'No Armor', defense: 0, cost: 0 };
  function initForClass() {
    const name = document.querySelector('#classChoice')?.value || 'Adventurer';
    if (state.initializedFor === name) return;
    state.bells = Number(D().classStats?.(name)?.gold || 100);
    state.initializedFor = name;
    render();
  }
  function ensureUI() {
    if (document.querySelector('#inventoryToggle')) return;
    const style = document.createElement('style');
    style.textContent = `
      #inventoryToggle { position:absolute; z-index:15; top:14px; right:18px; border:1px solid #dbb979; background:rgba(5,9,8,.9); color:#f0ead8; padding:10px 14px; font:700 10px system-ui,sans-serif; letter-spacing:.14em; cursor:pointer; }
      #inventoryPanel { display:none; position:absolute; z-index:25; inset:7% 8%; overflow:auto; padding:clamp(16px,3vw,34px); background:rgba(5,9,8,.97); border:1px solid rgba(226,205,158,.5); box-shadow:0 20px 90px #000; font:13px/1.5 system-ui,sans-serif; }
      #inventoryPanel.open { display:block; }
      #inventoryPanel h2 { margin:6px 0 12px; color:#e5cc91; font:500 clamp(28px,4vw,42px) Georgia,serif; }
      #inventoryPanel h3 { margin:18px 0 8px; color:#dbb979; text-transform:uppercase; letter-spacing:.13em; font-size:10px; }
      #inventoryPanel .inv-top { display:flex; justify-content:space-between; gap:14px; align-items:start; flex-wrap:wrap; }
      #inventoryPanel .inv-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:9px; }
      #inventoryPanel .inv-card { padding:12px; border:1px solid rgba(226,205,158,.2); background:rgba(24,32,28,.78); }
      #inventoryPanel .inv-card strong { display:block; color:#f0ead8; }
      #inventoryPanel .inv-card p { margin:5px 0 10px; color:#bfc8be; font-size:11px; }
      #inventoryPanel button { border:1px solid rgba(226,205,158,.35); background:#17221c; color:#f0ead8; padding:8px 10px; font:700 10px system-ui,sans-serif; letter-spacing:.06em; cursor:pointer; }
      #inventoryPanel button:disabled { opacity:.35; cursor:not-allowed; }
      #inventoryPanel .inv-close { background:#8f6c3e; color:#111; }
      #inventoryPanel .inv-balance { color:#e5cc91; font-weight:700; }
      #inventoryPanel .inv-muted { color:#aeb8ae; font-size:11px; }
      @media(max-width:600px) { #inventoryPanel { inset:4%; } #inventoryToggle { top:8px; right:8px; padding:8px; } }
    `;
    document.head.appendChild(style);
    const toggle = document.createElement('button');
    toggle.id = 'inventoryToggle';
    toggle.type = 'button';
    toggle.textContent = 'PACK · EQUIPMENT';
    toggle.addEventListener('click', () => { initForClass(); document.querySelector('#inventoryPanel').classList.toggle('open'); render(); });
    document.querySelector('.game-frame').appendChild(toggle);
    const panel = document.createElement('section');
    panel.id = 'inventoryPanel';
    panel.setAttribute('aria-label', 'Inventory and equipment');
    document.querySelector('.game-frame').appendChild(panel);
  }
  function render() {
    const panel = document.querySelector('#inventoryPanel');
    if (!panel) return;
    const weapons = D().weapons || [];
    const armors = D().armors || [];
    const names = D().itemNames || {};
    const quest = window.LegendRebootPrototype?.getExplorationState?.();
    const questStatus = !quest ? 'No expedition underway. Begin the journey to receive your first field commission.'
      : quest.scoutDefeated ? 'Complete · Return to Ashmere and report the charcoal warband mark.'
      : !quest.questAccepted ? 'Available · Find Roadwarden Brenn on the Old Road.'
      : !(quest.shrineInspected && quest.tracksInspected) ? 'In progress · Inspect the waystone and record the warband tracks.'
      : 'Ready · Confront the goblin scout and recover proof.';
    const inventory = Object.entries(state.items).filter(([,count]) => count > 0).map(([id,count]) => `<div class="inv-card"><strong>${names[id] || id}</strong><p>Quantity: ${count}</p></div>`).join('') || '<p class="inv-muted">Your pack is empty.</p>';
    const weaponCards = weapons.map(item => {
      const owned = state.ownedWeapons.includes(item.id);
      const equipped = state.weaponId === item.id;
      return `<div class="inv-card"><strong>${item.name}${equipped ? ' · EQUIPPED' : ''}</strong><p>Damage ${item.min}–${item.max} · ${item.passive || 'No weapon trait'}<br>${owned ? 'Owned' : 'Cost: ' + item.cost + ' Bells'}</p><button data-weapon="${item.id}" ${equipped ? 'disabled' : ''}>${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy & Equip'}</button></div>`;
    }).join('');
    const armorCards = armors.map(item => {
      const owned = state.ownedArmors.includes(item.id);
      const equipped = state.armorId === item.id;
      return `<div class="inv-card"><strong>${item.name}${equipped ? ' · EQUIPPED' : ''}</strong><p>Defense ${item.defense} · ${owned ? 'Owned' : 'Cost: ' + item.cost + ' Bells'}</p><button data-armor="${item.id}" ${equipped ? 'disabled' : ''}>${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy & Equip'}</button></div>`;
    }).join('');
    panel.innerHTML = `
      <div class="inv-top"><div><div class="eyebrow">Character · Pack · Loadout</div><h2>Inventory & Equipment</h2><div class="inv-muted">Prototype-only inventory using LEGEND's current weapon, armor, item and class data.</div></div><div><div class="inv-balance">${state.bells} Bells</div><button class="inv-close" id="closeInventory">Close pack ✕</button></div></div>
      <h3>Journal · First commission</h3><div class="inv-card"><strong>The Unquiet Road</strong><p>${questStatus}</p><p>Waystone: ${quest?.shrineInspected ? "recorded" : "not inspected"} · Tracks: ${quest?.tracksInspected ? "recorded" : "not recorded"} · Roadwarden: ${quest?.questAccepted ? "commission accepted" : "not yet met"}</p></div>\n      <h3>Equipped</h3><div class="inv-grid"><div class="inv-card"><strong>Weapon · ${weapon().name}</strong><p>Damage ${weapon().min}–${weapon().max}<br>${weapon().passive || 'No weapon trait'}</p></div><div class="inv-card"><strong>Armor · ${armor().name}</strong><p>Defense ${armor().defense} · reduces incoming damage</p></div></div>
      <h3>Weapons · Buy and equip</h3><div class="inv-grid">${weaponCards}</div>
      <h3>Armor · Buy and equip</h3><div class="inv-grid">${armorCards}</div>
      <h3>Pack</h3><div class="inv-grid">${inventory}</div>
      <p class="inv-muted">Purchases and loot are kept in this browser session only. They do not touch production saves.</p>`;
    panel.querySelector('#closeInventory').addEventListener('click', () => panel.classList.remove('open'));
    panel.querySelectorAll('[data-weapon]').forEach(button => button.addEventListener('click', () => {
      const item = byId(weapons, button.dataset.weapon);
      if (!item) return;
      if (!state.ownedWeapons.includes(item.id)) {
        if (state.bells < Number(item.cost || 0)) { window.alert('Not enough Bells for ' + item.name + '.'); return; }
        state.bells -= Number(item.cost || 0);
        state.ownedWeapons.push(item.id);
      }
      state.weaponId = item.id; render();
    }));
    panel.querySelectorAll('[data-armor]').forEach(button => button.addEventListener('click', () => {
      const item = byId(armors, button.dataset.armor);
      if (!item) return;
      if (!state.ownedArmors.includes(item.id)) {
        if (state.bells < Number(item.cost || 0)) { window.alert('Not enough Bells for ' + item.name + '.'); return; }
        state.bells -= Number(item.cost || 0);
        state.ownedArmors.push(item.id);
      }
      state.armorId = item.id; render();
    }));
  }
  window.LegendRebootInventory = {
    state,
    getWeapon: weapon,
    getArmor: armor,
    addItem(id, count = 1) { state.items[id] = Math.max(0, Number(state.items[id] || 0) + count); render(); },
    addBells(count) { state.bells = Math.max(0, state.bells + Number(count || 0)); render(); },
    getBells() { return state.bells; }
  };
  document.addEventListener('DOMContentLoaded', () => {});
  ensureUI();
  initForClass();
  document.querySelector('#classChoice')?.addEventListener('change', initForClass);
})();