/* Account presentation only. Native browser inputs and production auth/cloud
 * callbacks retain ownership; input values never enter canvas snapshots. */
(() => {
  const copySelector='.account09x-kicker,h1,h2,h3,.account09x-avatar,.account09x-profile-main p,.account09x-traveler-summary p,.account09x-auth-head p,.account09x-note,.account09x-cloud-state,.account09x-cloud-slot strong,.account09x-cloud-slot small,.account09x-success,label,.account09x-auth-switch-copy,button';
  function create(scene){
    let host=null,objects=[],labels=[],tagged=[],signature='',pending=null,retry=null,failure='',controls=[],fields=[];
    function clear(){if(host)delete host.dataset.phaserAccount;tagged.forEach(n=>n.removeAttribute('data-account-copy'));objects.forEach(n=>n.destroy(true));host=null;objects=[];labels=[];tagged=[];signature='';controls=[];fields=[];}
    function sync(){
      const source=document.querySelector('#root .account09x-clean');if(!source){clear();return;}
      const visible=n=>{const b=n.getBoundingClientRect();return b.width>0&&b.height>0&&!n.closest('[hidden]');};
      const texts=[...source.querySelectorAll(copySelector)].filter(visible),buttons=[...source.querySelectorAll('button')].filter(visible),inputs=[...source.querySelectorAll('input')].filter(visible);
      const state=source.dataset.accountState,expectedButtons=state==='profile'?10:state==='auth'?12:state==='offline'?8:0;
      const slots=[...source.querySelectorAll('.account09x-cloud-slot')];
      const complete=expectedButtons&&buttons.length===expectedButtons&&texts.every(n=>n.textContent.trim())&&source.querySelector('h1')?.textContent.trim()&&source.querySelector('#backTitle')&&source.querySelector(source.dataset.accountHasPlayer==='true'?'#continueTraveler':'#newTraveler')&&slots.length===2&&slots.every((n,i)=>n.querySelector('strong')?.textContent.trim()&&n.querySelector('small')?.textContent.trim()&&['load','save','delete'].every(action=>n.querySelector(`[data-cloud-${action}="${i+1}"]`)))&&
        (state==='profile'?inputs.length===1&&inputs[0].id==='displayName'&&source.querySelector('#profileForm'):state==='auth'?inputs.some(n=>n.id==='authEmail'&&n.type==='email')&&inputs.some(n=>n.id==='authPassword'&&n.type==='password')&&inputs.every(n=>['authEmail','authPassword','authDisplayName'].includes(n.id))&&source.querySelector('#authForm'):inputs.length===0)&&inputs.every(n=>source.querySelector(`label[for="${n.id}"]`)?.textContent.trim())&&source.querySelectorAll('select,textarea,a,img').length===0;
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,missing=false;while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement;if(visible(owner)&&!texts.some(n=>n.contains(owner))){missing=true;break;}}
      if(!complete||missing){failure='Account source incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(source)){clear();clearTimeout(retry);retry=setTimeout(sync,220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const contrast=document.body.classList.contains('a11y-high-contrast');
      const next=JSON.stringify([size,state,contrast,...[...texts,...inputs].map(n=>[rect(n),n.tagName==='INPUT'?'':n.textContent,n.disabled,n===document.activeElement,n.getAttribute('aria-selected'),getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily,getComputedStyle(n).fontWeight])]);
      if(host===source&&signature===next&&texts.length===tagged.length&&texts.every((n,i)=>n===tagged[i]))return;clear();
      try{
        const body=scene.add.container(0,0).setDepth(36);objects.push(body);if(!scene.clipExpeditionUi(body,{x:0,y:0,width:size.width,height:size.height}))throw new Error('Account viewport unavailable');
        const panel=(n,focused=false,disabled=false,selected=false)=>{const b=rect(n);if(!b.width||!b.height)throw new Error('Account geometry unavailable');const g=scene.add.graphics();body.add(g);g.fillStyle(disabled?0x222820:focused||selected?0x35402c:contrast?0x050805:0x101a12,.97).fillRect(b.x,b.y,b.width,b.height);g.lineStyle(focused?2:1,focused?0xffe6a0:disabled?0x75796c:contrast?0xf8efc7:0xb49d69,1).strokeRect(b.x,b.y,b.width,b.height);};
        source.querySelectorAll('.account09x-header,.account09x-panel,.account09x-traveler-summary,.account09x-cloud-slot,.account09x-success,.account09x-note,.account09x-avatar').forEach(n=>{if(visible(n))panel(n);});
        buttons.forEach(n=>{const focused=n===document.activeElement,selected=n.getAttribute('aria-selected')==='true';panel(n,focused,n.disabled,selected);controls.push({id:n.id,text:n.textContent.trim(),focused,disabled:n.disabled,selected,rect:rect(n)});});
        inputs.forEach(n=>{const focused=n===document.activeElement;panel(n,focused,n.disabled);fields.push({id:n.id,type:n.type,focused,disabled:n.disabled,rect:rect(n)});});
        texts.forEach(n=>{const label=scene.createShellLabel(n,rect(n),n.disabled?'#bfc6b8':contrast?'#ffffff':'#f2ead5',sx,sy,37);if(!label)throw new Error('Account copy cannot fit: '+n.textContent.trim());if(n.classList.contains('account09x-avatar')){const b=rect(n);label.x=b.x+(b.width-label.displayWidth)/2;label.y=b.y+(b.height-label.height)/2;}body.add(label);labels.push(label);});
        host=source;signature=next;tagged=texts;failure='';source.dataset.phaserAccount='true';texts.forEach(n=>n.dataset.accountCopy='true');
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','disabled','aria-selected']});
    const events=['scroll','focusin','focusout','input'];events.forEach(type=>document.addEventListener(type,schedule,true));window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    scene.events.once('shutdown',()=>{if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();});
    schedule();return{sync,snapshot:()=>({active:!!host,state:host?.dataset.accountState||'',failure,controls,fields,labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserAccountV1=Object.freeze({create});
})();
