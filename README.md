# LEGEND: Roads of Ashmere

**LEGEND: Roads of Ashmere** is a dark medieval fantasy HTML5 RPG built around a persistent traveler, a living town, and expeditions into the Old Road.

The project is now in its **full RPG development phase**. The old recovery/remake phase is historical context, not the current identity.

## Current Build

**v0.20.21 — Ashmere, Greyfen, and the Old Road polish pass** unifies the title/menu, streamlines Ashmere's hub, adds a region-aware Greyfen town hub, and integrates the first locally stored Runway art pack: 25 environment, portrait, and icon assets plus nine sliced inventory icons.

## Development Roadmap

The prioritized active plan, acceptance criteria, and compatibility guardrails are in [docs/ROADMAP.md](docs/ROADMAP.md).

## Art & Asset Direction

The shared visual style, image-family specifications, prompt template, and web/mobile integration checklist live in [docs/ART-DIRECTION.md](docs/ART-DIRECTION.md). This keeps generated art consistent across Ashmere, the Old Road, class portraits, enemies, and item icons.

**World and franchise foundation:** [docs/LEGEND_WORLD_BIBLE.md](docs/LEGEND_WORLD_BIBLE.md) separates established canon from open mysteries, while [docs/FRANCHISE_STRATEGY.md](docs/FRANCHISE_STRATEGY.md) lays out the longer-term IP path across games, stories, art, and audio. The upcoming first-impression overhaul is captured in [docs/OPENING_EXPERIENCE_REDESIGN.md](docs/OPENING_EXPERIENCE_REDESIGN.md), covering an alive title scene, roleplay-led character creation, and the first arrival in Ashmere. The [first-session story spine](docs/ASHMERE_STORY_SPINE.md) connects established scenes and mechanics into a coherent early journey while keeping proposed revelations separate from canon. The [Ashmere character arcs & dialogue bible](docs/ASHMERE_CHARACTER_ARCS.md) defines voice rules, proposed character directions, and open continuity decisions.

## Play Now

- **Live game:** https://tdtria.github.io/LEGEND-RPG/
- **Save Vault:** https://tdtria.github.io/LEGEND-RPG/save.html
- **Playtest feedback:** https://tdtria.github.io/LEGEND-RPG/feedback.html
- **Devlog:** https://tdtria.github.io/LEGEND-RPG/blog.html
- **Development updates:** https://tdtria.github.io/LEGEND-RPG/updates.html

## Current Direction

LEGEND is being developed as a **mobile-first, progression-focused fantasy RPG**.

The intended loop is:

**Ashmere → prepare → choose an expedition → survive encounters → bring home loot and proof → improve the traveler → unlock more of Ashmere and the road → go farther**

The Old Road now has named route stops, including two waystations where travelers can spend supplies to recover or craft healing potions from gathered materials. The expedition still uses stages, pressure, meaningful choices, combat, discoveries, rewards, and a clear return to town.

The earlier skill-check philosophy remains useful under the hood, but the player-facing experience is moving toward **choices first, resolution second**. Stats, gear, traits, supplies, and preparation should influence outcomes without making every interaction feel like a tabletop dice prompt.

## Previous Build Notes

### v0.17.0 — A Friendlier Beginning & Living Road Combat

The current development pass is focused on a more immersive traveler origin, readable tactical battles, and expeditions that feel like journeys rather than menus.

### Ashmere

Ashmere is organized around five clear destinations:

- **Ashmere Inn** — rest, recovery, supplies, rumors
- **Market** — buy essentials and sell road loot
- **Forge & Workshop** — weapons, armor, and crafting
- **Town Hall** — people, jobs, records, and town progression
- **Old Road Gate** — begin an expedition

Character creation now uses a guided seven-step story flow with persistent selections, contextual field notes, and a clear review before entering the world. The traveler panel, journal, character sheet, and profile remain available without forcing the player through the title screen.

### Old Road

The new expedition layer introduces:

- Five-stage expeditions
- Road Pressure
- Meaningful travel choices
- Discoveries and roadside resources
- Telegraph-based turn combat with distinct class techniques
- Road Pressure narration that warns when danger is building
- Combat as part of the expedition
- Clear fall-back and return options
- Rewards that feed the Ashmere progression loop
- Road Tokens and discoveries as progression resources
- Mobile-first touch controls

## Current Features

- Browser-based HTML5 RPG
- GitHub Pages deployment
- Mobile-first responsive presentation
- Local browser saves
- Supabase account/auth integration
- Cloud traveler slots
- Character creation with identity, personality, origin, class, and keepsake choices
- Ashmere town hub
- Old Road expedition system
- Road encounters and combat
- NPCs and town services
- Work board and town jobs
- Trading and crafting
- Character sheet and inventory
- Settings and accessibility options
- Portable Save Vault
- Dark fantasy art and interface assets
- Playtest / smoke-test tooling

## Progression Philosophy

LEGEND is moving toward a long-term progression structure inspired by the satisfying clarity of games such as **Melvor Idle** while keeping its own town, road, narrative, encounter, and choice identity.

Progress should come from connected loops:

- Traveler level and attributes
- Skills and mastery
- Weapons and armor
- Inventory and crafting
- Gold and trade
- Road Tokens and discoveries
- Ashmere jobs and favor
- NPC relationships and story progression
- Deeper road tiers and new destinations

Rewards should feed another meaningful choice instead of simply filling a number.

## Mobile-First Rule

The game is being designed for phones first, especially 360–430px wide screens.

That means:

- Large touch targets
- Clear one-screen decisions
- No hover-dependent interactions
- Persistent Back / Continue / Return paths
- Shorter information blocks
- Menus that do not trap the player
- Desktop layouts that expand from the mobile foundation

## Important Files

- `index.html` — live game shell and load order
- `js/data.js` — shared game data
- `js/storage.js` — save normalization and settings
- `js/game.js` — current game bootstrap / portal flow
- `js/systems/ashmere-controller-v099.js` — Ashmere town controller
- `js/systems/road-controller-v100.js` — current Old Road expedition layer
- `js/content/roads/old-road-v087.js` — Old Road content data
- `js/systems/account-v09x.js` — account/profile/cloud-save UI
- `supabase/traveler-slots.sql` — cloud traveler slot schema
- `playtest.html` — QA and manual playtest runner

## Development Philosophy

The repository contains historical and compatibility files from earlier development phases. Some legacy save keys and systems must remain so existing travelers can migrate safely.

Those compatibility details are **not the current game identity**.

For active development:

1. Treat the live game and current modular controllers as the source of truth.
2. Preserve established architecture and load order unless a change is deliberate.
3. Prefer coherent system-level changes over temporary UI patches.
4. Test the actual mobile flow after meaningful changes.
5. Keep public documentation synchronized with the current build.
6. Record meaningful development changes in the changelog and devlog.

## Tech Stack

- HTML
- CSS
- JavaScript
- Browser localStorage
- Supabase
- GitHub Pages

No build pipeline is required for the live web game.

## Credits

Original concept and Windows Batch version created by **Keegan Lewis VanOrder**.

Developed as **LEGEND: Roads of Ashmere**, a dark fantasy RPG focused on travelers, towns, roads, encounters, and progression.

## License

This project does not currently have a selected license.
