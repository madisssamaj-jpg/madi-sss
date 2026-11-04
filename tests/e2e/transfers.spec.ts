import { test, expect } from '@playwright/test';

test.describe('Madi SSS — Internal Transfers & Admin Portal E2E Tests', () => {
  test('public homepage displays navigation and admin portal entrance in Nepali', async ({ page }) => {
    await page.goto('/ne');
    await expect(page).toHaveTitle(/Madi|मादी/i);

    // Verify admin entrance link
    const adminLink = page.getByRole('link', { name: /प्रशासक पोर्टल|Admin Portal/i });
    await expect(adminLink).toBeVisible();
  });

  test('admin login page supports bilingual switching and displays security notice', async ({ page }) => {
    await page.goto('/ne/admin/login');
    await expect(page.getByRole('heading', { name: /प्रशासक लगइन/i })).toBeVisible();
    await expect(page.getByText(/दर सीमित/i)).toBeVisible();

    // Switch to English
    await page.goto('/en/admin/login');
    await expect(page.getByRole('heading', { name: /Admin Portal Login/i })).toBeVisible();
    await expect(page.getByText(/Rate-limited/i)).toBeVisible();
  });

  test('admin can authenticate and view internal transfers subsystem dashboard', async ({ page }) => {
    await page.goto('/ne/admin/login');
    await page.fill('input[type="email"]', 'superadmin@madisss.org.np');
    await page.click('button[type="submit"]');

    // Should navigate to transfers dashboard
    await page.waitForURL('**/admin/transfers');
    await expect(page.getByRole('heading', { name: /आन्तरिक रकमान्तर व्यवस्थापन|Internal Transfer/i })).toBeVisible();

    // Verify KPI indicators
    await expect(page.getByText(/कुल रकमान्तर|Total Transfers/i)).toBeVisible();
    await expect(page.getByText(/ड्राफ्ट|Pending Drafts/i)).toBeVisible();

    // Verify New Transfer modal trigger
    const newTransferBtn = page.getByRole('button', { name: /\+.*नयाँ रकमान्तर|New Internal Transfer/i });
    await expect(newTransferBtn).toBeVisible();
    await newTransferBtn.click();

    // Check modal content
    await expect(page.getByRole('heading', { name: /नयाँ आन्तरिक रकमान्तर ड्राफ्ट|Create Internal Transfer Draft/i })).toBeVisible();
  });
});

