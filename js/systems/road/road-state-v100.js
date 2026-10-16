/* LEGEND v0.20.36 - Shared v100 road state and rules.
 * Central owner for expedition flags, stat modifiers, equipment lookups, inventory
 * increments, display labels, and the canonical Bell quest objective updater.
 */
(() => {
 function create(context = {}) {
  const {getData,clamp}=context;
  if(typeof getData!=='function'||typeof clamp!=='function')return null;
  const D=getData;
  function addInventory(player,itemId,amount){
    player.inventory=player.inventory||{};
    player.inventory[itemId]=Number(player.inventory[itemId]||0)+amount;
  }
  function setBellQuestObjective(player,objective){
    const questLog=window.LegendQuestLogV120;
    if(typeof questLog?.setBellQuestObjective!=='function'){
      throw new Error('LegendQuestLogV120 must load before the v100 road state service.');
    }
    return questLog.setBellQuestObjective(player,objective);
  }
  const state=player=>{
    player.flags=player.flags||{};
    player.flags.roadExpeditionV100=player.flags.roadExpeditionV100||{stage:0,pressure:0,trips:0,events:0,finds:0,battles:0};
    return player.flags.roadExpeditionV100;
  };
  const ensure=player=>{
    const current=state(player);
    current.stage=clamp(Number(current.stage||0),0,5);
    current.pressure=clamp(Number(current.pressure||0),0,100);
    return current;
  };
  const score=(player,skill)=>{
    const data=D()||{};
    const classMods=data.classes?.[player.className]?.mod||{};
    const originBonus=data.origins?.[player.origin]?.bonus||{};
    const keepsakeBonus=data.keepsakes?.[player.keepsake]?.bonus||{};
    const creationBonus=player.creationV094?.bonuses||player.creationV090?.bonuses||{};
    return Number(classMods[skill]||0)+Number(originBonus[skill]||0)+Number(keepsakeBonus[skill]||0)+Number(creationBonus[skill]||0);
  };
  const weapon=player=>(D().weapons||[]).find(item=>item.id===player.weapon)||{name:'Hands',min:1,max:3};
  const armor=player=>(D().armors||[]).find(item=>item.id===player.armor)||{name:'None',defense:0};
  const hpPercent=player=>clamp(Math.round(Number(player.hp||0)/Math.max(1,Number(player.maxHp||1))*100),0,100);
  const itemName=id=>D().itemNames?.[id]||({food:'Rations',camp:'Camp Supplies',roadToken:'Road Tokens',potion:'Healing Potions',fur:'Furs',bellFragment:'Bell Fragments',log:'Logs'}[id]||id);
  const skillLabel=skill=>({survival:'Roadsense',strength:'Force',lore:'Lore',luck:'Fortune',thieving:'Guile',craft:'Craft'}[skill]||skill).toUpperCase();
  return Object.freeze({addInventory,setBellQuestObjective,state,ensure,score,weapon,armor,hpPercent,itemName,skillLabel});
 }
 window.LegendRoadStateV100=Object.freeze({create});
})();
