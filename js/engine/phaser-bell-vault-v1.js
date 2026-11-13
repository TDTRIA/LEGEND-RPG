/* Bell Cellar presentation only. Dungeon/combat owners retain room choices,
 * gear checks, settlement and saves; semantic DOM buttons retain callbacks. */
(() => {
  const actions = Object.freeze({locked:['vaultReturn'],entry:['vaultBegin','vaultReturn'],
    failed:['vaultRetry','vaultReturn'],complete:['vaultRetry','vaultReturn'],steps:['vaultDescend','vaultRetreat'],
    gate:['vaultReadGlyphs','vaultForceGate','vaultRetreat'],reliquary:['vaultTakeFragment','vaultCopyRunes','vaultRetreat'],
    keeper:['vaultFight','vaultRetreat'],treasure:['vaultCollect']});
  function create(scene) {
    let host=null,container=null,signature='',pending=null,retry=null,labels=[],keys=[],tagged=[],failure='',clip=null;
    const copySelector='.ash099-kicker,.ash099-head h1,.ash099-head p,#ashBack,.bell-vault-overline,.bell-vault-banner h1,.bell-vault-banner p,'+
      '.bell-vault-room-heading > *,.bell-vault-body > p,.bell-vault-room-card > *,.bell-vault-clue > *,.bell-vault-treasure > *,'+
      '.bell-vault-loadout > div > *,.bell-vault-footer > div > *,.bell-vault-summary > *,.bell-vault-keeper-card > div > *,'+
      '.bell-vault-choice > *,.bell-vault-secondary';
    const panelSelector='.bell-vault-body,.bell-vault-room-card,.bell-vault-clue,.bell-vault-treasure,.bell-vault-loadout > div,'+
      '.bell-vault-footer > div,.bell-vault-summary > *,.bell-vault-keeper-card,.bell-vault-after-note,.bell-vault-choice-intro';
    function clear(){
      if(host)delete host.dataset.phaserBellVault;
      tagged.forEach(node=>node.removeAttribute('data-cellar-copy'));container?.destroy(true);
      keys.forEach(key=>{if(scene.textures.exists(key))scene.textures.remove(key);});
      host=container=null;signature='';labels=[];keys=[];tagged=[];clip=null;
    }
    function sync(){
      const vault=document.querySelector('#root .bell-vault-v100'),source=vault?.closest('.ash099-screen');
      if(!source||source.closest('[hidden]')){clear();return;}
      const hud=document.querySelector('#legend-world-shell-root:not([hidden]) .lws-hud');
      if(hud){const h=Math.ceil(hud.getBoundingClientRect().height)+'px';if(source.style.getPropertyValue('--cellar-hud-height')!==h)source.style.setProperty('--cellar-hud-height',h);}
      const state=vault.dataset.vaultState,expected=actions[state],controls=[...source.querySelectorAll('button')];
      const texts=[...source.querySelectorAll(copySelector)],art=[...source.querySelectorAll('img')];
      const required={entry:'.bell-vault-room-card',steps:'.bell-vault-clue',gate:'.bell-vault-loadout',reliquary:'.bell-vault-clue',
        keeper:'.bell-vault-keeper-card',treasure:'.bell-vault-treasure',complete:'.bell-vault-summary',failed:'.bell-vault-summary'}[state];
      const complete=expected&&controls.map(n=>n.id).join(',')===[...expected,'ashBack'].join(',')&&
        source.querySelector('.ash099-head > img')&&source.querySelector('.ash099-kicker')&&source.querySelector('.ash099-head h1')&&source.querySelector('.ash099-head p')&&
        vault.querySelector('.bell-vault-banner h1')&&vault.querySelector('.bell-vault-overline')&&vault.querySelector('.bell-vault-body > p')&&
        vault.querySelectorAll('.bell-vault-room-heading > *').length===2&&vault.querySelectorAll('.bell-vault-footer > div').length===4&&
        [...vault.querySelectorAll('.bell-vault-footer > div')].every(n=>n.querySelector('span')&&n.querySelector('strong'))&&
        (!required||vault.querySelector(required))&&
        (!['entry','steps','reliquary','keeper','treasure'].includes(state)||vault.querySelector(required).querySelectorAll(state==='keeper'?'div > span,div > h2,div > p':':scope > *').length===(state==='treasure'?4:3))&&
        (state!=='gate'||vault.querySelectorAll('.bell-vault-loadout > div').length===3&&[...vault.querySelectorAll('.bell-vault-loadout > div')].every(n=>n.querySelector('span')&&n.querySelector('strong')&&n.querySelector('small')))&&
        (!['failed','complete'].includes(state)||vault.querySelectorAll('.bell-vault-summary > *').length===(state==='failed'?4:6))&&
        [...vault.querySelectorAll('.bell-vault-choice')].every(n=>n.querySelector('strong')&&n.querySelector('span')&&n.querySelector('em'))&&
        art.length===(state==='keeper'?3:2)&&art.every(n=>n.complete&&n.naturalWidth)&&texts.every(n=>n.textContent.trim());
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();
        if(b.width&&b.height&&!texts.some(text=>text.contains(owner))){missing=true;break;}}
      if(!complete||missing){failure='Cellar source or artwork incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(source)){clear();clearTimeout(retry);retry=setTimeout(()=>{retry=null;sync();},220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=node=>{const b=node.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const bounds=scene.expeditionUiClipBounds();
      const next=JSON.stringify([state,bounds,...[source,...texts,...controls,...art].map(n=>[rect(n),n.textContent,n.currentSrc,n.disabled,n===document.activeElement,n.matches(':hover')])]);
      if(host===source&&signature===next)return;clear();
      try{
        container=scene.add.container(0,0).setDepth(35);
        if(!scene.clipExpeditionUi(container,bounds))throw new Error('Cellar viewport unavailable');clip=bounds;
        const add=object=>{container.add(object);return object;},graphics=add(scene.add.graphics());
        const panel=(node,focused=false)=>{const b=rect(node);graphics.fillStyle(focused?0x35402c:0x101a12,.97).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,.8).strokeRect(b.x,b.y,b.width,b.height);};
        source.querySelectorAll(panelSelector).forEach(n=>panel(n));controls.forEach(n=>panel(n,n===document.activeElement||n.matches(':hover')));
        art.forEach((node,index)=>{
          const b=rect(node),css=getComputedStyle(node),bitmap=document.createElement('canvas');
          bitmap.width=Math.max(1,Math.ceil(b.width*2));bitmap.height=Math.max(1,Math.ceil(b.height*2));
          const position=css.objectPosition.split(' ').map(v=>({left:0,top:0,center:.5,right:1,bottom:1}[v]??parseFloat(v)/100));
          if(position.length!==2||position.some(v=>!Number.isFinite(v)))throw new Error('Cellar artwork position unavailable');
          const scale=(css.objectFit==='contain'?Math.min:Math.max)(bitmap.width/node.naturalWidth,bitmap.height/node.naturalHeight);
          bitmap.getContext('2d').drawImage(node,(bitmap.width-node.naturalWidth*scale)*position[0],(bitmap.height-node.naturalHeight*scale)*position[1],node.naturalWidth*scale,node.naturalHeight*scale);
          const key='legend-native-cellar-art-'+index;keys.push(key);scene.textures.addCanvas(key,bitmap);add(scene.add.image(b.x,b.y,key).setOrigin(0).setDisplaySize(b.width,b.height));
          if(index<2){const shade=add(scene.add.graphics());shade.fillStyle(0x071008,.58).fillRect(b.x,b.y,b.width,b.height);}
        });
        texts.forEach(node=>{const label=scene.createShellLabel(node,rect(node),node.closest('button:disabled')?'#9ea897':'#eee5ce',sx,sy,35);
          if(!label)throw new Error('Cellar copy cannot fit: '+node.textContent.trim());add(label);labels.push(label);});
        host=source;signature=next;tagged=texts;failure='';texts.forEach(n=>n.setAttribute('data-cellar-copy','true'));source.dataset.phaserBellVault='true';
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const events=['scroll','focusin','focusout','pointerover','pointerout','load','error'];events.forEach(type=>document.addEventListener(type,schedule,true));
    window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    const observer=new MutationObserver(schedule),root=document.getElementById('root');
    if(root)observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden','src','data-vault-state']});
    function destroy(){if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();}
    scene.events.once('shutdown',destroy);schedule();
    return{sync,destroy,snapshot:()=>({active:!!host,failure,clip,labels:scene.shellLabelSnapshot(labels),state:host?.querySelector('.bell-vault-v100')?.dataset.vaultState,
      focused:host?.querySelector(':focus')?.id||'',controls:host?[...host.querySelectorAll('button')].map(n=>n.id):[],art:host?[...host.querySelectorAll('img')].map(n=>n.getAttribute('src')):[]})};
  }
  window.LegendPhaserBellVaultV1=Object.freeze({create});
})();
