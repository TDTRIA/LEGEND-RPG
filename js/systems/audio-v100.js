// LEGEND v0.20.x - Old Road audio service
// Owns expedition sound preference, battle effects, and battle-music lifecycle.
(() => {
  const soundOn = () => {
    try { return localStorage.getItem('legend-road-sound') !== 'off'; }
    catch { return true; }
  };

  function tone(kind = 'tap') {
    if (!soundOn()) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const impact = kind === 'impact';
      oscillator.type = impact ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(impact ? 145 : 520, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        impact ? 68 : kind === 'success' ? 780 : 390,
        now + (impact ? 0.13 : 0.07)
      );
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(impact ? 0.075 : 0.025, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (impact ? 0.15 : 0.085));
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + (impact ? 0.16 : 0.09));
      oscillator.onended = () => context.close();
    } catch {}
  }

  const BATTLE_AUDIO = {
    theme: 'assets/audio/battle/old-road-battle_loop.wav',
    swing: 'assets/audio/battle/battle_swing.wav',
    heavy: 'assets/audio/battle/battle_heavy.wav',
    hit: 'assets/audio/battle/battle_hit.wav',
    guard: 'assets/audio/battle/battle_guard.wav',
    heal: 'assets/audio/battle/battle_heal.wav',
    magic: 'assets/audio/battle/battle_magic.wav',
    victory: 'assets/audio/battle/battle_victory.wav'
  };
  let battleMusic = null;

  function playBattleFx(kind) {
    if (!soundOn()) return;
    try {
      const audio = new Audio(BATTLE_AUDIO[kind] || BATTLE_AUDIO.swing);
      audio.volume = kind === 'hit' ? 0.34 : kind === 'victory' ? 0.3 : 0.2;
      audio.play().catch(() => {});
    } catch {}
  }

  function startBattleMusic() {
    if (!soundOn()) return;
    try {
      if (!battleMusic) {
        battleMusic = new Audio(BATTLE_AUDIO.theme);
        battleMusic.loop = true;
        battleMusic.volume = 0.17;
      }
      if (battleMusic.paused) battleMusic.play().catch(() => {});
    } catch {}
  }

  function stopBattleMusic() {
    if (!battleMusic) return;
    try {
      battleMusic.pause();
      battleMusic.currentTime = 0;
    } catch {}
    battleMusic = null;
  }

  window.LegendAudioV100 = {
    soundOn,
    tone,
    playBattleFx,
    startBattleMusic,
    stopBattleMusic
  };
})();
