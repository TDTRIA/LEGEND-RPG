# LEGEND — Canon

Story decisions made by the project owner. **If any other document disagrees with a LOCKED item here, this file wins.**
Last updated: 2026-11-08.

## How every AI assistant uses this file

- Only the owner locks decisions. An assistant may propose, draft options, or flag conflicts, but never marks something LOCKED on its own.
- Check this file before writing story, dialogue, quests, or lore. LOCKED items are facts, not suggestions.
- To change a LOCKED item, ask the owner first, then record the change with its date in the change log below. Do not edit it silently.
- Locked is not the same as implemented. Do not describe anything as playable until source and tests confirm it (see `AI_HANDOFF.md`).
- Status labels: **LOCKED** (owner decided) · **APPROVED DIRECTION** (owner approved the direction, details still open) · **ESTABLISHED** (already in the shipped game) · **PROPOSED** (an idea in the docs, not approved) · **OPEN** (undecided).

## Locked decisions

### L1 — The deepest threat is the Hollow Saint and the Last Mercy (locked 2026-10-16)

Long ago a healer's ritual, the **Last Mercy**, tried to save the dead. It failed: instead of restoring people it left echoes that imitate them. The figure behind it, the **Hollow Saint**, offers to bring people's lost loved ones back.

- **Locked:** the Hollow Saint and the Last Mercy are the deepest threat behind the awakening.
- **Still open:** the Hollow Saint's personality and agency; how much of the monster invasion it causes versus merely accelerates (not every monster is its servant); when and how the player learns of it; whether the ritual can be ended or repaired; any link to the player's traveler.
- **Working detail (PROPOSED, not locked):** `docs/LEGEND_GAME_REBOOT_PLAN.md` section 4, including the Afterwake and Strain.
- **Updated by L6 (2026-10-19):** the echoes now come from the wound the Last Mercy made in the Veil.

### L2 — The Greyfen crossing was reopened because of trade pressure (locked 2026-10-16)

The crossing records were altered because of trade pressure: **someone with authority reopened the lower crossing early to protect money and routes, knowing it was still unsafe.** This is a human decision.

- **Still open:** why the crossing was still unsafe; whether the Warden ever re-inspected; whether anyone was hurt; how the closure order went missing; what proof the player can recover; what happens when the player confronts, exposes, or protects her; whether the danger itself has a supernatural cause.

### L3 — The Landing Warden reopened the crossing (locked 2026-10-16)

Greyfen's own authority, **the Landing Warden**, was squeezed by caravan merchants after the flood and reopened the lower crossing early. The OPEN went in unsigned because she meant to re-inspect within days and did not want her name on an order saying the crossing was safe. The newer cut toward the reed bed marks the risky shortcut she made official. She is a sympathetic wrong-doer, not a villain, and how the player treats her is the player's choice.

- **Still open:** whether she ever re-inspected; whether anyone was hurt; how the player finds proof and what happens when they confront her; what the game does with the player's choice; her name (the compendium proposes "Yara Fen," which is not approved).
- **Consistency note:** in the existing "A Dry Crossing" contract the Landing Warden discloses the reed-bed shortcut's risk openly. Anything written for her must stay consistent with that contract, or update the contract and its test together.

### L4 — The traveler is an echo, but not an ordinary one (locked 2026-10-16)

The traveler is an echo left by the Last Mercy and does not know it. The game does not say so early. Small signs build up (the bell that rang once, the dead lantern, people who recognize the traveler too well) and the truth lands late. Unlike ordinary echoes, the traveler is different: **the Veil touched them before the Last Mercy could finish making them, and that contact is why they are the way they are.**

