/* LEGEND v0.20.36 - Old Road discovery facade.
 * Owns discovery visibility/reveal lifecycle and preserves the public API.
 * POI content, panel markup, branch decisions and inspection effects are injected services.
 */
(() => {
  function create(context = {}) {
    const {
      getPlayer,
      savePlayer,
      ensureState,
      getRoadData,
      addInventory,
      escapeHtml,
      clamp: clampValue,
      bellRoadEvidence,
      getPointOfInterest,
      roadDecisions,
      renderExpedition,
      tone,
      createPoiOutcomes,
      createDiscoveryView
    } = context;

    if (typeof getPlayer !== 'function' || typeof savePlayer !== 'function' ||
        typeof ensureState !== 'function' || typeof getRoadData !== 'function' ||
        typeof addInventory !== 'function' || typeof escapeHtml !== 'function' ||
        typeof renderExpedition !== 'function' ||
        typeof bellRoadEvidence?.recordPointEvidence !== 'function') return null;

    const p = getPlayer;
    const save = savePlayer;
    const ensure = ensureState;
    const road = getRoadData;
    const inv = addInventory;
    const esc = escapeHtml;
    const clamp = typeof clampValue === 'function' ? clampValue : (n, lo, hi) => Math.max(lo, Math.min(hi, n));
    let visibleDiscoveryStage = null;
    const poiOutcomes = typeof createPoiOutcomes === 'function' ? createPoiOutcomes({
      getPlayer: p,
      savePlayer: save,
      ensureState: ensure,
      addInventory: inv,
      clamp,
      bellRoadEvidence,
      getPointOfInterest: pointOfInterest,
      clearVisibleDiscovery: () => { visibleDiscoveryStage = null; },
      renderExpedition,
      tone
    }) : null;
    const discoveryView = typeof createDiscoveryView === 'function' ? createDiscoveryView({ escapeHtml: esc, getPointOfInterest: pointOfInterest }) : null;

function pointOfInterest(stage){
 const contextual=typeof getPointOfInterest==='function'?getPointOfInterest(stage):null;
 if(contextual)return contextual;
 const points=road().pointsOfInterest||[],index=clamp(Number(stage||0),0,5);
 return {...(points[index]||{key:'road-marker',name:'Roadside Marker',kind:'Trail Clue',text:'The road holds a faint sign of passage.',action:'Inspect the marker',icon:'⌖',short:'Marker',x:50,y:50})};
}
function pointOfInterestPanel(pl,s,stage){
 return discoveryView?.pointOfInterestPanel(pl,s,stage,visibleDiscoveryStage)||'';
}
function routeChoicePanel(s,stage){
 return discoveryView?.routeChoicePanel(s,stage)||'';
}
function movedCairnDecisionPanel(pl,s,stage){
 return discoveryView?.movedCairnDecisionPanel(pl,s,stage)||'';
}
function chooseMovedCairnDecision(decision){
 if(typeof roadDecisions?.chooseMovedCairnDecision==='function')return roadDecisions.chooseMovedCairnDecision(decision);
 return renderExpedition('This road decision is unavailable. Return to Ashmere and refresh before continuing.');
}
function chooseRoadRoute(route){
 if(typeof roadDecisions?.chooseRoadRoute==='function')return roadDecisions.chooseRoadRoute(route);
 return renderExpedition('The route-choice service is unavailable. Return to Ashmere and refresh before continuing.');
}
function inspectPointOfInterest(){
 if(typeof poiOutcomes?.inspect==='function')return poiOutcomes.inspect();
 return renderExpedition('The road discovery outcome service is unavailable. Return to Ashmere and refresh before continuing.');
}

    function reveal(stage) {
      visibleDiscoveryStage = Number(stage);
    }

    function hide() {
      visibleDiscoveryStage = null;
    }

    return Object.freeze({
      pointOfInterest,
      pointOfInterestPanel,
      routeChoicePanel,
      movedCairnDecisionPanel,
      chooseMovedCairnDecision,
      chooseRoadRoute,
      inspectPointOfInterest,
      reveal,
      hide
    });
  }

  window.LegendRoadDiscoveryV100 = Object.freeze({ create });
})();
