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

## Current validation checkpoint (2026-11-02)

Production main is **v0.30.3** at [bb77a6e](https://github.com/TDTRIA/LEGEND-RPG/commit/bb77a6ea267952035c15f8cb86a156947ecdfc62). The code/test correction commit is [8bde87e](https://github.com/TDTRIA/LEGEND-RPG/commit/8bde87e79b541989b7975b3cbc8b3d0e6fe0e36a); the public-site and store-copy refresh is [bb77a6e](https://github.com/TDTRIA/LEGEND-RPG/commit/bb77a6ea267952035c15f8cb86a156947ecdfc62).

Post-merge verification:
- [Final-head Playwright workflow #41540785980](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41540785980) is running on bb77a6e. Dependency installation and the critical JavaScript syntax gate have passed; the full browser suite is executing. Do **not** mark the suite green until its run completes.
- [GitHub Pages deployment #41540782943](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41540782943) succeeded for bb77a6e.
- The live game is https://tdtria.github.io/LEGEND-RPG/. The development chronicle is https://tdtria.github.io/LEGEND-RPG/blog.html and the updated dispatch is https://tdtria.github.io/LEGEND-RPG/updates.html.

The earlier v0.30.2 Playwright run #41531298438 failed with 15 test failures. The main causes were the runtime version file overwriting v0.30.2 with v0.27.0, tests still clicking the removed annals skip control, stale expected counts/data, missing navigation setup in one standalone contract test, and unseeded random token reward assertions. Those source/test issues were corrected in v0.30.3; this final-head run is the authoritative check.

Coverage in the current release includes mandatory three-part annals with no skip control, four distinct traveler identity emblems, rare Road Token and Bell Fragment outcomes, road encounter cadence, result and level progression, fragment-aware return dialogue, Greyfen Ferry Nets, the saved Silted Storehouse detour, and the Waterline Gauge handoff.

The default workflow runs the full regression suite on Desktop Chrome plus the touch-critical mobile-smoke.spec.js suite on Mobile Safari and Mobile Chrome. CI uses two workers and retries failing tests once; the optional full matrix adds Firefox and all tests on the mobile projects. Use the [latest Actions page](https://github.com/TDTRIA/LEGEND-RPG/actions) rather than relying on a historical count.

## Remaining high-value test gaps

- End-to-end Healing Potion use and enemy response on the live UI (unit/contract coverage exists).
- Region-appropriate enemy behaviors and readable intent patterns across multiple encounters.
- The complete first-session loop over a longer play session on desktop and the critical path on mobile.
- Full Firefox matrix and manual audible-output checks when deliberately scheduled.
