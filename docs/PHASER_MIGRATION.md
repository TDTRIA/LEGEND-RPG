# LEGEND — Phaser production migration

Updated: 2026-11-12

## Objective

Move the entire production game presentation into Phaser 4.1 while retaining the real production systems. This is not a separate prototype and not a rewrite of combat, quests, rewards, player storage, account/cloud saves or progression logic.

The existing modules remain the source of truth. Phaser owns scene presentation, camera, transitions, visual state, controls and UI rendering as each surface is migrated. Existing controller functions are invoked from Phaser-backed controls until a deliberate later refactor changes those APIs.

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:8d071adc3051316b4265ff9f0610f38f58eae2d63fb1056b0a3987a6c3ba2b1d -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:5f771f8dc5008c60cbed7558ed9d8e70eaa68b749f050f737794c53303ed8d13 -->

## Title stability checkpoint — 2026-11-12 (local)

The title asset loader accepts cache query strings and rasterizes existing SVG UI assets at explicit dimensions before WebGL upload. This restores the required raster wordmark and fixes distorted button frames. Native primary buttons no longer have their labels covered by an opaque gold DOM background. Focus/hover and disabled textures follow semantic controls; title geometry refreshes on resize and scrolling, and decorative labels remain complete. DOM controls and missing-art fallback remain intact. Save keys, callbacks, gameplay and story are unchanged.

Local desktop/mobile screenshots were inspected in shared Preview. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:d9e1cbba03a96621042d51b195884cf7723946b9c49cca5c9cfbf09fb1121f50 -->

The scroll/resize/missing-art fallback regression and final desktop/mobile returning-title tests pass. All seven restored expedition checks passed across focused runs after repairing stale setup and painter expectations; eleven storage checks also passed. Title fixes are committed in `5fb68759`; expedition test repairs are in `6651f922`. The assigned feature branch is pushed; no PR, merge or production publishing is claimed. Long-name/zoom title acceptance remains open.

A dedicated Ashmere/Greyfen Route Board painter is now in local verification. It paints existing headings, card surfaces, descriptions, focus states and Back control, retaining original artwork and semantic callbacks. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:728b2f010ae20f560eddebcd88b4648354e69ec3fd79f5a25bd380ab017e8490 -->

Desktop and mobile keyboard/touch navigation, saved-state preservation and fallback checks pass. A confirmed mobile return-button obstruction in the regional ledger is repaired with scoped clearance above the fixed action dock. Ashmere desktop/mobile and Greyfen mobile screenshots were inspected. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:304b77dd4007953856cc7d0660911e9476794e8cf08a909f1ba5f92ae76c2c6c -->

All-destination and long-content Route Board acceptance remains open. The Road Network regional ledger now has guarded Phaser panels, wallet values, region names/descriptions/statuses, feedback notes and real unlock/travel/return controls. Its existing DOM artwork and semantic controls are retained. Desktop/mobile keyboard and touch checks verify exact Greyfen costs, failed transactions, unavailable Ironpass, unknown save properties, fallback restoration and return navigation. Content is clipped to the production scroll viewport, with space reserved for the HUD and bottom actions. No economy, progression, region availability or save rules changed.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

Publishing is blocked in this task by Manual permissions and the assigned-branch push restriction. No PR, merge, or GitHub deployment is claimed.

## Current state

<!-- /coderabbit-ai-generated:v1 -->

**Status: In progress**

- **Native in RealmScene:** persistent world environments and atmosphere; stage- and route-specific Old Road environment artwork; Ashmere landmarks; new-player title/menu; mandatory annals; traveler creation; Oric opening-road prologue/response/ambush presentation; persistent HUD; bottom action navigation; traveler journal/quest drawer; contextual action/POI drawer. These surfaces use Phaser presentation while preserving their existing semantic controls and production callbacks. The Old Road scene art is selected from the live expedition stage/route; its original DOM image stays visible whenever the loaded Phaser texture does not match.
- **DOM safety fallback:** the original semantic returning-player title remains visible during its finite entrance animation and while Phaser initializes; it also remains visible whenever Phaser is unavailable, a required asset/action/label is missing, or native painting fails. After the entrance pose settles and all required assets, production actions and live Phaser labels pass preflight, Phaser becomes the normal visual presentation while the DOM buttons remain the real accessible action targets.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:15ddcc4ff3168ecfdce335318d54392f06cfd7b0f504fd6c2c803cd390f752ed -->

