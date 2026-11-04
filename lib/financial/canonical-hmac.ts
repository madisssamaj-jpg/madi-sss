import crypto from 'crypto';

export type FinancialAction = 'POST' | 'REVERSE' | 'DELETE_DRAFT' | 'CANCEL_DRAFT' | 'GET_DETAILS';

export interface CanonicalPayloadInput {
  keyId: string;
  action: FinancialAction;
  transferId: string;
  idempotencyKey: string;
  adminId: string;
  timestamp: number; // Unix epoch seconds
  nonce: string; // 32-char hex string
  auxReason?: string;
}

export interface AttestationResult {
  keyId: string;
  action: FinancialAction;
  transferId: string;
  idempotencyKey: string;
  adminId: string;
  timestamp: number;
  nonce: string;
  auxReason: string;
  canonicalString: string;
  requestHash: string;
  signature: string;
}

/**
 * Normalizes input string to Unicode NFC form.
 */
export function normalizeNfc(input: string | undefined | null): string {
  if (!input) return '';
  return input.normalize('NFC');
}

/**
 * Builds the canonical length-prefixed Netstring variant:
 * "v1,len:keyId,len:action,36:transferId,36:idempotencyKey,36:adminId,len:timestamp,32:nonce,len:auxReason,"
 */
export function buildCanonicalString(input: CanonicalPayloadInput): string {
  const cleanReason = normalizeNfc(input.auxReason);
  const cleanKeyId = normalizeNfc(input.keyId);
  const cleanAction = input.action;
  const lowerTransferId = input.transferId.toLowerCase();
  const lowerIdempotencyKey = input.idempotencyKey.toLowerCase();
  const lowerAdminId = input.adminId.toLowerCase();
  const timestampStr = input.timestamp.toString();
  const lowerNonce = input.nonce.toLowerCase();

  const keyIdLen = Buffer.byteLength(cleanKeyId, 'utf8');
  const actionLen = Buffer.byteLength(cleanAction, 'utf8');
  const transferIdLen = 36;
  const idempotencyKeyLen = 36;
  const adminIdLen = 36;
  const timestampLen = Buffer.byteLength(timestampStr, 'utf8');
  const nonceLen = 32;
  const reasonLen = Buffer.byteLength(cleanReason, 'utf8');

  return (
    `v1,` +
    `${keyIdLen}:${cleanKeyId},` +
    `${actionLen}:${cleanAction},` +
    `${transferIdLen}:${lowerTransferId},` +
    `${idempotencyKeyLen}:${lowerIdempotencyKey},` +
    `${adminIdLen}:${lowerAdminId},` +
    `${timestampLen}:${timestampStr},` +
    `${nonceLen}:${lowerNonce},` +
    `${reasonLen}:${cleanReason},`
  );
}

/**
 * Derives the intermediate SHA-256 request hash from the canonical string.
 */
export function computeRequestHash(canonicalString: string): string {
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Computes the final HMAC-SHA256 signature using the intermediate request hash and the secret.
 */
export function computeSignature(requestHash: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(requestHash, 'utf8').digest('hex');
}

/**
 * Generates a full cryptographic attestation package ready for preflight claim and RPC execution.
 */
export function generateAttestation(
  params: Omit<CanonicalPayloadInput, 'nonce' | 'timestamp'> & {
    secret: string;
    nonce?: string;
    timestamp?: number;
  }
): AttestationResult {
  const nonce = params.nonce || crypto.randomBytes(16).toString('hex');
  const timestamp = params.timestamp !== undefined ? params.timestamp : Math.floor(Date.now() / 1000);
  const auxReason = normalizeNfc(params.auxReason);

  const payloadInput: CanonicalPayloadInput = {
    keyId: params.keyId,
    action: params.action,
    transferId: params.transferId,
    idempotencyKey: params.idempotencyKey,
    adminId: params.adminId,
    timestamp,
    nonce,
    auxReason,
  };

  const canonicalString = buildCanonicalString(payloadInput);
  const requestHash = computeRequestHash(canonicalString);
  const signature = computeSignature(requestHash, params.secret);

  return {
    keyId: payloadInput.keyId,
    action: payloadInput.action,
    transferId: payloadInput.transferId,
    idempotencyKey: payloadInput.idempotencyKey,
    adminId: payloadInput.adminId,
    timestamp: payloadInput.timestamp,
    nonce: payloadInput.nonce,
    auxReason,
    canonicalString,
    requestHash,
    signature,
  };
}

/**
 * Verifies an attestation package against the expected secret.
 */
export function verifyAttestationSignature(
  attestation: {
    keyId: string;
    action: FinancialAction;
    transferId: string;
    idempotencyKey: string;
    adminId: string;
    timestamp: number;
    nonce: string;
    auxReason?: string;
    signature: string;
  },
  secret: string,
  toleranceSeconds = 60
): { valid: boolean; reason?: string } {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - attestation.timestamp) > toleranceSeconds) {
    return { valid: false, reason: 'Timestamp skew exceeded tolerance window.' };
  }

  if (!/^[a-f0-9]{32}$/i.test(attestation.nonce)) {
    return { valid: false, reason: 'Malformed nonce format.' };
  }

  if (!/^[a-f0-9]{64}$/i.test(attestation.signature)) {
    return { valid: false, reason: 'Malformed signature format.' };
  }

  const canonicalString = buildCanonicalString({
    keyId: attestation.keyId,
    action: attestation.action,
    transferId: attestation.transferId,
    idempotencyKey: attestation.idempotencyKey,
    adminId: attestation.adminId,
    timestamp: attestation.timestamp,
    nonce: attestation.nonce,
    auxReason: attestation.auxReason,
  });

  const computedHash = computeRequestHash(canonicalString);
  const expectedSig = computeSignature(computedHash, secret);

  const signatureBuffer = Buffer.from(attestation.signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, reason: 'Cryptographic signature mismatch.' };
  }

  return { valid: true };
}
