# LEGEND: The Awakening — Shared Phaser World

**Status:** The production game at `/` and this optional preview now load the same canonical Phaser engine from `js/engine/phaser-world-v1.js`. The root GitHub Pages entry point is the official player build; this preview remains a safe integration/test bench with its separate local traveler save.

Production game: https://tdtria.github.io/LEGEND-RPG/

Preview/test bench: https://tdtria.github.io/LEGEND-RPG/prototypes/reboot/

## What this build is

Phaser is now the persistent world presentation engine behind every production gameplay screen and the in-world shell. A Phaser-native first-visit engine awakening builds a runic seal over the realm, brings up the camera and scene graph, binds the existing towns, roads and encounter systems, then reveals the production title screen. The splash is skippable, honors Reduced Motion, and plays once per tab session. After startup, the same Phaser scene remains alive underneath the HTML gameplay surfaces: transitions respond to title, annals, traveler creation, Oric's awakening, combat, expeditions, town services, dungeons, results and shell modals. Location-aware atmosphere and combat impact feedback continue throughout play. Both the in-game Reduced Motion setting and the browser/OS preference suppress parallax, ambient animation, flashes and shakes.

The current production modules are loaded directly for:
- Mandatory annals and the existing anonymous-presence traveler creator.
- Oric's dead-lantern opening and the Blackroot Wolf awakening encounter.
- The Old Road route choice, discoveries, field journal/map, searches, travel, camp, pressure and encounters.
- The original turn-based combat engine, enemy intent, class techniques, equipment mitigation, items, rewards and progression.
- Ashmere's town hub, NPC dialogue, inn, market, forge, crafting, jobs, daily board, journal, traveler sheet and contracts.
- Region unlock/travel, Greyfen Marsh Path, the optional Silted Storehouse and Ashmere's Bell Cellar.

The production title menu, realm overview/news dispatch, News & Roadmap page, Credits, accessibility settings, and persistent in-world shell now also come directly from the current game. The detailed feature-by-feature inventory and boundaries are in [MIGRATION_MATRIX.md](./MIGRATION_MATRIX.md).

## Engine and save boundaries

- `js/engine/phaser-world-v1.js` is the only active Phaser engine source. Both root production and this preview load it.
- At `/`, the engine delegates traveler reads/writes to the real `LegendStorage` and `LegendRuntimeV120` production services. It does not replace those objects or change the production `legend-roads-of-ashmere-v09` save key.
- At this preview path, the engine detects preview mode and uses only `legend-reboot-prototype-save-v1`. It does not read or write production saves or cloud profiles.
- The preview intentionally omits Supabase/account screens; the production root continues loading the real account, sign-in, profile, and cloud traveler modules.
- Both modes reuse the current game modules and local artwork; no story, enemy, item, reward, or region content is fabricated to fill gaps.

## Controls and layout

- Mouse/touch controls use the same production actions and panels as the original game.
- Keyboard focus remains on the HTML controls; Phaser handles canvas rendering and scene effects.
- The canvas and content panels resize with the browser window. Reduced-motion preferences suppress the larger scene transitions and mote animations.
- The preview is a test bench, not a second engine. The production root is the only live player entry point.

The older experimental rune-training mini-game and sample-only goblin combat have been removed because they were not connected to the current game's implemented mechanics.
