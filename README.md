# LEGEND: The Awakening

**LEGEND: The Awakening** is a dark-fantasy role-playing game about a frontier realm, dangerous expeditions, monsters, returning magic, and the people caught between them.

The project is now in its **full RPG development phase**. The old recovery/remake phase is historical context, not the current identity.

## Current Build

**Production main: v0.25.0 — Greyfen Silted Storehouse delve and persistent world-shell presentation.** The live build includes a three-room optional Storehouse delve gated behind “A Dry Crossing,” with safe/risky routes, persistent discoveries, a production-combat keeper, defeat/retreat recovery, one-time salvage protection, and a supplemental dispatch handoff to Mara. The Phase 7 merge is deployed; automated Pages deployment succeeded, while the post-merge full Playwright workflow was still running at the last recorded checkpoint. Dedicated Storehouse art integration and manual desktop/mobile visual acceptance remain open.

Phase 8 extends Greyfen’s resource loop with a region-only peat-to-market crafting recipe. The wider Greyfen service/evidence acceptance gate remains open, and Ironpass should not become playable until that gate is satisfied.

## Development Roadmap

The prioritized active plan, acceptance criteria, and compatibility guardrails are in [docs/ROADMAP.md](docs/ROADMAP.md).

## Art & Asset Direction

The shared visual style, image-family specifications, prompt template, and web/mobile integration checklist live in [docs/ART-DIRECTION.md](docs/ART-DIRECTION.md). This keeps generated art consistent across Ashmere, the Old Road, class portraits, enemies, and item icons.

**Current creative direction:** [docs/LEGEND_FANTASY_RPG_DIRECTION.md](docs/LEGEND_FANTASY_RPG_DIRECTION.md) establishes the preferred Monster Wars & Awakening direction: a fantasy RPG built around monster incursions, returning magic, regional conflicts, and a deeper supernatural threat. The [Game Reboot & Playable Foundation Plan](docs/LEGEND_GAME_REBOOT_PLAN.md) is a proposal for future gameplay systems and an isolated engine experiment, governed by the locked decisions in [CANON.md](docs/CANON.md). The Veil, Last Mercy/Hollow Saint relationship, echo rules, and old monster-war agreement are canon; the Five Arts as named disciplines, Strain, the Afterwake, and any production-engine migration remain proposals. The existing [world bible](docs/LEGEND_WORLD_BIBLE.md), [first-session story spine](docs/ASHMERE_STORY_SPINE.md), and [mystery/story arc blueprint](docs/LEGEND_MYSTERY_AND_STORY_ARC.md) now include reconciliation notes that preserve implemented Ashmere evidence while demoting the former Pale Surveyor/Hollow Mile mythology from the primary franchise explanation. The older [series myth arc](docs/LEGEND_SERIES_MYTH_ARC.md) and [deep canon foundation](docs/LEGEND_DEEP_CANON_FOUNDATION.md) remain available as legacy proposal references, not approved central canon.

**World and franchise foundation:** [docs/LEGEND_WORLD_BIBLE.md](docs/LEGEND_WORLD_BIBLE.md) separates established canon from open mysteries, while [docs/FRANCHISE_STRATEGY.md](docs/FRANCHISE_STRATEGY.md) lays out the longer-term IP path across games, stories, art, and audio. The ongoing first-impression work is captured in [docs/OPENING_EXPERIENCE_REDESIGN.md](docs/OPENING_EXPERIENCE_REDESIGN.md), covering an alive title scene, roleplay-led character creation, and the first arrival in Ashmere. The [first-session story spine](docs/ASHMERE_STORY_SPINE.md) connects established scenes and mechanics into a coherent early journey while keeping proposed revelations separate from canon. The [mystery and story arc blueprint](docs/LEGEND_MYSTERY_AND_STORY_ARC.md) maps the first game's reveal ladder and route quests. The archived [series myth arc](docs/LEGEND_SERIES_MYTH_ARC.md) and [deep canon foundation](docs/LEGEND_DEEP_CANON_FOUNDATION.md) preserve the former Pale Surveyor/Hollow Mile proposal for reference only; they are not the current central mythology. The [character compendium](docs/LEGEND_CHARACTER_COMPENDIUM.md) adds proposed character arcs and relationships, while the [culture and history atlas](docs/LEGEND_CULTURE_AND_HISTORY_ATLAS.md) deepens the regions, customs, folklore, and historical eras. The [Series & Title Reframe](docs/LEGEND_SERIES_CONTINUITY_REFRAME.md) preserves connected geography; the current product title is **LEGEND: The Awakening**. The newer [Game Reboot Plan](docs/LEGEND_GAME_REBOOT_PLAN.md) is now the primary design proposal for a wider magic system, the world-level threat, trainable skills, combat, cinematic presentation, and engine evaluation. It supersedes the earlier Pale Surveyor/Hollow Mile cosmology as the default direction. The isolated [reboot prototype](prototypes/reboot/README.md) explores animated presentation, a draft opening cinematic, combat feel, and rune training without changing production saves. New lore remains proposed, not locked canon.

