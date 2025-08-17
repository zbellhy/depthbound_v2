/* Depthbound — tests/vendor.spec.ts (v0.4.14) */
import { test, expect } from '@playwright/test';
import { bootToTown, tryOpenVendorFromSpawn } from './helpers';

test.describe('Vendor', () => {
  test('open vendor near spawn with E (Town) and render Buy/Sell', async ({ page }) => {
    await bootToTown(page);
    await tryOpenVendorFromSpawn(page);

    await expect(page.locator('#modal-inner #buy-list').or(page.locator('#buy-list'))).toBeVisible();
    await expect(page.locator('#modal-inner #sell-list').or(page.locator('#sell-list'))).toBeVisible();
  });
});
