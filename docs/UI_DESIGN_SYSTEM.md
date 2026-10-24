# LEGEND UI Design System — Phase 1

**Status:** Shared presentation layer in css/legend-ui-system-v160.css. The system is additive: existing renderers, action IDs, story copy, save records and game logic remain authoritative.

## Design intent

LEGEND should feel like entering a living frontier: confident game-interface hierarchy, visible place art, purposeful status information, crafted material edges, readable feedback and distinct compositions for launcher, town and expedition. The World of Warcraft reference is only about a strong immersive game-interface feeling. This system does not copy that game's frames, layouts, icons, assets, factions, typography or branding.

## Material and color tokens

| Token | Value | Use |
|---|---|---|
| --legend-ui-night | #070b08 | page shadow / darkest backing |
| --legend-ui-iron | #111812 | raised iron/wood surface |
| --legend-ui-wood | #1b231a | secondary surface / controls |
| --legend-ui-wood-light | #293126 | hover / selected surface |
| --legend-ui-brass | #bfa064 | borders and rules |
| --legend-ui-amber | #e7c982 | primary focus and lantern highlights |
| --legend-ui-parchment | #efe7d4 | primary readable copy |
| --legend-ui-muted | #b0b8a8 | secondary instructions / metadata |
| --legend-ui-moss | #829b74 | safe/positive state and health meter |
| --legend-ui-water | #9cb9b4 | lowland-specific accent for future Greyfen rollout |
| --legend-ui-danger | #b96f5f | pressure/threat feedback, sparingly |
| --legend-ui-line | rgba(215,194,139,.23) | shared divider/frame edge |
| --legend-ui-shadow | rgba(0,0,0,.48) | depth under framed panels |

Materials are made from lightweight gradients and borders, not huge repeating textures. Local WebP/PNG assets remain the source for landscapes, services, class/item/enemy art and the title wordmark. Interface text remains selectable text; copy is not baked into images.

## Shared construction patterns

### Framed world panels
- Use charcoal/iron backgrounds, one warm brass keyline and a restrained inner highlight.
- Use square or lightly clipped corners for major game panels; avoid turning every surface into a rounded app card.
- Use a short title/kicker, one descriptive line and a clear action hierarchy.
- Leave landscape art exposed; use a shadow/scrim behind text rather than covering the whole scene.

### Primary and secondary controls
- Main action: high-contrast warm material fill with dark text.
- Secondary action: dark iron backing, ivory text and a visible keyline.
- Disabled action: lower contrast but still readable; do not depend on color alone.
- Hover, pressed and focus states communicate affordance; keyboard focus is always visible.
- Preserve current IDs, data attributes, button type and handler ownership.

### Title / realm entrance
- Landscape and raster wordmark form the cinematic focal point.
- Title actions form a deliberate crafted menu rather than a generic stack of rounded cards.
- Realm artwork remains as a companion world panel on desktop; on narrow layouts it moves into the document flow underneath the title instead of disappearing.
- Current traveler and realm/build context stay visible without rewriting title copy or button actions.

### Town / service
- Town landscape remains the hero. Current route/objective is treated like a pinned field order; name, health and resources form a compact status rail.
- Navigation becomes a unified dock; destination buttons read like distinct places and services, not ordinary website cards.
- Shared service screens receive the same frame, but their own existing art, content, tabs, forms and actions remain intact. The Work Board is the first service proof.
- Greyfen can use a cooler regional surface later; the global foundation should not erase regional identity.

### Expedition / map
- The scene is the largest element and stays visible.
- Current place, road clock, pressure, health and map/journal tools form a readable expedition HUD.
- Route choices, discoveries and travel actions are framed as field decisions with cost/effect copy intact.
- The side rail conveys next stop, supply count and notes without replacing or duplicating authoritative game state.
- Map/journal overlay receives the same iron/brass frame and a clear close/focus target.

## Interaction and accessibility contract

- Visible focus uses a warm outline and offset, not just a color change.
- Retain current minimum tap targets; increase them where feasible rather than shrinking controls to fit desktop styling.
- Place text over scrims or solid surfaces; no critical copy directly over busy art.
- Disabled/selected/success/error states need labels or structure, not color alone.
- Respect prefers-reduced-motion and saved reduced-motion settings. The shared rule removes decorative movement only; it does not change actions or game feedback.
- Keep current responsive breakpoints that protect service, title and expedition screens, while overriding the old realm-panel hide rule on narrower sizes.
- Missing artwork remains legible through existing fallbacks. No external art dependency or SVG title logo is introduced.
- Use local/system-safe font stacks. Display text uses a Georgia/Times-style serif; UI/body copy uses the existing readable system stack.

## Scope and rollout

The new stylesheet is loaded last to resolve the current cascade without deleting existing styles. Its selectors target the title/realm entry, Ashmere hub and service frame, and Old Road scene/map. Shared focus and reduced-motion rules establish reusable defaults.

Phase 1 is a visual proof, not full-game completion. Phase 2 applies the system to creation/opening, people and dialogue, inventory/equipment, services/economy, quests/journal, combat/dungeon, rewards/results, settings/account and edge states. Only after those screens pass can Phase 3 remove proven obsolete CSS and standardize version/cache labels at a release boundary.
