import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation Workflow', () => {
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

    // Mock activities API list
    await page.route('/api/activities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: [] })
      });
    });

    // Mock course-activities list API
    await page.route('/api/course-activities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: [] })
      });
    });
  });

  test('should verify sidebar loads, links are clickable, and each view loads correct headers', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for the loader to clear
    await expect(page.getByText('Authenticating...')).toBeHidden({ timeout: 30000 });

    // Verify sidebar logo brand is visible
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator('h1', { hasText: 'AccredX' })).toBeVisible();

    // Verify sidebar lists current faculty info
    await expect(sidebar.getByText('Dr. Sarah Jenkins')).toBeVisible();

    // 1. Navigate to Dashboard
    await sidebar.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page.locator('header h1', { hasText: 'Dashboard' })).toBeVisible();

    // 2. Navigate to Add Activity
    await sidebar.getByRole('button', { name: 'Add Activity' }).click();
    await expect(page.locator('header h1', { hasText: 'Add Faculty Activity' })).toBeVisible();

    // 3. Navigate to Reports
    await sidebar.getByRole('button', { name: 'Reports' }).click();
    await expect(page.locator('header h1', { hasText: 'Reports' })).toBeVisible();

    // 4. Navigate to Profile
    await sidebar.getByRole('button', { name: 'Profile' }).click();
    await expect(page.locator('header h1', { hasText: 'Profile' })).toBeVisible();

    // 5. Navigate to Timeline
    await sidebar.getByRole('button', { name: 'Timeline' }).click();
    await expect(page.locator('header h1', { hasText: 'Document Timeline' })).toBeVisible();

    // 6. Navigate to Course Activity Hub
    await sidebar.getByRole('button', { name: 'Course Activity Hub' }).click();
    await expect(page.locator('header h1', { hasText: 'Course Activity Hub' })).toBeVisible();
  });
});
