# LEGEND — Phaser production migration

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:f9bdada3b7b915d2fe0ac719b816e207c03361ae71f8ea3f6f62e43a861f3991 -->

Updated: 2026-11-13

<!-- /coderabbit-ai-generated:v1 -->

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

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6ceee2ab509c5bc9c4b5dbd1b8f85565097dc1fd129559f5b96458eed36656ab -->

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

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:a7f560e5be8cc891ebddc6dc7b59be460015b322af142acae850a0c758b6eb93 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6d3c0b99a40c6453e96988d31e22973a9a5e748522f8a41fde71208e50c2a94c -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:f6e3c506a1c1b293e5584cb9f52d6d8a0782727e40d1a944a11cda78d9f8e3fd -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:ba9cf7e6507ac9ee637e5b287e53b41134787ed7afcb16bca8e57ae83c25b57d -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:5008c1ad9c1e3aa4e24af04abf8f327a56ebbf60d8ec1817555693d4ba1ccb24 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:7317a7a9b1d6044bba3acba4dd79bd97ea6e165d328a078ee99ee36e04fca49c -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:373ee5f4bc049bdc58467c3ea49912eda78d092d0caa2dac4b6f93dadf5614fd -->

## Production awakening readability — 2026-11-13 (verified locally)

The optional production world awakening now keeps the approved Ashmere panorama visible and uses the approved raster wordmark, readable copy and the original real Skip intro button. A dedicated guarded Phaser painter replaces the production black veil, rotating geometric seal, zoom, flash and delayed tiny text. The old native title menu is suppressed during this stage, preventing duplicate floating controls behind it. This repairs the conflict with ART-DIRECTION.md: darkness must not hide scenery, labels or controls. The early mystery reference is removed from the production cinematic; no new lore is introduced. The isolated prototype keeps its previous routine.

The existing browser-timer deadlines remain 4700ms plus a 620ms exit, or 450ms with reduced motion. Timing and navigation stay in RealmScene. The source panel and semantic skip control remain usable when native copy or artwork cannot paint; a missing presentation module proceeds safely to the title. The source wordmark has a text fallback. Tab and modifier keys no longer dismiss the screen accidentally; other existing key-to-skip behavior and touch/click remain available. Completion focuses Continue/Begin or restores the recovery heading. Document scroll stays locked during the intro, and the panel can scroll on small viewports.

Nine selected checks pass across fresh and equivalent retained results: desktop/mobile approved-art/control checks through all three mandatory annals and anonymous creation; returning-save/preferences/DOM fallback and reload; missing art/module handoff; reduced-motion/no-flash behavior; two stalled-clock deadlines; the existing normal first-visit/root handoff; and actual missing-storage recovery with restored heading focus and reload. Save keys, unknown properties, settings/audio/pending-return data, annal text and order, creation, gameplay and progression owners remain unchanged.

Shared Chromium screenshots were inspected at desktop 1440×900, portrait 390×844 and landscape 844×390, including large text, readable font, high contrast and DOM fallback. A temporary in-memory hold kept the actual production presentation open for screenshots; real natural/stalled/reduced-motion deadlines were tested separately. The initial screenshot documented the dark veil and duplicate menu; final screenshots show readable copy, no duplicate title, no backdrop blur and visible approved art. Preview returned to the normal title with the original preferences and all four stored values unchanged. Syntax checks cover 116 production scripts and 83 specs, with affected files rechecked after final focus/scroll repairs.

This closes the optional production awakening slice. Remaining overlay inventory (including scene transitions), full first-session/returning-save acceptance, dedicated Storehouse art and first-three-towns release gates remain open. Manual permissions still block PR creation, merging and production publishing. Removing the native painter retains its source panel; omitting the presentation module skips only this optional world awakening. The mandatory annals cannot be skipped.

