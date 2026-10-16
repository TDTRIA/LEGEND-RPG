# Production architecture audit
Updated: 2026-10-16

This is a working map of the production browser game. It is not a map of `prototypes/reboot/`. The code uses classic browser scripts and shared `window` namespaces, so script order and global names must be treated as runtime contracts.

## Entry point and module model

The active code uses versioned classic scripts loaded in order by `index.html`; preserve script ordering and public globals while extracting responsibilities. CI derives its production syntax-check set from local script tags in `index.html` and automatically checks Playwright `*.spec.js` files under `tests/`.

- `index.html` loads the production scripts directly, in an explicit order. There is no bundler or native ES-module graph.
- `js/data.js` defines `window.LEGEND_DATA`: version, active save key, legacy keys, class/origin/keepsake data, item names/prices, and region definitions.
- `js/storage.js` publishes `window.LegendStorage` and owns player save/load/delete, while preserving the stable `baseSkills()` and `normalize()` facade methods. The field defaults and normalizing rules live in `js/storage/player-normalizer-v120.js`; device-local settings persistence lives in `js/storage/settings-storage-v120.js`.
- `js/core/html-utils-v120.js` publishes `LegendHtmlV120.escapeHtml()` as the shared implementation for escaping text inserted into HTML. It is not an arbitrary-HTML sanitizer and does not validate URLs.
- `js/screens/title-screen-view-v120.js` owns the main title menu markup and established CSS/accessibility hooks.
- `js/screens/title-extras-v120.js` owns the optional gate transition and accessible credits dialog; `LegendTitleScreenV120` keeps wrapper methods for both screens.
- `js/screens/title-screen-v120.js` owns title state preparation, transition feedback, optional gate screen and credits; navigation actions are injected.
- `js/systems/title-audio-v120.js` owns title ambience, menu hover/focus cues, confirmation sounds, and first-interaction audio unlock.
- `js/game.js` is the thin bootstrap/navigation adapter for continue, new traveler, account, settings, and title-screen callbacks. It publishes `window.LegendGameBootstrap`.
- `js/screens/settings-screen-v090.js` owns settings presentation and its control binding. Persistence remains in `js/storage.js`.
- Feature systems use classic browser scripts and shared `window` namespaces; injection objects provide the dependencies between extracted screens.
- `docs/ADDING_FEATURES.md` maps common feature types to their data, rules, views, and facade wiring points so new gameplay stays inside the existing module boundaries.

## Confirmed hot spots

