# LEGEND: The Awakening — Darkest Dungeon Creative Direction

**Approved direction:** 2026-11-08 · **Systems revision:** 2026-11-17 (party, stress and torchlight approved — see [Approved gameplay systems](#approved-gameplay-systems))  
**Role:** Primary creative reference for atmosphere, visual storytelling, expedition presentation, and tactical readability.  
**Related implementation plan:** [Phaser Production Migration](PHASER_MIGRATION.md)  
**Related standards:** [Art Direction](ART-DIRECTION.md), [UI Design System](UI_DESIGN_SYSTEM.md), [Product Roadmap](ROADMAP.md)

## The decision

**Darkest Dungeon is now the primary high-level creative reference for LEGEND.** This replaces the earlier World of Warcraft / Diablo comparison as the project's main visual and presentation direction.

The fit is the expedition-led dark-fantasy structure: prepare, venture into danger, make costly decisions, meet readable tactical threats, record what happened, and return changed. Its grim illustrated atmosphere, strong character silhouettes, expressive portraits, restrained ornament, tense encounters, and field-report presentation are closer to the identity LEGEND is already developing.

This is an inspiration reference, not a request to copy Darkest Dungeon. Do not reproduce its characters, monsters, names, art, logos, typography, exact interface layouts, animations, sound, or proprietary content. LEGEND keeps its own world, canon, characters, assets, and identity. Gameplay systems may be inspired by the reference where LEGEND's design calls for them; the systems approved for this project are listed under [Approved gameplay systems](#approved-gameplay-systems).

## Creative pillars

### 1. An expedition is the centre of the experience

The Old Road and future region journeys should feel like dangerous excursions through a connected world, not a chain of unrelated pages. Preparation in town, route selection, discoveries, events, camps, encounters, supplies, pressure, rewards, and the return report should form one continuous journey.

Keep the established LEGEND loop and its existing rules. New gameplay systems are governed by [Approved gameplay systems](#approved-gameplay-systems); atmosphere alone is not a reason to change a mechanic.

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

## Presentation-engine relationship

This creative direction does **not** override the current engineering direction in [AI_HANDOFF.md](../AI_HANDOFF.md): DOM owns readable interface content and controls; Phaser owns the continuous world and scene presentation.

- Keep menus, HUD, navigation, journals, maps, services, dialogs, combat controls, results, progression choices, text entry and other interactive surfaces as real DOM UI with semantic controls. Do not build a pixel-copy Phaser painter for a DOM screen.
- Use Phaser for world backdrops, environment art, parallax, atmosphere, lighting, particles, camera movement and transitions. Its scene presentation should support the interface, not cover, duplicate or replace its controls.
- Existing production controllers remain the sole authority for travel, discoveries, combat, enemies, damage, rewards, progression, quest state, inventory, persistence, account/cloud saves and save schema.
- Remove or retire a shell/painter only when that complete surface has a tested replacement. The new Ashmere refuge is the first surface to opt out of the persistent World Shell; service interiors and the Old Road retain their current behavior until their own acceptance checks pass.
- Preserve accessible names, keyboard focus, text entry, scrolling, pointer/touch controls, responsive behavior, reduced motion, readable text and live state updates.
- Do not build a second implementation of a gameplay system to imitate a reference game. Approved additions are governed by [Approved gameplay systems](#approved-gameplay-systems) and must extend existing owners.

See [AI_HANDOFF.md](../AI_HANDOFF.md) for the current engineering decision and [PHASER_MIGRATION.md](PHASER_MIGRATION.md) for the historical surface inventory and remaining migration notes.

## Approved gameplay systems

**Approved by the owner on 2026-11-17.** This section supersedes the earlier restriction on mechanical inspiration. Party formation, stress, and torchlight are now in scope for LEGEND.

The distinction this direction draws is between **presentation and property**, not between mechanics:

- **Not authorized:** reproducing Darkest Dungeon's art, characters, names, writing, interface, animation, sound, logos, or exact compositions. That is another game's identity and is never to be copied.
- **Authorized:** adopting mechanical *structures* — party formation, stress, torchlight — as genre conventions. Mechanics are not property, and LEGEND builds its own versions with its own vocabulary, numbers, and fiction.

### Party formation

The traveler may be accompanied by up to four characters on an expedition. The party is drawn from Ashmere's established people — **Mara Vell, Old Brenn, Captain Oric**, and future named residents — rather than invented strangers. Companions occupy ordered ranks that determine who can be reached and who can act.

Party formation turns combat from a single actor into several. It must extend the existing combat owner (`js/systems/road/road-combat-v100.js`) rather than create a parallel system, and it must not alter damage formulas, reward odds, or progression for existing solo play without an approved balance change.

**Companion outcome must be decided before the save schema is written.** LEGEND's approved default is **downed, not dead**: a broken companion is carried home, recovers through existing Ashmere services, and stress — not death — is the cost that takes a companion out of a fight. Permanent death requires a separate owner decision because it changes the save contract.

### Stress and afflictions

Characters accumulate stress during an expedition — from darkness, critical injuries, horror, and the condition of their companions. At the threshold, a resolve check produces an affliction or a virtue that changes how that character behaves.

Afflictions are written in **LEGEND's own voice and vocabulary**. Use the world's canon, fears, and history to name and describe them. Do not import Darkest Dungeon's specific affliction names, flavour text, or presentation.

### Torchlight

Expeditions carry a torch level that drains as the party travels and is restored by consuming torches. Torch level trades safety against reward: bright light reduces danger and stress but lowers the quality of what is found; darkness raises both danger and reward.

Torchlight is both a mechanic and the **presentation input** for the Phaser world layer. The world painter reads the torch value to drive its lighting and atmosphere rather than inventing a separate visual state.

### Rules for adding these systems

1. **One system at a time.** Each system ships complete — mechanic, save fields, normalizer default, view, and focused spec — before the next begins.
2. **Extend the existing owners.** Combat stays with the combat module, expedition state with `js/systems/road/road-state-v100.js`, persistence with `LegendStorage`. No parallel copies.
3. **Protect existing saves.** Every new field needs a default in `js/storage/player-normalizer-v120.js` so current player records load unchanged, plus an entry in `docs/SAVE_DATA_CONTRACT.md`.
4. **Record the design.** Each system gets its own design document before implementation, including its numbers, thresholds, and failure states.
5. **Do not pause the presentation work.** These systems are additive and live in the systems layer; they are not a reason to defer the hybrid migration.

### Still requiring separate approval

Corpses, hunger, quirks, diseases, permanent death, camping/rest mechanics, loot-rule overrides, and any change to existing combat formulas, balance, reward odds, or save data remain unauthorized until approved individually.

## What this direction does not authorize

- Copying Darkest Dungeon's art, characters, writing, UI, animation, sound, logos, or exact compositions.
- Treating an atmosphere reference as permission to change existing combat formulas, balance, reward odds, or save data. New systems are governed by [Approved gameplay systems](#approved-gameplay-systems).
- Changing LEGEND canon, story reveals, or region names.
- Pausing or narrowing the hybrid presentation work to a palette-only or title-screen redesign.

Story and canon changes still require separate owner approval and must be recorded in `docs/CANON.md` or the relevant design document.
