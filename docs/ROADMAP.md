# LEGEND: The Awakening — Product Roadmap

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:d5592866127a1f053fb684b628f95b72d877c9440f02258d27ec24970e274939 -->

**Last updated:** 2026-11-13

<!-- /coderabbit-ai-generated:v1 -->
**Purpose:** One shared source of truth for what we are building next, why it matters, and how we decide each slice is finished. This is a player-impact order, not a date promise.

## The north star

LEGEND should feel like a dark-fantasy RPG taking place in a continuous world—not a collection of unrelated website screens. The player should see a place, make a decision in that place, see a consequence, and carry the result forward.

**Darkest Dungeon is now the primary high-level creative reference**, replacing the earlier World of Warcraft / Diablo comparison. The fit is expedition-led dark fantasy: stark illustrated scenes, expressive character portraits, compact field reports, meaningful route decisions, and tactical encounters whose intent and results are easy to read. It is inspiration only; LEGEND does not copy its art, characters, interface, writing, sound, or mechanics. See [Darkest Dungeon Creative Direction](DARKEST_DUNGEON_DIRECTION.md).

The owner has approved moving the **entire existing production game's presentation and interactive surfaces into Phaser 4.1**. This remains the active technical priority. It is an incremental migration of the real game—not a big-bang rewrite of its systems, a parallel game, or a plan to turn the project into an MMO. Preserve the existing production controllers, rules, state, and save contracts while each complete screen/surface is moved to Phaser.

**The core loop is:**

**Prepare in town → choose a road → explore and make choices → face danger → bring back loot, evidence, and discoveries → improve the traveler → unlock more of the world → prepare to go farther.**

The story and the systems should reinforce that loop. Town is a place the player wants to return to; the road is where their choices are tested.

## Current implementation checkpoint — 2026-11-08

- **Production main:** v0.30.5. The road-first opening, mandatory annals, Oric/Wolf tutorial, five-stage Old Road, Ashmere services, progression, and early Greyfen activities are part of the browser build.
- **Phaser migration:** approved and active in the production root. The persistent world renderer, Ashmere landmarks, new-player title presentation, annals, traveler creation, Oric opening-story presentation, persistent HUD and bottom action navigation now have dedicated Phaser visuals. The returning-player title menu is now Phaser-rendered when its required textures, six production actions and live labels pass preflight; its original semantic DOM menu remains the visible fallback if any check fails. The persistent HUD, bottom navigation, traveler journal/quest drawer, Ashmere/road contextual action drawers, connected Old Road map/field-journal modal, Old Road journey HUD and Old Road route/POI/optional-detour/camp decision deck now have dedicated Phaser painters with original DOM controls retained. Ashmere's destination-card terminal board now has a dedicated Phaser painter under verification, using existing service-button geometry and retaining the real DOM buttons and raster icons. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:88b3570472211e9bf13ee58b36d2a05b58b366cf453a280de3b203f0e9e1c7b5 -->

The central Old Road scene now has verified local native framing, location, discovery and sound controls with DOM fallback. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:14d15742235a744795685f66d082882cbcef9229db8b98a76093aff268c163d0 -->