| File | Size (source lines) | Responsibility currently mixed together | Refactor direction |
| --- | ---: | --- | --- |
| `js/systems/ashmere-controller-v099.js` | 171 lines | Town route façade, shared feature contexts, and runtime initialization | Keep public routes stable and delegate navigation and feature behavior to focused modules |
| `js/systems/town/ashmere-assets-v099.js` | 95 lines | Item ID aliases, item display names, region/art lookups, equipment names, and icon markup | Own town presentation/catalog helper mappings via injected data/assets/player accessors |
| `js/systems/town/ashmere-view-v099.js` | 84 lines | Town framing, header/back controls, and pointer/click UI-audio bindings | Own the shared screen shell; receive player, image, icon, and navigation adapters through `create()` |
| `js/systems/town/ashmere-routes-v099.js` | 64 lines | Ashmere/Greyfen route-board copy and destination cards | Own route-board presentation; route button handling stays in the facade dispatcher |
| `js/systems/town/ashmere-navigation-v099.js` | 57 lines | Public town view ID to handler map for home, NPCs, feature screens, routes, road, profile, and regions | Add new town destinations in one map while preserving `LegendAshmereV099.route()` as the public façade |
| `js/systems/town/ashmere-guidance-v099.js` | 20 lines | Chooses the suggested next action from region, quest flags, and Road Token count | Own progression-aware town guidance independently of the hub markup; expose `getGoal(player)` |
| `js/systems/town/ashmere-destination-catalog-v099.js` | 32 lines | Region-specific destination titles, descriptions, CTA labels, feature highlighting, and optional art keys | Keep town destinations data-driven; return records from `forRegion(regionId, currentView, flags)` |
| `js/systems/town/ashmere-hub-v099.js` | 64 lines | Ashmere/Greyfen route strip, destination-card rendering, status, and footer navigation | Own hub presentation; get next-step guidance and destination records from focused services |
| `js/systems/town/ashmere-features-v099.js` | 223 lines | Shared dependency assembly and dispatch to records, jobs, commerce, people, inn, contracts, and crossing modules | Own feature adapters; keep feature modules independently injected and route-compatible |
| `js/content/roads/old-road-v100.js` | Data-only catalog | Old Road metadata, route checks, finds, enemies, six stage scenes, and base points of interest | Keep reusable road text/data separate from stateful expedition logic |
| `js/systems/road-controller-v100.js` | 154 lines | Module initialization, expedition kickoff/stage adaptation, combat adapter and public facade | Keep as orchestration only; shared state/rules belong to the road-state service |
| `js/core/game-runtime-v120.js` | 102 | Return-to-Ashmere/navigation bridge | Player load/save delegates to `LegendStorage`; retain return/recovery flow until browser-verified |
| `js/storage.js` | 33 lines | Player save/load/delete plus stable `LegendStorage` facade methods | Keep persistence ownership and public API names stable |
| `js/storage/player-normalizer-v120.js` | 122 lines | Player-record defaults, retired-field cleanup, and preservation of current unknown data | Own normalization rules separately from storage I/O and expose them through `LegendStorage.normalize()` |
| `js/storage/settings-storage-v120.js` | 55 lines | `legend-settings-v1`, default accessibility options, and UI class application | Own device-local settings persistence separately from player-record normalization |
| `js/core/html-utils-v120.js` | 18 lines | Shared escaping for HTML text and quoted attribute values | Keep the character mapping in one place; use a separate validator for URL/sanitizer requirements |
| `js/screens/title-screen-v120.js` | 87 | Active menu state preparation, transition notice, and action binding | Keep navigation callbacks here; delegate menu markup, audio, gate and credits to focused services |
| `js/screens/title-extras-v120.js` | 64 | Optional title gate interaction and accessible credits dialog | Own auxiliary title screens; receive title-render and audio callbacks via `create()` |
| `js/screens/title-screen-view-v120.js` | 67 | Main title menu markup, traveler line, menu buttons, and footer | Keep presentation/CSS hooks pure; receive already-prepared display state through `render()` |
| `js/systems/title-audio-v120.js` | 55 | Title ambience, hover/focus cues, confirmation effects, audio unlock | Keep audio lifecycle outside menu markup behind a small service API |
| `js/game.js` | 104 | Continue/new-traveler/account/settings adapters and `LegendGameBootstrap` | Keep as a thin entry/facade layer, not a dumping ground for feature systems |
| `js/systems/beginning-v094.js` | Creation flow + choice state | Seven-step choice orchestration, validation, record-builder invocation, persistence, and intro transition | Keep progression of the creation flow here; delegate DOM rendering/binding and record construction |
| `js/systems/player/player-creation-view-v094.js` | 133 lines | Name, choice, confirmation, and intro screen markup plus local DOM event binding | Own creation presentation; accept current selections and callbacks without reading/writing player saves |
| `js/systems/player/player-creation-options-v094.js` | 36 lines | Gender/pronoun labels and personality text/starting-bonus choices | Keep choice catalogs data-only while the creation flow owns selection/validation |
| `js/systems/player/player-creation-steps-v094.js` | 98 lines | Narrative copy and catalog-to-choice mapping for the five selectable creation steps | Keep prompts and data shaping out of the flow controller; pass current data/options to `get()` |
| `js/systems/player/player-record-v094.js` | Focused record builder | Starting identity, stats, inventory/equipment, quest log, memories, and storage normalization adapter | Keep player record assembly independent of UI rendering and pass catalogs/normalization explicitly |
| `js/systems/town/ashmere-records-v099.js` | 98 | Traveler sheet and journal/archive screen rendering | Read-only view module; shared dependencies are passed in explicitly |
| `js/systems/town/ashmere-workboard-v099.js` | 148 lines | Work Board rendering, timing/choice/sequence challenge lifecycle, event binding, and rewards | Own challenge execution and save/reward handling while taking job data from the catalog module |
| `js/systems/town/ashmere-job-catalog-v099.js` | 28 lines | Ashmere and Greyfen job definitions, prompts, choice grades/feedback, reward values, sequence steps, and mode labels | Keep new jobs/region variants data-driven and separate from the challenge runner |
| `js/systems/town/ashmere-commerce-v099.js` | 36 lines | Compatibility dispatcher for trader, crafting, and forge routes | Keep existing `LegendAshmereCommerceV099.render()` callers stable while services remain separate |
| `js/systems/town/ashmere-market-v099.js` | 50 lines | Trading Post listings, buy/sell, and sell-all loot transactions | Own market stock/prices and inventory/gold changes through injected persistence helpers |
| `js/systems/town/ashmere-crafting-v099.js` | 41 lines | Recipe list, ingredient display/checks, crafting transactions, and feedback | Own recipes and ingredient consumption; sibling navigation goes through the dispatcher callbacks |
| `js/systems/town/ashmere-forge-v099.js` | 107 lines | Weapon/armor listings, weapon illustrations, equipment comparisons, purchase/equip rules | Own gear state changes; crafting-tab navigation goes through the dispatcher callbacks |
| `js/systems/town/ashmere-people-v099.js` | 66 lines | Ashmere/Greyfen people directory and character-card rendering | Keep directory list and character route selection separate from dialogue/evidence behavior |
| `js/systems/town/ashmere-npc-catalog-v099.js` | 98 lines | Baseline Ashmere/Greyfen character names, roles, descriptions, opening lines, and art keys | Keep baseline narrative copy independent of quest-state branches and DOM rendering |
| `js/systems/town/ashmere-greyfen-evidence-story-v099.js` | 104 lines | Greyfen boundary/archive dialogue, evidence-reporting flags, memories, and quest objective changes | Own the Greyfen evidence arc separately; accept current player/NPC/dialogue and objective updater, without persistence or rendering |
| `js/systems/town/ashmere-first-road-return-dialogue-v099.js` | 91 lines | Mara/Brenn/Oric dialogue variants for the first secured return based on route/discovery flags | Keep route-report narrative copy in its own module; read player flags and update only the supplied dialogue object |
| `js/systems/town/ashmere-npc-story-v099.js` | About 70 lines | NPC talk-state updates, Mara’s objective, and conditional story variants | Expose `create({greyfenEvidenceStory, firstRoadReturnDialogue})`; retain `.apply()` as a compatibility wrapper |
| `js/systems/town/ashmere-npc-dialogue-v099.js` | About 55 lines | NPC dialogue rendering, save orchestration, and the token-ledger action | Receive baseline catalog, story service, and region navigation callback through its context |
| `js/systems/town/ashmere-inn-v099.js` | 46 | Inn screen, rest/supply purchases, and region-sensitive rumors | Owns existing inn service interactions; persistence and view helpers are injected |
| `js/systems/town/ashmere-contracts-v099.js` | 84 lines | Side-contract definitions/counters, accept/turn-in rules, rewards, and journal updates | Own side-contract logic; player/save/progression/view dependencies are injected |
| `js/systems/town/ashmere-crossing-v099.js` | 73 lines | Greyfen Dry Crossing choices, safe/risky outcomes, retry cost, health toll, and marker rewards | Own the mini-contract flow separately from side-contract progress; receive town state/save/screen callbacks |
| `js/content/roads/road-poi-catalog-v100.js` | 69 lines | Contextual POI selection when route/evidence state changes which clue should appear | Own clue selection and narrative overrides; inject player/state/data readers |
| `js/systems/road/road-decisions-v100.js` | 73 lines | Route-fork selection and moved-cairn decision mutations | Keep expedition branch/side-story state changes separate from discovery presentation and general POI rewards |
| `js/systems/road/road-poi-outcomes-v100.js` | 85 lines | Point-of-interest examination outcomes: evidence, rewards, pressure, counters, save and feedback | Own stateful clue outcomes; keep them separate from clue selection and panel markup |
| `js/systems/road/road-discovery-v100.js` | About 105 lines | Discovery facade, visibility/reveal state, POI/view/decision adapters | Receive POI outcome and discovery view factories from `LegendRoadControllerV100`; preserve its public API |
| `js/systems/road/road-discovery-view-v100.js` | 45 lines | Clue reveal panel, opening route-fork panel, and moved-cairn choice markup | Own pure presentation for discovery choices; receive selected point data and current visibility state through arguments |
| `js/systems/quests/bell-road-evidence-v120.js` | 50 lines | Bell storyline evidence flags, memories, and objective changes for Blackroot/Greyfen road records | Own quest-specific evidence mutation behind an injected Bell-objective updater |
| `js/systems/road/road-state-v100.js` | 49 lines | Canonical expedition flag initialization/clamping, player stat modifiers, item/equipment lookup, and inventory addition | Reuse this API for future road systems instead of duplicating saved-state rules; Bell objective mutation is centralized in `LegendQuestLogV120` |
| `js/systems/road/road-view-v100.js` | 132 lines | Scene rendering, DOM-preserving shell updates, sound toggle, hotspot event delegation, and expedition header markup | Own presentation/input mechanics; injected callbacks route gameplay actions to their state owners |
| `js/systems/road/road-actions-v100.js` | 96 lines | Travel/search resolution, pressure, skill checks, finds, and encounter selection | Own the effectful road action layer through injected save/state/render/combat services |
| `js/systems/road/road-results-view-v100.js` | 28 lines | Expedition outcome frame, summary copy, and Return button binding | Own result presentation and forward return intent through an injected callback |
| `js/systems/road/road-results-v100.js` | About 70 lines | Expedition reward/XP/token settlement and first-return story report | Receive the result-view instance plus return policy as dependencies; own settlement/reward decisions only |
| `js/systems/road/road-expedition-screen-v100.js` | 60 lines | Expedition stage panel assembly and camp/road control event binding | Own screen composition; inject domain decisions and state changes from actions/discovery/results modules |
| `js/systems/road/road-combat-view-v100.js` | 81 lines | Battle layout, player/enemy status panels, command buttons, and combat UI event binding | Own battle presentation and forward commands to injected handlers; do not mutate combat state in the view |
| `js/systems/road/road-combat-v100.js` | 162 lines | Enemy intent, class techniques, damage/turn rules, item use, retreat/defeat, and victory rewards | Own combat behavior and progression effects; delegate battle markup and button binding to the combat view |
| `js/systems/road/road-audio-v100.js` | 55 | Road sound preference, UI tones, battle sound effects, and battle music lifecycle | Single road-audio API for the v100 expedition and combat modules; owns `legend-road-sound` preference |

