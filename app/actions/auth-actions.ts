// 'use server' directive for Next.js Server Actions
'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers.js';
import { checkRateLimit, refundRateLimit } from '../../lib/security/rate-limit.ts';
import { createSessionToken } from '../../lib/auth/admin-session.ts';
import type { AdminSession } from '../../lib/auth/admin-session.ts';
import { getDbPool, resetDbPool } from '../../lib/db/pool.ts';

/**
 * Admin login action.
 * Handles normal PostgreSQL authentication, rate limiting, and a strict development fallback.
 */
export async function loginAdminAction(formData: FormData | { email?: string; password?: string; get?: (key: string) => any }) {
  const email = (
    formData && typeof (formData as any).get === 'function'
      ? String((formData as FormData).get('email') || '')
      : String((formData as any)?.email || '')
  ).trim().toLowerCase();
  const password = (
    formData && typeof (formData as any).get === 'function'
      ? String((formData as FormData).get('password') || '')
      : String((formData as any)?.password || '')
  );

  // Rate‑limit key – scoped per email
  const rateKey = `admin-login-${email}`;
  const rate = checkRateLimit(rateKey);

  if (!rate.allowed) {
    return {
      success: false,
      error: `सुरक्षाका लागि दर सीमित (Rate‑limited) गरिएको छ। Try again in ${rate.retryAfterSeconds}s`,
    };
  }

  try {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT id, email, password_hash, full_name, role, is_active
         FROM public.admin_users
         WHERE lower(email) = $1`,
        [email]
      );

      const adminRow = result.rows[0];

      // Reject if user not found, password_hash is missing, or password empty
      if (!adminRow || !adminRow.password_hash || !password) {
        return { success: false, error: 'Invalid email or password.' };
      }

      // Verify the submitted password against password_hash (bcrypt)
      const isPasswordValid = await bcrypt.compare(password, adminRow.password_hash);
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password.' };
      }

      if (!adminRow.is_active) {
        return { success: false, error: 'Account is deactivated.' };
      }

      const admin: AdminSession = {
        id: adminRow.id,
        email: adminRow.email,
        fullName: adminRow.full_name,
        role: adminRow.role,
        isActive: adminRow.is_active,
      };

      const token = createSessionToken(admin);
      const cookieStore = await cookies();

      cookieStore.set('madi_admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return { success: true, user: admin };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Admin login database error:', error);
    resetDbPool();
    refundRateLimit(rateKey);

    const isDevelopment =
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_DEV_ADMIN_FALLBACK === 'true';

    const allowedDevEmail = email === (process.env.DEV_ADMIN_EMAIL || 'admin@localhost.com');

    if (isDevelopment && allowedDevEmail) {
      const devAdmin: AdminSession = {
        id: '00000000-0000-0000-0000-000000000001',
        email,
        fullName: 'Development Superadmin',
        role: 'SUPERADMIN',
        isActive: true,
      };

      const token = createSessionToken(devAdmin);
      const cookieStore = await cookies();

      cookieStore.set('madi_admin_session', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
      });

      return { success: true, user: devAdmin };
    }

    return { success: false, error: 'Authentication service temporarily unavailable.' };
  }
}

/**
 * Admin logout action – removes the session cookie.
 */
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete('madi_admin_session');
  return { success: true };
}
