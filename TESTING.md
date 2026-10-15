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

The workflow runs independent Playwright jobs for Desktop Chrome, Mobile Safari, and Mobile Chrome, so each browser profile reports its own result. Each job checks critical JavaScript syntax before running the regression suite. The Desktop Chrome job then checks the published GitHub Pages build even if its source regression suite fails, provided setup and syntax checks succeeded. The live test waits for the published version and key asset URLs to match the commit under test before it clicks through character creation, different Work Board activities, the Forge/Crafting Bench, and side contracts. It also checks desktop title sizing, mobile overflow, and browser errors. Repeated pushes to the same branch are queued rather than running multiple broad test matrices concurrently.

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

## Focused regression diagnosis

The workflow runs a short **Focused road-discovery diagnostic** job before the full matrix. It creates a synthetic traveler, takes the Reed Cut, advances to the first discovery, clicks **Look closer**, and records whether the click reached the document, whether the discovery panel appeared, and whether browser errors were raised. This isolates the known interaction from the rest of the suite; the full browser jobs still run afterward.

## Current smoke tests

The starter tests check that:

- The title screen loads.
- A new player can create a character.
- The player can reach Ashmere.
- Core menu buttons appear.
- The player can talk to Mara.
- The player can open Ashmere Inn.
- The player can enter The First Road route screen.
- The desktop page has no obvious horizontal overflow.
- The mobile layout loads and has tappable buttons.

---

## Future tests to add

Good next automated tests:

- Complete The Bell That Rang Once.
- Collect 3 Road Tokens and turn them in to Brenn.
- Trigger combat and use Attack, Guard, and Class Move.
- Buy Camp Supplies and Make Camp while exploring.
- Sell drops at the Trading Post.
- Check that mobile battle buttons stay reachable.
