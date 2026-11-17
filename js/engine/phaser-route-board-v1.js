/* Dedicated presentation for the existing Ashmere/Greyfen Route Board and regional ledger.
 * Navigation, region gates and saves remain owned by the production controllers.
 */
(() => {
  function create(scene) {
    let objects = [];
    let painted = null;
    let signature = '';
    let pending = null;
    let labels = [];
    let failure = '';
    let kind = '';
    let clipMask = null;
    let clipBounds = null;
    const clear = () => {
      painted?.classList.remove('legend-phaser-route-board', 'legend-phaser-region-ledger');
      objects.forEach(object => object.destroy(true));
      clipMask?.destroy();
      clipMask = null;
      clipBounds = null;
      objects = [];
      labels = [];
      kind = '';
      painted = null;
      signature = '';
    };
    function sync() {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const ledger = document.querySelector('.reg100-screen');
      const header = ledger?.querySelector('.reg100-head') || document.querySelector('.ash099-head[data-ash-service="route"]');
      const screen = ledger || header?.closest('.ash099-screen');
      if (!screen || !header || screen.closest('[hidden]')) { clear(); return; }
      let cards, back, texts, controls;
      if (ledger) {
        cards = [...ledger.querySelectorAll('.reg100-card')];
        back = ledger.querySelector('#regBack');
        const regions = Object.values(window.LEGEND_DATA?.regions || {});
        texts = [...header.querySelectorAll('.reg100-kicker,h1,p,.reg100-wallet strong,.reg100-wallet span'),
          ...ledger.querySelectorAll('.reg100-title .reg100-kicker,.reg100-title h2,.reg100-title > span'),
          ...cards.flatMap(card => [...card.querySelectorAll('.reg100-kicker,h2,p,.reg100-meta,.reg100-state,.reg100-btn')]),
          back, ...ledger.querySelectorAll('.reg100-note')];
        controls = [...ledger.querySelectorAll('button')];
        if (!regions.length || cards.length !== regions.length || cards.some((card, i) =>
          card.querySelector('h2')?.textContent !== regions[i].name ||
          card.querySelectorAll('.reg100-state,.reg100-btn').length !== 1) ||
          texts.length !== 13 + cards.length * 5 + ledger.querySelectorAll('.reg100-note').length) { clear(); return; }
      } else {
        cards = [...screen.querySelectorAll('.ash099-cards > button[data-ash-view]')];
        const expected = header.dataset.ashRegion === 'greyfen'
          ? ['regions', 'people', 'marsh', 'quests'] : ['road', 'regions', 'quests'];
        back = screen.querySelector('#ashBack');
        texts = [...header.querySelectorAll('.ash099-kicker,h1,p'),
          ...cards.flatMap(card => [...card.querySelectorAll('strong,small,em')]), back];
        controls = [...cards, back];
        if (cards.length !== expected.length || cards.some((card, i) => card.dataset.ashView !== expected[i]) ||
            texts.length !== 4 + cards.length * 3) { clear(); return; }
      }
      if (!back || texts.some(node => !node?.textContent.trim())) { clear(); return; }
      if (scene.hasFiniteEntranceAnimation(screen)) { clear(); schedule(); return; }
      const canvas = scene.game.canvas.getBoundingClientRect();
      const size = scene.dimensions();
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => {
        const box = node.getBoundingClientRect();
        return { x: (box.left - canvas.left) * sx, y: (box.top - canvas.top) * sy, width: box.width * sx, height: box.height * sy };
      };
      const viewport = scene.expeditionUiClipBounds();
      const next = JSON.stringify([size, viewport, ...[screen, header, ...cards, ...controls, ...texts].map(node => [
        rect(node), node.textContent, node.disabled, node.getAttribute('aria-disabled'),
        document.activeElement === node, node.matches(':hover')
      ])]);
      if (painted === screen && signature === next) return;
      clear();
      try {
        const container = scene.add.container(0, 0).setDepth(30);
        objects.push(container);
        // Use the same visible world rectangle as the retained DOM artwork.
        // The root element itself spans beneath the fixed HUD and open drawers.
        const box = viewport;
        const maskArt = scene.make.graphics({ x: 0, y: 0, add: false });
        objects.push(maskArt);
        maskArt.fillStyle(0xffffff).fillRect(box.x, box.y, box.width, box.height);
        if (scene.game.renderer.type === Phaser.WEBGL) {
          container.enableFilters?.();
          container.setFiltersFocusContext?.(true);
          if (!container.filters?.internal?.addMask?.(maskArt, false, scene.cameras.main, 'world')) {
            throw new Error('Navigation viewport mask unavailable');
          }
        } else {
          clipMask = maskArt.createGeometryMask();
          container.setMask(clipMask);
        }
        clipBounds = box;
        const add = object => { container.add(object); return object; };
        const graphics = add(scene.add.graphics().setDepth(30));
        const panel = (node, fill, alpha, focus = false) => {
          const box = rect(node);
          if (!box.width || !box.height) throw new Error('Route board layout unavailable');
          graphics.fillStyle(fill, alpha).fillRect(box.x, box.y, box.width, box.height);
          graphics.lineStyle(focus ? 2 : 1, focus ? 0xffe5a0 : 0x9a8051, focus ? 1 : 0.7)
            .strokeRect(box.x, box.y, box.width, box.height);
        };
        panel(screen, 0x10140f, 0.9);
        panel(header, 0x172018, 0.9);
        if (ledger) {
          cards.forEach(card => panel(card, card.classList.contains('current') ? 0x302b1c : 0x172018, 0.97));
          ledger.querySelectorAll('.reg100-wallet > div,.reg100-note').forEach(node => panel(node, 0x20271b, 0.98));
        }
        controls.forEach(node => {
          const disabled = node.disabled || node.getAttribute('aria-disabled') === 'true';
          const focused = !disabled && (node === document.activeElement || node.matches(':hover'));
          panel(node, disabled ? 0x252822 : focused ? 0x39301d : 0x1a2118, 0.98, focused);
        });
        texts.forEach(node => {
          const box = rect(node), style = getComputedStyle(node);
          const isBack = node === back || (ledger && node.tagName === 'BUTTON');
          const inset = isBack ? 12 * sx : 0;
          const width = box.width - inset * 2;
          const fontSize = parseFloat(style.fontSize) * sy;
          const label = add(scene.add.text(box.x + inset, box.y, node.textContent.trim(), {
            fontFamily: style.fontFamily,
            fontSize: fontSize + 'px',
            fontStyle: parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
            color: node.matches('h1,h2,strong') ? '#f3e4c1' : node.matches('em,.ash099-kicker,.reg100-kicker,.reg100-meta,.reg100-state') ? '#ddc17f' : '#e0e4d8',
            align: isBack ? 'center' : style.textAlign,
            wordWrap: { width, useAdvancedWrap: true },
            padding: { top: 1, bottom: 1 }
          }).setDepth(32).setResolution(2));
          if (!isBack && label.height > box.height + 2 && box.height <= fontSize * 1.8) {
            // Inline DOM labels can have a tight measured width. Keep their
            // single-line layout instead of wrapping on a glyph's rounding pixel.
            label.setWordWrapWidth(0);
            if (label.width > width) {
              const fitted = fontSize * width / label.width;
              if (fitted < fontSize * 0.85) throw new Error('Navigation label is too wide');
              label.setFontSize(fitted);
            }
          }
          if (isBack) {
            label.setFixedSize(width, 0);
            label.y += Math.max(0, (box.height - label.height) / 2);
          } else if (label.height > box.height + 2) {
            const fittedSize = fontSize * box.height / label.height;
            if (fittedSize < fontSize * 0.85 || fittedSize < 10 * sy) {
              throw new Error('Navigation copy cannot fit: ' + node.className + ' ' + node.tagName + ' ' + label.height + '/' + box.height);
            }
            label.setFontSize(fittedSize);
            if (label.height > box.height + 2) throw new Error('Route board copy exceeds layout');
          }
          labels.push(label.text);
        });
        failure = '';
        painted = screen;
        signature = next;
        kind = ledger ? 'regions' : 'routes';
        screen.classList.add(ledger ? 'legend-phaser-region-ledger' : 'legend-phaser-route-board');
      } catch (error) {
        failure = error.message;
        clear();
        // The styled semantic board remains visible if painting cannot complete.
      }
    }
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const events = ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout', 'load'];
    events.forEach(name => document.addEventListener(name, schedule, true));
    window.addEventListener('resize', schedule);
    scene.scale.on('resize', schedule);
    const observer = new MutationObserver(schedule);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'style', 'data-legend-shell-clip'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const destroy = () => {
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect();
      events.forEach(name => document.removeEventListener(name, schedule, true));
      window.removeEventListener('resize', schedule);
      scene.scale.off('resize', schedule);
      clear();
    };
    scene.events.once('shutdown', destroy);
    schedule();
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), kind, failure, clipBounds, labels: [...labels] }) };
  }
  window.LegendPhaserRouteBoardV1 = Object.freeze({ create });
})();
