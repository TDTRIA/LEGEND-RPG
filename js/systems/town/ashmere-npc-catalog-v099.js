/* LEGEND Ashmere/Greyfen NPC copy catalog.
 * Holds baseline character descriptions and opening dialogue separately from
 * quest-state resolution, persistence, and DOM rendering.
 */
(() => {
  const DIALOGUE = Object.freeze({
    Ashmere: {
      mara: {
        name: 'Mara Vell',
        role: 'Archive Keeper',
        artKey: 'mara',
        text: "Mara keeps Ashmere's records in careful stacks, as if the town might fall apart without her hands holding it together.",
        lines: [
          'The bell rang once when you arrived. That should not be possible.',
          'If the road truly woke for you, Old Road may still hide proof of what changed.',
          'Bring back Road Tokens. Bring back anything the road should not have remembered.'
        ]
      },
      brenn: {
        name: 'Old Brenn',
        role: 'Ledger Keeper',
        artKey: 'brenn',
        text: 'Brenn keeps ink, coin, and consequences in the same room. Nothing counts in Ashmere until it is written down.',
        lines: [
          'Road Tokens matter. Bell Fragments matter more.',
          'The road forgets. I do not.',
          'If you have three Road Tokens, I can record your first proof.'
        ]
      },
      oric: {
        name: 'Captain Oric',
        role: 'Gate Captain',
        artKey: 'oric',
        text: 'Oric watches the gate like the road owes him blood.',
        lines: [
          'Out there, hesitation gets people buried.',
          'Guard when the hit looks heavy. Fall back before pride gets you killed.',
          'Preparation is not cowardice. It is why veterans get old.'
        ]
      }
    },
    Greyfen: {
      mara: {
        name: 'Mara Vell',
        role: 'Boundary Archivist',
        artKey: 'mara',
        text: 'Mara has set up a temporary desk in Greyfen’s boundary archive. Every bell-mark she copies seems older than the stone it was carved into.',
        lines: [
          'These stones were markers before they were graves. I am still deciding which they are now.',
          'The light in the reeds is not a lantern. It only wants you to follow it like one.',
          'Bring me a rubbing of any bell-mark you find. I will compare it to the drowned records.'
        ]
      },
      brenn: {
        name: 'Old Brenn',
        role: 'Bellkeeper’s Ledger',
        artKey: 'brenn',
        text: 'Brenn has carried his ledger across the causeway. Here, the ink records more than rewards: crossings, disappearances, and debts no one wants to claim.',
        lines: [
          'Greyfen pays in proof, not promises. Keep every token you earn.',
          'A crossing costs coin. A safe crossing costs preparation.',
          'I am keeping a separate line for those who hear the bell after dark.'
        ]
      },
      oric: {
        name: 'Captain Oric',
        role: 'Causeway Watch',
        artKey: 'oric',
        text: 'Oric watches the raised paths between Greyfen and the drowned lowlands. He marks every stretch that can vanish after heavy rain.',
        lines: [
          'Stay on the old stone where you can. Reeds hide holes deep enough to swallow a cart.',
          'If something keeps pace with you in the water, do not turn your lantern toward it.',
          'Rest before the causeway narrows. There is nowhere to stand once the flood reaches the markers.'
        ]
      }
    }
  });

  function create(context = {}) {
    const { npcArt } = context;
    function get(regionId, id) {
      const region = regionId === 'Greyfen' ? 'Greyfen' : 'Ashmere';
      const map = DIALOGUE[region];
      const source = map[id] || map.mara;
      return {
        name: source.name,
        role: source.role,
        text: source.text,
        art: typeof npcArt === 'function' ? npcArt(source.artKey) : '',
        lines: [...source.lines]
      };
    }
    return Object.freeze({ get });
  }

  window.LegendAshmereNpcCatalogV099 = Object.freeze({ create });
})();
