/* Dedicated presentation for the existing Ashmere/Greyfen Route Board.
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
    const clear = () => {
      painted?.classList.remove('legend-phaser-route-board');
      objects.forEach(object => object.destroy());
      objects = [];
      labels = [];
      painted = null;
      signature = '';
    };
    function sync() {
      const header = document.querySelector('.ash099-head[data-ash-service="route"]');
      const screen = header?.closest('.ash099-screen');
      if (!screen || screen.closest('[hidden]')) { clear(); return; }
      const cards = [...screen.querySelectorAll('.ash099-cards > button[data-ash-view]')];
      const expected = header.dataset.ashRegion === 'greyfen'
        ? ['regions', 'people', 'marsh', 'quests'] : ['road', 'regions', 'quests'];
      const back = screen.querySelector('#ashBack');
      const texts = [...header.querySelectorAll('.ash099-kicker,h1,p'),
        ...cards.flatMap(card => [...card.querySelectorAll('strong,small,em')]), back];
      if (!back || cards.length !== expected.length || cards.some((card, i) => card.dataset.ashView !== expected[i]) ||
          texts.length !== 4 + cards.length * 3 || texts.some(node => !node?.textContent.trim())) { clear(); return; }
      if (scene.hasFiniteEntranceAnimation(screen)) { clear(); schedule(); return; }
      const canvas = scene.game.canvas.getBoundingClientRect();
      const size = scene.dimensions();
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => {
        const box = node.getBoundingClientRect();
        return { x: (box.left - canvas.left) * sx, y: (box.top - canvas.top) * sy, width: box.width * sx, height: box.height * sy };
      };
      const controls = [...cards, back];
      const next = JSON.stringify([size, ...[screen, header, ...controls, ...texts].map(node => [
        rect(node), node.textContent, node.disabled, node.getAttribute('aria-disabled'),
        document.activeElement === node, node.matches(':hover')
      ])]);
      if (painted === screen && signature === next) return;
      clear();
      try {
        const add = object => { objects.push(object); return object; };
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
          const label = add(scene.add.text(box.x + inset, box.y, node.textContent.trim(), {
            fontFamily: style.fontFamily,
            fontSize: fontSize + 'px',
            fontStyle: parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
            color: node.matches('h1,strong') ? '#f3e4c1' : node.matches('em,.ash099-kicker') ? '#ddc17f' : '#e0e4d8',
            align: isBack ? 'center' : style.textAlign,
            wordWrap: { width, useAdvancedWrap: true },
            padding: { top: 1, bottom: 1 }
          }).setDepth(32).setResolution(2));
          if (isBack) {
            label.setFixedSize(width, 0);
            label.y += Math.max(0, (box.height - label.height) / 2);
          } else if (label.height > box.height + 2) {
            const fittedSize = fontSize * box.height / label.height;
            if (fittedSize < fontSize * 0.85 || fittedSize < 10 * sy) {
              throw new Error('Route board copy cannot fit legibly');
            }
            label.setFontSize(fittedSize);
            if (label.height > box.height + 2) throw new Error('Route board copy exceeds layout');
          }
          labels.push(label.text);
        });
        failure = '';
        painted = screen;
        signature = next;
        screen.classList.add('legend-phaser-route-board');
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
    const observer = new MutationObserver(schedule);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['disabled', 'aria-disabled'] });
    const destroy = () => {
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect();
      events.forEach(name => document.removeEventListener(name, schedule, true));
      window.removeEventListener('resize', schedule);
      clear();
    };
    scene.events.once('shutdown', destroy);
    schedule();
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), failure, labels: [...labels] }) };
  }
  window.LegendPhaserRouteBoardV1 = Object.freeze({ create });
})();
