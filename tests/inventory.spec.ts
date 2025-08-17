/* Depthbound — tests/inventory.spec.ts (v0.4.15) */
import { test } from '@playwright/test';
import { bootToTown, expectModalVisible, closeModal } from './helpers';

test.describe('Inventory', () => {
  test('toggle with I (generic modal)', async ({ page }) => {
    await bootToTown(page);
    await page.keyboard.press('KeyI');
    await expectModalVisible(page);
    await closeModal(page);
  });
});
