import { expect, test } from '@playwright/test';

test.describe('Loading and Error States (US4)', () => {
  test('skeleton is visible during initial load', async ({ page }) => {
    // Slow down API responses to observe loading state
    await page.route('**/api/v2/pokemon**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/');

    const skeletons = page.locator('[data-testid="skeleton-card"]');
    await expect(skeletons.first()).toBeVisible({ timeout: 5_000 });
  });

  test('error message shown on API failure', async ({ page }) => {
    await page.route('**/api/v2/pokemon**', (route) => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('/');

    const errorState = page.locator('[data-testid="error-state"]');
    await expect(errorState).toBeVisible({ timeout: 10_000 });

    // No raw error output visible
    await expect(errorState).not.toContainText('500');
    await expect(errorState).not.toContainText('Internal Server Error');
  });

  test('page structure is preserved during error', async ({ page }) => {
    await page.route('**/api/v2/pokemon**', (route) => {
      route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.goto('/');

    // Header and search should still be visible
    await expect(page.locator('h1')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
  });
});
