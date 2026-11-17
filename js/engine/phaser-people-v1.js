/* Guarded presentation for the production people directory and NPC conversations.
 * Catalog/story services retain every line, visit effect, save and navigation callback.
 */
(() => {
  function create(scene) {
    let painted = null, signature = '', pending = null, failure = '';
    let objects = [], tagged = [], labels = [], artKeys = [], clipMask = null, clipBounds = null;
    function clear() {
      painted?.classList.remove('legend-phaser-people');
      tagged.forEach(node => node.removeAttribute('data-phaser-people-copy'));
      objects.forEach(object => object.destroy(true));
      clipMask?.destroy();
      artKeys.forEach(key => { if (scene.textures.exists(key)) scene.textures.remove(key); });
      painted = null; signature = ''; objects = []; tagged = []; labels = []; artKeys = [];
      clipMask = null; clipBounds = null;
    }
    function sync() {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const header = document.querySelector('.ash099-head:is([data-ash-service="people"],[data-ash-service="mara"],[data-ash-service="brenn"],[data-ash-service="oric"])');
      const screen = header?.closest('.ash099-screen');
      if (!screen || screen.closest('[hidden]')) { clear(); return; }
      const directory = header.dataset.ashService === 'people';
      const cards = [...screen.querySelectorAll('.ash099-npc-card')];
      const lines = [...screen.querySelectorAll('.ash099-lines > p')];
      const back = screen.querySelector('#ashBack');
      const ledger = screen.querySelector('#turnTokens');
      const texts = [...header.querySelectorAll('.ash099-kicker,h1,p'), back];
      const art = [header.querySelector(':scope > img')];
      const controls = [back];
      let complete = texts.length === 4;
      if (directory) {
        complete = complete && cards.map(node => node.dataset.ashView).join(',') === 'mara,brenn,oric';
        cards.forEach(card => {
          texts.push(card.querySelector(':scope > strong'), card.querySelector(':scope > small'));
          art.push(card.querySelector(':scope > img')); controls.push(card);
        });
      } else {
        complete = complete && lines.length > 0;
        texts.push(...lines);
        if (ledger) { texts.push(ledger); controls.push(ledger); }
      }
      if (!complete || texts.some(node => !node?.textContent.trim()) ||
          art.some(node => !node?.complete || !node.naturalWidth)) {
        failure = 'People source or artwork incomplete'; clear(); return;
      }
      if (scene.hasFiniteEntranceAnimation(screen)) { clear(); schedule(); return; }
      const root = document.getElementById('root');
      const canvas = scene.game.canvas.getBoundingClientRect(), size = scene.dimensions();
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => {
        const box = node.getBoundingClientRect();
        return { x: (box.left - canvas.left) * sx, y: (box.top - canvas.top) * sy, width: box.width * sx, height: box.height * sy };
      };
      const rootBox = rect(root), hud = document.querySelector('.lws-hud'), dock = document.querySelector('.lws-bottom-bar');
      const top = Math.max(rootBox.y, hud ? rect(hud).y + rect(hud).height : rootBox.y);
      const clip = { x: rootBox.x, y: top, width: rootBox.width,
        height: Math.max(0, Math.min(rootBox.y + rootBox.height, dock ? rect(dock).y : rootBox.y + rootBox.height) - top) };
      const next = JSON.stringify([size, clip, ...art.map(node => [node.currentSrc, getComputedStyle(node).objectPosition]),
        ...[screen, header, ...texts, ...controls, ...art].map(node => [rect(node), node.textContent, node.disabled, node === document.activeElement, node.matches(':hover')])]);
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
          if (!container.filters?.internal?.addMask?.(maskArt, false, scene.cameras.main, 'world')) throw new Error('People viewport mask unavailable');
        } else { clipMask = maskArt.createGeometryMask(); container.setMask(clipMask); }
        clipBounds = clip;
        const add = object => { container.add(object); return object; };
        const graphics = add(scene.add.graphics());
        const panel = (node, color, focused = false) => {
          const box = rect(node);
          if (!box.width || !box.height) throw new Error('People layout unavailable');
          graphics.fillStyle(color, 0.97).fillRect(box.x, box.y, box.width, box.height);
          graphics.lineStyle(focused ? 2 : 1, focused ? 0xffe5a0 : 0x9a8051, focused ? 1 : 0.65).strokeRect(box.x, box.y, box.width, box.height);
        };
        panel(screen, 0x10170f);
        panel(header, 0x192318);
        lines.forEach(node => panel(node, 0x192318));
        controls.forEach(node => panel(node, 0x20291c, node === document.activeElement || node.matches(':hover')));
        // Match each approved raster's source cover window, including the portrait's face anchor.
        art.forEach((node, index) => {
          const box = rect(node), bitmap = document.createElement('canvas');
          bitmap.width = Math.max(1, Math.ceil(box.width * 2)); bitmap.height = Math.max(1, Math.ceil(box.height * 2));
          const position = getComputedStyle(node).objectPosition.split(' ').map(value => parseFloat(value) / 100);
          if (position.length !== 2 || position.some(value => !Number.isFinite(value))) throw new Error('People artwork position unavailable');
          const scale = Math.max(bitmap.width / node.naturalWidth, bitmap.height / node.naturalHeight);
          bitmap.getContext('2d').drawImage(node, (bitmap.width - node.naturalWidth * scale) * position[0],
            (bitmap.height - node.naturalHeight * scale) * position[1], node.naturalWidth * scale, node.naturalHeight * scale);
          const key = 'legend-native-people-art-' + index;
          artKeys.push(key); scene.textures.addCanvas(key, bitmap);
          add(scene.add.image(box.x, box.y, key).setOrigin(0).setDisplaySize(box.width, box.height));
        });
        texts.forEach(node => {
          const label = scene.createShellLabel(node, rect(node), node.matches('h1,strong') ? '#f3e4c1' : '#e0e4d8', sx, sy, 32);
          if (!label) throw new Error('People copy cannot fit: ' + node.tagName + ' ' + node.textContent.trim());
          add(label); labels.push(label.text);
        });
        painted = screen; signature = next; tagged = texts; failure = '';
        tagged.forEach(node => node.setAttribute('data-phaser-people-copy', 'true'));
        screen.classList.add('legend-phaser-people');
      } catch (error) { failure = error.message; clear(); }
    }
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const events = ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout', 'load', 'error'];
    events.forEach(name => document.addEventListener(name, schedule, true));
    window.addEventListener('resize', schedule); scene.scale.on('resize', schedule);
    const observer = new MutationObserver(schedule), root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['disabled', 'hidden', 'src', 'data-ash-service', 'data-ash-view'] });
    function destroy() {
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect(); events.forEach(name => document.removeEventListener(name, schedule, true));
      window.removeEventListener('resize', schedule); scene.scale.off('resize', schedule); clear();
    }
    scene.events.once('shutdown', destroy); schedule();
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), labels: [...labels], failure, clipBounds,
      focused: painted?.querySelector(':focus')?.dataset.ashView || painted?.querySelector(':focus')?.id || '',
      art: painted ? [...painted.querySelectorAll('.ash099-head > img,.ash099-npc-card > img')].map(node => node.getAttribute('src')) : [] }) };
  }
  window.LegendPhaserPeopleV1 = Object.freeze({ create });
})();
