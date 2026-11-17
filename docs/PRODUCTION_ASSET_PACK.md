# Production Asset Pack — Ashmere & Greyfen

**Scope:** First two towns plus the Old Road art needed to connect them.  
**Art direction:** [ART-DIRECTION.md](ART-DIRECTION.md) — weathered storybook dark fantasy, grounded medieval materials, mist, moss, tarnished brass, ember light, and restrained blue magic.  
**Generation provider:** Runway connected workspace. All 500 available credits were used for this initial pack (25 outputs at the configured 20-credit generation cost).

## Export status

**The 25 original generations have been exported into stable local WebP files and committed to the repository.** The import report at `assets/generated/IMPORT_REPORT.md` records 25/25 successful exports. The nine-cell starter sprite sheet has also been sliced into individual WebP icons under `assets/generated/items/`.

The runtime manifest now points to local files in `js/systems/assets-v090.js`; it no longer depends on expiring Runway preview URLs. The title landscape, Ashmere hub, route art, selected town interiors, class portraits, enemy portraits, and item icons are wired into the game. Local fallback art remains in place intentionally.

**Remaining before treating the pack as fully visually signed off:** review every town interior and crop at desktop and 390px mobile widths, inspect the nine individual icon crops in-game at small sizes, verify contrast and loading behavior, and finish the Playwright suite. The title art and sprite-sheet grid were checked separately; the entire pack has not yet received a full visual QA pass.

## Traveler creation choice art — v0.21.1

The traveler creator now has a dedicated local choice-art atlas at `assets/generated/creation/creation-choice-atlas.svg`. Its 5×5 grid provides distinct illustrated-style glyph tiles for all four identity forms, five personality instincts, six origins, and six keepsakes. The six existing local class portraits remain the class-card art. Runtime uses this committed local file rather than an expiring hosted preview URL.

A richer Runway raster atlas was generated for this pass (task `4c3eb3ce-0e48-484e-a8d6-e77d0385a438`). It has **not** been imported into the repository: the hosted download failed in the available browser session, so the runtime deliberately remains on the local atlas and does not depend on the temporary signed URL. Replacing the glyph atlas with packaged, validated raster crops remains a visual-quality follow-up, not a runtime dependency.

The creator's review screen now summarizes the actual starting advantages from personality, origin, class, and keepsake. The underlying mechanics already compose class modifiers, origin bonuses, keepsake bonuses, and personality bonuses into road/combat skill scores; origin and keepsake starting items and gold are also retained. Identity/pronoun selections explicitly remain free of stat penalties.

## Traveler creation art and choice benefits — v0.21.1

- Local traveler choice art atlas: `assets/generated/creation/creation-choice-atlas.svg` (25 illustrated tiles arranged as a 5×5 atlas) covers identity, personality, origins, and keepsakes. Existing local class portraits remain in use for all six classes.
- Class, origin, keepsake, and personality effects are described on each choice card and surfaced again on the pre-waking review. Identity / pronoun forms have no gameplay penalty.
- A Runway raster atlas concept was generated, but the signed preview download could not be imported in this pass. Production runtime intentionally uses a committed local atlas and does not depend on the temporary Runway URL.
- Regression coverage verifies atlas image loading, displayed effects, saved character bonuses, and combined score contributions. The Bent Coin's +12% sale-value keepsake bonus is now applied to both individual market sales and bulk sale totals.

## Additional Work Board activity — v0.21.1

The current feature branch also integrates **Read the Blackroot Tracks**, a survival-based trail-reading contract. Its best response records print depth, stride, and direction before disturbing the evidence. It uses the existing job reward/progression path, pays 52g base (75g for a Perfect grade), and has browser regression coverage for its card, interaction, and payout.

## Follow-up generation — v0.20.15

The original 25-image production set is already committed locally (see the import report and manifest above). A follow-up Runway pass is in progress for the two remaining polish gaps identified by the roadmap:

| Asset | Runway task ID | Intended stable path | Purpose |
|---|---|---|---|
| Town/service icon atlas (3×3 grid: inn, market, smith, journal, map, work board, traveler, forked road, regional gate) | `e48d6c42-853c-4b7f-a217-6ca45e9ab4a7` | `assets/generated/ui/town-service-icon-atlas.png` plus nine cropped files under `assets/generated/ui/icons/` | Replace interim semantic reuse of item/portrait art in hub and service navigation |
| Captain Oric portrait | `3cf44cbd-3a72-4e18-8873-ecb2a2c2c5cb` | `assets/generated/npcs/captain-oric.webp` | Replace the interim Oric portrait/icon with a cast-consistent portrait |

**Import status:** the Runway-generated Captain Oric portrait has been exported and committed on the development branch as a local WebP at `assets/generated/npcs/captain-oric.webp`. The importer validated the source PNG signature and 1792×2400 dimensions, then converted the 5,870,268-byte PNG to a 262,938-byte WebP. Runtime code must use this stable path, never the temporary signed preview URL. The town/service icon atlas remains unimported; the Oric UI and full crop/responsiveness still require in-game browser verification before release.

