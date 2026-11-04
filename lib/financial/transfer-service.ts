import crypto from 'crypto';
import { getDbPool } from '../db/pool.ts';
import {
  generateAttestation,
  normalizeNfc,
} from './canonical-hmac.ts';
import type { FinancialAction } from './canonical-hmac.ts';

export interface TransferServiceError {
  code: string;
  userMessage: string;
  details?: string;
}

export type ServiceResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export interface PostTransferParams {
  transferId: string;
  adminId: string;
  idempotencyKey?: string;
}

export interface ReverseTransferParams {
  transferId: string;
  adminId: string;
  reversalReason: string;
  idempotencyKey?: string;
}

export interface CancelDraftParams {
  transferId: string;
  adminId: string;
  cancellationReason: string;
  idempotencyKey?: string;
}

export interface DeleteDraftParams {
  transferId: string;
  adminId: string;
  idempotencyKey?: string;
}

export interface CreateDraftTransferParams {
  sourceAccountId: string;
  destinationAccountId: string;
  amountNpr: number;
  purposeNe: string;
  purposeEn: string;
  notes?: string;
  adminId: string;
}

function getHmacSecret(): string {
  const secret = process.env.MADI_WORKFLOW_HMAC_SECRET || process.env.SUPABASE_VAULT_HMAC_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: MADI_WORKFLOW_HMAC_SECRET is missing from server environment.');
    }
    return 'madi_internal_transfer_hmac_development_secret_2026';
  }
  return secret;
}

function getKeyId(): string {
  return process.env.MADI_WORKFLOW_KEY_ID || 'key_v1';
}

/**
 * Sanitizes raw PostgreSQL errors into user-friendly messages.
 * Never leaks raw SQLSTATE, table structure, or secret keys to the client.
 */
export function sanitizeDatabaseError(err: any): { success: false; error: string; code: string } {
  const rawMessage = (err?.message || '').toString();
  const rawCode = err?.code || 'UNKNOWN';

  if (rawCode === '55000' || rawMessage.includes('State Machine Violation')) {
    return {
      success: false,
      error: 'Invalid operation state: This transfer cannot be modified in its current state.',
      code: 'STATE_MACHINE_ERROR',
    };
  }

  if (rawCode === 'P0002' || rawMessage.includes('Not Found')) {
    return {
      success: false,
      error: 'The requested transfer record or account does not exist.',
      code: 'NOT_FOUND',
    };
  }

  if (rawMessage.includes('Authentication Failure') || rawMessage.includes('Authorization Failure')) {
    return {
      success: false,
      error: 'Authorization error: Administrative security attestation failed. Only active Superadmins may perform this action.',
      code: 'UNAUTHORIZED',
    };
  }

  if (rawMessage.includes('Ledger Corruption') || rawMessage.includes('Invariant Failure')) {
    return {
      success: false,
      error: 'Financial integrity validation failed. The transaction was automatically aborted to safeguard account balances.',
      code: 'LEDGER_INTEGRITY_ERROR',
    };
  }

  if (rawMessage.includes('Currency Invariant Violation')) {
    return {
      success: false,
      error: 'Currency mismatch: All internal transactions must strictly be in NPR.',
      code: 'INVALID_CURRENCY',
    };
  }

  if (rawMessage.includes('Validation Failure') || rawMessage.includes('inactive or have non-NPR')) {
    return {
      success: false,
      error: 'One or more of the selected accounts are inactive, restricted, or invalid.',
      code: 'INVALID_ACCOUNT',
    };
  }

  if (rawCode === '23505') {
    return {
      success: false,
      error: 'A transfer or ledger entry with these details has already been recorded.',
      code: 'DUPLICATE_ENTRY',
    };
  }

  if (rawCode === '23503') {
    return {
      success: false,
      error: 'Operation rejected: Related financial records prevent this action.',
      code: 'FOREIGN_KEY_RESTRICTION',
    };
  }

  console.error('[Financial Subsystem Error]:', err);
  return {
    success: false,
    error: 'An unexpected system error occurred while processing the financial request. Please try again or contact the administrator.',
    code: 'INTERNAL_ERROR',
  };
}

/**
 * Claims a nonce in a dedicated, auto-committed transaction prior to business execution.
 */
