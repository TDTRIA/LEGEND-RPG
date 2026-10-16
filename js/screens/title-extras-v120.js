/* LEGEND v0.20.36 - auxiliary title screens/dialogs.
 * Owns the optional gate transition and the accessible Credits dialog.
 * The active title menu, navigation, and audio ownership remain in their services.
 */
(() => {
  const TITLE_GATE_KEY = 'legend-roads-of-ashmere-title-gate-v09x';

  function create(config = {}) {
    const { renderTitle, getTitleAudio } = config;
    if (typeof renderTitle !== 'function') return null;
    const audio = () => typeof getTitleAudio === 'function'
      ? (getTitleAudio() || {})
      : (window.LegendTitleAudioV120 || {});

    function renderGate(config){
        const root = () => config?.root || document.getElementById('root');
        const applySettings = config?.applySettings || (() => {});
        const title = () => renderTitle(config);
        applySettings();
        root().innerHTML = `
          <div class="title-wrap title-gate-wrap title-gate-cinematic">
            <div class="title-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
            <div class="title-fog" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="title-gate-border" aria-hidden="true"></div>
            <main class="title-gate-card">
              <h1 class="game-title">LEGEND</h1>
              <p class="title-gate-subtitle">The Awakening</p>
              <p class="title-gate-kicker">✧ Ashmere Gate ✧</p>
              <button class="title-gate-prompt" id="enterRealm" type="button">Press Any Key to Enter Ashmere</button>
              <p class="title-gate-quote">The lantern gate opens for travelers, not heroes.</p>
            </main>
          </div>`;
        const enter = document.getElementById('enterRealm');
        const activate = () => {
          document.removeEventListener('keydown', onKey);
          try { sessionStorage.setItem(TITLE_GATE_KEY, 'opened'); } catch {}
          audio().startAmbience?.();
          audio().playUi?.('confirm');
          title();
        };
        const onKey = e => { if(e.key !== 'Tab') activate(); };
        document.addEventListener('keydown', onKey);
        if(enter) enter.onclick = e => { e.stopPropagation(); activate(); };
      }

    function openCredits(){
        const overlay=document.createElement('div');
        overlay.className='legend-credits-overlay';
        overlay.innerHTML='<section class="legend-credits-panel" role="dialog" aria-modal="true" aria-labelledby="legendCreditsTitle"><div class="legend-credits-kicker">A WORLD IN THE MAKING</div><h2 id="legendCreditsTitle">LEGEND</h2><h3>THE AWAKENING</h3><div class="legend-credits-rule"></div><p>A dark-fantasy role-playing game about the roads we travel, the magic we awaken, and the places we choose to protect.</p><p><strong>World &amp; game:</strong> LEGEND RPG project</p><p><strong>Visual development:</strong> Original game art and AI-assisted asset production</p><p><strong>First light:</strong> Ashmere<br><strong>Beyond the lanterns:</strong> Greyfen and the wider realm</p><div class="legend-credits-rule"></div><p>Thank you for walking the road.</p><button class="legend-credits-close" type="button" data-credits-close>Return to the Title</button></section>';
        const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey);document.getElementById('credits')?.focus();};
        const onKey=e=>{if(e.key==='Escape'){e.preventDefault();close();}};
        overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
        overlay.querySelector('[data-credits-close]').addEventListener('click',close);
        document.addEventListener('keydown',onKey);
        document.body.appendChild(overlay);
        overlay.querySelector('button').focus();
      }

    return Object.freeze({ renderGate, openCredits });
  }

  window.LegendTitleExtrasV120 = Object.freeze({ create });
})();
