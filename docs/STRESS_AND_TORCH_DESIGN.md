# Stress & Torchlight — Design Outline

**Status:** Proposal for owner approval
**Approved by:** `docs/DARKEST_DUNGEON_DIRECTION.md` → "Approved gameplay systems" (2026-11-17)
**Scope:** Two systems, built in the order **torch → stress**. Party formation is a third system and is deliberately out of scope here.
**Principle:** Both are *additive*. Existing combat formulas, reward odds, progression, and the current five-stage settlement contract must behave identically when these systems are at their neutral values.

---

## 1. Torchlight

### Why it goes first

Torch is one number on the expedition state. It needs no combat rewrite, no party, and no new UI beyond a meter. It is also the **input the Phaser world layer needs for lighting** — so building it unblocks the atmosphere work at the same time.

### State

```js
player.flags.roadExpeditionV100.torch = 100   // 0–100, integer
player.inventory.torch                        // consumable count
```

Lives alongside the existing `pressure`, `stage`, `roadClockHour` fields. Owned by `js/systems/road/road-state-v100.js` — not a new module.

### Bands, not a continuous float

Four discrete bands. The player must be able to read their state at a glance, the Phaser layer gets four visual states instead of a float, and a spec can assert each one.

| Band | Range | Encounter chance | Loot quality | Stress gain | Presentation |
|---|---|---|---|---|---|
| **Bright** | 70–100 | −15% | baseline | baseline | warm pool, low vignette, few embers |
| **Dim** | 40–69 | baseline | baseline | baseline | neutral, moderate vignette |
| **Dark** | 15–39 | +15% | +1 tier | ×1.5 | deep vignette, embers, cold edge |
| **Black** | 0–14 | +30%, forced ambush | +2 tiers | ×2 | near-black edges, heavy vignette, sparse vision |

### Drain and refill

- Expedition starts at **100**
- **−10 per travel stretch** (5-stretch run ends near 50 with no refills — the player will feel the pressure without being forced to micromanage)
- **−15 per camp** without a lit fire; a lit camp costs 1 torch and restores **+20**
- **Torch item:** +35, capped at 100. Sold at the Ashmere market (existing commerce module)

### The balance constraint (important)

The existing contract is locked by tests:

> A completed five-stage expedition at baseline Pressure 20 settles **80 gold, 33 XP**, and has a **65% Road Token roll**.

**Torch must not change that at Bright or Dim.** Those bands are the current game. Only Dark and Black improve loot, and only they raise danger. This means the dial adds a choice without rebalancing the existing run — and the existing spec keeps passing unchanged.

### Files touched

| File | Change |
|---|---|
| `js/systems/road/road-state-v100.js` | `torch` init, clamp 0–100, band resolver |
| `js/systems/road/road-actions-v100.js` | drain per stretch/camp; encounter chance by band |
| `js/systems/road/road-results-v100.js` | loot tier by band |
| `js/systems/road/road-view-v100.js` | torch meter + band label |
| `js/storage/player-normalizer-v120.js` | default `torch = 100` for existing saves |
| `js/engine/phaser-world-v1.js` | read band → vignette/ember intensity |

### Spec

`tests/torch-contract.spec.js` — band boundaries (14/15, 39/40, 69/70), clamp at 0 and 100, drain per stretch, refill cap, baseline settlement unchanged at Bright/Dim.

---

## 2. Stress

### Scope for v1: the traveler only

Stress is per-character in Darkest Dungeon, but party formation doesn't exist yet. Two options:

- **(A) Recommended:** `player.stress` now; when party arrives, a normalizer rule moves it to `party[0].stress`. One small, planned migration.
- **(B)** Build the party roster first so stress attaches to members immediately — but that inverts the safe order and drags in the combat rewrite.

**Take (A).** The migration is a scalar → field move that `player-normalizer-v120.js` already knows how to do, and it keeps stress shippable this week.

### State

```js
player.stress     // 0–100 integer
player.affliction // string id, or null
```

