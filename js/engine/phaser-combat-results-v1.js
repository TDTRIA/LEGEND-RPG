/* Combat debrief presentation only. Production combat and result callbacks
 * retain reward settlement, progression, navigation and persistence. */
(() => {
  function create(scene) {
    let host = null, container = null, signature = '', pending = null, retry = null;
    let labels = [], keys = [], tagged = [], failure = '', clip = null;
    const copySelector = [
      '.v152-results-heading > *', '.v152-results-foe > div > *', '.v152-results-hero > div > *',
      '.v152-results-divider > span', '.v152-results-section-head > *', '.v152-results-metrics > div > *',
      '.v152-result-reward > span', '.v152-result-reward > div > *', '.v152-result-small-reward > *',
      '.v152-result-level-note > span', '.v152-result-level-note > div > *', '.v152-result-action > span > *', '.v152-result-action > b'
    ].join(',');
    const panelSelector = '.v152-results-heading,.v152-results-duel,.v152-results-rewards,.v152-results-metrics > div,.v152-result-reward,.v152-result-level-note';
    function clear() {
      if (host) delete host.dataset.legendPhaserCombatResults;
      tagged.forEach(node => node.removeAttribute('data-phaser-combat-result-copy'));
      container?.destroy(true);
      keys.forEach(key => { if (scene.textures.exists(key)) scene.textures.remove(key); });
      host = container = null; signature = ''; labels = []; keys = []; tagged = []; clip = null;
    }
    function sync() {
      const source = document.querySelector('#root .v152-combat-results');
      if (!source || source.closest('[hidden]')) { clear(); return; }
      const hud = document.querySelector('#legend-world-shell-root:not([hidden]) .lws-hud');
      if (hud) {
        const height = Math.ceil(hud.getBoundingClientRect().height) + 'px';
        if (source.style.getPropertyValue('--legend-combat-result-hud-height') !== height) source.style.setProperty('--legend-combat-result-hud-height', height);
      }
      const texts = [...source.querySelectorAll(copySelector)].filter(node => node.getBoundingClientRect().width && node.getBoundingClientRect().height);
      const controls = [...source.querySelectorAll('button')], art = [...source.querySelectorAll('img')];
      const victory = source.classList.contains('is-victory');
      const expected = victory ? ['v152CombatContinue','v152CombatReturn'] : ['v152CombatReturn','v152CombatSecondary'];
      const secondary = source.dataset.resultSecondary;
      const complete = ['true','false'].includes(secondary) && controls.length === (secondary === 'true' ? 2 : 1) && controls[0].id === expected[0] &&
        controls.every(node => expected.includes(node.id)) && new Set(controls.map(n => n.id)).size === controls.length &&
        source.querySelectorAll('.v152-results-metrics > div').length === 3 &&
        [...source.querySelectorAll('.v152-results-metrics > div')].every(node => node.querySelector('span') && node.querySelector('strong') && node.querySelector('small')) &&
        source.querySelector('.v152-result-reward > div > strong') && source.querySelector('.v152-result-reward > div > small') &&
        source.querySelector('.v152-results-heading > p') && source.querySelector('.v152-results-kicker') &&
        controls.every(node => node.querySelector('strong') && node.querySelector('small')) &&
        source.querySelector('.v152-results-heading h1') && art.length === 3 && art.every(node => node.complete && node.naturalWidth);
      const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
      let missing = false, textNode;
      while ((textNode = walker.nextNode())) {
        if (!textNode.textContent.trim()) continue;
        const owner = textNode.parentElement, box = owner.getBoundingClientRect();
        if (box.width && box.height && !texts.some(node => node.contains(owner))) { missing = true; break; }
      }
      if (!complete || missing || texts.some(node => !node.textContent.trim())) { failure = 'Combat result source or artwork incomplete'; clear(); return; }
      if (scene.hasFiniteEntranceAnimation(source)) {
        clear(); clearTimeout(retry); retry = setTimeout(() => { retry = null; sync(); },240); return;
      }
      const canvas = scene.game.canvas.getBoundingClientRect(), size = scene.dimensions();
      if (!canvas.width || !canvas.height) { clear(); return; }
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => { const b = node.getBoundingClientRect(); return { x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy }; };
      const bounds = scene.expeditionUiClipBounds();
      const next = JSON.stringify([bounds, ...[source,...texts,...controls,...art].map(node =>
        [rect(node),node.textContent,node.currentSrc,node.disabled,node===document.activeElement,node.matches(':hover')])]);
      if (host === source && signature === next) return;
      clear();
      try {
        container = scene.add.container(0,0).setDepth(54);
        if (!scene.clipExpeditionUi(container,bounds)) throw new Error('Combat result viewport unavailable');
        clip = bounds;
        const add = object => { container.add(object); return object; };
        const paintArt = (node,index) => {
          const box=rect(node), bitmap=document.createElement('canvas'), css=getComputedStyle(node);
          bitmap.width=Math.max(1,Math.ceil(box.width*2)); bitmap.height=Math.max(1,Math.ceil(box.height*2));
          const position=css.objectPosition.split(' ').map(value=>({left:0,top:0,center:0.5,right:1,bottom:1}[value] ?? parseFloat(value)/100));
          if(position.length!==2 || position.some(value=>!Number.isFinite(value))) throw new Error('Combat result art position unavailable');
          const scale=(css.objectFit==='contain'?Math.min:Math.max)(bitmap.width/node.naturalWidth,bitmap.height/node.naturalHeight);
          bitmap.getContext('2d').drawImage(node,(bitmap.width-node.naturalWidth*scale)*position[0],
            (bitmap.height-node.naturalHeight*scale)*position[1],node.naturalWidth*scale,node.naturalHeight*scale);
          const key='legend-native-combat-result-art-'+index; keys.push(key); scene.textures.addCanvas(key,bitmap);
          add(scene.add.image(box.x,box.y,key).setOrigin(0).setDisplaySize(box.width,box.height));
        };
        paintArt(art[0],0);
        const graphics = add(scene.add.graphics());
        const panel = (node,focused=false) => {
          const b=rect(node); graphics.fillStyle(focused?0x30402a:0x101a12,0.96).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,focused?1:0.55).strokeRect(b.x,b.y,b.width,b.height);
        };
        source.querySelectorAll(panelSelector).forEach(node=>panel(node));
        controls.forEach(node=>panel(node,node===document.activeElement||node.matches(':hover')));
        art.slice(1).forEach((node,index)=>paintArt(node,index+1));
        texts.forEach(node=>{
          const label=scene.createShellLabel(node,rect(node),node.matches('h1,strong,b')?'#f7ebcd':'#e4dfc9',sx,sy,54);
          if(!label) throw new Error('Combat result copy cannot fit: '+node.tagName+' '+node.textContent.trim());
          add(label); labels.push(label);
        });
        host=source;signature=next;tagged=texts;failure='';
        texts.forEach(node=>node.setAttribute('data-phaser-combat-result-copy','true'));
        source.dataset.legendPhaserCombatResults='true';
      } catch(error) { failure=error.message;clear(); }
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const events=['scroll','focusin','focusout','pointerover','pointerout','load','error'];
    events.forEach(name=>document.addEventListener(name,schedule,true));
    window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    const observer=new MutationObserver(schedule),root=document.getElementById('root');
    if(root)observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden','src']});
    function destroy(){if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();
      events.forEach(name=>document.removeEventListener(name,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();}
    scene.events.once('shutdown',destroy);schedule();
    return {sync,destroy,snapshot:()=>({active:Boolean(host),failure,clip,labels:scene.shellLabelSnapshot(labels),
      focused:host?.querySelector(':focus')?.id||'',controls:host?[...host.querySelectorAll('button')].map(n=>n.id):[],
      art:host?[...host.querySelectorAll('img')].map(n=>n.getAttribute('src')):[]})};
  }
  window.LegendPhaserCombatResultsV1=Object.freeze({create});
})();
