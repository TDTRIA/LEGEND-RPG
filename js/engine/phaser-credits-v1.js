/* Credits presentation only. The existing dialog retains input, scroll and return. */
(() => {
  function create(scene) {
    let host=null,objects=[],labels=[],tagged=[],signature='',pending=null,retry=null,failure='',clip=null;
    const clear=()=>{
      if(host)delete host.dataset.phaserCredits;
      if(document.body.classList.contains('legend-phaser-credits-active'))document.body.classList.remove('legend-phaser-credits-active');
      tagged.forEach(n=>n.removeAttribute('data-credits-copy'));objects.forEach(n=>n.destroy(true));
      host=null;objects=[];labels=[];tagged=[];signature='';clip=null;
    };
    function sync() {
      const overlay=document.querySelector('.legend-credits-overlay'),source=overlay?.querySelector('.legend-credits-panel');
      if(!source){clear();return;}
      const texts=[...source.querySelectorAll('.legend-credits-kicker,h2,h3,p:not(:has(.legend-credits-line)),.legend-credits-line,button')];
      const button=source.querySelector('[data-credits-close]');
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();if(b.width&&b.height&&!texts.some(n=>n.contains(owner))){missing=true;break;}}
      if(texts.length!==10||texts.some(n=>!n.textContent.trim())||source.querySelectorAll('button').length!==1||!button||source.querySelectorAll('.legend-credits-rule').length!==2||missing){failure='Credits source incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(overlay)){clear();clearTimeout(retry);retry=setTimeout(sync,220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const box=rect(source),bounds={x:box.x+source.clientLeft*sx,y:box.y+source.clientTop*sy,width:source.clientWidth*sx,height:source.clientHeight*sy};
      const contrast=document.body.classList.contains('a11y-high-contrast');
      const next=JSON.stringify([box,bounds,contrast,...texts.map(n=>[rect(n),n.textContent,n===document.activeElement,getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily,getComputedStyle(n).fontWeight])]);
      if(host===source&&signature===next&&texts.every((n,i)=>n===tagged[i]))return;
      clear();
      try {
        const frame=scene.add.container(0,0).setDepth(210),body=scene.add.container(0,0).setDepth(211);objects.push(frame,body);
        if(!scene.clipExpeditionUi(body,bounds))throw new Error('Credits viewport unavailable');clip=bounds;
        const panel=(b,container,focused=false)=>{const g=scene.add.graphics();container.add(g);g.fillStyle(focused?0x35402c:contrast?0x050805:0x101a12,1).fillRect(b.x,b.y,b.width,b.height);g.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,1).strokeRect(b.x,b.y,b.width,b.height);};
        panel(box,frame);panel(rect(button),body,button===document.activeElement);
        source.querySelectorAll('.legend-credits-rule').forEach(n=>{const b=rect(n),g=scene.add.graphics();body.add(g);g.fillStyle(0xb49d69,.7).fillRect(b.x,b.y,b.width,Math.max(1,b.height));});
        texts.forEach(n=>{const label=scene.createShellLabel(n,rect(n),contrast?'#ffffff':'#f2ead5',sx,sy,212);if(!label)throw new Error('Credits copy cannot fit: '+n.textContent.trim());body.add(label);labels.push(label);});
        host=source;signature=next;tagged=texts;failure='';texts.forEach(n=>n.dataset.creditsCopy='true');source.dataset.phaserCredits='true';document.body.classList.add('legend-phaser-credits-active');
      } catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class']});
    const events=['scroll','focusin','focusout'];events.forEach(type=>document.addEventListener(type,schedule,true));window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    scene.events.once('shutdown',()=>{if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();});
    schedule();return{sync,snapshot:()=>({active:!!host,failure,clip,focused:!!host&&document.activeElement===host.querySelector('[data-credits-close]'),labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserCreditsV1=Object.freeze({create});
})();
