/* Complete native confirmation copy and focus; semantic buttons own input. */
(() => {
  function create(scene) {
    let host=null,objects=[],labels=[],tagged=[],signature='',pending=null,failure='',clip=null;
    function clear() {
      if(host)delete host.dataset.phaserConfirmation;
      if(document.body.classList.contains('legend-phaser-confirmation-active'))document.body.classList.remove('legend-phaser-confirmation-active');
      tagged.forEach(n=>n.removeAttribute('data-confirmation-copy'));objects.forEach(n=>n.destroy(true));
      host=null;objects=[];labels=[];tagged=[];signature='';clip=null;
    }
    function sync() {
      const source=document.querySelector('.legend-confirm-overlay .legend-confirm-panel');
      if(!source){clear();return;}
      const texts=[...source.querySelectorAll('h2,p,button')],buttons=[...source.querySelectorAll('button')];
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,unknown=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();if(b.width&&b.height&&!texts.some(n=>n.contains(owner))){unknown=true;break;}}
      if(texts.length!==4||buttons.length!==2||buttons[0].id!=='legendConfirmCancel'||buttons[1].id!=='legendConfirmAccept'||!source.querySelector('#legendConfirmTitle')||!source.querySelector('#legendConfirmDetail')||texts.some(n=>!n.textContent.trim())||unknown){failure='Confirmation source incomplete';clear();return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const box=rect(source),bounds={x:box.x+source.clientLeft*sx,y:box.y+source.clientTop*sy,width:source.clientWidth*sx,height:source.clientHeight*sy};
      const contrast=document.body.classList.contains('a11y-high-contrast');
      const next=JSON.stringify([box,bounds,contrast,...texts.map(n=>[rect(n),n.textContent,n===document.activeElement,getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily,getComputedStyle(n).fontWeight])]);
      if(host===source&&signature===next&&texts.every((n,i)=>n===tagged[i]))return;
      clear();
      try{
        const frame=scene.add.container(0,0).setDepth(220),body=scene.add.container(0,0).setDepth(221);objects.push(frame,body);
        if(!scene.clipExpeditionUi(body,bounds))throw new Error('Confirmation viewport unavailable');clip=bounds;
        const panel=(b,container,focused=false)=>{const g=scene.add.graphics();container.add(g);g.fillStyle(focused?0x35402c:contrast?0x000000:0x101a12,1).fillRect(b.x,b.y,b.width,b.height);g.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,1).strokeRect(b.x,b.y,b.width,b.height);};
        panel(box,frame);buttons.forEach(n=>panel(rect(n),body,n===document.activeElement));
        texts.forEach(n=>{const label=scene.createShellLabel(n,rect(n),contrast?'#ffffff':'#f2ead5',sx,sy,222);if(!label)throw new Error('Confirmation copy cannot fit');body.add(label);labels.push(label);});
        host=source;signature=next;tagged=texts;failure='';texts.forEach(n=>n.dataset.confirmationCopy='true');source.dataset.phaserConfirmation='true';document.body.classList.add('legend-phaser-confirmation-active');
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden']});
    const events=['scroll','focusin','focusout'];events.forEach(type=>document.addEventListener(type,schedule,true));window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    scene.events.once('shutdown',()=>{if(pending!==null)cancelAnimationFrame(pending);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();});
    schedule();return{sync,snapshot:()=>({active:!!host,failure,clip,focused:host?.contains(document.activeElement)?document.activeElement.id:'',labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserConfirmationV1=Object.freeze({create});
})();
