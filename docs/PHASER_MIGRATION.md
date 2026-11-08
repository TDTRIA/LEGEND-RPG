# LEGEND — Phaser production migration

Updated: 2026-11-08

## Objective

Move the entire production game presentation into Phaser 4.1 while retaining the real production systems. This is not a separate prototype and not a rewrite of combat, quests, rewards, player storage, account/cloud saves or progression logic.

The existing modules remain the source of truth. Phaser owns scene presentation, camera, transitions, visual state, controls and UI rendering as each surface is migrated. Existing controller functions are invoked from Phaser-backed controls until a deliberate later refactor changes those APIs.

## Current state

**Status: In progress**

- **Native in RealmScene:** persistent world environments and atmosphere; Ashmere landmarks; new-player title/menu; mandatory annals; traveler creation; Oric opening-road prologue/response/ambush presentation; persistent HUD; bottom action navigation; traveler journal/quest drawer; contextual action/POI drawer; Old Road connected map and field-journal modal. Migrated surfaces have dedicated Phaser panel/text/icon rendering, with original DOM controls retained as accessible action targets.
- **DOM safety fallback:** returning-player title with Continue. Its labels and interaction remain in the original styled DOM until Phaser text parity is verified.
- **Still DOM-rendered over Phaser world:** shell map drawer; town terminal; services, jobs, market, blacksmith/crafting; main Old Road expedition scene, route/POI/camp interactions and expedition results; combat commands/status; combat results; level-up/stat allocation; Bell Cellar; Greyfen/Storehouse; settings, dispatches, credits and shell modals.
- **Safety note:** the previous shared DOM-to-Phaser gameplay mirror is disabled. It made DOM text transparent and recreated CSS panels incompletely, which caused missing copy and weak/blurred panel presentation. Do not turn it back on globally.

## Migration order

1. **Title and first-session shell**
   - [x] New-player title/menu and world backdrop in Phaser.
   - [x] Annals, traveler creation and Oric opening-road presentation in Phaser.
   - [x] Keep the returning-player Continue state readable with a DOM fallback.
   - [ ] Complete and verify Continue text, focus, hover, selected/disabled states and responsive geometry in Phaser before removing that fallback.

2. **Persistent shell**
   - [x] HUD and traveler vitals.
   - [x] Journal/quest drawer.
   - [ ] Persistent shell map drawer.
   - [x] Contextual action/POI drawer.
   - [x] Old Road map / field-journal modal.
   - [x] Bottom navigation.
   - [ ] Shell toast, inventory and character-sheet modals.
   - [x] Mobile journal/context side-panel states and scrolling.
   - [x] Old Road map/journal modal scroll clipping at mobile width.
   - [ ] Remaining shell map drawer/modal scrolling.

3. **Ashmere and services**
   - [ ] Ashmere/Greyfen hub labels, service markers and destination selection.
   - [ ] Inn, market, blacksmith, crafting, workboard/daily board and NPC/dialogue screens.
   - [ ] Preserve the existing purchase, craft, job, quest and save callbacks.

4. **Old Road and expedition**
   - [ ] Departure, route choice, exploration scene, points of interest and discoveries.
   - [x] Connected Old Road map and field-journal modal (live route state, discoveries, visit/route choice targets).
   - [ ] Main expedition scene, camp, route-event presentation and expedition result screen.
   - [ ] Keep route state, pressure, rewards, evidence and Road Token settlement in existing modules.

5. **Combat and progression**
   - [ ] Battle arena composition, actor/enemy presentation, intent and turn state.
   - [ ] FIGHT / ACT / ITEM / GUARD / retreat controls and battle log.
   - [ ] Victory/defeat/retreat results, XP/gold/loot and level-up/stat allocation.
   - [ ] Keep damage, AI, status, loot and progression formulas unchanged during UI migration.

6. **Dungeons and regions**
   - [ ] Bell Cellar room/choice/combat/reward screens.
   - [ ] Greyfen Marsh and Storehouse exploration, map, encounters and results.
   - [ ] Region travel and locked-region presentation.

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
