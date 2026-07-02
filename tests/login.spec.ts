import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  // Test to verify that the unauthenticated landing page loads correctly
  test('should load the homepage and render the login screen', async ({ page }) => {
    // Navigate to the homepage root URL
    await page.goto('/');

    // Wait for the initial "Authenticating..." state to hide (gives dev server compile time)
    await expect(page.getByText('Authenticating...')).toBeHidden({ timeout: 30000 });

    // Verify the page title matches metadata
    await expect(page).toHaveTitle(/AccredX/i);

    // Verify the AccredX logo/heading is visible
    const logoHeading = page.locator('h1', { hasText: 'AccredX' });
    await expect(logoHeading).toBeVisible();

    // Verify the 'Welcome Back' subheader is present
    const loginHeader = page.locator('h3', { hasText: 'Welcome Back' });
    await expect(loginHeader).toBeVisible();

    // Verify that the SIGN IN WITH GOOGLE button is visible
    const googleButton = page.getByRole('button', { name: /SIGN IN WITH GOOGLE/i });
    await expect(googleButton).toBeVisible();
  });
});
