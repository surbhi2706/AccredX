import { test, expect } from '@playwright/test';

test.describe('Timeline Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user session API
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: "Dr. Sarah Jenkins", email: "faculty@college.edu" },
          expires: "2036-07-01T19:12:52+05:30"
        })
      });
    });

    // Mock profile details API
    await page.route('/api/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: {
            fullName: "Dr. Sarah Jenkins",
            employeeId: "FAC-2025-001",
            designation: "Assistant Professor",
            department: "Department of Computer Science",
            officialEmail: "faculty@college.edu"
          }
        })
      });
    });

    // Mock admin check API
    await page.route('/api/admin/check-access', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ isAdmin: false })
      });
    });

    // Mock activities list API
    await page.route('/api/activities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: [] })
      });
    });
  });

  test('should load the Timeline page, verify selector options and documents list', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for the authenticating screen to clear
    await expect(page.getByText('Authenticating...')).toBeHidden({ timeout: 30000 });

    // Click Timeline in sidebar navigation
    const timelineLink = page.locator('aside').first().getByRole('button', { name: /Timeline/i });
    await timelineLink.click();

    // Verify page header
    await expect(page.locator('h2', { hasText: 'Document Timeline' })).toBeVisible();

    // Verify the academic year selector is present
    const yearSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '2025-2026' }) }).first();
    await expect(yearSelect).toBeVisible();

    // Verify option values are present (e.g. 2025-2026, 2024-2025, 2023-2024)
    await expect(yearSelect.locator('option', { hasText: '2025-2026' })).toBeAttached();
    await expect(yearSelect.locator('option', { hasText: '2024-2025' })).toBeAttached();
    await expect(yearSelect.locator('option', { hasText: '2023-2024' })).toBeAttached();

    // Verify that the timeline renders document cards
    // By default, since activities array is empty, it falls back to mockDocuments for the selected year 2025-2026
    const docCardTitle = page.getByText('NPTEL_Cloud_Computing_Certificate.pdf').first();
    await expect(docCardTitle).toBeVisible();
  });
});
