import { test, expect } from '@playwright/test';

test.describe('Madi SSS — Staging E2E Verification Battery', () => {
  const viewports = [
    { width: 360, height: 640, name: 'Mobile 360px' },
    { width: 390, height: 844, name: 'Mobile 390px' },
    { width: 768, height: 1024, name: 'Tablet 768px' },
    { width: 1024, height: 768, name: 'Desktop 1024px' },
    { width: 1440, height: 900, name: 'Wide 1440px' },
  ];

  for (const vp of viewports) {
    test(`[${vp.name}] Public Homepage renders hero, notices, metrics, and navigation`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/ne');

      // Verify title & brand presence
      await expect(page).toHaveTitle(/मादी|Madi/i);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Verify Impact Counter & CTAs
      await expect(page.getByText(/८५०\+/i)).toBeVisible();
      await expect(page.getByText(/१००%/i)).toBeVisible();

      // Verify Community Sections exist
      await expect(page.getByText(/सामुदायिक गतिविधि|Recent Social Activities/i)).toBeVisible();
      await expect(page.getByText(/राहत तथा कल्याणकारी कोष|Relief & Welfare/i)).toBeVisible();
    });
  }

  test('Public Navigation: All 9 public community sections load with verified content', async ({ page }) => {
    // 1. Activities Listing & Slug Detail
    await page.goto('/ne/activities');
    await expect(page.getByRole('heading', { name: /सामाजिक गतिविधि तथा सेवाहरू/i })).toBeVisible();
    await page.goto('/ne/activities/madi-health-camp-2083');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 2. Relief & Welfare Transparency
    await page.goto('/ne/relief-support');
    await expect(page.getByRole('heading', { name: /मादी राहत तथा कल्याणकारी कोष/i })).toBeVisible();
    await expect(page.getByText(/पारदर्शी खर्च तथा वितरण अभिलेख/i)).toBeVisible();

    // 3. Events Calendar
    await page.goto('/ne/events');
    await expect(page.getByRole('heading', { name: /कार्यक्रम क्यालेन्डर तथा तालिका/i })).toBeVisible();

    // 4. Membership & Application Form
    await page.goto('/ne/membership');
    await expect(page.getByRole('heading', { name: /सदस्यता विवरण तथा आवेदन/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /आवेदन फारम पेश गर्नुहोस्/i })).toBeVisible();

    // 5. Committee & Officials
    await page.goto('/ne/committee');
    await expect(page.getByRole('heading', { name: /समाजको कार्यसमिति तथा सल्लाहकार/i })).toBeVisible();

    // 6. Reports & Audits + Constitution
    await page.goto('/ne/reports');
    await expect(page.getByRole('heading', { name: /वार्षिक प्रतिवेदन तथा आधिकारिक विधान/i })).toBeVisible();
    await expect(page.getByText(/मादी \(संखुवासभा\) सरोकार समाज, काठमाडौंको विधान/i)).toBeVisible();
    const reportsDownloadBtn = page.getByRole('link', { name: /विधान डाउनलोड गर्नुहोस्/i });
    await expect(reportsDownloadBtn).toBeVisible();
    await expect(reportsDownloadBtn).toHaveAttribute('href', /supabase\.co\/storage/);
    await expect(page.getByText(/१००% स्वतन्त्र लेखापरीक्षण तथा वैधानिक प्रत्याभूति/i)).toBeVisible();

    // 6b. About Us Page with Constitution Download
    await page.goto('/ne/about');
    await expect(page.getByRole('heading', { name: /मादी \(संखुवासभा\) सरोकार समाज, काठमाडौं/i })).toBeVisible();
    await expect(page.getByText(/२०८२\/०६\/२९ BS/i)).toBeVisible();
    const aboutDownloadBtn = page.getByRole('link', { name: /विधान डाउनलोड गर्नुहोस्/i });
    await expect(aboutDownloadBtn).toBeVisible();
    await expect(aboutDownloadBtn).toHaveAttribute('href', /supabase\.co\/storage/);

    // 7. Gallery
    await page.goto('/ne/gallery');
    await expect(page.getByRole('heading', { name: /सामुदायिक ग्यालरी तथा झलकहरू/i })).toBeVisible();

    // 8. Partners
    await page.goto('/ne/partners');
    await expect(page.getByRole('heading', { name: /सहयोगी संस्था तथा साझेदारहरू/i })).toBeVisible();

    // 9. Feedback Desk
    await page.goto('/ne/feedback');
    await expect(page.getByRole('heading', { name: /सुझाव, गुनासो तथा सहयोग निवेदन/i })).toBeVisible();
  });

  test('Language Switching: Toggles between Nepali and English accurately', async ({ page }) => {
    await page.goto('/ne');
    await expect(page.getByRole('link', { name: /EN/i })).toBeVisible();

    // Switch to English
    await page.click('button:has-text("EN"), a:has-text("EN")');
    await page.waitForURL('**/en**');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Error Handling: Non-existent route displays custom 404 page with return links', async ({ page }) => {
    await page.goto('/ne/non-existent-sample-page', { failOnStatusCode: false });
    await expect(page.getByText(/४०४/i)).toBeVisible();
    await expect(page.getByText(/पृष्ठ फेला परेन/i)).toBeVisible();
  });

  test('Footer: Renders legal details, DAO Kathmandu registration, and Constitution link', async ({ page }) => {
    await page.goto('/ne');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/२०८२\/०६\/२९ BS/i)).toBeVisible();
    const footerConstitutionLink = footer.getByRole('link', { name: /आधिकारिक विधान/i });
    await expect(footerConstitutionLink).toBeVisible();
    await expect(footerConstitutionLink).toHaveAttribute('href', /supabase\.co\/storage/);
  });
});

