import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  saveReport,
  getReports,
  getLatestVerifiedCertificate,
  getRegistrationCertificates,
  verifyRegistrationCertificate,
  updateCertificateVisibility,
  getSiteSettings,
} from '../../lib/cms/cms-service.ts';
import type { GovernanceReport } from '../../lib/cms/cms-service.ts';

describe('Official CDO Registration Certificate (दर्ता प्रमाणपत्र) Governance & Privacy', () => {
  it('enforces Internal Only invariant by default (isPublic: false) for registration certificates', async () => {
    const rawCertificateData: Omit<GovernanceReport, 'id'> = {
      titleNe: 'जिल्ला प्रशासन कार्यालय, काठमाडौं दर्ता प्रमाणपत्र',
      titleEn: 'District Administration Office, Kathmandu Registration Certificate',
      fiscalYear: '२०८२ (2025)',
      category: 'REGISTRATION_CERTIFICATE',
      publishedDate: '२०८२-०४-२१',
      fileUrl: 'internal-docs/certificates/cdo-registration-certificate-2082.jpeg',
      redactedFileUrl: '/documents/cdo-registration-certificate-redacted.jpeg',
      fileSizeMb: '0.22 MB',
      isPublic: true, // Even if caller passes true, saveReport must force false for REGISTRATION_CERTIFICATE
      status: 'PUBLISHED',
      issuingAuthorityNe: 'जिल्ला प्रशासन कार्यालय, काठमाडौं',
      issuingAuthorityEn: 'District Administration Office, Kathmandu',
      registrationDateNe: '२०८२/०४/२१',
      registrationNumber: '१६',
      decisionDateNe: '२०८२/०४/२१',
      registeredOrgNameNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
      verificationStatus: 'PENDING',
      publishRegistrationNumber: false,
      publishRedactedCertificate: false,
      noPrivateDataConfirmed: true,
    };

    const saved = await saveReport(rawCertificateData);

    assert.equal(saved.isPublic, false, 'Registration certificate MUST strictly enforce isPublic=false');
    assert.equal(saved.category, 'REGISTRATION_CERTIFICATE');
  });

  it('quarantines unverified certificates: public getReports() excludes PENDING and REJECTED certificates', async () => {
    const unverifiedData: Omit<GovernanceReport, 'id'> = {
      titleNe: 'अपुष्ट दर्ता प्रमाणपत्र मस्यौदा',
      titleEn: 'Unverified Registration Certificate',
      fiscalYear: '२०८२ (2025)',
      category: 'REGISTRATION_CERTIFICATE',
      publishedDate: '२०८२-०१-०१',
      fileUrl: 'internal-docs/certificates/test-unverified.jpeg',
      isPublic: false,
      status: 'DRAFT',
      verificationStatus: 'PENDING',
    };

    const saved = await saveReport(unverifiedData);

    // Public query: includeArchived = false
    const publicList = await getReports('REGISTRATION_CERTIFICATE', undefined, false);
    const found = publicList.find((c) => c.id === saved.id);
    assert.equal(found, undefined, 'Pending unverified certificate must not appear in public reports query');

    // Admin query: includeArchived = true
    const adminList = await getReports('REGISTRATION_CERTIFICATE', undefined, true);
    const adminFound = adminList.find((c) => c.id === saved.id);
    assert.ok(adminFound, 'Admin query must retain internal access to certificate');
  });

  it('masks raw internal fileUrl in public queries, returning redactedFileUrl only if publishRedactedCertificate is true', async () => {
    const certData: Omit<GovernanceReport, 'id'> = {
      titleNe: 'परीक्षण सक्कल दर्ता प्रमाणपत्र',
      titleEn: 'Test Original Certificate',
      fiscalYear: '२०८२ (2025)',
      category: 'REGISTRATION_CERTIFICATE',
      publishedDate: '२०८२-०४-२१',
      fileUrl: 'internal-docs/certificates/raw-secret-scan.jpeg',
      redactedFileUrl: '/documents/cdo-registration-certificate-redacted.jpeg',
      isPublic: false,
      status: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
      publishRegistrationNumber: true,
      publishRedactedCertificate: false, // Public download disabled
      registrationNumber: '१६',
      noPrivateDataConfirmed: true,
    };

    const saved = await saveReport(certData);

    // Public query with publishRedactedCertificate=false
    const publicList = await getReports('REGISTRATION_CERTIFICATE', undefined, false);
    const item = publicList.find((c) => c.id === saved.id);
    assert.ok(item, 'Verified certificate should be present');
    assert.equal(
      item.fileUrl,
      '',
      'Raw internal fileUrl must be stripped to empty string when public download is not authorized'
    );
    assert.notEqual(
      item.fileUrl,
      'internal-docs/certificates/raw-secret-scan.jpeg',
      'Raw internal scan path must never be exposed publicly'
    );

    // Now update certificate to allow public redacted download
    await updateCertificateVisibility(saved.id, { publishRedactedCertificate: true });

    const updatedPublicList = await getReports('REGISTRATION_CERTIFICATE', undefined, false);
    const updatedItem = updatedPublicList.find((c) => c.id === saved.id);
    assert.ok(updatedItem);
    assert.equal(
      updatedItem.fileUrl,
      '/documents/cdo-registration-certificate-redacted.jpeg',
      'When public download is authorized, fileUrl must point exclusively to the redacted version'
    );
  });

  it('verifies certificate and updates site settings DAO registration number', async () => {
    const certData: Omit<GovernanceReport, 'id'> = {
      titleNe: 'सक्कल दर्ता प्रमाणपत्र',
      titleEn: 'Original Registration Certificate',
      fiscalYear: '२०८२ (2025)',
      category: 'REGISTRATION_CERTIFICATE',
      publishedDate: '२०८२-०४-२१',
      fileUrl: 'internal-docs/certificates/cdo-registration-certificate-2082.jpeg',
      isPublic: false,
      status: 'PUBLISHED',
      verificationStatus: 'PENDING',
      registrationNumber: '१६',
      decisionDateNe: '२०८२/०४/२१',
      registrationDateNe: '२०८२/०४/२१',
      issuingAuthorityNe: 'जिल्ला प्रशासन कार्यालय, काठमाडौं',
      registeredOrgNameNe: 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं',
      publishRegistrationNumber: true,
      publishRedactedCertificate: false,
    };

    const saved = await saveReport(certData);

    const verified = await verifyRegistrationCertificate(
      saved.id,
      'VERIFIED',
      'admin-super-001',
      'सुपरएडमिन (Chief Administrator)',
      'जिल्ला प्रशासन कार्यालय बबरमहलबाट दर्ता प्रमाणपत्र प्रमाणीकरण सम्पन्न।'
    );

    assert.ok(verified);
    assert.equal(verified.verificationStatus, 'VERIFIED');
    assert.equal(verified.verifiedByAdminId, 'admin-super-001');
    assert.equal(verified.verifiedByAdminName, 'सुपरएडमिन (Chief Administrator)');
    assert.ok(verified.verifiedAt);
    assert.equal(verified.adminNotes, 'जिल्ला प्रशासन कार्यालय बबरमहलबाट दर्ता प्रमाणपत्र प्रमाणीकरण सम्पन्न।');

    // Verify siteSettings reflect verified registration number
    const settings = await getSiteSettings();
    assert.equal(settings.daoRegistrationNumber, '१६', 'Site settings must reflect verified registration number');
  });

  it('sanitizes registration number when publishRegistrationNumber is toggled off', async () => {
    const cert = await getLatestVerifiedCertificate();
    assert.ok(cert, 'A verified certificate should exist');

    // Toggle registration number off
    await updateCertificateVisibility(cert.id, { publishRegistrationNumber: false });

    const certAfterToggle = await getLatestVerifiedCertificate();
    assert.ok(certAfterToggle);
    assert.equal(
      certAfterToggle.registrationNumber,
      undefined,
      'Registration number must be omitted when publishRegistrationNumber is false'
    );

    // Restore for subsequent use
    await updateCertificateVisibility(cert.id, { publishRegistrationNumber: true });
    const restored = await getLatestVerifiedCertificate();
    assert.equal(restored?.registrationNumber, '१६');
  });

  it('guarantees trust badge accuracy: verified certificate exposes authentic statutory details', async () => {
    const latest = await getLatestVerifiedCertificate();
    assert.ok(latest);
    assert.equal(latest.verificationStatus, 'VERIFIED');
    assert.equal(latest.issuingAuthorityNe, 'जिल्ला प्रशासन कार्यालय, काठमाडौं');
    assert.equal(latest.registrationNumber, '१६');
    assert.equal(latest.decisionDateNe, '२०८२/०४/२१');
    assert.equal(latest.registeredOrgNameNe, 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं');
  });
});
