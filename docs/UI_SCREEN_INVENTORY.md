# LEGEND: The Awakening — UI Screen Inventory

**Baseline:** public main at commit 3c84ac5e95e1d06cb5b55fc74d7f03bfd827f592 (2026-10-25), with Phase 1–4 merged and Phase 4 deployed.  
**Current rollout:** Phase 2/3/4 are merged; Phase 5 story-guidance work is on `feat/greyfen-quest-guidance-v210`.  
**Purpose:** Track reachable screen families, implemented presentation coverage, current verification, and features that are not yet playable. This is a screen-coverage ledger, not a claim that every state has passed manual visual review.

## Status vocabulary
- **Phase 1 — deployed:** title/realm entry, Ashmere hub/service, and Old Road/map shared styling is live; the main Playwright run passed on `4f6ceb71bc9b9639ef189f08e3611535f5ddf11f`.
- **Phase 2 — merged/deployed:** PR #47 added the shared screen-family layer. The full suite passed on Phase 2 head in Actions run [40218830271](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40218830271).
- **Phase 3 — merged:** the cascade guard and 38-sheet-order follow-up lives in the Phase 3 branch history; its full suite passed in [40219281336](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40219281336).
- **Phase 4 — merged/deployed:** Greyfen Marsh Path and campsite field-report behavior are live at v0.24.0; Pages deployment passed in [40220627763](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40220627763). The post-Phase-4 full main Playwright run has not yet completed successfully.
- **Existing / partial:** reachable does not mean every nested state, error path, or responsive variation has been verified.
- **Not available on main:** only in an unmerged PR or explicitly unavailable. Do not report it as playable.
- **Deferred:** deliberately left for a later rollout or dependent on an unfinished feature.

## Phase 0 findings

The game is a classic-JavaScript browser runtime. It already has local landscape art, a raster title wordmark, boot and scene-transition layers, a scene-first Old Road, town navigation and service screens, a save-backed traveler, a field journal/map, combat, progression and a Bell Cellar dungeon slice.

Presentation is layered across 38 stylesheets. The latest stack includes `greyfen-marsh-v160.css`, `legend-ui-system-v160.css`, `legend-world-shell-v170.css`, and `legend-ui-rollout-v180.css` in that order after the earlier theme layers. Phase 3 added an order/asset-response regression contract; Phase 4 preserved that cascade while wiring Greyfen in. Avoid removing accumulated style layers without before/after computed-style and interaction evidence.

Phase 4 is merged and deployed in v0.24.0. Phase 5 is improving saved evidence guidance and cross-region quest handoffs on a separate branch.

## Screen-family inventory

