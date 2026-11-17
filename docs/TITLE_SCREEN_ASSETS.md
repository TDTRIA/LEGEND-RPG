# LEGEND: The Awakening — Title Screen Art & Composition

**Updated:** 2026-11-17  
**Production title:** **LEGEND: The Awakening**.

## Locked visual direction

The title screen is an in-world game scene, not a web landing page or a promotional poster. Its mood is balanced dark fantasy: lonely, weathered, mysterious, and quietly threatening. The world should feel cold and indifferent, with only a few small warm lights suggesting shelter and life.

The composition combines:
- A cinematic, full-screen environment that remains the visual focus.
- The visual character of an illustrated dark-fantasy chronicle.
- A compact, integrated game menu placed in the darker left side of the environment, not inside a large web card.
- Subtle environmental movement and sound, so the title screen feels like a place the player has entered.

Avoid generic castle panoramas, bright sunset spectacle, oversized blood moons, giant floating menu cards, marketing-style destination grids, and decorative gold borders that make the interface look like a website.

## Approved existing art

- `assets/title/title_bg_ashmere_road_v089.jpg` — **active title-screen background**. A moonlit, blue-green Old Road with a small lantern, bare trees, distant village, and road disappearing into mist. It is already committed; do not regenerate or replace it for this pass.
- `assets/title/title_keyart_ashmere_v1.png` — portrait-oriented companion art of a lone traveler entering a rain-soaked village. Reserve it for a later story transition or opening beat.
- `assets/generated/title/title-ashmere-road.webp` — alternate wide Ashmere approach image. Keep available for other transitions and story scenes.
- `assets/ui/logos/logo_legend_awakening_wordmark.png` — active transparent raster wordmark. The visible title must read **LEGEND / THE AWAKENING**. Keep the image as a separate, sharp UI asset; never bake title text or menu labels into the background.

## Production implementation

- `js/screens/title-screen-view-v120.js` owns the semantic HTML title markup.
- `js/screens/title-screen-v120.js` owns menu navigation and callbacks. Continue, Begin Your Journey, New Traveler, Profile, Settings, News & Roadmap, Sound, and Credits remain connected to the existing controllers.
- `js/systems/assets-v090.js` and the Phaser `ASSETS.title` manifest point to the same committed JPG.
- `css/title-screen-ashmere-v230.css` owns the new composition and responsive presentation. It is loaded after the earlier title styles so the active design has one clear source of styling.
- `js/engine/phaser-world-v1.js` continues to render the environment, but skips the Phaser title-menu painter for the v230 title. All visible title text and controls stay in the DOM for crisp rendering, keyboard focus, screen readers, and touch input.

This is a presentation change only. It does not modify the save key, player schema, progression, story flow, game rules, or title-menu action handlers.

## Layout and behavior requirements

- Use the left-side shadow of the existing painting for the wordmark and compact vertical menu; keep the lantern, village, moonlit mist, and road visible.
- The title itself has no opaque card or ornamental frame. Menu choices use restrained rows, a clear selected/hover treatment, and a visible keyboard focus ring.
- The traveler/save summary is contextual and visually secondary.
- The old right-side realm showcase is not part of the title composition. Its public updates remain reachable through the News & Roadmap menu action.
- Preserve responsive desktop, portrait, and landscape layouts; no horizontal overflow.
- Respect reduced-motion and existing accessibility settings.
- If Phaser or the environment image fails, the HTML wordmark and real menu controls must remain usable.
- Never create a duplicate canvas menu over the DOM controls.

## Menu hierarchy

With an existing traveler: **Continue Journey** is primary; New Traveler, Profile, Settings, News & Roadmap, Sound, and Credits remain available.

Without a save: **Begin Your Journey** is primary; Profile, Settings, News & Roadmap, Sound, and Credits remain available.

No Quit button: a browser game should not offer a misleading control that cannot reliably close the browser tab.
