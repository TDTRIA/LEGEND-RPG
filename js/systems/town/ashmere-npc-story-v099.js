/* LEGEND Ashmere/Greyfen NPC story progression.
 * Owns conditional dialogue variants and NPC-triggered quest state/memory updates.
 * Evidence and first-return story services are injected to avoid hidden dependencies.
 */
(() => {
  function create(context = {}) {
    const { greyfenEvidenceStory, firstRoadReturnDialogue } = context;
    function apply(player, id, greyfen, dialogue, setBellQuestObjective) {
    if (!player || !dialogue || typeof setBellQuestObjective !== 'function') return false;
    const pl = player;
    const n = dialogue;
    if (typeof greyfenEvidenceStory?.apply === 'function') {
      greyfenEvidenceStory.apply(pl, id, greyfen, n, setBellQuestObjective);
    } else if (greyfen) {
      n.lines = ['The Greyfen evidence service did not load. Refresh before continuing.'];
    }
    if (typeof firstRoadReturnDialogue?.apply === 'function') {
      firstRoadReturnDialogue.apply(pl, id, greyfen, n);
    } else if (!greyfen && pl.flags?.firstRoadReturnSeen) {
      n.lines = ['The first-road-return dialogue service did not load. Refresh before continuing.'];
    }
    if(!greyfen&&id==='oric'&&pl.flags?.highRidgeCairnOutcome){
      n.lines=pl.flags.highRidgeCairnOutcome==='restore'
        ?['You reset the Ridgeway Cairn. I have asked the road crew to check the lower cart track before anyone trusts the old line.','Keep the fresh scrape in your report. If someone moved it once, we need to know why before we call it settled.']
        :pl.flags.highRidgeCairnOutcome==='warn'
         ?['The warning strip is still doing a job. I have logged the shifted cairn as unsafe until we can survey it properly.','A warning is not a repair, but it gives the next traveler a chance to stop before the ground fails.']
         :['You recorded both alignments and left the stone untouched. Good. A route mark should be evidence, not an order no one can question.','I have copied both positions into the ledger. If someone moved it, we need the reason—not a cleaner story.'];
    }
    pl.flags=pl.flags||{}; pl.npcTalk=pl.npcTalk||{}; pl.npcTalk[id]=Number(pl.npcTalk[id]||0)+1;
    if(id==='mara'&&!greyfen){
      pl.flags.talkedToMara=true;
      pl.flags.bellQuestStarted=true;
      if(pl.flags.firstRoadReturnSeen&&!pl.flags.firstRoadReturnMaraBriefed){
        pl.flags.firstRoadReturnMaraBriefed=true;
      }
      if(pl.flags.firstRoadReturnSeen){
        const objective=pl.flags.greyfenEvidenceFiled
          ? 'Find the missing closure order that authorized the later change to the lower crossing.'
          : pl.flags.greyfenWeeklyReturnReported
            ? 'Ask Mara to preserve the field note, overwritten ledger, and weekly return together in the Boundary Archive.'
            : pl.flags.greyfenWeeklyReturnFound
              ? 'Bring the earlier weekly route return to Old Brenn in Greyfen’s Bellkeeper’s Ledger.'
              : pl.flags.greyfenLedgerCompared
                ? 'Find the earlier weekly route return that accompanied the overwritten Greyfen ledger.'
                : pl.flags.greyfenFieldNoteReported
            ? 'Ask Old Brenn to compare the dated field note with Greyfen’s crossing ledger.'
            : pl.flags.greyfenFieldNoteFound
              ? 'Bring the dated Reedwatch field note to Mara in Greyfen’s Boundary Archive.'
              : pl.flags.greyfenArchiveRead
                ? 'Find a dated record or physical sign showing when the newer Greyfen cut was made.'
                : pl.flags.greyfenBoundaryCompared
                  ? 'Take the matching boundary mark to Mara in Greyfen’s Boundary Archive.'
                  : pl.flags.bellRoadSearched
                    ? 'Compare the Blackroot seal record with Greyfen’s boundary marks when the lowland archive is available.'
                    : 'Inspect the bell-marked seal at Blackroot Bend and return with your observations.';
        setBellQuestObjective(pl,objective);
      }
    }

    return true;
  }

    return Object.freeze({ apply });
  }

  // Stable compatibility method used by existing callers and story contract tests.
  const compatibilityStory = create({
    greyfenEvidenceStory: window.LegendAshmereGreyfenEvidenceStoryV099,
    firstRoadReturnDialogue: window.LegendAshmereFirstRoadReturnDialogueV099
  });

  window.LegendAshmereNpcStoryV099 = Object.freeze({
    create,
    apply: compatibilityStory.apply
  });
})();