## Environment and location scenes

| Asset | Runway task ID | Intended stable path | Used for |
|---|---|---|---|
| Moonlit Ashmere / Old Road title scene | Existing committed production art | `assets/title/title_bg_ashmere_road_v089.jpg` | Active cinematic game title background |
| Ashmere approach panorama | `9c1b471b-3f5c-49bd-891c-a8cd1ba46df4` | `assets/generated/title/title-ashmere-road.webp` | Alternate panorama for region and transition scenes |
| Ashmere town | `002a1265-9d17-4953-9e90-b6ecffebe596` | `assets/generated/locations/ashmere-town.webp` | Ashmere hub |
| Old Road / South Fork | `4cfd673e-4847-4240-8e0d-50bc62f142e1` | `assets/generated/locations/old-road-south-fork.webp` | Opening expedition scene |
| Roadside camp | `aa182f8a-cbed-47ac-83b2-7a83d92e0124` | `assets/generated/locations/roadside-camp.webp` | Wayfarer's Camp scene |
| High Ridge route | `25490a0e-e46e-4405-b009-dce23caff336` | `assets/generated/locations/high-ridge.webp` | Safer branch scene |
| Reed Cut route | `0a55ecb5-c845-48c5-a222-a1c508c5de42` | `assets/generated/locations/reed-cut.webp` | Riskier branch scene |
| Greyfen town | `77ab5ebb-f382-4a4a-b6b9-9475b44ca6ff` | `assets/generated/locations/greyfen-town.webp` | Second town hub |
| Ashmere Inn | `661239d9-231c-4892-86a2-049aa8f2ff67` | `assets/generated/locations/ashmere-inn.webp` | Rest and rumor screen |
| Ashmere Market | `22f64875-ba4b-40f5-bc41-1c37ce20417a` | `assets/generated/locations/ashmere-market.webp` | Buy and sell screen |
| Ashmere Forge | `141cf40c-cefc-46d5-bb9b-69b06aba55ba` | `assets/generated/locations/ashmere-forge.webp` | Blacksmith and crafting |
| Ashmere Archive | `4839c289-0170-44a4-afb7-8acb93d98d37` | `assets/generated/locations/ashmere-archive.webp` | Lore and memory screen |
| Greyfen Inn | `141b39da-bbb0-4420-9a07-b30059f4242a` | `assets/generated/locations/greyfen-inn.webp` | Rest and rumors in Greyfen |
| Greyfen Market | `48dd7c72-3746-47f8-b97b-5e2da547b586` | `assets/generated/locations/greyfen-market.webp` | Lowland trade screen |
| Greyfen Smithy | `0d4b76e3-8fbb-4874-8ba3-916aeb69f755` | `assets/generated/locations/greyfen-forge.webp` | Repairs and crafting in Greyfen |
| Greyfen Boundary Archive | `e69121f6-e2cb-4374-b8f2-ac8fe99cc205` | `assets/generated/locations/greyfen-archive.webp` | Boundary marks and bell-keeper lore |

## Class portraits

| Asset | Runway task ID | Intended stable path |
|---|---|---|
| Adventurer | `48b92d0e-8076-4c51-8974-d85f7f8843b6` | `assets/generated/classes/class-adventurer.webp` |
| Warrior | `7d2b45a2-7055-4675-a8a4-fd4b10dd99ad` | `assets/generated/classes/class-warrior.webp` |
| Ranger | `91c6f47b-d2f5-40a4-b487-4fbcd133270f` | `assets/generated/classes/class-ranger.webp` |
| Mage | `88444e9c-6c8e-495f-8c71-c1ed2c9ddde1` | `assets/generated/classes/class-mage.webp` |
| Thief | `920ded18-1ece-4f82-84b3-74d850217c32` | `assets/generated/classes/class-thief.webp` |
| Skiller | `a5d9e7b7-2c62-4845-85d4-9ce1668edc61` | `assets/generated/classes/class-skiller.webp` |

## Enemy portraits

| Asset | Runway task ID | Intended stable path |
|---|---|---|
| Blackroot Wolf | `e4d636a7-14f1-4de7-a262-fc158f2627e7` | `assets/generated/enemies/blackroot-wolf.webp` |
| Road Goblin | `f60fa014-58bf-423b-ace8-65e3f1da6ef8` | `assets/generated/enemies/road-goblin.webp` |
| Lantern Wisp | `8d2320be-fd79-4104-81c4-2c4a2d468248` | `assets/generated/enemies/lantern-wisp.webp` |

## Item icon sheet

| Asset | Runway task ID | Intended stable path |
|---|---|---|
| Nine-icon sprite sheet (Bell Fragment, Road Token, potion, ration, sword, bow, shield, Camp Supplies, Road Herbs) | `1a27ec00-7e03-42a0-9430-1ca6643b34fd` | `assets/generated/items/item-icon-sheet.webp` |

