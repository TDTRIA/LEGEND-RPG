# LEGEND — Dark Fantasy Rebuild Plan

**Status:** Implementation plan based on the owner's direction, 2026-11-17.  
**Creative authority:** [Darkest Dungeon Creative Direction](DARKEST_DUNGEON_DIRECTION.md)  
**Story authority:** [CANON.md](CANON.md)  
**Save authority:** [SAVE_DATA_CONTRACT.md](SAVE_DATA_CONTRACT.md)  
**Runtime authority:** [PHASER_MIGRATION.md](PHASER_MIGRATION.md)

## Current implementation checkpoint — 2026-11-21

The active implementation is PR [#148 — Rebuild Ashmere as a scene-led dark fantasy refuge](https://github.com/TDTRIA/LEGEND-RPG/pull/148), branch `feat/ashmere-hub-dark-fantasy-v240`. The branch has now been reconciled with the latest `main`; do not merge until the new post-sync Playwright run passes and the first hub's desktop/mobile acceptance checks are complete.

The Ashmere hub is implemented as a full-scene refuge, not a dashboard surrounded by the persistent World Shell. It uses the existing Ashmere street, Inn, Market, Forge, Oric and Old Road artwork; shows compact traveler condition and the current field order; gives the Inn, Market, Forge and Town Square/People four clear destinations; prioritizes the Old Road Gate; and puts secondary destinations behind the `Other places in Ashmere` disclosure. It routes through the existing Ashmere controller and service catalogue. The shell is retired on this hub only; service interiors and the Old Road keep their current presentation until their own replacements are accepted.

### Integration and current technical boundary

- Mainline #144 intentionally removed the old local Oric portrait PNG. Keep the authoritative registry `js/systems/assets-v090.js` from `main`; the hub and people screens use `assets/generated/npcs/captain-oric.webp`. Do not restore `assets/npcs/ashmere/npc_oric_portrait_v1.png`.
- The DOM-first engineering direction in `AI_HANDOFF.md` is authoritative: DOM owns readable text, menus, buttons, dialogs, HUD and other interaction surfaces. Phaser owns world/scene art, lighting, atmosphere, camera movement and transitions. Do not add a pixel copy of DOM UI or another always-on shell.
- The 2026-11-21 pre-correction CI run had 25 passing / 6 failing checks. Causes were stale Oric artwork expectations, a stale title-brightness assertion (old `0.76`; actual `0.66`), and long Ashmere end-to-end setup flows exceeding the default 30-second test budget. The test expectations and two focused test budgets have been corrected; the post-sync CI run is the release gate.
- These corrections and the hub are presentation/test changes only. They do not change the save key/schema, player data, story canon, town service handlers, expedition rules, combat formulas, reward probabilities, or progression.

### Next steps

1. Verify the post-sync Ashmere hub, Daily Field Board, Old Road, save-preservation and regression Playwright run.
2. Visually inspect the hub at desktop, portrait mobile and landscape mobile, plus keyboard/touch navigation and reduced motion.
3. Complete **Surface 2 — Expeditions**: the first information-hierarchy pass now places the full journey clock/route history and optional detours behind native, keyboard-accessible disclosures. The next pass should refine the active event/decision composition and compact status display while keeping Map/Journal deliberate tools. Preserve every route, camp, detour, clue, hazard, contract, combat, return path, reward and partially completed save.
4. After the road presentation is stable, redesign tactical combat presentation while keeping the existing combat engine authoritative.
5. Specify and implement party, stress/resolve and torchlight one at a time with save defaults, explicit balancing, accessibility and dedicated tests. Do not import Darkest Dungeon's names, art or text.

## The purpose

Rebuild the playable experience so it feels like one dark-fantasy RPG rather than a legacy web game surrounded by a persistent interface shell. The Ashmere refuge, expeditions, combat, quests, character relationships, and story discoveries must share one visual language and one coherent rhythm.

This is a staged rebuild of presentation and selected approved systems. It is not permission to discard the production game's writing, saves, content, formulas, reward tables, navigation, or accessibility.

## Non-negotiable boundaries

- Keep the active save key `legend-roads-of-ashmere-v09`, `LegendStorage`, the normalizer, and all unknown player fields intact. New fields need defaults and an entry in `SAVE_DATA_CONTRACT.md`.
- Keep the existing production controllers as the source of truth. Do not create parallel town, expedition, combat, quest, reward, or persistence systems.
- Keep all existing town services, daily work, contracts, maps, journals, Bell Cellar, Greyfen, route choices, side stories, and story evidence reachable.
- Maintain semantic controls, accessible labels, keyboard/touch access, mobile layouts, focus states, reduced-motion behavior, and DOM fallbacks while Phaser presentation is migrated.
- Retire the World Shell one complete surface at a time. A screen must have its own tested navigation, status, contextual actions, and accessible fallback before the shell is disabled for it.
- Dark presentation must remain legible. No full-screen blur, black veil, or stacked panels that obscure the scene.
- Darkest Dungeon is a creative reference only. All art, writing, names, sounds, iconography, compositions, and mechanic vocabulary must remain LEGEND's own.

## Visual identity

**Ashmere is refuge; the road is the cost of leaving it.**

The shared palette is weathered charcoal, cold slate, soot, damp timber, old stone, parchment, dull iron, moss, muted oxblood, and restrained lamp-gold. Ashmere uses warm windows, firelight, human silhouettes, practical notice boards, and lived-in streets. The Old Road uses weather, distance, silhouettes, route landmarks, and pockets of scarce light. Dungeons and battle spaces get their own focal point, not another generic dark panel.

Use existing approved LEGEND artwork first. HTML and Phaser should work together: Phaser provides the world, light, camera and scene atmosphere; readable live text and accessible controls remain real interface content.

## Surface 1 — Ashmere refuge

**First implementation slice.**

Replace the card-grid town dashboard with a scene-led Ashmere hub that feels like a place the traveler has returned to.

The screen should have:
- A full-scene Ashmere panorama, with a subtle, readable location identity and the current traveler.
- A compact condition/resource line: health, gold, day and Road Tokens. No duplicate global HUD, side drawers, or bottom world-shell navigation.
- One concise current field order from the existing Ashmere guidance service. Show one next step, not the entire quest journal.
- A small number of unmistakable illustrated destinations: Inn, Market, Forge & Workshop, and Town Square/People.
- A prominent Old Road Gate departure point.
- Secondary places (Work Board, Daily Field Board, Bell Cellar when unlocked, Road Network, and other catalog destinations) behind a clearly named, compact town-services disclosure rather than filling the opening view.
- Existing NPC dialogue, service handlers, cost checks, job boards, contracts, region gates and destination catalog remain authoritative.

The new Ashmere root opts out of the persistent World Shell. Greyfen and all other current gameplay screens retain their existing shell treatment until their own replacements pass acceptance.

### Ashmere acceptance

- Fresh and returning travelers land in the new Ashmere scene without losing or changing any save data.
- Every Ashmere destination currently provided by `LegendAshmereDestinationCatalogV099` remains reachable.
- The current goal and CTA come from `LegendAshmereGuidanceV099`; no competing duplicate quest summary is added.
- The Old Road Gate still opens the existing departure briefing and current `LegendRoadControllerV100`.
- Town Square still reaches the established Mara, Brenn and Oric dialogue.
- The persistent World Shell and its HUD/drawers are absent on this hub only.
- Greyfen remains on its existing hub and tests.
- Desktop, portrait mobile, landscape mobile, keyboard, screen-reader names, and reduced-motion paths pass.

## Surface 2 — Expeditions

**Second implementation slice; preserve the current road rules while changing the rhythm and information hierarchy.** The first low-risk UI pass keeps journey time/history and optional detours available through collapsed native disclosures, leaving the current location and active decision in the foreground.

The Old Road should feel like one continuous journey. The player should see the place they are in, the route context, their immediate condition, and the one meaningful decision in front of them. The whole system should not be visible at once.

Proposed presentation:
- A broad location scene with clear route and stage identity.
- A compact journey strip for route, stage, pressure and carried supplies. New torchlight presentation is added only with its own complete system.
- One active encounter/event card at a time. A discovery appears in context when it is found; it does not remain as a large permanent panel above the scene.
- A deliberate Journal/Map control opens field records only when requested.
- Camps, optional detours, route forks, hazards, field contracts, combat, and return decisions retain their existing rules and callbacks.
- A concise expedition report records the route, discoveries, consequences, resources spent, loot, XP, rewards and next lead. No rewards or evidence are fabricated.

The current Old Road graph, High Ridge/Reed Cut choice, Road Pressure, Wayfarer's Camp, Windbreak/Sunken Cart detours, Blackroot survey, moved cairn choice, Bell evidence, and Greyfen-boundary path are preserved.

### Expedition acceptance

- Every existing stage, route, detour, event, clue, camp action, contract, and return remains reachable.
- Discovery text is contextual and recorded in the field journal; the large always-on discovery box is removed.
- Map and Journal work as focused overlays and can be closed with keyboard and touch.
- No action, event, or report settles twice after refresh or return.
- Current pressure, time, inventory, route and node state remain unchanged by presentation-only changes.
- Existing saves with partially completed expeditions resume safely.

## Surface 3 — Tactical combat

**Third implementation slice. Start with presentation and tactical clarity; introduce approved systems in isolated, tested increments.**

The battlefield should read at a glance: combatants, formations, whose turn it is, enemy intent, status, available actions, and the result of the last action. Reduce permanent status boxes and let the battle scene carry the moment.

Keep the existing combat owner `js/systems/road/road-combat-v100.js` as the sole action, damage, status, enemy behavior, retreat and reward authority. The first presentation pass does not change formulas or balance.

### Approved additions

- **Party formation:** traveler plus up to four established Ashmere companions, ordered by rank. Rank governs reachability and possible actions. Mara Vell, Old Brenn and Captain Oric are the initial companion candidates; future additions must be established characters.
- **Downed, not dead:** companions who are defeated are carried home and recover through existing Ashmere services. Permanent death is not approved.
- **Stress and resolve:** stress may build from danger, darkness, injuries and party circumstances. At a defined threshold, a resolve outcome can grant a LEGEND-authored affliction or virtue that changes behavior.
- **Torchlight:** light drains as the party travels and can be restored by consuming torches. Brightness trades safety and lower stress against poorer finds; darkness raises danger and potential reward. The same value drives the Phaser world atmosphere.

Each system needs its own detailed design document with exact numbers, thresholds, persistence defaults, failure cases, accessibility and tests before implementation. Extend the current combat and road-state owners; do not create a second engine.

### Not approved by this plan

Permanent companion death, corpses, hunger, diseases, quirks, new camping/rest mechanics, loot-rule overrides, and unapproved changes to current combat formulas, enemy behavior, reward probabilities or progression.

## Surface 4 — Quests and story integration

Quests must feel like work people in Ashmere and the regions genuinely need done. They should lead naturally into expeditions, conversations, evidence, consequences and return visits.

Use the existing cast's established functions:
- **Mara Vell:** interpretation and careful evidence; she helps distinguish observation from conclusion.
- **Old Brenn:** records, obligations, proof and practical accountability.
- **Captain Oric:** survival, preparation, watch and road guidance.
- **Sella Marr:** care, shelter and the needs of ordinary people.

Preserve the existing Bell/Old Road and Greyfen crossing evidence chain. The player should report discoveries to the right person; clues should not leap ahead of what was actually found. Work Board and Daily Field Board objectives remain separate from the central story when appropriate, and optional contracts should not be required to understand the main arc unless the owner later decides otherwise.

### Canon guardrails

- The traveler's nature, the Veil's identity, and the apprentice connection remain hidden from player-facing text until a separate reveal plan is approved.
- The traveler-creation presence is shown only as `???`.
- The mandatory opening annals cover the old war and the seal only. Use the already approved replacement text exactly when that separate implementation is scheduled.
- The Hollow Saint first meets the traveler around the midpoint and persuades rather than fights. Before that, use only appropriately ambiguous clues, rumors and echoes.
- The Hollow Saint's offer and the final wound/ending truth are not early-game exposition.
- Tavin's return follows L16: chance arrival alone, public recognition and immediate embrace; he earns a role through later work, not instant appointment. The timing, trigger and precise scene sequence remain open.
- Oric's former life emerges gradually through evidence and quiet conversations after difficult journeys. Do not compress it into a single exposition scene.
- Do not use placeholder names/locations from brackets in CANON.md as player-facing content.

## Delivery order

1. Ashmere hub and shell retirement for Ashmere only.
2. Expedition scene and information hierarchy, preserving all existing journey state and events.
3. Combat visual redesign and tactical readability, preserving the current combat engine.
4. Separate approved system specs and implementation for party, stress/resolve and torchlight, one complete system at a time.
5. Quest/story integration pass that connects the above through existing canon and NPC relationships.
6. Retire remaining World Shell surfaces only after each replacement has full navigation and accessibility parity.

## Release gates

Every surface must pass:
- Source/behavior audit before implementation.
- Focused Playwright tests for desktop and mobile, keyboard/touch, save safety and all important actions.
- Visual inspection at desktop, portrait and landscape sizes.
- Existing production regression suite and live Pages smoke test.
- Explicit comparison of player/save data before and after journeys.
- Fallback verification when art, Phaser, or an optional module fails.

A surface is not done because it looks finished. It is done when the real game can be played through it without losing content, controls, state, or story continuity.
