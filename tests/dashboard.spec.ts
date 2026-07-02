import { test, expect } from '@playwright/test';

test.describe('Dashboard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the session API to simulate an authenticated state
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: "Dr. Sarah Jenkins",
            email: "faculty@college.edu",
            image: null
          },
          expires: "2036-07-01T19:12:52+05:30"
        })
      });
    });

    // Mock the profile API to retrieve faculty info
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
            schoolInstitute: "Somaiya College",
            officialEmail: "faculty@college.edu",
            education: []
          }
        })
      });
    });

    // Mock activities API to return one mock activity
    await page.route('/api/activities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activities: [
            {
              id: 1,
              academicYear: "2025-26",
              pmsCategory: "Teaching and Learning",
              pmsSection: "Section A",
              activityType: "Lecture",
              data: {
                subject: "Computer Networks",
                hours: "40"
              },
              evidenceFileName: "networks_syllabus.pdf",
              evidenceFileId: "file-123",
              createdAt: new Date().toISOString()
            }
          ]
        })
      });
    });

    // Mock admin access endpoint
    await page.route('/api/admin/check-access', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ isAdmin: false })
      });
    });
  });

  test('should navigate to dashboard, render key widgets, and verify no console/page errors', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (exception) => {
      pageErrors.push(exception);
    });

    // Navigate to root (which authenticates automatically via mock session)
    await page.goto('/');

    // Wait for the authenticating screen to hide
    await expect(page.getByText('Authenticating...')).toBeHidden({ timeout: 30000 });

    // Open Dashboard via sidebar navigation
    const dashboardLink = page.locator('aside').first().getByRole('button', { name: /Dashboard/i });
    await dashboardLink.click();

    // Verify main Dashboard layout headings
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();

    // Verify key metric cards are loaded
    await expect(page.getByText('Activities Uploaded', { exact: true })).toBeVisible();
    await expect(page.getByText('Evidence Attached', { exact: true })).toBeVisible();
    await expect(page.getByText('Fields Completed', { exact: true })).toBeVisible();

    // Verify sections render successfully
    await expect(page.locator('h2', { hasText: 'Submission Progress' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Recent Activity' })).toBeVisible();

    // Verify there are no page errors
    expect(pageErrors).toHaveLength(0);
  });
});
