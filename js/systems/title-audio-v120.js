/* LEGEND v0.20.36 - title-screen ambience and interaction sounds.
 * Audio playback is independent of title markup; the title screen calls this service
 * for its existing hover, confirmation, and first-interaction ambience cues.
 */
(() => {
  const AUDIO = Object.freeze({
    ambience: 'assets/audio/title/ashmere_ambience_loop.wav',
    hover: 'assets/audio/ui/ui_hover_soft.wav',
    confirm: 'assets/audio/ui/ui_confirm_gate.wav'
  });

  let titleAmbience = null;

  function playUi(kind) {
    const src = AUDIO[kind];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = kind === 'hover' ? 0.16 : 0.26;
      audio.play().catch(() => {});
    } catch {}
  }

  function startAmbience() {
    if (titleAmbience || !AUDIO.ambience) return;
    try {
      titleAmbience = new Audio(AUDIO.ambience);
      titleAmbience.loop = true;
      titleAmbience.volume = 0.28;
      titleAmbience.play().catch(() => { titleAmbience = null; });
    } catch {
      titleAmbience = null;
    }
  }

  function bindTitleAudio(root = document) {
    root.querySelectorAll('.game-menu-btn,.v136-menu-btn,.portal-enter-btn,.portal-secondary-btn,.portal-gear,.portal100-primary,.portal100-header-actions button').forEach(btn => {
      if (btn.dataset.legendTitleAudioBound) return;
      btn.dataset.legendTitleAudioBound = '1';
      btn.addEventListener('pointerenter', () => playUi('hover'));
      btn.addEventListener('focus', () => playUi('hover'));
    });

    const unlockAudio = () => {
      startAmbience();
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('pointerdown', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  window.LegendTitleAudioV120 = Object.freeze({ playUi, startAmbience, bindTitleAudio });
})();
