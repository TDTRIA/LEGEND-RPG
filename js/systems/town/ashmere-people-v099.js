/* LEGEND Ashmere people directory.
 * NPC dialogue and evidence progression are owned by ashmere-npc-dialogue-v099.js.
 * This module keeps the people-list presentation and routes character selections.
 */
(() => {
  function render(context, view, id) {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.screen !== 'function') return;

    if (view === 'npc') {
      const dialogue = window.LegendAshmereNpcDialogueV099;
      if (dialogue?.render) return dialogue.render(context, id);
      const head = context.head;
      return context.screen(
        typeof head === 'function' ? head('Town Systems', 'Dialogue Unavailable', 'The dialogue module did not load.', '', 'notice') : '',
        '<p>Town dialogue is unavailable. Refresh before continuing.</p>'
      );
    }

    return renderPeople(context);
  }

  function renderPeople(context) {
    const getPlayer = context.getPlayer;
    const escapeHtml = context.escapeHtml;
    const imageMarkup = context.imageMarkup;
    const background = context.background;
    const npcArt = context.npcArt;
    const head = context.head;
    const screen = context.screen;
    const player = getPlayer();
    const greyfen = String(player?.currentRegion || 'Ashmere') === 'Greyfen';

    const people = greyfen ? [
      ['mara', 'Mara Vell', 'Boundary Archivist', 'Copies the bell-marks and boundary stones that emerge from the drowned roads.'],
      ['brenn', 'Old Brenn', 'Bellkeeper’s Ledger', 'Records causeway crossings, missing travelers, and recovered proof.'],
      ['oric', 'Captain Oric', 'Causeway Watch', 'Knows which raised paths hold after rain and which vanish beneath the reeds.']
    ] : [
      ['mara', 'Mara Vell', 'Archive Keeper', 'The first person to ask about the bell that rang when you arrived.'],
      ['brenn', 'Old Brenn', 'Ledger Keeper', 'Records Road Tokens, proof, and what Ashmere owes returning travelers.'],
      ['oric', 'Captain Oric', 'Gate Captain', 'Offers practical warnings before you leave the lantern line.']
    ];

    const cards = people.map(([id, name, role, description]) =>
      '<button class="ash099-btn ash099-npc-card" data-ash-view="' + id + '">' +
      imageMarkup(npcArt(id), name) + '<strong>' + name + '</strong><small>' +
      role + ' · ' + description + '</small></button>'
    ).join('');

    screen(
      head(
        greyfen ? 'Lowland Keepers' : 'Town Square',
        greyfen ? 'People of Greyfen' : 'People of Ashmere',
        greyfen
          ? 'The causeway brings records, warnings, and rumors up from the drowned roads.'
          : 'The square is where Ashmere watches newcomers decide who they are.',
        background(),
        'people'
      ),
      '<div class="ash099-npc-grid">' + cards + '</div>'
    );
  }

  window.LegendAshmerePeopleV099 = Object.freeze({ render });
})();
