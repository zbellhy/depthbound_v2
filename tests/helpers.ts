/* Depthbound — tests/helpers.ts (v0.4.15)
   Purpose: Boot robustly regardless of UI flow; generic modal helpers.
*/
import { Page, expect } from '@playwright/test';

export async function bootToTown(page: Page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  const canvas = page.locator('canvas').first();
  await expect(canvas, 'Game canvas should render').toBeVisible({ timeout: 8000 });
  try { await canvas.click({ position: { x: 8, y: 8 } }); } catch {}

  // Optional: press Enter once if a title screen needs it, but don't rely on it
  await page.keyboard.press('Enter').catch(() => {});

  // Ensure canvas remains visible
  await expect(canvas).toBeVisible({ timeout: 2000 });
}

export async function expectModalVisible(page: Page) {
  const modal = page.locator('#modal');
  // Accept either direct visibility or hidden class toggle pattern
  const becameVisible = await modal.evaluate(el => !!el && !el.classList.contains('hidden')).catch(() => false);
  if (!becameVisible) {
    await expect(modal, 'Modal should be attached').toBeAttached({ timeout: 5000 });
    await page.waitForTimeout(200); // allow classes to flip
  }
  const visibleNow = await modal.evaluate(el => !!el && !el.classList.contains('hidden')).catch(() => false);
  expect(visibleNow, 'Modal should be visible (no .hidden class)').toBeTruthy();
}

export async function closeModal(page: Page) {
  const modal = page.locator('#modal');
  await page.keyboard.press('Escape');
  // Fallback to generic close button if present
  const closeBtn = page.locator('#btn-close-inv, #close-btn, button:has-text("Close")');
  if ((await closeBtn.count()) > 0) {
    try { await closeBtn.first().click(); } catch {}
  }
  // Expect hidden or detached
  const hidden = await modal.evaluate(el => !!el && el.classList.contains('hidden')).catch(() => true);
  if (!hidden) {
    await expect(modal.or(page.locator('#modal.hidden'))).toBeHidden({ timeout: 3000 });
  }
}
