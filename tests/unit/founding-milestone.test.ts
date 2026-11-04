import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getSiteSettings, updateSiteSettings } from '../../lib/cms/cms-service.ts';

describe('Confirmed Founding Milestone & Statutory Registration Verification', () => {
  it('contains the confirmed 2076 establishment as Madi Sarokar Kendra and 2082 formal registration', async () => {
    const settings = await getSiteSettings();

    // 1. Original establishment in Bikram Sambat 2076 as "मादी सरोकार केन्द्र, काठमाडौं"
    assert.strictEqual(settings.originalEstablishmentYear, '२०७६');
    assert.strictEqual(settings.originalOrganizationNameNe, 'मादी सरोकार केन्द्र, काठमाडौं');
    assert.strictEqual(settings.originalOrganizationNameEn, 'Madi Sarokar Kendra, Kathmandu');

    // 2. Renamed to "मादी (संखुवासभा) सरोकार समाज, काठमाडौं"
    assert.strictEqual(settings.currentOrganizationNameNe, 'मादी (संखुवासभा) सरोकार समाज, काठमाडौं');
    assert.strictEqual(settings.currentOrganizationNameEn, 'Madi (Sankhuwasabha) Sarokar Samaj, Kathmandu');
    assert.match(settings.renamingHistoryNe || '', /पूर्व संस्थाको नाम परिवर्तन गरी हालको ‘मादी \(संखुवासभा\) सरोकार समाज, काठमाडौं’ राखिएको/);
    assert.match(settings.renamingHistoryEn || '', /former name was changed to the current name, ‘Madi \(Sankhuwasabha\) Sarokar Samaj, Kathmandu’/);

    // 3. Formally registered with DAO Kathmandu in Bikram Sambat 2082
    assert.strictEqual(settings.formalRegistrationYear, '२०८२');
    assert.match(settings.formalRegistrationDateNe || '', /२०८२\/०४\/२१/);
    assert.match(settings.formalRegistrationDateEn || '', /2082\/04\/21 BS/);
    assert.strictEqual(settings.registrationAuthorityNe, 'जिल्ला प्रशासन कार्यालय, काठमाडौं');
    assert.strictEqual(settings.registrationAuthorityEn, 'District Administration Office, Kathmandu');

    // 4. Invariant: Official confirmation flag is set
    assert.strictEqual(settings.isFoundingYearConfirmed, true);

    // 5. Invariant: Verified community service journey since 2076 BS
    assert.match(settings.communityStartYear || '', /२०७६/);

    // 6. Invariant: Strict separation of 2076 informal inception vs 2082 formal legal registration
    assert.match(settings.communityStartDescriptionNe || '', /वि\.सं\. २०७६ सालमा ‘मादी सरोकार केन्द्र, काठमाडौं’/);
    assert.match(settings.communityStartDescriptionEn || '', /Bikram Sambat 2076 as ‘Madi Sarokar Kendra, Kathmandu’/);
    assert.match(settings.organizationHistoryNe || '', /दर्तापछि संस्थाले सदस्यता, राहत तथा कल्याणकारी कार्यक्रम/);
    assert.match(settings.organizationHistoryEn || '', /Following registration, the organization has continued its membership/);
  });

  it('allows editing confirmed names, dates, and narratives via CMS', async () => {
    const updated = await updateSiteSettings({
      originalOrganizationNameNe: 'मादी सरोकार केन्द्र',
      formalRegistrationDateNe: 'वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS)',
    });
    assert.strictEqual(updated.originalOrganizationNameNe, 'मादी सरोकार केन्द्र');
    assert.strictEqual(updated.formalRegistrationDateNe, 'वि.सं. २०८२ साल साउन २१ गते (२०८२/०४/२१ BS)');

    // Restore to official canonical seed
    await updateSiteSettings({
      originalOrganizationNameNe: 'मादी सरोकार केन्द्र, काठमाडौं',
    });
    const restored = await getSiteSettings();
    assert.strictEqual(restored.originalOrganizationNameNe, 'मादी सरोकार केन्द्र, काठमाडौं');
  });
});
