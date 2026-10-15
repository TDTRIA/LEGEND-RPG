const { test, expect } = require('@playwright/test');

async function startFreshCharacter(page, name = 'RoadDiscoveryQA') {
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  ` });
  await expect(page.locator('.v120-title')).toBeVisible();
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.locator('#v094Name').fill(name);
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.locator('[data-class="Ranger"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Begin the Road/i }).click();
  await page.getByRole('button', { name: /Enter Ashmere/i }).click();
  await expect(page.locator('.ash100-town')).toBeVisible();
}

test('Old Road discovery hotspot reveals and resolves a point of interest', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await startFreshCharacter(page);
  await page.getByRole('navigation', { name: 'Ashmere terminal navigation' }).getByRole('button', { name: /Routes/i }).click();
  await page.getByRole('button', { name: /The Old Road/i }).click();
  await expect(page.locator('.exp100-scene-live')).toBeVisible();
  await page.locator('#routeReeds').click();
  await page.locator('#push').click();
  await expect(page.locator('.exp100-scene-live')).toHaveAttribute('data-stage', '1');
  await expect(page.locator('.exp100-hotspot-find')).toContainText('Look closer');

  const before = await page.evaluate(() => {
    const btn = document.querySelector('.exp100-hotspot-find');
    const selector = '[data-ash-view="road"],[data-travel],[data-unlock]';
    const chain = [];
    for (let node = btn; node; node = node.parentElement) {
      chain.push({ tag: node.tagName, id: node.id || '', className: typeof node.className === 'string' ? node.className : '', matchedTransitionAncestor: node.matches?.(selector) || false });
    }
    window.__roadDiscoveryQa = {
      events: [],
      windowCapture: 0, documentCapture: 0, buttonCapture: 0,
      buttonBubble: 0, documentBubble: 0, windowBubble: 0
    };
    const isHotspot = event => Boolean(event.target?.closest?.('.exp100-hotspot-find'));
    for (const type of ['pointerdown','pointerup','pointercancel','mousedown','mouseup','click']) {
      const record = (event, phase) => {
        window.__roadDiscoveryQa.events.push({
          type, phase, trusted:event.isTrusted,
          targetTag:event.target?.tagName || null,
          targetId:event.target?.id || '',
          targetClass:typeof event.target?.className==='string'?event.target.className:'',
          onHotspot:isHotspot(event),
          clientX:event.clientX,clientY:event.clientY,
          defaultPrevented:event.defaultPrevented
        });
      };
      window.addEventListener(type, event => {
        record(event,'window-capture');
        if (isHotspot(event) && type === 'click') window.__roadDiscoveryQa.windowCapture += 1;
      }, true);
      document.addEventListener(type, event => {
        record(event,'document-capture');
        if (isHotspot(event) && type === 'click') window.__roadDiscoveryQa.documentCapture += 1;
      }, true);
      btn?.addEventListener(type, event => {
        record(event,'button-bubble');
        if (isHotspot(event) && type === 'click') window.__roadDiscoveryQa.buttonBubble += 1;
      });
    }
    btn?.addEventListener('click', event => { if (isHotspot(event)) window.__roadDiscoveryQa.buttonCapture += 1; }, true);
    document.addEventListener('click', event => { if (isHotspot(event)) window.__roadDiscoveryQa.documentBubble += 1; });
    window.addEventListener('click', event => { if (isHotspot(event)) window.__roadDiscoveryQa.windowBubble += 1; });
    return {
      url: location.href,
      timeOrigin: performance.timeOrigin,
      hotspot: btn?.outerHTML || null,
      transitionAncestor: btn?.closest(selector)?.outerHTML || null,
      chain
    };
  });
  console.log('ROAD_DISCOVERY_BEFORE_CLICK ' + JSON.stringify(before));
  await page.locator('.exp100-hotspot-find').click();
  await page.waitForTimeout(600);

  const diagnostic = await page.evaluate(() => ({
    counters: window.__roadDiscoveryQa || null,
    url: location.href,
    timeOrigin: performance.timeOrigin,
    curtainClass: document.getElementById('legend-scene-curtain')?.className || null,
    transitionBypass: Boolean(window.__legendSceneTransitionBypass),
    panelCount: document.querySelectorAll('.exp100-discovery-beat').length,
    inspectCount: document.querySelectorAll('#poiInspect').length,
    hotspot: document.querySelector('.exp100-hotspot-find')?.outerHTML || null,
    stage: document.querySelector('.exp100-scene-live')?.dataset.stage || null,
    playerStage: window.LegendRuntimeV080?.loadPlayer()?.flags?.roadExpeditionV100?.stage ?? null
  }));
  const hitTest = await page.evaluate(() => {
    const btn = document.querySelector('.exp100-hotspot-find');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY },
      hitTag: hit?.tagName || null,
      hitId: hit?.id || null,
      hitClass: typeof hit?.className === 'string' ? hit.className : '',
      hitIsHotspot: Boolean(hit?.closest?.('.exp100-hotspot-find')),
      buttonPointerEvents: getComputedStyle(btn).pointerEvents,
      buttonPosition: getComputedStyle(btn).position,
      buttonZIndex: getComputedStyle(btn).zIndex,
      hotspotsPointerEvents: getComputedStyle(btn.parentElement).pointerEvents,
      sceneOverflow: getComputedStyle(btn.closest('.exp100-scene-live')).overflow,
      activeElement: document.activeElement?.outerHTML?.slice(0,240) || null,
      buttonOnclickType: typeof btn.onclick,
      clickDescriptor: String(Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'click')?.value || '').slice(0,100)
    };
  });
  console.log('ROAD_DISCOVERY_DIAGNOSTIC ' + JSON.stringify({ ...diagnostic, hitTest, pageErrors, consoleErrors }));

  const physicalMouse = await page.evaluate(() => {
    const rect = document.querySelector('.exp100-hotspot-find')?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width/2, y: rect.top + rect.height/2 } : null;
  });
  if (physicalMouse) await page.mouse.click(physicalMouse.x, physicalMouse.y);
  const mouseDiagnostic = await page.evaluate(() => ({
    counters: window.__roadDiscoveryQa || null,
    panelCount: document.querySelectorAll('.exp100-discovery-beat').length,
    inspectCount: document.querySelectorAll('#poiInspect').length,
    hotspot: document.querySelector('.exp100-hotspot-find')?.outerHTML || null
  }));
  console.log('ROAD_DISCOVERY_PHYSICAL_MOUSE ' + JSON.stringify(mouseDiagnostic));

  const synthetic = await page.evaluate(() => {
    const btn = document.querySelector('.exp100-hotspot-find');
    if (!btn) return null;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, view: window, detail: 1 });
    const dispatched = btn.dispatchEvent(event);
    return {
      dispatched,
      defaultPrevented: event.defaultPrevented,
      clickCounts: window.__roadDiscoveryQa || null,
      panelCount: document.querySelectorAll('.exp100-discovery-beat').length,
      inspectCount: document.querySelectorAll('#poiInspect').length,
      buttonStillConnected: btn.isConnected
    };
  });
  console.log('ROAD_DISCOVERY_SYNTHETIC_CLICK ' + JSON.stringify(synthetic));
  await expect(page.locator('.exp100-discovery-beat'), 'Discovery panel was not created. Diagnostic: ' + JSON.stringify({ diagnostic, hitTest, synthetic, pageErrors, consoleErrors })).toBeVisible();
  await expect(page.locator('.exp100-discovery-beat')).toContainText(/Tracks Beneath the Blue Light/i);
  await page.locator('#poiInspect').click();
  await expect(page.locator('.exp100-head')).toContainText(/Road Pressure rises by 4/i);
  expect(pageErrors).toEqual([]);
});
