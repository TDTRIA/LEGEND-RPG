# Legend - Recovered Build

**Legend - Recovered Build** is a browser-based remake of my first-ever game project: a fantasy text RPG originally written entirely in Windows Batch.

The surviving original build, **LegendTFC release 1.0**, included account creation, saving, combat, shops, inventory, armor and weapon progression, skills, a bank system, quests, monster drops, and a boss named **Lacoyx**. This remake rebuilds that old batch RPG as a playable HTML5 game while expanding it into something bigger, cleaner, and more story-driven.

---

## Play Now

**Live build:** https://tdtria.github.io/LEGEND-RPG/

**Save Vault:** https://tdtria.github.io/LEGEND-RPG/save.html

**Playtest feedback page:** https://tdtria.github.io/LEGEND-RPG/feedback.html

---

## Current Version

**Recovered Build v0.6 - Refactor and Accessibility**

v0.6 moves LEGEND out of one giant HTML file and into a modular structure with separate CSS, data, storage, UI, and game-flow files. It also adds progressive Ashmere menu unlocks and accessibility settings so new players are less overwhelmed and can make the game easier to read.

---

## Current Features

- Browser-based HTML5 game
- Modular v0.6 file structure
- Shared stylesheet in `css/style.css`
- Game data module in `js/data.js`
- Save/settings module in `js/storage.js`
- UI rendering module in `js/ui.js`
- Game flow module in `js/game.js`
- Progressive Ashmere menu unlocks
- Accessibility settings:
  - Larger text
  - Bolder text
  - High contrast
  - Reduced motion
  - Simplified ASCII
  - Spacious UI
  - Readable font
- Browser tab favicon
- Mobile-friendly layout pass
- Local browser saving using `localStorage`
- Portable Save Vault export/import page
- Downloadable `.legend` save files
- Copy/paste save codes for moving saves between browsers/devices
- Character creation
- Character origins
- Starting keepsakes
- Class selection
- Character Sheet
- Main hub: **Ashmere**
- World setting: **Eldermere**
- Named NPCs and dialogue
- Quest tracker
- First questline: **The Bell That Rang Once**
- Opening route: **The First Road**
- Road Tokens objective
- Ashmere Inn
- Exploration events
- D20-style checks
- Basic combat
- Weapon and armor progression
- Inventory system
- Trading Post
- Ledger Hall
- Archive Hall
- Commons skill training area
- Hollow Keep teaser
- Recovered Memories system
- ASCII art panels
- Human playtest feedback page
- Browser auto playtest runner
- Buttondown newsletter signup

---

## Development Roadmap

### v0.6 - Refactor and Accessibility

- Split the game into `css/` and `js/` files
- Added progressive unlocks to reduce early menu overwhelm
- Added accessibility settings
- Added persistent settings via `legend-settings-v1`
- Kept Save Vault as the bridge toward future cloud/account saves

### Planned Next

- Run the browser QA runner against v0.6
- Patch any regressions from the refactor
- Update `playtest.html` for v0.6-specific menu unlock tests
- Collect public playtest feedback
- Restore and deepen any v0.5.1 systems that were simplified during refactor
- Expand route-specific events
- Add more NPC reactions after quests
- Improve combat clarity and enemy behavior
- Deepen Hollow Keep progression

---

## Tech Stack

- HTML
- CSS
- JavaScript
- Browser `localStorage`
- Portable save export/import
- GitHub Pages
- Buttondown newsletter
- Google Forms feedback
- Optional Playwright setup

---

## How to Play Locally

1. Download or clone this repository.
2. Open `index.html` in your browser.
3. Create a character.
4. Start exploring Ashmere and The First Road.

Your active save data is stored in your browser. Use `save.html` to export a portable `.legend` save file or import a save from another browser/device.

---

## Credits

Original concept and batch version created by **Keegan Lewis VanOrder**.

Recovered and remade as an HTML5 browser RPG.

---

## License

This project does not currently have a selected license.
