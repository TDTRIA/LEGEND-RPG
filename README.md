# LEGEND: Roads of Ashmere

**LEGEND: Roads of Ashmere** is a dark medieval fantasy HTML5 RPG built from the remains of my original Windows Batch RPG project, **LegendTFC**.

The project started as **Legend - Recovered Build**, a browser remake of my first-ever game. It has now pivoted into a fuller RPG direction: a grounded first-town adventure loop, cleaner dark fantasy UI, real art assets, D&D-style checks, better combat presentation, and a stronger sense of place.

This is **not a 1.0 release yet**. The current work is the **v0.9.x Ashmere overhaul**, focused on making the first playable loop feel like a real RPG before expanding the world further.

---

## Play Now

**Live build:** https://tdtria.github.io/LEGEND-RPG/

**Save Vault:** https://tdtria.github.io/LEGEND-RPG/save.html

**Playtest feedback page:** https://tdtria.github.io/LEGEND-RPG/feedback.html

---

## Current Build Focus

### v0.9.x - Ashmere Overhaul

Current development is focused on the first-town loop:

**Ashmere → talk / shop / rest / prepare → Old Road → checks / battles / finds → return to Ashmere**

The goal is to make the opening feel less like a menu prototype and more like a compact tabletop-inspired RPG session with a town, NPCs, vendors, risk, preparation, rewards, and reasons to return.

---

## Current Features

- Browser-based HTML5 RPG
- Playable live on GitHub Pages
- Mobile-friendly layout direction
- Local browser saving with `localStorage`
- Portable save export/import through the Save Vault
- Character creation with class, origin, and keepsake choices
- Character sheet and inventory systems
- First town hub: **Ashmere**
- First route: **The Old Road**
- First-town NPCs and vendor flow
- Inn, trader, blacksmith, and town preparation loop
- Road travel pacing options:
  - Travel Carefully
  - Follow the Road
  - Press Ahead
- D20 road checks with:
  - Skill modifiers
  - DC display
  - Failure risk
  - Natural 20 critical success
  - Natural 1 botch
- D20-style road combat with:
  - Enemy art
  - HP bars
  - Player attack rolls vs enemy DC
  - Enemy attack rolls vs player AC
  - Guard, Potion, and Fall Back actions
  - Combat action log
- Early quest/objective structure around Road Tokens and Ashmere progression
- Dark fantasy UI skin for the Ashmere direction
- Uploaded art asset integration for:
  - Title screen
  - Ashmere main street
  - Old Road
  - NPC portraits
  - Vendor portraits
  - Road enemies
- Legacy systems kept where useful while old unused/callback systems are gradually reduced

---

## Project Direction

LEGEND is moving away from ASCII-first presentation and into a cleaner dark fantasy RPG style.

Current design priorities:

- Make Ashmere feel like a real place, not just a menu
- Make the Old Road feel dangerous, readable, and replayable
- Keep the game playable on desktop and mobile
- Use the existing uploaded art assets instead of constantly generating new ones
- Keep systems modular enough to polish safely
- Avoid rushing toward 1.0 before the first-town loop is strong

---

## Important Files

### Core entry

- `index.html` - live game shell and script/style loading order
- `js/data.js` - shared game data
- `js/storage.js` - save/settings support
- `js/ui.js` - older UI helpers
- `js/game.js` - legacy game flow baseline still used by the project

### Ashmere / first loop

- `js/content/towns/ashmere-v080.js` - Ashmere town content
- `js/systems/town-controller-v080.js` - town menu and location flow
- `js/content/roads/old-road-v087.js` - Old Road content data
- `js/systems/road-controller-v087.js` - current Old Road travel/check/combat controller

### v0.9.x presentation and art

- `js/systems/assets-v090.js` - central asset manifest
- `js/systems/art-integration-v092.js` - art integration for town, location, dialogue-like, and battle screens
- `js/systems/title-bg-v089.js` - fullscreen Ashmere title treatment
- `css/game-ui-v090.css` - dark fantasy UI skin and art integration styles
- `css/road-combat-v093.css` - D20 road encounter and combat styling

### Useful support pages

- `save.html` - Save Vault export/import
- `feedback.html` - playtest feedback
- `playtest.html` - smoke/playtest page when maintained for the current build

---

## Asset Direction

The current Ashmere overhaul uses uploaded art assets from the repo, including:

- `assets/title/title_bg_ashmere_road_v089.jpg`
- `assets/ui/logos/logo_legend_main_v1.png`
- `assets/ui/logos/logo_legend_emblem_v1.png`
- `assets/ui/logos/logo_legend_emblem_full_v1.png`
- `assets/locations/ashmere/location_ashmere_mainstreet_v1.jpg`
- `assets/locations/roads/location_old_road_main_v1.jpg`
- `assets/npcs/ashmere/npc_mara_portrait_v1.jpg`
- `assets/npcs/ashmere/npc_brenn_portrait_v1.jpg`
- `assets/npcs/ashmere/npc_oric_portrait_v1.jpg`
- `assets/npcs/vendors/npc_innkeeper_portrait_v1.jpg`
- `assets/npcs/vendors/npc_blacksmith_portrait_v1.jpg`
- `assets/npcs/vendors/npc_trader_portrait_v1.jpg`
- `assets/enemies/road/enemy_road_goblin_v1.jpg`
- `assets/enemies/road/enemy_blackroot_wolf_v1.jpg`
- `assets/enemies/road/enemy_lantern_wisp_v1.jpg`

---

## Current Roadmap

### v0.9.x Ashmere polish

- Polish Ashmere town menus with backgrounds, portraits, and clearer player choices
- Improve NPC and vendor screens
- Tighten the Old Road encounter loop
- Continue improving D20 checks and battle presentation
- Improve character sheet and inventory readability
- Keep mobile-first readability in mind
- Reduce old unused systems safely without breaking the live game

### Later goals

- Expand beyond the first Old Road loop
- Add deeper quest consequences in Ashmere
- Build more locations around Ashmere
- Add stronger enemy variety and combat tuning
- Improve onboarding and opening story context
- Prepare for a true 1.0 only after the core loop feels solid

---

## Tech Stack

- HTML
- CSS
- JavaScript
- Browser `localStorage`
- Portable save export/import
- GitHub Pages
- Optional playtest/smoke-test pages

No build pipeline is required for the live game right now. The project is currently a static HTML/CSS/JS game hosted through GitHub Pages.

---

## How to Play Locally

1. Download or clone this repository.
2. Open `index.html` in a browser.
3. Create a character.
4. Explore Ashmere.
5. Prepare in town, travel the Old Road, survive checks and battles, then return to Ashmere.

Your active save data is stored in your browser. Use `save.html` to export a portable `.legend` save file or import a save from another browser/device.

---

## Development Notes

This project still contains older systems from the recovered/remake phase. Some of those files are still active, some are compatibility layers, and some are gradually being replaced.

Important rule for future updates:

**Do not overwrite large core files like `js/game.js` or `js/systems/road-controller-v087.js` with tiny stubs.**

When possible, add safely, integrate carefully, and verify the live loop still works.

---

## Credits

Original concept and Windows Batch version created by **Keegan Lewis VanOrder**.

Recovered, rebuilt, and expanded as **LEGEND: Roads of Ashmere**, an HTML5 dark fantasy RPG.

---

## License

This project does not currently have a selected license.