export async function claimNoncePreflight(
  action: FinancialAction,
  transferId: string,
  idempotencyKey: string,
  adminId: string,
  auxReason: string = ''
): Promise<{
  keyId: string;
  timestamp: number;
  nonce: string;
  signature: string;
  requestHash: string;
}> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const keyId = getKeyId();
    const secret = getHmacSecret();
    const attestation = generateAttestation({
      keyId,
      action,
      transferId,
      idempotencyKey,
      adminId,
      auxReason,
      secret,
    });

    await client.query(
      `SELECT public.claim_nonce_preflight($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        attestation.action,
        attestation.transferId,
        attestation.idempotencyKey,
        attestation.adminId,
        attestation.keyId,
        attestation.timestamp,
        attestation.nonce,
        attestation.signature,
        attestation.auxReason,
      ]
    );

    return {
      keyId: attestation.keyId,
      timestamp: attestation.timestamp,
      nonce: attestation.nonce,
      signature: attestation.signature,
      requestHash: attestation.requestHash,
    };
  } finally {
    client.release();
  }
}

/**
 * Posts an approved DRAFT internal transfer.
 */
export async function postInternalTransfer(params: PostTransferParams): Promise<ServiceResult<any>> {
  const pool = getDbPool();
  const idempotencyKey = params.idempotencyKey || crypto.randomUUID();

  try {
    const preflight = await claimNoncePreflight('POST', params.transferId, idempotencyKey, params.adminId, '');

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT public.post_internal_transfer_prisma($1, $2, $3, $4, $5, $6, $7) as result`,
        [
          params.transferId,
          idempotencyKey,
          params.adminId,
          preflight.keyId,
          preflight.timestamp,
          preflight.nonce,
          preflight.signature,
        ]
      );
      return { success: true, data: res.rows[0]?.result };
    } finally {
      client.release();
    }
  } catch (err) {
    return sanitizeDatabaseError(err);
  }
}

/**
 * Reverses an already POSTED internal transfer with mandatory reversal reason.
 */
export async function reverseInternalTransfer(params: ReverseTransferParams): Promise<ServiceResult<any>> {
  const cleanReason = normalizeNfc(params.reversalReason);
  if (!cleanReason.trim()) {
    return {
      success: false,
      error: 'A detailed reversal reason is strictly required by the audit subsystem.',
      code: 'MISSING_REASON',
    };
  }

  const pool = getDbPool();
  const idempotencyKey = params.idempotencyKey || crypto.randomUUID();

  try {
    const preflight = await claimNoncePreflight('REVERSE', params.transferId, idempotencyKey, params.adminId, cleanReason);

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT public.reverse_internal_transfer_prisma($1, $2, $3, $4, $5, $6, $7, $8) as result`,
        [
          params.transferId,
          idempotencyKey,
          cleanReason,
          params.adminId,
          preflight.keyId,
          preflight.timestamp,
          preflight.nonce,
          preflight.signature,
        ]
      );
      return { success: true, data: res.rows[0]?.result };
    } finally {
      client.release();
    }
  } catch (err) {
    return sanitizeDatabaseError(err);
  }
}

/**
 * Cancels a DRAFT transfer with mandatory cancellation reason.
 */
export async function cancelDraftTransfer(params: CancelDraftParams): Promise<ServiceResult<any>> {
  const cleanReason = normalizeNfc(params.cancellationReason);
  if (!cleanReason.trim()) {
    return {
      success: false,
      error: 'A cancellation reason is required.',
      code: 'MISSING_REASON',
    };
  }

  const pool = getDbPool();
  const idempotencyKey = params.idempotencyKey || crypto.randomUUID();

  try {
    const preflight = await claimNoncePreflight('CANCEL_DRAFT', params.transferId, idempotencyKey, params.adminId, cleanReason);

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT public.cancel_draft_internal_transfer_prisma($1, $2, $3, $4, $5, $6, $7, $8) as result`,
        [
          params.transferId,
          idempotencyKey,
          cleanReason,
          params.adminId,
          preflight.keyId,
          preflight.timestamp,
          preflight.nonce,
          preflight.signature,
        ]
      );
      return { success: true, data: res.rows[0]?.result };
    } finally {
      client.release();
    }
  } catch (err) {
    return sanitizeDatabaseError(err);
  }
}

/**
 * Deletes a DRAFT transfer that has no associated financial legs.
 */
