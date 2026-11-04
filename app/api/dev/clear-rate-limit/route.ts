import { NextResponse } from 'next/server';
import { clearRateLimits } from '@/lib/security/rate-limit';

export async function POST() {
  // Clear all in‑memory rate‑limit buckets (development only)
  clearRateLimits();
  return NextResponse.json({ success: true, message: 'Rate limits cleared' });
}

