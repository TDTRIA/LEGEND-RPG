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

## Current validation baseline (2026-11-02)

Latest production main is `d098e57bd01f99d60ad9d1512a09e941916f147c` (app version v0.27.0).

- [Main Playwright workflow 40937100701](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40937100701): **207 passed, 3 failed, 1 skipped**. The JavaScript syntax check passed. The live Pages smoke step was skipped because the Playwright job failed.
- [Pages deployment workflow 40937098658](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/40937098658): completed successfully for the same main commit.
- The three Playwright failures are: (1) an Ashmere shell assertion that expects `background:none` but receives the intended low-opacity gradient; (2) a real 138px NPC portrait/name overlap in `tests/playtest-fixes-v0222.spec.js`; and (3) a brittle Old Road alpha string check that expects `0.90` while Chromium serializes it as `0.9`.
- The latest run is not a clean regression pass and does not include a live deployed smoke pass. Use [GitHub Actions](https://github.com/TDTRIA/LEGEND-RPG/actions) for newer evidence before release claims.

The current visual follow-up is tracked in [issue #76](https://github.com/TDTRIA/LEGEND-RPG/issues/76). Keep the scenery visible behind translucent large panels while retaining readable text and distinct controls. Record manual desktop/mobile screenshot review only after it is actually performed.

## Remaining high-value test gaps

- End-to-end Healing Potion use and enemy response on the live UI (unit/contract coverage exists).
- Region-appropriate enemy behaviors and readable intent patterns across multiple encounters.
- The complete first-session loop over a longer play session on desktop and the critical path on mobile.
- Full Firefox matrix and manual audible-output checks when deliberately scheduled.