| Screen family / states | Current implementation on main | Baseline status | Phase 2 coverage / follow-up |
|---|---|---|---|
| Startup / boot | index.html, world-client-boot-v100.css, boot sequence modules, tests/boot-sequence-v100.spec.js | Existing: timed boot, manifest/system checks, artwork fallback | Reuse; later verify reduced motion, delayed assets and missing-art/error fallback |
| Title / realm entrance | js/screens/title-screen-view-v120.js; title CSS v120–v136; runway-art-pass-v151.css; local raster wordmark/location art | Existing: wordmark, Continue/New Journey, Profile, Settings, News & Roadmap, Credits and realm atlas | **Phase 1 proof** — redesign composition, frames, menu hierarchy and realm map; preserve button IDs, actions and title identity |
| Title sub-screens | js/game.js, title-dispatches-v140.js, settings/account scripts | Existing: News & Roadmap, Credits, Profile/account entry, Settings and return/fallback pathways | Phase 2 adds shared framing to Settings/Profile and automated 390px navigation checks; continue visual review of News, Roadmap, Credits, save/account errors, and all return paths |
| Scene transition / loading | world-client-boot-v100.css, scene-transition modules, data-legend-scene-transition hooks | Existing: boot and transition curtain | Retain in Phase 1; later inspect slow/error/fallback and reduced-motion paths |
| Traveler creation | beginning-v094.js, player creation modules and beginning-v094.css | Existing: name, identity presentation, personality, origin, class, keepsake, summary, validation/back/continue | Phase 2 adds shared frame/material rules and a 390px regression assertion at the actual memory-shaping scene; all seven choices, validation, summary and benefit persistence remain owned by existing code and its existing tests |
| Opening / tutorial | road-opening-v140.js, opening-road-v140.css, creation modules | Existing: anonymous ??? voice, Dead Lantern arrival, Captain Oric, opening encounter/ACT, resume/abandon | Phase 2 aligns Dead Lantern frames and choices with the shared material language; regression covers ???, road responses, ACT combat, and 390px overflow. Story wording and mechanics unchanged |
| Ashmere town hub | ashmere-hub-v099.js, navigation/catalog, ashmere-town-v100.css, immersive-world-v150.css | Existing: panorama, navigation, objective strip, traveler/health/resources and destination links | **Phase 1 proof** — make place art/objective focal, tighten navigation dock, make destinations feel like local places |
| Ashmere service screen | ashmere-controller-v099.js, ashmere-view-v099.js, service modules | Existing: service art/header, content, actions and return-to-town control | Phase 1 Work Board proof is deployed; Phase 2 applies matching frame/focus rules to service cards, NPC choices, trading, gear, crafting, result notes, and region travel. Transaction/cost logic untouched; visual review of every transaction state remains |
| Greyfen hub and services | Shared hub/catalog plus Greyfen art, crossing, job, market and forge modules | Existing: Greyfen-flavored hub and service routes; not equivalent to complete town release | Phase 4 wires the Marsh Path route and evidence handoff into this existing region. Full Greyfen quest/service acceptance remains broader than this expedition slice |
| Greyfen Marsh Path | `js/systems/road/greyfen-marsh-expedition-v160.js`, `js/content/roads/greyfen-marsh-v160.js` | **Merged to main in Phase 4 (v0.24.0)** | Scene-first route, fork choices, detours, journal/map/report and waterline evidence loop; saved state is isolated from Old Road. Not a claim that all three towns are complete |
| Ironpass | js/data.js region entry and region gating; available=false | **Not playable on main** | Do not invent a hub/expedition. Inventory when implemented/reachable |
| People / NPC dialogue | ashmere-people-v099.js, dialogue/story modules and shared town view | Existing: people list, individual speakers, conditional dialogue, choices and back navigation | Phase 2 applies shared service frames, clearer focus outlines, and restrained dialogue/choice surfaces via the existing town view. Individual NPC branches/canon unchanged; each branch still needs visual acceptance coverage |
| Main quest / journal / evidence | town records, quest-log helpers, evidence/story modules and road journal | Partial/existing: quest objective, local archive/evidence, memories and road journal/map | Later rollout; distinguish observation from inference; preserve quest keys |
| Work Board / contracts | ashmere-workboard-v099.js, contracts/job catalog and daily contracts | Existing: job selection, task result/progress/claim feedback and Greyfen A Dry Crossing contract | Phase 1 service proof uses current Work Board; later cover every challenge/retry/locked/claimed state |
| Character sheet / attributes | town records/profile and progression-level-up-v152.js | Existing: character detail and spendable attribute point overlay | Phase 2 frames the actual body-mounted growth dialog and the current save-backed inventory modal; automated checks verify growth-card styling, modal sizing, and read-only inventory persistence. Attribute allocation/persistence semantics unchanged |
| Inventory / item details | town records/inventory modules, item art and shared utility CSS | Existing: counts, item display and consumable/equipment affordances | Phase 2 gives the real world-shell inventory modal, item tiles, quantities, and equipped records the shared material language; its 390px regression verifies displayed quantities and confirms the modal does not mutate the save. Empty packs, long names, inspection detail and every failure state remain to be reviewed |
| Equipment / smith / workshop | ashmere-forge-v099.js, ashmere-crafting-v099.js, ashmere-workshops-v100.css | Existing: weapon/armor tabs, buy/equip, recipes and feedback | Phase 2 frames gear, recipe, transaction, and service-result surfaces consistently; existing workshop and economy tests remain the behavior guard. Deep visual review of every equip/buy/ingredient failure state is still pending |
| Inn / rest | Town inn feature and service views | Existing town service | Later rollout; cover confirmation, denied/insufficient resources, success and return |
| Market / trade | ashmere-market-v099.js, shop data and town views | Existing: buy, sell, sell-all and transaction feedback | Later rollout; preserve price/count/failure/gold/inventory semantics |
| Region travel / world map | region-controller-v100.js, region-view-v100.js, region-service-v100.js | Existing: unlock/travel state and locked/unavailable destinations | Phase 2 adds map-card, destination-state, wallet, and action framing through the shared region selectors; route gating remains unchanged. Ironpass remains unavailable; regional route-by-route visual review is pending |
| Old Road departure briefing | Town departure module, tests/departure-briefing-v150.spec.js | Existing: health/loadout, supplies and route readiness | Later rollout; preserve costs and start/back actions |
| Old Road live expedition | road-controller-v100.js, road-view-v100.js, road-expedition-screen-v100.js, road actions/discovery/results | Existing: scene, stages, route choice, hotspots, status, pressure/time, actions, optional detours | Phase 1 UI proof is deployed; Phase 4 adds the saved Road Poultice camp report to the field journal and return debrief without changing route or pressure behavior |
| Old Road route/map | Route graph and expedition map modal, tests/road-graph-v160.spec.js | Existing: fork choices, discovered/visited state and optional detours | Phase 1 shared styling is deployed; Phase 4 keeps route state isolated while adding camp actions to the journal/report |
| Field journal / discoveries | Expedition screen and journal state, tests/expedition-journal-v150.spec.js | Existing: discoveries, route notes and return summary | Later rollout for overlay/empty/long-content states |
| Combat / intent / skills | road-combat-v100.js, road-combat-view-v100.js and combat tests | Existing: battle presentation, enemy intent, health, actions, skills, cooldowns, retreat/turn feedback | Phase 2 gives battle, intent, dialogue log, tactical commands, and focus states shared framing; automated flow checks opening ACT combat at 390px. Turn rules, cooldowns, enemy intent, rewards and control availability unchanged |
| Battle victory / defeat | road-combat-results-view-v152.js and road settlement | Existing: result frame, reward/XP/level display and exit actions | Phase 2 frames the full result composition and reward section; a regression asserts rewards render and the continue callback still fires. Existing victory/defeat/reward tests remain the gameplay guard |
| Bell Cellar dungeon | js/systems/dungeons/bell-vault-v100.js, bell-vault CSS and tests | Partial playable slice: entry, rooms/interactions, encounter, retreat/result | Phase 2 frames the room banner, choices, loadout, clue and retreat surfaces; automated coverage enters the real Bell Cellar and verifies Room 1 at 390px. Existing room, combat, reward and retreat tests remain in force; this is still one playable dungeon slice, not a dungeon catalog |
| Rewards / expedition report | road-results-v100.js, result/debrief views and progression | Existing: secured return, discovery/resource/gold/XP summary and town handoff | Later rollout; preserve reward and quest update behavior |
| Settings / accessibility | settings-screen-v090.js, settings CSS and storage helpers | Existing: local preferences for readability/contrast/motion | Phase 2 applies shared framing and tests the real Settings screen plus reduced-motion control visibility at 390px; Phase 1 reduced-motion contract passes. A full keyboard/contrast audit remains pending |
| Profile / account | Title entry and account/profile modules | Existing screen pathways; inventory does not assume a server authentication service | Phase 2 applies shared frame/focus rules and tests the actual Profile/Account route at 390px. Cloud/authentication/error paths need additional visual inspection; no new account service is invented |
| Shared errors/fallbacks | Module-specific unavailable panels, art fallbacks and disabled controls | Existing but not comprehensively exercised across all modules | Phase 1 establishes shared contrast/focus/disabled/fallback styles; Phase 2/3 audit every state |
| Keyboard focus / touch / reduced motion | mobile-safety-v09x.css and screen-specific media rules/tests | Existing partial coverage, not a complete accessibility audit | Shared focus and reduced-motion rules extend across Phase 2 surfaces; multiple tests assert 390px overflow and the existing reduced-motion contract passes. Full keyboard-only, zoom, color-contrast, target-size and short-height sweep remains open for Phase 3 |
| Empty states / confirmations / tooltips / pause | Feature-specific implementations only; no universal pause/tooltip framework evident in the inspected source | Partial/varies by feature | Do not fabricate missing systems; enumerate exact live states during Phase 2 |

