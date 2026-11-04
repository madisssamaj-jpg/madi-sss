import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getEvidenceTrackerRecords,
  getEvidenceTrackerRecordById,
  getCommitteeEvidenceTracker,
  getActivityEvidenceTracker,
  getSchoolSupportEvidenceTracker,
  getReliefMedicalAssistanceEvidenceTracker,
  getDocumentEvidenceTracker,
  getFinancialEvidenceTracker,
  getRealContentCollectionTrackers,
  saveEvidenceTrackerRecord,
  updateEvidenceTrackerItemStatus,
  deleteEvidenceTrackerRecord,
  sanitizeEvidenceTrackerRecordForPublic,
  getCommitteeMembers,
  getSocialActivities,
  getReliefPrograms,
  getPublicDocuments,
  getFinancialTransparencyRecords,
  saveSocialActivity,
  saveEducationInfrastructureSupportRecord,
  getEducationInfrastructureSupportRecords,
  type EvidenceTrackerRecord,
  type EvidenceCollectionStatus,
  type EvidenceApprovalStatus,
} from '../../lib/cms/cms-service.ts';

describe('Internal Real-Content Collection Tracker Governance Battery', () => {
  it('enforces Four Content Trackers Availability and Internal Invariant (isPublic: false)', async () => {
    // 1. Retrieve all tracker items internally
    const allRecords = await getEvidenceTrackerRecords(undefined, undefined, true);
    assert.ok(allRecords.length >= 25, 'Must contain pre-seeded evidence tracking items across all domains');

    // 2. Verify all items are strictly private by default
    for (const rec of allRecords) {
      assert.strictEqual(rec.isPublic, false, `Tracker record ${rec.id} must have isPublic: false`);
      assert.ok(
        [
          'COMMITTEE',
          'ACTIVITY',
          'SCHOOL_SUPPORT',
          'RELIEF_MEDICAL_ASSISTANCE',
          'DOCUMENT',
          'FINANCIAL',
          'EDUCATION_INFRASTRUCTURE_SUPPORT',
        ].includes(rec.category),
        `Record ${rec.id} has valid category: ${rec.category}`
      );
    }

    // 3. Verify the Four Core Content Trackers requested by organization:
    // Tracker 1: Committee Evidence
    const comTracker = await getCommitteeEvidenceTracker(true);
    assert.ok(comTracker.length >= 4, 'Committee tracker must have at least 4 items');
    assert.ok(comTracker.every((i) => i.category === 'COMMITTEE'));

    // Tracker 2: Activity Evidence
    const actTracker = await getActivityEvidenceTracker(true);
    assert.ok(actTracker.length >= 4, 'Activity tracker must have at least 4 items');
    assert.ok(actTracker.every((i) => i.category === 'ACTIVITY'));

    // Tracker 3: School Support Evidence
    const schTracker = await getSchoolSupportEvidenceTracker(true);
    assert.ok(schTracker.length >= 5, 'School support tracker must have at least 5 items');
    assert.ok(schTracker.every((i) => i.category === 'SCHOOL_SUPPORT'));

    // Tracker 4: Relief / Medical Assistance Evidence
    const relTracker = await getReliefMedicalAssistanceEvidenceTracker(true);
    assert.ok(relTracker.length >= 5, 'Relief/medical assistance tracker must have at least 5 items');
    assert.ok(relTracker.every((i) => i.category === 'RELIEF_MEDICAL_ASSISTANCE'));

    // 4. Verify combined Real-Content Overview
    const combined = await getRealContentCollectionTrackers(true);
    assert.strictEqual(combined.committee.length, comTracker.length);
    assert.strictEqual(combined.activity.length, actTracker.length);
    assert.strictEqual(combined.schoolSupport.length, schTracker.length);
    assert.strictEqual(combined.reliefMedicalAssistance.length, relTracker.length);
    assert.ok(combined.stats.totalItems >= 18, 'Combined core items must be at least 18');
  });

  it('enforces Public API Exclusion: private tracker records are strictly excluded from public queries', async () => {
    // 1. getEvidenceTrackerRecords with includePrivate = false returns ZERO items
    const publicAll = await getEvidenceTrackerRecords(undefined, undefined, false);
    assert.strictEqual(publicAll.length, 0, 'Public query must return 0 evidence tracker items');

    // 2. Specific trackers with includePrivate = false return ZERO items
    const pubCom = await getCommitteeEvidenceTracker(false);
    assert.strictEqual(pubCom.length, 0);

    const pubAct = await getActivityEvidenceTracker(false);
    assert.strictEqual(pubAct.length, 0);

    const pubSch = await getSchoolSupportEvidenceTracker(false);
    assert.strictEqual(pubSch.length, 0);

    const pubRel = await getReliefMedicalAssistanceEvidenceTracker(false);
    assert.strictEqual(pubRel.length, 0);

    const pubDoc = await getDocumentEvidenceTracker(false);
    assert.strictEqual(pubDoc.length, 0);

    const pubFin = await getFinancialEvidenceTracker(false);
    assert.strictEqual(pubFin.length, 0);

    // 3. getEvidenceTrackerRecordById with includePrivate = false strictly returns null
    const pubItem = await getEvidenceTrackerRecordById('ev-com-01', false);
    assert.strictEqual(pubItem, null, 'Public getById must return null for private tracker items');

    // 4. Combined real-content tracker with includePrivate = false returns ZERO
    const pubCombined = await getRealContentCollectionTrackers(false);
    assert.strictEqual(pubCombined.committee.length, 0);
    assert.strictEqual(pubCombined.activity.length, 0);
    assert.strictEqual(pubCombined.schoolSupport.length, 0);
    assert.strictEqual(pubCombined.reliefMedicalAssistance.length, 0);
    assert.strictEqual(pubCombined.stats.totalItems, 0);
  });

  it('enforces Admin Evidence Recording: supports all 7 required governance fields across all 4 trackers', async () => {
    const statuses: EvidenceCollectionStatus[] = ['NOT_COLLECTED', 'COLLECTED', 'VERIFIED', 'REJECTED'];
    const approvalStatuses: EvidenceApprovalStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

    // Test saving and updating across the 4 trackers:
    const trackersToTest = [
      { id: 'ev-test-com', category: 'COMMITTEE' as const, key: 'TEST_MINUTES', title: 'Test Committee Minute' },
      { id: 'ev-test-act', category: 'ACTIVITY' as const, key: 'TEST_ATTENDANCE', title: 'Test Activity Attendance' },
      { id: 'ev-test-sch', category: 'SCHOOL_SUPPORT' as const, key: 'TEST_SCHOOL_VOUCHER', title: 'Test School Voucher' },
      { id: 'ev-test-rel', category: 'RELIEF_MEDICAL_ASSISTANCE' as const, key: 'TEST_MEDICAL_AID', title: 'Test Medical Aid' },
    ];

    for (const testItem of trackersToTest) {
      // 1. Allow admins to create with Not collected status
      const created = await saveEvidenceTrackerRecord({
        id: testItem.id,
        category: testItem.category,
        itemKey: testItem.key,
        titleNe: `${testItem.title} (नेपाली)`,
        titleEn: testItem.title,
        collectionStatus: 'NOT_COLLECTED',
        approvalStatus: 'PENDING',
        privateNotes: 'Initial private note for admin tracking.',
      });

      assert.strictEqual(created.success, true);
      assert.strictEqual(created.data?.collectionStatus, 'NOT_COLLECTED');
      assert.strictEqual(created.data?.isPublic, false, 'Must be private by default');

      // 2. Allow admins to record all 7 fields:
      // - Collection status: Not collected / Collected / Verified / Rejected
      // - Document reference or local file path
      // - Collected by
      // - Verified by
      // - Verification date
      // - Approval status: Pending / Approved / Rejected
      // - Private notes
      const updated = await updateEvidenceTrackerItemStatus(testItem.id, {
        collectionStatus: 'VERIFIED',
        documentRefOrPath: `internal-docs/archive/${testItem.key.toLowerCase()}.pdf`,
        collectedBy: 'General Secretary Shrestha',
        verifiedBy: 'President Sharma',
        verificationDate: '२०८२-०४-२५ BS',
        approvalStatus: 'APPROVED',
        approvedBy: 'Executive Committee',
        approvedAt: '2026-11-04T12:00:00Z',
        privateNotes: 'Official signed document inspected and verified by executive committee.',
      });

      assert.strictEqual(updated.success, true);
      assert.strictEqual(updated.data?.collectionStatus, 'VERIFIED');
      assert.strictEqual(updated.data?.documentRefOrPath, `internal-docs/archive/${testItem.key.toLowerCase()}.pdf`);
      assert.strictEqual(updated.data?.collectedBy, 'General Secretary Shrestha');
      assert.strictEqual(updated.data?.verifiedBy, 'President Sharma');
      assert.strictEqual(updated.data?.verificationDate, '२०८२-०४-२५ BS');
      assert.strictEqual(updated.data?.approvalStatus, 'APPROVED');
      assert.strictEqual(updated.data?.privateNotes, 'Official signed document inspected and verified by executive committee.');
      assert.strictEqual(updated.data?.isPublic, false, 'Must remain strictly private after update');

      // 3. Test Rejected status recording as well
      const rejected = await updateEvidenceTrackerItemStatus(testItem.id, {
        collectionStatus: 'REJECTED',
        approvalStatus: 'REJECTED',
        privateNotes: 'Rejected due to missing executive signature.',
      });
      assert.strictEqual(rejected.success, true);
      assert.strictEqual(rejected.data?.collectionStatus, 'REJECTED');
      assert.strictEqual(rejected.data?.approvalStatus, 'REJECTED');

      // 4. Ensure sanitized public view strips all internal paths, verifiers, and notes
      const sanitized = sanitizeEvidenceTrackerRecordForPublic(updated.data!);
      assert.strictEqual(sanitized.id, testItem.id);
      assert.strictEqual(sanitized.category, testItem.category);
      assert.strictEqual(sanitized.isPublic, false);
      assert.strictEqual((sanitized as any).documentRefOrPath, undefined, 'Must not expose document reference');
      assert.strictEqual((sanitized as any).collectedBy, undefined, 'Must not expose collectedBy');
      assert.strictEqual((sanitized as any).verifiedBy, undefined, 'Must not expose verifiedBy');
      assert.strictEqual((sanitized as any).verificationDate, undefined, 'Must not expose verificationDate');
      assert.strictEqual((sanitized as any).privateNotes, undefined, 'Must not expose privateNotes');

      // 5. Clean up test record
      await deleteEvidenceTrackerRecord(testItem.id);
      const afterDelete = await getEvidenceTrackerRecordById(testItem.id, true);
      assert.strictEqual(afterDelete, null);
    }
  });

  it('enforces No Auto-Publish Invariant: tracking changes do NOT mutate or auto-publish CMS content', async () => {
    // 1. Perform tracker updates setting items to VERIFIED and APPROVED across all domains
    await updateEvidenceTrackerItemStatus('ev-com-01', {
      collectionStatus: 'VERIFIED',
      approvalStatus: 'APPROVED',
      verifiedBy: 'Secretariat Admin',
      verificationDate: '२०८२-०४-२५',
      privateNotes: 'Election minutes verified.',
    });

    await updateEvidenceTrackerItemStatus('ev-act-02', {
      collectionStatus: 'VERIFIED',
      approvalStatus: 'APPROVED',
      verifiedBy: 'Media Coordinator',
      verificationDate: '२०८२-०४-२५',
    });

    await updateEvidenceTrackerItemStatus('ev-sch-02', {
      collectionStatus: 'VERIFIED',
      approvalStatus: 'APPROVED',
      verifiedBy: 'General Secretary',
      verificationDate: '२०८२-०४-२५',
      privateNotes: 'School support allocation minute verified.',
    });

    await updateEvidenceTrackerItemStatus('ev-rel-01', {
      collectionStatus: 'VERIFIED',
      approvalStatus: 'APPROVED',
      verifiedBy: 'Relief Coordinator',
      verificationDate: '२०८२-०४-२५',
      privateNotes: 'COVID-19 relief student roster verified.',
    });

    // 2. CRITICAL INVARIANT: Zero CMS content auto-published
    // Committee members remain in DRAFT (0 published)
    const pubMembers = await getCommitteeMembers(undefined, false);
    assert.strictEqual(pubMembers.length, 0, 'No committee members should be auto-published by tracker updates');

    // Activities remain in DRAFT (0 published)
    const pubActivities = await getSocialActivities(undefined, false);
    assert.strictEqual(pubActivities.length, 0, 'No activities should be auto-published by tracker updates');

    // Relief programs remain in DRAFT (0 published)
    const pubRelief = await getReliefPrograms(undefined, false);
    assert.strictEqual(pubRelief.length, 0, 'No relief programs should be auto-published by tracker updates');

    // School support records remain in DRAFT (0 published)
    const pubSchoolSupport = await getEducationInfrastructureSupportRecords(false);
    assert.strictEqual(pubSchoolSupport.length, 0, 'No school support records should be auto-published by tracker updates');

    // Documents remain in DRAFT / INTERNAL_ONLY (0 published)
    const pubDocs = await getPublicDocuments(undefined, undefined, false);
    assert.strictEqual(pubDocs.length, 0, 'No documents should be auto-published by tracker updates');

    // Financial records remain in DRAFT / INTERNAL_ONLY (0 published)
    const pubFinRecords = await getFinancialTransparencyRecords(undefined, undefined, false);
    assert.strictEqual(pubFinRecords.length, 0, 'No financial records should be auto-published by tracker updates');

    // Revert tracker status back to NOT_COLLECTED / PENDING
    await updateEvidenceTrackerItemStatus('ev-com-01', {
      collectionStatus: 'COLLECTED',
      approvalStatus: 'PENDING',
    });
    await updateEvidenceTrackerItemStatus('ev-act-02', {
      collectionStatus: 'COLLECTED',
      approvalStatus: 'PENDING',
    });
    await updateEvidenceTrackerItemStatus('ev-sch-02', {
      collectionStatus: 'COLLECTED',
      approvalStatus: 'PENDING',
    });
    await updateEvidenceTrackerItemStatus('ev-rel-01', {
      collectionStatus: 'COLLECTED',
      approvalStatus: 'PENDING',
    });
  });

  it('enforces Publication Gates: publication remains blocked unless evidence, consent, review, and approval pass', async () => {
    // 1. Social Activity publication gate:
    // Attempting to publish without vouchers, attendance, or executive committee approval is forced back to DRAFT
    const unapprovedActivity = await saveSocialActivity({
      titleNe: 'अधुरो प्रमाण कार्यक्रम',
      status: 'PUBLISHED',
      workflowStage: 'PUBLISHED',
      evidenceChecklist: {
        hasAttendanceSheet: false,
        hasEventPhotos: true,
        hasReceiptsVouchers: false,
        noExpenseIncurred: false,
        hasActivityReport: false,
        hasExecutiveCommitteeApproval: false,
      },
    });

    assert.strictEqual(unapprovedActivity.status, 'DRAFT', 'Incomplete evidence must force activity status to DRAFT');
    assert.notStrictEqual(unapprovedActivity.workflowStage, 'PUBLISHED', 'Workflow stage must not be PUBLISHED');

    // 2. School Support publication gate:
    // Attempting to save without mandatory fields is rejected
    const invalidSchoolSupport = await saveEducationInfrastructureSupportRecord({
      schoolNameNe: '',
      schoolNameEn: '',
      supportPurposeNe: 'पुस्तकालय सुधार',
      supportPurposeEn: 'Library improvement',
      amountNpr: 100000,
      voucherReceiptRef: 'internal-docs/vouchers/vouch-01.pdf',
      approvalMinuteRef: 'internal-docs/minutes/min-01.pdf',
      publicSafeSummaryNe: 'संक्षिप्त विवरण',
      publicSafeSummaryEn: 'Summary',
      fiscalYear: '2081-82',
      status: 'DRAFT',
      isPublic: false,
    });
    assert.strictEqual(invalidSchoolSupport.success, false, 'Missing mandatory school name must be rejected');

    // 3. Valid School Support record is created in DRAFT and strictly excluded from public queries
    const validSchoolSupport = await saveEducationInfrastructureSupportRecord({
      schoolNameNe: 'श्री सरस्वती माध्यमिक विद्यालय',
      schoolNameEn: 'Shree Saraswati Secondary School',
      supportPurposeNe: 'शैक्षिक पूर्वाधार तथा विद्यालय सुधार सहयोग',
      supportPurposeEn: 'Educational Infrastructure & School Improvement Support',
      amountNpr: 150000,
      voucherReceiptRef: 'internal-docs/vouchers/vouch-sch-01.pdf',
      approvalMinuteRef: 'internal-docs/minutes/min-sch-01.pdf',
      publicSafeSummaryNe: 'मादी नगरपालिका स्थित विद्यालयमा शैक्षिक पूर्वाधार सुधारका लागि कोष सहयोग गरिएको।',
      publicSafeSummaryEn: 'Fund support provided for educational infrastructure improvement in Madi Municipality.',
      fiscalYear: '2081-82',
      status: 'DRAFT',
      isPublic: false,
    });
    assert.strictEqual(validSchoolSupport.success, true);
    assert.strictEqual(validSchoolSupport.data?.isPublic, false);
    assert.strictEqual(validSchoolSupport.data?.status, 'DRAFT');

    // Check public query still returns ZERO
    const pubList = await getEducationInfrastructureSupportRecords(false);
    assert.strictEqual(pubList.length, 0, 'Public query must never expose school support records');
  });
});
