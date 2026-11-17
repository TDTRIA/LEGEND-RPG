/* Guarded presentation for production recovery screens; DOM owns every action. */
(() => {
  function create(scene) {
    let host=null,objects=[],labels=[],tagged=[],signature='',pending=null,failure='',clip=null;
    const clear=()=>{
      if(host)delete host.dataset.phaserRecovery;
      tagged.forEach(n=>n.removeAttribute('data-recovery-copy'));
      objects.forEach(n=>n.destroy(true));host=null;objects=[];labels=[];tagged=[];signature='';clip=null;
    };
    function sync() {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const screen=document.querySelector('#root [data-recovery-screen]');
      const source=screen?.querySelector('.legend-recovery-panel');
      if(!source){clear();return;}
      const texts=[...source.querySelectorAll('h1,h2,p,.account09x-kicker,button')];
      const button=source.querySelector('button');
      const walker=document.createTreeWalker(screen,NodeFilter.SHOW_TEXT);let node,unknown=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();if(b.width&&b.height&&!texts.some(n=>n.contains(owner))){unknown=true;break;}}
      if(source.querySelectorAll('h1,h2').length!==1||source.querySelectorAll('p').length!==1||screen.querySelectorAll('button,a,input').length!==1||!['backTitle','retryTitle','reloadGame'].includes(button?.id)||texts.some(n=>!n.textContent.trim())||unknown){failure='Recovery source incomplete';clear();return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();
      if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const box=rect(source),bounds={x:0,y:0,width:size.width,height:size.height};
      const contrast=document.body.classList.contains('a11y-high-contrast');
      const next=JSON.stringify([box,bounds,contrast,...texts.map(n=>[rect(n),n.textContent,n===document.activeElement,n.disabled,getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily,getComputedStyle(n).fontWeight])]);
      if(host===source&&signature===next&&texts.every((n,i)=>n===tagged[i]))return;
      clear();
      try {
        const body=scene.add.container(0,0).setDepth(150);objects.push(body);
        if(!scene.clipExpeditionUi(body,bounds))throw new Error('Recovery viewport unavailable');clip=bounds;
        const panel=(b,focused=false)=>{const g=scene.add.graphics();body.add(g);g.fillStyle(focused?0x35402c:contrast?0x050805:0x101a12,1).fillRect(b.x,b.y,b.width,b.height);g.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,1).strokeRect(b.x,b.y,b.width,b.height);};
        panel(box);panel(rect(button),button===document.activeElement);
        texts.forEach(n=>{const label=scene.createShellLabel(n,rect(n),n.disabled?'#aea799':contrast?'#ffffff':'#f2ead5',sx,sy,151);if(!label)throw new Error('Recovery copy cannot fit');body.add(label);labels.push(label);});
        host=source;signature=next;tagged=texts;failure='';texts.forEach(n=>n.dataset.recoveryCopy='true');source.dataset.phaserRecovery='true';
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','disabled','data-recovery-screen']});
    const events=['scroll','focusin','focusout'];events.forEach(type=>document.addEventListener(type,schedule,true));window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    scene.events.once('shutdown',()=>{if(pending!==null)cancelAnimationFrame(pending);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();});
    schedule();return{sync,snapshot:()=>({active:!!host,failure,clip,action:host?.querySelector('button')?.id||'',focused:!!host&&document.activeElement===host.querySelector('button'),labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserRecoveryV1=Object.freeze({create});
})();
