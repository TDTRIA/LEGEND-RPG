# LEGEND — Phaser production migration

Updated: 2026-11-08

## Objective

Move the entire production game presentation into Phaser 4.1 while retaining the real production systems. This is not a separate prototype and not a rewrite of combat, quests, rewards, player storage, account/cloud saves or progression logic.

The existing modules remain the source of truth. Phaser owns scene presentation, camera, transitions, visual state, controls and UI rendering as each surface is migrated. Existing controller functions are invoked from Phaser-backed controls until a deliberate later refactor changes those APIs.

## Current state

**Status: In progress**

- **Native in RealmScene:** persistent world environments and atmosphere; Ashmere landmarks; new-player title/menu; mandatory annals; traveler creation; Oric opening-road prologue/response/ambush presentation; persistent HUD; bottom action navigation; traveler journal/quest drawer; contextual action/POI drawer. These surfaces use Phaser presentation while preserving their existing semantic controls and production callbacks.
- **DOM safety fallback:** the original semantic returning-player title remains visible during its finite entrance animation and while Phaser initializes; it also remains visible whenever Phaser is unavailable, a required asset/action/label is missing, or native painting fails. After the entrance pose settles and all required assets, production actions and live Phaser labels pass preflight, Phaser becomes the normal visual presentation while the DOM buttons remain the real accessible action targets.
- **Old Road recovery fallback (current):** expedition header/clock/tracker, route and decision cards, optional detours, camp actions, connected map and field journal intentionally remain in their original DOM presentation. Their experimental Phaser painters are disabled after reports of blurred/misaligned copy and incomplete readability. The Phaser world scene remains active behind them; all existing expedition handlers, route state, travel pressure, encounters, rewards, journals and save data remain authoritative. Re-enable each painter only after desktop/mobile visual parity, readable labels, keyboard focus, and end-to-end route/detour/camp/map/journal tests pass.
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
   - [ ] Verify the Phaser-painted Ashmere destination-card board on desktop/mobile, including focus/hover, dynamic unlocked destinations and DOM fallback.
   - [ ] Ashmere/Greyfen service interiors, service markers and destination selection parity.
   - [ ] Redesign Ashmere hub service selection so visible buttons are anchored to town locations or a clear terminal board; do not simply float Phaser labels over the current town background.
   - [ ] Inn, market, blacksmith, crafting, workboard/daily board and NPC/dialogue screens.
   - [ ] Preserve the existing purchase, craft, job, quest and save callbacks.

4. **Old Road and expedition**
   - [ ] Departure, route choice, exploration scene, points of interest and discoveries.
   - [x] Connected Old Road map and field-journal modal (live route state, discoveries, visit/route choice targets).
   - [x] Road journey HUD: location/title, time and conditions, health/pressure meters, six-leg progress and supplies/next-stop/field-notes rail.
   - [x] Road decision deck: route fork, discoveries/POI inspection, optional detours, Blackroot survey, camp choices and next-move actions (existing handlers retained).
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

## Legacy CSS and engine-layer retirement — Phase 2 only

The migration and the cleanup are deliberately separate releases. The current hybrid build still depends on DOM markup and its CSS for accessible actions, readable fallback screens, service interiors and un-migrated gameplay. **Do not delete, unlink, consolidate or globally rewrite those styles while any production screen still depends on them.** Smaller files are not worth a broken screen, hidden labels, unreadable controls or a lost rollback path.

### Before parity: contain clashes without deleting dependencies

- Keep the legacy stylesheets linked while their screens still render DOM presentation.
- Keep new Phaser presentation rules in the Phaser-owned stylesheets and scope them under the corresponding `body.legend-phaser-…-ui-active` state and screen root. Avoid adding unscoped `body`, `button`, `input`, `.panel`, `.shell` or `.btn` overrides to Phaser-specific files.
- Do not use broad descendant rules to make DOM text transparent or hide whole screen subtrees unless the matching Phaser painter has passed its own preflight and the DOM fallback is guaranteed to restore on any missing asset, label, control or draw error.
- When a clash is verified, fix the narrow selector or painter state that owns that surface. Add a desktop and mobile regression assertion for the visual/control state. Do not solve a one-screen clash by deleting a shared stylesheet.
- Preserve the shared accessibility layer (focus-visible, reduced motion, contrast, large/bold text and readable-font preferences) even after individual screen styles are retired.

### After the global acceptance gate: retire in small, reversible batches

1. Build a stylesheet ownership inventory from the active `index.html` links and the screens that still consume each selector. Mark each rule as shared foundation, legacy-only surface, Phaser surface, or verified duplicate.
2. Start with a completely migrated surface that has its own stylesheet. Confirm no live DOM view, fallback, Save Vault/support page or alternate entry point still consumes its selectors.
3. Remove only that surface's obsolete link/rules in one small commit. Keep the Phaser replacement and its DOM/accessibility action contract intact.
4. Run the focused surface journey, the full Playwright suite, desktop and 390px mobile checks, and a deployed Pages smoke check before removing the next surface's old styles.
5. Treat `css/style.css` and `css/game-ui-v090.css` as shared-foundation candidates, not disposable legacy files. Their global body/form/button/panel rules and accessibility classes must first be split into a small, explicit shared base layer and screen-scoped legacy styles; only then can the remaining unused rules be retired safely.
6. Remove legacy JavaScript modules only after the same call-site audit: no active script tag, global API caller, fallback path, save flow or test may still depend on them. Keep the authoritative gameplay/domain modules even when Phaser owns their screen presentation.

**CSS cleanup is complete only when** the active production entry point no longer links obsolete stylesheets, each remaining stylesheet has a documented owner, no duplicate/global rule changes Phaser screens unexpectedly, all shared accessibility behavior survives, and the full desktop/mobile production journey passes on the exact commit deployed to GitHub Pages. Until then, the legacy CSS is compatibility support—not dead weight.
