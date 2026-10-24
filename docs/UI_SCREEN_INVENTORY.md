# LEGEND: The Awakening — UI Screen Inventory

**Baseline:** public main at commit 470d3508ae1eb1f49bce27c25f83e6a9fa3863cc (2026-10-24).  
**Feature branch:** feat/full-game-ui-phase1.  
**Purpose:** Phase 0 inventory and rollout tracker. This records what is currently on main, what is only in an open PR, and what is not yet playable.

## Status vocabulary
- **Phase 1 — implemented, browser verification pending:** visual rules in this branch target the screen; CI must pass before it is called verified.
- **Existing — rollout pending:** reachable on main, but the shared design system has not yet been applied and verified across its states.
- **Partial / verify coverage:** a playable slice exists, but a full feature/acceptance loop is not finished.
- **Not available on main:** only in design or an unmerged PR, or explicitly unavailable. Do not report it as playable.
- **Later rollout:** tracked for Phase 2/3 rather than claimed as complete.

## Phase 0 findings

The game is a classic-JavaScript browser runtime. It already has local landscape art, a raster title wordmark, boot and scene-transition layers, a scene-first Old Road, town navigation and service screens, a save-backed traveler, a field journal/map, combat, progression and a Bell Cellar dungeon slice.

Presentation is layered across many CSS files. The consequential cascade includes title-screen-v135.css, title-rpg-menu-v136.css, immersive-world-v150.css, world-client-boot-v100.css, runway-art-pass-v151.css and progression-results-v152.css, alongside earlier baseline styles. Rather than delete or duplicate the existing layers during a visual change, Phase 1 adds one scoped stylesheet after the current stack. CSS consolidation belongs in Phase 3 after visual regressions have been ruled out.

The relevant open changes observed during inspection were Greyfen Marsh Path PR #39 (draft; its latest Playwright run reported 150 passed, 1 failing Greyfen assertion, 1 skipped) and coordination-doc PR #41. This UI feature lives on its own branch and avoids their active files. The Greyfen PR must not be confused with what is playable on main.

## Screen-family inventory

