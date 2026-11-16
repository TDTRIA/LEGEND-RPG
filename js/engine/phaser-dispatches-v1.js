/* Dedicated News & Roadmap presentation; production anchors and callbacks stay semantic. */
(() => {
  const copySelector='.dispatches-v140-kicker,h1,h2,h3,.dispatches-v140-header p,.dispatches-v140-feature p,.dispatches-v140-card p,.dispatches-v140-card-meta span,.dispatches-v140-card-meta small,.dispatches-v140-section-heading > small,.dispatches-v140-footer > span,button,a';
  function create(scene){
    let host=null,objects=[],labels=[],tagged=[],signature='',pending=null,retry=null,failure='',art=null,controls=[],paintedTexture=null;
    function clear(){if(host)delete host.dataset.phaserDispatches;tagged.forEach(n=>n.removeAttribute('data-dispatch-copy'));objects.forEach(n=>n.destroy(true));host=null;objects=[];labels=[];tagged=[];signature='';art=null;controls=[];paintedTexture=null;}
    function sync(){
      const source=document.querySelector('#root .dispatches-v140');if(!source){clear();return;}
      const texts=[...source.querySelectorAll(copySelector)],buttons=[...source.querySelectorAll('button,a')],cards=[...source.querySelectorAll('.dispatches-v140-card')],sections=[...source.querySelectorAll('.dispatches-v140-section')];
      const image=source.querySelector('.dispatches-v140-feature-mark img');
      const required=['.dispatches-v140-header h1','.dispatches-v140-header p','.dispatches-v140-feature h2','.dispatches-v140-feature p','#dispatchNewsTitle','#dispatchRoadmapTitle'];
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();if(b.width&&b.height&&!texts.some(n=>n.contains(owner))){missing=true;break;}}
      if(missing||texts.some(n=>!n.textContent.trim())||required.some(s=>!source.querySelector(s)?.textContent.trim())||buttons.length!==4||source.querySelectorAll('button,a,input,select,textarea').length!==4||source.querySelectorAll('img').length!==1||!source.querySelector('#dispatchesBack')||source.querySelectorAll('a[href]').length!==3||sections.length!==2||sections.some(n=>!n.querySelector('.dispatches-v140-card'))||cards.some(n=>!['h3','p','.dispatches-v140-card-meta span','.dispatches-v140-card-meta small'].every(s=>n.querySelector(s)?.textContent.trim()))||source.querySelectorAll('.dispatches-v140-footer > span').length!==2||!image?.complete||!image.naturalWidth||!image.getAttribute('src')?.endsWith('/service-milestone.webp')||!scene.textures.exists('serviceMilestoneIcon')){failure='Dispatch source or artwork incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(source)){clear();clearTimeout(retry);retry=setTimeout(sync,220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const contrast=document.body.classList.contains('a11y-high-contrast');
      const next=JSON.stringify([size,contrast,rect(image),...[...texts,...cards].map(n=>[rect(n),n.textContent,n===document.activeElement,getComputedStyle(n).fontFamily,getComputedStyle(n).fontSize,getComputedStyle(n).fontWeight])]);
      const texture=scene.textures.get('serviceMilestoneIcon');
      if(host===source&&paintedTexture===texture&&signature===next&&texts.length===tagged.length&&texts.every((n,i)=>n===tagged[i]))return;clear();
      try{
        const body=scene.add.container(0,0).setDepth(36);objects.push(body);if(!scene.clipExpeditionUi(body,{x:0,y:0,width:size.width,height:size.height}))throw new Error('Dispatch viewport unavailable');
        const panel=(n,focused=false)=>{const b=rect(n);if(!b.width||!b.height)throw new Error('Dispatch geometry unavailable');const g=scene.add.graphics();body.add(g);g.fillStyle(focused?0x35402c:contrast?0x050805:0x101a12,.97).fillRect(b.x,b.y,b.width,b.height);g.lineStyle(focused?2:1,focused?0xffe6a0:contrast?0xf8efc7:0xb49d69,.85).strokeRect(b.x,b.y,b.width,b.height);};
        source.querySelectorAll('.dispatches-v140-header,.dispatches-v140-feature,.dispatches-v140-section-heading,.dispatches-v140-card,.dispatches-v140-footer').forEach(n=>panel(n));
        buttons.forEach(n=>{const focused=n===document.activeElement;panel(n,focused);controls.push({text:n.textContent.trim(),href:n.getAttribute('href'),focused,rect:rect(n)});});
        const b=rect(image);if(b.width&&b.height){const texture=scene.textures.get('serviceMilestoneIcon').getSourceImage(),scale=Math.min(b.width/texture.width,b.height/texture.height);const icon=scene.add.image(b.x+b.width/2,b.y+b.height/2,'serviceMilestoneIcon').setScale(scale);body.add(icon);art={key:'serviceMilestoneIcon',rect:b};}
        texts.forEach(n=>{const label=scene.createShellLabel(n,rect(n),contrast?'#ffffff':'#f2ead5',sx,sy,37);if(!label)throw new Error('Dispatch copy cannot fit: '+n.textContent.trim());body.add(label);labels.push(label);});
        host=source;paintedTexture=texture;signature=next;tagged=texts;failure='';source.dataset.phaserDispatches='true';texts.forEach(n=>n.dataset.dispatchCopy='true');
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const textureRemoved=key=>{if(key==='serviceMilestoneIcon'){failure='Dispatch source or artwork incomplete';clear();schedule();}};
    const textureAdded=key=>{if(key==='serviceMilestoneIcon')schedule();};
    scene.textures.on(Phaser.Textures.Events.ADD,textureAdded);scene.textures.on(Phaser.Textures.Events.REMOVE,textureRemoved);
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','src','href']});
    const events=['scroll','focusin','focusout','load','error'];events.forEach(type=>document.addEventListener(type,schedule,true));window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    scene.events.once('shutdown',()=>{if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();scene.textures.off(Phaser.Textures.Events.ADD,textureAdded);scene.textures.off(Phaser.Textures.Events.REMOVE,textureRemoved);events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();});
    schedule();return{sync,snapshot:()=>({active:!!host,failure,art,controls,labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserDispatchesV1=Object.freeze({create});
})();