Expedition results also have verified local native presentation with exact settlement and growth-report refresh coverage. Combat/results, level-up, dungeon/Greyfen and remaining modal UI continue screen by screen; the later checkpoints below record completed local service and navigation slices.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 --> The previous shared all-screen canvas mirror is disabled because it hid copy and produced incomplete panels. Existing production controllers, combat calculations, player saves, account/cloud behavior and rewards remain unchanged.
- **Audio:** the 48-asset generated ambience/effect library and separate roughly 10½-minute main-theme MP3 are merged into main and deployed through [PR #98](https://github.com/TDTRIA/LEGEND-RPG/pull/98). The shared director supplies the persistent score, environment ambience, menu cues, and combat effects. Human listening for mix/loop quality and further event-specific world/town/reward SFX wiring remain.
- **Region status:** Ashmere and the Old Road form the main playable foundation. Greyfen is an active partial region; Ironpass is future content. The first three towns are still a release target.
- **Active sequence:** finish the Phaser production migration using the acceptance gates in PHASER_MIGRATION.md. Verify returning-player title parity and the separate shell map drawer, then verify the anchored Ashmere destination board before continuing with Ashmere service screens, the main Old Road expedition/camp/results presentation, combat/results, level-up, dungeon/Greyfen, and remaining overlays. Migrate each presentation surface without replacing the underlying feature controller or save contract. Do not hide a DOM label or asset until the Phaser version is visibly present at desktop and mobile sizes, all controls remain keyboard/touch accessible, live text/state updates correctly, and the focused Playwright journey passes. Only after every listed surface is native Phaser and the full production journey is stable should new Phaser gameplay features begin: multi-skill combat kits, enemy intent/animation, randomized affix loot, enemy families/elites and skill trees.


<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:c0b1d7afab7d3df799ef2c62bbb17ba2cfa33faccac78d98b06912e26ea16d13 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:5f771f8dc5008c60cbed7558ed9d8e70eaa68b749f050f737794c53303ed8d13 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:adb53ab7bf7b3ac4d78af200baf679bc67e57faa6d18fb141a0be06c956d067d -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:62b2254da402f9f1a5af33cc3ec3636a14af74ff5c1b9da71d600d2a61027609 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:19bb67543391114c1b5b86ace4c4d1b97e414a9337c9697559a0e47c51ecdfbf -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:a3d019a033fa6b634d06156e47b4edd99af839a9c60bb097a4afd01fafdb7ae9 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:9f47ac1ad60278b694029c4dc806752658adc4dcf549ec52a31271a27130deba -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:e12de29366cf45214393b399e73e2a8edf5fa252e3ef1b3cd36048a9ea601911 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:2f97e4508ada66281f36ddb80ad663e1f6c8e332c7b787ed23d88d8a51356767 -->

## Expedition results — 2026-11-13 (verified locally)

The production Old Road result view now has dedicated guarded Phaser artwork, headings, health/pressure/progress meters, reward and experience panels, route/evidence/camp reports, sound and Return/Mara focus frames. Semantic DOM controls retain the production callbacks. Missing artwork, unsupported copy, incomplete meters or a failed label restore the complete styled DOM view. Scrolling and responsive masks keep the report beneath the fixed HUD, drawers and dock.

Confirmed result defects repaired: stale expedition scroll carried into the report; a redundant discovery hotspot remained after settlement reset the trip; and health stayed at its pre-allocation value after Endurance growth. Results now enter at the heading without stealing the level-up overlay, omit the obsolete exploration action and refresh from the saved player after growth. Refreshing the report never settles rewards again.

Eight focused cases pass across final checks and equivalent retained passes: complete reports at desktop/mobile (including a real touch handoff), early settlement with Endurance growth, non-settlement outcome/fallback, existing Mara and crafting-report journeys, shell return and all-stage road artwork parity. Exact gold, XP, token, pressure, health, unknown-property preservation and return behavior remain covered. Shared Chromium desktop, portrait and landscape screenshots were inspected using read-only production-view fixtures; transaction checks use isolated real controller/service contexts. The early-return service branch is covered, but this does not add or certify a new early-return navigation flow. Combat results and the wider first-three-towns/release gates remain open. Publication remains pending task permissions.

## Main road scene — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The Old Road scene now has dedicated Phaser framing, location text, discovery icon/caption, sound state and focus frames alongside its source-matched environment artwork. The existing road-view buttons retain keyboard, touch, audio and discovery callbacks. Native presentation requires complete text, matching loaded artwork and a usable viewport mask; failed painting, partial environment fades and foreground map/journal views restore or retain the original DOM presentation.

Confirmed regressions repaired: the mobile sound control was underneath the fixed HUD, and resizing or closing animated drawers could leave journey text behind a zero-width native mask. Scene controls now start below the measured HUD, and all road masks refresh when shell bounds settle.

Eight distinct focused cases pass: four final scene/control/artwork cases, plus four equivalent journey-readability and map/journal/keyboard consumer passes. Coverage includes all six stages, both routes, Windbreak and Sunken Cart, discovery persistence, sound preference, unknown save properties, failure fallback, scrolling, focus and live orientation/drawer changes. Final shared Chromium screenshots were inspected at 1440×900, 390×844 and 844×390. Gameplay, resource costs and reward settlement are unchanged. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:27d156807d8555aeb7f1011d2c1724de4eb5c8728e98fa71d82aee29b7eefe54 -->

Expedition result presentation is verified in the later checkpoint above; broader migration/release gates and Bitbucket-to-GitHub publication remain open.

<!-- /coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:c45336fc81e4a7df2968d59307df277265a94801738fbe9ed425f04b27d0eab5 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:1db43bbd08ab2ec7614f182f44c78d44266fbb737d23e66f3905c7995649f69d -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:037b3baecfaf0fef3a4501453988d1eaff7cdaf2296ae8a5f13d057976e0b0b2 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:77afe5d58608b2904835ee5945fddb9e8ba6f801d70e97dcfa057c839f979a62 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:c2866f89c16189bfe8742e33ce87a32b26c65db8fc605086bbe6724be753274f -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:78b5533fc917030005f9e1ea1370d9912a893d2c45c7751028c8cfd3612f3cce -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6e9112f67f6011d2d3b2cd65513c93ef18472d956938fe5bb1edec159db1bb1a -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:267d085d5dcd14c1fc083d64f97c2b87ca47e1d8b9c0b3a5aec89a480de8635d -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:67830791360a1577eb9a7e1de3e2de7c384ab64bdece742fd7541fb6206a06e4 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:1aa93bc4df185bda57e491f930b6e31070ef60fc5bebe49851d5efbb690a23ab -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:a4be121a4a02084060887cb2a8cbabd3a63c93217dd84fba9aff0f44580f9c13 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:fcf70e933555aaf62d1571020227bbe850b77f60755304989f4ae4bd2e10991e -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:69d286c291b0c4bcfa99bdda8e6b8ed3260e8f6abaa6e75c5dcc4e73c9778a8d -->

## News & Roadmap — 2026-11-13 (verified locally)

The production dispatch page now uses dedicated Phaser presentation for its header, build information, eight news/roadmap cards, all 49 text fields, three links, Return control and approved milestone artwork. The existing title-dispatches-v140 controller still owns all authored copy and navigation. Original anchors retain their destinations, separate-tab behavior and noopener protection. Entry focuses the heading and resets stale scrolling; native focus and viewport clipping follow keyboard input, scroll and rotation. The source's compact mobile artwork layout is preserved.

Missing source fields, unexpected copy or missing artwork restore the complete DOM. Texture lifecycle verification exposed two gaps: first, a removed texture did not trigger repaint; then deferred cleanup allowed a browser rendering error before fallback. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:bf6f47d4bf324e11fd9baee09f97c3bde0970d8e36abeb78eb7c39a87ab67888 -->

Normal-motion Preview also exposed repeated teardown when the painter reacted to its own text textures. The painter now filters texture notifications to its milestone artwork, synchronously clears its objects on removal and repaints on restoration. The final normal-motion regression verifies stable presentation after recovery and zero browser errors; a fresh shared Preview probe independently confirms both.

<!-- /coderabbit-ai-generated:v1 -->

Five focused cases pass across fresh runs and equivalent retained results: desktop keyboard/mobile touch and all three real anchor activations; complete copy/artwork; landscape and combined accessibility preferences; unknown/replaced content and missing-texture fallback/recovery; and the existing normal-motion News/title roundtrip. Link destinations were fulfilled with isolated synthetic documents to verify navigation without relying on external service availability. The prior full returning-player title action check remains valid for unchanged title owners/callbacks; the fresh roundtrip covers this changed surface. Syntax checks pass for 109 production scripts and 76 test specs. Raw player, settings, audio and pending-return state remain unchanged.

Shared Chromium desktop1440×900, portrait390×844 and landscape844×390 screenshots were inspected, including combined accessibility preferences, the full roadmap, focused controls and DOM fallback. Text and links are readable and no horizontal overflow was observed. Temporary Preview preferences and textures were restored. Disabling the dedicated renderer restores the semantic page, with no save migration. Storage, account, gameplay, lore and reward owners are unchanged.

Next: profile/account presentation, remaining loading/confirmation overlays, audio-control acceptance and full first-session/returning-save migration gates. First-three-towns release requirements and production publishing remain outstanding. Manual task permissions still prevent PR creation and merging; this is a local branch checkpoint.

## Credits dialog — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The production Credits dialog now has guarded Phaser copy, panel, separators and focused Return presentation over the existing world art. All credits and original return/outside-click/Escape actions remain available. Missing or unexpected copy restores the complete DOM presentation; scrolling and resize keep text within the dialog. No save, account, audio, lore or gameplay owner changed.

Shared Preview reproduced a full-screen 9px blur and Tab escaping the dialog. The blur is removed in both native and fallback views. The title is inert while Credits is open, Tab/Shift+Tab remain within the dialog, initial focus preserves the start of the text, and closing restores the opener and prior inert state. Repeated opening reuses the current dialog. Escape is handled by the dialog before the title-wide listener can replace its opener.

Four focused checks pass: three new desktop/mobile/accessibility cases for exact copy, keyboard/touch, landscape scrolling, repeated open, fallback/recovery and unchanged raw player/settings/audio/return state; plus the existing returning-player title action regression. The first three interaction checks passed before visual inspection caught an old global button gradient covering the Return label. Scoped style precedence and computed background/color assertions now prevent that regression; all three passed again. Syntax checks pass for 108 production scripts and 75 test specs.

Final shared Chromium screenshots were inspected at 1440×900, 390×844 and 844×390, including combined accessibility preferences, focused Return and DOM fallback. Copy and controls are readable, world art remains clear, and no horizontal overflow was observed. Temporary presentation preferences were restored; raw Preview player/settings/audio values were unchanged and the title was restored. Removing the Credits painter restores the semantic dialog; the focus and blur repairs remain independent.

Next: News/Roadmap and profile/account surfaces, remaining loading/confirmation overlays and the full first-session/returning-save migration gate. Audio-control acceptance and production publishing remain outstanding. Manual task permissions still prevent PR creation and merging; this is a local branch checkpoint.

## Settings and accessibility — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

Both production Settings surfaces now use guarded Phaser panels, complete labels, checked states and keyboard focus, retaining their semantic inputs and callbacks. The title page keeps its six draft preferences and explicit Save; the in-game dialog keeps seven immediately saved preferences, including simplified symbols. Approved icons remain visible. Missing artwork, incomplete fields, unknown copy or failed text fitting restores the DOM presentation. Scroll, resize and replacement content repaint safely.

Confirmed repairs include fallback switches that did not show their checked position, oversized dialog checkboxes, lost focus after Save, inaccurate Back to Ashmere text for returning Greyfen players, and a misleading success message when storage rejected a write. Failure now states that preferences remain active for the session. Unknown settings fields, player data, road audio preference and pending return state are preserved. Storage ownership, gameplay and account behavior are unchanged.

Nine focused cases pass: six Settings checks covering desktop keyboard/mobile touch, all accessibility preferences together, explicit/immediate saving, reload, failed persistence and retry, fallback/recovery and malformed/replaced content; plus three existing storage failure, shell settings persistence and Settings Escape regressions. Earlier runs exposed real fitting and theme-layer defects, repaired without reducing text-fit requirements or removing assertions. The existing shell consumer initially exhausted its 30-second budget during creation; it passed unchanged with a 120-second command budget. Syntax checks pass for 107 production scripts and 74 test specs.

Shared Chromium screenshots were inspected at 1440×900, 390×844 and 844×390, including high-contrast combined preferences, scrolling and focused Save/Return controls. No horizontal overflow was observed. Memory-only Preview preferences were restored and raw player/settings/audio values remained unchanged. Removing the dedicated painter restores the complete semantic DOM; no save migration is required.

This completes the local settings/accessibility slice. Audio controls remain owned by existing title/road/combat modules; their broader acceptance, auxiliary title/profile screens and loading/confirmation overlays remain open. Complete first-session and returning-save regression gates, dedicated Storehouse art, Greyfen/first-three-towns release and production publishing remain outstanding. Manual permissions still prevent PR creation and merging; this checkpoint is not a deployment claim.

## Regional shell and reliable navigation — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The Storehouse shell now identifies the current room, mirrors its actual available actions and shows saved dispatch/salvage records and the last report in the native journal drawer. Labels distinguish Back (an active attempt remains resumable) from the room's explicit return (the attempt ends); inactive/locked/failed/completed screens do not promise resumability. All operations call the existing production buttons. Greyfen encounters and reports retain their own journal context and current objective; encounter navigation remains locked while saved summaries stay readable.

Normal-motion verification exposed a shared navigation defect: the scene curtain canceled a forwarded click and synchronously called click() again on the same element. Browser reentrancy protection suppressed that second call, leaving controls inert. The curtain now decorates the original event, preserving one synchronous production callback. A baseline regression failed before the repair; desktop keyboard, shared Preview pointer and mobile touch now apply the exact cargo-sump HP/herb effect once. Native and forwarded events, busy curtains, disabled controls and reduced motion are covered separately.

Closing the Ferry result drawer also reproduced an unexpected return to title. Combat reports had no environment classification, so they selected title and activated its Escape handler. Reports now supply their road/marsh/cellar environment. Existing title and Settings Escape navigation is preserved. The report, its controls and saved settlement remain available after closing a drawer.

Fourteen focused cases pass across fresh runs and equivalent retained results: six regional shell/navigation cases, three shared victory/growth/defeat report cases, two shell readability/fallback cases, the Marsh mobile record openers and transition event semantics, plus Settings Escape compatibility. Initial assertion failures used the wrong test item ID (lampOil instead of oil); that assertion was corrected to the existing production ID. The separate Escape and normal-motion failures were real defects and are repaired. Syntax checks pass for 106 production scripts and 73 test specs. Storage and combat-rule owner results remain valid; no save keys, progression rules, economy or lore changed.

Shared Chromium desktop1440×900, portrait390×844 and landscape844×390 screenshots were inspected, including Storehouse records, contextual actions, focused return and the regional report drawer. Normal-motion pointer input and Escape were exercised; the original Preview save remained unchanged under memory-only fixtures, and the normal title was restored. Semantic DOM controls and drawer fallback remain available. Removing the regional shell changes restores the old generic shell; the transition and report-environment repairs are independent and require no save migration.

Next: settings/accessibility/audio and remaining auxiliary overlays, then reconcile outstanding migration gates against the complete first-session and returning-save paths. Dedicated Storehouse interior artwork and the broader Greyfen/first-three-towns release remain open. Manual permissions still prevent PR creation, merging and production publishing; no deployment is claimed.

## Greyfen combat and encounter reports — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

Storehouse Keeper encounters now use the approved Greyfen environment and Mirebound enemy artwork. Baseline regressions reproduced the incorrect Bell Cellar arena and innkeeper portrait. Direct-root Marsh battles now reserve the measured shell HUD height and clip retained controls to the same viewport as Phaser. Entering combat resets stale room scrolling; live keyboard commands retain focus, moving to Strike when ACT enters cooldown. Existing production handlers and complete DOM fallback remain authoritative.

The nine regional cases cover desktop keyboard/mobile touch, Storehouse victory/defeat/report settlement, Reed Wisp victory/defeat and both return paths, Ferry Raider and Sentinel victory/retreat/defeat, live supply costs, cooldown focus, rotation and missing-art fallback. A first regional run found a mobile Ferry report fit failure: WITHDRAWN overflowed its narrow metric card. Two-column mobile metrics now keep the complete status readable; the DOM fallback also has opaque readable panels. Both affected cases passed after the correction; seven equivalent regional passes remain valid. Twenty fresh shared-consumer checks pass: fifteen combat-rule contracts, common combat presentation, Bell Cellar touch/retreat, and three Old Road victory/growth/defeat report cases. Syntax checks pass for 106 production scripts and 71 test specs.

Shared Chromium screenshots were inspected at desktop1440×900, portrait390×844 and landscape844×390, including focused retreat, regional reports, return actions and DOM fallback. Preview used memory-only synthetic save wrappers; the original stored player record was verified unchanged and the normal title restored. New isolated tests verify exact regional rewards, pressure and supply effects, Old Road isolation and unknown fields. Gameplay calculations, reward amounts, storage keys and canon are unchanged; prior storage-owner checks remain valid. This is focused acceptance, not a full release regression run.

Next: Storehouse shell actions and regional journal context during encounters/results. Dedicated Storehouse interior artwork and broader Greyfen/first-three-towns acceptance remain open. The current approved regional artwork is retained. PR creation, merging and publishing remain unavailable under this task's Manual permissions. Reverting this presentation slice restores the prior combat view; no save migration is required.

## Silted Storehouse rooms and save compatibility — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The existing Storehouse now has guarded Phaser presentation for its locked entry, preparation, loading walk, records bay, restored encounter entrance, won room, failed attempt and completed report. Approved regional artwork, headings, status values, authored evidence, optional salvage, action details and live feedback are painted from the production view. Semantic controls retain their original callbacks. Missing actions, artwork, required fields or unhandled copy restore the complete DOM. Heading focus and scroll reset follow room changes; focused controls and Back remain usable above the fixed dock.

A reproduced save-contract defect is repaired: starting, retrying or repeating a delve previously replaced its nested run object and discarded unknown fields. Restart now preserves extensions and recorded discoveries while resetting the same known attempt fields, including removal of the old report, combat-XP and last-room values. Whole-player comparisons verify the original reset behavior plus preserved extensions. The existing Back action still leaves an active delve resumable; explicit retreat retains its saved effects.

Ten focused cases pass across fresh runs and equivalent retained checks: four new native/save cases and all six existing Storehouse regressions. Coverage includes desktop keyboard/mobile touch, both approach costs, one-time salvage, saved dispatch/reload, unknown fields and Old Road isolation, exact first/repeated report rewards, duplicate claim protection, restored encounter entry, actual keeper victory/defeat/retreat, Mara's evidence handoff, incomplete-source fallback and landscape bounds. The baseline save test failed on the lost extension fields before the repair. A final focus assertion was corrected to exercise real keyboard focus rather than pointer-origin programmatic focus; native and fallback focus expectations both pass. Existing gameplay tests use supported reduced motion and a 120-second command-level budget for software rendering; assertions remain intact.

Shared Chromium desktop1440×900, portrait390×844, landscape844×390, report, feedback and DOM fallback screenshots were inspected. A duplicate DOM/native focus outline found during inspection was removed only while the painter is active. Syntax checks pass for 106 production scripts and 70 test specs. Combat calculations, economy, reward amounts, save keys and authored lore are unchanged. Mandatory storage and combat-rule results remain valid; this is not full release acceptance.

Next: regional shell/journal context and combat-specific presentation acceptance for Greyfen. The Storehouse still uses its existing approved regional artwork; the release plan's dedicated interior-art requirement remains open. Greyfen and first-three-towns release gates remain unchecked. PR creation, merging and publishing remain unavailable under this task's Manual permissions. Removing the dedicated painter restores the semantic DOM presentation; the save compatibility repair is independent.

## Greyfen Marsh field records and shell — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The Marsh field map and saved field notes now have dedicated, guarded Phaser presentation. Places retain explicit current/visited/off-route labels; settled reports place the traveler at Greyfen Landing. Both views support keyboard, touch, scrolling and rotation, with original semantic buttons and complete DOM fallback for missing or unknown content. The modal isolates background controls, restores prior inert state and opener focus, and cleans up when its owning screen leaves.

The persistent shell now recognizes Marsh expeditions and reports, shows regional objectives and journal counts, and opens the actual Marsh map/notes. Return actions use the production settlement/report callbacks; town services and the traveler sheet cannot silently leave an active outing. A mobile CSS conflict that clipped dock labels is repaired. Focus is preserved when shell controls are rebuilt.

Fifteen focused cases pass across fresh and equivalent retained checks: map/journal desktop and mobile journeys, detached-modal cleanup, mobile dock/drawer controls, full desktop/mobile surveys, independent desktop missing-source/landscape checks, partial-report fallback, report level growth, inventory overlays, persistent-shell readability and the existing wisp combat handoff. Initial opener-focus failures were fixed. Desktop survey attempts exceeded aggregate time budgets under software rendering; trace inspection found no stuck individual operation. Fallback/rotation assertions were moved into a separate desktop test without removing assertions or widening native-state deadlines. The final bounded checks pass. Mandatory storage and combat-rule passes remain valid because their owners and inputs are unchanged; full release acceptance is still open.

Shared Chromium screenshots were inspected at 1440×900, 390×844 and 844×390, including map, populated notes, settled report map and DOM fallback. The final mobile dock shows complete labels. Syntax checks cover 105 active production scripts and 69 test specs. No save keys, normalization rules, reward formulas, costs or authored lore changed; read-only map/notes and navigation checks preserve saves and unknown properties.

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:4150be4900426090c765a7d8478a936d9213c7f7a1041d4720316ffab045c208 -->

The later Storehouse checkpoint above completes its room presentation and unknown nested-state repair. Regional shell/journal context and combat acceptance remain next.

<!-- /coderabbit-ai-generated:v1 --> Greyfen and first-three-towns release gates remain open. This checkpoint is on the assigned feature branch; PR creation, merging and publishing remain unavailable under this task's Manual permissions. Removing the dedicated map painter restores DOM presentation.

## Greyfen Marsh expedition and reports — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The production Marsh Path now has guarded Phaser artwork, status meters, route/encounter decisions, optional salvage, shelter choices, field notes, feedback and return reports. Original semantic controls retain every production callback. Complete action/field/artwork checks and unknown-content guards restore the styled DOM when presentation is incomplete. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:f1e42526bfe504a236542b57a8c5b1bb44069ab644f33af7a2a549d6ca28e965 -->

At this earlier checkpoint the field map used DOM presentation, with blur removed, Escape, a keyboard focus loop and opener restoration; the field-record checkpoint above supersedes that presentation.

<!-- /coderabbit-ai-generated:v1 --> Screen transitions focus the new heading and reset stale scroll.

Twelve focused cases passed: all eight existing Marsh gameplay regressions plus desktop/mobile native journeys, partial-report fallback, and complete/partial report level growth. They cover both routes, no-ration recovery, skipped and visited detours, both ferry enemies, wisp victory/defeat/retreat, exact pressure/supply/reward costs, reload, unknown save fields, Old Road isolation, Endurance allocation and duplicate-settlement protection. No gameplay formulas, economy, canon or persistence ownership changed. Existing tests use supported reduced motion and a 120-second journey timeout; assertions remain intact.

Desktop1440×900, portrait390×844, landscape844×390 and DOM fallback screenshots were inspected in shared Chromium. An initial extra-paragraph guard failure and a visually obscured report image were repaired; final focused checks passed. Syntax checks cover 104 production scripts and 68 test specs. Broader release acceptance is still open.

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:ae62a4a9bb173ec4a438fa6d3503300892a28f7b1771c89731d8e3c8f8604fc3 -->

The subsequent field-record checkpoint above completes dedicated Marsh map and shell integration. Storehouse delve and regional combat acceptance remain next.

<!-- /coderabbit-ai-generated:v1 --> The umbrella Greyfen migration/release gate remains unchecked. Publication remains pending task permissions; this checkpoint is local to the assigned feature branch. Removing the dedicated painter restores DOM presentation and does not change saves.

## Bell Cellar battle and debrief — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The cellar debrief now uses the approved undercroft artwork through the production asset manifest. Its depth matches the four room screens: victory reaches 4/4 and defeat reports 3/4. Saved room indices remain 0–3; this is a display conversion in the cellar adapter. The generic result view continues to respect caller-supplied progress labels. A local panel also keeps tactical guidance below the combat commands readable over bright regional artwork, with the same treatment in DOM fallback.

Five focused cases pass across final checks and equivalent retained passes: real desktop/mobile victory and defeat with all four result return paths, live touch commands and retreat through rotation, the existing generic cellar-result contract, and the shared eight-control keyboard/touch/clipping/fallback check. Exact XP, gold, items, dungeon flags, road state and unknown saved fields remain covered. Direct town return retains its existing town assignment. Combat, rewards and storage calculations are unchanged.

Desktop, portrait, landscape and fallback battle/result screenshots were inspected in shared Chromium. Syntax checks pass for 103 production scripts and 67 test specs. Combined with the preceding room/reward checkpoint, Bell Cellar presentation is verified locally. Greyfen and the full first-three-towns/release journey remain open; publication is pending task permissions. Semantic DOM controls and complete fallback remain available.

## Bell Cellar rooms and rewards — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The existing entrance, locked stair, failed delve, four rooms, completed report and repeat-clear presentation now use a guarded dedicated Phaser painter. It paints the approved archive/undercroft/sentinel artwork, authored room text, equipment and health values, reward details and original choices. Every state's required controls and fields are checked before hiding duplicate DOM visuals; incomplete artwork or unknown copy restores the complete source view. The painter shares the shell clip and follows scrolling and rotation. Room transitions focus the heading and reset stale scroll while respecting an open growth dialog.

Verified repairs include the inherited town background covering native content, a gold Back-button gradient covering its label, and stale health after Endurance allocation from treasure rewards. Growth completion refreshes the report without collecting rewards again. The production dungeon owns all gate/lore/equipment checks, relic choices, combat callbacks, retreat, gold/XP/Buckle/Herb rewards and persistence; no balance or save schema changes were made.

Seven focused cases pass: desktop/mobile room and choice journeys with exact rewards, fallback/rotation/reload, locked/failed/repeat-clear states, treasure-to-growth refresh, and the three original unlock/retreat/boss-victory/defeat journeys. Existing full-journey cases needed a 180-second budget after the old 30-second limit expired; all assertions remain. Syntax checks pass for 103 production scripts and 66 test specs. Shared Chromium desktop, portrait, landscape and fallback screenshots were inspected with an unsaved clone; the original saved traveler was preserved.

This verifies room and treasure presentation. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:c0ff7611e607fcbc59c98b9c2d1194b97588499b20e92012966a608a1fa9476d -->

Bell Cellar combat/result presentation is verified in the later checkpoint above; Greyfen regional acceptance remains open.

<!-- /coderabbit-ai-generated:v1 --> Greyfen and full first-three-towns acceptance remain open. Publication is pending task permissions. Disabling the dedicated painter restores the original semantic DOM controls and presentation.

## Growth dialog — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The production level-up dialog now has a dedicated guarded Phaser painter for its approved backdrop/portrait, six attribute cards, current/draft values, point meter, explanations and all thirteen semantic controls. Complete-source preflight restores the styled DOM dialog if copy, controls or artwork are unavailable. Text follows measured source bounds and the panel's own scroll clip; mixed inline copy is painted as complete labels to avoid overlap.

The dialog traps keyboard focus, keeps background surfaces inert, moves focus when an allocation disables its control, and restores the report after confirmation. Touch targets are at least 44px, one panel scrollbar handles small screens, and the old backdrop blur is removed. Pending points survive reload without saving draft choices. Detached confirmation controls cannot apply growth twice. LegendLevelUpV152 retains allocation and persistence; XP, attribute effects, Endurance HP and reward formulas are unchanged, including unknown save properties.

Seven focused cases pass: desktop/mobile allocation and fallback, reload/replacement/landscape, the existing progression consumer, two real combat victory/growth handoffs and early expedition settlement/growth. Shared Chromium desktop, portrait, landscape and fallback screenshots were inspected. Syntax checks pass for 102 production scripts and 65 test specs. Full regional/release acceptance remains open; publication is pending task permissions. The original DOM renderer and callbacks remain the fallback, so disabling the dedicated growth painter restores the source presentation.

## Combat result presentation — 2026-11-13 (local)

<!-- /coderabbit-ai-generated:v1 -->

A dedicated production painter now reads the existing victory/defeat report and draws approved scene/actor artwork, complete reward and progression copy, and the original continue/return controls. It uses measured shell clipping and restores the complete DOM report when artwork, required actions or fields are missing. Results reset stale scroll and focus their heading while preserving an open growth dialog. Title line height accommodates complete glyphs; the authoritative multi-drop reward list replaces the misleading fixed “+1” badge.

Growth completion refreshes the displayed report without replaying settlement. The level-up dialog now initially focuses its first usable attribute control; its confirmation starts disabled. Damage, XP, loot, pressure, progression formulas and storage normalization remain in their existing owners. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:219f74d8f1b974fb9c68270843a06196775efa0c630c4f6597b7d5cd7e6d90de -->

Eight focused cases pass across final checks and equivalent retained results: real desktop/mobile victories with exact multi-drop rewards and Endurance growth, defeat/return, existing result and Bell Cellar callbacks, progression/default compatibility, and combat clipping. Desktop, portrait, landscape and DOM fallback screenshots were inspected. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:9aa82dbe03c626af602294deb845b676e983ef789637d3ad90702c290ac68857 -->

The growth dialog is verified in the later checkpoint above. Full regional combat-result acceptance and release/publication gates remain open.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

## Old Road combat presentation checkpoint — 2026-11-13 (local)

<!-- /coderabbit-ai-generated:v1 -->

The dedicated combat painter now renders the approved arena, traveler, enemy and portrait artwork below native nameplates and health meters. Complete labels use measured content boxes without fixed-height glyph cropping; equipment, HP and utility labels have separate semantic spans. Battle content shares the measured HUD, dock and drawer clip. The existing four-entry log uses the page scroll so its complete copy remains readable.

The original eight DOM controls and production combat callbacks remain authoritative. Missing artwork, controls, meters or unpaintable copy restore the complete DOM battle, and restored source nodes trigger recovery. Local desktop, 390px portrait and 844px landscape screenshots were inspected, including scrolled commands and DOM fallback. Focused checks cover touch, rotation, drawer masks, exact visible copy, potion/guard/intent updates, all eight live commands, retreat, pressure and preserved unknown save data. Fifteen existing combat compatibility checks pass, including damage, status, victory rewards and defeat handoff; those rule checks do not certify native result presentation.

This is an Old Road presentation checkpoint. Victory/defeat/loot/level-up presentation and regional battle acceptance remain open. No combat formulas, enemy balance, rewards, storage keys or normalization rules changed. Publication remains pending task permissions; this is not a claim that Bitbucket or GitHub main has been updated.

## Expedition regression checkpoint — 2026-11-13 (local)

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

All seven existing expedition-journal cases pass on the creation/readability repair revision: Mara's secured-report handoff, departure preparation and warnings, map/journal focus and saved discoveries, keyboard route selection, camp-watch ration/pressure persistence, poultice crafting and return reports, and the late-night Reed Cut encounter. The original reward, resource and progression assertions remain intact. This closes the pending journal regression batch; it does not complete the broader production suite or the central road scene/results migration. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:9bd69ae69dc8991a0c2ed67c4116c13b38f2a53aaf2fae2cd67e77a43b516442 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:fa461ca0a5ca844e4fa999a18064132f9f9d2bc5a66aa595234495e79cde1c9b -->

The following main-scene and expedition-result slices are verified in the checkpoints above; combat and broader release acceptance remain outstanding.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 --> Bitbucket-to-GitHub publication remains pending task permissions.

## Creation and returning-title readability — 2026-11-13 (local)

<!-- /coderabbit-ai-generated:v1 -->

Fixed the confirmed creation caption/step-counter wrapping, hidden fallback wordmark copied above the raster logo, cramped mobile presence caption, and excessive spacing inside choice descriptions. Creation labels now use explicit readable colors, measured content boxes, bounded glyph fitting and the source line height. Primary actions keep light text on a dark surface. Failed text or artwork painting restores the complete DOM presentation. The returning-player class/day/token summary fits its original card.

Seven focused checks pass across final and equivalent retained runs: all seven creation steps at desktop/mobile sizes, keyboard/touch and Back actions, exact existing-save preservation while drafting, text/art fallback recovery, creation observer locality and opening lifecycle, title scroll/resize fallback, and all returning-player title actions. Desktop, 390px portrait and 844px landscape creation screenshots and desktop/mobile title screenshots were inspected. Two runner processes ended with signal 143; the outstanding readability cases subsequently passed individually in attached terminals. No gameplay, storage, reward, story or controller rules changed. Original DOM controls remain authoritative. Long-name/zoom and broader migration/release gates remain open; expedition checkpoint work continues. Publication is still pending task permissions.

## Opening handoff stability — 2026-11-13 (local)

<!-- /coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:1ee792c215bf9d855968fcae758710b706e8f122ad6a71fb52d560967218307f -->

The native awakening could keep the title hidden when slow rendering stretched Phaser's animation clock. Its existing opening and fade durations now have browser-timer deadlines, with cancellation on skip/shutdown and one completion callback. The three mandatory annals, player saves and gameplay remain unchanged. Desktop/mobile stalled-clock regressions cover title recovery, cleared opening objects, a single ready event and entry into the mandatory annals. The original DOM loading screen is explicitly tested with the Phaser bridge download unavailable. This is a bounded startup repair; remaining migration and publishing gates stay open. Creation layout retries also follow browser time so completed CSS entrances, image loading and scrolling do not wait on a slow renderer clock. The animation regression now holds that clock still while checking native creation activation. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:383f6a78e5e91e802ef1e1bf4b87b96c088b8da0107f5853055639509424a7df -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:c029f8e4a0f5e6f0c1780f9e470eb7acf661c0734186b56d73e2eb913bfc9fbb -->

Earlier screenshot inspection found creation step-counter/caption wrapping and mobile text-spacing issues; the creation readability follow-up below repairs those confirmed defects.

<!-- /coderabbit-ai-generated:v1 --> The Oric prologue was also permanently falling back because its authored Old Road JPEG was compared with the South Fork texture. It now selects the existing matching texture and resumes its native painter after the background becomes opaque. Exact-art validation remains mandatory, and the creation-to-Oric regression verifies this handoff. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:54fa390e59f8cec23585625f1fa8f8b6f41007aaa0b686094322900cc909ca66 -->

Oric layout retries use the same cancellable browser scheduling. Visual verification then exposed transparent body colors, missing rule text and a dark action label in the previously inactive painter. The painter now uses explicit readable colors and guarded complete-text labels, gives headings matching browser/canvas line boxes, restores the full DOM view on failed fit, and follows document scrolling. Dedicated desktop/mobile checks cover actual painted copy, controls, fallback and preserved saved responses. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6adff0763d5e00edf89a6d5b049f09131a7505da0eff3808b7e86db3e8dc450d -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:bc750a4ffb4a32e93dda173bd1b7fa1a6e02cf747970d3ec2014b0066a82e1bd -->

At the preceding opening-handoff checkpoint, creation typography remained open. That checkpoint combined

<!-- /coderabbit-ai-generated:v1 --> seven fresh affected-journey checks with five equivalent boot/title passes: native copy and fallback at desktop/mobile sizes, creation lifecycle and controls, depleted departure, complete road-art parity, and Oric’s ACT tutorial through a secured expedition and return. Syntax checks pass for 98 production scripts and 59 specs; desktop/mobile prologue screenshots were inspected. The broader regression checkpoint and Bitbucket-to-GitHub publication remain outstanding.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

## Old Road readability repair — 2026-11-13 (local)

<!-- /coderabbit-ai-generated:v1 -->

Production inspection reproduced legacy opaque/blurred panels above Phaser text, cropped health and journey labels, and road content crossing the fixed HUD and action dock. Active road painters now clear those duplicate DOM backgrounds, fit complete labels with readable DOM recovery, and clip their content to the measured shell viewport. The map/journal foreground hides underlying road controls and keeps its close button outside that clip. Mobile header text no longer overlaps scene artwork.

Seven focused journeys pass across the final checks and an equivalent retained decision/detour/camp result. Coverage includes desktop/mobile text bounds, keyboard/touch, renderer and label fallback, exact route cost, preserved saves, map/journal return, and a corrected test that keeps the full first-session journey at 390px. Desktop, portrait, landscape, map and camp screenshots were inspected. Gameplay, reward, route and storage owners are unchanged. Full journey/decision acceptance, central scene/results migration, the broader regression checkpoint and publication remain open.

## Opening annals correction — 2026-11-13 (local)

<!-- /coderabbit-ai-generated:v1 -->

The third production annal now uses the exact approved “The Peace, Written Down” text from CANON, with the original closing quote and all three mandatory chapters preserved. Phaser text respects the quote’s content box and heading wrap boundaries; incomplete rendering restores the DOM surface. Continue labels stay on one line, decorative gold frames are removed, and keyboard focus retains a visible pale outline. Four focused production checks pass, including exact desktop/mobile copy, touch/keyboard handoff, fallback recovery and the full Oric opening. Desktop, portrait and landscape screenshots were inspected. Save keys, gameplay rules and progression owners are unchanged. Broader production regression and publication remain pending; this does not complete the migration.

## Title stability checkpoint — 2026-11-12 (local)

<!-- /coderabbit-ai-generated:v1 -->

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

## The player experience we are aiming for

<!-- /coderabbit-ai-generated:v1 -->

1. **The title draws the player into the world.** The correct title is **LEGEND: The Awakening**. The old “Roads of Ashmere” wordmark must not return. The menu should look like a fantasy RPG menu over a living scene, not a generic landing page.
2. **The opening makes the player curious.** A traveler wakes beneath a dead lantern on the Old Road. An unnamed voice (**???**) awakens them; its identity is not revealed yet. Captain Oric is tired, wary, and practical. A bell, the road, and a wolf attack establish the danger. Character choices should affect the traveler or dialogue rather than being cosmetic-only.
3. **The first tutorial teaches the real game.** The player should make a road choice, inspect a discovery, search, rest or prepare, fight using the actual turn-based commands, and understand how to return safely. Avoid replacing these actions with long instructional screens.
4. **Ashmere becomes a useful home.** Recovery, supplies, rumors, work, trading, crafting, equipment, journal, and expedition preparation should be easy to find. Rewards from a trip should create a meaningful next decision.
5. **The world expands one complete region at a time.** Ashmere, Greyfen, then Ironpass are the first three-town target. Each region needs its own identity and a complete loop, not just a backdrop and a few links.

## Non-negotiable guardrails

- **Protect the production game.** The current browser game is the source of truth while we improve it. Preserve existing save keys and player state. Do not replace gameplay systems, change combat formulas, reset saves, or alter account/cloud-save behavior as a shortcut. Any required migration must be deliberate, documented, and tested.
- **Use the current project incrementally.** Production Phaser migration was explicitly approved by the owner on 2026-11-03 and is underway. Phaser 4.1 is active as the persistent production world renderer, while most gameplay screens and rules remain in the existing browser modules. Move one complete playable surface at a time; the isolated reboot prototype is still a separate experiment, not a substitute for production parity.
- **Use approved raster art.** Follow the Runway-based art direction for new visual assets. Do not create an SVG title logo or use homemade geometric placeholders in place of character/world art. Keep menu labels and UI text as real accessible text, not baked into artwork. Do not ship watermarked preview images.
- **Keep the world visible.** World artwork should remain readable behind contextual panels. Scene lighting can be moody, but “dark fantasy” must not mean scenes are black or important art disappears. Keep text/cards readable without covering the whole environment in opaque layers.
- **Desktop first, mobile supported.** Target desktop around 1440×900 and check critical flows around 390px wide. No horizontal overflow, hover-only controls, or trapped menus.
- **Prove changes.** Source edits alone do not mean a task is done. Run focused tests and the relevant Playwright regression suite; inspect desktop/mobile screenshots when browser preview is available. Record any testing that could not be done.

## Roadmap — in priority order

### Phase 0 — Stabilize the current build and visibility fix
**Status: merged in v0.30.0; post-merge CI and live deployment verification are tracked separately.**

Fix the cross-screen scene darkness without creating new visual regressions. Cover the title, opening, Ashmere, Old Road, region view, combat, results, dungeon, and profile scenes. Keep the HUD and content legible while letting the artwork show through.

**Done means:**
- The latest-head Playwright run passes, or every remaining failure is investigated and resolved—not just bypassed.
- The title, prologue, town, road, combat, results, and profile visibility assertions match the actual rendered DOM/CSS.
- Desktop and narrow-screen layouts remain usable.
- The change is reviewed and merged before we treat it as part of production.

**Current checkpoint:** v0.30.0 integrates the translucent world-shell surfaces, the corrected two-dimensional portrait geometry assertion, and related CSS-alpha regression checks. The PR-level syntax gate passed; use the current `main` Actions run for the authoritative post-merge browser and Pages status. Keep scene art visible without sacrificing text contrast.

### Phase 1 — Make the title and opening feel like the start of a game
**Status: core flow shipped in v0.30.0; first-player comprehension still needs human playtesting.**

Replace the current unsatisfying title/menu experience with a deliberate fantasy-RPG composition and make the first minutes feel like an opening scene, not a form flow.

Scope:
- Keep the exact product title **LEGEND: The Awakening** and the approved raster wordmark.
- Show an atmospheric, visible world scene with subtle motion and lighting; remove awkward oversized shapes and other accidental decorations.
- Give Continue/Begin a clear primary place in the menu. Keep New Traveler, Profile, Settings, and Credits secondary but accessible.
- Use the anonymous soul-shaping/fragmented-memory character creation as a story moment where choices have understandable effects.
- Deliver the dead-lantern road opening with **???**, Oric, the bell, and the Blackroot Wolf. The three annals are mandatory: every new traveler receives the opening world/history context before character creation and the first road journey.
- Transition from the opening into the real game shell rather than landing on a separate-looking website page.

**Done means:** a new player can start from the title, create a traveler, experience the road opening and first encounter, and arrive at the next playable step without dead ends, broken branding, or static placeholder screens.

### Phase 2 — Make the world shell consistent and alive
**Status: shared shell and visibility pass shipped in v0.30.0; the Phaser production world renderer is now active, while full gameplay-surface migration remains in progress.**

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:91ff584e52789f0519b61ed0ed020734b441be103beb9f50fc80e54405dcdee9 -->

**Goal:** one cohesive presentation across Ashmere, the Old Road, and regional scenes.

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:55b17f1b46fd9084a486bfcce13468ce4e3af7907c6aa888f521d5475792805b -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:ff21d6bb5ffbb2547b931d30488901b194bef188317a0e69fcf1bfe2cd8bd59f -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:031f3d460078575006e9037e27192e2c99620d23bf0095916195c2b4c20a8f0e -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:91d9ca1a2ae44aeb843924f514d6eece31de8b938467ba90115318d72a6f8429 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:3172b0f99c902a13fb7c4100d6ec505655586e46119f8473526cdf0c89dee0ab -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:530808a47d94fdcd1a8c1bde921704747b87d2c6ee1094e0ae42622acb810966 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:309364566fd61fce8c260a796656978661b6dd0c1f71eb1b169db5d583a0c76d -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6fbc684fd21395c6210001d926443a4d1aaacb4e0698548245cf3df4e8eff397 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:a5e0fd2d243f5d162ece0eac1ff75915d8e08d50e3b77b9e2e1fb73ab02d4f1e -->

Local migration progress (2026-11-13): inventory, traveler sheet and shell notifications have dedicated guarded Phaser presentation. Original controls, semantic text, artwork, storage and navigation remain authoritative. Focused desktop/mobile tests cover complete records, scrolling, focus, regional return, unchanged saves, notification timing and fallback; desktop, portrait and landscape screenshots were inspected. Sheet artwork/native text now stay clear of the fixed HUD and dock. HUD/drawer text now wraps, numeric glyphs remain inside masks, and the duplicate token count is removed. The mobile HUD preserves LEGEND and readable location/vitals; town/service DOM art is clipped beneath the fixed shell and open drawers. Focused readability and first-session/Old Road drawer tests pass. Remaining combat/results/accessibility shell gates stay open while Ashmere service migration continues. Publication to main remains pending task permissions. Ashmere Inn and Greyfen’s Reedlight Inn now have complete guarded native presentation with production actions retained. Purchase feedback refreshes the visible purse and health immediately. Focused desktop/mobile tests verify exact costs, saves, rumors, keyboard/touch, regional return and fallback; both interiors were visually inspected. The Trading Post and Marsh Market now have guarded native buy/sell presentation with original economy callbacks, exact per-item sale rounding, disabled/empty states, preserved focus and functioning DOM fallback. Current desktop/mobile transaction and save checks passed. Removed geometric pennants resembling empty controls; Greyfen now uses its approved market artwork cropped free of the retired wordmark. Blacksmith and crafting now have guarded native presentation in both regions, with equipment comparisons, ingredient counts, disabled states and feedback. Exact purchase/equip/craft/save behavior and the Greyfen parcel trade have focused desktop/mobile coverage; original art/actions and styled DOM fallback remain. Work Board listings and all existing job types now have guarded native presentation in both regions. Abandoned job handlers/timers are canceled, navigation keys retain their actions, and results scroll clear of the dock without stealing level-up focus. Focused desktop/mobile checks cover exact rewards, saves, sequence isolation and fallback. Daily Field Board, caches and road contracts now have guarded native presentation. Focused checks verify exact claims, calendar rollover, all cache outcome bands, side reports, full saves, fallback and level-up focus at desktop/mobile sizes; expanded odds and feedback survive transactions. People directories and NPC conversations now have guarded native portraits, copy and focus with real character, ledger and return controls. Desktop/mobile checks preserve exact visit/evidence effects and full saves, including fallback and reload. Source entry no longer carries stale scroll into conversations, portraits show faces, and keyboard actions clear the bottom dock. The next step is a broader production regression checkpoint, followed by the unfinished Old Road journey/decision/scene/results gates; the broader daily-board integration release gate remains open. Existing recipe effects described as future work remain a separate release requirement. The shared compact HUD now gives location names a full row, keeps the next lead in landscape, and positions drawers/notifications below its measured height. Focused orientation, larger-text, keyboard/touch, full-save and renderer-failure fallback checks pass; desktop, portrait and landscape screenshots were inspected. The broader combat/results and accessibility shell gate remains open.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

Scope:
- Keep the current scene visible while journal, inventory, character sheet, services, dialogue, and settings open as consistent overlays or contextual panels.
- Standardize scene framing, lighting, panel transparency, typography, transitions, and action hierarchy.
- Make the route map and field journal reflect real saved discoveries and choices.
- Make travel/camp/return transitions deliberate and readable without forcing the player through unnecessary loading screens.
- Keep location actions contextual: town actions in town, expedition actions on the road, battle commands only during combat.

**Done means:** changing a panel or taking an action does not make the game feel like a different website; the scene remains readable, controls are consistent, and existing state/persistence tests pass.

### Phase 3 — Make combat feel like an actual turn-based battle
**Status: tactical foundation and Guard/stagger follow-through are implemented; balance and human playtest feedback remain.**

**Goal:** improve the presentation and decisions without replacing the production combat rules.

Scope:
- Preserve the established turn-based command structure and current formulas.
- Make enemy intent clear before the player acts; give each action a readable wind-up, strike/impact, reaction, and recovery where the available art supports it.
- Make Fight, Act, Item, Guard, retreat, enemy turns, and status/results understandable in the battle scene.
- Use scene framing, layered character art, brief impact feedback, sound where available, and restrained motion. Do not rely on characters merely “dancing” in place or on effects that obscure the action.
- Make victory, defeat, retreat, loot, and return hand back to the world with clear consequences.

**Done means:** a player can tell whose turn it is, what the enemy is about to do, what their action accomplished, and what changed after the fight—while deterministic combat and reward tests remain green.

### Phase 4 — Close the first-session progression loop
**Status: first loop shipped in v0.30.0; monitor long-run reward pacing and upgrade costs.**

**Goal:** make the first journey pay off in the rest of the game.

Scope:
- Connect the first road choices, encounters, discoveries, and evidence to actual journal/quest goals.
- Make the expedition report explain rewards, injuries, discoveries, and the next useful lead.
- Make gear, consumables, crafting, jobs, and preparation feed back into the next trip.
- Add clear level-up/results presentation when a real level is gained, including a deliberate stat/point-allocation choice if the current progression data supports it.
- Ensure player choices and progress survive reloads and another expedition.

**Done means:** from the opening, the player can complete a meaningful road trip, return to a town, understand what they earned, make at least one useful preparation/progression decision, and see that decision affect the next journey.

### Phase 5 — Finish the first three towns one at a time
**Target order: Ashmere → Greyfen → Ironpass.** Do not open the next region as a travel destination until it offers a real, coherent experience.

Each town/region should have:
- Distinct generated scene art and a clear mood.
- Working services and a coherent local economy.
- Named NPCs, readable dialogue, and at least one connected local story thread.
- Meaningful jobs/quests and choices that change a later encounter, discovery, or reward.
- A complete expedition or dungeon route with unique landmarks, threats, loot, and a return path.
- Region-specific progression rewards that connect to equipment, crafting, preparation, or unlocks.
- Save/load coverage and desktop/mobile checks.

Greyfen now includes the Ferry Nets work contract, the optional Silted Storehouse stop, and the existing Marsh Path survey, alongside earlier story/resource/equipment content. Its full story/economy/service gate and dedicated art still need review. Ironpass remains future content. A region is not “complete” merely because its hub screen exists.

**Done means:** the player can spend time in the region, take a meaningful quest or expedition, gain something region-specific, return to use it, and unlock the next step without hitting placeholder systems.

### Phase 6 — Expand only after the foundation proves itself
After the opening, world shell, combat, first-session progression, and first three towns work as a cohesive experience, add more enemy families, deeper dungeons, skills/magic, companions, and further regions based on what the playable loop actually needs.

The isolated reboot prototype can continue to answer specific questions about persistent animation or engine suitability. Do not migrate production data or swap engines just because a prototype looks promising; first demonstrate a complete playable slice and document a safe save/data migration plan.

## How we work from here

1. **One active player-facing slice at a time.** Keep its scope small enough to finish and test. New ideas go into a later phase rather than interrupting the active slice.
2. **Fix blockers before stacking polish on top.** A dark scene, broken transition, or failing core flow takes precedence over adding more features.
3. **Keep this file current.** When work starts, update its status and acceptance criteria. When the slice is verified, check it off and name the next priority. Avoid leaving old preview versions at the top as if they were current production work.
4. **Report the real state.** Separate code committed, tests passed, browser-reviewed, merged to main, and deployed. Do not describe a branch as live production until it has actually shipped.

## Supporting design documents

These contain deeper specifications, not competing task orders:

- [Art Direction](ART-DIRECTION.md) — palette, composition, raster assets, and integration rules.
- [Darkest Dungeon Creative Direction](DARKEST_DUNGEON_DIRECTION.md) — approved creative reference, screen-by-screen guidance, and no-copy boundaries.
- [Phaser Production Migration](PHASER_MIGRATION.md) — complete surface inventory and parity gates.
- [Opening Experience Redesign](OPENING_EXPERIENCE_REDESIGN.md) — detailed title, character creation, and opening beats.
- [First-Session Story Spine](ASHMERE_STORY_SPINE.md) — story continuity and the early journey.
- [World Bible](LEGEND_WORLD_BIBLE.md) and [Canon](CANON.md) — approved lore versus open proposals.
- [Architecture](ARCHITECTURE.md) and [Save Data Contract](SAVE_DATA_CONTRACT.md) — implementation and persistence boundaries.
- [Game Reboot Plan](LEGEND_GAME_REBOOT_PLAN.md) — an isolated future-facing proposal, not permission to replace production.
