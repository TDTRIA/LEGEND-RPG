/* Old Road scene presentation. Discovery, audio preferences and saves remain
 * owned by road-view-v100 and its existing semantic controls. */
(() => {
  function create(scene) {
    let painted = null, container = null, signature = '', pending = null, retry = null;
    let labels = [], controls = [], clip = null, failure = '';
    function clear() {
      if (painted) delete painted.dataset.legendPhaserRoadSceneUi;
      container?.destroy(true);
      painted = container = null;
      signature = '';
      labels = []; controls = []; clip = null;
    }
    function sync() {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const host = document.querySelector('#root .exp100:has(.exp150-world-page) .exp100-scene-live');
      const hud = document.querySelector('#legend-world-shell-root:not([hidden]) .lws-hud');
      if (host && hud) {
        const height = Math.ceil(hud.getBoundingClientRect().height) + 'px';
        if (host.parentElement.style.getPropertyValue('--legend-road-hud-height') !== height) {
          host.parentElement.style.setProperty('--legend-road-hud-height', height);
        }
      }
      const modal = document.getElementById('exp150Modal');
      if (!host || host.closest('[hidden]') || !scene.nativeRoadSceneArtActive ||
          (modal && !modal.hidden && getComputedStyle(modal).display !== 'none')) { clear(); return; }
      const location = host.querySelector('.exp100-scene-label');
      const sound = host.querySelector('#exp100-sound');
      const hotspots = [...host.querySelectorAll('.exp100-hotspot')];
      const buttons = [sound, ...hotspots];
      const texts = [location, sound, ...hotspots.flatMap(button => [button.querySelector('i'), button.querySelector('span')])];
      if (!location || !sound || texts.some(node => !node?.textContent.trim()) ||
          host.querySelectorAll('button').length !== buttons.length) { clear(); return; }
      if (scene.hasFiniteEntranceAnimation(host)) {
        clear();
        window.clearTimeout(retry);
        retry = window.setTimeout(() => { retry = null; sync(); }, 240);
        return;
      }
      const canvas = scene.game.canvas.getBoundingClientRect(), size = scene.dimensions();
      if (!canvas.width || !canvas.height) { clear(); return; }
      const sx = size.width / canvas.width, sy = size.height / canvas.height;
      const rect = node => {
        const box = node.getBoundingClientRect();
        return { x: (box.left - canvas.left) * sx, y: (box.top - canvas.top) * sy,
          width: box.width * sx, height: box.height * sy };
      };
      const bounds = scene.expeditionUiClipBounds();
      const next = JSON.stringify([bounds, ...[host, ...texts, ...buttons].map(node => [
        rect(node), node.textContent, node.disabled, document.activeElement === node, node.matches(':hover')
      ])]);
      if (painted === host && signature === next) return;
      clear();
      try {
        container = scene.add.container(0, 0).setDepth(54);
        if (!scene.clipExpeditionUi(container, bounds)) throw new Error('Road scene viewport unavailable');
        clip = bounds;
        const graphics = scene.add.graphics();
        container.add(graphics);
        const frame = rect(host);
        graphics.fillStyle(0x040705, 0.08).fillRect(frame.x, frame.y, frame.width, frame.height);
        graphics.lineStyle(1, 0xc7b07b, 0.55).strokeRect(frame.x, frame.y, frame.width, frame.height);
        [location, ...buttons].forEach(node => {
          const box = rect(node);
          if (!box.width || !box.height) throw new Error('Road scene control has no layout');
          const focused = document.activeElement === node;
          graphics.fillStyle(node.disabled ? 0x101710 : focused || node.matches(':hover') ? 0x30402a : 0x0d180f, 0.95)
            .fillRoundedRect(box.x, box.y, box.width, box.height, 3);
          graphics.lineStyle(focused ? 2 : 1, focused ? 0xffe6a0 : 0xc7b07b, focused ? 1 : 0.65)
            .strokeRoundedRect(box.x, box.y, box.width, box.height, 3);
          if (node.tagName === 'BUTTON') controls.push({ id: node.id || node.dataset.hotspot, ...box, focused });
        });
        texts.forEach(node => {
          const box = rect(node);
          const label = scene.createShellLabel(node, box, node === location ? '#edd399' : '#fff0ca', sx, sy, 54);
          if (!label) throw new Error('Road scene copy cannot fit: ' + node.textContent.trim());
          container.add(label);
          labels.push(label);
        });
        failure = '';
        painted = host;
        signature = next;
        host.dataset.legendPhaserRoadSceneUi = 'true';
      } catch (error) {
        failure = error.message;
        clear();
      }
    }
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const events = ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout'];
    events.forEach(name => document.addEventListener(name, schedule, true));
    window.addEventListener('resize', schedule);
    scene.scale.on('resize', schedule);
    const observer = new MutationObserver(schedule);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'hidden'] });
    const destroy = () => {
      if (pending !== null) cancelAnimationFrame(pending);
      window.clearTimeout(retry);
      observer.disconnect();
      events.forEach(name => document.removeEventListener(name, schedule, true));
      window.removeEventListener('resize', schedule);
      scene.scale.off('resize', schedule);
      clear();
    };
    scene.events.once('shutdown', destroy);
    schedule();
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), failure, clip,
      labels: scene.shellLabelSnapshot(labels), controls: controls.map(control => ({ ...control })) }) };
  }
  window.LegendPhaserRoadSceneV1 = Object.freeze({ create });
})();
