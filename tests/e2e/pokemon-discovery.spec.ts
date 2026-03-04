import { expect, test } from '@playwright/test';

test.describe('Pokémon Discovery (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('grid is visible on page load', async ({ page }) => {
    const grid = page.locator('[data-testid="pokemon-grid"]');
    await expect(grid).toBeVisible({ timeout: 10_000 });
  });

  test('scroll triggers loading of next page', async ({ page }) => {
    const grid = page.locator('[data-testid="pokemon-grid"]');
    await expect(grid).toBeVisible({ timeout: 10_000 });

    // Wait for initial cards
    const initialCards = page.locator('[data-testid="pokemon-card"]');
    await expect(initialCards.first()).toBeVisible({ timeout: 10_000 });
    const initialCount = await initialCards.count();

    // Scroll to bottom to trigger infinite scroll
    const sentinel = page.locator('[data-testid="scroll-sentinel"]');
    await sentinel.scrollIntoViewIfNeeded();

    // Wait for more cards to load
    await expect(async () => {
      const newCount = await page.locator('[data-testid="pokemon-card"]').count();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 10_000 });
  });

  test('search filters the Pokémon list', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    await searchInput.fill('pikachu');

    // Wait for search results
    await expect(async () => {
      const cards = page.locator('[data-testid="pokemon-card"]');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      const firstName = await cards.first().locator('[data-testid="pokemon-name"]').textContent();
      expect(firstName?.toLowerCase()).toContain('pikachu');
    }).toPass({ timeout: 10_000 });
  });

  test('no-match search shows empty state', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    await searchInput.fill('xyznonexistent');

    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible({ timeout: 10_000 });
  });
});
