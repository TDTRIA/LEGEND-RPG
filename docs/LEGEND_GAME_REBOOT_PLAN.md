# LEGEND — Game Reboot & Playable Foundation Plan

**Status:** Design proposal; production Phaser migration approved by the owner on 2026-11-03 and partially applied  
**Current source build:** v0.30.5, browser-based, desktop-first with mobile compatibility. The production title is **LEGEND: The Awakening**. Phaser 4.1 is active in the production world layer, and the full migration of existing production screens and interactive surfaces remains underway. The underlying gameplay modules remain authoritative; implementation must follow the production migration acceptance gates in [PHASER_MIGRATION.md](PHASER_MIGRATION.md) and the current [roadmap](ROADMAP.md). The primary presentation reference is [Darkest Dungeon Creative Direction](DARKEST_DUNGEON_DIRECTION.md), not a template to copy.  
**Purpose:** Replace incremental screen polishing with a coherent design for a dark-fantasy RPG that has animated exploration, magic, trainable skills, active turn-based combat, a cinematic opening, and room to grow across a shared world.

**Related documents:** [Fantasy RPG Direction: Monster Wars & the Awakening](LEGEND_FANTASY_RPG_DIRECTION.md), [World & Story Bible](LEGEND_WORLD_BIBLE.md), [Mystery & Story Arc Blueprint](LEGEND_MYSTERY_AND_STORY_ARC.md), [First-Session Story Spine](ASHMERE_STORY_SPINE.md), [Series & Title Reframe](LEGEND_SERIES_CONTINUITY_REFRAME.md), [Character Compendium](LEGEND_CHARACTER_COMPENDIUM.md), [Culture & History Atlas](LEGEND_CULTURE_AND_HISTORY_ATLAS.md), [Roadmap](ROADMAP.md), [Art Direction](ART-DIRECTION.md), [Darkest Dungeon Creative Direction](DARKEST_DUNGEON_DIRECTION.md), [Phaser Production Migration](PHASER_MIGRATION.md).

---

## Current product identity — 2026-10-16

The current title is **LEGEND: The Awakening**; “The Unquiet Road” is a retired working subtitle. The production title should look and behave like a classic fantasy RPG menu. The isolated reboot prototype remains separate, but production migration to Phaser has now been approved. The live game uses a hybrid runtime while the owner-approved migration proceeds. Preserve production saves and move gameplay surfaces one at a time with parity tests.

## 1. The honest diagnosis

LEGEND has useful foundations already: the Ashmere and Greyfen locations, named NPCs, quests, an inventory and economy, crafting, player progression, route choices, enemy art, battle audio, regional gates, and saved traveler data. These are valuable design and content assets.

The current runtime is largely a hand-built HTML/JavaScript application. Towns, route events, dialogue, combat, and menus are repeatedly composed as interface states. That is a fast way to create a functional prototype, but adding fades and more artwork to it will not automatically make it feel like a continuous game world. The presentation, input model, animation system, and battle flow need to be designed together.

The project should stop accumulating disconnected screens and instead prove one coherent playable experience. Do not throw away existing content blindly, and do not rewrite the entire production game before a new foundation demonstrates that it is meaningfully better.

## 2. Recommendation: keep the browser as the product, replace the game layer

### Recommended first option: Phaser 4.1

