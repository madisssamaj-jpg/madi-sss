import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  createDraftTransferSchema,
  reverseTransferSchema,
  cancelDraftSchema,
  deleteDraftSchema,
} from '../../lib/validations/financial.ts';

describe('Financial Subsystem Request Validations', () => {
  const validUuid1 = crypto.randomUUID();
  const validUuid2 = crypto.randomUUID();

  test('validates correct draft transfer inputs', () => {
    const res = createDraftTransferSchema.safeParse({
      sourceAccountId: validUuid1,
      destinationAccountId: validUuid2,
      amountNpr: 15000,
      purposeNe: 'आपतकालीन राहत कोष',
      purposeEn: 'Emergency relief allocation',
      notes: 'Approved in 14th meeting',
    });
    assert.equal(res.success, true);
  });

  test('rejects self-transfer when source and destination accounts are identical', () => {
    const res = createDraftTransferSchema.safeParse({
      sourceAccountId: validUuid1,
      destinationAccountId: validUuid1, // identical!
      amountNpr: 5000,
      purposeNe: 'रकमान्तर',
      purposeEn: 'Transfer',
    });
    assert.equal(res.success, false);
    if (!res.success) {
      assert.ok(res.error.issues.some((i) => i.message.includes('distinct')));
    }
  });

  test('rejects negative or zero transfer amount', () => {
    const zeroRes = createDraftTransferSchema.safeParse({
      sourceAccountId: validUuid1,
      destinationAccountId: validUuid2,
      amountNpr: 0,
      purposeNe: 'रकमान्तर',
      purposeEn: 'Transfer',
    });
    assert.equal(zeroRes.success, false);

    const negRes = createDraftTransferSchema.safeParse({
      sourceAccountId: validUuid1,
      destinationAccountId: validUuid2,
      amountNpr: -500,
      purposeNe: 'रकमान्तर',
      purposeEn: 'Transfer',
    });
    assert.equal(negRes.success, false);
  });

  test('enforces minimum reversal reason length for audit compliance', () => {
    const invalidRes = reverseTransferSchema.safeParse({
      transferId: validUuid1,
      reversalReason: 'no', // too short (< 5 chars)
    });
    assert.equal(invalidRes.success, false);

    const validRes = reverseTransferSchema.safeParse({
      transferId: validUuid1,
      reversalReason: 'Correction of bank ledger mismatch',
    });
    assert.equal(validRes.success, true);
  });

  test('enforces cancellation reason for DRAFT cancellation', () => {
    const invalidRes = cancelDraftSchema.safeParse({
      transferId: validUuid1,
      cancellationReason: 'a',
    });
    assert.equal(invalidRes.success, false);

    const validRes = cancelDraftSchema.safeParse({
      transferId: validUuid1,
      cancellationReason: 'Cancelled upon president directive',
    });
    assert.equal(validRes.success, true);
  });
});
