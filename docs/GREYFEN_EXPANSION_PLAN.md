# Greyfen Expansion Plan

## Priority
Greyfen is the active milestone. Do not begin Ironpass implementation until Greyfen's art, services, core loop, and regression checks are coherent.

## Identity
Greyfen is a working lowland marsh settlement: raised timber walks, stilted homes, low bridges, reed roofs, fishing platforms, peat stores, lantern docks, dark shallow water, and weathered stone footings. Palette: marsh green, wet charcoal timber, cold slate, muddy umber, tarnished brass, small amber lights. Quiet unease, not horror. Ashmere is a road-facing lantern town; Greyfen is a water-facing working town.

## Locations
- Reedgate landing: arrival, route orientation, marsh safety.
- The Silted Cup: rest, rumors, local guidance.
- Float Market: supplies, salvage, buying and selling.
- The Drowned Anvil: equipment and blacksmith services.
- Boundary Archive: flood marks, old route records, lore.
- Work Board: repeatable local contracts.
- Marsh Path: local expedition/travel exit, respecting region rules.
- The Silted Storehouse: optional three-room delve below the waterline, available after A Dry Crossing.

Reuse existing town, market, smithy, archive, inventory, quest, and travel systems. Prefer existing data patterns over a parallel implementation.

## Optional delve — The Silted Storehouse (Phase 7 merged)

