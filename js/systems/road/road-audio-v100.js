/* LEGEND world audio director — generated soundtrack and location soundscapes.
 * Keeps the legacy legend-road-sound preference as the single mute switch.
 * A single persistent score and one location loop follow Phaser scene transitions.
 */
(() => {
  const KEY='legend-road-sound';
  const THEME='assets/audio/music/legend-main-theme.mp3';
  const AMB=Object.freeze({
    title:'assets/audio/ambience/title-ashmere.mp3',
    annals:'assets/audio/ambience/opening-annals.mp3',
    memory:'assets/audio/ambience/traveler-memory.mp3',
    town:'assets/audio/ambience/ashmere-town.mp3',
    inn:'assets/audio/ambience/ashmere-inn.mp3',
    forge:'assets/audio/ambience/ashmere-forge.mp3',
    road:'assets/audio/ambience/old-road-forest.mp3',
    ridge:'assets/audio/ambience/high-ridge.mp3',
    reeds:'assets/audio/ambience/reed-cut.mp3',
    camp:'assets/audio/ambience/roadside-camp.mp3',
    greyfen:'assets/audio/ambience/greyfen-marsh.mp3',
    docks:'assets/audio/ambience/greyfen-docks.mp3',
    cellar:'assets/audio/ambience/bell-cellar.mp3'
  });
  const ENV=Object.freeze({
    title:'title',ashmere:'town',inn:'inn',market:'town',forge:'forge',archive:'town',
    road:'road',ridge:'ridge',reeds:'reeds',camp:'camp',blackroot:'road',marsh:'greyfen',
    greyfen:'greyfen',greyfeninn:'docks',greyfenmarket:'docks',greyfenforge:'docks',
    greyfenarchive:'docks',cellar:'cellar'
  });
  const SURFACE=Object.freeze({annals:'annals',creation:'memory',awakening:'memory'});
  const UI=Object.freeze({
    hover:'assets/audio/ui/menu-hover.mp3',confirm:'assets/audio/ui/menu-confirm.mp3',
    back:'assets/audio/ui/menu-back.mp3',equip:'assets/audio/ui/armor-equip.mp3',
    map:'assets/audio/ui/map-unfold.mp3'
  });
  const BATTLE=Object.freeze({
    swing:'assets/audio/battle/sword-swing.mp3',heavy:'assets/audio/battle/heavy-impact.mp3',
    hit:'assets/audio/battle/sword-hit.mp3',guard:'assets/audio/battle/shield-block.mp3',
    heal:'assets/audio/battle/healing-spell.mp3',magic:'assets/audio/battle/spell-cast.mp3',
    victory:'assets/audio/rewards/quest-complete.mp3'
  });
  const FX=Object.freeze({
    bell:'assets/audio/story/ancient-bell-toll.mp3',awakening:'assets/audio/story/veil-awakening-pulse.mp3',
    coin:'assets/audio/rewards/loot-pickup-coins.mp3',fragment:'assets/audio/rewards/bell-fragment-discovery.mp3',
    levelUp:'assets/audio/rewards/level-up.mp3',quest:'assets/audio/rewards/quest-complete.mp3',
    workboard:'assets/audio/town/workboard-stamp.mp3',trade:'assets/audio/town/market-coin-trade.mp3',
    door:'assets/audio/town/wooden-door-creak.mp3',forge:'assets/audio/town/forge-hammer-quench.mp3',
    wolf:'assets/audio/creatures/blackroot-wolf-growl.mp3',goblin:'assets/audio/creatures/road-goblin-snarl.mp3',
    wisp:'assets/audio/creatures/lantern-wisp-chime.mp3',monster:'assets/audio/creatures/monster-roar.mp3',
    footstepsDirt:'assets/audio/world/footsteps-packed-dirt.mp3',
    footstepsGravel:'assets/audio/world/footsteps-old-gravel.mp3',
    footstepsMarsh:'assets/audio/world/footsteps-marsh-mud.mp3',
    gate:'assets/audio/world/old-road-gate-unlock.mp3',water:'assets/audio/world/greyfen-water-splash.mp3',
    cellarDoor:'assets/audio/dungeon/cellar-door-grind.mp3',
    cellarBell:'assets/audio/dungeon/ancient-bell-strike.mp3',
    stagger:'assets/audio/battle/enemy-stagger.mp3',enemyFall:'assets/audio/battle/enemy-hurt-fall.mp3'
  });
  let music=null,musicPath='',ambience=null,ambiencePath='';
  let environment='title',surface='title',unlocked=false;
  const effects=new Set();
  const soundOn=()=>{try{return localStorage.getItem(KEY)!=='off';}catch{return true;}};
  function stop(a){if(!a)return;try{a.pause();a.currentTime=0;}catch{}}
  function play(a){if(!a)return;try{const p=a.play?.();if(p&&p.catch)p.catch(()=>{});}catch{}}
  function loop(current,path,next,volume){
    if(current&&path===next){current.volume=volume;if(current.paused)play(current);return {audio:current,path};}
    stop(current);
    try{const a=new Audio(next);a.loop=true;a.volume=volume;a.preload='none';play(a);return {audio:a,path:next};}
    catch{return {audio:null,path:''};}
  }
  function ambienceFor(){
    const key=SURFACE[surface]||ENV[String(environment||'title').replace(/[^a-z]/gi,'').toLowerCase()]||'title';
    return AMB[key]||AMB.title;
  }
  function apply(){
    if(!unlocked||!soundOn()){stop(music);stop(ambience);music=null;musicPath='';ambience=null;ambiencePath='';return;}
    const m=loop(music,musicPath,THEME,.17);music=m.audio;musicPath=m.path;
    const a=loop(ambience,ambiencePath,ambienceFor(),.105);ambience=a.audio;ambiencePath=a.path;
  }
  function setEnvironment(value){environment=String(value||'title');apply();return environment;}
  function setSurface(value){surface=String(value||'title');apply();return surface;}
  function startWorldAudio(){unlocked=true;apply();return soundOn();}
  function stopWorldAudio(){stop(music);stop(ambience);music=null;musicPath='';ambience=null;ambiencePath='';effects.forEach(stop);effects.clear();unlocked=false;}
  function playSfx(path,volume=.22){
    if(!soundOn()||!path)return null;
    try{const a=new Audio(path);a.volume=volume;a.preload='auto';effects.add(a);a.onended=()=>effects.delete(a);a.onerror=()=>effects.delete(a);play(a);return a;}
    catch{return null;}
  }
  function playUi(kind='confirm'){return playSfx(UI[kind]||UI.confirm,kind==='hover'?.14:.22);}
  function playBattleFx(kind='swing'){return playSfx(BATTLE[kind]||BATTLE.swing,kind==='hit'?.30:kind==='victory'?.28:.22);}
  function playWorldFx(kind){return playSfx(FX[kind]||'',kind==='bell'||kind==='cellarBell'?.28:.22);}
  function tone(kind='tap'){return kind==='impact'?playBattleFx('heavy'):kind==='success'?playWorldFx('quest'):playUi('confirm');}
  function startBattleMusic(){return startWorldAudio();}
  function stopBattleMusic(){apply();}
  function toggleSound(){
    const on=!soundOn();try{localStorage.setItem(KEY,on?'on':'off');}catch{}
    if(on)apply();else{stop(music);stop(ambience);music=null;musicPath='';ambience=null;ambiencePath='';effects.forEach(stop);effects.clear();}
    return on;
  }
  function snapshot(){return {enabled:soundOn(),unlocked,environment,surface,musicPath,ambiencePath,musicPlaying:!!music&&!music.paused,ambiencePlaying:!!ambience&&!ambience.paused};}
  window.LegendRoadAudioV100=Object.freeze({soundOn,toggleSound,tone,playUi,playBattleFx,playWorldFx,setEnvironment,setSurface,startWorldAudio,stopWorldAudio,startBattleMusic,stopBattleMusic,snapshot});
})();
