/* LEGEND device-local accessibility settings.
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

  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function reportStorageFailure(operation, error) {
    const message = operation === 'read'
      ? 'Accessibility settings could not be read. Default settings are active for this session.'
      : 'Accessibility settings could not be saved. Your current session settings remain active.';
    console.warn('[LEGEND] Browser storage could not ' + operation + ' accessibility settings.', error);

    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      window.clearTimeout(toast.__legendSettingsStorageTimer);
      toast.__legendSettingsStorageTimer = window.setTimeout(
        () => toast.classList.remove('show'),
        4500
      );
    }
    window.dispatchEvent(new CustomEvent('legend:storage-error', {
      detail: { operation: operation + ' accessibility settings', message }
    }));
  }

  function create() {
    // Keep a failed write available to this tab until a later write succeeds.
    let sessionSettings = null;

    function loadSettings() {
      if (sessionSettings) return { ...DEFAULT_SETTINGS, ...sessionSettings };
      try {
        const raw = window.localStorage.getItem(SETTINGS_KEY);
        if (raw == null) return { ...DEFAULT_SETTINGS };
        const stored = JSON.parse(raw);
        if (!isRecord(stored)) {
          throw new TypeError('Stored accessibility settings must be an object.');
        }
        return { ...DEFAULT_SETTINGS, ...stored };
      } catch (error) {
        reportStorageFailure('read', error);
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
      if (!isRecord(settings)) {
        reportStorageFailure(
          'write',
          new TypeError('Accessibility settings must be an object.')
        );
        return false;
      }

      const next = { ...DEFAULT_SETTINGS, ...settings };
      // Apply preferences immediately even when persistence is unavailable.
      applySettings(next);
      try {
        const serialized = JSON.stringify(next);
        if (typeof serialized !== 'string') {
          throw new TypeError('Settings serialization did not produce JSON text.');
        }
        window.localStorage.setItem(SETTINGS_KEY, serialized);
        sessionSettings = null;
        return true;
      } catch (error) {
        sessionSettings = next;
        reportStorageFailure('write', error);
        return false;
      }
    }

    return Object.freeze({ loadSettings, saveSettings, applySettings });
  }

  window.LegendSettingsStorageV120 = Object.freeze({ create });
})();