# LEGEND: The Awakening

**LEGEND: The Awakening** is an in-development dark-fantasy browser RPG about a traveler waking on a dangerous road, finding a home in Ashmere, and carrying the consequences of each expedition back into the world.

- **Production build:** v0.30.5
- **Platform:** HTML5 browser game; desktop-first with responsive mobile support
- **Realm Hub:** https://tdtria.github.io/LEGEND-RPG/portal.html
- **Live game:** https://tdtria.github.io/LEGEND-RPG/
- **Status:** Active development; not a finished 1.0 release

## Current production snapshot

The production game includes three mandatory opening annals, a memory-led traveler creator, the dead-lantern road opening, Captain Oric and the Blackroot Wolf tutorial, a five-stage Old Road expedition, turn-based combat, Ashmere services, traveler progression, and early Greyfen activities.

The first journey leads players onto the Old Road before they return to Ashmere. The road has High Ridge and Reed Cut route choices, discoveries, camps, a saved map/field journal, travel time, Road Pressure, and recurring danger. A careful route is not a guaranteed safe route: an encounter is forced after two travel stretches.

At the baseline Pressure of 20, a completed five-stage expedition settles 80 gold and 33 XP and has a 65% Road Token roll. Early returns do not receive that completion token. Bell Fragments are uncommon: 35% on the Reed Cut roll, 25% from recurring clue interactions, and 15% from a Lantern Wisp. The result ledger shows settlement, discoveries, token outcome, and level progress. Level-ups preserve the existing saved attribute-allocation choice.

Ashmere contains the town hub and its working destinations and services: Inn, Market, Forge/Workshop, Archive, people, Work Board, trading, crafting, equipment, recovery, records, and expedition preparation. Greyfen has playable pieces including Patch the Ferry Nets, Marsh Path activity, local progression materials, and the optional Silted Storehouse detour. **Greyfen is not yet a complete town/story/economy loop; Ironpass is future content.** The first three towns are a target, not a claim that all three are finished.

## Engine transition

The owner approved moving the **entire production game's presentation and interactive surfaces into Phaser 4.1** on 2026-11-03. Phaser is already active in production for the persistent world scene, atmosphere, transitions, Ashmere landmarks, new-player title, annals, traveler creation, and Oric's opening-road presentation.

**The whole-game migration is still in progress.** The remaining work is not a new-game rewrite: migrate every existing production surface—persistent HUD/navigation/drawers, Ashmere and services, Old Road/maps/journal, dialogue/events, combat, results/level-up, dungeons/regions, inventory, settings, account, and remaining overlays—into Phaser one complete playable surface at a time.

Keep the existing production controllers and systems authoritative. Phaser should own scene presentation and the migrated interaction layer while calling the real callbacks and consuming the real state. Do not replace or duplicate combat, quests, rewards, progression, economy, inventory, player storage, account/cloud saves, or save schemas as a shortcut. Keep the working DOM presentation visible until its Phaser replacement passes desktop/mobile visual, accessibility, interaction, state, persistence, and focused Playwright checks. See [the full migration inventory and acceptance gates](docs/PHASER_MIGRATION.md).

## Creative direction

**Darkest Dungeon is now LEGEND's primary high-level creative reference**, replacing the earlier World of Warcraft / Diablo comparison. We are taking inspiration from expedition-led dark fantasy, stark illustrated atmosphere, strong character silhouettes, expressive dialogue, tactical clarity, and in-world field reports—not copying its art, characters, interface, writing, sounds, or mechanics. This direction shapes how the existing game is presented in Phaser; it does not pause or narrow the migration.

Read [docs/DARKEST_DUNGEON_DIRECTION.md](docs/DARKEST_DUNGEON_DIRECTION.md) for the approved principles and boundaries.

## Audio transition

