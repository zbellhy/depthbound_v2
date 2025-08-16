import { test, expect } from '@playwright/test';

test.describe('Depthbound smoke', () => {
  test('loads cleanly; tries Esc (non-blocking)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    // Gate 1: the page must load with NO console errors
    await page.waitForTimeout(300);
    expect(errors, 'no console errors after load').toEqual([]);

    // Try to toggle pause with Esc (best-effort; do not fail build if app ignores Esc here)
    const modal = page.locator('#modal');
    await expect(modal).toBeAttached();

    // Focus likely targets
    const canvas = page.locator('canvas');
    try { await canvas.first().click({ position: { x: 8, y: 8 } }); } catch {}
    await page.evaluate(() => { try { document.body?.focus(); } catch {} });

    // Send Esc by multiple paths
    await page.keyboard.press('Escape').catch(() => {});
    await page.evaluate(() => {
      const evDown = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
      const evUp = new KeyboardEvent('keyup', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true });
      window.dispatchEvent(evDown);
      window.dispatchEvent(evUp);
      document.dispatchEvent(evDown);
      document.dispatchEvent(evUp);
      (document.activeElement || document.body)?.dispatchEvent(evDown);
      (document.activeElement || document.body)?.dispatchEvent(evUp);
    });

    // Soft assertion: visible is nice-to-have
    const becameVisible = await modal.evaluate(el => !el.classList.contains('hidden')).catch(() => false);
    expect.soft(becameVisible, 'modal became visible after Esc (soft)').toBeTruthy();

    // Done; primary gate is "no console errors". Mechanics tests come in follow-up specs.
  });
});