- **Old Road recovery fallback (current):** expedition header/clock/tracker, route and decision cards, optional detours and camp actions have guarded native painters enabled in current main (`27c7afb5`); their semantic DOM remains the fallback. Full per-surface visual acceptance must still be established.

<!-- /coderabbit-ai-generated:v1 --> The connected map and field-journal modal now use a guarded Phaser painter for their framed surfaces and text while the semantic DOM buttons remain the real keyboard/touch actions. If the native mask, visible content or preflight fails, the complete styled DOM modal stays visible. The Phaser world scene remains active behind the expedition UI, including stage-/route-specific background art; the original scene image is hidden only after a matching Phaser texture passes preflight. All existing expedition handlers, route state, travel pressure, encounters, rewards, journals and save data remain authoritative. Re-enable each panel/map painter only after desktop/mobile visual parity, readable labels, keyboard focus, and end-to-end route/detour/camp/map/journal tests pass.
- **Under active verification:** a dedicated RealmScene combat painter now draws the tactical panels, intent/status text, dialogue/log, turn heading and eight command surfaces. The existing DOM combat buttons remain the real actions; actor/enemy artwork and combat results remain in their production views. The painter keeps the DOM presentation visible whenever its preflight or draw step fails.
- **Under active verification:** Ashmere's existing destination-card terminal board now has a dedicated RealmScene painter for its frame, headings, card surfaces, live labels and focus/hover states. Its preflight compares rendered IDs against the live destination catalog, including progression-gated destinations. Scroll/hover/focus updates are coalesced to one Phaser repaint per animation frame, and any incomplete content or draw exception restores the styled DOM board. The original destination buttons and service icons stay in the DOM; service interiors, transaction/job/crafting logic and Greyfen destination screens remain in their original feature modules.
- **Safety note:** the previous shared DOM-to-Phaser gameplay mirror is disabled. It made DOM text transparent and recreated CSS panels incompletely, which caused missing copy and weak/blurred panel presentation. Do not turn it back on globally.

- **Combat acceptance gate:** prove that all eight existing actions remain keyboard/touch usable, the current enemy intent and live dialogue/log repaint after every turn, save/reward settlement is unchanged, and the same painter remains readable at desktop and 390px mobile. Do not check combat off until the live expedition fight, potion use, guard/intent change, retreat or victory/defeat handoff, and results transition pass Playwright.

## Migration order

1. **Title and first-session shell**
   - [x] New-player title/menu and world backdrop in Phaser.
   - [x] Annals, traveler creation and Oric opening-road presentation in Phaser.
   - [x] Keep the original returning-player menu as a safe DOM fallback when Phaser preflight fails.
   - [ ] Complete and verify Phaser Continue text, focus, hover, selected/disabled states and responsive geometry through the desktop/mobile Playwright run; retain the DOM fallback permanently for any failed preflight.

2. **Persistent shell**
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:f5ea5160fd33be867fd1c57e387d7cf333e0b486adf7a45938e77146d706b16e -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:5630dd4f4f9d0a9c1c346e71c9b31b055cb6960a679b5f6b89bf8df8c0781184 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:52854dcb9a5dda04c2b335b4fdccf0a44a0e8c282bd65fb6379e170c018b6302 -->

   - [ ] HUD and traveler vitals parity: corrected glyph cropping and compact LEGEND branding; compact location names now occupy a full row, with the next lead retained in landscape. Drawers and notifications follow measured HUD height, including text-size changes; town/service content stays beneath the HUD and open drawers. Local desktop/mobile readability, orientation, keyboard/touch, full-save and missing-renderer DOM fallback checks pass, with desktop1440×900, portrait390×844 and landscape844×390 screenshots inspected. Combat/results and wider accessibility-state visual gates remain open.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:2d76f567eac93ab7c56ba02b1dde4c1e82eb4592d45354c354530229fe360092 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:e140c226240d81cbe74d6ac878422bf41f6ff72976f674410363bb0f4e75634c -->

   - [ ] Journal/quest drawer parity: corrected wrapped descriptions, masked numeric glyphs and duplicate token badge. Desktop/mobile checks cover visible counts, scrolling, keyboard journal action, real town return and per-label DOM fallback. Existing first-session/Old Road and mobile open/close regressions now pass; full accessibility-state coverage remains open.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:d964605221ddf91c45271262d8905b3139cb7a265a79f866b698aeecfb6fda7c -->

   - [ ] Shell Map destinations: town Route Board / Road Network and connected expedition map. The current shell routes to these existing screens; no separate shell map drawer exists in `world-shell-v170.js`. Verify and migrate the actual town route board and regional network without adding a second navigation flow.

