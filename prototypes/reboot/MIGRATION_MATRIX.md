# LEGEND: The Awakening — Phaser Production Migration Inventory

The root GitHub Pages game is now the official Phaser-powered production entry point. The optional `/prototypes/reboot/` route is a preview/test bench only; both paths load the same engine source at `js/engine/phaser-world-v1.js`.

## Porting strategy

Phaser is the persistent production world renderer and presentation engine. It runs below the existing accessible screen controls and uses the same production content catalogs, creation controller, opening sequence, town controller, road expedition controller, combat engine, progression, reward settlement, regional travel, and dungeon/region modules. The production root delegates all traveler reads and writes to the pre-existing `LegendStorage` / `LegendRuntimeV120` services, including the production save key and account/cloud stack. Only the preview path installs the isolated `legend-reboot-prototype-save-v1` adapter.

This promotion is not a save migration: the production key and stored player schema are preserved in place. The HTML screens remain accessible interaction overlays while Phaser owns the persistent environment layer, camera, atmosphere, transitions and action feedback. The next conversion work can move specific screen visuals and interactions into native Phaser scene objects without creating another engine or gameplay/save implementation.

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
| Ashmere hub and services | LegendAshmereV099, LegendAshmereHubV099, LegendAshmereFeaturesV099, destination/navigation/view/asset modules; canonical Phaser RealmScene | Native Phaser scene landmarks for Inn, Market, Forge and Old Road Gate select the matching existing town POI; the current production service controllers still own entry, dialogue, purchases, crafting, jobs, quests and saves |
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


## Parity update — current production main (v0.30.4)

The prototype now also reuses the current production title and persistent world-shell presentation rather than the earlier simplified title/menu wrapper.

| Area | Current production module reused | Prototype boundary |
|---|---|---|
| Title menu and realm overview | `LegendTitleScreenV120`, `LegendTitleScreenViewV120`, current title CSS and local Runway art | Current build version, traveler summary, Ashmere/Old Road/Bell Cellar destination art and the live realm-dispatch panel |
| News and roadmap | `LegendTitleDispatchesV140` and its production stylesheet | The same shipped-update notes and forward roadmap shown by main |
| Credits | `LegendTitleExtrasV120` | Current credits dialog; no account or network behavior |
| Accessibility settings | `LegendSettingsScreenV090`, `LegendSettingsStorageV120` | Current large text, bold text, high contrast, reduced motion, spacious layout and readable font controls |
| Persistent in-world shell | `LegendWorldShellPanelsV170`, `LegendWorldShellModalsV170`, `LegendWorldShellV170` | Current HUD, contextual journal/map/actions, mobile side panels, inventory/settings/combat modal and navigation delegates over production gameplay screens |

The title's Profile control is intentionally hidden in the prototype because it would invoke account/profile flows that are not part of this isolated local-save build. The original Supabase/account scripts, production `storage.js`, production runtime, and production boot-sequence are still deliberately not loaded: those modules bind to the production save key or account services. The prototype's adapter exposes the current settings interface while keeping traveler writes on `legend-reboot-prototype-save-v1`.

The prototype stylesheet list is synchronized with the current production `index.html` visual stack, excluding the account-only styles. This includes the latest title renewal, dispatch, accessibility, world-shell, scene-visibility and v0.30.4 gender-art styles.

## Phaser engine transition and persistent world presentation — 2026-11-03

The prototype now introduces Phaser as a persistent presentation engine rather than only a background canvas:

- First visit per tab session opens with a native Phaser scene sequence: a sealed world image, animated runic portal, camera/scene assembly, renderer/system-link messaging, and an expanding realm reveal before the production title is shown.
- The startup reveal is skip-accessible, responds to browser and in-game Reduced Motion, and runs on the actual Phaser scene rather than a simulated HTML loading card.
- The same RealmScene persists below the real production gameplay surfaces and the world shell. Root-screen classification drives a consistent Phaser transition accent for title, news, settings, annals, traveler creation, Oric's awakening, combat, expeditions, results, town services, field sites, dungeons and modal states.
- The engine transition does not change gameplay ownership: production HTML screens, controllers, save adapters, combat calculations, quest state and reward settlement remain the source of truth.

## Phaser presentation polish — 2026-11-03

The world layer uses the following scene-only effects; production gameplay modules and save data remain untouched:

- Environment-aware ambience: low-opacity drifting haze, motes and light pools, plus marsh rain/fireflies, forge/camp embers, and archive rune glows.
- Responsive background framing with overscan, subtle pointer parallax and a slow camera-breathing effect to add depth to the existing location art.
- Crossfaded environment changes with a restrained camera settle rather than a hard black fade.
- Distinct hit, heavy strike, guard, magic, swing and victory feedback using Phaser camera shake/flash, expanding rings, slash shapes and short-lived motes.
- Both the in-game Reduced Motion setting and the browser/OS preference suppress ambient motion, parallax, camera shake and screen flashes; scene changes stop the previous ambience tweens before replacing them.
- Portrait layouts use a smaller image overscan so the existing location art is not cropped more than necessary.

The atmospheric layer is decorative only: it does not affect collision, combat calculations, turn order, rewards, quests, expeditions, or persistence.

## Native Phaser scene interaction slice — 2026-11-03

Ashmere is the first town surface with native Phaser scene interactables:

- The RealmScene builds four responsive Phaser landmark containers (Inn, Market, Forge, Old Road Gate) with animated glow, beacon, ring, label and hover feedback.
- Screen-space pointer hit testing makes the landmarks usable without putting a full-screen canvas above the HTML controls. Clicks over buttons, form fields, panels and shell controls are ignored by the scene bridge.
- Selecting a landmark delegates to the existing `LegendWorldShellPanelsV170.selectAshmerePoi` state and refreshes the existing contextual panel. The user's existing `Enter` action continues through `LegendAshmereV099` and its production route/controller.
- Landmark objects are created only on the Ashmere hub, repositioned for viewport changes, and destroyed when leaving for a service or a different region. Reduced Motion disables their idle glow animations.
- No new economy, quest, progression, dialogue, inventory or persistence logic is introduced in Phaser.

## Verification notes

- The Phaser scene's custom glow collection is named independently from Phaser's built-in `lights` scene plugin.
- Playwright disables decorative CSS motion only in its test context so the Oric ACT click is tested as an interaction, not as an animation-stability race.
- The full suite should be read as two layers: existing production regression tests and reboot-specific title/annals/creation/opening/town/mobile checks. A pre-existing Reed Cut smoke-test failure was observed on main before these reboot changes; it is tracked separately and is not counted as a reboot pass.
