# LEGEND: The Awakening — Phaser Reboot Migration Inventory

Updated for the reboot/current-game-migration branch. The original browser game on main remains the source of truth.

## Porting strategy

The Phaser prototype is a separate presentation/runtime shell over the current game's versioned JavaScript systems. It loads the original content catalogs, creation controller, opening sequence, town controller, road expedition controller, combat engine, progression, reward settlement, regional travel, and dungeon/region modules. Its LegendStorage and LegendRuntimeV120 adapters use only legend-reboot-prototype-save-v1 in browser local storage.

This is intentionally not a production-save migration. No production save key, Supabase client, sign-in flow, account slot, or cloud account is read or written. Existing HTML-based production screens are retained as accessible overlays on top of Phaser's canvas while Phaser handles the world layer, transitions, atmosphere, and camera feedback.

## Current-game content and systems mapped into the prototype

| Area | Source of truth reused | Prototype integration |
|---|---|---|
| World title and atmosphere | assets/generated/title/title-ashmere-road.webp, LegendAssetsV090 | Phaser title background with slow atmospheric movement and a responsive title panel |
| Mandatory history annals | LegendOpeningPrologueV220, css/opening-lore-v220.css | The three current chapters run before traveler creation; no skip control is added |
| Soul-shaping traveler creation | LegendBeginningV094, LegendPlayerCreationOptionsV094, LegendPlayerCreationStepsV094, LegendPlayerCreationViewV094, LegendPlayerRecordV094 | Current name, identity/pronouns, personality, origin, six classes, keepsake, review, and starting benefits |
| Opening and Oric | LegendRoadOpeningV140 | Current dead-lantern awakening, Oric's boots/remains explanation, response choices, wolf ambush, and follow-up |
| Opening combat | LegendRoadControllerV100.startOpeningEncounter, LegendRoadCombatV100, LegendRoadCombatViewV100 | Actual ACT command and current production combat/reward callback; Phaser camera feedback accompanies actions |
| Old Road route and exploration | LegendRoadsV100.oldRoad, LegendRoadStateV100, LegendRoadActionsV100, LegendRoadDecisionsV100, LegendRoadPoiCatalogV100, LegendRoadPoiOutcomesV100, LegendRoadDiscoveryV100, LegendRoadExpeditionScreenV100 | Current South Fork, High Ridge/Reed Cut, point-of-interest/evidence outcomes, searches, travel, road pressure, forced encounters, camps, field journal/map, and return |
| Enemy variety and combat rules | LegendRoadsV100.oldRoad.enemies, LegendRoadCombatV100, LegendRoadCombatViewV100 | Original enemies, intent patterns, FIGHT/ACT/ITEM/GUARD/Heavy Strike/retreat, damage, armor, status, drops, and enemy turns |
| Progression and expedition results | LegendProgressionV100, LegendLevelUpV152, LegendRoadResultsV100, LegendRoadResultsViewV100, combat-results view | Current XP thresholds, level growth/stat points, gold/XP/rare Road Token settlement, saved route report, victory/defeat/return |
| Ashmere hub and services | LegendAshmereV099, LegendAshmereHubV099, LegendAshmereFeaturesV099, destination/navigation/view/asset modules | Current town and service screens, people, inn, trading post, forge, crafting, work board, journal, traveler sheet, routes, and contracts |
| Town characters and story callbacks | LegendAshmereNpcCatalogV099, NPC dialogue/story modules, evidence and first-return dialogue modules | Mara Vell, Old Brenn, Captain Oric, Sella and the current dialog/evidence branches |
| Daily and local work | LegendAshmereContractsV099, LegendAshmereWorkV099, job catalog and destination catalog | Current Daily Field Board / contracts and the existing timed, sequence, clue and worksite activities |
| Regional network | LegendRegionsV100, LegendRegionServiceV100, LEGEND_DATA.regions | Token-gated Greyfen unlock, travel costs and region requirements |
| Greyfen | LegendGreyfenMarshContentV160, LegendGreyfenMarshV160 | Current route data, raised posts/reed-bed choices, supplies, pressure, encounters, waystation, field gauge, optional detours and report |
| Silted Storehouse | LegendGreyfenStorehouseV170 | Current optional multi-room delve, approach choice, dispatch, salvage, combat, reward and return |
| Bell Cellar | LegendBellVaultV100 | Current Ashmere dungeon flow, choices, combat, retreat and reward |
| Artwork and audio | LegendAssetsV090 and committed local assets | Existing Runway/raster environment, class, enemy, NPC, item and service assets; road combat/town audio remains sourced from the current game |

## Intentionally not imported or not represented as complete

- **Production accounts and cloud saves:** intentionally excluded. The prototype uses a separate browser-local save and does not connect to Supabase or production account services.
- **Production save conversion:** not performed. Existing production saves are not read, copied, normalized, or overwritten.
- **Ironpass, Blackwood and the Ruined March:** the current data marks these as locked, unavailable or in development. They remain unavailable; this port does not fabricate playable regions.
- **Title extras and account-oriented menu surfaces:** the first migration focuses on the playable game loop. The original title dispatch/news panel, profile/account management, credits and settings menu have not yet been integrated into the Phaser title shell.
- **Tutorial-only prototype rune exercise:** removed. The prior rune-pattern mini-game was prototype-only and had no matching live progression mechanic in the current source.
- **Long-session and cross-browser verification:** awaits the branch's Playwright workflow and manual review. A passing syntax check alone is not a visual acceptance test.

## Carry-over rule

When a source system is implemented in the original game, this prototype should call the existing module or use its authored data. It should not create a second reward table, combat formula, quest truth, save schema, or contradictory dialogue. When the original game does not implement a region or feature, the prototype should say so rather than inventing it.
