/* LEGEND v0.20.36 - current traveler record construction.
 * The creation flow owns choices and presentation; this module owns the resulting
 * player record and its starting inventory/equipment contract.
 */
(() => {
  const STARTING_INVENTORY = Object.freeze({
    gmail: 0,
    hbone: 0,
    rtab: 0,
    food: 2,
    rfood: 0,
    bait: 0,
    potion: 1,
    camp: 1,
    fur: 0,
    gem: 0,
    log: 0,
    ore: 0,
    morb: 0,
    codeFragment: 0,
    bellFragment: 0,
    roadToken: 0,
    roadCacheKey: 0
  });

  function addItems(inventory, items) {
    Object.entries(items || {}).forEach(([itemId, amount]) => {
      inventory[itemId] = (inventory[itemId] || 0) + amount;
    });
  }

  function create(config = {}) {
    const {
      data = {},
      name,
      gender,
      personality,
      originId,
      classId,
      keepsakeId,
      baseSkills,
      normalize
    } = config;

    const classData = data.classes?.[classId];
    const originData = data.origins?.[originId];
    const keepsakeData = data.keepsakes?.[keepsakeId];

    if (!String(name || '').trim() || !gender?.id || !personality?.id ||
        !classData || !originData || !keepsakeData) {
      return null;
    }

    const inventory = { ...STARTING_INVENTORY };
    addItems(inventory, originData.items);
    addItems(inventory, keepsakeData.items);

    const player = {
      version: data.VERSION,
      username: name,
      gender: gender.id,
      genderLabel: gender.label,
      pronouns: gender.pronouns,
      personality: personality.id,
      personalityLabel: personality.label,
      creationV094: {
        gender,
        personality,
        bonuses: personality.bonus || {}
      },
      world: 'Eldermere',
      town: 'Ashmere',
      origin: originId,
      className: classId,
      keepsake: keepsakeId,
      level: 1,
      hp: classData.hp,
      maxHp: classData.hp,
      xp: 0,
      gold: classData.gold + (originData.gold || 0),
      weapon: 'hand',
      armor: 'none',
      ownedWeapons: { hand: 1 },
      ownedArmor: { none: 1 },
      inventory,
      bank: [0, 0, 0, 0, 0],
      stats: {},
      flags: { introV094Complete: false, tutorialStep: 'people' },
      traits: [personality.label],
      momentum: 0,
      skills: typeof baseSkills === 'function' ? (baseSkills() || {}) : {},
      mastery: {},
      questLog: [
        'Ashmere Welcome: Speak to someone in the Town Square.',
        'Old Road Proof: Prepare in town, travel the Old Road, and return with Road Tokens.'
      ],
      memories: [
        'You woke beneath a dead lantern outside Ashmere.',
        'Identity: ' + gender.label + ', ' + gender.pronouns + '.',
        'Personality: ' + personality.label + '. ' + personality.text,
        'Origin: ' + originId + '. ' + originData.text,
        'Keepsake: ' + keepsakeId + '. ' + keepsakeData.text
      ]
    };

    return typeof normalize === 'function' ? normalize(player) : player;
  }

  window.LegendPlayerRecordV094 = Object.freeze({ create });
})();
