# LEGEND refactor plan
Last updated: 2026-10-16

## The actual goal: a substantial, staged production refactor

The goal is not simply to make `js/game.js` smaller. LEGEND's production code has accumulated overlapping controller generations, wide controllers that own many unrelated screens, implicit save/data contracts, and browser-global dependencies. Refactor those boundaries in small, reviewable slices while keeping the new active game path coherent. Legacy recovered-build saves are no longer supported, by project direction.

The reboot prototype under `prototypes/reboot/` is not the target. Do not replace production with it, and do not turn this into a framework rewrite.

## Confirmed structural hot spots

- `js/systems/ashmere-controller-v099.js`: started at 93.6 KB / 883 lines. After the current branch's extractions, it is about 7.3 KB / 171 lines; the route façade, feature adapters, and initialization remain, while player records, town guidance, hub, routes, navigation, view shell, art/catalogs, job data/execution, market, crafting, forge, people/NPCs, inn, side contracts, and crossing live in focused modules.
- `js/systems/road-controller-v100.js`: now about 6 KB / 139 lines; initializes the road services and coordinates kickoff/combat/public entry. State rules, content, discovery, view, actions, screen assembly, and settlement are focused modules.
- `js/systems/road/road-decisions-v100.js` now owns the initial route fork and the moved-cairn side-story choice mutations; discovery keeps an adapter for the existing road facade.
- `js/systems/road/road-discovery-v100.js` is now the discovery facade; `road-discovery-view-v100.js` owns clue/route/cairn panel markup, `road-poi-catalog-v100.js` resolves contextual clue records, `road-decisions-v100.js` applies branch choices, and `road-poi-outcomes-v100.js` settles clue evidence/rewards.
- `js/systems/road-controller-v087.js`: retired and deleted from the active project; v100 is now the only road controller.
- `js/core/game-runtime-v120.js` delegates player persistence to `LegendStorage`; it remains as the return/navigation bridge while its observer/recovery behavior awaits browser verification.
- `js/systems/region-controller-v100.js` keeps the public regional facade and UI wiring; `js/systems/region-view-v100.js` owns the map UI, and `js/systems/region-service-v100.js` owns unlock/travel checks and mutations.
- `js/game.js` shrank from 325 to about 101 lines after extracting the active title controller into `js/screens/title-screen-v120.js`; menu markup lives in `js/screens/title-screen-view-v120.js`, auxiliary gate/credits flows live in `js/screens/title-extras-v120.js`, and ambience/effects remain in `js/systems/title-audio-v120.js`.
- `js/systems/account-v09x.js`: 5.1 KB / 114-line account facade for async auth/cloud orchestration and bootstrap callbacks; profile markup is in `js/systems/account/account-profile-view-v09x.js`, profile metadata persistence is in `js/systems/account/account-profile-store-v09x.js`, auth UI/service is in `js/systems/account/account-auth-v09x.js`, and cloud-slot CRUD is in `js/systems/account/cloud-traveler-slots-v09x.js`. Player saves remain owned by `LegendStorage`.
- `index.html` loads versioned classic scripts that publish APIs on `window`. Script order and global names are part of the runtime contract until migrated deliberately.
- `js/storage.js` focuses on player save/load/delete and stable facade methods; `js/storage/player-normalizer-v120.js` owns player defaults and normalization, and `js/storage/settings-storage-v120.js` owns device-local accessibility settings.
- Traveler identity/pronoun and personality-bonus options are in `js/systems/player/player-creation-options-v094.js`, separate from flow and view logic.
- `js/systems/player/player-creation-steps-v094.js` owns narrative step prompts and transforms class/origin/keepsake catalog records into choice data consumed by `LegendPlayerCreationViewV094`; `LegendBeginningV094` owns selection state and callback order.

## Refactor phases

