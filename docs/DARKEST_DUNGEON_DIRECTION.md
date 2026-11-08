# LEGEND: The Awakening — Darkest Dungeon Creative Direction

**Approved direction:** 2026-11-08  
**Role:** Primary creative reference for atmosphere, visual storytelling, expedition presentation, and tactical readability.  
**Related implementation plan:** [Phaser Production Migration](PHASER_MIGRATION.md)  
**Related standards:** [Art Direction](ART-DIRECTION.md), [UI Design System](UI_DESIGN_SYSTEM.md), [Product Roadmap](ROADMAP.md)

## The decision

**Darkest Dungeon is now the primary high-level creative reference for LEGEND.** This replaces the earlier World of Warcraft / Diablo comparison as the project's main visual and presentation direction.

The fit is the expedition-led dark-fantasy structure: prepare, venture into danger, make costly decisions, meet readable tactical threats, record what happened, and return changed. Its grim illustrated atmosphere, strong character silhouettes, expressive portraits, restrained ornament, tense encounters, and field-report presentation are closer to the identity LEGEND is already developing.

This is an inspiration reference, not a request to copy Darkest Dungeon. Do not reproduce its characters, monsters, names, art, logos, typography, exact interface layouts, animations, sound, or proprietary content. LEGEND keeps its own world, canon, characters, mechanics, assets, and identity.

## Creative pillars

### 1. An expedition is the centre of the experience

The Old Road and future region journeys should feel like dangerous excursions through a connected world, not a chain of unrelated pages. Preparation in town, route selection, discoveries, events, camps, encounters, supplies, pressure, rewards, and the return report should form one continuous journey.

Keep the established LEGEND loop and its existing rules. A visual reference does not authorize new stress, party, inventory, loot, or combat mechanics.

### 2. Grim atmosphere with clear information

Use shadow, weather, fog, worn materials, stark lighting, and controlled negative space to create tension. Contrast cold roads and threatening spaces with the warmth of lanterns, campfires, and Ashmere's refuge.

**Dark does not mean unreadable.** Avoid global blur, black veils, excessive vignette, muddy low-contrast panels, or lighting that hides important art and controls. Faces, silhouettes, enemy intent, text, health, resources, and available actions must remain immediately legible.

### 3. Characterful illustrated storytelling

Favor painterly, etched, or illustrated scene art with strong silhouettes and a tactile, handmade feeling. Character portraits and dialogue should communicate personality and stakes. Keep locations visually distinct and give each scene a deliberate focal point.

Use concise, authored dialogue and field notes to make people and places memorable. Do not turn every interaction into a large web-style modal or generic card.

### 4. Tactical encounters that read at a glance

Combat should feel staged within the world. The player should understand who is present, whose turn it is, what a threat is preparing to do, which commands are available, and what changed after an action.

The presentation may use strong composition, portrait framing, restrained animation, impact feedback, and clear combat logs. It must continue to use LEGEND's existing production combat engine, action handlers, formulas, enemy behavior, status rules, and reward settlement unless a separate gameplay change is explicitly approved.

### 5. Consequences recorded like a field chronicle

Use expedition maps, journals, reports, inventory records, and reward ledgers as in-world instruments. Results should clearly communicate the route taken, discoveries, danger, costs, recovered items, experience, currency, and next leads without inventing rewards or hiding misses.

### 6. A refuge worth returning to

Ashmere should be a warm, lived-in contrast to the road: practical, human, imperfect, and safe enough to recover and prepare. Services should feel like places and people in a town, not a row of unrelated website destinations. Future regions should have their own material, lighting, and cultural identity.

## Screen-by-screen translation

| Surface | Direction for LEGEND |
|---|---|
| Title and annals | A strong illustrated scene, clear title/menu hierarchy, solemn opening tone, and readable story text. |
| Traveler creation | Intimate portrait-led memory fragments; restrained framing and clear choices with their real starting effects. |
| Ashmere | Warm lamplight, weathered timber and stone, named landmarks, practical service boards, and people who feel present. |
| Old Road | Wide scene compositions, visible route/map context, compact journey status, discoveries, camps, and clear risk/reward decisions. |
| Dialogue and events | Character portrait plus concise, readable dialogue and a small number of meaningful responses. |
| Combat | A readable battle stage with clear actor/enemy silhouettes, turn state, intent, status, commands, and action feedback. |
| Results and level-up | Parchment or field-ledger presentation that records the actual outcome and presents progression choices clearly. |
| Dungeons and regions | Distinct atmosphere and landmarks, consistent controls, and a strong sense of entering a dangerous place. |
| Inventory, services, settings | Crafted, consistent frames that remain functional, accessible, and readable rather than imitating a website dashboard. |

## Visual language

- **Palette:** ash, charcoal, weathered umber, muted oxblood, moss, parchment, iron, and restrained tarnished-brass or ember highlights.
- **Light:** directional pools of candle/lantern light, campfire warmth, overcast daylight, cold mist, and controlled shadow.
- **Materials:** worn timber, rough stone, aged paper, iron fittings, battered leather, stitched cloth, and weather-darkened surfaces.
- **Shape language:** strong silhouettes, deliberate frames, compact markers, restrained decoration, and generous breathing room for information.
- **Typography:** expressive, readable fantasy-appropriate display lettering paired with highly legible body/UI text. Do not trade clarity for decorative lettering.
- **Motion:** deliberate transitions and limited, purposeful movement. Avoid constant shaking, excessive particles, or animation that delays input.

Follow the asset, watermark, export, accessibility, and performance requirements in [Art Direction](ART-DIRECTION.md). Keep all important labels and values as real UI text rather than text baked into art.

## Phaser migration relationship

This creative direction does **not** change the active technical priority: finish moving the existing production game's presentation and interactive screens into Phaser, one complete surface at a time.

- Phaser becomes the presentation and interaction layer for the full production game: title, opening, HUD, navigation, journals, maps, Ashmere and its services, Old Road, dialogue/events, combat, results, progression, dungeons, regions, inventory, settings, and remaining overlays.
- Existing production systems remain authoritative during this migration. Keep current controllers, callbacks, rules, combat calculations, enemy behavior, reward settlement, progression, quest state, storage, account/cloud saves, and save schema.
- Do not build parallel gameplay systems or replace working mechanics to imitate a reference game.
- Preserve accessible names, keyboard focus, text entry, scrolling, pointer/touch controls, responsive behavior, reduced motion, and live state updates.
- Migrate one whole playable surface at a time. Keep the source UI visible until the Phaser version passes desktop/mobile visual, interaction, state, persistence, and focused Playwright checks.
- The migration is complete only when the full production experience is genuinely Phaser-presented and the first-session and returning-player journeys pass. A Phaser background behind a DOM game is not completion.

See [PHASER_MIGRATION.md](PHASER_MIGRATION.md) for the authoritative inventory and acceptance gates.

## What this direction does not authorize

- Copying Darkest Dungeon's art, characters, writing, UI, animation, sound, logos, or exact compositions.
- Adding stress, torchlight, party formation, afflictions, corpses, loot rules, or other mechanics merely because they exist in the reference.
- Changing LEGEND canon, story reveals, region names, combat formulas, balance, reward odds, or save data.
- Pausing or narrowing the Phaser production migration to a palette-only or title-screen redesign.

New mechanics and story/canon changes still require separate owner approval and must be recorded in the relevant design or canon document.
