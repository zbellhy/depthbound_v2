/* Depthbound — tests/inventory.spec.ts (v0.4.14) */
import { test } from '@playwright/test';
import { bootToTown, openInventoryAndClose } from './helpers';

test.describe('Inventory', () => {
  test('open with I and close cleanly', async ({ page }) => {
    await bootToTown(page);
    await openInventoryAndClose(page);
  });
});
