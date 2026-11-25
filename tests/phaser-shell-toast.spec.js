const { test, expect } = require('@playwright/test');

async function openTitle(page, viewport = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator('#legend-boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.v120-title')).toBeVisible();
}

async function enterAshmere(page, name = 'ToastTraveler', viewport = { width: 1440, height: 900 }) {
  await openTitle(page, viewport);
  await page.getByRole('button', { name: /Begin Your Journey/i }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Shape the traveler/i }).click();
  await page.locator('#v094Name').fill(name);
  await page.locator('#v094Next').click();
  await page.locator('[data-gender="unspoken"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-personality="kind"]').click();
  await page.locator('#v094Next').click();
  await page.locator('[data-origin]').first().click();
  await page.locator('#v094Next').click();
  await page.getByRole('button', { name: /^Ranger\./ }).click();
  await page.locator('#v094Next').click();
  await page.locator('[data-keepsake="Old Map"]').click();
  await page.locator('#v094Next').click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Let Me Wake/i }).click();
  await expect(page.getByRole('heading', { name: 'One Bell. No Tower.' })).toBeVisible();
  await page.getByRole('button', { name: 'Lift your head' }).click();
  await page.evaluate(() => {
    const player = window.LegendRuntimeV120.loadPlayer();
    window.LegendRoadOpeningV140.complete(player, 'abandoned');
    window.LegendAshmereV099.renderAshmere();
  });
  await expect(page.locator('.ash100-town')).toBeVisible();
  await expect(page.locator('#legend-world-shell-root')).toBeHidden();
  await page.evaluate(() => window.LegendAshmereV099.route('inn'));
  await expect(page.locator('.ash099-screen')).toBeVisible();
  await expect(page.locator('#legend-world-shell-root')).toBeVisible();
  // Shell toast coverage lives on a town service; Ashmere itself no longer has the shell.
  // Wait for the Phaser scene and its HUD painter, so the toast painter has a live scene to paint into.
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.ready)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeHudUi)).toBe(true);
}

/** Raises a real shell toast through the shell's own click handler. */
async function triggerShellToast(page) {
  await page.evaluate(() => {
    const shell = document.getElementById('legend-world-shell-root');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.worldAction = 'continue-road';
    button.textContent = 'QA continue';
    shell.appendChild(button);
    button.click();
    button.remove();
  });
  const toast = page.locator('.lws-shell-toast');
  await expect(toast).toBeVisible();
  await expect(toast).not.toBeEmpty();
  await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeToastUi)).toBe(true);
  await expect(toast).toHaveAttribute('data-legend-phaser-toast-text', 'true');
}

async function readToastBox(page) {
  return page.locator('.lws-shell-toast').evaluate(node => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      color: style.color,
      background: style.backgroundColor,
      ariaHidden: node.getAttribute('aria-hidden'),
      text: node.textContent.replace(/\s+/g, ' ').trim()
    };
  });
}

test.describe('LEGEND shell toast in Phaser', () => {
  test.describe.configure({ timeout: 120_000 });

  test('paints the message in Phaser and keeps the DOM status node as the accessible fallback', async ({ page }) => {
    await enterAshmere(page, 'ToastTraveler');
    await triggerShellToast(page);

    const toast = page.locator('.lws-shell-toast');
    await expect(toast).toHaveAttribute('role', 'status');
    await expect(toast).toHaveAttribute('aria-live', 'polite');
    const box = await readToastBox(page);
    expect(box.text.length).toBeGreaterThan(0);

    // Phaser owns the pixels and reports the very same message.
    const painted = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
    expect(painted.nativeToastUi).toBe(true);
    expect(painted.nativeToastUiMessage).toBe(box.text);
    expect(painted.nativeToastUiTextValues).toEqual([box.text]);
    expect(painted.nativeToastUiObjectCount).toBeGreaterThanOrEqual(2);
    expect(painted.nativeToastUiSceneSize.width).toBeGreaterThan(0);
    await expect(page.locator('body')).toHaveClass(/legend-phaser-toast-ui-active/);
    await expect(toast).toHaveAttribute('data-legend-phaser-toast-text', 'true');

    // The DOM node keeps the message for assistive tech; only its paint is handed to Phaser.
    expect(box.color).toBe('rgba(0, 0, 0, 0)');
    expect(box.background).toBe('rgba(0, 0, 0, 0)');
    expect(box.ariaHidden).toBeNull();
    expect(box.text).toBe(painted.nativeToastUiMessage);

    // The painted toast sits inside the desktop viewport.
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(1440);
    expect(box.top).toBeGreaterThan(0);

    // Clearing the painter hands the visible message back to the DOM fallback.
    await page.evaluate(() => window.LegendPhaserWorldV1.clearToast());
    expect(await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeToastUi)).toBe(false);
    await expect(page.locator('body')).not.toHaveClass(/legend-phaser-toast-ui-active/);
    await expect(toast).toHaveAttribute('role', 'status');
    await expect(toast).toHaveAttribute('aria-live', 'polite');
    await expect(toast).toHaveText(box.text);
    await expect(toast).not.toHaveAttribute('data-legend-phaser-toast-text', 'true');
    const fallback = await readToastBox(page);
    expect(fallback.color).not.toBe('rgba(0, 0, 0, 0)');
    expect(fallback.background).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('paints the toast inside a 390px viewport without horizontal overflow', async ({ page }) => {
    await enterAshmere(page, 'ToastNarrow', { width: 390, height: 844 });
    await triggerShellToast(page);

    const painted = await page.evaluate(() => window.LegendPhaserWorldV1.snapshot());
    expect(painted.nativeToastUi).toBe(true);
    expect(painted.nativeToastUiMessage.length).toBeGreaterThan(0);

    const box = await readToastBox(page);
    expect(box.width).toBeGreaterThan(0);
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(390);
    expect(box.top).toBeGreaterThan(0);

    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    expect(metrics.document, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);
    expect(metrics.body, JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport);

    await page.evaluate(() => window.LegendPhaserWorldV1.clearToast());
    expect(await page.evaluate(() => window.LegendPhaserWorldV1.snapshot().nativeToastUi)).toBe(false);
    await expect(page.locator('.lws-shell-toast')).toHaveAttribute('role', 'status');
  });

  test('service-screen shell Save reports success and storage failure through the live toast', async ({ page }) => {
    await enterAshmere(page, 'ShellSaveQA');
    const saveButton=page.locator('#legend-world-shell-root [data-world-action="save"]');
    await expect(saveButton).toBeVisible();
    const toast=page.locator('.lws-shell-toast');

    await saveButton.click();
    await expect(toast).toHaveText('Traveler record saved locally.');
    await expect(toast).toHaveAttribute('role','status');
    await expect(toast).toHaveAttribute('aria-live','polite');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeToastUi)).toBe(true);

    await page.evaluate(() => {
      const storage=window.LegendStorage;
      window.LegendStorage={...storage,savePlayer:()=>false};
    });
    await saveButton.click();
    await expect(toast).toContainText('could not be saved permanently');
    await expect(toast).toHaveAttribute('role','status');
    await expect(toast).toHaveAttribute('aria-live','polite');
    await expect.poll(() => page.evaluate(() => window.LegendPhaserWorldV1?.snapshot?.()?.nativeToastUi)).toBe(true);
  });
});
