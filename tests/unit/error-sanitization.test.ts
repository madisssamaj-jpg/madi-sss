import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeDatabaseError } from '../../lib/financial/transfer-service.ts';
import { checkRateLimit } from '../../lib/security/rate-limit.ts';

describe('Error Sanitization and Security Guard Engine', () => {
  test('sanitizes state machine violation (SQLSTATE 55000) without exposing internal table or code', () => {
    const rawError = {
      code: '55000',
      message: 'State Machine Violation: Cannot post transfer in status POSTED (DRAFT required).',
    };
    const sanitized = sanitizeDatabaseError(rawError);
    assert.equal(sanitized.success, false);
    assert.equal(sanitized.code, 'STATE_MACHINE_ERROR');
    assert.ok(sanitized.error.includes('Invalid operation state'));
    assert.equal((sanitized as any).message, undefined);
  });

  test('sanitizes not found exception (SQLSTATE P0002)', () => {
    const rawError = {
      code: 'P0002',
      message: 'Not Found: Internal transfer 00000000-0000-0000-0000-000000000001 does not exist.',
    };
    const sanitized = sanitizeDatabaseError(rawError);
    assert.equal(sanitized.success, false);
    assert.equal(sanitized.code, 'NOT_FOUND');
    assert.ok(sanitized.error.includes('does not exist'));
  });

  test('sanitizes ledger parity failure without leaking raw balance or calculation details', () => {
    const rawError = {
      code: 'P0001',
      message: 'Ledger Corruption: Account 1111 balance (50000) does not match ledger sum (45000).',
    };
    const sanitized = sanitizeDatabaseError(rawError);
    assert.equal(sanitized.success, false);
    assert.equal(sanitized.code, 'LEDGER_INTEGRITY_ERROR');
    assert.ok(sanitized.error.includes('integrity validation failed'));
    assert.ok(!sanitized.error.includes('45000')); // no raw ledger numbers leaked
  });

  test('sanitizes currency invariant violation', () => {
    const rawError = {
      code: 'P0001',
      message: 'Currency Invariant Violation: Account has invalid currency USD (NPR required).',
    };
    const sanitized = sanitizeDatabaseError(rawError);
    assert.equal(sanitized.success, false);
    assert.equal(sanitized.code, 'INVALID_CURRENCY');
    assert.ok(sanitized.error.includes('NPR'));
  });

  test('enforces rate limiting and token exhaustion', () => {
    const testKey = `test_rate_key_${Date.now()}`;
    const config = { maxTokens: 3, refillRatePerSecond: 0.1 };

    // Consume 3 tokens
    const r1 = checkRateLimit(testKey, config);
    assert.equal(r1.allowed, true);
    const r2 = checkRateLimit(testKey, config);
    assert.equal(r2.allowed, true);
    const r3 = checkRateLimit(testKey, config);
    assert.equal(r3.allowed, true);

    // 4th attempt should be rejected
    const r4 = checkRateLimit(testKey, config);
    assert.equal(r4.allowed, false);
    assert.ok(r4.retryAfterSeconds > 0);
  });
});

