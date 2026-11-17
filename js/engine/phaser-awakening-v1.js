/* Production opening presentation. RealmScene owns timing and the title handoff. */
(() => {
  function create(scene) {
    const skip=document.getElementById('engine-skip'); if(!skip)return null;
    const anchor=document.createComment('awakening skip control');skip.replaceWith(anchor);
    const overlay=document.createElement('div');overlay.className='legend-awakening-overlay';
    overlay.innerHTML='<section class="legend-awakening-panel" role="dialog" aria-modal="true" aria-label="LEGEND: The Awakening"><img class="legend-awakening-wordmark" src="assets/ui/logos/logo_legend_awakening_wordmark.png" alt="LEGEND: The Awakening"><h1 hidden>LEGEND: The Awakening</h1><p>The roads remember. The realm is waking.</p><p>Your journey is about to begin.</p></section>';
    const panel=overlay.firstElementChild,logo=panel.querySelector('img');panel.append(skip);skip.hidden=false;
    document.body.append(overlay);skip.focus({preventScroll:true});
    let labels=[],tagged=[],pending=null,signature='',active=false,stopped=false,exiting=false,failure='';
    const objects=[];
    function clear(){delete panel.dataset.phaserAwakening;tagged.forEach(n=>n.removeAttribute('data-awakening-copy'));objects.forEach(o=>{scene.tweens.killTweensOf(o);o.destroy(true);});objects.length=0;labels=[];tagged=[];signature='';active=false;}
    function sync(){
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      if(stopped||exiting)return;
      if(!scene.textures.exists('menuTitleLogo')||!logo.complete||!logo.naturalWidth||logo.hidden){clear();return;}
      const texts=[...panel.querySelectorAll('p,button')];
      const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);let node,unknown=false;
      while((node=walker.nextNode())){if(!node.textContent.trim()||node.parentElement.closest('[hidden]'))continue;if(!texts.some(n=>n.contains(node.parentElement))){unknown=true;break;}}
      if(texts.length!==3||texts[2]!==skip||panel.querySelectorAll('button').length!==1||texts.some(n=>!n.textContent.trim())||unknown){failure='Awakening source incomplete';clear();return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const box=rect(panel),imageBox=rect(logo),contrast=document.body.classList.contains('a11y-high-contrast');
      if(!imageBox.width||!imageBox.height){clear();return;}
      const bounds={x:box.x+panel.clientLeft*sx,y:box.y+panel.clientTop*sy,width:panel.clientWidth*sx,height:panel.clientHeight*sy};
      const next=JSON.stringify([box,imageBox,bounds,contrast,skip===document.activeElement,...texts.map(n=>[rect(n),n.textContent,getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily,getComputedStyle(n).fontWeight])]);
      if(active&&signature===next)return;clear();
      try{
        const frame=scene.add.container(0,0).setDepth(200),body=scene.add.container(0,0).setDepth(201);objects.push(frame,body);
        if(!scene.clipExpeditionUi(body,bounds))throw new Error('Awakening viewport unavailable');
        const draw=(b,container,focused=false)=>{const g=scene.add.graphics();container.add(g);g.fillStyle(focused?0x35402c:contrast?0x000000:0x101a12,1).fillRect(b.x,b.y,b.width,b.height);g.lineStyle(focused?2:1,focused?0xffe6a0:0xb49d69,1).strokeRect(b.x,b.y,b.width,b.height);};
        draw(box,frame);draw(rect(skip),body,skip===document.activeElement);
        const image=scene.add.image(imageBox.x+imageBox.width/2,imageBox.y+imageBox.height/2,'menuTitleLogo');image.setScale(Math.min(imageBox.width/image.width,imageBox.height/image.height));body.add(image);
        texts.forEach(n=>{const text=scene.createShellLabel(n,rect(n),contrast?'#ffffff':'#f2ead5',sx,sy,202);if(!text)throw new Error('Awakening copy cannot fit');body.add(text);labels.push(text);});
        tagged=texts;signature=next;failure='';active=true;tagged.forEach(n=>n.dataset.awakeningCopy='true');panel.dataset.phaserAwakening='true';
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(stopped||exiting||pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    function logoFailed(){logo.hidden=true;panel.querySelector('h1').hidden=false;schedule();}
    logo.addEventListener('load',schedule);logo.addEventListener('error',logoFailed);
    const observer=new MutationObserver(schedule);observer.observe(overlay,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class']});observer.observe(document.body,{attributes:true,attributeFilter:['class']});
    ['scroll','focusin','focusout'].forEach(t=>overlay.addEventListener(t,schedule,true));window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    function destroy(){if(stopped)return;stopped=true;if(pending!==null)cancelAnimationFrame(pending);observer.disconnect();logo.removeEventListener('load',schedule);logo.removeEventListener('error',logoFailed);window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();if(anchor.isConnected)anchor.replaceWith(skip);skip.hidden=true;overlay.remove();}
    schedule();return{objects,destroy,fade(){if(stopped||exiting)return;exiting=true;overlay.style.opacity='0';scene.tweens.add({targets:objects,alpha:0,duration:620,ease:'Sine.easeInOut'});},snapshot:()=>({active,stopped,exiting,failure,focused:document.activeElement===skip,logoPainted:active,labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserAwakeningV1=Object.freeze({create});
})();
