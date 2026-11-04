import { getDbPool } from '../lib/db/pool.ts';
import bcrypt from 'bcryptjs';

async function authenticateDirect(email, password) {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, email, password_hash, full_name, role, is_active
       FROM public.admin_users
       WHERE lower(email) = $1`,
      [email.toLowerCase().trim()]
    );

    const adminRow = result.rows[0];

    if (!adminRow || !adminRow.password_hash || !password) {
      return { success: false, reason: 'MISSING_USER_OR_HASH_OR_PASSWORD' };
    }

    const isValid = await bcrypt.compare(password, adminRow.password_hash);
    if (!isValid) {
      return { success: false, reason: 'INVALID_PASSWORD' };
    }

    if (!adminRow.is_active) {
      return { success: false, reason: 'DEACTIVATED' };
    }

    return {
      success: true,
      user: {
        id: adminRow.id,
        email: adminRow.email,
        fullName: adminRow.full_name,
        role: adminRow.role,
      },
    };
  } finally {
    client.release();
  }
}

async function runTests() {
  console.log('--- STARTING PASSWORD AUTHENTICATION VERIFICATION ---');

  // Test 1: Correct email + Correct password
  const test1 = await authenticateDirect('admin@madisss.org.np', process.env.TEST_PASSWORD || 'MadiSarokar2082#Secure');
  console.log('Test 1 (Correct email + Correct password):', test1.success ? 'PASSED (User authenticated)' : 'FAILED');
  if (test1.success) {
    console.log(`  Authenticated as: ${test1.user.fullName} (${test1.user.email}) [ID: ${test1.user.id}]`);
  }

  // Test 2: Correct email + Wrong password
  const test2 = await authenticateDirect('admin@madisss.org.np', 'IncorrectPassword123');
  console.log('Test 2 (Correct email + Wrong password):', !test2.success && test2.reason === 'INVALID_PASSWORD' ? 'PASSED (Rejected with INVALID_PASSWORD)' : 'FAILED');

  // Test 3: User with NULL password_hash
  const test3 = await authenticateDirect('admin@localhost.com', 'AnyPassword123');
  console.log('Test 3 (Missing password_hash in DB):', !test3.success && test3.reason === 'MISSING_USER_OR_HASH_OR_PASSWORD' ? 'PASSED (Rejected because password_hash is null)' : 'FAILED');

  // Test 4: Non-existent user
  const test4 = await authenticateDirect('nonexistent@madisss.org.np', 'AnyPassword123');
  console.log('Test 4 (Non-existent user):', !test4.success && test4.reason === 'MISSING_USER_OR_HASH_OR_PASSWORD' ? 'PASSED (Rejected)' : 'FAILED');

  // Test 5: Empty password
  const test5 = await authenticateDirect('admin@madisss.org.np', '');
  console.log('Test 5 (Empty password):', !test5.success && test5.reason === 'MISSING_USER_OR_HASH_OR_PASSWORD' ? 'PASSED (Rejected empty password)' : 'FAILED');

  const pool = getDbPool();
  await pool.end();

  console.log('--- VERIFICATION COMPLETE ---');
}

runTests().catch(console.error);

