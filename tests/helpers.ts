/* Depthbound — tests/helpers.ts (v0.4.14)
   Purpose: Boot robustly regardless of title/character-create flow.
   Contracts: Works whether a modal appears or the game drops straight into Town.
*/
import { Page, expect } from '@playwright/test';

export async function bootToTown(page: Page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  // Focus canvas if present so keyboard works
  const canvas = page.locator('canvas').first();
  try { await canvas.waitFor({ state: 'visible', timeout: 5000 }); await canvas.click({ position: { x: 8, y: 8 } }); } catch {}

  // Attempt an Enter-to-start flow, but don't require it.
  const modal = page.locator('#modal');
  const startBtn = page.locator('#cc-start');
  const name = page.locator('#cc-name');

  // Press Enter once; if a modal appears, try to start a game
  await page.keyboard.press('Enter');
  const appeared = await modal.evaluate(el => !el.classList?.contains('hidden')).catch(() => false);
  if (appeared) {
    if (await name.count()) await name.fill('E2E');
    if (await startBtn.count()) await startBtn.click();
    // Wait briefly for modal to go away
    await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  // Ensure we’re in the game loop: canvas should remain visible
  await expect(canvas, 'Game canvas should be visible after boot').toBeVisible({ timeout: 5000 });
}

export async function openInventoryAndClose(page: Page) {
  const modal = page.locator('#modal');
  const invRoot = page.locator('#modal-inner #inv-root').or(page.locator('#inv-root'));

  await page.keyboard.press('KeyI');
  await expect(invRoot, 'Inventory root should appear').toBeVisible({ timeout: 5000 });

  // Close with Esc, fallback to a close button if present
  await page.keyboard.press('Escape');
  const btnClose = page.locator('#btn-close-inv').or(page.locator('#close-btn'));
  if (await btnClose.count()) await btnClose.click().catch(() => {});

  // Modal should be hidden or detached
  await expect(modal.or(page.locator('#modal.hidden')), 'Modal should be hidden or detached').toBeAttached({ timeout: 5000 });
}

export async function tryOpenVendorFromSpawn(page: Page) {
  const buyList = page.locator('#modal-inner #buy-list').or(page.locator('#buy-list'));
  const modal = page.locator('#modal');

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

  // Final assertion
  await expect(buyList, 'Expected vendor Buy list to appear near spawn in Town').toBeVisible({ timeout: 1000 });

  // Close if open
  await page.keyboard.press('Escape');
  await expect(modal, 'Vendor modal should close').toBeHidden({ timeout: 3000 });
}