### Sources

| Source | Δ stress |
|---|---|
| Travel stretch at **Dark** | +2 |
| Travel stretch at **Black** | +4 |
| Critical hit taken | +6 |
| Horror POI / canon beat (the bell, the wolf) | +8 |
| Camp without watch | +5 |
| Ally downed *(when party exists)* | +10 |
| Secured return to Ashmere | −5 |
| Inn rest | −15 *(existing service, no new UI)* |

### Thresholds

| Range | State | Effect |
|---|---|---|
| 0–49 | **Steady** | none |
| 50–74 | **Rattled** | +10% damage taken |
| 75–99 | **Strained** | +20% damage taken, −1 to skill checks |
| 100 | **Resolve check** | → Affliction (75%) or Virtue (25%), stress resets to 60 |

All effects are **gated on stress > 0**, so a player at zero plays exactly the game that exists today. No formula changes at baseline.

### Afflictions — LEGEND's own vocabulary

Written from the world, not imported. Each is small, mechanical, and testable:

- **Bell-Touched** — hears the bell when no one else does. Refuses to be last in the line.
- **Lantern-Shy** — will not advance into darkness. Blocks travel at Black until a torch is lit.
- **Ash-Gripped** — hoards. Refuses to use consumables without a check.
- **Road-Weary** — slows the party; costs one extra travel stretch.
- **Hollow-Spoken** — goes silent. Dialogue options collapse to the shortest response.

### Virtues

- **Steadfast** — immune to further stress gain this expedition.
- **Clear-Eyed** — enemy intent is revealed one turn earlier.
- **Kindled** — −2 stress per stretch for the whole party.

### Persistence

- Afflictions persist for the **current expedition only** and clear on secured return.
- Stress persists across expeditions until treated at the Inn.
- Missing fields default to `stress = 0`, `affliction = null` in `player-normalizer-v120.js`.

### Files touched

| File | Change |
|---|---|
| `js/systems/road/road-state-v100.js` | `stress` init, clamp, threshold resolver |
| `js/systems/road/road-combat-v100.js` | stress on crit taken; Rattled/Strained damage modifiers |
| `js/systems/road/road-actions-v100.js` | stress per stretch by torch band; camp watch |
| `js/systems/road/road-results-v100.js` | secured-return relief; affliction clear |
| `js/systems/road/stress-catalog-v1.js` *(new)* | affliction and virtue definitions |
| `js/storage/player-normalizer-v120.js` | defaults |
| `docs/SAVE_DATA_CONTRACT.md` | new fields |

### Spec

`tests/stress-contract.spec.js` — threshold boundaries, resolve-check distribution, baseline combat unchanged at 0 stress, affliction clears on return, save round-trip.

---

## 3. Build order and acceptance

| Step | Work | Gate |
|---|---|---|
| 1 | Torch state + bands + drain | `torch-contract.spec.js` green; existing settlement spec unchanged |
| 2 | Torch meter in the DOM view | desktop 1440×900 + mobile 390px |
| 3 | Phaser vignette reads torch band | visual check at each of the four bands |
| 4 | Stress state + thresholds + catalog | `stress-contract.spec.js` green |
| 5 | Stress accrual in travel and combat | full road journey spec still green |
| 6 | Afflictions/virtues in play | one affliction and one virtue reachable in a real run |

Each step is one session. **No step begins until the previous one is green on `main`.**

---

## 4. Open decisions for the owner

1. **Torch drain rate** — −10/stretch is a proposal; tune after one playthrough.
2. **Inn rest cost** — should −15 stress cost gold, or be free with a cooldown?
3. **Affliction count** — five is a starting set; more can be added without schema change.
4. **Does stress carry into the next expedition?** Proposal says yes, until treated. The alternative — reset on return — makes the Inn less meaningful.
5. **Virtue frequency** — 25% is Darkest Dungeon's feel. 35% is gentler for a game with fewer party members.
