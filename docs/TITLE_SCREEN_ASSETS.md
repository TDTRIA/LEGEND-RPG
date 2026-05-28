# LEGEND: Roads of Ashmere - Title Screen Asset Checklist (v0.9.x)

This checklist covers all assets needed for the finished Ashmere title screen and menu, keeping the dark medieval fantasy vibe and animations intact.

## 1. Title Hero / Branding
- `assets/ui/logos/logo_legend_emblem_v1.png`
  - Circular or emblematic logo.
  - Dark fantasy style.
- `assets/title/title_bg_ashmere_road_v089.jpg`
  - Wide Ashmere road background.
  - Painterly or subtle photobased fantasy.
- Optional title key art: `assets/title/title_keyart_ashmere_v1.png`
  - Traveler or town illustration.
  - Portrait or square composition works.
  - Transparent PNG acceptable.
  - Fallback panel included if asset is missing.

## 2. What’s New / Early Access Panel
- No new image required; relies on title feature cards.
- Optionally, small icons for features: road, NPC, battle, account.

## 3. Menu Icons (SVG in `js/game.js`)
- `continue` – arrow
- `new` – plus
- `settings` – gear / cog
- `account` – person
- `feedback` – chat bubble
- `delete` – trash / X
- `text` / `bold` / `contrast` / `motion` / `space` / `font` – accessibility toggles

## 4. Ember / Fog Animations (CSS)
- `.title-embers i` – rising ember particles.
- `.title-fog i` – drifting fog patches.
- Controlled via `keyframes` in `game-polish-v09x.css`.

## 5. Title Pills
- No separate assets; just CSS pill elements.
- Text examples: `Ashmere Main Hub`, `Old Road Loop`, `v0.9.x Polish`.

## 6. Optional Enhancements
- Animated lantern light overlay for Ashmere road.
- Subtle particle glows (sparks, dust) for ambiance.
- Extra traveler character mini illustrations to appear in key art.

---

All assets are optional for testing but recommended to match the concept art vibe and the dark fantasy, moody aesthetic of the finished title screen.