The generated soundtrack is now integrated in production main and deployed. The game includes the 48-asset original library (13 location/prologue ambience loops and 35 one-shot effects) plus the separately rendered roughly 10½-minute LEGEND main-theme MP3. The integration is merged in [PR #98](https://github.com/TDTRIA/LEGEND-RPG/pull/98); the merge commit's [GitHub Pages deployment succeeded](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41718562597).

The production `LegendRoadAudioV100` director keeps one recurring theme and one location ambience loop, follows the Phaser environment/surface transitions, and preserves `legend-road-sound` as the existing sound preference. Generated title/menu cues and turn-based battle effects now use the new files. The additional world, creature, travel, town, reward, and dungeon effects are mapped in the director for ongoing event-specific wiring.

The replacement theme is integrated, but final human listening is still required for audible playback, mix balance, repeat seam, and long-session fatigue. The production Phaser migration also remains incremental: Phaser owns the persistent world presentation, while most gameplay screens and rules remain in their existing modules until each native Phaser surface has parity.

## Current priorities

1. **Finish the full production Phaser migration.** Continue from the persistent shell and Old Road work, then migrate Ashmere/services, remaining journey and journal surfaces, combat, results/level-up, dungeons/regions, and all auxiliary overlays. Preserve the existing systems and prove parity screen by screen.
2. **Complete audio QA.** Listen to the deployed theme and ambience in the real browser build, verify levels and loop seams, then wire the remaining generated world/town/reward effects to their successful gameplay actions.
3. **Finish Greyfen as a coherent region.** Complete its town services, local economy, story resolution, expeditions, rewards, and return loop.
4. **Keep the Old Road challenging and progression meaningful** through long-run balance and real-player testing.
5. **Keep public information current.** Blog, development dispatch, player guide, store copy, roadmap, and changelog must distinguish shipped features from preview/in-progress work.

See [docs/ROADMAP.md](docs/ROADMAP.md) for priorities and acceptance criteria. See [docs/CANON.md](docs/CANON.md) before making story or dialogue changes.

## Play now and follow development

- **Live game:** https://tdtria.github.io/LEGEND-RPG/
- **Player guide:** https://tdtria.github.io/LEGEND-RPG/guide.html
- **Development chronicle:** https://tdtria.github.io/LEGEND-RPG/blog.html
- **Development dispatch:** https://tdtria.github.io/LEGEND-RPG/updates.html
- **Playtest feedback:** https://tdtria.github.io/LEGEND-RPG/feedback.html
- **Save Vault:** https://tdtria.github.io/LEGEND-RPG/save.html
- **Experimental reboot prototype:** https://tdtria.github.io/LEGEND-RPG/prototypes/reboot/ (isolated proof of concept; not the production runtime)
- **Repository:** https://github.com/TDTRIA/LEGEND-RPG

## Architecture and important files

- index.html — production entry point, script order, and Phaser loading
- js/engine/phaser-world-v1.js — active Phaser world renderer
- js/game.js — title/bootstrap/navigation adapter
- js/data.js — shared game data and active version
- js/storage.js — authoritative player save/load/normalization facade
- js/systems/ashmere-controller-v099.js — Ashmere town routing
- js/systems/road-controller-v100.js — active Old Road expedition controller
- js/systems/road/road-audio-v100.js — road sound preference, effects, and current battle music lifecycle
- js/systems/title-audio-v120.js — title ambience, menu cues, and audio unlock
- docs/ARCHITECTURE.md — module map and script-order contracts
- docs/SAVE_DATA_CONTRACT.md — persistent player fields and compatibility rules
- docs/ADDING_FEATURES.md — safe feature insertion points
- docs/CANON.md — locked story decisions
- docs/PHASER_MIGRATION.md — complete production Phaser migration inventory and gates
- docs/DARKEST_DUNGEON_DIRECTION.md — approved creative reference and presentation principles
- prototypes/reboot/ — isolated engine/design proof of concept

## Development and testing

Node.js 22 LTS or newer is recommended.

```bash
npm install
npx playwright install
npm run test:e2e
```

Use the [Playwright Tests workflow](https://github.com/TDTRIA/LEGEND-RPG/actions) for hosted regression checks. The lightweight playtest.html support runner is not a replacement for the full Playwright suite. See [TESTING.md](TESTING.md) for the current verification checkpoint.

## Compatibility guardrails

- Preserve the active player save key: legend-roads-of-ashmere-v09.
- Keep LegendStorage as the only owner of player save/load/normalization.
- Preserve quest flags, inventory, combat formulas, progression, reward odds, account/cloud-save behavior, and accessibility during the Phaser migration.
- Do not describe Greyfen or future regions as complete before their full playable loops are implemented and tested.
- Do not claim an audio asset or engine surface is shipped until it is merged, integrated, and verified in the production build.

## Credits and license

Original concept and Windows Batch version created by **Keegan Lewis VanOrder**. Developed as **LEGEND: The Awakening**.

The project has not selected a software license yet.
