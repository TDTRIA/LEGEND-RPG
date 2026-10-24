/* LEGEND v0.23.0 — player-directed level growth.
 * Existing XP thresholds and base HP gains remain in progression-v100.js.
 * This module adds saved attribute points and an in-world level-up overlay.
 */
(() => {
  const ATTRIBUTES = Object.freeze({
    might: { label: 'Might', subtitle: 'Force, heavy blows, and strength checks.', effect: '+1 Force / strength' },
    agility: { label: 'Agility', subtitle: 'Quick actions, finesse, and guile.', effect: '+1 Agility and Guile' },
    arcana: { label: 'Arcana', subtitle: 'Runic power and magical techniques.', effect: '+1 Magic' },
    endurance: { label: 'Endurance', subtitle: 'Staying power and resisting the road.', effect: '+1 Roadsense · +3 max HP' },
    insight: { label: 'Insight', subtitle: 'Read clues, understand lore, and craft.', effect: '+1 Lore and Craft' },
    fortune: { label: 'Fortune', subtitle: 'Luck when the road turns uncertain.', effect: '+1 Fortune' }
  });

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));

  function ensureAttributes(player) {
    if (!player) return {};
    player.attributesV152 = player.attributesV152 || {};
    Object.keys(ATTRIBUTES).forEach(key => {
      player.attributesV152[key] = Math.max(0, Math.floor(Number(player.attributesV152[key] || 0)));
    });
    player.pendingStatPointsV152 = Math.max(0, Math.floor(Number(player.pendingStatPointsV152 || 0)));
    return player.attributesV152;
  }

  function open(player, summary = {}) {
    if (!player) return false;
    const attributes = ensureAttributes(player);
    const points = Number(player.pendingStatPointsV152 || 0);
    if (points < 1) return false;

    document.getElementById('legendLevelUpOverlay')?.remove();
    const allocations = Object.fromEntries(Object.keys(ATTRIBUTES).map(key => [key, 0]));
    const art = window.LegendAssetsV090?.travelerPortrait?.(player) || window.LegendAssetsV090?.classes?.[player.className] || '';
    const previousLevel = Math.max(1, Number(player.level || 1) - Math.max(1, Number(summary.levels || 1)));
    const levelLine = Number(summary.levels || 0) > 1
      ? 'Your journey carried you through ' + Number(summary.levels) + ' levels.'
      : 'A new level has been earned.';
    const attributeCards = Object.entries(ATTRIBUTES).map(([key, item]) => (
      '<article class="v152-growth-card" data-growth-card="' + key + '">' +
        '<div class="v152-growth-card-head">' +
          '<span class="v152-growth-monogram" aria-hidden="true">' + item.label.charAt(0) + '</span>' +
          '<div><h3>' + item.label + '</h3><p>' + item.subtitle + '</p></div>' +
          '<strong class="v152-growth-current" aria-label="' + item.label + ' current value"><span data-attr-value="' + key + '">' + attributes[key] + '</span></strong>' +
        '</div>' +
        '<p class="v152-growth-effect">' + item.effect + '</p>' +
        '<div class="v152-growth-controls">' +
          '<button type="button" data-attr-minus="' + key + '" aria-label="Remove one point from ' + item.label + '" disabled>−</button>' +
          '<span><b data-allocation="' + key + '">0</b> allocated</span>' +
          '<button type="button" data-attr-add="' + key + '" aria-label="Add one point to ' + item.label + '">+</button>' +
        '</div>' +
      '</article>'
    )).join('');

    const overlay = document.createElement('div');
    overlay.id = 'legendLevelUpOverlay';
    overlay.className = 'v152-levelup-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML =
      '<div class="v152-growth-backdrop" aria-hidden="true"></div>' +
      '<section class="v152-levelup-panel" role="dialog" aria-modal="true" aria-labelledby="v152-levelup-title">' +
        '<div class="v152-levelup-rule"><span></span><span>THE ROAD REMEMBERS</span><span></span></div>' +
        '<div class="v152-levelup-hero">' +
          (art ? '<img src="' + esc(art) + '" alt="" class="v152-levelup-portrait">' : '') +
          '<div><span class="v152-levelup-kicker">TRAVELER GROWTH</span>' +
            '<h2 id="v152-levelup-title">Level ' + Number(player.level || 1) + '</h2>' +
            '<p class="v152-levelup-story">' + levelLine + ' Every road leaves something behind in you.</p>' +
            '<div class="v152-levelup-level-line"><span>LEVEL ' + previousLevel + '</span><b aria-hidden="true">→</b><strong>LEVEL ' + Number(player.level || 1) + '</strong></div>' +
          '</div>' +
        '</div>' +
        '<div class="v152-growth-pointbar" role="status" aria-live="polite"><div><span>UNSPENT ATTRIBUTE POINTS</span><strong><b id="v152-growth-spent">0</b> / <i id="v152-growth-total">' + points + '</i></strong></div>' +
          '<div class="v152-growth-point-track"><span id="v152-growth-point-fill"></span></div>' +
          '<p>Assign every point before confirming your growth. Your choices are saved to this traveler.</p>' +
        '</div>' +
        '<div class="v152-growth-grid">' + attributeCards + '</div>' +
        '<div class="v152-growth-footer">' +
          '<p>Endurance also grants <strong>+3 maximum HP and +3 current HP</strong> for every point spent. Each level already grants +8 HP.</p>' +
          '<button type="button" class="v152-growth-confirm" id="v152-growth-confirm" disabled>Apply Growth <span aria-hidden="true">→</span></button>' +
        '</div>' +
      '</section>';

    document.body.appendChild(overlay);

    const allocatedCount = () => Object.values(allocations).reduce((sum, value) => sum + value, 0);
    function refresh() {
      const spent = allocatedCount();
      const spentNode = overlay.querySelector('#v152-growth-spent');
      const fill = overlay.querySelector('#v152-growth-point-fill');
      const confirm = overlay.querySelector('#v152-growth-confirm');
      if (spentNode) spentNode.textContent = String(spent);
      if (fill) fill.style.width = (points ? Math.min(100, spent / points * 100) : 0) + '%';
      if (confirm) confirm.disabled = spent !== points;
      Object.keys(ATTRIBUTES).forEach(key => {
        const current = overlay.querySelector('[data-attr-value="' + key + '"]');
        const allocated = overlay.querySelector('[data-allocation="' + key + '"]');
        const minus = overlay.querySelector('[data-attr-minus="' + key + '"]');
        const plus = overlay.querySelector('[data-attr-add="' + key + '"]');
        const card = overlay.querySelector('[data-growth-card="' + key + '"]');
        if (card) card.classList.toggle('has-growth', allocations[key] > 0);
        if (current) current.textContent = String(attributes[key]);
        if (allocated) allocated.textContent = String(allocations[key]);
        if (minus) minus.disabled = allocations[key] < 1;
        if (plus) plus.disabled = spent >= points;
      });
    }

    overlay.querySelectorAll('[data-attr-add]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-attr-add');
        if (!Object.prototype.hasOwnProperty.call(allocations, key) || allocatedCount() >= points) return;
        allocations[key] += 1;
        refresh();
      });
    });
    overlay.querySelectorAll('[data-attr-minus]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-attr-minus');
        if (!Object.prototype.hasOwnProperty.call(allocations, key) || allocations[key] < 1) return;
        allocations[key] -= 1;
        refresh();
      });
    });

    overlay.querySelector('#v152-growth-confirm')?.addEventListener('click', () => {
      if (allocatedCount() !== points) return;
      Object.keys(ATTRIBUTES).forEach(key => { attributes[key] += allocations[key]; });
      const endurance = Number(allocations.endurance || 0);
      if (endurance > 0) {
        player.maxHp = Math.max(1, Number(player.maxHp || player.hp || 1)) + endurance * 3;
        player.hp = Math.min(player.maxHp, Math.max(0, Number(player.hp || 0)) + endurance * 3);
      }
      player.pendingStatPointsV152 = Math.max(0, Number(player.pendingStatPointsV152 || 0) - points);
      window.LegendRuntimeV120?.savePlayer?.(player);
      overlay.remove();
      document.dispatchEvent(new CustomEvent('legend:level-growth-applied', {
        detail: { level: Number(player.level || 1), attributes: { ...attributes } }
      }));
    });

    refresh();
    overlay.querySelector('#v152-growth-confirm')?.focus({ preventScroll: true });
    return true;
  }

  function resumePending() {
    const player = window.LegendRuntimeV120?.loadPlayer?.();
    if (Number(player?.pendingStatPointsV152 || 0) > 0) open(player, { levels: 1 });
  }

  window.LegendLevelUpV152 = Object.freeze({ open, ensureAttributes, attributes: ATTRIBUTES });
  if (document.readyState === 'complete') resumePending();
  else document.addEventListener('DOMContentLoaded', resumePending, { once: true });
})();