### 0. Baseline and contracts
- [x] Record production script boundaries and critical storage keys in `docs/ARCHITECTURE.md`.
- [x] Add `docs/ADDING_FEATURES.md` with the owning module, insertion points, save contracts, and validation path for common feature types.
- [x] Start a low-risk settings-screen extraction as a first wiring/pattern exercise (draft PR #17; not deployed).
- [x] Retire and delete the v087 road controller and make `LegendRoadControllerV100` the only road entry point; move road data to `LegendRoadsV100`.
- [x] Extract v100 enemy intent, class techniques, turn/damage/action rules, and victory rewards into `js/systems/road/road-combat-v100.js`; preserve the expedition controller entry point and inject state/audio/progression adapters.
- [x] Extract battle markup and combat command binding into `js/systems/road/road-combat-view-v100.js`; have the view forward fight/act/item/guard/retreat commands to the combat service without owning combat mutations.
- [x] Extract road sound preference, UI tones, battle effects, and battle music into `js/systems/road/road-audio-v100.js`; preserve the existing `legend-road-sound` preference and delegate both expedition and combat controls to the same audio service.
- [x] Document the current player/save shape, active key, dynamic flags/stats, item/region IDs, and v100 progression contract in `docs/SAVE_DATA_CONTRACT.md`.
- [x] Inventory current production callers of `LegendRuntimeV120` and direct `LegendStorage` users: title/bootstrap, traveler creation, account/profile, Ashmere/region screens, and the active v100 road controller.
- [x] Complete the current persistence ownership pass: `LegendStorage` is the sole owner of player save/load; `LegendRuntimeV120` delegates to it and retains return/navigation only.
- [x] Extract starting player record construction from the seven-step traveler-creation UI into `js/systems/player/player-record-v094.js`; preserve starting values and verify merged origin/keepsake inventory with a browser regression test.
- [x] Extract traveler creation name/choice/confirmation/intro markup and DOM binding into `js/systems/player/player-creation-view-v094.js`; keep choice state, validation decisions, persistence, and navigation callbacks in `LegendBeginningV094`.
- [x] Extract traveler gender/pronoun/personality options and starting personality bonuses into `js/systems/player/player-creation-options-v094.js`; keep choice state and flow in `LegendBeginningV094`.
- [x] Extract the five selectable creation-step definitions and class/origin/keepsake choice-data mapping into `js/systems/player/player-creation-steps-v094.js`; preserve existing prompt copy and selection callback order.
- [x] Separate device-local accessibility settings persistence into `js/storage/settings-storage-v120.js` while keeping `LegendStorage`'s public settings methods stable.
- [x] Extract account/profile screen markup and DOM event binding into `js/systems/account/account-profile-view-v09x.js`; keep local profile persistence and async auth/cloud decisions in `LegendAccountV09x`.
- [x] Extract the device-local account metadata key and profile snapshot/get/save/delete helpers into `js/systems/account/account-profile-store-v09x.js`; do not merge its key with the player-save key.
- [x] Extract the regional ledger/map rendering and action binding into `js/systems/region-view-v100.js`; keep affordability/requirements checks, unlocking, fares, memory writes, and player saves in `LegendRegionsV100`.
- [x] Extract region prerequisite checks, token unlocks, travel fares, region mutation, memories, and save orchestration into `js/systems/region-service-v100.js`; preserve `LegendRegionsV100.render/unlock/travel` as the stable entry points.
- [x] Extract active title rendering, title audio hooks, transition notice, optional gate screen, and credits into `js/screens/title-screen-v120.js`; inject navigation handlers through `LegendGameBootstrap` and remove unused legacy portal/menu builders from `js/game.js`.
- [x] Extract the main title menu template into `js/screens/title-screen-view-v120.js`; keep traveler state/transition/navigation binding in the controller and remove the title's unused profile lookup.
- [x] Extract the optional title gate and accessible credits dialog into `js/screens/title-extras-v120.js`; preserve the `LegendTitleScreenV120` wrapper API.
- [x] Move title ambience, menu hover/focus cues, confirmation audio, and audio-unlock binding into `js/systems/title-audio-v120.js`; keep the title screen API focused on presentation and menu actions.
- [x] Extract the traveler sheet and archive/journal screens into `js/systems/town/ashmere-records-v099.js`, leaving the existing Ashmere route names as compatibility wrappers.
- [x] Extract region/quest/token-aware recommended-next-step rules into `js/systems/town/ashmere-guidance-v099.js`; keep the hub focused on route-card and destination presentation.
- [x] Extract Ashmere/Greyfen destination-card data into `js/systems/town/ashmere-destination-catalog-v099.js`; keep region-specific copy and art keys separate from the hub's HTML rendering.
- [x] Extract Ashmere/Greyfen home goal selection, destination cards, status, and footer navigation into `js/systems/town/ashmere-hub-v099.js`; keep `LegendAshmereV099.renderAshmere()` as the routed façade.
- [x] Extract the Ashmere/Greyfen route-board cards and copy into `js/systems/town/ashmere-routes-v099.js`; keep route dispatch and public entry points in `LegendAshmereV099`.
- [x] Extract town destination dispatch into `js/systems/town/ashmere-navigation-v099.js`; preserve `LegendAshmereV099.route()` and inject screen handlers through a route map.
- [x] Extract the town shell, header/back controls, and UI audio bindings into `js/systems/town/ashmere-view-v099.js`; inject player, art, and route callbacks and preserve the existing markup/hooks.
- [x] Split the Ashmere/Greyfen people directory from the NPC dialogue/evidence progression into `ashmere-people-v099.js` and `ashmere-npc-dialogue-v099.js`; retain the public people-module dispatcher and existing saved flags.
- [x] Extract baseline Ashmere/Greyfen NPC copy into `js/systems/town/ashmere-npc-catalog-v099.js`; keep state-driven dialogue variants, quest mutations, persistence, and rendering in the dialogue service.
- [x] Extract conditional NPC dialogue and NPC-triggered quest-state mutations into `js/systems/town/ashmere-npc-story-v099.js`; keep the dialogue facade focused on baseline lookup, save/render orchestration, and the regional-ledger action.
- [x] Extract the Greyfen boundary/archive investigation’s dialogue and evidence-state mutations into `js/systems/town/ashmere-greyfen-evidence-story-v099.js`; keep general Ashmere return briefing and NPC rendering separate.
- [x] Inject Greyfen evidence and first-return dialogue services into `LegendAshmereNpcStoryV099.create()`; keep `.apply()` as a compatibility wrapper and pass the story/catalog/region callback into NPC dialogue context.
- [x] Move town feature context assembly and feature-screen dispatch into `js/systems/town/ashmere-features-v099.js`; retain the existing `LegendAshmereV099.route()` contract.
- [x] Extract shared item/art lookup maps and catalog presentation helpers into `js/systems/town/ashmere-assets-v099.js`; inject data/assets/player accessors while preserving icon, equipment-name, and region-art mappings.
- [x] Extract the Work Board's Ashmere/Greyfen job definitions, prompts, grades, reward values, and sequence data into `js/systems/town/ashmere-job-catalog-v099.js`; the runner now owns challenge lifecycle, persistence, and rewards.
- [x] Split market buy/sell into `js/systems/town/ashmere-market-v099.js`, recipes into `ashmere-crafting-v099.js`, and equipment/forge behavior into `ashmere-forge-v099.js`; keep `ashmere-commerce-v099.js` as the route-compatible dispatcher and send sibling-screen navigation through injected callbacks.
- [x] Extract inn rendering, rest/supply purchases, and rumors into `js/systems/town/ashmere-inn-v099.js`; preserve existing service costs and inject persistence/presentation helpers.
- [x] Extract side-contract counters, acceptance/turn-in rewards, and existing evidence text into `js/systems/town/ashmere-contracts-v099.js`; preserve quest flags and inject player/save/progression/view helpers.
- [x] Extract Greyfen Dry Crossing choices, retry costs, health toll, marker rewards, and completion handling into `js/systems/town/ashmere-crossing-v099.js`; preserve the existing completion and attempt flags.
- [ ] Smoke-test traveler records, NPC evidence dialogue, side-contract acceptance/turn-in, Dry Crossing safe/risky routes, work board challenge modes/rewards, market/crafting/gear, inn services, and return navigation.
- [x] Document the player/save shape, core flags, region IDs, item IDs, and current script load order before moving domain logic.

### 1. Split the Ashmere monolith
Keep `LegendAshmereV099` as a compatibility façade while moving responsibilities to narrow town modules. The current branch has extracted:
1. traveler sheet and archive/records;
2. work board and activity/jobs;
3. trader, inventory transactions, crafting, smithing, and gear;
4. people/NPC dialogue and town keeper interactions;
5. inn and lodging services;
6. side contracts;
7. the Greyfen Dry Crossing mini-contract.

Still to review:
1. the remaining shared helper surface and initialization hooks; simplify the compatibility façade only after a caller inventory and focused flow coverage.
2. audit direct document/global event bindings in town services and keep navigation callbacks explicit.

Pass shared dependencies through small context objects or explicit function arguments instead of introducing more hidden global coupling. Keep current HTML/CSS classes and saved flags stable in this phase.

### 2. Consolidate road and combat ownership
- [x] Extract the v100 combat implementation behind a focused module boundary.
- [x] Move route choice, POI interactions, evidence recording, and discovery rewards into `js/systems/road/road-discovery-v100.js`; retain the existing `LegendRoadControllerV100` entry point and injected state/save/render contracts.
- [x] Extract the Blackroot/Greyfen Bell evidence flag/memory/objective chain into `js/systems/quests/bell-road-evidence-v120.js`; the road discovery service now receives the quest evidence recorder through its context.
- [x] Extract Old Road scene markup, DOM-preserving shell, sound toggle, hotspot delegation, and expedition header into `js/systems/road/road-view-v100.js`; keep gameplay mutations injected.
- [x] Extract travel/search choices, pressure changes, skill checks, find rewards, and encounter selection into `js/systems/road/road-actions-v100.js`; keep rendering and combat behind injected callbacks.
- [x] Keep reward/XP/token settlement and first-return reporting in `js/systems/road/road-results-v100.js`; preserve current progression and quest fields.
- [x] Extract outcome markup and Return-button binding into `js/systems/road/road-results-view-v100.js`; keep return policy injected from the road controller.
- [x] Move expedition-stage panel composition and camp/search/travel input binding into `js/systems/road/road-expedition-screen-v100.js`; preserve public `renderExpedition()` as a facade delegate.
- [x] Centralize v100 expedition state defaults, score/equipment rules, inventory increments, display labels, and Bell quest objective updates in `js/systems/road/road-state-v100.js`.
- [x] Move reusable Old Road stage descriptions and base point-of-interest definitions into `js/content/roads/old-road-v100.js`; retain route/state-dependent clue variants in the controller.
- [x] Make v100 the sole active road path and remove its v087 fallback/interceptor.
- [x] Remove legacy save-key import, the runtime’s duplicate persistence fallback, `xpUntil` from new travelers, and `roadV087`/`xpUntil` fields from normalized active saves. The v100 progression rules are now authoritative.
- [ ] Browser-smoke-test active v100 flows and confirm XP, level-up, token rewards, audio, and return-to-Ashmere.
- [x] Centralize Bell quest-log objective replacement in `js/systems/quest-log-v120.js`; both Ashmere and v100 road progression now use `LegendQuestLogV120` instead of maintaining parallel implementations.
- [x] Extract context-sensitive Old Road POI selection into `js/content/roads/road-poi-catalog-v100.js`; leave discovery panels and investigation rewards in `road-discovery-v100.js`.
- [x] Extract route-fork and moved-cairn state mutations into `js/systems/road/road-decisions-v100.js`; keep discovery's public methods as adapters.
- [x] Extract POI investigation outcomes (evidence, rewards, pressure, counters, persistence and feedback) into `js/systems/road/road-poi-outcomes-v100.js`; preserve the discovery facade API.
- [x] Extract discovery, route-fork, and moved-cairn panel rendering into `js/systems/road/road-discovery-view-v100.js`; keep input decisions, flag changes, and rewards in the discovery service.
- [x] Move POI-outcome/discovery-view factories and the result-view instance into `LegendRoadControllerV100`'s composition boundary; inject them into road-discovery/results services instead of reading sibling services from inside domain modules.
- [x] Keep XP thresholds, level-up mutation, and read-only current-level XP progress in `LegendProgressionV100`; pass the status function into the Traveler view. Gold/item/token settlement remains feature-owned rather than forcing unrelated rewards into a generic transaction service.
- Redirect call sites in small steps. Only remove a legacy path after static reference review and a focused manual regression pass show it is unused.

### 3. Establish state and persistence contracts
- [x] Make `LegendStorage` the single owner for player-save and settings persistence.
- [x] Extract player field/default normalization into `js/storage/player-normalizer-v120.js`; keep `LegendStorage.baseSkills()` and `LegendStorage.normalize()` as stable caller-facing methods.
- [x] Retire imports from old `legend-recovered-build-v0*` keys; only the current active save key is supported.
- [x] Remove the v087-specific `xpUntil`/`roadV087` progression state from new/normalized current saves.
- Describe normalized player fields, region values, inventory item IDs, and flags. Add a save-fixture test or lightweight validation without altering stored data.
- Avoid schema migration until a real compatibility bug is found and tested.

### 4. Reduce shared UI/runtime coupling
- [x] Introduce focused title and settings screen boundaries with navigation injected through `LegendGameBootstrap`.
- Create a broader shared navigation contract only after town, traveler-creation, and road call sites have been fully mapped.
- Replace broad document-wide event interception only when every affected caller is understood.
- Keep scene-transition behavior and focus/keyboard interactions intact.
- [x] Inventory active production script escape helpers and consolidate the identical HTML escaping mapping in `js/core/html-utils-v120.js`; URL validation and arbitrary-HTML sanitization remain separate concerns.

### 5. Verification and stabilization
For each extraction: review the diff, run syntax checks on changed files, add focused regression coverage, and manually smoke-test the touched production flow where the deployed site is reachable. Playwright is an active CI regression gate; investigate failures from the report before changing assertions. A passing PR-branch run verifies the branch against its local test server, not the deployed GitHub Pages build. Document anything not verified, especially production flows not reached by a live smoke test.

## Guardrails

- No changes to active or historical storage keys merely for organization.
- No breaking save-format changes or resets; preserve backward compatibility.
- Do not mix refactoring with new classes, regions, combat mechanics, story content, or art revisions.
- Do not mass-rename files or strip version suffixes until script references are fully mapped.
- No giant rewrite. Each PR should make a meaningful, bounded structural improvement and remain easy to revert.
- The settings extraction is only the first small slice, not the completion of the major refactor.
