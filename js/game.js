(() => {
  const D = window.LEGEND_DATA;
  const S = window.LegendStorage;
  const UI = window.LegendUI;

  let player = S.loadPlayer();

  function menu(){
    // Existing menu rendering...
    const exploreButton = document.querySelector('[data-menu="0"]');
    if(exploreButton){
      exploreButton.onclick = () => {
        if(window.LegendTravel && typeof window.LegendTravel.exploreOldRoad === 'function'){
          window.LegendTravel.exploreOldRoad();
        }
      };
    }
  }

  // Make menu available globally
  window.LegendMenu = { menu };
})();