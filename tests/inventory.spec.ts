/* Depthbound — tests/inventory.spec.ts
   Purpose: Verify Inventory opens with "I" and closes cleanly.
*/
import { test } from '@playwright/test';
import { bootToTown, openInventoryAndClose } from './helpers';

test.describe('Inventory', () => {
  test('open with I and close cleanly', async ({ page }) => {
    await bootToTown(page);
    await openInventoryAndClose(page);
  });
});
