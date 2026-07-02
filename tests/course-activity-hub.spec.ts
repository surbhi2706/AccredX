import { test, expect } from '@playwright/test';

test.describe('Course Activity Hub Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock session API to return authenticated user
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

    // Mock profile info API
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

    // Mock admin access check API
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

    // Mock course-activities list API with one mock target mapped
    await page.route('/api/course-activities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activities: [
            {
              recordId: "rec-1",
              academicYear: "2025-2026",
              branch: "Computer Engineering (COMP)",
              semester: "Semester 5",
              courseCode: "COMP301",
              courseName: "Operating Systems",
              facultyName: "Dr. Sarah Jenkins",
              facultyEmail: "faculty@college.edu",
              timestamp: "2026-06-01T10:00:00Z",
              documentCategory: "Teaching Documents",
              documentType: "Syllabus",
              evidenceFileName: "comp301_syllabus.pdf",
              resourceType: "FILE",
              driveFileId: "drive-file-abc",
              metadataJson: "{\"description\":\"Syllabus file\"}"
            }
          ]
        })
      });
    });
  });

  test('should open Course Activity Hub and verify all key dropdown filters are present', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for the loader to clear
    await expect(page.getByText('Authenticating...')).toBeHidden({ timeout: 30000 });

    // Locate and click Course Activity Hub in the sidebar
    const hubButton = page.locator('aside').first().getByRole('button', { name: /Course Activity Hub/i });
    await hubButton.click();

    // Verify main hub title
    await expect(page.locator('h2', { hasText: 'Course & Syllabus Mapping' })).toBeVisible();

    // Verify Academic Year dropdown (unique option: 2025-2026)
    const yearSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '2025-2026' }) }).first();
    await expect(yearSelect).toBeVisible();

    // Verify Branch dropdown (unique option: Computer Engineering (COMP))
    const branchSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Computer Engineering (COMP)' }) }).first();
    await expect(branchSelect).toBeVisible();

    // Verify Semester dropdown (unique option: Semester 5)
    const semesterSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Semester 5' }) }).first();
    await expect(semesterSelect).toBeVisible();

    // Verify Course selector dropdown (Quick Load Course - unique option: -- Create New Target --)
    const quickLoadSelect = page.locator('select').filter({ has: page.locator('option', { hasText: '-- Create New Target --' }) }).first();
    await expect(quickLoadSelect).toBeVisible();

    // Verify that the mocked course code option is inside the Quick Load select dropdown
    const optionElement = quickLoadSelect.locator('option', { hasText: 'COMP301' });
    await expect(optionElement).toBeAttached();
  });
});
