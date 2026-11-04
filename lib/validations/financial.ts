import { z } from 'zod';

export const createDraftTransferSchema = z
  .object({
    sourceAccountId: z.string().uuid({ message: 'Valid source account is required.' }),
    destinationAccountId: z.string().uuid({ message: 'Valid destination account is required.' }),
    amountNpr: z
      .number({ message: 'Amount must be a valid number.' })
      .positive({ message: 'Transfer amount must be strictly greater than 0 NPR.' })
      .max(100_000_000, { message: 'Transfer amount exceeds maximum allowed limit.' }),
    purposeNe: z
      .string()
      .min(3, { message: 'Nepali purpose description must be at least 3 characters.' })
      .max(255),
    purposeEn: z
      .string()
      .min(3, { message: 'English purpose description must be at least 3 characters.' })
      .max(255),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: 'Source and destination accounts must be distinct.',
    path: ['destinationAccountId'],
  });

export const reverseTransferSchema = z.object({
  transferId: z.string().uuid({ message: 'Valid transfer identifier required.' }),
  reversalReason: z
    .string()
    .min(5, { message: 'Reversal reason must be detailed (at least 5 characters).' })
    .max(500),
});

export const cancelDraftSchema = z.object({
  transferId: z.string().uuid({ message: 'Valid transfer identifier required.' }),
  cancellationReason: z
    .string()
    .min(5, { message: 'Cancellation reason must be at least 5 characters.' })
    .max(500),
});

export const deleteDraftSchema = z.object({
  transferId: z.string().uuid({ message: 'Valid transfer identifier required.' }),
});