<!-- /coderabbit-ai-generated:v1 -->
   - [x] Contextual action/POI drawer.
   - [x] Old Road map / field-journal modal (guarded Phaser painter enabled; styled DOM modal remains the fallback when preflight fails; desktop/mobile parity verification remains open).
   - [x] Bottom navigation.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:260e3dbc1ae2ed91f2f065710e386e7c109c4551731b19f2eea962cd3641dbce -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:ac87a2e33dc18f34866e1bae0b834b9f9055f55edabac247ac012cc786c6c24c -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:0a5c959b30b5c2c1f9ae13b61044b00c93dc542b52ce67698ac157f693ed00ab -->

   - [x] Traveler sheet and shell notifications: dedicated Phaser painters implemented; focused desktop/mobile tests passed locally for all record fields, keyboard/touch Back actions, empty packs, exact save preservation, late shell creation, notification expiry and malformed-source fallback. Desktop/portrait/landscape screenshots inspected; publication remains pending task permissions. The sheet uses production identity, progression, vitals, equipment, town progress and pack fields with the original regional Back control. Portraits/item art and semantic text remain in the DOM. Both artwork and native paint are clipped clear of the fixed shell. Notifications use Phaser Graphics/Text in the existing live notification layer so DOM fallback screens cannot cover the message; production copy and dismissal timing remain authoritative.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:e38be163529d950d69f37c6a0d631f897580e271352bd9fffd2fc4b95ad30546 -->

   - [x] Inventory overlay: dedicated guarded painter for frame, item quantities, equipment, empty/unavailable states and focus. Original DOM owns keyboard trap, touch, inner scrolling, close and traveler-sheet routing; item artwork remains DOM-backed. Focused desktop/mobile regressions passed locally, including exact save preservation and malformed-layout fallback. Desktop1440×900, portrait390×844 and landscape844×390 screenshots inspected. The character sheet remains the production town screen, not a separate modal. Publishing remains pending task permissions.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
   - [x] Mobile journal/context side-panel states and scrolling.
   - [x] DOM fallback map/journal scrolling stays within mobile width; native Phaser modal is enabled with guarded fallback; full visual parity verification remains open.
   - [ ] Remaining shell map drawer/modal scrolling.

