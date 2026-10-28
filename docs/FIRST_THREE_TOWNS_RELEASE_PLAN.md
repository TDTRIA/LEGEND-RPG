# LEGEND: The Awakening — First Three Towns Release Plan

**Purpose:** define the content and quality gates for the first release that feels like a complete RPG rather than a collection of screens.

**Target scope:** Ashmere, the Old Road, Greyfen, and Ironpass. Blackwood and the Ruined March may remain visible as future destinations, but must not offer broken or misleading travel actions in this release.

**Status note (2026-10-28):** this remains a production release plan, not a claim that the first three towns are complete. Phases 7–10 are merged to main: the Silted Storehouse delve, peat-to-market parcel recipe, crossing-response choice with one-time route-pressure relief, and Greyfen-only Marshguard Coat. Dedicated Storehouse/coat artwork, manual desktop/mobile review, the remaining Greyfen economy/story/service acceptance gate, and Ironpass implementation remain open.

## 1. Design rules

1. **Complete loops before adding breadth.** A player must be able to prepare, accept work, leave town, explore, face risk, collect meaningful rewards, return, report findings, and use those rewards to prepare for a later outing.
2. **Towns are places, not dashboards.** Each town uses the same underlying navigation and save patterns, but has its own atmosphere, architecture, economy, people, and current problems.
3. **The main story must not depend on optional or random content.** Random encounters add variety. Critical quest evidence and route progression remain obtainable on authored paths.
4. **Choices show their cost.** Before commitment, communicate resource costs, pressure or health risk, travel time where relevant, and likely rewards. A missed optional reward must not soft-lock the player.
5. **Preserve existing saves.** Keep the production save key and existing player / expedition fields unless a deliberately reviewed migration is necessary. Additive state must normalize old saves safely.
6. **Honor the canon guardrails.** The first-session voice remains labelled “???”. Do not reveal the traveler’s hidden nature early, claim that every bell or road mark has a supernatural explanation, or turn every local conflict into the central awakening mystery.
7. **No false completion.** A screen or location is not done while it contains a dead control, placeholder quest, unimplemented service, reward that cannot be collected, or a visible promise of content that cannot be played.

## 2. Shared definition of “release complete”

Every one of the three towns must satisfy the following release gates.

### Town hub and services
- [ ] A strong town scene and readable nameplate establish its identity immediately.
- [ ] The hub communicates the current regional objective, active/ready-to-report quests, traveler condition, and useful next actions.
- [ ] Main destinations are grouped by purpose instead of adding a new equal-size tile for every system. Use a compact status/navigation strip and keep the most useful location actions prominent.
- [ ] Town service art stays inside its image and hit-target bounds at desktop and mobile widths.
- [ ] Services actually work: rest/supplies, trade, equipment, crafting where supported, people/dialogue, local work, quest reporting, and travel.
- [ ] No unfinished location within the first three towns is presented as a playable destination.

### Quest and narrative content
- [ ] One authored regional story chain with approximately 5–8 clear beats, including a beginning, at least one choice, a mid-chain consequence, a resolution, and a visible next lead.
- [ ] At least four local side activities/contracts, mixing in-town work and field objectives. At least two should be repeatable or support a reliable return loop.
- [ ] Each quest has readable objective text, clear completion conditions, saved progress, a report/claim step where appropriate, and rewards that match the promise.
- [ ] At least half of local conflicts and characters’ motivations can stand on their own without depending on the central awakening mystery.
- [ ] Dialogue and journal copy distinguish observed evidence from speculation. A clue must not prove more than it actually shows.

### Expedition and delve content
- [ ] One distinct regional expedition with named places, at least one consequential route choice, a safe pause/camp or equivalent preparation point, non-combat interactions, resource finds, and encounters.
- [ ] Optional detours can be skipped and do not block main-story evidence or successful completion.
- [ ] At least two useful enemy/encounter patterns, plus one authored high-stakes encounter or local climax.
- [ ] A compact, region-appropriate delve/dungeon is playable where the region’s content plan calls for one. It has an entrance, room/encounter progression, meaningful retreat or failure behavior, a conclusion, and saved rewards; do not build a disconnected prototype.
- [ ] The results screen reports route, discoveries, time/pressure where relevant, experience, gold, items, and level changes accurately.
- [ ] The map distinguishes current, reachable, visited, discovered-but-unvisited, and unknown places using text/symbols as well as color. It works with keyboard, touch, and at 390px width.

