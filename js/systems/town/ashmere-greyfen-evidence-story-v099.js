/* LEGEND Greyfen evidence conversation progression.
 * Owns dialogue for the boundary archive/ledger investigation and the associated
 * flags, memories, and quest-log objective changes. Screen and save adapters stay
 * in the NPC story/dialogue facades.
 */
(() => {
  function apply(player, id, greyfen, dialogue, setBellQuestObjective) {
    if (!player || !dialogue || typeof setBellQuestObjective !== 'function') return false;
    const pl = player;
    const n = dialogue;
    if(greyfen&&id==='mara'&&pl.flags?.greyfenEvidenceFiled&&pl.flags?.greyfenStorehouseDispatchFound&&!pl.flags?.greyfenStorehouseDispatchReported&&!(pl.flags?.greyfenWaterlineGaugeRead&&!pl.flags?.greyfenWaterlineGaugeReported)){
      n.lines=[
        'This storehouse dispatch confirms that a load of supplies was routed through the lower crossing as a temporary exception after the flood’s retreat.',
        'The authorization leaf is missing. It tells us there was pressure to keep goods moving, but it does not identify who approved the exception or whether they understood the risk.',
        'I will preserve it alongside the crossing records. We still need the missing closure order before drawing a conclusion about the route change.'
      ];
    }else if(greyfen&&id==='mara'&&pl.flags?.greyfenWaterlineGaugeRead&&!pl.flags?.greyfenWaterlineGaugeReported){
      n.lines=[
        'The gauge gives us a height and a clean, hand-cut notch. I will preserve the measurement in the Boundary Archive as an observation, not an accusation.',
        'The notch itself does not identify who cut it or explain why. We need a dated comparison before assigning it to any route change.',
        'The missing closure order remains our next lead. The gauge is now part of the record, but it does not settle the question of who authorized the lower crossing.'
      ];
    }else if(greyfen&&id==='mara'&&pl.flags?.greyfenEvidenceFiled){
      n.lines=[
        'The field note, the crossing ledger, and the earlier weekly return are now preserved together. Each record tells a different part of the same route history.',
        'The lower crossing was officially closed pending inspection, then marked open without initials. We have evidence of an alteration, not the name of the person who made it.',
        'The missing closure order is our next lead. Until it is found, no honest record lets us say who authorized the change.'
      ];
    }else if(greyfen&&id==='mara'&&pl.flags?.greyfenWeeklyReturnReported){
      n.lines=[
        'The field note, the crossing ledger, and the earlier weekly return are now preserved together. Each record tells a different part of the same route history.',
        'The lower crossing was officially closed pending inspection, then marked open without initials. We have evidence of an alteration, not the name of the person who made it.',
        'The missing closure order is our next lead. Until it is found, no honest record lets us say who authorized the change.'
      ];
    }else if(greyfen&&id==='mara'&&pl.flags?.greyfenFieldNoteFound){
      n.lines=[
        'The field note is dated two days after Greyfen logged the flood’s retreat. Its sketch already shows the newer cut pointing into the reed bed.',
        'The date means the cut was present after the flood was recorded; the water alone does not account for it. The signature is lost, so the writer remains unknown.',
        'Take the date to Brenn. His ledger may show which deliveries changed direction that week.'
      ];
    }else if(greyfen&&id==='mara'&&pl.flags?.greyfenBoundaryCompared){
      n.lines=[
        'The Blackroot mark appears beneath the newer cut here. Water has worn the surface, but it did not make that clean, directional groove.',
        'The later line turns toward the reed bed instead of the raised path. Someone may have been diverting travelers—or trying to hide the higher route. The stone alone cannot tell us which.',
        'I will preserve both layers in the Boundary Archive. Next we need a dated record or physical sign that tells us when the newer cut was made.'
      ];
    }else if(greyfen&&id==='mara'&&pl.flags?.bellRoadSearched){
      n.lines=[
        'You have a Blackroot record now. Bring it to the boundary stone on the approach; I need a second mark before I compare the records.',
        'Do not scrape the stone or try to improve the cut. Its surface is evidence exactly as it stands.',
        'A second location may tell us whether the sign has been copied, altered, or only worn by the water.'
      ];
    }

    if(greyfen&&id==='brenn'&&pl.flags?.greyfenWeeklyReturnFound&&!pl.flags.greyfenWeeklyReturnReported){
      n.lines=[
        'This is an earlier return than the entries I showed you. The lower crossing is clearly marked CLOSED pending inspection; the later OPEN correction is written in a different ink and carries no initials.',
        'That gives us an order of events, but not an author. I will compare it against the crossing ledger and leave the discrepancy open.',
        'Take both versions to Mara. A record should preserve a contradiction until evidence resolves it.'
      ];
    }else if(greyfen&&id==='brenn'&&pl.flags?.greyfenWeeklyReturnReported){
      n.lines=[
        'The weekly return predates the overwritten ledger entries. The closure was recorded first; the unsigned OPEN correction came later.',
        'We cannot accuse a person from handwriting alone. Mara has the copies, and we still need the missing closure order.',
        'Until that order turns up, the lower crossing stays marked uncertain in my ledger.'
      ];
    }else if(greyfen&&id==='brenn'&&pl.flags?.greyfenFieldNoteReported){
      n.lines=[
        'I have two crossings entered within days of the flood’s retreat. Both destinations were overwritten in a later hand, and neither entry carries the usual closure order.',
        'That does not tell us who changed the route. It does tell us the newer cut and the redirected deliveries belong in the same investigation.',
        'I will leave the discrepancy open until the earlier weekly route return can be found.'
      ];
      if(!pl.flags.greyfenLedgerCompared){
        pl.flags.greyfenLedgerCompared=true;
        pl.memories=Array.isArray(pl.memories)?pl.memories:[];
        const memory='Old Brenn found two Greyfen crossing entries rewritten within days of the flood’s retreat. Both lack a closure order; who changed the destinations is still unknown.';
        if(!pl.memories.includes(memory))pl.memories.push(memory);
        setBellQuestObjective(pl,'Find the earlier weekly route return that accompanied the overwritten Greyfen ledger.');
      }
    }

    if(greyfen&&id==='brenn'&&pl.flags?.greyfenWeeklyReturnFound&&!pl.flags.greyfenWeeklyReturnReported){
      pl.flags.greyfenWeeklyReturnReported=true;
      pl.memories=Array.isArray(pl.memories)?pl.memories:[];
      const memory='Old Brenn compared the earlier weekly route return with the overwritten Greyfen ledger: the lower crossing was closed pending inspection before a later, unsigned correction marked it open.';
      if(!pl.memories.includes(memory))pl.memories.push(memory);
      setBellQuestObjective(pl,'Ask Mara to preserve the field note, overwritten ledger, and weekly return together in the Boundary Archive.');
    }
    if(greyfen&&id==='mara'&&pl.flags?.greyfenWeeklyReturnReported&&!pl.flags.greyfenEvidenceFiled){
      pl.flags.greyfenEvidenceFiled=true;
      pl.memories=Array.isArray(pl.memories)?pl.memories:[];
      const memory='Mara filed the Blackroot seal, Greyfen boundary comparison, Reedwatch field note, and weekly route return together. The route alteration is documented, but its author and the missing closure order remain unknown.';
      if(!pl.memories.includes(memory))pl.memories.push(memory);
      setBellQuestObjective(pl,'Find the missing closure order that authorized the later change to the lower crossing.');
    }
    if(greyfen&&id==='mara'&&pl.flags?.greyfenWaterlineGaugeRead&&!pl.flags.greyfenWaterlineGaugeReported){
      pl.flags.greyfenWaterlineGaugeReported=true;
      pl.memories=Array.isArray(pl.memories)?pl.memories:[];
      const memory='Mara filed the Greyfen Waterline Gauge reading: its newest notch records a height and appears cut by hand, but does not identify its maker or intent. The missing closure order remains unresolved.';
      if(!pl.memories.includes(memory))pl.memories.push(memory);
      setBellQuestObjective(pl,'Find the missing closure order that authorized the later change to the lower crossing.');
    }
    if(greyfen&&id==='mara'&&pl.flags?.greyfenFieldNoteFound&&!pl.flags.greyfenFieldNoteReported){
      pl.flags.greyfenFieldNoteReported=true;
      pl.memories=Array.isArray(pl.memories)?pl.memories:[];
      const memory='Mara confirms the Reedwatch field note was recorded two days after the flood’s retreat was logged and that its sketch already shows the newer cut. The date narrows when the mark appeared, but the writer remains unknown.';
      if(!pl.memories.includes(memory))pl.memories.push(memory);
      setBellQuestObjective(pl,'Ask Old Brenn to compare the dated field note with Greyfen’s crossing ledger.');
    }
    if(greyfen&&id==='mara'&&pl.flags?.greyfenBoundaryCompared&&!pl.flags.greyfenArchiveRead){
      pl.flags.greyfenArchiveRead=true;
      pl.memories=Array.isArray(pl.memories)?pl.memories:[];
      const memory='Mara compared the Blackroot seal record with the Greyfen boundary stone. The older bell-mark continues beneath a newer groove turned toward the reed bed; the evidence shows alteration, but not who ordered it.';
      if(!pl.memories.includes(memory))pl.memories.push(memory);
      setBellQuestObjective(pl,'Find a dated record or physical sign showing when the newer Greyfen cut was made.');
    }

    if(greyfen&&id==='mara'&&pl.flags?.greyfenEvidenceFiled&&pl.flags?.greyfenStorehouseDispatchFound&&!pl.flags?.greyfenStorehouseDispatchReported&&!(pl.flags?.greyfenWaterlineGaugeRead&&!pl.flags?.greyfenWaterlineGaugeReported)){
      pl.flags.greyfenStorehouseDispatchReported=true;
      pl.memories=Array.isArray(pl.memories)?pl.memories:[];
      const memory='Mara added the Silted Storehouse dispatch to the Boundary Archive. It records a temporary supply exception through the lower crossing, but its authorization leaf is missing and it does not identify who approved the route.';
      if(!pl.memories.includes(memory))pl.memories.push(memory);
      setBellQuestObjective(pl,'Review the preserved Boundary Archive records and continue seeking the missing closure order.');
    }

    return true;
  }

  window.LegendAshmereGreyfenEvidenceStoryV099 = Object.freeze({ apply });
})();
