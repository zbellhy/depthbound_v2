/* Depthbound — tests/helpers.ts (v0.4.16)
   Purpose: Robust boot + minimal, non-sticky modal checks (no button clicking).
*/
import { Page, expect } from '@playwright/test';

export async function bootToTown(page: Page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  const canvas = page.locator('canvas').first();
  await expect(canvas, 'Game canvas should render').toBeVisible({ timeout: 8000 });
  // Focus attempt
  try { await canvas.click({ position: { x: 8, y: 8 } }); } catch {}
  // Optional start
  try { await page.keyboard.press('Enter'); } catch {}
  await expect(canvas).toBeVisible({ timeout: 2000 });
}

export async function expectModalVisible(page: Page) {
  const modal = page.locator('#modal');
  // Attached first
  await expect(modal, 'Modal element should be attached').toBeAttached({ timeout: 3000 });
  // Then visible by class toggle (no .hidden)
  const visible = await modal.evaluate(el => !!el && !el.classList.contains('hidden')).catch(() => false);
  expect(visible, 'Modal should be visible (no .hidden class)').toBeTruthy();
}

export async function closeModalSoft(page: Page) {
  const modal = page.locator('#modal');
  await page.keyboard.press('Escape').catch(() => {});
  // Wait up to 1.5s for hidden class; do NOT click any buttons
  const start = Date.now();
  while (Date.now() - start < 1500) {
    const hidden = await modal.evaluate(el => !!el && el.classList.contains('hidden')).catch(() => true);
    if (hidden) break;
    await page.waitForTimeout(100);
  }
}
