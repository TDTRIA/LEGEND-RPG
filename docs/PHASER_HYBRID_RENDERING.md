# LEGEND — Hybrid Rendering Contract

**Adopted:** 2026-11-17  
**Status:** Production architecture standard  
**Applies to:** The active production game in `index.html`; isolated reboot-preview code may retain experimental renderers while it remains isolated.

## Ownership

### Phaser owns the world

Use Phaser for:
- World backgrounds, location art, foreground dressing and scene composition
- Parallax, world-space camera movement and transitions
- Directional environmental lighting, darkness, fog, mist, weather and torch/campfire glow
- Particles such as embers, dust, rain and drifting spores
- Animated traveler, NPC and enemy sprites; combat-stage staging and world-space hit feedback
- Scene-specific environmental animation and non-text visual effects

### DOM/CSS owns the interface

Use semantic HTML and CSS for:
- All text, labels, numbers, prose, headings and status copy
- Title menus, annals, traveler creation, dialogue and all narrative choices
- Buttons, panels, cards, frames, menus, forms, inputs and modals
- HUD, inventory, character sheet, journal, map, route choices, camp decisions and expedition reports
- Combat commands, enemy intent/status descriptions, combat log and result/progression choices
- Focus, hover, keyboard navigation, screen readers, text entry, scrolling and responsive interaction

Important game information must remain selectable, searchable and available to assistive technology. Never place a text label in canvas as the only visible or accessible copy. Never make a DOM control transparent merely because a Phaser painter draws a visual duplicate.

### Existing game systems own behavior and data

Keep the current production modules as the source of truth for:
- Navigation and screen state
- Combat math, enemy behavior and status effects
- Quests, dialogue conditions, discoveries and progression
- Economy, inventory, crafting, equipment and reward settlement
- Expedition state, route consequences, camp choices and travel
- Player records, save/load, account/cloud saves and normalization

The active save key and public `LegendStorage` facade must remain unchanged unless a separately approved save migration is designed and tested. Rendering refreshes must never award rewards, mutate gameplay state, re-roll outcomes or trigger duplicate actions.

## Layering and implementation rules

1. Keep the Phaser canvas fixed behind the DOM interface, with pointer events disabled on the canvas layer.
2. Use real buttons, links, inputs and labelled controls. Existing controllers must keep their existing callbacks.
3. Let CSS handle layout and interface states. Use Phaser only for world-space and scene-level visuals, not as a substitute for fixing CSS geometry or typography.
4. Do not duplicate visible labels or controls between canvas and DOM.
5. Keep focus rings, keyboard semantics, accessible names, touch targets, reduced motion, text selection, scroll behavior and zoom support.
6. Keep interface panels readable against the Phaser world. Avoid global blur, heavy veils, or effects that obscure text or input.
7. Convert one complete playable surface at a time. Remove a legacy painter only after the DOM surface has been restored and tested; keep the world-art and transition paths intact.
8. Do not conflate the visible world scene with the interface. A Phaser world behind a complete DOM UI is the intended architecture, not an unfinished canvas migration.

## Current implementation checkpoint

The first stabilization slice restores DOM ownership of:
- Title menu
- Mandatory three-part annals
- Seven-step traveler creation and its real form controls
- Oric's Dead Lantern opening, dialogue and response choices

Phaser still owns their world backgrounds, atmosphere, world transitions and the production boot/awakening layer. These interfaces continue to use the existing navigation, story, creation and save controllers.

Remaining dedicated native interface painters elsewhere in the production renderer are migration work, not a reason to reverse this contract. Inventory, HUD/drawers, Old Road map and expedition decisions, combat panels, results, town boards and service interiors should be migrated surface-by-surface while retaining their existing systems and actions.

## Planned game-system expansion (not implemented yet)

The owner has identified three future design tracks inspired by expedition-focused dark fantasy:
- **Party system:** a group of travelers with distinct roles and a meaningful expedition composition.
- **Stress system:** an expedition pressure mechanic that can affect characters and decisions over a journey.
- **Torch/illumination system:** light as a managed expedition resource, with visibility and atmosphere consequences.

These are design targets only. Their rules, scope, balance, UI and save representation must be designed separately before implementation. Do not add placeholder fields or change existing saves as part of the rendering foundation.

## Visual direction guardrail

Darkest Dungeon is a high-level inspiration for expedition atmosphere, expressive character presentation, tactical readability and the sense of returning from a costly journey. LEGEND retains its own world, characters, canon, writing, assets, interface identity and rules. Borrow broad design ideas, not protected art, text, names or exact screen compositions. The owner-approved creative direction document remains the detailed source for style decisions.
