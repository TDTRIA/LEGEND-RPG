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

Production `main` is **v0.30.4** at [`662992a`](https://github.com/TDTRIA/LEGEND-RPG/commit/662992ae430069372424d27568032d35d845fa80).

Deployment and tests are separate:
- [Pages deployment #41643146692](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41643146692) succeeded for the current main commit.
- [Main Playwright run #41643147299](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41643147299) failed in `first Reed Cut return preserves its own clue and directs the player to Mara` at `tests/legend-smoke.spec.js:1544`. At stage 5/Greyfen Approach, the test's scripted finish action did not render `.exp100-outcome`; the page remained on the expedition scene. The downloadable `playwright-report` artifact contains the failed test trace, screenshot, and DOM snapshot.
- [Regression run #41659483982](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41659483982) failed on two unique Mobile Safari touch/transition tests and one desktop strict-mode locator. The Route Board test's `/Road Network/i` locator matched both the route-board card and the world-shell Road Network map action. The touch failures show the curtain/touch wait did not reach its expected settled state and the battle command touch target was not hit-testable.
- [PR #87](https://github.com/TDTRIA/LEGEND-RPG/pull/87) is the only open PR. It includes an updated Reed Cut test using a real Playwright locator click with explicit finish/outcome assertions; explicit pointer-event release on scene reveal; the scoped route-board selector; and Greyfen rumor/save-backfill coverage. Its latest final-head workflow [#41664720311](https://github.com/TDTRIA/LEGEND-RPG/actions/runs/41664720311) was still running when this checkpoint was written. Do not call it green or merge until it finishes.
- The separate Phaser migration PR #85 is closed and must stay out of the production game's work. The standalone Reed Cut test PR #86 is also closed because its changes were folded into #87.

The Reed Cut test should verify the whole player-facing flow, not merely a saved flag:
1. Complete a first Reed Cut expedition with the watcher-tracks clue selected and the Bell Fragment recovery state explicitly controlled.
2. Assert that the real finish action renders the expedition field report and that the report includes the route/clue/fragment outcome.
3. Return to Ashmere through the report action.
4. Open Mara's dialogue and verify the fragment-aware report, the saved route/discovery/fragment flags, and the next objective.

The default Playwright workflow runs all regression tests on Desktop Chrome and the touch-critical `mobile-smoke.spec.js` suite on Mobile Safari and Mobile Chrome. CI uses two workers and one retry. The optional full matrix runs all tests on desktop Firefox and both mobile projects. Always use the [latest Actions page](https://github.com/TDTRIA/LEGEND-RPG/actions) for the authoritative state.

## Remaining first-session validation gaps

- Healing Potion consumption and recovery through the live battle UI with a genuinely injured traveler; a full-health traveler correctly sees the item disabled.
- Enemy intent and response behavior across multiple encounter types, not just the first Old Road fight.
- A paced complete first-session desktop playthrough from title/annals through traveler creation, opening/tutorial, first Old Road trip, combat/result, level-up, and return to Ashmere.
- The critical title/creation/tutorial/Old Road/combat/return path at mobile widths, including touch reachability and no horizontal overflow.
- Greyfen's service/economy/story loop, save/reload continuity, and desktop/mobile visual acceptance before Ironpass is opened.

## Remaining high-value test gaps

- End-to-end Healing Potion use and enemy response on the live UI (unit/contract coverage exists).
- Region-appropriate enemy behaviors and readable intent patterns across multiple encounters.
- The complete first-session loop over a longer play session on desktop and the critical path on mobile.
- Full Firefox matrix and manual audible-output checks when deliberately scheduled.
