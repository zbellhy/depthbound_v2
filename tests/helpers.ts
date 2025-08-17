/* Depthbound — tests/helpers.ts
   Purpose: Shared helpers to drive the web build deterministically-ish without modifying app code.
   Contracts: Assumes #modal and #modal-inner exist; Title -> CharacterCreate -> Town flow.
*/
import { Page, expect } from '@playwright/test';

export async function bootToTown(page: Page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  // Ensure focus so key events are received.
  const canvas = page.locator('canvas').first();
  try { await canvas.waitFor({ state: 'visible', timeout: 3000 }); await canvas.click({ position: { x: 8, y: 8 } }); } catch {}
  await page.evaluate(() => { try { document.body?.focus(); } catch {} });

  // Title -> New Game (Enter)
  await page.keyboard.press('Enter');

  // Wait for character create modal
  const modal = page.locator('#modal');
  await expect(modal, 'Character Create modal should open on Enter from Title').toBeVisible({ timeout: 5000 });

  // Fill minimal fields if present, then click Start
  const start = page.locator('#cc-start');
  const name = page.locator('#cc-name');
  if (await name.count()) await name.fill('E2E');
  await expect(start).toBeVisible({ timeout: 3000 });
  await start.click();

  // Modal should close; now in Town
  await expect(modal).toBeHidden({ timeout: 5000 });

  // Re-focus canvas
  try { await canvas.click({ position: { x: 12, y: 12 } }); } catch {}
}

export async function openInventoryAndClose(page: Page) {
  const modal = page.locator('#modal');
  const invRoot = page.locator('#modal-inner #inv-root');

  await page.keyboard.press('KeyI');
  await expect(invRoot).toBeVisible({ timeout: 3000 });

  // Close with Esc (fallback to close button if present)
  await page.keyboard.press('Escape');
  if (await invRoot.count()) {
    const btnClose = page.locator('#btn-close-inv');
    if (await btnClose.count()) await btnClose.click();
  }
  await expect(modal).toBeHidden({ timeout: 3000 });
}

export async function tryOpenVendorFromSpawn(page: Page) {
  const buyList = page.locator('#modal-inner #buy-list');

  async function pressEandCheck(): Promise<boolean> {
    await page.keyboard.press('KeyE');
    try { await buyList.waitFor({ state: 'visible', timeout: 800 }); return true; } catch { return false; }
  }

  if (await pressEandCheck()) return;

  const moves = ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'];
  for (const code of moves) {
    await page.keyboard.press(code);
    if (await pressEandCheck()) return;
  }

  const spiral = ['ArrowRight','ArrowRight','KeyE','ArrowDown','ArrowDown','KeyE','ArrowLeft','ArrowLeft','KeyE','ArrowUp','ArrowUp','KeyE'];
  for (const code of spiral) {
    if (code === 'KeyE') { if (await pressEandCheck()) return; }
    else { await page.keyboard.press(code); }
  }

  await expect(buyList, 'Expected vendor Buy list to appear near spawn in Town').toBeVisible({ timeout: 500 });
}