## Cloud-slot confirmation — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The production Clear Cloud Slot action now opens an accessible in-game confirmation with dedicated Phaser panels, exact copy, focus frames and real semantic buttons. Keep Slot receives initial focus. Tab/Shift+Tab stay in the dialog; Escape, Keep Slot and backdrop cancellation preserve the cloud slot. Background controls are inert and document scrolling is locked until close. Focus returns to the opener. Missing or incomplete native presentation retains the full DOM dialog; a missing dialog module retains the original browser confirmation and its exact message.

This intentionally changes the confirmation presentation from a synchronous browser prompt to an asynchronous in-game dialog. The account controller serializes pending clearing requests, cancels when the source view leaves, checks the current account identity before deletion, and avoids navigating back to an old account screen after completion. The existing cloud service still owns the same user-scoped, slot-scoped delete and error feedback. Local player/settings/audio/pending-return saves, unknown fields, cloud save/load payloads, progression and gameplay remain unchanged.

Eight selected checks pass across fresh and equivalent retained results: desktop/mobile cancel/accept/focus/backdrop/retry matrices; changed-account and detached-view cancellation; pending-session validation and navigation; combined preferences/landscape/DOM fallback; missing-module browser confirmation; and both existing complete cloud-control journeys. Those journeys retain their original cloud payload, cancelled delete, accepted delete, failed save, denied local restore, successful restore and sign-out assertions. Cloud operations use isolated synthetic provider fixtures; real Supabase authentication/RLS is not claimed verified.

Visual inspection caught a legacy global button gradient covering native labels despite a passing paint snapshot. Scoped confirmation button styles now remove it, with explicit background-image assertions. A second interaction check reproduced document scrolling behind the modal; the dialog now owns a scroll lock and restores it on close. Shared Chromium desktop 1440×900, portrait 390×844 and landscape 844×390 screenshots were inspected, including large text, readable font, high contrast and complete DOM fallback. Preview used a synthetic in-memory provider, returned to the normal title, restored the original provider/preferences, and preserved all four stored values.

Only the cloud-slot confirmation slice is complete locally. The remaining cinematic/overlay audit, full first-session and returning-save migration gate, dedicated Storehouse art and first-three-towns release remain open. Manual task permissions still prevent PR creation, main merges and production publishing. Disabling the painter restores the DOM confirmation; omitting its controller module restores the original browser prompt.

## Artwork preload and startup fallback — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The actual production RealmScene now presents its artwork-download stage in Phaser before create(): approved title artwork and raster wordmark, the existing boot checks and exact text, plus a separate live artwork count and progress bar. The original DOM loader remains visible until the complete native surface can paint. Missing required artwork, a missing loading module, or unhandled copy keeps the source presentation. Slow downloads no longer leave an empty canvas or lose their loader when the independent DOM boot timer finishes. The system-check message no longer declares the realm ready while artwork is pending.

The existing 30-second startup watchdog, reduced-motion behavior, cinematic handoff, and mandatory annals remain authoritative. A confirmed pre-existing failure prevented that fallback when the Phaser CDN library was absent: the class declaration referenced Phaser.Scene before reaching the availability check. A safe declaration base now allows the existing DOM fallback to run. No player/settings/audio/return key, save normalization, gameplay callback or progression rule changed.

Nine selected checks pass across fresh and equivalent retained results: desktop/mobile delayed-download matrices; missing loader/required artwork; the actual 30-second watchdog; missing Phaser library with no script error and working title/settings; original DOM boot fallback; two stalled-animation handoffs; and the full configured-art inventory. Tests cover exact native/source text, live progress, unknown-copy fallback, preferences, landscape scrolling, saved extensions and navigation after release. An initial mobile expectation raced changing asset counts; atomic polling now compares the same state. Inspection also repaired a hidden wordmark fallback occupying layout space, a one-file count lag, and duplicate document/panel scrollbars.

Shared Chromium screenshots of the production painter were inspected at 1440×900, 390×844 and 844×390, including large text, readable font, high contrast and DOM fallback. These used a temporary in-memory presentation fixture to hold the stage open; delayed downloads and lifecycle were exercised by Playwright. Preview returned to the title with all four stored values unchanged. Static checks cover 113 production scripts and 81 specs, with changed-file syntax rechecked after repairs.

