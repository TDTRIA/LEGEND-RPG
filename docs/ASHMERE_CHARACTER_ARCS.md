# LEGEND — Ashmere Character Arcs & Dialogue Bible

**Status:** Writing-room draft. Existing game content is labeled **implemented**; proposed motives, arc beats, and future reveals are **not canon until approved**.  
**Scope:** Recurring characters in *LEGEND: Roads of Ashmere*, their voices, regional continuity, and future story potential.  
**References:** [World & Story Bible](LEGEND_WORLD_BIBLE.md), [First-Session Story Spine](ASHMERE_STORY_SPINE.md), [Opening Experience Redesign](OPENING_EXPERIENCE_REDESIGN.md).

## 1. Purpose

The player should remember characters as people, not as service menus. Every recurring character needs a practical responsibility, a distinct voice, a personal stake, a boundary around what they know, and a change that can be observed through play.

The first game does not need huge branching conversations. It needs a small number of memorable conversations that provide a useful action, reveal character, and echo after the player returns with evidence.

## 2. Current-cast and continuity audit

### Implemented cast

- **Mara Vell:** Ashmere’s archive keeper; appears as the boundary archivist in Greyfen. Her lines connect the single bell, discoveries, bell-marks, and records.
- **Old Brenn:** Ashmere’s ledger keeper; appears as the Bellkeeper’s Ledger in Greyfen. His lines emphasize proof, rewards, crossings, disappearances, and obligations.
- **Captain Oric:** Ashmere’s gate captain; appears as the Causeway Watch in Greyfen. His lines emphasize survival, route safety, preparation, and hazards.
- **The Innkeeper, Trader, Blacksmith, and Work Board roles:** Essential to recovery, trade, equipment, crafting, and work. They should gain a recurring voice as their narrative function grows.
- **Sella:** Old save flags and an older errand quest remain in data, but the current Town Square conversation list centers on Mara, Brenn, and Oric. Her visible role needs a deliberate decision before writing a major arc.

### Continuity decision: the same three keepers appear in two towns

**Established implementation fact:** The region-aware dialogue reuses the same NPC names and IDs in Ashmere and Greyfen, while changing their titles and local dialogue. That creates an unanswered story question: did they travel with the protagonist, do they serve a wider network, or is the current implementation reusing Ashmere’s cast temporarily?

Choose one approach before a major Greyfen narrative pass:

**Option A — Traveling keepers (proposed).** Mara, Brenn, and Oric have a credible shared assignment to compare road records, trade obligations, and crossing safety. Show or explain their arrival. Their separate expertise remains distinct.

**Option B — Local Greyfen keepers (proposed).** Give Greyfen its own named residents, portraits, relationships, and save IDs. Ashmere’s keepers remain local to Ashmere. This strengthens regional identity but requires more dialogue, assets, and QA.

**Recommendation:** Prefer Option B when Greyfen receives its next substantial story pass. Greyfen is supposed to feel like a different working community; distinct local keepers help it feel inhabited rather than re-skinned. Until then, avoid new plot points that require the Ashmere trio to have physically traveled to Greyfen.

Do not silently create two people with the same name. The chosen model must agree across dialogue, portraits, NPC IDs, quest flags, and region transitions.

### Names and legacy state

- The current source uses **Captain Oric**; older informal notes sometimes use “Olric.” Confirm one spelling before publishing new fiction.
- Sella’s remaining save flags do not prove she is a visible current character. Decide whether she returns as a living conversation/quest-giver, remains a legacy quest, or is retired during an intentional save/content migration.
- Avoid giving an unnamed service character a deep backstory solely because a portrait exists. Name and develop them when they have a meaningful narrative role.

## 3. Writing rules

