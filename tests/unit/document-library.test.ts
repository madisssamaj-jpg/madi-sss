import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getPublicDocuments,
  getPublicDocumentById,
  savePublicDocument,
  advancePublicDocumentStatus,
  deletePublicDocument,
  validateLocalDocumentPath,
  checkLocalDocumentExists,
  type PublicDocument,
  type DocumentLibraryType,
  type DocumentPublicationStatus,
} from '../../lib/cms/cms-service.ts';

describe('Public Document Library Governance Battery', () => {
  it('enforces Draft Quarantine Invariant: all initial documents remain in DRAFT or INTERNAL_ONLY, public API returns 0 items', async () => {
    // 1. Admin query retrieves all 5 pre-seeded governance documents
    const adminDocs = await getPublicDocuments(undefined, undefined, true);
    assert.strictEqual(adminDocs.length, 5, 'Must contain initial 5 pre-seeded governance documents');

    for (const doc of adminDocs) {
      assert.ok(
        doc.status === 'DRAFT' || doc.status === 'INTERNAL_ONLY',
        `Document ${doc.id} must be quarantined in DRAFT or INTERNAL_ONLY, found: ${doc.status}`
      );
      assert.strictEqual(doc.isPublic, false, `Document ${doc.id} must not be marked public`);
      assert.strictEqual(doc.hasSignedStampedPdf, false, `Document ${doc.id} must not have signed stamped PDF flag set by default`);
      assert.strictEqual(doc.isApprovedForPublic, false, `Document ${doc.id} must not be approved for public release by default`);
    }

    // 2. Public query strictly returns ZERO documents
    const publicDocs = await getPublicDocuments(undefined, undefined, false);
    assert.strictEqual(publicDocs.length, 0, 'Public query must return 0 documents while all remain quarantined');

    // 3. Public getById query strictly returns null
    const pubItem = await getPublicDocumentById('doc-audit-2081-82', false);
    assert.strictEqual(pubItem, null, 'Public getById query for quarantined item must return null');
  });

  it('enforces External URL Rejection & Path Traversal Guards', async () => {
    // 1. Remote HTTP/HTTPS schemes rejected
    const httpCheck = validateLocalDocumentPath('https://external-cloud.com/reports/audit.pdf');
    assert.strictEqual(httpCheck.valid, false);
    assert.ok(httpCheck.error?.includes('External URLs'));

    const httpsCheck = validateLocalDocumentPath('http://untrusted.org/doc.pdf');
    assert.strictEqual(httpsCheck.valid, false);

    // 2. Protocol-relative and data URIs rejected
    const protoRelCheck = validateLocalDocumentPath('//cdn.example.com/constitution.pdf');
    assert.strictEqual(protoRelCheck.valid, false);

    const dataUriCheck = validateLocalDocumentPath('data:application/pdf;base64,JVBERi0xLjQK...');
    assert.strictEqual(dataUriCheck.valid, false);

    // 3. Path traversal attacks rejected
    const traversalCheck = validateLocalDocumentPath('/documents/../../etc/passwd');
    assert.strictEqual(traversalCheck.valid, false);
    assert.ok(traversalCheck.error?.includes('Path traversal'));

    const traversalWin = validateLocalDocumentPath('..\\..\\system32\\config');
    assert.strictEqual(traversalWin.valid, false);

    // 4. Paths outside approved local directories (/documents/ or /media/) rejected
    const outsideCheck = validateLocalDocumentPath('/tmp/scratch/document.pdf');
    assert.strictEqual(outsideCheck.valid, false);
    assert.ok(outsideCheck.error?.includes('स्वीकृत स्थानीय निर्देशिका'));

    // 5. Attempting to save via savePublicDocument with external URL fails
    const saveAttempt = await savePublicDocument({
      titleNe: 'बाह्य प्रतिवेदन',
      titleEn: 'External Report',
      documentType: 'AUDIT_REPORT',
      filePath: 'https://cdn.example.org/audit.pdf',
    });
    assert.strictEqual(saveAttempt.success, false);
    assert.ok(saveAttempt.error?.includes('External URLs'));
  });

  it('enforces Missing-File Protection: cannot publish or link non-existent local files', async () => {
    const nonExistentPath = '/documents/phantom-audit-file-never-created-999.pdf';

    // 1. checkLocalDocumentExists detects file does not exist
    const exists = checkLocalDocumentExists(nonExistentPath);
    assert.strictEqual(exists, false, 'Non-existent file path must report false');

    // 2. savePublicDocument rejects setting status to APPROVED_PUBLIC for missing local file
    const pubAttempt = await savePublicDocument({
      id: 'doc-test-missing-file',
      titleNe: 'अस्तित्व नभएको प्रतिवेदन',
      titleEn: 'Non-existent Report',
      documentType: 'AUDIT_REPORT',
      filePath: nonExistentPath,
      hasSignedStampedPdf: true,
      isApprovedForPublic: true,
      status: 'APPROVED_PUBLIC',
      descriptionNe: 'परीक्षण विवरण',
      descriptionEn: 'Test description',
    });
    assert.strictEqual(pubAttempt.success, false);
    assert.ok(pubAttempt.error?.includes('स्थानीय सर्भरमा फेला परेन'), 'Must report missing local file error');

    // 3. Save as DRAFT succeeds
    const draftSave = await savePublicDocument({
      id: 'doc-test-missing-file',
      titleNe: 'अस्तित्व नभएको प्रतिवेदन',
      titleEn: 'Non-existent Report',
      documentType: 'AUDIT_REPORT',
      filePath: nonExistentPath,
      hasSignedStampedPdf: true,
      isApprovedForPublic: true,
      status: 'DRAFT',
      descriptionNe: 'परीक्षण विवरण',
      descriptionEn: 'Test description',
    });
    assert.strictEqual(draftSave.success, true);

    // 4. Advance to APPROVED_PUBLIC fails because physical file is missing
    const advanceAttempt = await advancePublicDocumentStatus(
      'doc-test-missing-file',
      'APPROVED_PUBLIC',
      { adminName: 'President', hasSignedStampedPdf: true, isApprovedForPublic: true }
    );
    assert.strictEqual(advanceAttempt.success, false);
    assert.ok(advanceAttempt.error?.includes('स्थानीय सर्भरमा फेला परेन'));

    // 5. Public queries must never return the missing document
    const pubList = await getPublicDocuments(undefined, undefined, false);
    assert.strictEqual(pubList.length, 0);

    const pubItem = await getPublicDocumentById('doc-test-missing-file', false);
    assert.strictEqual(pubItem, null, 'Public getById must strictly return null for missing files');

    // Cleanup
    await deletePublicDocument('doc-test-missing-file');
  });

  it('enforces Unsigned Draft and Placeholder Rejection', async () => {
    // 1. Placeholder filename rejected
    const placeholderPath = '/documents/draft-placeholder-audit-sample.pdf';
    const placeholderCheck = validateLocalDocumentPath(placeholderPath);
    assert.strictEqual(placeholderCheck.valid, false);
    assert.ok(placeholderCheck.error?.includes('प्रारम्भिक वा प्लेसहोल्डर फाइल'));

    // 2. Rejects publication when hasSignedStampedPdf is false
    const existingFilePath = '/documents/cdo-registration-certificate-redacted.jpeg';
    assert.strictEqual(checkLocalDocumentExists(existingFilePath), true, 'Local sample certificate must exist on disk');

    const unsignedAttempt = await savePublicDocument({
      id: 'doc-test-unsigned',
      titleNe: 'हस्ताक्षर नभएको विधान',
      titleEn: 'Unsigned Constitution',
      documentType: 'CONSTITUTION',
      filePath: existingFilePath,
      hasSignedStampedPdf: false, // NOT signed/stamped
      isApprovedForPublic: true,
      status: 'APPROVED_PUBLIC',
      descriptionNe: 'विधान विवरण',
      descriptionEn: 'Constitution description',
    });
    assert.strictEqual(unsignedAttempt.success, false);
    assert.ok(unsignedAttempt.error?.includes('Signed/Stamped'));

    // 3. Rejects publication when isApprovedForPublic is false
    const unapprovedAttempt = await savePublicDocument({
      id: 'doc-test-unapproved',
      titleNe: 'स्वीकृति नभएको विधान',
      titleEn: 'Unapproved Constitution',
      documentType: 'CONSTITUTION',
      filePath: existingFilePath,
      hasSignedStampedPdf: true,
      isApprovedForPublic: false, // NOT approved
      status: 'APPROVED_PUBLIC',
      descriptionNe: 'विधान विवरण',
      descriptionEn: 'Constitution description',
    });
    assert.strictEqual(unapprovedAttempt.success, false);
    assert.ok(unapprovedAttempt.error?.includes('कार्यसमिति/अध्यक्षको स्वीकृति अनिवार्य छ'));
  });

  it('enforces Multi-Stage Governance Workflow & Public API Sanitization', async () => {
    const existingFilePath = '/documents/cdo-registration-certificate-redacted.jpeg';

    // 1. Create document in DRAFT status
    const createRes = await savePublicDocument({
      id: 'doc-test-governance-flow',
      titleNe: 'प्रमाणित दर्ता प्रमाणपत्र',
      titleEn: 'Verified Registration Certificate',
      documentType: 'REGISTRATION_CERTIFICATE',
      filePath: existingFilePath,
      status: 'DRAFT',
      hasSignedStampedPdf: false,
      isApprovedForPublic: false,
      descriptionNe: 'जि.प्र.का. काठमाडौं दर्ता प्रमाणपत्र प्रतिलिपि।',
      descriptionEn: 'Official copy of DAO Kathmandu registration certificate.',
      publicationDate: '२०८२-०४-२१',
      adminNotes: 'Private Admin Note: Document scanned under resolution #4.',
    });
    assert.strictEqual(createRes.success, true);
    assert.strictEqual(createRes.data?.status, 'DRAFT');

    // Public query still returns 0
    let publicList = await getPublicDocuments(undefined, undefined, false);
    assert.strictEqual(publicList.length, 0);

    // 2. Advance to PENDING_REVIEW by Treasurer/Admin
    const reviewRes = await advancePublicDocumentStatus('doc-test-governance-flow', 'PENDING_REVIEW', {
      adminName: 'Treasurer Bahadur',
      notes: 'Reviewed certificate seal and stamp against physical register.',
    });
    assert.strictEqual(reviewRes.success, true);
    assert.strictEqual(reviewRes.data?.status, 'PENDING_REVIEW');
    assert.strictEqual(reviewRes.data?.reviewedByTreasurerName, 'Treasurer Bahadur');

    // 3. Attempting to advance to APPROVED_PUBLIC with hasSignedStampedPdf = false fails
    const failAdvance = await advancePublicDocumentStatus('doc-test-governance-flow', 'APPROVED_PUBLIC', {
      adminName: 'President Sharma',
      hasSignedStampedPdf: false,
      isApprovedForPublic: true,
    });
    assert.strictEqual(failAdvance.success, false);

    // 4. Advance to APPROVED_PUBLIC with valid signed stamp and executive approval
    const approvedAdvance = await advancePublicDocumentStatus('doc-test-governance-flow', 'APPROVED_PUBLIC', {
      adminName: 'President Sharma',
      hasSignedStampedPdf: true,
      isApprovedForPublic: true,
      notes: 'Formally approved for transparency library release.',
    });
    assert.strictEqual(approvedAdvance.success, true);
    assert.strictEqual(approvedAdvance.data?.status, 'APPROVED_PUBLIC');
    assert.strictEqual(approvedAdvance.data?.isPublic, true);

    // 5. Verify Admin Query includes private audit data
    const adminDoc = await getPublicDocumentById('doc-test-governance-flow', true);
    assert.ok(adminDoc);
    assert.strictEqual(adminDoc.adminNotes, 'Private Admin Note: Document scanned under resolution #4.');
    assert.strictEqual(adminDoc.reviewedByTreasurerName, 'Treasurer Bahadur');
    assert.strictEqual(adminDoc.approvedByPresidentName, 'President Sharma');

    // 6. Verify Public Query sanitizes all private data
    const pubDoc = await getPublicDocumentById('doc-test-governance-flow', false);
    assert.ok(pubDoc);
    assert.strictEqual(pubDoc.id, 'doc-test-governance-flow');
    assert.strictEqual(pubDoc.titleNe, 'प्रमाणित दर्ता प्रमाणपत्र');
    assert.strictEqual(pubDoc.filePath, '/documents/cdo-registration-certificate-redacted.jpeg');
    assert.strictEqual(pubDoc.status, 'APPROVED_PUBLIC');

    // STRICT SANITIZATION ASSERTIONS:
    assert.strictEqual(pubDoc.adminNotes, undefined, 'adminNotes must be stripped from public API');
    assert.strictEqual(pubDoc.reviewedByTreasurerName, undefined, 'reviewedByTreasurerName must be stripped');
    assert.strictEqual(pubDoc.reviewedByTreasurerAt, undefined, 'reviewedByTreasurerAt must be stripped');
    assert.strictEqual(pubDoc.approvedByPresidentName, undefined, 'approvedByPresidentName must be stripped');
    assert.strictEqual(pubDoc.approvedByPresidentAt, undefined, 'approvedByPresidentAt must be stripped');
    assert.strictEqual(pubDoc.internalReviewNotes, undefined, 'internalReviewNotes must be stripped');
    assert.strictEqual(pubDoc.createdAt, undefined, 'createdAt must be stripped');
    assert.strictEqual(pubDoc.updatedAt, undefined, 'updatedAt must be stripped');

    // 7. Cleanup test document: restore zero-published invariant
    await deletePublicDocument('doc-test-governance-flow');
    publicList = await getPublicDocuments(undefined, undefined, false);
    assert.strictEqual(publicList.length, 0, 'Zero documents must remain published after test cleanup');
  });
});

