# AI Handoff — LEGEND: The Awakening

**Last updated:** 2026-11-03  
**Authoritative branch:** `main`  
**Current production version:** `v0.30.4`  
**Current product name:** **LEGEND: The Awakening**

This file is the active handoff. Historical checkpoints and superseded plans are archived in [`docs/archive/AI_HANDOFF_2026-11-02.md`](docs/archive/AI_HANDOFF_2026-11-02.md); do not treat those old PR numbers, versions, or next-step instructions as current.

## Current product state

LEGEND is an in-development, desktop-first browser RPG with responsive mobile support. Its player loop is:

**Ashmere → prepare → choose an expedition → explore and survive encounters → return with loot/evidence → improve the traveler → open more of the world.**

### In the production build

- Three mandatory opening annals establish the monster-war history before traveler creation. The opening is not skippable.
- The memory-led traveler creator keeps the mysterious presence labeled only **???**. Its identity and the traveler's hidden nature must not be disclosed in player-facing text.
- The traveler wakes beneath the dead lantern. Captain Oric and the Blackroot Wolf encounter hand the player into the actual turn-based combat and Old Road systems.
- Ashmere has its town hub and working service routes, including the Inn, Market, Forge/Workshop, Archive, people, Work Board, trading, crafting, gear, recovery, records, and expedition preparation.
- The Old Road is a five-stage expedition with High Ridge and Reed Cut branches, discoveries, a saved map/field journal, camp decisions, travel time, Road Pressure, tactical encounters, and a return report. A road encounter is forced after two travel stretches even when pressure is low.
- A completed five-stage expedition at baseline Pressure 20 settles 80 gold and 33 XP and has a 65% Road Token roll. Early returns do not receive that completion token. Bell Fragments remain uncommon: 35% Reed Cut roll, 25% recurring clue interaction, 15% Lantern Wisp drop.
- Combat retains its established turn-based rules and save structure, with enemy intent, Guard, stagger follow-through, consumables, victory rewards, and progression.
- Level-ups preserve the saved attribute-allocation choices. Expedition reports show discoveries, settlement, token outcome, and level progress.
- Greyfen is a partial frontier with playable pieces including Patch the Ferry Nets, Marsh Path activity, local materials/progression, and the optional Silted Storehouse detour. It is **not** a complete town/story loop yet.
- Ironpass is future content, not a finished playable town. The first three towns are a development target, not a claim that all three are complete.

Use [`README.md`](README.md), [`CHANGELOG.md`](CHANGELOG.md), and [`docs/ROADMAP.md`](docs/ROADMAP.md) for the current product-facing and development status.

## Production engine migration — approved and in progress

The owner approved moving the production game to **Phaser** on 2026-11-03. Do not repeat the older handoff/plan claim that production migration is unapproved.

Current state is a hybrid production runtime:

- Phaser 4.1 is loaded by `index.html`.
- `js/engine/phaser-world-v1.js` is active in production. It renders the persistent world scene, environments, lighting/atmosphere, transitions, and Ashmere landmarks.
- Most gameplay screens, menus, dialogue, account/settings, combat rules, expedition rules, and storage still run through the existing classic JavaScript modules and DOM.
- This is **not** a completed whole-game Phaser rewrite. Migrate real gameplay surfaces incrementally into Phaser scenes while preserving the player-facing flow and the existing source-of-truth systems until each replacement has parity and regression coverage.

Migration guardrails:
1. Do not introduce a second save system, rename the active save key, clear saves, or silently migrate player records.
2. Preserve quest flags, inventory, regions, currency, progression, combat formulas, enemy behavior, reward odds, account/cloud-save behavior, and accessibility.
3. Keep keyboard, pointer, touch, responsive layout, reduced-motion, readable text, and back/continue paths.
4. Replace one complete playable surface at a time. Do not remove a working HTML screen until the Phaser replacement passes its equivalent tests.
5. Keep the current production game playable throughout the transition; the old isolated reboot prototype is not a substitute for production parity.

Relevant files: `index.html`, `js/engine/phaser-world-v1.js`, `js/game.js`, `js/systems/`, `js/ui/`, `docs/ARCHITECTURE.md`, and `docs/SAVE_DATA_CONTRACT.md`.

## Audio identity — active priority

The owner has explicitly said the recurring gameplay theme must be replaced; the current theme is not acceptable.

