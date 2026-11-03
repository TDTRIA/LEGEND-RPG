# LEGEND: The Awakening — Phaser Reboot Prototype

**Status:** Isolated Phaser prototype using the current game's authored content and gameplay systems.

Live preview after GitHub Pages deployment: https://tdtria.github.io/LEGEND-RPG/prototypes/reboot/

## What this build is

The Phaser canvas now provides the world presentation layer: responsive environments, subtle moving atmosphere, scene fades, restrained camera effects and combat/magic feedback. The existing game's accessible HTML interfaces remain over the canvas. This allows the prototype to retain the actual controls and written content while introducing Phaser where it materially improves the experience.

The current production modules are loaded directly for:
- Mandatory annals and the existing anonymous-presence traveler creator.
- Oric's dead-lantern opening and the Blackroot Wolf awakening encounter.
- The Old Road route choice, discoveries, field journal/map, searches, travel, camp, pressure and encounters.
- The original turn-based combat engine, enemy intent, class techniques, equipment mitigation, items, rewards and progression.
- Ashmere's town hub, NPC dialogue, inn, market, forge, crafting, jobs, daily board, journal, traveler sheet and contracts.
- Region unlock/travel, Greyfen Marsh Path, the optional Silted Storehouse and Ashmere's Bell Cellar.

The production title menu, realm overview/news dispatch, News & Roadmap page, Credits, accessibility settings, and persistent in-world shell now also come directly from the current game. The detailed feature-by-feature inventory and boundaries are in [MIGRATION_MATRIX.md](./MIGRATION_MATRIX.md).

## Save and integration boundary

- The prototype writes only the browser-local key legend-reboot-prototype-save-v1.
- It does not read or write the production legend-roads-of-ashmere-v09 save key.
- It does not connect to Supabase, cloud saves, production account slots, profile management or sign-in.
- The Profile menu entry is hidden; current local accessibility settings and the other production title surfaces remain available.
- It uses current local production artwork and the existing game modules; no story, enemy, item, reward or region content is fabricated to fill gaps.

## Controls and layout

- Mouse/touch controls use the same production actions and panels as the original game.
- Keyboard focus remains on the HTML controls; Phaser handles canvas rendering and scene effects.
- The canvas and content panels resize with the browser window. Reduced-motion preferences suppress the larger scene transitions and mote animations.
- The “Open Current Game” link leaves the isolated prototype and opens the production game.

The older experimental rune-training mini-game and sample-only goblin combat have been removed because they were not connected to the current game's implemented mechanics.
