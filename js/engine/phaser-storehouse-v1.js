/* Storehouse presentation only. Room, combat and reward owners retain
 * their rules and saves; semantic DOM buttons retain callbacks. */
(() => {
  const actions=Object.freeze({locked:['gss170Return'],entry:['gss170Begin','gss170Return'],
    failed:['gss170Retry','gss170Return'],complete:['gss170Again','gss170Return'],loading:['gss170Upper','gss170Sump','gss170Retreat'],
    records:['gss170Fight','gss170Retreat'],keeper:['gss170Reenter','gss170Retreat'],treasure:['gss170Collect','gss170Return']});
  function create(scene) {
    let host=null,container=null,signature='',pending=null,retry=null,labels=[],keys=[],tagged=[],failure='',clip=null;
    const copySelector='.ash099-kicker,.ash099-head h1,.ash099-head p,#ashBack,.gss170-scene-copy > *, .gss170-card > :not(button),'+
      '.gss170-stat-grid > div > *, .gss170-action > *, .gss170-inline-action,.gss170-status:not(:empty)';
    const panelSelector='.gss170-card,.gss170-stat-grid > div,.gss170-status:not(:empty)';
    function clear(){
      if(host)delete host.dataset.phaserStorehouse;
      tagged.forEach(node=>node.removeAttribute('data-storehouse-copy'));container?.destroy(true);
      keys.forEach(key=>{if(scene.textures.exists(key))scene.textures.remove(key);});
      host=container=null;signature='';labels=[];keys=[];tagged=[];clip=null;
    }
    function sync(){
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const vault=document.querySelector('#root .gss170-page'),source=vault?.closest('.ash099-screen');
      if(!source||source.closest('[hidden]')){clear();return;}
      const hud=document.querySelector('#legend-world-shell-root:not([hidden]) .lws-hud');
      if(hud){const h=Math.ceil(hud.getBoundingClientRect().height)+'px';if(source.style.getPropertyValue('--storehouse-hud-height')!==h)source.style.setProperty('--storehouse-hud-height',h);}
      const state=vault.dataset.storehouseState,expected=actions[state],controls=[...source.querySelectorAll('button')];
      const texts=[...source.querySelectorAll(copySelector)],art=[...source.querySelectorAll('img')];
      const optional=state==='records'?['gss170ReadDispatch','gss170Salvage'].filter(id=>source.querySelector('#'+id)):[];
      const cards=[...vault.querySelectorAll('.gss170-card')];
      const cardShapes={locked:['SPAN,H2,P'],entry:['SPAN,H2,P','SPAN,H2,P'],failed:['H2,P'],complete:['SPAN,H2,P,P'],
        loading:['SPAN,H2,P','SPAN,H2,P'],records:['SPAN,H2,P','SPAN,H2,P'],keeper:['SPAN,H2,P'],
        treasure:vault.dataset.storehouseEvidence==='true'?['SPAN,H2,P,SMALL','H2,P']:['SPAN,H2,P,SMALL']}[state];
      const complete=expected&&controls.map(n=>n.id).join(',')===[...optional,...expected,'ashBack'].join(',')&&
        source.querySelector('.ash099-head > img')&&source.querySelector('.ash099-kicker')&&source.querySelector('.ash099-head h1')&&source.querySelector('.ash099-head p')&&
        vault.querySelector('.gss170-scene-copy h1')&&vault.querySelector('.gss170-kicker')&&vault.querySelector('.gss170-scene-copy p')&&
        (state==='locked'||vault.querySelectorAll('.gss170-stat-grid > div').length===4)&&
        [...vault.querySelectorAll('.gss170-stat-grid > div')].every(n=>n.querySelector('span')&&n.querySelector('strong'))&&
        cardShapes&&cards.length===cardShapes.length&&cards.every((n,i)=>{const tags=[...n.children].map(child=>child.tagName);
          if(state==='records'){const last=tags.pop();if(!['P','BUTTON'].includes(last))return false;}
          return tags.join(',')===cardShapes[i];})&&
        (state!=='records'||cards.every(n=>n.querySelector('.gss170-inline-action,.gss170-found-note')))&&
        [...vault.querySelectorAll('.gss170-action')].every(n=>n.querySelector('strong')&&n.querySelector('span'))&&
        art.length===2&&art.every(n=>n.complete&&n.naturalWidth)&&texts.every(n=>n.textContent.trim());
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();
        if(b.width&&b.height&&!texts.some(text=>text.contains(owner))){missing=true;break;}}
      if(!complete||missing){failure='Storehouse source or artwork incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(source)){clear();clearTimeout(retry);retry=setTimeout(()=>{retry=null;sync();},220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=node=>{const b=node.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const bounds=scene.expeditionUiClipBounds();
      const next=JSON.stringify([state,bounds,...[source,...texts,...controls,...art].map(n=>[rect(n),n.textContent,n.currentSrc,n.disabled,n===document.activeElement,n.matches(':hover')])]);
      if(host===source&&signature===next)return;clear();
      try{
        container=scene.add.container(0,0).setDepth(35);
        if(!scene.clipExpeditionUi(container,bounds))throw new Error('Storehouse viewport unavailable');clip=bounds;
        const add=object=>{container.add(object);return object;},graphics=add(scene.add.graphics());
        const panel=(node,focused=false)=>{const b=rect(node);graphics.fillStyle(focused?0x35402c:0x101a12,.97).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,.8).strokeRect(b.x,b.y,b.width,b.height);};
        source.querySelectorAll(panelSelector).forEach(n=>panel(n));controls.forEach(n=>panel(n,n===document.activeElement||n.matches(':hover')));
        art.forEach((node,index)=>{
          const b=rect(node),css=getComputedStyle(node),bitmap=document.createElement('canvas');
          bitmap.width=Math.max(1,Math.ceil(b.width*2));bitmap.height=Math.max(1,Math.ceil(b.height*2));
          const position=css.objectPosition.split(' ').map(v=>({left:0,top:0,center:.5,right:1,bottom:1}[v]??parseFloat(v)/100));
          if(position.length!==2||position.some(v=>!Number.isFinite(v)))throw new Error('Storehouse artwork position unavailable');
          const scale=(css.objectFit==='contain'?Math.min:Math.max)(bitmap.width/node.naturalWidth,bitmap.height/node.naturalHeight);
          bitmap.getContext('2d').drawImage(node,(bitmap.width-node.naturalWidth*scale)*position[0],(bitmap.height-node.naturalHeight*scale)*position[1],node.naturalWidth*scale,node.naturalHeight*scale);
          const key='legend-native-storehouse-art-'+index;keys.push(key);scene.textures.addCanvas(key,bitmap);add(scene.add.image(b.x,b.y,key).setOrigin(0).setDisplaySize(b.width,b.height));
          if(index<2){const shade=add(scene.add.graphics());shade.fillStyle(0x071008,.58).fillRect(b.x,b.y,b.width,b.height);}
        });
        texts.forEach(node=>{const label=scene.createShellLabel(node,rect(node),node.closest('button:disabled')?'#9ea897':'#eee5ce',sx,sy,35);
          if(!label)throw new Error('Storehouse copy cannot fit: '+node.textContent.trim());add(label);labels.push(label);});
        host=source;signature=next;tagged=texts;failure='';texts.forEach(n=>n.setAttribute('data-storehouse-copy','true'));source.dataset.phaserStorehouse='true';
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const events=['scroll','focusin','focusout','pointerover','pointerout','load','error'];events.forEach(type=>document.addEventListener(type,schedule,true));
    window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    const observer=new MutationObserver(schedule),root=document.getElementById('root');
    if(root)observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden','src','data-storehouse-state','data-storehouse-evidence']});
    function destroy(){if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();}
    scene.events.once('shutdown',destroy);schedule();
    return{sync,destroy,snapshot:()=>({active:!!host,failure,clip,labels:scene.shellLabelSnapshot(labels),state:host?.querySelector('.gss170-page')?.dataset.storehouseState,
      focused:host?.querySelector(':focus')?.id||'',controls:host?[...host.querySelectorAll('button')].map(n=>n.id):[],art:host?[...host.querySelectorAll('img')].map(n=>n.getAttribute('src')):[]})};
  }
  window.LegendPhaserStorehouseV1=Object.freeze({create});
})();
