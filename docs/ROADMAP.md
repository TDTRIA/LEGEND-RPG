# LEGEND: The Awakening — Product Roadmap

**Last updated:** 2026-10-29  
**Purpose:** One shared source of truth for what we are building next, why it matters, and how we decide each slice is finished. This is a player-impact order, not a date promise.

## The north star

LEGEND should feel like a dark-fantasy RPG taking place in a continuous world—not a collection of unrelated website screens. The player should see a place, make a decision in that place, see a consequence, and carry the result forward.

The intended presentation borrows the *clarity* of a traditional RPG: a strong title scene, a persistent world view, contextual actions, readable HUD and journal, tactile dialogue, tactical turn-based combat, visible rewards, and transitions that feel intentional. It is not a plan to turn the project into an MMO or to replace the existing game with a large engine rewrite.

**The core loop is:**

**Prepare in town → choose a road → explore and make choices → face danger → bring back loot, evidence, and discoveries → improve the traveler → unlock more of the world → prepare to go farther.**

The story and the systems should reinforce that loop. Town is a place the player wants to return to; the road is where their choices are tested.

## The player experience we are aiming for

1. **The title draws the player into the world.** The correct title is **LEGEND: The Awakening**. The old “Roads of Ashmere” wordmark must not return. The menu should look like a fantasy RPG menu over a living scene, not a generic landing page.
2. **The opening makes the player curious.** A traveler wakes beneath a dead lantern on the Old Road. An unnamed voice (**???**) awakens them; its identity is not revealed yet. Captain Oric is tired, wary, and practical. A bell, the road, and a wolf attack establish the danger. Character choices should affect the traveler or dialogue rather than being cosmetic-only.
3. **The first tutorial teaches the real game.** The player should make a road choice, inspect a discovery, search, rest or prepare, fight using the actual turn-based commands, and understand how to return safely. Avoid replacing these actions with long instructional screens.
4. **Ashmere becomes a useful home.** Recovery, supplies, rumors, work, trading, crafting, equipment, journal, and expedition preparation should be easy to find. Rewards from a trip should create a meaningful next decision.
5. **The world expands one complete region at a time.** Ashmere, Greyfen, then Ironpass are the first three-town target. Each region needs its own identity and a complete loop, not just a backdrop and a few links.

## Non-negotiable guardrails

- **Protect the production game.** The current browser game is the source of truth while we improve it. Preserve existing save keys and player state. Do not replace gameplay systems, change combat formulas, reset saves, or alter account/cloud-save behavior as a shortcut. Any required migration must be deliberate, documented, and tested.
- **Use the current project incrementally.** Favor changes to the existing controllers and presentation layers over a broad rewrite. The isolated reboot/engine prototype is an experiment only; production migration is not approved by this roadmap.
- **Use approved raster art.** Follow the Runway-based art direction for new visual assets. Do not create an SVG title logo or use homemade geometric placeholders in place of character/world art. Keep menu labels and UI text as real accessible text, not baked into artwork. Do not ship watermarked preview images.
- **Keep the world visible.** World artwork should remain readable behind contextual panels. Scene lighting can be moody, but “dark fantasy” must not mean scenes are black or important art disappears. Keep text/cards readable without covering the whole environment in opaque layers.
- **Desktop first, mobile supported.** Target desktop around 1440×900 and check critical flows around 390px wide. No horizontal overflow, hover-only controls, or trapped menus.
- **Prove changes.** Source edits alone do not mean a task is done. Run focused tests and the relevant Playwright regression suite; inspect desktop/mobile screenshots when browser preview is available. Record any testing that could not be done.

## Roadmap — in priority order

### Phase 0 — Stabilize the current build and visibility fix
**Status: in progress; PR #73 is open and not ready to merge.**

Fix the cross-screen scene darkness without creating new visual regressions. Cover the title, opening, Ashmere, Old Road, region view, combat, results, dungeon, and profile scenes. Keep the HUD and content legible while letting the artwork show through.

**Done means:**
- The latest-head Playwright run passes, or every remaining failure is investigated and resolved—not just bypassed.
- The title, prologue, town, road, combat, results, and profile visibility assertions match the actual rendered DOM/CSS.
- Desktop and narrow-screen layouts remain usable.
- The change is reviewed and merged before we treat it as part of production.

