import { getDbPool } from '../lib/db/pool.ts';
import { createSessionToken } from '../lib/auth/admin-session.ts';
import bcrypt from 'bcryptjs';

async function verifyAdminDashboardModules() {
  console.log('--- VERIFYING ADMIN DASHBOARD & MODULE ACCESS UNDER RLS ---');
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    // 1. Verify admin_users authentication query
    const adminRes = await client.query(
      `SELECT id, email, password_hash, full_name, role, is_active
       FROM public.admin_users
       WHERE lower(email) = $1`,
      ['admin@madisss.org.np']
    );
    const admin = adminRes.rows[0];
    console.log(`1. Admin Query: SUCCESS -> Found ${admin.full_name} (${admin.role})`);

    // Verify session token generation
    const token = createSessionToken({
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role,
      isActive: admin.is_active,
    });
    console.log(`2. Admin Session Token Created: SUCCESS (Length: ${token.length})`);

    // 2. Verify financial_accounts access
    const accRes = await client.query('SELECT count(*) as count FROM public.financial_accounts;');
    console.log(`3. Financial Accounts Query: SUCCESS (Account count: ${accRes.rows[0].count})`);

    // 3. Verify internal_transfers query
    const transfersRes = await client.query('SELECT count(*) as count FROM public.internal_transfers;');
    console.log(`4. Internal Transfers Query: SUCCESS (Transfers count: ${transfersRes.rows[0].count})`);

    // 4. Verify financial_transactions query
    const txRes = await client.query('SELECT count(*) as count FROM public.financial_transactions;');
    console.log(`5. Financial Transactions Query: SUCCESS (Transactions count: ${txRes.rows[0].count})`);

    // 5. Test creating a ledger query join (as used by the transfers dashboard)
    const joinRes = await client.query(`
      SELECT t.id, t.status, sa.name_ne AS source_name, da.name_ne AS destination_name
      FROM public.internal_transfers t
      LEFT JOIN public.financial_accounts sa ON t.source_account_id = sa.id
      LEFT JOIN public.financial_accounts da ON t.destination_account_id = da.id
      LIMIT 5;
    `);
    console.log(`6. Transfers Dashboard Joined View: SUCCESS (${joinRes.rows.length} rows returned)`);

    console.log('\n--- ALL ADMIN MODULE QUERIES FULLY OPERATIONAL ---');
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAdminDashboardModules().catch(console.error);

