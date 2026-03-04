import { expect, test } from '@playwright/test';

test.describe('Pokémon Detail Modal (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking a card opens the detail modal', async ({ page }) => {
    const card = page.locator('[data-testid="pokemon-card"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });

    await card.click();

    const modal = page.locator('[data-testid="pokemon-detail-modal"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });
  });

  test('modal contains image, name, types, abilities, height, weight, and stat bars', async ({
    page,
  }) => {
    const card = page.locator('[data-testid="pokemon-card"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();

    const modal = page.locator('[data-testid="pokemon-detail-modal"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Image
    await expect(modal.locator('img')).toBeVisible();

    // Name
    await expect(modal.locator('[data-testid="detail-name"]')).toBeVisible();

    // Types
    await expect(modal.locator('[data-testid="detail-types"]')).toBeVisible();

    // Abilities
    await expect(modal.locator('[data-testid="detail-abilities"]')).toBeVisible();

    // Height and weight
    await expect(modal.locator('[data-testid="detail-height"]')).toBeVisible();
    await expect(modal.locator('[data-testid="detail-weight"]')).toBeVisible();

    // Stat bars
    const statBars = modal.locator('[role="meter"]');
    await expect(statBars).toHaveCount(6);
  });

  test('close button returns to grid', async ({ page }) => {
    const card = page.locator('[data-testid="pokemon-card"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();

    const modal = page.locator('[data-testid="pokemon-detail-modal"]');
    await expect(modal).toBeVisible({ timeout: 10_000 });

    // Close the modal via the built-in X button
    const closeButton = modal.locator('[data-slot="dialog-close"]');
    await closeButton.click();

    await expect(modal).not.toBeVisible();

    // Grid is still usable
    await expect(page.locator('[data-testid="pokemon-grid"]')).toBeVisible();
  });
});
