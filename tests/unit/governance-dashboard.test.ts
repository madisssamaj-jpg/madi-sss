import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getGovernanceDashboardOverview,
  getCommitteeMembers,
  getSocialActivities,
  getPublicDocuments,
  getFinancialTransparencyRecords,
  type GovernanceDashboardOverview,
} from '../../lib/cms/cms-service.ts';

describe('Admin Governance Dashboard Access Control & Privacy Battery', () => {
  it('enforces Strict Superadmin Access Control: unauthenticated or non-superadmin access is rejected', async () => {
    // 1. Invocation without superadmin flag must throw UNAUTHORIZED
    await assert.rejects(
      async () => {
        await getGovernanceDashboardOverview(false);
      },
      (err: Error) => {
        assert.ok(
          err.message.includes('UNAUTHORIZED') || err.message.includes('Superadmin'),
          `Expected UNAUTHORIZED error, got: ${err.message}`
        );
        return true;
      }
    );
  });

  it('provides comprehensive telemetry for authenticated superadmin across all 4 tracks', async () => {
    // 1. Authenticated superadmin invocation succeeds
    const overview = await getGovernanceDashboardOverview(true);
    assert.ok(overview);
    assert.strictEqual(overview.overallReadiness, 'NOT_READY_FOR_PUBLICATION');

    // 2. Track 1: Committee Section
    const com = overview.committee;
    assert.strictEqual(com.sectionKey, 'COMMITTEE');
    assert.strictEqual(com.totalRecords, 6, 'Should track 6 pre-seeded committee members');
    assert.strictEqual(com.draftInternalRecords, 6, 'All 6 members must be in DRAFT');
    assert.strictEqual(com.pendingReviewRecords, 6, 'All 6 members must have photoConsent PENDING');
    assert.strictEqual(com.approvedPublicRecords, 0, 'Zero members approved for public');
    assert.strictEqual(com.publicationReadiness, 'NOT_READY_FOR_PUBLICATION');
    assert.ok(com.missingRequirementsNe.length > 0, 'Must identify missing consent requirements');
    assert.ok(com.evidenceItems.notCollected > 0 || com.evidenceItems.collected > 0);

    // 3. Track 2: Activities Section
    const act = overview.activities;
    assert.strictEqual(act.sectionKey, 'ACTIVITIES');
    assert.strictEqual(act.totalRecords, 0, 'Zero activities after cleanup');
    assert.strictEqual(act.draftInternalRecords, 0);
    assert.strictEqual(act.approvedPublicRecords, 0);
    assert.strictEqual(act.publicationReadiness, 'NOT_READY_FOR_PUBLICATION');
    assert.ok(act.missingRequirementsNe.length > 0, 'Must identify incomplete 5-point checklist');

    // 4. Track 3: Documents Section
    const doc = overview.documents;
    assert.strictEqual(doc.sectionKey, 'DOCUMENTS');
    assert.strictEqual(doc.totalRecords, 5, 'Should track 5 documents');
    assert.strictEqual(doc.draftInternalRecords, 5, 'All 5 documents quarantined in DRAFT/INTERNAL_ONLY');
    assert.strictEqual(doc.approvedPublicRecords, 0, 'Zero documents public');
    assert.strictEqual(doc.publicationReadiness, 'NOT_READY_FOR_PUBLICATION');
    assert.ok(doc.missingRequirementsNe.length > 0, 'Must identify missing signed PDF and approval requirements');

    // 5. Track 4: Financial Section
    const fin = overview.financial;
    assert.strictEqual(fin.sectionKey, 'FINANCIAL');
    assert.strictEqual(fin.totalRecords, 5, 'Should track 5 financial records');
    assert.strictEqual(fin.draftInternalRecords, 5, 'All 5 financial records quarantined in DRAFT/INTERNAL_ONLY');
    assert.strictEqual(fin.approvedPublicRecords, 0, 'Zero financial records public');
    assert.strictEqual(fin.publicationReadiness, 'NOT_READY_FOR_PUBLICATION');
    assert.ok(fin.missingRequirementsNe.length > 0, 'Must identify missing signed audit and reconciliation requirements');
  });

  it('guarantees Zero Public Leakage & Total Quarantine Invariant', async () => {
    // 1. Verify committee public count remains 0
    const publicMembers = await getCommitteeMembers(undefined, false);
    assert.strictEqual(publicMembers.length, 0, 'Zero committee members must be public');

    // 2. Verify activities public count remains 0
    const publicActivities = await getSocialActivities(undefined, false);
    assert.strictEqual(publicActivities.length, 0, 'Zero activities must be public');

    // 3. Verify public documents count remains 0
    const publicDocs = await getPublicDocuments(undefined, undefined, false);
    assert.strictEqual(publicDocs.length, 0, 'Zero documents must be public');

    // 4. Verify public financial records count remains 0
    const publicFin = await getFinancialTransparencyRecords(undefined, undefined, false);
    assert.strictEqual(publicFin.length, 0, 'Zero financial records must be public');
  });
});

