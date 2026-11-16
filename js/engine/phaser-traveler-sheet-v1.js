/* Dedicated presentation for the production traveler sheet.
 * The records controller owns every value; semantic DOM owns navigation and artwork.
 */
(() => {
  function create(scene) {
    let objects = [];
    let painted = null;
    let signature = '';
    let pending = null;
    let labels = [];
    let failure = '';
    let paintedText = [];
    let clipMask = null;
    let clipBounds = null;
    const clear = () => {
      painted?.classList.remove('legend-phaser-traveler-sheet');
      paintedText.forEach(node => node.removeAttribute('data-phaser-sheet-copy'));
      paintedText = [];
      objects.forEach(object => object.destroy(true));
      clipMask?.destroy();
      clipMask = null;
      clipBounds = null;
      objects = [];
      labels = [];

      painted = null;
      signature = '';
    };
    function sync() {
      const profile = document.querySelector('.ash099-traveler-profile');
      const screen = profile?.closest('.ash099-screen');
      const header = screen?.querySelector('.ash099-head[data-ash-service="profile"]');
      const pack = screen?.querySelector('.ash099-traveler-inventory');
      const back = screen?.querySelector('#ashBack');
      if (!screen || !header || !pack || !back || screen.closest('[hidden]')) { clear(); return; }
      const scrollRoot = document.getElementById('root');
      const rootBox = scrollRoot.getBoundingClientRect();
      const hudBottom = document.querySelector('.lws-hud')?.getBoundingClientRect().bottom || rootBox.top;
      const dockTop = document.querySelector('.lws-bottom-bar')?.getBoundingClientRect().top || rootBox.bottom;
      const insetTop = Math.max(0, hudBottom - rootBox.top);
      const insetBottom = Math.max(0, rootBox.bottom - dockTop);
      // Clip retained DOM art as well as native paint beneath the fixed shell.
      scrollRoot.style.setProperty('--legend-sheet-clip-top', insetTop + 'px');
      scrollRoot.style.setProperty('--legend-sheet-clip-bottom', insetBottom + 'px');
      const cards = [...pack.querySelectorAll('.ash099-inventory-item')];
      const controls = [back];
      const texts = [
        ...header.querySelectorAll('.ash099-kicker,h1,p'),
        ...profile.querySelectorAll('.ash099-traveler-profile-identity > span,.ash099-traveler-profile-identity > h2,.ash099-traveler-profile-identity > p'),
        ...profile.querySelectorAll('.ash099-traveler-profile-level > span,.ash099-traveler-profile-level > strong,.ash099-traveler-profile-level > small'),
        ...profile.querySelectorAll('.ash099-traveler-vitals > div > span,.ash099-traveler-vitals > div > strong'),
        ...profile.querySelectorAll('.ash099-profile-equipment > span,.ash099-profile-equipment > strong,.ash099-profile-equipment > small'),
        ...profile.querySelectorAll('.ash099-traveler-detail-grid > div > span,.ash099-traveler-detail-grid > div > strong'),
        ...pack.querySelectorAll('.ash099-traveler-inventory-head span,.ash099-traveler-inventory-head h2'),
        ...cards.flatMap(card => [...card.querySelectorAll('strong,small,b')]),
        ...pack.querySelectorAll('.ash099-inventory-empty'), back
      ];
      const meters = [...profile.querySelectorAll('.ash099-traveler-profile-level i,.ash099-vital-hp i')];
      // Header3 + identity4 + level3 + vitals6 + equipment6 + details8 + pack heading3 + back1.
      if (texts.length !== 34 + (cards.length ? cards.length * 3 : 1) || meters.length !== 2 ||
          meters.some(meter => !meter.querySelector('b')) || texts.some(node => !node.textContent.trim())) { clear(); return; }
      if (scene.hasFiniteEntranceAnimation(screen)) { clear(); schedule(); return; }
      const canvas = scene.game.canvas.getBoundingClientRect();
      const size = scene.dimensions();
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => {
        const box = node.getBoundingClientRect();
        return { x: (box.left - canvas.left) * sx, y: (box.top - canvas.top) * sy, width: box.width * sx, height: box.height * sy };
      };
      const next = JSON.stringify([size, insetTop, insetBottom, ...[screen, header, ...cards, ...controls, ...texts, ...meters, ...meters.map(meter => meter.querySelector("b"))].map(node => [
        rect(node), node.textContent, node.disabled, node.getAttribute('aria-disabled'),
        document.activeElement === node, node.matches(':hover')
      ])]);
      if (painted === screen && signature === next) return;
      clear();
      try {
        const container = scene.add.container(0, 0).setDepth(30);
        objects.push(container);
        const box = rect(scrollRoot);
        box.y += insetTop * sy; box.height = Math.max(0, box.height - (insetTop + insetBottom) * sy);
        const maskArt = scene.make.graphics({ x: 0, y: 0, add: false });
        objects.push(maskArt);
        maskArt.fillStyle(0xffffff).fillRect(box.x, box.y, box.width, box.height);
        if (scene.game.renderer.type === Phaser.WEBGL) {
          container.enableFilters?.();
          container.setFiltersFocusContext?.(true);
          if (!container.filters?.internal?.addMask?.(maskArt, false, scene.cameras.main, 'world')) {
            throw new Error('Traveler viewport mask unavailable');
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
          if (!box.width || !box.height) throw new Error('Traveler sheet layout unavailable');
          graphics.fillStyle(fill, alpha).fillRect(box.x, box.y, box.width, box.height);
          graphics.lineStyle(focus ? 2 : 1, focus ? 0xffe5a0 : 0x9a8051, focus ? 1 : 0.7)
            .strokeRect(box.x, box.y, box.width, box.height);
        };
        panel(screen, 0x10140f, 0.9);
        panel(header, 0x172018, 0.9);
        screen.querySelectorAll('.ash099-traveler-profile-top,.ash099-traveler-vitals > div,.ash099-profile-equipment,.ash099-traveler-detail-grid > div,.ash099-inventory-item')
          .forEach(node => panel(node, 0x172018, 0.96));
        meters.forEach(meter => {
          const track = rect(meter), fill = rect(meter.querySelector('b'));
          graphics.fillStyle(0x354330, 1).fillRect(track.x, track.y, track.width, track.height);
          graphics.fillStyle(0xcbb370, 1).fillRect(fill.x, fill.y, Math.min(track.width, fill.width), fill.height);
        });
        controls.forEach(node => {
          const disabled = node.disabled || node.getAttribute('aria-disabled') === 'true';
          const focused = !disabled && (node === document.activeElement || node.matches(':hover'));
          panel(node, disabled ? 0x252822 : focused ? 0x39301d : 0x1a2118, 0.98, focused);
        });
        texts.forEach(node => {
          const box = rect(node), style = getComputedStyle(node);
          const isBack = node === back;
          const inset = isBack ? 12 * sx : 0;
          const width = box.width - inset * 2;
          const fontSize = parseFloat(style.fontSize) * sy;
          const label = add(scene.add.text(box.x + inset, box.y, (style.textTransform === 'uppercase' ? node.textContent.trim().toUpperCase() : node.textContent.trim()), {
            fontFamily: style.fontFamily,
            fontSize: fontSize + 'px',
            fontStyle: parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
            color: node.matches('h1,h2,strong') ? '#f3e4c1' : node.matches('em,.ash099-kicker,.ash099-eyebrow') ? '#ddc17f' : '#e0e4d8',
            align: isBack ? 'center' : style.textAlign,
            wordWrap: { width: /\s/.test(node.textContent.trim()) ? width : 0, useAdvancedWrap: true }
          }).setDepth(32).setResolution(2));
          if (!isBack && (label.width > width || label.height > box.height + 2) && box.height <= fontSize * 1.8) {
            // Inline DOM labels can have a tight measured width. Keep their
            // single-line layout instead of wrapping on a glyph's rounding pixel.
            label.setWordWrapWidth(0);
            if (label.width > width) {
              const fitted = fontSize * width / label.width;
              if (fitted < fontSize * 0.85) throw new Error('Traveler label is too wide');
              label.setFontSize(fitted);
            }
          }
          if (node.matches('.ash099-inventory-item > b')) {
            // Inline quantity boxes use the DOM font's ascent metrics. Center
            // Phaser's full glyph texture within the existing item row instead.
            if (label.height > rect(node.parentElement).height - 12 * sy) throw new Error('Traveler quantity exceeds row');
            label.y += (box.height - label.height) / 2;
          } else if (isBack) {
            label.setFixedSize(width, 0);
            label.y += Math.max(0, (box.height - label.height) / 2);
          } else if (label.height > box.height + 2) {
            const fittedSize = fontSize * box.height / label.height;
            if (fittedSize < fontSize * 0.85 || fittedSize < 10 * sy) {
              throw new Error('Traveler copy cannot fit: ' + node.className + ' ' + node.tagName + ' ' + label.height + '/' + box.height);
            }
            label.setFontSize(fittedSize);
            if (label.height > box.height + 2) throw new Error('Traveler sheet copy exceeds layout');
          }
          labels.push(label.text);
        });
        failure = '';
        painted = screen;
        signature = next;
        paintedText = texts;
        texts.forEach(node => node.setAttribute('data-phaser-sheet-copy', 'true'));
        screen.classList.add('legend-phaser-traveler-sheet');
      } catch (error) {
        failure = error.message;
        clear();
        // The styled semantic sheet remains visible if painting cannot complete.
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
      attributeFilter: ['disabled', 'aria-disabled'] });
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
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), failure, clipBounds, labels: [...labels] }) };
  }
  window.LegendPhaserTravelerSheetV1 = Object.freeze({ create });
})();
