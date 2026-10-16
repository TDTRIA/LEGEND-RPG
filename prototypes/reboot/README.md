# LEGEND: The Awakening — Reboot Prototype

**Status:** Experimental, isolated, and not production gameplay.

Live preview after GitHub Pages deployment: https://tdtria.github.io/LEGEND-RPG/prototypes/reboot/

This prototype tests the direction proposed in [LEGEND Game Reboot Plan](../../docs/LEGEND_GAME_REBOOT_PLAN.md):
- Animated illustrated title scene using existing approved/local environment art.
- A short, skippable opening-cinematic proof using moving/crossfading scenes and draft narration.
- A first combat feel test with enemy intent text, animated strike/guard/spell actions, feedback, and a retreat action.
- A small rune-pattern mini-game as a proof of skill training.
- A first playable Old Road expedition: keyboard movement, stamina-limited sprinting with a stamina HUD, nearby interactions, a recoverable supply cache, a waystone clue, optional warband-track investigation, a goblin scout encounter, battle rewards, and a return-to-Ashmere report.
- A read-only bridge to production `LEGEND_DATA`, the production asset manifest, and Old Road enemy content. The player can select one of the six production classes; class art, HP, starting Bells, attribute modifiers, technique labels, weapon data, and enemy baseline stats now come from the main game's data files.
- A short tutorial encounter with an explicit return-to-exploration transition; the expedition state is kept in memory only.
- Sound toggle and a responsive layout; desktop is the primary review target.

## Boundaries

- It is deliberately separate from the production game.
- It does not write to or migrate production saves.
- The cinematic dialogue and Last Mercy / Veil references are experimental draft ideas, not approved canon.
- This version uses existing project art/audio; no new production assets are generated here.
- It loads the pinned Phaser 4.1.0 browser build from jsDelivr; a production migration should pin and vendor dependencies deliberately and review license/cache/deployment requirements first.
- The prototype's exploration loop is still an experiment: it uses in-memory expedition state and simplified interactions. Production data is read-only; production runtime, saves, and reward persistence are not loaded.
- It does not yet implement persistent quests, party progression, equipment effects, world collision/pathfinding, a production combat system, or save migration. Those remain future milestones.
- Do not merge this experiment into the production runtime until movement, combat, responsive input, accessibility, asset loading, and regression coverage have been reviewed.

Use the “Open current game” link to leave the experiment and play the existing production build.