**Current blocker:** workflow [#1981](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40873791952) failed with 188 passed, 19 failed, and 1 flaky test. Some failures share an opening-backdrop selector/expectation problem; others include fixture and locator failures. Triage them against the current markup and behavior before merging. The live browser review was not completed in the last pass.

### Phase 1 — Make the title and opening feel like the start of a game
**Priority: highest player-facing feature after Phase 0 is stable.**

Replace the current unsatisfying title/menu experience with a deliberate fantasy-RPG composition and make the first minutes feel like an opening scene, not a form flow.

Scope:
- Keep the exact product title **LEGEND: The Awakening** and the approved raster wordmark.
- Show an atmospheric, visible world scene with subtle motion and lighting; remove awkward oversized shapes and other accidental decorations.
- Give Continue/Begin a clear primary place in the menu. Keep New Traveler, Profile, Settings, and Credits secondary but accessible.
- Use the anonymous soul-shaping/fragmented-memory character creation as a story moment where choices have understandable effects.
- Deliver the dead-lantern road opening with **???**, Oric, the bell, and the Blackroot Wolf. Let the player skip or continue cleanly without breaking saved state.
- Transition from the opening into the real game shell rather than landing on a separate-looking website page.

**Done means:** a new player can start from the title, create a traveler, experience the road opening and first encounter, and arrive at the next playable step without dead ends, broken branding, or static placeholder screens.

### Phase 2 — Make the world shell consistent and alive
**Goal:** one cohesive presentation across Ashmere, the Old Road, and regional scenes.

Scope:
- Keep the current scene visible while journal, inventory, character sheet, services, dialogue, and settings open as consistent overlays or contextual panels.
- Standardize scene framing, lighting, panel transparency, typography, transitions, and action hierarchy.
- Make the route map and field journal reflect real saved discoveries and choices.
- Make travel/camp/return transitions deliberate and readable without forcing the player through unnecessary loading screens.
- Keep location actions contextual: town actions in town, expedition actions on the road, battle commands only during combat.

**Done means:** changing a panel or taking an action does not make the game feel like a different website; the scene remains readable, controls are consistent, and existing state/persistence tests pass.

### Phase 3 — Make combat feel like an actual turn-based battle
**Goal:** improve the presentation and decisions without replacing the production combat rules.

Scope:
- Preserve the established turn-based command structure and current formulas.
- Make enemy intent clear before the player acts; give each action a readable wind-up, strike/impact, reaction, and recovery where the available art supports it.
- Make Fight, Act, Item, Guard, retreat, enemy turns, and status/results understandable in the battle scene.
- Use scene framing, layered character art, brief impact feedback, sound where available, and restrained motion. Do not rely on characters merely “dancing” in place or on effects that obscure the action.
- Make victory, defeat, retreat, loot, and return hand back to the world with clear consequences.

**Done means:** a player can tell whose turn it is, what the enemy is about to do, what their action accomplished, and what changed after the fight—while deterministic combat and reward tests remain green.

### Phase 4 — Close the first-session progression loop
**Goal:** make the first journey pay off in the rest of the game.

Scope:
- Connect the first road choices, encounters, discoveries, and evidence to actual journal/quest goals.
- Make the expedition report explain rewards, injuries, discoveries, and the next useful lead.
- Make gear, consumables, crafting, jobs, and preparation feed back into the next trip.
- Add clear level-up/results presentation when a real level is gained, including a deliberate stat/point-allocation choice if the current progression data supports it.
- Ensure player choices and progress survive reloads and another expedition.

**Done means:** from the opening, the player can complete a meaningful road trip, return to a town, understand what they earned, make at least one useful preparation/progression decision, and see that decision affect the next journey.

### Phase 5 — Finish the first three towns one at a time
**Target order: Ashmere → Greyfen → Ironpass.** Do not open the next region as a travel destination until it offers a real, coherent experience.

Each town/region should have:
- Distinct generated scene art and a clear mood.
- Working services and a coherent local economy.
- Named NPCs, readable dialogue, and at least one connected local story thread.
- Meaningful jobs/quests and choices that change a later encounter, discovery, or reward.
- A complete expedition or dungeon route with unique landmarks, threats, loot, and a return path.
- Region-specific progression rewards that connect to equipment, crafting, preparation, or unlocks.
- Save/load coverage and desktop/mobile checks.

Greyfen already has active story, resource, equipment, and Storehouse content, but its full story/economy/service gate and dedicated art still need review. Ironpass remains future content. A region is not “complete” merely because its hub screen exists.

**Done means:** the player can spend time in the region, take a meaningful quest or expedition, gain something region-specific, return to use it, and unlock the next step without hitting placeholder systems.

### Phase 6 — Expand only after the foundation proves itself
After the opening, world shell, combat, first-session progression, and first three towns work as a cohesive experience, add more enemy families, deeper dungeons, skills/magic, companions, and further regions based on what the playable loop actually needs.

The isolated reboot prototype can continue to answer specific questions about persistent animation or engine suitability. Do not migrate production data or swap engines just because a prototype looks promising; first demonstrate a complete playable slice and document a safe save/data migration plan.

## How we work from here

1. **One active player-facing slice at a time.** Keep its scope small enough to finish and test. New ideas go into a later phase rather than interrupting the active slice.
2. **Fix blockers before stacking polish on top.** A dark scene, broken transition, or failing core flow takes precedence over adding more features.
3. **Keep this file current.** When work starts, update its status and acceptance criteria. When the slice is verified, check it off and name the next priority. Avoid leaving old preview versions at the top as if they were current production work.
4. **Report the real state.** Separate code committed, tests passed, browser-reviewed, merged to main, and deployed. Do not describe a branch as live production until it has actually shipped.

## Supporting design documents

These contain deeper specifications, not competing task orders:

- [Art Direction](ART-DIRECTION.md) — palette, composition, raster assets, and integration rules.
- [Opening Experience Redesign](OPENING_EXPERIENCE_REDESIGN.md) — detailed title, character creation, and opening beats.
- [First-Session Story Spine](ASHMERE_STORY_SPINE.md) — story continuity and the early journey.
- [World Bible](LEGEND_WORLD_BIBLE.md) and [Canon](CANON.md) — approved lore versus open proposals.
- [Architecture](ARCHITECTURE.md) and [Save Data Contract](SAVE_DATA_CONTRACT.md) — implementation and persistence boundaries.
- [Game Reboot Plan](LEGEND_GAME_REBOOT_PLAN.md) — an isolated future-facing proposal, not permission to replace production.
