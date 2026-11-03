# LEGEND: The Awakening

**LEGEND: The Awakening** is an in-development dark-fantasy browser RPG about a traveler waking on a dangerous road, finding a home in Ashmere, and carrying the consequences of each expedition back into the world.

- **Production build:** v0.30.4
- **Platform:** HTML5 browser game; desktop-first with responsive mobile support
- **Live game:** https://tdtria.github.io/LEGEND-RPG/
- **Status:** Active development; not a finished 1.0 release

## Current production snapshot

The production game includes three mandatory opening annals, a memory-led traveler creator, the dead-lantern road opening, Captain Oric and the Blackroot Wolf tutorial, a five-stage Old Road expedition, turn-based combat, Ashmere services, traveler progression, and early Greyfen activities.

The first journey leads players onto the Old Road before they return to Ashmere. The road has High Ridge and Reed Cut route choices, discoveries, camps, a saved map/field journal, travel time, Road Pressure, and recurring danger. A careful route is not a guaranteed safe route: an encounter is forced after two travel stretches.

At the baseline Pressure of 20, a completed five-stage expedition settles 80 gold and 33 XP and has a 65% Road Token roll. Early returns do not receive that completion token. Bell Fragments are uncommon: 35% on the Reed Cut roll, 25% from recurring clue interactions, and 15% from a Lantern Wisp. The result ledger shows settlement, discoveries, token outcome, and level progress. Level-ups preserve the existing saved attribute-allocation choice.

Ashmere contains the town hub and its working destinations and services: Inn, Market, Forge/Workshop, Archive, people, Work Board, trading, crafting, equipment, recovery, records, and expedition preparation. Greyfen has playable pieces including Patch the Ferry Nets, Marsh Path activity, local progression materials, and the optional Silted Storehouse detour. **Greyfen is not yet a complete town/story/economy loop; Ironpass is future content.** The first three towns are a target, not a claim that all three are finished.

## Engine transition

The owner approved moving production toward **Phaser** on 2026-11-03. Phaser 4.1 is now loaded in the production game, and the production world renderer manages the persistent environment, atmosphere, transitions, and Ashmere landmarks.

The game is currently hybrid: most menus, dialogue, account/settings, combat rules, expedition logic, and save handling still run through the existing classic JavaScript modules and DOM. The full production migration is in progress. Move real gameplay surfaces into Phaser one at a time, preserving the existing save system and gameplay behavior until each replacement has parity and regression coverage.

## Audio transition

A new **48-asset original audio collection** has been generated: 13 thirty-second location/prologue ambience loops and 35 one-shot effects for UI, story, battle, creatures, rewards, footsteps, town interactions, and Bell Cellar. These assets are staged for review in [audio PR #98](https://github.com/TDTRIA/LEGEND-RPG/pull/98); they are **not in the live build yet**.

Replacing the recurring gameplay theme is a priority. A replacement main-theme MP3 has now been rendered as a roughly 10½-minute loop and is staged in PR #98 with the effects collection. It still needs in-game listening, mix/loop verification, and integration. The live game continues using its older music setup until the replacement actually lands.

## Current priorities

1. Replace the recurring main gameplay theme and integrate/review the new sound library.
2. Continue the approved Phaser production migration one complete playable surface at a time.
3. Complete Greyfen's services, local economy, story resolution, expeditions, rewards, and return loop.
4. Keep the Old Road challenging and progression meaningful through long-run balance and real-player testing.
5. Keep the live game, blog, development dispatch, player guide, store copy, roadmap, and changelog aligned with what is truly playable.

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
