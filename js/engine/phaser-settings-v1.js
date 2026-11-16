/* Settings presentation only. Production inputs retain draft/immediate-save
 * behavior, keyboard activation, focus trapping and storage ownership. */
(() => {
  const pageKeys=['largeText','boldText','highContrast','reducedMotion','spacious','readableFont'];
  const modalKeys=['largeText','boldText','highContrast','reducedMotion','simpleAscii','spacious','readableFont'];
  function create(scene){
    let host=null,objects=[],tagged=[],labels=[],signature='',pending=null,retry=null,failure='',kind='',states=[],clip=null;
    function clear(){
      if(host)delete host.dataset.phaserSettings;
      if(document.body.classList.contains('legend-phaser-settings-modal'))document.body.classList.remove('legend-phaser-settings-modal');
      tagged.forEach(n=>n.removeAttribute('data-settings-copy'));objects.forEach(n=>n.destroy(true));
      host=null;objects=[];tagged=[];labels=[];signature='';states=[];clip=null;kind='';
    }
    function sync(){
      const modal=document.querySelector('#legend-world-shell-modal-root:not([hidden])[data-shell-modal-kind="settings"]');
      const source=modal?.querySelector('.lws-modal')||document.querySelector('#root [data-settings-screen="true"]');
      if(!source){clear();return;}
      const highContrast=document.body.classList.contains('a11y-high-contrast');
      const isModal=!!modal, expected=isModal?modalKeys:pageKeys;
      const inputs=[...source.querySelectorAll('input')],controls=[...source.querySelectorAll('button')];
      const rows=[...source.querySelectorAll(isModal?'.lws-setting-row':'.settings09x-toggle')];
      const texts=[...source.querySelectorAll(isModal?'.lws-modal-heading > span,.lws-modal-heading h2,.lws-modal-heading p,.lws-setting-row strong,.lws-setting-row small,[data-shell-modal-status],button':
        '.settings09x-kicker,.settings09x-hero h1,.settings09x-hero p,.settings09x-toggle > span:last-of-type > *, .settings09x-note,.settings09x-status,button')].filter(n=>n.textContent.trim());
      const art=[...source.querySelectorAll('img')];
      const expectedControls=isModal?2:source.dataset.settingsHasPlayer==='true'?3:2;
      const requiredCopy=isModal?['.lws-modal-heading > span','.lws-modal-heading h2','.lws-modal-heading p']:['.settings09x-kicker','.settings09x-hero h1','.settings09x-hero p','.settings09x-note'];
      const complete=requiredCopy.every(selector=>source.querySelector(selector)?.textContent.trim())&&controls.every(n=>n.textContent.trim())&&inputs.length===expected.length&&rows.length===expected.length&&controls.length===expectedControls&&
        inputs.every((n,i)=>n.type==='checkbox'&&(n.dataset.worldSetting||n.dataset.setting)===expected[i]&&rows[i].contains(n))&&
        rows.every(n=>n.querySelector('strong')?.textContent.trim()&&n.querySelector(isModal?'small':':scope > span:last-of-type > span')?.textContent.trim())&&
        (isModal?source.querySelectorAll('[data-shell-modal-close]').length===2&&source.querySelector('.lws-modal-heading h2')&&source.querySelector('.lws-modal-header')&&source.querySelector('.lws-modal-footer')&&source.querySelector('.lws-modal-content'):
          source.querySelector('#saveSettings')&&source.querySelector('#backTitle')&&(expectedControls===2||source.querySelector('#backGame'))&&source.querySelector('.settings09x-note')&&source.querySelector('.settings09x-hero h1'))&&
        (isModal||art.length===6)&&art.every(n=>n.complete&&n.naturalWidth);
      const walker=document.createTreeWalker(source,NodeFilter.SHOW_TEXT);let node,missing=false;
      while((node=walker.nextNode())){if(!node.textContent.trim())continue;const owner=node.parentElement,b=owner.getBoundingClientRect();if(b.width&&b.height&&!texts.some(n=>n.contains(owner))){missing=true;break;}}
      if(!complete||missing){failure='Settings source or artwork incomplete';clear();return;}
      if(scene.hasFiniteEntranceAnimation(source)){clear();clearTimeout(retry);retry=setTimeout(sync,220);return;}
      const canvas=scene.game.canvas.getBoundingClientRect(),size=scene.dimensions();if(!canvas.width||!canvas.height){clear();return;}
      const sx=size.width/canvas.width,sy=size.height/canvas.height;
      const rect=n=>{const b=n.getBoundingClientRect();return{x:(b.left-canvas.left)*sx,y:(b.top-canvas.top)*sy,width:b.width*sx,height:b.height*sy};};
      const content=isModal?source.querySelector('.lws-modal-content'):source;
      const contentClip=isModal?rect(content):{x:0,y:0,width:size.width,height:size.height};
      const next=JSON.stringify([isModal,contentClip,document.body.className.split(/\s+/).filter(c=>c!=='legend-phaser-settings-modal').join(' '),...[source,...rows,...texts,...inputs].map(n=>[rect(n),n.textContent,n.checked,n.disabled,n===document.activeElement,getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily])]);
      if(host===source&&signature===next&&texts.length===tagged.length&&texts.every((n,i)=>n===tagged[i]))return;clear();
      try{
        const frame=scene.add.container(0,0).setDepth(isModal?200:35),body=scene.add.container(0,0).setDepth(isModal?201:36);objects.push(frame,body);
        if(!scene.clipExpeditionUi(body,contentClip))throw new Error('Settings viewport unavailable');clip=contentClip;
        const panel=(n,container,focus=false)=>{const b=rect(n);if(!b.width||!b.height)throw new Error('Settings geometry unavailable');
          const g=scene.add.graphics();container.add(g);g.fillStyle(focus?0x35402c:highContrast?0x050805:0x101a12,.97).fillRect(b.x,b.y,b.width,b.height);
          g.lineStyle(focus?2:1,focus?0xffe6a0:highContrast?0xf8efc7:0xb49d69,highContrast?1:.8).strokeRect(b.x,b.y,b.width,b.height);};
        if(isModal){panel(source,frame);panel(source.querySelector('.lws-modal-header'),frame);panel(source.querySelector('.lws-modal-footer'),frame);}
        else source.querySelectorAll('.settings09x-hero,.settings09x-note,.settings09x-actions,.settings09x-status:not(:empty)').forEach(n=>panel(n,body));
        rows.forEach((row,i)=>{
          const input=inputs[i],focused=input===document.activeElement;panel(row,body,focused);
          const b=rect(isModal?input:row.querySelector('.settings09x-switch'));
          if(!b.width||!b.height||(isModal&&Math.abs(b.width-b.height)>1))throw new Error('Settings switch unavailable');
          const g=scene.add.graphics();body.add(g);g.fillStyle(input.checked?0xa88942:0x394638,1).fillRect(b.x,b.y,b.width,b.height);
          g.lineStyle(1,0xe3d5ac,1).strokeRect(b.x,b.y,b.width,b.height);
          if(input.checked){g.lineStyle(3,0x101a12,1);g.beginPath();g.moveTo(b.x+b.width*.22,b.y+b.height*.5);g.lineTo(b.x+b.width*.43,b.y+b.height*.75);g.lineTo(b.x+b.width*.8,b.y+b.height*.24);g.strokePath();}
          states.push({key:expected[i],checked:input.checked,focused,rect:b});
        });
        controls.forEach(n=>panel(n,isModal?frame:body,n===document.activeElement));
        texts.forEach(n=>{const label=scene.createShellLabel(n,rect(n),highContrast?'#ffffff':'#f2ead5',sx,sy,202);if(!label)throw new Error('Settings copy cannot fit: '+n.textContent.trim());
          (isModal&&!content.contains(n)?frame:body).add(label);labels.push(label);});
        host=source;kind=isModal?'modal':'page';signature=next;tagged=texts;failure='';
        texts.forEach(n=>n.setAttribute('data-settings-copy','true'));source.dataset.phaserSettings='true';
        if(isModal)document.body.classList.add('legend-phaser-settings-modal');
      }catch(error){failure=error.message;clear();}
    }
    function schedule(){if(pending!==null)return;pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','disabled','checked','src','class','data-shell-modal-kind']});
    const events=['scroll','focusin','focusout','change','input','load','error'];events.forEach(type=>document.addEventListener(type,schedule,true));
    window.addEventListener('resize',schedule);scene.scale.on('resize',schedule);
    scene.events.once('shutdown',()=>{if(pending!==null)cancelAnimationFrame(pending);clearTimeout(retry);observer.disconnect();events.forEach(type=>document.removeEventListener(type,schedule,true));window.removeEventListener('resize',schedule);scene.scale.off('resize',schedule);clear();});
    schedule();return{sync,snapshot:()=>({active:!!host,kind,failure,clip,states,labels:scene.shellLabelSnapshot(labels),labelColors:labels.map(n=>n.style.color)})};
  }
  window.LegendPhaserSettingsV1=Object.freeze({create});
})();
