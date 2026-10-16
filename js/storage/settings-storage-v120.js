/* LEGEND device-local accessibility settings storage.
 * Owns only legend-settings-v1 and its document-level presentation classes.
 * LegendStorage continues to expose the settings facade API used by screens.
 */
(() => {
  const SETTINGS_KEY = 'legend-settings-v1';
  const DEFAULT_SETTINGS = Object.freeze({
    largeText: false,
    boldText: false,
    highContrast: false,
    reducedMotion: false,
    simpleAscii: false,
    spacious: false,
    readableFont: false
  });

  function create() {
    function loadSettings() {
      try {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
        return { ...DEFAULT_SETTINGS, ...stored };
      } catch {
        return { ...DEFAULT_SETTINGS };
      }
    }

    function applySettings(settings = loadSettings()) {
      const classes = {
        largeText: 'a11y-large-text',
        boldText: 'a11y-bold-text',
        highContrast: 'a11y-high-contrast',
        reducedMotion: 'a11y-reduced-motion',
        simpleAscii: 'a11y-simple-ascii',
        spacious: 'a11y-spacious',
        readableFont: 'a11y-readable-font'
      };
      if (!document.body) return;
      Object.values(classes).forEach(className => document.body.classList.remove(className));
      Object.entries(classes).forEach(([key, className]) => {
        if (settings?.[key]) document.body.classList.add(className);
      });
    }

    function saveSettings(settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      applySettings(settings);
    }

    return Object.freeze({ loadSettings, saveSettings, applySettings });
  }

  window.LegendSettingsStorageV120 = Object.freeze({ create });
})();
