## v0.20.29 — Greyfen, service, skill and equipment art intake
- Import and optimize three new 3×3 art atlases into stable local WebP files, including individual service, magic/skill, equipment, and material icons.
- Register the Greyfen marsh walkway environment as a route-scene asset separately from the Greyfen town hub.
- Register the Mirebound Sentinel bestiary portrait in the stable asset manifest and name-to-art mapping.
- Use the new Inn, milestone, and journal illustrations on the inn service actions while preserving the existing shared SVG navigation icons.
- Extend the generated-art import workflow to crop declared atlas grids automatically and to preserve/retry manifests when a source URL fails instead of stopping the entire batch.
- The import workflow completed successfully. Desktop/mobile visual review, image crop QA, and the Playwright run remain required before visual sign-off.

---

## 2026-10-15 — Narrative direction: Monster Wars & the Awakening
- Added `docs/LEGEND_FANTASY_RPG_DIRECTION.md` as the current preferred reference for a fantasy RPG centered on monster incursions, returning magic, regional conflicts, and an unknown awakening; aligned `docs/LEGEND_GAME_REBOOT_PLAN.md` so the monster invasion connects to the candidate Veil / Five Arts / Last Mercy / Afterwake mythology.
- Reconciled the existing world bible, first-session spine, mystery/story arc, series mythology, deep canon, continuity reframe, culture atlas, character compendium, and franchise strategy with the new direction.
- Preserved existing Ashmere characters, regions, mechanics, and the implemented bell/route evidence chain as continuity; the evidence remains a local investigation and does not automatically prove the larger awakening.
- Demoted the Pale Surveyor, Hollow Mile, and related route-network cosmology from primary franchise mythology to legacy proposals/optional secondary lore pending review.
- Documentation-only change. No gameplay code, saves, currencies, or runtime systems were changed. Planned regions and magic systems are not being represented as implemented.

## v0.20.28 — The Unquiet Road title & continuity reframe
- Change the visible working subtitle from “Roads of Ashmere” to “The Unquiet Road” so the title fits the shared geography beyond Ashmere.
- Clarify that Ashmere, the Old Road, Greyfen, Ironpass, Blackwood, and the Ruined March are intended regions within the first game, not separate installments; future titles revisit these places at later points in the shared timeline.
- Add the proposed Hollow Mile mythology: a bounded shadow-passage associated with damaged route anchors, missing journeys, and the Surveyor's false promise to restore the Unreturned.
- Align the series myth arc, deep canon foundation, world bible, franchise strategy, culture atlas, character compendium, and README with this structure.
- **Verification:** Source edits are committed, but title rendering, automated tests, and the live GitHub Pages build have not been verified in a browser during this pass.

---

## v0.20.27 — Desktop-first polish & Captain Oric portrait
- Replace Captain Oric’s handcrafted shape-based SVG portrait with the existing Runway-generated portrait, committed locally and used in both the People card and dialogue screen.
- Add regression checks so both Oric views assert the stable local asset path and successful image decoding.
- Shift UI development and visual QA to desktop first (target 1440×900) while retaining mobile compatibility smoke coverage at 390px.
- Streamline Playwright: full regression on Desktop Chrome by default, focused compatibility tests on Mobile Safari/Chrome, and an opt-in full four-project matrix.
- Skip Markdown-only workflow triggers and cancel superseded runs to keep the automation queue manageable. Deployment/browser verification remains pending until the real asset is committed and checks complete.

---