This closes the local artwork-preload slice. Confirmation dialogs, remaining overlay/cinematic presentation audit, the complete first-session/returning-save gate, dedicated Storehouse art and first-three-towns release remain open. Manual permissions still block PR creation, merging and production publishing. Omitting the preload painter retains the DOM loading surface and startup recovery.

## Bootstrap recovery screens — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The production missing-module screens now have dedicated guarded Phaser panels, complete explanations, focused reload/return controls and responsive clipping. Coverage includes missing title controller/view, storage, profile controller/view, settings, News & Roadmap, town and traveler-creation modules. The source DOM and original callbacks remain authoritative. The title-view and profile-view failures previously had no recovery button; they now expose Reload Game and Return to Title respectively. Missing town/creation modules say unavailable rather than implying that waiting will finish loading.

Recovery metadata only sets presentation and heading focus. The gameplay shell is excluded on these screens. Unknown or incomplete copy restores the full DOM, and missing Phaser retains the actionable source screen. Accessibility preferences apply to font, text size, weight, contrast and spacing. No save key, normalization, cloud/account service, combat, reward or progression rule changed.

Eleven selected checks pass across fresh and equivalent retained results: desktop/mobile recovery matrices; missing profile view; actual missing-storage startup and reload after its module returns; combined preferences and missing renderer; five existing script-order/bootstrap/navigation/storage-boundary cases; and the full returning-player title regression. Reload and return preserve raw player/settings/audio/pending-return data and unknown player fields. An initial case-sensitive expectation was corrected to compare rendered DOM text, including its existing uppercase style. The shell assertion was strengthened to check the actual shell class.

Visual inspection caught two real obstructions despite successful paint snapshots: a legacy full-page background and profile hero pseudo artwork covered the canvas copy. Scoped recovery styles now remove both, and regressions verify the transparent native surface and suppressed pseudo decoration. Shared Chromium desktop 1440×900, portrait 390×844 and landscape 844×390 screenshots were inspected, including high-contrast/large-text and DOM fallback. Preview module overrides/preferences were restored and saved values were unchanged.

This completes the bootstrap recovery slice. Early loading presentation, confirmation dialogs, remaining overlay inventory, full first-session/returning-save migration acceptance, dedicated Storehouse art and first-three-towns release gates remain open. Manual task permissions still prevent PR creation, merging and production publishing. Removing the recovery painter restores the source UI; the repaired buttons work independently.

## Title sound and audio-control acceptance — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

New and returning travelers can now mute or enable music and effects directly from the production title. The dedicated Phaser menu paints the Sound: On/Off text, selected state, disabled state and focus frame; the original button retains keyboard/touch activation and a stable Game sound accessible name with aria-pressed. The title audio facade calls the existing shared director and uses legend-road-sound, so title, road and combat stay on the same preference. Missing Phaser retains the usable DOM button; a missing audio module leaves an explicit disabled Sound unavailable control. No navigation, progression, economy or player-save owner changed.

Two startup/re-entry defects were found and fixed during verification: the title can render before the later deferred audio script, and a rebuilt logo can initially have zero height before its cached image loads. The control now synchronizes after deferred scripts finish, and the title painter retries on its source logo load/error. Missing text/art still restores the full DOM fallback. The new control has a 44px minimum target in landscape as well as portrait.

Ten selected tests pass on final inputs: desktop/mobile title sound, saved preferences and returning Greyfen saves; combined accessibility preferences and rejected writes; missing-renderer/audio fallback; existing title resize/art fallback; two real title-road-combat journeys; and original fresh-title/returning desktop/mobile navigation regressions. Existing audio-owner compatibility cases remain equivalent because the owner and persistence inputs are unchanged. Early new-test helper, fixture, touch-hover and stale-count failures were investigated and corrected while retaining the assertions; the re-entry test exposed the real missing logo-load retry described above.

