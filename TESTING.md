# LEGEND automated playtesting

Playwright is the browser-level regression layer for the production LEGEND game. It should verify user-visible journeys and gameplay outcomes, not only whether screens render.

## Commands

```bash
npm install
npx playwright install
npm run test:e2e                 # default regression + touch-critical mobile suites
npm run test:e2e:headed          # watch tests in a browser
npm run test:e2e:ui              # interactive Playwright runner
npm run test:e2e:report          # open the latest HTML report
FULL_BROWSER_MATRIX=1 npm run test:e2e  # full suite on desktop Chrome, desktop Firefox, Mobile Safari and Mobile Chrome
```

The GitHub Actions workflow also runs syntax checks and, on main, a separate smoke test against the published GitHub Pages deployment. A local branch's source tests and the live deployment test answer different questions; don't treat one as a substitute for the other.

## Test layers

- **End-to-end journeys:** use visible controls and assert meaningful state/outcome changes.
- **Targeted regression tests:** set up a specific state only when necessary to isolate a hard-to-reach rule; assert both the resulting UI and persisted state.
- **Mobile interaction tests:** use real touch taps and verify critical controls are visible, reachable and not covered.
- **Deployment smoke tests:** verify published version and key asset references before testing the deployed experience.
- **Static checks:** syntax validation catches parse errors but does not establish gameplay correctness.

Shared setup and journey helpers live in tests/helpers/. Keep helper code small and behavior-focused; don't move assertions into helpers if that would hide what an individual test guarantees.

## Coverage inventory

This is the working inventory of critical coverage, not a claim that every row is currently complete. Update it when gameplay systems or test files change.

| Area | Minimum behavior to verify | Current status / next work |
|---|---|---|
| Boot/title/build | title, version consistency, key title art, menu and dialog accessibility | Existing desktop coverage; retain |
| Character creation | valid character reaches Ashmere; blank name rejected; choices persist | Existing journey coverage; broaden combinations |
| Regional hubs | Ashmere/Greyfen identity, destinations, regional services and routes | Existing targeted coverage; verify genuine travel journey |
| Road/expedition | route choice, event outcomes, discovery, return to town | Partial; add full start-to-return journey |
| Combat | Attack, Guard, class move, enemy turn, health/resources, victory/defeat and rewards | Victory reward is asserted; draft PR #24 adds potion accounting and defeat/recovery with no-loot checks (expanded CI pending); class-technique cooldown edges remain |
| Quests/contracts | accept, objectives, turn-in, rewards, duplicate turn-in prevention | One contract's turn-in and reload persistence verified; broaden contract types and duplicate-attempt checks |
| Inventory/equipment | gain, consume, buy, sell, equip, unequip and resource accounting | Market buy/sell and weapon purchase/equip transactions asserted; consumables and unequip remain |
| Crafting/workshops | valid and invalid recipes, materials consumed, outputs granted | Exact Road Poultice ingredient/output accounting and insufficient-ingredient disabling passed in workflow #1343; broader recipe/save coverage remains |
| Saves/continue | reload, continue, region/quest/inventory state survives | Existing continue/contract persistence coverage; draft PR #24 adds full page reload checks for loadout, inventory, journal and progression (expanded CI pending) |
| Errors/assets | uncaught exceptions, failed first-party assets, missing registered assets | Draft PR #24 adds a shared uncaught-page-error assertion to all production smoke regressions (workflow #1399 pending); failed-request/asset monitoring remains partial |
| Responsive/accessibility | overflow, reachable touch controls, dialog focus and keyboard close | Existing smoke checks; expand key gameplay screens |
| Browser compatibility | critical journeys in Chromium, Firefox and WebKit | Default matrix is intentionally reduced; schedule/run full matrix |
| Live deployment | published version/assets match expected release; core journeys work | Separate gated workflow; verify latest run status |

## Rules for reliable tests

1. Prefer accessible roles/names and stable data-* selectors over styling classes where practical.
2. Assert behavior and state changes, not just that a button exists or a panel opens.
3. Use isolated Playwright browser contexts and never rely on a developer's real save.
4. Avoid direct internal-state mutation in end-to-end tests. Keep it for explicitly labeled targeted regression tests.
5. Don't silence console errors, increase timeouts, or weaken assertions merely to make a flaky test pass. Diagnose the underlying cause first.
6. Every bug fix should add or update a regression test that fails before the fix and passes afterward.
7. Treat full-browser and live-deployment results as separate signals, and report which ones actually ran.