3. **Ashmere and services**
   - [ ] Verify the Phaser-painted Ashmere destination-card board on desktop/mobile, including focus/hover, dynamic unlocked destinations and DOM fallback.
   - [ ] Ashmere/Greyfen service interiors, service markers and destination selection parity.
   - [ ] Redesign Ashmere hub service selection so visible buttons are anchored to town locations or a clear terminal board; do not simply float Phaser labels over the current town background.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:b6c544f908fbd32caee2cdca6dcece6dd8bdc33ca033c1ba38777be0aaf68af3 -->

   - [x] Inn presentation verified locally for Ashmere and Greyfen: dedicated guarded Phaser artwork, panels, complete copy, health meter, prices, focus and feedback. Original semantic buttons retain rest, supplies, rumors and return callbacks. The production inn now refreshes its purse/health after purchases without replacing focused controls. Desktop1440×900 and mobile390×844 tests passed for exact 35g rest/90g supply costs, full-save equality (including unknown properties), insufficient funds, regional rumors/return, artwork failure and malformed-source fallback. Shared Chromium screenshots inspected, including mobile scrolling/feedback and both regional interiors; heading and Back stay clear of the fixed shell. Costs, rewards, storage ownership and canon are unchanged. Publication remains pending task permissions.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:7af5f819f0bf262f2bb6495d87a3bdfaecc8af76cef1c300010b097e511559af -->

   - [x] Market presentation verified locally for Trading Post and Marsh Market: guarded Phaser banner, wallet, Buy/Sell tabs, item copy/prices/quantities, disabled/empty states and focus. Production buy, sell-one and sell-all callbacks retain exact prices, per-item Bent Coin rounding and save semantics. The source controller restores focus after rendering; malformed source restores a functioning DOM purchase flow. Current desktop1440×900 and mobile390×844 tests passed; shared desktop/portrait screenshots inspected. Removed empty geometric market pennants and replaced the branded Greyfen runtime image with a crop of its approved artwork. Publication remains pending task permissions.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:e6192209dfb89ad7448cd24c592806f7098d0dc781ba14fffd2a028ca85466c8 -->

   - [x] Blacksmith and crafting presentation verified locally for Ashmere and Greyfen: guarded Phaser banner, current kit, category tabs, equipment comparisons, purchase/equip states, recipes, ingredient counts and feedback. Original buttons, gear art and recipe icons remain; production controllers still own exact prices, ownership/region/level rules, ingredient consumption and saves. Keyboard focus survives purchases, tab changes and crafts. Desktop1440×900 and mobile390×844 transaction tests cover full-save equality, below-purchase-level owned gear, regional equipment, rare ingredient use, fallback crafting and the 34g Greyfen parcel trade. Shared desktop/mobile screenshots inspected. Publication remains pending task permissions; this does not complete the wider crafting-effects/release gate.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:8a4d1bdb2718ce8fa04af302be1490b6260d8c9b4f516f38026e13fd56001afb -->

   - [x] Work Board and job presentation verified locally in Ashmere/Greyfen: guarded native regional banners, listings, field posting, prompts, timing marker, sequence reveal/actions, focus and results. Catalog preflight checks regional job/action completeness; original semantic controls, grading, pay, XP, bonus odds and save callbacks remain authoritative. Fixed abandoned timing/sequence jobs retaining handlers after leaving, and keyboard navigation accidentally submitting work. Focused desktop/mobile checks cover exact full-save outcomes, no duplicate/abandoned pay, stale sequence isolation, fallback, Greyfen reload and level-up allocation; shared desktop/portrait/landscape screenshots inspected. Results stay clear of the fixed dock. Publication remains pending task permissions.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:782d8109730a98bfd7a0e7eb4ecc5d788ad2d73bb990e48f5c6efef6c53f0329 -->

   - [x] Daily Field Board, Road Cache and road-contract presentation verified locally: guarded native copy, panels, progress, state, controls, odds disclosure and feedback; existing daily/side-contract handlers and semantic controls retained. Desktop1440×900 and mobile390×844 checks cover exact daily claims, duplicate protection, calendar rollover, all five cache outcomes, earned-key consumption, post-acceptance report/fallback, full-save compatibility, regional return/reload and level-up focus. Expanded odds survive transactions, feedback stays clear of the dock, and native controls override the older gold-button theme. Shared desktop/mobile visuals inspected. Publication remains pending task permissions.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:4693aab49b8b08edbbfe6da5909515d8cc2b7861fdac19d428e41f5d88b43065 -->

   - [x] Ashmere/Greyfen people directories and conversations verified locally: guarded native approved portraits, regional roles/descriptions, complete dialogue, focus frames and real character/ledger/return controls. Existing catalog/story/evidence services retain all visit effects and saves. Source entry now resets stale scroll and focuses the heading; portrait faces remain in frame, and keyboard actions scroll clear of the dock. Desktop1440×900/mobile390×844 checks cover all three characters, first-return/evidence reporting, exact full saves including unknown properties, ledger availability, repaint isolation, incomplete-art/text DOM fallback, reload and return. Shared desktop/portrait/landscape screenshots inspected. Publication and the broader production checkpoint remain pending; the wider release requirement to integrate daily contracts into the Work Board remains open.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
   - [ ] Preserve the existing purchase, craft, job, quest and save callbacks.

