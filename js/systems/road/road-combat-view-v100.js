/* LEGEND v0.20.36 - Old Road battle presentation and command binding.
 * Owns the battle screen markup and connects controls to injected combat actions.
 * Damage, turns, inventory, rewards and retreat effects remain in road-combat-v100.
 */
(() => {
  function create(context = {}) {
    const {
      getAssets,
      getWeapon,
      getArmor,
      score,
      hpPercent,
      escapeHtml,
      clamp,
      renderShell,
      soundOn: getSoundOn,
      onCommand,
      onRetreat,
      onToggleSound
    } = context;
    if (typeof getAssets !== 'function' || typeof getWeapon !== 'function' ||
        typeof getArmor !== 'function' || typeof score !== 'function' ||
        typeof hpPercent !== 'function' || typeof escapeHtml !== 'function' ||
        typeof clamp !== 'function' || typeof renderShell !== 'function') return null;
    const A = () => getAssets() || {};
    const weapon = getWeapon;
    const armor = getArmor;
    const hpPct = hpPercent;
    const esc = escapeHtml;
    const shell = renderShell;
    const soundOn = typeof getSoundOn === 'function' ? getSoundOn : () => true;
function render(pl, enemy, note = '', w, a, technique) {
 if (!pl) return;
 const intentText=enemy.snared?'Snared · its next blow is weakened':enemy.intent==='heavy'?'Heavy wind-up · GUARD or disrupt it':enemy.intent==='guardbreak'?'Guard-break · strike first or use ACT':'Quick strike · GUARD softens the hit';
 const foeIntentClass=enemy.snared?'snared':enemy.intent==='heavy'?'heavy':enemy.intent==='guardbreak'?'guardbreak':'attack';
 const foeIntentLabel=foeIntentClass==='heavy'?'HEAVY WIND-UP':foeIntentClass==='guardbreak'?'GUARD BREAK':foeIntentClass==='snared'?'SNARED':'OPPONENT';
 const stableEnemies=A().enemies||{},legacyArt=A().byName?.(enemy.name)||'',enemyName=String(enemy.name||'').toLowerCase();
 const art=(enemyName.includes('wolf')?stableEnemies.blackrootWolf:enemyName.includes('goblin')?stableEnemies.roadGoblin:enemyName.includes('wisp')?stableEnemies.lanternWisp:'')||legacyArt;
 const heroArt=A().classes?.[pl.className]||'',health=hpPct(pl);
 const playerHit=/hits you for|blow|damage taken/i.test(note),foeHit=/lands for|attack lands|Heavy Strike lands|Rune Bolt lands|Cleave lands|Trap Shot lands|Swipe lands/i.test(note);
 const turnNumber=Number(enemy.turn||0)+1;
 
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
 button('strike',()=>onCommand?.(enemy,'attack'));
 button('heavy',()=>onCommand?.(enemy,'heavy'));
 button('guard',()=>onCommand?.(enemy,'guard'));
 button('skill',()=>onCommand?.(enemy,'skill'));
 button('item',()=>onCommand?.(enemy,'item'));
 button('poultice',()=>onCommand?.(enemy,'poultice'));
 button('flee',()=>onRetreat?.(enemy));
 button('battleSound',()=>{ onToggleSound?.(); const control=document.getElementById('battleSound'); if(control)control.textContent=soundOn()?'♫ SOUND ON':'♫ SOUND OFF'; });
}
    return Object.freeze({ render });
  }

  window.LegendRoadCombatViewV100 = Object.freeze({ create });
})();
