const { test, expect } = require('@playwright/test');

test.use({ hasTouch: true });

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`route boards preserve native navigation and saves at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.LegendStorage.savePlayer(window.LegendStorage.normalize({
        username: 'RouteBoardQA', className: 'Ranger', hp: 40, maxHp: 40, gold: 50,
        currentRegion: 'Ashmere', discoveredRegions: ['Ashmere', 'Greyfen'],
        flags: { introV094Complete: true, customRouteProbe: 'preserve' }
      }));
      window.LegendAshmereV099.route('routes');
    });
    const active = () => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeRouteBoard.active);
    await expect.poll(active).toBe(true);
    await expect(page.locator('.ash099-card')).toHaveCount(3);
    await page.locator('[data-ash-view="regions"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.reg100')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeRouteBoard.kind)).toBe('regions');
    await page.locator('#regBack').tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    await page.evaluate(() => {
      const player = window.LegendStorage.loadPlayer();
      player.currentRegion = 'Greyfen';
      window.LegendStorage.savePlayer(player);
      window.LegendAshmereV099.route('routes');
    });
    await expect.poll(active).toBe(true);
    await expect(page.locator('.ash099-card')).toHaveCount(4);
    const save = await page.evaluate(() => localStorage.getItem(window.LEGEND_DATA.SAVE_KEY));
    await page.locator('#ashBack').scrollIntoViewIfNeeded();
    await page.locator('#ashBack').tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem(window.LEGEND_DATA.SAVE_KEY))).toBe(save);
    await page.evaluate(() => window.LegendAshmereV099.route('routes'));
    await expect.poll(active).toBe(true);
    await page.locator('.ash099-card strong').first().evaluate(node => { node.textContent = ''; });
    await expect.poll(active).toBe(false);
    await expect(page.locator('#ashBack')).not.toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const width of [1440, 390]) {
  test(`route and regional map paint stays clear of shell controls and open drawers at ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({width, height: width === 390 ? 844 : 900});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(() => {
      sessionStorage.setItem('legend-phaser-production-engine-awakened-v1','ready');
      localStorage.setItem('legend-roads-of-ashmere-v09',JSON.stringify({username:'RouteClipQA',currentRegion:'Ashmere',flags:{introV094Complete:true},futureNavigation:{keep:73}}));
    });
    await page.goto('/');
    await page.waitForFunction(() => window.__legendPhaserWorldReady);
    await page.evaluate(() => LegendAshmereV099.route('routes'));
    const raw = () => page.evaluate(() => [localStorage.getItem('legend-roads-of-ashmere-v09'),localStorage.getItem('legend-settings-v1'),localStorage.getItem('legend-road-sound'),sessionStorage.getItem('legend-awakening-return-to-town-v1')]);
    const before = await raw();
    const clearShell = async () => {
      await expect.poll(() => page.evaluate(() => {
        const snap=LegendPhaserWorldV1.snapshot().nativeRouteBoard, clip=snap.clipBounds;
        if (!snap.active || !clip) return false;
        const scene=LegendPhaserWorldV1.engine.scene.getScene('RealmScene'), canvas=scene.game.canvas.getBoundingClientRect(), size=scene.dimensions();
        const hud=document.querySelector('.lws-hud').getBoundingClientRect(), dock=document.querySelector('.lws-bottom-bar').getBoundingClientRect();
        const x=p=>(p-canvas.left)*size.width/canvas.width, y=p=>(p-canvas.top)*size.height/canvas.height;
        if (clip.y < y(hud.bottom)-1 || clip.y+clip.height > y(dock.top)+1 || clip.height <= 0) return false;
        for (const side of ['left','right']) {
          const panel=document.querySelector('#lws-panel-'+side), rect=panel.getBoundingClientRect();
          if (panel.inert || panel.getAttribute('aria-hidden')==='true') continue;
          if (side==='left' && clip.x < x(rect.right)-1) return false;
          if (side==='right' && clip.x+clip.width > x(rect.left)+1) return false;
        }
        return true;
      })).toBe(true);
    };
    for (const kind of ['routes','regions']) {
      if (kind === 'regions') {
        await page.locator('[data-ash-view="regions"]').focus();
        await page.keyboard.press('Enter');
      }
      await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRouteBoard.kind)).toBe(kind);
      for (const viewport of [{width,height:width===390?844:900},{width:844,height:390},{width:390,height:844}]) {
        await page.setViewportSize(viewport);
        await clearShell();
        if (viewport.width < 1200) {
          const closed = await page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRouteBoard.clipBounds);
          // Include normal-motion drawer opening/closing; no timing overrides.
          await page.emulateMedia({reducedMotion:'no-preference'});
          for (const side of ['left','right']) {
            await page.locator(`[data-world-action="toggle-${side}"]`).tap();
            await clearShell();
            await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRouteBoard.clipBounds.width)).toBeLessThan(closed.width-50);
            await page.locator(`[data-world-action="toggle-${side}"]`).tap();
            await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRouteBoard.clipBounds.width)).toBeCloseTo(closed.width,0);
            await clearShell();
          }
          await page.emulateMedia({reducedMotion:'reduce'});
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
    expect(await raw()).toEqual(before);
    await page.locator('#regBack').tap();
    await expect(page.locator('.ash100-town')).toBeVisible();
    expect(await raw()).toEqual(before);
    expect(await page.evaluate(() => LegendStorage.loadPlayer().futureNavigation)).toEqual({keep:73});
    expect(errors).toEqual([]);
  });
}

test('normal-motion regional entry retains native labels through focus and hover', async ({page}) => {
  test.setTimeout(90000);
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(() => {
    sessionStorage.setItem('legend-phaser-production-engine-awakened-v1','ready');
    localStorage.setItem('legend-roads-of-ashmere-v09',JSON.stringify({username:'MovingMapQA',currentRegion:'Ashmere',flags:{introV094Complete:true},futureNavigation:{keep:91}}));
  });
  await page.goto('/');
  await page.waitForFunction(() => window.__legendPhaserWorldReady);
  await page.evaluate(() => LegendAshmereV099.route('routes'));
  const saved = await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'));
  await page.locator('[data-ash-view="regions"]').click();
  await expect(page.locator('#legend-scene-curtain')).not.toHaveClass(/is-covering|is-revealing/);
  await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeRouteBoard.kind)).toBe('regions');
  const stable = async () => {
    const frames = await page.evaluate(() => new Promise(resolve => {
      const states=[],end=performance.now()+1000;
      function sample(){const map=LegendPhaserWorldV1.snapshot().nativeRouteBoard;states.push(map.active&&map.kind==='regions'&&map.labels.includes('Roads & Regions')&&map.labels.includes('Back to Ashmere'));if(performance.now()<end)requestAnimationFrame(sample);else resolve(states);}
      sample();
    }));
    expect(frames.length).toBeGreaterThan(5);
    expect(frames.every(Boolean)).toBe(true);
  };
  await stable();
  const back=page.locator('#regBack');await back.scrollIntoViewIfNeeded();await back.focus();await back.hover();await stable();
  await page.keyboard.press('Enter');await expect(page.locator('.ash100-town')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBe(saved);
  expect(await page.evaluate(() => LegendStorage.loadPlayer().futureNavigation)).toEqual({keep:91});
});
