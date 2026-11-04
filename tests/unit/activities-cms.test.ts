import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSocialActivities,
  getSocialActivityBySlug,
  saveSocialActivity,
  deleteSocialActivity,
  advanceActivityWorkflow,
  type SocialActivity,
} from '../../lib/cms/cms-service.ts';

describe('Activity Publishing System & Governance Battery', () => {
  it('enforces Quarantine & Clean Invariant: demo activities removed and public query returns zero', async () => {
    // 1. Initial demo activities removed
    const allActivities = await getSocialActivities(undefined, true);
    assert.strictEqual(allActivities.length, 0, 'Initial demo activities must be removed');

    // 2. Public query strictly returns ZERO activities
    const publicActivities = await getSocialActivities(undefined, false);
    assert.strictEqual(publicActivities.length, 0, 'Public activities must return 0 by default');
  });

  it('enforces Multi-Stage Workflow Gate: Draft -> Treasurer Review -> President Approval -> Published', async () => {
    // 1. Create a draft activity
    const draft = await saveSocialActivity({
      id: 'act-test-workflow',
      titleNe: 'परीक्षण स्वास्थ्य शिविर',
      titleEn: 'Test Health Camp',
      date: '२०८२-०५-१०',
      locationNe: 'मादी–१',
      locationEn: 'Madi-1',
      category: 'HEALTH',
      descriptionNe: 'परीक्षण विवरण',
      descriptionEn: 'Test description',
      status: 'DRAFT',
      workflowStage: 'DRAFT',
      photos: [],
      evidenceChecklist: {
        hasAttendanceSheet: false,
        hasEventPhotos: false,
        hasReceiptsVouchers: false,
        hasActivityReport: false,
        hasExecutiveCommitteeApproval: false,
      },
    });

    assert.strictEqual(draft.workflowStage, 'DRAFT');

    // 2. Cannot skip straight to President Approval without Treasurer Review
    const invalidSkip = await advanceActivityWorkflow('act-test-workflow', 'PRESIDENT_APPROVAL', 'President Name');
    assert.strictEqual(invalidSkip.success, false, 'Cannot skip Treasurer review');

    // 3. Step 1: Advance to Treasurer Review
    const treasurerStep = await advanceActivityWorkflow('act-test-workflow', 'TREASURER_REVIEW', 'CA. Manish Karki', 'Accounts verified');
    assert.strictEqual(treasurerStep.success, true);
    assert.strictEqual(treasurerStep.data?.workflowStage, 'TREASURER_REVIEW');
    assert.strictEqual(treasurerStep.data?.reviewedByTreasurerName, 'CA. Manish Karki');

    // 4. Step 2: Advance to President Approval
    const presidentStep = await advanceActivityWorkflow('act-test-workflow', 'PRESIDENT_APPROVAL', 'Dambar Bahadur Shrestha', 'Executive committee approved');
    assert.strictEqual(presidentStep.success, true);
    assert.strictEqual(presidentStep.data?.workflowStage, 'PRESIDENT_APPROVAL');
    assert.strictEqual(presidentStep.data?.approvedByPresidentName, 'Dambar Bahadur Shrestha');

    // 5. Cannot PUBLISH yet because evidence checklist is incomplete!
    const publishAttemptFails = await advanceActivityWorkflow('act-test-workflow', 'PUBLISHED', 'Super Admin');
    assert.strictEqual(publishAttemptFails.success, false, 'Publication must fail if evidence checklist is incomplete');

    // 6. Complete all 5 evidence checklist items
    await saveSocialActivity({
      id: 'act-test-workflow',
      titleNe: 'परीक्षण स्वास्थ्य शिविर',
      evidenceChecklist: {
        hasAttendanceSheet: true,
        attendanceSheetRef: 'ATTEND-P01-45',
        hasEventPhotos: true,
        eventPhotosRef: 'PHOTO-BOX-2082',
        hasReceiptsVouchers: true,
        receiptsVouchersRef: 'VOUCH-8923',
        hasActivityReport: true,
        activityReportRef: 'REP-CAMP-FINAL.pdf',
        hasExecutiveCommitteeApproval: true,
        approvalMinuteRef: 'MIN-MEETING-14',
      },
      hasBeneficiaryRecord: true,
      beneficiaryRecordRef: 'REG-OFFICIAL-2082',
      participantCount: 150,
      photoConsentVerified: true,
      photos: ['/media/incoming/Chauki.jpg'],
      relatedDocumentUrl: '/documents/reports/camp.pdf',
      relatedDocumentApproved: true,
      reviewedByTreasurerName: 'CA. Manish Karki',
      approvedByPresidentName: 'Dambar Bahadur Shrestha',
    });

    // 7. Now publication succeeds!
    const publishSuccess = await advanceActivityWorkflow('act-test-workflow', 'PUBLISHED', 'Super Admin', 'All checks passed');
    assert.strictEqual(publishSuccess.success, true);
    assert.strictEqual(publishSuccess.data?.workflowStage, 'PUBLISHED');
    assert.strictEqual(publishSuccess.data?.status, 'PUBLISHED');

    // 8. Public query now returns the published activity
    const publicList = await getSocialActivities(undefined, false);
    assert.strictEqual(publicList.length, 1);
    const pub = publicList[0];
    assert.strictEqual(pub.id, 'act-test-workflow');
    assert.strictEqual(pub.participantCount, 150, 'Verified participant count exposed');
    assert.strictEqual(pub.photos.length, 1, 'Consented photo exposed');
    assert.strictEqual(pub.relatedDocumentUrl, '/documents/reports/camp.pdf', 'Approved document exposed');
    assert.strictEqual((pub as any).adminNotes, undefined, 'Admin notes strictly stripped');

    // Clean up
    await deleteSocialActivity('act-test-workflow');
    const cleaned = await getSocialActivities(undefined, false);
    assert.strictEqual(cleaned.length, 0);
  });

  it('enforces Unverified Statistics and Photo Consent suppression rules', async () => {
    // Create activity without verified beneficiary record and without photo consent
    await saveSocialActivity({
      id: 'act-test-suppress',
      titleNe: 'रक्तदान कार्यक्रम',
      titleEn: 'Blood Donation Drive',
      date: '२०८२-०६-०१',
      locationNe: 'काठमाडौं',
      locationEn: 'Kathmandu',
      category: 'COMMUNITY',
      descriptionNe: 'विवरण',
      descriptionEn: 'Description',
      status: 'PUBLISHED',
      workflowStage: 'PUBLISHED',
      participantCount: 500, // Unverified claim
      hasBeneficiaryRecord: false, // NO official record
      photos: ['/media/incoming/Chauki.jpg'],
      photoConsentVerified: false, // NO photo consent
      relatedDocumentUrl: '/documents/draft.pdf',
      relatedDocumentApproved: false, // NOT approved
      reviewedByTreasurerName: 'Treasurer',
      approvedByPresidentName: 'President',
      evidenceChecklist: {
        hasAttendanceSheet: true,
        attendanceSheetRef: 'ATTEND-BLOOD-01',
        hasEventPhotos: true,
        eventPhotosRef: 'PHOTO-BLOOD-01',
        hasReceiptsVouchers: true,
        receiptsVouchersRef: 'VOUCH-BLOOD-01',
        hasActivityReport: true,
        activityReportRef: 'REPORT-BLOOD-01',
        hasExecutiveCommitteeApproval: true,
        approvalMinuteRef: 'MIN-BLOOD-01',
      },
    });

    // In public query: unverified count, unconsented photos, and unapproved docs must be suppressed!
    const pubList = await getSocialActivities(undefined, false);
    assert.strictEqual(pubList.length, 1);
    const pub = pubList[0];
    assert.strictEqual(pub.participantCount, undefined, 'Unverified participant count must be suppressed');
    assert.strictEqual(pub.photos.length, 0, 'Unconsented photos must be suppressed');
    assert.strictEqual(pub.relatedDocumentUrl, undefined, 'Unapproved document must be suppressed');

    // Clean up
    await deleteSocialActivity('act-test-suppress');
  });

  it('enforces Zero-Expense Governance: publication blocked if vouchers simply unchecked without declaration', async () => {
    // 1. Create activity where receipts/vouchers is simply unchecked and noExpenseIncurred is false
    const act = await saveSocialActivity({
      id: 'act-test-zero-gate-fail',
      titleNe: 'स्वयंसेवक भेला',
      titleEn: 'Volunteer Gathering',
      date: '२०८२-०६-०५',
      status: 'DRAFT',
      workflowStage: 'DRAFT',
      evidenceChecklist: {
        hasAttendanceSheet: true,
        attendanceSheetRef: 'ATTEND-001',
        hasEventPhotos: true,
        eventPhotosRef: 'PHOTOS-001',
        hasReceiptsVouchers: false, // Simply unchecked!
        receiptsVouchersRef: '',
        noExpenseIncurred: false, // No zero-expense declaration
        hasActivityReport: true,
        activityReportRef: 'REPORT-001',
        hasExecutiveCommitteeApproval: true,
        approvalMinuteRef: 'MIN-001',
      },
    });

    // Advance to Treasurer Review
    await advanceActivityWorkflow('act-test-zero-gate-fail', 'TREASURER_REVIEW', 'Treasurer Officer');
    // Advance to President Approval
    await advanceActivityWorkflow('act-test-zero-gate-fail', 'PRESIDENT_APPROVAL', 'President Officer');

    // Attempt publication -> Must FAIL because vouchers are simply unchecked
    const pubRes = await advanceActivityWorkflow('act-test-zero-gate-fail', 'PUBLISHED', 'Super Admin');
    assert.strictEqual(pubRes.success, false, 'Publication must be rejected when vouchers unchecked without zero-expense declaration');
    assert.ok(pubRes.error?.includes('लेखा प्रमाण अपुग') || pubRes.error?.includes('शून्य खर्च'), 'Error message must cite missing accounting evidence');

    await deleteSocialActivity('act-test-zero-gate-fail');
  });

  it('enforces Zero-Expense Governance: blocked if zero-expense declared but Treasurer review is pending', async () => {
    // 1. Create activity with noExpenseIncurred = true, but treasurer review pending
    const act = await saveSocialActivity({
      id: 'act-test-zero-unreviewed',
      titleNe: 'मादी भर्चुअल अन्तरक्रिया',
      titleEn: 'Madi Virtual Interaction',
      date: '२०८२-०६-१०',
      status: 'DRAFT',
      workflowStage: 'DRAFT',
      evidenceChecklist: {
        hasAttendanceSheet: true,
        attendanceSheetRef: 'ATTEND-V01',
        hasEventPhotos: true,
        eventPhotosRef: 'PHOTO-V01',
        hasReceiptsVouchers: false,
        noExpenseIncurred: true,
        zeroExpenseDeclaration: {
          declared: true,
          declaredByAdminName: 'Program Coordinator',
          declaredAt: '2026-06-10T10:00:00Z',
          treasurerReviewed: false, // NOT yet reviewed by treasurer!
        },
        hasActivityReport: true,
        activityReportRef: 'REPORT-V01',
        hasExecutiveCommitteeApproval: true,
        approvalMinuteRef: 'MIN-V01',
      },
    });

    assert.strictEqual(act.evidenceChecklist.receiptsVouchersRef, 'Not applicable — zero expense');

    // Try direct save with PUBLISHED status -> Must remain DRAFT
    const directPublish = await saveSocialActivity({
      id: 'act-test-zero-unreviewed',
      titleNe: 'मादी भर्चुअल अन्तरक्रिया',
      status: 'PUBLISHED',
      workflowStage: 'PUBLISHED',
    });
    assert.strictEqual(directPublish.status, 'DRAFT', 'Direct publish must be downgraded to DRAFT without treasurer review');

    await deleteSocialActivity('act-test-zero-unreviewed');
  });

  it('enforces Zero-Expense Governance: succeeds when declared, reviewed by Treasurer, approved by President, and strips private audit in public API', async () => {
    // 1. Create activity with noExpenseIncurred = true
    const act = await saveSocialActivity({
      id: 'act-test-zero-success',
      slug: 'madi-online-interaction-2082',
      titleNe: 'मादी अनलाइन परामर्श कार्यक्रम',
      titleEn: 'Madi Online Consultation Program',
      date: '२०८२-०६-१५',
      locationNe: 'जुम (भर्चुअल)',
      locationEn: 'Zoom (Virtual)',
      category: 'COMMUNITY',
      descriptionNe: 'संखुवासभा मादीका विद्यार्थीहरूसँग अनलाइन शैक्षिक परामर्श।',
      descriptionEn: 'Online educational consultation with students of Madi.',
      status: 'DRAFT',
      workflowStage: 'DRAFT',
      participantCount: 75,
      hasBeneficiaryRecord: true,
      beneficiaryRecordRef: 'ZOOM-LOG-2082-06',
      photos: ['/media/incoming/Chauki.jpg'],
      photoConsentVerified: true,
      evidenceChecklist: {
        hasAttendanceSheet: true,
        attendanceSheetRef: 'ZOOM-ATTEND-LOG',
        hasEventPhotos: true,
        eventPhotosRef: 'SCREENSHOT-ARCHIVE',
        hasReceiptsVouchers: false,
        noExpenseIncurred: true,
        zeroExpenseDeclaration: {
          declared: true,
          declaredByAdminName: 'Admin Officer Bimal',
          declaredAt: '2026-06-15T09:00:00Z',
          treasurerReviewed: false,
        },
        hasActivityReport: true,
        activityReportRef: 'REP-ONLINE-CONSULT.pdf',
        hasExecutiveCommitteeApproval: true,
        approvalMinuteRef: 'MIN-MEETING-16',
      },
    });

    assert.strictEqual(act.evidenceChecklist.receiptsVouchersRef, 'Not applicable — zero expense');

    // 2. Step 1: Advance to Treasurer Review
    // Treasurer records and confirms zero expense declaration
    const treasurerRes = await advanceActivityWorkflow(
      'act-test-zero-success',
      'TREASURER_REVIEW',
      'CA. Manish Karki',
      'Verified: No institutional expenditure incurred for virtual session.'
    );
    assert.strictEqual(treasurerRes.success, true);
    assert.strictEqual(treasurerRes.data?.evidenceChecklist.zeroExpenseDeclaration?.treasurerReviewed, true);
    assert.strictEqual(treasurerRes.data?.evidenceChecklist.zeroExpenseDeclaration?.treasurerReviewedBy, 'CA. Manish Karki');
    assert.ok(treasurerRes.data?.evidenceChecklist.zeroExpenseDeclaration?.treasurerReviewedAt);

    // 3. Step 2: President Approval
    const presidentRes = await advanceActivityWorkflow(
      'act-test-zero-success',
      'PRESIDENT_APPROVAL',
      'Dambar Bahadur Shrestha',
      'Executive committee approves zero-expense publication.'
    );
    assert.strictEqual(presidentRes.success, true);

    // 4. Step 3: Advance to PUBLISHED
    const pubRes = await advanceActivityWorkflow('act-test-zero-success', 'PUBLISHED', 'Super Admin');
    assert.strictEqual(pubRes.success, true, 'Publication must succeed with verified zero-expense declaration');
    assert.strictEqual(pubRes.data?.status, 'PUBLISHED');
    assert.strictEqual(pubRes.data?.workflowStage, 'PUBLISHED');

    // 5. Verify Public API Stripping (Requirement 5)
    const publicList = await getSocialActivities(undefined, false);
    assert.strictEqual(publicList.length, 1);
    const pub = publicList[0];
    assert.strictEqual(pub.id, 'act-test-zero-success');
    assert.strictEqual(pub.titleNe, 'मादी अनलाइन परामर्श कार्यक्रम');

    // Private declarations and reviewer details MUST BE STRIPPED
    assert.strictEqual(pub.reviewedByTreasurerName, undefined, 'Treasurer name must be stripped from public response');
    assert.strictEqual(pub.reviewedByTreasurerAt, undefined, 'Treasurer timestamp must be stripped from public response');
    assert.strictEqual(pub.approvedByPresidentName, undefined, 'President name must be stripped from public response');
    assert.strictEqual(pub.approvedByPresidentAt, undefined, 'President timestamp must be stripped from public response');
    assert.strictEqual((pub as any).adminNotes, undefined, 'Admin notes must be stripped from public response');
    assert.strictEqual(pub.evidenceChecklist.zeroExpenseDeclaration, undefined, 'Zero expense declaration must be stripped from public response');
    assert.strictEqual(pub.evidenceChecklist.receiptsVouchersRef, undefined, 'Voucher reference must be stripped from public response');

    // Also verify getSocialActivityBySlug
    const pubBySlug = await getSocialActivityBySlug('madi-online-interaction-2082', false);
    assert.ok(pubBySlug);
    assert.strictEqual(pubBySlug.reviewedByTreasurerName, undefined);
    assert.strictEqual(pubBySlug.evidenceChecklist.zeroExpenseDeclaration, undefined);

    // Clean up
    await deleteSocialActivity('act-test-zero-success');
    const cleanedList = await getSocialActivities(undefined, false);
    assert.strictEqual(cleanedList.length, 0, 'Zero activities publicly visible after cleanup');
  });
});