## Integration notes — v0.20.4

- The runtime manifest in `js/systems/assets-v090.js` points to committed local images; gameplay screens no longer rely on expiring generation-preview URLs.
- Ashmere and Greyfen use their town/interior scenes, the road uses the fork/camp/branch scenes, character creation uses six local class portraits, and combat uses the three local enemy portraits.
- The 3×3 starter item sheet has been sliced into nine individual image files. See `assets/generated/items/ICON_SLICES.md`; these real object illustrations are used for inventory, market, workshop loadout, and interface thumbnails.
- The Ashmere/Greyfen controller now uses local portrait and item artwork in place of its inline SVG line icons. This is an interim icon mapping from the available assets, not yet a dedicated illustrated icon atlas for every service. Generate a consistent town/service icon atlas when Runway is available again, then replace any reused portraits/item thumbs where the symbol isn't a good semantic match.
- The Trading Post uses Buy/Sell tabs and local item art; the Blacksmith leads with equipped gear and local weapon/shield art; Character Sheet is now a Traveler profile with portrait, vitals, loadout, and pack inventory.
- Full desktop and 390px mobile visual review remains outstanding. The deployed site was unreachable from the isolated browser due to `ERR_TUNNEL_CONNECTION_FAILED`, so no live-screen check is claimed.
- Do not call the art pack fully signed off until scene crops, icon semantics/centering, contrast, image loading/fallbacks, file size, and the Playwright smoke suite have been checked.


## Follow-up generation — v0.20.29: Greyfen, skills, equipment and services

The latest generated-art intake is now imported into stable local WebP files by the repository workflow. The importer also supports optional 3×3 atlas slicing: each listed grid is converted into a high-quality atlas plus individual 512px (or source-limited) icon crops, so individual UI and inventory assets can be used without loading a whole sprite sheet.

| Category | Stable paths |
|---|---|
| Town/service icons | `assets/generated/ui/town-service-icon-atlas.webp` and individual assets under `assets/generated/ui/icons/` |
| Magic/skills | `assets/generated/skills/skills-icon-atlas.webp` and individual assets under `assets/generated/skills/icons/` |
| Equipment/materials | `assets/generated/items/equipment-materials-atlas.webp`, equipment under `assets/generated/items/equipment/`, materials under `assets/generated/items/materials/` |
| Greyfen marsh route scene | `assets/generated/locations/greyfen-marsh-walkway.webp` |
| New bestiary portrait | `assets/generated/enemies/mirebound-sentinel.webp` |

The stable runtime manifest in `js/systems/assets-v090.js` exposes these paths; the Greyfen marsh scene is registered separately from the Greyfen town hub. The Inn action cards now use the new Inn, milestone, and journal illustrations. The new enemy portrait is searchable through the existing name-to-art mapping and is available for a Mirebound Sentinel encounter.

**Verification still required:** visually inspect the full atlas grids and individual crops, especially how their charcoal backgrounds read against UI panels; check at 1440×900 and 390px; verify image failure fallbacks and run the Playwright smoke suite. Registration and automated import are complete, but that does not constitute full visual sign-off or mean every skills icon is already used by a playable skills screen.


## Follow-up generation — v0.20.32: crafting, armor, Ashmere and Greyfen shops

Imported and registered three consistent icon atlases for the two current regions only.

| Category | Stable paths |
|---|---|
| Crafting bench | `assets/generated/items/crafting-icon-atlas.webp` and individual crops under `assets/generated/items/materials/` |
| Blacksmith armor | `assets/generated/items/armor-icon-atlas.webp` and individual crops under `assets/generated/items/armor/` |
| Ashmere/Greyfen shop identities | `assets/generated/ui/region-shop-icon-atlas.webp` and individual crops under `assets/generated/ui/region-shops/` |

The Crafting Bench now shows a distinct output illustration for every recipe and ingredient thumbnails beside the required materials. The Blacksmith's armor list and equipped armor slot select item-specific art instead of reusing the same shield for every armor. Ashmere destination cards now use their own inn, trader, forge, and workbench illustrations; Greyfen uses its marsh market, causeway smithy, and ferryman imagery, with the existing town icon retained for the inn. The Greyfen workbench art is shown on the crafting screen.

The atlas import workflow completed successfully and generated the individual WebP crops. Automated Playwright checks were triggered by the integration commits; full visual sign-off still depends on those checks completing and a desktop/mobile review.


## Workshop interaction polish — v0.20.33

- Crafting now confirms the exact item created and the ingredients consumed, with a compact status treatment that respects reduced-motion settings.
- Ingredient quantities remain visible beside their illustrations; recipes with insufficient stock remain disabled.
- Blacksmith cards compare candidate weapon maximum damage or armor defense against the currently equipped item.
- The equipped armor illustration is consistent between the workshop loadout and Traveler profile.
- Added Playwright coverage for locally served generated artwork and the workshop crafting/equipment interaction flow in `tests/workshop-art.spec.js`.
