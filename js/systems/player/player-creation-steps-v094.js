/* LEGEND v0.20.36 - traveler creation step catalog.
 * Owns step copy and transforms current class/origin/keepsake catalog records into
 * choice cards. State, navigation callbacks, view binding and record persistence
 * stay with the existing creation controller.
 */
(() => {
  const definitions = Object.freeze({
    gender: Object.freeze({
      step: 2,
      kicker: 'Identity',
      title: 'How does Ashmere know you?',
      description: 'This shapes how your traveler is described, never what you are allowed to become.',
      key: 'gender',
      nextLabel: 'Choose Personality',
      progress: 'Decide what the world sees first. You can revisit the details before setting out.',
      scene: 'The gatekeeper lifts a lantern, waiting for a name and a face to match. There is no correct answer—only the one that feels like yours.',
      getItems: context => context.genderOptions || []
    }),
    personality: Object.freeze({
      step: 3,
      kicker: 'Temperament',
      title: 'What survived with you?',
      description: 'Your instinct gives a small starting bonus and colors the way you meet the world.',
      key: 'personality',
      nextLabel: 'Remember Your Past',
      progress: 'Every survivor has a habit that kept them alive.',
      scene: 'A memory comes back in a flash: a hand reaching out, a door closing, a choice made in the dark. Which instinct did you carry through?',
      getItems: context => context.personalityOptions || []
    }),
    origin: Object.freeze({
      step: 4,
      kicker: 'Origins',
      title: 'Who were you before?',
      description: 'Your past is part of your story, not a cage. Origins can add skills, supplies, or a little coin.',
      key: 'origin',
      nextLabel: 'Choose Your Calling',
      progress: 'Before the road found you, you belonged somewhere—or you made your own way.',
      scene: 'Rain runs down the old milestone. For a moment you remember a place, a voice, and the reason you left. What part of that life still travels with you?',
      getItems: context => Object.entries(context.data?.origins || {}).map(([id, record]) => ({
        id,
        label: id,
        text: record.text,
        tag: Object.entries(record.bonus || {}).map(([key, amount]) => '+' + amount + ' ' + key).join(', ')
      }))
    }),
    class: Object.freeze({
      step: 5,
      kicker: 'Calling',
      title: 'How do you survive?',
      description: 'Choose the playstyle that sounds fun. Each class begins with its own strengths and a distinct battle technique.',
      key: 'class',
      nextLabel: 'Choose a Keepsake',
      progress: 'You are not choosing your whole future—just the first tool you trust.',
      scene: 'At the edge of the gate, the guard asks what you can do when the road turns cruel. You think of the skill you reach for before fear can answer.',
      getItems: context => Object.entries(context.data?.classes || {}).map(([id, record]) => ({
        id,
        label: id,
        text: record.desc,
        tag: 'HP ' + record.hp + ' · ' + record.move
      }))
    }),
    keepsake: Object.freeze({
      step: 6,
      kicker: 'Keepsake',
      title: 'What did you refuse to leave behind?',
      description: 'A small object can carry a memory—or give you an edge when the road gets hard.',
      key: 'keepsake',
      nextLabel: 'Review Your Story',
      progress: 'One last piece of your old life remains in your pack.',
      scene: 'Your hand finds something familiar beneath the wet cloth in your pack. For the first time since waking, the fog feels a little less empty.',
      getItems: context => Object.entries(context.data?.keepsakes || {}).map(([id, record]) => ({
        id,
        label: id,
        text: record.text,
        tag: Object.entries(record.bonus || {}).map(([key, amount]) => '+' + amount + ' ' + key).join(', ')
      }))
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