| Screen family / states | Current implementation on main | Baseline status | Phase 1 / follow-up |
|---|---|---|---|
| Startup / boot | index.html, world-client-boot-v100.css, boot sequence modules, tests/boot-sequence-v100.spec.js | Existing: timed boot, manifest/system checks, artwork fallback | Reuse; later verify reduced motion, delayed assets and missing-art/error fallback |
| Title / realm entrance | js/screens/title-screen-view-v120.js; title CSS v120–v136; runway-art-pass-v151.css; local raster wordmark/location art | Existing: wordmark, Continue/New Journey, Profile, Settings, News & Roadmap, Credits and realm atlas | **Phase 1 proof** — redesign composition, frames, menu hierarchy and realm map; preserve button IDs, actions and title identity |
| Title sub-screens | js/game.js, title-dispatches-v140.js, settings/account scripts | Existing: News & Roadmap, Credits, Profile/account entry, Settings and return/fallback pathways | Later rollout; verify every return and fallback state |
| Scene transition / loading | world-client-boot-v100.css, scene-transition modules, data-legend-scene-transition hooks | Existing: boot and transition curtain | Retain in Phase 1; later inspect slow/error/fallback and reduced-motion paths |
| Traveler creation | beginning-v094.js, player creation modules and beginning-v094.css | Existing: name, identity presentation, personality, origin, class, keepsake, summary, validation/back/continue | Later rollout; preserve choice meanings, benefits, ordering and save fields |
| Opening / tutorial | road-opening-v140.js, opening-road-v140.css, creation modules | Existing: anonymous ??? voice, Dead Lantern arrival, Captain Oric, opening encounter/ACT, resume/abandon | Later rollout; keep speaker anonymous and preserve canon/copy |
| Ashmere town hub | ashmere-hub-v099.js, navigation/catalog, ashmere-town-v100.css, immersive-world-v150.css | Existing: panorama, navigation, objective strip, traveler/health/resources and destination links | **Phase 1 proof** — make place art/objective focal, tighten navigation dock, make destinations feel like local places |
| Ashmere service screen | ashmere-controller-v099.js, ashmere-view-v099.js, service modules | Existing: service art/header, content, actions and return-to-town control | **Phase 1 proof via Work Board/daily board** — style shared service frame, retain content/controls/reward logic |
| Greyfen hub and services | Shared hub/catalog plus Greyfen art, crossing, job, market and forge modules | Existing: Greyfen-flavored hub and service routes; not equivalent to complete town release | Later rollout after Phase 1; retain lowland identity and region gating |
| Greyfen Marsh Path | Proposed in PR #39, branch feat/greyfen-marsh-expedition-v160 | **Not available on main** while PR #39 remains unmerged | Do not style it as shipped in this pass; apply system after it lands |
| Ironpass | js/data.js region entry and region gating; available=false | **Not playable on main** | Do not invent a hub/expedition. Inventory when implemented/reachable |
| People / NPC dialogue | ashmere-people-v099.js, dialogue/story modules and shared town view | Existing: people list, individual speakers, conditional dialogue, choices and back navigation | Later rollout; emphasize speaker/dialogue/choices and preserve canon |
| Main quest / journal / evidence | town records, quest-log helpers, evidence/story modules and road journal | Partial/existing: quest objective, local archive/evidence, memories and road journal/map | Later rollout; distinguish observation from inference; preserve quest keys |
| Work Board / contracts | ashmere-workboard-v099.js, contracts/job catalog and daily contracts | Existing: job selection, task result/progress/claim feedback and Greyfen A Dry Crossing contract | Phase 1 service proof uses current Work Board; later cover every challenge/retry/locked/claimed state |
| Character sheet / attributes | town records/profile and progression-level-up-v152.js | Existing: character detail and spendable attribute point overlay | Later rollout; preserve attributes, allocation math and persistence |
| Inventory / item details | town records/inventory modules, item art and shared utility CSS | Existing: counts, item display and consumable/equipment affordances | Later rollout; cover empty inventory, long names, compare and insufficient materials |
| Equipment / smith / workshop | ashmere-forge-v099.js, ashmere-crafting-v099.js, ashmere-workshops-v100.css | Existing: weapon/armor tabs, buy/equip, recipes and feedback | Later rollout; preserve prices, requirements, gear stats and ingredient consumption |
| Inn / rest | Town inn feature and service views | Existing town service | Later rollout; cover confirmation, denied/insufficient resources, success and return |
| Market / trade | ashmere-market-v099.js, shop data and town views | Existing: buy, sell, sell-all and transaction feedback | Later rollout; preserve price/count/failure/gold/inventory semantics |
| Region travel / world map | region-controller-v100.js, region-view-v100.js, region-service-v100.js | Existing: unlock/travel state and locked/unavailable destinations | Later rollout; keep Ironpass unavailable and current region explicit |
| Old Road departure briefing | Town departure module, tests/departure-briefing-v150.spec.js | Existing: health/loadout, supplies and route readiness | Later rollout; preserve costs and start/back actions |
| Old Road live expedition | road-controller-v100.js, road-view-v100.js, road-expedition-screen-v100.js, road actions/discovery/results | Existing: scene, stages, route choice, hotspots, status, pressure/time, actions, optional detours | **Phase 1 proof** — extend scene-first framing, HUD, route/action hierarchy without touching business logic |
| Old Road route/map | Route graph and expedition map modal, tests/road-graph-v160.spec.js | Existing: fork choices, discovered/visited state and optional detours | **Phase 1 proof** — align map frame and route states with shared material, do not change graph/discovery semantics |
| Field journal / discoveries | Expedition screen and journal state, tests/expedition-journal-v150.spec.js | Existing: discoveries, route notes and return summary | Later rollout for overlay/empty/long-content states |
| Combat / intent / skills | road-combat-v100.js, road-combat-view-v100.js and combat tests | Existing: battle presentation, enemy intent, health, actions, skills, cooldowns, retreat/turn feedback | Later rollout; do not change combat formulas, AI intent or action semantics |
| Battle victory / defeat | road-combat-results-view-v152.js and road settlement | Existing: result frame, reward/XP/level display and exit actions | Later rollout; preserve rewards and route reset behavior |
| Bell Cellar dungeon | js/systems/dungeons/bell-vault-v100.js, bell-vault CSS and tests | Partial playable slice: entry, rooms/interactions, encounter, retreat/result | Later rollout; does not mean a full dungeon catalog/boss loop exists |
| Rewards / expedition report | road-results-v100.js, result/debrief views and progression | Existing: secured return, discovery/resource/gold/XP summary and town handoff | Later rollout; preserve reward and quest update behavior |
| Settings / accessibility | settings-screen-v090.js, settings CSS and storage helpers | Existing: local preferences for readability/contrast/motion | Later rollout; verify saved preference, focus and reduced motion |
| Profile / account | Title entry and account/profile modules | Existing screen pathways; inventory does not assume a server authentication service | Later rollout; preserve current behavior, don't invent account services |
| Shared errors/fallbacks | Module-specific unavailable panels, art fallbacks and disabled controls | Existing but not comprehensively exercised across all modules | Phase 1 establishes shared contrast/focus/disabled/fallback styles; Phase 2/3 audit every state |
| Keyboard focus / touch / reduced motion | mobile-safety-v09x.css and screen-specific media rules/tests | Existing partial coverage, not a complete accessibility audit | Phase 1 shared focus/motion rules; Phase 2/3 keyboard/contrast/touch sweep |
| Empty states / confirmations / tooltips / pause | Feature-specific implementations only; no universal pause/tooltip framework evident in the inspected source | Partial/varies by feature | Do not fabricate missing systems; enumerate exact live states during Phase 2 |

