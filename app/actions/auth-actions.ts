// 'use server' directive for Next.js Server Actions
'use server';

import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers.js';
import { checkRateLimit, refundRateLimit, resetRateLimit } from '../../lib/security/rate-limit.ts';
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

  // Extract client IP safely for scoped rate-limiting (account + IP)
  let clientIp = '127.0.0.1';
  try {
    const reqHeaders = await headers();
    const forwarded = reqHeaders.get('x-forwarded-for');
    clientIp = forwarded ? forwarded.split(',')[0].trim() : (reqHeaders.get('x-real-ip') || '127.0.0.1');
  } catch {
    // Outside request context (e.g. testing)
  }

  // Rate‑limit key – scoped per email and IP to avoid locking out legitimate users if an attacker spams
  const rateKey = `admin-login:${email}:${clientIp}`;
  const rate = checkRateLimit(rateKey, { maxTokens: 5, refillRatePerSecond: 0.1, lockoutDurationSeconds: 900 });

  if (!rate.allowed) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    return {
      success: false,
      error: `धेरै प्रयास भयो, ${minutes > 1 ? `${minutes} मिनेटपछि` : `${rate.retryAfterSeconds} सेकेन्डपछि`} पुनः प्रयास गर्नुहोस्।`,
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
      // Security note: Generic credential error message avoids username/password enumeration hints
      if (!adminRow || !adminRow.password_hash || !password) {
        return { success: false, error: 'इमेल वा पासवर्ड गलत छ।' };
      }

      // Verify the submitted password against password_hash (bcrypt)
      const isPasswordValid = await bcrypt.compare(password, adminRow.password_hash);
      if (!isPasswordValid) {
        return { success: false, error: 'इमेल वा पासवर्ड गलत छ।' };
      }

      if (!adminRow.is_active) {
        return { success: false, error: 'खाता निष्क्रिय गरिएको छ (Account is deactivated)।' };
      }

      // Clear rate-limit counter on successful login
      resetRateLimit(rateKey);

      const admin: AdminSession = {
        id: adminRow.id,
        email: adminRow.email,
        fullName: adminRow.full_name,
        role: adminRow.role,
        isActive: adminRow.is_active,
        pwdResetAt: Date.now(),
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

    return { success: false, error: 'सर्भरसँग जोडिन सकिएन।' };
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
