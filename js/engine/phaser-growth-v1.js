/* Native growth dialog presentation. Allocation, confirmation and persistence
 * stay in LegendLevelUpV152 and its original semantic controls. */
(() => {
  function create(scene) {
    let source=null, frame=null, body=null, tagged=[], labels=[], keys=[], signature='', failure='', clip=null;
    let pending=null, retry=null;
    const copySelector = '.v152-levelup-rule > span:nth-child(2),.v152-levelup-kicker,.v152-levelup-hero h2,.v152-levelup-story,'+
      '.v152-levelup-level-line > *,.v152-growth-pointbar > div:first-child > span,.v152-growth-pointbar strong,.v152-growth-pointbar > p,'+
      '.v152-growth-monogram,.v152-growth-card h3,.v152-growth-card-head p,[data-attr-value],.v152-growth-effect,'+
      '.v152-growth-controls > span,.v152-growth-controls > button,.v152-growth-footer > p,#v152-growth-confirm > span';
    function clear(){
      if(source)delete source.dataset.phaserGrowth;
      tagged.forEach(node=>node.removeAttribute('data-growth-copy'));
      frame?.destroy(true);body?.destroy(true);
      keys.forEach(key=>{if(scene.textures.exists(key))scene.textures.remove(key);});
      source=frame=body=null;tagged=[];labels=[];keys=[];signature='';clip=null;
    }
    function sync(){
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const overlay=document.getElementById('legendLevelUpOverlay'),panel=overlay?.querySelector('.v152-levelup-panel');
      if(!overlay||!panel){clear();return;}
      const attributes=Object.keys(window.LegendLevelUpV152?.attributes||{}),cards=[...panel.querySelectorAll('[data-growth-card]')];
      const controls=[...panel.querySelectorAll('button')],art=[...overlay.querySelectorAll('img')];
      const texts=[...panel.querySelectorAll(copySelector)];
      const meter=panel.querySelector('.v152-growth-point-track'),fill=meter?.querySelector('#v152-growth-point-fill');
      const complete=attributes.length===6&&cards.length===attributes.length&&controls.length===13&&
        attributes.every(key=>cards.filter(card=>card.dataset.growthCard===key).length===1&&
          panel.querySelectorAll('[data-attr-add="'+key+'"]').length===1&&panel.querySelectorAll('[data-attr-minus="'+key+'"]').length===1&&
          panel.querySelector('[data-attr-value="'+key+'"]')&&panel.querySelector('[data-allocation="'+key+'"]'))&&
        cards.every(card=>card.querySelector('h3')&&card.querySelector('.v152-growth-effect')&&card.querySelector('.v152-growth-card-head p'))&&
        panel.querySelector('#v152-growth-confirm')&&panel.querySelector('#v152-levelup-title')&&
        panel.querySelector('#v152-growth-spent')&&panel.querySelector('#v152-growth-total')&&fill&&
        art.length===2&&art.every(node=>node.complete&&node.naturalWidth)&&texts.every(node=>node.textContent.trim());
      const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();
        if(b.width&&b.height&&!texts.some(text=>text.contains(owner))){missing=true;break;}}
      if(!complete||missing){failure='Growth source or artwork incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(panel)){clear();clearTimeout(retry);retry=setTimeout(()=>{retry=null;sync();},220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();
      if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=node=>{const b=node.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const box=rect(panel),bounds={x:box.x+panel.clientLeft*sx,y:box.y+panel.clientTop*sy,width:panel.clientWidth*sx,height:panel.clientHeight*sy};
      const next=JSON.stringify([size,bounds,...[panel,...cards,...texts,...controls,...art,meter,fill].map(node=>
        [rect(node),node.textContent,node.currentSrc,node.disabled,node===document.activeElement,node.matches(':hover')])]);
      if(source===overlay&&signature===next)return;
      clear();
      try{
        frame=scene.add.container(0,0).setDepth(220);body=scene.add.container(0,0).setDepth(221);
        if(!scene.clipExpeditionUi(body,bounds))throw new Error('Growth viewport unavailable');clip=bounds;
        const paintArt=(node,index,container)=>{
          const b=rect(node),css=getComputedStyle(node),bitmap=document.createElement('canvas');
          bitmap.width=Math.max(1,Math.ceil(b.width*2));bitmap.height=Math.max(1,Math.ceil(b.height*2));
          const position=css.objectPosition.split(' ').map(value=>({left:0,top:0,center:.5,right:1,bottom:1}[value]??parseFloat(value)/100));
          if(position.length!==2||position.some(value=>!Number.isFinite(value)))throw new Error('Growth artwork position unavailable');
          const scale=Math.max(bitmap.width/node.naturalWidth,bitmap.height/node.naturalHeight);
          bitmap.getContext('2d').drawImage(node,(bitmap.width-node.naturalWidth*scale)*position[0],(bitmap.height-node.naturalHeight*scale)*position[1],node.naturalWidth*scale,node.naturalHeight*scale);
          const key='legend-native-growth-art-'+index;keys.push(key);scene.textures.addCanvas(key,bitmap);
          container.add(scene.add.image(b.x,b.y,key).setOrigin(0).setDisplaySize(b.width,b.height));
        };
        paintArt(art[0],0,frame);
        const framePaint=scene.add.graphics();frame.add(framePaint);
        framePaint.fillStyle(0x101a12,.97).fillRect(box.x,box.y,box.width,box.height);
        framePaint.lineStyle(1,0xb49d69,.8).strokeRect(box.x,box.y,box.width,box.height);
        const graphics=scene.add.graphics();body.add(graphics);
        panel.querySelectorAll('.v152-growth-pointbar,.v152-growth-card,.v152-growth-monogram').forEach(node=>{
          const b=rect(node);graphics.fillStyle(node.classList.contains('has-growth')?0x28351f:0x172318,1).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(1,0xb49d69,.6).strokeRect(b.x,b.y,b.width,b.height);
        });
        controls.forEach(node=>{const b=rect(node),focused=node===document.activeElement,disabled=node.disabled;
          graphics.fillStyle(disabled?0x252c24:focused?0x3b4b2b:0x293b27,1).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(focused?2:1,focused?0xffe6a0:disabled?0x57644e:0xc7af73,1).strokeRect(b.x,b.y,b.width,b.height);
        });
        const track=rect(meter),value=rect(fill);graphics.fillStyle(0x080f09).fillRect(track.x,track.y,track.width,track.height);
        graphics.fillStyle(0xd5bd7c).fillRect(value.x,value.y,value.width,value.height);
        paintArt(art[1],1,body);
        texts.forEach(node=>{const disabled=!!node.closest('button:disabled'),label=scene.createShellLabel(node,rect(node),disabled?'#9ba595':'#eee5cd',sx,sy,221);
          if(!label)throw new Error('Growth copy cannot fit: '+node.textContent.trim());
          if(node.classList.contains('v152-growth-monogram')){const b=rect(node);label.x=b.x+(b.width-label.displayWidth)/2;label.y=b.y+(b.height-label.displayHeight)/2;}
          body.add(label);labels.push(label);});
        source=overlay;tagged=texts;signature=next;failure='';texts.forEach(node=>node.setAttribute('data-growth-copy','true'));overlay.dataset.phaserGrowth='true';
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const events=['scroll','focusin','focusout','pointerover','pointerout','load','error'];events.forEach(type=>document.addEventListener(type,schedule,true));
    window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','src','hidden']});
    function destroy(){if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();}
    scene.events.once('shutdown',destroy);schedule();
    return{sync,destroy,snapshot:()=>({active:!!source,failure,clip,labels:scene.shellLabelSnapshot(labels),
      focused:source?.querySelector(':focus')?.getAttribute('aria-label')||source?.querySelector(':focus')?.id||'',
      controls:source?[...source.querySelectorAll('button')].map(n=>({label:n.getAttribute('aria-label')||n.id,disabled:n.disabled})):[],
      art:source?[...source.querySelectorAll('img')].map(n=>n.getAttribute('src')):[]})};
  }
  window.LegendPhaserGrowthV1=Object.freeze({create});
})();