### Progression and economy
- [ ] Regional materials have clear sources and useful sinks in crafting, equipment, repairs, trading, or quests.
- [ ] At least one upgrade or recipe makes the player’s discoveries meaningfully useful before the next major expedition.
- [ ] Rewards are visible, saved, and claimable only once when the contract is one-time.
- [ ] XP/level-up choices and equipment matter in actual checks and combat, not only on the character sheet.
- [ ] Retreat and defeat preserve legitimate progress and never duplicate rewards or destroy an existing save.

### Quality and verification
- [ ] Fresh-traveler path and existing-save path both work.
- [ ] Story can be completed through every mandatory route variant; optional sites are separately tested as visited and skipped.
- [ ] Reload after a quest update, discovery, equipment change, reward, and level-up preserves the expected state.
- [ ] Desktop Chrome, Mobile Chrome, and Mobile Safari regression suites pass. Validate critical scenes visually at both wide and 390px layouts.
- [ ] Reduced-motion, focus visibility, dialogue readability, loading transitions, and no-horizontal-overflow behavior are verified.
- [ ] No key warnings/errors, unhandled promise rejections, or missing required assets remain in the tested production flow.

## 3. Town one — Ashmere and the Old Road

**Identity:** the road-facing lantern town and first home base. Warmth is practical: rest, repairs, honest work, rumors, and a gate to a dangerous road.

### Existing foundation
The repository already has the first-session “Dead Lantern” direction, Oric’s road tutorial, a five-leg Old Road expedition, High Ridge/Reed Cut choices, named discoveries and camps, Road Pressure and time, the field journal/map, Ashmere services and jobs, the first-return handoff to Mara, the Bell Cellar dungeon slice, and the “The Bell That Rang Once” evidence chain.

### Release work still required
- [ ] Finish and validate the connected Old Road topology from the Cowork redesign: South Fork, High Ridge/Ridgeway Cairn, Reed Cut/Lantern Ditch, optional Windbreak and Sunken Cart, Wayfarer’s Camp, Blackroot Bend, Reedwatch Shelter, and Greyfen Boundary.
- [ ] Keep Ridgeway Cairn, the Bell Fragment / blue-light evidence, Blackroot seal, and Greyfen boundary evidence on a reliable authored path; procedural events must not gate them.
- [ ] Ensure optional-site costs, time/pressure changes, rewards, journal notes, skipping, return-to-route, and the return to camp work across reloads.
- [ ] Complete the local side-contract loop: accept posting, meet objective, return/report, see a saved reward, and receive a follow-on lead.
- [ ] Finish the main Ashmere story beats through the current Greyfen handoff without prematurely explaining the Bell, light, Veil, or traveler.
- [ ] Keep the Bell Cellar as the first compact dungeon and make sure equipment, retreat, victory, defeat, and reward paths are all tested.
- [ ] Integrate Daily Field Contracts and Road Caches inside the Work Board. The hub must not need a separate competing Daily Board destination. Maintain the daily progress/reward behavior and show published cache odds before opening; keys remain earned through play.
- [ ] Close remaining visual issues in the panorama, service art, navigation placement, transitions, and loading/boot sequence.

### Ashmere release acceptance
A new player can finish the opening tutorial, learn at least one town service and one local job, choose either road branch, discover a required clue, optionally explore a detour or skip it, survive or retreat from combat, return with a correct report, advance “The Bell That Rang Once,” spend useful rewards, and start another expedition.

## 4. Town two — Greyfen

**Identity:** a working lowland settlement built around raised timber walks, stilted homes, shallow dark water, docks, peat stores, fishing, salvage, and practical knowledge about water levels. It must not feel like Ashmere with a blue color filter.

### Existing foundation
The repository contains Greyfen-specific hub/art/service patterns, the Bellkeeper’s Hall work board, the “A Dry Crossing” contract, local jobs for Dry Peat Bricks, salvage, and flood markers, regional travel gating, and a multi-step evidence trail involving the Boundary Stone, Reedwatch field note, crossing ledger, earlier weekly return, and missing closure order.

