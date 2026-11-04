'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/admin-session';
import { checkRateLimit } from '@/lib/security/rate-limit';
import {
  createDraftTransferSchema,
  reverseTransferSchema,
  cancelDraftSchema,
  deleteDraftSchema,
} from '@/lib/validations/financial';
import {
  createDraftTransfer,
  postInternalTransfer,
  reverseInternalTransfer,
  cancelDraftTransfer,
  deleteDraftTransfer,
  getTransferDetails,
  listInternalTransfers,
  listFinancialAccounts,
  ServiceResult,
} from '@/lib/financial/transfer-service';

export async function createDraftTransferAction(formData: {
  sourceAccountId: string;
  destinationAccountId: string;
  amountNpr: number;
  purposeNe: string;
  purposeEn: string;
  notes?: string;
}): Promise<ServiceResult<any>> {
  try {
    const admin = await requireSuperadmin();

    const rate = checkRateLimit(`financial:create:${admin.id}`, { maxTokens: 10, refillRatePerSecond: 0.2 });
    if (!rate.allowed) {
      return {
        success: false,
        error: `Too many requests. Please wait ${rate.retryAfterSeconds}s before attempting again.`,
        code: 'RATE_LIMITED',
      };
    }

    const validated = createDraftTransferSchema.safeParse(formData);
    if (!validated.success) {
      const firstError = (validated.error as any).issues?.[0]?.message || 'Invalid form input.';
      return { success: false, error: firstError, code: 'VALIDATION_ERROR' };
    }

    const res = await createDraftTransfer({
      ...validated.data,
      adminId: admin.id,
    });

    if (res.success) {
      revalidatePath('/[lang]/admin/transfers', 'page');
    }

    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized or unexpected server error.',
      code: 'AUTH_OR_SYSTEM_ERROR',
    };
  }
}

export async function postTransferAction(transferId: string): Promise<ServiceResult<any>> {
  try {
    const admin = await requireSuperadmin();

    const rate = checkRateLimit(`financial:post:${admin.id}`, { maxTokens: 5, refillRatePerSecond: 0.1 });
    if (!rate.allowed) {
      return {
        success: false,
        error: `Action throttled. Please wait ${rate.retryAfterSeconds}s.`,
        code: 'RATE_LIMITED',
      };
    }

    const res = await postInternalTransfer({
      transferId,
      adminId: admin.id,
    });

    if (res.success) {
      revalidatePath('/[lang]/admin/transfers', 'page');
    }

    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized.',
      code: 'UNAUTHORIZED',
    };
  }
}

export async function reverseTransferAction(transferId: string, reversalReason: string): Promise<ServiceResult<any>> {
  try {
    const admin = await requireSuperadmin();

    const rate = checkRateLimit(`financial:reverse:${admin.id}`, { maxTokens: 5, refillRatePerSecond: 0.1 });
    if (!rate.allowed) {
      return {
        success: false,
        error: `Action throttled. Please wait ${rate.retryAfterSeconds}s.`,
        code: 'RATE_LIMITED',
      };
    }

    const validated = reverseTransferSchema.safeParse({ transferId, reversalReason });
    if (!validated.success) {
      const firstError = (validated.error as any).issues?.[0]?.message || 'Invalid reversal details.';
      return {
        success: false,
        error: firstError,
        code: 'VALIDATION_ERROR',
      };
    }

    const res = await reverseInternalTransfer({
      transferId: validated.data.transferId,
      reversalReason: validated.data.reversalReason,
      adminId: admin.id,
    });

    if (res.success) {
      revalidatePath('/[lang]/admin/transfers', 'page');
    }

    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized.',
      code: 'UNAUTHORIZED',
    };
  }
}

export async function cancelDraftTransferAction(transferId: string, cancellationReason: string): Promise<ServiceResult<any>> {
  try {
    const admin = await requireSuperadmin();

    const validated = cancelDraftSchema.safeParse({ transferId, cancellationReason });
    if (!validated.success) {
      const firstError = (validated.error as any).issues?.[0]?.message || 'Invalid cancellation details.';
      return {
        success: false,
        error: firstError,
        code: 'VALIDATION_ERROR',
      };
    }

    const res = await cancelDraftTransfer({
      transferId: validated.data.transferId,
      cancellationReason: validated.data.cancellationReason,
      adminId: admin.id,
    });

    if (res.success) {
      revalidatePath('/[lang]/admin/transfers', 'page');
    }

    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized.',
      code: 'UNAUTHORIZED',
    };
  }
}

export async function deleteDraftTransferAction(transferId: string): Promise<ServiceResult<any>> {
  try {
    const admin = await requireSuperadmin();

    const validated = deleteDraftSchema.safeParse({ transferId });
    if (!validated.success) {
      const firstError = (validated.error as any).issues?.[0]?.message || 'Invalid transfer ID.';
      return {
        success: false,
        error: firstError,
        code: 'VALIDATION_ERROR',
      };
    }

    const res = await deleteDraftTransfer({
      transferId: validated.data.transferId,
      adminId: admin.id,
    });

    if (res.success) {
      revalidatePath('/[lang]/admin/transfers', 'page');
    }

    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized.',
      code: 'UNAUTHORIZED',
    };
  }
}

export async function getTransferDetailsAction(transferId: string): Promise<ServiceResult<any>> {
  try {
    const admin = await requireSuperadmin();
    return await getTransferDetails(transferId, admin.id);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized.',
      code: 'UNAUTHORIZED',
    };
  }
}

export async function fetchTransfersAction(status?: string): Promise<ServiceResult<any[]>> {
  try {
    await requireSuperadmin();
    return await listInternalTransfers({ status });
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized.',
      code: 'UNAUTHORIZED',
    };
  }
}

export async function fetchFinancialAccountsAction(): Promise<ServiceResult<any[]>> {
  try {
    await requireSuperadmin();
    return await listFinancialAccounts();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unauthorized.',
      code: 'UNAUTHORIZED',
    };
  }
}