## Road-controller overlap audit

- `index.html` now loads only `js/content/roads/old-road-v100.js` and `js/systems/road-controller-v100.js` for road content and expedition flow.
- `LegendRoadControllerV100` is the sole active road controller. The old v087 controller and its button-interception side effect have been removed from the production path and the source file is deleted.
- Road content now exports `window.LegendRoadsV100`; the old `LegendRoadsV087` namespace is no longer used.
- Active v100 state is `flags.roadExpeditionV100`, and XP/rewards come from `LegendProgressionV100.award` and the v100 expedition rules. The normalizer discards legacy `flags.roadV087`/`xpUntil` state rather than trying to translate it.
- Combat behavior is isolated in `js/systems/road/road-combat-v100.js`; battle markup/command binding is in `js/systems/road/road-combat-view-v100.js`; sound preference and effects are isolated in `js/systems/road/road-audio-v100.js`.

## Runtime and storage call-site inventory

| Caller | Current dependency | Why the bridge must be preserved for now |
| --- | --- | --- |
| `js/game.js` | Direct `LegendStorage` load/save/settings calls | Title menu uses player presence to choose Begin/Continue; settings are device-local. |
| `js/systems/beginning-v094.js` | Direct `LegendStorage` save/load; `LegendPlayerRecordV094` builder; runtime return fallback | Collects traveler choices, saves the builder-created record, then marks the intro complete and enters the town. |
| `js/systems/account-v09x.js` | 114 lines | Account facade, async auth/cloud orchestration, and bootstrap callbacks | Keep the public account API; delegate screen markup/binding, auth, cloud-slot CRUD, and local profile metadata storage |
| `js/systems/account/account-profile-store-v09x.js` | 52 lines | Device-local profile metadata key, get/save/delete, and traveler snapshot construction | Own only the profile metadata key; player save/load remains in `LegendStorage` |
| `js/systems/account/account-profile-view-v09x.js` | 120 lines | Profile screen markup and local DOM event binding for traveler and cloud slots | Own account/profile presentation; invoke injected callbacks for navigation, profile updates, and cloud-slot intent |
| `js/systems/account/cloud-traveler-slots-v09x.js` | 88 lines | Supabase cloud traveler slot list/save/load/delete, readiness checks, and slot error handling | Own cloud-slot CRUD and keep the account UI from embedding remote persistence rules |
| `js/systems/account/account-auth-v09x.js` | 166 lines | Supabase readiness/session/sign-in/sign-up/sign-out and profile-metadata callbacks for auth flows | Own remote auth calls and profile-metadata effects; delegate panel markup and DOM binding to the focused auth view |
| `js/systems/ashmere-controller-v099.js` | `LegendRuntimeV120.loadPlayer/savePlayer/onRender` | Town screens read/write current player state; the render hook restores the town shell when necessary. |
| `js/systems/region-controller-v100.js` | 53 lines | Regional map wiring, back-to-town routing, and stable `LegendRegionsV100` facade | Preserve public `render/unlock/travel` API and delegate transactions to the focused service |
| `js/systems/region-service-v100.js` | 79 lines | Region prerequisite checks, token unlocks, travel fares, region mutation, memories, and save orchestration | Own region-changing rules separately from rendering/controller wiring |
| `js/systems/region-view-v100.js` | 108 lines | Region cards, unlock/travel affordances, map layout, wallet display, and action binding | Own map presentation; take current player/region data and intent callbacks as injected dependencies |

