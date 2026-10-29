/* LEGEND v0.27.5 — story-first opening annals.
 * Runs before traveler creation, then hands directly into the production soul-shaping flow.
 * The narration does not reveal the traveler's hidden nature.
 */
(() => {
  const ROOT = () => document.getElementById('root');
  const scenes = [
    {chapter:'I · THE OLD WAR',title:'When the World Went to War',paragraphs:[
      'Long before Ashmere’s lanterns marked a safe road, human kingdoms and monster nations fought across the lowlands, deep forests, and mountain halls. Fortresses changed hands. Old borders disappeared. The songs that survived do not even agree on who struck the first blow.',
      'Some fought for their homes, some for power, and many because an army had reached their door. No people was a single mind. By the final winter, victory had begun to look too much like the ruin of everyone left alive.'
    ],quote:'The war ended not with a final victory, but with a choice neither side trusted.'},
    {chapter:'II · THE SEAL BELOW',title:'The Pact Beneath the Stone',paragraphs:[
      'The last human wardens and the monster leaders still able to command their hosts made a terrible bargain. Together they raised a seal over the deep ways, binding the old gates and driving the remaining war-hosts beneath the earth.',
      'The agreement promised that the armies below would stay below, while the kingdoms above would keep the wards and passage-stones intact. Generations grew up calling it the end of the monster war. The seal became part treaty, part warning—and part history people preferred not to remember.'
    ],quote:'A promise can outlast the people who made it. That does not make it unbreakable.'},
    {chapter:'III · THE LAST MERCY',title:'The Kindness That Failed',paragraphs:[
      'Long after the seal was raised, plague and another war left a healer surrounded by the dead. Unable to accept that those they loved were gone, the healer attempted a ritual meant to bring them back. The forbidden accounts call it the Last Mercy.',
      'No whole soul returned. Instead came echoes—fragments of memory, habit, and longing that could imitate the absent. The ritual wounded the Veil, the boundary between life and death, and left places where the world no longer behaved as it should.',
      'The old seal and the Last Mercy belong to different chapters of history. Whether one has anything to do with the other is not written here. What is known is simpler: old protections can fail, and the world has begun to change again.'
    ],quote:'Before the road, before the waking, there is a question no chronicle can answer for you: what will you choose to carry?'}
  ];
  let step=0, onContinue=null;
  function render(){
    const root=ROOT(); if(!root)return;
    const s=scenes[step], numeral=['I','II','III'][step];
    root.innerHTML="<main class='opening-lore-v220' aria-labelledby='openingLoreTitle' data-lore-step='"+step+"'>"+
      "<div class='opening-lore-v220-backdrop' aria-hidden='true'></div><div class='opening-lore-v220-grain' aria-hidden='true'></div>"+
      "<header class='opening-lore-v220-top'><span class='opening-lore-v220-brand'>LEGEND <i>THE AWAKENING</i></span><span class='opening-lore-v220-edition'>FRAGMENTS FROM THE OLD ANNALS</span></header>"+
      "<section class='opening-lore-v220-content'><div class='opening-lore-v220-side' aria-hidden='true'><span>"+numeral+"</span><i></i><small>"+(step+1)+" / 3</small></div>"+
      "<article class='opening-lore-v220-copy'><div class='opening-lore-v220-kicker'>"+s.chapter+"</div><h1 id='openingLoreTitle'>"+s.title+"</h1>"+
      s.paragraphs.map(p=>"<p>"+p+"</p>").join('')+"<blockquote>"+s.quote+"</blockquote></article></section>"+
      "<footer class='opening-lore-v220-footer'><button id='openingLoreSkip' class='opening-lore-v220-skip' type='button'>Skip the annals</button>"+
      "<div class='opening-lore-v220-progress' aria-label='Opening prologue progress'><i style='width:"+((step+1)/scenes.length*100)+"%'></i></div>"+
      "<button id='openingLoreContinue' class='opening-lore-v220-continue' type='button'>"+(step===scenes.length-1?'Shape the traveler':'Continue')+"<span aria-hidden='true'> →</span></button></footer></main>";
    root.querySelector('#openingLoreSkip')?.addEventListener('click',finish);
    root.querySelector('#openingLoreContinue')?.addEventListener('click',()=>{if(step<scenes.length-1){step++;render();}else finish();});
  }
  function finish(){const cb=onContinue;onContinue=null;if(typeof cb==='function')cb();}
  function start(callback){step=0;onContinue=callback;document.body?.classList.remove('legend-world-shell-active');render();}
  window.LegendOpeningPrologueV220=Object.freeze({start});
})();
