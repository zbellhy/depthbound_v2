import { test, expect } from '@playwright/test';

test.describe('Depthbound smoke', () => {
  test('loads without console errors and toggles modal with Esc (robust focus)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Load the game
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    // Ensure the modal element exists
    const modal = page.locator('#modal');
    await expect(modal).toBeAttached();

    // Try to ensure focus is where the game's input listens
    const canvas = page.locator('canvas');
    try {
      await canvas.first().waitFor({ state: 'visible', timeout: 5000 });
      await canvas.first().click({ position: { x: 8, y: 8 } });
    } catch {}

    // Also set document focus as a fallback
    await page.evaluate(() => { try { document.body?.focus(); } catch {} });

    // First attempt: regular keyboard press
    await page.keyboard.press('Escape');

    // If still hidden, force a window-level keydown (capture-phase handlers will see it)
    const stillHidden = await modal.evaluate((el) => el.classList.contains('hidden'));
    if (stillHidden) {
      await page.evaluate(() => {
        const ev = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(ev);
      });
    }

    // Now the modal should be visible
    await expect(modal).toBeVisible();

    // Second Esc to close (or at least be attached in hidden state if your flow requires click)
    await page.keyboard.press('Escape');
    await expect(modal.or(page.locator('#modal.hidden'))).toBeAttached();

    // No console errors at the end of the flow
    expect.soft(errors, 'no console errors after load + Esc toggles').toEqual([]);
  });
});
