# Greyfen Expansion Plan

## Priority
Greyfen is the active milestone. Do not begin Ironpass implementation until Greyfen's art, services, core loop, and regression checks are coherent.

The region’s everyday culture, proposed local cast, Bellkeeper institution, and A Dry Crossing story beats are expanded in [GREYFEN_CULTURE_AND_CAST.md](GREYFEN_CULTURE_AND_CAST.md). That file labels proposed lore separately from implemented systems.

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

Reuse existing town, market, smithy, archive, inventory, quest, and travel systems. Prefer existing data patterns over a parallel implementation.

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