Use Phaser as the candidate 2D game runtime, initially in an isolated proof of concept. Phaser is designed for browser-based 2D games and includes scenes, sprite animation, tweening, input, and WebGL/Canvas rendering. Official references: [Phaser overview](https://docs.phaser.io/), [Scenes](https://docs.phaser.io/phaser/concepts/scenes), [Animations API](https://docs.phaser.io/api-documentation/class/animations-animationmanager), [Tweens](https://docs.phaser.io/phaser/concepts/tweens).

The shipping target remains the desktop browser, with mobile compatibility. Phaser is a better first experiment than rewriting everything in raw canvas code or trying to force the existing DOM screens into feeling animated. HTML can still be used for accessible menus, dialogue text, account flows, and inventory panels; the game world and action presentation should have a persistent rendering layer.

### Why not immediately move the project to Godot?

Godot is a credible option if a standalone downloadable desktop game becomes the primary product. It offers a fuller visual scene editor and engine workflow. However, the current product is browser-first, and Godot's web export uses WebAssembly and WebGL 2.0, with platform and deployment considerations that need testing. References: [Godot web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html).

Do not choose an engine because it sounds more like a “real game engine.” Choose the one that best serves the target platform, production process, animation needs, and future maintenance. If a Phaser prototype feels right and works on the target browsers, keep it. If the desired visual direction grows toward complex authored scenes, a downloadable desktop game, or editor-driven level construction that Phaser cannot serve efficiently, reassess Godot with evidence.

### Non-negotiable migration rule

Build a separate playable proof of concept before replacing production code. Keep the existing browser build available while the experiment is evaluated. Phaser 4.1 is now a production dependency. Treat the Section 13 proof-of-concept criteria as historical evaluation guidance; the current migration acceptance criteria are defined by the updated product roadmap and active handoff. Do not change save behavior as part of engine migration.

## 3. The experience we are actually building

### Core fantasy

A traveler crosses a dark, magical world where ancient powers left wounds in the land. Towns have ordinary needs, kingdoms have competing interests, monsters have ecologies, and magic can protect a village or make its problems worse. The player grows by practicing skills, building relationships, earning access, exploring dangerous places, and choosing what sort of person to become.

The setting must feel like a fantasy RPG first. The road is a way to travel through the world, not the source of every mystery. Bells are not the cosmology, and not every villain, monster, ruin, or tragedy should secretly belong to the central plot.

### The core loop

1. Return to a settlement that feels alive and can be revisited.
2. Speak with people, train skills, craft, shop, take local work, and prepare.
3. Choose a destination, route, companions, supplies, and risk level.
4. Explore an animated location with encounters, environmental clues, secrets, and optional activities.
5. Fight, negotiate, sneak, gather, or use magic to overcome a problem.
6. Return with experience, loot, materials, information, relationships, and consequences.
7. Invest rewards in training, spells, equipment, new travel permits, and future opportunities.
8. Revisit familiar locations and see how events and player choices changed them.

Every expedition should contain a beginning, a discovery or complication, a consequential decision, and a return or resolution. Travel should never feel like a series of unrelated modal dialogs.

## 4. Story reboot: widen the mythology beyond Ashmere

**Direction status:** this proposal supersedes the Pale Surveyor / Hollow Mile as the default direction. CANON L1–L7 is authoritative wherever this document differs: the Hollow Saint and Last Mercy are the deepest threat; the Veil was wounded by the Last Mercy and its wound makes echoes; echoes are things the Veil made or touched; hostile goblins and ogres are touched creatures; and an old war between monsters and kingdoms ended in an agreement now being broken. The Five Arts as named disciplines, Strain, the Afterwake, and detailed magic mechanics remain proposals. The older ideas may be retained as optional discarded concepts, but should not expand by inertia. Bells remain ordinary local currency and civic signal-making, not the franchise's central supernatural mechanism.

### The magic of the world

Magic flows through a boundary commonly called **the Veil**, where the living world brushes against an older, stranger depth. Scholars describe it as a natural force; priests describe it as a sacred threshold; witches and hedge-mages treat it as a relationship with forces that do not think like people. None of these schools has the complete explanation.

The Veil is not a moral force. Magic can heal, grow food, protect roads, change weather, bind a monster, preserve a memory, or tear a hole in the boundary between living and dead. It does not provide free solutions. Powerful use creates **Strain**: fatigue, distorted senses, damaged materials, hostile attention, or a temporary loss of control. Different arts produce different risks.

### The Five Arts (working design)

- **Ember:** heat, force, metal, bursts of destructive power, and alchemical transformation.
- **Tide:** water, restoration, adaptation, currents, and glimpses of lingering impressions.
- **Root:** stone, plants, endurance, wards, growth, and binding.
- **Gale:** motion, precision, wind, lightning, initiative, and evasive techniques.
- **Veil:** shadows, spirits, concealment, dreams, and contact with things that should remain beyond the living world.

These are disciplines, not rigid classes. A character can learn more than one, but training takes time and builds trade-offs. Wards can be broken; fire consumes fuel; healing can create Strain; spirit bargains carry obligations. Veil magic is not automatically evil, but it is the easiest art to misuse because its effects can be mistaken for a loved one's return.

### The deeper danger: the Last Mercy

**Working antagonist direction, not canon:** During an ancient plague and war, a renowned healer-mage tried to prevent a city's dead from being lost to oblivion. The ritual was remembered as the **Last Mercy**. It did not restore complete souls. It caught impressions—memories, habits, fears, desires—and let them imitate the dead. The effort damaged the Veil, creating a phenomenon called **the Afterwake**: places where memory, spirit, and living matter overlap in unstable ways.

The healer, now known in forbidden accounts as **the Hollow Saint**, has persisted through the ritual and the people who maintain it. It promises to return those whom the world has taken: children, soldiers, lovers, rulers, whole lost households. Many who follow its promise are not fools or villains. They are bereaved people desperate enough to accept a miracle.

The danger is that an echo can sound like a person without being that person. Sustaining the ritual drains living vitality and weakens the separation between life and death. What begins as a desperate act of mercy becomes a vast refusal to accept loss, and eventually a threat to the living world.

The villain should be frightening because it offers something people genuinely want—not because every event is secretly its plan. The Hollow Saint may exploit the Afterwake, but floods still happen, nobles still abuse power, creatures still hunt, and people still harm each other for independent reasons.

### The monster invasion: the visible crisis

The Last Mercy and the Afterwake are the leading candidate for the deeper supernatural danger, but the player's first understanding of the crisis should be physical and immediate: monster attacks are increasing, trade routes are unsafe, settlements need defenders, and dangerous creatures are moving out of territories that used to contain them.

- **Goblins** raid farms, workshops, and supply caravans. Some are opportunists; others have been collecting specific relics, minerals, or objects from old sites.
- **Orcish clans** gather under competing banners. One faction may be trying to exploit the upheaval, another may believe it is fulfilling an old obligation, and another may be fighting to keep an altered territory from spreading. Their motives should not be identical.
- **Ogres** emerge from mountain passes and become siege-level threats. Some are driven out by changes deep underground; others remain territorial monsters with no special connection to the main plot.
- **The Changed** are animals, monsters, plants, or people altered by exposure to Afterwake conditions. Their mutations should show regional patterns and readable rules, not random “evil magic.”
- **Independent threats**—bandits, predators, rival rulers, old feuds, and ordinary dungeon dangers—remain part of the world and need not be explained by the Hollow Saint.

The relationship between invasion and awakening should unfold in stages. Early quests establish attacks and defend people. Mid-game clues show that some monster groups are moving toward or away from particular sites, reacting to magical signs, or seeking specific objects. Later regional stories reveal that the Afterwake is changing the balance of the world and that the Last Mercy may be involved. Only late in the game should the player understand how much of the crisis is caused, exploited, or merely accelerated by the central threat.

**Do not make every monster a controlled minion.** The invasion becomes more believable when factions have competing goals, different levels of knowledge, and the ability to make their own decisions. Some monsters may be victims of the awakening; others may be its servants or opportunists; many should remain ordinary dangers.

### The world has other powers and conflicts

This central threat should sit alongside—not replace—regional powers: ambitious rulers, trade leagues, local spirits, old gods, guilds, monster territories, religious orders, and people who simply want to survive. Some factions study the Veil to heal; some regulate magic after past disasters; some sell dangerous relics; some hunt anything touched by the Afterwake; some protect spirits from being exploited.

The world bible should eventually answer what is known about the Veil, death, divine beings, non-human peoples, the old empires, and magical costs. Do not solve all of that in one exposition dump, and do not let one antagonist explain every culture.

## 5. Bells, money, and unlocking travel

### Bells as Ashmere currency

Common **Bells** are locally minted coins/scrip used in Ashmere's shops, repairs, food, lodging, training, and trade. Their name comes from the mint mark or local tradition, not from a cosmic artifact. Variants may be accepted differently in distant markets. The currency should be clear to players and useful for everyday choices.

Keep these concepts distinct:

- **Bells:** ordinary currency.
- **Old Bell / bell relics:** optional local objects or signaling history; their importance is local unless a later story earns more.
- **Region access:** earned through a combination of cost, travel preparation, route permits, relationships, guild standing, proof, or resolving local obstacles—not by pretending that every region is magically locked by a bell.

This preserves the original idea of investing Bells to open new opportunities while making expansion flexible. A player may pay for a caravan place, fund a bridge repair, obtain a guild license, help a local guide, or earn trust from a settlement. Money is one resource among several.

## 6. Shared geography and expansion runway

The regions below are a world map and content runway, not a one-region-per-game release plan. Existing and planned locations can be revisited across the main game and future titles, with visible changes to routes, leadership, local needs, and player relationships.

### Existing / planned core regions

| Region | Identity and gameplay | Magical and narrative role |
|---|---|---|
| **Ashmere Vale** | Main home region, trade, guilds, training, preparation, side jobs, and returning characters | A grounded starting point where the first hints of wider magic appear; Bells are ordinary currency here |
| **The Old Road** | Travel network between settlements, branching route choices, camps, ambushes, shrines, and hidden places | One route through the world, not the origin of all supernatural events |
| **Greyfen** | Marshes, raised paths, ferries, salvage, fishing, flooded ruins, local politics | Tide and Veil practices; spirits and wetland creatures with their own histories |
| **Ironpass** | Mountain routes, mines, forges, caravans, dangerous descents, industrial labor | Runic craft, Ember training, metalworking, mountain beasts, and resource conflicts |
| **Blackwood** | Deep forest, hunting paths, old groves, living ruins, isolated settlements | Root and Gale techniques, bargains with non-human powers, changing paths and dangerous ecology |
| **The Ruined March** | War-scarred borderland, forts, refugee settlements, battlefields, disputed claims | The Afterwake may be strongest here, but many dangers remain ordinary products of war and neglect |

### Expansion candidates

| Region | Identity | What makes it playable and distinct |
|---|---|---|
| **The Sable Coast** | Storm ports, salt towns, cliffs, shipwrecks, sea caves, island ferries | Tide magic, naval travel, salvage disputes, weather exposure, sea monsters, and port factions |
| **Glassreach** | Sun-baked plateau, glass deserts, buried observatories, caravan cities | Light and heat effects, mirage navigation, ancient arcane instruments, caravan logistics |
| **Crownfrost** | Northern holds, glaciers, pine settlements, frozen shrines, long dark seasons | Frost variants of Ember/Tide, survival preparation, ice traversal, exile clans, and ancient beasts |
| **Thornreach** | A borderland where an ancient forest meets a stranger realm | Root and Veil magic, bargains that have enforceable costs, shifting paths, and non-human courts that are neither wholly good nor evil |
| **The Sunken Reach** | A drowned imperial district, broken sea walls, flooded libraries and collapsed streets | Diving, water-level changes, relic recovery, and a different interpretation of the old empire's magical catastrophe |

Do not build all five expansions at once. First prove the core loop in Ashmere and one neighboring region. Then add regions only when each has a new traversal pattern, a local economy, an original visual identity, a distinctive enemy ecology, a signature skill activity, and a self-contained story arc.

## 7. Skills that are trained by doing

Skills should have readable levels, clear rewards, and a satisfying relationship between player practice and character growth. Mini-games are a way to express a skill—not chores the player must repeat forever. Every training activity needs a quick resolution option and accessible alternatives so it never becomes an obstacle to the main story.

### First skill families to prototype

| Skill | Training activity | How it feels in the world | Gameplay payoff |
|---|---|---|---|
| **Weapon Mastery** | Timed strikes, spacing, and parry drills | Sparring ring or captain's yard | Better combo timing, weapon techniques, improved stagger |
| **Defense** | Read an opponent's wind-up and choose dodge, block, or counter | Watch training or monster study | Better defensive windows, reduced Strain/damage |
| **Smithing** | Heat management and hammer timing across a short sequence | Ashmere forge / Ironpass | Stronger gear, repair quality, weapon modifiers |
| **Alchemy** | Sequence ingredients and control heat/timing | Lab table, apothecary, field kit | Potions, antidotes, oils, temporary buffs |
| **Tracking & Survival** | Find a trail from ground signs; choose the next most likely clue | Forest, marsh, mountain or road | Hidden encounters, better gathering, safer route choices |
| **Gathering** | Identify the right plant/mineral and avoid damaging the useful part | Field node / cave | Higher yields and rare materials |
| **Rune Craft** | Trace a glyph pattern and stabilize its rhythm/shape | Mage's study, shrine, old ruin | Spell unlocks, wards, weapon inscriptions |
| **Magic Control** | Balance a moving current inside a safe band; release at the correct moment | Practice circle or mentor lesson | Lower Strain, improved spell power/control |
| **Fishing** | Read tension and react to directional movement | Greyfen and Sable Coast | Food, rare ingredients, local requests |

Trainable skills improve through meaningful use and specific practice. The minigame result should grant a modest quality or mastery bonus, while the character's underlying skill level still matters. This prevents player dexterity alone from making a low-level character outperform an expert in every situation.

### Magic progression

Players should learn spells from teachers, discoveries, relics, factions, and quests—not only a level-up list. A spell has:
- a clear tactical job;
- an art/school, Strain cost, and upgrade path;
- an animation and audio signature;
- at least one interaction with enemies, the environment, or a skill;
- a readable failure or backfire state.

Start with a small set: a reliable offensive spell, a ward, a control spell, a healing/restoration spell, and one exploration spell. Add depth before adding dozens of shallow spells.

## 8. Combat redesign: active turn-based combat with readable intent

The combat prototype should be built as a new scene, not a restyled text panel.

### Core battle rhythm

1. Enemies enter with an animated arrival and a readable stance.
2. Their next intent is telegraphed through animation, icon, sound, or target marker.
3. The player chooses an action, spell, item, team command, guard, or escape.
4. Attacks animate through wind-up, strike, impact, hit reaction, and recovery.
5. Well-timed defense offers a dodge, block, parry, or counter window where appropriate.
6. Weaknesses, statuses, stagger, terrain, and party synergy create decisions beyond repeating the strongest attack.
7. Victory, retreat, or defeat transitions smoothly back to the world with loot and persistent consequences.

### First combat design

- Use a compact party of up to three active characters when party companions are introduced; do not require a full party system before the first test.
- Each character has a distinct role and limited skill loadout, not a giant menu of indistinguishable actions.
- Enemies telegraph two or three recognizable behaviors. Heavy attacks can be interrupted or evaded; defensive enemies have a guard that can be broken; magical enemies build a visible dangerous charge.
- Add **Stagger** or **Guard Break** as a tactical pressure mechanic rather than making every enemy a large health bar.
- Magic consumes a tactical resource and creates Strain; defensive play, equipment, and skill mastery make resource management meaningful.
- Feedback must be visual and audible: hit stop, small camera impulse, floating damage text, sprite tint or flash, status icons, battle log summary, and unique sounds. Use restraint so effects communicate the action instead of obscuring it.
- Encounters need variety: single dangerous enemy, several weak opponents, armored enemy, enemy caster, ambush, optional boss, and fights that can be avoided or solved through preparation.

The game must remain turn-based at its core. The timing elements should reward attention without turning every action into a reflex test. Offer simplified timing/accessibility settings.

## 9. Visual presentation: stop feeling like disconnected web pages

### Persistent game stage

The game should have one persistent rendered world. UI panels can appear above it, but opening dialogue or inventory should not feel like leaving the game for another page. Keep scene identity stable while menus slide, fade, or overlay the environment.

Recommended structure:
- **Game canvas:** background, animated actors, environment objects, effects, camera and transitions.
- **Persistent HUD:** traveler health, resource/Strain, active objective, quick actions, Bells, party indicators.
- **Context interaction layer:** nearby NPC prompt, gathering action, door/route label, or dialogue.
- **Overlay panels:** inventory, character, map, journal, vendors, training and settings. These open and close with consistent transition language and retain state.
- **Scene controller:** knows whether the player is exploring, in dialogue, training, in combat, in a cutscene, or in a menu; actions must not conflict across states.

### Title screen

The title should be a living scene rather than a large static background:
- slow camera movement across an illustrated environment;
- rain, fog, drifting leaves/embers, moving water, lantern light, cloth or foliage movement where assets support it;
- one or two distant moving silhouettes, not a busy screen of effects;
- a subtle audio bed and responsive menu sounds;
- the logo and menu controls remain readable over the scene;
- Begin, Continue, Settings, and Credits use consistent visual behavior;
- Continue appears only when a valid save exists.

Art for character portraits, environments, monsters, and effects should use the established Runway-based asset workflow and be reviewed for consistency. Do not replace named character art with homemade geometric placeholders.

### Opening cinematic

Build a **60–90 second skippable cinematic** inside the engine, using animated scenes, camera moves, sound cues, layered imagery, character silhouettes/approved assets, and short lines of narration. Avoid a sequence of separate slideshow screens.

Proposed beat outline (all narrative content still subject to approval):
1. **The world in motion:** wide shot of travelers crossing a vast landscape; weather and distant settlements establish scale.
2. **Magic is real:** a trained mage uses a visible art to save someone from a dangerous creature or collapsing environment; the spell has a cost.
3. **The old wound:** a brief vision of an abandoned battlefield or ruined sanctuary where something appears to answer a funeral rite.
4. **The choice:** the traveler is forced to act during a small attack or roadside crisis; this gives the player one low-risk interactive moment.
5. **Arrival:** camera follows the traveler toward Ashmere as daylight breaks; the world scene continues behind the character-creation handoff.
6. **Control passes to the player:** create/choose the traveler through an in-world moment, not a form detached from the setting.

The cinematic should introduce atmosphere and a question, not explain the ancient history. It must be skippable, replayable from the journal/settings, compatible with keyboard and mouse, and tested for audio/sound-off use. The existing dead-lantern opening can be retained, rewritten, or replaced only after the opening prototype is compared against this outline.

## 10. Animation and art production

A coherent art system matters more than the number of images. Before broad asset production, lock target resolutions, sprite scale, lighting, palette, material language, and animation requirements.

Priority animation set:
- idle, walk, run, interaction, hurt, fall/defeat, cast, attack, guard/dodge, victory/return for the player;
- idle, telegraph, attack, hit, stagger, special move, and defeat for the first few enemy archetypes;
- NPC idle/gesture/turn where feasible;
- environmental motion for rain, fire, water, fog, leaves, magical particles, and light;
- spell impact and status effect families that can be reused across arts.

Use spritesheets or layered approved artwork where available. When a full frame-by-frame set is not yet available, tasteful camera moves, parallax, image crossfades, shader/filter effects, particles, and character motion can establish life—but should be treated as an interim visual language, not a substitute for animated characters everywhere.

## 11. Technical architecture and save safety

The new game runtime should be modular and data-driven:
- **Scenes:** title, opening cinematic, exploration, dialogue/interaction overlays, training mini-games, combat, victory/defeat, and transitions.
- **Content data:** regions, NPCs, quests, enemies, items, spells, skills, and encounters in separate data files.
- **Game state:** traveler stats, inventory, quest flags, learned spells, skills/mastery, money, region unlocks, relationships, and story outcomes.
- **Persistence adapter:** one place that saves/loads state and maps the legacy v0.20.x save where possible.
- **Asset manifest:** exact local paths and documented provenance for every shipped asset.
- **Input abstraction:** keyboard/mouse as primary, touch-compatible controls, remapping/accessibility options.
- **Audio manager:** independent music, ambience, interface, combat, and effects levels.
- **Testing:** deterministic combat fixtures, save/load tests, skill minigame tests, scene transitions, and desktop-first browser QA.

Do not rename or delete the current save keys casually. Existing saves should be detected, backed up, migrated where practical, or clearly marked as legacy. The player should not lose a traveler just because the presentation engine changed.

## 12. Delivery plan: prove the game before committing to a full rebuild

### Milestone A — Design and visual prototype
Build an isolated Phaser prototype using approved current environment art and local sound. Deliver a living title scene, opening cinematic sequence, one exploration environment, and a minimal animated combat encounter. It is a separate page and must not replace the live build.

**Pass criteria:** It visibly feels more like one continuous game; no screen-per-action loop; title and cinematic flow smoothly; keyboard input works; mobile layout does not break; asset loading is reliable; performance is acceptable in desktop Chrome and is checked on one mobile browser.

### Milestone B — One complete playable slice
In the prototype, add a small Ashmere area with one animated traveler, one interactable NPC, one simple quest interaction, one gathering node, one short skill minigame, one enemy encounter, rewards, and a return to the same location.

**Pass criteria:** The player can walk or navigate through the scene, interact, fight, train, receive a persistent reward, and see the world react without being bounced through a chain of screens.

### Milestone C — Validate progression and magic
Implement the first three skills and three to five spells, including Strain, learning, and upgrades. Test whether mini-games are enjoyable after repeated use and whether combat decisions differ by build.

**Pass criteria:** Every skill activity takes a short, predictable amount of time; practice provides meaningful mastery; accessibility options exist; combat rewards defense, status/weakness play, and spell selection rather than pure repetition.

### Milestone D — Content migration decision
Once the slice passes, map existing quests, data, assets, and saves to the new runtime. Decide which old systems are retained, rewritten, or intentionally retired. Only then add the new engine/runtime to the production branch and revise release milestones.

### Milestone E — Expand the shared world
Build one region to completion at a time, but preserve the map as a shared geography. Add the next region only after its traversal, visual identity, skill activity, local economy, enemies, quests, and hub loop are distinct. Future titles can revisit these regions with updated state and consequences.

## 13. Engine proof-of-concept acceptance checklist

- [ ] Phaser version is pinned and licensed/loaded deliberately; no floating latest dependency in production.
- [ ] The title scene animates and responds to mouse and keyboard.
- [ ] The opening cinematic crossfades and moves its camera without feeling like a stack of pages.
- [ ] Character art comes from approved assets, not geometric stand-ins.
- [ ] The player and at least one enemy have visible action/hit animations or reviewed interim animation.
- [ ] Combat telegraphs enemy intent and includes a meaningful defense action.
- [ ] One skill mini-game gives a persistent, testable reward.
- [ ] The experience works at desktop 1440×900 and has no critical break at a narrow mobile viewport.
- [ ] Local assets load on the deployed static host; no required server-side feature has been assumed.
- [ ] Keyboard, sound-off, reduced-motion, and readable-UI behavior are tested.
- [ ] Save/load is tested without modifying the old production save path.
- [ ] The prototype is clearly separated from production and can be removed without affecting the current game.

## 14. The decisions to lock only after the prototype

Do not try to finalize every class, region, faction, spell, and historical event before a playable foundation exists. The proof should tell us:
- whether Phaser is the right runtime for the intended look and input;
- whether the game should be top-down movement, point-and-click exploration, or a deliberate hybrid;
- how much of the world should be explorable versus a rendered scene with meaningful interactions;
- what combat rhythm feels good;
- which skill mini-games are genuinely fun rather than chores;
- how much animation can be delivered with the current asset workflow and budget.

**Success condition:** The first 10 minutes should make a new player want to keep playing even before they understand the deep lore. They should see an alive world, move through a place, speak to someone, use or witness magic, make a choice, and experience an animated consequence.

LEGEND can remain a dark-fantasy RPG with a large future. The next step is not another lore-only commit. It is a small, polished, playable proof that makes the desired game feel real.
