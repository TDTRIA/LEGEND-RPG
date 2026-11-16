/* Production artwork loading presentation. Boot checks and startup remain in their owners. */
(() => {
  function create(scene) {
    const screen = document.getElementById('legend-boot-screen');
    if (!screen) return null;
    const assets = document.createElement('div');
    assets.className = 'legend-boot-assets';
    assets.innerHTML = '<p role="status" aria-live="polite"></p><div role="progressbar" aria-label="World artwork loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>';
    screen.querySelector('.legend-boot-frame')?.append(assets);
    const status = assets.querySelector('p'), progress = assets.querySelector('[role="progressbar"]');
    let objects = [], labels = [], frame = null, stopped = false, active = false, failure = '', signature = '';
    let loaded = 0, failed = 0, total = 0, percent = 0;
    function clear() {
      delete screen.dataset.phaserLoading;
      objects.forEach(object => object.destroy(true));
      objects = []; labels = []; active = false; signature = '';
    }
    function sync() {
      if (stopped) return;
      const source = screen.querySelector('.legend-boot-frame');
      const logo = source?.querySelector('.legend-boot-wordmark');
      if (!source || !scene.textures.exists('title') || !scene.textures.exists('menuTitleLogo') || !logo?.complete || !logo.naturalWidth) { clear(); return; }
      const nodes = [...source.querySelectorAll('.legend-boot-kicker,.legend-boot-subtitle,.legend-boot-status-row span,.legend-boot-status-row strong,.legend-boot-checklist span,.legend-boot-checklist b,.legend-boot-footnote,.legend-boot-assets p')];
      const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT); let textNode;
      while ((textNode = walker.nextNode())) {
        const parent = textNode.parentElement;
        if (!textNode.textContent.trim() || parent.closest('[hidden],.legend-boot-sigil')) continue;
        if (!nodes.some(node => node.contains(parent))) { failure = 'Unknown loading copy'; clear(); return; }
      }
      const canvas = scene.game.canvas.getBoundingClientRect(), size = scene.dimensions();
      if (!canvas.width || !canvas.height) { clear(); return; }
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => { const b = node.getBoundingClientRect(); return { x: (b.left-canvas.left)*sx, y: (b.top-canvas.top)*sy, width:b.width*sx, height:b.height*sy }; };
      const box = rect(source), logoBox = rect(logo);
      const bars = [...source.querySelectorAll('[role="progressbar"]')];
      if (!logoBox.width || !logoBox.height || nodes.length !== 18 || bars.length !== 2 || nodes.some(n => !n.textContent.trim())) { failure = 'Incomplete loading source'; clear(); return; }
      const highContrast = document.body.classList.contains('a11y-high-contrast');
      const next = JSON.stringify([size,box,logoBox,highContrast,...nodes.map(n=>[rect(n),n.textContent,getComputedStyle(n).fontSize,getComputedStyle(n).fontFamily,getComputedStyle(n).fontWeight]),...bars.map(n=>[rect(n),n.getAttribute('aria-valuenow')])]);
      if (active && signature === next) return;
      clear();
      try {
        const layer = scene.add.container(0,0).setDepth(100); objects.push(layer);
        const bg = scene.add.image(size.width/2,size.height/2,'title');
        bg.setScale(Math.max(size.width/bg.width,size.height/bg.height)); layer.add(bg);
        const panel = scene.add.graphics(); layer.add(panel);
        panel.fillStyle(highContrast ? 0x000000 : 0x101a12, .96).fillRect(box.x,box.y,box.width,box.height);
        panel.lineStyle(1,0xb49d69,1).strokeRect(box.x,box.y,box.width,box.height);
        const image = scene.add.image(logoBox.x+logoBox.width/2,logoBox.y+logoBox.height/2,'menuTitleLogo');
        image.setScale(Math.min(logoBox.width/image.width,logoBox.height/image.height)); layer.add(image);
        for (const node of nodes) {
          const label = scene.createShellLabel(node,rect(node),highContrast?'#ffffff':'#f2ead5',sx,sy,101);
          if (!label) throw new Error('Loading copy cannot fit');
          layer.add(label); labels.push(label);
        }
        for (const bar of bars) {
          const b = rect(bar), value = Math.max(0,Math.min(100,Number(bar.getAttribute('aria-valuenow'))||0));
          panel.fillStyle(0x35402c,1).fillRect(b.x,b.y,b.width,b.height);
          panel.fillStyle(0xe2c47e,1).fillRect(b.x,b.y,b.width*value/100,b.height);
        }
        signature = next; failure = ''; active = true; screen.dataset.phaserLoading = 'true';
      } catch(error) { failure = error.message; clear(); }
    }
    function schedule() { if (frame !== null || stopped) return; frame = requestAnimationFrame(()=>{frame=null;sync();}); }
    function update(value) {
      total = scene.load.totalToLoad || total;
      loaded = scene.load.totalComplete || 0;
      percent = Math.round(value*100);
      status.textContent = `World artwork: ${loaded} / ${total} loaded${failed ? ` · ${failed} unavailable` : ''}`;
      progress.setAttribute('aria-valuenow',String(percent));
      progress.firstElementChild.style.width = percent+'%';
      schedule();
    }
    const onFileLoad = () => update(scene.load.progress);
    const onError = () => { failed = scene.load.totalFailed; update(scene.load.progress); };
    const observer = new MutationObserver(schedule);
    observer.observe(screen,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden','aria-valuenow']});
    const bodyObserver = new MutationObserver(schedule); bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
    scene.load.on('load',onFileLoad); scene.load.on('loaderror',onError); scene.load.on('filecomplete',schedule);
    scene.scale.on('resize',schedule); screen.addEventListener('scroll',schedule); logoListener(true);
    function logoListener(add) { screen[add?'addEventListener':'removeEventListener']('load',schedule,true); }
    function destroy() {
      if (stopped) return; stopped = true;
      if (frame !== null) cancelAnimationFrame(frame); frame = null;
      observer.disconnect(); bodyObserver.disconnect();
      scene.load.off('load',onFileLoad); scene.load.off('loaderror',onError); scene.load.off('filecomplete',schedule);
      scene.scale.off('resize',schedule); screen.removeEventListener('scroll',schedule); logoListener(false);
      clear(); assets.remove();
    }
    scene.events.once('shutdown',destroy); scene.events.once('destroy',destroy);
    update(0);
    return {destroy,snapshot:()=>({active,stopped,failure,loaded,failed,total,percent,labels:scene.shellLabelSnapshot(labels)})};
  }
  window.LegendPhaserLoadingV1 = Object.freeze({create});
})();
