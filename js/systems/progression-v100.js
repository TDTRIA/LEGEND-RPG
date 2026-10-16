// LEGEND v0.16.0 - compact save-compatible character progression
(() => {
  function status(player) {
    if (!player) return {level:1,xp:0,next:100,progressPercent:0};
    const level = Math.max(1, Math.floor(Number(player.level || 1)));
    const xp = Math.max(0, Number(player.xp || 0));
    const next = level * 100;
    return {
      level,
      xp,
      next,
      progressPercent:Math.max(0, Math.min(100, Math.round(xp / Math.max(1, next) * 100)))
    };
  }

  function award(player, amount) {
    if (!player) return {gained:0,levels:0,level:1,xp:0,next:100};
    player.level = Math.max(1, Math.floor(Number(player.level || 1)));
    player.xp = Math.max(0, Number(player.xp || 0));
    const gained = Math.max(0, Math.floor(Number(amount || 0)));
    player.xp += gained;
    let levels = 0;
    while (player.xp >= player.level * 100) {
      player.xp -= player.level * 100;
      player.level += 1;
      player.maxHp = Math.max(1, Number(player.maxHp || player.hp || 1)) + 8;
      player.hp = Math.min(player.maxHp, Math.max(0, Number(player.hp || 0)) + 8);
      levels += 1;
    }
    return {gained, levels, level:player.level, xp:player.xp, next:player.level * 100};
  }
  window.LegendProgressionV100 = Object.freeze({award, status});
})();
