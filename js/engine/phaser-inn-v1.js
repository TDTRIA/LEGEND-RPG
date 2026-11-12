/* Guarded presentation for the production Ashmere and Greyfen inn.
 * The inn controller owns prices, rumors, purchases and saves. DOM buttons keep
 * their callbacks, keyboard/touch input and semantic copy throughout.
 */
(() => {
  function create(scene) {
    let painted = null, signature = '', pending = null, failure = '';
    let objects = [], tagged = [], labels = [], clipMask = null, clipBounds = null;
    const artKey = 'legend-native-inn-header';
    function clear() {
      painted?.classList.remove('legend-phaser-inn');
      tagged.forEach(node => node.removeAttribute('data-phaser-inn-copy'));
      objects.forEach(object => object.destroy(true));
      clipMask?.destroy();
      if (scene.textures.exists(artKey)) scene.textures.remove(artKey);
      painted = null; signature = ''; tagged = []; objects = []; labels = [];
      clipMask = null; clipBounds = null;
    }
    function sync() {
      const header = document.querySelector('.ash099-head[data-ash-service="inn"]');
      const screen = header?.closest('.ash099-screen');
      const body = screen?.querySelector('.ash099-service-dashboard');
      if (!screen || !body || screen.closest('[hidden]')) { clear(); return; }
      const art = header.querySelector(':scope > img');
      const meter = body.querySelector('.ash099-service-wallet > i');
      const back = screen.querySelector('#ashBack');
      const cards = [...body.querySelectorAll('.ash099-service-card')];
      const note = body.querySelector('#ashNote');
      const texts = [
        ...header.querySelectorAll('.ash099-kicker,h1,p'),
        ...body.querySelectorAll('.ash099-service-note > span,.ash099-service-note > strong,.ash099-service-note > p'),
        ...body.querySelectorAll('.ash099-service-wallet > span,.ash099-service-wallet > strong,.ash099-service-wallet > small'),
        ...cards.flatMap(card => [...card.querySelectorAll('.ash099-service-copy > small,.ash099-service-copy > strong,.ash099-service-copy > span,:scope > em')]),
        back
      ];
      if (texts.length !== 22 || texts.some(node => !node?.textContent.trim()) ||
          cards.map(card => card.id).join(',') !== 'rest,camp,rumor' || !meter?.querySelector('b') || !note ||
          !art?.complete || !art.naturalWidth) {
        failure = 'Inn source or artwork incomplete'; clear(); return;
      }
      if (note.getBoundingClientRect().height && note.textContent.trim()) texts.push(note);
      if (scene.hasFiniteEntranceAnimation(screen)) { clear(); schedule(); return; }
      const root = document.getElementById('root');
      const canvas = scene.game.canvas.getBoundingClientRect(), size = scene.dimensions();
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => {
        const box = node.getBoundingClientRect();
        return { x: (box.left - canvas.left) * sx, y: (box.top - canvas.top) * sy, width: box.width * sx, height: box.height * sy };
      };
      const rootBox = rect(root);
      const hud = document.querySelector('.lws-hud'), dock = document.querySelector('.lws-bottom-bar');
      const hudBottom = hud ? rect(hud).y + rect(hud).height : rootBox.y;
      const dockTop = dock ? rect(dock).y : rootBox.y + rootBox.height;
      const clip = { x: rootBox.x, y: Math.max(rootBox.y, hudBottom), width: rootBox.width,
        height: Math.max(0, Math.min(rootBox.y + rootBox.height, dockTop) - Math.max(rootBox.y, hudBottom)) };
      const controls = [...cards, back];
      const next = JSON.stringify([size, clip, art.currentSrc, ...[screen, header, ...texts, ...controls, meter.querySelector('b')].map(node =>
        [rect(node), node.textContent, node.disabled, node === document.activeElement, node.matches(':hover')])]);
      if (painted === screen && signature === next) return;
      clear();
      try {
        const container = scene.add.container(0, 0).setDepth(30);
        objects.push(container);
        const maskArt = scene.make.graphics({ x: 0, y: 0, add: false });
        objects.push(maskArt);
        maskArt.fillStyle(0xffffff).fillRect(clip.x, clip.y, clip.width, clip.height);
        if (scene.game.renderer.type === Phaser.WEBGL) {
          container.enableFilters?.(); container.setFiltersFocusContext?.(true);
          if (!container.filters?.internal?.addMask?.(maskArt, false, scene.cameras.main, 'world')) throw new Error('Inn viewport mask unavailable');
        } else {
          clipMask = maskArt.createGeometryMask(); container.setMask(clipMask);
        }
        clipBounds = clip;
        const add = object => { container.add(object); return object; };
        const graphics = add(scene.add.graphics());
        const panel = (node, color, focus = false, target = graphics) => {
          const box = rect(node);
          if (!box.width || !box.height) throw new Error('Inn layout unavailable');
          target.fillStyle(color, 0.97).fillRect(box.x, box.y, box.width, box.height);
          target.lineStyle(focus ? 2 : 1, focus ? 0xffe5a0 : 0x9a8051, focus ? 1 : 0.65).strokeRect(box.x, box.y, box.width, box.height);
        };
        panel(screen, 0x10170f);
        body.querySelectorAll('.ash099-service-overview,.ash099-service-wallet').forEach(node => panel(node, 0x192318));
        controls.forEach(node => panel(node, node.disabled ? 0x282c25 : 0x20291c, node === document.activeElement || node.matches(':hover')));
        if (texts.includes(note)) panel(note, 0x253020);
        const track = rect(meter), fill = rect(meter.querySelector('b'));
        graphics.fillStyle(0x354330).fillRect(track.x, track.y, track.width, track.height);
        graphics.fillStyle(0xcbb370).fillRect(fill.x, fill.y, Math.min(track.width, fill.width), fill.height);
        // Crop the approved raster to the same cover window as the production
        // banner. Only conceal its DOM image once this complete paint succeeds.
        const banner = rect(header), bitmap = document.createElement('canvas');
        bitmap.width = Math.max(1, Math.ceil(banner.width * 2)); bitmap.height = Math.max(1, Math.ceil(banner.height * 2));
        const scale = Math.max(bitmap.width / art.naturalWidth, bitmap.height / art.naturalHeight);
        bitmap.getContext('2d').drawImage(art, (bitmap.width - art.naturalWidth * scale) / 2,
          (bitmap.height - art.naturalHeight * scale) * 0.52, art.naturalWidth * scale, art.naturalHeight * scale);
        scene.textures.addCanvas(artKey, bitmap);
        add(scene.add.image(banner.x, banner.y, artKey).setOrigin(0).setDisplaySize(banner.width, banner.height));
        const backing = add(scene.add.graphics());
        const caption = texts.slice(0, 3).map(rect);
        const captionLeft = Math.min(...caption.map(box => box.x)) - 8 * sx;
        const captionTop = Math.min(...caption.map(box => box.y)) - 8 * sy;
        const captionRight = Math.max(...caption.map(box => box.x + box.width)) + 8 * sx;
        const captionBottom = Math.max(...caption.map(box => box.y + box.height)) + 8 * sy;
        backing.fillStyle(0x10170f, 0.82).fillRect(captionLeft, captionTop, captionRight - captionLeft, captionBottom - captionTop);
        texts.forEach(node => {
          const label = scene.createShellLabel(node, rect(node), node.matches('h1,strong') ? '#f3e4c1' : '#e0e4d8', sx, sy, 32);
          if (!label) throw new Error('Inn copy cannot fit: ' + node.tagName + ' ' + node.textContent.trim());
          add(label); labels.push(label.text);
        });
        painted = screen; signature = next; tagged = texts; failure = '';
        tagged.forEach(node => node.setAttribute('data-phaser-inn-copy', 'true'));
        screen.classList.add('legend-phaser-inn');
      } catch (error) { failure = error.message; clear(); }
    }
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const events = ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout', 'load', 'error'];
    events.forEach(name => document.addEventListener(name, schedule, true));
    window.addEventListener('resize', schedule); scene.scale.on('resize', schedule);
    const observer = new MutationObserver(schedule);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['disabled', 'hidden', 'src'] });
    function destroy() {
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect();
      events.forEach(name => document.removeEventListener(name, schedule, true));
      window.removeEventListener('resize', schedule); scene.scale.off('resize', schedule); clear();
    }
    scene.events.once('shutdown', destroy); schedule();
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), labels: [...labels], failure, clipBounds,
      focused: painted?.querySelector(':focus')?.id || '', art: painted?.querySelector('.ash099-head > img')?.getAttribute('src') || '' }) };
  }
  window.LegendPhaserInnV1 = Object.freeze({ create });
})();
