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
    if (!isRecord(player)) {
      reportStorageFailure(
        'save the traveler because the record is invalid',
        new TypeError('Expected a traveler record object.'),
        'Your traveler could not be saved because its record is invalid.'
      );
      return false;
    }

    try {
      const serialized = JSON.stringify(player);
      if (typeof serialized !== 'string') {
        throw new TypeError('Traveler serialization did not produce JSON text.');
      }
      window.localStorage.setItem(D.SAVE_KEY, serialized);
      return true;
    } catch (error) {
      reportStorageFailure(
        'save the traveler',
        error,
        'Your traveler could not be saved. Browser storage may be disabled or full.'
      );
      return false;
    }
  }

  function loadPlayer() {
    let raw;
    try {
      raw = window.localStorage.getItem(D.SAVE_KEY);
    } catch (error) {
      reportStorageFailure(
        'read the traveler save',
        error,
        'Your saved traveler could not be read. Browser storage may be blocked.'
      );
      return null;
    }
    if (raw == null) return null;

    try {
      const parsed = JSON.parse(raw);
      if (!isCompatiblePlayerShape(parsed)) {
        throw new TypeError('Saved traveler data has an unsupported shape.');
      }
      if (parsed.version != null && parsed.version !== '' && !parseVersion(parsed.version)) {
        throw new TypeError('Saved traveler version is not recognized.');
      }
      if (isFutureSaveVersion(parsed.version)) {
        throw new TypeError(
          'Saved traveler version ' + parsed.version + ' is newer than this game (' + D.VERSION + ').'
        );
      }
      const player = normalize(parsed);
      if (!isRecord(player)) {
        throw new TypeError('Traveler normalization did not produce a record.');
      }
      return player;
    } catch (error) {
      reportStorageFailure(
        'load the traveler save',
        error,
        'The traveler save is malformed or incompatible. The original data was left untouched.'
      );
      return null;
    }
  }

  function deleteSaves() {
    try {
      window.localStorage.removeItem(D.SAVE_KEY);
      return true;
    } catch (error) {
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
    deleteSaves,
    loadSettings,
    saveSettings,
    applySettings
  };
})();