/* The title controller owns this brief handoff and its 340ms deadline.
 * Paint only its source notice, in the same DOM layer as the semantic copy. */
(() => {
  function create(scene) {
    let source=null,canvas=null,pending=null,signature='',failure='',copy='';
    function clear(){source?.removeAttribute('data-phaser-title-notice');canvas?.remove();canvas=null;signature='';copy='';}
    function sync(){
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const nextSource=document.querySelector('#root .title-transition-notice');
      if(source!==nextSource){clear();source=nextSource;}
      if(!source||!source.textContent.trim()||[...source.children].some(n=>n!==canvas)){clear();return;}
      const style=getComputedStyle(source),width=source.offsetWidth,height=source.offsetHeight;
      const text=source.textContent.trim(),contrast=document.body.classList.contains('a11y-high-contrast');
      const next=JSON.stringify([text,width,height,style.fontFamily,style.fontSize,style.fontWeight,contrast]);
      if(signature===next)return;clear();let panel=null,label=null;
      try{
        const px=parseFloat(style.paddingLeft)+parseFloat(style.borderLeftWidth),py=parseFloat(style.paddingTop)+parseFloat(style.borderTopWidth);
        if(width<=2*px||height<=2*py)throw new Error('Title notice layout unavailable');
        label=scene.make.text({x:0,y:0,add:false,text,style:{fontFamily:style.fontFamily,fontSize:style.fontSize,fontStyle:parseInt(style.fontWeight,10)>=600?'bold':'normal',color:contrast?'#ffffff':'#f2ead5',align:'center',wordWrap:{width:width-2*px+2,useAdvancedWrap:true}}}).setResolution(2);
        if(label.width>width-2*px+2||label.height>height-2*py+2)throw new Error('Title notice copy cannot fit');
        canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;canvas.setAttribute('aria-hidden','true');
        Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',left:-parseFloat(style.borderLeftWidth)+'px',top:-parseFloat(style.borderTopWidth)+'px',width:width+'px',height:height+'px'});
        panel=scene.make.graphics({x:0,y:0,add:false});panel.fillStyle(contrast?0x000000:0x101a12,1).fillRect(0,0,canvas.width,canvas.height);panel.lineStyle(2,0xb49d69,1).strokeRect(1,1,canvas.width-2,canvas.height-2);panel.generateTexture(canvas,canvas.width,canvas.height);
        const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Title notice canvas unavailable');ctx.drawImage(label.canvas,width-label.width,height-label.height);
        copy=label.text;source.append(canvas);source.dataset.phaserTitleNotice='true';signature=next;failure='';
      }catch(error){failure=error.message;clear();}finally{panel?.destroy();label?.destroy();}
    }
    function schedule(){if(pending===null)pending=requestAnimationFrame(()=>{pending=null;sync();});}
    const observer=new MutationObserver(schedule),root=document.getElementById('root');
    if(root)observer.observe(root,{subtree:true,childList:true,characterData:true});
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});window.addEventListener('resize',schedule);
    scene.events.once('shutdown',()=>{if(pending!==null)cancelAnimationFrame(pending);observer.disconnect();window.removeEventListener('resize',schedule);clear();});
    schedule();return{snapshot:()=>({active:!!canvas,text:copy,failure})};
  }
  window.LegendPhaserTitleNoticeV1=Object.freeze({create});
})();
