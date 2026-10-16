// LEGEND v0.20.x - Old Road combat engine
// Owns turn-based combat presentation, action resolution, enemy intent, and victory rewards.
// Expedition state and persistence remain injected by the road controller.
(() => {
  function create(dependencies) {
    const {
      A, esc, p, ensure, weapon, armor, score, hpPct, rand, clamp,
      inv, itemName, renderExpedition, save, shell, soundOn, tone,
      playBattleFx, startBattleMusic, stopBattleMusic, outcome
    } = dependencies;

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
     const pl=p();if(!pl)return;const s=ensure(pl),w=weapon(pl),a=armor(pl);
     enemy.turn=Number(enemy.turn||0);enemy.intent=enemy.intent||enemyIntent(enemy);
     const intentText=enemy.snared?'Snared · its next blow is weakened':enemy.intent==='heavy'?'Heavy wind-up · GUARD or disrupt it':enemy.intent==='guardbreak'?'Guard-break · strike first or use ACT':'Quick strike · GUARD softens the hit';
     const foeIntentClass=enemy.snared?'snared':enemy.intent==='heavy'?'heavy':enemy.intent==='guardbreak'?'guardbreak':'attack';
     const foeIntentLabel=foeIntentClass==='heavy'?'HEAVY WIND-UP':foeIntentClass==='guardbreak'?'GUARD BREAK':foeIntentClass==='snared'?'SNARED':'OPPONENT';
     const stableEnemies=A().enemies||{},legacyArt=A().byName?.(enemy.name)||'',enemyName=String(enemy.name||'').toLowerCase();
     const art=(enemyName.includes('wolf')?stableEnemies.blackrootWolf:enemyName.includes('goblin')?stableEnemies.roadGoblin:enemyName.includes('wisp')?stableEnemies.lanternWisp:'')||legacyArt;
     const heroArt=A().classes?.[pl.className]||'',technique=classTechnique(pl),health=hpPct(pl);
     const playerHit=/hits you for|blow|damage taken/i.test(note),foeHit=/lands for|attack lands|Heavy Strike lands|Rune Bolt lands|Cleave lands|Trap Shot lands|Swipe lands/i.test(note);
     const turnNumber=Number(enemy.turn||0)+1;
     startBattleMusic();
     shell('<section class="exp100-panel exp100-combat rpg-battle rpg-intent-'+foeIntentClass+' '+(playerHit?'rpg-player-hit ':'')+(foeHit?'rpg-foe-hit':'')+'" aria-label="Turn-based battle">'+
      '<div class="rpg-battle-topline"><div><span class="rpg-overline">THE OLD ROAD</span><strong>ENCOUNTER <i> / </i> TURN '+turnNumber+'</strong></div><button class="rpg-sound-toggle" id="battleSound" type="button" aria-label="Toggle battle music and sound">'+(soundOn()?'♫ SOUND ON':'♫ SOUND OFF')+'</button></div>'+
      '<div class="rpg-battlefield"><div class="rpg-battle-moon" aria-hidden="true"></div><div class="rpg-battle-orbit" aria-hidden="true"></div><div class="rpg-ground-haze" aria-hidden="true"></div>'+
       '<div class="rpg-foe-side"><div class="rpg-foe-nameplate rpg-foe-intent-'+foeIntentClass+'"><span>'+foeIntentLabel+'</span><strong>'+esc(enemy.name)+'</strong><small>'+Math.max(0,Number(enemy.hp))+' / '+Number(enemy.maxHp)+' HP</small><div class="rpg-foe-hp"><i style="width:'+clamp(Math.round(Number(enemy.hp)/Math.max(1,Number(enemy.maxHp))*100),0,100)+'%"></i></div></div>'+
       '<div class="rpg-foe-sprite">'+(art?'<img class="rpg-foe-art" src="'+esc(art)+'" alt="'+esc(enemy.name)+'">':'<span class="rpg-foe-unknown" aria-hidden="true">✦</span>')+'<i class="rpg-foe-shadow"></i></div></div>'+
       '<div class="rpg-target-arrow" aria-hidden="true">‹</div></div>'+
      '<div class="rpg-combat-status"><div class="rpg-hero-portrait">'+(heroArt?'<img src="'+esc(heroArt)+'" alt="">':'<span aria-hidden="true">✧</span>')+'</div>'+
       '<div class="rpg-hero-copy"><div class="rpg-hero-name"><strong>'+esc(pl.username||'Traveler')+'</strong><span>LV '+Math.max(1,Number(pl.level||1))+' · '+esc(pl.className||'Wayfarer')+'</span></div>'+
       '<div class="rpg-hero-vitals"><div class="rpg-vital-label"><span>HP</span><strong>'+Number(pl.hp||0)+' <i>/</i> '+Number(pl.maxHp||1)+'</strong></div><div class="rpg-hero-hp"><i style="width:'+health+'%"></i></div></div>'+
       '<div class="rpg-hero-resources"><span>WEAPON <b>'+esc(w.name)+'</b></span><span>ARMOR <b>'+esc(a.name)+'</b></span><span>POTIONS <b>'+Number(pl.inventory?.potion||0)+'</b></span><span>GOLD <b>'+Number(pl.gold||0)+'g</b></span></div></div></div>'+
      '<div class="rpg-dialogue" aria-live="polite"><span class="rpg-dialogue-star" aria-hidden="true">✦</span><div><span class="rpg-dialogue-kicker">'+(note?'BATTLE LOG':'A HOSTILE APPROACHES')+'</span><p>'+(note?esc(note):esc(enemy.name+' blocks the road. Read its intent, then choose your move.'))+'</p></div></div>'+
      '<div class="rpg-enemy-tell"><span class="rpg-tell-mark" aria-hidden="true">!</span><div><small>ENEMY INTENT</small><span class="exp100-intent">'+intentText+'</span></div></div>'+
      '<div class="rpg-turn-heading"><div><span>YOUR TURN</span><strong>Choose a command</strong></div><small>One action gives the enemy its turn.</small></div>'+
      '<div class="rpg-command-grid" role="group" aria-label="Battle commands">'+
       '<button class="rpg-command rpg-command-fight" id="strike" type="button"><span class="rpg-command-glyph" aria-hidden="true">⚔</span><span class="rpg-command-label"><strong>FIGHT</strong><small>Quick strike</small></span><em>'+Math.max(1,Number(w.min||1)+score(pl,'strength'))+'–'+Math.max(2,Number(w.max||3)+score(pl,'strength'))+'</em></button>'+
       '<button class="rpg-command rpg-command-act" id="skill" type="button" '+(Number(enemy.skillCooldown||0)>0?'disabled':'')+'><span class="rpg-command-glyph" aria-hidden="true">✧</span><span class="rpg-command-label"><strong>ACT</strong><small>'+esc(technique.name)+'</small></span><em>'+(Number(enemy.skillCooldown||0)>0?'COOLDOWN':'CLASS MOVE')+'</em></button>'+
       '<button class="rpg-command rpg-command-item" id="item" type="button" '+(Number(pl.inventory?.potion||0)<1||Number(pl.hp||0)>=Number(pl.maxHp||1)?'disabled':'')+'><span class="rpg-command-glyph" aria-hidden="true">✚</span><span class="rpg-command-label"><strong>ITEM</strong><small>Healing potion</small></span><em>'+Number(pl.inventory?.potion||0)+' LEFT</em></button>'+
       '<button class="rpg-command rpg-command-guard" id="guard" type="button"><span class="rpg-command-glyph" aria-hidden="true">⬡</span><span class="rpg-command-label"><strong>GUARD</strong><small>Brace for impact</small></span><em>DEFEND</em></button>'+
      '</div>'+
      '<div class="rpg-battle-utilities"><span>OTHER MOVES</span><button class="rpg-utility-command" id="heavy" type="button">Heavy Strike <small>Risky · high damage</small></button>'+
       '<button class="rpg-utility-command" id="poultice" type="button" '+(Number(pl.inventory?.roadPoultice||0)<1||Number(pl.hp||0)>=Number(pl.maxHp||1)?'disabled':'')+'>Road Poultice <small>'+Number(pl.inventory?.roadPoultice||0)+' in pack</small></button>'+
       '<button class="rpg-utility-command rpg-retreat" id="flee" type="button">Retreat <small>Abandon this encounter</small></button></div>'+
      '<p class="rpg-battle-footnote">'+esc(technique.text)+' Armor softens incoming blows; the heavy wind-up can be guarded against or disrupted.</p></section>');
     const button=(id,fn)=>{const el=document.getElementById(id);if(el)el.onclick=fn;};
     button('strike',()=>combatAction(enemy,'attack'));
     button('heavy',()=>combatAction(enemy,'heavy'));
     button('guard',()=>combatAction(enemy,'guard'));
     button('skill',()=>combatAction(enemy,'skill'));
     button('item',()=>combatAction(enemy,'item'));
     button('poultice',()=>combatAction(enemy,'poultice'));
     button('flee',()=>{stopBattleMusic();s.pressure=clamp(s.pressure-8,0,100);save(pl);renderExpedition('You withdraw from '+enemy.name+' and regroup on the road.');});
     button('battleSound',()=>{
      try{localStorage.setItem('legend-road-sound',soundOn()?'off':'on');}catch(e){}
      if(soundOn()){startBattleMusic();playBattleFx('magic');}else{stopBattleMusic();}
      const control=document.getElementById('battleSound');if(control)control.textContent=soundOn()?'♫ SOUND ON':'♫ SOUND OFF';
     });
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
     const progress=window.LegendProgressionV100?.award(pl,25+Math.min(20,Number(s.stage||0)*4));
     s.stage=clamp(s.stage+1,0,5);s.pressure=clamp(s.pressure-8,0,100);pl.stats=pl.stats||{};pl.stats.monstersDefeated=Number(pl.stats.monstersDefeated||0)+1;pl.stats.roadVictories=Number(pl.stats.roadVictories||0)+1;
     save(pl);renderExpedition(enemy.name+' defeated. You recover '+itemName(enemy.reward||'fur')+'. '+(progress?'XP +'+progress.gained+(progress.levels?' · Level up! You are now level '+progress.level:'')+'. ':'')+'You continue along the Old Road.');
    }

    return { combat };
  }

  window.LegendCombatV100 = { create };
})();
