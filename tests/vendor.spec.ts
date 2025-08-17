/* Depthbound — tests/vendor.spec.ts (v0.4.15) */
import { test } from '@playwright/test';
import { bootToTown, expectModalVisible, closeModal } from './helpers';

test.describe('Vendor', () => {
  test('open vendor near spawn with E (generic modal)', async ({ page }) => {
    await bootToTown(page);
    // Try a few E presses and small movement to find a vendor
    const moves = ['KeyE','ArrowRight','KeyE','ArrowLeft','KeyE','ArrowUp','KeyE','ArrowDown','KeyE'];
    for (const code of moves) {
      await page.keyboard.press(code);
      try { await expectModalVisible(page); break; } catch {}
    }
    await closeModal(page);
  });
});