- **Origin reading (locked 2026-11-03):** the memories the player recovers during traveler creation are the **apprentice's** (see L6), scrambled when the Veil interrupted the making. The player's choices decide which fragments the traveler holds, and the skill fragments are the apprentice's training. They are real memories of the apprentice, not facts about the traveler, and they disperse with the echo at the end; what remains is what the player did in play. This is author-level knowledge. Player-facing creation text stays ambiguous (see the approved opening direction below) until a reveal plan is approved.
- **Still open:** what the Veil's touch actually did (abilities, limits, what the traveler can become); whether the game ever states it outright or leaves lasting doubt; what the late choice is and how it changes the ending; how the bell and the dead lantern fit.
- **Hidden knowledge:** until the owner approves a reveal plan, no NPC, journal text or UI should state or imply this, and nothing in the existing game should contradict it.
- **Conflict resolved (2026-11-03):** `docs/ASHMERE_STORY_SPINE.md` says to keep the traveler's prior life flexible and not require every origin to be false. The origin reading above takes precedence for story purposes; the spine's guidance still applies to what the player is told, which stays flexible and unconfirmed.

### L5 — Echoes are what the Veil's wound makes (locked 2026-10-19; reworded 2026-11-03)

"Echo" is the umbrella word for anything the Veil's wound makes or the Veil touches. The hostile monsters on the surface are **echoes the wound makes at the seal's weak points**, shaped like the peoples sealed below (goblins, orcs, ogres) and like animals. They are hollow, cannot be calmed or spared, and vanish when the wound closes. The real goblins, orcs and ogres live in the deep realm (see L7). Bandits and other human wrongdoers stay ordinary people (L2 and L3 are human wrongs).

The wound copies what presses on it: near the barrier it copies the sealed peoples; near the Hollow Saint's ritual and people's grief it copies the dead. Echoes of the dead look and sound like the dead, repeat habits and a few memories, don't know what they are, fray when pressed on the truth and cannot leave the place tied to them. People may choose to keep them.

An echo is a copy the wound makes. A **Veil-born** is a self the Veil makes or gifts on purpose. "Veil-born" is an author-level term and must not appear in player-facing text until a reveal plan is approved.

- **Replaces:** the 2026-10-19 wording that called the hostile monsters "touched creatures" (real creatures the Veil changed). The owner chose the echo reading on 2026-10-24.
- **Still open:** whether ordinary animals and untouched monsters still exist and can be hostile for ordinary reasons; whether the Changed are a fourth people; how the player tells the echoes of the dead from the living; which exact places count as weak points.

### L6 — The Last Mercy wounded the Veil, and the wound makes echoes (locked 2026-10-19; reworded 2026-11-03)

The healer's ritual, the Last Mercy, wounded the Veil. The wound now makes echoes on its own: at first imitating the dead, and increasingly from nothing. The **Hollow Saint is the healer's echo**: the first one the ritual made, a copy of its own maker. She believes she is the healer but is hollow. The world treats the healer and the Saint as one figure. The Last Mercy was for the healer's apprentice, whom she failed to save, and the traveler was going to be that apprentice. The Saint wants the wound kept open because closing it ends her; her offer to bring people's dead back is sincere.

- **Replaces:** "The Hollow Saint caused the wound through the Last Mercy." The wound is caused by the healer's ritual; the Saint is the echo that ritual made.
- **Hidden knowledge:** the link between the apprentice and the traveler is author-level knowledge under L4's hidden-knowledge rule. No player-facing text states or implies it until a reveal plan is approved.
- **Still open:** whether the Hollow Saint controls what comes out of the wound; the Saint's personality; where and when she is met (the owner's direction is around the middle of the game) and whether she is tied to one place or the exception to L5's place-bound rule; how an echo manipulates the Veil; whether the wound can be closed and how; the name of the force that makes echoes (until one is chosen, call it "the Veil"); names for the healer and the apprentice.

### L7 — An old war ended in an agreement (locked 2026-10-19; reworded 2026-11-03)

The war had no clean side. An atrocity on each side let leaders escalate; the kingdoms won and sealed everyone. The "agreement" was the seal itself: the kingdoms offered terms, the peoples' leaders set their marks beside the kings' seals believing it a treaty, and the signing was the working that bound them beneath the mountains. The monsters were coerced; the kingdoms called it an agreement. The human chronicles and the monster peoples' memory disagree about all of it.