## Play Now

- **Live game:** https://tdtria.github.io/LEGEND-RPG/
- **Experimental reboot prototype:** https://tdtria.github.io/LEGEND-RPG/prototypes/reboot/ (isolated from the production game)
- **Save Vault:** https://tdtria.github.io/LEGEND-RPG/save.html
- **Playtest feedback:** https://tdtria.github.io/LEGEND-RPG/feedback.html
- **Devlog:** https://tdtria.github.io/LEGEND-RPG/blog.html
- **Development updates:** https://tdtria.github.io/LEGEND-RPG/updates.html

## Current Direction

LEGEND is being developed as a **desktop-first, progression-focused fantasy RPG**, while retaining mobile compatibility.

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
- Touch-friendly responsive controls

## Current Features

- Browser-based HTML5 RPG
- GitHub Pages deployment
- Desktop-first responsive presentation with mobile compatibility
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
- Playtest / smoke-test tooling (full desktop regression suite plus focused mobile compatibility checks)

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

## Desktop-first Development, Mobile Compatibility

Desktop browsers are the primary development and visual-polish target, starting around 1440×900. The game must remain responsive and playable on phones around 360–430px wide, but layouts are no longer designed mobile-first.

That means:

- Large touch targets
- Clear one-screen decisions
- No hover-dependent interactions
- Persistent Back / Continue / Return paths
- Shorter information blocks
- Menus that do not trap the player
- Mobile layouts that adapt the desktop presentation without horizontal overflow

## Important Files

- `index.html` — live game shell and load order
- `js/data.js` — shared game data
- `js/storage.js` — save normalization and settings
- `js/game.js` — current game bootstrap / portal flow
- `js/systems/ashmere-controller-v099.js` — Ashmere town controller
- `js/systems/road-controller-v100.js` — current Old Road expedition layer
- `js/content/roads/old-road-v100.js` — active Old Road content data
- `js/systems/account-v09x.js` — account/profile/cloud-save UI
- `docs/ARCHITECTURE.md` — current production module map and script-order contracts
- `docs/SAVE_DATA_CONTRACT.md` — player fields, IDs, and persistence rules
- `docs/ADDING_FEATURES.md` — where new features belong and how to wire them without growing the facades
- `supabase/traveler-slots.sql` — cloud traveler slot schema
- `playtest.html` — QA and manual playtest runner
- `docs/LEGEND_GAME_REBOOT_PLAN.md` — reboot proposal for magic, skills, combat, cinematic presentation, engine choice, and acceptance criteria
- `prototypes/reboot/` — isolated Phaser proof of concept; it does not change the production runtime or saves

## Development Philosophy

Historical source files may remain as archive material, but the active application runs only the current v100 road controller and current save key. Legacy recovered-build saves and the v087 road state are not imported.

For active development:

1. Treat the live game and current modular controllers as the source of truth.
2. Preserve established architecture and load order unless a change is deliberate.
3. Prefer coherent system-level changes over temporary UI patches.
4. Test the main desktop flow after meaningful changes and run focused mobile smoke checks.
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

Developed as **LEGEND: The Awakening**, a dark fantasy RPG focused on travelers, towns, roads, encounters, and progression.

## License

This project does not currently have a selected license.
