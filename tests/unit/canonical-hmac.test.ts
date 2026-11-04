import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCanonicalString,
  computeRequestHash,
  computeSignature,
  generateAttestation,
  verifyAttestationSignature,
  normalizeNfc,
} from '../../lib/financial/canonical-hmac.ts';

describe('Cryptographic Length-Prefixed Canonical HMAC Attestation Engine', () => {
  const mockSecret = 'test_secret_for_madi_sss_subsystem_2026';

  test('normalizes Unicode characters to standard NFC form', () => {
    // Test with accented character e + combining acute accent vs precomposed é
    const decomposed = 'e\u0301'; // 'e' + acute accent combining mark
    const composed = '\u00e9'; // precomposed 'é'
    assert.notEqual(decomposed, composed);
    assert.equal(normalizeNfc(decomposed), composed);

    // Also verify Nepali string remains stable in NFC
    const nepali = 'मादी';
    assert.equal(normalizeNfc(nepali), nepali);
  });

  test('correctly calculates UTF-8 byte length for multibyte Nepali text', () => {
    const nepaliText = 'मादी राहत कोष';
    const byteLength = Buffer.byteLength(nepaliText, 'utf8');
    assert.equal(byteLength, 35); // 35 bytes in UTF-8
  });

  test('constructs mathematical length-prefixed canonical string with v1, prefix', () => {
    const input = {
      keyId: 'key_v1',
      action: 'POST' as const,
      transferId: '11111111-2222-3333-4444-555555555555',
      idempotencyKey: 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
      adminId: '99999999-8888-7777-6666-555555555555',
      timestamp: 1730000000,
      nonce: 'abcdef0123456789abcdef0123456789',
      auxReason: 'मादी',
    };

    const canonical = buildCanonicalString(input);
    const nepaliLen = Buffer.byteLength('मादी', 'utf8');

    // Expected format: v1,len:keyId,len:action,36:transferId,36:idempotencyKey,36:adminId,len:timestamp,32:nonce,len:auxReason,
    assert.equal(
      canonical,
      `v1,6:key_v1,4:POST,36:11111111-2222-3333-4444-555555555555,36:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee,36:99999999-8888-7777-6666-555555555555,10:1730000000,32:abcdef0123456789abcdef0123456789,${nepaliLen}:मादी,`
    );
  });

  test('lowercases all UUID identifiers and hex nonces deterministically', () => {
    const canonical = buildCanonicalString({
      keyId: 'KEY_V1',
      action: 'REVERSE',
      transferId: 'ABCDEF12-3456-7890-ABCD-EF1234567890',
      idempotencyKey: 'FEDCBA09-8765-4321-FEDC-BA0987654321',
      adminId: '12345678-ABCD-EF01-2345-6789ABCDEF01',
      timestamp: 1700000000,
      nonce: 'ABCDEF0123456789ABCDEF0123456789',
      auxReason: 'Reversal Reason',
    });

    assert.ok(canonical.includes('36:abcdef12-3456-7890-abcd-ef1234567890'));
    assert.ok(canonical.includes('36:fedcba09-8765-4321-fedc-ba0987654321'));
    assert.ok(canonical.includes('36:12345678-abcd-ef01-2345-6789abcdef01'));
    assert.ok(canonical.includes('32:abcdef0123456789abcdef0123456789'));
  });

  test('successfully signs and verifies a valid attestation package', () => {
    const att = generateAttestation({
      keyId: 'key_v1',
      action: 'POST',
      transferId: '00000000-0000-0000-0000-000000000001',
      idempotencyKey: '00000000-0000-0000-0000-000000000002',
      adminId: '00000000-0000-0000-0000-000000000003',
      secret: mockSecret,
      auxReason: '',
    });

    const result = verifyAttestationSignature(att, mockSecret);
    assert.equal(result.valid, true);
  });

  test('rejects signature when payload fields are modified (tampering detection)', () => {
    const att = generateAttestation({
      keyId: 'key_v1',
      action: 'POST',
      transferId: '00000000-0000-0000-0000-000000000001',
      idempotencyKey: '00000000-0000-0000-0000-000000000002',
      adminId: '00000000-0000-0000-0000-000000000003',
      secret: mockSecret,
      auxReason: '',
    });

    // Tamper with transfer ID
    const tampered = {
      ...att,
      transferId: '99999999-9999-9999-9999-999999999999',
    };

    const result = verifyAttestationSignature(tampered, mockSecret);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'Cryptographic signature mismatch.');
  });

  test('rejects signature when incorrect secret key is supplied', () => {
    const att = generateAttestation({
      keyId: 'key_v1',
      action: 'POST',
      transferId: '00000000-0000-0000-0000-000000000001',
      idempotencyKey: '00000000-0000-0000-0000-000000000002',
      adminId: '00000000-0000-0000-0000-000000000003',
      secret: mockSecret,
      auxReason: '',
    });

    const result = verifyAttestationSignature(att, 'wrong_secret_key_attempt');
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'Cryptographic signature mismatch.');
  });

  test('rejects attestation when timestamp is skewed beyond tolerance window', () => {
    const now = Math.floor(Date.now() / 1000);
    const skewedTimestamp = now - 120; // 2 minutes ago (tolerance is 60s)

    const att = generateAttestation({
      keyId: 'key_v1',
      action: 'POST',
      transferId: '00000000-0000-0000-0000-000000000001',
      idempotencyKey: '00000000-0000-0000-0000-000000000002',
      adminId: '00000000-0000-0000-0000-000000000003',
      secret: mockSecret,
      timestamp: skewedTimestamp,
      auxReason: '',
    });

    const result = verifyAttestationSignature(att, mockSecret, 60);
    assert.equal(result.valid, false);
    assert.ok(result.reason?.includes('Timestamp skew'));
  });

  test('rejects malformed nonces not conforming to 32-character hexadecimal format', () => {
    const att = {
      keyId: 'key_v1',
      action: 'POST' as const,
      transferId: '00000000-0000-0000-0000-000000000001',
      idempotencyKey: '00000000-0000-0000-0000-000000000002',
      adminId: '00000000-0000-0000-0000-000000000003',
      timestamp: Math.floor(Date.now() / 1000),
      nonce: 'invalid_nonce_not_hex_or_too_short',
      signature: '0'.repeat(64),
    };

    const result = verifyAttestationSignature(att, mockSecret);
    assert.equal(result.valid, false);
    assert.equal(result.reason, 'Malformed nonce format.');
  });
});
