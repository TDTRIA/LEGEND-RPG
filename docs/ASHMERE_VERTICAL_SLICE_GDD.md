# LEGEND: Roads of Ashmere — Ashmere Vertical Slice GDD

**Target:** v0.9.x polish path toward the first public 1.0 vertical slice  
**Scope:** Ashmere first town + Old Road loop  
**Design intent:** Make the first town feel like a real dark medieval RPG hub with repeatable activities, meaningful preparation, varied road events, enemy traits, loot, crafting, and immersive UI presentation.

---

## 1. Vertical Slice Vision

The 1.0 drop should not try to be the whole game. It should be a complete, polished slice:

1. Player creates a traveler.
2. Player enters Ashmere.
3. Player learns the town through NPCs, services, jobs, crafting, and preparation.
4. Player travels the Old Road.
5. Player experiences varied events, sub-locations, checks, enemies, loot, and choices.
6. Player returns to Ashmere.
7. Player sells, crafts, heals, upgrades, turns in proof, and repeats.
8. Player sees clear hints of a larger world beyond the current build.

The loop should feel complete even before the next town exists.

---

## 2. Core Player Loop

### Main Loop

```text
Title / Account / Traveler Select
        ↓
Create or Continue Traveler
        ↓
Ashmere Hub
        ↓
Talk / Shop / Rest / Work / Craft / Prepare
        ↓
Old Road Expedition
        ↓
Events / Checks / Sub-locations / Combat / Loot
        ↓
Return to Ashmere
        ↓
Sell / Craft / Upgrade / Turn In / Unlock New Hints
        ↓
Repeat with stronger traveler and deeper road variety
```

### Player Motivations

- Gather Road Tokens and proof.
- Earn gold.
- Improve gear.
- Craft useful items.
- Discover road sub-locations.
- Learn Ashmere’s lore.
- Build a traveler identity.
- Prepare for future towns.

---

## 3. Design Pillars

### 3.1 The Town Must Feel Useful

Ashmere is not just a menu. It is the player’s base camp.

The player should want to return because Ashmere offers:

- Healing and safety.
- NPC guidance.
- Jobs and minor tasks.
- Crafting and upgrades.
- Shops and trade.
- Lore and progression.
- Account/traveler management.

### 3.2 The Road Must Feel Unpredictable

The Old Road should not be only combat and dice text.

It should include:

- Combat encounters.
- Skill checks.
- Loot finds.
- Environmental hazards.
- Sub-locations.
- NPC or stranger events.
- Ambushes.
- Optional risks.
- Different outcomes based on supplies, traits, and choices.

### 3.3 Enemies Must Have Personality

Even enemies sharing art should vary through:

- Traits.
- Behavior patterns.
- Loot tables.
- Combat tendencies.
- Descriptions.
- Status effects.
- Risk/reward differences.

### 3.4 UI Must Feel Like a Game

Avoid website-like forms and plain lists.

Every major screen should use:

- Dark fantasy panels.
- Icons.
- Framed art.
- Clear hierarchy.
- Subtle animation.
- Action-focused buttons.
- RPG terminology.
- Minimal raw debug text.

---

## 4. Ashmere Town Hub

### 4.1 Main Hub Screen

Purpose: Central decision space.

Elements:

- Ashmere main street background.
- Current objective panel.
- Traveler status panel.
- Town action menu.
- Icons for each action.
- Subtle animated embers / fog.

Core actions:

| Action | Purpose |
|---|---|
| Town Square | Talk to NPCs and receive guidance. |
| Ashmere Inn | Rest, buy lodging, receive rumors. |
| Trading Post | Buy/sell supplies and road loot. |
| Blacksmith | Buy/upgrade weapons and armor. |
| Work Board | Take small jobs for gold/loot. |
| Crafting Bench | Convert road drops into useful items. |
| Ledger Hall | Turn in proof and track road progress. |
| Archive Hall | Lore, memories, discovered notes. |
| Town Gate | Begin Old Road expedition. |
| Character Sheet | Stats, gear, inventory, traits. |
| Profile / Travelers | Account, cloud traveler slots, future progression. |

