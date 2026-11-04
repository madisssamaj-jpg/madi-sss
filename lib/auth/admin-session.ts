import { cookies } from 'next/headers.js';
import crypto from 'crypto';
import { getDbPool } from '../db/pool.ts';

export interface AdminSession {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPERADMIN' | 'EDITOR' | 'AUDITOR' | 'COMMUNICATIONS_COORDINATOR';
  isActive: boolean;
}

const SESSION_COOKIE_NAME = 'madi_admin_session';

function getSessionSecret(): string {
  return process.env.MADI_SESSION_SECRET || 'madi_sss_secure_session_secret_key_2026';
}

/**
 * Creates an encrypted session token storing admin user identity.
 */
export function createSessionToken(admin: AdminSession): string {
  const secret = crypto.createHash('sha256').update(getSessionSecret()).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv);

  const payload = JSON.stringify({
    ...admin,
    exp: Date.now() + 1000 * 60 * 60 * 8, // 8 hours session
  });

  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Verifies and decrypts session token.
 */
export function verifySessionToken(token: string): AdminSession | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, tagHex, encryptedHex] = parts;
    const secret = crypto.createHash('sha256').update(getSessionSecret()).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const data = JSON.parse(decrypted);
    if (!data.exp || Date.now() > data.exp) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      isActive: data.isActive,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves the current admin from secure HttpOnly cookie.
 */
export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

/**
 * Ensures the currently authenticated admin has active SUPERADMIN privilege.
 */
export async function requireSuperadmin(): Promise<AdminSession> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error('UNAUTHORIZED: Authentication required.');
  }

  if (admin.role !== 'SUPERADMIN' || !admin.isActive) {
    throw new Error('FORBIDDEN: Active Superadmin privileges strictly required.');
  }

  // Cross-verify against active database state for defense-in-depth
  try {
    const pool = getDbPool();
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT id, role, is_active FROM public.admin_users WHERE id = $1`,
        [admin.id]
      );
      if (res.rows.length === 0 || res.rows[0].role !== 'SUPERADMIN' || !res.rows[0].is_active) {
        throw new Error('FORBIDDEN: Superadmin account is inactive or revoked in database.');
      }
    } finally {
      client.release();
    }
  } catch (dbErr: any) {
    // If database connection is down, fallback to token validation if already verified
    if (dbErr.message.includes('FORBIDDEN')) throw dbErr;
  }

  return admin;
}