- **The peoples:** goblins, orcs and ogres. The monsters on the surface are echoes of them (L5), not the peoples themselves.
- **The Deep Line:** the kingdoms forbade digging below **[the Deep Line]** because their wardens knew the barrier was fragile. Over generations the reason was forgotten and it became custom, then an inconvenience.
- **The faults:** at **[the Betrayed Ford]** a monster warband massacred a human relief column promised safe passage under truce. At **[the Quiet Gate]** the kingdoms sealed the realm while surrenders were still being negotiated, including families who never fought and clans that had already yielded.
- **Where:** **[the Ruined March]**, the battlefield where the sealing was done. Its ruins hold the conflicting accounts.
- **How it was hidden:** chroniclers wrote a treaty, the deep ground was declared forbidden, and one chronicler struck the leaves that said otherwise. Someone else kept copies.
- **Why it is breaking now:** the generations-old wound (L6) crossed a threshold on its own, and the **[Ironpass]** mine lords, pressed for ore and money, dug below the Deep Line and opened a barrier gate. The Veil's touch is what is breaking the seal.
- **The rhyme:** the Greyfen crossing (L2, L3: a record altered for trade) and the Deep Line breach (a law broken for ore) are the same human fault at small and large scale.
- Names and places in [brackets] are **placeholders**, not approved names. Do not put them in player-facing text.
- **Replaces:** "reached an agreement, and the peace held." That remains what the world believes. The truth above is author-level and is revealed gradually.
- **Still open:** names; how many monster peoples beyond the three; which kingdoms and whether they are today's kingdoms; what the Ironpass lords know; what the envoys and the peoples below want now; what the player learns of this and when (the Ironpass story stays local until the owner approves a reveal plan, per `docs/FIRST_THREE_TOWNS_RELEASE_PLAN.md`).

### L8 — The Veil is not evil (locked 2026-11-08)

The Veil is a force that people have used twice for their own ends: first to seal the monsters beneath the mountains, then in the Last Mercy. It is not evil. It is easily manipulated, magic has consequences, and it wants to help the traveler, the first it chose to help. In traveler creation it is the "???" voice and stays unnamed to the player (see the 2026-10-19 approved opening direction).

- **Hidden knowledge:** the voice's identity stays hidden until a reveal plan is approved (L4).
- **Still open:** the force's own name (until one is chosen, call it "the Veil"); what the Veil wants beyond helping the traveler; how and when the "???" voice's identity is revealed.

### L9 — The deep realm, the seal and why now (locked 2026-11-08)

The sealed place is a literal deep realm beneath the mountains, with real monster societies whose members were born there. A Veil barrier holds the entrances, and the dungeons are gateways. The Veil-thin places where magic can be drawn are the barrier's weak points; using magic there thins the seal (see L13). A few named **envoys** come up to the gates to see what the surface has done. The player can talk, trade and hear their side, including the monsters' own fault, and fights them only by choosing to start it.

