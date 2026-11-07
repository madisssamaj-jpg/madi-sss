import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getInternalActivityRecords,
  getInternalFinancialRecords,
  getPublicActivityRecords,
  getPublicFinancialRecords,
  saveInternalActivityRecord,
  saveInternalFinancialRecord,
  searchInternalArchiveRecords,
  resolveRetentionCategory,
  buildArchivePath,
  PERMANENT_RECORD_TYPES,
} from '../../lib/cms/cms-service.ts';

describe('Internal Activity & Financial Record-Keeping Governance Battery', () => {
  it('enforces Quarantine & No-Auto-Publish Invariant by default', async () => {
    // 1. Initial activity records must remain internal/draft
    const activities = await getInternalActivityRecords('2081-82');
    assert.ok(activities.length >= 2, 'Pre-seeded 2081-82 activities must exist');
    for (const act of activities) {
      assert.ok(
        act.publicationStatus === 'INTERNAL_ONLY' || act.publicationStatus === 'DRAFT',
        `Activity ${act.id} must be quarantined in INTERNAL_ONLY or DRAFT`
      );
      assert.equal(
        act.publicSafeSummary.isApprovedForPublic,
        false,
        `Activity ${act.id} publicSafeSummary must not be approved for public by default`
      );
    }

    // 2. Initial financial records must remain internal/draft
    const financials = await getInternalFinancialRecords('2081-82');
    assert.ok(financials.length >= 3, 'Pre-seeded 2081-82 financial records must exist');
    for (const fin of financials) {
      assert.ok(
        fin.publicationStatus === 'INTERNAL_ONLY' || fin.publicationStatus === 'DRAFT',
        `Financial record ${fin.id} must be quarantined in INTERNAL_ONLY or DRAFT`
      );
      assert.equal(
        fin.publicSafeSummary.isApprovedForPublic,
        false,
        `Financial record ${fin.id} publicSafeSummary must not be approved for public by default`
      );
    }

    // 3. Public queries MUST return zero initial records
    const publicActs = await getPublicActivityRecords('2081-82');
    assert.equal(publicActs.length, 0, 'Public activity query must return 0 records when nothing is approved');

    const publicFins = await getPublicFinancialRecords('2081-82');
    assert.equal(publicFins.length, 0, 'Public financial query must return 0 records when nothing is approved');
  });

  it('organizes archive paths strictly by fiscal year and designated category folders', () => {
    assert.equal(
      buildArchivePath('2081-82', 'activities', 'act-001'),
      '2081-82/activities/act-001'
    );
    assert.equal(
      buildArchivePath('2081-82', 'relief-fund', 'fin-001'),
      '2081-82/relief-fund/fin-001'
    );
    assert.equal(
      buildArchivePath('2081-82', 'audit', 'aud-001'),
      '2081-82/audit/aud-001'
    );
    assert.equal(
      buildArchivePath('2081-82', 'documents', 'doc-001'),
      '2081-82/documents/doc-001'
    );
  });

  it('enforces Retention Classification Rules (Permanent vs Long-Term)', () => {
    // Permanent records
    assert.equal(resolveRetentionCategory('constitution'), 'PERMANENT');
    assert.equal(resolveRetentionCategory('registration_certificate'), 'PERMANENT');
    assert.equal(resolveRetentionCategory('audit_report'), 'PERMANENT');
    assert.equal(resolveRetentionCategory('annual_financial_statement'), 'PERMANENT');
    assert.equal(resolveRetentionCategory('executive_minutes'), 'PERMANENT');
    assert.equal(resolveRetentionCategory('AUDIT_REPORT'), 'PERMANENT');
    assert.equal(resolveRetentionCategory('ANNUAL_FINANCIAL_STATEMENT'), 'PERMANENT');

    // Long-term records
    assert.equal(resolveRetentionCategory('bank_statement'), 'LONG_TERM');
    assert.equal(resolveRetentionCategory('voucher_receipt'), 'LONG_TERM');
    assert.equal(resolveRetentionCategory('activity_report'), 'LONG_TERM');
    assert.equal(resolveRetentionCategory('photo_consent_form'), 'LONG_TERM');
    assert.equal(resolveRetentionCategory('raw_attendance_sheet'), 'LONG_TERM');
    assert.equal(resolveRetentionCategory('RELIEF_FUND_EXPENDITURE'), 'LONG_TERM');
  });

  it('enforces Strict Activity Separation: public projection strips attendance, consent, vouchers, and minutes', async () => {
    // Create an approved public test activity
    const testActivity = await saveInternalActivityRecord({
      id: 'act-test-approved-public',
      fiscalYear: '2081-82',
      titleNe: 'मादी जनस्वास्थ्य सचेतना गोष्ठी',
      titleEn: 'Madi Public Health Awareness Seminar',
      date: '२०८१-१२-०१',
      location: 'काठमाण्डौं',
      organizer: 'मादी सरोकार समाज',
      attendanceSheetRef: 'internal-docs/attendance/raw-citizen-attendance-with-signatures.pdf',
      activityReportRef: 'internal-docs/reports/medical-health-seminar-internal.pdf',
      photoAlbumRef: 'internal-docs/albums/health-seminar-2081/',
      photoConsentRefs: ['consent-patient-raw-01', 'consent-family-02'],
      hasReceiptsVouchers: true,
      voucherRefs: ['internal-docs/vouchers/bill-sound-system-001.pdf'],
      bankStatementRef: 'internal-docs/bank/bank-stmt-p3-entry-tx112.pdf',
      approvalMinuteRef: 'minute-ec-decision-book-page-88',
      publicationStatus: 'APPROVED_PUBLIC',
      publicSafeSummary: {
        summaryNe: 'काठमाण्डौंमा मादीवासीहरूका लागि स्वास्थ्य सचेतना गोष्ठी सम्पन्न।',
        summaryEn: 'Public health awareness seminar concluded in Kathmandu.',
        publicReportUrl: '/reports/public-health-seminar-summary.pdf',
        isApprovedForPublic: true,
      },
      adminNotes: 'Confidential attendee signatures and internal expenses strictly withheld.',
    });

    assert.equal(testActivity.publicationStatus, 'APPROVED_PUBLIC');

    // Fetch through public query
    const publicRecords = await getPublicActivityRecords('2081-82');
    const target = publicRecords.find((r) => r.id === 'act-test-approved-public');
    assert.ok(target, 'Approved record must appear in public queries');

    // Verify public-safe fields exist
    assert.equal(target.titleNe, 'मादी जनस्वास्थ्य सचेतना गोष्ठी');
    assert.equal(target.publicSummaryNe, 'काठमाण्डौंमा मादीवासीहरूका लागि स्वास्थ्य सचेतना गोष्ठी सम्पन्न।');
    assert.equal(target.publicReportUrl, '/reports/public-health-seminar-summary.pdf');

    // CRITICAL: Verify internal sensitive references are NEVER exposed
    assert.equal((target as any).attendanceSheetRef, undefined, 'Attendance sheet ref must be stripped');
    assert.equal((target as any).photoConsentRefs, undefined, 'Photo consent refs must be stripped');
    assert.equal((target as any).voucherRefs, undefined, 'Voucher refs must be stripped');
    assert.equal((target as any).bankStatementRef, undefined, 'Bank statement ref must be stripped');
    assert.equal((target as any).approvalMinuteRef, undefined, 'Approval minute ref must be stripped');
    assert.equal((target as any).adminNotes, undefined, 'Admin notes must be stripped');
    assert.equal((target as any).archivePath, undefined, 'Raw archive path must be stripped');
  });

  it('enforces Strict Financial Separation: never exposes donor/beneficiary identity, bank account, check number, or ledger code', async () => {
    // Create an approved public test financial summary
    const testFinancial = await saveInternalFinancialRecord({
      id: 'fin-test-approved-public',
      fiscalYear: '2081-82',
      category: 'relief-fund',
      transactionType: 'RELIEF_FUND_EXPENDITURE',
      date: '२०८१-०६-१०',
      amount: 75000,
      currency: 'NPR',
      payerPayeeCategory: 'HUMANITARIAN_EMERGENCY_SUPPORT',
      donorBeneficiaryPrivateIdentity: 'राम बहादुर श्रेष्ठ (नागरिकता नं. ०६-०१-७५-१२३४५)',
      bankAccountRef: 'Machhapuchchhre Bank A/C 99018471928410',
      checkNumber: 'CHQ-881920-A',
      internalLedgerCode: 'GL-ACC-RELIEF-009',
      supportingDocumentRefs: ['vouchers/voucher-cash-cheque-handover-signed.pdf'],
      bankStatementRef: 'bank/statement-september-2081.pdf',
      verificationStatus: 'VERIFIED',
      reviewedByTreasurerName: 'Treasurer Bahadur',
      reviewedByTreasurerAt: '2026-09-20T10:00:00Z',
      approvedByPresidentName: 'President Sharma',
      approvedByPresidentAt: '2026-09-21T12:00:00Z',
      publicationStatus: 'APPROVED_PUBLIC',
      publicSafeSummary: {
        descriptionNe: 'प्राकृतिक प्रकोप पीडित परिवारका लागि स्वीकृत आकस्मिक राहत सहायता।',
        descriptionEn: 'Approved emergency relief assistance for disaster-affected family.',
        approvedAmountVisibility: true,
        approvedDocumentUrl: '/documents/relief-summary-q2-2081.pdf',
        isApprovedForPublic: true,
      },
      adminNotes: 'Private citizen citizenship number and bank account redacted under privacy laws.',
    });

    assert.equal(testFinancial.publicationStatus, 'APPROVED_PUBLIC');

    // Fetch through public query
    const publicRecords = await getPublicFinancialRecords('2081-82');
    const target = publicRecords.find((r) => r.id === 'fin-test-approved-public');
    assert.ok(target, 'Approved record must appear in public queries');

    // Public details verify
    assert.equal(target.transactionType, 'RELIEF_FUND_EXPENDITURE');
    assert.equal(target.amount, 75000);
    assert.equal(target.payerPayeeCategory, 'HUMANITARIAN_EMERGENCY_SUPPORT');
    assert.equal(target.publicDescriptionNe, 'प्राकृतिक प्रकोप पीडित परिवारका लागि स्वीकृत आकस्मिक राहत सहायता।');

    // CRITICAL SECURITY INVARIANTS: Personal and internal bank data MUST be stripped
    assert.equal((target as any).donorBeneficiaryPrivateIdentity, undefined, 'Beneficiary identity must be stripped');
    assert.equal((target as any).bankAccountRef, undefined, 'Bank account ref must be stripped');
    assert.equal((target as any).checkNumber, undefined, 'Check number must be stripped');
    assert.equal((target as any).internalLedgerCode, undefined, 'Internal ledger code must be stripped');
    assert.equal((target as any).supportingDocumentRefs, undefined, 'Supporting document refs must be stripped');
    assert.equal((target as any).bankStatementRef, undefined, 'Bank statement ref must be stripped');
    assert.equal((target as any).reviewedByTreasurerName, undefined, 'Treasurer name must be stripped');
    assert.equal((target as any).approvedByPresidentName, undefined, 'President name must be stripped');
    assert.equal((target as any).adminNotes, undefined, 'Admin notes must be stripped');
  });

  it('supports comprehensive Admin Search & Filter across fiscal year, category, and verification status', async () => {
    // 1. Filter by fiscal year
    const yearSearch = await searchInternalArchiveRecords({ fiscalYear: '2081-82' });
    assert.ok(yearSearch.activities.length >= 2);
    assert.ok(yearSearch.financials.length >= 3);
    for (const a of yearSearch.activities) assert.equal(a.fiscalYear, '2081-82');
    for (const f of yearSearch.financials) assert.equal(f.fiscalYear, '2081-82');

    // 2. Filter by category: relief-fund
    const reliefSearch = await searchInternalArchiveRecords({ category: 'relief-fund' });
    assert.ok(reliefSearch.financials.length >= 1);
    for (const f of reliefSearch.financials) assert.equal(f.category, 'relief-fund');

    // 3. Filter by category: audit
    const auditSearch = await searchInternalArchiveRecords({ category: 'audit' });
    assert.ok(auditSearch.financials.length >= 1);
    for (const f of auditSearch.financials) assert.equal(f.category, 'audit');

    // 4. Filter by retention category: PERMANENT
    const permanentSearch = await searchInternalArchiveRecords({ retentionCategory: 'PERMANENT' });
    assert.ok(permanentSearch.financials.length >= 2, 'Audit report & Constitution must be permanent');
    for (const f of permanentSearch.financials) assert.equal(f.retentionCategory, 'PERMANENT');

    // 5. Free-text search term
    const textSearch = await searchInternalArchiveRecords({ searchTerm: 'ओखरबोटे' });
    assert.ok(textSearch.activities.length >= 1);
    assert.ok(textSearch.activities[0].location.includes('ओखरबोटे'));
  });
});

