/* Read-only bridge to production content. This file does not load runtime/save code. */
(() => {
  'use strict';
  const D = () => window.LEGEND_DATA || {};
  const R = () => window.LegendRoadsV087?.oldRoad || {};
  const A = () => window.LegendAssetsV090 || {};
  const classNames = Object.keys(D().classes || {});
  const enemies = (R().enemies || []).map(enemy => ({
    id: enemy.id, name: enemy.name, hp: enemy.hp, damage: enemy.damage,
    reward: enemy.reward, text: enemy.text
  }));
  window.LegendRebootData = {
    version: D().VERSION || 'unknown',
    classes: D().classes || {},
    classNames,
    origins: D().origins || {},
    keepsakes: D().keepsakes || {},
    weapons: D().weapons || [],
    armors: D().armors || [],
    itemNames: D().itemNames || {},
    regions: D().regions || {},
    enemies,
    assets: A(),
    classStats(name) {
      const cls = D().classes?.[name] || D().classes?.Adventurer || { hp: 100, gold: 100, mod: {} };
      return { name, maxHp: Number(cls.hp || 100), hp: Number(cls.hp || 100), gold: Number(cls.gold || 0), mods: { ...(cls.mod || {}) }, move: cls.move || 'Strike' };
    },
    itemLabel(key) { return D().itemNames?.[key] || key; }
  };
})();