### Release work still required
- [ ] Make the full Greyfen hub/service loop coherent: landing, inn, market, smith/workbench, people, Boundary Archive, Work Board, and Marsh Path must have distinct jobs and usable exits. Phase 5 improves saved-evidence guidance and cross-region handoffs; the broader service acceptance sweep remains open.
- [x] Build a first true Marsh Path expedition with water-sensitive route decisions, Raised Posts vs. Reed Bed, optional Fallen Ferry salvage, a marsh encounter, shelter/rest, Waterline Gauge evidence, and an authored return/report (Phase 4 / PR #49).
- [x] Give the marsh expedition its own connected map and discoveries while reusing the production save framework (Phase 4 / PR #49).
- [ ] Add field activities and a small optional delve/site suited to the marsh (for example, a partially flooded storage or drainage location; the final name and exact layout are proposed, not locked).
- [ ] Extend the local resource loop around peat, salvage, fishing/ferry supplies, and repairs so the materials actually feed trade, crafting, equipment, or quest requirements.
  Phase 8 starts this work with a Greyfen-only Peat-Wrapped Parcel recipe that converts two Dry Peat Bricks and one Cloth Scrap into a sellable 34g-base-value Float Market parcel. The broader resource loop remains open.
  Phase 10 adds one Greyfen-exclusive armor purchase through the existing smithy: the level-2 Marshguard Coat (32 Defense for 280g). This improves local gear progression, but the broader resource loop and dedicated item art remain open.
- [ ] Complete the evidence chain consistently with the locked Greyfen direction: the Landing Warden reopened the lower crossing early under trade pressure, left the change unsigned because the crossing still needed inspection, and is a sympathetic wrong-doer rather than a villain. Build toward a player choice and practical consequence rather than inventing an unrelated culprit.
  Phase 9 starts that consequence with the provisional notice versus sealed-report decision. The Warden's full resolution and missing closure order remain open; neither response declares the Warden guilty or supplies a missing author.
- [ ] Make both outcomes of “A Dry Crossing” reliable: the safer path remains a dependable route to completion; the shortcut clearly states its probability, cost, and reward. A miss must leave the quest recoverable.
- [ ] Verify region gating: Greyfen-specific jobs, NPCs, resources, and story only appear in Greyfen; Ashmere-only content must not run by accident.

### Greyfen release acceptance
After Ashmere, the player can arrive in Greyfen, understand its distinct economy, take and finish “A Dry Crossing,” explore either the safer or riskier marsh route, earn and use a Greyfen resource, return to a local NPC to advance the story, and choose how to resolve the Warden’s responsibility without being forced into one moral response.

**Quality gate:** do not begin Ironpass content implementation until Greyfen’s art, services, core loop, quest resolution, save/load, and regression checks are coherent.

## 5. Town three — Ironpass

**Status:** not yet a playable town. The content below is a proposal for planning and implementation, not existing shipped content.

**Identity:** a mountain-pass and freight settlement of narrow ledges, cut steps, old mine galleries, timber supports, freight yards, switchback roads, snowmelt channels, and shelters positioned to let loaded travelers stop safely. Its tension comes from weight, weather, time, repairs, and competing ideas of which cargo and route risk should be accepted.

### Proposed first-release content
- [ ] Distinct Ironpass hub scene, palette, local soundscape, NPC cast, working economy, and service art. Suggested service roles: pass/freight office, inn/shelter, ore market, forge/repair bench, local work board, and route gate. Names are placeholders until approved.
- [ ] One regional story chain about a practical pass problem under rising monster-incursion pressure: a route inspection or freight failure, who bears the cost of delay, and whether the player prioritizes safe passage, a promised delivery, or a repair obligation. Keep the conflict local and do not introduce an unapproved central-lore revelation.
- [ ] A primary pass expedition with at least two understandable approaches, such as an inspected switchback/loaded route and a riskier shortcut or old gallery. Show load, weather/time, pressure, and resource consequences before commitment.
- [ ] An optional stop where the player can inspect a support, shelter, or freight trace, receive useful information, or move on without blocking the main quest.
- [ ] A compact old-gallery delve as the region’s first dungeon: readable rooms, mining/structural hazards, regional enemies, a meaningful retreat point, one local climax, and useful ore/gear or a key quest item.
- [ ] Local jobs that express the place: inspect a support, sort or move freight, repair gear, escort a short shipment, or reconcile a cargo/inspection record. These are proposed activities; tune the final set to what can be fully implemented and tested.
- [ ] A local material economy, at least one useful recipe or gear upgrade, distinct enemy/encounter behaviors, and rewards that prepare the player for a later Ironpass outing.
- [ ] Region unlock remains earned through the existing progression and completed Greyfen milestone; no enabled Ironpass destination until its hub and launch path are actually playable.

### Ironpass release acceptance
A player who completes Greyfen can unlock Ironpass, understand the freight/pass stakes, accept local work, make a meaningful route-risk decision, complete the primary expedition, enter and retreat from the compact delve, return to town, collect the promised reward, and use a local resource or upgrade to prepare for another outing.

## 6. Daily Field Board and Road Caches

This is a shared, reusable activity system exposed from each town’s **Work Board**, rather than a standalone hub tile.

- [ ] Show the daily reset date, three clear objectives, progress, claim state, reward amounts, and a route into relevant gameplay.
- [ ] In Greyfen and Ironpass, include region-specific tasks only when that town and objective are unlocked. Never assign a daily objective to a location or system the traveler cannot access.
- [ ] Keep local one-time/longer contracts distinct from resettable daily contracts.
- [ ] Cache keys remain earned only through gameplay. Keep cache odds visible before opening and make the item/coin/token outcome explicit after opening.
- [ ] Daily progress and claimed rewards remain saved across reloads and cannot be claimed twice.
- [ ] A daily task should encourage the natural game loop, not require repetitive grinding or obscure hidden counters.

## 7. Shared town-hub direction

Use one consistent scene-first layout framework, with region-specific identity and content.

1. **Town scene:** an evocative panorama/location art, town name and one-line identity, local ambience, and a compact traveler-status strip.
2. **Current lead:** one prominent current story objective or ready-to-report notice, with an obvious next action. Do not let daily tasks outrank urgent authored story beats.
3. **Places to visit:** a concise set of named locations grouped by purpose (people/story, services, work, expedition/travel). Each gets one clear promise and local art that fits its frame. Avoid adding another tile for every new mechanic.
4. **Notice board:** Daily Field Contracts, Road Cache, and local work live inside the Work Board. Side stories and evidence remain available through their proper NPC/archive paths.
5. **Navigation:** a compact strip for home/people/routes/journal/traveler rather than the old visually heavy bottom-tab treatment. Make the active town and destination obvious on desktop and mobile.
6. **Shared interaction contract:** transitions, loading treatment, focus behavior, sound/motion preference, back/return behavior, save persistence, and error handling stay consistent across towns.

The shared shell must not erase differences: Ashmere is road-facing and lantern-warm; Greyfen is water-facing and work-driven; Ironpass is vertical, industrial, and governed by load/weather/repair constraints.

## 8. Build sequence and release gates

### Gate A — Stabilize the existing base
- [ ] Merge the raster-art/daily-board work only after full browser regression passes.
- [ ] Validate the attribute-growth and results work as a clean branch off the new main, not as a stacked duplicate of the art PR.
- [ ] Complete the connected Old Road map and optional stops, then verify story-critical route evidence, save compatibility, mobile, and skips.

### Gate B — Complete Ashmere 1.0
- [ ] The full opening-to-return loop is playable without developer setup or manually seeded saves.
- [ ] Required side contracts, Work Board, daily tasks, Bell Cellar, gear loop, main story handoff, and repeat expedition all pass save/reload and browser tests.

### Gate C — Complete Greyfen
- [ ] Hub, services, Marsh Path expedition, quest-chain resolution, economy, optional site, and regional gates pass the Greyfen-specific acceptance criteria above.
- [ ] Only start Ironpass when this gate is green.

### Gate D — Build and validate Ironpass
- [ ] Create its hub/services, main quest, pass expedition, optional stop, compact delve, materials/gear loop, and saved return/report.
- [ ] All travel/unlock paths, quest states, rewards, combat exits, mobile layout, and save/reload flows pass regression.

### Gate E — Whole-game first-three-town playthrough
- [ ] Complete one end-to-end fresh-save run: Dead Lantern → Ashmere → Old Road → Bell Cellar → Greyfen → Marsh Path → Ironpass → Pass Expedition/Delve.
- [ ] Repeat the route using alternate route choices and at least one optional-site skip in each expedition.
- [ ] Confirm required evidence remains reachable, daily tasks remain claimable, old saves survive upgrades, and no first-three-town flow ends in a dead button or unavailable feature.
- [ ] Playtest the complete loop at realistic pace before calling the first three towns release-ready.

**Release decision:** these gates, not the presence of a hub image or a completed design document, determine whether each town is finished.


## Phase 5 — Greyfen investigation guidance and town handoffs

- [x] Make the town’s Current Route card follow the saved evidence stage before repeating the generic A Dry Crossing prompt.
- [x] Add explicit handoffs for the Blackroot seal → boundary stone → Reedwatch note → crossing ledger → earlier weekly return → Mara’s evidence filing chain.
- [x] Route cross-region stages through the existing Road Network when the player must return to Ashmere/Old Road or travel back to Greyfen.
- [x] Give the final filed-evidence state a working Boundary Archive review action while keeping the missing closure order unresolved.
- [ ] Continue the playable case beyond the missing-closure-order lead after the next clue and player-response beats are defined; do not reveal the Warden by assumption.
- [ ] Complete the entire Greyfen service/resource loop and test save/reload at each handoff.
