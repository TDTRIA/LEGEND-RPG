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
