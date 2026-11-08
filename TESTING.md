# LEGEND Playtesting Guide

This repo includes a Playwright setup for automated browser playtesting.

Playwright opens the game in a real browser, clicks through important flows, and reports if something breaks.

---

## What you need installed

Install Node.js first:

https://nodejs.org/

Recommended: Node.js 22 LTS or newer.

You do **not** need VS Code, but VS Code makes it easier.

---

## Run the free GitHub-hosted checks

The public repository runs its Playwright workflow automatically when code is pushed to `main`. The standard GitHub-hosted runner used by this public repository is free under GitHub's current Actions policy.

To start a run manually:

1. Open [LEGEND-RPG Actions](https://github.com/TDTRIA/LEGEND-RPG/actions).
2. Select **Playwright Tests**.
3. Choose **Run workflow** and the `main` branch.

The workflow checks JavaScript syntax, runs the automated regression suite against the checked-out source, then runs a separate live smoke test against the published GitHub Pages game. The live test waits for the published version and key asset URLs to match the commit under test before it clicks through character creation, different Work Board activities, the Forge/Crafting Bench, and side contracts. It also checks desktop title sizing, mobile overflow, and browser errors.

If a run fails, open the run and expand the failed step. The uploaded `playwright-report` artifact contains test details, screenshots, and video where available. A failed test means we found something to fix; it does not mean you need a paid browser session.

## First-time setup

Open a terminal in the `LEGEND-RPG` repo folder and run:

```bash
npm install
npx playwright install
```

This installs the testing packages and the browsers Playwright uses.

---

## Run all tests

```bash
npm run test:e2e
```

---

## Test the isolated Phaser reboot preview

The production suite covers the production Phaser renderer, Ashmere landmarks, town-service handoffs, Old Road scene mapping, and the non-Phaser fallback. The isolated `/prototypes/reboot/` preview runs separately so preview-only failures cannot obscure production-game results.

Run the preview checks separately when working on the prototype:

```bash
npm run test:e2e:phaser-preview
```

This uses Desktop Chrome against the separate prototype entry point. It does not replace the production regression suite.

---

## Run tests with the browser visible

```bash
npm run test:e2e:headed
```

---

## Open Playwright's visual test UI

```bash
npm run test:e2e:ui
```

This is the friendliest mode for watching the tests run step-by-step.

---

## Open the latest test report

```bash
npm run test:e2e:report
```

---

## Current validation checkpoint (2026-11-08)

Production main is **v0.30.5**. The road-first opening, mandatory annals, Oric/Wolf tutorial, five-stage Old Road, Ashmere services, progression, and early Greyfen activities remain the production content baseline. The Darkest Dungeon creative reference is presentation-only; no gameplay systems or rules were changed by the documentation alignment.

The generated soundtrack and Phaser shell changes are merged into main:
- [PR #98 — generated soundtrack/audio integration](https://github.com/TDTRIA/LEGEND-RPG/pull/98) merged as `807696aa177c9a45bd1b5f62a8bdea466e082551`. The 48-asset pack (13 ambience loops and 35 one-shot effects) plus the separately rendered roughly 10½-minute main-theme MP3 are included in production. The controller keeps one theme loop and one location ambience loop, follows Phaser environment/surface transitions, preserves `legend-road-sound`, and routes generated title/menu and battle effects.
- [PR #99 — Phaser shell drawer fix and browser coverage](https://github.com/TDTRIA/LEGEND-RPG/pull/99) is merged. Open mobile/tablet drawers now use opaque reading surfaces without removing desktop transparency; regression coverage exercises Ashmere touch navigation and service routes.
- [GitHub Pages deployment #41718562597](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41718562597) succeeded for the merged main commit above.
- The merged-main Playwright workflow [#41718563547](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41718563547) is running. Do not treat it as green until GitHub reports completion.
- Earlier PR-head Playwright runs #41717026033 (audio) and #41716283770 (Phaser) remain separate historical runs; their eventual conclusions do not replace verification of the merged main commit.

The active production engine is still hybrid. In main, Phaser 4.1 renders the persistent world layer, atmosphere, transitions, audio environment/surface cues, Ashmere landmarks, the new-player title, annals, traveler creation, and Oric's opening-road presentation. The remaining gameplay UI and interactive surfaces still need migration. Open [PR #111](https://github.com/TDTRIA/LEGEND-RPG/pull/111) advances the persistent HUD/navigation/drawers and Old Road presentation, but it is not part of main until merged and deployed. Continue moving every existing production surface into Phaser without creating parallel controllers, changing gameplay source-of-truth logic, or adding a second save system. The authoritative surface inventory and parity gates are in [docs/PHASER_MIGRATION.md](docs/PHASER_MIGRATION.md).

The main theme is integrated but has not yet received a human listening pass for real-browser playback, levels, repeat seam, and long-session fatigue. Additional generated world/town/reward effects are available through the audio director and should be wired to their individual successful gameplay actions incrementally.

Use the [latest Actions page](https://github.com/TDTRIA/LEGEND-RPG/actions) for current status rather than reusing historical run counts or treating a queued/running job as passed. Check the final main Playwright run after any further code change.

## Remaining high-value test gaps

- Region-appropriate enemy behaviors and readable intent patterns across multiple encounters.
- The complete first-session loop over a longer play session on desktop and the critical path on mobile.
- Full Firefox matrix and manual audible-output checks when deliberately scheduled.
