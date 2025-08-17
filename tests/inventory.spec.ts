/* Depthbound — tests/inventory.spec.ts (v0.4.16) */
import { test } from '@playwright/test';
import { bootToTown, expectModalVisible, closeModalSoft } from './helpers';

test.describe('Inventory', () => {
  test('toggle with I (generic modal, soft close)', async ({ page }) => {
    await bootToTown(page);
    await page.keyboard.press('KeyI');
    await expectModalVisible(page);
    await closeModalSoft(page);
  });
});
