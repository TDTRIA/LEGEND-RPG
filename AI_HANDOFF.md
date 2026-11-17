# AI Handoff — LEGEND: The Awakening

**Last updated:** 2026-11-08  
**Authoritative branch:** `main`  
**Current production version:** `v0.30.5`  
**Current product name:** **LEGEND: The Awakening**

This file is the active handoff. Historical checkpoints and superseded plans are archived in [`docs/archive/AI_HANDOFF_2026-11-02.md`](docs/archive/AI_HANDOFF_2026-11-02.md); do not treat those old PR numbers, versions, or next-step instructions as current.

## Current product state

LEGEND is an in-development, desktop-first browser RPG with responsive mobile support. Its player loop is:

**Prepare in town → choose an expedition → explore and make decisions → face danger → return with loot/evidence → improve the traveler → unlock more of the world → prepare to go farther.**

## Creative direction

**Darkest Dungeon is now the primary high-level creative reference**, replacing the earlier World of Warcraft / Diablo comparison. Use its expedition-led dark-fantasy atmosphere, strong illustrated silhouettes, expressive character presentation, tactical readability, and field-report sensibility as inspiration only. Do not copy its assets, characters, interface, writing, sound, or mechanics. The authoritative guide is [docs/DARKEST_DUNGEON_DIRECTION.md](docs/DARKEST_DUNGEON_DIRECTION.md).

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

## Hybrid production architecture — active top technical priority

The approved production architecture is hybrid: Phaser renders the world; semantic HTML/CSS renders the complete interface; existing feature modules own rules, callbacks and persistence. See [docs/PHASER_HYBRID_RENDERING.md](docs/PHASER_HYBRID_RENDERING.md) for the implementation contract.

- Phaser owns world backgrounds, environment art, parallax, lighting, fog/weather, particles, world-space characters/enemies, camera movement and scene transitions.
- DOM/CSS owns all text, headings, values, buttons, panels, cards, forms, HUD, journals, inventory, map, route/camp choices, combat commands, dialogue, reports, modals, focus and accessibility.
- Existing production modules remain authoritative for navigation, combat formulas, enemies, quests, dialogue, progression, economy, inventory, crafting, rewards, expedition state, player records, saves and account/cloud behavior.
- The title, mandatory annals, traveler creation and Oric's opening dialogue are the first stabilization slice. Their Phaser text/panel painters are disabled in production; their HTML/CSS interfaces are visible and actionable again. Phaser world art, atmosphere and transitions remain active.
- Other native interface painters are not a mandate to build duplicate UI. Move each remaining surface to DOM ownership incrementally, retaining its existing controller and verifying its complete journey before deleting obsolete painting code.

### Migration guardrails

1. Do not introduce a second save system, rename the active save key, clear saves or silently migrate player records.
2. Preserve quest flags, inventory, regions, currency, progression, combat formulas, enemy behavior, reward odds, account/cloud-save behavior and save schema.
3. Preserve every menu option, callback, keyboard/touch action, focus state, responsive layout, reduced-motion behavior, text entry and scrolling path.
4. Keep the Phaser canvas behind the DOM controls and non-interactive. A DOM control must never become transparent simply because canvas text or button artwork exists.
5. Replace one complete playable surface at a time. Keep world art and navigation working while converting its UI.
6. Never claim a change is ready for `main` until pull-request checks finish. The full Playwright production suite must run on pull requests and on `main`; workflow concurrency must queue runs rather than cancelling the production gate on the next push.
7. Keep the current production game playable during each step. The old isolated reboot prototype is not a substitute for production parity.

### Approved gameplay-system expansion

The owner approved **party formation, stress and torchlight** on 2026-11-17. The scope and restrictions are recorded in [docs/DARKEST_DUNGEON_DIRECTION.md](docs/DARKEST_DUNGEON_DIRECTION.md#approved-gameplay-systems); the first torch/stress implementation outline is [docs/STRESS_AND_TORCH_DESIGN.md](docs/STRESS_AND_TORCH_DESIGN.md).

These systems are approved for future implementation but are not part of the rendering stabilization. Finish the hybrid presentation foundation first, then implement the approved systems incrementally, one at a time, preserving current solo play, existing reward contracts and player saves. Follow the design document's torch → stress order; party formation requires its own staged design/implementation gate.

Relevant files: `index.html`, `js/engine/phaser-world-v1.js`, `js/game.js`, `js/systems/`, `js/ui/`, `docs/PHASER_HYBRID_RENDERING.md`, `docs/ARCHITECTURE.md` and `docs/SAVE_DATA_CONTRACT.md`.

## Audio identity — integrated, final listening pending

The replacement gameplay theme and generated sound library have been merged into production main.

- [PR #98](https://github.com/TDTRIA/LEGEND-RPG/pull/98) merged as `807696aa177c9a45bd1b5f62a8bdea466e082551`; GitHub Pages deployment [#41718562597](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41718562597) succeeded for that commit.
- The repository now contains the 48-asset generated pack (13 location/prologue ambience loops and 35 one-shot effects) plus the separately rendered original main-theme MP3, a roughly 10½-minute loop.
- `LegendRoadAudioV100` is the production world-audio director. It keeps one persistent main-theme loop and one environment/surface-specific ambience loop, routes generated UI and battle effects, and preserves the existing `legend-road-sound` preference as the single mute switch.
- `LegendTitleAudioV120` delegates title playback and menu cues to the director. The production Phaser engine now forwards environment and screen-surface transitions to it. Combat reuses the same score rather than starting a competing battle loop.
- The generated audio paths for additional story, creature, reward, travel, town, and dungeon effects are available through the director for incremental event-by-event wiring. Do not claim that every one-shot is already triggered by every corresponding gameplay event.
- The main theme and ambience are integrated in the deployed build, but a human listening pass for actual browser playback, levels, repeat seam, and long-session fatigue has not yet been completed. Do not claim the soundtrack has passed subjective audio QA.
- The intended identity remains dark medieval fantasy with a recognizable LEGEND motif, expressive cello/strings, restrained horns, folk instrumentation, and bronze-bell accents. Keep it playable for long sessions; avoid generic mobile-game cues, constant trailer percussion, and overbearing brass.

The existing `legend-road-sound` preference must continue to control game audio. Keep music, ambience, and SFX volume/lifecycle separate so scene changes do not create duplicate loops.

## Current priorities

1. **Finish the full Phaser production migration.** Complete the remaining existing screens and interactive surfaces in the order documented in [docs/PHASER_MIGRATION.md](docs/PHASER_MIGRATION.md), starting with the active HUD/drawers/Old Road slice and continuing through Ashmere/services, combat, rewards/progression, dungeons/regions, and auxiliary screens. Preserve the production systems and save contract.
2. **Complete audio QA and remaining event hooks.** Listen to the deployed theme and ambience in the real browser build, verify levels and loop seams, then wire remaining world/town/reward effects to their successful gameplay actions.
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
