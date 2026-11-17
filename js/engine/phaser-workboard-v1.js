/* Guarded presentation for the production Work Board and job activities.
 * The production controllers own job grading, timers, rewards and saves. DOM buttons keep
 * their callbacks, keyboard/touch input and semantic copy throughout.
 */
(() => {
  function create(scene) {
    let painted = null, signature = '', pending = null, failure = '';
    let updateTiming = null;
    let objects = [], tagged = [], labels = [], clipMask = null, clipBounds = null;
    const artKey = 'legend-native-workboard-header';
    function clear() {
      updateTiming = null;
      painted?.classList.remove('legend-phaser-workboard');
      tagged.forEach(node => node.removeAttribute('data-phaser-workboard-copy'));
      objects.forEach(object => object.destroy(true));
      clipMask?.destroy();
      if (scene.textures.exists(artKey)) scene.textures.remove(artKey);
      painted = null; signature = ''; tagged = []; objects = []; labels = [];
      clipMask = null; clipBounds = null;
    }
    function sync() {
      if (window.LegendDomUiRestore?.enabled) { clear(); return; }
      const header = document.querySelector('.ash099-head[data-ash-service="work"]');
      const screen = header?.closest('.ash099-screen');
      if (!screen || screen.closest('[hidden]')) { clear(); return; }
      const art = header.querySelector(':scope > img');
      const back = screen.querySelector('#ashBack');
      const activity = screen.querySelector('.ash099-job-game');
      const mode = activity?.dataset.jobMode || 'board';
      const texts = [...header.querySelectorAll('.ash099-kicker,h1,p'), back];
      const controls = [back];
      let complete = texts.length === 4;
      const collect = (selector, count) => {
        const nodes = [...screen.querySelectorAll(selector)];
        if (count !== undefined) complete = complete && nodes.length === count;
        texts.push(...nodes);
      };
      const catalog = window.LegendAshmereJobCatalogV099?.forRegion(header.dataset.ashRegion === 'greyfen' ? 'Greyfen' : 'Ashmere');
      if (!activity) {
        const cards = [...screen.querySelectorAll('[data-job-open]')];
        complete = complete && Boolean(catalog) && cards.map(node => node.dataset.jobOpen).join(',') === Object.keys(catalog || {}).join(',');
        collect('.ash099-job-board-intro > span,.ash099-job-board-intro > strong,.ash099-job-board-intro > small', 3);
        collect('.ash099-workboard-daily-entry > div > span,.ash099-workboard-daily-entry > div > strong,.ash099-workboard-daily-entry > div > small,#openDailyFieldBoard', 4);
        cards.forEach(card => {
          const fields = [...card.querySelectorAll(':scope > span,:scope > strong,:scope > small,:scope > em')];
          complete = complete && fields.length === 4; texts.push(...fields);
        });
        controls.push(...cards, screen.querySelector('#openDailyFieldBoard'));
        if (header.dataset.ashRegion !== 'greyfen') {
          collect('.ash099-field-posting-copy > span,.ash099-field-posting-copy > h2,.ash099-field-posting-copy > p,.ash099-field-posting-reward > *,#openAshmereFieldContracts', 7);
          controls.push(screen.querySelector('#openAshmereFieldContracts'));
        }
      } else {
        const job = Object.values(catalog || {}).find(item => item.title === header.querySelector('h1')?.textContent);
        complete = complete && Boolean(job) && job.mode === mode;
        collect('.ash099-job-meta > span,#backJobs', 4);
        controls.push(screen.querySelector('#backJobs'));
        if (mode === 'timing') {
          collect('.ash099-job-timing > span,.ash099-job-timing > p,.ash099-job-timing > small,#jobStrike,.ash099-job-game > p:not(#jobResult)', 5);
          controls.push(screen.querySelector('#jobStrike'));
          complete = complete && Boolean(screen.querySelector('#jobTrack .ash099-job-zone')) && Boolean(screen.querySelector('#jobMarker'));
        } else {
          collect('.ash099-job-challenge-heading > span,.ash099-job-challenge-heading > h2,.ash099-job-challenge-heading > p', 3);
          if (mode === 'sequence') {
            collect('#jobStartSequence,#jobSequenceStatus', 2);
            const preview = screen.querySelector('#jobSequencePreview');
            if (preview?.children.length) collect('#jobSequencePreview > span,#jobSequencePreview > strong', 2);
            else texts.push(preview);
            const actions = [...screen.querySelectorAll('[data-job-sequence]')];
            complete = complete && actions.length > 0 && actions.map(node => node.dataset.jobSequence).join(',') === job?.actions?.join(',');
            actions.forEach(node => {
              const fields = [...node.querySelectorAll(':scope > span,:scope > strong')];
              complete = complete && fields.length === 2; texts.push(...fields);
            });
            controls.push(...actions, screen.querySelector('#jobStartSequence'));
          } else if (['signal','ledger','triage','route','track'].includes(mode)) {
            const choices = [...screen.querySelectorAll('[data-job-choice]')];
            complete = complete && choices.length > 0 && choices.length === job?.choices?.length;
            choices.forEach(node => {
              const fields = [...node.querySelectorAll('.ash099-job-choice-index,.ash099-job-choice-copy > strong,.ash099-job-choice-arrow')];
              complete = complete && fields.length === 3; texts.push(...fields, ...node.querySelectorAll('.ash099-job-choice-copy > small'));
            });
            controls.push(...choices);
          } else complete = false;
        }
        const result = screen.querySelector('#jobResult');
        complete = complete && Boolean(result);
        if (result?.textContent.trim() && result.getBoundingClientRect().height) texts.push(result);
      }
      if (!complete || texts.some(node => !node?.textContent.trim()) || controls.some(node => !node) || !art?.complete || !art.naturalWidth) {
        failure = 'Work Board source or artwork incomplete'; clear(); return;
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
      const next = JSON.stringify([size, clip, art.currentSrc, ...[screen, header, ...texts, ...controls].map(node =>
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
          if (!container.filters?.internal?.addMask?.(maskArt, false, scene.cameras.main, 'world')) throw new Error('WorkBoard viewport mask unavailable');
        } else {
          clipMask = maskArt.createGeometryMask(); container.setMask(clipMask);
        }
        clipBounds = clip;
        const add = object => { container.add(object); return object; };
        const graphics = add(scene.add.graphics());
        const panel = (node, color, focus = false, target = graphics) => {
          const box = rect(node);
          if (!box.width || !box.height) throw new Error('WorkBoard layout unavailable');
          target.fillStyle(color, 0.97).fillRect(box.x, box.y, box.width, box.height);
          target.lineStyle(focus ? 2 : 1, focus ? 0xffe5a0 : 0x9a8051, focus ? 1 : 0.65).strokeRect(box.x, box.y, box.width, box.height);
        };
        panel(screen, 0x10170f);
        screen.querySelectorAll('.ash099-job-board-intro,.ash099-field-posting,.ash099-workboard-daily-entry,.ash099-job-game,.ash099-job-meta > span,.ash099-job-challenge,#jobSequencePreview').forEach(node => panel(node, 0x192318));
        controls.forEach(node => panel(node,
          node.disabled ? 0x282c25 : 0x20291c,
          !node.disabled && (node === document.activeElement || node.matches(':hover'))));
        const result = screen.querySelector('#jobResult');
        if (texts.includes(result)) panel(result, 0x253020, result === document.activeElement);
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
          if (!label) throw new Error('WorkBoard copy cannot fit: ' + node.tagName + ' ' + node.textContent.trim());
          add(label); labels.push(label.text);
        });
        if (mode === 'timing') {
          const track = screen.querySelector('#jobTrack');
          panel(track, 0x0b130d);
          const meter = add(scene.add.graphics());
          updateTiming = () => {
            if (!track.isConnected) return;
            const lane = rect(track), zone = rect(track.querySelector('.ash099-job-zone')), marker = rect(track.querySelector('#jobMarker'));
            meter.clear().fillStyle(0xcba65a).fillRect(zone.x, zone.y, zone.width, zone.height);
            meter.fillStyle(0xf5ffe9).fillRect(Math.max(lane.x, Math.min(marker.x, lane.x + lane.width - marker.width)), marker.y, marker.width, marker.height);
          };
          updateTiming();
        }
        painted = screen; signature = next; tagged = texts; failure = '';
        tagged.forEach(node => node.setAttribute('data-phaser-workboard-copy', 'true'));
        screen.classList.add('legend-phaser-workboard');
      } catch (error) { failure = error.message; clear(); }
    }
    function schedule() {
      if (pending !== null) return;
      pending = requestAnimationFrame(() => { pending = null; sync(); });
    }
    const tick = () => updateTiming?.();
    scene.events.on('update', tick);
    const events = ['scroll', 'focusin', 'focusout', 'pointerover', 'pointerout', 'load', 'error'];
    events.forEach(name => document.addEventListener(name, schedule, true));
    window.addEventListener('resize', schedule); scene.scale.on('resize', schedule);
    const observer = new MutationObserver(schedule);
    const root = document.getElementById('root');
    if (root) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['disabled', 'hidden', 'src', 'data-job-mode'] });
    function destroy() {
      scene.events.off('update', tick);
      if (pending !== null) cancelAnimationFrame(pending);
      observer.disconnect();
      events.forEach(name => document.removeEventListener(name, schedule, true));
      window.removeEventListener('resize', schedule); scene.scale.off('resize', schedule); clear();
    }
    scene.events.once('shutdown', destroy); schedule();
    return { sync, destroy, snapshot: () => ({ active: Boolean(painted), labels: [...labels], failure, clipBounds,
      focused: painted?.querySelector(':focus')?.dataset.jobOpen || painted?.querySelector(':focus')?.dataset.jobChoice || painted?.querySelector(':focus')?.dataset.jobSequence || painted?.querySelector(':focus')?.id || '',
      mode: painted?.querySelector('.ash099-job-game')?.dataset.jobMode || (painted ? 'board' : ''), art: painted?.querySelector('.ash099-head > img')?.getAttribute('src') || '' }) };
  }
  window.LegendPhaserWorkboardV1 = Object.freeze({ create });
})();