---

## 5. Ashmere NPCs

### 5.1 Mara Vell — Archive Keeper

Role:

- First story guide.
- Lore source.
- Explains Road Tokens and strange road memory.
- Unlocks Archive Hall entries.

Gameplay uses:

- Gives first objective.
- Tracks discoveries.
- Provides lore hints for sub-locations.
- May identify unusual items.

Potential dialogue states:

1. First meeting.
2. After first Old Road return.
3. After finding a Bell Fragment.
4. After discovering a shrine/cabin/cache.
5. After turning in enough Road Tokens.

Asset needs:

- Existing portrait.
- Optional archive interior background.
- Small archive icon: book, candle, stamped parchment.

### 5.2 Old Brenn — Ledger Keeper

Role:

- Tracks proof and rewards.
- Handles Road Token turn-ins.
- Gives practical economy goals.

Gameplay uses:

- Turn in 3 Road Tokens for gold/supplies.
- Track completed road milestones.
- Unlocks bounty/job variants.

Potential rewards:

- Gold.
- Camp supplies.
- Trader discount.
- Ledger entry.
- Unlockable road permit/tier later.

Asset needs:

- Existing portrait.
- Ledger Hall background.
- Coin/ledger icon.

### 5.3 Captain Oric — Gate Captain

Role:

- Combat and road survival mentor.
- Warns about enemy traits.
- Offers guard-duty jobs.

Gameplay uses:

- Explains Guard / Fall Back / Potions.
- Gives enemy advice.
- May unlock combat tutorial event.
- Offers work board tie-in.

Asset needs:

- Existing portrait.
- Gate/guard post background.
- Shield/spear icon.

### 5.4 Innkeeper

Role:

- Healing, rest, rumors.

Gameplay uses:

- Rest to full HP.
- Buy camp supplies.
- Hear random rumor.
- Rare chance for temporary buff after rest.

Rumor examples:

- “A broken shrine showed itself in the fog last night.”
- “Blackroot wolves hate firelight.”
- “Brenn pays extra for proof that still bleeds.”

Asset needs:

- Existing portrait.
- Inn interior background.
- Bed/mug/fireplace icons.

### 5.5 Trader

Role:

- Buy/sell loop.

Gameplay uses:

- Sell road drops.
- Buy potions, food, camp supplies.
- Later unlock rotating stock.

Asset needs:

- Existing portrait.
- Trading post interior/stall background.
- Coin, potion, satchel icons.

### 5.6 Blacksmith

Role:

- Gear upgrade loop.

Gameplay uses:

- Buy weapons and armor.
- Craft gear from ore, fangs, hides.
- Repair or reinforce gear later.

Asset needs:

- Existing portrait.
- Forge interior background.
- Anvil, sword, shield icons.

---

## 6. Town Activities

### 6.1 Work Board

Purpose: Give non-road activities and low-risk gold/loot.

Jobs should be short, repeatable, and slightly randomized.

Example jobs:

| Job | Check | Reward | Failure |
|---|---|---|---|
| Split firewood | Strength | Gold + wood scrap | Lose HP/stamina flavor |
| Watch the gate | Survival / Lore | Gold + rumor | Minor stress / no bonus |
| Carry crates | Strength | Gold + food chance | Small HP loss |
| Sort archive records | Lore | Gold + lore clue | No clue |
| Clean stable / yard | Luck | Gold + random small item | Only gold |
| Run message | Thieving / Survival | Gold + town favor | No favor |

Job rewards:

- Gold.
- Food.
- Camp supplies.
- Rumors.
- Minor crafting materials.
- Town favor flags.

### 6.2 Crafting Bench

Purpose: Give road drops more meaning than selling.

Crafting categories:

- Consumables.
- Gear upgrades.
- Utility items.
- Sellable bundles.

Example recipes:

