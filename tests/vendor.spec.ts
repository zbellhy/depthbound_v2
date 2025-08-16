/* Depthbound — tests/vendor.spec.ts
   Purpose: Verify vendor modal opens via proximity + E, and Buy/Sell lists render. Close cleanly.
*/
import { test, expect } from '@playwright/test';
import { bootToTown, tryOpenVendorFromSpawn } from './helpers';

test.describe('Vendor', () => {
  test('open vendor near spawn with E (Town) and render Buy/Sell', async ({ page }) => {
    await bootToTown(page);
    await tryOpenVendorFromSpawn(page);

    // Validate structure
    await expect(page.locator('#modal-inner #buy-list')).toBeVisible();
    await expect(page.locator('#modal-inner #sell-list')).toBeVisible();

    // Close
    const closeBtn = page.locator('#close-btn');
    if (await closeBtn.count()) await closeBtn.click();
    await expect(page.locator('#modal')).toBeHidden();
  });
});