Shared Chromium screenshots were inspected at 1440×900, 390×844 and 844×390, including focused On/Off controls, fresh/returning titles, accessibility preferences and DOM fallback. The final landscape target measures 44px and has no page overflow. Memory-only Preview fixtures were removed; raw player/settings/audio/pending-return values were unchanged. Browser playback state is verified; subjective listening quality is not claimed.

This closes the local title/road/combat audio-control gate. Remaining loading/error/confirmation overlays, full first-session/returning-save migration acceptance, dedicated Storehouse art and first-three-towns release gates remain open. Manual task permissions still block PR creation, merging and production publishing.

## Audio controls and storage failure — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The shared audio director now keeps a mute choice for the current page when browser storage rejects the preference write. Previously, toggling off returned false while the next title/road transition read the unchanged stored value and restarted both loops. A failed read retains the last known preference. Successful reads and writes retain the existing legend-road-sound contract; only off disables persisted audio, and unknown/missing values still mean on. A rejected write cannot survive reload; no new storage key is introduced.

Road and combat sound controls expose a stable Game sound accessible name and aria-pressed state, including retained road scene nodes. Native labels, focus frames and original production callbacks remain intact. Sound changes do not consume combat turns, change rewards or rewrite player saves.

Nine focused checks pass: four audio-owner contracts, two real desktop/mobile title-road-combat journeys, and three existing road presentation/discovery/fallback/responsive cases. The denied-write regression first failed against the original code, then passed after repair. A local validation recorder collision omitted the desktop event; its observed terminal pass was recovered with the same hashed inputs. The command exited1 for those two recorder errors despite all nine test cases passing; the local recorder matching now includes the describe path. No test assertion was removed or weakened.

Shared Chromium screenshots were inspected for focused road and combat sound controls at 1440×900 and390×844. Native text remained readable; the combat page had no horizontal overflow. The memory-only Preview fixture was removed and raw player/settings/audio/return state remained unchanged. Playback state was verified in the browser; subjective audio quality was not assessed.

The full audio acceptance gate remains open: the actual production title has no mute control, although it honors the existing preference. Next: expose the same audio owner through an accessible title control, then remaining overlays and complete first-session/returning-save gates. PR creation, merging and publication remain blocked by Manual task permissions.

## Profile and account presentation — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

The production profile/auth views now have dedicated Phaser panels, complete text, selected tabs, focused controls, disabled cloud actions and input frames. Browser-native inputs retain editing, validation, autofill, caret behavior and password masking; their values are excluded from canvas snapshots. Sign-in, signup, confirmation/failure feedback, profile editing, local Continue/New Traveler, two cloud slots and sign-out still invoke the existing account/auth/cloud services. Missing or unknown visible content restores the full DOM. <!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:c9921a72d0380c7b6230ffcac2adc9a7c6d2de22ffd000682372884efc40fa3f -->

Cloud-slot clearing now uses the dedicated in-game confirmation described above; the original native browser prompt remains the missing-module fallback.

<!-- /coderabbit-ai-generated:v1 -->

Entry now focuses the heading; completed actions focus and announce their feedback. Auth tabs expose selected state and Arrow/Home/End navigation, switching modes preserves focus on the replaced switch button, and password autocomplete matches sign-in versus signup. A cloud action-row background discovered during visual inspection was obscuring native labels; its scoped transparency and regression assertion now keep enabled and disabled actions readable. The original initial-letter avatars remain centered in their frames.

Eight focused checks pass: six new desktop/mobile authentication, profile, cloud-slot, offline, fallback and combined-accessibility cases; plus existing local persistence failure and full returning-title regressions. Tests use the real controllers with isolated synthetic provider fixtures. They cover confirmation-only signup, busy/failed/successful sign-in, profile metadata extensions, exact cloud payloads, cancelled and accepted clearing, failed saves, rejected local persistence during restore, retry, saved extensions and sign-out preservation. Unknown player/profile properties and unrelated settings/audio/return state remain preserved. Syntax checks pass for 110 production scripts and 77 test specs.

