import { test, expect } from '@playwright/test';

test.describe('Depthbound smoke', () => {
  test('loads without console errors and toggles modal with Esc', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    expect.soft(errors, 'no console errors after load').toEqual([]);

    await page.keyboard.press('Escape');
    const modal = page.locator('#modal');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(modal.or(page.locator('#modal.hidden'))).toBeAttached();
  });
});
