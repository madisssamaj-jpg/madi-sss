import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  getHomepageHero,
  getSiteSettings,
  getNotices,
  getEvents,
  saveNotice,
  deleteNotice,
  getSocialActivities,
} from '../../lib/cms/cms-service.ts';

describe('Homepage Privacy & Content Governance Regression Suite', () => {
  const rootDir = process.cwd();

  // Test 1: Regression Test: Any unverified statistic is strictly rejected / absent
  it('strictly blocks unverified statistics (850+ health beneficiaries, 100% audit claims)', async () => {
    const homePagePath = path.join(rootDir, 'app', '[lang]', 'page.tsx');
    const homePageSource = fs.readFileSync(homePagePath, 'utf-8');

    // 1. Must NOT contain unverified 850+ beneficiary count
    assert.strictEqual(
      homePageSource.includes('८५०+'),
      false,
      'Homepage must not contain unverified statistic "८५०+"'
    );
    assert.strictEqual(
      homePageSource.includes('850+'),
      false,
      'Homepage must not contain unverified statistic "850+"'
    );

    // 2. Must NOT contain unverified 100% audit claim
    assert.strictEqual(
      homePageSource.includes('१००%') || homePageSource.includes('100% Audit') || homePageSource.includes('100% Transparency'),
      false,
      'Homepage must not claim unverified "१००% लेखापरीक्षित वार्षिक प्रतिवेदन"'
    );

    // 3. Must NOT contain unapproved year calculation "६+" or "6+"
    assert.strictEqual(
      homePageSource.includes('६+'),
      false,
      'Homepage must not calculate unverified year duration "६+"'
    );
    assert.strictEqual(
      homePageSource.includes('6+'),
      false,
      'Homepage must not calculate unverified year duration "6+"'
    );

    // 4. Must use verified founding phrasing (2076 BS founding & 2082 BS DAO registration)
    assert.ok(
      homePageSource.includes('वि.सं. २०७६: ‘मादी सरोकार केन्द्र’ का रूपमा स्थापना'),
      'Homepage must present verified milestone: "वि.सं. २०७६: ‘मादी सरोकार केन्द्र’ का रूपमा स्थापना"'
    );
  });

  // Test 2: Regression Test: Any incorrect registration date is strictly prohibited
  it('enforces verified DAO registration date (2082/04/21 BS) and rejects incorrect date (2082/06/29 BS)', async () => {
    // 1. Check SiteSettings canonical store
    const settings = await getSiteSettings();
    assert.strictEqual(
      settings.registrationDateNe,
      '२०८२/०४/२१',
      'SiteSettings registrationDateNe must be २०८२/०४/२१'
    );
    assert.ok(
      settings.formalRegistrationDateNe?.includes('२०८२/०४/२१'),
      'formalRegistrationDateNe must include verified date २०८२/०४/२१'
    );
    assert.ok(
      !settings.formalRegistrationDateNe?.includes('२०८२/०६/२९'),
      'formalRegistrationDateNe must NOT contain incorrect date २०८२/०६/२९'
    );

    // 2. Scan public page source files to guarantee incorrect date 2082/06/29 is nowhere in public views
    const publicFilesToCheck = [
      path.join(rootDir, 'app', '[lang]', 'page.tsx'),
      path.join(rootDir, 'app', 'components', 'Footer.tsx'),
      path.join(rootDir, 'app', '[lang]', 'about', 'page.tsx'),
      path.join(rootDir, 'app', '[lang]', 'reports', 'page.tsx'),
    ];

    for (const filePath of publicFilesToCheck) {
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.strictEqual(
        content.includes('२०८२/०६/२९'),
        false,
        `${path.basename(filePath)} must NOT contain incorrect date २०८२/०६/२९`
      );
      assert.strictEqual(
        content.includes('2082/06/29'),
        false,
        `${path.basename(filePath)} must NOT contain incorrect date 2082/06/29`
      );
      // Verify correct date is present
      assert.ok(
        content.includes('२०८२/०४/२१') || content.includes('2082/04/21'),
        `${path.basename(filePath)} must contain verified date २०८२/०४/२१`
      );
    }
  });

  // Test 3: Official Communication: info@madisss.org.np is published across Nav, Footer, and Feedback
  it('publishes official email info@madisss.org.np across public Nav, Footer, and Feedback components', async () => {
    const publicFilesToCheck = [
      path.join(rootDir, 'app', 'components', 'Nav.tsx'),
      path.join(rootDir, 'app', 'components', 'Footer.tsx'),
      path.join(rootDir, 'app', '[lang]', 'feedback', 'page.tsx'),
    ];

    const officialEmail = 'info@madisss.org.np';

    for (const filePath of publicFilesToCheck) {
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.strictEqual(
        content.includes(officialEmail),
        true,
        `${path.basename(filePath)} must contain official email ${officialEmail}`
      );
    }
  });

  // Test 4: Regression Test: A DRAFT event must NEVER appear as a public notice
  it('strictly prevents DRAFT events (11th Annual General Assembly) from appearing as public notices', async () => {
    // 1. Verify 11th AGM event itself is DRAFT
    const events = await getEvents(undefined, true);
    const agmEvent = events.find((e) => e.titleEn.includes('11th') || e.titleNe.includes('११औं'));
    assert.ok(agmEvent, '11th AGM event must exist in internal store');
    assert.strictEqual(agmEvent.status, 'DRAFT', '11th AGM event must be DRAFT');
    assert.strictEqual(agmEvent.isPublic, false, '11th AGM event must NOT be public');

    // 2. Query public notices (isPublic = true)
    const publicNotices = await getNotices(true);

    // Guarantee that 11th AGM notice is completely excluded
    const leakedPublicNotice = publicNotices.find(
      (n) =>
        n.titleEn.toLowerCase().includes('11th') ||
        n.titleNe.includes('११औं') ||
        n.summaryEn.toLowerCase().includes('11th') ||
        n.summaryNe.includes('११औं')
    );
    assert.strictEqual(
      leakedPublicNotice,
      undefined,
      'Public notices must NEVER leak notices regarding DRAFT events (11th AGM)'
    );

    // 3. Confirm that draft notices cannot be published without published event
    const draftNotice = await saveNotice({
      titleNe: '११औं साधारण सभा परीक्षण',
      titleEn: '11th AGM test notice',
      date: '२०८३-०३-०१',
      summaryNe: 'परीक्षण',
      summaryEn: 'Test',
      isUrgent: true,
      status: 'DRAFT',
      isPublic: false,
      relatedEventId: 'evt-001',
    });

    const publicAfterSave = await getNotices(true);
    assert.ok(!publicAfterSave.some((n) => n.id === draftNotice.id), 'Draft notice must not appear in public query');

    // Clean up
    await deleteNotice(draftNotice.id);
  });

  // Test 5: Regression Test: Homepage Hero constraints (exactly 2 buttons, 2 milestones, Chauki.jpg)
  it('enforces exact hero constraints: local Chauki.jpg, exactly two buttons, two milestones, no Relief button', async () => {
    const homePagePath = path.join(rootDir, 'app', '[lang]', 'page.tsx');
    const homePageSource = fs.readFileSync(homePagePath, 'utf-8');

    // 1. Hero background must be local Chauki.jpg
    const hero = await getHomepageHero(false);
    assert.ok(hero, 'Live hero must exist');
    assert.strictEqual(hero.imageUrl, '/media/incoming/Chauki.jpg', 'Hero image must be local Chauki.jpg');
    assert.strictEqual(hero.status, 'PUBLISHED');

    // 2. Isolate Hero Section and ensure exactly two action buttons and NO Relief button
    const heroMatch = homePageSource.match(/{\/\* 2\. Hero Section \*\/}([\s\S]*?){\/\* 3\. Community Impact Stats/);
    assert.ok(heroMatch, 'Hero section must exist');
    const heroSection = heroMatch[1];

    assert.strictEqual(
      heroSection.includes('/relief-support') || heroSection.includes('Relief Transparency'),
      false,
      'Hero section must NOT contain Relief Transparency button'
    );

    // 3. Must contain exactly two approved action buttons: Membership and Feedback
    assert.ok(
      heroSection.includes('/membership'),
      'Hero must contain Membership button'
    );
    assert.ok(
      heroSection.includes('/feedback'),
      'Hero must contain Feedback button'
    );

    // Count Link buttons in hero actions container
    const actionsMatch = heroSection.match(/{\/\* Action Buttons: Membership and Feedback only \*\/}([\s\S]*?)<\/section>/);
    assert.ok(actionsMatch, 'Action buttons container must exist');
    const linkMatches = actionsMatch[1].match(/<Link\s+/g);
    assert.strictEqual(linkMatches?.length, 2, 'Hero must contain exactly two action buttons');

    // 4. Milestone 1 (2076 BS) and Milestone 2 (2082 BS DAO) must be present in hero
    assert.ok(
      heroSection.includes('वि.सं. २०७६: ‘मादी सरोकार केन्द्र’ का रूपमा स्थापना'),
      'Hero must contain Milestone 1 (2076 BS)'
    );
    assert.ok(
      heroSection.includes('वि.सं. २०८२: ‘मादी (संखुवासभा) सरोकार समाज’ का रूपमा जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा विधिवत दर्ता'),
      'Hero must contain Milestone 2 (2082 BS DAO Registration)'
    );
  });

  // Test 6: Strict Prohibition of Scholarship Program and Medical Campaign Claims on Public Pages
  it('strictly blocks scholarship program and medical campaign/health camp claims from public pages', async () => {
    const publicPages = [
      path.join(rootDir, 'app', '[lang]', 'page.tsx'),
      path.join(rootDir, 'app', '[lang]', 'relief-support', 'page.tsx'),
      path.join(rootDir, 'app', '[lang]', 'activities', 'page.tsx'),
    ];

    for (const pagePath of publicPages) {
      const content = fs.readFileSync(pagePath, 'utf-8');

      // 1. No scholarship program claims
      assert.strictEqual(
        content.includes('छात्रवृत्ति कोष') || content.includes('scholarship endowment') || content.includes('academic scholarship'),
        false,
        `${path.basename(pagePath)} must NOT contain scholarship program claims`
      );

      // 2. No medical campaign or health camp claims
      assert.strictEqual(
        content.includes('स्वास्थ्य शिविर लाभान्वित') || content.includes('Health Beneficiaries') || content.includes('निःशुल्क स्वास्थ्य शिविर'),
        false,
        `${path.basename(pagePath)} must NOT contain health camp / medical campaign claims`
      );
    }
  });

  // Test 7: Strict Prohibition of Demo Membership, Relief, and Activity Records in Public APIs
  it('guarantees zero demo membership, relief, or activity records appear in public queries', async () => {
    // 1. Social Activities: Zero demo activities in public query
    const publicActivities = await getSocialActivities(undefined, false);
    assert.strictEqual(publicActivities.length, 0, 'Public activities must be 0 (no demo records)');

    // 2. Membership: Ensure no demo member names appear in public views
    const homePageSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'page.tsx'), 'utf-8');
    const membershipSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'membership', 'page.tsx'), 'utf-8');
    const demoNames = ['सुजन दाहाल', 'Sujan Dahal', 'सविता कटुवाल', 'Sabita Katuwal'];

    for (const name of demoNames) {
      assert.strictEqual(homePageSource.includes(name), false, `Homepage must not contain demo name ${name}`);
      assert.strictEqual(membershipSource.includes(name), false, `Membership page must not contain demo name ${name}`);
    }

    // 3. Relief: Ensure relief-support page contains zero demo disbursements or beneficiary names
    const reliefPageSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'relief-support', 'page.tsx'), 'utf-8');
    assert.strictEqual(
      reliefPageSource.includes('४५ घरधुरी') || reliefPageSource.includes('NPR 1,250,000') || reliefPageSource.includes('२५ जना जेहेन्दार विद्यार्थी'),
      false,
      'Relief support page must not contain demo beneficiary counts or amounts'
    );
  });

  // Test 8: Educational Infrastructure Support Evidence Category & School Record Gate
  it('enforces EDUCATION_INFRASTRUCTURE_SUPPORT evidence requirements and blocks unverified publication', async () => {
    const {
      saveEducationInfrastructureSupportRecord,
      getEducationInfrastructureSupportRecords,
    } = await import('../../lib/cms/cms-service.ts');

    // 1. Fails if mandatory fields are missing
    const missingSchool = await saveEducationInfrastructureSupportRecord({
      schoolNameNe: '',
      schoolNameEn: '',
      supportPurposeNe: 'भवन मर्मत',
      supportPurposeEn: 'Building repair',
      amountNpr: 50000,
      voucherReceiptRef: 'VOUCH-01',
      approvalMinuteRef: 'MIN-01',
      publicSafeSummaryNe: 'संक्षेप',
      publicSafeSummaryEn: 'Summary',
      fiscalYear: '2081-82',
      status: 'DRAFT',
      isPublic: false,
    });
    assert.strictEqual(missingSchool.success, false, 'Must fail when school name is missing');

    const missingVoucher = await saveEducationInfrastructureSupportRecord({
      schoolNameNe: 'श्री मादी माध्यमिक विद्यालय',
      schoolNameEn: 'Shree Madi Secondary School',
      supportPurposeNe: 'पुस्तकालय फर्निचर',
      supportPurposeEn: 'Library furniture',
      amountNpr: 100000,
      voucherReceiptRef: '', // Missing voucher
      approvalMinuteRef: 'MIN-02',
      publicSafeSummaryNe: 'संक्षेप',
      publicSafeSummaryEn: 'Summary',
      fiscalYear: '2081-82',
      status: 'DRAFT',
      isPublic: false,
    });
    assert.strictEqual(missingVoucher.success, false, 'Must fail when voucher/receipt is missing');

    // 2. Succeeds when all 6 required fields are provided
    const validRecord = await saveEducationInfrastructureSupportRecord({
      schoolNameNe: 'श्री मादी माध्यमिक विद्यालय',
      schoolNameEn: 'Shree Madi Secondary School',
      supportPurposeNe: 'विज्ञान प्रयोगशाला तथा शैक्षिक पूर्वाधार सुधार',
      supportPurposeEn: 'Science lab and educational infrastructure improvement',
      amountNpr: 150000,
      voucherReceiptRef: 'VOUCH-SCH-2082-01',
      approvalMinuteRef: 'MIN-MEETING-12-P4',
      publicSafeSummaryNe: 'मादी नगरपालिका स्थित स्थानीय विद्यालयको शैक्षिक पूर्वाधार सहयोगका लागि कोष अनुदान।',
      publicSafeSummaryEn: 'Grant support for educational infrastructure improvements for local school in Madi.',
      fiscalYear: '2081-82',
      status: 'DRAFT',
      isPublic: false,
    });
    assert.strictEqual(validRecord.success, true);
    assert.strictEqual(validRecord.data?.status, 'DRAFT', 'Record must default to DRAFT');
    assert.strictEqual(validRecord.data?.isPublic, false, 'Record must default to private');

    // 3. Invariant: Public query returns ZERO records (never auto-published)
    const publicSchoolRecords = await getEducationInfrastructureSupportRecords(false);
    assert.strictEqual(publicSchoolRecords.length, 0, 'No school support records may be published yet');
  });

  // Test 9: Partners Page Invariants (Only Madi Municipality, exact text, safe empty state)
  it('enforces Partners Page invariants: only Madi Municipality, exact description, safe empty state', async () => {
    const { getPartners } = await import('../../lib/cms/cms-service.ts');
    const partners = await getPartners();

    // 1. Only 1 partner: Madi Municipality
    assert.strictEqual(partners.length, 1, 'Only Madi Municipality should appear in partners');
    const madiMun = partners[0];
    assert.strictEqual(madiMun.nameNe, 'मादी नगरपालिका नगर कार्यपालिकाको कार्यालय');

    // 2. Nepal Red Cross and Communication Club fully removed
    assert.strictEqual(
      partners.some((p) => p.nameNe.includes('रेडक्रस') || p.nameEn.toLowerCase().includes('red cross')),
      false,
      'Nepal Red Cross must be completely removed'
    );
    assert.strictEqual(
      partners.some((p) => p.nameNe.includes('सञ्चार क्लब') || p.nameEn.toLowerCase().includes('media club')),
      false,
      'Communication Club must be completely removed'
    );

    // 3. Exact verified description
    assert.strictEqual(
      madiMun.contributionSummaryNe,
      'कोरोना महामारीको समयमा राहत वितरण तथा विपद् व्यवस्थापनमा स्थानीय तहगत सहकार्य।',
      'Must have exact approved partner description'
    );

    // 4. Safe empty state present in page source
    const partnersPageSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'partners', 'page.tsx'), 'utf-8');
    assert.ok(
      partnersPageSource.includes('थप संस्थागत तथा विकास साझेदारहरू'),
      'Partners page must contain safe empty state title'
    );
    assert.ok(
      partnersPageSource.includes('थप संस्थागत तथा विकास साझेदारहरूको विवरण आधिकारिक समझदारी तथा सम्झौता पश्चात् क्रमशः यहाँ अध्यावधिक गरिनेछ।'),
      'Partners page must contain safe empty state description'
    );

    // 5. REGRESSION TEST: Organization logo separation and partner logo safety
    // a. The organization's logo is NOT used as Madi Municipality's logo
    assert.notStrictEqual(
      madiMun.logoUrl,
      '/media/madi-sss-logo.jpg',
      "The organization's logo must NOT be assigned to Madi Municipality"
    );

    // b. Any partner does NOT use external stock images
    if (madiMun.logoUrl) {
      assert.strictEqual(
        madiMun.logoUrl.includes('unsplash.com') || madiMun.logoUrl.startsWith('http'),
        false,
        'Partner logo must not use external stock images'
      );
      const localLogoFile = path.join(rootDir, 'public', madiMun.logoUrl);
      assert.ok(
        fs.existsSync(localLogoFile),
        `Any referenced partner logo file must exist on disk at: ${localLogoFile}`
      );
    }

    // c. Organization logo file exists on disk at public/media/madi-sss-logo.jpg
    const orgLogoFile = path.join(rootDir, 'public', 'media', 'madi-sss-logo.jpg');
    assert.ok(
      fs.existsSync(orgLogoFile),
      `Organization logo file must exist at ${orgLogoFile}`
    );
    const orgLogoStats = fs.statSync(orgLogoFile);
    assert.ok(orgLogoStats.size > 10000, `Organization logo must have non-trivial size, got: ${orgLogoStats.size}`);

    // d. Organization logo is integrated into header, footer, about, membership, feedback, and admin
    const navSource = fs.readFileSync(path.join(rootDir, 'app', 'components', 'Nav.tsx'), 'utf-8');
    const footerSource = fs.readFileSync(path.join(rootDir, 'app', 'components', 'Footer.tsx'), 'utf-8');
    const aboutSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'about', 'page.tsx'), 'utf-8');
    const membershipPageSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'membership', 'page.tsx'), 'utf-8');
    const feedbackSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'feedback', 'page.tsx'), 'utf-8');
    const adminLayoutSource = fs.readFileSync(path.join(rootDir, 'app', '[lang]', 'admin', 'layout.tsx'), 'utf-8');

    assert.ok(navSource.includes('/media/madi-sss-logo.jpg'), 'Header Nav must use /media/madi-sss-logo.jpg');
    assert.ok(footerSource.includes('/media/madi-sss-logo.jpg'), 'Footer must use /media/madi-sss-logo.jpg');
    assert.ok(aboutSource.includes('/media/madi-sss-logo.jpg'), 'About page must use /media/madi-sss-logo.jpg');
    assert.ok(membershipPageSource.includes('/media/madi-sss-logo.jpg'), 'Membership page must use /media/madi-sss-logo.jpg');
    assert.ok(feedbackSource.includes('/media/madi-sss-logo.jpg'), 'Feedback page must use /media/madi-sss-logo.jpg');
    assert.ok(adminLayoutSource.includes('/media/madi-sss-logo.jpg'), 'Admin layout must use /media/madi-sss-logo.jpg');

    // e. Partners page card must not display Samaj logo
    assert.strictEqual(
      partnersPageSource.includes('madi-sss-logo.jpg'),
      false,
      'Partners page must not hardcode or display the Samaj logo on the partner card'
    );
  });

  // Test 10: Membership Page Invariants (Zero fee amounts, safe fee notice, no fees in dropdown, safe offline notice)
  it('enforces Membership Page invariants: no fee amounts, safe fee notice, clean dropdown, safe offline notice', async () => {
    const membershipPath = path.join(rootDir, 'app', '[lang]', 'membership', 'page.tsx');
    const membershipSource = fs.readFileSync(membershipPath, 'utf-8');

    // 1. No fee numbers (NPR 500, NPR 5,000, NPR 25,000+, etc.)
    const prohibitedFees = ['NPR ५००', 'NPR ५,०००', 'NPR २५,०००+', 'NPR 500', 'NPR 5,000', 'NPR 25,000+'];
    for (const fee of prohibitedFees) {
      assert.strictEqual(
        membershipSource.includes(fee),
        false,
        `Membership page must NOT contain fee string: "${fee}"`
      );
    }

    // 2. Safe fee notice must be present
    const expectedSafeNotice = 'सदस्यता शुल्क तथा वर्गीकरणको अन्तिम विवरण कार्यसमितिको आधिकारिक निर्णयपछि प्रकाशित गरिनेछ।';
    assert.ok(
      membershipSource.includes(expectedSafeNotice),
      'Membership page must include safe fee notice'
    );

    // 3. Form dropdown options must not contain fee amounts
    const dropdownMatch = membershipSource.match(/<select[\s\S]*?<\/select>/);
    assert.ok(dropdownMatch, 'Dropdown select must exist');
    const dropdownHtml = dropdownMatch[0];
    assert.strictEqual(dropdownHtml.includes('५००') || dropdownHtml.includes('500'), false, 'Dropdown must have no fee');
    assert.strictEqual(dropdownHtml.includes('५,०००') || dropdownHtml.includes('5,000'), false, 'Dropdown must have no fee');
    assert.strictEqual(dropdownHtml.includes('२५,०००') || dropdownHtml.includes('25,000'), false, 'Dropdown must have no fee');

    // 4. Offline PDF download button is replaced with safe notice
    assert.strictEqual(
      membershipSource.includes('href="/documents/madi-sss-membership-form.pdf"'),
      false,
      'Broken offline PDF link must be removed'
    );
    assert.ok(
      membershipSource.includes('कागजी (अफलाइन) सदस्यता फारमको आधिकारिक ढाँचा कार्यसमितिबाट अन्तिम प्रमाणीकरण भएपछि यहाँ उपलब्ध गराइनेछ।'),
      'Offline section must display safe preparation notice'
    );
  });

  // Test 11: About Page Invariants (No "जेहेन्दार विद्यार्थी", exact school wording, 2082/04/21 BS, no scholarship/medical claims)
  it('enforces About Page invariants: no "जेहेन्दार विद्यार्थी", exact school support phrasing, 2082/04/21 BS', async () => {
    const aboutPath = path.join(rootDir, 'app', '[lang]', 'about', 'page.tsx');
    const aboutSource = fs.readFileSync(aboutPath, 'utf-8');
    const settings = await getSiteSettings();

    // 1. "जेहेन्दार विद्यार्थी सहयोग" is fully removed from page and settings
    assert.strictEqual(aboutSource.includes('जेहेन्दार विद्यार्थी'), false, 'About page must not contain "जेहेन्दार विद्यार्थी"');
    assert.strictEqual(settings.aboutBackgroundP2Ne.includes('जेहेन्दार'), false, 'Settings must not contain "जेहेन्दार"');

    // 2. Exact approved wording is used
    assert.ok(
      settings.aboutBackgroundP2Ne.includes('विद्यालय सुधार तथा शैक्षिक पूर्वाधार सहयोग'),
      'Must use exact phrasing: "विद्यालय सुधार तथा शैक्षिक पूर्वाधार सहयोग"'
    );
    assert.ok(
      settings.aboutBackgroundP2Ne.includes('आकस्मिक चिकित्सा सहयोग'),
      'Must use phrasing: "आकस्मिक चिकित्सा सहयोग"'
    );

    // 3. No scholarship program or medical campaign claims in settings
    assert.strictEqual(
      settings.aboutBackgroundP2En.toLowerCase().includes('scholarship endowment'),
      false,
      'Settings must not claim scholarship endowments'
    );
    assert.strictEqual(
      settings.aboutBackgroundP2En.toLowerCase().includes('healthcare subsidies'),
      false,
      'Settings must not claim healthcare subsidies'
    );

    // 4. Verified registration date is 2082/04/21 BS
    assert.strictEqual(settings.registrationDateNe, '२०८२/०४/२१', 'Registration date must be २०८२/०४/२१');
    assert.ok(settings.registrationDateEn.includes('2082/04/21'), 'Registration date must be 2082/04/21 BS');

    // 5. Inactive email is quarantined with safe disclaimer
    assert.ok(
      aboutSource.includes('सक्रिय र नियमित हेरिने संस्थागत इमेल पुष्टि भएपछि मात्र सार्वजनिक सम्पर्क विवरण थपिनेछ।'),
      'About page must show institutional email disclaimer'
    );
  });
});
