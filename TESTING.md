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

## Current validation checkpoint (2026-11-03)

Production main is **v0.30.4**. The current published build contains the Runway traveler identity portraits, mandatory opening annals, road-first Oric/Wolf tutorial, balanced Old Road rewards, illustrated expedition report, and partial Greyfen content.

The latest audio work is staged separately in [PR #98](https://github.com/TDTRIA/LEGEND-RPG/pull/98):
- The import workflow completed successfully and the branch contains 13 ambience loops and 35 one-shot audio effects.
- The original main-theme source was corrected after the first render attempt failed on malformed encoded input. The replacement MP3 must still be confirmed and the new sound must be integrated before this audio work is considered shipped.
- The PR Playwright run is still pending at this checkpoint. Do not mark the branch green until the final-head workflow completes; do not treat its status as a verification of the live main branch.

The active production engine is hybrid: Phaser 4.1 renders the persistent world layer, while the existing browser modules still own most UI, dialogue, account, combat, expedition, and save behavior. Phaser migration itself must be verified surface by surface; no save migration is part of it.

Use the [latest Actions page](https://github.com/TDTRIA/LEGEND-RPG/actions) for the live status rather than reusing historical run counts or treating a queued/running job as passed. GitHub Pages deployment and the deployed smoke test must succeed after merge before claiming a release is live.

## Remaining high-value test gaps

- End-to-end Healing Potion use and enemy response on the live UI (unit/contract coverage exists).
- Region-appropriate enemy behaviors and readable intent patterns across multiple encounters.
- The complete first-session loop over a longer play session on desktop and the critical path on mobile.
- Full Firefox matrix and manual audible-output checks when deliberately scheduled.
