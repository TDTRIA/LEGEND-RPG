# LEGEND v0.6.3 — Roadwarden / Baladins Systems Pass

This document defines the next LEGEND update direction after v0.6.2 visual foundation.

The goal is not to copy Roadwarden or Baladins. The goal is to study what makes those games work and translate compatible design ideas into LEGEND's own identity: a recovered dark-fantasy browser RPG.

---

## Core Direction

LEGEND should evolve from a simple town/menu RPG into a travel-driven RPG where the road matters, towns remember the player, and each outing creates consequences.

v0.6.3 should add:

- Road pressure and time passing
- Camp/rest decisions
- Town trust and local reputation
- Route discoveries
- More Old Road event variety
- Lightweight settlement errands
- Cozy/strange town requests mixed with darker road danger
- Better quest journal structure
- First steps toward a world map / discovered towns system

---

## Roadwarden-Inspired Takeaways

### 1. The road should cost something
Exploration should not feel like clicking a free button forever.

Add simple travel pressure:

- Time of day
- Fatigue
- Camp supplies
- Food pressure
- Road danger
- Condition after travel

Possible first implementation:

```js
player.day = player.day || 1;
player.time = player.time || 'Morning';
player.fatigue = player.fatigue || 0;
player.roadDanger = player.roadDanger || 1;
```

Every road event can increase fatigue, move time forward, or raise/lower danger.

---

### 2. Routes should feel like places
Instead of generic random events, each route should have a mood and identity.

Old Road identity:

- broken milestones
- bell fragments
- goblin tracks
- drowned carts
- strange lanterns
- collapsed shrine stones
- old road tokens
- hidden turnoffs

Future routes:

- Moss Road
- Lantern Cut
- Bone Mile
- River Crossing
- Hollow Keep Approach

---

### 3. Towns should remember player actions
Ashmere should change based on what the player has done.

Examples:

- Talked to Mara: Archive and Ledger open
- Returned with Road Tokens: Inn/trade routes improve
- Found Bell Fragment: town mood changes
- Defeated monsters: Oric acknowledges it
- Helped locals: town trust increases

Suggested stat:

```js
player.townTrust = player.townTrust || { Ashmere: 0 };
```

Trust unlocks services, rumors, discounts, and dialogue changes.

---

### 4. Quests should update in stages
Quest log should not just be static bullet points.

Each quest should have:

- id
- title
- current step
- status
- discovered notes
- reward

Simple first structure:

```js
player.quests = {
  firstRoad: { step: 1, status: 'active' },
  bellThatRangOnce: { step: 1, status: 'active' }
};
```

---

## Baladins-Inspired Takeaways

### 1. Add small town problems
Not every quest needs to be grim or huge.

Ashmere should have errands that create charm and texture:

- Find Sella's missing ledger ribbon
- Help repair the inn sign
- Gather herbs for a feverish guard
- Bring wood to fix a bridge post
- Deliver a sealed note between NPCs
- Cook a road meal for a traveler

These should be lightweight and readable.

---

### 2. Player roles should matter outside combat
Classes should unlock noncombat solutions.

Examples:

- Ranger: read tracks, scout safely, reduce danger
- Mage: read runes, stabilize strange events
- Warrior: clear debris, intimidate bandits
- Thief: find hidden caches, bypass locked boxes
- Skiller: craft, cook, gather, repair
- Adventurer: luck-based flexible choices

---

### 3. Repeat visits should reveal new dialogue
NPCs should not say the same thing forever.

Add simple dialogue stages:

```js
player.npcTalk = player.npcTalk || { mara: 0, brenn: 0, oric: 0, sella: 0 };
```

Each visit increments or checks story state.

---

### 4. Mix cozy requests with dark consequences
LEGEND's tone should not be only bleak.

The town can be warm.
The road can be dangerous.
The contrast makes both stronger.

---

## v0.6.3 Feature List

### Must Add

1. Day/time system
2. Fatigue system
3. Camp/rest improvements
4. Town Trust: Ashmere
5. 8+ new Old Road events
6. Class-specific road choices
7. Sella NPC added to People of Ashmere
8. Quest state tracking upgrade
9. Road event result panels with clearer consequences

### Should Add

1. Route discovery scaffold
2. Discovered towns list
3. First hidden route unlock
4. NPC dialogue stages
5. Small Ashmere errands
6. Better journal/quest screen

### Could Add

1. Road condition meter
2. Weather flavor
3. Rumor system
4. Merchant caravan event
5. Campfire memory event
6. First town mood changes

---

## Proposed Old Road Events

1. Broken Milestone
   - Survival check
   - Success: Road Token + reduced danger
   - Failure: fatigue +1

2. Drowned Cart
   - Strength or Thieving choice
   - Success: gold/log/food
   - Failure: HP damage or fatigue

3. Bell Echo
   - Lore or Magic check
   - Success: Bell clue or fragment
   - Failure: road danger rises

4. Goblin Tracks
   - Ranger/Survival advantage
   - Follow: battle + reward
   - Avoid: fatigue but safer

5. Lost Traveler
   - Give food or ignore
   - Help: town trust + rumor
   - Ignore: no immediate penalty, later consequence

6. Road Shrine
   - Pray, inspect, or break open
   - Different class/origin outcomes

7. Strange Lantern
   - Magic/Luck event
   - Can grant memory, gold, or curse-like fatigue

8. Fallen Tree
   - Warrior/Skiller advantage
   - Clear route for trust and resource reward

9. Quiet Camp
   - Rest option outside town
   - Spend camp supply to reduce fatigue

10. Hidden Turnoff
   - Unlock future route if survival/luck succeeds

---

## Proposed Sella Role

Sella should become the town's practical, warm, slightly suspicious helper NPC.

Possible identity:

- Inn cook / road provisioner / local fixer
- Gives small errands
- Teaches food/camp mechanics
- Reacts to player fatigue and supplies

First Sella dialogue goal:

- Explain that the road does not just hurt your HP; it wears you down.
- Give the player a small food/camp task.
- Unlock simple rest/cooking/camp tutorial.

---

## v0.6.3 Implementation Order

1. Add data fields safely through storage normalization:
   - day
   - timeOfDay
   - fatigue
   - townTrust
   - npcTalk
   - discoveredRoutes
   - discoveredTowns

2. Add status display to UI:
   - Day
   - Time
   - Fatigue
   - Ashmere Trust

3. Expand Old Road event table.

4. Add Sella to People of Ashmere.

5. Add class-specific road actions.

6. Add town trust rewards/unlocks.

7. Update playtest runner for v0.6.3.

---

## Design Rule

Every trip should answer at least one question:

- What did I discover?
- What did it cost me?
- Who will care when I return?
- What changed in the town or route?

If a road event does not answer one of those, it is filler and should be rewritten.