- The current legacy title/audio and road-audio modules still reference the old ambience and old-road battle loop. Do not claim those references have been replaced until the production integrations land.
- A new collection of **48 original generated assets** has been staged in [PR #98](https://github.com/TDTRIA/LEGEND-RPG/pull/98): 13 thirty-second location/prologue ambience loops and 35 effects for UI, story, combat, creatures, rewards, travel, town services, and Bell Cellar.
- PR #98 is an audio integration candidate, not yet a shipped production feature. Review the asset import, theme render, file paths, audio levels, loop seams, and test coverage before merge.
- The original MIDI score has now rendered successfully to a roughly 10½-minute loop in PR #98. The MP3 is staged, but it has not yet been checked in actual gameplay or integrated into production. Verify audible quality, mix, loop seam, sound-toggle behavior, and scene/battle transitions before replacing the live music. Do not claim the live theme has changed until those checks pass.
- The intended soundtrack identity is dark medieval fantasy with a memorable recurring LEGEND motif, expressive cello/strings, restrained horns, folk instrumentation, and bronze-bell accents. Keep it playable for long sessions; avoid generic mobile-game cues, constant trailer percussion, and overbearing brass.

The existing sound preference `legend-road-sound` must continue to control game audio. Keep music, ambience, and SFX volume/lifecycle separate so scene changes do not create duplicate loops.

## Current priorities

1. **Replace the recurring gameplay theme and integrate the new audio pack.** Review PR #98 and make sure the old main/battle tracks are no longer used where the new soundtrack takes over.
2. **Continue the approved Phaser production migration.** Move an actual playable surface, not just its backdrop, and preserve save/gameplay parity.
3. **Finish Greyfen as a coherent region.** Complete its town services, local economy, story resolution, expeditions, rewards, and return loop before calling it done.
4. **Keep the first-session and Old Road loop challenging and readable.** Continue long-run reward/economy tuning and real-player feedback without making the road safe or progression effortless.
5. **Keep public information current.** Blog, updates page, README, guide, store copy, roadmap, and changelog must distinguish shipped features from preview/in-progress work.

## Story and world guardrails

[`docs/CANON.md`](docs/CANON.md) is authoritative. Read it before writing dialogue, quests, or lore.

- The speaking presence in traveler creation is shown only as **???**. Do not identify it as the Veil in player-facing content.
- Do not reveal or imply the traveler's hidden nature before an owner-approved reveal plan.
- The Hollow Saint, Last Mercy, Veil, echo rules, and old monster-war agreement are locked canon. The Five Arts as named disciplines, Strain, and the Afterwake remain proposals unless the owner separately approves them.
- Human wrongdoers remain human; do not turn the Greyfen crossing mistake into a supernatural plot.
- New towns and systems must be grounded in the current approved direction, not retired Pale Surveyor/Hollow Mile proposals.

## Production architecture and persistence

- Active runtime uses versioned classic browser scripts loaded in explicit order by `index.html`, alongside the Phaser world engine.
- `LegendStorage` remains the single owner of player save/load/normalization.
- Current player save key: `legend-roads-of-ashmere-v09` (from `LEGEND_DATA.SAVE_KEY`).
- Settings key: `legend-settings-v1`.
- Road sound preference key: `legend-road-sound`.
- Do not revive retired save keys or the old v087 road controller.
- Keep the established public `window.Legend...` facades stable unless a deliberate migration updates all callers and tests.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/SAVE_DATA_CONTRACT.md`](docs/SAVE_DATA_CONTRACT.md), and [`docs/ADDING_FEATURES.md`](docs/ADDING_FEATURES.md).

## Verification rules

- Run the focused contract spec(s) for the changed system and the relevant Playwright journeys.
- Run the current production syntax gate and browser suite on the final PR head; check GitHub Actions rather than relying on old counts.
- Test desktop around 1440×900 and critical mobile flows around 390px wide.
- For audio work, verify files decode, loops do not click, volumes are balanced, the sound toggle works, scene changes do not stack loops, and battle transitions restore the correct music.
- A successful source commit or a queued workflow is not a green test. State any test that remains pending or could not be run.
- Do not claim that changes are live until the merge and successful GitHub Pages deployment are confirmed.

## Current project links

- Realm Hub: https://tdtria.github.io/LEGEND-RPG/portal.html
- Live game: https://tdtria.github.io/LEGEND-RPG/
- Development chronicle: https://tdtria.github.io/LEGEND-RPG/blog.html
- Development dispatch: https://tdtria.github.io/LEGEND-RPG/updates.html
- Player guide: https://tdtria.github.io/LEGEND-RPG/guide.html
- Playtest feedback: https://tdtria.github.io/LEGEND-RPG/feedback.html
- Repository: https://github.com/TDTRIA/LEGEND-RPG