## Phase 1 verification checklist

- [x] Branch based on inspected current main; gameplay/save/version modules left untouched.
- [x] One shared design-system stylesheet is appended after the current CSS stack.
- [x] Title/realm entry targeted for cinematic composition, framed menu, existing logo and live realm art.
- [x] Ashmere hub/service targeted for panorama, navigation dock, objective, health/resources, destination plaques and service frame.
- [x] Old Road/map targeted for scene-first frame, legible HUD and consistent route/map panels.
- [x] Inventory and design-system guide added.
- [x] Phase 1 browser suite passed on main commit `4f6ceb71bc9b9639ef189f08e3611535f5ddf11f` (Actions run [40212672675](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40212672675)).
- [x] The Phase 1 title, hub/service, and Old Road flows have automated desktop/mobile and reduced-motion coverage.
- [ ] Capture/review final desktop and 390px screenshots from the Phase 2 artifact; live manual browser preview could not be opened in this session.
- [ ] Phase 2's latest full Playwright run must pass before PR #47 is merged.

## Phase 2 — rollout implementation and release gate

Current implementation is in [PR #47](https://github.com/TDTRIA/LEGEND-RPG/pull/47), branch `feat/ui-phase2-screen-families-v180`. It adds `css/legend-ui-rollout-v180.css` after the shared UI system and world shell; it does not change gameplay functions, save schema, story copy, economy, route gates, rewards, turn rules, or button IDs.

- [x] Traveler memory / creation, ??? dialogue and the Dead Lantern use the shared frame and control treatment.
- [x] Opening combat uses the same visual language while retaining native FIGHT/ACT/ITEM/GUARD availability.
- [x] The current save-backed inventory modal and growth allocation modal receive consistent frames, item tiles, quantities, and focus state.
- [x] Town service, NPC-choice, crafting, market/gear feedback, and region-travel panels receive the shared material and focus rules.
- [x] Settings / profile-account routes receive consistent framing and focus states.
- [x] Battle results, growth allocation modal and Bell Cellar room surfaces receive the Phase 2 frame rules, including the growth modal appended to `document.body`.
- [x] Added regression coverage for creation → Dead Lantern → ACT combat at 390px, real Settings/Profile navigation, the current inventory modal plus Bell Cellar Room 1, results callbacks, growth modal styling, and overflow.
- [x] Existing Phase 1, service, world-shell, combat, result, dungeon, economy, and mobile regressions remain in the full suite.
- [ ] Final Phase 2 full Playwright run must pass on the current PR head before merging.
- [ ] Inspect the final run's desktop/mobile evidence artifact. Automated viewport tests do not replace manual visual acceptance of every nested screen.
- [ ] Continue one-by-one acceptance review for all NPC branches, transaction failures, item inspection/comparison, empty/error/loading states, and every dungeon room.

Phase 4 release state: Greyfen Marsh Path and Road Poultice journal/report are live in v0.24.0. Ironpass remains unavailable.

## Phase 3 — consolidation
- [ ] Capture before/after comparisons for all screen families.
- [ ] Remove only CSS proven obsolete through cascade/source/regression evidence.
- [ ] Audit CSS order and cache/version conventions at release time; no feature-branch version bumps.
- [ ] Verify missing-art fallback, semantic labels and accessible contrast on reachable states.
- [ ] Run full regressions, deployed smoke and responsive/keyboard checks before declaring the full redesign done.

**Status at this revision:** Phase 1 is deployed to production. Phase 2's implementation and added browser tests are in PR #47; final full-suite verification and artifact review remain release gates. The inventory explicitly leaves unfinished flows and unavailable regions marked as pending/unavailable rather than claiming the whole game's redesign complete.


## Phase 4 — expedition and field-report implementation (merged to main, v0.24.0)

- [x] Port the scene-first Greyfen Marsh Path feature onto the post-Phase-2/3 baseline without replacing index.html or dropping the UI v160/v170/v180 cascade.
- [x] Add Greyfen's own saved expedition state, route/POI choices, optional detours, waterline gauge evidence and reporting path.
- [x] Record Road Poultice crafting in the Old Road camp journal and expedition return report; preserve item costs and leave pressure/time unchanged.
- [x] Add Greyfen expedition, mobile smoke and Road Poultice report regression coverage.
- [ ] Complete the full browser verification of the merged production build. Targeted syntax/source checks are clean, Pages deployed successfully, and the corrected ferry-cost assertion matches the real detour card; the main full-suite run remains pending/in progress.
- [ ] Continue beyond this slice: fully finish Greyfen's town quests/service states and complete the first three towns; Greyfen Path alone does not satisfy that wider goal.


## Phase 5 — Greyfen story guidance and handoffs (implementation branch; targeted validation underway)

- [x] Make the hub Current Route card follow the active saved evidence chain before the generic Greyfen contract.
- [x] Add explicit navigation targets for Mara, Brenn, Old Road evidence searches, cross-region travel, and Boundary Archive review.
- [x] Preserve uncertainty: the evidence establishes a changed crossing status, not who authorized it. The missing closure order remains unresolved.
- [x] Add targeted regression tests for each important saved-flag handoff and the actual hub’s Current Route action.
- [ ] Continue the missing-closure-order story only when its clue, player choice, and outcomes can preserve established canon.
- [ ] Finish Greyfen town service/resource-loop acceptance, then begin Ironpass as the third playable town.
