window.LegendStorage = (() => {
  const D = window.LEGEND_DATA;
  const settingsStorage = window.LegendSettingsStorageV120?.create();
  const defaultSettings = Object.freeze({ largeText:false, boldText:false, highContrast:false, reducedMotion:false, simpleAscii:false, spacious:false, readableFont:false });
  const playerNormalizer = window.LegendPlayerNormalizerV120?.create({
    getData: () => window.LEGEND_DATA
  });
  if (!playerNormalizer) {
    throw new Error('LegendPlayerNormalizerV120 must load before LegendStorage.');
  }
  const { baseSkills, normalize } = playerNormalizer;

  function savePlayer(player){ if(player) localStorage.setItem(D.SAVE_KEY, JSON.stringify(player)); }
  function loadPlayer(){
    const raw = localStorage.getItem(D.SAVE_KEY);
    if(!raw) return null;
    try { return normalize(JSON.parse(raw)); } catch { return null; }
  }
  function deleteSaves(){ localStorage.removeItem(D.SAVE_KEY); }

  function loadSettings(){
    return settingsStorage?.loadSettings?.() || { ...defaultSettings };
  }
  function saveSettings(settings){
    if (settingsStorage?.saveSettings) return settingsStorage.saveSettings(settings);
    return false;
  }
  function applySettings(settings){
    if (settingsStorage?.applySettings) return settingsStorage.applySettings(settings);
  }

  return { baseSkills, normalize, savePlayer, loadPlayer, deleteSaves, loadSettings, saveSettings, applySettings };
})();