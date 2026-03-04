import { expect, test } from '@playwright/test';

test.describe('Pokémon Cards (US2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('each card has an image, name, and six stat labels', async ({ page }) => {
    const card = page.locator('[data-testid="pokemon-card"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });

    // Card has name
    const name = card.locator('[data-testid="pokemon-name"]');
    await expect(name).toBeVisible();
    await expect(name).not.toBeEmpty();

    // Card has image
    const image = card.locator('img');
    await expect(image).toBeVisible();

    // Card has six stat entries
    const stats = card.locator('[data-testid="stat-label"]');
    await expect(stats).toHaveCount(6);
  });

  test('responsive column count at mobile breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const card = page.locator('[data-testid="pokemon-card"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });

    const grid = page.locator('[data-testid="pokemon-grid"] > div').first();
    const gridStyle = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    const columnCount = gridStyle.split(' ').length;
    expect(columnCount).toBe(2);
  });

  test('responsive column count at desktop breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const card = page.locator('[data-testid="pokemon-card"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });

    const grid = page.locator('[data-testid="pokemon-grid"] > div').first();
    const gridStyle = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    const columnCount = gridStyle.split(' ').length;
    expect(columnCount).toBe(5);
  });
});
