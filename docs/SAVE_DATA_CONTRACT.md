# LEGEND current player/save data contract
Last reviewed: 2026-10-16

This documents the active production data path. Per the current project direction, legacy player-save import and the v087 road progression state are retired. The active player key and current record contract are the sole supported save format. This is not yet a strict schema validator.

## Persistence owners and keys

| Data | Owner | Storage key / behavior |
| --- | --- | --- |
| Active player record | `js/storage.js` / `window.LegendStorage` | `legend-roads-of-ashmere-v09` from `LEGEND_DATA.SAVE_KEY` |
| Settings | `LegendSettingsStorageV120` via `LegendStorage` facade | `legend-settings-v1` |
| Road audio preference | `js/systems/road/road-audio-v100.js` | `legend-road-sound` (`off` disables; other/missing values mean on) |
| Pending return to town | `js/core/game-runtime-v120.js` | session key `legend-awakening-return-to-town-v1` |
| Older optional title gate | `js/game.js` | session key `legend-roads-of-ashmere-title-gate-v09x` |

`LegendStorage.loadPlayer()` reads only `LEGEND_DATA.SAVE_KEY`, parses that value, and calls `normalize()`. An absent or malformed active save returns `null`. Old `legend-recovered-build-v0*` keys are no longer imported. `LegendRuntimeV120` delegates player reads/writes to `LegendStorage` and no longer provides its own legacy key fallback.

## Normalization behavior

`LegendStorage.normalize(player)` delegates to `LegendPlayerNormalizerV120.normalize(player)` and preserves the existing public API. The normalizer mutates the parsed player object in place and sets `player.version = LEGEND_DATA.VERSION`. It adds defaults for missing fields but does not enforce a strict whitelist or remove unknown fields. Existing unknown inventory entries, stat counters, flags, and nested state must therefore be preserved by refactors.

Current defaults include:

- Identity: `origin` (`Lost Squire`), `keepsake` (`Rusty Charm`), `gender` (`unspoken`), `genderLabel` (`Unspoken`), `pronouns` (`they/them`), `personality` (`kind`), and `personalityLabel` (`Kind-Hearted`).
- Creation bonuses: `creationV094.bonuses` and `creationV090.bonuses`. The normalized `creationV090.bonuses` combines its existing bonuses with `creationV094.bonuses`, with v094 values taking precedence.
- Inventory/equipment: missing item keys from `LEGEND_DATA.itemNames` become zero; missing `ownedWeapons` and `ownedArmor` default to `{hand:1}` and `{none:1}`.
- Stats: missing `stats` becomes an object. Defaults include `monstersDefeated`, `timesDied`, `checksPassed`, `checksFailed`, `oldRoadClears`, `oldRoadSuccesses`, `roadEvents`, `resourcesFound`, `townErrands`, `campsMade`, and `routesDiscovered`. Feature modules currently add additional counters such as `roadVictories` and `pointsOfInterest` dynamically.
- Flags: missing `flags` becomes an object. Known defaults include the Bell/first-road flags, Greyfen evidence flags, Sella errand flags, `introV094Complete`, and `tutorialStep`. Feature modules add more flags dynamically, including `sideContracts` and `greyfenDryCrossingComplete`; v100 expedition state uses `roadExpeditionV100`. `normalize()` now discards retired `roadV087` state. Never replace current flags with a fixed allowlist.
- Collections and travel: missing `skills`, `mastery`, `memories`, `questLog`, `quests`, `traits`, `bank`, `townTrust`, `npcTalk`, `discoveredRoutes`, `discoveredTowns`, `unlockedRegions`, and `discoveredRegions` get defaults. `currentRegion` defaults to `Ashmere` and is reset to `Ashmere` if it is not in `discoveredRegions`.

The defaults are not a guarantee of strict runtime types for every field; some are only filled when missing. Tightening validation requires a separate, compatibility-tested change.

## Player record fields observed in traveler creation

`js/systems/player/player-record-v094.js` builds new records from the choices collected by `js/systems/beginning-v094.js`. The builder hands the record to the existing `LegendStorage.normalize()` function; this table documents the resulting fields:

| Group | Fields |
| --- | --- |
| Identity | `username`, `gender`, `genderLabel`, `pronouns`, `personality`, `personalityLabel`, `origin`, `className`, `keepsake`, `traits`, `creationV094` |
| World and travel | `world`, `town`, `currentRegion`, `day`, `timeOfDay`, `fatigue`, `roadDanger`, `regionTravelCount`, `discoveredRoutes`, `discoveredTowns`, `unlockedRegions`, `discoveredRegions` |
| Progression | `level`, `hp`, `maxHp`, `xp`, `gold`, `momentum` |
| Inventory and equipment | `inventory`, `weapon`, `armor`, `ownedWeapons`, `ownedArmor`, `bank` |
| Records and systems | `stats`, `flags`, `skills`, `mastery`, `questLog`, `quests`, `memories`, `townTrust`, `npcTalk` |

This is a field map, not an exhaustive schema. Existing saves can contain fields added by later systems or earlier versions.

## Region and item identifiers

- Canonical region definitions and IDs live in `LEGEND_DATA.regions`: `Ashmere`, `Greyfen`, `Ironpass`, `Blackwood`, and `RuinedMarch`. Some listed regions are not yet available for normal play.
- Item/inventory identifiers are keys, not display labels; names live in `LEGEND_DATA.itemNames`. Examples include `roadToken`, `roadHerb`, `roadPoultice`, `bellFragment`, `wispLanternWick`, `food`, `camp`, and `potion`.
- Weapon and armor identifiers are defined in `LEGEND_DATA.weapons` and `LEGEND_DATA.armors`. Current examples include `hand`, `woodenSword`, `ironSword`, `none`, and `clothArmor`.
- `town` and `currentRegion` are not interchangeable in all old records. Keep compatibility fallbacks until all callers are mapped.

## XP and road-controller compatibility warning

The v087 road controller is retired from the active application. The v100 road controller is the sole supported path and uses `flags.roadExpeditionV100` with `LegendProgressionV100.award()`. That method owns the level-scaled XP threshold, level-up mutation, +8 max-HP increase, and +8 current-HP recovery per level. `LegendProgressionV100.status(player)` is the read-only source for current level, XP, next threshold, and profile-bar percentage; it does not mutate the player. Current road counters include `roadVictories`, `monstersDefeated`, and `oldRoadClears`. New travelers no longer receive `xpUntil`, and normalization discards `xpUntil` and `flags.roadV087` if those fields exist in a current-key record.

## Refactor invariants

1. Keep `LEGEND_DATA.SAVE_KEY`, settings/session keys, and the `legend-road-sound` preference unchanged during structural refactors.
2. Keep `LegendStorage` as the sole player save/load/normalize owner; `LegendRuntimeV120` is a navigation/return facade only.
3. Preserve unknown fields and dynamically added keys when loading, normalizing, or saving.
4. Do not rename flags, item IDs, region IDs, or equipment IDs without a dedicated migration plan.
5. Before further changing normalization, add fixtures for the active save shape and verify new-game/continue/region travel/return-to-Ashmere behavior.
6. Legacy-save import is intentionally unsupported in the new path; no automatic save reset is performed.