4. **Old Road and expedition**
   - [ ] Departure and route-choice controls, points of interest and discoveries.
   - [x] Stage- and route-specific expedition background art uses the active Phaser environment texture, with a source-matched DOM image fallback (focused desktop/mobile parity test passed in PR #124).
   - [x] Connected Old Road map and field-journal modal (guarded Phaser painter enabled; styled DOM fallback remains available when preflight fails; full desktop/mobile parity verification remains open).
   - [ ] Road journey HUD (currently DOM recovery fallback; Phaser painter requires desktop/mobile content parity).
   - [ ] Road decision deck (currently DOM recovery fallback; original route, discovery, detour and camp handlers remain authoritative).
   - [ ] Main road scene and expedition result presentation.
   - [ ] Keep route state, pressure, rewards, evidence and Road Token settlement in existing modules.

5. **Combat and progression**
   - [ ] Battle arena composition, actor/enemy presentation, intent and turn state.
   - [ ] FIGHT / ACT / ITEM / GUARD / retreat controls and battle log.
   - [ ] Victory/defeat/retreat results, XP/gold/loot and level-up/stat allocation.
   - [ ] Keep damage, AI, status, loot and progression formulas unchanged during UI migration.

6. **Dungeons and regions**
   - [ ] Bell Cellar room/choice/combat/reward screens.
   - [ ] Greyfen Marsh and Storehouse exploration, map, encounters and results.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:980d118a61fc5f479661006b12898545a94d1bbe2bccce5212331e0db66a716c -->

   - [x] Guarded region travel and locked-region presentation (local branch: regional ledger desktop/mobile interaction, costs, save preservation and visual checks pass; original artwork/semantic controls retained). Production publishing is still pending.

<!-- /coderabbit-ai-generated:v1 -->

7. **Remaining auxiliary screens**
   - [ ] Settings, accessibility and audio controls.
   - [ ] News/roadmap, credits and profile entry points.
   - [ ] Error, loading, confirmation, defeat and other overlays.

## Required implementation pattern per surface

1. Read the existing view/controller contract and identify its real DOM actions, live text, state changes, inputs, scrolling and images.
2. Create the matching Phaser scene renderer for that surface. Reuse committed raster assets and load them through the engine asset registry.
3. Bind Phaser visual controls to the existing production callbacks; retain accessible names, keyboard focus, touch targets and input semantics during the transition.
4. Keep the DOM copy visible until every visible Phaser label, value, description, panel, image and state has been verified. Never hide the source UI just because a canvas object exists.
5. Add a focused Playwright journey covering desktop (1440×900) and narrow mobile (390×844), visible copy, focus/keyboard, touch activation, state updates, no overflow, and preservation of the same production save values.
6. Inspect screenshots when browser execution is available. A DOM assertion or a passing syntax check alone is not visual acceptance.
7. Remove the old DOM presentation only after the Phaser surface passes all gates. Keep a small rollback path until the next migration slice is stable.

## Global acceptance gate

The migration is complete only when:

- Every screen listed above is rendered and visually composed by Phaser; no gameplay page is relying on a DOM card/menu as its primary presentation.
- All labels, numbers, descriptions, icons, world art and UI images are present, crisp and legible on desktop and mobile.
- Focus, keyboard, screen-reader naming, text entry, scrolling, pointer and touch controls still work.
- No blank screens, gold-only buttons, hidden copy, missing textures, unintended blur, stale overlays or horizontal overflow remain.
- The complete first-session flow and returning-save flow pass the production Playwright suite.
- Existing save keys/schema, combat formulas, rewards, progression, quests and account/cloud behavior are unchanged unless separately approved.
- GitHub Pages deployment for the tested main commit succeeds.

**Do not start new gameplay feature development on top of the migration until this gate is met.** Afterward, use Phaser's scene/entity/animation/input systems for new combat and world features while continuing to invoke the authoritative production systems.
