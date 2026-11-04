import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMediaConsentRecords,
  getMediaConsentRecordById,
  saveMediaConsentRecord,
  approveMediaConsentPublication,
  deleteMediaConsentRecord,
  type MediaConsentRecord,
} from '../../lib/cms/cms-service.ts';

describe('Media Consent & Publication Tracker Governance Battery', () => {
  it('enforces Quarantine Invariant: all initial media records remain in INTERNAL_ONLY, PENDING_REVIEW, or DRAFT', async () => {
    // 1. Admin query sees all initial tracker records
    const adminRecords = await getMediaConsentRecords(undefined, undefined, true);
    assert.strictEqual(adminRecords.length, 5, 'Must contain initial 5 pre-seeded media records');

    for (const rec of adminRecords) {
      assert.ok(
        ['INTERNAL_ONLY', 'PENDING_REVIEW', 'DRAFT'].includes(rec.status),
        `Record ${rec.id} status must be quarantined (INTERNAL_ONLY, PENDING_REVIEW, or DRAFT), found: ${rec.status}`
      );
      assert.strictEqual(rec.isPublic, false, `Record ${rec.id} must have isPublic: false`);
    }

    // 2. Public query strictly returns ZERO media records
    const publicRecords = await getMediaConsentRecords(undefined, undefined, false);
    assert.strictEqual(publicRecords.length, 0, 'Public query must return 0 records while all are quarantined');

    // 3. Public getById strictly returns null
    const pubItem = await getMediaConsentRecordById('mct-001', false);
    assert.strictEqual(pubItem, null, 'Public query for quarantined item must return null');
  });

  it('enforces Sensitive Defaults: sensitive media types default to INTERNAL_ONLY and reject direct unauthorized publishing', async () => {
    // 1. Create patient identification without explicit status
    const patientItem = await saveMediaConsentRecord({
      id: 'mct-test-patient',
      titleNe: 'बिरामी स्वास्थ्य परीक्षण',
      titleEn: 'Patient Health Check',
      fileUrl: '/media/internal/patient-screening.jpg',
      mediaType: 'patient_identification',
      hasWrittenConsent: false,
      consentScope: 'internal_use',
      redactionRequirement: 'Patient face and diagnostic record must be masked',
    });

    assert.strictEqual(
      patientItem.status,
      'INTERNAL_ONLY',
      'Sensitive media without status must default to INTERNAL_ONLY'
    );
    assert.strictEqual(patientItem.isPublic, false);

    // 2. Attempt to directly save with APPROVED_PUBLIC without written consent or approver
    const directPublishAttempt = await saveMediaConsentRecord({
      id: 'mct-test-patient',
      mediaType: 'patient_identification',
      titleNe: 'बिरामी स्वास्थ्य परीक्षण',
      status: 'APPROVED_PUBLIC',
    });

    assert.strictEqual(
      directPublishAttempt.status,
      'INTERNAL_ONLY',
      'Direct publish attempt without consent and approver must be forced to INTERNAL_ONLY'
    );
    assert.strictEqual(directPublishAttempt.isPublic, false);

    await deleteMediaConsentRecord('mct-test-patient');
  });

  it('enforces Written Consent Gate: publication rejected if written consent is missing', async () => {
    // 1. Create ward correspondence without written consent
    await saveMediaConsentRecord({
      id: 'mct-test-ward',
      titleNe: 'वडा राहत सिफारिस',
      titleEn: 'Ward Relief Recommendation',
      fileUrl: '/media/internal/ward-doc.pdf',
      mediaType: 'ward_correspondence',
      status: 'PENDING_REVIEW',
      hasWrittenConsent: false, // NO written consent
      consentScope: 'internal_use',
      redactionRequirement: 'Redact citizen ID and phone number',
    });

    // 2. Attempt to approve for REDACTED_PUBLIC
    const approveFail = await approveMediaConsentPublication(
      'mct-test-ward',
      'Executive Officer',
      'REDACTED_PUBLIC',
      'Attempting approval'
    );

    assert.strictEqual(approveFail.success, false);
    assert.ok(
      approveFail.error?.includes('लिखित सहमति') || approveFail.error?.includes('Written consent'),
      'Must cite missing written consent'
    );

    // Record remains quarantined
    const itemAfter = await getMediaConsentRecordById('mct-test-ward', true);
    assert.ok(itemAfter);
    assert.notStrictEqual(itemAfter.status, 'REDACTED_PUBLIC');

    await deleteMediaConsentRecord('mct-test-ward');
  });

  it('enforces Patient Identification Special Protection: cannot be approved as APPROVED_PUBLIC (full unredacted public)', async () => {
    // Create patient identification with written consent and full scope
    await saveMediaConsentRecord({
      id: 'mct-test-patient-unredacted',
      titleNe: 'बिरामी अनुहार तस्बिर',
      titleEn: 'Patient Face Photo',
      fileUrl: '/media/internal/patient-raw.jpg',
      mediaType: 'patient_identification',
      status: 'PENDING_REVIEW',
      hasWrittenConsent: true,
      consentDate: '२०८२-०५-०१',
      consentScope: 'full_public_use',
      redactionRequirement: 'Face blur required',
    });

    // Attempting to approve patient_identification as APPROVED_PUBLIC must fail
    const fullPublicFail = await approveMediaConsentPublication(
      'mct-test-patient-unredacted',
      'Dr. Health Coordinator',
      'APPROVED_PUBLIC',
      'Direct full public release'
    );

    assert.strictEqual(fullPublicFail.success, false);
    assert.ok(
      fullPublicFail.error?.includes('patient_identification') || fullPublicFail.error?.includes('बिरामी'),
      'Must reject full public unredacted release of patient identification'
    );

    await deleteMediaConsentRecord('mct-test-patient-unredacted');
  });

  it('enforces Redacted Public Release Workflow & Strips Private Audit from Public API', async () => {
    // 1. Create condolence record with written consent and redacted scope
    await saveMediaConsentRecord({
      id: 'mct-test-condolence',
      titleNe: 'शोक प्रस्ताव पत्र (प्रमाणीकृत)',
      titleEn: 'Official Condolence Letter (Verified)',
      fileUrl: '/media/internal/condolence-raw.pdf',
      mediaType: 'condolence',
      status: 'PENDING_REVIEW',
      hasWrittenConsent: true,
      consentDate: '२०८२-०५-१०',
      consentScope: 'redacted_public_use',
      redactionRequirement: 'Bereaved family signatures and residence addresses obscured.',
      adminNotes: 'Family provided written consent on form RF-2082.',
    });

    // 2. Approve for REDACTED_PUBLIC
    const approveRes = await approveMediaConsentPublication(
      'mct-test-condolence',
      'Dambar Bahadur Shrestha',
      'REDACTED_PUBLIC',
      'Verified with masked signatures.',
      '/media/public/condolence-redacted.pdf'
    );

    assert.strictEqual(approveRes.success, true);
    assert.strictEqual(approveRes.data?.status, 'REDACTED_PUBLIC');
    assert.strictEqual(approveRes.data?.isPublic, true);
    assert.strictEqual(approveRes.data?.redactedFileUrl, '/media/public/condolence-redacted.pdf');

    // 3. Public query: must return item with private fields stripped
    const publicList = await getMediaConsentRecords(undefined, undefined, false);
    assert.strictEqual(publicList.length, 1);
    const pub = publicList[0];
    assert.strictEqual(pub.id, 'mct-test-condolence');
    assert.strictEqual(pub.fileUrl, '/media/public/condolence-redacted.pdf', 'Must expose redacted file url');

    // Private fields MUST BE STRIPPED
    assert.strictEqual(pub.hasWrittenConsent, false, 'hasWrittenConsent must be stripped');
    assert.strictEqual(pub.consentDate, undefined, 'consentDate must be stripped');
    assert.strictEqual(pub.consentScope, 'internal_use', 'consentScope must be sanitized');
    assert.strictEqual(pub.redactionRequirement, '', 'redactionRequirement must be stripped');
    assert.strictEqual(pub.approverName, undefined, 'approverName must be stripped');
    assert.strictEqual(pub.approvalDate, undefined, 'approvalDate must be stripped');
    assert.strictEqual(pub.adminNotes, undefined, 'adminNotes must be stripped');

    // 4. Public getById query
    const pubById = await getMediaConsentRecordById('mct-test-condolence', false);
    assert.ok(pubById);
    assert.strictEqual(pubById.adminNotes, undefined);
    assert.strictEqual(pubById.approverName, undefined);

    // 5. Clean up: Delete test record
    await deleteMediaConsentRecord('mct-test-condolence');
    const cleaned = await getMediaConsentRecords(undefined, undefined, false);
    assert.strictEqual(cleaned.length, 0, 'Zero public records must remain');
  });
});