Why now: the generations-old wound (L6) crossed a threshold on its own, and the recent Ironpass breach (L7) pushed it over. The dying Veil acts. *(Author-only: the bell that rang once is the Veil waking the traveler. L4's hidden-knowledge rule applies.)*

- **Guardrails:** envoys appear only after the legend's first leaves are in play, and Ironpass's story stays local until the owner approves a reveal plan (`docs/FIRST_THREE_TOWNS_RELEASE_PLAN.md`). Placeholder names from L7 stay out of player-facing text.
- **Still open:** who the envoys are and where the player first meets them; what they and the peoples below want now; whether the player sees a visible cost for thinning the seal.

### L10 — The legend (locked 2026-11-08)

The legend is true, but only part of it is exposed to the player. It is told as a chronicle in Mara's Archive, in a short, chronicle voice. Six leaves were struck from the reading, and copies are hidden in the first two regions, found on expeditions through a quest from Mara. It describes the peace, the wound, the blackening, and a stranger from a country no map holds. Belief is divided: not everyone thinks the traveler is the hero, and nothing confirms the traveler is the stranger.

- **Hidden knowledge:** closing the wound disperses the traveler's echo. No leaf, NPC or UI states or implies this (L4).
- **Not locked:** the wording of each leaf. Every leaf's text needs owner approval before it appears in the game, and leaf II must be rewritten to match L6 before it is used. Draft text and placement are proposals only.
- **Still open:** where each leaf is found; whether the player is shown a count of leaves; whether the hand in the margin that says "Keep the leaf" belongs to Mara's predecessor; what leaf VI ever says and when it is read.

### L11 — The traveler is the first Veil-born (locked 2026-11-08; extends L4)

The traveler is the first **Veil-born**. The Veil's touch interrupted the making and left a new self that was never a copy. When the wound closes, the echo disperses and the borrowed memories go (see the L4 origin reading); the self stays as a real person. The traveler loses some magic at the end, not necessarily all of it. The sequel's protagonist is a new Veil-born, not the original traveler.

- **Decided direction, not yet a reveal plan:** the player first learns the traveler is an echo at the midpoint, plainly, from the Hollow Saint. It is her claim alone, and the player can doubt her because she is an echo who wants the wound open. Clues elsewhere back her up or not.
- **Hidden knowledge:** L4's rule stays in force until the owner approves a full reveal plan. "Veil-born" stays out of player-facing text before then (L5). Nothing in the game hints at any of this before the plan exists.
- **Still open:** when the player learns closing the wound ends the echo; whether and when they learn the self survives; what the Veil's touch gave in abilities and limits; how a new Veil-born is born once the wound is closed; whether the original traveler appears in the sequel.

### L12 — The ending (locked 2026-11-08)

When the wound closes, all echoes disperse, including the echoes of the dead that people love. The Hollow Saint ends with them. The traveler's echo goes and the traveler's self stays. The final choice is about the monsters: re-seal or free them, informed by the faults found on both sides (L7). The canon ending is the one where the wound closes.

The player can instead accept the Saint's offer: she finishes the making, the traveler's self ends, the apprentice returns, the wound stays open and the land blackens. That is a short, bleak epilogue and is **not** canon for the sequel.

- **Sequel tie-in (direction):** fixed facts are that the wound is closed, every echo is gone, the coercion is exposed, the traveler's echo is gone and their self lives on, and the Veil is stronger and portable. The variable outcome (re-sealed or freed) stays small. No save import is assumed.
- **Still open:** what "freeing the monsters" concretely means, and what re-sealing means for a sealed people with a real grievance; how the Saint's offer is staged; how much of the ending is built first (a two-option final choice is the cheaper build).

### L13 — Magic is anchored in the first game (locked 2026-11-08)

Magic is a focus of the first game, not only of what follows it. In the first game it is usable only at Veil-thin places or with relics, and each use drains the place or relic. The Veil-born can draw on the Veil directly. At the end of the first game the Veil becomes stronger and portable, usable beyond its main purpose, which is how people acquire magic abilities.

- **Not implemented:** the shipped game has no spell, Strain or anchor mechanic. This locks the intent only.
- **Still open:** what the relics are; how the Five Arts, Strain and spell training from the reboot plan map onto anchors; what the Veil-born can do directly and what limits it; whether the player sees a visible cost when anchors are drained (see L9).

### L14 — Human enemies are ordinary people, met in stages (locked 2026-11-08)

The player fights humans as well as monsters. Human enemies stay ordinary people, not echoes (L5). They appear in stages: first people who profit from the faults (smugglers, claim-jumpers, hired guards) in the first two regions and at Ironpass; then the Saint's followers (the bereaved who want the wound kept open to keep their dead), only after the midpoint.

- **Guardrail:** the Saint's followers reveal the Saint and the echoes of the dead, so they stay out of the game until the reveal plan allows them (L4, L15).
- **Still open:** the human cast; the tone of fighting the bereaved; whether human fights can end in a yield or surrender.

### L15 — The Hollow Saint in the story (locked 2026-11-08)

The player first meets the Hollow Saint around the middle of the game. She recognizes the traveler on sight, persuades rather than fights, and returns in a few short conversations. Before that she is felt through echoes, rumors and the legend. The traveler was going to be the apprentice the healer lost (L6).

- **Hidden knowledge:** none of this is stated or implied in player-facing text before the midpoint scene (L4).
- **Still open:** her personality; where the midpoint meeting happens; whether she is tied to one place or the exception to L5's place-bound rule; how an echo manipulates the Veil; when she is named.

## Approved direction (approved by the owner 2026-10-15, as recorded in `AI_HANDOFF.md`)

- **Monster Wars & the Awakening:** a fantasy RPG about monster incursions, returning magic and regional conflict, with a deeper mystery behind it. Details: `docs/LEGEND_FANTASY_RPG_DIRECTION.md`.
- Monsters are not one army: goblins, orcs, ogres and the Changed are different peoples. The ones attacking are echoes (see L5). Whether untouched monsters and ordinary animals exist and can be hostile is open.
- Bells are ordinary Ashmere currency, not the universe's central mechanism. Region access combines money, preparation, permits, standing, relationships and proof.
- The first game spans Ashmere, the Old Road, Greyfen, Ironpass, Blackwood and the Ruined March. Only Ashmere, the Old Road and Greyfen exist in the game today.
- The Pale Surveyor, Hollow Mile, Unreturned, Four Witnesses, Office of Measure, Seven-Wagon Dispatch, Aren Vey and Ivara are demoted legacy ideas. Do not build on them without the owner's re-approval.

## Approved opening direction — the unnamed presence (owner-approved 2026-10-19)

The presence speaking during traveler creation is **the Veil at the author/story-design level**. The player must see and hear only **"???"**: do not call it the Veil, give it an in-world name, show an identifiable character portrait, or explain what it is during creation. Its role is to invite the player to shape the soul they will inhabit and to choose, recognize, or recall fragments of that soul's memories.

- The sequence should feel dreamlike and intimate: a name gathers around the silence; a shape appears in still water; a feeling persists after its scene is lost; a place or origin rises without a complete face; the hands remember a skill; a keepsake remains when the rest is unclear.
- These prompts are deliberately ambiguous. They do not decide which memories are historically true, whether the chosen origin is inherited or lived, or what kind of being the traveler is.
- The presence may speak about remembering, forgetting, fragments, identity and becoming. It must not state or conclusively imply that the traveler is an echo, was made by the Last Mercy, was touched by the Veil, or has a predetermined false past.
- Captain Oric belongs after this sequence, when the traveler wakes and reaches the Ashmere arrival briefing. Keep the anonymous presence's artwork abstract, misted and unidentifiable; the interface label remains "???" at every creation step and the final review.
- This is an approved opening-presentation direction, **not approval to reveal L4**. L4's hidden-knowledge rule remains in force until a separate owner-approved reveal plan decides how the traveler learns what they are.

## Approved direction — opening annals (owner-approved 2026-11-03)

The mandatory opening annals should cover **the old war and the seal only**. The Last Mercy, the wound in the Veil and echoes are **not** told in the opening; the player learns of them through Mara's Chronicle quest and the legend's leaves, scattered across the first two regions. The annals still end by handing into traveler creation.

- **Not yet implemented.** The shipped opening (`js/systems/opening-prologue-v220.js`, v0.30.1) still carries "III · The Last Mercy." Changing it is a code change with test updates (two tests assert the Last Mercy screen: `tests/road-opening-v140.spec.js` and `tests/reboot-prototype.spec.js`). The screen count stays at three.
- **Approved replacement for screen III (owner-approved 2026-11-03).** Use this text exactly; do not rewrite it. Keep the existing closing quote.
  - Chapter label: `III · THE PEACE KEPT`
  - Title: `The Peace, Written Down`
  - Paragraph 1: "The kingdoms did not trust the silence. They set wardens over the passage-stones and ordered the deep ground left alone. Chroniclers wrote the year down as the end of the monster war, and the writing was neat, and it became the version everyone told."
  - Paragraph 2: "Generations passed. Roads were cut across the old war-ground, and towns grew where armies had camped. The wardens’ stones were kept, and the law against digging became a custom, then an inconvenience. Few remembered why it had been made. Fewer asked."
  - Quote (unchanged from the shipped screen): "Before the road, before the waking, there is a question no chronicle can answer for you: what will you choose to carry?"
  - The replacement must not contain the words Last Mercy, Veil, echo, wound, healer or Saint.
  - Leaf I of the legend (the peace was believed, the kings' seals beside the peoples' marks) is a later find; do not pre-empt its wording in the annals.
- Do not reintroduce a "Skip the annals" button; all annals stay mandatory (v0.30.1).
- The annals text is the human account of the war and the seal. It must not contradict L7's truth in a way the later game cannot correct.
- This does not approve revealing L4. The annals must not mention the traveler's nature.

## Approved character direction — Captain Oric and Tavin Calder (owner-approved 2026-11-13; not yet implemented)

This is owner-approved story direction, not a new LOCKED entry and not a claim about content already playable. Use the character compendium for the fuller profile. Keep names, revelations, and scenes that remain open below unresolved until the owner decides them.

### Oric's former life and Ashmere

- After the ancient monster-sealing war, Oric fought in a separate war between human kingdoms. Another human kingdom invaded and conquered his homeland.
- During the fall, Oric escaped after playing dead among villagers killed in the invasion. He believes he is the last survivor of his kingdom. That belief is mistaken: Tavin survived, and the possibility of other survivors remains open.
- Oric wandered for years before reaching Ashmere while monsters were attacking the town. He fought to defend it and stayed to help after the attack. The townspeople were initially wary of an armed stranger who had appeared from nowhere.
- An ordinary resident Oric saved became the first person in Ashmere to trust him. Their bond helped him begin to belong; that person later followed a different path while retaining a special connection to Oric.
- When Ashmere's residents eventually asked Oric to lead because they had come to rely on him, he hesitated. That first trusted resident helped persuade him to accept. He earned the captaincy through his actions; he did not arrive seeking authority.
- Oric keeps his former kingdom and wartime history almost entirely private. People in Ashmere may know he is a veteran, but they do not know the full story. When questioned, he deflects with vague or deliberately incomplete answers.
- The traveler learns about his past gradually through clues and records, and eventually through someone from his former life. Oric begins telling the traveler himself in quiet moments after difficult journeys, in several conversations rather than one exposition scene. He struggles to express affection, but over time comes to regard the traveler as family.

### Tavin Calder

- Tavin Calder is the name of Oric's former young soldier and eventual Ashmere second-in-command. Tavin came from an ordinary family with no military tradition. His family struggled financially to make ends meet while he was growing up. The cause and specific circumstances of that hardship, and the details of his family, remain open.
- As a young soldier, Tavin was inexperienced and unsure of himself, but determined to prove himself. That determination sometimes made him reckless. Oric took him under his wing after recognizing a stubborn courage: Tavin kept going even when afraid.
- During one reckless incident, Oric protected Tavin from a blow and received the prominent scar across his face. Oric scolded Tavin at the time. Tavin carried guilt over the injury for years; after their reunion, Oric tells him he never regretted saving him, and Tavin is finally able to let that guilt go.
- During the invasion, Oric and Tavin were separated in the chaos without a chance to speak. Oric never saw Tavin die and believed he was lost. Returning to the conquered homeland was too dangerous. Tavin survived.
- Tavin spent years wandering, taking guard, escort, and settlement-protection work. He made friends along the way and remains in touch with some, but eventually stopped searching for his old home and learned to live without one.
- Tavin and Oric encounter one another by chance in Ashmere; Tavin is not initially seeking Oric. Tavin recognizes Oric by the facial scar and cautiously asks, “Commander?” Oric recognizes Tavin's voice immediately and embraces him.
- Tavin initially stays while passing through. Over time, he comes to love Ashmere and its people in their own right, not merely because Oric is there. He eventually earns the town's trust and becomes Oric's second-in-command, helping oversee its defenses when Oric is away.
- As an adult, Tavin is a hardened veteran, but warmer, more approachable, humorous, and more patient with younger guards than Oric. He mentors the traveler and occasionally teases Oric about how protective he has become. He retains his own friendships and sometimes leaves Ashmere to visit them.
- Oric and Tavin may disagree about how best to protect Ashmere, but they handle disagreements privately, seek a compromise, and present a united front to the town. Oric is quietly glad to have Tavin back, even if he rarely says so.

### Still open

- The names and histories of Oric's former kingdom and the invading kingdom.
- The name and fuller life of the first Ashmere resident who trusted Oric.
- The details of Tavin's difficult childhood, his family, and what first led him to enlist.
- Tavin's former friends, the specifics of his wandering years, and the timing of his eventual decision to settle in Ashmere.
- The identities and stories of any other survivors from Oric's former kingdom.
- The exact order, locations, and player-facing presentation of the clues and conversations through which the traveler learns Oric's history.

## Established in the shipped game (v0.20.35)

These are facts players can already see. Changing one means updating the game, its save flags and its tests.

- The traveler wakes beneath a dead lantern outside Ashmere with no memory of the last mile. Mara says the bell rang once when the traveler arrived, which should not be possible.
- Recurring cast: Mara Vell (Archive Keeper), Old Brenn (Ledger Keeper), Captain Oric (gate and watch captain), Sella Marr (inn cook and road provisioner).
- The evidence chain, in order:
  1. A bell-marked seal at Blackroot Bend.
  2. Greyfen's Boundary Stone: the older bell-mark sits under a newer cut angled toward the reed bed.
  3. The Reedwatch field note, dated two days after Greyfen logged the flood's retreat; its sketch already shows the newer cut.
  4. Brenn's ledger: two crossing entries rewritten in a later hand within days of the flood's retreat, with no closure order.
  5. An earlier weekly return: the lower crossing marked "CLOSED pending inspection," later marked OPEN in darker ink with no initials.
  6. Mara's conclusion: the records establish that the crossing status was altered; the existing player-facing evidence does not yet identify the Landing Warden. The missing closure order is the next lead, and later scenes must connect it to the locked production truth without skipping the player's evidence and choices.
- The Moved Cairn side story (three choices at the High Ridge cairn) exists, and the choice is saved.
- "A Dry Crossing" in Greyfen offers a safer path or a reed-bed shortcut with a disclosed 65% chance. It is requested by "the Landing Warden," who is unnamed in the game. The name Yara Fen appears only in `docs/LEGEND_CHARACTER_COMPENDIUM.md` as a proposal.

## Open questions, in the order we will settle them

1. What did the Veil's touch do to the traveler: abilities, limits, and what can they become? Is the traveler a made echo or a touched person? *(Largely answered by L4 and L11 on 2026-11-08: the Veil's touch interrupted the making and left a new self; abilities and limits remain open.)*
2. What is the force that makes echoes called? (Name open; "the Veil" until chosen.)
3. The Hollow Saint: does it control what comes out of the wound, what does it want, how does it act, and when is it revealed? *(Partly answered by L6 and L15 on 2026-11-03 and 2026-11-08. Personality, place and how an echo manipulates the Veil remain open.)*
4. The old war and the agreement: who fought, who agreed, what were the terms, where was it settled, and when did the Veil begin to break it? *(Answered in L7 on 2026-11-03. Names, peoples beyond the three, and what the player learns when remain open.)*
5. How does touching work? Can a touched creature be calmed, released or healed? Do orcs and the Changed count? Do ordinary animals and untouched monsters exist? *(Answered in L5 on 2026-11-03: the monsters are echoes and cannot be calmed or spared. Ordinary animals and the Changed remain open.)*
6. Is the player's chosen origin the echo's inherited memory, or does it stay true to the player? *(Answered by the L4 origin reading on 2026-11-03.)*
7. The late choice: when the traveler learns what they are, what can the player decide, and how does it shape the ending? *(Partly answered by L12 on 2026-11-08: the final choice is about the monsters, and the Saint's offer is a bleak non-canon ending. The reveal plan remains open.)*
8. Greyfen details: why was the lower crossing unsafe (flood damage, or something else), did the Warden re-inspect, was anyone hurt, and how does the player resolve it?
9. Is the magic system approved: the Afterwake, Strain and the Five Arts (Ember, Tide, Root, Gale, Veil)? *(Partly answered by L13 on 2026-11-08: magic is anchored in the first game. The Arts, Strain and relics remain open.)*
10. Exactly how do Bells, permits and standing combine to open regions, and is there a separate "Bellmarks" currency?
11. What crisis does the player solve by the end of the first game?

## Change log

- 2026-10-16: File created. L1 and L2 locked by the owner in conversation with Claude.
- 2026-10-16: L3 locked (the Landing Warden reopened the crossing). "Who ordered it" removed from the open questions.
- 2026-10-16: L4 locked (the traveler is an echo, but not an ordinary one). "What is the traveler" removed from the open questions; its details added as new ones.
- 2026-10-16: L4 amended by the owner: the traveler was touched by the Veil before the Last Mercy could finish, which is why they differ.
- 2026-10-16: Owner direction added: the Veil makes echoes, the hostile monsters are Veil-touched echoes, and an old war ended in an agreement the Veil is breaking. Recorded as approved direction (not locked), with four conflicts listed for the owner to reconcile. The traveler draft is on hold.
- 2026-10-19: Owner confirmed the echo rules. L5 (echoes are anything the Veil made or touched; the hostile monsters are Veil-touched echoes; humans stay ordinary), L6 (the Last Mercy wounded the Veil and the wound makes echoes) and L7 (an old war ended in an agreement the Veil is breaking) locked. The three conflicts listed on 2026-10-16 are resolved, and the monster bullet under Approved direction was updated to match L5.
- 2026-10-19: The traveler draft is off hold.
- 2026-10-19: Owner approved the traveler-creation voice as the Veil at the author/story-design level, shown to the player only as "???". Creation is framed as shaping a soul and recovering ambiguous memories; this does not reveal or imply the traveler's L4 nature, and Oric appears only after the sequence.
- 2026-11-03: Owner approved, in conversation with Claude: (1) L6 reworded so the healer's ritual caused the wound and the Hollow Saint is the healer's echo; (2) the L4 origin reading (creation memories are the apprentice's, scrambled by the Veil's interruption, and they disperse at the end); (3) the opening annals should cover only the old war and the seal, with the Last Mercy moved out to Mara's Chronicle leaves (recorded as approved direction; not yet implemented). The owner asked to proceed with the L5 and L7 rewording alongside these; merging the pull request that carries this change is the owner's lock of that wording. The Veil, deep-realm, legend, traveler (Veil-born), ending, magic, human-enemy and Saint-in-story entries are held back until the owner reviews them.
- 2026-11-08: Owner locked, in conversation with Claude, entries L8 (the Veil is not evil), L9 (the deep realm, the seal and why now, including envoys), L10 (the legend; leaf wording stays unapproved), L11 (the traveler is the first Veil-born; extends L4), L12 (the ending), L13 (magic is anchored in the first game; intent only, not implemented), L14 (human enemies are ordinary people, met in stages) and L15 (the Hollow Saint in the story), each as written in the lock sheet. The reveal plan, names and the details listed under each entry's "Still open" remain undecided. Open questions 1, 3, 7 and 9 were annotated as partly answered.
- 2026-11-13: Owner-approved the Oric and Tavin Calder character direction in conversation. Their former-kingdom history, Ashmere roles, reunion, and relationship are recorded as approved direction, not locked or implemented; unresolved details remain listed in the section above and in the character compendium.
