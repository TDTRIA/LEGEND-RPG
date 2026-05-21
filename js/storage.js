window.LegendStorage = (() => {
  const D = window.LEGEND_DATA;
  const SETTINGS_KEY = 'legend-settings-v1';
  const defaultSettings = { largeText:false, boldText:false, highContrast:false, reducedMotion:false, simpleAscii:false, spacious:false, readableFont:false };

  function baseSkills(){
    return {
      Woodcutting:{level:1,xp:0,xpLeft:80,gain:34,check:'survival'},
      Cooking:{level:1,xp:0,xpLeft:80,gain:36,check:'craft'},
      Fishing:{level:1,xp:0,xpLeft:80,gain:30,check:'survival'},
      Mining:{level:1,xp:0,xpLeft:80,gain:32,check:'strength'},
      Smithing:{level:1,xp:0,xpLeft:80,gain:35,check:'craft'},
      Thieving:{level:1,xp:0,xpLeft:80,gain:36,check:'thieving'}
    };
  }

  function normalize(p){
    if(!p) return null;
    p.version = D.VERSION;
    p.origin = p.origin || 'Lost Squire';
    p.keepsake = p.keepsake || 'Rusty Charm';
    p.inventory = p.inventory || {};
    Object.keys(D.itemNames).forEach(k => p.inventory[k] ??= 0);
    p.ownedWeapons = p.ownedWeapons || { hand:1 };
    p.ownedArmor = p.ownedArmor || { none:1 };
    p.stats = p.stats || {};
    Object.assign(p.stats, {
      monstersDefeated:p.stats.monstersDefeated || 0,
      timesDied:p.stats.timesDied || 0,
      checksPassed:p.stats.checksPassed || 0,
      checksFailed:p.stats.checksFailed || 0,
      oldRoadClears:p.stats.oldRoadClears || 0,
      oldRoadSuccesses:p.stats.oldRoadSuccesses || 0,
      roadEvents:p.stats.roadEvents || 0,
      resourcesFound:p.stats.resourcesFound || 0
    });
    p.flags = p.flags || {};
    Object.assign(p.flags, {
      bellQuestStarted:!!p.flags.bellQuestStarted,
      bellRoadSearched:!!p.flags.bellRoadSearched,
      bellQuestComplete:!!p.flags.bellQuestComplete,
      firstRoadComplete:!!p.flags.firstRoadComplete,
      talkedToMara:!!p.flags.talkedToMara,
      firstRoadEvent:!!p.flags.firstRoadEvent,
      firstToken:!!p.flags.firstToken,
      firstResource:!!p.flags.firstResource
    });
    p.skills = p.skills || baseSkills();
    p.mastery = p.mastery || {};
    Object.keys(p.skills).forEach(k => p.mastery[k] ??= 0);
    p.memories = p.memories || ['You woke beneath a dead lantern outside Ashmere.'];
    p.questLog = p.questLog || ['The Bell That Rang Once: Speak to Mara in The Archive Hall.','The First Road: Explore Old Road and return with 3 Road Tokens.'];
    p.traits = p.traits || [];
    p.momentum = p.momentum || 0;
    p.bank = p.bank || [0,0,0,0,0];
    return p;
  }

  function savePlayer(player){ if(player) localStorage.setItem(D.SAVE_KEY, JSON.stringify(player)); }
  function loadPlayer(){
    const raw = localStorage.getItem(D.SAVE_KEY) || D.OLD_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if(!raw) return null;
    try { return normalize(JSON.parse(raw)); } catch { return null; }
  }
  function deleteSaves(){ [D.SAVE_KEY, ...D.OLD_KEYS].forEach(k => localStorage.removeItem(k)); }

  function loadSettings(){
    try { return {...defaultSettings, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {})}; }
    catch { return {...defaultSettings}; }
  }
  function saveSettings(settings){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); applySettings(settings); }
  function applySettings(settings = loadSettings()){
    const map = {
      largeText:'a11y-large-text', boldText:'a11y-bold-text', highContrast:'a11y-high-contrast',
      reducedMotion:'a11y-reduced-motion', simpleAscii:'a11y-simple-ascii', spacious:'a11y-spacious', readableFont:'a11y-readable-font'
    };
    Object.values(map).forEach(c => document.body.classList.remove(c));
    Object.entries(map).forEach(([key, cls]) => { if(settings[key]) document.body.classList.add(cls); });
  }

  return { baseSkills, normalize, savePlayer, loadPlayer, deleteSaves, loadSettings, saveSettings, applySettings };
})();
