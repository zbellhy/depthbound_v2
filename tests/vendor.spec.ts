/* Depthbound — tests/vendor.spec.ts
   Purpose: Verify vendor modal opens with E near spawn and Buy/Sell lists render.
*/
import { test, expect } from '@playwright/test';
import { bootToTown, tryOpenVendorFromSpawn } from './helpers';

test.describe('Vendor', () => {
  test('open vendor near spawn with E (Town) and render Buy/Sell', async ({ page }) => {
    await bootToTown(page);
    await tryOpenVendorFromSpawn(page);

    await expect(page.locator('#modal-inner #buy-list')).toBeVisible();
    await expect(page.locator('#modal-inner #sell-list')).toBeVisible();

    const closeBtn = page.locator('#close-btn');
    if (await closeBtn.count()) await closeBtn.click();
    await expect(page.locator('#modal')).toBeHidden();
  });
});
