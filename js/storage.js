window.LegendStorage = (() => {
  const D = window.LEGEND_DATA;
  if (
    !D ||
    typeof D !== 'object' ||
    typeof D.VERSION !== 'string' ||
    typeof D.SAVE_KEY !== 'string' ||
    !D.SAVE_KEY.trim() ||
    !D.itemNames ||
    typeof D.itemNames !== 'object' ||
    Array.isArray(D.itemNames)
  ) {
    throw new Error(
      'LegendStorage could not initialize: LEGEND_DATA is missing or incomplete. ' +
      'Load js/data.js before js/storage.js and check for a failed script request.'
    );
  }

  const normalizerModule = window.LegendPlayerNormalizerV120;
  if (typeof normalizerModule?.create !== 'function') {
    throw new Error(
      'LegendStorage could not initialize: LegendPlayerNormalizerV120 is missing. ' +
      'Load js/storage/player-normalizer-v120.js before js/storage.js.'
    );
  }

  const settingsModule = window.LegendSettingsStorageV120;
  if (typeof settingsModule?.create !== 'function') {
    throw new Error(
      'LegendStorage could not initialize: LegendSettingsStorageV120 is missing. ' +
      'Load js/storage/settings-storage-v120.js before js/storage.js.'
    );
  }

  const playerNormalizer = normalizerModule.create({
    getData: () => window.LEGEND_DATA
  });
  if (
    !playerNormalizer ||
    typeof playerNormalizer.baseSkills !== 'function' ||
    typeof playerNormalizer.normalize !== 'function'
  ) {
    throw new Error(
      'LegendStorage could not initialize: LegendPlayerNormalizerV120.create() ' +
      'did not provide baseSkills() and normalize().'
    );
  }

  const settingsStorage = settingsModule.create();
  if (
    !settingsStorage ||
    typeof settingsStorage.loadSettings !== 'function' ||
    typeof settingsStorage.saveSettings !== 'function' ||
    typeof settingsStorage.applySettings !== 'function'
  ) {
    throw new Error(
      'LegendStorage could not initialize: LegendSettingsStorageV120.create() ' +
      'did not provide its complete settings API.'
    );
  }

  const defaultSettings = Object.freeze({
    largeText: false,
    boldText: false,
    highContrast: false,
    reducedMotion: false,
    simpleAscii: false,
    spacious: false,
    readableFont: false
  });
  const { baseSkills, normalize } = playerNormalizer;

  const objectFields = [
    'creationV090', 'creationV094', 'attributesV152', 'inventory',
    'ownedWeapons', 'ownedArmor', 'stats', 'flags', 'skills', 'mastery',
    'quests', 'townTrust', 'npcTalk'
  ];
  const arrayFields = [
    'bank', 'traits', 'questLog', 'memories', 'discoveredRoutes',
    'discoveredTowns', 'unlockedRegions', 'discoveredRegions'
  ];
  let lastPlayerLoadStatus = 'not-read';
  let sessionPlayer = null;

  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function isCompatiblePlayerShape(player) {
    if (!isRecord(player)) return false;
    if (player.version != null && typeof player.version !== 'string') return false;
    if (objectFields.some(key => player[key] != null && !isRecord(player[key]))) return false;
    if (arrayFields.some(key => player[key] != null && !Array.isArray(player[key]))) return false;

    return ['creationV090', 'creationV094'].every(key => {
      const creation = player[key];
      return !creation || creation.bonuses == null || isRecord(creation.bonuses);
    });
  }

  function parseVersion(value) {
    const match = String(value || '').trim().match(/^v?(\d+(?:\.\d+){0,2})(?:[-+][0-9a-z.-]+)?$/i);
    return match ? match[1].split('.').map(Number) : null;
  }

  function isFutureSaveVersion(value) {
    if (value == null || value === '') return false;
    const saved = parseVersion(value);
    const current = parseVersion(D.VERSION);
    if (!saved || !current) return false;

    for (let index = 0; index < Math.max(saved.length, current.length); index += 1) {
      const savedPart = saved[index] || 0;
      const currentPart = current[index] || 0;
      if (savedPart !== currentPart) return savedPart > currentPart;
    }
    return false;
  }

  function reportStorageFailure(operation, error, message) {
    console.warn('[LEGEND] Browser storage could not ' + operation + '.', error);
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('show');
      window.clearTimeout(toast.__legendStorageMessageTimer);
      toast.__legendStorageMessageTimer = window.setTimeout(
        () => toast.classList.remove('show'),
        4500
      );
    }
    window.dispatchEvent(new CustomEvent('legend:storage-error', {
      detail: { operation, message }
    }));
  }

  function savePlayer(player) {
    if (!player) return false;
    const versionRejected = player.version != null && player.version !== '' &&
      (!parseVersion(player.version) || isFutureSaveVersion(player.version));
    if (!isCompatiblePlayerShape(player) || versionRejected) {
      reportStorageFailure(
        'save the traveler because its record is incompatible',
        new TypeError('Expected a compatible traveler record for ' + D.VERSION + '.'),
        'Your traveler could not be saved because its record is malformed or from an incompatible game version.'
      );
      return false;
    }

    try {
      const serialized = JSON.stringify(player);
      if (typeof serialized !== 'string') {
        throw new TypeError('Traveler serialization did not produce JSON text.');
      }
      window.localStorage.setItem(D.SAVE_KEY, serialized);
      sessionPlayer = null;
      lastPlayerLoadStatus = 'loaded';
      return true;
    } catch (error) {
      // Preserve the latest in-memory traveler for the current tab. A later
      // successful save replaces this fallback with durable browser storage.
      sessionPlayer = player;
      lastPlayerLoadStatus = 'session-only';
      reportStorageFailure(
        'save the traveler',
        error,
        'Your traveler could not be saved permanently. Your current journey remains available in this tab; check browser storage before leaving.'
      );
      return false;
    }
  }

  function loadPlayer() {
    if (sessionPlayer) {
      lastPlayerLoadStatus = 'session-only';
      return normalize(sessionPlayer);
    }

    let raw;
    try {
      raw = window.localStorage.getItem(D.SAVE_KEY);
    } catch (error) {
      lastPlayerLoadStatus = 'unavailable';
      reportStorageFailure(
        'read the traveler save',
        error,
        'Your saved traveler could not be read. Browser storage may be blocked.'
      );
      return null;
    }
    if (raw == null) {
      lastPlayerLoadStatus = 'empty';
      return null;
    }

    // Reset stale status from a previous read before parsing this stored value.
    // A prior future-version result must not mask a later malformed JSON record.
    lastPlayerLoadStatus = 'malformed';
    try {
      const parsed = JSON.parse(raw);
      if (!isCompatiblePlayerShape(parsed)) {
        lastPlayerLoadStatus = 'malformed';
        throw new TypeError('Saved traveler data has an unsupported shape.');
      }
      if (parsed.version != null && parsed.version !== '' && !parseVersion(parsed.version)) {
        lastPlayerLoadStatus = 'incompatible';
        throw new TypeError('Saved traveler version is not recognized.');
      }
      if (isFutureSaveVersion(parsed.version)) {
        lastPlayerLoadStatus = 'incompatible';
        throw new TypeError(
          'Saved traveler version ' + parsed.version + ' is newer than this game (' + D.VERSION + ').'
        );
      }
      const player = normalize(parsed);
      if (!isRecord(player)) {
        lastPlayerLoadStatus = 'malformed';
        throw new TypeError('Traveler normalization did not produce a record.');
      }
      lastPlayerLoadStatus = 'loaded';
      return player;
    } catch (error) {
      if (lastPlayerLoadStatus !== 'incompatible') lastPlayerLoadStatus = 'malformed';
      reportStorageFailure(
        'load the traveler save',
        error,
        'The traveler save is malformed or incompatible. The original data was left untouched; export a recovery copy before replacing it.'
      );
      return null;
    }
  }

  function getPlayerSaveStatus() {
    return lastPlayerLoadStatus;
  }

  function deleteSaves() {
    try {
      window.localStorage.removeItem(D.SAVE_KEY);
      sessionPlayer = null;
      lastPlayerLoadStatus = 'empty';
      return true;
    } catch (error) {
      lastPlayerLoadStatus = sessionPlayer ? 'session-only' : 'delete-failed';
      reportStorageFailure(
        'delete the traveler save',
        error,
        'The traveler save could not be deleted. Browser storage may be blocked.'
      );
      return false;
    }
  }

  function loadSettings() {
    try {
      return { ...defaultSettings, ...(settingsStorage.loadSettings() || {}) };
    } catch (error) {
      reportStorageFailure(
        'read accessibility settings',
        error,
        'Accessibility settings could not be loaded. Default settings are active for this session.'
      );
      return { ...defaultSettings };
    }
  }

  function saveSettings(settings) {
    try {
      return settingsStorage.saveSettings(settings) !== false;
    } catch (error) {
      reportStorageFailure(
        'save accessibility settings',
        error,
        'Accessibility settings could not be saved. Your current session settings remain active.'
      );
      return false;
    }
  }

  function applySettings(settings) {
    try {
      return settingsStorage.applySettings(settings);
    } catch (error) {
      reportStorageFailure(
        'apply accessibility settings',
        error,
        'Accessibility settings could not be applied. Reload the game and try again.'
      );
      return false;
    }
  }

  return {
    baseSkills,
    normalize,
    savePlayer,
    loadPlayer,
    getPlayerSaveStatus,
    deleteSaves,
    loadSettings,
    saveSettings,
    applySettings
  };
})();