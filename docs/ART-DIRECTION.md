# LEGEND: The Awakening — Art Direction

## North star

**Weathered illustrated dark fantasy, guided by Darkest Dungeon's high-level expedition atmosphere and characterful presentation.** Ashmere should feel old, lived-in, a little uncanny, and still welcoming enough to return to. The world is grounded medieval fantasy with restrained supernatural details: damp stone, worn timber, moss, fog, charcoal shadows, tarnished brass, parchment, ember light, and rare cold-blue magic.

The reference is about atmosphere, expedition storytelling, strong silhouettes, tactile ledgers, and readable tactical scenes—not copying another game's art or interface. LEGEND keeps its own visual identity, world, characters, and systems.

Art should support the game's expedition loop. Images are scene-setting and readable on a phone; they should not overpower the gameplay interface. Darkness must create mood without hiding faces, scenery, labels, controls, or important state.

The approved high-level reference is documented in [Darkest Dungeon Creative Direction](DARKEST_DUNGEON_DIRECTION.md). Use it for atmosphere and scene presentation while keeping LEGEND's own material palette, world, characters, and readable interface.

## Visual rules

- **Watermark policy:** Never ship an image with a visible watermark, platform badge, or preview overlay. Do not integrate watermarked OpenArt previews; only use clean exports whose usage rights and export terms are suitable for the project. If a generator only provides watermarked previews on its current tier, treat those as reference-only and use another source for production art.

- Palette: charcoal, slate, weathered umber, moss green, parchment cream, tarnished gold, and sparing ember orange or ghost-blue accents.
- Lighting: directional overcast light, mist, candlelight, campfire glow, and strong readable silhouettes.
- Materials: worn leather, chipped stone, aged wood, muddy cloth, tarnished metal, rain-dark roads.
- Mood: mysterious and dangerous, but not relentlessly grim. Ashmere itself should feel safe and human; the Old Road should feel uncertain.
- Composition: one clear focal point, uncluttered silhouette, foreground/midground/background separation, generous negative space where UI may overlay.
- Consistency: use the same world palette, material language, lighting, and level of detail across all generated assets.

## Title screen and RPG interface

- **Brand:** Use LEGEND: The Awakening as the product title. “The Unquiet Road” is a retired working subtitle; do not add it beneath the wordmark or elsewhere in current UI.
- **Title composition:** Start from the approved full-screen Ashmere panorama and antique-gold wordmark. Keep the scene visible and leave deliberate dark negative space behind a left-side menu.
- **Menu language:** Aim for an established fantasy RPG: dark-stained timber/blackened iron, aged-gold edge work, restrained engraved details, compact symbols, clear vertical hierarchy, and one luminous primary action. Avoid dashboard cards or a SaaS/website hero look.
- **Polished UI reference:** Follow [the CodeRabbit iron-and-bronze concept](CODERABBIT_POLISHED_UI_CONCEPT.md) for the title plaque, engraved corner pieces, button states, Ashmere destination dock, and framed combat controls. Keep the concept's sample values and reduced menu/action set out of production.
- **UI rule:** Buttons, labels, version numbers, and status text remain accessible HTML/CSS. Never bake menu text into generated art.
- **Interaction rule:** Keep Continue/Begin dominant; keep New Traveler, Profile, Settings, and Credits visible but quieter. Reduced-motion mode must neutralize animation.

## Avoid

- Modern objects, firearms, sci-fi styling, glossy mobile-game gradients, oversaturated neon, generic high-fantasy gold overload, chibi proportions, photorealistic gore, watermarks, signatures, logos, and text baked into the art.
- Important visual details near the edges where mobile crops may cut them off.
- Generating text for labels, signs, item names, or UI. Render those in HTML so they remain accessible and legible.

## Asset families and target formats

| Family | Recommended composition | Target canvas | Notes |
|---|---|---|---|
| Environment scenes | Wide establishing shot; strong depth layers | 16:9, 1536×864 or larger | Keep the center readable and leave safe space for overlays |
| Town/location scenes | Warm focal light, lived-in details | 16:9 | Ashmere should contrast with the colder road |
| Class portraits | Waist-up or bust, distinct silhouette and gear | 2:3 portrait | Same framing, lighting, and background treatment for all six classes |
| Enemy portraits | Threatening but readable silhouette | 3:4 portrait | Keep backgrounds simple enough to distinguish enemies at small sizes |
| Item/ability icons | Single centered object, bold outline and material read | 1:1 square | Avoid tiny ornament; use transparent background where supported |
| UI textures | Subtle grain, parchment, worn leather, dark stone | Repeating texture or 3:2 panel | Must not reduce text contrast or accessibility |

## First production batch

1. Ashmere town establishing scene.
2. Old Road / South Fork establishing scene.
3. High Ridge and Reed Cut scene variants.
4. Six matching class portraits: Adventurer, Warrior, Ranger, Mage, Thief, and Skiller.
5. Initial enemy portraits: Blackroot Wolf and two distinct road threats.
6. A starter icon sheet: Bell Fragment, Road Token, healing potion, ration, and three weapon silhouettes.

## Prompt template

Use this as the shared prefix for environment art:

> Original dark-fantasy storybook concept art for LEGEND: The Awakening, grounded medieval materials, weathered stone and timber, charcoal and moss-green palette with parchment and tarnished-gold accents, restrained supernatural mystery, atmospheric mist, painterly texture, clear focal point, strong depth layers, readable silhouette, composed for a mobile-first RPG scene, no text, no lettering, no watermark, no logo.

For character and enemy portraits, append the subject, distinctive silhouette, equipment, emotional read, and a consistent background treatment. For item icons, replace the environment language with “single centered object, clean silhouette, restrained painterly detail, transparent background.”

## Integration and performance checklist

- Keep original high-resolution masters outside the runtime bundle when possible.
- Export web-ready WebP for large scenes; use PNG for transparency-sensitive icons or sprites.
- Use descriptive, stable filenames such as `ashmere-town-scene.webp`, `class-ranger-portrait.webp`, and `item-bell-fragment.png`.
- Resize assets to their actual display needs; avoid shipping oversized originals to mobile devices.
- Use CSS overlays and HTML text for labels, scene titles, and tooltips.
- Check contrast, crop safety, load time, and 390px-wide mobile layout before treating an asset as done.
- Keep existing save keys and progression logic independent of art assets; missing images should fall back gracefully.
