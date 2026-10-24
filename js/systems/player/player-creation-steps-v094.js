/* LEGEND v0.20.38 — soul-shaping and memory-recovery creation step catalog.
 * Owns step copy and transforms current class/origin/keepsake catalog records into
 * choice cards. State, navigation callbacks, view binding and record persistence
 * stay with the existing creation controller.
 */
(() => {
  const SKILL_LABELS = Object.freeze({ strength:'Force', survival:'Roadsense', luck:'Fortune', lore:'Lore', magic:'Runic Power', thieving:'Guile', craft:'Craft', agility:'Agility' });
  const bonusText = bonuses => Object.entries(bonuses || {})
    .filter(([, amount]) => Number(amount) !== 0)
    .map(([key, amount]) => (Number(amount) > 0 ? '+' : '') + amount + ' ' + (SKILL_LABELS[key] || key))
    .join(' · ');
  const definitions = Object.freeze({
    gender: Object.freeze({
      step: 2,
       kicker: 'Form',
      title: 'What shape returns to you?',
      description: 'A silhouette rises through the dark. Choose the form that feels remembered—or the one you want to keep.',
      key: 'gender',
      nextLabel: 'Choose Personality',
      progress: 'The body is the first outline of a self.',
      scene: 'Dark water reflects a shape before there is a face to it. It seems familiar. Does it feel like you?',
      getItems: context => {
        const classes = context.assets?.classes || {};
        const traveler = context.assets?.ui?.serviceIcons?.traveler || '';
        const art = [classes.Adventurer, classes.Warrior, classes.Mage, traveler];
        return (context.genderOptions || []).map((option, index) => ({
          ...option,
          artSource: art[index] || traveler,
          artCell: null,
          effect: option.effect || 'Identity only; your form never weakens your character.'
        }));
      }
    }),
    personality: Object.freeze({
      step: 3,
      kicker: 'Feeling',
      title: 'Which feeling stayed?',
      description: 'A feeling returns before its memory. Your instinct will shape how you meet the world.',
      key: 'personality',
      nextLabel: 'Remember Your Past',
      progress: 'Something in you remembers how it endured.',
      scene: 'A hand reaching out. A door closing. A choice in the dark. You cannot place the moment, but the feeling remains.',
      getItems: context => {
        const items = context.assets?.items || {};
        const icons = context.assets?.ui?.serviceIcons || {};
        const art = {
          kind: items.rationBundle,
          grim: items.armorRepairKit,
          bold: items.shortSword,
          clever: icons.journal,
          quiet: icons.traveler
        };
        return (context.personalityOptions || []).map(option => ({
          ...option,
          artSource: art[option.id] || icons.traveler || '',
          artCell: null
        }));
      }
    }),
    origin: Object.freeze({
      step: 4,
      kicker: 'Memory',
      title: 'Where does the memory begin?',
      description: 'A place comes into focus at the edge of waking. It may be a memory, or the shape of one.',
      key: 'origin',
      nextLabel: 'Choose Your Calling',
      progress: 'The edges of a life return before the whole story.',
      scene: 'Rain on a window. Smoke in the air. The sensation of belonging somewhere. No face comes with the memory yet. Where does it lead?', 
      getItems: context => Object.entries(context.data?.origins || {}).map(([id, record]) => {
        const classes = context.assets?.classes || {};
        const items = context.assets?.items || {};
        const icons = context.assets?.ui?.serviceIcons || {};
        const art = {
          'Lost Squire':classes.Warrior,
          'Runaway Apprentice':classes.Mage,
          'Debt-Bound Thief':classes.Thief,
          "Archivist's Child":icons.journal,
          'Wandering Cook':items.rationBundle,
          'Failed Monster Hunter':classes.Ranger
        };
        const effects = [];
        const stats = bonusText(record.bonus);
        if (stats) effects.push(stats);
        if (record.gold) effects.push('+' + record.gold + ' starting gold');
        Object.entries(record.items || {}).forEach(([item, amount]) => effects.push('+' + amount + ' ' + (item === 'food' ? 'rations' : item)));
        return { id, label:id, text:record.text, tag:effects.join(' · ') || 'Story memory', effect: effects.length ? 'Starting advantage: ' + effects.join(', ') + '.' : 'A story memory that shapes how Ashmere sees you.', artSource:art[id] || icons.traveler || '', artCell:null };
      })
    }),
    class: Object.freeze({
      step: 5,
      kicker: 'Instinct',
      title: 'What do your hands remember?',
      description: 'The mind may lose its story; muscle and habit remain. Choose the skill that feels most familiar.',
      key: 'class',
      nextLabel: 'Choose a Keepsake',
      progress: 'Muscle, habit, and instinct outlast a name.',
      scene: 'Steel. Bow. Spell. A careful trick. The memory of movement rises before the reason for it. Which motion returns without thought?', 
      getItems: context => Object.entries(context.data?.classes || {}).map(([id, record]) => {
        const effects = ['HP ' + record.hp, record.gold + ' starting gold', record.move];
        const stats = bonusText(record.mod);
        if (stats) effects.push(stats);
        return { id, label:id, text:record.desc, tag:effects.join(' · '), effect:effects.join('. ') + '.', artSource:context.assets?.classes?.[id] || '', artCell:null };
      })
    }),
    keepsake: Object.freeze({
      step: 6,
      kicker: 'The Last Fragment',
      title: 'What survived the forgetting?',
      description: 'A small object catches the light in the dark. It may be a keepsake, or the first memory you can hold.',
      key: 'keepsake',
      nextLabel: 'Review Your Story',
      progress: 'A single object catches the light in the dark.',
      scene: 'You cannot remember packing it. Still, your hand knows how to reach for it. What do you choose to carry?', 
      getItems: context => Object.entries(context.data?.keepsakes || {}).map(([id, record]) => {
        const items = context.assets?.items || {};
        const icons = context.assets?.ui?.serviceIcons || {};
        const art = {
          'Rusty Charm':items.huntersCharm,
          'Old Map':icons.map,
          'Bent Coin':items.roadToken,
          'Cracked Tablet':items.bellFragment,
          'Dull Knife':items.shortSword,
          'Cooked Ration':items.rationBundle
        };
        const effects = [];
        const stats = bonusText(record.bonus);
        if (stats) effects.push(stats);
        if (record.sellBonus) effects.push('+' + Math.round(record.sellBonus * 100) + '% sale value');
        Object.entries(record.items || {}).forEach(([item, amount]) => effects.push('+' + amount + ' ' + (item === 'food' ? 'rations' : item === 'rtab' ? 'Runic Tablets' : item)));
        return { id, label:id, text:record.text, tag:effects.join(' · ') || 'Memory fragment', effect:effects.length ? 'Keepsake benefit: ' + effects.join(', ') + '.' : 'A personal memory with no combat modifier.', artSource:art[id] || icons.traveler || '', artCell:null };
      })
    })
  });

  function get(id, context = {}) {
    const definition = definitions[String(id || '')];
    if (!definition) return null;
    return {
      step: definition.step,
      kicker: definition.kicker,
      title: definition.title,
      description: definition.description,
      key: definition.key,
      nextLabel: definition.nextLabel,
      progress: definition.progress,
      scene: definition.scene,
      items: definition.getItems(context)
    };
  }

  window.LegendPlayerCreationStepsV094 = Object.freeze({ get });
})();
