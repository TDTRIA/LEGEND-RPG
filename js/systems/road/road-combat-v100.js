/* LEGEND v0.20.38 turn-based combat module.
 * Combat choices/rewards are separated from road traversal. Player state, save,
 * expedition return and audiovisual services are supplied by the road controller.
 * Gameplay formulas and strings are preserved from road-controller-v100.js.
 */
(() => {
  function start(context, enemy, note = '') {
    if (!context || typeof context.getPlayer !== 'function' ||
        typeof context.savePlayer !== 'function' || typeof context.renderShell !== 'function') return;
    const p = () => context.getPlayer();
    const save = player => context.savePlayer(player);
    const A = () => context.getAssets();
    const weapon = player => context.getWeapon(player);
    const armor = player => context.getArmor(player);
    const score = context.score;
    const ensure = player => context.ensureState(player);
    const hpPct = context.hpPercent;
    const esc = context.escapeHtml;
    const clamp = context.clamp;
    const rand = context.randomInt;
    const inv = context.addInventory;
    const itemName = context.itemName;
    const shell = context.renderShell;
    const renderExpedition = context.renderExpedition;
    const outcome = context.outcome;
    const showCombatResults = context.showCombatResults;
    const soundOn = context.soundOn;
    const startBattleMusic = context.startMusic;
    const stopBattleMusic = context.stopMusic;
    const playBattleFx = context.playBattleFx;
    const tone = context.tone;
    const toggleSound = context.toggleSound;

    const combatView = window.LegendRoadCombatViewV100?.create({
      getAssets: A,
      getWeapon: weapon,
      getArmor: armor,
      score,
      hpPercent: hpPct,
      escapeHtml: esc,
      clamp,
      renderShell: shell,
      soundOn,
      getLocationLabel: context.getLocationLabel,
      onCommand: combatAction,
      onRetreat: retreat,
      onToggleSound: toggleBattleSound
    });


const ENEMY_INTENT_PATTERNS = Object.freeze({
 // Goblins feint past a guard, take a quick strike, then commit to a heavy blow.
 raider: Object.freeze(['guardbreak','attack','heavy']),
 // Bandits alternate a guard-breaking feint with a committed strike.
 bandit: Object.freeze(['guardbreak','heavy','attack']),
 // Wolves press forward twice before briefly committing to a heavier lunge.
 predator: Object.freeze(['attack','heavy','attack']),
 // Wisps telegraph a strange surge, then try to break a steady guard.
 flicker: Object.freeze(['heavy','guardbreak','attack'])
});
const LEGACY_INTENT_PATTERN = Object.freeze(['heavy','attack','guardbreak']);

function enemyIntent(enemy){
 const pattern = ENEMY_INTENT_PATTERNS[enemy.behavior] || LEGACY_INTENT_PATTERN;
 const turn = Math.max(0, Math.floor(Number(enemy.turn || 0)));
 return pattern[turn % pattern.length];
}
function classTechnique(pl){
 const moves={
  Warrior:{name:'Cleave',text:'A committed two-handed cut. Strongest against an enemy winding up.',effect:'bonus damage'},
  Ranger:{name:'Trap Shot',text:'Pin the enemy’s movement so its next attack loses force.',effect:'snare'},
  Mage:{name:'Rune Bolt',text:'Break the enemy’s rhythm with a focused runic burst.',effect:'disrupt'},
  Thief:{name:'Swipe',text:'Strike quickly and lift a little coin while its guard is open.',effect:'steal'},
  Skiller:{name:'Improvised Tool',text:'Turn a field tool into a precise strike and steady your nerves.',effect:'steady'},
  Adventurer:{name:'Lucky Strike',text:'A risky angle that can land hard and restore a little grit.',effect:'luck'}
 };
 return moves[pl.className]||{name:'Class Technique',text:'Use your practiced strengths for a focused move.',effect:'bonus damage'};
}
function combat(enemy,note=''){
 const pl=p();if(!pl)return;
 ensure(pl);
 if(enemy.combatStartGold==null)enemy.combatStartGold=Number(pl.gold||0);
 if(enemy.combatStartLevel==null)enemy.combatStartLevel=Math.max(1,Number(pl.level||1));
 if(!enemy.combatStartInventory)enemy.combatStartInventory={...(pl.inventory||{})};
 enemy.turn=Number(enemy.turn||0);
 enemy.intent=enemy.intent||enemyIntent(enemy);
 enemy.combatLog=Array.isArray(enemy.combatLog)?enemy.combatLog:[];
 if(note&&enemy.combatLog[enemy.combatLog.length-1]!==note){
  enemy.combatLog.push(note);
  enemy.combatLog=enemy.combatLog.slice(-4);
 }
 startBattleMusic();
 if(combatView?.render){
  return combatView.render(pl,enemy,note,weapon(pl),armor(pl),classTechnique(pl));
 }
 stopBattleMusic();
 return renderExpedition('The battle screen did not load. Return to Ashmere and refresh before continuing.');
}
function retreat(enemy){
 const pl=p();if(!pl)return;
 if(enemy.specialEncounterV200===true&&typeof context.onSpecialEncounterRetreat==='function'){stopBattleMusic();return context.onSpecialEncounterRetreat(pl,enemy)}
 if(enemy.dungeonV100&&typeof context.onDungeonEncounterRetreat==='function'){stopBattleMusic();return context.onDungeonEncounterRetreat(pl,enemy)}
 const s=ensure(pl);
 stopBattleMusic();
 s.pressure=clamp(s.pressure-8,0,100);
 save(pl);
 renderExpedition('You withdraw from '+enemy.name+' and regroup on the road.');
}
function toggleBattleSound(){
 toggleSound?.();
 if(soundOn()){
  startBattleMusic();
  playBattleFx('magic');
 }else{
  stopBattleMusic();
 }
}

function combatAction(enemy,action){
 const pl=p();if(!pl)return;const s=ensure(pl),w=weapon(pl),a=armor(pl);
 if(enemy.openingEncounterV140&&action!=='skill')return combat(enemy,'???: “Awaken.” Use ACT to answer the voice.');
 if(action==='skill'&&Number(enemy.skillCooldown||0)>0)return combat(enemy,'Your class technique is recovering. Choose another command; this does not consume your turn.');
 const guarding=action==='guard';
 playBattleFx(action==='guard'?'guard':action==='item'||action==='poultice'?'heal':action==='skill'?'magic':action==='heavy'?'heavy':'swing');
 let note='';
 if(action==='item'){
   if(Number(pl.inventory?.potion||0)<1)return combat(enemy,'Your pack is out of healing potions.');
   if(Number(pl.hp||0)>=Number(pl.maxHp||1))return combat(enemy,'You are already at full health. Save the potion for a rougher turn.');
   pl.inventory.potion--;const heal=Math.min(Number(pl.maxHp||1)-Number(pl.hp||1),Math.max(1,Math.ceil(Number(pl.maxHp||1)*.3)));pl.hp=Number(pl.hp||1)+heal;note='You drink a Healing Potion and recover '+heal+' HP.';
 }else if(action==='poultice'){
   if(Number(pl.inventory?.roadPoultice||0)<1)return combat(enemy,'There are no Road Poultices left in your pack.');
   if(Number(pl.hp||0)>=Number(pl.maxHp||1))return combat(enemy,'You are already at full health.');
   pl.inventory.roadPoultice--;const heal=Math.min(Number(pl.maxHp||1)-Number(pl.hp||1),Math.max(1,Math.ceil(Number(pl.maxHp||1)*.2)));pl.hp=Number(pl.hp||1)+heal;note='You bind a Road Poultice over your wounds and recover '+heal+' HP.';
 }else if(action==='guard'){
   note='You set your feet, raise your guard, and wait for the strike.';
 }else{
   let damage=0;
   if(action==='attack')damage=Math.max(1,rand(Number(w.min||1),Number(w.max||3))+score(pl,'strength'));
   if(action==='heavy')damage=Math.max(2,rand(Number(w.min||1),Number(w.max||3))*2+score(pl,'strength')+2);
   if(action==='skill'){
    const move=classTechnique(pl).effect;
    damage=Math.max(2,rand(Number(w.min||1),Number(w.max||3))+Math.max(1,Number(pl.level||1))+Math.max(0,score(pl,'strength')+score(pl,'magic')+score(pl,'agility')));
    if(move==='bonus damage')damage+=Math.max(3,score(pl,'strength')*2);
    if(move==='snare'){enemy.snared=true;note='Your trap catches the enemy off-balance. ';}
    if(move==='disrupt'&&enemy.intent==='heavy'){enemy.intent='attack';note='Your Rune Bolt shatters the enemy’s heavy wind-up. ';}
    if(move==='steal'){const stolen=rand(5,12);pl.gold=Number(pl.gold||0)+stolen;note='Your Swipe snatches '+stolen+'g from the enemy. ';}
    if(move==='steady'){s.pressure=clamp(s.pressure-6,0,100);note='Your fieldcraft steadies your nerves; Road Pressure falls by 6. ';}
    if(move==='luck'){const heal=Math.min(Number(pl.maxHp||1)-Number(pl.hp||1),rand(3,5));pl.hp=Number(pl.hp||1)+heal;note='A lucky opening restores '+heal+' HP. ';}
    enemy.skillCooldown=2;
   }
   if(action==='attack'&&w.perk==='quickdraw'&&enemy.intent==='guardbreak'){damage+=5;note+='Your Wooden Sword answers the feint with a quickdraw. ';}
   if(action==='heavy'&&w.perk==='breaker'){damage=Math.round(damage*1.25);note+='The Stone Sword’s heavy edge bites deep. ';}
   if(action==='skill'&&w.perk==='battleRhythm'){damage+=5;note+='Your Bronze Sword carries the technique through. ';}
   if(action==='attack'&&w.perk==='heavyPunish'&&enemy.intent==='heavy'){damage+=7;note+='Your Iron Sword punishes the wind-up. ';}
   if((action==='attack'||action==='heavy')&&w.perk==='keenEdge'&&Math.random()<.2){damage=Math.round(damage*1.5);note+='Keen Edge critical! ';}
   enemy.hp-=damage;
   note+=(action==='heavy'?'Your Heavy Strike lands for ':action==='skill'?'Your '+classTechnique(pl).name+' lands for ':'Your strike lands for ')+damage+' damage.';
   if(damage>=Math.max(1,Number(enemy.maxHp||1)*.28))note+=' The impact staggers your foe.';
 }
 if(enemy.hp<=0){save(pl);return win(enemy)}
 const base=enemy.damage||[3,7];
 const rawBase=enemy.intent==='heavy'?Number(base[1]||7)+3:enemy.intent==='guardbreak'?Number(base[0]||3)+2:rand(Number(base[0]||3),Number(base[1]||7));
 const raw=rawBase+(action==='heavy'?4:0)-(enemy.snared?7:0);
 const listedArmor=Math.max(0,Number(a.defense||0));
 // Old armor scores were much larger than the new road damage scale. Convert
 // them to a bounded mitigation value so gear matters without making enemies harmless.
 const armorValue=listedArmor<=4?listedArmor:Math.min(8,Math.round(listedArmor*.18));
 const reduction=enemy.intent==='guardbreak'?Math.floor(armorValue*.4)+(guarding?5:0):armorValue+(guarding?(enemy.intent==='heavy'?8:5):0);
 const incoming=Math.max(0,raw-reduction);pl.hp=Math.max(0,Number(pl.hp||1)-incoming);
 if(enemy.snared){note+=' The trap weakens the counterattack.';enemy.snared=false;}
 enemy.turn=Number(enemy.turn||0)+1;enemy.intent=enemyIntent(enemy);
 if(action!=='skill')enemy.skillCooldown=Math.max(0,Number(enemy.skillCooldown||0)-1);
 note+=(guarding?' Your guard turns the blow aside.':' '+enemy.name+' hits you for '+incoming+' damage.')+(action==='heavy'?' Your heavy swing leaves you exposed.':'');
 if(incoming>0)playBattleFx('hit');
 if(note){
  enemy.combatLog=Array.isArray(enemy.combatLog)?enemy.combatLog:[];
  enemy.combatLog.push(note);
  enemy.combatLog=enemy.combatLog.slice(-4);
 }
 if(pl.hp<=0){
  pl.hp=1;
  if(enemy.specialEncounterV200===true&&typeof context.onSpecialEncounterDefeat==='function'){save(pl);stopBattleMusic();return context.onSpecialEncounterDefeat(pl,enemy)}
  if(enemy.dungeonV100&&typeof context.onDungeonEncounterDefeat==='function'){save(pl);stopBattleMusic();return context.onDungeonEncounterDefeat(pl,enemy)}
  s.stage=0;s.poiUsed={};s.pressure=clamp(s.pressure+12,0,100);save(pl);stopBattleMusic();
  const result={player:pl,enemy,result:'defeat',progress:{gained:0,levels:0,level:Number(pl.level||1)},rewardName:'',goldGained:Math.max(0,Number(pl.gold||0)-Number(enemy.combatStartGold||0)),routeStage:0};
  if(typeof showCombatResults==='function'&&showCombatResults(result))return;
  return outcome('Driven Back','The road overwhelms you. You make it back alive, badly wounded, and the expedition is cut short.','Defeat');
 }
 save(pl);combat(enemy,note);
}
function win(enemy){
 stopBattleMusic();playBattleFx('victory');tone('success');
 const pl=p();if(!pl)return;const s=ensure(pl);
 const drops=[{item:enemy.reward||'fur',count:1}];
 const bonusDrop=enemy.bonusDrop;
 if(bonusDrop&&bonusDrop.item&&rand(1,100)<=Math.max(0,Math.min(100,Number(bonusDrop.chance||0)))){
  const amount=Array.isArray(bonusDrop.amount)?rand(Number(bonusDrop.amount[0]||1),Number(bonusDrop.amount[1]||bonusDrop.amount[0]||1)):Math.max(1,Number(bonusDrop.amount||1));
  drops.push({item:bonusDrop.item,count:amount});
 }
 drops.forEach(drop=>inv(pl,drop.item,drop.count));
 if(Array.isArray(enemy.goldDrop)&&enemy.goldDrop.length>=2){
  pl.gold=Number(pl.gold||0)+Math.max(0,rand(Number(enemy.goldDrop[0]||0),Number(enemy.goldDrop[1]||0)));
 }
 const xpBase=Number(enemy.xp==null?25:enemy.xp);
 const stageBonus=Math.min(20,Number(s.stage||0)*4);
 const tierBonus=enemy.pressureTier==='severe'?12:enemy.pressureTier==='high'?6:0;
 const progress=context.awardProgress?.(pl,xpBase+stageBonus+tierBonus);
 const earnedItems=drops.map(drop=>itemName(drop.item)+(drop.count>1?' ×'+drop.count:''));
 const rewardLabel=earnedItems.join(' · ');
 if(enemy.openingEncounterV140){
  pl.stats=pl.stats||{};
  pl.stats.monstersDefeated=Number(pl.stats.monstersDefeated||0)+1;
  pl.stats.roadVictories=Number(pl.stats.roadVictories||0)+1;
  save(pl);
  if(typeof context.onOpeningEncounterWin==='function')return context.onOpeningEncounterWin(pl,enemy,progress);
  return outcome('Oric is still standing','The opening creature falls, but the story handoff did not load. Your victory and rewards are saved.','OPENING ENCOUNTER');
 }
 if(enemy.specialEncounterV200===true){
  pl.stats=pl.stats||{};
  pl.stats.monstersDefeated=Number(pl.stats.monstersDefeated||0)+1;
  pl.stats.specialEncounterVictories=Number(pl.stats.specialEncounterVictories||0)+1;
  save(pl);
  if(typeof context.onSpecialEncounterWin==='function')return context.onSpecialEncounterWin(pl,enemy,progress);
  return outcome(enemy.name+' is driven off','The regional encounter is won and its rewards are saved.','REGIONAL ENCOUNTER');
 }
 if(enemy.dungeonV100){pl.stats=pl.stats||{};pl.stats.monstersDefeated=Number(pl.stats.monstersDefeated||0)+1;pl.stats.dungeonVictories=Number(pl.stats.dungeonVictories||0)+1;save(pl);if(typeof context.onDungeonEncounterWin==='function')return context.onDungeonEncounterWin(pl,enemy,progress);return outcome('The Sentinel Falls','The cellar encounter is won and its combat rewards are saved.','DUNGEON ENCOUNTER')}
 s.stage=clamp(s.stage+1,0,5);s.pressure=clamp(s.pressure-8,0,100);pl.stats=pl.stats||{};pl.stats.monstersDefeated=Number(pl.stats.monstersDefeated||0)+1;pl.stats.roadVictories=Number(pl.stats.roadVictories||0)+1;
 save(pl);
 const result={player:pl,enemy,result:'victory',progress:progress||{gained:0,levels:0,level:Number(pl.level||1)},rewardName:rewardLabel,goldGained:Math.max(0,Number(pl.gold||0)-Number(enemy.combatStartGold||0)),routeStage:Number(s.stage||0),pressure:Number(s.pressure||0)};
 if(typeof showCombatResults==='function'&&showCombatResults(result))return;
 renderExpedition(enemy.name+' defeated. You recover '+rewardLabel+'. '+(progress?'XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'. ':'')+'You continue along the Old Road.');
}

    return combat(enemy, note);
  }

  window.LegendRoadCombatV100 = Object.freeze({ start });
})();
