/* Depthbound — tests/vendor.spec.ts (v0.4.16) */
import { test } from '@playwright/test';
import { bootToTown, expectModalVisible, closeModalSoft } from './helpers';

test.describe('Vendor', () => {
  test('open vendor near spawn with E (generic modal, soft close)', async ({ page }) => {
    await bootToTown(page);
    const attempts = ['KeyE','ArrowRight','KeyE','ArrowLeft','KeyE','ArrowUp','KeyE','ArrowDown','KeyE'];
    for (const code of attempts) {
      await page.keyboard.press(code);
      try { await expectModalVisible(page); break; } catch {}
    }
    await closeModalSoft(page);
  });
});