Merged into `main` in commit [`c09f09d`](https://github.com/TDTRIA/LEGEND-RPG/commit/c09f09d9a05826c505029df8147e583ddcab0b79).

- The location is gated by the existing `greyfenDryCrossingComplete` flag.
- The loading walk offers a safer upper-shelf route or a riskier cargo-sump route. The sump costs 6 HP (never below 1) and awards a Road Herb.
- The records bay can preserve a damp dispatch whose authorization leaf is missing and recover one Dry Peat Brick plus Lamp Oil from a sealed crate. The salvage reward is one-time across attempts and reloads.
- The inner bay uses production dungeon combat handlers for victory, defeat, and retreat. State is saved separately in `flags.greyfenStorehouseV170`, without resetting or advancing Old Road state.
- After the main crossing evidence is filed, Mara can append the dispatch as supplemental context. It does not identify who authorized the temporary route exception.
- Current production presentation reuses the committed Greyfen Marsh Walkway art. A dedicated Storehouse illustration and manual desktop/mobile visual review remain polish tasks.

The delve is playable, but does not by itself complete Greyfen’s town, resource economy, story chain, or release acceptance.

## Phase 8 — Greyfen resource-to-market loop

- The Greyfen Marsh Workbench now offers a region-only `Peat-Wrapped Parcel` recipe for 2 Dry Peat Bricks and 1 Cloth Scrap. The finished parcel sells for 34g at base value, giving locally gathered peat a more useful outlet than raw sale.
- The parcel uses the existing inventory normalization, trade-bundle raster art, and market sell transaction. No new currency, save key, combat rule, or parallel crafting system is introduced.
- Playwright coverage verifies the recipe is visible only in Greyfen, ingredients are consumed exactly once, the parcel sells for the promised base value, and the resulting inventory/purse survive reload.
- This is one resource sink, not completion of the full regional loop. Fishing/ferry supplies, repairs, additional side activities, and the full Greyfen evidence/service acceptance sweep remain open.

## Phase 9 — Greyfen crossing response

- Once the main crossing evidence is filed and any discovered gauge/storehouse record has been reported, the Boundary Archive offers a player decision. Post a provisional safety notice for 1 Wood Scrap, or keep the evidence sealed until the missing closure order is found.
- The notice states that the lower crossing record is uncertain; it names no author and does not claim the missing order has been recovered. On the next Marsh Path trip, the first selected route gains up to 5 less Road Pressure once.
- Keeping the report sealed costs no material and grants no pressure credit. Both choices persist a memory and a response flag, survive reload, and remain reversible only through a future story event—not repeated clicks.
- Playwright coverage checks the resource cost, saved outcome, unavailable notice without Wood Scrap, one-time effect, and Ashmere/Greyfen save persistence.
- **Still open:** the missing closure order, the Warden's full story resolution, dedicated Storehouse scene art integration, and manual desktop/mobile visual acceptance. This response is a meaningful interim decision, not the end of Greyfen.

## Phase 10 — Greyfen regional gear

- The Drowned Anvil/Causeway Smithy sells the **Marshguard Coat** for 280g at level 2 with 32 Defense, using the existing armor catalog, purchase/equip actions, save pipeline, and stat comparisons.
- Purchase is limited to Greyfen so the regional smithy has a useful gear identity. Once the traveler owns the coat, it remains visible for re-equipping in other regions.
- Regression coverage checks Greyfen/Ashmere availability, the purchase cost, equipped armor and defense, and cross-region save persistence.
- The coat currently reuses the local chain-armor raster for its icon. A unique Runway-made coat icon and desktop/mobile art review remain open; the item is mechanically playable but its dedicated art is not finished.

## First signature contract: A Dry Crossing
The Landing Warden asks the traveler to recover a route marker washed loose from a raised path. Offer two understandable approaches: follow old posts (safer, slower, modest reward) or cross the reed bed (riskier, faster, chance at a marsh resource). Show risks and rewards before commitment. Return to Greyfen with a reward and a rumor that the route changed after the water rose. Reuse the current expedition/choice framework where possible.

## Local jobs
Start with a small set: gather dry peat, sort salvage baskets, and walk flood markers. Each job must clearly state cost, check, reward, and failure result. Do not add currency without a distinct gameplay purpose. Every new item needs a source, sell value, use, and fallback display name/icon.

**Implemented in v0.20.10:** Greyfen's Bellkeeper's Hall has local contracts for Dry Peat Bricks, Sort a Salvage Basket, and Reset Flood Markers. Dry Peat Bricks awards the distinct `peatBrick` resource, which has a display name, inventory icon fallback, and a market sell value. The signature “A Dry Crossing” contract is also in place: follow the old posts for a guaranteed marker recovery (35g and one Road Herb) or take the reed-bed shortcut (65% recovery chance for 65g and two herbs; a miss costs 5 HP and leaves the contract open). A successful recovery is saved and cannot be claimed a second time.

## Equipment and shop quality
- Make price, level requirements, equipped state, and stat differences easy to compare.
- Ensure UI values match the real combat/equipment logic.
- Prevent negative gold/inventory, duplicate equip effects, and double-submit purchases.
- Add a recipe only when materials have a reliable source and the result is meaningful.

## Art production rules
Service icons needed: inn, market, smith, archive/journal, map, work board, traveler, route marker. Equipment families: swords by tier, axes, bow, spear, shield, helmet, cuirass, bracers, boots, iron ore, hide, fang/claw, marsh herbs, existing consumables and story tokens. Generated atlases are sources, not finished assets: inspect, crop cells, avoid neighboring-pixel leaks, normalize canvas/padding, remove backgrounds only when clean, optimize, use stable local filenames, and retain fallbacks. Never use expiring generation URLs in runtime code.

## QA and save safety
- Test with isolated Playwright contexts and synthetic characters; never reset a real player's save.
- Verify Greyfen does not launch Ashmere-only content accidentally.
- Test market gold/inventory arithmetic, equipment effects, route gating, save/load, image fallbacks, keyboard focus, and 360–430px layouts.
- Record browser QA as blocked if the browser tunnel is unavailable; do not claim unrun tests passed.

## Acceptance checklist
- [ ] Greyfen is visually distinct from Ashmere at hub and service screens.
- [ ] Icons are semantically correct and readable at 32–48px.
- [ ] No broken image paths; fallbacks work.
- [ ] Trading and equipment changes preserve correct inventory, gold, and stats.
- [x] Greyfen work contracts use local job names and rewards; the world map now requires Greyfen before Ironpass, Ironpass before Blackwood, and Blackwood before the Ruined March.
- [x] Greyfen copy is town-specific and route gating checks are in place; Ironpass stays unavailable until the Greyfen contract is complete and its own hub is implemented.
- [x] Signature contract has a meaningful choice and clear reward.
- [ ] Save/load preserves region, inventory, equipment, and quest flags.
- [ ] Playwright smoke tests pass, and desktop/mobile visual QA is recorded separately.

## Work order
1. Inspect generated Greyfen and icon assets.
2. Prepare local optimized assets and document filenames.
3. Review and fix existing desktop/mobile UI regressions.
4. Complete service icons and equipment thumbnails.
5. Audit shop/equipment logic and add the small Greyfen contract.
6. Add regression tests and run them where the environment permits.
7. Only then start Ironpass concepting and progression.