| Recipe | Ingredients | Result |
|---|---|---|
| Road Poultice | 2 herbs + 1 cloth scrap | Healing item |
| Blackroot Tonic | 1 blackroot herb + 1 fang | Resist fear/bleed event |
| Hunter’s Charm | 2 wolf fangs + 1 cord | +1 survival for next road trip |
| Reinforced Buckle | 1 ore + 1 hide | Minor armor improvement |
| Wisp Lantern Wick | 1 wisp ash + 1 oil | Reveals hidden road event chance |
| Trade Bundle | 3 common drops | Sell for better gold than raw items |

Crafting should begin simple and expand later.

### 6.3 Trading Post Sell Loop

Road drops should have three possible uses:

1. Sell raw for quick gold.
2. Craft into better item.
3. Turn in for jobs/lore.

Example drop values:

| Item | Source | Sell Value | Other Use |
|---|---|---:|---|
| Wolf Fang | Wolf | 12g | Hunter’s Charm |
| Torn Hide | Wolf/Goblin | 8g | Armor crafting |
| Road Herb | Finds | 10g | Poultice |
| Rusted Coin | Cache | 18g | Brenn ledger clue |
| Wisp Ash | Wisp | 22g | Lantern crafting |
| Goblin Trinket | Goblin | 16g | Trader bundle |
| Blackroot Thorn | Wolf/Hazard | 14g | Tonic |
| Broken Bell Shard | Rare | 60g | Story/lore item |

---

## 7. Old Road Expedition System

### 7.1 Expedition Structure

A road trip should consist of 3–5 event beats before forced return or optional return.

Each beat can be:

- Combat.
- Skill check.
- Loot find.
- Sub-location discovery.
- Hazard.
- Stranger/NPC event.
- Quiet travel/rest moment.

Suggested structure:

```text
Start Road
  ↓
Beat 1: Low risk event
  ↓
Beat 2: Check / loot / minor enemy
  ↓
Beat 3: Combat or sub-location
  ↓
Optional Push Further or Return
  ↓
Beat 4: Higher risk event
  ↓
Return to Ashmere with loot/proof
```

### 7.2 Road Pressure

Each expedition can track **Road Pressure**.

Pressure increases when:

- Player fails checks.
- Player pushes deeper.
- Player flees combat.
- Player lacks supplies.
- Player triggers cursed events.

Pressure effects:

- More ambush chance.
- Harder checks.
- Better loot chance at higher risk.
- Increased chance of strange/lore events.

### 7.3 Road Supplies

Supplies create preparation choices.

Examples:

| Supply | Effect |
|---|---|
| Food | Reduce pressure or recover small HP. |
| Camp Supplies | Add safe rest event or prevent forced return. |
| Potion | Combat healing. |
| Torch Oil | Reveal hidden cache/shrine chance. |
| Rope | Improves ravine/bridge checks. |
| Warding Charm | Reduces wisp/fear event risk. |

---

## 8. Road Event Categories

### 8.1 Combat Events

- Road Goblin ambush.
- Blackroot Wolf stalking.
- Lantern Wisp crossing.
- Mixed threat later: Goblin + Wisp clue.

### 8.2 Exploration Finds

- Broken cart.
- Hidden roadside cache.
- Herb patch.
- Old milestone marker.
- Half-buried coin pouch.
- Abandoned campfire.

### 8.3 Hazards

- Mudslide.
- Thorn bramble.
- Rotten bridge.
- Sudden fogbank.
- Crows circling a corpse.
- False lantern light.

### 8.4 Sub-locations

Sub-locations should feel like small discoveries, not full dungeons.

#### Abandoned Roadside Cabin

Gameplay:

- Search inside.
- Risk: ambush/trap/fear check.
- Reward: food, coin, note, rare drop.

Asset needs:

- Cabin exterior/interior image.
- Dusty table/cache icon.

#### Broken Shrine

Gameplay:

- Lore event.
- Wisp chance.
- Possible blessing or curse.
- Rare Bell Fragment clue.

Asset needs:

- Shrine background.
- Candle/relic icon.

#### Hunter’s Blind

Gameplay:

- Survival check.
- Find arrows, hides, trap materials.
- Learn wolf behavior.

Asset needs:

- Raised blind/forest prop.

#### Old Toll Post

Gameplay:

- Goblin/gold event.
- Find rusted coinage.
- Brenn recognizes marks later.

Asset needs:

- Toll gate ruin.
- coin/ledger stamp icon.

#### Blackroot Thicket

Gameplay:

- Hazard + herb find.
- Wolf chance.
- Blackroot crafting materials.

Asset needs:

- Thorn forest image.
- blackroot herb icon.

---

## 9. Enemy Design and Traits

### 9.1 Enemy Trait System

Enemies should roll a **variant trait** when encountered.

Trait examples:

| Trait | Effect | Feel |
|---|---|---|
| Hungry | More aggressive, lower flee chance, extra food drop chance. | Desperate. |
| Scarred | More HP, better loot, lower accuracy. | Tough veteran. |
| Cowardly | More likely to flee, lower HP, drops stolen trinkets. | Skittish. |
| Cunning | Higher attack DC/bonus, may feint. | Smarter threat. |
| Diseased | Lower HP, can inflict poison/rot. | Gross risk. |
| Frantic | Unstable damage, higher crit/fumble swing. | Chaotic. |
| Guarding | Better defense, protects cache. | Defensive. |
| Possessed | Rare variant, wisp-like behavior, better lore drops. | Supernatural. |

Each encounter should show trait text visually:

```text
Blackroot Wolf — Scarred
A torn ear and old spear wound mark this wolf as a survivor.
```

### 9.2 Enemy Behaviors

#### Road Goblin

Base identity:

- Low armor, tricky, loot-driven.
- Can flee if hurt.
- May guard a cache.

Trait examples:

- **Knife-Eager Goblin:** attacks more often, low HP.
- **Ragged Sneak:** higher dodge/defense, better trinket drop.
- **Toll-Cutter:** demands gold; can be fought, paid, or intimidated.
- **Bone-Charm Goblin:** small chance to inflict bad-luck debuff.

Loot:

- Goblin trinket.
- Rusted coin.
- Torn cloth.
- Small knife scrap.
- Road Token chance.

#### Blackroot Wolf

Base identity:

- Physical threat, survival/hazard-linked.
- Can howl to increase pressure.

Trait examples:

- **Hungry Wolf:** higher attack chance.
- **Scarred Wolf:** more HP, drops better fang/hide.
- **Blackroot-Fanged Wolf:** chance to inflict bleed/poison flavor.
- **Lone Stalker:** lower HP but higher initiative/dodge.

Loot:

- Wolf fang.
- Torn hide.
- Blackroot thorn.
- Meat/food chance.
- Road Token chance.

#### Lantern Wisp

Base identity:

- Magical/mysterious.
- Lower HP, strange effects.
- Tied to hidden events and lore.

Trait examples:

- **Fading Wisp:** low HP, likely to flee, drops ash.
- **Luring Wisp:** raises pressure, may reveal shrine on success.
- **Vengeful Wisp:** higher damage, chance to blind/confuse.
- **Bell-Touched Wisp:** rare lore variant, Bell Fragment chance.

Loot:

- Wisp ash.
- Lantern wick.
- Strange ember.
- Bell Fragment rare chance.
- Road Token chance.

---

## 10. Combat Revamp Direction

### 10.1 Goals

Combat should feel like an RPG encounter, not printed dice text.

Needs:

- Enemy art frame.
- Enemy name + trait tag.
- HP bars.
- Player HP/resources.
- Action buttons with icons.
- Die roll visualization.
- Compact combat log.
- Status chips.
- Reward screen after victory.

### 10.2 Player Actions

| Action | Function |
|---|---|
| Strike | Basic attack roll. |
| Guard | Reduce next damage, improve survival. |
| Use Potion | Heal if potion available. |
| Skill Move | Class/personality-based action later. |
| Fall Back | Attempt to escape and return/continue with pressure. |

### 10.3 Enemy Actions

Enemies should use behavior weights.

Example:

```json
{
  "attackWeight": 70,
  "guardWeight": 10,
  "specialWeight": 15,
  "fleeWeight": 5
}
```

### 10.4 Dice Display

Replace raw text like:

```text
You rolled 14 + 2 vs DC 13
```

With:

- Animated d20 tile.
- Result row:
  - Roll: 14
  - Modifier: +2
  - Total: 16
  - Target: 13
  - Result: Hit

Keep detailed log available but not dominant.

### 10.5 Victory Rewards

After combat:

- Show reward cards.
- Let player understand drops.
- Add to inventory.
- Show Road Token progress.

Example:

```text
Victory
+1 Wolf Fang
+1 Torn Hide
+18 Gold
Road Token found!
```

---

## 11. Road Event Revamp Direction

### 11.1 Unified Event Card

Every road event should use the same presentation shell:

- Road/sub-location art.
- Event title.
- Event type icon.
- Risk level.
- Choice buttons.
- Optional check preview.
- Outcome cards.

### 11.2 Event Types

| Type | UI Icon | Core Interaction |
|---|---|---|
| Combat | crossed blades | Fight / fall back. |
| Hazard | warning sign | Skill check / use item. |
| Discovery | eye/map | Search / leave. |
| Cache | chest | Open / inspect / ignore. |
| Shrine | candle/relic | Pray / study / leave. |
| Stranger | hooded figure | Talk / trade / avoid. |
| Camp | fire | Rest / eat / press on. |

### 11.3 Outcome Types

- Clear success.
- Partial success.
- Failure with cost.
- Critical success.
- Botch.
- Hidden unlock.

---

## 12. First-Town Progression Milestones

### Milestone 1 — Arrival

Player creates traveler and enters Ashmere.

Required:

- New traveler flow works.
- Title screen feels final.
- Ashmere hub loads.

### Milestone 2 — Town Familiarity

Player talks to Mara and sees preparation options.

Required:

- NPC screens polished.
- Town Square useful.
- Current Goal updates.

### Milestone 3 — First Road Trip

Player leaves town and completes at least 3 road beats.

Required:

- Road event cards polished.
- Combat revamp begun.
- Return to Ashmere works.

### Milestone 4 — Economy Loop

Player can do something useful with loot.

Required:

- Sell loot.
- Craft simple item.
- Buy/rest/upgrade.

### Milestone 5 — Repeatable Depth

Player has reasons to repeat road runs.

Required:

- Enemy traits.
- Random events.
- Sub-location chance.
- Jobs.
- Road Pressure or risk system.

### Milestone 6 — 1.0 Vertical Slice

Player can spend 30–60 minutes in Ashmere/Old Road loop and feel like the game is alive.

Required:

- No old prototype labels.
- No broken title loops.
- Unified UI.
- First town has depth.
- Road has variety.
- Combat feels presentable.
- Account/profile direction visible.

---

## 13. Missing Asset List

### 13.1 High Priority Art

| Asset | Purpose |
|---|---|
| Ashmere Inn interior | Inn screen background. |
| Ashmere Trading Post interior | Trader/shop screen. |
| Ashmere Forge interior | Blacksmith screen. |
| Ledger Hall interior | Brenn/proof screen. |
| Archive Hall interior | Mara/lore screen. |
| Gatehouse / town gate | Oric/gate screen. |
| Work Board / notice board | Jobs screen. |
| Crafting bench / worktable | Crafting screen. |
| Traveler silhouette portrait | Character sheet/profile placeholder. |

### 13.2 Road Sub-location Art

| Asset | Purpose |
|---|---|
| Abandoned roadside cabin | Discovery event. |
| Broken shrine | Lore/wisp event. |
| Hunter’s blind | Survival/cache event. |
| Old toll post | Goblin/coin event. |
| Blackroot thicket | Hazard/herb event. |
| Broken cart | Loot/cache event. |
| Old campfire | Rest/stranger clue event. |

### 13.3 Icons

