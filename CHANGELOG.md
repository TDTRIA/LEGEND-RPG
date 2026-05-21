# Changelog

All notable changes to **Legend - Recovered Build** will be documented in this file.

This project is an HTML5 browser remake of the original Windows Batch RPG **LegendTFC**.

---

## [Current] v0.6 - Refactor and Accessibility

### Added

- Split the game out of the giant `index.html` file into modular files.
- Added `css/style.css` for shared styling.
- Added `js/data.js` for game data.
- Added `js/storage.js` for saves and accessibility settings.
- Added `js/ui.js` for rendering helpers.
- Added `js/game.js` for the v0.6 game flow.
- Added accessibility settings:
  - Larger text
  - Bolder text
  - High contrast
  - Reduced motion
  - Simplified ASCII
  - Spacious UI
  - Readable font
- Added progressive Ashmere menu unlocks.
- Added Save Vault support as part of the v0.6 path.
- Added a v0.6 refactor plan in `docs/v0.6-refactor-plan.md`.

### Changed

- `index.html` is now a small loader that imports CSS and JavaScript modules.
- The starting Ashmere menu now shows fewer choices at first.
- Town systems unlock over time based on early player progress.
- New players are guided toward The First Road, People of Ashmere, Character Sheet, Settings, and Save/Exit first.
- Archive Hall, Ledger Hall, Inn, Trading Post, shops, Commons, Save Vault, and Hollow Keep now unlock progressively.

### Known Issues

- v0.6 is a structural refactor and may temporarily be leaner than v0.5.1 in some systems.
- The QA runner still needs a full v0.6-specific pass.
- The Save Vault exists as a separate page and is not yet deeply integrated into every in-game menu flow.

---

## v0.5.2 - Save Vault / Portability

- Added `save.html` Save Vault page.
- Added portable save code export.
- Added downloadable `.legend` save files.
- Added save import by paste or upload.
- Documented Save Vault in the README.

---

## v0.5.1 - First Road Balance

### Added

- Added the first balance patch for the v0.5 public playtest loop.
- Added guaranteed Old Road progress toward Road Tokens.
- Added a feedback link directly to the main menu.
- Added Devlog 006.

### Changed

- Updated game label to **Recovered Build v0.5.1**.
- Road Token progression is now less dependent on random event luck.
- Every two successful Old Road events can now reward a Road Token.
- More Old Road events can contribute to Road Token progress.
- Bell Shard pacing is more intentional after talking to Mara.
- Quest tracker now shows clearer Road Token progress.
- Early Old Road enemy balance was tightened for public playtest pacing.
- Important survival and quest items are better protected from quick selling.
- Updated blog and status pages for v0.5.1.

---

## v0.5 - The First Road

- Added **The First Road** depth patch for the opening route.
- Added **Road Tokens** as an early route objective.
- Added a new quest objective to bring 3 Road Tokens to Old Brenn.
- Added **Ashmere Inn** for resting and preparation.
- Added **Camp Supplies** as a survival item and economy sink.
- Added steadier weapon damage ranges.
- Added enemy traits.
- Added clearer quest tracker text.
- Added mastery perk text for each skill.
- Added mastery-based bonus reward chances.
- Added more Old Road-focused event filtering.
- Added Devlog 005.

---

## v0.4.1 - Mobile Polish

- Improved mobile viewport behavior.
- Added sticky mobile action controls.
- Improved tap target sizes.
- Reduced mobile spacing and panel size.
- Made ASCII panels scale better on narrow screens.
- Updated Devlog and newsletter/status pages for v0.4.1.

---

## v0.4 - Voices of Ashmere

- Added named NPCs in Ashmere.
- Added the People of Ashmere menu.
- Added a dialogue system.
- Added first real questline: **The Bell That Rang Once**.
- Added Bell Fragment quest item.
- Added enemy intent text.
- Added Guard action.
- Added class-based combat moves.
- Added Momentum meter.
- Added camp choices.
- Added route unlock conditions.
- Added skill mastery tracking.
- Added browser tab icon through `favicon.svg`.

---

## v0.3 - The Roads Beyond Ashmere

- Renamed the starting town to **Ashmere**.
- Renamed the wider world to **Eldermere**.
- Added The Ledger Hall, The Archive Hall, The Hollow Keep, The Commons, and The Relic Market.
- Added intro sequence.
- Added deeper character creation, origins, and keepsakes.
- Added Character Sheet.
- Added ASCII art panels.
- Added exploration routes and random events.
- Added D20-style skill checks.
- Added Trading Post and Backroad Dealer.
- Rebalanced early progression.

---

## v0.2 - Recovered Build

- Added animated title screen.
- Added class selection.
- Added improved menu and battle screens.
- Added Quest Hall cards.
- Added Recovered Memories.
- Added Skill Plot.
- Added RealmBank interface.
- Added Lacoyx boss encounter.
- Added Code Fragment story item.
- Added devlog, newsletter, and GitHub title buttons.

---

## v0.1 - Classic Online Prototype

- First HTML5 remake prototype.
- Added character creation and browser save support.
- Added basic combat, inventory, shops, bank, quests, skills, and boss prototype.

---

## Original Source - LegendTFC Release 1.0

The recovered batch version included account creation, login, saving, town menus, random combat, enemy drops, shops, inventory, food, potions, equipment, skills, banking, quests, player levels, experience, and the Lacoyx boss fight.

Later remembered versions are currently lost, and missing systems may be reimagined as part of the remake's lore.
