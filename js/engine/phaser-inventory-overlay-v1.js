/* Native inventory presentation only. The shell modal owns focus, input and routing. */
(() => {
  function create(scene) {
    let root = null, objects = [], mask = null, signature = '', labels = [], failure = '';
    let pending = null, active = false, clipBounds = null;
    const clear = () => {
      document.body.classList.remove('legend-phaser-inventory-active');
      objects.forEach(object => object.destroy(true));
      mask?.destroy();
      objects = []; mask = null; signature = ''; labels = []; active = false; clipBounds = null;
    };
    const sync = () => {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      bindRoot();
      const dialog = root?.querySelector('.lws-modal');
      const content = dialog?.querySelector('.lws-modal-content');
      if (!root || root.hidden || root.dataset.shellModalKind !== 'inventory' || !dialog || !content) { clear(); return; }
      const header = dialog.querySelector('.lws-modal-header');
      const footer = dialog.querySelector('.lws-modal-footer');
      if (!header || !footer || !header.querySelector('h2')?.textContent.trim() ||
          !header.querySelector('p')?.textContent.trim()) { clear(); return; }
      const controls = [...dialog.querySelectorAll('button')];
      const cards = [...content.querySelectorAll('.lws-inventory-card')];
      const outerText = [...header.querySelectorAll('.lws-modal-heading > span,h2,p'),
        ...controls.flatMap(button => button.querySelector('.lws-btn-copy')
          ? [...button.querySelectorAll('strong,small')] : [button])];
      const innerText = [...content.querySelectorAll('.lws-inventory-card strong,.lws-inventory-card small,.lws-empty-state,.lws-section-title,.lws-equipped-item > span:first-child,.lws-equipped-value strong,.lws-note')]
        .filter(node => node.textContent.trim());
      if (controls.length < 2 || outerText.some(node => !node.textContent.trim()) ||
          cards.some(card => !card.querySelector('strong')?.textContent.trim() || !card.querySelector('small')?.textContent.trim()) ||
          (!cards.length && !content.querySelector('.lws-empty-state'))) { clear(); return; }
      if (scene.hasFiniteEntranceAnimation(dialog)) { clear(); schedule(); return; }
      const canvas = scene.game.canvas.getBoundingClientRect(), size = scene.dimensions();
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => {
        const box = node.getBoundingClientRect();
        return { x: (box.left - canvas.left) * sx, y: (box.top - canvas.top) * sy, width: box.width * sx, height: box.height * sy };
      };
      const next = JSON.stringify([size, ...[dialog, content, ...cards, ...outerText, ...innerText].map(node => [
        rect(node), node.textContent, node.disabled, node === document.activeElement, node.matches(':hover')
      ])]);
      if (active && signature === next) return;
      clear();
      try {
        const frame = scene.add.container(0, 0).setDepth(200);
        const body = scene.add.container(0, 0).setDepth(201);
        objects.push(frame, body);
        const clip = rect(content); clipBounds = clip;
        const maskArt = scene.make.graphics({ x: 0, y: 0, add: false });
        objects.push(maskArt);
        maskArt.fillStyle(0xffffff).fillRect(clip.x, clip.y, clip.width, clip.height);
        if (scene.game.renderer.type === Phaser.WEBGL) {
          body.enableFilters?.(); body.setFiltersFocusContext?.(true);
          if (!body.filters?.internal?.addMask?.(maskArt, false, scene.cameras.main, 'world')) throw new Error('Inventory clip unavailable');
        } else {
          mask = maskArt.createGeometryMask(); body.setMask(mask);
        }
        const panel = (node, container, fill = 0x172015, focus = false) => {
          const box = rect(node);
          if (box.width <= 0 || box.height <= 0) throw new Error('Inventory geometry unavailable');
          const graphics = scene.add.graphics(); container.add(graphics);
          graphics.fillStyle(fill, 1).fillRect(box.x, box.y, box.width, box.height);
          graphics.lineStyle(focus ? 2 : 1, focus ? 0xffe6a0 : 0x8d794c, focus ? 1 : 0.6)
            .strokeRect(box.x, box.y, box.width, box.height);
        };
        panel(dialog, frame, 0x10170f);
        panel(header, frame); panel(footer, frame);
        cards.forEach(card => panel(card, body));
        controls.forEach(button => panel(button, frame, button.disabled ? 0x292b25 : 0x29321f,
          !button.disabled && (button === document.activeElement || button.matches(':hover'))));
        const text = (node, container) => {
          const box = rect(node), style = getComputedStyle(node);
          const button = node.tagName === 'BUTTON';
          const inset = button ? 8 * sx : 0;
          const width = box.width - inset * 2, fontSize = parseFloat(style.fontSize) * sy;
          const copy = style.textTransform === 'uppercase' ? node.textContent.trim().toUpperCase() : node.textContent.trim();
          const label = scene.add.text(box.x + inset, box.y, copy, {
            fontFamily: style.fontFamily, fontSize: fontSize + 'px',
            fontStyle: parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
            color: node.matches('h2,strong') ? '#f4e6c4' : '#e0e5d9',
            wordWrap: { width, useAdvancedWrap: true }, align: button ? 'center' : style.textAlign,
            padding: { top: 1, bottom: 1 }
          }).setResolution(2);
          container.add(label);
          if (button) {
            label.setFixedSize(width, 0); label.y += Math.max(0, (box.height - label.height) / 2);
          } else if (label.height > box.height + 2) {
            if (box.height <= fontSize * 1.8) {
              label.setWordWrapWidth(0);
              if (label.width > width) {
                const fitted = fontSize * width / label.width;
                if (fitted < fontSize * 0.85) throw new Error('Inventory label cannot fit');
                label.setFontSize(fitted);
              }
            }
            if (label.height > box.height + 2) {
              const fitted = fontSize * box.height / label.height;
              if (fitted < fontSize * 0.85) throw new Error('Inventory copy cannot fit');
              label.setFontSize(fitted);
              if (label.height > box.height + 2) throw new Error('Inventory copy exceeds layout');
            }
          }
          labels.push(copy);
        };
        outerText.forEach(node => text(node, frame));
        innerText.forEach(node => text(node, body));
        signature = next; active = true; failure = '';
        document.body.classList.add('legend-phaser-inventory-active');
      } catch (error) { clear(); failure = error.message; }
    };
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const observer = new MutationObserver(schedule);
    function bindRoot() {
      const next = document.getElementById('legend-world-shell-modal-root');
      if (next === root) return;
      observer.disconnect(); root = next;
      if (root) observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true,
        attributeFilter: ['hidden', 'disabled', 'data-shell-modal-kind'] });
    }
    const bodyObserver = new MutationObserver(() => { bindRoot(); schedule(); });
    bodyObserver.observe(document.body, { childList: true });
    const events = ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout', 'load'];
    const onEvent = event => { if (root?.contains(event.target)) schedule(); };
    events.forEach(name => document.addEventListener(name, onEvent, true));
    window.addEventListener('resize', schedule);
    scene.scale.on('resize', schedule);
    scene.events.once('shutdown', () => {
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect(); bodyObserver.disconnect();
      events.forEach(name => document.removeEventListener(name, onEvent, true));
      window.removeEventListener('resize', schedule);
      scene.scale.off('resize', schedule); clear();
    });
    schedule();
    return { sync, snapshot: () => ({ active, labels: [...labels], failure, clipBounds }) };
  }
  window.LegendPhaserInventoryOverlayV1 = Object.freeze({ create });
})();
