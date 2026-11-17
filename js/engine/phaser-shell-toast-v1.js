/* Phaser paints only the shell notification. Its semantic DOM layer stays above
 * both native screens and DOM fallbacks; production code owns copy and timing. */
(() => {
  function create(scene) {
    let source = null, canvas = null, pending = null, signature = '', failure = '', copy = '';
    const clear = () => {
      source?.classList.remove('legend-phaser-shell-toast');
      canvas?.remove(); canvas = null; signature = ''; copy = '';
    };
    const sync = () => {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      bindShell();
      const nextSource = document.querySelector('#legend-world-shell-root .lws-shell-toast');
      if (nextSource !== source) { clear(); source = nextSource; }
      if (!source || source.hidden || [...source.children].some(child => child !== canvas) ||
          !source.textContent.trim() || source.closest('[hidden]')) { clear(); return; }
      const box = source.getBoundingClientRect(), style = getComputedStyle(source);
      const next = JSON.stringify([source.textContent, box.toJSON(), style.fontSize, style.fontFamily, style.fontWeight]);
      if (signature === next) return;
      clear();
      let panel = null, label = null;
      try {
        const px = parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth);
        const py = parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth);
        const width = box.width, height = box.height;
        if (width <= 2 * px || height <= 2 * py) throw new Error('Notification layout unavailable');
        label = scene.make.text({ x: 0, y: 0, add: false, text: source.textContent.trim(), style: {
          fontFamily: style.fontFamily, fontSize: style.fontSize, color: '#f4e6c4',
          fontStyle: parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'normal',
          wordWrap: { width: width - 2 * px, useAdvancedWrap: true }
        } }).setResolution(2);
        if (label.width > width - 2 * px + 2 || label.height > height - 2 * py + 2) throw new Error('Notification copy cannot fit');
        canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width * 2); canvas.height = Math.ceil(height * 2);
        canvas.setAttribute('aria-hidden', 'true');
        Object.assign(canvas.style, { position: 'absolute', pointerEvents: 'none',
          left: -parseFloat(style.borderLeftWidth) + 'px', top: -parseFloat(style.borderTopWidth) + 'px',
          width: width + 'px', height: height + 'px' });
        // Phaser Graphics can generate directly into a supplied canvas. Text uses
        // its Phaser-generated texture; no second game or DOM-wide mirror exists.
        panel = scene.make.graphics({ x: 0, y: 0, add: false });
        panel.fillStyle(0x152011, 1).fillRect(0, 0, canvas.width, canvas.height);
        panel.lineStyle(2, 0xd3b672, 1).strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
        panel.generateTexture(canvas, canvas.width, canvas.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Notification canvas unavailable');
        context.drawImage(label.canvas, px * 2, py * 2);
        copy = label.text; source.appendChild(canvas);
        source.classList.add('legend-phaser-shell-toast'); signature = next; failure = '';
      } catch (error) { clear(); failure = error.message; }
      finally { panel?.destroy(); label?.destroy(); }
    };
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const observer = new MutationObserver(schedule);
    let shell = null;
    function bindShell() {
      const next = document.getElementById('legend-world-shell-root');
      if (next === shell) return;
      observer.disconnect(); shell = next;
      if (shell) observer.observe(shell, { subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ['hidden'] });
    }
    // New travelers create the shell after the world scene is already running.
    const bodyObserver = new MutationObserver(schedule);
    bodyObserver.observe(document.body, { childList: true });
    window.addEventListener('resize', schedule);
    scene.scale.on('resize', schedule);
    scene.events.once('shutdown', () => {
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect(); bodyObserver.disconnect(); window.removeEventListener('resize', schedule);
      scene.scale.off('resize', schedule); clear();
    });
    schedule();
    return { sync, snapshot: () => ({ active: !!canvas, text: copy, failure }) };
  }
  window.LegendPhaserShellToastV1 = Object.freeze({ create });
})();