1. **Work comes first.** What must the character do today, and what happens to the community if they fail?
2. **Knowledge has a source.** A character knows what their job, relationships, history, or firsthand observation gives them reason to know.
3. **Voice survives without labels.** The character's word choice, rhythm, metaphors, and boundaries should make them recognizable.
4. **Conversations create a next beat.** Offer a useful action, a changed relationship, a specific clue, or a more interesting question.
5. **Cooperation is the default.** Most characters are capable people with different priorities, not rivals who argue in every scene.
6. **No accidental canon.** A generated portrait, prop, placeholder line, or future-arc note does not establish a biography or secret.

## 4. Character cards

### Mara Vell — The Archive Keeper

**Implemented:** She says the bell rang once when the traveler arrived and that this should not be possible. Her Greyfen dialogue references drowned records, boundary marks, and rubbings of bell-marks.

**Proposed dramatic engine:** Mara believes careful records can prevent people from repeating an old mistake. Her danger is mistaking a complete-looking record for a complete truth.

- **Public want:** Find and preserve specific, verifiable evidence of events that do not fit the archive.
- **Strengths:** Precision, patience, memory for detail, fair questions.
- **Flaws to play:** She can demand evidence when someone needs comfort, compare a strange event to existing records too quickly, or struggle to accept two trustworthy accounts that contradict each other.
- **Arc proposal:** First she records the impossible detail; then she compares real road evidence to the archive; later, she must preserve an unresolved contradiction rather than force a neat explanation.
- **Voice:** Measured and exact. Short declarative sentences, margins, ink, missing lines, damaged pages. Her metaphors are quiet, never prophetic.
- **Avoid:** Turning her into a lore terminal or letting her solve the entire mystery from one fragment.
- **Gameplay hooks:** Journal entries, archive unlocks, clue comparison, item identification, and post-expedition questions about what the traveler actually saw.

### Old Brenn — The Ledger Keeper

**Implemented:** Brenn values recorded proof, rewards, Road Tokens, safe crossings, and obligations. His Ashmere dialogue stresses that the road forgets and he does not.

**Proposed dramatic engine:** Brenn believes a record turns a promise into something a community can rely on. His flaw is trusting what can be counted before what can only be witnessed.

- **Public want:** Make the exchange between dangerous journeys and town rewards fair, legible, and accountable.
- **Strengths:** Practical memory, material fairness, turning effort into tangible help.
- **Flaws to play:** He can sound cold while trying to be fair or treat an undocumented loss as unverified.
- **Arc proposal:** He records the first expedition honestly; later, conflicting accounts challenge the ledger; he learns to preserve witness statements and uncertainty without abandoning accountability.
- **Voice:** Economical and grounded. Coins, margins, weights, balances, receipts, debts. Dry humor can be warm, not miserly.
- **Avoid:** Using him only to dispense rewards or making him dismiss every emotional appeal.
- **Gameplay hooks:** Contract turn-ins, reward explanations, Road Token milestones, trade consequences, and proof that unlocks regional progress.

### Captain Oric — The Gate Captain

**Implemented:** Oric teaches preparation, guarding against heavy attacks, retreating before pride causes harm, and respecting hazards. His Greyfen dialogue focuses on raised paths and flood risk.

**Proposed dramatic engine:** Oric believes many tragedies begin when people mistake courage for ignoring danger. His tension is keeping travelers alive without teaching them never to take a risk.

- **Public want:** Send travelers out prepared and get as many as possible home.
- **Strengths:** Tactical judgment, concise warnings, respect for field evidence.
- **Flaws to play:** He can mistake caution for obedience or shut down discussion when an immediate decision is needed.
- **Arc proposal:** He begins by asking whether the traveler is prepared; after battle and route reports, he updates a practical warning when the evidence warrants it; later, he teaches judgment rather than simply issuing orders.
- **Voice:** Direct and concrete. Footing, visibility, weapon reach, supplies, weather, retreat. No riddles.
- **Avoid:** Making him an unfeeling drill sergeant or making him explain the supernatural mystery.
- **Gameplay hooks:** Combat guidance, expedition preparation, guard/retreat lessons, route warnings, and practical jobs such as a watchlight survey.

