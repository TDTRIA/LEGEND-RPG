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


## Parity update — current production main (v0.30.5)

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

- The RealmScene builds four responsive Phaser landmark containers (Inn, Market, Forge, Old Road Gate) with committed raster service icons, animated beacon/ring/label and hover feedback.
- On WebGL renderers, native Phaser PointLight game objects add small, pulsing local light pools at the service markers. On Canvas renderers, the existing Phaser halo graphics remain as the visual fallback; the game continues using Phaser.AUTO and does not force WebGL.
- Screen-space pointer hit testing makes the landmarks usable without putting a full-screen canvas above the HTML controls. Clicks over buttons, form fields, panels and shell controls are ignored by the scene bridge.
- Selecting a landmark delegates to the existing `LegendWorldShellPanelsV170.selectAshmerePoi` state and refreshes the existing contextual panel. The user's existing `Enter` action continues through `LegendAshmereV099` and its production route/controller.
- Landmark objects are created only on the Ashmere hub, repositioned for viewport changes, and destroyed when leaving for a service or a different region. Reduced Motion disables their idle glow animations.
- No new economy, quest, progression, dialogue, inventory or persistence logic is introduced in Phaser.

## Native Phaser title controls — 2026-11-03

The production title menu now uses `RealmScene` for its panel and button artwork rather than painting separate floating HTML cards over the world:

- Phaser draws the menu panel frame, button backgrounds, icon marks, accessible labels, subtitles, arrows and focus frames in the same scene as the title artwork.
- The existing HTML buttons remain in their original layout as transparent, focusable hit targets. Phaser reads their responsive bounds and labels; their existing `LegendTitleScreenV120` callbacks still perform Begin/Continue, Profile, Settings, News and Credits.
- The scene remeasures after the title entrance animation and on viewport resize. Reduced-motion styling does not require a separate UI path.
- This is a presentation migration, not a second router: traveler creation, progression, combat, rewards, services, accounts and persistence continue to belong to their production modules. The production save key and player schema are unchanged.

**Next surface order:** traveler creation and story dialogue; the persistent HUD and contextual journal/map/action shell; expedition interactions and results; then combat presentation and command controls. Each surface must retain its existing accessible input bridge and pass the same production journey/save regression tests before the next is moved.

## Native Phaser opening annals — 2026-11-03

The mandatory three-chapter prologue is being presented inside the persistent Phaser scene rather than as a separate HTML page:

- Phaser paints the historical chapter heading, body copy, pull quote, chapter rail, header/footer rules, reading progress, and Continue control, aligned to the existing responsive semantic layout.
- The original text remains in the document for accessibility and the original `LegendOpeningPrologueV220` controller still advances the chapters and starts the real traveler-creation flow.
- Resize and scroll changes remeasure the live layout. Focus on the chapter control is reflected in the Phaser frame.
- No story text, chapter order, save data, character-creation rules or progression behavior is changed.

**Next surface order:** Oric's scene dialogue/response controls; after that, the persistent HUD/contextual journal/map/action shell, expedition interactions/results, and combat controls/presentation. Traveler-creation visuals are now their own in-progress slice.

## Native Phaser traveler creation — 2026-11-03

The soul-shaping creation screens are being presented in the persistent Phaser scene while the production creation controller remains authoritative:

- Phaser draws the presence/guide frame, dialogue panel, card panels, stepper/progress bar, choice cards, selection checks, review/benefit tiles, and navigation button artwork.
- Existing local raster art is captured into Phaser textures: the four distinct Woman/Man/Nonbinary/Keep It Unspoken emblems, class portraits, personality/origin/keepsake choice art, the current wordmark and Veil presence mark.
- The real name input remains a visible editable HTML field. Choice/navigation buttons remain focusable accessible hit targets with explicit names; the existing selection, validation, step order, and callbacks are unchanged.
- Desktop/mobile resize and scroll remeasure the native scene layout. Focus and selected choice states are reflected in Phaser. Reduced Motion suppresses decorative pulses.
- The Oric arrival briefing is intentionally not part of this slice; it remains visible through the existing view until its separate dialogue migration.
- No player attributes, identity rules, starting benefits, class balance, saves, or persistence behavior are changed.