Shared Chromium desktop1440×900, portrait390×844 and landscape844×390 screenshots were inspected for sign-in/signup, signed-in profile, focused cloud controls, combined accessibility preferences and DOM fallback. No horizontal overflow was observed. Preview used a synthetic provider only for presentation, submitted no account/cloud mutations, and restored its original provider, preferences and title; raw player/settings/audio values were unchanged.

Live authenticated Supabase integration was not tested. The checksum-verified CodeRabbit emulate v0.0.1 source catalog has no Supabase auth/PostgREST service (its packaged CLI reports 0.10.0). The synthetic fixtures prove callback and UI behavior, not remote provider policies or email delivery. Auth/cloud/storage owner modules and their production configuration are unchanged. Removing the dedicated painter restores semantic DOM presentation with no save migration.

Next: remaining loading, error and confirmation overlays; reconcile existing defeat/result evidence and audio controls; then complete first-session/returning-save migration acceptance. First-three-towns and production publishing gates remain open. Manual task permissions still prevent PR creation and merging; this is a local branch checkpoint.

## News & Roadmap — 2026-11-13 (verified locally)

<!-- /coderabbit-ai-generated:v1 -->

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

## Current state

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

**Status: In progress**

- **Native in RealmScene:** persistent world environments and atmosphere; stage- and route-specific Old Road environment artwork; Ashmere landmarks; new-player title/menu; mandatory annals; traveler creation; Oric opening-road prologue/response/ambush presentation; persistent HUD; bottom action navigation; traveler journal/quest drawer; contextual action/POI drawer. These surfaces use Phaser presentation while preserving their existing semantic controls and production callbacks. The Old Road scene art is selected from the live expedition stage/route; its original DOM image stays visible whenever the loaded Phaser texture does not match.
- **DOM safety fallback:** the original semantic returning-player title remains visible during its finite entrance animation and while Phaser initializes; it also remains visible whenever Phaser is unavailable, a required asset/action/label is missing, or native painting fails. After the entrance pose settles and all required assets, production actions and live Phaser labels pass preflight, Phaser becomes the normal visual presentation while the DOM buttons remain the real accessible action targets.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:15ddcc4ff3168ecfdce335318d54392f06cfd7b0f504fd6c2c803cd390f752ed -->

- **Old Road recovery fallback (current):** expedition header/clock/tracker, route and decision cards, optional detours and camp actions have guarded native painters enabled in current main (`27c7afb5`); their semantic DOM remains the fallback. Full per-surface visual acceptance must still be established.

<!-- /coderabbit-ai-generated:v1 --> The connected map and field-journal modal now use a guarded Phaser painter for their framed surfaces and text while the semantic DOM buttons remain the real keyboard/touch actions. If the native mask, visible content or preflight fails, the complete styled DOM modal stays visible. The Phaser world scene remains active behind the expedition UI, including stage-/route-specific background art; the original scene image is hidden only after a matching Phaser texture passes preflight. All existing expedition handlers, route state, travel pressure, encounters, rewards, journals and save data remain authoritative. Re-enable each panel/map painter only after desktop/mobile visual parity, readable labels, keyboard focus, and end-to-end route/detour/camp/map/journal tests pass.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:4fc00c540f7a31f3795bdfc315fc4387b1d8d7d994371ef233dd7789f684a795 -->

- **Old Road battle presentation verified locally:** the RealmScene combat painter draws approved arena/actor artwork, meters, tactical panels, complete copy, intent/log and eight command surfaces under the shell clip. Original DOM controls remain the real actions and the complete fallback. Regional battle acceptance and combat result presentation remain open; see the combat checkpoint above.

