/* LEGEND Ashmere/Greyfen next-step guidance.
 * Purely selects the current suggested action from saved traveler flags, region,
 * and Road Token count. The town hub owns presentation and navigation.
 */
(() => {
  function regionalStoryGoal(player, target, goal) {
    const current = String(player?.currentRegion || 'Ashmere');
    const atTarget = target === 'Greyfen'
      ? current === 'Greyfen'
      : target === 'Old Road'
        ? current === 'Ashmere'
        : current === 'Ashmere';

    if (atTarget) return goal;

    const destination = target === 'Old Road' ? 'Ashmere' : target;
    const destinationText = destination === 'Greyfen'
      ? 'travel to Greyfen'
      : 'return to Ashmere';
    const tasks = target === 'Old Road'
      ? ['Open the Road Network', 'Return to Ashmere', 'Enter the Old Road and continue the evidence search']
      : destination === 'Greyfen'
        ? ['Open the Road Network', 'Travel to Greyfen', goal.title]
        : ['Open the Road Network', 'Return to Ashmere', goal.title];

    return {
      view: 'regions',
      title: goal.title,
      text: goal.text + ' You are currently in ' + current + '. Use the Road Network to ' + destinationText + ' before continuing this lead.',
      cta: destination === 'Greyfen' ? 'Travel to Greyfen' : 'Return to Ashmere',
      icon: 'regions',
      tasks
    };
  }

  function currentGreyfenStoryGoal(player) {
    const flags = player?.flags || {};
    const current = String(player?.currentRegion || 'Ashmere');

    if (flags.greyfenWeeklyReturnFound && !flags.greyfenWeeklyReturnReported) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'brenn',
        title: 'Report the Earlier Weekly Return',
        text: 'The oilskin return records the lower crossing as CLOSED pending inspection, then OPEN in darker ink without initials. Bring the original record to Old Brenn so the contradiction is preserved.',
        cta: 'Speak to Old Brenn',
        icon: 'journal',
        tasks: ['Keep both entries intact', 'Ask Brenn to compare the return with his ledger', 'Do not infer the author from the handwriting']
      });
    }

    if (flags.greyfenWeeklyReturnReported && !flags.greyfenEvidenceFiled) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'mara',
        title: 'File the Crossing Evidence',
        text: 'Brenn compared the earlier return with his ledger. Bring the field note, ledger discrepancy, and weekly return together with Mara in the Boundary Archive.',
        cta: 'Speak to Mara',
        icon: 'journal',
        tasks: ['Preserve the dated field note', 'Preserve both versions of the crossing record', 'Keep the missing closure order unresolved']
      });
    }

    if (flags.greyfenFieldNoteFound && !flags.greyfenFieldNoteReported) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'mara',
        title: 'Report the Reedwatch Field Note',
        text: 'The note is dated two days after Greyfen logged the flood’s retreat, and its sketch already shows the newer cut. Bring the original to Mara in the Boundary Archive.',
        cta: 'Speak to Mara',
        icon: 'journal',
        tasks: ['Preserve the date and sketch', 'Record that the signature is unreadable', 'Ask Mara to compare the note with the boundary mark']
      });
    }

    if (flags.greyfenFieldNoteReported && !flags.greyfenLedgerCompared) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'brenn',
        title: 'Compare the Crossing Ledger',
        text: 'Mara has preserved the dated Reedwatch note. Ask Old Brenn whether the crossing ledger records a route change in the same window.',
        cta: 'Speak to Old Brenn',
        icon: 'journal',
        tasks: ['Compare the note’s date with the crossing entries', 'Record the overwritten destinations', 'Look for the earlier weekly return']
      });
    }

    if (flags.greyfenLedgerCompared && !flags.greyfenWeeklyReturnFound) {
      return regionalStoryGoal(player, 'Old Road', {
        view: 'road',
        title: 'Find the Earlier Weekly Return',
        text: 'Brenn found crossing entries rewritten within days of the flood’s retreat, but neither entry includes a closure order. Search Wayfarer’s Camp for the earlier weekly return.',
        cta: 'Search the Old Road',
        icon: 'road',
        tasks: ['Return to Wayfarer’s Camp', 'Inspect the records beside the old firepit', 'Bring the original weekly return to Brenn']
      });
    }

    if (flags.greyfenArchiveRead && !flags.greyfenFieldNoteFound) {
      return regionalStoryGoal(player, 'Old Road', {
        view: 'road',
        title: 'Find the Dated Reedwatch Field Note',
        text: 'Mara compared the Blackroot seal with Greyfen’s boundary stone. The next useful evidence is a dated record or physical sign; search Reedwatch Shelter for the field note.',
        cta: 'Search the Old Road',
        icon: 'road',
        tasks: ['Search Reedwatch Shelter', 'Preserve the note’s date and sketch', 'Return the note to Mara in Greyfen']
      });
    }

    if (flags.greyfenBoundaryCompared && !flags.greyfenArchiveRead) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'mara',
        title: 'Preserve the Boundary Mark',
        text: 'The Greyfen boundary stone carries the older bell-mark beneath a newer cut angled toward the reed bed. Ask Mara to preserve both layers in the Boundary Archive.',
        cta: 'Speak to Mara',
        icon: 'journal',
        tasks: ['Preserve the older mark', 'Record the direction of the newer cut', 'Keep the maker’s identity unresolved']
      });
    }

    if (flags.bellRoadSearched && !flags.greyfenBoundaryCompared) {
      return regionalStoryGoal(player, 'Old Road', {
        view: 'road',
        title: 'Find the Matching Boundary Mark',
        text: 'The Blackroot seal repeats a bell-mark seen near Ashmere. Continue along the Old Road to the Greyfen boundary stone and compare the two marks before drawing conclusions.',
        cta: 'Search the Old Road',
        icon: 'road',
        tasks: ['Find the Greyfen boundary stone', 'Compare the old mark with Blackroot Bend', 'Preserve the stone without altering it']
      });
    }

    if (flags.greyfenWaterlineGaugeRead && !flags.greyfenWaterlineGaugeReported) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'mara',
        title: 'Report the Waterline Gauge',
        text: 'The gauge records the latest water height and a clean hand-cut notch. Bring the reading to the Boundary Archive; it does not identify who made the mark.',
        cta: 'Report the Waterline Gauge',
        icon: 'journal',
        tasks: ['Preserve the recorded height', 'Compare it with the dated field note and crossing ledger', 'Keep the maker’s identity unresolved until evidence supports it']
      });
    }

    if (flags.greyfenWaterlineGaugeReported && !flags.greyfenEvidenceFiled) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'people',
        title: 'Continue the Crossing Investigation',
        text: 'Mara has filed the Waterline Gauge reading. It records a height and a hand-cut notch, but does not identify its maker. Continue comparing the record with the Boundary Archive and the crossing ledger.',
        cta: 'Visit the Town’s Keepers',
        icon: 'people',
        tasks: ['Review the preserved gauge reading', 'Compare it with the Boundary Archive', 'Do not assign blame without corroborating evidence']
      });
    }

    if (flags.greyfenEvidenceFiled && flags.greyfenStorehouseDispatchFound && !flags.greyfenStorehouseDispatchReported) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'mara',
        title: 'Report the Silted Storehouse Dispatch',
        text: 'The storehouse dispatch records a temporary supply exception through the lower crossing after the flood’s retreat. Its authorization leaf is missing, so it adds context but does not name who approved the route. Bring it to Mara for preservation alongside the filed evidence.',
        cta: 'Speak to Mara',
        icon: 'journal',
        tasks: ['Preserve the dispatch date and route note', 'Ask Mara to append it to the Boundary Archive', 'Keep the missing authorization leaf unresolved']
      });
    }

    if (flags.greyfenEvidenceFiled && !flags.greyfenCrossingResponseV261) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'archive',
        title: 'Choose a Crossing Response',
        text: 'The field note, crossing ledger, and weekly return document an unsigned change, but they do not identify who made it. Decide whether to spend one Wood Scrap on a provisional public-safety notice or keep the report sealed until the missing closure order is found.',
        cta: 'Review the Boundary Archive',
        icon: 'journal',
        tasks: ['Keep every dated record intact', 'Post a notice only if you can spare one Wood Scrap', 'Do not name a person without corroborating evidence']
      });
    }

    if (flags.greyfenCrossingResponseV261 === 'provisional-notice' && flags.greyfenNoticePressureCreditV261) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'marsh',
        title: 'Test the Provisional Safety Notice',
        text: 'The raised approach now carries a provisional warning. On the next Marsh Path trip, the first route choice gains up to 5 less Road Pressure. The notice warns travelers without naming an author.',
        cta: 'Begin the Marsh Path',
        icon: 'road',
        tasks: ['Spend the prepared notice on one Marsh Path route choice', 'Confirm the route cost before committing', 'Keep the missing closure order unresolved']
      });
    }

    if (flags.greyfenCrossingResponseV261 === 'sealed-pending-order') {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'archive',
        title: 'Keep the Crossing Report Sealed',
        text: 'Mara has kept the evidence private while the closure order remains missing. The report still documents the unsigned route change, but it does not settle who made it or why.',
        cta: 'Review the Boundary Archive',
        icon: 'journal',
        tasks: ['Keep the source records together', 'Continue seeking the missing closure order', 'Do not confuse an incomplete record with proof of guilt']
      });
    }

    if (flags.greyfenEvidenceFiled) {
      return regionalStoryGoal(player, 'Greyfen', {
        view: 'archive',
        title: 'Review the Preserved Evidence',
        text: 'The records establish that the lower crossing was marked closed, then marked open without initials. They do not identify who authorized the change. The missing closure order remains the next lead.',
        cta: 'Review the Boundary Archive',
        icon: 'journal',
        tasks: ['Review the filed field note and crossing records', 'Keep the conclusion limited to what the evidence proves', 'Continue from the missing closure-order lead']
      });
    }

    return null;
  }

  function goal(pl) {
    const t = Number(pl?.inventory?.roadToken || 0);
    const greyfen = String(pl?.currentRegion || 'Ashmere') === 'Greyfen';

    // The authored evidence chain takes priority over a generic town contract.
    // This keeps story handoffs discoverable without inventing new canon.
    const storyGoal = currentGreyfenStoryGoal(pl);
    if (storyGoal) return storyGoal;

    if (greyfen) {
      if (!pl?.flags?.greyfenDryCrossingComplete) return { view: 'crossing', title: 'Recover the Washed Marker', text: 'The Landing Warden needs the route marker before travelers can trust the raised causeway again. Choose the safer posts or risk the reed-bed shortcut.', cta: 'Take A Dry Crossing', icon: 'route', tasks: ['Choose a route with disclosed risks', 'Recover the marker', 'Record the crossing in the Boundary Archive'] };
      return { view: 'people', title: 'Learn Greyfen’s Old Marks', text: 'The lowland town sits on drowned foundations. Ask the road-worn keepers what they know, trade what the marsh has yielded, and prepare before following the next marker.', cta: 'Meet the Town’s Keepers', icon: 'people', tasks: ['Ask about the boundary stones', 'Trade or prepare supplies', 'Return to Ashmere when ready'] };
    }

    if (!pl?.flags?.talkedToMara) return { view: 'people', title: 'Report to the Square', text: 'Ashmere does not trust strangers from the road. Speak with Mara, Brenn, and Oric before crossing the lantern line.', cta: 'Enter Town Square', icon: 'people', tasks: ['Meet Mara Vell', 'Speak with Old Brenn', 'Hear Oric’s warning'] };
    if (!pl.flags.firstRoadEvent) return { view: 'inn', title: 'Prepare Before the Gate', text: 'Rest, gather supplies, check gear, or take a small town job before your first Old Road expedition.', cta: 'Prepare in Town', icon: 'inn', tasks: ['Visit the Work Board', 'Check gear at the Blacksmith', 'Rest at the Inn'] };
    if (t < 5) return { view: 'road', title: 'Open the First Region', text: `You have ${t}/5 Road Tokens. Explore the Old Road, bring back proof, and use the tokens to open Greyfen.`, cta: 'Leave Through the Gate', icon: 'road', tasks: [`${t}/5 Road Tokens collected`, 'Return alive', 'Open Greyfen on the world map'] };
    return { view: 'regions', title: 'Open the Regional Ledger', text: 'You have enough Road Tokens to begin opening the world beyond Ashmere. Spend them on a region, then pay gold to travel between places you know.', cta: 'View the Road Network', icon: 'regions', tasks: ['Spend Road Tokens to unlock a region', 'Pay gold to travel', 'Return to Ashmere whenever you need'] };
  }

  window.LegendAshmereGuidanceV099 = Object.freeze({ getGoal: goal });
})();
