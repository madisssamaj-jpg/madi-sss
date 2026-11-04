import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCommitteeMembers,
  saveCommitteeMember,
  deleteCommitteeMember,
  type CommitteeMember,
} from '../../lib/cms/cms-service.ts';

describe('Committee Member CMS Governance & Privacy Battery', () => {
  it('enforces Quarantine Invariant: all 6 initial members remain in DRAFT status and private', async () => {
    // Admin query sees all members
    const allMembers = await getCommitteeMembers(undefined, true);
    assert.strictEqual(allMembers.length, 6, 'Exactly 6 initial committee members must be present');

    for (const m of allMembers) {
      assert.strictEqual(m.status, 'DRAFT', `Member ${m.id} (${m.nameNe}) must be in DRAFT status`);
      assert.strictEqual(m.isPublic, false, `Member ${m.id} must have isPublic: false`);
      assert.strictEqual(m.photoConsent, 'PENDING', `Member ${m.id} must have photoConsent: PENDING`);
      assert.ok(!m.contactPhone, `Member ${m.id} must not have dummy phone numbers`);
      assert.ok(!m.email, `Member ${m.id} must not have personal emails`);
      assert.ok(!m.photoUrl?.includes('unsplash.com'), `Member ${m.id} must not have Unsplash photo URLs`);
      assert.ok(m.termStartDateNe, `Member ${m.id} must have term start date`);
      assert.ok(m.termEndDateNe, `Member ${m.id} must have term end date`);
      assert.ok(m.adminNotes, `Member ${m.id} must have admin notes detailing verification pending`);
    }

    // Public query strictly returns ZERO members while all are in DRAFT
    const publicMembers = await getCommitteeMembers(undefined, false);
    assert.strictEqual(publicMembers.length, 0, 'Public query must return 0 members when all are in DRAFT');
  });

  it('enforces Photo Consent rule: public query exposes photo ONLY if photoConsent is VERIFIED', async () => {
    // Create a test published member with photoConsent: PENDING
    const testMember = await saveCommitteeMember({
      id: 'com-test-privacy',
      nameNe: 'परीक्षण सदस्य',
      nameEn: 'Test Member',
      designationNe: 'सदस्य',
      designationEn: 'Member',
      category: 'EXECUTIVE',
      departmentNe: 'केन्द्रीय कार्यसमिति',
      departmentEn: 'Central Executive',
      photoUrl: '/media/committee/test_photo.webp',
      displayOrder: 99,
      status: 'PUBLISHED',
      isPublic: true,
      photoConsent: 'PENDING',
      adminNotes: 'Confidential background check passed.',
    });

    // 1. When photoConsent is PENDING: photoUrl must be stripped in public query
    const publicPending = await getCommitteeMembers(undefined, false);
    const foundPending = publicPending.find((m) => m.id === 'com-test-privacy');
    assert.ok(foundPending, 'Published member must appear in public query');
    assert.strictEqual(foundPending.photoUrl, '', 'Photo must be redacted if photoConsent is PENDING');
    assert.strictEqual((foundPending as any).adminNotes, undefined, 'Admin notes must never leak to public query');

    // 2. When photoConsent is DECLINED: photoUrl must also be stripped
    await saveCommitteeMember({
      id: 'com-test-privacy',
      nameNe: 'परीक्षण सदस्य',
      designationNe: 'सदस्य',
      photoConsent: 'DECLINED',
    });
    const publicDeclined = await getCommitteeMembers(undefined, false);
    const foundDeclined = publicDeclined.find((m) => m.id === 'com-test-privacy');
    assert.ok(foundDeclined);
    assert.strictEqual(foundDeclined.photoUrl, '', 'Photo must be redacted if photoConsent is DECLINED');

    // 3. When photoConsent is VERIFIED: photoUrl is safely exposed
    await saveCommitteeMember({
      id: 'com-test-privacy',
      nameNe: 'परीक्षण सदस्य',
      designationNe: 'सदस्य',
      photoConsent: 'VERIFIED',
    });
    const publicVerified = await getCommitteeMembers(undefined, false);
    const foundVerified = publicVerified.find((m) => m.id === 'com-test-privacy');
    assert.ok(foundVerified);
    assert.strictEqual(foundVerified.photoUrl, '/media/committee/test_photo.webp', 'Photo is exposed when consent is VERIFIED');
    assert.strictEqual((foundVerified as any).adminNotes, undefined, 'Admin notes remain strictly private');

    // Clean up test member
    await deleteCommitteeMember('com-test-privacy');
  });

  it('supports admin CMS operations: add, edit, reorder, unpublish, and private notes', async () => {
    // 1. Add new official
    const created = await saveCommitteeMember({
      id: 'com-test-crud',
      nameNe: 'नयाँ सचिव',
      nameEn: 'New Secretary',
      designationNe: 'सचिव',
      designationEn: 'Secretary',
      category: 'EXECUTIVE',
      departmentNe: 'केन्द्रीय कार्यसमिति',
      departmentEn: 'Central Executive',
      photoUrl: '/media/committee/sec.jpg',
      termStartDateNe: '२०८२-०४-२१',
      termEndDateNe: '२०८४-०४-२०',
      bioNe: 'सामुदायिक स्वास्थ्य तथा रक्तदान अभियानमा अनुभव।',
      bioEn: 'Experience in community healthcare and blood donation drives.',
      displayOrder: 10,
      status: 'DRAFT',
      photoConsent: 'PENDING',
      adminNotes: 'Awaiting DAO endorsement.',
    });

    assert.strictEqual(created.id, 'com-test-crud');
    assert.strictEqual(created.status, 'DRAFT');
    assert.strictEqual(created.photoConsent, 'PENDING');
    assert.strictEqual(created.adminNotes, 'Awaiting DAO endorsement.');

    // 2. Edit official and publish
    const updated = await saveCommitteeMember({
      id: 'com-test-crud',
      nameNe: 'नयाँ सचिव (अपडेट)',
      designationNe: 'सचिव',
      displayOrder: 7,
      status: 'PUBLISHED',
      photoConsent: 'VERIFIED',
      adminNotes: 'DAO endorsement complete on 2082/05/10.',
    });

    assert.strictEqual(updated.nameNe, 'नयाँ सचिव (अपडेट)');
    assert.strictEqual(updated.displayOrder, 7);
    assert.strictEqual(updated.status, 'PUBLISHED');
    assert.strictEqual(updated.photoConsent, 'VERIFIED');
    assert.strictEqual(updated.adminNotes, 'DAO endorsement complete on 2082/05/10.');

    // 3. Unpublish official back to DRAFT
    const unpublished = await saveCommitteeMember({
      id: 'com-test-crud',
      nameNe: 'नयाँ सचिव (अपडेट)',
      designationNe: 'सचिव',
      status: 'DRAFT',
    });
    assert.strictEqual(unpublished.status, 'DRAFT');

    // Verify it disappears from public query
    const publicList = await getCommitteeMembers(undefined, false);
    assert.ok(!publicList.some((m) => m.id === 'com-test-crud'), 'Draft member must not appear publicly');

    // Clean up
    await deleteCommitteeMember('com-test-crud');
    const remaining = await getCommitteeMembers(undefined, true);
    assert.ok(!remaining.some((m) => m.id === 'com-test-crud'), 'Deleted member must be removed');
  });
});