export async function deleteDraftTransfer(params: DeleteDraftParams): Promise<ServiceResult<any>> {
  const pool = getDbPool();
  const idempotencyKey = params.idempotencyKey || crypto.randomUUID();

  try {
    const preflight = await claimNoncePreflight('DELETE_DRAFT', params.transferId, idempotencyKey, params.adminId, '');

    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT public.delete_draft_internal_transfer_prisma($1, $2, $3, $4, $5, $6, $7) as result`,
        [
          params.transferId,
          idempotencyKey,
          params.adminId,
          preflight.keyId,
          preflight.timestamp,
          preflight.nonce,
          preflight.signature,
        ]
      );
      return { success: true, data: res.rows[0]?.result };
    } finally {
      client.release();
    }
  } catch (err) {
    return sanitizeDatabaseError(err);
  }
}

/**
 * Fetches transfer details with masked account numbers and leg history.
 */
export async function getTransferDetails(transferId: string, adminId: string): Promise<ServiceResult<any>> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const res = await client.query(
      `SELECT public.get_internal_transfer_details($1, $2) as details`,
      [transferId, adminId]
    );
    return { success: true, data: res.rows[0]?.details };
  } catch (err) {
    return sanitizeDatabaseError(err);
  } finally {
    client.release();
  }
}

/**
 * Creates a new DRAFT internal transfer after strict input validation.
 */
export async function createDraftTransfer(params: CreateDraftTransferParams): Promise<ServiceResult<any>> {
  if (params.sourceAccountId === params.destinationAccountId) {
    return {
      success: false,
      error: 'Source and destination accounts must be distinct.',
      code: 'IDENTICAL_ACCOUNTS',
    };
  }

  if (params.amountNpr <= 0) {
    return {
      success: false,
      error: 'Transfer amount must be strictly greater than zero NPR.',
      code: 'INVALID_AMOUNT',
    };
  }

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const adminCheck = await client.query(
      `SELECT id FROM public.admin_users WHERE id = $1 AND role = 'SUPERADMIN' AND is_active = true`,
      [params.adminId]
    );
    if (adminCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Only active Superadmins are authorized to create internal transfers.',
        code: 'UNAUTHORIZED',
      };
    }

    const insertRes = await client.query(
      `INSERT INTO public.internal_transfers (
         source_account_id, destination_account_id, amount_npr, currency,
         status, purpose_ne, purpose_en, notes, created_by_admin_id
       ) VALUES ($1, $2, $3, 'NPR', 'DRAFT', $4, $5, $6, $7)
       RETURNING id, status, amount_npr, currency, created_at`,
      [
        params.sourceAccountId,
        params.destinationAccountId,
        params.amountNpr,
        normalizeNfc(params.purposeNe),
        normalizeNfc(params.purposeEn),
        params.notes ? normalizeNfc(params.notes) : null,
        params.adminId,
      ]
    );

    const newTransfer = insertRes.rows[0];

    await client.query(
      `INSERT INTO public.audit_logs (action, entity_type, entity_id, actor_id, transaction_id, payload)
       VALUES ('DRAFT_TRANSFER_CREATED', 'InternalTransfer', $1, $2, txid_current(), $3)`,
      [
        newTransfer.id,
        params.adminId,
        JSON.stringify({
          amount_npr: params.amountNpr,
          source_account_id: params.sourceAccountId,
          destination_account_id: params.destinationAccountId,
        }),
      ]
    );

    await client.query('COMMIT');
    return { success: true, data: newTransfer };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return sanitizeDatabaseError(err);
  } finally {
    client.release();
  }
}

/**
 * Lists internal transfers with pagination and optional status filter.
 */
export async function listInternalTransfers(filter?: { status?: string; limit?: number; offset?: number }): Promise<ServiceResult<any[]>> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const limit = filter?.limit || 50;
    const offset = filter?.offset || 0;
    const queryParams: any[] = [limit, offset];
    let whereClause = '';

    if (filter?.status && filter.status !== 'ALL') {
      whereClause = 'WHERE t.status = $3';
      queryParams.push(filter.status);
    }

    const sql = `
      SELECT 
        t.id,
        t.amount_npr,
        t.currency,
        t.status,
        t.purpose_ne,
        t.purpose_en,
        t.voucher_number,
        t.created_at,
        t.posted_at,
        t.reversed_at,
        t.cancelled_at,
        sa.account_code as source_account_code,
        sa.name_ne as source_account_name_ne,
        sa.name_en as source_account_name_en,
        da.account_code as destination_account_code,
        da.name_ne as destination_account_name_ne,
        da.name_en as destination_account_name_en,
        creator.full_name as created_by_name
      FROM public.internal_transfers t
      JOIN public.financial_accounts sa ON t.source_account_id = sa.id
      JOIN public.financial_accounts da ON t.destination_account_id = da.id
      JOIN public.admin_users creator ON t.created_by_admin_id = creator.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const res = await client.query(sql, queryParams);
    return { success: true, data: res.rows };
  } catch (err) {
    return sanitizeDatabaseError(err);
  } finally {
    client.release();
  }
}

/**
 * Lists active financial accounts for transfer selection.
 */
export async function listFinancialAccounts(): Promise<ServiceResult<any[]>> {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const res = await client.query(
      `SELECT id, account_code, name_ne, name_en, account_type, bank_name, account_number_mask, current_balance, currency, is_active
       FROM public.financial_accounts
       WHERE is_active = true
       ORDER BY account_code ASC;`
    );
    return { success: true, data: res.rows };
  } catch (err) {
    return sanitizeDatabaseError(err);
  } finally {
    client.release();
  }
}