| Icon | Use |
|---|---|
| Sword / crossed blades | Combat. |
| Shield | Guard/defense. |
| Potion bottle | Healing. |
| Coin | Gold/sell. |
| Satchel | Inventory. |
| Anvil | Crafting/blacksmith. |
| Bed / mug | Inn/rest. |
| Scroll / ledger | Quests/proof. |
| Road sign | Travel. |
| Eye / map | Explore/search. |
| Chest/cache | Loot find. |
| Candle/relic | Shrine/lore. |
| Fang | Wolf drops. |
| Herb | Crafting material. |
| Ash/flame | Wisp drop. |
| Bell shard | Rare lore item. |
| Warning triangle | Hazard. |
| D20 die | Roll/result display. |

### 13.4 Audio / Music Needs

#### Music

- Title theme: dark medieval, slow, mysterious, main motif.
- Ashmere hub: low strings, rain, soft lute/drone.
- Inn: warmer, safer, low fire ambience.
- Blacksmith: rhythmic hammer/anvil ambience.
- Trader: quiet market texture, subtle coins/wood.
- Old Road: tense drone, wind, distant crows.
- Combat: short loop, percussion, danger pulse.
- Victory: short sting.
- Discovery: short mysterious sting.
- Shrine: eerie choir/bell tone.

#### Sound Effects

- Button hover/select.
- Menu open/close.
- D20 roll.
- Hit/miss/crit.
- Potion use.
- Coin gain.
- Loot pickup.
- Craft success.
- Rest at inn.
- Gate open.
- Fog/road transition.
- Wisp shimmer.
- Wolf growl.
- Goblin chatter.
- Bell fragment chime.

---

## 14. Implementation Priorities

### Pass A — Design Source of Truth

- Commit this GDD.
- Create asset checklist.
- Create road events data schema.
- Create enemy traits schema.

### Pass B — First Town Depth

- Add Work Board.
- Add Crafting Bench.
- Add sell/drop handling at Trader.
- Improve Blacksmith upgrades.
- Improve Inn rest/rumors.

### Pass C — Road Event Revamp

- Replace single-style road checks with event card shell.
- Add sub-locations.
- Add Road Pressure.
- Add event outcome cards.

### Pass D — Combat Revamp

- Add trait variants.
- Add enemy behavior weights.
- Replace raw roll printouts with dice result UI.
- Add reward screen.

### Pass E — 1.0 Polish

- Unified title / account / town / road UI.
- Final asset pass.
- QA runner updated.
- Remove/hide old Save Vault.
- Build release notes for Ashmere Vertical Slice.

---

## 15. Definition of Done for Ashmere 1.0 Vertical Slice

The build is ready when:

- A new player can create a traveler and understand the loop.
- Ashmere has at least 8 meaningful actions/screens.
- The Old Road has at least 15 possible events/outcomes.
- Enemies have trait variants.
- Combat has a presentable UI and reward flow.
- Road loot can be sold or crafted.
- Jobs provide non-combat ways to earn rewards.
- Returning to Ashmere never kicks to title.
- The UI feels like a game, not a web prototype.
- The title screen feels like an opening menu.
- No obvious Recovered Build identity remains in the main flow.
- The player can spend 30–60 minutes in the slice without exhausting every interaction instantly.

---

## 16. Short AI Asset Prompt Summary

Use this when generating assets/music with external tools:

```text
LEGEND: Roads of Ashmere is a dark medieval fantasy browser RPG. The 1.0 vertical slice focuses on Ashmere, a rain-dark town at the edge of the Old Road. The mood is grounded, grim, mysterious, and adventurous — not cartoonish, not high fantasy neon. Visuals should feel like candlelit inns, muddy roads, old stone, wet wood, rusted iron, fog, lantern light, parchment, worn leather, and strange supernatural traces. UI should feel like a real RPG: framed panels, icons, subtle ember/fog animation, medieval motifs, readable but immersive. The first gameplay loop is: prepare in town, take jobs, craft, buy supplies, travel the Old Road, face varied events/enemies, gather drops, return to Ashmere, sell/craft/upgrade, repeat.
```
