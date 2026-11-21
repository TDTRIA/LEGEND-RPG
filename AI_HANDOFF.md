# AI Handoff — LEGEND: The Awakening

**Last updated:** 2026-11-21
**Authoritative branch:** `main` (`ef93b9c`)
**Current production version:** `v0.30.5`
**Current product name:** **LEGEND: The Awakening**

This file is the active handoff. Historical checkpoints are archived in [`docs/archive/AI_HANDOFF_2026-11-02.md`](docs/archive/AI_HANDOFF_2026-11-02.md); do not treat those old PR numbers, versions, or next steps as current.

> **Read this first if you are an AI assistant.** The single most important thing about this repository right now: the Phaser migration over-reached, and the project is deliberately moving *back* toward a DOM interface with Phaser owning only the world and scene art. Do not "continue the migration" by painting more DOM surfaces in Phaser. See [Engine state](#engine-state) before touching anything in `js/engine/`.

## Current product state

LEGEND is an in-development, desktop-first browser RPG with responsive mobile support. Its player loop is:

**Prepare in town → choose an expedition → explore and make decisions → face danger → return with loot/evidence → improve the traveler → unlock more of the world → prepare to go farther.**

- Three mandatory opening annals establish the monster-war history before traveler creation. The opening is not skippable.
- The traveler wakes beneath the dead lantern. Captain Oric and the Blackroot Wolf encounter hand the player into the turn-based combat and Old Road systems.
- Ashmere has a working town hub and service routes: Inn, Market, Forge/Workshop, Archive, people, Work Board, trading, crafting, gear, recovery, records, expedition preparation.
- The Old Road is a five-stage expedition with High Ridge and Reed Cut branches, discoveries, a saved map/field journal, camp decisions, travel time, Road Pressure, tactical encounters, and a return report. A road encounter is forced after two travel stretches even when pressure is low.
- A completed five-stage expedition at baseline Pressure 20 settles 80 gold and 33 XP with a 65% Road Token roll. Early returns do not receive the completion token. Bell Fragments remain uncommon: 35% Reed Cut roll, 25% recurring clue interaction, 15% Lantern Wisp drop.
- Combat keeps established turn-based rules and save structure: enemy intent, Guard, stagger follow-through, consumables, victory rewards, progression.
- Level-ups preserve saved attribute-allocation choices. Expedition reports show discoveries, settlement, token outcome, and level progress.
- Greyfen is a partial frontier with playable pieces: Patch the Ferry Nets, Marsh Path, local materials/progression, optional Silted Storehouse detour. It is **not** a complete town/story loop.
- Ironpass is future content, not a playable town.

## Owner-directed visual rebuild — current work (2026-11-21)

**The immediate product direction is the scene-led dark-fantasy rebuild in PR [#148](https://github.com/TDTRIA/LEGEND-RPG/pull/148), followed by the Old Road presentation redesign.** The owner wants LEGEND to feel like one cohesive RPG inspired at a high level by Darkest Dungeon, not a website dashboard surrounded by a persistent World Shell. Darkest Dungeon is inspiration only: do not copy its art, characters, names, writing, sounds, logos or exact interface.

### Active work and sequence

1. Finish and validate the new Ashmere refuge on `feat/ashmere-hub-dark-fantasy-v240` (PR #148). The hub replaces the Ashmere dashboard/shell with the existing full-scene art, compact traveler condition, one current field order, four principal town destinations, a clear Old Road Gate and a compact disclosure for secondary services.
2. Rework the Old Road expedition information hierarchy. The player should see the current place, route/stage, immediate condition and one meaningful event/decision—not every journal/map/status panel at once. Make Map and Field Journal deliberate controls, preserve the existing event/route graph, High Ridge and Reed Cut, camps, detours, discoveries, field contracts, pressure, combat, return and partial-save behavior.
3. Redesign combat presentation for tactical clarity while preserving the existing combat owner and formulas.
4. Specify and add approved party formation, stress/resolve and torchlight as separate systems, one complete and tested feature at a time. Existing solo play, save compatibility, reward odds and progression remain unchanged unless the owner explicitly approves a balance change.

The durable design and acceptance checklist lives in [docs/DARKEST_DUNGEON_REBUILD_PLAN.md](docs/DARKEST_DUNGEON_REBUILD_PLAN.md); the creative guardrails live in [docs/DARKEST_DUNGEON_DIRECTION.md](docs/DARKEST_DUNGEON_DIRECTION.md).

### Engineering boundary for this rebuild

The current DOM-first direction below is authoritative. DOM owns readable text, menus, buttons, dialogs, HUD, services and other controls. Phaser owns world/scene art, environment, atmosphere, lighting, particles, camera movement and transitions. Do not add new Phaser pixel copies of DOM interfaces or revive the persistent shell on a rebuilt surface. Keep existing production controllers as the single source of truth.

Protect the active save key `legend-roads-of-ashmere-v09`, `LegendStorage`, normalization and unknown player fields. Preserve all current story canon, writing, routes, services, quest evidence, combat behavior, formulas, reward probabilities, inventory, progression, accessibility and partially completed expeditions. Rebuild presentation one complete surface at a time.

## Engine state

### What happened

The approved goal (2026-11-03) was to move presentation into Phaser 4.1 while keeping existing controllers, rules and save logic authoritative. In practice the migration went further than that: it built a **pixel copy of the DOM** in Phaser.

Each painter (`js/engine/phaser-*-v1.js`, and `syncNative*` methods in `phaser-world-v1.js`) reads the real elements with `getBoundingClientRect()` / `getComputedStyle()`, rebuilds a Phaser scene from that signature, and hides the DOM underneath with `opacity:0; visibility:hidden`. Rebuilds are teardown-and-repaint, gated on text+rect signatures, with the DOM revealed during the rebuild. `phaser-world-v1.js` alone carries ~90 `clearNative*` teardowns.

That produced two renderers with two sources of truth over the same surface: input latency (clicks land on DOM, visuals come from the next repaint), flicker during rebuilds, approximated typography, lost CSS motion, and surfaces competing over visibility. This is not tunable — it is structural.

### Where it stands now

- `main` ships a **DOM interface restore switch**: `window.LegendDomUiRestore` (`js/engine/dom-ui-restore-v1.js`), merged in #143.
- Switch is **off by default**, so the painter path still behaves exactly as before for anyone who does nothing.
- `?dom-ui=1` / `?dom-ui=0` wins for that load and is remembered in `localStorage` key `legend-dom-ui-restore`. It never writes to `LEGEND_DATA.SAVE_KEY` or `legend-settings-v1`.
- With the switch on, **every painter module except `phaser-transition-v1.js`** (28 of 29 on `main`; 27 of 28 once #144 lands) and **15 `syncNative*` methods** in `phaser-world-v1.js` return early and call their existing `clear*()`, which is what already releases the DOM (the same path the preflight fallback uses).
- Intentionally **not** guarded, because they are genuinely Phaser's job: `phaser-transition-v1.js` (screen transitions) and `syncNativeRoadSceneArt`, `syncNativeScreenArt`, `syncAshmereLandmarks` (world plate, environment art, landmarks).
- Owner has compared both builds and judged the DOM interface build better: flicker gone, input responsive. **Per-surface re-admission is still an open decision** — no painter has been permanently deleted yet, and no surface has been reverted in code.

### Direction from here

1. **DOM owns interface surfaces**: menus, HUD, drawers, panels, modals, shops, sheets, dialogs, results, settings, text input, scroll regions.
2. **Phaser owns continuous animation**: world backdrop, environment art, parallax, atmosphere, lighting, particles, camera moves, transitions.
3. Migration forward = *subtraction*. Revert a surface by deleting its painter and its gate, not by adding another flag.
4. Do not build a second implementation of any screen. Do not reintroduce DOM-parity painting.

### Monolith

`js/engine/phaser-world-v1.js` is ~7,450 lines — the largest file in the repo by 5×, and the hardest for an AI to edit reliably without losing context mid-file. It should be split into world-scene modules once UI painters are removed. Treat any change to it as high-risk: prefer small, verifiable edits.

## Recent changes an agent must know about

- **#143 (merged)** — DOM interface restore switch, default off. Adds `tests/dom-ui-restore.spec.js`.
- **#144 (chore/housekeeping-dead-code-20261117)** — removes 52 dead files (39 JS, 13 CSS, 14 art, 13.7 MB). Deletions are limited to files proven unreachable from every HTML entry point plus art whose basename appears in no code, doc or manifest. Notable: `phaser-shell-toast-v1.js` was added by #131 but **never wired into `index.html`** — the live toast painter is `syncNativeToastUi`. Kept deliberately: `assets/title`, `assets/audio`, `assets/generated`, `assets/ui`, `assets/tilesets`, `assets/locations`, because those packs are still being wired incrementally.
- **`feat/ashmere-title-screen-v230`** — the new moonlit-Ashmere title screen, 12+ commits: DOM menu text and controls, Phaser-owned scene composition, `css/title-screen-ashmere-v230.css`, and it adapts `tests/dom-ui-restore.spec.js`. This is the DOM-first title direction in practice. Its CI was red as of the last check — verify before believing it is mergeable.

## Branches: active versus abandoned

Nothing below is merged. Verify current state with the GitHub API rather than trusting this table.

| Branch | Status |
|---|---|
| `main` | Authoritative. Production. |
| `feat/ashmere-title-screen-v230` | **Active** — in-flight title screen, DOM-first |
| `fix/hybrid-rendering-foundation-20261117` | **Active** — owner's hybrid-render work; long-failing CI |
| `fix/phaser-transactional-presentation-20261117` | **Likely redundant** — overlaps hybrid-rendering; probably superseded |
| `fix/phaser-overlay-transactional-fallback-20261116` | **Abandoned** — superseded by the transactional-presentation branch |
| `base44/rescue/improve-website-layout-e366f3a` | **Abandoned** — 1 commit, ~69 behind |
| `feat/public-site-shell` | **Abandoned** — 1 commit, ~69 behind |
| `portal-v2-redesign` | **Abandoned** — 1 commit, ~92 behind |
| `ci/let-main-runs-complete` | **Disposable** — throwaway CI experiment |
| `doc/ai-handoff-refresh-20261117` | This document |
| `chore/housekeeping-dead-code-20261117` | #144, if still open |

## Priorities

1. **Complete the owner-directed rebuild in sequence.** Finish and test the Ashmere refuge (#148), then reduce Old Road screen clutter and present one active event/decision at a time, then redesign combat presentation. The durable plan and acceptance gates are in `docs/DARKEST_DUNGEON_REBUILD_PLAN.md`.
2. **Keep the interface DOM-first.** Let the owner judge remaining surfaces from the `?dom-ui=1` build, then retire redundant painters. Keep Phaser for world/scene art, atmosphere and transitions; do not add duplicate DOM-parity UI painters.
3. **Land the new title screen** (`feat/ashmere-title-screen-v230`) when it is validated against the current interface direction, and retire old title painters rather than leaving two title implementations.
4. **Split `phaser-world-v1.js`** into world-scene modules once UI painters are gone.
5. **Audio QA and remaining event hooks** — see below.
6. **Finish Greyfen as a coherent region** before treating it as done.
7. **Keep public information truthful** — blog, updates, README, guide, store copy, roadmap and changelog must distinguish shipped from in-progress. Several docs under `docs/` now contradict reality (`LEGEND_GAME_REBOOT_PLAN`, `REFACTOR_PLAN`, `v0.6-refactor-plan`, parts of `PHASER_MIGRATION.md`). Trust `CANON.md` for story, this file for engineering state.
8. **Triage the open issue backlog.** Multiple issues appear shipped in code and specs but remain open (for example the Silted Storehouse and Ashmere POI selection), so the visible backlog currently misrepresents the real work.

## Story and world guardrails

[`docs/CANON.md`](docs/CANON.md) is authoritative. Read it before writing dialogue, quests or lore.

- The speaking presence in traveler creation is shown only as **???**. Do not identify it as the Veil in player-facing content.
- Do not reveal or imply the traveler's hidden nature before an owner-approved reveal plan.
- The Hollow Saint, Last Mercy, Veil, echo rules, and old monster-war agreement are locked canon. The Five Arts as named disciplines, Strain, and the Afterwake remain proposals unless the owner separately approves them.
- Human wrongdoers remain human; do not turn the Greyfen crossing mistake into a supernatural plot.
- New towns and systems must be grounded in the current approved direction, not retired Pale Surveyor/Hollow Mile proposals.

## Creative direction

**Darkest Dungeon is the primary high-level creative reference.** Use expedition-led dark-fantasy atmosphere, strong illustrated silhouettes, expressive character presentation, tactical readability and field-report sensibility as inspiration only. Do not copy its assets, characters, interface, writing or sound. Mechanical inspiration is approved **within limits**: party formation, stress and torchlight are authorised systems. The authoritative guide is [docs/DARKEST_DUNGEON_DIRECTION.md](docs/DARKEST_DUNGEON_DIRECTION.md) — see "Approved gameplay systems" for the boundaries and for what still needs separate approval.

## Audio identity — integrated, final listening pending

- 48-asset generated pack (13 location/prologue ambience loops, 35 one-shots) plus a separately rendered original main theme, a roughly 10½-minute loop.
- `LegendRoadAudioV100` is the production world-audio director: one persistent theme loop, one environment/surface ambience loop, routed UI and battle effects, and it preserves the existing `legend-road-sound` preference as the single mute switch.
- `LegendTitleAudioV120` delegates title playback and menu cues to the director. Combat reuses the same score rather than starting a competing battle loop.
- The generated paths for additional story, creature, reward, travel, town and dungeon effects are available through the director for incremental event-by-event wiring. **Do not claim every one-shot is already triggered** by its corresponding gameplay event.
- A human listening pass for browser playback, levels, repeat seam and long-session fatigue has **not** been recorded as complete. Do not claim the soundtrack passed subjective QA.
- Intended identity: dark medieval fantasy with a recognisable LEGEND motif, expressive cello/strings, restrained horns, folk instrumentation, bronze-bell accents. Keep it playable over long sessions; avoid generic mobile-game cues, constant trailer percussion and overbearing brass.

## Architecture and persistence

- Active runtime uses versioned classic browser scripts loaded in explicit order by `index.html`, in dependency order, alongside the Phaser engine. Adding a module means adding a `<script>` tag and a cache-busting `?v=` query — there is no bundler.
- `LegendStorage` is the single owner of player save/load/normalization.
- Player save key: `legend-roads-of-ashmere-v09` (from `LEGEND_DATA.SAVE_KEY`).
- Settings key: `legend-settings-v1`. Road sound preference: `legend-road-sound`. Interface switch: `legend-dom-ui-restore`.
- Do not revive retired save keys or the old v087 road controller.
- Keep the established public `window.Legend...` facades stable unless a deliberate migration updates all callers and tests.
- 88 Playwright spec files under `tests/` cover journeys, contracts and per-surface behaviour. Several are the only documentation of intended behaviour — read the relevant spec before changing a system.

## Verification rules

- Run the focused contract spec(s) for the changed system, then the relevant journey specs.
- For anything touching `js/engine/`, also run `tests/dom-ui-restore.spec.js`: the switch must stay inert by default, and must restore native DOM without killing the Phaser canvas or scene art.
- CI (`playwright.yml`) triggers only on **pushes to `main`** and **pull requests to `main`**. A feature-branch push does **not** start the suite. To get a run, open a PR; `workflow_dispatch` needs the Actions scope, which the connected GitHub App and the current fine-grained token do not have.
- A successful commit or a queued workflow is **not** a green test. State plainly which tests ran and which did not.
- Test desktop around 1440×900 and critical mobile flows around 390px wide.
- Do not claim changes are live until the merge **and** the successful GitHub Pages deployment are confirmed.
- GitHub Pages serves `main` only. There are no per-branch preview deployments, so a branch's behaviour can only be checked locally (`npm run serve`, port 4173) or by merging.

## Current project links

- Realm Hub: https://tdtria.github.io/LEGEND-RPG/portal.html
- Live game: https://tdtria.github.io/LEGEND-RPG/
- Live game, DOM interface (testing only): https://tdtria.github.io/LEGEND-RPG/?dom-ui=1
- Development chronicle: https://tdtria.github.io/LEGEND-RPG/blog.html
- Development dispatch: https://tdtria.github.io/LEGEND-RPG/updates.html
- Player guide: https://tdtria.github.io/LEGEND-RPG/guide.html
- Playtest feedback: https://tdtria.github.io/LEGEND-RPG/feedback.html
- Repository: https://github.com/TDTRIA/LEGEND-RPG