### Sella — Continuity hold

**Implemented data residue:** Save normalization retains Sella-related flags and an older errand quest identifier. The current People screen does not present her among the main three conversations.

**Recommendation:** Decide whether Sella returns as a visible Ashmere resident, remains a minor legacy quest, or is retired during an intentional save/content migration. Do not infer a new biography solely from stored flags.

**If reintroduced (proposed):** Give her an immediate everyday need and a reason to speak to the traveler. Her first story should reveal something about Ashmere’s working life that Mara, Brenn, and Oric would not naturally know.

### The unnamed service characters

The Innkeeper, Trader, and Blacksmith embody recovery, exchange, and preparation. Before adding names or deep history, define their daily responsibility, independent want, firsthand knowledge of the road, refusal boundary, and one way their advice changes after a relevant job or expedition.

## 5. Relationship design

These are proposed dynamics, not established plot facts:

| Pair | Productive tension | Shared value |
|---|---|---|
| Mara ↔ Brenn | What counts as evidence: a preserved record or an accountable witness? | The town needs reliable information. |
| Mara ↔ Oric | How much proof is needed before a warning changes? | Fewer travelers should be hurt by the same mistake. |
| Brenn ↔ Oric | The real cost of safer routes, supplies, and failed expeditions | Safety has a material cost; rewards must be honest. |
| Ashmere ↔ Greyfen keepers | Local records may describe the same route differently | Place-specific knowledge matters. |

Do not make every pair argue in every scene. The tension is most interesting when both people are right about something and a real choice forces their priorities to compete.

## 6. Let arcs touch the game

A conversation should leave a trace where appropriate:
- **Mara:** a journal/archive entry, clue comparison, or explicit distinction between observation and interpretation.
- **Brenn:** recorded proof, reward arithmetic, contract state, or a clear unlock condition.
- **Oric:** a practical hazard warning, enemy behavior lesson, or response to a battle report.
- **Service roles:** a small change in stock, advice, or dialogue when the player has a relevant item or completed a job.

Prefer existing player data and contract counters when they represent the event. Avoid a forest of one-off flags. A modest memory system that works consistently is better than branching dialogue with state errors.

## 7. Sample voice check

Fresh draft lines for style calibration only; not final in-game dialogue:

- **Mara:** “Tell me where you found the mark. Not what you think it means. We can write the meaning beside it once we know what survived.”
- **Brenn:** “I can pay for a recovered marker. I can pay for a crossing report. I cannot pay a rumor twice and call that careful accounting.”
- **Oric:** “The water looks shallow until you step off the stones. Keep to the posts. If they disappear, turn back and bring me the report.”
- **A future Greyfen keeper:** “We do not mark the path because the ground is kind. We mark it so you know when the ground has changed.”

Their voices differ through priorities: provenance, accountability, survival, and local practice. None of them explains the whole mystery.

## 8. Decisions to make before major character expansion

1. Are Mara, Brenn, and Oric traveling keepers or should Greyfen have its own named residents?
2. Is Sella in the active first-game cast, and where does the player meet her?
3. Which spelling is canonical: Oric or Olric?
4. Which relationships should carry explicit arcs, and which should remain everyday interactions?
5. How much personal history belongs in the first game versus later installments?

No private motive, past tragedy, family tie, faction allegiance, or hidden explanation in this document becomes canon until deliberately approved.

## 9. Acceptance checklist

- [ ] Each recurring NPC has a job, personal want, knowledge boundary, and recognizable voice.
- [ ] Mara, Brenn, and Oric do not repeat the same lore in different words.
- [ ] Conversations lead to an action, journal trace, changed understanding, or relationship beat.
- [ ] Greyfen’s cast model matches dialogue, portraits, IDs, and saved state.
- [ ] Legacy Sella data is not mistaken for an implemented visible character arc.
- [ ] Dialogue changes respect existing saves and quest counters.
- [ ] Proposed reveals remain separate from established canon.
