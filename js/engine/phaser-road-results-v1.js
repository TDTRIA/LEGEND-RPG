/* Dedicated Old Road result presentation. Settlement, reports and return policy
 * remain in the production road result service/view and semantic controls. */
(() => {
  function create(scene) {
    let painted = null, container = null, signature = '', pending = null, retry = null;
    let tagged = [], labels = [], artKeys = [], failure = '', clip = null;
    const copySelector = [
      '.exp100-scene-label', '#exp100-sound', '.exp100-kicker', '.exp100-head h1', '.exp100-head > p',
      '.exp100-bars > div > span', '.exp100-bars > div > strong',
      '.v152-expedition-banner-copy > *', '.v152-expedition-metrics > div > *',
      '.v152-expedition-reward-tile > span', '.v152-expedition-reward-tile > div > *',
      '.v152-expedition-xp > div:first-child > *', '.v152-expedition-growth > span',
      '.exp150-return-report-head > *', '.exp150-return-report-route > *',
      '.exp150-return-report-columns h3 > *', '.exp150-return-report-columns li > *',
      '.exp150-return-report-foot > *', '.exp100-outcome .exp100-route > *',
      '.exp100-outcome button > *'
    ].join(',');
    const panelSelector = '.exp100-head,.v152-expedition-summary,.v152-expedition-metrics > div,' +
      '.v152-expedition-reward-tile,.v152-expedition-xp,.v152-expedition-growth,' +
      '.exp150-return-report,.exp150-return-report-columns li,.exp100-outcome';
    function clear() {
      if (painted) delete painted.dataset.legendPhaserRoadResults;
      tagged.forEach(node => node.removeAttribute('data-phaser-result-copy'));
      container?.destroy(true);
      artKeys.forEach(key => { if (scene.textures.exists(key)) scene.textures.remove(key); });
      painted = container = null; signature = ''; tagged = []; labels = []; artKeys = []; clip = null;
    }
    function sync() {
      const host = document.querySelector('#root .exp100:has(.exp100-outcome)');
      if (!host || host.closest('[hidden]')) { clear(); return; }
      const hud = document.querySelector('#legend-world-shell-root:not([hidden]) .lws-hud');
      if (hud) {
        const height = Math.ceil(hud.getBoundingClientRect().height) + 'px';
        if (host.style.getPropertyValue('--legend-result-hud-height') !== height) host.style.setProperty('--legend-result-hud-height', height);
      }
      const header = host.querySelector('.exp100-head'), report = host.querySelector('.exp150-return-report');
      const summary = host.querySelector('.v152-expedition-summary');
      const back = host.querySelector('#outcomeReturn'), mara = host.querySelector('#outcomeReportToMara');
      const sound = host.querySelector('#exp100-sound');
      const controls = [sound, back, mara].filter(Boolean);
      const texts = [...host.querySelectorAll(copySelector)].filter(node => node.getBoundingClientRect().width && node.getBoundingClientRect().height);
      const art = [...host.querySelectorAll('.exp100-scene > img,.v152-expedition-banner > img,.v152-expedition-reward-art')];
      const complete = header && report && back && sound && header.querySelectorAll('.exp100-bars > div').length === 3 &&
        host.querySelectorAll('button').length === controls.length && host.querySelectorAll('img').length === art.length &&
        report.querySelectorAll('.exp150-return-report-columns h3 > span').length === 2 &&
        (!summary || (summary.querySelectorAll('.v152-expedition-metrics > div').length === 3 &&
          summary.querySelectorAll('.v152-expedition-reward-tile').length === 3));
      // A newly added visible field must be covered before its source is hidden.
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      let unpainted = false, textNode;
      while ((textNode = walker.nextNode())) {
        if (!textNode.textContent.trim()) continue;
        const owner = textNode.parentElement;
        if (owner.getBoundingClientRect().width && owner.getBoundingClientRect().height &&
            !texts.some(node => node.contains(owner))) { unpainted = true; break; }
      }
      if (!complete || unpainted || texts.some(node => !node.textContent.trim()) ||
          art.length !== (summary ? 3 : 1) || art.some(node => !node.complete || !node.naturalWidth)) {
        failure = 'Result source or artwork incomplete'; clear(); return;
      }
      if (scene.hasFiniteEntranceAnimation(host)) {
        clear(); window.clearTimeout(retry); retry = window.setTimeout(() => { retry = null; sync(); }, 240); return;
      }
      const canvas = scene.game.canvas.getBoundingClientRect(), size = scene.dimensions();
      if (!canvas.width || !canvas.height) { clear(); return; }
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => { const b = node.getBoundingClientRect(); return { x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy }; };
      const bounds = scene.expeditionUiClipBounds();
      const meters = [...host.querySelectorAll('.exp100-bars i,.v152-expedition-xp-track')];
      if (meters.length !== (summary ? 4 : 3) || meters.some(node => !node.firstElementChild)) {
        failure = 'Result meter source incomplete'; clear(); return;
      }
      const next = JSON.stringify([bounds, ...[host,...texts,...controls,...art,...meters,...meters.map(n=>n.firstElementChild)].map(node =>
        [rect(node),node.textContent,node.currentSrc,node.disabled,node===document.activeElement,node.matches(':hover')])]);
      if (painted === host && signature === next) return;
      clear();
      try {
        container = scene.add.container(0,0).setDepth(54);
        if (!scene.clipExpeditionUi(container,bounds)) throw new Error('Result viewport unavailable');
        clip = bounds;
        const add = object => { container.add(object); return object; };
        const graphics = add(scene.add.graphics());
        const panel = (node,color=0x132016,alpha=0.96,focused=false) => {
          const b=rect(node); graphics.fillStyle(color,alpha).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,focused?1:0.55).strokeRect(b.x,b.y,b.width,b.height);
        };
        host.querySelectorAll(panelSelector).forEach(node => panel(node));
        art.forEach((node,index) => {
          const box=rect(node), bitmap=document.createElement('canvas'), css=getComputedStyle(node);
          bitmap.width=Math.max(1,Math.ceil(box.width*2)); bitmap.height=Math.max(1,Math.ceil(box.height*2));
          const position=css.objectPosition.split(' ').map(value=>parseFloat(value)/100);
          if(position.length!==2 || position.some(value=>!Number.isFinite(value))) throw new Error('Result art position unavailable');
          const scale=(css.objectFit==='contain'?Math.min:Math.max)(bitmap.width/node.naturalWidth,bitmap.height/node.naturalHeight);
          bitmap.getContext('2d').drawImage(node,(bitmap.width-node.naturalWidth*scale)*position[0],
            (bitmap.height-node.naturalHeight*scale)*position[1],node.naturalWidth*scale,node.naturalHeight*scale);
          const key='legend-native-result-art-'+index; artKeys.push(key); scene.textures.addCanvas(key,bitmap);
          add(scene.add.image(box.x,box.y,key).setOrigin(0).setDisplaySize(box.width,box.height));
        });
        const foreground=add(scene.add.graphics());
        host.querySelectorAll('.exp100-scene,.v152-expedition-banner').forEach(node=>{
          const b=rect(node); foreground.fillStyle(0x040a06,node.classList.contains('v152-expedition-banner')?0.55:0.08).fillRect(b.x,b.y,b.width,b.height);
        });
        const surface=(node,focus=false)=>{const b=rect(node); foreground.fillStyle(focus?0x30402a:0x0c180f,0.97).fillRect(b.x,b.y,b.width,b.height);
          foreground.lineStyle(focus?2:1,focus?0xffe6a0:0xc7b07b,0.8).strokeRect(b.x,b.y,b.width,b.height);};
        surface(host.querySelector('.exp100-scene-label'));
        controls.forEach(node=>surface(node,node===document.activeElement||node.matches(':hover')));
        meters.forEach(node=>{const track=rect(node),fill=rect(node.firstElementChild);foreground.fillStyle(0x293222).fillRect(track.x,track.y,track.width,track.height);
          foreground.fillStyle(0xb7bc76).fillRect(fill.x,fill.y,Math.min(fill.width,track.width),fill.height);});
        texts.forEach(node=>{
          const label=scene.createShellLabel(node,rect(node),node.matches('h1,h2,strong,b')?'#f7ebcd':'#e4dfc9',sx,sy,54);
          if(!label) throw new Error('Result copy cannot fit: '+node.tagName+' '+node.textContent.trim());
          add(label);labels.push(label);
        });
        painted=host;signature=next;tagged=texts;failure='';
        texts.forEach(node=>node.setAttribute('data-phaser-result-copy','true'));
        host.dataset.legendPhaserRoadResults='true';
      } catch(error) { failure=error.message;clear(); }
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const events=['scroll','focusin','focusout','pointerover','pointerout','load','error'];
    events.forEach(name=>document.addEventListener(name,schedule,true));
    window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    const observer=new MutationObserver(schedule),root=document.getElementById('root');
    if(root)observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden','src']});
    function destroy(){if(pending!==null)cancelAnimationFrame(pending);window.clearTimeout(retry);observer.disconnect();
      events.forEach(name=>document.removeEventListener(name,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();}
    scene.events.once('shutdown',destroy);schedule();
    return {sync,destroy,snapshot:()=>({active:Boolean(painted),failure,clip,labels:scene.shellLabelSnapshot(labels),
      focused:painted?.querySelector(':focus')?.id||'',art:painted?[...painted.querySelectorAll('img')].map(n=>n.getAttribute('src')):[]})};
  }
  window.LegendPhaserRoadResultsV1=Object.freeze({create});
})();
