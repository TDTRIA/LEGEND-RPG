# LEGEND: The Awakening

**LEGEND: The Awakening** is a dark-fantasy browser RPG about a frontier realm, dangerous expeditions, monsters, returning magic, and the people caught between them.

The production game remains the existing classic-JavaScript browser project. The isolated reboot prototype is an experiment; it is not the live game and does not own production saves.

## Current production snapshot

- **Build:** v0.27.0
- **Main checkpoint:** [d098e57 — world-shell readability and portrait framing](https://github.com/TDTRIA/LEGEND-RPG/commit/d098e57bd01f99d60ad9d1512a09e941916f147c), October 29, 2026
- **Live game:** https://tdtria.github.io/LEGEND-RPG/
- **Current status:** the core opening, Ashmere, Old Road, combat, progression, Bell Cellar, and substantial Greyfen content are integrated. The first three-town release is **not** complete.

### Verification status

The GitHub Pages deployment workflow completed successfully for the latest main commit, but the latest main Playwright workflow did not pass: **207 passed, 3 failed, 1 skipped**. JavaScript syntax checks passed. The live Pages smoke step was skipped because the regression job failed. See [the Actions runs](https://github.com/TDTRIA/LEGEND-RPG/actions) before treating the latest build as fully verified. The failures and next checks are recorded in [the roadmap](docs/ROADMAP.md) and [testing guide](TESTING.md).

## What is currently in the game

- A realm boot sequence, cinematic **LEGEND: The Awakening** title, raster wordmark, and traveler creation flow.
- The road-first **Dead Lantern** opening, an unnamed voice shown as `???`, Captain Oric, and the Blackroot Wolf tutorial encounter.
- Ashmere town services, NPCs, dialogue, jobs/contracts, trading, equipment, crafting, accessibility settings, and traveler records.
- The five-stage Old Road with route choices, discoveries, Road Pressure, camps, a field journal/map, encounters, and return reports.
- Turn-based combat with Fight, Act, Item, Guard, enemy intent, rewards, and progression.
- The Bell Cellar's first compact dungeon loop and level-up/stat allocation.
- Greyfen Marsh Path content, evidence/story handoffs, resource progression, the Silted Storehouse delve, the Peat-Wrapped Parcel recipe, a saved crossing-response choice, and the regional Marshguard Coat.

**Important limits:** Greyfen still needs its remaining town/service/economy/story acceptance work and dedicated art review. PR [#54](https://github.com/TDTRIA/LEGEND-RPG/pull/54) is open and adds one optional salvage stop; it is not merged and does not complete the full Greyfen release. Ironpass is not playable on main. Do not describe Ashmere, Greyfen, and Ironpass as a completed three-town release.

## Where development goes next

1. **Stabilize scene visibility and regression.** Fix the overly opaque world-shell/Old Road/combat surfaces, resolve the remaining NPC portrait overlap, and correct brittle computed-style assertions. Keep environmental artwork visible while retaining readable text and controls.
2. **Finish one coherent Greyfen region loop.** Complete its local services, quest/story handoffs, resource sinks, equipment/art, expedition/delve outcomes, return report, and save/reload coverage.
3. **Verify the Ashmere-to-road-to-Greyfen progression path.** Make sure the next useful action is clear and existing traveler saves continue to work.
4. **Build Ironpass only after its own hub, services, story, expedition, rewards, and tests are ready.** A region entry or map marker is not a playable town.

The [Product Roadmap](docs/ROADMAP.md) is the source of truth for priority and acceptance criteria.

## Play and project links

- **Live game:** https://tdtria.github.io/LEGEND-RPG/
- **Save Vault:** https://tdtria.github.io/LEGEND-RPG/save.html
- **Playtest feedback:** https://tdtria.github.io/LEGEND-RPG/feedback.html
- **Development updates:** https://tdtria.github.io/LEGEND-RPG/updates.html
- **Devlog:** https://tdtria.github.io/LEGEND-RPG/blog.html
- **Repository / Actions:** https://github.com/TDTRIA/LEGEND-RPG

## Development and testing

Requires Node.js 22 or newer.

```bash
npm install
npx playwright install
npm run test:e2e
```

Useful commands:

- `npm run test:e2e` — full Playwright suite
- `npm run test:e2e:headed` — run with the browser visible
- `npm run test:e2e:ui` — Playwright UI
- `npm run test:e2e:report` — open the latest local report

See [TESTING.md](TESTING.md) for GitHub Actions, live smoke, and verification guidance.

## Project guardrails

- Preserve the active save key `legend-roads-of-ashmere-v09` and existing player records. No reset or schema redesign as a shortcut.
- Keep the current browser runtime and classic-script load order. Do not migrate production to Phaser, Unity, Godot, or another engine without an explicit decision and a proven save plan.
- New production art should be committed, watermark-free raster artwork. Do not add a new SVG title logo or temporary signed image URLs.
- Keep the traveler's opening voice labelled `???`; respect the locked story decisions in [Canon](docs/CANON.md).
- Build complete playable slices, not disconnected screens. Preserve keyboard focus, reduced motion, desktop readability, mobile compatibility, and no-horizontal-overflow behavior.

## Start here

- [Product Roadmap](docs/ROADMAP.md) — current priorities and what “done” means.
- [UI Screen Inventory](docs/UI_SCREEN_INVENTORY.md) — reachable screen coverage and presentation status.
- [First Three Towns Release Plan](docs/FIRST_THREE_TOWNS_RELEASE_PLAN.md) — content and quality gates.
- [Architecture](docs/ARCHITECTURE.md) — production module boundaries and script order.
- [Save Data Contract](docs/SAVE_DATA_CONTRACT.md) — persistence and compatibility.
- [Art Direction](docs/ART-DIRECTION.md) — production art standards.
- [Canon](docs/CANON.md) — locked story facts and reveal guardrails.

## Credits and license

Original concept and Windows Batch version created by Keegan Lewis VanOrder.

The repository does not currently declare a selected open-source license.