<!-- /coderabbit-ai-generated:v1 -->
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
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:3e3633e00db8c460ad8ec9e5df0091917d080e2959045b648cf92d40b2f1eb7a -->

   - [ ] Road journey HUD (dedicated Phaser painter is enabled when its production regions are present; complete desktop/mobile text, focus and scrolling acceptance remains open).
   - [ ] Road decision deck (dedicated Phaser painter is enabled for the real expedition regions; original route, discovery, detour and camp handlers remain authoritative, and complete responsive interaction acceptance remains open).

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:e83728b7a28f03dc5ee8272b3b4876c8357098e065cd08a1dc3fbff630c82227 -->

   - [x] Main road scene presentation verified locally: native frame, source-matched art, location, discovery and sound controls; desktop/mobile/landscape checks, save preservation, keyboard/touch, responsive masks and DOM fallback pass. Publication remains pending task permissions.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:551c5077ea78c157da6bc99ae396faccb7cf8f56ba544503057703cf92d94a9f -->

   - [x] Expedition result presentation verified locally: native artwork, complete report/reward copy, meters, focus and original sound/return/Mara controls; desktop/mobile/landscape, exact settlement, growth refresh, scroll/clips and DOM fallback checks pass. Combat results, the broader release checkpoint and publication remain open.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
   - [ ] Keep route state, pressure, rewards, evidence and Road Token settlement in existing modules.

5. **Combat and progression**
   - [ ] Battle arena composition, actor/enemy presentation, intent and turn state.
   - [ ] FIGHT / ACT / ITEM / GUARD / retreat controls and battle log.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:0e6a4e219df25ccefdf5dfb9a75c0e2b8a9f506983d68da79afb4481a5e8c3af -->

   - [ ] Complete regional victory/defeat/retreat result and reward acceptance. Old Road victory/defeat and growth handoffs are verified in the local checkpoints above.
   - [x] Level-up/stat allocation verified locally: dedicated guarded copy/art/controls, keyboard/touch/scroll, saved pending points, draft reload, exact attribute/HP application, result handoffs and DOM fallback. Production publication remains pending.

<!-- /coderabbit-ai-generated:v1 -->
   - [ ] Keep damage, AI, status, loot and progression formulas unchanged during UI migration.

6. **Dungeons and regions**
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:f3db96f531cdb7fc7ddf6c977250be6d19b82ad3a34e9bdcfd4c04b63ccd0dcf -->

   - [x] Bell Cellar entrance, rooms, choices and treasure/report screens verified locally with original callbacks, exact rewards, growth refresh, responsive visuals and DOM fallback.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:645ee30b74300df4eb5539cf1930acffc2aae71be948e0252048005de456d74f -->

   - [x] Bell Cellar regional combat/result presentation verified locally: approved undercroft art, consistent four-room display, exact saved outcomes, all result return paths, live commands/retreat, desktop/mobile/landscape and DOM fallback. Production publication remains pending.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:34c1f3d70a776bb87e35548c9c38bc703811c58cb88270067bb956503a4893ec -->

   - [ ] Greyfen Marsh and Storehouse exploration, map, encounters and results.
   - [x] Marsh expedition decisions, status, salvage, shelter, evidence and reports verified locally with original callbacks, exact saved outcomes, growth, responsive visuals and DOM fallback.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:88093fbe2df437898f566eef0adb1c3dd681311aedeb1c0def33f024c28d938f -->

   - [x] Dedicated Marsh field map, saved field notes and persistent-shell integration verified locally with keyboard/touch, scrolling/rotation, lifecycle, readable labels, original settlement and DOM fallback.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:bf1875bc9bd730b14793243d81c8681a308732f38c8f9f5b6b3ff15d2af827bb -->

   - [x] Storehouse room/report presentation and save-extension preservation verified locally with original route, discovery, retreat and reward callbacks, desktop/mobile visuals and complete DOM fallback.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:392ef7315c51adf80712df810de758f03bbd75e6ae64a5815210536668fa0e3a -->

   - [x] Regional combat and encounter-result presentation verified locally with production commands, exact outcomes, desktop/mobile controls and DOM fallback.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6b218c0d0f88fe50c5584cb6abc4087507472fbc37510bc81db5afb14c7ccd27 -->

   - [x] Storehouse shell and regional encounter journal context verified locally, preserving saved records, Back/resume versus explicit retreat, normal-motion keyboard/touch controls and report Escape behavior.
   - [ ] Dedicated Storehouse interior artwork remains a release requirement.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:980d118a61fc5f479661006b12898545a94d1bbe2bccce5212331e0db66a716c -->

   - [x] Guarded region travel and locked-region presentation (local branch: regional ledger desktop/mobile interaction, costs, save preservation and visual checks pass; original artwork/semantic controls retained). Production publishing is still pending.

