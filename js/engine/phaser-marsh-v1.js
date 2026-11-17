/* Greyfen expedition/report presentation. The production controller retains all
 * route, encounter, supply, discovery and settlement callbacks on semantic DOM. */
(() => {
  const actions = Object.freeze({
    landing:['gfm160Begin'],fork:['gfm160ChooseRaised','gfm160ChooseReeds'],raised:['gfm160Continue'],
    reeds:['gfm160VisitFerry','gfm160Continue'],'reeds-return':['gfm160Continue'],
    ferry:['gfm160FaceRaider','gfm160AvoidRaider','gfm160ReturnFromFerry'],'ferry-cleared':['gfm160ReturnFromFerry'],
    storehouse:['gfm160ReturnFromStorehouse'],sluice:['gfm160FaceWisp','gfm160PassSluice','gfm160ContinueShelter'],
    'sluice-crossed':['gfm160ContinueShelter'],shelter:['gfm160Rest','gfm160ContinueGauge','gfm160VisitStorehouse'],
    'shelter-return':['gfm160Rest','gfm160ContinueGauge'],gauge:['gfm160InspectGauge','gfm160Exit'],
    'gauge-recorded':['gfm160Complete','gfm160Exit'],report:['gfm160ResultReturn','gfm160ResultAgain','gfm160OpenMap','gfm160OpenJournal']
  });
  function create(scene) {
    let host=null,container=null,signature='',pending=null,retry=null,labels=[],keys=[],tagged=[],failure='',clip=null;
    const copySelector='.gfm160-kicker,.gfm160-scene-copy h1,.gfm160-scene-copy p,.gfm160-status > div > span,.gfm160-status > div > strong,'+
      '.gfm160-content h2,.gfm160-content h3,.gfm160-content p,.gfm160-field-note > strong,.gfm160-feedback,'+
      '.gfm160-route-number,.gfm160-route-option > span:nth-child(2) > *,.gfm160-route-option > b,'+
      'button:not(.gfm160-route-option),.gfm160-results-panel > h1,.gfm160-results-panel > p,'+
      '.gfm160-report-metrics > div > *,.gfm160-report-findings h2,.gfm160-report-findings li,.gfm160-report-findings p';
    const panelSelector='.gfm160-scene-copy,.gfm160-scene-toolbar,.gfm160-status > div,.gfm160-panel,.gfm160-route-choices,'+
      '.gfm160-route-selected,.gfm160-optional,.gfm160-field-note,.gfm160-feedback,.gfm160-note,'+
      '.gfm160-results-panel,.gfm160-report-metrics > div,.gfm160-report-findings';
    function clear(){
      if(host)delete host.dataset.phaserMarsh;
      tagged.forEach(n=>n.removeAttribute('data-marsh-copy'));container?.destroy(true);
      keys.forEach(key=>{if(scene.textures.exists(key))scene.textures.remove(key);});
      host=container=null;signature='';labels=[];keys=[];tagged=[];clip=null;
    }
    function sync(){
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const source=document.querySelector('#root .gfm160-page[data-marsh-state]');
      if(!source||source.closest('[hidden]')){clear();return;}
      const hud=document.querySelector('#legend-world-shell-root:not([hidden]) .lws-hud');
      const height=(hud?Math.ceil(hud.getBoundingClientRect().height):0)+'px';
      if(source.style.getPropertyValue('--marsh-hud-height')!==height)source.style.setProperty('--marsh-hud-height',height);
      const state=source.dataset.marshState,expected=actions[state],report=state==='report';
      const outsideMap=n=>!n.closest('.gfm160-map-overlay');
      const controls=[...source.querySelectorAll('button')].filter(outsideMap);
      const texts=[...source.querySelectorAll(copySelector)].filter(outsideMap),art=[...source.querySelectorAll('img')];
      const fields=[...source.querySelectorAll(report?'.gfm160-report-metrics > div':'.gfm160-status > div')];
      const complete=expected&&controls.map(n=>n.id).join(',')===(report?expected:['gfm160OpenMap','gfm160OpenJournal','gfm160EarlyExit',...expected]).join(',')&&
        source.querySelector(report?'.gfm160-results-panel > h1':'.gfm160-scene-copy h1')&&
        source.querySelector(report?'.gfm160-results-panel > p':'.gfm160-scene-copy p')&&
        fields.length===(report?6:4)&&fields.every(n=>n.querySelector('span')&&n.querySelector('strong'))&&
        (report?source.querySelectorAll('.gfm160-results-panel > p').length===1&&source.querySelectorAll('.gfm160-report-findings p').length>=4:source.querySelector('.gfm160-field-note > strong')&&source.querySelector('.gfm160-field-note p')&&source.querySelector('.gfm160-content h2,.gfm160-content h3'))&&
        (state!=='fork'||[...source.querySelectorAll('.gfm160-route-option')].every(n=>n.querySelector('strong')&&n.querySelector('small')&&n.querySelectorAll('em').length>=3))&&
        art.length===1&&art.every(n=>n.complete&&n.naturalWidth)&&texts.every(n=>n.textContent.trim());
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();
        if(b.width&&b.height&&outsideMap(owner)&&!texts.some(text=>text.contains(owner))){missing=true;break;}}
      if(!complete||missing){failure='Marsh source or artwork incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(source)){clear();clearTimeout(retry);retry=setTimeout(()=>{retry=null;sync();},220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=node=>{const b=node.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const bounds=scene.expeditionUiClipBounds();
      const next=JSON.stringify([state,bounds,...[source,...texts,...controls,...art].map(n=>[rect(n),n.textContent,n.currentSrc,n.disabled,n===document.activeElement,n.matches(':hover')])]);
      if(host===source&&signature===next)return;clear();
      try{
        container=scene.add.container(0,0).setDepth(35);
        if(!scene.clipExpeditionUi(container,bounds))throw new Error('Marsh viewport unavailable');clip=bounds;
        const add=object=>{container.add(object);return object;};
        art.forEach((node,index)=>{
          const b=rect(node),bitmap=document.createElement('canvas');
          bitmap.width=Math.max(1,Math.ceil(b.width*2));bitmap.height=Math.max(1,Math.ceil(b.height*2));
          const scale=Math.max(bitmap.width/node.naturalWidth,bitmap.height/node.naturalHeight);
          bitmap.getContext('2d').drawImage(node,(bitmap.width-node.naturalWidth*scale)/2,(bitmap.height-node.naturalHeight*scale)/2,node.naturalWidth*scale,node.naturalHeight*scale);
          const key='legend-native-marsh-art-'+index;keys.push(key);scene.textures.addCanvas(key,bitmap);add(scene.add.image(b.x,b.y,key).setOrigin(0).setDisplaySize(b.width,b.height));
        });
        const graphics=add(scene.add.graphics());
        const panel=(node,focused=false)=>{const b=rect(node);graphics.fillStyle(focused?0x354b3b:0x142d29,node.matches('.gfm160-scene-copy')?.94:.98).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(focused?2:1,focused?0xffe6a0:0x9f9870,.8).strokeRect(b.x,b.y,b.width,b.height);};
        source.querySelectorAll(panelSelector).forEach(n=>panel(n));controls.forEach(n=>panel(n,n===document.activeElement||!n.disabled&&n.matches(':hover')));
        source.querySelectorAll('.gfm160-status i').forEach(node=>{const b=rect(node),fill=rect(node.querySelector('b'));graphics.fillStyle(0x071716,1).fillRect(b.x,b.y,b.width,b.height);graphics.fillStyle(0xb8c88c,1).fillRect(fill.x,fill.y,fill.width,fill.height);});
        texts.forEach(node=>{const color=node.closest('button:disabled')?'#a8b1a1':node.matches('.gfm160-kicker,.gfm160-route-option em')?'#dfcb91':'#eee8d7';
          const label=scene.createShellLabel(node,rect(node),color,sx,sy,35);
          if(!label)throw new Error('Marsh copy cannot fit: '+node.textContent.trim());add(label);labels.push(label);});
        host=source;signature=next;tagged=texts;failure='';texts.forEach(n=>n.setAttribute('data-marsh-copy','true'));source.dataset.phaserMarsh='true';
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const events=['scroll','focusin','focusout','pointerover','pointerout','load','error'];events.forEach(type=>document.addEventListener(type,schedule,true));
    window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    const observer=new MutationObserver(schedule),root=document.getElementById('root');
    if(root)observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden','src','data-marsh-state']});
    function destroy(){if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();}
    scene.events.once('shutdown',destroy);schedule();
    return{sync,destroy,snapshot:()=>({active:!!host,failure,clip,labels:scene.shellLabelSnapshot(labels),state:host?.dataset.marshState,
      focused:host?.querySelector(':focus')?.id||'',controls:host?[...host.querySelectorAll('button')].filter(n=>!n.closest('.gfm160-map-overlay')).map(n=>n.id):[],art:host?[...host.querySelectorAll('img')].map(n=>n.getAttribute('src')):[]})};
  }
  window.LegendPhaserMarshV1=Object.freeze({create});
})();
