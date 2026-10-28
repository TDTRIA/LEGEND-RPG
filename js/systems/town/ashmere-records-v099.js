/* LEGEND Ashmere records screens.
 * These read-only character/journal views are separated from the town router.
 * Shared presentation/data helpers are injected by the existing controller so
 * save ownership, route names, and current markup remain stable.
 */
(() => {
  function renderSheet(context) {
    if (!context || typeof context.screen !== 'function' || !context.player) return;
    const {
      player: pl, assets, data, esc, itemIcon, itemName, weaponName, armorName,
      armorArt, gold, hpPct, getProgressionStatus, head, screen
    } = context;
    const items = assets.items || {};
    const portrait = assets.travelerPortrait?.(pl) || assets.classes?.[pl.className] || '';
    const inventoryEntries = Object.entries(pl.inventory || {}).filter(([, value]) => Number(value) > 0);
    const inventoryMarkup = inventoryEntries.map(([key, value]) => {
      const art = itemIcon(key);
      return '<article class="ash099-inventory-item">' +
        (art
          ? '<img src="' + esc(art) + '" alt="" aria-hidden="true" loading="lazy" onerror="this.onerror=null;this.style.display=\'none\'">'
          : '<span class="ash099-item-placeholder" aria-hidden="true">✦</span>') +
        '<div class="ash099-inventory-item-copy"><strong>' + esc(itemName(key)) +
        '</strong><small>In your pack</small></div><b>×' + Number(value) + '</b></article>';
    }).join('') || '<p class="ash099-inventory-empty">Your pack is light. The road may change that.</p>';
    if (typeof getProgressionStatus !== 'function') return;
    const status = getProgressionStatus(pl);
    if (!status) return;
    const { level, xp, next, progressPercent } = status;
    const weapon = (data.weapons || []).find(item => item.id === pl.weapon);
    const armor = (data.armors || []).find(item => item.id === pl.armor);
    const equipment = (label, name, detail, art) =>
      '<article class="ash099-profile-equipment"><span class="ash099-eyebrow">' + label +
      '</span>' + (art
        ? '<img src="' + esc(art) + '" alt="" aria-hidden="true" onerror="this.onerror=null;this.style.display=\'none\'">'
        : '') + '<strong>' + esc(name) + '</strong><small>' + esc(detail) + '</small></article>';

    screen(
      head('Traveler', pl.username || 'Traveler',
        'Who you are, what you can endure, and what you carry beyond the lantern line.', '', 'profile'),
      '<section class="ash099-traveler-profile">' +
        '<div class="ash099-traveler-profile-top">' +
          (portrait ? '<img class="ash099-traveler-profile-portrait" src="' + esc(portrait) +
            '" alt="' + esc(pl.className || 'Traveler') +
            '" onerror="this.onerror=null;this.style.display=\'none\'">' : '') +
          '<div class="ash099-traveler-profile-identity"><span class="ash099-eyebrow">YOUR TRAVELER</span><h2>' +
            esc(pl.className || 'Wanderer') + '</h2><p>' +
            esc(pl.personalityLabel || 'Traveler') + ' · ' + esc(pl.origin || 'Unknown origin') +
            '</p><p class="ash099-flavor">' + esc(pl.keepsake || 'A life not yet written') + '</p></div>' +
          '<div class="ash099-traveler-profile-level"><span>LEVEL</span><strong>' +
            level + '</strong><small>' + xp + ' / ' + next +
            ' XP</small><i><b style="width:' +
            progressPercent +
            '%"></b></i></div></div>' +
        '<div class="ash099-traveler-vitals"><div class="ash099-vital-hp"><span>HEALTH</span><strong>' +
          Number(pl.hp || 0) + ' <small>/ ' + Number(pl.maxHp || 0) +
          '</small></strong><i><b style="width:' + hpPct(pl) +
          '%"></b></i></div><div><span>GOLD</span><strong>' + gold(pl.gold) +
          '</strong></div><div><span>ROAD TOKENS</span><strong>' +
          Number(pl.inventory?.roadToken || 0) + ' <small>/ 5</small></strong></div></div>' +
        '<div class="ash099-profile-equipment-grid">' +
          equipment('IN HAND', weapon?.name || weaponName(pl.weapon),
            weapon ? 'Damage ' + weapon.min + '–' + weapon.max : 'Basic attack', items.shortSword) +
          equipment('WORN', armor?.name || armorName(pl.armor),
            armor ? 'Defense ' + armor.defense : 'No protection', armorArt(pl.armor)) +
        '</div>' +
        '<div class="ash099-traveler-detail-grid"><div><span>PRONOUNS</span><strong>' +
          esc(pl.pronouns || 'they/them') + '</strong></div><div><span>HOME</span><strong>' +
          esc(pl.currentRegion || 'Ashmere') + '</strong></div><div><span>TOWN WORK</span><strong>' +
          Number(pl.flags?.ashmereJobs || 0) + ' jobs</strong></div><div><span>ROAD PROOF</span><strong>' +
          Number(pl.inventory?.bellFragment || 0) + ' Bell Fragments</strong></div></div>' +
      '</section><section class="ash099-traveler-inventory"><div class="ash099-traveler-inventory-head">' +
        '<div><span class="ash099-eyebrow">WHAT YOU CARRY</span><h2>Your Pack</h2></div><span>' +
        inventoryEntries.reduce((sum, [, value]) => sum + Number(value), 0) +
        ' items</span></div><div class="ash099-inventory-grid">' + inventoryMarkup +
      '</div></section>'
    );
  }

  function renderArchive(context) {
    if (!context || typeof context.screen !== 'function' || !context.player) return;
    const { player, currentRegion, locationInterior, esc, head, screen, savePlayer } = context;
    const greyfen = String(currentRegion || 'Ashmere') === 'Greyfen';
    const memories = Array.isArray(player.memories) ? player.memories : [];
    const response = String(player.flags?.greyfenCrossingResponseV261 || '');
    const canPostNotice = Number(player.inventory?.woodScrap || 0) >= 1;
    let responseMarkup = '';
    if (greyfen && player.flags?.greyfenEvidenceFiled && !response &&
        !(player.flags?.greyfenStorehouseDispatchFound && !player.flags?.greyfenStorehouseDispatchReported) &&
        !(player.flags?.greyfenWaterlineGaugeRead && !player.flags?.greyfenWaterlineGaugeReported)) {
      responseMarkup = '<section class="ash099-crossing-response" aria-labelledby="greyfen-crossing-response-title">' +
        '<span class="ash099-eyebrow">CROSSING REPORT · NEXT DECISION</span>' +
        '<h2 id="greyfen-crossing-response-title">How should Greyfen handle the report?</h2>' +
        '<p>The records prove the crossing status was changed without initials. They do not identify who made the change or why. You can post a provisional safety notice using one Wood Scrap, or keep the evidence sealed until the missing closure order is found.</p>' +
        '<div class="ash099-cards">' +
        '<button type="button" class="ash099-btn ash099-card" data-greyfen-crossing-response="provisional-notice" ' + (canPostNotice ? '' : 'disabled') + '><strong>Post a provisional safety notice</strong><small>Cost: 1 Wood Scrap. The first route choice on your next Marsh Path trip gains up to 5 less Road Pressure.</small>' + (canPostNotice ? '' : '<em>Requires 1 Wood Scrap.</em>') + '</button>' +
        '<button type="button" class="ash099-btn ash099-card" data-greyfen-crossing-response="sealed-pending-order"><strong>Keep the report sealed</strong><small>No material cost. Preserve the evidence privately until the missing closure order is found.</small></button>' +
        '</div></section>';
    } else if (greyfen && response === 'provisional-notice') {
      responseMarkup = '<section class="ash099-crossing-response" role="status"><span class="ash099-eyebrow">NOTICE POSTED</span><h2>The raised-path warning is public</h2><p>Travelers are warned that the lower crossing record is uncertain. The notice names no author and does not claim the missing closure order has been found. Its one-time pressure relief remains ready for the next Marsh Path route choice.</p></section>';
    } else if (greyfen && response === 'sealed-pending-order') {
      responseMarkup = '<section class="ash099-crossing-response" role="status"><span class="ash099-eyebrow">REPORT SEALED</span><h2>The evidence stays private</h2><p>Mara keeps the crossing records together while the closure order remains missing. No person is named, and Greyfen receives no new public warning from this report.</p></section>';
    }
    const content = '<div class="ash099-lines">' +
      (memories.map(memory => '<p>' + esc(memory) + '</p>').join('') ||
        '<p>No memories recorded yet. The road has not left enough ink on you.</p>') +
      '</div>' + responseMarkup;
    screen(
      head('Records', greyfen ? 'Boundary Archive' : 'Archive Hall',
        greyfen
          ? 'The bell keeper’s ledgers track the old boundary stones and drowned roads.'
          : 'Mara keeps records, maps, and town memory.',
        locationInterior('archive'), 'archive'),
      content
    );
    document.querySelectorAll('[data-greyfen-crossing-response]').forEach(button => {
      button.addEventListener('click', () => {
        const pl = player;
        pl.flags = pl.flags || {};
        pl.inventory = pl.inventory || {};
        if (pl.flags.greyfenCrossingResponseV261) return;
        if (button.dataset.greyfenCrossingResponse === 'provisional-notice') {
          if (Number(pl.inventory.woodScrap || 0) < 1) return renderArchive(context);
          pl.inventory.woodScrap = Number(pl.inventory.woodScrap || 0) - 1;
          pl.flags.greyfenCrossingResponseV261 = 'provisional-notice';
          pl.flags.greyfenNoticePressureCreditV261 = true;
          pl.memories = Array.isArray(pl.memories) ? pl.memories : [];
          const noticeMemory = 'Mara and the traveler posted a provisional safety notice at Greyfen’s raised approach using one Wood Scrap. It warns that the lower crossing record is uncertain without naming an author; the next Marsh Path route choice gains up to 5 less Road Pressure once.';
          if (!pl.memories.includes(noticeMemory)) pl.memories.push(noticeMemory);
        } else {
          pl.flags.greyfenCrossingResponseV261 = 'sealed-pending-order';
          pl.flags.greyfenNoticePressureCreditV261 = false;
          pl.memories = Array.isArray(pl.memories) ? pl.memories : [];
          const sealedMemory = 'The traveler asked Mara to keep Greyfen’s crossing evidence sealed until the missing closure order is found. The record remains unresolved, and no public notice was posted.';
          if (!pl.memories.includes(sealedMemory)) pl.memories.push(sealedMemory);
        }
        if (typeof savePlayer === 'function') savePlayer(pl);
        renderArchive({ ...context, player: pl });
      });
    });
  }

  window.LegendAshmereRecordsV099 = Object.freeze({ renderSheet, renderArchive });
})();