<!-- /coderabbit-ai-generated:v1 -->

7. **Remaining auxiliary screens**
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:2618b66f1df957efd377e2e7073c68c8b5f930001989f4ae3af07e871a8a8ce3 -->

   - [x] Settings and accessibility (local branch: both production surfaces, complete preferences, persistence/failure handling, desktop/mobile/landscape and DOM fallback verified). Production publishing is pending.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:f6781948b15495874ff8169b7ea3274b6ac8b0e181b2ebe95c5a7e8b55e743c7 -->

   - [x] Audio controls verified locally across title, road and combat: shared preference, native text/state/focus, keyboard/touch, reload, rejected storage writes and DOM fallback. Desktop/mobile/landscape screenshots inspected. Publication remains pending permissions.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:aad27fe0f9bd07877c943fe8e66da0245b82dbf79e43db8727208b1ea9b92884 -->

   - [x] Credits dialog (local branch: complete copy, modal focus, no blur, keyboard/touch, native/fallback and desktop/mobile/landscape verified). Production publishing is pending.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:b43aed73adf70254fba5a356aacc72cd78cfc5e934c023d7edc75f43750072db -->

   - [x] News/Roadmap (local branch: complete copy/artwork, original links, native focus, desktop/mobile/landscape, missing-texture recovery and save preservation verified). Production publishing is pending.
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:d4418d05c469c56c8f8bba6e1ebc8a0735ea202a41f6240ff2be771f9836bb26 -->

   - [x] Profile/account presentation (local branch: auth/profile/offline states, original callbacks, native browser input semantics, cloud-slot fixtures, save protection and desktop/mobile/landscape verified). Live authenticated Supabase integration is unverified; production publishing is pending.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:8a65b64646dcbdce4ec4d297f38fc17d318de79c4463ae79f80b299fc552b687 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:068a316870bccfe4617d07c5f14f5eb4c17187260df34eaa59620d1a07e15e94 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:9a5b2e72140d3f0d93a828c4077920d9be55f52b0b64236bccc82d1f81960e99 -->

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:0770cd5af060cc4d90a0395c2ef73a62cd5be4808141eb840f901e15cdd21b43 -->

   - [ ] Error, loading, confirmation, defeat and other overlays.
   - [x] Optional production world awakening verified locally: visible approved panorama/wordmark, complete native/DOM text, usable skip/focus, no dark veil or duplicate title, preserved deadlines, recovery handoff and mandatory annals. Remaining overlay inventory stays open.

<!-- /coderabbit-ai-generated:v1 -->
   - [x] Production cloud-slot confirmation verified locally: native/DOM copy and focus, keyboard/touch cancel/accept, scroll isolation, stale-request protection, original cloud service behavior and browser fallback. Remaining overlay/cinematic audit stays open.

<!-- /coderabbit-ai-generated:v1 -->
   - [x] Artwork preload verified locally: complete native copy/progress and approved art, responsive/accessibility layouts, delayed assets, DOM fallback and startup recovery. Confirmation and the remaining overlay/cinematic audit stay open.

<!-- /coderabbit-ai-generated:v1 -->
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:6cfe6fc81ffe18da1fc1aeae97d2de82afd521eb14c371b6744427a0e48c39ad -->

   - [x] Bootstrap recovery screens verified locally: missing module/storage explanations, original reload/return actions, Phaser copy/focus, DOM fallback, accessibility and preserved saves. The separate preload and cloud-confirmation slices are recorded above.

<!-- /coderabbit-ai-generated:v1 -->

<!-- /coderabbit-ai-generated:v1 -->

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
