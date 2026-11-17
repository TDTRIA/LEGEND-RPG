/* Read-only Greyfen field-record presentation. The DOM owns modal focus, tabs
 * and scroll; route knowledge and field notes come from the production view. */
(() => {
  function create(scene) {
    let host=null,frame=null,body=null,tagged=[],labels=[],signature='',failure='',clip=null,pending=null;
    const selectors='.gfm160-kicker,header h2,button,.gfm160-map-places > p,.gfm160-map-node strong,.gfm160-map-node > div > span,.gfm160-map-node > em,.gfm160-journal-note > *,.gfm160-journal-empty,footer > span';
    function clear(){if(host)delete host.dataset.phaserMarshMap;tagged.forEach(n=>n.removeAttribute('data-marsh-map-copy'));frame?.destroy(true);body?.destroy(true);host=frame=body=null;tagged=[];labels=[];signature='';clip=null;}
    function sync(){
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const overlay=document.querySelector('body > #gfm160MapOverlay:not([hidden])'),panel=overlay?.querySelector('.gfm160-map-dialog');
      if(!panel){clear();return;}
      const visible=n=>!n.closest('[hidden]');
      const texts=[...panel.querySelectorAll(selectors)].filter(visible),controls=[...panel.querySelectorAll('button')];
      const nodes=[...panel.querySelectorAll('[data-marsh-stop]')],notes=[...panel.querySelectorAll('.gfm160-journal-note')];
      const catalog=window.LegendGreyfenMarshContentV160?.stops || [];
      const complete=['map','journal'].includes(overlay.dataset.mapView)&&controls.map(n=>n.id).join(',')==='gfm160CloseMap,gfm160MapPlaces,gfm160MapNotes,gfm160CloseMapFooter'&&
        catalog.length>0&&nodes.map(n=>n.dataset.marshStop).join(',')===catalog.map(n=>n.id).join(',')&&
        nodes.every(n=>n.querySelector('strong')&&n.querySelector('em')&&n.querySelector('div > span'))&&
        notes.length===Number(overlay.dataset.noteCount)&&notes.every(n=>n.querySelector('span')&&n.querySelector('h3')&&n.querySelector('p'))&&
        (notes.length||panel.querySelector('.gfm160-journal-empty'))&&panel.querySelector('header h2')&&panel.querySelector('footer > span')&&
        texts.every(n=>n.textContent.trim());
      const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement;if(visible(owner)&&!texts.some(n=>n.contains(owner))){missing=true;break;}}
      if(!complete||missing){failure='Marsh field record incomplete';clear();return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const box=rect(panel),bounds={x:box.x+panel.clientLeft*sx,y:box.y+panel.clientTop*sy,width:panel.clientWidth*sx,height:panel.clientHeight*sy};
      const next=JSON.stringify([size,bounds,overlay.dataset.mapView,...[panel,...texts,...controls,...nodes,...notes].map(n=>[rect(n),n.textContent,n===document.activeElement,n.getAttribute('aria-pressed')])]);
      if(host===overlay&&signature===next)return;clear();
      try{
        frame=scene.add.container(0,0).setDepth(180);body=scene.add.container(0,0).setDepth(181);
        if(!scene.clipExpeditionUi(body,bounds))throw new Error('Marsh field-record viewport unavailable');clip=bounds;
        const backdrop=scene.add.graphics();frame.add(backdrop);backdrop.fillStyle(0x071816,.35).fillRect(0,0,size.width,size.height);
        backdrop.fillStyle(0x132b28,1).fillRect(box.x,box.y,box.width,box.height);backdrop.lineStyle(1,0xb3aa7c,1).strokeRect(box.x,box.y,box.width,box.height);
        const graphics=scene.add.graphics();body.add(graphics);
        [...nodes,...notes,...controls].filter(visible).forEach(n=>{const b=rect(n),focus=n===document.activeElement,selected=n.matches('.is-current,[aria-pressed="true"]');
          graphics.fillStyle(selected?0x354c3c:0x102722,1).fillRect(b.x,b.y,b.width,b.height);
          graphics.lineStyle(focus?3:1,focus?0xffe6a0:selected?0xcbb679:0x6c8672,1).strokeRect(b.x,b.y,b.width,b.height);});
        texts.forEach(n=>{const label=scene.createShellLabel(n,rect(n),n.matches('.gfm160-kicker')?'#dfcb91':'#eee8d7',sx,sy,181);
          if(!label)throw new Error('Marsh record copy cannot fit: '+n.textContent.trim());body.add(label);labels.push(label);});
        host=overlay;signature=next;tagged=texts;failure='';texts.forEach(n=>n.setAttribute('data-marsh-map-copy','true'));overlay.dataset.phaserMarshMap='true';
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const events=['scroll','focusin','focusout'];events.forEach(type=>document.addEventListener(type,schedule,true));window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','data-map-view','aria-pressed']});
    function destroy(){if(pending!==null)cancelAnimationFrame(pending);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();}
    scene.events.once('shutdown',destroy);schedule();
    return{sync,destroy,snapshot:()=>({active:!!host,failure,clip,view:host?.dataset.mapView,labels:scene.shellLabelSnapshot(labels),focused:host?.querySelector(':focus')?.id||'',controls:host?[...host.querySelectorAll('button')].map(n=>n.id):[]})};
  }
  window.LegendPhaserMarshMapV1=Object.freeze({create});
})();
