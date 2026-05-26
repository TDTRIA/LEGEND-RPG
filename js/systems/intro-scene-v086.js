// LEGEND v0.8.6 - Living Intro Scene
// A more immersive animated intro for Roads of Ashmere.
(() => {
  const RT = () => window.LegendRuntimeV080 || null;
  const KEY = 'legend-intro-seen-v086';
  const ID = 'legendIntroSceneV086';
  let active = false;

  function load(){return RT()?.loadPlayer?.() || null;}
  function save(p){RT()?.savePlayer?.(p);}
  function esc(s){return String(s == null ? '' : s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  const scenes = [
    {k:'Before Dawn',t:'Wet Grass',body:'Rain has passed, but the road still smells of it. You wake with mud on your hands, a keepsake pressed into your palm, and a lantern burning somewhere ahead.',btn:'Sit Up',shot:'field'},
    {k:'The Old Road',t:'A Sign in the Fog',body:'A crooked sign waits beside the ditch. One arrow points back into dark trees. The other points toward Ashmere. Behind you, something moves and then decides not to follow.',btn:'Follow the Sign',shot:'road'},
    {k:'First Choice',t:'The Lantern Post',body:'A dead lantern hangs from a roadside post. When you step close, it flares once like it recognizes you. You can take a moment to steady yourself, or keep moving before the dark gathers again.',btn:'Choose',shot:'lantern',choice:true},
    {k:'Ashmere',t:'The Bell Rings Once',body:'The town appears slowly: timber walls, wet rooftops, chimney smoke, guards with tired eyes. Above the gate, the bell rings once. Everyone inside hears it. No one looks relieved.',btn:'Enter Ashmere',shot:'town'}
  ];

  function show(index=0){
    const p = load(); if(!p) return;
    active = true;
    let el = document.getElementById(ID);
    if(!el){el=document.createElement('div');el.id=ID;document.body.appendChild(el);}
    const s = scenes[index];
    const last = index >= scenes.length-1;
    el.innerHTML = `<div class="v086-intro-wrap shot-${s.shot}"><div class="v086-intro-world"><div class="moon"></div><div class="cloud c1"></div><div class="cloud c2"></div><div class="hills back"></div><div class="hills front"></div><div class="road"></div><div class="town"><i></i><i></i><i></i><b></b></div><div class="traveler"></div><div class="lantern"></div><div class="rain"></div></div><section class="v086-intro-box"><div class="v086-intro-progress"><span style="width:${((index+1)/scenes.length)*100}%"></span></div><div class="v080-kicker">${esc(s.k)}</div><h1>${esc(s.t)}</h1><p>${esc(s.body)}</p>${s.choice?choiceHTML(index):`<div class="v086-intro-actions"><button class="btn primary" id="introSceneNext">${esc(s.btn)}</button>${!last?'<button class="btn" id="introSceneSkip">Skip Intro</button>':''}</div>`}</section></div>`;
    if(s.choice) wireChoice(index);
    else {
      document.getElementById('introSceneNext').onclick = () => last ? finish() : show(index+1);
      const skip = document.getElementById('introSceneSkip');
      if(skip) skip.onclick = finish;
    }
  }

  function choiceHTML(index){
    return `<div class="v086-choice-row"><button class="v086-choice" data-choice="steady"><strong>Steady Yourself</strong><span>Begin Ashmere with a little more focus.</span></button><button class="v086-choice" data-choice="hurry"><strong>Keep Moving</strong><span>Begin with urgency. The road feels closer behind you.</span></button></div><div class="v086-intro-actions"><button class="btn" id="introSceneSkip">Skip Intro</button></div>`;
  }

  function wireChoice(index){
    document.querySelectorAll('[data-choice]').forEach(btn=>{
      btn.onclick = () => {
        const p = load();
        if(p){
          p.flags = p.flags || {};
          p.flags.introChoiceV086 = btn.dataset.choice;
          if(btn.dataset.choice === 'steady') p.focus = Number(p.focus||0)+1;
          else p.momentum = Number(p.momentum||0)+1;
          save(p);
        }
        show(index+1);
      };
    });
    document.getElementById('introSceneSkip').onclick = finish;
  }

  function finish(){
    const p = load();
    if(p){
      p.flags = p.flags || {};
      p.flags.introSequenceV086 = true;
      if(!Array.isArray(p.memories)) p.memories = [];
      const memory = 'You remember the wet road to Ashmere, the lantern that flared once, and the bell that rang when you reached the gate.';
      if(!p.memories.includes(memory)) p.memories.push(memory);
      save(p);
    }
    localStorage.setItem(KEY,'true');
    active = false;
    document.getElementById(ID)?.remove();
    const enter = [...document.querySelectorAll('button')].find(b => /Enter Ashmere/i.test(b.textContent || ''));
    if(enter) enter.click();
  }

  function shouldStart(){
    if(active || localStorage.getItem(KEY)==='true') return false;
    const p = load(); if(!p || p.flags?.introSequenceV086) return false;
    const h2 = [...document.querySelectorAll('h2')].find(x => x.textContent.trim() === 'The Road to Ashmere');
    return !!h2 && /Enter Ashmere/i.test(document.body.innerText || '');
  }

  function styles(){
    if(document.getElementById('introSceneV086Styles')) return;
    const css = document.createElement('style');
    css.id = 'introSceneV086Styles';
    css.textContent = `#legendIntroSceneV086{position:fixed;inset:0;z-index:10080}.v086-intro-wrap{min-height:100svh;position:relative;overflow:hidden;background:linear-gradient(180deg,#111f18,#030605);color:#eaffef;display:grid;place-items:end center;padding:18px}.v086-intro-world{position:absolute;inset:0;overflow:hidden}.v086-intro-world .moon{position:absolute;right:14%;top:9%;width:70px;height:70px;border-radius:50%;background:#ffe8ad;box-shadow:0 0 44px rgba(255,211,105,.45)}.cloud{position:absolute;width:260px;height:56px;border-radius:999px;background:rgba(217,239,225,.06);filter:blur(1px);animation:cloud 18s linear infinite}.c1{top:13%;left:-18%}.c2{top:24%;left:-30%;animation-duration:26s;opacity:.7}.hills{position:absolute;left:-5%;right:-5%;height:34%;bottom:16%;background:linear-gradient(180deg,#162b21,#07100c);clip-path:polygon(0 70%,12% 42%,25% 62%,38% 28%,52% 66%,70% 36%,86% 58%,100% 34%,100% 100%,0 100%)}.hills.front{bottom:6%;opacity:.82;transform:scaleX(1.1)}.road{position:absolute;left:38%;right:38%;bottom:-10%;height:55%;background:linear-gradient(90deg,transparent,rgba(255,211,105,.22),transparent);clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);animation:roadPulse 2.8s ease-in-out infinite alternate}.town{position:absolute;right:12%;bottom:18%;width:230px;height:110px;opacity:.0;transition:.6s}.shot-town .town{opacity:1}.town i{position:absolute;bottom:0;width:46px;background:#0d1a14;border:1px solid rgba(255,211,105,.16);box-shadow:0 0 20px rgba(255,211,105,.05)}.town i:nth-child(1){left:0;height:54px}.town i:nth-child(2){left:52px;height:82px}.town i:nth-child(3){left:106px;height:58px}.town b{position:absolute;left:78px;bottom:78px;width:38px;height:42px;background:#101f17;clip-path:polygon(50% 0,100% 100%,0 100%)}.traveler{position:absolute;left:48%;bottom:13%;width:18px;height:46px;border-radius:12px 12px 4px 4px;background:#0b0f0c;border:1px solid rgba(255,211,105,.25);box-shadow:0 0 16px rgba(255,211,105,.08);animation:traveler 2.4s ease-in-out infinite alternate}.lantern{position:absolute;left:54%;bottom:23%;width:7px;height:72px;background:#2b2312;opacity:.65}.shot-lantern .lantern:after,.shot-town .lantern:after{content:'';position:absolute;top:-10px;left:-9px;width:25px;height:25px;border-radius:50%;background:#ffd369;box-shadow:0 0 38px rgba(255,211,105,.9);animation:lantern 1.2s ease-in-out infinite alternate}.rain{position:absolute;inset:-20%;background-image:linear-gradient(120deg,rgba(255,255,255,.09) 0 1px,transparent 1px 22px);background-size:40px 40px;animation:rain 1.4s linear infinite;opacity:.20}.v086-intro-box{position:relative;width:min(980px,100%);border:1px solid rgba(255,211,105,.36);border-radius:28px;background:linear-gradient(180deg,rgba(18,34,26,.94),rgba(4,8,6,.97));box-shadow:0 30px 100px rgba(0,0,0,.72),0 0 54px rgba(125,255,173,.08);padding:clamp(20px,4vw,44px);margin-bottom:clamp(8px,4vh,34px);backdrop-filter:blur(8px)}.v086-intro-progress{height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin-bottom:20px}.v086-intro-progress span{display:block;height:100%;background:linear-gradient(90deg,#ffd369,#7dffad);transition:width .3s ease}.v086-intro-box h1{margin:0;color:#7dffad;font-size:clamp(2.1rem,6.5vw,5rem);line-height:.98}.v086-intro-box p{color:#f1ead1;line-height:1.7;font-size:clamp(1rem,2vw,1.16rem);max-width:780px}.v086-intro-actions{display:flex;gap:10px;flex-wrap:wrap}.v086-choice-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:18px 0}.v086-choice{border:1px solid rgba(255,211,105,.26);border-radius:18px;background:rgba(255,211,105,.07);color:#eaffef;text-align:left;padding:14px;cursor:pointer}.v086-choice:hover{border-color:rgba(255,211,105,.6);transform:translateY(-2px)}.v086-choice strong{display:block;color:#ffd369;font-size:1.05rem}.v086-choice span{display:block;color:#d9efe1;margin-top:5px;line-height:1.35}@keyframes rain{to{transform:translateY(40px)}}@keyframes cloud{to{transform:translateX(160vw)}}@keyframes roadPulse{from{opacity:.55}to{opacity:.95}}@keyframes traveler{from{transform:translateY(0)}to{transform:translateY(-3px)}}@keyframes lantern{from{opacity:.65;transform:scale(.9)}to{opacity:1;transform:scale(1.12)}}@media(max-width:720px){.v086-intro-wrap{padding:10px;place-items:end center}.v086-intro-box{border-radius:20px;padding:18px}.v086-choice-row{grid-template-columns:1fr}.v086-intro-actions{display:grid}.v086-intro-actions .btn{width:100%}.town{right:-20px;transform:scale(.7);transform-origin:right bottom}}`;
    document.head.appendChild(css);
  }

  function tick(){styles(); if(shouldStart()) show(0);}
  const rt = RT();
  if(rt?.onRender) rt.onRender(tick);
  else if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
})();
