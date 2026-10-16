/* LEGEND road audio preferences, short UI tones, battle effects, and music.
 * Owns the existing legend-road-sound preference key.
 */
(() => {
const soundOn=()=>{try{return localStorage.getItem('legend-road-sound')!=='off'}catch(e){return true}};
function tone(kind='tap'){
 if(!soundOn())return;
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const ctx=new C(),osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
  const impact=kind==='impact';osc.type=impact?'sawtooth':'triangle';
  osc.frequency.setValueAtTime(impact?145:520,now);
  osc.frequency.exponentialRampToValueAtTime(impact?68:kind==='success'?780:390,now+(impact?.13:.07));
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(impact?.075:.025,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+(impact?.15:.085));
  osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+(impact?.16:.09));
  osc.onended=()=>ctx.close();
 }catch(e){}
}
const BATTLE_AUDIO = {
 theme:'assets/audio/battle/old-road-battle_loop.wav',
 swing:'assets/audio/battle/battle_swing.wav',
 heavy:'assets/audio/battle/battle_heavy.wav',
 hit:'assets/audio/battle/battle_hit.wav',
 guard:'assets/audio/battle/battle_guard.wav',
 heal:'assets/audio/battle/battle_heal.wav',
 magic:'assets/audio/battle/battle_magic.wav',
 victory:'assets/audio/battle/battle_victory.wav'
};
let battleMusic=null;
function playBattleFx(kind){
 if(!soundOn())return;
 try{const audio=new Audio(BATTLE_AUDIO[kind]||BATTLE_AUDIO.swing);audio.volume=kind==='hit'?.34:kind==='victory'?.3:.2;audio.play().catch(()=>{});}catch(e){}
}
function startBattleMusic(){
 if(!soundOn())return;
 try{
  if(!battleMusic){battleMusic=new Audio(BATTLE_AUDIO.theme);battleMusic.loop=true;battleMusic.volume=.17;}
  if(battleMusic.paused)battleMusic.play().catch(()=>{});
 }catch(e){}
}
function stopBattleMusic(){
 if(!battleMusic)return;
 try{battleMusic.pause();battleMusic.currentTime=0;}catch(e){}
 battleMusic=null;
}


function toggleSound(){
 const enabled=!soundOn();
 try{localStorage.setItem('legend-road-sound',enabled?'on':'off');}catch(e){}
 return enabled;
}
window.LegendRoadAudioV100 = Object.freeze({soundOn,toggleSound,tone,playBattleFx,startBattleMusic,stopBattleMusic});
})();
