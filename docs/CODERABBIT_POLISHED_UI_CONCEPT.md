# LEGEND: The Awakening — CodeRabbit Polished UI Concept

**Reference date:** 2026-11-08  
**Status:** Approved visual/layout reference for the Phaser migration; the archive itself is not a production game build.  
**Relationship:** This refines the UI material and screen-composition system under the wider [Darkest Dungeon creative direction](DARKEST_DUNGEON_DIRECTION.md). It does not replace LEGEND's world art, lore, production controllers, or the active [Phaser migration](PHASER_MIGRATION.md).

## What this concept contributes

The CodeRabbit ZIP supplies three desktop screen mockups (title, Ashmere, and battle), a standalone preview page, and original UI primitives. The mockups are a presentation target—not a source of live game data or replacement behavior.

The most important visual decision is a substantial, tactile interface language built from dark iron, patinated bronze, aged gold, and warm parchment. Frames should look forged and inset into the world, not like modern rounded web cards. Carved corner pieces, thin engraved dividers, restrained surface grain, and warm selected states add weight without overwhelming the scene.

The surrounding world remains the visual focus. Panels group information and actions; they should not turn the whole screen into a black overlay or obscure the landscape.

## Screen composition

### Title and returning-player menu

- Keep the full Ashmere/Old Road scene visible as the dominant background.
- Anchor the title wordmark and menu in one substantial left-side iron-and-bronze plaque. Keep the logo as a separate raster asset and all menu labels as live text.
- Use a clear primary action with a warm selected/bronze treatment; secondary actions use dark iron with readable ivory text.
- The ZIP mockup shows only Begin, Continue, Settings, and Credits. Production must retain **all six** current actions: Continue Journey, New Traveler, Profile, Settings, News & Roadmap, and Credits (with the correct first-time-player variant).
- Retain the existing returning-player DOM fallback during entrance/initialization and whenever Phaser preflight or painting fails.

### Ashmere hub

- Keep the town scene full-bleed and readable.
- Place a compact location plaque at the upper left and a live traveler/status plaque at the upper right.
- Group destinations into one strong bottom dock with a framed heading and clear place-specific controls.
- The ZIP shows four sample doors. Production must render the **entire live destination catalog**, including People, Work Board, Daily Field Board, Old Road Gate, Road Network, the progression-unlocked Bell Cellar, and any future catalog entries.
- Preserve the real destination IDs, callback ownership, disabled/unlocked state, service icons, scrolling, focus, and touch targets. Do not substitute the mockup's sample traveler, health, gold, or destination labels.

### Solo turn-based battle

- Keep the illustrated traveler and enemy as the main stage, with the environment visible between and around them.
- Use a compact top composition for enemy intent, enemy identity/health, and the player's turn prompt.
- Put the player's health and identity beside a framed lower command dock. The separate health orb is a visual meter only; its fill must be driven by current HP and its text must remain live UI text.
- The concept displays four primary actions: Fight, Act, Item, and Guard. Production must also retain the current Heavy Strike, Road Poultice, Retreat, and sound controls in their existing roles. The sample actions in the concept are explicitly preview-only and do not execute production combat.
- Never replace enemy intent, status, cooldowns, disabled states, action IDs, combat logs, turn transitions, or combat formulas with mockup behavior.

### Results, progression, inventory, and services

The ZIP does not provide these screens as finished mockups. Extend the same material vocabulary without assuming a layout from the sample title/town/battle pages:
- Results should read like a field debrief: encounter, actual rewards, XP, gold, recovered items, progress, and real next actions.
- Level-up should use the same engraved frames and selected-state language while keeping point allocation, totals, and confirm state obvious and keyboard accessible.
- Inventory, market, forge, jobs, and journal should use the frame/button language in ways that fit each existing task. Do not flatten every feature into an identical four-card dock.

## Material and interaction rules

- **Surfaces:** dark forged iron and charcoal backing, layered bronze/gold keylines, small engraved highlights, and subtle worn texture.
- **Selection:** warm bronze/amber fill, slightly brighter rim, and an explicit state contrast. Disabled controls remain readable and distinguishable without relying on color alone.
- **Typography:** restrained serif display text for titles/place names, paired with legible UI sans-serif for small instructions and values. Avoid tiny tracking-heavy labels for critical information.
- **World lighting:** lantern warmth against cold mist and weathered stone; keep exposure readable. Avoid global blur, opaque black veils, and excessive vignette.
- **Layout:** use the concept's 1440px desktop composition as a reference, then deliberately reflow for 390px mobile. Mobile must retain every destination and action, not hide options to fit the mockup.
- **Accessibility:** real semantic buttons remain action targets during migration; retain DOM names, keyboard focus, touch behavior, scrolling, reduced-motion behavior, text contrast, and accessible status announcements.
- **State:** all names, HP, gold, enemy health, intent, rewards, labels, and button availability come from live production state. No sample values are copied into the game.
- **Fallback:** keep the original surface visible until the Phaser replacement passes complete content, interaction, resize, and paint preflight. Clear the Phaser layer and restore the styled DOM if rendering fails.

## Asset inventory and usage

The ZIP's existing world scenes and large wordmark belong to LEGEND's existing art family. Reuse the production copies; do not add another renamed copy or replace them merely because the concept archive contains them.

The reusable UI primitives are brought into the repository as:
- `assets/ui/panels/legend-button-normal-v1.svg`
- `assets/ui/panels/legend-button-selected-v1.svg`
- `assets/ui/panels/legend-button-disabled-v1.svg`
- `assets/ui/panels/legend-frame-corner-v1.svg`
- `assets/ui/panels/legend-divider-v1.svg`
- `assets/ui/panels/legend-panel-frame-v1.svg`
- `assets/ui/panels/legend-health-orb-bezel-v1.svg`
- `assets/ui/panels/legend-health-orb-fill-v1.svg`

Implementation notes:
- Button SVGs are label-free backgrounds. Add actual labels, selected state, disabled state, and accessibility semantics from the production controls.
- Use the corner as four independent, flipped/rotated pieces. Do not stretch a corner into a full frame.
- The panel frame has an open/transparent centre and ornamental corners. It needs a fixed-aspect treatment or a proper nine-slice strategy; do not stretch the complete frame arbitrarily.
- The health orb bezel and fill are separate layers. Clip/reveal the fill from live HP (and preserve the original value label); the SVGs do not calculate health.
- The divider is decorative. It must not replace semantic section headings or focus order.

## Implementation order

1. Finish and verify the active title, shell, Old Road, combat, and Ashmere Phaser slices already in progress.
2. Apply the same frame and button language to the dedicated combat results and level-up surfaces, preserving their existing controllers and save ownership.
3. Continue through Ashmere service interiors, Old Road scene/results, inventory, dungeons/regions, and remaining overlays one complete surface at a time.
4. Only remove a DOM presentation after visual, live-state, accessibility, desktop/mobile, and failure-fallback parity is demonstrated.

The ZIP's screenshots are the visual reference. Its demo HTML, static names/values, and battle button reactions are not production logic.
