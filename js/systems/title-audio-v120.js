/* LEGEND title audio facade — playback and preference belong to the world audio director. */
(() => {
  const audio=()=>window.LegendRoadAudioV100||{};
  const soundOn=()=>audio().soundOn?.() ?? true;
  const canToggleSound=()=>typeof audio().soundOn==='function'&&typeof audio().toggleSound==='function';
  function playUi(kind){return audio().playUi?.(kind)||null;}
  function startAmbience(){audio().setEnvironment?.('title');}
  function bindTitleAudio(root=document){
    root.querySelectorAll('.game-menu-btn,.v136-menu-btn,.portal-enter-btn,.portal-secondary-btn,.portal-gear,.portal100-primary,.portal100-header-actions button').forEach(btn=>{
      if(btn.dataset.legendTitleAudioBound)return;
      btn.dataset.legendTitleAudioBound='1';
      btn.addEventListener('pointerenter',()=>playUi('hover'));
      btn.addEventListener('focus',()=>playUi('hover'));
    });
    const soundButton=root.querySelector('#titleSound');
    if(soundButton){
      const sync=()=>{
        if(!soundButton.isConnected)return;
        soundButton.disabled=!canToggleSound();
        soundButton.setAttribute('aria-pressed',String(soundOn()));
        const label=soundButton.querySelector('.v136-menu-copy strong');
        if(label)label.textContent=canToggleSound()?'Sound: '+(soundOn()?'On':'Off'):'Sound unavailable';
      };
      sync();
      // The bootstrap can render during deferred-script execution, before
      // the shared audio director appears later in the production entry point.
      if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',sync,{once:true});
      soundButton.onclick=()=>{
        if(canToggleSound())audio().toggleSound();
        if(soundOn()&&canToggleSound())audio().startWorldAudio?.();
        sync();
      };
    }
    const unlock=event=>{
      // A gesture to mute must not start the title loops before its click fires.
      if(event.target?.closest?.('#titleSound')&&soundOn())return;
      audio().startWorldAudio?.();
      document.removeEventListener('pointerdown',unlock);
      document.removeEventListener('keydown',unlock);
    };
    document.addEventListener('pointerdown',unlock);
    document.addEventListener('keydown',unlock);
  }
  window.LegendTitleAudioV120=Object.freeze({playUi,startAmbience,bindTitleAudio,soundOn,canToggleSound});
})();
