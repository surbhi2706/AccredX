import { test, expect } from '@playwright/test';

test.describe('Document Upload Workflow', () => {
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

    // Mock activities API list - start with no activities so we can verify the new one is added
    await page.route('/api/activities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activities: [] })
      });
    });

    // Mock file upload API
    await page.route('/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fileId: "mock-evidence-file-id",
          repositoryWarning: "Evidence uploaded to repository successfully.",
          sheetsSuccess: true
        })
      });
    });
  });

  test('should fill out activity details, upload a file, submit successfully, and verify it appears', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for the loader to clear
    await expect(page.getByText('Authenticating...')).toBeHidden({ timeout: 30000 });

    // Open "Add Activity" (default page is add-activity, but navigate explicitly via sidebar to be sure)
    const sidebar = page.locator('aside').first();
    await sidebar.getByRole('button', { name: 'Add Activity' }).click();

    // Select Academic Year
    const yearSelect = page.locator('form select').filter({ has: page.locator('option', { hasText: '2025-26' }) }).first();
    await yearSelect.selectOption('2025-26');

    // Select PMS Category
    const categorySelect = page.locator('form select').filter({ has: page.locator('option', { hasText: 'Teaching, Learning & Evaluation' }) }).first();
    await categorySelect.selectOption('Teaching, Learning & Evaluation');

    // Select PMS Detailed Activity
    const activitySelect = page.locator('form select').filter({ has: page.locator('option', { hasText: 'Select detailed activity' }) }).first();
    await activitySelect.selectOption('Classroom Teaching Workload');

    // Verify dynamic form fields load
    const courseNameInput = page.locator('input#courseName');
    await expect(courseNameInput).toBeVisible();

    // Populate required form fields
    await courseNameInput.fill('Computer Networks');
    await page.locator('select#courseDeliveryType').selectOption('Lecture');
    await page.locator('input#sessionsAssigned').fill('40');
    await page.locator('input#sessionsEngaged').fill('40');
    await page.locator('input#engagementPercentage').fill('100');
    await page.locator('input#selfAssessedMarks').fill('45');

    // Upload dummy evidence file
    const fileInput = page.locator('input#evidence');
    await fileInput.setInputFiles({
      name: 'networks_syllabus.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy-pdf-content')
    });

    // Verify file name is updated in UI
    await expect(page.locator('form').getByText('networks_syllabus.pdf').first()).toBeVisible();

    // Click Save Activity
    const saveButton = page.getByRole('button', { name: 'Save Activity' });
    await saveButton.click();

    // Verify upload success message appears in UI
    const successMsg = page.getByText('Evidence uploaded to repository successfully.');
    await expect(successMsg).toBeVisible();

    // Navigate to Dashboard
    await sidebar.getByRole('button', { name: 'Dashboard' }).click();

    // Verify the newly created activity is listed in Recent Activity list
    await expect(page.locator('main').getByText('Classroom Teaching Workload').first()).toBeVisible();
    await expect(page.locator('main').getByText('Evidence attached').first()).toBeVisible();
  });
});