| `js/systems/road-controller-v100.js` | Runtime load/save/return | Expedition stage, pressure, combat results, and town return depend on the bridge. |
| `js/core/game-runtime-v120.js` | Delegates player load/save to `LegendStorage` | Also owns pending-return session state, title continue-click fallback, mutation-observer hooks, and return-to-town recovery. |

The static caller inventory is complete enough to guide the next review, but it is not yet proof that the runtime return/MutationObserver hook can be simplified. v087 no longer registers the hook or rewrites click handlers. Keep the hook until title, traveler creation, town, expedition, combat, and return flows have been browser-smoke-tested.

## Critical runtime APIs

| Boundary | Current public API / role |
| --- | --- |
| Game data | `window.LEGEND_DATA` |
| Player/settings storage | `window.LegendStorage` |
| Device-local settings store | `window.LegendSettingsStorageV120.create()` |
| Legacy runtime bridge | `window.LegendRuntimeV120` |
| Progression helper | `window.LegendProgressionV100` (`award`, `status`) |
| Quest-log mutation helpers | `window.LegendQuestLogV120` |
| Bell road evidence | `window.LegendBellRoadEvidenceV120.create()` |
| Title presentation | `window.LegendTitleScreenV120` |
| Title menu view | `window.LegendTitleScreenViewV120.render()` |
| Title extras | `window.LegendTitleExtrasV120.create()` |
| Title audio | `window.LegendTitleAudioV120` |
| Title/bootstrap/navigation | `window.LegendGameBootstrap` |
| Traveler record builder | `window.LegendPlayerRecordV094` |
| Traveler creation step catalog | `window.LegendPlayerCreationStepsV094.get()` |
| Traveler creation view | `window.LegendPlayerCreationViewV094` |
| Region map view | `window.LegendRegionViewV100.create()` |
| Traveler creation | `window.LegendBeginningV094` |
| Ashmere next-step guidance | `window.LegendAshmereGuidanceV099.getGoal(player)` |
| Ashmere destination catalog | `window.LegendAshmereDestinationCatalogV099.forRegion(regionId, currentView, flags)` |
| Ashmere/Greyfen home hub | `window.LegendAshmereHubV099` |
| Ashmere route map | `window.LegendAshmereNavigationV099.create()` |
| Ashmere asset/catalog helpers | `window.LegendAshmereAssetsV099.create()` |
| Ashmere shared view shell | `window.LegendAshmereViewV099.create()` |
| Ashmere feature adapter | `window.LegendAshmereFeaturesV099.create()` |
| Ashmere town | `window.LegendAshmereV099` |
| Ashmere NPC text catalog | `window.LegendAshmereNpcCatalogV099.create().get(region, id)` |
| Greyfen evidence story | `window.LegendAshmereGreyfenEvidenceStoryV099.apply()` |
| First secured-return dialogue | `window.LegendAshmereFirstRoadReturnDialogueV099.apply()` |
| Ashmere NPC story progression | `window.LegendAshmereNpcStoryV099.create()` with compatibility `.apply()` |
| Ashmere NPC dialogue | `window.LegendAshmereNpcDialogueV099.render()` |
| Ashmere commerce facade | `window.LegendAshmereCommerceV099.render(context, view, argument)` |
| Ashmere Work Board catalog | `window.LegendAshmereJobCatalogV099.forRegion(regionId)` |
| Ashmere market | `window.LegendAshmereMarketV099.render(context, tab)` |
| Ashmere crafting | `window.LegendAshmereCraftingV099.render(context, feedback)` |
| Ashmere forge | `window.LegendAshmereForgeV099.render(context, tab)`
| Greyfen Dry Crossing | `window.LegendAshmereCrossingV099.render()` |
| Region travel | `window.LegendRegionsV100` |
| Region unlock/travel rules | `window.LegendRegionServiceV100.create()` |
| Road POI catalog | `window.LegendRoadPoiCatalogV100.create()` |
| Road decision service | `window.LegendRoadDecisionsV100.create()` |
| Road POI outcomes | `window.LegendRoadPoiOutcomesV100.create()` |
| Old Road discovery view | `window.LegendRoadDiscoveryViewV100.create()` |
| Old Road result view | `window.LegendRoadResultsViewV100.create()` |
| Expedition/road path | `window.LegendRoadControllerV100` |
| v100 combat view | `window.LegendRoadCombatViewV100.create()` |
| v100 road audio | `window.LegendRoadAudioV100` |
| Account/profile | `window.LegendAccountV09x` |
| Account/profile view | `window.LegendAccountProfileViewV09x.create()` |
| Account/profile store | `window.LegendAccountProfileStoreV09x.create()` |
| Scene transition click delegation | `window.__legendSceneTransitionsV120` and document-level handlers |

