/* LEGEND v0.20.36 - shared quest-log mutation helpers.
 * Centralizes objective replacement for features that need to advance an existing
 * quest without changing the player's save shape or losing unrelated log entries.
 */
(() => {
  function setObjective(player, prefix, objective) {
    if (!player) return false;
    const normalizedPrefix = String(prefix || '').trim();
    if (!normalizedPrefix) return false;

    player.questLog = Array.isArray(player.questLog) ? player.questLog : [];
    const entry = normalizedPrefix + ' ' + String(objective ?? '');
    const index = player.questLog.findIndex(item => String(item).startsWith(normalizedPrefix));
    if (index >= 0) player.questLog[index] = entry;
    else player.questLog.unshift(entry);
    return true;
  }

  function setBellQuestObjective(player, objective) {
    return setObjective(player, 'The Bell That Rang Once:', objective);
  }

  window.LegendQuestLogV120 = Object.freeze({ setObjective, setBellQuestObjective });
})();
