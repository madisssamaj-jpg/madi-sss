import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getFinancialTransparencyRecords,
  getFinancialRecordById,
  saveFinancialTransparencyRecord,
  advanceFinancialWorkflow,
  deleteFinancialTransparencyRecord,
  type FinancialTransparencyRecord,
} from '../../lib/cms/cms-service.ts';

describe('Financial Transparency Checklist & Publication Workflow Governance Battery', () => {
  it('enforces Default Quarantine: all initial records are in DRAFT or INTERNAL_ONLY, public queries return 0 items', async () => {
    // 1. Admin query sees all 5 pre-seeded records
    const adminRecords = await getFinancialTransparencyRecords(undefined, undefined, true);
    assert.strictEqual(adminRecords.length, 5, 'Must contain initial 5 pre-seeded financial records');

    for (const rec of adminRecords) {
      assert.ok(
        rec.status === 'DRAFT' || rec.status === 'INTERNAL_ONLY',
        `Record ${rec.id} must be quarantined in DRAFT or INTERNAL_ONLY, found: ${rec.status}`
      );
      assert.strictEqual(rec.isPublic, false, `Record ${rec.id} must not be public`);
    }

    // 2. Public query strictly returns ZERO records
    const publicRecords = await getFinancialTransparencyRecords(undefined, undefined, false);
    assert.strictEqual(publicRecords.length, 0, 'Public query must return 0 records while all are quarantined');

    // 3. Public getById strictly returns null
    const pubItem = await getFinancialRecordById('fin-rec-001', false);
    assert.strictEqual(pubItem, null, 'Public query for quarantined item must return null');
  });

  it('enforces Missing Evidence Gate: publication or advancing to president approval rejected without verified supporting evidence', async () => {
    // 1. Create a record without verified supporting evidence
    const unverifiedRec = await saveFinancialTransparencyRecord({
      id: 'fin-test-unverified-evidence',
      recordType: 'ACTIVITY_EXPENSE',
      amount: 25000,
      currency: 'NPR',
      transactionDate: '२०८२-०५-१५',
      payerPayeeCategory: 'SERVICE_PROVIDER',
      supportingEvidence: {
        voucherRef: 'VOUCH-PENDING-99', // Reference provided, but verification is FALSE
      },
      evidenceVerification: {
        bankStatementVerified: false,
        voucherVerified: false, // NOT VERIFIED
        invoiceVerified: false,
        receiptVerified: false,
        approvalMinuteVerified: false,
        auditReportVerified: false,
      },
      status: 'DRAFT',
      publicSummary: {
        descriptionNe: 'सामुदायिक कार्यक्रम हल भाडा',
        descriptionEn: 'Community event hall rental',
        isAmountVisible: true,
      },
      adminNotes: 'Field bill submitted without official tax invoice.',
    });

    assert.strictEqual(unverifiedRec.status, 'DRAFT');

    // 2. Advance to PENDING_TREASURER_REVIEW
    const toTreasurer = await advanceFinancialWorkflow(
      'fin-test-unverified-evidence',
      'PENDING_TREASURER_REVIEW',
      'Admin Assistant'
    );
    assert.strictEqual(toTreasurer.success, true);

    // 3. Attempting to complete Treasurer Review without verified evidence MUST FAIL
    const treasurerFail = await advanceFinancialWorkflow(
      'fin-test-unverified-evidence',
      'PENDING_PRESIDENT_APPROVAL',
      'CA. Manish Karki',
      'Attempting review with unverified voucher'
    );
    assert.strictEqual(treasurerFail.success, false);
    assert.ok(
      treasurerFail.error?.includes('प्रमाणीकरण अपुग') || treasurerFail.error?.includes('प्रमाण'),
      'Must reject treasurer review when evidence verification is false'
    );

    // 4. Attempting direct save with APPROVED_PUBLIC without verified evidence must downgrade to DRAFT
    const directSaveAttempt = await saveFinancialTransparencyRecord({
      id: 'fin-test-unverified-evidence',
      recordType: 'ACTIVITY_EXPENSE',
      amount: 25000,
      status: 'APPROVED_PUBLIC',
    });
    assert.notStrictEqual(directSaveAttempt.status, 'APPROVED_PUBLIC');
    assert.strictEqual(directSaveAttempt.isPublic, false);

    await deleteFinancialTransparencyRecord('fin-test-unverified-evidence');
  });

  it('enforces Treasurer Review Gate: publication rejected if Treasurer Review has not been conducted', async () => {
    // 1. Create record with verified evidence but NO Treasurer Review
    await saveFinancialTransparencyRecord({
      id: 'fin-test-skip-treasurer',
      recordType: 'RELIEF_FUND_CONTRIBUTION',
      amount: 100000,
      currency: 'NPR',
      transactionDate: '२०८२-०५-१८',
      payerPayeeCategory: 'INSTITUTIONAL_DONOR',
      supportingEvidence: {
        bankStatementRef: 'TXN-BANK-11920',
      },
      evidenceVerification: {
        bankStatementVerified: true,
        voucherVerified: false,
        invoiceVerified: false,
        receiptVerified: false,
        approvalMinuteVerified: false,
        auditReportVerified: false,
      },
      status: 'DRAFT',
      publicSummary: {
        descriptionNe: 'संस्थागत राहत सहयोग',
        descriptionEn: 'Institutional relief fund contribution',
        isAmountVisible: true,
      },
    });

    // 2. Attempt to jump directly to APPROVED_PUBLIC without Treasurer Review -> MUST FAIL
    const jumpFail = await advanceFinancialWorkflow(
      'fin-test-skip-treasurer',
      'APPROVED_PUBLIC',
      'Dambar Bahadur Shrestha',
      'Skipping treasurer'
    );
    assert.strictEqual(jumpFail.success, false);
    assert.ok(
      jumpFail.error?.includes('कोषाध्यक्ष') || jumpFail.error?.includes('Treasurer Review'),
      'Must cite required Treasurer Review'
    );

    const recAfter = await getFinancialRecordById('fin-test-skip-treasurer', true);
    assert.ok(recAfter);
    assert.strictEqual(recAfter.status, 'DRAFT');
    assert.strictEqual(recAfter.isPublic, false);

    await deleteFinancialTransparencyRecord('fin-test-skip-treasurer');
  });

  it('enforces President Approval Gate: publication rejected without President approver name or safe description', async () => {
    // 1. Create record
    await saveFinancialTransparencyRecord({
      id: 'fin-test-president-gate',
      recordType: 'RELIEF_FUND_EXPENDITURE',
      amount: 60000,
      currency: 'NPR',
      transactionDate: '२०८२-०५-२०',
      payerPayeeCategory: 'VENDOR',
      supportingEvidence: {
        voucherRef: 'VOUCH-RELIEF-44',
        approvalMinuteRef: 'MIN-RELIEF-44',
      },
      evidenceVerification: {
        bankStatementVerified: false,
        voucherVerified: true,
        invoiceVerified: false,
        receiptVerified: false,
        approvalMinuteVerified: true,
        auditReportVerified: false,
      },
      status: 'DRAFT',
      publicSummary: {
        descriptionNe: 'राहत त्रिपाल खरिद',
        descriptionEn: 'Emergency tarpaulin procurement',
        isAmountVisible: true,
      },
    });

    // 2. Step 1: Advance to PENDING_TREASURER_REVIEW
    await advanceFinancialWorkflow('fin-test-president-gate', 'PENDING_TREASURER_REVIEW', 'Admin');

    // 3. Step 2: Treasurer reviews and verifies
    const treasurerStep = await advanceFinancialWorkflow(
      'fin-test-president-gate',
      'PENDING_PRESIDENT_APPROVAL',
      'CA. Manish Karki',
      'Voucher audited against vendor manifest'
    );
    assert.strictEqual(treasurerStep.success, true);
    assert.strictEqual(treasurerStep.data?.status, 'PENDING_PRESIDENT_APPROVAL');
    assert.strictEqual(treasurerStep.data?.reviewedByTreasurerName, 'CA. Manish Karki');

    // 4. Attempt to publish with empty President name -> MUST FAIL
    const emptyPresidentFail = await advanceFinancialWorkflow(
      'fin-test-president-gate',
      'APPROVED_PUBLIC',
      '', // Empty president name
      'Attempting publish'
    );
    assert.strictEqual(emptyPresidentFail.success, false);
    assert.ok(
      emptyPresidentFail.error?.includes('अध्यक्ष') || emptyPresidentFail.error?.includes('स्वीकृति'),
      'Must cite required President approval'
    );

    await deleteFinancialTransparencyRecord('fin-test-president-gate');
  });

  it('enforces Full Workflow & Strips Private Audit from Public API upon approval', async () => {
    // 1. Create verified record
    await saveFinancialTransparencyRecord({
      id: 'fin-test-approved-flow',
      recordType: 'RELIEF_FUND_EXPENDITURE',
      amount: 85000,
      currency: 'NPR',
      transactionDate: '२०८२-०५-२२',
      payerPayeeCategory: 'VENDOR',
      supportingEvidence: {
        bankStatementRef: 'TXN-BANK-9901',
        voucherRef: 'VOUCH-MED-881',
        invoiceRef: 'INV-PHARM-440',
        approvalMinuteRef: 'MIN-EXEC-16',
      },
      evidenceVerification: {
        bankStatementVerified: true,
        voucherVerified: true,
        invoiceVerified: true,
        receiptVerified: false,
        approvalMinuteVerified: true,
        auditReportVerified: false,
      },
      status: 'DRAFT',
      publicSummary: {
        descriptionNe: 'बाढीपीडित परिवारहरूको लागि औषधि तथा स्वास्थ्य सामग्री',
        descriptionEn: 'Medical and healthcare supplies for flood victims',
        isAmountVisible: true,
        approvedDocumentUrl: '/documents/reports/relief-expenditure-summary.pdf',
      },
      adminNotes: 'Vendor account paid via institutional cheque 002131. Confidential ledger note.',
    });

    // 2. Step 1: PENDING_TREASURER_REVIEW
    await advanceFinancialWorkflow('fin-test-approved-flow', 'PENDING_TREASURER_REVIEW', 'Finance Officer');

    // 3. Step 2: PENDING_PRESIDENT_APPROVAL (Treasurer Review)
    const treasurerRes = await advanceFinancialWorkflow(
      'fin-test-approved-flow',
      'PENDING_PRESIDENT_APPROVAL',
      'CA. Manish Karki',
      'All 4 financial evidence items cross-verified against bank statement.'
    );
    assert.strictEqual(treasurerRes.success, true);
    assert.strictEqual(treasurerRes.data?.reviewedByTreasurerName, 'CA. Manish Karki');
    assert.ok(treasurerRes.data?.reviewedByTreasurerAt);

    // 4. Step 3: APPROVED_PUBLIC (President Approval)
    const presidentRes = await advanceFinancialWorkflow(
      'fin-test-approved-flow',
      'APPROVED_PUBLIC',
      'Dambar Bahadur Shrestha',
      'Executive committee approved public transparency release.'
    );
    assert.strictEqual(presidentRes.success, true);
    assert.strictEqual(presidentRes.data?.status, 'APPROVED_PUBLIC');
    assert.strictEqual(presidentRes.data?.isPublic, true);
    assert.strictEqual(presidentRes.data?.approvedByPresidentName, 'Dambar Bahadur Shrestha');
    assert.ok(presidentRes.data?.approvedByPresidentAt);

    // 5. Public API Sanitization verification
    const publicList = await getFinancialTransparencyRecords(undefined, undefined, false);
    assert.strictEqual(publicList.length, 1, 'Only the approved public record must be returned');

    const pub = publicList[0];
    assert.strictEqual(pub.id, 'fin-test-approved-flow');
    assert.strictEqual(pub.recordType, 'RELIEF_FUND_EXPENDITURE');
    assert.strictEqual(pub.amount, 85000, 'Approved amount exposed');
    assert.strictEqual(pub.currency, 'NPR');
    assert.strictEqual(pub.transactionDate, '२०८२-०५-२२');
    assert.strictEqual(pub.publicSummary.descriptionNe, 'बाढीपीडित परिवारहरूको लागि औषधि तथा स्वास्थ्य सामग्री');
    assert.strictEqual(pub.publicSummary.approvedDocumentUrl, '/documents/reports/relief-expenditure-summary.pdf');

    // Private fields MUST BE STRIPPED
    assert.strictEqual((pub as any).payerPayeeCategory, undefined, 'Payer/Payee category must be stripped');
    assert.deepStrictEqual(pub.supportingEvidence, {}, 'Raw supporting evidence references must be stripped');
    assert.deepStrictEqual(pub.evidenceVerification, {}, 'Internal evidence verification flags must be stripped');
    assert.strictEqual(pub.reviewedByTreasurerName, undefined, 'Treasurer name must be stripped');
    assert.strictEqual(pub.reviewedByTreasurerAt, undefined, 'Treasurer timestamp must be stripped');
    assert.strictEqual(pub.treasurerNotes, undefined, 'Treasurer notes must be stripped');
    assert.strictEqual(pub.approvedByPresidentName, undefined, 'President name must be stripped');
    assert.strictEqual(pub.approvedByPresidentAt, undefined, 'President timestamp must be stripped');
    assert.strictEqual(pub.presidentNotes, undefined, 'President notes must be stripped');
    assert.strictEqual((pub as any).adminNotes, undefined, 'Admin notes must be stripped');

    // 6. Test Public getById Sanitization
    const pubById = await getFinancialRecordById('fin-test-approved-flow', false);
    assert.ok(pubById);
    assert.strictEqual((pubById as any).payerPayeeCategory, undefined);
    assert.strictEqual(pubById.reviewedByTreasurerName, undefined);
    assert.strictEqual((pubById as any).adminNotes, undefined);

    // 7. Clean up
    await deleteFinancialTransparencyRecord('fin-test-approved-flow');
    const cleanedList = await getFinancialTransparencyRecords(undefined, undefined, false);
    assert.strictEqual(cleanedList.length, 0, 'Zero public records must remain after cleanup');
  });

  describe('Record-Type-Specific Minimum Evidence Requirements Battery', () => {
    it('RELIEF_FUND_EXPENDITURE requires (voucher OR receipt) AND approval minute', async () => {
      // 1. Missing approval minute -> must fail
      await saveFinancialTransparencyRecord({
        id: 'fin-min-relief-exp',
        recordType: 'RELIEF_FUND_EXPENDITURE',
        amount: 30000,
        supportingEvidence: { voucherRef: 'VOUCH-01' },
        evidenceVerification: {
          voucherVerified: true,
          approvalMinuteVerified: false, // Missing minute
          bankStatementVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
          auditReportVerified: false,
        },
        status: 'DRAFT',
      });
      const failNoMinute = await advanceFinancialWorkflow('fin-min-relief-exp', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(failNoMinute.success, false);
      assert.ok(failNoMinute.error?.includes('निर्णय पुस्तिका'));

      // 2. Missing voucher and receipt -> must fail
      await saveFinancialTransparencyRecord({
        id: 'fin-min-relief-exp',
        recordType: 'RELIEF_FUND_EXPENDITURE',
        amount: 30000,
        supportingEvidence: { approvalMinuteRef: 'MIN-01' },
        evidenceVerification: {
          voucherVerified: false,
          receiptVerified: false,
          approvalMinuteVerified: true,
          bankStatementVerified: false,
          invoiceVerified: false,
          auditReportVerified: false,
        },
      });
      const failNoVoucher = await advanceFinancialWorkflow('fin-min-relief-exp', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(failNoVoucher.success, false);
      assert.ok(failNoVoucher.error?.includes('भौचर वा रसिद'));

      // 3. Receipt AND minute -> must succeed
      await saveFinancialTransparencyRecord({
        id: 'fin-min-relief-exp',
        recordType: 'RELIEF_FUND_EXPENDITURE',
        amount: 30000,
        supportingEvidence: { receiptRef: 'REC-01', approvalMinuteRef: 'MIN-01' },
        evidenceVerification: {
          voucherVerified: false,
          receiptVerified: true,
          approvalMinuteVerified: true,
          bankStatementVerified: false,
          invoiceVerified: false,
          auditReportVerified: false,
        },
      });
      const passWithReceipt = await advanceFinancialWorkflow('fin-min-relief-exp', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(passWithReceipt.success, true);
      assert.strictEqual(passWithReceipt.data?.status, 'PENDING_PRESIDENT_APPROVAL');

      await deleteFinancialTransparencyRecord('fin-min-relief-exp');
    });

    it('ACTIVITY_EXPENSE requires (voucher OR receipt) AND approval minute', async () => {
      await saveFinancialTransparencyRecord({
        id: 'fin-min-act-exp',
        recordType: 'ACTIVITY_EXPENSE',
        amount: 15000,
        supportingEvidence: { voucherRef: 'VOUCH-ACT-01', approvalMinuteRef: 'MIN-ACT-01' },
        evidenceVerification: {
          voucherVerified: true,
          approvalMinuteVerified: true,
          bankStatementVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
          auditReportVerified: false,
        },
        status: 'DRAFT',
      });
      const res = await advanceFinancialWorkflow('fin-min-act-exp', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data?.status, 'PENDING_PRESIDENT_APPROVAL');

      await deleteFinancialTransparencyRecord('fin-min-act-exp');
    });

    it('AUDIT_REPORT requires signed audit report AND approval minute', async () => {
      // 1. Without signed audit report -> must fail
      await saveFinancialTransparencyRecord({
        id: 'fin-min-audit',
        recordType: 'AUDIT_REPORT',
        amount: 0,
        supportingEvidence: { approvalMinuteRef: 'MIN-AGM-01' },
        evidenceVerification: {
          auditReportVerified: false, // Missing audit report
          approvalMinuteVerified: true,
          bankStatementVerified: false,
          voucherVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
        },
        status: 'DRAFT',
      });
      const failAudit = await advanceFinancialWorkflow('fin-min-audit', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(failAudit.success, false);
      assert.ok(failAudit.error?.includes('अडिट प्रतिवेदन'));

      // 2. Both present and verified -> succeeds
      await saveFinancialTransparencyRecord({
        id: 'fin-min-audit',
        recordType: 'AUDIT_REPORT',
        amount: 0,
        supportingEvidence: { auditReportRef: 'AUDIT-FINAL-SIGNED.pdf', approvalMinuteRef: 'MIN-AGM-01' },
        evidenceVerification: {
          auditReportVerified: true,
          approvalMinuteVerified: true,
          bankStatementVerified: false,
          voucherVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
        },
      });
      const passAudit = await advanceFinancialWorkflow('fin-min-audit', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(passAudit.success, true);

      await deleteFinancialTransparencyRecord('fin-min-audit');
    });

    it('ANNUAL_FINANCIAL_STATEMENT requires signed statement AND approval minute', async () => {
      // 1. Without signed statement -> must fail
      await saveFinancialTransparencyRecord({
        id: 'fin-min-statement',
        recordType: 'ANNUAL_FINANCIAL_STATEMENT',
        amount: 250000,
        supportingEvidence: { approvalMinuteRef: 'MIN-EXEC-10' },
        evidenceVerification: {
          approvalMinuteVerified: true,
          signedStatementVerified: false,
          auditReportVerified: false,
          bankStatementVerified: false,
          voucherVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
        },
        status: 'DRAFT',
      });
      const failStmt = await advanceFinancialWorkflow('fin-min-statement', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(failStmt.success, false);
      assert.ok(failStmt.error?.includes('वित्तीय विवरण'));

      // 2. Both verified -> succeeds
      await saveFinancialTransparencyRecord({
        id: 'fin-min-statement',
        recordType: 'ANNUAL_FINANCIAL_STATEMENT',
        amount: 250000,
        supportingEvidence: { signedStatementRef: 'ANNUAL-STMT-2081-SIGNED.pdf', approvalMinuteRef: 'MIN-EXEC-10' },
        evidenceVerification: {
          signedStatementVerified: true,
          approvalMinuteVerified: true,
          auditReportVerified: false,
          bankStatementVerified: false,
          voucherVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
        },
      });
      const passStmt = await advanceFinancialWorkflow('fin-min-statement', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(passStmt.success, true);

      await deleteFinancialTransparencyRecord('fin-min-statement');
    });

    it('RELIEF_FUND_CONTRIBUTION requires (bank statement OR receipt) AND approval minute', async () => {
      // 1. Bank statement without minute -> fails
      await saveFinancialTransparencyRecord({
        id: 'fin-min-contrib',
        recordType: 'RELIEF_FUND_CONTRIBUTION',
        amount: 50000,
        supportingEvidence: { bankStatementRef: 'TXN-BANK-001' },
        evidenceVerification: {
          bankStatementVerified: true,
          approvalMinuteVerified: false, // Missing minute
          voucherVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
          auditReportVerified: false,
        },
        status: 'DRAFT',
      });
      const failMinute = await advanceFinancialWorkflow('fin-min-contrib', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(failMinute.success, false);

      // 2. Bank statement AND minute -> succeeds
      await saveFinancialTransparencyRecord({
        id: 'fin-min-contrib',
        recordType: 'RELIEF_FUND_CONTRIBUTION',
        amount: 50000,
        supportingEvidence: { bankStatementRef: 'TXN-BANK-001', approvalMinuteRef: 'MIN-EXEC-12' },
        evidenceVerification: {
          bankStatementVerified: true,
          approvalMinuteVerified: true,
          voucherVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
          auditReportVerified: false,
        },
      });
      const passContrib = await advanceFinancialWorkflow('fin-min-contrib', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(passContrib.success, true);

      await deleteFinancialTransparencyRecord('fin-min-contrib');
    });

    it('OTHER_FINANCIAL_DOCUMENT requires at least one verified document AND approval minute', async () => {
      // 1. Without supporting document -> fails
      await saveFinancialTransparencyRecord({
        id: 'fin-min-other',
        recordType: 'OTHER_FINANCIAL_DOCUMENT',
        amount: 10000,
        supportingEvidence: { approvalMinuteRef: 'MIN-OTHER-01' },
        evidenceVerification: {
          approvalMinuteVerified: true,
          bankStatementVerified: false,
          voucherVerified: false,
          invoiceVerified: false,
          receiptVerified: false,
          auditReportVerified: false,
        },
        status: 'DRAFT',
      });
      const failOther = await advanceFinancialWorkflow('fin-min-other', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(failOther.success, false);
      assert.ok(failOther.error?.includes('सहायक कागजात'));

      // 2. Invoice AND minute -> succeeds
      await saveFinancialTransparencyRecord({
        id: 'fin-min-other',
        recordType: 'OTHER_FINANCIAL_DOCUMENT',
        amount: 10000,
        supportingEvidence: { invoiceRef: 'INV-TAX-99', approvalMinuteRef: 'MIN-OTHER-01' },
        evidenceVerification: {
          invoiceVerified: true,
          approvalMinuteVerified: true,
          bankStatementVerified: false,
          voucherVerified: false,
          receiptVerified: false,
          auditReportVerified: false,
        },
      });
      const passOther = await advanceFinancialWorkflow('fin-min-other', 'PENDING_PRESIDENT_APPROVAL', 'Treasurer');
      assert.strictEqual(passOther.success, true);

      await deleteFinancialTransparencyRecord('fin-min-other');
    });
  });
});

