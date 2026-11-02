# Opening Experience, Tutorial, and Story Integration Plan

**Status:** Proposed production plan, updated 2026-10-19  
**Canon authority:** [CANON.md](CANON.md) is authoritative. This document proposes pacing and player-facing implementation; it does not lock unanswered lore or claim unimplemented scenes are playable.

## Experience goal

LEGEND should feel like entering a dark-fantasy RPG world, not navigating a stack of website panels. Screens should read as places: a gate in the rain, a lantern-lit room, a weathered work board, a road stretching into fog, a chamber with a visible threat. Character portrait + speaker name + text box + player response should be a recurring language for important conversations and tutorials.

The world should be uneasy but humane. Ashmere is a warm refuge; roads carry uncertainty; the people causing harm are not automatically monsters. Art and dialogue must reinforce the same tone, and player actions should have understandable consequences.

## First-session flow — road-first opening preview

**Implementation status (PR #27 / v0.20.40):** this combined branch retains the v0.20.39 soul-shaping presentation and changes the post-creation flow. It is not released until final CI, visual review, deployment and the live smoke check succeed.

### 1. Between Memory and Waking — shape a traveler

The seven-step creator keeps the current record builder, option IDs, class portraits, starting inventory and save contract. A presence speaks only as **???**. Its prompts describe form, feeling, a half-remembered life, instinct and a keepsake. It may be the Veil at the author level, but player-facing text and imagery must not identify it as such or state/imply the traveler's hidden L4 nature.

### 2. Beneath the Dead Lantern — meet Oric and awaken

Choosing **Let Me Wake** saves the new traveler and begins outside Ashmere, on the Old Road. Captain Oric finds them under an unlit lantern and asks whether they are friend or foe. The player chooses a response—honest, peaceful or defiant—which is saved as a memory and changes Oric's follow-up dialogue.

After the player answers, Oric reacts and begins to investigate the tracks. Before combat opens, a separate ambush beat shows the Blackroot Wolf slamming into him, knocking his lantern away, and leaving him calling for help. Only after the player chooses **Help Oric** does the production combat interface appear. The unknown voice whispers **“Awaken.”** ACT is the only enabled action for this one-HP scripted encounter. It is a teaching encounter, not a replacement combat system; normal battle mechanics, enemy patterns, rewards and existing saves remain unchanged.

Afterward, Oric takes responsibility for the first expedition and personally teaches the player how to read the fork, inspect a marker, search for supplies, travel, watch enemy intent, use a camp, and bring evidence home. A new player is not offered a shortcut to Ashmere until this first trip is secured. A **Return to Ashmere** shortcut is shown only when the previous saved traveler has evidence of road experience (a road victory, cleared expedition, or prior return); that experience is carried forward as a small flag when a new traveler is created. This keeps the normal save format and mandatory first-session path intact.

### 3. The first Old Road — learn the existing gameplay loop

Captain Oric appears as the speaker in the expedition guide and gives a location-specific instruction at each stage. The guided route uses the production five-stage expedition, not a mock scene. It teaches one step at a time:

1. Choose the safer High Ridge or the riskier Reed Cut at the fork.
2. Use the road-scene **Look closer** hotspot and inspect the marker.
3. Search the roadside for supplies, understanding that travel and searches can change Road Pressure.
4. Travel through Lantern Ditch to Wayfarer's Camp, where **Rest by the Fire** spends a Camp Supply or Ration to recover health and lower pressure. Rest is explained but does not become a forced button if the player would rather continue.
5. Continue through Blackroot Bend and Reedwatch Shelter to Greyfen Approach, then secure rewards by returning to Ashmere.

The player can abandon the tutorial expedition without losing the traveler, or skip straight to Ashmere after the ambush. When an opening is in progress, **Continue Journey** resumes the current Oric conversation, scripted battle, aftermath or road scene rather than routing the player into town. After a secured return, the tutorial flag clears and the normal town/equipment/quest loop remains available.

### 4. News & Roadmap — set expectations honestly

The title menu's in-game **News & Roadmap** screen provides a place to announce changes and outline direction. Cards must distinguish shipped work from preview/in-progress/planned work. Links may open the maintained development updates, devlog and GitHub repository; they must not imply live multiplayer, promise dates, or represent planned systems as playable.

### Acceptance gates

- The unknown voice remains **???** through creation; hidden L4 nature stays unrevealed.
- A new character begins on the Old Road, sees Oric dialogue choices, meets the Blackroot Wolf ambush, and wins using ACT / **Awaken**.
- The actual expedition teaches fork → clue → search → travel → camp rest → secured return. The first-run gates must not lock existing saves or later expeditions.
- A reload during the Oric scene or battle returns the player to the relevant opening beat.
- News & Roadmap opens from the title, works at desktop/mobile widths, and returns to the title without changing the player save.
- Existing save keys, player-record fields, class/keepsake data, route/quest IDs, enemy damage formulas, and ordinary combat remain compatible.
- Final-head Playwright, desktop/mobile visual review, GitHub Pages deployment and deployed smoke check all pass before merge/release.

## Proposed long-form story arc

These are structural proposals, not new locked canon.

### Act I — The Bell Rang Once
Ashmere is the home base. The traveler wakes beneath a dead lantern outside the gate, and Mara says the bell rang once. First-session play establishes the town's people, the Old Road and the value of returning with proof. Keep the supernatural details small and deniable.

### Act II — The Lower Crossing
Greyfen turns exploration into a social and civic mystery. Trade pressure, flood damage, a missing closure order and the Landing Warden's decision reveal that dangerous outcomes can begin with ordinary compromises. Player choices should affect trust, access and what help is offered—not just change a gold reward.

### Act III — An Old Peace
Ironpass, Blackwood and the Ruined March widen the game beyond Ashmere and Greyfen. Each region needs its own local problem, community and relationship to the old war agreement. The attacking goblins and ogres are Veil-touched creatures, but monster peoples must not collapse into one enemy army. Distinct threats should have understandable behaviors, motives and environmental signatures. Untouched creatures and the wider politics remain open until decided.

### Act IV — The Wound in the Veil
The crossing records and regional discoveries gradually lead to older evidence about the Last Mercy and the Hollow Saint. The Saint's promise is emotionally dangerous because it offers bereaved people a version of the dead they desperately want back. Reveal the facts through conflicting records, consequences and character-specific experiences; avoid a villain monologue that explains everything at once.

**Strict hidden-story rule:** L4 in CANON.md says the traveler is an echo left by the Last Mercy, does not know it, and must not have this stated or implied by any NPC, journal or UI before an owner-approved reveal plan. The opening must not hint that the creator choices are false or that the traveler's chosen origin is necessarily fake.

### Act V — What Should Be Returned?
The final act should make the player choose how to treat the wound and the people drawn toward the Hollow Saint's promise. Whether the wound can be closed, repaired, controlled or only contained remains open. The ending should resolve consequences for companions and regions, not turn the entire story into a single abstract lore answer.

## Dungeon design direction

Dungeons should be a separate exploration loop, not the road expedition with different artwork. First prove one compact, replayable ruin before building a dungeon catalog.

**Suggested first slice (name and location open):**
- A distinct illustrated entrance and a readable small room map.
- Three to five connected rooms, with at least one optional branch or environmental obstacle.
- A resource/preparation decision and one interaction that changes risk.
- At least one encounter whose behavior fits the room and enemy identity.
- A clue or useful material, a capstone foe or obstacle, and an explicit choice to press on or withdraw.
- A return report that explains what was recovered and unlocks a town conversation or practical upgrade.
- Persistence for discovered rooms and cleared state only when a replayable dungeon needs it; do not introduce a new save schema until the slice requires one.

Dungeons can uncover traces of the old war and the agreements between kingdoms and monster peoples. Avoid making every ruin a Hollow Saint shrine or turning ordinary bells into the universe's central mechanism. Let regional history exist beyond the deepest antagonist.

## Presentation and interaction rules

- Use portraits and in-world dialogue for the story's important conversations; use concise contextual prompts for mechanical tutorials.
- Make the next action visible but never force the player through every shop in a fixed order.
- Keep tutorial state explicit and replayable. A dismissible hint is not the same as a completed story conversation.
- Scene transitions should be quick, skippable, and reduced-motion safe.
- Keep scene illustration separate from readable UI text, captions and buttons.
- Do not use extra assets to mask unclear interaction design. Reuse the committed title, town, class and NPC art first; generate only gaps with a specific shot list and check clean export, crop and mobile performance before integration.
- Mark every lore idea as LOCKED, APPROVED DIRECTION, ESTABLISHED, PROPOSED or OPEN using CANON.md's meanings. Assistant-generated ideas remain PROPOSED until the owner approves them.

## Implementation order

1. **Road-first opening + creator + hub art** — combined in the current PR #27 branch preview: anonymous soul-shaping creation, Oric’s response-driven dead-lantern conversation, an ACT-only “Awaken” ambush, the guided first Old Road loop, the News & Roadmap screen, raster branding and dedicated service art. Require final Playwright and deployed smoke validation before merge.
2. **Town return and first-session dialogue** — deepen replayable conversations and small choices for Oric, Mara, Brenn and Sella after the first secured road return; tie town responses to route clues and rewards.
3. **Scene/loading polish** — deepen the shared location transition into dedicated screen/loading art where useful; verify asset fallbacks, timing, skip paths and reduced-motion behavior.
4. **First dungeon vertical slice** — three-to-five-room loop with one encounter, one decision, one find and persistent return consequences.
5. **Regional story expansion** — connect the crossing evidence to the old agreement while preserving player choice and the locked reveal guardrails.

This sequencing favors one polished, tested journey over simultaneous rewrites of the loader, saves, combat and narrative systems.
