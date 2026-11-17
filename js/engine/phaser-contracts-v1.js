/* Guarded presentation for the production daily board, caches and road contracts.
 * The production controllers own calendar resets, claims, rewards and saves. DOM buttons keep
 * their callbacks, keyboard/touch input and semantic copy throughout.
 */
(() => {
  function create(scene) {
    let painted = null, signature = '', pending = null, failure = '';
    let objects = [], tagged = [], labels = [], clipMask = null, clipBounds = null;
    const artKey = 'legend-native-contracts-header';
    function clear() {
      painted?.classList.remove('legend-phaser-contracts');
      tagged.forEach(node => node.removeAttribute('data-phaser-contracts-copy'));
      objects.forEach(object => object.destroy(true));
      clipMask?.destroy();
      if (scene.textures.exists(artKey)) scene.textures.remove(artKey);
      painted = null; signature = ''; tagged = []; objects = []; labels = [];
      clipMask = null; clipBounds = null;
    }
    function sync() {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const board = document.querySelector('.ash099-daily-board');
      const screen = board?.closest('.ash099-screen');
      const header = screen?.querySelector('.ash099-head[data-ash-service="quest"]');
      if (!header || screen.closest('[hidden]')) { clear(); return; }
      const art = header.querySelector(':scope > img');
      const odds = screen.querySelector('.ash099-cache-odds');
      const summary = odds?.querySelector('summary');
      const back = screen.querySelector('#ashBack');
      const notice = screen.querySelector('.ash099-daily-notice');
      const daily = [...screen.querySelectorAll('[data-daily-id]')];
      const contracts = [...screen.querySelectorAll('[data-contract-id]')];
      const texts = [...header.querySelectorAll('.ash099-kicker,h1,p'), back];
      const controls = [...screen.querySelectorAll('button'), summary];
      let complete = texts.length === 4 &&
        daily.map(node => node.dataset.dailyId).join(',') === 'survey,hold,return' &&
        contracts.map(node => node.dataset.contractId).join(',') === 'watchlightSurvey,blackrootProof,maraSafeReturn,movedCairn,blackrootTrailSurvey';
      const collect = (parent, selector, count) => {
        const nodes = [...parent.querySelectorAll(selector)];
        complete = complete && nodes.length === count; texts.push(...nodes);
      };
      collect(screen, '.ash099-daily-intro > span,.ash099-daily-intro > h2,.ash099-daily-intro > p,.ash099-contract-intro > span,.ash099-contract-intro > h2,.ash099-contract-intro > p', 6);
      collect(screen, '.ash099-road-cache-copy > span,.ash099-road-cache-copy > h2,.ash099-road-cache-copy > p,.ash099-cache-key-count,#dailyCacheOpen', 5);
      daily.forEach(card => {
        collect(card, '.ash099-daily-card-head > div > span,.ash099-daily-card-head h3,:scope > p,.ash099-daily-progress-copy > span,.ash099-daily-progress-copy > strong,.ash099-daily-reward,:scope > button', 7);
        complete = complete && Boolean(card.querySelector('.ash099-daily-progress > i'));
      });
      contracts.forEach(card => collect(card, ':scope > header > span,:scope > header > small,:scope > h2,:scope > p,.ash099-contract-objective > span,.ash099-contract-objective > strong,.ash099-contract-objective > small,:scope > footer > div > span,:scope > footer > div > strong,:scope > footer > div > small,:scope > footer > button,:scope > footer > span', 11));
      texts.push(summary);
      const probabilities = [...(odds?.querySelectorAll('li') || [])];
      complete = complete && probabilities.length === 5 && probabilities.every(node => node.textContent.trim());
      if (odds?.open) texts.push(...probabilities);
      if (notice) texts.push(notice);
      if (!complete || texts.some(node => !node?.textContent.trim()) || controls.some(node => !node) || !art?.complete || !art.naturalWidth) {
        failure = 'Contract source or artwork incomplete'; clear(); return;
      }
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
      const next = JSON.stringify([size, clip, art.currentSrc, odds.open, ...[screen, header, ...texts, ...controls].map(node =>
        [rect(node), node.textContent, node.disabled, node.getAttribute('aria-selected'), node === document.activeElement, node.matches(':hover')])]);
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
          if (!container.filters?.internal?.addMask?.(maskArt, false, scene.cameras.main, 'world')) throw new Error('Contracts viewport mask unavailable');
        } else {
          clipMask = maskArt.createGeometryMask(); container.setMask(clipMask);
        }
        clipBounds = clip;
        const add = object => { container.add(object); return object; };
        const graphics = add(scene.add.graphics());
        const panel = (node, color, focus = false, target = graphics) => {
          const box = rect(node);
          if (!box.width || !box.height) throw new Error('Contracts layout unavailable');
          target.fillStyle(color, 0.97).fillRect(box.x, box.y, box.width, box.height);
          target.lineStyle(focus ? 2 : 1, focus ? 0xffe5a0 : 0x9a8051, focus ? 1 : 0.65).strokeRect(box.x, box.y, box.width, box.height);
        };
        panel(screen, 0x10170f);
        screen.querySelectorAll('.ash099-daily-intro,.ash099-contract-intro,.ash099-daily-card,.ash099-road-cache,.ash099-cache-odds,.ash099-contract-card,.ash099-contract-objective').forEach(node => panel(node, node.classList.contains('is-ready') ? 0x3b3722 : 0x192318));
        controls.forEach(node => panel(node,
          node.disabled ? 0x282c25 : 0x20291c,
          !node.disabled && (node === document.activeElement || node.matches(':hover'))));
        if (notice) panel(notice, 0x253020, notice === document.activeElement);
        daily.forEach(card => {
          const lane = rect(card.querySelector('.ash099-daily-progress'));
          const fill = card.querySelector('.ash099-daily-progress > i');
          const fraction = Math.max(0, Math.min(1, parseFloat(fill.style.width) / 100));
          if (!Number.isFinite(fraction)) throw new Error('Contract progress unavailable');
          graphics.fillStyle(0x29362a).fillRect(lane.x, lane.y, lane.width, lane.height);
          graphics.fillStyle(0xc9ad69).fillRect(lane.x, lane.y, lane.width * fraction, lane.height);
        });
        const disclosure = rect(summary), arrowX = disclosure.x + 9 * sx, arrowY = disclosure.y + disclosure.height / 2;
        graphics.fillStyle(0xe4cb86);
        if (odds.open) graphics.fillTriangle(arrowX - 4, arrowY - 3, arrowX + 4, arrowY - 3, arrowX, arrowY + 3);
        else graphics.fillTriangle(arrowX - 3, arrowY - 4, arrowX - 3, arrowY + 4, arrowX + 3, arrowY);

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
          const color = node.closest('button:disabled') ? '#b9c1b1' : node.matches('h1,h2,strong,em') ? '#f3e4c1' : '#e0e4d8';
          const label = scene.createShellLabel(node, rect(node), color, sx, sy, 32);
          if (!label) throw new Error('Contracts copy cannot fit: ' + node.tagName + ' ' + node.textContent.trim());
          add(label); labels.push(label.text);
        });
        painted = screen; signature = next; tagged = texts; failure = '';
        tagged.forEach(node => node.setAttribute('data-phaser-contracts-copy', 'true'));
        screen.classList.add('legend-phaser-contracts');
      } catch (error) { failure = error.message; clear(); }
    }
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const events = ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout', 'load', 'error', 'toggle'];
    events.forEach(name => document.addEventListener(name, schedule, true));
    window.addEventListener('resize', schedule); scene.scale.on('resize', schedule);
    const observer = new MutationObserver(schedule);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['disabled', 'hidden', 'src', 'open'] });
    function destroy() {
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect();
      events.forEach(name => document.removeEventListener(name, schedule, true));
      window.removeEventListener('resize', schedule); scene.scale.off('resize', schedule); clear();
    }
    scene.events.once('shutdown', destroy); schedule();
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), labels: [...labels], failure, clipBounds,
      focused: painted?.querySelector(':focus')?.dataset.dailyClaim || painted?.querySelector(':focus')?.dataset.contractAccept || painted?.querySelector(':focus')?.dataset.contractTurnin || painted?.querySelector(':focus')?.id || '',
      oddsOpen: Boolean(painted?.querySelector('.ash099-cache-odds')?.open), art: painted?.querySelector('.ash099-head > img')?.getAttribute('src') || '' }) };
  }
  window.LegendPhaserContractsV1 = Object.freeze({ create });
})();