These APIs are not necessarily ideal long-term boundaries; they are current compatibility points. Inspect the complete call graph before changing them.

## Persistence contracts — do not casually rename

The current field-level contract is maintained in `docs/SAVE_DATA_CONTRACT.md`. Legacy-save import and the v087 controller are intentionally retired from the active path.

- Active player save key: `legend-roads-of-ashmere-v09` (`LEGEND_DATA.SAVE_KEY`).
- Player persistence reads only `LEGEND_DATA.SAVE_KEY`; legacy recovered-build save keys are no longer imported.
- Settings key: `legend-settings-v1`, owned by `js/storage/settings-storage-v120.js` and exposed to game screens via `LegendStorage`.
- Road audio preference key: `legend-road-sound`, owned by `js/systems/road/road-audio-v100.js`.
- Title-gate session key: `legend-roads-of-ashmere-title-gate-v09x`, used by the older optional title-gate flow.
- Runtime return key: `legend-awakening-return-to-town-v1`, owned by the runtime bridge.
- The player record is JSON in local storage and is normalized in place by `LegendStorage`. Fields, nested flags, inventory IDs, region IDs, and old creation-version fields are consumed by multiple systems.

The settings, records, workboard, commerce, people, inn, contracts/crossing, v100 combat, road-audio extractions, and removal of unused town helpers do not change player-save schema, normalization, active/historical player keys, or settings persistence. The existing `legend-road-sound` preference remains intact and is now owned by the road audio service. The Ashmere controller remains the public router. `renderSheet()` and `renderArchive()` delegate to the records module; `renderWorkBoard()` delegates to the workboard module; `renderTrader()`, `renderCrafting()`, and `renderSmith()` delegate to the commerce module; `renderPeople()` and `renderNPC()` delegate to the people module; `renderInn()` delegates to the inn module; `renderSideContracts()` and `renderDryCrossing()` delegate to the contracts module. These modules receive their required helpers through explicit context values.