**Next surface order:** Oric's arrival dialogue and response controls; then the persistent HUD/contextual journal/map/action shell; expedition interactions/results; and combat presentation/command controls. Each remains a separate production-parity slice.

## Native Phaser Oric opening scenes — 2026-11-03

The Old Road prologue, Oric's first exchange, response choice, ambush beat and aftermath now use the persistent `RealmScene` for their visible panels and text:

- Phaser draws the story cards, chapter labels, headings, narration, scene-note panels, quotations, response cards and primary/secondary action buttons.
- The background continues to come from the shared road environment, so the story UI and road artwork occupy one scene.
- Existing buttons remain semantic, labelled hit targets; `LegendRoadOpeningV140` still owns response memory, phase transitions, tutorial encounter start and the return-to-road hand-off.
- Layout is measured after entrance motion and on scroll/resize; focus treatment follows keyboard and pointer focus.
- When the real battle interface takes over, the opening UI objects are cleared; the post-fight Oric scene restores them. Combat rules and tutorial progression remain unchanged.

**Next surfaces:** the persistent HUD and contextual world shell (journal, map, action rail and town navigation), followed by town-service consoles, expedition scenes/results, and combat presentation.

## Shared native Phaser gameplay surfaces — 2026-11-03

The persistent `RealmScene` now has a common renderer for the remaining production gameplay surfaces:

- It mirrors visible panel surfaces, borders, text, local raster imagery, generated runway icon textures, and focus frames from the active production screen into Phaser.
- The targets include the world-shell HUD and drawers, Ashmere/Greyfen services, Old Road/expedition screens and reports, combat, Bell Cellar, shell overlays/modals, and the separately body-mounted level-up allocation overlay.
- The original DOM controls remain the accessible and functional input bridge. Existing `LegendWorldShellV170`, service, expedition, combat and dungeon controllers remain the only owners of real actions and game state.
- Real input/select/textarea fields are intentionally left interactive in the document; their field styling is preserved while their surrounding interface is painted natively.
- The renderer follows dynamic DOM state, responsive viewport changes, scroll containers and shell drawer changes; it clears its Phaser objects and temporary textures when leaving gameplay surfaces.

This common pass is a migration foundation, not proof that every screen is complete. Each surface still needs a production journey regression covering its buttons, inputs, scene transition, desktop/mobile layout and accessible names before the migration is considered finished.

**Remaining polish order after the shared painter:** validate and refine every town/service, Old Road/camp/results, combat/level-up and Bell Cellar/Greyfen screen individually; then handle the specific camp text and results-label issues found in external playtesting. Gameplay-depth changes remain deliberately deferred until the Phaser pass is stable.

## Native Phaser service interiors — 2026-11-03

The Ashmere service backdrops now receive scene-native set dressing while their existing accessible service consoles remain interactive HTML:

- The Inn adds suspended lanterns, animated flame cores and a subtle hearth glow.
- The Market adds low-opacity canopy cloth, pennants and a warm hanging lantern.
- The Blacksmith adds a contained forge glow, anvil silhouette and rising sparks.
- The Archive adds paired rune accents; the same service mapping resolves the Greyfen Inn, Market, Forge and Archive variants.
- The Phaser environment is selected from the town view's explicit `data-ash-service` key (`inn`, `trader`, `smith`, `craft`, `archive`) instead of depending primarily on visible text matching.
- Scene objects use normalized viewport anchors, respect Reduced Motion, and have their tweens and objects cleared when the player changes environment. Service actions, item prices, equipment, crafting and save state remain in their current production controllers.

## Verification notes

- The Phaser scene's custom glow collection is named independently from Phaser's built-in `lights` scene plugin.
- Playwright disables decorative CSS motion only in its test context so the Oric ACT click is tested as an interaction, not as an animation-stability race.
- The full suite should be read as two layers: existing production regression tests and reboot-specific title/annals/creation/opening/town/mobile checks. A pre-existing Reed Cut smoke-test failure was observed on main before these reboot changes; it is tracked separately and is not counted as a reboot pass.
