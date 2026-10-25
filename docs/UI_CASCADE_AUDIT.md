# LEGEND UI Phase 3 — CSS Cascade Audit

**Baseline:** `main` at `5465efb09842dc9ece57dabe32ef8e736db9c94c` (2026-10-25), after Phase 2 was merged and published.  
**Branch:** `feat/ui-phase3-cascade-audit-v190`  
**Purpose:** document the active stylesheet order and repeated selector ownership before consolidation. This audit is intentionally non-destructive: a repeated selector is not, by itself, proof that a file or rule is obsolete.

## Why this audit exists

LEGEND’s presentation evolved in layers: compatibility styles, location/service themes, title treatments, world/expedition layers, art polish, progression results, the shared UI system, and the persistent world shell. Several of the later rules deliberately win over earlier rules. Removing one because its name appears more than once can change a screen even when the rule looks redundant in isolation.

Phase 1 added `css/legend-ui-system-v160.css` after the older theme stack; the persistent shell adds `css/legend-world-shell-v170.css` after that. Phase 2 PR #47 is merged: `css/legend-ui-rollout-v180.css` now follows both in production. Phase 3 audits this actual 37-sheet stack and only consolidates styles when regression evidence shows which rules are safely redundant.

## Live stylesheet order on the audited baseline

The positions below come directly from `index.html`, not a guessed dependency order.

| Position | Stylesheet | Role / audit note |
|---:|---|---|
| 1 | `css/style.css` | Original base/runtime layout; retain until every surviving screen dependency is proven absent. |
| 2 | `css/game-ui-v090.css` | Early shared game surfaces. |
| 3 | `css/beginning-v094.css` | Traveler creation plus legacy town polish selectors. |
| 4 | `css/road-combat-v093.css` | Earlier combat styling; check against the active v100 battle view. |
| 5 | `css/ashmere-v099.css` | Ashmere/service theme base. |
| 6 | `css/ashmere-town-terminal-v09x.css` | Terminal/navigation treatment. |
| 7 | `css/settings-v09x.css` | Settings baseline. |
| 8 | `css/account-v09x.css` | Account/profile baseline. |
| 9 | `css/game-polish-v09x.css` | Cross-screen polish/compatibility. |
| 10 | `css/title-realm-polish-v09x.css` | Realm/title early polish. |
| 11 | `css/title-menu-cleanup-v09x.css` | Early title-menu overrides. |
| 12 | `css/intro-gate-cinematic-v09x.css` | Entry/intro treatment. |
| 13 | `css/realm-portal-comfort-v09x.css` | Realm-entry usability. |
| 14 | `css/account-auth-polish-v09x.css` | Account/auth overrides. |
| 15 | `css/realm-portal-gamefeel-v09x.css` | Realm-entry game feel. |
| 16 | `css/mobile-safety-v09x.css` | Mobile safety/accessibility overrides. |
| 17 | `css/road-expedition-v100.css` | Expedition UI base. |
| 18 | `css/ashmere-town-v100.css` | Ashmere hub/navigation. |
| 19 | `css/ashmere-workshops-v100.css` | Services, economy, crafting and later Ashmere overrides. |
| 20 | `css/region-travel-v100.css` | Region travel/map. |
| 21 | `css/title-cinematic-v120.css` | Cinematic title composition. |
| 22 | `css/title-awakening-v130.css` | Current title identity and visual treatment. |
| 23 | `css/title-logo-fit-v131.css` | Raster logo fit/responsiveness. |
| 24 | `css/title-interaction-polish-v133.css` | Title interaction/motion. |
| 25 | `css/title-finish-v134.css` | Title finish overrides. |
| 26 | `css/title-screen-v135.css` | Active title screen layout. |
| 27 | `css/title-rpg-menu-v136.css` | RPG menu hierarchy/controls. |
| 28 | `css/title-dispatches-v140.css` | News/roadmap title sub-screen. |
| 29 | `css/opening-road-v140.css` | Dead Lantern/opening road screens. |
| 30 | `css/immersive-world-v150.css` | Shared immersive world, road, and region presentation. |
| 31 | `css/bell-vault-v100.css` | Bell Cellar dungeon. |
| 32 | `css/world-client-boot-v100.css` | Boot/loading layer. |
| 33 | `css/runway-art-pass-v151.css` | Art sizing/placement fixes. |
| 34 | `css/progression-results-v152.css` | Growth/results presentation. |
| 35 | `css/legend-ui-system-v160.css` | Phase 1 shared palette/frame/accessibility layer; intentionally last among the older themed layers. |
| 36 | `css/legend-world-shell-v170.css` | Persistent contextual world shell. |
| 37 | `css/legend-ui-rollout-v180.css` | Phase 2 extension for creation/opening, inventory, services, region travel, combat, results and dungeon. Must remain after v160 and v170. |

## High-confidence overlap hotspots to review

These are repeated selectors observed across the stylesheet source. They are **review targets, not deletions approved by this document**.

| Selector / family | Files observed | Why it needs care |
|---|---|---|
| `.ash099-screen` | `ashmere-v099.css`, `ashmere-workshops-v100.css`, `legend-ui-system-v160.css`, `legend-ui-rollout-v180.css` | Service root layout, later workshop theme, Phase 1 frame, and Phase 2 material treatment contribute different properties. |
| `.title-v100 .v120-title-backdrop`, `.title-v100 .v120-title-main`, `.title-v100 .v120-title-hero`, `.title-v100 .v120-title-hero .v120-legend-logo` | `title-screen-v135.css`, `legend-ui-system-v160.css` | v160 intentionally retunes the production title after the v135 composition. |
| `.title-v136-rpg .v120-title-main`, `.title-v136-rpg .v120-title-hero` | `title-rpg-menu-v136.css`, `immersive-world-v150.css` | Menu and immersive layers are both responsible for the final title arrangement. |
| `.exp100:has(.exp150-world-page) ...` | `immersive-world-v150.css`, `legend-ui-system-v160.css` | Scene-first expedition layout and shared material refinements overlap. |
| Shared control selectors across service CSS and v160/v180 | `ashmere-workshops-v100.css`, `legend-ui-system-v160.css`, `legend-ui-rollout-v180.css` | Newer design-system layers intentionally refine controls; removing legacy styles before coverage is proven may affect non-primary routes. |

An automated text scan also matches CSS keyframe keywords such as `from` and `to`; those are not selector collisions. Future audits must distinguish genuine shared selectors from keyframes, media-query context, and intentional component-specific overrides.

## Phase 3 implementation gates

- [x] Record the active baseline load order from `index.html`.
- [x] Record concrete overlap hotspots and why order matters.
- [x] Add a regression test for duplicate stylesheet links, order of v160 → v170 → v180, and all local CSS URLs returning HTTP 200.
- [x] Capture title screenshots at desktop and 390px in the Playwright artifact; verify document/body width does not exceed the viewport.
- [x] Rebase this audit on the post-Phase-2 `main` tree before opening its PR.
- [ ] For each proposed CSS deletion or consolidation, cite the owning module/screen, show before/after screenshots or computed styles, and run relevant interaction regressions.
- [ ] Only remove rules with evidence that they are unused or superseded across the full reachable screen inventory.
- [ ] Update cache/version query conventions as a separate release step after consolidated CSS is verified.

## Non-goals for this audit

Do not change story text, world canon, button handlers, save keys/schema, economy, route gates, XP/rewards, combat formulas, or availability of Greyfen Marsh Path / Ironpass. Do not replace the raster Runway wordmark with an SVG. The audit is not a license to delete accumulated styles in bulk.
