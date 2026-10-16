/* LEGEND turn-based combat module.
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
      onCommand: combatAction,
      onRetreat: retreat,
      onToggleSound: toggleBattleSound
    });


function enemyIntent(enemy){
 const n=Number(enemy.turn||0)%3;
 return n===0?'heavy':n===1?'attack':'guardbreak';
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
 enemy.turn=Number(enemy.turn||0);
 enemy.intent=enemy.intent||enemyIntent(enemy);
 startBattleMusic();
 if(combatView?.render){
  return combatView.render(pl,enemy,note,weapon(pl),armor(pl),classTechnique(pl));
 }
 stopBattleMusic();
 return renderExpedition('The battle screen did not load. Return to Ashmere and refresh before continuing.');
}
function retreat(enemy){
 const pl=p();if(!pl)return;
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
 const armorValue=Math.max(0,Number(a.defense||0));
 const reduction=enemy.intent==='guardbreak'?Math.floor(armorValue*.4)+(guarding?5:0):armorValue+(guarding?(enemy.intent==='heavy'?8:5):0);
 const incoming=Math.max(0,raw-reduction);pl.hp=Math.max(0,Number(pl.hp||1)-incoming);
 if(enemy.snared){note+=' The trap weakens the counterattack.';enemy.snared=false;}
 enemy.turn=Number(enemy.turn||0)+1;enemy.intent=enemyIntent(enemy);
 if(action!=='skill')enemy.skillCooldown=Math.max(0,Number(enemy.skillCooldown||0)-1);
 note+=(guarding?' Your guard turns the blow aside.':' '+enemy.name+' hits you for '+incoming+' damage.')+(action==='heavy'?' Your heavy swing leaves you exposed.':'');
 if(incoming>0)playBattleFx('hit');
 if(pl.hp<=0){pl.hp=1;s.stage=0;s.poiUsed={};s.pressure=clamp(s.pressure+12,0,100);save(pl);stopBattleMusic();return outcome('Driven Back','The road overwhelms you. You make it back alive, badly wounded, and the expedition is cut short.','Defeat')}
 save(pl);combat(enemy,note);
}
function win(enemy){
 stopBattleMusic();playBattleFx('victory');tone('success');
 const pl=p();if(!pl)return;const s=ensure(pl);inv(pl,enemy.reward||'fur',1);
 const progress=context.awardProgress?.(pl,25+Math.min(20,Number(s.stage||0)*4));
 s.stage=clamp(s.stage+1,0,5);s.pressure=clamp(s.pressure-8,0,100);pl.stats=pl.stats||{};pl.stats.monstersDefeated=Number(pl.stats.monstersDefeated||0)+1;pl.stats.roadVictories=Number(pl.stats.roadVictories||0)+1;
 save(pl);renderExpedition(enemy.name+' defeated. You recover '+itemName(enemy.reward||'fur')+'. '+(progress?'XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'. ':'')+'You continue along the Old Road.');
}

    return combat(enemy, note);
  }

  window.LegendRoadCombatV100 = Object.freeze({ start });
})();