## v0.20.26 — The Earlier Weekly Return
- After Brenn identifies rewritten Greyfen crossing entries, the Wayfarer’s Camp discovery can reveal an earlier weekly return marked “CLOSED pending inspection,” then overwritten as “OPEN” without initials.
- Recovering the return creates a journal memory and directs the player to Old Brenn in Greyfen.
- Brenn compares the dated return with the overwritten ledger; Mara then preserves the Blackroot seal, Greyfen boundary comparison, Reedwatch field note, and weekly return together in the archive.
- The story now ends this evidence chapter with a clear lead: find the missing closure order that authorized the later change to the lower crossing.
- Added regression coverage for discovery, NPC handoffs, objective progression, and save/reload persistence.
- Full Playwright and live story-path verification remain pending. Browser testing has been blocked before page load by \`ERR_TUNNEL_CONNECTION_FAILED\`; this is not a confirmed game failure or a passing test.

---

## v0.20.25 — The Reedwatch Field Note
- Following Mara’s Greyfen Archive comparison, the Reedwatch Shelter locker becomes a contextual discovery on a later Old Road expedition.
- The player can recover a rain-blurred field note dated two days after Greyfen logged the flood’s retreat; the sketch already shows the newer cut toward the reed bed.
- Returning the note to Mara advances the investigation to Old Brenn. His ledger dialogue reveals overwritten crossing destinations without resolving who altered the records, then directs the player toward an earlier weekly route return.
- The story flags and quest objective are stored through the existing save and journal systems. Regression coverage has been added for finding the note, reporting it to Mara, and advancing Brenn’s lead.
- Full Playwright and live story-path verification are pending. The latest live browser attempt was blocked before page load by `ERR_TUNNEL_CONNECTION_FAILED`; no game failure has been confirmed.

---

## v0.20.24 — A Mark Beneath the Mark
- Extended the Bell quest from the Blackroot seal to the existing Greyfen Boundary Stone. Once Blackroot evidence is known, the Greyfen discovery presents a matching bell-mark beneath a newer cut pointed toward the reed bed.
- Inspecting the Greyfen mark records a persistent memory and advances the quest log to Mara’s Boundary Archive.
- Mara’s Greyfen dialogue now acknowledges the comparison, records both layers as evidence, and gives the next objective: find a dated record or physical sign that establishes when the newer cut was made.
- Added regression coverage for the Blackroot-to-Greyfen field evidence and archive callback, including the Ashmere return dialogue preserving the advanced objective; the test suite also covers The Moved Cairn decision surviving a reload.
- Full Playwright and live story-path verification are pending. The live browser attempt currently fails before the page loads with `ERR_TUNNEL_CONNECTION_FAILED`; no game failure has been confirmed.

---

## v0.20.23 — The Moved Cairn
- Added Captain Oric’s one-time side contract, The Moved Cairn, to the existing Side Stories & Road Contracts board.
- Investigating the Ridgeway Cairn while on High Ridge now reveals a three-way decision: restore the old alignment, document both positions, or mark the hazard and step back.
- Each choice is saved, becomes reportable for the contract reward, adds a journal memory, affects Oric’s follow-up dialogue, and changes what the player sees and reads at the cairn on a later trip.
- Added regression coverage for accepting the contract, discovering the shifted stone, choosing a response, turning in the report, and seeing the persistent callback.
- Live story-path QA was attempted but blocked by `ERR_TUNNEL_CONNECTION_FAILED` in two fresh isolated browser sessions; the game UI never loaded, so this is an environment blocker rather than a confirmed game pass or failure. The full Playwright suite has not run.

---

## v0.20.22 — First Expedition Story Progression
- Persisted the player's first secured Old Road route and optional discovery so returning to Ashmere can produce route-specific story responses.
- Mara, Old Brenn, and Captain Oric now respond to the first expedition differently depending on whether the traveler took High Ridge or Reed Cut.
- The Bell That Rang Once quest log now advances from the first return to inspecting the bell-marked seal at Blackroot Bend; recording the seal adds a persistent memory and points the player back to Mara, then toward Greyfen's boundary records.
- Added Playwright regression coverage for both first-return branches and the Blackroot Bend clue progression.
- Added docs/LEGEND_MYSTERY_AND_STORY_ARC.md and linked it from the world bible and Ashmere story spine. The hidden-truth proposal remains unapproved and is not treated as locked canon.
- Live GitHub Pages smoke confirmed title/footer v0.20.22 and a complete High Ridge expedition return without console errors. The specific new story callback path and the full Playwright suite remain unverified.

---

## v0.20.21 — Different Work, Side Stories & Tactical Weapons
- Replaced the one-size-fits-all Work Board timing check with six task types: timing, signal reading, ledger clues, memory sequences, worksite decisions, and route choices. Ashmere and Greyfen contracts now use different interactions.
- Added three persistent side contracts: a point-of-interest survey, a road battle proof request, and a five-stage expedition report. Contract progress is tracked in the save and rewards are claimed once.
- Added material-specific sword illustrations and visible passives in the Forge. Wooden, stone, bronze, iron, and steel swords now have distinct tactical effects in combat in addition to their different damage ranges.
- Changed enemy motion to reflect heavy wind-ups, guard-break feints, and snared states rather than relying only on a uniform idle bounce.
- Widened the title panel and call-to-action on desktop while preserving the mobile layout.
- Added regression coverage for varied job interactions, side-contract progress/turn-in, and weapon passives; full Playwright suite has not yet been executed here.
- Fixed the controller parsing issues found during the first live smoke; static V8 parsing passes for the main controllers, data, bootstrap, version file, and regression tests. Interactive post-fix verification is still pending because the Browser Use project ran out of credits.

## v0.20.20 — Intent-Aware Enemy Telegraph (live verification pending)
- Added a state class to the battle panel and foe nameplate for normal attack, guard-break, heavy wind-up, and snared states.
- Updated the nameplate label to show `OPPONENT`, `GUARD BREAK`, `HEAVY WIND-UP`, or `SNARED`; visual accents reinforce the existing Enemy Intent warning.
- Combat damage math, turn order, enemy intent selection, and player moves are unchanged.
- Extended the Ranger encounter regression test to advance the foe through attack → guard-break → heavy wind-up using Guard.
- Synced source/package version strings to v0.20.20 and updated cache-busting for the changed road controller and expedition CSS.
- The first live verification after these commits still loaded v0.20.19; therefore the new enemy-intent UI is **not yet confirmed deployed**. The earlier return and level-up fixes continued to pass on that older live build.

- Fixed two JavaScript quoting/unterminated-string issues in the Ashmere controller that blocked the town UI from loading; corrected the cache-busting URL to `v=0.20.21-controller-syntaxfix`. The controller, road controller, data, game bootstrap, version script, and test file now pass static V8 parse checks. Interactive live re-test remains pending.

## v0.20.19 — Return Fixes & Build Integrity
- Fixed the secured-expedition return action so the first **Return to Ashmere** click directly renders the town instead of reopening the secured summary.
- Corrected Work Board level-up punctuation; messages now end with one period.
- Synchronized the HTML title, in-game build labels, `LEGEND_DATA.VERSION`, package metadata, and regression test on version `v0.20.19`.
- Added a regression assertion for the internal data version and level-up punctuation.
- Live QA on 2026-10-14 confirmed the version labels and cache-busted scripts, first-click expedition return, level-up punctuation, and Forge/Crafting Bench. The tested paths produced no console errors. The full local Playwright suite has not yet been run in this environment.

## v0.20.15 — Quiet Title & Town Hierarchy
- Reworked the active title stylesheet (the actual screen is rendered by `js/game.js`) into a single left-aligned cinematic action column over the landscape, with a compact header, quieter secondary actions, and a low-profile footer.
- Refined the Ashmere/Greyfen hub layout: removed the duplicated Your Camp quick-link panel, reduced nested card framing, simplified traveler status into a slim line, and gave destination links a consistent storybook hierarchy.
- Kept all menu labels in HTML and preserved responsive/reduced-motion behavior.
- Began a dedicated nine-cell service/navigation icon atlas and a replacement portrait for Captain Oric; these Runway generations are still rendering and are not yet shipped as game assets.
- Visual browser QA and complete Playwright execution remain outstanding; no claim of a full visual sign-off is made.

## v0.20.4 — Illustrated Service Screens
- Replaced inline SVG symbols in the Ashmere/Greyfen town controller with local environment, portrait, and item artwork already in the production pack.
- Reworked the Trading Post into a two-tab Buy/Sell view, with a compact purse/value summary, real item thumbnails, and a single bulk-sell action.
- Reworked the Blacksmith around the traveler's currently equipped kit, separating Weapons and Armor and showing actual item art with prices, required levels, and equipped states.
- Reframed Character Sheet as **Traveler**: class portrait, progression and health, current gear, travel proof, and an illustrated inventory pack. The existing `sheet` route remains for compatibility; the bottom-nav label now reads Traveler.
- Added the new responsive service-screen styling after existing theme sheets so the refreshed layouts remain visually consistent on desktop and narrow mobile widths.
- Runway generation was attempted again after the reported credit refresh, but the connected generation call failed internally; no claim of new icon-atlas output is made. Existing committed local assets were used instead. Browser visual QA and Playwright remain outstanding until verified.

## v0.20.3 — Clearer Greyfen, Cleaner First-Town Loop
- Made the Ashmere hub use one compact status row and a focused destination grid, leaving the duplicate “Your Camp” shortcut panel out of the active screen.
- Gave Greyfen a distinct cold-water palette while reusing its committed local town and interior artwork.
- Made Greyfen’s Town Square show region-specific keeper roles, dialogue, and inn rumors instead of Ashmere-only descriptions.
- Made Greyfen’s route board offer local keepers and the regional network rather than incorrectly starting the Ashmere Old Road expedition from the second town.
- Added regression coverage for Greyfen scene selection, keeper context, route-board behavior, and aligned the page/data/title build label at v0.20.3.
- The committed production asset pack remains the local source of truth. A full desktop/mobile visual QA pass and Playwright run are still outstanding; these changes are not marked as verified.

## v0.20.0 — A More Cohesive First Two Towns
- Reworked the active title screen into one cinematic composition: a single brand, one clear journey action for new travelers, concise traveler context, and fewer decorative boxes. The landing screen now layers the landscape behind readable HTML controls.
- Simplified Ashmere's hub hierarchy and removed the duplicate `Your Camp` shortcut panel; it repeated Journal, Profile, Sheet and Town navigation already available below.
- Made the hub region-aware. When the traveler is in Greyfen, the title, current route copy, destination names, and navigation identity change to the lowland town instead of continuing to present Ashmere as the current location.
- Generated a 25-image Runway art set for the two-town slice: title and town establishing art, roadside camp, South Fork and route variants, town interiors, six class portraits, three enemy portraits, and a nine-icon inventory sprite sheet.
- Wired Runway-hosted previews for the title, hub, inn/market/forge/archive screens, route-specific road scenes, class choices, and enemy portraits, with legacy local images as fallbacks where applicable.
- Exported all 25 generated images into stable local WebP files under `assets/generated/` after refreshing expired/malformed preview URLs; the GitHub Actions import report confirms 25/25 successful exports.
- Sliced the nine-icon sprite sheet into individual starter inventory icons, added them to the stable asset manifest, and styled a more readable Character Sheet inventory.
- Full screen-by-screen visual review and the Playwright suite remain to be completed; see `docs/PRODUCTION_ASSET_PACK.md` for the asset map and outstanding QA.
- Added Playwright assertions for title hierarchy and Greyfen's region-aware hub. Automated tests and live visual QA have not yet been run for this pass.

## v0.19.2 — Journeys That Arrive
- Made each Travel On action narrate both the stretch left behind and the destination reached, with distinct beats for the ditch, camp, root crossing, shelter, and Greyfen threshold.
- Reset any open discovery when travel begins so a clue from the previous stretch cannot linger into the next scene.
- Added a brief scene-arrival transition and made the persistent scene update its image element during redraws so the entrance motion can play again; respects reduced-motion preferences.
- Added a Playwright assertion that a successful road transition names the destination as well as the route consequence.

## v0.18.0 — A Road That Remembers Your Choices
- Began a scene-led expedition UI pass: removed persistent resource tiles and redundant location cards, reduced the scene to one contextual discovery hotspot, and made discoveries open as optional story beats instead of always-visible boxes.
- Simplified the travel dock to two clear choices: search the roadside or travel onward; the discovery beat can be investigated or left alone.
- Added a restrained pulse to the discovery marker, an animated contextual reveal, quieter “leave it” affordance, and reduced-motion support.
- Added subtle stage-specific scene framing and motion so each stretch has a distinct visual mood without adding more permanent UI.
- Added a meaningful first-expedition route decision at South Fork: the safer High Ridge reduces Road Pressure, while the riskier Reed Cut awards a Bell Fragment and increases pressure.
- Made the opening route choice affect the next stretch: High Ridge keeps the first travel pressure increase low, while Reed Cut draws more danger from the marsh.
- Added route-specific discoveries at Lantern Ditch: High Ridge travelers find a Ridgeway Cairn and herbs that reduce pressure; Reed Cut travelers find watcher tracks and herbs at the cost of more pressure.
- Made the later Wayfarer's Camp scene react to the route: Ridge travelers find dry kindling and continuing markers, while Reed Cut travelers notice wet reeds and tracks that followed them.
- The chosen route is recorded in the current expedition and the fork closes after the choice, preventing repeated rewards.
- Added Playwright regression coverage for route options, risk/reward labels, choice lockout, each route's later discovery and pressure consequence, and route-specific waystation text.

## v0.17.0 — A Friendlier Beginning & Living Road Combat
- Rebuilt traveler creation as a guided seven-step story flow with plain-language prompts, visible progress, atmospheric field notes, deliberate single-choice selection, persistent choices when going Back, and a final story review while preserving the existing save key and character choices.
- Made class techniques meaningfully different in turn-based combat: Ranger Trap Shot weakens the next enemy strike, Mage Rune Bolt disrupts a heavy wind-up, Warrior Cleave hits harder, Thief Swipe steals a little gold, Skiller fieldcraft lowers road pressure, and Adventurer Lucky Strike restores a little health.
- Made enemy intent more actionable: heavy attacks reward Guard, guard-breaking attacks partially bypass armor, and Heavy Strike deals more damage but leaves the traveler exposed.
- Character creation bonuses now apply correctly in road checks and combat, including the current v0.9.4 creation format.
- Expedition narration responds to rising Road Pressure, adding warning beats before an encounter.
- Added browser regression coverage for empty-choice validation, visible selection, Back/Next persistence, and the Ranger encounter UI.

## v0.16.0 — Experience & Level Progression
- Added persistent XP and automatic level-ups without changing the existing save key or requiring save migration.
- Jobs award XP based on timing quality; road encounters and completed expeditions also award XP.
- Level-ups increase maximum health by 8 and restore 8 HP, and XP/level progress is visible in the Traveler Terminal and Character Sheet.
- Fixed the Work Board keyboard listener so it stops intercepting keys after a job finishes.

## v0.15.0 — Ashmere Gear Progression & Field Medicine
- Blacksmith stock now shows all available weapons and armor with level requirements.
- Purchased gear is saved as owned; owned items can be re-equipped without charging again, and locked/unaffordable gear is disabled.
- Road Poultices crafted at Ashmere can now be used in combat, restoring 20% of maximum health; Healing Potions restore 30%.

# Changelog

All notable changes to **LEGEND: Roads of Ashmere** will be documented in this file.

This project is an HTML5 fantasy RPG. Earlier remake history is retained below as a development record. of the original Windows Batch RPG **LegendTFC**.

---

## [Current] v0.14.0 — Persistent Old Road Exploration

### Added

- Added clickable scene hotspots for the current landmark, roadside search, and onward travel.
- Added a compact three-action exploration dock in place of the large screen-filling choice cards.
- Let players inspect the landmark, read the road, and search nearby without automatically advancing; each of these actions is limited once per stop, while Travel On advances the route.
- Made already-investigated landmarks visibly stay marked as investigated for the current stop.
- Kept the illustrated road scene mounted while refreshing the hotspot positions, current location label, and contextual actions.
- Added touch-friendly hotspot and action-dock styling with reduced-motion support.

### Changed

- Exploration actions now begin directly from the scene, making the road feel more like a place to interact with instead of a sequence of screens.
- Updated the visible build version and cache references to v0.14.0.

---

## Historical v0.13.1 — Interactive Points of Interest

### Added

- Added one location-specific point of interest at each Old Road stop, with contextual actions and tangible rewards or route effects.
- Limited each point of interest to one interaction per expedition and reset those interactions when a new expedition begins.
- Added responsive styling for the new point-of-interest panels.

### Changed

- Updated asset cache references and visible build version to v0.13.1.

---

## v0.13.0 — Interactive Exploration & Turn-Based Combat

### Added

- Replaced hit-chance checks in the active Old Road controller with predictable weapon damage shaped by character stats and gear.
- Added telegraphed enemy intentions and Attack, Heavy Strike, Guard, class technique, healing item, and retreat actions.
- Added an illustrated SVG Old Road scene, lightweight scene drift and arrival feedback, and optional synthesized sound effects with an in-game toggle.
- Kept expedition discoveries and results in the road flow instead of forcing a separate continue page after every action.

### Changed

- Road choices now resolve through character attributes and resource trade-offs rather than hidden pass/fail dice checks.
- Combat and exploration controls are tuned for touch screens and respect reduced-motion preferences.

---

## v0.12.0 — Road Sub-areas & Waystations

### Added

- Added named sub-areas along the Old Road: South Fork, Lantern Ditch, Wayfarer’s Camp, Blackroot Bend, Reedwatch Shelter, and Greyfen Approach.
- Added camp rest actions that consume a Camp Supply or Ration, restore health, reduce fatigue and Road Pressure, and advance the day.
- Added a camp crafting action to turn a Road Herb and Cloth Scrap into a healing potion.
- Added mobile-first route cards and dedicated waystation layouts.

### Changed

- The Old Road now presents a named location for each expedition stage, making the journey feel like connected places rather than abstract stages.
- Existing save keys and traveler fields remain compatible.

---

## Historical v0.10.x — Ashmere & Old Road Rework

### Added

- Added a mobile-first five-destination Ashmere town terminal.
- Added clearer routes for Inn, Market, Forge & Workshop, Town Hall, and the Old Road Gate.
- Added traveler status for health, gold, road proof, and identity.
- Added a five-stage Old Road expedition layer.
- Added Road Pressure and meaningful expedition choices.
- Added clear expedition completion, fall-back, and return-to-Ashmere paths.
- Added combat as part of the expedition.
- Added choice-driven road resolution without a visible D20 gate.

### Changed

- Ashmere is now presented as a base of operations instead of a large menu list.
- The Old Road is now structured as a finite expedition loop.
- Mobile touch layouts are treated as a primary interface.
- Current public documentation now uses **LEGEND: Roads of Ashmere** as the active identity.

### Development Focus

- Expand traveler progression, gear, skills, and mastery.
- Deepen Ashmere jobs, NPC relationships, crafting, and town progression.
- Expand road events, enemies, discoveries, and deeper route tiers.
- Connect rewards into longer-term progression.
- Continue mobile UX polish and real-device testing.
- Resume regular devlog/update posts as meaningful changes land.

---

## Historical v0.7.0 - Interface & Encounter Update

### Added

- Added `css/ui-v070.css`, a living UI skin with stronger presentation, animated background glow, polished panels, button shine, improved cards, enhanced battle visuals, and reduced-motion support.
- Added `js/version-v070.js` so the live build reports **v0.7.0**.
- Added `js/systems/creation-v070.js`, a deeper **Traveler Interview** after origin/class/keepsake selection.
- Added Traveler Interview traits, memories, starting item effects, small HP/gold/XP/mastery changes, town trust changes, and saved background bonuses.
- Added `js/systems/intro-v070.js`, a short cinematic intro between character creation and Ashmere.
- Added `js/systems/combat-v070.js`, an additive interactive combat layer with Encounter Read, Exploit Opening, Use Item, class-flavored social actions, and Risky Flee.
- Added `js/systems/defeat-v070.js`, a road defeat screen with early mercy, momentum reset, and light gold/supply loss after the player has learned the basics.
- Added `js/systems/playtest-v070.js`, including a title-screen **What’s New in v0.7.0** modal, weekend playtest goals, and first-time Ashmere guidance.
- Added Devlog 009: `posts/009-interface-encounter-update.html`.
- Added v0.7.0-focused manual checklist and file checks to `playtest.html`.

### Changed

- Better Inventory is now treated as the main character inventory experience through the v0.6.5 inventory layer.
- Character Sheet now hides the old raw inventory dump and shows a cleaner character/inventory summary.
- Old Road choice mode is now promoted as **Travel the Old Road**.
- The old random Old Road route is still available as **Old Road — Classic Fallback**.
- Choice-based Old Road checks now include Traveler Interview background bonuses.
- Title screen copy now describes v0.7.0 as the Interface & Encounter Update.
- Blog/devlog page now points to v0.7.0 and Devlog 009.
- Playtest page now targets v0.7.0 instead of v0.6.4.

### Playtest Focus

- Create a new traveler and test the full character creation flow.
- Try the Traveler Interview and see whether the choices feel meaningful.
- Watch the cinematic intro and check whether it clarifies the world setup.
- Use the Ashmere Start Here guide.
- Speak with Mara, then travel the Old Road.
- Test Old Road choice checks and rewards.
- Try combat options besides Attack.
- Open the improved inventory from Character Sheet and after defeat.
- Test defeat consequences and whether the road-loss penalty feels fair.
- Report anything confusing, unfair, broken, or awkward on mobile.

### Known Notes

- v0.7.0 is still layered safely over the restored v0.6.4 core in several places.
- After the weekend playtest, the next development focus should be stabilization, bug fixes, and consolidating the additive v0.7.0 systems into cleaner long-term modules.
- The live project should avoid replacing `js/game.js` unless absolutely necessary.

---

## v0.6.5 - Menu, Inventory, and Choice Checks Cleanup

### Added

- Added `js/version-v065.js` as a lightweight build label patch.
- Added `js/systems/inventory-v065.js`, a non-destructive Better Inventory overlay with categories, item descriptions, equipment summary, gold, trade value, item-use buttons, and copyable inventory summary.
- Added `js/systems/road-choices-v065.js`, a choice-based Old Road event layer with visible skills, DCs, and outcomes.

### Changed

- Wired v0.6.5 additive systems into `index.html` without replacing the restored `game.js`.
- Better Inventory became available from the Character Sheet.
- Old Road gained a choice-based path while preserving the older route as a fallback.

---

## v0.6.4 - Restored Stable Baseline

### Added

- Restored the live game after `js/game.js` was accidentally overwritten with a stub.
- Confirmed the full game file from commit `913bca8195620512cb477ff504c32fffe093f772`.
- Added restored Old Road descriptions/tutorial data in `js/content/road-events.js`.
- Updated Save Vault, blog, and playtest support pages for v0.6.4.

### Changed

- `index.html` loads the restored stable file sequence:
  - `js/data.js`
  - `js/storage.js`
  - `js/ui.js`
  - `js/game.js`
  - `js/systems/tutorial.js`
  - `js/systems/sella.js`
- `js/data.js` reports VERSION `v0.6.4` as the protected baseline.

### Notes

- Refactor files exist, but modular travel was not fully active in the main loader at this stage.
- Safe additive files are preferred before touching `js/game.js`.

---

## v0.6 - Refactor and Accessibility

### Added

- Split the game out of the giant `index.html` file into modular files.
- Added `css/style.css` for shared styling.
- Added `js/data.js` for game data.
- Added `js/storage.js` for saves and accessibility settings.
- Added `js/ui.js` for rendering helpers.
- Added `js/game.js` for the v0.6 game flow.
- Added accessibility settings:
  - Larger text
  - Bolder text
  - High contrast
  - Reduced motion
  - Simplified ASCII
  - Spacious UI
  - Readable font
- Added progressive Ashmere menu unlocks.
- Added Save Vault support as part of the v0.6 path.
- Added a v0.6 refactor plan in `docs/v0.6-refactor-plan.md`.

### Changed

- `index.html` is now a small loader that imports CSS and JavaScript modules.
- The starting Ashmere menu now shows fewer choices at first.
- Town systems unlock over time based on early player progress.
- New players are guided toward The First Road, People of Ashmere, Character Sheet, Settings, and Save/Exit first.
- Archive Hall, Ledger Hall, Inn, Trading Post, shops, Commons, Save Vault, and Hollow Keep now unlock progressively.

### Known Issues

- v0.6 is a structural refactor and may temporarily be leaner than v0.5.1 in some systems.
- The QA runner still needs a full v0.6-specific pass.
- The Save Vault exists as a separate page and is not yet deeply integrated into every in-game menu flow.

---

## v0.5.2 - Save Vault / Portability

- Added `save.html` Save Vault page.
- Added portable save code export.
- Added downloadable `.legend` save files.
- Added save import by paste or upload.
- Documented Save Vault in the README.

---

## v0.5.1 - First Road Balance

### Added

- Added the first balance patch for the v0.5 public playtest loop.
- Added guaranteed Old Road progress toward Road Tokens.
- Added a feedback link directly to the main menu.
- Added Devlog 006.

### Changed

- Updated game label to **Recovered Build v0.5.1**.
- Road Token progression is now less dependent on random event luck.
- Every two successful Old Road events can now reward a Road Token.
- More Old Road events can contribute to Road Token progress.
- Bell Shard pacing is more intentional after talking to Mara.
- Quest tracker now shows clearer Road Token progress.
- Early Old Road enemy balance was tightened for public playtest pacing.
- Important survival and quest items are better protected from quick selling.
- Updated blog and status pages for v0.5.1.

---

## v0.5 - The First Road

- Added **The First Road** depth patch for the opening route.
- Added **Road Tokens** as an early route objective.
- Added a new quest objective to bring 3 Road Tokens to Old Brenn.
- Added **Ashmere Inn** for resting and preparation.
- Added **Camp Supplies** as a survival item and economy sink.
- Added steadier weapon damage ranges.
- Added enemy traits.
- Added clearer quest tracker text.
- Added mastery perk text for each skill.
- Added mastery-based bonus reward chances.
- Added more Old Road-focused event filtering.
- Added Devlog 005.

---

## v0.4.1 - Mobile Polish

- Improved mobile viewport behavior.
- Added sticky mobile action controls.
- Improved tap target sizes.
- Reduced mobile spacing and panel size.
- Made ASCII panels scale better on narrow screens.
- Updated Devlog and newsletter/status pages for v0.4.1.

---

## v0.4 - Voices of Ashmere

- Added named NPCs in Ashmere.
- Added the People of Ashmere menu.
- Added a dialogue system.
- Added first real questline: **The Bell That Rang Once**.
- Added Bell Fragment quest item.
- Added enemy intent text.
- Added Guard action.
- Added class-based combat moves.
- Added Momentum meter.
- Added camp choices.
- Added route unlock conditions.
- Added skill mastery tracking.
- Added browser tab icon through `favicon.svg`.

---

## v0.3 - The Roads Beyond Ashmere

- Renamed the starting town to **Ashmere**.
- Renamed the wider world to **Eldermere**.
- Added The Ledger Hall, The Archive Hall, The Hollow Keep, The Commons, and The Relic Market.
- Added intro sequence.
- Added deeper character creation, origins, and keepsakes.
- Added Character Sheet.
- Added ASCII art panels.
- Added exploration routes and random events.
- Added D20-style skill checks.
- Added Trading Post and Backroad Dealer.
- Rebalanced early progression.

---

## v0.2 - Recovered Build

- Added animated title screen.
- Added class selection.
- Added improved menu and battle screens.
- Added Quest Hall cards.
- Added Recovered Memories.
- Added Skill Plot.
- Added RealmBank interface.
- Added Lacoyx boss encounter.
- Added Code Fragment story item.
- Added devlog, newsletter, and GitHub title buttons.

---

## v0.1 - Classic Online Prototype

- First HTML5 remake prototype.
- Added character creation and browser save support.
- Added basic combat, inventory, shops, bank, quests, skills, and boss prototype.

---

## Original Source - LegendTFC Release 1.0

The recovered batch version included account creation, login, saving, town menus, random combat, enemy drops, shops, inventory, food, potions, equipment, skills, banking, quests, player levels, experience, and the Lacoyx boss fight.

Later remembered versions are currently lost, and missing systems may be reimagined as part of the remake's lore.

## 2026-10-15 — Town/service icon integration
- Wire the imported local service-icon family into Ashmere/Greyfen navigation for the Inn, Market, Forge, Journal, Map, Work Board, Traveler, Route Milestone, and Regional Gate.
- Preserve existing SVG fallback icons for unrelated actions and add Playwright checks for local paths and image decoding.
- Browser regression and deployed desktop/mobile visual review are pending.
