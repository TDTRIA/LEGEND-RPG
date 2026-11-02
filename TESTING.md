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

Production main is **v0.30.2**. The v0.30.0 gameplay slice was integrated by [PR #82](https://github.com/TDTRIA/LEGEND-RPG/pull/82) as commit [`8080350`](https://github.com/TDTRIA/LEGEND-RPG/commit/80803500edf748a57e8e631fe8e5fab5c0a90b86). The mandatory-annals renderer/version/cache patch is on main at [`034ca72`](https://github.com/TDTRIA/LEGEND-RPG/commit/034ca72d44e4c6e8a65315dcd8b2ba97105b48fa), and deterministic Road Token tests were added at [`e0dd3ed`](https://github.com/TDTRIA/LEGEND-RPG/commit/e0dd3ed495336b4c363380ee57e475a9936bebf8).

Post-merge verification:
- [Main Playwright workflow #41530579050](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41530579050) is running on `e0dd3ed`. Setup, browser installation, and the critical JavaScript syntax gate passed; the full browser suite is still running. Do **not** call the full suite green until this run completes.
- [Pages deployment #41530576562](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41530576562) succeeded for `e0dd3ed`.
- The live GitHub Pages game is https://tdtria.github.io/LEGEND-RPG/.

The default workflow runs the full regression suite on Desktop Chrome plus the touch-critical `mobile-smoke.spec.js` suite on Mobile Safari and Mobile Chrome. CI uses two workers and retries failing tests once; the optional full matrix adds Firefox and all tests on the mobile projects. Use the [latest Actions page](https://github.com/TDTRIA/LEGEND-RPG/actions) rather than relying on a historical count.

Coverage added with v0.30.0–v0.30.2 includes mandatory three-part annals with no skip control, rare Road Token and Bell Fragment outcomes, combat XP balance, fragment-aware return dialogue, Greyfen Ferry Nets, the saved Silted Storehouse detour, the Waterline Gauge handoff, and the right-panel expedition-return action, and the generated Road Token reward-art asset load.

## Remaining high-value test gaps

- End-to-end Healing Potion use and enemy response on the live UI (unit/contract coverage exists).
- Region-appropriate enemy behaviors and readable intent patterns across multiple encounters.
- The complete first-session loop over a longer play session on desktop and the critical path on mobile.
- Full Firefox matrix and manual audible-output checks when deliberately scheduled.
