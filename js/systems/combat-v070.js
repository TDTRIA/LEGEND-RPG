// LEGEND v0.7.0 — Interactive Combat Layer
// Wraps LegendUI before game.js loads. Adds richer battle choices without replacing restored game.js.
(() => {
  const SAVE_KEY = 'legend-recovered-build-v06';
  const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const clamp = (n,a,b) => Math.max(a, Math.min(b,n));

  function savePlayer(p){
    try{
      if(window.LegendStorage?.savePlayer) window.LegendStorage.savePlayer(p);
      else localStorage.setItem(SAVE_KEY, JSON.stringify(p));
    }catch{}
  }

  function bonus(player, skill){
    const D = window.LEGEND_DATA || {};
    return Number(D.classes?.[player.className]?.mod?.[skill] || 0) + Number(D.origins?.[player.origin]?.bonus?.[skill] || 0) + Number(D.keepsakes?.[player.keepsake]?.bonus?.[skill] || 0);
  }

  function pushLog(args, message, type='story'){
    args.log = args.log || [];
    args.log.unshift({m:message,t:type});
    args.log = args.log.slice(0,12);
  }

  function intentMood(text=''){
    const t = String(text).toLowerCase();
    if(/heavy|lunge|charge|slam|bite|crush|howl|rage|rush|strike/.test(t)) return {tag:'Heavy Intent', hint:'Guarding is safer. Exploit checks are harder, but rewarding.', dc:13, skill:'survival'};
    if(/watch|circle|careful|stalk|wait|study|sniff|measure/.test(t)) return {tag:'Cautious Intent', hint:'A distraction or feint can open them up.', dc:10, skill:'luck'};
    if(/weak|stagger|bleed|exposed|tired|wound/.test(t)) return {tag:'Opening', hint:'Exploit Opening has a strong chance to land.', dc:8, skill:'thieving'};
    return {tag:'Unclear Intent', hint:'Read the scene and choose your risk.', dc:11, skill:'survival'};
  }

  function enhanceBattleExtra(args){
    const match = String(args.extra || '').match(/Intent:\s*([^<]+)/i);
    const mood = intentMood(match?.[1] || '');
    return `${args.extra || ''}<div class="combat-v070-panel"><div><span class="combat-kicker">Encounter Read</span><strong>${mood.tag}</strong><p>${mood.hint}</p></div><div><span class="combat-kicker">New v0.7.0 Options</span><p>Exploit openings, use supplies, talk down threats, or attempt a risky escape.</p></div></div>`;
  }

  function addCombatActions(args){
    if(!Array.isArray(args.actions) || args.actions.__v070Enhanced) return args.actions;
    const base = args.actions;
    const player = args.player;
    const attack = base[0];
    const guard = base[1];
    const classMove = base[2];
    const flee = base[3];
    const intentText = String(args.extra || '').match(/Intent:\s*([^<]+)/i)?.[1] || '';
    const mood = intentMood(intentText);

    const exploit = {
      label:`Exploit Opening (${mood.skill} DC ${mood.dc})`,
      className:'combat-special',
      fn:()=>{
        const roll = rand(1,20);
        const b = bonus(player, mood.skill);
        const total = roll + b;
        player.stats = player.stats || {};
        if(total >= mood.dc){
          player.stats.checksPassed = Number(player.stats.checksPassed || 0) + 1;
          player.momentum = clamp(Number(player.momentum || 0) + 2, 0, 5);
          savePlayer(player);
          alert(`Success: d20(${roll}) + ${b} = ${total}. You read the enemy and gain +2 Momentum before striking.`);
          attack.fn();
        }else{
          player.stats.checksFailed = Number(player.stats.checksFailed || 0) + 1;
          player.momentum = clamp(Number(player.momentum || 0) - 1, 0, 5);
          savePlayer(player);
          alert(`Failure: d20(${roll}) + ${b} = ${total}. You misread the opening and lose Momentum.`);
          guard.fn();
        }
      }
    };

    const useItem = {
      label:'Use Item',
      fn:()=>{
        if(window.LegendInventoryV065?.open) window.LegendInventoryV065.open();
        else alert('Inventory is still loading.');
      }
    };

    const social = {
      label: player.className === 'Warrior' ? 'Intimidate' : player.className === 'Thief' ? 'Distract' : player.className === 'Mage' ? 'Disrupt' : 'Talk / Distract',
      fn:()=>{
        const skill = player.className === 'Warrior' ? 'strength' : player.className === 'Mage' ? 'magic' : player.className === 'Thief' ? 'thieving' : 'luck';
        const dc = 12;
        const roll = rand(1,20), b = bonus(player, skill), total = roll + b;
        player.stats = player.stats || {};
        if(total >= dc){
          player.stats.checksPassed = Number(player.stats.checksPassed || 0) + 1;
          player.momentum = clamp(Number(player.momentum || 0) + 1, 0, 5);
          player.hp = clamp(Number(player.hp || 1) + 6, 1, Number(player.maxHp || player.hp || 1));
          savePlayer(player);
          alert(`Success: d20(${roll}) + ${b} = ${total}. You shake the enemy's focus, gain Momentum, and catch your breath.`);
          guard.fn();
        }else{
          player.stats.checksFailed = Number(player.stats.checksFailed || 0) + 1;
          savePlayer(player);
          alert(`Failure: d20(${roll}) + ${b} = ${total}. The enemy does not break focus.`);
          attack.fn();
        }
      }
    };

    const riskyFlee = {
      label:'Risky Flee (survival/luck)',
      className:'danger',
      fn:()=>{
        const skill = bonus(player,'survival') >= bonus(player,'luck') ? 'survival' : 'luck';
        const roll = rand(1,20), b = bonus(player, skill), total = roll + b;
        player.stats = player.stats || {};
        if(total >= 10){
          player.stats.checksPassed = Number(player.stats.checksPassed || 0) + 1;
          player.momentum = 0;
          savePlayer(player);
          alert(`Escape: d20(${roll}) + ${b} = ${total}. You break away and stumble back toward Ashmere.`);
          flee.fn();
        }else{
          player.stats.checksFailed = Number(player.stats.checksFailed || 0) + 1;
          const loss = rand(4,12);
          player.hp = Math.max(1, Number(player.hp || 1) - loss);
          savePlayer(player);
          alert(`Failed escape: d20(${roll}) + ${b} = ${total}. You take ${loss} damage trying to run.`);
          guard.fn();
        }
      }
    };

    const enhanced = [attack, guard, exploit, classMove, useItem, social, riskyFlee];
    enhanced.__v070Enhanced = true;
    return enhanced;
  }

  function install(){
    if(!window.LegendUI || window.LegendUI.__combatV070Wrapped) return;
    const original = window.LegendUI.renderLayout;
    window.LegendUI.renderLayout = function(args){
      if(args?.title === 'Battle'){
        args.extra = enhanceBattleExtra(args);
        args.actions = addCombatActions(args);
      }
      return original.call(this,args);
    };
    window.LegendUI.__combatV070Wrapped = true;

    const css = document.createElement('style');
    css.textContent = `.combat-v070-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}.combat-v070-panel>div{border:1px solid rgba(255,211,105,.22);background:linear-gradient(180deg,rgba(255,211,105,.08),rgba(0,0,0,.18));border-radius:16px;padding:12px}.combat-v070-panel strong{display:block;color:#ffd369;font-size:1.1rem}.combat-v070-panel p{margin:.35rem 0 0;color:#d7f7df;line-height:1.45}.combat-kicker{display:block;color:#93b7a3;text-transform:uppercase;letter-spacing:.16em;font-size:.7rem;margin-bottom:4px}.actions .combat-special{border-color:rgba(125,255,173,.45)!important;background:linear-gradient(180deg,rgba(125,255,173,.22),rgba(0,0,0,.1))!important}@media(max-width:800px){.combat-v070-panel{grid-template-columns:1fr}}`;
    document.head.appendChild(css);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  install();
})();