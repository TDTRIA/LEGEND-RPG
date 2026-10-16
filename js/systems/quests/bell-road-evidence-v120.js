/* LEGEND v0.20.36 - Bell quest evidence gathered on Old Road.
 * Owns the quest-specific flag, memory, and objective mutations produced by
 * selected POIs. General discovery rewards and scene flow remain in road-discovery.
 */
(() => {
  function create(context = {}) {
    const { setBellQuestObjective } = context;
    if (typeof setBellQuestObjective !== 'function') return null;

    function addMemory(player, text) {
      player.memories = Array.isArray(player.memories) ? player.memories : [];
      if (!player.memories.includes(text)) player.memories.push(text);
    }

    function recordPointEvidence(player, point) {
      const result = { foundGreyfenFieldNote: false, foundGreyfenWeeklyReturn: false };
      if (!player || !point) return result;

      const flags = player.flags || {};
      if (point.key === 'blackroot-mark') {
        const currentFlags = player.flags || (player.flags = {});
        currentFlags.bellRoadSearched = true;
        addMemory(player, 'At Blackroot Bend, black roots split a stone seal bearing the same bell-mark found near Ashmere. The mark repeats, but its purpose remains unclear.');
        if (currentFlags.firstRoadReturnMaraBriefed) {
          setBellQuestObjective(player, 'Return to Mara with your observation of the bell-marked seal at Blackroot Bend.');
        }
      } else if (point.key === 'greyfen-marker' && flags.bellRoadSearched && !flags.greyfenBoundaryCompared) {
        player.flags = player.flags || {};
        player.flags.greyfenBoundaryCompared = true;
        addMemory(player, 'At the Greyfen Approach, the boundary stone carries the bell-mark seen at Blackroot Bend beneath a newer cut angled toward the reed bed. The mark proves a change in the stone, not who made it.');
        setBellQuestObjective(player, 'Take the matching boundary mark to Mara in Greyfen’s Boundary Archive.');
      } else if (point.key === 'reedwatch-locker' && flags.greyfenArchiveRead && !flags.greyfenFieldNoteFound) {
        result.foundGreyfenFieldNote = true;
        player.flags = player.flags || {};
        player.flags.greyfenFieldNoteFound = true;
        addMemory(player, 'At Reedwatch Shelter, you found a field note dated two days after Greyfen logged the flood’s retreat. Its sketch already shows the newer cut angled toward the reed bed; the signature is unreadable.');
        setBellQuestObjective(player, 'Bring the dated Reedwatch field note to Mara in Greyfen’s Boundary Archive.');
      } else if (point.key === 'camp-firepit' && flags.greyfenLedgerCompared && !flags.greyfenWeeklyReturnFound) {
        result.foundGreyfenWeeklyReturn = true;
        player.flags = player.flags || {};
        player.flags.greyfenWeeklyReturnFound = true;
        addMemory(player, 'At Wayfarer’s Camp, you found an earlier weekly route return: the lower crossing was marked CLOSED pending inspection, then overwritten as OPEN without initials. The record shows a changed instruction, not who changed it.');
        setBellQuestObjective(player, 'Bring the earlier weekly route return to Old Brenn in Greyfen’s Bellkeeper’s Ledger.');
      }

      return result;
    }

    return Object.freeze({ recordPointEvidence });
  }

  window.LegendBellRoadEvidenceV120 = Object.freeze({ create });
})();
