// LEGEND v0.10.1 - Regional Travel Controller
// Owns the world-map layer: Road Tokens unlock regions; gold pays for travel between them.
(() => {
  const RT=()=>window.LegendRuntimeV120||{}, D=()=>window.LEGEND_DATA||{}, A=()=>window.LegendAssetsV090||{}, root=()=>document.getElementById('root');
  const p=()=>RT().loadPlayer?.()||null, save=pl=>RT().savePlayer?.(pl);
  const esc=window.LegendHtmlV120.escapeHtml;
  const gold=n=>Number(n||0).toLocaleString()+'g';
  const regions=()=>D().regions||{};
  function backToTown(){
    const player=p();
    if(player&&!['Ashmere','Greyfen'].includes(String(player.currentRegion||'Ashmere'))){
      player.currentRegion='Ashmere';
      save(player);
    }
    window.LegendAshmereV099?.renderAshmere?.();
  }

  const regionView=window.LegendRegionViewV100?.create({
    root,
    getPlayer:p,
    getRegions:regions,
    getAssets:A,
    escapeHtml:esc,
    formatGold:gold,
    onBack:backToTown,
    onUnlock:unlock,
    onTravel:travel
  });

  function render(note=''){
    if(regionView?.render)return regionView.render(note);
    const host=root();
    if(host)host.innerHTML='<main class="reg100"><div class="reg100-wrap"><section class="reg100-screen"><h1>Roads & Regions unavailable</h1><p>The region view did not load. Refresh before continuing.</p></section></div></main>';
  }
  const regionService = window.LegendRegionServiceV100?.create({
    getPlayer: p,
    savePlayer: save,
    getRegions: regions,
    renderMessage: render,
    formatGold: gold
  });

  function unlock(id){
    if (regionService?.unlock) return regionService.unlock(id);
    return render('Region services are unavailable. Refresh before continuing.');
  }
  function travel(id){
    if (regionService?.travel) return regionService.travel(id);
    return render('Region services are unavailable. Refresh before continuing.');
  }
  window.LegendRegionsV100={render,unlock,travel};
})();
