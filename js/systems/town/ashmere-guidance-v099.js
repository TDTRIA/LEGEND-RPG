/* LEGEND Ashmere/Greyfen next-step guidance.
 * Purely selects the current suggested action from the saved traveler flags,
 * region, and Road Token count. The town hub owns presentation and navigation.
 */
(() => {
  function goal(pl){
    const t = Number(pl?.inventory?.roadToken || 0);
    if(String(pl?.currentRegion||'Ashmere')==='Greyfen'){
      if(!pl?.flags?.greyfenDryCrossingComplete) return { view:'crossing', title:'Recover the Washed Marker', text:'The Landing Warden needs the route marker before travelers can trust the raised causeway again. Choose the safer posts or risk the reed-bed shortcut.', cta:'Take A Dry Crossing', icon:'route', tasks:['Choose a route with disclosed risks','Recover the marker','Record the crossing in the Boundary Archive'] };
      if(pl?.flags?.greyfenWaterlineGaugeRead && !pl?.flags?.greyfenWaterlineGaugeReported) return { view:'mara', title:'Report the Waterline Gauge', text:'The gauge records the latest water height and a clean hand-cut notch. Bring the reading to the Boundary Archive; it does not identify who made the mark.', cta:'Report the Waterline Gauge', icon:'journal', tasks:['Preserve the recorded height','Compare it with the dated field note and crossing ledger','Keep the maker’s identity unresolved until evidence supports it'] };
      return { view:'people', title:'Learn Greyfen’s Old Marks', text:'The lowland town sits on drowned foundations. Ask the road-worn keepers what they know, trade what the marsh has yielded, and prepare before following the next marker.', cta:'Meet the Town’s Keepers', icon:'people', tasks:['Ask about the boundary stones','Trade or prepare supplies','Return to Ashmere when ready'] };
    }
    if(!pl?.flags?.talkedToMara) return { view:'people', title:'Report to the Square', text:'Ashmere does not trust strangers from the road. Speak with Mara, Brenn, and Oric before crossing the lantern line.', cta:'Enter Town Square', icon:'people', tasks:['Meet Mara Vell','Speak with Old Brenn','Hear Oric\'s warning'] };
    if(!pl.flags.firstRoadEvent) return { view:'inn', title:'Prepare Before the Gate', text:'Rest, gather supplies, check gear, or take a small town job before your first Old Road expedition.', cta:'Prepare in Town', icon:'inn', tasks:['Visit the Work Board','Check gear at the Blacksmith','Rest at the Inn'] };
    if(t < 5) return { view:'road', title:'Open the First Region', text:`You have ${t}/5 Road Tokens. Explore the Old Road, bring back proof, and use the tokens to open Greyfen.`, cta:'Leave Through the Gate', icon:'road', tasks:[`${t}/5 Road Tokens collected`,'Return alive','Open Greyfen on the world map'] };
    return { view:'regions', title:'Open the Regional Ledger', text:'You have enough Road Tokens to begin opening the world beyond Ashmere. Spend them on a region, then pay gold to travel between places you know.', cta:'View the Road Network', icon:'regions', tasks:['Spend Road Tokens to unlock a region','Pay gold to travel','Return to Ashmere whenever you need'] };
  }

  window.LegendAshmereGuidanceV099 = Object.freeze({ getGoal: goal });
})();