## Focused regression contracts

The focused contract specs complement the larger journey tests:

- `tests/progression-contract.spec.js` locks down XP thresholds, level-up HP changes, multiple level-ups, and invalid award inputs.
- `tests/road-state-contract.spec.js` locks down the `roadExpeditionV100` state shape, stage/pressure normalization, additive bonuses, inventory changes, equipment lookups, and display fallbacks.
- `tests/road-audio-contract.spec.js` locks down the existing sound preference, toggle semantics, battle asset paths/volumes, and music reuse behavior.
- `tests/road-combat-contract.spec.js` locks down potion healing/capping, guard reduction against a heavy wind-up, victory drops/XP, counters, and expedition stage/pressure updates.
- `.github/workflows/playwright.yml` should syntax-check every extracted road module and focused contract spec in addition to running `npm run test:e2e`.

These are compatibility contracts, not a replacement for journey-level tests. When behavior changes intentionally, update the contract and the relevant player journey assertions together.

## Practical extraction strategy

1. Maintain existing public `window.Legend...` facades until all call sites have migrated.
2. Split the Ashmere controller into narrowly scoped town modules first, because it has the broadest mix of unrelated UI/domain responsibilities. Start with the lowest-coupling screen group, not a large rewrite of the whole controller.
3. Inventory v087/v100 road calls and saved flags before consolidating the road system. Treat reward/XP/combat differences as gameplay behavior, not just duplicate code.
4. Keep `LegendStorage` as the only persistence owner; bridge code should request load/save through its API rather than invent another save path.
5. Introduce a small shared navigation contract after the screen paths are mapped. Avoid a second competing router or another document-wide event interceptor.
6. Run focused contract specs and the full Playwright suite, then manually smoke-test every touched journey. Keep live-deployment validation separate from PR-local results.

## Rules

- One cohesive responsibility per PR, no unrelated gameplay/content changes.
- Preserve script load order until changed deliberately with verified dependencies.
- No storage-key renames, save resets, or migrations as a side effect of refactoring.
- Prefer simple browser-native modules and explicit data flow; do not add a framework just to reorganize code.
