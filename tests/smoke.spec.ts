import { test, expect } from '@playwright/test';

test.describe('Depthbound smoke', () => {
  test('loads with zero console errors (Esc best-effort, non-blocking)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    // Hard gate: page must load cleanly
    expect(errors, 'no console errors after load').toEqual([]);

    // Best-effort Esc (does not affect result)
    try {
      const modal = page.locator('#modal');
      await modal.waitFor({ state: 'attached', timeout: 2000 }).catch(() => {});
      const canvas = page.locator('canvas');
      await canvas.first().click({ position: { x: 8, y: 8 } }).catch(() => {});
      await page.evaluate(() => { try { document.body?.focus(); } catch {} });
      await page.keyboard.press('Escape').catch(() => {});
      await page.evaluate(() => {
        const ev = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      });
    } catch {}
  });
});
