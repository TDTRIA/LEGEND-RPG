# LEGEND: The Awakening — Product Roadmap

**Last updated:** 2026-11-02  
**Source of truth:** the production `main` branch, checked against current source, open pull requests, and the latest available GitHub Actions results. This is a player-impact order, not a date promise.

## The north star

LEGEND should feel like a dark-fantasy RPG taking place in a continuous world—not a collection of unrelated website screens. The player should see a place, make a decision in that place, see a consequence, and carry the result forward.

**Core loop:** prepare in town → choose a road → explore and make choices → face danger → bring home loot, evidence, and discoveries → improve the traveler → unlock more of the world → prepare to go farther.

The town should feel like somewhere worth returning to. The road is where preparation, equipment, and player choices are tested.

## Verified project snapshot

| Area | Current state on main |
|---|---|
| Production build | **v0.27.0**, main commit [d098e57](https://github.com/TDTRIA/LEGEND-RPG/commit/d098e57bd01f99d60ad9d1512a09e941916f147c) |
| Runtime | Existing browser game using ordered classic JavaScript scripts; no production engine migration |
| Boot, title, and creation | Integrated: realm boot, raster LEGEND wordmark, title menu, traveler creation, anonymous opening voice |
| Opening | Integrated road-first Dead Lantern sequence, Captain Oric, Blackroot Wolf, ACT/Awaken tutorial, and transition into the production road loop |
| Ashmere | Town hub, NPCs, dialogue, services, Work Board/contracts, trade, equipment, crafting, profile, and shell presentation are integrated |
| Old Road | Five-stage expedition, route choices, discoveries, pressure/time, camps, journal/map, combat, results, and return flow are integrated |
| Combat and progression | Turn-based command flow, enemy intent, combat/results, XP, level-up, and attribute allocation are integrated |
| First dungeon | Bell Cellar compact delve is integrated |
| Greyfen | Marsh Path, evidence/story handoffs, resources, Storehouse content, parcel recipe, saved crossing-response choice, and regional coat are integrated; **not release-complete** |
| Ironpass | Region entry is gated; **not playable on main** |
| Three-town release | **Not complete.** Do not advertise it as shipped |

### Current verification checkpoint

- Latest main commit: [d098e57](https://github.com/TDTRIA/LEGEND-RPG/commit/d098e57bd01f99d60ad9d1512a09e941916f147c), October 29, 2026.
- The Pages build/deployment workflow for that commit succeeded: [run 40937098658](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40937098658).
- The main Playwright workflow completed with **207 passed, 3 failed, 1 skipped**: [run 40937100701](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40937100701). The JavaScript syntax check passed. The live GitHub Pages smoke step was skipped because the test job failed.
- Failure triage from the workflow log:
  1. `tests/ashmere-world-visibility.spec.js` expects the shell canvas background to be `none`; the current computed style is a low-opacity translucent gradient. The assertion must describe the real contract rather than require no gradient.
  2. `tests/playtest-fixes-v0222.spec.js` reports a **138px vertical delta**, but the portrait and name occupy separate grid columns. The old assertion ignored horizontal separation, so this is a test-geometry false positive rather than proof of a visual collision. PR [#79](https://github.com/TDTRIA/LEGEND-RPG/pull/79) checks true 2D rectangle intersection.
  3. `tests/ui-world-shell-v170.spec.js` expects the string `0.90`, while the browser serializes the same alpha as `0.9`. Make the assertion robust to CSS serialization; do not alter visual values just to satisfy string formatting.
- A deployed browser visual review is not recorded for this checkpoint. Do not call the latest build fully verified until the failures are resolved and the live smoke step passes.

## Non-negotiable guardrails

- Preserve the active save key `legend-roads-of-ashmere-v09`, player record, cloud/account behavior, combat formulas, item/economy rules, and existing navigation unless a focused change requires otherwise.
- Keep production on the current browser runtime. The isolated reboot prototype is an experiment, not permission to replace the game or migrate saves.
- Use committed, watermark-free raster art for new production visuals. No replacement SVG logo, placeholder geometry, or temporary signed image URL.
- Keep the world scene visible. “Dark fantasy” must not mean scenes are black or important art disappears. Large shell and content surfaces should be translucent; text, dialogue, and controls must retain readable contrast.
- Keep the opening voice labelled `???`. Canonical story facts and reveal limits are governed by [CANON.md](CANON.md).
- Desktop-first at roughly 1440×900; retain mobile compatibility around 360–430px. No hover-only actions or horizontal overflow.
- A branch, commit, or deployment is not a verification pass. Record source status, tests, browser review, merge, and deployment separately.

## Priority order

### Phase 0 — Stabilize scene visibility and regression

**Status: in progress.** Main's October 29 global visibility pass was merged in [PR #73](https://github.com/TDTRIA/LEGEND-RPG/pull/73), but the follow-up main workflow still has the three failures listed above. Issue [#76](https://github.com/TDTRIA/LEGEND-RPG/issues/76) tracks the next focused translucency correction on branch `fix/scene-surface-translucency-v0279`.

**Work:**
- Correct the high-opacity Old Road surfaces (the last visibility stylesheet currently forces several large panels to 0.90–0.97 alpha).
- Keep the world background and location-specific artwork visible behind the persistent shell, services, road choices, and combat.
- Retain readable text and distinct buttons; do not solve darkness by making every panel transparent.
- Fix the NPC portrait/name overlap and replace brittle CSS-string assertions with computed-value checks.
- Re-run the full Playwright workflow and the live Pages smoke. Inspect desktop and narrow/mobile screenshots when a browser is available.

**Done means:** no main Playwright failures; title/opening/town/road/combat/results/dungeon/profile backgrounds are visibly distinct from the UI; all text and commands remain legible; desktop and mobile have no clipping/overlap; live smoke succeeds.

### Phase 1 — Finish the scene-first town and road interaction

The persistent world shell is integrated, and the current tests cover contextual actions and Ashmere point-of-interest selection. Reconcile open issue [#55](https://github.com/TDTRIA/LEGEND-RPG/issues/55) against current `main` before adding more shell code: much of its selection/Visit behavior appears in the current shell regression tests. Close it only if every acceptance item is satisfied; otherwise implement the specific remaining gap.

**Work:**
- Keep Ashmere's Inn, Market, Forge, and Old Road Gate visibly located in the town scene.
- Selection should change contextual detail and highlight the corresponding in-scene location; Visit must delegate to the existing town navigation.
- Keep selection transient, keyboard-operable, and independent of saved gameplay state.
- Ensure town services, inventory, journal, character sheet, and dialogs preserve the same world context and return path.

**Done means:** the player can understand where each town action belongs, enter it, and return without a new disconnected menu or save mutation.

### Phase 2 — Complete Greyfen as the second release-ready region

Greyfen already has a substantial playable foundation, but it is not yet a complete town release. Open PR [#54](https://github.com/TDTRIA/LEGEND-RPG/pull/54) adds one optional salvage stop off Mossbarrow Shelter. It is **not merged**, is not the full multi-room delve, and must pass its own PR-head CI before integration.

**Work:**
- Finish the local story chain and NPC handoffs, keeping observed evidence separate from speculation and respecting the locked crossing-record canon.
- Complete the useful service/economy loop: gathered materials should connect to crafting, equipment, trade, repairs, or quests.
- Review the Silted Storehouse route, its optional detours, unique encounter, rewards, failure/retreat, map state, and secured return.
- Create and integrate dedicated raster art for the Storehouse and Marshguard Coat; the coat currently reuses chain-armor artwork.
- Ensure the crossing-response decision, parcel recipe, regional gear, and expedition discoveries produce visible, saved consequences on later trips.
- Complete fresh-save, existing-save, reload, mobile, and full regression coverage.

**Done means:** Greyfen is a place with working services, local characters and jobs, a coherent story, a complete expedition/delve, region-specific rewards, and a meaningful return loop—not merely a destination card and one road.

### Phase 3 — Make the first-session progression loop satisfying

Once Phase 0 is stable, tune the end-to-end route from traveler creation through Oric's tutorial, the Old Road, Ashmere preparation, and the Greyfen unlock. Use one complete playthrough as the acceptance path.

**Work:**
- Make the expedition debrief accurately explain stops, route, pressure/time, discoveries, injuries, gold, items, XP, and level changes.
- Make the next useful town action obvious without forcing a tutorial wall of text.
- Make the first meaningful equipment, crafting, job, or preparation choice affect the following trip.
- Verify Continue Journey and reload at the opening, expedition, results, and town.

### Phase 4 — Build Ironpass as the third town

Ironpass is not playable on main today. Do not enable travel as a working destination until its town identity, NPCs, services, local story, expedition/delve, rewards, and tests exist.

**Done means:** the player can begin in Ashmere, progress through Greyfen, and reach a complete Ironpass loop without placeholders, blocked mandatory objectives, or dead-end rewards.

### Phase 5 — Expand after the first three-town foundation

Only after Ashmere, Greyfen, and Ironpass each offer a coherent loop should we add deeper regions, more enemy families, skills/magic, companions, and wider dungeon progression. The isolated reboot prototype can answer a specific presentation/engine question, but production migration requires an explicitly approved plan and proven save compatibility.

## How we work

1. One active player-facing slice per branch. Read current source and open PR ownership before editing.
2. Fix blockers before adding breadth. Do not stack new features on a broken scene, transition, save flow, or test suite.
3. Prefer targeted changes over new versioned copies or broad refactors. Update the cache key for a changed production asset/script/CSS file in `index.html`.
4. Add tests for behavior and visible contracts. Do not weaken a test merely to make CI green.
5. Update the roadmap when a phase moves. Distinguish implemented, tested, visually reviewed, merged, and deployed.
6. Keep dependencies free/low-cost unless the owner approves a paid service.

## Supporting documents

- [Art Direction](ART-DIRECTION.md) — palette, composition, raster assets, and integration rules.
- [UI Screen Inventory](UI_SCREEN_INVENTORY.md) — reachable screens and coverage; reconcile it after open PR #54.
- [First Three Towns Release Plan](FIRST_THREE_TOWNS_RELEASE_PLAN.md) — regional content and release gates.
- [Opening Experience Redesign](OPENING_EXPERIENCE_REDESIGN.md) and [Ashmere Story Spine](ASHMERE_STORY_SPINE.md) — opening beats and continuity.
- [World Bible](LEGEND_WORLD_BIBLE.md) and [Canon](CANON.md) — approved lore versus open proposals.
- [Architecture](ARCHITECTURE.md) and [Save Data Contract](SAVE_DATA_CONTRACT.md) — implementation and persistence boundaries.
