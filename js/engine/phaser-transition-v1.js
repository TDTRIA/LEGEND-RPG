/* Bounded navigation presentation. The original controller owns all callbacks
 * and timing; this painter reads its live label, opacity and regional artwork. */
(() => {
  const artwork = {
    'title-ashmere-road.webp': 'title',
    'location_old_road_main_v1.jpg': 'blackroot',
    'greyfen-marsh-walkway.webp': 'marsh',
    'bell-cellar-undercroft.webp': 'cellar'
  };
  function create(scene) {
    let host=null,objects=[],labels=[],signature='',pending=null,stopped=false,failure='',environment='',bar=null,alpha=0;
    function clear() {
      if(host)delete host.dataset.phaserTransition;
      if(document.body.classList.contains('legend-phaser-transition-active'))document.body.classList.remove('legend-phaser-transition-active');
      document.body.style.removeProperty('--legend-transition-opacity');
      objects.forEach(o=>o.destroy(true));objects=[];labels=[];host=null;signature='';bar=null;alpha=0;
    }
    function sync(source) {
      const panel=source.querySelector('.legend-transition-scene'),logo=source.querySelector('.legend-transition-wordmark');
      const location=source.querySelector('.legend-transition-location'),caption=source.querySelector('.legend-transition-caption');
      const rule=source.querySelector('.legend-transition-rule'),loader=source.querySelector('.legend-transition-loader');
      const texts=[location,caption];
      const path=getComputedStyle(source,'::before').backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      const key=artwork[path?.split('/').pop()?.split('?')[0]];
      if(!panel||!logo||logo.hidden||!logo.complete||!logo.naturalWidth||!rule||!loader||texts.some(n=>!n?.textContent.trim())||!key||!scene.textures.exists(key)||!scene.textures.exists('menuTitleLogo')){failure='Transition source or artwork unavailable';clear();return;}
      const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);let node,unknown=false;
      while((node=walker.nextNode())){if(!node.textContent.trim()||node.parentElement.closest('[hidden]'))continue;if(!texts.some(n=>n.contains(node.parentElement))){unknown=true;break;}}
      if(unknown||panel.querySelector('button,a,input')||panel.querySelectorAll('img').length!==1||panel.scrollHeight>panel.clientHeight+1){failure='Transition source incomplete';clear();return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const box=rect(panel),imageBox=rect(logo),track=rect(loader),line=rect(rule),contrast=document.body.classList.contains('a11y-high-contrast');
      const next=JSON.stringify([size,box,imageBox,track,line,key,contrast,...texts.map(n=>[rect(n),n.textContent,getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily,getComputedStyle(n).fontWeight])]);
      if(host===source&&signature===next)return;
      clear();
      try {
        const stage=scene.add.container(0,0).setDepth(300);objects.push(stage);
        const art=scene.add.image(size.width/2,size.height/2,key);art.setScale(Math.max(size.width/art.width,size.height/art.height));stage.add(art);
        const g=scene.add.graphics();stage.add(g);g.fillStyle(contrast?0x000000:0x101a12,1).fillRect(box.x,box.y,box.width,box.height);g.lineStyle(1,0xb49d69,1).strokeRect(box.x,box.y,box.width,box.height);
        g.fillStyle(0xb49d69,1).fillRect(line.x,line.y,line.width,line.height);g.fillStyle(0x55604a,1).fillRect(track.x,track.y,track.width,track.height);
        const image=scene.add.image(imageBox.x+imageBox.width/2,imageBox.y+imageBox.height/2,'menuTitleLogo');image.setScale(Math.min(imageBox.width/image.width,imageBox.height/image.height));stage.add(image);
        texts.forEach(n=>{const text=scene.createShellLabel(n,rect(n),contrast?'#ffffff':'#f2ead5',sx,sy,301);if(!text)throw new Error('Transition copy cannot fit');stage.add(text);labels.push(text);});
        const indicator=scene.add.graphics();stage.add(indicator);bar={indicator,track};
        host=source;environment=key;signature=next;failure='';source.dataset.phaserTransition='true';document.body.classList.add('legend-phaser-transition-active');
      } catch(error) {failure=error.message;clear();}
    }
    function tick(now) {
      pending=null;if(stopped)return;
      const source=document.querySelector('#legend-scene-curtain.is-covering,#legend-scene-curtain.is-revealing');
      if(!source){clear();return;}
      sync(source);
      if(host){
        alpha=Number(getComputedStyle(source).opacity);objects.forEach(o=>o.setAlpha(alpha));
        document.body.style.setProperty('--legend-transition-opacity',String(alpha));
        // Indeterminate activity, never a fabricated loading percentage.
        const {indicator,track}=bar,w=track.width*.28,x=track.x+(track.width-w)*(1-Math.cos(now*Math.PI/675))/2;
        indicator.clear().fillStyle(0xf3d78e,1).fillRect(x,track.y,w,track.height);
      }
      pending=requestAnimationFrame(tick);
    }
    function schedule(){if(!stopped&&pending===null)pending=requestAnimationFrame(tick);}
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden']});
    scene.events.once('shutdown',()=>{stopped=true;if(pending!==null)cancelAnimationFrame(pending);observer.disconnect();clear();});
    schedule();return{snapshot:()=>({active:!!host,failure,environment,alpha,labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserTransitionV1=Object.freeze({create});
})();
