/* LEGEND v0.20.36 - device-local account profile metadata.
 * This is not the player save store: it owns the existing profile metadata key only.
 * Player records remain under LegendStorage and are never written by this module.
 */
(() => {
  const PROFILE_KEY = 'legend-roads-of-ashmere-profile-v09x';

  function create(config = {}) {
    const { loadLocalPlayer } = config;
    function getProfile() {
      try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
      catch { return null; }
    }

    function saveProfile(profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        ...profile,
        version: 'v0.9.x',
        updatedAt: new Date().toISOString()
      }));
    }

    function deleteProfile() {
      localStorage.removeItem(PROFILE_KEY);
    }

    function snapshotTraveler(player) {
      if (!player) return null;
      return {
        username: player.username || 'Unnamed Traveler',
        className: player.className || player.class || 'Traveler',
        town: player.town || 'Ashmere',
        day: player.day || 1,
        roadTokens: Number(player.inventory?.roadToken || 0),
        oldRoadClears: Number(player.stats?.oldRoadClears || 0),
        monstersDefeated: Number(player.stats?.monstersDefeated || 0),
        updatedAt: new Date().toISOString()
      };
    }

    return Object.freeze({
      getProfile,
      saveProfile,
      deleteProfile,
      snapshotTraveler,
      loadLocalPlayer: typeof loadLocalPlayer === 'function' ? loadLocalPlayer : () => null
    });
  }

  window.LegendAccountProfileStoreV09x = Object.freeze({ create });
})();
