# Tilesets & Sprites

Free CC0 / CC-BY game art wired for the Phaser world migration.

## Folder convention (important)

Every Kenney pack names its files the same way (`tile_0000.png`, `tile_0001.png`, ...).
Mixing two packs in one folder makes them overwrite each other — that is why this
directory uses **one subfolder per pack**:

```
assets/tilesets/rpg-urban/      Ashmere town: buildings, roads, fences, props
assets/tilesets/tiny-farm/      Countryside: grass, fields, water, paths (Old Road)
assets/tilesets/tiny-dungeon/   Dungeon interiors: walls, floors, doors (Bell Cellar)
assets/sprites/player/           Player character sheet with walk/run/combat animations
```

When adding a new pack, always create its own subfolder. Never drop loose
`tile_XXXX.png` files into `assets/tilesets/` directly.

## Packs

| Folder | Source | License | Notes |
|---|---|---|---|
| `rpg-urban` | Kenney "RPG Urban Pack" (kenney.nl) | CC0 | 486 tiles, 16x16. `tilemap/` holds the original Tiled tilemap files. |
| `tiny-farm` | Kenney "Tiny Farm" (kenney.nl) | CC0 | 132 tiles, 16x16. Grass, dirt, crops, water. |
| `tiny-dungeon` | Kenney "Tiny Dungeon" (kenney.nl) | CC0 | 132 tiles, 16x16. Dungeon walls/floors/doors. |
| `sprites/player` | LPC "Universal Spritesheet" base character | CC-BY-SA 3.0 / GPL 3.0 | **Attribution required** — see `lpc-credits.txt`. |

## Player sprite usage

`sprites/player/lpc-base-sheet.png` is a standard LPC sheet (832x3456, 64px frames):
rows are grouped by animation (spellcast, thrust, walk, slash, shoot, hurt, idle, run,
sit, climb, combat...), each in 4 directions (up / left / right / down).

Walk cycle rows in the classic LPC layout begin at row 32 (y = 2048), 9 frames per
direction, 64px cells. The sheet is a base "mannequin" — dress it by regenerating a
character at the LPC generator (add hair, tunic, pants, boots) and replacing this file;
keep the same layout so game code does not change.

## Phaser config for these assets

```
pixelArt: true          // nearest-neighbor scaling, keeps pixels crisp
16x16 tiles rendered at 3x-4x zoom
```
