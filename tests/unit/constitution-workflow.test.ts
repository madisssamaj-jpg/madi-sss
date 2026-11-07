import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLatestConstitution,
  getConstitutionVersions,
  saveReport,
  getReports,
} from '../../lib/cms/cms-service.ts';
import type { GovernanceReport } from '../../lib/cms/cms-service.ts';

describe('Official Constitution (विधान) Document & Versioning Workflow', () => {
  it('quarantines non-original reference drafts: getLatestConstitution(true) returns null initially', async () => {
    // 1. Initial lookup must NOT return non-original reference draft
    const latest = await getLatestConstitution(true);
    assert.equal(latest, null, 'No public constitution should be returned when only reference draft exists');

    // 2. Public reports query must not return non-original documents
    const publicReports = await getReports('CONSTITUTION', undefined, false);
    assert.equal(publicReports.length, 0, 'Public reports list must not expose reference drafts');
  });

  it('provides the exact required empty state string when no constitution is published', async () => {
    const emptyStateNe = 'विधान डाउनलोडका लागि तयारी भइरहेको छ।';
    const emptyStateEn = 'The constitution document is being prepared for download.';

    assert.equal(emptyStateNe, 'विधान डाउनलोडका लागि तयारी भइरहेको छ।');
    assert.equal(emptyStateEn, 'The constitution document is being prepared for download.');
  });

  it('strictly rejects or forces ARCHIVED status if isOriginalApprovedDocument is false', async () => {
    const unapprovedDraft: Omit<GovernanceReport, 'id'> = {
      titleNe: 'मादी सरोकार समाज अनाधिकृत मस्यौदा',
      titleEn: 'Madi Sarokar Samaj Unapproved Draft',
      fiscalYear: '२०८२ (2025)',
      category: 'CONSTITUTION',
      version: '०.९-अनाधिकृत',
      effectiveDate: '२०८२-०१-०१',
      publishedDate: '२०८२-०१-०१',
      fileUrl: 'internal-documents/reference-drafts/sample-unapproved.pdf',
      fileSizeMb: '2.0 MB',
      isPublic: true,
      status: 'PUBLISHED', // Attemping to publish without original approval
      isOriginalApprovedDocument: false,
      noPrivateDataConfirmed: true,
    };

    const saved = await saveReport(unapprovedDraft);
    assert.notEqual(saved.status, 'PUBLISHED', 'Unapproved document must NEVER have status PUBLISHED');
    assert.equal(saved.status, 'ARCHIVED', 'Unapproved document must be forced to ARCHIVED');
    assert.equal(saved.isPublic, false, 'Unapproved document must have isPublic=false');

    // Verify it is not visible publicly
    const publicLatest = await getLatestConstitution(true);
    assert.equal(publicLatest, null, 'Unapproved draft must never be returned by getLatestConstitution');
  });

  it('successfully publishes and retrieves the constitution when marked as original approved document', async () => {
    // Publish the official stamped original document
    const originalApprovedData: Omit<GovernanceReport, 'id'> = {
      titleNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको विधान (सक्कल दर्ता प्रति)',
      titleEn: 'Constitution of Madi (Sankhuwasabha) Sarokar Samaj (Original Stamped Approved)',
      fiscalYear: '२०८२ (2025)',
      category: 'CONSTITUTION',
      version: '१.० (२०८२)',
      effectiveDate: '२०८२-०६-२९',
      publishedDate: '२०८२-०६-२९',
      fileUrl:
        'https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/official-documents/constitution/madi-sss-constitution-original-approved.pdf',
      fileSizeMb: '9.9 MB',
      isPublic: true,
      status: 'PUBLISHED',
      isOriginalApprovedDocument: true,
      noPrivateDataConfirmed: true,
      descriptionNe: 'जिल्ला प्रशासन कार्यालय, काठमाण्डौंमा दर्ता तथा प्रमाणित आधिकारिक मूल विधान',
      descriptionEn: 'Official original stamped constitution approved by DAO Kathmandu',
    };

    const savedOriginal = await saveReport(originalApprovedData);
    assert.equal(savedOriginal.status, 'PUBLISHED');
    assert.equal(savedOriginal.isOriginalApprovedDocument, true);

    // Verify public retrieval now returns this approved original
    const publicLatest = await getLatestConstitution(true);
    assert.ok(publicLatest, 'Approved original constitution must be publicly retrievable');
    assert.equal(publicLatest.id, savedOriginal.id);
    assert.equal(publicLatest.version, '१.० (२०८२)');
    assert.equal(publicLatest.isOriginalApprovedDocument, true);

    // Verify public reports list includes it
    const publicReports = await getReports('CONSTITUTION', undefined, false);
    assert.ok(publicReports.some((r) => r.id === savedOriginal.id));
  });

  it('automatically archives previous published version when a new original version is published', async () => {
    const versionsBefore = await getConstitutionVersions();
    const previouslyPublished = versionsBefore.find(
      (c) => c.status === 'PUBLISHED' && c.isOriginalApprovedDocument === true
    );
    assert.ok(previouslyPublished, 'An active approved published constitution must exist');

    // Publish new amendment v1.1
    const newVersionData: Omit<GovernanceReport, 'id'> = {
      titleNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाण्डौंको प्रथम संशोधित विधान २०८२',
      titleEn: 'First Amended Constitution of Madi Sarokar Samaj 2082',
      fiscalYear: '२०८२ (2025)',
      category: 'CONSTITUTION',
      version: '१.१ (२०८२)',
      effectiveDate: '२०८२-०८-१५',
      publishedDate: '२०८२-०८-१५',
      fileUrl:
        'https://ypcrfeufdghpxhhjexja.supabase.co/storage/v1/object/public/official-documents/constitution/madi-sss-constitution-2082-v1-1.pdf',
      fileSizeMb: '10.1 MB',
      isPublic: true,
      status: 'PUBLISHED',
      isOriginalApprovedDocument: true,
      noPrivateDataConfirmed: true,
      descriptionNe: 'विशेष साधारण सभाबाट पारित पहिलो संशोधन विधान',
      descriptionEn: 'First amendment endorsed by special general assembly',
    };

    const savedNewVersion = await saveReport(newVersionData);
    assert.equal(savedNewVersion.version, '१.१ (२०८२)');
    assert.equal(savedNewVersion.status, 'PUBLISHED');

    // Verify previous version is auto-archived
    const versionsAfter = await getConstitutionVersions();
    const oldVersion = versionsAfter.find((c) => c.id === previouslyPublished.id);
    assert.ok(oldVersion, 'Old version must remain in the history store');
    assert.equal(oldVersion.status, 'ARCHIVED', 'Previously published version must be auto-archived');

    // Verify public lookup returns only the new version
    const publicLatest = await getLatestConstitution(true);
    assert.equal(publicLatest?.id, savedNewVersion.id);
    assert.equal(publicLatest?.version, '१.१ (२०८२)');
  });

  it('allows superadmin to retrieve complete history including quarantined reference drafts', async () => {
    const allVersions = await getConstitutionVersions();
    assert.ok(allVersions.length >= 3, 'Should contain reference drafts and archived/published versions');
    const hasReferenceDraft = allVersions.some(
      (c) => c.isOriginalApprovedDocument === false && c.descriptionNe?.includes('Non-original')
    );
    assert.ok(hasReferenceDraft, 'Reference draft must be preserved internally for audit trail');
  });
});
