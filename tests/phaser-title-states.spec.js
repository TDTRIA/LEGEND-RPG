const { test, expect } = require('@playwright/test');

test('Ashmere title uses the existing moonlit scene and crisp DOM menu at desktop and mobile sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
  await page.goto('/');

  await expect(page.locator('.title-v230-ashmere-dom')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.ready)).toBe(true);
  await expect(page.locator('.v120-title-backdrop')).toHaveAttribute('src', /title_bg_ashmere_road_v089\.jpg/);
  await expect.poll(() => page.locator('.v120-title-backdrop').evaluate(image =>
    image.complete && image.naturalWidth > 0
  )).toBe(true);
  await expect(page.locator('.v140-realm-overview')).toBeHidden();
  await expect(page.locator('#newPrimary')).toBeVisible();
  await expect(page.locator('#newPrimary .v136-menu-copy strong')).toBeVisible();

  const mobile = await page.evaluate(() => {
    const root = document.querySelector('.title-v230-ashmere-dom');
    const menu = document.querySelector('.v136-rpg-menu');
    const button = document.querySelector('#newPrimary');
    const rect = button?.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      rootClass: root?.classList.contains('title-v230-ashmere-dom'),
      nativePainter: document.body.classList.contains('legend-phaser-title-ui-active'),
      nativeTitleUi: window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi,
      menuWidth: menu?.getBoundingClientRect().width || 0,
      button: rect ? { left: rect.left, right: rect.right, height: rect.height } : null,
      textVisibility: button ? getComputedStyle(button.querySelector('strong')).visibility : ''
    };
  });
  expect(mobile.overflow).toBe(false);
  expect(mobile.rootClass).toBe(true);
  expect(mobile.nativePainter).toBe(false);
  expect(mobile.nativeTitleUi).toBe(false);
  expect(mobile.menuWidth).toBeGreaterThan(0);
  expect(mobile.button.left).toBeGreaterThanOrEqual(0);
  expect(mobile.button.right).toBeLessThanOrEqual(390);
  expect(mobile.button.height).toBeGreaterThanOrEqual(40);
  expect(mobile.textVisibility).toBe('visible');

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#newPrimary')).toBeVisible();
  const geometry = await page.evaluate(() => {
    const bounds = selector => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        x: Math.round(rect.x), y: Math.round(rect.y),
        width: Math.round(rect.width), height: Math.round(rect.height),
        position: style.position, widthStyle: style.width, heightStyle: style.height,
        margin: style.margin, transform: style.transform, maxWidth: style.maxWidth
      };
    };
    const scene = window.LegendPhaserWorldV1?.engine?.scene?.getScene('RealmScene');
    const background = scene?.background;
    const body = document.body;
    const title = document.querySelector('.title-v230-ashmere-dom');
    const summarizePseudo = (node, pseudo) => {
      const style = node ? getComputedStyle(node, pseudo) : null;
      return style ? {
        content: style.content, display: style.display, position: style.position,
        top: style.top, right: style.right, bottom: style.bottom, left: style.left,
        width: style.width, height: style.height, inset: style.inset,
        background: style.background, backgroundImage: style.backgroundImage,
        opacity: style.opacity, zIndex: style.zIndex, boxShadow: style.boxShadow
      } : null;
    };
    const exactOverlayCandidates = Array.from(document.querySelectorAll('body *')).flatMap(node => {
      const rect = node.getBoundingClientRect();
      if (Math.abs(rect.x - 270) > 3 || Math.abs(rect.y) > 3 ||
          Math.abs(rect.width - 900) > 3 || Math.abs(rect.height - 720) > 3) return [];
      const style = getComputedStyle(node);
      return [{
        tag: node.tagName, id: node.id, className: String(node.className || ''),
        background: style.background, backgroundImage: style.backgroundImage,
        opacity: style.opacity, position: style.position, zIndex: style.zIndex,
        filter: style.filter, boxShadow: style.boxShadow
      }];
    }).slice(0, 20);
    const sceneObjects = (scene?.children?.list || []).map(object => ({
      type: object.type, name: object.name || '', key: object.texture?.key || '',
      x: Math.round(object.getBounds?.().x ?? object.x ?? 0),
      y: Math.round(object.getBounds?.().y ?? object.y ?? 0),
      width: Math.round(object.displayWidth ?? object.width ?? 0),
      height: Math.round(object.displayHeight ?? object.height ?? 0),
      alpha: Number(object.alpha ?? 1).toFixed(3), depth: object.depth ?? 0,
      visible: object.visible !== false, active: object.active !== false
    })).filter(object => object.width >= 700 && object.height >= 500).slice(0, 20);
    return {
      viewport: { width: innerWidth, height: innerHeight },
      bodyClass: body.className,
      body: bounds('body'),
      container: bounds('#game-container'),
      canvas: bounds('#game-container canvas'),
      root: bounds('#root'),
      title: bounds('.title-v230-ashmere-dom'),
      backdrop: bounds('.v120-title-backdrop'),
      bodyBefore: summarizePseudo(body, '::before'),
      bodyAfter: summarizePseudo(body, '::after'),
      titleBefore: summarizePseudo(title, '::before'),
      titleAfter: summarizePseudo(title, '::after'),
      exactOverlayCandidates,
      sceneSize: scene ? { width: scene.scale.width, height: scene.scale.height } : null,
      phaserScale: window.LegendPhaserWorldV1?.engine?.scale
        ? { width: window.LegendPhaserWorldV1.engine.scale.width, height: window.LegendPhaserWorldV1.engine.scale.height }
        : null,
      worldImage: background?.active ? {
        x: Math.round(background.x), y: Math.round(background.y),
        width: Math.round(background.displayWidth), height: Math.round(background.displayHeight)
      } : null,
      sceneObjects
    };
  });
  expect(geometry.bodyBefore.display).toBe('none');
  expect(geometry.bodyAfter.display).toBe('none');
  expect(geometry.bodyBefore.content).toBe('none');
  expect(geometry.bodyAfter.content).toBe('none');
  expect(geometry.exactOverlayCandidates).toHaveLength(0);
  console.log('[LEGEND title world geometry]', JSON.stringify(geometry));
  await test.info().attach('ashmere-title-desktop', {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png'
  });

  const desktop = await page.evaluate(() => {
    const button = document.querySelector('#newPrimary');
    const label = button?.querySelector('strong');
    const focusStyle = (() => {
      button?.focus();
      return getComputedStyle(button);
    })();
    const rect = button?.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      nativePainter: document.body.classList.contains('legend-phaser-title-ui-active'),
      nativeTitleUi: window.LegendPhaserWorldV1?.snapshot?.()?.nativeTitleUi,
      backdrop: document.querySelector('.v120-title-backdrop')?.getAttribute('src') || '',
      labelVisibility: label ? getComputedStyle(label).visibility : '',
      focusOutline: focusStyle?.outlineStyle || '',
      focusColor: focusStyle?.outlineColor || '',
      button: rect ? { left: rect.left, right: rect.right, height: rect.height } : null
    };
  });
  expect(desktop.overflow).toBe(false);
  expect(desktop.nativePainter).toBe(false);
  expect(desktop.nativeTitleUi).toBe(false);
  expect(desktop.backdrop).toContain('title_bg_ashmere_road_v089.jpg');
  expect(desktop.labelVisibility).toBe('visible');
  expect(desktop.focusOutline).toBe('solid');
  expect(desktop.focusColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(desktop.button.left).toBeGreaterThanOrEqual(0);
  expect(desktop.button.right).toBeLessThanOrEqual(1440);

  // The real DOM control keeps the original title controller and story handoff.
  await page.locator('#newPrimary').click();
  await expect(page.locator('.opening-lore-v220')).toBeVisible();
});
