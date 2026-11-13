const { test, expect } = require('@playwright/test');
const paragraphs = [
  'The kingdoms did not trust the silence. They set wardens over the passage-stones and ordered the deep ground left alone. Chroniclers wrote the year down as the end of the monster war, and the writing was neat, and it became the version everyone told.',
  'Generations passed. Roads were cut across the old war-ground, and towns grew where armies had camped. The wardens’ stones were kept, and the law against digging became a custom, then an inconvenience. Few remembered why it had been made. Fewer asked.'
];
const quote = 'Before the road, before the waking, there is a question no chronicle can answer for you: what will you choose to carry?';

test.use({ hasTouch: true });
for (const width of [1440, 390]) {
  test(`approved peace annal stays mandatory and hands into anonymous creation at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('legend-phaser-production-engine-awakened-v1', 'ready'));
    await page.goto('/');
    await page.getByRole('button', { name: /Begin Your Journey/i }).click();
    const title = page.locator('#openingLoreTitle');
    const next = page.locator('#openingLoreContinue');
    for (const [step, name] of ['When the World Went to War', 'The Pact Beneath the Stone', 'The Peace, Written Down'].entries()) {
      await expect(title).toHaveText(name);
      await expect(page.locator('.opening-lore-v220')).toHaveAttribute('data-lore-step', String(step));
      await expect(page.getByRole('button', { name: /skip.*annals/i })).toHaveCount(0);
      await expect(page.locator('#v094Name')).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => { const state = LegendPhaserWorldV1.snapshot(); return { active: state.nativeAnnalsUi, failure: state.nativeAnnalsUiFailure }; })).toEqual({ active: true, failure: '' });
      if (step === 2) {
        await expect(page.locator('.opening-lore-v220-kicker')).toHaveText('III · THE PEACE KEPT');
        await expect(page.locator('.opening-lore-v220-copy > p')).toHaveText(paragraphs);
        await expect(page.locator('.opening-lore-v220-copy > blockquote')).toHaveText(quote);
        await expect(page.locator('.opening-lore-v220')).not.toContainText(/Last Mercy|Veil|echo|wound|healer|Saint/i);
        await expect(next).toContainText('Shape the traveler');
        const labels = await page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeAnnalsUiLabels);
        expect(labels.find(item => item.sourceText.includes('Shape the traveler')).wrappedLines).toBe(1);
        for (const copy of [...paragraphs, quote]) {
          const label = labels.find(item => item.sourceText === copy);
          expect(label, copy).toBeTruthy();
          expect(label.text).toBe(copy);
          expect(label.x + label.width).toBeLessThanOrEqual(label.sourceBounds.x + label.sourceBounds.width + 1);
          expect(label.y + label.height).toBeLessThanOrEqual(label.sourceBounds.y + label.sourceBounds.height + 2);
        }
        // An unrenderable source must remain readable through the original DOM.
        await title.evaluate(node => { node.textContent = 'W'.repeat(160); });
        await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeAnnalsUi)).toBe(false);
        expect(await title.evaluate(node => getComputedStyle(node).color)).not.toBe('rgba(0, 0, 0, 0)');
        await title.evaluate(node => { node.textContent = 'The Peace, Written Down'; });
        await expect.poll(() => page.evaluate(() => LegendPhaserWorldV1.snapshot().nativeAnnalsUi)).toBe(true);
        expect(await next.evaluate(node => getComputedStyle(node).borderTopColor)).toBe('rgba(0, 0, 0, 0)');
        await page.locator('.opening-lore-v220').evaluate(node => { node.scrollTop = node.scrollHeight; });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      if (width === 390) await next.tap();
      else { await next.focus(); await page.keyboard.press('Enter'); }
    }
    await expect(page.locator('#v094Name')).toBeVisible();
    await expect(page.locator('.v140-dialogue-speaker strong')).toHaveText('???');
    expect(await page.evaluate(() => localStorage.getItem('legend-roads-of-ashmere-v09'))).toBeNull();
    expect(errors).toEqual([]);
  });
}
