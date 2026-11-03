/* LEGEND title audio facade — playback and preference belong to the world audio director. */
(() => {
  const audio=()=>window.LegendRoadAudioV100||{};
  function playUi(kind){return audio().playUi?.(kind)||null;}
  function startAmbience(){audio().setEnvironment?.('title');}
  function bindTitleAudio(root=document){
    root.querySelectorAll('.game-menu-btn,.v136-menu-btn,.portal-enter-btn,.portal-secondary-btn,.portal-gear,.portal100-primary,.portal100-header-actions button').forEach(btn=>{
      if(btn.dataset.legendTitleAudioBound)return;
      btn.dataset.legendTitleAudioBound='1';
      btn.addEventListener('pointerenter',()=>playUi('hover'));
      btn.addEventListener('focus',()=>playUi('hover'));
    });
    const unlock=()=>{
      audio().startWorldAudio?.();
      document.removeEventListener('pointerdown',unlock);
      document.removeEventListener('keydown',unlock);
    };
    document.addEventListener('pointerdown',unlock);
    document.addEventListener('keydown',unlock);
  }
  window.LegendTitleAudioV120=Object.freeze({playUi,startAmbience,bindTitleAudio});
})();