## Phase 1 verification checklist

- [x] Branch based on inspected current main; gameplay/save/version modules left untouched.
- [x] One shared design-system stylesheet is appended after the current CSS stack.
- [x] Title/realm entry targeted for cinematic composition, framed menu, existing logo and live realm art.
- [x] Ashmere hub/service targeted for panorama, navigation dock, objective, health/resources, destination plaques and service frame.
- [x] Old Road/map targeted for scene-first frame, legible HUD and consistent route/map panels.
- [x] Inventory and design-system guide added.
- [ ] New Playwright tests and exact commit workflow result pending.
- [ ] Inspect desktop and 390px screenshots after CI; live manual browser inspection has not been available in this session.
- [ ] Confirm no horizontal overflow, focus regression, reduced-motion regression or action/navigation regression on the final PR head.

## Phase 2 — full-game rollout
- [ ] Traveler creation/opening/Oric/dialogue choices
- [ ] Every Ashmere/Greyfen people, story, quest, evidence and report state
- [ ] Character sheet, attributes, inventory, item details, equipment and comparisons
- [ ] Inn, market buy/sell, smith, crafting, Work Board tasks/retries/claims
- [ ] Region travel, locked/unavailable routes and future implemented regional hubs
- [ ] Old Road choices, discoveries, camps, journal/map overlays, retreat and report
- [ ] Greyfen Marsh Path once merged into main
- [ ] Combat intents/cooldowns/turn feedback, wins/losses, rewards and dungeon rooms/retreat
- [ ] Settings/profile/account, empty/error/loading/success/failure/disabled states
- [ ] Keyboard-only navigation, contrast, zoom/readability, reduced motion, touch and 390px/short-height layouts

## Phase 3 — consolidation
- [ ] Capture before/after comparisons for all screen families.
- [ ] Remove only CSS proven obsolete through cascade/source/regression evidence.
- [ ] Audit CSS order and cache/version conventions at release time; no feature-branch version bumps.
- [ ] Verify missing-art fallback, semantic labels and accessible contrast on reachable states.
- [ ] Run full regressions, deployed smoke and responsive/keyboard checks before declaring the full redesign done.

**This branch does not claim the entire game is redesigned.** It establishes the reusable system and a visual proof across cinematic entry, town navigation/service, and active exploration.
